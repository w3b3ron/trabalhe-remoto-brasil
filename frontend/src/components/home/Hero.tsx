'use client';

import { useState } from 'react';
import Link from 'next/link';

const stats = [
  { value: '5.000+', label: 'Vagas ativas' },
  { value: '300+', label: 'Empresas parceiras' },
  { value: '120+', label: 'Cursos indicados' },
  { value: '98%', label: 'Atualização diária' },
];

export function Hero() {
  const [query, setQuery] = useState('');

  return (
    <section className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-5 sm:p-12 shadow-2xl border border-neutral-800">
      {/* Background glow effect */}
      <div className="absolute -top-24 -right-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/30 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-accent mb-4 sm:mb-6">
          ✨ Vagas 100% Remotas • Curadoria Profissional
        </div>
        
        <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 sm:mb-6 leading-tight">
          Trabalhe de onde quiser.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
            Sem fronteiras.
          </span>
        </h1>
        
        <p className="text-sm sm:text-lg text-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
          Plataforma centralizada de vagas remotas para o Brasil. Encontre oportunidades em tecnologia, design, dados e produtos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto mb-8 sm:mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cargo, tecnologia ou palavra-chave..."
            className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base text-white placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <Link
            href={query ? `/?q=${encodeURIComponent(query)}` : '/'}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-accent px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-neutral-950 transition hover:bg-emerald-400 shadow-lg shadow-accent/25 shrink-0"
          >
            Explorar Vagas
          </Link>
        </div>

        {/* Cards de Estatísticas Responsivos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-6 border-t border-neutral-800/80">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-neutral-800/50 backdrop-blur border border-neutral-700/50 rounded-2xl p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-3xl font-black text-accent mb-0.5 sm:mb-1">{stat.value}</div>
              <div className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}