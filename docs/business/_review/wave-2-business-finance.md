# Onda 2, agente 2B: red team de negócio e finanças

Data: 4 de outubro de 2026.

Papel deste relatório: atacar receita, preço, custos, margens, aquisição de clientes e realismo financeiro do Baked
Market, e propor uma correção para cada furo. As decisões do fundador (seção 1 de
`ideacao-perguntas-e-respostas.md`) não foram alteradas. Onde a conta vai contra uma decisão, o relatório mostra a
conta e uma alternativa, e a escolha continua sendo do fundador.

Legenda: **FATO** = fonte primária (página oficial, dado on-chain, arquivo do repositório). **FATO SECUNDÁRIO** =
imprensa, agregador, blog de fornecedor. **INFERÊNCIA** = conta ou raciocínio meu, com as premissas à vista.
**SUPOSIÇÃO** = número que eu escolhi para poder fazer a conta, sem fonte. Toda suposição está na tabela do anexo.

Limites desta rodada (leia antes de usar os números):

- Não existe nenhum dado de uso do Baked Market: o programa está em devnet e o modelo de pote ainda não foi escrito.
  Todo volume, número de apostadores e número de patrocinadores deste arquivo é SUPOSIÇÃO ou comparação.
- Os custos novos que eu trouxe (auditoria, empresa no exterior, parecer jurídico) vêm de blogs de fornecedores, lidos
  em trechos pela busca Exa, uma leitura só. Servem como faixa, não como orçamento. O preço do RPC é da página oficial.
- Os volumes dos concorrentes vêm das pesquisas da Onda 1 (`top-5-competitor-analysis.md`, `market-research.md`). Não
  os reabri.
- Não opino sobre o que a lei permite. Os pontos jurídicos estão marcados "para advogado".

## Resumo em dez linhas

1. De cada 100 dólares apostados, 3 viram taxa e só 0,75 paga a operação. O volume de equilíbrio é de US$ 400 mil
   por mês com dois fundadores sem salário, US$ 1,33 milhão com equipe enxuta e US$ 3,33 milhões no custo de
   US$ 25 mil do `ECONOMICS.md`. A divisão em quatro multiplica por quatro o volume necessário.
2. US$ 3,33 milhões por mês é 22% do que o World faz dentro da Phantom e 31% do Limitless de setembro de 2026, que
   captou US$ 17 milhões. E o pote não gira o dinheiro: o mesmo dólar só paga taxa uma vez por pergunta.
3. Os 3% estão na faixa do mercado na média, mas a forma está errada: taxa fixa sobre o pote inteiro custa de 4 a 9
   vezes mais que a do líder em apostas no favorito, e acima de 97% num lado quem acerta perde dinheiro.
4. Patrocínio de pergunta não tem precedente pago em nenhum concorrente. No cenário base (três patrocinadores por
   mês) rende de US$ 750 a 1.750 por mês à banca. A faixa de US$ 500 não paga o tempo de vendê-la à mão.
5. O fundo de prêmios só se paga se um quarto de todo o volume da plataforma existir por causa dele. Nenhuma
   plataforma publicou esse retorno, e as campanhas de 2026 perderam de 80% a 96% do volume quando acabaram.
6. Mandar 25% da taxa bruta para Bitcoin antes de cobrir custos equivale a captar dinheiro para comprar Bitcoin:
   durante a subida do volume, cada dólar de déficit da operação é igual a um dólar enviado à tesouraria.
7. A recompra é pequena perto dos desbloqueios do token: US$ 7.500 por mês com US$ 1 milhão apostado, contra
   US$ 42 mil a 150 mil por mês de tokens destravados numa avaliação de US$ 5 milhões.
8. Um apostador que deposita US$ 200 por mês durante seis meses deixa US$ 9 para a operação. Os custos de aquisição
   documentados em cripto vão de US$ 77 a mais de US$ 2.000. Aquisição paga não fecha; só a orgânica.
9. Antes do primeiro dólar de taxa há de US$ 30 mil a 75 mil de gasto (auditoria, empresa, advogado, prêmios
   iniciais). Capital até o equilíbrio: cerca de US$ 65 a 110 mil, US$ 180 a 225 mil ou US$ 480 a 525 mil, conforme
   o nível de custo. Nenhuma das fontes de capital previstas está garantida.
10. O programa é de um sócio só (11 de 16 commits, licença MIT em nome dele), a divisão entre os sócios não foi
    tratada e a reescrita ainda não começou. É o risco que pode parar tudo sem que nenhuma conta acima importe.

---

## 1. A conta-base: o caminho de cada dólar apostado

O que é: antes de atacar, fixo a conta que todo o resto usa. Decisões do fundador: taxa de 3% do pote; destino em
quatro partes iguais.

| De cada US$ 100 apostados | Valor | Parcela do volume |
|---|---|---|
| Voltam aos vencedores | US$ 97,00 | 97% |
| Taxa da casa | US$ 3,00 | 3% |
| Tesouraria em Bitcoin (25% da taxa) | US$ 0,75 | 0,75% |
| Operação (25%) | US$ 0,75 | 0,75% |
| Recompra e queima do token da venda privada (25%) | US$ 0,75 | 0,75% |
| Fundo de prêmios (25%) | US$ 0,75 | 0,75% |

Leitura (INFERÊNCIA): a "margem" que paga as contas da empresa não é 3%, é 0,75% do volume. As outras três partes
têm destino carimbado: uma vira um ativo volátil guardado (Bitcoin), uma some (queima) e uma volta aos apostadores
(prêmios). O próprio fundador já disse que os 25% da operação "não deve ser todo o custo que foi estimado"; por isso
a seção 2 usa três níveis de custo, e não só o do `ECONOMICS.md`.

| Volume apostado por mês | Taxa (3%) | Operação | Bitcoin | Recompra | Prêmios |
|---|---|---|---|---|---|
| US$ 100 mil | 3.000 | 750 | 750 | 750 | 750 |
| US$ 400 mil | 12.000 | 3.000 | 3.000 | 3.000 | 3.000 |
| US$ 1 milhão | 30.000 | 7.500 | 7.500 | 7.500 | 7.500 |
| US$ 1,33 milhão | 40.000 | 10.000 | 10.000 | 10.000 | 10.000 |
| US$ 3,33 milhões | 100.000 | 25.000 | 25.000 | 25.000 | 25.000 |

---

## 2. Furo 1: o ponto de equilíbrio fica quatro vezes mais longe (severidade: crítica)

### 2.1 Os três níveis de custo

| Nível | Custo por mês | Do que é feito | Origem |
|---|---|---|---|
| 1. Dois fundadores sem salário | US$ 3.000 | RPC 499; site, dois agendadores e alarme 150; empresa no exterior 150; contador e advogado sob demanda 500; reserva para novas auditorias e recompensa por falha 1.700 | RPC: FATO (Helius). Empresa e auditoria: FATO SECUNDÁRIO. O resto: SUPOSIÇÃO |
| 2. Equipe enxuta | US$ 10.000 | O nível 1, mais 2.000 por fundador, 2.000 de comunidade e divulgação e 1.000 de suporte e plantão em meio período | SUPOSIÇÃO |
| 3. `ECONOMICS.md` | US$ 25.000 | Número do sócio para o cenário baixo. O próprio arquivo o chama de "placeholder" | FATO (arquivo do sócio) |

Por que o nível 1 não é zero: mesmo sem salário, um programa que guarda dinheiro de terceiros precisa de RPC pago,
de quem atenda o alarme do serviço de resolução e de nova auditoria a cada mudança (cada tipo novo de pergunta muda o
programa). Uma auditoria de programa simples custa de US$ 7 mil a 20 mil (FATO SECUNDÁRIO, Accretion, abr/2026);
US$ 20 mil por ano dão US$ 1.700 por mês.

### 2.2 O volume de equilíbrio

Conta (INFERÊNCIA): volume de equilíbrio = custo mensal ÷ 0,75%.

| Nível de custo | Custo por mês | Volume de equilíbrio por mês | Por ano | Se 50% da taxa pagasse custo | Se 100% pagasse |
|---|---|---|---|---|---|
| 1. Sem salário | US$ 3.000 | **US$ 400.000** | US$ 4,8 mi | US$ 200.000 | US$ 100.000 |
| 2. Enxuta | US$ 10.000 | **US$ 1.333.333** | US$ 16 mi | US$ 666.667 | US$ 333.333 |
| 3. `ECONOMICS.md` | US$ 25.000 | **US$ 3.333.333** | US$ 40 mi | US$ 1.666.667 | US$ 833.333 |

A coluna "50%" é a divisão que o briefing propunha (50 operação, 25 recompra, 25 prêmios). A decisão de dividir em
quatro dobrou o volume de equilíbrio em relação àquela proposta e o quadruplicou em relação à taxa inteira.

### 2.3 Comparação com o que entrantes reais alcançaram

| Referência | Volume por mês | O que tinha a favor | Nível 1 (0,40 mi) é | Nível 2 (1,33 mi) é | Nível 3 (3,33 mi) é |
|---|---|---|---|---|---|
| World, set/2026 | US$ 15,44 mi | Está dentro da Phantom (cerca de 15 mi de usuários por mês, fonte fraca) | 2,6% | 8,6% | 21,6% |
| Limitless, set/2026 | US$ 10,75 mi | US$ 17 mi captados, token, pontos; pico de US$ 250,9 mi em mai/2026 | 3,7% | 12,4% | 31,0% |
| Limitless, ritmo de dez/2025 | US$ 11,5 mi (138 mi por ano) | Idem | 3,5% | 11,6% | 29,0% |
| Myriad, ritmo de dez/2025 | US$ 12,1 mi (145 mi por ano) | Pontos; depois caiu 93,8% do 1º para o 2º tri de 2026 | 3,3% | 11,0% | 27,6% |
| Previsão da Jupiter | US$ 5,5 mi em 30 dias | Maior agregador da Solana | 7,3% | 24,2% | 60,6% |
| PNP Protocol | Perto de zero | 206 transações em seis meses; token caiu 93% | n/a | n/a | n/a |
| Melee | Zero em dinheiro real | US$ 3,5 mi captados; ainda em rede de teste | n/a | n/a | n/a |

