import type { Company } from '@/types';

/** Rótulos de senioridade exibidos na interface (o banco guarda sem acento). */
const EXPERIENCE_LABELS: Record<string, string> = {
  Estágio: 'Estágio',
  Junior: 'Júnior',
  Pleno: 'Pleno',
  Senior: 'Sênior',
  Lead: 'Líder',
};

export function experienceLabel(level: string | null | undefined): string | null {
  if (!level) return null;
  return EXPERIENCE_LABELS[level] ?? level;
}

export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string
): string {
  if (!min && !max) return 'Salário a negociar';
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `a partir de ${fmt(min)}`;
  if (max) return `até ${fmt(max)}`;
  return 'Salário a negociar';
}

/** Data relativa em pt-BR ("hoje", "há 3 dias"...). null se não houver data válida. */
export function formatPublished(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 30) return `há ${days} dias`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  const years = Math.floor(days / 365);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

/** Data completa em pt-BR (ex.: 02/11/2026). null se não houver data válida. */
export function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(date);
}

export function websiteHost(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Setor, porte e sede da empresa: só as partes que existem. */
export function companyFacts(company?: Company | null): string[] {
  if (!company) return [];
  return [company.sector, company.size, company.headquarters].filter(
    (v): v is string => Boolean(v && v.trim())
  );
}
