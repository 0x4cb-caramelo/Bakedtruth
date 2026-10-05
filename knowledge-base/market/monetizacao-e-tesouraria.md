# Monetização, patrocínio, fundo de prêmios e tesouraria em Bitcoin (Onda 1, agente 1F)

Data: 4 de outubro de 2026.

Legenda: **FATO** = fonte primária (documentação oficial, comunicado da própria empresa, arquivo em regulador).
**FATO SECUNDÁRIO** = imprensa, agregador, rastreador de dados on-chain ou blog (a fonte está indicada).
**INFERÊNCIA** = conta ou raciocínio meu, com as premissas à vista. "Não encontrado" = procurei e não confirmei.

Limites desta rodada (leia antes de usar os números):

- A busca foi feita pelo Exa, que devolve trechos das páginas. A cota gratuita estourou uma vez no meio do trabalho.
- A página do DefiLlama sobre a Polymarket deu HTTP 403 na segunda leitura. Os números trimestrais da Polymarket vêm
  de uma leitura só, e três rastreadores diferentes dão totais diferentes (seção 2.2). Use como ordem de grandeza.
- Os preços de anúncio em CoinGecko, CoinMarketCap e DEXTools vêm de uma agência revendedora, não das tabelas
  oficiais, e a própria página da agência se contradiz em dois itens. Estão marcados como fonte fraca.
- Não repeti o que já está em `receita-mercados-de-previsao.md`, `patrocinio-e-destaque-pago.md` e
  `modelos-de-token.md`. Onde cito esses arquivos, o número não foi reaberto.
- Nada aqui é opinião sobre o que a lei permite. Os pontos jurídicos estão marcados "para advogado".

## Resumo em dez linhas

1. Os líderes vivem quase só de taxa por negociação. Na Polymarket, 100% da receita bruta medida on-chain em 2026 é
   taxa de quem toma liquidez; na Kalshi, a taxa somou US$ 263,5 mi em 2025, 89% vinda de esportes.
2. As outras formas existem (venda de dados, juros do dinheiro parado, contratos perpétuos, taxa de construtor,
   indicação, taxa de depósito por cartão, taxa do criador de mercado), mas nenhuma tem valor divulgado pelos líderes.
3. Assinatura "pro" é vendida por terceiros (US$ 15 a 299 por mês), não pelas plataformas. Venda de espaço publicitário
   pelas plataformas: não encontrada. Kalshi e Polymarket são compradoras de mídia, não vendedoras.
4. Cabem num pote sem KYC: corte do pote, patrocínio, taxa na devolução de pote de um lado só, fatia da penalidade de
   saída, taxa de análise de pergunta e, mais tarde, dados e taxa de front-end. Não cabem: juros, perpétuos, saque.
5. A Polymarket devolve aos usuários cerca de 24% da taxa bruta (2º e 3º trimestres de 2026). Os 25% do fundo de
   prêmios do Baked estão nessa mesma faixa.
6. As faixas de US$ 500, 1.500 e 5.000 batem com o preço de destaque em sites com milhões de usuários. No lançamento
   o Baked não tem essa audiência: o que o patrocinador compra de concreto é o prêmio dentro do pote.
7. No "70/30", os precedentes de dinheiro somado ao pote (Polymarket, pôquer) mandam 100% ao pote. O cenário
   "30% banca, 70% pote" é o que eles sustentam. "70% banca" só se compara com venda de anúncio.
8. Conta-chave: prêmio neutro só zera a taxa do apostador quando passa de 3,09% das apostas. Com 70% para a banca, a
   faixa de US$ 500 põe US$ 150 no pote, que não cobre a taxa de um pote de US$ 10 mil.
9. Bitcoin: Tether (até 15% do lucro), Block (10% do lucro bruto de produtos de bitcoin) e Méliuz (até 10% do caixa)
   são os precedentes de percentual fixo. Em 2026 o BTC caiu para a faixa de US$ 59 a 64 mil e Strategy e Metaplanet
   carregam perdas bilionárias no papel. Caminho prático: cbBTC em multisig no começo, BTC nativo depois de um teto.
10. Recompra: em janeiro de 2026 a Helium parou a recompra e a Jupiter admitiu ter gasto mais de US$ 70 mi sem mover
    o preço, porque os desbloqueios de token eram muito maiores que a recompra.

---

## 1. Todas as formas de receita, além da taxa por aposta

A pergunta do fundador foi: "essas empresas não tem outras formas de monetização, não?". Têm, mas pesam pouco ou não
são divulgadas. A tabela resume; os detalhes vêm depois.

| Forma | O que é, em uma frase | Quem faz | Quanto cobra ou rende | Cabe num pote sem KYC? |
|---|---|---|---|---|
| Taxa por negociação ou corte do pote | A casa fica com um pedaço de cada aposta | Todos | Kalshi ~1,2% a 1,5% do volume; Polymarket ~0,67%; PancakeSwap 3% do pote | Sim. É a receita central (3% do pote) |
| Venda e licenciamento de dados | Vender as probabilidades como dado de mercado | Polymarket (ICE), Kalshi (CNBC, CNN, Barchart) | Valores não divulgados | Depois. Precisa de volume para o dado valer |
| Juros do dinheiro parado | Aplicar o saldo dos clientes e ficar com parte do juro | Kalshi | Paga até ~4% ao ano ao cliente e fica com a diferença; valor não divulgado | Não. O fundador abandonou o rendimento do pote |
| Contratos perpétuos e alavancagem | Aposta contínua no preço de um ativo, com dinheiro emprestado | Kalshi (mai/2026), Polymarket (set/2026) | Kalshi: ~US$ 7 bi/mês de volume com taxa zero | Não. Outro produto, outro risco, outra regulação |
| Taxa de construtor e API | Quem faz um aplicativo em cima cobra a própria taxa | Polymarket | Construtor cobra até 1% (taker) e 0,5% (maker); vai para ele, não para a Polymarket | Depois, como taxa de front-end. É canal de distribuição, não receita |
| Indicação e afiliados | Pagar a quem traz apostador | Polymarket, Kalshi, cassinos cripto | Polymarket: 10% da taxa líquida por 30 dias; Stake: 10% padrão sobre a margem | Sim, mas é custo de aquisição, não receita |
| Marca branca e distribuição por parceiro | Outra empresa mostra os mercados e divide a taxa | Kalshi com Robinhood | Divisão perto de 50/50 da taxa cobrada pelo parceiro | Depois. Depende de carteira ou aplicativo parceiro |
| Patrocínio e publicidade | Marca paga para aparecer | Não encontrado como receita dos líderes | Polymarket: o "patrocínio" vai 100% para quem dá liquidez | Sim. É a segunda trilha de receita do Baked |
| Mercados pagos por empresas | Empresa paga para existir uma pergunta | Metaculus (torneios financiados) | Prêmios de US$ 15 a 20 mil por torneio | Sim. É o "patrocinador pede pergunta" |
| Taxa de depósito, saque e conversão | Cobrar na entrada ou na saída do dinheiro | Kalshi, PredictIt | Kalshi: até 2% em cartão; PredictIt: 5% no saque | Não. A carteira é do usuário; não há saque para cobrar |
| Assinatura ou plano profissional | Mensalidade por ferramentas | Só terceiros (Rivo, ArbBets) | US$ 15 a 299 por mês | Depois, e pequeno |
| Taxa sobre criação de mercado | Cobrar ou dividir taxa com quem cria a pergunta | Limitless, Prob.Trade, Hedgehog | Criador ganha de 1% do volume a 5% das taxas | Parcial. No Baked a equipe cria; vira "taxa de análise" |

### 1.1 Venda e licenciamento de dados

O que é: as probabilidades de um mercado de previsão são um dado novo ("o mercado dá 62% de chance de corte de juros").
Fundos e bancos pagam por dado que antecipa preço. A plataforma vende o dado, não a aposta.

- FATO (comunicado da ICE, 7/out/2025, e formulário 8-K na SEC): a Intercontinental Exchange, dona da Bolsa de Nova
  York, vai investir até US$ 2 bilhões na Polymarket, a uma avaliação de cerca de US$ 8 bilhões antes do aporte, e
  "se tornará distribuidora global dos dados da Polymarket" para investidores institucionais.
- FATO (comunicado da ICE, 11/fev/2026): a ICE lançou o "Polymarket Signals and Sentiment", entregue pelo ICE
  Consolidated Feed (tempo quase real) e pelo ICE Consolidated History (histórico), e será a "fornecedora exclusiva"
  desse dado para o mercado de capitais institucional.
- Quanto a Polymarket recebe por isso (preço, parcela da receita): **não encontrado**. Nenhum dos dois comunicados diz.
- FATO SECUNDÁRIO (Sacra, lida em 4/out/2026): a Kalshi tem acordo plurianual exclusivo com a CNBC, é a parceira de
  mercado de previsão da CNN, tem integração com a FOX, parceria com a Barchart e colaboração com a ARK Invest.
  Valores e sentido do pagamento: não divulgados.
- Cabe no Baked? INFERÊNCIA: não no começo. O dado on-chain do Baked já é público para quem souber ler a rede; o que
  se venderia é o dado organizado (API, histórico limpo). Só vale com volume e com perguntas que interessem a fundos.
  Como referência de preço, um fornecedor independente anuncia US$ 499 a 1.999 por mês por dados de Kalshi e
  Polymarket, e ele mesmo chama esses preços de "indicativos" (FATO SECUNDÁRIO, pred-markets.com).

### 1.2 Juros do dinheiro parado

O que é: o dinheiro depositado e ainda não apostado, ou travado numa aposta longa, pode ficar em título do Tesouro
americano. A casa repassa uma parte do juro ao cliente e fica com o resto.

- FATO SECUNDÁRIO: a Kalshi paga juro sobre saldo parado; as fontes dão "até 4,05% ao ano" (Sacra), 3,95% (betting.net,
  jul/2026) e 3,25% (Ledger Academy, jan/2026). Quanto ela retém: não divulgado.
