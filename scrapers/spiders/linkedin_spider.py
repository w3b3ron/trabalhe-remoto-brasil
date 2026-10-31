"""
Spider de exemplo para o LinkedIn ( vagas remotas Brasil ).

NOTA: O LinkedIn exige autenticação e headers robustos.
Este spider é um template. Em produção, utilize Playwright
com sessão persistida para bypass de Cloudflare.
"""

import scrapy
import json
from typing import Dict, Any


class LinkedInJobsSpider(scrapy.Spider):
    name = 'linkedin_jobs'
    allowed_domains = ['linkedin.com']
    start_urls = [
        'https://www.linkedin.com/jobs/search/?keywords=desenvolvedor&location=Brasil'
    ]

    custom_settings = {
        'USER_AGENT': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/120.0.0.0 Safari/537.36'
        ),
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS': 2,
    }

    def parse(self, response: scrapy.http.Response) -> Dict[str, Any]:
        """Extrai vagas da página de resultados do LinkedIn."""
        for job in response.css('.jobs-search__results-list li'):
            yield {
                'title': job.css('.job-title::text').get(),
                'company': job.css('.company-name::text').get(),
                'location': job.css('.job-result__location::text').get(),
                'url': job.css('a::attr(href)').get(),
                'tags': job.css('.tag::text').getall(),
                'source_site': 'linkedin',
            }

        # Paginação
        next_page = response.css('.pagination__next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)