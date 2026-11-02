'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/providers/ThemeProvider';

const navItems = [
  { label: 'Vagas', href: '/' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Loja', href: '/loja' },
];

const themeIcons = {
  light: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  dark: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  system: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

export function Header() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-divider bg-surface/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-3 sm:px-6">
        {/* Logo flutuante responsiva */}
        <Link href="/" className="relative z-20 flex items-center -mb-6 sm:-mb-14" aria-label="TrabalheRemotoBrasil - Início">
          <div className="relative h-14 w-40 sm:h-28 sm:w-72 transition-transform hover:scale-105 drop-shadow-md">
            <Image
              src="/brand/trabalheremoto_logo01_transparent.png"
              alt="TrabalheRemotoBrasil"
              fill
              className="object-contain object-left-top"
              priority
            />
          </div>
        </Link>

        {/* Links de Navegação + Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="tap-target rounded-pill px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-text-secondary transition hover:bg-neutral-100 hover:text-text-primary dark:hover:bg-neutral-800 dark:hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={cycleTheme}
            className="tap-target rounded-pill p-2 text-text-secondary transition hover:bg-neutral-100 hover:text-text-primary dark:hover:bg-neutral-800 dark:hover:text-text-primary"
            aria-label={`Tema atual: ${theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'}. Clique para alternar.`}
            title={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'}`}
          >
            {themeIcons[theme]}
          </button>
        </div>
      </nav>
    </header>
  );
}
