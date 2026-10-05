# Onda 2 — Red team técnico e de segurança

Data: 4 de outubro de 2026. Agente 2C, Onda 2 (red team), grupo 1.

Marcações: **FATO** (código do sócio, documentação oficial ou referência de segurança lida por mim nesta sessão),
**FATO SECUNDÁRIO** (pesquisa de outro agente, imprensa, agregador), **INFERÊNCIA** (raciocínio meu, incluindo toda
conta). Os códigos entre colchetes, como [C1] e [P1], apontam para a lista de fontes.

Limite do método: só leitura. Nada foi compilado, testado ou simulado, por regra do ambiente. Todas as contas foram
feitas à mão sobre as regras do briefing e da pesquisa 1H; antes de virarem parâmetro do programa, precisam de uma
simulação em código. A pesquisa 1H pediu essa simulação à Onda 2; ela continua pendente (seção 11).

Severidade: **crítica** (perda de dinheiro de usuário ou resultado errado, explorável no desenho como está),
**alta** (perda provável ou dependência sem saída), **média** (perda limitada, incômodo grave ou custo operacional),
**baixa** (precisa de cuidado, não muda o plano).

## Resumo em dez linhas

1. O maior risco não é um bug, é um tipo de pergunta: aquela em que uma pessoa decide o resultado de graça (renúncia
   de emissão, programa imutável, metadados). Num pote, o dono da chave aposta e escolhe o resultado depois que as
   apostas fecham. Crítico.
2. A fórmula da saída tem um furo: a penalidade volta ao pote, e quem domina o lado vencedor recebe a própria
   penalidade de volta. O "prejuízo certo" do golpe da chance vira lucro (no exemplo, +304 em vez de +60).
3. A retenção de "55% a 63%" do prêmio numa fuga é o melhor caso. Com entradas em momentos diferentes cai para cerca
   de um terço. E o mesmo termo da fórmula tranca o apostador honesto em 80% a 90% quando uma baleia entra contra ele.
4. A saída não deixa o cofre devendo pela conta (devolve sempre menos do que entrou). Deixa por erro de estado: sair
   depois do fato, depois da resolução, ou em pergunta de preço entre o toque e a prova.
5. Resolução: fato cumprido e não provado até o prazo vira NÃO. O serviço agendado é ponto único de falha, e a ideia de
   "resolver na primeira interação" conflita com a trava do `resolve` contra chamada por outro programa.
6. O programa atual não tem nenhuma chave de administrador. O novo terá várias (abrir pergunta, taxa, cofre de taxas,
   aceitar patrocínio), e a chave de atualização pode esvaziar todos os cofres. Sem multisig e compilação verificável,
   o usuário depende de confiança cega em duas pessoas.
7. Patrocinador anônimo, resultado controlável e pote, juntos, formam um caminho para passar dinheiro de uma carteira
   a outra pagando 3%. E o cofre do Cloak tinha cerca de 2.560 USDC: um patrocínio de 5.000 não se esconde ali.
8. Token-2022: nos leitores, recusar por padrão. Na moeda do pote, só USDC clássico fixo no código. Aceitar outro
   token no cofre abre taxa de transferência, delegado permanente e gancho de transferência.
9. Operação: chave paga de acesso à rede colocada no navegador é pública; quem chega pelo SODAX ou pelo Cloak chega
   sem SOL para pagar a rede; o script do X roda na mesma página em que a carteira assina.
10. É um programa novo, sem auditoria, com dinheiro real. Recomendo lançar o pote simples com tetos e ligar a saída
    por pergunta, depois de revisão externa dessa instrução. A lista de cortes está no fim.

## 0. Vocabulário mínimo

- **Programa:** o código que roda na Solana e guarda o dinheiro. Só ele assina a saída de dinheiro dos cofres.
- **Instrução:** uma função do programa (`place_bet` aposta, `exit_position` sai antes, `claim` resgata).
- **Cofre (vault):** conta de USDC que pertence ao programa. Hoje há um por pergunta [C1].
- **Chave de atualização (upgrade authority):** a carteira que pode trocar o código do programa. Quem a tem pode
  publicar um código novo que manda o dinheiro de todos os cofres para si.
- **Multisig:** carteira que só assina quando várias pessoas aprovam (por exemplo, 2 de 3).
- **Trava de tempo (timelock):** espera obrigatória entre aprovar e executar, para o público ver antes.
- **Compilação verificável:** prova pública de que o código que roda na rede é o do repositório [C6].
- **Chamada por outro programa (CPI):** um programa chamando outro dentro da mesma operação.
- **Invariante:** conta que tem de fechar sempre. Aqui: o que o cofre tem é igual ao que o programa deve.
- **Carteiras múltiplas (sybil):** sem KYC, uma pessoa abre quantas carteiras quiser. Toda regra "por carteira" é
  contornável; só regra "por lado" ou "por pergunta" segura.

## 1. Manipulação econômica do pote

### E1. Quem controla o resultado aposta e escolhe depois — CRÍTICA

**O risco.** Quatro dos nove tipos de pergunta prontos são decididos por quem tem uma chave, sem custo: renúncia de
emissão, renúncia de congelamento, programa imutável e metadados imutáveis (FATO [C1] [P1]). No modelo antigo isso era
o produto. Num pote, é uma opção gratuita: o dono da chave pode agir depois que as apostas fecham.

**Como se explora.** No fechamento das apostas o pote está com 3.000 no SIM e 7.000 no NÃO. O dono da chave, por uma
carteira nova, põe 3.000 no SIM antes do fechamento. O pote vira 6.000 a 7.000. Depois do fechamento ele revoga a
chave e chama `resolve`. Recebe 3.000 ÷ 6.000 × 97% × 13.000 = 6.305. Lucro de 3.305, sem risco (INFERÊNCIA, conta
minha). Se o pote estivesse pesado no SIM, ele apostaria no NÃO e simplesmente não agiria. Ele ganha nos dois casos;
quem aposta contra ele está doando. Não há como identificá-lo: não há KYC.

**Correção.** (a) Deixar essa família fora do pote no MVP. (b) Se entrar, só com teto de pote baixo gravado na
pergunta, selo "resultado controlado por uma parte" e sem patrocínio com lado. A pesquisa 1H já propôs selo e teto;
eu acrescento que o selo sozinho não protege ninguém, porque o prejuízo de quem aposta contra é certo.

### E2. Forçar o SIM pagando — ALTA

**O risco.** Nos tipos em que o SIM custa dinheiro (queima, tokens travados, liquidez travada), dá para forçar o SIM
gastando. Vale a pena sempre que a parte do pote do NÃO que o atacante leva for maior que o custo. O NÃO não tem como
ser forçado: a assimetria favorece sempre quem pode agir.

**Como se explora.** Formatura no pump.fun: o sócio mediu a perda mínima de quem completa a curva em 18,66 SOL numa
curva intocada, 2,16 SOL nos últimos 10% e 0,07 SOL no último 1% (FATO [C2]). Uma pergunta aberta com a curva em 95%
e pote de 2.000 USDC no NÃO é dinheiro grátis. Queima: o custo é (oferta atual − meta) × preço do token; se o preço
cai 90%, forçar fica 90% mais barato e o pote continua do mesmo tamanho (INFERÊNCIA).

**Correção.** Campo `max_pot` gravado na criação e conferido em toda aposta, fixado abaixo do custo de forçar medido
naquele dia; a equipe acompanha o custo e, se ele cair, a única saída é fechar as apostas cedo (por isso a pergunta
precisa de um estado "sem novas apostas", seção 4). O teto limita a receita por pergunta; o modelo financeiro (2E)
precisa usar potes com teto, não potes livres.

### E3. Aposta grande para mover a chance e sair

É o "golpe da chance" da pesquisa 1H. Tratado na seção 2 (S1), porque o furo está na fórmula da saída.

### E4. Aposta de última hora — ALTA

**O risco.** No pote não há preço: quem entra no fim, sabendo mais, recebe o mesmo retorno de quem arriscou desde o
começo. A pesquisa 1H mostrou o exemplo (5.000 no lado quase certo rendem 290,91 sem risco e derrubam o retorno dos
antigos de 1,94 para 1,058) [P1]. Três pontos que ela não cobriu:

1. **Prazo em blocos.** O programa mede prazo em blocos (`cutoff_slot`, `deadline_slot`) (FATO [C1]). O tempo do
   bloco varia (235 ms medidos na rede de testes contra 400 nominais, `CLAUDE.md`). "24 horas antes" em blocos pode
   virar 14 horas. Quem acompanha o relógio de blocos sabe a hora real do fechamento melhor que a tela.
2. **Reta final com teto de 25% por lado** (proposta da 1H). O teto é ocupado por quem chegar primeiro. Vira corrida
   de robôs no primeiro bloco depois do marco, e o lado que tinha zero no marco nunca mais recebe aposta (25% de zero
   é zero), o que empurra o pote para "um lado só".
3. **Pergunta de preço.** Entre o preço tocar a meta e alguém publicar a prova, as apostas seguem abertas. Ver R7.

**Correção.** Prazos em data e hora (relógio da rede), não em blocos. No MVP, um fechamento só, pela regra já
decidida (80% da duração, mínimo de 24 horas), e perguntas de no máximo 30 dias; a regra em dois marcos com teto de
crescimento fica para depois, porque acrescenta estado e uma corrida nova. Em pergunta de preço, toda aposta leva um
preço fresco na mesma transação (R7).

