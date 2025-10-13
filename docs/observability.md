# Observabilidade & Qualidade — Doende Verde

## Instrumentação
- **Analytics**: Plausible habilitado via `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` + `NEXT_PUBLIC_PLAUSIBLE_API_HOST` (opcional). O provedor injeta pageviews e eventos customizados em `AnalyticsProvider`.
- **Logging estruturado**: `createLogger(scope)` em `apps/web/src/lib/logging/logger.ts` padroniza níveis (`debug/info/warn/error`) e aceita `NEXT_PUBLIC_LOG_LEVEL` (default `info`).
- **Relato de erros**: `reportError` (`apps/web/src/lib/telemetry/error-reporter.ts`) envia erros para Sentry (ou loga localmente quando `SENTRY_DSN` não está configurado).

## Monitoramento
- **Health check**: `GET /api/health` retorna JSON com `uptime`, `timestamp` e `status`. Use em BetterStack / Vercel Cron para disponibilidade.
- **Alertas automáticos**: tabela `moderation_alerts` (fase 7) registra sinais críticos; configure webhooks externos conforme necessário.
- **Próximos passos sugeridos**:
  - Integrar `reportError` com Resend/Slack para alertas quando Sentry não estiver disponível.
  - Adicionar dashboards Supabase (retention, posts/dia, votos) usando `public.posts` e `xp_history`.

## Testes & Qualidade
- **Vitest** configurado em `apps/web/vitest.config.ts`. Rodar com `pnpm --filter @doendeverde/web test`.
- **Sample test**: `src/lib/utils/__tests__/slugify-tag.test.ts` valida utilitários; use como referência para novos cenários.
- **Cobertura**: Relatórios V8 (`text`, `json`, `html`) gerados em `coverage/`.
- **CI recomendada**: adicionar step `pnpm test` na pipeline do GitHub Actions (já existe workflow base).

## Variáveis de Ambiente
```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_PLAUSIBLE_API_HOST=https://plausible.io
NEXT_PUBLIC_LOG_LEVEL=info
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
```

## Checklist Beta (Qualidade)
- [ ] Health-check configurado (BetterStack / Vercel Cron → `/api/health`).
- [ ] Sentry DSN ou fallback (Resend) ativo em produção.
- [ ] Métricas Plausible validadas (pageviews + eventos de onboarding).
- [ ] Pipeline CI executando `lint`, `typecheck` e `vitest`.
- [ ] Plano de QA manual (ver `docs/beta-campaign-plan.md`) executado antes de novos convites.
