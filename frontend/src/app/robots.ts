import type { Robots } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * robots.txt dinâmico (Next.js 14 App Router).
 * Garante que motores de busca indexem o conteúdo público e
 * excluem áreas privadas do painel administrativo.
 */
export default async function robots(): Promise<Robots> {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/conta/',
          '/candidatura/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
