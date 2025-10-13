# Esquema de Dados — Doende Verde

## Visão Geral
- `profiles`: espelha usuários do Supabase Auth com metadados (codinome, avatar, privacidade, XP e nível).
- `posts` / `comments`: conteúdo principal do feed com suporte a votos e contagem agregada.
- `categories` & `tags`: taxonomia para filtrar experiências, cultivo, educação e cultura.
- `badges`, `level_thresholds`, `user_badges`, `xp_history`: núcleo da gamificação com conquistas e leaderboard semanal.
- `search_tags`, `refresh_post_metrics`: utilidades SQL para sugestões de tags via `pg_trgm` e atualização de popularidade.
- `post_flags`, `moderation_alerts`, `moderation_actions`: infraestrutura de moderação e registro administrativo.
- `moderation_actions` & `audit_logs`: rastreabilidade de intervenções e eventos sensíveis.

## Migrations
- Arquivos SQL residem em `supabase/migrations`. A primeira migração (`20240506000100_initial_schema.sql`) cria tabelas, views, funções e políticas RLS.
- A migração `20240515100000_phase5_gamification.sql` adiciona triggers de XP, atualização automática de nível e lógica de concessão de badges/leaderboard.
- A migração `20240515120000_phase6_tags_popularity.sql` habilita `pg_trgm`, cria índices trigram para título/conteúdo/tags, adiciona `popularity_score`, funções de atualização (`refresh_post_metrics`, `recalculate_post_popularity`) e o RPC `search_tags`.
- A migração `20240515160000_phase7_moderation.sql` introduz coluna `is_admin`, tabelas `post_flags`/`moderation_alerts`, funções administrativas (`admin_update_moderation_status`, `admin_remove_post`, `admin_restore_post`) e alertas automáticos via triggers.
- Use `pnpm dlx supabase db push` para aplicar em ambiente local e `supabase db dump` para exportar.

### Destaques da Migração Inicial
- Extensões habilitadas: `uuid-ossp`, `pgcrypto`, `citext`.
- Enum `moderation_status` garante estados padronizados.
- Função `handle_updated_at` atualiza `updated_at` automaticamente em `profiles`, `posts` e `comments`.
- View `leaderboard_weekly` consolida XP dos últimos 7 dias.
- Função `register_audit_event` (security definer) registra ações no histórico auditável.
- Políticas RLS restritivas garantindo que cada usuário gerencie apenas seus dados, enquanto leitura pública é permitida quando esperado.

## Seeds
- `supabase/seed.sql` popula categorias, badges iniciais, níveis de reputação e tags temáticas.
- Execute `pnpm dlx supabase db reset --seed` para popular ambiente local após clonar o projeto.

## Busca e Popularidade
- Endpoint público `GET /api/public/top-posts` retorna JSON (ou RSS com `?format=rss`) dos posts mais populares, com suporte a `period=week|month|all`.
- RPC `search_tags(term, limit)` alimenta autocompletes com fuzzy search via `pg_trgm`.
- `refresh_post_metrics` é acionada por triggers em `post_votes` e `comments`, garantindo sincronismo de `upvotes_count`, `downvotes_count`, `comments_count` e `popularity_score`.
- Agende `select public.recalculate_post_popularity()` (Supabase Scheduled Functions ou Vercel Cron) para recalcular o score global diariamente e manter consistência histórica.

## Moderação
- `profiles.is_admin` habilita RBAC simples para o painel `/admin`.
- Usuários podem sinalizar posts (`post_flags`), enquanto administradores revisam e registram notas/resoluções.
- `moderation_alerts` registra tanto flags manuais quanto alertas automáticos (ex.: frequência alta de posts). Administradores marcam resolução direto pelo painel.
- Funções `admin_update_moderation_status`, `admin_remove_post` e `admin_restore_post` encapsulam ações críticas e alimentam `moderation_actions`.
- Triggers `handle_post_rate_alert` e `handle_post_flag_alert` registram sinais para acompanhamento proativo.

## Próximos Passos
- Monitorar métricas de popularidade e ajustar coeficientes da função `calculate_post_popularity_score` conforme feedback da comunidade.
- Criar job agendado para enviar notificações (Slack/email) a partir de `moderation_alerts` críticos.
- Revisar continuamente novos badges/níveis e atualizar seeds/migrações conforme a comunidade expandir.
- Versionar políticas adicionais para moderadores e painel admin assim que os papéis forem definidos.
