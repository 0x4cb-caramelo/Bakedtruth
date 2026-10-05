# Brot Markets — Business Plan v0.0.2 — Parte 4: Construção e risco

**Data:** 5 de outubro de 2026. **Estado:** rascunho para revisão do fundador. Substitui os capítulos 11 a 16 do BP
v0.0.1. É a última das quatro partes; as Partes 1 (produto), 2 (mercado e negócio) e 3 (tokens) estão prontas.

**Como ler.** As marcas são as das outras partes. **Decisão** é o que o fundador já decidiu, com as palavras dele
entre aspas. Este documento levou oito propostas, de P1 a P8. Em 5/10/2026 o fundador aprovou as oito
recomendações; as respostas dele estão no capítulo 9. Fatos e números de fora trazem etiqueta: FATO (lido na fonte), FATO
SECUNDÁRIO (lido em quem citou a fonte) e INFERÊNCIA (conta ou conclusão nossa). Onde a pesquisa não achou, o
texto diz. Os valores estão em dólares.

**O que esta parte é.** Ela responde a três perguntas: o que será construído e em que ordem; o que protege o
dinheiro dos usuários; e o que pode dar errado, com o que fazer em cada caso.

**O que esta parte não é.** Não é o plano técnico. O método do projeto manda escrever o resumo de produto, o plano
técnico e o roteiro de etapas depois do plano de negócio. Aqui ficam fases, critérios, pessoas, custos e riscos.
Também não é parecer jurídico: o capítulo 7 aponta o que a avaliação jurídica precisa olhar.

**Sete termos que aparecem no texto inteiro.** **Programa** é o código que roda na Solana e guarda o dinheiro das
apostas. **Devnet** é a rede de testes da Solana, em que o dinheiro não tem valor. **Rede principal** (em inglês,
mainnet) é a rede com dinheiro real. **Auditoria** é a revisão do programa por uma empresa de fora, que procura
falhas antes de haver dinheiro real. **Carteira com várias assinaturas** (multisig) é uma carteira que só age
quando um número mínimo de pessoas aprova, por exemplo duas de três. **Chave de atualização** é o poder de trocar
o código do programa. **Serviço agendado** (cron) é um programa de computador que acorda de tempos em tempos e faz
uma tarefa sozinho. O pote, a taxa e os tipos de pergunta estão explicados na Parte 1.

**O que mudou desde a v0.0.1.**

1. O programa será reescrito do zero, neste repositório. A versão anterior contava com o sócio escrevendo.
2. Saíram do roteiro a saída antecipada e o botão público de resolver. Entraram a janela de 6 horas, o pagamento
   automático, a disputa em duas etapas e a indicação.
3. A rede principal ganhou data: início do mês 2. Na v0.0.1 ela era a quinta fase, sem data.
4. Auditoria e avaliação jurídica entram sem custo. O gasto antes do dinheiro real é de 7.500 dólares.
5. A medida provisória de 25/9/2026 sobre apostas entrou na regulação (capítulo 7).

## 1. Resumo

### 1.1 O que será construído e em que ordem

Hoje existe um programa de 1.717 linhas na devnet, que faz outra coisa: paga uma recompensa bancada por um
patrocinador (FATO, repositório, 5/out/2026). **Decisão.** O programa do Brot Markets será escrito de novo: "a
gente que vai reescrever o código aqui, e do zero", aproveitando do código do sócio "os trechos e pedaços que nos
interessam". O que mais se aproveita são os nove leitores, as peças que vão na rede buscar a resposta de uma
pergunta.

A ordem tem quatro fases (capítulo 3):

1. **Devnet e hackathon.** O pote com dinheiro de teste e pontuação, por cerca de um mês.
2. **Rede principal com teto.** Dinheiro real, com um limite para o total apostado. **Decisão:** "provavelmente
   vamos pra mainnet já no início do mês 2".
3. **Fase 1.2.** Contestação aberta aos apostadores, arbitragem interna e o leitor dos tokens do padrão novo.
4. **Fase 2.** Saída antecipada, esportes com oráculo próprio, teto por pergunta e o que mais ficou guardado.

### 1.2 O que protege o dinheiro

**Decisão.** A ida para a rede principal depende de três critérios: auditoria externa, carteira com várias
assinaturas e teto global temporário para o total apostado. O fundador informou que as auditorias, de duas
empresas, "vão custar zero reais".

Em volta deles ficam proteções já decididas na Parte 1: dois serviços agendados em provedores diferentes; a
janela de 6 horas, em que a equipe só confirma ou anula; o resultado "Anulada", que devolve tudo; e o pagamento
que sai sozinho. Este documento acrescenta três peças de operação: uma pausa que nunca trava pagamentos, um
plano de incidente de uma página e um quadro público de quem pode o quê (capítulo 4).

### 1.3 As três tensões

As decisões são do fundador e ficam. O texto registra onde elas batem com o que a pesquisa achou.

1. **O prazo.** Programa novo, leitor de preço, dois serviços, pagamento automático, indicação, patrocínio, Cloak,
   auditoria e carteira com várias assinaturas, tudo antes do início do mês 2. O núcleo do pote cabe em um mês de
   trabalho concentrado. Construir tudo e concluir duas auditorias no mesmo mês não cabe: a auditoria revisa
   código pronto, e o prazo dela não depende da equipe (INFERÊNCIA, seção 3.2). A Parte 1 já escreveu a saída: a
   data anda. Cada mês a mais de devnet custa 5.500 dólares.
2. **Sem identificação e sem bloqueio de país, com sócios no Brasil.** A regra brasileira lida na fonte trata
   mercados de previsão como atividade não autorizada, e uma medida provisória de 25/9/2026 proibiu a aposta de
   quota fixa no país, inclusive a oferecida de fora. Ninguém decidiu se o pote é esse tipo de aposta. É o
   primeiro ponto da avaliação jurídica (capítulo 7).
3. **Poucas pessoas.** Um programa novo, com dinheiro de terceiros, escrito por uma equipe de três, com o
   conhecimento do código antigo concentrado no CTO (capítulo 6).

### 1.4 Os maiores riscos

O capítulo 8 traz a tabela inteira. Os cinco que mais pesam:

- **Um erro no programa com dinheiro real dentro.** Reduzem: auditoria, teto global e pausa.
- **A chave de atualização em uma mão só.** Quem troca o código pode esvaziar todos os cofres.
- **O serviço agendado parado.** Um SIM verdadeiro pode virar NÃO.
- **A regra brasileira.** Reduz: a avaliação jurídica antes de qualquer dinheiro real.
- **A demanda não demonstrada.** **Decisão:** aos 180 dias na rede principal, com volume mensal de até 45 mil
  dólares, a empresa para ou muda de rumo ("ok").

### 1.5 O que foi decidido em 5/10/2026

As respostas do fundador estão na seção 9.1.

- **P1** e **P2:** núcleo primeiro; a rede principal só abre com os três critérios cumpridos (3.3 e 3.4).
- **P3** e **P4:** duas assinaturas de três, com os três sócios; teto global baixo, subindo por degraus (4.2 e 4.4).
- **P5** e **P6:** avaliação jurídica antes do país e da empresa; termo curto agora, tudo em nome da empresa (7.5 e 6.3).
- **P7** e **P8:** os 30% ficam ou voltam conforme a causa; tesouraria em USDC separado, Bitcoin depois (4.8 e 4.9).

Falta fixar valores e nomes: o primeiro valor do teto, e quem assina a carteira.

## 2. O que existe e o que será construído

### 2.1 O que existe hoje

São três coisas (FATO, repositório, 5/out/2026).

- **Um programa publicado na devnet**, com 1.717 linhas e 138 testes. Ele segue o modelo antigo, em que um
  patrocinador vende o SIM com desconto. O programa do pote ainda não existe: não há uma linha dele no
  repositório.
- **A biblioteca do cliente e o site.** A biblioteca é a camada entre as telas e o programa: monta as operações e
  faz as contas que a tela mostra.
- **Os protótipos de tela e o mascote.**

O código tem dono declarado. O arquivo de licença do repositório é do tipo MIT, em nome de Ronaldo Pereira (FATO,
arquivo `LICENSE`). Em linguagem simples, é uma licença que deixa qualquer pessoa usar, copiar e modificar o
código, desde que mantenha o aviso de autoria (seção 6.3).

### 2.2 O que se aproveita, o que se refaz e o que é novo

