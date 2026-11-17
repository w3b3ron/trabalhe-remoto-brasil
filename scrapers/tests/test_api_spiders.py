import json
from urllib.parse import parse_qs, urlparse

from pipelines.cleaner import DataCleaningPipeline
from spiders.adzuna_spider import AdzunaSpider
from spiders.adzuna_spider import parse_jobs as adzuna_parse
from spiders.common import looks_remote, strip_html
from spiders.jooble_spider import JoobleSpider
from spiders.jooble_spider import parse_jobs as jooble_parse

ADZUNA = {
    'count': 3,
    'results': [
        {
            'id': '555', 'title': 'Analista de <strong>Dados</strong> Remoto',
            'description': 'Atuação 100% <strong>remota</strong> com SQL e Python...',
            'company': {'display_name': 'Empresa X'}, 'location': {'display_name': 'Brasil'},
            'redirect_url': 'https://www.adzuna.com.br/land/ad/555', 'created': '2026-11-12T10:00:00Z',
            'salary_min': 6000, 'salary_max': 9000, 'salary_is_predicted': '0',
            'contract_type': 'permanent', 'category': {'label': 'Vagas de TI', 'tag': 'it-jobs'},
        },
        {   # presencial: descartada
            'id': '556', 'title': 'Vendedor', 'description': 'Atendimento na loja',
            'company': {'display_name': 'Loja'}, 'location': {'display_name': 'São Paulo'},
            'redirect_url': 'https://www.adzuna.com.br/land/ad/556',
        },
        {   # salário previsto pelo Adzuna: não é dado real da vaga
            'id': '557', 'title': 'Designer', 'description': 'home office',
            'company': {'display_name': 'Studio'}, 'location': {'display_name': 'Recife'},
            'redirect_url': 'https://www.adzuna.com.br/land/ad/557', 'created': '2026-11-12T10:00:00Z',
            'salary_min': 4000, 'salary_max': 5000, 'salary_is_predicted': '1',
            'contract_type': 'contract',
        },
    ],
}

JOOBLE = {
    'totalCount': 3,
    'jobs': [
        {
            'id': 987654321, 'title': 'Desenvolvedor Python (remoto)', 'location': 'Brasil',
            'snippet': 'Trabalho <b>remoto</b>, Django e APIs &amp; mais', 'salary': '5000 - 8000 BRL',
            'source': 'site.com', 'type': 'Full-time', 'link': 'https://br.jooble.org/desc/987654321',
            'company': 'Tech Corp', 'updated': '2026-11-13T08:30:00.0000000',
        },
        {   # sem empresa e presencial
            'id': 1, 'title': 'Caixa', 'location': 'Fortaleza', 'snippet': 'Presencial',
            'link': 'https://br.jooble.org/desc/1', 'company': '',
        },
    ],
}


def test_helpers():
    assert looks_remote('Dev', 'trabalho HOME OFFICE') and not looks_remote('Dev', 'presencial', 'SP')
    assert strip_html('<b>a</b> &amp; b') == 'a & b'


def test_adzuna_parse_filtra_remoto_e_ignora_salario_previsto():
    jobs = list(adzuna_parse(ADZUNA))
    assert [j['external_id'] for j in jobs] == ['555', '557']
    first, second = jobs
    assert first['title'] == 'Analista de Dados Remoto'
    assert first['contract_type'] == 'CLT' and first['salary_currency'] == 'BRL'
    assert first['apply_url'].startswith('https://www.adzuna.com.br/')
    assert second['salary_min'] is None and second['salary_currency'] is None
    assert second['contract_type'] == 'PJ'


def test_adzuna_item_passa_pela_limpeza():
    item = DataCleaningPipeline().process_item(next(iter(adzuna_parse(ADZUNA))), AdzunaSpider())
    assert item['slug'] == 'analista-de-dados-remoto-adzuna-555'
    assert item['tags'] == ['Vagas de TI']


def test_adzuna_sem_chaves_nao_faz_requisicoes(monkeypatch):
    monkeypatch.delenv('ADZUNA_APP_ID', raising=False)
    monkeypatch.delenv('ADZUNA_APP_KEY', raising=False)
    assert list(AdzunaSpider().start_requests()) == []


def test_adzuna_monta_requisicoes_get_com_query_string(monkeypatch):
    monkeypatch.setenv('ADZUNA_APP_ID', 'id1')
    monkeypatch.setenv('ADZUNA_APP_KEY', 'key1')
    monkeypatch.setenv('ADZUNA_PAGES', '2')
    requests = list(AdzunaSpider().start_requests())
    assert len(requests) == 2 and all(r.method == 'GET' for r in requests)
    url = urlparse(requests[1].url)
    assert url.path == '/v1/api/jobs/br/search/2'
    query = parse_qs(url.query)
    assert query['app_id'] == ['id1'] and query['what'] == ['remoto']
    assert query['results_per_page'] == ['50']


def test_jooble_parse_filtra_remoto_e_sem_empresa():
    jobs = list(jooble_parse(JOOBLE))
    assert [j['external_id'] for j in jobs] == ['987654321']
    job = jobs[0]
    assert job['description'] == 'Trabalho remoto, Django e APIs & mais'
    assert 'salary_min' not in job
    cleaned = DataCleaningPipeline().process_item(job, JoobleSpider())
    assert cleaned['slug'] == 'desenvolvedor-python-remoto-jooble-987654321'


def test_jooble_sem_chave_nao_faz_requisicoes(monkeypatch):
    monkeypatch.delenv('JOOBLE_API_KEY', raising=False)
    assert list(JoobleSpider().start_requests()) == []


def test_jooble_monta_post_com_chave_no_caminho(monkeypatch):
    monkeypatch.setenv('JOOBLE_API_KEY', 'abc123')
    monkeypatch.setenv('JOOBLE_PAGES', '1')
    (request,) = list(JoobleSpider().start_requests())
    assert request.method == 'POST'
    assert request.url == 'https://br.jooble.org/api/abc123'
    assert json.loads(request.body) == {'keywords': 'remoto', 'location': 'Brasil', 'page': 1}
