# Brot Markets — Business Plan v0.0.2 — Parte 2: Mercado e negócio

**Data:** 5 de outubro de 2026. **Estado:** revisado com as respostas do fundador de 5/10/2026. Substitui os
capítulos 5, 6, 7, 9 e 10 do BP v0.0.1. A Parte 1 (produto) está pronta; as Partes 3 (tokens) e 4 (construção e
risco) vêm depois.

**Como ler.** As marcas são as da Parte 1. **Decisão** é o que o fundador já decidiu, com as palavras dele entre
aspas quando ajudam. **Proposta, aguardando decisão** é o que este documento sugere e o fundador ainda não
respondeu; o que continua aberto está no capítulo 7. Números de mercado trazem FATO (lido na fonte) ou FATO
SECUNDÁRIO (lido em quem citou a fonte), com a data. Toda projeção é INFERÊNCIA: conta nossa sobre premissas
declaradas, e não previsão. Os valores estão em dólares. Cinco termos aparecem no texto inteiro. **Volume** é a
soma de tudo o que foi apostado num período. **Ponto de equilíbrio** é o volume mensal em que a empresa paga as
próprias contas. **Caixa** é o dinheiro da operação, somado desde antes do lançamento. **Devnet** é a rede de
testes da Solana. **Mês 1** é o primeiro mês com dinheiro real, na rede principal; o mês de devnet vem antes. O
pote, a taxa e os tipos de pergunta estão explicados na Parte 1.

**O que mudou desde a v0.0.1.**

1. O nome é Brot Markets.
2. Não há saída antecipada no MVP: o dinheiro apostado fica no pote até a resolução.
3. A taxa deixou de se dividir em quatro: 25% vão para a tesouraria e 75% para a operação, até o equilíbrio.
4. O custo de referência é um só: 5.500 dólares por mês.
5. A taxa é 10% do lado perdedor: na média, 3,70% do volume, a base de todas as tabelas. Os 3% do pote saíram e
   servem só de comparação.
6. O ponto de equilíbrio caiu de 733.333 para 208.630 dólares apostados por mês.
7. No patrocínio, 70% vão para o pote e 30% para a plataforma. Os primeiros 20 a 30 parceiros não pagam.
8. O fundo de prêmios só começa no mês 10, e a recompra do token, só depois do mês 13.
9. A indicação entra desde o MVP. O produto fica cerca de um mês na devnet, com pontuação, e depois vai para a
   rede principal.
10. Os números financeiros da v0.0.1 estão superados. Valem os deste documento.

## 1. Resumo

### 1.1 O mercado em três números

- **21,7 bilhões de dólares** foi o que o setor de mercados de previsão movimentou em 30 dias, de 4 de setembro
  a 3 de outubro de 2026, em dinheiro de fato pago (FATO SECUNDÁRIO, DefiRate, out/2026). Duas empresas, Kalshi e
  Polymarket, ficam com a maior parte.
- **Cerca de 15 milhões** foi o volume de setembro de 2026 do World, o mercado de previsão que funciona dentro da
  Phantom, a carteira que o público de Solana já usa (FATO SECUNDÁRIO, DefiLlama, set/2026). É a melhor vitrine
  da rede, e fez cerca de 300 vezes menos que a Polymarket no mesmo mês (INFERÊNCIA).
- **Zero** é o número de mercados abertos sobre queima, trava de liquidez ou outro fato de token de terceiros que
  a pesquisa encontrou, em qualquer plataforma (FATO, ausência em busca limitada, out/2026). O nosso tipo de
  pergunta ainda não tem demanda demonstrada.

### 1.2 Como a empresa ganha dinheiro

Duas linhas de receita têm número.

- **A taxa.** **Decisão:** a casa fica com 10% do lado perdedor de cada pote. Quem acerta recebe de volta o que
  apostou, mais a sua parte em 90% do que o outro lado perdeu. Na média, isso dá 3,70% do volume (INFERÊNCIA; de
  2,70% a 4,18%, seção 4.1). De cada dólar de taxa, 25 centavos vão para a tesouraria, que é a reserva da empresa
  guardada em Bitcoin, e 75 centavos vão para a operação, que paga as contas.
- **O patrocínio.** Um projeto paga 500, 1.500 ou 5.000 dólares para pôr dinheiro numa pergunta e aparecer.
  **Decisão:** 70% vão para o pote, sem pagar taxa, e 30% ficam com a plataforma e vão inteiros para a operação
  até o equilíbrio. Os primeiros 20 a 30 parceiros entram sem pagar, em troca de divulgação. No primeiro ano,
  portanto, o patrocínio traz público, não receita.

Duas coisas ficam para depois. O fundo de prêmios, uma reserva para pôr prêmio nos potes, só começa no mês 10 e
só recebe dinheiro se a operação já estiver paga. A recompra do token só entra em discussão depois do mês 13.

### 1.3 O ponto de equilíbrio novo

O custo de referência é de 5.500 dólares por mês: três sócios recebendo 1.500 cada um, mais até 1.000 de
infraestrutura. Com a taxa média de 3,70%, a empresa paga esse custo quando o volume chega a **208.630 dólares
por mês** (INFERÊNCIA). O número depende da mistura de perguntas, que ninguém mediu: sobe para 285.900 se a
maioria tiver favorito claro e cai para 184.672 se a maioria for equilibrada. Pela regra antiga, em que só um
quarto da taxa ia para a operação, o mesmo custo pedia 733.333. Para dar a medida: 208.630 é 1,4% do que o World
fez em setembro de 2026.

### 1.4 Os três cenários

Todos os valores são INFERÊNCIA, com a taxa média de 3,70%. O caixa parte de 7.500 negativos: 2.000 da abertura
da empresa e 5.500 de um mês de devnet. A auditoria e a avaliação jurídica entram sem custo, como o fundador
informou.

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume no mês 12 | 45.000 | 300.000 | 1.500.000 |
| Volume no mês 24 | 31.250 | 712.500 | 4.708.333 |
| Mês em que a operação se paga | Não chega | 9 | 2 |
| Ponto mais baixo do caixa | −116.565, no mês 24, e caindo | −27.474, no mês 8 | −9.705, no mês 1 |
| Caixa no mês 24 | −116.565 | 27.767 | 798.462 |

O cenário ruim não se paga em momento nenhum. O razoável equilibra no mês 9 e pede cerca de 27,5 mil dólares até
lá. O otimista equilibra no mês 2, e depende de um canal de distribuição que hoje não existe. Quase todo o buraco
de caixa é a retirada dos três sócios. Se a maioria das perguntas tiver favorito claro, o razoável só equilibra
no mês 12 e pede cerca de 35,5 mil (seção 5.4).

### 1.5 O que foi decidido e o que continua aberto

Em 5/10/2026 o fundador respondeu às sete decisões que este documento deixava em aberto. As respostas estão no
capítulo 7, cada uma com a citação.

Três pontos continuam abertos: a mistura real de perguntas, que define a taxa média; o teto da devolução da
indicação; e a confirmação da data de ida para a rede principal.

## 2. Mercado e público

### 2.1 Duas réguas para o mesmo mercado

Os números do setor parecem se contradizer de uma fonte para outra, porque há duas formas de medir. Nos líderes,
o usuário compra contratos que pagam 1 dólar se o resultado se confirmar. **Valor de face** soma cada contrato a
1 dólar, tenha custado o que for. **Dólares pagos** soma o que as pessoas de fato desembolsaram. Cem contratos
comprados a 27 centavos dão valor de face de 100 e dólares pagos de 27. Um pote mede dinheiro depositado. Por
isso este documento só usa dólares pagos, e avisa quando um número vem na outra régua.

### 2.2 O tamanho do mercado de previsão

| Medida | Valor | Data | Etiqueta e fonte |
|---|---|---|---|
| Setor inteiro, em dólares pagos | 21,7 bilhões em 30 dias | 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate |
| Setor inteiro, em valor de face | 81,8 bilhões em 30 dias | 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate |
| Kalshi, em dólares pagos | 13,7 bilhões em 30 dias | até 3/out/2026 | FATO SECUNDÁRIO, DefiLlama; a régua é inferência |
| Polymarket, em dólares pagos | 4,63 bilhões no mês | set/2026 | FATO SECUNDÁRIO, DefiLlama |
| Taxas arrecadadas pela Polymarket | Zero em 2025; 3,7 milhões em jan/2026; 93,6 milhões em set/2026 | até set/2026 | FATO SECUNDÁRIO, DefiLlama |
| Fatia da Kalshi no volume semanal | 77% | fim de set/2026 | FATO SECUNDÁRIO, Artemis, via Crypto Economy |
| Peso dos esportes no volume do setor | 62% | abr/2026 | FATO SECUNDÁRIO, Bernstein |

Quatro leituras.

- **O setor é grande e é novo.** A Polymarket saiu de 1,88 bilhão de dólares em novembro de 2025 para 4,63
  bilhões em setembro de 2026 (FATO SECUNDÁRIO, DefiLlama, set/2026).
- **Cobrar taxa também é novo.** A Polymarket não cobrou nada em 2025. O setor só começou a provar que consegue
  cobrar neste ano.