### E5. Patrocinador e apostador combinados — ALTA

**O risco, em três formas.**

1. **Passagem de dinheiro.** Carteira A (anônima, vinda do Cloak) põe 5.000 no NÃO de uma pergunta que o dono
   controla. Carteira B, do mesmo dono, é o único SIM, com 50. O dono cumpre a meta. B recebe 97% × 5.050 = 4.898. O
   dinheiro passou de A para B como "ganho de aposta", pagando 3%. Não precisa nem ser patrocinador: bastam duas
   carteiras e uma pergunta de resultado controlável e pouco movimento (INFERÊNCIA). O que as regras dizem sobre
   isso é assunto do agente 2D e de advogado; aqui registro só que o programa permite.
2. **Patrocínio com desconto.** O prêmio neutro é dividido entre os vencedores na proporção da aposta. Um
   patrocinador de 5.000 cuja outra carteira tem 90% do lado vencedor recebe de volta 90% × 97% do que foi ao pote:
   3.055 se o pote fica com 70% do patrocínio, 1.310 se fica com 30% (os dois cenários do ponto em aberto "70/30").
   Ele paga 1.945 ou 3.690 pelas contrapartidas de 5.000 (INFERÊNCIA).
3. **Prêmio neutro colhido por um só.** Numa pergunta nova com prêmio neutro de 1.500 e nenhuma aposta, quem põe
   1 USDC no lado certo e fica sozinho leva 97% de 1.501.

**Correção.** Contrapartidas (selo, destaque, publicação) calculadas só sobre a parte da banca, que não volta.
Patrocínio com lado proibido em pergunta de resultado controlável. Prêmio neutro só liberado quando os dois lados
passam de um mínimo; abaixo disso, volta ao patrocinador (o próprio briefing prevê "devolução do saldo não usado").
A decisão do Lucas é que o anônimo escolhe qualquer das duas formas. Ela é perigosa pelo item 1; a alternativa é a
do briefing (anônimo só com prêmio neutro) ou anônimo só em perguntas que ninguém controla (preço de ativo grande,
foto de época).

### E6. Aposta de patrocinador que sai — ALTA

Se a aposta de patrocinador puder usar a saída, o patrocinador compra destaque na home, infla um lado com dinheiro
que pretende retirar, e sai pagando a penalidade. É o golpe da chance com propaganda paga pela vítima. **Correção:**
posição de patrocinador nasce travada, sem `exit_position`.

### E7. Arredondamento na divisão do pote — MÉDIA

**O risco.** O pagamento é `aposta × distribuível ÷ total do lado vencedor`, em números inteiros (a menor unidade do
USDC é 0,000001). Quatro erros clássicos:

1. **Arredondar a favor de quem recebe.** Se cada resgate arredonda para cima, a soma passa do cofre e o último
   vencedor não consegue sacar. A referência é direta: arredondar para baixo o que o protocolo paga e para cima o que
   o usuário deve (FATO [C4], "Rounding Direction").
2. **Penalidade arredondada para baixo.** Sair com 19 unidades mínimas a 5% dá penalidade de 0,95, que vira zero.
   Hoje não compensa (seriam milhões de transações para sair de 100 USDC), mas é dinheiro saindo sem pedágio.
3. **Calcular sobre o saldo vivo.** Se o resgate usa o saldo atual do cofre ou totais que mudam, o primeiro e o
   último vencedor recebem valores diferentes. Os totais têm de ser fotografados na resolução.
4. **Estouro de número.** `aposta × distribuível` passa de 64 bits com potes grandes; a conta tem de ser em 128 bits
   com conversão conferida (FATO [C4], "Unchecked Type Casts").

**Correção.** Fotografar `distribuível` e `total vencedor` em `resolve`; resgate arredonda para baixo; penalidade e
taxa arredondam para cima; aposta e saída mínimas de 1 USDC (o programa atual já tem `MIN_STAKE` de 1 USDC, FATO
[C1]); a sobra de centavos só é varrida para o cofre de taxas depois que a última posição fecha. Teste de propriedade:
soma dos resgates mais taxa nunca passa do cofre, com milhares de casos aleatórios, como o sócio já faz.

### E8. Pote de um lado só: casos que a regra não define — ALTA

A decisão é "devolve cobrando taxa". Com prêmio neutro e penalidades no pote, sobram casos sem regra, e caso sem
regra em programa é dinheiro preso ou divisão por zero:

| Caso | O que a regra atual diz | O que falta decidir |
|---|---|---|
| Só o lado vencedor tem apostas | Devolve menos 3% | O prêmio neutro e as penalidades vão para esses vencedores? Então não é "devolução": é pote normal sem perdedor |
| Só o lado perdedor tem apostas (ninguém acertou) | Devolve menos 3% | A divisão normal dividiria por zero. Para onde vão prêmio neutro e penalidades: patrocinador, banca ou fundo de prêmios? |
| Ninguém apostou, há prêmio neutro | Nada | Devolver ao patrocinador |
| O lado vencedor ficou vazio porque todos saíram | Nada | Igual à linha 2; quem saiu pagou penalidade e quem ficou do lado errado recebe quase tudo de volta |

A última linha é uma porta: se o único apostador do lado vencedor sair, o lado perdedor inteiro troca perda de 100%
por perda de 3%. Num pote pequeno, basta convencer (ou ser) essa única carteira.

**Correção.** Escrever a tabela inteira antes de programar, com um ramo de código e um teste por linha. Minha
proposta: prêmio neutro sem uso volta ao patrocinador; penalidades sem vencedor vão ao fundo de prêmios; a banca
nunca fica com prêmio de patrocinador, para não ter interesse em pote vazio.

### E9. Vencedor que perde dinheiro — MÉDIA

Com 3% sobre o pote inteiro, o favorito que ganha pode receber menos do que apostou. Pote 900 no SIM e 100 no NÃO;
os 100 saem cedo pagando 11%; sobram 911; 97% disso é 883,70; cada 1 USDC do SIM recebe 0,982. Acertou e perdeu
1,8%. A condição para não perder é `penalidade × perdedores ÷ vencedores ≥ 3,09%` (INFERÊNCIA). Sem saída, o mesmo
acontece quando o lado perdedor é menor que 3,09% do vencedor. A saída torna isso comum.

**Correção.** Não muda a decisão dos 3%: limitar a taxa ao tamanho do prêmio (dinheiro dos perdedores, penalidades e
prêmio neutro), para que quem acerta nunca receba menos do que pôs, exceto no pote de um lado só, onde a decisão do
Lucas é cobrar. A tela precisa mostrar o retorno estimado depois da taxa.

### E10. A equipe como parte informada — MÉDIA

A equipe abre as perguntas, vê os pedidos de patrocínio antes do público e sabe quando uma aposta de 5.000 vai
entrar num lado. Apostar antes disso é ganho certo. O programa não tem como impedir (carteiras múltiplas).
**Correção:** regra pública de que a equipe não aposta, carteiras da equipe publicadas, e pedido de patrocínio
aceito e aplicado na mesma transação, sem intervalo em que só a equipe conhece o valor.

## 2. A saída antecipada

A fórmula da pesquisa 1H [P1]:

```
devolução  = aposta × (1 − penalidade)
penalidade = mínimo(90%, 5% + 20% × tempo + queda)
tempo      = fração já decorrida da janela de saída
queda      = 1 − chance do lado na saída ÷ chance do lado na entrada   (zero se a chance subiu)
```

A decisão do Lucas é ter a saída no MVP, com "uma penalidade pro pote". Não mudo a decisão. Abaixo, como a fórmula
quebra e o que precisa mudar para ela ficar de pé.

### S0. O que a fórmula garante de fato

A devolução é sempre menor que a aposta (penalidade mínima de 5%, máxima de 90%). Logo, pela conta, o cofre nunca
deve mais do que tem (INFERÊNCIA; confere com a 1H). O problema não é a solvência. É para onde a penalidade vai, quem
a fórmula castiga, e em que estados a instrução pode ser chamada.

### S1. A penalidade volta para quem a pagou — CRÍTICA

**O risco.** A penalidade vira prêmio de quem acertar. Se quem saiu é também o dono do lado vencedor (por outra
carteira), ele recebe a própria penalidade de volta, menos a taxa. A 1H concluiu que o golpe da chance dá "prejuízo
certo"; a conta dela supôs que o golpista tinha só um terço do lado vencedor.

**Exemplo** (contas minhas). Pergunta de resultado controlável. Pote: 100 no SIM e 100 no NÃO, de terceiros.

| Passo | SIM | NÃO | Observação |
|---|---|---|---|
| 1. O dono põe 900 de verdade no SIM (carteira A) | 1.000 | 100 | Ele tem 90% do SIM |
| 2. Põe 2.000 "de mentira" no SIM (carteira B) | 3.000 | 100 | A tela mostra SIM com 96,8%; o NÃO paga 30 por 1 |
| 3. Entram 400 no NÃO, atraídos pelo retorno | 3.000 | 500 | |
| 4. B sai com 95% da janela decorrida | 1.000 | 500 | Chance no meio da saída: 80,0%. Queda: 17,3%. Penalidade: 5 + 19 + 17,3 = 41,3%, ou 826,70 |
| 5. O dono cumpre a meta e resolve SIM | | | Pote: 1.000 + 500 + 826,70 = 2.326,70; depois da taxa, 2.256,90 |

