# Identidade Visual — Doende Verde

## Paleta de Cores
- **Verde Brisa (#0B3D2E)**: primária para fundos escuros, botões principais, header.
- **Verde Neon (#2ECC71)**: destaques, ícones ativos, estados de sucesso.
- **Terra Quente (#A56336)**: backgrounds secundários, badges de cultivo.
- **Roxo Psicodélico (#6C3B99)**: gamificação, CTAs especiais, tooltips do mascote.
- **Creme Neblina (#F2E9E4)**: textos sobre fundo escuro, cartões claros.
- **Cinza Fumaça (#9AA0A6)**: bordas, textos secundários, elementos muted.

> Dica: use combinações de verde escuro com acentos roxo/terra para transmitir vibe acolhedora e alternativa.

## Tipografia
- **Display/Title**: `Space Grotesk` (Google Fonts) — títulos, highlights, números de XP.
- **Body/Textos longos**: `Inter` — legibilidade em parágrafos, descrições e comentários.
- **Código/interface** (opcional): `JetBrains Mono` para elementos técnicos no admin.

## Avatar & Mascote
- Mascote “Doende Verde”: personagem simpático com chapéu de cogumelo, usado em tooltips e onboarding.
- SVG disponível em `apps/web/public/assets/branding/mascot-doende.svg` com variações de glow para tooltips.
- Avatares padrão gerados com variações da paleta (verde, roxo, terroso) com símbolos abstratos (folhas, estrelas).

## Logos & Assets
- `logo-primary.svg`: versão horizontal com tagline — ideal para hero, emails e PDFs (`apps/web/public/assets/branding/logo-primary.svg`).
- `logo-mark.svg`: ícone quadrado para avatar social, favicon e componentes menores (`apps/web/public/assets/branding/logo-mark.svg`).
- Manter margem mínima de 24px em torno da marca e usar fundo escuro (`#051C14`) ou gradiente verde→roxo.
- Favicon recomendado: exportar `logo-mark.svg` em 32x32px convertendo para `.ico` antes do deploy.

## Componentes Base
- Botões arredondados (8px radius), com gradiente sutil verde → roxo em CTAs principais.
- Cards com bordas suaves (1px `#173E30`), sombra leve (`rgba(0, 0, 0, 0.15)`), canto superior esquerdo destacado.
- Badges com ícones lineares e fundo sólido, etiqueta inferior para níveis (ex: “Entusiasta”).

## Moodboard & Imagética
- Mistura de referências de natureza, cultura urbana brasileira e estética psicodélica leve.
- Evitar estereótipos ofensivos; foco em inclusão (representar diversidade de gênero, raça e tipo de consumidor).

## Acessibilidade de Cor
- Contraste mínimo 4.5:1 para textos; adaptar paleta clara/escura.
- Fornecer modo alto contraste (verde escuro + creme) para usuários com baixa visão.

## Próximos Passos
1. Criar tokens de cor (light/dark) em `packages/ui`.
2. Montar biblioteca de componentes (botões, cards, badges, chips de tag).
3. Gerar moodboard no Figma e compartilhar com o time.
4. Criar variantes animadas do mascote para onboarding e empty states.
