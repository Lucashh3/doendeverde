# Design System — Doende Verde

## Visão Geral
- Biblioteca compartilhada em `packages/ui` com tokens de cor, tipografia, espaçamento e gradientes (`src/theme/tokens.ts`).
- Componentes serão exportados gradualmente via `packages/ui/src/index.ts`, garantindo reutilização entre web e futuros projetos.

## Roadmap de Componentes
1. **Button**: estados (primary, ghost, danger), loading, ícones.
2. **Card**: variações para posts, comentários, onboarding.
3. **Badge**: níveis/gamificação, badges de conquista, variações com ícone.
4. **Avatar**: padrão, upload custom, modo anônimo (geração procedural).
5. **Chip/Tag**: categorias, tags livres, filtros selecionados.
6. **Navigation Bar**: header com busca, CTA de post, status de usuário.
7. **Tooltip Mascote**: balões com personagem Doende Verde.
8. **Leaderboard Widget**: ranking semanal (Hall da Brisa).

## Tokens Disponíveis
```ts
import { tokens } from '@doendeverde/ui';

const { colors, typography, spacing } = tokens;
```

## Guidelines
- Priorizar acessibilidade: contraste 4.5:1, foco visível, suporte a teclado.
- Utilizar `Space Grotesk` para títulos e `Inter` para corpo.
- Aplicar gradiente `tokens.gradients.cta` em CTAs chave (ex: “Criar Post”).
- Manter raios de borda `tokens.radii.md` para consistência.

## Próximos Passos
- Implementar sistema de theming (dark/light) com CSS variables.
- Integrar Storybook ou Ladle para documentação interativa (free tier).
- Criar playground no Storybook alinhado ao branding definido.