Fontes: DefiLlama e DeFiRate, via `top-5-competitor-analysis.md` e `market-research.md` (FATO e FATO SECUNDÁRIO). Os
"140 milhões por ano" de Limitless e Myriad são uma semana de dezembro de 2025 multiplicada por 52: número frágil.

Três razões pelas quais a comparação é pior do que as porcentagens sugerem (INFERÊNCIA):

1. **Eles têm distribuição ou capital, o Baked não tem nenhum dos dois.** O World nasce na tela inicial da carteira
   que o nosso público usa. O Limitless gastou US$ 17 milhões e uma campanha de pontos. O único projeto de Solana
   sem distribuição e sem capital na lista é o PNP, e está parado.
2. **Eles aceitam qualquer assunto.** Esportes eram 62% do volume do setor (Bernstein, abr/2026, via
   `market-research.md`). O Baked só aceita fato legível on-chain. A única medida achada de interesse por esse
   recorte: todos os mercados sobre o pump.fun no Polymarket somaram cerca de US$ 263 mil (agregador, sem data,
   `publico-web3.md`). O equilíbrio do nível 1 pede mais do que isso **todo mês**.
3. **O volume deles é dinheiro girando; o do pote é dinheiro parado.** Ver 2.4.

### 2.4 O pote não gira o capital

O que é: num livro de ordens, o mesmo dólar compra, vende e compra de novo, e paga taxa a cada vez. Num pote, o
dólar entra uma vez e fica preso até a resolução. O volume mensal de um pote é, no máximo, o dinheiro parado
multiplicado por quantas vezes as perguntas se resolvem no mês.

Evidência (FATO, DefiLlama via 1E): o World fez US$ 15,44 milhões em setembro de 2026 com US$ 170,8 mil de dinheiro
travado. Cada dólar girou cerca de 90 vezes no mês.

Conta (INFERÊNCIA): dinheiro médio travado necessário = volume de equilíbrio × duração média da pergunta ÷ 30 dias.

| Duração média entre a aposta e a resolução | Nível 1 | Nível 2 | Nível 3 |
|---|---|---|---|
| 3 dias (perguntas curtas de preço) | US$ 40 mil | US$ 133 mil | US$ 333 mil |
| 7 dias | US$ 93 mil | US$ 311 mil | US$ 778 mil |
| 30 dias (fatos de projeto: queima, renúncia, formatura) | US$ 400 mil | US$ 1,33 mi | US$ 3,33 mi |

Leitura: para pagar US$ 25 mil por mês com perguntas de uma semana, o Baked precisa manter travado 4,6 vezes o que
o World tem travado hoje. Com perguntas de um mês, quase 20 vezes. A duração da pergunta é uma alavanca financeira
tão forte quanto a taxa, e os nove tipos de pergunta já construídos são justamente os lentos.

### 2.5 Quantos apostadores isso representa

Não existe dado de aposta média (`publico-web3.md` registra "não achei"). Duas hipóteses para dar ordem de grandeza:

| Hipótese de depósito por carteira ativa por mês | Nível 1 | Nível 2 | Nível 3 |
|---|---|---|---|
| US$ 200 (SUPOSIÇÃO) | 2.000 carteiras | 6.667 | 16.667 |
| US$ 1.360 (Solana, dez/2025: US$ 28,6 mi ÷ 21 mil carteiras em três semanas, com giro de livro de ordens) | 294 | 980 | 2.451 |

O segundo número é otimista para um pote, porque inclui o giro. E a receita do setor é concentrada: na Polymarket a
taxa mediana por carteira foi de US$ 0,99 em seis meses e as 100 maiores carteiras pagaram 24% de tudo (FATO
SECUNDÁRIO, PolyScalping, via `monetizacao-e-tesouraria.md`). O pote afasta justamente essas carteiras, porque uma
aposta grande derruba o próprio retorno. Exemplo: pote com US$ 5.000 de cada lado paga 1,94 por dólar; quem coloca
US$ 10.000 no SIM faz o SIM passar a pagar 1,29 (0,97 × 20.000 ÷ 15.000).

### 2.6 Cenário de falha

Mês 12, volume de US$ 300 mil por mês (três quartos do equilíbrio do nível 1). A taxa é de US$ 9.000. A operação
recebe US$ 2.250 e custa US$ 10.000 (nível 2): déficit de US$ 7.750 no mês. No mesmo mês a empresa manda US$ 2.250
para Bitcoin, queima US$ 2.250 em token e devolve US$ 2.250 em prêmios. Os fundadores cobrem o déficit do bolso
enquanto a empresa compra Bitcoin.

### 2.7 Correção proposta

Sem mudar a decisão, três caminhos, do mais ao menos conservador:

1. **Dizer no Business Plan qual é a conta.** O plano tem de mostrar que só 0,75% do volume paga a operação e de
   onde vem o resto do custo (capital dos sócios, venda privada, patrocínio). Esconder isso é o pior caminho.
2. **Alternativa "regra de partida" (a decidir pelo fundador).** A divisão 25/25/25/25 vale como destino final. Até
   um gatilho objetivo (a parte da operação cobre o custo por três meses seguidos e há seis meses de custo guardados
   em USDC), as partes de Bitcoin e de recompra ficam em USDC, em contas públicas separadas, e podem cobrir o déficit
   da operação com registro do que foi usado. Efeito: durante a partida, 2,25% do volume paga custo e o equilíbrio
   cai para um terço: US$ 133 mil (nível 1), US$ 444 mil (nível 2) e US$ 1,11 milhão (nível 3).
3. **Perguntas curtas primeiro.** A ordem de construção deve privilegiar o que gira o capital (pergunta de "toque"
   de preço por oráculo, de dias e não de meses). É a mesma conclusão do agente 1H por outro caminho.

Informação faltante: aposta média e frequência por carteira; duração média das perguntas que a equipe pretende abrir.

---

## 3. Furo 2: os 3% estão na faixa, mas a forma da taxa está errada (severidade: alta)

### 3.1 O que os concorrentes cobram de fato

O critério do fundador foi "dentro das taxas de mercado, nem maior, nem menor".

| Quem | Taxa | Medida | Fonte |
|---|---|---|---|
| Polymarket | 2,0% efetivos sobre os dólares pagos (set/2026) | Só quem toma liquidez paga; devolve cerca de 24% a usuários | FATO e INFERÊNCIA do agente 1E |
| Limitless | 1,9% efetivos | Idem | FATO e INFERÊNCIA do agente 1E |
| World (Phantom) | 2,5% a 5% do valor pago, mais a margem do formador | Não publica tabela | FATO e FATO SECUNDÁRIO |
| PNP | 1% por negociação | Fixa | FATO |
| PancakeSwap Prediction | 3% do pote | Pote; rodada cancelada devolve 100% | FATO |
| FactCheck (Solana) | 2,5% do pote | Pote | FATO SECUNDÁRIO |
| Baked Market | 3% do pote, inclusive na devolução | Pote | Decisão do fundador |

Leitura (INFERÊNCIA): na média, 3% está no topo dos potes e 50% acima da taxa efetiva dos dois livros de ordens
medidos. Dá para defender. O problema aparece quando o pote fica desequilibrado.

### 3.2 A taxa fixa castiga quem aposta no favorito

O que é: os líderes cobram uma taxa que encolhe quando o resultado é quase certo (fórmula `0,07 × p × (1 − p)`). O
motivo é simples: quem aposta no favorito ganha pouco, então qualquer taxa fixa come o ganho inteiro. No pote com
3% fixos acontece exatamente isso.

Conta (INFERÊNCIA). Retorno de quem acerta = 0,97 ÷ fatia do lado dele no pote. Custo da taxa por dólar apostado:
Baked 3% sempre; Polymarket (cripto) `7% × (1 − p)`.

| Fatia do lado vencedor | Baked: cada US$ 1 recebe | Baked: taxa como parte do ganho | Polymarket: taxa por dólar pago | Baked custa |
|---|---|---|---|---|
| 50% | 1,940 | 6% | 3,5% | 0,9 vez |
| 70% | 1,386 | 10% | 2,1% | 1,4 vez |
| 80% | 1,213 | 15% | 1,4% | 2,1 vezes |
| 90% | 1,078 | 30% | 0,7% | 4,3 vezes |
| 95% | 1,021 | 60% | 0,35% | 8,6 vezes |
| 97% | 1,000 | 100% | 0,21% | 14 vezes |
| 98% | 0,990 | acerta e perde 1% | 0,14% | n/a |

Por que isso pesa no Baked mais do que num pote de preço de 5 minutos: as perguntas on-chain costumam ter tendência
clara (o token já queimou 80% da meta; a curva já está em 90%). O pote fica desequilibrado, o favorito deixa de
valer a pena, ninguém mais entra do lado provável, e o pote morre de um lado só.

### 3.3 A taxa no pote de um lado só cria o problema que o fundo de prêmios precisa resolver

Decisão do fundador: pote de um lado só devolve cobrando taxa ("A banca nunca perde").

