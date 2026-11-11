'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';
import Image from 'next/image';

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { slug } = params;

  useEffect(() => {
    checkAuthAndFetchProduct();
  }, []);

  async function checkAuthAndFetchProduct() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    await fetchProduct();
  }

  async function fetchProduct() {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError) {
      setError('Erro ao carregar produto: ' + fetchError.message);
    } else {
      setProduct(fetchError.data as Product);
    }
    setLoading(false);
  }

  function handleOpenCreateModal() {
    // Não usado nesta página, mas mantido para consistência
  }

  if (loading) return <div className="py-20 text-center">Carregando produto...</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;
  if (!product) return <div className="py-20 text-center text-neutral-500">Produto não encontrado.</div>;

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold text-accent">R$ {product.price.toFixed(2)}</p>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{product.description}</p>
          <a
            href={product.affiliate_or_buy_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent text-white px-8 py-4 rounded-full font-bold text-center hover:bg-accent/90 transition"
          >
            Comprar na Loja →
          </a>
        </div>
      </div>
    </div>
  );
}