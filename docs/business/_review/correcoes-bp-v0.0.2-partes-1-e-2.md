# Correções do BP v0.0.2, Partes 1 e 2 — terceira devolutiva do fundador (5/10/2026)

Este arquivo é a lista de mudanças que os revisores aplicam nas Partes 1 e 2. Tudo aqui é **decisão do fundador**,
dada em 5/10/2026, e prevalece sobre o que as duas partes dizem hoje. As citações entre aspas são dele.

## 1. Decisões

### 1.1 Sobre a Parte 1 (produto)

| # | Assunto | Resposta do fundador | O que passa a valer |
|---|---|---|---|
| 1 | Forma da taxa | "forma da taxa, sua recomendação" | **A taxa é 10% do lado perdedor.** As formas de 3% do pote e de 8% do lado perdedor deixam de ser opções e ficam só como comparação |
| 2 | Fechamento das apostas | "um fechamento só, porém vamos sim permitir perguntas acima de 30 dias, limitados a 90 no mvp" | Uma regra só, a do T2, para todas as perguntas. Duração máxima de **90 dias** no MVP |
| 3 | Lista dos tipos de pergunta do primeiro dia | "esse trecho você segue me entregando sem contexto, eu não sei o que é, e quais as suas recomendações" | **Continua pendente.** É a única proposta que sobra na Parte 1 e precisa ser reescrita (ver seção 2.5) |
| 4 | Vigia do serviço agendado | "sim, e aí o segundo assume o cron e envia notificação para o cto saber que tem um sistema down" | Decidido: 10 minutos sem resposta, 3 tentativas de religar; depois o segundo serviço assume e avisa o CTO |
| 5 | Disputa em duas etapas | "pode ser, mas membros da equipe, né?" | Decidido. Os revisores da etapa 2 são **membros da equipe**, dois de três |
| 6 | Indicação | "gosto. sim, vamos." | Decidido: 20% por 90 dias. O benefício do indicado segue a regra 1.2, item 4 |
| 7 | 1% no pote de um lado só | "ok" | Fica como regra à parte, do jeito já decidido |
| 8 | Prêmio do patrocinador em pote de um lado só ou pergunta anulada | "ok" | O prêmio volta inteiro ao patrocinador nos dois casos |
| 9 | Tipo "tokens travados" | "ok" | Fora da lista do primeiro dia, porque o leitor só lê tokens do padrão clássico |
| 10 | Indicação com a taxa sobre o ganho | "ok" | Os 20% incidem sobre a taxa que a casa de fato recebeu das apostas vencedoras do indicado |

### 1.2 Sobre a Parte 2 (mercado e negócio)

| # | Assunto | Resposta do fundador | O que passa a valer |
|---|---|---|---|
| 1 | Forma da taxa | "vamos manter a mesma resposta da parte 1" | 10% do lado perdedor é a base de todas as tabelas |
| 2 | Os 30% do patrocínio que ficam com a plataforma | "concordo" | Vão inteiros para a operação até o equilíbrio |
| 3 | Programa de parceiros | "perfeito, sim" | Uma pergunta gratuita por parceiro, com selo, nome, link e destaque de 72 horas. As duas publicações por pergunta e a gratuidade para os 30 primeiros já estavam decididas |
| 4 | Benefício do indicado | "sim, vamos fazer isso" | Em vez de isenção na hora, **devolução**: a taxa cobrada sobre os primeiros 50 USDC apostados volta ao indicado depois que ele completar 250 USDC apostados |
| 5 | Tempo na devnet | "provavelmente vamos pra mainnet já no início do mês 2, sim" | Cerca de **um mês de devnet**. O gasto antes do dinheiro real passa a 7.500: 2.000 da abertura da empresa mais 5.500 do mês de devnet |
| 6 | Critério de parada | "ok" | Aceito, como estava proposto |
| 7 | Lista de investidores | "não tem problema, pois são e-mails de negócios, e não dados pessoais" | Decisão do fundador: a lista é tratada como contatos de negócio e o convite por email segue. Fica uma linha de ressalva, sem virar pendência (ver 3.6) |

## 2. Parte 1: o que mudar

### 2.1 A conta do pote, na taxa decidida

Fórmula. Seja `V` o total do lado que ganhou e `P` o total do lado que perdeu.

- Taxa = `0,10 × P`.
- Sobra para os vencedores = `V + 0,90 × P`.
- Cada 1 USDC do lado vencedor recebe `(V + 0,90 × P) ÷ V`.
- Dito de outro jeito: quem acerta recebe de volta o que apostou, mais a sua parte em 90% do que o outro lado perdeu.

