import type { Metadata } from 'next';
import { fetchLatestJobs } from '@/services/jobs';
import { Hero } from '@/components/home/Hero';
import { JobFiltersWrapper } from '@/components/jobs/JobFiltersWrapper';

// ISR: revalidar a cada 5 minutos (300 segundos)
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'TrabalheRemotoBrasil — Vagas Remotas para Brasileiros',
};

export default async function Page() {
  // Busca as 12 vagas mais recentes (order by published_at desc, limit 12)
  const jobs = await fetchLatestJobs(12);

  return (
    <div className="container-main py-8">
      <Hero />

      {/* Grid de cards - 12 vagas em 3 colunas x 4 linhas no desktop */}
      <JobFiltersWrapper initialJobs={jobs} />
    </div>
  );
}