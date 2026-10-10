# 2026-10-09 — Sprint 04: como uma campanha sai de `Contested` antes da Sprint 14

## Context

A Sprint 04 precisava decidir, antes do contrato congelado, como uma campanha sai de `Contested` (TP §3.4.2, C48).
A instrução que abre a contestação (`team_open_contest`) muda as listas de contas. O fundador foi consultado.

## Decisão

- **Entrada:** `team_open_contest` leva uma campanha de `InReview` (dentro da janela) a `Contested`, e o pagamento
  fica pausado. Continua permitida, como diz a TP §3.4.2.
- **Saída:** nenhum caminho sai de `Contested` até a Sprint 14. A instrução de saída (`reread_campaign`,
  `admin_decide_contest`) é escrita só na Sprint 14, e enquanto isso fica desativada.
- O contrato congelado da Sprint 04 não inclui conta de saída.

## Alternativas recusadas

- Escrever já um caminho de saída (`reread_campaign` ou uma decisão do admin). Recusado: exigiria a segunda leitura
  (Sprint 07 e 14) e uma chave com poder de decidir o resultado, o que o desenho proíbe nesta fase.

## Consequência para a Sprint 04

- Há um caminho feliz para entrar: `team_open_contest` em `InReview`, com o pagamento pausado.
- Há testes de recusa para a saída: nenhuma instrução de saída de `Contested` é aceita nesta versão.
- Uma contestação fora da janela, ou por chave que não é do time, é recusada com o erro próprio.

Fontes: `docs/sprints/sprint-04-settlement-invariants.md` (item de `Contested`); `docs/technical/TECHNICAL-PLAN.md`,
§3.4.2 e C48 (v0.1.2). Resposta do fundador, 2026-10-09: "A campaign should leave Contested only by a disabled instruction until Sprint 14".
