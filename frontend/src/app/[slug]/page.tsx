/* ============================================================
   TrabalheRemotoBrasil.com - Página de Detalhe da Vaga
   Server Component com generateMetadata, Open Graph e JSON-LD
   ============================================================ */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);

  if (!job) {
    return {
      title: 'Vaga não encontrada',
      description: 'Vaga não encontrada',
    };
  }

  // Formatar salário para a description
  let salaryText = '';
  if (job.salary_min && job.salary_max) {
    salaryText = ` R$ ${job.salary_min} – R$ ${job.salary_max}`;
  } else if (job.salary_min) {
    salaryText = ` R$ a partir de ${job.salary_min}`;
  } else if (job.salary_max) {
    salaryText = ` R$ até ${job.salary_max}`;
  }

  const companyName = job.company?.name ?? 'Remoto';
  const location = job.company?.headquarters ?? job.location ?? 'Remoto - Brasil';

  return {
    title: `${job.title} em ${companyName} | TrabalheRemotoBrasil`,
    description: `${job.title}${salaryText}. ${job.description?.slice(0, 120) || 'Vaga de tecnologia remota'}. Candidatar-se em ${companyName}.`,
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/vaga/${job.slug}`,
      siteName: 'TrabalheRemotoBrasil',
      title: `${job.title} em ${companyName}`,
      description: `${job.description?.slice(0, 160) || 'Vaga de tecnologia remota'}`,
      images: [
        {
          url: job.company?.logo_url ?? '/placeholder-logo.png',
          width: 500,
          height: 500,
          alt: companyName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${job.title} em ${companyName}`,
      description: `${job.description?.slice(0, 160) || 'Vaga de tecnologia remota'}`,
      images: [job.company?.logo_url ?? '/placeholder-logo.png'],
    },
  };
}
/* ============================================================
   Job Detail Page - Server Component
   ============================================================ */
export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const location = job.company?.headquarters ?? job.location ?? 'Remoto - Brasil';

  return (
    <div>
      <nav className="text-sm text-neutral-500" aria-label="Você está em">
</nav>

      {/* Header em cartão branco */}
      <article className="glass rounded-app-card p-8 shadow-app-card sm:p-12 border-b border-divider dark:border-white/10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
          <div>
            <Image
              src={job.company?.logo_url ?? '/placeholder-logo.png'}
              alt={job.company?.name ?? 'Empresa'}
              fill
              className="p-2"
            />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary sm:!tracking-0">
              {job.title}
            </h1>
            <p className="mt-1 text-lg text-secondary dark:text-neutral-400">
              {job.company?.name}
            </p>
            <p className="text-sm text-tertiary">
              {location}
            </p>
          </div>
        </div>

        {/* Chips de contrato, senioridade e modalidade */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent dark:bg-accent-light dark:text-accent-light">
            {job.contract_type}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {job.experience_level}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {job.location}
          </span>
        </div>
      </article>

      {/* Layout principal: 2 colunas */}
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Coluna principal (esquerda) */}
        <div className="lg:flex-1 lg:w-full lg:pr-8">
          <article className="rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-detail border border-divider dark:border-white/10">

            {/* Seção: Sobre a Vaga */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4">Sobre a vaga</h2>
              <p className="leading-relaxed text-secondary dark:text-neutral-400 mb-6">
                {job.description}
              </p>
            </section>
        ← Vagas / {job.company?.name ?? 'Empresa'} / {job.title}
      </nav>