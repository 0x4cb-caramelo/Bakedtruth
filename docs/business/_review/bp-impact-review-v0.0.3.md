# Revisão de impacto do BP v0.0.3: o que o pitch muda no plano

- **Data:** 7 de outubro de 2026.
- **Pedido do fundador:** "vamos fazer essa engenharia reversa, tomar o pitch como verdade, e transformar o Business
  plan conforme o pitch."
- **Para quem é:** o agente que vai reescrever o plano. Este arquivo não é o plano e não altera nenhum outro arquivo.
- **Regra de leitura.** Onde o pitch e o plano v0.0.2 discordam, vale o pitch. Onde o pitch se cala, vale a v0.0.2,
  mais curta. "Pitch" são três coisas: a **tela** (os dez slides em `services/landing/public/pitch3/`), a **fala** (o
  roteiro e as respostas prontas em `services/landing/pitch3-notes.md`) e a **frase de elevador** aprovada em
  `docs/business/PITCH.md`.
- **Marcas.** P1 a P4 são as partes da v0.0.2, e § é a seção. FATO, FATO SECUNDÁRIO e INFERÊNCIA são as etiquetas
  dela. **Proposta, aguardando decisão** é sugestão desta revisão, que o fundador ainda não viu.
- **Contas.** Feitas por script. O modelo financeiro da v0.0.2 foi remontado e reproduziu as tabelas publicadas
  antes de receber as regras novas.

## 1. O que o pitch diz

| Nº | Onde | O que diz |
|---|---|---|
| 1 | Capa | "Prediction markets the chain resolves." "The prediction market where projects put money behind their own promises, and the chain proves whether they delivered." "PROOF > PROMISES". Na fala, o mascote é "o Cacetinho" |
| 2 | Problema | "Someone always stands between the event and your payout". "$7M market settled on an event that never happened. Polymarket, March 2025. No refunds." Polymarket: "Token vote. Disputes take 4–6 days". World: "Admin key. One company key writes the result". PNP: "Two LLMs. Language models decide" |
| 3 | Solução | "Brot only lists markets the chain can answer". "If the answer isn't stored in a Solana account, the market doesn't open." "No human in the loop. The program reads the account." "Anyone can re-check." "Auto payout. No claim button." Fala: "Sem votação, sem chave da empresa, sem IA"; "você entra só com a carteira, escolhe um lado em USDC" |
| 4 | Solução, demo | "Does SOL touch $300 by Dec 31?", lido da conta de preço da Pyth, e "Does $TOKEN burn 100M tokens by Nov 30?", "sponsored by $TOKEN", lido da conta do token. No código: 10% do lado perdedor, entrada de 50, potes de 300/700 e 600/400, ganho de "+90.00 USDC" |
| 5 | Mercado, tela | TAM "$21.7B", "Volume in 30 days". SAM "~$0.9B", "Per month, our estimate". SOM "$15.4M", "World in Phantom, Sep 2026". "13× in three months inside Solana: from $1.1M a month in June to $15.4M in September." |
| 6 | Mercado, fala | Polymarket "de 1,9 para 4,6 bilhões por mês em dez meses"; taxas "de zero para 93 milhões de dólares em setembro"; "Cripto é cerca de um quinto do volume"; "porta de entrada de 40% dos novos usuários"; "80 milhões de carteiras no pump.fun" |
| 7 | Receita | "We only earn from the losing side". "10% of the losing side. Winners get their money back, plus the rest." Pote de 1.000 USDC: 600 no lado vencedor, 400 no perdedor, "40 USDC to Brot", "960 USDC to the winners". Fala: "o nosso negócio é a pergunta polêmica"; meio a meio dá 5% do pote, e 90 a 10 com o favorito vencendo dá 1% |
| 8 | Patrocínio | "A project sponsors the market on its own promise". O projeto fixa a meta, patrocina, a comunidade "picks a side", "The chain resolves the result". "From $500". "90% becomes the prize pool. 10% is a marketing fee." "Every market runs inside the same on-chain rules". Fala: "o mercado trata projeto cripto como assunto. A gente trata como cliente"; "É marketing que se prova sozinho" |
| 9 | Criadores | "Anyone can open a market, pump.fun style". "0.02 SOL to open a market." "Inside the rules. Only markets the chain can answer." "1% of the pot goes to whoever opened it." "Creators hunt for the questions that split the timeline, and promote their own markets." Fala: "não é só projeto que abre mercado. Qualquer um abre"; "Os 0,02 SOL seguram o lixo" |
| 10 | Crescimento | "Launch partners: 20–30 projects get one market free." "Referrals, day one: 20% of the fee, for 90 days." "Share to take a side: Every market is a card you post on X." "Creators earn 1%: Every creator promotes their own market." Fala: "Não vamos comprar volume com campanha de pontos" |
| 11 | Roteiro, no slide de crescimento | "NOW Devnet, test tokens. LAUNCH Partner markets live. MAINNET After an audit, a multisig and a cap." |
| 12 | Equipe | "Bernardo Nery, Head Baker · CEO". "Lucas Galvão, Chief Oven Officer · COO and CLO". "Ronaldo Pereira, Chief Toasting Officer · CTO" |
| 13 | Fechamento | "Let's build your startup's market together". "Launch partner spots are limited to 20–30 projects." |
| 14 | Respostas prontas | Token: "Não faz parte do que estamos apresentando. Se um dia houver um, não dá direito a receita nem a voto, e a gente não promete preço nem recompra." Autoindicação: "20% de desconto na própria taxa por 90 dias, mais uma devolução de até 5 dólares" |
| 15 | Frase de elevador | "a prediction market built as a growth engine for on-chain projects"; "a burn, locked liquidity or staked SOL"; "No votes, no judges." |

**O que o pitch não traz:** token, ponto de equilíbrio, custo mensal, cenários, as faixas de 1.500 e 5.000 dólares, a
janela de 6 horas, a disputa, a tesouraria, o fundo de prêmios, a regulação e datas. A palavra "bet" não aparece na
tela, e a fala usa "escolher um lado" e "entrar".

