# Sprint 08 — Indexer, API e pontuação

**Estado:** planejada · **Branch:** `sprint-08-indexer-api-points` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B7 (seções 3.5, 6 e 8) |
| Depende de | Sprint 05; a 06 para publicar no servidor |
| Regras e fluxos cobertos | R-21 (o relatório do parceiro). F12; os dados de F1 e de "minhas apostas" (L-02) |

## Objetivo

Dar ao site o que ele não consegue ler direto da rede: a atividade, o histórico da chance, o que cada carteira já
recebeu e a classificação. É um banco pequeno, que só copia a rede e é refeito do zero se o arquivo se perder.

## Critério de pronto

- [ ] `services/indexer/src` tem `ingest.ts`, `db/`, `points.ts` e `api/`, com SQLite pelo `bun:sqlite` (C8).
- [ ] Existem as tabelas `questions`, `bets`, `settlements`, `question_events` e `points`. Toda linha guarda
      `signature`, `seq` e `block_time`.
- [ ] Teste: apagar o arquivo e refazer o banco do zero dá o mesmo conteúdo.
- [ ] Um buraco na sequência de `seq` é detectado.
- [ ] `/api/v1` serve `/questions`, `/questions/:id`, `/questions/:id/activity`, `/questions/:id/chance`,
      `/wallets/:address/positions`, `/leaderboard` e `/health`. Só leitura.
- [ ] Valores saem como texto, em unidades mínimas de USDC. Erro sai como `{ "error": { "code", "message" } }`, sem
      rastro de pilha.
- [ ] `/rpc` aceita só os métodos de que a carteira precisa. A chave do provedor não sai do servidor.
- [ ] O limite por endereço de internet fica em memória. Nenhum IP vai para disco nem para log.
- [ ] Os pontos saem por acerto, nunca por volume, pela fórmula decidida.
- [ ] O relatório do parceiro traz volume e número de carteiras, sem endereços.
- [ ] `brot-indexer.service` roda em `127.0.0.1:4201`, com limites de memória e de processador.
- [ ] A revisão de privacidade foi feita (endereço de carteira copiado no banco; IP em memória).
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- O indexer, a API de leitura e o repasse de RPC.
- O cálculo dos pontos e o relatório do parceiro.
- A unidade do systemd e o `.env.example`.

## Fora desta sprint

A tabela `referrals` (14). Escrita pela API, login e rota administrativa: não existem. Estatística de visitas. As
sugestões, que ficam em `content/` (13).

## Decisões do fundador que travam a sprint

- **Q7 (L-09):** a fórmula dos pontos. A recomendação do plano técnico é 1 ponto por pergunta com aposta no lado
  certo.

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent` (repasse de RPC, limite, mensagens de erro), `dev-product-agent`,
  `coordinator-agent`.
- **Skills:** `privacy-audit`, `sprint-management`, `cost-watchdog` (o RPC do indexer), `secrets-discipline`,
  `secrets-scan`, `codemap`, `verify-build-works`, `release-check`.

## Portões de segurança

- As regras do servidor compartilhado, como na Sprint 06. O Postgres do outro projeto não é usado.
- O banco não decide dinheiro e não pede backup.
- `privacy-audit` antes de fechar: as nove perguntas da seção 8 do plano técnico, conferidas contra o código.
- `secrets-scan` no fechamento.

## Testes

`bun test`: ingestão, refazer do zero, cada rota, o limite e o formato de erro. Conferência contra a devnet: os
totais do banco batem com as contas `Question`.

## Riscos

- Muitas carteiras inflarem a classificação. O freio é o limite do USDC de teste.
- `bun:sqlite` com um escritor e vários leitores (C8).
- Segundos de atraso na tela, por o dado passar pelo banco.

## Artefatos esperados

`services/indexer/`, a unidade em `deploy/vps/`, `services/indexer/.env.example`, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** indexer, API `/api/v1`, repasse de RPC e pontuação.
- **Session-log:** a fórmula escolhida; o resultado da revisão de privacidade.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
