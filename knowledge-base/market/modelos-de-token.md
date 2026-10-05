# Modelos econômicos de token de plataforma, para o token do Bakedtruth

Data: 3 de outubro de 2026.

Legenda: **FATO** = fonte primária (documentação oficial, repositório oficial, órgão regulador, governança do
próprio projeto). **FATO SEC.** = agregador, imprensa ou blog (a fonte está indicada). **INFERÊNCIA** = raciocínio
meu. "Não encontrado" = não consegui confirmar. Nenhum número abaixo foi estimado sem aviso.

Limite de método: a ferramenta de leitura devolve resumos de um modelo auxiliar. Os números críticos foram abertos
duas vezes, com perguntas diferentes, quando a página permitiu. Páginas que carregaram só o título (The Defiant,
partes do Decrypt) não foram usadas como prova.

## Resumo em dez linhas

1. O pump.fun cria a moeda com 1 bilhão de unidades, 793,1 milhões na curva e fees de 1,25% na curva. Nenhum campo de
   criação documentado permite alocação de equipe, vesting ou extensões de token. FATO (repo oficial).
2. A instrução `create` usa SPL Token clássico. A `create_v2` cria moeda "spl-22" (Token-2022). Qual das duas o
   site usa por padrão hoje: não encontrado em fonte primária.
3. Autoridades de emissão e congelamento: não confirmadas em fonte primária. Não assuma que estão revogadas.
4. Existe "Holder Rewards" nativo no pump.fun: a taxa de criador vira pagamento pró-rata a holders. É pequena
   (de 0,05% a 0,95% do volume, conforme faixa) e não é dividendo da nossa receita.
5. Dividendo "de verdade" em token Token-2022 não existe como extensão: transfer fee só retém taxa de
   transferência, interest-bearing é cosmético. O dividendo exige um contrato de staking/distribuição nosso.
6. Recompra e queima é o modelo dominante: HYPE (quase toda a taxa), PUMP (100%, depois 50%), JUP (50%), RAY (12%),
   Cake (3% do pote de Prediction, 100% disso queima).
7. Distribuição direta a stakers está em retirada: GMX suspendeu em março de 2026 e Gains em junho de 2026, ambos
   por voto de governança.
8. Cofre como contraparte (JLP, HLP, Azuro) rende taxas, mas absorve o prejuízo líquido dos apostadores vencedores.
9. Num pote (parimutuel) não falta liquidez: os vencedores são pagos pelos perdedores. Semear não cria valor, é uma
   aposta com taxa. INFERÊNCIA com conta na seção 4.
10. Reguladores olham promessa de lucro, dividendo e recompra (SEC, Framework de 2019). O tema não é opinado aqui.

---

## 1. pump.fun, fonte primária

### 1.1 Lançamento (repositório oficial github.com/pump-fun/pump-public-docs)

| Item | Valor | Fonte |
|---|---|---|
| Oferta total | 1.000.000.000 (raw `1000000000000000`, 6 casas) | FATO, docs/PUMP_PROGRAM_README.md |
| Reserva virtual inicial de token | 1.073.000.000 | idem |
| Reserva virtual inicial de SOL | 30 SOL | idem |
| Reserva real de token na curva | 793.100.000 (79,31% da oferta) | idem |
| Formatura | quando `real_token_reserves == 0`; `migrate` leva a liquidez ao PumpSwap e queima os LP tokens | idem |
| Taxa de formatura | 0,015 SOL | FATO, pump.fun/docs/fees (atualizado em 20/05/2026) |
| Criar moeda | 0 SOL / 0 USDC | idem |

INFERÊNCIA (aritmética sobre os valores acima): com k = 30 x 1.073.000.000 e 279,9 milhões de token virtual
restantes ao fim da curva, o SOL virtual é 115, logo cerca de 85 SOL reais entram na curva até formatar. Isso
coincide com "cerca de 85 SOL" citado por imprensa (FATO SEC., madeonsol.com). Os 206,9 milhões restantes
(1 bi menos 793,1 mi) provavelmente formam o lado token do pool na migração; o doc não diz isso. Não confirmado.

Mayhem Mode: opt-in; um agente de IA negocia nas primeiras 24 h, com 1 bilhão de tokens extras emitidos e a sobra
queimada depois (FATO SEC.: Chainstack e The Block). Há o campo `is_mayhem_mode` no repo (FATO).

### 1.2 O que o criador pode ou não configurar

FATO (IDL `create_v2` e README no repo): os argumentos visíveis são nome, símbolo, URI, `creator`,
`is_mayhem_mode`, `creator_fee_bps` (para pares customizados), `is_cashback_enabled` (descontinuado) e
`is_holder_reward`. O IDL foi lido de forma truncada pelo leitor; a lista pode estar incompleta.

- Alocação de equipe e vesting: nenhum argumento documentado. Não encontrado como recurso on-chain.
- Compra do criador no lançamento: não há documentação própria. INFERÊNCIA: qualquer carteira, inclusive a do
  criador, compra na curva na mesma transação ou logo depois, como qualquer comprador. O UI "compra inicial" não foi
  verificado em fonte primária.
- Condição de formatura: fixa (acima). Taxa e curva vêm da conta `Global`, não do criador.
- Divisão de taxas de criador entre carteiras ("Creator Fee Sharing" com `sharing_config` PDA): o README do repo
  lista a funcionalidade (FATO). Máximo de beneficiários e possibilidade de travar: não encontrado.
- Holder Rewards: com `is_holder_reward`, a taxa de criador é "set aside for the people who hold the coin"; o
  pump.fun paga, sem instrução de claim; é irreversível; pode ser desligado globalmente pelo pump.fun
  (FATO, docs/HOLDER_REWARDS_README.md). Percentual de repasse: não documentado. Piso de elegibilidade de US$ 20 e
  pagamentos "várias vezes por hora": FATO SEC. (The Defiant, título e resumo apenas).