- **A conta da receita:** cem potes de US$ 200 que ficaram de um lado só rendem US$ 600 de taxa, US$ 150 para a
  operação. É irrelevante.
- **A conta do comportamento:** o primeiro apostador de qualquer pote novo passa a ter uma perda certa de 3% se
  ninguém aparecer do outro lado. Num site sem tráfego, isso acontece com frequência. O PancakeSwap, que é a
  referência dos 3%, devolve 100% na rodada cancelada (FATO, documentação oficial).
- **O círculo:** a empresa cobra 3% do primeiro apostador e depois gasta o fundo de prêmios (seção 5) para convencer
  alguém a ser o primeiro apostador.

### 3.4 A saída antecipada encolhe a base da taxa

A penalidade fica no pote (decisão), mas o principal devolvido sai dele, e a taxa só incide sobre o pote final.
Exemplo (SUPOSIÇÃO): se 20% do dinheiro apostado sair antes com penalidade média de 25%, o pote final é 85% do que
entrou (80% + 20% × 25%). A taxa efetiva sobre o que foi apostado cai de 3% para 2,55% e todos os volumes de
equilíbrio da seção 2 sobem 18% (US$ 471 mil, US$ 1,57 milhão e US$ 3,92 milhões).

### 3.5 Cenário de falha

Uma pergunta "o token T queima 50% da oferta até o dia D?" abre com a queima em 45%. O SIM chega a 92% do pote. Quem
entra no SIM ganha 5,4% se acertar e perde tudo se errar; ninguém mais entra. Quem está no NÃO sai pagando
penalidade. O pote fecha com 97% no SIM: os vencedores recebem exatamente o que puseram, e a casa cobrou 3% por um
resultado que todo mundo já sabia. Esses apostadores não voltam.

### 3.6 Correção proposta

A taxa de 3% fica. O que se propõe é a forma, e são alternativas para o fundador:

1. **Teto pelo lado perdedor:** taxa = o menor entre 3% do pote e 10% do lado perdedor. Em pote equilibrado nada
   muda (70/30 ainda paga 3%). Em 90/10 a taxa vira 1% do pote e quem acerta ganha 10% em vez de 7,8%. A frase para
   o usuário é simples: "a casa nunca fica com mais de um décimo do que os perdedores deixaram".
2. **Pote de um lado só:** manter a cobrança, como decidido, mas com valor reduzido (por exemplo 1%, ou um valor
   fixo pequeno). A receita perdida é irrelevante (conta em 3.3) e o primeiro apostador deixa de ser punido.
3. **Saída antecipada:** cobrar os mesmos 3% sobre o valor devolvido a quem sai. É coerente com "a banca nunca
   perde" e deixa a receita igual com ou sem saída. A penalidade continua indo para o pote.
4. **Testar antes de fixar**, como o fundador já pediu ("vamos testar antes"): duas taxas (2% e 3%) em perguntas
   parecidas, nas primeiras semanas, medindo o volume. O `ECONOMICS.md` mostra por que vale a pena: errar a taxa
   para cima custa mais volume do que errar para baixo.

Informação faltante: quanto do volume cai quando a taxa sobe (ninguém mediu num pote); se o dinheiro do patrocinador
dentro do pote paga os 3%.

---

## 4. Furo 3: a receita de patrocínio é pequena, sem precedente e cara de vender (severidade: alta)

### 4.1 Evidência de que alguém paga

- Nenhum dos cinco concorrentes vende patrocínio de pergunta com contrapartida (INFERÊNCIA do agente 1E sobre os
  fatos lidos).
- No maior programa parecido, o da Polymarket, a mediana é de US$ 3 por dia por mercado; só 882 de 17.866 mercados
  recebem US$ 50 ou mais por dia (FATO SECUNDÁRIO, Vultax, set/2026). E ali o patrocinador não recebe nada.
- As três faixas batem com o preço de destaque em sites com milhões de usuários (DexScreener a partir de US$ 299;
  listas em alta de US$ 1.500 a 2.000). O Baked não tem essa audiência no lançamento.
- O comprador natural (equipe de token) está com menos verba: a receita diária do pump.fun caiu de US$ 4,8 milhões
  para US$ 800 mil em seis meses e só 0,26% dos tokens se formam (FATO SECUNDÁRIO, The Block, jun/2026).

### 4.2 Quantos por mês, e quanto disso é receita

Os números de patrocinadores são SUPOSIÇÃO minha, sem nenhum dado por trás. Cenário A: 70% banca e 30% pote.
Cenário B: 30% banca e 70% pote.

| Cenário de vendas no primeiro ano | Composição por mês | Valor bruto | Banca no A | Banca no B | Vai ao pote no A | Vai ao pote no B |
|---|---|---|---|---|---|---|
| Ruim | 1 de US$ 500 | US$ 500 | US$ 350 | US$ 150 | US$ 150 | US$ 350 |
| Base | 2 de US$ 500 e 1 de US$ 1.500 | US$ 2.500 | US$ 1.750 | US$ 750 | US$ 750 | US$ 1.750 |
| Otimista | 4 de 500, 3 de 1.500 e 1 de 5.000 | US$ 11.500 | US$ 8.050 | US$ 3.450 | US$ 3.450 | US$ 8.050 |

Por ano, no cenário base: US$ 21.000 (A) ou US$ 9.000 (B). Contra o custo anual do nível 2 (US$ 120.000), isso é
17,5% ou 7,5%. O patrocínio ajuda, mas não substitui o volume de apostas.

### 4.3 Um ponto que ninguém decidiu e que vale muito

O destino 25/25/25/25 foi decidido para "a taxa". Não está dito se a parte da banca no patrocínio também se divide
em quatro. A diferença é grande. Quanto volume de apostas cada patrocinador substitui, para pagar custo:

| Faixa | Banca no A | Equivale a este volume apostado, se 100% for para a operação | Banca no B | Idem |
|---|---|---|---|---|
| US$ 500 | US$ 350 | US$ 46.667 | US$ 150 | US$ 20.000 |
| US$ 1.500 | US$ 1.050 | US$ 140.000 | US$ 450 | US$ 60.000 |
| US$ 5.000 | US$ 3.500 | US$ 466.667 | US$ 1.500 | US$ 200.000 |

Conta: parte da banca ÷ 0,75%. Se a parte da banca também for dividida em quatro, divida a equivalência por quatro.
Leitura (INFERÊNCIA): um patrocinador de US$ 1.500 no cenário A paga tanto custo quanto US$ 140 mil de apostas. O
dólar de patrocínio é o dólar mais valioso que a empresa pode ganhar, desde que vá inteiro para a operação.

### 4.4 O conflito entre o que é bom para a banca e o que faz o produto funcionar

- No cenário A a banca recebe mais por venda, mas a faixa de US$ 500 põe só US$ 150 no pote. O prêmio só cobre a
  taxa do apostador quando passa de 3,09% das apostas; US$ 150 não cobrem um pote de US$ 10.000 (conta do agente 1F).
  O patrocinador paga US$ 500 e o apostador quase não vê diferença.
- No cenário B o pote cresce de verdade, mas a banca recebe US$ 150 na faixa de entrada.

### 4.5 O custo de vender

Não há equipe comercial. Quem vende é um fundador. SUPOSIÇÃO: fechar e atender um patrocinador consome cinco horas
(conversa com os que não fecham, revisão da pergunta e do texto, publicações rotuladas no X, relatório), a US$ 25
por hora de custo de oportunidade: US$ 125 por venda.

| Faixa | Banca no A, menos US$ 125 | Banca no B, menos US$ 125 |
|---|---|---|
| US$ 500 | US$ 225 | US$ 25 |
| US$ 1.500 | US$ 925 | US$ 325 |
| US$ 5.000 | US$ 3.375 | US$ 1.375 |

No cenário B a faixa de US$ 500 vendida à mão rende US$ 25. Há ainda o custo que não está na conta: checar quem é o
patrocinador anônimo, e o risco de o patrocinador que controla o resultado apostar (para advogado e agente 2D).

Um detalhe que reduz o valor percebido da "aposta de patrocinador": se ele acerta, recupera quase tudo. No exemplo
do agente 1F, paga US$ 5.000 no cenário B e recebe US$ 4.824 de volta. Para a banca tanto faz (ela já ficou com a
sua parte), mas quem apostou do mesmo lado ganhou menos por causa dele.

### 4.6 Cenário de falha

Seis meses depois do lançamento a equipe vendeu quatro patrocínios de US$ 500 a projetos conhecidos, com muita
conversa. Receita da banca: US$ 600 (B) ou US$ 1.400 (A). As contrapartidas prometidas (destaque, publicação no X,
relatório) foram entregues a um site com poucas centenas de visitas. Nenhum patrocinador renovou.

### 4.7 Correção proposta

1. **Fechar o "70/30" antes do modelo financeiro** (agente 2E). A conta sugere o cenário B para o produto e a
   decisão explícita de que a parte da banca vai inteira para a operação, fora da divisão em quatro.
2. **Faixa de US$ 500 só por autoatendimento:** entra numa pergunta já aberta, paga on-chain, recebe selo e nada que
   exija gente. Pergunta sob medida e contato humano só a partir de US$ 1.500.
3. **Não projetar patrocínio como receita central no primeiro ano.** No Business Plan: cenário ruim de zero a um por
   mês, base de três, e o otimista marcado como aposta.
4. **Medir o que o patrocinador recebeu** (carteiras, volume, visitas) desde o primeiro, para ter o que mostrar ao
   segundo. Sem isso o preço não se defende.
