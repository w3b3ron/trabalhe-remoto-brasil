"""
Spider de exemplo para Indeed Brasil.

Utiliza a API pública de busca do Indeed (JSON interno).
Em produção, adicione retries, proxies e rate limiting.
"""

import scrapy
import json


class IndeedJobsSpider(scrapy.Spider):
    name = 'indeed_jobs'
    allowed_domains = ['indeed.com.br']
    start_urls = [
        'https://www.indeed.com.br/vagas'
    ]

    custom_settings = {
        'USER_AGENT': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/120.0.0.0 Safari/537.36'
        ),
        'DOWNLOAD_DELAY': 3,
    }

    def parse(self, response):
        # Indeed carrega resultados via JavaScript.
        # Para scraping robusto, use Playwright + persistência de sessão.
        for card in response.css('.result'):
            yield {
                'title': card.css('.jobTitle::text').get(),
                'company': card.css('.companyName::text').get(),
                'location': card.css('.location::text').get(),
                'url': response.urljoin(card.css('a::attr(href)').get() or ''),
                'tags': [],
                'source_site': 'indeed',
            }