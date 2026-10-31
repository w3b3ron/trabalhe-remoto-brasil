import type { Metadata } from 'next';
import { fetchJobs } from '@/services/jobs';
import { Hero } from '@/components/home/Hero';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobCard } from '@/components/jobs/JobCard';
import type { JobFilters as JobFiltersType } from '@/types';

export const metadata: Metadata = {
  title: 'TrabalheRemotoBrasil — Vagas Remotas para Brasileiros',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; contract?: string; level?: string }>;
}) {
  const sp = await searchParams;

  const filters: JobFiltersType = {
    query: sp.q,
    contract_type: sp.contract,
    experience_level: sp.level,
  };

  const jobs = await fetchJobs(filters);

  return (
    <div>
      <Hero />

      <JobFilters
        filters={filters}
        onFiltersChange={() => {}}
      />

      {jobs.length === 0 ? (
        <div className="glass rounded-app-card p-12 text-center">
          <p className="text-lg font-medium">Nenhuma vaga encontrada</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Tente outros termos de busca ou remova os filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}