## 2. Onde o plano v0.0.2 diverge

### 2.1 Muda: o pitch contradiz

| Seções da v0.0.2 | O que dizem hoje | O que passa a valer |
|---|---|---|
| P1 §1.1, §2.1, §2.2; P2 §2.4 | Mercado para "pessoal da web3"; o projeto é o "segundo público" | O projeto é cliente e vem primeiro. Três públicos: o projeto que patrocina, quem escolhe um lado e quem abre mercado. No texto de produto, "apostar" vira "escolher um lado" e "entrar" |
| P1 §1.2, §3.2 | "A equipe abre a pergunta"; os vencedores recebem `V + 0,90 P` | Alguém abre o mercado. Em mercado com criador, a conta ganha a parte dele (seção 3.2) |
| P1 §3.1 | Três trilhas de dinheiro (apostas, patrocinador, token); só USDC | Duas trilhas no texto de produto: entradas e patrocínio. USDC no pote, SOL na taxa de abertura |
| P1 §3.3; P2 §4.1 | Uma receita com regra; "ninguém perde por acertar" | A regra da taxa fica. A frase só continua verdadeira se a parte do criador tiver teto. Entram o exemplo do slide e a lista das quatro receitas |
| P1 §3.4; P4 §4.8 | O prêmio volta ao patrocinador; os 30% ficam ou voltam conforme a causa | A mesma regra, com 10%. Falta dizer o que acontece com o 1% do criador e com os 0,02 SOL |
| P1 §3.7; P2 §1.2, §4.2 | Faixas de 500, 1.500 e 5.000; 70% para o pote e 30% para a plataforma; contrapartidas por faixa | "From $500"; 90% viram prêmio e 10% são taxa de marketing. Sobre faixas e contrapartidas o pitch não fala (decisão 3) |
| P1 §4.1; P4 §4.3, §4.7, §6.1 | Duas pessoas da equipe abrem cada pergunta; o patrocinador pede e a equipe responde em até 14 dias; o público só sugere pelo X; nenhuma sugestão vira pergunta sem revisão humana | Qualquer carteira abre por 0,02 SOL, dentro das regras. O programa faz a conferência das duas pessoas. O pedido de pergunta e a página de sugestões perdem a função |
| P1 §4.2, §4.3 | A lista de tipos "que a equipe vai poder abrir"; o critério "alguém decide de graça?" é aplicado por pessoas | A mesma lista vira "as regras": o que o programa aceita de qualquer um. O critério precisa virar código (seção 4, itens 2 e 3) |
| P1 §4.5 a §4.7; P4 §4.3 | Janela de 6 horas em que a equipe confirma ou anula; revisão humana na disputa; a tabela de frases manda não dizer "ninguém controla" | Conflito com "No human in the loop" e "sem chave da empresa" (seção 4, item 1) |
| P1 §4.7 | Frases com "aposte"; "A equipe confere. O dado decide." | Entram a frase de elevador, a frase da capa e "Proof > Promises" |
| P1 §2.4; P2 §6.3; P3 inteira | Dois tokens; o B dá desconto, voto e parte num cofre | O pitch não apresenta token. A resposta pronta ("não dá direito a receita nem a voto") contradiz o cofre (P3 §4.5) e o voto (P3 §4.4). O voto "sobre quais perguntas abrir" perde o objeto quando qualquer um abre |
| P2 §1.1, §2.2 | Sem TAM, SAM e SOM | Entra o quadro do slide, com a definição e a etiqueta de cada número (seção 7) |
| P2 §3.2 a §3.5 | Linha do Brot: "A equipe; o patrocinador pede; o público sugere". Sobre o PNP: a criação aberta é "o oposto do que propomos", e dar ao criador parte da taxa "fica guardada" | "Qualquer carteira, dentro dos tipos que o programa lê". O que nos separa do PNP passa a ser só a forma de resolver. A ideia guardada foi adotada |
| P2 §4.3 | Trinta parceiros pagando 500 dariam 4.500 à plataforma | Dariam 1.500 (`30 × 500 × 10%`) |
| P2 §4.8 | Sete formas de receita, nenhuma ligada a criar mercado | Entram a taxa de abertura (receita) e a parte do criador (custo) |
| P2 §1.3, §1.4, §5.1 a §5.5; `BUSINESS-PLAN.md` | Patrocínio a 30% nos cenários | Os números da seção 3.4 |
| P2 §2.6, §5.6, §6.5 | Dois testes de demanda | Entra o terceiro: mercados abertos por quem não é da equipe |
| P2 §6.1, §6.2 | Canais: parceiros, X, sugestões, beta com pontuação, indicação, token A | Os quatro motores do slide. O beta pontua acerto, e não volume (P2 §3.5 já dizia): escrever isso ao lado de "não compramos volume com pontos" |
| P4 §3.3 | O beta abre sem indicação e sem patrocínio pago | "Referrals, day one" (decisão 9). A criação aberta e a taxa em SOL entram na ordem de construção |
| P4 §4.4 | Teto só global; contra quem empurra um resultado, "a equipe só abre perguntas cuja meta custe caro" | Essa defesa some (seção 4, itens 3 e 6) |
| P4 §6.1 | Lucas é "fundador e dono do produto"; Ronaldo é o CTO; o terceiro sócio não tem nome | Bernardo Nery, CEO; Lucas Galvão, COO e CLO; Ronaldo Pereira, CTO |
| P1 §1.1 | O mascote é "o pãozinho Baked" | A fala o chama de "Cacetinho" (decisão 11) |

### 2.2 Fica: o pitch confirma

- **O produto:** o pote e o problema dos concorrentes (P1 §2.1, P2 §3.3); a taxa de 10% do lado perdedor (P1 §3.3,
  P2 §4.1); o pagamento automático (P1 §3.9); a leitura da rede (P1 §4.4).
- **Os tipos** (P1 §4.2, §4.3): preço pela Pyth, queima, liquidez travada e SOL em staking são os exemplos do pitch.
  O que uma chave decide de graça continua fora.
