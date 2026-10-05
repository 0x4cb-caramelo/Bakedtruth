# Mercados de previsão web3: comparativo de três concorrentes

Data: 3 de outubro de 2026

Pergunta original do fundador: "temos prediction Market em web3? Podemos fazer uma tabela com uns 3 concorrentes
deles, ver os serviços que são base em cada um, e quais os diferenciais de cada um, taxas, e outros números?"

Convenção: **[F]** fato com fonte, **[I]** inferência, **[S]** suposição, **[?]** pergunta em aberto. Fontes entre
colchetes remetem à seção "Fontes". Polymarket e Kalshi ficam fora (lidos por outros agentes).

Limite do método: as páginas foram lidas por uma ferramenta que resume o conteúdo; o DefiLlama bloqueou a leitura das
páginas (HTTP 403), então os números dele vieram da API pública e não foram conferidos na interface.

## Resumo em dez linhas

1. Sim, existem mercados de previsão web3 ativos; a maior parte do volume está em EVM, não em Solana.
2. Escolhidos: **Melee Markets** (Solana, pote), **World** (Solana, Phantom) e **Limitless** (Base, qualquer um cria).
3. Melee é o concorrente conceitual mais próximo: Solana, qualquer um cria, pote com curva de preço, criador ganha.
4. Melee diz pagar ao criador até 20% das taxas; o percentual de taxa total não foi encontrado.
5. World tem a maior distribuição: dentro da Phantom (mais de 20 milhões de usuários da carteira) e 150 mil mercados.
6. World resolve por oráculo Chainlink, sem painel humano e sem janela de disputa; taxas e KYC não divulgados.
7. Limitless é o mais documentado: taxa de 0,40% a 3,00% (taker), criador recebe 2% da taxa, token LMTS.
8. Limitless proíbe EUA e outros países nos termos, mas não exige KYC de rotina (se reserva o direito de exigir).
9. Drift BET (o antigo líder Solana) sofreu hack de US$ 285 milhões em 1 de abril de 2026; status do BET: não encontrado.
10. Nenhum dos três usa "leitura de conta on-chain" como resolução; é uma lacuna de diferenciação para o Bakedtruth [I].

## Lista longa (mercados on-chain; "ativo" só quando houve fonte recente)

| # | Projeto | Cadeia | Mecanismo | Uma frase | Status |
|---|---------|--------|-----------|-----------|--------|
| 1 | Melee Markets | Solana | Pote com curva (PMM) | Qualquer um cria, criador ganha | Beta, por convite [S9] |
| 2 | World (world.xyz) | Solana | Roteia ordens a provedores | Dentro da Phantom, Chainlink | Ativo desde jul/2026 [S12] |
| 3 | Limitless | Base | Livro de ordens e AMM | Mercados curtos, usuários criam | Ativo [S3] |
| 4 | Hedgehog Markets | Solana, Eclipse | AMM | Binário, taxa fixa de 2%, HHDG | Dados só em agregador [S8] |
| 5 | Drift BET | Solana | Livro de ordens | Margem cruzada com Drift | Hack em abril/2026; BET: n/e [S6] |
| 6 | DFlow | Solana | Tokeniza mercados da Kalshi | SPL tokens, exige KYC (Proof) | Ativo; MoonPay comprou [S10] |
| 7 | Jupiter (prediction) | Solana | Kalshi via integração | Segundo maior em volume Solana | Citado em jan/2026 [S7] |
| 8 | Hxro Parimutuel | Solana | Pote | Protocolo para apps criarem apostas | Só listagem [S11] |
| 9 | Path Protocol | Solana | AMM | Infra de criação para terceiros | Só listagem [S11] |
| 10 | Triad | Solana | Binário, "Fast Markets" 15 min | Cadastro por e-mail | Só listagem [S11] |
| 11 | Myriad Markets | Abstract, Linea, BNB | AMM | Mercados junto de conteúdo de mídia | Ativo, receita baixa [S13] |
| 12 | Hyperliquid HIP-4 | Hyperliquid | Resultados em cadeia própria | US$ 331,1 mi nas 9 primeiras semanas | Lançado 2/mai/2026 [S5] |
| 13 | MetaDAO | Solana | Futarquia | Governança, não consumo | Citado [S4] |

