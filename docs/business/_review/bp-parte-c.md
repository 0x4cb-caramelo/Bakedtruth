<!-- BP v0.0.1, Parte C -->

## 11. Tecnologia e arquitetura

Este capítulo explica as peças técnicas do Baked Market para quem não programa. Cada peça vem com o que é, por que
existe e um exemplo. Onde é preciso entrar em detalhe, há um trecho "Para quem vai construir", que o leitor não
técnico pode pular sem perder o fio. Os nomes das instruções do programa aparecem só entre parênteses, depois da
explicação em português.

### 11.1 O que existe hoje

Existe um programa pronto e testado, mas ele faz outra coisa. **Programa** é o código que roda na Solana (a
blockchain em que o produto roda) e guarda o dinheiro dos potes. O programa atual tem 1.717 linhas na linguagem
Rust, 138 testes e nove leitores on-chain, e não tem nenhuma chave de administrador (FATO, repositório, lido em
4/out/2026). **Leitor on-chain** é a parte do programa que abre uma conta da Solana, lê um número ou uma chave e
responde sim ou não, sem ninguém informar nada. Exemplo: o leitor de queima lê a oferta de um token e compara com a
meta.

O que esse programa faz bem é exatamente o que o Baked Market precisa: ler a rede e gravar o resultado. As duas
peças que cuidam disso somam 300 linhas: a que reúne os nove leitores tem 234 e a que grava o resultado tem 66
(FATO, repositório, 4/out/2026). A resolução é aberta a qualquer pessoa e é definitiva numa só operação.

O que ele não é: um mercado de previsão em pote. No programa atual, um patrocinador vende, com desconto, fichas de
SIM como recompensa por uma meta. **Decisão.** "ele foi montado errado, não é essa a proposta dele ... queremos que
seja um mercado de previsão".

Três fatos sobre o estado do código que o leitor precisa ter em mente (FATO, repositório e arquivo `LICENSE`,
4/out/2026):

- O repositório se descreve como protótipo de hackathon, na **rede de testes (devnet)**, que é a rede de ensaio, com
  dinheiro de mentira. Nada dele roda na **rede principal (mainnet)**, em que o dinheiro é real.
- O código não passou por **auditoria**, que é a revisão do programa por uma empresa de segurança independente.
- A licença é MIT, em nome de Ronaldo Pereira, o sócio técnico, e 11 dos 16 registros de alteração listados são
  dele. A consequência para a equipe está na seção 13.3.

### 11.2 O programa novo

O Baked Market pede um programa novo, escrito ao lado do atual, e não um remendo. Do atual aproveita-se a parte de
ler e resolver. Sai a parte econômica inteira. O programa novo é estimado em 1.500 a 2.500 linhas (INFERÊNCIA,
relatório de viabilidade, 4/out/2026).

| Situação | Peça | Em linguagem simples |
|---|---|---|
| Fica | Os nove leitores e as conferências de cada tipo de pergunta | A parte que lê a rede e diz se a meta foi cumprida |
| Fica | A resolução (`resolve`) | Qualquer pessoa aciona; o programa lê a rede e grava o resultado; não há volta |
| Fica | A trava das apostas quando o fato acontece (`require_trading_open`) | Se a meta já foi cumprida, ninguém mais aposta; no programa novo, a mesma trava vale para a saída |
| Fica | O cofre de cada pergunta e as transferências conferidas | O dinheiro só sai com a assinatura do próprio programa |
| Fica | Um aviso público por operação (eventos) | O site monta o histórico a partir desses avisos |
| Fica | O método de teste aleatório de invariantes | Um robô faz milhares de sequências de operações e confere, a cada passo, se a conta fecha |
| Muda | O registro de cada pergunta | Saem sete campos do modelo antigo; entram o total do SIM, o total do NÃO, o prêmio neutro, as penalidades de cada lado, a taxa, o fechamento e o estado |
| Muda | A abertura de pergunta | Hoje qualquer um abre; passa a ser só a equipe, em dois passos, com teto de pote |
| Muda | Os prazos | De contagem de blocos para data e hora |
| Sai | Oito instruções do modelo antigo | Comprar SIM com desconto, criar e destruir pares de fichas, pôr e tirar liquidez, trocar fichas, sacar orçamento e resgatar fichas |
| Novo | Configuração | Quem é da equipe, qual é a taxa, para onde ela vai, se o sistema está pausado |
| Novo | Apostar (`place_bet`) e o registro de cada apostador | O valor que uma carteira pôs em cada lado, em nome dela, sem virar token |
| Novo | Resgatar (`claim`) e devolver | O vencedor retira a sua parte; o pote de um lado só e a pergunta anulada devolvem |
| Novo | Taxa contabilizada e envio a um destino único | A taxa fica anotada em cada pergunta e segue para uma só conta |
| Novo | Pedido de pergunta com depósito travado; prêmio neutro; aposta de patrocinador | A segunda trilha de dinheiro (ver seção 3.7) |
| Novo | Sair antes (`exit_position`) | A saída antecipada com penalidade (ver seções 3.6 e 11.6) |
| Novo | Pausa em três níveis | Normal; sem apostas novas; sem apostas nem saídas |
| Novo | Leitor de preço pela Pyth | Para perguntas de preço do SOL e do Bitcoin (ver seção 4.4) |
| Depois | Leitores para Token-2022; formatura no pump.fun | Fora do primeiro lançamento (ver seção 12.4) |

Fonte da tabela: briefing do modelo de pote, seção 4, e relatório de viabilidade, seção 1.1 (FATO quanto ao que
existe; INFERÊNCIA quanto ao que é novo).

**A conta que tem de fechar sempre.** O cofre de uma pergunta precisa ter, em qualquer momento, pelo menos tudo o
que o programa deve. Exemplo: com 300 USDC no SIM e 700 no NÃO, o programa deve 1.000; o cofre tem de ter 1.000 ou
mais. Se alguém mandar 5 USDC direto ao cofre, por fora, o cofre passa a ter 1.005 e a dívida continua 1.000: sobra
nunca é problema, falta é. Esse tipo de regra se chama invariante: uma conta que vale antes e depois de toda
operação. No programa atual, um teste aleatório já confere as invariantes do modelo antigo depois de cada
operação. O programa novo mantém o método e troca as contas.

#### Para quem vai construir

A invariante proposta pela revisão técnica, conferida no fim de toda instrução, com reversão da transação se não
fechar (INFERÊNCIA, relatório técnico e de segurança, item S7):

```text
saldo contabilizado = pote do SIM + pote do NÃO + prêmio neutro
                    + penalidades do SIM + penalidades do NÃO + taxa devida
saldo real do cofre ≥ saldo contabilizado
```

Os saldos são contabilizados em campos do registro da pergunta, e não lidos da conta de token, como o programa
atual já faz de propósito. Os estados da pergunta são explícitos (Aberta, Fechada, Resolvida ou Anulada), em vez de
conferências soltas de data. O teste aleatório de invariantes é refeito para o pote, com a saída no sorteio, e
confere três propriedades: a soma dos resgates mais a taxa nunca passa do cofre; a devolução nunca passa da aposta;
fatiar uma entrada ou uma saída em várias operações nunca melhora o resultado.

### 11.3 Contas e dinheiro

**Um cofre por pergunta.** **Cofre** é a conta de USDC de uma pergunta, que pertence ao programa; só ele assina a
saída de dinheiro. Ter um cofre por pergunta isola o risco: um erro ou um bloqueio atinge uma pergunta, não todas.
O cofre fica num endereço que o próprio programa deriva, e ninguém consegue criá-lo antes para travar a abertura.

**Um registro por apostador.** Cada aposta cria um registro em nome da carteira. Toda conta nova na Solana exige um
depósito de aluguel, devolvido quando a conta fecha: cerca de 0,0017 SOL por registro (INFERÊNCIA, relatório
técnico, item C2, 4/out/2026). Quem paga é o apostador, e a tela precisa dizer isso: numa aposta de 1 USDC, o
depósito é uma parte relevante do valor.

**Quem chega só com USDC não consegue apostar.** A rede cobra as suas taxas em SOL. Quem traz USDC de outra
blockchain, ou saca de um serviço de privacidade para uma carteira nova, chega sem SOL para a taxa da rede e para o
depósito de aluguel. A proposta para o MVP é avisar na tela, e não oferecer "nós pagamos a taxa": isso criaria um
serviço da casa que vê quem é quem e gasta dinheiro a pedido de qualquer um (INFERÊNCIA, relatório técnico, item
P2).

**Pagamento sempre puxado por quem recebe.** O resgate, a saída e a devolução do patrocínio são acionados por quem
vai receber, que assina e indica a própria conta de USDC. A equipe e o serviço agendado nunca "empurram" dinheiro
para a conta de alguém. Motivo: no padrão de token usado, o dono de uma conta pode reatribuí-la, e uma operação que
dependa da conta de um terceiro pode ser travada por ele (FATO, documentação do repositório).

**Só USDC, com endereço fixo.** **Decisão.** "A moeda vai ser usdc, vamos abandonar a ideia de sol." O programa
aceita um único token, o USDC emitido pela Circle, gravado no código. USDC enviado direto ao endereço do cofre, por
fora de uma operação do programa, não vira aposta nem prêmio: a tela nunca mostra o endereço do cofre como destino
de pagamento. Há um risco que vem com a moeda (R-14): o emissor pode congelar contas de USDC (INFERÊNCIA, a
conferir; a conta de registro do USDC não foi lida). O cofre por pergunta limita o estrago a uma pergunta.

**Três resultados.** Além de SIM e NÃO, a revisão técnica propõe um terceiro: **pergunta anulada**, que é o
resultado em que a pergunta não pôde ser decidida e as apostas voltam. Exemplo: a conta que seria lida deixou de
existir, ou o programa de terceiros que a mantém mudou de formato (R-09). Sem esse terceiro resultado, uma leitura
impossível vira NÃO pela regra do prazo. É proposta; depende do aval do fundador e do sócio técnico (ver seção
16.2).

**Prazos em data e hora.** O programa atual mede prazo em blocos, e o tempo de um bloco varia: o projeto mediu 235
milissegundos na rede de testes, contra 400 nominais (FATO, documentação do repositório). Uma regra como "fecha 24
horas antes" pede relógio de verdade. O programa novo guarda o fechamento e o fim em data e hora.

### 11.4 Chaves e poderes

O programa atual não tem chave de administrador: qualquer um cria uma pergunta, não há taxa nem pausa. O programa
novo terá chaves, porque a equipe abre as perguntas, cobra a taxa e precisa poder parar o sistema num defeito. Por
isso o plano não diz "ninguém controla": diz quem pode o quê.

Quatro definições, antes do quadro:

- **Chave de atualização** é a carteira que pode trocar o código do programa. Quem a tem pode esvaziar todos os
  cofres, porque todos são assinados pelo programa.
- **Multisig** é uma carteira que só assina quando várias pessoas aprovam. No formato 2 de 3, duas de três pessoas
  precisam assinar.
- **Trava de tempo** é a espera obrigatória entre aprovar e executar uma mudança, para o público ver antes.
  Exemplo: uma mudança de taxa só vale 48 horas depois de aprovada.
- **Compilação verificável** é a prova pública de que o código que roda na rede é o do repositório. Qualquer pessoa
  confere com uma ferramenta.

Quadro de poderes proposto (INFERÊNCIA, relatório técnico, seção 4, 4/out/2026):

| Poder | Quem | Limite gravado no código |
|---|---|---|
| Atualizar o programa | Multisig 2 de 3 com trava de tempo | Compilação verificável a cada versão |
| Abrir pergunta | Uma chave da equipe propõe, outra aprova | Teto de pote obrigatório; só os tipos permitidos |
| Mudar a taxa padrão | Multisig com trava de tempo | Teto constante; não afeta pergunta já aberta |
| Enviar as taxas ao destino | Qualquer pessoa | Só para a conta gravada na configuração |
| Aceitar ou recusar patrocínio | Uma chave da equipe | O aceite aplica o dinheiro na mesma transação; a recusa só libera o saque pelo patrocinador |
| Pausar | Uma chave da equipe | Nunca bloqueia resgate, devolução nem resolução |
| Despausar | Multisig | Nenhum |
| Resolver | Qualquer pessoa | Nenhum |

**O risco que este quadro trata (R-01, crítico).** Hoje os roteiros de implantação usam uma carteira guardada num
arquivo de computador. Se a rede principal seguisse o mesmo padrão, o dinheiro de todos os usuários dependeria de
um arquivo num notebook. Quem tem essa chave hoje: não encontrado [A confirmar, AC-18]. A recomendação da
referência técnica é multisig 2 de 3, com chaves em dispositivos físicos e trava de tempo; hoje não há terceira
pessoa definida (FATO quanto à recomendação e à lacuna, relatório técnico, item K1). Duas pessoas não fazem um 2 de
3.

**Por que não travar o código para sempre.** Um programa imutável não pode ser alterado por ninguém, nem para
roubar, nem para corrigir. Sem auditoria, travar o código é travar os defeitos. A formulação proposta é:
"atualizável por multisig, com espera pública, até a auditoria".

**A divisão da taxa em quatro fica fora do programa.** **Decisão.** "25% para um treasure btc da empresa, 25% para
operação (não deve ser todo o custo que foi estimado), 25% recompra e queima do nosso token em ico privado e, 25%
para fundo de prêmios". A proposta técnica não muda o destino, só o lugar em que a divisão acontece: o programa
junta a taxa de cada pergunta e a envia para uma única conta, que pertence ao multisig; a divisão em quatro é feita
pelo multisig, com registro público. Motivo: trocar USDC por Bitcoin ou recomprar token dentro do programa traria
corretoras de terceiros e preço manipulável para dentro do código que guarda os potes (INFERÊNCIA, relatório
técnico, item K5).

#### A opção avançada de fechamento, com dupla confirmação e registro

**Decisão.** O fechamento padrão é em 80% da duração, com mínimo de 24 horas; menos de 24 horas só como "opção
avançada", "com um double cheque para confirmar e log da operação de quem aprovou". A regra do produto está na
seção 3.5. Aqui fica como ela se constrói (INFERÊNCIA, pesquisa de saída, fechamento e resolução, seção 2.4, e
relatório técnico, item K7):

1. A configuração do programa guarda a lista das chaves da equipe.
2. Ao abrir uma pergunta, o programa exige pelo menos 24 horas entre o fechamento e o fim. Se o prazo for menor, só
   aceita com uma segunda assinatura, de uma chave diferente da primeira.
3. O registro fica em dois lugares: a pergunta guarda para sempre quem aprovou o fechamento curto, e o programa
   emite um aviso on-chain com quem criou, quem aprovou e quantas horas ficaram.
4. Na tela, a pergunta mostra um selo "fechamento curto" com as duas carteiras.

O cuidado que a revisão técnica acrescenta: se as duas chaves estiverem no mesmo computador ou com a mesma pessoa,
a dupla confirmação é de fachada, e o registro on-chain mostra duas chaves como se protegesse. As duas assinaturas
devem vir do multisig, de pessoas diferentes. Exemplo: uma pergunta de dois dias que feche 6 horas antes do fim só
abre se a pessoa A propuser e a pessoa B aprovar, e as duas carteiras ficam gravadas na pergunta.

### 11.5 A resolução na prática

**Decisão.** A resolução é acionada pela plataforma: "talvez a gente resolva com um sistema cron pela nossa
plataforma, acionando o resolver." A visão de produto está nas seções 4.6 e 4.7; aqui fica a arquitetura.

**O que é um cron.** **Serviço agendado (cron)** é um programa de computador que acorda de tempos em tempos e faz
uma tarefa sozinho. Aqui, a tarefa é chamar a resolução. Exemplo: a cada minuto o serviço confere se alguma
pergunta já pode ser resolvida e, se pode, envia a transação. O serviço não decide nada: quem decide é o programa,
lendo a rede. A chave do serviço não tem poder nenhum, porque a resolução é aberta a qualquer carteira.

**Por que ele precisa de redundância.** Pela regra atual do programa, se o prazo passou, o resultado é NÃO. Meta
cumprida no dia 10 e ninguém aciona a resolução até o dia 30: o resultado gravado é NÃO (FATO, código do programa,
4/out/2026). O programa não tem como descobrir, depois, quando a meta foi cumprida. Um serviço único fora do ar
transforma um SIM verdadeiro em NÃO, para sempre, sem disputa. E há um incentivo torto: quando o fato acontece,
quem apostou no NÃO ganha se ninguém perceber até o prazo.

A arquitetura proposta tem cinco peças (INFERÊNCIA, pesquisa de saída, fechamento e resolução, seção 3.4, e
relatório técnico, item R1):

| Peça | O que é | Para que serve |
|---|---|---|
| Serviço principal, sempre ligado | Um programa da equipe num servidor. Acorda por aviso, quando a conta medida muda, e por varredura, a cada minuto | Resolver em minutos, sem depender de ninguém lembrar |
| Segundo agendador, em outro provedor | O mesmo código, em outra empresa de hospedagem, com outro acesso à rede e outra chave, rodando a cada 5 a 15 minutos | Se o principal cair, a resolução atrasa minutos, não dias |
| Botão público "Resolver" | Aparece no site, para qualquer visitante, quando a simulação diz que a pergunta já pode ser resolvida | Tirar da equipe a exclusividade de fato |
| Recompensa on-chain a quem resolve | Um valor pequeno, tirado da taxa, pago pelo programa a quem acionar a resolução | Criar interessados que não dependem da casa |
| Alarme e plantão | Um vigia avisa a equipe se uma pergunta estiver "resolvível e não resolvida" há mais de 15 minutos | Uma pessoa atende; quem é essa pessoa está em aberto (seção 13.2) |

**Quanto custa.** Uma resolução custa 5.000 lamports, que são 0,000005 SOL, por assinatura (FATO, documentação da
Solana). Mil resoluções custam 0,005 SOL (INFERÊNCIA, soma). O custo relevante não é a taxa da rede: é o servidor,
o acesso pago à rede e uma pessoa atendendo o alarme.

**Perguntas de época.** **Época** é o "dia" da Solana para contas de rendimento por validação (stake); dura cerca
de dois dias. Nas perguntas que fotografam um valor numa época, a janela para provar o SIM é de cerca de dois dias
(FATO, código do programa). Um fim de semana com o serviço parado e o SIM verdadeiro vira NÃO. Por isso a proposta
é só abrir perguntas de época quando os dois agendadores estiverem no ar.

**Por que a resolução não é embutida na aposta.** A pesquisa inicial propôs que a primeira aposta ou o primeiro
resgate que encontrasse a meta cumprida já gravasse o resultado. A revisão técnica rejeitou: a resolução recusa ser
chamada de dentro de outro programa, de propósito, para ninguém embrulhá-la numa operação de empréstimo relâmpago;
embutida numa aposta, ela furaria a própria trava. Vale a revisão: o site monta a transação com a resolução na
frente, como instrução separada. Pelo mesmo motivo, agendadores que rodam dentro da rede, como o Tuk Tuk, não
conseguem acionar a resolução (FATO SECUNDÁRIO, documentação de um projeto concorrente do Tuk Tuk) [A confirmar,
AC-11].

