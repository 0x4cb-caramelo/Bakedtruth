# Brot Markets — Business Plan v0.0.4 — Parte 1: Produto

**Data:** 8 de outubro de 2026.
**Estado:** rascunho para revisão do fundador. Esta versão foi derivada da v0.0.3 com as decisões que o fundador
tomou em 8 de outubro de 2026. Onde elas e a v0.0.3 discordam, valem as decisões; onde elas se calam, vale a v0.0.3.
Substitui a Parte 1 da v0.0.3. As Partes 2 (negócio), 3 (tokens) e 4 (construção e risco) vêm depois.

**Como ler.** **Decisão** é o que o fundador decidiu em 4 ou 5/10/2026. **Decisão do pitch** é regra do deck de
7/10/2026, citada em inglês. **Decisão, de 8/10/2026** é o que ele decidiu ao ler a v0.0.3, com as palavras como ele
escreveu. **Proposta, aguardando decisão** é sugestão ainda não aprovada. **Proposta, a partir da pesquisa pedida
pelo fundador** é a da fonte do preço do SOL (seção 4.1). As decisões de 8/10/2026 têm código de D-a a D-t, e as
propostas abertas, de P-1 a P-9 (seção 5; a P-1 e a P-3 foram decididas depois); os números de 1 a 19 são as decisões pendentes da v0.0.3. **Acréscimo de 12/10/2026** é o sexto tipo (seção 4.2), fixado no pedido desse dia e fora das decisões de 8/10/2026. Números de fora
trazem etiqueta: FATO (lido na fonte), FATO SECUNDÁRIO (lido em quem citou a fonte) e INFERÊNCIA (conta ou conclusão
nossa). "v0.0.3, P1 §3.4" quer dizer Parte 1, seção 3.4.

**O dinheiro nos exemplos.** Na plataforma, tudo é pago em SOL, ao preço do dia; os exemplos usam dólares para
facilitar a leitura. Os valores principais vêm também em SOL, ao preço de referência de **US$ 109,27** (FATO, API
pública da CoinGecko, `simple/price`, 8/10/2026, 15:29 UTC). A conversão é INFERÊNCIA: US$ 500 são 4,5758 SOL; US$
450, 4,1182 SOL; US$ 50, 0,4576 SOL.

**Termos.** **Campanha** ("campanha on-chain" na primeira menção; "On-Chain Campaign" em inglês) é o produto: uma
pergunta de SIM ou NÃO com um pote. **Baker** (plural bakers) é quem entra; **criador**, quem abre. **SOL** é a moeda
da Solana e a única da plataforma. **Devnet** é a rede de testes. **Programa** é o código que roda na Solana e guarda
o dinheiro.

**O que mudou desde a v0.0.3.**

1. O produto passa a se chamar **campanha on-chain**. Quem entra é baker, quem abre é criador, e entra-se no SIM ou
   no NÃO (seção 4.6).
2. **Tudo em SOL.** Desfaz a decisão de 4/10/2026 pelo dólar digital: o USDC sai do produto (seção 3.1).
3. **Abrir custa US$ 500, pagos em SOL:** US$ 450 viram prêmio no pote e US$ 50 ficam com o Brot. Os 0,02 SOL saem.
   Abrir e patrocinar passam a ser a mesma regra (seções 3.7 e 4.1). O preço do SOL viria da Pyth (proposta).
4. **A equipe também abre.** Os parceiros abrem de graça, sem prêmio. Nenhum dos dois fica com o 1% (seções 3.8 e 4.1).
5. **O 1% do criador sai do pote**; só quando isso deixaria quem acertou abaixo do que pôs, sai da taxa do Brot. Os
   desenhos A, B e C da v0.0.3 deixam de ser opções (seção 3.4).
6. **Sem teto e sem lista de contas aprovadas.** O risco de quem abre empurrar o resultado fica escrito (seção 4.2).
   Os critérios para a rede principal passam de três para dois (seção 2.3).
7. As regras mínimas de abertura estão decididas, e o pedido de pergunta sai (seções 4.2 e 3.7).
8. O pagamento vai em SOL direto à carteira. Há proposta de entrada mínima de 0,01 SOL (seção 3.10).
9. Citados aqui, mas fora do produto: app de celular só para Android (seção 2.2) e programa em Pinocchio (seção 2.3).
10. Não mudaram: a taxa de 10% do lado perdedor, os cinco estados, o pote de um lado só, a campanha anulada, o
    fechamento, a indicação (salvo a moeda), os cinco tipos, a resolução e a janela de 6 horas.
11. **Acréscimo de 12/10/2026:** um sexto tipo, a graduação de uma curva de lançamento da Meteora (seção 4.2).

## 1. Resumo

### 1.1 O que é

O Brot Markets é uma plataforma de campanhas on-chain ("On-Chain Campaigns") na Solana. Cada campanha é uma pergunta
sobre o futuro, de SIM ou NÃO, cuja resposta fica gravada numa conta da rede. Os bakers põem SOL no SIM ou no NÃO, e
quem acerta divide o pote. "Brot" é pão em alemão, e o mascote é um pãozinho. O lema do pitch continua: "Proof >
Promises".

Cinco ideias definem o produto.

- **É um pote.** Cada campanha tem um cofre com o SOL dos bakers do SIM e do NÃO. No fim, quem acertou divide o
  pote, descontadas a taxa do Brot e a parte do criador.
- **A rede responde.** Só há campanha cuja resposta fica numa conta da Solana. O programa lê a conta e grava o
  resultado. Ninguém vota e ninguém informa nada.
- **O projeto é cliente.** Um projeto que prometeu algo que a rede mede, como queimar tokens, abre a campanha sobre a
  própria promessa, e a comunidade dele entra.
- **Qualquer um abre, por US$ 500 em SOL.** Dos US$ 500, 90% viram prêmio no pote e 10% ficam com o Brot. O criador
  fica com 1% das entradas.
- **Tudo em SOL.** Entra-se, recebe-se e paga-se taxa em SOL.

### 1.2 Como funciona, em um exemplo

O exemplo é o do slide de receita. Alguém abre a campanha "O token T queima 100 milhões de tokens até 30 de
novembro?".

1. **Abertura.** O criador paga US$ 500 em SOL (4,5758 SOL). US$ 450 viram prêmio; US$ 50 ficam com o Brot.
2. **Entradas.** Entram 600 no SIM e 400 no NÃO. A tela mostra a "chance" de cada lado, a fatia das entradas: SIM
   60%, NÃO 40%.
3. **Fechamento.** As entradas param antes do fim, para ninguém entrar já sabendo o resultado.
4. **Resolução.** Um serviço da plataforma manda o programa ler a conta do token. Queima no prazo: SIM. Prazo vencido
   sem ela: NÃO.
5. **Janela de 6 horas.** A equipe pode conferir. Só confirma ou anula; nunca troca o vencedor.
6. **Pagamento.** O SOL vai direto para a carteira de quem acertou, sem botão de resgate.

Deu SIM. A taxa do Brot é de 10% do lado perdedor: **40**. O criador fica com 1% das entradas: **10**, tirados do
pote. Os bakers do SIM dividem 1.000 − 40 − 10 + 450 = **1.400**, ou 2,333 por 1. Sem prêmio, seriam 950, ou 1,583 por 1.
Sem prêmio e sem o 1%, como numa campanha de parceiro, são 960, ou 1,60 por 1, a conta do slide (seção 3.4).

### 1.3 O que está decidido

- Tudo em SOL, começando na devnet, com SOL de teste.
- Qualquer carteira abre por US$ 500 em SOL (90% prêmio, 10% Brot); a equipe também abre. Equipe e parceiros abrem de graça e sem o 1%.
- A taxa do Brot é de 10% do lado perdedor: 25% para a tesouraria e 75% para a operação, até o equilíbrio (Parte 2,
  seção 4.2). Como guardar a tesouraria em SOL está em aberto (P-7).
- O criador fica com 1% das entradas, tirado do pote, ou da taxa do Brot no caso raro.
- Só os seis tipos (o sexto, a graduação de uma curva da Meteora, desde 12/10/2026), conta conferida, sem texto
  livre, de 3 a 90 dias, taxas fixas. Sem teto e sem lista.
- Sem saída antecipada no MVP; uma regra só de fechamento; o que uma única chave decide de graça fica fora.
- Pote de um lado só devolve as entradas, com 1% de taxa a partir da segunda carteira. Campanha anulada devolve tudo.
- Dois serviços agendados resolvem; depois vêm a janela de 6 horas e o pagamento automático.
- A indicação paga 20% da taxa por 90 dias a quem indica, com devolução limitada ao indicado.

