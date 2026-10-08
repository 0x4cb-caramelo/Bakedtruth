# Brot Markets — Business Plan v0.0.3 — Parte 1: Produto

**Data:** 8 de outubro de 2026.
**Estado:** rascunho para revisão do fundador. Esta versão foi derivada do pitch de 7 de outubro de 2026, por ordem
dele: "tomar o pitch como verdade, e transformar o Business plan conforme o pitch". Onde o pitch e a v0.0.2
discordam, vale o pitch. Onde o pitch se cala, vale a v0.0.2, mais curta. Substitui a Parte 1 da v0.0.2, que fica na
pasta como versão anterior. As Partes 2 (mercado e negócio), 3 (tokens) e 4 (construção e risco) vêm depois.

**Como ler.** Cada regra traz uma de três marcas.

- **Decisão** é o que o fundador decidiu em 4 ou 5 de outubro de 2026, com as palavras dele entre aspas quando
  ajudam.
- **Decisão do pitch** é uma regra que está no deck de 7 de outubro de 2026. Ela vem citada em inglês, como está na
  tela.
- **Proposta, aguardando decisão** é o que este documento sugere e o fundador ainda não aprovou.

Números que vêm de fora trazem etiqueta: FATO (lido na fonte), FATO SECUNDÁRIO (lido em quem citou a fonte) e
INFERÊNCIA (conta ou conclusão nossa). "Pitch" são três coisas: a tela (os dez slides), a fala (o roteiro do
fundador e as respostas prontas) e a frase de elevador que ele aprovou. Quando o texto aponta para o plano anterior,
escreve "v0.0.2, P1 §3.7": Parte 1, seção 3.7.

Cinco termos aparecem no texto inteiro. **USDC** é a moeda digital que vale 1 dólar. **SOL** é a moeda da rede
Solana. **Devnet** é a rede de testes da Solana, em que o dinheiro não tem valor. **MVP** é a primeira versão do
produto. **Programa** é o código que roda na Solana e guarda o dinheiro.

**O que mudou desde a v0.0.2.**

1. O projeto que patrocina passa a ser o cliente e vem primeiro. São três públicos: o projeto, quem escolhe um lado
   e quem abre mercados.
2. Qualquer carteira abre um mercado, por 0,02 SOL, dentro das regras. Antes só a equipe abria.
3. Quem abriu o mercado fica com 1% do pote. De onde sai esse 1% ainda não está decidido (seção 3.4).
4. No patrocínio, 90% viram prêmio e 10% são taxa de marketing. Eram 70% e 30%. A tela diz "a partir de 500
   dólares"; os valores de 1.500 e 5.000 deixam de ser regra.
5. A página de sugestões pelo X perde a função: quem tem uma ideia abre o mercado. O pedido de pergunta, com
   resposta da equipe em 14 dias, também perde, e a proposta é que saia (decisão 4, seção 3.7).
6. A lista de tipos deixa de ser "o que a equipe pode abrir" e vira "as regras": o que o programa aceita de
   qualquer pessoa.
7. O texto de produto tem duas trilhas de dinheiro, e não três: as entradas e o patrocínio. E duas moedas: USDC no
   pote, SOL só na taxa de abertura.
8. A janela de 6 horas e a disputa continuam. O plano registra o conflito delas com a frase "No human in the loop"
   (seção 4.5).
9. O texto de produto usa "mercado", "entrar" e "escolher um lado". Entram a frase de elevador, a frase da capa e o
   lema "Proof > Promises".
10. Não mudaram: a taxa de 10% do lado perdedor, o pote de um lado só, o mercado anulado, a regra de fechamento, a
    indicação, o pagamento automático, os cinco tipos e a forma de resolver.

## 1. Resumo

### 1.1 O que é

O Brot Markets é um mercado de previsão: um lugar em que pessoas põem dinheiro no resultado de uma pergunta sobre
o futuro. Ele roda na Solana. "Brot" é pão em alemão, e o mascote é um pãozinho. A frase da capa do pitch resume o
produto. Em português: **"Mercados de previsão que a rede resolve. O mercado de previsão em que os projetos põem
dinheiro atrás das próprias promessas, e a rede prova se eles cumpriram."**

Quatro ideias definem o produto.

- **É um pote.** Cada mercado tem um cofre em que entra o dinheiro de quem escolheu SIM e de quem escolheu NÃO. No
  fim, quem acertou divide o pote, descontada a taxa.
- **A rede responde.** O produto só aceita mercados cuja resposta fica gravada numa conta da Solana. O programa lê
  essa conta e grava o resultado. Ninguém vota e ninguém informa nada.
- **O projeto é cliente.** Um projeto que prometeu algo que a rede consegue medir, como queimar tokens, patrocina o
  mercado sobre a própria promessa. A comunidade dele escolhe um lado, e a promessa vira campanha.
- **Qualquer um abre.** Qualquer carteira abre um mercado, pagando 0,02 SOL, desde que ele seja de um tipo que o
  programa sabe ler.

### 1.2 Como funciona, em um exemplo

O exemplo é o do slide de receita. Alguém abre o mercado "O token T queima 100 milhões de tokens até 30 de
novembro?".

1. **Entradas.** Entram 600 USDC no SIM e 400 no NÃO. O pote é de 1.000. A tela mostra a "chance" de cada lado, que
   é a fatia do pote: SIM 60%, NÃO 40%.
2. **Fechamento.** As entradas param antes do fim, para ninguém entrar já sabendo o resultado.
3. **Resolução.** Um serviço da plataforma manda o programa ler a conta do token. Se a queima aconteceu dentro do
   prazo, o resultado é SIM. Se o prazo acabou sem ela, é NÃO.
4. **Janela de 6 horas.** A equipe pode conferir a leitura. Ela só confirma ou anula; nunca troca o vencedor. Se
   ninguém conferir, a janela acaba sozinha.
5. **Pagamento.** O dinheiro vai direto para a carteira de quem acertou, sem botão de resgate.

A queima aconteceu, e o SIM ganhou. O lado perdedor tem 400. A taxa do Brot é de 10% disso: **40 USDC**. Sobram
**960** para quem acertou, e cada 1 USDC posto no SIM recebe 960 ÷ 600 = 1,60. É a conta do slide.

Falta uma parcela, que está no slide de criadores: quem abriu o mercado fica com 1% do pote, 10 USDC. Ao pé da
letra, esses 10 saem do pote: quem acertou recebe 950, e não 960, e cada 1 USDC recebe 1,583 (seção 3.4).

### 1.3 O que está decidido

- O pote é em USDC. O produto começa na devnet, com dinheiro de teste.
- A taxa do Brot é de 10% do lado perdedor. Da taxa, 25% vão para a tesouraria e 75% para a operação, até as
  contas equilibrarem (Parte 2, seção 4.2).
- Qualquer carteira abre um mercado por 0,02 SOL, dentro das regras, e quem abriu fica com 1% do pote.
- O patrocínio começa em 500 dólares: 90% viram prêmio e 10% são taxa de marketing. De 20 a 30 projetos parceiros
  ganham um mercado grátis no lançamento.
- Não há saída antecipada no MVP: quem entrou fica até o fim.
- As entradas fecham por uma regra só, e os mercados duram até 90 dias.
- Pote de um lado só devolve as entradas: a primeira carteira não paga taxa e as demais pagam 1%. Mercado anulado
  devolve tudo, sem taxa.
- O site abre com cinco tipos de mercado. O que uma única chave decide de graça fica fora.
- Dois serviços agendados cuidam da resolução. Depois dela vêm a janela de 6 horas e o pagamento automático.
- A indicação paga 20% da taxa por 90 dias a quem indica, e o indicado recebe de volta a taxa dos primeiros 50 USDC,
  com teto de 5 USDC.

### 1.4 O que falta decidir

O pitch trouxe regras novas e deixou perguntas que só o fundador responde. As que tocam o produto são treze, e a
seção 5 traz a lista com a recomendação de cada uma. As quatro maiores:

