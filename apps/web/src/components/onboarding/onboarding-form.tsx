'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { completeOnboarding, type OnboardingPayload } from '@/actions/profiles';
import { tokens } from '@doendeverde/ui';

type OnboardingFormProps = {
  suggestedUsername: string;
  defaultPersona: OnboardingPayload['persona'];
};

const personaOptions: Array<{ label: OnboardingPayload['persona']; description: string }> = [
  { label: 'Cultivador', description: 'Manja de grow e quer compartilhar as melhores genéticas.' },
  { label: 'Curioso', description: 'Está chegando agora e quer aprender com a galera.' },
  { label: 'Viajado', description: 'Ama cultura, memes e histórias chapantes.' },
  { label: 'Guardião', description: 'Quer ajudar a moderar e manter a brisa saudável.' }
];

const avatarOptions = ['🌿', '🍄', '🔥', '🧠', '🌀', '🛸'];

export function OnboardingForm({ suggestedUsername, defaultPersona }: OnboardingFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(suggestedUsername);
  const [persona, setPersona] = useState<OnboardingPayload['persona']>(defaultPersona);
  const [avatar, setAvatar] = useState<string | null>(avatarOptions[0]);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const usernameSuggestions = useMemo(
    () => [suggestedUsername, `${persona.toLowerCase()}_${Math.floor(Math.random() * 999)}`],
    [persona, suggestedUsername]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload: OnboardingPayload = {
      username,
      avatarUrl: avatar ? `emoji:${avatar}` : null,
      persona,
      anonymousMode
    };

    startTransition(async () => {
      try {
        await completeOnboarding(payload);
        router.replace(`/perfil/${payload.username}`);
        router.refresh();
      } catch (submissionError) {
        if (submissionError instanceof Error) {
          setError(submissionError.message);
        } else {
          setError('Não foi possível concluir o onboarding. Tente novamente.');
        }
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: tokens.spacing.xl,
        background: 'rgba(4, 22, 16, 0.85)',
        borderRadius: tokens.radii.lg,
        border: `1px solid ${tokens.colors.border}`,
        display: 'grid',
        gap: tokens.spacing.lg
      }}
    >
      <header style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: tokens.typography.fontFamily.display,
            fontSize: tokens.typography.size['2xl'],
            marginBottom: tokens.spacing.sm
          }}
        >
          Quem é você na brisa?
        </h1>
        <p style={{ margin: 0, color: tokens.colors.muted }}>
          Personalize seu codinome e escolha como o Doende Verde vai te apresentar para a comunidade.
        </p>
      </header>

      <section>
        <label
          htmlFor="username"
          style={{
            display: 'block',
            marginBottom: tokens.spacing.xs,
            fontWeight: 600
          }}
        >
          Codinome
        </label>
        <input
          id="username"
          name="username"
          value={username}
          onChange={event => setUsername(event.target.value)}
          placeholder="ex: BrisadoLendario"
          required
          minLength={3}
          style={{
            width: '100%',
            padding: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            border: `1px solid ${tokens.colors.border}`,
            background: 'rgba(11, 61, 46, 0.35)',
            color: tokens.colors.surface
          }}
        />
        <div style={{ marginTop: tokens.spacing.sm, display: 'flex', gap: tokens.spacing.sm }}>
          {usernameSuggestions.map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setUsername(suggestion)}
              style={{
                padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                borderRadius: tokens.radii.pill,
                border: 'none',
                cursor: 'pointer',
                background:
                  suggestion === username ? tokens.gradients.cta : 'rgba(28, 67, 54, 0.6)',
                color: tokens.colors.surface
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2
          style={{
            fontFamily: tokens.typography.fontFamily.display,
            fontSize: tokens.typography.size.lg,
            marginBottom: tokens.spacing.sm
          }}
        >
          Escolha seu avatar
        </h2>
        <div style={{ display: 'flex', gap: tokens.spacing.sm, flexWrap: 'wrap' }}>
          {avatarOptions.map(choice => (
            <button
              key={choice}
              type="button"
              onClick={() => setAvatar(choice)}
              style={{
                width: 56,
                height: 56,
                borderRadius: tokens.radii.lg,
                border: choice === avatar ? `2px solid ${tokens.colors.primaryAccent}` : '1px solid transparent',
                fontSize: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(28, 67, 54, 0.6)',
                cursor: 'pointer'
              }}
            >
              <span aria-hidden>{choice}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2
          style={{
            fontFamily: tokens.typography.fontFamily.display,
            fontSize: tokens.typography.size.lg,
            marginBottom: tokens.spacing.sm
          }}
        >
          Seu vibe
        </h2>
        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          {personaOptions.map(option => (
            <label
              key={option.label}
              style={{
                padding: tokens.spacing.sm,
                borderRadius: tokens.radii.md,
                border: option.label === persona ? `1px solid ${tokens.colors.primaryAccent}` : `1px solid ${tokens.colors.border}`,
                background: option.label === persona ? 'rgba(17, 94, 72, 0.45)' : 'transparent',
                cursor: 'pointer',
                display: 'grid',
                gap: tokens.spacing.xs
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm }}>
                <input
                  type="radio"
                  name="persona"
                  value={option.label}
                  checked={persona === option.label}
                  onChange={() => setPersona(option.label)}
                  style={{ accentColor: tokens.colors.primaryAccent }}
                />
                <strong>{option.label}</strong>
              </div>
              <span style={{ color: tokens.colors.muted }}>{option.description}</span>
            </label>
          ))}
        </div>
      </section>

      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          padding: tokens.spacing.sm,
          borderRadius: tokens.radii.md,
          border: `1px solid ${tokens.colors.border}`
        }}
      >
        <input
          id="anonymous"
          type="checkbox"
          checked={anonymousMode}
          onChange={event => setAnonymousMode(event.target.checked)}
          style={{ accentColor: tokens.colors.primaryAccent }}
        />
        <label htmlFor="anonymous" style={{ margin: 0 }}>
          Ativar modo anônimo (você pode mudar depois nas configurações)
        </label>
      </section>

      {error ? (
        <p
          role="alert"
          style={{
            padding: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            background: 'rgba(166, 99, 54, 0.25)',
            border: `1px solid ${tokens.colors.secondary}`,
            margin: 0
          }}
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
          borderRadius: tokens.radii.pill,
          border: 'none',
          cursor: isPending ? 'wait' : 'pointer',
          background: tokens.gradients.cta,
          color: tokens.colors.surface,
          fontWeight: 600,
          fontSize: tokens.typography.size.md,
          display: 'inline-flex',
          justifyContent: 'center'
        }}
      >
        {isPending ? 'Salvando...' : 'Concluir e entrar no hub'}
      </button>
    </form>
  );
}
