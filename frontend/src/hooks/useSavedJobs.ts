// ============================================================
// Hook para gerenciar vagas salvas no localStorage
// Protegido contra erros de hidratação (SSR)
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'trb:saved-jobs';

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Ler do localStorage apenas após montagem (evita mismatch SSR)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedIds(parsed);
        }
      }
    } catch {
      // Ignora erros de parsing
    }
    setMounted(true);
  }, []);

  const isSaved = useCallback((jobId: string) => {
    return savedIds.includes(jobId);
  }, [savedIds]);

  const toggleSave = useCallback((jobId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignora erros de storage (quota exceeded, etc.)
      }
      return next;
    });
  }, []);

  // Retorna null durante SSR para evitar mismatch
  if (!mounted) {
    return {
      savedIds: [],
      isSaved: () => false,
      toggleSave: () => {},
      mounted: false,
    };
  }

  return { savedIds, isSaved, toggleSave, mounted: true };
}