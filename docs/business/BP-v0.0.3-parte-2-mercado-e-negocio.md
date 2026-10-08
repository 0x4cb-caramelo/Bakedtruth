# Brot Markets — Business Plan v0.0.3 — Parte 2: Mercado e negócio

**Data:** 8 de outubro de 2026.
**Estado:** rascunho para revisão do fundador. Derivada do pitch de 7 de outubro de 2026, por ordem dele. Onde o
pitch e a v0.0.2 discordam, vale o pitch; onde ele se cala, vale a v0.0.2, mais curta. Substitui a Parte 2 da
v0.0.2, que fica na pasta como versão anterior.

**Como ler.** As marcas são as da Parte 1: **Decisão** (do fundador, em 4 ou 5/10/2026), **Decisão do pitch**
(regra do deck de 7/10/2026, citada em inglês como está na tela) e **Proposta, aguardando decisão**. Números de
mercado trazem FATO (lido na fonte) ou FATO SECUNDÁRIO (lido em quem citou a fonte), com a data. Toda projeção é
INFERÊNCIA: conta nossa sobre premissas declaradas, e não previsão. Os valores estão em dólares.

Cinco termos aparecem no texto inteiro. **Volume** é a soma de tudo o que entrou nos potes num período. **Taxa
média** é quanto o Brot arrecada, na média, de cada 100 dólares de volume. **Ponto de equilíbrio** é o volume
mensal em que a empresa paga as próprias contas. **Caixa** é o dinheiro da operação, somado desde antes do
lançamento. **Mês 1** é o primeiro mês com dinheiro real, na rede principal. O pote, a taxa e os tipos de mercado
estão na Parte 1.

**O que mudou desde a v0.0.2.**

1. Entra o quadro de mercado do pitch (TAM, SAM e SOM), com a definição e a etiqueta de cada número.
2. São três públicos, e os perfis ganham um quinto: quem abre mercados.
3. Os testes de demanda passam de dois para três. O terceiro mede os mercados abertos por quem não é da equipe.
4. Na comparação com os concorrentes, a linha do Brot muda: qualquer carteira abre. A ideia que estava guardada,
   dar uma parte a quem cria o mercado, foi adotada.
5. As receitas passam a ser quatro. Entram a taxa de abertura e um custo possível, a parte de quem abriu.
6. O patrocínio rende um terço do que rendia: 10% do valor pago, e não 30%. Trinta parceiros pagando 500 dólares
   dariam 1.500 à plataforma, e não 4.500.
7. Os cenários foram refeitos com o patrocínio a 10%. O ponto de equilíbrio não muda. O caixa do cenário razoável
   no mês 24 cai de 27.767 para 21.467.
8. Os canais passam a ser os quatro motores do slide de crescimento. Saem as sugestões pelo X.
9. Fundo de prêmios, tesouraria, recompra e fase 2 ficam numa seção só, "em espera".

## 1. Resumo

### 1.1 O mercado, nos três números do pitch

- **21,7 bilhões de dólares** em 30 dias é o volume do setor inteiro de mercados de previsão, de 4 de setembro a 3
  de outubro de 2026, em dinheiro de fato pago (FATO SECUNDÁRIO, DefiRate, out/2026). É o "TAM" do slide.
- **Cerca de 0,9 bilhão por mês** é a nossa estimativa do volume em mercados sobre cripto (INFERÊNCIA). É o "SAM".
- **15,4 milhões de dólares** foi o volume de setembro de 2026 do World, o mercado de previsão que funciona dentro
  da carteira Phantom (FATO SECUNDÁRIO, DefiLlama, set/2026). É o "SOM" do slide, e é o volume inteiro de um
  concorrente, e não a nossa fatia.

A seção 2.1 diz o que cada número mede e o que ele não é. Um quarto número continua valendo, e o pitch não o
mostra: **zero** é o número de mercados sobre queima, trava de liquidez ou outro fato de token de terceiros que a
pesquisa encontrou em qualquer plataforma (FATO, ausência em busca limitada, out/2026). O nosso tipo de mercado
ainda não tem demanda demonstrada.

### 1.2 Como a empresa ganha dinheiro

São quatro receitas (seção 4.1). Duas têm número.

- **A taxa do pote.** O Brot fica com 10% do lado perdedor. Na média, isso dá 3,70% do volume (INFERÊNCIA; de
  2,70% a 4,18%, conforme a mistura de mercados). De cada dólar de taxa, 25 centavos vão para a tesouraria e 75
  para a operação, que paga as contas.
- **A taxa de marketing.** O projeto que patrocina paga a partir de 500 dólares; 90% viram prêmio e 10% ficam com
  o Brot. Um patrocínio de 500 deixa 50 dólares.
- **A taxa de abertura.** Quem abre um mercado paga 0,02 SOL. Quanto isso rende depende de dois números que
  ninguém tem: quantos mercados serão abertos e o preço do SOL.
- **O 1% do pote de um lado só**, que é pequeno e está fora do modelo.

Há um custo novo, ainda sem dono: o 1% do pote para quem abriu o mercado. Se ele sair do prêmio de quem acertou,
não custa nada ao Brot. Se sair da taxa do Brot, custa até 27% dela (seção 4.4).

### 1.3 O ponto de equilíbrio

O custo de referência é de 5.500 dólares por mês: três sócios recebendo 1.500 cada um, mais até 1.000 de
infraestrutura. Com a taxa média de 3,70%, a empresa paga esse custo quando o volume chega a **208.630 dólares
por mês** (INFERÊNCIA). Com o pitch lido ao pé da letra, esse número não muda, porque a parte de quem abriu não sai
da taxa do Brot. Para dar a medida: 208.630 é 1,4% do que o World fez em setembro de 2026.

O número sobe em dois casos: se a maioria dos mercados tiver favorito claro (285.900), ou se a parte de quem abriu
sair da taxa do Brot (de 241.228 a 285.900, seção 5.2).

### 1.4 Os três cenários

Todos os valores são INFERÊNCIA, com a taxa média de 3,70% e o patrocínio a 10%. O caixa parte de 7.500 negativos:
2.000 da abertura da empresa e 5.500 de um mês de devnet.

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume no mês 12 | 45.000 | 300.000 | 1.500.000 |
| Volume no mês 24 | 31.250 | 712.500 | 4.708.333 |
| Mês em que a operação se paga | Não chega | 9 | 2 |
| Ponto mais baixo do caixa | −116.565, no mês 24, e caindo | −27.674 | −9.705, no mês 1 |
| Caixa no mês 24 | −116.565 | 21.467 | 783.963 |

O cenário ruim não se paga em momento nenhum. O razoável equilibra no mês 9 e pede cerca de 27,7 mil dólares até
lá. O otimista depende de um canal de distribuição que hoje não existe; o mês de equilíbrio e o ponto mais baixo
dele não mudam com o pitch (seção 5.3). As trajetórias de volume são as mesmas da v0.0.2: o pitch afirma que criadores e
parceiros trazem volume, e não há dado para mudar a curva.

### 1.5 O que continua aberto

Do que o fundador precisa decidir, três pontos mexem nas contas: de onde sai o 1% de quem abriu, para onde vão os
0,02 SOL e o que o patrocinador recebe pelos 10% (seção 7). E três números continuam sem medida: a mistura real de
mercados, quantos mercados terceiros vão abrir e a data de ida à rede principal.

## 2. Mercado e público

### 2.1 TAM, SAM e SOM

São três siglas do vocabulário de investidor. **TAM** é o mercado total: tudo o que se gasta na categoria. **SAM**
é a parte do total que o produto consegue atender. **SOM** é a parte que ele pode de fato conquistar. O slide de
mercado traz um número para cada uma. Os três estão corretos como números; o que pede cuidado são os rótulos.

