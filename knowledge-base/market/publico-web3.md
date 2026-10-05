# Público web3: tamanho, comportamento, aquisição e patrocinadores

Data da pesquisa: 4 de outubro de 2026. Agente 1D, Onda 1.

Convenção: **[F]** fato com fonte, **[I]** inferência, **[S]** suposição, **[?]** pergunta em aberto.

## Limites do método (leia primeiro)

- Os arquivos `plano-das-ondas.md`, `ideacao-perguntas-e-respostas.md` e `patrocinio-e-destaque-pago.md` só devolveram a
  linha 1 na leitura (a ferramenta de leitura truncou). Portanto **não li a seção A (regras comuns) nem a minha linha
  da seção B**. Formato e disciplina seguem as regras do projeto (`research-discipline.md`). Revisar contra a seção A.
- Só `mercados-de-previsao-web3.md` foi lido por inteiro.
- As páginas foram lidas por ferramenta que resume o conteúdo; muitos números vêm de agregadores e notícias, não do
  painel. O orçamento de buscas da sessão acabou antes de eu fechar as lacunas listadas no fim.
- A API do DefiLlama devolveu **dados congelados de 2025** (PumpSwap 24 h = US$ 402 mi em 24/abr/2025; pump.fun taxas
  24 h = US$ 2,3 mi em 23/fev/2025). Descartei esses números como "atuais". Servem só para dizer que a consulta direta
  não é confiável hoje.

## 1. Tamanho do público

| Métrica | Valor | Data | Fonte | Tipo |
|---|---|---|---|---|
| Endereços ativos Solana (semana) | 27,1 milhões, +56% na semana | semana até 18/jan/2026 | Nansen via BlockEden [S1] | [F], sem filtro de robôs |
| Usuários ativos diários Solana | ~4,3 milhões | 2026, sem data exata | resumo de busca (Grayscale/KuCoin) [S2] | [F] fraco, não conferi na fonte |
| Transações diárias Solana | mais de 100 milhões | 2026 | Grayscale [S2] | [F] |
| Carteiras ativas mensais do pump.fun | pico de 5,2 mi (mai/2025), 1,8 mi (dez/2025) | 2025 | resumo de busca (The Block/CoinGecko) [S3] | [F] fraco |
| Carteiras únicas acumuladas pump.fun | 80 milhões; volume vitalício > US$ 214 bi | jun/2026 | The Block [S3] | [F] |
| Volume diário médio pump.fun (30 d) | ~US$ 347 mi | jun/2026 | The Block [S3] | [F] |
| Receita diária pump.fun | US$ 800 mil (jun/2026) contra US$ 4,8 mi seis meses antes | jun/2026 | The Block [S3] | [F] |
| Taxa de formatura (graduação) | 0,26% (média 7 d) em jun/2026; histórica ~1,4% (Dune) | jun/2026 | The Block [S3] | [F] |
| Volume diário PumpSwap | recorde de US$ 1,21 a 1,28 bi | jan/2026 | BlockEden, busca [S1][S2] | [F] |
| Usuários mensais da Phantom | ~15 mi (1º tri/2026), 9,8 mi no fim de 2025, pico quase 17 mi | 2026 | resumo de busca (CEO, Accelerate) [S4] | [F] fraco |
| Memecoins x previsão | 4 maiores plataformas de previsão = 55% do volume semanal de memecoins Solana | 22 a 28/set (ano não confirmado, provavelmente 2025) | resumo de busca [S5] | [F] fraco |

**Leitura [I]**: o público é grande em quantidade (milhões de carteiras), mas **a atividade de memecoin caiu forte em
2026** (receita do pump.fun a um sexto, formatura a 0,26%, "traders migram para perpétuos" no título do The Block).
"Carteira ativa" inclui robôs e múltiplas carteiras por pessoa; o número de **pessoas** reais é bem menor e não foi
encontrado. [?] Pessoas únicas por dia no pump.fun: não achei dado.

## 2. No que esse público aposta

- **Polymarket (referência, não on-chain nativo de Solana)**: em maio/2026 esporte ~39 a 40% do volume, política 32%,
  cripto 20% [S6]. No 1º tri/2026 esporte US$ 10,1 bi, política US$ 5 bi; cripto foi a "porta de entrada" de ~40% da
  atividade inicial dos novos usuários [S6]. Concentração: 3,5% das carteiras fazem 88% do volume [S7, só título].
- **Plataformas on-chain menores**: Azuro, Limitless, Myriad e PolyBet somados tinham menos de 4% do volume mensal do
  Polymarket em maio/2026 [S8]. Limitless ~60% Ásia-Pacífico e 30% Europa; mercados "por hora, diário, semanal" de
  preço de cripto [S8] e arquivo de concorrentes. Myriad: US$ 54,7 mi acumulados, US$ 37,5 mi em out/2025 [S8].
- **Divisão por tipo de mercado em Limitless, Myriad, PancakeSwap Prediction e dentro da Phantom**: **não achei**
  números por categoria. [?] Pedir ao fundador links de painéis Dune dessas plataformas. PancakeSwap Prediction
  (rodadas curtas de preço BNB) segue sem verificação.
