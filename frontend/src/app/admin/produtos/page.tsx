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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function generateSlug(val: string) {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
    setIsAvailable(product.is_available);
    setError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

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

    if (deleteError) {
      alert('Erro ao excluir produto: ' + deleteError.message);
    } else {
      setSuccessMessage('Produto excluído com sucesso!');
      await fetchProducts();
    }
  }

  return (
    <div className="space-y-8 py-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <a href="/admin" className="text-sm font-medium text-blue-600 hover:underline">
              ← Painel Admin
            </a>
            <span className="text-neutral-400">/</span>
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Produtos (Loja)
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Gerenciar Produtos &amp; Afiliados da Loja
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Cadastre acessórios para home office, e-books e produtos com links de afiliado.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          + Novo Produto
        </button>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500">Carregando produtos...</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-black/5 p-12 text-center text-neutral-500">
          <p>Nenhum produto cadastrado no momento.</p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 inline-block font-medium text-blue-600 hover:underline"
          >
            Cadastrar o primeiro produto →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-between overflow-hidden rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:bg-neutral-900"
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/30">
                    {product.category}
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                <h3 className="line-clamp-2 font-semibold text-lg text-neutral-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {product.description}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/5">
                <a
                  href={product.affiliate_or_buy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-[120px] truncate text-xs font-medium text-blue-600 hover:underline"
                  title={product.affiliate_or_buy_url}
                >
                  🔗 Link Afiliado
                </a>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(product)}
                    className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
              {editingId ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nome *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug (URL)</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="gerado automaticamente"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Descrição *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Preço (R$) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <option>Ergonomia</option>
                    <option>Áudio</option>
                    <option>Iluminação</option>
                    <option>E-book</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">URL de Afiliado *</label>
                <input
                  required
                  type="url"
                  value={affiliateUrl}
                  onChange={(e) => setAffiliateUrl(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">URL da Imagem</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                Disponível na loja
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
