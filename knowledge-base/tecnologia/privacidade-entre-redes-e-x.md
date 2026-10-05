# Privacidade de pagamento, pagamento entre redes e integração com o X

Data: 3 de outubro de 2026.
Método: leitura de documentação oficial por WebFetch/WebSearch (resumos de modelo auxiliar). Marcações: FATO (fonte
primária), FATO SECUNDÁRIO (imprensa, diretórios, blogs), INFERÊNCIA (minha), "não encontrado".
Limite: as leituras são resumos; só o que importa foi confirmado em segunda leitura, e isso está indicado.

## Resumo em dez linhas

1. O Cloak das ferramentas é provavelmente o de cloak.ag (Machine-Labz): saldo blindado em Solana, SOL/USDC/USDT.
2. Cloak: depósito grátis, saque 0,3% mais taxa fixa (0,45 USDC); mainnet; auditado segundo o próprio site, sem relatório.
3. Os documentos do Cloak não dizem se o destinatário de um saque pode ser PDA/programa. Não encontrado.
4. Nenhum fluxo de saldo blindado executa uma instrução de programa; entrega tokens a um endereço (INFERÊNCIA).
5. Mais maduro e documentado pela Solana: Confidential Balances (Token-2022), religado na mainnet em 17/jun/2026,
   mas esconde só valores, e o USDC da Circle não parece usar Token-2022 (INFERÊNCIA).
6. Zcash: Zashi CrossPay (set/2025) paga a partir de ZEC blindado em qualquer ativo da NEAR Intents, a um endereço.
7. NEAR Intents só aceita Zcash transparente (t-addr); a parte blindada fica na carteira Zashi.
8. "SODEXA" não existe com esse nome; candidatos: SODAX (intents, Sonic) e SoDEX (bolsa da SoSoValue). Não cravado.
9. Melhores opções para receber de outras redes: CCTP (USDC nativo, taxa 0 ou ~1 bps), deBridge (hook de instrução
   em Solana), Mayan (payload no destino), NEAR Intents (widget, aceita BTC/ZEC).
10. X: embed de perfil/lista é de uso aberto na documentação (preço não informado); busca por #hashtag/menção exige
    API paga por uso, US$ 0,005 por post lido, sem plano gratuito listado.

## A. Privacidade de pagamento em Solana

### A.1 Cloak

Há mais de um projeto com esse nome (FATO SECUNDÁRIO, busca):
- Cloak, camada de privacidade em Solana da Machine-Labz: https://www.cloak.ag. É o que parece ser o das ferramentas
  (saldo blindado, pagar, enviar, trocar), mas não cravo: o nome "cloak-pay/send/shield/swap" não aparece em
  docs.cloak.ag (busquei em llms-full.txt e na página de IA). "Pay from Shielded Balance" também não.
- Cloak Framework, contratos confidenciais para EVM/TEE (cloak-docs.readthedocs.io). Outro projeto.
- Cloaked / Cloaked Pay (cartão virtual, help.cloaked.com). Outro produto.
- cloaklabz.xyz, citado pelo Solana Compass como site, hoje é página de domínio expirado à venda (Porkbun).
- "Cloak V1" do relatório Zellic aparece em busca como projeto em Scroll; a página deu 403 (não confirmado).