- FATO (help.polymarket.com, "Holding Rewards"): a Polymarket paga 3,25% ao ano sobre o valor das posições em certos
  mercados longos, "para manter o preço de longo prazo correto", e a página diz que isso é "financiado pela
  tesouraria da Polymarket". Ou seja, ali é custo, não receita: US$ 1,12 mi no 3º trimestre de 2026 (FATO
  SECUNDÁRIO, DefiLlama). Um rastreador (PolyScalping) diz o contrário, que o pagamento sai do juro do caixa. As duas
  fontes divergem; vale a página oficial.
- Cabe no Baked? Não. Decisão do fundador: "esquece o rendimento do pote". Fica registrado só o que se abre mão.

### 1.3 Contratos perpétuos e alavancagem

O que é: um contrato que acompanha o preço de um ativo (Bitcoin, ouro, uma ação) sem data de vencimento, em que o
cliente aposta com mais dinheiro do que depositou. Exemplo: com alavancagem de 20 vezes, US$ 100 controlam US$ 2.000;
uma queda de 2,5% contra a posição já a liquida.

- FATO (comunicado da Kalshi, 29/mai/2026): a Kalshi anunciou contratos perpétuos de cripto regulados pela CFTC e se
  disse a primeira empresa a oferecê-los nos EUA.
- FATO SECUNDÁRIO (Sacra, jun-jul/2026): em junho de 2026 os perpétuos da Kalshi movimentaram cerca de US$ 7 bi no mês
  **com taxa zero**. Ou seja, por enquanto é volume sem receita.
- FATO SECUNDÁRIO (Decrypt, 4/set/2026): a Polymarket lançou o "Polymarket Perps" em 3/set/2026, de 10 para 67
  mercados no primeiro dia, com até 20 vezes de alavancagem em cripto, S&P 500, petróleo, ouro e prata, e até 10
  vezes em ações. Não aceita ordens dos EUA. Taxa cobrada: não encontrada.
- FATO SECUNDÁRIO (CNBC, 22/set/2026): a Kalshi pediu à CFTC para oferecer margem (aposta com dinheiro emprestado)
  também nos contratos de evento, só para participantes institucionais e fora de esportes e cultura.
- Cabe no Baked? Não. É outro produto: exige contraparte, liquidação e preço por oráculo a cada segundo. Não tem
  relação com um pote que se divide no fim.

### 1.4 Taxa de construtor e de API

O que é: um terceiro constrói um aplicativo, robô ou carteira que manda ordens para a plataforma, e a plataforma deixa
esse terceiro cobrar a própria taxa por cima.

- FATO (docs.polymarket.com, "Builder Fees"): o construtor configura a própria taxa, até 1% para quem toma liquidez e
  até 0,5% para quem fornece. A taxa é somada à da plataforma, nunca a substitui, e vai para a carteira do construtor.
  Mudança de taxa só uma vez a cada 7 dias e com 3 dias de aviso.
- FATO (builders.polymarket.com): "mais de US$ 2,5 milhões em subsídios" para quem constrói, mais prêmios semanais em
  USDC por volume.
- Leitura (INFERÊNCIA): para a Polymarket isso não é receita, é canal de distribuição pago pelo usuário final. Para o
  Baked, o equivalente é um campo de "taxa de front-end" na instrução de aposta. Cabe sem KYC, mas é para depois.
- Programa equivalente na Kalshi, com percentuais: não encontrado nesta rodada.

### 1.5 Indicação, afiliados e marca branca

- FATO (docs e help da Polymarket, jun/2026): quem indica ganha 10% da taxa líquida das indicações diretas e 5% das
  indiretas, pago todo dia, durante os primeiros 30 dias do indicado ou até ele chegar ao nível Platinum. Só ganha
  quem já negociou pelo menos US$ 10.000 na vida.
- FATO (arquivo da Polymarket US na CFTC, 16/jan/2026): nos EUA, o indicado recebe crédito de US$ 10 ao depositar pelo
  menos US$ 10; o programa vai até 31/dez/2027.
- FATO (help.kalshi.com, ago/2026): a Kalshi paga bônus em crédito aos dois lados, exige identidade verificada (KYC)
  e tem teto vitalício por conta. Valores: variam por conta; não publicados.
- FATO (help.stake.com e stake.us): no cassino cripto Stake, a comissão padrão do afiliado é 10%, pela fórmula
  "margem da casa × valor apostado ÷ 2 × taxa de comissão"; em esportes a margem teórica usada é 3%.
- FATO SECUNDÁRIO (blog PureOdds, jan/2026): Rollbit paga 10% da margem teórica no nível básico; BC.Game começa em 25%
  da receita líquida. Fonte fraca, de um concorrente.
- Custo real na Polymarket (FATO SECUNDÁRIO, DefiLlama): US$ 2,6 mi no 2º trimestre e US$ 1,66 mi no 3º trimestre de
  2026 em recompensas de indicação, cerca de 1% a 2% da taxa bruta.
- Marca branca: FATO SECUNDÁRIO (Bank of America, via Futu, abr/2026): a Robinhood cobra do usuário e divide perto de
  meio a meio com a Kalshi (1 centavo por contrato para cada uma). FATO SECUNDÁRIO (CNBC, via The Block, dez/2025): o
  negócio de previsão da Robinhood caminhava para US$ 300 mi por ano. A parcela do volume da Kalshi que vem da
  Robinhood é dada como 25% (Sacra, jun/2026), 25% a 35% (Piper Sandler, out/2025) ou 57% (The Block, out/2025).
- Cabe no Baked? Indicação cabe e é on-chain, mas é **custo**, e sem KYC a mesma pessoa pode se indicar com outra
  carteira (a Polymarket exige US$ 10 mil de volume justamente para encarecer isso). INFERÊNCIA.

### 1.6 Patrocínio, publicidade e mercados pagos por empresas

- Venda de espaço publicitário por Kalshi ou Polymarket: **não encontrado**. O que as fontes mostram é o contrário:
  elas compram mídia (Kalshi virou parceira oficial do US Open em 1/set/2026 e apareceu na Copa via ADI
  Predictstreet; a Polymarket contratou LeBron James em set/2026). FATO SECUNDÁRIO (Rolling Stone, crypto.news,
  Digiday).
- FATO (help.polymarket.com, já descrito em `patrocinio-e-destaque-pago.md`): no "Sponsor Market Rewards" qualquer
  usuário deposita USDC para pagar quem dá liquidez num mercado; o patrocinador "não recebe nada". O dinheiro vai
  inteiro para o mercado. A Polymarket não cobra parcela, segundo a página.
- FATO SECUNDÁRIO (já no mesmo arquivo): torneios do Metaculus financiados por terceiros, com prêmios de US$ 15 a
  20 mil.
- Leitura (INFERÊNCIA): vender patrocínio de pergunta como receita da casa é terreno novo. Não achei líder que faça.
  Isso é oportunidade (ninguém ocupa) e risco (ninguém provou que alguém paga).

### 1.7 Taxas de depósito, saque e conversão

- FATO (tabela de taxas da Kalshi, versão de 7/jul/2026): até 2% sobre depósito por cartão; a Kalshi se reserva o
  direito de cobrar de 0% a 2% em qualquer meio de pagamento; cripto pode ter taxa do processador terceirizado.
- FATO (arquivo na CFTC de 2022): a Kalshi já cobrou US$ 2 por saque.
- FATO SECUNDÁRIO: a Polymarket não cobra depósito nem saque; o cartão via MoonPay custa cerca de 4% a 4,5%, cobrados
  pela MoonPay. PredictIt cobra 5% no saque (já em `receita-mercados-de-previsao.md`).
- Cabe no Baked? Não como "saque": o dinheiro sai do pote direto para a carteira do usuário. O único ponto parecido é
  o pagamento vindo de outra rede (SODAX): se o parceiro paga comissão a quem integra, isso seria receita de
  conversão. Não verificado; está nas perguntas em aberto.

### 1.8 Assinatura ou plano profissional

- Plano pago vendido pela própria plataforma: **não encontrado** em Kalshi nem em Polymarket.
- FATO SECUNDÁRIO (páginas de preço dos próprios produtos): terceiros vendem terminais e ferramentas. Rivo: US$ 9 por
  semana ou US$ 15 por mês. ArbBets: US$ 59, 149 e 299 por mês. Um servidor de integração para a Kalshi: de US$ 5 a
  59 por mês.
- Cabe no Baked? Só mais tarde e pequeno (alertas, painel de carteiras, histórico). INFERÊNCIA.

### 1.9 Taxa sobre criação de mercado

- FATO (docs e blog da Limitless, 4/jun/2026): qualquer usuário cria um mercado e ganha uma parcela das taxas de
  negociação dele; a taxa do criador é fixada na criação e sai antes do reembolso aos formadores de mercado.
  Percentual: varia por mercado; não publicado.
- FATO SECUNDÁRIO (site da Prob.Trade, Solana): criar mercado exige US$ 100 ou mais em liquidez inicial; o criador
  ganha 1% de cada negociação.
- FATO (docs da Perk, perpétuos em Solana, não é previsão): criar mercado custa 1 SOL, pago ao protocolo, "como
  barreira contra spam"; o criador ganha 10% das taxas.
- Já registrado: Hedgehog (criador com 5% das taxas), Manifold (M$ 100 para criar), Augur (taxa do criador).
- Cabe no Baked? Em parte. A equipe cria as perguntas, então não há criador para remunerar. O análogo é cobrar uma
  **taxa de análise** não reembolsável de quem pede pergunta. Isso conflita em parte com a decisão "se for recusado
  devolve a grana travada": dá para devolver o patrocínio e reter só a taxa de análise. É alternativa, não decisão.

### 1.10 Formas que saem do próprio desenho do pote (INFERÊNCIA)

Nenhuma destas veio de precedente; são derivações das decisões já tomadas.

