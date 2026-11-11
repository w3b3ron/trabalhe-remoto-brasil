'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { ScrapingSource } from '@/types';

export default function AdminScrapingPage() {
  const [sources, setSources] = useState<ScrapingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('api');
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndFetchSources();
  }, []);

  async function checkAuthAndFetchSources() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    await fetchSources();
  }

  async function fetchSources() {
    const { data, error: fetchError } = await supabase
      .from('scraping_sources')
      .select('*')
      .order('name');

    if (fetchError) {
      setError('Erro ao carregar fontes: ' + fetchError.message);
    } else {
      setSources((data as ScrapingSource[]) ?? []);
    }
    setLoading(false);
  }

  function handleOpenCreateModal() {
    setEditingId(null);
    setName('');
    setType('api');
    setUrl('');
    setApiKey('');
    setIsActive(true);
    setDescription('');
    setError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(source: ScrapingSource) {
    setEditingId(source.id);
    setName(source.name);
    setType(source.type);
    setUrl(source.url);
    setApiKey(source.api_key || '');
    setIsActive(source.is_active);
    setDescription(source.description || '');
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
      type,
      url,
      api_key: apiKey || null,
      is_active: isActive,
      description: description || null,
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from('scraping_sources')
        .update(payload)
        .eq('id', editingId);

      if (updateError) {
        setError('Erro ao atualizar fonte: ' + updateError.message);
      } else {
        setSuccessMessage('Fonte atualizada com sucesso!');
        setIsModalOpen(false);
        await fetchSources();
      }
    } else {
      const { error: insertError } = await supabase
        .from('scraping_sources')
        .insert([payload]);

      if (insertError) {
        setError('Erro ao criar fonte: ' + insertError.message);
      } else {
        setSuccessMessage('Fonte cadastrada com sucesso!');
        setIsModalOpen(false);
        await fetchSources();
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir esta fonte?')) return;

    const { error: deleteError } = await supabase
      .from('scraping_sources')
      .delete()
      .eq('id', id);

    if (deleteError) {
      alert('Erro ao excluir fonte: ' + deleteError.message);
    } else {
      setSuccessMessage('Fonte excluída com sucesso!');
      await fetchSources();
    }
  }

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-sm font-medium text-accent hover:underline">
              ← Painel Admin
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Scraping de Vagas
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Configurar Fontes de Scraping
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Gerencie as fontes de onde as vagas são extraídas (Adzuna, Jooble, Remote OK, etc.).
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="tap-target inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent/90"
        >
          + Adicionar Fonte
        </button>
      </div>

      {successMessage && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-neutral-500">
          Carregando fontes...
        </div>
      ) : sources.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-neutral-500 border border-black/5">
          <p>Nenhuma fonte de scraping cadastrada no momento.</p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 inline-block text-accent font-medium hover:underline"
          >
            Cadastrar primeira fonte →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <div
              key={source.id}
              className="glass flex flex-col justify-between rounded-xl overflow-hidden border border-black/5 p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent uppercase">
                    {source.type}
                  </span>
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {source.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white line-clamp-1">
                  {source.name}
                </h3>

                <p className="mt-1 text-xs text-neutral-500 truncate" title={source.url}>
                  {source.url}
                </p>

                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {source.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  {source.api_key ? '🔑 Com API Key' : '🌐 Sem Chave'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(source)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(source.id)}
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

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass w-full max-w-2xl rounded-2xl p-6 shadow-2xl bg-white dark:bg-neutral-900 border border-black/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {editingId ? 'Editar Fonte de Scraping' : 'Cadastrar Nova Fonte de Scraping'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nome da Fonte *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Adzuna Brasil, Remote OK"
                  className="mt-1 block w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Tipo de Fonte *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="api">API (Adzuna, Jooble)</option>
                    <option value="json">JSON (Remote OK)</option>
                    <option value="scraper">Web Scraper (Remotar, Trampos.co)</option>
                    <option value="playwright">Playwright (LinkedIn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Status
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-neutral-300 text-accent focus:ring-accent h-4 w-4"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Fonte ativa para ingestão</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  URL Endpoint / Base URL *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.adzuna.com/v1/api/jobs/br/search"
                  className="mt-1 block w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  API Key / Token (opcional)
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Sua chave de API (ex: Adzuna App ID/Key)"
                  className="mt-1 block w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Descrição / Notas
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes sobre a frequência de atualização, parâmetros, etc."
                  className="mt-1 block w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Fonte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}