### 1.3 Taxas (FATO, pump.fun/docs/fees, atualizado em 20 de maio de 2026)

- Curva (SOL e USDC): criador 0,300%, protocolo 0,95%, LP 0%, total 1,25%.
- PumpSwap, pool canônico em SOL, por faixa de market cap (em SOL): 0 a 420: criador 0,300%, protocolo 0,930%,
  LP 0,020%, total 1,25%. 420 a 1.470: criador 0,950%, protocolo 0,050%, LP 0,200%, total 1,20%. A taxa do criador
  desce em degraus até 0,050% a partir de 98.240 SOL (protocolo 0,050%, LP 0,200%, total 0,30%).
- Pools PumpSwap não canônicos: criador 0%, protocolo 0,05%, LP 0,25%, total 0,3%.
- O criador pode optar por destinar a taxa a instituições de caridade.
- Divisão da taxa do criador "entre carteiras": a única divisão documentada é o Creator Fee Sharing (acima) e
  Holder Rewards. Percentuais por carteira: não encontrado.

INFERÊNCIA: o pico de taxa para o criador (0,95%) ocorre na faixa de 420 a 1.470 SOL de market cap, logo a renda de
criador de um token só é relevante se o token tiver volume sustentado. Para um token de plataforma, 1% de volume
negociado do próprio token é quase irrelevante frente à receita de apostas.

### 1.4 Padrão do token (ponto crítico para o nosso programa)

- FATO (IDL oficial): `create` usa token program fixo `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` (SPL Token
  clássico), com `mint_authority` sendo um PDA do programa com seed "mint-authority".
- FATO (IDL oficial): `create_v2` "Creates a new spl-22 coin and bonding curve"; o token program vem das contas
  restantes e aceita SPL clássico e Token-2022. Quote mint Token-2022 só aceita o conjunto de extensões "xStock"
  (metadata pointer, permanent delegate, default account state, scaled UI amount, pausable, confidential transfer
  mint, transfer hook limitado). Isso vale para o quote mint, não necessariamente para a moeda lançada.
- FATO SEC. (Chainstack, Bitquery, skills de SDK): o pump.fun "introduziu create_v2, que usa Token-2022".
- Não encontrado: qual instrução o site usa por padrão em outubro de 2026; as extensões da moeda criada; se a
  autoridade de congelamento fica nula; se a autoridade de emissão é revogada. A autoridade de emissão ser um PDA do
  programa pump (no `create`) sugere que o criador não emite, mas isso não prova revogação.
- Confiança: ALTA de que as duas instruções existem; MÉDIA de que moedas novas podem ser Token-2022; BAIXA nos
  detalhes (extensões e autoridades). Verificação operacional: lançar um token de teste e ler a conta do mint (dono do
  programa, extensões, `mint_authority`, `freeze_authority`) antes de qualquer decisão de código.

Impacto: o programa lê só mints SPL clássico. Se o token da plataforma for Token-2022, qualquer leitura, staking ou
vault precisa de `token_interface` e `transfer_checked`.

---

## 2. Padrões de token em Solana e "dividendo"

Fonte: solana.com/docs/tokens/extensions e solana-program.com/docs/token-2022/extensions (FATO).

| Extensão | O que faz | Serve para dividendo? |
|---|---|---|
| Transfer fee | Retém taxa por transferência na conta do destinatário; só `transfer_checked`; precisa "colher" (harvest) | Gera caixa, não distribui. Cobra em todo movimento de token |
| Transfer hook | CPI a programa customizado em cada transferência; não roda em auto-transferência | Poderia atualizar contabilidade de recompensa; complexo, risco de CU e de falha |
| Interest-bearing | "The feature is entirely cosmetic": só muda o valor exibido | Não. Nenhum token novo é criado |
| Confidential transfer | Saldos e transferências cifrados | Atrapalha snapshot de holders |
| Permanent delegate | Autoridade pode transferir ou queimar de qualquer conta | Risco de confiança; sinal ruim para holders |
| Non-transferable | Token "soulbound" | Pode servir como recibo de stake, não como token negociável |

Compatibilidade com pump.fun e DEXes:

- O criador não escolhe extensões em nenhum argumento documentado de criação (seção 1.2). Logo, extensões de
  dividendo não estão disponíveis num lançamento no pump.fun. FATO (ausência nos args) com INFERÊNCIA na conclusão.
- Raydium (docs.raydium.io/reference/token-2022-support): CPMM e CLMM aceitam só uma lista permitida (transfer fee,
  metadata pointer, token metadata, interest-bearing, scaled UI amount); transfer hook, permanent delegate, pausable,
  non-transferable e confidential ficam recusados; AMM v4 só aceita SPL clássico. FATO, mas outro resultado de busca
  do mesmo domínio disse que o CPMM aceita hooks. A página é inconsistente comigo; tratar como NÃO CONFIRMADO.
- Jupiter e Orca: "suportam Token-2022 com a maioria das extensões". Sem fonte primária lida. FATO SEC.
- Para a formatura, o pool é do PumpSwap (AMM do próprio pump.fun), que não depende da lista do Raydium.

INFERÊNCIA: o caminho viável é token simples (clássico ou Token-2022 sem extensões de risco), e o dividendo sai de um
programa de staking nosso, em USDC, lido por snapshot ou por contabilidade acumulada por unidade em stake.

---

## 3. Modelos de captura de valor, com casos

### 3.1 Recompra e queima