- **O crescimento:** a indicação (P1 §3.8, P2 §4.4, P4 §4.7), com 20% da taxa por 90 dias e teto de 5 USDC na
  devolução; os 20 a 30 parceiros com um mercado grátis (P1 §3.7, P2 §4.3).
- **Os números de mercado:** P2 §2.2 a §2.5 sustentam os da tela e os da fala.
- **O roteiro** (P2 §6.1; P4 §1.2, §3.1, §4.1, §4.2): rede de testes agora; rede principal só com auditoria, carteira
  de várias assinaturas e teto.

### 2.3 O pitch não fala: fica, mais curto

| Seções | Como comprimir |
|---|---|
| P1 §3.5, fechamento | Regra e tabela. Acrescentar: o criador escolhe a duração, de 3 a 90 dias; menos de 24 horas, só a equipe |
| P1 §3.6, saída antecipada | Um parágrafo, com a fórmula em nota |
| P1 §3.7, patrocinador não divulgado; P4 §5, Cloak e demais peças de fora | Um parágrafo cada. Registrar a tensão: o pitch vende o projeto mostrando a própria promessa |
| P1 §4.6, disputa | A tabela dos passos e os três limites |
| P2 §3.1 a §3.3, concorrentes | A tabela inteira; as lições em um parágrafo cada |
| P2 §4.1 (destino 25% e 75%), §4.5 a §4.7 (fundo, tesouraria, recompra) | Uma seção só, "em espera" |
| P2 §5.5 (captação), §6.4 (lista de investidores) | Um parágrafo cada |
| P2 §5.6, critério de parada | Inteiro. É a decisão que limita a perda |
| P4 §2, §3.2, §3.4, §4.5, §4.6, §4.9, §6.2 a §6.5 | Metade. Atualizar P4 §2: Sprints 00 e 01 fechadas, programa novo com um leitor de preço e nenhuma instrução |
| P4 §7, regulação | Um terço, sem perder nenhum fato lido na fonte. O pitch não reduz esse risco |
| P3, tokens | De 11.900 para 2.500 palavras |
| Objeções (P1 §5.2, P2 §7.2, P3 §8.2, P4 §9.2) | Só as que mudaram de situação com o pitch |

## 3. As contas refeitas

### 3.1 Patrocínio: 10% no lugar de 30%

`prêmio = 0,90 × valor pago` e `Brot = 0,10 × valor pago`. A última coluna divide a parte do Brot por 2,63625%, o que
a operação recebe de cada dólar de volume (`3,70% × 75% × 95%`, P2 §5.2).

| Valor pago | Prêmio, antes e agora | Brot, antes e agora | Volume que rende o mesmo, antes e agora |
|---|---|---|---|
| 500 | 350 e 450 | 150 e 50 | 5.690 e 1.897 |
| 1.500 | 1.050 e 1.350 | 450 e 150 | 17.070 e 5.690 |
| 5.000 | 3.500 e 4.500 | 1.500 e 500 | 56.899 e 18.966 |

- Para pagar um mês de custo só com patrocínios de 500 eram precisos 36,7 (`5.500 ÷ 150`); agora são 110.
- No exemplo de P1 §3.7 (6.000 no SIM, 4.000 no NÃO, patrocínio de 1.500), o prêmio de 1.350 leva o SIM a pagar
  1,825 por dólar e o NÃO, 2,688. Eram 1,775 e 2,613.
- Nos cenários, com as quantidades de patrocínio pago de P2 §5.1, a parte do Brot em 24 meses cai de 9.900 para 3.300
  no razoável e de 21.750 para 7.250 no otimista. No ruim não há patrocínio.
- Os valores de 1.500 e 5.000 ficam como tamanhos supostos. A tela só diz "From $500".

### 3.2 A parte do criador: 1% do pote

`V` é o total do lado vencedor, `P` o do perdedor e `C` a parte do criador. A taxa do Brot é `0,10 × P`. São três
desenhos: o do slide, ao pé da letra, e duas alternativas, ambas **Proposta, aguardando decisão**.

| Desenho | Parte do criador | Vencedores recebem | Brot fica com |
|---|---|---|---|
| A. Ao pé da letra | `C = 0,01 × (V + P)`, tirado do pote | `0,99 V + 0,89 P` | `0,10 P` |
| B. Sai do prêmio, com teto | `C = mínimo(0,01 × (V + P); 0,90 P)` | `V + 0,90 P − C`, nunca menos que `V` | `0,10 P` |
| C. Sai da taxa do Brot | `C = mínimo(0,01 × (V + P); 0,10 P)` | `V + 0,90 P` | `0,10 P − C` |

Num pote de 1.000 USDC, quanto recebe cada 1 USDC do lado vencedor:

| Fatia do lado vencedor | Taxa do Brot | A | B | C | Brot em C |
|---|---|---|---|---|---|
| 30% | 70 | 3,067 | 3,067 | 3,100 | 60 |
| 50% | 50 | 1,880 | 1,880 | 1,900 | 40 |
| 60% (o pote do slide) | 40 | 1,583 | 1,583 | 1,600 | 30 |
| 90% | 10 | 1,089 | 1,089 | 1,100 | 0 |
| 97% | 3 | 1,018 | 1,018 | 1,028 | 0; o criador leva 3 |
| 99% | 1 | 0,999 | 1,000; o criador leva 9 | 1,009 | 0; o criador leva 1 |

- **Em A e em B, quem paga é sempre quem acerta.** O prêmio encolhe em 1% do pote. No pote do slide os vencedores
  recebem 950, e não os 960 da tela. "Tirar do lado perdedor" não muda isso: quem perde já perde tudo.
- **A e B só diferem acima de 98,89% do pote num lado** (`1 ÷ (1 + 0,01 ÷ 0,89)`), quando o lado perdedor é menor
  que 1,12% do vencedor. Aí, em A, quem acerta recebe menos do que pôs. O número do plano do pitch confere.
