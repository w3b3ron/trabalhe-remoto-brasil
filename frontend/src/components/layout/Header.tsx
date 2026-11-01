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
    <header className="glass sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-3 sm:px-6">
        {/* Logo flutuante responsiva */}
        <Link href="/" className="relative z-20 flex items-center -mb-6 sm:-mb-14">
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
