# Sprint 04 — Janela, acerto, pagamento e taxa

**Estado:** planejada · **Branch:** `sprint-04-settlement-invariants` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B4 (seções 3.4.4, 3.4.5, 3.4.7 e 3.4.13) |
| Depende de | Sprint 03 |
| Regras e fluxos cobertos | R-01, R-02, R-10, R-11, R-23, R-24; R-12, R-25, R-29, R-30, R-31 e R-32 em parte. F3, F4, F5, F6 (passos 1 a 4) |

## Objetivo

Fechar o caminho do dinheiro: janela de 6 horas, acerto nos três modos, pagamento por posição e taxa. E provar, com
o teste aleatório, que as dez invariantes de dinheiro se mantêm. **É o portão do roteiro:** nenhuma sprint de
serviço ou de site usa o programa antes de esta fechar.

## Critério de pronto

- [ ] Existem `team_confirm_result`, `team_void_question`, `team_open_contest`, `finalize_question`,
      `settle_position`, `collect_fee`, `settle_prize`, `close_question` e `sweep_fees`.
- [ ] Os exemplos do plano são casos de teste: com 300 no SIM e 700 no NÃO, 1 USDC rende 3,10 se der SIM e 1,39 se
      der NÃO (R-02); Ana, Bruno e Carla recebem 100, 198 e 297, e a casa fica com 5 (R-10).
- [ ] A taxa arredonda para cima e o pagamento para baixo, com contas em `u128`. Depois de `close_question` o cofre
      fica em zero (I6).
- [ ] **Teste aleatório, com semente fixa:** centenas de operações sorteadas (apostar, pausar, mandar USDC à mão,
      avançar o relógio, resolver, anular, acertar, pagar fora de ordem e duas vezes, fechar a conta de USDC de um
      vencedor), com I1 a I10 conferidas depois de cada uma.
- [ ] Pote de um lado só, uma linha por caso: só vencedores, só perdedores, ninguém, um só apostador, com e sem
      prêmio.
- [ ] Dois usuários: A não recebe, não fecha e não redireciona a posição de B.
- [ ] Com a pausa ligada, só `user_place_bet` e `team_approve_question` falham (I10).
- [ ] Conta de USDC fechada, de outro dono ou congelada: falha só aquela posição, e o valor fica no cofre.
- [ ] Toda transição fora do desenho da seção 3.4.2 é recusada com erro próprio.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- `math/fees.rs`, `math/payout.rs` e `math/invariant.rs`; as pastas `instructions/resolution/` e `settlement/`.
- Os eventos `ResultConfirmed`, `QuestionVoided`, `ContestOpened`, `QuestionFinalized`, `PositionSettled`,
  `FeeCollected`, `PrizeSettled` e `QuestionClosed`.
- O tamanho do lote de pagamentos, medido no LiteSVM (T3) e conferido na devnet na Sprint 05.

**Dois pontos que o plano técnico deixa abertos.**

- `team_open_contest` pausa o pagamento, mas a saída de `Contested` é do bloco B9. A equipe técnica decide, antes
  de fechar, se a instrução fica desligada até a Sprint 14 ou como a pergunta sai desse estado.
- `prize_amount` só recebe valor pelo patrocínio (Sprint 15). Aqui R-12 é provada na conta; o caminho inteiro fecha
  na 15.

## Fora desta sprint

A segunda leitura da disputa, a indicação e o patrocínio (14 e 15). O serviço que envia os pagamentos (06). A
contestação com depósito (fase 1.2).

## Decisões do fundador que travam a sprint

- **Q2 (L-15):** o vencedor que fechou a conta de USDC pode pedir o envio pela própria carteira?
- **Q1** e **Q3**, se ainda abertas.

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent`, `devils-advocate-agent` (I9), `dev-product-agent`,
  `coordinator-agent`.
- **Skills:** `sprint-management`, `multi-ai-review`, `codemap`, `verify-build-works`, `decision-log`,
  `secrets-scan`, `release-check`.

## Portões de segurança

- Nenhum pagamento lê o saldo vivo do cofre.
- O destino é sempre uma conta de USDC do `bettor`.
- A pausa nunca trava pagamento nem devolução. Fora da janela ninguém anula.
- Revisão adversarial e `secrets-scan` no fechamento.

## Testes

Funções puras em `bun run test:rust`. O resto em `bun run test`, com LiteSVM.

## Riscos

- Um erro de arredondamento prender ou criar unidades mínimas.
- Depois de `Settling` um resultado errado não tem correção.

## Artefatos esperados

Os arquivos de Entregas, o teste aleatório em `tests/`, o IDL, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** janela, acerto, pagamento, taxa e teste de invariantes.
- **Session-log:** a resposta de Q2; a decisão sobre `team_open_contest`; o resultado da revisão adversarial.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
