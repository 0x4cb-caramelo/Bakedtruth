# Pauta — BP v0.0.2, Parte 2: Mercado e negócio

Data: 4 de outubro de 2026. O Lucas pediu: "pode fazer a parte 2". Esta pauta reúne as decisões dele que tocam o
negócio, o modelo financeiro refeito com essas decisões, e o roteiro do documento.

## 1. Decisões do Lucas que governam a Parte 2

Trechos entre aspas são palavras dele.

- **Taxa.** 3% do pote é a regra em vigor. A forma está em aberto: A (3% do pote), B (10% do lado perdedor) ou C (8%
  do lado perdedor). A simulação está em `bp-impact-review-v0.0.2.md`, seção 2. A Parte 2 usa a forma A como base e
  mostra a B ao lado.
- **Destino da taxa.** "vamos dividir 25% da taxa para treasure e todos os demais 75% para a operação ... até
  equilibrarmos as contas, coisa que pode ser de 5 a 12 meses, e mudarmos as regras internas."
- **Tesouraria em Bitcoin.** "começa desde o dia zero, mas depois do mês 12 a gente repensa".
- **Fundo de prêmios.** "vamos prometer essa feature no futuro". "poderá ser criada a partir do mês 10, e depois de 2
  meses captando recursos ele passar a ser direcionado ao seu lugar". Sai da operação só se ela já estiver paga.
- **Recompra do token.** "só faríamos isso com caixa da empresa a partir do mês 13, não antes"; decisão futura.
- **Saída antecipada:** não existe no MVP. A taxa incide sobre todo o volume apostado.
- **Patrocínio.** Faixas de 500, 1.500 e 5.000 dólares; "70 pro pote/pool e 30 pra banca/plataforma".
- **Parceiros.** "a gente pretende convidar parceiros da rede para entrar como patrocinador ... sem que eles tenham a
  obrigação de pagar qualquer coisa, isso para fins de marketing ... 20 a 30 projetos". Eles "nos entregam publicidade
  e postagem nas suas redes sociais". Gratuito para os 30 primeiros.
- **Indicação.** Desde o MVP, paga pela taxa do próprio indicado: quem indica recebe 20% da taxa gerada pelo indicado
  por 90 dias; o indicado não paga taxa até completar 50 USDC apostados. Os números são proposta aguardando decisão.
- **Custos.** Infraestrutura de até 1.000 dólares por mês no primeiro ano; três sócios com pró-labore de 1.500 dólares
  cada. Referência: 5.500 dólares por mês.
- **Investimento.** "de USD50k nos primeiros 6 meses a USD 350k até o final do primeiro ano. Mas temos que trabalhar
  no bootstrap, sem depender de conseguirmos qualquer coisa."
- **Aquisição.** Perto de zero em mídia paga. Canais: parceiros, sugestões e conteúdo no X, beta com pontuação,
  indicação, e o token A como "canal de tração", sem vínculo com a empresa.
- **Investidores.** Existe uma planilha com cerca de 50 mil investidores mapeados, para convite por email e funil de
  captação. É dado pessoal e disparo em massa: pela regra de privacidade do projeto, precisa de revisão antes de
  qualquer construção. Tratar como canal de captação de investimento, não de usuários.
- **O que copiar dos concorrentes** (aprovado): página de taxas com exemplo numérico; política de reembolso escrita;
  pagamento automático; indicação; MVP inteiro na devnet, com pontuação.
- **Para a fase 2, de olho:** contratos perpétuos e alavancagem; taxa de construtor (site de terceiros que manda
  apostas); indicação e afiliados; taxa de depósito e saque; esportes, com um oráculo específico, "para ampliar o nosso
  público, que inicialmente é web3".
- **Nome:** Brot Markets.

## 2. O modelo financeiro refeito

Tudo nesta seção é INFERÊNCIA: projeção com premissas declaradas, conferida por script em 4 de outubro de 2026.

### 2.1 Premissas

