import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade — TrabalheRemotoBrasil',
};

export const revalidate = 86400; // ISR: revalida a cada 24h

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Política de Privacidade
      </h1>
      <p className="text-sm text-neutral-500">Última atualização: 31 de outubro de 2026</p>
      <p>
        Respeitamos sua privacidade. Coletamos apenas dados necessários para
        fornecer os serviços de busca de vagas e recomendação de cursos.
        Nunca vendemos dados pessoais a terceiros.
      </p>
      <p>
        Utilizamos cookies estritamente essenciais para manter preferências de
        tema (claro/escuro) e sessão do usuário. Não rastreamos comportamento
        para publicidade direcionada.
      </p>
    </div>
  );
}