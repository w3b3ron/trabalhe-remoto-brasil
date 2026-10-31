'use client';

import { useState } from 'react';
import type { JobFilters } from '@/types';

const contractTypes = [
  { label: 'CLT', value: 'CLT' },
  { label: 'PJ', value: 'PJ' },
  { label: 'Freelance', value: 'Freelance' },
];

const experienceLevels = [
  { label: 'Estágio', value: 'Estágio' },
  { label: 'Júnior', value: 'Junior' },
  { label: 'Pleno', value: 'Pleno' },
  { label: 'Sênior', value: 'Senior' },
  { label: 'Líder', value: 'Lead' },
];

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
}

export function JobFilters({ filters, onFiltersChange }: JobFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleFilter = <K extends keyof JobFilters>(
    key: K,
    value: JobFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="glass mb-6 rounded-app-card p-4 shadow-app-card sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filtros</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="tap-hidden sm:tap-hidden tap-flex h-9 items-center gap-1 rounded-full bg-neutral-100 px-3 text-sm font-medium dark:bg-neutral-800"
        >
          {expanded ? 'Ocultar ▲' : 'Mostrar ▼'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Tipo de Contrato
            </label>
            <div className="flex flex-wrap gap-2">
              {contractTypes.map((ct) => (
                <button
                  key={ct.value}
                  onClick={() =>
                    toggleFilter('contract_type', filters.contract_type === ct.value ? undefined : ct.value)
                  }
                  className={`tap-target rounded-full px-4 py-2 text-sm font-medium transition ${
                    filters.contract_type === ct.value
                      ? 'bg-accent text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Nível de Experiência
            </label>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map((el) => (
                <button
                  key={el.value}
                  onClick={() =>
                    toggleFilter('experience_level', filters.experience_level === el.value ? undefined : el.value)
                  }
                  className={`tap-target rounded-full px-4 py-2 text-sm font-medium transition ${
                    filters.experience_level === el.value
                      ? 'bg-accent text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  {el.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
