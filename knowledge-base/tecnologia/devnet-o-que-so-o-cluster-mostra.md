# O que só um cluster de verdade mostra — Sprint 05

Nota de 9 de outubro de 2026, entregável da Sprint 05 ("a note on what only a real cluster could check"). Separa o que
foi conferido nesta máquina, e como, do que só o devnet (ou um validador Agave) pode mostrar. As seções 1 a 4 não
mediram nada no devnet. A seção 5 traz as leituras só de leitura feitas no devnet na noite de 9/10, com a autorização
do Ronaldo; nenhuma transação foi enviada.

## 1. Fatos

### 1.1 Onde a Sprint 05 rodou o programa

- **LiteSVM (npm 1.5.0)**, nos testes de `bun test tests/`: o programa compilado, com o relógio, os preços e as contas
  de terceiros escritos à mão a partir das capturas de `tests/fixtures`.
- **Surfpool 1.5.0 `--offline`**, dentro de um namespace de rede só com loopback (`unshare -rn`,
  `scripts/validator/isolate.ts`), nos ensaios: o deploy (`bun run deploy:rehearse`), os scripts da equipe
  (`team:rehearse`), o smoke e o seed, e a rodada dos testes negativos (`validator:negative`: os 373 casos da matriz
  de slots, 50 recusas de regra, uma abertura paga igual à cotação do SDK). Todos saíram com código 0, na rodada do
  assistente de operações e na conferência que refiz.
- **Por que não o `solana-test-validator`:** a versão 3.1.10 não inicia nesta máquina: "Incompatible CPU detected:
  missing AVX2 support" (o processador é um i5-3210M, só AVX). Os runners do GitHub têm AVX2 [INF: é o que se espera de
  máquinas x86 de nuvem atuais; não foi conferido na documentação do GitHub nesta sessão].
- **O Surfpool também é baseado no LiteSVM**, e não no validador Agave. A linha da definição de pronto pedia "Surfpool
  ou `solana-test-validator`" por causa de uma revisão da Sprint 02: o Mollusk 0.14 e o LiteSVM npm não são o runtime do
  cluster. O Surfpool atende a letra da linha, não o motivo.

### 1.2 Uma diferença que já apareceu: o aluguel

O cluster local cobra o aluguel na taxa antiga do LiteSVM: o preview do smoke mostrou 4.454.400 lamports pela
`Campaign` (512 bytes) e 890.880 pelo cofre (0 bytes), 6.960 lamports por byte com os 128 de cabeçalho. O devnet,
medido na Sprint 02, cobra 5.080 por byte: 3.251.200 e 650.240 (TP §3.4.1). O SDK nunca usa uma constante: a prévia lê
`getMinimumBalanceForRentExemption` do próprio cluster (`packages/sdk/src/read/rpc.ts`), e o programa lê o sysvar
`Rent` na hora (Sprint 04). Os valores do devnet precisam ser lidos de novo no dia do deploy.

### 1.3 Lamports de um estranho nos endereços de um programa

Ensaiado no cluster local (`scripts/deploy/rehearse-funded.ts`, com o `solana program deploy` de verdade, CLI 3.1.10),
em 9/10/2026:

- **O endereço do ProgramData com lamports:** o deploy falha ("Create Account ... already in use") e nenhuma chave
  consegue tirar os lamports de lá; aquele id nunca mais pode ser publicado naquele cluster. Como o id do programa é
  público, cerca de 0,001 SOL bastaria para bloqueá-lo. O LiteSVM roda o código do loader do Agave, então o mesmo deve
  valer no devnet [INF].
- **O endereço do programa com lamports:** o deploy falha até quem tem o keypair do programa transferir os lamports
  para fora (`solana transfer --from <keypair> ... ALL`); depois disso o deploy passa.
- **O endereço da config com lamports:** `admin_initialize_config` assume a conta; nada a fazer.

