"""
Teste de ponta a ponta: executa `scrapy crawl` de verdade (subprocesso) contra um servidor local
que imita as APIs de vagas e o PostgREST do Supabase.

Protege contra regressões que os testes unitários não pegam, como o Scrapy >= 2.13 deixar de
chamar `start_requests()` (os spiders passariam a não pedir nada, em silêncio).
"""

import json
import os
import subprocess
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import pytest

from tests.test_api_spiders import ADZUNA, JOOBLE
from tests.test_remoteok import PAYLOAD as REMOTEOK

SCRAPERS_DIR = Path(__file__).resolve().parent.parent


class FakeServer:
    def __init__(self):
        self.supabase_calls = []
        self.api_hits = []
        owner = self

        class Handler(BaseHTTPRequestHandler):
            def _send(self, code, body):
                data = json.dumps(body).encode()
                self.send_response(code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def do_GET(self):
                owner.api_hits.append(('GET', self.path))
                if self.path.startswith('/api'):
                    self._send(200, REMOTEOK)
                elif self.path.startswith('/adzuna/'):
                    self._send(200, ADZUNA)
                else:
                    self._send(404, {})

            def do_POST(self):
                length = int(self.headers.get('Content-Length', 0))
                body = json.loads(self.rfile.read(length) or b'{}')
                if self.path.startswith('/jooble/'):
                    owner.api_hits.append(('POST', self.path))
                    self._send(200, JOOBLE)
                elif self.path.startswith('/rest/v1/'):
                    owner.supabase_calls.append((self.path, body))
                    self._send(201, [{'id': 'company-uuid', **body}])
                else:
                    self._send(404, {})

            def log_message(self, *args):
                pass

        self.httpd = HTTPServer(('127.0.0.1', 0), Handler)
        self.url = f'http://127.0.0.1:{self.httpd.server_port}'
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()

    def close(self):
        self.httpd.shutdown()


@pytest.fixture()
def server():
    srv = FakeServer()
    yield srv
    srv.close()


def crawl(server, tmp_path, spider, *args, extra_env=None):
    result_file = tmp_path / 'result.json'
    env = {
        **os.environ,
        'SUPABASE_URL': server.url,
        'SUPABASE_SERVICE_KEY': 'k' * 40,
        'SCRAPE_RESULT_FILE': str(result_file),
        'ADZUNA_PAGES': '1',
        'JOOBLE_PAGES': '1',
        **(extra_env or {}),
    }
    for var in ('ADZUNA_APP_ID', 'ADZUNA_APP_KEY', 'JOOBLE_API_KEY'):
        if var not in (extra_env or {}):
            env.pop(var, None)
    proc = subprocess.run(
        [sys.executable, '-m', 'scrapy', 'crawl', spider, *args],
        cwd=SCRAPERS_DIR, env=env, capture_output=True, text=True, timeout=90,
    )
    assert proc.returncode == 0, proc.stderr[-2000:]
    return json.loads(result_file.read_text()) if result_file.exists() else None


def jobs_upserted(server):
    return [body for path, body in server.supabase_calls if path.startswith('/rest/v1/jobs')]


def test_remoteok_crawl_real(server, tmp_path):
    result = crawl(server, tmp_path, 'remoteok_jobs', '-a', f'api_url={server.url}/api')
    assert result == [{'spider': 'remoteok_jobs', 'persisted': 2, 'failed': 0}]
    assert {j['external_id'] for j in jobs_upserted(server)} == {'1001', '1003'}


def test_adzuna_crawl_real_faz_requisicoes(server, tmp_path):
    result = crawl(
        server, tmp_path, 'adzuna_jobs', '-a', f'base_url={server.url}/adzuna',
        extra_env={'ADZUNA_APP_ID': 'id1', 'ADZUNA_APP_KEY': 'key1'},
    )
    assert server.api_hits and 'app_id=id1' in server.api_hits[0][1]
    assert result == [{'spider': 'adzuna_jobs', 'persisted': 2, 'failed': 0}]
    jobs = jobs_upserted(server)
    assert {j['external_id'] for j in jobs} == {'555', '557'}
    assert all(j['source_site'] == 'adzuna' and j['company_id'] for j in jobs)


def test_jooble_crawl_real_faz_post(server, tmp_path):
    result = crawl(
        server, tmp_path, 'jooble_jobs', '-a', f'base_url={server.url}/jooble',
        extra_env={'JOOBLE_API_KEY': 'abc123'},
    )
    assert server.api_hits == [('POST', '/jooble/abc123')]
    assert result == [{'spider': 'jooble_jobs', 'persisted': 1, 'failed': 0}]


def test_fontes_sem_chave_sao_ignoradas_sem_erro(server, tmp_path):
    for spider in ('adzuna_jobs', 'jooble_jobs'):
        result = crawl(server, tmp_path, spider)
        assert result[-1] == {'spider': spider, 'persisted': 0, 'failed': 0}
    assert server.api_hits == [] and server.supabase_calls == []