- **"Só do lado perdedor" vale para a taxa do Brot, e não para o custo de quem entra.** Em A e B, o pote meio a meio
  perde 6%: 5 da taxa e 1 do criador. A faixa do setor em P1 §3.3 vai de 1,9% a 5% (INFERÊNCIA).
- **Em pote desigual o criador ganha tanto quanto a casa, ou mais.** O 1% do pote equivale a 2% do lado perdedor no
  meio a meio, a 10% no 90 a 10 (igual à taxa do Brot) e a 20% no 95 a 5.
- **Em C o Brot perde 1 ponto do pote em quase todo formato.** A receita esperada (`2 × 0,10 × q × (1 − q)`, menos
  o 1%, com o teto) cai de 5,0% para 4,0% no meio a meio e de 1,8% para 0,8% no 90 a 10. Com todo o volume em
  mercados de criador, a taxa média cai de 3,70% para 2,70% na mistura de base, de 4,18% para 3,18% na equilibrada
  e de 2,70% para 1,86% na de favorito claro. Com uma fração `s` do volume nesses mercados, na mistura de base:
  `taxa média = 3,70% − s × 1,00%`.
- **Entrar nos dois lados do próprio mercado não compensa.** Em A, quem põe 500 em cada lado recebe 950 de 1.000.
  Em C, num pote muito desigual, sai de graça, o que permite inflar volume sem custo.

### 3.3 A taxa de abertura: 0,02 SOL

`receita do mês = N × (0,02 × PREÇO_SOL − ALUGUEL)`. `N` é o número de mercados abertos no mês, `PREÇO_SOL` é o preço
do SOL em dólares, e aluguel é o depósito que a Solana exige para manter uma conta aberta. Nenhum dos três está no
repositório. A tabela é **ilustração, não fato**, e ignora o aluguel.

| `PREÇO_SOL` suposto | Por mercado | 100 mercados no mês | Mercados para pagar sozinhos os 5.500 |
|---|---|---|---|
| 100 | 2 | 200 | 2.750 |
| 200 | 4 | 400 | 1.375 |
| 300 | 6 | 600 | 917 |

- **Como barreira:** abrir 1.000 mercados de lixo custa 20 SOL (`1.000 × 0,02`).
- **Para o criador:** ele recupera a taxa quando o pote passa do equivalente a 2 SOL (`0,02 ÷ 1%`).
- **O que ela cobre:** 0,02 SOL pagam 4.000 transações de rede a 0,000005 SOL (FATO, P1 §3.9). Só o cofre de USDC
  do mercado pede cerca de 0,002 SOL de aluguel (FATO, P4 §4.5), 10% da taxa. O da conta do mercado não foi medido.
- **O que o pitch não diz:** para onde vão os 0,02 SOL (decisão 2).

### 3.4 Taxa média, ponto de equilíbrio e cenários

`equilíbrio = 5.500 ÷ (taxa média × 75% × 95%)`, como em P2 §5.2. O caixa parte de −7.500. Na coluna do razoável:
mês em que a operação se paga; ponto mais baixo do caixa; caixa no mês 24.

| Rodada | O que mudou na entrada | Taxa média | Equilíbrio por mês | Razoável | Otimista, mês 24 | Ruim, mês 24 |
|---|---|---|---|---|---|---|
| v0.0.2 | Nada | 3,70% | 208.630 | 9; −27.474; 27.767 | 798.462 | −116.565 |
| R1: pitch ao pé da letra (desenho A ou B) | Patrocínio de 30% para 10% | 3,70% | 208.630 | 9; −27.674; 21.467 | 783.963 | −116.565 |
| R2: desenho C, metade do volume em mercados de criador | Patrocínio a 10%; taxa média menor | 3,20% | 241.228 | 10; −31.200; 2.370 | 660.150 | −119.664 |
| R3: desenho C, todo o volume em mercados de criador | Patrocínio a 10%; taxa média menor | 2,70% | 285.900 | 12; −36.008; −15.826 | 536.338 | −122.763 |

- **Com o pitch ao pé da letra, o ponto de equilíbrio não muda:** 208.630 dólares por mês. O corte do patrocínio
  custa 6.300 de caixa em 24 meses no razoável e 14.499 no otimista.
- **R1 com outras misturas** (razoável): a 2,70%, mês 12, −36.008 e −15.826; a 4,18%, mês 8, −25.102 e 40.150.
- **Mudam junto em R1:** o fundo de prêmios do razoável soma 65.755 até o mês 24 (eram 66.055); os 20% do resultado
  do segundo ano, usados em P3 §1.5, caem de 10.932 para 9.732, ou de 911 para 811 por mês.
- **A alavanca grande é de onde sai o 1%.** O desenho C pode custar 27% da taxa na mistura de base.

**O que não foi possível refazer:**

1. **As trajetórias de volume.** São as suposições da v0.0.1. O pitch afirma que criadores e parceiros trazem volume,
   e não há dado para mudar a curva.
2. **A receita da taxa de abertura:** faltam `N` e `PREÇO_SOL`.
3. **A fração `s`** do volume em mercados de criador.
4. **A mistura de perguntas com criação aberta.** A fala diz que o criador busca a pergunta dividida, o que levaria a
   4,18%; mercados de lixo levariam ao contrário.
5. **O 1% do pote de um lado só,** que já estava fora do modelo.
6. **O custo dos serviços com muitos mercados.** O modelo mantém "até 1.000" de infraestrutura.

## 4. O que a mudança cria

1. **"No human in the loop" contra a janela de 6 horas.** Ao pé da letra, saem a janela (P1 §4.5) e a revisão humana
   da disputa (P1 §4.6). Consequência: uma leitura errada é paga sem volta, e o risco crítico dos dois serviços
   parados (P4 §8) fica sem proteção. **Proposta, aguardando decisão:** manter a janela como freio que só devolve e
   escrever "nenhuma pessoa escolhe o vencedor". Como o pitch não cita a janela, o plano a mantém e registra o
   conflito.
