# Rendimento do pote: dá para o USDC parado render, e para quem?

Data: 3 de outubro de 2026. Pesquisa para o fundador (Lucas). Não é parecer jurídico nem financeiro.

Legenda: FATO = fonte primária (documentação oficial, API ou painel do protocolo). FATO SECUNDÁRIO = imprensa ou
agregador. INFERÊNCIA = conclusão minha. Taxas mudam todo dia; cada número traz a data da leitura. As leituras de API
foram feitas em 3 de outubro de 2026 (a API da Jupiter carimba 2026-10-04T00:09Z, ou seja, noite de 3/10 no Brasil).
A ferramenta de leitura devolve resumos de um modelo auxiliar; números críticos foram lidos duas vezes ou cruzados.

## Resumo em dez linhas

1. USDC em Solana rende hoje cerca de 3,7% a 4,3% ao ano em empréstimo (Jupiter Lend, Kamino principal). FATO, 3/10/2026.
2. Esse rendimento é variável e vem de juros pagos por tomadores; em estresse sobe (10,2% em abril) mas a saída trava.
3. Em abril de 2026, com utilização perto de 100%, a liquidez de Jupiter Lend e Kamino ficou escassa. FATO SECUNDÁRIO.
4. O Drift perdeu cerca de US$ 285 milhões em 1/4/2026 e suspendeu saques. Confirmado, mas não foi bug de contrato.
5. Kalshi paga 3,50% a.a. ao usuário (página oficial lida), repassando o que recebe de bancos parceiros. FATO.
6. Polymarket paga "Holding Reward" ao usuário, hoje 3,25% (página oficial, 1/6/2026), do Tesouro da empresa. FATO.
7. Nada oficial diz que o pUSD rende: a documentação o descreve só como wrapper de USDC. O "4%" é do Holding Reward.
8. Tanto Kalshi quanto Polymarket pagam ao usuário; nenhuma das duas retém o rendimento como taxa, pelo que li.
9. Jupiter Lend documenta integração por CPI (17 contas no depósito, 18 no saque); Kamino oferece crate Rust e SDK.
10. A 3,66% a 4,29% a.a., o rendimento só iguala uma taxa de 3% sobre o pote após 255 a 299 dias parado.

## 1. Onde USDC rende em Solana hoje

### 1.1 Mercados de empréstimo (leitura de 3/10/2026)

| Protocolo | Taxa do USDC | TVL (DefiLlama) | Origem do rendimento | Saída |
|---|---|---|---|---|
| Jupiter Lend (Earn) | 3,66% base + 0,36% recompensa = 4,02% | US$ 1,30 bi | juros de tomadores | limite de saque |
| Kamino Lend, mercado principal | 4,29% (supply APY) | US$ 1,39 bi | juros de tomadores | limite por utilização |
| Save (ex-Solend) | não lido | US$ 96,7 mi | juros de tomadores | não verificado |
| marginfi | não lido | US$ 41,2 mi | juros de tomadores | não verificado |
| Drift | fora de operação normal desde 1/4 | não lido | trading/empréstimo | ver seção 2 |

Detalhes:

- Jupiter Lend, USDC (jlUSDC). FATO: `api.jup.ag/lend/v1/earn/tokens` retornou supplyRate 366, rewardsRate 36 e
  totalRate 402 (pontos-base). totalAssets 503.862.856.939.288 com 6 casas = cerca de US$ 503,9 mi no ativo USDC.
  `withdrawable` 79.387.096.998.718 = cerca de US$ 79,4 mi sacáveis naquele instante (cerca de 16% do total), com
  `withdrawalLimit` 251.126.388.754.973 (US$ 251,1 mi), `expandPercent` 5000 e `expandDuration` 21600. INFERÊNCIA:
  existe um mecanismo de limite de saque que se expande com o tempo (6 h); um pote grande poderia não sair de uma vez.
  A leitura de pontos-base e de 6 casas é minha; confirme na documentação de liquidez antes de depender.
- Kamino Lend, reserva USDC `D6q6wuQSrifJKZYpR1M8R4YawnLDtDsMmWM1NbBmgJ59`. FATO: `api.kamino.finance`
  (reserves/metrics) devolveu supplyApy 0,04285, borrowApy 0,05866 e totalSupplyUsd 122.735.815. A API não devolveu
  utilização. Reconheço a reserva pelo endereço e pelo tamanho; não confirmei o nome na página.
- TVL: `api.llama.fi/tvl/<slug>` em 3/10/2026: kamino-lend 1,387 bi; jupiter-lend 1,303 bi; save 96,7 mi;
  marginfi-lending 41,2 mi. FATO SECUNDÁRIO (agregador). O TVL do marginfi é pequeno; não investiguei o motivo.
- Faixa histórica de 2026 para USDC no Kamino: "4 a 9% a.a." segundo guia de terceiro (eco.com). FATO SECUNDÁRIO.

### 1.2 Stablecoins e tokens com rendimento embutido

- USDY (Ondo), nota lastreada em tesouro de curto prazo e depósitos bancários. FATO SECUNDÁRIO (eco.com): 4,65% a.a.
  em 25/4/2026, faixa de 4,0% a 4,5% até maio de 2026; cerca de 35% do float em Solana; pago a não residentes nos
  EUA. Não li a página oficial da Ondo nem a taxa de hoje. Liquidez de saída: resgate com a emissora, com
  elegibilidade e prazo próprios; risco de emissor e de despareamento do token no mercado secundário. INFERÊNCIA.
