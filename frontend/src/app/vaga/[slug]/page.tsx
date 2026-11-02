import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  fetchJobBySlug,
  fetchRecommendedCourses,
  fetchSimilarJobs,
} from '@/services/jobs';
import { JobDetail } from '@/components/jobs/JobDetail';
import type { Job } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);
  if (!job) return { title: 'Vaga não encontrada' };

  const company = job.company?.name ?? 'Remoto';
  const description = job.description.slice(0, 160);

  return {
    title: `${job.title} — ${company}`,
    description,
    openGraph: {
      title: `${job.title} — ${company}`,
      description,
      url: `${SITE_URL}/vaga/${job.slug}`,
    },
  };
}

const EMPLOYMENT_TYPE: Record<string, string> = {
  CLT: 'FULL_TIME',
  PJ: 'CONTRACTOR',
  Freelance: 'CONTRACTOR',
};

/** Dados estruturados schema.org/JobPosting (vaga remota no Brasil). */
function buildJobPostingJsonLd(job: Job) {
  const hasSalary = Boolean(job.salary_min || job.salary_max);
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.published_at,
    employmentType: EMPLOYMENT_TYPE[job.contract_type],
    directApply: false,
    url: `${SITE_URL}/vaga/${job.slug}`,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company?.name,
      sameAs: job.company?.website ?? undefined,
      logo: job.company?.logo_url ?? undefined,
    },
    jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: { '@type': 'Country', name: 'Brasil' },
    baseSalary: hasSalary
      ? {
          '@type': 'MonetaryAmount',
          currency: job.salary_currency || 'BRL',
          value: {
            '@type': 'QuantitativeValue',
            minValue: job.salary_min ?? undefined,
            maxValue: job.salary_max ?? undefined,
            unitText: 'MONTH',
          },
        }
      : undefined,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);
  if (!job) notFound();

  const [courses, similarJobs] = await Promise.all([
    fetchRecommendedCourses(job.tags),
    fetchSimilarJobs(job, 3),
  ]);

  // "<" escapado para o JSON nunca fechar a tag <script>.
  const jsonLd = JSON.stringify(buildJobPostingJsonLd(job)).replace(/</g, '\\u003c');

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <JobDetail job={job} similarJobs={similarJobs} />

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