2. **"Dentro das regras" precisa ser código.** O mínimo: só os cinco tipos; o programa confere a conta na criação,
   como P1 §4.1 já previa; sem texto livre, com a frase montada pelo site a partir do tipo, da conta, da meta e da
   data; uma lista de contas aceitas (preços da Pyth, tokens, pools); duração de 3 a 90 dias; taxa fixada pelo
   programa. Com texto livre, o criador escreve uma coisa e o programa lê outra.
3. **Empurrar o resultado sem ninguém escolhendo as metas.** Na v0.0.2 a defesa era a equipe abrir só metas caras
   (P4 §4.4). Exemplo: alguém cria um token sem valor, abre "a oferta cai para X até o dia 30", espera entradas no
   NÃO e queima os próprios tokens, de graça. "Queimar custa dinheiro" só vale para token que vale dinheiro. Com
   stake é parecido: ele não se perde, só muda de lugar. Pede lista de contas aceitas ou teto por mercado.
4. **O criador com lado no próprio mercado.** É o risco do patrocinador não divulgado (P1 §3.7), sem ninguém
   identificado. Sem cadastro não há como proibir. O aviso "quem abriu pode controlar o resultado e pode ter
   escolhido um lado" precisa ser automático nos tipos em que dá para empurrar.
5. **Lixo, e a evidência contrária.** O PNP tem criação aberta e dá 30% da taxa ao criador: 206 transações em seis
   meses (FATO, P2 §2.3). Na Limitless, a criação aberta não segurou o volume (P2 §3.3). O plano precisa dizer que
   criação aberta não é motor de crescimento provado, e como a página inicial ordena os mercados.
6. **Ocupar o teto global.** O teto é a soma dos potes abertos (P4 §4.4). Quem abre um mercado de 90 dias e entra
   sozinho com um valor alto não paga taxa (P1 §3.4) e trava o teto para todos. Pede teto por mercado ou carteira.
7. **Uma segunda moeda.** O fundador decidiu: "A moeda vai ser usdc, vamos abandonar a ideia de sol." O SOL volta
   pela taxa de abertura: caixa exposto ao preço dele, contabilidade em duas moedas e uma regra de guarda (P4 §4.9).
8. **O ciclo do patrocinador.** O pedido com resposta em 14 dias perde a função. Em aberto: patrocinar mercado aberto
   por outra pessoa; se o 1% do criador incide sobre o prêmio (num pote de 10.000 com prêmio de 4.500 seriam 145,
   dos quais 45 do prêmio); e que contrapartidas cabem em 10% (50 dólares num patrocínio de 500).
9. **A pilha sobre a taxa.** Tesouraria (25%), indicação (20%), criador (no desenho C) e desconto do token (até 40%,
   P3 §4.3) saem da mesma taxa. Falta a ordem.
10. **Mercado anulado e pote de um lado só.** Falta dizer se o criador recebe e se os 0,02 SOL voltam.
11. **Exposição jurídica.** São perguntas para a avaliação jurídica, a somar a P4 §7.6, e não conclusões:
    (a) abrir a criação a qualquer pessoa muda o papel da empresa, de quem oferece para quem hospeda? (b) o criador
    que recebe 1% vira operador ou agente, e o que isso significa para um criador no Brasil? (c) receber SOL como
    taxa e pagar criadores cria dever fiscal ou de registro? (d) a "taxa de marketing" é serviço de publicidade,
    diante do art. 16 da MP 1.394? (e) trocar "aposta" por "escolher um lado" muda a classificação? (f) quem
    responde por um mercado aberto por um terceiro sobre o token de outro?
12. **Privacidade.** Três nomes num slide, sem registro do de acordo do Bernardo e do Ronaldo. P4 §6.1 dizia que no
    hackathon a equipe se apresenta como uma pessoa.
13. **Prazo e documentos seguintes.** O hackathon fecha em 12/10/2026, e o programa novo não tem instrução. O resumo
    de produto (F7, F11, R-20, R-32), o plano técnico (§3.4.1, com `proposer`, `approver` e `SponsorRequest`) e a
    Sprint 02 dependem destas regras. Esta revisão não os altera.
14. **Frases do deck que o plano precisa dizer com precisão.** "We only earn from the losing side": o Brot também
    recebe a taxa de marketing, a taxa de abertura e o 1% do pote de um lado só. "Winners get their money back, plus
    the rest": não vale em pote de um lado só nem, no desenho A, acima de 98,89%. "Share to take a side": é um cartão
    para compartilhar, e não condição para entrar. "SOM": é o volume inteiro do World, e não a nossa fatia.

## 5. Esqueleto do plano v0.0.3

Quatro partes, **28.450 palavras**, cerca de 59 páginas a 480 palavras por página. O fundador pediu de 30 a 80
páginas; a meta de trabalho vai de 24.000 a 32.000 palavras. Cada parte pode variar 10%.

**Regras de escrita.** As marcas são **Decisão** (citação e data de 4 ou 5/10/2026), **Decisão do pitch** (regra do
deck de 7/10/2026, citada em inglês como está na tela) e **Proposta, aguardando decisão**. No texto de produto usa-se
"mercado", "entrar" e "escolher um lado"; "aposta" fica para o capítulo de regulação, que discute a lei com as
palavras da lei. "Taxa de criador" é só a do pump.fun (P3 §3.3); o 1% chama-se "parte de quem abriu o mercado". Onde
uma regra espera decisão, o texto traz o que o pitch diz ao pé da letra, a consequência e a alternativa. A última
tabela desta seção diz de qual seção antiga vem o texto de cada seção nova.

### Parte 1: Produto (9.450 palavras; eram 11.942)