- **De onde sai o 1% de quem abriu o mercado** (seção 3.4). Do pote, do prêmio de quem acertou ou da taxa do Brot.
- **Se a janela de 6 horas fica**, diante de "No human in the loop" (seção 4.5).
- **Quais tipos de mercado abrem a qualquer pessoa desde o primeiro dia** (seção 4.2). Em alguns deles dá para
  empurrar o resultado.
- **O que o patrocinador recebe pelos 10%**, e se existem valores acima de 500 dólares com nome próprio (seção 3.7).

## 2. O que é e para quem

### 2.1 Um mercado de previsão em que o projeto é cliente

Pote é o cofre de um mercado. Todas as entradas vão para ele e, no fim, quem acertou divide o que sobrou depois da
taxa. O prêmio de quem acerta é o dinheiro de quem errou. O formato dispensa duas coisas de que os líderes do setor
precisam: alguém vendendo a um preço e profissionais oferecendo liquidez o tempo todo.

Todo mercado de previsão precisa de alguém, ou de alguma coisa, que diga qual foi o resultado. O slide do problema
diz onde o setor falha: "Someone always stands between the event and your payout", isto é, sempre há alguém entre o
fato e o pagamento. Na Polymarket, a maior plataforma do setor em blockchain, detentores de um token votam quando o
resultado é contestado, e o processo leva de 4 a 6 dias (FATO, documentação da Polymarket, 3/out/2026). No World,
que funciona dentro da carteira Phantom, uma chave da empresa grava o resultado (FATO SECUNDÁRIO, Chainstack Labs,
11/set/2026). No PNP, dois modelos de linguagem decidem (FATO, documentação do PNP, out/2026). Em março de 2025, um
mercado de 7 milhões de dólares na Polymarket foi resolvido como SIM sem o fato ter ocorrido (FATO SECUNDÁRIO,
CoinDesk e outros, mar/2025).

**Decisão do pitch.** "Brot only lists markets the chain can answer. If the answer isn't stored in a Solana
account, the market doesn't open." O Brot só aceita mercados que a rede consegue responder. É a mesma escolha que o
fundador fez em 4/10/2026: "eu quero trabalhar com oráculo, mas um que possa resolver onchain".

O que o pitch acrescenta é o lugar do projeto. A frase de elevador, aprovada pelo fundador em 7/10/2026, apresenta
o Brot como "a prediction market built as a growth engine for on-chain projects": um mercado de previsão construído
como motor de crescimento para projetos que vivem na blockchain. Na fala: "o mercado trata projeto cripto como
assunto. A gente trata como cliente." A regra por trás dessa frase é o patrocínio (seção 3.7). A frase não cria
regra nova.

Por decisão do fundador, o produto **não** tem tokens de SIM e de NÃO (a entrada é um registro em nome da carteira,
e não um token que circula), preço travado, rendimento do pote nem saída antecipada no MVP (seção 3.10).

### 2.2 Três públicos

**O projeto que patrocina.** É o cliente. Um projeto anuncia uma meta que a rede consegue medir, como queimar 100
milhões de tokens até uma data, e põe dinheiro no mercado sobre essa meta. O fundador já tinha visto isso em
4/10/2026: "sendo em oráculo on chain, e possibilitando você abrir a questão de algo sobre si mesmo, você acaba
criando uma forma de marketing". Na v0.0.2 esse era o "segundo público". No pitch ele vem primeiro.

**Quem escolhe um lado.** É quem já usa carteira de criptomoedas. **Decisão.** "queremos pessoal da web3", com
acesso "100% onchain da solana, via wallet, sem kyc". A pessoa entra com a carteira e não passa pela conferência de
identidade com documento, que é o que a sigla em inglês KYC nomeia. Não há bloqueio por país por enquanto; o assunto
está na Parte 4, seção 6.

**Quem abre mercados.** É o público novo. **Decisão do pitch.** "Anyone can open a market, pump.fun style." A
pessoa escolhe um tipo de mercado, paga 0,02 SOL e fica com 1% do pote. O pitch supõe que ela procure a pergunta
que divide opiniões e divulgue o próprio mercado: "Creators hunt for the questions that split the timeline, and
promote their own markets." É hipótese, e a evidência que existe aponta para o outro lado: o PNP tem criação
aberta, dá ao criador 30% da taxa e registrou 206 transações em seis meses (FATO, leitura da rede, 4/out/2026). A
Parte 2, seções 2.5 e 3.2, trata disso.

A comparação com o pump.fun, a plataforma de Solana em que qualquer pessoa lança um token em minutos, é uma imagem:
quanto custa criar um token lá não está registrado no nosso material.

O tamanho desse público, na fonte: o pump.fun somava 80 milhões de carteiras e mais de 214 bilhões de dólares
negociados desde a criação, com média de cerca de 347 milhões por dia (FATO SECUNDÁRIO, The Block, jun/2026). A
mesma fonte mostra a queda de 2026: a receita diária do pump.fun era de 800 mil dólares, contra 4,8 milhões seis
meses antes. Carteira não é pessoa, e os 80 milhões são o total desde a criação, e não gente ativa hoje. Se esse
público quer entrar em mercados sobre fatos lidos da rede é hipótese (Parte 2, seção 2.5).

### 2.3 O que existe hoje

Existem dois programas no repositório. O antigo segue outro modelo, em que um patrocinador vende o SIM com
desconto. Ele tem 1.717 linhas e 138 testes (FATO, repositório, 5/out/2026) e está congelado. **Decisão.** O
programa do Brot é escrito do zero, "olhando pro código dele para reaproveitar os trechos e pedaços que nos
interessam". O que se aproveita são os leitores, o desenho do cofre e o método de teste.

O programa novo tem, hoje, um leitor de preço e nenhuma instrução. Leitor é o pedaço do programa que abre uma conta
da Solana, lê um número e responde sim ou não. Instrução é cada operação que o programa aceita, como abrir um
mercado ou registrar uma entrada. Em outras palavras: nada do que este documento descreve funciona ainda. As duas
primeiras etapas de construção estão fechadas, e a terceira é a que escreve o pote (Parte 4, seção 2.1).

| | Programa antigo, congelado | Brot Markets |
|---|---|---|
| Quem põe o dinheiro primeiro | O patrocinador, com um orçamento | Quem escolhe um lado |
| Posição do usuário | Tokens de SIM e de NÃO, a preço fixo | Um registro por carteira, sem token e sem preço |
| Quem abre | O patrocinador | Qualquer carteira, dentro das regras |
| Receita | Nenhuma no código | Taxa de 10% do lado perdedor, taxa de marketing e taxa de abertura |

**Decisão.** "vamos montar inteiramente na devnet inicialmente". Tudo o que este documento descreve acontece
primeiro com dinheiro de teste. A ida à rede principal, com dinheiro real, tem três condições, que o pitch repete:
"After an audit, a multisig and a cap", isto é, depois de uma auditoria externa, de uma carteira que só assina com
a aprovação de várias pessoas e de um teto para o total nos potes (Parte 4, seção 4.1).

## 3. O produto

### 3.1 O pote, as duas moedas e os cinco estados

**Decisão.** Cada mercado tem o seu pote. O dinheiro chega a ele por duas trilhas.

- **As entradas.** Qualquer carteira põe um valor no lado SIM ou no lado NÃO, quantas vezes quiser. Entrada é o
  valor que uma carteira põe num lado; fica registrado em nome dela. É a trilha principal: sem ela não há pote.
- **O patrocínio.** Um projeto paga para pôr um prêmio no mercado sobre a própria meta (seção 3.7).

A v0.0.2 trazia uma terceira trilha, a do token. O pitch não apresenta token, e ela sai do texto de produto. O que
sobra dela está na Parte 3.

O produto passa a ter duas moedas, cada uma num lugar.

- **USDC no pote. Decisão.** "A moeda vai ser usdc, vamos abandonar a ideia de sol." Entrar com 100 USDC é entrar
  com 100 dólares. Na devnet é USDC de teste.
