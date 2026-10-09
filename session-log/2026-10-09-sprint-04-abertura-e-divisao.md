# 2026-10-09 — Sprint 04, abertura: a divisão dos arquivos e o que falta

## Context

Pedido: executar a Sprint 04 ("Window, settlement, payout, fees, creator share and invariants") de ponta a ponta,
com a onda 0 em série (fechar o contrato antes das frentes), sete frentes em paralelo e revisões na onda 3. Esta
sessão cumpriu só o começo da onda 0. O restante fica para as próximas sessões, com os arquivos abaixo como ponto
de retomada.

## Feito

- Worktree `/home/dev0xcf02/projects/solana/brot-s04`, branch `sprint-04-settlement-invariants`, a partir de
  `origin/main` (`04885bf`, tag `sprint-03`).
- Divisão sem mudança de comportamento (commit `6ed94d6`): `checks.rs` (200 linhas) ficou com 167, e a checagem de
  autoridade de upgrade foi para `checks/upgrade.rs`. `state/campaign.rs` (200 linhas) ficou com 164, e os carregadores
  de `Campaign` foram para `state/campaign/loaders.rs`. Os marcadores `// X0.9` foram com as funções, e
  `scripts/checks-mutation.mjs` lista o arquivo novo.
- Verificado nesta divisão: `cargo fmt --check`; clippy com `no-entrypoint` e com `no-entrypoint,mainnet`; testes de
  biblioteca do host; `cargo build-sbf` (o binário tem 93.480 bytes, igual ao da Sprint 03); `bun test tests/` com 262
  passando; `bun run idl` sem diferença. `bun run build:program` falhou na primeira tentativa porque o `shank` não
  estava no worktree; copiei o binário 0.4.9 de `brot/target/tools/bin` (que está no `.gitignore`).
- Um teste de CPI (`resolve refuses a cpi > top_level`) falhou em uma execução e passou nas duas seguintes; não
  achei a causa. Fica registrado para a onda 2, que deve repetir a suíte inteira.

## Não feito

- Onda 0, passos 2 (os itens de documentação da Sprint 03 e as versões da TP v0.1.2), 5 (o contrato congelado: as dez
  instruções, os eventos, os códigos de erro, a tabela de transições, as funções de `math/`, a função de reembolso
  tardio, o kit TypeScript) e 6 (as worktrees das frentes).
- Ondas 1, 2 e 3: as sete frentes (A a G, e H), a integração, o teste aleatório (I1 a I15), as revisões, os números de
  unidades de computação, o pull request.

## Retomada

- Notas em `/home/dev0xcf02/projects/solana/s04-notes/RETOMADA.md` (fora do repositório), com a lista de passos e o
  estado de cada um.
- Dependência do fundador: nenhuma pergunta sobre regra de dinheiro está em aberto. Uma decisão do time é necessária
  antes do contrato: como uma campanha sai de `Contested` antes da Sprint 14 (a instrução fica desativada, ou há um
  caminho de saída escrito).