| Peça | O que é | Destino |
|---|---|---|
| Os nove leitores | Cada um lê um dado e responde sim ou não. Seis nesta cópia; três na versão nova do sócio | Aproveita. Quatro abrem o site, um espera o padrão novo de token e quatro ficam fora do pote (Parte 1, seção 4.2) |
| A resolução | A operação que grava o resultado lido | Aproveita, com um terceiro resultado: "Anulada" |
| O cofre por pergunta | A conta que guarda o USDC de cada pergunta, separada das outras | Aproveita o desenho. Um problema numa pergunta não atinge as demais |
| O teste que confere as contas | Sorteia milhares de sequências de operações e confere, depois de cada uma, se o cofre tem o que o programa deve | Aproveita o método. As contas são outras |
| A parte econômica antiga | Preço fixo, tokens de SIM e de NÃO, orçamento do patrocinador | Sai inteira |
| O pote | Aposta, registro por apostador, taxa de 10% do lado perdedor, fechamento, pote de um lado só | Novo |
| Depois da resolução | Janela de 6 horas, confirmar ou anular, pagamento automático | Novo |
| Patrocínio | Prêmio neutro, aposta de patrocinador e pedido de pergunta com pagamento travado | Novo |
| Indicação | O registro de quem indicou quem e de qual aposta veio cada pedaço da taxa | Novo |
| Administração | Quem abre pergunta, quem pausa, quem anula, e o teto global | Novo. O programa atual não tem nenhuma chave de administrador (FATO, revisão técnica, 4/out/2026) |
| Leitor de preço | Lê um preço assinado por uma rede de oráculos | Novo, e o primeiro a construir |
| Os dois serviços agendados | Resolvem, vigiam um ao outro e enviam os pagamentos | Novos |
| Site e biblioteca do cliente | As telas e a camada entre elas e o programa | Refeitos em boa parte. O mascote e a conexão da carteira ficam |

Todo o caminho do dinheiro é novo. E um aviso sobre o que se aproveita: o leitor de stake de validador nunca deu
SIM em teste, porque o ambiente de testes não simula esse dado (FATO, repositório). A revisão técnica propunha
deixá-lo fora; a decisão o mantém. O mês de devnet é a primeira chance de conferi-lo numa rede de verdade.

### 2.3 Por que reescrever do zero, e o que isso custa

**Decisão.** "a gente que vai reescrever o código aqui, e do zero", "olhando pro código dele para reaproveitar os
trechos e pedaços que nos interessam". E com as regras de código do fundador: "vamos passar a adotar as minhas
regras e Golden rules". Na prática: arquivos curtos, código organizado por funcionalidade e nenhum segredo dentro
do código.

A revisão técnica de 4/out/2026 concluiu o mesmo sobre a troca do modelo antigo pelo pote: "Não é uma mudança:
é um programa novo." Aqui a decisão e a pesquisa concordam.

A reescrita tem três custos, e nenhum deles é em dinheiro.

1. **Os testes.** Boa parte dos 138 testes confere o modelo antigo e deixa de valer (FATO, briefing do projeto).
   A rede de proteção precisa ser refeita junto com o programa.
2. **O tamanho.** A revisão de viabilidade estimou o programa novo entre 1.500 e 2.500 linhas (INFERÊNCIA dela,
   por comparação com o atual). A conta é anterior a várias decisões: a saída antecipada saiu, e entraram a
   janela de 6 horas, o pagamento automático e a indicação. Não há estimativa nova.
3. **A revisão de fora.** Nenhuma linha do programa novo foi vista por alguém de fora da equipe. Tudo o que toca
   dinheiro passa pela auditoria antes da rede principal (seção 4.1).

### 2.4 Duas peças que travam outras

**O leitor de preço.** Não existe. **Decisão:** o site abre com cinco tipos de pergunta, e o leitor de preço é o
primeiro a ser construído ("das três saídas, vamos com o recomendado (a)"). A candidata é a Pyth, uma rede de
oráculos de preço que tinha 1.881 preços, 423 de cripto, em 4/out/2026 (FATO, consulta direta da pesquisa). Dois
avisos. A pesquisa não verificou se a Pyth funciona na devnet do jeito que o leitor precisa; é a primeira coisa
a conferir. E, se o leitor atrasar, a Parte 1 já diz o que acontece: a equipe volta à decisão e escolhe entre
abrir com os quatro tipos prontos ou esperar.

**O leitor do padrão novo de token.** Na Solana há dois padrões de token: o clássico, do USDC, e o novo, chamado
Token-2022. Os tokens novos do pump.fun usam o novo: 7 de 7 na amostra lida em 3/out/2026 (FATO, amostra
pequena). Os leitores atuais só leem o clássico; diante de um token novo, recusam. Sem um leitor novo, três coisas
não existem: perguntas sobre o token A, o tipo "tokens travados" e a ponte da Parte 3, em que o A é queimado para
comprar o B. O leitor novo precisa recusar tokens com funções perigosas, como a que deixa uma chave de fora
queimar o saldo de qualquer carteira. Ele fica para a fase 1.2, com revisão própria, e não trava o primeiro mês.

## 3. O roteiro em fases

### 3.1 As quatro fases

**Decisão.** "vamos montar inteiramente na devnet inicialmente". Depois, "provavelmente vamos pra mainnet já no
início do mês 2". O que vem em seguida também tem decisão: a arbitragem é "um serviço internamente de arbitragem
que iremos construir na fase 1.2"; a saída antecipada e os esportes ficam para a fase 2; o teto por pergunta,
para "uma fase futura".

| Fase | O que o usuário consegue fazer | O que precisa estar pronto | O que fica de fora |
|---|---|---|---|
| 1. Devnet e hackathon, cerca de um mês | Apostar com USDC de teste em perguntas reais dos cinco tipos, acompanhar a resolução, receber sozinho e somar pontos. Os parceiros ganham a pergunta gratuita | O programa do pote testado, o leitor de preço, os dois serviços agendados, a janela de 6 horas, o pagamento automático e o site novo | Dinheiro real, SODAX e patrocínio pago |
| 2. Rede principal com teto, a partir do mês 2 | Apostar USDC de verdade, até o teto global. Trazer dinheiro de outra rede pelo SODAX. Patrocinar uma pergunta, com ou sem o nome à mostra | Os três critérios; a indicação; o patrocínio com pedido de pergunta; a pausa; o plano de incidente; os termos e avisos; a avaliação jurídica; a empresa aberta | Contestação pelo público, tokens, perguntas de menos de três dias |
| 3. Fase 1.2 | Contestar um resultado, com depósito. Apostar em perguntas sobre tokens do padrão novo | A arbitragem interna; o leitor do padrão novo, com revisão própria; o teto global revisto. O token A pode sair a partir daqui, depois dos quatro testes da Parte 3 | Saída antecipada e esportes |
| 4. Fase 2 | Sair de uma aposta antes do fim. Apostar em esportes. Com o token B, votar em quais perguntas abrir | A fórmula de saída revisada por fora; o oráculo próprio de esportes; o teto por pergunta; o aviso por Telegram. O token B só vem depois do equilíbrio | |

### 3.2 A tensão do prazo

Esta é a tensão mais importante do documento. Quatro fatos a formam.

1. **O ponto de partida.** Em 5/out/2026, o programa do pote não existe no repositório (FATO).
2. **O hackathon.** **Decisão.** "estamos codando pro colosseum", com o Cloak para a trilha de privacidade. Os
   arquivos do projeto registram 12 de outubro de 2026 como prazo do Colosseum (FATO SECUNDÁRIO, briefing do
   projeto e revisão de finanças; a página do evento não foi conferida). O fundador confirmou a data em 5/10/2026: "é isso mesmo, e vai dar
   certo, confia". São sete dias a partir deste documento.
3. **O tamanho do trabalho.** A revisão de viabilidade dividiu a construção em doze etapas, sem datas: "tamanho é
   relativo, não é prazo nem horas". Com as decisões, duas etapas saíram, as da saída antecipada, e quatro peças
   entraram: janela de 6 horas, pagamento automático, indicação e Cloak integrado. Só para dar a medida: a uma
   semana por etapa, as dez que sobraram seriam mais de dois meses (INFERÊNCIA; a revisão não deu duração).
4. **A auditoria.** O prazo, o escopo e a ordem de trabalho das duas empresas não estão nos arquivos lidos.

A tabela mostra cada peça que precisa existir antes do início do mês 2 e de quem ela depende. A última coluna é
INFERÊNCIA.

| Peça | Depende de | Cabe em um mês? |
|---|---|---|
| Núcleo do pote: aposta, fechamento, resolução, "Anulada", janela e pagamento | Equipe | Cabe, se for a única prioridade |
| Leitor de preço | Equipe, e a Pyth funcionar na devnet | Cabe, construído primeiro |
| Dois serviços agendados, em provedores diferentes | Equipe | Cabe |
| Indicação | Equipe | Cabe só depois do núcleo |
| Patrocínio pago e pedido de pergunta | Equipe | Não cabe junto com o núcleo sem tirar tempo dele |
| Cloak | O Cloak, que só existe na rede principal | Cabe como demonstração (seção 5.2) |
| Carteira com várias assinaturas | Três pessoas definidas (P3) | Cabe. São dias, depois da decisão |
| Teto global | Equipe, com o valor de P4 | Cabe. Faz parte do programa |
| Duas auditorias, com as correções | Duas empresas de fora | Não depende da equipe. Prazo desconhecido |
| Avaliação jurídica e abertura da empresa | Fundador | Sem prazo nos arquivos |

