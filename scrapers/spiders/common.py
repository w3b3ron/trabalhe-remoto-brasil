"""Utilitários compartilhados pelos spiders."""

import html
import re

REMOTE_HINTS = ('remot', 'home office', 'home-office', 'homeoffice', 'anywhere', 'worldwide')


def strip_html(text: str, limit: int = 3000) -> str:
    """Remove tags HTML, decodifica entidades e limita o tamanho."""
    text = re.sub(r'<(br|/p|/li|/div|/h\d)\s*/?>', ' ', text or '', flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    return re.sub(r'\s+', ' ', html.unescape(text)).strip()[:limit]


class StartRequestsMixin:
    """Compatibilidade com o Scrapy >= 2.13.

    A partir da 2.13 o `Spider.start()` padrão só lê `start_urls` e não chama mais
    `start_requests()`. Este mixin faz `start()` delegar para `start_requests()`, que continua
    sendo o método usado pelo Scrapy < 2.13.
    """

    async def start(self):
        for request in self.start_requests():
            yield request


def looks_remote(*texts: str) -> bool:
    """True se algum texto (título, descrição, local) indica trabalho remoto."""
    haystack = ' '.join(t or '' for t in texts).lower()
    return any(hint in haystack for hint in REMOTE_HINTS)