| Sigla no slide | Número | O que mede de fato | Etiqueta | O que não é |
|---|---|---|---|---|
| TAM, "All prediction markets" | 21,7 bilhões em 30 dias | O volume do setor inteiro, em dólares pagos, de 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate | Não é receita. E 62% do volume do setor eram esportes, que a rede não lê |
| SAM, "Crypto markets" | Cerca de 0,9 bilhão por mês | `20% × 4,63 bilhões = 0,926`. A fatia de cripto é a da Polymarket em maio de 2026; o volume é o da Polymarket em setembro | INFERÊNCIA | Vale para uma plataforma, e não para o setor. Os dois números são de meses diferentes |
| SOM, "Inside Solana" | 15,4 milhões no mês | O volume inteiro do World em setembro de 2026 | FATO SECUNDÁRIO, DefiLlama | Não é a nossa fatia. O rótulo "SOM" é nosso |

O que o plano tira daí é mais modesto que os rótulos. O número que a empresa precisa alcançar é o ponto de
equilíbrio, 208.630 dólares por mês, que é 1,4% do que o World fez em setembro (seção 5.2).

**"13× in three months."** A conta confere: `15,44 ÷ 1,14 = 13,5`, de junho a setembro. A tela omite o mês do
meio: agosto foi de 22,20 milhões, e setembro caiu 30% em relação a ele. O World cresceu muito e já recuou.

**Três frases da fala, ditas com a precisão da fonte.**

- "Cripto é a porta de entrada de 40% dos novos usuários." A fonte diz: cerca de 40% da atividade inicial dos novos
  usuários da Polymarket, no primeiro trimestre de 2026, foi em mercados de cripto (FATO SECUNDÁRIO, The Defiant).
- "80 milhões de carteiras no pump.fun." São 80 milhões desde a criação. Ativas por mês eram 1,8 milhão em dezembro
  de 2025, de fonte fraca, e carteira não é pessoa (seção 2.4).
- "A Polymarket foi de 1,9 para 4,6 bilhões por mês em dez meses." Na fonte: 1,88 bilhão em novembro de 2025 e 4,63
  bilhões em setembro de 2026. As taxas dela foram de zero em 2025 a 93,6 milhões em setembro de 2026 (FATO
  SECUNDÁRIO, DefiLlama).

### 2.2 O tamanho do setor e as duas réguas

Os números do setor parecem se contradizer de uma fonte para outra, porque há duas formas de medir. Nos líderes, o
usuário compra contratos que pagam 1 dólar se o resultado se confirmar. **Valor de face** soma cada contrato a 1
dólar, tenha custado o que for. **Dólares pagos** soma o que as pessoas de fato desembolsaram. Um pote mede
dinheiro depositado. Por isso este documento só usa dólares pagos.

| Medida | Valor | Data | Etiqueta e fonte |
|---|---|---|---|
| Setor inteiro, em dólares pagos | 21,7 bilhões em 30 dias | 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate |
| Setor inteiro, em valor de face | 81,8 bilhões em 30 dias | 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate |
| Kalshi, em dólares pagos | 13,7 bilhões em 30 dias | até 3/out/2026 | FATO SECUNDÁRIO, DefiLlama; a régua é inferência |
| Polymarket, em dólares pagos | 4,63 bilhões no mês | set/2026 | FATO SECUNDÁRIO, DefiLlama |
| Fatia da Kalshi no volume semanal | 77% | fim de set/2026 | FATO SECUNDÁRIO, Artemis, via Crypto Economy |
| Peso dos esportes no volume do setor | 62% | abr/2026 | FATO SECUNDÁRIO, Bernstein |

O setor é grande, novo e concentrado: uma empresa tem três quartos do volume, e quase dois terços são esportes.
Cobrar taxa também é novo: a Polymarket não cobrou nada em 2025.

Três sinais de alerta, que o pitch não mostra e o plano mantém. Cerca de 25% da atividade histórica da Polymarket
foi negociação artificial, segundo um estudo da Universidade Columbia (FATO SECUNDÁRIO, via Sacra, 2026). O
interesse de busca por mercados de previsão caiu 83% desde o pico da Copa de 2026 (FATO SECUNDÁRIO, The Defiant,
2026). E vários países bloquearam plataformas do setor; o Brasil bloqueou 27 sites em abril de 2026 (FATO
SECUNDÁRIO, imprensa, abr/2026).

### 2.3 O que os entrantes recentes alcançaram

| Quem | O que tinha a favor | O que alcançou | Etiqueta e fonte |
|---|---|---|---|
| World, dentro da Phantom | Uma carteira com mais de 20 milhões de usuários declarados | Em milhões: 1,14 em jun/2026; 13,22 em julho; 22,20 em agosto; 15,44 em setembro | FATO SECUNDÁRIO, DefiLlama, set/2026 |
| Contratos da Kalshi em Solana, por Jupiter e DFlow | A marca da líder | 28,6 milhões em cerca de três semanas, com cerca de 21 mil carteiras; 98% do volume da DFlow veio da Phantom | FATO SECUNDÁRIO, Step Data, jan/2026 |
| Limitless, na rede Base | Cerca de 17 milhões captados, token próprio, pontos e criação aberta | 250,9 milhões em mai/2026; 10,75 milhões em set/2026 | FATO SECUNDÁRIO, DefiLlama, set/2026 |
| Opinion e Myriad | Campanhas de pontos por volume | Quedas de 80,7% e de 93,8% do primeiro para o segundo trimestre de 2026 | FATO SECUNDÁRIO, Predictefy, 2026 |
| Melee, em Solana | 3,5 milhões captados; também usa pote | 49.247 pessoas na fila de espera; sem dinheiro real até 4/out/2026 | FATO, site do Melee; o estado é FATO SECUNDÁRIO |
| PNP, em Solana | Qualquer pessoa cria um mercado em segundos | 206 transações em seis meses; nenhuma depois de 17/set/2026 | FATO, leitura da rede, 4/out/2026 |

Três leituras, todas INFERÊNCIA sobre a tabela.

1. **Quem decide o volume é a distribuição.** Em Solana, ela passa pela carteira: 98% do volume de um dos canais
   da Kalshi veio de dentro da Phantom.
2. **Volume comprado com incentivo vai embora.** Três plataformas perderam de 80% a 96% do volume em poucos meses,
   depois de campanhas de pontos e de token. É o que a fala do pitch resume em "Volume comprado vai embora."
3. **Criação aberta, sozinha, não trouxe volume.** Limitless e PNP deixam qualquer pessoa criar mercados, e estão
   entre as que mais caíram ou menos andaram. Isso pesa contra a hipótese do slide de criadores, e a seção 3.2
   volta ao ponto.

### 2.4 Os três públicos em números

Os três públicos estão na Parte 1, seção 2.2: o projeto que patrocina, quem escolhe um lado e quem abre mercados.
O recorte que a pesquisa usou é o público de Solana e, dentro dele, o do pump.fun.

| Medida | Valor | Data | Etiqueta e fonte |
|---|---|---|---|
| Endereços ativos em Solana por semana | 27,1 milhões, sem filtro de robôs | Semana até 18/jan/2026 | FATO SECUNDÁRIO, Nansen, via BlockEden |
| pump.fun: carteiras únicas desde a criação | 80 milhões | jun/2026 | FATO SECUNDÁRIO, The Block |
| pump.fun: carteiras ativas por mês | Pico de 5,2 milhões em mai/2025; 1,8 milhão em dez/2025 | 2025 | FATO SECUNDÁRIO, fonte fraca |
| pump.fun: volume médio por dia | Cerca de 347 milhões de dólares | jun/2026 | FATO SECUNDÁRIO, The Block |
| pump.fun: receita por dia | 800 mil dólares, contra 4,8 milhões seis meses antes | jun/2026 | FATO SECUNDÁRIO, The Block |

O público é grande em número de carteiras, e a atividade caiu forte: a receita diária do pump.fun ficou em um sexto
do que era, e as carteiras ativas por mês, em um terço do pico (INFERÊNCIA sobre a tabela). Quantas pessoas reais
usam o pump.fun por dia não foi encontrado. Quanto cada carteira põe numa plataforma de previsão, e com que
frequência, também não.

