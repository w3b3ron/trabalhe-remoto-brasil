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
    query = query.ilike('title', `%${filters.query}%`);
  }
  if (filters.contract_type) {
    query = query.eq('contract_type', filters.contract_type);
  }
  if (filters.experience_level) {
    query = query.eq('experience_level', filters.experience_level);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar vagas:', error.message);
    return [];
  }

  return (data as Job[]) ?? [];
}

// Retorna as N vagas mais recentes (para home page)
// Usa published_at com fallback para created_at
export async function fetchLatestJobs(limit = 12): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar vagas recentes:', error.message);
    return [];
  }

  return (data as Job[]) ?? [];
}

// Busca vagas similares baseada em stack/tags da empresa
export async function fetchSimilarJobs(currentJobId: string, currentCompanyId: string, currentStack: string[] = [], limit = 3): Promise<Job[]> {
  const supabase = await createClient();

  // Primeiro tenta buscar por stack similar
  let query = supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('is_active', true)
    .neq('id', currentJobId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (currentStack.length > 0) {
    query = query.contains('stack', currentStack);
  }

  let { data, error } = await query;

  // Se não encontrou por stack, busca pela mesma empresa
  if ((!data || data.length === 0) && currentCompanyId) {
    const { data: companyJobs, error: companyError } = await supabase
      .from('jobs')
      .select('*, company:companies(*)')
      .eq('is_active', true)
      .eq('company_id', currentCompanyId)
      .neq('id', currentJobId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (!companyError && companyJobs && companyJobs.length > 0) {
      data = companyJobs;
      error = null;
    }
  }

  // Fallback: vagas mais recentes excluindo a atual
  if ((!data || data.length === 0)) {
    const { data: recentJobs, error: recentError } = await supabase
      .from('jobs')
      .select('*, company:companies(*)')
      .eq('is_active', true)
      .neq('id', currentJobId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (!recentError && recentJobs) {
      data = recentJobs;
      error = null;
    }
  }

  if (error) {
    console.error('Erro ao buscar vagas similares:', error.message);
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
