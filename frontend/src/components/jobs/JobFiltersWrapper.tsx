'use client';

import { useState } from 'react';
import { JobFilters } from './JobFilters';
import { JobCard } from './JobCard';
import type { JobFilters as JobFiltersType, Job } from '@/types';

interface JobFiltersWrapperProps {
  initialJobs: Job[];
}

// Sem filtros ativos, a home mostra as vagas mais recentes (3 colunas x 4 linhas).
const LATEST_JOBS_LIMIT = 12;

export function JobFiltersWrapper({ initialJobs }: JobFiltersWrapperProps) {
  const [filters, setFilters] = useState<JobFiltersType>({});
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);
  const [showAll, setShowAll] = useState(false);

  const hasActiveFilters = Boolean(
    filters.query || filters.contract_type || filters.experience_level
  );
  const limited = !hasActiveFilters && !showAll;
  const visibleJobs = limited ? filteredJobs.slice(0, LATEST_JOBS_LIMIT) : filteredJobs;
  const hiddenCount = filteredJobs.length - visibleJobs.length;

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
        <section aria-labelledby="titulo-vagas">
          <h2
            id="titulo-vagas"
            className="mb-5 text-[28px] font-extrabold tracking-tight"
          >
            {hasActiveFilters ? 'Resultados da busca' : 'Vagas mais recentes'}
          </h2>
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
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
  );
}