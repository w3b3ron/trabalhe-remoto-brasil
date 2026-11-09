import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Área Administrativa</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Gerencie cursos, produtos e links de afiliado da plataforma.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/admin/login"
              className="px-4 py-2 border border-accent rounded-md text-sm font-medium text-accent hover:bg-accent hover:text-white transition-colors"
            >
              Voltar ao Login
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/admin/cursos"
            className="glass p-6 rounded-xl border border-black/5 hover:bg-white/50 dark:hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-accent transition-colors">
                  Cursos
                </h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Cadastrar, editar e listar cursos com links de afiliado
                </p>
              </div>
              <Link
                href="/admin/cursos"
                className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110"
              >
                →
              </Link>
            </div>
          </a>

          <a
            href="/admin/produtos"
            className="glass p-6 rounded-xl border border-black/5 hover:bg-white/50 dark:hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-accent transition-colors">
                  Produtos
                </h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Cadastrar, editar e listar produtos com links de afiliado
                </p>
              </div>
              <Link
                href="/admin/produtos"
                className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110"
              >
                →
              </Link>
            </div>
          </a>
        </div>

        <div className="mt-12 p-6 rounded-xl border border-black/10 bg-white/50 dark:bg-white/5">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Sobre esta área</h3>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2 list-disc pl-5">
            <li>Use <strong>Cursos</strong> para gerenciar links de afiliado de cursos recomendados.</li>
            <li>Use <strong>Produtos</strong> para gerenciar links de afiliado da loja virtual.</li>
            <li>Apenas o proprietário da plataforma pode acessar esta área.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}