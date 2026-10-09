# 2026-10-09 — Sprint 04: uma conta por junção, sem limite de junções

## Decisão do fundador

Cada junção de um padeiro tem a sua própria conta (`Join`), e nada limita o número de junções por padeiro. O fundador
recusou o teto de junções: "users should be able to join as many times as they want without a cap". A função de
reembolso tardio fica exata: o instante de cada junção está na própria conta.

## Como ficou no contrato (commit `6851e29`)

- `Join`, `["join", campaign, baker, index]`, 96 bytes, tag 5 (a tag 4 continua reservada para `ReferralLink`).
  Campos: lado, campanha, padeiro, `index`, `joined_at` e `amount`.
- `Entry.join_count` (u32), nos bytes reservados: é o `index` da próxima junção. Tamanho da `Entry` inalterado (100).
- `Campaign.min_entry_lamports` (u64), nos bytes reservados, copiado da configuração na abertura (pergunta 5).
  Tamanho da `Campaign` inalterado (512).

## Consequências que o fundador deve conhecer

- **Custo de aluguel por junção.** Cada junção paga o aluguel de uma conta de 96 bytes. O valor devolve-se ao padeiro
  quando a liquidação fecha a conta. Na ordem de grandeza de Solana, cerca de 0,0016 SOL por junção [INF; a conta
  exata sai do próprio programa, em teste].
- **Liquidar um padeiro com muitas junções exige várias transações.** `settle_entry` precisa receber as contas de
  junção; um padeiro com centenas delas passa de um limite de contas por transação. A liquidação de um padeiro pode
  exigir mais de uma chamada. Isto não limita a quantidade de junções; limita o tamanho de cada transação da
  liquidação. Ficou para a Sprint 04, lane C, desenhar a chamada em lotes.

## Ainda não congelado

- `checks::close_account`. O `pinocchio` 0.11 não tem ajuda para fechar nem reatribuir uma conta. Fechar exige zerar
  os dados e trocar o dono por escrita direta no cabeçalho da conta, em código `unsafe` num caminho que move dinheiro.
  Precisa de um desenho revisto antes de escrever, com teste de revivência na mesma transação.
- A lista de feeds (pergunta 1): a forma por cluster e os ids (62 na rede principal e 17 na devnet, em 9/10/2026). Os
  ids são dados que vêm da lista da Pyth e precisam ser conferidos contra a página e os clusters.
- As frentes A a H e a onda 2 (integração) não começaram: dependem do que está acima.

## Fontes

`session-log/2026-10-09-sprint-04-contrato-congelado.md`; `docs/technical/TECHNICAL-PLAN.md` v0.1.2, §3.4.16 (a
regra de reembolso tardio).
