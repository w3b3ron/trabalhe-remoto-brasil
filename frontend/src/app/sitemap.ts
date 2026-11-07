import { MetadataRoute } from 'next';
import { fetchJobs } from '@/services/jobs';
import type { Job } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Rotas estáticas públicas (sem depender do banco)
const STATIC_ROUTES: Array<{ path: string; priority: number }> = [
  { path: '', priority: 1 },
  { path: '/cursos', priority: 0.8 },
  { path: '/loja', priority: 0.8 },
  { path: '/sobre', priority: 0.6 },
  { path: '/contato', priority: 0.6 },
  { path: '/privacidade', priority: 0.4 },
  { path: '/termos', priority: 0.4 },
];

/**
 * sitemap.xml dinâmico (Next.js 14 App Router).
 * Inclui rotas estáticas + todas as vagas ativas cadastradas no Supabase.
 * Regenerado em cada build (ou via ISR se configurado).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let jobs: Job[] = [];

  try {
    jobs = await fetchJobs();
  } catch {
    // Em build time sem Supabase configurado, segue com rotas estáticas apenas.
    jobs = [];
  }

  const jobEntries = jobs.map((job: Job) => ({
    url: `${BASE_URL}/vaga/${job.slug}`,
    lastModified: new Date(
      job.published_at ?? job.created_at ?? new Date().toISOString()
    ),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const staticEntries = STATIC_ROUTES.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }));

  return [...staticEntries, ...jobEntries];
}