**O que cabe.** O núcleo do pote na devnet, com o leitor de preço, os dois serviços, a pontuação e as perguntas
dos parceiros.

**O que não cabe.** Construir todas as peças e, no mesmo mês, concluir duas auditorias. São três motivos.

- **A auditoria revisa código pronto.** Ela só começa quando o programa para de mudar. Cada semana que ela levar
  é uma semana a menos para construir. Se as duas revisões e as correções levassem duas semanas, sobrariam duas
  para escrever o programa inteiro; se levassem quatro, não sobraria nenhuma. O prazo real é a primeira pergunta
  a fazer às duas empresas.
- **O prazo é de terceiros.** A equipe controla o que escreve. A agenda de quem audita, não.
- **O que entra depois da auditoria não foi auditado.** Uma peça escrita na última semana ou atrasa a revisão,
  ou vai para a rede principal sem revisão.

**O que acontece com a data.** A Parte 1 já responde: "se não couberem, a data anda". O custo de cada mês a
mais está na Parte 2: 5.500 dólares.

| Meses de devnet | Gasto antes do dinheiro real | Ponto mais baixo do caixa no cenário razoável |
|---|---|---|
| 1, como decidido | 7.500 | −27.474 |
| 2 | 13.000 | −32.974 |
| 3 | 18.500 | −38.474 |

A decisão do fundador continua de pé: o alvo é o início do mês 2. O que este capítulo propõe é a ordem de
construção que dá mais chance a esse alvo (P1) e a regra que evita cumpri-lo no papel (P2).

### 3.3 O que entra no primeiro mês

**Decisão (P1), de 5/10/2026: a ordem de construção.**

**O que está sendo decidido.** Quais peças a equipe constrói primeiro, para o mês de devnet e o hackathon, e
quais ficam para o intervalo entre a devnet e a rede principal.

**Por que é uma decisão.** O mês não comporta tudo. O que for escrito por último é o que corre o risco de ficar
sem auditoria ou de empurrar a data.

**Exemplo.** A indicação mexe na taxa de toda aposta: ela precisa saber quem indicou quem e repartir 20%. Se
for escrita na terceira semana, dentro do programa, a auditoria revisa um código que ainda muda, ou começa mais
tarde. Se entrar depois da auditoria, vai para a rede principal sem revisão, tocando o dinheiro de todas as
perguntas.

| Opção | O que entra no primeiro mês | Custo |
|---|---|---|
| (a) Núcleo primeiro | Pote, fechamento, os cinco tipos, "Anulada", janela, pagamento automático, os dois serviços, pontuação e as perguntas dos parceiros. Em seguida, antes da rede principal: indicação, patrocínio pago com pedido de pergunta e a segunda leitura da disputa | O beta abre sem indicação e sem patrocínio pago. Se o segundo bloco não estiver pronto quando o código for para a auditoria, o fundador escolhe: mover a data ou abrir a rede principal sem ele |
| (b) Tudo junto | Todas as peças no mesmo mês | Nenhuma fica bem testada. É o caminho em que o prazo mais provavelmente estoura (INFERÊNCIA) |
| (c) Só o que já tem leitor | O pote com os quatro tipos prontos; o preço depois | Contraria a decisão de construir o preço primeiro. Abre sem o único tipo que ninguém controla |

**Recomendação, aprovada: a opção (a).** Três motivos.

- **Os parceiros gratuitos não precisam do módulo de patrocínio.** A pergunta do parceiro é uma pergunta aberta
  pela equipe, com selo e destaque. Não entra dinheiro dele. O módulo só faz falta quando alguém pagar.
- **O núcleo é o que guarda dinheiro.** Indo primeiro, ele é a parte mais testada e a primeira a chegar a quem
  audita.
- **A indicação pode pesar menos.** A decisão é "vamos implementar desde o mvp", e ela se mantém se a indicação
  estiver pronta antes da rede principal. Uma escolha a levar ao plano técnico: o programa grava só quem
  indicou quem; o repasse dos 20% e a devolução saem da conta da operação, por rotina do serviço, com registro
  público. A auditoria tem menos a cobrir. O custo: quem indica depende da empresa para receber.

### 3.4 O que conta como "pronto"

**Decisão (P2), de 5/10/2026: os três critérios e a regra da data.**

**O que está sendo decidido.** O que cada critério precisa mostrar para valer como cumprido, e o que acontece
com o início do mês 2 se um deles não estiver.

**Por que é uma decisão.** Os três critérios já estão decididos, e a Parte 1 já diz que a data anda. Falta dizer
o que é "pronto". Sem isso, na véspera, "auditoria em andamento" passa por "auditoria feita".

**Exemplo.** No último dia do mês de devnet, uma das empresas entregou o relatório, com duas falhas graves ainda
sem correção, e a outra não começou. A carteira e o teto estão prontos. Abrir assim poria dinheiro real num
programa com falha conhecida.

A definição proposta:

- **Auditoria:** as duas empresas entregaram relatório sobre a versão exata que vai para a rede; toda falha
  grave foi corrigida, e quem a apontou conferiu a correção; os relatórios são públicos.
- **Carteira com várias assinaturas:** criada com as pessoas de P3, já dona da chave de atualização do programa,
  e com uma assinatura de teste feita.
- **Teto global:** gravado no programa auditado, com o valor de P4, e testado na devnet.

| Opção | O que acontece se faltar um critério | Custo |
|---|---|---|
| (a) A data anda | A rede principal só abre com os três cumpridos por inteiro | 5.500 dólares por mês de espera |
| (b) Abrir com uma auditoria | Abre com um relatório concluído e sem falha grave aberta, e com teto menor até o segundo chegar | Menos espera. Uma revisão a menos no período de maior risco |
| (c) Abrir na data, com teto mínimo | Abre sem auditoria concluída | Contraria o critério decidido. Dinheiro real em código que ninguém de fora revisou |

**Recomendação, aprovada: a opção (a), com a (b) como exceção combinada de antemão.** O custo de esperar é conhecido e
pequeno: 5.500 dólares por mês. O custo de um erro é o dinheiro que estiver nos cofres e o nome da casa. Dois
complementos. Perguntar agora às duas empresas o prazo, o escopo e de que versão precisam: essa resposta define
o calendário. E fixar quando o mês começa a contar; a leitura proposta é o dia em que o programa do pote estiver
na devnet com a primeira pergunta aberta.

## 4. O que protege o dinheiro

O dinheiro de cada pergunta fica num cofre que só o programa movimenta. As proteções deste capítulo respondem a
quatro perguntas: o código está certo? Quem pode trocá-lo? Quanto se perde se algo falhar? O que acontece na
hora da falha?

### 4.1 Auditoria

**Decisão.** São duas empresas, sem custo: "as duas auditorias dos dois sites que te passei vão custar zero
reais". Uma delas aparece nos arquivos como proofofexploit.com, em negociação (registro de 4/out/2026). A outra
não está nomeada nos arquivos lidos. O prazo, o escopo e o formato das duas revisões não foram encontrados.

Quem audita lê o código e os testes, procura caminhos em que o dinheiro sai errado e entrega um relatório com as
falhas. Dois limites: a auditoria não garante que não haja erro, e só vale para a versão que foi lida. Duas
consequências.

- **O que entrar depois passa por nova revisão.** Vale para o leitor do padrão novo de token e para os três
  programas da Parte 3: staking, cofre e ponte. A gratuidade informada cobre as duas auditorias de agora. Não há
  informação sobre as seguintes.
- **Enquanto não houver relatório, a tela diz.** Um aviso de "programa ainda sem auditoria" fica visível
  enquanto for verdade.

### 4.2 A carteira com várias assinaturas

Todos os cofres obedecem ao programa. Quem tem a chave de atualização pode publicar um código novo que manda o
dinheiro de todos os cofres para si. Hoje, na devnet, os comandos usam uma carteira guardada num arquivo de
computador (FATO, repositório). Quem guarda a chave do programa atual: não encontrado. Na rede principal, essa
chave precisa estar numa carteira com várias assinaturas.

**Decisão (P3), de 5/10/2026: quem assina e quantas assinaturas.**

**O que está sendo decidido.** Quem são as pessoas, quantas precisam aprovar e quanto tempo se espera entre
aprovar uma troca de código e ela valer.

**Por que é uma decisão.** Sem as pessoas definidas, o segundo critério não se cumpre. A revisão técnica foi
direta: "Duas pessoas não fazem um 2 de 3: é preciso decidir quem é a terceira chave."

**Exemplo.** Com duas de três, um sócio perde o aparelho e os outros dois ainda assinam e trocam a chave
perdida; um aparelho roubado, sozinho, não faz nada. Com uma de três, um roubo basta para esvaziar tudo. Com
três de três, uma perda trava o programa para sempre.

| Opção | Vantagem | Custo |
|---|---|---|
| (a) Duas de três, com os três sócios | Simples, e pode ser montada em dias | Os três são da mesma empresa. Dois de acordo, ou dois pressionados, bastam |
| (b) Duas de três, com dois sócios e uma pessoa de fora | Um olhar independente em toda troca de código | Depende de achar essa pessoa. Decisões mais lentas |
| (c) Três de cinco, com pessoas de fora | Aguenta mais perdas e mais pressão | Cinco pessoas para coordenar, numa equipe de três |

