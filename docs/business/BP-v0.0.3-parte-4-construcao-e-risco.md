# Brot Markets — Business Plan v0.0.3 — Parte 4: Construção e risco

**Data:** 8 de outubro de 2026.
**Estado:** rascunho para revisão do fundador. Derivada do pitch de 7 de outubro de 2026, por ordem dele. Onde o
pitch e a v0.0.2 discordam, vale o pitch; onde ele se cala, vale a v0.0.2, mais curta. Substitui a Parte 4 da
v0.0.2, que fica na pasta como versão anterior, porque o resumo de produto, o plano técnico e os arquivos das sprints
citam as seções dela.

**Como ler.** As marcas são as das outras partes: **Decisão** (do fundador, em 4 ou 5/10/2026), **Decisão do pitch**
(regra do deck de 7/10/2026, citada em inglês como está na tela) e **Proposta, aguardando decisão**. Fatos de fora
trazem FATO, FATO SECUNDÁRIO ou INFERÊNCIA. "v0.0.2, P4 §4.4" quer dizer Parte 4 da versão anterior, seção 4.4. Mas
"Decisão (P1)" a "(P8)" são as oito decisões de construção de 5/10/2026 (capítulo 8), e não as partes do plano. Os
valores estão em dólares.

**O que esta parte é.** O que será construído e em que ordem, o que protege o dinheiro de quem entra e o que pode
dar errado. Não é o plano técnico nem parecer jurídico.

Oito termos. **Programa** é o código que roda na Solana e guarda o dinheiro. **Instrução** é cada operação que o
programa aceita, como abrir um mercado. **Devnet** é a rede de testes; **rede principal**, a de dinheiro real.
**Auditoria** é a revisão do programa por uma empresa de fora. **Carteira com várias assinaturas** só age quando um
número mínimo de pessoas aprova, por exemplo duas de três. **Chave de atualização** é o poder de trocar o código.
**Serviço agendado** é um programa que acorda de tempos em tempos e faz uma tarefa sozinho. **Sprint** é uma etapa de
construção, com objetivo e critério de pronto próprios.

**O que mudou desde a v0.0.2.**

1. Qualquer carteira abre um mercado, e o programa passa a conferir o que a equipe conferia (seção 4.3).
2. Entra uma segunda moeda: a taxa de abertura chega em SOL (seção 4.7).
3. O programa paga a parte de quem abriu, e a ordem das fatias da taxa precisa ser escrita (seção 4.6).
4. O patrocínio passa a 90% e 10%. O pedido de pergunta sai do roteiro, como proposta.
5. O teto por mercado volta à mesa (seção 4.4).
6. A equipe tem os três nomes do slide (seção 5.1).
7. As Sprints 00 e 01 estão fechadas; o programa novo tem um leitor de preço e nenhuma instrução.
8. "No human in the loop" contradiz a janela, a pausa e a anulação; o plano mantém as três (seção 4.5).
9. A lista da avaliação jurídica ganha seis perguntas (seção 6.2).

## 1. Resumo

### 1.1 O que será construído e em que ordem

**Decisão.** O programa do Brot é escrito do zero, neste repositório, "olhando pro código dele para reaproveitar os
trechos e pedaços que nos interessam". Hoje ele tem um leitor de preço e nenhuma instrução: nada do que a Parte 1
descreve funciona ainda.

O slide de crescimento põe o roteiro em três marcos: **"NOW Devnet, test tokens. LAUNCH Partner markets live.
MAINNET After an audit, a multisig and a cap."** A ordem decidida em 5/10/2026 é núcleo primeiro: o pote, a abertura
de mercado, o fechamento, a resolução, o resultado Anulado, a janela de 6 horas, o pagamento automático e os dois
serviços. Depois, antes da rede principal, a indicação e o patrocínio pago. Com a criação aberta, a instrução que
abre o mercado aceita qualquer carteira e carrega as regras que a equipe aplicava caso a caso (seção 3.3).

### 1.2 O que protege o dinheiro

**Decisão**, que o pitch repete: a rede principal só abre com auditoria externa, carteira com várias assinaturas e
teto para o total nos potes. Em volta: dois serviços em provedores diferentes, a janela, o Anulado, o pagamento que
sai sozinho, a pausa que nunca trava pagamento e o plano de incidente. A criação aberta pede três peças a mais, todas
**Proposta, aguardando decisão**: lista fechada de tipos e de contas aceitas; teto por mercado nos tipos em que dá
para empurrar o resultado; e aviso automático quando quem abriu pode controlar o resultado.

### 1.3 As quatro tensões

1. **O prazo.** O hackathon fecha em 12/10/2026, o programa novo não tem instrução e o escopo cresceu (seção 3.2).
2. **"No human in the loop" e as chaves da equipe**: janela, pausa e anulação são pessoas no caminho (seção 4.5).
3. **Sem identificação e sem bloqueio de país, com sócios no Brasil**, diante da Medida Provisória 1.394 (capítulo
   6).
4. **Poucas pessoas.** Três, com os cargos ainda a confirmar por escrito (seção 5.1).

### 1.4 Os maiores riscos

Um erro no programa com dinheiro real dentro; a chave de atualização numa mão só; os serviços parados, que fazem um
SIM verdadeiro virar NÃO; a regra brasileira; e a demanda não demonstrada. A criação aberta acrescenta dois: quem
abre um mercado sobre um token sem valor e empurra o resultado, e uma carteira que ocupa sozinha o teto global
(capítulo 7).

## 2. O que existe e o que será construído

### 2.1 O que existe hoje

Os fatos abaixo são do repositório, em 8/10/2026 (FATO).

- **Dois programas.** O antigo, em que um patrocinador vende o SIM com desconto, tem 1.717 linhas e 138 testes e
  está congelado até os leitores dele serem trazidos para o novo.
