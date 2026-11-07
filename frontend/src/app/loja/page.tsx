import { fetchProducts } from '@/services/jobs';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Loja — TrabalheRemotoBrasil',
};

export const revalidate = 300; // ISR: revalida a cada 5 min

export default async function StorePage() {
  const products = await fetchProducts();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Loja do <span className="text-accent">Home Office</span>
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Tudo para transformar sua casa em um escritório de alto desempenho.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="glass rounded-app-card p-12 text-center">
          <p>Nenhum produto disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="glass flex flex-col overflow-hidden rounded-app-card shadow-app-card"
            >
              <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-medium text-accent">
                  {product.category}
                </span>
                <h3 className="mt-1 line-clamp-2 text-lg font-semibold">
                  {product.name}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <a
                    href={product.affiliate_or_buy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
                  >
                    Comprar →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}