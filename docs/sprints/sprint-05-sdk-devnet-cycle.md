# Sprint 05 — SDK e ciclo inteiro na devnet

**Estado:** planejada · **Branch:** `sprint-05-sdk-devnet-cycle` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B5 (seções 3.2, 3.3 e 10) |
| Depende de | Sprint 04 |
| Regras e fluxos cobertos | R-01 a R-04, nas contas do cliente; R-13, com o SIM de stake conferido. F7, por script |

## Objetivo

Juntar as peças. `packages/sdk` vira a biblioteca que o site, os serviços, os scripts e os testes usam; o programa
vai para a devnet; e um ciclo inteiro roda lá, acionado por script.

## Critério de pronto

- [ ] `packages/sdk/src` tem `idl/`, `pdas.ts`, `math.ts`, `readers/`, `instructions/`, `events.ts`, `view.ts`,
      `format.ts` e `errors.ts`. Não importa React nem Next, e a regra `no-restricted-imports` do ESLint falha se
      importar.
- [ ] `math.ts` (chance; retorno estimado com a aposta do usuário já no pote; "sem chance" com pote vazio) dá, em
      teste, o mesmo número que o programa.
- [ ] `errors.ts` tem uma mensagem por código de erro do programa (L-06).
- [ ] `tests/helpers.ts` usa o SDK; `app/lib` deixa de ser a biblioteca compartilhada.
- [ ] O `.so` publicado na devnet é o artefato do CI, com o SHA-256 conferido. Publicar e chamar
      `admin_initialize_config` acontecem na mesma sessão.
- [ ] `scripts/team/` propõe, aprova, cancela, confirma, anula, contesta e pausa, cada pessoa com a própria chave.
- [ ] `bun run smoke:devnet`, reescrito, roda propor, aprovar, apostar, resolver, janela e pagar, e sai com código
      zero.
- [ ] Conferido na devnet e anotado: um SIM do `StakeAtLeast`; a Pyth; a virada de época; o tamanho real do lote de
      pagamentos (C7); o aluguel de uma `Position` (C6); o desvio do relógio (C12).
- [ ] `bun run seed:devnet`, reescrito, abre perguntas de exemplo dos tipos que passaram.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- O SDK completo, adaptado de `app/lib` (plano técnico, seção 3.3).
- Os scripts da equipe e os dois scripts de devnet reescritos.
- O programa na devnet, com o teto ligado num valor de teste (L-19).
- A nota com o resultado das conferências que só uma rede de verdade permite.

## Fora desta sprint

O serviço que resolve e paga sozinho (06): aqui o script aciona. O indexer (08). O site (09). A migração para
`@solana/kit` (T9).

## Decisões do fundador que travam a sprint

Nenhuma nova. A resposta de **Q12** (quem guarda a chave de atualização na devnet) precisa existir para publicar.

## Agentes e skills

- **Agentes:** `dev-product-agent`, `technical-security-red-team-agent` (o procedimento de publicar e inicializar),
  `bug-triage-agent`, `coordinator-agent`.
- **Skills:** `sprint-management`, `secrets-discipline` (chaves de devnet e de equipe, na máquina de quem roda),
  `secrets-scan`, `codemap`, `verify-build-works`, `decision-log`, `release-check`.

## Portões de segurança

- O programa é compilado no CI. Nada compilado em máquina local nem no servidor vai para a rede.
- A chave de atualização não vai para o GitHub nem para o servidor.
- Quem chama primeiro a inicialização vira administrador: publicar e inicializar na mesma sessão.
- `StakeAtLeast` não abre pergunta real sem um SIM conferido.
- `secrets-scan` no fechamento.

## Testes

`bun run test` em `packages/sdk`, com as contas conferidas contra o programa. `bun run smoke:devnet` na rede.

## Herdado da Sprint 00

Da revisão de segurança que fechou a Sprint 00 (`docs/sprints/sprint-00-setup.md`).

- Na primeira publicação na devnet, baixar o artefato sempre pelo número da execução de push na `main` (`gh run download <número>`), nunca só pelo nome, e conferir o `SHA256SUMS`. O roteiro de publicação escreve isso.
- A chave do endereço do programa precisa de cópia de segurança fora de `target/deploy/` antes da publicação, e o comando de publicação aponta para essa cópia.
- O endereço do programa no SDK vem do IDL (`idl.address`). Manter assim ao mover `app/lib`.

## Riscos

- O limite da torneira de USDC da Circle travar os testes (C5).
- Os limites do RPC público.
- O SIM do stake de validador não sair: o tipo fica fechado, e os outros quatro seguem.

## Artefatos esperados

`packages/sdk/`, `scripts/team/`, `scripts/devnet-smoke.ts`, `scripts/devnet-seed.ts`, o endereço do programa na
devnet anotado, a nota das conferências em `knowledge-base/tecnologia/`, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** SDK; primeira publicação do programa na devnet.
- **Session-log:** o resultado das conferências de rede e quais tipos abriram.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