- **O programa novo** tem um leitor e nenhuma instrução. Leitor é o pedaço do programa que abre uma conta da Solana,
  lê um número e responde sim ou não. Este lê o preço publicado pela Pyth, a rede de oráculos de preço escolhida, e
  nada o chama ainda.
- **Duas das vinte sprints do roteiro fechadas**, em 5/10/2026. A 01 provou o leitor e respondeu à dúvida da v0.0.2:
  a Pyth funciona na devnet. A próxima, a 02, escreve o núcleo do pote e não começou.
- **O site provisório** brot.markets tem uma página de "em breve" com lista de espera, que guarda emails, e o deck.

O código tem dono declarado: a licença do repositório é a MIT, em nome de Ronaldo Pereira (FATO, arquivo
`LICENSE`). Ela deixa qualquer pessoa usar, copiar e modificar o código, desde que mantenha o aviso de autoria.

### 2.2 O que se aproveita, o que é novo e as peças de fora

| Peça | Destino |
|---|---|
| Os leitores do programa antigo | Aproveitam-se os que servem aos cinco tipos (Parte 1, seção 4.2) |
| O cofre por mercado | Aproveita o desenho: um problema num mercado não atinge os outros |
| O teste que confere as contas | Aproveita o método: sorteia milhares de sequências e confere o cofre depois de cada uma |
| A parte econômica antiga | Sai inteira: preço fixo, tokens de SIM e de NÃO, orçamento do patrocinador |
| O pote, o fechamento, a janela, o Anulado, o pagamento automático e os dois serviços | Novos |
| A abertura por qualquer carteira, com as regras de criação, a taxa em SOL e a parte de quem abriu | Novos, do pitch. Na v0.0.2, duas pessoas da equipe abriam |
| O patrocínio e a indicação | Novos. O pedido de pergunta sai, se a decisão 4 seguir a proposta |
| A administração: pausa, anulação, teto, lista de contas aceitas | Nova. O programa antigo não tem administrador |
| O leitor do padrão novo de token | Fase seguinte (seção 3.1) |

**O padrão novo de token.** Os leitores só leem o formato clássico, e os tokens novos do pump.fun usam o Token-2022
(Parte 1, seção 4.3): nenhum mercado de queima sobre eles abre até existir o leitor novo. Isso não resolve o token
sem valor (seção 4.3): criar um token clássico também é fácil (INFERÊNCIA).

**As peças de fora.** Nenhuma guarda o dinheiro dos potes, mas cada uma pode parar uma parte do site.

| Peça | O que faz | Onde funciona | Se cair ou mudar |
|---|---|---|---|
| Pyth | O preço assinado dos mercados de preço | Rede principal e devnet. O leitor só confia no programa atual dela, e o serviço de preços passou a pedir chave (FATO, nota técnica do projeto) | Entradas em mercados de preço param; mercado sem preço legível até o prazo é anulado. Os outros tipos seguem |
| Cloak | Esconde quem pagou um patrocínio | Só na rede principal | O patrocínio não divulgado fica indisponível |
| SODAX | Traz dinheiro de outras redes como USDC, cobrando 0,1% | Só na rede principal | Quem vem de outra rede não chega |
| pump.fun | Onde nasceria o token A | Rede principal | Nada muda no pote (Parte 3) |
| X | Onde se publica o cartão de cada mercado | Fora da rede | Ninguém deixa de entrar. A página de sugestões pelo X sai |

**Decisão.** Cloak e SODAX ficam integrados ao site, em páginas próprias, e a página em que a carteira assina uma
entrada não carrega código de fora (v0.0.2, P4 §5.1). O Cloak só esconde bem valores pequenos: o cofre de USDC dele
tinha 2.562,72 USDC, e um patrocínio de 500 seria 19,5% disso (FATO SECUNDÁRIO, plano de privacidade do sócio). Por
isso a tela diz "não divulgado". O pitch vende o projeto mostrando a própria promessa, e o patrocinador escondido
passa a ser a exceção (Parte 1, seção 3.7). A demonstração no hackathon segue a v0.0.2, P4 §5.2.

## 3. O roteiro

### 3.1 Agora, lançamento, rede principal e as fases seguintes

**Decisão.** "vamos montar inteiramente na devnet inicialmente"; "provavelmente vamos pra mainnet já no início do mês
2". O pitch não dá data. As fases da v0.0.2 ficam, alinhadas aos três marcos do slide.

| Fase | Marco do slide | O que o usuário consegue fazer | O que precisa estar pronto |
|---|---|---|---|
| 1. Devnet | "NOW Devnet, test tokens." | Entrar com USDC de teste em mercados dos cinco tipos, abrir mercado, receber sozinho e somar pontos por acerto | O núcleo, o leitor de preço, as regras de criação, os dois serviços, a janela, o pagamento e o site |
| 1, fim | "LAUNCH Partner markets live." | Entrar nos mercados dos parceiros, cada um sobre a meta do próprio projeto | Os parceiros fechados. Hoje não há nenhum |
| 2. Rede principal com teto | "MAINNET After an audit, a multisig and a cap." | Entrar com USDC de verdade até o teto, patrocinar e indicar | Os três critérios, a indicação, o patrocínio, a pausa, o plano de incidente, os termos, a avaliação jurídica e a empresa |
| 3. Fase 1.2 | | Contestar um resultado, com depósito; entrar em mercados sobre tokens do formato novo | A arbitragem interna, o leitor do Token-2022 com revisão própria e o teto revisto |
| 4. Fase 2 | | Sair antes do fim; esportes | A fórmula de saída revisada por fora e um oráculo próprio de esportes |

O slide não diz em que rede é o lançamento. Ele vem antes da rede principal, e a v0.0.2 já punha os mercados dos
parceiros na devnet; este plano lê assim, e é leitura. **Decisão (P2), de 5/10/2026:** se faltar um dos três
critérios, a data anda.

### 3.2 O prazo