A carteira A recebe 90% de 2.256,90 = 2.031,20. O dono gastou 900 mais 826,70 de penalidade: 1.726,70. **Lucro de
304,50.** Sem o golpe, com o pote em 1.000 a 100, o lucro dele seria 60,30. O golpe rendeu 244 a mais, tirados dos
400 que entraram no NÃO. Saindo na metade da janela em vez de no fim, a penalidade cai para 646,70 e o lucro sobe
para 327,40. Se ele for 100% do lado vencedor, recupera 97% da penalidade.

**Correção.** Marcar a penalidade com o lado de quem saiu (`penalty_yes`, `penalty_no`). Ela vai para os vencedores
só se o lado de quem saiu perder. Se o lado de quem saiu ganhar, vai para o fundo de prêmios (que o Lucas já definiu
como destino de 25% da taxa) e abastece outros potes. No exemplo, o lucro de 304,50 vira prejuízo de 417,20. A frase
"penalidade pro pote" continua valendo no caso comum (quem sai é quem ia perder) e vira "pro fundo dos potes" no
caso em que é ataque. Precisa do aval do Lucas, porque muda a letra da decisão. Somar a isto: E1 (sem perguntas de
resultado controlável) e E6 (patrocinador não sai).

### S2. A retenção de "55% a 63%" é o melhor caso — ALTA

**O risco.** A queda é medida contra a chance na entrada de cada um. Quem entrou cedo, quando o lado era pequeno,
tem chance de entrada baixa; se o lado cresceu depois, ele sai pagando só o pedágio e o tempo, mesmo com notícia
ruim. A 1H calculou a fuga com todos entrando na mesma chance.

**Exemplo.** Pote 300 no SIM e 700 no NÃO; os 300 entraram com o SIM em até 30%. Depois entram mais 750 no SIM
(chance 60%). Sai notícia ruim com 30% da janela decorrida. Os 300 primeiros saem: a chance cai de 60% para 51,7%,
ainda acima dos 30% da entrada deles. Queda zero, penalidade de 11%: deixam 33 e levam 267. Se os 750 seguintes
também saem, deixam cerca de 327. **Total retido: cerca de 360 de 1.050, ou 34%**, não 55% a 63%. O NÃO recebe 1,47
por 1 em vez de 2,43 (INFERÊNCIA; usei a chance média de entrada do grupo, a conta por carteira varia).

Consequência de produto: entrar cedo num lado pequeno dá uma opção de saída barata para sempre. A estratégia
dominante é entrar cedo dos dois lados e sair do que piorar. Quem paga é quem fica.

**Correção.** Não há parâmetro que resolva isto sem piorar S3. Mitigações: piso de penalidade maior (10%, não 5%);
a saída fecha junto com as apostas e trava quando o fato acontece; teto de pote. A solução de fundo é a que os
precedentes usam: passar a posição a outra pessoa, sem tocar no pote (fase 2). Em nenhum precedente achado pela 1H o
pote devolve dinheiro a quem sai [P1]; estamos sem referência de mercado.

### S3. A fórmula tranca o apostador honesto — MÉDIA

**O risco.** O mesmo termo de queda sobe quando outra pessoa aposta contra você. Você tem 100 no SIM, entrou a 30%
(pote 300 a 700); sair cedo custaria uns 11% a 22%. Uma baleia põe 2.300 no NÃO. A chance do SIM vai a 9,1%; sua
queda é 1 − 9,1 ÷ 30 = 69,7%; sua penalidade passa de 79,7% e bate no teto de 90% antes do fim da janela. O botão
"Sair" que mostrava perto de 80 passa a mostrar 10 a 20, sem você ter feito nada (INFERÊNCIA).

Para a baleia isso é de graça se ela acredita no próprio lado. O usuário vai ler como armadilha: a saída existe até a
hora em que ele precisa dela.

**Correção.** Dizer na tela, antes da aposta, que a saída pode custar até 90%. Valor mínimo aceito na transação de
saída (S6). Decidir conscientemente: este efeito é o preço da proteção contra a fuga em massa.

### S4. O tempo da fórmula mede o relógio, não a permanência — BAIXA

Uma aposta feita e retirada no começo da janela paga 5% e pouco, tenha ficado uma hora ou uma semana. Serve para
inflar o tamanho do pote na tela por 5%, e para o golpe da chance barato no começo (as vítimas ainda podem sair, mas
muitas não percebem). **Correção:** espera mínima entre apostar e sair medida em horas, não em blocos; piso maior.

### S5. A penalidade depende da ordem e de como se mede a "chance de entrada" — MÉDIA

A 1H mede a chance de entrada depois da própria aposta (95,6% no exemplo dela). Medida antes da aposta, o mesmo
golpista teria entrada de 60% e queda zero. Fatiada em apostas pequenas, a entrada média cai de 95,6% para cerca de
89% e a queda de 27,1% para 21,7%. Na saída acontece o inverso: sair de uma vez é mais barato que em pedaços (69,7%
contra 64,9% de chance média), porque o "ponto médio" superestima (INFERÊNCIA). Não é um furo que esvazie o cofre; é
uma regra que paga diferente pela mesma operação, e isso é terreno de robô.

Há ainda o risco de implementação: guardar a "chance média de entrada" como uma média arredondada. A cada aposta
nova e saída parcial a média é recalculada; se arredonda a favor do usuário, ele a empurra para baixo com muitas
operações pequenas.

**Correção.** Especificar a medida sem ambiguidade (proponho o ponto médio também na entrada). Guardar somas
acumuladas (aposta × chance), não a média. Arredondar a chance de entrada para cima e a de saída para baixo. Teste de
propriedade: fatiar a entrada ou a saída nunca melhora a devolução.

### S6. Corrida e isca-e-troca na saída — MÉDIA

A devolução depende do estado do pote no instante em que a transação entra. Entre o usuário ver "recebe 85" e a
transação entrar, uma aposta contrária pode levar o valor a 15. Quem está do outro lado ganha com isso (S1 não
corrigido) e pode enfiar a aposta na frente de propósito. **Correção:** `exit_position` recebe o valor mínimo aceito
e falha se a conta der menos (FATO [C4], "TOCTOU"); a 1H já previu. `place_bet` recebe a fatia máxima do próprio
lado que o apostador aceita, pelo mesmo motivo.

### S7. A invariante do cofre com a saída — CRÍTICA se errada

A conta que tem de fechar, sempre, depois de cada instrução:

```
saldo contabilizado = pote do SIM + pote do NÃO + prêmio neutro + penalidades do SIM + penalidades do NÃO + taxa devida
saldo real do cofre ≥ saldo contabilizado
```

O saldo real pode ser maior (qualquer um pode mandar USDC ao cofre por fora), nunca menor. O programa do sócio já
contabiliza por campos e não pelo saldo da conta, de propósito (FATO [C1], `CLAUDE.md`); manter.

Onde a invariante quebra, apesar de a fórmula estar certa:

1. **Sair depois da resolução.** Se `exit_position` não conferir que a pergunta está aberta, o perdedor sai com 10%
   a 95% do que pôs depois de perder, e esse dinheiro falta para o último vencedor. Crítico.
2. **Sair depois do fato e antes do `resolve`.** A trava `require_trading_open` lê a conta medida e recusa quando a
   meta já está cumprida (FATO [C1]). A saída tem de chamar a mesma trava, com a mesma conta. Se alguém "simplificar"
   a saída para conferir só a data, o lado perdedor inteiro sai entre o fato e a prova.
3. **Pergunta de preço.** O programa não sabe que o preço tocou a meta até alguém publicar. Nesse intervalo a trava
   não fecha nada. Quem está no NÃO sai pagando o pedágio (R7).
4. **Taxa na saída.** "A banca nunca perde" sugere cobrar 3% também de quem sai (pergunta 2 da 1H ao Lucas). Se for
   cobrado, entra como `taxa devida` na conta acima; se for esquecido na contabilidade, o cofre de taxas saca
   dinheiro dos apostadores.
5. **Saída parcial.** Reduzir a posição e o pote por valores diferentes (um arredondado, outro não) abre um centavo
   por operação. Um só valor, calculado uma vez, usado nos dois lugares.

**Correção.** Função de invariante chamada no fim de toda instrução, que reverte a transação se a conta não fecha
(FATO [C5], "Invariant functions on state"). Estados explícitos da pergunta (`Aberta → Fechada → Resolvida`), não
conferências soltas de data (FATO [C5], "Explicit state machines"). O teste aleatório de invariantes do sócio,
refeito para o modelo novo, com `exit_position` no sorteio.

### S8. Correção conjunta, se a saída ficar no MVP

1. Penalidade marcada por lado (S1). Posição de patrocinador sem saída (E6).
2. Saída fecha no fechamento das apostas, trava com o fato, e fica desligada em pergunta de preço.
3. Valor mínimo aceito; espera mínima em horas; piso de 10%.
4. Parâmetros por pergunta, com limites fixos no código (piso nunca abaixo de X, teto nunca acima de 90%).
5. Chave `exit_enabled` por pergunta: nasce desligada; liga primeiro em perguntas de pote pequeno.
6. Simulação com apostadores estratégicos e revisão externa desta instrução antes de ligar com dinheiro real.

## 3. Resolução

### R1. O serviço agendado como ponto único de falha — ALTA

