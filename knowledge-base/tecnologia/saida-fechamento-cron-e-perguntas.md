# Saída antecipada, fechamento das apostas, cron de resolução e tipos de pergunta

Data: 4 de outubro de 2026. Agente 1H, Onda 1 (técnica).

Marcações: **FATO** (documentação oficial, código-fonte, dado lido por mim na rede), **FATO SECUNDÁRIO** (imprensa,
agregador, blog, resumo de terceiros), **INFERÊNCIA** (raciocínio meu, incluindo toda conta feita por mim). O que não
achei está escrito como "não encontrado". Os códigos entre colchetes, como [S1] e [C2], apontam para a lista de fontes
no fim.

Limite do método: as páginas foram lidas por ferramenta que devolve resumo; os números importantes foram conferidos em
segunda leitura ou no código-fonte, e isso está dito caso a caso. A cota de busca acabou no meio do trabalho; a seção 7
lista o que ficou sem confirmação.

## Resumo em dez linhas

1. Em nenhum precedente encontrado o pote devolve dinheiro a quem sai. PancakeSwap e o Melee alfa proíbem a saída; o
   Melee novo, as casas de aposta e as bolsas fazem a saída por um terceiro que assume a posição. A devolução com
   penalidade é desenho nosso.
2. Num pote puro não existe "ganho" para realizar antes do fim: quando o seu lado fica mais provável, o prêmio dele
   encolhe na mesma medida. Ganho na saída só existe com curva por lado ou com venda da posição a outra pessoa.
3. Saída recomendada para o MVP: alternativa (b). `devolução = aposta × (1 − penalidade)`, com
   `penalidade = mínimo(90%, 5% + 20% × tempo + queda da chance do seu lado)`. O cofre nunca fica devendo.
4. A saída fecha junto com as apostas livres (marco T1 abaixo) e trava na hora em que o fato acontece.
5. Fechamento gradual: apostas livres até T1 (faltando 20% da duração, no máximo 14 dias); reta final com teto de
   crescimento de 25% por lado; fechamento total em T2 (faltando 5% da duração, mínimo 24 horas, máximo 7 dias).
6. Prazo menor que 24 horas: segunda assinatura de outra chave da equipe, gravada no mercado e num evento on-chain.
7. Cron: o risco real é a meta ser cumprida e ninguém provar até o prazo, o que hoje vira NÃO. Arquitetura: serviço
   nosso, um segundo agendador em outro provedor, botão público e alarme. A chave do cron não tem poder nenhum.
8. O Tuk Tuk (sucessor do Clockwork) não consegue chamar o nosso `resolve` hoje, porque ele rejeita chamadas feitas
   por outro programa. Confirmado só por fonte secundária.
9. Os nove tipos de pergunta caem em três famílias: decisão de quem tem a chave, alguém gastar ou travar dinheiro, e
   foto numa data. A primeira família é perigosa num pote, porque o dono da chave pode apostar.
10. Preço de token pequeno não entra com segurança lendo uma pool num instante. Entra com travas: oráculo Pyth (1.881
    preços, 423 de cripto, em 4/out/2026) ou média no tempo da própria pool, mais teto de pote.

## 0. Vocabulário mínimo

- **Pote (parimutuel):** todas as apostas de uma pergunta vão para um cofre só. No fim, tira-se a taxa e quem acertou
  divide o resto, na proporção do que apostou. Inventado por Joseph Oller em 1867 (FATO SECUNDÁRIO [S7]).
- **Chance mostrada na tela:** é a fatia do pote que está em cada lado. Com 300 no SIM e 700 no NÃO, o SIM mostra 30%.
- **Retorno:** quanto cada 1 USDC apostado recebe se o lado ganhar. No exemplo, com taxa de 3%: SIM recebe
  970 ÷ 300 = 3,23; NÃO recebe 970 ÷ 700 = 1,39.
- **Resolver:** apertar o botão que lê o dado on-chain e grava o resultado, de forma definitiva.
- **Cron:** um despertador de computador. Um programa que acorda de tempos em tempos e faz uma tarefa sozinho.
- **Oráculo:** serviço que traz um dado de fora (por exemplo, o preço do bitcoin) para dentro da blockchain.
- **Empréstimo relâmpago (flash loan):** empréstimo que é tomado e devolvido dentro da mesma transação. Quem pega não
  precisa ter o dinheiro; só paga uma taxa mínima. Serve para mover um número por um instante.
- **Média no tempo (TWAP):** em vez de olhar o preço de um instante, olha a média do preço durante um período.
- **Época (epoch):** o "dia" da Solana para contas de stake. Dura cerca de dois dias (FATO [C2]).

## 1. Saída antes da resolução

Decisão do Lucas (fonte da verdade, ideação, seção 1): "saída antes da resolução, vamos fazer agora no mvp" e "a
pessoa pode sair antes com ganho proporcional menor, ou perca proporcional maior, deixando uma penalidade pro pote."
O briefing (seção 3.3) ainda diz que a saída fica para a fase 2; vale a ideação.

### 1.1 O que os outros fazem

| Onde | Dá para sair antes? | Como | Tipo |
|---|---|---|---|
| PancakeSwap Prediction (pote, rodadas de 5 min) | Não | "Once you enter a position, you can NOT change the direction, add to, or remove your position." | FATO [S1] |
| Corridas de cavalo (totalizador clássico) | Não | Pennock descreve: quem aposta em pote "cannot cash out gains (or limit losses) before the event outcome is revealed" | FATO [S5] |
| Melee, versão alfa (pote com curva por lado, Solana) | Não | "Can I sell before the market ends? No. Once you buy, you hold your position until the market expires." | FATO [S3] |
| Melee, PMM (litepaper, 2026) | Sim, por um cofre separado | Um cofre de investidores ("cashout LP vault") compra a posição com desconto e fica com ela até o fim | FATO [S2] |
| Pote dinâmico de Pennock (2004) | Sim, vendendo a outro apostador | O sistema só vende cotas; "there is not a market maker accepting sell orders". Quem quer sair vende a outra pessoa | FATO [S5] |
| Casas de aposta (cash out) | Sim, a casa recompra a aposta | Valor ≈ aposta × cotação da entrada ÷ cotação atual, menos a margem da casa | FATO SECUNDÁRIO [S8] |
| Polymarket, Kalshi, Limitless (livro de ordens) | Sim, vendendo a outro usuário | Limitless cobra taxa de venda de 0,42% a 1,50%, máxima perto de 50% de chance | FATO [S9] [S28] |
| Loterias | Não encontrado | A página da Caixa recusou a leitura | — |

Três detalhes dos precedentes que importam para o nosso desenho:

- **Melee (FATO [S2]):** o litepaper diz que o desconto da saída "is the cost of on-demand liquidity, not a slippage
  penalty against the pool; when a user cashes out, the cashout LP takes over the position". Ou seja, o pote não é
  tocado: a posição continua lá, só muda de dono. O time que mais estudou pote com curva não deixa vender de volta ao
  pote. Os parâmetros da curva são fechados ("proprietary and are not disclosed").
- **Casas de aposta (FATO SECUNDÁRIO [S8]):** Sky Bet e bet365 dizem que a oferta sai de três números (valor apostado,
  cotação da entrada, cotação atual) e nenhuma publica quanto desconta. A margem de "5% a 15%" que circula não tem
  fonte. Exemplo de um guia: aposta de 10 a 4,00; com a cotação em 1,40 o valor justo é 28,57 e a oferta típica 26,00.
- **Limitless (FATO [S9]):** a taxa de venda é mais alta justamente no meio (50%) e a justificativa oficial é "By
  discouraging exits at this midpoint, the fee curve protects market integrity when uncertainty is highest." É um
  precedente de taxa de saída desenhada para desestimular a saída.

**INFERÊNCIA:** em todo precedente encontrado, sair significa alguém assumir o seu lugar (outro apostador, a casa ou um
cofre de investidores). Devolver dinheiro do próprio pote, cobrando penalidade, não apareceu em nenhum. Isso não proíbe
o desenho do Lucas, mas significa que os números abaixo não têm referência de mercado: são conta nossa e precisam de
simulação na Onda 2.

### 1.2 Por que o pote puro não tem "ganho" para realizar

O Lucas descreveu a saída como "ganho proporcional menor, ou perca proporcional maior". A segunda metade dá para fazer.
A primeira, num pote puro, não tem de onde sair. O motivo, com números:

- Pote: 300 no SIM, 700 no NÃO. Você tem 100 no SIM. Se der SIM, recebe 100 × 3,23 = 323. A chance mostrada é 30%.
  Se a chance mostrada estiver certa, a sua aposta "vale" 30% × 323 = 97.
- Chega dinheiro novo no SIM e o pote vira 600 no SIM, 700 no NÃO. A chance mostrada sobe para 46%. Mas o retorno do
  SIM cai para 970 × 1.300 ÷ 1.000 ÷ 600 = 2,10. A sua aposta agora "vale" 46% × 210 = 97.

O valor não mudou. Numa bolsa (Polymarket, Kalshi), quem comprou a 30 centavos vende a 46 e embolsa a diferença. No
pote não existe preço de entrada: todo mundo do mesmo lado recebe o mesmo retorno, tenha entrado cedo ou tarde. Quando
o seu lado fica mais provável, o prêmio dele encolhe na mesma medida (INFERÊNCIA, conta minha a partir da regra do pote
do briefing, seção 3.2).