Quatro fatos. Em 8/10/2026, o programa novo não tem instrução (FATO). O hackathon do Colosseum fecha em 12/10/2026,
segundo os arquivos e o fundador (FATO SECUNDÁRIO; a página do evento não foi conferida): são quatro dias, e o que se
mostra lá é demonstração. **Decisão (P1):** "as auditorias virão depois. Eles não precisam estar dentro dos prazos do
hackathon". O escopo cresceu: criação aberta com regras, taxa em SOL e parte de quem abriu mexem no caminho do
dinheiro e precisam estar na versão auditada. E o prazo das duas auditorias não está nos arquivos.

| Peça | Depende de | Cabe no mês de devnet? (INFERÊNCIA) |
|---|---|---|
| Núcleo do pote, com a abertura, as regras mínimas, a taxa em SOL e a parte de quem abriu | Equipe e as decisões 1, 2, 6, 7, 10, 13, 15 e 16 | Cabe, se for a única prioridade |
| Dois serviços | Equipe | Cabe |
| Indicação e patrocínio pago | Equipe | Só depois do núcleo |
| Carteira com várias assinaturas | Os nomes de quem assina | Cabe: são dias, depois da decisão |
| Duas auditorias, com as correções | Duas empresas de fora | Prazo desconhecido |
| Avaliação jurídica e abertura da empresa | Fundador | Sem prazo nos arquivos |

**O que acontece com a data.** Ela anda. Cada mês a mais de devnet soma 5.500 dólares ao gasto e a todas as linhas
do caixa (Parte 2, seção 5.5). A tabela aplica essa regra (INFERÊNCIA, conferida por script na revisão final).

| Meses de devnet | Gasto antes do dinheiro real | Ponto mais baixo do caixa no cenário razoável |
|---|---|---|
| 1, como decidido | 7.500 | −27.674 |
| 2 | 13.000 | −33.174 (`−27.674 − 5.500`) |
| 3 | 18.500 | −38.674 (`−33.174 − 5.500`) |

### 3.3 A ordem de construção

**Decisão (P1), de 5/10/2026: núcleo primeiro.** O núcleo é o que guarda dinheiro: indo primeiro, é a parte mais
testada e a primeira a chegar a quem audita. O pitch mexe na ordem em três pontos.

- **A abertura, a taxa em SOL e a parte de quem abriu.** **Proposta, aguardando decisão (decisão 16):** as três
  entram no núcleo,
  e as regras de criação vão na mesma instrução que abre o mercado. Regra que não está na abertura não existe: um
  mercado aberto sem conferência só se desfaz devolvendo tudo. E as três mudam o caminho do dinheiro que a auditoria
  lê.
- **A indicação.** O slide diz "Referrals, day one", e a v0.0.2 decidiu que o beta abre sem indicação. **Proposta,
  aguardando decisão (decisão 9):** "day one" é o primeiro dia na rede principal. A indicação entra depois do núcleo
  e antes da auditoria; o programa grava só quem indicou quem, e o repasse sai por rotina do serviço.
- **O patrocínio pago encolhe.** Sem o pedido de pergunta (decisão 4), é depositar o prêmio na operação que abre o
  mercado. Os parceiros gratuitos nem disso precisam: o mercado deles não leva prêmio.

**O que isso significa para a Sprint 02**, a próxima, que escreve o núcleo. Ela ainda prevê as instruções
`team_propose_question` e `team_approve_question`, em que uma pessoa da equipe propõe e outra aprova, e o plano
técnico descreve o pedido do patrocinador como conta própria (seção 3.4.1 dele). A Sprint 02 depende das decisões
1, 2, 6, 7, 10, 13, 15 e 16. Este plano não altera o plano técnico nem as sprints: diz que eles precisam ser
revistos antes de ela começar.

### 3.4 O que conta como pronto

**Decisão (P2), de 5/10/2026.** A rede principal só abre com os três critérios cumpridos por inteiro. Se faltar um, a
data anda. A exceção combinada de antemão: abrir com um relatório de auditoria concluído, sem falha grave aberta, e
um teto menor até o segundo chegar.

- **Auditoria:** as duas empresas entregaram relatório sobre a versão exata que vai para a rede; toda falha grave
  foi corrigida e conferida por quem a apontou; os relatórios são públicos.
- **Carteira com várias assinaturas:** criada com as pessoas definidas, já dona da chave de atualização, com uma
  assinatura de teste feita.
- **Teto:** gravado no programa auditado, com o valor fixado pelo fundador, e testado na devnet.

**Proposta, aguardando decisão (decisão 17):** um quarto item, que nasce do pitch. As regras de criação, a lista de
contas aceitas e o teto por mercado estão dentro da versão auditada. Sem isso, a auditoria revisa um programa em que
a equipe abria tudo, e a rede principal abre com qualquer carteira abrindo.

## 4. O que protege o dinheiro

O dinheiro de cada mercado fica num cofre que só o programa movimenta. As proteções respondem a quatro perguntas: o
código está certo? Quem pode trocá-lo? Quanto se perde se algo falhar? O que acontece na hora da falha?

### 4.1 Os três critérios: auditoria, várias assinaturas e teto

**Decisão do pitch.** "MAINNET After an audit, a multisig and a cap." São os três critérios decididos em 5/10/2026,
agora confirmados pelo pitch.

**Auditoria. Decisão.** Duas empresas, sem custo: "as duas auditorias dos dois sites que te passei vão custar zero
reais". Uma aparece nos arquivos como proofofexploit.com, em negociação (registro de 4/10/2026); a outra não tem
nome. Prazo, escopo e formato não foram encontrados. A auditoria não garante que não haja erro e só vale para a
versão lida; o que entrar depois passa por nova revisão. Enquanto não houver relatório, a tela diz "programa ainda
sem auditoria".