**O que acontece se falhar.** Hoje, nada devolve o dinheiro: a falha vira NÃO. A referência dos 3% do pote, o
PancakeSwap Prediction, cancela a rodada e devolve 100%, sem taxa, quando o operador falha (FATO, documentação do
PancakeSwap). As propostas para fechar essa lacuna estão na caixa OBJ-25, na seção 4.7: o terceiro resultado
"Anulada", a devolução quando a janela de época é perdida e um plano escrito de indenização. Se a empresa indeniza,
e com que dinheiro, é decisão do fundador (seção 16.1, item 12).

### 11.6 A segurança da saída antecipada

**Decisão.** "saída antes da resolução, vamos fazer agora no mvp." A forma: "a pessoa pode sair antes com ganho
proporcional menor, ou perca proporcional maior, deixando uma penalidade pro pote." A regra e a fórmula estão na
seção 3.6. Esta seção trata só da segurança, e começa por um resumo do mecanismo para o leitor que chegou direto
aqui.

**O mecanismo, em um exemplo.** **Saída antecipada** é desistir da aposta antes da resolução e receber parte do
dinheiro de volta. **Penalidade** é a parte que quem sai deixa para trás. Na fórmula proposta (INFERÊNCIA; os
parâmetros não têm referência de mercado [A confirmar, AC-25]):

```text
devolução   = aposta × (1 − penalidade)
penalidade  = mínimo( 90% ,  5%  +  20% × tempo  +  queda )
tempo       = fração já decorrida da janela de saída (0 na abertura, 1 quando a saída fecha)
queda       = 1 − chance do seu lado na saída ÷ chance do seu lado na sua entrada   (zero se a chance subiu)
```

São três parcelas: um pedágio fixo de 5%; uma parcela que cresce com o tempo, até 20%; e uma parcela que cobra de
quem sai o estrago que a saída faz na chance do próprio lado. Exemplo, no pote da seção 3.3 (300 no SIM, 700 no
NÃO): a Ana tem 100 dos 300 do SIM, entrou com o SIM em 30% e sai com um quarto da janela decorrida. A saída dela
leva o SIM de 300 para 200; no meio do caminho, o SIM tem 250 de 950, ou 26,3%. A queda é 1 − 26,3 ÷ 30 = 12,3%. A
penalidade é 5% + 20% × 25% + 12,3% = 22,3%. De cada 100, a Ana recebe 77,72 e deixa 22,28 no pote (INFERÊNCIA,
conta conferida).

**O furo que a revisão técnica achou.** A penalidade, ao ficar no pote, vira prêmio de quem acertar. Se quem saiu
também é dono do lado vencedor, por outra carteira, ele recebe a própria penalidade de volta, menos a taxa. O
exemplo abaixo usa uma pergunta de resultado controlável e um pote de terceiros com 100 no SIM e 100 no NÃO
(INFERÊNCIA, relatório técnico, item S1; conta conferida pelo coordenador):

| Passo | SIM | NÃO | O que acontece |
|---|---|---|---|
| 1. O dono do resultado põe 900 de verdade no SIM, pela carteira A | 1.000 | 100 | Ele tem 90% do lado do SIM |
| 2. Põe 2.000 "de mentira" no SIM, pela carteira B | 3.000 | 100 | A tela mostra SIM com 96,8%; o NÃO passa a pagar cerca de 30 por 1 |
| 3. Entram 400 no NÃO, atraídos pelo retorno | 3.000 | 500 | São as vítimas |
| 4. A carteira B sai com 95% da janela decorrida | 1.000 | 500 | Penalidade de 5% + 19% + 17,3% = 41,3%, ou 826,70, que ficam no pote |
| 5. O dono cumpre a meta e a pergunta resolve SIM | | | Pote final de 2.326,70; depois da taxa de 3%, 2.256,90 |

A carteira A recebe 90% de 2.256,90, ou 2.031,20. O dono gastou 900 mais 826,70 de penalidade: 1.726,70. Lucro de
304,50. Sem o golpe, com o pote em 1.000 a 100, o lucro dele seria de 60,30. A diferença saiu dos 400 que entraram
no NÃO. A pesquisa inicial tinha concluído que esse golpe dava "prejuízo certo"; a conta dela supunha que o
golpista tinha só um terço do lado vencedor. Vale a revisão.

> **Objeção registrada OBJ-05 · severidade crítica**
> **Decisão do fundador:** quem sai antes deixa "uma penalidade pro pote".
> **O que a revisão crítica achou:** a penalidade volta ao pote, e quem domina o lado vencedor a recebe de volta.
> A penalidade deixa de ser custo para quem monta o golpe da chance com duas carteiras.
> **Evidência:** no exemplo acima, o golpe rende lucro de 304,50 em vez de 60,30 (INFERÊNCIA, relatório técnico e
> de segurança, item S1, 4/out/2026; conta conferida).
> **Alternativa proposta:** marcar a penalidade pelo lado de quem saiu. Ela vai aos vencedores só se o lado de quem
> saiu perder; se esse lado ganhar, vai ao fundo de prêmios, que abastece outros potes. No mesmo exemplo, o lucro
> de 304,50 vira prejuízo de 417,20. No caso comum, em que sai quem ia perder, a frase "penalidade pro pote"
> continua valendo.
> **Situação:** a decisão vale; a alternativa muda a letra da decisão e fica para o fundador decidir (seção 16.1,
> item 3).

**Os demais achados** (INFERÊNCIA, relatório técnico, seção 2, 4/out/2026):

- **Fuga em massa.** Quando sai uma notícia ruim e um lado inteiro foge, sobra para quem ficou de cerca de um terço
  a 63% do prêmio, conforme a ordem das entradas. Quem entrou cedo num lado pequeno tem uma saída barata para
  sempre.
- **O apostador honesto trancado.** Quando uma carteira grande aposta contra você, a sua chance cai e a sua
  penalidade sobe para 80% a 90%, sem você ter feito nada. O botão "Sair" que mostrava perto de 80 passa a mostrar
  10 a 20.
- **Sair depois do fato.** Se o programa não conferir o estado da pergunta, quem perdeu sai depois de perder, e
  esse dinheiro falta para o último vencedor. A saída precisa chamar a mesma trava das apostas, com a mesma conta
  lida.
- **Corrida.** Entre o usuário ver "recebe 85" e a transação entrar, uma aposta contrária pode levar o valor a 15.
- **Regra que depende da ordem.** A mesma operação, fatiada em várias, paga diferente. É terreno de robô.

**A fórmula revista**, que junta as correções propostas: penalidade marcada por lado; piso de 10% no lugar de 5%;
espera mínima, medida em horas, entre apostar e sair; valor mínimo aceito informado pelo usuário, com a transação
falhando se a conta der menos; posição de patrocinador sem saída; saída desligada em pergunta de preço; e uma chave
por pergunta (`exit_enabled`) que nasce desligada. Nenhum piso foi decidido: o plano mostra a fórmula proposta e a
revista, e os parâmetros dependem de uma simulação com apostadores estratégicos que ainda não foi feita [A
confirmar, AC-25].

A proposta de escrever e testar a saída no MVP, mas com a chave desligada por padrão e ligada pergunta a pergunta,
é a objeção OBJ-04, cuja caixa está na seção 3.6. No roteiro, ela aparece como a fase 4 (seção 12.1).

### 11.7 Site e servidor

**O site hoje lê a rede direto do navegador.** O histórico de cada pergunta é montado no navegador de cada
visitante, sem um servidor no meio. Para ler a rede, o site usa um serviço de **acesso à rede (RPC)**, que é o
serviço pago que deixa o site ler a blockchain e enviar transações. Dois problemas (R-12; FATO quanto ao código,
INFERÊNCIA quanto ao efeito):

1. O endereço público de acesso tem limite por visitante [A confirmar, AC-17]. Uma página inicial com dezenas de
   perguntas, cada uma buscando o próprio histórico, estoura o limite e fica em branco no dia do lançamento.
2. Uma chave paga posta no navegador é pública: qualquer um copia e gasta a cota.

A correção é um componente novo: um repasse pelo servidor da casa, com limite por visitante, e um serviço pequeno
que guarda o histórico e as posições. Para dimensionar: cada visita custa cerca de 510 créditos de leitura; o plano
de US$ 49 por mês aguenta perto de 19.600 visitas por mês e o de US$ 499, 196 mil (INFERÊNCIA, relatório de
finanças, premissa de 50 transações por página; preços dos planos: FATO, página oficial da Helius, 4/out/2026).

**O site é o elo mais fraco (R-11).** O programa pode estar certo e o usuário perder tudo assinando uma transação
maliciosa servida pelo domínio da casa. Basta uma conta tomada: a da hospedagem, a do registro do domínio ou a do
GitHub. A proposta: segundo fator com chave física nas três contas, versões de pacotes travadas e nenhum código de
terceiros na página em que a carteira assina a aposta.

