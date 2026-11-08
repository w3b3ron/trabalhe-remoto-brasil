import type { Metadata } from 'next';
import { fetchJobs } from '@/services/jobs';
import { Hero } from '@/components/home/Hero';
import { JobList } from '@/components/jobs/JobList';
import type { Job } from '@/types';

export const metadata: Metadata = {
  title: 'TrabalheRemotoBrasil — Vagas Remotas para Brasileiros',
};

export const revalidate = 60; // ISR: revalida a cada 60s

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
  searchParams: Promise<{ q?: string; contract?: string; level?: string; tag?: string | string[] }>;
}) {
  const sp = await searchParams;

  // Os filtros ficam só no banner (Hero), que envia ?q=&contract=&level=&tag= para esta página.
  // Contrato, senioridade e tags filtram no servidor; a busca por texto (?q=) é aplicada na
  // lista (título, empresa, descrição e tags).
  const tags = Array.isArray(sp.tag) ? sp.tag : sp.tag ? [sp.tag] : [];

  const jobs = await fetchJobs({
    query: sp.q,
    contract_type: sp.contract,
    experience_level: sp.level,
    tags,
  });

  const hasFilters = Boolean(sp.q || sp.contract || sp.level || tags.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Hero
        topTags={topTagsOf(jobs)}
        initialQuery={sp.q ?? ''}
        initialContract={sp.contract ?? ''}
        initialLevel={sp.level ?? ''}
      />

      <JobList
        // key: a cada nova busca, o estado da lista ("ver todas") é recriado.
        key={`${sp.q ?? ''}|${sp.contract ?? ''}|${sp.level ?? ''}`}
        jobs={jobs}
        query={sp.q}
        hasFilters={hasFilters}
      />
    </div>
  );
}
