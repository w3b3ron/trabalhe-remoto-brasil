import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'TrabalheRemotoBrasil — Vagas Remotas para Brasileiros',
    template: '%s | TrabalheRemotoBrasil',
  },
  description:
    'Central de vagas 100% remotas para profissionais brasileiros. Busque por tecnologia, salário e empresa. Cursos recomendados e loja do home office.',
  keywords: [
    'vagas remotas',
    'trabalho remoto',
    'home office',
    'emprego remoto brasil',
    'vagas brasil',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'TrabalheRemotoBrasil',
    title: 'TrabalheRemotoBrasil — Vagas Remotas para Brasileiros',
    description:
      'Central de vagas 100% remotas para profissionais brasileiros. Cursos recomendados e loja do home office.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-black/5 py-8 text-center text-sm text-neutral-500 dark:border-white/10">
            <p>
              © {new Date().getFullYear()} TrabalheRemotoBrasil.com — Feito com
              💻 no Brasil
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