**Cinco perfis, como hipótese.** Nenhuma entrevista foi feita. Os quatro primeiros são suposição da pesquisa da
v0.0.2; o quinto nasce do pitch e é suposição desta revisão (INFERÊNCIA, a conferir no beta).

| Perfil | O que busca | O que o afasta |
|---|---|---|
| Equipe de projeto | Divulgar uma meta e atrair quem segura o token | Pagar sem retorno que se possa medir |
| Comunidade de um token | Prova pública de que a meta foi cumprida | Meta que parece manipulável, taxa alta |
| Quem negocia memecoins | Giro rápido e a sensação de ter visto antes dos outros | Cadastro, prazo longo, mercado sem dinheiro do outro lado |
| Formador de opinião do X | Conteúdo que se compartilha | Risco de reputação, resultado contestável |
| Quem abre mercados | O 1% do pote e a autoria de um mercado que circula | Pote vazio, que rende menos que os 0,02 SOL; lista curta de tipos |

**O que une esse público** (INFERÊNCIA da pesquisa): preço de cripto em prazo curto e eventos de grande atenção.
Fatos de projeto de token, como queima ou trava de liquidez, não aparecem como categoria relevante em plataforma
nenhuma. O preço de ativo grande é o único tipo com demanda conhecida, e é por ele que o volume deve começar. Os
fatos de token são o que o pitch vende ao projeto, mas não se pode contar com eles como fonte principal de volume
antes de ver dinheiro de verdade.

### 2.5 A demanda não foi demonstrada: três testes

Dito sem rodeio: ninguém mostrou que o público web3 quer entrar em mercados sobre fatos lidos da rede, nem que
projetos pagam para ter um, nem que terceiros abrem mercados bons. Não há mercado parecido aberto em lugar nenhum,
não há entrevista e não há um dia de uso. O plano inteiro depende dessas três hipóteses. Cada uma tem um teste, e
os três custam pouco.

**Teste 1: o beta na devnet, com pontuação.** **Decisão.** "vamos montar inteiramente na devnet inicialmente". O
produto abre com mercados reais e resolução real, com USDC de teste, e quem acerta ganha pontos. O Melee fez isso e
juntou 49.247 pessoas numa fila (FATO, site do Melee, 4/out/2026). O beta mede quantas carteiras aparecem sem mídia
paga, quantas voltam em 30 dias, quais tipos recebem entradas nos dois lados e quantos potes terminam de um lado
só. O ponto vai para quem acerta, e não para quem movimenta mais: é a diferença entre este beta e as campanhas de
pontos que o pitch recusa. O limite do teste: dinheiro de teste não prova que a pessoa arriscaria dinheiro de
verdade.

**Teste 2: os parceiros.** Os 20 a 30 projetos convidados testam se projetos querem mercados sobre as próprias
metas. Mede-se quantos aceitam, quantos publicam o combinado, quantas carteiras cada publicação traz e quantas
entram. No fim, uma pergunta direta a cada parceiro: pagaria os 500 dólares? Se nenhum pagaria, o patrocínio como
receita continua sendo hipótese.

**Teste 3: os mercados abertos por terceiros.** É o teste novo. Mede-se quantos mercados quem não é da equipe
abre, quantos deles recebem entradas nos dois lados, quantos terminam de um lado só ou vazios, e quanto do volume
vem deles. Essa última medida é a fração que a seção 5.4 chama de `s`.

**Proposta, aguardando decisão.** Escrever, antes de o beta abrir, o que conta como sinal bom e como sinal ruim.
As réguas propostas para os dois primeiros testes são as da v0.0.2: menos de 10% das carteiras voltando em 30 dias
é sinal ruim, e de 20% a 35% é razoável; mais de 40% dos potes terminando de um lado só é sinal ruim. Para o
terceiro teste não há régua de referência; ela precisa ser escolhida antes do lançamento.

## 3. Concorrência

### 3.1 Os cinco concorrentes, lado a lado

**Decisão.** Para o fundador, "qualquer empresa de mercado de predição é concorrente direto, porém cada qual com
os seus diferenciais". A pesquisa levantou vinte nomes e olhou cinco de perto: o Melee e o PNP, os mais parecidos;
a Polymarket, a maior marca no público de cripto; o World, a maior distribuição dentro de Solana; e a Limitless,
referência de taxas publicadas e de token próprio. Os três do slide do problema estão entre eles. A Kalshi fica
fora: é a maior do setor, mas é uma bolsa regulada nos Estados Unidos, com cadastro completo.

Três termos para ler a tabela. **Livro de ordens** é uma lista de ofertas de compra e de venda. **Formador de
mercado automático** é um programa com uma fórmula que faz o papel da outra parte. **Curva** é uma fórmula em que
o preço sobe conforme entra dinheiro. Regras e fórmulas são FATO; volumes e falhas são FATO SECUNDÁRIO; médias de
taxa e quedas em percentual são INFERÊNCIA (documentação de cada plataforma, DefiLlama e leitura da rede, set e
out/2026).

| | Mecanismo | Quem abre os mercados | Como resolve | Taxa | Escala | Ponto fraco |
|---|---|---|---|---|---|---|
| Polymarket | Livro de ordens | A equipe, com sugestões do público | Oráculo UMA; se alguém contesta, detentores de um token votam, em 4 a 6 dias | Fórmula sobre o preço; na média, 2,0% dos dólares pagos | 4,63 bilhões em set/2026 | Resolução contestada e sem reembolso |
| World (Solana, na Phantom) | Formadores de mercado acionados por um roteador | Só a chave da empresa | A chave da empresa grava o resultado | De 2,5% a 5% do valor pago nos exemplos, mais a margem de quem forma o preço | 15,44 milhões em set/2026 | Uma chave decide tudo; 29,5 horas fora do ar no lançamento |
| Limitless (Base) | Livro de ordens e formador automático | A equipe e qualquer usuário | Oráculos de preço, provedores esportivos e, em parte, a equipe | De 0,40% a 3,00%; na média, 1,9% | 10,75 milhões em set/2026; eram 250,9 em maio | O volume caiu 96% em quatro meses |
| Melee (Solana) | Pote com curva e piso de retorno | Meta: qualquer pessoa | Pessoas: o criador ou a equipe | Não publicada | Sem dinheiro real; 49.247 na fila | Ainda não lançou; regra de preço difícil de explicar |
| PNP (Solana) | Curva; também pote entre duas partes | Qualquer pessoa | Dois modelos de linguagem; o criador pode nomear o juiz | 1% por negociação; 30% disso para quem criou | 206 transações em seis meses | Quase parado |
| **Brot Markets** | Pote | Qualquer carteira, dentro dos tipos que o programa lê | Leitura de uma conta da rede, com janela de 6 horas | 10% do lado perdedor; na média, 3,70% do volume (INFERÊNCIA). Mais 1% do pote para quem abriu | Devnet, sem usuários | Sem público, sem canal de distribuição, demanda não demonstrada |

### 3.2 O que cada um ensina

**Polymarket: a escala e o problema da resolução.** Mais de 1.150 mercados foram a arbitragem em 2026 até maio, e
em cerca de 1 de cada 5 disputas um votante tinha posição no mercado que julgava (FATO SECUNDÁRIO, Wall Street
Journal, via Finance Magnates, mai/2026). Um mercado de 7 milhões de dólares resolveu SIM sem o fato ter ocorrido,
e não houve reembolso (FATO SECUNDÁRIO, CoinDesk, mar/2025). É o caso que abre o slide do problema. Mas a
Polymarket tem o que nos falta: marca, dinheiro dos dois lados, qualquer assunto e saída a qualquer hora.

**World: a experiência vence a desconfiança.** Uma chave da empresa cria os mercados e grava o resultado, sem
prova (FATO SECUNDÁRIO, Chainstack Labs, 11/set/2026). Mesmo assim o público usa, porque é fácil: está dentro da
carteira e o pagamento chega sozinho. A lição é incômoda para um pitch que vende prova: resultado conferível,
sozinho, não traz ninguém; precisa vir junto com a mesma facilidade.

