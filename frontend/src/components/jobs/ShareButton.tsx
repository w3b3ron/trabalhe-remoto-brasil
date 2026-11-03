'use client';

import { useState } from 'react';

interface ShareButtonProps {
  title: string;
}

/** Compartilhar: usa a Web Share API quando existe; senão copia o link. */
export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Compartilhamento cancelado ou área de transferência indisponível: ignora.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="tap-target flex-1 rounded-full border border-neutral-300 bg-white px-4 text-[15px] font-semibold text-neutral-900 transition hover:bg-neutral-50 dark:border-white/20 dark:bg-transparent dark:text-neutral-100 dark:hover:bg-white/10"
    >
      {copied ? 'Link copiado' : 'Compartilhar'}
    </button>
  );
}