5. **Meta de validação barata antes de construir o fluxo inteiro:** conseguir três cartas de intenção de projetos
   reais. Se em trinta dias de conversa ninguém se comprometer nem com US$ 500, a segunda trilha de receita é
   hipótese.

Informação faltante: uma única conversa com um potencial patrocinador. Hoje não há nenhuma registrada.

---

## 5. Furo 4: o fundo de prêmios precisa causar um quarto do volume para se pagar (severidade: alta)

### 5.1 A conta

O fundo recebe 0,75% do volume. Cada US$ 1 de prêmio só volta como taxa se trouxer US$ 33 de aposta que não
existiria sem ele (1 ÷ 3%). Três jeitos de olhar o mesmo número (INFERÊNCIA):

| O que se quer recuperar com o prêmio | Aposta nova necessária por US$ 1 de prêmio | Parcela do volume total que teria de existir por causa do fundo |
|---|---|---|
| A taxa inteira (3%) | US$ 33 | 25% |
| Só o que fica na empresa (operação e Bitcoin, 1,5%) | US$ 67 | 50% |
| Só o que paga custo (operação, 0,75%) | US$ 133 | 100% |

Leitura: o fundo só se paga, na medida mais generosa, se uma de cada quatro apostas da plataforma só existir por
causa dos prêmios, para sempre. Na medida que importa para pagar as contas, ele não se paga nunca: é gasto de
aquisição, e deve ser chamado assim.

### 5.2 Isso é plausível?

- Retorno medido de prêmios (apostador novo e retenção por dólar): **não encontrado** em nenhuma plataforma
  (`monetizacao-e-tesouraria.md`).
- O que se sabe é o que acontece quando o incentivo acaba: Opinion −80,7% e Myriad −93,8% de volume do 1º para o 2º
  trimestre de 2026 (FATO SECUNDÁRIO, Predictefy); Limitless −96% de maio a setembro de 2026 (FATO, DefiLlama).
- Há um jeito de o fundo "se pagar" no papel que é ruim: quando o prêmio passa de 3,09% do pote, quem aposta nos dois
  lados lucra sem risco, e esse dinheiro entra até 32,3 vezes o prêmio (conta do agente 1F). Nesse ponto a taxa
  gerada iguala o prêmio. O painel mostra volume alto e fundo "pago", mas o prêmio foi colhido por quem não é
  público, e o volume some na pergunta seguinte.
- Efeito colateral para a captação: se a venda privada do token for precificada por volume, esse volume colhido
  infla a avaliação. É a sequência que se viu no Limitless (volume −96%, token −94%).

### 5.3 Cenário de falha

Com US$ 1 milhão por mês, o fundo distribui US$ 7.500 em prêmios. Carteiras que apostam dos dois lados trazem
US$ 200 mil de volume e levam a maior parte do prêmio. O relatório mensal mostra "27 dólares de volume por dólar de
prêmio" e parece quase bom. Quando o prêmio é reduzido, o volume cai 20% e os apostadores de verdade continuam os
mesmos de antes.

### 5.4 Como medir e o que fazer se não se pagar

Medição (já proposta pelo agente 1F e endossada aqui): sortear quais perguntas recebem prêmio; comparar o volume com
perguntas parecidas sem prêmio; medir quantas carteiras novas voltam a apostar em pergunta **sem** prêmio em 30 dias;
medir a parcela do prêmio que foi para carteiras que apostaram nos dois lados.

Correção proposta, sem mexer nos 25%:

1. **O dinheiro entra no fundo, mas só sai por regra.** O gasto de cada trimestre é limitado ao que a medição do
   trimestre anterior justificou. O que não for gasto fica acumulado em USDC, numa conta pública.
2. **Critério de corte escrito antes do lançamento.** Exemplo: depois de 40 perguntas com prêmio sorteado, se o
   volume adicional por dólar ficar abaixo de 33, ou se menos de uma em cada cinco carteiras novas voltar sem prêmio,
   o gasto cai para o mínimo (abrir potes novos) e o fundador decide o destino do saldo.
3. **Prêmio com trava contra colheita:** teto de 3% do pote já apostado, liberado no fechamento, nunca proporcional
   ao volume, e sem valer para carteira que apostou nos dois lados.
4. **Prioridade de uso:** abrir potes (o primeiro apostador) antes de torneios. É o único uso que ataca um problema
   que a própria taxa cria (seção 3.3).
5. **O fundo nasce vazio.** No primeiro mês ele é 0,75% de zero. Os primeiros prêmios saem do bolso dos sócios: de
   US$ 5 mil a 10 mil (SUPOSIÇÃO), que entram na necessidade de capital (seção 10).

---

## 6. Furo 5: tesouraria em Bitcoin antes de cobrir custos (severidade: alta)

### 6.1 O furo

A decisão manda 25% da **taxa bruta** para Bitcoin desde o primeiro dólar. Os três precedentes de percentual fixo
usam outra base (FATO e FATO SECUNDÁRIO, via `monetizacao-e-tesouraria.md`):

| Quem | Percentual | Base |
|---|---|---|
| Tether | Até 15% | Lucro líquido |
| Block | 10% | Lucro bruto dos produtos de bitcoin |
| Méliuz | Até 10% | Caixa |
| Baked Market | 25% | Receita bruta, antes de qualquer custo |

### 6.2 A conta

Durante a subida do volume até o equilíbrio, a parte da operação é sempre menor que o custo, e a parte do Bitcoin é
sempre igual à da operação. Se o volume sobe em linha reta de zero até o equilíbrio em T meses (INFERÊNCIA):

- déficit acumulado da operação = custo × T ÷ 2;
- valor acumulado enviado ao Bitcoin = custo × T ÷ 2.

Os dois números são iguais. Exemplo no nível 2 com 18 meses: déficit de US$ 90.000 e US$ 90.000 em Bitcoin. Cada
dólar que os sócios ou os investidores colocam para cobrir o déficit é, na prática, um dólar que comprou Bitcoin. A
empresa não está guardando sobra: está se endividando (ou se diluindo) para comprar um ativo volátil.

Risco de preço (FATO SECUNDÁRIO): o bitcoin caiu mais de 20% no segundo trimestre de 2026 e estava perto de
US$ 63.800 em agosto. A primeira compra da Méliuz está cerca de 30% abaixo do custo e a Metaplanet 38%. Uma queda de
38% sobre os US$ 90.000 do exemplo tira US$ 34.200.

Dois agravantes (INFERÊNCIA): a hipótese de que o volume de apostas do público web3 cai junto com o bitcoin não foi
verificada, mas, se for verdadeira, a reserva vale menos justamente quando a receita some. E converter exige conta
em corretora com identificação da empresa, ou cbBTC, que a Coinbase pode congelar (para advogado).

### 6.3 Cenário de falha

Mês 14. A empresa acumulou US$ 60 mil em cbBTC e deve US$ 60 mil aos sócios. O bitcoin cai 35%, o volume de apostas
cai junto, e uma segunda auditoria de US$ 20 mil vence. A tesouraria vale US$ 39 mil e a regra escrita diz que ela
não pode ser vendida para pagar operação.

### 6.4 Quando faz sentido começar, e a correção

A decisão fica. A proposta é a ordem:

1. **Acumular os 25% em USDC, carimbados numa conta pública, até um gatilho:** a parte da operação cobre o custo por
   três meses seguidos e existe reserva de seis meses de custo em USDC. É a mesma "regra de partida" da seção 2.7.
2. **Depois do gatilho, comprar todo mês, em data fixa** (como a Block), e não de uma vez.
3. **Alternativa de base:** 25% do que sobrar depois dos custos, como Tether, Block e Méliuz, em vez de 25% da taxa
   bruta. Em equilíbrio folgado dá quase o mesmo; na partida, dá zero, que é o número correto.
4. **Regra escrita de venda** e de quem assina o cofre, antes da primeira compra.

Informação faltante: se a empresa terá pessoa jurídica com conta em corretora; tributação e contabilidade da
tesouraria (para advogado e contador).

---

## 7. Furo 6: recompra e queima custam o dobro do equilíbrio e não movem o preço (severidade: alta)

### 7.1 Evidência

- Jupiter: mais de US$ 70 milhões em 2025, metade da receita; cobriu cerca de 6% dos tokens desbloqueados; preço 89%
  abaixo do pico. Helium parou a recompra em janeiro de 2026 dizendo que o dinheiro ia "para um buraco". pump.fun:
  mais de US$ 230 milhões e o token 72% abaixo do pico (FATO SECUNDÁRIO, via `monetizacao-e-tesouraria.md`).
- Tokens de mercado de previsão: LMTS −94%, PNP −93% (FATO, via `top-5-competitor-analysis.md`).
- A regra que sai dos casos: recompra só reduz oferta se for maior que os desbloqueios do mesmo período.

### 7.2 A conta contra os desbloqueios

Usando a distribuição que o agente 1G propôs para o token da venda privada (proposta, não decisão) e a avaliação de
exemplo do sócio, US$ 5 milhões (INFERÊNCIA):

| Período depois do lançamento do token | Tokens destravados por mês | Em dólares, a US$ 5 mi de avaliação |
|---|---|---|
| Meses 1 a 3 (detentores do primeiro token e apostadores) | 0,83% da oferta | US$ 41,7 mil |
| Meses 4 a 6 (mais a fatia de crescimento) | 1,53% | US$ 76,4 mil |
| Meses 7 a 9 (mais venda privada e tesouraria) | 3,01% | US$ 150,7 mil |
| Meses 10 a 18 | 2,18% | US$ 109,0 mil |

