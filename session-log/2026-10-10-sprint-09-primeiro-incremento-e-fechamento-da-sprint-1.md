# 2026-10-10 — Sprint -1 fechada; Sprint 09, primeiro incremento (sem o chat)

## Decisões do fundador (mesmo dia)

- Tema escuro oficial e padrão; idioma inglês (L-01); a página de campanha mostra chance e atividade (L-23); avisos
  mínimos padrão (L-03, L-24, P-9); layouts, componentes e telas de `/dev0x/` aprovados.
- Lista de espera mantida como rota própria; os decks de `/pitch` e `/pitch2` ficam como estão, só por link.
- Sprint -1 fechada; os itens de código dela entram na Sprint 09.

## O que foi feito

- Chat embutido removido: rota `app/app/api/chat/`, componentes de chat, biblioteca do chat, o provedor e a chamada no
  mercado. `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` saíram de `app/.env.example`, de `.env.example` e do CLAUDE.md (D-q).
- Cabeçalhos de segurança e Content-Security-Policy em `app/next.config.ts` (X2.5). Conferido em `bun run start`: os
  cabeçalhos saem na página; `POST /api/chat` responde 404.
- `cd app && bun run lint && bun run build`: passam.

## O que não foi feito

A Sprint 09 segue aberta: migração para `@brot/sdk` (o app ainda usa `app/lib` e `@anchor-lang/core`), as rotas de
campanha, de entrada, de entradas e de ranking, o registro explícito do MWA e seu teste, os estados da carteira, os avisos
em todas as telas, os itens de código da Sprint -1, o `.env.example` da raiz (ainda é o modelo da OS), o teste de
Bun, o `brot-web.service`, o deploy e as rotas do túnel (mexem no servidor: pedem nova autorização), e os testes em
emulador e celular.

## Pendências

1. Autorização para `brot-web.service` e as rotas do túnel (servidor compartilhado).
2. Decidir o que o Lucas constrói sobre a API, para não duplicar a tela que ele já faz.
