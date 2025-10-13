# Guia de Moderação — Doende Verde

Este documento resume o fluxo e as responsabilidades da equipe de moderação no MVP.

## Perfis e permissões
- Administradores são marcados com `profiles.is_admin = true` e acessam o painel `/admin`.
- Estados de moderação (`profiles.moderation_status`):
  - `active`: participação normal.
  - `shadowbanned`: conteúdo visível apenas ao autor; usado para casos de spam leve.
  - `banned`: bloqueio completo; pode ser revertido quando necessário.
- As funções `admin_update_moderation_status`, `admin_remove_post` e `admin_restore_post` registram cada ação em `moderation_actions`.

## Painel `/admin`
1. **Flags da comunidade**  
   - Usuários autenticados podem sinalizar posts via botão “Sinalizar post”.  
   - Moderadores revisam e atualizam o status (`pending`, `reviewed`, `dismissed`) adicionando notas internas.  
   - A remoção/restauração do post é feita diretamente do card, mantendo histórico em `moderation_actions`.

2. **Alertas automáticos**  
   - Triggers em `posts` e `post_flags` geram registros em `moderation_alerts` (ex.: alta frequência de posts, novo flag).  
   - Admins marcam alertas como resolvidos, garantindo rastreabilidade (campo `resolved_by`).

3. **Usuários**  
   - Tabela destaca nível de acesso, status atual e data de criação.  
   - Alterações de status são instantâneas e refletem no feed.

## Fluxo sugerido
1. Revisar alertas de alta prioridade (severity `high`).  
2. Processar flags pendentes, registrando notas claras para rastreamento futuro.  
3. Avaliar usuários com padrão reincidente (shadowban → ban).  
4. Registrar decisões controversas nesta própria wiki ou em canal privado (ex.: Slack).

## Boas práticas
- Se possível, priorize contato com o usuário antes do banimento definitivo.  
- Utilize shadowban para comportamentos suspeitos enquanto coleta mais evidências.  
- Revise semanalmente `moderation_alerts` não resolvidos; se número crescer, considere automações adicionais (ex.: notificações externas).
- Inverta ações incorretas recrutando `admin_restore_post` e atualize as notas do flag para documentar o motivo.

## Próximos passos
- Integrar `moderation_alerts` com webhooks (Slack/Discord) para avisos em tempo real.  
- Especificar SLAs por tipo de alerta (ex.: flags manuais respondidos em até 24h).  
- Expandir painel com filtros por severidade/usuário e histórico detalhado por caso.
