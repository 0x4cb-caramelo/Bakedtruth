# Pyth — quais feeds têm conta de fatia 0, quem as cria e quem as mantém

Levantamento de 9 de outubro de 2026 (Sprint 03, frente R), para a pergunta 1 ao fundador: quais feeds da Pyth uma
campanha de preço pode nomear. O programa aceita hoje qualquer feed cujo endereço patrocinado (a conta de fatia 0 do
push oracle, PDA `[0u16 LE, feed_id]` sob `pyt2F414BA6dPttK6RddPZUdHfapoBN24GL5wbrPCou`) passe nas checagens da
abertura. Marcas: **[F]** fato com fonte, **[INF]** inferência minha, **[AC]** escolha da equipe.

## Resposta

**Qualquer pagador cria e atualiza a conta de fatia 0 de um feed que a Pyth não patrocina, e a maioria dessas contas
está parada [F].** Na rede principal existem 183 contas de fatia 0 para os 1.883 feeds que a Hermes lista; 63 são
da lista patrocinada da Pyth e 120 não são. Das 120, 78 foram criadas por um mesmo pagador que não é da Pyth
(`4DZPjF1g54da3rp7rMjDwm8HbyKhQWGhRVwi2DQmx3zs`, em 4/6/2026) e 102 não receberam atualização na janela medida,
algumas há mais de 126 dias. Na devnet existem 30 contas, 17 patrocinadas e 13 não; 6 das 13 estão paradas desde
junho.

Para o programa isso significa: uma campanha aberta sobre um feed não patrocinado passa nas checagens da abertura
enquanto a conta estiver fresca, e depois depende de um estranho continuar pagando. Se ele para, a trava de entrada
recusa as entradas (`JoinPriceStale`) e, depois do prazo, a campanha é anulada (`StaleFeed`), com as entradas
devolvidas. Nenhum resultado errado sai disso: todo preço gravado é assinado pela Pyth, e o SIM pode ser provado por
qualquer conta completa. O que a pergunta 1 decide é se a Brot quer campanhas que podem morrer assim [INF].

## 1. Fatos

### 1.1 As contas que existem (medido em 9/10/2026, 04:17 a 04:24 UTC)

A medida: `scripts/pyth-sponsored-feeds.ts`, 6 minutos, uma leitura a cada 20 segundos, nas duas redes pelos RPCs
públicos. A lista patrocinada é a tabela que a página da Pyth embute (64 feeds; `NTBILL/USD.RR` não está na Hermes).

| Rede | Feeds na Hermes | Contas de fatia 0 | Da lista patrocinada | Fora da lista | Frescas fora da lista |
|---|---|---|---|---|---|
| Rede principal | 1.883 | 183 | 63 (62 frescas; 1 da lista não existe) | 120 | 19 |
| Devnet | 1.883 | 30 | 17 (todas frescas; 47 da lista não existem) | 13 | 7 |

"Fresca" é uma conta cujo `publish_time` mudou dentro dos 6 minutos. Todas as 213 contas têm o formato
`PriceUpdateV2` esperado.

### 1.2 Quem cria e quem escreve

| Rede | Criador das contas fora da lista | Quem escreveu por último nas contas fora da lista |
|---|---|---|
| Rede principal | `4DZPjF…x3zs` criou 78 (todas em 4/6/2026, 13:26 UTC); `FRV1hE…tvKo` 6; `27y3HZ…jqxu` 3; `4jHcKH…8dZY` 2; `CVXeyw…WMzM` 2; 27 com mais de 1.000 transações, criador não alcançado | `4DZPjF…x3zs` 54; `4jHcKH…8dZY` 25; `FRV1hE…tvKo` 22; `27y3HZ…jqxu` 14; `crankgEd…xa37` 2; outros 3 |
| Devnet | `dev8gv…Sdqw` 5 (26/6/2026); `GatMah…QEkv` 1; 7 não alcançadas | `4p16wy…eish` 6 (o mesmo pagador que escreve as patrocinadas); `dev8gv…Sdqw` 5; `cronjz…SPEU` 1; `GatMah…QEkv` 1 |

As contas da lista patrocinada têm todas mais de 1.000 transações; o criador não foi alcançado. Na rede principal,
57 das 63 foram escritas por último por `4p16wya1Vw2u9w22oah4yXQgySb6eWKRRLMsEXCreish` e 6 por
`9F6ApEtzkHVdZXzsury6BYmyEh4pahDBxuhNLaGC6saC`; na devnet, 15 por `4p16wy…eish` e 2 por
`BEYRqL2QHZidAFxoyDaTZPaWPYUiyczTRzYwfgjTfpoS`. Nenhum desses endereços foi atribuído a uma entidade: são
pagadores de taxa, lidos da transação do `posted_slot` de cada conta.