- **Tamanho típico de aposta e frequência**: não achei dado verificável (só o piso de US$ 200 de volume para pontos da
  Limitless, Season 2 [S10]). [?]
- **Inferência [I]**: o que une o público é preço de cripto em prazo curto e eventos de grande atenção (esporte, eleição).
  Fatos de projeto de token não aparecem como categoria relevante.

## 3. Perfis

Dados de campo (entrevistas, pesquisas) **não foram encontrados**. O que segue é **[I]/[S]**, por conhecimento geral,
sem fonte verificada; tratar como hipótese a validar em entrevistas.

| Perfil | Busca [S] | O que afasta [S] | Onde se informa [S] |
|---|---|---|---|
| Trader de memecoin | giro rápido, retorno em minutos, sentir que "leu antes" | atrito de cadastro, prazo longo, mercado sem liquidez | X, Telegram, DexScreener, terminais de trade, grupos de call |
| Comunidade de um token | prova pública de meta cumprida, ânimo coletivo | meta que parece manipulável, taxa alta | Telegram, Discord, X do projeto |
| Formador de opinião do X cripto | conteúdo compartilhável, ganhar com audiência | risco de reputação, resolução disputável | X, Spaces, Telegram |
| Equipe de projeto | divulgar uma meta, atrair holders | pagar sem retorno mensurável, risco jurídico | X, DexScreener, agências de KOL |

Único dado de contexto: 73,28% dos traders do pump.fun estavam no lucro em abr/2026, quarto mês acima de 50% [S3,
resumo]; sem leitura da fonte original, pouco confiável.

## 4. Como produtos parecidos conquistaram os primeiros usuários

- **Pontos e airdrop (Limitless)**: Season 1 e 2 de pontos; pontos por volume (mínimo US$ 200 na S2), acerto, liquidez
  e indicação (bônus de até 6% dos pontos); token LMTS lançado em 22/out/2025; S1 foi só 2% dos 24% da oferta
  reservada a recompensas [S10]. [F]. Custo em dólares: **não encontrado**.
- **Indicação (Polymarket)**: 30% das taxas de indicados diretos e 10% dos indiretos, por 180 dias [S11]. [F].
  Polymarket confirmou um airdrop POLY futuro, com peso na atividade passada [S11, resumo].
- **Integração com carteira (World dentro da Phantom)**: distribuição vinda da carteira (mais de 20 mi de usuários
  citados pela Phantom) e lista de espera de mais de 1 milhão (arquivo de concorrentes, S16 de lá). [F].
- **Pontos como "farm"**: guias dizem que liquidez, constância, indicação e criação de mercado pesam mais que volume
  [S10]; fonte de blog, [I] de que atrai caçador de airdrop e não necessariamente usuário fiel.
- **Robôs de Telegram**: **não achei** caso documentado de plataforma de previsão ganhando usuários assim. [?]
- **Mercado de pote e criador (Melee)**: criador recebe até 20%, incentivo ao criador de trazer sua própria audiência
  (arquivo de concorrentes). [F].

Sinal importante [I]: o Limitless acumula US$ 1,47 bi mas fez só ~US$ 10 mi em 30 dias (arquivo de concorrentes), o que
sugere que campanha de pontos gerou pico e depois queda. Falta data de corte.

## 5. Potenciais patrocinadores e o que já pagam por visibilidade

Não consegui ler `patrocinio-e-destaque-pago.md`; **não repito nem contradigo esse arquivo**. Cruzar depois.

- **DEX Screener Boosts**: pacotes de 12 a 24 h que somam ao Trending Score; Golden Ticker ao chegar a 500 boosts
  ativos [S12]. **Preço dos pacotes: não achei** na documentação. [?] Pedir captura da tela de compra.
- **DEXTools**: assinatura premium ~US$ 100/mês ou 20.000 DEXT (agregador) [S13]; é plano de usuário, não anúncio.
- **Influenciadores (KOL)**: posts de US$ 200 a mais de US$ 500.000; CPM de US$ 25 a 100; micro-influenciador ~US$ 500
  por post; whale acima de US$ 50.000 por campanha [S14, blogs de agência, interesse comercial]. Lançamento sério de
  token US$ 40.000 a US$ 150.000 ou mais; agência US$ 5.000 a US$ 50.000/mês [S14]. Segmento de marketing web3 de
  US$ 2,71 bi em 2025 [S14]. Números de **fonte comercial, não auditada**.
- **Listagens (CoinGecko, CoinMarketCap)**: não achei preço. [?]
- **Quem seriam**: equipes de token, launchpads, validadores, protocolos [S]. Sem dado sobre disposição de pagar por
  "mercado de meta". Com a receita diária do pump.fun em queda, o orçamento de marketing do token médio provavelmente
  é pequeno [I].

## 6. Sinais de demanda pelo nosso recorte (fatos on-chain de token)

