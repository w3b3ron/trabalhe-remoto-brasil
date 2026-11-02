'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
}

// Formatação de salário
function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return 'Salário a combinar';
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
  return 'Salário a combinar';
}

// Formatação de data relativa em pt-BR
function formatRelativeDate(dateString: string): string {
  if (!dateString) return 'recentemente';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'hoje';
  if (diffDays === 1) return 'há 1 dia';
  if (diffDays < 30) return `há ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Hook de vagas salvas em localStorage
function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = localStorage.getItem('trb:saved-jobs');
      if (raw) setSavedIds(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('trb:saved-jobs', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  return { savedIds, toggleSave, isMounted };
}
export function JobCard({ job }: JobCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { savedIds, toggleSave, isMounted } = useSavedJobs();
  const isSaved = isMounted && savedIds.has(job.id);

  const company = job.company;
  const logoUrl = company?.logo_url;
  const companyInitial = company?.name ? company.name.charAt(0).toUpperCase() : 'E';

  return (
    <article className="rounded-app-card bg-surface-light p-6 shadow-app-card transition-all duration-200 hover:shadow-md dark:bg-surface-dark border border-divider">
      {/* Área interativa (Nível 1 + Nível 2): único botão com aria-expanded */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`job-panel-${job.id}`}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
      >
        {/* Linha superior: logo 48x48 (raio 14px), nome da empresa, badge Destaque, chevron 32px */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[14px] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-accent">
              {logoUrl ? (
                <Image src={logoUrl} alt={company?.name ?? 'Empresa'} fill sizes="48px" className="object-cover" />
              ) : (
                <span>{companyInitial}</span>
              )}
            </div>
            <div className="min-w-0">
              <span className="block truncate text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
                {company?.name ?? 'Empresa Confidencial'}
              </span>
              {job.is_featured && (
                <span className="inline-block mt-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  Destaque
                </span>
              )}
            </div>
          </div>

          {/* Chevron circular de 32px que gira 180° (transition 200ms) */}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </span>
        </div>

        {/* Título: 24px, 700, line-height 1.3, quebra em até 2 linhas (sem truncar em 1) */}
        <h3 className="mt-4 text-[24px] font-bold leading-[1.3] text-text-primary dark:text-text-dark-primary">
          {job.title}
        </h3>

        {/* Chips: contrato (azul), senioridade (cinza), modalidade (verde) */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-chip bg-chip-contract-bg px-2.5 py-1 text-xs font-semibold text-chip-contract-text">{job.contract_type}</span>
          <span className="rounded-chip bg-chip-neutral-bg px-2.5 py-1 text-xs font-semibold text-chip-neutral-text">{job.experience_level}</span>
          <span className="rounded-chip bg-chip-modality-bg px-2.5 py-1 text-xs font-semibold text-chip-modality-text">100% Remoto · Brasil</span>
        </div>

        {/* Descrição: 15px, line-height 1.55, limitada a 2 linhas quando fechado */}
        <p className={`mt-3 text-[15px] leading-[1.55] text-text-secondary dark:text-text-dark-secondary ${isOpen ? '' : 'line-clamp-2'}`}>
          {job.description}
        </p>
      </button>

      {/* Painel expandido (Nível 2): grid-template-rows 0fr→1fr (250ms), respeita prefers-reduced-motion */}
      <div className={`card-expand-wrapper ${isOpen ? 'expanded' : ''}`}>
        <div className="card-expand-content">
          <div id={`job-panel-${job.id}`} className="mt-5 border-t border-divider pt-5 space-y-5">
            {/* 1. TECNOLOGIAS: rótulo 12px caixa alta + chips em pílula */}
            {job.stack && job.stack.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-discreet">Tecnologias</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {job.stack.map((tech) => (
                    <span key={tech} className="rounded-pill bg-chip-neutral-bg px-2.5 py-1 text-xs font-medium text-chip-neutral-text">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Grade de 2 colunas: Contrato, Senioridade, Modalidade e Publicada em */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-background p-4 dark:bg-neutral-900/50 text-sm">
              <div>
                <span className="block text-xs text-text-discreet">Contrato</span>
                <span className="font-semibold text-text-primary dark:text-text-dark-primary">{job.contract_type}</span>
              </div>
              <div>
                <span className="block text-xs text-text-discreet">Senioridade</span>
                <span className="font-semibold text-text-primary dark:text-text-dark-primary">{job.experience_level}</span>
              </div>
              <div>
                <span className="block text-xs text-text-discreet">Modalidade</span>
                <span className="font-semibold text-text-primary dark:text-text-dark-primary">100% remoto</span>
              </div>
              <div>
                <span className="block text-xs text-text-discreet">Publicada em</span>
                <span className="font-semibold text-text-primary dark:text-text-dark-primary">
                  {formatRelativeDate(job.published_at || job.created_at)}
                </span>
              </div>
            </div>

            {/* 3. Bloco "Sobre a <empresa>": omitido se não houver nenhum dado */}
            {company && (company.about || company.sector || company.size || company.headquarters) && (
              <div className="rounded-2xl bg-background p-4 dark:bg-neutral-900/60">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-xs text-text-primary">
                    {logoUrl ? (
                      <Image src={logoUrl} alt="" fill sizes="40px" className="object-cover" />
                    ) : (
                      <span>{companyInitial}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary dark:text-text-dark-primary">{company.name}</p>
                    <p className="truncate text-xs text-text-discreet">
                      {[company.sector, company.size, company.headquarters].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                {company.about && (
                  <p className="mt-2.5 text-xs leading-relaxed text-text-secondary dark:text-text-dark-secondary">
                    {company.about}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé: inalterado entre os estados (salário à esquerda, salvar + ver vaga à direita) */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-4">
        <span className="text-[17px] font-bold text-text-primary dark:text-text-dark-primary">
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </span>

        <div className="flex items-center gap-2.5">
          {/* Botão circular de 44px "Salvar vaga" */}
          <button
            type="button"
            onClick={() => toggleSave(job.id)}
            aria-label={isSaved ? `Remover dos salvos: ${job.title}` : `Salvar vaga: ${job.title}`}
            aria-pressed={isSaved}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-light text-text-secondary transition-colors hover:bg-neutral-100 dark:bg-surface-dark dark:text-text-dark-secondary dark:hover:bg-neutral-800"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isSaved ? 'text-accent' : ''}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Botão primário "Ver vaga →" (pílula na cor de acento, min-height 44px) */}
          <Link
            href={`/vaga/${job.slug}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-pill bg-accent px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
            aria-label={`Ver vaga: ${job.title}`}
          >
            Ver vaga →
          </Link>
        </div>
      </div>
    </article>
  );
}