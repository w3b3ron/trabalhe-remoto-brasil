import Link from 'next/link';
import Image from 'next/image';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
}

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

export function JobCard({ job }: JobCardProps) {
  const company = job.company;
  const logoUrl = company?.logo_url ?? '/placeholder-logo.png';

  return (
    <article
      className="tap-target group relative cursor-pointer rounded-app-card bg-surface-light p-5 shadow-app-card transition hover:shadow-app-card-hover dark:bg-surface-dark"
    >
      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <Image
            src={logoUrl}
            alt={company?.name ?? 'Empresa'}
            fill
            sizes="48px"
            className="object-contain p-1"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
            {job.title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {company?.name ?? 'Empresa não informada'}
          </p>
        </div>

        {job.is_featured && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            ⭐ Destaque
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
          {job.contract_type}
        </span>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {job.experience_level}
        </span>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {job.location}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {job.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-accent">
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </span>
        <Link
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="tap-target rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition hover:bg-accent-hover"
        >
          Ver vaga →
        </Link>
      </div>
    </article>
  );
}