| Premissa | Valor | Origem |
|---|---|---|
| Taxa | 3% do volume apostado (forma A). Sem saída antecipada, o pote final é igual ao volume | Decisão |
| Destino da taxa | 25% tesouraria em Bitcoin; 75% operação | Decisão |
| Custo da indicação | 5% da taxa | Suposição: um quarto do volume vem de indicados nos primeiros 90 dias, a 20% |
| Custo mensal | 5.500 dólares, desde o primeiro mês com dinheiro real | Decisão |
| Gasto antes da rede principal | 2.000 dólares: abertura da empresa. Auditoria e avaliação jurídica sem custo | Informado pelo fundador em 4/10/2026: "as duas auditorias ... vão custar zero reais. A abertura da empresa vai custar sim uns 2k dol, e a avaliação jurídica eu consigo gratuitamente". A v0.0.1 supunha 44.000 |
| Meses na devnet | Fora do modelo. Cada mês antes da rede principal custa 5.500 dólares e não gera receita | Decisão de rodar o MVP na devnet |
| Trajetória de volume | A mesma dos três cenários da v0.0.1, em linha reta até o mês 12 e outra até o mês 24 | Onda 2 |
| Patrocínio pago | Ruim: nenhum. Razoável: um de 500 por mês do mês 7 ao 12; no segundo ano, dois de 500 e um de 1.500 por mês. Otimista: um de 500 por mês nos meses 4 a 6; dois de 500 e um de 1.500 nos meses 7 a 12; no segundo ano, três de 500 e um de 1.500 por mês, mais um de 5.000 por trimestre | Suposição, reduzida porque os primeiros 30 parceiros não pagam |
| Fundo de prêmios | A partir do mês 10: o menor entre 25% da taxa e a sobra da operação | Decisão |
| Recompra | Fora do modelo | Decisão |

### 2.2 Ponto de equilíbrio

A operação recebe 75% da taxa, menos o custo da indicação. O volume mensal que paga os 5.500 dólares:

| Forma da taxa | Taxa média sobre o volume | Volume de equilíbrio por mês | Sem indicação |
|---|---|---|---|
| A: 3% do pote | 3,00% | 257.310 | 244.444 |
| B: 10% do lado perdedor, mistura meio a meio | 3,70% | 208.630 | 198.198 |
| B, maioria de perguntas equilibradas | 4,18% | 184.672 | 175.439 |
| B, maioria com favorito claro | 2,70% | 285.900 | 271.605 |

Na regra da v0.0.1 (só 25% da taxa para a operação), o mesmo custo pedia 733.333 dólares por mês. A decisão de mandar
75% para a operação cortou o ponto de equilíbrio a um terço.

Conta da forma A: `5.500 ÷ (3% × 75% × 95%) = 257.310`.

### 2.3 Os três cenários, forma A

Volume e valores do mês indicado, em dólares. "Caixa" é o acumulado desde antes do lançamento, partindo de −2.000.

**Cenário ruim** (volume de 45 mil por mês a partir do mês 6, caindo no segundo ano; sem patrocínio).

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio | Custo | Fundo de prêmios | Resultado | Caixa |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 22.500 | 675 | 169 | 481 | 0 | 5.500 | 0 | −5.019 | −17.538 |
| 6 | 45.000 | 1.350 | 338 | 962 | 0 | 5.500 | 0 | −4.538 | −31.633 |
| 12 | 45.000 | 1.350 | 338 | 962 | 0 | 5.500 | 0 | −4.538 | −58.862 |
| 18 | 38.750 | 1.163 | 291 | 828 | 0 | 5.500 | 0 | −4.672 | −86.652 |
| 24 | 31.250 | 938 | 234 | 668 | 0 | 5.500 | 0 | −4.832 | −115.404 |

Não chega ao equilíbrio. Caixa mínimo: −115.404 no mês 24, e continua caindo. Taxa total em 24 meses: 26.100.

**Cenário razoável** (300 mil por mês no mês 12; 712 mil no mês 24).

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio | Custo | Fundo de prêmios | Resultado | Caixa |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 75.000 | 2.250 | 563 | 1.603 | 0 | 5.500 | 0 | −3.897 | −15.294 |
| 6 | 150.000 | 4.500 | 1.125 | 3.206 | 0 | 5.500 | 0 | −2.294 | −23.778 |
| 12 | 300.000 | 9.000 | 2.250 | 6.413 | 150 | 5.500 | 1.063 | 0 | −27.009 |
| 18 | 487.500 | 14.625 | 3.656 | 10.420 | 750 | 5.500 | 3.656 | 2.014 | −19.608 |
| 24 | 712.500 | 21.375 | 5.344 | 15.230 | 750 | 5.500 | 5.344 | 5.136 | 6.525 |

