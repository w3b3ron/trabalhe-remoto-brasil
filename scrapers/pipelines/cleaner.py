"""
Pipelines de limpeza, deduplicação e persistência no Supabase.

Contrato do item emitido pelos spiders (dict):
    obrigatórios: source_site, external_id, title, company, apply_url
    opcionais:    description, location, tags, contract_type, experience_level,
                  salary_min, salary_max, salary_currency, published_at (ISO 8601),
                  logo_url, company_website

Ordem de execução (ver settings.py): limpeza (100) -> deduplicação (200) -> Supabase (300).
"""

import json
import logging
import os
import re
import unicodedata
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from scrapy.exceptions import DropItem

logger = logging.getLogger(__name__)

# Colunas da tabela public.jobs que os scrapers podem preencher.
JOB_COLUMNS = (
    'company_id', 'title', 'slug', 'description', 'location', 'contract_type',
    'experience_level', 'salary_min', 'salary_max', 'salary_currency',
    'apply_url', 'tags', 'source_site', 'external_id', 'published_at',
)

REQUIRED_FIELDS = ('source_site', 'external_id', 'title', 'company', 'apply_url')

CONTRACT_TYPES = {'clt': 'CLT', 'pj': 'PJ', 'freelance': 'Freelance', 'freela': 'Freelance'}
EXPERIENCE_LEVELS = {
    'estagio': 'Estágio', 'estágio': 'Estágio', 'intern': 'Estágio',
    'junior': 'Junior', 'júnior': 'Junior', 'jr': 'Junior',
    'pleno': 'Pleno', 'mid': 'Pleno',
    'senior': 'Senior', 'sênior': 'Senior', 'sr': 'Senior',
    'lead': 'Lead', 'staff': 'Lead',
}

RESULT_FILE = os.environ.get('SCRAPE_RESULT_FILE', 'scrape_result.json')


def slugify(text: str) -> str:
    """Transforma texto em slug ASCII (sem acentos)."""
    ascii_text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', ascii_text.lower()).strip('-')


class DataCleaningPipeline:
    """Valida campos obrigatórios e normaliza os dados antes de persistir."""

    def process_item(self, item: Dict[str, Any], spider=None) -> Dict[str, Any]:
        for field in REQUIRED_FIELDS:
            value = item.get(field)
            if value is None or not str(value).strip():
                raise DropItem(f"Campo obrigatório ausente: {field}")

        item['source_site'] = str(item['source_site']).strip()
        item['external_id'] = str(item['external_id']).strip()
        item['title'] = re.sub(r'\s+', ' ', str(item['title'])).strip()
        item['company'] = re.sub(r'\s+', ' ', str(item['company'])).strip()
        item['apply_url'] = str(item['apply_url']).strip()

        if not item['apply_url'].startswith(('http://', 'https://')):
            raise DropItem(f"apply_url inválida: {item['apply_url']!r}")

        description = re.sub(r'\s+', ' ', str(item.get('description') or '')).strip()
        item['description'] = description or f"{item['title']} — {item['company']}"

        item['location'] = (item.get('location') or '100% Remoto').strip()

        tags = item.get('tags') or []
        if isinstance(tags, str):
            tags = tags.split(',')
        seen, clean_tags = set(), []
        for tag in tags:
            tag = str(tag).strip()
            if tag and tag.lower() not in seen:
                seen.add(tag.lower())
                clean_tags.append(tag)
        item['tags'] = clean_tags[:8]

        # Valores fora do domínio do banco são descartados (o banco assume o default).
        contract = CONTRACT_TYPES.get(str(item.get('contract_type') or '').strip().lower())
        if contract:
            item['contract_type'] = contract
        else:
            item.pop('contract_type', None)
        level = EXPERIENCE_LEVELS.get(str(item.get('experience_level') or '').strip().lower())
        if level:
            item['experience_level'] = level
        else:
            item.pop('experience_level', None)

        for key in ('salary_min', 'salary_max'):
            value = item.get(key)
            try:
                value = float(value) if value not in (None, '') else None
            except (TypeError, ValueError):
                value = None
            if value is not None and value <= 0:
                value = None
            item[key] = value
        if item['salary_min'] is None and item['salary_max'] is None:
            item.pop('salary_currency', None)

        # Slug único: título + fonte + id externo.
        item['slug'] = '-'.join(
            part for part in (slugify(item['title']), slugify(item['source_site']),
                              slugify(item['external_id'])) if part
        )[:250]

        return item


