# Sprint 03 — Leitores e resolução

**Estado:** planejada · **Branch:** `sprint-03-readers-resolution` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B3 (seções 3.4.6 e 3.4.8) |
| Depende de | Sprints 01 e 02 |
| Regras e fluxos cobertos | R-08, R-09, R-13, R-14; R-11 na anulação automática. F3 (a leitura), F5, F7 (a conferência da conta) |

## Objetivo

O programa lê o resultado sozinho. Entram os quatro leitores portados de `upstream/main` e o leitor de preço por
toque; `resolve_question` grava o resultado e abre a janela; e a aposta trava quando o fato acontece.

## Critério de pronto

- [ ] `readers/` tem um arquivo por leitor, abaixo de 200 linhas: `spl_mint.rs` (`SupplyAtMost`), `damm_v2.rs`
      (`DammV2LockedAtLeast`), `stake_pool.rs` (`StakePoolTvlAtLeast`), `vote_stake.rs` (`StakeAtLeast`),
      `price_touch.rs` (`PriceTouch`) e `cursor.rs`.
- [ ] Cada leitor passa contra as contas reais de `tests/fixtures/*.bin`. Conta cortada ou malformada dá erro, nunca
      pânico.
- [ ] Cada leitor portado dá o mesmo resultado que o original de `pred-provable` sobre a mesma conta.
- [ ] `resolve_question` só aceita chamada no nível da transação e grava `InReview`, `outcome`, `observed_value` e
      `review_ends_at`.
- [ ] A tabela da seção 3.4.6 virou casos de teste: `Yes` antes do prazo, `No` depois, `met_late`, e `Void` por
      `MissedWindow` e por `UnreadableAccount`.
- [ ] `user_place_bet` recusa quando `outcome_knowable` diz que o resultado já é conhecível; em preço, também sem
      preço fresco ou com o alvo tocado.
- [ ] Leitor de preço testado com preço fresco, velho, com margem larga, de outro ativo, com conta falsa e com toque
      dentro e fora do prazo.
- [ ] Token do padrão novo (Token-2022) é recusado na pergunta de queima.
- [ ] `programs/pred-provable` sai do workspace, num commit só, e `tests/pred-provable.test.ts` sai com ele.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- Os cinco leitores, cada um com `validate_at_creation`, `outcome_knowable` e `try_resolve`.
- `resolve_question` e o evento `QuestionResolved`, com o número lido.
- `ReaderKind` fechado em cinco variantes: saem os quatro leitores de R-14 e o `LockedAtLeast`.
- Os números do leitor de preço (idade máxima, prazo da prova, margem de erro), como ponto de partida (T2).

## Fora desta sprint

Confirmar, anular à mão, contestar, acertar e pagar (04). O serviço que publica preço (06). Token-2022 e
`LockedAtLeast` (fase 1.2).

## Decisões do fundador que travam a sprint

- **Q1:** quem pode acionar a leitura e o pagamento, só os dois serviços ou qualquer carteira.
- **Q4:** o que conta como "encostou no alvo" na pergunta de preço.
- Se a Sprint 01 concluiu que a Pyth não serve: quatro tipos, ou rever a decisão dos cinco.

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent` (dono, formato e pânico em cada leitor; a fresta de 30 segundos),
  `dev-product-agent`, `bug-triage-agent` (divergência entre o leitor portado e o original), `coordinator-agent`.
- **Skills:** `sprint-management`, `multi-ai-review` (o leitor de preço), `codemap`, `verify-build-works`,
  `decision-log`, `secrets-scan`.

## Portões de segurança

- Não existe leitor genérico. Cada leitor confere dono e formato antes de ler.
- `resolve_question` rejeita chamada por outro programa.
- Arquivo portado mantém o aviso de autoria da licença MIT.
- `secrets-scan` no fechamento.

## Testes

`bun run test:rust` com as contas capturadas. `bun run test` para a resolução e a trava da aposta. Surfpool para o
leitor de preço.

## Riscos

- `StakeAtLeast` nunca deu SIM em teste, porque o LiteSVM devolve zero. O tipo não abre pergunta real antes de um
  SIM conferido na devnet (Sprint 05).
- Toque curto não capturado, e a fresta de 30 segundos na aposta.
- Com o programa antigo fora, o site atual fica sem programa por trás até a Sprint 09. Conferir que o build do app
  segue passando.

## Artefatos esperados

`programs/brot-markets/src/readers/`, `instructions/resolution/resolve_question.rs`, os testes em
`programs/brot-markets/tests/`, o IDL, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** cinco leitores e resolução; programa antigo retirado.
- **Session-log:** as respostas de Q1 e Q4; os números do leitor de preço e o porquê.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