| Caso | % da receita ao token | Desde | Resultado e dados | Fonte |
|---|---|---|---|---|
| PUMP (pump.fun) | 100% por nove meses, depois 50% (queima automática por contrato, por um ano) | 29/04/2026 (mudança) | Queimou cerca de 36% da oferta em circulação. Receita 2025: US$ 971,37 mi; vitalício > US$ 1 bi. Preço "de lado, abaixo da avaliação de lançamento" em 2026; +6,9% em 24 h após o anúncio. O próprio pump.fun disse haver "falta de confiança na longevidade do negócio, na certeza das recompras e no destino dos tokens recomprados" | FATO SEC.: CoinDesk, 29/04/2026 (duas leituras). Anúncio oficial não lido |
| HYPE (Hyperliquid) | "Fees entirely directed to the community (HLP, assistance fund, deployers)"; o fundo converte taxas em HYPE e queima | n/d | Docs oficiais confirmam o mecanismo (FATO). Números: 97% das taxas ao fundo; mais de US$ 1,1 bi recomprados até abril/2026; voto de dez/2025 reconheceu como queimado o HYPE do fundo | FATO SEC.: Amina Group e VanEck |
| JUP (Jupiter) | 50% das taxas de protocolo em recompra | jan/2025 (Catstanbul) | +40% de preço no anúncio (de cerca de US$ 0,90 para 1,27); proposta de elevar a 70% | FATO SEC.: The Block; fórum oficial discuss.jup.ag (proposta) |
| RAY (Raydium) | 12% da taxa de swap (CPMM/CLMM: 84% LP, 12% recompra, 4% tesouro; AMM v4: 88% LP, 12% recompra). O RAY recomprado fica retido em endereço público, não queimado | n/d | Mecanismo FATO (docs.raydium.io, 2 leituras). "Mais de 30% da oferta circulante recomprada": só título da imprensa | FATO + FATO SEC. (Solana Compass) |
| CAKE (PancakeSwap Prediction) | 3% de cada pote vai ao tesouro, "100% will be used to buyback and burn CAKE" | n/d | Único caso lido de mercado de previsão em pote com queima direta. Dados de preço: não encontrado | FATO (docs.pancakeswap.finance, FAQ) |
| GNS (Gains) | Antes: 60% das taxas de abertura e fechamento em recompra OTC, 90% queimado e 10% governança (54% e 6% da taxa) | n/d | Pausado após o voto "Make Gains Great Again" (jun/2026); retorna se TWAP de 30 dias >= US$ 20 | FATO (docs.gains.trade, 2 leituras) |

### 3.2 Distribuição de receita a stakers ("dividendo")

| Caso | Fração e moeda | Mecanismo | Resultado | Fonte |
|---|---|---|---|---|
| GMX | 27% das taxas em recompra de GMX; tesouro 8,8% (dentro de 10% para Chainlink, tesouro e keepers). Parcela de LPs: não encontrado | Staking; historicamente esGMX | Recompensas de staking suspensas; o GMX recomprado acumula no tesouro até GMX >= US$ 90, com exigência de 80% do pico de stake | FATO (docs.gmx.io, 2 leituras). Data 4/3/2026 e detalhes: FATO SEC. (MEXC News, Cryptopolitan) |
| Gains (GNS) | Moeda de pagamento antiga: não encontrado | Staking (sGNS) | Pausa por governança, junho de 2026; só desconto de taxa por stake continua | FATO (docs.gains.trade) |
| dYdX | Proposta 313: recompra de 25% para 75% da receita líquida | Recompra + staking continua | Aprovada com 59,38% (voto até 13/11/2025). DYDX caiu cerca de 56% desde setembro, segundo a imprensa | FATO SEC.: AMBCrypto, Tangem. Fórum oficial não lido |
| SUSHI (xSUSHI) | 0,05 p.p. dos 0,30% do swap v2 | SushiBar | Dez/2022: proposta de mandar 100% da receita ao tesouro; preço: queda de 70% desde jul/2025 e de 98,5% desde o pico de 2021 (US$ 23) | FATO SEC.: The Defiant, Decrypt, MEXC. Não lido em fonte primária |
| Rollbit (RLB) | 10% cassino, 20% sportsbook, 30% futuros em recompra diária e queima; 20% do lucro diário a um pool de loteria entre stakers | Staking com loteria | Mais de 3,2 bi de tokens queimados (mais da metade da oferta). Dados 2025: não encontrado | FATO SEC.: CoinMarketCap, Ale Research, Benzinga |
| veCRV | n/d | n/d | Página oficial lida deu 404. Não encontrado | n/d |

Leitura (INFERÊNCIA): os casos de "dividendo" com fonte oficial lida (GMX, Gains) estão hoje pausados. Pagar
dividendo exige receita contínua e preço acima de um piso; quando o preço cai, a governança desvia a receita.

### 3.3 Cofre como contraparte

- JLP (Jupiter): contraparte dos traders de perp, mantém exposição ao PnL deles; 75% das taxas voltam ao pool, 25%
  são receita do protocolo; taxas reinvestidas de hora em hora. Perde quando os traders ganham de forma agregada.
  FATO SEC. (resumo de docs.jup.ag via busca; a página não foi aberta).
- HLP (Hyperliquid): "fees directed to HLP, assistance fund and deployers" (FATO, docs). Rendimento e perdas do
  cofre: não encontrado em fonte primária lida.
- GM/GLP (GMX): LPs também são contraparte. Percentual a LPs: não encontrado na página lida.
- Azuro: LPs são contraparte de apostadores num pool singular via vAMM; "bettors lose, LP retains; bettors win, LP
  pays out". Taxas e margem: não encontrado (FATO, gem.azuro.org). Token AZUR: 1 bi de oferta, circulação inicial
  de 152 milhões, stAZUR com "fee share" e recompra, sem percentuais lidos (FATO, tokenomics oficial).

