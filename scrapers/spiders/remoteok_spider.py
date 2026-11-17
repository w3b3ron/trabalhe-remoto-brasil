"""
Spider do Remote OK (API JSON pública: https://remoteok.com/api).

Termos de uso da API (primeiro elemento do array): é obrigatório linkar de volta para
a página da vaga no Remote OK (link "follow") e citar a fonte; o logo do Remote OK não
pode ser usado. Por isso:
  - apply_url = url da vaga no Remote OK (não o apply_url externo);
  - logos das empresas não são importados;
  - o frontend exibe "Fonte: Remote OK" nas vagas com source_site = 'remoteok'.
"""

import html
import re
from typing import Any, Dict, Iterable, List

import scrapy

API_URL = 'https://remoteok.com/api'

# Vagas com localização vazia ou nestes termos servem a candidatos no Brasil.
LOCATION_TERMS = (
    'worldwide', 'anywhere', 'global', 'brazil', 'brasil', 'latam',
    'latin america', 'south america', 'americas',
)


def strip_html(text: str, limit: int = 3000) -> str:
    text = re.sub(r'<(br|/p|/li|/div|/h\d)\s*/?>', ' ', text or '', flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    return re.sub(r'\s+', ' ', html.unescape(text)).strip()[:limit]


def is_open_to_brazil(location: str) -> bool:
    location = (location or '').strip().lower()
    return not location or any(term in location for term in LOCATION_TERMS)


def parse_jobs(payload: List[Dict[str, Any]]) -> Iterable[Dict[str, Any]]:
    """Converte o array da API em itens no contrato do pipeline."""
    for entry in payload:
        # O 1º elemento é o aviso legal; qualquer item sem id/position também é ignorado.
        if not isinstance(entry, dict) or not entry.get('id') or not entry.get('position'):
            continue
        if not is_open_to_brazil(entry.get('location', '')):
            continue

        has_salary = bool(entry.get('salary_min') or entry.get('salary_max'))
        yield {
            'source_site': 'remoteok',
            'external_id': str(entry['id']),
            'title': html.unescape(entry['position']),
            'company': html.unescape(entry.get('company') or ''),
            'apply_url': entry.get('url') or '',
            'description': strip_html(entry.get('description', '')),
            'location': (entry.get('location') or '').strip() or '100% Remoto - Global',
            'tags': [str(t) for t in (entry.get('tags') or [])],
            'salary_min': entry.get('salary_min') or None,
            'salary_max': entry.get('salary_max') or None,
            'salary_currency': 'USD' if has_salary else None,
            'published_at': entry.get('date'),
        }


class RemoteOKSpider(scrapy.Spider):
    name = 'remoteok_jobs'
    allowed_domains = ['remoteok.com']
    start_urls = [API_URL]

    def __init__(self, api_url=None, *args, **kwargs):
        # api_url permite apontar para um servidor de teste: scrapy crawl remoteok_jobs -a api_url=...
        super().__init__(*args, **kwargs)
        if api_url:
            self.start_urls = [api_url]

    def parse(self, response):
        yield from parse_jobs(response.json())