**O risco.** O `resolve` é aberto a qualquer carteira (FATO [C1]), mas na prática quem vai chamar é o nosso serviço.
Se ele cai, se o fornecedor de acesso à rede cai, ou se a carteira dele fica sem SOL, ninguém chama. A 1H propôs dois
agendadores, botão público e alarme; concordo. Acrescento:

- **O incentivo é torto.** O sócio escreveu que quem tem SIM tem interesse em resolver (FATO [C1]). No pote, quando o
  fato acontece, quem está no NÃO tem interesse em que ninguém perceba até o prazo. Se o lado do SIM for de poucos
  apostadores desatentos, o silêncio rende o pote inteiro ao NÃO.
- **Dois agendadores com o mesmo código têm o mesmo bug.** Um leitor que falha num caso raro falha nos dois.

**Correção.** Recompensa on-chain pequena a quem chamar `resolve` (tirada da taxa), já no MVP: cria interessados que
não dependem de nós. Botão público. Dois agendadores em provedores diferentes, com chaves diferentes. Alarme para
"resolvível e não resolvida há 15 minutos". Plantão definido: quem atende, em que horário.

### R2. Meta cumprida e não provada até o prazo vira NÃO — CRÍTICA

**O risco.** Para os sete tipos irreversíveis, depois do prazo o resultado é NÃO, cumprida a meta ou não (FATO [C1],
`resolve.rs`: "After the deadline the market is NO regardless"). O programa não sabe quando a meta foi cumprida. Meta
cumprida no dia 10, serviço fora do ar até o dia 30: os apostadores do SIM, que acertaram, perdem tudo. É um
resultado errado e definitivo, sem disputa.

**Correção.** Não há como o programa descobrir a data do fato depois. O que dá para fazer: (a) escrever na pergunta
que vale "provado on-chain até a data"; (b) R1 inteiro; (c) o site, ao abrir a página da pergunta, simula o `resolve`
e oferece o botão a qualquer visitante; (d) plano de falha escrito: se a equipe constatar que uma pergunta resolveu
errado por falha nossa, de onde sai a indenização (fundo de prêmios?) e quem decide. O PancakeSwap, quando o
operador falha, cancela a rodada e devolve 100% sem taxa (FATO SECUNDÁRIO [P1]); o nosso desenho não tem esse ramo.

### R3. Corrida no último bloco e bloqueio da conta — MÉDIA

**O risco.** Meta cumprida no último bloco do prazo e `resolve` entrando um bloco depois dá NÃO. Quem tem muito no
NÃO pode atrasar o `resolve` nos blocos finais: qualquer transação pode declarar a conta da pergunta como "de
escrita" e disputar com taxa de prioridade o espaço que a rede dá a cada conta por bloco (INFERÊNCIA; o teto de
processamento por conta por bloco existe, o valor atual não foi conferido). Custa caro e só serve se a meta for
cumprida nos últimos segundos, mas num pote grande pode compensar.

A ordem inversa (resolver antes de a meta ser cumprida) não é problema: dá erro "ainda não dá" e nada muda.

**Correção.** O serviço envia com taxa de prioridade crescente e por mais de um caminho. As perguntas fecham as
apostas pelo menos 24 horas antes, então quem cumpre a meta no último segundo já não pode apostar; o ataque só
protege uma aposta antiga. Aceitar como risco residual e documentar.

### R4. Perguntas de época — ALTA

O stake de validador só dá SIM enquanto a rede estiver naquela época, cerca de dois dias; a foto da pool de staking
vale até a primeira atualização da época seguinte (FATO [C1] [C2]). Um fim de semana com o serviço parado e o SIM
verdadeiro vira NÃO. O tipo de stake de validador não pôde ser testado com SIM fora de uma rede real (FATO,
`CLAUDE.md`) e lê zero em validadores pequenos ou sem a chave nova (FATO [C2]). **Correção:** stake de validador fora
do MVP. Foto de pool de staking só depois de R1 em produção, com uma pergunta de pote pequeno primeiro.

### R5. O `resolve` que rejeita chamada por outro programa — MÉDIA

**O que a trava faz.** O `resolve` falha se for chamado de dentro de outro programa (FATO [C1]). Motivo do sócio:
impedir que alguém embrulhe a resolução numa operação de empréstimo relâmpago.

**O que ela não faz.** Não impede mover o número e resolver na mesma transação, como instruções vizinhas. O sócio
escreve isso: por isso só aceita números que um empréstimo relâmpago não move (FATO [C2]). A segurança real está na
escolha dos tipos de pergunta, não na trava. Todo tipo novo tem de passar por essa prova; formatura no pump.fun não
passa (o sócio a deixou "on hold", FATO [C2]).

**Três consequências para o plano.**

1. Carteiras que são programas (multisig, carteiras embutidas de alguns aplicativos) não conseguem apertar o botão
   "Resolver". Agendadores on-chain como o Tuk Tuk também não (FATO SECUNDÁRIO [P1]).
2. **Conflito com "resolver na primeira interação".** A 1H propôs que a aposta ou o resgate que encontram a meta
   cumprida gravem o resultado ali mesmo. Se `place_bet` puder ser chamado por outro programa (é o que um gancho de
   ponte entre redes faria), a resolução embutida nele fura a trava. Ou todas as instruções rejeitam chamada por
   outro programa, ou a resolução embutida não existe.
3. A trava dá uma falsa sensação de segurança a quem ler o BP. O texto deve dizer o que ela cobre.

**Correção.** Manter o `resolve` como está. Não embutir resolução em outras instruções; o site monta a transação com
o `resolve` na frente da aposta ou do resgate, como instrução separada.

### R6. A conta lida deixa de poder ser lida — ALTA

**O risco.** `place_bet`, `exit_position` e `resolve` leem a conta medida. Ela pertence a programas de terceiros que
podem ser atualizados: a pool de staking tem chave de atualização (FATO [C2]); o programa do pump.fun é fechado,
atualizável e foi republicado horas antes da leitura do sócio (FATO [C2]). Se o formato muda, o leitor dá erro: as
apostas e as saídas param, e depois do prazo o resultado vira NÃO. Um terceiro, sem querer, decide a pergunta. Com
Token-2022, um token com autoridade de fechar o registro pode fechá-lo e recriá-lo no mesmo endereço (FATO [C4]).

**Correção.** Terceiro resultado, `Anulada`: se depois do prazo a conta não puder ser lida, devolve as apostas (com
a taxa, pela regra da banca). Recusar na criação tokens com autoridade de fechar o registro, senão quem está
perdendo fecha a conta para ser devolvido. Conferir dono e formato em toda leitura, como o sócio já faz (FATO [C1];
[C4], "Transient Account Owner Spoofing").

### R7. Perguntas de preço por oráculo (Pyth) — ALTA

O que é: a Pyth publica preços assinados por corretoras; qualquer pessoa leva um preço assinado para dentro da rede
e o programa confere a assinatura. O preço só existe na rede quando alguém o publica [P1].

| Risco | Como se explora | Correção |
|---|---|---|
| Apostar entre o toque e a prova | O SOL toca a meta às 14:00:00. O atacante vê fora da rede, aposta no SIM às 14:00:05 e só depois publica a prova. Ganho sem risco, à custa de quem já estava no SIM | Toda aposta em pergunta de preço traz, na mesma transação, um preço com no máximo N segundos; se o preço já bate a meta, a aposta falha. Sobra uma janela de N segundos |
| Sair entre o toque e a prova | Quem está no NÃO sai pagando o pedágio depois do toque | Saída desligada em pergunta de preço, ou a mesma exigência de preço fresco |
| Escolher o pior instante | Em pergunta de "toque", vale qualquer preço assinado dentro do prazo. Um tique isolado e errado de uma fonte resolve a pergunta para sempre | Exigir preço menos a margem de erro acima da meta; recusar preço com margem de erro maior que X% do preço |
| Preço desatualizado | Publicar um preço antigo como se fosse atual | Conferir o horário do preço contra a abertura e o prazo da pergunta; idade máxima nas apostas |
| Conta de preço falsa | Passar uma conta com formato parecido | Conferir que a conta pertence ao programa receptor da Pyth, o identificador do preço gravado na criação e o nível de verificação completo |
| Pergunta de "fechamento" (preço no dia D ao meio-dia) | Quem resolve escolhe qual preço da janela publicar | Fora do MVP |
| O preço deixa de existir | A Pyth remove o preço de uma memecoin; o SIM não pode mais ser provado; vira NÃO | Só ativos grandes no MVP; resultado `Anulada` (R6) |
| Dependência atualizável | O receptor da Pyth e a ponte que ele usa podem ser atualizados pelos donos | Aceitar e escrever no plano; ler, nunca dar permissão de escrita ([C4], "Upgradeable Dependency Risk") |
| Token pequeno | O caso Mango: o preço do oráculo foi de 0,04 para 0,54 em 30 minutos [P1] | Fora do MVP |

Um ponto a favor: preço de SOL e BTC é a única família em que ninguém controla o resultado. Do ponto de vista de
manipulação, é mais segura que as perguntas de chave (E1). Detalhes da API da Pyth acima vêm da 1H e do meu
conhecimento; não li a documentação da Pyth nesta sessão.

### R8. O texto da pergunta mora fora da rede — MÉDIA

