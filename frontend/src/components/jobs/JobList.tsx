'use client';

import { useState } from 'react';
import Link from 'next/link';
import { JobCard } from './JobCard';
import { JobRow } from './JobRow';
import type { Job } from '@/types';

interface JobListProps {
  /** Vagas já filtradas por contrato e senioridade no servidor. */
  jobs: Job[];
  /** Busca por texto (?q=): título, empresa, descrição e tags. */
  query?: string;
  /** Há busca, contrato ou senioridade ativos (vindos do banner). */
  hasFilters?: boolean;
}

// Home: 3 vagas em destaque (cards) + 7 vagas em linhas horizontais.
const FEATURED_CARDS = 3;
const LIST_ROWS = 7;

function filterByQuery(jobs: Job[], query?: string): Job[] {
  const q = query?.trim().toLowerCase();
  if (!q) return jobs;
  return jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(q) ||
      (job.company?.name ?? '').toLowerCase().includes(q) ||
      (job.description ?? '').toLowerCase().includes(q) ||
      (job.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
  );
}

export function JobList({ jobs, query, hasFilters = false }: JobListProps) {
  const [showAll, setShowAll] = useState(false);

  const matched = filterByQuery(jobs, query);

  // Cards: vagas em destaque primeiro (da mais recente para a mais antiga); se houver
  // menos de 3, completa com as mais recentes. As demais vão para a lista horizontal.
  const featured = matched.filter((job) => job.is_featured);
  const others = matched.filter((job) => !job.is_featured);
  const cardJobs = [...featured, ...others].slice(0, FEATURED_CARDS);
  const cardIds = new Set(cardJobs.map((job) => job.id));
  const restJobs = matched.filter((job) => !cardIds.has(job.id));

  // Sem filtros, a lista mostra 7 linhas; com filtro (ou "ver todas"), mostra tudo.
  const limited = !hasFilters && !showAll;
  const rowJobs = limited ? restJobs.slice(0, LIST_ROWS) : restJobs;
  const hiddenCount = restJobs.length - rowJobs.length;

  const allCardsFeatured = cardJobs.length > 0 && cardJobs.every((job) => job.is_featured);
  const cardsTitle = hasFilters
    ? 'Resultados da busca'
    : allCardsFeatured
      ? 'Vagas em destaque'
      : 'Vagas mais recentes';

  if (matched.length === 0) {
    return (
      <div className="mt-8 rounded-app-card bg-surface-light p-12 text-center shadow-app-card dark:bg-surface-dark">
        <p className="text-lg font-medium">Nenhuma vaga encontrada</p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Tente outros termos de busca ou remova os filtros.
        </p>
        {hasFilters && (
          <Link
            href="/"
            className="tap-target mt-5 inline-flex items-center rounded-full border border-neutral-300 px-5 text-[15px] font-semibold transition hover:bg-neutral-50 dark:border-white/20 dark:hover:bg-white/10"
          >
            Limpar filtros
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-12">
      <section aria-labelledby="titulo-destaques">
        <h2 id="titulo-destaques" className="mb-5 text-[28px] font-extrabold tracking-tight">
          {cardsTitle}
        </h2>
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cardJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {rowJobs.length > 0 && (
        <section aria-labelledby="titulo-lista">
          <h2 id="titulo-lista" className="mb-5 text-[28px] font-extrabold tracking-tight">
            {hasFilters ? 'Mais resultados' : 'Outras vagas'}
          </h2>
          <ul className="divide-y divide-neutral-200 overflow-hidden rounded-3xl bg-surface-light shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:divide-white/10 dark:bg-surface-dark">
            {rowJobs.map((job) => (
              <li key={job.id}>
                <JobRow job={job} />
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="tap-target rounded-full border border-neutral-300 bg-white px-6 text-[15px] font-semibold transition hover:bg-neutral-50 dark:border-white/20 dark:bg-transparent dark:hover:bg-white/10"
              >
                Ver todas as vagas ({matched.length})
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
