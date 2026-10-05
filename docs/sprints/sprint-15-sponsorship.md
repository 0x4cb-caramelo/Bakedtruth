# Sprint 15 — Patrocínio pago com pedido de pergunta

**Estado:** planejada · **Branch:** `sprint-15-sponsorship` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B9 (seção 3.4.12) |
| Depende de | Sprints 04, 05 e 12 |
| Regras e fluxos cobertos | R-12, R-15, R-16, R-17, R-18, R-19 e R-20. F8 |

## Objetivo

Um projeto paga para pôr prêmio numa pergunta ou para pedir uma nova. O dinheiro fica travado até a equipe
responder e nunca fica preso.

## Critério de pronto

- [ ] Existem a conta `SponsorRequest` (`["sponsor_request", requester, n]`), o cofre do pedido
      (`["sponsor_escrow", request]`) e as quatro instruções de patrocínio: `sponsor_create_request`,
      `team_accept_request`, a recusa e `sponsor_withdraw_request`.
- [ ] `amount` é conferido contra as três faixas (500, 1.500 e 5.000). `disclosed = false` é recusado com
      `SponsorBet`.
- [ ] O aceite abre a pergunta e aplica o dinheiro na mesma instrução: 70% viram `prize_amount` ou uma `Position` do
      patrocinador, e 30% ficam em `platform_cut_held`. Casos de teste: 350 e 150; 1.050 e 450; 3.500 e 1.500.
- [ ] A recusa só muda o estado. O saque é assinado pelo patrocinador, depois da recusa ou de 14 dias pendente
      (teste com o relógio avançado).
- [ ] `settle_prize` devolve o prêmio inteiro no pote de um lado só e na anulada (R-12). Os 30% seguem o
      `void_reason` (R-18).
- [ ] Dois usuários: A não saca o pedido de B.
- [ ] Com a pausa ligada, `sponsor_create_request` falha, e o saque não.
- [ ] O teste aleatório, ampliado com o patrocínio, mantém I1 a I10.
- [ ] No site: o pedido, com faixa, forma e divulgação; o selo, o texto e o aviso de R-19 em toda pergunta
      patrocinada.
- [ ] A página do Cloak existe em rota própria, com o aviso de carteira sem SOL.
- [ ] O IDL e o SDK foram regenerados, e o programa foi republicado na devnet.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- No programa: `state/sponsor.rs` e `instructions/sponsorship/`, no molde de `escrow` que o plano técnico cita.
- Os scripts da equipe para aceitar e recusar.

## Fora desta sprint

A página do SODAX (17). O patrocínio não divulgado de ponta a ponta: o Cloak só existe na rede principal. As
contrapartidas das faixas pagas, que são proposta, não decisão.

## Decisões do fundador que travam a sprint

- **Q5:** a aposta de patrocinador, que tem lado, no pote de um lado só e na anulada.
- **Q6:** onde ficam os 30% até a pergunta terminar.
- **L-11** e **L-18:** as telas do pedido, do aceite, da recusa e do saque, e a página do Cloak.
- As contrapartidas de cada faixa paga (resumo de produto, seção 16, item 5).

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent`, `business-red-team-agent` (faixas e contrapartidas),
  `copywriter-agent`, `coordinator-agent`.
- **Skills:** `sprint-management`, `multi-ai-review`, `feature-scaffold`, `secrets-scan`, `codemap`,
  `verify-build-works`, `decision-log`, `release-check`.

## Portões de segurança

- O teste aleatório volta a passar antes de qualquer republicação.
- O dinheiro do patrocinador nunca fica preso: recusa, 14 dias e anulação têm saída testada.
- O código do Cloak não entra na página de aposta.
- A tela diz "não divulgado", nunca "anônimo", com o aviso de R-19.
- `secrets-scan` no fechamento.

## Testes

Um teste por instrução e por erro. As três faixas, nas duas formas. Os desfechos: resolvida, de um lado só, anulada
por causa de fora e anulada por falha da casa.

## Riscos

- O patrocinador que controla o resultado e aposta. As travas de R-19 reduzem; o risco continua.
- O bloco não estar pronto quando o código for para a auditoria: o fundador escolhe entre mover a data e abrir sem
  ele (P4 §3.3).
- O cofre do Cloak ser pequeno para esconder um patrocínio grande (P4 §5.2).

## Artefatos esperados

Os arquivos de Entregas, `app/features/` (patrocínio, Cloak), o IDL, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** patrocínio pago com pedido de pergunta; página do Cloak.
- **Session-log:** as respostas de Q5 e Q6; as contrapartidas decididas.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
