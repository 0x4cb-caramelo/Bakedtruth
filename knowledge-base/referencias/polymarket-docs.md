# Polymarket: documentação oficial (docs.polymarket.com)

Data da leitura: 3 de outubro de 2026.

Escopo: as 83 páginas listadas em llms.txt foram todas abertas uma a uma (Predictions, Perps e changelogs), mais
2 páginas de referência de API achadas por busca e ausentes do llms.txt (geoblock e rate-limits), mais 3 páginas
da central de ajuda (help.polymarket.com) e a página de Termos de Uso (polymarket.com/tos, só a casca foi lida).
Total: 85 páginas de docs.polymarket.com + 4 de fora do domínio. O sitemap.xml tem 1.055 URLs (~583 em inglês e
~472 em chinês); as páginas de endpoint individuais da referência de API (centenas) NÃO foram abertas uma a uma,
só resumidas por grupo a partir das páginas de conceito. Ver "Não lido".

Aviso de método: as páginas foram lidas por uma ferramenta que devolve um resumo gerado por modelo, não o texto
integral. Os números abaixo vêm desses resumos. Quem for usar um número para decidir deve conferir na URL citada.
O que não estava nos resumos está marcado como "não confirmado" e nunca foi preenchido de memória.

## Resumo em dez linhas

1. Polymarket é um mercado de previsão em Polygon: livro de ordens central (CLOB) híbrido, casamento off-chain e
   liquidação on-chain.
2. Cada mercado é uma pergunta Sim/Não; tokens de resultado são ERC-1155 (Gnosis CTF), 1 par = 1 pUSD de colateral.
3. O colateral é pUSD, um wrapper ERC-20 de USDC.e, desde 28/04/2026 (CLOB V2).
4. Usuários comuns não criam mercados: o time de mercados da Polymarket cria, aceitando sugestões.
5. Resolução pela UMA Optimistic Oracle: proposta com bond (~US$ 750), 2 h de desafio, votação UMA se disputada.
6. Só o taker paga taxa: taxa = C x taxa x p x (1 - p), de 0 (geopolítica) a 0,07 (cripto).
7. Quem fornece liquidez recebe rebates diários (parte das taxas dos takers) e recompensas de liquidez.
8. Takers recebem rebate por tier de volume (3% a 50%); há programa de indicação (10% / 5%) e de builders.
9. Depósito e saque não têm taxa da Polymarket; aceita 14 redes, incluindo Solana.
10. Bloqueio geográfico em três níveis (7 jurisdições totais, ~37 só fechar posição); a doc cita KYC só p/ co-location.
Extras: APIs públicas (Gamma, CLOB, Data, Relayer, WebSockets), SDKs TS/Python, e uma linha de perpétuos (Perps).

## 1. Quem cria os mercados e como

- Fato (fonte secundária, central de ajuda):
  "Markets are created by the markets team with input from users and the community." Usuários não criam mercados
  diretamente, mas podem sugerir. Para aumentar a chance, a sugestão deve ter título, fonte de resolução e evidência
  de demanda. Canal indicado: marcar @polymarket no X/Twitter.
  URL: https://help.polymarket.com/en/articles/13364541-how-are-markets-created
