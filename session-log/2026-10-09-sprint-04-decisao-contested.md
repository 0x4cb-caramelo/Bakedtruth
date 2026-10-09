# 2026-10-09 — Sprint 04: como uma campanha sai de `Contested` antes da Sprint 14

## Context

A Sprint 04 precisava decidir, antes do contrato congelado, como uma campanha sai de `Contested` (TP §3.4.2, C48).
A instrução que abre a contestação (`team_open_contest`) muda as listas de contas. O fundador foi consultado.

## Decisão

- **Sim:** `team_open_contest` e qualquer caminho para fora de `Contested` ficam **desativados** até a Sprint 14. A
  Sprint 04 não escreve a saída; a Sprint 14 escreve `reread_campaign` e `admin_decide_contest` junto com a segunda
  leitura.
- Nenhuma campanha entra em `Contested` nesta versão do programa, porque a instrução que leva até lá está desativada.
  Por isso o contrato congelado da Sprint 04 não inclui conta de saída.

## Alternativas recusadas

- Escrever já um caminho de saída (`reread_campaign` ou uma decisão do admin). Recusado: exigiria a segunda leitura
  (Sprint 07 e 14) e uma chave com poder de decidir o resultado, o que o desenho proíbe nesta fase.

## Consequência para a Sprint 04

- A contestação não tem teste de caminho feliz. Tem um teste de recusa: `team_open_contest` falha com o erro próprio
  enquanto a instrução estiver desativada.
- O estado `Contested` continua no enum (é a fase de payout pausado, TP §3.4.2); nenhuma instrução da Sprint 04 o
  alcança.

Fontes: `docs/sprints/sprint-04-settlement-invariants.md` (item de `Contested`); `docs/technical/TECHNICAL-PLAN.md`,
§3.4.2 e C48 (v0.1.2). Decisão do fundador, 2026-10-09 (resposta 1 da lista de decisões do `Contested`).
