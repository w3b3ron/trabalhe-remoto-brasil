'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { slug } = params;

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_available', true)
        .maybeSingle();

      if (fetchError) {
        setError('Erro ao carregar produto: ' + fetchError.message);
      } else {
        setProduct(data as Product | null);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="py-20 text-center">Carregando produto...</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;
  if (!product) return <div className="py-20 text-center text-neutral-500">Produto não encontrado.</div>;

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold text-accent">R$ {Number(product.price).toFixed(2)}</p>
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
