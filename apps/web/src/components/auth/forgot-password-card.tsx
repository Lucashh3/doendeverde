'use client';

import { useState } from 'react';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { tokens } from '@doendeverde/ui';

type MessageState = { type: 'success' | 'error'; text: string } | null;

export function ForgotPasswordCard() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const supabase = getSupabaseBrowserClient();

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!email) {
      setMessage({ type: 'error', text: 'Digite seu e-mail para continuar.' });
      setIsLoading(false);
      return;
    }

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?action=reset-password`
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Enviamos instruções para redefinir sua senha. Verifique sua caixa de entrada!'
      });
      setEmail('');
    } catch (authError: any) {
      console.error('[ForgotPasswordCard] reset password error', authError);
      let errorMessage = 'Erro ao enviar e-mail de recuperação. Tente novamente.';

      if (authError.message?.includes('not found') || authError.message?.includes('Invalid login credentials')) {
        errorMessage = 'Este e-mail não está cadastrado em nossa plataforma.';
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        padding: tokens.spacing.xl,
        borderRadius: tokens.radii.lg,
        border: `1px solid ${tokens.colors.border}`,
        background: 'rgba(7, 33, 24, 0.85)',
        display: 'grid',
        gap: tokens.spacing.lg
      }}
    >
      <header style={{ textAlign: 'center', display: 'grid', gap: tokens.spacing.sm }}>
        <h1
          style={{
            fontFamily: tokens.typography.fontFamily.display,
            fontSize: tokens.typography.size.xl,
            margin: 0
          }}
        >
          Recuperar senha
        </h1>
        <p style={{ margin: 0, color: tokens.colors.muted }}>
          Digite seu e-mail e enviaremos instruções para criar uma nova senha
        </p>
      </header>

      <form
        onSubmit={handlePasswordReset}
        style={{ display: 'grid', gap: tokens.spacing.lg }}
      >
        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <label htmlFor="email" style={{ textAlign: 'left', fontWeight: 500 }}>
            E-mail cadastrado
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="voce@email.com"
            style={{
              padding: tokens.spacing.sm,
              borderRadius: tokens.radii.md,
              border: `1px solid ${tokens.colors.border}`,
              background: 'rgba(11, 61, 46, 0.35)',
              color: tokens.colors.surface
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          style={{
            padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
            borderRadius: tokens.radii.pill,
            border: 'none',
            background: tokens.gradients.cta,
            color: tokens.colors.surface,
            fontWeight: 600,
            cursor: isLoading ? 'wait' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Enviando...' : 'Enviar instruções'}
        </button>
      </form>

      {message ? (
        <p
          role="alert"
          style={{
            padding: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            margin: 0,
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

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: tokens.colors.muted, margin: 0 }}>
          Lembrou sua senha?{' '}
          <a
            href="/auth/sign-in"
            style={{ color: tokens.colors.primaryAccent, textDecoration: 'none' }}
          >
            Voltar ao login
          </a>
        </p>
        <p style={{ color: tokens.colors.muted, margin: `${tokens.spacing.sm} 0 0 0`, fontSize: '0.875rem' }}>
          Não tem uma conta?{' '}
          <a
            href="/auth/sign-up"
            style={{ color: tokens.colors.primaryAccent, textDecoration: 'none' }}
          >
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}