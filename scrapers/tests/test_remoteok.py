import json

from scrapy.http import TextResponse

from pipelines.cleaner import DataCleaningPipeline
from spiders.remoteok_spider import RemoteOKSpider, is_open_to_brazil, parse_jobs, strip_html

# Payload no formato documentado: 1º elemento = aviso legal, depois as vagas.
PAYLOAD = [
    {'legal': 'Please link back to the URL on Remote OK ...'},
    {
        'id': '1001', 'slug': 'remote-python-dev-acme', 'date': '2026-11-10T12:00:00+00:00',
        'company': 'Acme &amp; Co', 'company_logo': 'https://x/logo.png',
        'position': 'Senior Python Developer', 'tags': ['python', 'django'],
        'description': '<p>Build <b>APIs</b></p><ul><li>Python</li><li>SQL</li></ul>&amp; more',
        'location': '', 'salary_min': 80000, 'salary_max': 120000,
        'url': 'https://remoteok.com/remote-jobs/remote-python-dev-acme-1001',
        'apply_url': 'https://remoteok.com/l/1001',
    },
    {
        'id': '1002', 'date': '2026-11-10T12:00:00+00:00', 'company': 'USOnly Inc',
        'position': 'Support Agent', 'tags': [], 'description': '', 'location': 'United States',
        'salary_min': 0, 'salary_max': 0, 'url': 'https://remoteok.com/remote-jobs/1002',
    },
    {
        'id': '1003', 'company': 'LatamCorp', 'position': 'Designer', 'tags': ['figma'],
        'description': 'x', 'location': 'LATAM', 'salary_min': 0, 'salary_max': 0,
        'url': 'https://remoteok.com/remote-jobs/1003', 'date': '2026-11-11T09:00:00+00:00',
    },
    {'id': '1004', 'position': ''},  # sem título: ignorado
]


def test_filtro_de_localizacao():
    assert is_open_to_brazil('') and is_open_to_brazil('Worldwide') and is_open_to_brazil('LATAM')
    assert not is_open_to_brazil('United States') and not is_open_to_brazil('Europe')


def test_strip_html():
    assert strip_html('<p>Build <b>APIs</b></p><ul><li>A</li><li>B</li></ul>&amp; x') == 'Build APIs A B & x'


def test_parse_jobs_ignora_aviso_legal_localizacao_e_vagas_invalidas():
    jobs = list(parse_jobs(PAYLOAD))
    assert [j['external_id'] for j in jobs] == ['1001', '1003']


def test_parse_jobs_respeita_termos_da_api():
    job = list(parse_jobs(PAYLOAD))[0]
    assert job['apply_url'] == 'https://remoteok.com/remote-jobs/remote-python-dev-acme-1001'
    assert 'logo_url' not in job and 'company_logo' not in job
    assert job['company'] == 'Acme & Co'
    assert job['salary_currency'] == 'USD' and job['salary_min'] == 80000
    assert job['description'] == 'Build APIs Python SQL & more'


def test_spider_parse_com_resposta_http_e_pipeline_de_limpeza():
    response = TextResponse(
        url='https://remoteok.com/api', body=json.dumps(PAYLOAD).encode(), encoding='utf-8'
    )
    items = list(RemoteOKSpider().parse(response))
    assert len(items) == 2

    cleaned = [DataCleaningPipeline().process_item(i, RemoteOKSpider()) for i in items]
    first, second = cleaned
    assert first['slug'] == 'senior-python-developer-remoteok-1001'
    assert first['tags'] == ['python', 'django']
    assert first['location'] == '100% Remoto - Global'
    assert second['salary_min'] is None and 'salary_currency' not in second
