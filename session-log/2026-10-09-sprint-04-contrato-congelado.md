# 2026-10-09 — Sprint 04: o contrato congelado, em três commits

## Context

A Sprint 04 precisa de um contrato congelado antes de qualquer frente começar. O fundador pediu os três commits:
(1) códigos de erro e eventos, (2) assinaturas da matemática, função de reembolso e vetores, (3) esqueletos das
instruções e o kit. Cada commit roda as suítes antes de ir para o histórico.

## Feito

- **Commit 1 (`0377a6a`).** 26 códigos de erro, numerados por frente a partir de 6091 (A: janela, equipes e
  contestação; B: matemática; C: pagamentos; D: taxa, prêmio, fechamento e varredura; G: buffer de entrada e
  entrada mínima; H: lista de feeds; compartilhado: `IllegalTransition`, 6146). Dez eventos da TP §3.4.14 com os
  discriminadores 7 a 16, com tamanho checado pelo compilador (um erro de tamanho foi pego e corrigido: a
  `CreatorShareSettled` tem 96 bytes).
- **Commit 2 (`1b847e5`).** As funções de `math/` já existentes ficaram congeladas como estão (`creator_share`,
  `distributable`, `split_payout`, `house_fee`, `one_sided_fee`). `R` nas fórmulas é o prêmio, como mostra o
  exemplo A da TP §3.4.16. Novos: `math/invariant.rs` (a variação do cofre é igual ao que a contabilidade registra)
  e `math/refund.rs` (a parte de uma entrada feita a partir do `publish_time`). Vetores: 12.000 linhas em
  `tests/vectors/math-vectors.csv`, com resultados e recusas, e um teste que regenera e compara.
- **Commit 3 (`820cd4d`).** Dez instruções, discriminadores 11 a 20, com as contas na ordem congelada, cada uma
  terminando no evento e no programa. `team_void_campaign(reason, note_hash)`, com 33 bytes. Os esqueletos recusam
  com `UnknownInstruction` antes de ler qualquer conta. A tabela de transições da TP §3.4.2 virou uma função
  (`state/transitions.rs`). O enum do Shank foi para `instructions/interface.rs` inteiro, porque o Shank lê uma
  definição só e dividi-lo dividiria a IDL. Kit: os construtores das dez, as constantes, `injectEntry`,
  `injectReviewed`, `injectSettling` e `tests/brot/money-model.ts`, o modelo de referência em BigInt, escrito à parte.

## Verificado antes dos commits

`bun run build:program`; `bun run idl` (21 instruções); `bun test tests/` (262 passam); `bun run test:rust` (sem
falhas); os testes Rust com `mainnet` (267 passam); `bunx tsc --noEmit`; `bun run lint`; `cargo fmt --check`;
clippy com `no-entrypoint` e com `no-entrypoint,mainnet`; `codemap --check`.

## Não congelado (falta para fechar a onda 0)

- **`checks::close_account` e as checagens de pagador** (`owned_by` no cofre, `distinct` entre cada destinatário e o
  cofre): as funções e seus testes negativos. Ficaram para a próxima sessão.
- **Como a entrada guarda o instante de cada junção.** A função de reembolso já recebe a lista de junções, mas a
  `Entry` só tem os totais por lado e 16 bytes reservados (`state/entry.rs`). Para devolver exatamente a parte
  entrada depois do `publish_time`, a entrada precisa do instante de cada junção. Isto muda o layout e é uma decisão
  de armazenamento com efeito no dinheiro. Opções para o fundador ou o orquestrador: (a) um registro de junção por
  entrada, com teto de junções por carteira; (b) guardar só o instante da primeira e da última junção, com o erro
  para mais, que devolve a entrada inteira; (c) um registro de junção numa conta própria. Recomendação: (a), com o
  teto escrito na regra. Não escolhi sozinho porque a opção (b) devolveria a parte antiga da entrada, que a regra não
  manda devolver.
- **Campos da campanha** para a entrada mínima copiada na abertura (pergunta 5) e para o rastro do reembolso: o
  layout ainda não os tem. Como nada está publicado, a conta pode crescer; é preciso registrar o tamanho novo.
- **A lista de feeds** (pergunta 1): onde fica, a forma por cluster e a checagem na abertura. O código `6141` existe;
  a lista não.
- **A decisão sobre o prazo de `open_campaigns`** para campanhas de equipe: contada só para campanhas pagas, decidido
  pelo fundador (pergunta 4). O contrato a registra; o código ainda não a aplica.

## Fontes

`docs/sprints/sprint-04-settlement-invariants.md`; `docs/technical/TECHNICAL-PLAN.md` v0.1.2, §3.4.2, §3.4.14,
§3.4.16; `session-log/2026-10-09-sprint-04-decisao-contested.md`.
