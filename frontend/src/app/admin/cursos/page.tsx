'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Course } from '@/types';

export default function AdminCursosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [description, setDescription] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState<string>('');
  const [isFree, setIsFree] = useState(false);
  const [rating, setRating] = useState<string>('4.8');
  const [tagsInput, setTagsInput] = useState('');

  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndFetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuthAndFetchCourses() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    await fetchCourses();
  }

  async function fetchCourses() {
    const { data, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Erro ao carregar cursos: ' + fetchError.message);
    } else {
      setCourses((data as Course[]) ?? []);
    }
    setLoading(false);
  }

  function handleOpenCreateModal() {
    setEditingId(null);
    setTitle('');
    setProvider('');
    setDescription('');
    setAffiliateUrl('');
    setImageUrl('');
    setPrice('');
    setIsFree(false);
    setRating('4.8');
    setTagsInput('');
    setError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(course: Course) {
    setEditingId(course.id);
    setTitle(course.title);
    setProvider(course.provider);
    setDescription(course.description ?? '');
    setAffiliateUrl(course.affiliate_url);
    setImageUrl(course.image_url ?? '');
    setPrice(course.price !== null ? String(course.price) : '');
    setIsFree(course.price === null || course.price === 0);
    setRating(course.rating !== null ? String(course.rating) : '4.8');
    setTagsInput((course.related_tags ?? []).join(', '));
    setError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const parsedPrice = isFree ? 0 : price ? parseFloat(price) : null;
    const parsedRating = rating ? parseFloat(rating) : null;
    const related_tags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title,
      provider,
      description: description || null,
      affiliate_url: affiliateUrl,
      image_url: imageUrl || null,
      price: parsedPrice,
      rating: parsedRating,
      related_tags,
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from('courses')
        .update(payload)
        .eq('id', editingId);

      if (updateError) {
        setError('Erro ao atualizar curso: ' + updateError.message);
      } else {
        setSuccessMessage('Curso atualizado com sucesso!');
        setIsModalOpen(false);
        await fetchCourses();
      }
    } else {
      const { error: insertError } = await supabase
        .from('courses')
        .insert([payload]);

      if (insertError) {
        setError('Erro ao criar curso: ' + insertError.message);
      } else {
        setSuccessMessage('Curso cadastrado com sucesso!');
        setIsModalOpen(false);
        await fetchCourses();
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) return;

    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      alert('Erro ao excluir curso: ' + deleteError.message);
    } else {
      setSuccessMessage('Curso excluído com sucesso!');
      await fetchCourses();
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
              Cursos
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Gerenciar Cursos
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Cadastre cursos com links de afiliado para recomendar aos visitantes.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          + Novo Curso
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
        <div className="py-20 text-center text-neutral-500">Carregando cursos...</div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-black/5 p-12 text-center text-neutral-500">
          <p>Nenhum curso cadastrado no momento.</p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 inline-block font-medium text-blue-600 hover:underline"
          >
            Cadastrar o primeiro curso →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-xl border border-black/5 bg-white p-5 shadow-sm dark:bg-neutral-900"
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600">{course.provider}</span>
                  {course.rating && (
                    <span className="text-xs text-neutral-500">⭐ {course.rating}</span>
                  )}
                </div>
                <h3 className="line-clamp-2 font-semibold text-neutral-900 dark:text-white">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {course.description}
                  </p>
                )}
                {course.related_tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {course.related_tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/5">
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  {course.price === 0 || course.price === null ? 'Grátis' : `R$ ${course.price?.toFixed(2)}`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(course)}
                    className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
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
              {editingId ? 'Editar Curso' : 'Novo Curso'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Título *</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Plataforma / Provedor *</label>
                <input
                  required
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Preço (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={isFree}
                    value={isFree ? '' : price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <label className="mt-1 flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
                    Grátis
                  </label>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Avaliação</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tags (separadas por vírgula)</label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="React, Node.js, Python"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
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