**Recomendação, aprovada: a opção (a) para abrir, com três condições.** Cada assinatura fica num aparelho físico próprio,
nunca num arquivo. Toda troca de código espera um prazo público antes de valer, para qualquer pessoa ver o que
vem; de 24 a 48 horas é um ponto de partida. E a mesma carteira é o destino da taxa. A referência de segurança
lida pela revisão técnica recomenda maioria simples e desaconselha "uma de várias" e "todas de várias" (FATO,
via revisão técnica). Este documento não indica nomes: o terceiro sócio não aparece com nome nos arquivos
lidos.

### 4.3 Quem pode o quê

O programa atual não tem administrador. O novo tem, e isso precisa ser público. O quadro é o ponto de partida
da revisão técnica, ajustado às decisões; o plano técnico fecha os detalhes.

| Poder | Quem | Limite |
|---|---|---|
| Trocar o código | A carteira com várias assinaturas | Espera pública antes de valer |
| Abrir pergunta | Duas pessoas da equipe: uma propõe, outra aprova | Só os tipos permitidos |
| Confirmar ou anular na janela | Uma chave da equipe | Nunca inverte o resultado. Toda anulação fica registrada, com o motivo |
| Pausar | Uma chave da equipe, para ser rápido | Nunca trava pagamento nem devolução |
| Retomar depois da pausa | A carteira com várias assinaturas | |
| Mudar a taxa | Ninguém, numa pergunta já aberta | Um teto fixo no código |
| Enviar os pagamentos | O serviço agendado | Não escolhe quem recebe nem quanto |

### 4.4 Os tetos

**Decisão.** Há um teto global temporário para o total apostado; é um dos três critérios. **Decisão.** O teto
por pergunta fica fora do MVP: "no mvp não vamos lidar com isso, mas guarde essa informação para revisitarmos
numa fase futura".

O teto global é um limite para a soma de todos os potes abertos. Quando ela chega ao limite, o programa recusa
apostas novas até alguma pergunta pagar.

**Decisão (P4), de 5/10/2026: o valor do teto e quando ele sobe.**

**O que está sendo decidido.** O valor do primeiro dia com dinheiro real e a regra que o faz subir.

**Por que é uma decisão.** O teto é a perda máxima se tudo der errado. Ele também limita a receita.

**Exemplo.** Com teto de 10.000 dólares e potes que giram a cada 14 dias, o site comporta cerca de 21.400
dólares apostados por mês. A 3,70% de taxa média, são uns 790 de taxa. Com teto de 100.000, comporta cerca de
214.000 por mês, acima dos 208.630 do ponto de equilíbrio (INFERÊNCIA). Um teto de 100.000 não impede o
equilíbrio; um de 10.000 impede.

| Opção | Como funciona | Custo |
|---|---|---|
| (a) Baixo, subindo por degraus | Exemplo de partida: 10.000, depois 25.000, 50.000 e 100.000. Cada degrau vem depois de duas semanas sem incidente e com todas as perguntas pagas certo | Receita quase nula nas primeiras semanas |
| (b) Alto e fixo | Exemplo: 100.000 desde o primeiro dia | Dez vezes mais dinheiro exposto justamente no período menos testado |
| (c) Só teto por pergunta | Sem teto global | Contraria as duas decisões |

**Recomendação, aprovada: a opção (a).** Os valores são exemplo; quem fixa é o fundador. Um critério para o primeiro
degrau: quanto os sócios conseguiriam devolver do próprio bolso se o pior acontecesse. O teto é revisto na fase
1.2.

**Objeção registrada (OBJ-22).** A revisão técnica pede teto também por pergunta. A evidência: quem consegue
empurrar um resultado ganha, no máximo, o que está no lado oposto do pote. Nos tipos em que empurrar custa
dinheiro, como a queima, a pergunta só é segura enquanto o pote for menor que esse custo. Com teto apenas
global, uma única pergunta pode ocupar o limite inteiro. A decisão vale. A alternativa, sem mexer no
programa: nesses tipos, a equipe só abre perguntas cuja meta custe caro para empurrar.

### 4.5 Os dois serviços e o pagamento

**Decisão.** Dois serviços agendados, em provedores diferentes. Depois de 10 minutos sem resposta e 3 tentativas,
"o segundo assume o cron e envia notificação para o cto saber que tem um sistema down". Não há botão público de
resolver: "Sobre o botão resolver, esquece". **Decisão.** O pagamento é automático: "não faz sentido ter botão
de claim".

Três regras de construção sustentam essas decisões (INFERÊNCIA, a partir da revisão técnica).

1. **O serviço não decide nada.** O resultado sai do dado lido; os valores saem do registro das apostas. Uma
   chave do serviço roubada não desvia pagamento.
2. **O serviço não acumula poderes.** Ele não abre pergunta, não aceita patrocínio e não anula. A carteira dele
   guarda pouco SOL, a moeda que paga as taxas da rede.
3. **Dois serviços com o mesmo código têm o mesmo defeito.** Por isso a janela de 6 horas e o resultado
   "Anulada" continuam atrás deles.

O pagamento automático deixou duas pendências na Parte 1.

- **A taxa de rede.** Quem paga é a plataforma. Cada envio custa 0,000005 SOL: mil envios custam 0,005 SOL e dez
  mil, 0,05 (FATO, relatório técnico; as somas são INFERÊNCIA). De onde sai está na P8.
- **A conta de USDC que o vencedor fechou.** O envio falha. A regra de negócio é: o valor fica reservado no
  cofre em nome dele, sem prazo para perder, e só vai para a carteira que apostou. O plano técnico escolhe entre
  tentar de novo mais tarde e recriar a conta por ele, o que custa cerca de 0,002 SOL por conta (FATO, via
  revisão técnica).

**Duas objeções registradas.** A revisão técnica recomendava o pagamento "puxado": cada vencedor apertaria um
botão e indicaria a própria conta. A decisão é outra, e o que a torna segura é a regra acima: o destino é
sempre a carteira que apostou. A mesma revisão pedia botão público e recompensa a quem resolve, para a
resolução não depender só da casa (OBJ-25). A decisão vale. Uma alternativa que não a contraria: o programa
aceita a leitura acionada por qualquer carteira, sem botão no site. Se os dois serviços caírem, alguém de fora
ainda consegue acionar.

### 4.6 A janela, a pausa e o plano de incidente

**A janela de 6 horas** está decidida na Parte 1. Ela pede uma rotina: alguém confere cada
resolução, mesmo sabendo que o pagamento sai sozinho. Essa rotina ainda não tem dono (capítulo 6).

**A pausa** é um botão de emergência. A proposta da revisão técnica, a levar ao plano técnico, tem dois
estados: normal e sem apostas novas. Resolução, pagamento e devolução nunca pausam. E não existe "saque de
emergência" pela equipe: seria a porta por onde alguém da casa tiraria dinheiro de usuário.

**O plano de incidente** é uma página, escrita antes da rede principal: quem pausa, quem fala em nome da casa,
onde se publica e em quanto tempo. Exemplo: às 3 horas o segundo serviço avisa o CTO que o principal caiu. A
página diz quem confere, em quanto tempo, e onde avisar o público. Hoje essa página não existe.

### 4.7 Patrocínio e indicação: o que o programa precisa garantir

**Pedido de pergunta.** A Parte 1 registrou três regras para o dinheiro do patrocinador nunca ficar preso, e
elas entram no plano técnico como exigência. O aceite abre a pergunta e aplica o dinheiro numa mesma operação.
A recusa só libera o saque, e quem saca é o patrocinador. Sem resposta em 14 dias, ele cancela sozinho. Exemplo:
um projeto trava 1.500 dólares e a equipe não responde; no 15º dia ele mesmo recupera os 1.500.

**Indicação.** Dois registros são necessários: quem indicou quem, gravado uma única vez, antes da primeira
aposta do indicado; e de qual aposta veio cada pedaço de taxa, para repartir os 20% e calcular a devolução.

**A autoindicação.** Sem cadastro, uma pessoa abre duas carteiras e indica a si mesma. Num produto que só conhece
carteiras, não há trava que impeça isso. Há limite para o ganho: 20% de desconto na própria taxa por 90 dias,
mais a devolução, com teto de 5 dólares. Se todos fizessem isso, o custo seria de 0,74% do volume, que são 20%
de 3,70% (INFERÊNCIA). O modelo da Parte 2 conta com um quarto disso. **Decisão.** O fundador aceitou o risco ("isso mesmo"): acompanha-se, e a
regra volta a ele se a fatia da taxa que sai em indicação passar muito do previsto.

### 4.8 O patrocínio que volta

**Decisão (P7), de 5/10/2026: os 30% da plataforma quando o prêmio volta.**

