'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider';

const stats = [
  { value: '5.000+', label: 'Vagas ativas' },
  { value: '300+', label: 'Empresas parceria' },
  { value: '120+', label: 'Cursos indicados' },
  { value: '98%', label: 'Taxa de atualização diária' },
];

export function Hero() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/10 via-surface-light to-surface-light px-6 py-12 text-center dark:from-accent/20 dark:via-surface-dark dark:to-surface-dark">
      <div className="mx-auto max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          🚀 Novo: Busca por IA e recomendação de cursos
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Encontre a vaga{' '}
          <span className="text-accent">100% Remoto</span> ideal para o seu perfil
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Centralizamos as melhores vagas remotas do Brasil em um só lugar,
          com filtros avançados e recomendações inteligentes de cursos.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: React, Python, Design..."
            className="tap-target w-full flex-1 rounded-full border border-neutral-200 bg-white px-5 py-3 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
          />
          <Link
            href={query ? `/?q=${encodeURIComponent(query)}` : '/'}
            className="tap-target inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-medium text-white transition hover:bg-accent-hover"
          >
            Buscar
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-accent">{stat.value}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}