- **SOL na taxa de abertura. Decisão do pitch.** "0.02 SOL to open a market." É o único ponto em que o SOL volta ao
  produto. A consequência é prática: a plataforma passa a receber e guardar uma segunda moeda, cujo preço em dólares
  oscila (Parte 4, seção 4.7).

O caminho de um mercado tem cinco estados:

| Estado | O que acontece | Seção |
|---|---|---|
| Aberto | Recebe entradas nos dois lados | 3.2 |
| Fechado | As entradas param; o mercado espera o fato ou a data final | 3.6 |
| Em revisão | O programa leu a rede e gravou SIM ou NÃO; a equipe tem 6 horas para confirmar ou anular | 4.5 |
| Pago | O dinheiro foi enviado às carteiras de quem acertou | 3.10 |
| Anulado | Não pôde ser decidido: todos recebem de volta o que puseram | 3.5 |

### 3.2 A conta do pote

A conta é uma divisão. Soma-se tudo o que entrou, tira-se a taxa, e o que sobra é repartido entre quem acertou, na
proporção do que cada um pôs. A taxa do Brot é de 10% do lado perdedor (seção 3.3), e por isso depende de qual lado
ganha. O exemplo-base é o mercado de preço do slide de solução: "O SOL toca 300 dólares até 31 de dezembro?", com
300 USDC no SIM e 700 no NÃO. A tabela ainda não inclui a parte de quem abriu o mercado, que a seção 3.4 soma.

| | Se der SIM | Se der NÃO |
|---|---|---|
| Total do lado que ganhou | 300 USDC | 700 USDC |
| Chance mostrada na tela (fatia do pote) | 30% | 70% |
| Total do lado que perdeu | 700 | 300 |
| Taxa: 10% do lado que perdeu | 70 | 30 |
| Sobra para quem acertou | 930 | 970 |
| Cada 1 USDC do lado que ganhou recebe | 930 ÷ 300 = 3,10 | 970 ÷ 700 = 1,39 |
| Quem entrou com 100 recebe | 310,00 | 138,57 |

Dois termos saem daí. **Chance** é a fatia do pote que está em cada lado; não é preço nem probabilidade garantida.
**Retorno** é quanto cada 1 USDC recebe se o lado ganhar.

Duas consequências precisam estar na tela antes de a pessoa assinar a entrada.

**O retorno só fica definido quando as entradas fecham.** Cada entrada nova muda as fatias. No pote do exemplo,
entram mais 700 no SIM, que passa a ter 1.000. Se der SIM, a taxa é 70, sobram 1.630, e cada 1 USDC do SIM passa a
receber 1.630 ÷ 1.000 = 1,63. Antes eram 3,10. Quem entrou vendo 3,10 não tem esse número garantido. Por isso a
tela mostra o retorno como "estimativa", sempre já descontadas a taxa e a parte de quem abriu.

**Uma entrada grande baixa o retorno do próprio lado.** Um pote com 5.000 de cada lado paga 1,90 por dólar. Quem
põe 10.000 no SIM leva o SIM a 15.000. Se der SIM, a taxa é 500, sobram 19.500, e o SIM paga 19.500 ÷ 15.000 =
1,30. Quem entra grande derruba o próprio prêmio.

**O teto por mercado.** **Decisão**, de 4/10/2026: o pote não tem limite, e o teto por mercado ficou guardado: "no
mvp não vamos lidar com isso, mas guarde essa informação para revisitarmos numa fase futura". Com a criação aberta,
o assunto deixa de estar guardado e volta a estar em aberto, por dois motivos novos. Primeiro, ninguém mais escolhe
as metas, e num mercado sobre um token sem valor o resultado pode ser empurrado de graça (seção 4.2). Segundo, o
teto que existe é a soma de todos os potes abertos, e uma carteira sozinha pode ocupá-lo (Parte 4, seção 4.4).
**Proposta, aguardando decisão:** teto por mercado nos tipos em que dá para empurrar o resultado.

### 3.3 A taxa: 10% do lado perdedor

**Decisão**, confirmada pelo pitch. A taxa é a parte do pote que fica com o Brot. Ela é de **10% do lado
perdedor**, o que dá no mesmo que 10% do ganho de quem acertou. O fundador ficou com a recomendação do plano
("forma da taxa, sua recomendação"), e o slide de receita diz o mesmo: "10% of the losing side. Winners get their
money back, plus the rest."

**A conta.** Chame de V o total do lado que ganhou e de P o total do lado que perdeu.

- Taxa do Brot = 0,10 × P.
- Sobra para quem acertou, antes da parte de quem abriu = V + 0,90 × P.
- Cada 1 USDC do lado vencedor recebe (V + 0,90 × P) ÷ V.

**Por que sobre o lado perdedor.** Polymarket e Kalshi cobram por uma fórmula sobre o preço de cada negociação, e
no pote não há preço na hora da entrada. O equivalente é cobrar sobre o que os vencedores ganham. Uma taxa fixa
sobre o pote inteiro, que foi a primeira ideia, comeria o ganho de quem acerta quando quase todo o pote está no
lado vencedor.

**Tabela 1. Taxa e retorno por 1 USDC do lado vencedor**, num pote de 1.000 USDC, sem a parte de quem abriu (contas
conferidas por script na v0.0.2). "Fatia vencedora" é a parte do pote que estava no lado que ganhou.

| Fatia vencedora | Taxa do Brot | Cada 1 USDC recebe |
|---|---|---|
| 30% (o lado menor vence) | 70 | 3,100 |
| 50% | 50 | 1,900 |
| 60% (o pote do slide) | 40 | 1,600 |
| 70% | 30 | 1,386 |
| 90% | 10 | 1,100 |
| 97% | 3 | 1,028 |
| 99% | 1 | 1,009 |

Leitura: só com a taxa do Brot, quem acerta sempre recebe mais do que pôs, mesmo com 99% do pote no lado dele.

**Tabela 2. Receita esperada do Brot, em % do pote**, supondo que o lado com fatia `q` vence com probabilidade
`q`, que é o que acontece quando quem entra está bem informado. A conta é `2 × 0,10 × q × (1 − q)`.

| Fatia do favorito | Receita esperada, em % do pote |
|---|---|
| 50% | 5,00 |
| 70% | 4,20 |
| 90% | 1,80 |
| 95% | 0,95 |

Leitura: a taxa rende 5% do pote no meio a meio, 4,2% com 70 a 30 e 1,8% com 90 a 10. A fala do pitch diz o mesmo
com outras palavras: "o nosso negócio é a pergunta polêmica". Quanto mais dividido o mercado, mais ele rende.

**O custo da escolha.** A receita deixa de ser uma porcentagem fixa do volume e passa a depender da mistura de
mercados, que ninguém mediu. A Parte 2, seção 4.2, usa como base 3,70% do volume e mostra que esse número vai de
2,70% a 4,18% conforme a mistura. Em pote equilibrado o Brot cobra 5% do pote, no topo da faixa do setor, que vai
de 1,9% a 5% dos dólares pagos (INFERÊNCIA sobre as taxas publicadas pelos concorrentes, out/2026).

**Uma frase do pitch que pede precisão.** O título do slide é "We only earn from the losing side". Vale para a
taxa do pote. As outras três receitas do Brot não saem do lado perdedor: a taxa de marketing (seção 3.7), a taxa
de abertura (seção 4.1) e o 1% do pote de um lado só (seção 3.5).

### 3.4 A parte de quem abriu: 1% do pote

**Decisão do pitch.** "1% of the pot goes to whoever opened it." Quem abriu o mercado fica com 1% do pote. Este
documento chama esse valor de "a parte de quem abriu o mercado".

A regra do slide diz quanto, e não diz de onde sai. São três leituras possíveis. A primeira é a regra do pitch, ao
pé da letra. As outras duas são **Proposta, aguardando decisão**. Chame de C a parte de quem abriu.

