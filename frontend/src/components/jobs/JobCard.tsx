'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import type { Job } from '@/types';
import { useSavedJobs } from '@/hooks/useSavedJobs';

// ============================================================
// SVG Icons (inline, sem dependências externas)
// ============================================================

const ChevronDownIcon = ({ className, 'aria-hidden': ariaHidden = 'true' }: { className?: string; 'aria-hidden'?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden={ariaHidden}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const BookmarkIcon = ({ filled, className, 'aria-hidden': ariaHidden = 'true' }: { filled?: boolean; className?: string; 'aria-hidden'?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} aria-hidden={ariaHidden}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2 2 0 012 2v18l-7-4-7 4V5a2 2 0 012-2h10z" />
  </svg>
);

const LogoFallback = ({ initials, className }: { initials: string; className?: string }) => (
  <div className={`flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-text-secondary font-bold ${className}`}>
    {initials}
  </div>
);

const ClockIcon = ({ className, 'aria-hidden': ariaHidden = 'true' }: { className?: string; 'aria-hidden'?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden={ariaHidden}>
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

const BuildingIcon = ({ className, 'aria-hidden': ariaHidden = 'true' }: { className?: string; 'aria-hidden'?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden={ariaHidden}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

// ============================================================
// Utilitários
// ============================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatSalary(min: number | null, max: number | null, currency: string): string {
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

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  return `há ${Math.floor(diffDays / 365)} ano${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
}

function getContractChipClass(contract: string): string {
  const c = contract.toLowerCase();
  if (c === 'clt') return 'bg-chip-contract text-chip-contract';
  if (c === 'pj') return 'bg-chip-contract text-chip-contract';
  return 'bg-chip-neutral text-chip-neutral';
}

function getModalityChipClass(): string {
  return 'bg-chip-modality text-chip-modality';
}

function getLevelChipClass(): string {
  return 'bg-chip-neutral text-chip-neutral';
}
// ============================================================
// JobCard Component
// ============================================================

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const company = job.company;
  const logoUrl = company?.logo_url;
  const companyName = company?.name ?? 'Empresa não informada';
  const initials = getInitials(companyName);

  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { isSaved, toggleSave, mounted: savedMounted } = useSavedJobs();

  // Evita mismatch de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  const saved = savedMounted ? isSaved(job.id) : false;

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSave(job.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const panelId = `job-panel-${job.id}`;

  if (!mounted) {
// Renderiza versão recolhida durante SSR
    return (
      <article className="group relative rounded-card bg-surface p-5 shadow-card transition-card dark:shadow-card border border-divider">
        <div className="flex items-start gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
            {logoUrl ? (
              <Image src={logoUrl} alt={companyName} fill sizes="48px" className="object-contain p-1" />
            ) : (
              <LogoFallback initials={initials} className="h-full w-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-title-card line-clamp-2 text-text-primary">{job.title}</h3>
            <p className="text-body-sm text-text-secondary">{companyName}</p>
          </div>
          {job.is_featured && (
            <span className="shrink-0 rounded-pill bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              Destaque
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`rounded-chip px-2.5 py-1 text-xs font-medium ${getContractChipClass(job.contract_type)}`}>
            {job.contract_type}
          </span>
          <span className={`rounded-chip px-2.5 py-1 text-xs font-medium ${getLevelChipClass()}`}>
            {job.experience_level}
          </span>
          <span className={`rounded-chip px-2.5 py-1 text-xs font-medium ${getModalityChipClass()}`}>
            100% Remoto · Brasil
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-body-sm leading-relaxed text-text-secondary">
          {job.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-divider pt-4">
          <span className="text-salary-card text-accent">
            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="tap-target rounded-pill p-2 text-text-secondary transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label={`Salvar vaga ${job.title}`}
            >
              <BookmarkIcon filled={saved} className="w-5 h-5" />
            </button>
            <Link
              href={`/vaga/${job.slug}`}
              className="tap-target rounded-pill bg-accent px-5 py-2.5 text-body-sm font-medium text-white transition hover:bg-accent-hover"
            >
              Ver vaga →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative rounded-card bg-surface p-5 shadow-card transition-card dark:shadow-card border border-divider">
{/* Área clicável para expandir/recolher - apenas elementos inline */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <div className="flex items-start gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
            {logoUrl ? (
              <Image src={logoUrl} alt={companyName} fill sizes="48px" className="object-contain p-1" />
            ) : (
              <LogoFallback initials={initials} className="h-full w-full" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-title-card line-clamp-2 text-text-primary pr-8">{job.title}</h3>
            <p className="text-body-sm text-text-secondary">{companyName}</p>
          </div>

          <div className="flex items-center gap-2">
            {job.is_featured && (
              <span className="shrink-0 rounded-pill bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Destaque
              </span>
            )}
            <div className="tap-target flex-shrink-0 p-1 transition-chevron" aria-hidden="true">
              <ChevronDownIcon className={`w-5 h-5 text-text-tertiary ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`rounded-chip px-2.5 py-1 text-xs font-medium ${getContractChipClass(job.contract_type)}`}>
            {job.contract_type}
          </span>
          <span className={`rounded-chip px-2.5 py-1 text-xs font-medium ${getLevelChipClass()}`}>
            {job.experience_level}
          </span>
          <span className={`rounded-chip px-2.5 py-1 text-xs font-medium ${getModalityChipClass()}`}>
            100% Remoto · Brasil
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-body-sm leading-relaxed text-text-secondary">
          {job.description}
        </p>
      </button>

      {/* Rodapé FORA do botão (sem elementos interativos aninhados) */}
      <div className="mt-4 flex items-center justify-between border-t border-divider pt-4">
        <span className="text-salary-card text-accent">
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="tap-target rounded-pill p-2 text-text-secondary transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label={saved ? `Remover dos salvos ${job.title}` : `Salvar vaga ${job.title}`}
          >
            <BookmarkIcon filled={saved} className="w-5 h-5" />
          </button>
          <Link
            href={`/vaga/${job.slug}`}
            className="tap-target rounded-pill bg-accent px-5 py-2.5 text-body-sm font-medium text-white transition hover:bg-accent-hover"
          >
            Ver vaga →
          </Link>
        </div>
      </div>

      {/* Painel expandido - parte 1 */}
      <div
        id={panelId}
        ref={panelRef}
        role="region"
        aria-label={`Detalhes da vaga ${job.title}`}
        className={`card-panel transition-card ${expanded ? 'expanded' : 'collapsed'}`}
      >
        <div className="mt-4 space-y-4 pt-4 border-t border-divider">
          {/* 1. TECNOLOGIAS */}
          {job.stack && job.stack.length > 0 && (
            <section>
              <h4 className="text-label-sm text-text-tertiary">TECNOLOGIAS</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.stack.map((tech) => (
                  <span key={tech} className="rounded-pill bg-chip-neutral text-chip-neutral px-3 py-1 text-xs font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 2. Grade 2 colunas */}
          <section className="grid grid-cols-2 gap-3 text-body-sm">
            <div>
              <p className="text-text-tertiary">Contrato</p>
              <p className="text-text-primary font-medium">{job.contract_type}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Senioridade</p>
              <p className="text-text-primary font-medium">{job.experience_level}</p>
            </div>
            <div>
              <p className="text-text-tertiary">Modalidade</p>
              <p className="text-text-primary font-medium">100% Remoto</p>
            </div>
            <div>
              <p className="text-text-tertiary">Publicada em</p>
              <p className="text-text-primary font-medium flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {formatRelativeDate(job.published_at ?? job.created_at)}
              </p>
            </div>
          </section>
{/* 3. Sobre a Empresa */}
          {company && (company.about || company.sector || company.size || company.headquarters) && (
            <section className="rounded-company-card bg-neutral-50 dark:bg-neutral-900/50 p-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  {logoUrl ? (
                    <Image src={logoUrl} alt={companyName} fill sizes="40px" className="object-contain p-1" />
                  ) : (
                    <LogoFallback initials={initials} className="h-full w-full text-base" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-text-primary truncate">Sobre a {companyName}</h4>
                  <p className="text-body-sm text-text-secondary flex items-center gap-1 flex-wrap">
                    {company.sector && (
                      <>
                        {company.sector}
                        {(company.size || company.headquarters) && <span>·</span>}
                      </>
                    )}
                    {company.size && (
                      <>
                        {company.size}
                        {company.headquarters && <span>·</span>}
                      </>
                    )}
                    {company.headquarters && <span>{company.headquarters}</span>}
                  </p>
                </div>
              </div>
              {company.about && (
                <p className="mt-3 text-body-sm text-text-secondary">{company.about}</p>
              )}
            </section>
          )}
        </div>
      </div>
    </article>
  );
}