**Limitless: o aviso sobre criação aberta e incentivos.** Cerca de 17 milhões de dólares captados, token, pontos e
criação aberta de mercados não seguraram o volume: ele caiu 96% de maio a setembro de 2026. A causa da queda não
foi encontrada. O que a Limitless faz bem é publicar tudo: taxas, regras de indicação e política de reembolso
(FATO, documentação, out/2026).

**Melee: o mais parecido ainda não largou.** Roda em Solana, usa pote e captou 3,5 milhões de dólares (FATO
SECUNDÁRIO, imprensa de Solana, set/2025). O beta roda na rede de testes, com pontuação. Ele tem caixa,
investidores e fila; a janela só vale alguma coisa se a demanda existir.

**PNP: o aviso mais direto.** Qualquer pessoa cria um mercado, e quem cria recebe 30% da taxa. É o desenho mais
próximo do slide de criadores, e está quase parado: 206 transações em seis meses. A v0.0.2 dizia que a criação
aberta do PNP era "o oposto do que propomos" e deixava guardada a ideia de pagar o criador. O pitch adotou as
duas. O que passa a nos separar do PNP é uma coisa só: lá dois modelos de linguagem decidem o resultado; aqui o
programa lê uma conta.

A conclusão das duas últimas lições, sem suavizar: **criação aberta não é motor de crescimento provado.** O plano a
trata como hipótese a testar (seção 2.5), e não como fonte de volume nas contas.

### 3.3 Onde ficamos e o que copiamos

Cinco conclusões.

1. **O diferencial em confiança é real.** "O programa lê a conta e qualquer um confere" responde à queixa mais
   documentada do setor. Nenhum dos cinco resolve por leitura direta de uma conta da rede (INFERÊNCIA sobre os
   fatos lidos, out/2026). Fora dos cinco, o PancakeSwap Prediction e o Hyperliquid talvez resolvam assim; a
   pesquisa não verificou.
2. **É um nicho.** Esporte, política e economia, a maior parte do volume do setor, não se leem numa conta da
   Solana. A fatia do volume atual que caberia na nossa regra não foi encontrada, e é pequena.
3. **Não é escudo contra manipulação.** Na Polymarket, 821 contas ganharam 8,2 milhões de dólares em mercados de
   Bitcoin de 5 minutos, em momentos de liquidação provavelmente manipulados (FATO SECUNDÁRIO, CoinDesk, ago/2026).
   Mercado decidido por número pode ser empurrado por quem entra nele. Na v0.0.2 o que protegia era a equipe
   escolher as metas. Agora são as regras no programa (Parte 1, seção 4.2).
4. **Pode ser copiado.** O World já tem a parte automática pronta. Trocar a chave por leitura da rede, nos mercados
   de cripto, é trabalho de engenharia. A defesa possível é chegar primeiro e ter comunidade.
5. **O patrocínio é só nosso, para o bem e para o mal.** A fala diz "a parte que ninguém está fazendo". O que a
   pesquisa sustenta é menos: nenhum dos cinco estudados vende patrocínio de mercado com selo, em busca limitada
   (INFERÊNCIA). É diferencial, e é a razão de não existir preço de referência.

**Onde não somos diferentes.** A taxa fica dentro da faixa do setor, de 1,9% a 5% dos dólares pagos (INFERÊNCIA),
antes de somar a parte de quem abriu. A criação aberta é o que fazem PNP e Limitless. Entrar só com a carteira
também. O pote é o mecanismo do Melee e do PancakeSwap Prediction. **Onde ficamos atrás:** não há saída antecipada,
e os concorrentes têm público.

**Decisão: o que copiamos.** As cinco primeiras linhas são da v0.0.2. A sexta veio com o pitch.

| O que | De quem | Como fica no Brot |
|---|---|---|
| Página de taxas com exemplo numérico | Limitless | Uma página pública com a conta do pote, já descontadas a taxa e a parte de quem abriu |
| Política de reembolso escrita | Limitless | Mercado anulado devolve tudo, sem taxa |
| Pagamento automático | World | O prêmio chega sozinho à carteira, sem botão de resgate |
| Indicação com parte da taxa | Polymarket | 20% da taxa por 90 dias (seção 4.5) |
| Beta com pontuação antes do dinheiro real | Melee | Na devnet, com pontos por acerto |
| Criação aberta, com uma parte para quem cria | PNP, Limitless | Qualquer carteira abre por 0,02 SOL e fica com 1% do pote, só nos tipos que o programa lê |

Uma coisa não copiamos: pontuar volume. Opinion e Myriad premiaram quem movimentava mais, e o volume foi embora
quando o prêmio acabou.

## 4. Como a empresa ganha dinheiro

### 4.1 As quatro receitas

O slide de receita diz "We only earn from the losing side". Vale para a primeira linha da tabela, que é a única
com peso comprovado no setor: a taxa é toda a receita da Polymarket medida na rede em 2026 (FATO SECUNDÁRIO,
DefiLlama, 2026). As outras três existem e são menores.

| Receita | Regra | Marca | Tem número no modelo? |
|---|---|---|---|
| Taxa do pote | 10% do lado perdedor | Decisão, confirmada pelo pitch | Sim: 3,70% do volume, na média |
| Taxa de marketing | 10% do valor do patrocínio | Decisão do pitch | Sim, pequena (seção 4.3) |
| Taxa de abertura | 0,02 SOL por mercado aberto | Decisão do pitch | Não: faltam o número de mercados e o preço do SOL (seção 4.4) |
| 1% do pote de um lado só | Pago por todos, menos pela primeira carteira | Decisão | Não: fora do modelo desde a v0.0.2 |

E há uma saída nova, que pode ou não ser custo do Brot: o 1% do pote para quem abriu o mercado (seção 4.4).

### 4.2 A taxa e o destino dela

**Quanto a taxa rende depende do pote.** Num pote de 1.000 dólares dividido meio a meio, a taxa é de 50, ou 5% do
pote. Num pote de 900 contra 100, é de 10 se o favorito ganha e de 90 se o lado menor ganha; se o favorito ganhar
nove vezes em dez, a média é 1,8% do pote. A resposta pronta do pitch cita dois destes valores: 5% do pote no meio
a meio e 1% quando o favorito vence.

Para o negócio, o número que importa é a taxa média. Ela depende da mistura de mercados, e ninguém mediu essa
mistura. A tabela mostra três misturas, com 1 milhão de USDC de volume no mês (INFERÊNCIA; as misturas são
hipótese).

| Mistura | Taxa média | Taxa no mês |
|---|---|---|
| Maioria equilibrada (70% dos potes entre 50% e 60%; 30% entre 80% e 90%) | 4,18% | 41.800 |
| Meio a meio (base) | 3,70% | 37.000 |
| Maioria com favorito claro (30% equilibrados; 70% entre 85% e 95%) | 2,70% | 26.950 |

Todas as tabelas deste documento usam 3,70%. É a premissa mais frágil do modelo. A fala do pitch conta com a linha
de cima: quem abre mercados procuraria "a pergunta polêmica", a que divide. Se for assim, a média sobe para 4,18%. Se
a criação aberta trouxer mercados de resultado óbvio, vai para o outro lado. Não há dado para escolher.

**O destino. Decisão.** "vamos dividir 25% da taxa para treasure e todos os demais 75% para a operação ... até
equilibrarmos as contas, coisa que pode ser de 5 a 12 meses, e mudarmos as regras internas." Tesouraria é a reserva
da empresa (seção 4.6). Operação é o dinheiro que paga as contas do mês.

O caminho de cada 1.000 dólares de volume, com a taxa média de 3,70% (INFERÊNCIA):

| Destino | Valor |
|---|---|
| Volta a quem acertou | 963,00 |
| Tesouraria (25% da taxa) | 9,25 |
| Operação (75% da taxa) | 27,75 |
| Da parte da operação, o que paga a indicação (suposição do modelo) | 1,39 |
| Da parte da operação, o que sobra para pagar as contas | 26,36 |

