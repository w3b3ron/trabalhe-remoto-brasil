"""
Pipelines de limpeza, deduplicação e persistência no Supabase.
"""

import os
import re
import logging
from typing import Dict, Any, Optional

from supabase import create_client, Client

logger = logging.getLogger(__name__)


class DeduplicationPipeline:
    """Remove vagas duplicadas baseado no source_site + external_id."""

    def __init__(self):
        self.seen: set = set()

    def process_item(self, item: Dict[str, Any], spider: scrapy.Spider) -> Dict[str, Any]:
        key = (item.get('source_site'), item.get('external_id'))
        if key in self.seen:
            raise scrapy.exceptions.DropException(
                f"Duplicata detectada: {key}"
            )
        self.seen.add(key)
        return item


class DataCleaningPipeline:
    """Normaliza e limpa os dados extraídos antes de persistir."""

    def process_item(self, item: Dict[str, Any], spider: scrapy.Spider) -> Dict[str, Any]:
        # Normaliza títulos: remove espaços extras e capitalização inadequada
        if item.get('title'):
            item['title'] = re.sub(r'\s+', ' ', item['title']).strip()

        # Converte tags para lista se vier como string
        if isinstance(item.get('tags'), str):
            item['tags'] = [t.strip() for t in item['tags'].split(',') if t.strip()]

        # Garante slug único
        if item.get('title') and not item.get('slug'):
            slug_base = re.sub(r'[^a-z0-9]+', '-', item['title'].lower()).strip('-')
            item['slug'] = f"{slug_base}-{item.get('source_site', 'unknown')}"

        return item


class SupabasePipeline:
    """Persiste vagas limpas no Supabase PostgreSQL."""

    def __init__(self):
        url: str = os.environ.get('SUPABASE_URL', '')
        key: str = os.environ.get('SUPABASE_SERVICE_KEY', '')
        if not url or not key:
            raise ValueError("SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios")
        self.supabase: Client = create_client(url, key)

    def process_item(self, item: Dict[str, Any], spider: scrapy.Spider) -> Dict[str, Any]:
        try:
            # Upsert baseado em source_site + external_id
            self.supabase.table('jobs').upsert(item).execute()
            logger.info(f"Vaga persistida: {item.get('title')}")
        except Exception as e:
            logger.error(f"Erro ao persistir vaga {item.get('title')}: {e}")

        return item