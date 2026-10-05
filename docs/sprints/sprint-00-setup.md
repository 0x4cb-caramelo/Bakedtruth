# Sprint 00 — Setup

**Estado:** planejada · **Branch:** `sprint-00-setup` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B0 |
| Depende de | Nenhuma sprint |
| Regras e fluxos cobertos | Nenhuma. É a fundação do repositório |

## Objetivo

Deixar o repositório pronto para o programa novo: trazer `upstream/main`, criar o esqueleto de
`programs/brot-markets` e de `packages/sdk`, e fazer a conferência automática (CI) conferir e publicar o que a
construção precisa.

## Critério de pronto

- [ ] Os documentos da Fase 4 estão na `main`, e a branch da sprint abre de lá. Hoje eles estão em
      `feat/layout-tape`.
- [ ] `upstream/main` (commit `4d672ae`, que contém o `7b3196d`) está no repositório: `resolver.rs` com nove
      leitores, `tests/fixtures/*.bin` e `scripts/capture-fixtures.ts` existem na árvore.
- [ ] `programs/brot-markets` existe, com endereço próprio, e `bun run build:program` compila os dois programas.
- [ ] `packages/sdk` existe; o workspace do Bun inclui `packages/*` e `services/*`; `bun install --frozen-lockfile`
      passa.
- [ ] O CI roda, além do que já roda, `node scripts/codemap.js --check`, `node scripts/os-self-test.js` e a
      varredura de segredos; confere o IDL de `brot_markets`; e publica o `.so` e o IDL como artefato, com o SHA-256.
- [ ] A conferência padrão passa, com os comandos de Rust apontando para o pacote novo.
- [ ] Um envio de teste com o `CODEMAP.md` velho e outro com o IDL velho fazem o CI falhar.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- A vinda de `upstream/main`, por merge ou só com os leitores e as contas capturadas (T1), mantendo o aviso de
  autoria da licença MIT.
- O esqueleto do programa: `lib.rs`, `constants.rs`, `error.rs`, `events.rs` e as pastas `state/`, `math/`,
  `readers/` e `instructions/` (plano técnico, seção 3.2).
- O esqueleto de `packages/sdk`, com `idl/`; a cópia do IDL passa a ir para lá.
- O CI ampliado (plano técnico, seção 10).
- Os `.env.example` conferidos, sem valores.

## Fora desta sprint

Qualquer instrução do pote. O leitor de preço. O servidor. Mover `app/lib` para o SDK (Sprint 05). Tirar
`programs/pred-provable` do workspace (Sprint 03).

## Decisões do fundador que travam a sprint

- A aprovação do resumo de produto, do plano técnico e deste roteiro (wizard, etapa 5.1).
- O sinal para trazer o `upstream/main`: o repositório do Ronaldo pode estar no meio de uma atualização.
- A etapa 4.3 do wizard (`docs/technical/registry-pick.md`) ainda não existe.

## Agentes e skills

- **Agentes:** `dev-product-agent`, `technical-security-red-team-agent` (revê o CI: ações por hash, artefato com
  hash), `coordinator-agent`.
- **Skills:** `sprint-management`, `registry-pick`, `codemap`, `os-self-test`, `secrets-discipline`, `secrets-scan`,
  `verify-build-works`, `decision-log`.

## Portões de segurança

- O par de chaves do endereço do programa novo não entra no Git.
- A chave de atualização não vai para o GitHub nem para o servidor.
- As ações do CI continuam fixadas por hash.
- `secrets-scan` no fechamento.

## Testes

Os dois conjuntos que já existem (`bun run test` e `bun run test:rust`) seguem verdes depois do merge. Os portões
novos do CI são provados com uma falha de propósito.

## Riscos

- O merge do `upstream` conflitar com `feat/layout-tape`, que difere da `main` em 220 arquivos.
- Dependências presas subirem no merge: `@solana/kit ~8.3.0` e `solana-epoch-stake =3.0.0` ficam como estão.
- Dois programas compilando deixarem o CI mais lento.

## Artefatos esperados

`programs/brot-markets/`, `packages/sdk/`, `.github/workflows/ci.yml`, `package.json` com o workspace novo,
`CODEMAP.md`.

## Changelog e session-log

- **Changelog:** programa novo criado; `upstream` trazido; CI ampliado.
- **Session-log:** a escolha de T1 e o porquê.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