Em mercado aberto por um terceiro, com o pitch ao pé da letra, a primeira linha perde 10 dólares, que vão para
quem abriu: 963 − 10 = 953. As outras linhas não mudam.

**A pilha sobre a taxa.** Quatro coisas saem, ou podem sair, da mesma taxa: a tesouraria (25%), a indicação (20%
da taxa do indicado), a parte de quem abriu (se o desenho escolhido for o C) e, se um dia existir, o desconto do
token (Parte 3). Falta dizer em que ordem. **Proposta, aguardando decisão:** escrever a ordem junto com a decisão
sobre o 1% (Parte 4, seção 4.6).

### 4.3 Patrocínio

**Decisão do pitch.** "From $500. 90% becomes the prize pool. 10% is a marketing fee." O produto está na Parte 1,
seção 3.7. Aqui fica a conta: `prêmio = 0,90 × valor pago` e `Brot = 0,10 × valor pago`.

A última coluna diz quanto volume renderia o mesmo à operação. Ela divide a parte do Brot por 2,63625%, que é o que
a operação recebe de cada dólar de volume (`3,70% × 75% × 95%`).

| Valor pago | Prêmio, antes e agora | Brot, antes e agora | Volume que rende o mesmo, antes e agora |
|---|---|---|---|
| 500 | 350 e 450 | 150 e 50 | 5.690 e 1.897 |
| 1.500 | 1.050 e 1.350 | 450 e 150 | 17.070 e 5.690 |
| 5.000 | 3.500 e 4.500 | 1.500 e 500 | 56.899 e 18.966 |

Só o valor de 500 está no pitch. Os de 1.500 e 5.000 ficam como tamanhos supostos (Parte 1, seção 3.7).

Três leituras.

- **O patrocínio deixou de pesar nas contas.** Para pagar um mês de custo só com patrocínios de 500 eram precisos
  36,7 (`5.500 ÷ 150`). Agora são 110 (`5.500 ÷ 50`). Um patrocínio de 500 vale para a operação o mesmo que 1.897
  dólares de volume.
- **O projeto recebe mais pelo que paga.** De cada 500 dólares, 450 viram prêmio para a comunidade dele. É o
  argumento de venda do slide, e é um argumento melhor que o da v0.0.2.
- **Os 10% vão inteiros para a operação**, até o equilíbrio, sem parte para a tesouraria. **Decisão** de
  5/10/2026 ("concordo"), tomada quando a parte da plataforma era maior; a regra de destino continua.

**O que não existe: precedente.** O programa mais parecido é o da Polymarket, em que qualquer pessoa deposita
dinheiro para premiar um mercado. Lá o patrocinador não recebe nada em troca, e a mediana é de 3 dólares por dia
por mercado (FATO, regras; FATO SECUNDÁRIO, valores, Vultax, set/2026). Ninguém foi encontrado vendendo patrocínio
de mercado com selo e destaque.

**O preço.** No DexScreener, o site em que esse público acompanha preços, o anúncio de um token custa "a partir de
US$ 299" (FATO, página oficial), e a barra de tendências, "a partir de US$ 2.000" (FATO SECUNDÁRIO). O piso de 500
dólares está dentro do que equipes de token já pagam por destaque. A diferença é que esses sites vendem uma
audiência de milhões, e o Brot começa sem audiência. O que o patrocinador compra de concreto, no começo, é o prêmio
à vista dentro do pote, coisa que nenhum site de anúncio vende.

Por tudo isso, as projeções contam muito pouco com o patrocínio pago (seção 5.1).

### 4.4 Quem abre: a taxa de abertura e o 1%

**A taxa de abertura, pelo lado do caixa. Decisão do pitch.** "0.02 SOL to open a market." A conta da receita é
`receita do mês = N × (0,02 × PREÇO_SOL − ALUGUEL)`. `N` é o número de mercados abertos no mês. `PREÇO_SOL` é o
preço do SOL em dólares. `ALUGUEL` é o depósito que a Solana exige para manter as contas do mercado abertas.
Nenhum dos três está medido. A tabela abaixo é **ilustração, e não fato**: usa três preços supostos e ignora o
aluguel.

| `PREÇO_SOL` suposto | Por mercado | 100 mercados no mês | Mercados para pagar sozinhos os 5.500 |
|---|---|---|---|
| 100 | 2 | 200 | 2.750 |
| 200 | 4 | 400 | 1.375 |
| 300 | 6 | 600 | 917 |

A leitura: a taxa de abertura é barreira, e não negócio. Mesmo com o SOL a 300 dólares, seriam precisos 917
mercados abertos num mês para ela pagar o custo sozinha. O que ela faz bem é encarecer o lixo: abrir 1.000 mercados
sem sentido custa 20 SOL. Do aluguel sabe-se uma parte: o cofre de USDC de cada mercado pede cerca de 0,002 SOL,
10% da taxa (FATO, v0.0.2, P4 §4.5). O da conta do mercado não foi medido. Para onde vão os 0,02 SOL o pitch não
diz; a proposta está na Parte 1, seção 4.1.

**O 1% de quem abriu, pelo lado do caixa.** A Parte 1, seção 3.4, mostra os três desenhos. Para as contas da
empresa, eles se dividem em dois grupos.

- **Desenhos A e B: não custa nada ao Brot.** Quem paga é quem acerta. A taxa média continua em 3,70% e o ponto de
  equilíbrio não muda. O custo aparece em outro lugar: o pote meio a meio passa a perder 6%, acima da faixa do
  setor, e o exemplo do slide de receita deixa de fechar.
- **Desenho C: custa cerca de 1 ponto do pote.** A receita esperada cai de 5,0% para 4,0% do pote no meio a meio e
  de 1,8% para 0,8% no 90 a 10. Com todo o volume em mercados abertos por terceiros, a taxa média cai de 3,70% para
  2,70% na mistura de base, de 4,18% para 3,18% na equilibrada e de 2,70% para 1,86% na de favorito claro. Na
  mistura de base, a perda chega a 27% da taxa.

Como nem todo o volume virá de mercados de terceiros, a conta do desenho C depende de uma fração, `s`: a parte do
volume que está nesses mercados. Na mistura de base, `taxa média = 3,70% − s × 1,00%`. A fração `s` é mais um
número que ninguém tem; o terceiro teste da seção 2.5 serve para medi-la.

**O que quem abre ganha.** O 1% do pote paga os 0,02 SOL quando o pote passa do equivalente a 2 SOL. Em dólares,
isso depende do `PREÇO_SOL`, e por isso não há valor aqui. Para comparar com o único precedente no nosso material:
o PNP dá a quem cria 30% de uma taxa de 1% por negociação.

### 4.5 Parceiros e indicação

**Os parceiros de lançamento.** **Decisão**, confirmada pelo pitch: de 20 a 30 projetos ganham um mercado grátis,
em troca de duas publicações (Parte 1, seção 3.8). Não há parceiro fechado até a data deste documento.

A conta de quanto se abre mão ficou menor. Se os 30 parceiros pagassem 500 dólares, seriam 15.000, dos quais 1.500
ficariam com a plataforma (`30 × 500 × 10%`). Na v0.0.2 eram 4.500. Nos dois casos, menos que um mês de custo. Ao
abrir mão desse valor, o programa busca três coisas que ele não compraria: público com motivo para entrar,
mercados sobre metas reais e prova, isto é, trinta mercados resolvidos sem erro com nomes que o público conhece. A
consequência assumida continua: no primeiro ano, os parceiros são aquisição de público, e não receita. O parceiro
gratuito também não traz prêmio para o pote: aquele mercado depende só das entradas.

**A indicação.** **Decisão**, confirmada pelo pitch: quem indica recebe 20% da taxa do indicado por 90 dias; o
indicado recebe de volta a taxa dos primeiros 50 USDC, com teto de 5 USDC, depois de completar 250 (Parte 1, seção
3.9).

