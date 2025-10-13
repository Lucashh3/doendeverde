'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { tokens } from '@doendeverde/ui';

import type { GamificationDiff } from '@/lib/gamification/snapshot';

type ToastPayload = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type ToastContextValue = {
  notifyGamification: (diff?: GamificationDiff | null) => void;
};

const GamificationToastContext = createContext<ToastContextValue | null>(null);

const BADGE_META: Record<
  string,
  {
    title: string;
    description: string;
    icon: string;
  }
> = {
  'primeira-colheita': {
    title: 'Primeira Colheita',
    description: 'Seu primeiro post floresceu na comunidade.',
    icon: '🌾'
  },
  'brisado-lendario': {
    title: 'Brisado Lendário',
    description: '100 posts que deixaram todo mundo em outra dimensão.',
    icon: '✨'
  },
  'cultivador-indoor': {
    title: 'Cultivador Indoor',
    description: 'Compartilhou um tesouro de técnicas de cultivo indoor.',
    icon: '🏠'
  },
  'curioso-iluminado': {
    title: 'Curioso Iluminado',
    description: 'Fez 10 perguntas que acenderam boas conversas.',
    icon: '💡'
  }
};

const TOAST_DURATION = 6000;

export function GamificationToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    const timeoutId = timeoutsRef.current[id];
    if (timeoutId) {
      clearTimeout(timeoutId);
      delete timeoutsRef.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (toast: ToastPayload) => {
      setToasts(prev => [...prev, toast]);
      const timeoutId = setTimeout(() => dismiss(toast.id), TOAST_DURATION);
      timeoutsRef.current[toast.id] = timeoutId;
    },
    [dismiss]
  );

  const notifyGamification = useCallback(
    (diff?: GamificationDiff | null) => {
      if (!diff) {
        return;
      }

      if (diff.leveledUp) {
        pushToast({
          id: `level-${diff.newLevel}-${Date.now()}`,
          title: `Você agora é ${diff.newLevel}!`,
          description: `Parabéns pela subida de nível. Total de ${diff.currentXp} XP acumulados.`,
          icon: '🚀'
        });
      }

      diff.newBadges.forEach((code, index) => {
        const meta =
          BADGE_META[code] ?? {
            title: code,
            description: 'Nova conquista desbloqueada!',
            icon: '🏅'
          };
        pushToast({
          id: `badge-${code}-${Date.now()}-${index}`,
          title: meta.title,
          description: meta.description,
          icon: meta.icon
        });
      });
    },
    [pushToast]
  );

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(timeoutId => clearTimeout(timeoutId));
      timeoutsRef.current = {};
    };
  }, []);

  return (
    <GamificationToastContext.Provider value={{ notifyGamification }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          top: tokens.spacing.xl,
          right: tokens.spacing.xl,
          display: 'grid',
          gap: tokens.spacing.sm,
          maxWidth: '320px',
          zIndex: 50
        }}
      >
        {toasts.map(toast => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismiss(toast.id)}
            style={{
              border: 'none',
              borderRadius: '20px',
              background: 'rgba(22, 64, 49, 0.95)',
              padding: tokens.spacing.md,
              display: 'flex',
              gap: tokens.spacing.sm,
              alignItems: 'flex-start',
              cursor: 'pointer',
              textAlign: 'left',
              color: tokens.colors.surface,
              boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)'
            }}
          >
            <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{toast.icon}</span>
            <span style={{ display: 'grid', gap: tokens.spacing.xs }}>
              <strong style={{ fontSize: '1.05rem', fontWeight: 700 }}>{toast.title}</strong>
              <span style={{ fontSize: '0.9rem', color: tokens.colors.muted }}>{toast.description}</span>
              <span
                style={{
                  height: '3px',
                  background: tokens.gradients.cta,
                  borderRadius: '999px',
                  marginTop: tokens.spacing.xs
                }}
              />
            </span>
          </button>
        ))}
      </div>
    </GamificationToastContext.Provider>
  );
}

export function useGamificationToasts() {
  const context = useContext(GamificationToastContext);
  if (!context) {
    throw new Error('useGamificationToasts deve ser usado dentro de GamificationToastProvider');
  }
  return context.notifyGamification;
}
