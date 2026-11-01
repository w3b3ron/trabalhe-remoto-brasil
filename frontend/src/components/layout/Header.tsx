'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/providers/ThemeProvider';

const navItems = [
  { label: 'Vagas', href: '/' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Loja', href: '/loja' },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass sticky top-0 z-50 border-b border-black/5 dark:border-white/10">
      <nav className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo com destaque, maior e sobrepondo levemente a barra */}
        <Link href="/" className="relative -top-2 flex items-center">
          <div className="relative h-16 w-48 transition-transform hover:scale-105">
            <Image
              src="/brand/trabalheremoto_logo01_transparent.png"
              alt="TrabalheRemotoBrasil"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="tap-target rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="tap-target flex h-10 w-10 items-center justify-center rounded-full text-lg transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>
    </header>
  );
}
