'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'trb:saved-jobs';

function readSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage indisponível (modo privado, dados bloqueados): ignora.
  }
}

interface SaveJobButtonProps {
  jobId: string;
  jobTitle: string;
}

/**
 * Botão "Salvar vaga" (sem login): guarda os ids em localStorage.
 * O estado só é lido após a montagem para evitar erro de hidratação.
 */
export function SaveJobButton({ jobId, jobTitle }: SaveJobButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(jobId));
  }, [jobId]);

  const toggle = () => {
    const ids = readSaved();
    const next = ids.includes(jobId)
      ? ids.filter((id) => id !== jobId)
      : [...ids, jobId];
    writeSaved(next);
    setSaved(next.includes(jobId));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remover dos salvos: ${jobTitle}` : `Salvar vaga ${jobTitle}`}
      className="tap-target flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 transition hover:bg-neutral-50 dark:border-white/20 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-white/10"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 3h12v18l-6-4-6 4z" />
      </svg>
    </button>
  );
}