### 1.4 O que falta decidir

A seção 5.2 lista dezessete pontos abertos. Os quatro maiores:

- **A leitura exata da regra do 1%** (P-2, seção 3.4). Decidida em 8/10/2026: a leitura sem salto.
- **Se a janela de 6 horas fica**, diante de "No human in the loop" (decisão 5 da v0.0.3, seção 4.5).
- **O criador entrando na própria campanha** (decisão 14, seção 4.2). Sem lista nem teto, num token sem valor quem
  abre pode empurrar o resultado, e a defesa que sobra é o custo de abrir e um aviso.
- **A tesouraria** (P-7). A plataforma é toda em SOL, e a empresa paga custos em dólar.

## 2. O que é e para quem

### 2.1 Uma campanha em que o projeto é cliente

Pote é o cofre de uma campanha. O prêmio de quem acerta é o dinheiro de quem errou, mais o prêmio que veio com a
abertura. O formato dispensa duas coisas de que os líderes do setor precisam: alguém vendendo a um preço e
profissionais oferecendo liquidez o tempo todo.

Toda plataforma do setor precisa de alguém, ou de alguma coisa, que diga qual foi o resultado. O slide do problema:
"Someone always stands between the event and your payout". Na Polymarket, detentores de um token votam quando o
resultado é contestado, em 4 a 6 dias (FATO, documentação da Polymarket, 3/out/2026). No World, dentro da carteira
Phantom, uma chave da empresa grava o resultado (FATO SECUNDÁRIO, Chainstack Labs, 11/set/2026). No PNP, dois modelos
de linguagem decidem (FATO, documentação do PNP, out/2026). Em março de 2025, uma pergunta de 7 milhões de dólares na
Polymarket foi resolvida como SIM sem o fato ter ocorrido (FATO SECUNDÁRIO, CoinDesk e outros, mar/2025).

**Decisão do pitch.** "Brot only lists markets the chain can answer. If the answer isn't stored in a Solana
account, the market doesn't open." É a escolha que o fundador fez em 4/10/2026: "eu quero trabalhar com oráculo, mas
um que possa resolver onchain".

O pitch acrescenta o lugar do projeto: a frase de elevador apresenta o Brot como motor de crescimento para projetos
que vivem na blockchain. Na fala: "o mercado trata projeto cripto como assunto. A gente trata como cliente." Com a
D-b, a frase ganha regra: todo criador que paga os US$ 500 põe um prêmio no pote, como um patrocinador (seção 3.7).

Por decisão do fundador, o produto **não** tem tokens de SIM e de NÃO (a entrada é um registro em nome da carteira),
preço travado, rendimento do pote nem saída antecipada no MVP (seção 3.10).

### 2.2 Três públicos

**O projeto que abre a campanha.** É o cliente. Anuncia uma meta que a rede mede, como queimar 100 milhões de tokens
até uma data, e abre a campanha sobre ela. Dos US$ 500, US$ 450 viram prêmio para a comunidade dele. O fundador viu
isso em 4/10/2026: "possibilitando você abrir a questão de algo sobre si mesmo, você acaba criando uma forma de
marketing".

**Os bakers.** Quem entra numa campanha e já usa carteira de criptomoedas. **Decisão.** "queremos pessoal da web3",
com acesso "100% onchain da solana, via wallet, sem kyc": sem conferência de identidade com documento (KYC). Não há
bloqueio por país por enquanto (Parte 4, seção 6). **Decisão, de 8/10/2026 (D-n).** O app de celular será só para
Android, na loja de dApps da Solana, com o mesmo backend do site e tela própria: "lets plan the mobile app. and use
the same backend bur do the front for mobile". No iPhone, o baker usa o site no navegador da carteira.

**Os criadores.** **Decisão do pitch.** "Anyone can open a market, pump.fun style." O criador escolhe um tipo de
campanha, paga US$ 500 em SOL e fica com 1% das entradas. O pitch supõe que ele procure a pergunta que divide
opiniões e a divulgue: "Creators hunt for the questions that split the timeline, and promote their own markets." É
hipótese, e a evidência aponta para o outro lado: o PNP tem criação aberta, dá ao criador 30% da taxa e registrou 206
transações em seis meses (FATO, leitura da rede, 4/out/2026; Parte 2, seções 2.3 e 3.2). A US$ 500, abrir deixa de
ser gesto barato e vira patrocínio: o criador que caça a pergunta do dia tende a ficar mais raro, e o projeto que
promove a própria meta, mais central (INFERÊNCIA). O 1% só devolve os US$ 500 com US$ 50 mil em entradas (seção 4.1).
O pump.fun, a imagem do pitch, somava 80 milhões de carteiras desde a criação, e a receita diária caiu de 4,8 milhões
para 800 mil dólares em seis meses (FATO SECUNDÁRIO, The Block, jun/2026). Carteira não é pessoa.

### 2.3 O que existe hoje

Há dois programas no repositório. O antigo segue outro modelo, em que um patrocinador vende o SIM com desconto; tem
1.717 linhas e 138 testes (FATO, repositório, 5/out/2026) e está congelado. **Decisão.** O programa do Brot é escrito
do zero, "olhando pro código dele para reaproveitar os trechos e pedaços que nos interessam": os leitores e o método
de teste. O cofre muda, porque passa a guardar SOL. **Decisão, de 8/10/2026 (D-o).** "i want to change anchor for
pinocchio": o programa será escrito em Pinocchio, uma biblioteca da Anza, no lugar do Anchor (Parte 4).

O programa novo tem um leitor de preço (o pedaço que lê uma conta e responde sim ou não) e nenhuma instrução: nada do
que este documento descreve funciona ainda. Duas etapas de construção estão fechadas; a terceira escreve o pote
(Parte 4, seção 2.1). **Decisão, de 8/10/2026 (D-l).** A abertura paga, a taxa de abertura e o 1% do criador entram
nela ("12 sim").

| | Programa antigo, congelado | Brot Markets |
|---|---|---|
| Quem põe o dinheiro primeiro | O patrocinador, com um orçamento | O criador, com os US$ 500 da abertura |
| Posição do usuário | Tokens de SIM e de NÃO, a preço fixo | Uma entrada por carteira, sem token e sem preço |
| Quem abre | O patrocinador | Qualquer carteira, por US$ 500 em SOL, dentro das regras |
| Receita | Nenhuma no código | 10% do lado perdedor e US$ 50 por abertura |

**Decisão.** "vamos montar inteiramente na devnet inicialmente". **Decisão do pitch.** A rede principal, com
dinheiro real, vinha "After an audit, a multisig and a cap". **Decisão, de 8/10/2026 (D-h).** Sem teto: os critérios
passam a ser dois, uma auditoria externa e uma carteira que só assina com várias pessoas (Parte 4, seção 4.1). O
slide precisa mudar.

## 3. O produto

### 3.1 O pote, a moeda e os cinco estados

**Decisão.** Cada campanha tem o seu pote, e o dinheiro chega por duas trilhas.

- **As entradas.** Qualquer carteira põe SOL no SIM ou no NÃO, quantas vezes quiser. Entrada é o valor que uma
  carteira põe num lado, registrado em nome dela. Sem entradas não há pote.
- **O prêmio da abertura.** Dos US$ 500 que o criador paga, US$ 450 entram no pote sem lado. Quem paga mais põe um
  prêmio maior (seção 3.7).

