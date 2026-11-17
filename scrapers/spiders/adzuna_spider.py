"""
Spider da API oficial do Adzuna (Brasil).
Docs: https://developer.adzuna.com/docs/search

Variáveis de ambiente:
  ADZUNA_APP_ID, ADZUNA_APP_KEY   obrigatórias (sem elas o spider avisa e não faz nada)
  ADZUNA_QUERY                    termo de busca (padrão: "remoto")
  ADZUNA_PAGES                    nº de páginas de 50 resultados (padrão: 2)

A API devolve só um trecho da descrição; o link da vaga (redirect_url) leva ao anúncio.
"""

import os
from typing import Any, Dict, Iterable

import scrapy

from spiders.common import StartRequestsMixin, looks_remote, strip_html

BASE_URL = 'https://api.adzuna.com/v1/api/jobs/br/search'
RESULTS_PER_PAGE = 50

# Adzuna: "permanent" ~ CLT; "contract" ~ PJ.
CONTRACT_MAP = {'permanent': 'CLT', 'contract': 'PJ'}


def parse_jobs(payload: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    for entry in payload.get('results', []):
        title = strip_html(entry.get('title', ''))
        description = strip_html(entry.get('description', ''))
        location = (entry.get('location') or {}).get('display_name', '')
        # A busca textual traz vagas não remotas: só aceitamos as que indicam remoto.
        if not entry.get('id') or not title or not looks_remote(title, description, location):
            continue

        predicted = str(entry.get('salary_is_predicted', '0')) in ('1', 'True', 'true')
        salary_min = None if predicted else entry.get('salary_min')
        salary_max = None if predicted else entry.get('salary_max')

        yield {
            'source_site': 'adzuna',
            'external_id': str(entry['id']),
            'title': title,
            'company': (entry.get('company') or {}).get('display_name', ''),
            'apply_url': entry.get('redirect_url') or '',
            'description': description,
            'location': location or '100% Remoto - Brasil',
            'tags': [(entry.get('category') or {}).get('label', '')],
            'contract_type': CONTRACT_MAP.get(entry.get('contract_type', '')),
            'salary_min': salary_min,
            'salary_max': salary_max,
            'salary_currency': 'BRL' if (salary_min or salary_max) else None,
            'published_at': entry.get('created'),
        }


class AdzunaSpider(StartRequestsMixin, scrapy.Spider):
    name = 'adzuna_jobs'
    allowed_domains = ['api.adzuna.com']

    def __init__(self, base_url=BASE_URL, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.base_url = base_url

    def start_requests(self):
        app_id = os.environ.get('ADZUNA_APP_ID', '')
        app_key = os.environ.get('ADZUNA_APP_KEY', '')
        if not app_id or not app_key:
            self.logger.warning('ADZUNA_APP_ID/ADZUNA_APP_KEY ausentes: fonte ignorada.')
            return
        query = os.environ.get('ADZUNA_QUERY', 'remoto')
        pages = int(os.environ.get('ADZUNA_PAGES', '2'))
        for page in range(1, pages + 1):
            yield scrapy.FormRequest(
                f'{self.base_url}/{page}',
                method='GET',
                dont_filter=True,  # URL fixa e própria: mesmo comportamento de start_urls
                formdata={
                    'app_id': app_id,
                    'app_key': app_key,
                    'results_per_page': str(RESULTS_PER_PAGE),
                    'what': query,
                    'content-type': 'application/json',
                },
            )

    def parse(self, response):
        yield from parse_jobs(response.json())