Todo exemplo numérico da Parte 1 que usa "taxa de 3%" precisa ser refeito com essa fórmula. Os principais, já
conferidos:

| Exemplo | Com 3% (hoje no texto) | Com 10% do lado perdedor |
|---|---|---|
| Base: 300 no SIM, 700 no NÃO. Dá SIM | taxa 30; sobra 970; 3,23 por dólar; 100 viram 323,33 | taxa 70; sobra 930; 3,10 por dólar; 100 viram 310,00 |
| Base. Dá NÃO | taxa 30; sobra 970; 1,39 por dólar; 100 viram 138,57 | taxa 30; sobra 970; 1,39 por dólar; 100 viram 138,57 |
| Entram mais 700 no SIM (1.000 SIM, 700 NÃO), dá SIM | sobra 1.649; 1,65 | taxa 70; sobra 1.630; 1,63 |
| Pote de 5.000 de cada lado | 1,94 | taxa 500; 1,90 |
| Alguém põe 10.000 no SIM desse pote (15.000 SIM, 5.000 NÃO), dá SIM | 1,29 | taxa 500; sobra 19.500; 1,30 |
| Oportunista: pote 500/500, ele põe 5.000 no NÃO e dá NÃO | recebe 5.290,91, lucro 290,91; os antigos caem de 1,94 para 1,058 | taxa 50; recebe 5.409,09, lucro 409,09; os antigos caem de 1,90 para 1,082 |
| Patrocínio: 6.000 no SIM e 4.000 no NÃO, sem prêmio | SIM 1,617; NÃO 2,425 | Dá SIM: taxa 400, 1,600. Dá NÃO: taxa 600, 2,350 |

Os demais exemplos (patrocinador com prêmio, pergunta pedida por um token, o ataque da chave na seção 4.3)
precisam ser recalculados pelo revisor com a mesma fórmula e conferidos por conta.

**O prêmio do patrocinador não paga taxa.** Na taxa decidida, só o lado perdedor é base de cálculo. O prêmio é
dinheiro neutro e vai inteiro aos vencedores. A plataforma é paga pelo patrocínio com os 30% que retém.

### 2.2 A seção 3.3 muda de natureza

Hoje se chama "A taxa: três formas na mesa" e termina numa recomendação. Passa a se chamar "A taxa: 10% do lado
perdedor" e abre com a decisão. As três tabelas de simulação ficam, mais curtas, como a explicação de por que os
3% saíram. Devem continuar ditos, sem suavizar:

- a taxa rende mais que os 3% enquanto o favorito tem menos de 81,6% do pote, e menos daí em diante;
- o rendimento médio para a casa é `2 × 0,10 × q × (1 − q)` do pote, em que `q` é a chance do lado vencedor quando
  os apostadores estão bem informados: 5% do pote no meio a meio, 4,2% com 70/30, 1,8% com 90/10;
- a receita passa a depender da mistura de perguntas, que ninguém mediu.

A frase de apresentação "A casa fica com 10% do que os vencedores ganham" (seção 4.7) deixa de ser condicional.

### 2.3 Fechamento: uma regra só, até 90 dias

Regra: as apostas fecham quando faltam 5% da duração, com mínimo de 24 horas e máximo de 7 dias. Vale para todas
as perguntas. Nas perguntas de fato que não volta atrás, as apostas também travam no instante em que o fato
acontece. A opção avançada para perguntas curtas (menos de 24 horas, com segunda assinatura e registro on-chain)
continua como está. A regra dos 80% sai do produto; pode ficar citada em uma frase, como o que existia antes.

| Duração da pergunta | Fecha no dia | Dias sem aposta no fim |
|---|---|---|
| 3 dias | 2,0 | 1,0 |
| 7 dias | 6,0 | 1,0 |
| 14 dias | 13,0 | 1,0 |
| 30 dias | 28,5 | 1,5 |
| 60 dias | 57,0 | 3,0 |
| 90 dias | 85,5 | 4,5 |

Dizer também o custo: sem saída antecipada no MVP, quem aposta numa pergunta de 90 dias fica com o dinheiro preso
por até três meses. A tela deve avisar isso antes da aposta. O exemplo da pergunta de 180 dias sai ou vira menção
à fase seguinte.

### 2.4 Demais seções

- **3.4 (pote de um lado só e pergunta anulada).** Tirar a frase sobre rever o 1% junto com a decisão da taxa: a
  regra do 1% está mantida, como regra à parte. Substituir o "ponto ainda sem regra" do prêmio do patrocinador
  pela decisão: o prêmio volta inteiro ao patrocinador no pote de um lado só e na pergunta anulada. O destino dos
  30% da plataforma nesses dois casos não foi decidido; registrar em uma frase que a Parte 4 fecha esse detalhe.
