# 2026-10-02 — Largada: import do pred-provable e instalação do AI Dev OS

## Context

O repositório `0x4cb-caramelo/Bakedtruth` nasceu vazio (um README de uma linha). O projeto de partida é o `0xcf07/pred-provable` (Provable KPI Markets em Solana, MIT © Ronaldo Pereira), para o qual a conta `0x4cb-caramelo` foi convidada com permissão de escrita. A base de processo e regras é o `lglucas/ai-dev-operating-system` v0.5.6 (commit `9b8037d`).

## Decision

1. O `pred-provable` entrou por merge com histórico preservado (remote `upstream`, commit original `390d882`, merge `ef48a2c`). O README do projeto substituiu o README inicial.
2. O AI Dev OS foi copiado por cima sem sobrescrever arquivos do projeto. `README.md` e `LICENSE` continuam sendo os do `pred-provable`. `.gitignore` e `package.json` foram mesclados (scripts `test:os`, `self-test`, `codemap`, `prepare`).
3. Ficaram de fora: `biome.json` e a dependência do Biome, `.github/workflows/ci.yml`, `package-lock.json` e `.aios-self`.
4. O commit da instalação usou `AIOS_ALLOW_SECRET_COMMIT=1`.

## Alternatives considered

- Instalar o OS só como plugin do Claude Code: traria skills e hooks, mas não a estrutura de documentos, sprints e session-log que o projeto vai usar.
- Trazer o Biome e o CI do OS: trocaria o linter do projeto (Prettier + ESLint) e deixaria o CI vermelho, já que o repo usa Bun e Anchor, não `npm ci`.

## Why this decision

Preservar o histórico mantém a autoria do scaffold original. Não sobrescrever nada do projeto evita mudar licença, stack ou linter sem decisão explícita.

Sobre o escape do gate de segredos: o pre-commit bloqueou sete achados, todos em `scripts/test/hooks.test.js`. Esse arquivo é a suíte de testes do próprio scanner e é idêntico byte a byte ao que está público no repositório do OS; os valores são fixtures (por exemplo `AKIAIOSFODNN7EXAMPLE`, a chave de exemplo publicada pela AWS). Falso positivo, usado uma única vez.

## Risks

- O `CLAUDE.md` da raiz é o do OS e manda não codar antes das fases 1–4 do wizard, mas o projeto já chega com código. Precisa ser ajustado na Largada.
- Sem configuração de linter na raiz, o hook `lint-on-edit` fica silencioso e o `os-self-test` avisa.
- Sem CI: nenhum check roda no push até existir um workflow próprio do projeto.
- `package.json` ainda aponta `repository` para `0xcf02/pred-provable`.

## Follow-ups

- Rodar o wizard a partir de `START-HERE.md` e adaptar `CLAUDE.md` ao projeto.
- Decidir linter da raiz (manter Prettier/ESLint ou adotar Biome) e escrever um CI próprio.
- Gerar `CODEMAP.md` com `node scripts/codemap.js`.
- Rodar os testes do projeto (`bun test`, `cargo test`) num ambiente com Bun, Anchor e Solana CLI.

## Related links

- Sprint: —
- Changelog: —
- Issue/PR: —
