# Lista longa de concorrentes: mercados de previsão (Onda 1, agente 1A)

Data: 4 de outubro de 2026

Convenção: **[F]** fato com fonte, **[I]** inferência, **[S]** suposição, **[?]** pergunta em aberto. "n/e" = não
encontrado. Um preço, número ou concorrente sem fonte fica em [?], nunca como [F].

Limites do método (leia antes de usar os números):
- As páginas foram lidas por ferramenta que resume o conteúdo; as buscas devolvem resumos, não a página original.
  Números de busca (marcados "busca") não foram conferidos na fonte primária.
- Não consegui ler `docs/business/_review/plano-das-ondas.md` (seção A/B) nem a seção 1 de
  `ideacao-perguntas-e-respostas.md`: a leitura devolveu só a linha 1 (problema de leitura truncada já anotado na
  memória do projeto). Usei o perfil do enunciado da tarefa. [?] Rever se a seção A impõe formato ou regra de hook que
  eu não segui.
- Este arquivo reaproveita e corrige `mercados-de-previsao-web3.md` (3 de outubro) sem repetir a análise de Melee,
  World e Limitless; ver "Correções" abaixo.

## Perfil do Baked Market usado como régua (do enunciado)

Solana; pote por pergunta; a equipe abre as perguntas; patrocinador pago; resolução por dado on-chain; sem KYC; público
web3 e do pump.fun.

## Lista longa (20 itens)

Colunas: cadeia/jurisdição | mecanismo | quem abre perguntas | como resolve | identificação (KYC) | token | escala (data,
fonte) | ativo?

| # | Projeto | Cadeia/jurisdição | Mecanismo | Quem abre | Resolução | KYC | Token | Escala (data, fonte) | Ativo? |
|---|---------|-------------------|-----------|-----------|-----------|-----|-------|----------------------|--------|
| 1 | Polymarket | Polygon (global) e app EUA regulado (CFTC, via QCEX, US$ 112 mi) | Livro de ordens | A empresa (curadoria) [I] | UMA, oráculo otimista com disputa [?] sem fonte lida | Global: carteira; EUA: sim | POLY confirmado pelo CMO, ainda não lançado até a fonte [S2] | US$ 10,3 bi e 678.342 usuários em abr/2026 (busca) [S2]; US$ 773 mi no mês até meados de set (busca, conflita) [S3] | Sim |
| 2 | Kalshi | EUA, regulada pela CFTC | Livro de ordens, contratos de evento | A empresa | Regra do contrato, interna | Sim (corretora regulada) | Não | US$ 64,2 bi em 30 dias, 78% do setor, página lida em out/2026, data de corte não mostrada [S4]; outra busca diz US$ 1,3 bi "no mês" em set: conflito [S3] | Sim |
| 3 | Melee Markets | Solana | Pote com curva (PMM) | Qualquer um | Criador, anula se ambíguo | n/e | n/e | Seed US$ 3,5 mi (Variant, set/2025) [S5] | Beta por convite [S5] |
| 4 | World (world.xyz) | Solana, dentro da Phantom | Roteia a provedores de liquidez | n/e (indício de curadoria) [I] | Chainlink, sem disputa [S5] | "Certas jurisdições", n/e | Nenhum anunciado | 150 mil mercados, set/2026 [S5] | Sim |
| 5 | Limitless | Base, EUA bloqueados | Livro e AMM | Qualquer usuário logado e time | Pyth, Chainlink, manual | Sem KYC de rotina | LMTS | US$ 10,13 mi em 30 dias, US$ 1,467 bi acumulado, DefiLlama 3/out/2026 [S5] | Sim, volume em queda [I] |
| 6 | PNP Protocol / PNP Exchange | Solana | Curva de ligação (bonding curve); também P2P parimutuel e mercados "Bubblegum" sem capital [S6] | Qualquer um [S6] | Oráculos com LLM gravam SIM/NÃO on-chain; DAO como retaguarda [S6] | n/e | Token de mercado "Bubblegum"; token do protocolo n/e [S6] | Escala n/e; 100% de uptime em 30 dias até 4/out/2026, 1 avaliação (agregador) [S7] | Sim, indício fraco |
| 7 | Hedgehog Markets | Solana, Eclipse | AMM binário | Equipe | n/e | n/e | HHDG (agregador) | Seed US$ 3,5 mi (agregador) [S8] | [?] |
| 8 | Drift BET | Solana | Livro de ordens, margem cruzada | n/e | n/e | n/e | Token do Drift | Agregador marca "Saudável" em 1/set/2026 [S8]; hack de US$ 285 mi no Drift em 1/abr/2026 [S5] | [?] |
| 9 | DFlow | Solana | Tokeniza mercados da Kalshi (SPL) | Kalshi | Kalshi | Sim (Proof) | n/e | Comprada pela MoonPay, mai/2026 [S5] | Sim |
| 10 | Jupiter (prediction) | Solana | Integração com Kalshi [S5] | Terceiros | Terceiros | n/e | JUP (do ecossistema) | "Segundo maior em volume Solana", jan/2026 (agregador) [S5] | Sim, citado |
| 11 | Phantom (via World) | Solana | Ver World | Ver World | Ver World | Ver World | Nenhum | Mais de 20 mi de usuários da carteira [S5] | Sim |
| 12 | Myriad Markets | Abstract, Linea, BNB | AMM | Equipe | n/e | n/e | n/e | US$ 1.319 em taxas em 30 dias, sem data [S5] | Sim, escala baixa |
| 13 | Azuro | EVM | Pool de liquidez, apostas esportivas | Provedores de dados [?] | Oráculo esportivo [?] | n/e | AZUR | Volume 24 h em DEX US$ 612 mil (busca, sem data clara) [S9] | Sim |
| 14 | PancakeSwap Prediction | BNB Chain | Pote binário de preço, rodadas curtas | Protocolo (automático) [I] | Oráculo de preço [I] | Não [?] | CAKE | n/e para o módulo | Sim [S9] |
| 15 | FactCheck | n/e | n/e | n/e | n/e | n/e | n/e | n/e | [?] não verificado |
| 16 | Manifold | Web2, dinheiro de brinquedo (Mana) | Market maker automático | Qualquer um | Criador | Conta | Mana, sem valor | Mercado de 23/jul/2026: 127 apostadores (busca) [S9] | Sim |
| 17 | PredictIt | EUA, DCM/DCO da CFTC | Livro | Empresa | Empresa | Sim | Não | Limite de 5.000 traders removido (busca) [S9] | Sim |
| 18 | Robinhood | EUA | Distribui contratos (Kalshi, Crypto.com/OG) | Parceiros | Parceiros | Sim | Não | Receita de eventos US$ 156 mi no 2T/2026; 13,6 bi de contratos (busca) [S10] | Sim |
| 19 | Coinbase | EUA | n/e | n/e | n/e | Sim [I] | n/e | n/e: a busca não trouxe prova de oferta de contratos de evento | [?] |
| 20 | Hyperliquid HIP-4 | Hyperliquid | Resultados em cadeia própria | Protocolo | Protocolo | Não [?] | HYPE | US$ 331,1 mi nas 9 primeiras semanas, desde 2/mai/2026 [S5] | Sim |