### 3.4 Tokens de mercados de previsão

| Projeto | Token e papel | O que foi encontrado | Fonte |
|---|---|---|---|
| Limitless (LMTS) | Staking, desconto de taxa, governança; oferta de recompra e queima relatada | TGE em 22/10/2025; no dia seguinte, valor de mercado de US$ 34 mi e FDV de US$ 264 mi, queda de 31%; carteira ligada ao time vendeu minutos após o TGE. Percentual de receita ao token: não encontrado | FATO SEC.: imprensa e pm.wiki; docs oficiais abertos não trouxeram o token |
| Azuro (AZUR) | Ver 3.3 | n/d | FATO (docs) |
| Polymarket | POLY: CMO confirmou "there will be a token, there will be an airdrop" (5 a 10% da oferta ao airdrop); lançamento esperado após o app dos EUA | Token ainda não lido como lançado em 2026 | FATO SEC.: The Block, Blockworks |
| Kalshi | Token: não encontrado. A imprensa trata de IPO, não de token | n/d | n/d |
| UMA | Stakers votam em disputas; quem vota com a maioria recebe das votações erradas ou ausentes (sem fee share de trading). Oráculo de resolução da Polymarket | n/d | FATO (docs.uma.xyz via busca) |
| Zeitgeist (ZTG), Hedgehog (HHDG), Augur (REP) | Dados de receita ou percentuais ao token: não encontrado em fonte lida | Hedgehog segue ativo (FATO SEC.) | n/d |

---

## 4. A pergunta do fundador: holders injetando liquidez nas pools

Tudo nesta seção é INFERÊNCIA (derivação matemática), salvo onde há marca de FATO.

Observação de escopo: o CLAUDE.md descreve o programa atual como pool guardada com orçamento de venda do patrocinador.
A conta abaixo usa o pote parimutuel do briefing. Para a pool guardada, a conclusão do item 4.4 se aplica.

### 4.1 Pote parimutuel, definições

Apostas Y no SIM e N no NÃO, taxa f sobre o pote. Quem acerta divide (1-f)(Y+N) proporcionalmente. Multiplicador de
quem aposta no SIM: m = (1-f)(Y+N)/Y. Nenhuma contraparte é necessária: o pote paga com dinheiro dos perdedores.

### 4.2 Semear os dois lados (S de cada lado)

Exemplo: f = 3%, semente S = 100 de cada lado, apostadores y = 300 no SIM e n = 100 no NÃO.
Y = 400, N = 200, pote = 600, líquido = 582. O semeador pôs 200.
- SIM vence: recebe 100/400 x 582 = 145,5. Resultado: -54,5.
- NÃO vence: recebe 100/200 x 582 = 291. Resultado: +91.
Valor esperado, com p a probabilidade verdadeira do SIM e q = Y/(Y+N) a participação final do SIM:
EV = (1-f) x S x [p/q + (1-p)/(1-q)]. Se o mercado está calibrado (p = q), EV = 2S(1-f): o semeador perde
exatamente a taxa. Se p diferir de q, o termo entre colchetes pode ficar abaixo de 2. No exemplo, p = 0,9 e
q = 0,667 dão 1,35 + 0,3 = 1,65, EV = 0,97 x 100 x 1,65 = 160,05 contra 200 investidos.
Conclusão: semear ambos os lados não é "liquidez", é uma aposta cujo retorno esperado é negativo por f, pior se
houver apostadores informados.

### 4.3 Semear um lado só

É uma aposta direcional. Reduz o multiplicador de quem aposta do mesmo lado e eleva o do lado oposto. Só tem EV
positivo se o semeador souber algo que o mercado não sabe.

### 4.4 Cofre como casa (contraparte com odds fixas) e a pool AMM

- Casa bancada: o cofre ganha o saldo dos perdedores menos o que paga aos vencedores. Com odds fixas, o ganho
  esperado é a margem, e a perda ocorre quando o fluxo informado pesa de um lado. Em mercados de metas on-chain
  verificáveis (o modelo do projeto), há apostadores que sabem o resultado antes do prazo, o que é exatamente o
  fluxo tóxico contra a casa. É o mesmo motivo de LPs de JLP e HLP terem risco direcional (seção 3.3).
- Pool AMM de tokens de resultado (x*y = k): com depósito D de cada lado e preço final p do SIM, as reservas ficam
  x = D*sqrt((1-p)/p) de SIM e y = D*sqrt(p/(1-p)) de NÃO. Para D = 100 e p = 0,95: x = 22,9 e y = 436; valor a mercado
  = 22,9*0,95 + 436*0,05 = 43,6 (perda de 56%); no pagamento final, só o SIM vale 1: 22,9 (perda de 77%). Como o
  resultado vai a 0 ou 1, o LP de um mercado binário perde quase tudo no vencimento, a menos que as taxas cubram.
  É um resultado conhecido de AMMs de resultado; esta é a minha derivação, não de fonte lida.

### 4.5 Resposta direta e proporção

- Faz sentido holders entrarem como liquidez no pote? Não como regra: pote não precisa de liquidez, e a injeção
  vira aposta com custo f e risco de seleção adversa.
- Faz sentido como cofre-casa limitado? Só com tetos. Proporção proposta (parâmetro de projeto, não de fonte):
  perda máxima por mercado <= 1 a 2% do cofre; soma das perdas máximas abertas <= 10 a 20% do cofre; só mercados cujo
  resultado não seja conhecível antes de fechar a venda. Nada na literatura lida fornece esses números.
