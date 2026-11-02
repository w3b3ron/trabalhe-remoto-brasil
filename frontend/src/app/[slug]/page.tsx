export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);

  if (!job) {
    return {
      title: 'Vaga não encontrada',
      description: 'Vaga não encontrada',
    };
  }

  let salaryText = '';
  if (job.salary_min && job.salary_max) {
    salaryText = ' R$ ' + job.salary_min + ' – R$ ' + job.salary_max;
  } else if (job.salary_min) {
    salaryText = ' R$ a partir de ' + job.salary_min;
  } else if (job.salary_max) {
    salaryText = ' R$ até ' + job.salary_max;
  }

  const companyName = job.company?.name ?? 'Remoto';
  const location = job.company?.headquarters ?? job.location ?? 'Remoto - Brasil';

  return {
    title: job.title + ' em ' + companyName + ' | TrabalheRemotoBrasil',
    description: job.title + salaryText + '. ' + (job.description?.slice(0, 120) || 'Vaga de tecnologia remota') + '. Candidatar-se em ' + companyName + '.',
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000') + '/vaga/' + job.slug,
      siteName: 'TrabalheRemotoBrasil',
      title: job.title + ' em ' + companyName,
      description: job.description?.slice(0, 160) || 'Vaga de tecnologia remota',
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
      title: job.title + ' em ' + companyName,
      description: job.description?.slice(0, 160) || 'Vaga de tecnologia remota',
      images: [job.company?.logo_url ?? '/placeholder-logo.png'],
    },
  };
}
export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const location = job.company?.headquarters ?? job.location ?? 'Remoto - Brasil';

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className='text-sm text-neutral-500' aria-label='Você está em'>
        ← Vagas / {job.company?.name ?? 'Empresa'} / {job.title}
      </nav>

      {/* Header em cartão branco */}
      <article className='glass rounded-app-card p-8 shadow-app-card sm:p-12 border-b border-divider dark:border-white/10'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start'>
          <div>
            <Image
              src={job.company?.logo_url ?? '/placeholder-logo.png'}
              alt={job.company?.name ?? 'Empresa'}
              fill
              className='p-2'
            />
          </div>

          <div>
            <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-primary sm:!tracking-0'>
              {job.title}
            </h1>
            <p className='mt-1 text-lg text-secondary dark:text-neutral-400'>
              {job.company?.name}
            </p>
            <p className='text-sm text-tertiary'>
              {location}
            </p>
          </div>
        </div>

        {/* Chips de contrato, senioridade e modalidade */}
        <div className='mt-4 flex flex-wrap gap-2'>
          <span className='rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent dark:bg-accent-light dark:text-accent-light'>
            {job.contract_type}
          </span>
          <span className='rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'>
            {job.experience_level}
          </span>
          <span className='rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'>
            {job.location}
          </span>
        </div>
      </article>
      {/* Layout principal: 2 colunas */}
      <div className='space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Coluna principal (esquerda) */}
        <div className='lg:flex-1 lg:w-full lg:pr-8'>
          <article className='rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-detail border border-divider dark:border-white/10'>

            {/* Seção: Sobre a Vaga */}
            <section className='mb-8'>
              <h2 className='text-2xl font-bold text-primary mb-4'>Sobre a vaga</h2>
              <p className='leading-relaxed text-secondary dark:text-neutral-400 mb-6'>
                {job.description}
              </p>
            </section>

            {/* Tecnologias e requisitos */}
            {job.stack && job.stack.length > 0 && (
              <section className='mb-8'>
                <h3 className='text-sm text-tertiary uppercase tracking-wider mb-3'>Tecnologias e requisitos</h3>
                <div className='grid grid-cols-2 gap-2'>
                  {job.stack.map((tech) => (
                    <span key={tech} className='rounded-pill bg-chip-neutral text-chip-neutral px-3 py-1 text-xs font-medium'>
                      {tech}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Responsibilities (se houver dados) */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <section className='mb-8'>
                <h3 className='text-sm text-tertiary uppercase tracking-wider mb-3'>Responsabilidades</h3>
                <ul className='space-y-2 text-secondary dark:text-neutral-400'>
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className='flex items-start'>
                      <svg
                        className='mt-1 flex-shrink-0 w-4 h-4 text-tertiary'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth={2}
                        aria-hidden='true'
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
                      </svg>
                      <span className='ml-2'>{resp}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Benefits (chips, só se houver dados) */}
            {job.benefits && job.benefits.length > 0 && (
              <section className='mb-8'>
                <h3 className='text-sm text-tertiary uppercase tracking-wider mb-3'>Benefícios</h3>
                <div className='grid grid-cols-2 gap-2'>
                  {job.benefits.map((benefit) => (
                    <span key={benefit} className='rounded-pill bg-chip-neutral text-chip-neutral px-3 py-1 text-xs font-medium'>
                      {benefit}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Sobre a Empresa */}
            {job.company && (job.company.about || job.company.sector || job.company.size || job.company.headquarters) && (
              <section>
                <h2 className='text-2xl font-bold text-primary mb-4'>Sobre a {job.company.name}</h2>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {job.company.sector && (
                    <div className='rounded-lg bg-neutral-50 dark:bg-neutral-900/50 p-4'>
                      <p className='text-sm text-tertiary'>Setor</p>
                      <p className='text-lg font-medium text-primary'>{job.company.sector}</p>
                    </div>
                  )}

                  {job.company.size && (
                    <div className='rounded-lg bg-neutral-50 dark:bg-neutral-900/50 p-4'>
                      <p className='text-sm text-tertiary'>Porte</p>
                      <p className='text-lg font-medium text-primary'>{job.company.size}</p>
                    </div>
                  )}

                  {job.company.headquarters && (
                    <div className='rounded-lg bg-neutral-50 dark:bg-neutral-900/50 p-4'>
                      <p className='text-sm text-tertiary'>Sede</p>
                      <p className='text-lg font-medium text-primary'>{job.company.headquarters}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Ações: Candidatar-se */}
            <div className='mt-8 pt-8 border-t border-divider dark:border-white/10'>
              <a
                href={job.apply_url}
                target='_blank'
                rel='noopener noreferrer'
                className='tap-target w-full inline-flex items-center justify-center rounded-full bg-accent text-white py-3 rounded-pill text-base font-medium text-white transition hover:bg-accent-hover'
              >
                Candidatar-se no site da empresa ↗
              </a>
              <p className='mt-3 text-xs text-tertiary dark:text-neutral-400'>
                Você será redirecionado para a página de carreiras da empresa para concluir a candidatura.
              </p>
            </div>
          </article>
        </div>
        {/* Barra Lateral (direita) - 320px máximo */}
        <aside className='lg:w-320px lg:ml-8' aria-labelledby='salary-label'>
          <div className='rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 p-6 border border-divider dark:border-white/10'>
            <p className='text-sm text-tertiary mb-4' id='salary-label'>FAIXA SALARIAL</p>
            <p className='text-3xl font-bold text-primary'>
              {job.salary_min && job.salary_max
                ? new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: job.salary_currency || 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(job.salary_max)
                : 'A negociar'}
            </p>

            {/* Dados contratuais */}
            <dl className='space-y-4 text-sm'>
              <dt className='font-medium text-tertiary'>Contrato</dt>
              <dd className='text-primary'>{job.contract_type}</dd>

              <dt className='font-medium text-tertiary'>Senioridade</dt>
              <dd className='text-primary'>{job.experience_level}</dd>

              <dt className='font-medium text-tertiary'>Modalidade</dt>
              <dd className='text-primary'>100% Remoto</dd>

              <dt className='font-medium text-tertiary'>Publicada em</dt>
              <dd className='text-primary'>
                {job.published_at
                  ? new Date(job.published_at).toLocaleDateString('pt-BR')
                  : 'Data não informada'}
              </dd>
            </dl>

            {/* Botão Candidatar */}
            <button
              className='w-full bg-accent text-white py-3 rounded-pill mt-6 text-base font-medium transition hover:bg-accent-hover'
              onClick={() => {
                window.open(job.apply_url, '_blank');
              }}
            >
              Candidatar-se no site da empresa ↗
            </button>

            {/* Nota sobre candidatura */}
            <p className='mt-4 text-xs text-tertiary dark:text-neutral-400'>
              Você será redirecionado para a página de carreiras da empresa para concluir a candidatura.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}