**O que está sendo decidido.** No pote de um lado só e na pergunta anulada, o prêmio volta inteiro ao
patrocinador; isso está decidido. Falta dizer o que acontece com os 30% que ficaram com a plataforma.

**Por que é uma decisão.** É a pendência que a Parte 1 deixou para esta parte. O programa precisa de uma regra
para cada caso, e o patrocinador vai perguntar antes de pagar.

**Exemplo.** Na faixa de 1.500 dólares, 1.050 vão para o pote e 450 ficam com a plataforma. A pergunta termina
só com apostas no SIM. Os 1.050 voltam ao patrocinador. E os 450?

| Opção | O que acontece com os 450 | Custo |
|---|---|---|
| (a) A plataforma fica sempre | Ficam com a casa | O patrocinador paga 450 mesmo quando a anulação foi falha da casa |
| (b) A plataforma devolve sempre | Voltam ao patrocinador | Selo, destaque e publicações saem de graça. Vira um jeito de ter divulgação sem pagar |
| (c) Depende da causa | Ficam com a casa quando a pergunta esteve no ar e as contrapartidas foram entregues: pote de um lado só, ou anulação por causa de fora. Voltam quando a anulação veio de falha da casa | Exige registrar o motivo de cada anulação, o que a seção 4.3 já pede |

**Recomendação, aprovada: a opção (c).** Os 30% pagam a vitrine, e a vitrine foi entregue. Quando a falha é da casa, a
casa devolve. O efeito no modelo é pequeno: o cenário razoável conta com 150 dólares de patrocínio por mês, do
mês 7 ao 12. Os 30% que ficam seguem para a operação, como decidido ("concordo").

### 4.9 A tesouraria e a carteira do serviço

**Decisão (P8), de 5/10/2026: onde fica guardado o dinheiro da empresa.**

**O que está sendo decidido.** Duas guardas: a da tesouraria, que recebe 25% da taxa em Bitcoin "desde o dia
zero", e a da carteira que paga as taxas de rede.

**Por que é uma decisão.** A Parte 2 deixou para cá "como guardar o Bitcoin". E há um obstáculo prático: comprar
Bitcoin passa por uma corretora, que pede os documentos da empresa e a origem do dinheiro (INFERÊNCIA da
pesquisa de monetização). A empresa ainda não existe.

**Exemplo.** No cenário razoável, a tesouraria recebe cerca de 230 dólares no mês 1, soma cerca de 1.390 nos
três primeiros meses e chega a 18.038 no mês 12 (INFERÊNCIA, modelo da Parte 2).

| Opção | Como funciona | Custo |
|---|---|---|
| (a) USDC separado, depois Bitcoin | Os 25% ficam em USDC, numa conta à parte da carteira com várias assinaturas, até a empresa ter conta em corretora. Daí em diante, compra mensal em data fixa, e o Bitcoin guardado em carteira própria, também com várias assinaturas | Nos primeiros meses a reserva está em dólar digital. Muda a letra de "desde o dia zero" |
| (b) Bitcoin emitido na Solana | Uma versão do Bitcoin que circula na Solana, na mesma carteira, desde o primeiro dia | A reserva passa a depender de quem emite essa versão |
| (c) Bitcoin deixado na corretora | A corretora guarda | A reserva fica na mão de um terceiro, e só é possível com a empresa aberta |

**Recomendação, aprovada: a opção (a); a (b), se o fundador fizer questão do Bitcoin desde o primeiro dólar.** Nos dois
casos, com regra escrita: quem assina, em que dia compra e em que situação vende.

**A carteira do serviço.** Guarda pouco SOL e é reposta pela verba de infraestrutura. A Parte 1 já definiu que
quem paga a taxa de rede é a plataforma.

## 5. Peças de fora

Cinco serviços de terceiros entram no produto. Nenhum deles guarda o dinheiro das apostas, mas cada um pode
parar uma parte do site.

### 5.1 O quadro

| Peça | O que faz no produto | Onde funciona | Se cair ou mudar |
|---|---|---|---|
| Pyth | Dá o preço assinado das perguntas de preço | Rede principal. Na devnet, não verificado | As apostas em perguntas de preço param, porque cada aposta exige um preço fresco. Se o preço não puder ser lido até o prazo, a pergunta é anulada e todos recebem de volta. Os outros quatro tipos seguem |
| Cloak | Esconde quem pagou um patrocínio | Só na rede principal | O patrocínio sem nome à mostra fica indisponível. Apostas e pagamentos seguem |
| SODAX | Traz dinheiro de outras redes e entrega USDC na carteira do usuário | Só na rede principal | Quem vem de outra rede não chega. Quem já tem USDC na Solana não percebe |
| pump.fun | É onde nasce o token A | Rede principal | Nada muda no pote. Afeta o token A e, mais tarde, a ponte da Parte 3 |
| X | Mostra as sugestões do público | Fora da rede | A página de sugestões fica sem a lista. Nenhuma aposta depende dele |

Cloak e SODAX não têm rede de testes (FATO SECUNDÁRIO, plano de privacidade do sócio; FATO, documentação do
SODAX, 3/out/2026). Há uma sexta dependência, a própria moeda: o emissor do USDC pode congelar contas
(INFERÊNCIA da revisão técnica, não conferida). O cofre por pergunta limita o efeito a uma pergunta.

**Onde essas peças aparecem no site.** **Decisão.** Cloak e SODAX ficam integrados: "não, vamos seguir o plano
e integrar os dois serviços dentro da nossa plataforma". A revisão técnica pediu o contrário, e o motivo dela
continua valendo: código de terceiro, rodando na página em que a carteira assina, pode pedir uma assinatura
maliciosa com a nossa marca em volta (OBJ-23). As duas coisas cabem juntas: os serviços entram no site em
páginas próprias, e a página de aposta não carrega código de ninguém de fora. O mesmo vale para o X.

### 5.2 O Cloak na devnet: o que dá e o que não dá para mostrar

**Decisão.** O Cloak entra "já na devnet", para a trilha de privacidade do hackathon. O SODAX entra na fase da
rede principal.

Como o Cloak só existe na rede principal, "Cloak na devnet" quer dizer duas metades, em duas redes.

- **A metade privada roda na rede principal, com dinheiro real e valor pequeno.** Alguém deposita USDC no Cloak
  e saca para uma carteira nova. O depósito mínimo é de 1 USDC, e o saque custa 0,3% mais 0,45 USDC (FATO,
  documentação do Cloak, lida por resumo em 3/out/2026).
- **A metade do pote roda na devnet, com USDC de teste.** A carteira nova entra numa pergunta como patrocinador
  "não divulgado".
- **As duas metades se ligam pela carteira nova.** Nenhuma transação atravessa de uma rede para a outra: o USDC
  real sacado na rede principal não entra num pote da devnet.

**O que dá para mostrar no hackathon:** o caminho inteiro, em duas etapas, e a regra do produto: o público não vê
quem pagou, e a equipe sabe quem é. **O que não dá para mostrar:** um pagamento privado caindo num pote de
verdade. Isso só existe com o programa na rede principal, depois dos três critérios.

Três limites que o material do hackathon e a tela precisam respeitar.

1. **O tamanho.** Esconder um pagamento depende de haver muitos parecidos em volta. O cofre de USDC do Cloak
   tinha 2.562,72 USDC (FATO SECUNDÁRIO, plano de privacidade do sócio; tamanho atual a confirmar). Um
   patrocínio de 500 é 19,5% desse cofre; um de 1.500, 58,5%; um de 5.000, quase o dobro. Por isso a tela diz "não
   divulgado" no lugar de "anônimo".
2. **A auditoria do Cloak.** O site dele diz que foi auditado e que o relatório está sendo preparado para
   publicação. O relatório não foi publicado (FATO, documentação do Cloak, via pesquisa).
3. **A carteira nova chega sem SOL.** Ela precisa de SOL para pagar a taxa de rede. Se o SOL vier da carteira
   principal do patrocinador, as duas ficam ligadas em público e a privacidade se desfaz.

O custo para o patrocinador é pequeno: sacar 500 custa 1,95; sacar 1.500, 4,95; sacar 5.000, 15,45.

### 5.3 As outras quatro, em poucas linhas

- **SODAX.** Cobra 0,1%: 1 dólar a cada 1.000 (FATO, documentação). Entrega o USDC na carteira do usuário, que
  só então aposta. Quem chega assim também chega sem SOL, e a tela precisa avisar.
- **Pyth.** O programa só lê o preço; nunca dá permissão a ela. Os donos da Pyth podem alterá-la; é um risco
  aceito. Só ativos grandes, só a modalidade de toque. O segundo oráculo, usado na primeira etapa da disputa, ainda
  não foi escolhido.
- **pump.fun.** O programa dele é fechado e pode ser alterado pelos donos; foi republicado horas antes de uma
  leitura feita pelo sócio (FATO, documento técnico do sócio, via revisão técnica). Os quatro testes da Parte 3
  continuam valendo.
