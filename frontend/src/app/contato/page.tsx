import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contato — TrabalheRemotoBrasil',
};

export const revalidate = 3600; // ISR: revalida a cada 1 hora

export default function ContactPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Contato
      </h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Tem uma sugestão, parceria ou precisa de ajuda?
      </p>
      <a
        href="mailto:contato@trabalheremotobrasil.com"
        className="tap-target inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-medium text-white transition hover:bg-accent-hover"
      >
        contato@trabalheremotobrasil.com
      </a>
    </div>
  );
}