Equilíbrio no mês 11. Caixa mínimo: −27.009 no mês 12; o caixa volta a ficar positivo no mês 24. Tesouraria acumulada: 14.625 no mês 12 e 63.563 no mês 24.
Fundo de prêmios acumulado no mês 24: 50.528. Taxa total: 58.500 no primeiro ano e 254.250 em 24 meses.

**Cenário otimista** (1,5 milhão por mês no mês 12; 4,7 milhões no mês 24).

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio | Custo | Fundo de prêmios | Resultado | Caixa |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 375.000 | 11.250 | 2.813 | 8.016 | 0 | 5.500 | 0 | 2.516 | −2.469 |
| 6 | 750.000 | 22.500 | 5.625 | 16.031 | 150 | 5.500 | 0 | 10.681 | 21.559 |
| 12 | 1.500.000 | 45.000 | 11.250 | 32.063 | 750 | 5.500 | 11.250 | 16.063 | 114.419 |
| 18 | 2.958.333 | 88.750 | 22.188 | 63.234 | 1.400 | 5.500 | 22.188 | 36.947 | 299.678 |
| 24 | 4.708.333 | 141.250 | 35.313 | 100.641 | 1.400 | 5.500 | 35.313 | 61.228 | 630.625 |

Equilíbrio no mês 3. Caixa mínimo: −4.984, no mês 2. Tesouraria acumulada: 73.125 no mês 12 e 378.750 no mês 24. O custo fica
em 5.500 nos 24 meses, o que não é realista com esse volume: é a conta sem contratar ninguém.

### 2.4 O cenário razoável com a forma B (taxa média de 3,70%)

| Mês | Volume | Taxa | Operação | Resultado | Caixa |
|---|---|---|---|---|---|
| 6 | 150.000 | 5.550 | 3.954 | −1.546 | −21.160 |
| 12 | 300.000 | 11.100 | 7.909 | 0 | −21.392 |
| 24 | 712.500 | 26.363 | 18.783 | 7.443 | 33.267 |

Equilíbrio no mês 9 em vez do 11. Caixa mínimo: −21.974. Taxa total em 24 meses: 313.575, contra 254.250 na forma A.

### 2.5 Capital necessário

| Cenário | Caixa mínimo (forma A) | Quando |
|---|---|---|
| Ruim | −115.404 | mês 24, e continua caindo |
| Razoável | −27.009 | mês 12 |
| Otimista | −4.984 | mês 2 |

Somar a isso 5.500 dólares por mês de devnet antes do lançamento. Quase todo o buraco de caixa é o pró-labore dos
três sócios (4.500 dos 5.500 por mês): se os sócios adiarem a retirada, o razoável precisa de muito pouco dinheiro de
fora. A captação que o fundador busca (50 mil em seis meses, 350 mil em um ano) cobre com folga o razoável e o
otimista; o ruim não se paga.

### 2.6 Patrocínio e indicação, por unidade

| Faixa | Vai para o pote (70%) | Fica com a plataforma (30%) |
|---|---|---|
| 500 | 350 | 150 |
| 1.500 | 1.050 | 450 |
| 5.000 | 3.500 | 1.500 |

Indicação, exemplo: o indicado aposta 1.000 em 90 dias. Taxa gerada: 30. Isenção nos primeiros 50: 1,50. Taxa
efetiva: 28,50. Quem indicou recebe 20%: 5,70. A casa fica com 22,80, ou 76% do que teria sem a indicação.

### 2.7 Metas de 90 dias com dinheiro real

| Medida | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume apostado, somado | Até 45 mil | 150 mil | 750 mil ou mais |
| Volume no terceiro mês | 22.500 | 75.000 | 375.000 |
| Carteiras ativas no terceiro mês | 150 | 375 | 1.500 |
| Carteiras que apostam de novo em 30 dias | Menos de 10% | 20% a 35% | Mais de 35% |
| Potes que terminam de um lado só | Mais de 40% | Cerca de 20% | Menos de 10% |
| Taxa arrecadada | 1.350 | 4.500 | 22.500 |

### 2.8 O que o modelo não sabe