### 1.4 Uma peculiaridade do Surfpool 1.5.0

Depois de `surfnet_timeTravel` com `absoluteEpoch`, o slot do sysvar Clock aparece como 0, enquanto `getEpochInfo` dá o
primeiro slot da época (visto pelo assistente de operações; não reproduzido de propósito por mim). As estimativas de
início de época que leem o Clock saltam nesse caso. Vale uma linha em `knowledge-base/tecnologia/surfpool.md`.

## 2. O que só o devnet mostra, e como medir

Cada item é uma linha da definição de pronto ("Checked on devnet and recorded"). Três deles só leem o cluster (a
idade da conta SOL/USD, os aluguéis, a deriva do relógio) e podem ser feitos antes de qualquer deploy: esperam só a
autorização do fundador para tocar um cluster, que esta sessão não tinha. Os outros esperam o deploy.

| O quê | Por que só no cluster | Como medir |
|---|---|---|
| Um SIM de `StakeAtLeast` | O LiteSVM npm e o Surfpool respondem 0 a `sol_get_epoch_stake`; só o Mollusk injeta stake (Sprint 03) | Abrir com um build `stake-at-least` (nunca o artefato padrão) e resolver na época medida; sem isso o tipo continua fechado |
| A idade da conta SOL/USD patrocinada contra `max_price_age` | A cadência real da Pyth no devnet (62 a 64 s medidos na Sprint 01) decide se 120 s bastam | Uma semana de leituras (`scripts/pyth-sponsored-feeds.ts`), registradas em `knowledge-base/` |
| Uma virada de época | O relógio e o calendário de épocas do cluster, não os escritos à mão | Uma campanha de pool de stake aberta antes da virada e resolvida depois |
| O lote real de `settle_entry`, com os eventos por self-CPI, e o seu custo em CU (T3, C7) | O LiteSVM mediu 12 entradas e 2.926 a 3.180 CU por entrada (Sprint 04); o limite de escrita por conta é do cluster | `scripts/measure-settle.ts` contra o devnet, depois do deploy |
| O aluguel de `Campaign`, `Entry` e `Join` | Ver 1.2 | `getMinimumBalanceForRentExemption` de 512, 116 e 96 bytes |
| A deriva do relógio (C12) | O `unix_timestamp` do devnet contra a hora de parede; slots de ~235 ms | `scripts/devnet-clock-probe.ts` |
| As recusas e o ciclo no runtime Agave | Ver 1.1 | O smoke no devnet (`bun run smoke:devnet -- --cluster devnet`, ~4,7 SOL por rodada) e, antes, a rodada negativa num `solana-test-validator` em máquina com AVX2 |
| Os limites do RPC público e do faucet | "Not intended for production"; os limites do faucet não foram lidos | Anotar falhas e esperas das rodadas do smoke |

## 3. Inferências

- **Um trabalho de CI com `solana-test-validator` fecharia o motivo da linha da Sprint 02** antes do deploy. Mas a rodada
  negativa de hoje escreve contas por `surfnet_setAccount`, um atalho que o validador Agave não tem: no Agave, cada
  estado precisaria ser alcançado por instruções reais, ou carregado na partida (`--account`).
- **O smoke no devnet pode usar os valores reais.** A campanha de queima resolve SIM antes do prazo e a confirmação da
  equipe encerra a janela; não precisa de build de treino.

## 4. O que não foi feito

- Nada foi enviado à mainnet. No devnet, as leituras de 9/10 às 22h (seção 5) e, depois, o deploy e o smoke (5.7).
- O `solana-test-validator` não rodou (1.1).
- O seed não rodou no devnet (seção 5.7 para o deploy e o smoke).

## 5. As leituras no devnet, 9/10/2026, das 22h00 às 22h06 (horário de Brasília)

