# Baked Market — briefing do modelo de pote

**De:** Lucas · **Para:** Ronaldo · **Data:** 3 de outubro de 2026 · **Versão:** 0.1 (para discussão)

Este documento descreve o produto que o Lucas quer construir, o que isso muda no programa `pred-provable` e o que
ainda está em aberto. Cada item vem marcado como **[D]** decidido pelo Lucas, **[P]** proposta ainda não aprovada por
ninguém, ou **[A]** em aberto. Os números de mercado trazem a origem; as pesquisas completas estão em
`knowledge-base/` (lista no fim). Nada aqui foi implementado.

## 1. Resumo

1. **[D]** O produto é um mercado de previsão, não uma recompensa por meta. O modelo de patrocinador que vende YES com
   desconto, que é o que o programa implementa hoje, não é a proposta.
2. **[D]** Cada pergunta tem uma pool (pote). As apostas entram no lado SIM ou NÃO; quem acerta divide o pote.
3. **[D]** A pool tem três trilhas de entrada de dinheiro: as apostas, o patrocinador e o token da plataforma.
4. **[D]** A equipe abre as perguntas. O público sugere, de preferência pelo X. Um patrocinador pode pedir uma
   pergunta com depósito travado, que a equipe aprova ou devolve.
5. **[D]** A resolução continua sendo leitura de dado on-chain, sem oráculo humano. Pode acontecer antes da data.
6. **[D]** Público web3, carteira, sem KYC. Bloqueios geográficos ficam para depois das definições de produto.
7. **[D]** Haverá um token da plataforma, lançado no pump.fun como marketing; uma rodada privada pode vir depois.
8. **[D]** Nome: Baked Market. Mascote: Baked. Layout: Ledger² no escuro, com tema claro.
9. **[P]** Taxa de 3% do pote; plano de token na seção 7; rendimento do pote só em potes de SOL, seção 8.
10. O que se aproveita do código atual é o que ele tem de mais sólido: os leitores on-chain e a resolução.

## 2. Por que mudar

O programa atual responde bem à pergunta "como pagar alguém para cumprir uma meta on-chain". O Lucas quer responder a
outra: "como deixar o público web3 apostar em fatos que a própria chain decide". As diferenças práticas:

| | Programa atual | Baked Market |
|---|---|---|
| Quem põe o dinheiro primeiro | O patrocinador, com um orçamento | Os apostadores |
| Preço | YES a preço fixo escolhido pelo patrocinador; pool opcional | Não há preço: há a fatia de cada lado no pote |
| Limite de compra | O orçamento limita o YES subsidiado | Nenhum |
| Lado NÃO | Só por par ou pela pool | Aposta direta, igual ao SIM |
| Posição do usuário | Tokens SPL de YES e NO | Um registro por apostador |
| Receita | Nenhuma no código; `ECONOMICS.md` propõe 1% + 1% + 0,5% | Corte do pote |

O que o Lucas viu ao usar o app: sem pool, a "chance" exibida é só o preço que o patrocinador digitou. Dos seis
mercados do seed, cinco estavam nessa situação.

## 3. O produto

### 3.1 Ciclo de uma pergunta

1. **Abertura.** A equipe escolhe um tipo de pergunta do cardápio (seção 9), a conta on-chain, o alvo, a data final e a
   data de fechamento das apostas. O programa valida a conta, como já faz hoje em `validate_new_market`.
2. **Apostas.** Qualquer carteira aposta em SIM ou em NÃO, quantas vezes quiser. O programa guarda o total de cada lado
   e, por apostador, quanto ele pôs em cada lado.
3. **Fechamento.** As apostas param na data de fechamento, ou antes, no instante em que o fato vira verdade (a trava
   `require_trading_open` já faz isso).
4. **Resolução.** Qualquer pessoa chama `resolve`. SIM se o fato está verdadeiro; NÃO se a data final passou.
5. **Resgate.** Quem acertou recebe a sua parte do pote, menos a taxa.

### 3.2 A conta do pote

Com 300 USDC no SIM, 700 no NÃO e taxa de 3%: o pote é 1.000, sobram 970 para os vencedores. Se der SIM, cada 1 USDC
apostado no SIM recebe 970 ÷ 300 = 3,23. Se der NÃO, cada 1 USDC no NÃO recebe 970 ÷ 700 = 1,39. A "chance" mostrada
na tela é a fatia do pote: SIM 30%.

Duas consequências que o usuário precisa ver na tela: o retorno só fica definido quando as apostas fecham, e uma
aposta grande num lado baixa o retorno desse lado.

### 3.3 Regras já definidas