- **X.** Embutir uma lista escolhida pela equipe não tem custo informado. Ler publicações por programa custa
  0,005 dólar cada: 5.000 por mês são 25 dólares (FATO, tabela de preços do X, 3/out/2026; a conta é
  INFERÊNCIA). Guardar o nome de usuário de quem sugeriu é dado pessoal e passa pela revisão de privacidade do
  projeto antes de ser construído.

## 6. Pessoas e empresa

### 6.1 Quem faz o quê

| Papel | Quem | Situação |
|---|---|---|
| Dono do produto e das regras | Lucas, o fundador | Decide o que este plano descreve e conduz a avaliação jurídica |
| Responsável técnico | Ronaldo | **Decisão:** "o CTO é o Ronaldo". Recebe os alertas dos serviços. É o autor do programa atual |
| Terceiro sócio | Sem nome nos arquivos lidos | Papel a definir. No hackathon a equipe se apresenta como uma pessoa; "na prática real somos três sócios" |
| Escrever o programa e o site | A equipe, neste repositório, com assistentes de código | Decidido |
| Propor e aprovar perguntas | Duas pessoas da equipe | Sem dono |
| Conferir as resoluções na janela de 6 horas | Alguém da equipe | Sem dono |
| Atender o alerta fora de hora | O CTO | Sem substituto definido |
| Falar com as duas empresas de auditoria | | Sem dono nos arquivos |
| Rever texto de patrocinador e sugestões do X | | Sem dono |

Quatro linhas estão sem dono, e o alerta não tem substituto. Nenhuma pede contratação; pede um nome.

### 6.2 O que depende de uma pessoa só

É a terceira tensão. A equipe tem três pessoas, e "o custo de 5.500 por mês é a conta de três sócios, sem mais
ninguém" (Parte 3). Quatro pontos de concentração.

- **O conhecimento do código antigo.** Por que cada leitor resiste a manipulação, e o que não pôde ser testado
  fora de uma rede real, está com o Ronaldo (FATO, revisão de viabilidade). A reescrita acontece neste
  repositório. O que reduz o risco: ele revisa os leitores reaproveitados e o leitor de preço, e o que ele sabe
  vai para documento.
- **O alerta.** Se o serviço principal cair de madrugada e o CTO não puder atender, não há segunda pessoa
  definida.
- **A avaliação jurídica.** **Decisão.** "a avaliação jurídica eu consigo gratuitamente também, eu memso posso
  fazer". Quem avalia é também sócio e mora no país avaliado. O que reduz: a conclusão fica por escrito, mesmo
  curta, com a leitura de pelo menos um colega de fora da sociedade.
- **A máquina.** O ambiente de trabalho atual não compila o programa nem roda os testes (FATO, revisão de
  viabilidade). A conferência automática do repositório precisa ser o lugar em que isso acontece.

### 6.3 O acordo sobre o código

**Decisão (P6), de 5/10/2026: pôr por escrito o acordo com o Ronaldo.**

**O que está sendo decidido.** Se, antes de aproveitar trechos do código atual, os sócios escrevem de quem é o
programa novo e em que condições o antigo é usado.

**Por que é uma decisão.** No começo, o fundador disse que a divisão com o Ronaldo era "por enquanto
irrelevante, eu te aviso o que fazer". Depois veio a decisão de reescrever aqui, com trechos dele. A licença do
código atual, a MIT, permite pelo próprio texto usar e modificar, desde que o aviso de autoria seja mantido.
Para o reaproveitamento, portanto, já existe base escrita. Para o resto, não: de quem é o programa novo, já que
a empresa ainda não existe; quanto cada sócio se dedica; e o que acontece com chaves e assinaturas se alguém
sair (OBJ-19).

**Exemplo.** O programa novo vai para a rede principal com leitores escritos pelo Ronaldo. Meses depois, um
sócio sai. Sem papel, ficam três perguntas sem resposta: quem continua usando o código, quem fica com a
assinatura na carteira, e a quem pertence o programa que guarda o dinheiro dos usuários.

| Opção | O que é | Custo |
|---|---|---|
| (a) Nada por escrito agora | Segue como está | A dúvida aparece no pior momento: saída de sócio, investidor pedindo documentos ou auditoria perguntando de quem é o código |
| (b) Um termo curto entre os sócios, agora | Uma página: o código novo pertence à empresa que será aberta; os trechos antigos seguem a licença, com o aviso de autoria; a dedicação de cada um; o destino de chaves e assinaturas se alguém sair | Uma conversa e uma página |
| (c) Acordo de sócios completo | Com as participações de cada um | Só é possível com a empresa e o país definidos (P5) |

**Recomendação, aprovada: a (b) agora e a (c) junto com a abertura da empresa.** O termo não custa dinheiro e evita ter essa
conversa sob pressão. **Decisão.** "vamos deixar tudo em nome da empresa": código, programa e chaves.

### 6.4 Empresa e custos

**Decisão.** A empresa ainda não existe: "estamos codando pro colosseum". A abertura "vai custar sim uns 2k
dol". Onde ela é aberta está na P5.

| Item | Valor | Origem |
|---|---|---|
| Retirada dos três sócios | 1.500 cada; 4.500 por mês | Informado pelo fundador |
| Infraestrutura | Até 1.000 por mês | Informado pelo fundador |
| Abertura da empresa | Cerca de 2.000, uma vez | Informado pelo fundador |
| Duas auditorias | Zero | Informado pelo fundador |
| Avaliação jurídica | Zero | Informado pelo fundador |
| Antes do dinheiro real | 7.500 com um mês de devnet; 5.500 a mais por mês extra | Parte 2 |

O que não tem preço nos arquivos: a infraestrutura item por item (dois provedores, acesso pago à rede, X); os
aparelhos físicos de assinatura; as auditorias das fases seguintes; uma licença, se a avaliação jurídica apontar
para uma (seção 7.4); e uma reserva para devolver dinheiro de usuário em caso de falha da casa.

### 6.5 O método e os documentos que vêm depois

O método do projeto tem uma ordem: plano de negócio, apresentação resumida, protótipo de telas, resumo de
produto, plano técnico, roteiro de etapas e, só então, código. O resumo de produto e o plano técnico ainda não
existem (FATO, repositório, 5/out/2026). O documento de design descreve uma direção anterior à aprovada e
precisa ser reescrito (FATO, revisão de viabilidade).

Há um atrito entre o método e o hackathon: o método manda esperar esses documentos, e a equipe já está
escrevendo código. A leitura proposta: o que se escreve para o hackathon é demonstração, na devnet. O programa
que vai guardar dinheiro real segue os documentos, que partem deste plano.

## 7. Regulação

Este capítulo não é parecer. **Decisão.** A avaliação jurídica é feita pelo fundador e por colegas, sem custo.
**Decisão.** O acesso é "100% onchain da solana, via wallet, sem kyc", e não há bloqueio de país: "Por enquanto
não, e ainda não sabemos". O texto abaixo diz o que foi lido na fonte, o que não foi conferido e o que a
avaliação precisa responder.

### 7.1 O que foi lido na fonte

- **Resolução CMN nº 5.298, de 24/4/2026** (FATO, texto integral, Banco Central). Proíbe "a oferta e a
  negociação, no país, de contratos derivativos" ligados a evento esportivo, a jogo on-line e a evento de
  "qualquer outra temática que, a critério da Comissão de Valores Mobiliários, não seja representativa de
  referencial econômico-financeiro". O art. 4º alcança a oferta, no país, de derivativos negociados no exterior.
- **Nota Técnica SEI nº 2958/2026, do Ministério da Fazenda** (FATO, texto integral). Trata mercados de previsão
  como exploração ilegal de aposta de quota fixa. Diz que o enquadramento "não decorre da nomenclatura", aponta
  a "ausência de procedimentos robustos de identificação de usuários (KYC)" e sugere bloquear o acesso por
  brasileiros.
- **O bloqueio.** A Anatel confirmou em 24/4/2026 que notificou as operadoras (FATO). A lista dos 27 sites saiu
  na imprensa (FATO SECUNDÁRIO, Exame e Folha) e inclui duas plataformas de cripto: Hedgehog Markets, que roda
  na Solana, e Predict.fun. Ser on-chain e sem cadastro não tirou ninguém da lista (INFERÊNCIA).
