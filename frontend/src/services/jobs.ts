import { createClient } from '@/lib/supabase/server';
import type { Job, Course, Product, JobFilters } from '@/types';

// Campos adicionais do Job
export interface JobWithDetails extends Job {
  stack?: string[];
  responsibilities?: string[];
  benefits?: string[];
  company?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    website: string | null;
    about?: string | null;
    sector?: string | null;
    size?: string | null;
    headquarters?: string | null;
  };
}

// Atualizar interface Job para incluir novos campos opcionais
export interface Job {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  contract_type: 'CLT' | 'PJ' | 'Freelance';
  experience_level: 'Estágio' | 'Junior' | 'Pleno' | 'Senior' | 'Lead';
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  apply_url: string;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  views_count: number;
  source_site: string | null;
  external_id: string | null;
  published_at: string;
  created_at: string;
  stack?: string[];
  responsibilities?: string[];
  benefits?: string[];
  company?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    website: string | null;
    about?: string | null;
    sector?: string | null;
    size?: string | null;
    headquarters?: string | null;
  };
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
