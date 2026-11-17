import json

from check_result import check


def write(tmp_path, results):
    path = tmp_path / 'r.json'
    path.write_text(json.dumps(results))
    return str(path)


def test_falha_quando_arquivo_nao_existe(tmp_path):
    assert check(str(tmp_path / 'nao-existe.json')) == 1


def test_falha_quando_zero_vagas(tmp_path):
    assert check(write(tmp_path, [{'spider': 'a', 'persisted': 0, 'failed': 0}])) == 1
    assert check(write(tmp_path, [{'spider': 'a', 'persisted': 0, 'failed': 5}])) == 1


def test_sucesso_com_vagas_mesmo_com_falhas_parciais(tmp_path):
    assert check(write(tmp_path, [{'spider': 'a', 'persisted': 3, 'failed': 1}])) == 0


def test_soma_varios_spiders(tmp_path):
    results = [
        {'spider': 'a', 'persisted': 0, 'failed': 0},
        {'spider': 'b', 'persisted': 2, 'failed': 0},
    ]
    assert check(write(tmp_path, results)) == 0