- Efeito no token: ligar o preço do token ao resultado das apostas faz o preço depender de variância, não de receita.
  Mesmo o JLP, com 75% das taxas, tem risco direcional (FATO SEC.).
- Efeito regulatório: ver seção 5. Depositantes em cofre que recebem parte do resultado das apostas são caso à parte.

---

## 5. Riscos conhecidos

### 5.1 Regulação (sem opinar sobre a lei)

- SEC, Framework for "Investment Contract" Analysis of Digital Assets (abril de 2019, página oficial lida).
  FATO: cita como fator o ativo dar "rights to share in the enterprise's income or profits" ou "dividends or
  distributions", e o ativo cujo preço é sustentado por "buybacks, burning or other activities" de quem o promove.
- SEC, ordem Munchee, 11/12/2017 (FATO, sec.gov): token tratado como contrato de investimento por
  comunicação que enfatizava valorização. Valores monetários do resumo da ferramenta não foram usados.
- SEC v. LBRY, 7/11/2022 (FATO SEC.: Skadden, MoFo): tribunal aplicou Howey e considerou o LBC um valor mobiliário,
  com peso nas próprias declarações do emissor.
- SEC, declaração da equipe sobre meme coins, 27/02/2025 (FATO): meme coins típicos não envolvem oferta de valores
  mobiliários; ressalvas explícitas para casos que fogem do descrito e para fraude.
- SEC e CFTC, release interpretativo 33-11412, 17/03/2026, "Application of the Federal Securities Laws to Certain
  Types of Crypto Assets and Certain Transactions Involving Crypto Assets" (FATO, página oficial; texto integral
  não lido). Cinco categorias, entre elas "digital securities". O tratamento de tokens com repasse de receita:
  não confirmado.
- Ação coletiva contra o pump.fun (RICO, consolidada em 2025; FATO SEC.: The Block, Decrypt, Skadden): alegações
  de jogo ilegal e fraude. Desfecho: não encontrado. Jito Labs obteve a rejeição da ação em set/2025 (Skadden).

### 5.2 Snipers e concentração no pump.fun

- Solidus Labs, relatório de 8/05/2025: 98,6% das moedas do pump.fun associadas a golpes ou "pump and dump"; mais de
  7 milhões de moedas até janeiro de 2025, 97 mil com liquidez >= US$ 1.000 (FATO SEC.: imprensa; relatório oficial
  existe, não lido).
- Bubblemaps (FATO SEC.: Cointelegraph): caso AVA, 23 carteiras ligadas ao deployer com 40% da oferta e queda de 96%;
  em um mês, mais de 15.000 SOL extraídos por sniping financiado por deployer, em mais de 15.000 lançamentos, com
  mais de 4.600 carteiras de sniper.
- INFERÊNCIA: um lançamento "justo" exige limite de compra e vesting do lado do criador, mas o pump.fun não oferece
  isso (seção 1.2). A defesa é comunicar a carteira do fundador, travar tokens do time em contrato próprio e
  declarar a compra inicial.

### 5.3 Receita real versus preço

- PUMP: 100% de recompra por nove meses e, mesmo assim, preço de lado abaixo do lançamento; o projeto citou "falta
  de confiança" (CoinDesk).
- GMX e Gains: dividendo suspenso quando o preço caiu (seção 3.2).
- dYdX: 75% de recompra aprovada; preço caiu cerca de 56% desde setembro (imprensa).
- HYPE: recompra de cerca de 7% do market cap ao ano (FATO SEC.: Amina Group). Aqui, a receita é grande e o preço
  se sustentou; não há comparação com amostra suficiente para generalizar.
- INFERÊNCIA: recompra só ajuda se a receita for alta frente ao market cap. Um mercado de previsão novo, com receita
  baixa, não sustenta preço por recompra: um token com FDV de US$ 10 mi precisaria de cerca de US$ 700 mil por
  ano para recomprar 7% (a taxa da HYPE), ou seja, 23% de uma receita de US$ 3 mi com 3% de taxa sobre US$ 100 mi
  de volume de potes.

---

## Opções para o nosso token (INFERÊNCIA)

Todos os números abaixo são exemplos aritméticos. Suposição: taxa de 3% sobre o pote, volume de US$ 1.000.000 de
potes por mês, receita de US$ 30.000 por mês.

### Opção A. Recompra e queima por regra fixa (deriva de PancakeSwap Prediction e HYPE)
- Conta: 50% da taxa a recompra e queima = US$ 15.000 por mês; com market cap de US$ 1.000.000, queima de 1,5% ao mês.
- Prós: sem contrato de staking, sem pagamento a terceiros, simples de auditar.
- Contras: depende de receita; o PUMP mostrou que 100% de recompra não bastou. Para a SEC, a queima é fator citado.

### Opção B. Dividendo a stakers em USDC (deriva de GMX e Gains, hoje pausados)
- Conta: 40% da taxa = US$ 12.000 por mês ao pool de stakers; com 50% da oferta em stake (market cap de US$ 1 mi),
  o rendimento é US$ 12.000 / US$ 500.000 = 2,4% ao mês.
- Prós: rendimento visível, incentiva reter. Exige programa de staking nosso (acumulado por unidade, claim).
- Contras: GMX e Gains suspenderam; é o desenho mais próximo do critério de "dividendo" do Framework da SEC.

### Opção C. Híbrida com piso e freio (deriva de Gains e GMX)
- Conta: 30% recompra e queima + 20% a stakers; se o preço do token cair abaixo de um piso, o dividendo vai ao tesouro
  e a recompra continua, como o GMX fez.
- Prós: tem freio explícito para a baixa; separa receita de preço.
- Contras: regra de governança vira parte da promessa; mais código e mais texto legal.