n/e = não encontrado. Não verificados nesta rodada: Azuro, Zeitgeist, Thales/Overtime, PancakeSwap Prediction,
FactCheck, Augur, SX Bet. Ficam como pergunta em aberto, não como fato.

## Critério de escolha

Pedido: priorizar Solana nativo, criação aberta ou pote, com dados verificáveis. Aplicação:

- **Melee**: único com pote + criação aberta + Solana. Cobre o modelo em avaliação. Perde em dados numéricos.
- **World**: Solana nativo, maior alcance recente e fonte jornalística múltipla. É o concorrente por atenção.
- **Limitless**: não é Solana, mas é o único com documentação oficial completa de taxas, criação aberta e token.
  Serve de referência de benchmark.
- **Fora**: Drift (hack, status incerto), DFlow e Jupiter (curadoria da Kalshi, KYC, não é criação aberta),
  Hedgehog (só agregador). Hedgehog é o primeiro reserva.

## Tabela comparativa

| Item | Melee Markets | World | Limitless |
|------|---------------|-------|-----------|
| Cadeia | Solana | Solana | Base |
| Serviço de base | Criar e negociar mercados | Negociar na Phantom | Mercados curtos de preço |
| Mecanismo | Pote com curva por desfecho | Roteia a provedores | Livro de ordens e AMM |
| Sair antes | Não encontrado | Sim, venda de SPL token [I] | Sim |
| Quem cria | Qualquer um | Não encontrado | Qualquer um logado; time |
| Criador ganha | Até 20% (da taxa/volume) | Não encontrado | 2% da taxa taker (padrão) |
| Resolução | Criador, anula se ambíguo | Chainlink, sem disputa | Pyth, Chainlink, manual 1-3 dias |
| Taxas | Não encontrado | Não divulgado (só rede) | AMM 0,40%; livro 0,40-3,00% |
| Token | Não encontrado | Nenhum anunciado | LMTS, 22/out/2025 |
| KYC e geografia | Não encontrado | Só "certas jurisdições" | Sem KYC de rotina; EUA bloqueados |
| Escala | US$ 15,87 mi num mercado | 150 mil mercados | US$ 1,47 bi acumulado |

## Melee Markets

**Serviços de base [F]**: criar e negociar mercados sobre qualquer tema; acesso em beta por convite, com reputação
"Melee Score" (Bronze a Campeão) [S2]. Fundada em abril de 2025 [S2].

**Preço [F]**: Parimutuel Market Maker. Cada desfecho tem sua curva de preço, o preço sobe com o capital; os aportes
vão a um pote geral e as ações vencedoras levam parte proporcional dos pools perdedores. O mercado nasce com o
primeiro depósito, sem provedor de liquidez, e há piso de retorno para quem entra cedo [S2][S14]. Saída antes da
resolução: não encontrado.

**Criação e criador [F]**: qualquer um cria; criador ganha até 20% (o texto fala em "20% do volume" na fonte [S2] e
"20% das taxas" na fonte [S14]; divergência). Exemplo citado: US$ 317 mil de receita de criador em US$ 15,87 mi de
volume [S2], ou seja cerca de 2,0% do volume, o que é inferência [I] por divisão minha.

**Resolução [F]**: inicialmente pelo criador, com anulação (devolução) em caso ambíguo; meta de rede de resolvedores,
hoje dependente de julgamento humano [S14].

**Taxas**: percentual total do protocolo: não encontrado. **Token**: não encontrado.

**Números**: seed de US$ 3,5 mi liderado pela Variant, setembro de 2025, com Anatoly Yakovenko como anjo [S2].
Volumes por mercado de milhões a mais de US$ 30 mi, sem data [S2]. Auditoria pública: nenhuma publicada [S2].

**Diferencial declarado**: "primeira atualização relevante dos parimutuels em 160 anos" [S2]. **Reclamações**:
não encontradas. **Risco [I]**: resolução pelo criador é o elo fraco de confiança.

## World (world.xyz)

**Serviços de base [F]**: contratos binários de 0 a US$ 1, posições como SPL tokens na carteira do usuário,
liquidação em CASH (stablecoin da Phantom) [S12][S15]. Cobertura: NFL, sete ligas de futebol, F1, eleições de meio
de mandato dos EUA, decisões do Fed [S16]. Plano: ações, commodities, clima [S16].