| Volume apostado por mês | Recompra por mês | Cobre dos desbloqueios |
|---|---|---|
| US$ 400 mil | US$ 3.000 | 2% a 7% |
| US$ 1 milhão | US$ 7.500 | 5% a 18% |
| US$ 3,33 milhões | US$ 25.000 | 17% a 60% |
| US$ 10,2 milhões | US$ 76.400 | 51% a 183% |

A recompra só iguala os desbloqueios dos meses 4 a 6 com US$ 10,2 milhões apostados por mês, e os dos meses 7 a 9
com US$ 20 milhões. O `ECONOMICS.md` chega à mesma conclusão para o desenho dele: só o cenário de US$ 100 milhões
absorve os desbloqueios.

### 7.3 Quanto de avaliação a recompra sustenta

Se o comprador do token exige que a recompra anual represente 20% do valor do token (o rendimento exigido que o
`ECONOMICS.md` usa), a avaliação sustentada é 0,45 vez o volume mensal (0,75% × 12 ÷ 20%):

| Volume apostado por mês | Recompra por ano | Avaliação que a recompra sustenta |
|---|---|---|
| US$ 400 mil | US$ 36 mil | US$ 180 mil |
| US$ 1,33 milhão | US$ 120 mil | US$ 600 mil |
| US$ 3,33 milhões | US$ 300 mil | US$ 1,5 milhão |
| US$ 11,1 milhões | US$ 1 milhão | US$ 5 milhões |

Abaixo de US$ 11 milhões por mês, uma avaliação de US$ 5 milhões se apoia em narrativa, não em recompra.

### 7.4 Custo de oportunidade e cenário de falha

Os mesmos 0,75% do volume, se pagassem custo, cortariam o volume de equilíbrio pela metade (de US$ 3,33 milhões para
US$ 1,67 milhão no nível 3). E, do lançamento do produto até o token existir (meses 0 a 6 ou 9 no cronograma do
agente 1G), não há o que recomprar: o dinheiro fica parado enquanto a operação tem déficit.

Cenário de falha: com US$ 1 milhão apostado por mês, a empresa queima US$ 90 mil em token no primeiro ano, o preço
cai 80% por causa dos desbloqueios, e esses US$ 90 mil pagariam nove meses do custo do nível 2.

### 7.5 Correção proposta

1. **Gatilho de início**, igual ao do Bitcoin: recompra só depois do equilíbrio e só depois de o token existir. Até
   lá o valor se acumula em USDC, carimbado.
2. **Desenhar os desbloqueios pelo tamanho da recompra, e não o contrário.** Se a recompra projetada é de US$ 7.500
   por mês, um cronograma que solta US$ 76 mil por mês anula o mecanismo. Menos tokens soltos por mês vale mais que
   qualquer recompra.
3. **Recompra condicionada** (ideia registrada pelo agente 1F): comprar mais quando o token está barato em relação à
   taxa gerada e menos quando está caro; ou só recomprar no mês em que a recompra cobre os desbloqueios.
4. **Não prometer preço.** A palavra "recompra" em material de venda antes de a rede funcionar é o ponto que o texto
   da SEC separa (para o agente 2D e para advogado).
5. **Contradição a resolver:** o objetivo "entregar dividendo aos holders" não tem fonte na divisão 25/25/25/25
   (apontado pelo agente 1G). Ou sai do plano, ou alguém decide de onde vem.

---

## 8. Furo 7: o apostador vale poucos dólares e custa caro para trazer (severidade: crítica)

### 8.1 Quanto vale um apostador

Conta (INFERÊNCIA sobre SUPOSIÇÃO): apostador que deposita US$ 200 por mês durante seis meses.

| Item | Valor |
|---|---|
| Total apostado na vida | US$ 1.200 |
| Taxa gerada (3%) | US$ 36 |
| Parte que paga custo (0,75%) | US$ 9 |
| Custo de aquisição máximo, usando a regra de três para um do `ECONOMICS.md`, sobre a taxa inteira | US$ 12 |
| Idem, sobre a parte da operação | US$ 3 |

E esse é o apostador bom. Na Polymarket a taxa mediana por carteira foi de US$ 0,99 em seis meses (FATO SECUNDÁRIO).

### 8.2 Quanto custa trazer um usuário em cripto

| Referência | Custo por usuário | Fonte |
|---|---|---|
| Coinbase, 2021 | US$ 77 | FATO SECUNDÁRIO, Xangle (mai/2023), citando a Huobi Research |
| Fintech típica | cerca de US$ 200 | Idem |
| Airdrop da Optimism | cerca de US$ 600 por endereço | Idem |
| Airdrop da Arbitrum | US$ 2.175 a 2.500 por endereço; US$ 5.437 contando só quem ficou | Idem; Kerman Kohli (abr/2023) |
| Publicação de micro-influenciador | cerca de US$ 500 por publicação | Blogs de agência, fonte fraca (`publico-web3.md`) |

São números de 2021 a 2023 e de produtos diferentes; servem para a ordem de grandeza. Para um custo de US$ 77 se
pagar só com a parte da operação, o apostador teria de apostar US$ 10.267 na vida (77 ÷ 0,75%).

### 8.3 Pontos e airdrops atraem caçadores

- Optimism, quinto airdrop (análise da própria Optimism, jan/2025, FATO): receber o airdrop aumentou a retenção de
  30 dias em 4,2 pontos percentuais e a de 60 dias em 2,8. O bônus para "usuário frequente" **reduziu** a retenção
  em 7,1 pontos; a explicação dada é a de caçadores que vendem e saem.
- Estudo acadêmico de nove airdrops (arXiv 2312.02752, FATO SECUNDÁRIO): nos três casos destacados (Lido, 1inch e
  Optimism), de 48% a 66% dos tokens foram vendidos em corretora já na primeira transferência; na maioria dos
  protocolos, o tempo mediano entre a primeira e a última atividade foi de zero dia.
- No nosso setor: Opinion −80,7%, Myriad −93,8% e Limitless −96% de volume depois das campanhas (seção 5.2).

### 8.4 O que piora a retenção num pote, especificamente (INFERÊNCIA)

1. O retorno só é conhecido no fechamento, e cai quando mais gente entra do mesmo lado.
2. O dinheiro fica preso até a resolução; a saída antecipada não dá ganho, só devolução com penalidade (agente 1H).
3. O primeiro apostador pode perder 3% sem que nada aconteça (seção 3.3).
4. As perguntas on-chain são lentas e raras: não há jogo todo dia, como em esportes.
5. O token do pump.fun traz especuladores do token, não necessariamente apostadores.

### 8.5 Cenário de falha

A equipe faz uma campanha de pontos de três meses, prometendo o token da venda privada. O volume chega a
US$ 2 milhões por mês, a venda privada é precificada sobre esse número, o token é distribuído e o volume cai 90% no
trimestre seguinte. É a sequência documentada do Limitless.

### 8.6 Correção proposta

1. **Orçamento de aquisição paga perto de zero.** A conta não fecha. Os canais que cabem são os gratuitos ou os que
   outro paga: o X, o mascote, a sugestão de perguntas pelo público, e a comunidade que cada patrocinador traz.
2. **Tratar cada pergunta patrocinada como canal de aquisição**, e medir quantas carteiras da comunidade do
   patrocinador voltam a apostar em outra pergunta.
3. **Indicação paga com parte da taxa**, só depois do lançamento e com trava (o indicado precisa ter pago um mínimo
   de taxa), porque sem identificação a pessoa se indica com outra carteira. É custo, não receita.
4. **Se houver pontos ou distribuição de token, pesar por taxa paga e por acerto, nunca por volume** (regra do
   `ECONOMICS.md`, seção 1.4), e manter qualquer reembolso abaixo de 50% da taxa paga.
5. **Meta de retenção no lugar de meta de volume:** parcela das carteiras que apostam de novo em 30 dias sem prêmio.
   É o número que diz se há negócio.
6. **Integração com carteira** é o único canal que demonstrou escala em Solana (98% do volume da DFlow veio da
   Phantom). Vale como objetivo de médio prazo, não como premissa.

Informação faltante: entrevistas com apostadores do público-alvo (hoje, zero); aposta média; custo real das
campanhas de pontos dos concorrentes.

---

## 9. Furo 8: custos que não estão em nenhuma planilha (severidade: alta)