Também citados nas fontes e fora da lista por falta de dados: Triad, Hxro Parimutuel, Path Protocol, MetaDAO,
Zeitgeist, Thales/Overtime, SX Bet, Augur, Totalis (aparece em comparador do MadeOnSol, não lido).

## Cinco principais para análise profunda

Critério (ponderado pelo perfil): (1) similaridade de modelo (pote ou curva, criação própria, Solana); (2) sobreposição
de público web3/pump.fun; (3) ameaça por atenção; (4) disponibilidade de dados para analisar.

1. **Melee Markets** - o mais parecido: Solana, pote, quem cria ganha. Fraqueza provável: resolução pelo criador [I].
2. **PNP Protocol** - Solana, permissionless, curva de ligação à la pump.fun (o nome PNP vem de "predict and pump"
   segundo agregador [S7]); resolução por LLM, o oposto de dado on-chain. Mercados com "token próprio" tocam o
   público do pump.fun [S6].
3. **Polymarket** - maior ameaça por atenção do público cripto: marca, liquidez, token POLY vindo [S2].
4. **World (Phantom)** - maior distribuição dentro de Solana, resolve por Chainlink; ameaça por atenção em Solana.
5. **Limitless** - referência de taxas e criação aberta, token e "sem KYC de rotina", já documentado.

Fora do top 5 e por quê: Kalshi (maior volume, mas EUA, KYC, 85% esportes [S3]; referência de escala, não rival de
público); Drift BET e Hedgehog (status incerto); DFlow e Jupiter (Kalshi, KYC); Hyperliquid HIP-4 (outra cadeia; primeiro
reserva se o volume interessar).

Quem mais se parece conosco: **Melee** (pote, Solana, criação aberta), seguido de **PNP**. Nenhum dos dois, até onde
li, resolve por leitura de conta on-chain nem tem patrocinador pago [I].

Maior ameaça por atenção: **Polymarket** no público cripto geral; **World/Phantom** dentro de Solana [I]. Público
pump.fun medido: nenhum [?].

## Sobre o PNP Protocol (o item novo)

- [F] Organização GitHub `pnp-protocol` (pnp.fun): repositórios `solana-skill` (atualizado 11/abr/2026),
  `pnp-solana-toolkit` (27/fev/2026), `arena`, template Next.js e starter Expo; quase sem descrições [S11].