- PYUSD (Paxos/PayPal). FATO SECUNDÁRIO (The Defiant): programa de 3,7% para usuários dos EUA dentro de PayPal e
  Venmo, pago em PYUSD. Isso não é rendimento do token em carteira Solana. Incentivos em Kamino/Drift existiram
  (taxa de cerca de 13% citada por terceiro, sem data); programas de incentivo acabam. Não verificado em fonte primária.
- sUSDS e tokens de tesouraria tokenizada em Solana: não pesquisados a fundo; ver Perguntas em aberto.
- Observação de desenho (INFERÊNCIA): o programa usa `USDC_MINT` fixo (Circle). Trocar o colateral por token com
  rendimento embutido muda o programa, o que o usuário recebe e o risco de emissor.

### 1.3 Staking líquido de SOL

- Jito: TVL US$ 1,248 bi em 3/10/2026 (DefiLlama, FATO SECUNDÁRIO). Não li a taxa de JitoSOL nem de mSOL.
- INFERÊNCIA: o pote é em USDC; aceitar SOL no pote adiciona risco de preço do SOL contra um passivo em dólar.
  Fora do escopo útil, salvo se o pote passar a aceitar SOL.

## 2. Incidentes relevantes

- Drift, 1/4/2026. FATO (TRM Labs): cerca de US$ 285 milhões em ativos de usuários, incluindo USDC e JLP. Mecanismo:
  engenharia social sobre signatários do multisig, que pré-assinaram autorizações ocultas com contas "durable nonce";
  executadas depois que o Drift removeu o timelock do Conselho de Segurança em 27/3. Depósitos e saques suspensos.
  Fundos pontes para Ethereum em poucas horas. Atribuição: "likely" a hackers norte-coreanos (palavra da TRM, não é
  conclusão final). Confirmado e corrigido: o valor de US$ 285 mi está certo; **não foi falha do contrato**, foi
  operacional/de governança. FATO SECUNDÁRIO (Decrypt, Cointelegraph, The Block): pacote de recuperação de até
  US$ 147,5 mi com a Tether (US$ 100 mi de crédito ligado à receita + US$ 27,5 mi diretos + cerca de US$ 20 mi de
  parceiros), liquidação trocada de USDC para USDT, saldos restituídos conforme a negociação volta. Fonte primária do
  Drift (post-mortem) não foi lida.
- Crise de liquidez de USDC em Solana, abril de 2026. FATO SECUNDÁRIO (crypto-economy.com, repetido por mexc.com):
  depois de um incidente de segurança no KelpDAO em 20/4/2026, Jupiter Lend chegou a 99% de utilização (US$ 421 mi
  em depósitos), Kamino a quase 100% (mercado Prime com 96%), marginfi acima de 88%, Save acima de 70%; taxa de
  USDC no Kamino em 10,2%. O texto diz que as taxas altas funcionaram como "mecanismo de defesa" e não detalha
  bloqueio formal de saques. Não li post-mortem primário de nenhum protocolo. INFERÊNCIA: com utilização perto de
  100%, quem quer sacar compete com o que sobrou de liquidez; o depositante não perde principal, mas pode esperar.
- Casos anteriores (Solend 2022, USDC em março de 2023, outros): não pesquisados nesta rodada, sem fonte aqui.

## 3. O que os mercados de previsão fazem com o dinheiro parado

- Kalshi. FATO (help.kalshi.com, "APY on Kalshi", lido duas vezes): "The interest rate is set at 3.50%" e é variável;
  acumula diariamente sobre o valor líquido do portfólio à meia-noite ET; pago mensalmente; só para saldo de
  US$ 250 ou mais; só para residentes elegíveis dos EUA. Origem: "Kalshi passes on the interest they receive from
  their banking partners." Quem fica: o usuário (Kalshi diz repassar). Um resultado de busca citou 4,05%; não achei
  essa taxa na página oficial lida. Pode ser data diferente. Não confirmado.
- Polymarket, Holding Reward. FATO (help.polymarket.com, artigo 13364459, publicado 1/6/2026): "3,25% annualized
  Holding Reward", variável "at Polymarket's discretion", amostrado aleatoriamente a cada hora, pago por dia,
  "funded through the Polymarket Treasury", apenas em 17 mercados de longo prazo. Um resultado de busca sobre a
  documentação citou 4,00%; a página lida diz 3,25%. Provável troca de taxa ao longo do tempo; sem data da versão de
  4%. Quem fica: o usuário, pago do Tesouro da empresa. INFERÊNCIA: é incentivo para manter preços de longo prazo
  precisos, não repasse de rendimento do colateral. A premissa "pUSD rende 4%" não se sustenta.
- Polymarket, pUSD. FATO (docs.polymarket.com/concepts/pusd, lido duas vezes): token ERC-20 na Polygon, lastreado em
  USDC, "no algorithmic peg, no fractional reserve", convertido por contratos on-chain. Nenhuma menção a rendimento.
  Não há afirmação oficial de quem fica com juros do USDC que lastreia o pUSD. Pergunta em aberto.
- Mercado on-chain que aplica colateral e repassa: não achei nenhum em fonte primária. Achei só o Delphic, que deixa
  o usuário usar ativo rentável como garantia para tomar USDC no Aave e apostar na Polymarket (FATO SECUNDÁRIO,
  chain.link/hack-26). Isso é o usuário aplicando o próprio dinheiro, não a plataforma.