| Custo | Faixa | Tipo | Fonte e força |
|---|---|---|---|
| Auditoria do programa de pote | US$ 7 a 20 mil (programa simples, até 2.000 linhas); US$ 20 a 60 mil (protocolo padrão); programa médio com chamadas a outros programas, US$ 22 a 45 mil | Único, e de novo a cada mudança relevante | FATO SECUNDÁRIO: Accretion (abr/2026) e TierZero (jul/2026), blogs de empresas de auditoria |
| RPC | US$ 49, 499 ou 999 por mês; créditos extras a US$ 5 por milhão | Mensal | FATO: página oficial da Helius, lida em 4/out/2026 |
| Empresa no exterior | Abertura de US$ 1,5 mil a cerca de 6 mil (Ilhas Virgens Britânicas ou Panamá); manutenção de US$ 1 a 2,5 mil por ano. Fundação em Cayman: US$ 25 a 80 mil de abertura e US$ 25 a 60 mil por ano | Único e anual | FATO SECUNDÁRIO: Neo Legal (mai/2026), finconduit (mai/2026), Consulting24 (jun/2026); prestadores com interesse comercial |
| Avaliação jurídica básica do produto e dos termos de uso | US$ 5 a 15 mil | Único | Fonte fraca: blog GIP Research (jul/2026) |
| Parecer jurídico do token | US$ 15 a 50 mil numa jurisdição | Único, antes da venda privada | Mesma fonte fraca |
| Licença de jogo, se o advogado disser que é necessária | Não encontrado; uma fonte fraca cita capital mínimo de US$ 50 mil em Anjouan | Único e anual | `regulacao.md`; para advogado |
| Bloqueio geográfico | Custo técnico pequeno (não orçado); o custo real é o mercado que se perde. O Brasil proíbe contratos sobre eventos não financeiros desde mai/2026 e bloqueou 27 sites | Receita perdida | `regulacao.md`; para advogado |
| Serviço que aciona a resolução | Taxa de rede desprezível (5.000 lamports por resolução); o custo é servidor, RPC e alguém de plantão para o alarme | Mensal, e tempo de gente | FATO e INFERÊNCIA do agente 1H |
| Suporte | Meio período de uma pessoa, no mínimo, com dinheiro real em jogo | Mensal | SUPOSIÇÃO |
| Liquidez inicial do token da venda privada | US$ 600 mil no `ECONOMICS.md`; US$ 225 mil na proposta do agente 1G (30% de uma venda de US$ 750 mil) | Único, sai do dinheiro da venda | FATO (arquivo do sócio) e INFERÊNCIA |
| Prêmios iniciais, antes de existir taxa | US$ 5 a 10 mil | Único | SUPOSIÇÃO |
| Reembolso por resolução errada ou falha | Sem valor; é um passivo que cresce com o dinheiro travado. A Limitless tem política escrita | Contingente | FATO via agente 1E |
| Leitura de menções no X, pagamento entre redes | US$ 0,005 por publicação lida; 0,1% no SODAX | Variável, pequeno | FATO via briefing |

Três pontos que pesam mais que os valores (INFERÊNCIA):

1. **O programa atual tem 1.717 linhas de Rust** (contagem no repositório, 4/out/2026) e o novo terá apostas, saída
   com penalidade, depósito de patrocinador, cofre de taxas e leitores de contas de terceiros. Isso o coloca entre o
   programa simples e o médio: de US$ 15 mil a 45 mil na primeira auditoria. E cada tipo novo de pergunta
   (Token-2022, preço por oráculo, formatura no pump.fun) altera o programa e pede nova revisão.
2. **O aplicativo monta histórico e atividade lendo transações no RPC, sem indexador** (`CLAUDE.md`). Essas chamadas
   custam 10 créditos cada. Com 50 transações por página (SUPOSIÇÃO), uma visita custa cerca de 510 créditos: o
   plano de US$ 49 aguenta perto de 19.600 visitas por mês e o de US$ 499, 196 mil. Tráfego de lançamento estoura o
   plano barato; um cache simples resolve, mas é trabalho a planejar (para o agente 2C).
3. **O gasto vem antes da receita.** Auditoria, empresa, advogado e prêmios iniciais somam de US$ 30 mil a 75 mil
   antes do primeiro dólar de taxa.

Cenário de falha: a equipe lança sem auditoria para economizar US$ 20 mil, uma falha na conta da saída antecipada
esvazia um pote de US$ 40 mil, e a empresa não tem caixa nem regra para reembolsar.

Correção proposta: (1) orçamento de pré-lançamento escrito, com três cotações de auditoria; (2) teto de pote por
pergunta enquanto não houver auditoria e reserva (o agente 1H já propõe teto por outro motivo); (3) política de
reembolso escrita, com o valor máximo coberto; (4) uma consulta jurídica paga antes de qualquer gasto de construção,
porque a resposta sobre o Brasil e sobre licença muda todos os outros números.

---

## 10. Furo 9: quanto capital é preciso, e de onde ele vem (severidade: crítica)

### 10.1 Quanto

Conta (INFERÊNCIA sobre SUPOSIÇÃO): capital = gasto antes do lançamento + déficit acumulado na subida + reserva de
seis meses. O déficit usa a fórmula da seção 6.2 (custo × meses ÷ 2), com prazos que eu supus.

| Nível de custo | Antes do lançamento | Meses até o equilíbrio (SUPOSIÇÃO) | Déficit acumulado | Reserva de 6 meses | **Capital necessário** |
|---|---|---|---|---|---|
| 1. Sem salário (US$ 3 mil) | US$ 30 a 75 mil | 12 | US$ 18 mil | US$ 18 mil | **US$ 65 a 110 mil** |
| 2. Enxuta (US$ 10 mil) | US$ 30 a 75 mil | 18 | US$ 90 mil | US$ 60 mil | **US$ 180 a 225 mil** |
| 3. `ECONOMICS.md` (US$ 25 mil) | US$ 30 a 75 mil | 24 | US$ 300 mil | US$ 150 mil | **US$ 480 a 525 mil** |

Se o equilíbrio não chegar (volume parado em US$ 100 mil por mês, que rende US$ 750 à operação), 24 meses consomem
US$ 54 mil no nível 1, US$ 222 mil no nível 2 e US$ 582 mil no nível 3, além do gasto de pré-lançamento.

Com a "regra de partida" da seção 2.7 o equilíbrio cai para um terço do volume e o déficit acumulado encolhe junto
com o prazo. Não refiz a tabela porque o prazo é suposição; o agente 2E deve modelar os dois casos.

### 10.2 De onde

| Fonte | O que a pesquisa diz | Problema |
|---|---|---|
| Receita | 0,75% do volume | Insuficiente até o equilíbrio, por definição |
| Token do pump.fun | O dinheiro das compras fica na curva; o criador recebe só a taxa de criador (0,05% a 0,95% do volume do token), e a proposta do agente 1G a destina ao fundo de prêmios | Não financia a operação. Se a equipe comprar na curva e vender, repete o caso Pump Pumpkin (venda da carteira criadora, queda de 92%) |
| Venda privada do segundo token | Exemplo: 15% da oferta a US$ 5 milhões de avaliação arrecadam US$ 750 mil; na proposta do agente 1G, 30% vão a prêmios, 30% à liquidez e 40% (US$ 300 mil) à operação | Ver 10.3 |
| Investidores | Melee captou US$ 3,5 milhões antes de ter produto; Limitless, US$ 17 milhões | Sem dado de uso, sem empresa constituída, sem identificação de usuário e com patrocinador anônimo, o grupo de investidores possíveis é pequeno (INFERÊNCIA; para advogado) |
| Sócios | Nível 1 cabe no bolso de dois fundadores | Só o nível 1 |
| Hackathon e aceleração | O prazo do Colosseum é 12 de outubro de 2026; o fundador disse que não é prioridade. Valores de prêmio e de aceleração: não conferidos nesta rodada | Fonte barata de capital e de validação que está sendo deixada passar |

### 10.3 O círculo da venda privada

Para a operação receber US$ 200 mil (necessidade do nível 2), com 40% da venda indo para a operação, a venda precisa
arrecadar US$ 500 mil. Com 15% da oferta, isso é uma avaliação de US$ 3,33 milhões. Pela conta da seção 7.3, a
recompra só sustenta essa avaliação com US$ 7,4 milhões apostados por mês. Para US$ 500 mil à operação (nível 3):
venda de US$ 1,25 milhão, avaliação de US$ 8,3 milhões, sustentada só com US$ 18,5 milhões por mês.

Ou seja: a venda precisa acontecer antes do volume, e o preço da venda só se justifica depois do volume. Quem compra
nesse intervalo compra narrativa, num mercado em que as vendas públicas de token somaram US$ 58 milhões em 37 vendas
no segundo trimestre de 2026, no mundo (FATO SECUNDÁRIO, via `dois-tokens-e-ico-privado.md`), e em que os tokens do
setor caíram mais de 90%. A venda também exige comprador identificado e parecer jurídico (US$ 15 a 50 mil, fonte
fraca), o que convive mal com o produto sem identificação.

### 10.4 Cenário de falha

A equipe gasta seis meses e US$ 50 mil para lançar, conta com a venda privada para pagar o ano seguinte, e a venda
não fecha porque o volume dos primeiros meses é de US$ 80 mil. Sem caixa, o serviço de resolução fica sem plantão.

### 10.5 Correção proposta

1. **Decidir o nível de custo antes de decidir a captação.** A recomendação que sai da conta: lançar no nível 1, com
   capital dos sócios de US$ 65 a 110 mil, e só subir de nível com marcos de volume atingidos.
2. **Marcos objetivos para cada passo de gasto.** Exemplo: só contratar gente (nível 2) depois de três meses seguidos
   com US$ 400 mil apostados; só abrir a venda privada depois de quatro meses de produto com retenção medida (o
   cronograma do agente 1G já põe a venda nos meses 4 a 6).
3. **Reduzir a dependência da venda:** meta de arrecadação modesta, e nenhum compromisso de custo fixo apoiado nela.
4. **Reconsiderar o Colosseum** como fonte de capital e de validação, submetendo o que já existe. É decisão do
   fundador; o registro aqui é do custo de oportunidade.
5. **Uma página de "uso dos recursos"** no Business Plan, com as três linhas: pré-lançamento, déficit e reserva.

---

## 11. Furo 10: dependência do sócio técnico e do prazo de reescrita (severidade: crítica)

### 11.1 Evidência (FATO, repositório, 4/out/2026)

- A licença do código é MIT em nome de Ronaldo Pereira; o repositório de origem (`upstream`) é da conta dele.
- 11 dos 16 commits listados são dele; os documentos `ECONOMICS.md`, `RESOLVERS.md` e `PRIVACY_PLAN.md` também.
- O programa tem 1.717 linhas de Rust e 138 testes; o briefing admite que a reescrita "invalida boa parte" deles.
- A divisão entre os sócios: "por enquanto é irrelevante" (resposta do fundador). O briefing enviado ao sócio traz
  seis perguntas que, até onde os arquivos mostram, não têm resposta registrada.
