# Doende Verde — MVP Architecture

## Visão Geral
- Front-end em Next.js 14 (App Router) hospedado na Vercel, servindo páginas SSR/SSG e APIs leves.
- Supabase como backend principal (Auth, Postgres, Storage, Edge Functions) com políticas RLS.
- Turborepo + pnpm para orquestrar apps/packages com TypeScript compartilhado e lint consistente.
- UI compartilhada em `packages/ui` para componentes design system e branding.
- Configurações centralizadas em `packages/config` (ESLint, Prettier, TSConfig) garantindo padrões em todo o monorepo.

## Fluxo de Dados
1. Usuário interage com o Next.js (`apps/web`), que chama Supabase Auth para login Google/magic link.
2. A aplicação consome Supabase Postgres via client (RLS) para feed, posts, comentários, votos e gamificação.
3. Uploads de mídia usam Supabase Storage com URLs assinadas; thumbnails podem ser geradas via Edge Function futura.
4. Eventos de engajamento (posts, votos) disparam functions agendadas para atualizar XP, níveis e badges.
5. Painel admin reutiliza o front com rotas protegidas (`/admin`) e validação de role/moderação pelo Supabase.

## Componentes Principais
- `apps/web`: Front responsivo com feed, onboarding, perfis e gamificação.
- `packages/ui`: Biblioteca UI reutilizável com tokens de cor, tipografia e componentes (layout, cards, badges, mascote).
- `packages/config`: Configurações reutilizáveis (ESLint/Prettier/TSConfig) consumidas por apps e pacotes.
- `docs`: Documentação de arquitetura, decisões técnicas e guias de operação.

## Infraestrutura Gratuita
- Deploy front: Vercel free tier (build automático via GitHub, previews, cron limited).
- Backend: Supabase free (Auth, Postgres 500MB, Storage 1GB, Edge Functions, pg_cron limitado).
- Observabilidade inicial: Supabase logs + Vercel Analytics (básico) + possível Plausible self-hosted se necessário.
- CI/CD: GitHub Actions (2k minutos/mês) rodando lint, typecheck e testes por workflow.

## Próximos Passos Técnicos
- Configurar Supabase CLI no repositório (`supabase/config.toml`) quando o projeto for criado.
- Desenhar diagrama visual (Excalidraw ou Mermaid) para complementar este documento.
- Definir convenções de commit (Conventional Commits ou Gitmoji) e branch main/dev.
- Automatizar migrations com `supabase db` e snapshots do schema em `supabase/migrations`.
