# Polymarket Help Center: o produto visto pelo usuário

Data da leitura: 3 de outubro de 2026.
Escopo: https://help.polymarket.com/en/ (sitemap + 5 coleções + 36 artigos). Leitura feita por extração com
modelo auxiliar (WebFetch), não por cópia literal; números e citações vieram dessas extrações.
Nada foi completado de memória. Onde o artigo não diz algo, está escrito "não informado".

## Resumo em dez linhas

1. Polymarket se descreve como mercado de previsão em que o usuário negocia com outros usuários, sem "casa".
2. Ações YES/NO custam entre 0,00 e 1,00 USDC; a vencedora paga US$ 1,00; preço = probabilidade.
3. Mercados são criados pela equipe da Polymarket; o usuário só sugere (via X/Twitter).
4. Resolução via UMA Optimistic Oracle: proposta com bond de US$ 750, janela de 2 h, disputa por votação UMA.
5. Saída antes da resolução: ordem a mercado (preço de bid) ou limite (só executa se houver comprador).
6. Taxa só para taker, fórmula C x taxa x p x (1-p), de 0 a 0,07 conforme categoria; maker não paga.
7. Depósito/saque em cripto: sem taxa da plataforma; mínimos US$ 20 (Ethereum) e US$ 3 (Solana).
8. Cadastro por Google, e-mail (código de 6 dígitos) ou carteira; modelo não custodial; a KYC não é citada.
9. 39 países bloqueados, 4 só para fechar posição, 7 regiões; VPN proibida; EUA têm app iOS separado.
10. Recompensas: holding 3,25% a.a., liquidez, rebates de maker, indicação (10%/5% das taxas), patrocínio.

## 1. Quem cria os mercados e se o usuário pode sugerir