Só leitura, com a autorização do Ronaldo para as leituras que não escrevem nada ("read-only devnet checks (dry run,
SOL/USD price age, rents, clock drift)"). Um script avulso, fora do repositório, chamou `getGenesisHash`,
`getAccountInfo`, `getMinimumBalanceForRentExemption`, `getEpochInfo`, `getRecentPerformanceSamples` e `getBalance` em
`https://api.devnet.solana.com`, e decodificou a conta de preço com o `readPriceUpdate` do SDK. O nó respondeu o genesis
`EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG` (o do devnet) e `solana-core` 4.4.0-beta.0.

### 5.1 Os endereços do programa estão livres

| Endereço | Conta | Na leitura |
|---|---|---|
| O programa | `6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN` | não existe |
| O ProgramData dele | `Du61i6KnNVrTLnU5n2Nn9JcxQKzdyxM3owSqqVrkns6h` | não existe |
| A config | `FSFeeWWVwNKL8LWSNGejM6ZLKSw79WaP1GwmpZcxLFqw` | não existe |
| A autoridade de eventos | `E5CgcK5xs4YfPdBLnCWTAA9ruStbTqLjEzTxtVaRuB5o` | não existe |

Ninguém tinha bloqueado o id (1.3) até essa hora. Qualquer pessoa ainda pode bloqueá-lo antes do deploy: o ensaio a
seco lê os mesmos endereços de novo no dia, e para se algum mudou.

### 5.2 Os aluguéis

| Conta | Bytes | Lamports |
|---|---|---|
| `GlobalConfig` | 400 | 2.682.240 |
| `Campaign` | 512 | 3.251.200 |
| `Entry` | 116 | 1.239.520 |
| `Join` | 96 | 1.137.920 |
| Cofre e cofre de taxas | 0 | 650.240 cada |

Todos dão 5.080 lamports por byte, com os 128 de cabeçalho, como na Sprint 02. Os dois aluguéis de uma abertura
(`Campaign` e cofre) somam 3.901.440, o número que a prévia da abertura usa. A primeira entrada de um padeiro paga
`Entry` e `Join`, 2.377.440 lamports; cada nova entrada da mesma pessoa, mais um `Join`.

### 5.3 A conta SOL/USD contra `max_price_age`

A conta patrocinada `7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE` (dona `rec2HH…`, verificação completa, feed
`ef0d8b…`), lida 46 vezes, cerca de uma a cada seis segundos, de 01h00m42s a 01h05m42s UTC:

- **Atualizou a cada 61 a 63 segundos**, com uma atualização a mais 11 segundos depois de outra.
- **Idade máxima vista: 64 segundos**, medida contra o `unix_timestamp` do sysvar Clock. O `max_price_age` de
  `deploy/devnet/init-params.json` é 120: folga de 56 segundos nessa janela.
- **Confiança de 2 a 3 pontos-base**, contra o limite de 50. Preço entre US$ 109,24 e US$ 109,35.

Cinco minutos não são a semana de leituras que a Sprint 02 pediu antes dos valores da mainnet; essa semana continua
com a Sprint 06.

### 5.4 O relógio

O `unix_timestamp` do sysvar Clock menos o relógio desta máquina (sincronizado por NTP, conferido no `timedatectl`),
nas mesmas 46 leituras: de −1,7 a −0,2 segundo, mediana −1,1. O sysvar guarda segundos inteiros, o que sozinho já o
atrasa até um segundo, e a meia ida e volta do RPC (de 150 a 620 ms) entra na conta. Leitura: o relógio do devnet anda
dentro de cerca de um segundo da hora de parede. Na Sprint 01, uma leitura isolada deu um segundo à frente.

### 5.5 A época, o slot e a carteira do smoke