O programa guarda tipo, conta, meta e prazo (FATO [C1]); a frase que o usuário lê fica no site. A frase pode dizer
uma coisa e os parâmetros outra (casas decimais da meta, conta errada), por erro ou por má-fé de quem tem acesso ao
site. **Correção:** o site gera a frase a partir dos parâmetros on-chain, por modelo fixo por tipo; o texto do
patrocinador fica separado e marcado; a pergunta guarda o resumo criptográfico (hash) do texto publicado.

### R9. Aviso externo sem conferência — MÉDIA

Se o serviço for acordado por avisos de um fornecedor (webhook), qualquer pessoa que descubra o endereço pode
dispará-lo e fazer o serviço gastar SOL e cota. A regra do projeto é validar a assinatura do aviso (FATO [R1]).
**Correção:** conferir o segredo do aviso, reler o estado na rede antes de enviar qualquer coisa, limitar a taxa.

## 4. Chaves e poderes da equipe

**Ponto de partida.** O programa atual não tem nenhuma chave de administrador: qualquer um cria mercado, não há
taxa, não há cofre de taxas, não há pausa (FATO [C1], busca no código). Tudo o que segue é superfície nova.

### K1. A chave de atualização do programa — CRÍTICA

**O risco.** Todos os cofres são assinados pelo programa. Quem troca o código do programa saca todos. Hoje os scripts
usam uma carteira em arquivo no computador (`~/.config/solana/pred-provable-devnet.json`, `CLAUDE.md`). Se a mainnet
seguir o mesmo padrão, o dinheiro de todos os usuários depende de um arquivo num notebook. Quem tem essa chave hoje:
não encontrado; perguntar ao Ronaldo.

**Correção.** Chave de atualização num multisig de 2 de 3, com chaves em dispositivos físicos e trava de tempo. A
referência recomenda maioria simples e desaconselha 1 de N e N de N (FATO [C5]). Compilação verificável publicada:
`solana-verify build`, `verify-from-repo` e o trabalho remoto que confere o código (FATO [C6]); o próprio README
avisa que isso não substitui revisão e recomenda governança sobre as atualizações (FATO [C6]). Programa imutável
agora não: sem auditoria, travar o código é travar os bugs. A promessa honesta é "atualizável por multisig, com
espera pública, até a auditoria". Duas pessoas não fazem um 2 de 3: é preciso decidir quem é a terceira chave.

### K2. Quem inicializa a configuração — ALTA

