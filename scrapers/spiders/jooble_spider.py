"""
Spider da API oficial do Jooble.
Docs: https://jooblehelpcenter.freshdesk.com/en/support/solutions/articles/60001448238

Cada domínio de país exige a sua própria chave: uma chave de jooble.org só devolve vagas dos
EUA. Para o Brasil, use uma chave do domínio brasileiro e ajuste JOOBLE_BASE_URL se necessário.

Variáveis de ambiente:
  JOOBLE_API_KEY      obrigatória (sem ela o spider avisa e não faz nada)
  JOOBLE_BASE_URL     padrão: https://br.jooble.org/api
  JOOBLE_KEYWORDS     padrão: "remoto"
  JOOBLE_PAGES        nº de páginas (padrão: 2)
Limite do plano gratuito: 100 requisições/dia por chave.

O campo `salary` do Jooble é texto livre ("{min} - {max} {moeda}") sem formato garantido
por país, então o salário não é importado.
"""

import json
import os
from typing import Any, Dict, Iterable

import scrapy

from spiders.common import StartRequestsMixin, looks_remote, strip_html

DEFAULT_BASE_URL = 'https://br.jooble.org/api'


def parse_jobs(payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    for entry in payload.get('jobs', []):
        title = strip_html(entry.get('title', ''))
        snippet = strip_html(entry.get('snippet', ''))
        location = (entry.get('location') or '').strip()
        if not entry.get('id') or not title or not looks_remote(title, snippet, location):
            continue

        yield {
            'source_site': 'jooble',
            'external_id': str(entry['id']),
            'title': title,
            'company': (entry.get('company') or '').strip(),
            'apply_url': entry.get('link') or '',
            'description': snippet,
            'location': location or '100% Remoto - Brasil',
            'tags': [],
            'published_at': entry.get('updated'),
        }


class JoobleSpider(StartRequestsMixin, scrapy.Spider):
    name = 'jooble_jobs'
    allowed_domains = ['jooble.org']

    def __init__(self, base_url=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.base_url = base_url or os.environ.get('JOOBLE_BASE_URL', DEFAULT_BASE_URL)

    def start_requests(self):
        key = os.environ.get('JOOBLE_API_KEY', '')
        if not key:
            self.logger.warning('JOOBLE_API_KEY ausente: fonte ignorada.')
            return
        keywords = os.environ.get('JOOBLE_KEYWORDS', 'remoto')
        pages = int(os.environ.get('JOOBLE_PAGES', '2'))
        for page in range(1, pages + 1):
            yield scrapy.Request(
                f'{self.base_url}/{key}',
                method='POST',
                dont_filter=True,  # URL fixa e própria: mesmo comportamento de start_urls
                headers={'Content-Type': 'application/json'},
                body=json.dumps({'keywords': keywords, 'location': 'Brasil', 'page': page}),
            )

    def parse(self, response):
        yield from parse_jobs(response.json())