Consequência: para pagar um ganho a quem sai, o programa teria de tirar dinheiro de quem ficou. As duas formas
conhecidas de fazer isso com as contas fechando são a curva por lado (alternativa (c), em que quem entra cedo compra
mais cotas por dólar) e a venda da posição a outra pessoa (o que Pennock e o Melee fazem). **A alternativa que
recomendo para o MVP entrega a "perda proporcional maior" e a "penalidade pro pote", mas não entrega ganho.** O Lucas
precisa saber disso antes de aprovar.

### 1.3 Os três riscos, com números

**Risco 1: todo perdedor sai perto do fim e o prêmio some.** O prêmio de quem acerta é o dinheiro de quem errou. Se
quem errou pode pegar o dinheiro de volta quando percebe que vai perder, não sobra prêmio. No pote 300/700, se os 300
do SIM saem pagando 10%, sobram 30 de prêmio. O NÃO, que receberia 1,39 por 1, passa a receber
(700 + 30) × 0,97 ÷ 700 = 1,012. Quem acertou ganha 1,2% (INFERÊNCIA, conta minha).

| Penalidade fixa | Retorno do NÃO se todo o SIM sair | Sem saída |
|---|---|---|
| 5% | 0,991 (o vencedor perde dinheiro) | 1,386 |
| 10% | 1,012 | 1,386 |
| 20% | 1,053 | 1,386 |
| 30% | 1,095 | 1,386 |
| 50% | 1,178 | 1,386 |

**Risco 2: alguém aposta grande para mexer na chance, atrai apostas contrárias e sai.** Exemplo: o pote está 100 a
100. O golpista quer ganhar no SIM. Ele põe 50 de verdade no SIM e mais 2.000 "de mentira" no SIM. A tela passa a
mostrar SIM com 95% e o NÃO pagando muito. Entram 400 no NÃO, atraídos pelo retorno. Na última hora ele retira os
2.000. Sobram 150 no SIM e 500 no NÃO: os 50 dele agora disputam um prêmio muito maior. Precedente documentado desse
golpe em corridas: não encontrado nesta pesquisa; o raciocínio é meu (INFERÊNCIA).

**Risco 3: corrida para sair quando sai uma notícia.** Nos nossos tipos de pergunta a "notícia" tem duas formas:

- O fato acontece on-chain (a queima chegou à meta). Nesse instante o programa já trava apostas, porque a função
  `require_trading_open` lê a conta e recusa quando a meta está cumprida (FATO [C1]). A saída tem de usar a mesma trava.
  Sobra uma fresta: quem está no NÃO pode ver a transação da queima chegando e sair um instante antes.
- O prazo vai acabando e o fato não acontece. O SIM fica cada vez menos provável, devagar, e quem está no SIM quer sair.
  Não há um instante para travar: a defesa é a penalidade crescer com o tempo e a saída fechar antes do fim.

Um fato da literatura reforça os riscos 1 e 3: em potes, quem tem informação espera o último momento. Ottaviani e
Sørensen mostram que apostadores pequenos e bem informados "have an incentive to bet at the end", e que "late bets are
more informative than early bets" (FATO [S6]). Com saída aberta, o mesmo vale ao contrário: a saída tardia é a mais
informada.

### 1.4 Alternativa (a): devolução menos penalidade fixa

**Fórmula.** `devolução = aposta × (1 − k)`, com `k` fixo (exemplo: 10%). A penalidade `aposta × k` fica no pote como
prêmio, sem lado, e vai para quem acertar.

**Exemplo.** Pote 300 no SIM, 700 no NÃO. A Ana tem 100 no SIM e sai: recebe 90, e 10 viram prêmio. O pote passa a
ser 200 no SIM, 700 no NÃO e 10 de prêmio (910 no cofre; 882,70 depois da taxa de 3%).

| | Antes da saída da Ana | Depois |
|---|---|---|
| Retorno do SIM | 3,23 | 4,41 |
| Retorno do NÃO | 1,39 | 1,26 |

Repare no efeito: a saída de alguém do SIM melhora o retorno de quem ficou no SIM e piora o de quem está no NÃO,
porque o NÃO perdeu 100 de prêmio possível e ganhou só 10.

- **O que o usuário vê:** um botão "Sair" com "você recebe 90,00 dos seus 100,00". Sempre a mesma porcentagem.
- **O que acontece com o pote:** encolhe; o lado oposto perde prêmio.
- **Como se abusa:** risco 1 inteiro (tabela acima: com 10%, o prêmio de quem acerta cai de 38,6% para 1,2%). Risco 2
  barato: no exemplo do golpista ele paga 200 de penalidade, o SIM passa a pagar 5,50 por 1, os 50 dele viram 274,83
  e ele lucra 24,83 se der SIM (perde 250 se der NÃO). É uma aposta ruim, mas não é um prejuízo certo. Risco 3: não há
  corrida entre os que saem (todos recebem os mesmos 90%), mas todos saem.
- **Complexidade em Solana:** baixa. Uma instrução nova (`exit`), um campo novo no mercado (`prêmio`) e a invariante
  `cofre = pote do SIM + pote do NÃO + prêmio`, que o briefing já previa (seção 4).

### 1.5 Alternativa (b): penalidade que cresce com o tempo e com a queda da chance

**Fórmula.**

```
devolução   = aposta × (1 − penalidade)
penalidade  = mínimo( 90% ,  5%  +  20% × tempo  +  queda )
tempo       = fração já decorrida da janela de saída (0 na abertura, 1 quando a saída fecha)
queda       = 1 − chance do seu lado na saída ÷ chance do seu lado na sua entrada   (zero se a chance subiu)
```

Três explicações:

- **Os 5% fixos** são o pedágio mínimo: impedem entrar e sair de graça.
- **O tempo** resolve o problema do prazo acabando: quanto mais perto do fim, mais informada é a saída, mais ela custa.
- **A queda** é a conta do cash out das casas de aposta (aposta × chance atual ÷ chance da entrada), só que sem o lado
  do ganho, porque no pote não existe a casa para pagar o ganho (seção 1.2). A "chance na saída" é medida no ponto
  médio da própria retirada, para que sair de uma vez ou em pedaços dê quase o mesmo resultado.

Os números 5%, 20% e 90% são ponto de partida meu, sem referência de mercado (INFERÊNCIA). Precisam de simulação.

**Exemplos** (pote 300 no SIM, 700 no NÃO; todas as contas são minhas).

| Situação | Tempo | Queda | Penalidade | Recebe de cada 100 |
|---|---|---|---|---|
| Aposta pequena (10 dos 300) sai cedo | 25% | 1,2% | 11,2% | 88,83 |
| Ana (100 dos 300) sai cedo | 25% | 12,3% | 22,3% | 77,72 |
| Ana sai na metade da janela | 50% | 12,3% | 27,3% | 72,72 |
| Ana sai quase no fim da janela | 90% | 12,3% | 35,3% | 64,72 |
| A chance do lado dela subiu (pote 900/600), sai na metade | 50% | 0 | 15,0% | 85,00 |

A Ana paga 12,3% de "queda" mesmo sem notícia nenhuma porque ela é um terço do lado: a saída dela, sozinha, derruba a
chance do SIM de 30% para 26,3%. Quem é pequeno paga quase só o pedágio e o tempo. É o mesmo efeito de vender muito
numa pool pequena.

**Fuga em massa (risco 1).** Os três apostadores do SIM (100 cada) saem em fila, com 90% da janela decorrida:

| Quem sai | Penalidade | Recebe |
|---|---|---|
| Primeiro | 35,3% | 64,70 |
| Segundo | 64,2% | 35,80 |
| Terceiro | 90,0% (teto) | 10,00 |

Ficam 189,50 de prêmio (63% do que o SIM tinha). O NÃO recebe 1,233 por 1, contra 1,386 sem saída nenhuma e 1,012 na
alternativa (a). O prêmio encolhe, mas não some. Se a mesma fuga acontece cedo, com 30% da janela decorrida, ficam
164,20 de prêmio (55%) e o NÃO recebe 1,198. Uma baleia que sai com os 300 de uma vez, no fim da janela, paga 64,2% e
recebe 107,50, quase o mesmo que os três em fila (110,50).

**Golpe da chance (risco 2).** O mesmo golpista da seção 1.3: entrou com o SIM em 95,6%, sai com o ponto médio em
69,7% e 95% da janela decorrida. Penalidade: 5% + 19% + 27,1% = 51,1%, ou 1.021 USDC. Ele perde 531 se der SIM e
1.071 se der NÃO. Prejuízo certo.

- **O que o usuário vê:** "Sair agora devolve 77,72 dos seus 100,00. Penalidade 22,3%: 5% fixa, 5% pelo tempo, 12,3%
  porque a chance do seu lado cai com a sua saída." O número muda a cada dia e a cada aposta alheia; a tela precisa
  mostrar o valor antes de assinar.
- **O que acontece com o pote:** igual à alternativa (a), mas a penalidade que fica é maior justamente nas saídas que
  mais machucam.
- **Como se abusa:** (1) quem sai primeiro paga menos (64,70 contra 10,00 na fila), então robôs saem na frente quando
  sai notícia; isso é uma corrida, como em qualquer mercado, e quem perde é o apostador lento, não o pote. (2) Subir a
  chance do próprio lado antes de sair, com uma aposta nova, custa o pedágio dessa aposta nova. (3) Sair um instante
  antes de o fato ser provado. (4) Esvaziar um lado de propósito para o pote virar "de um lado só" e todo mundo ser
  devolvido com taxa; custa a penalidade inteira ao autor.