- **É concentrado.** Uma empresa tem três quartos do volume, e quase dois terços do volume são esportes. Resultado
  de jogo não se lê numa conta da Solana.
- **A projeção mais citada não entra nas nossas contas.** A Bernstein projeta cerca de 240 bilhões de dólares de
  volume em 2026 e 1 trilhão em 2030 (FATO SECUNDÁRIO, Decrypt, 14/abr/2026). É projeção de terceiro, com método
  que não foi lido. Este plano não a usa como premissa.

Três sinais de alerta. Cerca de 25% da atividade histórica da Polymarket foi negociação artificial, segundo um
estudo da Universidade Columbia (FATO SECUNDÁRIO, via Sacra, 2026). O interesse de busca por mercados de previsão
caiu 83% desde o pico da Copa de 2026 (FATO SECUNDÁRIO, The Defiant, 2026). E vários países bloquearam plataformas
do setor; o Brasil bloqueou 27 sites em abril de 2026 (FATO SECUNDÁRIO, imprensa, abr/2026). A regulação é assunto
da Parte 4.

### 2.3 O que os entrantes recentes alcançaram

O que importa para um produto novo é o que os outros novos conseguiram, e não o tamanho dos líderes.

| Quem | O que tinha a favor | O que alcançou | Etiqueta e fonte |
|---|---|---|---|
| World, dentro da Phantom | Uma carteira com mais de 20 milhões de usuários declarados | 1,14 milhão em jun/2026; 13,22 em julho; 22,20 em agosto; 15,44 em setembro | FATO SECUNDÁRIO, DefiLlama, set/2026 |
| Contratos da Kalshi em Solana, por Jupiter e DFlow | A marca da líder | 28,6 milhões em cerca de três semanas, com cerca de 21 mil carteiras; 98% do volume da DFlow veio da Phantom | FATO SECUNDÁRIO, Step Data, jan/2026 |
| Jupiter, área de previsão | Revende os contratos da Kalshi | 5,5 milhões em 30 dias | FATO SECUNDÁRIO, DefiLlama, out/2026 |
| Limitless, na rede Base | Cerca de 17 milhões captados, token próprio e pontos | 250,9 milhões em mai/2026; 10,75 milhões em set/2026 | FATO SECUNDÁRIO, DefiLlama, set/2026 |
| Opinion e Myriad | Campanhas de pontos por volume | Quedas de 80,7% e de 93,8% do primeiro para o segundo trimestre de 2026 | FATO SECUNDÁRIO, Predictefy, 2026 |
| Melee, em Solana | 3,5 milhões captados; também usa pote | 49.247 pessoas na fila de espera; sem dinheiro real até 4/out/2026 | FATO, site do Melee; o estado é FATO SECUNDÁRIO |
| PNP, em Solana | Qualquer pessoa cria pergunta em segundos | 206 transações em seis meses; nenhuma depois de 17/set/2026 | FATO, leitura da rede, 4/out/2026 |

Três leituras, todas INFERÊNCIA sobre a tabela.

1. **Quem decide o volume é a distribuição.** Em Solana, ela passa pela carteira: 98% do volume de um dos canais
   da Kalshi veio de dentro da Phantom.
2. **Mesmo a melhor vitrine rende pouco.** O World tem a Phantom inteira por trás e fez cerca de 15 milhões de
   dólares num mês. Quem lê os números da Polymarket e imagina o mesmo em Solana erra por um fator de 300.
3. **Volume comprado com incentivo vai embora.** Três plataformas perderam de 80% a 96% do volume em poucos
   meses, depois de campanhas de pontos e de token. A causa da queda da Limitless não foi encontrada.

### 2.4 O público web3 em números

**Decisão.** "queremos pessoal da web3". O recorte que a pesquisa usou é o público de Solana e, dentro dele, o do
pump.fun, a plataforma em que qualquer pessoa lança um token em minutos.

| Medida | Valor | Data | Etiqueta e fonte |
|---|---|---|---|
| Endereços ativos em Solana por semana | 27,1 milhões, sem filtro de robôs | Semana até 18/jan/2026 | FATO SECUNDÁRIO, Nansen, via BlockEden |
| pump.fun: carteiras únicas desde a criação | 80 milhões | jun/2026 | FATO SECUNDÁRIO, The Block |
| pump.fun: carteiras ativas por mês | Pico de 5,2 milhões em mai/2025; 1,8 milhão em dez/2025 | 2025 | FATO SECUNDÁRIO, fonte fraca |
| pump.fun: volume médio por dia | Cerca de 347 milhões de dólares | jun/2026 | FATO SECUNDÁRIO, The Block |
| pump.fun: receita por dia | 800 mil dólares, contra 4,8 milhões seis meses antes | jun/2026 | FATO SECUNDÁRIO, The Block |

O público é grande em número de carteiras, e a atividade caiu forte: a receita diária do pump.fun ficou em um
sexto do que era, e as carteiras ativas por mês, em um terço do pico (INFERÊNCIA sobre a tabela).

**O que não se sabe.** Carteira não é pessoa: o número inclui robôs e várias carteiras do mesmo dono. Quantas
pessoas reais usam o pump.fun por dia não foi encontrado. Quanto cada carteira aposta numa plataforma de previsão
on-chain, e com que frequência, também não. Por isso, toda premissa de aposta por carteira do capítulo 5 é
suposição.

**Quatro perfis, como hipótese.** Nenhuma entrevista foi feita. O quadro é suposição da pesquisa, a conferir no
beta (INFERÊNCIA, out/2026).

| Perfil | O que busca | O que o afasta |
|---|---|---|
| Quem negocia memecoins | Giro rápido e a sensação de ter visto antes dos outros | Cadastro, prazo longo, pergunta sem dinheiro do outro lado |
| Comunidade de um token | Prova pública de que a meta foi cumprida | Meta que parece manipulável, taxa alta |
| Formador de opinião do X | Conteúdo que se compartilha | Risco de reputação, resultado contestável |
| Equipe de projeto | Divulgar uma meta e atrair quem segura o token | Pagar sem retorno que se possa medir |

### 2.5 No que esse público aposta

- Na Polymarket, em maio de 2026, esporte era de 39% a 40% do volume, política 32% e cripto 20% (FATO SECUNDÁRIO,
  mai/2026).
- Cripto é a porta de entrada: cerca de 40% da atividade inicial dos novos usuários da Polymarket, no primeiro
  trimestre de 2026, foi em mercados de cripto (FATO SECUNDÁRIO, The Defiant).
- As plataformas on-chain menores (Azuro, Limitless, Myriad e PolyBet), somadas, tinham menos de 4% do volume
  mensal da Polymarket em maio de 2026 (FATO SECUNDÁRIO).

A leitura da pesquisa (INFERÊNCIA): o que une esse público é preço de cripto em prazo curto e eventos de grande
atenção, como esporte e eleição. Fatos de projeto de token, como queima ou trava de liquidez, não aparecem como
categoria relevante em plataforma nenhuma. Isso tem duas consequências para a lista de tipos de pergunta do
primeiro dia, decidida na Parte 1, seção 4.2. A primeira: o preço de ativo grande é o único tipo de pergunta com demanda conhecida, e é por ele que o
volume deve começar. A segunda: os fatos de token são a assinatura do produto, o que o torna diferente, mas não
se pode contar com eles como fonte principal de volume antes de ver apostas de verdade.

### 2.6 A demanda ainda não foi demonstrada, e como vamos testar

Dito sem rodeio: ninguém mostrou que o público web3 quer apostar em fatos lidos da rede. Não há mercado parecido
aberto em lugar nenhum, não há entrevista e não há um dia de uso. O plano inteiro depende dessa hipótese. Duas
decisões do fundador servem de teste, e as duas custam pouco.

**Teste 1: o beta na devnet, com pontuação.** **Decisão:** "vamos montar inteiramente na devnet inicialmente". O
beta dura cerca de um mês: "provavelmente vamos pra mainnet já no início do mês 2, sim". Mainnet é a rede
principal, a do dinheiro real. O produto abre com perguntas reais e resolução real, mas com USDC de teste, e quem
acerta ganha pontos. O Melee fez isso e juntou 49.247 pessoas numa fila, sem dinheiro real (FATO, site do Melee,
4/out/2026). O que o beta mede:

- quantas carteiras aparecem sem mídia paga;
- quantas voltam a apostar em 30 dias;
- quais tipos de pergunta recebem apostas nos dois lados;
- quantos potes terminam de um lado só, que é o sinal de pergunta sem interesse.

O limite do teste precisa ficar claro. Apostar dinheiro de teste não prova que a pessoa arriscaria dinheiro de
verdade. E um mês é pouco para medir quem volta em 30 dias: essa medida só se completa com o produto já na rede
principal. O beta mede interesse e o começo do hábito. A prova de dinheiro são os primeiros 90 dias na rede
principal, com as metas da seção 5.6.