- **Polymarket tem mercados sobre pump.fun**, mas sobre o **token PUMP**, não sobre fatos on-chain de tokens de
  terceiros: "token formado no pump.fun será listado em corretora grande em 2026" (76% sim) e "PUMP acima de US$ 0,0034
  em 2026" (39%); um mercado de FDV de US$ 4 bi um dia após o lançamento resolveu Sim em 15/jul/2025 [S15, agregador].
  Volume total de mercados de pump.fun: ~US$ 262,81 mil [S15, agregador, sem data]. [F] fraco.
- **MemeMarket (MFUN)**: projeto Solana que se descreve como mercado de previsão para memecoins [S16, página de
  agregador]. Volume e usuários: **não encontrados**; status atual desconhecido. [?]
- **Mercados de queima, renúncia de autoridade, trava de liquidez, formatura**: **não encontrei nenhum aberto em
  qualquer plataforma**, em buscas limitadas. A ausência pode ser falta de procura ou falta de ferramenta; não dá para
  distinguir [I].
- **Conclusão [I]**: o sinal mais forte é **indireto**: atenção a eventos de token já existe no Polymarket (centenas de
  milhares de dólares, pouco), e memecoin e previsão compartilham público. Demanda direta pelo recorte: **não
  demonstrada**. A formatura é rara (0,26% a ~1,4%), então "vai formar?" é pergunta com alta incerteza e interesse
  natural, mas isso é hipótese [S].

## 7. Perguntas em aberto (pedir links ao fundador)

1. [?] Pessoas únicas (não carteiras) por dia no pump.fun e na Solana, excluindo robôs (painel Dune/Artemis).
2. [?] Volume por categoria em Limitless, Myriad, PancakeSwap Prediction e World/Phantom.
3. [?] Tamanho médio de aposta e frequência por usuário em qualquer plataforma on-chain.
4. [?] Preços atuais de Boost, anúncio e listagem na DEX Screener, DEXTools, CoinGecko, CoinMarketCap.
5. [?] Custo real das campanhas de pontos (Limitless) e resultado de retenção.
6. [?] Caso de robô de Telegram de previsão com número de usuários.
7. [?] Algum mercado aberto de queima, renúncia de autoridade, trava ou formatura (Polymarket, Myriad, MemeMarket).
8. [?] Entrevistas com perfis da seção 3 (hoje tudo [S]).

## Fontes

Agregadores e resumos marcados (agr.). Os de busca refletem apenas o resumo, não a página lida.

- S1. BlockEden, Solana 27 milhões de endereços (Nansen): https://blockeden.xyz/blog/2026/01/28/solana-27-million-active-addresses-defi-resurgence-institutional-adoption/
- S2. Grayscale via Crypto Briefing (agr., resumo): https://cryptobriefing.com/solana-1000-apps-100m-transactions-grayscale/
- S3. The Block, queda de 80% do pump.fun (resumo): https://theblock.co/post/404806/pump-fun-activity-craters-80-three-months-solana-fees-lower-traders-rotate-perps
- S4. Phantom MAU (agr., resumo): https://coinlaw.io/phantom-wallet-statistics/ e https://aicourses.fortune.com/ranking/crypto/2026/phantom/
- S5. Previsão x memecoins Solana (agr., resumo): https://www.mexc.com/news/115699
- S6. The Defiant, Polymarket março (Bitget Wallet): https://thedefiant.io/news/research-and-opinion/polymarket-hit-usd25-7b-in-march-volume-as-retail-traders-bet-on-sports-politics-and-crypto ; participação de maio: https://www.tradetheoutcome.com/best-polymarket-categories-trade-2026/ (agr.)
- S7. pm.wiki (agr., só título; página retornou HTTP 410): https://pm.wiki/uk/news/wire/agg_d954bfef76f68f9c
- S8. Blockmedia, The Block e pm.wiki (resumo): https://www.blockmedia.co.kr/research-english/1006651 ; https://www.theblock.co/post/405086/limitless-ceo-no-prediction-market-platform-will-dominate-perpetual-futures-precedent ; https://pm.wiki/uk/compare/limitless-exchange-vs-myriad
- S10. Bitrue (agr.), pontos Limitless: https://www.bitrue.com/blog/top-prediction-market-airdrops-july-2026 ; DappRadar: https://dappradar.com/?p=1239
- S11. Polymarket docs, indicação: https://docs.polymarket.com/resources/referral-program
- S12. DEX Screener docs: https://docs.dexscreener.com/boosting e https://docs.dexscreener.com/llms-full.txt
- S13. Plisio (agr.): https://plisio.net/ko/defi/dex-screener
- S14. ICODA, Lumina, NinjaPromo (blogs comerciais): https://icoda.io/blog/crypto-influencer-marketing-rates-roi/ ; https://luminaclippers.com/blog/crypto-marketing-cost ; https://ninjapromo.io/crypto-marketing-cost
- S15. Cryptorank, mercados do PUMP (agr.): https://cryptorank.io/price/pump-fun/predictions ; Polyguana: https://polyguana.com/market/554727
- S16. MemeMarket (agr.): https://www.mexc.com/tokens/MFUN
- DefiLlama API consultada e descartada por dado congelado: https://api.llama.fi/summary/dexs/pumpswap
