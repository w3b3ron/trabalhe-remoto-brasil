import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchJobBySlug, fetchRecommendedCourses, fetchSimilarJobs } from '@/services/jobs';
import type { Metadata } from 'next';
import type { Job } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);
  if (!job) return { title: 'Vaga não encontrada | TrabalheRemotoBrasil' };

  const titulo = `${job.title} — ${job.company?.name ?? 'Remoto'} | TrabalheRemotoBrasil`;
  const descricao = job.description.slice(0, 160);

  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trabalhe-remoto-brasil.vercel.app'}/vaga/${job.slug}`,
    },
  };
}

// Formata a faixa salarial completa para a barra lateral
function formatSalaryRange(job: Job): string {
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: job.salary_currency || 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
  if (job.salary_min) return `a partir de ${fmt(job.salary_min)}`;
  if (job.salary_max) return `até ${fmt(job.salary_max)}`;
  return 'A combinar';
}

// Formata data relativa em pt-BR
function formatRelativeDate(dateString: string): string {
  if (!dateString) return 'recentemente';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'hoje';
  if (diffDays === 1) return 'há 1 dia';
  if (diffDays < 30) return `há ${diffDays} dias`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);
  if (!job) notFound();

  const [courses, similarJobs] = await Promise.all([
    fetchRecommendedCourses(job.tags),
    fetchSimilarJobs(job, 3),
  ]);

  const company = job.company;
  const logoUrl = company?.logo_url ?? '/brand/trabalheremoto_logo01.png';

  // JSON-LD schema.org/JobPosting
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.published_at || job.created_at,
    employmentType: job.contract_type,
    jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: { '@type': 'Country', name: 'Brasil' },
    hiringOrganization: {
      '@type': 'Organization',
      name: company?.name ?? 'Empresa',
      ...(company?.website ? { sameAs: company.website } : {}),
    },
    ...(job.salary_min || job.salary_max
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.salary_currency || 'BRL',
            value: {
              '@type': 'QuantitativeValue',
              ...(job.salary_min ? { minValue: job.salary_min } : {}),
              ...(job.salary_max ? { maxValue: job.salary_max } : {}),
              unitText: 'MONTH',
            },
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8">
      {/* JSON-LD para SEO / Google Jobs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Breadcrumb */}
      <nav aria-label="Você está em" className="mb-6 text-sm text-text-secondary">
        <Link href="/" className="hover:text-accent transition-colors">← Vagas</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        {company?.name && (
          <>
            <span>{company.name}</span>
            <span className="mx-2" aria-hidden="true">/</span>
          </>
        )}
        <span className="text-text-primary">{job.title}</span>
      </nav>

      {/* 2. Cabeçalho da vaga */}
      <header className="rounded-[28px] bg-surface-light p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[18px] bg-[#F0F0F3]">
            <Image
              src={logoUrl}
              alt={company?.name ?? 'Logo da empresa'}
              fill
              sizes="72px"
              className="object-contain p-2"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-text-secondary">{company?.name}</span>
              {job.is_featured && (
                <span className="rounded-full bg-[#FFF4E0] px-2.5 py-0.5 text-xs font-semibold text-[#8A5A00]">
                  Destaque
                </span>
              )}
              <span className="text-xs text-text-discreet">
                Publicada {formatRelativeDate(job.published_at || job.created_at)}
              </span>
            </div>
            <h1 className="mt-2 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-[-0.03em] text-text-primary">
              {job.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-[8px] bg-chip-contract-bg px-3 py-1 text-sm font-medium text-chip-contract-text">
                {job.contract_type}
              </span>
              <span className="rounded-[8px] bg-chip-neutral-bg px-3 py-1 text-sm font-medium text-chip-neutral-text">
                {job.experience_level}
              </span>
              <span className="rounded-[8px] bg-chip-modality-bg px-3 py-1 text-sm font-medium text-chip-modality-text">
                100% Remoto · Brasil
              </span>
            </div>
          </div>
        </div>
      </header>
{/* 3. Duas colunas: conteúdo principal + barra lateral */}
      <div className="mt-6 flex flex-wrap items-start gap-6">
        {/* Coluna principal */}
        <div className="min-w-0 flex-[2_1_560px] space-y-6">
          <article className="rounded-card bg-surface-light p-6 shadow-card sm:p-8">
            <h2 className="text-[22px] font-bold text-text-primary">Sobre a vaga</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-text-secondary">
              {job.description}
            </p>

            {/* Tecnologias e requisitos */}
            {(job.stack?.length || job.tags?.length) && (
              <>
                <h2 className="mt-8 text-[22px] font-bold text-text-primary">
                  Tecnologias e requisitos
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(job.stack?.length ? job.stack : job.tags).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-pill bg-chip-neutral-bg px-3 py-1.5 text-sm font-medium text-chip-neutral-text"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Responsabilidades */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <>
                <h2 className="mt-8 text-[22px] font-bold text-text-primary">Responsabilidades</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
                  {job.responsibilities.map((item) => (
                    <li key={item} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </>
            )}

            {/* Benefícios */}
            {job.benefits && job.benefits.length > 0 && (
              <>
                <h2 className="mt-8 text-[22px] font-bold text-text-primary">Benefícios</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.benefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="rounded-pill bg-chip-modality-bg px-3 py-1.5 text-sm font-medium text-chip-modality-text"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </>
            )}
          </article>

          {/* Sobre a empresa */}
          {company && (company.about || company.sector || company.size || company.headquarters) && (
            <article className="rounded-card bg-surface-light p-6 shadow-card sm:p-8">
              <h2 className="text-[22px] font-bold text-text-primary">
                Sobre a {company.name}
              </h2>
              {company.about && (
                <p className="mt-3 leading-relaxed text-text-secondary">{company.about}</p>
              )}
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {company.sector && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-text-discreet">Setor</dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">{company.sector}</dd>
                  </div>
                )}
                {company.size && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-text-discreet">Porte</dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">{company.size}</dd>
                  </div>
                )}
                {company.headquarters && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-text-discreet">Sede</dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">{company.headquarters}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/?empresa=${company.slug}`}
                  className="tap-target inline-flex items-center rounded-pill border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-[#F0F0F3]"
                >
                  Ver todas as vagas da {company.name}
                </Link>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target inline-flex items-center rounded-pill border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-[#F0F0F3]"
                  >
                    Site da empresa ↗
                  </a>
                )}
              </div>
            </article>
          )}
        </div>
{/* Barra lateral */}
        <aside className="w-full max-w-[420px] min-w-[280px] flex-[1_1_320px]">
          <div className="sticky top-24 rounded-card bg-surface-light p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-discreet">
              Faixa salarial
            </p>
            <p className="mt-1 text-[28px] font-extrabold tracking-tight text-text-primary">
              {formatSalaryRange(job)}
            </p>

            <dl className="mt-5 space-y-3 border-t border-divider pt-5">
              <div className="flex justify-between">
                <dt className="text-sm text-text-discreet">Contrato</dt>
                <dd className="text-sm font-medium text-text-primary">{job.contract_type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-text-discreet">Senioridade</dt>
                <dd className="text-sm font-medium text-text-primary">{job.experience_level}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-text-discreet">Modalidade</dt>
                <dd className="text-sm font-medium text-text-primary">100% remoto</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-text-discreet">Publicada em</dt>
                <dd className="text-sm font-medium text-text-primary">
                  {formatRelativeDate(job.published_at || job.created_at)}
                </dd>
              </div>
            </dl>

            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target mt-6 flex min-h-[44px] w-full items-center justify-center rounded-pill bg-accent px-6 text-base font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Candidatar-se no site da empresa ↗
            </a>
            <p className="mt-3 text-xs leading-relaxed text-text-discreet">
              Você será redirecionado para a página de carreiras da empresa para concluir a candidatura.
            </p>
          </div>
        </aside>
      </div>

      {/* 4. Vagas semelhantes */}
      {similarJobs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[22px] font-bold text-text-primary">Vagas semelhantes</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similarJobs.map((similar) => (
              <Link
                key={similar.id}
                href={`/vaga/${similar.slug}`}
                className="group flex items-start gap-3 rounded-card bg-surface-light p-4 shadow-card transition-shadow hover:shadow-md"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#F0F0F3]">
                  <Image
                    src={similar.company?.logo_url ?? '/brand/trabalheremoto_logo01.png'}
                    alt={similar.company?.name ?? 'Logo da empresa'}
                    fill
                    sizes="40px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-semibold leading-snug text-text-primary group-hover:text-accent">
                    {similar.title}
                  </h3>
                  <p className="mt-1 text-xs text-text-discreet">
                    {[
                      similar.company?.name,
                      similar.contract_type,
                      similar.experience_level,
                      similar.salary_min && similar.salary_max
                        ? formatSalaryRange(similar)
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Cursos recomendados (monetização por afiliados) */}
      {courses.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[22px] font-bold text-text-primary">Cursos recomendados para esta vaga</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <div key={course.id} className="flex flex-col gap-3 rounded-card bg-surface-light p-4 shadow-card">
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-[#F0F0F3]">
                  <Image
                    src={course.image_url ?? '/brand/trabalheremoto_logo01.png'}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="line-clamp-2 font-semibold text-text-primary">{course.title}</h3>
                  <p className="text-sm text-text-discreet">{course.provider}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-accent">
                      {course.price ? `R$ ${course.price}` : 'Grátis'}
                    </span>
                    <a
                      href={course.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tap-target rounded-pill bg-accent/10 px-4 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                    >
                      Ver curso
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}