- **Complexidade em Solana:** média. Além do que a alternativa (a) pede: guardar no mercado o horário de abertura e o
  fim da janela; guardar na posição de cada apostador a chance média do lado nas entradas dele; conta inteira em
  pontos-base, arredondando sempre a favor do pote (regra de arredondamento da skill de Solana, FATO [C4]); o usuário
  informa o mínimo que aceita receber, e a transação falha se o valor mudar no caminho (regra contra "isca e troca",
  FATO [C4]); espera mínima entre apostar e sair (não no mesmo bloco). A propriedade a testar com dados aleatórios, como
  o sócio já faz: a devolução nunca passa do valor apostado, logo o cofre nunca fica devendo.

### 1.6 Alternativa (c): curva por lado (pote dinâmico)

**O que é.** Cada lado vira uma pequena curva de preço, como a curva do pump.fun: quem entra compra cotas do lado, e a
cota fica mais cara conforme o lado enche. Sair é vender as cotas de volta à curva, pelo preço do momento. No fim,
quem acertou divide o pote inteiro na proporção das cotas, não do dinheiro. É a família do "pote dinâmico" de Pennock
(2004) e do Melee alfa (FATO [S3] [S5]).

**Fórmula do exemplo** (uma curva linear escolhida por mim para a conta ficar simples; INFERÊNCIA):

```
preço da próxima cota do lado  = cotas já emitidas ÷ 1.000
dinheiro no lado               = cotas² ÷ 2.000
venda de x cotas devolve       = dinheiro no lado antes − dinheiro no lado depois, menos 5% que ficam de prêmio
```

**Exemplo.** No SIM entram, nesta ordem: Ana com 50, Bob com 150, Carla com 100. No NÃO há 700.

| | Pagou | Cotas | Preço médio | Recebe se der SIM (ninguém sai) |
|---|---|---|---|---|
| Ana | 50 | 316,2 | 0,158 | 396,00 |
| Bob | 150 | 316,2 | 0,474 | 396,00 |
| Carla | 100 | 142,1 | 0,704 | 178,00 |

A Ana pagou um terço do que o Bob pagou e tem as mesmas cotas. Agora ela vende tudo à curva: recebe 185,20 (bruto
194,95 menos 5%). Pôs 50, saiu com 185,20, sem a pergunta ter sido resolvida. Esse é o "ganho na saída".

De onde veio o dinheiro: do Bob e da Carla. O lado do SIM tinha 300 e ficou com 105,05. Se der NÃO, o prêmio do NÃO
caiu de 300 para 114,80. Se os três saem, quem sai primeiro leva mais: na ordem Ana, Bob, Carla, eles recebem
194,95, 94,95 e 10,10 (bruto); na ordem inversa, cada um recebe exatamente o que pôs.

- **O que o usuário vê:** um preço por cota que sobe e desce, e um valor de venda. Parece um token do pump.fun.
- **O que acontece com o pote:** o dinheiro de um lado pode sair quase todo pelas vendas.
- **Como se abusa:** (1) entrar cedo, divulgar, e vender para a curva quando os seguidores chegam; o lucro vem deles,
  seja qual for o resultado da pergunta. É o risco 2 transformado em estratégia lucrativa. (2) Corrida forte na
  notícia: o primeiro a vender pega o topo da curva. (3) Robôs que compram antes de uma compra grande e vendem depois
  ("sanduíche"). (4) A chance mostrada deixa de ser opinião sobre a pergunta e vira efeito de quem entrou cedo.
- **Complexidade em Solana:** alta. Contabilidade de cotas por lado, raiz quadrada ou integral em aritmética inteira,
  prova de que o cofre fecha em qualquer ordem de compra e venda, limites de preço em toda operação, e uma tela de
  curva. Também muda duas decisões já tomadas: o pagamento deixa de ser proporcional ao dinheiro apostado, e o programa
  passa a ter "preço", mesmo sem token.

Dois fatos pesam contra vender à curva: Pennock, que inventou o pote dinâmico, não deixou o sistema recomprar cotas
(quem sai vende a outro apostador), e o Melee, que lançou a curva por lado em Solana, proibiu a venda no alfa e, na
versão nova, faz a saída por um cofre separado (FATO [S2] [S3] [S5]).

### 1.7 Comparação e recomendação

| | (a) Penalidade fixa | (b) Tempo + queda | (c) Curva por lado |
|---|---|---|---|
| Dá ganho na saída | Não | Não | Sim |
| Prêmio do vencedor se todo perdedor sair | Quase zero | Encolhe; sobram de 55% a 63% nos exemplos | Quase zero, se a taxa for baixa |
| Golpe da chance | Barato | Prejuízo certo | Lucrativo |
| Cofre pode ficar devendo | Não | Não | Só se a curva tiver erro |
| Complexidade do programa | Baixa | Média | Alta |
| Precedente encontrado | Nenhum | Nenhum (a conta lembra o cash out) | Curva sim; venda à curva, não |

**Recomendação (INFERÊNCIA): alternativa (b) no MVP**, com cinco regras:

1. `penalidade = mínimo(90%, 5% + 20% × tempo + queda)`, com os parâmetros guardados no mercado, para poder ajustar
   por pergunta sem trocar o programa.
2. **A saída fica aberta até o marco T1** da seção 2 (o fim das apostas livres). Depois de T1, ninguém sai.
3. A saída trava no instante em que o fato acontece (mesma trava das apostas) e, nas perguntas de época, quando a
   época começa.
4. Espera mínima entre apostar e sair, e valor mínimo aceito informado pelo usuário.
5. A penalidade fica no pote como prêmio de quem acertar, e a taxa de 3% incide sobre ela no fim, como sobre o resto.

**O que a recomendação não entrega:** ganho na saída. Para isso, o caminho que os precedentes apontam é a fase 2:
deixar o apostador passar a cota a outra pessoa, ou um cofre que compra a cota com desconto (modelo do Melee). Nos
dois, o pote não é tocado, e por isso não existe o risco 1. O custo é que alguém precisa querer comprar.

**Se o Lucas preferir a simplicidade da alternativa (a):** ela só é defensável com penalidade alta (30% ou mais) e
saída fechando cedo. Com 10%, o prêmio de quem acerta pode cair a quase nada.

## 2. Fechamento das apostas

Decisão atual: as apostas fecham quando passam 80% da duração, e nunca menos de 24 horas antes do fim. Pergunta em
aberto do Lucas: "ainda temos que pensar para acima de 2-3 meses se 80% não é muito longo, e pode ser gradual."

### 2.1 Por que um pote precisa fechar antes do fim

Numa bolsa, quem compra tarde paga caro (99 centavos por algo que vale 1 dólar) e não tira nada de ninguém. Num pote
não há preço: quem entra no último minuto, já sabendo o resultado, recebe o mesmo retorno de quem arriscou desde o
primeiro dia, e dilui essa pessoa. Exemplo (conta minha):

- Pote 500 no SIM, 500 no NÃO. Falta uma hora e o fato não aconteceu: o NÃO é quase certo. Quem está no NÃO desde o
  começo receberia 1,94 por 1.
- Um oportunista põe 5.000 no NÃO. Ele recebe 5.290,91: lucro de 290,91 quase sem risco. Os apostadores antigos do
  NÃO passam a receber 1,058 por 1. Quem correu o risco ficou com as migalhas.

O litepaper do Melee descreve o mesmo defeito: o pote "historically fails when late capital dilutes the payouts of
earlier winning participants" (FATO [S2]). Um projeto aberto de pote em Solana escreve no próprio README: "In a
parimutuel, betting late gives the same odds with better information" (FATO [S12]).

No nosso produto há uma ajuda que os outros não têm: nas perguntas em que o fato é irreversível, as apostas travam
sozinhas no instante em que o SIM vira verdade (FATO [C1]). O que sobra para o fechamento resolver é o outro lado: o
NÃO ficando certo conforme o prazo acaba.

### 2.2 Precedentes

| Onde | Regra | Tipo |
|---|---|---|
| PancakeSwap Prediction | Cada rodada tem 5 minutos para apostar e depois 5 minutos travada, até o resultado. As apostas fecham na metade do ciclo | FATO [S1] |
| Corridas | As apostas fecham na largada; uma parte grande do dinheiro entra nos últimos instantes | FATO [S6] |
| Kalshi | Cada mercado tem hora de fechamento; depois dela, ordens novas dão erro. Pode fechar antes se o fato ocorrer | FATO [S28] |
| Polymarket e Limitless (livro) | Negociam até a resolução; não precisam fechar, porque há preço | FATO [S9] [S28] |
| Limitless, ordens imediatas | Em alguns mercados, a ordem que executa na hora fica retida por um instante antes de casar | FATO [S9] |
| OpenTote (pote de corridas, Solana) | Multiplicador de "madrugador" que cai em linha reta com o tempo; o bônus sai de uma fatia separada | FATO SECUNDÁRIO [S11] |
| Melee | Quem entra cedo compra cotas mais baratas e leva fatia maior do prêmio | FATO [S3] |
| Projeto aberto RedDuck (pote em Solana) | Teto de aposta por lado, amarrado à liquidez da fonte de preço | FATO [S12] |