- **Taxa na devolução do pote de um lado só.** Já decidida ("A banca nunca perde").
- **Fatia da penalidade de saída antecipada.** A decisão é que a penalidade fica "pro pote". Uma parte dela poderia ir
  à banca. Exemplo: penalidade de 10% sobre uma saída de US$ 100 = US$ 10; se 20% disso for da banca, são US$ 2.
  Muda o incentivo de quem fica, então precisa de decisão do fundador.
- **Taxa de criador do token no pump.fun.** De 0,05% a 0,95% do volume do token, conforme a faixa (já em
  `modelos-de-token.md`). É receita do token, não da aposta.

---

## 2. Quanto cada forma pesa na receita dos líderes

### 2.1 Kalshi

A Kalshi é empresa fechada e não publica balanço. Tudo abaixo é estimativa de terceiros.

| Linha | Valor | Fonte e data |
|---|---|---|
| Taxa de negociação, 2025 | US$ 263,5 mi sobre US$ 22,88 bi negociados (1,15%) | FATO SECUNDÁRIO, BJ21, 11/jan/2026 |
| Dentro disso, esportes | US$ 234,6 mi (89%); fora de esportes, menos de US$ 30 mi | idem |
| Dentro disso, apostas combinadas | US$ 3,7 mi (cerca de 2% nos últimos três meses de 2025) | idem |
| Braço próprio de negociação (Kalshi Trading) | Não entra na conta; a cofundadora disse que "não é lucrativo" | idem |
| Juros do caixa dos clientes | Não divulgado | não encontrado |
| Dados, API, parcerias de mídia | Não divulgado | não encontrado |
| Perpétuos | Receita zero (taxa zero) sobre ~US$ 7 bi/mês | FATO SECUNDÁRIO, Sacra, jun/2026 |
| Receita anualizada | US$ 1,5 bi (Bank of America, abr/2026); US$ 3,5 bi (Sacra, jun/2026); US$ 4,0 bi (Sacra, jul/2026) | FATO SECUNDÁRIO |
| Taxa média sobre o volume | ~1,5% no próprio aplicativo (Bank of America); ~1,2% no total (Sacra) | FATO SECUNDÁRIO |
| Margem operacional de uma bolsa pura | ~65% (referência do Bank of America, não número da Kalshi) | FATO SECUNDÁRIO, via Futu |

Leitura (INFERÊNCIA): a única linha com número é a taxa. O que a imprensa lista como "outras receitas" (juros, dados,
parcerias) nunca aparece com valor. Para o BP, a frase honesta é: "os líderes têm outras linhas, mas a taxa é a única
com peso comprovado".

### 2.2 Polymarket

FATO SECUNDÁRIO (DefiLlama, "Income Statement", lido em 4/out/2026; 3º trimestre ainda parcial). Em milhões de dólares:

| Linha | 1º tri 2026 | 2º tri 2026 | 3º tri 2026 (parcial) |
|---|---|---|---|
| Receita bruta do protocolo | 21,53 | 150,07 | 232,24 |
| Dentro dela, taxa de quem toma liquidez | 21,53 (100%) | 150,07 (100%) | 232,24 (100%) |
| Custo da receita (dinheiro devolvido a usuários) | 8,03 | 36,65 | 55,22 |
| Recompensa de liquidez | 3,13 | 9,48 | 10,12 |
| Reembolso a quem fornece liquidez | 3,91 | 20,79 | 19,23 |
| Reembolso a quem toma liquidez | 0 | 2,73 | 23,07 |
| Recompensa de indicação | 0,03 | 2,60 | 1,66 |
| Recompensa por manter posição | 0,96 | 1,06 | 1,12 |
| Devolvido como % da receita bruta (INFERÊNCIA) | 37,3% | 24,4% | 23,8% |

Até o fim de 2025 a Polymarket não cobrava taxa: a receita era zero e as recompensas eram subsídio puro.

Outras leituras, que não batem entre si:

- FATO SECUNDÁRIO (TechFlow, citando a Surf AI): no 1º semestre de 2026 o mercado internacional gerou cerca de
  US$ 184 mi em taxa bruta; cripto US$ 96,3 mi e esportes US$ 83,5 mi, juntos 98%. Geopolítica tem taxa zero de
  propósito. Em junho, a taxa bruta foi de cerca de US$ 30 mi e a receita retida, de cerca de US$ 17 mi.
- FATO SECUNDÁRIO (PolyScalping, 9/jul/2026): US$ 131,42 mi em taxas observáveis on-chain de janeiro a 8 de julho;
  US$ 72,63 mi (55%) voltaram a usuários. A taxa mediana paga por carteira foi de US$ 0,99; as 100 maiores carteiras
  pagaram 24% de tudo.
- A mesma página do DefiLlama mostra "taxas em 30 dias US$ 84,63 mi" e "receita em 30 dias US$ 14,36 mi", o que não
  fecha com a tabela trimestral. A nota de método da página diz que não há detalhe de receita para a Polymarket US.
  Não use o número de 30 dias.
- Dados (ICE), perpétuos, mídia: nenhum valor encontrado. A receita medida on-chain é 100% taxa.

Leitura (INFERÊNCIA): três rastreadores dão US$ 131 mi, US$ 172 mi (soma dos dois trimestres do DefiLlama) e
US$ 184 mi para o mesmo semestre. A ordem de grandeza é firme; o número exato não. O que serve ao Baked: (a) a taxa é
tudo; (b) mesmo o líder devolve cerca de um quarto da taxa a usuários; (c) a receita é muito concentrada em poucas
carteiras e em duas categorias (cripto e esportes).

---

## 3. Faixas de patrocínio: os preços praticados e o que cada faixa deveria entregar

### 3.1 Preços de produtos comparáveis

| Produto | O que entrega | Preço | Fonte, data e força |
|---|---|---|---|
| DexScreener, Token Advertising | Banner com número fixo de impressões | "a partir de US$ 299" | FATO, marketplace.dexscreener.com |
| DexScreener, Enhanced Token Info | Perfil do token com logo, redes e selo, permanente | US$ 299, exibido como desconto de US$ 499 | FATO SECUNDÁRIO, DXT Tools, 23/ago/2026 |
| DexScreener, Trending Bar | Lugar na barra de tendências da rede, revezando com até 5 anunciantes, de 24 h a 1 semana | "a partir de US$ 2.000" | idem |
| DexScreener, acordo direto | Campanha sob medida | Orçamento mínimo de US$ 100.000, com KYC | idem |
| DexScreener, Boosts | Multiplicador temporário no ranking, 12 a 24 h | De cerca de US$ 100 (10x) a milhares (500x); tabela exata não confirmada | idem; ver `patrocinio-e-destaque-pago.md` |
| DEXTools, Hot Pairs | Posição na lista de pares em alta, 24 h | US$ 1.500 a 2.000 (tabela de 2024) | FATO SECUNDÁRIO antigo, já registrado |
| DEXTools, Nitro e tendências | Impulso de 24 h | de US$ 350; tendências de US$ 600 ou US$ 2.150 (a página se contradiz) | Fonte fraca: agência MediaHype, 2026 |
| CoinMarketCap, banner | Banner por dia | a partir de US$ 1.150 por dia | Fonte fraca: agência MediaHype |
| CoinMarketCap, tendências | 24 h na seção de tendências | a partir de US$ 2.000 | Fonte fraca: agência MediaHype |
| CoinGecko, anúncio | Banner e bloco patrocinado | a partir de US$ 1.350 por dia | Fonte fraca: agência MediaHype |
| CoinGecko, custo por mil impressões | Campanha real de US$ 328: 40.960 impressões, 52 cliques | US$ 8 por mil impressões, fixo | FATO SECUNDÁRIO, Trilokana, mai/2025 |
| CoinMarketCap, custo por mil impressões | Campanha real de US$ 999,88: 172.398 impressões, 33 cliques | ~US$ 5,80 por mil impressões | idem |
| Carteira Phantom, tendências | 24 h na seção de descoberta | a partir de US$ 550 | Fonte fraca: agência MediaHype |
| Canais de tendência no Telegram | 24 h | a partir de US$ 150 | Fonte fraca: agência MediaHype |
| Myriad, competição da Copa | Prêmio em dinheiro para os melhores apostadores | US$ 100.000 (20, 10 e 5 mil aos três primeiros) | FATO SECUNDÁRIO, Gate News, 28/mai/2026 |
| predict.fun, "Predict Cup" | Competição de 39 dias | US$ 2 milhões | FATO SECUNDÁRIO, Odaily, 16/jun/2026 |
| Metaculus, torneio financiado | Prêmio do torneio com o nome do financiador | US$ 15 a 20 mil | FATO SECUNDÁRIO, já registrado |
| Polymarket, recompensa por mercado | Pagamento diário a quem dá liquidez | Mediana de US$ 3 por dia; 882 mercados com US$ 50 ou mais; maior: US$ 2.502 por dia | FATO SECUNDÁRIO, Vultax, 13/set/2026 |

A página oficial de anúncios do CoinGecko (FATO) lista os formatos (banner, busca patrocinada, artigo patrocinado) e
fala em "mais de 2 milhões de usuários ativos por mês", sem preço.

### 3.2 As três faixas fazem sentido?

Leitura (INFERÊNCIA), em três pontos.

1. **O valor está na faixa do mercado.** US$ 500 é o preço de entrada de um destaque (US$ 299 a 550). US$ 1.500 é um
   dia de banner ou de lista em alta num site grande (US$ 1.150 a 2.000). US$ 5.000 é uma semana de barra de
   tendências ou alguns dias de banner. Quem lança token está acostumado a pagar esses valores.
2. **Mas esses sites vendem audiência que o Baked ainda não tem.** A US$ 8 por mil impressões (CoinGecko), a parte da
   banca numa faixa de US$ 500 teria de entregar de 18.750 impressões (se a banca fica com 30%) a 43.750 (se fica com
   70%). Na faixa de US$ 5.000, de 187.500 a 437.500. Um site novo não entrega isso por pergunta.
