import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre — TrabalheRemotoBrasil',
};

export const revalidate = 3600; // ISR: revalida a cada 1 hora

export default function AboutPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Sobre o <span className="text-accent">TrabalheRemotoBrasil</span>
      </h1>
      <p className="text-lg text-neutral-600 dark:text-neutral-400">
        Somos uma plataforma dedicada a conectar talentosos profissionais
        brasileiros às melhores oportunidades de trabalho 100% remoto.
      </p>
      <p>
        Nascemos da necessidade real de centralizar, filtrar e recomendar vagas
        remoto-friendly em um mercado fragmentado. Hoje, milhares de
        profissionais confiam em nós para dar o próximo passo em suas
        carreiras.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <div>
          <p className="text-3xl font-bold text-accent">5.000+</p>
          <p className="text-sm text-neutral-500">Vagas atualizadas</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-accent">300+</p>
          <p className="text-sm text-neutral-500">Empresas</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-accent">98%</p>
          <p className="text-sm text-neutral-500">Precisão dos filtros</p>
        </div>
      </div>
    </div>
  );
}