**Correção a uma pesquisa anterior.** O arquivo `knowledge-base/market/receita-mercados-de-previsao.md` diz que a taxa
da Limitless "cresce perto da resolução". A documentação oficial diz outra coisa: a taxa depende do **preço**, não do
tempo. A compra custa 3,00% até 50 centavos e cai até 0,40% perto de 1 dólar; a venda vai de 0,42% a 1,50%, com o
máximo em 50 centavos (FATO [S9], lido em duas páginas e no whitepaper). No Polymarket é igual: a taxa é
`quantidade × alíquota × preço × (1 − preço)`, sem tempo na fórmula (FATO [S10]). **Taxa que sobe com o tempo, em
produto real, não encontrei.** Peso menor para aposta tardia tem precedente (OpenTote, Melee); limite que encolhe tem
um (RedDuck, por liquidez, não por tempo).

### 2.3 Regra gradual proposta

Em vez de uma data só, dois marcos e três fases (INFERÊNCIA):

```
T1 = fim − 20% da duração, limitado a no máximo 14 dias antes do fim
T2 = fim − 5% da duração, com mínimo de 24 horas e máximo de 7 dias antes do fim
```

| Fase | Quando | O que pode |
|---|---|---|
| 1. Aberta | Da abertura até T1 | Apostar sem limite. Sair pagando a penalidade da seção 1 |
| 2. Reta final | De T1 até T2 | Apostar, mas cada lado só pode crescer 25% sobre o tamanho que tinha em T1. Sair, não |
| 3. Fechada | De T2 até o fim | Nada. Só esperar o resultado |

| Duração | Regra atual (80%): fecha no dia | Dias fechados hoje | T1 (fim das apostas livres) | T2 (fecha tudo) | Dias fechados na proposta |
|---|---|---|---|---|---|
| 7 dias | 5,6 | 1,4 | dia 5,6 | dia 6,0 | 1,0 |
| 30 dias | 24,0 | 6,0 | dia 24,0 | dia 28,5 | 1,5 |
| 90 dias | 72,0 | 18,0 | dia 76,0 | dia 85,5 | 4,5 |
| 180 dias | 144,0 | 36,0 | dia 166,0 | dia 173,0 | 7,0 |

Para perguntas de até 70 dias, T1 cai exatamente nos 80% já decididos: a decisão do Lucas fica preservada como o fim
das apostas livres. Para perguntas longas, a fase aberta passa de 80% para 84% (90 dias) e 92% (180 dias), e o tempo
totalmente fechado cai de 36 dias para 7 numa pergunta de seis meses.

**O que a regra impede.**

- **O oportunista do fim.** Com o teto de 25%, no exemplo da seção 2.1 ele só consegue pôr 125 no NÃO. Os apostadores
  antigos recebem 1,746 por 1 em vez de 1,058. A diluição máxima fica limitada a um quinto do prêmio.
- **Várias carteiras.** O teto é do lado inteiro, não de cada carteira, então dividir o dinheiro em mil carteiras não
  adianta. Isso importa porque não há KYC.
- **O golpe da chance na última hora.** Depois de T1 ninguém sai, então a aposta "de mentira" não pode ser retirada.
- **O mercado morto por semanas.** Em perguntas longas ainda se aposta até faltarem 7 dias.

**O que ela não impede.** Quem aposta dentro do teto na reta final recebe o mesmo retorno de quem entrou cedo, com
menos risco. Para tirar essa vantagem existem duas ferramentas a mais, que deixo como opção: uma taxa de entrada
tardia que sobe de 0% a 10% entre T1 e T2 e vai para o prêmio (no exemplo, melhora o retorno dos antigos de 1,746
para 1,782; efeito pequeno), ou peso menor para o dinheiro tardio na divisão do prêmio (efeito grande, mas muda a
conta do pote e a tela). Recomendo começar só com o teto.

**Um aviso técnico.** O programa atual mede prazo em blocos ("slots"), nos campos `cutoff_slot` e `deadline_slot`
(FATO [C1]). O tempo de um bloco varia: o projeto mediu cerca de 235 milissegundos na rede de testes, contra 400
nominais (FATO, `CLAUDE.md`). Numa pergunta de 180 dias, um erro de 5% no tempo do bloco desloca o fim em 9 dias
(INFERÊNCIA, conta minha). Regras como "24 horas antes" pedem relógio de verdade: o programa novo deveria guardar
T1, T2 e o fim em data e hora, usando o relógio da rede.

### 2.4 A "opção avançada": menos de 24 horas, com dupla confirmação e registro

Pedido do Lucas: prazo menor que 24 horas só "com um double cheque para confirmar e log da operação de quem aprovou".
Como fazer (INFERÊNCIA; padrões da skill de Solana, FATO [C4]):

1. **Lista da equipe on-chain.** Uma conta de configuração do programa guarda as chaves que podem abrir perguntas.
2. **Regra no programa.** Ao criar a pergunta, o programa exige `fim − T2 ≥ 24 horas`. Se for menor, só aceita com
   uma segunda assinatura.
3. **Segunda assinatura.** A transação precisa de duas chaves da lista, e o programa confere que são diferentes. Uma
   pessoa cria, outra aprova. Uma pessoa sozinha, com uma chave só, não consegue.
4. **Registro em dois lugares.** O mercado guarda para sempre o campo "fechamento curto aprovado por: chave X". E o
   programa emite um evento on-chain com o mercado, quem criou, quem aprovou e quantas horas ficaram. O programa do
   sócio já emite um evento por instrução, e o site monta o histórico a partir deles (FATO, `CLAUDE.md`).
5. **Na tela.** A pergunta mostra um selo "fechamento curto" com as duas carteiras, e a pessoa confirma duas vezes
   antes de assinar.

Duas formas de implementar a segunda assinatura:

| Forma | Como funciona | Prós e contras |
|---|---|---|
| Duas assinaturas na mesma transação | Quem cria monta a transação e manda para o colega assinar | Mais simples; exige os dois ao mesmo tempo |
| Dois passos | "Propor" cria a pergunta parada; "aprovar", por outra chave, libera as apostas | Rastro mais claro (duas transações, dois eventos); uma instrução e um estado a mais |

A skill recomenda modelar fases como uma máquina de estados explícita e, para chaves de autoridade, multisig de
maioria (2 de 3), evitando 1 de N (FATO [C4]). O segundo formato combina com isso: `Proposta → Aberta → Reta final →
Fechada → Resolvida`. Usar um multisig pronto (Squads) como autoridade da equipe daria o mesmo rastro sem código
nosso; não pesquisei o Squads nesta rodada.

## 3. "Cron" para acionar a resolução

### 3.1 O que o código faz hoje

- `resolve` pode ser chamado por qualquer carteira, sem permissão, e é definitivo (FATO [C1]).
- Ele só aceita ser chamado direto na transação. Se outro programa tentar chamá-lo por dentro, falha com
  `CpiNotAllowed`. O comentário do código explica: é para ninguém embrulhar a resolução num empréstimo relâmpago
  (FATO [C1]).
- Nas sete perguntas de fato irreversível, a regra é: se o prazo passou, é NÃO; senão, se a meta está cumprida, é SIM;
  senão, erro "ainda não dá para resolver" (FATO [C1]). **Consequência: meta cumprida no dia 10, ninguém chama
  `resolve` até o dia 30, o resultado gravado é NÃO.** O programa não tem como saber depois quando a meta foi cumprida.
- Nas duas perguntas de época, a janela é curta. Stake de validador: só dá SIM enquanto a rede estiver naquela época.
  TVL de pool de staking: da primeira atualização da pool na época até a primeira da época seguinte, "about two days"
  (FATO [C1] [C2]). Perdeu a janela, virou NÃO.
- O comentário do sócio: "YES holders are the ones with the incentive to call it, so there is no resolver fee" (FATO
  [C1]).

No pote esse incentivo natural continua existindo dos dois lados (INFERÊNCIA): quando o fato acontece, quem apostou no
SIM quer resolver; quando o prazo passa, quem apostou no NÃO quer resolver para sacar. O caso em que ninguém se mexe é
um só: o fato aconteceu, os apostadores do SIM não perceberam, e os do NÃO ficam quietos esperando o prazo. É para
esse caso que o cron existe.

### 3.2 As opções em Solana hoje