Aposta média por carteira; quantos apostadores voltam; quantos parceiros viram patrocinadores pagantes; quanto do
volume vem por indicação; o custo real da auditoria; quanto tempo o produto fica na devnet; o efeito da forma da taxa
no comportamento de quem aposta. A trajetória em linha reta é simplificação: os concorrentes mostram picos e quedas de
80% a 96%.

## 3. Roteiro da Parte 2

**Arquivo de saída:** `docs/business/BP-v0.0.2-parte-2-mercado-e-negocio.md`.
**Tamanho:** entre 9.000 e 12.000 palavras (`wc -w`). Acima de 12.000, cortar.
**Fonte do texto:** `docs/business/_review/bp-parte-a.md`, capítulo 5, e `bp-parte-b.md`, capítulos 6, 7, 9 e 10,
reescritos e encurtados. O capítulo 8 (tokens) fica para a Parte 3 e não entra aqui.
**Números:** os da seção 2 desta pauta para tudo que é financeiro; os de `wave-3-coordinator.md` para mercado e
concorrentes. Os números financeiros da v0.0.1 (equilíbrio de 471 mil a 3,92 milhões; taxa efetiva de 2,55%; operação
com 0,64% do volume; capital de 70 a 136 mil) estão superados e não podem aparecer.

| Capítulo | Conteúdo | Palavras |
|---|---|---|
| Cabeçalho | Título "Brot Markets — Business Plan v0.0.2 — Parte 2: Mercado e negócio", data, estado, como ler, o que mudou desde a v0.0.1 em dez linhas | 300 |
| 1. Resumo | O mercado em três números, como a empresa ganha dinheiro, o ponto de equilíbrio novo, os três cenários em uma tabela, o que falta decidir | 700 |
| 2. Mercado e público | Tamanho do mercado de previsão; o que os entrantes recentes alcançaram; o público web3 em números; no que ele aposta; a demanda pelo nosso recorte ainda não demonstrada e como o beta na devnet e os parceiros servem de teste | 1.500 |
| 3. Concorrência | Os cinco concorrentes numa tabela (mecanismo, quem abre as perguntas, como resolve, taxa, token, escala, ponto fraco); onde ficamos; o que copiamos, com o que o fundador aprovou | 1.700 |
| 4. Como a empresa ganha dinheiro | 4.1 a taxa e o destino dela (25% tesouraria, 75% operação), com a forma em aberto; 4.2 patrocínio: faixas, 70% para o pote, o que a plataforma recebe; 4.3 o programa de parceiros gratuitos e por que ele vale mais que a receita de patrocínio no começo; 4.4 indicação, com o exemplo; 4.5 fundo de prêmios: o que é, para que serve, de onde sai, a partir do mês 10; 4.6 tesouraria em Bitcoin; 4.7 recompra, em espera; 4.8 outras formas de receita que o setor usa e a lista da fase 2 | 2.700 |
| 5. Projeções | 5.1 premissas; 5.2 ponto de equilíbrio, com a comparação com a regra antiga; 5.3 os três cenários; 5.4 o razoável com a forma B; 5.5 capital necessário e a captação buscada; 5.6 metas de 90 dias; 5.7 o que o modelo não sabe | 2.600 |
| 6. Entrada no mercado | Fases (devnet com pontuação, parceiros, rede principal); canais sem mídia paga; o papel do token A; sugestões pelo X; captação de investimento e a lista de investidores, com a ressalva de privacidade; o que medir | 1.300 |
| 7. Decisões pendentes e objeções | As decisões que faltam para fechar a Parte 2, cada uma com contexto, opções e recomendação; tabela das objeções da v0.0.1 que tocam o negócio (consulte o "Anexo C" no fim de `bp-parte-c.md`), com a situação de cada uma | 800 |

**Regras de redação:** as mesmas da Parte 1. Português do Brasil; leitor que não é engenheiro; cada conceito com
definição, motivo e exemplo com números; sem siglas soltas; sem jargão sem explicação (o fundador pediu "expressões
mais simples"); decisões dele como decisões, com as palavras dele quando ajudar; propostas marcadas como "Proposta,
aguardando decisão"; projeção sempre marcada como INFERÊNCIA; etiquetas FATO e FATO SECUNDÁRIO nos números de mercado;
nada de promessa de retorno. Toda decisão pendente vem com contexto de duas ou três frases, opções e recomendação.
Manter os identificadores das objeções só na tabela do capítulo 7.