- Caso de regulador. FATO SECUNDÁRIO: a SEC, em fevereiro de 2022, concluiu que as "BlockFi Interest Accounts" eram
  valores mobiliários não registrados (acordo de US$ 100 mi, metade com estados). Também, a Regra 1.25 da CFTC limita
  em quais ativos conservadores corretoras (FCMs) e câmaras podem investir fundos de clientes de futuros
  (cftc.gov). Cito sem opinar sobre aplicabilidade ao Bakedtruth.

## 4. Integração técnica por CPI

- Jupiter Lend Earn: FATO (developers.jup.ag/docs/lend/earn/cpi). Há guia de CPI para programa próprio. Programas
  mainnet: Lending `jup3YeL8QhtSx1e253b2FDvsMNC87fDrgQZivbrndc9`, Liquidity `jupeiUmn818Jg1ekPURTpr4mFo29p46vygyykFJ3wZC`;
  há endereços de devnet. Depósito: 17 contas; saque: 18, incluindo `claim_account`. O recibo é o jlToken, que funciona
  como ações: `deposit()` devolve ações mintadas, `withdraw()` queima ações; `u64::MAX` saca tudo. SDK TypeScript com
  `getDepositContext()` e `getWithdrawContext()`. Unidades de computação: **não documentadas** na página.
  Documentação diz "no supply limits and no fees for using Earn".
- Kamino Lend: FATO (kamino.com/docs). Existem SDK TypeScript, API REST e crate Rust (`klend-interface`, que monta
  instruções e antepõe as de refresh). Depósito de "lending" usa uma obrigação (`LendingObligation`). O índice da
  documentação não lista página de CPI. Auditorias listadas: Sec3 (6/2/2025), OtterSec (6/9/2023), RX Security
  (3/7/2023). Contas e unidades de computação: não documentados na página lida.
- INFERÊNCIA para este programa: o cofre PDA `["vault", market]` teria de ser dono do recibo (conta de jlToken ou
  obrigação), o que adiciona contas por mercado e instruções de refresh/saque na `resolve`. Pode exigir tabela de
  endereços (ALT) e orçamento de computação medido em devnet. Os invariantes `vault == budget + yes_supply` passam a
  precisar de contabilidade do valor aplicado e do rendimento acumulado.

## 5. A conta

Fórmula: rendimento = pote x taxa x dias / 365 (juros simples, sem composição; USDC em dólar). Taxas, ambas de 3/10/2026:
conservadora 3,66% (Jupiter Lend, base, sem recompensa); otimista 4,29% (Kamino principal). Comparação: taxa de 3%
sobre o pote, que é valor único e não depende da duração. Não há desconto de custos de transação, nem de taxa do
protocolo (Jupiter Lend declara sem taxas ao depositante), nem de parcela do pote que não esteja aplicada.

Em dólares:

| Pote | Dias | 3,66% a.a. | 4,29% a.a. | Taxa de 3% |
|---|---|---|---|---|
| US$ 1.000 | 1 | 0,10 | 0,12 | 30 |
| US$ 1.000 | 7 | 0,70 | 0,82 | 30 |
| US$ 1.000 | 30 | 3,01 | 3,53 | 30 |
| US$ 1.000 | 180 | 18,05 | 21,16 | 30 |
| US$ 10.000 | 1 | 1,00 | 1,18 | 300 |
| US$ 10.000 | 7 | 7,02 | 8,23 | 300 |
| US$ 10.000 | 30 | 30,08 | 35,26 | 300 |
| US$ 10.000 | 180 | 180,49 | 211,60 | 300 |
| US$ 100.000 | 1 | 10,03 | 11,75 | 3.000 |
| US$ 100.000 | 7 | 70,19 | 82,27 | 3.000 |
| US$ 100.000 | 30 | 300,82 | 352,60 | 3.000 |
| US$ 100.000 | 180 | 1.804,93 | 2.116,00 | 3.000 |

Ponto de equilíbrio contra 3%: dias = 3% / taxa x 365.

- a 3,66%: 299 dias; a 4,29%: 255 dias. Independe do tamanho do pote.
- A 10,2% (pico de abril, FATO SECUNDÁRIO): cerca de 107 dias. Taxa de estresse, não de planejamento.
- A 4,65% (USDY, abril): cerca de 235 dias.
- INFERÊNCIA: em 30 dias o rendimento é cerca de 10% a 12% da taxa de 3%; em 180 dias, cerca de 60% a 71%.
  Nenhuma das durações pedidas empata. Só empataria com mercados abertos por quase um ano ou mais.

## Pontos altos e baixos de ficar com o rendimento (INFERÊNCIA)

Altos:
- Receita extra sem cobrar o usuário a mais e sem mexer no preço do contrato. Em potes grandes e longos faz diferença.
- Diferencial de narrativa: "o dinheiro parado trabalha". Kalshi e Polymarket já pagam algo ao usuário, então
  ficar com o rendimento seria o oposto do que o mercado faz hoje; isso pode virar crítica, não diferencial.
- Pode substituir parte da taxa em mercados longos (acima de cerca de 255 dias, a 4,29%).

Baixos:
- O número é pequeno: cerca de 0,3% do pote em 30 dias. Não substitui uma taxa de 3% em nenhuma duração curta.
- Muda a promessa de lastro 1 para 1: hoje o cofre vale `budget + yes_supply` e a `resolve` paga na hora. Com
  aplicação, o cofre vira um recibo cujo valor depende de terceiro. A promessa passa a ser "lastro 1 para 1 se o
  protocolo de rendimento pagar".