| Seção nova | Palavras | O que precisa dizer; o que cai |
|---|---|---|
| Cabeçalho e "o que mudou desde a v0.0.2" | 350 | As mudanças desta revisão, em lista |
| 1. Resumo | 800 | A frase da capa em português. O exemplo de 600 e 400. O que está decidido e o que falta |
| 2.1 Um mercado de previsão em que o projeto é cliente | 400 | O pote e os três concorrentes; "growth engine". Cai a história do código antigo |
| 2.2 Três públicos | 450 | O projeto, quem escolhe um lado e quem abre. Os números do pump.fun |
| 2.3 O que existe hoje | 200 | Estado do repositório. A tabela de comparação encolhe |
| 3.1 O pote, as duas moedas e os cinco estados | 350 | Duas trilhas. USDC no pote, SOL só na abertura. A tabela dos estados |
| 3.2 A conta do pote | 450 | A tabela do exemplo-base e as duas consequências. O teto por mercado passa de "guardado" a "em aberto" |
| 3.3 A taxa: 10% do lado perdedor | 600 | A decisão, a fórmula e as tabelas 1 e 2. A tabela 3 vai para a Parte 2. Cai a história dos 3% |
| 3.4 A parte de quem abriu: 1% do pote | 650 | A seção 3.2 desta revisão: os três desenhos, a tabela, quem paga, o limiar de 98,89% |
| 3.5 Pote de um lado só e mercado anulado | 350 | As duas regras e o exemplo da Ana. O 1% e os 0,02 SOL nesses casos |
| 3.6 Fechamento | 350 | A regra, a tabela e o exemplo do oportunista. O criador escolhe a duração |
| 3.7 Patrocínio: 90% de prêmio, 10% de taxa de marketing | 650 | Os quatro passos do slide. A tabela 90/10. Prêmio neutro e entrada num lado. O aviso. Caem as faixas como regra e o pedido de pergunta |
| 3.8 Parceiros de lançamento | 200 | De 20 a 30, um mercado grátis, duas publicações |
| 3.9 Indicação | 300 | As duas regras, o exemplo da Bia e o teto |
| 3.10 Pagamento automático; a saída antecipada guardada | 250 | As duas consequências práticas. A saída em um parágrafo |
| 4.1 Quem abre um mercado | 550 | Qualquer carteira, 0,02 SOL, passo a passo. O projeto abre o próprio. Caem os dois ciclos e as sugestões pelo X |
| 4.2 Dentro das regras: o que o programa aceita | 800 | O glossário e a tabela dos tipos. As regras da seção 4, item 2. Caem as três saídas (a), (b), (c) |
| 4.3 O que fica fora | 350 | Chave única, padrão novo de token, preço de token pequeno, opinião, esportes |
| 4.4 Como o mercado se resolve | 350 | Os três passos, os dois serviços, a regra "prazo vencido é NÃO" |
| 4.5 A janela de 6 horas e a disputa | 400 | As três regras, a tabela da disputa e o conflito com "No human in the loop" |
| 4.6 Como falamos disso | 350 | A frase de elevador, a da capa e o lema. A tabela "em vez de, dizemos". O aviso de fase de testes |
| 5. Decisões e pontos abertos | 300 | O que o pitch decidiu e as decisões da seção 6 que tocam o produto |

### Parte 2: Mercado e negócio (9.550 palavras; eram 11.993)

| Seção nova | Palavras | O que precisa dizer; o que cai |
|---|---|---|
| Cabeçalho | 300 | Os termos e o que mudou |
| 1. Resumo | 700 | Os números do slide, as quatro receitas, o equilíbrio e os cenários de R1 |
| 2.1 TAM, SAM e SOM | 400 | Os três números, o que cada um mede, a etiqueta e o que não são (seção 7) |
| 2.2 O tamanho do setor e as duas réguas | 350 | A tabela e os três sinais de alerta |
| 2.3 O que os entrantes recentes alcançaram | 350 | A tabela. O World com os quatro meses, e não só dois |
| 2.4 Os três públicos em números | 400 | A tabela do pump.fun. Os perfis, com um quinto: quem abre mercados. Tudo hipótese |
| 2.5 A demanda não foi demonstrada: três testes | 400 | O beta, os parceiros e os criadores, com as réguas |
| 3.1 Os cinco concorrentes, lado a lado | 450 | A tabela, com a linha do Brot refeita |
| 3.2 O que cada um ensina | 400 | Um parágrafo por concorrente. PNP e Limitless como aviso sobre criação aberta |
| 3.3 Onde ficamos e o que copiamos | 400 | As cinco conclusões. A criação aberta e a parte do criador entram no que copiamos |
| 4.1 As quatro receitas | 250 | Taxa do pote, taxa de marketing, taxa de abertura, 1% do pote de um lado só |
| 4.2 A taxa e o destino dela | 400 | A taxa média e as três misturas. O destino de 25% e 75% |
| 4.3 Patrocínio | 450 | A seção 3.1 desta revisão. A falta de precedente e o preço do DexScreener |
| 4.4 Quem abre: a taxa de abertura e o 1% | 450 | As seções 3.2 e 3.3 desta revisão, pelo lado do caixa |
| 4.5 Parceiros e indicação | 350 | As regras, a conta de 1.500 e o custo da indicação |
| 4.6 Em espera: fundo de prêmios, tesouraria, recompra e fase 2 | 400 | Um parágrafo e um número cada |
| 5.1 Premissas | 350 | A tabela, com as premissas novas e os parâmetros sem valor |
| 5.2 Ponto de equilíbrio | 250 | A tabela das misturas e a linha do desenho C |
| 5.3 Os três cenários | 600 | As três tabelas em R1, nos meses 6, 12, 18 e 24 |
| 5.4 Se uma premissa mudar | 300 | A mistura, o desenho do 1% e a fração `s` |
| 5.5 Capital, captação e critério de parada | 300 | A tabela de capital, a captação buscada e o critério inteiro |
| 5.6 Metas de 90 dias e o que o modelo não sabe | 300 | A tabela, com uma linha de mercados abertos por terceiros. O que não foi refeito |
| 6.1 Agora, lançamento, rede principal | 200 | Os três marcos do slide, sem data nova |
| 6.2 Os quatro motores de crescimento | 400 | Parceiros, indicação, o cartão para o X e os criadores. Por que não há mídia paga. Falta o canal grande |
| 6.3 O que medir | 150 | A tabela, com os criadores |
| 7. Decisões e pontos abertos | 250 | O que continua aberto e as objeções que mudaram |