- **3.8 (indicação).** Vira decisão. Quem indica recebe 20% da taxa que a casa recebeu das apostas vencedoras do
  indicado, por 90 dias. O indicado recebe de volta a taxa cobrada sobre os primeiros 50 USDC que apostou, depois
  de completar 250 USDC apostados. Motivo da troca da isenção pela devolução: com isenção na hora, quem abrisse
  uma carteira nova a cada 50 dólares nunca pagaria taxa. Exemplo novo: em 90 dias o Caio aposta 1.000 USDC; a
  taxa descontada dos ganhos dele soma 37 (é a média de 3,70% do volume, da Parte 2); Bia recebe 20%, 7,40; a
  devolução ao Caio é, na média, de 1,85; a casa fica com 27,75. Um detalhe novo, que nasce da taxa sobre o ganho
  e ainda não foi visto pelo fundador: uma aposta de 50 USDC num azarão que ganha gera uma taxa alta, então a
  devolução precisa de um teto. Registrar como **detalhe a confirmar**: teto de 5 USDC por indicado.
- **4.2 (tipos de pergunta).** "Tokens travados" passa a "Não, no primeiro dia" e ganha o motivo na seção 4.3.
- **4.4 (serviço agendado).** Os números da vigia viram decisão, com a citação do fundador.
- **4.6 (disputa).** Vira decisão, com a citação. Deixar explícito que os três revisores são membros da equipe.
- **Capítulo 1.** Refazer 1.2 (exemplo), 1.3 (o que está decidido) e 1.4 (o que falta decidir, agora um item só).
- **Capítulo 5.** A seção 5.1 encolhe: uma tabela curta "decidido em 5/10/2026" com as nove decisões, e a única
  proposta pendente, a da seção 2.5 abaixo. Atualizar a tabela de objeções onde ela dizia "aguardam decisão".
- **Cabeçalho.** A lista "o que mudou desde a v0.0.1" e a frase sobre "seis propostas" precisam refletir o novo
  estado.

### 2.5 A proposta que sobra: os tipos de pergunta do primeiro dia

O fundador disse duas vezes que este trecho chega a ele sem contexto. A palavra "cardápio" sai. O trecho deve ser
reescrito assim, nesta ordem e em linguagem de quem nunca viu o programa:

1. **O que está sendo decidido, em uma frase.** No dia em que o site abrir, sobre quais assuntos a equipe vai
   poder abrir perguntas.
2. **Por que isso é uma decisão.** Cada tipo de pergunta precisa de um "leitor", que é o pedaço do programa que vai
   na rede buscar a resposta. Alguns leitores já existem, um precisa ser construído, e alguns tipos são perigosos.
3. **O critério, com um exemplo de dinheiro.** A pergunta é: alguém consegue decidir o resultado sem gastar nada?
   Se sim, essa pessoa aposta no lado certo por outra carteira, aperta o botão e leva o pote.
4. **A tabela dos tipos**, com exemplo de pergunta, quem controla o resultado e a recomendação: entra ou não entra.
5. **As três saídas possíveis e o que cada uma custa:** (a) lançar com os cinco tipos recomendados, construindo
   primeiro o leitor de preço; (b) lançar só com os quatro tipos que já têm leitor e incluir o preço depois; (c)
   esperar o leitor de preço para lançar.
6. **A recomendação e o porquê:** a saída (a). O preço é o único tipo que ninguém controla e é o assunto em que o
   público de cripto mais aposta; os outros quatro dão ao site o que nenhum concorrente tem.

## 3. Parte 2: o que mudar

### 3.1 Premissas novas do modelo

| Premissa | Antes | Agora |
|---|---|---|
| Taxa | 3% do volume | 10% do lado perdedor. Na média, **3,70% do volume**, supondo metade das perguntas equilibrada e metade com favorito claro |
| Gasto antes do dinheiro real | 2.000 | **7.500**: 2.000 da abertura da empresa e 5.500 de um mês de devnet |
| Mês 1 das tabelas | Primeiro mês | Primeiro mês na rede principal. O mês de devnet vem antes |
| Destino da taxa | 25% tesouraria, 75% operação | Igual |
| Custo da indicação | 5% da parte da operação | Igual |
| Custo mensal | 5.500 | Igual |
| Patrocínio | Parte da plataforma (30%) inteira para a operação | Igual, agora como decisão |
| Fundo de prêmios | A partir do mês 10, o menor entre 25% da taxa e a sobra do mês | Igual |

