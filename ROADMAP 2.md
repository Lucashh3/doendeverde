# Doende Verde MVP Roadmap

## Fase 0 — Preparação Técnica
- [x] Definir estrutura de repositório (monorepo com `apps/web`, `packages/ui`, `packages/config`).
- [x] Configurar Node.js, pnpm e linting padrão (ESLint, Prettier, Husky hooks).
- [x] Criar projeto Vercel e Supabase (Auth, Postgres, Storage) e armazenar chaves locais com `.env` — ver orientações em `docs/environment-setup.md`.
- [x] Implantar pipeline CI/CD no GitHub Actions (lint, testes, builds) — workflow em `.github/workflows/ci.yml`.
- [x] Especificar diagrama arquitetural (Next.js + Supabase) e compartilhar no repositório (`/docs`) — documentado em `docs/architecture.md`, diagrama visual pendente.

## Fase 1 — Fundamentos de Produto
- [x] Definir identidade visual inicial (paleta verde/terrosa/roxa, tipografia, mascote) — ver `docs/brand-identity.md`.
- [x] Criar design system leve (tokens, componentes base, dark theme opcional) — tokens em `packages/ui/src/theme`.
- [x] Documentar linguagem de tom e diretrizes editoriais para comunidade — `docs/editorial-guidelines.md`.
- [x] Mapear jornadas principais (novo usuário, criador de post, moderador) — `docs/user-journeys.md`.

## Fase 2 — Infraestrutura de Dados
- [x] Modelar esquema Postgres (tabelas `profiles`, `posts`, `comments`, `votes`, `badges`, `xp_history`, `tags`, `moderation_actions`) — ver `supabase/migrations/20240506000100_initial_schema.sql`.
- [x] Implementar migrations com Supabase CLI (`supabase db push`) — estrutura inicial em `supabase/migrations` + `supabase/config.toml`.
- [x] Configurar políticas RLS e roles (usuário padrão, moderador, admin) — políticas descritas na migração inicial.
- [x] Criar views/materialized views para feed ordenado e leaderboard semanal — view `leaderboard_weekly` na migração.
- [x] Preparar seeds iniciais (categorias base, badges padrão, níveis de reputação) — `supabase/seed.sql`.

## Fase 3 — Autenticação & Perfis
- [x] Integrar Supabase Auth (Google + magic link) no Next.js — fluxo em `apps/web/app/auth/sign-in/page.tsx` + `sign-in-card` com Supabase.
- [x] Implementar onboarding com pseudônimo e avatar padrão/aleatório — rota `/onboarding` com formulário (`apps/web/app/(auth)/onboarding/page.tsx`).
- [x] Construir página de perfil (avatar, bio opcional, níveis, badges, histórico) — estrutura inicial em `apps/web/app/(app)/perfil/[username]/page.tsx`.
- [x] Expor settings de privacidade (modo anônimo, controle de notificações por e-mail) — formulário cliente em `apps/web/src/components/settings/privacy-form.tsx`.
- [x] Registrar auditoria de logins e alterações de perfil — ações em `apps/web/src/actions/profiles.ts` usando util `lib/audit/log-event`.

## Fase 4 — Feed & Conteúdo
- [x] Desenvolver feed cronológico com filtros por categoria, tags e período (semana/mês) — rota `/` com filtros em `apps/web/app/(app)/page.tsx` e utilidades `src/lib/feed/fetch-feed.ts`.
- [x] Implementar criação de posts (título, texto, upload de imagem/vídeo curto para Supabase Storage) — formulário em `apps/web/src/components/posts/post-composer-form.tsx` com server action `createPost`.
- [x] Adicionar sistema de votos com feedback otimista e limites de spam — client `PostVotePanel` + action `voteOnPost` em `apps/web/src/actions/posts.ts`.
- [x] Implementar comentários aninhados simples (1 nível), edição e exclusão por autor — `CommentsSection` + `CommentComposer` com depth control na action `createComment`.
- [x] Criar página de detalhes do post com metadados, tags sugeridas e posts relacionados — página server em `apps/web/app/(app)/posts/[id]/page.tsx` com `fetchPostWithMetadata`.

