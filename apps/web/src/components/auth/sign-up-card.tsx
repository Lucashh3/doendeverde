'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { tokens } from '@doendeverde/ui';

type MessageState = { type: 'success' | 'error'; text: string } | null;

export function SignUpCard() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      acceptTerms: event.target.checked
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
      setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios.' });
      return false;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return false;
    }

    if (formData.username.length < 3) {
      setMessage({ type: 'error', text: 'O nome de usuário deve ter pelo menos 3 caracteres.' });
      return false;
    }

    if (!formData.acceptTerms) {
      setMessage({ type: 'error', text: 'Você deve aceitar os termos de uso e política de privacidade.' });
      return false;
    }

    return true;
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
          emailRedirectTo: `${origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        setMessage({
          type: 'success',
          text: 'Cadastro realizado! Verifique seu e-mail para confirmar sua conta.'
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Cadastro realizado com sucesso! Redirecionando...'
        });
        setTimeout(() => {
          router.push('/onboarding');
        }, 2000);
      }

      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        acceptTerms: false
      });
    } catch (authError: any) {
      console.error('[SignUpCard] signup error', authError);
      let errorMessage = 'Erro ao criar conta. Tente novamente.';

      if (authError.message?.includes('already registered')) {
        errorMessage = 'Este e-mail já está cadastrado. Tente fazer login ou use a recuperação de senha.';
      } else if (authError.message?.includes('password')) {
        errorMessage = 'A senha deve atender aos requisitos de segurança.';
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
          Junte-se à comunidade
        </h1>
        <p style={{ margin: 0, color: tokens.colors.muted }}>
          Crie sua conta no Doende Verde e comece sua jornada sustentável
        </p>
      </header>

      <form
        onSubmit={handleSignUp}
        style={{ display: 'grid', gap: tokens.spacing.md }}
      >
        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <label htmlFor="username" style={{ textAlign: 'left', fontWeight: 500 }}>
            Nome de usuário *
          </label>
          <input
            id="username"
            type="text"
            required
            value={formData.username}
            onChange={handleInputChange('username')}
            placeholder="seu-nome-verde"
            style={{
              padding: tokens.spacing.sm,
              borderRadius: tokens.radii.md,
              border: `1px solid ${tokens.colors.border}`,
              background: 'rgba(11, 61, 46, 0.35)',
              color: tokens.colors.surface
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <label htmlFor="email" style={{ textAlign: 'left', fontWeight: 500 }}>
            E-mail *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange('email')}
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

        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <label htmlFor="password" style={{ textAlign: 'left', fontWeight: 500 }}>
            Senha *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="Sua senha segura"
              style={{
                width: '100%',
                padding: tokens.spacing.sm,
                borderRadius: tokens.radii.md,
                border: `1px solid ${tokens.colors.border}`,
                background: 'rgba(11, 61, 46, 0.35)',
                color: tokens.colors.surface,
                paddingRight: '2.5rem'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: tokens.spacing.sm,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: tokens.colors.muted,
                cursor: 'pointer'
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <small style={{ color: tokens.colors.muted, fontSize: '0.75rem' }}>
            Mínimo 6 caracteres
          </small>
        </div>

        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <label htmlFor="confirmPassword" style={{ textAlign: 'left', fontWeight: 500 }}>
            Confirme a senha *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              placeholder="Confirme sua senha"
              style={{
                width: '100%',
                padding: tokens.spacing.sm,
                borderRadius: tokens.radii.md,
                border: `1px solid ${tokens.colors.border}`,
                background: 'rgba(11, 61, 46, 0.35)',
                color: tokens.colors.surface,
                paddingRight: '2.5rem'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: tokens.spacing.sm,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: tokens.colors.muted,
                cursor: 'pointer'
              }}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: tokens.spacing.sm }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing.sm, fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleCheckboxChange}
              style={{ marginTop: '0.125rem' }}
            />
            <span>
              Aceito os{' '}
              <a
                href="/termos"
                target="_blank"
                style={{ color: tokens.colors.primaryAccent, textDecoration: 'none' }}
              >
                Termos de Uso
              </a>{' '}
              e{' '}
              <a
                href="/privacidade"
                target="_blank"
                style={{ color: tokens.colors.primaryAccent, textDecoration: 'none' }}
              >
                Política de Privacidade
              </a>
              *
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
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
          {isLoading ? 'Criando conta...' : 'Criar conta'}
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
          Já tem uma conta?{' '}
          <a
            href="/auth/sign-in"
            style={{ color: tokens.colors.primaryAccent, textDecoration: 'none' }}
          >
            Faça login
          </a>
        </p>
      </div>
    </div>
  );
}