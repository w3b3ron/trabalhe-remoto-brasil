import Link from 'next/link';
import Image from 'next/image';
import type { Job } from '@/types';
import { SaveJobButton } from './SaveJobButton';

interface JobCardProps {
  job: Job;
}

const MAX_TAGS = 6;

function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return 'Salário a negociar';
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `a partir de ${fmt(min)}`;
  if (max) return `até ${fmt(max)}`;
  return 'Salário a negociar';
}

/** Data relativa em pt-BR ("hoje", "há 3 dias"...). Retorna null se não houver data válida. */
function formatPublished(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 30) return `há ${days} dias`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  const years = Math.floor(days / 365);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

function websiteHost(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function CompanyLogo({
  name,
  logoUrl,
  size,
  className,
}: {
  name: string;
  logoUrl: string | null | undefined;
  size: number;
  className: string;
}) {
  const box = `relative shrink-0 overflow-hidden ${className}`;
  if (logoUrl) {
    return (
      <div className={`${box} bg-neutral-100 dark:bg-neutral-800`} style={{ width: size, height: size }}>
        <Image src={logoUrl} alt={name} fill sizes={`${size}px`} className="object-contain p-1" />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`${box} flex items-center justify-center bg-neutral-800 font-extrabold text-white dark:bg-neutral-200 dark:text-neutral-900`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </div>
  );
}

/**
 * Card de vaga: sempre exibido completo (sem expandir/recolher).
 * Campos ausentes são omitidos; nunca exibimos placeholders.
 */
export function JobCard({ job }: JobCardProps) {
  const company = job.company;
  const companyName = company?.name ?? 'Empresa não informada';
  const tags = job.tags ?? [];
  const visibleTags = tags.slice(0, MAX_TAGS);
  const hiddenTags = tags.length - visibleTags.length;
  const published = formatPublished(job.published_at);
  const host = websiteHost(company?.website);

  const details = [
    { label: 'Contrato', value: job.contract_type },
    { label: 'Senioridade', value: job.experience_level },
    { label: 'Modalidade', value: job.location },
    { label: 'Publicada em', value: published },
  ].filter((d) => Boolean(d.value));

  return (
    <article className="flex h-full flex-col gap-[18px] rounded-3xl bg-surface-light p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:bg-surface-dark">
      {/* Linha superior: logo, empresa, destaque */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo name={companyName} logoUrl={company?.logo_url} size={48} className="rounded-[14px]" />
          <span className="truncate text-[15px] font-semibold text-neutral-700 dark:text-neutral-300">
            {companyName}
          </span>
        </div>
        {job.is_featured && (
          <span className="shrink-0 rounded-full bg-[#E8F0FE] px-3 py-1.5 text-[13px] font-bold text-[#0A47A9] dark:bg-[#0A57D8]/25 dark:text-[#A9C8FF]">
            Destaque
          </span>
        )}
      </div>

      {/* Título */}
      <h3 className="line-clamp-2 text-[21px] font-bold leading-tight tracking-tight">
        {job.title}
      </h3>

      {/* Chips principais */}
      <div className="flex flex-wrap gap-2">
        {job.contract_type && (
          <span className="rounded-lg bg-[#E8F0FE] px-2.5 py-1.5 text-[13px] font-semibold text-[#0A47A9] dark:bg-[#0A57D8]/25 dark:text-[#A9C8FF]">
            {job.contract_type}
          </span>
        )}
        {job.experience_level && (
          <span className="rounded-lg bg-[#F0F0F3] px-2.5 py-1.5 text-[13px] font-semibold text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
            {job.experience_level}
          </span>
        )}
        {job.location && (
          <span className="rounded-lg bg-[#E3F6EA] px-2.5 py-1.5 text-[13px] font-semibold text-[#0E5A32] dark:bg-emerald-400/15 dark:text-emerald-300">
            {job.location}
          </span>
        )}
      </div>

      {/* Descrição */}
      {job.description && (
        <p className="line-clamp-4 text-[15px] leading-[1.55] text-neutral-600 dark:text-neutral-300">
          {job.description}
        </p>
      )}

      {/* Tecnologias */}
      {visibleTags.length > 0 && (
        <div className="space-y-2 border-t border-neutral-200 pt-[18px] dark:border-white/10">
          <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-500 dark:text-neutral-400">
            Tecnologias
          </h4>
          <ul className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-[#F0F0F3] px-3 py-1.5 text-[13px] font-semibold text-neutral-800 dark:bg-white/10 dark:text-neutral-200"
              >
                {tag}
              </li>
            ))}
            {hiddenTags > 0 && (
              <li className="rounded-full bg-[#F0F0F3] px-3 py-1.5 text-[13px] font-semibold text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
                +{hiddenTags}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Detalhes */}
      {details.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
          {details.map((d) => (
            <div key={d.label} className="min-w-0">
              <dt className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{d.label}</dt>
              <dd className="text-[15px] font-semibold" suppressHydrationWarning>
                {d.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Sobre a empresa (só quando há dado real) */}
      {host && (
        <div className="flex items-center gap-3 rounded-2xl bg-[#F5F5F7] p-3.5 dark:bg-white/5">
          <CompanyLogo name={companyName} logoUrl={company?.logo_url} size={40} className="rounded-xl" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Sobre a {companyName}</p>
            <a
              href={company?.website ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-[13px] text-neutral-500 underline-offset-2 hover:underline dark:text-neutral-400"
            >
              {host} ↗
            </a>
          </div>
        </div>
      )}

      {/* Rodapé: salário e ações */}
      <div className="mt-auto space-y-3 border-t border-neutral-200 pt-4 dark:border-white/10">
        <p className="text-[17px] font-extrabold tracking-tight">
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </p>
        <div className="flex items-center gap-2">
          <SaveJobButton jobId={job.id} jobTitle={job.title} />
          <Link
            href={`/vaga/${job.slug}`}
            className="tap-target inline-flex items-center rounded-full bg-[#0A57D8] px-6 text-[15px] font-bold text-white transition hover:bg-[#0848B0]"
          >
            Ver vaga →
          </Link>
        </div>
      </div>
    </article>
  );
}
