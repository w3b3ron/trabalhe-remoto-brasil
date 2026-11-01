'use client';

import Link from 'next/link';
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
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <svg
            className="h-9 w-9"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="12" className="fill-accent" />
            <path
              d="M12 20C12 15.5858 15.5858 12 20 12C24.4142 12 28 15.5858 28 20C28 24.4142 24.4142 28 20 28C15.5858 28 12 24.4142 12 20Z"
              stroke="white"
              strokeWidth="2.5"
            />
            <circle cx="20" cy="20" r="5" stroke="white" strokeWidth="2" />
            <path
              d="M8 32L14 26M32 32L26 26"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-base font-semibold tracking-tight">
            Trabalhe<span className="text-accent">Remoto</span>Brasil
          </span>
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