### 1.3 Exemplos de contas fora da lista

| Rede | Feed | Conta | Estado em 9/10/2026 |
|---|---|---|---|
| Rede principal | Crypto.PEPE/USD | `Dy2e9ibAmWwCxCnbTXB3kTXyge3DTPud1dGdH98quiuH` | parada há 126 dias; criada e escrita por `4DZPjF…x3zs` |
| Rede principal | Crypto.XRP/USD | (fatia 0 do feed) | parada há 24 horas |
| Rede principal | Crypto.RAY/USD, PENGU/USD, ORCA/USD, KMNO/USD e outras 15 | (fatia 0) | frescas, mantidas por pagadores fora da Pyth |
| Devnet | Crypto.FDUSD/USD | `4qpCY2QptNBzfRg2qTox26sjjQhuNUore6ywvHyDkTC2` | parada há 100 dias; criada em 26/6/2026 por `dev8gv…Sdqw` |
| Devnet | Crypto.RAY/USD | `89rK7LjPkBFPVGVNpUJS4rheKhXZFjf8dBmpcN3yaqds` | fresca, escrita por `4p16wy…eish` |
| Devnet | FX.EUR/USD, FX.GBP/USD, FX.AUD/USD, Metal.XAU/USD, Metal.XAG/USD | (fatia 0) | frescas, fora da lista |

### 1.4 O que o programa confere, e o que isso cobre

A abertura lê a conta de fatia 0 do feed nomeado: dono `rec2HH…`, formato `PriceUpdateV2`, verificação completa,
`feed_id` igual ao nomeado, preço positivo, idade dentro de `campaign_max_age`, slot dentro do freio, faixa de
confiança dentro do limite (`programs/brot-markets/src/instructions/campaigns/open_campaign/rules.rs`). Uma conta
fora da lista passa em tudo isso enquanto alguém a mantém. O programa não tem como saber quem paga por ela.

## 2. Inferências (minhas, a validar)

- **O risco é de anulação, não de resultado errado [INF].** Uma conta parada não gera NÃO: o `StaleFeed` anula quando
  a última atualização antes do prazo é mais velha que `max(max_age, 600 s)`. Quem mantém uma conta pode, porém,
  escolher quando postar a última atualização antes do prazo, e com isso escolher entre NÃO e anulação para uma
  campanha que não foi tocada. É a observação F2 da revisão da Sprint 03, hoje coberta pelo piso de 600 s e pela
  janela de revisão da equipe.
- **Uma lista fechada de feeds resolve a pergunta 1 com um custo [INF]:** o D-i tirou a lista de contas aceitas, e
  o revisor de segurança da Sprint 02 lê uma lista de feeds como reabrir o D-i. O meio-termo seria aceitar só feeds
  cuja conta de fatia 0 foi escrita pelos pagadores da Pyth, mas o programa não lê histórico de transações.
- **A lista patrocinada da devnet é pequena [F] e muda [INF]:** 17 de 64. Campanhas de demonstração na devnet ficam
  com BTC, ETH, SOL, PYTH, USDC, USDT, BONK, WIF, JUP, WBTC, FARTCOIN, INF, JITOSOL, JLP, MSOL, SSOL/SOL e PUMP.

## 3. O que não foi feito

- Publicar uma atualização numa conta de fatia 0 (precisaria de uma atualização assinada pela Hermes, que exige
  chave; nenhuma variável de ambiente com esse nome estava definida, e nada foi tentado).
- Ler o código do push oracle no commit fixado para dizer, da fonte, que a criação da conta é permissionless: aqui o
  fato é observado na rede (contas criadas por pagadores fora da Pyth), não lido do programa.
- Atribuir os pagadores a entidades.

## Fontes

- `scripts/pyth-sponsored-feeds.ts`, corrida de 9/10/2026, 04:17 UTC, 6 minutos, nas duas redes (os JSONs da corrida
  não são versionados; os números acima são a cópia deles).
- https://hermes.pyth.network/v2/price_feeds (a lista de feeds, sem chave).
- https://docs.pyth.network/price-feeds/core/push-feeds/solana (a tabela de feeds patrocinados que a página embute).
- `knowledge-base/tecnologia/pyth-leitor-de-preco.md` (os programas, o formato e a cadência; a seção "Sprint 03"
  tem a observação de que a conta patrocinada só anda para a frente).