- **[D] Pote de um lado só:** devolve as apostas, cobrando a taxa.
- **[D] Fechamento padrão:** quando passarem 80% da duração, e nunca menos de 24 horas antes da data final. Um prazo
  menor que 24 horas é opção avançada, com dupla confirmação e registro de quem aprovou.
- **[D] Saída antes da resolução:** fica para a fase 2. A ideia é devolver a aposta menos uma penalidade que fica no
  pote. Ela só funciona se fechar junto com as apostas e com penalidade crescente; aberta até o fim, todo perdedor
  sairia e o prêmio sumiria.
- **[P] Moeda:** USDC no MVP, com conversão de SOL e de outros tokens na entrada.

## 4. O que muda no programa

| Parte | Destino |
|---|---|
| `resolver.rs`, os nove leitores, `validate_new_market`, `ratchet_met` | Fica como está |
| `resolve` (aberto a qualquer um, só no topo, definitivo) | Fica como está |
| `require_trading_open` | Fica; passa a guardar a aposta em vez da compra |
| Cofre PDA `["vault", market]`, `transfer_checked`, eventos | Ficam |
| Leitores do cliente (`app/lib/metric.ts`), fixtures e testes dos resolvedores | Ficam |
| `Market`: `budget`, `sponsor_no`, `yes_mint`, `no_mint`, `pool_yes`, `pool_no`, `yes_price_bps` | Saem; entram `pot_yes`, `pot_no`, `bet_cutoff`, taxa |
| `buy_yes`, `withdraw_budget`, `mint_pair`, `burn_pair`, `add_liquidity`, `remove_liquidity`, `swap` | Saem |
| `create_market` | Fica em parte: sem orçamento nem mints, restrita à equipe |
| Novo | `place_bet`, conta `Position` por apostador, `claim`, devolução, cofre de taxas, pedido de pergunta com depósito |

As invariantes mudam para: `vault == pot_yes + pot_no + prêmio` enquanto aberto, e a soma dos resgates mais a taxa
igual ao cofre no fim. O teste aleatório de invariantes continua valendo como método.

