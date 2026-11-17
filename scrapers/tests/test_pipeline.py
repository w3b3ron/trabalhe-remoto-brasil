import json

import pytest
from scrapy.exceptions import DropItem

from pipelines.cleaner import (
    DataCleaningPipeline,
    DeduplicationPipeline,
    SupabasePipeline,
    slugify,
)


class FakeResult:
    def __init__(self, data):
        self.data = data


class FakeTable:
    def __init__(self, db, name):
        self.db, self.name = db, name
        self.payload = self.on_conflict = None

    def upsert(self, payload, on_conflict=None):
        self.payload, self.on_conflict = payload, on_conflict
        return self

    def execute(self):
        if self.db.fail_jobs and self.name == 'jobs':
            raise RuntimeError('boom')
        self.db.calls.append((self.name, self.payload, self.on_conflict))
        if self.name == 'companies':
            return FakeResult([{'id': f"id-{self.payload['slug']}"}])
        return FakeResult([self.payload])


class FakeSupabase:
    def __init__(self, fail_jobs=False):
        self.calls, self.fail_jobs = [], fail_jobs

    def table(self, name):
        return FakeTable(self, name)


class Spider:
    name = 'fake'


def make_item(**overrides):
    item = {
        'source_site': 'remoteok',
        'external_id': '123',
        'title': '  Desenvolvedor   Back-end  ',
        'company': 'Acme  Ltda',
        'apply_url': 'https://example.com/job/123',
        'tags': ['Python', 'python', ' SQL ', ''],
        'contract_type': 'pj',
        'experience_level': 'Sênior',
        'salary_min': '5000',
        'salary_max': 0,
        'salary_currency': 'USD',
    }
    item.update(overrides)
    return item


def clean(**overrides):
    return DataCleaningPipeline().process_item(make_item(**overrides), Spider())


def test_slugify_remove_acentos():
    assert slugify('Engenheiro de Dados — São Paulo!') == 'engenheiro-de-dados-sao-paulo'


def test_limpeza_normaliza_campos():
    item = clean()
    assert item['title'] == 'Desenvolvedor Back-end'
    assert item['company'] == 'Acme Ltda'
    assert item['tags'] == ['Python', 'SQL']
    assert item['contract_type'] == 'PJ'
    assert item['experience_level'] == 'Senior'
    assert item['salary_min'] == 5000.0 and item['salary_max'] is None
    assert item['slug'] == 'desenvolvedor-back-end-remoteok-123'
    assert item['description'] == 'Desenvolvedor Back-end — Acme Ltda'
    assert item['location'] == '100% Remoto'


def test_limpeza_descarta_dominio_invalido_e_sem_salario():
    item = clean(contract_type='estagiario', experience_level='???', salary_min=None)
    assert 'contract_type' not in item and 'experience_level' not in item
    assert 'salary_currency' not in item


@pytest.mark.parametrize('field', ['source_site', 'external_id', 'title', 'company', 'apply_url'])
def test_limpeza_exige_campos_obrigatorios(field):
    with pytest.raises(DropItem):
        clean(**{field: '  '})


def test_limpeza_rejeita_url_invalida():
    with pytest.raises(DropItem):
        clean(apply_url='javascript:alert(1)')


def test_deduplicacao():
    dedup = DeduplicationPipeline()
    dedup.process_item(clean(), Spider())
    with pytest.raises(DropItem):
        dedup.process_item(clean(), Spider())
    dedup.process_item(clean(external_id='456'), Spider())


def test_supabase_upsert_empresa_e_vaga():
    db = FakeSupabase()
    pipe = SupabasePipeline(client=db)
    pipe.process_item(clean(), Spider())
    pipe.process_item(clean(external_id='456'), Spider())

    companies = [c for c in db.calls if c[0] == 'companies']
    jobs = [c for c in db.calls if c[0] == 'jobs']
    assert len(companies) == 1  # empresa em cache: um único upsert
    assert companies[0][2] == 'slug'
    assert len(jobs) == 2 and jobs[0][2] == 'source_site,external_id'

    row = jobs[0][1]
    assert row['company_id'] == 'id-acme-ltda'
    assert 'company' not in row and 'logo_url' not in row  # só colunas da tabela jobs
    assert row['external_id'] == '123' and row['published_at']
    assert pipe.persisted == 2 and pipe.failed == 0


def test_supabase_conta_falhas_sem_derrubar(tmp_path, monkeypatch):
    monkeypatch.setattr('pipelines.cleaner.RESULT_FILE', str(tmp_path / 'r.json'))
    pipe = SupabasePipeline(client=FakeSupabase(fail_jobs=True))
    pipe.process_item(clean(), Spider())
    assert pipe.persisted == 0 and pipe.failed == 1
    pipe.close_spider(Spider())
    result = json.loads((tmp_path / 'r.json').read_text())
    assert result == [{'spider': 'fake', 'persisted': 0, 'failed': 1}]


def test_supabase_exige_credenciais(monkeypatch):
    monkeypatch.delenv('SUPABASE_URL', raising=False)
    monkeypatch.delenv('SUPABASE_SERVICE_KEY', raising=False)
    with pytest.raises(ValueError):
        SupabasePipeline()