| Opção | O que é | Situação | Custo | Serve para nós? |
|---|---|---|---|---|
| Serviço nosso | Programa nosso, num servidor, que lê os mercados abertos e envia `resolve` quando dá | Sempre possível | Taxa da rede: 5.000 lamports (0,000005 SOL) por assinatura, mais prioridade opcional (FATO [S16]) | Sim, é a base |
| Cron da Vercel | Agendador da hospedagem do site | Plano Hobby: uma vez por dia, com atraso de até 59 min. Plano Pro: a cada minuto. 100 tarefas por projeto (FATO [S19], página de 15/jul/2026) | Incluído no plano | Só no Pro, como segundo agendador |
| GitHub Actions | Agendador do repositório | Intervalo mínimo de 5 min; "can be delayed during periods of high loads", e tarefas podem ser descartadas; desliga após 60 dias sem atividade em repositório público (FATO [S19]) | Não verifiquei a cota | Como reserva, não como principal |
| Webhooks da Helius | Avisam o nosso servidor quando uma conta muda | Disponível; 1 crédito por aviso; plano grátis com 1 milhão de créditos, planos de US$ 49 a US$ 999 por mês (FATO [S18], página oficial, uma leitura só) | Ver ao lado | Como gatilho. Não envia transação |
| Tuk Tuk (Helium) | Fila de tarefas on-chain; quem "gira a manivela" é pago em SOL por tarefa | Repositório ativo (265 commits, 93 estrelas, Apache-2.0); apresentado no evento Accelerate (resumo publicado em 20/mai/2025) como substituto do Clockwork (FATO [S14]) | Depósito de 1 SOL, devolvido ao fechar a fila; recompensa por tarefa definida por quem cria (exemplo de 10.000 lamports no README) (FATO [S14]) | **Hoje não**: despacha por dentro de outro programa, e o nosso `resolve` rejeita isso (FATO SECUNDÁRIO [S15]) |
| Hydra (MagicBlock) | Agendador que executa a instrução direto na transação, sem embrulhar | 18 estrelas, 23 commits, licença MIT; exemplos na rede de testes; sem auditoria informada (FATO [S15]) | Depósito de 0,002 a 0,003 SOL; 5.000 lamports para criar; 10.000 lamports mais gorjeta por disparo | Compatível em tese; novo demais para depender |
| Jito | Entrega de transações em pacote (até 5, tudo ou nada); gorjeta mínima de 1.000 lamports | Disponível. Não agenda nada (FATO [S17]) | Gorjeta | Só para a transação entrar em hora de rede cheia |
| Switchboard | Rede de oráculos | A documentação não tem página de agendador (FATO [S21], conferido no mapa do site) | — | Não é cron |
| Aberto a qualquer um, com recompensa | O programa paga um valor pequeno a quem chamar `resolve` | Precedente: Tuk Tuk e Hydra pagam quem executa | A recompensa, tirada da taxa | Sim, como camada extra |

O Clockwork, que fazia isso até 2023, foi encerrado; o Tuk Tuk nasceu para ocupar o lugar (FATO SECUNDÁRIO [S14]).

Um precedente de quem depende de um serviço próprio: o PancakeSwap fecha cada rodada com um operador dele. Quando o
operador ou o oráculo falham, a rodada é cancelada e "users can claim 100% of their original bet amount (no fee)"
(FATO [S1]). Ou seja, o desenho deles prevê a falha do serviço e devolve o dinheiro. O nosso, hoje, não prevê: a
falha vira NÃO.

### 3.3 Riscos e custo

| Risco | O que acontece | Defesa |
|---|---|---|
| O serviço cai | Meta cumprida e não provada até o prazo vira NÃO; janela de época perdida vira NÃO | Segundo agendador em outro provedor; botão público; alarme; resolução automática na primeira interação (seção 3.4) |
| O fornecedor de acesso à rede (RPC) cai | O serviço não consegue ler nem enviar | Dois fornecedores |
| Rede congestionada | A transação não entra | Taxa de prioridade; reenviar; Jito |
| Roubam a chave do cron | O ladrão leva o SOL que estava nela | Deixar pouco SOL. A chave não tem poder nenhum: `resolve` é aberto, e o resultado sai do dado on-chain |
| Alguém resolve antes de nós | Nada de ruim: o resultado é o mesmo | — |
| Custo | 5.000 lamports por resolução. Mil resoluções custam 0,005 SOL em taxa base (conta minha sobre [S16]) | Quem paga: a fatia de operação da taxa (25% dos 3%) |

O custo relevante não é a taxa da rede: é o servidor, o fornecedor de RPC e alguém da equipe atender o alarme.

### 3.4 Arquitetura recomendada (INFERÊNCIA)

1. **Serviço principal, nosso, sempre ligado.** Duas formas de acordar: por aviso (quando a conta medida muda, tenta
   resolver na hora) e por varredura (a cada minuto, lê os mercados abertos e as contas medidas em lote, e decide
   fora da rede se já dá para resolver, com os mesmos leitores que o site usa em `app/lib/metric.ts`).
2. **Segundo agendador, independente.** Outro provedor, outro RPC, outra chave, rodando o mesmo código a cada 5 a 15
   minutos. Se o principal morrer, a resolução atrasa minutos, não dias.
3. **Botão público "Resolver" no site**, visível a qualquer visitante quando a simulação diz que já dá. Na fase 2,
   uma recompensa pequena, paga pelo programa a quem chamar, tirada da taxa.
4. **Alarme.** Um vigia avisa a equipe se uma pergunta estiver "resolvível e não resolvida" há mais de 15 minutos, ou
   com a meta cumprida a menos de 24 horas do prazo.
5. **Mudança no programa: resolução na primeira interação.** Hoje, quando a meta está cumprida, uma aposta nova
   falha. Em vez de só falhar, o programa pode gravar o SIM ali mesmo. O mesmo no saque depois do prazo. Assim,
   qualquer pessoa que encoste na pergunta dispara a resolução, e o cron vira reforço.
6. **Calendário.** Nas perguntas de época, o serviço começa a tentar no primeiro bloco da época, e a equipe evita abrir
   perguntas de época enquanto não houver dois agendadores no ar.

O Tuk Tuk e o Hydra ficam para depois: o primeiro exige afrouxar a proteção contra empréstimo relâmpago do `resolve`,
o segundo ainda é pequeno.

## 4. Tipos de pergunta, em linguagem simples

### 4.1 Os nove tipos que o programa já lê

Todos fazem a mesma coisa: olham um número ou uma chave gravada na rede e respondem sim ou não. O sócio só aceitou
fatos que **não voltam atrás** (queimou, está queimado) ou que são uma **foto tirada numa data** (FATO [C1] [C2]).
Para cada um: o que pergunta, um exemplo, quem teria interesse em apostar e quem controla o resultado.

| # | Tipo | O que pergunta | Exemplo de pergunta | Quem apostaria | Quem controla o resultado |
|---|---|---|---|---|---|
| 1 | Queima de oferta | A quantidade total do token cai até um número? | "A oferta do token T cai para X ou menos até 31 de dezembro?" | Quem segura o token e acompanha programas de recompra e queima | Qualquer um que tenha o token e o queime. Custa: o token queimado some para sempre |
| 2 | Renúncia de emissão | O time abre mão do poder de criar tokens novos? | "O time do projeto P renuncia à emissão do token até o fim do mês?" | Comunidade que cobra o time; quem tem medo de diluição | Só quem tem a chave de emissão (o time). Custo zero |
| 3 | Renúncia de congelamento | O time abre mão do poder de congelar a carteira dos outros? | "O token T fica sem autoridade de congelamento até a data?" | Mesmo público do tipo 2 | Só quem tem a chave. Custo zero |
| 4 | Programa imutável | O código de um programa fica travado, sem atualização possível? | "O protocolo P torna o programa imutável até a data?" | Usuários do protocolo; quem aposta em promessas do time | Só quem tem a chave de atualização (time ou multisig). Custo zero |
| 5 | Tokens travados | Uma quantidade do token foi mandada para um cofre de onde ninguém tira? | "Pelo menos X tokens de liquidez da pool P travados para sempre até a data?" | Comunidade de token novo, que pede liquidez travada | Qualquer um que tenha os tokens. Custa: ficam presos para sempre |
| 6 | Stake de validador | Um validador tem pelo menos X SOL delegados numa época? | "O validador V entra na época E com X SOL ou mais?" | Comunidades de validadores e de staking | Quem delega SOL. O SOL precisa estar lá antes de a época virar |
| 7 | TVL de pool de staking | Uma pool de staking líquido tem pelo menos X SOL no começo de uma época? | "O JitoSOL começa a época E com X SOL ou mais?" | Quem acompanha a disputa entre pools de staking | Quem deposita. O dinheiro precisa atravessar a virada da época |
| 8 | Liquidez travada na Meteora | Uma pool da Meteora (modelo DAMM v2) tem pelo menos X de liquidez travada para sempre? | "A pool T/SOL chega a X de liquidez travada até a data?" | Comunidade de token com pool na Meteora | Quem põe liquidez e trava. Custa: fica presa para sempre |
| 9 | Metadados imutáveis | Nome, símbolo e link da imagem do token ficam congelados? | "O token T congela os metadados até a data?" | Comunidade que cobra o time | Só quem tem a chave de metadados. Custo zero |

Detalhes que mudam a prática (FATO [C1] [C2]):

- O tipo 1 só aceita tokens em que a emissão já foi renunciada, para ninguém criar tokens e desfazer a queima.
- O tipo 5 usa um cofre do nosso próprio programa, que nunca assina nada. A versão anterior usava o "incinerador" da
  rede e o sócio descobriu que qualquer um conseguia mexer nele.
- O tipo 6 não consegue ser testado com SIM fora de uma rede de verdade, e validadores pequenos ou sem a chave nova
  leem zero.
- O tipo 7 lê a foto que a própria pool grava uma vez por época, não o saldo ao vivo, porque o saldo ao vivo dá para
  inflar e esvaziar numa transação só.
- Em 2/out/2026, USDC, USDT, JUP, BONK, JTO, PYTH, RAY, mSOL e jitoSOL tinham metadados mutáveis; WIF, WEN e
  Fartcoin, imutáveis.

**As três famílias (INFERÊNCIA).**

| Família | Tipos | O que significa num pote |
|---|---|---|
| Decisão de quem tem a chave | 2, 3, 4, 9 | Uma pessoa decide o resultado de graça. Ela pode apostar antes, por outra carteira, e levar o pote do outro lado. Quem aposta contra o dono da chave está doando |
| Alguém precisa gastar ou travar dinheiro | 1, 5, 8 | Dá para forçar o SIM, mas custa dinheiro de verdade. Só vale a pena se o pote do NÃO for maior que o custo |
| Foto numa data | 6, 7 | Depende de muito dinheiro parado atravessando a virada da época. O resultado é mais disputado e menos controlável |

