'use client';

import { useState } from 'react';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { tokens } from '@doendeverde/ui';

type MessageState = { type: 'success' | 'error'; text: string } | null;

export function SignInCard() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const supabase = getSupabaseBrowserClient();

  const handleMagicLinkSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Enviamos um link mágico para seu e-mail. Confira sua caixa de entrada!'
      });
      setEmail('');
    } catch (authError) {
      console.error('[SignInCard] magic link error', authError);
      setMessage({
        type: 'error',
        text: 'Não foi possível enviar o link mágico. Tente novamente em instantes.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    } catch (authError) {
      console.error('[SignInCard] google oauth error', authError);
      setMessage({
        type: 'error',
        text: 'Login com Google indisponível. Use o link mágico ou tente mais tarde.'
      });
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
          Bem-vinde à comunidade
        </h1>
        <p style={{ margin: 0, color: tokens.colors.muted }}>
          Faça login para entrar no hub do Doende Verde. Seus dados permanecem criptografados e você pode usar um codinome.
        </p>
      </header>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        style={{
          padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
          borderRadius: tokens.radii.pill,
          border: 'none',
          background: '#ffffff',
          color: '#1f2933',
          fontWeight: 600,
          cursor: isLoading ? 'wait' : 'pointer'
        }}
      >
        {isLoading ? 'Redirecionando...' : 'Entrar com Google'}
      </button>

      <div style={{ textAlign: 'center', color: tokens.colors.muted }}>ou</div>

      <form
        onSubmit={handleMagicLinkSignIn}
        style={{ display: 'grid', gap: tokens.spacing.sm }}
      >
        <label htmlFor="email" style={{ textAlign: 'left', fontWeight: 500 }}>
          Receba um link mágico
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
            cursor: isLoading ? 'wait' : 'pointer'
          }}
        >
          {isLoading ? 'Enviando...' : 'Receber link mágico'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <a
            href="/auth/forgot-password"
            style={{
              color: tokens.colors.primaryAccent,
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            Esqueceu sua senha?
          </a>
        </div>
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
          Não tem uma conta?{' '}
          <a
            href="/auth/sign-up"
            style={{ color: tokens.colors.primaryAccent, textDecoration: 'none' }}
          >
            Cadastre-se
          </a>
        </p>
        <small style={{ color: tokens.colors.muted, marginTop: tokens.spacing.sm, display: 'block' }}>
          Ao continuar você concorda com a nossa Política de Privacidade e Termos de Uso.
        </small>
      </div>
    </div>
  );
}