**Teste 2: os parceiros.** Os 20 a 30 projetos convidados a entrar sem pagar (seção 4.3) testam a outra metade
da hipótese: se projetos querem perguntas sobre as próprias metas. O que se mede: quantos aceitam o convite,
quantos publicam o que combinaram, quantas carteiras cada publicação traz e quantas delas apostam. No fim, uma
pergunta direta a cada parceiro: pagaria os 500 dólares da faixa de entrada? Se nenhum pagaria, o patrocínio como
receita continua sendo hipótese.

**Proposta, aguardando decisão.** Escrever, antes de o beta abrir, o que conta como sinal bom e como sinal ruim.
As réguas propostas são as mesmas das metas de 90 dias: menos de 10% das carteiras voltando em 30 dias é sinal
ruim, e de 20% a 35% é razoável; mais de 40% dos potes terminando de um lado só é sinal ruim. O teste tem preço:
o mês de devnet custa 5.500 dólares e não gera receita.

## 3. Concorrência

### 3.1 Quem são os concorrentes

**Decisão.** Para o fundador, "qualquer empresa de mercado de predição é concorrente direto, porém cada qual com
os seus diferenciais". Por essa régua a lista é longa: a pesquisa levantou vinte nomes e escolheu cinco para
olhar de perto. Os critérios foram quatro: modelo parecido (pote ou curva, em Solana), mesmo público (web3 e
pump.fun), disputa pela atenção e existência de dados. Ficaram o Melee e o PNP, que são os mais parecidos; a
Polymarket, a maior marca no público de cripto; o World, a maior distribuição dentro de Solana; e a Limitless,
referência de taxas publicadas e de token próprio.

A Kalshi fica fora dos cinco. É a maior do setor, mas é uma bolsa regulada nos Estados Unidos, exige cadastro
completo, e 89% da taxa que arrecadou em 2025 veio de esportes (FATO SECUNDÁRIO, BJ21, 2025). Serve de referência
de escala, e não de rival pelo mesmo público.

Três termos para ler a tabela. **Livro de ordens** é uma lista de ofertas de compra e de venda: compra-se de
outra pessoa, a um preço conhecido. **Formador de mercado automático** é um programa com uma fórmula que faz o
papel da outra parte: sempre há preço, mas ele piora em compras grandes. **Curva** é uma fórmula em que o preço
sobe conforme entra dinheiro. Na coluna da taxa, `p` é o preço do contrato, entre zero e 1 dólar.

### 3.2 Os cinco, lado a lado

Fontes da tabela: documentação de cada plataforma, DefiLlama, DexScreener, CoinGecko e leitura da rede, em
setembro e outubro de 2026. Regras e fórmulas são FATO; volumes, preços de token e falhas são FATO SECUNDÁRIO; as
médias de taxa e as quedas em percentual são INFERÊNCIA.

| | Mecanismo | Quem abre as perguntas | Como resolve | Taxa | Token | Escala | Ponto fraco |
|---|---|---|---|---|---|---|---|
| Polymarket | Livro de ordens | A equipe, com sugestões do público | Oráculo UMA; se alguém contesta, os detentores de um token votam, em 4 a 6 dias | Fórmula sobre o preço; na média, 2,0% dos dólares pagos | POLY: confirmado em out/2025, não lançado até 3/out/2026 | 4,63 bilhões em set/2026 | Resolução contestada e sem reembolso; o Brasil só pode fechar posição |
| World (Solana, na Phantom) | Formadores de mercado acionados por um roteador | Só a chave da empresa | A chave da empresa grava o resultado | `0,1 × p × (1 − p)` por contrato: de 2,5% a 5% do valor pago nos exemplos, mais a margem de quem forma o preço, de 0% a 8% | Não encontrado | 15,44 em set/2026, em milhões | Uma chave decide tudo; 29,5 horas fora do ar no lançamento |
| Limitless (Base) | Livro de ordens e formador automático | A equipe e qualquer usuário | Oráculos de preço, provedores esportivos e, em parte, a equipe | De 0,40% a 3,00%; na média, 1,9% | LMTS: caiu 94% em um ano e não recebe nada das taxas | 10,75 milhões em set/2026; eram 250,9 em maio | O volume caiu 96% em quatro meses |
| Melee (Solana) | Pote com curva e piso de retorno | Meta: qualquer pessoa | Pessoas: o criador ou a equipe | Não publicada | Não anunciado | Sem dinheiro real; 49.247 na fila; 3,5 milhões captados | Ainda não lançou; regra de preço difícil de explicar; sem auditoria publicada |
| PNP (Solana) | Curva; também pote entre duas partes | Qualquer pessoa | Dois modelos de linguagem; o criador pode nomear o juiz | 1% por negociação; 30% disso para quem criou | PNP: 108.661 dólares de valor de mercado; caiu cerca de 93% em 13 meses | 206 transações em seis meses | Quase parado; o site anuncia outro produto |
| **Brot Markets** | Pote | A equipe; o patrocinador pede; o público sugere | Leitura de dado on-chain, com janela de 6 horas | 10% do lado perdedor; na média, 3,70% do volume (INFERÊNCIA) | Assunto da Parte 3 | Devnet, sem usuários | Sem público, sem canal de distribuição, demanda não demonstrada |

### 3.3 O que cada um ensina

**Polymarket: a escala e o problema da resolução.** Mais de 1.150 mercados foram a arbitragem em 2026 até maio,
mais que em 2025 inteiro, e em cerca de 1 de cada 5 disputas um votante tinha posição no mercado que julgava
(FATO SECUNDÁRIO, Wall Street Journal, via Finance Magnates, mai/2026). Um mercado de 7 milhões de dólares
resolveu SIM sem o fato ter ocorrido, e não houve reembolso (FATO SECUNDÁRIO, CoinDesk, mar/2025). É a essa queixa
que o Brot Markets responde. Mas a Polymarket tem o que nos falta: marca, dinheiro dos dois lados, qualquer
assunto e saída a qualquer hora.

**World: a experiência vence a desconfiança.** Uma chave da empresa cria os mercados e grava o resultado, sem
prova (FATO SECUNDÁRIO, Chainstack Labs, 11/set/2026). Mesmo assim o público usa, porque é fácil: está dentro da
carteira, basta assinar, e o pagamento chega sozinho. A lição é incômoda. Resultado conferível, sozinho, não traz
ninguém; precisa vir junto com a mesma facilidade. A segunda lição é de preço: a taxa do World chega a 5% do
valor pago, mais a margem de quem forma o preço. Menos garantia não significou preço menor.

**Limitless: o aviso.** Cerca de 17 milhões de dólares captados, token, pontos e criação aberta de perguntas não
seguraram o volume. Ele caiu 96% de maio a setembro de 2026, e o token caiu 94%. O que a Limitless faz bem é
publicar tudo: taxas, regras de indicação e política de reembolso para resolução errada (FATO, documentação,
out/2026).

**Melee: o mais parecido ainda não largou.** Roda em Solana, usa pote e captou 3,5 milhões de dólares, com o
cofundador da Solana entre os investidores (FATO SECUNDÁRIO, imprensa de Solana, set/2025). O beta roda na rede de
testes, com pontuação e sem dinheiro real (FATO SECUNDÁRIO, set/2026). A janela existe, mas ele tem caixa,
investidores e fila. A janela só vale alguma coisa se a demanda existir.

**PNP: o que não fazer.** Qualquer pessoa cria uma pergunta, dois modelos de linguagem decidem o resultado e o
criador pode nomear o juiz (FATO, documentação, out/2026). É o oposto do que propomos, e está quase parado. Uma
ideia dele fica guardada: dar a quem cria a pergunta uma parte da taxa.

### 3.4 Onde ficamos

Cinco conclusões, sem suavizar.

1. **O diferencial em confiança é real.** "O programa lê a conta e qualquer um confere" responde à queixa mais
   documentada do setor. Nenhum dos cinco resolve por leitura direta de uma conta on-chain (INFERÊNCIA sobre os
   fatos lidos, out/2026). Fora dos cinco, o PancakeSwap Prediction e o Hyperliquid talvez resolvam assim; a
   pesquisa não verificou.
2. **É um nicho.** Esporte, política e economia, que são a maior parte do volume do setor, não se leem numa conta
   da Solana. A fatia do volume atual que caberia na nossa regra não foi encontrada, e é pequena.
3. **Não é escudo contra manipulação.** Na Polymarket, 821 contas ganharam 8,2 milhões de dólares em mercados de
   Bitcoin de 5 minutos, em momentos de liquidação provavelmente manipulados (FATO SECUNDÁRIO, CoinDesk,
   ago/2026). Pergunta decidida por número pode ser empurrada por quem aposta. O que protege é a escolha das
   perguntas, tratada na Parte 1, seções 4.2 e 4.3.
4. **Pode ser copiado.** O World já tem a parte automática pronta. Trocar a chave por leitura on-chain, nas
   perguntas de cripto, é trabalho de engenharia, e não uma barreira. A defesa possível é chegar primeiro e ter
   comunidade.
5. **O patrocínio com contrapartida é só nosso, para o bem e para o mal.** Nenhum dos cinco vende patrocínio de
   pergunta com selo e destaque (INFERÊNCIA sobre os fatos lidos). É diferencial, e é a razão de não existir preço
   de referência para as faixas de 500, 1.500 e 5.000 dólares.

