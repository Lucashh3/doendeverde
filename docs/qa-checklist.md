# Checklist de QA — Beta Interno

## Fluxos Essenciais
- [ ] Login com Supabase (magic link / Google) funcionando.
- [ ] Onboarding completo (codinome, persona, privacidade) sem erros.
- [ ] Postar texto + tags + mídia opcional funciona.
- [ ] Comentários (criar, responder, editar, deletar) operacionais.
- [ ] Gamificação exibe toasts de XP/levels.
- [ ] Sinalização de post disponível para usuários autenticados.

## Usabilidade & UI
- [ ] Branding consistente (novo logo/mascote) em landing, feed e painel admin.
- [ ] Layout responsivo (mobile < 480px, tablet ~768px, desktop ≥1280px).
- [ ] Acessibilidade básica (tab nav, contraste, descriptions nas imagens).

## Observabilidade
- [ ] Plausible recebe pageviews e eventos customizados.
- [ ] `/api/health` retorna status 200 nos ambientes.
- [ ] Erros simulados aparecem em Sentry ou logs de fallback.

## Conteúdo & Comunicação
- [ ] Copy de onboarding (“Quem é você na brisa?”) alinhada com diretrizes.
- [ ] FAQ/Termos/Privacidade acessíveis e atualizados.
- [ ] Newsletter de boas-vindas disparando no teste manual (Resend/MailerLite).

## Feedback & Registro
- [ ] Formulário Typeform/Google Forms disponível para feedback rápido.
- [ ] Chamados de suporte registrados no Notion/Linear.
- [ ] Lições aprendidas documentadas após cada rodada de QA.