- Saque travado no dia da resolução: se a utilização do protocolo chegar a perto de 100% (como em abril de 2026), ou
  se o saque tiver limite como o de `withdrawable` do jlUSDC, a `resolve` final e irreversível ficaria sem USDC para
  pagar. Opções de desenho: aplicar só uma fatia e manter reserva à vista; permitir resolução com pagamento em duas
  etapas; ou resgatar antes do prazo. Todas complicam o invariante e a promessa "instantânea".
- Risco de contrato de terceiro e de governança (Drift: US$ 285 mi por falha operacional, não de código).
- Superfície nova: CPI, contas extras, refresh, custo de computação não documentado, auditoria própria do programa.
- Quem fica com a perda: se o protocolo perder fundos, o passivo do Bakedtruth com os usuários continua. Dado que
  o rendimento é "nosso", o prejuízo também seria nosso (ou dos usuários, se a promessa não cobrir).
- Regulatório: tratar rendimento sobre dinheiro de clientes foi alvo de reguladores (BlockFi, Regra 1.25 da CFTC).
  Não opino; consultar advogado antes de decidir.
- Alternativa mais simples: repassar o rendimento ao usuário (como Kalshi) ou ficar só com uma fatia declarada.

## Perguntas em aberto

- Taxas atuais e liquidez de saída de Save, marginfi, Drift (pós-relaunch), USDY (oficial), sUSDS, JitoSOL, mSOL.
- Utilização atual do Kamino e do Jupiter Lend, e as regras exatas de limite de saque do Jupiter (`expandPercent`).
- Post-mortem oficial do Drift e dos protocolos na crise de abril/2026; incidentes de 2022 e 2023 com fonte.
- Quem fica com o rendimento do USDC que lastreia o pUSD? A documentação lida não responde.
- Taxa do Kalshi: 3,50% (página oficial lida) ou 4,05% (resultado de busca)? Polymarket: 3,25% ou 4,00%, e quando mudou?
- Custo em unidades de computação e número de contas de um depósito/saque por CPI, medido em devnet.
- O Kamino documenta CPI de depósito simples (sem obrigação) ou apenas SDK/crate de cliente?
- Algum mercado de previsão on-chain que aplique o colateral em escala, com fonte primária?
- Enquadramento regulatório para quem retém rendimento: fora do escopo desta pesquisa.

## Fontes

Primárias (documentação, APIs, painéis oficiais), lidas em 3/10/2026:
- Jupiter Lend, API: https://api.jup.ag/lend/v1/earn/tokens
- Jupiter Lend, CPI: https://developers.jup.ag/docs/lend/earn/cpi
- Kamino, API de métricas: https://api.kamino.finance/kamino-market/7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF/reserves/metrics?env=mainnet-beta
- Kamino, documentação, depósito e auditorias: https://kamino.com/docs/build/developers/borrow/operations/deposit.md
  e https://kamino.com/docs/security/audits.md; índice em https://kamino.com/docs/llms.txt
- Polymarket pUSD: https://docs.polymarket.com/concepts/pusd
- Polymarket Holding Rewards: https://help.polymarket.com/en/articles/13364459-holding-rewards
- Kalshi APY: https://help.kalshi.com/en/articles/13823847-apy-on-kalshi
- TRM Labs, Drift: https://trmlabs.com/resources/blog/north-korean-hackers-attack-drift-protocol-in-285-million-heist
- CFTC, Regra 1.25 (resultado de busca): https://www.cftc.gov/LawRegulation/FederalRegister/FinalRules/2013-26665.html

Secundárias (agregador ou imprensa):
- DefiLlama TVL: https://api.llama.fi/tvl/kamino-lend (e /jupiter-lend, /save, /marginfi-lending, /jito-liquid-staking)
- Crise de liquidez, abril de 2026: https://crypto-economy.com/?p=309042 e https://www.mexc.com/news/1041253
- Drift, recuperação: https://cointelegraph.com/news/tether-150m-recovery-drift-protocol,
  https://decrypt.co/364589/drift-tether-148-million-recovery-plan-ditches-circle-usdc,
  https://www.theblock.co/post/397735/drift-127-million-tether-recovery-pivots-circle-usdc-usdt-280-million-exploit
- Drift, ataque: https://decrypt.co/363087/solana-drift-protocol-exploited-285-million
- USDY: https://eco.com/support/en/articles/15254015-usdy-deep-dive-2026-ondo-s-retail-yield-token
- PYUSD: https://thedefiant.io/news/cefi/paypal-to-offer-u-s-users-3-7-yield-on-pyusd-stablecoin-this-summer-a45a957e
- BlockFi/SEC: https://www.dlapiper.com/en/insights/publications/2022/02/sec-settles-with-blockfi
- Delphic: https://chain.link/hack-26/projects/delphic
- Kamino, faixa 4 a 9%: https://eco.com/support/en/articles/15083163-kamino-finance-guide

## Segunda rodada (3 de outubro de 2026): render sem sair do cofre

Pergunta do fundador: o pote pode render sem o ativo sair do cofre do programa? Hipótese: o cofre guarda um token que
rende sozinho (LST de SOL, ou stablecoin/recibo com rendimento embutido). Mesma legenda de FATO, FATO SECUNDÁRIO e
INFERÊNCIA. Leituras de 3/10/2026. Cotações da API de preços da Jupiter no mesmo dia: SOL US$ 120,17, JitoSOL
US$ 156,61, mSOL US$ 168,99 (FATO, api.jup.ag/price/v3; valores arredondados pela API).

### R2.1 Resposta curta

