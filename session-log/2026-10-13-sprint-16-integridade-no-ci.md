# 2026-10-13 — Sprint 16: a integridade da versão no CI

Feita pela faixa L16 da execução paralela do líder (o registro geral do dia está em
`2026-10-13-auditoria-do-roteiro-e-faixas.md`, no PR da Sprint 18).

## Decisões de engenharia

- **O `solana-verify` é o binário da release 0.5.2, fixado pelo SHA-256**, e não um `cargo install`: o mesmo hash do
  arquivo `.sha256` da release e do digest do GitHub.
- **A imagem do build vai fixada pelo digest (`--base-image`).** Sem isso, o `solana-verify` escolhe a imagem pela
  versão de um crate no `Cargo.lock` (3.0.1), e não pela CLI 3.1.10 com que o programa é construído. O
  `[workspace.metadata.cli]` entrou no `Cargo.toml` também, para quem rodar o `solana-verify` à mão.
- **O binário do devnet publicado passa a sair do build verificável**, igual byte a byte a um segundo build limpo e ao
  binário que os testes rodaram; o layout do `programs-<sha>` não mudou, então o roteiro do devnet também não.
- **O build `mainnet` sai num artefato à parte** (`programs-mainnet-<sha>`): a checagem de artefato do deploy recusa
  uma pasta com mais de dois arquivos, e o binário da mainnet nunca vai ao devnet.
- **Uma lista só de recursos (`MAINNET_FEATURES`)** alimenta o build e os testes do T12, e o CI exige que os bytes
  publicados sejam os testados.
- **O teste negativo achou um defeito no próprio script:** `set -e` não vale dentro de `$(...)`, então um hash errado
  seguia em frente. Corrigido antes do commit.

## O que fica com o fundador

A atestação de origem: o repositório é privado numa conta pessoal, e o GitHub só a oferece a repositórios públicos ou
a organizações Enterprise. (a) Tornar o repositório público antes da mainnet (recomendado; o `verify-from-repo` da
Sprint 18 já pede isso), (b) GitHub Pro (proteção de branch e CODEOWNERS, sem atestação), (c) uma organização
Enterprise, (d) ficar como está, com o item aberto.
