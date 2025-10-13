# Ambiente Local & Plataformas Gratuitas

## 1. Pré-requisitos
- Node.js 20.x e pnpm (`curl -fsSL https://get.pnpm.io/install.sh | sh`)
- Conta na Vercel (free tier)
- Conta na Supabase (free tier)
- GitHub (para CI/CD e deploy automatizado)

## 2. Criar Projeto Supabase
1. Acesse [https://app.supabase.com](https://app.supabase.com) e crie um novo projeto.
2. Escolha a região mais próxima do público brasileiro (ex: `South America (São Paulo)`).
3. Defina senha segura para o banco.
4. Após provisionamento, anote:
   - `SUPABASE_PROJECT_REF`
   - URL (`Project Settings → API → Project URL`)
   - `anon` e `service_role` keys (`Project Settings → API → Project API keys`)
5. Crie bucket `media` em Storage (`Project Settings → Storage`).
6. Habilite pg_cron e Realtime se necessário (`Project Settings → Database → Add-ons`).
7. Instale CLI localmente (`pnpm dlx supabase login`) e adicione `supabase/config.toml` quando estiver pronto.

Preencha o arquivo `.env` com os valores obtidos:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://<project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_PROJECT_REF="<project-ref>"
SUPABASE_SERVICE_ROLE_KEY="<service-key>"
SUPABASE_JWT_SECRET="<jwt-secret>"
```

## 3. Criar Projeto Vercel
1. Acesse [https://vercel.com/new](https://vercel.com/new) e importe este repositório.
2. Defina ambiente `Production` e `Preview` apontando para branch `main` e `develop` (se existir).
3. Configure variáveis de ambiente na Vercel copiando o conteúdo do `.env` (sem `service_role` em ambiente de produção).
4. Ative `Automatically expose System Environment Variables` para usar `VERCEL_ENV`.
5. Opcional: Crie tokens locais (`vercel login`, `vercel link`) para deploy manual via CLI.

## 4. Husky & Lint-Staged
Após `pnpm install`, execute `pnpm prepare` para habilitar o hook `pre-commit` que roda `lint-staged` automaticamente.

## 5. Execução Local
```bash
pnpm install
pnpm dev  # roda todos os apps em paralelo (turbo)
```

Para trabalhar apenas no front:
```bash
pnpm --filter @doendeverde/web dev
```

## 6. Integração Contínua
- O workflow `.github/workflows/ci.yml` executa lint, typecheck, testes e build em PRs/commits.
- Configure `Required status checks` no GitHub (Settings → Branches) para bloquear merge sem aprovação.

## 7. Próximos Passos
- Versionar `supabase/migrations` quando a modelagem estiver pronta.
- Documentar políticas RLS e seeds iniciais na mesma pasta.
- Adicionar diagramas visuais em `docs/` (Excalidraw/Mermaid) conforme a arquitetura evoluir.
