'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { label: 'Vagas', href: '/' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Loja', href: '/loja' },
];

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Ouvir mudanças de auth
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <header className="glass sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-3 sm:px-6">
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

          {/* Link de Admin / Logout */}
          {isAuthenticated ? (
            <button
              onClick={() => {
                const supabase = createClient();
                supabase.auth.signOut().then(() => {
                  window.location.href = '/';
                });
              }}
              className="tap-target rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              Sair
            </button>
          ) : (
            <Link
              href="/admin/login"
              className="tap-target rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-accent transition hover:bg-accent/10 hover:text-accent/80"
            >
              Admin
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