| Desenho | Parte de quem abriu | Quem acertou recebe | Brot fica com |
|---|---|---|---|
| A. Ao pé da letra: sai do pote | `C = 0,01 × (V + P)` | `0,99 V + 0,89 P` | `0,10 P` |
| B. Sai do prêmio, com teto | `C = mínimo(0,01 × (V + P); 0,90 P)` | `V + 0,90 P − C`, nunca menos que `V` | `0,10 P` |
| C. Sai da taxa do Brot | `C = mínimo(0,01 × (V + P); 0,10 P)` | `V + 0,90 P` | `0,10 P − C` |

**A regra do pitch, no exemplo do próprio pitch.** O pote do slide de receita tem 1.000 USDC, 600 no lado que
acertou e 400 no que errou. A taxa do Brot é 40. A parte de quem abriu é 1% de 1.000: 10. No desenho A, quem acertou
recebe 1.000 − 40 − 10 = **950, e não os 960 que o slide mostra**. Os 960 só valem em mercado sem essa parte, ou no
desenho C, em que os 10 saem dos 40 do Brot.

Num pote de 1.000 USDC, quanto recebe cada 1 USDC do lado vencedor em cada desenho:

| Fatia do lado vencedor | Taxa do Brot | A | B | C | Brot em C |
|---|---|---|---|---|---|
| 30% | 70 | 3,067 | 3,067 | 3,100 | 60 |
| 50% | 50 | 1,880 | 1,880 | 1,900 | 40 |
| 60% (o pote do slide) | 40 | 1,583 | 1,583 | 1,600 | 30 |
| 90% | 10 | 1,089 | 1,089 | 1,100 | 0 |
| 97% | 3 | 1,018 | 1,018 | 1,028 | 0; quem abriu leva 3 |
| 99% | 1 | 0,999 | 1,000; quem abriu leva 9 | 1,009 | 0; quem abriu leva 1 |

Quatro consequências, na ordem em que pesam.

**Em A e em B, quem paga é quem acerta.** O prêmio encolhe em 1% do pote. Dizer que o 1% "sai do lado perdedor" não
muda isso: quem perde já perde tudo, e o que se tira do lado perdedor é tirado do prêmio de quem ganhou.

**Em A, acima de 98,89% do pote num lado, quem acerta recebe menos do que pôs.** O limiar é
`1 ÷ (1 + 0,01 ÷ 0,89)`. Acontece quando o lado perdedor é menor que 1,12% do vencedor. Na última linha da tabela,
com 99% no lado vencedor, cada 1 USDC volta como 0,999. É raro e é pequeno, mas quebra a frase do slide, "Winners
get their money back, plus the rest", e a decisão do fundador de que ninguém perde por acertar. O desenho B existe
para fechar esse caso: a parte de quem abriu nunca passa de 90% do lado perdedor, e quem acerta recebe pelo menos o
que pôs.

**O custo de quem entra sobe.** Em A e B, um pote meio a meio perde 6%: 5 da taxa do Brot e 1 de quem abriu. A
faixa do setor vai de 1,9% a 5% (INFERÊNCIA, seção 3.3). E, em pote desigual, quem abriu ganha tanto quanto o Brot,
ou mais: o 1% do pote equivale a 2% do lado perdedor no meio a meio, a 10% no 90 a 10, igual à taxa do Brot, e a
20% no 95 a 5.

**Em C, quem paga é o Brot.** Quem acerta recebe o que o slide de receita promete, e a receita do Brot cai cerca de
1 ponto do pote em quase todo formato: de 5,0% para 4,0% no meio a meio e de 1,8% para 0,8% no 90 a 10. Em pote
muito desigual o Brot fica com zero. O efeito no caixa está na Parte 2, seções 4.4 e 5.4.

**Entrar nos dois lados do próprio mercado não compensa em A.** Quem abre um mercado e põe 500 em cada lado recebe
950 de 1.000. Em C, num pote muito desigual, a mesma manobra sai de graça, o que permite inflar volume sem custo.

**Proposta, aguardando decisão: o desenho B.** Não custa receita ao Brot e mantém "quem acerta nunca recebe menos
do que pôs". O preço é dizer, sem rodeio, que o prêmio de quem acerta encolhe em 1% do pote, e ajustar o exemplo
do slide de receita para 950 nos mercados que têm essa parte. Ficam em aberto, na mesma decisão: se o 1% incide
sobre o prêmio do patrocinador (seção 3.7) e se a equipe, quando abre um mercado, fica com ele (seção 4.1).

### 3.5 Pote de um lado só e mercado anulado

**Pote de um lado só** é o mercado em que só um lado recebeu entradas. Não há perdedor para pagar o vencedor, então
o pote devolve as entradas, qualquer que seja o resultado.

**Decisão.** "apenas o primeiro apostador tem proteção contra taxa". A primeira carteira a entrar não paga nada, e
as demais pagam 1% do que puseram. O motivo: cobrar de todos puniria justamente quem o lançamento mais precisa, que
é quem entra primeiro num mercado vazio.

Exemplo. Ana abre o pote com 100 USDC no SIM. Bruno põe 200 no SIM e Carla, 300. Ninguém entra no NÃO.

| Carteira | Entrou com | Taxa | Recebe de volta |
|---|---|---|---|
| Ana, a primeira | 100 | 0 | 100 |
| Bruno | 200 | 2 | 198 |
| Carla | 300 | 3 | 297 |

O Brot fica com 5 USDC. É por causa desta regra que o roteiro do pitch evita a frase "quem acerta sempre ganha":
aqui não há ganho para ninguém.

**Mercado anulado** é um terceiro resultado, além de SIM e NÃO: o mercado não pôde ser decidido. Serve para três
casos: a conta que seria lida deixou de poder ser lida; a janela de leitura foi perdida por falha do serviço; ou a
equipe, na revisão de 6 horas, concluiu que a leitura estava errada (seção 4.5).

**Decisão.** Mercado anulado devolve tudo, sem taxa: "talvez seja a única forma de devolvermos tudo sem cobrarmos
taxa". Quem entrou com 100 recebe 100. O precedente é o PancakeSwap Prediction, também um pote, que devolve 100%
quando a rodada é cancelada (FATO, documentação do PancakeSwap).

**Decisão: o prêmio do patrocinador nesses dois casos.** O prêmio volta inteiro ao patrocinador ("ok"). A taxa de
marketing segue a causa: o Brot fica com ela no pote de um lado só, porque a divulgação foi entregue, e a devolve no
mercado anulado por falha da plataforma. A regra é a da v0.0.2, com 10% no lugar de 30%.

**O que o pitch deixou sem regra.** Duas perguntas nasceram com a criação aberta. No pote de um lado só e no
mercado anulado, quem abriu recebe o 1%? E os 0,02 SOL voltam? **Proposta, aguardando decisão:** nada para quem
abriu nos dois casos, porque não houve prêmio a repartir, e a taxa de abertura não volta, porque devolvê-la
enfraquece a barreira contra mercados de lixo.

### 3.6 Fechamento

Fechamento é o momento em que as entradas param, antes da data final, para ninguém entrar já sabendo o resultado.

**Por que um pote precisa fechar antes.** Numa bolsa, quem compra tarde paga caro. Num pote não há preço: quem
entra no último minuto recebe o mesmo retorno de quem arriscou desde o primeiro dia, e dilui essa pessoa. Exemplo:
o pote tem 500 no SIM e 500 no NÃO; falta uma hora e o fato não aconteceu, então o NÃO é quase certo. Quem está no
NÃO desde o começo receberia 1,90 por dólar. Um oportunista põe 5.000 no NÃO. A taxa é 50 e sobram 5.950 para os
5.500 do NÃO. Ele recebe 5.409,09, um lucro de 409,09 quase sem risco, e quem estava no NÃO passa a receber 1,082
por dólar.

**Decisão: uma regra só.** "um fechamento só, porém vamos sim permitir perguntas acima de 30 dias, limitados a 90
no mvp". As entradas fecham quando faltam 5% da duração do mercado, com mínimo de 24 horas e máximo de 7 dias. Nos
mercados de fato que não volta atrás, como uma queima, as entradas também travam no instante em que o fato acontece.

