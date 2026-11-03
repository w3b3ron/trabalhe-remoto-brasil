import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  /** Tags mais frequentes nas vagas publicadas (vazio = a linha some). */
  topTags?: string[];
  /** Valor atual da busca (mantém o campo preenchido após pesquisar). */
  initialQuery?: string;
  initialContract?: string;
}

const CONTRACTS = ['CLT', 'PJ', 'Freelance'];

/**
 * Banner da página principal: título, busca, tags em alta e o mascote.
 * Server component: a busca é um formulário GET para "/" (sem JavaScript no cliente).
 */
export function Hero({ topTags = [], initialQuery = '', initialContract = '' }: HeroProps) {
  return (
    <section className="overflow-hidden rounded-3xl bg-[#26292B] text-white">
      <div className="flex flex-col-reverse items-center gap-8 px-4 py-8 sm:px-10 sm:py-10 md:flex-row md:justify-between md:gap-10 lg:px-14">
        {/* Texto + busca */}
        <div className="w-full min-w-0 md:max-w-[620px]">
          <h1 className="text-[clamp(28px,5vw,44px)] font-bold leading-[1.1] tracking-tight">
            Sua próxima vaga 100% Home Office está aqui.
          </h1>
          <p className="mt-3 text-base text-neutral-300 sm:text-lg">
            Vagas remotas para profissionais do Brasil.
          </p>

          <form action="/" method="get" role="search" className="mt-6">
            <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row sm:items-center sm:gap-0 sm:p-1.5">
              <label className="flex min-h-11 flex-1 items-center gap-2 px-2 sm:gap-2.5 sm:px-3">
                <span className="sr-only">Buscar vagas por cargo, habilidade ou empresa</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0A57D8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  name="q"
                  defaultValue={initialQuery}
                  placeholder="Cargo, habilidade, empresa"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-neutral-900 placeholder-neutral-500 outline-none sm:text-base"
                />
              </label>

              <label className="flex min-h-11 items-center border-neutral-200 px-3 sm:border-l">
                <span className="sr-only">Tipo de contrato</span>
                <select
                  name="contract"
                  defaultValue={initialContract}
                  className="w-full cursor-pointer bg-transparent py-2 text-base font-medium text-neutral-800 outline-none sm:w-auto"
                >
                  <option value="">Contrato</option>
                  {CONTRACTS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="tap-target rounded-xl bg-[#0A57D8] px-7 text-base font-bold text-white transition hover:bg-[#0848B0] sm:ml-1"
              >
                Buscar
              </button>
            </div>
          </form>

          {topTags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-neutral-200">Tags em alta</span>
              <ul className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/?q=${encodeURIComponent(tag)}`}
                      className="inline-flex min-h-8 items-center rounded-full bg-white/10 px-3 text-sm font-medium text-neutral-100 transition hover:bg-white/20"
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Mascote */}
        <Image
          src="/brand/mascote.png"
          alt="Mascote do TrabalheRemotoBrasil: um cachorro de fone de ouvido trabalhando no notebook numa cadeira de praia"
          width={512}
          height={512}
          priority
          sizes="(min-width: 1024px) 240px, (min-width: 768px) 200px, 128px"
          className="h-32 w-32 shrink-0 md:h-[200px] md:w-[200px] lg:h-[240px] lg:w-[240px]"
        />
      </div>
    </section>
  );
}