Época 1179, no slot 39.888 de 432.000 às 01h00m42s UTC: faltavam 392.112 slots para a virada. Os dez últimos
intervalos de desempenho deram slots de 236 a 241 ms, então a virada cai por volta das 3h UTC de 11/10, perto da
meia-noite de 10 para 11/10 no horário de Brasília [INF: estimativa pelo slot médio]. A carteira que o smoke usa por
padrão (`G5chPqqGEaPUCivPYD5pTTcE5bMYmi5hb79Lnud1SVNM`, `DEVNET_WALLET`) tinha 1,93 SOL no devnet.

### 5.6 O id mudou depois destas leituras

As leituras de 5.1 são do id `6G2d…uVN`. Na mesma noite o id virou `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o` (PR
#45): ninguém tinha o keypair do primeiro. Antes do deploy, o id novo, o ProgramData dele
(`8Vy9jyzijx41ntzQHniZFUBA4jFvuwueFtNXUtGvUYGK`), a config (`GKM8TyXJXMcHqceY3F3AZnoUQAq15LLftkMzGLqH13bn`) e a
autoridade de eventos (`CmNehEdy55jRh7waxt2u5vbwLwe3jmRuZXv3AHi1qGwx`) foram lidos vazios. O deploy pediu 1,637 SOL a
quem pagou (o buffer de 0,81 SOL volta no fim), para o binário de 159.576 bytes.

### 5.7 O deploy e o smoke no devnet, 9/10/2026, 23h27 e 23h28 (horário de Brasília)

- **O RPC público não aguentou o deploy.** Duas tentativas morreram escrevendo o buffer pelo
  `https://api.devnet.solana.com`: "Data writes to account failed: Max retries exceeded" depois das 5 rodadas padrão
  do CLI; com 50 rodadas, a segunda ficou 20 minutos sem terminar, com o RPC respondendo 429 (Too Many Requests) às
  leituras, e foi interrompida. Cada buffer (0,81 SOL) foi fechado pela chave de upgrade. A terceira, por um RPC com
  chave (Helius), terminou em cerca de dois minutos, e o smoke também passou por ele.
- **O artefato no devnet é o do CI:** os bytes do programa lidos de volta têm o sha256
  `cf2359377323449bac0f67f6464f5e21dcb7ac85a9ffe07bfa52ec185b46a3a8`, o mesmo do `SHA256SUMS` da execução 38014319993; o
  build local da mesma fonte deu o mesmo hash.
- **Custo em unidades de computação, devnet contra LiteSVM** (as transações do smoke, uma instrução cada):

| Instrução | Devnet | LiteSVM |
|---|---|---|
| `admin_initialize_config` | 16.611 | — |
| `admin_set_team` | 1.726 | — |
| `user_open_campaign`, paga | 19.957 | 25.022 (Sprint 04, outro cenário) |
| `user_join_campaign` | 13.296 e 12.522 | — |
| `resolve_campaign` (queima) | 2.267 | — |
| `tally_late_joins` | 2.655 e 2.656 | — |
| `team_confirm_result` | 4.778 | 4.785 (PR #44) |
| `settle_entry`, uma entrada | 2.924 e 2.681 | 2.926 a 3.180 por entrada (Sprint 04) |
| `settle_creator_share` | 2.214 | — |
| `collect_fee` | 6.585 | — |
| `settle_prize` | 2.006 | — |
| `close_campaign` | 7.099 | — |
| `sweep_fees` | 2.047 | — |

- **O que ainda falta medir no devnet:** o lote de 12 entradas numa transação de `settle_entry` (o smoke liquida uma
  por transação); a virada de época (a 1179 termina perto da meia-noite de 10 para 11/10, horário de Brasília); e um
  SIM de `StakeAtLeast`, que continua fechado.

## Fontes

`docs/sprints/sprint-05-sdk-devnet-cycle.md`; `docs/technical/TECHNICAL-PLAN.md` §3.4.1, §3.4.18, §9;
`deploy/devnet/README.md`; `scripts/validator/`; `knowledge-base/tecnologia/pyth-leitor-de-preco.md`;
`knowledge-base/tecnologia/surfpool.md`.
