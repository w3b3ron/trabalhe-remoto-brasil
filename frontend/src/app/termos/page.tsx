import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso — TrabalheRemotoBrasil',
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
      <p className="text-sm text-neutral-500">Última atualização: 31 de outubro de 2026</p>
      <p>
        Ao utilizar o TrabalheRemotoBrasil.com, você concorda em usar as vagas
        e informações fornecidas apenas para fins legítimos de busca de
        oportunidades de trabalho.
      </p>
      <p>
        Não nos responsabilizamos por a autenticidade de links externos ou
        informações fornecidas por empresas parceiras. Recomendações de
        cursos contêm links de afiliados que podem gerar comissão sobre
        compras feitas.
      </p>
    </div>
  );
}