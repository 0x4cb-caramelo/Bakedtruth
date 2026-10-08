# Brot Markets — Business Plan v0.0.4 — Parte 2: Mercado e negócio

**Data:** 8 de outubro de 2026.
**Estado:** rascunho para revisão do fundador. Derivada da v0.0.3 com as decisões do fundador de 8 de outubro de 2026.
Onde elas e a v0.0.3 discordam, valem as decisões; onde se calam, vale a v0.0.3. Substitui a Parte 2 da v0.0.3, que
fica como versão anterior.

**Como ler.** **Decisão** é o que o fundador decidiu em 4 ou 5/10/2026. **Decisão do pitch** é regra do deck de
7/10/2026, citada em inglês como está na tela. **Decisão, de 8/10/2026** é resposta do fundador desta rodada, com as
palavras dele como ele escreveu, em português e em inglês. **Proposta, aguardando decisão** é sugestão ainda não
aprovada. Números de fora trazem FATO (lido na fonte) ou FATO SECUNDÁRIO (lido em quem citou a fonte), com a data.
Toda projeção é INFERÊNCIA: conta nossa sobre premissas declaradas, e não previsão.

**A moeda.** A plataforma é toda em SOL, a moeda da rede Solana. O modelo conta em dólares, porque os custos são em
dólares. Os valores em SOL usam o **preço de referência de US$ 109,27 por SOL** (FATO, API pública da CoinGecko,
8/10/2026, 15:29 UTC). A seção 5.4 mostra o que acontece quando esse preço anda.

**Termos.** **Campanha**, ou campanha on-chain, é uma pergunta de SIM ou NÃO, com um pote, que a rede responde.
**Criador** é quem a abre. **Baker** é quem entra nela, no SIM ou no NÃO, e **entrada** é o valor que ele põe.
**Volume** é a soma das entradas num período, contada em dólares. **Taxa média** é quanto o Brot arrecada de cada 100
dólares de volume. **Ponto de equilíbrio** é o volume mensal em que a empresa paga as próprias contas. **Caixa** é o
dinheiro da operação, somado desde antes do lançamento. **Mês 1** é o primeiro mês com dinheiro real.

**O que mudou desde a v0.0.3.**

1. Tudo em SOL: entradas, pote, prêmio, taxas e pagamentos. O USDC sai.
2. As palavras mudam: campanha, criador, baker, SIM e NÃO, pote, entrada. Os concorrentes são "o setor".
3. Abrir uma campanha custa US$ 500 em SOL: US$ 450 viram prêmio no pote e US$ 50 ficam com o Brot. A taxa de 0,02
   SOL sai. Abrir e patrocinar passam a seguir a mesma regra.
4. A taxa de abertura deixa de ser "barreira, e não negócio" e vira receita: 110 aberturas pagas por mês pagam o custo.
5. O 1% do criador sai do pote, e da taxa do Brot só num caso raro. O "desenho C" da v0.0.3 sai das contas.
6. O equilíbrio sem aberturas continua em 208.630 dólares por mês (1.909 SOL) e cai com aberturas pagas. A
   sensibilidade nova é o preço do SOL: custo em dólar, receita em SOL.
7. Os cenários de caixa são os da v0.0.3, sem recálculo. O patrocínio deles passa a ser abertura paga.
8. Os parceiros abrem de graça: cada um custa 50 dólares de receita. O motor dos criadores fica mais fraco.
9. Sem lista de contas e sem teto: a rede principal passa a ter dois critérios, e não três.

## 1. Resumo

### 1.1 O setor, nos três números do pitch

- **21,7 bilhões de dólares** em 30 dias é o volume do setor inteiro, de 4/set a 3/out/2026, em dinheiro de fato pago
  (FATO SECUNDÁRIO, DefiRate, out/2026). É o "TAM" do slide. As fontes chamam o setor de "prediction markets".
- **Cerca de 0,9 bilhão por mês** é a nossa estimativa do volume do setor em temas de cripto (INFERÊNCIA). É o "SAM".
- **15,4 milhões de dólares** foi o volume de setembro de 2026 do World, a plataforma do setor dentro da carteira
  Phantom (FATO SECUNDÁRIO, DefiLlama). É o "SOM" do slide: o volume inteiro de um concorrente, e não a nossa fatia.

Um quarto número, que o pitch não mostra: **zero** perguntas sobre queima, trava de liquidez ou outro fato de token de
terceiros, em qualquer plataforma do setor (FATO, ausência em busca limitada, out/2026). O nosso tipo de campanha não
tem demanda demonstrada.

### 1.2 Como a empresa ganha dinheiro

Quatro receitas (seção 4.1), todas recebidas em SOL.

- **A taxa do pote.** 10% do lado perdedor. Na média, 3,70% do volume (INFERÊNCIA; de 2,70% a 4,18%, conforme a mistura
  de campanhas). Dela, 25% vão para a tesouraria e 75% para a operação, que paga as contas.
- **A taxa de abertura.** **Decisão, de 8/10/2026.** Abrir custa US$ 500, pagos em SOL (4,5758 SOL ao preço de
  referência). US$ 450 viram prêmio no pote e US$ 50 ficam com o Brot. Por mês, rende `N × 50` dólares, e ninguém sabe
  `N`, o número de aberturas pagas. Os parceiros de lançamento abrem de graça.
- **O patrocínio acima dos US$ 500.** O que passa do mínimo segue a mesma regra: 90% prêmio, 10% Brot.
- **O 1% do pote de um lado só**, pequeno e fora do modelo.

Na v0.0.3, o 1% de quem abre não tinha origem decidida; se saísse da taxa do Brot, custaria até 27% dela. **Decisão,
de 8/10/2026:** sai do pote. Da taxa só sai quando, sem isso, quem acertou receberia menos do que pôs, em potes tão
desiguais que a taxa já é quase zero. O custo para o Brot é desprezível (seção 4.4).

### 1.3 O ponto de equilíbrio

O custo de referência é de 5.500 dólares por mês (50,33 SOL): três sócios a 1.500, mais até 1.000 de infraestrutura.
Sem abertura paga e com a taxa média de 3,70%, a empresa paga esse custo com **208.630 dólares por mês** de volume, ou
1.909 SOL (INFERÊNCIA). É 1,4% do que o World fez em setembro de 2026.

Cada abertura paga baixa esse número, porque os US$ 50 dela vão inteiros para a operação. Com 30 por mês, o equilíbrio
cai para 151.731 dólares; com 110, as aberturas pagam o custo sozinhas (seção 5.2). O número sobe se a maioria das
campanhas tiver favorito claro (285.900) ou se o SOL cair entre a entrada da taxa e o pagamento das contas (298.043,
com queda de 30%; seção 5.4).

### 1.4 Os três cenários

São os números da v0.0.3, em dólares, sem recálculo: o modelo mês a mês não está disponível. Neles, o patrocínio passa a
ser abertura paga, nas mesmas quantidades. O caixa parte de −7.500. Tudo é INFERÊNCIA.

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume no mês 12 | 45.000 | 300.000 | 1.500.000 |
| Volume no mês 24 | 31.250 | 712.500 | 4.708.333 |
| Mês em que a operação se paga | Não chega | 9 | 2 |
| Ponto mais baixo do caixa | −116.565, no mês 24, e caindo | −27.674 | −9.705, no mês 1 |
| Caixa no mês 24 | −116.565 | 21.467 | 783.963 |

O ruim não se paga nunca. O razoável pede cerca de 27,7 mil dólares até o mês 9. O otimista depende de um canal de
distribuição que não existe. Os cenários contam poucas aberturas pagas: até três por mês no razoável e, no otimista,
até quatro por mês e uma de 5.000 por trimestre (as quantidades da v0.0.2); mais aberturas, seção 5.2.

### 1.5 O que continua aberto

Esperam decisão a regra da tesouraria em SOL e as contrapartidas acima de 500 dólares (seção 7). Continuam sem medida a
mistura real de campanhas, o número de aberturas pagas e o preço do SOL no dia de pagar as contas.

## 2. O setor e o público

### 2.1 TAM, SAM e SOM

**TAM** é o total: tudo o que se gasta na categoria. **SAM** é a parte que o produto consegue atender. **SOM** é a parte
que ele pode de fato conquistar. Os três números do slide estão corretos; o que pede cuidado são os rótulos.