- O `ECONOMICS.md` do sócio propõe outro modelo (taxas de 1%, 1% e 0,5%; 40% da receita a quem trava o token) e ele
  já discordou do rendimento do pote. Não há registro de que ele concorde com o modelo de pote.

### 11.2 Por que isso é um furo financeiro

1. **Uma pessoa só sabe mexer no programa.** Se ela sair, discordar ou atrasar, o custo é contratar. Referência:
   auditor sênior autônomo de Solana cobra de US$ 5 mil a 20 mil por semana (FATO SECUNDÁRIO, Accretion); salário de
   desenvolvedor sênior de Solana: não pesquisado. Isso não está em nenhum nível de custo da seção 2.
2. **A licença MIT não protege ninguém.** O fundador pode usar o código sem o sócio, e qualquer concorrente também.
   O Melee, com US$ 3,5 milhões, ou o World, que já tem o encanamento automático, podem copiar a leitura on-chain. A
   defesa não é o código, é chegar primeiro e ter comunidade.
3. **Cada mês de atraso custa o gasto mensal e encurta a janela.** O rival mais parecido ainda não opera com
   dinheiro real, mas tem caixa e fila de espera de 49 mil pessoas.
4. **Não há prazo.** Nenhum arquivo traz estimativa de quanto tempo leva reescrever, testar e auditar. Uma auditoria
   de programa simples leva de uma a duas semanas, fora a fila da empresa (FATO SECUNDÁRIO). O prazo total é
   informação faltante, e é tema do agente 2F.
5. **Sem acordo entre sócios, não há captação.** Qualquer investidor ou comprador da venda privada pergunta quem é
   dono do quê, quem controla a chave de atualização do programa e o que acontece se um sócio sair.

### 11.3 Cenário de falha

O fundador gasta US$ 20 mil em pesquisa, marca e protótipo. O sócio responde ao briefing dizendo que prefere manter
o modelo dele, ou aceita mas só tem dez horas por semana. A reescrita leva oito meses. Nesse intervalo um concorrente
capitalizado lança pote com leitura on-chain na rede principal.

### 11.4 Correção proposta

1. **Acordo de sócios antes de qualquer gasto de construção ou auditoria:** participação de cada um, liberação da
   participação ao longo do tempo (a prática de quatro anos com um ano de carência), cessão do código à empresa,
   papéis, dedicação semanal e saída. O fundador disse que isso não é assunto agora; a conta diz que é o primeiro.
2. **Resposta escrita do sócio às seis perguntas do briefing**, com estimativa de prazo em semanas.
3. **Chave de atualização e cofres em assinatura múltipla**, com os dois sócios, desde a rede de teste.
4. **Orçar um segundo desenvolvedor de Solana por contrato**, ao menos para revisão, e documentar o programa para
   que outra pessoa consiga mantê-lo.
5. **Plano B escrito:** como o código é MIT, o projeto continua sem o sócio, mas ao preço de contratar. Esse preço
   deve aparecer no Business Plan como risco com valor.

---

## 12. Furos menores e contradições entre documentos

| # | Ponto | Por que importa | Severidade | Correção |
|---|---|---|---|---|
| 1 | O briefing mostra a divisão 50/25/25 e a tabela de receita correspondente; a decisão é 25/25/25/25 | Quem ler o briefing verá um equilíbrio de US$ 1,7 milhão; o correto é US$ 3,33 milhões | Média | Atualizar o briefing ou marcar a seção 6 como superada |
| 2 | `market-research.md` usa taxa de cerca de 1% (sobre valor de face); `top-5` corrige para 1,9% a 5% (sobre dólares pagos) | O Business Plan não pode citar os dois | Média | Usar só dólares pagos, como recomenda o agente 1E |
| 3 | "Limitless e Myriad perto de 140 milhões por ano" é uma semana de dez/2025 vezes 52; em set/2026 o Limitless fez US$ 10,75 milhões no mês, depois de um pico de US$ 250,9 milhões | A referência de entrante oscila 25 vezes em quatro meses | Média | Citar faixa e data, nunca um número só |
| 4 | A taxa é cobrada no resgate | A receita entra depois do volume, com atraso igual à duração da pergunta; prêmio não resgatado atrasa a taxa | Média | Recolher a taxa na resolução, de uma vez (para o agente 2C) |
| 5 | A divisão da taxa, se gravada no programa como constante, não pode ser ajustada | A "regra de partida" e qualquer correção de rota exigem parâmetro | Média | Parâmetro com teto, prazo de aviso e registro público |
| 6 | "Pote mínimo garantido" como contrapartida | Se a casa garantir mais do que o patrocinador pôs, assume o risco do complemento | Baixa | Exibir como garantido só o que entrou no pote (já proposto pelo agente 1F) |
| 7 | "Subir preço", "pumpar" e "dividendo" como objetivos do token | São as palavras usadas contra emissores nos casos lidos; afastam investidor sério | Alta | Texto público revisado por advogado (agente 2D) |
| 8 | Os fundadores estão no Brasil, que proibiu contratos sobre eventos não financeiros e bloqueou sites | Exposição pessoal e perda do mercado mais próximo | Alta | Para advogado, antes de gastar com construção |
| 9 | Nenhuma tributação foi considerada (empresa, tesouraria em bitcoin, token) | Pode mudar a margem | Média | Para contador |

---

## 13. Quadro de severidade

| # | Furo | Severidade | Correção em uma linha |
|---|---|---|---|
| 1 | Só 0,75% do volume paga custo; equilíbrio de US$ 0,4, 1,33 ou 3,33 milhões por mês | Crítica | Regra de partida: Bitcoin e recompra em USDC até o equilíbrio; perguntas curtas primeiro |
| 7 | Apostador vale US$ 9 para a operação; aquisição custa de US$ 77 a milhares | Crítica | Aquisição paga perto de zero; medir retenção sem prêmio |
| 9 | Capital de US$ 65 mil a 525 mil sem fonte garantida; venda privada circular | Crítica | Lançar no nível 1 com capital dos sócios; marcos antes de cada gasto |
| 10 | Um sócio só domina o programa; sem acordo, sem prazo | Crítica | Acordo de sócios e prazo escrito antes de gastar |
| 2 | Taxa fixa castiga o favorito e o primeiro apostador | Alta | Teto de 10% do lado perdedor; taxa reduzida no pote de um lado só |
| 3 | Patrocínio sem precedente; faixa de US$ 500 não paga a venda | Alta | Fechar o 70/30; parte da banca inteira para a operação; autoatendimento |
| 4 | Fundo de prêmios não se paga na medida que importa | Alta | Gasto limitado pela medição; critério de corte escrito |
| 5 | Bitcoin com receita bruta, antes dos custos | Alta | Acumular em USDC até o gatilho; compra mensal depois |
| 6 | Recompra menor que os desbloqueios | Alta | Gatilho; desenhar os desbloqueios pelo tamanho da recompra |
| 8 | US$ 30 a 75 mil de gasto antes da primeira taxa | Alta | Orçamento de pré-lançamento; consulta jurídica primeiro |

---

## O que isto muda no plano (INFERÊNCIA)

Nenhuma decisão do fundador foi alterada. Tudo abaixo é leitura minha, para o coordenador e para o fundador.

1. **O número central do Business Plan passa a ser 0,75% do volume, e não 3%.** Toda projeção de custo coberto tem
   de usar esse número, com os três níveis de custo e os três volumes de equilíbrio.
2. **A divisão 25/25/25/25 precisa de uma regra de partida** para não obrigar a empresa a captar dinheiro para
   comprar Bitcoin e queimar token enquanto dá prejuízo. É a correção que mais reduz a necessidade de capital.
3. **O "70/30" e o destino da parte da banca no patrocínio viraram a decisão financeira mais urgente.** Um
   patrocinador de US$ 1.500 pode valer US$ 140 mil de apostas, ou US$ 15 mil, conforme as duas respostas.
4. **A forma da taxa deve ser testada, não só o percentual.** Taxa fixa sobre pote desequilibrado é o furo de
   produto com maior efeito na receita.
5. **O fundo de prêmios deve aparecer como gasto de aquisição com teto e medição**, não como investimento que se
   paga.
6. **O plano de token não pode ser a fonte de caixa do primeiro ano.** O token do pump.fun não financia a operação e
   a venda privada depende de um volume que ainda não existe.
7. **A ordem de construção ganha um critério financeiro:** perguntas que se resolvem em dias valem várias vezes mais
   taxa por dólar travado do que perguntas de meses.
8. **O orçamento de pré-lançamento (US$ 30 a 75 mil) e a necessidade de capital por nível entram no capítulo de
   projeções**, com as suposições à vista.
9. **O capítulo de equipe precisa do acordo entre os sócios e do prazo de reescrita.** Sem isso, os capítulos
   financeiros descrevem uma empresa que ainda não existe.
10. **A recomendação de partida:** nível 1, capital dos sócios, uma consulta jurídica antes de construir, marcos de
    volume para cada aumento de custo, e validação barata do patrocínio (três cartas de intenção) antes de codificar
    o fluxo de patrocinador.

## Perguntas em aberto

