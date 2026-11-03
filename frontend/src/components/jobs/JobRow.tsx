import Link from 'next/link';
import type { Job } from '@/types';
import { experienceLabel, formatPublished, formatSalary } from '@/lib/job-format';

interface JobRowProps {
  job: Job;
}

/**
 * Vaga em formato horizontal (lista). Três linhas:
 *   Empresa - Título (Salário)
 *   Contrato - Senioridade - Modalidade
 *   Publicada em - há 2 dias
 * A linha inteira é um link para a página da vaga. Campos ausentes são omitidos.
 */
export function JobRow({ job }: JobRowProps) {
  const company = job.company?.name ?? 'Empresa não informada';
  const meta = [job.contract_type, experienceLabel(job.experience_level), job.location]
    .filter(Boolean)
    .join(' - ');
  const published = formatPublished(job.published_at);
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  return (
    <Link
      href={`/vaga/${job.slug}`}
      className="group flex min-h-[44px] items-center justify-between gap-4 px-5 py-4 transition hover:bg-neutral-50 focus-visible:relative focus-visible:z-10 dark:hover:bg-white/5"
    >
      <span className="min-w-0 space-y-1">
        <span className="block text-base leading-snug">
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">{company}</span>
          {' - '}
          <span className="font-bold">{job.title}</span>{' '}
          <span className="whitespace-nowrap font-semibold text-[#0A57D8] dark:text-[#7DB2FF]">
            ({salary})
          </span>
        </span>
        {meta && (
          <span className="block text-sm text-neutral-600 dark:text-neutral-300">{meta}</span>
        )}
        {published && (
          <span
            className="block text-sm text-neutral-500 dark:text-neutral-400"
            suppressHydrationWarning
          >
            Publicada em - {published}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 text-lg font-bold text-[#0A57D8] transition group-hover:translate-x-0.5 dark:text-[#7DB2FF]"
      >
        →
      </span>
    </Link>
  );
}
