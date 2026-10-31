import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchJobBySlug, fetchRecommendedCourses } from '@/services/jobs';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);
  if (!job) return { title: 'Vaga não encontrada' };

  return {
    title: `${job.title} em ${job.company?.name ?? 'Remoto'}`,
    description: job.description.slice(0, 160),
    openGraph: {
      title: job.title,
      description: job.description.slice(0, 160),
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/vaga/${job.slug}`,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);
  if (!job) notFound();

  const courses = await fetchRecommendedCourses(job.tags);

  const fmtSalary = (v: number | null) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: job.salary_currency || 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v!);

  return (
    <div className="space-y-8">
      <nav className="text-sm text-neutral-500">
        <Link href="/" className="hover:text-accent">Início</Link>{' / '}
        <span className="text-neutral-700 dark:text-neutral-300">{job.title}</span>
      </nav>

      <article className="glass rounded-app-card p-6 shadow-app-card sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <Image
              src={job.company?.logo_url ?? '/placeholder-logo.png'}
              alt={job.company?.name ?? 'Empresa'}
              fill
              sizes="80px"
              className="object-contain p-2"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="mt-1 text-lg text-neutral-600 dark:text-neutral-400">{job.company?.name}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">{job.contract_type}</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{job.experience_level}</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{job.location}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-black/5 pt-6 dark:border-white/10">
          <h2 className="text-lg font-semibold">Sobre a vaga</h2>
          <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">{job.description}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-6 dark:border-white/10">
          <div>
            <p className="text-sm text-neutral-500">Faixa salarial</p>
            <p className="text-xl font-bold text-accent">
              {job.salary_min && job.salary_max
                ? `${fmtSalary(job.salary_min)} – ${fmtSalary(job.salary_max)}`
                : 'Salário a negociar'}
            </p>
          </div>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-medium text-white transition hover:bg-accent-hover"
          >
            Aplicar agora →
          </a>
        </div>
      </article>

      {courses.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold">Cursos Recomendados</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <div key={course.id} className="glass flex flex-col gap-3 rounded-app-card p-4 shadow-app-card">
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={course.image_url ?? '/placeholder-course.png'}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="line-clamp-2 font-semibold">{course.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{course.provider}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-accent">{course.price ? `R$ ${course.price}` : 'Grátis'}</span>
                    <a
                      href={course.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tap-target rounded-full bg-accent/10 px-4 py-2 text-xs font-medium text-accent transition hover:bg-accent/20"
                    >
                      Ver curso →
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