**Preço [F]**: o protocolo "roteia ordens a provedores de liquidez em Solana" e não custodia fundos [S15]. Livro ou
AMM: não encontrado.

**Criação [F]**: mais de 150 mil mercados desde o lançamento [S16]. Quem cria: não encontrado; os tipos listados
sugerem curadoria própria [I].

**Resolução [F]**: Chainlink Data Streams e Runtime Environment; "sem painel humano, sem voto de token, sem janela
de disputa" [S17]. Limite apontado pela mesma fonte: eventos ambíguos e falha de feed não têm recurso [S17].

**Taxas**: não divulgadas; só taxa de rede ao abrir e fechar posição [S17]. **Token**: nenhum anunciado [S15].
Tokens falsos "WORLD" apareceram em launchpads antes da revelação [S12].

**Números**: 150 mil mercados (set/2026) [S16]; lista de espera de mais de 1 milhão (9/set/2026) [S16];
Phantom cita mais de 20 milhões de usuários da carteira (não do World) [S16]. Volume, OI e taxas do primeiro dia:
não divulgados [S16].

**KYC e geografia [F]**: disponível "só em certas jurisdições" [S16]; Phantom afirma que não oferece jogos de
azar [S15]. Lista de países: não encontrado.

**Datas divergentes**: início em 1/jun/2026 (Phantom, troca de DFlow por World) [S15] versus 1/jul/2026 [S12][S16]
versus abertura standalone em 9/set/2026 [S16]. Provável: troca interna em junho, lançamento público em julho [I].
Equipe anônima, identificada só por arquivo legal no fim de junho [S15][S16].

**Reclamações**: ausência de disputa e dependência de feed [S17].

## Limitless (Base)

**Serviços de base [F]**: mercados "por hora, diário, semanal e personalizados" de cripto, ações e macro; USDC de
colateral; ação vencedora paga US$ 1,00; 1 Sim + 1 Não resgatam 1 USDC, o que permite sair antes [S3a].

**Preço [F]**: livro de ordens (CLOB) e mercados AMM coexistem [S3b].

**Criação e criador [F]**: qualquer usuário logado cria, com limite diário e tetos por duração; criador recebe
por padrão 2% das taxas taker, fixado no momento da criação [S3c].

**Resolução [F]**: Pyth na maioria; Chainlink TWAP em mercados curtos; provedores esportivos (API-Sports,
PandaScore); manual pelo time em 24 a 72 h para mercados do time. Sem disputa formal: suporte por e-mail ou Discord;
resolução errada gera reembolso do valor apostado [S3d].

**Taxas [F]** [S3b]: AMM 0,40% fixa. Livro: compra 0,40% a 3,00% (paga em tokens do desfecho, cai com a
probabilidade); venda 0,42% a 1,50% (paga em USDC, máximo perto de 50%). Só taker paga; ordem limite no livro 0%.
Rebate diário em USDC a quem põe liquidez de maker [S3e].

**Token [F]**: LMTS, lançado em 22/out/2025 (agregador BingX [S3f]); oferta máxima 1 bilhão e uso em staking, desconto
de taxa e recompra (agregador pm.wiki [S3g]). Cerca de 24% da oferta para recompensas e airdrops (BingX).

**Números** (DefiLlama via API, consultada em 3/out/2026; a data de corte do dado não foi confirmada, pois o campo
de data veio inconsistente): volume 24 h US$ 73.962; 7 d US$ 753.384; 30 d US$ 10,13 mi; acumulado US$ 1,467 bi
[S1a]. Taxas: 24 h US$ 864; 30 d US$ 190.514; acumulado US$ 14,13 mi [S1b]. A documentação oficial diz
"US$ 1 bi+ negociados" [S3a]. [I] O volume de 30 dias é pequeno frente ao acumulado: possível queda forte.

**KYC e geografia [F]**: sem KYC de rotina, mas a empresa "se reserva o direito" de exigir prova de identidade a
qualquer momento. Bloqueados: Rússia, Belarus, Cuba, Irã, Coreia do Norte, Síria, Crimeia, Donetsk, Luhansk;
negociação proibida em EUA, China, Ontário e Alberta [S3h]. Brasil: não aparece na lista.

**Reclamações públicas**: não encontradas (busca em Reddit e Trustpilot sem resultado específico).

## Perguntas em aberto