| Duração do mercado | Fecha no dia | Dias sem entrada no fim |
|---|---|---|
| 3 dias | 2,0 | 1,0 |
| 7 dias | 6,0 | 1,0 |
| 14 dias | 13,0 | 1,0 |
| 30 dias | 28,5 | 1,5 |
| 60 dias | 57,0 | 3,0 |
| 90 dias | 85,5 | 4,5 |

**Quem escolhe a duração.** Na v0.0.2 era a equipe. Com a criação aberta, é quem abre o mercado. **Proposta,
aguardando decisão (decisão 15):** de 3 a 90 dias. O teto de 90 já é decisão. O piso de 3 dias era a recomendação
da v0.0.2 para a equipe e vira regra do programa: num mercado de dois dias, sobra um dia para entrar e um dia parado.

**Decisão: a opção avançada, só para a equipe.** Fechamento com menos de 24 horas exige a assinatura de uma segunda
pessoa da equipe, registrada na rede. O fundador a quer para que, "para situações de apostas curtas a gente possa
trabalhar com valores menores do que 24h", e disse quando entra: quando houver fluxo de gente, "do contrário a gente
morre de termos baixas apostas apenas por termos baixo fluxo".

### 3.7 Patrocínio: 90% de prêmio, 10% de taxa de marketing

Patrocinador é o projeto que põe dinheiro no mercado sobre a própria meta. O slide de patrocínio mostra o caminho
em quatro passos:

1. **O projeto fixa uma meta** que a rede consegue medir: "burn 100M tokens by Nov 30".
2. **Ele patrocina o mercado** sobre essa meta.
3. **A comunidade escolhe um lado**, SIM ou NÃO.
4. **A rede resolve o resultado.**

Na fala: "É marketing que se prova sozinho." Hoje a promessa de um projeto vive numa publicação e ninguém cobra. No
mercado, ela ganha data, dinheiro dos dois lados e uma resposta lida na rede.

**Decisão do pitch.** "From $500. 90% becomes the prize pool. 10% is a marketing fee." O patrocínio começa em 500
dólares. Do valor pago, 90% viram prêmio no pote e 10% ficam com o Brot, como taxa de marketing. A regra da v0.0.2,
em que a plataforma ficava com 30% do valor pago, está revogada. O slide fecha com outra regra: "Every market runs
inside the same on-chain rules". O mercado patrocinado segue as regras de qualquer outro (seção 4.2).

| Valor pago | Vira prêmio (90%) | Taxa de marketing (10%) |
|---|---|---|
| 500 | 450 | 50 |
| 1.500 | 1.350 | 150 |
| 5.000 | 4.500 | 500 |

Só a primeira linha está no pitch. Os valores de 1.500 e 5.000 eram as faixas da v0.0.2 e ficam aqui como tamanhos
supostos, para as contas. **Proposta, aguardando decisão:** 500 como piso, sem faixas fixas.

**Decisão: duas formas de entrar no pote**, à escolha do patrocinador. O exemplo usa um pote com 10.000 USDC em
entradas, 6.000 no SIM e 4.000 no NÃO. Sem patrocínio, o SIM paga 1,600 por dólar e o NÃO, 2,350.

- **Prêmio neutro** é dinheiro somado ao pote sem escolher lado. Aumenta o retorno de quem acertar, qualquer que
  seja o resultado. Com um patrocínio de 1.500, o prêmio é de 1.350: o SIM passa a pagar 1,825 e o NÃO, 2,688. Com
  a divisão antiga eram 1,775 e 2,613. O prêmio neutro não paga a taxa do pote, porque só o lado perdedor é base
  dela.
- **Entrada com selo** é o dinheiro do patrocinador entrando num lado, como uma entrada grande, com o nome dele. O
  efeito é outro. Na conta da v0.0.2, 3.500 USDC postos no SIM baixam o SIM de 1,600 para 1,379 e sobem o NÃO para
  3,138. Quem escolheu o mesmo lado do patrocinador ganha menos; quem escolheu o outro ganha mais, se acertar. Se
  o lado dele perder, esse dinheiro entra na base da taxa como qualquer outro.

**O risco: quem controla o resultado entrar nele.** O projeto decide sozinho se cumpre a meta. Exemplo: o público
põe 1.000 no SIM e 1.000 no NÃO. O patrocinador, escondido, põe 5.000 no NÃO e não queima. Ele recebe 5.750: lucro
de 750, tirado de quem escolheu o SIM. Polymarket e Kalshi proíbem por escrito que negocie quem pode influenciar o
resultado (FATO, regras de integridade das duas plataformas, 2026).

**Decisão.** O fundador escolheu três travas ("vamos de alternativas 1, 3 e 4"): o patrocinador pode não ser
divulgado ao público, mas a equipe sabe quem é; o mercado traz o aviso "o patrocinador pode controlar o resultado e
pode ter escolhido um lado"; e quem não mostra o nome só entra com prêmio neutro. A ferramenta que esconde o
pagador é o Cloak, um serviço de privacidade em Solana, que só esconde bem valores pequenos (Parte 4, seção 2.2).
Há uma tensão a registrar: o pitch vende o projeto mostrando a própria promessa, e um patrocinador que se esconde é
o contrário disso. O caso passa a ser a exceção.

**O que sai.** A v0.0.2 tinha o pedido de pergunta: o patrocinador descrevia o mercado, deixava o pagamento travado
e esperava a resposta da equipe. Com a criação aberta, o pedido perde a função. **Proposta, aguardando decisão:** o
projeto abre o próprio mercado e deposita o prêmio na mesma hora.

**O que o pitch deixou em aberto.** Três pontos, todos **Proposta, aguardando decisão**:

- **As contrapartidas.** A v0.0.2 listava selo, texto, destaque na página inicial, publicações no X e relatório,
  em quantidades por faixa. Com 10%, um patrocínio de 500 deixa 50 dólares para o Brot, que não pagam quatro
  publicações. A proposta: selo, nome e link em todos; publicações e destaque combinados caso a caso.
- **Patrocinar um mercado aberto por outra pessoa.** O slide mostra o projeto no próprio mercado. Não diz se ele
  pode pôr prêmio num mercado que outra carteira abriu.
- **O 1% de quem abriu sobre o prêmio.** Num pote de 10.000 com prêmio de 4.500, o 1% seria de 145, dos quais 45
  viriam do prêmio. A proposta: o 1% incide só sobre as entradas, nunca sobre o prêmio.

### 3.8 Parceiros de lançamento

**Decisão**, confirmada pelo pitch: "Launch partners: 20–30 projects get one market free." O fundador vai "convidar
parceiros da rede para entrar como patrocinador ... sem que eles tenham a obrigação de pagar qualquer coisa, isso
para fins de marketing". Em troca, eles "nos entregam publicidade e postagem nas suas redes sociais".

A regra decidida: um mercado grátis por parceiro, com destaque de 72 horas na página inicial, em troca de duas
publicações do parceiro para a própria comunidade. Vale para os 30 primeiros.

Duas ressalvas. **Não há parceiro fechado até a data deste documento.** O slide de crescimento mostra "7 of 30" com
sete marcas inventadas e a etiqueta "example"; é ilustração. E a consequência decidida continua valendo: a receita
de patrocínio do primeiro ano fica perto de zero.

### 3.9 Indicação

Indicação é o programa em que um usuário traz outro e os dois ganham algo.

**Decisão**, confirmada pelo pitch: "Referrals, day one: 20% of the fee, for 90 days."

- **Quem indica** recebe 20% da taxa que o Brot de fato recebeu das entradas vencedoras do indicado, durante 90
  dias. Só as vencedoras contam porque a taxa é descontada do ganho: uma entrada só gera taxa quando ganha.
- **O indicado** recebe de volta a taxa cobrada sobre os primeiros 50 USDC, depois de completar 250 USDC em
  entradas, com **teto de 5 USDC**.