- **Medida Provisória nº 1.394, de 25/9/2026** (FATO, texto lido no site do Planalto em 5/10/2026). A ementa:
  "Proíbe a exploração, a oferta, a intermediação e a publicidade de loterias de apostas de quota fixa no
  território nacional". Os pontos que tocam o plano:
  - Art. 1º: a proibição vale "inclusive quando realizadas por agente sediado no exterior que as ofereça a
    pessoa localizada no território nacional", e "abrange as apostas sobre eventos reais de temática esportiva e
    sobre eventos virtuais de jogos on-line".
  - Art. 3º, I: aposta de quota fixa é o "ato por meio do qual se coloca determinado valor em risco na
    expectativa de obtenção de prêmio cujo montante é definido por fator de multiplicação".
  - Arts. 4º e 6º: as autorizações existentes se extinguem em trinta dias, e novas ficam vedadas.
  - Art. 14: instituições financeiras e de pagamento não podem "processar, liquidar ou viabilizar transações
    destinadas a loterias de aposta de quota fixa".
  - Art. 16: veda comunicação, publicidade, propaganda, marketing e patrocínio, inclusive "todo conteúdo que
    oferte, promova, divulgue ou facilite o acesso" e seja "direcionado ao público brasileiro".
  - Arts. 19 a 23: provedores e lojas de aplicativos devem impedir a circulação, com multa de até 10% do
    faturamento do grupo no país, limitada a 50 milhões de reais por infração; a Fazenda e a Justiça podem pedir
    o bloqueio de sites.
  - Art. 28: perdimento, em processo administrativo, dos valores em contas bloqueadas de operador irregular.
  - Art. 29: revoga o Capítulo V da Lei 13.756/2018 e, da Lei 14.790/2023, a lei das apostas, os arts. 1º a 21,
    22 a 24, 25 a 40, 43 a 48 e 54. Art. 30: em vigor na data da publicação.
- **Leis 14.478/2022 e 9.613/1998** (FATO, Planalto). A primeira exige autorização de quem faz, "em nome de
  terceiros", "custódia ou administração de ativos virtuais". A segunda põe entre os obrigados a identificar
  clientes quem explora "sistemáticas de captação de apostas com pagamento de prêmios".
- **Fora do Brasil** (FATO, lidos pela revisão de conformidade). A autoridade europeia de mercados declarou em
  3/7/2026 que contratos de evento ligados a certas referências financeiras são instrumento financeiro e não
  podem ser vendidos ao varejo. O regulador americano de derivativos multou a Polymarket em 2022 e escreveu que
  a regra vale "regardless of the technology used"; um dos exemplos era uma pergunta de preço de cripto.

### 7.2 O que não foi conferido

1. **A tramitação da medida provisória no Congresso.** Medida provisória vale desde a publicação e depende do
   Congresso. Não se conferiu se ela foi convertida em lei, alterada ou perdeu a validade.
2. **O Decreto nº 13.128, de 2026**, anotado na página da medida. Não foi lido.
3. **Se um pote sobre fato gravado na rede é "aposta de quota fixa".** Os dois lados, sem parecer. A definição
   fala em prêmio "definido por fator de multiplicação", e no pote o retorno só é conhecido quando as apostas
   fecham. Por outro lado, a Nota Técnica 2958 descarta argumentos de formato. É o primeiro ponto da avaliação.
4. **A regra complementar da CVM à Resolução 5.298.** Não encontrada.
5. **O prazo de 30/10/2026** para pedidos de autorização de prestadoras de serviços de ativos virtuais (FATO
   SECUNDÁRIO; não conferido na norma). Só importa se a resposta ao item 3 da seção 7.6 for sim.

### 7.3 O que isso pode significar para quem mora no Brasil

É a segunda tensão. O documento não conclui; aponta três coisas que os textos dizem.

- **Os dois textos citam quem opera de fora do país.** O art. 1º da medida provisória fala em agente sediado no
  exterior, e o art. 4º da Resolução 5.298, em oferta no país de derivativos negociados fora.
- **Onde as pessoas trabalham conta.** A Polymarket internacional é operada por uma empresa do Panamá. A
  imprensa relatou que a equipe trabalhava em Nova York (FATO SECUNDÁRIO, Wired, 17/7/2026). O estado de Nevada
  incluiu a empresa do Panamá numa ação civil (FATO, Gaming Control Board, 16/1/2026).
- **A divulgação também está no texto.** O art. 16 precisa ser confrontado com o programa de parceiros, as
  publicações no X e o material em português.

O risco pessoal de sócios residentes no país é a pergunta que só a avaliação responde.

**O padrão do setor.** Nas plataformas lidas, "sem KYC" quer dizer: sem identificação na entrada, com bloqueio
de países pelo endereço de internet, triagem de carteiras contra listas de sanção e direito de pedir
identificação depois (INFERÊNCIA da revisão de conformidade). A Polymarket põe o Brasil na lista de "só fechar
posição" (FATO, documentação). Não foi encontrada plataforma comparável com equipe declaradamente brasileira.

**Objeções registradas (OBJ-17 e OBJ-20).** A revisão propõe bloqueio de países desde o primeiro dia de
dinheiro real, nenhuma campanha no Brasil até a avaliação, e a definição do setor para "sem KYC". As decisões
valem.

### 7.4 Estruturas que plataformas parecidas adotaram

| Estrutura | Quem | O que custou ou o que aconteceu |
|---|---|---|
| Empresa no exterior, sem licença, com bloqueio de países | Polymarket e Limitless, ambas por empresas do Panamá | A Polymarket foi bloqueada por reguladores de mais de dez países e incluída na ação de Nevada (FATO e FATO SECUNDÁRIO) |
| Bolsa regulada | Kalshi | Identifica todos os usuários. Não evitou as ações de estados americanos |
| Licença de jogo no exterior | BetDEX, na Ilha de Man | Ilha de Man: 5.250 libras no pedido e 36.750 por ano. Curaçao: 4.592 euros e 47.450 por ano (FATO SECUNDÁRIO, fonte comercial, mai/2026). Traz identificação e regras contra lavagem |
| Bloquear o próprio país | A Polymarket bloqueia os Estados Unidos | A equipe continua no país |
| Fundação | | Nenhum caso encontrado em fonte primária |

### 7.5 Empresa e Brasil

**Decisão (P5), de 5/10/2026: onde abrir a empresa e como tratar o Brasil.**

**O que está sendo decidido.** O país da empresa e o que o site faz com visitantes do Brasil no dia do dinheiro
real: nada, bloqueio, e com ou sem material em português.

**Por que é uma decisão.** Sem empresa não há termos de uso, conta em corretora nem venda do token B (OBJ-18).
E o país define quais das regras acima pesam.

**Exemplo.** Só a anuidade da licença de Curaçao, 47.450 euros, dá cerca de 3.950 euros por mês. O custo inteiro
da operação é de 5.500 dólares por mês.

| Opção | Custo em dinheiro | Custo de outro tipo |
|---|---|---|
| (a) Abrir já, sem licença, e Brasil sem bloqueio | Cerca de 2.000 | Em bloqueio e identificação, é a decisão de hoje. Com a empresa no exterior, é o caminho da primeira linha da tabela 7.4, com os sócios no país da regra mais recente |
| (b) O mesmo, com bloqueio do Brasil e dos países que a avaliação listar | Cerca de 2.000 | Perde o público brasileiro. O bloqueio é contornável; a autoridade francesa de jogos considerou isso insuficiente (FATO, comunicado de 17/7/2026) |
| (c) Licença de jogo no exterior | Dezenas de milhares por ano | Exige identificar o usuário, o que contraria "sem kyc". Não cabe no orçamento |
| (d) Avaliar primeiro, abrir depois | Zero até a avaliação | A abertura espera a avaliação e pode mover a data da rede principal |

**Recomendação, aprovada: a ordem da opção (d), com o bloqueio construído como interruptor.** Este documento não diz qual
estrutura a lei permite. Recomenda a ordem: primeiro a avaliação, que não custa dinheiro; depois o país e a
empresa, que dependem dela. O mês de devnet, sem dinheiro real, é o tempo para isso. E o bloqueio por país entra
no site como uma chave de liga e desliga, para a resposta da avaliação valer no mesmo dia.

### 7.6 O que a avaliação jurídica precisa olhar

1. O pote é aposta de quota fixa, jogo de azar, loteria não autorizada, derivativo ou nenhum deles?
2. Qual é o risco pessoal de sócios residentes no Brasil, com a empresa fora e com ou sem bloqueio do país?
3. O cofre do programa, com a equipe controlando a atualização e cobrando taxa, é "custódia ou administração" em
   nome de terceiros? A empresa é obrigada a identificar clientes?
4. Perguntas de preço são derivativo no Brasil ou opção binária na Europa? Queima, liquidez travada e stake
   são "referencial econômico-financeiro"? Cabe consulta à CVM?
5. Quais países bloquear no primeiro dia, e se o Brasil entra.
6. Parceiros, publicações no X e material em português diante do art. 16 da medida provisória.
7. Patrocinador não divulgado: a empresa pode receber de pagador que só a equipe conhece? Dinheiro vindo do
   Cloak cria dever adicional?
8. A fase de devnet, com dinheiro de teste e pontos, e a participação no hackathon estão fora dessas regras?
9. Esportes, na fase 2: é a categoria que a Resolução 5.298 e a medida provisória citam pelo nome.
10. A tramitação da medida provisória e o Decreto 13.128.
11. Termos de uso, avisos de risco e política de privacidade: o que precisa existir antes do dinheiro real. A
    lista de investidores, tratada pelo fundador como contatos de negócio, entra aqui (Parte 2, seção 6.4).
12. A tesouraria: a corretora que vender Bitcoin vai perguntar a origem do dinheiro.

Os pontos sobre os tokens estão na Parte 3, seção 7.1.