No modelo antigo (patrocinador pagando recompensa) a primeira família era o produto: o patrocinador queria justamente
que o dono da chave agisse. No mercado de previsão ela vira o risco número 1 do briefing ("quem controla o resultado
pode apostar"). A regra que proponho vale para todos os tipos: **quem consegue forçar o resultado ganha, no máximo, o
pote do lado oposto; então o pote de cada pergunta precisa de um teto proporcional ao custo de forçar.** Onde o custo
é zero (primeira família), a pergunta leva um selo "resultado controlado por uma parte" e um teto baixo.

### 4.2 O padrão novo de token (Token-2022) e por que importa

- **O que é.** Na Solana, os tokens não são programas separados: todos são registrados num programa comum, o "programa
  de tokens". Existem dois. O clássico (SPL Token), usado por USDC, BONK e quase tudo que é antigo. E o novo,
  Token-2022, que aceita "extensões": taxa embutida na transferência, metadados guardados dentro do próprio token, um
  delegado permanente que pode mover ou queimar o saldo de qualquer carteira, e outras.
- **Por que existe.** Para um token ter funções que antes exigiam um programa próprio.
- **O cuidado.** A skill de Solana resume: "Token-2022 is not an upgrade to SPL Token. It's a different program with
  different rules" (FATO [C4]). Um leitor escrito para o clássico não entende o novo.
- **O problema para nós.** Os quatro leitores de token do sócio conferem duas coisas antes de ler: que o token
  pertence ao programa clássico e que o registro tem exatamente 82 bytes (FATO [C1]). Um token do padrão novo falha na
  primeira conferência. O sócio descreve isso como "safe, unsupported": não lê errado, só recusa (FATO [C2]).
- **Por que isso pega justamente o nosso público.** Os tokens novos do pump.fun são Token-2022, com os metadados dentro
  do token e as autoridades já revogadas: 7 de 7 na amostra lida na mainnet em 3/out/2026 (FATO [C3]). As moedas
  criadas pela instrução nova do pump.fun não têm a conta de metadados do padrão antigo (FATO [C2]).

Na prática: queima, renúncia e metadados **não funcionam hoje** nos tokens que o público do pump.fun negocia, nem no
nosso próprio token se ele nascer lá. E duas perguntas perdem o sentido nesses tokens, porque já nascem respondidas:
renúncia de emissão e de congelamento. O que sobra de interessante para eles é queima, formatura e preço.

**O que construir** (FATO [C2] para a lista; a ordem é INFERÊNCIA): aceitar o programa novo como dono; percorrer a
lista de extensões do token; **recusar por padrão** qualquer token com extensão perigosa ou desconhecida. As perigosas,
segundo o sócio: delegado permanente (pode queimar ou mover de qualquer conta), autoridade de fechar o token (queima
tudo, fecha e recria no mesmo endereço), emissão e queima confidenciais (oferta escondida) e queima com permissão. Não
precisa de dependência nova. O gasto de processamento ainda não foi medido.

### 4.3 Preço como pergunta: por que o token pequeno fica restrito, e como liberar

O Lucas perguntou: "Por que ficaria? Com base no quê". A resposta tem quatro partes, todas verificáveis.

**Parte 1: a conta de uma pool pequena.** A maioria das pools segue a regra "quantidade de um lado × quantidade do
outro = constante". O preço é a divisão de uma pela outra. Exemplo, passo a passo (conta minha):

1. A pool tem 100 SOL e 10.000.000 de tokens. Preço: 0,00001 SOL por token.
2. A pergunta aberta: "O token vale 0,00002 SOL (o dobro) até sexta?" O pote tem 5.000 USDC no NÃO.
3. O atacante aposta no SIM.
4. Numa única transação, ele compra tokens com 41,42 SOL. A pool fica com 141,42 SOL e 7.071.068 tokens. O preço lido
   é 0,00002. Dobrou.
5. Na mesma transação, ele chama `resolve`. O programa lê o preço, vê o dobro, grava SIM. É definitivo.
6. Ainda na mesma transação, ele vende os tokens de volta. Recupera os 41,42 SOL menos as taxas da pool: cerca de
   0,21 SOL, se a taxa for 0,25% em cada sentido.
7. O preço voltou a 0,00001. Ninguém viu o token dobrar. Ele saca o pote do NÃO.

Para dobrar o preço bastam 41% da reserva de um lado; para triplicar, 73%; para multiplicar por dez, 216%.

**Parte 2: ele nem precisa ter os 41 SOL.** Existem empréstimos relâmpago em Solana com taxa perto de zero (o sócio
cita 0,001% na Kamino, a partir de páginas de agregador; FATO SECUNDÁRIO [C2]). A proteção do `resolve` contra ser
chamado por dentro de outro programa não cobre este caso, e o sócio escreve isso: ela "does not stop a bot that moves
the metric in the same transaction, which is why flash-movable metrics are out" (FATO [C2]).

**Parte 3: o sócio já mediu isso** para reservas de pool e TVL ao vivo e classificou como "rejected", com tabela de
lucro do robô igual ao valor em jogo (FATO [C2], seção 1.1).

**Parte 4: já aconteceu, em Solana, com oráculo e tudo.** Em 11 de outubro de 2022, Avraham Eisenberg comprou o token
MNGO, "thinly traded", em três bolsas que alimentavam o oráculo do Mango Markets. O preço usado pelo protocolo foi de
cerca de US$ 0,04 para US$ 0,54 em uns 30 minutos (US$ 0,91 em algumas bolsas), e ele retirou entre US$ 114 e 116
milhões, conforme a denúncia (FATO [S27], denúncias da SEC e da CFTC). Lição: nem o oráculo salva um token de pouca
liquidez; e uma manipulação sustentada por 30 minutos atravessa uma média curta.

**Então a restrição é: "preço de token pequeno, lido de uma pool, num instante" não pode. As formas de tornar seguro
o bastante:**

| Solução | O que é | O que cobre | O que exige construir | O que sobra de risco |
|---|---|---|---|---|
| Oráculo Pyth | Rede em que corretoras e formadores de mercado publicam preços assinados; o programa confere a assinatura | 1.881 preços, 423 de cripto, em 4/out/2026 (FATO [S20], consulta direta minha). Tem SOL, BTC, JUP, e memecoins grandes: BONK, WIF, FARTCOIN, PUMP, TRUMP, PENGU, POPCAT, USELESS, CHILLGUY. Não tem token recém-lançado | Um leitor novo que recebe a conta de preço da Pyth e chama `get_price_no_older_than` (idade máxima, identificador do preço); conferir também a margem de erro publicada. Quem resolve busca o preço assinado e publica na mesma operação | Em memecoin de liquidez média, o caso Mango mostra que dá para empurrar as fontes do oráculo |
| Oráculo Switchboard | Rede em que qualquer um define a receita do preço | Qualquer token: há tarefas prontas para cotação da Jupiter, pools da Orca, Raydium e Meteora, pool do pump.fun, média no tempo e mediana (FATO [S21]) | Definir e manter a receita; leitor que confere assinatura e idade (cerca de 2.000 unidades de processamento em Anchor) (FATO [S21]) | A receita lê a mesma pool pequena: o oráculo relata fielmente um preço manipulado. Custo por atualização: não encontrado |
| Média no tempo da própria pool | Algumas pools guardam o histórico acumulado de preço | Raydium (CLMM e CPMM): 100 registros, um a cada 15 segundos no mínimo (FATO [S22], código-fonte). Meteora DLMM: conta `Oracle` com 100 amostras, ampliável (FATO [S24]). Orca: **não tem**; a conta chamada "Oracle" guarda só dados da taxa variável (FATO [S23], código-fonte). Meteora DAMM v2: sem campo de histórico no formato lido pelo sócio (INFERÊNCIA sobre [C2]). PumpSwap: não confirmado | Um leitor por tipo de pool, que pega dois registros e calcula a média do intervalo; fixar a pool na criação da pergunta | Quem segura o preço alto pela janela inteira ainda vence, mas precisa de dinheiro parado e exposto a quem vende contra |
| Liquidez mínima | Só abrir pergunta para pool grande | Qualquer pool | A liquidez ao vivo dá para inflar numa transação; só a liquidez **travada** é confiável (tipos 5 e 8, já prontos) | Sozinha não segura empréstimo relâmpago; só serve junto com a média |
| Leitura em vários instantes | O nosso programa tira várias fotos do preço, em horas diferentes | Qualquer pool | Uma instrução de "tirar foto", o cron para chamá-la e espaço para guardar as fotos | Fraca: quem ataca cerca cada foto com uma compra antes e uma venda depois, num pacote. Só funciona se a foto ler o acumulado da pool, e aí é a solução da linha de cima |
| Teto de pote | Limitar o pote ao custo de manipular | Qualquer solução acima | Um campo de teto no mercado | Reduz o prêmio do ataque; não o impede |

Por que a média no tempo ajuda, em números (conta minha): numa média geométrica de 30 minutos, como a da Raydium
CLMM, um pico de 100 vezes o preço que dure 15 segundos move a média em só 3,9%. Um pico de 2 vezes por 15 segundos
move 0,6%. Para a média dobrar, o preço precisa ficar dobrado os 30 minutos inteiros.

Como a Pyth entra no nosso modelo de resolução (INFERÊNCIA):

- **Pergunta de "toque"** ("o SOL toca US$ X até a data?"). É o equivalente de preço aos fatos irreversíveis: basta um
  preço assinado, dentro do prazo, igual ou acima de X. Qualquer pessoa publica a prova e resolve. A documentação da
  Pyth diz que as contas de atualização avulsa são "a good fit for applications that want to consume prices for a
  specific timestamp" (FATO [S20]).
- **A fresta.** A Pyth só grava o preço na rede quando alguém publica. Entre o toque e a prova, as apostas continuam
  abertas, e quem viu o toque aposta no SIM. Defesas: só aceitar prova recente (por exemplo, publicada até 60 segundos
  depois do instante do preço), o que obriga o nosso cron a vigiar; e ler, a cada aposta, a conta de preço fixa que a
  Pyth mantém para os ativos mais usados (64 ativos patrocinados em Solana, atualizados a cada 55 segundos ou a cada
  0,5% de variação; FATO [S20], lista de nomes não conferida).
- **Pergunta de "fechamento"** ("o BTC está acima de X no dia D ao meio-dia?"). Exige uma janela curta em volta do
  instante, e quem resolve escolhe qual preço da janela publicar. Mais delicada; fica para depois do "toque".

**Resposta direta ao Lucas.** Preço de token pequeno pode entrar, mas não no primeiro dia e não lendo a pool num
instante. Entra em três degraus: (1) ativos com preço na Pyth, incluindo as memecoins grandes; (2) tokens com pool na
Raydium ou na Meteora DLMM, pela média no tempo, com liquidez travada mínima e teto de pote; (3) tokens só na
PumpSwap, por receita na Switchboard, o que troca "leitura pura da rede" por confiança numa rede de oráculos.

### 4.4 Outros fatos on-chain que esse público apostaria

| Fato | Dá para ler on-chain? | Classificação | Motivo |
|---|---|---|---|
| Preço de ativo grande (Pyth) | Sim | Seguro com travas | Preço assinado por muitas fontes; travas: idade máxima, margem de erro, prova recente |
| Formatura no pump.fun | Sim: um indicador `complete` na conta da curva, ligado quando a curva esvazia e nunca visto desligar (FATO [C2] [S25]) | Seguro com travas | Dá para forçar comprando o resto da curva. O sócio mediu a perda mínima de quem força: 18,66 SOL numa curva intocada, 2,16 SOL nos últimos 10%, 0,07 SOL no último 1% (FATO [C2]). Travas: só abrir com a curva longe do fim, fechar as apostas quando ela passar de um ponto, teto de pote abaixo do custo de forçar. O programa do pump.fun é fechado e atualizável |
| Valor de mercado na curva, num instante | Sim | Inseguro | É um preço de pool: sobe com uma compra e desce com a venda seguinte, na mesma transação, pelo custo das taxas (cerca de 1,25% por operação, FATO [C3]) |
| Votação de DAO (Realms) | Sim: a proposta guarda o estado (aprovada, derrotada, vetada, cancelada) e, depois de finalizada, não muda (FATO [S26], código-fonte) | Seguro com travas | A leitura é limpa e irreversível. O resultado é decidido por quem tem mais tokens, que pode apostar. Não confirmei se tokens emprestados podem votar. Exige leitor novo |
| Número de detentores | Não | Inseguro (e ilegível) | Nenhuma conta guarda esse número: o registro do token traz oferta, casas decimais e autoridades (FATO [C2]). Os sites contam varrendo a rede por fora. E é barato de falsificar: basta criar carteiras com poeira |
| TVL de um protocolo | Em geral, não | Inseguro | Não há uma conta com o total; os sites somam por fora. Saldo ao vivo dá para inflar numa transação (FATO [C2]). Exceção já pronta: a foto de época da pool de staking (tipo 7) |
| Volume de uma pool | Quase nunca | Inseguro | Os contadores da Raydium pararam de ser atualizados em 2026 (FATO [C2]). Só a Meteora DAMM v2 tem contador de taxas acumuladas, e inflá-lo custa pelo menos 20% do valor |
| LP queimado na Raydium, taxas acumuladas na Meteora, créditos de voto de validador | Sim | Seguro | Irreversíveis ou não compráveis; estão no roteiro do sócio como próximos leitores (FATO [C2]) |

Sobre a formatura, dois números para calibrar. Pelos parâmetros públicos do pump.fun, completar uma curva do zero
exige 85 SOL, e o valor de mercado vai de 28 SOL na criação a 411 SOL na formatura (conta minha sobre [S25]). E a taxa
de formatura estava em 0,26% dos tokens em junho de 2026, contra cerca de 1,4% no histórico (FATO SECUNDÁRIO [C5]).
Uma pergunta "o token T se forma?" é, quase sempre, uma aposta de azarão.

### 4.5 Cardápio do primeiro dia e ordem de construção (INFERÊNCIA)

Oito perguntas de exemplo. Os alvos e os números são ilustrativos; o programa recusa na criação a pergunta cujo alvo
não serve (por exemplo, queima em token que ainda pode ser emitido).

| # | Pergunta de exemplo | Tipo | Leitor | Observação |
|---|---|---|---|---|
| 1 | "O SOL toca US$ X até o dia D?" | Preço, toque | Novo (Pyth) | Preço de cripto em prazo curto é o que une esse público, segundo a inferência da pesquisa de público [C5] |
| 2 | "O BTC toca US$ X até o dia D?" | Preço, toque | Novo (Pyth) | Idem |
| 3 | "A memecoin M (com preço na Pyth) toca US$ X até o dia D?" | Preço, toque | Novo (Pyth) | Teto de pote menor que o das duas acima |
| 4 | "O JitoSOL começa a época E com X SOL ou mais?" | Foto de época | Pronto | Leitor conferido em JitoSOL e bSOL pelo sócio |
| 5 | "A oferta do token T (clássico, com emissão renunciada) cai para X até o dia D?" | Queima | Pronto | Escolher token com programa de queima conhecido |
| 6 | "A oferta do nosso token cai para X até o dia D?" | Queima | Novo (Token-2022) | Casa com a recompra e queima prevista na taxa |
| 7 | "A pool T/SOL na Meteora chega a X de liquidez travada até o dia D?" | Liquidez travada | Pronto | Teto de pote proporcional ao valor a travar |
| 8 | "O token T se forma no pump.fun até o dia D?" | Formatura | Novo | Só com as travas da seção 4.4 |

Reservas, com o selo "resultado controlado por uma parte" e teto baixo: "o protocolo P torna o programa imutável até
o dia D?" e "o token T congela os metadados até o dia D?". Stake de validador fica fora do primeiro dia, porque o SIM
não pôde ser testado fora de uma rede de verdade.

Se o lançamento vier antes dos leitores novos, o primeiro dia tem só as perguntas 4, 5 e 7, que não são o que o
público mais aposta. Por isso a ordem de construção:

1. **Token-2022 nos leitores de token**, com recusa por padrão das extensões perigosas. Libera queima nos tokens do
   pump.fun e no nosso.
2. **Preço pela Pyth, modalidade "toque"**, com as travas da seção 4.3.
3. **Formatura no pump.fun**, com as travas da seção 4.4.
4. **Metadados congelados no padrão novo** e **proposta de DAO (Realms)**.
5. **Preço de token menor pela média no tempo** da Raydium e da Meteora DLMM, com liquidez travada mínima.
6. **Preço por receita da Switchboard**, para tokens só na PumpSwap, se o Lucas aceitar depender dessa rede.

A ordem dos três primeiros coincide com a proposta do briefing (seção 9).

## 5. O que isto muda no plano (INFERÊNCIA)

1. **Saída no MVP, sem ganho.** A saída entra como devolução com penalidade (alternativa (b)). A frase "ganho
   proporcional menor" não é atendida no MVP; o BP deve dizer isso e apontar a venda da cota como fase 2.
2. **O briefing está desatualizado na seção 3.3** (diz que a saída é fase 2). Vale a ideação.
3. **O fechamento vira dois marcos (T1 e T2) e três fases.** Os 80% decididos continuam valendo como fim das apostas
   livres em perguntas de até 70 dias. Em perguntas longas, a regra proposta difere da decidida: precisa do aval do
   Lucas.
4. **O programa novo precisa de campos e instruções que o briefing não lista:** `exit`; a chance média de entrada na
   posição de cada apostador; os parâmetros da penalidade; T1, T2 e o tamanho de cada lado em T1; o teto de pote;
   quem aprovou o fechamento curto; a lista de chaves da equipe; prazos em data e hora, não em blocos.
5. **A resolução precisa de operação, não só de código:** dois agendadores, alarme e alguém de plantão. Custo de rede
   desprezível; custo de servidor e de RPC a orçar na Onda 2.
6. **Tuk Tuk não é opção hoje.** Quem citar "automação on-chain" no BP deve dizer que o `resolve` rejeita esse caminho
   de propósito.
7. **O cardápio depende de três leitores novos.** Sem eles, o primeiro dia não tem preço nem tokens do pump.fun.
8. **"Sem oráculo" deixa de ser verdade com preço pela Pyth.** O Lucas já aceitou "um [oráculo] que possa resolver
   onchain"; o texto do BP deve dizer "resolução por dado verificável on-chain", não "sem oráculo".
9. **Toda pergunta precisa de teto de pote**, e as de "dono da chave" precisam de selo. Isso limita o tamanho dos
   potes e, portanto, a receita por pergunta; o modelo financeiro deve considerar.
10. **Duas correções em pesquisas anteriores:** a taxa da Limitless depende do preço, não do tempo; e a saída do Melee
    foi encontrada (cofre de cash out no modelo novo, proibida no alfa).

## 6. Perguntas em aberto

Para o Lucas:

1. Aceita que a saída do MVP não dê ganho, só devolução com penalidade?
2. A banca cobra os 3% também de quem sai, sobre o valor devolvido? A regra "a banca nunca perde" sugere que sim.
3. Aceita o fechamento em dois marcos, com a reta final limitada a 25% de crescimento por lado?
4. Perguntas em que o dono de uma chave decide o resultado: entram com selo e teto baixo, ou ficam fora?
5. Aceita preço pela Pyth como "oráculo que resolve on-chain"? E pela Switchboard, para tokens só na PumpSwap?
6. Quem da equipe tem as chaves de abrir pergunta e de aprovar fechamento curto? São pelo menos duas pessoas?

Para o Ronaldo:

7. Dá para o programa gravar o SIM na primeira aposta que encontra a meta cumprida, em vez de só recusar?
8. Prazos em data e hora em vez de blocos: há motivo para manter blocos?
9. Quanto processamento custa percorrer as extensões do Token-2022 dentro do programa?
10. Há forma segura de ler a Pyth num "toque" sem a fresta entre o toque e a prova?

Para a Onda 2:

11. Simular a alternativa (b) com apostadores que saem de forma estratégica, para calibrar 5%, 20% e 90%.
12. Estimar o custo de forçar cada tipo de pergunta, para definir o teto de pote.

## 7. O que não foi confirmado

- Um produto real em que o pote devolve a aposta com penalidade: não encontrado.
- O golpe de apostar grande e cancelar em corridas de cavalo: não encontrei caso documentado.
- A margem que as casas de aposta descontam no cash out: nenhuma publica; o intervalo de 5% a 15% não tem fonte.
- Loterias (hora de corte das apostas): a página da Caixa recusou a leitura.
- Tuk Tuk despachar por dentro de outro programa: vem do README de um concorrente (Hydra); não li o código do Tuk Tuk.
  Endereço do programa na rede principal e número de operadores: não encontrados.
- Hydra na rede principal e auditoria: a documentação não diz.
- Preços da Helius: uma leitura só. Cota gratuita do GitHub Actions: não verificada.
- Pyth: a lista dos 64 ativos patrocinados em Solana não carregou; a taxa por atualização em Solana não foi achada; a
  documentação diz que o serviço público de preços exige chave desde 26/ago/2026, mas a minha consulta de 4/out/2026
  respondeu sem chave.
- Switchboard: custo por atualização e quem pode criar receita. A página de média no tempo foi lida em resumo.
- Média no tempo na PumpSwap e na Meteora DAMM v2: não confirmado no código.
- Realms: se tokens emprestados podem votar, e qual endereço de programa cada DAO usa.
- Keepers do Drift (precedente de recompensa a quem executa): a página deu erro.
- Custo real de sustentar um preço manipulado por 30 minutos numa pool pequena: não quantificado.

## 8. Fontes

Internas (lidas em 4/out/2026):

- [C1] Programa do sócio, `git show upstream/main:programs/pred-provable/src/instructions/resolve.rs`, `resolver.rs`
  e `state.rs`.
- [C2] `git show upstream/main:RESOLVERS.md` (escrito em 2/out/2026 contra a mainnet).
- [C3] `docs/business/BRIEFING-MERCADO-DE-POTE.md`, seções 3, 4, 7.1 e 9;
  `docs/business/ideacao-perguntas-e-respostas.md`, seções 1 e 7.
- [C4] Skill de Solana, em `F:\AceleradoraECO\solana-refs\solana-dev-skill\skills\solana-dev\references\`:
  `programs\design-patterns.md` e `security.md` (este fica uma pasta acima da indicada na tarefa).
- [C5] `knowledge-base/market/publico-web3.md` (taxa de formatura, The Block, jun/2026; o que o público aposta).

Externas (lidas em 4/out/2026):

- [S1] PancakeSwap Prediction: https://docs.pancakeswap.finance/play/prediction.md e
  https://docs.pancakeswap.finance/play/prediction/prediction-faq.md
- [S2] Melee, litepaper do PMM: https://pmm.melee.markets/litepaper ; notícia de 22/jul/2026:
  https://solanafloor.com/news/melee-markets-unveils-new-spin-on-prediction-markets-through-novel-pmm-model
- [S3] Melee, documentação do alfa: https://melee-1.gitbook.io/melee-docs/faq e
  https://melee-1.gitbook.io/melee-docs/how-does-it-work/market-structure
- [S5] Pennock, "A Dynamic Pari-Mutuel Market for Hedging, Wagering, and Information Aggregation" (2004):
  http://dpennock.com/papers/pennock-ec-2004-dynamic-parimutuel.pdf ; patente:
  https://www.freepatentsonline.com/y2005/0171878.html
- [S6] Ottaviani e Sørensen, "The Timing of Parimutuel Bets" (2006):
  https://web.econ.ku.dk/sorensen/papers/TheTimingofParimutuelBets.pdf
- [S7] Wikipedia, "Parimutuel betting": https://en.wikipedia.org/wiki/Parimutuel_betting
- [S8] Cash out: https://openbookies.com/guides/cash-out-explained ;
  https://game.pred.app/cash-out-betting-how-bookmakers-price-the-offer-and-what-it-costs-you/ (29/set/2026) ;
  https://tofiko.com/guides/cash-out
- [S9] Limitless: https://docs.limitless.exchange/user-guide/fees ; https://limitless.exchange/whitepaper.pdf ;
  https://limitless.exchange/blog/how-trading-fees-work (3/jul/2025) ;
  https://docs.limitless.exchange/user-guide/market-resolution ;
  https://docs.limitless.exchange/api-reference/trading/create-order
- [S10] Polymarket, taxas: https://docs.polymarket.com/trading/fees
- [S11] OpenTote: https://opentote.org/
- [S12] RedDuckTeam, pote com preço on-chain: https://github.com/RedDuckTeam/solana-prediction-market
- [S14] Tuk Tuk: https://github.com/helium/tuktuk ; https://www.tuktuk.fun/docs ;
  https://solanacompass.com/learn/accelerate-25/scale-or-die-at-accelerate-2025-tuk-tuk-on-chain-cron-jobs (20/mai/2025) ;
  https://solana.stackexchange.com/questions/21375/alternative-to-clockwork (5/abr/2025)
- [S15] Hydra: https://github.com/magicblock-labs/hydra
- [S16] Solana, taxas: https://solana.com/docs/core/fees
- [S17] Jito: https://docs.jito.wtf/lowlatencytxnsend/
- [S18] Helius, preços: https://www.helius.dev/pricing
- [S19] Vercel, cron: https://vercel.com/docs/cron-jobs/usage-and-pricing (atualizada em 15/jul/2026) ; GitHub Actions:
  https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- [S20] Pyth: https://docs.pyth.network/price-feeds/core/use-real-time-data/pull-integration/solana ;
  https://docs.pyth.network/price-feeds/core/push-feeds/solana ;
  https://github.com/pyth-network/pyth-crosschain/blob/main/target_chains/solana/pyth_solana_receiver_sdk/src/price_update.rs ;
  contagem de preços por consulta direta a https://hermes.pyth.network/v2/price_feeds
- [S21] Switchboard: https://docs.switchboard.xyz/docs-by-chain/solana-svm/price-feeds/basic-price-feed.md ;
  https://docs.switchboard.xyz/docs-by-chain/solana-svm/price-feeds/advanced-price-feed.md ;
  https://docs.switchboard.xyz/custom-feeds/task-types.md ;
  https://docs.switchboard.xyz/custom-feeds/advanced-feed-configuration/twap.md ;
  https://docs.switchboard.xyz/sitemap.md
- [S22] Raydium: https://github.com/raydium-io/raydium-clmm/blob/a5a46ff5/programs/amm/src/states/oracle.rs ;
  https://raw.githubusercontent.com/raydium-io/raydium-cp-swap/master/programs/cp-swap/src/states/oracle.rs ;
  https://docs.raydium.io/security/oracle-and-token-risks
- [S23] Orca: https://raw.githubusercontent.com/orca-so/whirlpools/main/programs/whirlpool/src/state/oracle.rs
- [S24] Meteora DLMM: https://docs.meteora.ag/developer-guides/dlmm/program/accounts
- [S25] pump.fun: https://github.com/pump-fun/pump-public-docs/blob/main/docs/PUMP_PROGRAM_README.md
- [S26] Governança (Realms):
  https://raw.githubusercontent.com/solana-labs/solana-program-library/master/governance/program/src/state/proposal.rs
- [S27] Caso Mango: denúncia da CFTC https://www.cftc.gov/media/8046/enfeisenbergcomplaint010923/download ; denúncia da
  SEC https://www.sec.gov/files/litigation/complaints/2023/comp-pr2023-13.pdf ; nota da CFTC
  https://www.cftc.gov/PressRoom/PressReleases/8647-23
- [S28] Kalshi e Polymarket: `knowledge-base/referencias/kalshi-docs.md`, `polymarket-docs.md` e `polymarket-help.md`.
