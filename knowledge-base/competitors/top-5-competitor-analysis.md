# Análise profunda dos 5 principais concorrentes (Onda 1, agente 1E)

Data: 4 de outubro de 2026

Concorrentes (escolhidos pelo agente 1A): Melee Markets, PNP Protocol, Polymarket, World (dentro da Phantom) e
Limitless.

Como ler as marcas:

- **[F]** FATO: fonte primária (documentação oficial, página do próprio projeto, regulador, dado on-chain ou de API
  pública consultada por mim nesta data).
- **[FS]** FATO SECUNDÁRIO: imprensa, agregador, blog, pesquisa de terceiro.
- **[I]** INFERÊNCIA: raciocínio meu, com a conta mostrada.
- **n/e**: não encontrado. Nada foi preenchido de memória.

Limites do método (leia antes de usar os números):

- Parte das páginas foi lida por ferramenta que devolve resumo feito por modelo auxiliar. Os números que mais pesam
  (volumes, preços de token, atividade on-chain do PNP) foram tirados direto de APIs públicas (DefiLlama, CoinGecko,
  DexScreener, RPC público da Solana) em 4/out/2026, sem resumo no meio.
- A busca ficou limitada por cota no meio da pesquisa. Onde só houve uma fonte, está dito.
- Régua de comparação (seção 1 de `ideacao-perguntas-e-respostas.md`): Baked Market é Solana, um pote por pergunta,
  USDC, taxa de 3% do pote, perguntas abertas pela equipe e depois pedidas por patrocinador, resolução só por dado
  on-chain, saída antecipada com penalidade que fica no pote, carteira sem identificação, dois tokens.

## Resumo em dez linhas

1. **Melee**, o mais parecido conosco (Solana, pote, criador ganha), ainda não opera com dinheiro real: o beta roda em
   rede de teste e os volumes do site são ilustração de tela, não dado. A pesquisa anterior tratou-os como escala.
2. **PNP** é um projeto só (pnp.exchange, docs.pnp.exchange, token PNP no pump.fun), mas está quase parado: 206
   transações no programa em seis meses, token valendo US$ 109 mil, e o site agora anuncia outro produto.
3. **Polymarket** é a referência de escala: US$ 4,6 bilhões em dólares pagos em setembro de 2026 e US$ 93,6 milhões de
   taxas no mês. O token POLY foi confirmado em outubro de 2025 e ainda não saiu.
4. **World** tem a melhor distribuição (dentro da Phantom) e pouco volume: US$ 15,4 milhões em setembro de 2026.
5. **Limitless** mostra o risco do token: volume caiu 96% de maio a setembro de 2026 e o LMTS caiu 94% desde o topo.
6. A reclamação mais repetida do setor é a resolução: votação da UMA na Polymarket, chave única de operador no World,
   modelo de linguagem no PNP, criador no Melee.
7. Nenhum dos cinco resolve por leitura direta de conta on-chain. O World parece automático, mas quem grava o resultado
   é uma chave da empresa.
8. Nenhum dos cinco vende patrocínio de pergunta com contrapartida. Polymarket tem um "patrocínio" que só paga
   formadores de mercado e não dá nada ao patrocinador.
9. Medida em dólares pagos, a taxa efetiva do setor fica entre 1,9% e 5%. Os 3% do pote estão dentro da faixa.
10. Os volumes "contraditórios" de Polymarket e Kalshi são a mesma atividade medida de dois jeitos: valor de face dos
    contratos (número grande) e dólares pagos (número três a cinco vezes menor).

## 0. Vocabulário mínimo, com exemplos

- **Livro de ordens.** Lista de ofertas de compra e de venda. Você compra de outra pessoa. Existe para dar preço
  exato e saída a qualquer hora, mas precisa de profissionais deixando ofertas (formadores de mercado). Exemplo: 100
  ações SIM a US$ 0,60 custam US$ 60; se der SIM, viram US$ 100.
- **AMM (formador de mercado automático).** Um contrato com uma fórmula faz o papel da contraparte. Sempre há
  preço, mas ele piora quanto maior a compra.
- **Curva de ligação (bonding curve).** Fórmula em que o preço sobe conforme entra dinheiro. Quem entra cedo paga
  menos. É o mecanismo do pump.fun.
- **Pote (parimutuel).** Todos depositam em SIM ou NÃO e quem acerta divide tudo. Exemplo: SIM tem US$ 6.000 e NÃO
  tem US$ 4.000. Taxa de 3% leva US$ 300. Sobram US$ 9.700. Quem pôs US$ 600 no SIM (10% do lado) recebe US$ 970.
- **Oráculo.** Serviço que informa ao contrato o que aconteceu fora da rede. No **oráculo otimista** (UMA) alguém
  propõe o resultado deixando uma caução; se ninguém contesta em 2 horas, vale; se contestam, há votação.
- **Leitura direta on-chain.** O próprio programa abre uma conta da Solana (um saldo, a oferta de um token) e
  decide. Ninguém informa nada, ninguém vota.
- **Volume nocional e dólares pagos.** 100 contratos comprados a US$ 0,27 dão nocional de US$ 100 e dólares pagos
  de US$ 27. Num pote, volume é sempre dólar depositado; compare só com "dólares pagos".

## 1. Melee Markets (Solana)

### 1.1 Posicionamento e público

- [F] O site diz "Melee Beta Is Live" e "Create a prediction market on anything in under a minute" [1].
- [FS] A imprensa de Solana o descreve como "pump.fun meets Polymarket" [4][6].
- [FS] Público: traders de Solana e criadores de conteúdo (podcasts, contas do X, comunidades) que ganham sobre o
  mercado que abrem [9].

### 1.2 Estado atual: beta sem dinheiro real

- [F] O acesso é liberado em ondas, por códigos distribuídos no X e no Discord; o site mostra "49,247 predictors in
  line" [1].
- [FS] O beta roda na rede de teste da Solana, "no real money at risk", em três fases: Trade (mercados curtos de
  preço de cripto e mercados da equipe), Claim (modelos de mercado prontos) e Create (qualquer um cria). A fonte é
  um fio de usuário no X republicado pela KuCoin em 9/set/2026, não um comunicado oficial [7].
- [FS] Em 22/jul/2026 a SolanaFloor escreveu que o Melee estava "approaching its mainnet launch" [4].
- [I] Logo, até 4/out/2026 não achei prova de volume com dinheiro real. O Melee não aparece na lista de protocolos
  do DefiLlama [20].
- **Correção às pesquisas anteriores.** Os números do site (mercado de GTA VI com "15.87M volume · 7,842 traders",
  "Creator earnings $317,375", mercados de 6 a 31 milhões) são ilustração de interface na página de entrada [1]. Os
  arquivos `mercados-de-previsao-web3.md` e `competitor-longlist.md` os citaram como escala. Não usar.

### 1.3 Primeiro dia e cadastro

- [FS] Pegar um código, abrir caixas diárias, negociar mercados curtos de cripto (há mercados de SOL de 5 minutos) e
  mercados da equipe; a primeira negociação libera o "Melee Score", pontuação que sobe com acerto e cai com erro e
  que, segundo o fio, será levada para a rede principal [6][7].
- Carteira, identificação e depósito: n/e. Em rede de teste não há depósito real [I].

### 1.4 Mecanismo e saída antes do fim