A conta, com a taxa média de 3,70% (INFERÊNCIA): o indicado entra com 1.000 dólares em 90 dias, e a taxa descontada
dos ganhos dele soma 37. Quem indicou recebe 7,40. A devolução ao indicado é, na média, de 1,85. O Brot fica com
27,75, ou 75% do que teria sem a indicação. Indicação é custo para trazer gente, e não receita. No modelo, ela
consome 5% da parte da operação, supondo que um quarto do volume venha de indicados ainda dentro dos 90 dias. Se
for metade do volume, o custo dobra. A devolução não está nesses 5%.

Uma comparação: a Polymarket paga 10% da taxa dos indicados diretos e 5% dos indiretos, por 30 dias, e só a quem
já negociou 10.000 dólares (FATO, documentação). A regra daqui é mais generosa. O risco que sobra é a pessoa
indicar a si mesma; o fundador aceitou o risco, que no pior caso custa 0,74% do volume.

### 4.6 Em espera: fundo de prêmios, tesouraria, recompra e fase 2

O pitch não fala de nenhum dos quatro. As decisões de 5/10/2026 continuam valendo, e os detalhes ficam na v0.0.2,
P2 §4.5 a §4.8.

**Fundo de prêmios.** É uma reserva do Brot para pôr prêmio dentro dos potes, porque pote vazio não atrai ninguém.
**Decisão.** "vamos prometer essa feature no futuro": o fundo "poderá ser criada a partir do mês 10", e só recebe a
sobra da operação, até o limite de 25% da taxa. No cenário razoável refeito, ele soma 65.755 dólares até o mês 24;
eram 66.055 (INFERÊNCIA). O risco: para recuperar 1 dólar em taxa, o prêmio precisa trazer 27 dólares de volume
novo (`1 ÷ 3,70%`), e ninguém publicou se isso acontece. As regras de gasto precisam estar escritas antes do mês
10.

**Tesouraria.** É a reserva da empresa, comprada com 25% de toda a taxa. **Decisão.** Ela "começa desde o dia
zero, mas depois do mês 12 a gente repensa". No cenário razoável, soma 18.038 dólares no mês 12 e 78.394 no mês 24
(INFERÊNCIA, a preço de compra); esses dois números não mudam, porque a taxa do pote não mudou. O ponto que
continua de pé: a base é a taxa bruta, antes de qualquer custo, e no mês 12 a empresa teria essa reserva com o
caixa ainda negativo. Por isso a tesouraria não pode ser a reserva que paga as contas num mês ruim. A guarda está
na Parte 4, seção 4.7.

**Recompra.** É a empresa comprar o próprio token no mercado e destruí-lo. **Decisão.** "só faríamos isso com
caixa da empresa a partir do mês 13, não antes". Está fora das projeções. A resposta pronta do pitch vai mais
longe: "a gente não promete preço nem recompra". Nenhum texto do produto promete recompra, preço ou retorno.

**Fase 2.** As outras formas de receita que os líderes usam ficam na lista da v0.0.2, e a maior é também a mais
distante: esportes são 62% do volume do setor (FATO SECUNDÁRIO, Bernstein, abr/2026), mas resultado de jogo não
nasce na rede, e é a categoria que as regras brasileiras citam pelo nome.

## 5. Projeções

### 5.1 Premissas

Tudo neste capítulo é INFERÊNCIA. O produto não tem um dia de uso com dinheiro real, e não existe dado medido de
volume, de carteiras nem de receita. As tabelas servem para comparar caminhos e ver o que muda quando uma premissa
muda. Não são previsão, e o cenário razoável não é promessa. O modelo da v0.0.2 foi remontado por script na revisão
de impacto, reproduziu as tabelas publicadas e só então recebeu as regras novas. Ele não inclui impostos, mídia
paga nem venda de token.

| Premissa | Valor | Origem |
|---|---|---|
| Taxa do pote | 10% do lado perdedor; na média, 3,70% do volume | A forma é decisão. A média é a premissa mais frágil: vai de 2,70% a 4,18% |
| Destino da taxa | 25% para a tesouraria; 75% para a operação | Decisão |
| Parte de quem abriu | 1% do pote, fora da taxa do Brot (desenhos A ou B) | Decisão do pitch, lida ao pé da letra. O desenho C está na seção 5.4 |
| Patrocínio pago | A parte do Brot é de 10%. As quantidades são as da v0.0.2: nenhuma no ruim; no razoável, um de 500 por mês do mês 7 ao 12 e, no segundo ano, dois de 500 e um de 1.500 por mês | A divisão é decisão do pitch. As quantidades são suposição |
| Taxa de abertura | Fora do modelo | Faltam `N` e `PREÇO_SOL` |
| Fração `s` do volume em mercados de terceiros | Sem valor | Ninguém mediu |
| Custo da indicação | 5% da taxa que vai para a operação | Suposição: um quarto do volume vem de indicados nos primeiros 90 dias |
| Custo mensal | 5.500 dólares, desde o primeiro mês com dinheiro real | Decisão |
| Gasto antes do dinheiro real | 7.500 dólares: 2.000 da abertura da empresa e 5.500 de um mês de devnet. Auditoria e avaliação jurídica sem custo | Informado pelo fundador |
| Trajetória de volume | A dos três cenários da v0.0.2, sem mudança | Suposição herdada. O pitch não traz dado para mudá-la |
| Fundo de prêmios | A partir do mês 10: o menor entre 25% da taxa e a sobra da operação | Decisão |
| Recompra | Fora do modelo | Decisão |

### 5.2 Ponto de equilíbrio

Ponto de equilíbrio é o volume mensal em que a parte da operação paga os 5.500 dólares de custo. A conta é
`5.500 ÷ (taxa média × 75% × 95%)`: a operação recebe 75% da taxa, menos os 5% da indicação.

| Caso | Taxa média | Volume de equilíbrio por mês |
|---|---|---|
| **Mistura meio a meio (base)** | 3,70% | **208.630** |
| Maioria equilibrada | 4,18% | 184.672 |
| Maioria com favorito claro | 2,70% | 285.900 |
| Desenho C, com metade do volume em mercados de terceiros | 3,20% | 241.228 |
| Desenho C, com todo o volume em mercados de terceiros | 2,70% | 285.900 |

As três primeiras linhas são as da v0.0.2 e valem para o pitch ao pé da letra. As duas últimas mostram o preço de
tirar o 1% da taxa do Brot: o equilíbrio sobe de 208.630 para até 285.900 dólares por mês.

**O que 208.630 quer dizer.** É 1,4% dos 15,44 milhões que o World fez em setembro de 2026. Em carteiras, se cada
uma puser 200 dólares por mês, que é a suposição do cenário razoável, são cerca de 1.040 carteiras ativas.

### 5.3 Os três cenários

**Como ler.** **Operação** é a parte da taxa que paga as contas, já descontada a indicação. **Patrocínio** é a
parte do Brot, agora 10% do valor pago. Como 10% é um terço de 30%, cada valor dessa coluna é o da v0.0.2 dividido
por três. **Caixa** é a soma dos resultados desde antes do lançamento, partindo de −7.500. A tesouraria não entra
no caixa: é reserva à parte.

A revisão de impacto refez o modelo com o patrocínio a 10% e publicou os totais de cada cenário. O resultado e o
caixa de cada mês intermediário não foram publicados e não foram calculados aqui. Por isso as tabelas do razoável
e do otimista trazem as colunas que não mudaram e a do patrocínio, e os totais vêm no texto.

**Cenário ruim.** O volume chega a 45 mil por mês no mês 6, fica aí e cai no segundo ano. Não há patrocínio pago, e
por isso nada muda em relação à v0.0.2.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Custo | Resultado | Caixa |
|---|---|---|---|---|---|---|---|
| 6 | 45.000 | 1.665 | 416 | 1.186 | 5.500 | −4.314 | −36.348 |
| 12 | 45.000 | 1.665 | 416 | 1.186 | 5.500 | −4.314 | −62.230 |
| 18 | 38.750 | 1.434 | 358 | 1.022 | 5.500 | −4.478 | −88.804 |
| 24 | 31.250 | 1.156 | 289 | 824 | 5.500 | −4.676 | −116.565 |