FATOS do Cloak de Solana (https://docs.cloak.ag, lido em 3/out/2026):
- Funções do SDK `@cloak.dev/sdk`: transact, transfer, partialWithdraw, fullWithdraw, swapWithChange
  (https://docs.cloak.ag/sdk/introduction). A visão geral fala em proteger (shield), enviar em privado para qualquer
  endereço Solana ou domínio .sol, e desproteger (unshield).
- Tokens: SOL, USDC, USDT. "Bridge-in" de USDC vindo de Polygon, Ethereum, Base, Arbitrum e Sui (docs.cloak.ag).
- Taxas: proteger é grátis; saque/troca 0,3% + fixo (0,005 SOL; 0,45 USDC/USDT). Mínimo de depósito 0,01 SOL ou
  1,00 USDC/USDT (llms-full.txt, contrato 8). Prova no navegador em cerca de 4 s (cloak.ag).
- Visível na cadeia: depósitos no pool e saques do pool, nunca o vínculo entre eles (FAQ).
- Triagem de sanções via Range antes de transmitir; transação sinalizada é bloqueada (FAQ). Chave de visualização
  permite relatório a auditor. Sem KYC nem conta, segundo o site (cloak.ag).
- Mainnet: "the program is live on mainnet". Atualização por multisig Squads 3 de 4 com 1 hora de espera
  (https://docs.cloak.ag/operations/security).
- Auditoria: o FAQ diz "independently audited" e que "the full report is being prepared for publication".
  Relatório não publicado e auditor sem nome. O Solana Compass (secundário) diz "no public security audit" e "alpha".
  O diretório MadeOnSol (secundário) diz "mainnet, audits still developing". Trate como não verificável.
- Lançou Cloak Payroll em 28/set/2026 (Solana Compass, secundário), taxa padrão 0,3% + 0,45 por pagamento.

**Um programa pode receber de saldo blindado?** Não encontrado. O índice da API usa `recipient` em saque e
`recipientPubkey` em transferência; a documentação não afirma nem proíbe PDA ou conta fora da curva
(https://docs.cloak.ag/sdk/api-reference). Onde o saque cai (conta de token do destinatário/ATA) também não está dito.

INFERÊNCIA: o saque entrega tokens a um endereço; ele não chama uma instrução do nosso programa. Tokens enviados ao
cofre PDA não creditariam posição alguma (o cofre do projeto é contabilizado por instrução, conforme CLAUDE.md).
Para "patrocínio privado", o caminho natural é o patrocinador sacar para uma carteira nova e então assinar a compra,
o que expõe essa carteira nova no mercado. Isso precisaria de teste real e de uma decisão de desenho.

### A.2 Alternativas em Solana

| Opção | O que esconde | Status e fonte |
|---|---|---|
| Confidential Balances (Token-2022) | só saldos e valores; contas, dono e mint ficam públicos | Docs Solana: https://solana.com/docs/tokens/extensions/confidential-transfer. Religado na mainnet em 17/jun/2026 após falha de prova ZK de jun/2025, auditoria Code4rena e patch Agave 2.1.21 (Solana Compass, secundário) |
| Solana Rings (Helius) | ativo e valor; remetente/destinatário públicos no anel padrão | Beta, devnet com auditorias em curso: https://www.helius.dev/docs/privacy |
| Zolana (Helius) | transferências privadas, saldo cifrado | Docs Helius, "Privacy API": https://www.helius.dev/docs/privacy/integration/wallet.md |
| Privacy Cash | quebra o vínculo depósito-saque (pool) | Docs espelhadas em mintlify.wiki (não é oficial confirmado): SOL, USDC, USDT, ORE, ZEC; saque 0,25%; circuito auditado por Accretion, HashCloak, Zigtur, Kriko. Mainnet não afirmado nessa leitura |
| Umbra (sobre Arcium) | remetente, destinatário e valor; trocas cifradas | The Block (secundário): abriu ao público em 27/mar/2026; antes teve teto de US$ 500 por depósito na fase privada |
| Arcium | computação cifrada (MPC), não é carteira | Mainnet Alpha ao vivo segundo The Block/Solana Compass (secundário); mais de 1 milhão de computações até 9/jun/2026 |
| Light Protocol / ZK Compression | principal produto é compressão (custo de contas) | Site oficial: "reduce the cost of scaling payments, privacy, and PDAs"; nas páginas lidas não há afirmação de privacidade. Tratar como compressão |

Inferência: a mais madura e documentada pela própria Solana é Confidential Balances. Mas esconde só valores, só vale
para mints Token-2022 com a extensão, e o USDC da Circle em Solana é SPL Token clássico (o CLAUDE.md do projeto usa o
mint clássico; não confirmei na documentação da Circle). Para esconder QUEM aposta, os pools (Cloak, Privacy Cash) são
o que existe, todos jovens.

### A.3 Zcash

- Zashi CrossPay (lançado em 16/set/2025): paga a partir de ZEC blindado, escolhe o ativo do destinatário, informa o
  endereço dele; a NEAR Intents troca "por baixo" e as taxas saem do saldo blindado
  (https://zodl.com/private-cross-chain-payments-with-zashi-crosspay/, antes em electriccoin.co). FATO.
- Zashi Swaps (on-ramp): BTC, SOL, USDC e outros por ZEC (electriccoin.co/blog/zashi-swaps-decentralized-on-ramp-is-live).
- NEAR Intents: Zcash "partially supported, transparent addresses only" (t1/t3); Solana totalmente suportada
  (https://docs.near-intents.org/resources/chain-support.md). FATO. Logo, o ZEC passa por um t-address da NEAR; o
  vínculo com o destinatário Solana fica no lado da NEAR (INFERÊNCIA).
- Taxas NEAR Intents: protocolo 0,0001%; near-intents.org +0,2%; 0,1% em saques de NEAR/ZEC/STRK para Solana;
  1Click API +20 a 25 bps (1 bp em stablecoins) (https://docs.near-intents.org/resources/fees.md).
- Entrega só a um endereço de carteira. Chamada a programa: não encontrado.

### A.4 Riscos regulatórios (sem opinar sobre a lei)

- 8/ago/2022: OFAC incluiu o Tornado Cash na lista de sancionados; citou mais de US$ 7 bilhões lavados desde 2019,
  US$ 455 milhões do grupo Lazarus (https://home.treasury.gov/news/press-releases/jy0916). FATO.
- Nov/2024: o 5º Circuito decidiu que a OFAC excedeu sua autoridade sobre o código autônomo (Van Loon; fonte
  secundária, The Defiant e Willkie).
- 21/mar/2025: o Tesouro retirou as sanções: "exercised our discretion to remove the economic sanctions against
  Tornado Cash" (https://home.treasury.gov/news/press-releases/sb0057). FATO. O texto mantém o foco em hackers da Coreia
  do Norte.
- Ago/2025: Roman Storm foi condenado por conspiração para operar transmissor de dinheiro sem licença; júri dividido nas
  demais acusações. Novo julgamento marcado para 26/abr/2027 (The Block e Decrypt, secundário). Não li a sentença.
- Sinal de mercado: o Cloak integra triagem de sanções (Range) e o Umbra integra triagem e geo-bloqueio (secundário).

## B. Receber de outras redes e converter para USDC ou SOL

### B.1 O que é "SODEXA"

Nome exato não encontrado. Candidatos, sem escolher:
- SODAX: protocolo de intents entre redes, hub na Sonic; Solana, Sui, Stellar, NEAR, Stacks e EVM; SDK, API HTTP e
  widget em iframe (https://docs.sodax.com/ e https://docs.sodax.com/swap.md). Taxa base fixa de 0,1% na página
  Solana (https://docs.sodax.com/solana/swaps), enquanto a imprensa fala em 0,2% e 20-30 s (The Defiant, de
  out/2025, secundário): divergência não resolvida. Saída vai ao `dstAddress`; chamada de contrato: não confirmada.
- SoDEX (SoSoValue): bolsa descentralizada em appchain L1 "ValueChain", spot e perps, mainnet em 28/out/2025
  (Decrypt, secundário). Não é rota de pagamento; não li documentação oficial.
- Outros nomes parecidos: não procurei além desses dois.

### B.2 Alternativas (documentação oficial)

| Opção | Redes e entrega em Solana | Taxa | Tempo | Widget/SDK | Instrução de programa no destino |
|---|---|---|---|---|---|
| Circle CCTP v2 (developers.circle.com/cctp) | USDC nativo por queima e emissão; Solana suportada | Padrão grátis; rápida 0 a 13 bps (Solana e Ethereum 1 bp) | rápida 8-20 s; padrão 15-19 min (Ethereum/L2) | Bridge Kit, SDK | v2 tem campo `hookData`; para Solana como destino não confirmei. Não encontrado |
| deBridge DLN | EVM e Solana; intents | protocolo 4 bps + taxa fixa (0,015 SOL em Solana) + margem do solver ~4 bps | tempo típico: não informado | API, widget | Sim: hook = instrução(ões) Solana, mas só "non-atomic success-required" (docs.debridge.com/dln-details/overview/deBridge-hooks) |
| Mayan (Wormhole) | Swift, MCTP, Wormhole Swap; qualquer token | Swift 3 bps (busca em docs.mayan.finance) | 2 s / 5 s / <1 min | SDK, widget, referrer | "Attach a payload", via Zaps; detalhe Solana não confirmado |
| NEAR Intents | EVM, Solana, BTC, ZEC t-addr, TON, etc. | 0,0001% + 20-25 bps na 1Click | não li | Widget React, SDK TS/Go/Rust, 1Click API | Só carteira na documentação lida |
| Relay | EVM e Solana (guia de depósito) | US$ 0,02 fixo + 0,00% bridge, 0,01% swap de stable, 0,06% maior, 0,15% menor | Fast Fill | Relay Kit, SwapWidget | "Call Execution" existe; se Solana é destino: não encontrado |
| LI.FI | agregador de pontes/DEX | não li | não li | SDK, API, Widget | "cross-chain contract calls" citado; Solana não confirmado |
| Wormhole | NTT, Connect (UI), Settlement | não li | não li | Connect | não confirmado |
| Jupiter | troca dentro de Solana; cross-chain não confirmado | não li | n/a | Swap API, Ultra, Plugin | Troca na própria Solana |
| SODAX | ver B.1 | 0,1% ou 0,2% (divergência) | 20-30 s (imprensa) | SDK, API, widget | `dstAddress`; contrato não confirmado |

INFERÊNCIA: nenhuma opção testada garante "pagar direto na aposta" sem desenho próprio. O padrão seguro é receber USDC
na carteira do usuário em Solana e só então o usuário assinar `buy_yes`. O hook do deBridge é o caminho documentado
mais próximo de chamar uma instrução, mas é não atômico: o destino pode ficar preso se a instrução falhar.

## C. Integração com o X

### C.1 Mostrar um monitor no site

- Timelines embutidas: só perfil e lista públicos, gerados em publish.x.com
  (https://docs.x.com/x-for-websites/timelines/overview). Busca e hashtag: não mencionadas. Custo: a página não
  informa. A busca confirmou que Likes, Coleções e Moments foram desativados em 13/jan/2023.
- Para hashtag ou menção é preciso a API. Preços (https://docs.x.com/x-api/getting-started/pricing, lida em 3/out/2026):
  pagamento por uso, créditos comprados antes, sem assinatura. Lê post US$ 0,005; usuário US$ 0,010; curtidas US$ 0,001;
  leitura dos próprios dados US$ 0,001; criar post US$ 0,015 (com URL US$ 0,200). Teto de 3 milhões de leituras de
  post por ciclo (https://docs.x.com/x-api/fundamentals/post-cap.md). Recursos são deduplicados em 24 h UTC.
  Plano gratuito: a página não cita nenhum. Planos antigos (Free, Basic, Pro): a página lida não os lista.
- Busca recente (7 dias, até 100 posts por requisição, aceita `#` e `@`) é "available to all developers"; a busca
  completa só para pagamento por uso e Enterprise (https://docs.x.com/x-api/posts/search/introduction). Cada post
  lido é cobrado: 1.000 posts custam US$ 5 (INFERÊNCIA, conta simples a partir de US$ 0,005).

### C.2 Coletar sugestões e o que os termos permitem

- Coleta por consulta de busca com `#hashtag` e `@menção` é suportada pela API (acima).
- Política do desenvolvedor (https://docs.x.com/developer-terms/agreement-and-policy): manter a integridade do
  conteúdo; manter dados armazenados atualizados; remover conteúdo apagado em até 24 h; não contornar limites;
  máximo de 1,5 milhão de IDs de posts redistribuídos por 30 dias sem permissão.
- Regras de automação (help.x.com): a página deu 403; só tenho o resumo de busca (secundário): respostas e menções
  automáticas em massa são restritas, exige consentimento e aviso de bot. Reler antes de qualquer bot de resposta.
- Privacidade: guardar nomes de usuário de quem sugeriu é dado pessoal; aciona a regra de auditoria do projeto.

### C.3 Como Polymarket e Kalshi recebem sugestões

- Polymarket: a equipe cria os mercados; o usuário envia sugestão no X marcando @polymarket, com título proposto,
  fonte de resolução e evidência de demanda (artigo 13364541; resumo em knowledge-base/referencias/polymarket-help.md).
- Kalshi: portal de ideias em kalshi.com/ideas/feed; a equipe avalia conformidade com a CFTC, risco de manipulação e
  interesse; sem promessa de listagem (https://help.kalshi.com/en/articles/13823833-suggesting-a-new-market).

## O que parece viável para a primeira versão (INFERÊNCIA)

1. Monitor do X: embutir uma LISTA pública do X curada pelo projeto, sem custo de API (a lista exige curadoria
   manual), mais uma página com o roteiro de sugestão no estilo Polymarket (título, fonte de resolução, evidência).
2. Se houver busca por hashtag: um job do servidor com orçamento fixo de créditos. Exemplo: 5.000 posts/mês
   ≈ US$ 25. Mostrar só o ID e o link do post, para seguir as regras de exibição e apagamento.
3. Entrada de outras redes: abrir o widget de um agregador (NEAR Intents, Relay ou deBridge) que entregue USDC na
   carteira do usuário em Solana, e o usuário então aposta. Taxas de 0 a poucos bps nos casos documentados.
4. Patrocínio privado: adiar. Cloak não documenta destinatário PDA, o relatório de auditoria não saiu, e há
   risco regulatório citado. Se entrar, só como "patrocinador chega por carteira nova" e com texto honesto na UI.
5. Contrapartida de marketing: independe das ferramentas acima; é decisão de produto, não pesquisei.

## Perguntas em aberto

- O Cloak aceita saque para PDA/conta fora da curva? Onde o token cai (ATA) e quem paga a criação? Testar em mainnet com
  valor mínimo ou perguntar ao time.
- Qual Cloak é o das ferramentas do Lucas? Confirmar com o fundador a origem de cloak-pay/send/shield/swap.
- O relatório de auditoria do Cloak será publicado? Quem audita? Há chave de upgrade com multisig 3 de 4.
- O que o fundador quis dizer com "SODEXA"?
- CCTP v2 permite `hookData` com Solana como destino? Relay e LI.FI suportam chamada de programa em Solana?
- A página de embed do X é gratuita? Há plano gratuito remanescente na API? Reler a página de preços no console.
- Regras de automação do X (help.x.com) e política de apagamento para um bot de sugestões.
- Aspectos legais de oferecer patrocínio privado em mercado de previsão: não pesquisado, sem opinião.
- O USDC da Circle em Solana é SPL Token clássico? Confirmar em developers.circle.com.

## Fontes

Todas consultadas em 3/out/2026. Primárias:
- Cloak: https://www.cloak.ag, https://docs.cloak.ag (llms.txt, llms-full.txt, sdk/introduction, sdk/api-reference,
  platform/transaction-flows, guide/faq, operations/security, ai-tools/ai-integration)
- Solana: https://solana.com/docs/finance/privacy, https://solana.com/docs/tokens/extensions/confidential-transfer
- Helius: https://www.helius.dev/docs/privacy e /privacy/integration/wallet.md
- Light: https://www.lightprotocol.com/, https://www.zkcompression.com/
- Zashi CrossPay: https://zodl.com/private-cross-chain-payments-with-zashi-crosspay/
- NEAR Intents: https://docs.near-intents.org/ (llms.txt, resources/fees.md, resources/chain-support.md)
- Tesouro dos EUA: https://home.treasury.gov/news/press-releases/jy0916 e /sb0057
- Circle CCTP: https://developers.circle.com/cctp e /cctp/concepts/fees
- deBridge: https://docs.debridge.com (fees-overview, dln-details/overview/fee-structure, deBridge-hooks)
- Mayan: https://docs.mayan.finance/resources/technical-faq.md
- Relay: https://docs.relay.link/llms.txt, /references/api/api_core_concepts/fees.md
- LI.FI: https://docs.li.fi/ ; Wormhole: https://wormhole.com/docs/products/overview/ ; Jupiter: https://developers.jup.ag/
- SODAX: https://docs.sodax.com/ , /swap.md , /solana/swaps
- X: https://docs.x.com/x-api/getting-started/pricing, /x-api/fundamentals/post-cap.md,
  /x-api/posts/search/introduction, /x-for-websites/timelines/overview, /developer-terms/agreement-and-policy
- Kalshi: https://help.kalshi.com/en/articles/13823833-suggesting-a-new-market
- Polymarket: knowledge-base/referencias/polymarket-help.md (do repositório)

Secundárias (marcadas no texto):
- Solana Compass: /projects/cloak, /news/cloak-launches-private-payroll-on-solana-for-usdc-and-usdt-salaries,
  /news/confidential-transfers-return-to-solana-mainnet-after-year-long-security-pause
- Range: https://range.org/blog/how-cloak-screens-for-sanctioned-addresses-before-its-privacy-layer-applies
- MadeOnSol: https://madeonsol.com/tools/cloak
- The Block: Umbra (post 394892), Arcium (post 387564), retrial de Storm (2026-08-26); Decrypt (SoDEX, post 346354)
- The Defiant e Willkie sobre Tornado Cash/Van Loon; Privacy Cash em mintlify.wiki
- Não lidos (403 ou resumo apenas): reports.zellic.io/publications/cloak-v1, help.x.com/.../x-automation,
  npmjs.com/@cloak.dev/sdk, github.com/Machine-Labz/cloak (repositório vazio na leitura)

## SODAX: segunda leitura (3 de outubro de 2026, o fundador confirmou que é a empresa que quer usar)

Resolve a pergunta "O que o fundador quis dizer com SODEXA?": é SODAX (https://www.sodax.com). Fonte: docs oficiais
em docs.sodax.com. Leituras de resumo de modelo auxiliar; o que importa foi lido em mais de uma página.

- O que é. FATO: protocolo "non-custodial" que roteia liquidez entre redes; o usuário declara uma intenção (intent),
  solvers independentes a executam e o sistema liquida. Arquitetura hub e spokes; o hub é a Sonic. Só mainnet, sem
  testnet (docs.sodax.com/developers/deployments/mainnet.md).
- Redes. FATO: EVM (Sonic, Ethereum, Avalanche, Base, Optimism, Arbitrum, Polygon, HyperEVM, Lightlink, RedBelly) e
  não EVM (Solana, Sui, Hedera, Robinhood Chain, ICON, Injective, NEAR, Stellar, Kaia, BSC). Cerca de 140 ativos
  como destino; 21 ativos ao vivo para troca em Solana, e USDC em Solana consta nas listas de swap e de money market
  (docs.sodax.com/solana/networks-and-assets.md).
- Solana como destino. FATO: sim. "Funds settle directly to the recipient's address"; em Solana a saída chega como
  saldo de token SPL na carteira do destinatário (docs.sodax.com/solana/swaps). Solana também é origem: o usuário
  assina uma transação Solana que declara a intenção.
- SDK e widget. FATO: `@sodax/sdk` (TypeScript), `@sodax/dapp-kit` (ganchos React, recomendado em React), API HTTP,
  e widget em iframe (altura mínima de 760 px; parâmetros `srcChain`, `dstChain`, `srcToken`, `dstToken`, `lockSrc`,
  `lockDst`, `allowedSrc`, `allowedDst`). Carteiras no widget: EVM, Solana, Sui, Stellar, NEAR, Stacks e Injective.
  Chamadas do SDK: `getQuote()`, `swap()`, `getStatus()`. Cotação não exige carteira.
- Taxas. FATO: taxa de protocolo fixa de 0,1% mais taxa de parceiro opcional (`getSolverFee()`, `getPartnerFee()`);
  a taxa de parceiro do widget exige configuração de implantação, "not something a page can set". Resolve em parte a
  divergência da seção B.1: 0,1% é o piso da doc; os 0,2% da imprensa podem incluir taxa de parceiro (INFERÊNCIA).
  Tempo: a doc não informa segundos; imprensa disse 20 a 30 s (secundário, sem reconfirmar).
- Entrega só em carteira ou chama instrução? Não encontrado como recurso de produto. A página de intents lista o
  campo `data` ("additional arbitrary data", usado para taxas) e o resumo não achou gancho nem chamada de contrato na
  liquidação; a doc diz que os tokens saem por transferência determinística do AssetManager. Existe um "Generalized
  Messaging Protocol", mas a página lida mostra exemplos em Solidity e não fala de Solana. INFERÊNCIA: o caminho seguro
  é a saída em USDC na carteira do usuário em Solana, e só depois o usuário assina `buy_yes`. Cuidado: a doc avisa que
  as mensagens do widget são "best effort"; confirmar a liquidação no servidor antes de creditar.
- Status e auditorias. FATO: mainnet ao vivo. A página de auditorias lista oito relatórios: contratos spoke em Sui,
  Solana, Soroban e NEAR; Stacks (fev. de 2026); Relay (nov. de 2025); revisão colaborativa (ago. de 2025);
  cofre de LST e alavancagem (Sherlock, maio de 2026). Auditores só nomeados no último; o da Solana não tem data na
  lista (docs.sodax.com/developers/audits/index.md). Relatórios em PDF não lidos.
- Não encontrado: tempo oficial de entrega, limite de valor por intenção, profundidade para USDC, e se o relayer pode
  entregar a um endereço PDA (a doc fala em "recipient's address" sem restringir).
- Fontes novas: https://docs.sodax.com/developers/deployments/mainnet.md, /solana/networks-and-assets.md,
  /solana/swaps, /developers/technical-overview/intents.md, /developers/technical-overview/
  generalized-messaging-protocol.md, /widget/index.md, /developers/audits/index.md, /llms.txt.