**Carteira com várias assinaturas. Decisão (P3), de 5/10/2026.** Duas de três, com os três sócios, cada assinatura
num aparelho físico próprio. Toda troca de código espera um prazo público, de 24 a 48 horas como ponto de partida. A
mesma carteira recebe a taxa. Com duas de três, um aparelho perdido não trava nada e um roubado, sozinho, não faz
nada. Hoje, na devnet, a chave de atualização está com o Lucas e o Ronaldo (FATO, roteiro de sprints). **Proposta,
aguardando decisão:** fixar os signatários depois do acordo escrito dos três (decisão 12).

**Teto. Decisão (P4), de 5/10/2026.** Baixo, subindo por degraus: por exemplo, 10.000, 25.000, 50.000 e 100.000, cada
degrau depois de duas semanas sem incidente. O primeiro valor não foi fixado; um critério é quanto os sócios
conseguiriam devolver do próprio bolso se o pior acontecesse.

### 4.2 Quem pode o quê

O programa novo tem administração, e isso precisa ser público.

| Poder | Quem | Limite |
|---|---|---|
| Trocar o código | A carteira com várias assinaturas | Espera pública antes de valer |
| Abrir mercado | Qualquer carteira, pagando 0,02 SOL | Só os tipos e as contas aceitos; frase montada pelo site; de 3 a 90 dias (proposta, seção 4.3) |
| Manter a lista de contas aceitas e os tetos por mercado | A carteira com várias assinaturas | Proposta, aguardando decisão |
| Confirmar ou anular na janela | Uma chave da equipe | Nunca inverte. Toda anulação fica registrada, com o motivo |
| Pausar | Uma chave da equipe, para ser rápido | Nunca trava pagamento nem devolução |
| Retomar | A carteira com várias assinaturas | |
| Mudar a taxa | Ninguém, num mercado aberto | Teto fixo no código. Quem abre não escolhe a taxa nem a própria parte |
| Enviar os pagamentos | O serviço agendado | Não escolhe quem recebe nem quanto |

A tabela é a resposta honesta a "No human in the loop": nenhuma pessoa escolhe o vencedor, mas pessoas podem pausar
e anular. É o que a decisão 5 propõe dizer (seção 4.5).

### 4.3 As regras de criação, no programa

**Decisão do pitch.** "Anyone can open a market, pump.fun style. 0.02 SOL to open a market. Inside the rules. Only
markets the chain can answer." A regra vale como está: qualquer carteira abre, paga 0,02 SOL e só abre mercado que a
rede responde.

**A consequência.** Na v0.0.2, duas pessoas da equipe abriam cada mercado e aplicavam o critério "alguém decide o
resultado de graça?". Agora não há ninguém entre quem abre e o mercado. "Inside the rules" só existe se as regras
estiverem no programa. A tabela traz o mínimo; tudo nela é **Proposta, aguardando decisão** (decisão 15, que
inclui as 7 e 13).

| Regra no programa | O que impede | Custo |
|---|---|---|
| Só os cinco tipos; o programa recusa qualquer outro | Mercado de opinião, que é o que o slide do problema critica | Nenhum tipo novo sem código novo e revisão |
| A conta é conferida na abertura: dono e formato certos para o tipo | Mercado que aponta para uma conta que o leitor não sabe ler | Já previsto na v0.0.2 |
| Sem texto livre: o site monta a frase com o tipo, a conta, a meta e a data (decisão 13) | Quem abre escreve uma coisa e o programa lê outra | Frases menos vivas |
| Lista de contas aceitas nos tipos de queima, liquidez e stake, mantida pela carteira de várias assinaturas (decisão 7) | O mercado sobre um token sem valor | "Qualquer um abre" vale, nesses tipos, só para o que está na lista |
| Teto por mercado nesses mesmos tipos (decisão 7) | Um pote maior do que custa empurrar o resultado | Menos volume por mercado |
| Duração de 3 a 90 dias, escolhida por quem abre; fechamento com menos de 24 horas, só a equipe | Mercado curto demais para entrar com calma | |
| Taxas fixadas pelo programa | Quem abre escolher a própria parte | |

**Empurrar o resultado sem ninguém escolhendo a meta.** O exemplo do token sem valor, queimado de graça por quem
abriu o mercado, está na Parte 1, seção 4.2. A defesa da v0.0.2, a equipe só abrir metas caras, some. Por isso a
proposta abre o mercado de preço pela Pyth a qualquer carteira desde o início, porque ninguém controla o preço de um
ativo grande, e põe os outros quatro tipos atrás da lista e do teto.

**Quem abriu com um lado.** Sem cadastro não há como proibir. **Proposta, aguardando decisão (decisão 14):**
permitir, com aviso automático nos tipos em que dá para empurrar.

**O lixo.** Os 0,02 SOL encarecem o lixo: 1.000 mercados sem sentido custam 20 SOL. Mas a criação aberta não provou
trazer volume (Parte 2, seção 3.2). Com muitos mercados vazios, a ordem da página inicial decide o que o público vê;
como ordenar fica para o plano técnico.

### 4.4 Os tetos

**O teto global** é um limite para a soma de todos os potes abertos. Quando ela chega ao limite, o programa recusa
entradas novas até algum mercado pagar. Ele limita a perda e também a receita. Com teto de 10.000 e potes que giram
a cada 14 dias, o site comporta cerca de 21.400 dólares de entradas por mês, uns 790 de taxa. Com 100.000, cerca de
214.000, acima dos 208.630 do ponto de equilíbrio (INFERÊNCIA, v0.0.2, P4 §4.4).

**O teto por mercado. Decisão.** "no mvp não vamos lidar com isso, mas guarde essa informação para revisitarmos numa
fase futura". A decisão foi tomada quando a equipe escolhia as metas. O pitch a reabre por dois motivos.

1. **Empurrar o resultado** (seção 4.3). Quem consegue empurrar ganha, no máximo, o que está no lado oposto do pote.
   O mercado só é seguro enquanto o pote for menor que o custo de empurrar.