- [F] Docs em docs.pnp.exchange: curva de ligação sem livro de ordens; também AMM "Pythagorean", parimutuel P2P, PAMM
  (EVM) e Bubblegum (lançamento sem capital); taxa de protocolo de 1%, criador recebe 30% das taxas; colateral USDC
  (outra fonte diz qualquer token SPL); oráculo com LLM e DAO de retaguarda; sem informação de auditoria [S6][S12].
- [F] Existe como "habilidade" para agentes de IA (pnp-markets-solana, 21 instalações, 4/fev/2026) [S13].
- [I] Foco em desenvolvedores e agentes, não em consumidor final.
- **Ambiguidade [?]**: pnp.exchange, aberto direto, mostra "uma moeda que negocia Polymarket", "Coming soon", sem
  saques. Pode ser outro projeto ou nova fase; não confirmado. pnp.fun não resolve DNS.
- [?] Volume, TVL, usuários, KYC, auditoria, token do protocolo: não encontrados.

## Correções ao arquivo anterior

- Drift BET: o agregador marca "Saudável" em 1/set/2026 [S8]; "saudável" é só uptime, não prova de volume. Continua [?].
- Polymarket e Kalshi, antes fora do escopo, entram aqui, com números conflitantes (ver abaixo).
- Limitless: volume de 30 dias (US$ 10,13 mi) contra acumulado de US$ 1,467 bi continua sugerindo queda [I].

## Perguntas em aberto

1. [?] Kalshi: US$ 64,2 bi em 30 dias [S4] contra US$ 1,3 bi "no mês" até meados de set [S3]. Um está errado ou em
   unidade diferente; conferir no painel original antes de citar qualquer um.
2. [?] Polymarket: US$ 10,3 bi em abr/2026 contra US$ 773 mi até meados de set; o primeiro é da The Block via busca.
3. [?] PNP: volume, usuários, KYC, auditoria, token; relação entre pnp.fun e pnp.exchange.
4. [?] Coinbase oferece contratos de evento? Sem prova. FactCheck, Hedgehog e Drift BET sem status primário.
5. [?] Mecanismo de resolução do Polymarket (UMA) não lido nesta rodada; taxas e quem cria no World; taxa total do Melee.
6. [?] Reclamações de usuários de qualquer um: nenhuma fonte direta lida (Reddit, X, Trustpilot).
7. [S] Suposição: Polymarket e World são os rivais por atenção; nenhum dado de audiência pump.fun foi medido.

## Fontes

- S2. The Block via busca: https://www.theblock.co/post/376048/polymarket-cmo-confirms-poly-token-airdrop-plans e
  https://www.theblock.co/post/377214/polymarket-rebounds-kalshi-leads
- S3. Busca sobre volume de set/2026 (resumo de agregadores; origem não confirmada):
  https://www.theblock.co/post/371287/kalshi-surges-past-polymarket-in-volume-grabs-global-dominance (a URL aparenta
  ser de 2025; a data do dado é suspeita)
- S4. DefiRate: https://defirate.com/prediction-markets/volume/ (lida em 4/out/2026)
- S5. Itens [S5] vêm de `mercados-de-previsao-web3.md` (fontes S2, S5, S10, S12, S16, S17 de lá); não relidos.
- S6. PNP docs: https://docs.pnp.exchange
- S7. MadeOnSol, PNP vs Polymarket: https://madeonsol.com/compare/pnp-exchange-vs-polymarket e busca em
  https://www.solflare.com/prices/pnp/UVcu7kbVKW6Rs5PKzuwVSbm8ukvrWByS3hBXqHapump/
- S8. MadeOnSol: https://madeonsol.com/blog/solana-prediction-markets-guide e
  https://madeonsol.com/compare/drift-bet-vs-jupiter
- S9. Buscas: Azuro https://defillama.com/token/AZUR; PancakeSwap https://pm.wiki/uk/projects/pancakeswap-prediction;
  Manifold https://tech-insider.org/manifold-will-something-happen-2026-market-odds/; PredictIt
  https://markets.financialcontent.com/stocks/article/predictstreet-2026-1-16-predictit-the-gold-standard-of-politics-holds-its-ground-against-crypto-giants-and-retail-powerhouses
- S10. Robinhood: https://www.gamblinginsider.com/news/157029/robinhood-q1-prediction-markets-record-volume e
  https://financemagnates.com/fintech/robinhood-takes-stakes-in-cryptocom-and-og-to-expand-prediction-markets
- S11. GitHub: https://github.com/pnp-protocol
- S12. Busca PNP: https://skills.cat/u/pnp-protocol
- S13. Vibe Index: https://www.vibeindex.ai/skills/pnp-protocol/solana-skill/pnp-markets-solana