**Privacidade pelo Cloak e entrada de outras redes pelo SODAX.** **Decisão.** O pagamento de outras redes usa o
SODAX ("o nome da empresa é sodax - https://www.sodax.com") e a privacidade usa o Cloak ("a gente usa a Cloak para
esconder o pagador").

| | Cloak | SODAX |
|---|---|---|
| O que é | Serviço de privacidade em Solana que esconde quem pagou a quem | Serviço que traz dinheiro de outras blockchains e entrega USDC na carteira em Solana |
| Exemplo | O patrocinador deposita, saca para uma carteira nova e patrocina com ela | Quem tem dinheiro na rede Base chega com USDC em Solana |
| Custo | Depósito grátis; saque de 0,3% mais 0,45 USDC (FATO, documentação do Cloak, 3/out/2026) | Taxa de 0,1% (FATO, documentação do SODAX, 3/out/2026) |
| Onde roda | Só na rede principal; não há rede de testes | Só na rede principal; não há rede de testes |
| O que entrega | USDC numa carteira; não aciona uma operação do programa | USDC numa carteira; não aciona uma operação do programa |
| Limite principal | O cofre de USDC do Cloak tinha cerca de 2.560 USDC e cerca de 50 operações por dia (FATO SECUNDÁRIO, plano de privacidade do sócio) [A confirmar, AC-10] | Quem chega só com USDC não tem SOL para a taxa da rede (seção 11.3) |
| Auditoria | O site diz que foi auditado; o relatório não foi publicado (FATO, documentação do Cloak) | Há relatórios de auditoria listados na documentação; não foram lidos (FATO, documentação do SODAX) |

Os limites, em linguagem direta. No Cloak, a privacidade vem de se misturar a outros valores. Um patrocínio de
US$ 500 é um quinto do cofre inteiro; o de US$ 1.500, mais da metade; o de US$ 5.000, quase o dobro (INFERÊNCIA
sobre o tamanho do cofre). Entra um valor único e sai o mesmo valor: o conjunto em que ele se esconde é de um. O
operador do Cloak vê remetente, destinatário e valores, e pode recusar uma operação. E a carteira nova chega sem
SOL: se o patrocinador mandar SOL da carteira principal, ligou as duas em público e desfez a privacidade. No SODAX,
o caminho seguro é a entrega na carteira do próprio usuário, que só depois assina a aposta; USDC entregue direto no
endereço de um cofre é dinheiro perdido. Como os dois só existem na rede principal, toda integração é testada com
dinheiro real.

A revisão técnica propõe, para o MVP, orientar em vez de integrar: o patrocinador usa o Cloak por conta própria e
chega com uma carteira nova; o SODAX fica numa página separada, "Trazer dinheiro de outra rede"; e a tela diz
"pagador não divulgado", não "anônimo". É a objeção OBJ-23, cuja caixa está na seção 3.9. O que as normas e os
casos dizem sobre aceitar dinheiro vindo de um serviço de privacidade está na seção 15.7.

**A página de sugestões pelo X.** **Decisão.** O público sugere perguntas pelo X, numa página com "um monitor
vindo do X, e orientação da galera como eles podem fazer para fazer as sugestões". Três cuidados: mostrar uma
linha do tempo embutida, que é gratuita, e uma lista curada pela equipe, em vez de exibir menções automáticas; se
um dia um robô ler menções, cada publicação lida custa US$ 0,005 (FATO, tabela de preços do X, 3/out/2026), o que
pede um orçamento mensal fixo; e o código do X não é carregado na mesma página em que a carteira assina.

**Nomes de usuário do X são dado pessoal.** Guardar quem sugeriu o quê é tratar dado pessoal. A regra de
privacidade do projeto exige responder nove perguntas antes de guardar qualquer coisa: que dado é, por que é
necessário, onde fica, quem acessa, como o acesso é controlado, por quanto tempo fica, que registros são gerados, o
que acontece num pedido de exclusão e se a mudança pede atualização de política ou de consentimento. Nenhuma foi
respondida ainda.

### 11.8 Requisitos mínimos antes da rede principal

**Decisão.** "a plataforma é uma empresa em construção com deploy a ser feita na mainnet". A revisão técnica listou
trinta requisitos mínimos de segurança para esse passo (INFERÊNCIA, relatório técnico e de segurança, seção 13,
4/out/2026). São o piso, não o teto, e não substituem uma auditoria.

| Grupo | Nº | Requisito |
|---|---|---|
| Chaves e código | 1 | Chave de atualização em multisig 2 de 3, com chaves em dispositivos físicos e trava de tempo |
| Chaves e código | 2 | Compilação verificável publicada a cada versão; repositório público na versão que está na rede |
| Chaves e código | 3 | Nenhuma chave isolada e ligada à internet com poder sobre dinheiro; o serviço agendado só aciona operações abertas a qualquer um |
| Chaves e código | 4 | Configuração criada pela chave de atualização, na mesma transação da publicação do programa |
| Chaves e código | 5 | Varredura de segredos limpa; segredos só em variáveis de ambiente; anotado como trocar cada um |
| Limites gravados no código | 6 | Teto constante para a taxa; a taxa de cada pergunta não muda depois de criada |
| Limites gravados no código | 7 | Teto de pote por pergunta e teto total do programa no período inicial |
| Limites gravados no código | 8 | Nenhuma operação da equipe move dinheiro de apostadores; destino das taxas fixo na configuração |
| Limites gravados no código | 9 | Pausa em três níveis; resgate, devolução e resolução nunca pausam |
| Limites gravados no código | 10 | Moeda: só o USDC clássico, com endereço fixo; tokens do padrão Token-2022 recusados nos leitores até haver suporte |
| Contas e aritmética | 11 | Conferência da invariante no fim de toda operação; estados explícitos da pergunta |
| Contas e aritmética | 12 | Aritmética conferida, com números grandes, arredondando sempre a favor do pote; aposta e saída mínimas de 1 USDC |
| Contas e aritmética | 13 | Totais fotografados na resolução; o resgate fecha a posição; a tabela do pote de um lado só inteira no código |
| Contas e aritmética | 14 | Pagamentos sempre puxados por quem recebe, para a conta que ele indica |
| Contas e aritmética | 15 | Terceiro resultado, "Anulada", para conta lida que ficou ilegível |
| Testes | 16 | Teste aleatório de invariantes refeito para o pote, com a saída no sorteio |
| Testes | 17 | Teste com dois usuários: A não resgata, não sai e não fecha a posição de B |
| Testes | 18 | Um teste para cada linha das tabelas do pote de um lado só, das perguntas de preço e do pedido de pergunta |
| Testes | 19 | Revisão externa, no mínimo, da saída, do resgate e da devolução; sem ela, a saída fica desligada |
| Testes | 20 | Um ciclo completo na rede de testes e um na rede principal com potes mínimos, antes de abrir ao público |
| Perguntas | 21 | Nenhuma pergunta de resultado decidido de graça por uma chave, ou só com teto baixo e selo |
| Perguntas | 22 | Todo tipo novo passa pela prova do sócio técnico: uma transação consegue mover o número e voltar? Se sim, fica fora |
| Perguntas | 23 | Perguntas de preço: só ativos grandes, só "toque", com margem de erro, idade máxima e preço fresco em toda aposta |
| Perguntas | 24 | Abertura de pergunta em dois passos, por duas pessoas; frase gerada dos parâmetros gravados na rede |
| Operação | 25 | Dois agendadores em provedores diferentes, botão público de resolver, recompensa a quem resolve, alarme e plantão |
| Operação | 26 | Chave de acesso à rede fora do navegador; repasse com limite; histórico guardado em servidor |
| Operação | 27 | Segundo fator com chave física em domínio, hospedagem e GitHub; nenhum código de terceiros na página de aposta |
| Operação | 28 | Plano de incidente de uma página; aviso visível de "programa sem auditoria" enquanto for verdade |
| Operação | 29 | As nove perguntas da regra de privacidade respondidas para os nomes de usuário do X |
| Operação | 30 | Pontos levados a advogado antes de ligar: dinheiro vindo de serviço de privacidade, patrocinador não identificado em pergunta controlável, ausência de identificação do usuário |

O item 28 merece uma frase à parte: enquanto o programa não tiver auditoria, o site diz isso, em lugar visível. O
custo de uma primeira auditoria é estimado em US$ 15 a 45 mil (FATO SECUNDÁRIO, blogs de empresas de auditoria)
[A confirmar, AC-09: pedir três cotações].

## 12. Roteiro

O roteiro não tem datas. Ele é feito de fases, de sprints (ciclos curtos de trabalho com uma entrega definida) e de
critérios de pronto. Motivo: o tamanho da equipe e as horas disponíveis não estão em nenhum documento (seção 13.1),
e um calendário sem esses dois dados seria invenção. Tudo neste capítulo vem do relatório de viabilidade do MVP, de
4/out/2026, e é INFERÊNCIA, salvo onde indicado. MVP é a primeira versão do produto que já entrega o essencial.

### 12.1 As cinco fases

| Fase | Objetivo | O que o usuário consegue | Pronto quando |
|---|---|---|---|
| 1. Pote na rede de testes | Provar que o ciclo "apostar, resolver pela leitura da rede, resgatar" funciona e que a conta do cofre fecha | A equipe abre uma pergunta; qualquer carteira aposta em SIM ou NÃO com USDC de teste; qualquer carteira resolve; o vencedor resgata; o pote de um lado só devolve com taxa; a pergunta anulada devolve | Os testes passam, inclusive o teste aleatório de invariantes com milhares de sequências; um roteiro executa o ciclo completo na rede de testes; cada linha da tabela do pote de um lado só tem um trecho de código e um teste |
| 2. Produto jogável na rede de testes | Alguém de fora da equipe entra no site, aposta com USDC de teste e acompanha o resultado; a equipe opera sem linha de comando | Ver a página inicial, abrir uma pergunta, ver chance e retorno estimado, apostar, ver a posição, resgatar, apertar o botão público de resolver, trocar entre tema escuro e claro; ler a página de sugestões do X. A equipe propõe e aprova perguntas com duas chaves e pausa | Site publicado em endereço de teste; os dois agendadores resolvendo perguntas de teste; leitor de preço do SOL e do Bitcoin testado; página de aposta sem código de terceiros; repasse do acesso à rede no servidor; alarme funcionando; teste com pessoas de fora |
| 3. Patrocínio | Provar a segunda trilha de dinheiro | O patrocinador entra numa pergunta aberta ou pede uma, trava o depósito (500, 1.500 ou 5.000), escolhe prêmio neutro ou aposta de patrocinador; a equipe aceita ou recusa; a pergunta mostra o selo e o destaque | Testes com dois usuários no depósito travado; a aposta de patrocinador nasce sem saída; a devolução nunca é "empurrada" pela equipe; o patrocinador cancela sozinho depois de 14 dias; a divisão do "70/30" gravada no código depois da decisão do fundador |
| 4. Saída antecipada, escrita, testada e desligada por padrão | Entregar a decisão do fundador com o risco contido | Nas perguntas em que a saída estiver ligada, ver o botão "Sair", o valor mínimo aceito e o custo máximo (até 90%) antes de apostar; sair pagando a penalidade | Penalidade marcada por lado (precisa do aval do fundador); a saída fecha junto com as apostas e trava quando o fato acontece; piso de 10%; espera em horas; simulação com apostadores estratégicos feita; revisão externa só dessa operação contratada |
| 5. Rede principal fechada, com tetos | Dinheiro real, em valor pequeno, com tudo o que protege o usuário | Apostar USDC real num cardápio curto de perguntas da equipe, com teto por pergunta e teto total; patrocinar; chegar de outra rede pelo SODAX numa página separada; usar o Cloak por conta própria | Multisig 2 de 3 com três pessoas definidas; compilação verificável; revisão externa do programa inteiro concluída e correções aplicadas; pausa testada; plano de incidente; plantão; termos e avisos publicados; bloqueios geográficos prontos como interruptor; saída ligada só em perguntas de pote pequeno e só depois da revisão |

Duas leituras do quadro. A primeira: a rede principal é a quinta fase, não a primeira. A segunda: a decisão de adiar
os bloqueios geográficos para o fim ("deixar para fazermos a implementação dos bloqueios ao final") cabe no roteiro
como está, porque a fase 5 é o fim; a discussão sobre quais países está no capítulo 15.

> **Objeção registrada OBJ-26 · severidade crítica**
> **Decisão do fundador:** dinheiro real na rede principal ("a plataforma é uma empresa em construção com deploy a
> ser feita na mainnet"), com o escopo completo do MVP.
> **O que a revisão crítica achou:** não é uma mudança no programa atual, é um programa novo, sem auditoria, com
> mais de dez sistemas novos, escrito por poucas pessoas.
> **Evidência:** o repositório se descreve como protótipo de hackathon, na rede de testes e sem auditoria, e a
> reescrita invalida boa parte dos 138 testes (FATO, repositório e briefing do modelo de pote, 4/out/2026).
> **Alternativa proposta:** lançar em cinco fases, com a rede principal na quinta, e com teto de pote, multisig,
> compilação verificável, pausa e auditoria externa como condição para abrir.
> **Situação:** a decisão vale; a alternativa não muda o destino, muda a ordem, e fica para o fundador decidir.

### 12.2 Os doze sprints

"Depende de" aponta o que precisa estar pronto antes.

| Sprint | Entrega | Depende de | Fase |
|---|---|---|---|
| 1 | Decisões de regra fechadas (tabela do pote de um lado só, "70/30", destino da penalidade, resultado "Anulada", duração máxima); especificação do pote em uma página; esqueleto do programa novo ao lado do atual; conferência da invariante escrita; decisão de quem é a terceira chave do multisig e de quem guarda a chave de atualização; acordo de licença do código com o sócio técnico | Fundador e sócio técnico | 1 |
| 2 | Núcleo do programa: configuração, registro novo da pergunta, registro do apostador, abertura de pergunta só pela equipe e em dois passos, aposta com retorno mínimo aceito, prazos em data e hora, estados explícitos; testes | Sprint 1 | 1 |
| 3 | Resolução adaptada (foto dos totais, recompensa a quem aciona), resgate, devolução, "Anulada", taxa contabilizada e envio ao destino; teste aleatório de invariantes; roteiro na rede de testes com USDC de teste. Fim da fase 1 | Sprint 2 | 1 |
| 4 | Leitor de preço pela Pyth (SOL e Bitcoin) com preço fresco em cada aposta; cardápio fechado; serviço agendado e segundo agendador; alarme; repasse do acesso à rede e histórico guardados em servidor | Sprint 3 | 2 |
| 5 | Documento de design reescrito; site base no layout aprovado, com dois temas: página inicial, página da pergunta, aposta, posição, resgate, devolução; estados vazios e erros | Sprint 3; o design pode começar durante o sprint 3 | 2 |
| 6 | Painel da equipe (propor, aprovar com duas chaves, pausar), opção avançada de fechamento, página de sugestões do X, termos e avisos, teste com pessoas de fora. Fim da fase 2 | Sprints 4 e 5 | 2 |
| 7 | Programa do patrocínio: pedido de pergunta com depósito travado, aceite que abre e aplica na mesma transação, recusa, cancelamento depois de 14 dias, prêmio neutro, aposta de patrocinador sem saída, selo | Sprint 3 | 3 |
| 8 | Site do patrocínio: faixas de 500, 1.500 e 5.000, acompanhamento, selo, destaque, contrapartidas básicas; instruções para chegar com carteira nova. Fim da fase 3 | Sprints 6 e 7 | 3 |
| 9 | Programa da saída: penalidade por lado, valor mínimo aceito, espera em horas, chave por pergunta desligada; simulação com apostadores estratégicos | Sprint 7, estável | 4 |
| 10 | Site da saída; invariantes com a saída; revisão externa dessa operação; correções. Fim da fase 4 | Sprint 9 | 4 |
| 11 | Endurecimento: multisig 2 de 3, compilação verificável, pausa testada, plano de incidente, plantão, segundo fator em domínio, hospedagem e GitHub, bloqueio geográfico como interruptor, varredura de segredos; envio do programa à auditoria | Sprints 8 e 10 | 5 |
| 12 | Correções da auditoria; implantação na rede principal com tetos; página "Trazer dinheiro de outra rede"; teste real do SODAX e do Cloak com valor pequeno; saída ligada em pergunta de pote pequeno, só se a revisão liberar. Fim da fase 5 | Sprint 11 | 5 |

Três observações sobre a ordem:

1. **O sprint 1 não tem código de produto.** Ele fecha decisões de regra. Quatro delas viram erro de programa se
   ficarem para depois: o sentido do "70/30", a tabela do pote de um lado só, o destino da penalidade e o cardápio
   do primeiro dia (seção 16.1).
2. **A revisão externa precisa ser contratada por volta do sprint 7**, com orçamento e agenda, porque a espera por
   um auditor não depende da equipe.
3. **Há trabalho que corre em paralelo.** O design pode começar durante o sprint 3; a página de sugestões do X e os
   termos podem ser escritos por outra pessoa a qualquer momento.

### 12.3 Cada desejo do fundador e a fase em que entra

| Desejo do fundador | Fase | Observação |
|---|---|---|
| Pote de USDC por pergunta; apostar em SIM e NÃO | 1 | Sem ressalva |
| A equipe abre as perguntas | 1 (por roteiro) e 2 (por painel) | Sem ressalva |
| Resolução por leitura da rede | 1 | Sem ressalva |
| Serviço agendado aciona a resolução | 2 | Antes disso, o botão público |
| Pote de um lado só devolve com taxa | 1 | A tabela inteira precisa estar decidida antes de programar (seção 3.4) |
| Fechamento em 80% da duração, mínimo de 24 horas | 1 | A revisão propõe duração máxima de 30 dias no MVP (caixa OBJ-21, seção 3.5) |
| Opção avançada com dupla confirmação | 2 | Pelo multisig, não por duas chaves da mesma pessoa (seção 11.4) |
| Taxa de 3% com quatro destinos | 1 (a conta) e 5 (a divisão) | A divisão é feita pelo multisig, fora do programa (seção 11.4) |
| Página de sugestões com o X | 2 | Lista curada primeiro |
| Layout aprovado, tema claro e escuro, mascote | 2 | O documento de design precisa ser reescrito antes [A confirmar, AC-19] |
| Patrocinador em três faixas, prêmio neutro ou lado | 3 | Sem ressalva |
| Patrocinador anônimo | 3, como carteira nova | Selo "pagador não divulgado" (caixas OBJ-02 e OBJ-23, seções 3.7 e 3.9) |
| Pedir pergunta com depósito travado | 3 | Sem ressalva |
| Saída antecipada com penalidade | 4 (código) e 5 (ligada por pergunta) | Caixas OBJ-04 e OBJ-05 (seções 3.6 e 11.6) |
| Entrada de outras redes pelo SODAX | 5 | Página separada |
| Privacidade pelo Cloak | 5 | Orientação e teste real com valor pequeno |

Os tipos de pergunta de cada fase estão nas seções 4.2 e 4.5.

### 12.4 O que fica fora do primeiro lançamento na rede principal

A revisão técnica listou quinze itens que ela deixaria fora do primeiro lançamento com dinheiro real, e não do
produto (INFERÊNCIA, relatório técnico e de segurança, seção 14). A coluna da direita diz como cada item se
relaciona com as decisões do fundador. Só o primeiro contraria a letra de uma decisão; os demais são ordem de
entrega, e alguns coincidem com objeções que têm caixa em outra seção.

| Nº | O que ficaria fora do primeiro lançamento | Relação com as decisões |
|---|---|---|
| 1 | A saída ligada em todas as perguntas. O código entra; a chave por pergunta nasce desligada | Contraria "vamos fazer agora no mvp" na parte do "ligada no primeiro dia" (OBJ-04, seção 3.6) |
| 2 | Perguntas decididas por uma chave: renúncia de emissão, renúncia de congelamento, programa imutável, metadados | Ordem de entrega; o cardápio está em aberto (OBJ-03, seção 4.2) |
| 3 | Rendimento de validador numa época e formatura no pump.fun | Ordem de entrega |
| 4 | Preço de token pequeno e pergunta de preço do tipo "fechamento" | Ordem de entrega; responde à pergunta do fundador em três degraus (OBJ-24, seção 4.4) |
| 5 | Leitores para tokens do padrão Token-2022 | Ordem de entrega |
| 6 | Fechamento em dois marcos, com teto por lado. Um fechamento só, pela regra decidida, e perguntas de até 30 dias | Ordem de entrega; mantém a regra decidida e adia a parte "pode ser gradual" (OBJ-21, seção 3.5) |
| 7 | Integração do Cloak dentro do site | Ordem de entrega; muda a forma, não o uso (OBJ-23, seção 3.9) |
| 8 | Janela do SODAX dentro do fluxo de aposta | Ordem de entrega; página separada ou link (OBJ-23, seção 3.9) |
| 9 | Patrocínio com lado, por pagador não divulgado, em pergunta de resultado controlável | Ordem de entrega no cardápio proposto, em que ninguém controla o resultado; a restrição em si é a OBJ-02 (seção 3.7) |
| 10 | Pedido de pergunta com depósito travado, no primeiro degrau | Ordem de entrega; entra na fase 3 |
| 11 | Divisão da taxa em quatro, recompra e compra de Bitcoin dentro do programa | Ordem de entrega; a divisão decidida é feita pelo multisig (seção 11.4) |
| 12 | Desconto de taxa e peso de voto por saldo do token | Ordem de entrega |
| 13 | Robô que lê menções do X | Ordem de entrega; lista curada e sugestão manual primeiro |
| 14 | Resolução embutida na aposta ou no resgate; agendadores que rodam dentro da rede | Escolha técnica (seção 11.5) |
| 15 | Prazo de fechamento menor que 24 horas | Ordem de entrega; a opção avançada espera o multisig em uso diário (seção 11.4) |

O que fica no primeiro lançamento, pela mesma lista: apostar, resgatar, devolver o pote de um lado só, taxa de 3%
juntada por pergunta, abertura pela equipe em dois passos, teto de pote, pausa, multisig, compilação verificável,
resolução aberta com recompensa, dois agendadores e um cardápio curto em que ninguém decide o resultado.

#### A regra gradual para perguntas longas

**Em aberto.** Sobre o fechamento em perguntas longas, o fundador disse: "ainda temos que pensar para acima de 2-3
meses se 80% não é muito longo, e pode ser gradual." A dúvida procede: pela regra decidida, uma pergunta de 180
dias fecha no dia 144 e fica 36 dias parada.

A pesquisa propõe uma regra gradual, com dois marcos em vez de um (INFERÊNCIA, pesquisa de saída, fechamento e
resolução, seção 2.3; conta conferida pelo coordenador):

- **Primeiro marco (T1):** o fim menos 20% da duração, limitado a no máximo 14 dias antes do fim. Até T1, apostas
  livres e saída permitida.
- **Segundo marco (T2):** o fim menos 5% da duração, com mínimo de 24 horas e máximo de 7 dias. Entre T1 e T2, a
  "reta final": ainda se aposta, mas cada lado só pode crescer 25% sobre o tamanho que tinha em T1, e ninguém sai.
  Depois de T2, nada.

| Duração da pergunta | Regra decidida (80%): fecha no dia | Dias fechados pela regra decidida | T1 | T2 | Dias fechados na proposta |
|---|---|---|---|---|---|
| 7 dias | 5,6 | 1,4 | dia 5,6 | dia 6,0 | 1,0 |
| 30 dias | 24,0 | 6,0 | dia 24,0 | dia 28,5 | 1,5 |
| 90 dias | 72,0 | 18,0 | dia 76,0 | dia 85,5 | 4,5 |
| 180 dias | 144,0 | 36,0 | dia 166,0 | dia 173,0 | 7,0 |

Para perguntas de até 70 dias, T1 cai exatamente nos 80% decididos: a decisão fica preservada como o fim das
apostas livres. A diferença aparece nas longas: numa pergunta de seis meses, o tempo totalmente fechado cai de 36
dias para 7. O teto de 25% serve para segurar a aposta de última hora. Exemplo: num pote de 500 no SIM e 500 no
NÃO, faltando uma hora e com o NÃO quase certo, o oportunista que hoje poria 5.000 no NÃO só consegue pôr 125, e
os apostadores antigos do NÃO recebem 1,746 por dólar em vez de 1,058 (INFERÊNCIA, conta conferida). Como o teto
vale para o lado inteiro, e não por carteira, dividir o dinheiro em mil carteiras não adianta.

A revisão técnica e o relatório de viabilidade discordam de construir isso agora: o teto por lado cria uma corrida
de robôs pelo espaço que resta, e as perguntas longas não cabem no MVP. A posição consolidada é: a regra decidida
(80% com mínimo de 24 horas) é a regra do produto; a regra gradual é a resposta proposta para as perguntas longas,
numa fase posterior; e a duração máxima no MVP fica em aberto (seção 16.1, item 4). Se o fundador quiser perguntas
longas antes, a duração máxima pode ficar na configuração e mudar sem mexer no programa.

### 12.5 Os tokens no roteiro

**Decisão.** São dois tokens, e a ordem é: "começar pelo pump.fun para servir de marketing pra nossa plataforma e
depois pensarmos um ICO privado mais robusto." O token A é o do pump.fun, a plataforma de Solana em que qualquer
pessoa lança um token em minutos; o token B é o da venda privada ("ICO privado"). O desenho dos dois está no
capítulo 8.

O lugar deles no roteiro tem três posições registradas:

- **A ordem proposta pela pesquisa de tokens** (INFERÊNCIA, 4/out/2026): no mês 0, o produto na rede principal e o
  token A; nos meses 1 a 4, medição; nos meses 4 a 6, a venda privada do token B; nos meses 6 a 9, o lançamento do
  token B, a distribuição aos detentores do token A e o início da recompra. Antes de o token B existir, a parcela
  da recompra fica em USDC numa conta pública.
- **A posição do relatório de viabilidade:** os dois tokens ficam fora do MVP. Nenhuma operação do programa de pote
  depende deles, de modo que podem entrar depois sem reescrever nada. O risco apontado é o escopo crescer com os
  tokens no meio da construção.
- **As discordâncias quanto ao momento** (token A só depois de semanas de perguntas resolvidas; token B fora do
  cronograma até haver parecer jurídico) estão na caixa OBJ-13, na seção 8.7.

O que as normas dizem sobre os dois tokens está na seção 15.5.

## 13. Equipe e operação

### 13.1 A equipe hoje

São duas pessoas e assistentes de código.

- **O fundador, Lucas.** É o dono do produto e das decisões de regra: o que é o pote, quanto se cobra, o que o
  patrocinador recebe, o que entra e o que fica fora. Não é engenheiro de protocolo. As decisões dele são a espinha
  deste plano.
- **O sócio técnico, Ronaldo.** É o autor do programa atual e dos documentos técnicos que o acompanham (a economia
  do modelo antigo, os tipos de pergunta e o plano de privacidade).
- **Assistentes de código.** Programas de inteligência artificial que escrevem e revisam código sob orientação. O
  site e boa parte dos testes dependem deles.

O tamanho real da equipe, as horas que cada um dedica e o prazo que cada um tem: não encontrado em nenhum
documento do projeto. Este capítulo trabalha com papéis, não com pessoas, e a lacuna vai para a lista de decisões
(seção 16.1, item 8) e para as perguntas ao sócio técnico (seção 16.2).

### 13.2 Papéis e quem falta

| Papel | Quem hoje | Observação |
|---|---|---|
| Dono do produto e das decisões de regra | Fundador | O sprint 1 é dele (seção 12.2) |
| Programa em Solana | Sócio técnico e assistente de código | É o gargalo: poucas pessoas, e o ambiente atual não compila |
| Site | Assistente de código | Aproveita parte do site existente |
| Design | Fundador e os protótipos aprovados | O documento de design precisa ser reescrito [A confirmar, AC-19] |
| Operação do serviço agendado e plantão | Sem dono | Alguém precisa atender o alarme (seção 11.5) |
| Revisão externa e auditoria | Sem contratada | Orçar e contratar por volta do sprint 7 |
| Jurídico | Sem dono | O parecer é o primeiro gasto proposto (seção 16.4) |
| Moderação das perguntas e do X | Equipe, sem dono | Inclui revisar o texto do patrocinador |
| Terceira chave do multisig | Sem dono | Sem terceira pessoa não há 2 de 3 (seção 11.4) |

Fonte: relatório de viabilidade, seção 5.2 (INFERÊNCIA, 4/out/2026). Cinco papéis não têm dono. Dois deles
bloqueiam a rede principal: a terceira chave e a auditoria.

### 13.3 A dependência do sócio técnico

O programa atual, que é o ativo mais sólido do projeto, é obra de uma pessoa. A licença do código é MIT, em nome de
Ronaldo Pereira, e 11 dos 16 registros de alteração listados são dele (FATO, arquivo `LICENSE` e histórico do
repositório, 4/out/2026).

| O que depende dele | Detalhe | Efeito se ele não estiver disponível |
|---|---|---|
| Conhecimento dos leitores | Por que cada leitor resiste a um empréstimo relâmpago; o que não pôde ser verificado fora de uma rede real | Aproveita-se o código como está e não se escrevem leitores novos de risco; o leitor de preço fica sem segunda opinião |
| Chave de atualização | Quem a tem hoje: não encontrado [A confirmar, AC-18] | Na rede principal, o programa novo é implantado com multisig próprio |
| Repositório e licença | O repositório de origem é dele; o do projeto é derivado | Sem acordo escrito, o reaproveitamento dos leitores e da resolução fica em dúvida. Precisa estar resolvido antes do sprint 2 |
| Revisão do programa novo | Ele conhece o desenho e os pontos sutis | A revisão externa deixa de ser recomendável e passa a ser obrigatória |
| Padrão novo de token e formatura no pump.fun | Ele mapeou o formato | Fora do MVP; não bloqueia |
| Terceira chave do multisig | Sem dono | Decisão dos dois sócios |

**Decisão.** Sobre a divisão com o sócio, o fundador disse: "por enquanto é irrelevante, eu te aviso o que fazer."

> **Objeção registrada OBJ-19 · severidade crítica**
> **Decisão do fundador:** a divisão com o sócio técnico "por enquanto é irrelevante".
> **O que a revisão crítica achou:** uma pessoa só domina o programa, sem acordo escrito, sem prazo e sem resposta
> registrada às perguntas que o briefing preparou para ela.
> **Evidência:** a licença é MIT em nome do sócio, 11 dos 16 registros de alteração são dele e as seis perguntas do
> briefing não têm resposta registrada (FATO, repositório e arquivo `LICENSE`, 4/out/2026).
> **Alternativa proposta:** acordo de sócios antes de qualquer gasto de construção ou de auditoria; resposta
> escrita às seis perguntas, com prazo; chave de atualização num multisig com os dois; orçar um segundo
> desenvolvedor por contrato.
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir. O relatório de viabilidade registra que
> a licença e a chave de atualização não podem esperar além do sprint 2.

### 13.4 A operação do dia a dia

Um mercado de previsão em que a equipe abre as perguntas é um trabalho recorrente, não só um programa no ar.
Quatro rotinas:

1. **Abrir perguntas.** **Decisão.** "vamos deixar que a equipe abra as perguntas". Uma pessoa propõe e outra
   aprova (seção 11.4). Quem propõe, quem aprova e quantas perguntas por semana: em aberto. O risco (R-16, alto) é
   não haver assunto toda semana: fatos irreversíveis na rede são raros, e só três dos oito exemplos de pergunta
   levantados na pesquisa têm leitor pronto (INFERÊNCIA, revisão crítica). A mitigação proposta são séries
   recorrentes geradas por regra, como uma pergunta de preço por semana, e uma meta de cardápio com responsável.
2. **Atender o alarme.** Quando uma pergunta fica "resolvível e não resolvida" por mais de 15 minutos, alguém
   precisa agir. O plantão não tem dono nem horário.
3. **Moderar.** O texto que o patrocinador põe na pergunta é revisado antes de ir ao ar e exibido como texto puro,
   sem links ativos. As sugestões do X viram pergunta só por decisão humana, nunca automaticamente.
4. **Medir o fundo de prêmios.** A regra dos três sinais, medida a cada trimestre, pede alguém que faça a conta
   (ver seção 7.5).

O custo de cada tamanho de operação está na seção 9.2. A capacidade de construir é um risco à parte (R-19, alto):
há poucas pessoas que escrevem Rust, o ambiente de trabalho atual não compila o programa nem roda os testes, e a
agenda de um auditor não depende da equipe. A mitigação proposta é uma máquina dedicada a compilar, ou a integração
contínua do repositório fazendo esse papel, e a contratação da revisão por volta do sprint 7.

### 13.5 Regras da casa

Nenhuma regra desta seção está decidida. São propostas da revisão crítica para tratar um risco específico (R-13): a
equipe é parte informada. Ela vê os pedidos de patrocínio antes do público e opera o serviço que aciona a
resolução. Sozinho, o risco é médio; combinado com a decisão de que quem controla o resultado pode apostar (OBJ-02,
seção 3.7), é crítico.

| Regra proposta | O que evita |
|---|---|
| A equipe não aposta nas perguntas que abre | Aposta com informação que o público não tem |
| As carteiras da equipe são publicadas | Qualquer pessoa confere a regra acima na rede |
| Nenhuma pergunta sobre o token da casa | A equipe decidir o resultado de uma pergunta em que ela mesma ganha |
| Pedido de patrocínio aceito e aplicado na mesma transação | A equipe aceitar o dinheiro e não abrir a pergunta |
| Plano de incidente de uma página, antes da rede principal | Improviso num defeito: quem pausa, quem fala, onde se publica, em quanto tempo (R-18) |

Se a equipe pode apostar e se pode haver pergunta sobre o token da casa são decisões do fundador (seção 16.1, item
11). O que os dois líderes do setor escreveram sobre isso está na seção 15.6.

## 14. Riscos

### 14.1 Como ler este capítulo

Este capítulo reúne tudo o que a pesquisa e a revisão crítica acharam de frágil no plano. São 48 itens de dois
tipos:

- **Objeções registradas (OBJ-01 a OBJ-29).** Cada uma é uma discordância da revisão crítica com uma decisão ou uma
  premissa do fundador. A decisão continua valendo. A caixa de cada objeção, com a evidência e a alternativa, está
  na seção do assunto; o índice está no Anexo C.
- **Riscos (R-01 a R-19).** São fragilidades que não contrariam nenhuma decisão: existem qualquer que seja a
  escolha do fundador.

A severidade segue a definição da revisão crítica. **Crítica:** derruba o negócio, causa perda de dinheiro de
usuário ou expõe a equipe, se não for tratada antes da rede principal. **Alta:** compromete o lançamento ou a
confiança. **Média:** custa dinheiro ou tempo. **Baixa:** incômodo. Onde dois revisores deram severidades
diferentes, vale a maior.

Nenhuma objeção foi resolvida pelas ondas de pesquisa. Resolver uma objeção é decidir, e decidir é do fundador.

### 14.2 Quadro de riscos

A coluna "Dono proposto" é INFERÊNCIA deste plano: indica quem teria de agir, não quem aceitou a tarefa. As
evidências levam a etiqueta da ficha de números; onde não há etiqueta, a evidência é uma constatação da revisão
crítica (INFERÊNCIA). Tudo com data de 4/out/2026, salvo indicação.

#### Críticos (15)

| Código | Risco | Evidência | Mitigação proposta | Dono proposto | Seção |
|---|---|---|---|---|---|
| OBJ-01 | Ninguém demonstrou que o público quer apostar em fatos lidos on-chain | Nenhum mercado aberto sobre queima, renúncia, trava ou formatura foi achado em nenhuma plataforma (FATO, ausência em busca limitada, out/2026) | 10 a 15 conversas, beta com pontuação e sem dinheiro, quatro semanas de potes com teto baixo, critério de continuar ou parar escrito antes | Fundador | 2.5 |
| OBJ-02 | Patrocinador anônimo, que controla o resultado, aposta num lado | Polymarket e Kalshi proíbem por escrito (FATO, 2026); no exemplo, o patrocinador põe 5.000 no NÃO, não cumpre a meta e lucra 658 (INFERÊNCIA) | Anônimo para o público e identificado para a equipe; declaração assinada; aviso na pergunta; aposta de lado só em perguntas que ninguém controla | Fundador | 3.7 e 15.6 |
| OBJ-03 | Perguntas decididas de graça por uma única chave | Em quatro dos nove tipos prontos uma pessoa decide o resultado sem custo; no exemplo, o dono aposta 3.000 e lucra 3.305 sem risco (INFERÊNCIA) | Deixar essa família fora no MVP; se entrar, teto baixo, selo e sem patrocínio com lado | Fundador | 4.2 |
| OBJ-04 | A saída antecipada nasce ligada em todas as perguntas | Nenhum precedente de pote que devolva dinheiro a quem sai; a revisão no papel achou seis furos | Código no MVP com a chave por pergunta desligada; ligar depois de simulação e de revisão externa | Fundador e sócio técnico | 3.6 |
| OBJ-05 | A penalidade volta ao pote e quem domina o lado vencedor a recebe de volta | No exemplo, lucro de 304,50 em vez de 60,30 (INFERÊNCIA) | Penalidade marcada pelo lado de quem saiu | Fundador | 11.6 |
| OBJ-09 | A divisão da taxa em quatro deixa 0,64% do volume para pagar a operação | No cenário razoável, a operação volta ao déficit no mês 18 (INFERÊNCIA, modelo financeiro) | Regra de partida: as parcelas de Bitcoin e de recompra esperam em USDC e cobrem o déficit até a operação se pagar | Fundador | 7.3 |
| OBJ-17 | Bloqueios geográficos para o fim, com a equipe no Brasil | Resolução CMN 5.298 e Nota Técnica 2958 (FATO, 2026); 27 sites bloqueados, entre eles plataformas on-chain (FATO SECUNDÁRIO, abr/2026) | Bloqueio por endereço de internet desde o primeiro dia, com a lista decidida com advogado | Fundador e advogado | 15.2 |
| OBJ-18 | Sem país e sem pessoa jurídica | Sem jurisdição não há venda de token, tesouraria nem termos de uso | Parecer curto antes de gastar com construção; jurisdição antes da venda do token B | Fundador e advogado | 15.9 |
| OBJ-19 | Uma pessoa só domina o programa, sem acordo nem prazo | Licença MIT em nome do sócio; 11 dos 16 registros de alteração são dele (FATO) | Acordo de sócios; respostas escritas; multisig com os dois; segundo desenvolvedor orçado | Fundador e sócio técnico | 13.3 |
| OBJ-20 | Sem identificação nenhuma, o cofre e o patrocinador desconhecido encostam em deveres legais citados | A Lei 9.613 lista "captação de apostas com pagamento de prêmios" entre as atividades obrigadas a identificar clientes (FATO, trecho) | Adotar a definição do setor; identificar o patrocinador perante a equipe | Fundador e advogado | 15.8 |
| OBJ-25 | Se o serviço agendado falha, um SIM verdadeiro vira NÃO para sempre | Regra do programa: meta cumprida e não provada até o prazo é gravada como NÃO (FATO) | Dois agendadores, botão público, recompensa, alarme e plantão; resultado "Anulada"; plano de indenização | Sócio técnico; plantão sem dono | 4.7 e 11.5 |
| OBJ-26 | Programa novo, sem auditoria, com mais de dez sistemas novos, com dinheiro real | O repositório se descreve como protótipo de hackathon, sem auditoria (FATO) | Cinco fases, rede principal na quinta, tetos, multisig e auditoria como condição | Fundador e sócio técnico | 12.1 |
| R-01 | A chave de atualização pode esvaziar todos os cofres | Hoje os roteiros usam uma carteira em arquivo; quem tem a chave: não encontrado | Multisig 2 de 3 com trava de tempo; compilação verificável | Fundador e sócio técnico; terceira chave sem dono | 11.4 |
| R-02 | O apostador vale pouco e custa caro para trazer | US$ 9 para a operação em seis meses (INFERÊNCIA, premissa sem dado), contra custos de aquisição de US$ 77 a US$ 2.500 em cripto (FATO SECUNDÁRIO, 2021 a 2023) | Aquisição paga perto de zero; medir quantas carteiras voltam sem prêmio | Fundador | Capítulo 9 |
| R-03 | Capital sem fonte garantida; a venda privada é circular | A venda precisa acontecer antes do volume e o preço só se justifica depois dele | Lançar no nível 1 de custo com capital dos sócios; marcos antes de cada gasto | Fundador | Capítulo 9 |

#### Altos (24)

| Código | Risco | Evidência | Mitigação proposta | Dono proposto | Seção |
|---|---|---|---|---|---|
| OBJ-06 | Num pote puro não existe ganho para realizar antes do fim | Uma aposta de 100 "vale" 97 antes e depois de o lado ficar mais provável (INFERÊNCIA) | Saída só com devolução e penalidade; o ganho fica para a venda da posição a outra pessoa, numa fase posterior | Fundador | 3.6 |
| OBJ-07 | Taxa fixa de 3% sobre o pote castiga quem aposta no favorito | Com 90% do pote no lado vencedor a taxa leva 30% do ganho; com 97%, quem acerta recebe o que pôs (INFERÊNCIA) | Taxa igual ao menor entre 3% do pote e 10% do lado perdedor | Fundador | 7.2 |
| OBJ-08 | A taxa no pote de um lado só pune o primeiro apostador | A referência dos 3%, o PancakeSwap, devolve 100% na rodada cancelada (FATO) | Cobrança reduzida, ou zero no lançamento; tabela completa dos casos | Fundador | 3.4 |
| OBJ-10 | 25% da taxa bruta para Bitcoin, antes de qualquer custo | Tether, Block e Méliuz usam lucro ou caixa excedente; a Metaplanet estava 38% abaixo do custo em jun/2026 (FATO SECUNDÁRIO) | Acumular em USDC até o gatilho; compra mensal em data fixa; regra de venda escrita | Fundador | 7.6 |
| OBJ-11 | A recompra é pequena perto dos desbloqueios | A Jupiter gastou mais de US$ 70 mi, cobriu cerca de 6% dos desbloqueios e o token caiu 89% do pico (FATO SECUNDÁRIO, jan/2026) | Recompra só depois do equilíbrio; desbloqueios desenhados pelo tamanho da recompra; nenhuma promessa de preço | Fundador | 8.5 |
| OBJ-12 | O "dividendo" não tem fonte na divisão da taxa e é a palavra que os reguladores citam | A divisão em quatro parcelas de 25% não tem parcela de repasse | Tirar a palavra do plano, ou dizer de qual fatia sai e levar ao advogado | Fundador e advogado | 8.6 |
| OBJ-13 | Token no pump.fun "para pumpar", lançado primeiro | Tokens de mercados de previsão: LMTS −94%, PNP −93%, UMA −99% (FATO SECUNDÁRIO, out/2026) | Produto primeiro; token A sem promessa; token B depois de volume real e de parecer | Fundador | 8.7 |
| OBJ-15 | Faixas de patrocínio sem vitrine e sem precedente pago | No programa parecido da Polymarket a mediana é de US$ 3 por dia por mercado (FATO SECUNDÁRIO, set/2026) | Três a cinco cartas de intenção antes de construir o fluxo | Fundador | 7.4 |
| OBJ-16 | O fundo de prêmios só se paga se causar um quarto de todo o volume | Opinion, Myriad e Limitless perderam de 80% a 96% do volume quando o incentivo acabou (FATO SECUNDÁRIO, 2026) | Três sinais medidos por trimestre; critério de corte escrito antes | Fundador | 7.5 |
| OBJ-21 | O mínimo de 24 horas trava as perguntas curtas; as longas não cabem no MVP | Concorrentes operam preço de cripto em 5 minutos a 1 semana | Séries curtas aprovadas uma vez por duas chaves; perguntas de até 30 dias no MVP | Fundador | 3.5 e 12.4 |
| OBJ-22 | "Sem limite de compra" colide com a necessidade de teto de pote | Completar uma curva do pump.fun nos últimos 10% custa 2,16 SOL (FATO, documento do sócio) | Teto por pergunta e teto total no período inicial | Fundador e sócio técnico | 3.3 |
| OBJ-23 | Cloak e SODAX integrados põem código de terceiros na página de aposta; o Cloak não esconde valor grande | O cofre de USDC do Cloak tinha cerca de 2.560 USDC (FATO SECUNDÁRIO) [A confirmar, AC-10] | Orientação em vez de integração; "pagador não divulgado" | Fundador | 3.9 e 11.7 |
| OBJ-24 | Preço de token pequeno pode ser movido e devolvido na mesma transação | Numa pool de 100 SOL, dobrar o preço custa cerca de 0,21 SOL em taxas (INFERÊNCIA) | Três degraus: preço pela Pyth; média no tempo com liquidez travada e teto; rede de oráculos | Fundador e sócio técnico | 4.4 |
| R-04 | Custos que vêm antes da receita | US$ 30 a 75 mil antes do primeiro dólar de taxa (INFERÊNCIA) [A confirmar, AC-09] | Orçamento de pré-lançamento com três cotações de auditoria | Fundador | Capítulo 9 |
| R-05 | O pote não gira o dinheiro | No World, cada dólar girou cerca de 90 vezes no mês (INFERÊNCIA sobre FATO SECUNDÁRIO, set/2026); no pote, uma vez por pergunta | Perguntas curtas primeiro | Fundador | Capítulo 9 |
| R-06 | Forçar o SIM pagando | Compensa sempre que o pote do NÃO for maior que o custo de forçar | Teto de pote abaixo do custo de forçar, medido na criação | Sócio técnico | 3.3 e 11.8 |
| R-07 | Aposta de última hora dilui quem arriscou cedo | 5.000 no lado quase certo rendem 290,91 quase sem risco (INFERÊNCIA) | Fechamento; prazos em data e hora | Sócio técnico | 3.5 e 11.3 |
| R-08 | Casos do pote de um lado só sem regra | Com prêmio neutro e penalidades, há quatro casos sem definição | Escrever a tabela inteira antes de programar | Fundador | 3.4 |
| R-09 | A conta lida deixa de poder ser lida | Programas de terceiros podem mudar de formato | Resultado "Anulada"; recusar tokens cujo registro pode ser fechado | Sócio técnico | 11.3 |
| R-10 | Perguntas de preço: aposta entre o toque e a prova | O preço só existe na rede quando alguém publica | Preço fresco em toda aposta; só ativos grandes; saída desligada | Sócio técnico | 4.4 e 11.8 |
| R-11 | O site como elo mais fraco | Uma conta de hospedagem, de domínio ou do GitHub tomada serve transação maliciosa | Segundo fator com chave física; nenhum código de terceiros na página de aposta | Sócio técnico | 11.7 |
| R-12 | Acesso à rede pelo navegador | O endereço público tem limite; uma chave paga no navegador é pública | Repasse pelo servidor, com limite; histórico em servidor | Sócio técnico | 11.7 |
| R-16 | Não há fonte de perguntas toda semana | Fatos irreversíveis são raros; só três dos oito exemplos têm leitor pronto | Séries recorrentes geradas por regra; meta de cardápio com responsável | Fundador; moderação sem dono | 13.4 |
| R-19 | Capacidade de construir | Poucas pessoas de Rust; o ambiente atual não compila nem roda testes; auditor sem agenda | Máquina de compilação ou integração contínua; contratar a revisão no sprint 7 | Fundador e sócio técnico | 13.4 |

#### Médios (7)

| Código | Risco | Evidência | Mitigação proposta | Dono proposto | Seção |
|---|---|---|---|---|---|
| OBJ-14 | 30% de cada compra, como taxa permanente do token, destrói o comprador | Quem paga 1.000 fica com 703 de valor e, se revender, com 490 (INFERÊNCIA) | 30% do que a venda privada arrecadar, sem taxa no token | Fundador | 8.4 |
| OBJ-27 | "Sem oráculo", "anônimo" e "ninguém controla" prometem o que o produto não entrega | Preço exige a Pyth; a equipe abre perguntas, pausa e atualiza o código | "Resultado verificável on-chain"; "pagador não divulgado"; publicar quem pode o quê | Fundador | 4.8 |
| R-13 | A equipe como parte informada (crítico se combinado com a OBJ-02) | Ela vê os pedidos de patrocínio antes do público e opera o serviço de resolução | A equipe não aposta; carteiras publicadas; nenhuma pergunta sobre o token da casa | Fundador | 13.5 |
| R-14 | O USDC pode ser congelado pelo emissor | Dinheiro vindo de serviço de privacidade aumenta a exposição (INFERÊNCIA, a conferir, AC-16) | Cofre por pergunta; cofre de taxas esvaziado com frequência | Sócio técnico | 11.3 |
| R-15 | O diferencial pode ser copiado | O World já tem o encanamento automático | Chegar primeiro e ter comunidade | Fundador | Capítulo 6 |
| R-17 | Mercado de vendas de token fraco | 37 vendas e US$ 58 mi no segundo trimestre de 2026, no mundo (FATO SECUNDÁRIO, set/2026) | Meta de arrecadação modesta; nenhum custo fixo apoiado na venda | Fundador | Capítulo 8 |
| R-18 | Sem plano de incidente | Não há quem pausa, quem fala e onde se publica | Uma página, antes da rede principal | Fundador e sócio técnico | 13.5 |

#### Baixos (2)

| Código | Risco | Evidência | Mitigação proposta | Dono proposto | Seção |
|---|---|---|---|---|---|
| OBJ-28 | O nome: "baked" tem a gíria de "chapado" e "baked in" quer dizer "já decidido de antemão" | A pesquisa de nome registrava a gíria e o código `BAKED` em uso por terceiros; nenhuma base de marcas foi consultada | Manter o nome e usar a leitura a favor; só funciona se a OBJ-02 for resolvida | Fundador | 3.10 |
| OBJ-29 | Uma fonte barata de capital e de validação está sendo deixada passar | O prazo do hackathon Colosseum é 12/out/2026; valores de prêmio não conferidos [A confirmar, AC-27] | Reconsiderar a submissão do que já existe | Fundador | 9.6 |

### 14.3 Os riscos críticos

**1. Demanda (OBJ-01).** É a pergunta que este plano não responde, e tudo o mais a supõe. A pesquisa não achou, em
nenhuma plataforma, um mercado aberto sobre queima, renúncia, trava ou formatura de tokens de terceiros (FATO,
ausência em busca limitada, out/2026). O mais perto disso são mercados sobre o token do pump.fun na Polymarket, que
somaram cerca de US$ 262,81 mil no total (FATO SECUNDÁRIO, fonte fraca, sem data). Não houve nenhuma entrevista. A
ausência pode significar que ninguém tentou ou que ninguém quer; só um teste distingue as duas coisas.

**2. Integridade: quem controla o resultado aposta (OBJ-02, OBJ-03, R-13).** Em quatro dos nove tipos de pergunta
que o programa já lê, uma pessoa decide o resultado sem gastar nada: basta assinar, ou não assinar, uma renúncia.
No exemplo da revisão técnica, o dono da chave aposta 3.000, age depois do fechamento e lucra 3.305 sem risco; no
exemplo da revisão de conformidade, o patrocinador anônimo põe 5.000 no NÃO, não cumpre a meta e lucra 658 sobre
quem apostou no SIM (INFERÊNCIA nos dois). Somada à equipe, que vê os pedidos antes do público, a combinação é a
que os dois líderes do setor proíbem por escrito. Um mercado em que o público acredita que alguém joga com as
cartas marcadas não tem segundo mês.

**3. Dinheiro do usuário (OBJ-04, OBJ-05, OBJ-25, OBJ-26, R-01).** São cinco caminhos pelos quais um usuário perde
dinheiro sem ter errado a previsão. A saída antecipada, sem precedente de mercado, tem um furo que rende 304,50 a
quem monta o golpe com duas carteiras, e numa fuga em massa deixa para quem ficou de cerca de um terço a 63% do
prêmio. A resolução, se o serviço falha, grava NÃO para um SIM verdadeiro, sem volta. O programa é novo, sem
auditoria, num repositório que se descreve como protótipo. E a chave que pode trocar o código, e com isso esvaziar
todos os cofres, hoje vive num arquivo, com dono não identificado.

**4. Finanças (OBJ-09, R-02, R-03).** O número que organiza as finanças não é 3%, é 0,64%: de cada US$ 100
apostados, US$ 0,64 paga a operação, ou US$ 0,75 se ninguém sair antes (INFERÊNCIA, modelo financeiro; as premissas
de saída não têm dado). Com isso, o volume de equilíbrio é de US$ 471 mil, 1,57 milhão ou 3,92 milhões apostados
por mês, conforme o nível de custo. Um apostador que ponha US$ 200 por mês durante seis meses deixa US$ 9 para a
operação (INFERÊNCIA, premissa sem dado). O capital necessário, com reserva, vai de US$ 70 a 110 mil nos cenários
razoável e otimista e de US$ 125 a 136 mil no ruim, dos quais US$ 51,5 mil antes do lançamento; o cenário ruim não
se paga em nenhum regime (INFERÊNCIA). A fonte desse capital não está definida, e a venda privada do token não a
resolve: ela teria de acontecer antes do volume que justificaria o preço. Os números completos estão no capítulo
9.

**5. Regulação e pessoas (OBJ-17, OBJ-18, OBJ-20, OBJ-19).** Três objeções tratam de onde a empresa existe, de quem
ela deixa entrar e de quem ela conhece: ver capítulo 15. A quarta trata de quem constrói: uma pessoa só domina o
programa, sem acordo escrito (seção 13.3).

### 14.4 Os riscos altos

São 24. Agrupados pelo que ameaçam:

- **A conta do apostador (OBJ-06, OBJ-07, OBJ-08, R-07, R-08).** A promessa de "ganho proporcional menor" na saída
  não existe num pote puro. A taxa fixa sobre o pote inteiro pesa pouco em potes equilibrados e muito no favorito:
  com 90% do pote no lado vencedor, leva 30% do ganho. No pote de um lado só, a taxa cai sobre o primeiro
  apostador, que é quem o lançamento mais precisa. A aposta de última hora dilui quem arriscou cedo. E a tabela dos
  casos de um lado só ainda tem quatro linhas sem regra.
- **O destino da taxa (OBJ-10, OBJ-11, OBJ-16).** Bitcoin comprado com receita bruta, recompra menor que os
  desbloqueios e fundo de prêmios sem retorno medido por nenhuma plataforma. Os três têm precedentes que foram mal.
- **A segunda e a terceira trilhas (OBJ-12, OBJ-13, OBJ-15).** Patrocínio a preço de vitrine sem vitrine; um token
  apresentado com as palavras que corroem a confiança de uma casa de apostas; e um "dividendo" sem fonte.
- **O cardápio e os prazos (OBJ-21, OBJ-22, OBJ-24, R-06, R-10, R-16).** As perguntas curtas, que são o que o
  público aposta, esbarram no mínimo de 24 horas. Toda pergunta precisa de teto de pote. O preço de token pequeno
  pode ser movido por um instante. E falta assunto para abrir perguntas toda semana.
- **A infraestrutura (OBJ-23, R-09, R-11, R-12).** Código de terceiros na página em que a carteira assina; contas
  lidas que podem mudar de formato; o site como elo mais fraco; e o acesso à rede feito pelo navegador.
- **O caixa e a capacidade (R-04, R-05, R-19).** De US$ 30 a 75 mil saem antes do primeiro dólar de taxa. O pote
  usa cada dólar uma vez por pergunta, enquanto um concorrente gira o mesmo dólar cerca de 90 vezes por mês. E a
  equipe que constrói é pequena, num ambiente que hoje não compila.

### 14.5 O que continua de pé

A revisão crítica fechou com a lista do que resistiu ao ataque. Ela é parte do quadro de riscos tanto quanto as
objeções:

1. A leitura direta da rede é real e única entre os cinco concorrentes analisados.
2. O código de resolução é o ativo mais sólido: nove leitores, resolução aberta a qualquer um, trava automática das
   apostas quando o fato acontece e teste aleatório de invariantes.
3. O pote não quebra: não precisa de formador de mercado e o cofre nunca fica devendo.
4. A equipe abrir as perguntas é o que fazem a Polymarket e o World; quem abriu a criação para qualquer um não
   mostrou que isso traz volume.
5. USDC, sem rendimento do pote e sem tokens de SIM e NÃO: as três escolhas simplificam o programa e a explicação.
6. Os 3% estão dentro da faixa do setor em potes equilibrados.
7. Prêmio dentro do pote é algo que nenhum site de anúncio vende.
8. Dar o segundo token a quem segura o primeiro, sem conversão, tem um precedente que funcionou.
9. A janela existe, se a demanda existir: o rival mais parecido ainda não lançou com dinheiro real (FATO
   SECUNDÁRIO) [A confirmar, AC-04].

## 15. Regulação e conformidade

### 15.1 Aviso

Este capítulo não é parecer jurídico. Ele descreve o que cada norma ou caso diz, com a fonte, e marca o que é ponto
para advogado. Não afirma que algo é permitido, legal ou ilegal. Os graus de exposição que aparecem aqui são
INFERÊNCIA do agente de conformidade, não opinião jurídica. As normas foram lidas em 4 de outubro de 2026; o que
foi lido no texto integral está marcado FATO, e o que veio da imprensa ou de escritórios, FATO SECUNDÁRIO.

Duas decisões do fundador organizam o capítulo. **Decisão.** O acesso é "100% onchain da solana, via wallet, sem
kyc". **Decisão.** Os bloqueios geográficos ficam para o fim: "deixar para fazermos a implementação dos bloqueios
ao final"; e, sobre bloquear o Brasil e os Estados Unidos: "Por enquanto não, e ainda não sabemos." **KYC** é a
sigla em inglês para a identificação do usuário: a conferência de quem ele é, com documento.

#### Mapa de exposição

Cada linha liga uma decisão a uma regra ou a um caso que a toca. A coluna "Exposição" é INFERÊNCIA.

| Nº | Decisão do fundador | Regra ou caso que a toca | Exposição | Pergunta para o advogado |
|---|---|---|---|---|
| 1 | Mercado de previsão em pote, com dinheiro real | Nota Técnica 2958; Medida Provisória 1.394 [A confirmar, AC-01]; Decreto-Lei 3.688, art. 50 | Alta | O pote é aposta de quota fixa, jogo de azar, loteria não autorizada, derivativo ou nenhum deles? |
| 2 | Perguntas sobre fatos on-chain de cripto | Resolução CMN 5.298: "qualquer outra temática", "a critério" da CVM | Alta | Queima, renúncia e liquidez travada são "referencial econômico-financeiro"? Cabe consulta à CVM? |
| 3 | Perguntas de preço por oráculo | Resolução CMN 5.298; declaração da ESMA de 3/7/2026; acordo da CFTC de 2022 | Alta | Pergunta de preço de token é derivativo no Brasil e opção binária na Europa? |
| 4 | Só carteira, sem identificação | Lei 9.613, art. 9º; Nota Técnica 2958; autoridade francesa de jogos | Alta | A empresa é pessoa obrigada? Que identificação mínima é exigida, e de quem? |
| 5 | O cofre do programa guarda USDC e a equipe controla a atualização | Lei 14.478, arts. 2º e 5º; Resolução BCB 520 | Alta | Isso é "custódia ou administração" em nome de terceiros? Precisa de autorização? |
| 6 | Equipe brasileira | Resolução CMN 5.298; Medida Provisória 1.394 [A confirmar, AC-01]; Resolução BCB 520; caso Polymarket | Alta | Empresa no exterior com sócios e desenvolvedores residentes no Brasil: qual é o risco pessoal? |
| 7 | Bloqueio geográfico adiado | Bloqueio dos 27 sites; autoridade francesa; CFTC 2022; termos dos concorrentes | Alta | Quais países bloquear no primeiro dia? O Brasil entra? |
| 8 | Patrocinador anônimo | Lei 9.613, art. 9º; ordem judicial do caso Storm; regras de integridade dos líderes | Alta | A empresa pode receber de um pagador que ela mesma não conhece? |
| 9 | O patrocinador aposta; quem controla o resultado não é impedido | Regras da Polymarket e da Kalshi; Código Penal, art. 171-A | Alta | Que regra mínima de conflito afasta a responsabilidade da plataforma? |
| 10 | Pagamento pelo Cloak | Caso Tornado Cash; Lei 9.613 | Média | Em que condições aceitar fundos vindos de ferramenta de privacidade? |
| 11 | Token A no pump.fun, "para pumpar" | Declaração da SEC sobre meme coins; termos do pump.fun [A confirmar, AC-12] | Média | Que comunicação a equipe pode fazer sobre o token A? Pode negociar o próprio token? |
| 12 | Token B em venda privada | Parecer de Orientação CVM 40; MiCA, art. 4º | Alta | Com que contrato, a quem e em que países se pode vender? |
| 13 | 25% da taxa em recompra e queima do token B | Perguntas e respostas da SEC, pergunta 2.5 | Alta | Anunciar a recompra antes de o produto funcionar é promessa de retorno? |
| 14 | "Dividendo aos holders" | SEC contra DeFi Money Market; Parecer de Orientação CVM 40 | Alta | Existe forma de repasse que não torne o token valor mobiliário? |
| 15 | 25% da taxa em tesouraria de Bitcoin | Nenhuma regra específica encontrada | Baixa | Tratamento contábil e tributário, conforme a sede |
| 16 | Saída antecipada com penalidade | Nota Técnica 2958: equivale ao "cash out" | Média | A saída aproxima o pote da aposta descrita na Nota? |
| 17 | Página do X e publicação de patrocínios | Medida Provisória 1.394 [A confirmar, AC-01]; autoridade francesa (multa de 100 mil euros) | Média | A divulgação das chances a público brasileiro ou francês é publicidade vedada? |
| 18 | Pote de um lado só devolve cobrando taxa | Código de Defesa do Consumidor, por força da Lei 14.478, art. 13 | Baixa | Cobrar taxa numa pergunta sem contraparte exige aviso prévio destacado? |

Fonte: relatório de conformidade, seção 7, condensado.

### 15.2 Brasil

Seis textos tocam o produto. O que cada um diz:

**Resolução CMN nº 5.298, de 24/4/2026, em vigor desde 4/5/2026** (FATO, texto integral, Banco Central). Veda a
oferta e a negociação, no país, de derivativos sobre evento esportivo, jogos on-line e evento político, eleitoral,
social, cultural, de entretenimento "ou de qualquer outra temática que, a critério da Comissão de Valores
Mobiliários, não seja representativa de referencial econômico-financeiro". Vale também para derivativos negociados
no exterior e ofertados aqui. Nenhuma norma posterior da CVM definindo "referencial econômico-financeiro" foi
encontrada até 4/10/2026 [A confirmar, AC-02].

**Nota Técnica SEI nº 2958/2026/MF, de 23/4/2026** (FATO, texto integral, Ministério da Fazenda). Afirma que as
plataformas de mercado de previsão "exploram ilicitamente a modalidade lotérica de aposta de quota fixa" e sugere o
bloqueio. Diz que basta "prêmio previamente determinável". Aponta a falta de identificação de usuários como risco.
Trata a saída antes do fim como equivalente ao "cash out" das casas de aposta.

**O bloqueio de abril de 2026.** A Anatel notificou cerca de 19 mil prestadoras de internet a pedido da Fazenda, em
24/4/2026 (FATO, Anatel). A imprensa listou 27 sites, entre eles Polymarket e Kalshi e duas plataformas on-chain,
Hedgehog Markets e Predict.fun (FATO SECUNDÁRIO, Exame e Folha). Ser on-chain e sem cadastro não tirou ninguém da
lista.

**Medida Provisória nº 1.394, de 25/9/2026.** Segundo a leitura do agente de conformidade, a MP 1.394, de
25/9/2026, proíbe em todo o país a exploração, a oferta, a intermediação e a publicidade de loterias de aposta de
quota fixa, inclusive por agente no exterior que as ofereça a pessoa no Brasil; revoga quase toda a Lei 14.790; e
prevê, para provedores de aplicações, multa de até 10% do faturamento ou R$ 50 milhões por infração **[A
confirmar, AC-01: texto e vigência a conferir no Planalto e com advogado]**. A medida não foi verificada pelo
agente principal, e a tramitação no Congresso não foi conferida. Uma medida provisória depende de conversão em lei.
Se o texto se confirmar, deixa de existir no Brasil o caminho de obter licença de aposta.

**Lei 14.478/2022 e Resoluções BCB 519, 520 e 521** (FATO, a lei; FATO SECUNDÁRIO, prazo e capital). A lei diz que
prestadora de serviços de ativos virtuais só funciona com autorização, e inclui entre esses serviços a "custódia ou
administração de ativos virtuais" em nome de terceiros. Os pedidos de autorização iriam até 30/10/2026, com capital
mínimo de R$ 10,8 a 37,2 milhões [A confirmar na norma, AC-13]. A mesma lei criou o art. 171-A do Código Penal,
"Fraude com a utilização de ativos virtuais", com reclusão de 4 a 8 anos (FATO).

**Lei 9.613/1998, art. 9º** (FATO, trecho). Lista entre as pessoas obrigadas a identificar clientes as sociedades
com "sistemáticas de captação de apostas com pagamento de prêmios" e as prestadoras de serviços de ativos virtuais.
Os arts. 10 e 11, que trazem os deveres, não foram relidos.

**A dúvida central, sem concluir.** O que distingue o pote é que ele não fixa o multiplicador na hora da aposta. No
exemplo da seção 3.3 (300 no SIM, 700 no NÃO), quem põe 1 USDC no SIM receberia 3,23; se depois entram mais 700 no
SIM, passa a receber 1,65. As leis citadas na Nota Técnica definem quota fixa pelo multiplicador definido no
momento da aposta. A mesma Nota, porém, fala em prêmio "determinável" e descreve a bolsa de apostas como aquela em
que o prêmio decorre "da ponderação entre os valores apostados pelos usuários". Há duas leituras, e as duas levam
ao advogado: se o pote for quota fixa, vale o que a Nota concluiu para Polymarket e Kalshi; se não for, sai de uma
definição e pode entrar em outra, como jogo de azar ou loteria não autorizada, em normas que não foram lidas [A
confirmar, AC-21]. Ninguém decidiu o caso do pote.

> **Objeção registrada OBJ-17 · severidade crítica**
> **Decisão do fundador:** "deixar para fazermos a implementação dos bloqueios ao final"; bloquear o Brasil e os
> Estados Unidos: "Por enquanto não, e ainda não sabemos."
> **O que a revisão crítica achou:** a equipe mora no país em que a regra contra o setor é a mais recente, e
> "adiado" não pode significar "depois da rede principal".
> **Evidência:** a Resolução CMN 5.298 e a Nota Técnica 2958 existem (FATO, textos integrais, abr/2026); 27 sites
> foram bloqueados, inclusive plataformas on-chain (FATO SECUNDÁRIO, abr/2026); a Polymarket põe o Brasil entre os
> países que só podem fechar posição (FATO, documentação, 3/out/2026).
> **Alternativa proposta:** bloqueio por endereço de internet no MVP, desde o primeiro dia com dinheiro real, com a
> lista de países decidida com advogado; nenhum material em português nem campanha no Brasil até o parecer.
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir. No roteiro, o bloqueio entra como
> interruptor na fase 5, que é o fim da construção (seção 12.1).

### 15.3 Estados Unidos

**O acordo da CFTC com a Polymarket, de 3/1/2022** (FATO, comunicado da agência). A CFTC é a agência americana
que regula derivativos. Multou a Polymarket em US$ 1,4 milhão por oferecer opções binárias de evento fora de uma
bolsa registrada, e escreveu que a regra vale "regardless of the technology used", isto é, qualquer que seja a
tecnologia usada. Um dos exemplos citados era uma pergunta de preço de cripto.

**Os estados** (FATO, páginas oficiais). Em 2026, Nevada, Illinois, Rhode Island, Connecticut, Missouri e Nova York
moveram ações ou emitiram ordens contra a Polymarket. Nevada incluiu a empresa do Panamá que opera a plataforma
internacional. Nova York a processou em 24/9/2026 por jogo ilegal sem licença.

Duas leituras do agente de conformidade sobre esses casos (INFERÊNCIA): a licença federal não protegeu a operação
americana da Polymarket da lei estadual de jogo; e quase todas as medidas estaduais miram contratos esportivos, que
o Baked Market não oferece. O que os casos têm em comum com o plano é ponto para advogado: uma pergunta de preço,
oferecida a pessoas nos Estados Unidos, por uma plataforma sem registro.

### 15.4 Europa

**França** (FATO, autoridade nacional de jogos, 16 e 17/7/2026). A autoridade mandou bloquear a Polymarket.
Registrou que o bloqueio geográfico que a plataforma já tinha "has been circumvented", isto é, foi contornado.
Citou a falta de identificação dos usuários. A publicidade de jogo não autorizado tem multa de 100 mil euros.
Outros países europeus bloquearam ou baniram mercados de previsão em 2025 e 2026, entre eles Bélgica, Polônia,
Portugal, Itália e Países Baixos (FATO SECUNDÁRIO).

**ESMA, a autoridade europeia de mercados, em 3/7/2026** (FATO, trechos). Declarou que o contrato de evento sobre
uma referência financeira é instrumento financeiro e cai na proibição de opções binárias ao varejo; os demais
podem ser aposta, conforme a lei de cada país. Consequência para o plano, sem concluir: as perguntas de preço têm
uma exposição própria, diferente da das perguntas sobre queima ou liquidez travada, que não aparecem em nenhuma
norma lida.

**MiCA, o regulamento europeu de criptoativos, art. 4º, em vigor desde 30/12/2024** (FATO). A oferta pública de um
criptoativo na União Europeia exige que o ofertante seja pessoa jurídica e publique um documento de informação. Há
isenção do documento para ofertas a menos de 150 pessoas por país, de até 1 milhão de euros em 12 meses ou só a
investidores qualificados. A isenção dispensa o documento, mas não dispensa ser pessoa jurídica. Só pesa se houver
comprador europeu de token.

### 15.5 Tokens

O desenho dos dois tokens está no capítulo 8. Aqui, só o que os reguladores escreveram (FATO, salvo indicação;
ponto para advogado em todas as linhas):

| Documento | O que diz |
|---|---|
| SEC, perguntas e respostas sobre criptoativos, pergunta 2.5 (publicada em 25/9/2026, alterada em 28/9/2026) | Anunciar recompra não é promessa de esforço gerencial quando o sistema é funcional e não tem parte central; pode ser, se o sistema não é funcional e a recompra é apresentada como rendimento. A página avisa que não tem força de lei |
| SEC, declaração sobre meme coins (27/2/2025) | Meme coin com uso limitado ou nenhum não envolve oferta de valor mobiliário; não vale para produto rotulado assim para fugir da lei [A confirmar, AC-12: lida por resumo] |
| SEC contra DeFi Money Market (6/8/2021) | Um token que prometia parte dos lucros foi tratado como contrato de investimento |
| CVM, Parecer de Orientação 40 (11/10/2022) | Contrato de investimento coletivo: expectativa de benefício econômico, esforço de terceiro, oferta pública |
| Termos do pump.fun (data não identificada) | Proíbem usar o token em captação, em repasse de receita e em "pump and dump" [A confirmar, AC-12: lidos por resumo] |
| Textos de venda do PUMP e do WLFI | "no dividend"; "no right to any return, dividend, airdrop or other distribution" (FATO SECUNDÁRIO e FATO) |

Os dois tokens, lado a lado (INFERÊNCIA, relatório de conformidade, seção 3.2):

| | Token A (pump.fun) | Token B (venda privada) |
|---|---|---|
| Quem vende | A curva do pump.fun; a equipe não recebe o dinheiro da compra | A empresa, a compradores escolhidos |
| O que o comprador espera | Nada prometido, se a comunicação for coerente | Queima custeada por 25% da taxa; o fundador falou em "dividendo" |
| De quem depende o valor | Em tese, da demanda | Do volume apostado, isto é, do trabalho da equipe |
| Texto que encosta | Declaração de meme coins; termos do pump.fun | Pergunta 2.5 da SEC; Parecer CVM 40; MiCA, art. 4º |
| Frase do fundador exposta | "vamos usar para pumpar mesmo" | "subir preço e entregar dividendo aos holders" |

Três observações do agente de conformidade (INFERÊNCIA):

1. A proteção descrita na pergunta 2.5 pede duas condições: sistema funcional e ausência de parte central. O Baked
   Market terá uma equipe que abre as perguntas, aciona a resolução, recebe a taxa e executa a recompra.
2. Ligar o token A ao produto, com desconto na taxa, voto em sugestões ou direito ao token B, afasta-o da descrição
   de token "com uso limitado ou nenhum". Sem ligação, ele não serve ao produto. É uma tensão do desenho.
3. A tesouraria de 25% em Bitcoin não apareceu em nenhuma regra lida. É assunto contábil e tributário.

As objeções sobre o "dividendo" e sobre a linguagem e a ordem dos tokens estão nas caixas OBJ-12 e OBJ-13, nas
seções 8.6 e 8.7.

### 15.6 Integridade de mercado

**Decisão.** Não há proibição de apostar para quem controla o resultado. Perguntado se quem coloca prêmio pode
apostar, o fundador respondeu: "Sim."

O que os dois líderes escreveram (FATO, páginas oficiais, 2026): a Polymarket e a Kalshi proíbem negociar a quem
pode influenciar o resultado. Na lista de condutas proibidas da Polymarket está "Trade if you can influence the
outcome". A Kalshi publicou um caso com a sanção aplicada: banimento de 5 anos e penalidade financeira de 10
vezes. A Nota Técnica 2958 trata a possibilidade de o apostador afetar o resultado como um defeito do setor (FATO).

A objeção e o exemplo numérico estão na caixa OBJ-02, na seção 3.7. As alternativas que a revisão de conformidade
propõe mudam a forma, não a decisão, e vão da mais leve à mais dura:

1. Anônimo para o público, identificado para a equipe: o selo mostra "Anônimo" e a equipe sabe quem é.
2. Declaração assinada pela carteira de que o patrocinador não controla a conta lida pela pergunta, com retenção do
   prêmio se a declaração for falsa.
3. Conferência automática na abertura: recusar a aposta de lado quando a carteira é a autoridade da conta lida. Não
   funciona se o dinheiro veio pelo Cloak, e isso precisa estar escrito.
4. Aviso na pergunta: "o patrocinador pode controlar o resultado e pode ter apostado".
5. Anônimo só com prêmio neutro. O fundador decidiu o contrário; é a opção coerente com as regras dos líderes.

Se a plataforma que aceita a pergunta, recebe o patrocínio e oculta o patrocinador entra na descrição do art. 171-A
do Código Penal é ponto para advogado.

### 15.7 Privacidade: o caso Tornado Cash e o Cloak

O Tornado Cash é um serviço de privacidade na rede Ethereum. O que aconteceu, em ordem (FATO, salvo indicação):

| Data | Fato |
|---|---|
| 26/11/2024 | Um tribunal federal americano decide que os contratos imutáveis do Tornado Cash não são "propriedade" de ninguém e, por isso, não podem ser sancionados |
| 21/3/2025 | O Tesouro americano retira a sanção [A confirmar, AC-12: comunicado lido por resumo] |
| 6/8/2025 | Roman Storm, um dos criadores, é condenado. O corpo do comunicado da condenação não foi lido, só o título |

O ponto que interessa ao plano está na ordem da juíza do caso Storm: a decisão sobre os contratos imutáveis não
afetava a acusação, porque o acusado controlava a interface e havia implantado uma triagem de sanções ineficaz.
**Triagem de sanções** é conferir se uma carteira está em lista de sanção antes de aceitar o dinheiro dela.

Três diferenças entre aquele caso e o plano, sem concluir (INFERÊNCIA do agente de conformidade): a proteção
reconhecida vale para código que ninguém controla, e o programa do Baked Market terá chave de atualização e uma
equipe que opera o site; uma triagem de fachada foi usada pela acusação, de modo que uma triagem malfeita pode
pesar contra quem a adota; e o Baked Market não seria o serviço de privacidade, e sim o destinatário de dinheiro
que passou por um.

**O que o Cloak diz fazer** (FATO, documentação do Cloak) [A confirmar, AC-12: lida por resumo]. Toda transação
passa por triagem contra listas de sanção e de alto risco, por um parceiro, antes de ser transmitida; a transação
marcada é bloqueada. O usuário tem uma chave de visualização que gera um relatório das próprias transações. O
relatório de auditoria ainda não foi publicado. A página não diz se a triagem é no depósito ou no saque. A triagem
confere listas, não identifica ninguém, e o resultado não chega ao Baked Market: o patrocinador continua
desconhecido para a equipe, salvo se entregar o relatório da chave de visualização. A proposta de conformidade é
aceitar patrocínio vindo do Cloak só com esse relatório entregue à equipe. Em que condições aceitar esses fundos é
ponto para advogado.

### 15.8 Sem identificação: o padrão do setor

**Decisão.** "100% onchain da solana, via wallet, sem kyc".

O que as plataformas que se apresentam como "sem KYC" fazem na prática (FATO, termos e documentação de cada uma,
lidos em trechos, out/2026):

| Plataforma | Países barrados | Meio | O que os termos dizem |
|---|---|---|---|
| Polymarket (internacional) | Bloqueio total de países sob sanção; uma lista de países que só podem fechar posição, entre eles Brasil, Estados Unidos, Reino Unido, França, Alemanha, Itália e Austrália | Endereço de internet, no site e na interface de programação | Proíbe uso de rede privada virtual; vale a localização física |
| Limitless | Acesso: países sob sanção. Negociação: Estados Unidos e outros | Aviso ao tentar negociar | Maioridade; fora das listas de sanção; a empresa pode exigir prova de idade e de identidade a qualquer momento |
| Myriad | 19 territórios, entre eles Estados Unidos, França, Singapura e Suíça | Declaração do usuário | Não ser residente de território proibido nem estar em lista de sanção |
| pump.fun | Lista de jurisdições proibidas (não extraída); sanções dos Estados Unidos, do Reino Unido, da União Europeia e das Nações Unidas | Não lido | Maioridade; proíbe rede privada virtual e identidades descartáveis |
| Unhedged | Estados Unidos, Reino Unido, França, Singapura, Austrália e outros | Bloqueio por endereço de internet | Identificação "a critério" da empresa ou quando a lei exigir |
| Kalshi | Opera com identificação completa | Cadastro | Barra políticos e pessoas ligadas ao resultado |

O que o quadro mostra (INFERÊNCIA do agente de conformidade):

1. Nenhuma plataforma sem identificação deixa de bloquear os Estados Unidos e os países sob sanção.
2. Todas guardam o direito de pedir identificação depois. No setor, "sem KYC" quer dizer "sem KYC na entrada".
3. O bloqueio por endereço de internet é o meio padrão e é contornável. A autoridade francesa bloqueou a Polymarket
   mesmo com ele.
4. Não foi achada plataforma comparável com equipe declaradamente brasileira.

> **Objeção registrada OBJ-20 · severidade crítica**
> **Decisão do fundador:** "100% onchain da solana, via wallet, sem kyc".
> **O que a revisão crítica achou:** sem identificação nenhuma, o cofre com dinheiro de terceiros e o patrocinador
> desconhecido encostam em deveres legais citados.
> **Evidência:** a Lei 9.613 lista as "sistemáticas de captação de apostas com pagamento de prêmios" entre as
> atividades obrigadas a identificar clientes (FATO, trecho do art. 9º); no setor, "sem KYC" quer dizer sem
> identificação na entrada, com bloqueio por endereço de internet, triagem de sanções e direito de pedir
> identificação depois (FATO, termos dos concorrentes, out/2026; a leitura é INFERÊNCIA).
> **Alternativa proposta:** adotar a definição do setor e identificar o patrocinador perante a equipe, mesmo com o
> selo "Anônimo" ao público.
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir. Se a lei citada se aplica ao Baked
> Market é ponto para advogado.

### 15.9 Estruturas que plataformas parecidas adotaram

**Decisão.** A jurisdição não é assunto agora: "esquece isso, não precisa para agora."

Sem recomendar nenhuma, estas são as estruturas encontradas (FATO SECUNDÁRIO, salvo indicação):

| Estrutura | Quem adotou | O que aconteceu |
|---|---|---|
| Empresa no exterior, sem licença, com bloqueio de países | Polymarket internacional e Limitless, ambas por empresas do Panamá | A Polymarket foi bloqueada por reguladores de jogo de vários países e incluída na ação de Nevada. A imprensa relata que a equipe trabalhava em Nova York |
| Bolsa regulada | Kalshi | Exige identificação. Não protegeu contra as ações dos estados americanos |
| Licença de jogo no exterior | BetDEX, bolsa de apostas em Solana, licenciada na Ilha de Man em 1/11/2022 (FATO, comunicado da empresa) | Aceita apostas só de países selecionados. A licença traz identificação e regras contra lavagem |
| Bloquear o país de origem | A Polymarket bloqueia os Estados Unidos na plataforma internacional | A equipe continuou no país |
| Fundação | Não encontrado exemplo em fonte primária | Informação faltante |

Custos de licença de jogo no exterior (FATO SECUNDÁRIO, fonte comercial, mai/2026): Ilha de Man, 5.250 libras de
pedido e 36.750 por ano; Curaçao, 4.592 euros de pedido e 47.450 por ano. A abertura de uma empresa no exterior
custa de US$ 1,5 a 6 mil, com manutenção de US$ 1 a 2,5 mil por ano (FATO SECUNDÁRIO, prestadores); a avaliação
jurídica do produto e dos termos, de US$ 5 a 15 mil, e o parecer jurídico do token, de US$ 15 a 50 mil (fonte
fraca) [A confirmar, AC-09: pedir cotações].

A leitura do agente de conformidade sobre o caso da Polymarket (INFERÊNCIA): onde as pessoas trabalham importa
tanto quanto o país do registro.

> **Objeção registrada OBJ-18 · severidade crítica**
> **Decisão do fundador:** a jurisdição "não precisa para agora".
> **O que a revisão crítica achou:** sem país e sem pessoa jurídica não há venda de token, tesouraria nem termos
> de uso; a jurisdição deixou de poder ser assunto para depois.
> **Evidência:** o caso da Polymarket mostra que onde as pessoas trabalham pesa tanto quanto o país do registro
> (FATO SECUNDÁRIO, imprensa, 2026); o art. 4º do MiCA exige pessoa jurídica de quem oferta um token na União
> Europeia (FATO); a venda privada não pode ser desenhada sem a jurisdição (INFERÊNCIA).
> **Alternativa proposta:** parecer curto de advogado brasileiro antes de gastar com construção; escolher a
> jurisdição antes de desenhar a venda do token B e a tesouraria.
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 15.10 O que precisa existir antes da rede principal

"Prática" quer dizer adotado pelos concorrentes lidos. "Exigência citada" quer dizer que há texto legal lido que
toca o ponto; se ele se aplica ao Baked Market é ponto para advogado. Fonte: relatório de conformidade, seção 9
(INFERÊNCIA quanto à lista; FATO quanto aos textos citados).

| Nº | Item | Natureza |
|---|---|---|
| 1 | Parecer escrito de advogado brasileiro sobre as linhas 1 a 6 do mapa de exposição | Prática, e condição dos demais |
| 2 | Pessoa jurídica constituída, com sede definida | Exigência citada (MiCA, art. 4º); prática |
| 3 | Termos de uso: quem opera, lei aplicável, idade, países barrados, proibição de rede privada virtual, declaração sobre sanções, direito de pedir identificação depois | Prática; exigência citada (Código de Defesa do Consumidor) |
| 4 | Política de privacidade: carteira, endereço de internet, contas do X de quem sugere, registros de aprovação | Exigência citada (Lei 13.709, não relida) e regra do projeto |
| 5 | Bloqueio por endereço de internet dos países escolhidos, no site e na interface de programação | Prática; a autoridade francesa considerou insuficiente o bloqueio contornável |
| 6 | Triagem de carteiras contra listas de sanção antes de aceitar aposta ou patrocínio | Prática; uma triagem de fachada foi usada pela acusação no caso Storm |
| 7 | Regra de integridade: quem controla ou influencia o resultado não aposta, nem por terceiros; sanção escrita | Prática |
| 8 | Regra para a equipe: não aposta nas perguntas que abre nem negocia com informação interna | Prática |
| 9 | Identificação do patrocinador perante a equipe, mesmo com selo "Anônimo" ao público | Prática; exigência citada (Lei 9.613, art. 9º) |
| 10 | Avisos de risco na tela: o retorno só fica definido no fechamento; aposta grande reduz o retorno; pote de um lado só devolve com taxa; a saída tem penalidade; a resolução é final | Prática; exigência citada (Código de Defesa do Consumidor) |
| 11 | Aviso na pergunta patrocinada: quem pagou, se apostou, se pode controlar o resultado | Ausente nos concorrentes; decorre da seção 15.6 |
| 12 | Registro permanente das decisões da equipe: abertura, recusa, fechamento abaixo de 24 horas, quem aprovou | Decisão já tomada pelo fundador; prática |
| 13 | Divulgação de quem controla a atualização do programa e o cofre; auditoria | Prática |
| 14 | Política de comunicação: sem promessa de ganho, sem divulgar chances a países barrados | Exigência citada (lei francesa; Medida Provisória 1.394 [A confirmar, AC-01]) |
| 15 | Texto dos dois tokens revisado: sem "dividendo", sem promessa de preço; o que cada token não dá | Prática; exigência citada (MiCA) |
| 16 | Venda do token B só depois do produto no ar e do parecer | Decorre da pergunta 2.5 da SEC |
| 17 | Plano de resposta a ordem de bloqueio ou notificação: quem responde, como os usuários sacam | Prática; Connecticut exigiu permitir o saque |
| 18 | Verificação do prazo de 30/10/2026 para pedido de autorização de prestadora, se a linha 5 do mapa for "sim" | Exigência citada, com data de fonte secundária [A confirmar, AC-13] |

Alguns itens tocam decisões do fundador e têm caixa de objeção em outra seção: o 5 (OBJ-17, seção 15.2), o 7 e o 9
(OBJ-02, seção 3.7, e OBJ-20, seção 15.8), o 15 e o 16 (OBJ-12 e OBJ-13, seções 8.6 e 8.7). O item 8 é a regra da
casa proposta na seção 13.5. Os demais são documentos, avisos e rotinas, e não contrariam nenhuma decisão.

### 15.11 Perguntas para o advogado

Em ordem de urgência (relatório de conformidade, 4/out/2026):

1. O pote, operado por equipe residente no Brasil, é aposta de quota fixa, jogo de azar ou loteria não autorizada,
   derivativo, ou nenhum deles? Qual é o risco pessoal dos sócios e dos desenvolvedores, mesmo com empresa no
   exterior e Brasil bloqueado?
2. O cofre do programa, com a equipe controlando a atualização e cobrando taxa, faz da empresa prestadora de
   serviços de ativos virtuais ou pessoa obrigada pela lei de lavagem de dinheiro? Se sim, que identificação é
   exigida?
3. Patrocinador anônimo que controla o resultado e aposta: qual é a responsabilidade da plataforma e que regra
   mínima a afasta?
4. Token B com recompra custeada pela taxa e "dividendo": é valor mobiliário no Brasil, nos Estados Unidos e na
   Europa? A quem e como pode ser vendido? O token A cabe nos termos do pump.fun?
5. Que estrutura (país, tipo de entidade, licença ou nenhuma) e que lista de países barrados adotar antes da rede
   principal?
6. Perguntas de preço por oráculo: derivativo no Brasil, opção binária na Europa?
7. Cabe consulta formal à CVM sobre "referencial econômico-financeiro" para fatos on-chain?
8. A Medida Provisória 1.394 foi convertida, alterada ou perdeu eficácia? O que muda se cair?
9. A página do X e a divulgação de patrocínios são publicidade vedada em algum país-alvo?
10. Aceitar fundos vindos do Cloak cria dever adicional de diligência?

**O que não foi lido** [A confirmar, AC-21 e AC-12]: os arts. 10 e 11 da Lei 9.613; a Lei 13.709, de dados
pessoais; o art. 51 do Decreto-Lei 3.688; os Decretos-Lei 6.259 e 204; os arts. 6º, 7º, 13, 14 e 15 do MiCA e o
título sobre abuso de mercado; o Ofício 6/2026/CVM/SMI; o corpo do comunicado da condenação no caso Storm; os
termos de uso da Polymarket internacional e do PancakeSwap. Foram lidos só por resumo de um modelo auxiliar, e
precisam ser relidos antes de qualquer uso: os termos do pump.fun, a declaração da SEC sobre meme coins, o
comunicado do Tesouro americano de 21/3/2025 e as perguntas frequentes do Cloak.

## 16. Decisões em aberto e próximos passos

### 16.1 Decisões pendentes do fundador

São catorze, em ordem de urgência. Só o fundador pode tomá-las: as ondas de pesquisa levantaram as opções e os
números, mas escolher entre elas é decidir o produto. As quatro primeiras travam o início da construção, porque
viram erro de programa se ficarem para depois do primeiro sprint (seção 12.2).

| Nº | Decisão pendente | O que precisa ser respondido | Onde estão as opções |
|---|---|---|---|
| 1 | O "70/30" do patrocínio | Qual parte é da banca e qual é do pote; se a parte da banca vai inteira para a operação ou se divide em quatro; se o dinheiro do patrocinador dentro do pote paga os 3% | Seções 3.7 e 7.4 |
| 2 | Pote de um lado só | A tabela completa: para onde vão o prêmio neutro e as penalidades em cada caso, e o valor da taxa nesse caso | Seção 3.4 |
| 3 | Saída antecipada | Aceita que a saída não dê ganho, só devolução com penalidade? A penalidade é marcada por lado? A saída nasce desligada por pergunta? Cobra 3% sobre o valor devolvido? Uma parte da penalidade pode ir para a banca? | Seções 3.6 e 11.6 |
| 4 | Fechamento | A regra para perguntas longas e a duração máxima no MVP | Seções 3.5 e 12.4 |
| 5 | Cardápio do primeiro dia | Quais tipos abrem; perguntas decididas por uma chave ficam fora, ou entram com selo e teto; preço de token pequeno; aceitar a Pyth como "oráculo que resolve on-chain" | Seções 4.2, 4.4 e 4.5 |
| 6 | Patrocinador anônimo | Mantém a aposta de lado em qualquer pergunta? O patrocinador se identifica perante a equipe? | Seções 3.7 e 15.6 |
| 7 | Taxa | A regra de partida e o seu gatilho; a forma da taxa (teto pelo lado perdedor) | Seções 7.2 e 7.3 |
| 8 | Custos e capital | O nível de custo real; quanto os sócios põem e por quanto tempo; quando passam a receber; o critério de parada | Capítulo 9 e seção 13.1 |
| 9 | Tokens | "30% do arrecadado" no lugar de "30% de cada compra"? O "dividendo" sai do plano, ou de qual fatia vem? A função Holder Rewards do pump.fun fica ligada? Qual o momento do token A em relação ao produto? | Seções 8.4, 8.6, 8.7 e 12.5 |
| 10 | Bloqueio geográfico e jurisdição | Quais países, e se o Brasil entra; em que país fica a empresa | Seções 15.2, 15.8 e 15.9 |
| 11 | Chaves e regras da casa | Quem são as três chaves do multisig; quem atende o alarme; a equipe pode apostar; pode haver pergunta sobre o token da casa | Seções 11.4 e 13.5 |
| 12 | Resolução errada por falha do serviço | A empresa indeniza? Com que dinheiro? | Seções 4.7 e 11.5 |
| 13 | Teste de demanda e hackathon | Testar a demanda antes de reescrever o programa? Submeter ao hackathon o que já existe? | Seções 2.5 e 9.6 |
| 14 | Nome e criadores | "Baked Market" no singular; quem sugere ou cria uma pergunta ganha parte da taxa? | Seção 3.10 e capítulo 7 |

Sobre o item 14, o fundador já disse: "acho justo que quem criar possa ganhar uma parte da pergunta." Como hoje é
a equipe que cria, a regra fica em aberto até haver quem a receba.

### 16.2 Perguntas para o sócio técnico

As seis primeiras são as do briefing do modelo de pote, que seguem sem resposta registrada. As demais vieram da
revisão técnica.

1. O que do modelo de pote você considera errado ou perigoso, tecnicamente?
2. Faz sentido um programa novo ao lado do atual, ou uma versão 2 do mesmo?
3. Quanto custa dar suporte ao padrão Token-2022 nos leitores, já que você mapeou o formato? Quanto processamento
   custa percorrer as extensões desse padrão dentro de cada aposta?
4. Preço pela Pyth: você vê forma segura de ler num instante marcado? Aceita exigir preço fresco em toda aposta de
   pergunta de preço?
5. O que dos documentos de economia e de privacidade você quer manter?
6. Submetemos o modelo atual ao hackathon e seguimos com o pote depois?
7. Quem tem hoje a chave de atualização do programa? [A confirmar, AC-18]
8. Quanto tempo você tem, e para quais sprints?
9. Aceita o terceiro resultado, "Anulada"?
10. Aceita trocar os prazos de blocos por data e hora?
11. Em que termos o código atual pode ser reaproveitado? O acordo precisa estar escrito antes do sprint 2 (seção
    13.3).

#### Perguntas para o advogado

As dez perguntas para o advogado, em ordem de urgência, estão na seção 15.11. A primeira decide todas as outras: o
que é o pote, perante a lei, quando operado por uma equipe que mora no Brasil. Em seguida vêm o cofre e a
identificação, o patrocinador anônimo que aposta, os dois tokens, a estrutura e os países, as perguntas de preço, a
consulta à CVM, a situação da Medida Provisória 1.394, a publicidade e os fundos vindos do Cloak. A revisão de
conformidade propõe que essa consulta seja o primeiro gasto, antes da construção (seção 16.4, passo 3).

### 16.3 A confirmar

Vinte e oito pontos não puderam ser verificados. No texto, cada um aparece com a marca **[A confirmar]**.

| Código | Ponto | O que falta |
|---|---|---|
| AC-01 | Medida Provisória nº 1.394, de 25/9/2026 | Foi lida só pelo agente de conformidade; conferir texto e vigência no Planalto e com advogado; tramitação não conferida |
| AC-02 | Regulamentação da CVM para a Resolução 5.298 | Nenhuma norma encontrada até 4/10/2026; um ofício da CVM não foi lido |
| AC-03 | Preços de destaque pago | Tabelas do DexScreener, do CoinGecko, do CoinMarketCap e do DEXTools sem fonte oficial ou antigas |
| AC-04 | Dados do Melee | Beta sem dinheiro real vem de fio de usuário; taxa, data da rede principal e token não encontrados |
| AC-05 | Régua do DefiLlama | O método para a Kalshi não é declarado; a correção da contagem dupla da Polymarket não tem data confirmada |
| AC-06 | Projeção da Bernstein | O relatório original e o método não foram lidos; não fecha com o ritmo atual |
| AC-07 | O "70/30" | Qual parte é da banca; se ela se divide em quatro; se o dinheiro do patrocinador no pote paga os 3% |
| AC-08 | Aposta média, frequência e pessoas reais | Não há dado em nenhuma plataforma; é premissa sem dado em todo uso |
| AC-09 | Custos de auditoria, de empresa e de pareceres | Só faixas de blogs de fornecedores; pedir três cotações |
| AC-10 | Cloak e SODAX | Tamanho atual do cofre do Cloak; relatório de auditoria; se entregam a endereço de programa; se o SODAX paga comissão a quem integra |
| AC-11 | O Tuk Tuk não consegue acionar a resolução | Vem do documento de um concorrente; o código do Tuk Tuk não foi lido |
| AC-12 | Textos lidos só por resumo de modelo auxiliar | Termos do pump.fun; documentos da SEC na releitura; comunicado do Tesouro americano; perguntas frequentes do Cloak |
| AC-13 | Prestadoras de ativos virtuais | Prazo de 30/10/2026 e capital mínimo vêm de fonte secundária; conferir na norma |
| AC-14 | Números de audiência de fonte fraca | Usuários ativos da Phantom; carteiras mensais do pump.fun; usuários diários de Solana |
| AC-15 | Pyth | Lista dos 64 ativos com conta fixa; disponibilidade na rede de testes; taxa por atualização |
| AC-16 | Congelamento do USDC | A autoridade de congelamento do registro do USDC não foi lida |
| AC-17 | Limites técnicos | Limite do endereço público de acesso à rede; teto de processamento por conta por bloco |
| AC-18 | Chave de atualização do programa | Quem a tem hoje |
| AC-19 | Documento de design e nome | O documento de design ainda descreve a direção anterior; "Market" no singular sem resposta; nenhuma base de marcas consultada |
| AC-20 | Token A | Holder Rewards ligado ou não; se a carteira do fundo de prêmios pode ser uma conta de programa na divisão da taxa de criador |
| AC-21 | Leis não lidas | Arts. 10 e 11 da Lei 9.613; Lei 13.709; art. 51 do Decreto-Lei 3.688; Decretos-Lei 6.259 e 204; MiCA, arts. 6º, 7º, 13, 14 e 15 |
| AC-22 | Limitless | Causa do salto de maio e da queda até setembro de 2026 |
| AC-23 | Mercados de pump.fun na Polymarket | O total de US$ 262,81 mil vem de agregador, sem data |
| AC-24 | Volume de apostas e preço do Bitcoin | A hipótese de que caem juntos não foi verificada |
| AC-25 | Fórmula da saída | A simulação com apostadores estratégicos não foi feita; os parâmetros não têm referência |
| AC-26 | Tabela de taxas da Kalshi | A página oficial não abriu; a fórmula vem de fonte secundária |
| AC-27 | Hackathon Colosseum | Valores de prêmio e de aceleração não conferidos |
| AC-28 | PNP e outros | Outros programas do PNP não medidos; se PancakeSwap Prediction e Hyperliquid resolvem on-chain: não verificado |

### 16.4 Próximos passos, em ordem

1. Revisão deste plano pelo fundador e versão v0.0.2, com análise de impacto de cada mudança.
2. Decisões pendentes de regra (lista da seção 16.1), a começar pelo sentido do "70/30", pela tabela do pote de um
   lado só, pelo destino da penalidade e pelo cardápio do primeiro dia.
3. Consulta a advogado brasileiro com prática em cripto, antes de gastar com construção: enquadramento do pote,
   jurisdição, lista de países, patrocinador anônimo, tokens.
4. Acordo escrito com o sócio técnico, respostas às perguntas do briefing, prazo e dedicação; definição de quem
   guarda a chave de atualização e de quem é a terceira chave do multisig.
5. Teste de demanda: 10 a 15 conversas com o público-alvo, beta com pontuação e sem dinheiro, e três cartas de
   intenção de patrocinadores.
6. Três cotações de auditoria e orçamento de pré-lançamento.
7. Fase 1 do roteiro: o pote na rede de testes.

A ordem tem um motivo. Os passos 2 a 6 custam pouco e respondem às perguntas que mais pesam: se a regra fecha, se a
lei deixa, se quem constrói está junto, se alguém quer o produto e quanto custa protegê-lo. O passo 7 é o primeiro
que consome meses de trabalho. Fazer os seis primeiros antes dele é o que separa um plano de uma aposta.

## Anexo A. Glossário

Os termos estão em ordem alfabética, com uma definição e um exemplo. Os números dos exemplos são os do corpo do
plano, onde aparecem com etiqueta e fonte.

| Termo | Definição | Exemplo |
|---|---|---|
| Acesso à rede (RPC) | Serviço pago que deixa o site ler a blockchain e enviar transações | Helius, de US$ 49 a 999 por mês |
| Aposta | O valor que uma carteira põe num lado; fica registrado em nome dela, sem virar token | Ana põe 100 USDC no SIM |
| Aposta de patrocinador | O dinheiro do patrocinador entra num lado, como uma aposta grande, com selo | 3.500 no SIM: o SIM passa a pagar 1,378 e, se der SIM, o patrocinador recebe 4.824 |
| Auditoria | Revisão do programa por uma empresa de segurança independente, antes de receber dinheiro real | De US$ 15 a 45 mil, segundo blogs de auditores |
| Avaliação | Quanto vale o total de tokens ao preço da venda | Vender 15% por US$ 750 mil é uma avaliação de US$ 5 milhões |
| Banca | A empresa que opera a plataforma e recebe a taxa | "A banca nunca perde" é a frase do fundador para a taxa no pote de um lado só |
| Bloqueio geográfico | Impedir o acesso de certos países ao site, em geral pelo endereço de internet | A Polymarket deixa o Brasil só fechar posição |
| Carteira | Aplicativo que guarda as chaves do usuário e assina as transações; é a única "conta" do usuário no Baked Market | Phantom |
| Carteiras múltiplas | Sem identificação, uma pessoa abre quantas carteiras quiser; regra "por carteira" não segura ninguém | Um limite de 100 USDC por carteira se contorna com dez carteiras |
| Chance | A fatia do pote que está em cada lado, mostrada na tela; não é preço nem probabilidade garantida | 300 no SIM de um pote de 1.000: a tela mostra SIM 30% |
| Chave de atualização | A carteira que pode trocar o código do programa; quem a tem pode esvaziar todos os cofres | Deve ficar num multisig |
| Cloak | Serviço de privacidade em Solana que esconde quem pagou a quem | O patrocinador saca para uma carteira nova e patrocina com ela |
| Cofre | A conta de USDC de uma pergunta, que pertence ao programa; só ele assina a saída de dinheiro | Um cofre por pergunta |
| Colheita de prêmio | Apostar nos dois lados só para levar o prêmio neutro, sem opinião sobre a pergunta | Pote vazio com 100 de prêmio: quem põe 1 em cada lado recebe 98,94 |
| Compilação verificável | Prova pública de que o código que roda na rede é o do repositório | Qualquer pessoa confere com uma ferramenta |
| Contrapartida | O que o patrocinador recebe em troca: selo, destaque, posição fixa, texto na pergunta, publicação no X | Selo "Patrocinado por X" e 72 horas de destaque na página inicial |
| Curva de ligação (bonding curve) | Fórmula em que o preço sobe conforme entra dinheiro; quem entra cedo paga menos | No pump.fun, 793,1 milhões de tokens são vendidos pela curva |
| Desbloqueio | Tokens que saem da trava e podem ser vendidos | 1,53% da oferta por mês |
| Dinheiro travado | O total parado dentro dos potes ou de um protocolo num dado momento | O World tinha US$ 170,8 mil travados |
| Dólares pagos | Jeito de medir volume somando o que foi desembolsado; é o comparável com um pote | 100 contratos comprados a US$ 0,27 dão 27 de dólares pagos |
| Empréstimo relâmpago | Empréstimo tomado e devolvido dentro da mesma transação; serve para mover um número por um instante | Comprar com 41 SOL emprestados, dobrar o preço de uma pool pequena, resolver e devolver |
| Época | O "dia" da Solana para contas de stake; dura cerca de dois dias | "O JitoSOL começa a época 850 com 15 milhões de SOL?" |
| Fechamento | O momento em que as apostas param, antes da data final, para ninguém entrar já sabendo o resultado | Pergunta de 30 dias fecha no dia 24 (80% da duração) |
| Formador de mercado automático (AMM) | Um contrato com uma fórmula faz o papel da contraparte; sempre há preço, mas ele piora em compras grandes | A Limitless usa um, com taxa de 0,40% |
| Formatura (no pump.fun) | O momento em que um token vende toda a curva inicial e passa a ser negociado numa pool comum | Só 0,26% dos tokens se formavam em junho de 2026 |
| Fundo de prêmios | Reserva da banca, alimentada por 25% da taxa, para pôr prêmio nos potes e dar ao primeiro apostador um motivo para entrar | Com US$ 1 milhão apostado no mês, o fundo recebe US$ 7.500 |
| Giro | Quantas vezes o mesmo dólar é apostado num período; no pote, o dólar entra uma vez por pergunta | No World, cada dólar girou cerca de 90 vezes no mês |
| Identificação (KYC) | Conferência de quem é o usuário, com documento | A Kalshi exige; o Baked Market, por decisão, não |
| Lado | Cada uma das duas respostas possíveis, SIM ou NÃO | Com 300 no SIM e 700 no NÃO, o lado do NÃO é o maior |
| Leitor on-chain | Parte do programa que abre uma conta da Solana, lê um número ou uma chave e responde sim ou não, sem ninguém informar nada | O leitor de queima lê a oferta do token e compara com a meta |
| Linha dos 3,09% | Tamanho do prêmio, em relação às apostas, a partir do qual os apostadores, somados, deixam de perder para a taxa | Num pote de 10.000, um prêmio acima de 309 |
| Liquidez travada | Dinheiro posto numa pool de negociação e travado para sempre, para o token sempre poder ser trocado | 100 SOL travados na pool T/SOL da Meteora |
| Livro de ordens | Lista de ofertas de compra e de venda; compra-se de outra pessoa, a um preço conhecido | 100 ações SIM a US$ 0,60 custam 60; se der SIM, viram 100 |
| Média no tempo | Em vez do preço de um instante, a média do preço durante um período; resiste a picos | Um pico de 15 segundos move 3,9% uma média de 30 minutos |
| Mercado de previsão | Lugar em que pessoas apostam dinheiro no resultado de uma pergunta sobre o futuro | "O SOL toca US$ 300 até 31 de dezembro?": quem acha que sim aposta no SIM |
| Multisig | Carteira que só assina quando várias pessoas aprovam | 2 de 3: duas de três pessoas precisam assinar |
| Nível de custo | Três tamanhos de operação: 1, ninguém recebe (US$ 3.000 por mês); 2, equipe enxuta (US$ 10.000); 3, número do sócio (US$ 25.000) | O plano de partida é o nível 1 |
| On-chain | Gravado na blockchain, onde qualquer pessoa pode conferir | A oferta total de um token é um número on-chain |
| Oráculo | Serviço que traz para dentro da blockchain um dado de fora dela | A Pyth publica o preço do Bitcoin assinado por corretoras |
| Oráculo com votação (UMA) | Alguém propõe o resultado deixando uma caução; se contestado, detentores de um token votam | Na Polymarket: caução de cerca de US$ 750, 2 horas para contestar |
| Patrocinador | Quem paga uma das três faixas (US$ 500, 1.500 ou 5.000) para pôr dinheiro numa pergunta e receber contrapartidas | Um projeto paga US$ 1.500 numa pergunta sobre a própria queima |
| Pausa | Poder da equipe de parar apostas novas numa emergência, sem bloquear resgates | Um defeito é descoberto: a equipe pausa as apostas |
| Pedido de pergunta | O patrocinador pede uma pergunta e deixa o pagamento travado; a equipe aceita ou recusa, e a recusa devolve tudo | Depósito de US$ 1.500 travado até a análise |
| Penalidade | A parte da aposta que quem sai deixa para trás | Ana pôs 100 e sai cedo: 22,28 ficam no pote |
| Pergunta | Uma frase com resposta SIM ou NÃO, uma data final e uma regra de como se decide | "A oferta do token T cai para 900 milhões até o dia 30?" |
| Pergunta anulada | Terceiro resultado proposto, além de SIM e NÃO: a pergunta não pôde ser decidida e as apostas voltam | A conta que seria lida deixou de existir depois do prazo |
| Pergunta de "toque" | Pergunta de preço que dá SIM se o preço encostar no alvo em qualquer momento do prazo | "O BTC toca US$ 80.000 até o dia 30?" |
| Ponto de equilíbrio | O volume apostado por mês em que a parte da taxa que vai para a operação paga o custo | Com custo de US$ 3.000: US$ 471 mil por mês |
| Pote (pool) | O cofre de uma pergunta: todas as apostas entram nele e, no fim, quem acertou divide o que sobrou depois da taxa | 300 USDC no SIM e 700 no NÃO formam um pote de 1.000 |
| Pote de um lado só | Pergunta em que só um lado recebeu apostas; não há perdedor para pagar o vencedor | Ana põe 100 no SIM, ninguém entra no NÃO: ela recebe 97 |
| Prêmio neutro | Dinheiro somado ao pote sem escolher lado; aumenta o retorno de quem acertar, qualquer que seja o resultado | US$ 350 de prêmio num pote de 10.000 fazem o SIM pagar 1,673 em vez de 1,617 |
| Programa | O código que roda na Solana e guarda o dinheiro dos potes | O programa de pote do Baked Market |
| pump.fun | Plataforma de Solana em que qualquer pessoa lança um token em minutos, vendido por uma curva de preço | O token A será lançado lá |
| Pyth | Rede de oráculos de preço em que corretoras e formadores de mercado publicam preços assinados, que o programa confere | "O SOL toca US$ X?" se decide com um preço assinado da Pyth |
| Queima | Destruir tokens para sempre, reduzindo a oferta | Um projeto queima 10% da oferta do próprio token |
| Recompra e queima | A empresa usa parte da receita para comprar o próprio token no mercado e destruí-lo, reduzindo a oferta | 25% da taxa: com US$ 1 milhão apostado no mês, US$ 7.500 |
| Rede principal (mainnet) e rede de testes (devnet) | A rede em que o dinheiro é real e a rede de ensaio, com dinheiro de mentira | O programa atual só existe na rede de testes |
| Regime (a) e regime (b) | (a): a taxa se divide em quatro desde o primeiro dia. (b): regra de partida, em que Bitcoin e recompra esperam em USDC e cobrem o déficit até a operação se pagar | No cenário razoável, o (a) chega ao azul no mês 8 e o (b), no mês 6 |
| Renúncia de autoridade | O dono de uma chave abre mão, para sempre, do poder de criar tokens novos, de congelar carteiras ou de alterar um programa | O time renuncia à emissão: ninguém mais cria tokens novos |
| Resgate | O ato de o vencedor retirar a sua parte depois da resolução | Ana tinha 100 no SIM, deu SIM: ela resgata 323 |
| Resolução | O ato de gravar o resultado da pergunta, de forma definitiva | Qualquer pessoa aperta "Resolver"; o programa lê a rede e grava SIM |
| Retorno | Quanto cada 1 USDC apostado recebe se o lado ganhar; só fica definido quando as apostas fecham | No pote de 300 e 700, o SIM recebe 3,23 por 1 e o NÃO, 1,39 |
| Saída antecipada | Desistir da aposta antes da resolução e receber parte do dinheiro de volta | Ana pôs 100, sai cedo e recebe 77,72 |
| Selo | Marca visível na pergunta dizendo quem patrocinou, ou "Anônimo" | "Patrocinado por Projeto T" |
| Sentido A e sentido B do "70/30" | As duas leituras da frase do fundador. A: 70% do patrocínio para a banca, 30% para o pote. B: o contrário | Faixa de US$ 500: no A, 150 vão ao pote; no B, 350 |
| Serviço agendado (cron) | Programa de computador que acorda de tempos em tempos e faz uma tarefa sozinho; aqui, chamar a resolução | A cada minuto o serviço confere se alguma pergunta já pode ser resolvida |
| SODAX | Serviço que traz dinheiro de outras blockchains e entrega USDC na carteira em Solana | Quem tem dinheiro na rede Base chega com USDC em Solana, pagando 0,1% |
| Solana | A blockchain em que o produto roda | As apostas são transações na Solana |
| Taxa | A parte do pote que fica com a banca: 3% | Pote de 1.000: 30 de taxa, 970 para os vencedores |
| Taxa efetiva | Quanto a plataforma arrecada dividido pelo que os usuários pagaram | Polymarket: 2,0% em setembro de 2026 |
| Tesouraria em Bitcoin | Reserva da empresa guardada em Bitcoin | 25% da taxa convertidos em Bitcoin todo mês |
| Teto de pote | Valor máximo que uma pergunta aceita, fixado na criação, para o prêmio nunca valer mais que o custo de forçar o resultado | Pergunta de queima com teto de 5.000 USDC |
| Token A | O token do Baked Market lançado no pump.fun; especulativo, sem direito a receita | Decisão do fundador: "é expeculativo" |
| Token B | O token do Baked Market desenhado pela empresa e vendido em venda privada | É o que recebe a recompra e queima |
| Token-2022 | O segundo programa de tokens da Solana, com funções extras embutidas no próprio token; é o padrão dos tokens novos do pump.fun | Um token desse padrão pode cobrar taxa em cada transferência |
| Trava de tempo | Espera obrigatória entre aprovar e executar uma mudança, para o público ver antes | Mudança de taxa só vale 48 horas depois de aprovada |
| Trava e liberação gradual | Contrato que segura tokens e os solta num calendário | Equipe: 18 meses parado e 30 de liberação |
| Triagem de sanções | Conferir se uma carteira está em lista de sanção antes de aceitar o dinheiro dela | O Cloak diz fazer isso antes de cada transação |
| USDC | Moeda digital que vale 1 dólar, emitida pela Circle | Apostar 100 USDC é apostar 100 dólares |
| Valor de face | Jeito de medir volume somando cada contrato a US$ 1 | 100 contratos comprados a US$ 0,27 dão valor de face de 100 |
| Venda privada ("ICO privado") | Venda de tokens a compradores escolhidos, por contrato, antes de o token estar no mercado, com trava | Vender 15% da oferta a um grupo de compradores |

## Anexo B. Fontes

Este plano não fez pesquisa própria na internet: todos os números vêm dos arquivos abaixo, lidos em 4 de outubro
de 2026. Os endereços das fontes externas estão na seção "Fontes" de cada arquivo.

**Decisões e plano**

| Arquivo | O que cobre |
|---|---|
| `docs/business/ideacao-perguntas-e-respostas.md` | As cinco rodadas de perguntas e respostas do fundador. É a fonte da verdade do produto |
| `docs/business/BRIEFING-MERCADO-DE-POTE.md` | O briefing do modelo de pote para o sócio técnico. É anterior à quinta rodada e está superado em três pontos: saída, divisão da taxa e rendimento do pote |
| `docs/business/_review/plano-das-ondas.md` | O plano das três ondas de pesquisa e as regras de etiqueta dos números |
| `docs/business/_review/wave-3-coordinator.md` | A ficha de consistência: decisões, contradições resolvidas, números canônicos, objeções e roteiro deste plano |

**Onda 1: pesquisa**

| Arquivo | O que cobre |
|---|---|
| `knowledge-base/competitors/competitor-longlist.md` | A lista de vinte concorrentes |
| `knowledge-base/competitors/top-5-competitor-analysis.md` | A análise dos cinco principais e as duas réguas de volume |
| `knowledge-base/market/market-research.md` | Tamanho do mercado e projeções |
| `knowledge-base/market/publico-web3.md` | O público web3 e o pump.fun em números |
| `knowledge-base/market/regulacao.md` | Regulação, por imprensa e escritórios; corrigida pelo relatório de conformidade |
| `knowledge-base/market/monetizacao-e-tesouraria.md` | Formas de receita, patrocínio, fundo de prêmios, tesouraria em Bitcoin e recompra |
| `knowledge-base/market/dois-tokens-e-ico-privado.md` | O desenho dos dois tokens e a venda privada |
| `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md` | Saída antecipada, fechamento das apostas, serviço agendado e tipos de pergunta |

**Onda 2: revisão crítica**

| Arquivo | O que cobre |
|---|---|
| `docs/business/_review/wave-2-devils-advocate.md` | As premissas frágeis do plano e o que continua de pé |
| `docs/business/_review/wave-2-business-finance.md` | Os furos do modelo de negócio, custos e capital |
| `docs/business/_review/wave-2-technical-security.md` | Manipulação do pote, saída, resolução, chaves, contas, privacidade, site e os trinta requisitos |
| `docs/business/_review/wave-2-compliance.md` | Normas e casos no Brasil, nos Estados Unidos e na Europa; mapa de exposição; perguntas para o advogado |
| `docs/business/_review/wave-2-modelo-financeiro.md` | Os três cenários, os dois regimes, o equilíbrio, o capital e as sensibilidades |
| `docs/business/_review/wave-2-viabilidade-mvp.md` | O inventário do código, as cinco fases, os doze sprints e os papéis |

**Apoio**

| Arquivo | O que cobre |
|---|---|
| `knowledge-base/market/receita-mercados-de-previsao.md` | Como os mercados de previsão ganham dinheiro, com as taxas de cada um |
| `knowledge-base/market/patrocinio-e-destaque-pago.md` | Preços de destaque pago e programas de patrocínio |
| `knowledge-base/market/modelos-de-token.md` | Modelos de token e as regras do pump.fun |
| `knowledge-base/tecnologia/privacidade-entre-redes-e-x.md` | Cloak, SODAX e a integração com o X |
| `knowledge-base/pesquisa-nome-do-site.md` | A pesquisa do nome |
| `knowledge-base/referencias/` | Documentação da Polymarket e da Kalshi |
| `LICENSE` | A licença do código |

Não entraram neste plano: `knowledge-base/market/rendimento-do-pote.md`, porque o assunto foi abandonado pelo
fundador; `knowledge-base/competitors/mercados-de-previsao-web3.md`, substituído pelas pesquisas de concorrentes da
Onda 1; e os documentos do sócio técnico sobre economia, tipos de pergunta e privacidade, que ainda não estão no
ramo principal do repositório e foram citados pelo que os relatórios das ondas trouxeram deles.

## Anexo C. Índice das objeções registradas

Vinte e nove objeções: doze críticas, treze altas, duas médias e duas baixas. A caixa de cada uma, com a evidência
e a alternativa, está na seção indicada.

| Código | Decisão atacada | Objeção, em uma frase | Severidade | Seção da caixa |
|---|---|---|---|---|
| OBJ-01 | Apostas em fatos on-chain para o público web3 | Ninguém demonstrou que esse público quer apostar nisso | Crítica | 2.5 |
| OBJ-02 | Patrocinador anônimo escolhe qualquer forma; quem controla o resultado pode apostar | É a combinação que os líderes do setor proíbem | Crítica | 3.7 |
| OBJ-03 | Tipos de pergunta em aberto | Perguntas decididas de graça por uma chave são opção gratuita para o dono da chave | Crítica | 4.2 |
| OBJ-04 | Saída antecipada no MVP | A peça mais nova e perigosa não deve nascer ligada em todas as perguntas | Crítica | 3.6 |
| OBJ-05 | "Uma penalidade pro pote" | A penalidade volta para quem domina o lado vencedor | Crítica | 11.6 |
| OBJ-06 | "Ganho proporcional menor" na saída | Num pote puro não existe ganho para realizar antes do fim | Alta | 3.6 |
| OBJ-07 | Taxa de 3% do pote | A taxa fixa sobre o pote inteiro castiga quem aposta no favorito | Alta | 7.2 |
| OBJ-08 | Pote de um lado só devolve cobrando taxa | A taxa pune o primeiro apostador | Alta | 3.4 |
| OBJ-09 | Divisão da taxa em quatro | Sobra 0,64% do volume para pagar a operação | Crítica | 7.3 |
| OBJ-10 | 25% para tesouraria em Bitcoin | A base é a taxa bruta, antes de qualquer custo | Alta | 7.6 |
| OBJ-11 | 25% para recompra e queima do token B | A recompra é pequena perto dos desbloqueios | Alta | 8.5 |
| OBJ-12 | "Subir preço e entregar dividendo aos holders" | O "dividendo" não tem fonte e é a palavra que os reguladores citam | Alta | 8.6 |
| OBJ-13 | Token no pump.fun "para pumpar", lançado primeiro | A linguagem e a ordem corroem a confiança que uma casa de apostas vende | Alta | 8.7 |
| OBJ-14 | 30% de cada compra do token para as pools | Como taxa permanente, 30% destrói o comprador | Média | 8.4 |
| OBJ-15 | Faixas de 500, 1.500 e 5.000 | É preço de vitrine, sem vitrine e sem precedente pago | Alta | 7.4 |
| OBJ-16 | 25% para o fundo de prêmios | O fundo só se paga se causar um quarto de todo o volume | Alta | 7.5 |
| OBJ-17 | Bloqueios geográficos para o fim | A equipe mora no país em que a regra contra o setor é a mais recente | Crítica | 15.2 |
| OBJ-18 | Jurisdição "não é assunto agora" | Sem país e sem pessoa jurídica não há venda de token, tesouraria nem termos de uso | Crítica | 15.9 |
| OBJ-19 | Divisão com o sócio "por enquanto é irrelevante" | Uma pessoa só domina o programa, sem acordo nem prazo | Crítica | 13.3 |
| OBJ-20 | "Sem kyc" | Sem identificação nenhuma, o cofre e o patrocinador desconhecido encostam em deveres legais citados | Crítica | 15.8 |
| OBJ-21 | Fechamento em 80% com mínimo de 24 horas; perguntas longas | O mínimo de 24 horas trava as perguntas curtas; as longas não cabem no MVP | Alta | 3.5 |
| OBJ-22 | "Sem limite de compra" | Toda pergunta precisa de teto de pote | Alta | 3.3 |
| OBJ-23 | Cloak e SODAX | Integrados, põem código de terceiros na página de aposta; o Cloak não esconde um patrocínio grande | Alta | 3.9 |
| OBJ-24 | Preço de token pequeno como pergunta | O preço lido num instante pode ser movido e devolvido na mesma transação | Alta | 4.4 |
| OBJ-25 | Resolução acionada por serviço agendado da plataforma | Se o serviço falha, um SIM verdadeiro vira NÃO, para sempre | Crítica | 4.7 |
| OBJ-26 | Dinheiro real na rede principal, com o escopo do MVP | É um programa novo, sem auditoria, com mais de dez sistemas novos | Crítica | 12.1 |
| OBJ-27 | Como se fala do produto | "Sem oráculo", "anônimo" e "ninguém controla" prometem o que o produto não entrega | Média | 4.8 |
| OBJ-28 | O nome Baked Market | "Baked" tem a gíria de "chapado" e "baked in" quer dizer "já decidido de antemão" | Baixa | 3.10 |
| OBJ-29 | Hackathon "não precisa para agora" | Uma fonte barata de capital e de validação está sendo deixada passar | Baixa | 9.6 |
