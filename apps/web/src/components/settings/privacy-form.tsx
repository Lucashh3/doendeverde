'use client';

import { useState, useTransition } from 'react';

import { updatePrivacySettings, type PrivacySettingsPayload } from '@/actions/profiles';
import { tokens } from '@doendeverde/ui';

type ToggleKey = keyof PrivacySettingsPayload;

type PrivacySettingsProps = {
  username: string;
  defaultValues: PrivacySettingsPayload;
};

type ToggleConfig = {
  key: ToggleKey;
  title: string;
  description: string;
};

const toggleConfig: ToggleConfig[] = [
  {
    key: 'pseudonymous',
    title: 'Modo anônimo',
    description: 'Nosso padrão: seu codinome aparece no feed e seu nome real fica oculto.'
  },
  {
    key: 'shareActivity',
    title: 'Mostrar atividades no feed',
    description: 'Permita que sua participação apareça em destaques e no Hall da Brisa.'
  },
  {
    key: 'emailNotifications',
    title: 'Receber notificações por e-mail',
    description: 'Seja avisado sobre respostas, badges conquistadas e novidades da comunidade.'
  }
];

export function PrivacySettingsForm({ username, defaultValues }: PrivacySettingsProps) {
  const [formValues, setFormValues] = useState<PrivacySettingsPayload>(defaultValues);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggle = (key: ToggleKey) => {
    setFormValues(current => ({ ...current, [key]: !current[key] }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        await updatePrivacySettings(formValues);
        setMessage({
          type: 'success',
          text: 'Preferências atualizadas com sucesso.'
        });
      } catch (error) {
        console.error('[PrivacySettingsForm] update error', error);
        setMessage({
          type: 'error',
          text: 'Não foi possível salvar suas preferências agora. Tente novamente.'
        });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        maxWidth: 640,
        display: 'grid',
        gap: tokens.spacing.lg,
        padding: tokens.spacing.xl,
        borderRadius: '24px',
        border: `1px solid ${tokens.colors.border}`,
        background: 'rgba(5, 28, 20, 0.85)'
      }}
    >
      <header style={{ display: 'grid', gap: tokens.spacing.xs }}>
        <p style={{ margin: 0, color: tokens.colors.muted, fontSize: tokens.typography.size.sm }}>
          Configurações para @{username}
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontFamily.display,
            fontSize: tokens.typography.size.xl
          }}
        >
          Privacidade & Segurança
        </h1>
        <p style={{ margin: 0, color: tokens.colors.muted }}>
          Ajuste como o Doende Verde exibe suas atividades. Você pode revisar suas escolhas a qualquer momento.
        </p>
      </header>

      <section style={{ display: 'grid', gap: tokens.spacing.md }}>
        {toggleConfig.map(toggle => (
          <label
            key={toggle.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: tokens.spacing.md,
              padding: tokens.spacing.md,
              borderRadius: tokens.radii.md,
              border: `1px solid ${tokens.colors.border}`,
              background: 'rgba(11, 61, 46, 0.4)'
            }}
          >
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: tokens.spacing.xs }}>{toggle.title}</strong>
              <span style={{ color: tokens.colors.muted, fontSize: tokens.typography.size.sm }}>
                {toggle.description}
              </span>
            </div>
            <input
              type="checkbox"
              checked={formValues[toggle.key]}
              onChange={() => handleToggle(toggle.key)}
              style={{ width: 24, height: 24 }}
            />
          </label>
        ))}
      </section>

      {message ? (
        <p
          role="status"
          style={{
            margin: 0,
            padding: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            border:
              message.type === 'success'
                ? `1px solid ${tokens.colors.primaryAccent}`
                : `1px solid ${tokens.colors.secondary}`,
            background:
              message.type === 'success'
                ? 'rgba(46, 204, 113, 0.15)'
                : 'rgba(165, 99, 54, 0.2)'
          }}
        >
          {message.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        style={{
          border: 'none',
          borderRadius: tokens.radii.pill,
          background: tokens.gradients.cta,
          color: tokens.colors.surface,
          padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
          fontWeight: 600,
          cursor: isPending ? 'wait' : 'pointer'
        }}
      >
        {isPending ? 'Salvando...' : 'Salvar preferências'}
      </button>
    </form>
  );
}