A taxa média de 3,70% é INFERÊNCIA e é a premissa mais frágil do modelo: vai de 2,70% (maioria de perguntas com
favorito claro) a 4,18% (maioria equilibrada).

### 3.2 Ponto de equilíbrio

| Mistura de perguntas | Taxa média sobre o volume | Volume de equilíbrio por mês | Sem indicação |
|---|---|---|---|
| **Meio a meio (base)** | 3,70% | **208.630** | 198.198 |
| Maioria equilibrada | 4,18% | 184.672 | 175.439 |
| Maioria com favorito claro | 2,70% | 285.900 | 271.605 |
| Para comparar: os 3% do pote, que saíram | 3,00% | 257.310 | 244.444 |

A conta: `5.500 ÷ (3,70% × 75% × 95%) = 208.630`. Isso é 1,4% dos 15,44 milhões que o World fez em setembro de
2026 e, a 200 dólares por carteira por mês, cerca de 1.040 carteiras ativas.

### 3.3 Os três cenários, na taxa decidida

Volumes iguais aos de antes. Colunas: mês; volume; taxa; tesouraria (25%); operação; patrocínio; custo; fundo de
prêmios; resultado; caixa. O caixa parte de −7.500.

**Ruim**

| Mês | Volume | Taxa | Tesouraria | Operação | Patrocínio | Custo | Fundo de prêmios | Resultado | Caixa |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 22.500 | 833 | 208 | 593 | 0 | 5.500 | 0 | −4.907 | −22.814 |
| 6 | 45.000 | 1.665 | 416 | 1.186 | 0 | 5.500 | 0 | −4.314 | −36.348 |
| 12 | 45.000 | 1.665 | 416 | 1.186 | 0 | 5.500 | 0 | −4.314 | −62.230 |
| 18 | 38.750 | 1.434 | 358 | 1.022 | 0 | 5.500 | 0 | −4.478 | −88.804 |
| 24 | 31.250 | 1.156 | 289 | 824 | 0 | 5.500 | 0 | −4.676 | −116.565 |

Não se paga. Caixa de −116.565 no mês 24, e caindo. Taxa somada: 15.818 no primeiro ano, 32.190 em 24 meses.
Tesouraria: 3.954 no mês 12 e 8.048 no mês 24.

**Razoável**

| Mês | Volume | Taxa | Tesouraria | Operação | Patrocínio | Custo | Fundo de prêmios | Resultado | Caixa |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 75.000 | 2.775 | 694 | 1.977 | 0 | 5.500 | 0 | −3.523 | −20.046 |
| 6 | 150.000 | 5.550 | 1.388 | 3.954 | 0 | 5.500 | 0 | −1.546 | −26.660 |
| 12 | 300.000 | 11.100 | 2.775 | 7.909 | 150 | 5.500 | 2.559 | 0 | −26.892 |
| 18 | 487.500 | 18.038 | 4.509 | 12.852 | 750 | 5.500 | 4.509 | 3.592 | −11.114 |
| 24 | 712.500 | 26.363 | 6.591 | 18.783 | 750 | 5.500 | 6.591 | 7.443 | 27.767 |

A operação se paga no **mês 9**. Ponto mais baixo do caixa: **−27.474, no mês 8**. O caixa fica parado perto de
−26.900 do mês 10 ao 12, porque a sobra vai para o fundo de prêmios, e volta a ser positivo no mês 21. Taxa
somada: 72.150 no primeiro ano, 313.575 em 24 meses. Tesouraria: 18.038 no mês 12 e 78.394 no mês 24. Fundo de
prêmios: 66.055 somados até o mês 24.

**Otimista**

| Mês | Volume | Taxa | Tesouraria | Operação | Patrocínio | Custo | Fundo de prêmios | Resultado | Caixa |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 375.000 | 13.875 | 3.469 | 9.886 | 0 | 5.500 | 0 | 4.386 | −4.228 |
| 6 | 750.000 | 27.750 | 6.938 | 19.772 | 150 | 5.500 | 0 | 14.422 | 29.152 |
| 12 | 1.500.000 | 55.500 | 13.875 | 39.544 | 750 | 5.500 | 13.875 | 20.919 | 150.328 |
| 18 | 2.958.333 | 109.458 | 27.365 | 77.989 | 1.400 | 5.500 | 27.365 | 46.524 | 384.555 |
| 24 | 4.708.333 | 174.208 | 43.552 | 124.123 | 1.400 | 5.500 | 43.552 | 76.471 | 798.462 |

