// ============================================================
// TrabalheRemotoBrasil.com - Tipos do Domínio
// ============================================================

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  about: string | null;
  sector: string | null;
  size: string | null;
  headquarters: string | null;
  created_at: string;
}

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
  stack: string[];
  responsibilities: string[];
  benefits: string[];
  is_featured: boolean;
  is_active: boolean;
  views_count: number;
  source_site: string | null;
  external_id: string | null;
  published_at: string;
  created_at: string;
  company?: Company;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  description: string | null;
  affiliate_url: string;
  image_url: string | null;
  price: number | null;
  rating: number | null;
  related_tags: string[];
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  affiliate_or_buy_url: string;
  category: string;
  is_available: boolean;
  created_at: string;
}

// Filtros de busca de vagas
export interface JobFilters {
  query?: string;
  contract_type?: string;
  experience_level?: string;
  tags?: string[];
}