**Uma moeda só. Decisão, de 8/10/2026 (D-a).** "we use only SOL in the entire platform"; "1 - tudo em sol".
Entradas, pote, prêmio, pagamentos, devoluções, indicação e taxas: tudo em SOL. Desfaz a decisão de 4/10/2026 ("A
moeda vai ser usdc, vamos abandonar a ideia de sol"); o USDC sai do produto. O serviço que resolve e paga também só
usa SOL ("update keeper for only uses SOL").

Na prática: quanto o SOL recebido vale em dólar depende do preço do dia. O cofre é uma conta do programa que guarda
SOL; SOL mandado à mão para ele não vira entrada. E a empresa, que paga custos em dólar, precisa de regra para
converter (P-7).

O caminho de uma campanha tem cinco estados:

| Estado | O que acontece | Seção |
|---|---|---|
| Aberta | Recebe entradas nos dois lados | 3.2 |
| Fechada | As entradas param; a campanha espera o fato ou a data final | 3.6 |
| Em revisão | O programa leu a rede e gravou SIM ou NÃO; a equipe tem 6 horas para confirmar ou anular | 4.5 |
| Paga | O SOL foi enviado às carteiras de quem acertou | 3.10 |
| Anulada | Não pôde ser decidida: todos recebem de volta o que puseram | 3.5 |

### 3.2 A conta do pote

Soma-se tudo o que entrou, tiram-se a taxa e a parte do criador, e o que sobra é repartido entre quem acertou, na
proporção do que cada um pôs. A taxa do Brot é de 10% do lado perdedor (seção 3.3) e depende de qual lado ganha. O
exemplo-base é a campanha do slide de solução, "O SOL toca 300 dólares até 31 de dezembro?", com 300 no SIM e 700 no
NÃO. As contas das seções 3.2, 3.3, 3.5 e 3.6 não têm prêmio nem o 1% do criador, salvo quando dito.

| | Se der SIM | Se der NÃO |
|---|---|---|
| Total do lado que ganhou | 300 | 700 |
| Chance mostrada na tela (fatia das entradas) | 30% | 70% |
| Total do lado que perdeu | 700 | 300 |
| Taxa: 10% do lado que perdeu | 70 | 30 |
| Sobra para quem acertou | 930 | 970 |
| Cada 1 do lado que ganhou recebe | 930 ÷ 300 = 3,10 | 970 ÷ 700 = 1,39 |
| Quem entrou com 100 recebe | 310,00 | 138,57 |
| Com o 1% do criador tirado do pote, cada 1 recebe (INFERÊNCIA) | 920 ÷ 300 = 3,067 | 960 ÷ 700 = 1,371 |

**Chance** é a fatia das entradas em cada lado; não é preço nem probabilidade garantida. **Retorno** é quanto cada 1
recebe se o lado ganhar. Duas consequências precisam estar na tela antes de o baker assinar.

**O retorno só fica definido quando as entradas fecham.** Entram mais 700 no SIM, que passa a ter 1.000. Se der SIM,
a taxa é 70, sobram 1.630, e cada 1 do SIM recebe 1,63, e não 3,10. Por isso a tela mostra o retorno como
"estimativa", já descontadas a taxa e a parte do criador.

**Uma entrada grande baixa o retorno do próprio lado.** Um pote com 5.000 de cada lado paga 1,90 por 1. Quem põe
10.000 no SIM leva o SIM a 15.000; se der SIM, a taxa é 500, sobram 19.500, e o SIM paga 1,30.

**O teto por campanha. Decisão, de 8/10/2026 (D-h).** "7 sem teto, nem global nem individual"; antes: "i would like
to remove this per-market cap. limitless is the right way". O pote não tem limite, nem por campanha nem na soma de
todas. O custo está na seção 4.2: nada limita o que alguém ganha empurrando o resultado.

### 3.3 A taxa: 10% do lado perdedor

**Decisão**, confirmada pelo pitch. A taxa é a parte do pote que fica com o Brot: **10% do lado perdedor**, o mesmo
que 10% do ganho de quem acertou. O fundador ficou com a recomendação do plano ("forma da taxa, sua recomendação"), e
o slide diz: "10% of the losing side. Winners get their money back, plus the rest."

**A conta.** V é o total do lado que ganhou e P, o do lado que perdeu. Taxa = 0,10 × P. Sobra para quem acertou,
antes da parte do criador = V + 0,90 × P. Cada 1 do lado vencedor recebe (V + 0,90 × P) ÷ V.

**Por que sobre o lado perdedor.** Polymarket e Kalshi cobram por uma fórmula sobre o preço de cada negociação, e no
pote não há preço na entrada. O equivalente é cobrar sobre o que os vencedores ganham. Uma taxa fixa sobre o pote
inteiro comeria o ganho de quem acerta quando quase todo o pote está no lado vencedor.

**Tabela 1. Retorno por 1 do lado vencedor**, com 1.000 em entradas, sem prêmio. A coluna sem o 1% foi conferida por
script na v0.0.2; a com o 1%, em 8/10/2026 (INFERÊNCIA).

| Fatia vencedora | Taxa do Brot | Sem o 1% | Com o 1% do criador |
|---|---|---|---|
| 30% (o lado menor vence) | 70 | 3,100 | 3,067 |
| 50% | 50 | 1,900 | 1,880 |
| 60% (o pote do slide) | 40 | 1,600 | 1,583 |
| 70% | 30 | 1,386 | 1,371 |
| 90% | 10 | 1,100 | 1,089 |
| 97% | 3 | 1,028 | 1,018 |
| 99% | 1 | 1,009 | 1,000 na leitura proposta; 1,009 ao pé da letra (seção 3.4) |

Leitura: quem acerta sempre recebe pelo menos o que pôs, mesmo com 99% das entradas no lado dele.

**Tabela 2. Receita esperada do Brot, em % do pote**, supondo que o lado com fatia `q` vence com probabilidade `q`,
o que acontece quando quem entra está bem informado. A conta é `2 × 0,10 × q × (1 − q)`.

| Fatia do favorito | Receita esperada, em % do pote |
|---|---|
| 50% | 5,00 |
| 70% | 4,20 |
| 90% | 1,80 |
| 95% | 0,95 |

A fala do pitch diz o mesmo com outras palavras: "o nosso negócio é a pergunta polêmica". Quanto mais dividida a
campanha, mais ela rende.

**O custo da escolha.** A receita depende da mistura de campanhas, que ninguém mediu: a Parte 2, seção 4.2, usa
3,70% do volume, numa faixa de 2,70% a 4,18%. Em pote equilibrado o Brot cobra 5% do pote, no topo da faixa do setor,
de 1,9% a 5% dos dólares pagos (INFERÊNCIA sobre as taxas publicadas pelos concorrentes, out/2026).

**Uma frase do pitch que pede precisão.** "We only earn from the losing side" vale para a taxa do pote. As outras duas
receitas não saem do lado perdedor: os US$ 50 de cada abertura (seção 4.1) e o 1% do pote de um lado só (seção 3.5).

### 3.4 O 1% do criador

**Decisão do pitch.** "1% of the pot goes to whoever opened it." Este documento o calcula sobre as entradas, sem o
prêmio (P-1, seção 3.5).

**Decisão, de 8/10/2026 (D-g).** O 1% sai do pote. Só quando isso faria quem acertou receber menos do que pôs, sai da
taxa do Brot. Nas palavras do fundador: "1% do criador sai do pot, mas quando a disputa for muito acirrada, e no caso
do 1% do creator fizer com que o usuario que ganhou receba menos do que colocou, entao somente nesse caso, 1% do
creator sai da taxa do brot."

Na regra normal, quem paga é quem acerta: o que ele recebe encolhe em 1% das entradas. Os desenhos A, B e C da v0.0.3
deixam de ser opções: a decisão tira o 1% do pote, como o A, garante que quem acerta não fica abaixo do que pôs, como
o B, e paga essa garantia com a taxa do Brot, como o C.

**Quando a exceção acontece.** Não quando a disputa é apertada: num pote meio a meio, o lado perdedor é grande e o 1%
cabe com folga. O caso acontece quando quase todo o pote está no lado vencedor: sem prêmio, acima de 98,89% das
entradas, isto é, com o lado perdedor menor que 1,12% do vencedor (INFERÊNCIA; limiar `1 ÷ (1 + 0,01 ÷ 0,89)`). Com o
prêmio de US$ 450, quase não ocorre: só em potes acima de cerca de US$ 45 mil e muito desiguais (INFERÊNCIA: só aí 1%
das entradas passa de 450).

**Duas leituras da exceção.** Ao pé da letra, quando o caso dispara, todo o 1% passa para a taxa do Brot, limitado ao
tamanho da taxa. **Decisão, de 8/10/2026 (P-2):** tirar do pote o que dá sem deixar ninguém abaixo do que pôs,
e só a diferença da taxa do Brot. Paga o 1% inteiro ao criador, custa menos ao Brot e não tem salto.

Exemplos (pote em dólares; V lado vencedor, P lado perdedor; taxa = 10% de P; 1% sobre as entradas; INFERÊNCIA,
conferido por script em 8/10/2026):

| Caso | Taxa | 1% | Criador recebe | Brot fica com | Vencedores recebem | Por 1 do vencedor |
|---|---|---|---|---|---|---|
| Slide: V 600, P 400, sem prêmio | 40 | 10 (do pote) | 10 | 40 | 950 | 1,583 |
| Mesmo pote, com prêmio de 450 | 40 | 10 (do pote) | 10 | 40 | 1.400 | 2,333 |
| V 990, P 10, sem prêmio, ao pé da letra | 1 | 10 (da taxa, limitado a 1) | 1 | 0 | 999 | 1,009 |
| V 990, P 10, sem prêmio, leitura proposta | 1 | 9 do pote + 1 da taxa | 10 | 0 | 990 | 1,000 |
| V 98.900, P 1.100, sem prêmio, ao pé da letra | 110 | 1.000 (da taxa, limitado a 110) | 110 | 0 | 99.890 | 1,010 |
| V 98.900, P 1.100, sem prêmio, leitura proposta | 110 | 990 do pote + 10 da taxa | 1.000 | 100 | 98.900 | 1,000 |
| V 98.900, P 1.100, com prêmio de 450 | 110 | 1.000 (do pote) | 1.000 | 110 | 99.340 | 1,004 |

O salto da leitura ao pé da letra: num pote de 100 mil, o criador recebe 1.000 até o lado vencedor chegar a 98,89%;
logo acima, cerca de 111, e o Brot perde a taxa inteira (INFERÊNCIA, por script). Na leitura proposta, o criador
recebe 1.000 dos dois lados do limite.

Em lamports, as unidades mínimas do SOL: `taxa = teto(P × 10%)`; `C = piso((V + P) × 1%)`; `do_pote = mínimo(C; P −
taxa + prêmio)`; `da_taxa = mínimo(C − do_pote; taxa)`. O criador recebe `do_pote + da_taxa`; o Brot fica com
`taxa − da_taxa`; os vencedores dividem `V + P − taxa − do_pote + prêmio`, nunca menos que `V`.

Consequências. **A taxa média do Brot continua em 3,70%** (INFERÊNCIA): a exceção só ocorre onde a taxa já é perto
de zero. **O custo de quem entra sobe:** um pote meio a meio perde 6%, 5 da taxa e 1 do criador, acima da faixa do
setor (seção 3.3); em pote desigual, o 1% equivale a 10% do lado perdedor no 90 a 10, igual à taxa do Brot, e a 20%
no 95 a 5. **Entrar nos dois lados da própria campanha não compensa:** com 500 em cada lado, sem prêmio, o criador
recebe 940 como vencedor e 10 como criador, 950 de 1.000. **O slide de receita precisa de ajuste:** mostra 960; com
o 1%, são 950. Nas campanhas da equipe e dos parceiros, que não têm o 1% (P-3), o 960 é exato (seções 3.8 e 4.1).

### 3.5 Pote de um lado só e campanha anulada

**Pote de um lado só** é a campanha em que só um lado recebeu entradas. Não há perdedor para pagar o vencedor, e o
pote devolve as entradas, qualquer que seja o resultado.

**Decisão.** "apenas o primeiro apostador tem proteção contra taxa". A primeira carteira não paga nada; as demais
pagam 1% do que puseram, como taxa do Brot (não é a parte do criador). Cobrar de todos puniria quem entra primeiro
numa campanha vazia. Exemplo: Ana entra com 100 no SIM, Bruno com 200 e Carla com 300; ninguém entra no NÃO.

| Carteira | Entrou com | Taxa | Recebe de volta |
|---|---|---|---|
| Ana, a primeira | 100 | 0 | 100 |
| Bruno | 200 | 2 | 198 |
| Carla | 300 | 3 | 297 |

O Brot fica com 5. Por isso o roteiro do pitch evita "quem acerta sempre ganha": aqui não há ganho.

**Campanha anulada** é um terceiro resultado: a campanha não pôde ser decidida. Serve para três casos: a conta deixou
de poder ser lida; a janela de leitura foi perdida por falha do serviço; ou a equipe, na revisão de 6 horas, concluiu
que a leitura estava errada (seção 4.5). **Decisão.** Devolve tudo, sem taxa: "talvez seja a única forma de
devolvermos tudo sem cobrarmos taxa". O precedente é o PancakeSwap Prediction, também um pote, que devolve 100% quando
a rodada é cancelada (FATO, documentação do PancakeSwap).

**O prêmio da abertura nesses casos. Decisão, de 8/10/2026 (P-4).** Aplicar a regra decidida em 5/10/2026 para
o prêmio do patrocinador ("ok"): os US$ 450 voltam inteiros a quem abriu. Os US$ 50 do Brot seguem a causa: ficam no
pote de um lado só e na anulação por causa de fora; voltam na anulação por falha da casa. É aplicação de regra que já
existe. A consequência: quando o prêmio volta, abrir custou US$ 50, e não US$ 500 (seções 4.1 e 4.2). A campanha sem
nenhuma entrada não tem regra escrita.

**O 1% do criador nesses casos. Decisão, de 8/10/2026 (P-1).** Nada no pote de um lado só e na campanha
anulada, porque não houve prêmio a repartir, e nada sobre o prêmio da abertura. A primeira resposta, "opção c", não
correspondia a nenhuma opção; repetida a pergunta, o fundador aceitou a recomendação ("ok para recomendacao").

### 3.6 Fechamento

Fechamento é o momento em que as entradas param, antes da data final, para ninguém entrar já sabendo o resultado.

**Por que um pote precisa fechar antes.** Num pote não há preço: quem entra no último minuto recebe o mesmo retorno
de quem arriscou desde o primeiro dia, e dilui essa pessoa. Exemplo: 500 em cada lado; falta uma hora e o fato não
aconteceu, então o NÃO é quase certo e pagaria 1,90 por 1. Um oportunista põe 5.000 no NÃO. A taxa é 50 e sobram
5.950 para os 5.500 do NÃO: ele recebe 5.409,09, lucro de 409,09 quase sem risco, e o NÃO passa a pagar 1,082.

**Decisão: uma regra só.** "um fechamento só, porém vamos sim permitir perguntas acima de 30 dias, limitados a 90 no
mvp". As entradas fecham quando faltam 5% da duração, com mínimo de 24 horas e máximo de 7 dias. Nas campanhas
sobre fato que não volta atrás, como uma queima, as entradas também travam no instante em que o fato acontece.

| Duração da campanha | Fecha no dia | Dias sem entrada no fim |
|---|---|---|
| 3 dias | 2,0 | 1,0 |
| 7 dias | 6,0 | 1,0 |
| 14 dias | 13,0 | 1,0 |
| 30 dias | 28,5 | 1,5 |
| 60 dias | 57,0 | 3,0 |
| 90 dias | 85,5 | 4,5 |

**Quem escolhe a duração é o criador. Decisão, de 8/10/2026 (D-k).** De 3 a 90 dias. Numa campanha de dois dias,
sobraria um dia para entrar e um dia parado.

**Decisão: a opção avançada, só para a equipe.** Fechamento com menos de 24 horas exige a assinatura de uma segunda
pessoa da equipe, registrada na rede. O fundador a quer para prazos curtos, quando houver fluxo de gente que a
justifique (v0.0.3, P1 §3.6).

### 3.7 Patrocínio e abertura: a mesma regra

Patrocinador é o projeto que põe dinheiro na campanha sobre a própria meta ("burn 100M tokens by Nov 30", no slide).
Na fala: "É marketing que se prova sozinho."

**Decisão do pitch.** "From $500. 90% becomes the prize pool. 10% is a marketing fee."

**Decisão, de 8/10/2026 (D-b).** "for open a market, we will charge $500,00 (in SOL)"; "dos 500 dolares 90% vira pot e
10% vai para o brot". Abrir custa US$ 500 em SOL: US$ 450 viram prêmio no pote, sem lado, e US$ 50 ficam com o Brot.
Abrir é patrocinar com o mínimo, e as duas regras passam a ser uma. O projeto abre a própria campanha e o pagamento
da abertura é o patrocínio; quem não é projeto paga o mesmo e põe o mesmo prêmio.

| Valor pago | Vira prêmio (90%) | Fica com o Brot (10%) |
|---|---|---|
| 500 (4,5758 SOL) | 450 (4,1182 SOL) | 50 (0,4576 SOL) |
| 1.500 | 1.350 | 150 |
| 5.000 | 4.500 | 500 |

Só a primeira linha é regra; as outras são tamanhos supostos. Os 10% vão inteiros para a operação até o equilíbrio,
pela regra de 5/10/2026 para a taxa de marketing (Parte 2, seção 4.3).

**Decisão: duas formas de entrar no pote.** Exemplo com 6.000 no SIM e 4.000 no NÃO, sem o 1%: sem prêmio, o SIM
paga 1,600 por 1 e o NÃO, 2,350.

- **Prêmio neutro** é dinheiro somado ao pote sem lado; é o que os 90% da abertura são. Com o prêmio mínimo de 450,
  o SIM passa a pagar 1,675 e o NÃO, 2,463 (INFERÊNCIA: `(10.000 − taxa + 450) ÷ lado vencedor`); com 1.350, 1,825 e
  2,688. O prêmio não paga taxa, porque só o lado perdedor é base dela.
- **Entrada com selo** é o patrocinador entrando no SIM ou no NÃO, com o nome dele: 3.500 no SIM baixam o SIM para
  1,379 e sobem o NÃO para 3,138.

**O risco: quem controla o resultado entrar nele.** O projeto decide sozinho se cumpre a meta. Exemplo, sem prêmio
nem 1%: o público põe 1.000 em cada lado; o patrocinador, escondido, põe 5.000 no NÃO e não queima. Recebe 5.750,
lucro de 750 tirado de quem entrou no SIM. Polymarket e Kalshi proíbem por escrito que negocie quem pode influenciar
o resultado (FATO, regras de integridade das duas plataformas, 2026).

**Decisão.** Três travas ("vamos de alternativas 1, 3 e 4"): o patrocinador pode não ser divulgado, mas a equipe sabe
quem é; a campanha avisa que o patrocinador pode controlar o resultado e pode ter entrado num dos lados; e quem não
mostra o nome só entra com prêmio neutro. Com a abertura livre, "a equipe sabe quem é" só vale para quem se apresenta;
o caso geral está na seção 4.2. A ferramenta que esconde o pagador é o Cloak, que só esconde bem valores pequenos
(Parte 4, seção 2.2) e foi estudado para dólar digital; se serve com SOL precisa ser conferido (P-8).

**O que sai. Decisão, de 8/10/2026 (D-t).** O pedido de pergunta, com pagamento travado e resposta da equipe em 14
dias: "keep it, and ok for removal". O 90/10 fica; o pedido sai.

**O que continua em aberto.**

- **As contrapartidas. Proposta, aguardando decisão (decisão 3, P-9).** Com 10%, uma abertura de 500 deixa 50 para o
  Brot, que não pagam quatro publicações. A proposta: 500 como piso, sem faixas fixas; selo, nome e link em todos;
  publicações e destaque caso a caso.
- **Pôr prêmio numa campanha aberta por outra pessoa.** O slide não trata disso. Continua sem regra.
- **O 1% sobre o prêmio. Decisão, de 8/10/2026 (P-1).** Num pote de 10.000 com prêmio de 4.500, o 1% seria de
  145, dos quais 45 viriam do prêmio. Decidido: só sobre as entradas.

### 3.8 Parceiros de lançamento

**Decisão**, confirmada pelo pitch: "Launch partners: 20–30 projects get one market free." O fundador vai "convidar
parceiros da rede para entrar como patrocinador ... sem que eles tenham a obrigação de pagar qualquer coisa", e eles
"nos entregam publicidade e postagem nas suas redes sociais". A regra: uma campanha grátis por parceiro, com destaque
de 72 horas na página inicial, em troca de duas publicações; vale para os 30 primeiros.

**Decisão, de 8/10/2026 (D-d).** "4 sim": os parceiros continuam abrindo de graça. Sem os US$ 500, a campanha do
parceiro não tem prêmio e depende só das entradas. **Decisão, de 8/10/2026 (P-3):** o parceiro
não fica com o 1% ("parceiros nao ficam com 1%"); esse 1% fica com os vencedores.

**Não há parceiro fechado até a data deste documento.** O slide mostra "7 of 30" com marcas inventadas e a etiqueta
"example". A receita de abertura dos parceiros é zero; se os 30 pagassem, o Brot ficaria com US$ 1.500 (`30 × 50`;
INFERÊNCIA), menos que um mês de custo.

### 3.9 Indicação

**Decisão**, confirmada pelo pitch: "Referrals, day one: 20% of the fee, for 90 days."

- **Quem indica** recebe 20% da taxa que o Brot de fato recebeu das entradas vencedoras do indicado, por 90 dias. Só
  as vencedoras contam porque uma entrada só gera taxa quando ganha.
- **O indicado** recebe de volta a taxa cobrada sobre os primeiros US$ 50 em entradas, depois de completar US$ 250,
  com teto.
- O dinheiro sai do fluxo de taxas, em SOL. Não há verba separada.

**O teto em SOL. Proposta, aguardando decisão (P-6).** O teto da devolução, que era de 5 dólares, passa a 0,05 SOL,
cerca de US$ 5,46. Os limites de US$ 50 e US$ 250 também precisam de valor em SOL: ao preço de referência, 0,4576 e
2,2879 SOL (INFERÊNCIA).

Exemplo. Bia indica o Caio, que entra com 1.000 em 90 dias. A taxa descontada dos ganhos dele soma 37, a média de
3,70% (INFERÊNCIA). Bia recebe 7,40. O Caio passou dos 250 e recebe de volta a taxa dos primeiros 50, na média 1,85.
O Brot fica com 27,75. O programa custa 0,74% do volume indicado, mais a devolução.

Devolução com teto, e não isenção, porque com isenção quem abrisse uma carteira nova a cada 50 dólares nunca pagaria
taxa. **Indicar a si mesmo** é possível, e a resposta pronta do pitch admite; o ganho tem teto: "20% de desconto na
própria taxa por 90 dias, mais uma devolução de até 5 dólares" (0,05 SOL, pela P-6).

**"Day one". Proposta, aguardando decisão (decisão 9, P-9):** o primeiro dia na rede principal (Parte 4, seção 3.3).

### 3.10 Pagamento automático em SOL; a saída antecipada, guardada

**Decisão**, confirmada pelo pitch: "Auto payout. No claim button." Nas palavras do fundador: "na polymarket ele vai
direto pro teu saldo, não faz sentido ter botão de claim". Passada a janela de 6 horas, o serviço da plataforma envia
a cada carteira a parte dela, em SOL. O mesmo vale para as devoluções e para o 1% do criador.

- **O SOL vai direto à carteira, sem conta de token.** Some o problema da v0.0.3, em que a conta de token de quem
  ganhou precisava existir na hora do envio.
- **A plataforma paga a taxa de rede de cada envio:** 0,000005 SOL por transação; mil transações custam 0,005 SOL
  (FATO, relatório técnico de out/2026; a soma é INFERÊNCIA).
- **Um envio muito pequeno pode falhar.** Uma carteira vazia que recebe SOL precisa ficar com o mínimo de aluguel da
  Solana, hoje 0,00065024 SOL para uma conta sem dados (FATO, consulta à rede principal e à devnet, 8/10/2026).

**A entrada mínima. Decisão, de 8/10/2026 (P-5):** 0,01 SOL, cerca de US$ 1,09. Com ela, nenhum pagamento ou
devolução de entrada fica perto do limite do aluguel. O 1% do criador, numa campanha muito pequena, pode ficar abaixo
dele; o plano técnico precisa tratar desse caso.

O serviço não escolhe quem recebe nem quanto: os valores saem do registro das entradas e do resultado gravado. Se ele
parar ou um envio falhar, o pagamento atrasa, e o dinheiro continua no cofre.

**Saída antecipada. Decisão.** "Neste mvp vamos trabalhar sem possibilidade de saída." Fica para a fase 2. Não foi
encontrado pote que devolva dinheiro do próprio cofre a quem sai (FATO do agente de pesquisa: ausência em pesquisa,
out/2026). A fórmula aprovada para estudo, com penalidade de 5% a 90%, está na v0.0.2, P1 §3.6.

## 4. Campanhas e resolução

### 4.1 Quem abre uma campanha

Uma campanha é uma pergunta com resposta SIM ou NÃO, uma data final e uma regra de como se decide. Exemplo: "A oferta
do token T cai para 900 milhões até o dia 30?".

**Decisão do pitch.** "Anyone can open a market, pump.fun style. 0.02 SOL to open a market. Inside the rules. Only
markets the chain can answer." **Decisão, de 8/10/2026 (D-b).** O preço muda: em vez de 0,02 SOL, US$ 500 pagos em
SOL. A decisão 2 da v0.0.3, sobre para onde iriam os 0,02 SOL, perde o objeto.

1. **Abertura.** O criador escolhe um tipo (seção 4.2), a conta da Solana que será lida, a meta e a data final. Paga
   US$ 500 em SOL, ao preço da hora.
2. **Conferência.** O programa confere, na hora, se a conta serve para o tipo. Se não serve, a campanha não abre.
3. **Entradas**, até o fechamento (seção 3.6).
4. **Resolução**, pelo serviço agendado (seção 4.4). **Decisão.** "Se acontecer algo antes da data marcada, ela pode
   sim se resolver."
5. **Janela de 6 horas** (seção 4.5) e **pagamento automático**, com o 1% do criador (seção 3.10).

**Para que servem os US$ 500** (INFERÊNCIA, contas por script em 8/10/2026):

- **Seguram o lixo.** Abrir 1.000 campanhas sem sentido custa US$ 500 mil; US$ 50 mil se o prêmio voltar em todas
  (P-4, seção 3.5).
- **Põem prêmio em toda campanha paga.** A comunidade entra num pote que já tem US$ 450.
- **Pagam a operação.** Com N campanhas pagas por mês, o volume que cobre o custo de US$ 5.500 cai de 208.630 para
  `(5.500 − 50 × N) ÷ 0,0263625` dólares por mês; com 110 campanhas, só as aberturas pagam o custo. Ninguém sabe N
  (Parte 2).
- **Voltam devagar ao criador.** O 1% cobre os US$ 50 com US$ 5 mil em entradas, e os US$ 500 com US$ 50 mil
  (`valor ÷ 1%`). Se o criador também entrar e acertar, leva parte do prêmio.

O cofre de cada campanha é uma conta do programa, sem dados, que mantém o mínimo de aluguel (seção 3.10). O aluguel
da conta da campanha não foi medido.

**De onde vem o preço do SOL. Decisão, de 8/10/2026 (D-f), a partir da pesquisa pedida pelo fundador.** Ele pediu: "coingecko ou
outro, pesquise". O programa não consegue ler a CoinGecko: um programa da Solana só lê contas da própria rede.
Usá-la exigiria um servidor nosso gravando o preço com uma chave, e essa chave passaria a mandar no valor da taxa.
O plano gratuito (Demo) também não deixa claro o uso comercial, e os pagos exigem a frase "Data provided by
CoinGecko" (FATO SECUNDÁRIO, página de planos da CoinGecko). A recomendação: o programa lê o preço SOL/USD da Pyth na
hora de abrir, como já lê a Pyth nas campanhas de preço; a Pyth mantém essa conta atualizada sem custo para quem só
lê. A CoinGecko fica para mostrar preço no site e nos relatórios; dela vem o preço de referência deste documento
(**Decisão, de 8/10/2026, D-e:** "pegue o preco na coingecko").

**O projeto abre a própria campanha**, como qualquer carteira. Os dois ciclos da v0.0.2 e a página de sugestões pelo
X saem: quem tem uma ideia abre.

**A equipe também abre. Decisão, de 8/10/2026 (D-c).** "Our team can open markets too." Serve, por exemplo, para
haver campanha de preço no primeiro dia. **Decisão, de 8/10/2026 (P-3):** a equipe não paga os US$ 500 nem fica com o 1% das
campanhas que abre, "porque nos ja cobramos taxa". Os parceiros também não ficam com o 1%. Campanha da equipe,
como a de parceiro, sai sem prêmio, salvo se a equipe puser um.

### 4.2 Dentro das regras: o que o programa aceita

"Inside the rules" é a parte da frase que segura o resto. Sem ela, o produto vira um lugar de opinião, como os que o
slide do problema critica. Cada tipo precisa de um leitor (seção 2.3); sem leitor, o tipo não existe.

Algumas palavras. **Oferta** é a quantidade total de um token; **queima**, destruir tokens para sempre. **Pool** é o
cofre em que um token é trocado por outro; **liquidez travada**, dinheiro preso numa pool para sempre. **Stake** é o
SOL confiado a um validador, o computador que confirma transações; **pool de staking** junta o SOL de muita gente.
**Época** é o "dia" da Solana para o stake, de cerca de dois dias. **Oráculo de preço** publica preços assinados, que
o programa confere na rede; o do Brot é a Pyth.

**Decisão**, de 5/10/2026: o site abre com cinco tipos, os mesmos exemplos do pitch ("a burn, locked liquidity or
staked SOL").

| Tipo | O que pergunta | Exemplo | Quem consegue empurrar o resultado |
|---|---|---|---|
| Preço de ativo grande | O preço encosta num alvo dentro do prazo? | "O SOL toca 300 dólares até o dia 30?" | Ninguém: o preço sai de todas as negociações do ativo |
| Queima de oferta | A quantidade total do token cai até um número? | "A oferta do token T cai para 900 milhões até o dia 30?" | Quem tem o token e o queima. Custa o valor do token queimado |
| Liquidez travada na Meteora | Uma pool tem pelo menos X de liquidez travada para sempre? | "A pool T/SOL chega a X de liquidez travada até o dia 30?" | Quem põe liquidez e trava. O dinheiro fica preso |
| Tamanho de pool de staking | A pool tem pelo menos X SOL no começo de uma época? | "O JitoSOL começa a época E com X SOL ou mais?" | Quem deposita. O dinheiro precisa atravessar a virada da época |
| Stake de validador | O validador tem pelo menos X SOL confiados a ele numa época? | "O validador V entra na época E com X SOL ou mais?" | Quem confia SOL ao validador antes de a época virar |
| Graduação de uma curva da Meteora (acréscimo de 12/10/2026) | A curva de lançamento de um token na Meteora completa até a data? | "A curva do token T completa até o dia 30?" | Quem pagar o resto da curva: o SIM pode ser comprado, e o time do token é quem está mais perto de fazer isso |

**O sexto tipo. Acréscimo de 12/10/2026** (M-1 a M-7 de [`docs/technical/meteora-readers-plan.md`](../technical/meteora-readers-plan.md)).
Muitos lançamentos de token na Solana usam a DBC, a curva de lançamento da Meteora: o token é vendido a preço
crescente até a curva juntar o valor que a configuração do lançamento marca; aí a curva completa, e o token
**gradua** para uma pool. O programa lê a conta da curva e a configuração dela. Só aceita curvas cotadas em SOL e de
85 SOL para cima, recusa as de token com transfer hook, e na abertura ainda falta ao menos 10% do valor. A meta é o
próprio valor da curva: o site não deixa digitar outra, e o programa recusa qualquer outra. As entradas fecham quando
a curva completa. A resolução usa o segundo que a própria conta gravou: completou até o prazo é SIM, mesmo lida
depois; completou depois é NÃO. O SIM pode ser comprado, porque quem pagar o resto da curva a completa na hora, e a
página da campanha diz isso com todas as letras. O tipo abre no devnet e fica fechado na rede principal até as
auditorias cobrirem o leitor.

Na campanha de preço, a modalidade é a de **toque**: dá SIM se o preço encostar no alvo em qualquer momento do prazo,
e toda entrada exige um preço fresco. Em 4/10/2026 a Pyth tinha 1.881 preços, 423 deles de cripto (FATO, consulta
direta). As campanhas de época dependem do serviço agendado: a janela para ler dura cerca de dois dias.

**As regras mínimas. Decisão, de 8/10/2026 (D-j e D-k).** Com qualquer carteira abrindo, o critério está no código:

1. **Só os tipos da tabela:** cinco na decisão de 8/10/2026, seis desde 12/10/2026. O programa recusa qualquer outro.
2. **A conta é conferida na abertura**: dono e formato certos para o tipo.
3. **Sem texto livre.** "10 - site monta a frase": o site a monta com o tipo, a conta, a meta e a data. Com texto
   livre, quem abre escreveria uma coisa e o programa leria outra.
4. **Duração de 3 a 90 dias** (seção 3.6).
5. **Taxas fixadas pelo programa.** O criador não escolhe a taxa nem a própria parte.

**Sem lista e sem teto. Decisão, de 8/10/2026 (D-h e D-i).** "8 nao tem lista de contas aprovadas, nao lidaremos com
tokenomics"; "7 sem teto, nem global nem individual". Qualquer conta que o leitor do tipo aceita serve, em todos os
tipos, e nenhum pote tem limite. A lista e o teto por campanha que a v0.0.3 propunha saem.

**O risco, sem rodeio.** Na v0.0.2, a defesa contra quem empurra o resultado era a equipe só abrir metas caras. Com a
abertura livre, ela sumiu, e agora não há lista nem teto no lugar. Exemplo: alguém cria um token sem valor, abre a
campanha "a oferta cai para X até o dia 30?", espera entradas no NÃO e queima os próprios tokens, de graça. "Queimar
custa dinheiro" só vale para token que vale dinheiro. Com stake é parecido: o SOL não se perde, só muda de lugar por
um tempo. A leitura está certa, porque a queima aconteceu; a janela de 6 horas não protege ninguém aqui.

A conta (INFERÊNCIA, por script; O é o que terceiros puseram no lado oposto ao que ele força). Ele paga US$ 500;
US$ 450 viram prêmio para os vencedores, ele incluído se estiver no lado que forçou. Ganha o que estiver do outro
lado, menos 10% de taxa, e sem teto não há limite para O.

- Se ele for o único no lado que forçou, o prêmio volta inteiro para ele, e o custo real cai para cerca de US$ 50. A
  manobra compensa com pouco mais de US$ 56 de terceiros do outro lado (`0,9 × O > 50`).
- Com outros bakers no lado dele, ele leva só a sua fatia `s` desse lado, e o lucro é de cerca de
  `s × (0,9 × O + 450) − 500`: com metade do lado, compensa a partir de cerca de US$ 611. Mas o dinheiro que ele põe
  no próprio lado não corre risco, porque ele controla o resultado. Basta entrar grande para a fatia chegar perto de
  1 e o limite voltar para perto de US$ 56.

A defesa que sobra é pequena: o custo de abrir, que pode ser de só US$ 50, e um aviso na tela. O preço pela Pyth
continua seguro, porque ninguém controla o preço de um ativo grande. Nos outros cinco tipos, num token ou validador
pequeno, ou numa curva que o próprio time pode completar, quem entra corre esse risco, e a tela precisa dizer isso.

**O criador pode ter entrado na própria campanha. Proposta, aguardando decisão (decisão 14, P-9).** É o risco do
patrocinador não divulgado (seção 3.7), agora sem ninguém identificado. Sem cadastro não há como proibir. A proposta:
permitir, com aviso automático nos tipos em que dá para empurrar: "quem abriu pode controlar o resultado e pode ter
entrado no SIM ou no NÃO".

### 4.3 O que fica fora

**Decisão: o que uma única chave decide de graça.** Chave é a senha que dá a alguém um poder sobre um token ou um
programa: criar tokens, congelar carteiras, alterar o código. Ficam fora quatro tipos: renúncia de emissão, renúncia
de congelamento, programa imutável e metadados imutáveis. O dono da chave decide o resultado sem gastar nada e pode
entrar antes, por outra carteira. A conta, sem prêmio nem 1%: com 3.000 no SIM e 7.000 no NÃO, ele põe 3.000 no SIM
pouco antes do fechamento, usa a chave e recebe 6.150, lucro de 3.150 sem risco. O fundador decidiu: "sim, vamos
seguir a alternativa proposta".

**Tokens do padrão novo.** Os tokens recentes do pump.fun usam o Token-2022, o programa de token novo da Solana: 7 de
7 na amostra lida em 3/10/2026 (FATO, amostra pequena). Os leitores só aceitam o clássico (FATO, repositório), e a
queima entra, no primeiro dia, só para ele. Para um produto que se compara ao pump.fun, os tokens de lá ficam fora.
**Decisão: tokens travados** também ficam fora no primeiro dia ("ok"), pelo mesmo limite.

**Decisão: preço de token pequeno, em três degraus.** Numa pool pequena, o preço pode ser movido por um instante, com
dinheiro emprestado e devolvido na mesma transação; no caso Mango, em outubro de 2022, a retirada foi de 114 a 116
milhões de dólares (FATO, denúncias da SEC e da CFTC). Os degraus ("vamos seguir a proposta alternativa
recomendada"): ativos com preço num oráculo; depois, tokens com pool na Raydium ou na Meteora, pela média do preço
num período; por último, tokens só da pool do pump.fun (v0.0.2, P1 §4.3).

**Fora por desenho: opinião.** Geopolítica, política e tudo o que depende de alguém dizer o que aconteceu. É a
decisão de origem do produto e a resposta pronta do pitch: "Não existe mercado de opinião."

**Esportes: fase 2.** Resultado de jogo não nasce na rede; alguém precisa publicar. O fundador quer, "numa fase 2
criarmos um oráculo específico pra isso". É a categoria que as regras brasileiras citam pelo nome (Parte 4, seção
6.1).

### 4.4 Como a campanha se resolve

1. Cada campanha nasce apontando para uma conta da Solana: o registro de um token, o estado de uma pool, um preço
   assinado.
2. Na resolução, o programa abre essa conta, lê o número e compara com a meta.
3. Se a meta foi cumprida, grava SIM. Se a data final passou sem a meta, grava NÃO. Ninguém informa nada.

O resultado sai do dado, e não de quem acionou a leitura. **Decisão do pitch.** "Anyone can re-check. Same account,
same answer."

**Decisão: quem aciona.** Um serviço agendado, que acorda a cada minuto e confere se alguma campanha já pode ser
resolvida. O site não tem botão público de resolver ("Sobre o botão resolver, esquece").

**Prazo vencido é NÃO.** O programa não sabe depois em que dia a meta foi cumprida. Se a queima acontece no dia 10 e
o serviço está fora do ar até o dia 30, o resultado gravado é NÃO, e quem acertou perde tudo. O serviço não pode
falhar.

**Decisão: dois serviços.** O segundo roda em outro provedor e vigia o principal a cada 5 minutos. Com 10 minutos sem
resposta, tenta religá-lo até 3 vezes; se não religar, assume a resolução ("o segundo assume o cron e envia
notificação para o cto saber que tem um sistema down"). Por trás dos dois ficam a janela de 6 horas e o resultado
"Anulada". O custo de vigiar muitas campanhas não foi medido (Parte 4, seção 4.5).

### 4.5 A janela de 6 horas e a disputa

**Decisão.** Depois da resolução, o resultado "fica travado por cerca de 6h em aguardo de alguém da equipe revise e
confirme que a resolução foi correta, liberando o pagamento". Três regras:

- **A equipe só confirma ou anula.** Ela "pode só confirmar ou anular". Não existe inverter. Anular devolve a cada um
  o que pôs.
- **Se ninguém revisar, o pagamento sai sozinho** "ao fim das 6h".
- **No MVP, só a equipe aciona a contestação.** Qualquer pessoa avisa por um canal público.

**Decisão: a disputa em duas etapas**, sem voto por token, porque "é justamente neste ambiente que ocorre a
manipulação dos resultados".

| Passo | O que acontece | Prazo |
|---|---|---|
| Gatilho | Um aviso de contestação pausa o pagamento. No MVP só a equipe aciona; depois, qualquer carteira que entrou na campanha, com um depósito | Dentro das 6 horas |
| Etapa 1: segunda fonte | O mesmo dado é lido de novo por um caminho independente. Se confirma, o pagamento sai. Se diverge, sobe | Até 1 hora |
| Etapa 2: revisão humana | Três membros da equipe examinam; decide o acordo de dois. Só confirmam ou anulam, e o motivo é publicado | Até 48 horas |

Três limites: não há voto por token; a equipe nunca inverte um resultado; e, no pior caso, o pagamento sai 55 horas
depois da resolução.

**O conflito com o pitch. Decisão do pitch.** "No human in the loop. The program reads the account"; na fala, "Sem
votação, sem chave da empresa, sem IA". A janela é uma pessoa no caminho, e anular exige uma chave da equipe. Ao pé
da letra, a frase tira a janela e a etapa 2, e uma leitura errada, ou a falha dos dois serviços que faz um SIM virar
NÃO, seria paga sem volta. O plano mantém a janela, decisão de 5/10/2026 que ninguém revogou. **Proposta, aguardando
decisão (decisão 5, P-9):** mantê-la até a auditoria, como freio que só devolve, e dizer "no human picks the winner":
nenhuma pessoa escolhe o vencedor. Essa frase o produto cumpre.

### 4.6 Como falamos disso

**Decisão, de 8/10/2026 (D-m).** "we will adopt the therm On-Chain Campaigns. we will not use markets, or bets, or
take sides or something like this." O produto é a campanha on-chain. Ficam a marca **Brot Markets**, o domínio,
**creator** (criador), **YES/NO** (SIM/NÃO) e **pot** (pote). Quem entra é **baker** ("13 - baker"). O valor posto é
a **entrada**, e o ato é **entrar no SIM** ou **no NÃO**.

O pitch de 7/10 deu três frases, que ficam como registro. A de elevador, aprovada em 7/10/2026, começa "Brot Markets
is a prediction market built as a growth engine for on-chain projects", diz "Your community takes sides" e fecha com
"Your milestone becomes a campaign that proves itself". A da capa: "Prediction markets the chain resolves." O lema:
"Proof > Promises" ("É prova, não promessa"). As duas primeiras usam palavras que a D-m tira e precisam de versão
nova antes do próximo uso público; o lema serve como está, e o fim da frase de elevador já fala em campanha.

**O que trocamos e por quê.**

| Em vez de | Dizemos | Por quê |
|---|---|---|
| "Mercado", "mercado de previsão", "prediction market", para o nosso produto | "Campanha" ("campanha on-chain" na primeira menção; "On-Chain Campaign" em inglês) | D-m. A marca Brot Markets fica. Para os outros, "o setor" ou "as plataformas do setor"; termo de fonte ou lei vai entre aspas, como "aposta de quota fixa" |
| "Aposta", "apostar", "apostador", "escolher um lado" | "Entrada", "entrar no SIM / no NÃO", "baker" | D-m |
| "Quem abriu o mercado" | "Criador" ("creator") | D-m |
| Valores em dólar digital | Valores em SOL; o dólar só como referência | D-a |
| "No human in the loop" | "Nenhuma pessoa escolhe o vencedor" | A equipe pode anular e pausar (seção 4.5). Proposta |
| "Só ganhamos do lado perdedor" | "A taxa do pote sai só do lado perdedor" | Há os US$ 50 da abertura e o 1% do pote de um lado só |
| "Quem acerta sempre ganha" | "Quem acerta recebe o seu de volta e mais a parte dele no resto" | Em pote de um lado só não há ganho |
| "Compartilhe para entrar" | "Cada campanha vira um cartão para postar no X" | O cartão é convite, e não condição; o texto dele ("Share to take a side") também muda |
| "Sem oráculo" | "Resultado lido direto da rede" | A campanha de preço usa um oráculo, a Pyth, conferido na rede |
| "Pago em minutos" | "Pago sozinho, ao fim da janela de 6 horas" | Com contestação, até 55 horas (seção 4.5) |
| "Ganhe 3 vezes" | "Retorno estimado agora: 3,07 por 1" | O retorno só fica definido no fechamento |

**O mascote. Proposta, aguardando decisão (decisão 11, P-9).** Os documentos e a marca o chamam de Baked; na fala do
pitch ele é "o Cacetinho". A proposta: Baked na escrita e Cacetinho como apelido falado.

**Enquanto o produto estiver na devnet**, toda tela e toda publicação dizem: "Estamos em fase de testes. Aqui se
entra com SOL de teste, que não vale dinheiro."

## 5. Decisões e pontos abertos

### 5.1 O que foi decidido em 8/10/2026

| Código | O que passa a valer | Fecha a decisão da v0.0.3 | Seção |
|---|---|---|---|
| D-a | Tudo em SOL; desfaz a decisão de 4/10/2026 pelo dólar digital | — | 3.1 |
| D-b | Abrir custa US$ 500 em SOL, 90% prêmio e 10% Brot; abrir e patrocinar são a mesma regra | 2 (perde o objeto) | 3.7, 4.1 |
| D-c | A equipe também abre | 6, em parte | 4.1 |
| D-d | Parceiros abrem de graça, sem prêmio | — | 3.8 |
| D-e | Preço de referência da CoinGecko: US$ 109,27 em 8/10/2026 | — | 4.1 |
| D-g | O 1% sai do pote; só no caso raro, da taxa do Brot | 1 | 3.4 |
| D-h | Sem teto, nem global nem por campanha; dois critérios para a rede principal | 7 e 18 | 2.3, 3.2, 4.2 |
| D-i | Sem lista de contas aprovadas | 7 | 4.2 |
| D-j | Sem texto livre | 13 | 4.2 |
| D-k | Regras mínimas: cinco tipos (seis desde 12/10/2026), conta conferida, 3 a 90 dias, taxas fixas | 15 | 3.6, 4.2 |
| D-l | Abertura, taxa de abertura e 1% do criador no núcleo (Sprint 02) | 16 | 2.3 |
| D-m | Vocabulário: campanha on-chain, baker, criador | — | 4.6 |
| D-n | App de celular só para Android; iPhone pelo site | — | 2.2 |
| D-o | Programa em Pinocchio | — | 2.3 |
| D-t | O pedido de pergunta sai | 4 | 3.7 |

D-p (Bun), D-q (sem IA), D-r (sem preocupação com prazo) e D-s (advogado na equipe) tocam as Partes 2 e 4; a D-f, a
fonte do preço, foi decidida depois, também em 8/10/2026 (seção 5.2). As decisões de 4 e 5/10/2026 e as do pitch continuam valendo, salvo a moeda em dólar digital
(D-a), os 0,02 SOL (D-b) e o teto global (D-h). A tesouraria em dólar digital, de 5/10/2026, virou a P-7.

### 5.2 O que espera decisão do fundador

| Código | Nº na v0.0.3 | Decisão | Recomendação | Seção |
|---|---|---|---|---|
| P-1 | 10 | O 1% na anulada, no pote de um lado só e sobre o prêmio | **Decidida em 8/10/2026:** nada nos três casos | 3.5, 3.7 |
| P-2 | 1 | A leitura exata da D-g | **Decidida em 8/10/2026:** tirar do pote o que dá; só a diferença sai da taxa do Brot | 3.4 |
| P-3 | 6 | A equipe fica com o 1%? Paga os US$ 500? | **Decidida em 8/10/2026:** não e não; os parceiros também não ficam com o 1% | 3.8, 4.1 |
| P-4 | — | O prêmio de US$ 450 no pote de um lado só e na anulada | **Decidida em 8/10/2026:** regra do prêmio do patrocinador: volta a quem abriu; os US$ 50 seguem a causa | 3.5 |
| P-5 | — | A entrada mínima | **Decidida em 8/10/2026:** 0,01 SOL | 3.10 |
| P-6 | — | O teto da devolução da indicação | 0,05 SOL; os limites de US$ 50 e US$ 250 também em SOL | 3.9 |
| P-7 | 19 | A tesouraria, com tudo em SOL | A plataforma recebe e paga em SOL; a empresa converte por mês o necessário, fora da plataforma; a regra da tesouraria fica com o fundador | 1.3; Parte 4, 4.7 |
| P-8 | — | O Cloak e o SODAX servem com SOL? | Conferir antes de usar | 3.7; Parte 4 |
| D-f | — | A fonte do preço para cobrar os US$ 500 | **Decidida em 8/10/2026:** Pyth no programa; CoinGecko só para mostrar | 4.1 |
| P-9 | 3 | Valores acima de 500 e contrapartidas | 500 como piso; selo, nome e link em todos | 3.7 |
| P-9 | 5 | "No human in the loop" e a janela | Manter a janela; dizer "no human picks the winner" | 4.5 |
| P-9 | 8 | Token B diante da resposta pronta | Confirmar a resposta; o B só com o desconto | Parte 3 |
| P-9 | 9 | "Referrals, day one" | O primeiro dia na rede principal | 3.9 |
| P-9 | 11 | O nome do mascote | Baked na escrita; Cacetinho na fala | 4.6 |
| P-9 | 12 | O acordo escrito do Bernardo e do Ronaldo | Pedir por escrito; até lá, sem sobrenome nas versões públicas | Parte 4 |
| P-9 | 14 | O criador entrando na própria campanha | Permitir, com aviso automático | 4.2 |
| P-9 | 17 | As regras de abertura na versão auditada | Entram no "pronto" da rede principal; lista e teto saem do item | Parte 4 |

Duas lacunas sem número: a campanha sem nenhuma entrada (seção 3.5) e o prêmio posto numa campanha aberta por outra
pessoa (seção 3.7) não têm regra escrita.

### 5.3 O que a pesquisa não encontrou

- Evidência de que a criação aberta traz volume. Os dois casos conhecidos apontam para o outro lado (Parte 2, seção
  3.2).
- Quantas campanhas pagas virão por mês: o N de que a conta da abertura depende (seção 4.1).
- Quanto custa criar um token no pump.fun, para sustentar a comparação do slide.
- O aluguel da conta de uma campanha.
- A mistura real de campanhas, de que a receita depende.
- Um pote que devolva dinheiro do próprio cofre a quem sai antes do fim.
- Quantas pessoas reais há por trás das 80 milhões de carteiras do pump.fun.
