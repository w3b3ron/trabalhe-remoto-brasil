import { createBrowserClient } from '@supabase/ssr';

// Cliente Supabase para o lado do navegador (Browser)
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Sem as variáveis (ex.: ambiente de Preview sem env configurada) o pré-render
    // não pode quebrar o build. Em runtime, as chamadas falharão com erro visível.
    if (typeof window !== 'undefined') {
      console.error(
        'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas.'
      );
    }
    return createBrowserClient('http://localhost:54321', 'missing-anon-key');
  }

  return createBrowserClient(url, key);
}
