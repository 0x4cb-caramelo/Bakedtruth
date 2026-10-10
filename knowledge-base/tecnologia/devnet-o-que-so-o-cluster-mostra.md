# O que só um cluster de verdade mostra — Sprint 05

Nota de 9 de outubro de 2026, entregável da Sprint 05 ("a note on what only a real cluster could check"). Separa o que
foi conferido nesta máquina, e como, do que só o devnet (ou um validador Agave) pode mostrar. Nada aqui foi medido no
devnet: o deploy espera a escolha do fundador (`deploy/devnet/README.md`).

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

- Nada foi enviado ao devnet nem à mainnet; nenhum RPC público foi usado.
- O `solana-test-validator` não rodou (1.1).
- O deploy, a inicialização, o smoke e o seed no devnet esperam o fundador (`deploy/devnet/README.md`).

## Fontes

`docs/sprints/sprint-05-sdk-devnet-cycle.md`; `docs/technical/TECHNICAL-PLAN.md` §3.4.1, §3.4.18, §9;
`deploy/devnet/README.md`; `scripts/validator/`; `knowledge-base/tecnologia/pyth-leitor-de-preco.md`;
`knowledge-base/tecnologia/surfpool.md`.