**Onde não somos diferentes.** A taxa, de 3,70% do volume na média, fica dentro da faixa do setor, que vai de
1,9% a 5% dos dólares pagos (INFERÊNCIA sobre as taxas publicadas, out/2026). A equipe abrindo as perguntas é o que fazem Polymarket e World.
Entrar só com a carteira é o que fazem PNP e Limitless. O pote é o mecanismo do Melee e do PancakeSwap
Prediction. Nada disso, sozinho, faz alguém trocar de plataforma.

**Onde ficamos atrás.** Sem saída antecipada no MVP, quem aposta aqui fica até o fim. Nos líderes, vende-se a
posição a qualquer hora. E os concorrentes têm público; nós começamos sem nenhum.

### 3.5 O que copiamos

**Decisão.** O fundador aprovou cinco coisas a copiar. Todas custam pouco.

| O que | De quem | Como fica no Brot Markets |
|---|---|---|
| Página de taxas com exemplo numérico | Limitless | Uma página pública com a conta do pote e o exemplo da Parte 1, seção 3.2, já descontada a taxa |
| Política de reembolso escrita | Limitless | Regra pública do que acontece se a resolução sair errada. A base já está decidida: pergunta anulada devolve tudo, sem taxa |
| Pagamento automático | World | O prêmio chega sozinho à carteira depois da janela de 6 horas, sem botão de resgate |
| Indicação com parte da taxa | Polymarket | Desde o MVP, paga com a taxa do próprio indicado (seção 4.4) |
| Beta com pontuação antes do dinheiro real | Melee | Cerca de um mês na devnet, com pontos por acerto, antes da rede principal (seção 6.1) |

Uma coisa não copiamos: pontuar volume. Opinion e Myriad premiaram quem movimentava mais, e o volume foi embora
quando o prêmio acabou. No beta, o ponto vai para quem acerta.

## 4. Como a empresa ganha dinheiro

### 4.1 A taxa e o destino dela

A empresa tem duas linhas de receita com número: a taxa e o patrocínio. A ordem de importância é a do setor. Nos
líderes, a taxa é a única linha com peso comprovado: é toda a receita da Polymarket medida on-chain em 2026 (FATO
SECUNDÁRIO, DefiLlama, 2026).