## 8. Riscos

A gravidade é INFERÊNCIA. **Crítica** pode derrubar o negócio ou custar dinheiro de usuário. **Alta** compromete
o lançamento ou a confiança. **Média** custa tempo ou dinheiro.

| Risco | Gravidade | O que reduz | O que fazer se acontecer |
|---|---|---|---|
| Um erro no programa com dinheiro real dentro | Crítica | Duas auditorias, teto global e os testes que conferem as contas | Pausar as apostas novas; pagamentos e devoluções seguem. Corrigir e publicar o ocorrido |
| A chave de atualização roubada, ou usada por uma pessoa só | Crítica | Duas de três, aparelhos físicos e espera pública (P3) | A espera dá tempo de avisar. As outras duas assinaturas trocam a chave comprometida |
| Os dois serviços parados, e um SIM verdadeiro vira NÃO | Crítica | Provedores diferentes, alerta ao CTO, janela de 6 horas | A equipe anula na janela e todos recebem de volta. Não há reserva para indenizar além disso |
| A regra brasileira alcança o pote ou os sócios | Crítica | Avaliação jurídica antes do dinheiro real; bloqueio pronto como interruptor (P5) | Ligar o bloqueio. Quem apostou sempre consegue receber |
| A demanda não aparece | Crítica | Beta com pontuação, parceiros e a medida de quem volta a apostar | **Decisão:** aos 180 dias na rede principal, com volume mensal de até 45 mil dólares, a empresa para ou muda de rumo ("ok"). Parar no mês 6 limita a perda a 36.348; seguir até o mês 24 leva a 116.565 (Parte 2) |
| O prazo estoura: critérios não cumpridos no início do mês 2 | Alta | A ordem de construção (P1) e a regra da data (P2); perguntar já o prazo às duas empresas | A data anda. Cada mês custa 5.500 |
| A auditoria aponta falha grave perto da data | Alta | Mandar o núcleo cedo para revisão | Corrigir e pedir nova conferência. A data anda |
| Poucas pessoas: um sócio fica indisponível | Alta | Termo entre os sócios (P6), segunda pessoa para o alerta, conhecimento em documento | Parar de abrir perguntas novas. As abertas resolvem e pagam sozinhas |
| O leitor de preço atrasa, ou a Pyth falha | Alta | Construir primeiro; conferir a Pyth na devnet | Abrir com os quatro tipos prontos (Parte 1). Pergunta sem preço legível é anulada |
| Alguém empurra o resultado de uma pergunta de pote grande | Alta | Só tipos em que empurrar custa dinheiro; metas caras; teto global | Não há correção depois: o resultado lido é o verdadeiro. Rever o tipo e antecipar o teto por pergunta |
| O site é tomado e passa a pedir assinaturas maliciosas | Alta | Chave física, além da senha, para entrar no domínio, na hospedagem e no repositório; nenhum código de fora na página de aposta | Tirar o site do ar e avisar pelos canais oficiais. O dinheiro nos cofres não é afetado |
| O Cloak não esconde o que o texto diz, ou recusa um saque | Média | Dizer "não divulgado"; a equipe sempre sabe quem é o patrocinador | Orientar o patrocinador. O pote não depende do Cloak |
| A gratuidade das auditorias não cobre as fases seguintes | Média | Confirmar por escrito o escopo e o prazo | Orçar. Esse gasto não está no modelo |
| O emissor do USDC congela um cofre | Média | Um cofre por pergunta | Só aquela pergunta para. Avisar os apostadores |

Três leituras. Todo risco crítico tem uma proteção já decidida, e nenhuma está pronta hoje. O risco do prazo
piora os outros: sob pressão de data, um critério vira formalidade. E a casa não tem reserva para devolver
dinheiro quando a falha for dela; o teto global é o que limita esse valor.

## 9. Decisões e objeções

### 9.1 As oito decisões de 5/10/2026

| # | Assunto | Resposta do fundador | O que passa a valer | Seção |
|---|---|---|---|---|
| P1 | O que entra no primeiro mês | "Perfeito, e as auditorias virão depois. Eles não precisam estar dentro dos prazos do hackathon" | Núcleo primeiro. As auditorias vêm depois do hackathon e antes da rede principal | 3.3 |
| P2 | O que é "pronto", e a regra da data | "isso aí" | Os três critérios cumpridos por inteiro; se faltar, a data anda | 3.4 |
| P3 | Quem assina a carteira | "na prática real somos três sócios, então esse plano é bom" | Duas de três, com os três sócios, aparelhos físicos e espera pública | 4.2 |
| P4 | O teto global | "concordo" | Baixo, subindo por degraus. O primeiro valor ainda será fixado | 4.4 |
| P5 | País da empresa e Brasil | "perfeito e concordo" | Avaliação jurídica primeiro; bloqueio por país construído como interruptor | 7.5 |
| P6 | Acordo com o Ronaldo | "sim, isso, e vamos deixar tudo em nome da empresa" | Termo curto agora, acordo completo com a empresa. Código, programa e chaves em nome da empresa | 6.3 |
| P7 | Os 30% quando o prêmio volta | "perfeito" | A casa fica com eles no pote de um lado só e devolve na pergunta anulada por falha dela | 4.8 |
| P8 | Guarda da tesouraria | "perfeito, isso aí" | USDC em carteira separada no começo; Bitcoin depois, com regra escrita | 4.9 |

### 9.2 As objeções da v0.0.1 que tocam a construção

A v0.0.1 registrou 29 objeções. As Partes 1, 2 e 3 trataram 24. As cinco que faltavam são desta parte: OBJ-05,
17, 19, 20 e 26. Outras cinco voltam aqui porque a construção as toca.

| Objeção | Assunto | Situação | O que foi decidido ou proposto |
|---|---|---|---|
| OBJ-05 | Na saída antecipada, a penalidade voltava a quem a pagou | Adiada | Não há saída no MVP. A correção fica guardada com a fórmula, para a fase 2 |
| OBJ-17 | Bloqueio de país adiado, com a equipe no Brasil | Mantida | Sem bloqueio por enquanto. A P5 propõe deixá-lo pronto como interruptor |
| OBJ-18 | Sem país e sem empresa não há termos, tesouraria nem venda de token | Mantida | A empresa ainda não foi aberta (P5) |
| OBJ-19 | Dependência do sócio técnico, sem acordo escrito | Respondida em parte | A reescrita é feita aqui e o CTO está definido. Falta o papel (P6) |
| OBJ-20 | "Sem KYC" diante de deveres legais citados | Mantida | A decisão vale. É o ponto 3 da avaliação jurídica |
| OBJ-22 | Teto por pergunta | Adiada | Entra o teto global. O teto por pergunta fica para fase futura |
| OBJ-23 | Cloak e SODAX dentro do site | Mantida | Integrados, em páginas próprias, fora da página de aposta |
| OBJ-25 | A falha do serviço faz um SIM virar NÃO | Resolvida em parte | Dois serviços, janela e "Anulada". Sem botão público e sem recompensa a quem resolve |
| OBJ-26 | Programa novo, sem auditoria, com muitos sistemas novos | Respondida, com a tensão do prazo | Três critérios e duas auditorias. A rede principal ganhou data |
| OBJ-29 | O hackathon estava sendo deixado de lado | Resolvida | "estamos codando pro colosseum" |
| Nova, seção 3.2 | Um mês não comporta construir tudo e concluir duas auditorias | Registrada | A decisão vale. P1 e P2 |
| Nova, seção 4.5 | O pagamento enviado pela casa, e não pedido por quem recebe | Registrada | A decisão vale, com o destino sempre na carteira que apostou |
| Nova, seção 6.2 | Quem faz a avaliação jurídica é sócio e mora no país avaliado | Registrada | A decisão vale. Conclusão por escrito, lida por um colega de fora |

### 9.3 O que a pesquisa não achou

- O prazo, o escopo e o formato das duas auditorias, e o nome da segunda empresa.
- A data do hackathon em fonte oficial, e as regras da trilha de privacidade.
- Quem guarda hoje a chave de atualização do programa na devnet.
- O nome e o papel do terceiro sócio.
- Se a Pyth funciona na devnet do jeito que o leitor de preço precisa.
- O tamanho do programa novo com as decisões atuais.
- Uma plataforma comparável com equipe declaradamente brasileira, e um mercado de previsão operado por fundação.
- A tramitação da Medida Provisória 1.394 no Congresso e o texto do Decreto 13.128.
- O custo da infraestrutura, item por item.

### 9.4 O que vem depois deste plano

1. O primeiro valor do teto global e os nomes de quem assina a carteira.
2. A avaliação jurídica, pela lista da seção 7.6, e o termo entre os sócios.
3. A pergunta às duas empresas de auditoria: prazo, escopo e de que versão precisam.
4. A apresentação resumida do plano, que é o passo seguinte do método.
5. O documento de design reescrito, o resumo de produto e o plano técnico.
6. O roteiro de etapas e a construção, começando pelo núcleo do pote e pelo leitor de preço.
