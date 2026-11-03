import type { Metadata } from 'next';
import { fetchJobs } from '@/services/jobs';
import { Hero } from '@/components/home/Hero';
import { JobFiltersWrapper } from '@/components/jobs/JobFiltersWrapper';
import type { Job } from '@/types';

export const metadata: Metadata = {
  title: 'TrabalheRemotoBrasil — Vagas Remotas para Brasileiros',
};

const TOP_TAGS = 4;

/** Tags mais frequentes entre as vagas publicadas (empate: ordem alfabética). */
function topTagsOf(jobs: Job[]): string[] {
  const counts = new Map<string, number>();
  for (const job of jobs) {
    const unique = Array.from(new Set((job.tags ?? []).map((t) => t.trim()).filter(Boolean)));
    for (const tag of unique) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .slice(0, TOP_TAGS)
    .map(([tag]) => tag);
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; contract?: string; level?: string }>;
}) {
  const sp = await searchParams;

  // O contrato e a senioridade filtram no servidor; a busca por texto (?q=) é aplicada
  // no cliente (título, empresa, tags e descrição), junto com os filtros da tela.
  const jobs = await fetchJobs({
    contract_type: sp.contract,
    experience_level: sp.level,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Hero
        topTags={topTagsOf(jobs)}
        initialQuery={sp.q ?? ''}
        initialContract={sp.contract ?? ''}
      />

      <JobFiltersWrapper
        // key: ao pesquisar de novo (nova ?q=), o estado do cliente é recriado.
        key={`${sp.q ?? ''}|${sp.contract ?? ''}|${sp.level ?? ''}`}
        initialJobs={jobs}
        initialQuery={sp.q}
      />
    </div>
  );
}
