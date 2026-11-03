'use client';

import { useState } from 'react';
import { JobFilters } from './JobFilters';
import { JobCard } from './JobCard';
import { JobRow } from './JobRow';
import type { JobFilters as JobFiltersType, Job } from '@/types';

interface JobFiltersWrapperProps {
  initialJobs: Job[];
}

// Home: 3 vagas em destaque (cards) + 7 vagas em linhas horizontais.
const FEATURED_CARDS = 3;
const LIST_ROWS = 7;

export function JobFiltersWrapper({ initialJobs }: JobFiltersWrapperProps) {
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);
  const [showAll, setShowAll] = useState(false);

  const hasActiveFilters = Boolean(
    filters.query || filters.contract_type || filters.experience_level
  );

  // Cards: vagas em destaque primeiro (da mais recente para a mais antiga); se houver
  // menos de 3, completa com as mais recentes. As demais vão para a lista horizontal.
  const featured = filteredJobs.filter((job) => job.is_featured);
  const others = filteredJobs.filter((job) => !job.is_featured);
  const cardJobs = [...featured, ...others].slice(0, FEATURED_CARDS);
  const cardIds = new Set(cardJobs.map((job) => job.id));
  const restJobs = filteredJobs.filter((job) => !cardIds.has(job.id));

  // Sem filtros, a lista mostra 7 linhas; com filtro (ou "ver todas"), mostra tudo.
  const limited = !hasActiveFilters && !showAll;
  const rowJobs = limited ? restJobs.slice(0, LIST_ROWS) : restJobs;
  const hiddenCount = restJobs.length - rowJobs.length;

  const allCardsFeatured = cardJobs.length > 0 && cardJobs.every((job) => job.is_featured);
  const cardsTitle = hasActiveFilters
    ? 'Resultados da busca'
    : allCardsFeatured
      ? 'Vagas em destaque'
      : 'Vagas mais recentes';

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);

    let filtered = initialJobs;

    if (newFilters.contract_type) {
      filtered = filtered.filter(job => job.contract_type === newFilters.contract_type);
    }
    if (newFilters.experience_level) {
      filtered = filtered.filter(job => job.experience_level === newFilters.experience_level);
    }
    if (newFilters.query) {
      const query = newFilters.query.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredJobs(filtered);
  };

  return (
    <div className="mt-8">
      <JobFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {filteredJobs.length === 0 ? (
        <div className="glass rounded-app-card p-12 text-center">
          <p className="text-lg font-medium">Nenhuma vaga encontrada</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Tente outros termos de busca ou remova os filtros.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          <section aria-labelledby="titulo-destaques">
            <h2
              id="titulo-destaques"
              className="mb-5 text-[28px] font-extrabold tracking-tight"
            >
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
              <h2
                id="titulo-lista"
                className="mb-5 text-[28px] font-extrabold tracking-tight"
              >
                {hasActiveFilters ? 'Mais resultados' : 'Outras vagas'}
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
                    Ver todas as vagas ({filteredJobs.length})
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