- O dinheiro sai do fluxo de taxas. Não há caixa próprio nem verba separada.

Exemplo. Bia indica o Caio. Em 90 dias, o Caio entra com 1.000 USDC. A taxa descontada dos ganhos dele soma 37, que
é a média de 3,70% do volume usada na Parte 2 (INFERÊNCIA). Bia recebe 20% disso, 7,40. O Caio passou dos 250 e
recebe de volta a taxa dos primeiros 50, que na média é de 1,85. O Brot fica com 27,75. Na média, o programa custa
0,74% do volume indicado, mais a devolução.

**Por que devolução com teto, e não isenção.** Com isenção, quem abrisse uma carteira nova a cada 50 dólares nunca
pagaria taxa. E, sem teto, 50 USDC num lado pequeno que ganha geram uma devolução alta: 45 USDC no exemplo da
v0.0.2.

**Indicar a si mesmo.** É possível, e a resposta pronta do pitch admite: sem cadastro não há como impedir. O ganho
tem teto: "20% de desconto na própria taxa por 90 dias, mais uma devolução de até 5 dólares".

**"Day one".** O slide não diz de qual dia. A v0.0.2 decidiu que o beta abre sem indicação. **Proposta, aguardando
decisão:** "day one" é o primeiro dia na rede principal (Parte 4, seção 3.3).

### 3.10 Pagamento automático; a saída antecipada, guardada

**Decisão**, confirmada pelo pitch: "Auto payout. No claim button." O fundador comparou com o líder: "na polymarket
ele vai direto pro teu saldo, não faz sentido ter botão de claim". Resolvido o mercado e passada a janela de 6
horas, o serviço da plataforma envia a cada carteira a parte dela. O mesmo vale para as devoluções da seção 3.5.

Duas consequências práticas:

- **A plataforma paga a taxa de rede de cada envio.** É pouco: 0,000005 SOL por transação, de modo que mil
  transações custam 0,005 SOL (FATO, relatório técnico de out/2026; a soma é INFERÊNCIA).
- **A conta de USDC de quem ganhou precisa existir.** Se a pessoa a fechou depois de entrar, o envio falha, e o
  valor fica reservado em nome dela.

O serviço que paga não escolhe quem recebe nem quanto: os valores saem do registro das entradas e do resultado
gravado. Se o serviço parar, o pagamento atrasa, e o dinheiro continua no cofre.

**Saída antecipada. Decisão.** "Neste mvp vamos trabalhar sem possibilidade de saída." Sair antes do fim e receber
parte do dinheiro fica para a fase 2. O motivo: não foi encontrado nenhum pote que devolva dinheiro do próprio cofre
a quem sai (FATO do agente de pesquisa: ausência em pesquisa, out/2026), e uma penalidade fixa esvazia o prêmio de
quem acertou. A fórmula que o fundador aprovou para estudo está na v0.0.2, P1 §3.6: a penalidade começa em 5%,
cresce com o tempo e com a queda da chance do lado de quem sai, e para em 90%.

## 4. Mercados e resolução

### 4.1 Quem abre um mercado

Um mercado é uma pergunta com resposta SIM ou NÃO, uma data final e uma regra de como se decide. Exemplo: "A oferta
do token T cai para 900 milhões até o dia 30?".

**Decisão do pitch.** "Anyone can open a market, pump.fun style. 0.02 SOL to open a market. Inside the rules. Only
markets the chain can answer." Qualquer carteira abre um mercado, pagando 0,02 SOL, desde que ele seja de um tipo
que a rede consegue responder. Na fala: "não é só projeto que abre mercado. Qualquer um abre." A regra da v0.0.2,
em que só a equipe abria, está revogada.

O caminho, passo a passo:

1. **Abertura.** Quem abre escolhe um tipo da lista (seção 4.2), a conta da Solana que será lida, a meta e a data
   final. Paga 0,02 SOL.
2. **Conferência.** O programa confere, na hora, se aquela conta serve para aquele tipo. Se não serve, o mercado
   não abre. Na v0.0.2 havia ainda a conferência de uma segunda pessoa da equipe; agora quem confere é o programa.
3. **Entradas**, até o fechamento (seção 3.6).
4. **Resolução**, pelo serviço agendado (seção 4.4). O mercado pode se resolver antes da data. **Decisão.** "Se
   acontecer algo antes da data marcada, ela pode sim se resolver." Se a queima prometida acontece no dia 10, o
   mercado resolve no dia 10.
5. **Janela de 6 horas** (seção 4.5) e **pagamento automático** (seção 3.10). No pagamento, quem abriu recebe a
   parte dele (seção 3.4).

**Para que servem os 0,02 SOL.** Na fala: "Os 0,02 SOL seguram o lixo." Abrir 1.000 mercados sem sentido custa 20
SOL. Para quem abre a sério, a taxa se paga quando o pote passa do equivalente a 2 SOL, porque 1% disso são os
0,02. A taxa também cobre o custo do mercado na rede: 0,02 SOL pagam 4.000 transações (FATO sobre o preço da
transação, seção 3.10; a divisão é INFERÊNCIA), e o cofre de USDC de cada mercado pede cerca de 0,002 SOL de
aluguel, que é o depósito que a Solana exige para manter uma conta aberta (FATO, v0.0.2, P4 §4.5). O aluguel da
conta do próprio mercado não foi medido.

**O que o pitch não diz: para onde vão os 0,02 SOL.** **Proposta, aguardando decisão:** ficam com o Brot, sem
devolução, descontado o aluguel das contas.

**O projeto abre o próprio mercado.** Não há mais um caminho separado para o patrocinador. Ele abre como qualquer
carteira e deposita o prêmio (seção 3.7).

**A equipe também abre?** O pitch não diz. **Proposta, aguardando decisão:** abre, para haver mercado de preço no
primeiro dia, e não fica com o 1% dos mercados que abre. Nesses mercados o 1% fica com quem acertou, e o exemplo do
slide de receita, com 960 para os vencedores, é exato.

**O que sai.** Os dois ciclos da v0.0.2 e a página de sugestões pelo X: quem tem uma ideia de mercado abre.

### 4.2 Dentro das regras: o que o programa aceita

"Inside the rules" é a parte da frase que segura o resto. Sem ela, o produto vira um mercado de opinião, igual aos
que o slide do problema critica. Esta seção diz o que as regras são.

Cada tipo de mercado precisa de um leitor (seção 2.3). Sem leitor, o tipo não existe. Algumas palavras antes da
tabela.

- **Oferta** é a quantidade total de um token. **Queima** é destruir tokens para sempre, reduzindo a oferta.
- **Pool de negociação** é o cofre em que um token é trocado por outro. **Liquidez travada** é dinheiro posto numa
  pool e travado para sempre. A Meteora é uma das plataformas de pools da Solana.
- **Validador** é um computador que confirma as transações da rede. **Stake** é o SOL que as pessoas confiam a ele.
  **Pool de staking** é um cofre que junta o SOL de muita gente e o distribui entre validadores.
- **Época** é o "dia" da Solana para contas de stake; dura cerca de dois dias.
- **Oráculo de preço** é um serviço em que corretoras e formadores de mercado publicam preços assinados, que o
  programa confere dentro da rede. O do Brot é a Pyth.

**Decisão**, de 5/10/2026: o site abre com cinco tipos. São os mesmos exemplos do pitch: o mercado de preço lido da
Pyth e a queima estão na demo, e a frase de elevador cita "a burn, locked liquidity or staked SOL".

