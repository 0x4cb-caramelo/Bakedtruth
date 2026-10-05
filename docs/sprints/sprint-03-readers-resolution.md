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
- [ ] A leitura de preço passa no Surfpool, dentro de uma instrução, com a versão fixada na conferência automática
      e o SHA-256 do binário conferido (C4). É o critério que a Sprint 01 não cumpriu e trouxe para cá.
- [ ] Cada item da seção "Herdado da Sprint 01" está feito, ou decidido por escrito com o motivo.
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
- **Da Sprint 01:** o limite de 30 segundos para a idade do preço vale também na devnet, ou vira um parâmetro por
  pergunta. A Sprint 01 concluiu que a Pyth serve, então a escolha entre quatro e cinco tipos não se coloca.

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

## Herdado da Sprint 01

Da prova do leitor de preço (`docs/sprints/sprint-01-foundation.md`; a pesquisa está em
`knowledge-base/tecnologia/pyth-leitor-de-preco.md`).

- **A leitura no Surfpool, que a Sprint 01 não fez.** Fixar o Surfpool v1.6.0 na conferência automática (só há
  binário para Linux e macOS), com o SHA-256 do binário conferido, e rodar o leitor de preço dentro de uma instrução
  contra o modelo de `PriceUpdateV2` dele. Usar o sistema de cenários para simular o preço encostando no alvo ao
  longo do tempo. Conferir também se ele simula o stake de época (a metade de C4 que ficou sem resposta).
- **`price_touch.rs` já existe, só com a leitura.** `read_price_update` confere dono, tamanho, discriminador,
  verificação completa e o ativo esperado, que é parâmetro obrigatório. Não confere a idade do preço: quem chama
  confere. Instrução usa `read_price_account`, que tira dono e bytes da mesma conta.
- **Separar a conta aceita na aposta da conta aceita na prova** (revisão adversarial da Sprint 01). O plano técnico
  diz "o programa aceita qualquer conta válida"; isso deixa quem aposta apresentar uma conta avulsa com o preço mais
  velho que a regra admite, anterior ao toque. Proposta: na aposta, exigir a conta patrocinada do ativo, cujo
  endereço é derivado do identificador no programa `pyt2F4...`, mais a idade máxima; na prova do SIM, aceitar
  qualquer conta completa do ativo dentro do prazo. Antes de decidir, conferir se a conta patrocinada só anda para
  a frente (o programa declara o erro `UpdatesNotMonotonic`; o código não foi lido).
- **A conta `preço − margem` precisa alargar os tipos.** `price` é `i64` e pode ser negativo; `conf` é `u64`. Usar
  `i128` ou `try_from`, e testar com valores extremos: preço negativo, margem máxima, expoente fora do esperado.
- **O risco de quem controla a Pyth já está na seção 13 do plano técnico.** Na devnet uma chave comum atualiza o
  receptor; na rede principal é um endereço derivado cujo controle não foi conferido. A governança do receptor
  troca a fonte dos preços e o mínimo de assinaturas sem reinstalar o programa. O vigia está na Sprint 07 e a
  conferência da rede principal na 16. Aqui, basta o desenho da pergunta de preço contar com esse risco.
- **Uma conta de preço da rede principal entre as contas capturadas.** As três de hoje são da devnet.
- **O horário de publicação pode estar à frente do relógio da rede.** Calcular a idade como "agora menos publicação"
  dá número negativo. A regra tem de tratar isso sem estouro e sem recusar preço bom.
- **A idade máxima do preço como parâmetro, e não número fixo.** Numa medida de um a dois minutos, a conta
  patrocinada renovou a cada 5 a 11 segundos na rede principal e a cada 62 a 64 na devnet, onde o preço teve de 5 a
  64 segundos de idade. Com 30 segundos fixos, a aposta em pergunta de preço só entra na devnet numa parte de cada
  ciclo, enquanto o preço ainda tem menos de 30 segundos, a não ser que o nosso serviço publique preço. Depende da
  resposta do fundador (seção acima).
- **Levantar quais ativos têm conta patrocinada na geração atualizada** (pergunta em aberto 2 da nota). Se a aposta
  exigir a conta patrocinada, essa lista limita de quais ativos se abre pergunta.
- **Só a geração atualizada da Pyth é aceita** (`rec2HH...`). A conta de preço que a pergunta grava na criação tem
  de ser dessa geração.

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