1. Família A (LST de SOL): sim, o ativo fica no cofre. O LST é uma ação de uma pool que delega SOL a validadores;
   não há tomador. O valor em SOL sobe pela taxa de câmbio e o saldo de tokens não muda. FATO (docs do Marinade:
   "Your mSOL balance never changes"; docs do Sanctum: valor intrínseco lido por programas de cálculo).
2. Ressalva central (INFERÊNCIA): o pote passa a ser em SOL, não em USDC. O programa fixa `USDC_MINT`; trocar o
   colateral muda o programa, o preço do SOL contra um passivo em dólar e o texto da promessa. O Solana Compass
   (secundário) cita queda de cerca de 37% do SOL no ano até julho de 2026.
3. Família B (stablecoin com rendimento): segurar USDY ou USD* mantém o ativo no cofre mas troca risco de protocolo
   por risco de emissor; syrupUSDC e recibos de Kamino/Jupiter Lend são empréstimo a terceiros (ver R2.5).
4. O rendimento do LST é pequeno em prazos curtos: ver R2.6. A saída instantânea tem custo e depende de liquidez.

### R2.2 LSTs de SOL (taxa de 3/10/2026)

| LST | Rendimento a.a. | TVL | Taxas | Saída |
|---|---|---|---|---|
| JitoSOL | 4,85% (API Kobe, 2026-10-04T00:37Z) | 10,42 mi SOL; supply 7,99 mi JitoSOL | gestão 4% das recompensas; saque 0,1% só pelo site | espera até 1 época (~2 dias) ou DEX |
| mSOL | 4,96% (30 dias anualizado, API Marinade) | não lido | depósito 0; `reward_fee` 0; saque com espera 0,2% | espera ~1 época ou Jupiter |
| INF (Sanctum) | 6,22% média do 2º trim. 2026 (secundário) | 2,03 mi SOL ao fim do 2º trim. | 5% de performance; swap com taxa dinâmica | swap instantâneo, sem slippage (doc) |
| JupSOL | não informado na doc | não lido | 5% de época (2,5% Sanctum + 2,5% Jupiter DAO); saque direto 0,1% | espera ~2 dias ou swap |
| bSOL | não pesquisado | não pesquisado | não pesquisado | não pesquisado |

Detalhes e leituras cruzadas:

- JitoSOL, rendimento e TVL. FATO: `kobe.mainnet.jito.network/api/v1/stake_pool_stats` devolveu apy 0,04853625, tvl
  10.421.868.648.506.365 lamports (= 10,42 mi SOL) e supply 7.989.801,08. INFERÊNCIA: tvl dividido por supply dá taxa
  de câmbio de cerca de 1,304 SOL por JitoSOL; o preço da Jupiter (156,61 / 120,17 = 1,303) fica cerca de 0,1% abaixo.
  TVL em dólar: 10,42 mi x 120,17 = cerca de US$ 1,25 bi, coerente com o DefiLlama (US$ 1,248 bi, secundário).
  Fonte primária da taxa de gestão e da taxa de saque: só vi trechos de busca das páginas docs do Jito, as páginas
  deram 403. Marcar como não confirmado em leitura direta.
- mSOL. FATO: `api.marinade.finance/msol/apy/30d` devolveu value 0,049592, preço inicial 1,40436 (4/9) e final 1,40995
  (4/10). Conta simples: 0,398% em 30 dias, cerca de 4,85% sem composição; a API anualiza com composição. O preço da
  Jupiter (168,99 / 120,17 = 1,406) fica cerca de 0,3% abaixo do valor justo (INFERÊNCIA, preços arredondados).
- Marinade, taxas: FATO (docs.marinade.finance, fees-and-pricing): "no deposit fee on any product"; `reward_fee` 0;
  saque com espera 0,2%; saída instantânea pela rota de pool de liquidez 0,03% a 1,5%, subindo com o uso. A página
  "Instant Unstake" diz outra coisa: 0,2% de taxa de protocolo para mSOL, via Jupiter. Divergência entre duas páginas
  oficiais, não resolvida.
- Marinade, auditorias. FATO (docs, audits): Neodyme (maio de 2026, upgrade de taxa de depósito/stake canônico; 2024;
  2023), Sec3 (2023), Kudelski, Ackee e Neodyme (2021).
- INF. FATO (learn.sanctum.so, Infinity technical): pool compartilhada de LSTs; o "S Controller" atualiza as reservas
  com programas de cálculo do valor em SOL que leem as contas dos protocolos de staking; taxa fixa de entrada e saída
  em pontos-base nos swaps e 20 pontos-base na retirada de liquidez; 90% das taxas para as reservas e 10% para o
  protocolo; auditorias Neodyme, OtterSec e Sec3; programa `5ocnV1qiCgaQR8Jb8xWnVbApfaygJ8tNoZfgPwsgx9kx`. A API de APY
  da Sanctum devolveu 0 para todos os LSTs (resposta inválida, ignorada). Números de 6,22% e 2,03 mi SOL: Solana
  Compass, secundário. Liquidez para saque instantâneo em SOL: não encontrada em fonte primária.
- JupSOL. FATO (docs.jup.ag, stake-sol/faq): comissão de validador 5% da inflação e 0% do MEV; taxa de época de 5%
  (2,5% Sanctum, 2,5% Jupiter DAO); 0,1% de saque só direto da pool; espera de cerca de 2 dias; multisig de 11
  membros. Auditoria específica: a página só diz "audited and battle-tested", sem links.