## Fase 5 — Gamificação
- [x] Definir tabela de níveis (ex: Iniciante → Grower Sênior) e thresholds de XP — mantido em `level_thresholds` com atualização automática via `20240515100000_phase5_gamification.sql`.
- [x] Criar triggers/edge functions para registrar XP (+5 post, +2 comentário, +1 upvote recebido) — ver função `apply_profile_xp_progress` e triggers em `supabase/migrations/20240515100000_phase5_gamification.sql`.
- [x] Implementar atribuição automática de badges (Primeira Colheita, Brisado Lendário etc.) — funções de gamificação na mesma migração e helper `grant_badge_if_missing`.
- [x] Expor leaderboard semanal (Hall da Brisa) e página de conquistas — rotas `/hall-da-brisa` e `/conquistas` em `apps/web/app/(app)`.
- [x] Configurar notificações in-app (toasts) para conquistas e subidas de nível — `GamificationToastProvider` e integrações nos formulários de post/comentário.

## Fase 6 — Tags & Relevância
- [x] Permitir tags livres com sugestões automáticas (busca fuzzy de tags existentes) — `search_tags` + autocomplete em `apps/web/src/components/posts/post-composer-form.tsx`.
- [x] Implementar filtros combinados (categoria + tag + mais votados) — feed atualizado em `apps/web/app/(app)/page.tsx` + `apps/web/src/components/feed`.
- [x] Criar tarefas agendadas (Vercel Cron ou Supabase Scheduled Functions) para recalcular popularidade — função `recalculate_post_popularity` e triggers `refresh_post_metrics` em `supabase/migrations/20240515120000_phase6_tags_popularity.sql`.
- [x] Indexar posts em supabase `pg_trgm` para busca por texto e hashtags — mesma migração com índices trigram.
- [x] Expor endpoint público read-only (RSS/JSON) para posts mais votados — rota `apps/web/app/api/public/top-posts/route.ts`.

## Fase 7 — Moderação & Admin
- [x] Construir painel `/admin` protegido (role `admin`) com lista de usuários/posts — ver `apps/web/app/(app)/admin/page.tsx` + componentes em `src/components/admin`.
- [x] Implementar ações de ban/shadowban, remoção/edição de post ofensivo e histórico de ações — funções SQL em `20240515160000_phase7_moderation.sql` e server actions em `src/actions/admin.ts`.
- [x] Adicionar mecanismo de sinalização manual (usuários solicitam revisão) — botão `FlagPostButton` e tabela `post_flags`.
- [x] Registrar webhooks/alertas para atividades suspeitas (múltiplos posts em pouco tempo) — triggers `handle_post_rate_alert` / `handle_post_flag_alert` criando entradas em `moderation_alerts`.
- [x] Documentar guia de moderação e políticas na wiki do projeto — `docs/moderation-guide.md`.

## Fase 8 — Branding & Conteúdo
- [x] Criar logomarca responsiva e variações (favicon, app icon, social preview) — SVGs em `apps/web/public/assets/branding`.
- [x] Produzir assets do mascote Doende Verde para tooltips, onboarding e empty states — ver `mascot-doende.svg`.
- [x] Elaborar copy para onboarding (“Quem é você na brisa?”) com flows por persona — documentado em `docs/onboarding-copy.md`.
- [x] Preparar telas estáticas (Landing pública, Política de Privacidade, Termos, FAQ) — rotas em `apps/web/app/(marketing)`.
- [x] Planejar campanha beta (convites, materiais para Telegram/Discord, posts sociais) — `docs/beta-campaign-plan.md`.

## Fase 9 — Observabilidade & Qualidade
- [x] Instrumentar analytics (Plausible/Supabase logs) respeitando privacidade — `AnalyticsProvider` + env em `.env.example`.
- [x] Configurar logs estruturados e dashboards de métricas chave (retention, posts/dia, votos) — logger util + guia em `docs/observability.md`.
- [x] Implementar testes automatizados (unitários, integração, e2e com Playwright) — Vitest scaffolding em `apps/web`.
- [x] Configurar alertas de erro (Sentry free tier) e health checks (BetterStack uptime) — `reportError` stub + `/api/health`.
- [x] Rodar beta interno com checklists de QA e feedback estruturado (Notion/Formulários) — ver `docs/qa-checklist.md`.

## Fase 10 — Lançamento Beta
- [ ] Executar migração final/carga inicial de conteúdo e usuários convidados.
- [ ] Ativar campanhas de guerrilha (Instagram, Reddit, Twitter) e monitorar aquisição.
- [ ] Monitorar limites das plataformas free (Supabase, Vercel) e preparar upgrade plano B.
- [ ] Coletar métricas de retenção semanal e engajamento (post/usuário) em painel.
- [ ] Realizar retrospectiva pós-30 dias e priorizar melhorias para MVP 1.1.
