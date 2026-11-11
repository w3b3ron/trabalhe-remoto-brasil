/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // output: 'standalone' — desabilitado na Vercel; reative apenas para build Docker (HostGator VPS).
  // Para reativar: adicione NEXT_STANDALONE=1 nas variáveis de ambiente do build.
  ...(process.env.NEXT_STANDALONE === '1' ? { output: 'standalone' } : {}),
};

export default nextConfig;
