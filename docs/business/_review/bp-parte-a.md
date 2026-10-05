## 1. Sumário executivo

### 1.1 O que é o Baked Market

O Baked Market é um mercado de previsão: um lugar em que pessoas apostam dinheiro no resultado de uma pergunta sobre
o futuro. Ele roda na Solana, a blockchain escolhida para o produto, e é feito para quem já usa carteira de
criptomoedas. Três decisões do fundador definem o que ele é.

**Decisão.** É um mercado de previsão, e não uma recompensa paga por meta cumprida, que é o que o código atual faz:
"ele foi montado errado, não é essa a proposta dele ... queremos que seja um mercado de previsão".

**Decisão.** Cada pergunta tem uma pool (pote): o cofre em que entram todas as apostas daquela pergunta. As apostas
vão para o lado SIM ou para o lado NÃO. No fim, quem acertou divide o que sobrou depois da taxa. Não há preço
garantido na hora da aposta.

**Decisão.** O resultado sai da leitura de um dado gravado na própria blockchain (on-chain), que qualquer pessoa
pode conferir. Nas palavras dele: "eu quero trabalhar com oráculo, mas um que possa resolver onchain, diferente das
questões abertas de geopolítica que depende um oráculo que claramente pode ser manipulado".

### 1.2 Para quem

**Decisão.** "queremos pessoal da web3." O acesso é "100% onchain da solana, via wallet, sem kyc": a pessoa entra só
com a carteira, sem identificação (sem KYC, que é a conferência de quem é o usuário, com documento).

Esse público existe em número. O pump.fun, a plataforma de Solana em que qualquer pessoa lança um token em minutos,
somava 80 milhões de carteiras únicas e mais de US$ 214 bilhões negociados desde a criação, com média de cerca de
US$ 347 milhões por dia (FATO SECUNDÁRIO, The Block, jun/2026). A mesma fonte mostra a queda de 2026: a receita
diária do pump.fun era de US$ 800 mil, contra US$ 4,8 milhões seis meses antes (FATO SECUNDÁRIO, The Block,
jun/2026). Carteira não é pessoa: quantas pessoas reais há por trás desses números não foi encontrado.

### 1.3 Como funciona, em um exemplo

Uma pergunta tem 300 USDC apostados no SIM e 700 no NÃO. USDC é a moeda digital que vale 1 dólar; é a moeda do
produto. O pote é de 1.000. A taxa de 3% tira 30 e sobram 970 para quem acertar.

- Se der SIM, cada 1 USDC apostado no SIM recebe 970 ÷ 300 = 3,23.
- Se der NÃO, cada 1 USDC apostado no NÃO recebe 970 ÷ 700 = 1,39.
- A "chance" que a tela mostra é a fatia do pote em cada lado: SIM 30%, NÃO 70%.

O retorno só fica definido quando as apostas fecham, porque cada aposta nova muda as fatias (ver seção 3.3).

### 1.4 Como ganha dinheiro

**Decisão.** A taxa é de 3% do pote. O critério dito pelo fundador: "vamos trabalhar dentro das taxas de mercado,
nem maior, nem menor."

**Decisão.** A taxa se divide em quatro partes iguais: "25% para um treasure btc da empresa, 25% para operação (não
deve ser todo o custo que foi estimado), 25% recompra e queima do nosso token em ico privado e, 25% para fundo de
prêmios".

**Decisão.** Há uma segunda fonte: o patrocínio de pergunta, em três faixas, de US$ 500, US$ 1.500 e US$ 5.000. O
patrocinador põe dinheiro numa pergunta e recebe contrapartidas de visibilidade (ver seções 3.7 e 7.4).

Uma consequência dessa divisão precisa estar à vista desde a primeira página: só um quarto da taxa paga as contas da
empresa. De cada US$ 100 apostados, US$ 3 são taxa e US$ 0,75 vão para a operação. Com as premissas de saída
antecipada do modelo financeiro, esse valor cai para US$ 0,64 (INFERÊNCIA, premissas sem dado; ver seções 7.3 e
9.2). É esse número, e não os 3%, que decide quanto volume o negócio precisa.

O plano prevê ainda dois tokens, um lançado no pump.fun e outro numa venda privada ("ICO privado", nas palavras do
fundador). Eles são a terceira trilha de dinheiro das pools e estão descritos no capítulo 8, sem nenhuma promessa
de preço ou de retorno.

### 1.5 O que já existe e o que falta

Existe um programa (o código que roda na Solana e guarda o dinheiro) publicado na rede de testes (devnet), a rede de
ensaio, com dinheiro de mentira. Ele tem 1.717 linhas, 138 testes, nove leitores on-chain e uma resolução que
qualquer pessoa pode acionar (FATO, repositório, 4/out/2026). Leitor on-chain é a parte do programa que abre uma
conta da Solana, lê um número ou uma chave e responde sim ou não, sem ninguém informar nada. Essa é a parte que se
aproveita.

Falta quase todo o resto. A parte econômica do programa atual segue o modelo antigo e sai; o programa de pote é
novo, estimado em 1.500 a 2.500 linhas (INFERÊNCIA, estudo de viabilidade, out/2026). O repositório se descreve
como protótipo de hackathon, na rede de testes e sem auditoria (FATO, repositório). Antes de receber dinheiro real
na rede principal (mainnet) faltam também a auditoria externa, a empresa, a avaliação jurídica e as decisões de
regra listadas no capítulo 16.

### 1.6 Os números do plano

A tabela resume o que as Partes B e C detalham. Dois pares de termos aparecem nela. **Sentido A e sentido B** são as
duas leituras da frase do fundador sobre o patrocínio ("70/30"): no A, 70% do valor fica com a banca (a empresa que
opera) e 30% vai ao pote; no B, o contrário. Ele ainda não disse qual vale. **Regime (a) e regime (b)** são duas
ordens para o destino da taxa: no (a), ela se divide em quatro desde o primeiro dia, como decidido; no (b), proposto
pela revisão crítica, as parcelas de Bitcoin e de recompra esperam em USDC e cobrem o déficit até a operação se
pagar (ver seção 9.5).

Tabela 1.1: o plano em números. Todas as linhas de projeção são INFERÊNCIA do modelo financeiro (out/2026), sobre
premissas sem dado de uso; valores em dólares.

| Item | Valor | Etiqueta |
|---|---|---|
| Taxa | 3% do pote | Decisão |
| Faixas de patrocínio | 500, 1.500 e 5.000 | Decisão |
| Parte de cada 100 apostados que paga a operação | 0,75 (0,64 com saída antecipada) | INFERÊNCIA |
| Volume apostado no mês 12 | Ruim: 45 mil. Razoável: 300 mil. Otimista: 1,5 milhão | INFERÊNCIA (premissa sem dado) |
| Receita total no mês 12 | Ruim: 1.148. Razoável: 9.400 (A) ou 8.400 (B). Otimista: 46.300 (A) ou 41.700 (B) | INFERÊNCIA |
| Volume mensal de equilíbrio com custo de 3.000 por mês | 470.588 no regime (a); 156.863 no regime (b) | INFERÊNCIA |
| Capital necessário, com reserva | 70 a 110 mil nos cenários razoável e otimista; 125 a 136 mil no ruim | INFERÊNCIA |
| Gasto antes do lançamento | 51.500 (faixa de 30 a 75 mil) | INFERÊNCIA; cotações **[A confirmar]** |
| Meta razoável de 90 dias | 150 mil apostados no total; 375 carteiras ativas no terceiro mês; 24 perguntas resolvidas, nenhuma errada | INFERÊNCIA |
| Régua de tamanho | O World, dentro da carteira Phantom, fez 15,44 milhões em setembro de 2026 | FATO SECUNDÁRIO (DefiLlama, set/2026) |

O cenário ruim não se paga em nenhum regime. E ele não é o piso: o piso é volume perto de zero (ver seção 9.3).

### 1.7 Os maiores riscos

A revisão crítica registrou 29 objeções a decisões do plano, 12 delas de severidade crítica. Todas aparecem em caixas
"Objeção registrada" nas seções em que a decisão é apresentada, e o quadro completo está no capítulo 14. As cinco
que pesam mais:

1. **A demanda não está demonstrada.** Ninguém mostrou que o público web3 quer apostar em fatos lidos on-chain
   (OBJ-01, seção 2.5).
2. **Quem controla o resultado pode apostar, inclusive anônimo.** Em parte das perguntas uma pessoa decide o
   resultado de graça (OBJ-02, seção 3.7; OBJ-03, seção 4.2).
3. **Só 0,64% do volume paga a operação.** A divisão da taxa em quatro multiplica por quatro o volume necessário
   (OBJ-09, seção 7.3).
4. **Brasil, jurisdição e identificação.** A equipe mora no país em que a regra contra o setor é mais recente, e
   não há empresa nem parecer (OBJ-17, OBJ-18 e OBJ-20, capítulo 15).
5. **Programa novo, sem auditoria, com a saída antecipada dentro.** É a peça mais nova e a menos testada (OBJ-04,
   seção 3.6; OBJ-26, seção 12.1).

### 1.8 Próximos passos

1. Revisão deste plano pelo fundador e versão v0.0.2, com análise de impacto de cada mudança.
2. Decisões pendentes de regra, que são 14 (lista na seção 16.1), a começar pelo sentido do "70/30", pela tabela do
   pote de um lado só, pelo destino da penalidade e pelo cardápio de perguntas do primeiro dia.
3. Consulta a advogado brasileiro com prática em cripto, antes de gastar com construção: enquadramento do pote,
   jurisdição, lista de países, patrocinador anônimo, tokens.
4. Acordo escrito com o sócio técnico, respostas às perguntas do briefing, prazo e dedicação; definição de quem
   guarda a chave de atualização (a carteira que pode trocar o código do programa) e de quem é a terceira chave do
   multisig (a carteira que só assina quando várias pessoas aprovam).
5. Teste de demanda: 10 a 15 conversas com o público-alvo, beta com pontuação e sem dinheiro, e três cartas de
   intenção de patrocinadores.
6. Três cotações de auditoria e orçamento de pré-lançamento.
7. Fase 1 do roteiro: o pote na rede de testes.

## 2. Problema e oportunidade

### 2.1 O problema: quem decide o resultado

Todo mercado de previsão precisa de alguém, ou de alguma coisa, que diga qual foi o resultado. É nesse ponto que o
setor acumula as queixas mais documentadas. Três casos mostram os três jeitos de errar; o capítulo 6 descreve cada
concorrente por inteiro.

**Votação.** A Polymarket, a maior plataforma on-chain, usa um oráculo com votação (o UMA). Oráculo é um serviço que
traz para dentro da blockchain um dado de fora dela. No UMA, alguém propõe o resultado deixando uma caução de cerca
de US$ 750; há 2 horas para contestar; se alguém contesta, detentores de um token votam, e o processo leva de 4 a 6
dias (FATO, documentação da Polymarket, 3/out/2026). Em 2026, até maio, mais de 1.150 mercados foram a arbitragem,
mais que em 2025 inteiro, e em cerca de 1 de cada 5 disputas um votante tinha posição no mercado julgado (FATO
SECUNDÁRIO, Wall Street Journal via Finance Magnates, mai/2026). Em março de 2025, um mercado de US$ 7 milhões foi
resolvido como SIM sem o fato ter ocorrido; um detentor votou com 25% dos votos, e não houve reembolso (FATO
SECUNDÁRIO, CoinDesk e outros, mar/2025). O token que dá direito a voto vale US$ 37,5 milhões no total, 99% abaixo
do topo de 2021 (FATO SECUNDÁRIO, CoinGecko, 4/out/2026), e decide mercados muito maiores do que ele. Mesmo onde o
resultado é um preço, houve problema: 821 contas ganharam US$ 8,2 milhões em janelas de liquidação provavelmente
manipuladas nos mercados de Bitcoin de 5 minutos, e 93% do prejuízo caiu sobre o varejo (FATO SECUNDÁRIO, CoinDesk,
ago/2026).