### Opção D. Cofre de liquidez limitado, só para mercados sem vantagem informacional (deriva de JLP, Azuro)
- Conta: cofre de US$ 100.000, perda máxima por mercado de 1% (US$ 1.000) e teto agregado de 10% (US$ 10.000).
- Prós: dá retorno de contraparte sem comprometer o cofre.
- Contras: seleção adversa; caso regulatório distinto; o token ainda depende da variância dos resultados.

---

## Perguntas em aberto

1. Qual instrução o site do pump.fun usa por padrão hoje (`create` ou `create_v2`)? Quais extensões e autoridades
   tem a moeda criada? Resolve-se lançando um token de teste e lendo o mint.
2. Texto integral do release 33-11412 sobre tokens com repasse de receita (só a página de entrada foi lida).
3. Percentuais de Holder Rewards, máximo de beneficiários no Creator Fee Sharing e se pode travar.
4. Raydium aceita ou não transfer hook no CPMM (duas leituras de docs.raydium.io divergentes).
5. Dados oficiais de HYPE (97%), JUP (50%), dYdX e GMX no fórum de governança de cada um.
6. Receita e preço de LMTS, AZUR, ZTG, HHDG e REP, com fonte primária e data.
7. Se POLY foi lançado e com que alocação (conferir antes de citar).
8. Vesting do criador no pump.fun: há como o criador travar a própria alocação on-chain?
9. A decisão de tese: o token paga dividendo ou só recompra? Depende de parecer jurídico, fora do escopo.

---

## Fontes

Primárias (FATO)
- pump.fun, tabela de taxas: https://pump.fun/docs/fees (atualizada em 20/05/2026)
- Repositório oficial: https://github.com/pump-fun/pump-public-docs (README, docs/PUMP_PROGRAM_README.md,
  docs/HOLDER_REWARDS_README.md, docs/PUMP_CREATOR_FEE_README.md, docs/FEE_PROGRAM_README.md,
  docs/PUMP_SWAP_README.md, idl/pump.json)
- Solana, extensões: https://solana.com/docs/tokens/extensions e
  https://www.solana-program.com/docs/token-2022/extensions
- Raydium: https://docs.raydium.io/ray/ray-buybacks e https://docs.raydium.io/reference/token-2022-support
- PancakeSwap: https://docs.pancakeswap.finance/play/prediction/prediction-faq.md
- Hyperliquid: https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees
- GMX: https://docs.gmx.io/docs/tokenomics/rewards/ e https://docs.gmx.io/docs/tokenomics/gmx-token/
- Gains: https://docs.gains.trade/liquidity-farming-pools/gns-staking
- Azuro: https://gem.azuro.org/knowledge-hub/azur/tokenomics e
  https://gem.azuro.org/knowledge-hub/introduction/lp-utilization-virtual-funds
- SEC, meme coins (27/02/2025): https://www.sec.gov/newsroom/speeches-statements/staff-statement-meme-coins
- SEC, Framework 2019: https://www.sec.gov/about/divisions-offices/division-corporation-finance/framework-investment-contract-analysis-digital-assets
- SEC, Munchee (2017): https://www.sec.gov/litigation/admin/2017/33-10445.pdf
- SEC, release 33-11412: https://www.sec.gov/rules-regulations/2026/03/s7-2026-09

Secundárias (FATO SEC.)
- CoinDesk, 29/04/2026, PUMP: https://www.coindesk.com/markets/2026/04/29/pump-fun-burns-36-of-pump-supply-in-usd370-million-wipe-locks-50-revenue-into-ongoing-buybacks
- The Block, PUMP: https://www.theblock.co/post/399288/pump-fun-burns-370-million-pump
- The Block, JUP: https://theblock.co/post/337071/jupiter-spikes-40-as-founder-says-50-of-fees-will-go-to-token-buybacks
- Fórum Jupiter: https://discuss.jup.ag/t/increase-the-litterbox-buyback-allocation-from-50-to-70/40136
- Amina Group, HYPE: https://aminagroup.com/research/hyperliquid-hype-etf-buyback-staking-yield-institutional-access-2026/
- AMBCrypto, dYdX: https://ambcrypto.com/dydx-community-approves-massive-buyback-increase-to-75-of-protocol-revenue/
- Cryptopolitan e MEXC News, GMX: https://www.cryptopolitan.com/gmx-rally-projects-reevaluate-buybacks/
- Docs Jupiter (via busca), JLP: https://docs.jup.ag/user-docs/earn/jlp/earn
- Solidus Labs, relatório: https://www.soliduslabs.com/reports/solana-rug-pulls-pump-dumps-crypto-compliance
- Cointelegraph, Bubblemaps: https://cointelegraph.com/news/bubblemaps-ava-ai-token-sniping-deployer-wallets-solana
- The Block, ação contra o pump.fun: https://www.theblock.co/post/363996/burwick-law-names-solana-and-jito-executives-in-expanded-rico-case-against-pump
- Skadden, Jito: https://www.skadden.com/about/news-and-rankings/news/2025/10/crypto-developer-jito-labs-wins-dismissal-of-class-action
- The Block, POLY: https://www.theblock.co/post/376048
- The Block, Mayhem: https://www.theblock.co/amp/post/379285/pump-funs-new-mayhem-mode-fails-boost-token-launches-revenue
- Docs UMA (via busca): https://docs.uma.xyz/faqs
- MoFo e Skadden, LBRY: https://www.mofo.com/resources/insights/221110-court-rules-lbry-token
- Blogs e agregadores, só quando não havia outra fonte: madeonsol.com (85 SOL), pm.wiki (Limitless), coinranking
  e Ale Research (Rollbit), The Defiant e Decrypt (SUSHI)