3. **Logo, o que sustenta o preço no começo é o que vai para o pote.** Um prêmio visível ("pote com US$ 1.050 a mais
   de X") é algo que nenhum site de anúncio oferece. Isso pesa a favor de mandar a maior parte ao pote (seção 4).

Sinal de alerta, com fonte: o maior programa de "patrocínio de mercado" que existe, o da Polymarket, tem mediana de
US$ 3 por dia por mercado. Poucos mercados recebem valores de três dígitos por dia. Um patrocinador externo pagando
US$ 5.000 por uma pergunta é raro mesmo no líder.

### 3.3 Proposta de três faixas com contrapartidas (INFERÊNCIA)

Marcada como INFERÊNCIA do começo ao fim. As contrapartidas saem da lista que o fundador já aceitou (selo, destaque,
posição fixa, pote mínimo garantido, texto na pergunta, publicação no X). Os prazos e quantidades são proposta minha.

| | Faixa 1: US$ 500 | Faixa 2: US$ 1.500 | Faixa 3: US$ 5.000 |
|---|---|---|---|
| Para quem | Projeto pequeno, comunidade, um holder | Projeto com verba de divulgação | Protocolo, corretora, fundo |
| Pergunta | Entra numa pergunta já aberta | Entra em pergunta aberta ou pede uma, sujeita a aprovação | Pede pergunta sob medida, sujeita a aprovação |
| Selo "Patrocinado por X" (ou "Anônimo") | Sim | Sim | Sim |
| Texto na pergunta | Nome e link | Nome, link e uma frase | Nome, link, frase e imagem |
| Destaque na página inicial | Não | 72 horas na faixa de destaque | Posição fixa no topo durante toda a janela de apostas |
| Publicação no X, rotulada como parceria paga | 1 publicação | 2 publicações (abertura e resultado) | 4 publicações e fio de resultado |
| "Pote mínimo garantido" exibido | O valor que foi ao pote | O valor que foi ao pote | O valor que foi ao pote |
| Relatório ao fim | Não | Volume e número de carteiras | Volume, carteiras, impressões e cliques |
| Exclusividade | Não | Não | Única marca na pergunta |
| Comparável de mercado | Banner de entrada no DexScreener (US$ 299) | Um dia de lista em alta (US$ 1.500 a 2.000) | Barra de tendências por até uma semana (a partir de US$ 2.000) |

Três regras que valem para as três faixas (INFERÊNCIA):

- O valor "garantido" que aparece para o apostador é só a parte que entrou no pote, nunca o valor cheio da faixa.
- Patrocinador que escolhe "aposta de patrocinador" (num lado) não deveria poder pedir pergunta cujo resultado ele
  controla. As regras de Polymarket e Kalshi sobre influência estão em `patrocinio-e-destaque-pago.md`. Para advogado.
- Publicação paga no X precisa do rótulo de parceria paga (regra do X, já registrada). Para advogado.

---

## 4. A conta do "70/30"

O fundador disse: "70/30 dessa grana vai pra banca e a outra parte pra liquidez como neutra ou aposta de
patrocinador". Não disse qual parte é de quem. Os dois cenários:

- **Cenário A:** 70% para a banca, 30% para o pote.
- **Cenário B:** 30% para a banca, 70% para o pote.

### 4.1 Premissas do exemplo

Pote de exemplo: US$ 10.000 em apostas, US$ 6.000 no SIM e US$ 4.000 no NÃO. Taxa de 3% sobre o pote inteiro,
inclusive sobre o dinheiro do patrocinador (premissa minha; a decisão "3% do pote" não diz se o prêmio do
patrocinador paga taxa, ver perguntas em aberto).

Sem patrocinador: a banca fica com US$ 300; sobram US$ 9.700. Se o SIM vence, cada US$ 1 no SIM recebe US$ 1,617. Se
o NÃO vence, cada US$ 1 no NÃO recebe US$ 2,425. Somando todos os apostadores, eles põem US$ 10.000 e levam
US$ 9.700: perdem 3% em conjunto.

### 4.2 Quanto entra no pote e quanto fica com a banca

| Faixa | Cenário | Vai ao pote | Fica com a banca | Taxa de 3% sobre o pote maior | Banca no total |
|---|---|---|---|---|---|
| US$ 500 | A (70 banca) | US$ 150 | US$ 350 | US$ 304,50 | US$ 654,50 |
| US$ 500 | B (70 pote) | US$ 350 | US$ 150 | US$ 310,50 | US$ 460,50 |
| US$ 1.500 | A | US$ 450 | US$ 1.050 | US$ 313,50 | US$ 1.363,50 |
| US$ 1.500 | B | US$ 1.050 | US$ 450 | US$ 331,50 | US$ 781,50 |
| US$ 5.000 | A | US$ 1.500 | US$ 3.500 | US$ 345,00 | US$ 3.845,00 |
| US$ 5.000 | B | US$ 3.500 | US$ 1.500 | US$ 405,00 | US$ 1.905,00 |

### 4.3 Prêmio neutro: o que muda para o apostador

Prêmio neutro é dinheiro somado ao pote sem escolher lado. Quem acertar divide tudo.

| Faixa e cenário | Prêmio no pote | SIM vence: cada US$ 1 recebe | NÃO vence: cada US$ 1 recebe | Saldo de todos os apostadores juntos |
|---|---|---|---|---|
| Sem patrocinador | 0 | 1,617 | 2,425 | perdem US$ 300 (−3,0%) |
| US$ 500, A | 150 | 1,641 | 2,461 | perdem US$ 154,50 (−1,5%) |
| US$ 500, B | 350 | 1,673 | 2,510 | ganham US$ 39,50 (+0,4%) |
| US$ 1.500, A | 450 | 1,689 | 2,534 | ganham US$ 136,50 (+1,4%) |
| US$ 1.500, B | 1.050 | 1,786 | 2,680 | ganham US$ 718,50 (+7,2%) |
| US$ 5.000, A | 1.500 | 1,859 | 2,789 | ganham US$ 1.155 (+11,6%) |
| US$ 5.000, B | 3.500 | 2,183 | 3,274 | ganham US$ 3.095 (+31,0%) |

A regra por trás da tabela: o prêmio neutro cobre a taxa de 3% quando passa de **3,09% do total apostado** (conta:
0,97 × (apostas + prêmio) = apostas). Abaixo disso o pote continua sendo um jogo em que os apostadores, somados,
perdem. Acima disso vira um jogo em que, somados, ganham. Num pote de US$ 10.000 a linha é US$ 309.

O tamanho do pote decide tudo. Retorno conjunto dos apostadores (sem prêmio é sempre −3%):

| Apostas no pote | Prêmio 150 | 350 | 450 | 1.050 | 1.500 | 3.500 |
|---|---|---|---|---|---|---|
| US$ 2.000 | +4,3% | +14,0% | +18,8% | +47,9% | +69,8% | +166,8% |
| US$ 10.000 | −1,5% | +0,4% | +1,4% | +7,2% | +11,6% | +31,0% |
| US$ 50.000 | −2,7% | −2,3% | −2,1% | −1,0% | −0,1% | +3,8% |

Leitura: num pote pequeno qualquer faixa é enorme; num pote de US$ 50.000 só a faixa de US$ 5.000 no cenário B aparece.

### 4.4 Aposta de patrocinador: o que muda

Aqui o dinheiro entra num lado, como aposta. Exemplo com o patrocinador no SIM:

| Faixa e cenário | Aposta no SIM | SIM vence: cada US$ 1 recebe | Patrocinador recebe de volta | NÃO vence: cada US$ 1 recebe |
|---|---|---|---|---|
| Sem patrocinador | 0 | 1,617 | n/a | 2,425 |
| US$ 500, A | 150 | 1,601 | US$ 240 | 2,461 |
| US$ 500, B | 350 | 1,581 | US$ 553 | 2,510 |
| US$ 1.500, A | 450 | 1,572 | US$ 707 | 2,534 |
| US$ 1.500, B | 1.050 | 1,520 | US$ 1.596 | 2,680 |
| US$ 5.000, A | 1.500 | 1,487 | US$ 2.231 | 2,789 |
| US$ 5.000, B | 3.500 | 1,378 | US$ 4.824 | 3,274 |

Três consequências:

1. Quem apostou **no mesmo lado** do patrocinador passa a ganhar **menos** (de 1,617 para 1,378 na faixa maior do
   cenário B). O patrocinador divide o prêmio com eles.
2. Quem apostou **no lado contrário** passa a ganhar mais, igual ao prêmio neutro.
3. Se o patrocinador acerta, recupera quase tudo: na faixa de US$ 5.000 do cenário B ele paga US$ 5.000 e recebe
   US$ 4.824. O "patrocínio" custou US$ 176. Isso é aposta com selo, não prêmio. Vale deixar claro na tela.

### 4.5 O prêmio neutro atrai dinheiro "de arbitragem" (derivação minha)

Se o prêmio passa de 3,09% do pote, alguém pode apostar nos dois lados, na mesma proporção do pote, e ganhar sem
risco de resultado: recebe a sua fatia do pote inteiro, inclusive do prêmio, qualquer que seja o lado vencedor. Esse
dinheiro entra até o prêmio voltar a valer 3,09% do pote. O teto é 32,3 vezes o prêmio:

| Prêmio no pote | Apostas que ele sustenta até zerar a vantagem | Taxa de 3% gerada nesse ponto |
|---|---|---|
| US$ 150 | US$ 4.850 | US$ 150 |
| US$ 350 | US$ 11.317 | US$ 350 |
| US$ 1.050 | US$ 33.950 | US$ 1.050 |
| US$ 3.500 | US$ 113.167 | US$ 3.500 |

Duas leituras, as duas INFERÊNCIA:

- **Boa para a banca:** cada US$ 1 de prêmio que um patrocinador põe no pote pode voltar como até US$ 1 de taxa, se
  esse dinheiro aparecer. No cenário B a banca ganha 30% direto e até mais 70% em taxa. No cenário A ganha 70% direto
  e só até 30% em taxa. No limite os dois cenários rendem parecido para a banca, mas o B mostra potes maiores.
- **Ruim para a medição:** esse volume não é de apostador de verdade. Ele some no pote seguinte que não tiver
  prêmio. É o mesmo fenômeno das campanhas de pontos (seção 5.3). A regra de saída antecipada com penalidade e a
  regra de fechamento mudam a conta; quem estuda isso é o agente 1H.

### 4.6 Qual cenário os precedentes sustentam

| Precedente | Para onde vai o dinheiro de quem "patrocina" | Aponta para |
|---|---|---|
| Polymarket, Sponsor Market Rewards (oficial) | 100% para quem dá liquidez no mercado; o patrocinador não recebe nada | Tudo ao pote |
| Pôquer, prêmio garantido com "overlay" | 100% do complemento vai ao prêmio do torneio | Tudo ao pote |
| Metaculus, torneio financiado | O valor anunciado é o prêmio | Tudo ao pote |
| DexScreener, DEXTools, CoinGecko, CoinMarketCap | 100% para o site; o usuário não recebe nada | Tudo à banca |

Veredito (INFERÊNCIA): os precedentes se dividem pelo que está sendo vendido. Quando se vende **prêmio**, quase tudo
vai ao pote. Quando se vende **vitrine**, tudo vai ao site. Não achei precedente de divisão 70/30 em nenhum sentido.

- O **cenário B (30% banca, 70% pote)** é o que os precedentes de dinheiro somado ao pote sustentam. É também o único
  em que a faixa de US$ 500 cobre a taxa de um pote de US$ 10.000 (US$ 350 contra a linha de US$ 309).
- O **cenário A (70% banca)** só se justifica se o produto for anúncio. Nesse caso o preço tem de ser defendido por
  impressões entregues (seção 3.2), e o Baked não as tem no lançamento.
- Alternativa que não muda a decisão, só a organiza: vender duas linhas separadas, "destaque" (100% da banca, com
  preço de anúncio) e "prêmio" (100% ao pote, pagando os 3% como qualquer dinheiro do pote). O 70/30 vira o pacote
  padrão das duas. Fica mais fácil explicar ao patrocinador e ao apostador.

---

## 5. Fundo de prêmios: o que é, para que serve e como saber se está se pagando

### 5.1 Em linguagem simples

Fundo de prêmios é uma reserva da casa para **dar dinheiro a quem aposta**, além do que os perdedores pagam. Existe
por um motivo: pote vazio não atrai ninguém. O primeiro apostador de um pote não sabe se vai ter alguém do outro
lado; se ninguém entrar, ele recebe o dinheiro de volta menos a taxa. Um prêmio já colocado no pote dá a ele um
motivo para ser o primeiro.

No Baked, 25% da taxa vai para o fundo. Como a taxa é 3% do pote, o fundo recebe **0,75% do volume apostado**.
Exemplo: com US$ 1 milhão apostado no mês, a taxa é US$ 30.000 e o fundo recebe US$ 7.500.

### 5.2 Como as plataformas usam prêmio adicionado

| Uso | Como funciona | Exemplo com número | Fonte |
|---|---|---|---|
| Prêmio garantido e "overlay" | A casa promete um prêmio mínimo e cobre a diferença se a arrecadação não chegar | Garantido de US$ 10.000; 350 jogadores a US$ 20 arrecadam US$ 7.000; a casa põe US$ 3.000 | FATO SECUNDÁRIO, PokerNews, já registrado |
| Recompensa de liquidez | Pagamento diário a quem mantém ordens perto do preço | Polymarket: US$ 149.859 por dia em 17.866 mercados; mediana de US$ 3 por mercado | FATO SECUNDÁRIO, Vultax, 13/set/2026 |
| Idem, por programa | Um pote de recompensa preso a um mercado por prazo fixo | Kalshi: US$ 2,95 mi pagos em 30 dias; mediana de US$ 20 por programa | idem |
| Reforço pontual | Verba extra quando a plataforma muda regra ou há um grande evento | Polymarket: US$ 1 mi em agosto para mercados cripto de 5 e 15 minutos e 4 horas; US$ 1 mi na Copa | FATO (docs da Polymarket); FATO SECUNDÁRIO (Odaily) |
| Torneio com prêmio | Classificação dos melhores apostadores num período | Myriad: US$ 100.000 na Copa; predict.fun: US$ 2 milhões em 39 dias | FATO SECUNDÁRIO, Gate News e Odaily |
| Campanha de pontos | Pontos por volume, trocados depois por token | Opinion, Myriad e Limitless em 2026 | FATO SECUNDÁRIO, Predictefy |
| Indicação | Parte da taxa vai a quem trouxe o apostador | Polymarket: 10% e 5% por 30 dias | FATO (docs) |
| Bônus e promoções de casa de aposta | Aposta grátis, reforço de cotação, devolução | Promoção custa de 25% a 35% da receita bruta nos EUA maduros | Fonte fraca: guia da agência Basher, sem data |

### 5.3 Quanto gastam e que retorno relatam

- FATO SECUNDÁRIO (PolyScalping, on-chain): a Polymarket pagou em recompensa de liquidez US$ 6,23 mi em 2024,
  US$ 5,41 mi em 2025 e US$ 22,90 mi de janeiro a 7 de setembro de 2026, para 184.022 carteiras. Somando os cinco
  tipos de recompensa, US$ 112,48 mi desde o início.
- FATO SECUNDÁRIO (PolyScalping, 9/jul/2026): em abril de 2026, com três meses de cobrança, a taxa acumulada já tinha
  igualado tudo o que a Polymarket pagou em recompensas em cerca de dois anos de subsídio.
- INFERÊNCIA sobre a tabela da seção 2.2: a recompensa de liquidez sozinha caiu de 14,5% para 4,4% da receita bruta
  entre o 1º e o 3º trimestre de 2026. Tudo o que volta ao usuário ficou perto de 24%.
- INFERÊNCIA: US$ 2,95 mi por mês na Kalshi, contra receita anualizada de US$ 4 bi (cerca de US$ 333 mi por mês),
  é menos de 1% da receita.
- FATO SECUNDÁRIO (Odaily, 16/jun/2026): a predict.fun, com prêmio de US$ 2 milhões e entrada pela carteira da
  Binance, chegou a 20 mil usuários ativos por dia e 180 mil transações por dia em três dias de Copa.
- FATO SECUNDÁRIO (Predictefy, ago/2026): do 1º para o 2º trimestre de 2026 o volume da Opinion caiu 80,7% e o da
  Myriad 93,8%. As duas rodavam campanhas de pontos por volume. O volume da Opinion despencou na véspera do evento do
  token (de mais de US$ 94 mi por dia para US$ 38,3 mi entre 1 e 2 de março). A frase do relatório: "volume sustentado
  por pontos tende a ir embora quando os pontos deixam de importar". A queda da Myriad aconteceu no mesmo trimestre da
  competição de US$ 100.000; o relatório diz não ter achado explicação para ela.
- Retorno medido (apostador novo por dólar de prêmio, retenção depois do prêmio): **não encontrado** em nenhuma
  plataforma. Elas divulgam o que gastam e o volume, não o retorno.
- FATO SECUNDÁRIO, fonte fraca (blog WagerLex, mai/2026): nas casas de aposta dos EUA o valor real de um bônus caiu
  porque os clientes aprenderam a extrair de 50% a 70% do valor de face; as casas encurtaram as promoções desde 2023.

### 5.4 Para que serve no Baked (INFERÊNCIA)

Quatro usos, do mais ao menos defensável:

1. **Abrir o pote.** Um prêmio pequeno em cada pergunta nova, para o primeiro apostador não entrar num pote vazio.
2. **Garantir pote mínimo** nas perguntas que a equipe quer que deem certo (as da página inicial).
3. **Torneio por período**, com classificação por acerto e não por volume, para não premiar quem só gira dinheiro.
4. **Indicação**, com trava contra autoindicação.

O que evitar: prêmio proporcional ao volume apostado (é o que atraiu dinheiro que foi embora na Opinion e na Myriad) e
prêmio neutro grande demais em pote pequeno (atrai quem aposta nos dois lados só para colher o prêmio, seção 4.5).

### 5.5 Como medir se está se pagando

Regra de bolso (INFERÊNCIA, conta direta): cada US$ 1 de prêmio só volta para a casa se trouxer **US$ 33 de aposta que
não existiria sem ele** (1 ÷ 3%). Se a conta considerar só a metade da taxa que fica de fato na empresa (operação e
tesouraria; a outra metade vai para recompra e de volta ao fundo), o número é **US$ 67 por US$ 1**.

Exemplo: prêmio de US$ 300 numa pergunta. Se perguntas parecidas sem prêmio fazem US$ 4.000 e esta fez US$ 15.000, o
adicional é US$ 11.000. A taxa adicional é US$ 330: pagou-se por pouco. Se fez US$ 8.000, o adicional é US$ 4.000, a
taxa adicional é US$ 120 e o fundo perdeu US$ 180 nessa pergunta.

Quatro medidas para acompanhar, todas tiráveis dos eventos on-chain do programa:

| Medida | Como calcular | O que indica |
|---|---|---|
| Volume adicional por dólar de prêmio | (volume da pergunta com prêmio − volume médio de perguntas parecidas sem prêmio) ÷ prêmio | Abaixo de 33, o prêmio não se pagou na própria pergunta |
| Custo por carteira nova | prêmio ÷ carteiras que apostaram pela primeira vez | Comparar com a taxa que essas carteiras geram em 30 e 90 dias |
| Retorno das carteiras novas | parcela delas que aposta de novo em pergunta **sem** prêmio em 30 dias | Baixo = caçador de prêmio |
| Parcela do prêmio colhida nos dois lados | prêmio recebido por carteiras que apostaram em SIM e NÃO na mesma pergunta ÷ prêmio total | Alto = dinheiro de arbitragem, não público |

Como a casa compara perguntas com e sem prêmio, convém sortear quais recebem prêmio no começo. Sem grupo de comparação
não dá para saber o que o prêmio causou.

---

## 6. Tesouraria em Bitcoin

### 6.1 Quem destina parte da receita ou do lucro a comprar Bitcoin

| Quem | O que anunciou | Percentual e base | Como guarda | O que aconteceu | Fonte |
|---|---|---|---|---|---|
| Tether (emissora do USDT) | Compras regulares de bitcoin com o lucro | Até 15% do lucro líquido | Custódia própria ("self-custody") | Tinha US$ 1,5 bi em BTC em mar/2023 (cerca de 2% das reservas). Situação em 2026: não reaberta | FATO SECUNDÁRIO, The Block, 17/mai/2023 |
| Block (Cash App, Square) | Programa de compra mensal a preço médio | 10% do lucro bruto dos produtos de bitcoin, todo mês | Não lido | Primeira compra, abr/2024: US$ 4,4 mi. Compra por ordens fatiadas numa janela de duas horas. Situação em 2026: não reaberta | FATO, comunicado e "Bitcoin Blueprint" da Block, mai/2024 |
| Méliuz (Brasil, B3) | Bitcoin na política de aplicações do caixa | Até 10% do caixa; comitê estratégico de bitcoin; estudo para tornar o BTC o principal ativo | Não lido | Comprou 45,72 BTC por cerca de US$ 4,1 mi, preço médio de US$ 90.926 | FATO, nota da companhia aos acionistas; FATO SECUNDÁRIO, CoinDesk, 6/mar/2025 |
| Strategy (ex-MicroStrategy) | Bitcoin como reserva principal, comprado com dívida e ações | Sem percentual fixo ("não temos política de percentual") | Não lido | 847.363 BTC a preço médio de US$ 75.651 (22/jun/2026); perda não realizada de US$ 14,46 bi no 1º tri de 2026; já vendeu cerca de US$ 218 mi em BTC em 2026 e autorizou vender até US$ 1,25 bi | FATO (formulário na SEC, 2024); FATO SECUNDÁRIO, Yahoo Finance e Reuters, jun-jul/2026 |
| Metaplanet (Japão) | Mesma estratégia | Sem percentual fixo | Não lido | 43.000 BTC que custaram ¥ 659 bi (US$ 4,07 bi) valiam ¥ 409 bi (US$ 2,5 bi) em 30/jun/2026: perda no papel de cerca de US$ 1,5 bi | FATO SECUNDÁRIO, Decrypt, 2/jul/2026 |
| World Liberty Financial | Proposta de governança: trocar a recompra do próprio token por compra de BTC e ETH com as taxas da liquidez do protocolo | 100% dessas taxas, metade BTC e metade ETH | Tesouraria on-chain | Proposta de 14/out/2025; resultado do voto não confirmado | FATO, fórum de governança da WLFI |
| MonkeDAO (Solana) | "Reserva estratégica" em bitcoin | Compra única de 1 zBTC | zBTC na tesouraria da DAO | Primeiro caso achado de DAO em Solana com reserva em BTC embrulhado | FATO SECUNDÁRIO, crypto.news, 28/mar/2025 |

Protocolo de aposta ou de previsão que mande percentual fixo da taxa para Bitcoin: **não encontrado**.

O que aconteceu com o preço (FATO SECUNDÁRIO): o bitcoin caiu mais de 20% no 2º trimestre de 2026 e fechou junho
perto de US$ 58.800 (Decrypt); em 12/ago/2026 estava perto de US$ 63.800 (CoinGape). No fim de junho ficou abaixo de
US$ 60.000, "menor nível desde 2024" (Yahoo Finance). O prêmio das empresas de tesouraria sobre o próprio bitcoin
sumiu: a Strategy chegou a valer 0,99 vez o bitcoin que tem (Decrypt).

INFERÊNCIA (aritmética): a primeira compra da Méliuz, a US$ 90.926, estaria cerca de 30% abaixo do custo a
US$ 63.800. A Metaplanet está 38% abaixo do custo.

### 6.2 O que isso ensina a uma empresa pequena (INFERÊNCIA)

- Os três casos de **percentual fixo** (Tether, Block, Méliuz) têm duas coisas em comum: a base é lucro ou caixa
  excedente, não receita bruta, e a compra é regular, não de uma vez. O Baked propõe 25% da **taxa bruta**, antes de
  pagar custos. É mais agressivo que os três.
- Os casos que deram problema em 2026 (Strategy, Metaplanet) compraram com dívida e com emissão de ações. O Baked não
  faria isso; o risco dele é outro: precisar do dinheiro quando o bitcoin está em baixa.
- Conta: 25% de 3% = 0,75% do volume. Com US$ 1 milhão apostado por mês, US$ 7.500 por mês vão para bitcoin,
  US$ 90.000 por ano. Uma queda de 38%, como a da Metaplanet, tira US$ 34.200 desses US$ 90.000 no papel.
- Portanto a tesouraria em bitcoin não pode ser a reserva que paga as contas num mês ruim. A reserva de operação
  precisa ficar em USDC, e só 25% da taxa vai para a operação (ver "O que isto muda no plano").
- A hipótese de que o volume de aposta do público web3 cai junto com o bitcoin é plausível, mas não a verifiquei. No
  2º trimestre de 2026 o bitcoin caiu e o volume do setor subiu, por causa da Copa.

### 6.3 Como um protocolo em Solana seguraria Bitcoin

O bitcoin de verdade só existe na rede Bitcoin. Em Solana o que circula é um **token que representa** bitcoin: alguém
guarda o bitcoin verdadeiro e emite o token na proporção de um para um. A segurança do token é a de quem guarda.

**Caminho 1: bitcoin embrulhado dentro de Solana**

| Token | Quem guarda o bitcoin verdadeiro | Como entra e sai | Tamanho em Solana | Riscos próprios | Fonte |
|---|---|---|---|---|---|
| cbBTC | A Coinbase, sozinha | Envio entre a conta na Coinbase e a carteira Solana; exige conta na Coinbase (com KYC) | 3.582 BTC (set/2025); 58,4% do volume de BTC nas DEX de Solana | A Coinbase pode congelar qualquer endereço; pelos termos, o BTC depositado passa a ser ativo da Coinbase; prova de reservas só desde fev/2025 | FATO SECUNDÁRIO: CoinDesk (7/nov/2024), SolanaFloor/Dune (25/set/2025), Spark (9/jul/2026) |
| WBTC | BitGo e BiT Global, em assinatura 2 de 3 | Por comerciantes credenciados, com KYC | 3.591 BTC (set/2025); 54,7 mil carteiras | Concentração de chaves na BiT Global; se a emissão em Solana é nativa ou por ponte: não confirmado | idem |
| zBTC (Zeus Network) | Rede de nós: um operador propõe e "guardiões" assinam; reservas em endereços Taproot ("quente" e "fria") | Pelo aplicativo APOLLO, sem pedir cadastro | 256 BTC (jun/2025); 7,9 mil carteiras (set/2025) | Projeto novo; número de guardiões e quórum não encontrados; risco de contrato e de ponte; pouca liquidez | FATO (docs e blog da Zeus); FATO SECUNDÁRIO (SolanaFloor) |
| tBTC (Threshold) | Rede de signatários com assinatura por limiar (51 de 100, segundo uma leitura) | Sem cadastro; leva de uma a duas horas | 63,7 BTC (jun/2025) | Liquidez mínima em Solana; em mai/2026 uma ponte de terceiro (Verus) foi explorada e perdeu 103,6 tBTC, sem falha do tBTC em si | FATO SECUNDÁRIO, Spark e SolanaFloor |
| LBTC (Lombard) | Consórcio de instituições | n/d | 793 BTC (set/2025) | Rende juro: soma o risco da estratégia que gera o juro | FATO SECUNDÁRIO, SolanaFloor e Spark |

Os números de oferta em Solana têm de 12 a 16 meses. Confira antes de decidir.

Dois avisos históricos (FATO SECUNDÁRIO): o soBTC, antigo padrão de bitcoin em Solana, era controlado pela FTX e
"morreu com ela" em novembro de 2022 (CoinDesk). Em fevereiro de 2022 a ponte Wormhole perdeu 120.000 wETH, cerca de
US$ 320 mi, por um erro de contrato em Solana (Spark).

Vantagens do caminho 1: fica on-chain, visível para qualquer um, num cofre multiassinatura ou numa conta do programa;
a troca de USDC por cbBTC se faz numa DEX, por regra, sem banco. Desvantagens: risco do emissor (congelamento,
falência), risco de contrato e de ponte, e o token não é bitcoin: se o emissor falhar, o saldo vira crédito contra
uma empresa.

**Caminho 2: bitcoin nativo fora de Solana**

A empresa converte o USDC em bitcoin numa corretora ou mesa e o guarda na rede Bitcoin, de uma de duas formas:

- **Custódia própria com multiassinatura** (por exemplo, 2 de 3 chaves em dispositivos físicos e lugares
  diferentes). É o que a Tether declara fazer. Risco: perda, roubo ou coação de quem tem as chaves; a empresa
  precisa de processo escrito de quem assina e de como recuperar.
- **Custodiante contratado.** Risco: contraparte, custo e exigência de cadastro da empresa.

Vantagens: sem ponte, sem emissor de token. Desvantagens: sai do "100% on-chain em Solana"; a conversão passa por uma
corretora que vai pedir a identificação da empresa e a origem dos recursos, e a origem é a taxa de um protocolo de
aposta sem KYC (ponto para advogado, sem opinião aqui); a transparência depende de publicar o endereço.

**Caminho 3: os dois, em etapas (INFERÊNCIA, proposta)**

1. A parcela de 25% se acumula em USDC numa conta do programa, visível on-chain.
2. Uma vez por mês, em data fixa, troca-se por cbBTC numa DEX e guarda-se num cofre multiassinatura público. É o
   token mais líquido em Solana, o que reduz o custo da troca.
3. Acima de um teto (por exemplo, o equivalente a 1 BTC), resgata-se para bitcoin nativo em multiassinatura fria, com
   o endereço publicado.
4. Regra escrita de quando se pode vender (nunca para cobrir operação sem voto dos sócios, por exemplo).

O que escolher depende de três perguntas que não são técnicas: a empresa terá pessoa jurídica com conta em corretora?
Aceita que a Coinbase possa congelar a reserva? Quem assina o cofre? Estão nas perguntas em aberto.

---

## 7. Recompra e queima custeada por taxa: só o que é novo

`modelos-de-token.md` já cobre PUMP, HYPE, JUP (o anúncio de 50%), RAY, CAKE, GNS, GMX, dYdX, Rollbit, Shuffle,
Limitless e Azuro. O que falta lá:

- **Helium parou a recompra.** FATO SECUNDÁRIO (SolanaFloor e Cryptonews, 5/jan/2026): em 2 de janeiro de 2026 o
  fundador Amir Haleem anunciou o fim da recompra de HNT com a receita da Helium Mobile, que foi de US$ 3,4 mi só em
  outubro de 2025. Motivo declarado: o mercado não reagia; o dinheiro ia "para um buraco". A verba foi para
  crescimento de assinantes e de rede. A queima ligada ao uso da rede continua.
- **Jupiter questionou a própria recompra.** FATO SECUNDÁRIO (BeInCrypto, 4/jan/2026; Cryptonews, 5/jan/2026): gastou
  mais de US$ 70 mi em 2025, metade da receita de taxas, e o JUP estava perto de US$ 0,21, 89% abaixo do pico. A
  recompra cobriu cerca de 6% dos tokens desbloqueados; havia US$ 1,2 bi em desbloqueios pela frente e 53 milhões de
  JUP por mês até junho de 2026. O cofundador perguntou à comunidade se devia parar e usar o dinheiro em incentivo a
  usuários. Se parou de fato: não confirmado.
- **pump.fun e Raydium.** FATO SECUNDÁRIO (SolanaFloor, 5/jan/2026): o pump.fun gastou mais de US$ 230 mi em recompra
  em 2025 e o PUMP estava 72% abaixo do pico e 41% abaixo do preço da oferta inicial. A Raydium comprou mais de
  US$ 200 mi de RAY desde o início e manteve o programa; o argumento dela é que as recompras que falham têm problema
  de oferta (desbloqueios e emissão), não do mecanismo.
- **Troca de recompra por reserva.** FATO (fórum da WLFI, 14/out/2025): a proposta era justamente parar de recomprar e
  queimar o próprio token e passar a comprar BTC e ETH. O Baked propõe fazer as duas coisas ao mesmo tempo.
- **Ideias de desenho surgidas no debate.** FATO SECUNDÁRIO (agregador KuCoin, 4/jan/2026, fonte fraca): Anatoly
  Yakovenko, cofundador da Solana, sugeriu guardar o lucro como ativo a ser reclamado por quem travar o token por um
  ano, em vez de recomprar no mercado. Um sócio da Selini Capital sugeriu recompra condicionada ao preço: comprar
  mais quando o token está barato em relação ao lucro e menos quando está caro.

A regra que sai desses casos (INFERÊNCIA): recompra só reduz a oferta se for **maior que os desbloqueios e emissões do
mesmo período**. A Jupiter cobriu 6% e o preço caiu 89%.

Aplicação ao Baked (INFERÊNCIA, com premissas inventadas só para mostrar a conta): 25% de 3% = 0,75% do volume. Com
US$ 1 milhão por mês, a recompra é de US$ 7.500 por mês, US$ 90.000 por ano. Se o token do ICO privado valer
US$ 10 milhões no total e 20% dele for desbloqueado no ano (US$ 2 milhões), a recompra cobre 4,5% do desbloqueio. O
cronograma de desbloqueio do ICO pesa mais no preço do que a recompra. Isso é assunto do agente 1G.

---

## O que isto muda no plano (INFERÊNCIA)

1. **Receita do BP: duas linhas com número, o resto como opção futura.** Corte do pote e patrocínio. Dados, taxa de
   front-end, taxa de análise, fatia da penalidade e assinatura entram como "possíveis depois", sem valor projetado,
   porque nem os líderes divulgam quanto rendem.
2. **Resposta ao fundador.** "Sim, têm outras formas, mas a taxa é praticamente tudo: 100% da receita bruta da
   Polymarket medida on-chain e a única linha com número na Kalshi."
3. **O "70/30" precisa ser fechado antes do modelo financeiro.** Os precedentes sustentam 30% banca e 70% pote. Com
   70% para a banca, a faixa de US$ 500 põe US$ 150 no pote e não cobre a taxa de um pote de US$ 10.000.
4. **Falta decidir se o dinheiro do patrocinador paga os 3%.** Muda pouco o valor e muito a explicação.
5. **A "aposta de patrocinador" deve aparecer na tela como aposta.** Ela reduz o ganho de quem está do mesmo lado e o
   patrocinador pode recuperar quase tudo. Não é prêmio.
6. **As faixas valem pelo prêmio, não pela audiência, no lançamento.** A banca só defende a sua parte com impressões
   quando tiver tráfego para mostrar. Vale prometer relatório nas faixas 2 e 3.
7. **Fundo de prêmios com regra de medição desde o primeiro dia.** US$ 33 de aposta nova por US$ 1 de prêmio. Evitar
   prêmio proporcional a volume. Sortear quais perguntas recebem prêmio para ter comparação.
8. **Só 25% da taxa paga a operação.** Se o custo mensal for, por exemplo, US$ 20.000, a taxa precisa ser de
   US$ 80.000 e o volume, de US$ 2,67 milhões por mês. Se a taxa inteira pagasse custo, bastariam US$ 667 mil. A
   divisão em quatro multiplica por quatro o volume de equilíbrio. O fundador já disse que os 25% "não devem ser todo
   o custo"; o modelo financeiro (agente 2E) precisa mostrar de onde vem o resto.
9. **Metade da taxa vai para dois ativos voláteis** (bitcoin e o próprio token). A reserva de operação deve ficar em
   USDC e a regra de venda do bitcoin, escrita.
10. **Recompra e bitcoin são do mesmo tamanho** (0,75% do volume cada) e pequenos em volume baixo. O efeito no preço
    do token depende do cronograma de desbloqueio do ICO, não da recompra.
11. **Pontos para advogado, sem opinião aqui:** patrocinador que aposta na própria pergunta; publicação paga no X;
    contabilidade e tributação da tesouraria em bitcoin; conta da empresa em corretora com recursos vindos de aposta
    sem KYC; recompra como fator citado pela SEC (já em `modelos-de-token.md`).

## Perguntas em aberto

1. No "70/30", os 70% são da banca ou do pote? (Decisão do fundador.)
2. O dinheiro que o patrocinador põe no pote paga a taxa de 3%?
3. O patrocinador que faz "aposta de patrocinador" e perde: a parte da banca é devolvida em algum caso?
4. Uma taxa de análise não reembolsável para quem pede pergunta cabe na decisão "se for recusado devolve"?
5. Quanto a Polymarket recebe da ICE pelos dados, e quanto a Kalshi recebe de CNBC, CNN e Barchart. Não encontrado.
6. Quanto a Kalshi retém do juro sobre o caixa dos clientes. Não encontrado.
7. Que taxa a Polymarket cobra nos perpétuos, e quando a Kalshi passa a cobrar nos dela.
8. Programa de construtor da Kalshi e taxa de integração da DFlow: não pesquisados a fundo.
9. A SODAX paga comissão a quem integra o pagamento entre redes?
10. Tabelas oficiais de preço de CoinGecko, CoinMarketCap e DEXTools (só li preços de agência).
11. Tabela exata de Boosts do DexScreener (só aparece dentro do site, na página do token).
12. Algum mercado de previsão já vendeu patrocínio de pergunta a marca, com valor? Não achei nenhum.
13. Retorno medido de prêmios e torneios (apostador novo e retenção por dólar). Nenhuma plataforma publica.
14. A Jupiter parou mesmo a recompra? A proposta da WLFI foi aprovada? Não confirmados.
15. Situação em 2026 dos programas de bitcoin de Tether, Block e Méliuz. Não reaberta.
16. Oferta atual de cbBTC, WBTC, zBTC e tBTC em Solana (os números têm mais de um ano); quórum dos guardiões do zBTC;
    se o WBTC em Solana é emissão nativa.
17. A empresa terá pessoa jurídica com conta em corretora ou custodiante? Quem assina o cofre da tesouraria?
18. Divergência entre os três rastreadores da receita da Polymarket (US$ 131 mi, 172 mi e 184 mi no semestre).

## Fontes

Primárias (FATO)

- ICE, investimento na Polymarket, 7/out/2025:
  https://ir.theice.com/press/news-details/2025/ICE-Announces-Strategic-Investment-in-Polymarket/
- ICE, formulário 8-K: https://www.sec.gov/Archives/edgar/data/1571949/000094787125000890/ss5432176_8k.htm
- ICE, Polymarket Signals and Sentiment, 11/fev/2026:
  https://ir.theice.com/press/news-details/2026/ICE-Launches-Polymarket-Signals-and-Sentiment-Tool-Turning-Crowd-Sourced-Dynamic-Views-into-Market-Opportunities/default.aspx
- Kalshi, lançamento de perpétuos, 29/mai/2026: https://news.kalshi.com/p/kalshi-launches-perpetual-futures-america
- Kalshi, tabela de taxas (7/jul/2026): https://kalshi.com/docs/kalshi-fee-schedule.pdf
- Kalshi, tabela de 2022 na CFTC:
  https://www.cftc.gov/sites/default/files/filings/orgrules/22/09/rule091222kexdcm003.pdf
- Kalshi, programa de indicação: https://help.kalshi.com/en/articles/13823783-kalshi-referral-program-faq
- Polymarket, taxa de construtor: https://docs.polymarket.com/programs/builders/fees
- Polymarket, níveis do programa de construtores: https://docs.polymarket.com/programs/builders/tiers
- Polymarket, página de construtores: https://builders.polymarket.com/
- Polymarket, indicação: https://docs.polymarket.com/programs/referral-program e
  https://help.polymarket.com/en/articles/14174498-referral-program
- Polymarket US, programa de indicação de 2026 (arquivo na CFTC):
  https://www.polymarketexchange.com/files/notices/2026%20Referral%20Incentive%20Program%20(2026.01.16).pdf
- Polymarket, Holding Rewards: https://help.polymarket.com/en/articles/13364459-holding-rewards
- Polymarket, recompensas de liquidez: https://docs.polymarket.com/programs/liquidity-rewards
- Limitless, mercados criados por usuários: https://limitless.mintlify.app/user-guide/user-generated-markets e
  https://limitless.exchange/blog/limitless-launches-user-generated-markets-anyone-can-now-create-and-earn-from-their-own-prediction-market
- Perk, criação de mercado: https://docs.perk.fund/market-creation
- Stake, comissão de afiliado: https://help.stake.com/en/articles/9995651-how-to-get-an-affiliate-commission-with-stake
  e https://stake.us/affiliate/overview
- DexScreener, Token Advertising: https://marketplace.dexscreener.com/product/ad
- CoinGecko, anúncios: https://ads.coingecko.com/business-solutions/overview
- Block, resultados do 1º tri de 2024: https://block.xyz/inside/block-announces-first-quarter-2024-results
- Block, "Bitcoin Blueprint": https://block.xyz/documents/bitcoin-blueprint.pdf
- Méliuz, nota aos acionistas:
  https://ri.meliuz.com.br/Download.aspx?Arquivo=o41O2mdpToQgxrKPpo5tGg%3D%3D&linguagem=en
- Strategy, divulgação suplementar (SEC, 2024):
  https://www.sec.gov/Archives/edgar/data/1554859/000110465924079094/tm2416433d5_ex99-1.htm
- World Liberty Financial, proposta de governança:
  https://governance.worldlibertyfinancial.com/t/proposal-to-the-wlfi-team-and-community-allocate-pol-fees-to-accumulate-btc-and-eth-for-the-treasury/50476
- Zeus Network, como funciona: https://docs.zeusnetwork.xyz/intro/how-it-works-bitcoin-and-solana
- Zeus Network, prova de reservas com Chainlink:
  https://zeusnetwork.xyz/blog/milestone-zeus-network-adopts-chainlink-ccip-and-proof-of-reserve-to-enhance-transparency-and-cross-chain-compatibility-for-bitcoin-on-solana-ovhrairk

Secundárias (FATO SECUNDÁRIO)

- DefiLlama, Polymarket (uma leitura; 403 na segunda): https://defillama.com/protocol/polymarket
- PolyScalping, taxas e recompensas: https://polyscalping.org/blog/polymarket-fee-economy-on-chain-flows,
  https://polyscalping.org/stats/distribution e https://polyscalping.org/stats/distribution/lp
- TechFlow, relatório do 1º semestre de 2026 da Polymarket: https://techflowpost.com/en-US/article/33803
- Vultax, recompensas de liquidez: https://vultax.com/research/polymarket-kalshi-liquidity-rewards
- Sacra, Kalshi: https://sacra.com/c/kalshi/ e https://sacra.com/research/kalshi-at-3b-year/
- BJ21, taxa da Kalshi em 2025: https://bj21.com/articles/sports-betting/the-prediction-market-finishes-the-year-strong
- Futu, resumo do relatório do Bank of America sobre a Kalshi:
  https://news.futunn.com/en/post/71261729/a-detailed-breakdown-of-kalshi-when-everything-can-be-traded
- betting.net, como a Kalshi ganha dinheiro: https://www.betting.net/kalshi/how-kalshi-makes-money/
- CNBC, perpétuos da Polymarket (21/abr/2026):
  https://www.cnbc.com/2026/04/21/polymarket-launches-trading-of-heavily-leveraged-perps-contracts.html
- CNBC, pedido de margem da Kalshi (22/set/2026):
  https://www.cnbc.com/2026/09/22/kalshi-asks-cftc-to-allow-margin-trading-on-its-platform-letting-users-buy-with-borrowed-funds.html
- Decrypt, Polymarket Perps (4/set/2026): https://decrypt.co/377483/polymarket-crypto-perpetual-futures
- Finance Magnates, perpétuos:
  https://www.financemagnates.com/fintech/kalshi-and-polymarket-move-into-perpetual-futures-taking-on-offshore-exchanges/
- The Block, retrospectiva de 2025: https://www.theblock.co/post/383360/trump-victory-musk-tweets-nfl-prop-bets-historic-year-predictions-2026
- Rolling Stone, marketing de Kalshi e Polymarket:
  https://www.rollingstone.com/culture/culture-features/kalshi-polymarket-viral-moments-1235625058/
- crypto.news, Kalshi e ADI Predictstreet: https://crypto.news/kalshi-lands-fifa-world-cup-spotlight-through-adi-predictstreet-deal/
- Digiday, publicidade na Copa:
  https://digiday.com/media-buying/prediction-markets-and-sportsbook-brands-compete-to-capitalize-on-world-cup-betting-market/
- predictionmarkets.us, comparação de taxas: https://predictionmarkets.us/fees-comparison
- Gate News, competição da Myriad:
  https://www.gate.com/news/detail/prediction-market-myriad-launches-100k-world-cup-trading-competition-on-may-21453890
- Odaily, Copa nos mercados de previsão: https://www.odaily.news/en/post/5211350
- Predictefy, volume do 2º trimestre de 2026: https://blog.predictefy.com/prediction-market-volume-q2-2026
- DXT Tools, serviços pagos do DexScreener (23/ago/2026): https://dxttools.trade/dexscreener/paid-services,
  https://dxttools.trade/dexscreener/boosts e https://dxttools.trade/dexscreener/dex-paid
- Trilokana, campanha em CoinGecko e CoinMarketCap (mai/2025): https://trilokana.com/blog/coingecko-vs-coinmarketcap/
- Prob.Trade: https://prob.trade/solana
- Preços de terceiros: https://rivo.markets/pricing, https://getarbitragebets.com/pricing,
  https://kalshi-mcp.com/pricing e https://pred-markets.com/pricing.html
- The Block, Tether e bitcoin (17/mai/2023):
  https://www.theblock.co/news/business/2023-05-17-tether-bitcoin-investments-profits-231156
- CoinDesk, Méliuz (6/mar/2025):
  https://www.coindesk.com/markets/2025/03/06/brazilian-fintech-meliuz-to-allocate-10-of-cash-reserves-to-bitcoin
- Reuters, vendas de bitcoin da Strategy (13/jul/2026):
  https://www.reuters.com/legal/government/strategy-bitcoin-sales-shine-light-faltering-crypto-hoarding-companies-2026-07-13/
- Yahoo Finance, Strategy (28/jun/2026):
  https://finance.yahoo.com/markets/crypto/articles/actually-pays-microstrategy-64-billion-171726089.html
- Decrypt, Metaplanet (2/jul/2026): https://decrypt.co/372670/metaplanet-adds-2823-bitcoin-in-q2-as-buying-pace-cools
- CoinGape, Metaplanet (12/ago/2026): https://coingape.com/metaplanet-moves-out-bitcoin-amid-billion-in-unrealized-loss/
- crypto.news, MonkeDAO: https://crypto.news/solana-based-monkedao-acquires-zbtc-as-a-bitcoin-reserve/
- CoinDesk, cbBTC em Solana (7/nov/2024):
  https://www.coindesk.com/business/2024/11/07/coinbase-brings-bitcoin-to-solana-spurring-high-hopes-for-defi-surge
- SolanaFloor, bitcoin em Solana (jun e set/2025):
  https://solanafloor.com/news/btc-supply-on-solana-up-74-in-2025-pushing-market-cap-beyond-760-m e
  https://solanafloor.com/news/september-data-reveals-eight-month-high-in-bitcoin-supply-growth-on-solana-propelling-market-cap-beyond-1-04-b
- Spark, modelos de segurança de bitcoin embrulhado (9/jul/2026):
  https://www.spark.money/research/wrapped-bitcoin-security-models-compared
- SolanaFloor, Helium e recompras (5/jan/2026):
  https://solanafloor.com/news/helium-abolishes-token-buybacks-will-jupiter-be-next
- Cryptonews, Jupiter e Helium (5/jan/2026): https://cryptonews.com/news/jupiter-helium-token-buybacks-crypto-fail/
- BeInCrypto, Jupiter (4/jan/2026): https://beincrypto.com/jupiter-buyback-solana-token-unlocks/

Fontes fracas, usadas só onde não havia outra

- Agência MediaHype (preços de revenda, com contradições internas): https://mediahype.net/dextools-trending-crypto/ e
  https://mediahype.net/crypto-ads-network/
- Agência Basher, guia de promoções de casas de aposta:
  https://www.basher.agency/resources/guides/sportsbook-margin-promo-engineering/
- WagerLex, economia das promoções (25/mai/2026): https://wagerlex.com/the-stack/promo-pricing-economics/
- PureOdds, afiliados de cassinos cripto (30/jan/2026): https://pureodds.io/blog/stake-vs-rollbit-affiliate
- KuCoin (agregador), debate sobre recompras (4/jan/2026):
  https://www.kucoin.com/news/flash/helium-and-jupiter-halt-token-buybacks-amid-diminishing-market-impact
- Ledger Academy, Kalshi (20/jan/2026):
  https://www.ledger.com/academy/topics/economics-and-regulation/what-is-kalshi-prediction-market

Arquivos vizinhos, cujos números não foram reabertos: `receita-mercados-de-previsao.md`,
`patrocinio-e-destaque-pago.md`, `modelos-de-token.md`, `market-research.md`.