**Chave da empresa.** O World, o mercado de previsão que funciona dentro da carteira Phantom, se apresenta como
automático. Na rede, porém, uma chave da empresa cria os mercados e grava o resultado, e a instrução que grava não
leva prova nem oráculo (FATO SECUNDÁRIO, Chainstack Labs, 11/set/2026). O usuário confia em quem guarda a chave.

**Modelo de linguagem.** No PNP, em Solana, dois modelos de linguagem (Perplexity e Grok) decidem o resultado, com
uma organização de detentores de token de retaguarda, e o criador da pergunta pode nomear uma carteira como juiz
(FATO, documentação do PNP, out/2026).

**Decisão.** O fundador não quer nenhum dos três: "eu quero trabalhar com oráculo, mas um que possa resolver
onchain, diferente das questões abertas de geopolítica que depende um oráculo que claramente pode ser manipulado".

### 2.2 A oportunidade: fatos que a própria rede decide

Parte do que o público de cripto acompanha já está gravada na blockchain: a oferta total de um token, se uma chave
de controle foi abandonada, quanto dinheiro está travado numa pool de negociação. Um leitor on-chain é a parte do
programa que abre uma conta da Solana, lê um número ou uma chave e responde sim ou não, sem ninguém informar nada.
Exemplo: para a pergunta "a oferta do token T cai para 900 milhões até o dia 30?", o leitor de queima lê a oferta do
token e compara com a meta. Não há caução, não há prazo de contestação e não há juiz.

Nenhum dos cinco concorrentes analisados resolve por leitura direta de conta on-chain (INFERÊNCIA sobre os fatos
lidos na análise de concorrentes, out/2026; ver seção 6.7). A mesma análise faz quatro ressalvas, que este plano
adota: o diferencial é real em confiança; é um nicho em tamanho; não é escudo contra manipulação; e pode ser copiado
(ver seção 6.8).

O segundo diferencial vem do primeiro. Nas palavras do fundador: "sendo em oráculo on chain, e possibilitando você
abrir a questão de algo sobre si mesmo, você acaba criando uma forma de marketing". Um projeto que prometeu queimar
parte do próprio token pode patrocinar a pergunta sobre essa queima: o público aposta, a pergunta circula e o
cumprimento da promessa fica provado na rede. Nenhum dos cinco concorrentes vende patrocínio de pergunta com
contrapartida (INFERÊNCIA sobre os fatos lidos, out/2026). O mesmo desenho traz o risco mais sério do plano, que é
quem controla o resultado apostar nele; ele está na seção 3.7.

### 2.3 Por que agora

**A favor.**

- O setor cresceu. Em 30 dias, de 4/set a 3/out/2026, os mercados de previsão somaram US$ 81,8 bilhões em valor de
  face e US$ 21,7 bilhões em dólares pagos (FATO SECUNDÁRIO, DefiRate, out/2026). São duas réguas para a mesma
  atividade, explicadas na seção 5.1; a que se compara com um pote é a segunda. Na Polymarket, em dólares pagos, o
  mês passou de US$ 1,88 bilhão em nov/2025 para US$ 5,95 bilhões em jun/2026 e US$ 4,63 bilhões em set/2026 (FATO
  SECUNDÁRIO, DefiLlama, set/2026).
- O rival mais parecido não lançou. O Melee, também um pote em Solana, captou US$ 3,5 milhões em set/2025 (FATO
  SECUNDÁRIO) e tem 49.247 pessoas na fila de espera (FATO, site do Melee, 4/out/2026), mas ainda não opera com
  dinheiro real: o beta roda em rede de teste (FATO SECUNDÁRIO, fio de usuário republicado pela KuCoin em
  9/set/2026; não é comunicado oficial) **[A confirmar]**.
- Quem tem a melhor distribuição ainda é pequeno. O World fez US$ 15,44 milhões em set/2026 (FATO SECUNDÁRIO,
  DefiLlama, set/2026).

**Contra, com o mesmo peso.**

- O público-alvo encolheu em 2026. A receita diária do pump.fun caiu de US$ 4,8 milhões para US$ 800 mil em seis
  meses, e a taxa de formatura (a parcela dos tokens que vende toda a curva inicial e passa a ser negociada numa
  pool comum) estava em 0,26%, contra cerca de 1,4% no histórico (FATO SECUNDÁRIO, The Block e Dune, jun/2026).
- Plataformas menores perderam quase todo o volume quando o incentivo acabou: Opinion caiu 80,7% e Myriad 93,8% do
  primeiro para o segundo trimestre de 2026 (FATO SECUNDÁRIO, Predictefy, 2026); a Limitless caiu 96% entre maio e
  setembro de 2026 (INFERÊNCIA sobre dados do DefiLlama; causa não encontrada).
- A regulação apertou em 2026, no Brasil e fora dele (ver capítulo 15).

A janela existe se a demanda existir. É essa condição que a seção 2.5 trata.

### 2.4 O que o Baked Market propõe

A proposta cabe em três frases. Um pote simples por pergunta, em que quem acerta divide o dinheiro de quem errou. Um
resultado verificável on-chain, pago em minutos e sem disputa. E o patrocínio de pergunta como segunda trilha de
dinheiro para o pote e como ferramenta de marketing para quem patrocina.

Isso muda o que o programa atual faz. O programa atual responde à pergunta "como pagar alguém para cumprir uma meta
on-chain"; o fundador quer responder a outra: "como deixar o público web3 apostar em fatos que a própria rede
decide".

Tabela 2.1: programa atual contra Baked Market (FATO, briefing do modelo de pote, 3/out/2026).

| | Programa atual | Baked Market |
|---|---|---|
| Quem põe o dinheiro primeiro | O patrocinador, com um orçamento | Os apostadores |
| Preço | SIM a preço fixo, escolhido pelo patrocinador | Não há preço: há a fatia de cada lado no pote |
| Limite de compra | O orçamento limita o SIM subsidiado | Nenhum, por decisão (ver OBJ-22, seção 3.3) |
| Lado NÃO | Só de forma indireta | Aposta direta, igual ao SIM |
| Posição do usuário | Tokens de SIM e de NÃO | Um registro por apostador, sem token |
| Receita | Nenhuma no código | Corte de 3% do pote e patrocínio |

O fundador viu o defeito do modelo antigo ao usar o aplicativo: sem pool de negociação, a "chance" exibida era só o
preço que o patrocinador tinha digitado. As perguntas dele na primeira rodada de ideação apontam o mesmo: por que há
limite de compra, quem fixa os preços e por que criar um token para cada lado.

### 2.5 O que ainda não está provado

A demanda é hipótese, não premissa. O que a pesquisa achou:

- Nenhum mercado aberto sobre queima, renúncia de chave, trava de liquidez ou formatura de tokens de terceiros foi
  encontrado em qualquer plataforma (FATO, ausência em busca limitada, out/2026). O agente que pesquisou fez a
  ressalva: "A ausência pode ser falta de procura ou falta de ferramenta; não dá para distinguir".
- Todos os mercados sobre o pump.fun na Polymarket somaram cerca de US$ 262,81 mil no total, e são sobre o token
  PUMP, não sobre fatos de tokens de terceiros (FATO SECUNDÁRIO, fonte fraca, Cryptorank, sem data) **[A
  confirmar]**.
- Quantas pessoas reais usam o pump.fun por dia, quanto cada carteira aposta e com que frequência: não encontrado em
  nenhuma fonte. Os perfis de usuário da seção 5.4 são hipótese; nenhuma entrevista foi feita.

Uma conta dá a ordem de grandeza. Se o Baked Market capturasse todo o volume que a Polymarket já teve em mercados
ligados ao pump.fun, a taxa de 3% renderia 262.810 × 0,03 = US$ 7.884. Esse é o total, não o valor por mês
(INFERÊNCIA da revisão crítica).

> **Objeção registrada OBJ-01 · severidade crítica**
>
> **Decisão do fundador:** resolução só por dado on-chain, para o público web3 ("queremos pessoal da web3").
>
> **O que a revisão crítica achou:** ninguém demonstrou que esse público quer apostar em fatos lidos on-chain. O
> plano inteiro (finanças, roteiro, tokens) supõe uma demanda que nenhum dado sustenta.
>
> **Evidência:** a pesquisa de público não achou nenhum mercado aberto sobre queima, renúncia, trava ou formatura em
> nenhuma plataforma e escreveu "demanda direta pelo recorte: não demonstrada" (FATO, ausência em busca limitada,
> out/2026).
>
> **Alternativa proposta:** testar antes de reescrever o programa. Dez a quinze conversas com o público-alvo, com a
> pergunta "em qual destas dez perguntas você poria 20 dólares hoje?"; um beta com pontuação e sem dinheiro, usando
> os leitores que já existem, para medir quais tipos de pergunta atraem carteiras; depois, quatro semanas de potes
> com teto baixo. O critério de continuar ou parar é escrito antes do teste.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

## 3. O produto

### 3.1 As três trilhas de dinheiro

**Decisão.** Cada pergunta tem uma pool (pote), e o mesmo pote recebe dinheiro por três trilhas: as apostas, o
patrocinador e o token.

**Primeira trilha: as apostas.** Qualquer carteira põe um valor no lado SIM ou no lado NÃO. Aposta é o valor que uma
carteira põe num lado; fica registrado em nome dela. É a trilha principal: sem ela não há pote.

**Segunda trilha: o patrocinador.** É quem paga uma das três faixas (US$ 500, 1.500 ou 5.000) para pôr dinheiro
numa pergunta e receber contrapartidas de visibilidade. O produto do patrocínio está na seção 3.7; a conta de quanto
vai para a banca e quanto vai para o pote, na seção 7.4.

**Terceira trilha: o token.** O plano tem dois tokens. O primeiro é lançado no pump.fun, como marketing. O segundo é
desenhado pela empresa e vendido numa venda privada ("ICO privado", nas palavras do fundador). A ideia de que parte
do dinheiro do token alimente os potes vale para o segundo: "isso só vamos conseguir fazer com base em nosso próprio
token ico privado". Tudo sobre os tokens está no capítulo 8.

O que o produto **não** tem, também por decisão:

- **Tokens de SIM e de NÃO.** "o que precisamos fazer é o registro do voto por dinheiro comprado por cada votante, e
  apenas isso". A posição do apostador é um registro dentro do programa, não um token que circula.
- **Preço travado.** "Sem preço travado, vamos trabalhar com o que é 'normal' do mercado, e pensar em um ou dois
  diferenciais". O apostador não compra a um preço; ele entra numa divisão.
- **Rendimento do pote.** "esquece o rendimento do pote, vamos abandonar isso, não serve de nada." O dinheiro fica
  parado no cofre até a resolução.

**Decisão.** A moeda é o USDC, a moeda digital que vale 1 dólar: "A moeda vai ser usdc, vamos abandonar a ideia de
sol." Apostar 100 USDC é apostar 100 dólares.

### 3.2 O ciclo de uma pergunta

Pergunta é uma frase com resposta SIM ou NÃO, uma data final e uma regra de como se decide. Exemplo: "A oferta do
token T cai para 900 milhões até o dia 30?".

**Decisão.** Há dois ciclos de pergunta. "na realidade existem dois ciclos de perguntas, a primeira é da equipe
montando as perguntas". No primeiro, a equipe abre a pergunta por conta própria: "vamos deixar que a equipe abra as
perguntas". No segundo, um patrocinador pede uma pergunta.

Os passos do primeiro ciclo:

1. **Abertura.** A equipe escolhe um tipo de pergunta do cardápio (seção 4.5), a conta da Solana que será lida, a
   meta, a data final e a data de fechamento das apostas. O programa confere, já na criação, se aquela conta serve
   para aquele tipo de pergunta.