Este cenário não se paga. A operação recebe no máximo 1.186 dólares por mês contra um custo de 5.500. O caixa chega
a −116.565 no mês 24 e continua caindo. Nenhum ajuste de regra conserta isso: só mais volume.

**Cenário razoável.** O volume chega a 300 mil por mês no mês 12 e a 712 mil no mês 24. É o retrato de um nicho
pequeno e fiel, sem distribuição paga.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio, antes e agora | Custo |
|---|---|---|---|---|---|---|
| 6 | 150.000 | 5.550 | 1.388 | 3.954 | 0 e 0 | 5.500 |
| 12 | 300.000 | 11.100 | 2.775 | 7.909 | 150 e 50 | 5.500 |
| 18 | 487.500 | 18.038 | 4.509 | 12.852 | 750 e 250 | 5.500 |
| 24 | 712.500 | 26.363 | 6.591 | 18.783 | 750 e 250 | 5.500 |

Os totais refeitos: a operação se paga no **mês 9**, como antes. O ponto mais baixo do caixa é **−27.674**; eram
−27.474. O caixa no mês 24 é de **21.467**; eram 27.767. A parte do Brot nos patrocínios soma 3.300 em 24 meses;
eram 9.900. O corte custa 6.300 dólares de caixa em 24 meses. O fundo de prêmios soma 65.755 até o mês 24, e a
tesouraria, 78.394.

**Cenário otimista.** O volume chega a 1,5 milhão por mês no mês 12 e a 4,7 milhões no mês 24. Depende de um canal
de distribuição, como a integração com uma carteira, que hoje não existe.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio, antes e agora | Custo |
|---|---|---|---|---|---|---|
| 6 | 750.000 | 27.750 | 6.938 | 19.772 | 150 e 50 | 5.500 |
| 12 | 1.500.000 | 55.500 | 13.875 | 39.544 | 750 e 250 | 5.500 |
| 18 | 2.958.333 | 109.458 | 27.365 | 77.989 | 1.400 e 467 | 5.500 |
| 24 | 4.708.333 | 174.208 | 43.552 | 124.123 | 1.400 e 467 | 5.500 |

Os totais refeitos: o caixa no mês 24 é de **783.963**; eram 798.462. A parte do Brot nos patrocínios soma 7.250
em 24 meses; eram 21.750. O corte custa 14.499 dólares de caixa. Na v0.0.2 a operação se pagava no mês 2 e o ponto
mais baixo do caixa era −9.705, no mês 1; como o patrocínio pago desse cenário só começa no mês 4, esses dois
números não mudam (INFERÊNCIA, conferida por script na revisão final do plano). Um aviso: o custo fica em 5.500
nos 24 meses, o que não é realista com esse volume. É a conta sem contratar ninguém.

### 5.4 Se uma premissa mudar

Três premissas mexem no resultado mais que todas as outras: a mistura de mercados, de onde sai o 1% e quanto do
volume vem de mercados de terceiros. A tabela refaz o cenário razoável, com a mesma trajetória de volume
(INFERÊNCIA).

| Caso | Taxa média | Mês em que a operação se paga | Ponto mais baixo do caixa | Caixa no mês 24 |
|---|---|---|---|---|
| **Pitch ao pé da letra, mistura de base** | 3,70% | 9 | −27.674 | 21.467 |
| Pitch ao pé da letra, maioria equilibrada | 4,18% | 8 | −25.102 | 40.150 |
| Pitch ao pé da letra, maioria com favorito claro | 2,70% | 12 | −36.008 | −15.826 |
| Desenho C, metade do volume em mercados de terceiros (`s` = 50%) | 3,20% | 10 | −31.200 | 2.370 |
| Desenho C, todo o volume em mercados de terceiros (`s` = 100%) | 2,70% | 12 | −36.008 | −15.826 |

Três leituras.

- **A alavanca grande é de onde sai o 1%.** Tirá-lo da taxa do Brot, com todo o volume em mercados de terceiros,
  tem o mesmo efeito que a pior mistura de mercados: a operação só se paga no mês 12, e o caixa ainda está negativo
  no mês 24. Com metade do volume, o caixa do mês 24 cai de 21.467 para 2.370.
- **A mistura continua pesando tanto quanto antes.** Entre a pior e a melhor, o caixa do mês 24 vai de −15.826 a
  40.150, com o mesmo volume.
- **As duas coisas podem se somar.** O desenho C com maioria de favorito claro leva a taxa média a 1,86%. Esse
  cenário não foi rodado.

No otimista, o desenho C leva o caixa do mês 24 de 783.963 para 660.150 com metade do volume em mercados de
terceiros, e para 536.338 com todo ele. No ruim, de −116.565 para −119.664 e −122.763.

### 5.5 Capital, captação e critério de parada

Capital necessário é o dinheiro que precisa vir de fora da receita para a empresa atravessar o ponto mais baixo do
caixa.

| Cenário | Ponto mais baixo do caixa | Quando |
|---|---|---|
| Ruim | −116.565 | Mês 24, e continua caindo |
| Razoável | −27.674 | Mês 8, como na v0.0.2 (conferido por script na revisão final) |
| Otimista | −9.705 | Mês 1 (seção 5.3) |

Três coisas a pesar. Cada mês a mais de devnet soma 5.500 dólares a todas as linhas. Com maioria de favorito
claro, ou com o desenho C em todo o volume, o ponto mais baixo do razoável desce para −36.008. E quase todo o
buraco é a retirada mensal dos três sócios, 4.500 dos 5.500: se eles a adiarem, o razoável pede muito pouco.

**Decisão: a captação.** O fundador busca investimento "de USD50k nos primeiros 6 meses a USD 350k até o final do
primeiro ano", com a ressalva: "temos que trabalhar no bootstrap, sem depender de conseguirmos qualquer coisa".
Bootstrap é tocar a empresa com o dinheiro dos sócios e da própria receita. Essa captação cobre com folga os
cenários razoável e otimista. O ruim não se paga com capital nenhum: mais dinheiro só adia o fim.

**A lista de investidores.** Existe uma planilha com cerca de 50 mil investidores mapeados, para convite por
email. **Decisão.** O fundador a trata como lista de contatos de negócio: "não tem problema, pois são e-mails de
negócios, e não dados pessoais". A ressalva continua: endereço de email com nome de pessoa pode ser lido como dado
pessoal pela LGPD, a lei brasileira de proteção de dados. O convite leva opção de descadastro, e a lista não é
publicada nem compartilhada.

**Decisão: o critério de parada.** O fundador aceitou o critério como estava proposto: "ok". Se, aos 180 dias na
rede principal, o volume do mês for de até 45 mil dólares e menos de 10% das carteiras estiverem voltando, o
cenário é o ruim, e a empresa para ou muda de rumo. Parar no mês 6 limita a perda a 36.348 dólares. Seguir até o
mês 24 leva a 116.565. O critério fica escrito antes do lançamento, quando ainda é fácil ser frio. É a decisão que
limita a perda, e o pitch não a altera.

### 5.6 Metas de 90 dias e o que o modelo não sabe

As metas dos primeiros 90 dias com dinheiro real servem para saber cedo em qual cenário a empresa está.

| Medida | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume, somado | Até 45 mil | 150 mil | 750 mil ou mais |
| Volume no terceiro mês | 22.500 | 75.000 | 375.000 |
| Carteiras ativas no terceiro mês | 150 | 375 | 1.500 |
| Carteiras que entram de novo em 30 dias | Menos de 10% | 20% a 35% | Mais de 35% |
| Potes que terminam de um lado só | Mais de 40% | Cerca de 20% | Menos de 10% |
| Taxa arrecadada, a 3,70% do volume | 1.665 | 5.550 | 27.750 |
| Mercados abertos por quem não é da equipe | Régua a definir | Régua a definir | Régua a definir |

A linha que mais importa é a das carteiras que entram de novo. Volume alto com menos de 10% delas voltando é o
retrato que veio antes das quedas de 80% a 96% dos concorrentes. A última linha é nova e não tem número: nenhuma
fonte dá uma referência.