- Fato: a página inicial da documentação não descreve criação de mercados nem processo de proposta
  (https://docs.polymarket.com/index.md). Não há página de docs sobre critérios de aprovação.
- Fato: a UMA é a fonte de resolução suportada, mas a Polymarket se diz agnóstica quanto ao oráculo (resultado de
  busca, não confirmado na página lida). URL: https://docs.polymarket.com/concepts/resolution.md
- Não confirmado: critérios internos de aprovação, prazos, custos de criação.

## 2. Estrutura de um mercado

URL: https://docs.polymarket.com/concepts/markets-events.md e https://docs.polymarket.com/llms-full.txt
- Mercado: unidade negociável, pergunta binária Sim/Não. Tem Condition ID, Question ID e dois Token IDs.
- Evento: contêiner de um ou mais mercados. Evento de mercado único = par Sim/Não. Evento de múltiplos mercados =
  resultados mutuamente exclusivos (ex.: um mercado por candidato).
- O mercado só negocia no CLOB se `enableOrderBook` for `true`. Cada mercado/evento tem um slug único na URL.
- Mercados esportivos: ordens abertas são canceladas automaticamente quando o jogo começa.
- Risco negativo (negative risk): em evento multi-resultado com um só vencedor, "a No share in any market converts
  into 1 Yes share in every other market". O contrato Neg Risk Adapter faz a conversão de forma atômica, liberando
  capital. Há "augmented negative risk" com resultados nomeados, vagas reservadas e uma categoria "Other".
  Aviso oficial: negociar só resultados nomeados; ignorar vagas até serem nomeadas ou até a resolução.
  URL: https://docs.polymarket.com/concepts/negative-risk.md (via llms-full)
- Tokens: ERC-1155 em Polygon, Gnosis Conditional Token Framework. Cada par Sim/Não corresponde a exatamente
  1 pUSD. Operações: split (1 pUSD -> 1 Sim + 1 Não), merge (inverso), trade e redeem (1 por token vencedor).
  Não há prazo para resgatar. URLs: https://docs.polymarket.com/concepts/positions-tokens.md e
  https://docs.polymarket.com/trading/positions/manage.md
- Colateral pUSD: ERC-20, 6 casas decimais, Polygon, lastreado em USDC (sem peg algorítmico nem reserva
  fracionária). Embrulha USDC.e via contrato CollateralOnramp (`wrap()`) e desembrulha via CollateralOfframp
  (`unwrap()`). Sem planos de listagem externa. URL: https://docs.polymarket.com/concepts/pusd.md
- Combos: posições multi-perna que combinam resultados de vários mercados, cotadas por RFQ (market makers têm
  400 ms para cotar, o usuário 10 s para aceitar, "last look" de 1 s). URL:
  https://docs.polymarket.com/trading/combos/overview.md

## 3. Como se negocia

URLs: https://docs.polymarket.com/concepts/prices-orderbook.md, .../concepts/order-lifecycle.md,
.../trading/place-orders.md, .../trading/overview.md
- Preço entre US$ 0,00 e US$ 1,00 = probabilidade implícita. Preço exibido = ponto médio (maior bid + menor ask)/2;
  se o spread passar de US$ 0,10 mostra o último preço negociado.
- CLOB "híbrido-descentralizado": operador casa as ordens off-chain; o contrato Exchange liquida on-chain. O operador
  "can match orders and enforce their ordering, but cannot set prices or execute trades that users did not authorize".
- Toda ordem é limite, assinada em EIP-712 (o usuário mantém custódia). Tipos: GTC, GTD, FOK, FAK, post-only.
  "Ordens a mercado" são FOK/FAK. GTD expira 1 minuto antes do declarado; vida mínima efetiva ~2 minutos.
- Formação de preço: ordens complementares casam; comprar Sim a 0,60 e Não a 0,40 soma 1,00 e cria os dois tokens.
- Atraso de matching ("taker delay"): a página de ciclo de vida da ordem diz 250 ms em cripto/finanças; esporte tem
  atraso configurado por mercado (duração não informada). O changelog explica a diferença: 250 ms até 17/08/2026,
  50 ms desde 17/08/2026 e 150 ms desde 04/09/2026 (cripto). A página de conceito está desatualizada em relação ao
  changelog; vale o changelog. URLs: .../concepts/order-lifecycle.md e .../changelog/predictions.md
- Estados da negociação: MATCHED, MINED, CONFIRMED (final), RETRYING, FAILED (final).
- Sair antes da resolução: vender os tokens no livro a qualquer momento; ou fazer merge de Sim+Não iguais de volta
  em pUSD. Cancelar ordem é possível, exceto durante janela de atraso; preenchimento parcial só cancela o saldo.
- Limites: `postOrders` aceita 1 a 15 ordens por chamada; cancelamento em lote: DIVERGÊNCIA DA PRÓPRIA FONTE,
  trading/manage-orders diz até 3.000 IDs e o changelog de 15/06/2026 diz máximo de 1.000 (não resolvida);
  heartbeat a cada
  5 s (se não houver heartbeat em 10 s, todas as ordens abertas são canceladas). Cada mercado define `min_order_size`
  e `tick_size` (valores universais não informados). Reinício do motor: erro 425, depois 2 minutos só post-only;
  aviso típico de ~2 dias. URLs: .../trading/manage-orders.md, .../trading/matching-engine.md
- Maker = ordem que repousa; taker = ordem que casa na hora.

## 4. Resolução

URL: https://docs.polymarket.com/concepts/resolution.md
- Oráculo: UMA Optimistic Oracle ("anyone can propose an outcome, and anyone can dispute it").
- Proposta: proponente escolhe o resultado e deposita bond, tipicamente US$ 750 em pUSD.
- Desafio: janela de 2 horas. Sem disputa, aceita. Com disputa, nova proposta com contra-bond; se a segunda proposta
  também for disputada, escala para votação dos detentores do token UMA (~48 horas).
- Bonds: quem vence recupera o bond mais metade do bond do perdedor. Caso "too early" (proposta precoce):
  disputante vence. Resultado 50/50 (raro): paga US$ 0,50 por token.
- Prazos: sem disputa ~2 h; disputado uma vez 4 a 6 dias.
- Após resolver, a negociação para; vencedores resgatam US$ 1,00; perdedores valem zero. Podem sair esclarecimentos
  depois do lançamento, sem mudar a intenção da pergunta.
- Aviso oficial: o título descreve a pergunta, mas as "rules" definem como resolve.
- Mercados de cripto curtos: resolução por TWAP Chainlink de 60 s (changelog, 14/08/2026).
- Central de ajuda: qualquer um propõe com bond de US$ 750 (em USDC.e, texto antigo); proposta correta recebe uma
  recompensa; proposta precoce ou errada perde todo o bond. Após disputa há debate de 24 a 48 h no Discord da UMA e
  depois voto de ~48 h. "Once finalized by UMA, outcomes are immutable": a Polymarket não reverte resolução.
  URLs: https://help.polymarket.com/en/articles/13364518-how-are-prediction-markets-resolved e
  https://help.polymarket.com/en/articles/13364551-how-are-markets-disputed
- Risco negativo: se o vencedor não tiver nome na resolução, o mercado liquida em "Other". Exemplo oficial: 1 Não em
  "Other" converte em 1 Sim em "Trump" e 1 Sim em "Harris".
- Preço inicial: mercados novos nascem sem preço; o primeiro surge quando ordens complementares casam.
- Não confirmado: política de quem pode propor; regras de resolução antecipada além do caso "too early".

## 5. Taxas

URL: https://docs.polymarket.com/trading/fees.md
- Fórmula: `fee = C x feeRate x p x (1 - p)` (C = ações, p = preço). Só o taker paga; maker nunca paga.
- Taxa do taker por categoria: Cripto 0,07; Esportes 0,05; Finanças 0,04; Política 0,04; Economia 0,05;
  Cultura 0,05; Clima 0,05; Outros 0,05; Menções 0,04; Tech 0,04; Geopolítica 0 (sem taxa).
- A taxa é máxima em 50% e cai simetricamente nos extremos. Arredondada em 5 casas; mínimo 0,00001 USDC.
- Sem taxa de depósito ou saque da Polymarket; saque "instant and free" (swap via Uniswap v3, variação < 10 pontos
  base na UI). URLs: .../trading/bridge/withdraw.md e .../trading/bridge/deposit.md
- Taxas de builder se somam às da plataforma: teto 100 pb (1%) taker e 50 pb (0,5%) maker, granularidade 1 pb, uma
  mudança a cada 7 dias com vigência após 3 dias. URL: https://docs.polymarket.com/programs/builders/fees.md
- Perps: taxa = |preço x quantidade| x taxa; tier por volume de 30 dias, taker 0,0400% a 0,0200%, maker 0,0125% a
  -0,0050% (rebate). URL: https://docs.polymarket.com/perps/learn-about-trading/fees.md
- Histórico (changelog): taxas ligadas em cripto de 15 min em 05/01/2026; categorias novas em 30/03/2026; esportes
  de 0,03 para 0,05 e rebate de maker de 25% para 15% em 10/07/2026.
  URL: https://docs.polymarket.com/changelog/predictions.md

## 6. Incentivos

- Rendimento sobre posições: 4,00% ao ano, amostrado por hora, pago por dia, em posições elegíveis.
  URL: https://docs.polymarket.com/concepts/positions-tokens.md
- Recompensas de liquidez: ordens limite repousando; pontuação quadrática (spread menor vs. ponto médio, profundidade
  dos dois lados, tamanho). Ordem de um lado só rende dividida por 3,0 se o meio estiver entre 0,10 e 0,90. Cada
  mercado define spread máximo, tamanho mínimo e orçamento. Amostra por minuto (1.440/dia), pagamento diário às
  00:00 UTC, mínimo US$ 1. Programa especial de US$ 1 M para TWAP de cripto já terminou.
  URL: https://docs.polymarket.com/programs/liquidity-rewards.md
- Rebate de maker: pago diário em pUSD, mínimo US$ 1, proporcional à "fee-equivalent" dentro da categoria.
  Percentual das taxas dos takers devolvido, por categoria (as duas páginas, maker-rebates e trading/fees, trazem a
  mesma tabela): cripto 20%; esportes 15%; finanças, política, economia, cultura, clima, outros, menções e tech 25%;
  geopolítica sem taxa e sem rebate. "At the sole discretion of Polymarket and may change." Divergência anterior
  (15-25% vs 20-25%) era imprecisão de resumo: a tabela real tem 15, 20 e 25.
  URLs: https://docs.polymarket.com/programs/maker-rebates.md e https://docs.polymarket.com/trading/fees.md
- Perps: recompensas de liquidez de US$ 75.000 por dia divididos entre mercados; indicação paga 20% das taxas
  dos indicados, sem teto por trader, pagamento semanal (10 convites no início, até 500 com US$ 1 M de volume).
  URLs: https://docs.polymarket.com/perps/liquidity-rewards.md e .../perps/referral-program.md
- Rebate de taker (lançado em 28/05/2026): tier por volume ponderado de 30 dias,
  wV = tamanho x (1 - preço de entrada) x peso da categoria. Pesos: esportes 1,0; política/finanças/tech/menções 1,3;
  economia/cultura/clima/outros 1,7; cripto 2,3; geopolítica 0.
  Tiers (wV; rebate; bônus): Bronze 2 mil (3%; US$ 10), Silver 20 mil (8%; 50), Gold 200 mil (18%; 250),
  Platinum 1 M (32%; 1.500), Diamond 4 M (44%; 7.500), Obsidian 10 M (50%; 25.000). Pago às 00:00 UTC.
  URL: https://docs.polymarket.com/programs/taker-rebates.md
- Indicação: exige US$ 10.000 de volume vitalício; 10% das taxas líquidas de indicados diretos e 5% de indiretos;
  termina quando o indicado atinge Platinum ou 30 dias após o cadastro; sem rewards em mercados sem taxa.
  URL: https://docs.polymarket.com/programs/referral-program.md
- Builders: construtor roteia ordens de usuários, código atrelado à ordem assinada. Benefícios: operações on-chain
  sem gás via relayer, atribuição de volume, leaderboard, suporte. Tiers: Unverified 100 transações de relayer/dia;
  Verified 10.000/dia (aprovação por e-mail, recompensas semanais em USDC "sujeitas a aprovação", taxas de builder);
  Partner ilimitado. Valores de grants não informados.
  URLs: https://docs.polymarket.com/programs/builders/overview.md e .../programs/builders/tiers.md
- Não existe incentivo documentado para criadores de mercado (mercados são criados pela Polymarket).

## 7. Carteiras e custódia

URLs: https://docs.polymarket.com/trading/wallets-auth.md, .../trading/session-keys.md
- Três tipos de smart wallet em Polygon: Deposit Wallet (padrão; contas criadas a partir de 04/05/2026), Proxy
  (legado, login Magic/Google) e Safe (legado, MetaMask/Rabby). Tudo isso permite operações em lote relayeadas.
- Autenticação CLOB: L1 = assinatura EIP-712 do signatário; L2 = chave API/segredo/passphrase com HMAC-SHA256 e cinco
  headers (`POLY_ADDRESS`, `POLY_SIGNATURE`, `POLY_TIMESTAMP`, `POLY_API_KEY`, `POLY_PASSPHRASE`).
- Session Keys: signatários separados para trading, sem acesso a fundos, escopo CLOB/Combos/All, validade fixa de
  180 dias, revogáveis.
- Depósito: via Bridge API, 14 redes (inclui Ethereum, Polygon, Arbitrum, Base, Optimism, BNB, Solana, Bitcoin, Tron),
  conversão automática para pUSD. Mínimos: L2 US$ 2, Ethereum US$ 7, Bitcoin e Tron US$ 9. Acima de US$ 50 mil
  vindos de fora da Polygon, recomendam bridges externas. Saque aceita EVM, Solana, Bitcoin, Tron.
  URLs: .../trading/bridge/supported-assets.md
- Contratos auditados por Quantstamp e Cantina (afirmação da página de contratos):
  https://docs.polymarket.com/resources/contracts.md

## 8. Restrições

URL principal: https://docs.polymarket.com/api-reference/geoblock (fora do llms.txt; achada por busca).
- Endpoint de checagem: `GET https://polymarket.com/api/geoblock` (no site, não nos servidores de API); devolve se está
  bloqueado, IP detectado, país e região. Servidores principais em eu-west-2.
- Bloqueio total (sem novas ordens nem fechar posição), 7: Irã, Síria, Cuba, Coreia do Norte, Crimeia, Donetsk,
  Luhansk.
- Só fechar posição, front-end e API (37 entradas): Austrália, Belarus, Bélgica, Burundi, Brasil, Canadá (Colúmbia
  Britânica, Ontário, Alberta, Quebec), Rep. Centro-Africana, Congo (Kinshasa), Etiópia, França, Alemanha, Iraque,
  Itália, Líbano, Líbia, Mianmar, Nova Zelândia, Nicarágua, Coreia do Norte, Polônia, Rússia, Singapura, Somália,
  Eslováquia, Sudão do Sul, Sudão, Taiwan, Tailândia, Reino Unido, Estados Unidos, Ilhas Menores dos EUA,
  Venezuela, Iêmen, Zimbábue. O BRASIL consta nesta lista (relevante para o fundador).
- Só fechar posição no front-end (API livre): Irlanda, Japão, Malta (só esportes), Países Baixos, Coreia do Sul.
- Motivos declarados: sanções, regulação financeira local, leis de jogo/mercado de previsão, AML e KYC.
- Perps: ordens bloqueadas de EUA, Canadá, Cuba, Irã, Coreia do Norte, Síria, Crimeia, Donetsk e Luhansk; builders
  são responsáveis por verificar a localização do usuário. (https://docs.polymarket.com/perps/faq.md)
- KYC: a documentação só menciona o formulário KYC/KYB como condição para co-location em eu-west-2 (para market
  makers e traders próprios, não para builders). Nenhuma página de docs exige KYC para negociar. Um resultado de busca
  (não confirmado numa página lida) diz que há verificação de identidade em toda conta.
- Termos de uso: https://polymarket.com/tos só devolveu a casca ("Trading is blocked in the United States on
  polymarket.com", com remissão a polymarket.us). O texto dos termos NÃO foi lido. Resultado de busca cita proibição
  de insider trading, manipulação, wash trading, spoofing, self-dealing e front-running (não confirmado na fonte).
- Fato: erro 400 em ordens cita contas "banned/restricted" (https://docs.polymarket.com/resources/error-codes.md).

## 9. Superfícies para desenvolvedores

URLs: https://docs.polymarket.com/getting-started/api.md e .../getting-started/sdks-apis.md
- REST: Gamma `gamma-api.polymarket.com` (eventos, mercados, séries, tags, busca; paginação por cursor, público),
  CLOB `clob.polymarket.com` (livros, preços, ordens), Data `data-api.polymarket.com` (posições, analytics),
  Relayer `relayer-v2.polymarket.com`.
- WebSocket: canal de mercado e de usuário do CLOB, RTDS, esportes; PolyBolt (preços cripto/ações, TWAP; requer
  credenciais). Ping/pong; esportes: ping do servidor a cada 5 s.
- SDKs: `@polymarket/client` (TypeScript) e `polymarket-client` (Python); SDK Rust unificado em desenvolvimento.
- Limites: livros/preços/spreads em lote até 500 itens; histórico de preços com janela máxima de 15 dias por consulta;
  retenção: 1 min >= 7 dias, 5 min >= 60, 30 min >= 90, 3 h e 12 h permanente. Respostas 429 pedem backoff
  exponencial (limites detalhados logo abaixo).
- Analytics: trades recentes, open interest, maiores detentores, leaderboards de traders e builders.
  URL: https://docs.polymarket.com/market-data/public-analytics.md
- Rate limits (https://docs.polymarket.com/api-reference/rate-limits): por IP via Cloudflare, que atrasa em vez de
  rejeitar. Gamma 4.000 req/10 s (`/markets` 300, `/events` 500); Data v1 1.000, v2 800 (`/trades` 300); CLOB 9.000
  req/10 s; ordens: rajada 5.000/10 s e sustentado 120.000/10 min em `POST /order`; limites de token-bucket por
  signatário; Bridge 50 req/10 s.
- Outros: Data API v1 será desligada em 24/10/2026 (v2 usa cursores e `snake_case`); SDK unificado substitui
  clientes antigos (`@polymarket/clob-client-v2` etc.); Python tem cliente síncrono e assíncrono; notificações ficam
  48 h no CLOB; `GET /v2/positions` filtra por OPEN, REDEEMABLE, REDEEMABLE_LOST, MERGEABLE, CLOSED. Guia rápido:
  conta existente e mínimo 10 pUSD. Dados on-chain de terceiros: Goldsky, Dune, Allium.
  URLs: .../migrate/data-api-v1-to-v2.md, .../migrate/clob-sdk-to-unified-sdk.md, .../trading/quickstart.md,
  .../trading/wallet-activity.md, .../resources/blockchain-data.md, .../getting-started/typescript.md e python.md
- Bridge: cotação mostra taxas (exemplo: app 0,3%, fill 0,1%); status em seis estados, polling a cada 10-30 s.
  URLs: .../trading/bridge/quote.md e .../trading/bridge/status.md
- Combos: 2 a 50 pernas por pedido, 15 pedidos por minuto por maker_address, janela de aceite de 5 s; EOA não é
  aceita (só Deposit, Proxy e Safe); makers que rejeitam mais de 15% das cotações podem ser pausados; posição
  combinatória é um par Sim/Não colateralizado que só paga Sim se todas as pernas acertarem; "collateral return"
  junta posições opostas de volta em pUSD. URLs: .../trading/combos/requesters.md, .../market-makers.md,
  .../builders.md, .../collateral-return.md, .../trading/positions/combinatorial.md
- Perps (perpétuos, produto separado): off-chain para matching, custódia e depósito/saque na Polygon, raiz de estado
  publicada on-chain. Alavancagem até 20x (cripto, SP500, petróleo, ouro, prata) e 10x (ativos reais); mínimo de
  depósito 10 pUSD; 200 ordens abertas por conta; taker 0,04% a 0,02%, maker 0,0125% a -0,005%. Mark price = mediana
  de 3 sinais a cada 200 ms; funding amostrado a cada 5 s, teto de ±4% por hora; liquidação em duas etapas
  (fundo de seguro e auto-deleveraging); sessões de mercado; prevenção de autonegociação. Conta identificada por EOA.
  URLs: https://docs.polymarket.com/perps/overview.md e demais páginas perps/* listadas em Fontes.

## Não lido

Nenhuma página falhou (sem 403, 404 ou 429). Lacunas reais:
- Páginas de endpoint individuais da referência de API: o sitemap.xml tem 1.055 URLs (~583 em inglês, ~472 em
  chinês), contra 83 no llms.txt. As centenas de páginas de endpoint (e a tradução /cn/) não foram abertas uma a uma.
  Foram abertas só as de conceito e as de geoblock e rate-limits. Não há erro: é cobertura não feita.
- Texto dos Termos de Uso: https://polymarket.com/tos devolveu só a casca da página, sem as cláusulas.
- Docs legados (legacy-docs.polymarket.com) e páginas de integridade/transparência
  (polymarket.com/transparency, integrity.polymarket.com) apareceram em buscas e não foram lidas.
- Critérios internos de aprovação de mercados: a documentação não trata do tema (confirmado nas páginas lidas).

## O que isto sugere para o nosso produto (inferência minha, não fato)

- O fundador pode usar o contraste: Polymarket tem curadoria central dos mercados; criação aberta é diferencial, mas
  traz risco de perguntas ambíguas. Resolução on-chain evita o prazo de 2 h a 6 dias e a disputa da UMA.
- A Polymarket depende de livro de ordens com market makers pagos por rebates e recompensas. Um modelo de pote não
  precisa disso, mas perde a saída antecipada por venda no livro, que é central lá.
- A receita deles vem da taxa do taker, maior perto de 50%. A fórmula p x (1 - p) é um modelo possível de taxa.
- Programas de indicação e builders (10%/5%, teto de 1% de taxa de builder) são referência para crescimento.
- Antes de decidir sobre KYC e bloqueio geográfico, ler fontes jurídicas; esta documentação não resolve isso.
  Observação: o Brasil está na lista de "só fechar posição", o que importa para um produto sem KYC e com carteira.
- A Polymarket usa um oráculo externo (UMA) com disputa e bond; "leitura on-chain" elimina bond, janela de desafio
  e risco de resolução contestada, mas exige que toda pergunta seja mensurável em conta on-chain.
- Taxas de rebate de 15% a 25% das taxas de taker e recompensas de liquidez mostram que o livro de ordens precisa
  de subsídio a market makers; num modelo de pote isso some, mas a profundidade e a saída antecipada também.

## Fontes

Domínio https://docs.polymarket.com/ (todas lidas; as 83 do llms.txt têm sufixo .md; também sitemap.xml):
index, polymarket-101, getting-started/{sdks-apis, typescript, python, api};
concepts/{markets-events, negative-risk, prices-orderbook, positions-tokens, pusd, order-lifecycle, resolution};
market-data/{overview, discover-markets, market-details, prices-order-books, public-analytics, realtime-data};
trading/{overview, quickstart, wallets-auth, session-keys, place-orders, manage-orders, realtime-order-updates,
wallet-activity, fees, market-making, matching-engine}; trading/positions/{how-positions-work, manage,
combinatorial}; trading/combos/{overview, requesters, market-makers, builders, collateral-return};
trading/bridge/{deposit, supported-assets, quote, withdraw, status};
programs/{taker-rebates, maker-rebates, liquidity-rewards, referral-program};
programs/builders/{overview, fees, tiers}; migrate/{data-api-v1-to-v2, clob-sdk-to-unified-sdk};
resources/{contracts, blockchain-data, error-codes};
perps/{overview, concepts, place-your-first-trade, market-data, fund-your-account, authenticated-sessions, trading,
account-management, realtime-updates, notifications, liquidity-rewards, referral-program, errors, faq};
perps/learn-about-trading/{overview, architecture, markets, fees, margin, self-trade-prevention,
liquidation-mechanics, funding, mark-price, index-price, market-sessions};
changelog/{predictions, perps, sdks};
fora do llms.txt: api-reference/geoblock, api-reference/rate-limits.
Fora do domínio de docs: https://help.polymarket.com/en/articles/13364541-how-are-markets-created,
https://help.polymarket.com/en/articles/13364551-how-are-markets-disputed,
https://help.polymarket.com/en/articles/13364518-how-are-prediction-markets-resolved,
https://polymarket.com/tos (só a casca).