- [F] O mecanismo se chama PMM (Parimutuel Market Maker) e está descrito num documento oficial [2]:
  - a base é um pote: quem acerta divide, proporcionalmente, o dinheiro dos lados que erraram;
  - cada desfecho tem uma curva de preço que se ajusta ao estado do pote inteiro;
  - cada posição recebe, na entrada, um **piso de retorno** que só sobe, "conditional on the position's outcome
    winning and being held to resolution";
  - há uma **pré-venda** opcional antes de o mercado abrir, com preço único;
  - a **saída antes do fim** é feita por um cofre separado de provedores de liquidez ("cashout LP vault"), que compra
    a posição "at a discount to the position's current expected value". A oferta "may fall below the position's
    resolution floor" e "cashout availability depends on vault depth".
- [F] Exemplo da tela do site: aposta de US$ 50, piso de US$ 109, US$ 164 "if it runs" [1]. É ilustração.
- [F] A documentação antiga (GitBook) descreve outra versão: 2 a 32 desfechos, cada um com sua curva; quem acerta
  recebe a aposta de volta e divide os potes perdedores; "Can I sell before the market ends? No"; "All markets are
  currently created by Melee" [8]. É a versão alfa, anterior ao PMM.
- [I] Diferença para a nossa decisão: no Melee a penalidade da saída vai para um terceiro (o cofre de liquidez), não
  para o pote. No Baked Market a penalidade fica no pote e melhora o prêmio de quem ficou.

### 1.5 Quem abre perguntas, patrocínio, ganho do criador

- [F] A meta é criação aberta; "Market creators receive a portion of the platform fees collected on all market
  activity" [2].
- [FS] O percentual aparece como "up to 20%", ora "of trading volume" [3], ora das taxas (pesquisa anterior).
  Divergência não resolvida.
- Patrocínio ou destaque pago: n/e.

### 1.6 Resolução e disputa

- [F] A página de resolução da documentação antiga está marcada como "[WIP]" (em construção); a pergunta frequente diz
  só que os mercados "are resolved based on the objective result of the event" [8].
- [FS] A pesquisa anterior registrou: resolve o criador, com anulação e devolução em caso ambíguo, e meta de uma
  rede de resolvedores (`mercados-de-previsao-web3.md`, fonte S14 de lá).
- Disputa formal: n/e.

### 1.7 Taxas, receita e token

- Percentual de taxa: n/e. Em 16/abr/2026 um site do setor dizia que os detalhes de taxa ainda seriam publicados [5].
- Token: n/e. [I] O "Melee Score" que "passa para a rede principal" tem cara de critério de distribuição futura de
  token; é suposição minha, sem fonte.

### 1.8 Integrações e aquisição

- [FS] Compartilhamento nativo no X e no Discord; códigos de comunidade com bônus coletivo; medalhas e sequência de
  dias [3][7]. API pública: n/e.

### 1.9 Escala

- [FS] Captou US$ 3,5 milhões em setembro de 2025, rodada liderada pela Variant, com DBA e os anjos Anatoly
  Yakovenko (cofundador da Solana), Meltem Demirors e Santiago Roel Santos [3]. A SolanaFloor chama de "pre-seed" [4].