1. [?] Taxa total e criação de mercado no Melee: o doc oficial deu HTTP 401; pedir acesso ou ler o contrato.
2. [?] Quem cria mercados no World e qual o percentual de taxa embutido no preço.
3. [?] Status atual do Drift BET após o relançamento com USDT; o DefiLlama não pôde ser lido.
4. [?] Hedgehog segue ativo? A taxa de 2% e o HHDG vêm de agregador [S8], sem doc oficial (certificado expirado).
5. [?] Azuro, Zeitgeist, Thales/Overtime, PancakeSwap Prediction, FactCheck, Augur e SX Bet não foram verificados.
6. [?] Reclamações recorrentes de usuários: nenhuma fonte direta (Reddit, X, Discord) foi lida.
7. [S] Suposição: o modelo de pote do Melee é o benchmark mais próximo do desenho do Bakedtruth.
8. [S] Suposição: nenhum dos três resolve por leitura de conta on-chain; só vimos oráculos e criador.

## Fontes

Agregadores marcados com (agr.). Docs oficiais sem marca.

- S1a. DefiLlama API, volume Limitless: https://api.llama.fi/summary/dexs/limitless-exchange (consulta 3/out/2026)
- S1b. DefiLlama API, taxas Limitless: https://api.llama.fi/summary/fees/limitless-exchange (consulta 3/out/2026)
- S2. Solana Compass (agr.), Melee Markets: https://solanacompass.com/projects/melee-markets
- S3a. Limitless docs: https://docs.limitless.exchange/user-guide/what-is-limitless.md
- S3b. Limitless taxas: https://docs.limitless.exchange/user-guide/fees.md
- S3c. Limitless criação: https://docs.limitless.exchange/user-guide/user-generated-markets.md
- S3d. Limitless resolução: https://docs.limitless.exchange/user-guide/market-resolution.md
- S3e. Limitless índice: https://docs.limitless.exchange/llms.txt (existência da página de maker rebates)
- S3f. BingX (agr.): https://bingx.com/en/learn/article/what-is-limitless-airdrop-how-to-claim-lmts-tokens
- S3g. pm.wiki (agr.): https://pm.wiki/uk/projects/limitless-exchange
- S3h. Limitless termos: https://docs.limitless.exchange/user-guide/terms-of-service.md
- S4. MadeOnSol (agr.): https://madeonsol.com/blog/solana-prediction-markets-guide
- S5. Solana Compass (agr.), CoinShares: https://solanacompass.com/news/prediction-market-monthly-volume-surged-to-437b-by-june-as-solana-earns-14mmonth
- S6. Unchained, hack da Drift: https://unchainedcrypto.com/drift-protocol-suffers-285-million-exploit-after-admin-key-compromise-and-oracle-manipulation-unchained/
- S7. Step Data (agr.): https://stepdata.substack.com/p/prediction-markets-on-solana-286m (14/jan/2026)
- S8. Solana Compass (agr.), Hedgehog: https://solanacompass.com/projects/hedgehog-markets
- S9. Melee: a mesma S2 (beta por convite)
- S10. MoonPay sobre DFlow: https://www.moonpay.com/newsroom/dflow (5/mai/2026)
- S11. Solana Compass (agr.), categoria: https://solanacompass.com/projects/category/rwa/prediction-markets
- S12. CoinDesk: https://www.coindesk.com/web3/2026/07/01/mysterious-solana-project-world-unveiled-as-fully-onchain-prediction-market
- S13. DefiLlama via busca (agr.): https://defillama.com/fees/myriad-markets (US$ 1.319 em 30 dias, sem data)
- S14. Busca sobre Melee (agr.), sem página única; reproduzido em S2 e https://thegrid.id/profiles/melee_markets
- S15. Solana Compass, página de divulgação da Phantom: https://solanacompass.com/news/phantoms-disclosure-page-reveals-world-prediction-markets-as-its-solana-infrastructure-provider
- S16. Genfinity (agr.): https://genfinity.io/2026/09/10/world-xyz-solana-prediction-market-1-million-waitlist-chainlink/
- S17. crypto.news: https://crypto.news/world-prediction-market-third-resolution-model/
- Contexto DFlow: https://www.quicknode.com/guides/solana-development/3rd-party-integrations/kalshi-prediction-markets-with-dflow