Referências úteis clonadas em `F:\AceleradoraECO\solana-refs\`: o programa `escrow` da Solana Foundation (depósito com
recibo e trava de tempo, serve de molde para o pedido de pergunta) e o `rewards` (distribuição proporcional contínua,
serve de molde para repasse a holders).

## 5. Patrocinador (trilha 2)

**[D]** Patrocinador é quem coloca um valor mínimo maior na pool de uma pergunta. Valor em discussão: 500 USDC.
**[D]** Pode pedir uma pergunta: o depósito fica travado, a equipe revisa, e a recusa devolve tudo.
**[D]** Pode ficar anônimo, usando o Cloak para esconder o pagador. **[D]** Recebe contrapartidas.

**[P] Duas formas, com o prêmio neutro como padrão:**

- **Prêmio neutro:** dinheiro somado ao pote sem lado. Aumenta o retorno de quem acertar, dos dois lados. É o que
  funciona como marketing. Precedente: no Polymarket qualquer usuário deposita USDC para premiar um mercado, e o saldo
  não gasto volta.
- **Aposta de patrocinador:** uma aposta grande num lado, com selo. Atenção ao efeito: com 1.000 em cada lado, cada
  lado paga 1,94 vez; se o patrocinador põe 5.000 no SIM, o SIM passa a pagar 1,13 e o NÃO, 6,79.

**[P] Contrapartidas**, cada uma com precedente: selo "Patrocinado por X" ou "Anônimo"; destaque na home por 12 a 24
horas; posição fixa por um dia; texto do patrocinador na pergunta, revisado pela equipe; publicação no nosso X;
devolução do saldo não usado.

**[A]** Um patrocinador anônimo que controla o resultado da pergunta é o caso que as regras de integridade do
Polymarket proíbem. Proposta: anônimo só coloca prêmio neutro.

**Limites do Cloak**, segundo o `PRIVACY_PLAN.md`: só mainnet; o operador vê tudo e pode recusar; o cofre de USDC
tinha cerca de 2.560 USDC, então um patrocínio de 500 é um quinto dele e fácil de associar.

## 6. Receita

**[P]** 3% do pote, cobrados no resgate e na devolução. Referências de pote: PancakeSwap Prediction 3% (documentação
oficial) e FactCheck 2,5% (fonte secundária). Polymarket e Kalshi cobram por negociação, no máximo cerca de 1,75
centavo por contrato de 1 dólar.

**[P] Destino de cada 100 dólares de taxa:** 50 para a operação, 25 para recompra e queima do token, 25 para o fundo
de prêmios (trilha 3).

| Apostado por mês | Taxa (3%) | Operação | Recompra e queima | Fundo de prêmios |
|---|---|---|---|---|
| US$ 250 mil | 7.500 | 3.750 | 1.875 | 1.875 |
| US$ 1 milhão | 30.000 | 15.000 | 7.500 | 7.500 |
| US$ 5 milhões | 150.000 | 75.000 | 37.500 | 37.500 |

O `ECONOMICS.md` assume 25 mil dólares de custo mensal. Com essa divisão a operação só se paga perto de 1,7 milhão
apostado por mês. Referência de escala: a Limitless movimentou 10,1 milhões em 30 dias (DefiLlama, 3/10/2026).

## 7. Token (trilha 3)

### 7.1 O que o pump.fun impõe (documentação oficial, 20/05/2026, e leitura da mainnet em 3/10/2026)

- 1 bilhão de tokens, 793,1 milhões na curva. Sem reserva de equipe e sem vesting.
- De cada compra na curva, 98,75% vai para a reserva da própria curva, 0,95% para o pump.fun e 0,30% para o criador.
  Depois da formatura a taxa do criador vai de 0,95% a 0,05%, conforme o valor de mercado.
- A taxa do criador pode ser dividida entre até 10 carteiras. A divisão é definida uma única vez e não muda.
- "Holder Rewards": a taxa do criador inteira vai para quem segura o token, paga pelo pump.fun. É irreversível.
- **Os tokens novos são Token-2022**, com metadados dentro do próprio token e autoridades revogadas (7 de 7 na amostra).

### 7.2 A ideia do Lucas e o que dá para fazer

A ideia: de cada 1 dólar comprado do token, 30% viram liquidez nas pools das perguntas. **Não é possível no
pump.fun**: o dinheiro da compra fica na curva, e o criador recebe só a taxa de criador. Nenhuma alternativa pesquisada
(Meteora DBC, Bags, Raydium LaunchLab) devolve algo perto de 30%.

O que dá para fazer com o mesmo objetivo: o token alimenta as pools com o que ele gera de fato.

### 7.3 Plano proposto [P]

| Fonte | Destino | Efeito |
|---|---|---|
| Taxa de criador do pump.fun | Holder Rewards: 100% para quem segura | O "dividendo", pago pelo pump.fun, sem programa nosso |
| 25% da taxa da plataforma | Recompra e queima do token | Liga o uso da plataforma ao token |
| 25% da taxa da plataforma | Fundo de prêmios nas pools | A trilha 3: prêmio neutro nas perguntas em destaque |
| Saldo do token na carteira | Desconto na taxa de aposta | Motivo de uso para segurar |
| Saldo do token na carteira | Peso no voto de quais sugestões a equipe abre | Liga o token ao X e à comunidade |

Precedentes: PancakeSwap queima os 3% do pote; Rollbit usa de 10% a 30% da receita em recompra e queima; Shuffle
sorteia 15% da receita semanal entre quem faz staking (os dois últimos, fonte secundária).

**Saúde econômica.** Prêmio no pote é gasto de marketing: cada dólar de prêmio só se paga se atrair cerca de 33
dólares de apostas a mais. Por isso o fundo é uma fração da receita, não uma obrigação ligada à compra do token.

**Avisos.** Recompra não garante preço: o PUMP recomprou mais de 350 milhões de dólares e ficou cerca de 81% abaixo do
pico (fonte secundária). GMX e Gains suspenderam o repasse a quem fazia staking em 2026. O `ECONOMICS.md` já aponta que
repasse de receita a holders é o que reguladores examinam. Não foi achado nenhum caso de plataforma com produto real
que tenha lançado pela curva do pump.fun.

**[A]** Rodada privada depois: com 1 bilhão fixo e tudo na curva, só há tokens para vender se a tesouraria os comprar
antes. Um segundo token tem o precedente ruim do próprio PUMP, criticado pela rodada privada.

**Conflito com o `ECONOMICS.md`:** lá há venda pública de 22%, equipe com 15% e vesting, e 40% da receita para
staking. Não cabe num lançamento pelo pump.fun. Precisa de decisão conjunta.

## 8. Rendimento do pote

O Ronaldo está certo para o USDC: parado no cofre ele não rende, e para render tem de ser emprestado. Segurar um
recibo de Kamino ou de Jupiter Lend é ter o dinheiro emprestado.

Existe um desenho em que o ativo fica no nosso cofre e rende: **pote em SOL guardado como token de staking líquido**.
O apostador paga em SOL, o programa deposita na pool de staking e o cofre segura o token (JitoSOL rendia 4,85% ao ano
e mSOL 4,96% em 3/10/2026, pelas APIs oficiais). O valor do token em SOL sobe a cada época.

| Pote | 7 dias | 30 dias | 180 dias | Taxa de 3% |
|---|---|---|---|---|
| 1.000 SOL | 0,93 | 3,99 | 23,9 | 30 |

Descontado o custo de saída de 0,1%, sobra perto de zero em 7 dias e 0,30% do pote em 30 dias. O rendimento empata
com a taxa só depois de 226 dias.

Custos: o prêmio passa a variar com o preço do SOL; o `USDC_MINT` fixo do programa tem de virar parâmetro;
`WithdrawSol` só paga a conta de sistema e depende da reserva da pool, então o mais simples é pagar o vencedor no
próprio token de staking. Nenhum mercado de previsão foi achado fazendo isso.

**[P]** Fora do MVP em USDC. Entra se e quando houver potes em SOL para perguntas de 30 dias ou mais.

## 9. Tipos de pergunta

Construídos (nove): queima de oferta, renúncia de emissão, renúncia de congelamento, programa imutável, tokens
travados, stake de validador numa época, TVL de pool de staking numa época, liquidez travada para sempre na Meteora
DAMM v2, metadados imutáveis.

**Achado que muda a ordem:** os tokens do pump.fun são Token-2022 e os quatro leitores de token só aceitam o padrão
clássico. Para o público que queremos, queima e renúncia não funcionam hoje nos tokens que eles negociam, nem no nosso.

**[P] Ordem de construção:** (1) Token-2022 nos leitores de token; (2) preço por oráculo on-chain (Pyth) para ativos
grandes, que é o que esse público mais aposta; (3) formatura no pump.fun com as travas do `RESOLVERS.md`.

**[A]** O Lucas quer perguntas de preço também para tokens pequenos. A objeção do `RESOLVERS.md` é que uma transação
com empréstimo relâmpago move o preço de uma pool, resolve e devolve.

## 10. Em volta do produto

- **Sugestões pelo X [D]:** página com instruções, linha do tempo embutida (gratuita) e formulário que valida a
  sugestão e gera a publicação. Ler menções por API custa 0,005 dólar por publicação (docs.x.com, 3/10/2026).
- **Outras redes [D]:** SODAX. Entrega USDC na carteira em Solana, taxa de 0,1%; não chama instrução de programa.
- **Privacidade [D]:** Cloak para o pagador anônimo, como no `PRIVACY_PLAN.md`, sem mudar o programa.

## 11. Concorrentes

| | Mecanismo | Quem abre | Como resolve |
|---|---|---|---|
| Polymarket | Livro de ordens | A equipe | Oráculo UMA, com disputa |
| Kalshi | Livro de ordens, regulada | A equipe | Fonte oficial e comitê próprio |
| Melee (Solana) | Pote com curva | Qualquer um | O próprio criador |
| Limitless (Base) | Livro de ordens e AMM | Qualquer usuário | Pyth, Chainlink ou manual |
| Baked Market | Pote | A equipe, com pedidos | Leitura on-chain |

Dados da Melee vêm de agregador. Falta pesquisar o PNP Protocol, em Solana.

## 12. Riscos conhecidos

1. Quem controla o resultado pode apostar. Polymarket e Kalshi proíbem; sem KYC só dá para sinalizar.
2. Sem KYC com dinheiro real ainda não teve análise jurídica.
3. Reescrever as instruções econômicas invalida boa parte dos 138 testes e a proposta do `ECONOMICS.md`.
4. O prazo do Colosseum (12 de outubro) é incompatível com a reescrita; o Lucas disse que o hackathon não é
   prioridade agora.
5. Vários números de terceiros são de fonte secundária e estão marcados nos arquivos de pesquisa.

## 13. Perguntas para o Ronaldo

1. O que do modelo de pote você considera errado ou perigoso, tecnicamente?
2. Faz sentido um programa novo ao lado do atual, ou uma versão 2 do mesmo?
3. Quanto custa o suporte a Token-2022 nos leitores, já que você mapeou o formato?
4. Preço por Pyth: você vê forma segura de ler num instante marcado?
5. O que do `ECONOMICS.md` e do `PRIVACY_PLAN.md` você quer manter?
6. Submetemos o modelo atual ao Colosseum e seguimos com o pote depois?

## 14. Onde está a pesquisa

- `knowledge-base/referencias/`: documentação do Polymarket e da Kalshi.
- `knowledge-base/competitors/mercados-de-previsao-web3.md`
- `knowledge-base/market/`: receita, modelos de token, rendimento do pote, patrocínio e destaque pago.
- `knowledge-base/tecnologia/privacidade-entre-redes-e-x.md`
- `session-log/2026-10-03-produto-redefinido-como-mercado-de-pote.md`