### Parte 3: Tokens (2.500 palavras; eram 11.899)

| Seção nova | Palavras | O que precisa dizer; o que cai |
|---|---|---|
| 1. O que o pitch diz e o que este capítulo vale | 250 | O token não faz parte do que é apresentado. Nada é promessa. Caem os casos de quem já fez |
| 2. Token A: o desenho guardado | 500 | Canal de tração sem vínculo com a empresa; a taxa de criador do pump.fun vai para o fundo de prêmios; os quatro testes. Cai a explicação longa do pump.fun |
| 3. Token B: em espera, com dois pontos em conflito | 600 | Staking, desconto e distribuição, em tabela. O cofre e o voto em conflito com a resposta pronta |
| 4. A ponte e o calendário | 300 | A ponte em um parágrafo. A ordem: o A com o produto utilizável, o B depois do equilíbrio |
| 5. O tamanho do dinheiro | 250 | Os três números, refeitos: 811 por mês para o cofre em R1 |
| 6. Regulação e riscos | 350 | A lista da avaliação jurídica sobre tokens, inteira |
| 7. Decisões | 250 | As sete de 5/10/2026 em uma tabela, e a decisão 8 da seção 6 |

### Parte 4: Construção e risco (6.950 palavras; eram 11.998)

| Seção nova | Palavras | O que precisa dizer; o que cai |
|---|---|---|
| Cabeçalho | 250 | O que mudou |
| 1. Resumo | 500 | A ordem, os três critérios, as tensões e os riscos maiores, com os novos |
| 2.1 O que existe hoje | 250 | O programa congelado e o novo, com um leitor de preço e nenhuma instrução |
| 2.2 O que se aproveita, o que é novo e as peças de fora | 350 | Novo: criação aberta, taxa em SOL, parte de quem abriu. Cloak e demais peças em uma tabela |
| 3.1 Agora, lançamento, rede principal e as fases seguintes | 300 | A tabela das quatro fases, alinhada aos três marcos |
| 3.2 O prazo | 300 | O que cabe e o que não cabe, com o escopo novo |
| 3.3 A ordem de construção | 400 | Núcleo primeiro. Onde entram a criação aberta e a indicação |
| 3.4 O que conta como pronto | 200 | Lista curta |
| 4.1 Os três critérios: auditoria, várias assinaturas e teto | 400 | As decisões e o que falta: valores e nomes |
| 4.2 Quem pode o quê | 300 | A tabela, com "abrir mercado: qualquer carteira, dentro das regras" |
| 4.3 As regras de criação, no programa | 450 | A seção 4, itens 2, 3, 4 e 6 |
| 4.4 Os tetos | 300 | O teto global e o exemplo. O teto por mercado, em aberto |
| 4.5 Os serviços, a janela e o pagamento | 300 | Os dois serviços, a pausa, o plano de incidente e o custo com muitos mercados |
| 4.6 Patrocínio, indicação e a parte de quem abriu | 300 | O que o programa garante. Os 10% quando o prêmio volta. A pilha sobre a taxa |
| 4.7 Tesouraria, SOL e a carteira do serviço | 200 | USDC separado; onde fica o SOL recebido |
| 5.1 A equipe | 300 | Os três nomes e cargos, com a ressalva do de acordo. As linhas sem dono |
| 5.2 Empresa, custos e acordo sobre o código | 250 | A tabela de custos. O que não tem preço |
| 6.1 Regulação: o que foi lido e o que não foi | 400 | Todos os fatos lidos na fonte, sem comentário longo |
| 6.2 A lista da avaliação jurídica | 350 | Os doze pontos e as seis perguntas novas |
| 7. Riscos | 600 | A tabela, com as linhas da seção 4 |
| 8. Decisões e pontos abertos | 250 | As oito de 5/10/2026 e as que tocam a construção |

### De onde vem cada seção antiga

| Parte | Seção antiga → seção nova |
|---|---|
| P1 | §1 → 1; §2.1 → 2.1; §2.2 → 2.2; §2.3 → 2.3; §2.4 → Parte 3, 2; §3.1 → 3.1; §3.2 → 3.2; §3.3 → 3.3; §3.4 → 3.5; §3.5 → 3.6; §3.6 → 3.10; §3.7 → 3.7 e 3.8; §3.8 → 3.9; §3.9 → 3.10; §4.1 → 4.1; §4.2 → 4.2; §4.3 → 4.3; §4.4 → 4.4; §4.5 e §4.6 → 4.5; §4.7 → 4.6; §5 → 5 |
| P2 | §1 → 1; §2.1 e §2.2 → 2.2; §2.3 → 2.3; §2.4 e §2.5 → 2.4; §2.6 → 2.5; §3.1 e §3.2 → 3.1; §3.3 → 3.2; §3.4 e §3.5 → 3.3; §4.1 → 4.1 e 4.2; §4.2 → 4.3; §4.3 e §4.4 → 4.5; §4.5 a §4.8 → 4.6; §5.1 → 5.1; §5.2 → 5.2; §5.3 → 5.3; §5.4 → 5.4; §5.5 → 5.5; §5.6 → 5.5 e 5.6; §5.7 → 5.6; §6.1 → 6.1; §6.2 → 6.2; §6.3 → Parte 3, 2; §6.4 → 5.5; §6.5 → 6.3; §7 → 7 |
| P3 | §1 e §2 → 1; §3 → 2; §4 → 3; §5 e §6 → 4; §1.5 → 5; §7 → 6; §8 → 7 |
| P4 | §1 → 1; §2.1 → 2.1; §2.2 a §2.4 e §5 → 2.2; §3.1 → 3.1; §3.2 → 3.2; §3.3 → 3.3; §3.4 → 3.4; §4.1 e §4.2 → 4.1; §4.3 → 4.2; §4.4 → 4.4; §4.5 e §4.6 → 4.5; §4.7 e §4.8 → 4.6; §4.9 → 4.7; §6.1 e §6.2 → 5.1; §6.3 a §6.5 → 5.2; §7.1 a §7.5 → 6.1; §7.6 → 6.2; §8 → 7; §9 → 8 |

