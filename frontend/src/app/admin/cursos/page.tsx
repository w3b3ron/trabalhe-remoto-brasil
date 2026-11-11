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

  useEffect(() => {
    checkAuthAndFetchCourses();
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