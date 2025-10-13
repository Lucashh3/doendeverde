# Jornadas Principais

## 1. Novo Usuário — "Curioso"
1. Acessa landing → CTA "Entrar na Brisa".
2. Login com Google ou e-mail (magic link).
3. Onboarding "Quem é você na brisa?" seleciona perfil Curioso.
4. Sugestão de categorias (Educação, Cultura & Memes); recebe badge inicial.
5. Explora feed filtrado, salva posts favoritos, comenta primeiro post.

### Objetivos
- Sentir-se seguro e anônimo.
- Encontrar conteúdo confiável rápido.

### Pontos de Contato
- Landing, fluxo de auth, onboarding, feed inicial, modal de badge.

## 2. Criador de Post — "Grower"
1. Usuário existente clica em "Compartilhar Experiência".
2. Escolhe categoria Cultivo, adiciona tags sugeridas, faz upload de foto.
3. Publica e recebe +5 XP; post aparece no topo do feed da categoria.
4. Recebe comentários/upvotes, acompanha XP subir e badges liberados.

### Objetivos
- Divulgar colheita, receber feedback da comunidade.
- Ganhar reputação (XP e badges).

### Pontos de Contato
- Botão CTA, editor de post, preview, notificações de engajamento, perfil público.

## 3. Moderador — "Guardião"
1. Acessa `/admin` com role "admin" (Supabase RLS).
2. Visualiza fila de conteúdo sinalizado.
3. Avalia post, aplica shadowban temporário e envia aviso personalizado.
4. Registra ação em `moderation_actions`, acompanha métricas de incidentes.

### Objetivos
- Manter convivência segura sem sufocar autenticidade.
- Ter histórico auditável e rápido para decisões.

### Pontos de Contato
- Painel admin, ferramentas de filtro/sinalização, logs de ações, mensagens privadas.

## 4. Engajador — "Brisado Lendário"
1. Consegue destaque no Hall da Brisa após sequência de contribuições.
2. Recebe notificação especial e badge exclusivo.
3. Compartilha no Telegram/Discord da comunidade.
4. Continua participando incentivado pelos rankings semanais.

### Objetivos
- Reconhecimento social dentro da plataforma.
- Acesso antecipado a novidades/convites.

### Pontos de Contato
- Leaderboard, perfil público, notificações de gamificação, campanhas externas.

## Próximos Passos
- Validar jornadas com usuários reais na beta fechada.
- Criar user flows detalhados (figma) + wireframes low-fidelity.
- Definir métricas por jornada (ex: conversão onboarding, posts criados por semana, tempo de resposta moderação).
