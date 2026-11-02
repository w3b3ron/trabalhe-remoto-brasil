'use client';

import Link from 'next/link';
import Image from 'next/image';

const navItems = [
  { label: 'Vagas', href: '/' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Loja', href: '/loja' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-[60] border-b border-divider bg-white/95 shadow-sm backdrop-blur-md dark:bg-[#0B0B0D]/95">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-3 sm:px-6">
        // Logo flutuante (Ajustada para não sobrepor o conteúdo ao rolar)
        <Link href="/" className="relative z-50 flex items-center">
          <div className="relative h-12 w-32 sm:h-20 sm:w-56 transition-transform hover:scale-105">
            <Image
              src="/brand/trabalheremoto_logo01_transparent.png"
              alt="TrabalheRemotoBrasil"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Links de Navegação */}
        <div className="flex items-center gap-1 sm:gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="tap-target rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