**O que o modelo não sabe.** A lista da v0.0.2 continua: quanto cada carteira põe por mês, quantas voltam, quantos
parceiros viram pagantes, quanto do volume vem por indicação, se a auditoria e a avaliação jurídica saem mesmo a
custo zero, e se o produto sai da devnet em um mês. O pitch acrescentou seis pontos que a revisão não pôde refazer:

1. **As trajetórias de volume.** O pitch afirma que criadores e parceiros trazem volume. Não há dado para mudar a
   curva.
2. **A receita da taxa de abertura.** Faltam `N` e `PREÇO_SOL`.
3. **A fração `s`** do volume em mercados de terceiros.
4. **A mistura de mercados com criação aberta.** Mercados divididos levariam a 4,18%; mercados de lixo, ao
   contrário.
5. **O 1% do pote de um lado só**, que já estava fora do modelo.
6. **O custo dos serviços com muitos mercados.** O modelo mantém "até 1.000" dólares de infraestrutura.

## 6. Entrada no mercado

### 6.1 Agora, lançamento, rede principal

O slide de crescimento traz o roteiro em três marcos, sem datas.

| Marco | No slide | O que quer dizer |
|---|---|---|
| Agora | "Devnet, test tokens." | O produto roda na rede de testes, com USDC de teste e pontos para quem acerta. Toda tela diz que é fase de testes |
| Lançamento | "Partner markets live." | Entram os mercados dos primeiros parceiros, cada um sobre a própria meta |
| Rede principal | "After an audit, a multisig and a cap." | Dinheiro real, depois de auditoria externa, carteira de várias assinaturas e teto para o total nos potes |

O plano não acrescenta data. A que existe é a da v0.0.2, e o fundador a deu como provável: "provavelmente vamos pra
mainnet já no início do mês 2". Os três critérios precisam caber nesse prazo; se não couberem, a data anda (Parte
4, seção 3.1). O primeiro mês na rede principal é o mês 1 das projeções.

### 6.2 Os quatro motores de crescimento

**Decisão do pitch.** O slide de crescimento lista quatro motores. A fala os resume: "A gente quer gente com
motivo pra entrar."

| Motor | No slide | Como funciona | O que custa | O que falta provar |
|---|---|---|---|---|
| Parceiros | "20–30 projects get one market free." | Cada projeto mostra o próprio mercado à comunidade dele | A taxa de marketing de que o Brot abre mão: até 1.500 dólares | Se a comunidade do parceiro entra, e se algum parceiro pagaria depois |
| Indicação | "20% of the fee, for 90 days." | Quem traz uma carteira recebe parte da taxa dela | Cerca de 25% da taxa do indicado, e só quando ele ganha | Quanto do volume vem por indicação |
| Cartão para o X | "Every market is a card you post on X." | Cada mercado tem um cartão pronto para publicar. Cada resolução vira uma publicação com o número lido, a meta e o link | Tempo da equipe | Se alguém compartilha |
| Quem abre mercados | "Every creator promotes their own market." | Quem abriu ganha 1% do pote e por isso divulga | O 1%, pago por quem acerta ou pelo Brot (seção 4.4) | Tudo: os precedentes são contrários (seção 3.2) |

**Por que não há mídia paga. Decisão.** Uma carteira que põe 200 dólares por mês durante seis meses soma 1.200 de
volume e deixa cerca de 32 dólares para a operação (`1.200 × 3,70% × 75% × 95%`; INFERÊNCIA sobre uma suposição).
Trazer um usuário, em cripto, já custou de 77 a 2.500 dólares (FATO SECUNDÁRIO, casos de 2021 a 2023). Comprar
usuário custa várias vezes o que ele devolve.

**"Não vamos comprar volume com campanha de pontos."** A frase convive com o beta com pontuação: as campanhas que
o pitch recusa premiam volume, e o beta premia acerto, com dinheiro de teste (seção 2.5).

**Falta o canal grande.** Em Solana, a distribuição passa pelas carteiras (seção 2.3). Integração com uma carteira
não se pede no primeiro dia: conquista-se com meses de resolução sem erro. O cenário otimista depende dela, e ela
não está entre os quatro motores.

### 6.3 O que medir

A medida principal não é volume. É retenção: a parcela das carteiras que entra de novo em 30 dias.

| O que medir | Para que serve | Sinal ruim |
|---|---|---|
| Carteiras que entram de novo em 30 dias | Saber se há hábito | Menos de 10% |
| Potes que terminam de um lado só | Saber se os mercados interessam aos dois lados | Mais de 40% |
| Carteiras e volume que cada parceiro trouxe | Vender o patrocínio pago | Parceiro que publica e não traz ninguém |
| Mercados abertos por terceiros, e quantos recebem os dois lados | Testar o slide de criadores e medir a fração `s` | Muitos mercados vazios; régua a definir |
| De qual canal veio cada carteira | Saber onde pôr o tempo da equipe | Um canal só respondendo por quase tudo |
| Mercados resolvidos sem erro e no prazo | Sustentar a promessa central | Qualquer erro |

Quase tudo isso sai do registro público do programa, sem coletar dado pessoal.

## 7. Decisões e pontos abertos

**O que está decidido.** As sete respostas do fundador de 5/10/2026 continuam valendo onde o pitch não as mudou: a
forma da taxa, o destino da parte do Brot no patrocínio, o programa de parceiros, o benefício do indicado, o tempo
na devnet, o critério de parada e a lista de investidores. O pitch decidiu quatro coisas que tocam o caixa: a
divisão de 90% e 10% no patrocínio, a taxa de abertura de 0,02 SOL, o 1% para quem abriu e os quatro motores de
crescimento.

**O que espera decisão do fundador.** Os números de 1 a 14 são os da revisão de impacto, seção 6; a 19 é proposta
desta versão. A lista inteira está no índice, `BUSINESS-PLAN.md`.

| Nº | Decisão | Recomendação | Efeito nas contas |
|---|---|---|---|
| 1 | De onde sai o 1% de quem abriu | Desenho B: do prêmio, com teto | Em C, o equilíbrio sobe para até 285.900 por mês |
| 2 | Para onde vão os 0,02 SOL | Para o Brot, sem devolução, descontado o aluguel | Pequeno; cria caixa em SOL |
| 3 | Valores acima de 500 e contrapartidas | 500 como piso, sem faixas fixas | Define o que cabe em 50 dólares |
| 9 | "Referrals, day one" | "Day one" é o primeiro dia na rede principal | Nenhum no modelo, que já conta a indicação desde o mês 1 |
| 19 | Onde fica o SOL das taxas de abertura | Numa conta da carteira de várias assinaturas; repõe a carteira do serviço, e o resto vira USDC em data fixa | Nenhum no modelo; o caixa fica em dólar (Parte 4, seção 4.7) |

**As objeções da v0.0.1 que mudaram de situação com o pitch.**

| Objeção | Assunto | Situação | O que mudou |
|---|---|---|---|
| OBJ-01 | Ninguém demonstrou a demanda | Mantida, e maior | São três hipóteses, e não duas. Entra o terceiro teste (seção 2.5) |
| OBJ-15 | Preço de vitrine, sem vitrine e sem precedente pago | Mantida, com risco menor | Só o piso de 500 é regra; a parte do Brot caiu para 10%, e o modelo conta ainda menos com patrocínio |
| OBJ-16 | O fundo de prêmios só se paga se causar boa parte do volume | Adiada | Sem mudança de regra; 65.755 no razoável |
| Nova | Criação aberta como motor de crescimento | Aberta | PNP e Limitless são evidência contrária; o plano a trata como hipótese |

**O que a pesquisa não encontrou.** Um precedente de patrocínio de mercado com contrapartida. Um caso em que a
criação aberta tenha sustentado volume. A fatia do volume do setor que caberia na nossa regra. Quanto cada carteira
põe por mês numa plataforma de previsão em blockchain. A mistura real de mercados. A causa da queda da Limitless.