A operação se paga no **mês 2**. Ponto mais baixo do caixa: **−9.705, no mês 1**. Caixa positivo a partir do mês
4. Tesouraria: 90.188 no mês 12 e 467.125 no mês 24. Fundo de prêmios: 415.094 até o mês 24. Taxa somada: 360.750
no primeiro ano, 1.868.500 em 24 meses.

### 3.4 Se a mistura de perguntas for outra (substitui a antiga seção 5.4)

Cenário razoável, mesma trajetória de volume.

| Taxa média | Mês em que a operação se paga | Ponto mais baixo do caixa | Caixa no mês 24 | Taxa em 24 meses |
|---|---|---|---|---|
| 2,70% (maioria com favorito claro) | 12 | −35.508, no mês 11 | −10.826 | 228.825 |
| **3,70% (base)** | 9 | −27.474, no mês 8 | 27.767 | 313.575 |
| 4,18% (maioria equilibrada) | 8 | −25.002, no mês 7 | 46.550 | 354.255 |
| Para comparar: 3% do pote | 11 | −32.509, no mês 12 | 1.025 | 254.250 |

### 3.5 Capital necessário

| Cenário | Ponto mais baixo do caixa | Quando |
|---|---|---|
| Ruim | −116.565 | mês 24, e continua caindo |
| Razoável | −27.474 | mês 8 |
| Otimista | −9.705 | mês 1 |

Esses valores já incluem a abertura da empresa e um mês de devnet. Cada mês a mais de devnet soma 5.500.

**Critério de parada (agora decisão).** Aos 180 dias na rede principal, se o volume do mês for de até 45 mil
dólares, a empresa para ou muda de rumo. Parar no mês 6 limita a perda a 36.348 dólares; seguir até o mês 24 leva
a 116.565.

### 3.6 Números soltos que mudam junto

| Onde | Antes | Agora |
|---|---|---|
| Tesouraria do cenário razoável | 14.625 no mês 12; 63.563 no mês 24 | 18.038; 78.394 |
| Tesouraria do otimista | 73.125; 378.750 | 90.188; 467.125 |
| Tesouraria do ruim em 24 meses | 6.525, 25% de 26.100 | 8.048, 25% de 32.190 |
| "A empresa teria X em Bitcoin e um caixa de Y negativos" (4.6) | 14.625 e 27.009 | 18.038 e 26.892 |
| Caixa do razoável no mês 24, citado na recompra (4.7) | 6.525 | 27.767 |
| Fundo de prêmios do razoável até o mês 24 | 50.528 | 66.055 |
| Aposta nova necessária para recuperar 1 dólar de prêmio em taxa | 33 (1 ÷ 3%) | 27 (1 ÷ 3,70%) |
| O que uma carteira de 200 por mês deixa para a operação em seis meses | 26 (1.200 × 3% × 75% × 95%) | 32 (1.200 × 3,70% × 75% × 95%) |
| Indicação, por indicado que aposta 1.000 em 90 dias | taxa 30; isenção 1,50; quem indicou recebe 5,70 | taxa 37; devolução média 1,85, só depois de 250 apostados; quem indicou recebe 7,40; a casa fica com 27,75 |
| Exemplos de patrocínio que supõem "3% também sobre o prêmio" | — | O prêmio não paga taxa (seção 2.1) |

**Lista de investidores (6.4).** Reescrever como decisão do fundador: "não tem problema, pois são e-mails de
negócios, e não dados pessoais". O convite segue. Fica uma única frase de ressalva, sem tom de pendência: endereço
de email com nome de pessoa pode ser lido como dado pessoal pela LGPD mesmo sendo de trabalho, então o convite leva
opção de descadastro e a lista não é publicada nem compartilhada. O item sai da tabela de pendências.

### 3.7 Capítulos 1 e 7

- **Capítulo 1.** Refazer 1.2 (a taxa), 1.3 (ponto de equilíbrio: 208.630), 1.4 (tabela dos três cenários) e 1.5.
- **Capítulo 7.** As sete decisões foram respondidas. A seção 7.1 vira uma tabela curta "decidido em 5/10/2026".
  O que sobra como ponto aberto, em uma lista curta: a mistura real de perguntas (que define a taxa média), o
  teto da devolução da indicação e a confirmação da data de ida para a rede principal ("provavelmente").
- **Cabeçalho e tabela de concorrentes (3.2).** Onde diz "3% do pote em vigor; forma em aberto", passa a "10% do
  lado perdedor".
- **Devnet.** Onde o texto diz que o MVP "roda inteiro na devnet" sem prazo, dizer: cerca de um mês de devnet, com
  pontuação, e rede principal no início do mês 2.