class DeduplicationPipeline:
    """Descarta duplicatas dentro da mesma execução (source_site + external_id)."""

    def __init__(self):
        self.seen: set = set()

    def process_item(self, item: Dict[str, Any], spider=None) -> Dict[str, Any]:
        key = (item['source_site'], item['external_id'])
        if key in self.seen:
            raise DropItem(f"Duplicata: {key}")
        self.seen.add(key)
        return item


class SupabasePipeline:
    """Persiste empresa e vaga no Supabase usando a service key (ignora RLS)."""

    def __init__(self, client=None, crawler=None):
        self.crawler = crawler
        if client is None:
            from supabase import create_client  # import tardio: facilita testes

            url = os.environ.get('SUPABASE_URL', '')
            key = os.environ.get('SUPABASE_SERVICE_KEY', '')
            if not url or not key:
                raise ValueError('SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios')
            client = create_client(url, key)
        self.supabase = client
        self.company_ids: Dict[str, str] = {}
        self.persisted = 0
        self.failed = 0

    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler=crawler)

    def _spider_name(self, spider=None) -> str:
        spider = spider or getattr(self.crawler, 'spider', None)
        return getattr(spider, 'name', 'desconhecido')

    def _company_id(self, item: Dict[str, Any]) -> Optional[str]:
        slug = slugify(item['company'])
        if not slug:
            return None
        if slug in self.company_ids:
            return self.company_ids[slug]

        # Só envia colunas conhecidas: em conflito, o upsert não apaga o que já existe.
        payload = {'name': item['company'], 'slug': slug}
        if item.get('logo_url'):
            payload['logo_url'] = item['logo_url']
        if item.get('company_website'):
            payload['website'] = item['company_website']

        result = self.supabase.table('companies').upsert(payload, on_conflict='slug').execute()
        company_id = result.data[0]['id']
        self.company_ids[slug] = company_id
        return company_id

    def process_item(self, item: Dict[str, Any], spider=None) -> Dict[str, Any]:
        try:
            item['company_id'] = self._company_id(item)
            if not item['company_id']:
                raise DropItem('Empresa sem slug válido')
            item.setdefault('published_at', datetime.now(timezone.utc).isoformat())
            row = {col: item[col] for col in JOB_COLUMNS if item.get(col) is not None}
            self.supabase.table('jobs').upsert(
                row, on_conflict='source_site,external_id'
            ).execute()
            self.persisted += 1
        except DropItem:
            raise
        except Exception as exc:  # noqa: BLE001 - registramos e contamos a falha
            self.failed += 1
            logger.error('Erro ao persistir "%s": %s', item.get('title'), exc)
        return item

    def close_spider(self, spider=None):
        summary = {'spider': self._spider_name(spider), 'persisted': self.persisted, 'failed': self.failed}
        logger.info('Resultado %s: %s', summary['spider'], summary)
        # Acumula o resultado de todos os spiders da execução para o workflow checar.
        results = []
        if os.path.exists(RESULT_FILE):
            try:
                with open(RESULT_FILE, encoding='utf-8') as fh:
                    results = json.load(fh)
            except (OSError, ValueError):
                results = []
        results.append(summary)
        with open(RESULT_FILE, 'w', encoding='utf-8') as fh:
            json.dump(results, fh, ensure_ascii=False)
