import Link from 'next/link';
import type { Job } from '@/types';
import {
  companyFacts,
  experienceLabel,
  formatDate,
  formatSalary,
  websiteHost,
} from '@/lib/job-format';
import { CompanyLogo } from './CompanyLogo';
import { SaveJobButton } from './SaveJobButton';
import { ShareButton } from './ShareButton';

interface JobDetailProps {
  job: Job;
  similarJobs: Job[];
}

const CARD = 'rounded-3xl bg-surface-light shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-surface-dark';
const H2 = 'text-[22px] font-bold tracking-tight';
const CHIP_PILL =
  'rounded-full bg-[#F0F0F3] px-3.5 py-2 text-sm font-semibold dark:bg-white/10';

/**
 * Conteúdo da página de detalhe da vaga. Campos ausentes (responsabilidades,
 * benefícios, dados da empresa...) são omitidos, nunca exibidos como placeholder.
 */
export function JobDetail({ job, similarJobs }: JobDetailProps) {
  const company = job.company;
  const companyName = company?.name ?? 'Empresa não informada';
  const level = experienceLabel(job.experience_level);
  const published = formatDate(job.published_at);
  const tags = job.tags ?? [];
  const responsibilities = (job.responsibilities ?? []).filter(Boolean);
  const benefits = (job.benefits ?? []).filter(Boolean);
  const facts = [
    { label: 'Setor', value: company?.sector },
    { label: 'Porte', value: company?.size },
    { label: 'Sede', value: company?.headquarters },
  ].filter((f) => Boolean(f.value));
  const host = websiteHost(company?.website);
  const showCompany = Boolean(company?.about) || facts.length > 0 || Boolean(host);

  const sidebarDetails = [
    { label: 'Contrato', value: job.contract_type },
    { label: 'Senioridade', value: level },
    { label: 'Modalidade', value: job.location },
    { label: 'Publicada em', value: published },
  ].filter((d) => Boolean(d.value));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Você está em"
        className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
      >
        <Link href="/" className="inline-flex min-h-8 items-center font-semibold text-[#0A57D8] hover:underline">
          ← Vagas
        </Link>
        <span aria-hidden="true">/</span>
        <span>{companyName}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-semibold text-neutral-900 dark:text-neutral-100">
          {job.title}
        </span>
      </nav>

      {/* Cabeçalho */}
      <header className={`${CARD} flex flex-wrap items-center gap-6 rounded-[28px] p-6 sm:p-8`}>
        <CompanyLogo
          name={companyName}
          logoUrl={company?.logo_url}
          size={72}
          className="rounded-[20px]"
        />
        <div className="min-w-0 flex-1 basis-[300px] space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-base font-semibold text-neutral-700 dark:text-neutral-300">
              {companyName}
            </span>
            {job.is_featured && (
              <span className="rounded-full bg-[#E8F0FE] px-3 py-1 text-[13px] font-bold text-[#0A47A9] dark:bg-[#0A57D8]/25 dark:text-[#A9C8FF]">
                Destaque
              </span>
            )}
            {published && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Publicada em {published}
              </span>
            )}
          </div>
          <h1 className="text-[clamp(28px,4.5vw,40px)] font-extrabold leading-[1.12] tracking-[-0.03em]">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            {job.contract_type && (
              <span className="rounded-lg bg-[#E8F0FE] px-2.5 py-1.5 text-[13px] font-semibold text-[#0A47A9] dark:bg-[#0A57D8]/25 dark:text-[#A9C8FF]">
                {job.contract_type}
              </span>
            )}
            {level && (
              <span className="rounded-lg bg-[#F0F0F3] px-2.5 py-1.5 text-[13px] font-semibold text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
                {level}
              </span>
            )}
            {job.location && (
              <span className="rounded-lg bg-[#E3F6EA] px-2.5 py-1.5 text-[13px] font-semibold text-[#0E5A32] dark:bg-emerald-400/15 dark:text-emerald-300">
                {job.location}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo + barra lateral */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="min-w-0 space-y-5">
          <section className={`${CARD} space-y-8 p-6 sm:p-8`}>
            <div className="space-y-2.5">
              <h2 className={H2}>Sobre a vaga</h2>
              <p className="whitespace-pre-line text-base leading-[1.65] text-neutral-700 dark:text-neutral-300">
                {job.description}
              </p>
            </div>

            {tags.length > 0 && (
              <div className="space-y-3">
                <h2 className={H2}>Tecnologias e requisitos</h2>
                <ul className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li key={tag} className={CHIP_PILL}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {responsibilities.length > 0 && (
              <div className="space-y-3">
                <h2 className={H2}>Responsabilidades</h2>
                <ul className="list-disc space-y-2 pl-[22px] text-base leading-[1.55] text-neutral-700 dark:text-neutral-300">
                  {responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {benefits.length > 0 && (
              <div className="space-y-3">
                <h2 className={H2}>Benefícios</h2>
                <ul className="flex flex-wrap gap-2">
                  {benefits.map((item) => (
                    <li key={item} className={CHIP_PILL}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {showCompany && (
            <section className={`${CARD} space-y-5 p-6 sm:p-8`}>
              <div className="flex items-center gap-3.5">
                <CompanyLogo
                  name={companyName}
                  logoUrl={company?.logo_url}
                  size={52}
                  className="rounded-2xl"
                />
                <h2 className={H2}>Sobre a {companyName}</h2>
              </div>
              {company?.about && (
                <p className="whitespace-pre-line text-base leading-[1.65] text-neutral-700 dark:text-neutral-300">
                  {company.about}
                </p>
              )}
              {facts.length > 0 && (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {f.label}
                      </dt>
                      <dd className="text-[15px] font-semibold">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {host && (
                <a
                  href={company?.website ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target inline-flex items-center rounded-full border border-neutral-300 px-5 text-[15px] font-semibold transition hover:bg-neutral-50 dark:border-white/20 dark:hover:bg-white/10"
                >
                  Site da empresa ↗
                </a>
              )}
            </section>
          )}
        </div>

        {/* Barra lateral */}
        <aside className={`${CARD} space-y-5 p-6 lg:sticky lg:top-24`}>
          <div className="space-y-1">
            <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-neutral-500 dark:text-neutral-400">
              Faixa salarial
            </p>
            <p className="text-[28px] font-extrabold leading-tight tracking-tight">
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </p>
          </div>

          {sidebarDetails.length > 0 && (
            <dl className="space-y-3 text-[15px]">
              {sidebarDetails.map((d) => (
                <div
                  key={d.label}
                  className="flex justify-between gap-3 border-t border-neutral-200 pt-3 dark:border-white/10"
                >
                  <dt className="text-neutral-500 dark:text-neutral-400">{d.label}</dt>
                  <dd className="text-right font-semibold">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target flex min-h-[52px] items-center justify-center rounded-full bg-[#0A57D8] px-6 text-base font-bold text-white transition hover:bg-[#0848B0]"
          >
            Candidatar-se no site da empresa ↗
          </a>

          <div className="flex gap-2.5">
            <SaveJobButton jobId={job.id} jobTitle={job.title} variant="label" />
            <ShareButton title={job.title} />
          </div>

          <p className="text-[13px] leading-normal text-neutral-500 dark:text-neutral-400">
            Você será redirecionado para a página de carreiras da empresa para concluir a
            candidatura.
          </p>
        </aside>
      </div>

      {/* Vagas semelhantes */}
      {similarJobs.length > 0 && (
        <section aria-labelledby="vagas-semelhantes" className="space-y-4 pt-2">
          <h2 id="vagas-semelhantes" className={H2}>
            Vagas semelhantes
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similarJobs.map((s) => {
              const sName = s.company?.name ?? 'Empresa não informada';
              const meta = [
                sName,
                s.contract_type,
                experienceLabel(s.experience_level),
                formatSalary(s.salary_min, s.salary_max, s.salary_currency),
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <li key={s.id}>
                  <Link
                    href={`/vaga/${s.slug}`}
                    className={`${CARD} flex h-full items-center gap-3.5 p-5 transition hover:shadow-app-card-hover`}
                  >
                    <CompanyLogo
                      name={sName}
                      logoUrl={s.company?.logo_url}
                      size={44}
                      className="rounded-xl"
                    />
                    <span className="min-w-0">
                      <span className="line-clamp-2 block text-base font-bold leading-snug">
                        {s.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-neutral-600 dark:text-neutral-400">
                        {meta}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
