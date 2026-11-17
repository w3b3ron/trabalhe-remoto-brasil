# Configurações do Scrapy para TrabalheRemotoBrasil
# Execute sempre de dentro de scrapers/:  cd scrapers && scrapy crawl <spider>

BOT_NAME = 'trabalheremotobrasil'

SPIDER_MODULES = ['spiders']
NEWSPIDER_MODULE = 'spiders'

ROBOTSTXT_OBEY = True

DOWNLOAD_DELAY = 2
CONCURRENT_REQUESTS = 2
RETRY_TIMES = 2

DEFAULT_REQUEST_HEADERS = {
    'Accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
}
USER_AGENT = 'TrabalheRemotoBrasilBot/1.0 (+https://www.trabalheremotobrasil.com/contato)'

ITEM_PIPELINES = {
    'pipelines.cleaner.DataCleaningPipeline': 100,
    'pipelines.cleaner.DeduplicationPipeline': 200,
    'pipelines.cleaner.SupabasePipeline': 300,
}

REQUEST_FINGERPRINTER_IMPLEMENTATION = '2.7'
TWISTED_REACTOR = 'twisted.internet.asyncioreactor.AsyncioSelectorReactor'
FEED_EXPORT_ENCODING = 'utf-8'