2. **Ocupar o teto global.** Uma carteira abre um mercado de 90 dias e entra sozinha com um valor alto. Como o pote
   de um lado só não cobra taxa da primeira carteira (Parte 1, seção 3.5), ela só paga os 0,02 SOL, e trava o teto
   para todos até o prazo vencer.

**Proposta, aguardando decisão (decisão 7):** teto por mercado nos tipos em que dá para empurrar o resultado, fixado
pela carteira de várias assinaturas. **Proposta, aguardando decisão (decisão 18):** como o segundo motivo vale também
para o tipo de preço, teto por mercado ou por carteira em todos os tipos. Nenhum documento traz os valores; eles
ficam com o fundador.

### 4.5 Os serviços, a janela e o pagamento

**Decisão.** Dois serviços agendados, em provedores diferentes. Depois de 10 minutos sem resposta e 3 tentativas, "o
segundo assume o cron e envia notificação para o cto saber que tem um sistema down". Não há botão público de
resolver, e o pagamento é automático: "não faz sentido ter botão de claim".

Três regras de construção (v0.0.2, P4 §4.5): o serviço não decide nada, porque o resultado sai do dado e os valores,
do registro das entradas; não acumula poderes, nem abre mercado nem anula; e, como dois serviços com o mesmo código
têm o mesmo defeito, a janela e o Anulado continuam atrás deles. O pagamento vai sempre para a carteira que entrou.
A taxa de rede de cada envio, 0,000005 SOL, é paga pela plataforma (FATO, relatório técnico).

**A pausa** tem dois estados, normal e sem entradas novas; resolução, pagamento e devolução nunca pausam, e não há
saque de emergência pela equipe. **O plano de incidente** é uma página, escrita antes da rede principal, que diz quem
pausa, quem fala pela casa e onde se publica. Ainda não existe.

**A janela e "No human in the loop".** O conflito está na Parte 1, seção 4.5: ao pé da letra, a frase tira a
janela, a pausa e a anulação, e uma leitura errada seria paga sem volta. **Proposta, aguardando decisão (decisão
5):** manter a janela até a auditoria, como freio que só devolve, e dizer "no human picks the winner". A alternativa
da v0.0.2 aproxima o produto da frase: o programa aceita a leitura acionada por qualquer carteira, sem botão no site,
e qualquer pessoa aciona se os dois serviços caírem.

**Com muitos mercados**, a rotina de conferir cada resolução, que não tem dono (seção 5.1), cresce sem a equipe
controlar. Se ninguém conferir, o pagamento sai sozinho ao fim das 6 horas. O custo de vigiar muitos mercados não foi
medido; o modelo mantém "até 1.000" dólares de infraestrutura por mês.

### 4.6 Patrocínio, indicação e a parte de quem abriu

**O patrocínio que volta. Decisão (P7), de 5/10/2026,** com o número novo. No pote de um lado só e no mercado
anulado, o prêmio volta inteiro ao patrocinador. Os 10% da taxa de marketing seguem a causa: ficam com o Brot quando
o mercado esteve no ar e a divulgação foi entregue, no pote de um lado só ou na anulação por causa de fora; voltam
quando a anulação veio de falha da casa. Exemplo: num patrocínio de 1.500, os 1.350 de prêmio voltam, e os 150 ficam
ou voltam conforme a causa. O programa precisa registrar o motivo de cada anulação.

**O pedido de pergunta.** A v0.0.2 tinha três regras para o dinheiro do patrocinador nunca ficar preso, com
cancelamento sozinho depois de 14 dias. **Proposta, aguardando decisão (decisão 4):** o pedido sai, e o projeto abre
o próprio mercado e deposita o prêmio na mesma operação. Se o fundador mantiver o pedido, as três regras voltam.