2. **Apostas.** Qualquer carteira aposta em SIM ou em NÃO, quantas vezes quiser. O programa guarda o total de cada
   lado e quanto cada apostador pôs em cada lado.
3. **Fechamento.** As apostas param na data de fechamento (seção 3.5), ou antes, no instante em que o fato acontece.
4. **Resolução.** Alguém aciona a leitura; o programa lê a rede e grava o resultado, de forma definitiva (capítulo
   4). **Decisão:** a pergunta pode ser resolvida antes da data: "Se acontecer algo antes da data marcada, ela pode
   sim se resolver."
5. **Resgate.** Quem acertou retira a sua parte do pote, já descontada a taxa.

No segundo ciclo, o patrocinador pede a pergunta e deixa o pagamento travado. **Decisão:** "ele pode solicitar uma
pergunta, e travar o pagamento até a nossa equipe revisar ... se for recusado devolve a grana travada." Aceita a
pergunta, ela segue os mesmos cinco passos. O patrocinador também pode entrar numa pergunta que a equipe já abriu.

A revisão técnica propõe três regras para o pedido travado, que não mudam a decisão e evitam dinheiro preso
(proposta, não decidida): o aceite abre a pergunta e aplica o dinheiro na mesma transação, ou não acontece; a recusa
só libera o saque, e quem saca é o próprio patrocinador; e, se a equipe não responder em 14 dias, o patrocinador
cancela sozinho e recupera tudo.

O público participa de outro jeito: sugere perguntas pelo X (seção 3.8).

**Em aberto.** O fundador disse: "acho justo que quem criar possa ganhar uma parte da pergunta." Hoje só a equipe
cria; a regra para quem sugere ou pede não foi definida (ver seção 16.1).

### 3.3 A conta do pote

Pote é o cofre de uma pergunta: todas as apostas entram nele e, no fim, quem acertou divide o que sobrou depois da
taxa. Ele existe porque dispensa duas coisas que os líderes do setor precisam ter: alguém vendendo a um preço e
profissionais oferecendo liquidez. No pote, o prêmio de quem acerta é o dinheiro de quem errou.

O exemplo-base deste plano, usado em todos os capítulos (conta sobre as decisões do fundador):

| | Lado SIM | Lado NÃO |
|---|---|---|
| Apostado | 300 USDC | 700 USDC |
| Chance mostrada na tela (fatia do pote) | 30% | 70% |
| Pote total | 1.000 | 1.000 |
| Taxa de 3% | 30 | 30 |
| Sobra para quem acertar | 970 | 970 |
| Se este lado ganhar, cada 1 USDC recebe | 970 ÷ 300 = 3,23 | 970 ÷ 700 = 1,39 |
| Quem apostou 100 recebe | 323,33 | 138,57 |

Dois termos saem daí. **Chance** é a fatia do pote que está em cada lado, mostrada na tela; não é preço nem
probabilidade garantida. **Retorno** é quanto cada 1 USDC apostado recebe se o lado ganhar.

Duas consequências precisam estar na tela antes de a pessoa assinar.

**O retorno só fica definido quando as apostas fecham.** No pote do exemplo, entram mais 700 no SIM. O pote passa a
1.700, sobram 1.649 depois da taxa, e cada 1 USDC do SIM passa a receber 1.649 ÷ 1.000 = 1,65. Antes eram 3,23.
Quem apostou vendo 3,23 não tem esse número garantido (INFERÊNCIA, conta conferida).

**Uma aposta grande baixa o retorno do próprio lado.** Um pote com 5.000 de cada lado paga 1,94 por dólar. Quem põe
10.000 no SIM faz o pote ir a 20.000 e o SIM passar a pagar 0,97 × 20.000 ÷ 15.000 = 1,29 (INFERÊNCIA, conta
conferida). O apostador grande derruba o próprio prêmio.

A revisão de produto propõe que a tela mostre o retorno como "estimativa", sempre depois da taxa, e que o usuário
informe na própria transação o pior retorno que aceita.

**Decisão.** O pote não tem limite de compra. A revisão crítica pede um limite de segurança:

> **Objeção registrada OBJ-22 · severidade alta**
>
> **Decisão do fundador:** pote "sem limite de compra".
>
> **O que a revisão crítica achou:** toda pergunta precisa de um teto de pote, isto é, um valor máximo que a
> pergunta aceita, fixado na criação, para o prêmio nunca valer mais que o custo de forçar o resultado.
>
> **Evidência:** quem consegue forçar o resultado ganha, no máximo, o pote do lado oposto. Onde forçar é barato, um
> pote grande é convite: completar a curva de um token do pump.fun nos últimos 10% custa 2,16 SOL (FATO, medição do
> sócio técnico, citada no relatório técnico de out/2026).
>
> **Alternativa proposta:** aceitar o teto como regra de segurança e dizer que "sem limite" vale abaixo do teto.
> Teto por pergunta (por exemplo, uma pergunta de queima com teto de 5.000 USDC) e teto total do programa no período
> inicial.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.4 Pote de um lado só

Pote de um lado só é a pergunta em que só um lado recebeu apostas. Não há perdedor para pagar o vencedor.

**Decisão.** Nesse caso o pote devolve as apostas, cobrando a taxa: "Podemos devolver cobrando taxa, sim. A banca
nunca perde, e nem a igreja faz caridade sem cobrar."

Exemplo (conta conferida): Ana põe 100 no SIM e ninguém aposta no NÃO. Ela recebe 97. Em escala maior: dez pessoas
põem 2.000 no SIM e ninguém entra no NÃO. A taxa é de 60 (15 para cada uma das quatro parcelas) e cada dólar
apostado volta como 0,97.

A decisão cobre o caso simples. Com prêmio de patrocinador e com penalidades de saída dentro do pote, sobram casos
sem regra, e caso sem regra num programa é dinheiro preso. A tabela abaixo é a proposta da revisão técnica.

**Em aberto.** O fundador precisa decidir as quatro linhas (ver seção 16.1).

| Caso | Proposta |
|---|---|
| Só o lado vencedor tem apostas | Devolve menos a taxa; prêmio neutro e penalidades vão a esses vencedores |
| Só o lado perdedor tem apostas (ninguém acertou) | Devolve menos a taxa; o prêmio neutro volta ao patrocinador; as penalidades vão ao fundo de prêmios |
| Ninguém apostou e há prêmio neutro | O prêmio volta ao patrocinador |
| O lado vencedor ficou vazio porque todos saíram antes | Igual à segunda linha |

Prêmio neutro é o dinheiro que o patrocinador soma ao pote sem escolher lado (seção 3.7). Penalidade é a parte da
aposta que quem sai antes deixa para trás (seção 3.6). Fundo de prêmios é a reserva da banca, alimentada por 25% da
taxa (seção 7.5).

> **Objeção registrada OBJ-08 · severidade alta**
>
> **Decisão do fundador:** pote de um lado só devolve cobrando taxa.
>
> **O que a revisão crítica achou:** a taxa pune o primeiro apostador, que é quem o lançamento mais precisa. Quem
> entende a regra espera os outros entrarem; se todos esperam, o pote fica vazio.
>
> **Evidência:** cem potes de US$ 200 de um lado só rendem US$ 150 à operação (100 × 200 × 3% × 25%; INFERÊNCIA). E
> a referência de mercado dos 3%, o PancakeSwap Prediction, devolve 100% na rodada cancelada, sem taxa (FATO,
> documentação).
>
> **Alternativa proposta:** manter a cobrança com valor reduzido (1% ou um valor fixo pequeno), ou zero durante o
> lançamento; e decidir a tabela completa dos casos de um lado só.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.5 Fechamento das apostas

Fechamento é o momento em que as apostas param, antes da data final, para ninguém entrar já sabendo o resultado.

**Por que um pote precisa fechar antes.** Numa bolsa, quem compra tarde paga caro. Num pote não há preço: quem entra
no último minuto recebe o mesmo retorno de quem arriscou desde o primeiro dia, e dilui essa pessoa. Exemplo
(INFERÊNCIA, conta conferida): o pote tem 500 no SIM e 500 no NÃO; falta uma hora e o fato não aconteceu, então o
NÃO é quase certo. Quem está no NÃO desde o começo receberia 1,94 por dólar. Um oportunista põe 5.000 no NÃO. Ele
recebe 5.290,91, um lucro de 290,91 quase sem risco, e os apostadores antigos do NÃO passam a receber 1,058 por
dólar. Quem correu o risco ficou com as sobras.

**Decisão.** As apostas fecham quando passam 80% da duração da pergunta, e nunca menos de 24 horas antes da data
final. Uma pergunta de 30 dias fecha no dia 24. Prazo menor que 24 horas só como "opção avançada", "com um double
cheque para confirmar e log da operação de quem aprovou".

O programa atual já ajuda num ponto: nas perguntas de fato irreversível, as apostas travam sozinhas no instante em
que o fato acontece. O fechamento por data cuida do outro lado, o NÃO ficando certo conforme o prazo acaba.

**Como a opção avançada pode funcionar** (proposta técnica): a pergunta com fechamento curto só é criada com duas
assinaturas de pessoas diferentes da equipe; quem aprovou fica gravado na própria pergunta e num evento on-chain; e
a tela mostra um selo "fechamento curto". Um detalhe pesa aqui: o programa atual mede prazo em blocos da rede, cujo
tempo varia (235 milissegundos medidos na rede de testes, contra 400 nominais; FATO, repositório). Uma regra de "24
horas" pede relógio de verdade, e o programa novo deve guardar data e hora.

**Em aberto.** Sobre perguntas longas, o fundador disse: "ainda temos que pensar para acima de 2-3 meses se 80% não
é muito longo, e pode ser gradual." Numa pergunta de 180 dias, a regra dos 80% deixa 36 dias sem apostas. A pesquisa
técnica propõe, para essas perguntas e para uma fase posterior, dois marcos no lugar de um:

- **T1**, o fim das apostas livres: quando faltam 20% da duração, limitado a no máximo 14 dias antes do fim.
- **T2**, o fechamento total: quando faltam 5% da duração, com mínimo de 24 horas e máximo de 7 dias.

Entre T1 e T2 ainda se aposta, mas cada lado só pode crescer 25% sobre o tamanho que tinha em T1, e ninguém sai.

| Duração | Regra decidida (80%): fecha no dia | Dias fechados pela regra decidida | T1 | T2 | Dias fechados na proposta |
|---|---|---|---|---|---|
| 7 dias | 5,6 | 1,4 | dia 5,6 | dia 6,0 | 1,0 |
| 30 dias | 24,0 | 6,0 | dia 24,0 | dia 28,5 | 1,5 |
| 90 dias | 72,0 | 18,0 | dia 76,0 | dia 85,5 | 4,5 |
| 180 dias | 144,0 | 36,0 | dia 166,0 | dia 173,0 | 7,0 |

Para perguntas de até 70 dias, T1 cai exatamente nos 80% decididos. Com o teto de 25%, o oportunista do exemplo
acima só consegue pôr 125 no NÃO, e os apostadores antigos recebem 1,746 em vez de 1,058 (INFERÊNCIA, conta
conferida). A revisão de segurança discorda dessa proposta para a primeira versão, porque o teto cria uma corrida de
robôs para ocupá-lo. A discordância está na caixa abaixo.