1. No "70/30", qual parte é da banca? E a parte da banca se divide em quatro, como a taxa, ou vai inteira à operação?
2. O dinheiro que o patrocinador põe no pote paga os 3%?
3. O fundador aceita uma regra de partida para Bitcoin e recompra (acumular em USDC até o equilíbrio)?
4. Aceita teto da taxa pelo lado perdedor e taxa reduzida no pote de um lado só?
5. Aceita cobrar os 3% sobre o valor devolvido na saída antecipada?
6. Qual nível de custo o fundador considera real? Quanto os dois sócios podem pôr do bolso, e por quanto tempo?
7. Qual é a aposta média e a frequência do público-alvo? Não há dado; precisa de entrevistas ou de um teste.
8. Qual a duração média das perguntas que a equipe pretende abrir no primeiro trimestre?
9. Quanto tempo o sócio técnico estima para reescrever, testar e auditar, e com que dedicação semanal?
10. Existe acordo de sócios? Quem controla a chave de atualização do programa?
11. Há algum patrocinador real disposto a assinar uma carta de intenção?
12. A empresa será constituída onde, e terá conta em corretora? (para advogado)
13. O Brasil será bloqueado? Qual a exposição dos fundadores? (para advogado)
14. Cotações reais de auditoria para o programa de pote (pedir três).
15. Valores atuais do prêmio e da aceleração do Colosseum, e se vale submeter o modelo atual.
16. Salário ou diária de um desenvolvedor de Solana por contrato, para o plano B.

## Fontes

Arquivos do projeto (lidos por inteiro ou nas seções citadas)

- `docs/business/ideacao-perguntas-e-respostas.md` (decisões do fundador)
- `docs/business/BRIEFING-MERCADO-DE-POTE.md`
- `docs/business/_review/plano-das-ondas.md`
- `knowledge-base/market/monetizacao-e-tesouraria.md` (agente 1F)
- `knowledge-base/market/market-research.md` (agente 1B)
- `knowledge-base/market/publico-web3.md` (agente 1D)
- `knowledge-base/market/dois-tokens-e-ico-privado.md` (agente 1G)
- `knowledge-base/market/receita-mercados-de-previsao.md`
- `knowledge-base/market/patrocinio-e-destaque-pago.md`
- `knowledge-base/market/regulacao.md` (agente 1C, só o início)
- `knowledge-base/competitors/top-5-competitor-analysis.md` (agente 1E)
- `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md` (agente 1H, resumo e seção de custo)
- `ECONOMICS.md` do sócio (`git show upstream/main:ECONOMICS.md`)
- Repositório: `LICENSE`, `git shortlog`, contagem de linhas de `programs/pred-provable/src`, `CLAUDE.md`

Fontes novas desta rodada (busca Exa, 4/out/2026, uma leitura de trechos)

- Helius, planos e preços (FATO): https://www.helius.dev/pricing e https://www.helius.dev/docs/billing/plans
- Accretion, custo de auditoria em Solana, 14/abr/2026 (FATO SECUNDÁRIO, empresa de auditoria):
  https://accretion.xyz/blog/solana-audit-cost
- TierZero, custo de auditoria, 13/jul/2026 (FATO SECUNDÁRIO, empresa de auditoria):
  https://tierzero.dev/blog/smart-contract-audit-cost-evm-solana-ton-2026
- Zealynx, preços de auditoria, 6/jan/2026 (FATO SECUNDÁRIO):
  https://www.zealynx.io/research/audit-ops/audit-pricing-2026
- Techfyte, custo de auditoria em Solana, 29/jul/2026 (FATO SECUNDÁRIO):
  https://techfyte.com/solana-smart-contract-audit-cost-in-2026/
- Neo Legal, emissão de token no exterior, 16/mai/2026 (FATO SECUNDÁRIO, escritório):
  https://neolegal.ae/insights/offshore-token-issuance-bvi-cayman-marshall-panama
- finconduit, fundação em Cayman, 9/mai/2026 (FATO SECUNDÁRIO):
  https://finconduit.com/resources/cayman-foundation-dao-treasury
- Consulting24, empresa no Panamá, 13/jun/2026 (FATO SECUNDÁRIO, prestador): https://www.consulting24.co/cost/
- GIP Research, custo de parecer de token, 17/jul/2026 (fonte fraca):
  https://gipresearch.com/patent-attorney/token-legal-opinion-cost/
- Optimism, análise do quinto airdrop, 31/jan/2025 (FATO, fórum de governança da própria Optimism):
  https://gov.optimism.io/t/did-op-airdrop-5-increase-user-retention-rates-a-regression-discontinuity-analysis/9610
- "Airdrops: Giving Money Away Is Harder Than It Seems" (FATO SECUNDÁRIO, artigo acadêmico):
  https://arxiv.org/html/2312.02752v4
- Xangle, custo de aquisição nos airdrops de Optimism e Arbitrum, 22/mai/2023 (FATO SECUNDÁRIO):
  https://xangle.io/en/research/detail/1192
- Kerman Kohli, custo por usuário do airdrop da Arbitrum, 13/abr/2023 (FATO SECUNDÁRIO):
  https://kermankohli.substack.com/p/arbitrums-2175user-acquisition-campaign

Não encontrado nesta rodada: aposta média por carteira em qualquer plataforma; retorno medido de prêmios; preço de
licença de jogo; salário de desenvolvedor de Solana; valores do Colosseum; qualquer caso de patrocínio de pergunta
pago por marca.

## Anexo: tabela de premissas

| Premissa | Valor assumido | De onde veio | Quão frágil é |
|---|---|---|---|
| Taxa | 3% do pote | Decisão do fundador | Firme como decisão; a forma (fixa, sobre o pote inteiro) é frágil (seção 3) |
| Parte da taxa que paga a operação | 25% (0,75% do volume) | Decisão do fundador | Firme como decisão; é a premissa que mais pesa no resultado |
| Custo do nível 1 | US$ 3.000 por mês | Estimativa minha: RPC oficial, faixas de fornecedores, resto suposto | Média. Pode ser US$ 1.500 sem reserva de auditoria, ou US$ 5.000 com advogado |
| Custo do nível 2 | US$ 10.000 por mês | Suposição | Alta. Depende de quanto os fundadores retiram |
| Custo do nível 3 | US$ 25.000 por mês | `ECONOMICS.md`, que o chama de "placeholder" | Alta. O fundador já disse que não deve ser esse o custo |
| Preço do RPC | US$ 49, 499 e 999 por mês | Página oficial da Helius, 4/out/2026 | Baixa |
| Primeira auditoria | US$ 15 a 45 mil | Blogs de duas empresas de auditoria, 2026 | Média. Só cotação real resolve |
| Empresa no exterior | US$ 1,5 a 6 mil para abrir; US$ 1 a 2,5 mil por ano | Prestadores com interesse comercial | Média |
| Avaliação jurídica e parecer do token | US$ 5 a 15 mil e US$ 15 a 50 mil | Um blog, fonte fraca | Alta |
| Prêmios iniciais | US$ 5 a 10 mil | Suposição | Alta |
| Meses até o equilíbrio | 12, 18 e 24 | Suposição, sem nenhum dado | Muito alta. É a premissa mais fraca da conta de capital |
| Subida do volume | Linha reta de zero ao equilíbrio | Suposição | Muito alta. Os concorrentes mostram picos e quedas de 80% a 96% |
| Depósito por carteira ativa | US$ 200 por mês | Suposição | Muito alta. Não há dado em nenhuma plataforma |
| Tempo de vida do apostador | 6 meses | Suposição | Muito alta |
| Duração média das perguntas | 3, 7 ou 30 dias | Suposição, em três casos | Alta. Depende do cardápio de perguntas |
| Saídas antecipadas | 20% do dinheiro, penalidade média de 25% | Suposição | Alta. O mecanismo não tem precedente (agente 1H) |
| Patrocinadores por mês | 1, 3 e 8 | Suposição, sem nenhum dado | Muito alta. Não há precedente pago nem conversa registrada |
| "70/30" | Dois cenários (A: 70% banca; B: 30% banca) | Frase ambígua do fundador | Em aberto |
| Destino da parte da banca no patrocínio | Mostrado como 100% operação e como dividido em quatro | Não decidido | Em aberto, e vale quatro vezes |
| Tempo para vender um patrocínio | 5 horas a US$ 25 | Suposição | Alta |
| Transações lidas por página do aplicativo | 50 | Suposição | Alta. Depende de como o aplicativo for refeito |
| Volume do World, Limitless e Jupiter | US$ 15,44 mi, 10,75 mi e 5,5 mi por mês | DefiLlama, via agente 1E, 4/out/2026 | Baixa a média |
| "140 milhões por ano" de Limitless e Myriad | 138 e 145 milhões | Uma semana de dez/2025 vezes 52 (DeFiRate) | Alta |
| Giro do World | 90 vezes por mês | Volume ÷ dinheiro travado (DefiLlama) | Média |
| Interesse pelo recorte on-chain | US$ 263 mil em mercados de pump.fun no Polymarket | Agregador, sem data | Alta |
| Custo de aquisição de referência | US$ 77 a US$ 2.500 por usuário | Xangle e Kerman Kohli, 2021 a 2023 | Alta. Antigos e de outro tipo de produto |
| Avaliação do segundo token | US$ 5 milhões; venda de 15% | Exemplo do `ECONOMICS.md` e do agente 1G | Muito alta. O próprio sócio chama de "placeholder" |
| Rendimento exigido pelo comprador do token | 20% ao ano | `ECONOMICS.md` | Alta |
| Cronograma de desbloqueio do segundo token | Tabela 6.2 do agente 1G | Proposta, não decisão | Alta |
| Destino do dinheiro da venda privada | 30% prêmios, 30% liquidez, 40% operação | Proposta do agente 1G | Alta |
| Preço do bitcoin | Perto de US$ 58,8 mil (jun/2026) e US$ 63,8 mil (ago/2026) | Imprensa, via agente 1F | Média |
| Linhas do programa atual | 1.717 | Contagem no repositório, 4/out/2026 | Baixa. O programa novo será diferente |