| Sigla no slide | Número | O que mede de fato | Etiqueta | O que não é |
|---|---|---|---|---|
| TAM, "All prediction markets" | 21,7 bilhões em 30 dias | O volume do setor inteiro, em dólares pagos, de 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate | Não é receita. E 62% do volume do setor eram esportes, que a rede não lê |
| SAM, "Crypto markets" | Cerca de 0,9 bilhão por mês | O volume do setor em temas de cripto: `20% × 4,63 bilhões = 0,926`. A fatia é a da Polymarket em maio de 2026; o volume, o dela em setembro | INFERÊNCIA | Vale para uma plataforma, e não para o setor. Os dois números são de meses diferentes |
| SOM, "Inside Solana" | 15,4 milhões no mês | O volume inteiro do World em setembro de 2026 | FATO SECUNDÁRIO, DefiLlama | Não é a nossa fatia. O rótulo "SOM" é nosso |

O número que a empresa precisa alcançar é mais modesto: 208.630 dólares por mês, 1,4% do World em setembro.

**"13× in three months."** A conta confere: `15,44 ÷ 1,14 = 13,5`, de junho a setembro. A tela omite agosto, de 22,20
milhões; setembro caiu 30% em relação a ele. O World cresceu muito e já recuou.

As três frases da fala sobre cripto, pump.fun e Polymarket, ditas com a precisão da fonte, não mudaram e estão na
v0.0.3, P2 §2.1.

### 2.2 O tamanho do setor e as duas réguas

Nos líderes, o usuário compra contratos que pagam 1 dólar se o resultado se confirmar. **Valor de face** soma cada
contrato a 1 dólar; **dólares pagos**, o que as pessoas desembolsaram. Um pote mede dinheiro depositado, e por isso só
usamos dólares pagos.

| Medida | Valor | Data | Etiqueta e fonte |
|---|---|---|---|
| Setor inteiro, em dólares pagos | 21,7 bilhões em 30 dias | 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate |
| Setor inteiro, em valor de face | 81,8 bilhões em 30 dias | 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate |
| Kalshi, em dólares pagos | 13,7 bilhões em 30 dias | até 3/out/2026 | FATO SECUNDÁRIO, DefiLlama; a régua é inferência |
| Polymarket, em dólares pagos | 4,63 bilhões no mês | set/2026 | FATO SECUNDÁRIO, DefiLlama |
| Fatia da Kalshi no volume semanal | 77% | fim de set/2026 | FATO SECUNDÁRIO, Artemis, via Crypto Economy |
| Peso dos esportes no volume do setor | 62% | abr/2026 | FATO SECUNDÁRIO, Bernstein |

O setor é grande, novo e concentrado. Três alertas que o plano mantém: cerca de 25% da atividade histórica da
Polymarket foi negociação artificial, segundo um estudo da Universidade Columbia (FATO SECUNDÁRIO, via Sacra, 2026); o
interesse de busca pelo setor caiu 83% desde o pico da Copa de 2026 (FATO SECUNDÁRIO, The Defiant, 2026); e o Brasil
bloqueou 27 sites do setor em abril de 2026 (FATO SECUNDÁRIO, imprensa).

### 2.3 O que os entrantes recentes alcançaram

| Quem | O que tinha a favor | O que alcançou | Etiqueta e fonte |
|---|---|---|---|
| World, dentro da Phantom | Uma carteira com mais de 20 milhões de usuários declarados | Em milhões: 1,14 em jun/2026; 13,22 em julho; 22,20 em agosto; 15,44 em setembro | FATO SECUNDÁRIO, DefiLlama, set/2026 |
| Contratos da Kalshi em Solana, por Jupiter e DFlow | A marca da líder | 28,6 milhões em cerca de três semanas, com cerca de 21 mil carteiras; 98% do volume da DFlow veio da Phantom | FATO SECUNDÁRIO, Step Data, jan/2026 |
| Limitless, na rede Base | Cerca de 17 milhões captados, token próprio, pontos e criação aberta | 250,9 milhões em mai/2026; 10,75 milhões em set/2026 | FATO SECUNDÁRIO, DefiLlama, set/2026 |
| Opinion e Myriad | Programas de pontos por volume | Quedas de 80,7% e de 93,8% do primeiro para o segundo trimestre de 2026 | FATO SECUNDÁRIO, Predictefy, 2026 |
| Melee, em Solana | 3,5 milhões captados; também usa pote | 49.247 pessoas na fila de espera; sem dinheiro real até 4/out/2026 | FATO, site do Melee; o estado é FATO SECUNDÁRIO |
| PNP, em Solana | Qualquer pessoa cria uma pergunta em segundos | 206 transações em seis meses; nenhuma depois de 17/set/2026 | FATO, leitura da rede, 4/out/2026 |

Três leituras (INFERÊNCIA). **Quem decide o volume é a distribuição**: em Solana, ela passa pela carteira. **Volume
comprado com incentivo vai embora**: três plataformas perderam de 80% a 96% do volume depois de programas de pontos e
de token. **Criação aberta, sozinha, não trouxe volume**: Limitless e PNP deixam qualquer pessoa criar perguntas e
estão entre as que mais caíram ou menos andaram.

### 2.4 Os três públicos em números

Os três públicos estão na Parte 1: o projeto que patrocina, os bakers e os criadores. O recorte da pesquisa é o
público de Solana e, dentro dele, o do pump.fun.

| Medida | Valor | Data | Etiqueta e fonte |
|---|---|---|---|
| Endereços ativos em Solana por semana | 27,1 milhões, sem filtro de robôs | Semana até 18/jan/2026 | FATO SECUNDÁRIO, Nansen, via BlockEden |
| pump.fun: carteiras únicas desde a criação | 80 milhões | jun/2026 | FATO SECUNDÁRIO, The Block |
| pump.fun: carteiras ativas por mês | Pico de 5,2 milhões em mai/2025; 1,8 milhão em dez/2025 | 2025 | FATO SECUNDÁRIO, fonte fraca |
| pump.fun: volume médio por dia | Cerca de 347 milhões de dólares | jun/2026 | FATO SECUNDÁRIO, The Block |
| pump.fun: receita por dia | 800 mil dólares, contra 4,8 milhões seis meses antes | jun/2026 | FATO SECUNDÁRIO, The Block |

O público é grande em carteiras, e a atividade caiu forte (INFERÊNCIA sobre a tabela). Quantas pessoas reais há por
trás das carteiras, e quanto cada uma põe numa plataforma do setor, não foi encontrado.

**Cinco perfis, como hipótese.** Nenhuma entrevista foi feita (INFERÊNCIA, a conferir no beta).

| Perfil | O que busca | O que o afasta |
|---|---|---|
| Equipe de projeto | Divulgar uma meta e atrair quem segura o token | Pagar sem retorno que se possa medir |
| Comunidade de um token | Prova pública de que a meta foi cumprida | Meta que parece manipulável, taxa alta |
| Quem negocia memecoins | Giro rápido e a sensação de ter visto antes | Cadastro, prazo longo, campanha sem dinheiro do outro lado |
| Formador de opinião do X | Conteúdo que se compartilha | Risco de reputação, resultado contestável |
| Criador | O 1% do pote e a autoria de uma campanha que circula | Os US$ 500 para abrir, que o 1% só devolve com mais de 50 mil dólares em entradas; lista curta de tipos |

**O quinto perfil mudou (INFERÊNCIA).** Com 0,02 SOL, o pitch imaginava uma pessoa caçando a pergunta que divide
opiniões. Com US$ 500, abrir para ganhar o 1% dá prejuízo em quase toda campanha (seção 4.4). Quem abre de fato tende
a ser o projeto, sobre a própria meta: compra divulgação e põe US$ 450 de prêmio para a própria comunidade. O
primeiro e o quinto perfis tendem a virar um só.

**O que une esse público** (INFERÊNCIA da pesquisa): preço de cripto em prazo curto. Fatos de token, como queima, não
aparecem como categoria relevante em plataforma nenhuma, e o volume deve começar pelo preço de ativo grande. **Decisão,
de 8/10/2026:** "Our team can open markets too." É a equipe quem tende a abrir essas campanhas no começo.

### 2.5 A demanda não foi demonstrada: três testes

Ninguém mostrou que o público web3 quer entrar em campanhas sobre fatos lidos da rede, nem que projetos pagam para abrir
uma, nem que terceiros abrem campanhas boas. O plano depende dessas três hipóteses. Cada uma tem um teste barato.

**Teste 1: o beta na devnet, com pontuação.** **Decisão.** "vamos montar inteiramente na devnet inicialmente". Campanhas
e resolução reais, com SOL de teste; quem acerta ganha pontos. O Melee fez isso e juntou 49.247 pessoas numa fila
(FATO, site do Melee, 4/out/2026). O beta mede quantas carteiras aparecem sem mídia paga, quantas voltam em 30 dias,
quais tipos recebem entradas nos dois lados e quantos potes terminam de um lado só. Dinheiro de teste não prova que a
pessoa arriscaria dinheiro de verdade.

**Teste 2: os parceiros.** Os 20 a 30 projetos convidados abrem de graça. Mede-se quantos aceitam, quantos publicam o
combinado, quantas carteiras cada publicação traz e quantas entram. No fim, uma pergunta a cada um: pagaria os 500
dólares para abrir a próxima? Se nenhum pagaria, a taxa de abertura como receita continua sendo hipótese.

**Teste 3: as campanhas pagas abertas por quem não é da equipe.** Mede-se quantas são abertas por mês, quantas recebem
entradas nos dois lados, quantas terminam de um lado só ou vazias, e quanto do volume vem delas. A primeira medida é o
`N` da seção 5.2. Na devnet, pagar 500 dólares em SOL de teste não custa nada; o teste só vale de verdade na rede
principal (INFERÊNCIA).

**Proposta, aguardando decisão.** Escrever as réguas antes do beta. Para os dois primeiros testes, as da v0.0.2: menos
de 10% das carteiras voltando em 30 dias é sinal ruim, de 20% a 35% é razoável; mais de 40% dos potes de um lado só é
sinal ruim. O terceiro teste não tem régua de referência; ela precisa ser escolhida antes do lançamento.

## 3. Concorrência

### 3.1 Os cinco concorrentes, lado a lado

**Decisão.** Para o fundador, "qualquer empresa de mercado de predição é concorrente direto, porém cada qual com os
seus diferenciais". De vinte nomes, a pesquisa olhou cinco de perto. A Kalshi fica fora: é uma bolsa regulada nos
Estados Unidos, com cadastro completo.

**Livro de ordens** é uma lista de ofertas de compra e de venda. **Formador automático** é um programa com uma fórmula
que faz o papel da outra parte. **Curva** é uma fórmula em que o preço sobe conforme entra dinheiro. Regras são FATO;
volumes e falhas, FATO SECUNDÁRIO; médias de taxa e quedas, INFERÊNCIA (documentação, DefiLlama e leitura da rede, set e
out/2026).

| | Mecanismo | Quem cria as perguntas | Como resolve | Taxa | Escala | Ponto fraco |
|---|---|---|---|---|---|---|
| Polymarket | Livro de ordens | A equipe, com sugestões do público | Oráculo UMA; se alguém contesta, detentores de um token votam, em 4 a 6 dias | Fórmula sobre o preço; na média, 2,0% dos dólares pagos | 4,63 bilhões em set/2026 | Resolução contestada e sem reembolso |
| World (Solana, na Phantom) | Profissionais que dão preço, acionados por um roteador | Só a chave da empresa | A chave da empresa grava o resultado | De 2,5% a 5% do valor pago nos exemplos, mais a margem de quem dá o preço | 15,44 milhões em set/2026 | Uma chave decide tudo; 29,5 horas fora do ar no lançamento |
| Limitless (Base) | Livro de ordens e formador automático | A equipe e qualquer usuário | Oráculos de preço, provedores esportivos e, em parte, a equipe | De 0,40% a 3,00%; na média, 1,9% | 10,75 milhões em set/2026; eram 250,9 em maio | O volume caiu 96% em quatro meses |
| Melee (Solana) | Pote com curva e piso de retorno | Meta: qualquer pessoa | Pessoas: o criador ou a equipe | Não publicada | Sem dinheiro real; 49.247 na fila | Ainda não lançou; regra de preço difícil de explicar |
| PNP (Solana) | Curva; também pote entre duas partes | Qualquer pessoa | Dois modelos de linguagem; o criador pode nomear o juiz | 1% por negociação; 30% disso para quem criou | 206 transações em seis meses | Quase parado |
| **Brot Markets** | Pote em SOL | Qualquer carteira, por US$ 500 em SOL (450 viram prêmio), só nos tipos que o programa lê; equipe e parceiros de graça | Leitura de uma conta da rede, com janela de 6 horas | 10% do lado perdedor; na média, 3,70% do volume (INFERÊNCIA). Mais 1% para o criador, tirado do pote | Devnet, sem usuários | Sem público, sem canal de distribuição, demanda não demonstrada |

### 3.2 O que cada um ensina

**Polymarket: a escala e o problema da resolução.** Em cerca de 1 de cada 5 disputas de 2026 até maio, um votante
tinha posição na pergunta que julgava (FATO SECUNDÁRIO, Wall Street Journal, via Finance Magnates, mai/2026). Uma
pergunta com 7 milhões de dólares resolveu SIM sem o fato ter ocorrido (FATO SECUNDÁRIO, CoinDesk, mar/2025). Mas ela
tem o que nos falta: marca, dinheiro dos dois lados, qualquer assunto e saída a qualquer hora.

**World: a experiência vence a desconfiança.** Uma chave da empresa grava o resultado, sem prova (FATO SECUNDÁRIO,
Chainstack Labs, 11/set/2026), e o público usa mesmo assim, porque está dentro da carteira. Resultado conferível,
sozinho, não traz ninguém.

**Limitless: o aviso sobre criação aberta e incentivos.** Captação, token, pontos e criação aberta não seguraram o
volume, que caiu 96% de maio a setembro de 2026. A causa não foi encontrada. O que ela faz bem é publicar taxas, regras
de indicação e política de reembolso (FATO, documentação, out/2026).

**Melee: o mais parecido ainda não largou.** Roda em Solana, usa pote, captou 3,5 milhões de dólares (FATO SECUNDÁRIO,
imprensa de Solana, set/2025) e tem beta com pontuação na rede de testes. A janela só vale se a demanda existir.

**PNP: o aviso mais direto.** Qualquer pessoa cria uma pergunta, e quem cria recebe 30% da taxa. É o desenho mais
próximo do slide de criadores, e está quase parado. O que nos separa dele: lá dois modelos de linguagem decidem, e aqui
o programa lê uma conta; aqui abrir custa US$ 500 e põe US$ 450 de prêmio no pote.

A conclusão, sem suavizar: **criação aberta não é motor de crescimento provado.** O plano a trata como hipótese (seção
2.5), e não como fonte de volume nas contas.

### 3.3 Onde ficamos e o que copiamos

1. **O diferencial em confiança é real.** "O programa lê a conta e qualquer um confere" responde à queixa mais
   documentada do setor. Nenhum dos cinco resolve por leitura direta de uma conta da rede (INFERÊNCIA, out/2026).
2. **É um nicho.** Esporte, política e economia, a maior parte do volume do setor, não se leem numa conta da Solana.
3. **Não é escudo contra manipulação.** Na Polymarket, 821 contas ganharam 8,2 milhões de dólares em perguntas de
   Bitcoin de 5 minutos, em momentos provavelmente manipulados (FATO SECUNDÁRIO, CoinDesk, ago/2026). **Decisão, de
   8/10/2026:** sem lista de contas aprovadas ("8 nao tem lista de contas aprovadas, nao lidaremos com tokenomics") e
   sem teto por campanha. Sobram a taxa de abertura e o aviso automático, e a taxa defende menos do que parece: quem
   abre sobre um token sem valor, entra sozinho no lado que vai forçar e queima os próprios tokens recebe de volta os
   US$ 450 de prêmio. O custo líquido cai para US$ 50, e a manobra compensa com mais de cerca de US$ 56 do outro lado
   (INFERÊNCIA: `0,90 × outro lado > 50`). Outros bakers do lado dele não mudam isso: a entrada dele no lado que força
   não corre risco, e ele pode entrar grande e ficar com quase todo o prêmio. Ver Parte 4.
4. **Pode ser copiado.** O World já tem a parte automática. Trocar a chave por leitura da rede é trabalho de
   engenharia. A defesa possível é chegar primeiro e ter comunidade.
5. **O patrocínio é só nosso.** Nenhum dos cinco vende patrocínio com selo, em busca limitada (INFERÊNCIA). É
   diferencial, e é a razão de não existir preço de referência.

**Onde não somos diferentes.** A taxa fica na faixa do setor, de 1,9% a 5% dos dólares pagos (INFERÊNCIA), antes do 1%
do criador. A criação aberta é a de PNP e Limitless; o pote, o do Melee. **Onde ficamos atrás:** sem saída antecipada,
e sem público.

**Decisão: o que copiamos.** As cinco primeiras linhas são da v0.0.2; a sexta veio com o pitch, e a barreira de US$
500, em 8/10/2026.

| O que | De quem | Como fica no Brot |
|---|---|---|
| Página de taxas com exemplo numérico | Limitless | A conta do pote, já descontadas a taxa e a parte do criador |
| Política de reembolso escrita | Limitless | Campanha anulada devolve tudo, sem taxa |
| Pagamento automático | World | O prêmio chega sozinho à carteira, em SOL |
| Indicação com parte da taxa | Polymarket | 20% da taxa por 90 dias (seção 4.5) |
| Beta com pontuação antes do dinheiro real | Melee | Na devnet, com pontos por acerto |
| Criação aberta, com uma parte para quem cria | PNP, Limitless | Qualquer carteira abre por US$ 500 em SOL, dos quais 450 viram prêmio, e fica com 1% do pote |

Não copiamos pontuar volume: Opinion e Myriad o fizeram, e o volume foi embora quando o prêmio acabou.

## 4. Como a empresa ganha dinheiro

### 4.1 As quatro receitas

**Decisão, de 8/10/2026.** "we use only SOL in the entire platform". Toda receita chega em SOL; as contas estão em
dólares. O slide diz "We only earn from the losing side", e isso vale só para a primeira linha, a única com peso
comprovado no setor: a taxa é toda a receita da Polymarket medida na rede em 2026 (FATO SECUNDÁRIO, DefiLlama).

| Receita | Regra | Marca | Tem número no modelo? |
|---|---|---|---|
| Taxa do pote | 10% do lado perdedor | Decisão, confirmada pelo pitch | Sim: 3,70% do volume, na média |
| Taxa de abertura | US$ 50 de cada abertura paga de US$ 500; os outros 450 viram prêmio | Decisão, de 8/10/2026 | Por campanha, sim: 50 dólares, ou 0,4576 SOL. Por mês, falta `N` (seção 4.4) |
| Patrocínio acima dos US$ 500 | 10% do que passa do mínimo; 90% viram prêmio | Decisão do pitch, mantida | Só nas quantidades herdadas da v0.0.3 |
| 1% do pote de um lado só | Pago por todos, menos pela primeira carteira | Decisão | Não: fora do modelo desde a v0.0.2 |

O 1% do criador não está na tabela porque não sai do Brot: sai do pote (seção 4.4).

### 4.2 A taxa e o destino dela

Num pote de 1.000 dólares meio a meio, a taxa é de 50, ou 5% do pote. Num de 900 contra 100, é de 10 se o favorito
ganha e de 90 se perde; se ele ganhar nove vezes em dez, a média é 1,8% do pote. O número que importa é a taxa média, e
ela depende da mistura de campanhas, que ninguém mediu. Três misturas, com 1 milhão de dólares de volume no mês
(INFERÊNCIA; as misturas são hipótese):

| Mistura | Taxa média | Taxa no mês |
|---|---|---|
| Maioria equilibrada (70% dos potes entre 50% e 60%; 30% entre 80% e 90%) | 4,18% | 41.800 |
| Meio a meio (base) | 3,70% | 37.000 |
| Maioria com favorito claro (30% equilibrados; 70% entre 85% e 95%) | 2,70% | 26.950 |

Todas as tabelas usam 3,70%, a premissa mais frágil do modelo. Se os criadores procurarem "a pergunta polêmica", como
diz a fala, a média sobe; se vierem campanhas de resultado óbvio, cai.

**O destino. Decisão.** "vamos dividir 25% da taxa para treasure e todos os demais 75% para a operação ... até
equilibrarmos as contas". O caminho de cada 1.000 dólares de volume (INFERÊNCIA):

| Destino | Valor |
|---|---|
| Volta a quem acertou | 963,00 |
| Tesouraria (25% da taxa) | 9,25 |
| Operação (75% da taxa) | 27,75 |
| Da operação, o que paga a indicação (suposição do modelo) | 1,39 |
| Da operação, o que sobra para pagar as contas | 26,36 |

Em campanha com a parte do criador, a primeira linha perde 10 dólares, que vão para ele: 953. As outras não mudam,
salvo no caso raro abaixo.

**A pilha sobre a taxa.** Saem da mesma taxa a tesouraria (25%), a indicação (20% da taxa do indicado), o desconto do
token, se um dia existir (Parte 3), e, só no caso raro, um pedaço do 1% do criador: o pote em que mais de 98,89% está no
lado que ganhou, sem prêmio. Nesses potes a taxa já é quase zero. A v0.0.2 fixou a ordem das três primeiras (Parte 4);
onde entra o pedaço do 1% se escreve com a leitura exata da regra (seção 4.4).

### 4.3 Patrocínio: agora é a própria abertura

**Decisão, de 8/10/2026.** "for open a market, we will charge $500,00 (in SOL)"; "dos 500 dolares 90% vira pot e 10%
vai para o brot". Abrir uma campanha é patrociná-la com o mínimo. A regra do pitch, "From $500. 90% becomes the prize
pool. 10% is a marketing fee.", passa a valer para toda abertura paga. O prêmio entra no pote sem lado.

A última coluna divide a parte do Brot por 2,63625%, o que a operação recebe de cada dólar de volume (`3,70% × 75% ×
95%`): é o volume que renderia o mesmo.

| Valor pago | Em SOL | Vira prêmio (90%) | Brot (10%) | Volume que rende o mesmo |
|---|---|---|---|---|
| 500, o mínimo para abrir | 4,5758 | 450 | 50 | 1.897 |
| 1.500 | 13,7275 | 1.350 | 150 | 5.690 |
| 5.000 | 45,7582 | 4.500 | 500 | 18.966 |

Só o valor de 500 é regra; os outros são tamanhos supostos.

- **Abrir e patrocinar viraram a mesma coisa.** Cada abertura paga vale para a operação o mesmo que 1.897 dólares de
  volume, e de cada 500 o projeto vê 450 virarem prêmio para a comunidade dele.
- **Os 10% vão inteiros para a operação** até o equilíbrio: **Decisão** de 5/10/2026 ("concordo"), agora também para
  os US$ 50 de cada abertura.
- **O pedido de pergunta sai. Decisão, de 8/10/2026.** "keep it, and ok for removal". O projeto abre e põe o prêmio de
  uma vez.

**O que continua em aberto.** As contrapartidas acima de 500 (decisão 3 da v0.0.3; proposta mantida: 500 como piso,
sem faixas; selo, nome e link em todos). Se alguém pode pôr prêmio numa campanha aberta por outra carteira, a v0.0.3
também não dizia. E os US$ 450 no pote de um lado só e na anulação. **Proposta, aguardando decisão:** a regra já
decidida em 5/10/2026 para o prêmio do patrocinador. O prêmio volta inteiro a quem abriu; os US$ 50 ficam com o Brot no
pote de um lado só e na anulação por causa de fora, e voltam na anulação por falha da casa.

**Sem precedente.** Na Polymarket, quem premia uma pergunta não recebe contrapartida, e a mediana é de 3 dólares por dia
(FATO, regras; FATO SECUNDÁRIO, valores, Vultax, set/2026). No DexScreener, o anúncio de um token custa "a partir de
US$ 299" (FATO, página oficial). O piso de 500 está dentro do que equipes de token pagam por destaque, mas o Brot começa
sem audiência: o que o criador compra de concreto é o prêmio à vista no pote.

### 4.4 Quem abre: a taxa de abertura e o 1%

**A taxa de abertura, pelo lado do caixa.** `receita do mês = N × 50 dólares`, em que `N` é o número de campanhas pagas
abertas no mês. Em SOL, 0,4576 por abertura ao preço de referência; o número exato muda com o preço, porque a cobrança
é fixa em dólar. `N` não está medido.

A v0.0.3 a chamava de "barreira, e não negócio": com 0,02 SOL, seriam precisas de 917 a 2.750 aberturas por mês,
conforme o preço do SOL, para pagar o custo. Agora, **110 aberturas pagas por mês pagam os 5.500 dólares sozinhas**
(`5.500 ÷ 50`; INFERÊNCIA). Abaixo disso, cada uma baixa o equilíbrio (seção 5.2). E a barreira ficou mais alta: abrir
100 campanhas sem sentido custa 50 mil dólares.

- **Parceiros de lançamento:** de graça (seção 4.5).
- **A equipe. Decisão, de 8/10/2026:** também abre. **Proposta, aguardando decisão:** não paga os US$ 500, porque
  pagaria a si mesma, e não fica com o 1%; a campanha sai sem prêmio, salvo se a equipe puser um. Não conta em `N`.
- **A fonte do preço. Decisão, de 8/10/2026 (D-f), a partir da pesquisa pedida pelo fundador:** o programa lê o preço SOL/USD da Pyth na
  hora de abrir e cobra `500 ÷ preço` em SOL. A CoinGecko fica para o site e os relatórios: o programa não consegue
  lê-la, e usá-la exigiria um servidor nosso gravando o preço com uma chave (Parte 4).

O aluguel das contas de cada campanha, o depósito que a Solana exige para mantê-las abertas, não foi medido.

**O 1% do criador. Decisão, de 8/10/2026.** "1% do criador sai do pot, mas quando a disputa for muito acirrada, e no
caso do 1% do creator fizer com que o usuario que ganhou receba menos do que colocou, entao somente nesse caso, 1% do
creator sai da taxa do brot."

Uma correção de fato: o caso não acontece quando a disputa é apertada. Acontece no oposto, quando mais de 98,89% do
pote está no lado vencedor, sem prêmio. Num pote meio a meio, o lado perdedor é 50 vezes o 1%. Com os US$ 450 de
prêmio, o caso quase some: só aparece em potes de mais de cerca de 45 mil dólares e muito desiguais (INFERÊNCIA: `450 ÷
1%`).

**A taxa média continua 3,70% (INFERÊNCIA).** Nos potes do caso raro a taxa já é quase zero, e o custo médio para o
Brot é desprezível. O equilíbrio não muda por causa do 1%.

**A leitura exata espera decisão.** Ao pé da letra, quando o caso dispara, todo o 1% passa para a taxa, até o tamanho
dela. **Proposta, aguardando decisão:** tirar do pote o que dá sem deixar ninguém abaixo do que pôs, e só a diferença
da taxa. Exemplos em dólares (INFERÊNCIA, conferidos por script em 8/10/2026):

| Pote | Taxa do Brot | Criador recebe | Brot fica com | Cada 1 do lado vencedor recebe |
|---|---|---|---|---|
| Slide: 600 contra 400, sem prêmio | 40 | 10, do pote | 40 | 1,583 |
| 98.900 contra 1.100, sem prêmio, ao pé da letra | 110 | 110, da taxa | 0 | 1,010 |
| 98.900 contra 1.100, sem prêmio, leitura proposta | 110 | 1.000: 990 do pote e 10 da taxa | 100 | 1,000 |
| 98.900 contra 1.100, com prêmio de 450 | 110 | 1.000, do pote | 110 | 1,004 |

Ao pé da letra há um salto: perto do limite, o criador cai de cerca de 1.000 para cerca de 110, e o Brot perde a taxa
inteira. A
leitura proposta paga o 1% inteiro, custa menos ao Brot e não tem salto.

**O que o criador ganha.** O 1% só devolve os US$ 500 quando as entradas passam de 50 mil dólares, cerca de 458 SOL
(INFERÊNCIA: `500 ÷ 1%`). A proposta é que ele incida só sobre as entradas, e não sobre o prêmio, nem no pote de um
lado só, nem na campanha anulada. Quem abre só pelo 1% perde dinheiro em quase toda campanha. O PNP, o único precedente
no nosso material, dá a quem cria 30% de uma taxa de 1% por negociação.

### 4.5 Parceiros e indicação

**Os parceiros. Decisão, de 8/10/2026.** Os 20 a 30 parceiros de lançamento continuam abrindo de graça ("4 sim"), em
troca de duas publicações para a própria comunidade (Parte 1). Nenhum está fechado.

Cada parceiro é uma abertura que não paga: 50 dólares de que o Brot abre mão. Com 30, são 1.500 (`30 × 50`), o mesmo
valor da v0.0.3, agora como taxa de abertura. É menos que um mês de custo. A campanha do parceiro também sai sem os US$
450 de prêmio. No primeiro ano, parceiros são aquisição de público e prova, e não receita.

**A indicação. Decisão**, confirmada pelo pitch: quem indica recebe 20% da taxa do indicado por 90 dias; o indicado
recebe de volta a taxa dos primeiros 50 dólares de entradas, depois de completar 250, com teto. Tudo passa a ser pago
em SOL. O teto era de 5 USDC. **Proposta, aguardando decisão:** 0,05 SOL, cerca de 5,46 dólares. Os limites de 50 e 250
dólares ainda não têm valor em SOL decidido; ao preço de referência, seriam 0,4576 e 2,2879 SOL (INFERÊNCIA).

A conta, a 3,70% (INFERÊNCIA): o indicado entra com o equivalente a 1.000 dólares em 90 dias, e a taxa dos ganhos dele
soma 37. Quem indicou recebe 7,40; a devolução é, na média, de 1,85; o Brot fica com 27,75. No modelo, a indicação
consome 5% da parte da operação, supondo que um quarto do volume venha de indicados nos 90 dias; se for metade, dobra.
A regra é mais generosa que a da Polymarket (10% por 30 dias; FATO, documentação). Indicar a si mesmo custa, no pior
caso, 0,74% do volume, e o fundador aceitou o risco.

### 4.6 Em espera: fundo de prêmios, tesouraria, recompra e fase 2

O pitch não fala de nenhum dos quatro. As decisões de 5/10/2026 continuam valendo, salvo a moeda da tesouraria. Os
valores são os da v0.0.3, em dólares; os detalhes, na v0.0.2, P2 §4.5 a §4.8.

**Fundo de prêmios.** Reserva do Brot para pôr prêmio nos potes. **Decisão.** "vamos prometer essa feature no futuro":
a partir do mês 10, só com a sobra da operação, até 25% da taxa. No razoável, soma 65.755 dólares até o mês 24
(INFERÊNCIA, v0.0.3). Para recuperar 1 dólar de taxa, o prêmio precisa trazer 27 de volume novo (`1 ÷ 3,70%`), e
ninguém publicou se isso acontece.

**Tesouraria.** A reserva da empresa, com 25% de toda a taxa. **Decisão.** Ela "começa desde o dia zero, mas depois do
mês 12 a gente repensa". No razoável, soma 18.038 dólares no mês 12 e 78.394 no mês 24 (INFERÊNCIA, v0.0.3). A base é a
taxa bruta, e no mês 12 a empresa teria essa reserva com o caixa negativo: ela não paga as contas num mês ruim.

**A moeda da tesouraria agora conflita.** A decisão de 5/10/2026 era guardar os 25% em USDC e, depois, comprar Bitcoin;
a proposta 19 da v0.0.3 era converter o SOL das taxas em USDC. As duas batem de frente com "tudo em SOL", e a empresa
continua pagando custos em dólar. **Proposta, aguardando decisão:** a plataforma recebe e paga em SOL; a empresa
converte, uma vez por mês e fora da plataforma, o necessário para os custos; a regra da tesouraria fica para o
fundador. O efeito do preço está na seção 5.4.

**Recompra.** **Decisão.** "só faríamos isso com caixa da empresa a partir do mês 13, não antes". Fora das projeções. A
resposta pronta do pitch: "a gente não promete preço nem recompra".

**Fase 2.** Esportes são 62% do volume do setor (FATO SECUNDÁRIO, Bernstein, abr/2026), mas jogo não se lê na rede.

## 5. Projeções

### 5.1 Premissas

Tudo neste capítulo é INFERÊNCIA. Não há um dia de uso com dinheiro real. As tabelas servem para comparar caminhos, e
não são previsão. O modelo não inclui impostos, mídia paga nem venda de token.

**Os cenários de caixa não foram recalculados.** O modelo mês a mês da revisão da v0.0.3 não está no repositório. As
seções 5.3 a 5.5 trazem os números dela, em dólares. Esta versão acrescenta o equilíbrio com aberturas pagas (5.2) e o
efeito do preço do SOL (5.4), que são contas diretas.

| Premissa | Valor | Origem |
|---|---|---|
| Moeda | Tudo em SOL; o modelo conta em dólares | Decisão, de 8/10/2026 |
| Preço de referência do SOL | US$ 109,27 | FATO, CoinGecko, 8/10/2026; o uso é decisão de 8/10/2026 |
| Volume | Em dólares; quem entra pensa a entrada em dólares | Suposição |
| Taxa do pote | 10% do lado perdedor; na média, 3,70% do volume | A forma é decisão; a média, a premissa mais frágil |
| Destino da taxa | 25% tesouraria; 75% operação | Decisão; a moeda da tesouraria está em aberto |
| Parte do criador | 1% do pote, tirado do pote; da taxa só no caso raro, fora do modelo por desprezível | Decisão, de 8/10/2026 |
| Abertura paga | US$ 500 em SOL: 450 de prêmio, 50 inteiros para a operação | Decisão, de 8/10/2026; o destino, de 5/10/2026 |
| Aberturas pagas por mês (`N`) | Sem valor medido. Os cenários herdam o patrocínio da v0.0.3: nenhuma no ruim; no razoável, uma de 500 por mês dos meses 7 a 12 e, no segundo ano, duas de 500 e uma de 1.500 por mês | Suposição herdada |
| Custo da indicação | 5% da parte da operação | Suposição: um quarto do volume vem de indicados nos 90 dias |
| Custo mensal | 5.500 dólares (50,33 SOL) | Decisão |
| Gasto antes do dinheiro real | 7.500 dólares; auditoria e avaliação jurídica sem custo | Informado pelo fundador |
| Trajetória de volume | A dos três cenários da v0.0.2 | Suposição herdada |

### 5.2 Ponto de equilíbrio

A operação recebe 2,63625% de cada dólar de volume (`3,70% × 75% × 95%`), e os US$ 50 de cada abertura paga. Com `N`
aberturas pagas no mês, o volume de equilíbrio é `(5.500 − 50 × N) ÷ 0,0263625` (INFERÊNCIA, conferida por script em
8/10/2026; em SOL, ao preço de referência).

| Caso | Taxa média | `N` | Receita de abertura | Volume de equilíbrio por mês | Em SOL |
|---|---|---|---|---|---|
| **Mistura meio a meio (base)** | 3,70% | 0 | 0 | **208.630** | 1.909 |
| Base | 3,70% | 10 | 500 | 189.663 | 1.736 |
| Base | 3,70% | 20 | 1.000 | 170.697 | 1.562 |
| Base | 3,70% | 30 | 1.500 | 151.731 | 1.389 |
| Base | 3,70% | 50 | 2.500 | 113.798 | 1.041 |
| Base | 3,70% | 110 | 5.500 | 0: só as aberturas pagam o custo | 0 |
| Maioria equilibrada | 4,18% | 0 | 0 | 184.672 | 1.690 |
| Maioria com favorito claro | 2,70% | 0 | 0 | 285.900 | 2.616 |

**As duas linhas do desenho C saem.** A v0.0.3 trazia 241.228 e 285.900 dólares para o 1% tirado da taxa do Brot. Ele
agora sai do pote, e essas linhas perdem o objeto.

Três leituras. **`N` é o número que mais mexe no equilíbrio, depois do volume**: trinta aberturas por mês o baixam em
27%. **Os parceiros não entram nessa conta**: são trinta, mas abrem uma vez e de graça. **Ninguém sabe `N`**: "um
projeto paga 500 dólares para abrir uma campanha?" é a pergunta do teste 2, ainda sem resposta.

**O que 208.630 quer dizer.** É 1,4% do World em setembro de 2026. Se cada carteira puser o equivalente a 200 dólares
por mês (1,83 SOL), a suposição do razoável, são cerca de 1.040 carteiras ativas.

### 5.3 Os três cenários

São os números da v0.0.3, em dólares, sem recálculo. **Operação** é a parte da taxa que paga as contas, já descontada
a indicação. **Aberturas pagas** é a parte do Brot nelas; na v0.0.3 a coluna se chamava patrocínio. **Caixa** parte de
−7.500, sem a tesouraria. Os totais vêm no texto, porque a v0.0.3 não publicou o caixa mês a mês.

**Cenário ruim.** O volume chega a 45 mil por mês no mês 6, fica aí e cai no segundo ano. Nenhuma abertura paga.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Custo | Resultado | Caixa |
|---|---|---|---|---|---|---|---|
| 6 | 45.000 | 1.665 | 416 | 1.186 | 5.500 | −4.314 | −36.348 |
| 12 | 45.000 | 1.665 | 416 | 1.186 | 5.500 | −4.314 | −62.230 |
| 18 | 38.750 | 1.434 | 358 | 1.022 | 5.500 | −4.478 | −88.804 |
| 24 | 31.250 | 1.156 | 289 | 824 | 5.500 | −4.676 | −116.565 |

Não se paga. Para fechar só com aberturas o buraco do mês 6, seriam precisas 87 aberturas pagas por mês (`4.314 ÷ 50`;
INFERÊNCIA), num cenário em que quase ninguém aparece.

**Cenário razoável.** O volume chega a 300 mil por mês no mês 12 e a 712 mil no mês 24: um nicho pequeno e fiel, sem
distribuição paga.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Aberturas pagas, parte do Brot | Custo |
|---|---|---|---|---|---|---|
| 6 | 150.000 | 5.550 | 1.388 | 3.954 | 0 | 5.500 |
| 12 | 300.000 | 11.100 | 2.775 | 7.909 | 50 | 5.500 |
| 18 | 487.500 | 18.038 | 4.509 | 12.852 | 250 | 5.500 |
| 24 | 712.500 | 26.363 | 6.591 | 18.783 | 250 | 5.500 |

Totais da v0.0.3: a operação se paga no **mês 9**; o ponto mais baixo do caixa é **−27.674**; o caixa no mês 24 é de
**21.467**. A parte do Brot nas aberturas soma 3.300 em 24 meses. Com mais aberturas, a operação se pagaria antes: com
30 por mês, o equilíbrio cai para 151.731, perto dos 150.000 que o razoável alcança no mês 6 (INFERÊNCIA sobre as duas
tabelas). O mês exato e o caixa não foram recalculados, porque a partir do mês 10 parte da sobra da operação vai para
o fundo de prêmios, e a soma não é direta.

**Cenário otimista.** O volume chega a 1,5 milhão por mês no mês 12 e a 4,7 milhões no mês 24. Depende de um canal de
distribuição, como a integração com uma carteira, que não existe.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Aberturas pagas, parte do Brot | Custo |
|---|---|---|---|---|---|---|
| 6 | 750.000 | 27.750 | 6.938 | 19.772 | 50 | 5.500 |
| 12 | 1.500.000 | 55.500 | 13.875 | 39.544 | 250 | 5.500 |
| 18 | 2.958.333 | 109.458 | 27.365 | 77.989 | 467 | 5.500 |
| 24 | 4.708.333 | 174.208 | 43.552 | 124.123 | 467 | 5.500 |

Totais da v0.0.3: caixa de **783.963** no mês 24; a parte do Brot nas aberturas soma 7.250 em 24 meses, até o
equivalente a cerca de 9 aberturas de 500 por mês (`467 ÷ 50`); a operação se paga no mês 2, e o ponto mais baixo é
−9.705, no mês 1. O custo fica em 5.500 nos 24 meses, o que não é realista com esse volume.

### 5.4 Se uma premissa mudar

Duas premissas pesam mais que as outras: a mistura de campanhas e o preço do SOL. A fração do volume em campanhas de
terceiros, que a v0.0.3 chamava de `s`, deixou de mexer na taxa, porque o 1% não sai mais da taxa do Brot.

**A mistura**, no cenário razoável, com a mesma trajetória de volume (INFERÊNCIA, v0.0.3):

| Caso | Taxa média | Mês em que a operação se paga | Ponto mais baixo do caixa | Caixa no mês 24 |
|---|---|---|---|---|
| **Mistura de base** | 3,70% | 9 | −27.674 | 21.467 |
| Maioria equilibrada | 4,18% | 8 | −25.102 | 40.150 |
| Maioria com favorito claro | 2,70% | 12 | −36.008 | −15.826 |

As linhas do desenho C saem desta tabela pelo mesmo motivo da seção 5.2.

**O preço do SOL.** É a sensibilidade nova. Os custos são em dólar: salários e infraestrutura. A receita chega em SOL: a
taxa do pote e os US$ 50 de cada abertura. Entre receber a taxa e pagar as contas, o preço anda. Se o SOL cair 30% nesse
intervalo, a mesma receita em SOL paga 30% menos de custo: o SOL que valia 5.500 dólares passa a valer 3.850. Para
pagar o mês, o volume precisaria ter sido de 298.043 dólares, contados no dia da entrada (`208.630 ÷ 0,70`). Se o SOL
subir 30%, bastam 160.485 (`208.630 ÷ 1,30`).

A tabela supõe que o custo em dólar não muda e que o volume em dólar é o que conta (INFERÊNCIA, conferida por script).

| Preço do SOL no dia de pagar | Custo do mês em SOL | Volume de equilíbrio em SOL | O mesmo volume, em dólares de 109,27 |
|---|---|---|---|
| 109,27 (referência) | 50,33 | 1.909 | 208.630 |
| 76,49 (−30%) | 71,91 | 2.728 | 298.043 |
| 142,05 (+30%) | 38,72 | 1.469 | 160.485 |

Fórmulas: `custo em SOL = 5.500 ÷ preço`; `volume em SOL = 208.630 ÷ preço`. Os preços estão arredondados; a conta usa
109,27 × 0,70 e 109,27 × 1,30.

Três leituras. **O caixa fica exposto enquanto o SOL fica guardado**: converter por mês o necessário para os custos
(seção 4.6) limita a exposição a cerca de um mês; guardar mais é especular com o preço. **A taxa de abertura é fixa em
dólar na hora de abrir** (seção 4.4), mas os US$ 50 ficam em SOL até a conversão. **Se quem entra pensar em SOL**, a
queda do SOL baixa também o volume em dólar, e os dois efeitos se somam. Não há dado sobre isso.

### 5.5 Capital, captação e critério de parada

Capital necessário é o que precisa vir de fora para atravessar o ponto mais baixo do caixa. Números da v0.0.3.

| Cenário | Ponto mais baixo do caixa | Quando |
|---|---|---|
| Ruim | −116.565 | Mês 24, e continua caindo |
| Razoável | −27.674 | Mês 8 |
| Otimista | −9.705 | Mês 1 |

Quatro coisas a pesar. Sem prazo (seção 6.1), cada mês a mais de devnet soma 5.500 dólares a todas as linhas. Com
maioria de favorito claro, o ponto mais baixo do razoável desce para −36.008. Uma queda do SOL piora os três cenários,
quanto não foi recalculado. E quase todo o buraco é a retirada dos sócios, 4.500 dos 5.500.

**Decisão: a captação.** O fundador busca "de USD50k nos primeiros 6 meses a USD 350k até o final do primeiro ano",
com a ressalva: "temos que trabalhar no bootstrap, sem depender de conseguirmos qualquer coisa". Isso cobre com folga o
razoável e o otimista. O ruim não se paga com capital nenhum: mais dinheiro só adia o fim.

**A lista de investidores**, com cerca de 50 mil nomes, segue a decisão de 5/10/2026 e a ressalva da v0.0.3: email com
nome de pessoa pode ser dado pessoal pela LGPD; o convite leva opção de descadastro, e a lista não é publicada.

**Decisão: o critério de parada** ("ok"). Se, aos 180 dias na rede principal, o volume do mês for de até 45 mil
dólares e menos de 10% das carteiras estiverem voltando, a empresa para ou muda de rumo. Parar no mês 6 limita a perda
a 36.348 dólares; seguir até o mês 24 leva a 116.565. Com tudo em SOL, falta dizer a que preço o volume vira dólares
para esse critério: o do dia de cada entrada ou o do fim do mês.

### 5.6 Metas de 90 dias e o que o modelo não sabe

As metas dos primeiros 90 dias com dinheiro real, em dólares, dizem cedo em qual cenário a empresa está.

| Medida | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume, somado | Até 45 mil | 150 mil | 750 mil ou mais |
| Volume no terceiro mês | 22.500 | 75.000 | 375.000 |
| Carteiras ativas no terceiro mês | 150 | 375 | 1.500 |
| Carteiras que entram de novo em 30 dias | Menos de 10% | 20% a 35% | Mais de 35% |
| Potes que terminam de um lado só | Mais de 40% | Cerca de 20% | Menos de 10% |
| Taxa arrecadada, a 3,70% do volume | 1.665 | 5.550 | 27.750 |
| Campanhas pagas abertas por quem não é da equipe | Régua a definir | Régua a definir | Régua a definir |

A linha que mais importa é a das carteiras que voltam: volume alto com menos de 10% delas voltando é o retrato que
veio antes das quedas de 80% a 96% dos concorrentes. A última linha continua sem régua.

**O que o modelo não sabe.** A lista da v0.0.2 continua (quanto cada carteira põe, quantas voltam, quantos parceiros
pagariam, quanto vem por indicação, o custo real de auditoria e avaliação jurídica, o tempo na devnet). Desta versão:
as trajetórias de volume; `N`; o preço do SOL no dia de pagar, e se quem entra pensa em dólar ou em SOL; a mistura de
campanhas; e o custo dos serviços com muitas campanhas.

## 6. Lançamento e crescimento

### 6.1 Agora, lançamento, rede principal

| Marco | No slide | O que quer dizer |
|---|---|---|
| Agora | "Devnet, test tokens." | Rede de testes, com SOL de teste e pontos para quem acerta. Toda tela diz que é fase de testes |
| Lançamento | "Partner markets live." | As campanhas dos primeiros parceiros, cada uma sobre a própria meta, abertas de graça |
| Rede principal | "After an audit, a multisig and a cap." | Dinheiro real, depois de auditoria externa e de carteira de várias assinaturas |

**Decisão, de 8/10/2026: sem teto.** "7 sem teto, nem global nem individual". Os critérios do slide para a rede
principal passam de três a dois, auditoria e carteira de várias assinaturas, e o slide precisa mudar. O teto também
limitava a perda num erro do programa; esse papel fica com a auditoria (Parte 4).

**O prazo. Decisão, de 8/10/2026.** "16 nao se preocupe com deadline". O plano não fixa data, e o hackathon de
12/10/2026 sai. O primeiro mês na rede principal continua sendo o mês 1 das projeções, quando quer que chegue.

### 6.2 Os quatro motores de crescimento

**Decisão do pitch.** Quatro motores, resumidos na fala: "A gente quer gente com motivo pra entrar." As frases do slide
vêm como estão; com o vocabulário de 8/10/2026, "market" vira "campaign" nelas.

| Motor | No slide | Como funciona | O que custa | O que falta provar |
|---|---|---|---|---|
| Parceiros | "20–30 projects get one market free." | Cada projeto abre a própria campanha, de graça, e a mostra à comunidade | 50 dólares de taxa de abertura por parceiro, até 1.500; a campanha sai sem os US$ 450 de prêmio | Se a comunidade entra, e se algum parceiro pagaria os US$ 500 depois |
| Indicação | "20% of the fee, for 90 days." | Quem traz uma carteira recebe parte da taxa dela, em SOL | Cerca de 25% da taxa do indicado, só quando ele ganha | Quanto do volume vem por indicação |
| Cartão para o X | "Every market is a card you post on X." | Cada campanha tem um cartão pronto, e cada resolução vira uma publicação com o número lido | Tempo da equipe | Se alguém compartilha |
| Criadores | "Every creator promotes their own market." | Quem abriu ganha 1% do pote e por isso divulga | Para o Brot, quase nada: o 1% sai do pote. Para o criador, US$ 500 | Tudo, e o motor ficou mais fraco |

**O motor dos criadores ficou mais fraco, e é melhor dizer sem rodeio.** O pitch imaginava qualquer pessoa abrindo
campanhas pelo 1% e divulgando cada uma. Com US$ 500 de entrada, o 1% só devolve o que o criador pagou com mais de 50
mil dólares em entradas (seção 4.4). Quem abre passa a abrir para divulgar a própria meta, e o motor fica parecido com o
patrocínio, e não com o pump.fun (INFERÊNCIA). Perde em número de criadores; ganha em qualidade, porque cada campanha
paga chega com US$ 450 de prêmio.

**Os parceiros continuam grátis** (**Decisão, de 8/10/2026**). São o único motor que põe campanhas no ar sem que
ninguém pague os US$ 500. Por isso o teste 2 (seção 2.5) vale mais nesta versão.

**Sem mídia paga. Decisão.** Uma carteira que põe 200 dólares por mês durante seis meses deixa cerca de 32 dólares para
a operação (`1.200 × 3,70% × 75% × 95%`; INFERÊNCIA); trazer um usuário, em cripto, já custou de 77 a 2.500 dólares
(FATO SECUNDÁRIO, casos de 2021 a 2023). O beta com pontos premia acerto, e não volume.

**Falta o canal grande.** Em Solana, a distribuição passa pelas carteiras (seção 2.3), e a integração com uma delas se
conquista com meses de resolução sem erro. O otimista depende dela. **Decisão, de 8/10/2026:** haverá app para
Android, na loja de dApps da Solana; o iPhone fica com o site. Quanto público essa loja traz não foi pesquisado.

### 6.3 O que medir

A medida principal não é volume. É retenção: a parcela das carteiras que entra de novo em 30 dias.

| O que medir | Para que serve | Sinal ruim |
|---|---|---|
| Carteiras que entram de novo em 30 dias | Saber se há hábito | Menos de 10% |
| Potes que terminam de um lado só | Saber se as campanhas interessam aos dois lados | Mais de 40% |
| Carteiras e volume que cada parceiro trouxe | Vender a abertura paga aos próximos projetos | Parceiro que publica e não traz ninguém |
| Campanhas pagas abertas por quem não é da equipe, e quantas recebem os dois lados | Medir `N` e testar o slide de criadores | Poucas aberturas pagas; régua a definir |
| De qual canal veio cada carteira | Saber onde pôr o tempo da equipe | Um canal só respondendo por quase tudo |
| Campanhas resolvidas sem erro e no prazo | Sustentar a promessa central | Qualquer erro |

Quase tudo sai do registro público do programa, sem coletar dado pessoal.

## 7. Decisões e pontos abertos

**O que já estava decidido** continua valendo onde 8/10/2026 não mudou: de 5/10, a forma da taxa, o destino dos 10%,
os parceiros, o indicado, a devnet, o critério de parada e a lista de investidores (a moeda da tesouraria conflita,
seção 4.6); do pitch, os 90% e 10%, o 1% para quem abre e os quatro motores. A taxa de 0,02 SOL sai.

**O que o fundador decidiu em 8/10/2026 e toca esta parte.**

| Decisão | O que passa a valer | Seção |
|---|---|---|
| Tudo em SOL | Desfaz a moeda de 4/10/2026 | 1.2, 4.1, 5.4 |
| Abrir custa US$ 500, em SOL | 450 de prêmio e 50 para o Brot; abrir e patrocinar seguem a mesma regra | 4.3, 4.4 |
| A equipe também abre | Campanha de preço desde o começo | 2.4, 4.4 |
| Parceiros abrem de graça | Sem prêmio; 50 dólares de receita a menos cada um | 4.5, 6.2 |
| Preço de referência da CoinGecko | US$ 109,27, lido em 8/10/2026 | 5.1 |
| O 1% do criador sai do pote | Da taxa só quando quem acertou receberia menos do que pôs | 4.4 |
| Sem teto e sem lista de contas | Dois critérios para a rede principal; a defesa são os US$ 500 e o aviso | 3.3, 6.1 |
| Vocabulário de campanhas on-chain | Campanha, criador, baker, SIM e NÃO, pote, entrada | Todo o texto |
| Sem prazo; sai o pedido de pergunta; app Android | Sem data; o projeto abre e põe o prêmio de uma vez | 4.3, 6.1, 6.2 |

**O que espera decisão do fundador.** P-1 a P-7 são da lista de 8/10/2026; 3, 9 e 14 são da v0.0.3 e seguem abertos.

| Nº | Decisão | Recomendação | Efeito nas contas |
|---|---|---|---|
| P-1 | O 1% na campanha anulada, no pote de um lado só e sobre o prêmio | **Decidida em 8/10/2026:** nada nos três casos | Pequeno |
| P-2 | A leitura exata do caso raro do 1% | **Decidida em 8/10/2026:** tirar do pote o que dá; só a diferença sai da taxa | Desprezível na média; evita o salto (seção 4.4) |
| P-3 | A equipe fica com o 1%? Paga os US$ 500? | **Decidida em 8/10/2026:** não e não; os parceiros também não ficam com o 1% | As campanhas da equipe e dos parceiros não contam em `N` |
| P-4 | Os US$ 450 no pote de um lado só e na anulação | **Decidida em 8/10/2026:** o prêmio volta a quem abriu; os US$ 50 seguem a causa | Na anulação por falha da casa, os US$ 50 voltam |
| P-6 | Teto da devolução da indicação | 0,05 SOL, cerca de 5,46 dólares | Nenhum no modelo |
| P-7 | A tesouraria, com tudo em SOL | Converter por mês o necessário para os custos; a regra da tesouraria é do fundador | Limita a exposição ao SOL a cerca de um mês |
| D-f | A fonte do preço para cobrar os US$ 500 | **Decidida em 8/10/2026:** Pyth na abertura; CoinGecko no site | Fixa em dólar cada abertura |
| 3 | Contrapartidas acima de US$ 500 | 500 como piso, sem faixas; selo, nome e link em todos | Define o que cabe em 50 dólares |
| 9 | "Referrals, day one" | O primeiro dia na rede principal | Nenhum no modelo |
| 14 | O criador entrando na própria campanha | Permitir, com aviso automático | Pesa no risco da seção 3.3 |

As outras pendências (P-5, a entrada mínima em SOL, decidida em 8/10/2026: 0,01 SOL; P-8, Cloak e SODAX com SOL; e as decisões 5, 8, 11, 12 e 17 da
v0.0.3) tocam as Partes 1, 3 e 4.

**As objeções que mudaram de situação.**

| Objeção | Assunto | Situação | O que mudou |
|---|---|---|---|
| OBJ-01 | Ninguém demonstrou a demanda | Mantida | O terceiro teste mede campanhas pagas abertas por terceiros |
| OBJ-15 | Preço de vitrine, sem vitrine e sem precedente | Mantida, e mais ampla | O piso de 500 vira o preço de abrir qualquer campanha paga |
| De 7/10 | Criação aberta como motor de crescimento | Aberta, e mais fraca | Com US$ 500, quem abre tende a ser o projeto |
| De 8/10 | Sem lista e sem teto, quem abre pode empurrar o resultado | Aberta | O custo líquido de quem força pode cair a US$ 50 (seção 3.3) |
| De 8/10 | Custo em dólar, receita em SOL | Aberta | Com queda de 30% do SOL, o equilíbrio vai a 298.043 dólares (seção 5.4) |

**O que a pesquisa não encontrou.** Precedente de patrocínio com contrapartida; criação aberta que tenha sustentado
volume; a fatia do setor que caberia na nossa regra; quanto cada carteira põe por mês; a mistura real de campanhas; a
causa da queda da Limitless; quantos projetos pagariam 500 dólares; o público da loja de dApps da Solana.