- Saída com espera: uma época tem cerca de 2 dias (FATO, solana.com/docs/economics/staking). Slashing em Solana: "only
  after network halts caused by attackers" (mesma página). Risco de slashing por validador: baixo na doc, não zero.
- Despareamento: FATO (Marinade, "State of Marinade in the wake of FTX/Alameda"): na época 370 (nov. de 2022) o preço
  de mercado do mSOL ficou temporariamente abaixo do SOL por falta de liquidez; a saída instantânea da Marinade
  rendeu 824 mSOL em taxas até o pool esgotar e depois ficou perto de 140.000 SOL (alvo de 400.000 a 500.000); quem
  usou a saída com espera recebeu a taxa justa, sem desconto. Tamanho do desconto: a página não informa. Não achei
  fonte primária com a medida do desconto de JitoSOL, JupSOL ou INF.
- Lido on Solana (stSOL). FATO SECUNDÁRIO (Cointelegraph, Blockworks): DAO aprovou o encerramento (92,7% dos 70,1
  mi de LDO votados), parou de aceitar stake em 16/10/2023. FATO SECUNDÁRIO (DL News): bug de contrato impediu saques de
  cerca de US$ 24 mi em stSOL de mais de 31.000 carteiras; sem prazo de correção na data do artigo (anterior a nov.
  de 2024; não verifiquei se foi resolvido). INFERÊNCIA: LST de pool pequena ou abandonada é risco real; só LSTs
  grandes fazem sentido.

### R2.3 Integração por CPI com o SPL Stake Pool (Jito, JupSOL e outros usam o mesmo programa)

Fonte: `solana-program/stake-pool` (instruction.rs) e docs.rs/spl-stake-pool. FATO.

- `DepositSol` (11 contas). 0 pool (w); 1 autoridade de saque da pool; 2 conta de reserva (w); 3 conta que fornece os
  lamports (assina); 4 "User account to receive pool tokens" (w); 5 conta das taxas (w); 6 conta de referral (w); 7
  mint do LST (w); 8 System; 9 Token program; 10 opcional, autoridade de depósito de SOL (assina, se a pool exigir).