---

## Segunda rodada (3 de outubro de 2026): fluxo do dinheiro no pump.fun, alternativas e utilidades

Mesma legenda do topo. Nenhuma correção de número da primeira rodada foi necessária. Limite de método repetido: o leitor
devolve resumos; os pontos críticos (Fee Sharing, Holder Rewards) foram abertos duas vezes com perguntas diferentes.

### 1. Para onde vai o dinheiro de quem compra no pump.fun

- Curva: taxa total 1,25% = protocolo 0,95% + criador 0,30% + LP 0%; o resto (98,75%) entra na reserva da curva.
  FATO (pump.fun/docs/fees, atualizada em 20/05/2026; já na seção 1.3).
- PumpSwap, pool canônico: criador de 0,05% a 0,95% conforme faixa de market cap; ver seção 1.3. FATO.
- O criador recebe algo além da taxa de criador? Não encontrado em nenhuma fonte oficial. Os argumentos de `create_v2`
  (nome, símbolo, URI, creator, `is_mayhem_mode`, `creator_fee_bps`, `is_holder_reward`) não têm alocação nem vesting.
- RESPOSTA: reter 30% do valor das compras NÃO é possível no pump.fun. O teto nativo do criador é a taxa de criador
  (0,30% na curva, até 0,95% no PumpSwap). Para reter mais, só com venda separada dele (a compra inicial) ou com outro
  launchpad (item 6). INFERÊNCIA com base na ausência documentada; confiança ALTA.

### 2. Creator Fee Sharing (FATO: docs/instructions/CREATOR_FEE_SHARING.md no repo oficial, duas leituras)

- Até 10 beneficiários, sem duplicata, cada `share_bps > 0`, soma exata de 10.000 bps. Quem cria a `sharing_config`:
  o admin global ou o criador atual.
- `update_fee_shares_v2` define a lista e põe `admin_revoked = true`: "só pode ser usada uma vez por sharing_config".
  Logo a divisão NÃO muda depois. Antes dele, as taxas pendentes na curva e no AMM são varridas por CPI.
- Saque: não há "claim". `distribute_creator_fees_v2` é permissionless e empurra os valores. Em SOL, vai lamports
  direto para a carteira (só a pubkey). Em USDC exige ATA canônica de cada beneficiário. Se o beneficiário pode ser PDA
  (conta de programa): o doc não restringe nem afirma; não encontrado. Teste em devnet antes de depender disso.
- Data de lançamento 09/01/2026: FATO SEC. (Cointelegraph, Forklog, via busca). Confiança: ALTA nas regras, MÉDIA no PDA.
- Observação: o README antigo PUMP_CREATOR_FEE_README.md diz que `creator_fee_basis_points` global era 0 e que o
  criador assina `collectCreatorFee`; está desatualizado em relação à tabela de taxas atual.

### 3. Holder Rewards (FATO: docs/HOLDER_REWARDS_README.md e README do repo, duas leituras)

- O que é: moeda criada com `is_holder_reward`; "a taxa de criador cobrada em cada trade não vai à carteira do
  criador, é reservada a quem segura a moeda" e o pump.fun paga; não há nada a sacar. Irreversível ("nunca volta a ser
  moeda comum"); o pump.fun pode desligar a criação globalmente. Um endereço controlado pelo pump.fun vira o `creator`.
- Quem paga e quanto: sai da própria taxa de criador (0,05% a 0,95% do volume, tabela de taxas). O repo não dá percentual
  de repasse nem mínimo. O criador abre mão da taxa toda; que seja exclusivo com Fee Sharing é INFERÊNCIA.
- Requisitos: mais de US$ 20 em carteira e pagamento pró-rata "várias vezes por hora", na moeda de cotação (SOL):
  FATO SEC. (The Defiant, Crypto Briefing, via busca). Token em staking num programa: não encontrado; INFERÊNCIA: o
  saldo fica na conta do programa, então provavelmente não conta. Confiança: ALTA no mecanismo, MÉDIA nos US$ 20.

### 4. Compra do criador no lançamento (dev buy)

- Limite on-chain ou no site: não encontrado em fonte oficial. Visibilidade: a compra é uma transação pública na curva;
  ferramentas como Bubblemaps mostram carteiras agrupadas e lançamentos "bundled" (FATO SEC.: blog.bubblemaps.io).
- Norma de mercado sobre tamanho aceito: não encontrado com número. Só critério qualitativo de concentração
  (FATO SEC.). Dado já citado na seção 5.2: caso AVA, 23 carteiras com 40% da oferta, queda de 96%.

### 5. Plataformas com produto real que lançaram o token no pump.fun

- NÃO ENCONTRADO após quatro buscas: nenhum caso documentado, com data e fonte, de plataforma com receita própria que
  lançou o token pela curva do pump.fun e depois destinou taxas de criador a recompra ou holders.
- Ferramentas de terceiros para recompra com a taxa de criador existem (xbuyback.fun; UsePaid pausou pagamentos em
  um pico de US$ 1,54 mi, U.Today). Só vistas em resultado de busca: FATO SEC., não verificado.
- Análogo mais próximo: o PUMP, token do próprio pump.fun, NÃO lançado pela curva e sim por ICO em jul/2025, FDV de
  US$ 4 bi, preço US$ 0,004; a rodada privada (18% da oferta, cerca de US$ 720 mi) saiu ao mesmo preço do público.
  Crítica da comunidade ("the great extraction", Bonk Guy). Recompra de US$ 350 mi e depois US$ 466 mi sem recuperar o
  preço (81% abaixo do pico em manchete). FATO SEC.: Cointelegraph, The Block, CoinDesk, BeInCrypto/TradingView.