Seções novas, sem origem: Parte 1, 3.4; Parte 2, 2.1 e 4.4; Parte 4, 4.3.

## 6. O que o fundador ainda precisa decidir

| Nº | Decisão | Recomendação |
|---|---|---|
| 1 | De onde sai o 1% de quem abriu o mercado | Desenho B: sai do prêmio, com teto. Não custa receita e mantém "quem acerta nunca recebe menos do que pôs". O plano diz, sem rodeio, que o prêmio de quem acerta encolhe 1% do pote |
| 2 | Para onde vão os 0,02 SOL | Para o Brot, sem devolução, descontado o aluguel das contas. Devolver enfraquece a barreira contra lixo |
| 3 | Patrocínio: as faixas de 1.500 e 5.000 e as contrapartidas | 500 como piso, sem faixas fixas. Selo, nome e link em todos; publicações e destaque caso a caso, porque 50 dólares não pagam quatro publicações |
| 4 | O pedido de pergunta com resposta em 14 dias | Sai. O projeto abre o próprio mercado e deposita o prêmio na mesma hora |
| 5 | "No human in the loop" e a janela de 6 horas | Manter a janela até a auditoria e trocar a frase por "no human picks the winner". Sem a janela não há volta para leitura errada |
| 6 | A equipe abre mercados? Fica com o 1% deles? | Abre, para haver mercado de preço no primeiro dia. Sem o 1%, que fica com quem acertou, para o slide de receita continuar verdadeiro |
| 7 | Tipos em que dá para empurrar o resultado (queima, liquidez, stake), abertos a qualquer um | Lista de contas aceitas, mantida pela carteira de várias assinaturas, e teto por mercado nesses tipos. O preço pela Pyth abre para todos desde o início |
| 8 | Token B: o cofre e o voto, diante de "não dá direito a receita nem a voto" | Confirmar a resposta pronta. Se ela vale, o B fica só com o desconto na taxa, em espera |
| 9 | "Referrals, day one" e a ordem de construção | "Day one" é o primeiro dia na rede principal. O beta abre sem indicação, como já decidido |
| 10 | O 1% sobre o prêmio do patrocinador, no mercado anulado e no pote de um lado só | Só sobre as entradas, nunca sobre o prêmio. Nada no mercado anulado nem no pote de um lado só |
| 11 | O nome do mascote: Baked ou Cacetinho | Baked nos documentos e na marca; Cacetinho como apelido falado. Confirmar |
| 12 | Equipe: cargos e o de acordo do Bernardo e do Ronaldo | Pedir o de acordo por escrito antes de o plano trazer os nomes. Até lá, cargos sem sobrenome |
| 13 | Texto livre no mercado | Não. O site monta a frase a partir dos parâmetros |
| 14 | O criador escolhendo lado no próprio mercado | Permitir, com aviso automático. Proibir não é possível sem cadastro |

## 7. Afirmações do pitch sem fonte no repositório

| Afirmação | Onde | Situação |
|---|---|---|
| "0.02 SOL", "1% of the pot", "90%" e "10%" | Slides 6 e 7 | Regras escolhidas, e não fatos. A única referência no repositório é o PNP: 30% de uma taxa de 1% por negociação (P2 §3.2) |
| "pump.fun style" | Slide 7 | O repositório descreve o pump.fun como lançador de tokens (P3 §3.1). Quanto custa criar lá não está registrado. Vale como imagem, e não como comparação de preço |
| "Creators hunt for the questions that split the timeline, and promote their own markets"; "quem cria, vende"; "Treta gera FOMO" | Slides 5 e 7, fala | Hipóteses. A evidência disponível aponta para o outro lado: PNP e Limitless (P2 §2.3, §3.3) |
| "a parte que ninguém está fazendo" | Fala, slide 6 | O plano sustenta menos: nenhum dos cinco concorrentes estudados, em busca limitada (INFERÊNCIA, P2 §3.4) |
| SAM "~$0.9B" | Slide 4 | INFERÊNCIA: `20% × 4,63 bilhões = 0,926`. A fatia de cripto é da Polymarket em maio de 2026; o volume, da Polymarket em setembro. Vale para uma plataforma, e não para o setor |
| SOM "$15.4M" | Slide 4 | FATO SECUNDÁRIO (DefiLlama): o volume inteiro do World em setembro. O rótulo "SOM" é nosso. O plano precisa de 1,4% disso para se pagar (P2 §5.2) |
| "13× in three months" | Slide 4 | Confere: `15,44 ÷ 1,14 = 13,5`. A tela omite que agosto foi 22,20 e que setembro caiu 30%, e os alertas de P2 §2.2 e §2.4 |
| "porta de entrada de 40% dos novos usuários" | Fala, slide 4 | A fonte diz 40% da atividade inicial dos novos usuários da Polymarket, no primeiro trimestre de 2026 (P2 §2.5) |
| "80 milhões de carteiras [...] gente que já entra em narrativa todo dia" | Fala, slide 4 | São 80 milhões desde a criação. Ativas por mês eram 1,8 milhão em dezembro de 2025, de fonte fraca, e carteira não é pessoa (P2 §2.4) |
| "No human in the loop"; "sem chave da empresa" | Slide 3 | Contrariadas pelas regras do próprio plano: a chave que anula, a pausa e a carteira de várias assinaturas |
| "7 of 30 launch spots taken" | Slide 8, animação | Sete marcas fictícias, com a etiqueta "example". Não há parceiro fechado registrado |
| Cargos da equipe | Slide 9 | Proposta. O plano não trazia o nome do Bernardo |

As demais afirmações da tela têm fonte na v0.0.2: os 7 milhões sem reembolso, os 4 a 6 dias, a chave do World, os
dois modelos do PNP, os 21,7 bilhões, os números da Polymarket e os três critérios da rede principal.