| Tipo | O que pergunta | Exemplo | Quem consegue empurrar o resultado |
|---|---|---|---|
| Preço de ativo grande | O preço encosta num alvo dentro do prazo? | "O SOL toca 300 dólares até o dia 30?" | Ninguém: é o mercado inteiro do ativo |
| Queima de oferta | A quantidade total do token cai até um número? | "A oferta do token T cai para 900 milhões até o dia 30?" | Quem tem o token e o queima. Custa o valor do token queimado |
| Liquidez travada na Meteora | Uma pool tem pelo menos X de liquidez travada para sempre? | "A pool T/SOL chega a X de liquidez travada até o dia 30?" | Quem põe liquidez e trava. O dinheiro fica preso |
| Tamanho de pool de staking | A pool tem pelo menos X SOL no começo de uma época? | "O JitoSOL começa a época E com X SOL ou mais?" | Quem deposita. O dinheiro precisa atravessar a virada da época |
| Stake de validador | O validador tem pelo menos X SOL confiados a ele numa época? | "O validador V entra na época E com X SOL ou mais?" | Quem confia SOL ao validador antes de a época virar |

Dois avisos sobre os tipos. No mercado de preço, a modalidade é a de **toque**: dá SIM se o preço encostar no alvo
em qualquer momento do prazo, e toda entrada exige um preço fresco, para ninguém entrar depois de o preço já ter
tocado o alvo. Em 4 de outubro de 2026 a Pyth tinha 1.881 preços, 423 deles de cripto (FATO, consulta direta). E
os mercados de época dependem do serviço agendado: a janela para ler dura cerca de dois dias.

**O que muda com a criação aberta.** Na v0.0.2, a pergunta que separava os tipos era "alguém consegue decidir o
resultado sem gastar nada?", e quem a aplicava era a equipe, caso a caso. Com qualquer carteira abrindo, o critério
precisa virar código. O mínimo, todo ele **Proposta, aguardando decisão** (decisão 15; os itens 3 e 4 são também
as decisões 13 e 7):

1. **Só os cinco tipos.** O programa recusa qualquer outro.
2. **A conta é conferida na criação**, como a v0.0.2 já previa.
3. **Sem texto livre.** O site monta a frase a partir do tipo, da conta, da meta e da data. Com texto livre, quem
   abre escreve uma coisa e o programa lê outra, e quem entra confia na frase.
4. **Uma lista de contas aceitas** nos tipos em que isso importa: os preços da Pyth, os tokens e as pools.
5. **Duração de 3 a 90 dias** (seção 3.6).
6. **Taxas fixadas pelo programa.** Quem abre não escolhe a taxa nem a própria parte.

**O furo que a lista de contas fecha.** Na v0.0.2, a defesa contra quem empurra um resultado era a equipe só abrir
metas que custassem caro. Essa defesa some. Exemplo: alguém cria um token sem valor, abre o mercado "a oferta cai
para X até o dia 30?", espera entradas no NÃO e queima os próprios tokens, de graça. "Queimar custa dinheiro" só
vale para token que vale dinheiro. Com stake é parecido: o SOL não se perde, só muda de lugar por um tempo.

**Proposta, aguardando decisão:** o mercado de preço pela Pyth abre para qualquer carteira desde o início, porque
ninguém controla o preço de um ativo grande. Nos outros quatro tipos, só entram contas de uma lista mantida pela
carteira de várias assinaturas, com teto por mercado. O custo é claro: nesses tipos, "qualquer um abre" passa a
valer só para os tokens, as pools e os validadores da lista.

**Quem abriu pode ter um lado.** É o risco do patrocinador não divulgado (seção 3.7), agora sem ninguém
identificado. Sem cadastro não há como proibir. **Proposta, aguardando decisão:** permitir, com um aviso automático
nos tipos em que dá para empurrar: "quem abriu pode controlar o resultado e pode ter escolhido um lado".

### 4.3 O que fica fora

**Decisão: o que uma única chave decide de graça.** Chave é a senha que dá a alguém um poder sobre um token ou um
programa: criar tokens novos, congelar carteiras, alterar o código. Renunciar é abrir mão desse poder para sempre.
Ficam fora quatro tipos: renúncia de emissão, renúncia de congelamento, programa imutável e metadados imutáveis. O
dono da chave decide o resultado sem gastar nada e pode entrar antes, por outra carteira. A conta: o pote tem 3.000
no SIM e 7.000 no NÃO, e o dono da chave põe 3.000 no SIM pouco antes do fechamento. Ele usa a chave, o mercado
resolve SIM e ele recebe 6.150: lucro de 3.150, sem risco. O fundador decidiu: "sim, vamos seguir a alternativa
proposta".

**Tokens do padrão novo.** Na Solana há dois programas de token: o clássico e o novo, chamado Token-2022, que os
tokens recentes do pump.fun usam: 7 de 7 na amostra lida na rede em 3 de outubro de 2026 (FATO, amostra pequena).
Os leitores que existem só aceitam o clássico; diante de um token novo, recusam (FATO, repositório). A queima entra,
no primeiro dia, só para tokens do padrão clássico. É um limite sério para um produto que se compara ao pump.fun:
os tokens de lá, hoje, ficam fora.

**Decisão: tokens travados** ficam fora no primeiro dia ("ok"), pelo mesmo limite do padrão clássico.

**Decisão: preço de token pequeno, em três degraus.** Numa pool pequena, o preço é a divisão entre duas reservas e
pode ser movido por um instante, com dinheiro emprestado e devolvido na mesma transação. Já aconteceu em Solana: no
caso Mango, em outubro de 2022, a retirada foi de 114 a 116 milhões de dólares (FATO, denúncias dos reguladores
americanos SEC e CFTC). Os degraus aceitos ("vamos seguir a proposta alternativa recomendada"): primeiro, ativos
com preço num oráculo, que é o tipo da tabela; depois, tokens com pool na Raydium ou na Meteora, pela média do
preço num período; por último, tokens que só existem na pool do pump.fun. Os detalhes estão na v0.0.2, P1 §4.3.

**Fora por desenho: opinião.** Geopolítica, política e tudo o que depende de alguém dizer o que aconteceu. É a
decisão de origem do produto e a resposta pronta do pitch: "Não existe mercado de opinião."

**Esportes: fase 2.** Resultado de jogo não nasce na rede; alguém precisa publicar. O fundador quer, "numa fase 2
criarmos um oráculo específico pra isso". É a categoria que as regras brasileiras citam pelo nome (Parte 4, seção
6.1).

### 4.4 Como o mercado se resolve

1. Cada mercado nasce apontando para uma conta da Solana. Conta é o lugar em que a rede guarda um dado: o registro
   de um token, o estado de uma pool, um preço assinado.
2. Na resolução, o programa abre essa conta, lê o número e compara com a meta.
3. Se a meta foi cumprida, grava SIM. Se a data final passou sem a meta, grava NÃO. Ninguém informa nada.

O resultado sai do dado, e não de quem acionou a leitura. **Decisão do pitch.** "Anyone can re-check. Same account,
same answer": qualquer pessoa abre a mesma conta e vê o mesmo número.

**Decisão: quem aciona.** Um serviço agendado, que é um programa de computador que acorda de tempos em tempos e
faz uma tarefa sozinho. Ele confere a cada minuto se algum mercado já pode ser resolvido. O site não tem botão
público de resolver ("Sobre o botão resolver, esquece").

**Prazo vencido é NÃO.** O programa não tem como saber depois em que dia a meta foi cumprida. Exemplo: a queima
acontece no dia 10, o serviço está fora do ar e ninguém aciona a leitura. No dia 30 o prazo vence e o resultado
gravado é NÃO. Quem acertou perderia tudo. Por isso o serviço não pode falhar.

**Decisão: dois serviços.** O segundo roda em outro provedor e vigia o principal a cada 5 minutos. Com 10 minutos
sem resposta, tenta religá-lo, até 3 vezes. Se não religar, assume a resolução, a cada 5 minutos, e manda email ao
CTO ("o segundo assume o cron e envia notificação para o cto saber que tem um sistema down"). Por trás dos dois
ficam a janela de 6 horas e o resultado "Anulado". Quanto custa vigiar muitos mercados abertos por terceiros não
foi medido (Parte 4, seção 4.5).

### 4.5 A janela de 6 horas e a disputa

**Decisão.** Depois de resolvido, o mercado "fica travado por cerca de 6h em aguardo de alguém da equipe revise e
confirme que a resolução foi correta, liberando o pagamento". Três regras:

- **A equipe só confirma ou anula.** Ela "pode só confirmar ou anular". Não existe a opção de inverter. Anular
  devolve a cada um o que pôs.
- **Se ninguém revisar, o pagamento sai sozinho** "ao fim das 6h". O dinheiro nunca depende de alguém da equipe
  estar acordado.
- **No MVP, só a equipe aciona a contestação.** Qualquer pessoa avisa por um canal público.

**Decisão: a disputa em duas etapas**, sem voto por token, porque "é justamente neste ambiente que ocorre a
manipulação dos resultados".

| Passo | O que acontece | Prazo |
|---|---|---|
| Gatilho | Um aviso de contestação pausa o pagamento. No MVP só a equipe aciona; depois, qualquer carteira que entrou no mercado, com um depósito | Dentro das 6 horas |
| Etapa 1: segunda fonte | O mesmo dado é lido de novo por um caminho independente. Se confirma, o pagamento sai. Se diverge, sobe | Até 1 hora |
| Etapa 2: revisão humana | Três membros da equipe examinam; decide o acordo de dois. Só confirmam ou anulam, e o motivo é publicado | Até 48 horas |

Três limites: não há voto por token; a equipe nunca inverte um resultado; e, no pior caso, o pagamento sai 55 horas
depois da resolução.

**O conflito com o pitch. Decisão do pitch.** O slide de solução diz "No human in the loop. The program reads the
account", e a fala, "Sem votação, sem chave da empresa, sem IA". A janela é uma pessoa no caminho, e anular exige
uma chave da equipe.
Ao pé da letra, a frase tira a janela e a etapa 2 da disputa. A consequência seria esta: uma leitura errada é paga
sem volta, e a falha dos dois serviços ao mesmo tempo, que faz um SIM virar NÃO, fica sem proteção.

O pitch não cita a janela, e por isso este plano a mantém, como decisão de 5/10/2026 que o pitch não revogou.
**Proposta, aguardando decisão:** manter a janela até a auditoria, como freio que só devolve, e trocar a frase por
"no human picks the winner": nenhuma pessoa escolhe o vencedor. Essa frase o produto cumpre.

### 4.6 Como falamos disso

O fundador pediu frases "num sentido mais marketeiro e agradável de ler, sem ser mentira". O pitch deu as três que
abrem qualquer texto.

- **A frase de elevador**, aprovada em 7/10/2026: "Brot Markets is a prediction market built as a growth engine for
  on-chain projects. You pick a milestone the blockchain can measure, like a burn, locked liquidity or staked SOL,
  and sponsor a market on it. Your community takes sides, talks about it and shares it. At the deadline, the chain
  itself reads the result and pays the winners. No votes, no judges. Your milestone becomes a campaign that proves
  itself."
- **A frase da capa:** "Prediction markets the chain resolves."
- **O lema:** "Proof > Promises". Na fala: "É prova, não promessa."

**O que trocamos e por quê.**

| Em vez de | Dizemos | Por quê |
|---|---|---|
| "Aposte" | "Entre", "escolha um lado" | É a linha do pitch, que não usa "bet" em nenhum slide |
| "No human in the loop" | "Nenhuma pessoa escolhe o vencedor" | A equipe pode anular e pausar (seção 4.5). Proposta |
| "Só ganhamos do lado perdedor" | "A taxa do pote sai só do lado perdedor" | Há taxa de marketing, taxa de abertura e o 1% do pote de um lado só |
| "Quem acerta sempre ganha" | "Quem acerta recebe o seu de volta e mais a parte dele no resto" | Em pote de um lado só não há ganho; no desenho A, acima de 98,89%, quem acerta recebe menos |
| "Compartilhe para entrar" | "Cada mercado vira um cartão para postar no X" | "Share to take a side" é um cartão, e não uma condição para entrar |
| "Sem oráculo" | "Resultado lido direto da rede" | O mercado de preço usa um oráculo, a Pyth, conferido na rede |
| "Pago em minutos" | "Pago sozinho, ao fim da janela de 6 horas" | Existe a janela; com contestação, até 55 horas (seção 4.5) |
| "Ganhe 3 vezes" | "Retorno estimado agora: 3,10 por 1" | O retorno só fica definido no fechamento |

**O mascote.** Os documentos e a marca o chamam de Baked. Na fala do pitch ele é "o Cacetinho". **Proposta,
aguardando decisão:** Baked na escrita e Cacetinho como apelido falado.

**Enquanto o produto estiver na devnet**, toda tela e toda publicação dizem: "Estamos em fase de testes. Aqui se
entra com USDC de teste, que não vale dinheiro."

## 5. Decisões e pontos abertos

### 5.1 O que o pitch decidiu

| Assunto | O que passa a valer | Seção |
|---|---|---|
| Quem abre | Qualquer carteira, por 0,02 SOL, dentro das regras | 4.1 |
| Quem abriu | Fica com 1% do pote | 3.4 |
| Patrocínio | A partir de 500 dólares; 90% de prêmio e 10% de taxa de marketing | 3.7 |
| O projeto | É o cliente, e vem primeiro | 2.2 |
| Palavras | "Mercado", "entrar", "escolher um lado"; frase de elevador, capa e lema | 4.6 |

As dez decisões de 5/10/2026 continuam valendo (v0.0.2, P1 §5.1): o pitch não revogou nenhuma. Uma delas, a disputa
em duas etapas, com revisão humana, entra no conflito com "No human in the loop" (seção 4.5).

### 5.2 O que espera decisão do fundador

Os números de 1 a 14 são os da revisão de impacto (`_review/bp-impact-review-v0.0.3.md`, seção 6). A 15 junta as
regras mínimas de criação, que a revisão propôs sem número. As de 16 a 19 tocam a construção (Parte 4, capítulo 8).

| Nº | Decisão | Recomendação | Seção |
|---|---|---|---|
| 1 | De onde sai o 1% de quem abriu | Desenho B: do prêmio, com teto | 3.4 |
| 2 | Para onde vão os 0,02 SOL | Para o Brot, sem devolução, descontado o aluguel | 4.1 |
| 3 | Valores acima de 500 e contrapartidas | 500 como piso, sem faixas; selo, nome e link em todos | 3.7 |
| 4 | O pedido de pergunta com resposta em 14 dias | Sai | 3.7 |
| 5 | "No human in the loop" e a janela | Manter a janela; trocar a frase | 4.5 |
| 6 | A equipe abre mercados? Fica com o 1%? | Abre, sem o 1% | 4.1 |
| 7 | Tipos em que dá para empurrar, abertos a todos | Lista de contas aceitas e teto por mercado; o preço abre a todos | 4.2 |
| 9 | "Referrals, day one" | "Day one" é o primeiro dia na rede principal | 3.9 |
| 10 | O 1% sobre o prêmio, no anulado e no pote de um lado só | Só sobre as entradas; nada nos dois casos | 3.5, 3.7 |
| 11 | O nome do mascote | Baked na escrita; Cacetinho na fala | 4.6 |
| 13 | Texto livre no mercado | Não | 4.2 |
| 14 | Quem abriu escolhendo lado | Permitir, com aviso automático | 4.2 |
| 15 | As regras mínimas de criação | Só os cinco tipos; conta conferida na abertura; de 3 a 90 dias; taxas fixadas pelo programa | 3.6, 4.2 |

### 5.3 O que a pesquisa não encontrou

- Evidência de que a criação aberta traz volume. Os dois casos conhecidos apontam para o outro lado (Parte 2,
  seção 3.2).
- Quanto custa criar um token no pump.fun, para sustentar a comparação do slide.
- O aluguel da conta de um mercado, e portanto quanto dos 0,02 SOL sobra.
- A mistura real de mercados, de que a receita depende.
- Um pote que devolva dinheiro do próprio cofre a quem sai antes do fim.
- Quantas pessoas reais há por trás das 80 milhões de carteiras do pump.fun.