- [FS] Fundador citado: Nick Preszler [5]. O Solana Compass lista os nomes ZenLlama, Maximilian e Kai [3].
- [FS] Simulação do próprio projeto em 126 mercados de Bitcoin de 15 minutos: 65,1% e retorno mediano de 12,7%, pior
  caso de -22,7%. As duas fontes leem o 65,1% de modos diferentes ("posições de pré-venda positivas" [3]; "posições
  vencedoras com lucro maior que no modelo tradicional" [4]). É simulação, não histórico.
- Volume, usuários e receita reais: n/e.

### 1.10 Reclamações e pontos fracos

- [FS] Um agregador lista como contras: "Bonding-curve pricing favors early buyers and can be volatile",
  "Speculative, meme-driven markets over rigorous resolution", "Very new protocol in alpha with a limited track
  record"; zero avaliações de usuários [6].
- [FS] "No public security audit has been published" [3].
- [I] Pontos fracos: ainda não provou nada com dinheiro real; a resolução depende de gente; a regra de preço é
  difícil de explicar (curvas "mutuamente conscientes", piso, pré-venda, cofre).

## 2. PNP Protocol / PNP Exchange (Solana)

### 2.1 Posicionamento e público

- [F] "PNP Exchange is a decentralized prediction market protocol. Create a market for any event, trade outcome
  tokens via bonding curves (no order book), and settle results with real-time LLM oracles" [10].
- [FS] Nas palavras do projeto: "Think Pump.fun meets Polymarket" [14]. O perfil no X é @predictandpump [17].
- [I] O público real são desenvolvedores e agentes de inteligência artificial: o material é quase todo de kit de
  programação, e existe uma "Arena" em que agentes criam e negociam mercados por pontos [12].

### 2.2 Primeiro dia e cadastro

- [F] "All you need is a Solana wallet and USDC"; um assistente de IA ajuda a escrever o critério de resolução; "PNP
  doesn't review or reject markets" [10]. Identificação: nenhuma mencionada.
- [F] Pelo kit de programação: cerca de 0,05 SOL para taxas de rede. Mercado com oráculo próprio nasce congelado e,
  se não for ativado em 15 minutos, fica "PERMANENTLY FROZEN" [12].

### 2.3 Mecanismo e saída antes do fim

- [F] Quatro modelos [10][13]:
  - **V2, AMM "pitagórico"**: reservas R = √(SIM² + NÃO²), de modo que preço do SIM² + preço do NÃO² = 1. Tem compra
    e venda, então dá para sair antes;
  - **V3, P2P em pote**: "yesPot", "noPot", "totalPot"; o criador entra de um lado e outros tomam o lado oposto;
  - **PAMM**: liquidez virtual, para redes EVM;
  - **Bubblegum**: "Every market launches its own token on a bonding curve — no LPs, no market makers, no seed
    capital required", negociado em SOL.
- [F] Garantia aceita: "any SPL token" [12].

### 2.4 Quem abre perguntas e o que o criador ganha

- [F] Qualquer pessoa. "Every trade on your market generates a 1% fee, and 30% of that fee flows directly to you"
  [10]. Exemplo: US$ 100.000 negociados geram US$ 1.000 de taxa e US$ 300 para o criador [I].
- [F] O índice dos docs resume o resto: "20% goes to DAO settlement, and the rest funds protocol growth and trading
  incentives" [10].
- [FS] Em setembro de 2025 a imprensa dizia 50% das taxas para o criador [15]. O número mudou ou a fonte errou.
- Patrocínio ou destaque pago: n/e.

### 2.5 Resolução e disputa

- [F] Dois modelos de linguagem (Perplexity e Grok) avaliam evidências ("news articles, on-chain data, price
  feeds") e gravam SIM ou NÃO on-chain. Em casos fora do alcance, "the PNP DAO acts as the settlement backstop" [10].
- [F] Logo após a criação, a IA decide se o mercado é "resolvable" ou "unresolvable"; se não for, há reembolso [13].
- [F] Há tipos de mercado ligados a fontes: tweets, vídeos do YouTube, preço de token e métricas do DefiLlama (TVL,
  valor de mercado, saídas). Estes resolvem por "DeFiLlama API + LLM" [10]. Mesmo quando a pergunta é sobre um número
  on-chain, a resposta vem de uma API e de um modelo de linguagem, não de leitura da conta.
- [F] O criador pode nomear qualquer carteira como oráculo: "That wallet can settle the market" [13].
- Quórum, prazo e composição da DAO: n/e (as páginas de detalhe estão fora do ar; ver 6.1).

### 2.6 Taxas e token

- [F] Taxa única de 1% por negociação [10].
- [FS] Token PNP: lançamento "fair launch" no aplicativo Believe, 1 bilhão de unidades, 0% para a equipe; usos
  declarados: parte das taxas para detentores, exigência de PNP para criar mercado por rede social e desconto de
  taxa [16].
- [FS] Em 1/set/2025: US$ 0,001665, valor de mercado de cerca de US$ 1,6 milhão [15].
- [FS] Em 10/nov/2025 anunciou migração do Believe para o pump.fun, com troca manual de 1 para 1 [14].
- [F] Em 4/out/2026: endereço `UVcu7kbVKW6Rs5PKzuwVSbm8ukvrWByS3hBXqHapump`, par no PumpSwap criado em
  17/dez/2025, preço US$ 0,0001086, valor de mercado US$ 108.661, liquidez US$ 31.219, volume de 24 horas
  US$ 258 [17]; oferta de 999.996.145 unidades [18].
- [I] Queda de cerca de 93% no valor de mercado em 13 meses (de US$ 1,6 milhão para US$ 0,109 milhão).

### 2.7 Integrações e aquisição

- [F] Kit `pnp-core` no npm (publicado em 12/jul/2026), linha de comando `pnpfucius`, "habilidade" para agentes de IA
  (`solana-skill`, licença MIT), modelo Next.js, modelo Expo com Privy [12][13].
- [F] Os docs listam "2nd Derivative Kalshi Markets" (mercados sobre mercados) [10].
- [I] Canal de aquisição: comunidade do token e desenvolvedores de agentes. Não achei canal de consumidor.

### 2.8 Escala

- [F] Programa da rede principal `8PyE2dizL52ga7ytqLtqRyjwWp4yXEx8M5Z4BAHgHuTb`: 206 transações entre 16/mar/2026 e
  17/set/2026, 194 sem erro, nenhuma desde 17/set (RPC público, 4/out/2026) [18]. Ressalva: pode haver outros
  programas (P2P, Bubblegum) que não medi.
- [F] Organização no GitHub: 10 repositórios, 5 seguidores, criada em 1/dez/2024 [12].
- Volume, usuários, receita, valor captado, investidores e equipe: n/e. Não aparece no DefiLlama [20].

### 2.9 Reclamações e pontos fracos

- Reclamações públicas: n/e (o projeto é pequeno demais para ter avaliações).
- [I] Pontos fracos: resolução por modelo de linguagem não é conferível por quem aposta; o oráculo próprio deixa o
  criador decidir o resultado; três mudanças de rumo em um ano; token com liquidez de US$ 31 mil.

## 3. Polymarket (Polygon; aplicativo regulado nos EUA)

Base: leitura completa da documentação e da central de ajuda em 3/out/2026 [19], mais fontes novas.

### 3.1 Posicionamento e público

- [F] Mercado de previsão em que o usuário negocia com outros usuários, sem "casa". Fora dos EUA opera em
  polymarket.com; nos EUA há um aplicativo separado, regulado [19].
- [F] O Brasil está na lista de países que só podem fechar posição, não abrir [19].

### 3.2 Primeiro dia e cadastro

- [F] Entrar com Google, e-mail (código de 6 dígitos) ou carteira (MetaMask, Rabby, Phantom); depositar por 14
  redes, incluindo Solana (mínimo de US$ 3 na Solana); a central de ajuda não descreve verificação de identidade
  no site internacional [19].

### 3.3 Mecanismo e saída antes do fim

- [F] Livro de ordens: casamento fora da rede, liquidação on-chain. Ação vencedora paga US$ 1,00. Sai-se vendendo no
  livro a qualquer momento, se houver comprador [19].

### 3.4 Quem abre perguntas, patrocínio, criador

- [F] "Markets are created by the markets team with input from users and the community." O usuário sugere marcando
  @polymarket no X, com título, fonte de resolução e prova de demanda [19].
- [F] Existe "Sponsor Market Rewards": qualquer um deposita USDC num contrato para pagar quem deixa ofertas no
  livro daquele mercado; mínimo de US$ 0,1 por dia; um patrocínio ativo por mercado; "sem benefício monetário ao
  patrocinador" [19]. Não há selo, destaque nem texto do patrocinador.
- [F] Não existe incentivo documentado para criador de mercado [19].

### 3.5 Resolução e disputa

- [F] UMA, oráculo otimista: caução de cerca de US$ 750, 2 horas de contestação; se contestado, debate e votação
  dos detentores do token UMA; 4 a 6 dias. "Once finalized by UMA, outcomes are immutable" [19].
- [FS] Mercados curtos de cripto: desde agosto de 2026 resolvem por preço médio ponderado no tempo (30 segundos nos
  de 5 minutos, 60 segundos nos de 15 minutos e 4 horas), entregue pelo Chainlink Data Streams [25].
- Casos documentados:
  - [FS] Março de 2025: mercado de US$ 7 milhões sobre acordo de minerais entre EUA e Ucrânia resolveu SIM sem acordo.
    Um detentor votou com 5 milhões de UMA em três contas, 25% dos votos. A Polymarket: "because this wasn't a market
    failure, we are not able to issue refunds" [23].
  - [FS] Maio de 2026, análise do Wall Street Journal: pelo menos 60% dos votantes ativos da UMA estão ligados a
    contas da Polymarket; em cerca de 1 a cada 5 disputas um votante tinha posição no mercado julgado; mais de 50%
    do poder de voto está nas 10 maiores carteiras; mais de 1.150 mercados foram a arbitragem em 2026 até maio,
    mais que 2025 inteiro. O fundador chamou o processo de "messy" [24].
  - [FS] Agosto de 2026: estudo achou 821 contas que ganharam US$ 8,2 milhões em janelas de liquidação
    provavelmente manipuladas nos mercados de Bitcoin de 5 minutos (ordem grande na Binance nos segundos finais);
    93% do prejuízo caiu no varejo [25].
- [F] O token UMA vale US$ 0,404, com valor de mercado de US$ 37,5 milhões, 99% abaixo do topo de 2021 [29].
  [I] Um oráculo de US$ 37,5 milhões decide mercados que giram bilhões por mês: o custo de comprar votos é pequeno
  frente ao prêmio.

### 3.6 Taxas e outras receitas

- [F] Só paga quem toma liquidez: taxa = contratos × coeficiente × p × (1 − p). Coeficiente: cripto 0,07; esportes,
  economia, cultura, clima e outros 0,05; finanças, política, tecnologia e menções 0,04; geopolítica 0. De 15% a
  25% volta a quem deixa ofertas. Exemplo: 100 ações de cripto a US$ 0,50 pagam 100 × 0,07 × 0,5 × 0,5 = US$ 1,75,
  ou 3,5% dos US$ 50 pagos [19].
- [F] Sem taxa de depósito nem de saque. Taxa de parceiro (builder) de até 1%. Indicação: 10% das taxas dos
  indicados diretos e 5% dos indiretos [19].
- [F] Rendimento sobre posições paradas: 4,00% ao ano na documentação e 3,25% na central de ajuda; a divergência é
  da própria fonte [19].
- [F] No aplicativo dos EUA o coeficiente é 0,0695 desde 16/set/2026 [20].
- [F] Taxas arrecadadas (DefiLlama): zero em 2025; US$ 3,7 milhões em jan/2026; US$ 40,6 milhões em abr/2026;
  US$ 93,6 milhões em set/2026; US$ 435,3 milhões acumulados [20].
- [I] Taxa efetiva: US$ 93,2 milhões em 30 dias sobre US$ 4,61 bilhões em dólares pagos = 2,0%.
- [FS] Outras receitas: licença de dados (parceria com a ICE), rendimento das stablecoins paradas e uma linha de
  contratos perpétuos (`receita-mercados-de-previsao.md` e [19]).

### 3.7 Token

- [FS] O diretor de marketing confirmou em 24/out/2025: "There will be a token, there will be an airdrop" [28].
- [FS] A controladora pediu as marcas "POLY" e "$POLY" nos EUA em 4/fev/2026 [28].
- [F] Em 3/out/2026 a central de ajuda dizia que não há airdrop nem lançamento anunciado e alertava para golpes [19].
- Preço: não se aplica; o token não existe. Uma análise de abril de 2026 projetava "mid-to-late 2026" [28].

### 3.8 Integrações e aquisição

- [F] APIs públicas, kits em TypeScript e Python, programa de parceiros que roteiam ordens e cobram taxa própria,
  incorporação em Substack [19].
- [F] Interfaces de terceiros que mandam ordens à Polymarket, por volume em 30 dias: Traderline US$ 36,5 milhões,
  Gate US$ 31,4 milhões, MetaMask US$ 11,2 milhões [20].
- [FS] Comprou a bolsa regulada QCEX (volta aos EUA) e a Dome, empresa de API, em 19/fev/2026 [28].
- [I] Aquisição de usuários: imprensa e X (as probabilidades viram notícia), indicação paga e parceiros.

### 3.9 Escala

- [F] DefiLlama, dólares pagos, soma de internacional, EUA e combinadas: nov/2025 US$ 1,88 bilhão; mar/2026
  US$ 5,09 bilhões; jun/2026 US$ 5,95 bilhões; set/2026 US$ 4,63 bilhões; acumulado US$ 56,5 bilhões. Nos últimos
  30 dias: internacional US$ 2,19 bilhões, EUA US$ 2,41 bilhões [20].
- [FS] Investidores: Founders Fund (US$ 150 milhões a US$ 1,2 bilhão de avaliação, jun/2025); ICE, dona da Bolsa de
  Nova York (US$ 1 bilhão em out/2025 a US$ 9 bilhões de avaliação, mais US$ 600 milhões em mar/2026, total de
  US$ 1,6 bilhão) [28]. O agente 1B registra avaliação de US$ 15 bilhões em 2026 (Sacra, citando a Bloomberg).
- [FS] Usuários ativos por dia: de cerca de 59 mil (out/2025) para quase 150 mil (meados de mar/2026) [28].

### 3.10 Reclamações e pontos fracos

- Resolução contestada e conflito de interesse dos votantes (3.5).
- [FS] Uso de informação privilegiada: militar dos EUA acusado de ganhar US$ 440 mil apostando na captura de
  Maduro com informação sigilosa; reportagem do New York Times sobre dezenas de apostas suspeitas; regras novas
  em 23/mar/2026 [26].
- [F] O estado de Nova York processou a Polymarket US em 24/set/2026 por operar jogo ilegal sem licença [27]. É ponto
  para advogado; registro só o fato.
- [FS] Negociação artificial: estudo da Columbia estimou cerca de 25% da atividade histórica (`market-research.md`).
- [F] Dúvidas mais frequentes na central de ajuda: depósito enviado pela rede errada, erro ao resgatar, onde é
  permitido usar [19].

## 4. World (world.xyz), dentro da Phantom (Solana)

### 4.1 Posicionamento e público

- [F] "Markets in Phantom are powered by World Prediction Markets on Solana." Posições abertas a partir de 1/jun/2026
  usam o World; antes disso, Kalshi via DFlow [31].
- [FS] Abriu em world.xyz e na Phantom em 1/jul/2026; em 9/set/2026 abriu o site próprio para "mais de 1 milhão" de
  pessoas em lista de espera. A Phantom declara mais de 20 milhões de usuários da carteira [33].
- [I] Público: o usuário comum de carteira Solana, o mesmo que queremos.

### 4.2 Primeiro dia e cadastro

- [F] Abrir um mercado, escolher SIM ou NÃO, digitar o valor, pagar com a conta Cash, USDC ou outro token Solana,
  revisar taxas e confirmar. Não há depósito em conta separada. Pagando pela conta Cash, não se paga taxa de rede [31].
- [F] Identificação: "Identity verification is optional for most Cash features"; só é exigida para cartão e banco [31].
- [F] Geografia: "Availability varies by region. Not available in regions subject to comprehensive US economic
  sanctions." Onde não é suportado, dá para ver e vender, não para abrir [31]. Lista de países: n/e.

### 4.3 Mecanismo e saída antes do fim

- [FS] Pesquisa independente da Chainstack Labs, feita por leitura dos programas na rede (verificada em
  11/set/2026): o programa do World guarda a garantia e emite pares SIM/NÃO; o preço vem de formadores de mercado
  (JanusFI e BisonFI) acionados pelo roteador DFlow. Não há livro de ordens nem ordem limitada [30][32].
- [FS] A JanusFI divide com o World a chave que pode alterar o programa: "one key can rewrite both the market rules
  and the in-house maker's pricing" [30].
- [F] Saída: "You can close a position before the market resolves if liquidity is available. The cash-out price
  reflects current market liquidity, not the theoretical value" [31].
- [F] Moeda: CASH, stablecoin usada pela Phantom [31]. [FS] Emitida pela Bridge, da Stripe, que pode congelar e
  recuperar saldos [30].

### 4.4 Quem abre perguntas

- [FS] Só a chave de operador cria mercados [30]. A empresa fala em "mais de 150 mil mercados" criados [33]; o
  catálogo aberto tinha cerca de 4.000 em 11/set/2026 [30].
- Patrocínio, destaque pago e ganho de criador: n/e.

### 4.5 Resolução e disputa

- [FS] A empresa e a Chainlink dizem que a resolução usa Chainlink Data Streams e Runtime Environment, sem painel
  humano, sem voto e sem janela de disputa [33].
- [FS] O que a rede mostra: "Resolution is a 2-byte value that key writes; the instruction carries no oracle
  account, price feed, or proof." O Chainlink roda fora da rede e alimenta a chave; "the chain cannot tell whether an
  outcome came from Chainlink or from anyone else holding the key". Não há instrução de disputa nem de reembolso [30].
- [F] O pagamento é automático; em esportes pode ficar 10 a 15 minutos como "Payout Pending" [31].
- [FS] Há mercados que dependem de interpretação (exemplo: "GameStop vai comprar a eBay em 2026"), com fuso horário e
  definição de "aquisição" em aberto; os termos não dizem quem arbitra [32].

### 4.6 Taxas e receita

- [F] Taxa da Phantom: 0,1 × p × (1 − p) × contratos. Exemplo oficial: 100 contratos SIM a US$ 0,75 pagam US$ 1,875,
  ou 2,5% dos US$ 75 pagos. A 50%, a taxa é 5% do valor pago [31]. É maior que o teto da Polymarket (0,07).
- [FS] Além disso há a margem do formador de mercado: num mercado sobre juros nos EUA, SIM a 11 centavos e NÃO a 92
  somavam 103, contra 101 na Polymarket e 100,1 na Kalshi; num exemplo real o custo embutido foi de 2,16%; a faixa
  observada foi de 0% a 8% do valor apostado. O World não publicou tabela de taxas [30][32].

### 4.7 Token

- [FS] Nenhum anunciado; tokens falsos "WORLD" surgiram antes do lançamento (`mercados-de-previsao-web3.md`).

### 4.8 Integrações e aquisição

- [F] Phantom em iOS, Android e computador [31]. [FS] DFlow, Chainlink, Bridge/Stripe; catálogo e cotação em API
  aberta, sem chave [30]. [I] Canal de aquisição: a tela inicial da Phantom.

### 4.9 Escala

- [F] DefiLlama: jun/2026 US$ 1,14 milhão; jul US$ 13,22 milhões; ago US$ 22,20 milhões; set US$ 15,44 milhões;
  últimos 30 dias US$ 14,69 milhões; acumulado US$ 52,94 milhões; maior dia 19/ago/2026 com US$ 8,04 milhões; valor
  travado US$ 170,8 mil [20].
- [I] Isso é 0,7% do volume da Polymarket internacional no mesmo período (14,69 ÷ 2.185).
- [FS] A empresa não divulgou volume, posições em aberto nem taxas [33]. Equipe e investidores: n/e.

### 4.10 Reclamações e pontos fracos

- [FS] Caiu 5 horas depois do lançamento de 9/set/2026 e ficou 29,5 horas fora do ar [32].
- [FS] Custo escondido no preço, sem ordem limitada, regras ambíguas, ninguém para arbitrar [32].
- [FS] Centralização: uma chave cria, resolve, paga e encerra; o programa pode ser alterado; a autoridade do protocolo
  pode mover ou destruir posições; o emissor do CASH pode congelar [30].

## 5. Limitless (Base)

### 5.1 Posicionamento e público

- [F] "The leading prediction market on Base"; mercados por hora, dia e semana de cripto, ações e macro [34].
- [F] Bloqueia Estados Unidos e outros países nos termos; não exige identificação de rotina, mas se reserva o
  direito de pedir (`mercados-de-previsao-web3.md`).

### 5.2 Primeiro dia e cadastro

- [F] Conectar carteira (MetaMask, Coinbase Wallet, Rabby, Rainbow) ou entrar com Google ou Twitter, o que cria
  uma carteira embutida; ter USDC na Base; escolher mercado; comprar SIM ou NÃO; "You can sell shares anytime before
  the market resolves" [34].

### 5.3 Mecanismo

- [F] Livro de ordens e AMM convivem. Contratos copiados dos da Polymarket, que foram auditados [34].

### 5.4 Quem abre perguntas e o que o criador ganha

- [F] Qualquer usuário logado cria, com limite diário; esses mercados levam o selo "Community". O criador recebe, por
  padrão, 2% das taxas do mercado, em USDC, todo dia; a taxa é fixada na criação [34].
- [I] Exemplo: US$ 100.000 negociados a 2% de taxa efetiva geram US$ 2.000 de taxas e US$ 40 para o criador. No PNP
  o mesmo volume daria US$ 300.
- [F] Mercados de usuários não geram comissão de indicação [34]. Patrocínio ou destaque pago: n/e.

### 5.5 Resolução e disputa

- [F] Pyth na maioria; Chainlink (preço médio no tempo) nos curtos; provedores esportivos; manual pela equipe em 24 a
  72 horas (`mercados-de-previsao-web3.md`).
- [F] Sem disputa formal. Política de reembolso: se o mercado for resolvido errado, quem estava do lado certo recebe
  de volta o que pagou (não o prêmio), e quem recebeu por engano fica com o dinheiro; "Limitless absorbs this
  cost" [34].

### 5.6 Taxas e receita

- [F] AMM 0,40% fixa; livro: compra de 0,40% a 3,00%, venda de 0,42% a 1,50%; só quem toma liquidez paga [20][34].
- [F] Taxas arrecadadas: US$ 3,82 milhões em mai/2026; US$ 0,20 milhão em set/2026; US$ 14,13 milhões no total [20].
- [I] Taxa efetiva em 30 dias: US$ 186,8 mil sobre US$ 9,88 milhões = 1,9%.
- [F] Indicação: de 10% a 40% das taxas dos indicados, conforme o volume de quem indica (de US$ 0 a US$ 20
  milhões), com vínculo permanente e pagamento diário [34].

### 5.7 Token LMTS

- [FS] Venda no Kaito Launchpad em set/2025: buscava US$ 1 milhão e recebeu mais de US$ 200 milhões em pedidos [35].
- [F] Topo de US$ 0,694 em 22/out/2025 (dia do lançamento); em 4/out/2026 vale US$ 0,0420, queda de 94%; mínima de
  US$ 0,0389 em 29/set/2026; valor de mercado US$ 5,5 milhões; valor totalmente diluído US$ 42 milhões; 131,6
  milhões em circulação de 1 bilhão [29].
- [F] "HoldersRevenue: Zero. No portion of trading fees reaches LMTS holders on-chain today" [20].

### 5.8 Integrações e aquisição

- [F] API REST e WebSocket, guia "Migrate from Polymarket", servidor para conectar assistentes de IA (Claude, Grok),
  modelo de robô de negociação, robô que cota na Limitless e protege na Polymarket, incorporação em sites com código
  de indicação, programa de recompensas a quem deixa ofertas [34].

### 5.9 Escala

- [F] Volume mensal em milhões de dólares (DefiLlama): nov/2025 65,2; dez 75,6; jan/2026 47,2; fev 72,5; mar 91,0;
  abr 102,8; mai 250,9; jun 173,0; jul 85,9; ago 27,5; set 10,75. Acumulado US$ 1,467 bilhão [20].
- [I] Queda de 96% entre maio e setembro de 2026. Causa: n/e.
- [FS] Captou US$ 7 milhões até jul/2025 (Coinbase Ventures, 1confirmation, Maelstrom, Collider, Node Capital e
  outros) e mais US$ 10 milhões em 20/out/2025, liderados pela 1confirmation, com Collider, F-Prime, DCG, Coinbase
  Ventures, Node Capital e Arrington Capital [35]. [I] Total de cerca de US$ 17 milhões, fora a venda do token.

### 5.10 Reclamações e pontos fracos

- Reclamações diretas de usuários: n/e.
- [I] O volume e o token despencaram juntos; o detentor do token não recebe nada das taxas; os contratos e a API
  são cópia do modelo da Polymarket, sem diferencial de mecanismo.

## 6. Os dois pontos que o agente 1A deixou em aberto

### 6.1 PNP: é o mesmo projeto? Está ativo?

**É o mesmo projeto.** [F] A página do token PNP no DexScreener aponta `pnp.exchange` como site e
`docs.pnp.exchange` como documentação, com o X @predictandpump e o Telegram `pnpexchangeportal` [17]. A organização
`pnp-protocol` no GitHub se intitula "pnp.fun" e publica os kits que os docs descrevem [12].

**O site mudou de assunto.** [F] Em 4/out/2026 `pnp.exchange` mostra só: "PnP: A coin that trades Polymarket. Coming
soon.", "Attention on Solana becomes working capital on Polymarket", um botão "I want in" e, no rodapé, "Withdrawals ·
none, ever" [11]. [I] Parece um produto novo: um token cujo caixa aposta na Polymarket, sem saque. Não achei anúncio
que explique.

**A documentação está pela metade.** [F] A capa, `core-features` e o índice respondem; `development.md` (taxas),
`bonding.md` e `bubblegum/overview.md`, listadas no índice, devolvem erro 404 em 4/out/2026 [10]. Por isso a divisão
exata da taxa e as regras da DAO não puderam ser lidas.

**Atividade.** [F] 206 transações no programa principal em seis meses, a última em 17/set/2026; token com valor de
mercado de US$ 108.661 e US$ 258 negociados em 24 horas; kit publicado em 12/jul/2026 [13][17][18]. `pnp.fun` e
`app.pnp.exchange` não respondem; a página da Arena devolve 404.

**Conclusão [I].** Mesmo projeto, tecnicamente no ar, comercialmente quase parado e mudando de produto. Serve como
referência de ideias (criador com 30% da taxa, lançamento de mercado sem capital), não como rival por usuários.

Detalhe: um arquivo do repositório cita outro endereço de token (`PNPfbm...Hpump`); o RPC o rejeita como endereço
inválido [18]. O endereço que existe e negocia é o `UVcu7k...`.

### 6.2 Volumes de Polymarket e Kalshi: qual número vem de onde

Há duas réguas. A DefiRate explica na própria página: de 4/set a 3/out/2026 o setor somou US$ 81,8 bilhões em
"contracts at $1 face value" e US$ 21,7 bilhões em "dollars actually paid", média de US$ 0,27 por contrato [21].

| Número | Fonte | Período | O que mede |
|---|---|---|---|
| Kalshi US$ 64,2 bi | DefiRate, dados das bolsas [21] | 4/set a 3/out/2026 | Valor de face (nocional) |
| Kalshi US$ 13,7 bi (30 dias); US$ 13,5 bi (set/2026) | API do DefiLlama [20] | até 3/out/2026 | Método não declarado; bate com dólares pagos [I] |
| Kalshi US$ 15,8 bi numa semana | Artemis, via Crypto Economy (`market-research.md`) | fim de set/2026 | Nocional [I]: 4 semanas dão cerca de 63 bi |
| Kalshi US$ 37,7 bi | Chain Grid News [33] | jul/2026 | "Notional trading volume"; o DefiLlama dá US$ 12,4 bi |
| Kalshi US$ 29,2 bi | Sacra (`market-research.md`) | jun/2026 | Estimativa de terceiro; o DefiLlama dá US$ 9,4 bi |
| Kalshi US$ 1,3 bi "no mês" | The Block, artigo 371287 (`competitor-longlist.md`) | set/2025 [I] | O artigo é de 2025; não é dado de 2026 |
| Polymarket US$ 4,7 bi + Polymarket US US$ 9,5 bi | DefiRate [21] | 4/set a 3/out/2026 | Nocional |
| Polymarket US$ 2,19 bi + Polymarket US US$ 2,41 bi | API do DefiLlama [20] | últimos 30 dias | Dólares pagos, um lado só |
| Polymarket US$ 4,63 bi | API do DefiLlama [20] | set/2026 | Dólares pagos, três braços somados |
| Polymarket US$ 10,3 bi | The Block via busca (`competitor-longlist.md`) | abr/2026 | Nocional ou contagem dupla [I]; o DefiLlama dá US$ 4,59 bi |
| Polymarket US$ 10,5 bi e US$ 8,9 bi | Sacra (`market-research.md`) | mar e mai/2026 | Idem; o DefiLlama dá US$ 5,09 bi e US$ 3,95 bi |
| Polymarket US$ 12,9 bi | Chain Grid News [33] | jul/2026 | Nocional; o DefiLlama dá US$ 5,70 bi |
| Polymarket US$ 773 mi "até meados de set" | The Block, artigo 371287 | set/2025 [I] | Dado de 2025 |

Por que diverge:

1. **Valor de face contra dólares pagos.** Em esportes e apostas combinadas compra-se muito contrato barato; o valor
   de face infla. Na Kalshi a razão é de cerca de 4,7 vezes (64,2 ÷ 13,7) [I].
2. **Contagem dupla na Polymarket.** [FS] A Paradigm mostrou em dez/2025 que somar os eventos "OrderFilled" conta cada
   negócio duas vezes; na época citou DefiLlama, Dune, Allium, Blockworks e Token Terminal [22]. [I] Os números
   atuais do DefiLlama (cerca de metade dos da The Block e da Sacra) indicam que ele passou a contar um lado só;
   não confirmei a data da correção.
3. **Datas trocadas.** Os números de "US$ 1,3 bi" e "US$ 773 mi" vêm de um artigo de setembro de 2025. A numeração
   do artigo fica entre uma matéria de mar/2025 (348171) e outra de out/2025 (375318) [I].

Recomendação [I]: no Business Plan, mostrar sempre as duas colunas e comparar o Baked Market só com "dólares pagos".
Ordem de grandeza segura para setembro de 2026: Kalshi cerca de US$ 13,5 bilhões e Polymarket cerca de US$ 4,6
bilhões em dólares pagos; Kalshi cerca de US$ 64 bilhões e Polymarket (dois braços) cerca de US$ 14 bilhões em
valor de face.

## 7. Tabela final: onde cada um é mais forte, onde é mais fraco, o que copiar

Tudo nesta tabela é [I], apoiado nos fatos dos capítulos.

| Concorrente | Mais forte que o Baked Market | Mais fraco que o Baked Market | O que podemos copiar |
|---|---|---|---|
| Melee | US$ 3,5 mi captados com Variant e o cofundador da Solana; mecanismo de pote com piso de retorno e saída antecipada já desenhados e publicados; fila de 49 mil; pontuação que prende o usuário antes do lançamento | Sem dinheiro real até hoje; resolução por pessoas; regra de preço difícil de explicar; taxa e token indefinidos; sem auditoria | Beta com pontuação e medalhas antes da rede principal; pré-venda com preço único para o pote não nascer vazio; mostrar na tela o "piso" que a pessoa recebe se acertar; códigos de comunidade |
| PNP Protocol | Criação em segundos por qualquer um; criador recebe 30% da taxa; kits prontos para robôs e agentes de IA; mercado sem capital inicial (Bubblegum) | Quase sem uso; resolução por modelo de linguagem; criador pode ser o próprio juiz; token caiu 93%; site mudou de produto; docs fora do ar | Kit de programação e "habilidade" para agentes desde cedo; checagem automática, na criação, de se a pergunta é resolvível; tipos de pergunta por modelo (token, TVL) |
| Polymarket | Marca, liquidez e US$ 4,6 bi por mês; sai-se a qualquer hora pelo livro; APIs, parceiros e indicação; US$ 1,6 bi da ICE; qualquer assunto do mundo | Resolução contestada e sem reembolso; Brasil só fecha posição; usuário não cria nem patrocina de verdade; não é Solana; processo em Nova York | Regra "o título descreve, as regras decidem"; indicação paga com parte da taxa; widgets para incorporar em sites; preço médio no tempo em vez de foto do instante; sugestão de pergunta pelo X (já está no plano) |
| World (Phantom) | Está dentro da carteira que o nosso público já usa; aposta com qualquer token, sem depósito; pagamento automático; resolução em minutos | Uma chave decide tudo; taxa não publicada e mais cara (até 5% do valor pago, mais margem); sem disputa; caiu 29,5 horas no lançamento; volume de só US$ 15 mi por mês | Zero depósito: assinar e pronto; pagamento automático ao vencedor, sem botão de resgate; pagar com qualquer token (SODAX cobre isso); publicar a taxa, já que eles não publicam |
| Limitless | Documentação exemplar; taxa, indicação e reembolso escritos; criação aberta com selo "Community"; US$ 17 mi captados; integração com assistentes de IA | Volume caiu 96% e token 94%; token não recebe taxa; cópia da Polymarket; resolução manual em parte; não é Solana | Política de reembolso por resolução errada, escrita; indicação por faixas com vínculo permanente; página de taxas com exemplo numérico; selo que separa pergunta da equipe e pergunta de terceiro |

## 8. Resposta: algum deles resolve por leitura direta de dado on-chain?

**INFERÊNCIA.** Não. Nenhum dos cinco resolve por leitura direta de conta on-chain, sem pessoa, sem votação e sem
serviço externo informando o resultado.

- **Polymarket**: votação de detentores de token (UMA). Nos mercados curtos de cripto usa preço médio entregue pelo
  Chainlink, que é automático, mas é preço de corretoras trazido de fora da rede.
- **World**: é o que mais se aproxima no discurso ("sem painel humano, sem voto"). Na rede, porém, o resultado é
  gravado por uma chave da empresa e a instrução não leva prova nenhuma. É automação fora da rede, não leitura on-chain.
- **Limitless**: oráculos de preço (Pyth, Chainlink), provedores esportivos e, em parte, a equipe.
- **PNP**: modelos de linguagem. Tem perguntas sobre números on-chain (TVL, preço de token), mas responde por API do
  DefiLlama mais modelo de linguagem.
- **Melee**: criador ou equipe.

Fora dos cinco, o mais próximo é o PancakeSwap Prediction (pote de preço em rodadas curtas, resolvido por oráculo de
preço). O agente 1A marcou a resolução dele como inferência; não verifiquei.

**É diferencial real ou só um nicho pequeno? As duas coisas, e convém separar.**

- **É diferencial real em confiança.** A queixa mais documentada do setor é a resolução: mais de 1.150 mercados em
  arbitragem na Polymarket só até maio de 2026, o caso de US$ 7 milhões sem reembolso, a chave única do World.
  "Ninguém decide, o programa lê a conta" responde exatamente a isso e dispensa caução, prazo de disputa e juiz.
- **É nicho em tamanho.** Segundo a Bernstein (via `market-research.md`), esportes eram 62% do volume do setor em
  abr/2026, e política e economia vêm em seguida. Nada disso é legível numa conta da Solana. Dentro de cripto, a
  maior parte é preço de Bitcoin e Ethereum em corretoras, que também não é dado on-chain. A fatia do volume atual
  que caberia na nossa regra: n/e, e certamente pequena.
- **O nicho coincide com o público.** Quem vive no pump.fun aposta em coisas que estão on-chain: se um token gradua,
  se passa de certo valor de mercado, quantos detentores tem, quanto um protocolo travou. Aí a regra é vantagem, não
  limite.
- **Não é escudo contra manipulação.** O caso dos US$ 8,2 milhões mostra que mercado resolvido por número pode ser
  empurrado por quem aposta. Token pequeno é mais fácil de empurrar que Bitcoin. Média no tempo e métricas difíceis
  de falsificar valem mais que a "leitura on-chain" em si.
- **Pode ser copiado.** O World já tem o encanamento automático; trocar a chave por leitura on-chain em perguntas de
  cripto é trabalho de engenharia, não uma barreira.

Conclusão: vender como "resolução que ninguém pode contestar" para o público web3, sem prometer o tamanho do mercado
da Polymarket.

## O que isto muda no plano

Tudo aqui é **INFERÊNCIA**. Nenhuma decisão do Lucas foi alterada; onde há atrito, está dito com motivo e alternativa.

1. **O rival mais parecido ainda não largou.** O Melee não tem dinheiro real. A janela existe, mas ele tem caixa,
   investidores de peso e fila de espera. Não usar os números do site dele como prova de demanda.
2. **O tamanho real em Solana é pequeno.** O World, com a Phantom inteira por trás, fez US$ 15,4 milhões em
   setembro de 2026; a previsão do Jupiter, US$ 5,5 milhões em 30 dias [20]. A 3% do pote, US$ 1 milhão por mês
   apostado rende US$ 30 mil. As projeções da Onda 2 devem partir dessa ordem de grandeza.
3. **Os 3% do pote não estão fora do mercado.** A taxa efetiva sobre dólares pagos é de 2,0% na Polymarket, 1,9% na
   Limitless e 2,5% a 5% na Phantom. Isto corrige a leitura de "cerca de 1%" do agente 1B, feita sobre valor de face.
   Diferença a explicar ao usuário: no pote paga-se uma vez; no livro paga-se a cada compra e venda.
4. **Patrocínio de pergunta não tem precedente entre os cinco.** É diferencial e é risco: não há preço de referência
   para as faixas de US$ 500, 1.500 e 5.000. O único "patrocínio" encontrado não dá nada ao patrocinador.
5. **Token de mercado de previsão tem histórico ruim.** LMTS caiu 94% e não repassa taxa; PNP caiu 93%; UMA caiu 99%.
   A recompra e queima com 25% da taxa é diferente do que eles fazem, mas o plano não deve contar com alta de preço
   para atrair usuários. A Polymarket adiou o próprio token por um ano.
6. **A saída antecipada com penalidade no pote é mais simples que a do Melee** e não depende de um cofre de terceiros
   ter saldo. Vale dizer isso na comparação.
7. **Equipe abrindo as perguntas no primeiro ciclo** é o que fazem Polymarket e World. Quem abriu criação para
   qualquer um (PNP, Limitless) não mostrou que isso traz volume.
8. **Perguntas de preço de token pequeno**, que o Lucas deixou em aberto: o caso dos mercados de 5 minutos é o
   argumento concreto para exigir média no tempo e tamanho mínimo do token. Fica para o agente 1H e para a Onda 2.
9. **Sem identificação e bloqueio geográfico "para o fim".** Todos os concorrentes sem identificação mantêm bloqueio
   por país, e a Polymarket põe o Brasil em "só fechar posição". Não opino sobre a lei; é ponto para advogado antes
   da rede principal, não depois.
10. **Copiar barato:** política de reembolso escrita, página de taxas com exemplo, pagamento automático, indicação
    com parte da taxa, beta com pontuação.

## Perguntas em aberto

1. Melee: percentual de taxa; "20%" de quê (volume ou taxas); quem resolve na versão PMM; data da rede principal;
   token. O beta em rede de teste vem de um fio de usuário, não de comunicado oficial.
2. PNP: o que é "a coin that trades Polymarket"; se o protocolo de mercados foi abandonado; divisão exata da taxa e
   regras da DAO (páginas com erro 404); volume; equipe; se há outros programas além do que medi.
3. World: tabela de taxas oficial; quem é a equipe e quem financia; lista de países; se a resolução passará a ser
   conferível on-chain; quanto do volume vem da Phantom e quanto do site.
4. Limitless: por que o volume saltou em maio de 2026 e desabou depois; se houve programa de pontos ou incentivo.
5. Polymarket: data do POLY; se a UMA será trocada (a central de ajuda fala em novo sistema de oráculo ainda em 2026);
   usuários ativos mensais atuais; se o DefiLlama corrigiu a contagem dupla e quando.
6. Kalshi no DefiLlama: o campo de método está vazio; a leitura "dólares pagos" é inferência minha.
7. Fatia do volume do setor que é resolvível por dado on-chain: n/e.
8. Reclamações diretas de usuários (Reddit, Trustpilot, Discord): não li nenhuma; as reclamações deste arquivo vêm
   de imprensa e de pesquisa independente.
9. PancakeSwap Prediction e Hyperliquid HIP-4 resolvem on-chain? Não verificado.

## Fontes

Consultadas em 4/out/2026, salvo data indicada.

1. Melee, site: https://www.melee.markets/
2. Melee, documento do PMM: https://pmm.melee.markets/litepaper e https://pmm.melee.markets/
3. Solana Compass, Melee (agregador): https://solanacompass.com/projects/melee-markets
4. SolanaFloor, 22/jul/2026:
   https://solanafloor.com/news/melee-markets-unveils-new-spin-on-prediction-markets-through-novel-pmm-model
5. PolyPunter, 16/abr/2026:
   https://polypunter.com/melee-markets-parimutuel-prediction-market-launch-tease-how-pmm-unlocks-permissionless-market-creation-at-scale/
6. MadeOnSol, avaliação do Melee (set/2026): https://madeonsol.com/tools/melee
7. KuCoin, republicação de fio do X, 9/set/2026: https://www.kucoin.com/news/insight/SOL/6aa0fb0b4ca39f00075ef386
8. Melee, documentação antiga: https://melee-1.gitbook.io/melee-docs/faq e
   https://melee-1.gitbook.io/melee-docs/how-does-it-work/market-structure
9. Alchemy, ficha do Melee: https://dapps.alchemy.com/dapps/melee-markets
10. PNP, documentação: https://docs.pnp.exchange , https://docs.pnp.exchange/core-features.md ,
    https://docs.pnp.exchange/llms.txt , https://docs.pnp.exchange/defillama
11. PNP, site: https://pnp.exchange
12. PNP, GitHub: https://github.com/pnp-protocol , https://github.com/pnp-protocol/solana-skill ,
    https://github.com/pnp-protocol/pnp-solana-toolkit/blob/main/skill.md
13. PNP, npm: https://npm.io/package/pnp-core (12/jul/2026) e https://www.npmjs.com/package/pnpfucius
14. Our Crypto Talk, 10/nov/2025: https://ourcryptotalk.com/news/pnp-exchange-migrates-to-pump-fun ; Phemex:
    https://phemex.com/news/article/pnp-exchange-migrates-pnp-token-to-pumpfun-for-prediction-market-expansion-34327
15. PANews, 3/set/2025: https://www.panews.io/articles/13d05652-a98d-4f7f-9017-7b39bdc045da ; Gate Learn, 29/mar/2026:
    https://www.gate.com/learn/articles/if-polymarket-doesn-t-launch-a-token-what-else-can-prediction-markets-speculate-on/11846
16. LBank, ficha do token PNP: https://www.lbank.com/tokens/pnp-exchange
17. DexScreener, API: https://api.dexscreener.com/latest/dex/tokens/UVcu7kbVKW6Rs5PKzuwVSbm8ukvrWByS3hBXqHapump
18. RPC público da Solana (https://api.mainnet-beta.solana.com): `getSignaturesForAddress` do programa
    `8PyE2dizL52ga7ytqLtqRyjwWp4yXEx8M5Z4BAHgHuTb`, `getTokenSupply` e `getAccountInfo`
19. Polymarket, documentação e central de ajuda, lidas em 3/out/2026: `knowledge-base/referencias/polymarket-docs.md`
    e `knowledge-base/referencias/polymarket-help.md` (URLs página a página nesses arquivos)
20. DefiLlama, API pública: https://api.llama.fi/summary/dexs/polymarket , `/summary/fees/polymarket` ,
    `/summary/dexs/kalshi` , `/summary/dexs/limitless-exchange` , `/summary/fees/limitless-exchange` ,
    `/summary/dexs/world` , `/protocol/world` , `/overview/dexs`
21. DefiRate, volume: https://defirate.com/prediction-markets/volume/ (atualizada em 3/out/2026, 21h30 de Nova York)
22. Paradigm, dez/2025: https://www.paradigm.xyz/2025/12/polymarket-volume-is-being-double-counted
23. CoinDesk, 27/mar/2025:
    https://www.coindesk.com/markets/2025/03/27/polymarket-uma-communities-lock-horns-after-usd7m-ukraine-bet-resolves ;
    Cointelegraph, 26/mar/2025: https://cointelegraph.com/news/polymarket-trump-ukraine-bet-whale-governance-attack ;
    Decrypt, 26/mar/2025: https://decrypt.co/311634/polymarket-allegations-oracle-manipulation
24. Finance Magnates, 18/mai/2026 (resume análise do Wall Street Journal):
    https://www.financemagnates.com/fintech/polymarkets-arbitration-model-faces-conflict-of-interest-questions/
25. CoinDesk, 7/ago/2026:
    https://www.coindesk.com/business/2026/08/07/how-a-five-second-trick-let-traders-drain-millions-from-polymarket
26. NBC News, 24/abr/2026: https://www.nbcnews.com/business/markets/polymarket-regulators-insider-trading-rcna341928 ;
    CBS News, 24/mar/2026: https://www.cbsnews.com/news/polymarket-insider-trading-rules-iran-war-venezuela/ ;
    New York Times, 13/mai/2026: https://www.nytimes.com/2026/05/13/technology/polymarket-insider-trading.html
27. Procuradoria-Geral de Nova York, 24/set/2026:
    https://ag.ny.gov/press-release/2026/attorney-general-james-and-governor-hochul-announce-lawsuit-against-polymarket
28. BeInCrypto, 24/out/2025: https://beincrypto.com/polymarket-poly-token-airdrop-launch/ ; CoinCodex, 24/out/2025:
    https://coincodex.com/article/75306/polymarket-eyes-15b-valuation-in-new-funding-round-as-cmo-confirms-token-launch-plans/ ;
    Prediction Reporting, 27/fev/2026: https://predictionreporting.com/p/polymarket-air-drop-on-the-horizon ;
    Coin360, 27/mar/2026: https://coin360.com/news/ice-polymarket-1-6b-investment-prediction-markets-regulation ;
    Sandmark, 2/abr/2026:
    https://www.sandmark.com/news/analysis/zero-revenue-token-economy-polymarkets-valuation-question
29. CoinGecko, API: https://api.coingecko.com/api/v3/coins/limitless-3 e https://api.coingecko.com/api/v3/coins/uma
30. Chainstack Labs, pesquisa independente (verificada em 11/set/2026):
    https://github.com/chainstacklabs/world-xyz-research
31. Phantom, central de ajuda: https://help.phantom.com/articles/47187740851731 (mercados de previsão e taxa),
    https://help.phantom.com/articles/48634486197651 (disponibilidade por região),
    https://help.phantom.com/articles/44799497237395 (conta Cash); avisos legais:
    https://phantom.com/prediction-market-disclosures
32. BlockBeats, 11/set/2026: https://en.theblockbeats.news/news/63681 ; KuCoin, 11/set/2026:
    https://www.kucoin.com/news/flash/world-xyz-review-smooth-trading-but-users-gamble-with-market-makers ;
    Woofun, 11/set/2026: https://www.woofun.ai/en/news/detail/107608
33. Chain Grid News, 10/set/2026:
    https://chaingridnews.com/2026/09/10/world-opens-solana-prediction-market-to-1m-users/ ;
    FinanceFeeds:
    https://financefeeds.com/world-opened-its-solana-prediction-market-to-1-million-waitlisted-users-and-it-settles-in-phantoms-stablecoin/ ;
    Chainlink Today, 14/set/2026:
    https://chainlinktoday.com/chainlink-powered-world-prediction-markets-officially-launch-on-solana/
34. Limitless, documentação: https://docs.limitless.exchange/llms.txt e, em `/user-guide/`, as páginas
    `wallet-types.md`, `making-your-first-trade.md`, `referral-program.md`, `refund-policy.md`, `security.md`,
    `embed-markets.md`, `user-generated-markets.md`, `lp-rewards.md`; páginas de taxas, resolução e termos lidas em
    3/out/2026 (ver `mercados-de-previsao-web3.md`)
35. Chainwire, 20/out/2025:
    https://chainwire.org/2025/10/20/limitless-prediction-market-closes-10m-seed-round-ahead-of-lmts-token-launch/ ;
    Coinbase Ventures, notícias (1/jul/2025): https://www.coinbase.com/ventures/news
36. Pesquisas internas reaproveitadas: `knowledge-base/competitors/competitor-longlist.md`,
    `knowledge-base/competitors/mercados-de-previsao-web3.md`, `knowledge-base/market/market-research.md`,
    `knowledge-base/market/receita-mercados-de-previsao.md`
