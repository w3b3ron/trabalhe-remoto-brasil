import { createClient as createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = await createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rotas protegidas: apenas /admin/*
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  // Se está tentando acessar /admin/* e não tem sessão, redireciona para /admin/login
  if (isAdminRoute && !session) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se está na página de login e já tem sessão, redireciona para /admin
  if (request.nextUrl.pathname === '/admin/login' && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};