- Casos "lançou no pump.fun e depois fez rodada privada ou outro token": não encontrado.

### 6. Alternativas em que o criador retém parte do fluxo de compra

| Plataforma | O que o criador/parceiro configura | Fonte |
|---|---|---|
| Meteora DBC | Curva em até 20 faixas de preço; cotação SOL, USDC ou SPL; Token-2022; taxa base mínima 25 bps, teto 99%; `creator_trading_fee_percentage` (parte da taxa para o criador); % de LP liberável e % de LP travada pós-migração; `locked_vesting` do token do criador (Jupiter Lock); taxa de migração de 0,25% a 6%; limiar `migration_quote_threshold`. Protocolo Meteora leva 20% das taxas; no excedente da migração: criador 40%, parceiro 40%, Meteora 20% | FATO: docs.meteora.ag (accounts), github.com/MeteoraAg/dynamic-bonding-curve. 20% e 40/40/20: via busca da docs, 1 leitura |
| Bags (sobre DBC) | `bagsConfigType`: um de sete modos de taxa em SOL, fixados ao criar e imutáveis; fee-claimers com bps (ex.: 50/50); alguns modos travam 85% ou 96% da oferta. Padrão: 1% do volume aos destinatários | FATO: docs.bags.fm; 1% padrão: FATO SEC. |
| Believe | Taxa de 2% repartida entre app e fundadores, parte do fundador em vesting; outra fonte diz 1% criador, 0,1% scout, 0,9% plataforma (divergem) | FATO SEC.: DEXTools, MadeOnSol |
| Raydium LaunchLab | `PlatformConfig`: LP na migração em `platformScale`, `creatorScale`, `burnScale` (soma 1.000.000); vesting até `max_lock_rate` (padrão 30%); parte da taxa de LP pós-migração ao criador via "Burn & Earn" | FATO: docs.raydium.io (via busca) |
| LetsBonk | Taxa de swap de 1%; divisão da plataforma em 03/12/2025: 51% "Buy for BNKK", 10% staking, etc. Fração do criador: não encontrado | FATO SEC.: coinranking, The Block |
| Token-2022 transfer fee | Taxa em toda transferência, colhida por `harvest`; não disponível nos argumentos de criação do pump.fun | FATO (solana.com); ver seção 2 |

- Alcance de público versus pump.fun: não encontrado com número.
- INFERÊNCIA: para reter parte do fluxo, a rota é ser o "parceiro" de uma config DBC própria (taxa de criador alta,
  `locked_vesting` para a equipe, cotação USDC) ou usar os modos do Bags. Cuidado: taxa de 1% sobre compras não é 30%.
  Nenhuma configuração documentada devolve 30% do valor de compra ao criador, exceto alocação de equipe vendida
  pela própria curva.

### 7. Utilidades de token em plataformas de aposta e previsão

| Projeto | Utilidade e percentuais | Fonte |
|---|---|---|
| Rollbit (RLB) | Desde 08/08/2023: 10% da receita do cassino, 20% do esporte e 30% de futuros em compra no mercado; queima 90% e paga o resto a Rollbots em stake. Taxa de staking de 0,20% para a loteria, metade queimada | FATO SEC.: Ale Research, CoinMarketCap |
| Shuffle (SHFL) | 15% da receita semanal volta por loteria em USDC a quem faz stake (cerca de 48% APR); cerca de 30% da receita em SHFL vai a queima semanal; mais de 5% da oferta queimada até dez/2025 | FATO SEC.: Blockworks, Coinranking, stakingrewards |
| Limitless (LMTS) | Stake dá parte das taxas, taxa de taker menor, rebate de maker maior, voto. Recompra "não confirmada" | FATO SEC.: pm.wiki, Coinranking |
| Azuro (AZUR) | stAZUR paga "rendimento real" por campanhas (dez/2024: 482.007 AZUR em 30 dias); recompras periódicas (out/2024: 1.372.429 AZUR). % da receita: não documentado | FATO: gem.azuro.org (buyback, st-azur) |
| PancakeSwap Prediction | 3% do pote ao tesouro, 100% em recompra e queima de CAKE | FATO (seção 3.1) |

- Voto sobre quais mercados abrir, acesso a patrocínio de mercados: não encontrado em nenhuma documentação lida.
  O único voto documentado é a governança geral (AZUR, LMTS) e votos de disputa (UMA).

### Continua sem confirmação

1. PDA como beneficiário do Fee Sharing (testar em devnet); percentual e mínimo exatos de Holder Rewards; se
   token em staking conta.
2. Plataforma real lançada na curva do pump.fun, com resultado; limite ou norma de dev buy.
3. Retorno ao criador por DBC acima de 1% por configuração; alcance de público das alternativas.
4. Percentuais de LMTS e AZUR; qualquer utilidade de voto de mercados.

Fontes novas (primárias): https://github.com/pump-fun/pump-public-docs/blob/main/docs/instructions/CREATOR_FEE_SHARING.md
e .../docs/HOLDER_REWARDS_README.md; https://docs.meteora.ag/developer-guides/dbc/program/accounts;
https://github.com/MeteoraAg/dynamic-bonding-curve; https://docs.bags.fm/how-to-guides/customize-token-fees.md;
https://docs.raydium.io/products/launchlab/platform-config.md; https://gem.azuro.org/knowledge-hub/azur/buyback e
.../st-azur. Secundárias: thedefiant.io (holder rewards), cryptobriefing.com, cointelegraph.com (fee sharing,
PUMP ICO), dextools.io (Believe), theblock.co (LetsBonk), alearesearch.io (Rollbit), pm.wiki (Limitless),
coinranking.com (Shuffle, LetsBonk), blog.bubblemaps.io.