> **Objeção registrada OBJ-21 · severidade alta**
>
> **Decisão do fundador:** fechamento a 80% da duração, com mínimo de 24 horas; a regra para perguntas longas está
> em aberto.
>
> **O que a revisão crítica achou:** o mínimo de 24 horas trava as perguntas curtas, que são o que esse público
> aposta; e perguntas longas não cabem na primeira versão.
>
> **Evidência:** concorrentes operam perguntas de preço de cripto com prazos de 5 minutos a 1 semana (FATO,
> documentação dos concorrentes, out/2026). Com 24 horas fechadas, uma pergunta de dois dias fica um dia aberta e
> um dia parada, e uma pergunta de um dia só existe pela opção avançada, com duas assinaturas a cada vez.
>
> **Alternativa proposta:** aprovar uma vez, por duas chaves, um modelo de série curta (por exemplo, "o SOL toca X
> em 24 horas") e deixar o serviço abrir as rodadas; na primeira versão, um fechamento só e perguntas de até 30
> dias; a regra gradual dos dois marcos fica para as perguntas longas, depois.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.6 Saída antecipada

Saída antecipada é desistir da aposta antes da resolução e receber parte do dinheiro de volta. A parte que fica para
trás é a penalidade.

**Decisão.** A saída entra na primeira versão: "saída antes da resolução, vamos fazer agora no mvp." A forma: "a
pessoa pode sair antes com ganho proporcional menor, ou perca proporcional maior, deixando uma penalidade pro pote."

**O que os outros fazem** (FATO, documentação de cada um, lida em out/2026):

| Onde | Dá para sair antes? | Como |
|---|---|---|
| PancakeSwap Prediction, corridas de cavalo, Melee (versão alfa) | Não | Quem entrou fica até o fim |
| Melee (modelo novo) | Sim | Um cofre separado, de investidores, compra a posição com desconto |
| Casas de aposta | Sim | A própria casa recompra a aposta |
| Polymarket, Kalshi, Limitless | Sim | Vende-se a posição a outro usuário |

Em todos os casos, sair significa alguém assumir o lugar de quem sai. Um pote que devolve dinheiro do próprio cofre,
cobrando penalidade, não apareceu em nenhum precedente (FATO do agente de pesquisa: ausência em pesquisa, out/2026).
O desenho do fundador é novo, e por isso os números abaixo não têm referência de mercado.

**Por que uma penalidade fixa não basta.** O prêmio de quem acerta é o dinheiro de quem errou. Se quem errou pode
pegar o dinheiro de volta quando percebe que vai perder, o prêmio some. No pote de 300 no SIM e 700 no NÃO, o NÃO
receberia 1,386 por dólar se ninguém saísse. Se todo o SIM sai pagando penalidade fixa (INFERÊNCIA, conta
conferida):

| Penalidade fixa | Retorno do NÃO se todo o SIM sair |
|---|---|
| 5% | 0,991: quem acertou perde dinheiro |
| 10% | 1,012 |
| 20% | 1,053 |
| 30% | 1,095 |
| 50% | 1,178 |

**A fórmula proposta.** A pesquisa técnica propõe uma penalidade que cresce com o tempo e com a queda da chance do
lado de quem sai (INFERÊNCIA; os parâmetros não têm referência de mercado e dependem de simulação) **[A
confirmar]**:

```text
devolução   = aposta × (1 − penalidade)
penalidade  = mínimo( 90% ,  5%  +  20% × tempo  +  queda )
tempo       = fração já decorrida da janela de saída (0 na abertura, 1 quando a saída fecha)
queda       = 1 − chance do seu lado na saída ÷ chance do seu lado na sua entrada   (zero se a chance subiu)
```

Em palavras: os 5% fixos são um pedágio, para ninguém entrar e sair de graça. O tempo encarece a saída conforme o
fim se aproxima, porque a saída tardia é a mais informada. A queda cobra de quem sai o estrago que a própria saída
faz na chance do lado dele. A saída fecha junto com as apostas e trava no instante em que o fato acontece.

Exemplos, no pote de 300 no SIM e 700 no NÃO (INFERÊNCIA, contas conferidas):

| Situação | Tempo | Queda | Penalidade | Recebe de cada 100 |
|---|---|---|---|---|
| Aposta pequena (10 dos 300) sai cedo | 25% | 1,2% | 11,2% | 88,83 |
| Ana (100 dos 300) sai cedo | 25% | 12,3% | 22,3% | 77,72 |
| Ana sai na metade da janela | 50% | 12,3% | 27,3% | 72,72 |
| Ana sai quase no fim da janela | 90% | 12,3% | 35,3% | 64,72 |
| A chance do lado dela subiu, sai na metade | 50% | 0 | 15,0% | 85,00 |

A Ana paga 12,3% de queda sem notícia nenhuma porque ela é um terço do lado: a saída dela, sozinha, derruba a
chance do SIM. Quem é pequeno paga quase só o pedágio e o tempo.

**O que a tela mostra.** O valor antes de assinar: "Sair agora devolve 77,72 dos seus 100,00. Penalidade de 22,3%."
O número muda a cada dia e a cada aposta alheia, e por isso a transação leva o valor mínimo que o usuário aceita.

**O que a fórmula não resolve.** Numa fuga em massa, sobra de cerca de um terço a 63% do prêmio, conforme a ordem em
que as pessoas entraram (INFERÊNCIA). Quando uma aposta muito grande entra contra um apostador, a penalidade dele
pode ir a 80% ou 90% sem que ele tenha feito nada. E há um furo de segurança no destino da penalidade, tratado na
seção 11.6 junto com a fórmula revista (piso de 10%, penalidade marcada por lado, espera mínima em horas).

**Em aberto.** A banca cobra os 3% também sobre o valor devolvido a quem sai? O modelo financeiro supõe que não
(ver seção 9.2).

> **Objeção registrada OBJ-04 · severidade crítica**
>
> **Decisão do fundador:** saída antecipada na primeira versão.
>
> **O que a revisão crítica achou:** a saída é a peça mais nova e mais perigosa do programa e não deve nascer ligada
> em todas as perguntas.
>
> **Evidência:** não há precedente de pote que devolva dinheiro a quem sai; os parâmetros da fórmula não têm
> referência de mercado; e a revisão no papel já achou seis furos antes de qualquer simulação (INFERÊNCIA, revisão
> técnica e de segurança, out/2026).
>
> **Alternativa proposta:** escrever e testar a saída na primeira versão, mas com uma chave por pergunta, que nasce
> desligada. Ligar pergunta a pergunta, começando por potes pequenos, depois de simulação com apostadores
> estratégicos e de revisão externa dessa instrução.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

> **Objeção registrada OBJ-06 · severidade alta**
>
> **Decisão do fundador:** quem sai antes pode sair "com ganho proporcional menor".
>
> **O que a revisão crítica achou:** num pote puro não existe ganho para realizar antes do fim. A fórmula proposta
> entrega a "perca proporcional maior" e a "penalidade pro pote"; o ganho, não.
>
> **Evidência:** quando o lado fica mais provável, o prêmio dele encolhe na mesma medida. Com o pote em 300 no SIM e
> 700 no NÃO, uma aposta de 100 no SIM "vale" 30% × 323 = 97. Entra dinheiro no SIM e o pote vai a 600 e 700: a
> chance sobe para 46%, o retorno cai para 2,10 e a aposta "vale" 46% × 210 = 97 (INFERÊNCIA, conta conferida).
>
> **Alternativa proposta:** na primeira versão, saída só com devolução e penalidade, dito na tela que ela nunca dá
> lucro. O ganho na saída fica para uma fase posterior, pela venda da posição a outra pessoa, que é o que os
> precedentes fazem.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.7 O patrocinador

Patrocinador é quem paga uma das três faixas para pôr dinheiro numa pergunta e receber contrapartidas.

O próprio fundador começou em dúvida ("sigo com a dúvida se há necessidade de um sponsor, e se sim, para qual
razão?") e respondeu a ela ao longo da ideação: o patrocinador põe prêmio no pote ("Assim você até provocava um
aumento da tvl da pool") e usa a pergunta como marketing de si mesmo. O produto, nas palavras dele, "segue sendo um
mercado para negociar probabilidade, mas mascarado com esse marketing de fomo como ferramenta da própria empresa."

**Decisões.**

- Três faixas: US$ 500, US$ 1.500 e US$ 5.000.
- O patrocinador pode pedir uma pergunta, com o pagamento travado (seção 3.2), ou entrar numa pergunta já aberta
  pela equipe.
- Ele escolhe entre duas formas: prêmio neutro ou aposta de patrocinador.
- Pode ficar anônimo, e o anônimo escolhe qualquer das duas formas: "o patrocinador anônimo pode escolher uma das
  duas formas, sim."
- Recebe contrapartidas. As listadas (selo, destaque, posição fixa, pote mínimo garantido, texto na pergunta,
  publicação no X) "são aceitáveis".
- A página inicial pode ser organizada por patrocínio: "a curadoria pode ser por situação de destaque e/ou pump de
  marketing via sponsor".

**Em aberto.** A divisão do valor pago. A frase do fundador foi: "70/30 dessa grana vai pra banca e a outra parte
pra liquidez como neutra ou aposta de patrocinador". Não ficou dito se os 70% são da banca ou do pote. Este plano
mostra os dois sentidos em toda conta (aritmética direta):

| Faixa | Sentido A: banca | Sentido A: pote | Sentido B: banca | Sentido B: pote |
|---|---|---|---|---|
| US$ 500 | 350 | 150 | 150 | 350 |
| US$ 1.500 | 1.050 | 450 | 450 | 1.050 |
| US$ 5.000 | 3.500 | 1.500 | 1.500 | 3.500 |

A receita de cada sentido e os preços que o mercado pratica por visibilidade estão na seção 7.4.

**As duas formas, com números.** O pote de exemplo do patrocínio tem US$ 10.000 em apostas, 6.000 no SIM e 4.000 no
NÃO. Sem patrocinador, o SIM paga 1,617 por dólar e o NÃO, 2,425.

- **Prêmio neutro** é dinheiro somado ao pote sem escolher lado; aumenta o retorno de quem acertar, qualquer que
  seja o resultado. Com 1.050 de prêmio (a faixa de US$ 1.500 no sentido B), o SIM passa a pagar 1,786 e o NÃO,
  2,680 (INFERÊNCIA, conta conferida). Os dois lados ganham.
- **Aposta de patrocinador** é o dinheiro entrando num lado, como uma aposta grande, com selo. O efeito é outro. Num
  pote com 1.000 em cada lado, cada lado paga 1,94. Se o patrocinador põe 5.000 no SIM, o pote vai a 7.000, sobram
  6.790, o SIM passa a pagar 1,13 e o NÃO, 6,79. No pote de 10.000, uma aposta de 3.500 no SIM (a faixa de US$ 5.000
  no sentido B) faz o SIM pagar 1,378 em vez de 1,617, e, se der SIM, o patrocinador recebe 4.824 de volta
  (INFERÊNCIA, contas conferidas).

A leitura da pesquisa: quem apostou no mesmo lado do patrocinador ganha menos, e o patrocinador que acerta recupera
quase tudo (pagou 5.000 e recebeu 4.824). Isso é uma aposta com selo, não um prêmio. As contas supõem que a taxa de
3% incide também sobre o dinheiro do patrocinador que entra no pote, o que não foi decidido.

**Contrapartidas por faixa** (proposta da pesquisa de monetização; prazos e quantidades não foram decididos):

| | Faixa 1: US$ 500 | Faixa 2: US$ 1.500 | Faixa 3: US$ 5.000 |
|---|---|---|---|
| Pergunta | Entra numa já aberta | Entra ou pede uma, sujeita a aprovação | Pede pergunta sob medida, sujeita a aprovação |
| Selo "Patrocinado por X" (ou "Anônimo") | Sim | Sim | Sim |
| Texto na pergunta | Nome e link | Nome, link e uma frase | Nome, link, frase e imagem |
| Destaque na página inicial | Não | 72 horas | Posição fixa no topo durante a janela de apostas |
| Publicação no X, rotulada como parceria paga | 1 | 2 | 4 e fio de resultado |
| Relatório ao fim | Não | Volume e número de carteiras | Volume, carteiras, impressões e cliques |

**Anônimo e quem controla o resultado.** "Anônimo" é a palavra da decisão; o que a ferramenta de privacidade de fato
esconde está na seção 3.9. Sobre quem controla o resultado apostar, o fundador respondeu "Sim e não", e esclareceu:
"O sim e o não é a resposta à pergunta que foi criada e diz respeito a n empresa ... sobre qualquer coisa que seja
verificável onchain." Perguntado se quem coloca prêmio pode apostar: "Sim." **Decisão:** não há proibição.

> **Objeção registrada OBJ-02 · severidade crítica**
>
> **Decisão do fundador:** o patrocinador pode ficar anônimo, escolhe qualquer das duas formas, e quem controla o
> resultado da pergunta não é impedido de apostar.
>
> **O que a revisão crítica achou:** anônimo, que controla o resultado e aposta num lado, é a combinação que os
> líderes do setor proíbem. É informação privilegiada oferecida como produto.
>
> **Evidência:** Polymarket e Kalshi proíbem por escrito que negocie quem pode influenciar o resultado (FATO, regras
> de integridade das duas plataformas, 2026). Exemplo com números (INFERÊNCIA, conta conferida): a equipe de um
> token pede a pergunta "o token X queima 10% da oferta até o dia 30?" e decide sozinha se queima. O público põe
> 1.000 no SIM e 1.000 no NÃO. O patrocinador, anônimo, põe 5.000 no NÃO e não queima. O pote é de 7.000; a taxa,
> 210; sobram 6.790 para os 6.000 do NÃO. O patrocinador recebe 5.658: lucro de 658, tirado de quem apostou no SIM.
>
> **Alternativa proposta:** da mais leve à mais dura. (1) Anônimo para o público e identificado para a equipe. (2)
> Declaração assinada pela carteira de que o patrocinador não controla a conta lida pela pergunta. (3) Aviso na
> pergunta: "o patrocinador pode controlar o resultado e pode ter apostado". (4) Anônimo só com prêmio neutro. (5)
> Aposta de lado só em perguntas que ninguém controla, como preço de ativo grande. (6) Regra pública de que a
> equipe não aposta.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.8 Sugestões pelo X

**Decisão.** O público sugere perguntas pelo X. O site terá uma página com "um monitor vindo do X, e orientação da
galera como eles podem fazer para fazer as sugestões".

Há duas formas de trazer o X para o site, com custos diferentes. Embutir uma linha do tempo (de um perfil ou de uma
lista) é gratuito. Ler por programa as publicações que mencionam a marca custa US$ 0,005 por publicação lida (FATO,
documentação do X, 3/out/2026). A segunda forma tem custo que cresce com o barulho: mil menções lidas custam
US$ 5 (1.000 × 0,005), e alguém que inunde a marca de menções faz a conta subir.

A revisão de segurança propõe três regras (proposta): a página mostra uma lista escolhida pela equipe, nunca menção
automática, porque conteúdo de terceiros traz golpes e links; a página de sugestões fica separada da página em que a
carteira assina a aposta; e nenhuma sugestão vira pergunta sem revisão humana, o que já é a decisão (a equipe abre
as perguntas).

### 3.9 Outras redes e privacidade

**Decisão.** Para receber dinheiro de outras blockchains, o SODAX ("o nome da empresa é sodax -
https://www.sodax.com"). Para o pagador anônimo, o Cloak: "a gente usa a Cloak para esconder o pagador."

**SODAX**, em linguagem simples: um serviço que traz dinheiro de outras blockchains e entrega USDC na carteira da
pessoa em Solana. Quem tem dinheiro na rede Base chega com USDC em Solana pagando 0,1%. Ele só existe na rede
principal e não aciona o programa de apostas: entrega o dinheiro na carteira, e a aposta é um segundo passo (FATO e
FATO SECUNDÁRIO, documentação do SODAX, 3/out/2026).

**Cloak**, em linguagem simples: um serviço de privacidade em Solana que esconde quem pagou a quem. O patrocinador
deposita, saca para uma carteira nova e patrocina com ela. O depósito é grátis e o saque custa 0,3% mais 0,45 USDC;
só existe na rede principal; o relatório de auditoria não foi publicado (FATO e FATO SECUNDÁRIO, documentação do
Cloak, 3/out/2026).

O limite do Cloak é de tamanho. Esconder um pagamento depende de haver muitos outros parecidos em volta. Segundo o
plano de privacidade do sócio técnico, o cofre de USDC do Cloak tinha cerca de 2.560 USDC e cerca de 50 operações
por dia (FATO SECUNDÁRIO) **[A confirmar: tamanho atual]**. Um patrocínio de 500 é um quinto desse cofre; o de
1.500, mais da metade; o de 5.000, quase o dobro (INFERÊNCIA). Um valor desses entra e sai sozinho, e fica fácil
de ligar as duas pontas.

> **Objeção registrada OBJ-23 · severidade alta**
>
> **Decisão do fundador:** usar o SODAX para outras redes e o Cloak para o pagador anônimo.
>
> **O que a revisão crítica achou:** integrados ao site, os dois põem código de terceiros na página em que a
> carteira assina; e o Cloak não esconde um patrocínio grande.
>
> **Evidência:** o cofre de USDC do Cloak tinha cerca de 2.560 USDC, e um patrocínio de 5.000 é quase o dobro disso
> (FATO SECUNDÁRIO, plano de privacidade do sócio; a comparação é INFERÊNCIA). Os dois serviços só existem na rede
> principal, o que obriga a testar a integração com dinheiro real.
>
> **Alternativa proposta:** na primeira versão, orientação em vez de integração. O patrocinador usa o Cloak por
> conta própria e chega com uma carteira nova; o SODAX fica numa página separada, "Trazer dinheiro de outra rede";
> e a tela diz "pagador não divulgado", não "anônimo".
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.10 Nome, mascote e layout

**Decisão.** "Baked Market, já temos mascote, inclusive." O mascote se chama Baked. O layout aprovado é o Ledger² no
escuro, com tema claro (a direção N do laboratório de protótipos).

O nome segue o padrão do setor, que é "uma palavra + Markets": Hedgehog Markets, Melee Markets, Triad Markets,
Myriad Markets, Manifold Markets. Os maiores usam uma palavra só: Polymarket, Kalshi, Limitless (FATO, pesquisa de
nome, 2/out/2026). A mesma pesquisa registrou os riscos da palavra "baked": o código de negociação `BAKED` já é
usado por terceiros, a palavra tem a gíria de "chapado", e há vizinhança com outros projetos de nome parecido.

Três pontos ficam registrados **[A confirmar]**:

- **Singular ou plural.** A pesquisa de nome foi feita com "Baked Markets". O fundador escreveu "Baked Market", e a
  pergunta sobre o singular ficou sem resposta. Este plano usa o singular.
- **Marca.** Nenhuma base de marcas foi consultada; só busca na web.
- **Documento de design.** O documento de direção de design do repositório ainda descreve outra direção visual
  ("Tape"). Vale a decisão acima, e o documento precisa ser reescrito.

> **Objeção registrada OBJ-28 · severidade baixa**
>
> **Decisão do fundador:** o nome é Baked Market.
>
> **O que a revisão crítica achou:** "baked" tem a gíria de "chapado" e, em inglês de mercado, "baked in" quer dizer
> "já decidido de antemão". É uma leitura ruim para uma casa cujo maior risco é resultado arranjado.
>
> **Evidência:** a pesquisa de nome já registrava a gíria e o código `BAKED` em uso por terceiros (FATO, pesquisa de
> nome, 2/out/2026); a leitura de "baked in" é INFERÊNCIA da revisão; nenhuma base de marcas foi consultada.
>
> **Alternativa proposta:** manter o nome e usar a leitura a favor: o resultado está "assado" na rede e qualquer um
> confere. Só funciona se a OBJ-02 for resolvida.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

## 4. Perguntas e resolução on-chain

O fundador disse, sobre a primeira explicação dos tipos de pergunta, que não tinha entendido nada e que faltaram
contexto e explicação. Este capítulo é a segunda tentativa. Cada tipo vem com uma frase sobre o que ele pergunta e
uma pergunta de exemplo.

### 4.1 O que é resolver lendo a rede

Resolução é o ato de gravar o resultado da pergunta, de forma definitiva. No Baked Market ela funciona assim:

1. Cada pergunta é criada apontando para uma conta da Solana. Conta é o lugar em que a rede guarda um dado: o
   registro de um token, o saldo de um cofre, o estado de uma pool.
2. Quando alguém aperta "Resolver", o programa abre essa conta, lê um número ou uma chave e compara com a meta.
3. Se a meta foi cumprida, grava SIM. Se a data final passou sem a meta, grava NÃO. Não há terceira pessoa
   informando nada.

Qualquer pessoa pode apertar o botão: o apostador, a equipe ou um desconhecido. O resultado é o mesmo, porque sai do
dado e não de quem apertou. O custo é a taxa da rede: 0,000005 SOL por resolução, de modo que mil resoluções custam
0,005 SOL (FATO, relatório técnico de out/2026; a soma é INFERÊNCIA). SOL é a moeda da rede Solana.

**Decisão.** A pergunta pode ser resolvida antes da data: "Se acontecer algo antes da data marcada, ela pode sim se
resolver." Se a queima prometida acontece no dia 10, a pergunta pode pagar no dia 10.

Compare com o que os concorrentes fazem (detalhes na seção 6.7):

- Na Polymarket, alguém propõe o resultado e, se houver contestação, detentores de um token votam; leva de 4 a 6
  dias (FATO, documentação, 3/out/2026).
- No World, uma chave da empresa grava o resultado (FATO SECUNDÁRIO, Chainstack Labs, 11/set/2026).
- No PNP, dois modelos de linguagem decidem (FATO, documentação, out/2026).

### 4.2 Os nove tipos de pergunta prontos e as três famílias

O programa atual já sabe ler nove tipos de fato (FATO, repositório). O sócio técnico só aceitou fatos de duas
espécies: os que não voltam atrás (o que foi queimado está queimado) e os que são uma foto tirada numa data.

Algumas palavras, antes da tabela. **Queima** é destruir tokens para sempre, reduzindo a oferta. **Renúncia de
autoridade** é o dono de uma chave abrir mão, para sempre, de um poder: o de criar tokens novos, o de congelar
carteiras ou o de alterar um programa. **Liquidez travada** é dinheiro posto numa pool de negociação e travado para
sempre, para o token sempre poder ser trocado. **Validador** é um computador que confirma as transações da rede, e
**stake** é o SOL que as pessoas confiam a ele. **Época** é o "dia" da Solana para contas de stake; dura cerca de
dois dias.

| # | Tipo | O que pergunta | Pergunta de exemplo | Quem controla o resultado |
|---|---|---|---|---|
| 1 | Queima de oferta | A quantidade total do token cai até um número? | "A oferta do token T cai para 900 milhões até 31 de dezembro?" | Qualquer um que tenha o token e o queime. Custa dinheiro: o token queimado some |
| 2 | Renúncia de emissão | O time abre mão do poder de criar tokens novos? | "O time do projeto P renuncia à emissão do token até o fim do mês?" | Só quem tem a chave de emissão. Custo zero |
| 3 | Renúncia de congelamento | O time abre mão do poder de congelar a carteira dos outros? | "O token T fica sem autoridade de congelamento até o dia 30?" | Só quem tem a chave. Custo zero |
| 4 | Programa imutável | O código de um programa fica travado, sem atualização possível? | "O protocolo P torna o programa imutável até o dia 30?" | Só quem tem a chave de atualização. Custo zero |
| 5 | Tokens travados | Uma quantidade do token foi mandada para um cofre de onde ninguém tira? | "Pelo menos X tokens da pool P ficam travados para sempre até o dia 30?" | Qualquer um que tenha os tokens. Custa dinheiro: ficam presos |
| 6 | Stake de validador | Um validador tem pelo menos X SOL confiados a ele numa época? | "O validador V entra na época E com X SOL ou mais?" | Quem confia SOL ao validador, antes de a época virar |
| 7 | Total depositado numa pool de staking | Uma pool de staking tem pelo menos X SOL no começo de uma época? | "O JitoSOL começa a época E com X SOL ou mais?" | Quem deposita. O dinheiro precisa atravessar a virada da época |
| 8 | Liquidez travada na Meteora | Uma pool da Meteora tem pelo menos X de liquidez travada para sempre? | "A pool T/SOL chega a X de liquidez travada até o dia 30?" | Quem põe liquidez e trava. Custa dinheiro: fica presa |
| 9 | Metadados imutáveis | Nome, símbolo e imagem do token ficam congelados? | "O token T congela os metadados até o dia 30?" | Só quem tem a chave de metadados. Custo zero |

A última coluna é a que importa num mercado de apostas. Ela separa os nove tipos em três famílias (INFERÊNCIA da
pesquisa técnica, out/2026):

| Família | Tipos | O que significa num pote |
|---|---|---|
| Decisão de quem tem a chave, a custo zero | 2, 3, 4 e 9 | Uma pessoa decide o resultado de graça. Ela pode apostar antes, por outra carteira, e levar o pote do outro lado |
| Alguém precisa gastar ou travar dinheiro | 1, 5 e 8 | Dá para forçar o SIM, mas custa dinheiro de verdade. Só vale a pena se o pote do NÃO for maior que o custo |
| Foto numa data | 6 e 7 | Depende de muito dinheiro parado atravessando a virada da época. É o resultado menos controlável |

No modelo antigo, a primeira família era o produto: o patrocinador pagava justamente para o dono da chave agir. Num
mercado de apostas ela vira o maior risco.

> **Objeção registrada OBJ-03 · severidade crítica**
>
> **Decisão do fundador:** os tipos de pergunta do primeiro dia estão em aberto, e quem controla o resultado não é
> impedido de apostar.
>
> **O que a revisão crítica achou:** perguntas decididas de graça por uma única chave são uma opção gratuita para o
> dono da chave. Quem aposta contra ele está doando.
>
> **Evidência:** em quatro dos nove tipos prontos uma pessoa decide o resultado sem custo (FATO, repositório).
> Exemplo (INFERÊNCIA, conta conferida): no fechamento, o pote tem 3.000 no SIM e 7.000 no NÃO. O dono da chave, por
> uma carteira nova, põe 3.000 no SIM antes do fechamento; o pote vai a 6.000 e 7.000. Depois do fechamento ele usa
> a chave e resolve. Recebe 3.000 ÷ 6.000 × 97% × 13.000 = 6.305: lucro de 3.305, sem risco. Se o pote estivesse
> pesado no SIM, ele apostaria no NÃO e simplesmente não agiria.
>
> **Alternativa proposta:** deixar essa família fora do pote na primeira versão. Se entrar, só com teto de pote
> baixo, selo "resultado controlado por uma parte" e sem patrocínio com lado. A revisão avisa que o selo sozinho não
> protege ninguém, porque o prejuízo de quem aposta contra é certo.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 4.3 O padrão novo de token (Token-2022)

Na Solana, os tokens não são programas separados. Todos são registrados num programa comum, o "programa de tokens".
Existem dois. O clássico, usado pelo USDC e por quase tudo que é antigo. E o novo, chamado Token-2022, que deixa o
token ter funções extras embutidas: cobrar taxa em cada transferência, guardar nome e imagem dentro do próprio
token, e outras. O novo não é uma atualização do antigo; é outro programa, com outras regras.

Isso importa por dois fatos que se encontram:

- Os tokens novos do pump.fun são Token-2022, com os dados dentro do próprio token e as chaves de controle já
  abandonadas: 7 de 7 na amostra lida na rede em 3/out/2026 (FATO, amostra pequena).
- Os quatro leitores de token do programa atual só aceitam o padrão clássico. Diante de um token novo, eles não leem
  errado: recusam (FATO, repositório).

A consequência prática é direta. Queima, renúncia e metadados não funcionam hoje nos tokens que o público do
pump.fun negocia, nem funcionariam no token do próprio Baked Market se ele nascer lá. E duas perguntas perdem o
sentido nesses tokens, porque já nascem respondidas: a renúncia de emissão e a de congelamento.

O que precisa ser construído é um leitor que aceite o padrão novo e recuse, por padrão, qualquer token com função
perigosa ou desconhecida, como a que permite a um terceiro queimar o saldo de qualquer carteira. É o primeiro item
da ordem de construção da seção 4.5.

### 4.4 Preço como pergunta

**Em aberto.** A primeira proposta deixava de fora as perguntas de preço de token pequeno. O fundador questionou:
"Por que ficaria? Com base no quê". A resposta tem três partes, todas com conta.

**Parte 1: numa pool pequena, o preço se move por um instante e volta.** A maioria das pools de negociação define o
preço pela divisão entre as duas reservas. Exemplo (INFERÊNCIA, conta da pesquisa técnica):

1. A pool tem 100 SOL e 10.000.000 de tokens. O preço é 0,00001 SOL por token.
2. A pergunta aberta é "o token vale o dobro até sexta?", e o pote tem dinheiro no NÃO.
3. O atacante aposta no SIM.
4. Numa única transação, ele compra tokens com 41,42 SOL. A pool fica com 141,42 SOL e 7.071.068 tokens, e o preço
   lido é 0,00002: dobrou.
5. Na mesma transação, ele aciona a resolução. O programa lê o preço, vê o dobro e grava SIM, para sempre.
6. Ainda na mesma transação, ele revende os tokens. Recupera os 41,42 SOL menos cerca de 0,21 SOL de taxas.
7. O preço voltou. Ninguém viu o token dobrar. Ele saca o pote do NÃO.

Ele nem precisa ter os 41 SOL. Existe o empréstimo relâmpago: um empréstimo tomado e devolvido dentro da mesma
transação, que serve exatamente para mover um número por um instante.

**Parte 2: já aconteceu, em Solana.** No caso Mango, em 11 de outubro de 2022, o preço usado pelo protocolo para um
token de pouca negociação foi de cerca de US$ 0,04 para US$ 0,54 em uns 30 minutos, e a retirada foi de US$ 114 a
116 milhões (FATO, denúncias da SEC e da CFTC). Ali havia até oráculo de preço, e ele relatou fielmente um preço
empurrado.

**Parte 3: há formas de tornar seguro o bastante.** A primeira é a média no tempo (em inglês, TWAP): em vez do preço
de um instante, usa-se a média do preço durante um período. Numa média de 30 minutos, um pico de 100 vezes o preço
que dure 15 segundos move a média em 3,9% (INFERÊNCIA). A segunda é a Pyth, uma rede de oráculos de preço em que
corretoras e formadores de mercado publicam preços assinados, que o programa confere. Em 4/out/2026 ela tinha 1.881
preços, 423 de cripto, incluindo SOL, Bitcoin e as memecoins grandes (FATO, consulta direta). Para 64 ativos, a
Pyth mantém em Solana uma conta de preço atualizada a cada 55 segundos ou a cada 0,5% de variação (FATO,
documentação; a lista dos 64 não foi conferida) **[A confirmar]**.

A Pyth é um oráculo. Ela é compatível com a decisão do fundador ("oráculo, mas um que possa resolver onchain"),
porque o preço assinado é conferido pelo programa dentro da rede. Mas o produto deixa de poder dizer "sem oráculo"
(seção 4.8).

A forma mais simples de pergunta de preço é a de **toque**: dá SIM se o preço encostar no alvo em qualquer momento
do prazo. Exemplo: "O BTC toca US$ 80.000 até o dia 30?". Basta um preço assinado, dentro do prazo, igual ou acima
do alvo. Sobra uma fresta, que o programa precisa fechar: entre o preço tocar o alvo e alguém levar a prova para a
rede, as apostas seguem abertas. A correção proposta é exigir um preço fresco em toda aposta desse tipo de pergunta.

A resposta direta à pergunta do fundador: preço de token pequeno pode entrar, mas não no primeiro dia e não lendo
uma pool num instante. Entra em três degraus (proposta):

1. Ativos com preço na Pyth, incluindo as memecoins grandes.
2. Tokens com pool na Raydium ou na Meteora (modelo DLMM), pela média no tempo, com liquidez travada mínima e teto
   de pote.
3. Tokens que só existem na PumpSwap, por uma receita de preço na Switchboard, outra rede de oráculos. Esse degrau
   troca a leitura pura da rede pela confiança numa rede de oráculos.

> **Objeção registrada OBJ-24 · severidade alta**
>
> **Decisão do fundador:** em aberto. Ele questionou a exclusão do preço de token pequeno ("Por que ficaria? Com
> base no quê").
>
> **O que a revisão crítica achou:** preço de token pequeno, lido de uma pool num instante, pode ser movido e
> devolvido na mesma transação.
>
> **Evidência:** numa pool de 100 SOL, dobrar o preço custa cerca de 0,21 SOL em taxas (INFERÊNCIA, pesquisa
> técnica); no caso Mango, o preço do oráculo foi de US$ 0,04 a US$ 0,54 em 30 minutos (FATO, denúncias da SEC e da
> CFTC, 2022).
>
> **Alternativa proposta:** entrar nos três degraus acima, e não no primeiro dia.
>
> **Situação:** não há decisão a substituir; a resposta e a alternativa ficam para o fundador decidir.

### 4.5 Cardápio proposto para o primeiro dia

**Em aberto.** Sobre quais tipos de pergunta abrem no primeiro dia, o fundador disse: "não tenho a menor ideia e
você vai me ajudar a decidir". A tabela abaixo é a proposta do estudo de viabilidade, para ele decidir.

O critério da proposta é uma pergunta só: **"alguém decide este resultado de graça?"**. Se sim, o tipo fica fora da
primeira versão. A coluna "fase" segue o roteiro de construção da seção 12.1: na fase 2 o produto fica jogável na
rede de testes; na fase 3 entra o patrocínio.

| Tipo | Pergunta de exemplo | Fase | Observação |
|---|---|---|---|
| Preço de SOL e de Bitcoin pela Pyth, na modalidade toque | "O SOL toca US$ X até o dia D?" | 2 | Leitor novo; preço fresco em toda aposta; ninguém controla o resultado |
| Total depositado numa pool de staking no começo de uma época | "O JitoSOL começa a época E com X SOL ou mais?" | 2 | Leitor pronto; só com os dois serviços agendados no ar (seção 4.6) |
| Liquidez travada na Meteora | "A pool T/SOL chega a X de liquidez travada até o dia D?" | 3 | Leitor pronto; teto de pote abaixo do custo de forçar |
| Queima de oferta em token do padrão clássico | "A oferta do token T cai para X até o dia D?" | 3 | Leitor pronto; teto de pote; os tokens do pump.fun ficam de fora até o leitor do padrão novo |
| Renúncia de chave, programa imutável, metadados imutáveis | "O time do projeto P renuncia à emissão até o dia D?" | Depois | Uma pessoa decide o resultado de graça (OBJ-03) |
| Stake de validador | "O validador V entra na época E com X SOL ou mais?" | Depois | O SIM não pôde ser testado fora de uma rede real |
| Formatura no pump.fun; preço de token pequeno | "O token T se forma no pump.fun até o dia D?" | Depois | Dá para forçar com empréstimo relâmpago; exige travas (seção 4.4) |

Lida de cima para baixo, a tabela diz que o primeiro dia teria duas famílias: preço de ativos grandes, que é o que
esse público mais aposta (seção 5.5), e fotos de época. Os fatos de token, que são a assinatura do produto, entram
na fase seguinte e com teto de pote.

A ordem de construção dos leitores novos sai daí (proposta): primeiro o leitor do padrão novo de token, que libera
queima nos tokens do pump.fun; depois o preço pela Pyth; depois a formatura no pump.fun.

**A formatura como exemplo de pergunta de azarão.** Formatura é o momento em que um token do pump.fun vende toda a
curva inicial e passa a ser negociado numa pool comum. É um fato legível na rede e que esse público acompanha. Mas
só 0,26% dos tokens se formavam em junho de 2026, contra cerca de 1,4% no histórico (FATO SECUNDÁRIO, The Block e
Dune, jun/2026): "o token T se forma?" é quase sempre uma aposta no improvável. E dá para forçar o SIM comprando o
resto da curva. O sócio técnico mediu a perda mínima de quem força: 18,66 SOL numa curva intocada, 2,16 SOL nos
últimos 10% e 0,07 SOL no último 1% (FATO, medição do sócio técnico). Uma pergunta aberta com a curva quase cheia e
um pote grande no NÃO seria dinheiro grátis. Por isso ela só entra com travas: abrir com a curva longe do fim,
fechar as apostas quando ela passar de certo ponto e manter o pote abaixo do custo de forçar.

### 4.6 Quem aciona a resolução

**Decisão (direção).** "talvez a gente resolva com um sistema cron pela nossa plataforma, acionando o resolver."
Serviço agendado (em inglês, cron) é um programa de computador que acorda de tempos em tempos e faz uma tarefa
sozinho. Aqui, a tarefa é conferir, a cada minuto, se alguma pergunta já pode ser resolvida, e apertar o botão.

**Por que ele existe, se qualquer pessoa pode resolver.** Na maior parte dos casos alguém tem interesse em apertar o
botão. Quando o fato acontece, quem apostou no SIM quer receber. Quando o prazo passa, quem apostou no NÃO quer
receber. O caso em que ninguém se mexe é um só: o fato aconteceu, os apostadores do SIM não perceberam, e os do NÃO
ficam quietos, esperando o prazo. É para esse caso que o serviço existe. A revisão de segurança acrescenta que, se o
lado do SIM tiver poucos apostadores desatentos, o silêncio rende o pote inteiro ao NÃO.

**A arquitetura proposta, em linguagem simples** (INFERÊNCIA da pesquisa técnica e da revisão de segurança):

1. Um serviço próprio, sempre ligado, que vigia as perguntas abertas e resolve assim que dá.
2. Um segundo serviço, igual, em outro provedor e com outra chave. Se o primeiro cair, a resolução atrasa minutos,
   não dias.
3. Um botão público "Resolver" no site, visível a qualquer visitante quando a pergunta já pode ser resolvida.
4. Um alarme que avisa a equipe quando uma pergunta está "resolvível e não resolvida" há mais de 15 minutos, e
   alguém de plantão para atendê-lo.
5. Uma recompensa pequena, paga pelo próprio programa a quem resolve, tirada da taxa. Ela cria interessados que não
   dependem da equipe. A revisão crítica pede que ela exista desde a primeira versão.

A chave do serviço não tem poder nenhum. Se for roubada, o ladrão leva o pouco de SOL que estava nela, e nada mais:
o resultado continua saindo do dado lido, não de quem apertou.

**Por que não usar um agendador que já roda dentro da rede.** O programa atual recusa a resolução quando ela é
chamada por outro programa. A trava é proposital: impede que alguém embrulhe a resolução numa operação de empréstimo
relâmpago (FATO, repositório). O efeito colateral é que os agendadores on-chain, como o Tuk Tuk, não conseguem
acioná-la (FATO SECUNDÁRIO; segundo fonte secundária, o código do Tuk Tuk não foi lido) **[A confirmar]**. A revisão
de segurança recomenda manter a trava e não embutir a resolução em outras instruções: o site monta a transação com a
resolução na frente da aposta ou do resgate, como passo separado.

A arquitetura técnica completa está na seção 11.5.

### 4.7 Quando a resolução falha

A regra do programa atual é simples e dura: se o prazo passou, o resultado é NÃO. O programa não tem como saber,
depois, em que dia a meta foi cumprida (FATO, repositório).

Exemplo. A pergunta é "a oferta do token T cai para 900 milhões até o dia 30?". A queima acontece no dia 10. Ninguém
aperta "Resolver": o serviço estava fora do ar e os apostadores do SIM não viram. No dia 30 o prazo vence, alguém
resolve, e o resultado gravado é NÃO. Quem acertou perde tudo, sem disputa e sem volta.

Nas perguntas de época a janela é ainda mais curta, de cerca de dois dias (FATO, repositório). Um fim de semana com
o serviço parado e um SIM verdadeiro vira NÃO.

Há um precedente de quem previu a falha. O PancakeSwap Prediction, também um pote, fecha cada rodada com um operador
próprio; quando o operador falha, a rodada é cancelada e devolve 100% das apostas, sem taxa (FATO, documentação).

A proposta técnica é criar um terceiro resultado, além de SIM e NÃO: **pergunta anulada**. A pergunta não pôde ser
decidida e as apostas voltam. Ele serve para dois casos: a conta que seria lida deixou de poder ser lida depois do
prazo (ela pertence a programas de terceiros, que podem mudar de formato), e a janela de uma pergunta de época foi
perdida. O que acontece com a taxa, com o prêmio neutro e com as penalidades numa pergunta anulada ainda não foi
definido (ver seção 16.1).

> **Objeção registrada OBJ-25 · severidade crítica**
>
> **Decisão do fundador:** a resolução é acionada por um serviço agendado da própria plataforma.
>
> **O que a revisão crítica achou:** se o serviço falha, um SIM verdadeiro vira NÃO, para sempre. "Ninguém decide o
> resultado" passa a depender de um servidor da equipe estar no ar.
>
> **Evidência:** pela regra do programa, meta cumprida no dia 10 e não provada até o prazo é gravada como NÃO (FATO,
> repositório). O PancakeSwap, quando o operador falha, devolve 100% (FATO, documentação).
>
> **Alternativa proposta:** dois serviços agendados em provedores diferentes; botão público; recompensa on-chain a
> quem resolve, desde a primeira versão; alarme e plantão; o terceiro resultado, "Anulada"; janela de época perdida
> vira devolução, não NÃO; e um plano escrito de indenização para o caso de a falha ser da equipe.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 4.8 O que dizer ao público

A forma de falar do produto precisa caber no que ele entrega. Três frases que circularam nos documentos anteriores
não cabem.

- **"Sem oráculo."** Com perguntas de preço pela Pyth, deixa de ser verdade. O fundador pediu "oráculo, mas um que
  possa resolver onchain", e é isso que o produto tem. A frase correta é "resolução por dado verificável on-chain".
- **"Ninguém controla."** O programa atual não tem nenhuma chave de administrador. O novo terá: alguém abre as
  perguntas, alguém pode pausar as apostas numa emergência, alguém pode atualizar o código. O plano publica quem
  pode o quê, com os limites de cada poder (quadro na seção 11.4), e não escreve "ninguém controla".
- **"Anônimo."** O Cloak não esconde valores grandes (seção 3.9). A tela diz o que é verdade: "pagador não
  divulgado".

O que o apostador sente, e que pode ser dito sem exagero: o resultado sai sozinho, da leitura da rede; o pagamento
vem em minutos, sem prazo de disputa; e qualquer pessoa confere. A revisão crítica propõe tornar essa conferência um
objeto de tela: em cada pergunta, o número lido agora, a meta e o link da conta.

> **Objeção registrada OBJ-27 · severidade média**
>
> **Decisão do fundador:** resolução só por dado on-chain e patrocinador anônimo, nas palavras usadas na ideação.
>
> **O que a revisão crítica achou:** "sem oráculo", "anônimo" e "ninguém controla" prometem o que o produto não
> entrega.
>
> **Evidência:** preço exige a Pyth, que é um oráculo; o Cloak não esconde valores grandes (FATO SECUNDÁRIO, plano
> de privacidade do sócio); e a equipe abre perguntas, pausa e atualiza o código (INFERÊNCIA, revisão de segurança).
>
> **Alternativa proposta:** "resultado verificável on-chain, pago em minutos, sem disputa"; "pagador não
> divulgado"; e publicar quem pode o quê.
>
> **Situação:** a decisão vale; a alternativa trata só da redação e fica para o fundador decidir.

## 5. Mercado e público

### 5.1 Duas réguas para medir volume

Os números de volume dos mercados de previsão parecem se contradizer de uma fonte para outra. Não se contradizem:
medem a mesma atividade com duas réguas.

Nos líderes do setor, o usuário compra contratos que pagam US$ 1 se o resultado se confirmar e nada se não se
confirmar. O preço do contrato fica entre zero e 1 dólar.

- **Valor de face** soma cada contrato a US$ 1, tenha custado o que for.
- **Dólares pagos** soma o que as pessoas de fato desembolsaram.

Exemplo: 100 contratos comprados a US$ 0,27 cada dão valor de face de 100 e dólares pagos de 27. Quanto mais
contratos baratos se negociam, como em apostas esportivas combinadas, maior a distância entre as duas réguas.

| | Valor de face | Dólares pagos |
|---|---|---|
| O que soma | Cada contrato a US$ 1 | O que foi desembolsado |
| Setor inteiro, 30 dias (4/set a 3/out/2026) | US$ 81,8 bi | US$ 21,7 bi; média de US$ 0,27 por contrato |
| Kalshi | US$ 64,2 bi em 30 dias | US$ 13,7 bi em 30 dias; US$ 13,5 bi em setembro de 2026 |
| Polymarket | US$ 14,2 bi em 30 dias (internacional 4,7 + Estados Unidos 9,5) | US$ 4,63 bi em setembro de 2026; em 30 dias, internacional 2,19 + Estados Unidos 2,41 |
| Fonte e etiqueta | FATO SECUNDÁRIO, DefiRate, out/2026 | FATO SECUNDÁRIO, DefiRate (setor) e DefiLlama (Kalshi e Polymarket), out/2026 |

Na Kalshi, o valor de face é cerca de 4,7 vezes os dólares pagos (64,2 ÷ 13,7; INFERÊNCIA).

Nota sobre a tabela: o DefiLlama não declara o método que usa para a Kalshi; a leitura de que o número dele é
"dólares pagos" é inferência do agente de pesquisa **[A confirmar]**.

**A regra deste plano.** Um pote mede dinheiro depositado. Por isso o Baked Market só se compara com dólares pagos.
Quando um número em valor de face aparece, ele vem com a régua dita ao lado.

### 5.2 O tamanho do mercado de previsão

**O setor é grande e é novo.** Kalshi e Polymarket, juntas, negociaram mais de US$ 44 bilhões em 2025 (FATO
SECUNDÁRIO, The Block, dez/2025; régua não declarada). A Kalshi sozinha fez cerca de US$ 23 bilhões em 2025 e
arrecadou US$ 263,5 milhões em taxas, 1,15% do negociado; 89% dessa taxa veio de esportes (FATO SECUNDÁRIO,
dados de 2025, via pesquisa de monetização; a base do volume não é declarada). Na Polymarket, em dólares pagos, o
volume mensal foi de US$ 1,88 bilhão em nov/2025, 5,09 bilhões em mar/2026, 5,95 bilhões em jun/2026 e 4,63 bilhões
em set/2026, com US$ 56,5 bilhões acumulados (FATO SECUNDÁRIO, DefiLlama, set/2026).

**A cobrança de taxa também é nova.** A Polymarket não arrecadou nada em 2025. Em 2026, as taxas foram de US$ 3,7
milhões em janeiro para US$ 40,6 milhões em abril e US$ 93,6 milhões em setembro, com US$ 435,3 milhões acumulados
(FATO SECUNDÁRIO, DefiLlama, set/2026). O setor só começou a provar que cobra neste ano.

**O capital entrou.** A Kalshi foi avaliada em US$ 22 bilhões em mai/2026 e a Polymarket em US$ 15 bilhões em 2026
(FATO SECUNDÁRIO, Sacra). A ICE, dona da bolsa de Nova York, anunciou até US$ 2 bilhões na Polymarket (FATO,
comunicado da ICE, 7/out/2025) e investiu US$ 1,6 bilhão até mar/2026 (FATO SECUNDÁRIO).

**A projeção mais citada.** A Bernstein projeta volume de cerca de US$ 240 bilhões em 2026 e de US$ 1 trilhão em
2030, com a receita do setor indo de cerca de US$ 500 milhões em 2025 para US$ 10,8 bilhões em 2030 (FATO
SECUNDÁRIO, Decrypt, 14/abr/2026). É projeção de terceiro, e o método não foi lido **[A confirmar]**. Este plano não
anualiza o número de 30 dias da tabela acima para comparar com ela, nem usa a projeção como premissa.

**O mercado é concentrado.** A Kalshi tinha 77% do volume semanal no fim de set/2026 (FATO SECUNDÁRIO, Artemis via
Crypto Economy). E é concentrado em esportes: 62% do volume hoje, com 31% projetados para 2030 (FATO SECUNDÁRIO,
Bernstein, abr/2026). Nada disso é legível numa conta da Solana.

**Três sinais de alerta.** Cerca de 25% da atividade histórica da Polymarket foi negociação artificial, segundo um
estudo da Universidade Columbia (FATO SECUNDÁRIO, via Sacra, 2026). O interesse de busca por mercados de previsão
caiu 83% desde o pico da Copa de 2026 (FATO SECUNDÁRIO, The Defiant, 2026), sinal de sazonalidade ligada a esporte.
E vários países bloquearam ou baniram plataformas do setor em 2025 e 2026, o Brasil entre eles (ver capítulo 15).

### 5.3 O mercado em Solana

O mercado de previsão em Solana é uma fração pequena do setor.

- Quando a Kalshi passou a oferecer seus contratos em Solana, a soma dos dois canais (Jupiter e DFlow) foi de
  US$ 28,6 milhões em cerca de três semanas, de meados de dez/2025 a 5/jan/2026, com cerca de 21 mil carteiras. Da
  parte da DFlow, 98% veio da integração com a Phantom (FATO SECUNDÁRIO, Step Data, jan/2026).
- A área de previsão da Jupiter fez US$ 5,5 milhões em 30 dias (FATO SECUNDÁRIO, DefiLlama, out/2026).
- O World, dentro da Phantom, fez US$ 1,14 milhão em jun/2026, 13,22 milhões em julho, 22,20 milhões em agosto e
  15,44 milhões em setembro, com 52,94 milhões acumulados (FATO SECUNDÁRIO, DefiLlama, set/2026).

A leitura é direta. O World tem por trás a carteira que o público de Solana já usa, que declara mais de 20 milhões
de usuários (FATO SECUNDÁRIO), e fez cerca de US$ 15 milhões em setembro de 2026. Esse é o tamanho real do melhor
canal de distribuição da rede. Quem lê os números da Polymarket e imagina o mesmo em Solana erra por um fator de
cerca de 300 (4,63 bilhões ÷ 15,44 milhões; INFERÊNCIA).

Um detalhe do World importa para as finanças do pote. Ele tinha US$ 170,8 mil travados (FATO SECUNDÁRIO, DefiLlama,
set/2026), o que significa que cada dólar girou cerca de 90 vezes no mês (INFERÊNCIA). Dinheiro travado é o total
parado dentro de um protocolo num dado momento; giro é quantas vezes o mesmo dólar é apostado num período. No pote,
o dólar entra uma vez por pergunta e fica parado até a resolução. A consequência está na seção 9.4.

### 5.4 O público web3 e do pump.fun

**Decisão.** "queremos pessoal da web3." O recorte que a pesquisa usou é o público de Solana e, dentro dele, o do
pump.fun.

| Medida | Valor | Data | Etiqueta |
|---|---|---|---|
| Endereços ativos em Solana por semana | 27,1 milhões, sem filtro de robôs | Semana até 18/jan/2026 | FATO SECUNDÁRIO (Nansen, via BlockEden) |
| Usuários ativos por dia em Solana | Cerca de 4,3 milhões | 2026, sem data exata | FATO SECUNDÁRIO, fonte fraca |
| pump.fun: carteiras únicas acumuladas | 80 milhões | jun/2026 | FATO SECUNDÁRIO (The Block) |
| pump.fun: volume desde a criação | Mais de US$ 214 bilhões | jun/2026 | FATO SECUNDÁRIO (The Block) |
| pump.fun: carteiras ativas por mês | Pico de 5,2 milhões (mai/2025); 1,8 milhão (dez/2025) | 2025 | FATO SECUNDÁRIO, fonte fraca |
| pump.fun: volume diário médio em 30 dias | Cerca de US$ 347 milhões | jun/2026 | FATO SECUNDÁRIO (The Block) |
| pump.fun: receita diária | US$ 800 mil, contra US$ 4,8 milhões seis meses antes | jun/2026 | FATO SECUNDÁRIO (The Block) |
| pump.fun: taxa de formatura | 0,26% (média de 7 dias); histórica de cerca de 1,4% | jun/2026 | FATO SECUNDÁRIO (The Block, Dune) |
| pump.fun: receita de 2025 | US$ 971,37 milhões | 29/abr/2026 | FATO SECUNDÁRIO (CoinDesk) |

Duas leituras. O público é grande em quantidade de carteiras. E a atividade caiu forte em 2026: receita diária a um
sexto, carteiras mensais a um terço do pico, formatura a um quinto do histórico (INFERÊNCIA sobre a tabela).

**O que não se sabe.** Carteira ativa inclui robôs e várias carteiras da mesma pessoa. Quantas pessoas reais usam o
pump.fun por dia: não encontrado. Quanto cada carteira aposta numa plataforma de previsão on-chain e com que
frequência: não encontrado. Toda premissa de depósito por carteira no capítulo 9 é premissa sem dado.

**Quatro perfis, como hipótese.** Nenhuma entrevista foi feita; o quadro abaixo é suposição da pesquisa de público,
a validar no teste de demanda (INFERÊNCIA, premissa sem dado, out/2026).

| Perfil | O que busca | O que o afasta | Onde se informa |
|---|---|---|---|
| Trader de memecoin | Giro rápido, retorno em minutos, a sensação de ter lido antes dos outros | Cadastro, prazo longo, pergunta sem dinheiro do outro lado | X, Telegram, DexScreener, grupos de dicas |
| Comunidade de um token | Prova pública de meta cumprida, ânimo coletivo | Meta que parece manipulável, taxa alta | Telegram, Discord, X do projeto |
| Formador de opinião do X cripto | Conteúdo compartilhável, ganhar com a audiência | Risco de reputação, resolução contestável | X, Telegram |
| Equipe de projeto | Divulgar uma meta, atrair detentores do token | Pagar sem retorno mensurável, risco jurídico | X, DexScreener, agências de influenciadores |

A tabela já aponta uma tensão que o capítulo 3 registra: o primeiro perfil quer prazo curto, e a regra de fechamento
decidida deixa as perguntas curtas na exceção (OBJ-21, seção 3.5).

### 5.5 No que esse público aposta

- Na Polymarket, em mai/2026, esporte era de 39% a 40% do volume, política 32% e cripto 20% (FATO SECUNDÁRIO,
  mai/2026).
- Cripto é a porta de entrada: cerca de 40% da atividade inicial dos novos usuários da Polymarket no primeiro
  trimestre de 2026 foi em mercados de cripto (FATO SECUNDÁRIO, The Defiant).
- As plataformas on-chain menores (Azuro, Limitless, Myriad e PolyBet), somadas, tinham menos de 4% do volume mensal
  da Polymarket em mai/2026 (FATO SECUNDÁRIO).
- Todos os mercados sobre o pump.fun na Polymarket somaram cerca de US$ 262,81 mil, e são sobre o token PUMP (FATO
  SECUNDÁRIO, fonte fraca, Cryptorank, sem data).

A leitura da pesquisa (INFERÊNCIA): o que une esse público é preço de cripto em prazo curto e eventos de grande
atenção, como esporte e eleição. Fatos de projeto de token (queima, renúncia, trava de liquidez) não aparecem como
categoria relevante em nenhuma plataforma. Isso sustenta duas escolhas da proposta de cardápio da seção 4.5: começar
por preço de ativos grandes e tratar os fatos de token como assinatura do produto, não como fonte principal de
volume. E é a base da objeção OBJ-01 (seção 2.5).

### 5.6 Quem pagaria patrocínio

Os candidatos a patrocinador são equipes de token, plataformas de lançamento de tokens, validadores e protocolos
(hipótese; não há dado sobre a disposição de pagar por uma pergunta patrocinada).

O que esses projetos já pagam por visibilidade dá a ordem de grandeza:

- No DexScreener, o site em que esse público acompanha preços, o anúncio de um token custa "a partir de US$ 299"
  (FATO, página oficial) e a barra de tendências, "a partir de US$ 2.000" (FATO SECUNDÁRIO).
- Um micro-influenciador cobra cerca de US$ 500 por publicação, e um lançamento de token gasta de US$ 40 mil a 150
  mil em divulgação (fonte fraca, blogs de agência, 2026).

As faixas de US$ 500, 1.500 e 5.000 ficam, portanto, na faixa de preço de um anúncio nesses canais. A diferença é
que esses canais têm audiência de milhões, e o Baked Market começa sem audiência; a comparação completa, com o
custo por mil impressões, está na seção 7.4, junto com a objeção OBJ-15. Com a receita diária do pump.fun a um sexto
do que era, o orçamento de marketing do projeto médio provavelmente encolheu em 2026 (INFERÊNCIA).

### 5.7 O tamanho que o plano considera

O plano não promete o tamanho da Polymarket. As projeções do capítulo 9 foram presas a réguas de plataformas reais,
todas em dólares pagos (INFERÊNCIA do modelo financeiro, out/2026; as réguas são FATO SECUNDÁRIO, DefiLlama,
set/2026 e out/2026):

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume apostado no mês 12 | US$ 45 mil | US$ 300 mil | US$ 1,5 milhão |
| Régua no mês 12 | Taxa de US$ 1.148 no mês, perto dos US$ 1.319 que a Myriad arrecadou em 30 dias | 1,9% do World de set/2026; 2,8% da Limitless de set/2026 | 9,7% do World; 14% da Limitless de set/2026 |
| Volume apostado no mês 24 | US$ 30 mil | US$ 750 mil | US$ 5 milhões |
| Régua no mês 24 | Em 24 meses, US$ 870 mil: 3,3 vezes tudo o que os mercados de pump.fun somaram na Polymarket | 4,9% do World; 7,0% da Limitless; 14% da Jupiter | 32% do World; 47% da Limitless; 91% da Jupiter |
| O que precisa ser verdade | O produto funciona e quase ninguém volta | Um nicho pequeno e fiel, sem distribuição paga | Um canal de distribuição, como a integração com uma carteira, que hoje não existe |

A leitura da tabela: o cenário razoável pede que o Baked Market chegue, em um ano, a cerca de 2% do que o World faz
hoje com a Phantom inteira por trás. O otimista pede um décimo. Nenhum dos dois é pequeno para um produto novo, sem
canal de distribuição e num mercado em que três plataformas menores perderam de 80% a 96% do volume em meses (seção
2.3). O cenário ruim, que não se paga, tampouco é o piso: o piso é o de um concorrente de Solana que está quase
parado, com volume perto de zero (ver seção 6.3).

Os cenários completos, o ponto de equilíbrio, o capital necessário e as metas de 90 dias estão no capítulo 9.