**A indicação** pede dois registros: quem indicou quem, gravado uma vez, antes da primeira entrada do indicado; e de
qual entrada veio cada pedaço de taxa. Indicar a si mesmo é possível e tem teto; o fundador aceitou o risco ("isso
mesmo"; Parte 1, seção 3.9).

**A parte de quem abriu.** Qualquer que seja o desenho, o 1% é calculado pelo programa, e não escolhido por quem
abre, e sai no pagamento automático. O resto espera decisão: as propostas são tirá-lo do prêmio de quem acertou, com
teto (decisão 1, desenho B); nada no anulado, no pote de um lado só ou sobre o prêmio do patrocinador (decisão 10); e
nada nos mercados da equipe (decisão 6).

**A pilha sobre a taxa.** Tesouraria (25%), indicação (20% da taxa do indicado) e, se existir, o desconto do token B
(até 40%) saem da mesma taxa. A v0.0.2 fixou a ordem: o desconto sai da taxa inteira, antes da divisão entre
tesouraria e operação, e a indicação é paga sobre a taxa já com desconto (P3 §4.3). No desenho B, a parte de quem
abriu não toca a taxa e a pilha fica como estava. No desenho C, ela entra na pilha, e a ordem se escreve com a
decisão 1.

### 4.7 Tesouraria, SOL e a carteira do serviço

**A tesouraria. Decisão (P8), de 5/10/2026.** Os 25% da taxa ficam em USDC, numa conta à parte da carteira com várias
assinaturas, até a empresa ter conta em corretora. Daí em diante, compra mensal de Bitcoin em data fixa, guardado em
carteira própria também com várias assinaturas, com regra escrita de quem assina, quando compra e quando vende.

**O SOL. Decisão do pitch.** "0.02 SOL to open a market." O fundador tinha decidido: "A moeda vai ser usdc, vamos
abandonar a ideia de sol." O SOL volta pela taxa de abertura, e com ele três coisas: um caixa exposto ao preço do SOL,
contabilidade em duas moedas e uma regra de guarda que ainda não existe. Parte da taxa já tem destino natural: o
aluguel das contas do mercado, cerca de 0,002 SOL só pelo cofre de USDC (FATO, v0.0.2, P4 §4.5), e as taxas de rede
dos pagamentos.

**A carteira do serviço** guarda pouco SOL, para pagar as taxas de rede, e hoje seria reposta pela verba de
infraestrutura. **Proposta, aguardando decisão (decisão 19):** o SOL das taxas de abertura cai numa conta controlada
pela carteira com várias assinaturas; dela sai o SOL que repõe a carteira do serviço; o que sobra vira USDC em data
fixa, com regra escrita junto com a da tesouraria. Assim o SOL que entra paga o SOL que sai, e o caixa fica em dólar.

## 5. Pessoas e empresa

### 5.1 A equipe

**Decisão do pitch.** O slide de equipe traz três pessoas.

| Nome | Cargo no slide | O que os arquivos dizem |
|---|---|---|
| Bernardo Nery | Head Baker · CEO | Nada além do nome e do cargo. A v0.0.2 não trazia o nome dele |
| Lucas Galvão | Chief Oven Officer · COO and CLO | O fundador. Decide as regras deste plano e conduz a avaliação jurídica. Na fala: "eu, que cuido do forno e da receita dentro da lei" |
| Ronaldo Pereira | Chief Toasting Officer · CTO | **Decisão:** "o CTO é o Ronaldo". Autor do programa antigo; recebe os alertas dos serviços |

**A ressalva.** O roteiro do próprio fundador diz que "quem ocupa qual cargo, os nomes de padaria e as frases são
proposta" e que "falta o de acordo do Bernardo e do Ronaldo para aparecerem". Nome e cargo de uma pessoa são dado
pessoal, e o deck está num endereço público, ainda que só por link. A v0.0.2 registrava que no hackathon a equipe se
apresentaria como uma pessoa; o deck mostra três. **Proposta, aguardando decisão (decisão 12):** pedir o de acordo
por escrito ao Bernardo e ao Ronaldo; até lá, as versões públicas trazem os cargos sem sobrenome. Este plano é
documento interno e traz os nomes como estão no slide.

**O que continua sem dono.** Nenhuma linha pede contratação; pedem um nome.

| Papel | Situação |
|---|---|
| Conferir as resoluções na janela de 6 horas | Sem dono |
| Atender o alerta fora de hora | O CTO, sem substituto |
| Falar com as duas empresas de auditoria | Sem dono nos arquivos |
| Propor mudanças na lista de contas aceitas | Sem dono; quem aprova é a carteira com várias assinaturas |
| Fechar os parceiros de lançamento | Sem dono nos arquivos. Nenhum parceiro fechado |

**O que depende de uma pessoa só.** O conhecimento dos leitores antigos está com o Ronaldo; reduz o risco ele
revisar os leitores reaproveitados e pôr o que sabe em documento. O alerta não tem segunda pessoa. E quem faz a
avaliação jurídica é sócio e mora no país avaliado: a conclusão fica por escrito, lida por um colega de fora.

### 5.2 Empresa, custos e acordo sobre o código

**Decisão.** A empresa ainda não existe, e a abertura "vai custar sim uns 2k dol". **Decisão (P5), de 5/10/2026:**
primeiro a avaliação jurídica, depois o país e a empresa; o bloqueio por país entra no site como interruptor, para
a resposta da avaliação valer no mesmo dia.

| Item | Valor | Origem |
|---|---|---|
| Retirada dos três sócios | 1.500 cada; 4.500 por mês | Informado pelo fundador |
| Infraestrutura | Até 1.000 por mês | Informado pelo fundador |
| Abertura da empresa | Cerca de 2.000, uma vez | Informado pelo fundador |
| Duas auditorias e avaliação jurídica | Zero | Informado pelo fundador |
| Antes do dinheiro real | 7.500 com um mês de devnet; 5.500 a mais por mês extra | Parte 2 |

Não têm preço: a infraestrutura item por item, os aparelhos de assinatura, as auditorias seguintes, uma licença se
for preciso, uma reserva para devolver dinheiro em falha da casa e, novos, servir muitos mercados e a oscilação do
SOL recebido.

**O acordo sobre o código. Decisão (P6), de 5/10/2026.** Um termo curto entre os sócios agora, sobre de quem é o
código novo, a dedicação de cada um e o destino das chaves se alguém sair; o acordo completo vem com a empresa.
"vamos deixar tudo em nome da empresa." Os arquivos não registram que o termo tenha sido escrito. Com três nomes no
slide, ele vale para os três.

## 6. Regulação

Este capítulo não é parecer. **Decisão.** A avaliação jurídica é feita pelo fundador e por colegas, sem custo.
**Decisão.** O acesso é "100% onchain da solana, via wallet, sem kyc", sem bloqueio de país por enquanto. Fora de
citações do fundador, este é o único capítulo em que a palavra "aposta" aparece, porque é a palavra das leis.

### 6.1 O que foi lido e o que não foi

**Lido na fonte** (FATO; a v0.0.2, P4 §7.1, traz cada citação e data).

- **Resolução nº 5.298 do CMN, o Conselho Monetário Nacional, de 24/4/2026.** Proíbe "a oferta e a negociação, no
  país, de contratos derivativos" ligados a evento esportivo, a jogo on-line e a evento de "qualquer outra temática
  que, a critério da Comissão de Valores Mobiliários, não seja representativa de referencial econômico-financeiro".
  O art. 4º alcança derivativos negociados no exterior e oferecidos no país.
- **Nota Técnica SEI nº 2958/2026, da Fazenda.** Trata mercados de previsão como exploração ilegal de aposta de quota
  fixa. Diz que o enquadramento "não decorre da nomenclatura", aponta a "ausência de procedimentos robustos de
  identificação de usuários (KYC)" e sugere bloquear o acesso por brasileiros.
- **O bloqueio.** A Anatel confirmou em 24/4/2026 que notificou as operadoras. A lista de 27 sites saiu na imprensa
  (FATO SECUNDÁRIO) e inclui Hedgehog Markets, que roda na Solana, e Predict.fun.
- **Medida Provisória nº 1.394, de 25/9/2026**, lida no Planalto em 5/10/2026. "Proíbe a exploração, a oferta, a
  intermediação e a publicidade de loterias de apostas de quota fixa no território nacional", "inclusive quando
  realizadas por agente sediado no exterior" (art. 1º). Aposta de quota fixa é colocar valor em risco "na expectativa
  de obtenção de prêmio cujo montante é definido por fator de multiplicação" (art. 3º, I). Fecha os meios de
  pagamento (art. 14), veda publicidade e patrocínio "direcionado ao público brasileiro" (art. 16), multa provedores
  em até 50 milhões de reais por infração (arts. 19 a 23), prevê perdimento de valores (art. 28), revoga a maior
  parte da Lei 14.790/2023 (art. 29) e vale desde a publicação (art. 30).
- **Leis 14.478/2022 e 9.613/1998.** A primeira exige autorização de quem faz "custódia ou administração de ativos
  virtuais" "em nome de terceiros". A segunda obriga a identificar clientes quem explora "sistemáticas de captação de
  apostas com pagamento de prêmios".
- **Fora do Brasil.** A autoridade europeia de mercados declarou em 3/7/2026 que contratos de evento ligados a certas
  referências financeiras não podem ser vendidos ao varejo. O regulador americano de derivativos multou a Polymarket
  em 2022 e escreveu que a regra vale "regardless of the technology used".

**Não conferido.** A tramitação da medida provisória no Congresso; o Decreto nº 13.128, de 2026; a regra
complementar da CVM; o prazo de 30/10/2026 para prestadoras de ativos virtuais (FATO SECUNDÁRIO). E a pergunta
central, que tem dois lados e nenhum parecer: se um pote sobre fato gravado na rede é "aposta de quota fixa". No
pote, o retorno só se conhece quando as entradas fecham; mas a Nota Técnica descarta argumentos de formato.

**Quem opera de fora.** O estado de Nevada incluiu a empresa do Panamá da Polymarket numa ação civil (FATO, Gaming
Control Board, 16/1/2026). A Polymarket põe o Brasil na lista de "só fechar posição" (FATO, documentação). A
autoridade francesa de jogos considerou insuficiente um bloqueio de país contornável (FATO, 17/7/2026). As
estruturas que plataformas parecidas adotaram estão na v0.0.2, P4 §7.4; não foi encontrada plataforma comparável com
equipe declaradamente brasileira.

### 6.2 A lista da avaliação jurídica

Os doze pontos da v0.0.2 (P4 §7.6), mais curtos:

1. O pote é aposta de quota fixa, jogo de azar, loteria não autorizada, derivativo ou nenhum deles?
2. Qual é o risco pessoal de sócios residentes no Brasil, com a empresa fora e com ou sem bloqueio?
3. O cofre do programa, com a equipe controlando a atualização, é custódia em nome de terceiros? Há dever de
   identificar clientes?
4. Mercados de preço são derivativo? Queima, liquidez e stake são "referencial econômico-financeiro"?
5. Quais países bloquear no primeiro dia, e se o Brasil entra.
6. Parceiros, publicações no X e material em português diante do art. 16.
7. O patrocinador não divulgado, e o dinheiro vindo do Cloak.
8. A fase de devnet, com dinheiro de teste e pontos, e o hackathon estão fora dessas regras?
9. Esportes, na fase 2, a categoria que as duas normas citam pelo nome.
10. A tramitação da medida provisória e o Decreto 13.128.
11. Termos de uso, avisos de risco e política de privacidade antes do dinheiro real; a lista de investidores.
12. A tesouraria: a corretora vai perguntar a origem do dinheiro.

**As seis perguntas novas, que o pitch criou.** São perguntas, e não conclusões.

- **(a)** Abrir a criação a qualquer pessoa muda o papel da empresa, de quem oferece o mercado para quem o hospeda?
- **(b)** Quem recebe 1% do pote vira operador ou agente? E o que isso significa para quem abre mercados morando no
  Brasil?
- **(c)** Receber SOL como taxa e pagar quem abre mercados cria dever fiscal ou de registro?
- **(d)** A "taxa de marketing" é serviço de publicidade, diante do art. 16?
- **(e)** Trocar "aposta" por "escolher um lado" muda a classificação, dado que a Nota Técnica diz que ela "não
  decorre da nomenclatura"?
- **(f)** Quem responde por um mercado aberto por um terceiro sobre o token de outro projeto?

Os pontos sobre tokens estão na Parte 3, seção 6.

## 7. Riscos

A gravidade é INFERÊNCIA. **Crítica** pode derrubar o negócio ou custar dinheiro de usuário. **Alta** compromete o
lançamento ou a confiança. **Média** custa tempo ou dinheiro.

| Risco | Gravidade | O que reduz | Se acontecer |
|---|---|---|---|
| Erro no programa com dinheiro real dentro | Crítica | Duas auditorias, teto, testes que conferem as contas | Pausar entradas novas; pagamentos seguem. Corrigir e publicar |
| Chave de atualização roubada ou numa mão só | Crítica | Duas de três, aparelhos físicos, espera pública | As outras assinaturas trocam a chave |
| Os dois serviços parados; um SIM vira NÃO | Crítica | Provedores diferentes, alerta ao CTO, janela de 6 horas | Anular na janela; todos recebem de volta |
| A regra brasileira alcança o pote ou os sócios | Crítica | Avaliação jurídica antes do dinheiro real; bloqueio como interruptor | Ligar o bloqueio. Quem entrou sempre recebe |
| A demanda não aparece | Crítica | Beta com pontos, parceiros, medida de retenção | Critério de parada aos 180 dias: perda limitada a 36.348 no mês 6, contra 116.565 no mês 24 (Parte 2, seção 5.5) |
| Quem abriu empurra o resultado de um mercado sobre token sem valor | Crítica | Lista de contas aceitas e teto por mercado (propostas) | Não há volta: o resultado lido é o verdadeiro. Tirar a conta da lista |
| Quem abriu tem um lado no próprio mercado | Alta | Aviso automático (proposta) | Nenhuma correção possível sem cadastro |
| Uma carteira ocupa o teto global | Alta | Teto por mercado ou por carteira (proposta) | O site recusa entradas até o mercado vencer |
| O prazo estoura, com o escopo maior | Alta | Núcleo primeiro; regras de criação dentro dele; perguntar já o prazo às auditoras | A data anda; 5.500 por mês |
| Poucas pessoas: um sócio fica indisponível | Alta | Termo entre os sócios, segunda pessoa para o alerta | Parar de abrir mercados da equipe; os abertos resolvem e pagam sozinhos |
| O site é tomado e pede assinaturas maliciosas | Alta | Chave física no domínio, na hospedagem e no repositório; nada de fora na página de entrada | Tirar do ar e avisar. Os cofres não são afetados |
| "No human in the loop" contradito pelas próprias regras | Média | Trocar a frase (decisão 5) | Explicar a janela e a pausa em público |
| Mercados de lixo enchem a página inicial | Média | Taxa de 0,02 SOL; ordem da página | Rever a taxa e a ordem |
| O preço do SOL cai com taxas guardadas em SOL | Média | Converter em data fixa (proposta, seção 4.7) | Pequeno no modelo |
| Nomes e cargos no deck sem acordo escrito | Média | Acordo por escrito (decisão 12) | Tirar os sobrenomes das versões públicas |
| O deck mostra "7 of 30" com logos fictícios | Média | A etiqueta "example"; o roteiro não cita o número | Trocar pela lista real ou esvaziar antes de apresentar |

Continuam, como médios, três riscos da v0.0.2 (P4 §8): o Cloak não esconder o que o texto diz, as auditorias
seguintes não serem gratuitas e o emissor do USDC congelar um cofre, o que para só aquele mercado.

Todo risco crítico tem proteção decidida ou proposta, e nenhuma está pronta hoje. Sob pressão de data, um critério
vira formalidade. E o mercado empurrado por quem o abriu só tem proteção se as propostas da seção 4.3 forem aceitas.

## 8. Decisões e pontos abertos

**O que está decidido.** As oito decisões de 5/10/2026 continuam (v0.0.2, P4 §9.1): núcleo primeiro (P1); os três
critérios por inteiro, ou a data anda (P2); duas de três, com os três sócios (P3); teto baixo, por degraus (P4);
avaliação jurídica antes da empresa, bloqueio como interruptor (P5); termo entre os sócios, tudo em nome da empresa
(P6); a taxa do patrocínio segue a causa, agora com 10% (P7); tesouraria em USDC, Bitcoin depois (P8). O pitch
confirmou os três critérios e não revogou nenhuma.

**O que espera decisão do fundador.** As que tocam a construção. De 1 a 14, os números são os da revisão de
impacto, seção 6. A 15 junta as regras mínimas de criação, que a revisão propôs sem número; as de 16 a 19 são
propostas desta versão.

| Nº | Decisão | Recomendação | Seção |
|---|---|---|---|
| 1 | De onde sai o 1% de quem abriu | Desenho B: do prêmio, com teto | 4.6 |
| 2 | Para onde vão os 0,02 SOL | Para o Brot, sem devolução, descontado o aluguel | 4.7 |
| 4 | O pedido de pergunta com resposta em 14 dias | Sai | 4.6 |
| 5 | "No human in the loop" e a janela | Manter a janela até a auditoria; "no human picks the winner" | 4.5 |
| 6 | A equipe abre mercados? Fica com o 1%? | Abre, sem o 1% | 4.6 |
| 7 | Tipos em que dá para empurrar, abertos a todos | Lista de contas aceitas e teto por mercado; o preço abre a todos | 4.3, 4.4 |
| 9 | "Referrals, day one" | O primeiro dia na rede principal | 3.3 |
| 10 | O 1% no anulado, no pote de um lado só e sobre o prêmio | Nada nos três casos | 4.6 |
| 12 | Cargos e o de acordo do Bernardo e do Ronaldo | Pedir por escrito; até lá, sem sobrenome nas versões públicas | 5.1 |
| 13 | Texto livre no mercado | Não | 4.3 |
| 14 | Quem abriu escolhendo lado | Permitir, com aviso automático | 4.3 |
| 15 | As regras mínimas de criação | Só os cinco tipos; conta conferida na abertura; de 3 a 90 dias; taxas fixas | 4.3 |
| 16 | A abertura, a taxa em SOL e a parte de quem abriu no núcleo | Entram no núcleo, com as regras na instrução que abre | 3.3 |
| 17 | Um quarto item no "pronto" | Regras de criação, lista de contas e teto por mercado na versão auditada | 3.4 |
| 18 | Teto por mercado ou por carteira em todos os tipos | Sim, também no tipo de preço, para ninguém ocupar o teto global | 4.4 |
| 19 | Onde fica o SOL das taxas de abertura | Conta da carteira de várias assinaturas; repõe o serviço; o resto vira USDC | 4.7 |

Faltam ainda os valores e nomes da v0.0.2: o primeiro valor do teto e quem assina a carteira. E o plano técnico e a
Sprint 02 precisam ser revistos com as respostas acima antes de a construção do núcleo começar.

**O que a pesquisa não encontrou.** O prazo, o escopo e o nome da segunda empresa de auditoria; a data do hackathon
em fonte oficial; a tramitação da Medida Provisória 1.394; o custo da infraestrutura item por item e o de servir
muitos mercados; o aluguel da conta de um mercado; uma plataforma em que a criação aberta tenha sustentado volume; e
uma plataforma comparável com equipe declaradamente brasileira.
