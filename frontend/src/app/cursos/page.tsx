import { fetchRecommendedCourses } from '@/services/jobs';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Cursos — TrabalheRemotoBrasil',
};

export const revalidate = 300; // ISR: revalida a cada 5 min

export default async function CoursesPage() {
  const courses = await fetchRecommendedCourses();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Cursos <span className="text-accent">Recomendados</span>
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Cursos curados para elevar suas habilidades e conquistar vagas remotas.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="glass rounded-app-card p-12 text-center">
          <p>Nenhum curso disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="glass flex flex-col overflow-hidden rounded-app-card shadow-app-card"
            >
              <div className="relative h-48 w-full bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src={course.image_url ?? '/placeholder-course.png'}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-medium text-accent">
                  {course.provider}
                </span>
                <h3 className="mt-1 line-clamp-2 text-lg font-semibold">
                  {course.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold">
                      {course.price ? `R$ ${course.price}` : 'Grátis'}
                    </span>
                    {course.rating && (
                      <span className="ml-2 text-sm text-amber-500">
                        ★ {course.rating}
                      </span>
                    )}
                  </div>
                  <a
                    href={course.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
                  >
                    Ver curso →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}