A conta de configuração (lista da equipe, taxa, destino das taxas) é criada uma vez. Se a instrução de criação não
conferir quem chama, o primeiro a chamá-la depois da publicação vira administrador (FATO [C4], "Frontrunning ...
initialization"). **Correção:** só a chave de atualização do programa pode inicializar, conferida contra os dados do
programa na rede; publicar e inicializar na mesma transação.

### K3. Quem pode abrir pergunta — ALTA

Uma chave de "abrir pergunta" roubada cria perguntas com cara de oficial sobre uma conta que o ladrão controla (E1)
e colhe as apostas. **Correção:** papel separado da chave de atualização; toda pergunta em dois passos (uma chave
propõe, outra aprova), não só as de prazo curto; teto de pote obrigatório; pausa que impede apostas novas.

### K4. Quem muda a taxa — MÉDIA

Sem limite no código, quem tem a chave põe a taxa em 100% e leva o pote (FATO [C4], "Hidden Backdoors": "hard-coded
caps admin can't exceed"). **Correção:** teto constante no código (por exemplo, 5%); a taxa de cada pergunta é
copiada na criação e não muda depois; mudança da taxa padrão só por multisig com trava de tempo.

### K5. Quem move o cofre de taxas — ALTA

A divisão decidida (25% tesouraria em BTC, 25% operação, 25% recompra e queima, 25% fundo de prêmios) não deve virar
código no programa: trocar USDC por BTC ou recomprar token dentro do programa traz bolsas de terceiros, preço
manipulável e mais contas por transação. **Correção:** a taxa fica contabilizada em cada pergunta; uma instrução
aberta a qualquer um a envia para uma única conta de destino, gravada na configuração e pertencente ao multisig. A
divisão em quatro é feita fora do programa, pelo multisig, com registro público. Trocar o destino exige trava de
tempo. Nenhuma instrução de administrador toca o dinheiro dos apostadores.

### K6. Pausa e "saque de emergência" — ALTA

A referência pede um estado geral de operação (normal, parado, só saques) desde o primeiro dia (FATO [C5]). Sem
pausa, um bug descoberto fica aberto até a atualização passar pela trava de tempo. Com pausa mal desenhada, a equipe
congela o dinheiro dos usuários. **Correção:** três níveis: normal; sem apostas novas; sem apostas nem saídas. O
resgate, a devolução e o `resolve` nunca pausam. Nenhuma instrução de "saque de emergência" pela equipe: é a porta
dos fundos que a referência manda auditar (FATO [C4]).

### K7. Dupla confirmação de fachada — MÉDIA

O prazo menor que 24 horas exige duas chaves diferentes (decisão do Lucas, desenho da 1H). Se as duas chaves estão
no mesmo computador ou com a mesma pessoa, a regra não protege nada, e o registro on-chain mostra duas chaves
diferentes como se protegesse. **Correção:** as duas assinaturas vêm do multisig, com pessoas diferentes.

### K8. Chave do serviço agendado — BAIXA hoje, ALTA se crescer

A chave do serviço não tem poder: o `resolve` é aberto e o resultado sai do dado on-chain [P1]. O risco é o serviço
ganhar funções "já que ele existe": aprovar patrocínio, abrir pergunta, mover taxa. Aí vira uma chave de
administrador ligada à internet. **Correção:** o serviço só chama instruções abertas a qualquer um; pouco SOL na
carteira; chaves em variáveis de ambiente, nunca no repositório (FATO [R1]).

### Quadro proposto de poderes

| Poder | Quem | Limite no código |
|---|---|---|
| Atualizar o programa | Multisig 2 de 3 com trava de tempo | Compilação verificável a cada versão |
| Abrir pergunta | Uma chave da equipe propõe, outra aprova | Teto de pote obrigatório; tipos permitidos |
| Mudar taxa padrão | Multisig com trava de tempo | Teto constante; não afeta pergunta aberta |
| Enviar taxas ao destino | Qualquer um | Só para a conta gravada na configuração |
| Trocar o destino das taxas | Multisig com trava de tempo | — |
| Aceitar ou recusar patrocínio | Uma chave da equipe | Aceite aplica o dinheiro na mesma transação; recusa só libera o saque pelo patrocinador |
| Pausar | Uma chave da equipe (rápido) | Nunca bloqueia resgate, devolução e `resolve` |
| Despausar | Multisig | — |
| Resolver | Qualquer um | — |

## 5. Contas e dinheiro

### C1. Cofre por pergunta — manter

Um cofre por pergunta isola o risco: um erro ou um bloqueio atinge uma pergunta, não todas (FATO [C5], "Multi-vault").
O cofre é uma conta do programa em endereço derivado, não uma conta associada, para ninguém criá-la antes e travar a
abertura (FATO [C1]). Manter os dois.

### C2. Registro por apostador: quem paga o aluguel — MÉDIA

Cada posição é uma conta nova, e toda conta na Solana exige um depósito de aluguel, devolvido quando ela fecha. Para
um registro de cerca de 120 bytes, cerca de 0,0017 SOL (conta minha: (128 + bytes) × 6.960 lamports, taxa deduzida
dos 0,00203928 SOL da conta de token de 165 bytes citados em [C4]).

- Quem paga é o apostador. Para uma aposta de 1 USDC, o depósito é uma fração relevante. Dizer na tela.
- Quem chega só com USDC (pelo SODAX, pelo Cloak) não tem SOL para o depósito nem para a taxa da rede (P2, P3).
- Ao fechar, o depósito volta para quem pagou, não para quem chamou a instrução.
- Posição perdedora nunca resgatada nunca fecha: o depósito do usuário fica parado. Oferecer um botão "fechar
  posições encerradas".
- Criar a posição "se não existir" na própria aposta é prático e perigoso: é o padrão que a referência liga a
  ataques de reinicialização (FATO [C4]). Conferir tipo, dono e pergunta em toda instrução.
- Dois usuários: o teste mínimo da regra do projeto é o usuário A tentar resgatar ou sair com a posição do B (FATO
  [R1]). A posição tem endereço derivado de pergunta mais carteira, e a carteira tem de assinar.

### C3. Para onde vai o pagamento — MÉDIA

A regra do sócio: a instrução de uma parte não pode depender da conta de token de outra, porque o dono de uma conta
associada pode reatribuí-la (FATO, `CLAUDE.md`). **Correção:** o resgate, a saída e a devolução de patrocínio são
sempre puxados por quem recebe, que assina e indica a própria conta de USDC. Nada de a equipe ou o serviço "empurrar"
pagamento para a conta de alguém. A recompensa de quem resolve vai para a conta que o próprio chamador indica.

### C4. Contas que nunca fecham e sobras — BAIXA

Se um vencedor nunca resgata, o cofre daquela pergunta nunca fecha. O custo é o aluguel de duas contas (uns
0,005 SOL por pergunta, conta minha). **Correção:** não criar prazo de resgate nem varredura de valores não
resgatados no MVP; seria um poder da equipe sobre dinheiro de usuário. Varrer só a sobra de arredondamento, e só
quando o contador de posições abertas da pergunta chega a zero.

### C5. Conta quente — MÉDIA

Toda transação que escreve numa mesma conta entra em fila (FATO [C5]). Se cada resgate transferir a taxa para um
cofre de taxas único, todas as perguntas disputam essa conta. **Correção:** a taxa fica contabilizada no cofre da
pergunta e é enviada depois (K5). A configuração é só lida nas apostas.

### C6. Limites de contas e de computação — BAIXA

Limites da rede: 64 contas travadas por transação, 1,4 milhão de unidades de computação, profundidade de 4 chamadas
entre programas (FATO [C5]). Uma aposta usa cerca de dez contas (carteira, pergunta, posição, cofre, conta de USDC
do usuário, registro do USDC, conta medida, configuração e dois programas do sistema); com preço da Pyth, mais uma.
Cabe com folga. O que não foi medido: o custo de percorrer as extensões de um token Token-2022 dentro de cada aposta
(o sócio marca como não verificado, FATO [C2]). **Correção:** medir antes de prometer o tipo de pergunta.

### C7. O USDC pode ser congelado — MÉDIA

O emissor do USDC pode congelar contas de token (INFERÊNCIA: é o que a autoridade de congelamento do registro
permite; não li a conta do registro do USDC nesta sessão, conferir). Se o cofre de uma pergunta receber dinheiro que o
emissor decida bloquear, o pote daquela pergunta inteira para. Receber de carteiras vindas de um serviço de
privacidade aumenta essa exposição. **Correção:** cofre por pergunta (o bloqueio não se espalha); cofre de taxas
esvaziado com frequência; risco escrito nos termos; ponto para o agente 2D.

### C8. Pedido de pergunta com depósito travado — ALTA

| Risco | Como acontece | Correção |
|---|---|---|
| Dinheiro preso para sempre | Só a equipe pode aceitar ou recusar; a chave some ou a equipe some | O patrocinador pode cancelar sozinho depois de um prazo (por exemplo, 14 dias) |
| Equipe aceita e não abre a pergunta | Aceite e abertura em transações separadas | Aceite cria a pergunta e aplica o dinheiro na mesma transação, ou não acontece |
| Pergunta aberta diferente da pedida | O pedido não amarra os parâmetros | O pedido guarda o resumo criptográfico dos parâmetros; o aceite confere |
| Devolução para a conta errada | A equipe "empurra" a devolução | A recusa só muda o estado; o patrocinador saca (C3) |
| Texto malicioso | O texto do patrocinador vai para a página | Texto fora da rede, revisado, exibido como texto puro, sem links ativos |
| Depósito em dois passos | 70/30 entre banca e pote aplicado de forma ambígua | Fixar a divisão no código depois que o Lucas decidir qual parte é de quem |

O programa `escrow` da Solana Foundation serve de molde, como o briefing já aponta [D2].

### C9. Dinheiro mandado direto ao cofre — BAIXA

USDC enviado ao cofre por fora de uma instrução não vira aposta nem prêmio (FATO [C4], "Donation Attacks"; o sócio já
contabiliza por campos). Isso importa para P1 e P3: quem mandar patrocínio ou depósito de outra rede direto para o
endereço do cofre perde o dinheiro. A tela nunca deve mostrar o endereço do cofre como destino de pagamento.

## 6. Token-2022

O que é: o segundo programa de tokens da Solana, com "extensões" (funções extras no próprio token). Não é uma versão
nova do clássico: é outro programa, com outras regras (FATO [C4]). Aparece em dois lugares diferentes do plano, e os
riscos são diferentes.

### TK1. Nos leitores (o token sobre o qual se pergunta) — ALTA

Hoje os leitores só aceitam o programa clássico e registros de exatamente 82 bytes; um token novo é recusado, sem
leitura errada (FATO [C1] [C2]). Os tokens novos do pump.fun são Token-2022 (FATO SECUNDÁRIO [D2]). O que muda ao
aceitar:

| Extensão | O que permite | Efeito numa pergunta |
|---|---|---|
| Delegado permanente | Uma chave move ou queima o saldo de qualquer carteira | "A oferta cai para X?" passa a ser decidida de graça por essa chave: volta a ser E1 |
| Autoridade de fechar o registro | Fechar o token e recriá-lo no mesmo endereço | Oferta zerada, ou conta ilegível (R6) |
| Emissão e queima confidenciais | Esconde a oferta | O número lido não é a oferta real |
| Taxa de transferência | Retém parte de cada envio | Não altera a oferta; o contador de taxas retidas não é um número que só cresce (FATO [C2]) |
| Metadados no próprio token | Nome e imagem dentro do registro | Só vale o que o ponteiro do registro indica; outra conta é falsificável (FATO [C4]) |

**Correção.** A do sócio: percorrer a lista de extensões e recusar por padrão qualquer uma perigosa ou desconhecida
(FATO [C2]). Acrescento: lista positiva (só as extensões conhecidas e inofensivas passam), conferida na criação e em
toda leitura; meta em unidades brutas, não nas unidades de exibição; medir o custo de computação antes. Como os
tokens do pump.fun já nascem com as autoridades revogadas, as perguntas de renúncia perdem o sentido neles; sobra a
queima [P1].

### TK2. Na moeda do pote (se um dia o cofre aceitar outro token) — CRÍTICA se acontecer

Hoje a moeda é o USDC clássico, com o endereço fixo no código (FATO [C1]). A trilha 3 (o token alimentando os potes)
e o token do pump.fun, que é Token-2022, vão puxar a ideia de "pote no nosso token". O que cada extensão faz a um
cofre (FATO [C4]):

- **Taxa de transferência:** o cofre recebe menos do que anota. Anota 100, recebe 98, deve 100. O último a resgatar
  não recebe.
- **Delegado permanente:** uma chave de fora esvazia o cofre. A referência diz: não é falha, é função.
- **Gancho de transferência:** um programa do emissor roda em cada envio. Pode barrar os resgates ou exigir contas
  que a nossa instrução não leva.
- **Pausa e congelamento, estado inicial congelado, token intransferível:** resgates param por decisão de terceiro.

**Correção.** Manter o USDC fixo no código e o programa clássico de tokens nas instruções de dinheiro. O token da
plataforma entra no pote só depois de trocado por USDC fora do programa. Se um segundo token for aceito, por
endereço específico, revisado, com contabilidade pela diferença de saldo; nunca "qualquer token".

### TK3. Desconto de taxa por saldo do token — MÉDIA

O briefing propõe desconto na taxa para quem segura o token [D2]. Lido no instante da aposta ou do resgate, o saldo
pode ser emprestado por uma transação e devolvido. **Correção:** fora do MVP; se entrar, por tokens travados durante
um período, não por saldo instantâneo.

## 7. Privacidade e entrada de outras redes

### P1. Cloak: o que acrescenta — ALTA

Fatos da pesquisa do projeto e do sócio:

- Só existe na mainnet; não há rede de testes (FATO SECUNDÁRIO [P2] [C3]). Toda integração é testada com dinheiro
  real.
- O operador vê remetente, destinatário, endereço de internet, valores e a chave de visualização, e pode recusar um
  depósito ou uma saída (FATO SECUNDÁRIO [C3]).
- O cofre de USDC tinha 2.562,72 USDC, cerca de 3.048 notas e cerca de 50 operações por dia; depósito e saque na
  mesma hora são ligáveis com facilidade (FATO SECUNDÁRIO [C3]).
- O relatório de auditoria não foi publicado; a atualização do programa é por multisig 3 de 4 com 1 hora de espera
  (FATO SECUNDÁRIO [P2]).
- O pacote no navegador pesa 2,14 MB comprimido, mais 3,2 MB e 19,7 MB de arquivos de prova (FATO SECUNDÁRIO [C3]).

**Riscos.**

1. **A promessa não se sustenta.** Um patrocínio de 5.000 é quase o dobro do cofre inteiro do Cloak; o de 1.500 é
   mais da metade; o de 500, um quinto. Entra um valor único e sai o mesmo valor: o conjunto em que ele se esconde é
   de um. Chamar isso de "anônimo" na tela é prometer o que não entregamos.
2. **Superfície no nosso site.** Um pacote de terceiro, jovem, sem auditoria publicada, rodando na página em que a
   carteira assina. Uma versão comprometida do pacote pede assinaturas maliciosas.
3. **Dependência.** Se o operador recusar a saída, o patrocinador fica com o dinheiro preso lá e reclama conosco.
4. **Integridade.** O anônimo que controla o resultado (E1, E5).

**Correção.** Não integrar o pacote do Cloak no nosso site. O patrocinador que quiser privacidade usa o aplicativo
do Cloak por conta própria e chega com uma carteira nova; o nosso programa não vê diferença (o `PRIVACY_PLAN.md` do
sócio já conclui que não é preciso mudar o programa, FATO [C3]). Isso reduz a superfície a zero. Na tela, "pagador
não divulgado", não "anônimo". Selo visível. O que as regras dizem sobre aceitar esse dinheiro é do agente 2D.

### P2. A carteira descartável chega sem SOL — MÉDIA

A carteira nova recebe USDC do Cloak (o serviço cria a conta de USDC do destinatário, FATO SECUNDÁRIO [C3]), mas
precisa de SOL para pagar a taxa da rede e o depósito de aluguel. Se o patrocinador mandar SOL da carteira
principal, ligou as duas carteiras em público e desfez a privacidade. **Correção:** instruir a sacar SOL pelo
próprio Cloak (ele opera com SOL, [P2]); não oferecer "nós pagamos a taxa" no MVP, porque isso cria um serviço nosso
que vê quem é quem e gasta dinheiro a pedido de qualquer um.

### P3. SODAX: o que acrescenta — MÉDIA

Fatos [P2]: protocolo de intenções entre redes, com centro na rede Sonic; só mainnet, sem rede de testes; entrega
USDC na carteira do destinatário em Solana; taxa de 0,1%; widget em iframe; as mensagens do widget são de "melhor
esforço"; não foi encontrada chamada de instrução no destino; há oito relatórios de auditoria listados, não lidos.

**Riscos.** (1) O usuário chega com USDC e sem SOL, e não consegue apostar (C2). (2) Um iframe de terceiro dentro do
nosso site pede assinaturas que não controlamos; se o domínio dele for comprometido, o golpe acontece com a nossa
marca em volta. (3) Entrega para o endereço do cofre é dinheiro perdido (C9). (4) O token entregue tem de ser o USDC
da Circle, não uma versão embrulhada. (5) Falha no meio do caminho vira atendimento nosso. (6) Se um dia o gancho de
ponte chamar `place_bet` direto, vale R5.

**Correção.** No MVP, página separada "Trazer dinheiro de outra rede", com o destino travado na carteira do usuário
e no USDC oficial, fora do fluxo de aposta; nada no nosso sistema confia em mensagem do widget; aviso de que é
preciso ter SOL. Ou só um link para o SODAX. O público web3 de Solana já tem USDC ou troca na própria carteira.

## 8. Front-end e operação

### F1. Acesso à rede (RPC) — ALTA

O site lê a rede pelo endereço em `NEXT_PUBLIC_RPC_URL`, que vai para o navegador (FATO [C7]). O histórico de cada
pergunta é montado no navegador com `getSignaturesForAddress` e a leitura de cada transação, sem indexador (FATO
[C7], `CLAUDE.md`). Dois problemas:

1. **O endereço público tem limite por visitante** (números não conferidos nesta sessão). Uma home com dezenas de
   perguntas, cada uma buscando histórico, estoura o limite e a página fica em branco no dia do lançamento.
2. **Uma chave paga dentro de `NEXT_PUBLIC_` é pública.** Qualquer um copia e gasta a cota. A regra do projeto:
   chave de serviço só no servidor (FATO [R1]).

**Correção.** Rota no nosso servidor que repassa só os métodos necessários, com limite por visitante e memória
curta (cache); ou chave restrita por domínio, se o fornecedor oferecer. Um serviço pequeno que guarda o histórico e
as posições, em vez de cada navegador varrer a rede. É um componente novo: entra no escopo e no custo.

### F2. Página que mostra chances que mudam — MÉDIA

A chance e o retorno mudam a cada aposta alheia e só ficam definidos no fechamento [D2]. O usuário assina vendo
"paga 3,2" e a transação entra com "paga 1,4". **Correção:** limites na própria transação (S6); texto "estimativa"
em todo número; simulação antes de assinar; atualização ao vivo. E toda decisão de dinheiro lê a conta da pergunta,
nunca os registros de eventos, que podem ser truncados ou forjados (FATO [C4], "Log Injection").

### F3. O robô que lê o X — MÉDIA

| Risco | Correção |
|---|---|
| Conta de leitura cara: cada publicação lida custa 0,005 dólar [P2]; alguém inunda a hashtag | Orçamento mensal fixo; parar ao atingir |
| Conteúdo de terceiros na nossa página: golpes, links, ofensas | Mostrar só lista curada pela equipe; nunca exibir menção automática |
| Sugestão virar pergunta sem revisão humana | Nunca. A abertura é manual e em dois passos (K3) |
| Se um modelo de linguagem triar as sugestões: texto da publicação com instruções escondidas | Tratar todo texto como dado, nunca como comando (FATO [C4]) |
| Nomes de usuário guardados são dado pessoal | Responder as nove perguntas da regra de privacidade antes do merge (FATO [R2]) |
| Script do X carregado na mesma página da carteira | Página separada ou iframe isolado; sem script de terceiro onde se assina |
| Perfis falsos anunciando perguntas falsas | Endereço do programa e domínio oficiais publicados e fixos |

### F4. O site como elo mais fraco — ALTA

O programa pode estar certo e o usuário perder tudo assinando uma transação maliciosa servida pelo nosso domínio:
conta do provedor de hospedagem, do registro do domínio ou do GitHub tomada, ou um pacote de terceiro comprometido.
O projeto já viu a fragilidade da cadeia de pacotes (`@solana/kit` 8.4.0 saiu com subpacotes não publicados, FATO,
`CLAUDE.md`). **Correção:** segundo fator com chave física em domínio, hospedagem e GitHub; proteção de ramo;
versões travadas; política de conteúdo que proíbe scripts de fora; nenhum script de terceiro na página de aposta.

### F5. Chaves e segredos do serviço — MÉDIA

Segredos: chave do serviço agendado, chave do RPC, chave da API do X, segredo dos avisos. **Correção:** variáveis de
ambiente; `.env.example` só com exemplos; varredura de segredos antes de cada versão (FATO [R1]); para cada chave,
anotar onde vive e como trocar. O gancho que bloqueia commit com credencial já existe (`CLAUDE.md`).

### F6. Sem plano de incidente — MÉDIA

A referência pede contatos, responsabilidades, pausa ligada ao estado do programa e mensagens prontas (FATO [C5]).
Hoje não há. **Correção:** uma página, antes da mainnet: quem pausa, quem fala, onde se publica, em quanto tempo.

## 9. Tamanho do MVP

### M1. Reescrever a parte econômica, com saída, sem auditoria — CRÍTICA

**O que é de fato.** Não é uma mudança: é um programa novo. Do atual ficam os leitores e o `resolve`. Saem sete
instruções e sete campos; entram `place_bet`, `exit_position`, `claim`, devolução, taxa, cofre de taxas, pedido de
patrocínio, configuração, papéis da equipe, pausa, teto de pote, prazos em data e hora [D2] [P1]. O briefing
reconhece que boa parte dos 138 testes deixa de valer [D2]. O programa atual é declarado no próprio repositório
como protótipo de hackathon, na rede de testes e sem auditoria (`CLAUDE.md`).

**Por que a saída é a peça mais perigosa.** É a única instrução que tira dinheiro do cofre antes da resolução. Não
tem precedente de mercado [P1]. A fórmula depende da ordem das operações e de um histórico por apostador. Nesta
revisão, feita só no papel, apareceram um furo crítico (S1) e cinco outros (S2 a S6). Uma revisão com código vai
achar mais.

**É realista?** Construir, sim. Pôr em mainnet com dinheiro real, sem KYC, sem revisão externa e com a saída ligada,
não. O custo de uma auditoria não foi pesquisado; orçar.

**Correção: lançar em degraus.**

1. **Degrau 1:** pote simples (apostar, resolver, resgatar, devolver), perguntas da equipe, um fechamento, teto de
   pote por pergunta e teto total do programa, multisig, compilação verificável, pausa. Preço de SOL e BTC pela Pyth
   e foto de pool de staking como cardápio.
2. **Degrau 2:** saída ligada por pergunta (`exit_enabled`), depois de simulação e de revisão externa dessa
   instrução; pedido de patrocínio com depósito travado.
3. **Degrau 3:** leitores Token-2022, tetos maiores, entrada de outras redes dentro do site.

A decisão do Lucas é "saída agora no MVP". Ela cabe no desenho acima se o código da saída for escrito e testado no
MVP e ligado pergunta a pergunta. O que eu não faria é ligá-la em todas as perguntas no primeiro dia.

## 10. O que isto muda no plano (INFERÊNCIA)

1. **O cardápio do primeiro dia muda de critério.** A pergunta deixa de ser "qual leitor está pronto" e passa a ser
   "alguém decide este resultado de graça?". Quatro dos nove leitores prontos ficam fora do pote.
2. **Toda pergunta tem teto de pote.** A receita por pergunta fica limitada; o modelo financeiro deve usar tetos.
3. **A saída precisa de uma mudança de regra** (penalidade marcada por lado) que altera a letra de "penalidade pro
   pote". Precisa do aval do Lucas.
4. **A frase "prejuízo certo" da pesquisa 1H sobre o golpe da chance não vale** para quem domina o lado vencedor. O
   BP não deve repeti-la.
5. **"55% a 63%" do prêmio preservado é o melhor caso**, não o esperado.
6. **O programa ganha um administrador.** O BP deve dizer quem pode o quê (quadro da seção 4) e deixar de sugerir
   que "ninguém controla": a equipe abre perguntas, pausa e atualiza o código.
7. **Entram três resultados, não dois:** SIM, NÃO e Anulada.
8. **A arquitetura ganha servidor:** dois agendadores, repasse de RPC, histórico guardado, alarme, plantão. O custo
   de operação do modelo financeiro deve incluir isso.
9. **"Anônimo" sai do texto público.** Com o Cloak do tamanho que tem, o correto é "pagador não divulgado".
10. **Cloak e SODAX deixam de ser integração e viram orientação** no MVP.
11. **A tabela do pote de um lado só precisa ser decidida inteira** (seção E8), incluindo o destino do prêmio neutro.
12. **A terceira chave do multisig e o dono da chave de atualização** são decisões de fundador, hoje sem dono.

## 11. Perguntas em aberto

Para o Lucas:

1. Aceita que a penalidade de quem sai vá ao fundo de prêmios quando o lado de quem saiu ganha (S1)?
2. Aceita a saída escrita no MVP e ligada pergunta a pergunta, começando por potes pequenos (M1)?
3. Perguntas de resultado decidido por uma chave: ficam fora do pote, ou entram com teto baixo e selo (E1)?
4. Patrocinador anônimo em pergunta de resultado controlável: mantém, sabendo do caminho descrito em E5?
5. No pote de um lado só, para onde vão o prêmio neutro e as penalidades (E8)?
6. A taxa pode ser limitada ao tamanho do prêmio, para quem acerta nunca receber menos do que pôs (E9)?
7. Se uma pergunta resolver errado por falha do nosso serviço, a empresa indeniza? Com que dinheiro (R2)?
8. Quem são as três chaves do multisig (K1)?

Para o Ronaldo:

9. Quem tem hoje a chave de atualização do programa na rede de testes, e qual o plano para a mainnet?
10. Programa novo ao lado do atual, ou versão 2? (A reescrita é quase total; sugiro programa novo.)
11. Há objeção a um resultado `Anulada` quando a conta medida fica ilegível depois do prazo?
12. Quanto custa, em computação, percorrer as extensões do Token-2022 a cada aposta?
13. Preço pela Pyth: aceita exigir preço fresco em toda aposta de pergunta de preço?

Não confirmado nesta sessão:

14. Limites do endereço público de RPC; teto de computação por conta por bloco; autoridade de congelamento do USDC;
    detalhes da API da Pyth; custo de auditoria; se o Cloak e o SODAX entregam a endereços de programa.
15. A simulação da fórmula com apostadores estratégicos (pedida pela 1H): não feita, por regra do ambiente.

## 12. Fontes

Decisões e pesquisas do projeto:

- [D1] `docs/business/ideacao-perguntas-e-respostas.md` (decisões do Lucas; fonte da verdade).
- [D2] `docs/business/BRIEFING-MERCADO-DE-POTE.md`.
- [P1] `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md` (agente 1H; fórmula da saída, fechamento,
  agendador, Pyth, tipos de pergunta).
- [P2] `knowledge-base/tecnologia/privacidade-entre-redes-e-x.md` (Cloak, SODAX, X).

Código e documentos do sócio (lidos com `git show upstream/main:...`):

- [C1] `programs/pred-provable/src/resolver.rs`, `state.rs`, `constants.rs`, `instructions/resolve.rs`,
  `instructions/create_market.rs`; lista de arquivos e busca por chaves de administrador no código.
- [C2] `RESOLVERS.md` (classificação dos leitores, Token-2022, formatura no pump.fun, defesas).
- [C3] `PRIVACY_PLAN.md` (modelo de privacidade, limites do Cloak, números do cofre).

Referências de segurança (cópias locais em `F:\AceleradoraECO\solana-refs\`):

- [C4] `solana-dev-skill/skills/solana-dev/references/security.md`.
- [C5] `solana-dev-skill/skills/solana-dev/references/programs/design-patterns.md`.
- [C6] `solana-verifiable-build/README.md`.

Aplicativo e regras do projeto:

- [C7] `app/lib/config.ts`, `app/.env.example`, `app/lib/history.ts`; `CLAUDE.md`.
- [R1] `.claude/rules/security-baseline.md`. [R2] `.claude/rules/privacy-audit.md`.

Nenhuma página da internet foi lida nesta sessão. Todos os exemplos numéricos são contas minhas.

## 13. Requisitos mínimos de segurança antes da mainnet

Piso: `.claude/rules/security-baseline.md`. O que segue é o que esse piso significa para este produto.

**Chaves e código**

1. Chave de atualização do programa em multisig 2 de 3, chaves em dispositivos físicos, com trava de tempo.
2. Compilação verificável publicada a cada versão; repositório público no commit que está na rede.
3. Nenhuma chave isolada e ligada à internet com poder sobre dinheiro. O serviço agendado só chama instruções
   abertas.
4. Configuração inicializada pela chave de atualização, na mesma transação da publicação.
5. Varredura de segredos limpa; segredos só em variáveis de ambiente; anotado como trocar cada um.

**Limites gravados no código**

6. Teto constante para a taxa; a taxa de cada pergunta não muda depois de criada.
7. Teto de pote por pergunta e teto total do programa durante o período inicial.
8. Nenhuma instrução da equipe que mova dinheiro de apostadores. Destino das taxas fixo na configuração.
9. Pausa em três níveis; resgate, devolução e `resolve` nunca pausam.
10. Moeda: só o USDC clássico, endereço fixo. Leitores: Token-2022 recusado até o percurso de extensões existir.

**Contas e aritmética**

11. Função de invariante no fim de toda instrução; estados explícitos da pergunta.
12. Aritmética conferida, em 128 bits, arredondando sempre a favor do pote; aposta e saída mínimas de 1 USDC.
13. Totais fotografados na resolução; resgate fecha a posição; tabela do pote de um lado só inteira no código.
14. Pagamentos sempre puxados por quem recebe, para a conta que ele indica.
15. Terceiro resultado, `Anulada`, para conta medida ilegível.

**Testes**

16. Teste aleatório de invariantes refeito para o pote, com saída no sorteio: a soma dos resgates mais a taxa nunca
    passa do cofre; a devolução nunca passa da aposta; fatiar não melhora o resultado.
17. Teste com dois usuários: A não resgata, não sai e não fecha a posição de B.
18. Cada linha das tabelas E8, R7 e C8 com um teste.
19. Revisão externa, no mínimo, de `exit_position`, `claim` e devolução; sem ela, a saída fica desligada.
20. Um ciclo completo na rede de testes e um na mainnet com potes mínimos, antes de abrir ao público.

**Perguntas**

21. Nenhuma pergunta de resultado decidido de graça por uma chave, ou só com teto baixo e selo.
22. Todo tipo novo passa pela prova do sócio: uma transação consegue mover o número e voltar? Se sim, fora.
23. Perguntas de preço: só ativos grandes, só "toque", com margem de erro, idade e preço fresco em toda aposta.
24. Abertura de pergunta em dois passos, por duas pessoas; frase gerada dos parâmetros on-chain.

**Operação**

25. Dois agendadores em provedores diferentes, botão público de resolver, recompensa a quem resolve, alarme e
    plantão.
26. Chave de RPC fora do navegador; repasse com limite; histórico guardado em servidor.
27. Segundo fator com chave física em domínio, hospedagem e GitHub; nenhum script de terceiro na página de aposta.
28. Plano de incidente de uma página; aviso visível de "programa sem auditoria" enquanto for verdade.
29. Regra de privacidade respondida para os nomes de usuário do X.
30. Pontos levados ao agente 2D e a advogado antes de ligar: dinheiro vindo de serviço de privacidade, patrocinador
    não identificado em pergunta controlável, ausência de KYC. Não opino sobre o que a lei permite.

## 14. O que eu cortaria do MVP

Cortar do primeiro lançamento em mainnet (não do produto):

1. **A saída ligada em todas as perguntas.** O código entra, a chave por pergunta nasce desligada (M1). É a única
   divergência com uma decisão do Lucas; a alternativa preserva "no MVP" e muda só o "ligada no primeiro dia".
2. **Perguntas decididas por uma chave** (renúncia de emissão, de congelamento, programa imutável, metadados).
3. **Stake de validador** (não testável com SIM, janela de dois dias) e **formatura no pump.fun** (o sócio deixou em
   espera).
4. **Preço de token pequeno**, por média no tempo ou por Switchboard, e pergunta de preço do tipo "fechamento".
5. **Leitores Token-2022** no degrau 1; entram no degrau 3, com a lista positiva de extensões.
6. **Fechamento em dois marcos com teto de 25% por lado.** Um fechamento só, pela regra já decidida, e perguntas de
   até 30 dias.
7. **Integração do Cloak no site.** Fica a orientação: chegue com uma carteira nova.
8. **Widget do SODAX dentro do fluxo de aposta.** Página separada ou link.
9. **Patrocínio com lado por pagador não divulgado em pergunta controlável.**
10. **Pedido de pergunta com depósito travado** no degrau 1; entra no degrau 2. No começo só o primeiro ciclo (a
    equipe abre).
11. **Divisão da taxa em quatro, recompra e compra de BTC dentro do programa.** O programa só junta a taxa; a
    divisão é feita pelo multisig.
12. **Desconto de taxa e peso de voto por saldo do token.**
13. **Robô que lê menções do X.** Lista curada embutida em página separada e sugestão manual.
14. **Resolução embutida na aposta ou no resgate** e **agendadores on-chain** (Tuk Tuk, Hydra).
15. **Prazo de fechamento menor que 24 horas.** A opção avançada com dupla confirmação fica para quando o multisig
    estiver em uso diário.

O que fica: `place_bet`, `claim`, devolução do pote de um lado só, taxa de 3% juntada por pergunta, abertura pela
equipe em dois passos, teto de pote, pausa, multisig, compilação verificável, `resolve` aberto com recompensa, dois
agendadores, e um cardápio curto em que ninguém decide o resultado: preço de SOL e BTC pela Pyth, foto de pool de
staking, e queima e liquidez travada com teto abaixo do custo de forçar.
