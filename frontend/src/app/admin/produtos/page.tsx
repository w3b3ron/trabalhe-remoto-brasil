'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [category, setCategory] = useState('Ergonomia');
  const [isAvailable, setIsAvailable] = useState(true);

  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndFetchProducts();
  }, []);

  async function checkAuthAndFetchProducts() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    await fetchProducts();
  }

  async function fetchProducts() {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Erro ao carregar produtos: ' + fetchError.message);
    } else {
      setProducts((data as Product[]) ?? []);
    }
    setLoading(false);
  }

  function handleOpenCreateModal() {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setAffiliateUrl('');
    setCategory('Ergonomia');
    setIsAvailable(true);
    setError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setSlug(product.slug);
    setDescription(product.description);
    setPrice(String(product.price));
    setImageUrl(product.image_url);
    setAffiliateUrl(product.affiliate_or_buy_url);
    setCategory(product.category);
async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      name,
      slug: slug || generateSlug(name),
      description,
      price: parseFloat(price) || 0,
      image_url: imageUrl,
      affiliate_or_buy_url: affiliateUrl,
      category,
      is_available: isAvailable,
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId);

      if (updateError) {
        setError('Erro ao atualizar produto: ' + updateError.message);
      } else {
        setSuccessMessage('Produto atualizado com sucesso!');
        setIsModalOpen(false);
        await fetchProducts();
      }
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([payload]);

      if (insertError) {
        setError('Erro ao criar produto: ' + insertError.message);
      } else {
        setSuccessMessage('Produto cadastrado com sucesso!');
        setIsModalOpen(false);
        await fetchProducts();
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

}
<div className="space-y-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <a href="/admin" className="text-sm font-medium text-accent hover:underline">
              ← Painel Admin
            </a>
            <span className="text-neutral-400">/</span>
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Produtos (Loja)
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Gerenciar Produtos & Afiliados da Loja
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Cadastre acessórios para home office, e-books e produtos com links de afiliado.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="tap-target inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition:hover:bg-accent/90"
        >
          + Novo Produto
        </button>
      </div>

  return (
    if (deleteError) {
      alert('Erro ao excluir produto: ' + deleteError.message);
    } else {
      setSuccessMessage('Produto excluído com sucesso!');
      await fetchProducts();
    }
  }
    setIsAvailable(product.is_available);
    setError(null);
    setSuccessMessage(null);
{loading ? (
        <div className="py-20 text-center text-neutral-500">
          Carregando produtos...
        </div>
      ) : products.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-neutral-500 border border-black/5">
          <p>Nenhum produto cadastrado no momento.</p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 inline-block text-accent font-medium hover:underline"
          >
            Cadastrar o primeiro produto →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="glass flex flex-col justify-between rounded-xl overflow-hidden border border-black/5 p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                    {product.category}
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>

                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white line-clamp-2">
                  {product.name}
                </h3>

                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                  {product.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <a
                  href={product.affiliate_or_buy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-accent hover:underline truncate max-w-[120px]"
                  title={product.affiliate_or_buy_url}
                >
                  🔗 Link Afiliado
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(product)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 hover:bg-red-100 transition"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    setIsModalOpen(true);
  }

  function generateSlug(val: string) {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }