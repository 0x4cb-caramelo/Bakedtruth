# Brot Markets — Business Plan v0.0.2 — Parte 1: Produto

**Data:** 4 de outubro de 2026, revista em 5 de outubro de 2026 com as decisões da terceira devolutiva do fundador.
**Estado:** rascunho para revisão do fundador. Substitui os capítulos 1 a 4 do BP v0.0.1. As Partes 2 (mercado e
negócio), 3 (tokens) e 4 (construção e risco) vêm depois.

**Como ler.** Cada regra traz uma de duas marcas. **Decisão** é o que o fundador já decidiu, com as palavras dele
entre aspas quando ajudam. **Proposta, aguardando decisão** é o que este documento sugere e ele ainda não aprovou.
Não sobrou proposta em aberto nesta parte. Números que vêm de fora trazem etiqueta:
FATO (lido na fonte), FATO SECUNDÁRIO (lido em quem citou a fonte) e INFERÊNCIA (conta ou conclusão nossa). Três
termos aparecem no texto inteiro: USDC é a moeda digital que vale 1 dólar; MVP é a primeira versão do produto;
devnet é a rede de testes da Solana, em que o dinheiro não tem valor.

**O que mudou desde a v0.0.1.**

1. O nome é Brot Markets. O mascote continua sendo o pãozinho Baked.
2. Não há saída antecipada no MVP. A fórmula fica guardada para a fase 2.
3. A taxa passa a ser de 10% do lado perdedor. Os 3% do pote saíram; a seção 3.3 mostra a conta.
4. A taxa deixa de se dividir em quatro: 25% para a tesouraria e 75% para a operação até o equilíbrio (Parte 2).
5. Pote de um lado só: o primeiro apostador não paga taxa e os demais pagam 1%. Pergunta anulada devolve tudo.
6. Patrocínio: 70% vão para o pote e 30% para a plataforma. Entram os parceiros gratuitos.
7. Depois da resolução há uma janela de 6 horas, e o pagamento sai sozinho, sem botão de resgate.
8. A disputa tem duas etapas, sem voto por token. Na segunda, quem revisa são membros da equipe.
9. Perguntas decididas de graça por uma única chave ficam fora; preço de token pequeno entra em três degraus.
10. O MVP começa na devnet, por cerca de um mês; a indicação entra desde o MVP; o token A vira canal de tração, sem vínculo com a
    empresa, e a conta de 262.810 dólares da versão anterior sai.
11. As apostas fecham por uma regra só, e as perguntas duram até 90 dias no MVP.

## 1. Resumo

### 1.1 O que é

O Brot Markets é um mercado de previsão: um lugar em que pessoas apostam dinheiro no resultado de uma pergunta
sobre o futuro. Ele roda na Solana, a blockchain escolhida para o produto. "Brot" é pão em alemão, e o mascote é o
pãozinho Baked. Três decisões do fundador definem o produto.

- **É um mercado de previsão em pote.** Cada pergunta tem uma pool (pote): o cofre em que entram todas as apostas
  daquela pergunta, no lado SIM ou no lado NÃO. No fim, quem acertou divide o pote, descontada a taxa. O código que
  existe hoje faz outra coisa, e o fundador foi direto: "ele foi montado errado, não é essa a proposta dele ...
  queremos que seja um mercado de previsão".
- **O resultado sai de um dado gravado na própria blockchain** (on-chain), que qualquer pessoa pode conferir: "eu
  quero trabalhar com oráculo, mas um que possa resolver onchain, diferente das questões abertas de geopolítica que
  depende um oráculo que claramente pode ser manipulado".
- **É para quem já usa carteira de criptomoedas.** "queremos pessoal da web3". A pessoa entra só com a carteira,
  sem cadastro.

### 1.2 Como funciona, em um exemplo

A equipe abre a pergunta "O SOL toca 300 dólares até 31 de dezembro?". SOL é a moeda da rede Solana.

1. **Apostas.** Entram 300 USDC no SIM e 700 no NÃO. O pote é de 1.000. A tela mostra a "chance" de cada lado, que
   é a fatia do pote: SIM 30%, NÃO 70%.
2. **Fechamento.** As apostas param antes do fim, para ninguém entrar já sabendo o resultado.
3. **Resolução.** Um serviço da plataforma manda ler o preço na rede. Se o SOL encostou nos 300 dólares dentro do
   prazo, o resultado é SIM. Se o prazo acabou sem isso, é NÃO.
4. **Janela de 6 horas.** A equipe pode conferir a leitura. Ela só confirma ou anula; nunca troca o vencedor. Se
   ninguém revisar, a janela acaba sozinha.
5. **Pagamento.** O dinheiro vai direto para a carteira de quem acertou, sem botão de resgate.

A taxa é de 10% do lado perdedor (seção 3.3). Se der SIM, o lado perdedor tem 700: a taxa é 70, sobram 930 para os
vencedores e cada 1 USDC apostado no SIM recebe 930 ÷ 300 = 3,10. Se der NÃO, o lado perdedor tem 300: a taxa é
30, sobram 970 e cada 1 USDC no NÃO recebe 970 ÷ 700 = 1,39. Quem acerta recebe de volta o que apostou, mais a sua
parte em 90% do que o outro lado perdeu.

### 1.3 O que está decidido

- A moeda é o USDC. O MVP começa na devnet, com dinheiro de teste, e vai para a rede principal no início do mês 2.
- A taxa é de 10% do lado perdedor. Da taxa, 25% vão para a tesouraria e 75% para a operação até as contas
  equilibrarem (Parte 2).
- Não há saída antecipada no MVP: quem apostou fica até o fim.
- As apostas fecham por uma regra só, e as perguntas duram até 90 dias no MVP.
- Pote de um lado só devolve as apostas: o primeiro apostador não paga taxa e os demais pagam 1%. Pergunta anulada
  devolve tudo, sem taxa. Nos dois casos, o prêmio do patrocinador volta inteiro para ele.
- Patrocínio em três faixas (500, 1.500 e 5.000 dólares): 70% vão para o pote e 30% para a plataforma. De 20 a 30
  projetos parceiros entram sem pagar, em troca de divulgação.
- A equipe abre as perguntas, o público sugere pelo X e o patrocinador pode pedir uma.
- Perguntas que uma única chave decide de graça ficam fora. Preço de token pequeno entra depois, em três degraus.
- Dois serviços agendados cuidam da resolução, um vigiando o outro. Não há botão público de resolver.
- Depois da resolução vêm a janela de 6 horas e o pagamento automático. Se houver contestação, a disputa tem duas
  etapas, e na segunda quem revisa são membros da equipe.
- A indicação existe desde o MVP e é paga com a própria taxa: quem indica recebe 20% por 90 dias, e o indicado
  recebe de volta a taxa dos primeiros 50 USDC depois de apostar 250.

### 1.4 O que falta decidir

Nada. As duas últimas pendências desta parte foram decididas em 5/10/2026: o site abre com cinco tipos de
pergunta, com o leitor de preço construído primeiro (seção 4.2), e a devolução ao indicado tem teto de 5 USDC
(seção 3.8).

## 2. O que é e para quem

### 2.1 Um mercado de previsão em pote

Pote é o cofre de uma pergunta. Todas as apostas entram nele e, no fim, quem acertou divide o que sobrou depois da
taxa. O prêmio de quem acerta é o dinheiro de quem errou. O formato dispensa duas coisas de que os líderes do setor
precisam: alguém vendendo a um preço e profissionais oferecendo liquidez o tempo todo.

Todo mercado de previsão precisa de alguém, ou de alguma coisa, que diga qual foi o resultado. É nesse ponto que o
setor acumula queixas. Na Polymarket, a maior plataforma on-chain, detentores de um token votam quando o resultado
é contestado, e o processo leva de 4 a 6 dias (FATO, documentação da Polymarket, 3/out/2026). No World, que
funciona dentro da carteira Phantom, uma chave da empresa grava o resultado (FATO SECUNDÁRIO, Chainstack Labs,
11/set/2026). No PNP, dois modelos de linguagem decidem (FATO, documentação do PNP, out/2026). O Brot Markets
escolhe outro caminho: só abre perguntas cuja resposta fica gravada na rede, e o programa lê essa resposta.

O que o produto **não** tem, por decisão:

- **Tokens de SIM e de NÃO.** "o que precisamos fazer é o registro do voto por dinheiro comprado por cada votante,
  e apenas isso". A aposta é um registro em nome da carteira, não um token que circula.
- **Preço travado.** Quem aposta não compra a um preço; entra numa divisão.
- **Rendimento do pote.** "esquece o rendimento do pote, vamos abandonar isso, não serve de nada."
- **Saída antecipada no MVP** (seção 3.6).

### 2.2 Para quem

**Decisão.** "queremos pessoal da web3", isto é, quem já usa aplicações em blockchain. O acesso é "100% onchain da
solana, via wallet, sem kyc": a pessoa entra com a carteira e não passa pela conferência de identidade com
documento, que é o que a sigla em inglês KYC nomeia. Não há bloqueio por país por enquanto; o assunto está na
Parte 4.

Esse público existe em número. O pump.fun, a plataforma de Solana em que qualquer pessoa lança um token em minutos,
somava 80 milhões de carteiras e mais de 214 bilhões de dólares negociados desde a criação, com média de cerca de
347 milhões por dia (FATO SECUNDÁRIO, The Block, jun/2026). A mesma fonte mostra a queda de 2026: a receita diária
do pump.fun era de 800 mil dólares, contra 4,8 milhões seis meses antes. Carteira não é pessoa, e quantas pessoas
reais há por trás desses números não foi encontrado. Se esse público quer apostar em fatos lidos da rede é
hipótese, não certeza; a Parte 2 trata disso.

Há um segundo público: os projetos. Nas palavras do fundador, "sendo em oráculo on chain, e possibilitando você
abrir a questão de algo sobre si mesmo, você acaba criando uma forma de marketing". Um projeto que prometeu queimar
parte do próprio token patrocina a pergunta sobre essa queima: o público aposta, a pergunta circula e o cumprimento
da promessa fica provado na rede (seção 3.7).

### 2.3 O que existe hoje e o que se aproveita

Existe um programa, que é o código que roda na Solana e guarda o dinheiro, publicado na devnet. Ele tem 1.717
linhas, 138 testes e nove leitores on-chain (FATO, repositório, 4/out/2026). Leitor on-chain é a parte do programa
que abre uma conta da Solana, lê um número ou uma chave e responde sim ou não, sem ninguém informar nada.

Esse programa segue o modelo antigo, em que um patrocinador vende o SIM com desconto, como recompensa por uma meta.
**Decisão.** O programa será reescrito do zero, "olhando pro código dele para reaproveitar os trechos e pedaços que
nos interessam".

| | Programa atual | Brot Markets |
|---|---|---|
| Quem põe o dinheiro primeiro | O patrocinador, com um orçamento | Os apostadores |
| Preço | SIM a preço fixo, escolhido pelo patrocinador | Não há preço: há a fatia de cada lado no pote |
| Lado NÃO | Só de forma indireta | Aposta direta, igual ao SIM |
| Posição do usuário | Tokens de SIM e de NÃO | Um registro por apostador, sem token |
| Receita | Nenhuma no código | Taxa de 10% do lado perdedor e patrocínio |

O que se aproveita: os leitores on-chain, o desenho do cofre, os registros públicos de cada operação e o método de
teste que confere as contas depois de cada operação. O que é novo: o pote, a taxa, o patrocínio, a janela de
revisão, o pagamento automático, a indicação e o leitor de preço.

**Decisão.** "vamos montar inteiramente na devnet inicialmente". Tudo o que este documento descreve acontece
primeiro com dinheiro de teste. O critério para ir à rede principal, com dinheiro real, tem três partes: auditoria
externa, carteira que só assina com a aprovação de várias pessoas e um teto global temporário para o total
apostado. A Parte 4 detalha. Sobre o prazo, o fundador disse em 5/10/2026: "provavelmente vamos pra mainnet já no
início do mês 2". As três condições precisam caber nesse mês de devnet; se não couberem, a data anda.

### 2.4 O token A: canal de tração, sem vínculo com a empresa

O plano prevê dois tokens, e a Parte 3 trata dos dois. Aqui cabe só o papel do primeiro, o token A, lançado no
pump.fun.

**Decisão.** "não vamos vincular o token A com a nossa empresa ... ele é um marketing com grandes limitações ...
porém será importante para servir de canal de tração para pessoas conhecerem e irem visitar a nossa plataforma".

Na prática, o token A não representa a empresa e não dá direito à receita nem ao resultado dela. O papel dele é
trazer gente. Quem negocia tokens no pump.fun é o público que o produto procura, e um token ali é um jeito de esse
público ouvir o nome Brot Markets e visitar o site. Por isso ele não entra em nenhuma conta deste documento, e
nenhum texto do produto promete preço ou retorno.

A versão anterior fazia, na seção 2.5, uma conta com o número 262.810, sem dizer a unidade. Eram dólares: o volume
total dos mercados da Polymarket sobre o token PUMP, e não o volume da Polymarket inteira. Com o token A fora das
contas da empresa, essa conta sai.

## 3. O produto

### 3.1 A pool por pergunta e as três trilhas

**Decisão.** Cada pergunta tem a sua pool (pote), e o mesmo pote recebe dinheiro por três trilhas.

- **As apostas.** Qualquer carteira põe um valor no lado SIM ou no lado NÃO, quantas vezes quiser. Aposta é o valor
  que uma carteira põe num lado; fica registrado em nome dela. É a trilha principal: sem ela não há pote.
- **O patrocinador.** Paga uma de três faixas para pôr dinheiro numa pergunta e receber visibilidade em troca
  (seção 3.7).
- **O token.** O plano prevê que uma fatia do dinheiro gerado em torno dos tokens do projeto reforce os potes. As
  regras estão na Parte 3.

**Decisão.** A moeda é o USDC: "A moeda vai ser usdc, vamos abandonar a ideia de sol." Apostar 100 USDC é apostar
100 dólares. No MVP, na devnet, é USDC de teste.

O caminho de uma pergunta tem cinco estados:

| Estado | O que acontece | Seção |
|---|---|---|
| Aberta | Recebe apostas nos dois lados | 3.2 |
| Fechada | As apostas param; a pergunta espera o fato ou a data final | 3.5 |
| Em revisão | O programa leu a rede e gravou SIM ou NÃO; a equipe tem 6 horas para confirmar ou anular | 4.5 |
| Paga | O dinheiro foi enviado às carteiras de quem acertou | 3.9 |
| Anulada | Não pôde ser decidida: todos recebem de volta o que apostaram | 3.4 |

### 3.2 A conta do pote

A conta é uma divisão. Soma-se tudo o que foi apostado, tira-se a taxa, e o que sobra é repartido entre quem
acertou, na proporção do que cada um apostou. A taxa é de 10% do lado perdedor (seção 3.3). Por isso ela depende
de qual lado ganha. O exemplo-base deste documento tem 300 USDC no SIM e 700 no NÃO.

| | Se der SIM | Se der NÃO |
|---|---|---|
| Apostado no lado que ganhou | 300 USDC | 700 USDC |
| Chance mostrada na tela (fatia do pote) | 30% | 70% |
| Apostado no lado que perdeu | 700 | 300 |
| Taxa: 10% do lado que perdeu | 70 | 30 |
| Sobra para quem acertou | 930 | 970 |
| Cada 1 USDC do lado que ganhou recebe | 930 ÷ 300 = 3,10 | 970 ÷ 700 = 1,39 |
| Quem apostou 100 recebe | 310,00 | 138,57 |

Dois termos saem daí. **Chance** é a fatia do pote que está em cada lado; não é preço nem probabilidade garantida.
**Retorno** é quanto cada 1 USDC apostado recebe se o lado ganhar.

Duas consequências precisam estar na tela antes de a pessoa assinar a aposta.

**O retorno só fica definido quando as apostas fecham.** Cada aposta nova muda as fatias. No pote do exemplo,
entram mais 700 no SIM, que passa a ter 1.000. Se der SIM, a taxa é 70, sobram 1.630, e cada 1 USDC do SIM passa a
receber 1.630 ÷ 1.000 = 1,63. Antes eram 3,10. Quem apostou vendo 3,10 não tem esse número garantido. Por isso a
tela deve mostrar o retorno como "estimativa", sempre já descontada a taxa.

**Uma aposta grande baixa o retorno do próprio lado.** Um pote com 5.000 de cada lado paga 1,90 por dólar. Quem põe
10.000 no SIM leva o SIM a 15.000. Se der SIM, a taxa é 500, sobram 19.500, e o SIM paga 19.500 ÷ 15.000 = 1,30. O
apostador grande derruba o próprio prêmio.

**Decisão.** O pote não tem limite de compra. A revisão da versão anterior pediu um teto por pergunta, para o
prêmio nunca valer mais que o custo de forçar o resultado. O fundador respondeu: "no mvp não vamos lidar com isso,
mas guarde essa informação para revisitarmos numa fase futura". Fica guardado.

### 3.3 A taxa: 10% do lado perdedor

**Decisão.** A taxa é a parte do pote que fica com a casa. Ela é de **10% do lado perdedor**, o que dá no mesmo
que 10% do ganho dos vencedores. O fundador ficou com a recomendação deste documento: "forma da taxa, sua
recomendação". As outras duas contas estudadas, 3% do pote inteiro e 8% do lado perdedor, deixam de ser opções e
ficam aqui só como comparação.

**A conta.** Chame de V o total apostado no lado que ganhou e de P o total apostado no lado que perdeu.

- Taxa = 0,10 × P.
- Sobra para os vencedores = V + 0,90 × P.
- Cada 1 USDC do lado vencedor recebe (V + 0,90 × P) ÷ V.

A seção 3.2 aplica essa conta ao exemplo-base.

**De onde veio.** A v0.0.1 trabalhava com 3% do pote, seguindo o critério do fundador: "vamos trabalhar dentro das
taxas de mercado, nem maior, nem menor." Ao revisar, ele perguntou por que taxa fixa, se os concorrentes usam
fórmula: "Se a gente adotasse a fórmula deles ganharíamos mais?" Polymarket e Kalshi cobram
`coeficiente × contratos × preço × (1 − preço)`: mais quando o resultado é incerto (preço perto de 50 centavos) e
quase nada quando é quase certo. Isso exige um preço em cada negociação, e no pote não há preço na hora da aposta.
O equivalente no pote é cobrar sobre o que os vencedores ganham, isto é, sobre o lado perdedor.

**Por que os 3% saíram.** A taxa fixa sai do pote inteiro, inclusive do dinheiro de quem acertou. Quando quase
todo o pote está no lado vencedor, o ganho é pequeno e a taxa come esse ganho. As três tabelas mostram isso.

**Tabela 1. Taxa e retorno do vencedor por 1 USDC apostado**, num pote de 1.000 USDC (contas conferidas por
script). "Fatia vencedora" é a parte do pote que estava no lado que ganhou. Os 3% do pote cobram sempre 30.

| Fatia vencedora | 3% do pote: recebe | 10% do lado perdedor: taxa | 10% do lado perdedor: recebe |
|---|---|---|---|
| 30% (azarão vence) | 3,233 | 70 | 3,100 |
| 50% | 1,940 | 50 | 1,900 |
| 70% | 1,386 | 30 | 1,386 |
| 90% | 1,078 | 10 | 1,100 |
| 97% | 1,000 | 3 | 1,028 |
| 99% | 0,980 | 1 | 1,009 |

Leitura: com os 3% do pote, quando 97% do pote está no lado vencedor, quem acerta recebe exatamente o que pôs; com
99%, perde 2% mesmo acertando. Com a taxa sobre o lado perdedor, quem acerta sempre ganha. Em potes equilibrados a
taxa decidida cobra mais que os 3% (50 contra 30); com 70% no lado vencedor as duas empatam, e acima disso ela
cobra menos.

**Tabela 2. Receita esperada da casa, em % do pote**, supondo que o lado com fatia `q` vence com probabilidade `q`,
que é o que acontece quando os apostadores estão bem informados. Na taxa decidida, a conta é
`2 × 0,10 × q × (1 − q)`.

| Fatia do favorito | 3% do pote | 10% do lado perdedor |
|---|---|---|
| 50% | 3,00 | 5,00 |
| 70% | 3,00 | 4,20 |
| 81,6% | 3,00 | 3,00 |
| 90% | 3,00 | 1,80 |
| 95% | 3,00 | 0,95 |

Leitura: a taxa decidida rende 5% do pote no meio a meio, 4,2% com 70/30 e 1,8% com 90/10. Ela rende mais que os
3% enquanto o favorito tem menos de 81,6% do pote, e menos daí em diante.

**Tabela 3. Três misturas de perguntas**, com 1 milhão de USDC apostado no mês (INFERÊNCIA: as misturas são
hipótese).

| Mistura | 3% do pote | 10% do lado perdedor | 8% do lado perdedor |
|---|---|---|---|
| Maioria de perguntas de preço, equilibradas (70% dos potes entre 50% e 60%; 30% entre 80% e 90%) | 30.000 | 41.800 | 33.440 |
| Meio a meio | 30.000 | 37.000 | 29.600 |
| Maioria de fatos on-chain com favorito claro (30% equilibrados; 70% entre 85% e 95%) | 30.000 | 26.950 | 21.560 |

Leitura: a receita passa a depender da mistura de perguntas, e essa mistura ninguém mediu. Perguntas de preço
tendem a potes equilibrados e rendem mais que os 3%. Fatos on-chain com favorito claro rendem menos. A Parte 2
usa como base a linha do meio, 3,70% do volume apostado, e trata esse número como a premissa mais frágil do
modelo: ele vai de 2,70% a 4,18% conforme a mistura.

**Os motivos da escolha.** Ninguém perde por acertar. A explicação cabe numa frase: "a casa fica com 10% do que os
vencedores ganham". E some o problema da taxa em pote de um lado só, onde não há ganho.

**O custo da escolha.** Em perguntas com favorito muito claro a receita cai abaixo dos 3%: é de 1,8% do pote com
90/10. Em pote equilibrado a casa cobra 5% do pote, no topo da faixa do setor, que vai de 1,9% a 5% dos dólares
pagos (INFERÊNCIA sobre as taxas publicadas pelos concorrentes, out/2026); os 8% do lado perdedor ficariam dentro
da faixa em todos os casos e renderiam menos. E a receita deixa de ser uma porcentagem fixa do volume.

O destino da taxa é assunto da Parte 2: 25% vão para a tesouraria e 75% para a operação, até as contas
equilibrarem.

### 3.4 Pote de um lado só e pergunta anulada

**Pote de um lado só** é a pergunta em que só um lado recebeu apostas. Não há perdedor para pagar o vencedor, então
o pote devolve as apostas, qualquer que seja o resultado.

**Decisão.** Na primeira rodada o fundador mandou cobrar: "A banca nunca perde, e nem a igreja faz caridade sem
cobrar." A revisão mostrou que a taxa punia justamente quem o lançamento mais precisa, o primeiro a entrar numa
pergunta vazia. Quem entende a regra espera os outros; se todos esperam, o pote fica vazio. A decisão nova: "apenas
o primeiro apostador tem proteção contra taxa". Os demais pagam 1% do que apostaram ("vamos na sua recomendação").

Exemplo. Ana abre o pote com 100 USDC no SIM. Bruno põe 200 no SIM e Carla, 300. Ninguém aposta no NÃO.

| Apostador | Apostou | Taxa | Recebe de volta |
|---|---|---|---|
| Ana, a primeira | 100 | 0 | 100 |
| Bruno | 200 | 2 | 198 |
| Carla | 300 | 3 | 297 |

A casa fica com 5 USDC. Se Ana fosse a única apostadora, receberia os 100 de volta e a casa não ficaria com nada.

**Decisão.** O 1% é uma regra à parte, e o fundador a manteve ("ok"). Ela precisa existir porque a taxa de 10% do
lado perdedor, sozinha, não cobraria nada aqui: não há lado perdedor.

**Pergunta anulada** é um terceiro resultado, além de SIM e NÃO: a pergunta não pôde ser decidida. Ela serve para
três casos: a conta que seria lida deixou de poder ser lida; a janela de leitura foi perdida por falha do serviço;
ou a equipe, na revisão de 6 horas, concluiu que a leitura estava errada (seção 4.5).

**Decisão.** Pergunta anulada devolve tudo, sem taxa: "talvez seja a única forma de devolvermos tudo sem cobrarmos
taxa". Quem apostou 100 recebe 100. O precedente é o PancakeSwap Prediction, também um pote, que devolve 100%
quando a rodada é cancelada (FATO, documentação do PancakeSwap).

**Decisão: o prêmio do patrocinador nesses dois casos.** No pote de um lado só e na pergunta anulada, o prêmio
volta inteiro ao patrocinador ("ok"). Os 30% da plataforma seguem a causa (Parte 4, seção 4.8): ela fica com
eles no pote de um lado só, porque a divulgação foi entregue, e devolve na pergunta anulada por falha dela.

### 3.5 Fechamento das apostas

Fechamento é o momento em que as apostas param, antes da data final, para ninguém entrar já sabendo o resultado.

**Por que um pote precisa fechar antes.** Numa bolsa, quem compra tarde paga caro. Num pote não há preço: quem
entra no último minuto recebe o mesmo retorno de quem arriscou desde o primeiro dia, e dilui essa pessoa. Exemplo:
o pote tem 500 no SIM e 500 no NÃO; falta uma hora e o fato não aconteceu, então o NÃO é quase certo. Quem está no
NÃO desde o começo receberia 1,90 por dólar. Um oportunista põe 5.000 no NÃO. A taxa é 50 e sobram 5.950 para os
5.500 do NÃO. Ele recebe 5.409,09, um lucro de 409,09 quase sem risco, e os apostadores antigos do NÃO passam a
receber 1,082 por dólar. Quem correu o risco ficou com as sobras.

**Decisão: uma regra só, para perguntas de até 90 dias.** "um fechamento só, porém vamos sim permitir perguntas
acima de 30 dias, limitados a 90 no mvp". As apostas fecham quando faltam 5% da duração da pergunta, com mínimo de
24 horas e máximo de 7 dias. A regra vale para todas as perguntas, e a duração máxima no MVP é de 90 dias. Nas
perguntas de fato que não volta atrás, como uma queima, as apostas também travam no instante em que o fato
acontece.

| Duração da pergunta | Fecha no dia | Dias sem aposta no fim |
|---|---|---|
| 3 dias | 2,0 | 1,0 |
| 7 dias | 6,0 | 1,0 |
| 14 dias | 13,0 | 1,0 |
| 30 dias | 28,5 | 1,5 |
| 60 dias | 57,0 | 3,0 |
| 90 dias | 85,5 | 4,5 |

O máximo de 7 dias só passa a valer em perguntas com mais de 140 dias, como uma de 180, que ficam para a fase
seguinte.

**De onde veio a regra.** Na versão anterior ela se chamava T2 e valia só para as perguntas longas. O fundador já
a preferia: "a proposta do T2 é mais interessante". As demais fechavam quando passassem 80% da duração, regra que
saiu do produto: na pergunta de 30 dias ela fechava no dia 24, e a nova fecha no dia 28,5.

**O custo.** São dois. Primeiro, quem entra tarde sabe mais que quem entrou cedo, e a regra nova dá mais tempo a
essa entrada tardia: quatro dias e meio a mais na pergunta de 30 dias. Segundo, não há saída antecipada no MVP
(seção 3.6). Quem aposta numa pergunta de 90 dias fica com o dinheiro preso por até três meses, e a tela avisa
isso antes da aposta.

**Decisão: a opção avançada, para perguntas curtas.** O mínimo de 24 horas inviabiliza perguntas de um ou dois
dias: numa pergunta de dois dias, sobra um dia para apostar e um dia parado; numa pergunta de um dia, não sobra
nada. E o público web3 aposta em prazos curtos: concorrentes operam perguntas de preço de cripto de 5 minutos a 1
semana (FATO, documentação dos concorrentes, out/2026). Por isso existe a opção avançada: fechamento com menos de
24 horas, desde que uma segunda pessoa da equipe assine e a aprovação fique registrada on-chain. O fundador a quer
para que, "para situações de apostas curtas a gente possa trabalhar com valores menores do que 24h".

Ele também disse quando isso entra. Perguntas curtas dependem de fluxo de apostadores, "do contrário a gente morre
de termos baixas apostas apenas por termos baixo fluxo": uma pergunta de 24 horas com meia dúzia de apostadores
vira um pote minúsculo. Elas entram quando houver público e canal de distribuição. Até lá, a recomendação é abrir
só perguntas de três dias ou mais.

### 3.6 Saída antecipada: fora do MVP

Saída antecipada é desistir da aposta antes da resolução e receber parte do dinheiro de volta. A parte que fica
para trás é a penalidade.

**Decisão.** "eu gostei muito da fórmula proposta, e quero que isso seja documentado como algo a ser melhor
trabalhado na fase 2. Neste mvp vamos trabalhar sem possibilidade de saída." No MVP, quem apostou fica até o fim, e
a tela diz isso antes da assinatura.

O motivo de esperar: não foi encontrado nenhum pote que devolva dinheiro do próprio cofre a quem sai (FATO do
agente de pesquisa: ausência em pesquisa, out/2026). Nos concorrentes, sair é vender a posição a outra pessoa. E
uma penalidade fixa não basta. No pote de 300 no SIM e 700 no NÃO, o NÃO vencedor recebe 1,39 por dólar. Se todo o
SIM percebe que vai perder e sai pagando 5% de penalidade, sobram os 700 do NÃO e 15 de penalidade: o NÃO recebe no
máximo 715 ÷ 700 = 1,02 por dólar. Quem acertou fica quase sem prêmio.

> **Guardado para a fase 2: a fórmula de saída** (INFERÊNCIA; parâmetros sem referência de mercado, a simular)
>
> ```text
> devolução  = aposta × (1 − penalidade)
> penalidade = mínimo( 90% ,  5%  +  20% × tempo  +  queda )
> tempo      = fração já decorrida da janela de saída (0 na abertura, 1 quando a saída fecha)
> queda      = 1 − chance do seu lado na saída ÷ chance do seu lado na sua entrada  (zero se a chance subiu)
> ```
>
> Os 5% são um pedágio, para ninguém entrar e sair de graça. O tempo encarece a saída perto do fim, quando quem
> sai sabe mais. A queda cobra de quem sai o estrago que a própria saída faz na chance do lado dele. Exemplo, no
> pote de 300 e 700: Ana tem 100 dos 300 do SIM e sai com um quarto da janela decorrido. Tempo de 25%, queda de
> 12,3%, penalidade de 22,3%: ela recebe 77,72 dos 100. Uma aposta pequena, de 10, sairia no mesmo momento
> recebendo 88,83 de cada 100.
>
> Antes de ligar: simulação com apostadores estratégicos, revisão externa e as correções já apontadas na v0.0.1
> (penalidade marcada por lado, piso de 10%, espera mínima em horas).

### 3.7 Patrocinador e parceiros

Patrocinador é quem paga para pôr dinheiro numa pergunta e receber visibilidade em troca. Ele é a segunda trilha de
dinheiro do pote e, ao mesmo tempo, o cliente de um produto de marketing: o projeto que prometeu algo verificável
na rede abre a pergunta sobre a própria promessa.

**Decisão: três faixas e a divisão.** As faixas são 500, 1.500 e 5.000 dólares. Do valor pago, "70 pro pote/pool e
30 pra banca/plataforma".

| Faixa | Vai para o pote (70%) | Fica com a plataforma (30%) |
|---|---|---|
| 500 | 350 | 150 |
| 1.500 | 1.050 | 450 |
| 5.000 | 3.500 | 1.500 |

**Decisão: duas formas de entrar no pote**, à escolha do patrocinador. Os exemplos usam um pote com 10.000 USDC em
apostas, 6.000 no SIM e 4.000 no NÃO. Sem patrocinador, o SIM paga 1,600 por dólar (taxa de 400) e o NÃO, 2,350
(taxa de 600).

- **Prêmio neutro** é dinheiro somado ao pote sem escolher lado. Aumenta o retorno de quem acertar, qualquer que
  seja o resultado. Com os 1.050 da faixa de 1.500, o SIM passa a pagar 1,775 e o NÃO, 2,613. Os dois lados ganham.
- **Aposta de patrocinador** é o dinheiro entrando num lado, como uma aposta grande, com selo. O efeito é outro.
  Com os 3.500 da faixa de 5.000 no SIM, o SIM passa a pagar 1,379 em vez de 1,600, e o NÃO sobe para 3,138. Se der
  SIM, o patrocinador recebe 4.826 de volta. Quem apostou no mesmo lado dele ganha menos; quem apostou contra ganha
  mais, se acertar.

**O prêmio neutro não paga taxa.** Só o lado perdedor é base da taxa, e o prêmio neutro vai inteiro aos
vencedores. A plataforma já é paga pelo patrocínio com os 30% que retém. As contas da aposta de patrocinador tratam
esse dinheiro como uma aposta comum: se o lado dele perder, entra na base da taxa.

**Decisão: pedido de pergunta.** O patrocinador entra numa pergunta que a equipe já abriu ou pede uma nova. No
pedido, o pagamento fica travado até a equipe aceitar ou recusar: "se for recusado devolve a grana travada".

**Decisão: contrapartidas.** As contrapartidas listadas "são aceitáveis". As quantidades e os prazos da tabela são
proposta.

| | 500 | 1.500 | 5.000 |
|---|---|---|---|
| Pergunta | Entra numa já aberta | Entra ou pede uma | Pede pergunta sob medida |
| Selo de patrocínio | Sim | Sim | Sim |
| Texto na pergunta | Nome e link | Nome, link e uma frase | Nome, link, frase e imagem |
| Destaque na página inicial | Não | 72 horas | Posição fixa enquanto as apostas estão abertas |
| Publicação no X, rotulada como parceria paga | 1 | 2 | 4 e fio de resultado |
| Relatório ao fim | Não | Volume e carteiras | Volume, carteiras, impressões e cliques |

**Decisão: o patrocinador anônimo.** O risco mais sério deste desenho é quem controla o resultado apostar nele.
Exemplo: a equipe de um token pede a pergunta "o token X queima 10% da oferta até o dia 30?" e decide sozinha se
queima. O público põe 1.000 no SIM e 1.000 no NÃO. O patrocinador, escondido, põe 5.000 no NÃO e não queima. O
lado perdedor é o SIM, com 1.000: a taxa é de 100 e sobram 6.900 para os 6.000 do NÃO. Ele recebe 5.750: lucro de
750, tirado de quem apostou no SIM. Polymarket e Kalshi proíbem por escrito que negocie quem pode influenciar o
resultado (FATO, regras de integridade das duas plataformas, 2026).

O fundador escolheu três travas ("vamos de alternativas 1, 3 e 4"):

1. **Anônimo para o público, identificado para a equipe.** A tela não mostra quem é; a equipe sabe.
2. **Aviso na pergunta:** "o patrocinador pode controlar o resultado e pode ter apostado".
3. **Anônimo só com prêmio neutro.** Quem não mostra o nome não escolhe lado. Aposta de patrocinador exige nome.

A ferramenta que esconde o pagador é o Cloak, um serviço de privacidade em Solana, integrado à plataforma por
decisão. Ele tem um limite que o texto do produto precisa respeitar: esconder um pagamento depende de haver muitos
outros parecidos em volta, e o cofre de USDC do Cloak tinha cerca de 2.560 USDC (FATO SECUNDÁRIO, plano de
privacidade do sócio técnico; tamanho atual a confirmar). Um patrocínio de 5.000 é quase o dobro disso. Por isso a
seção 4.7 propõe a expressão "não divulgado" no lugar de "anônimo".

**Decisão: parceiros gratuitos.** No começo, o patrocínio vale mais como divulgação do que como receita. O fundador
vai "convidar parceiros da rede para entrar como patrocinador ... sem que eles tenham a obrigação de pagar qualquer
coisa, isso para fins de marketing". São de 20 a 30 projetos, e eles "nos entregam publicidade e postagem nas suas
redes sociais". Exemplo: um projeto parceiro ganha uma pergunta sobre uma meta dele, com selo e destaque; em troca,
publica a pergunta para a própria comunidade, que chega ao Brot Markets já com um motivo para apostar. A
consequência é assumida: a receita de patrocínio do primeiro ano fica perto de zero. Está decidido: uma
pergunta gratuita por parceiro, com destaque de 72 horas, em troca de duas publicações; vale para os 30 primeiros.

### 3.8 Indicação

Indicação é o programa em que um usuário traz outro e os dois ganham algo.

**Decisão.** O fundador pediu que os dois lados ganhassem ("os dois precisam ganhar algo"), aceitou que o prêmio
saia da própria taxa do indicado ("vamos implementar desde o mvp") e aprovou os números: "gosto. sim, vamos."

- **Quem indica** recebe 20% da taxa que a casa de fato recebeu das apostas vencedoras do indicado, durante 90
  dias.
- **O indicado** recebe de volta a taxa cobrada sobre os primeiros 50 USDC que apostou, depois de completar 250
  USDC apostados ("sim, vamos fazer isso").
- O dinheiro sai do fluxo de taxas. Não há caixa próprio nem verba separada.

**Por que só as apostas vencedoras contam.** A taxa é descontada do ganho de quem acerta, então uma aposta do
indicado só gera taxa quando ele ganha. Os 20% incidem sobre essa taxa ("ok").

**Por que devolução no lugar de isenção.** A proposta anterior dispensava o indicado da taxa até ele completar 50
USDC apostados. Com isenção na hora, quem abrisse uma carteira nova a cada 50 dólares nunca pagaria taxa. Na
devolução, a taxa é cobrada como a de todo mundo e só volta depois de a carteira completar 250 USDC apostados.

Exemplo. Bia indica o Caio. Em 90 dias, o Caio aposta 1.000 USDC. A taxa descontada dos ganhos dele soma 37, que é
a média de 3,70% do volume usada na Parte 2 (INFERÊNCIA). Bia recebe 20% disso, 7,40. O Caio passou dos 250
apostados e recebe de volta a taxa dos primeiros 50, que na média é de 1,85. A casa fica com 27,75. Na média, o
programa custa 0,74% do volume indicado (20% de 3,70%), mais a devolução.

**Decisão: a devolução tem teto de 5 USDC por indicado.** O fundador aprovou o teto em 5/10/2026. Ele nasceu da
taxa sobre o ganho. Uma aposta de 50 USDC num azarão que ganha gera uma taxa alta. Exemplo: com os
primeiros 50 do Caio, um lado fica com 100 USDC, contra 900 do outro, e ganha. A taxa do pote é 90 e a parte dele
nessa taxa é 45. Sem teto, a casa devolveria 45 USDC a uma carteira só. O custo do teto: quem acertar um azarão logo de início recebe de volta menos do que pagou de taxa nos
primeiros 50.

Dois cuidados para a Parte 4: gravar quem indicou quem, e gravar de qual aposta veio cada pedaço da taxa, para
repartir os 20% e calcular a devolução.

### 3.9 Pagamento automático

**Decisão.** Não há botão de resgate. O fundador comparou com o líder: "na polymarket ele vai direto pro teu saldo,
não faz sentido ter botão de claim". Quem acertou recebe na carteira sem fazer nada.

Como funciona: a pergunta é resolvida, passa pela janela de 6 horas (seção 4.5) e, confirmada, o serviço agendado
da plataforma envia a cada vencedor a parte dele. No exemplo-base, se der SIM, quem apostou 100 no SIM recebe
310,00 na carteira. O mesmo vale para as devoluções do pote de um lado só e da pergunta anulada.

Duas consequências práticas, que a Parte 4 detalha:

- **Alguém paga a taxa de rede de cada envio**, e esse alguém é a plataforma. O custo é baixo: 0,000005 SOL por
  transação, de modo que mil transações custam 0,005 SOL (FATO, relatório técnico de out/2026; a soma é
  INFERÊNCIA).
- **A conta de USDC do vencedor precisa existir.** Se ele a fechou depois de apostar, o envio falha. O programa
  precisa de um caminho para esse caso, em que o valor fica reservado em nome dele.

O serviço que paga não escolhe quem recebe nem quanto: os valores saem do registro das apostas e do resultado
gravado. Se o serviço parar, o pagamento atrasa, mas o dinheiro continua no cofre, em nome de quem acertou.

## 4. Perguntas e resolução

### 4.1 Os dois ciclos de pergunta e as sugestões pelo X

Pergunta é uma frase com resposta SIM ou NÃO, uma data final e uma regra de como se decide. Exemplo: "A oferta do
token T cai para 900 milhões até o dia 30?".

**Decisão.** Há dois ciclos. "na realidade existem dois ciclos de perguntas, a primeira é da equipe montando as
perguntas". No segundo, um patrocinador pede a pergunta.

**Primeiro ciclo: a equipe abre.**

1. **Abertura.** A equipe escolhe um tipo de pergunta da lista (seção 4.2), a conta da Solana que será lida, a
   meta e a data final. O programa confere, já na criação, se aquela conta serve para aquele tipo.
2. **Apostas**, até o fechamento (seção 3.5).
3. **Resolução**, pelo serviço agendado (seção 4.4). A pergunta pode se resolver antes da data: "Se acontecer algo
   antes da data marcada, ela pode sim se resolver." Se a queima prometida acontece no dia 10, a pergunta resolve
   no dia 10.
4. **Janela de 6 horas** (seção 4.5) e **pagamento automático** (seção 3.9).

**Segundo ciclo: o patrocinador pede.** Ele descreve a pergunta e deixa o pagamento travado. "ele pode solicitar
uma pergunta, e travar o pagamento até a nossa equipe revisar ... se for recusado devolve a grana travada." Aceita,
a pergunta segue os mesmos passos. Três regras técnicas evitam dinheiro preso (proposta da revisão técnica, a
detalhar na Parte 4): o aceite abre a pergunta e aplica o dinheiro numa mesma operação; a recusa só libera o saque,
e quem saca é o próprio patrocinador; e, se a equipe não responder em 14 dias, ele cancela sozinho e recupera tudo.

**Decisão: o público sugere pelo X.** O site terá uma página com "um monitor vindo do X, e orientação da galera
como eles podem fazer para fazer as sugestões". Há duas formas de trazer o X para o site. Embutir a linha do tempo
de um perfil ou de uma lista é gratuito. Ler por programa as publicações que mencionam a marca custa 0,005 dólar
por publicação lida (FATO, documentação do X, 3/out/2026): mil menções custam 5 dólares, e alguém que inunde a
marca de menções faz a conta subir.

O fundador aceitou as três regras propostas para essa página ("concordo com todas as sugestões propostas"). Ela
mostra uma lista escolhida pela equipe, nunca menção automática, porque conteúdo de terceiros traz golpes e links.
Ela fica separada da página em que a carteira assina a aposta. E nenhuma sugestão vira pergunta sem revisão humana.

### 4.2 Os tipos de pergunta, em linguagem simples

**Decisão: a lista dos tipos de pergunta do primeiro dia.** Das três saídas do passo 5, o fundador escolheu a
recomendada: "vamos com o recomendado (a)". Os seis passos mostram o que foi decidido e por quê.

**1. O que está sendo decidido.** No dia em que o site abrir, sobre quais assuntos a equipe vai poder abrir
perguntas.

**2. Por que isso é uma decisão.** O Brot Markets só abre perguntas cuja resposta está gravada na rede. Cada tipo
de pergunta precisa de um "leitor", que é o pedaço do programa que vai na rede buscar a resposta: ele olha um
número ou uma chave e responde sim ou não. Sem leitor, o tipo não pode ser aberto. Hoje, nove leitores já existem
(seção 2.3), o de preço precisa ser construído, e alguns tipos são perigosos, porque uma pessoa sozinha decide o
resultado.

**3. O critério, com um exemplo de dinheiro.** A pergunta que separa os tipos é: **alguém consegue decidir o
resultado sem gastar nada?** Se sim, essa pessoa aposta no lado certo por outra carteira, aperta o botão que só
ela tem e leva o pote. Exemplo: a pergunta é "o time do projeto P renuncia à emissão até o fim do mês?", e só o
time pode renunciar. O público põe 3.000 USDC no SIM e 7.000 no NÃO. O time põe 3.000 no SIM por uma carteira
nova, renuncia, e a pergunta dá SIM. Ele recebe 6.150: lucro de 3.150, sem risco, tirado de quem apostou no NÃO.
A conta está na seção 4.3. Por isso a coluna que mais importa na tabela é "quem controla o resultado".

**4. A tabela dos tipos.** Algumas palavras antes dela.

- **Oferta** é a quantidade total de um token. **Queima** é destruir tokens para sempre, reduzindo a oferta.
- **Pool de negociação** é o cofre em que um token é trocado por outro. **Liquidez travada** é dinheiro posto numa
  pool e travado para sempre, para o token sempre poder ser trocado. A Meteora é uma das plataformas de pools da
  Solana.
- **Validador** é um computador que confirma as transações da rede. **Stake** é o SOL que as pessoas confiam a ele.
  **Pool de staking** é um cofre que junta o SOL de muita gente e o distribui entre validadores.
- **Época** é o "dia" da Solana para contas de stake; dura cerca de dois dias.
- **Chave** é a senha que dá a alguém um poder sobre um token ou um programa: criar tokens novos, congelar
  carteiras, alterar o código. **Renunciar** é abrir mão desse poder para sempre.
- **Oráculo de preço** é um serviço em que corretoras e formadores de mercado publicam preços assinados, que o
  programa confere dentro da rede.

| Tipo | O que pergunta | Pergunta de exemplo | Quem controla o resultado | Recomendação |
|---|---|---|---|---|
| Preço de ativo grande | O preço encosta num alvo dentro do prazo? | "O SOL toca 300 dólares até o dia 30?" | Ninguém: é o mercado inteiro do ativo | Entra. O leitor precisa ser construído |
| Queima de oferta | A quantidade total do token cai até um número? | "A oferta do token T cai para 900 milhões até o dia 30?" | Qualquer um que tenha o token e o queime. Custa dinheiro: o token queimado some | Entra, em tokens do padrão clássico. O leitor já existe |
| Liquidez travada na Meteora | Uma pool tem pelo menos X de liquidez travada para sempre? | "A pool T/SOL chega a X de liquidez travada até o dia 30?" | Quem põe liquidez e trava. Custa dinheiro: fica presa | Entra. O leitor já existe |
| Tamanho de pool de staking | A pool tem pelo menos X SOL no começo de uma época? | "O JitoSOL começa a época E com X SOL ou mais?" | Quem deposita. O dinheiro precisa atravessar a virada da época | Entra. O leitor já existe |
| Stake de validador | O validador tem pelo menos X SOL confiados a ele numa época? | "O validador V entra na época E com X SOL ou mais?" | Quem confia SOL ao validador, antes de a época virar | Entra. O leitor já existe |
| Tokens travados | Uma quantidade do token foi para um cofre de onde ninguém tira? | "Pelo menos X tokens ficam travados para sempre até o dia 30?" | Qualquer um que tenha os tokens. Custa dinheiro: ficam presos | Não, no primeiro dia. Já decidido (seção 4.3) |
| Renúncia de emissão | O time abre mão de criar tokens novos? | "O time do projeto P renuncia à emissão até o fim do mês?" | Só quem tem a chave. Custo zero | Não. Já decidido (seção 4.3) |
| Renúncia de congelamento | O time abre mão de congelar a carteira dos outros? | "O token T fica sem autoridade de congelamento até o dia 30?" | Só quem tem a chave. Custo zero | Não. Já decidido (seção 4.3) |
| Programa imutável | O código de um programa fica travado para sempre? | "O protocolo P torna o programa imutável até o dia 30?" | Só quem tem a chave. Custo zero | Não. Já decidido (seção 4.3) |
| Metadados imutáveis | Nome, símbolo e imagem do token ficam congelados? | "O token T congela os metadados até o dia 30?" | Só quem tem a chave. Custo zero | Não. Já decidido (seção 4.3) |

Lida de cima para baixo, a tabela mostra três famílias. No preço de ativo grande, ninguém controla o resultado.
Nos cinco tipos seguintes, dá para empurrar o resultado, mas é preciso gastar, travar ou deixar dinheiro parado.
Nos quatro últimos, uma pessoa decide de graça.

Dois avisos sobre os tipos que entram.

- **O leitor de preço ainda não existe.** Cripto é a porta de entrada de cerca de 40% dos novos usuários da
  Polymarket (FATO SECUNDÁRIO, The Defiant, 1º tri/2026). A candidata estudada para o leitor é a Pyth, uma rede de
  oráculos de preço que, em 4 de outubro de 2026, tinha 1.881 preços, 423 deles de cripto, incluindo SOL, Bitcoin e
  as memecoins grandes (FATO, consulta direta). A modalidade proposta é a de **toque**: dá SIM se o preço encostar
  no alvo em qualquer momento do prazo. Para ninguém apostar depois de o preço já ter tocado o alvo, toda aposta
  nesse tipo de pergunta exige um preço fresco.
- **As perguntas de época dependem do serviço agendado.** A janela para ler dura cerca de dois dias. Elas só entram
  com os dois serviços da seção 4.4 no ar.

**5. As três saídas possíveis e o que cada uma custa.**

- **(a) Lançar com os cinco tipos recomendados, construindo primeiro o leitor de preço.** O leitor de preço vai
  para o começo da fila de construção, para ficar pronto junto com o resto. O custo: é trabalho novo antes de
  qualquer outra peça, e o site passa a depender de uma rede de oráculos de fora, a Pyth, desde o primeiro dia. Se
  o leitor atrasar, a equipe volta a esta decisão e escolhe entre as outras duas saídas.
- **(b) Lançar só com os quatro tipos que já têm leitor e incluir o preço depois.** O site abre mais cedo. O custo:
  abre sem o único tipo que ninguém controla. Sobram só tipos em que alguém pode empurrar o resultado gastando
  dinheiro, e falta o assunto que mais atrai o público de cripto.
- **(c) Esperar o leitor de preço para lançar.** Nada abre enquanto o leitor de preço não estiver pronto. O custo:
  a data de lançamento fica presa a uma peça só. Se ela atrasar, atrasam também os quatro tipos que já poderiam
  estar no ar.

**6. A decisão e o porquê.** A saída (a). O preço é o único tipo que ninguém controla e é o assunto em que o
público de cripto mais aposta (INFERÊNCIA, apoiada no dado da Polymarket acima). Os outros quatro dão ao site o
que os concorrentes da seção 2.1 não têm: perguntas decididas pela leitura de um fato gravado na rede, como uma
queima ou uma liquidez travada.

### 4.3 O que fica fora e por quê

**Decisão: perguntas decididas de graça por uma única chave.** São os quatro últimos tipos da tabela. O dono da
chave decide o resultado sem gastar nada, e pode apostar antes, por outra carteira. A conta do exemplo da seção
4.2: o pote tem 3.000 no SIM e 7.000 no NÃO, e o dono da chave põe 3.000 no SIM pouco antes do fechamento. O pote
vai a 6.000 e 7.000. Ele usa a chave e a pergunta resolve SIM. O lado perdedor tem 7.000: a taxa é 700 e sobram
12.300 para os 6.000 do SIM, 2,05 por dólar. Ele recebe 3.000 × 2,05 = 6.150: lucro de 3.150, sem risco. Se o pote
estivesse pesado no SIM, ele apostaria no NÃO e simplesmente não agiria. Quem aposta contra o dono da chave está
doando. O fundador decidiu: "sim, vamos seguir a alternativa proposta". Esses tipos ficam fora do pote na primeira
versão.

**Tokens do padrão novo, usado pelo pump.fun.** Na Solana, os tokens são registrados num programa comum. Existem
dois: o clássico, usado pelo USDC e por quase tudo que é antigo, e o novo, chamado Token-2022, que deixa o token ter
funções extras embutidas. Os tokens novos do pump.fun são do padrão novo: 7 de 7 na amostra lida na rede em 3 de
outubro de 2026 (FATO, amostra pequena). Os leitores de token que existem só aceitam o clássico; diante de um token
novo, eles não leem errado, recusam (FATO, repositório). Por isso a queima entra, no primeiro dia, só para tokens
do padrão clássico. O leitor atualizado precisa aceitar o padrão novo e recusar qualquer token com função
perigosa, como a que permite a um terceiro queimar o saldo de qualquer carteira.

**Decisão: tokens travados ficam fora no primeiro dia.** O leitor desse tipo existe e o resultado não é decidido
por uma chave. Ele fica fora da lista do primeiro dia porque só lê tokens do padrão clássico ("ok"). A queima tem
o mesmo limite e entra. A diferença é de prioridade: são dois tipos sobre o mesmo assunto, e este volta quando o
leitor aceitar o padrão novo.

**Decisão: preço de token pequeno, em três degraus.** O fundador questionou a exclusão: "Por que ficaria? Com base
no quê". A resposta é uma conta. Numa pool pequena, o preço é a divisão entre duas reservas, e dá para movê-lo por
um instante.

1. A pool tem 100 SOL e 10 milhões de tokens. O preço é 0,00001 SOL por token.
2. A pergunta é "o token vale o dobro até sexta?", e há dinheiro no NÃO. O atacante aposta no SIM.
3. Numa única transação, ele compra tokens com 41,42 SOL, o preço lido dobra, a pergunta resolve SIM, e ele revende
   os tokens. Perde cerca de 0,21 SOL em taxas (INFERÊNCIA, conta da pesquisa técnica).
4. O preço voltou. Ninguém viu o token dobrar, e ele leva o pote do NÃO.

Ele nem precisa ter os 41 SOL: existe o empréstimo relâmpago, tomado e devolvido dentro da mesma transação. E já
aconteceu em Solana, em escala grande: no caso Mango, em outubro de 2022, o preço de um token de pouca negociação
foi de cerca de 0,04 para 0,54 dólar em uns 30 minutos, e a retirada foi de 114 a 116 milhões de dólares (FATO,
denúncias dos reguladores americanos SEC e CFTC).

O fundador aceitou a entrada em degraus ("vamos seguir a proposta alternativa recomendada"):

1. Ativos com preço num oráculo de preço on-chain, incluindo as memecoins grandes. É o tipo "preço de ativo
   grande" da lista da seção 4.2.
2. Tokens com pool na Raydium ou na Meteora, pela média do preço num período, e não pelo preço de um instante. Numa
   média de 30 minutos, um pico de 100 vezes o preço que dure 15 segundos move a média em 3,9% (INFERÊNCIA). Exige
   liquidez travada mínima.
3. Tokens que só existem na pool do próprio pump.fun, pela Switchboard, outra rede de oráculos. Esse degrau troca a
   leitura pura da rede pela confiança numa rede de oráculos.

**Fora por desenho: geopolítica, política e tudo o que depende de alguém dizer o que aconteceu.** É a decisão de
origem do produto.

**Esportes: fase 2.** Resultado de jogo não nasce on-chain; alguém precisa publicar. O fundador quer, "numa fase 2
criarmos um oráculo específico pra isso", para ampliar o público além do web3. O tema não foi pesquisado, e é a
categoria que as regras brasileiras de apostas citam pelo nome (Parte 4).

### 4.4 Como a pergunta se resolve e o serviço agendado em dobro

Resolução é o ato de gravar o resultado da pergunta. Funciona assim:

1. Cada pergunta nasce apontando para uma conta da Solana. Conta é o lugar em que a rede guarda um dado: o registro
   de um token, o estado de uma pool, um preço assinado.
2. Na resolução, o programa abre essa conta, lê o número e compara com a meta.
3. Se a meta foi cumprida, grava SIM. Se a data final passou sem a meta, grava NÃO. Ninguém informa nada.

O resultado sai do dado, e não de quem acionou a leitura. Esse é o ponto que separa o produto dos concorrentes da
seção 2.1.

**Decisão: quem aciona.** "talvez a gente resolva com um sistema cron pela nossa plataforma, acionando o resolver."
Serviço agendado (em inglês, cron) é um programa de computador que acorda de tempos em tempos e faz uma tarefa
sozinho. Aqui, ele confere a cada minuto se alguma pergunta já pode ser resolvida e aciona a leitura. O site não
tem botão público de resolver ("Sobre o botão resolver, esquece").

**Por que o serviço não pode falhar.** A regra herdada do programa atual é dura: se o prazo passou, o resultado é
NÃO, porque o programa não tem como saber depois em que dia a meta foi cumprida (FATO, repositório). Exemplo: a
pergunta é "a oferta do token T cai para 900 milhões até o dia 30?". A queima acontece no dia 10. O serviço está
fora do ar e ninguém aciona a leitura. No dia 30, o prazo vence e o resultado gravado é NÃO. Quem acertou perderia
tudo. Nas perguntas de época a janela é ainda mais curta, de cerca de dois dias: um fim de semana com o serviço
parado e um SIM verdadeiro viraria NÃO.

**Decisão: dois serviços.** O principal confere as perguntas a cada minuto. O segundo roda em outro provedor, junto
do backup, e vigia o principal. Se o principal cair, nas palavras do fundador, "após xx minutos, e yy tentativas de
tentar religar", o segundo assume em "ritmo e cadência mais lenta" e "envia email ao CTO".

**Decisão: os números da vigia.** O fundador tinha deixado o "xx" e o "yy" em branco e aprovou os números
propostos: "sim, e aí o segundo assume o cron e envia notificação para o cto saber que tem um sistema down".

- O segundo serviço confere o principal a cada 5 minutos.
- Com 10 minutos sem resposta, ele tenta religar o principal, até 3 vezes.
- Se não religar, o segundo assume a resolução, rodando a cada 5 minutos, e manda email ao CTO, que é o
  responsável técnico, o Ronaldo, para ele saber que há um sistema fora do ar.
- O aviso por Telegram entra na fase 2.

Com esses números, uma pergunta que já podia ser resolvida espera dezenas de minutos (INFERÊNCIA). O custo: nesse
intervalo nenhuma pergunta é resolvida.

Duas redes de proteção ficam por trás do serviço: a janela de 6 horas, em que a equipe pode anular uma leitura
errada, e o resultado "Anulada", que devolve tudo quando a janela de leitura foi perdida (seção 3.4). E o mesmo
serviço ganha uma segunda função: enviar os pagamentos (seção 3.9).

### 4.5 A janela de 6 horas

**Decisão.** Depois de resolvida, a pergunta "fica travada por cerca de 6h em aguardo de alguém da equipe revise e
confirme que a resolução foi correta, liberando o pagamento". Durante essa janela, o estado da pergunta é "em
revisão".

Três regras, todas decididas:

- **A equipe só confirma ou anula.** Ela "pode só confirmar ou anular". Não existe a opção de inverter o resultado.
  Se a leitura deu SIM e a equipe acha que está errada, o máximo que ela faz é anular, e todos recebem de volta o
  que apostaram. A equipe nunca escolhe o vencedor.
- **Se ninguém revisar, o pagamento sai sozinho.** "se não revisar a tempo o pagamento saia sozinho ao fim das 6h".
  O dinheiro dos apostadores nunca depende de alguém da equipe estar acordado.
- **No MVP, só a equipe aciona a contestação.** Qualquer pessoa pode avisar a equipe por um canal público. Na fase
  1.2, qualquer apostador da pergunta poderá contestar, com um depósito (seção 4.6).

Exemplo. A pergunta resolve SIM às 14h00.

| O que acontece | Quando o pagamento sai |
|---|---|
| Alguém da equipe confere e confirma às 15h10 | 15h10 |
| Ninguém da equipe revisa | 20h00, sozinho |
| A equipe vê que a conta lida era a errada e anula às 16h00 | 16h00, como devolução: cada um recebe o que apostou, sem taxa |
| Chega um aviso pelo canal público e a equipe aciona a contestação | O pagamento pausa e a pergunta vai para a disputa |

A janela tem um custo, e ele é assumido: o produto deixa de poder dizer "pago em minutos". O prazo verdadeiro é "em
até 6 horas", e a tela mostra o relógio. O ganho é um intervalo para pegar o erro antes de o dinheiro sair, porque
depois de pago não há volta. A janela também cria um poder novo: uma chave da equipe capaz de anular. Esse poder é
limitado, porque anular só devolve o dinheiro a quem o pôs. A proposta é que ele também seja público: toda
anulação fica registrada, com o motivo.

### 4.6 A disputa em duas etapas

**Decisão.** Disputa é o que acontece quando alguém contesta o resultado dentro da janela. O fundador deu a
direção: "uma arbitragem de resolução de disputas com novos oráculos e até revisão humana, em duas etapas". Disse o
que não quer: voto por token em staking, porque "é justamente neste ambiente que ocorre a manipulação dos
resultados". E aprovou o desenho abaixo com uma condição sobre quem revisa: "pode ser, mas membros da equipe, né?"
Os três revisores da etapa 2 são membros da equipe.

O que ele recusa tem registro. Na Polymarket, em 2026, até maio, mais de 1.150 mercados foram a arbitragem, e em
cerca de 1 de cada 5 disputas um votante tinha posição no mercado julgado (FATO SECUNDÁRIO, Wall Street Journal via
Finance Magnates, mai/2026). Em março de 2025, um mercado de 7 milhões de dólares foi resolvido como SIM sem o fato
ter ocorrido; um detentor votou com 25% dos votos (FATO SECUNDÁRIO, CoinDesk e outros, mar/2025).

O desenho:

| Passo | O que acontece | Prazo |
|---|---|---|
| Gatilho | Um aviso de contestação, dentro das 6 horas, pausa o pagamento. No MVP só a equipe aciona, e qualquer pessoa avisa por um canal público. Na fase 1.2, qualquer apostador da pergunta aciona, com um depósito (por exemplo, 50 USDC) devolvido se a contestação proceder | Dentro da janela |
| Etapa 1: segunda fonte | O mesmo dado é lido de novo por um caminho independente: outro provedor de acesso à rede e, em pergunta de preço, um segundo oráculo. Se as leituras confirmam a resolução, a contestação cai e o pagamento sai. Se divergem, vai à etapa 2 | Até 1 hora |
| Etapa 2: revisão humana | Três membros da equipe examinam, e a decisão sai com o acordo de dois deles. Só podem confirmar ou anular. A decisão e o motivo são publicados | Até 48 horas |

Exemplo. A pergunta "o SOL toca 300 dólares até o dia 30?" resolve SIM. Um apostador avisa no canal público que o
preço lido foi um pico de uma única fonte. A equipe aciona a contestação e o pagamento pausa. Na etapa 1, o serviço
lê o segundo oráculo. Se ele também mostra 300, a contestação cai e o pagamento sai em até uma hora. Se ele mostra
291, as leituras divergem e a pergunta sobe para a etapa 2. Dois dos três revisores olham os dados e decidem:
confirmar o SIM ou anular. Se anularem, todos recebem de volta o que apostaram.

Três limites deste desenho, ditos com clareza:

- **Não há voto por token.** Quem decide na etapa 2 são membros da equipe, e a decisão é publicada com o motivo.
- **A equipe nunca inverte um resultado.** Se a leitura estava errada, quem estava certo não ganha: recebe de volta
  o que apostou. É o preço de a equipe não escolher vencedores.
- **O depósito da fase 1.2 existe para a contestação ter custo.** Sem ele, qualquer perdedor contestaria toda
  pergunta só para atrasar o pagamento.

O custo: no pior caso, o pagamento sai 55 horas depois da resolução, sendo 6 da janela, 1 da primeira etapa e 48
da segunda.

### 4.7 Como falamos disso

O fundador pediu: "vamos pensar essas frases todas num sentido mais marketeiro e agradável de ler, sem ser mentira".
A regra desta seção é essa. Cada frase abaixo descreve algo que o produto faz de fato.

**Frases de apresentação.**

- "A resposta já está na rede. A gente só lê."
- "Aqui nenhum token vota para decidir quem ganhou."
- "Acertou? O prêmio chega sozinho na sua carteira, em até 6 horas."
- "Quem acerta divide o pote. Simples assim."
- "A equipe confere. O dado decide."
- "Cada pergunta mostra o número lido, a meta e o link. Confira você mesmo."
- "Entre com a carteira e aposte em USDC."
- "A casa fica com 10% do que os vencedores ganham."
- Para projetos: "Prometeu queimar? Abra a pergunta e deixe a rede provar."
- Do mascote: "Brot é pão em alemão. O Baked é o nosso pãozinho: resultado saído do forno da rede."

A sexta frase só vale quando a tela de cada pergunta mostrar esses três itens; é uma proposta de tela que este
documento mantém.

**O que trocamos e por quê.**

| Em vez de | Dizemos | Por quê |
|---|---|---|
| "Sem oráculo" | "Resultado lido direto da rede" e, nas perguntas de preço, "preço de um oráculo conferido na própria rede" | As perguntas de preço usam um oráculo on-chain, e foi isso que o fundador pediu |
| "Pago em minutos" | "Pago sozinho, em até 6 horas" | Existe a janela de revisão; se houver contestação, o prazo aumenta e a tela mostra |
| "Sem disputa" | "Disputa curta, em duas etapas, sem voto por token" | A disputa existe e tem prazo |
| "Patrocinador anônimo" | "Patrocinador não divulgado", com o aviso "o patrocinador pode controlar o resultado e pode ter apostado" | A equipe sabe quem é, e a ferramenta de privacidade não esconde valores grandes |
| "Ninguém controla" | "A equipe não escolhe o vencedor: só confirma ou anula", com a lista pública de quem pode o quê | A equipe abre as perguntas, pode anular e pode atualizar o código |
| "Ganhe 3 vezes" | "Retorno estimado agora: 3,10 por 1. Muda até o fechamento" | O retorno só fica definido quando as apostas fecham, e não há promessa de retorno |

**Enquanto o produto estiver na devnet**, toda tela e toda publicação dizem: "Estamos em fase de testes. Aqui se
aposta com USDC de teste, que não vale dinheiro." A frase "Entre com a carteira e aposte em USDC" só vale sem essa
ressalva na rede principal.

## 5. Decisões pendentes e objeções

### 5.1 O que foi decidido em 5/10/2026

O fundador respondeu em 5/10/2026 a tudo o que estava como proposta. São dez decisões. A citação dele está
na seção indicada.

| # | Assunto | O que passa a valer | Seção |
|---|---|---|---|
| 1 | Taxa | 10% do lado perdedor | 3.3 |
| 2 | Fechamento das apostas | Uma regra só; perguntas de até 90 dias no MVP | 3.5 |
| 3 | Vigia do serviço agendado | 10 minutos sem resposta e 3 tentativas de religar; depois o segundo serviço assume e avisa o CTO | 4.4 |
| 4 | Disputa em duas etapas | Na etapa 2, quem revisa são dois de três membros da equipe | 4.6 |
| 5 | Indicação | 20% por 90 dias para quem indica; o indicado recebe de volta a taxa dos primeiros 50 USDC depois de apostar 250 | 3.8 |
| 6 | Base dos 20% da indicação | A taxa que a casa recebeu das apostas vencedoras do indicado | 3.8 |
| 7 | 1% no pote de um lado só | Mantido, como regra à parte | 3.4 |
| 8 | Prêmio do patrocinador em pote de um lado só ou pergunta anulada | Volta inteiro ao patrocinador | 3.4 |
| 9 | Tipo "tokens travados" | Fora da lista do primeiro dia | 4.3 |
| 10 | Tipos de pergunta do primeiro dia | Cinco tipos: preço de ativo grande, queima, liquidez travada na Meteora, pool de staking e stake de validador. O leitor de preço é construído primeiro | 4.2 |

O último detalhe, o teto de 5 USDC na devolução ao indicado, também foi aprovado (seção 3.8).

### 5.2 As objeções da v0.0.1 que tocam o produto

A v0.0.1 registrou 29 objeções. Treze tocam a Parte 1; as demais vão para as Partes 2, 3 e 4.

| Objeção | Assunto | Situação | O que foi decidido |
|---|---|---|---|
| OBJ-02 | Patrocinador anônimo que controla o resultado e aposta | Resolvida | Anônimo para o público e identificado para a equipe; aviso na pergunta; anônimo só com prêmio neutro |
| OBJ-03 | Perguntas decididas de graça por uma chave | Resolvida | Ficam fora do pote na primeira versão |
| OBJ-04 | Saída antecipada como a peça mais arriscada | Adiada para a fase 2 | Não há saída no MVP |
| OBJ-06 | Não existe ganho para realizar antes do fim | Adiada para a fase 2 | Segue junto com a fórmula de saída |
| OBJ-07 | Taxa fixa castiga quem aposta no favorito | Resolvida, com custo | A taxa passa a ser de 10% do lado perdedor: quem acerta nunca recebe menos do que apostou. A receita passa a depender da mistura de perguntas |
| OBJ-08 | Taxa no pote de um lado só | Resolvida | Primeiro apostador sem taxa; os demais pagam 1% |
| OBJ-21 | Mínimo de 24 horas trava as perguntas curtas | Adiada para fase futura | Opção avançada aprovada; perguntas curtas entram quando houver fluxo; o fechamento passa a ter uma regra só |
| OBJ-22 | Teto de pote | Adiada para fase futura | "no mvp não vamos lidar com isso" |
| OBJ-23 | SODAX e Cloak integrados ao site | Mantida | A integração foi mantida: Cloak já na devnet, SODAX na rede principal. O limite do Cloak com valores grandes continua |
| OBJ-24 | Preço de token pequeno | Resolvida | Entra em três degraus, não no primeiro dia |
| OBJ-25 | Falha do serviço faz um SIM virar NÃO | Resolvida | Dois serviços, resultado "Anulada" e janela de 6 horas; sem botão público; o segundo serviço assume depois de 10 minutos sem resposta e 3 tentativas de religar |
| OBJ-27 | Frases que prometem o que o produto não entrega | Resolvida | Frases reescritas na seção 4.7 |
| OBJ-28 | Nome | Resolvida | Brot Markets, com o mascote Baked; falta consultar uma base de marcas |