Fatos (https://help.polymarket.com/en/articles/13364541-how-are-markets-created):
- "Markets are created by the markets team with input from users and the community."
- Usuários não criam mercados diretamente; são incentivados a sugerir ideias.
- Uma sugestão deve trazer: título proposto, fonte de resolução e evidência de demanda.
- Envio: no X/Twitter, marcando @polymarket.
- A equipe retém a decisão final sobre quais mercados entram.

Mercados em grupo ("collections") existem: o artigo de embeds diz que só mercados únicos são embutíveis no Substack
(https://help.polymarket.com/en/articles/13364174-how-to-use-embeds).

## 2. Comprar, vender, sair antes, ordens, preço e probabilidade

Fatos:
- Ações YES/NO entre 0,00 e 1,00; cada par é colateralizado por US$ 1,00 USDC; a vencedora paga US$ 1,00
  (https://help.polymarket.com/en/articles/13364060-what-is-polymarket).
- Ações são criadas quando lados opostos concordam em odds que somam US$ 1,00; um YES a US$ 0,60 casa com um NO a
  US$ 0,40 (https://help.polymarket.com/en/articles/13364488-how-are-prices-calculated).
- Preço exibido = ponto médio do spread bid-ask; se o spread for maior que US$ 0,10, usa-se o último preço negociado.
  Exemplo deles: bid 34c e ask 40c dão 37% (mesma URL). Mercado nasce com zero ações e sem preço predeterminado.
- Preço = probabilidade ("20-cent shares = 20%"), por oferta e demanda entre usuários
  (https://help.polymarket.com/en/articles/13364272-what-is-a-prediction-market).
- Vender antes: ordem a mercado ao bid vigente no livro, ou ordem limite que só executa se houver comprador; só vale
  antes da resolução (https://help.polymarket.com/en/articles/13364247-can-i-sell-early).
- Ordem limite: pendente, só executa ao preço desejado, pode preencher parcialmente; cancela-se pelo "x" vermelho ou
  no Portfolio. Mercados esportivos: cancelamento automático no início do jogo, atraso de 3 s para ordens executáveis
  (marketable); NBA/MLB: atraso de 1 s ao taker, em teste. Horário do jogo pode mudar e a ordem pode não cancelar
  (https://help.polymarket.com/en/articles/13364444-limit-orders).
- Sem limite de tamanho no livro; sem garantia de executar sem mover o preço; consulte a profundidade
  (https://help.polymarket.com/en/articles/13364481-does-polymarket-have-trading-limits).
- Combos: várias posições em uma negociação; paga se todas as pernas acertarem; payout = produto das probabilidades
  implícitas; só esportes (moneyline, spread, total); botão cinza = falta liquidez/market maker; podem ser vendidos
  antes (https://help.polymarket.com/en/articles/15458600-what-are-combos).
- Esclarecimento de regras limpa o livro: todas as ordens abertas são canceladas; se houver aviso prévio, limpa-se
  também no anúncio (https://help.polymarket.com/en/articles/13364548-how-are-markets-clarified).
- Atualização da exchange, 28/abr/2026 (~11:00 UTC, cerca de 1 h parado): contratos CTF Exchange V2, taxas calculadas
  no casamento, novo colateral pUSD; usuário assina conversão USDC para pUSD, aprova contratos e recoloca ordens
  limite; saldos e posições preservados; auditoria Cantina e Quantstamp
  (https://help.polymarket.com/en/articles/14762452-polymarket-exchange-upgrade-april-28-2026).

## 3. Resolução do ponto de vista do usuário

Fatos:
- Oráculo: UMA Optimistic Oracle. Ao resolver, vencedoras valem US$ 1, perdedoras zero, negociação cessa
  (https://help.polymarket.com/en/articles/13364518-how-are-prediction-markets-resolved).
- Qualquer proponente posta bond de US$ 750 USDC.e; se certo, recupera o bond mais recompensa; se cedo demais ou
  errado, perde os US$ 750. Janela de contestação: 2 horas (mesma URL).
- Disputa (https://help.polymarket.com/en/articles/13364551-how-are-markets-disputed): disputante posta bond igual
  no dapp da UMA; debate de 24-48 h no Discord da UMA; votação de cerca de 48 h por holders do token UMA.
  Resultados: proponente vence (recebe bond e metade do bond do disputante); disputante vence (idem);
  "Too Early" (evento não ocorreu); "Unknown/50-50" raro, mercado divide 50-50.
- "Polymarket is non-custodial and cannot alter or reverse market resolutions. Once finalized by UMA, outcomes are
  immutable." (mesma URL).
- Regras na página do mercado definem fonte, data final e casos de borda; o título só descreve, as regras governam
  (https://help.polymarket.com/en/articles/13364548-how-are-markets-clarified).
- Resgate (claim) falho: causa citada = relógio do dispositivo ou conexão; checar relógio, desligar VPN/extensões,
  esperar 5-10 min por congestionamento, relogar, trocar de rede/dispositivo; senão chat
  (https://help.polymarket.com/en/articles/13550400-how-to-resolve-claim-failed).
- Mercado ambíguo: os artigos só mencionam esclarecimento de regras (limpa o livro) e o desfecho 50-50. Não há texto
  dedicado a "mercado ambíguo"; não confirmado.
- Prazo de pagamento após finalização: não informado nos artigos lidos.

## 4. Taxas e custos

Fatos (https://help.polymarket.com/en/articles/13364478-trading-fees):
- Fee = C x taxa x p x (1-p); só takers pagam; makers nunca. Simétrica em torno de 50%.
- Taxa taker / rebate de maker: Crypto 0,07 / 20%; Sports 0,05 / 15%; Finance 0,04 / 25%; Politics 0,04 / 25%;
  Economics 0,05 / 25%; Culture 0,05 / 25%; Weather 0,05 / 25%; Other 0,05 / 25%; Mentions 0,04 / 25%;
  Tech 0,04 / 25%; Geopolitics 0 (sem taxa).
- Arredondamento a 5 casas, mínimo 0,00001 USDC; abaixo disso vira zero.
- Sem cobrança em depósito/saque de USDC (intermediários externos podem cobrar).
- Divergência entre fontes: o artigo de Maker Rebates dá 20% para Sports, o de taxas dá 15%
  (https://help.polymarket.com/en/articles/13364471-maker-rebates-program). Não resolvido.
- Maker Rebates: rebate diário em USDC financiado por taxas de taker, mínimo US$ 1; competição só dentro de cada
  mercado; taxas só em mercados criados após ativação com feesEnabled (mesma URL).

## 5. Depósito e saque

Fatos:
- Depósito (https://help.polymarket.com/en/articles/13369887-how-to-deposit): botão Deposit, método (ex.: Transfer
  Crypto), token e rede, copiar endereço, enviar mínimo. Endereço fixo por perfil, não pode ser regenerado. Endereços
  distintos por rede (Solana, Bitcoin, Polygon/EVM). Mínimos: Ethereum US$ 20, Solana US$ 3; abaixo do mínimo fica
  pendente até somar. Recomendam testar com valor pequeno; envio à rede errada é irreversível, com ferramenta de
  recuperação. Atualizado em 8/jun/2026.
- Saque (https://help.polymarket.com/en/articles/13369898-how-to-withdraw): Portfolio, Withdraw, endereço, token,
  valor e rede. Taxas, mínimos, prazos e redes: não informados.
- Rede base: Polygon, USDC, "pegged 1:1"; transações públicas
  (https://help.polymarket.com/en/articles/13364268-why-crypto).
- Depósito perdido (https://help.polymarket.com/en/articles/13364241-recover-missing-deposit): enviado direto ao
  endereço do perfil (carteira Polygon). Ferramenta recovery.polymarket.com para Ethereum (paga gás em ETH, deploy de
  Safe) e Polygon (tokens USDT, POL, nUSD). Base, Arbitrum, Optimism, BSC: só via suporte com hash. Irrecuperável:
  fundos enviados ao contrato CTF Exchange, redes não suportadas, endereços que não são de conta. Se o botão não
  creditar em 10+ min: conferir no explorer, token/rede/mínimo, recarregar, suporte com hash, token/valor e rede.

## 6. Conta

Fatos:
- Cadastro (https://help.polymarket.com/en/articles/13369877-how-to-sign-up): Google, e-mail com código de 6 dígitos,
  ou carteira (MetaMask, Rabby, Phantom citadas) assinando 2 mensagens (conectar e habilitar negociação). Nunca
  compartilhar o código; suporte não recupera fundos perdidos assim.
- Não custodial: Polymarket nunca detém o USDC do usuário; perder chave/senha = perda permanente
  (https://help.polymarket.com/en/articles/13364260-is-my-money-safe).
- Exportar chave (quem entrou por e-mail): https://reveal.magic.link/polymarket, 4 passos; staff nunca pede a chave
  (https://help.polymarket.com/en/articles/13364258-how-do-i-export-my-key).
- Geografia (https://help.polymarket.com/en/articles/13364163-geographic-restrictions): 39 países bloqueados (inclui
  EUA, Reino Unido, Rússia, Irã, Coreia do Norte, Cuba, Venezuela); 7 regiões restritas (Canadá: Alberta, Colúmbia
  Britânica, Ontário, Quebec; Ucrânia: Crimeia, Donetsk, Luhansk); 4 países "close-only" (Singapura, Polônia,
  Tailândia, Taiwan). VPN proibida (Termos 2.1.4). Vale a localização física, não a residência. Exemplos: Itália só
  visualiza; Alemanha mantém posições até resolver. Base declarada: OFAC, leis locais, AML e KYC.
- Verificação de identidade (KYC): nenhum artigo lido descreve um processo; só aparece como base de conformidade.
- Site x app (https://help.polymarket.com/en/articles/15458828-website-vs-app-what-s-the-difference): polymarket.com
  para fora dos EUA; app iOS separado para residentes dos EUA, contas não conectadas, suporte support@polymarket.us;
  Android "coming soon".
- Excluir conta (https://help.polymarket.com/en/articles/15458866-how-to-delete-your-polymarket-account): fechar
  posições e sacar tudo; em polymarket.com/settings?tab=account; histórico permanece on-chain.
- Suporte (https://help.polymarket.com/en/articles/13364256-how-do-i-contact-support): chat azul no site;
  support@polymarket.com.
- Token (https://help.polymarket.com/en/articles/13364250-does-polymarket-have-a-token): colateral é pUSD (ERC-20 em
  Polygon, lastro USDC); nenhum airdrop ou TGE anunciado; alertam contra golpes.
- API (https://help.polymarket.com/en/articles/13364254-does-polymarket-have-an-api): sim, docs.polymarket.com, código
  aberto, canal #devs no Discord.

## 7. Recompensas, rendimento, indicação, ranking

Fatos:
- Holding Rewards (https://help.polymarket.com/en/articles/13364459-holding-rewards): 3,25% a.a. sobre valor de
  posições elegíveis (YES e NO a preço médio), pago diariamente com amostra aleatória por hora; taxa mutável; só 18
  mercados listados (política dos EUA, líderes internacionais, preços de BTC, ETH, SOL, XRP, HYPE); migração "1-click"
  prevista com novos sistemas de recompensa e oráculo ainda em 2026.
- Liquidity Rewards (https://help.polymarket.com/en/articles/13364466-liquidity-rewards): ordens limite perto do
  ponto médio; paga se o dia atingir US$ 1, por volta de 00:00 UTC, sem acumular; mercado com ponto médio abaixo de
  US$ 0,10 exige ordens dos dois lados.
- Indicação (https://help.polymarket.com/en/articles/14174498-referral-program): exige US$ 10.000 de volume vitalício;
  10% das taxas líquidas de indicados diretos, 5% de indiretos; cadastro em até 30 dias do clique; recompensa por 30
  dias ou até o nível Platinum; pago diariamente à meia-noite UTC em pUSD; veda auto-indicação e contas ligadas.
- Patrocínio de mercado (https://help.polymarket.com/en/articles/13755867-sponsor-market-rewards): depositar USDC em
  contrato para incentivar provedores de liquidez; mínimo US$ 0,1 por dia; 1 patrocínio ativo por mercado; distribui
  às 00:00 UTC; cancelar devolve só a partir do próximo ciclo; sem benefício monetário ao patrocinador.
- Ranking/leaderboard: não aparece nos artigos lidos.

## 8. Impostos e relatórios

Nenhum artigo lido trata de impostos ou relatórios fiscais. Não informado.

## 9. Dúvidas frequentes e problemas que geram suporte

Fatos (a coleção FAQs tem 15 artigos; Troubleshooting tem 2):
- Dinheiro "perdido" ao depositar fora do botão ou na rede errada (artigo de recuperação, 4 redes sem ferramenta).
- Erro de rede e "Claim failed": causas citadas são VPN/proxy, relógio do dispositivo, cache, congestionamento
  (https://help.polymarket.com/en/articles/13510453-how-to-resolve-network-error).
- "A Polymarket é a casa?" e "meu dinheiro está seguro?" (custódia e chave privada).
- Onde posso usar (restrições geográficas; site x app).
- Posso vender antes? Existe token/airdrop? Como exportar a chave? Como excluir a conta?
- Combos sem liquidez para sair.
- Ordens canceladas após esclarecimento ou início de jogo.
Inferência: as listas acima vêm da estrutura da central, não de dados de volume de tickets.

## Não lido

Nenhuma página falhou. Observações: dos cinco índices de coleção só abri FAQs e Trading (Getting Started, Markets e
Troubleshooting foram cobertos pelo sitemap e pela home). Os artigos foram lidos via extração por modelo, que pode
omitir detalhes; links internos para docs.polymarket.com, UMA e recovery.polymarket.com não foram seguidos.

## O que isto sugere para o nosso produto (inferência minha, não fato)

- O usuário não cria mercados lá; criação aberta no nosso caso exige regras claras de fonte de resolução na página,
  pois a Polymarket já usa "regras governam, título só descreve".
- A maior fonte de confusão deles é depósito/saque e erros de resgate; carteira Solana nativa evita parte disso.
- Pote parimutuel dispensa livro, spread e ordens limite, mas perde "vender antes" ao preço de mercado; precisa de
  resposta explícita a essa dúvida.
- Resolução on-chain sem disputa elimina o fluxo bond/janela/votação, mas também o recurso a esclarecimento.
- Eles listam token de colateral, sem token de governança; "token próprio" gera pergunta de airdrop e golpe.
- Taxa: modelo só-taker com curva p(1-p) não se aplica a pote; definir custo único e visível.

## Fontes

Todas lidas em 3/out/2026:
- https://help.polymarket.com/en/ e https://help.polymarket.com/sitemap.xml
- Coleções: .../collections/17859622-faqs e .../collections/17859610-trading (as demais listadas na home)
- Artigos (36), prefixo https://help.polymarket.com/en/articles/ : 13364060, 13364163, 13364174, 13364238, 13364241,
  13364247, 13364250, 13364254, 13364256, 13364258, 13364260, 13364264, 13364268, 13364272, 13364444, 13364459,
  13364466, 13364471, 13364478, 13364481, 13364488, 13364518, 13364541, 13364548, 13364551, 13369877, 13369887,
  13369898, 13510453, 13550400, 13755867, 14174498, 14762452, 15458600, 15458828, 15458866 (slugs conforme sitemap)
