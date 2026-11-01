import type { Metadata } from 'next';
import { fetchJobs } from '@/services/jobs';
import { Hero } from '@/components/home/Hero';
import { JobFiltersWrapper } from '@/components/jobs/JobFiltersWrapper';

export const metadata: Metadata = {
  title: 'TrabalheRemotoBrasil — Vagas Remotas para Brasileiros',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; contract?: string; level?: string }>;
}) {
  const sp = await searchParams;

  const filters = {
    query: sp.q,
    contract_type: sp.contract,
    experience_level: sp.level,
  };

  const jobs = await fetchJobs(filters);

  return (
    <div>
      <Hero />
      <JobFiltersWrapper initialJobs={jobs} />
    </div>
  );
}