**A taxa.** **Decisão.** A taxa é 10% do lado perdedor. O fundador escolheu essa forma na Parte 1 ("forma da
taxa, sua recomendação") e a confirmou aqui: "vamos manter a mesma resposta da parte 1". Quem acerta recebe de
volta o que apostou, mais a sua parte em 90% do que o outro lado perdeu. Dito de outro jeito, a casa fica com 10%
do que os vencedores ganham. A conta completa está na Parte 1, seção 3.3. Os 3% do pote, que valiam antes,
saíram e aparecem aqui só como linha de comparação.

**Quanto a taxa rende depende do pote.** Num pote de 1.000 dólares dividido meio a meio, o lado perdedor tem 500
e a taxa é de 50, ou 5% do pote. Num pote de 900 contra 100, a taxa é de 10 se o favorito ganha e de 90 se o
azarão ganha; se o favorito ganhar nove vezes em dez, a média é 1,8% do pote. A taxa decidida rende mais que os 3%
antigos enquanto o favorito tem menos de 81,6% do pote, e menos daí em diante.

Para o negócio, o número que importa é a taxa média: quanto a casa arrecada, na média, de cada 100 dólares
apostados. Ela depende da mistura de perguntas, e ninguém mediu essa mistura (INFERÊNCIA; as misturas são
hipótese). Com metade das perguntas equilibrada e metade com favorito claro, a taxa média é de 3,70% do volume.
Com maioria equilibrada, sobe para 4,18%. Com maioria de favorito claro, cai para 2,70%, abaixo dos 3% que
saíram.

Todas as tabelas deste documento usam 3,70%. É a premissa mais frágil do modelo. As perguntas de preço tendem a
ter os dois lados equilibrados e puxam a média para cima. A seção 5.4 mostra o efeito de cada mistura no caixa.

**O destino.** **Decisão.** "vamos dividir 25% da taxa para treasure e todos os demais 75% para a operação ...
até equilibrarmos as contas, coisa que pode ser de 5 a 12 meses, e mudarmos as regras internas." Tesouraria é a
reserva da empresa, guardada em Bitcoin (seção 4.6). Operação é o dinheiro que paga as contas do mês.

O caminho de cada 1.000 dólares apostados, com a taxa média de 3,70% (INFERÊNCIA):

| Destino | Valor |
|---|---|
| Volta a quem acertou | 963,00 |
| Tesouraria em Bitcoin (25% da taxa) | 9,25 |
| Operação (75% da taxa) | 27,75 |
| Da parte da operação, o que paga a indicação (suposição do modelo) | 1,39 |
| Da parte da operação, o que sobra para pagar as contas | 26,36 |

Na v0.0.1 a taxa se dividia em quatro partes iguais, e a operação ficava com um quarto dela. Agora fica com três
quartos, o triplo. É essa decisão, mais que qualquer outra, que torna o plano pagável.

"Até o equilíbrio" quer dizer que a divisão é provisória. Quando a operação se pagar, três assuntos voltam à
mesa: o fundo de prêmios (seção 4.5), a tesouraria (4.6) e a recompra (4.7).

### 4.2 Patrocínio

Patrocinador é quem paga para pôr dinheiro numa pergunta e receber visibilidade em troca. O produto está na Parte
1, seção 3.7. Aqui fica a conta.

**Decisão.** Três faixas, de 500, 1.500 e 5.000 dólares. Do valor pago, "70 pro pote/pool e 30 pra
banca/plataforma".

| Faixa | Vai para o pote (70%) | Fica com a plataforma (30%) |
|---|---|---|
| 500 | 350 | 150 |
| 1.500 | 1.050 | 450 |
| 5.000 | 3.500 | 1.500 |

**Decisão.** Os 30% da plataforma vão inteiros para a operação, até o equilíbrio, sem parte para a tesouraria. O
fundador respondeu "concordo" a essa recomendação.

**O prêmio não paga taxa.** Só o lado perdedor é base de cálculo. Os 70% que entram no pote vão inteiros para
quem acertar, e a plataforma é paga pelo patrocínio com os 30% que retém.

**Quanto vale para as contas.** Os 150 dólares que ficam com a plataforma na faixa de 500 equivalem ao que a
operação recebe de taxa sobre cerca de 5.700 dólares de apostas (150 ÷ 2,636%; INFERÊNCIA). Os 1.500 da faixa de
5.000 equivalem a cerca de 57.000 dólares de apostas. Um patrocinador grande pesa bastante nas contas.

**O que não existe: precedente.** O programa mais parecido é o da Polymarket, em que qualquer pessoa deposita
dinheiro para premiar um mercado. Lá o patrocinador não recebe nada em troca, e a mediana é de 3 dólares por dia
por mercado (FATO, regras; FATO SECUNDÁRIO, valores, Vultax, set/2026). Ninguém foi encontrado vendendo
patrocínio de pergunta com selo e destaque.

**O preço das faixas.** No DexScreener, o site em que esse público acompanha preços, o anúncio de um token custa
"a partir de US$ 299" (FATO, página oficial), e a barra de tendências, "a partir de US$ 2.000" (FATO SECUNDÁRIO).
As três faixas estão dentro do que equipes de token já pagam por destaque. A diferença é que esses sites vendem
uma audiência de milhões, e o Brot Markets começa sem audiência. O que o patrocinador compra de concreto, no
começo, é o prêmio à vista dentro do pote, coisa que nenhum site de anúncio vende.

Por tudo isso, as projeções contam pouco com o patrocínio pago.

### 4.3 O programa de parceiros gratuitos

**Decisão.** O fundador vai "convidar parceiros da rede para entrar como patrocinador ... sem que eles tenham a
obrigação de pagar qualquer coisa, isso para fins de marketing ... 20 a 30 projetos". Em troca, eles "nos entregam
publicidade e postagem nas suas redes sociais". A entrada é gratuita para os 30 primeiros.

**Por que isso vale mais que a receita.** A conta é curta. Se os 30 parceiros pagassem a faixa de 500, seriam
15.000 dólares, dos quais 4.500 ficariam com a plataforma. Isso não paga um mês de custo, que é de 5.500. Ao
abrir mão dessa receita pequena, o programa consegue três coisas que esse dinheiro não compraria.

- **Público com motivo para apostar.** Cada parceiro mostra a pergunta à própria comunidade, que chega ao site já
  interessada no resultado.
- **Perguntas.** O parceiro traz a meta dele: uma queima, uma trava de liquidez. São as perguntas que só este
  produto faz.
- **Prova.** Trinta perguntas resolvidas sem erro, com nomes que o público conhece, são o material de venda das
  faixas pagas. E são o segundo teste de demanda da seção 2.6.

A consequência é assumida: no primeiro ano, o valor dos parceiros é aquisição de público, não receita. O modelo
financeiro reflete isso. No cenário ruim não entra nenhum patrocínio pago. No razoável, entra um de 500 dólares
por mês, do mês 7 ao 12, o que dá 150 por mês para a plataforma.

O que o parceiro gratuito não traz é dinheiro para o pote. Sem pagamento não há prêmio do patrocinador, e o pote
daquela pergunta depende só das apostas.

**Decisão: as regras do programa.** O parceiro entrega duas publicações por pergunta nas suas redes sociais.
Cada parceiro recebe uma pergunta gratuita sobre uma meta dele, com selo, nome, link e destaque de 72 horas na
página inicial. O fundador aprovou essa recomendação: "perfeito, sim". A gratuidade vale para uma pergunta por
projeto, para que um parceiro não ocupe várias vagas. Depois do trigésimo parceiro valem as faixas.

O restante do programa segue como foi proposto:

- As duas publicações saem na abertura e na resolução. O parceiro deixa a pergunta fixada no perfil ou no canal da
  comunidade enquanto as apostas estiverem abertas.
- Valem as regras de qualquer patrocinador: o aviso de que ele pode controlar o resultado, e a exclusão das
  perguntas que uma chave decide de graça (Parte 1, seções 3.7 e 4.3).
- Cada parceiro recebe, no fim, o relatório de volume e de carteiras da pergunta dele.

### 4.4 Indicação

Indicação é o programa em que um usuário traz outro e os dois ganham. O produto está na Parte 1, seção 3.8.

**Decisão.** Entra desde o MVP e é paga com a taxa do próprio indicado, sem verba separada. São duas regras.

- **Quem indica** recebe 20% da taxa que a casa de fato recebeu das apostas vencedoras do indicado, por 90 dias.
  O fundador aprovou: "gosto. sim, vamos."
- **O indicado** recebe uma devolução. A taxa cobrada sobre os primeiros 50 USDC que ele apostou volta para ele
  depois que completar 250 USDC apostados. O fundador aprovou: "sim, vamos fazer isso".

**Por que devolução, no lugar da isenção.** Com a isenção até 50 USDC, que era a proposta anterior, quem abrisse
uma carteira nova a cada 50 dólares nunca pagaria taxa. Na devolução, a taxa é cobrada primeiro e só volta para
quem apostou cinco vezes aquele valor.

A conta, com a taxa média de 3,70% (INFERÊNCIA). O indicado aposta 1.000 dólares em 90 dias. A taxa descontada
dos ganhos dele soma 37. Quem indicou recebe 20%, que são 7,40. A devolução ao indicado é, na média, de 1,85. A
casa fica com 27,75, ou 75% do que teria sem a indicação.

Indicação é custo para trazer gente, não receita. A casa abre mão de 25% da taxa de um apostador que talvez não
chegasse de outro jeito. No modelo, a indicação consome 5% da parte da operação. A suposição é que um quarto do
volume venha de indicados ainda dentro dos 90 dias. Se for metade do volume, o custo dobra. A devolução não está
nesses 5%.

**Detalhe a confirmar: o teto da devolução.** Como a taxa sai do ganho, uma aposta pequena num azarão que ganha
gera uma taxa alta. Exemplo: 50 USDC num lado que tem 10% do pote, se esse lado ganha, pagam 45 de taxa. Sem
teto, a devolução seria de 45. A sugestão é um teto de 5 USDC por indicado. O fundador ainda não viu esse detalhe.

Uma comparação. A Polymarket paga 10% da taxa dos indicados diretos e 5% dos indiretos, por 30 dias, e só a quem
já negociou 10.000 dólares (FATO, documentação). A regra daqui é mais generosa: o dobro do percentual e o triplo
do prazo.

O risco que sobra é a autoindicação. Sem cadastro, uma pessoa abre duas carteiras, indica a si mesma e recebe de
volta 20% da própria taxa. A trava é trabalho da Parte 4.

### 4.5 Fundo de prêmios

O fundador disse que o fundo "ainda não foi dito o que seria ... e pra que serve". Esta seção responde do zero.

**O que é.** É uma reserva de dinheiro da casa para pôr prêmio dentro dos potes. É dinheiro que a casa dá a quem
aposta, além do que os perdedores pagam.

**Para que serve.** Pote vazio não atrai ninguém. O primeiro apostador de uma pergunta não sabe se vai aparecer
alguém do outro lado. Se ninguém aparecer, ele só recebe o próprio dinheiro de volta. Um prêmio já colocado no
pote muda a conta: quem entra primeiro passa a disputar um dinheiro que já está lá. Exemplo: entram 500 dólares
no SIM e 500 no NÃO. Sem prêmio, quem acerta recebe 1,90 por dólar. Com 100 dólares de prêmio da casa, recebe
2,10, porque o prêmio não paga taxa.

O fundo teria três usos, do mais ao menos defensável (INFERÊNCIA da pesquisa):

1. **Abrir o pote:** um prêmio pequeno em perguntas novas.
2. **Garantir um pote mínimo** nas perguntas que a equipe quer em destaque.
3. **Torneio por período**, com classificação por acerto, e não por volume.

**De onde sai e quando.** **Decisão.** "vamos prometer essa feature no futuro". O fundo "poderá ser criada a
partir do mês 10, e depois de 2 meses captando recursos ele passar a ser direcionado ao seu lugar". Em linguagem
simples: até o mês 9, o fundo não existe. A partir do mês 10, se a operação já pagou as contas do mês, a sobra vai
para o fundo, até o limite de 25% da taxa. Nos meses 10 e 11 ele só junta dinheiro. Do mês 12 em diante, começa a
pôr prêmio nos potes.

Exemplo, no cenário razoável (INFERÊNCIA). No mês 12, a operação recebe 7.909 dólares de taxa e 150 de
patrocínio, e paga 5.500 de custo. Sobram 2.559. O limite de 25% da taxa seria 2.775. O fundo recebe o menor dos
dois: 2.559. No mês 18, a sobra é de cerca de 8.100 e o limite é de 4.509: o fundo recebe 4.509, e 3.592 ficam
como resultado da empresa. Em 24 meses, o fundo teria recebido 66.055. No cenário ruim ele nunca recebe nada,
porque a operação nunca se paga.

**O risco.** Cada dólar de prêmio só volta para a casa se trouxer aposta que não existiria sem ele. Para
recuperar 1 dólar em taxa, o prêmio precisa trazer 27 dólares de aposta nova (1 ÷ 3,70%; INFERÊNCIA). Ninguém
publicou se isso acontece. A Polymarket pagou 22,90 milhões de dólares em recompensas de janeiro a 7 de setembro
de 2026 (FATO SECUNDÁRIO), e o retorno desses prêmios não foi encontrado. O que se viu em plataformas menores,
depois de campanhas de incentivo, foram as quedas de 80% a 96% da seção 2.3.

**Proposta, aguardando decisão, sem pressa.** Antes do mês 10, escrever as regras de gasto. Duas já se impõem.
A primeira é sortear quais perguntas recebem prêmio, para comparar com as que não recebem. A segunda é travar a
colheita de prêmio, que é apostar nos dois lados só para levar o prêmio. Exemplo: um pote vazio recebe 100 dólares
de prêmio; alguém aposta 1 no SIM e 1 no NÃO e, qualquer que seja o resultado, recebe 101,90 dólares por 2
apostados: o dólar do lado que ganhou, 90 centavos do lado que perdeu e os 100 do prêmio.

### 4.6 Tesouraria em Bitcoin

**O que é.** É a reserva da empresa, guardada em Bitcoin e comprada com 25% de toda a taxa arrecadada.
**Decisão.** A tesouraria "começa desde o dia zero, mas depois do mês 12 a gente repensa".

**Quanto junta** (INFERÊNCIA, a preço de compra): no cenário razoável, 18.038 dólares no mês 12 e 78.394 no mês
24. No otimista, 90.188 e 467.125. No ruim, 8.048 em 24 meses, que são 25% dos 32.190 de taxa.

**O ponto que continua de pé.** A base é a taxa bruta, antes de qualquer custo. No cenário razoável, no mês 12, a
empresa teria 18.038 dólares em Bitcoin e um caixa de 26.892 negativos. Quem fez algo parecido usa lucro ou caixa
que sobra: a Tether, até 15% do lucro líquido (FATO SECUNDÁRIO); a Block, 10% do lucro bruto dos produtos de
bitcoin (FATO); a brasileira Méliuz, até 10% do caixa (FATO). E o preço oscila: a Metaplanet, empresa que guarda
Bitcoin em caixa, estava 38% abaixo do custo em 30 de junho de 2026 (FATO SECUNDÁRIO). Uma queda igual tiraria
6.854 dos 18.038.

A consequência prática: a tesouraria não pode ser a reserva que paga as contas num mês ruim. A decisão vale. A
revisão do mês 12 é a hora de olhar, com dados reais, se a base continua sendo a taxa bruta ou passa a ser a
sobra. Como guardar o Bitcoin é assunto da Parte 4.

### 4.7 Recompra, em espera

**O que é.** Recompra é a empresa usar dinheiro próprio para comprar o token dela no mercado e destruí-lo, o que
reduz a quantidade em circulação. O token em questão é o da venda privada, tema da Parte 3.

**Decisão.** "só faríamos isso com caixa da empresa a partir do mês 13, não antes". Na v0.0.1, um quarto da taxa
ia para a recompra desde o primeiro dia. Agora nada sai para isso no primeiro ano. Depois, é uma decisão a tomar
com caixa que exista. Para dar a medida: no cenário razoável, o caixa ainda está negativo no mês 13, só volta a
ficar positivo no mês 21 e chega a 27.767 dólares no mês 24. Haveria pouco com o que recomprar. Por isso a
recompra está fora das projeções, e nenhum texto do produto promete recompra, preço ou retorno.

### 4.8 Outras formas de receita e a lista da fase 2

O fundador perguntou: "essas empresas não tem outras formas de monetização, não?" Têm. O que não existe é valor
divulgado: os líderes não dizem quanto cada uma rende (FATO e FATO SECUNDÁRIO, pesquisa de monetização; a última
coluna é decisão do fundador ou INFERÊNCIA).

| Forma | O que é | Quem faz | Para o Brot Markets |
|---|---|---|---|
| Contratos perpétuos e alavancagem | Apostas sem data de fim e apostas com dinheiro emprestado | Kalshi, Polymarket | Fase 2, de olho. É outro produto |
| Taxa de construtor | Fatia paga ao site de terceiros que manda apostas | Polymarket, até 1% | Fase 2. Também é canal de distribuição |
| Indicação e afiliados | Fatia da taxa a quem traz apostadores | Polymarket, cassinos de cripto | Indicação no MVP; afiliados na fase 2. É custo, não receita |
| Taxa de depósito e saque | Cobrança para pôr e tirar dinheiro | Kalshi, até 2% no cartão; PredictIt, 5% no saque | Fase 2, de olho. Hoje não cabe: a carteira é do usuário |
| Esportes | Perguntas sobre jogos, com um oráculo específico | Os líderes | Fase 2, "para ampliar o nosso público, que inicialmente é web3" |
| Venda de dados | Licenciar as probabilidades a empresas de mídia e de finanças | Polymarket, Kalshi | Depois. Precisa de volume |
| Juros do dinheiro parado | Render o dinheiro que espera a resolução | Kalshi | Não. O rendimento do pote foi abandonado |

Duas leituras. Das formas que cabem hoje, só a taxa e o patrocínio têm número. E a maior oportunidade da lista
é também a mais distante: esportes são 62% do volume do setor (FATO SECUNDÁRIO, Bernstein, abr/2026), mas
resultado de jogo não nasce on-chain, o tema não foi pesquisado, e é a categoria que as regras brasileiras de
apostas citam pelo nome (Parte 4). Os tokens não são receita da empresa neste plano e ficam para a Parte 3.

## 5. Projeções

### 5.1 Como ler e quais são as premissas

Tudo neste capítulo é INFERÊNCIA, recalculada em 5 de outubro de 2026 com a taxa decidida. O produto não tem um
dia de uso com dinheiro real. Não existe dado medido de volume, de carteiras nem de receita. As tabelas servem
para comparar caminhos e ver o que muda quando uma premissa muda. Não são previsão, e o cenário razoável não é
promessa. O modelo não inclui impostos, mídia paga nem venda de token.

| Premissa | Valor | Origem |
|---|---|---|
| Taxa | 10% do lado perdedor. Na média, 3,70% do volume, supondo metade das perguntas equilibrada e metade com favorito claro | A forma é decisão. A média é a premissa mais frágil do modelo: vai de 2,70% a 4,18% (seção 5.4) |
| Destino da taxa | 25% para a tesouraria em Bitcoin; 75% para a operação | Decisão |
| Custo da indicação | 5% da taxa que vai para a operação | Suposição: um quarto do volume vem de indicados nos primeiros 90 dias, a 20% |
| Custo mensal | 5.500 dólares, desde o primeiro mês com dinheiro real | Decisão |
| Gasto antes do dinheiro real | 7.500 dólares: 2.000 da abertura da empresa e 5.500 de um mês de devnet. Auditoria e avaliação jurídica sem custo | Informado pelo fundador: "as duas auditorias ... vão custar zero reais. A abertura da empresa vai custar sim uns 2k dol, e a avaliação jurídica eu consigo gratuitamente" |
| Tempo na devnet | Cerca de um mês, já contado no gasto acima. O mês 1 das tabelas é o primeiro na rede principal. Cada mês a mais de devnet custa 5.500 dólares | Decisão: "provavelmente vamos pra mainnet já no início do mês 2, sim" |
| Trajetória de volume | A dos três cenários da v0.0.1, em linha reta até o mês 12 e em degraus por trimestre no segundo ano | Revisão de finanças da v0.0.1 |
| Patrocínio pago | Ruim: nenhum. Razoável: um de 500 por mês do mês 7 ao 12; no segundo ano, dois de 500 e um de 1.500 por mês. Otimista: um de 500 por mês nos meses 4 a 6; dois de 500 e um de 1.500 nos meses 7 a 12; no segundo ano, três de 500 e um de 1.500 por mês, mais um de 5.000 por trimestre. A parte da plataforma, os 30%, vai inteira para a operação | A quantidade é suposição, reduzida porque os primeiros 30 parceiros não pagam. O destino dos 30% é decisão: "concordo" |
| Fundo de prêmios | A partir do mês 10: o menor entre 25% da taxa e a sobra da operação | Decisão |
| Recompra | Fora do modelo | Decisão |

### 5.2 Ponto de equilíbrio

Ponto de equilíbrio é o volume mensal em que a parte da operação paga os 5.500 dólares de custo. A operação
recebe 75% da taxa, menos o custo da indicação.

| Mistura de perguntas | Taxa média sobre o volume | Volume de equilíbrio por mês | Sem indicação |
|---|---|---|---|
| **Meio a meio (base)** | 3,70% | **208.630** | 198.198 |
| Maioria equilibrada | 4,18% | 184.672 | 175.439 |
| Maioria com favorito claro | 2,70% | 285.900 | 271.605 |
| Para comparar: os 3% do pote, que saíram | 3,00% | 257.310 | 244.444 |

A conta da linha de base: `5.500 ÷ (3,70% × 75% × 95%) = 208.630`.

**Comparação com a regra antiga.** Com só 25% da taxa para a operação e 3% do pote, o mesmo custo pedia 733.333
dólares por mês. Hoje pede menos de um terço disso.

**O que 208.630 quer dizer.** É 1,4% dos 15,44 milhões que o World fez em setembro de 2026. Em carteiras, se cada
uma apostar 200 dólares por mês, que é a suposição do cenário razoável, são cerca de 1.040 carteiras ativas.

### 5.3 Os três cenários

Como ler as colunas. **Operação** é a parte da taxa que paga as contas, já descontada a indicação.
**Patrocínio** é a parte da plataforma, os 30%. **Resultado** é operação mais patrocínio, menos o custo e menos o
que vai ao fundo de prêmios. **Caixa** é a soma dos resultados desde antes do lançamento, partindo de −7.500, que
são a abertura da empresa e o mês de devnet. A tesouraria não entra no caixa: é uma reserva à parte. Os valores
são os do mês indicado, em dólares, com a taxa média de 3,70%.

**Cenário ruim.** O volume chega a 45 mil por mês no mês 6, fica aí e cai no segundo ano. Não há patrocínio pago.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio | Custo | Fundo de prêmios | Resultado | Caixa |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 22.500 | 833 | 208 | 593 | 0 | 5.500 | 0 | −4.907 | −22.814 |
| 6 | 45.000 | 1.665 | 416 | 1.186 | 0 | 5.500 | 0 | −4.314 | −36.348 |
| 12 | 45.000 | 1.665 | 416 | 1.186 | 0 | 5.500 | 0 | −4.314 | −62.230 |
| 18 | 38.750 | 1.434 | 358 | 1.022 | 0 | 5.500 | 0 | −4.478 | −88.804 |
| 24 | 31.250 | 1.156 | 289 | 824 | 0 | 5.500 | 0 | −4.676 | −116.565 |

Este cenário não se paga. A operação recebe no máximo 1.186 dólares por mês contra um custo de 5.500, e perde
mais de 4.300 todo mês, sem fim. O caixa chega a −116.565 no mês 24 e continua caindo. A taxa somada é de 15.818
dólares no primeiro ano e de 32.190 em 24 meses. A tesouraria teria 3.954 no mês 12 e 8.048 no mês 24. Nenhum
ajuste de regra conserta isso: só mais volume.

**Cenário razoável.** O volume chega a 300 mil por mês no mês 12 e a 712 mil no mês 24. É o retrato de um nicho
pequeno e fiel, sem distribuição paga.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio | Custo | Fundo de prêmios | Resultado | Caixa |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 75.000 | 2.775 | 694 | 1.977 | 0 | 5.500 | 0 | −3.523 | −20.046 |
| 6 | 150.000 | 5.550 | 1.388 | 3.954 | 0 | 5.500 | 0 | −1.546 | −26.660 |
| 12 | 300.000 | 11.100 | 2.775 | 7.909 | 150 | 5.500 | 2.559 | 0 | −26.892 |
| 18 | 487.500 | 18.038 | 4.509 | 12.852 | 750 | 5.500 | 4.509 | 3.592 | −11.114 |
| 24 | 712.500 | 26.363 | 6.591 | 18.783 | 750 | 5.500 | 6.591 | 7.443 | 27.767 |

A operação se paga no mês 9. O ponto mais baixo do caixa é −27.474, no mês 8. Do mês 10 ao 12 o caixa fica
parado perto de −26.900, porque a sobra vai para o fundo de prêmios; por isso o resultado do mês 12 é zero. O
caixa volta a ficar positivo no mês 21. A tesouraria soma 18.038 dólares no mês 12 e 78.394 no mês 24. O fundo de
prêmios soma 66.055 no mês 24. A taxa total é de 72.150 no primeiro ano e de 313.575 em 24 meses.

**Cenário otimista.** O volume chega a 1,5 milhão por mês no mês 12 e a 4,7 milhões no mês 24. Depende de um
canal de distribuição, como a integração com uma carteira, que hoje não existe.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio | Custo | Fundo de prêmios | Resultado | Caixa |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 375.000 | 13.875 | 3.469 | 9.886 | 0 | 5.500 | 0 | 4.386 | −4.228 |
| 6 | 750.000 | 27.750 | 6.938 | 19.772 | 150 | 5.500 | 0 | 14.422 | 29.152 |
| 12 | 1.500.000 | 55.500 | 13.875 | 39.544 | 750 | 5.500 | 13.875 | 20.919 | 150.328 |
| 18 | 2.958.333 | 109.458 | 27.365 | 77.989 | 1.400 | 5.500 | 27.365 | 46.524 | 384.555 |
| 24 | 4.708.333 | 174.208 | 43.552 | 124.123 | 1.400 | 5.500 | 43.552 | 76.471 | 798.462 |

A operação se paga no mês 2. O ponto mais baixo do caixa é −9.705, no mês 1, e o caixa fica positivo a partir do
mês 4. A tesouraria soma 90.188 dólares no mês 12 e 467.125 no mês 24. O fundo de prêmios soma 415.094 até o mês
24. A taxa total é de 360.750 no primeiro ano e de 1.868.500 em 24 meses. Um aviso sobre esta tabela: o custo
fica em 5.500 nos 24 meses, o que não é realista com esse volume. É a conta sem contratar ninguém.

### 5.4 Se a mistura de perguntas for outra

A taxa média de 3,70% é a premissa mais frágil do modelo, porque ninguém mediu a mistura de perguntas. A tabela
refaz o cenário razoável, com a mesma trajetória de volume, para as outras duas misturas. A última linha mostra,
só para comparar, os 3% do pote, que saíram (INFERÊNCIA).

| Taxa média | Mês em que a operação se paga | Ponto mais baixo do caixa | Caixa no mês 24 | Taxa em 24 meses |
|---|---|---|---|---|
| 2,70% (maioria com favorito claro) | 12 | −35.508, no mês 11 | −10.826 | 228.825 |
| **3,70% (base)** | 9 | −27.474, no mês 8 | 27.767 | 313.575 |
| 4,18% (maioria equilibrada) | 8 | −25.002, no mês 7 | 46.550 | 354.255 |
| Para comparar: 3% do pote | 11 | −32.509, no mês 12 | 1.025 | 254.250 |

Com maioria de favorito claro, o plano piora bastante: a operação só se paga no mês 12, o ponto mais baixo do
caixa desce a −35.508, e o caixa ainda está negativo no mês 24. É um resultado pior que o dos 3% do pote. Com
maioria equilibrada, melhora um pouco: o equilíbrio vem um mês antes. Entre a pior e a melhor mistura, o caixa do
mês 24 muda em 57.376 dólares, com o mesmo volume apostado.

### 5.5 Capital necessário e a captação buscada

Capital necessário é o dinheiro que precisa vir de fora da receita para a empresa atravessar o ponto mais baixo
do caixa.

| Cenário | Ponto mais baixo do caixa | Quando |
|---|---|---|
| Ruim | −116.565 | mês 24, e continua caindo |
| Razoável | −27.474 | mês 8 |
| Otimista | −9.705 | mês 1 |

Esses valores usam a taxa média de 3,70% e já incluem a abertura da empresa e um mês de devnet.

Três coisas a somar ou a pesar.

- **Mais tempo na devnet.** A ida para a rede principal no início do mês 2 é "provavelmente". Cada mês a mais de
  devnet soma 5.500 dólares a todas as linhas da tabela.
- **A mistura de perguntas.** Com maioria de favorito claro, o ponto mais baixo do razoável desce para −35.508.
- **A retirada dos sócios.** Quase todo o buraco de caixa é o pró-labore, que é a retirada mensal dos três
  sócios: 4.500 dos 5.500 por mês. Se os sócios adiarem a retirada, o cenário razoável precisa de muito pouco
  dinheiro de fora.

**Decisão.** O fundador busca investimento "de USD50k nos primeiros 6 meses a USD 350k até o final do primeiro
ano", com uma ressalva: "temos que trabalhar no bootstrap, sem depender de conseguirmos qualquer coisa".
Bootstrap é tocar a empresa com o dinheiro dos próprios sócios e da própria receita. Essa captação cobre com
folga os cenários razoável e otimista. O ruim não se paga com capital nenhum: mais dinheiro só adia o fim.

### 5.6 Metas de 90 dias

São as metas para os primeiros 90 dias com dinheiro real. Servem para saber cedo em qual cenário a empresa está.

| Medida | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume apostado, somado | Até 45 mil | 150 mil | 750 mil ou mais |
| Volume no terceiro mês | 22.500 | 75.000 | 375.000 |
| Carteiras ativas no terceiro mês | 150 | 375 | 1.500 |
| Carteiras que apostam de novo em 30 dias | Menos de 10% | 20% a 35% | Mais de 35% |
| Potes que terminam de um lado só | Mais de 40% | Cerca de 20% | Menos de 10% |
| Taxa arrecadada, a 3,70% do volume | 1.665 | 5.550 | 27.750 |

**Como usar a tabela.** A linha que mais importa é a das carteiras que apostam de novo. Volume alto com menos de
10% das carteiras voltando é o retrato que veio antes das quedas de 80% a 96% dos concorrentes. Volume modesto
com 30% voltando é um negócio pequeno e de verdade. Para dar a medida do volume: o World fez 1,14 milhão de
dólares no primeiro mês, dentro da Phantom (FATO SECUNDÁRIO, DefiLlama, set/2026).

**Decisão: o critério de parada.** O fundador aceitou o critério como estava proposto: "ok". Se, aos 180 dias na
rede principal, o volume do mês for de até 45 mil dólares e menos de 10% das carteiras estiverem voltando, o
cenário é o ruim, e a empresa para ou muda de rumo. Parar no mês 6 limita a perda a 36.348 dólares. Seguir até o
mês 24 leva a 116.565. O critério fica escrito antes do lançamento, quando ainda é fácil ser frio.

### 5.7 O que o modelo não sabe

- **Quanto cada carteira aposta por mês.** Não há dado em plataforma nenhuma. Se for a metade do suposto, o
  volume cai pela metade.
- **Quantos apostadores voltam.** É o número que separa os cenários.
- **Quantos parceiros viram patrocinadores pagantes.** Não há precedente pago.
- **Quanto do volume vem por indicação.** O custo de 5% é suposição.
- **Se a auditoria e a avaliação jurídica saem mesmo a custo zero.** É informação do fundador, ainda sem
  contrato registrado neste plano.
- **A mistura real de perguntas.** Ela define a taxa média, que pode ir de 2,70% a 4,18%.
- **Se o produto sai mesmo da devnet em um mês.** Cada mês a mais custa 5.500 dólares.
- **Como o apostador reage à taxa de 10% do lado perdedor.** Ninguém mediu num pote.

Um aviso final. A trajetória em linha reta é uma simplificação. Os concorrentes mostram picos seguidos de quedas
de 80% a 96%, e o modelo não reproduz isso.

## 6. Entrada no mercado

### 6.1 As três fases

1. **Devnet, com pontuação.** Durante cerca de um mês, o MVP inteiro roda na rede de testes: perguntas reais,
   resolução real, USDC de teste e pontos para quem acerta. Toda tela diz que é fase de testes. O objetivo é
   testar a demanda (seção 2.6) e formar um público antes do dinheiro real. O mês custa 5.500 dólares e não gera
   receita.
2. **Parceiros.** Ainda na devnet, entram os primeiros dos 20 a 30 projetos convidados. Cada um traz uma pergunta
   sobre a própria meta e a mostra à comunidade dele. É nessa fase que se aprende quais perguntas recebem apostas
   dos dois lados.
3. **Rede principal.** Dinheiro real. **Decisão:** "provavelmente vamos pra mainnet já no início do mês 2, sim".
   A ida vem depois dos três critérios da Parte 4: auditoria externa, carteira que só assina com a aprovação de
   várias pessoas e um teto global temporário para o total apostado. O primeiro mês na rede principal é o mês 1
   das projeções. As faixas pagas de patrocínio começam quando a gratuidade dos parceiros acabar (seção 4.3).

Vale nas três fases a recomendação da Parte 1, seção 3.5: perguntas de três dias ou mais. As mais curtas só
entram quando houver fluxo de apostadores.

### 6.2 Canais, sem mídia paga

**Decisão.** O gasto com mídia paga fica perto de zero. A conta explica por quê. Um apostador que põe 200 dólares
por mês durante seis meses aposta 1.200 e deixa cerca de 32 dólares para a operação (1.200 × 3,70% × 75% × 95%;
INFERÊNCIA sobre uma suposição). Trazer um usuário, em cripto, já custou de 77 a 2.500 dólares (FATO SECUNDÁRIO,
casos de 2021 a 2023). Comprar apostador custa várias vezes o que ele devolve. Sobram os canais gratuitos e os
que outra pessoa paga.

| Canal | Como funciona | O que custa |
|---|---|---|
| Parceiros | Cada projeto mostra a própria pergunta à comunidade dele | A receita de patrocínio de que a casa abre mão |
| Conteúdo no X | Cada pergunta resolvida vira uma publicação com o número lido, a meta e o link. O Baked dá rosto à conta | Tempo da equipe |
| Sugestões pelo X | O público sugere perguntas, e o site mostra uma lista escolhida pela equipe | Embutir a linha do tempo é gratuito; ler menções por programa custa 0,005 dólar por publicação lida (FATO, documentação do X, 3/out/2026) |
| Beta com pontuação | Pontos por acerto e classificação pública, antes do dinheiro real | O mês de devnet: 5.500 dólares |
| Indicação | Quem traz um apostador recebe parte da taxa dele | Cerca de 25% da taxa do indicado (seção 4.4), e só quando ele ganha |
| Token A | Leva o nome ao público do pump.fun | Assunto da Parte 3 |

Três observações.

- **O canal mais nosso é o parceiro.** Um projeto que tem uma pergunta sobre a própria queima divulga essa
  pergunta porque tem interesse em que ela seja vista. Nas palavras do fundador: "sendo em oráculo on chain, e
  possibilitando você abrir a questão de algo sobre si mesmo, você acaba criando uma forma de marketing".
- **A resolução é o conteúdo.** "O resultado foi lido na rede; confira você mesmo" é uma publicação que os
  concorrentes não conseguem fazer igual.
- **Falta o canal grande.** Em Solana, a distribuição passa pelas carteiras (seção 2.3). Integração com uma
  carteira não se pede no primeiro dia: conquista-se com meses de resolução sem erro. O cenário otimista depende
  dela, e hoje ela não existe.

### 6.3 O papel do token A

**Decisão.** O token A, lançado no pump.fun, é "canal de tração", sem vínculo com a empresa. Quem negocia tokens
ali é o público que o produto procura, e o token é um jeito de esse público ouvir o nome Brot Markets e visitar o
site. Ele não representa a empresa, não dá direito à receita e não entra em nenhuma conta deste documento. Nenhum
texto do produto promete preço ou retorno. O que se mede dele é uma coisa só: quantas carteiras chegam por esse
caminho e quantas apostam. As regras dos dois tokens estão na Parte 3.

### 6.4 Captação de investimento e a lista de investidores

Captação é conseguir dinheiro de investidores em troca de uma parte do negócio. A meta está na seção 5.5, e o
plano não depende dela.

Existe uma planilha com cerca de 50 mil investidores mapeados, para convite por email e funil de captação. Funil
é o caminho do primeiro contato até a conversa de investimento. Essa lista é canal de captação de investimento, e
não de usuários.

**Decisão.** O fundador trata a lista como lista de contatos de negócio: "não tem problema, pois são e-mails de
negócios, e não dados pessoais". O convite por email segue. Uma ressalva: endereço de email com nome de pessoa
pode ser lido como dado pessoal pela LGPD, a lei brasileira de proteção de dados, mesmo sendo de trabalho. Por
isso o convite leva opção de descadastro, e a lista não é publicada nem compartilhada.

**Proposta, aguardando decisão.** Levar ao investidor o que o beta medir, e não as projeções: carteiras, quantas
voltam, perguntas resolvidas sem erro e parceiros ativos. Nenhum material de captação promete retorno.

### 6.5 O que medir

A medida principal de entrada no mercado não é volume. É retenção: a parcela das carteiras que aposta de novo em
30 dias. É o número que separa um público de verdade de um público que veio buscar pontos, e é o que decide
entre os cenários do capítulo 5.

| O que medir | Para que serve | Sinal ruim |
|---|---|---|
| Carteiras que apostam de novo em 30 dias | Saber se há hábito | Menos de 10% |
| Potes que terminam de um lado só | Saber se as perguntas interessam aos dois lados | Mais de 40% |
| Carteiras e volume que cada parceiro trouxe | Vender as faixas pagas e escolher os próximos parceiros | Parceiro que publica e não traz ninguém |
| De qual canal veio cada carteira | Saber onde pôr o tempo da equipe | Um canal só respondendo por quase tudo |
| Perguntas resolvidas sem erro e no prazo | Sustentar a promessa central do produto | Qualquer erro |

Quase tudo isso sai do registro público do programa, sem coletar dado pessoal. A última linha não é meta de
crescimento, e sim condição: um resultado errado pesa mais que um mês de volume bom.

## 7. O que foi decidido, o que continua aberto e as objeções

### 7.1 Decidido em 5/10/2026 e o que continua aberto

O fundador respondeu às sete decisões que este documento deixava em aberto. A seção entre parênteses traz a
explicação completa.

| Assunto | Resposta do fundador | O que passa a valer |
|---|---|---|
| Forma da taxa (4.1) | "vamos manter a mesma resposta da parte 1" | 10% do lado perdedor, base de todas as tabelas |
| Os 30% do patrocínio (4.2) | "concordo" | Inteiros para a operação, até o equilíbrio |
| Programa de parceiros (4.3) | "perfeito, sim" | Uma pergunta gratuita por parceiro, com destaque de 72 horas |
| Benefício do indicado (4.4) | "sim, vamos fazer isso" | Devolução da taxa dos primeiros 50 USDC, depois de 250 USDC apostados |
| Tempo na devnet (6.1) | "provavelmente vamos pra mainnet já no início do mês 2, sim" | Cerca de um mês. O gasto antes do dinheiro real passa a 7.500 dólares |
| Critério de parada (5.6) | "ok" | Aceito como estava proposto |
| Lista de investidores (6.4) | "não tem problema, pois são e-mails de negócios, e não dados pessoais" | Lista de contatos de negócio. O convite por email segue, com opção de descadastro |

**O que continua aberto.** Três pontos.

1. **A mistura real de perguntas.** Ela define a taxa média, a premissa mais frágil do modelo. Só o uso mostra
   qual é (seção 5.4).
2. **O teto da devolução da indicação.** A sugestão é de 5 USDC por indicado, e o fundador ainda não a viu
   (seção 4.4).
3. **A data de ida para a rede principal.** O início do mês 2 é "provavelmente" (seção 6.1).

Três propostas menores seguem no texto e podem esperar: as réguas do beta (seção 2.6), as regras de gasto do
fundo de prêmios, que precisam estar escritas antes do mês 10 (seção 4.5), e o material de captação (seção 6.4).

### 7.2 As objeções da v0.0.1 que tocam o negócio

A v0.0.1 registrou 29 objeções. Oito tocam a Parte 2.

| Objeção | Assunto | Situação | O que foi decidido |
|---|---|---|---|
| OBJ-01 | Ninguém demonstrou que o público web3 quer apostar em fatos on-chain | Mantida | O mês de beta na devnet e os parceiros são o teste (seção 2.6). As réguas do beta continuam como proposta |
| OBJ-07 | A taxa fixa castiga quem aposta no favorito | Respondida, com custo | A taxa passou a 10% do lado perdedor: quem acerta sempre recebe mais do que apostou. Em troca, a receita depende da mistura de perguntas (seção 5.4) |
| OBJ-09 | A divisão da taxa em quatro deixava pouco para pagar a operação | Resolvida | 25% para a tesouraria e 75% para a operação, até o equilíbrio |
| OBJ-10 | A tesouraria em Bitcoin sai da taxa bruta, antes de qualquer custo | Mantida | Começa no dia zero; "depois do mês 12 a gente repensa" |
| OBJ-11 | A recompra é pequena perto dos desbloqueios do token | Adiada | Só com caixa da empresa, a partir do mês 13. O resto é da Parte 3 |
| OBJ-15 | As faixas têm preço de vitrine, sem vitrine e sem precedente pago | Mantida, com risco menor | Faixas mantidas. Os 30 primeiros parceiros entram de graça, e o modelo quase não conta com patrocínio pago |
| OBJ-16 | O fundo de prêmios só se paga se causar boa parte do volume | Adiada | Só a partir do mês 10, e só com a operação paga. As regras de gasto ficam para antes disso |
| OBJ-29 | O hackathon estava sendo deixado de lado | Resolvida | "estamos codando pro colosseum" |
