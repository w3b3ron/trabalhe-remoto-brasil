"""
Valida o resultado dos spiders (scrape_result.json, gerado pelo SupabasePipeline).

Sai com código != 0 quando o scraping não entregou vagas, para o workflow falhar
(e o GitHub avisar por e-mail) em vez de reportar sucesso falso.

Uso: python check_result.py [caminho/scrape_result.json]
"""

import json
import os
import sys


def check(path: str) -> int:
    if not os.path.exists(path):
        print(f"::error::{path} não encontrado: nenhum spider concluiu a execução.")
        return 1

    with open(path, encoding='utf-8') as fh:
        results = json.load(fh)

    persisted = sum(r.get('persisted', 0) for r in results)
    failed = sum(r.get('failed', 0) for r in results)

    lines = ['| Spider | Persistidas | Falhas |', '|---|---|---|']
    lines += [f"| {r['spider']} | {r['persisted']} | {r['failed']} |" for r in results]
    summary = '\n'.join(lines)
    print(summary)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as fh:
            fh.write('### Resultado do scraping\n\n' + summary + '\n')

    if persisted == 0:
        print(f"::error::Nenhuma vaga persistida ({failed} falhas). Verifique fonte e credenciais.")
        return 1
    if failed:
        print(f"::warning::{failed} vagas falharam ao persistir (de {persisted + failed}).")
    return 0


if __name__ == '__main__':
    sys.exit(check(sys.argv[1] if len(sys.argv) > 1 else 'scrape_result.json'))
