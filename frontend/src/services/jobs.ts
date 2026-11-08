import { createClient } from '@/lib/supabase/server';
import type { Job, Course, Product, JobFilters } from '@/types';

// ============================================================
// Serviço de Vagas (Server Actions / Server Components)
// ============================================================

export async function fetchJobs(filters: JobFilters = {}): Promise<Job[]> {
  const supabase = await createClient();

  let query = supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('is_active', true)
    .order('published_at', { ascending: false });

  if (filters.query) {
    const q = filters.query.trim();
    if (q) {
      // Busca textual em título, descrição, nome da empresa e tags
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}},company.name.ilike.%${q}%`
      );
    }
  }
  if (filters.contract_type) {
    query = query.eq('contract_type', filters.contract_type);
  }
  if (filters.experience_level) {
    query = query.eq('experience_level', filters.experience_level);
  }

  if (filters.tags?.length) {
    // Filtra vagas que possuam pelo menos uma das tags informadas (operador Postgres &&)
    query = query.overlaps('tags', filters.tags);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar vagas:', error.message);
    return [];
  }

  return (data as Job[]) ?? [];
}

export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Erro ao buscar vaga:', error.message);
    return null;
  }

  return data as Job;
}

/**
 * Vagas semelhantes: mesmas tecnologias (tags) primeiro; se faltar, completa
 * com as vagas mais recentes. Nunca inclui a própria vaga.
 */
export async function fetchSimilarJobs(job: Job, limit = 3): Promise<Job[]> {
  const supabase = await createClient();

  const base = () =>
    supabase
      .from('jobs')
      .select('*, company:companies(*)')
      .eq('is_active', true)
      .neq('id', job.id)
      .order('published_at', { ascending: false })
      .limit(limit);

  let similar: Job[] = [];
  if (job.tags?.length) {
    const { data, error } = await base().overlaps('tags', job.tags);
    if (error) console.error('Erro ao buscar vagas semelhantes:', error.message);
    else similar = (data as Job[]) ?? [];
  }

  if (similar.length >= limit) return similar;

  const { data, error } = await base();
  if (error) {
    console.error('Erro ao buscar vagas recentes:', error.message);
    return similar;
  }
  const seen = new Set(similar.map((j) => j.id));
  const filler = ((data as Job[]) ?? []).filter((j) => !seen.has(j.id));
  return [...similar, ...filler].slice(0, limit);
}

// ============================================================
// Serviço de Cursos (Recomendação)
// ============================================================

export async function fetchRecommendedCourses(tags: string[] = []): Promise<Course[]> {
  const supabase = await createClient();

  let query = supabase.from('courses').select('*');

  if (tags.length > 0) {
    query = query.contains('related_tags', tags);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar cursos:', error.message);
    return [];
  }

  return (data as Course[]) ?? [];
}

// ============================================================
// Serviço da Loja (Produtos)
// ============================================================

export async function fetchProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar produtos:', error.message);
    return [];
  }

  return (data as Product[]) ?? [];
}