- `WithdrawSol` (13 contas). 0 pool (w); 1 autoridade de saque; 2 autoridade de transferência do usuário (assina);
  3 conta de LST a queimar (w); 4 reserva (w); 5 conta que recebe os lamports, "must be a system account" (w); 6 taxas
  (w); 7 mint (w); 8 Clock; 9 Stake history; 10 Stake program; 11 Token program; 12 opcional, autoridade de saque de
  SOL. Doc: "Fails if the reserve does not have enough SOL". Erro `SolWithdrawalTooLarge` (#35): "Too much SOL
  withdrawn from the stake pool's reserve account".
- `WithdrawStake` (13 contas): devolve uma conta de stake nova, de que o usuário é a autoridade de saque; depois é
  preciso desativar e esperar a época. Não é saque instantâneo.
- Taxas da pool (FATO, solana-program.com/docs/stake-pool/fees): cinco taxas (de época, saque de SOL, saque de stake,
  depósito de SOL, depósito de stake) mais referral. Aumentos limitados a 1,5x e só valem após duas fronteiras de
  época. Logo o custo de saída pode mudar com aviso curto.
- Pode o LST ir para uma conta de token de um PDA nosso? INFERÊNCIA: a conta 4 é só "user account to receive pool
  tokens"; a doc não restringe o dono, então um PDA deve funcionar. Não confirmado; testar em devnet ou fork.
- Pode o SOL do depósito sair de um PDA? A conta 3 só precisa assinar; PDA assina com `invoke_signed`. Mas ela
  fornece lamports nativos: o cofre atual é uma conta de token USDC, não serve. Seria preciso uma conta PDA sem dados
  e de propriedade do System Program. Para receber SOL no saque, a conta 5 deve ser "system account": o `Market` (de
  propriedade do nosso programa) não pode ser o destinatário. INFERÊNCIA, a validar.
- Limite do saque instantâneo: `WithdrawSol` só sai da reserva da pool, e pools de LST mantêm quase tudo delegado.
  Tamanho da reserva do JitoSOL: não encontrado. Para pote grande, as saídas viáveis são DEX/Sanctum ou `WithdrawStake`
  (espera). INFERÊNCIA.
- O que a doc diz sobre uso por outros programas: nenhuma página lida trata de CPI de outros programas para o stake
  pool. Não encontrado. O mesmo programa é usado como base pela Sanctum (Jupsol); auditorias da pool: Neodyme
  (relatórios de 2021, 2023 e do redelegate), conforme neodyme.io/reports (títulos vistos em busca, não lidos).
- Marinade: docs listam SDK TypeScript (`marinade-ts-js-sdk`); crate de CPI em Rust: não confirmado. Docs não dizem
  se PDA pode segurar mSOL. Sanctum: o programa Infinity usa CPI internamente; documentação de CPI para terceiros
  (Router/Infinity): não encontrada nas páginas lidas.

### R2.4 Stablecoins e recibos com rendimento em Solana

Pesquisa mais rasa que a dos LSTs: muitos números são secundários. Um PDA segura qualquer token SPL em conta de token
cujo dono seja o PDA (INFERÊNCIA padrão da plataforma). Programas do tipo Token-2022 exigem ajustes no nosso código
(CLAUDE.md: `transfer_checked`, mint e programa de tokens fixos).

| Token | Rende | Como | Restrição | Saída em Solana |
|---|---|---|---|---|
| USDY (Ondo) | 4,65% a.a. em 25/4/2026 (secundário, eco.com) | preço sobe (acumula); rUSDY rebase | proibido nos EUA, Canadá e países sancionados; Brasil só investidor qualificado ou profissional (docs.ondo.finance, eligibility) | resgate com a emissora; mín. US$ 5.000 em outras redes; profundidade: não encontrada |
| sUSDS (Sky) | 3,75% no 2º trim. 2026 (secundário) | cota de vault ERC-4626 | não aplicável | versão em Solana: não encontrada |
| PYUSD | 3,7% só dentro do PayPal/Venmo (secundário) | pago em PYUSD | só usuários dos EUA | não rende em carteira Solana |
| USDG (Paxos) | não repassa ao portador; mais de 90% do rendimento da reserva vai a parceiros (secundário) | n/a | emissor regulado em Singapura e UE | liquidez: não pesquisada |
| sUSD (Solayer) | cerca de 4% (secundário, Substack) | atualização automática de saldo (extensão Token-2022, secundário) | não verificada | resgate pelo painel da Solayer |
| USD* (Perena) | não lido | token de LP de AMM de stablecoins, mais posições | não verificada | profundidade: não encontrada |
| syrupUSDC (Maple) | cerca de 6,3% a 6,9% em jul.-ago. de 2025 (secundário, defasado) | recibo de empréstimo | não verificada | em geral instantâneo, às vezes cerca de 24 h, máximo 30 dias (FAQ da Maple) |
| jlUSDC / recibos Kamino | 3,66% a 4,29% (seção 1.1) | ações do protocolo de empréstimo | nenhuma lida | limite de saque por utilização |

- Emissor e risco (INFERÊNCIA): USDY é um crédito "senior unsecured" contra uma empresa de Delaware, "bankruptcy-remote"
  (secundário, eco.com); emissora desde 15/12/2025 sob o guarda-chuva Ondo Stocks (docs). Se o programa precisar
  que qualquer usuário, inclusive brasileiro de varejo, receba o payout, uma restrição de elegibilidade do portador é
  incompatível com um cofre aberto. O PDA do cofre como portador de USDY: política de elegibilidade para PDA, não
  encontrada.
- Perena: o resumo diz que o lastro inclui posições hedgeadas (delta-neutro) em corretoras centralizadas e RWA
  (secundário). Isso não é "dinheiro parado".

### R2.5 Quem segura o ativo e quem empresta

| Opção | O ativo fica no cofre? | Empresta a terceiros? |
|---|---|---|
| LST (JitoSOL, mSOL, JupSOL) | sim, o programa segura o LST | não; o SOL fica delegado a validadores (Solana: sem empréstimo) |
| INF (Sanctum) | sim, o programa segura o INF (cota de pool de LSTs) | não, mas é pool de LSTs com swaps; o risco é da pool |
| USDY | sim, o programa segura o USDY | não por empréstimo; é crédito contra a emissora, que investe em tesouro |
| USD* (Perena) | sim, o programa segura o LP | em parte: posições alavancadas e de empréstimo, segundo o resumo |
| syrupUSDC | sim, o programa segura o recibo | sim: empréstimos sobrecolateralizados a tomadores institucionais (FAQ da Maple) |
| jlUSDC, recibo Kamino | o programa segura o recibo, não o USDC | sim: o USDC foi emprestado; segurar o recibo é ter emprestado |

INFERÊNCIA: "o ativo está no cofre" não elimina o risco; só muda quem pode falhar (validador/pool, emissora, tomador).

### R2.6 A conta: pote em SOL guardado como LST

Fórmula: rendimento (SOL) = pote x 4,85% x dias / 365 (JitoSOL, 3/10/2026; juros simples). O rendimento fica no valor do
LST: a pool entrega mais SOL na saída. Taxa de 3% do pote: 3, 30 e 300 SOL para 100, 1.000 e 10.000 SOL.

| Pote | 7 dias | 30 dias | 180 dias | Taxa de 3% |
|---|---|---|---|---|
| 100 SOL | 0,093 SOL | 0,399 SOL | 2,39 SOL | 3 SOL |
| 1.000 SOL | 0,930 SOL | 3,99 SOL | 23,9 SOL | 30 SOL |
| 10.000 SOL | 9,30 SOL | 39,9 SOL | 239 SOL | 300 SOL |
| % do pote | 0,093% | 0,399% | 2,39% | 3% |

- Equilíbrio contra 3%: 226 dias a 4,85%; 221 dias a 4,96% (mSOL); 176 dias a 6,22% (INF, secundário).
- Custo de entrada e saída (percentual do pote, só taxas documentadas): JitoSOL, saque direto 0,1% (o 0,1% de
  depósito do Jito: não encontrado); mSOL, depósito 0 e saque com espera 0,2%; saída instantânea pela Jupiter: taxa
  de rota não documentada, mais slippage (não encontrado para 10.000 SOL, cerca de US$ 1,2 mi). Diferença
  observada entre preço de mercado e valor justo hoje: cerca de 0,1% (JitoSOL) e 0,3% (mSOL), INFERÊNCIA.
- Rendimento líquido da saída em 7, 30 e 180 dias: JitoSOL com 0,1% de saída, cerca de 0% (0,093% menos 0,1%),
  0,30% e 2,29%. mSOL com 0,2% de saída: negativo (-0,11%), 0,20% e 2,19%.
  Equilíbrio do custo de saída: 0,1% leva 7,5 dias; 0,2% leva cerca de 15 dias.
- Conclusão (INFERÊNCIA): em mercados de 7 dias o rendimento não paga nem a saída; em 30 dias vale cerca de 0,3% do
  pote; só em 180 dias chega a cerca de 2,3%, ainda abaixo de 3%. O ganho real de ficar com o rendimento do LST é
  baixo; o custo é redesenhar o pote para SOL e assumir risco de preço do SOL.

### R2.7 Quem já faz isso

- Zelo Finance. FATO SECUNDÁRIO (Solana Compass): loteria sem perda em Solana; os depósitos são aplicados em staking
  líquido (Jito) e o rendimento é sorteado toda semana para "a handful of lucky winners"; mainnet no 3º trim. de
  2024. Auditoria e TVL: a página não detalha; incidente: nenhum citado. Não li documentação própria do Zelo.
- PoolTogether (Ethereum e L2). FATO (docs.pooltogether.com): os prêmios vêm do juro acumulado do depósito, sorteado;
  "Withdraw your deposit any time". FATO (docs v3, risks): o depositante assume risco da fonte de rendimento; se
  a fonte perder ativos, só se saca a parte proporcional. FATO SECUNDÁRIO (resumo de busca de docs do v5): a única
  vault afetada foi a de Rocket Pool wrETH, por falha no ativo subjacente, não no código do PoolTogether. Fórum de
  governança (resumo de busca): onze pools da v3 sem operação, com cerca de US$ 1,5 mi ainda dentro. Detalhe e fonte
  do divisor entre prêmio e depositante na v5: não li.
- Mercado de previsão que guarde o prêmio em LST ou token com rendimento: não encontrado em fonte primária (ver
  também seção 3).
- O que deu errado na categoria (fontes acima): desconto temporário do mSOL na crise de nov. de 2022; Lido stSOL com
  saque travado por bug e encerramento; perda da vault de wETH no PoolTogether.

### R2.8 Não confirmado nesta rodada

- Taxa de depósito do JitoSOL e reserva do pool (limite do WithdrawSol): não encontrado.
- Se o dono de uma conta de LST pode ser PDA: não está na doc; só inferência.
- Liquidez de saída em SOL para 10.000 SOL de JitoSOL, mSOL ou INF: não encontrada.
- bSOL: não pesquisado. APY de JupSOL: não informado.
- USDY, sUSDS em Solana, USD*, USDG, sUSD: taxas secundárias e datas antigas; elegibilidade de PDA: não encontrada.
- Tamanho do desconto de mercado do mSOL na época 370; descontos de outros LSTs: não encontrados.
- Fonte primária do Jito (taxas, auditorias): páginas deram 403; só trechos de busca.
- Divergência de taxa de saída instantânea do mSOL: 0,2% ou 0,03% a 1,5%.

### Fontes novas desta rodada (leituras de 3/10/2026)

Primárias:
- https://kobe.mainnet.jito.network/api/v1/stake_pool_stats
- https://api.marinade.finance/msol/apy/30d
- https://api.jup.ag/price/v3 (SOL, JitoSOL, mSOL)
- https://docs.marinade.finance/marinade-protocol/protocol-overview/fees-and-pricing.md
- https://docs.marinade.finance/marinade-protocol/protocol-overview/marinade-instant-unstake.md
- https://docs.marinade.finance/marinade-protocol/protocol-overview/marinade-liquid/what-is-msol.md
- https://docs.marinade.finance/marinade-protocol/security/audits.md
- https://app.marinade.finance/learn/state-of-marinade-in-the-wake-of-ftx-alameda
- https://learn.sanctum.so/docs/technical-documentation/infinity
- https://docs.jup.ag/user-docs/earn/stake-sol/faq.md
- https://solana.com/docs/economics/staking
- https://www.solana-program.com/docs/stake-pool/fees
- https://raw.githubusercontent.com/solana-program/stake-pool/main/program/src/instruction.rs e error.rs
- https://docs.rs/spl-stake-pool/latest/spl_stake_pool/instruction/enum.StakePoolInstruction.html
- https://docs.ondo.finance/general-access-products/usdy/eligibility.md e basics.md
- https://docs.maple.finance/syrupusdc-usdt-usdg-for-lenders/faq
- https://docs.pooltogether.com

Secundárias:
- Sanctum Q2 2026: https://solanacompass.com/news/sanctum-q2-2026-protocol-tvl-hits-1664m-sol-all-time-high-as-usd-revenue-falls-39
- Zelo Finance: https://solanacompass.com/projects/zelo-finance
- Jito, taxas e saque (trechos de busca, páginas com 403): https://www.jito.network/docs/jitosol/faqs/general-faqs/
- Lido: https://www.blockworks.com/news/lido-finance-drops-solana-staking-after-dao-decision e
  https://dlnews.com/articles/defi/lido-stsol-holders-stuck-after-code-bug-blocks-withdrawals
- USDY e sUSDS: https://eco.com/support/en/articles/14798657-ondo-usdy-tokenized-treasuries-explained e
  https://eco.com/support/en/articles/15254003-sky-savings-rate-deep-dive-2026-ssr-susds-usds-mechanics
- USDG: https://thedefiant.io/news/cefi/paxos-launches-a-yield-bearing-stablecoin-with-support-from-industry-heave-weights
- sUSD Solayer: https://notamortal.substack.com/p/inside-susd-solanas-stableyield-coin
- Perena: https://solanacompass.com/projects/perena ; syrupUSDC: https://maple.finance/insights/syrupusdc-expands-to-solana
- PoolTogether (governança e docs v3 de risco): https://v3.docs.pooltogether.com/v3.2.0/security/risks
