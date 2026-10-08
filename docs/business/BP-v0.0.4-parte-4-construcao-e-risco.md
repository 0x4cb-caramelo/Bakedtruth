# Brot Markets — Business Plan v0.0.4 — Parte 4: Construção e risco

**Data:** 8 de outubro de 2026.
**Estado:** rascunho para revisão do fundador. Derivada da v0.0.3 com as decisões do fundador de 8/10/2026. Onde elas e
a v0.0.3 discordam, valem as de 8/10; onde se calam, vale a v0.0.3. Substitui a Parte 4 da v0.0.3, com a mesma
numeração de seções, que outros documentos citam.

**Como ler.** As marcas são **Decisão** (do fundador, em 4 ou 5/10/2026), **Decisão do pitch** (deck de 7/10/2026,
em inglês), **Decisão, de 8/10/2026** (resposta nova, com as palavras dele, como escritas) e **Proposta, aguardando
decisão**. Fatos de fora trazem FATO, FATO SECUNDÁRIO ou INFERÊNCIA. "Decisão (P1)" a "(P8)", sem hífen, são as
decisões de construção de 5/10/2026 (capítulo 8), e não as partes do plano; "P-1" a "P-8", com hífen, são as
propostas de 8/10/2026 que o índice lista. Valores em dólares; nas contas, o SOL vale **US$ 109,27** (CoinGecko,
8/10/2026, 15:29 UTC, FATO).

**O que esta parte é.** O que será construído e em que ordem, o que protege o dinheiro dos bakers e o que pode dar
errado. Não é o plano técnico nem parecer jurídico.

Oito termos. **Programa** é o código que roda na Solana e guarda o dinheiro. **Instrução** é cada operação que o
programa aceita, como abrir uma campanha. **Devnet** é a rede de testes; **rede principal**, a de dinheiro real.
**Auditoria** é a revisão do programa por uma empresa de fora. **Carteira com várias assinaturas** só age quando um
número mínimo de pessoas aprova, por exemplo duas de três. **Chave de atualização** é o poder de trocar o código.
**Serviço agendado** é um programa que acorda de tempos em tempos e faz uma tarefa sozinho. **Sprint** é uma etapa de
construção.

**O que mudou desde a v0.0.3.**

1. Tudo em SOL: o cofre de cada campanha guarda SOL, e o pagamento vai direto à carteira.
2. Abrir uma campanha custa US$ 500 em SOL: 90% viram prêmio, 10% ficam com o Brot. Abertura e patrocínio viram a
   mesma regra, e o pedido de pergunta sai.
3. O teto saiu, global e por campanha. A rede principal abre com dois critérios, e o slide precisa mudar.
4. Não há lista de contas aprovadas, e o furo do token sem valor fica aberto.
5. O programa é escrito em Pinocchio; os serviços rodam em Bun; o app Android ganha uma fase.
6. Não há IA no escopo nem prazo de hackathon.
7. A avaliação jurídica é do advogado da equipe, e a lista dela ganha quatro perguntas.
8. A tabela de riscos perde três linhas e ganha três.

## 1. Resumo

### 1.1 O que será construído e em que ordem

**Decisão.** O programa do Brot é escrito do zero, neste repositório, "olhando pro código dele para reaproveitar os
trechos e pedaços que nos interessam". Hoje ele tem um leitor de preço e nenhuma instrução: nada do que a Parte 1
descreve funciona ainda.

**Decisões, de 8/10/2026.** O programa passa a ser escrito em **Pinocchio** ("i want to change anchor for
pinocchio"), biblioteca da Anza, versão 0.11.2, de 9/6/2026, auditada pela Zellic (FATO SECUNDÁRIO, pesquisa técnica de
8/10/2026), mais enxuta que o Anchor, mas que não confere as contas sozinha (seção 3.3). **Tudo em SOL** ("we use only
SOL in the entire platform"). **Abrir custa US$ 500 em SOL**, 4,58 SOL ao preço de referência. **Sem teto e sem lista
de contas.** Um **app Android** na loja de dApps da Solana, com o mesmo backend e front próprio; o iPhone segue pelo
site, nos navegadores das carteiras. **Bun** nos serviços (seção 2.2). **Sem IA** ("there is not ai in the scope").

**A ordem.** Pinocchio primeiro; depois o núcleo (Decisão (P1)), já com a abertura, a taxa de US$ 500 e o 1% do
criador; antes da rede principal, a indicação; o app Android, numa fase própria (seções 3.1 e 3.3).

### 1.2 O que protege o dinheiro

**Decisão, de 8/10/2026.** A rede principal abre com dois critérios: auditoria externa e carteira com várias
assinaturas. O teto, terceiro critério do slide, saiu. Sem rodeio: era ele que limitava a perda num erro do programa.
Sem ele, um erro pode custar tudo o que estiver nos cofres.

Ficam as auditorias, a carteira de duas de três, a pausa que nunca trava pagamento, os testes, os dois serviços, a
janela, a anulação e o plano de incidente; na abertura, as regras mínimas e, como proposta, o aviso automático.

### 1.3 As quatro tensões

1. **Sem teto.** "limitless is the right way": a perda num erro do programa deixa de ter limite (seções 4.1 e 4.4).
2. **"No human in the loop" e as chaves da equipe**: janela, pausa e anulação são pessoas no caminho (seção 4.5).
3. **Sem identificação e sem bloqueio de país, com sócios no Brasil**, diante da Medida Provisória 1.394 (capítulo 6).
4. **Poucas pessoas**, com cargos a confirmar por escrito e uma biblioteca que pede cada conferência à mão (seção 5.1).

O prazo saiu da lista: "16 nao se preocupe com deadline" (Decisão, de 8/10/2026).

### 1.4 Os maiores riscos

Um erro no programa, agora sem limite de perda; uma conferência de conta esquecida no Pinocchio; a chave de
atualização numa mão só; os serviços parados, que fazem um SIM virar NÃO; a regra brasileira; a demanda; o criador que
empurra o resultado sobre um token sem valor, agora sem lista nem teto; e o preço do SOL (capítulo 7).

## 2. O que existe e o que será construído

### 2.1 O que existe hoje

Os fatos abaixo são do repositório, em 8/10/2026 (FATO). Nada mudou desde a v0.0.3.

- **Dois programas, ambos em Anchor.** O antigo, em que um patrocinador vende o SIM com desconto, tem 1.717 linhas e
  138 testes e está congelado até os leitores dele serem trazidos para o novo.
- **O programa novo** tem um leitor, que lê o preço da Pyth, e nenhuma instrução. Será reescrito em Pinocchio.
- **Duas das vinte sprints fechadas**, em 5/10/2026. A 01 provou que a Pyth funciona na devnet. A 02, que escreve o
  núcleo do pote, não começou.
- **O site provisório** brot.markets tem a página de "em breve", a lista de espera, que guarda emails, e os decks,
  ainda com a moeda, a taxa e o teto antigos.
- **O app herdado** tem uma conversa com IA, que sai na Sprint 09.

A licença do repositório é a MIT, em nome de Ronaldo Pereira (FATO, arquivo `LICENSE`): qualquer pessoa pode usar,
copiar e modificar o código, desde que mantenha o aviso de autoria.

### 2.2 O que se aproveita, o que é novo e as peças de fora

**Fica** dos leitores antigos o que eles sabem (endereços, formatos e amostras reais da rede), mas o código é
reescrito; do cofre por campanha, o desenho, para um problema numa campanha não atingir as outras; e do teste que
confere as contas, o método: milhares de sequências sorteadas, com o cofre conferido depois de cada uma. **Sai** a
parte econômica antiga. **É novo** o resto: o pote, a abertura com as regras e a cobrança, o 1% do criador, a janela,
a anulação, o pagamento, os serviços, a indicação, o app e a administração (pausa, anulação e abertura sem cobrança),
sem lista nem teto para manter. O leitor do padrão novo de token fica para a fase seguinte.

**O cofre em SOL.** O programa paga direto à carteira do baker, sem conta de token. Os saldos continuam escriturados:
SOL mandado à mão para o cofre não vira entrada. O cofre guarda sempre o mínimo de aluguel, o depósito que a Solana
exige para manter uma conta aberta.

**O padrão novo de token.** Os tokens novos do pump.fun usam o Token-2022, que os leitores não leem: campanha de
queima sobre eles espera o leitor novo.

**As peças de fora.** Nenhuma guarda o dinheiro dos potes, mas cada uma pode parar uma parte do site.

| Peça | O que faz | Se cair ou mudar |
|---|---|---|
| Pyth | O preço das campanhas de preço e o SOL/USD da abertura | Entradas em campanhas de preço param; sem preço até o prazo, a campanha é anulada. Sem preço fresco, ninguém abre campanha paga (INFERÊNCIA) |
| CoinGecko | O preço do SOL no site | O site mostra o da Pyth |
| Cloak | Esconde quem pagou um patrocínio, na rede principal | O patrocínio não divulgado fica indisponível |
| SODAX | Traz dinheiro de outras redes, na rede principal | Quem vem de outra rede não chega |
| Loja de dApps da Solana | Publica o app Android | O app sai; o site continua |
| pump.fun | Onde nasceria o token A | Nada muda no pote (Parte 3) |
| X | Onde se publica o cartão de cada campanha | Ninguém deixa de entrar |

**O preço dos US$ 500. Decisão, de 8/10/2026 (D-f), a partir da pesquisa pedida pelo fundador** ("coingecko ou outro, pesquise"). O
programa só lê contas da própria rede, e não a CoinGecko; usá-la exigiria um servidor nosso gravando o preço com uma
chave, que passaria a mandar no valor da taxa. O plano gratuito dela também não deixa claro o uso comercial (FATO
SECUNDÁRIO, página de planos). A proposta: o programa lê o SOL/USD na conta que a própria Pyth mantém, sem custo para
quem só lê, e exige essa conta, para ninguém escolher um preço velho. A CoinGecko fica para o site.

**Cloak e SODAX. Proposta, aguardando decisão (P-8).** Os dois foram avaliados para outra moeda: o cofre do Cloak era
de USDC (FATO SECUNDÁRIO, plano de privacidade do sócio), e o SODAX trazia dinheiro como USDC. Conferir se servem com
SOL antes de usar.

**Bun: o resultado da pesquisa pedida** ("verifique a viabilidade e segurança disso"). O Bun 1.4.2 é a versão estável
da primeira reescrita em Rust, com as 19 regressões conhecidas corrigidas; teve um aviso de segurança médio em 2026, já
corrigido (FATO SECUNDÁRIO, blog do Bun e bases de avisos). A documentação do Next.js encontrada não confirma o site
sob Bun. **Proposta, aguardando decisão:** serviços em Bun 1.4.2, versão fixa e arquivo conferido; o site também, se
passar no teste, com o Node de reserva.

## 3. O roteiro

### 3.1 Agora, lançamento, rede principal e as fases seguintes

**Decisão.** "vamos montar inteiramente na devnet inicialmente"; "provavelmente vamos pra mainnet já no início do mês
2". As fases da v0.0.3 ficam, com o app Android depois da rede principal.

| Fase | Marco do slide | O que o usuário faz | O que precisa estar pronto |
|---|---|---|---|
| 1. Devnet | "NOW Devnet, test tokens." | Entra com SOL de teste, abre campanha, recebe sozinho, soma pontos | Núcleo em Pinocchio, serviços, janela, pagamento e site |
| 1, fim | "LAUNCH Partner markets live." | Entra nas campanhas dos parceiros | Os parceiros fechados. Hoje, nenhum |
| 2. Rede principal | "MAINNET After an audit, a multisig and a cap." | Entra com SOL de verdade, abre campanha paga e indica | Os dois critérios, indicação, pausa, plano de incidente, termos, avaliação jurídica e empresa |
| 2, depois. App Android | | Entra e abre campanhas pelo celular | Front de celular, a empresa como publicadora e o parecer do advogado |
| 3. Fase 1.2 | | Contesta um resultado, com depósito; entra em campanhas sobre tokens do formato novo | Arbitragem interna; leitor do Token-2022 com revisão própria |
| 4. Fase 2 | | Sai antes do fim; esportes | Fórmula de saída revisada por fora; oráculo de esportes |

**O slide muda.** "a cap" deixou de ser verdade. **Proposta, aguardando decisão:** "MAINNET After an audit and a
multisig." **Decisão (P2), de 5/10/2026,** agora com dois critérios: se faltar um, a data anda. O lançamento com
parceiros fica, na leitura deste plano, na devnet. **O app** vem depois da empresa, porque quem publica na loja precisa
ser a empresa, com conferência de identidade (FATO SECUNDÁRIO, proposta de arquitetura, citando o acordo da loja). A
data não foi decidida.

### 3.2 O prazo: sem data de hackathon

**Decisão, de 8/10/2026.** "16 nao se preocupe com deadline". O hackathon de 12/10/2026 sai do plano, com a
demonstração prevista.

O que continua contando é o dinheiro. O programa novo não tem instrução (FATO), e o escopo cresceu: o Pinocchio pede
as conferências à mão, a cobrança pela Pyth é uma leitura a mais e o app é uma fase nova. O prazo das auditorias não
está nos arquivos. Com o núcleo como única prioridade, o mês de devnet fica mais apertado que na v0.0.3 (INFERÊNCIA).

**O que acontece com a data.** Ela anda. Cada mês a mais de devnet soma 5.500 dólares, ou 50,3 SOL, ao gasto e a
todas as linhas do caixa (Parte 2, seção 5.5). Com os números da v0.0.3, não recalculados (INFERÊNCIA): um mês custa
7.500 antes do dinheiro real, com o ponto mais baixo do caixa no razoável em −27.674; dois meses, 13.000 e −33.174;
três, 18.500 e −38.674.

### 3.3 A ordem de construção

**Decisão (P1), de 5/10/2026: núcleo primeiro.** O núcleo é o que guarda dinheiro: indo primeiro, é a parte mais
testada e a primeira a chegar a quem audita. As decisões de 8/10/2026 mudam quatro coisas.

- **Pinocchio antes de a Sprint 02 escrever instruções.** O Anchor confere sozinho o dono, a assinatura, o tipo, o
  endereço e o tamanho de cada conta; o Pinocchio não. A proposta de arquitetura põe essas conferências num módulo
  único, com um teste para cada uma que passa a conta errada e precisa ser recusado.
- **Abertura, taxa e 1% do criador no núcleo.** "12 sim". As regras mínimas vão na instrução que abre: regra fora da
  abertura não existe.
- **Abrir sem pagar.** Equipe e parceiros abrem sem cobrança, por uma chave da equipe (proposta de arquitetura).
  **Decisão, de 8/10/2026 (P-3):** a equipe não paga os US$ 500 nem fica com o 1%, "porque nos ja cobramos taxa"; os
  parceiros também não ficam com o 1%.
- **O patrocínio deixa de ser peça separada.** Abrir é patrocinar com o mínimo, e o pedido de pergunta saiu.

**A indicação. Proposta, aguardando decisão (decisão 9):** "Referrals, day one" é o primeiro dia na rede principal.
Ela entra depois do núcleo e antes da auditoria; o programa grava quem indicou quem, e o repasse sai pelo serviço.

**A Sprint 02** ainda prevê Anchor e as instruções `team_propose_question` e `team_approve_question`. Ela e o plano
técnico precisam ser revistos, com a proposta de arquitetura 0.4 como base, antes de ela começar.

### 3.4 O que conta como pronto

**Decisão (P2), de 5/10/2026, sem o teto desde 8/10/2026.** A rede principal só abre com os dois critérios cumpridos
por inteiro.

- **Auditoria:** as duas empresas entregaram relatório sobre a versão exata que vai para a rede; toda falha grave
  foi corrigida e conferida por quem a apontou; os relatórios são públicos.
- **Carteira com várias assinaturas:** criada com as pessoas definidas, já dona da chave de atualização, com uma
  assinatura de teste feita.
- **Teto:** saiu ("7 sem teto, nem global nem individual").

**A exceção de 5/10/2026 perde metade.** Ela permitia abrir com um relatório concluído, sem falha grave aberta, e um
teto menor até o segundo chegar. Sem teto, sobraria abrir com uma auditoria só e sem limite de perda. **Proposta,
aguardando decisão (nova, desta parte):** esperar os dois relatórios.

**Proposta, aguardando decisão (decisão 17):** um terceiro item: as regras de abertura, a cobrança pela Pyth e o 1%
do criador estão na versão auditada.

## 4. O que protege o dinheiro

O dinheiro de cada campanha fica num cofre que só o programa movimenta. As proteções respondem a quatro perguntas: o
código está certo? Quem pode trocá-lo? Quanto se perde se algo falhar? O que acontece na hora da falha? Sem teto, a
terceira tem resposta dura.

### 4.1 Os critérios: auditoria e várias assinaturas; o teto saiu

**Decisão do pitch.** "MAINNET After an audit, a multisig and a cap." **Decisão, de 8/10/2026:** "i would like to
remove this per-market cap. limitless is the right way"; "7 sem teto, nem global nem individual".

**Auditoria. Decisão.** Duas empresas, sem custo: as duas auditorias "vão custar zero reais". Uma aparece nos arquivos
como proofofexploit.com, em negociação (registro de 4/10/2026); a outra não tem nome. Prazo, escopo, formato e
experiência com Pinocchio não foram encontrados. A auditoria só vale para a versão lida e não garante que não haja
erro. Sem teto, ela é a principal defesa.

**Carteira com várias assinaturas. Decisão (P3), de 5/10/2026.** Duas de três, com os três sócios, cada um num
aparelho físico. Toda troca de código espera de 24 a 48 horas, em público. A mesma carteira recebe a taxa. Hoje, na
devnet, a chave de atualização está com o Lucas e o Ronaldo (FATO, roteiro de sprints). **Proposta, aguardando
decisão:** fixar os signatários depois do acordo escrito dos três (decisão 12).

**O teto. Decisão (P4), de 5/10/2026, revogada em 8/10/2026.** Ele subia por degraus, de 10.000 a 100.000, e o
primeiro valor seria o que os sócios conseguiriam devolver do próprio bolso. Sem ele, a perda num erro não tem limite:
o cofre por campanha separa o dinheiro, mas um erro no código vale para todas as campanhas (INFERÊNCIA). Sobram as
auditorias, a carteira, a pausa, os testes e o plano de incidente, que ainda não existe. A reserva para devolver
dinheiro numa falha da casa, sem preço (seção 5.2), fica mais importante.

### 4.2 Quem pode o quê

A administração do programa precisa ser pública.

| Poder | Quem | Limite |
|---|---|---|
| Trocar o código | A carteira com várias assinaturas | Espera pública antes de valer |
| Abrir campanha | Qualquer carteira, pagando US$ 500 em SOL ao preço lido na hora | Cinco tipos; contas que o leitor aceita; frase do site; de 3 a 90 dias |
| Abrir sem pagar | Uma chave da equipe, para a equipe e os parceiros | Sem prêmio no pote, salvo se a equipe puser um, e sem o 1% do criador (P-3) |
| Confirmar ou anular na janela | Uma chave da equipe | Nunca inverte. Toda anulação fica registrada, com o motivo |
| Pausar | Uma chave da equipe, para ser rápido | Nunca trava pagamento nem devolução |
| Retomar | A carteira com várias assinaturas | |
| Mudar a taxa | Ninguém, numa campanha aberta | Valor fixo no código; o criador não escolhe |
| Enviar os pagamentos | O serviço agendado | Não escolhe quem recebe nem quanto |

Não há lista de contas nem teto para manter. A tabela é a resposta honesta a "No human in the loop": nenhuma pessoa
escolhe o vencedor, mas pessoas podem pausar e anular (seção 4.5).

### 4.3 As regras de abertura, no programa

**Decisão do pitch.** "Anyone can open a market, pump.fun style ... Inside the rules. Only markets the chain can
answer." **Decisão, de 8/10/2026:** o preço passa de 0,02 SOL a US$ 500, pagos em SOL. Sem ninguém da equipe no
meio, "inside the rules" só existe no programa.

| Regra no programa | O que impede |
|---|---|
| Só os cinco tipos | Campanha de opinião, que o slide do problema critica |
| A conta é conferida na abertura: dono e formato certos para o tipo | Conta que o leitor não sabe ler |
| Sem texto livre: "10 - site monta a frase" | O criador escrever uma coisa e o programa ler outra |
| De 3 a 90 dias | Campanha curta demais para entrar com calma |
| Taxas fixadas pelo programa | O criador escolher a própria parte |
| US$ 500 em SOL, pelo preço da Pyth | Campanha de lixo |

Todas são **Decisão, de 8/10/2026**, menos a fonte do preço (seção 2.2). Saíram a lista de contas ("8 nao tem lista
de contas aprovadas, nao lidaremos com tokenomics") e o limite por campanha.

**O furo do token sem valor fica aberto.** Qualquer conta que o leitor aceita pode ser usada. Alguém cria um token
sem valor, abre a campanha "a oferta cai para X até o dia 30?", espera entradas no NÃO e queima os próprios tokens.
A conta (INFERÊNCIA, conferida à mão): ele paga US$ 500 para abrir e põe 100 no SIM;
terceiros põem 1.000 no NÃO; ele queima, e dá SIM. A taxa é 100 e o 1% é 11. Como único vencedor, recebe 100 + 1.000
− 100 − 11 + 450 de prêmio = 1.439, mais os 11 de criador: 1.450. Pôs 600 e lucra 850.

O ponto que pesa: **os US$ 450 de prêmio voltam a ele**, e o 1% também. A manobra custa só os US$ 50 do Brot e
compensa com pouco mais de US$ 56 de terceiros do outro lado, X (`0,9 × X > 50`). Outros bakers no SIM não o
atrapalham: a entrada dele no lado que ele mesmo força não corre risco, então ele entra grande e fica com quase todo o
prêmio. O limite de cerca de US$ 56 vale quase sempre. Sobram o aviso automático e esses US$ 50. Nos tipos de stake é
parecido: o SOL só muda de lugar por um tempo. Só no tipo de preço ninguém controla o resultado.

**O criador entrando na própria campanha.** Sem cadastro não há como proibir. **Proposta, aguardando decisão
(decisão 14):** permitir, com aviso automático.

**O lixo.** Se ninguém entrar e a regra da P-4 valer também para a campanha sem entradas, que ainda não tem regra
escrita (Parte 1, seção 3.5), os US$ 450 voltam a quem abriu: o lixo custa US$ 50 por campanha,
mais o SOL parado até o prazo (INFERÊNCIA). Na devnet o SOL de teste é de graça, e a taxa não segura nada.

### 4.4 Sem tetos

**Decisão, de 8/10/2026.** Não há teto global, para a soma dos potes abertos, nem teto por campanha. O número da
seção fica porque outros documentos o citam.

- **Nada limita a perda** (seção 4.1).
- **Nada limita a receita pelo programa.** Um teto de 10.000 comportaria cerca de 21.400 dólares de entradas por mês;
  um de 100.000, cerca de 214.000 (INFERÊNCIA, v0.0.2, P4 §4.4).
- **Uma carteira ocupando o teto global deixa de ser problema**: não há capacidade a ocupar, e a decisão 18, limite
  por carteira em todos os tipos, perde o objeto.
- **O motivo de segurança do limite por campanha fica sem resposta.** Quem empurra o resultado ganha, no máximo, o
  lado oposto; sem limite, o pote pode passar do custo de empurrar (seção 4.3).

### 4.5 Os serviços, a janela e o pagamento

**Decisão.** Dois serviços agendados, em provedores diferentes. Depois de 10 minutos sem resposta e 3 tentativas, "o
segundo assume o cron e envia notificação para o cto saber que tem um sistema down". Não há botão público de
resolver, e o pagamento é automático: "não faz sentido ter botão de claim". **Decisão, de 8/10/2026:** os serviços
rodam em Bun e só usam SOL ("update keeper for only uses SOL").

Três regras de construção (v0.0.2, P4 §4.5): o serviço não decide nada; não acumula poderes, nem abre campanha nem
anula; e, como dois serviços com o mesmo código têm o mesmo defeito, a janela e a anulação continuam atrás deles. O
pagamento vai sempre para a carteira que entrou, e a plataforma paga a taxa de rede, 0,000005 SOL por envio (FATO).

**O pagamento em SOL.** Sai a conta de token de quem ganhou, que podia estar fechada e fazer o envio falhar. Entra o
mínimo de aluguel: um envio muito pequeno a uma carteira vazia falha se a deixa abaixo de 0,00065024 SOL (FATO,
medido na devnet e na rede principal em 8/10/2026). **Decisão, de 8/10/2026 (P-5):** entrada mínima de 0,01
SOL, cerca de US$ 1,09.

**A pausa** tem dois estados, normal e sem entradas novas; resolução, pagamento e devolução nunca pausam, e não há
saque de emergência pela equipe. **O plano de incidente**, uma página que diz quem pausa, quem fala pela casa e onde
se publica, ainda não existe.

**A janela e "No human in the loop".** Ao pé da letra, a frase tira a janela, e uma leitura errada seria paga sem
volta (Parte 1, seção 4.5). **Proposta, aguardando decisão (decisão 5):** manter a janela até a
auditoria e dizer "no human picks the winner".

**Com muitas campanhas**, conferir cada resolução, tarefa sem dono (seção 5.1), cresce sem controle; se ninguém
conferir, o pagamento sai ao fim das 6 horas.

### 4.6 Patrocínio, indicação e a parte do criador

**O patrocínio é a abertura. Decisão, de 8/10/2026.** "dos 500 dolares 90% vira pot e 10% vai para o brot": a regra
do pitch ("From $500. 90% becomes the prize pool.") vale para as duas coisas. Os US$ 450 entram no pote como prêmio
neutro, sem lado; os US$ 50 vão à conta de taxas. O pedido de pergunta saiu ("keep it, and ok for removal").

**O prêmio que volta. Decisão (P7), de 5/10/2026.** No pote de um lado só e na campanha anulada, o prêmio do
patrocinador volta inteiro; os 10% ficam com o Brot se a campanha esteve no ar e voltam se a anulação veio de falha da
casa. **Decisão, de 8/10/2026 (P-4):** a mesma regra para os US$ 450 da abertura. O programa registra o motivo
de cada anulação.

**A indicação** grava quem indicou quem e de qual entrada veio cada pedaço de taxa. **Proposta, aguardando decisão
(P-6):** a devolução ao indicado, que tinha limite de 5 dólares, passa a ter limite de 0,05 SOL, cerca de US$ 5,46.

**A parte do criador. Decisão, de 8/10/2026.** "1% do criador sai do pot, mas quando a disputa for muito acirrada, e
no caso do 1% do creator fizer com que o usuario que ganhou receba menos do que colocou, entao somente nesse caso, 1%
do creator sai da taxa do brot." O caso acontece com mais de 98,89% do pote no lado vencedor, sem prêmio, e não
quando a disputa é apertada; com os US$ 450, só em potes acima de cerca de US$ 45 mil (INFERÊNCIA, Parte 1, seção 3.4).

**Decisão, de 8/10/2026 (P-2): a leitura exata.** Ao pé da letra, todo o 1% passa para a taxa do Brot,
limitado a ela: perto do limite, o criador cai de cerca de 1.000 para cerca de 110 (com 98.900 contra 1.100, recebe
110), e o Brot fica sem taxa. A
proposta tira do pote o que dá sem deixar ninguém abaixo do que pôs, e só a diferença da taxa: o criador recebe 1.000
e o Brot, 100. Em lamports, a menor fração do SOL:

- taxa = 10% do lado perdedor (P), arredondada para cima; C = 1% das entradas (V + P), arredondado para baixo;
- do pote = o menor entre C e (P − taxa + prêmio); da taxa = o menor entre (C − do pote) e a taxa;
- o criador recebe do pote + da taxa; os vencedores dividem V + P − taxa − do pote + prêmio, nunca menos que V.

**Decidido depois, em 8/10/2026:** nada ao criador na anulada, no pote de um lado só e sobre o prêmio (P-1), e nada
nas campanhas da equipe e dos parceiros (P-3).

**A pilha sobre a taxa.** Tesouraria (25%), indicação (20%) e, se existir, o desconto do token B (até 40%) saem da
mesma taxa, na ordem da v0.0.2 (P3 §4.3). O 1% só entra nela no caso extremo, e a ordem se escreve com a P-2.

### 4.7 Tesouraria, SOL e a carteira do serviço

**O SOL. Decisão, de 8/10/2026.** "tudo em sol". Desfaz a decisão de 4/10/2026, "A moeda vai ser usdc, vamos
abandonar a ideia de sol". Uma moeda só simplifica a contabilidade da plataforma, mas receita e caixa passam a oscilar
com o SOL, e os custos são em dólar: os 5.500 por mês são 50,3 SOL e, com o SOL 30% abaixo, seriam cerca de 72
(INFERÊNCIA).

**A tesouraria. Decisão (P8), de 5/10/2026, em conflito.** Os 25% da taxa ficariam numa moeda de 1 dólar, e depois em
Bitcoin; a proposta 19 da v0.0.3 convertia o SOL das aberturas na mesma moeda. As duas batem de frente com "tudo em
sol".

**Proposta, aguardando decisão (P-7).** A plataforma recebe e paga em SOL. A conta de taxas, na carteira de várias
assinaturas, recebe a taxa dos potes e os US$ 50 de cada abertura, que vão inteiros para a operação, como a taxa de
marketing desde 5/10/2026. Dela sai o SOL que repõe a carteira do serviço, para as taxas de rede. A empresa converte
por mês, fora da plataforma, o necessário para os custos. A regra da tesouraria fica com o fundador.

## 5. Pessoas e empresa

### 5.1 A equipe

**Decisão do pitch.** O slide de equipe traz três pessoas.

| Nome | Cargo no slide | O que os arquivos dizem |
|---|---|---|
| Bernardo Nery | Head Baker · CEO | Nada além do nome e do cargo |
| Lucas Galvão | Chief Oven Officer · COO and CLO | O fundador. Decide as regras deste plano |
| Ronaldo Pereira | Chief Toasting Officer · CTO | **Decisão:** "o CTO é o Ronaldo". Autor do programa antigo; recebe os alertas |

**Advogado na equipe. Decisão, de 8/10/2026.** "we have a lawyer in our team that kind of question is gonna be
checked." A avaliação jurídica é interna.

**A ressalva.** O roteiro do fundador diz que "falta o de acordo do Bernardo e do Ronaldo para aparecerem", e nome e
cargo são dado pessoal num deck público por link. **Proposta, aguardando decisão (decisão 12):** pedir o de acordo
por escrito; até lá, as versões públicas trazem os cargos sem sobrenome.

**O que continua sem dono.** Nenhuma linha pede contratação; pedem um nome.

| Papel | Situação |
|---|---|
| Conferir as resoluções na janela de 6 horas | Sem dono |
| Atender o alerta fora de hora | O CTO, sem substituto |
| Falar com as duas empresas de auditoria | Sem dono nos arquivos |
| Fechar os parceiros de lançamento | Sem dono. Nenhum parceiro fechado |
| Publicar e manter o app na loja | Sem dono |
| Atender as denúncias de campanhas no app, que a loja exige (FATO SECUNDÁRIO, nota de pesquisa citando a política da loja) | Sem dono |

**O que depende de uma pessoa só.** O conhecimento dos leitores antigos está com o Ronaldo, que deveria revisar os
reescritos e documentar o que sabe. O alerta não tem segunda pessoa. E a avaliação jurídica é feita por alguém da equipe;
a decisão de 8/10/2026 não diz quem. Se for um sócio que mora no país avaliado, como era na v0.0.3, vale a ressalva
dela. **Proposta, aguardando decisão:** a conclusão fica por escrito, lida por um colega de
fora, como a v0.0.3 já recomendava.

### 5.2 Empresa, custos e acordo sobre o código

**Decisão.** A empresa ainda não existe, e a abertura "vai custar sim uns 2k dol". **Decisão (P5), de 5/10/2026:**
primeiro a avaliação jurídica, depois o país e a empresa; o bloqueio por país entra no site como interruptor.

| Item | Valor | Origem |
|---|---|---|
| Retirada dos três sócios | 1.500 cada; 4.500 por mês | Fundador |
| Infraestrutura | Até 1.000 por mês | Fundador |
| Abertura da empresa | Cerca de 2.000, uma vez | Fundador |
| Duas auditorias e avaliação jurídica | Zero | Fundador; a avaliação, pelo advogado da equipe |
| Pinocchio, Bun e Node | Zero de licença | Ferramentas abertas e gratuitas |
| Publicar o app na loja de dApps da Solana | Cerca de 0,2 SOL (uns US$ 22) em taxas e armazenamento, conforme o tamanho do app | FATO SECUNDÁRIO: proposta de arquitetura, citando a documentação da loja |
| Antes do dinheiro real | 7.500 com um mês de devnet; 5.500 por mês extra | Parte 2 |

Não têm preço: a infraestrutura item por item, os aparelhos de assinatura, um celular de teste, as auditorias
seguintes, uma licença, se preciso, e uma reserva para devolver dinheiro em falha da casa.

**O acordo sobre o código. Decisão (P6), de 5/10/2026.** Um termo curto entre os sócios agora, sobre de quem é o
código novo, a dedicação de cada um e o destino das chaves se alguém sair; o acordo completo vem com a empresa
("vamos deixar tudo em nome da empresa"). Os arquivos não registram que o termo tenha sido escrito. Vale para os três.

## 6. Regulação

Este capítulo não é parecer. **Decisão, de 8/10/2026:** a avaliação jurídica é interna, feita pelo advogado da
equipe. **Decisão.** O acesso é "100% onchain da solana, via wallet, sem kyc", sem bloqueio de país por enquanto. Este
é o único capítulo em que a palavra "aposta" aparece, sempre entre aspas, porque é a palavra das leis.

### 6.1 O que foi lido e o que não foi

**Lido na fonte** (FATO; a v0.0.2, P4 §7.1, traz cada citação e data).

- **Resolução nº 5.298 do CMN, o Conselho Monetário Nacional, de 24/4/2026.** Proíbe "a oferta e a negociação, no
  país, de contratos derivativos" ligados a evento esportivo, a jogo on-line e a evento de "qualquer outra temática
  que, a critério da Comissão de Valores Mobiliários, não seja representativa de referencial econômico-financeiro".
  O art. 4º alcança derivativos negociados no exterior e oferecidos no país.
- **Nota Técnica SEI nº 2958/2026, da Fazenda.** Trata as plataformas do setor como exploração ilegal de "aposta de
  quota fixa". Diz que o enquadramento "não decorre da nomenclatura", aponta a "ausência de procedimentos robustos de
  identificação de usuários (KYC)" e sugere bloquear o acesso por brasileiros.
- **O bloqueio.** A Anatel confirmou em 24/4/2026 que notificou as operadoras. A lista de 27 sites saiu na imprensa
  (FATO SECUNDÁRIO) e inclui Hedgehog Markets, que roda na Solana, e Predict.fun.
- **Medida Provisória nº 1.394, de 25/9/2026**, lida no Planalto em 5/10/2026. "Proíbe a exploração, a oferta, a
  intermediação e a publicidade de loterias de apostas de quota fixa no território nacional", "inclusive quando
  realizadas por agente sediado no exterior" (art. 1º). Para ela, "aposta de quota fixa" é colocar valor em risco "na
  expectativa de obtenção de prêmio cujo montante é definido por fator de multiplicação" (art. 3º, I). Fecha os meios
  de pagamento (art. 14), veda publicidade e patrocínio "direcionado ao público brasileiro" (art. 16), multa
  provedores em até 50 milhões de reais por infração (arts. 19 a 23), prevê perdimento de valores (art. 28), revoga a
  maior parte da Lei 14.790/2023 (art. 29) e vale desde a publicação (art. 30).
- **Leis 14.478/2022 e 9.613/1998.** A primeira exige autorização de quem faz "custódia ou administração de ativos
  virtuais" "em nome de terceiros". A segunda obriga a identificar clientes quem explora "sistemáticas de captação de
  apostas com pagamento de prêmios".
- **Fora do Brasil.** A autoridade europeia de valores mobiliários vetou em 3/7/2026 a venda ao varejo de contratos
  de evento ligados a certas referências financeiras. O regulador americano de derivativos multou a Polymarket em 2022:
  a regra vale "regardless of the technology used".

**Não conferido.** A tramitação da medida provisória; o Decreto nº 13.128, de 2026; a regra complementar da CVM; o
prazo de 30/10/2026 para prestadoras de ativos virtuais (FATO SECUNDÁRIO). E a pergunta central, sem parecer: se um
pote sobre fato gravado na rede é "aposta de quota fixa". No pote, o retorno só se conhece quando as entradas fecham,
mas a Nota Técnica descarta argumentos de formato.

**Quem opera de fora.** Nevada incluiu a empresa do Panamá da Polymarket numa ação civil (FATO, 16/1/2026); a
Polymarket põe o Brasil na lista de "só fechar posição" (FATO); a autoridade francesa de jogos considerou insuficiente
um bloqueio de país contornável (FATO, 17/7/2026).

### 6.2 A lista da avaliação jurídica

A lista passa a ser o roteiro do advogado da equipe. Os doze pontos da v0.0.2 (P4 §7.6), mais curtos:

1. O pote é "aposta de quota fixa", jogo de azar, loteria não autorizada, derivativo ou nenhum deles?
2. O risco pessoal de sócios no Brasil, com a empresa fora, com ou sem bloqueio.
3. O cofre, com a equipe controlando a atualização, é custódia em nome de terceiros? Há dever de identificar clientes?
4. Campanhas de preço são derivativo? Queima, liquidez e stake são "referencial econômico-financeiro"?
5. Quais países bloquear no primeiro dia, e se o Brasil entra.
6. Parceiros, publicações no X e material em português diante do art. 16.
7. O patrocinador não divulgado, e o dinheiro vindo do Cloak.
8. A devnet, com dinheiro de teste e pontos, está fora dessas regras? (O hackathon saiu do plano.)
9. Esportes, na fase 2, a categoria que as duas normas citam pelo nome.
10. A tramitação da medida provisória e o Decreto 13.128.
11. Termos de uso, avisos de risco e política de privacidade antes do dinheiro real; a lista de investidores.
12. A tesouraria e a origem do dinheiro diante da corretora.

**As seis perguntas que o pitch criou**, com as palavras de 8/10/2026: **(a)** a criação aberta muda o papel da
empresa, de quem oferece a campanha para quem a hospeda? **(b)** O criador que recebe 1% vira operador ou agente,
inclusive morando no Brasil? **(c)** Receber taxas em SOL e pagar criadores cria dever fiscal ou de registro? **(d)**
Os 10% da abertura, antes "taxa de marketing", são serviço de publicidade diante do art. 16? **(e)** Trocar "aposta" e
"mercado" por "campanha" e "entrada" muda a classificação, se ela "não decorre da nomenclatura"? **(f)** Quem responde
por uma campanha aberta por um terceiro sobre o token de outro projeto?

**As quatro perguntas que as decisões de 8/10/2026 criam.** São perguntas, e não conclusões.

- **(g) Tudo em SOL.** Um pote em SOL, que oscila em dólar enquanto a campanha está aberta, muda a classificação ou
  a resposta à pergunta 3, sobre custódia?
- **(h) A abertura de US$ 500, com 90% virando prêmio.** Quem põe dinheiro num prêmio que outros disputam vira
  organizador, patrocinador de prêmio ou parte da "aposta"?
- **(i) Sem teto e sem lista.** Alguma regra de proteção exige limite de valor ou conferência do que se abre? A
  empresa responde por uma campanha sobre token sem valor empurrada pelo criador?
- **(j) A loja de dApps da Solana.** A loja pede legalidade e a documentação de serviço financeiro regulado, e a
  medida provisória alcança lojas de aplicativo nos arts. 21 e 22 (FATO SECUNDÁRIO, proposta de arquitetura).
  Publicar o app muda a exposição no Brasil? Bloquear dentro do app basta?

Os pontos sobre tokens estão na Parte 3, seção 6.

## 7. Riscos

A gravidade é INFERÊNCIA. **Crítica** pode derrubar o negócio ou custar dinheiro de baker. **Alta** compromete o
lançamento ou a confiança. **Média** custa tempo ou dinheiro.

| Risco | Gravidade | O que reduz | Se acontecer |
|---|---|---|---|
| Erro no programa com dinheiro real dentro | Crítica | Duas auditorias e testes. Nada limita a perda | Pausar entradas; pagamentos seguem. Corrigir |
| A troca para Pinocchio deixa uma conferência de conta sem fazer | Crítica | Módulo único de conferências, com teste negativo para cada uma; auditoria | Como acima |
| Chave de atualização roubada ou numa mão só | Crítica | Duas de três, aparelhos físicos, espera pública | As outras assinaturas trocam a chave |
| Os dois serviços parados; um SIM vira NÃO | Crítica | Provedores diferentes, alerta ao CTO, janela de 6 horas | Anular na janela; todos recebem de volta |
| A regra brasileira alcança o pote ou os sócios | Crítica | Avaliação jurídica antes do dinheiro real; bloqueio como interruptor | Ligar o bloqueio. Quem entrou sempre recebe |
| A demanda não aparece | Crítica | Beta com pontos, parceiros, retenção medida | Parar aos 180 dias: perda de 36.348, contra 116.565 no mês 24 (números da v0.0.3) |
| O criador empurra o resultado de uma campanha sobre token sem valor | Crítica | Só o aviso automático (proposta) e os US$ 50 da manobra, que compensa com pouco mais de US$ 56 do outro lado | Não há volta. Tirar a campanha da página inicial |
| O preço do SOL cai entre receber e pagar as contas | Alta | Converter por mês o necessário para os custos (P-7) | A mesma receita paga menos |
| O criador entra na própria campanha | Alta | Aviso automático (proposta) | Nenhuma correção possível sem cadastro |
| Poucas pessoas: um sócio fica indisponível | Alta | Termo entre os sócios, segunda pessoa para o alerta | As campanhas abertas resolvem e pagam sozinhas |
| O site é tomado e pede assinaturas maliciosas | Alta | Chave física no domínio, na hospedagem e no repositório | Tirar do ar; os cofres não são afetados |
| O Bun 1.4 é a primeira versão reescrita em Rust | Média | Versão fixa, arquivo conferido, teste de carga; Node de reserva para o site | O pagamento atrasa; o dinheiro fica no cofre |
| A loja remove o app Android | Média | O site é o caminho principal, com o mesmo backend | Quem usa o app entra pelo site |
| "No human in the loop" contradito pelas regras | Média | Trocar a frase (decisão 5) | Explicar a janela |
| Campanhas de lixo enchem a página inicial | Média | Os US$ 500 por abertura; a ordem da página | Rever a ordem |
| Nomes e cargos no deck sem acordo escrito | Média | Acordo por escrito (decisão 12) | Tirar os sobrenomes |
| O deck mostra "7 of 30" com logos fictícios | Média | A etiqueta "example" | Trocar pela lista real ou esvaziar |

**Saíram três linhas:** o prazo que estoura, porque não há prazo; a carteira que ocupa o teto global, porque não há
teto; e o emissor da moeda congelar um cofre, porque o SOL nativo não tem quem congele. Continuam, como médios, o Cloak
não esconder o que promete e as auditorias seguintes não serem gratuitas.

Nenhuma proteção de risco crítico está pronta hoje, e duas perderam a segunda linha de defesa em 8/10/2026: o erro no
programa, que o teto limitava, e a campanha empurrada pelo criador, que a lista e o limite por campanha fechavam.

## 8. Decisões e pontos abertos

**Decidido em 8/10/2026**, no que toca esta parte: tudo em SOL; abrir por US$ 500 em SOL, 90% de prêmio e 10% para o
Brot; a equipe abre e os parceiros, de graça; o 1% do criador sai do pote, e da taxa só no caso extremo; sem teto; sem
lista; as regras mínimas de abertura, sem texto livre; tudo isso no núcleo; Pinocchio; Bun; app Android; sem IA; sem
prazo; advogado na equipe; o pedido de pergunta sai.

**As decisões de construção de 5/10/2026.** Ficam a P1, a P2 (com dois critérios), a P3, a P5 (com o advogado da
equipe), a P6 e a P7 (que a P-4 estende à abertura). A P4, o teto, foi revogada. A P8, a tesouraria, está em conflito
com "tudo em sol", e a P-7 propõe o substituto.

**O que espera decisão do fundador**, no que toca esta parte. As P-1 a P-8 são as do índice; os números, os da v0.0.3.

| Nº | Decisão | Recomendação | Seção |
|---|---|---|---|
| P-1 | O 1% na anulada, no pote de um lado só e sobre o prêmio | **Decidida em 8/10/2026:** nada nos três casos | 4.6 |
| P-2 | A leitura exata do 1% no caso extremo | **Decidida em 8/10/2026:** do pote o que dá; só a diferença da taxa | 4.6 |
| P-3 | A equipe fica com o 1% e paga os US$ 500? | **Decidida em 8/10/2026:** não e não; os parceiros também não ficam com o 1% | 3.3 |
| P-4 | Os US$ 450 no pote de um lado só e na anulada | **Decidida em 8/10/2026:** voltam a quem abriu; os 10% seguem a causa | 4.6 |
| P-5 | A entrada mínima | **Decidida em 8/10/2026:** 0,01 SOL | 4.5 |
| P-6 | O limite da devolução da indicação | 0,05 SOL | 4.6 |
| P-7 | A tesouraria, com tudo em SOL | Receber e pagar em SOL; converter por mês o necessário | 4.7 |
| P-8 | Cloak e SODAX com SOL | Conferir antes de usar | 2.2 |
| D-f | A fonte do preço dos US$ 500 | **Decidida em 8/10/2026:** Pyth no programa; CoinGecko no site | 2.2 |
| Bun | O site também em Bun | Só se passar no teste | 2.2 |
| Slide | O roteiro da rede principal | "After an audit and a multisig" | 3.1 |
| Nova | A exceção de 5/10/2026 sem o teto | Esperar os dois relatórios | 3.4 |
| 5 | "No human in the loop" e a janela | Manter a janela; "no human picks the winner" | 4.5 |
| 9 | "Referrals, day one" | O primeiro dia na rede principal | 3.3 |
| 12 | O de acordo do Bernardo e do Ronaldo | Pedir por escrito | 5.1 |
| Jurídico | A conclusão da avaliação jurídica | Por escrito, lida por um colega de fora | 5.1 |
| 14 | O criador entrando na própria campanha | Permitir, com aviso automático | 4.3 |
| 17 | Um terceiro item no "pronto" | As regras de abertura na versão auditada | 3.4 |

Saíram desta lista, decididas em 8/10/2026: a 1, a 2, a 4, a 7, a 13, a 15, a 16, a 18 e parte da 6; a 10 virou a
P-1, e a 19, a P-7. Faltam quem assina a carteira e o termo entre os sócios.

**O que a pesquisa não encontrou.** O prazo, o escopo e o nome da segunda auditora, e se as duas revisam Pinocchio; a
tramitação da Medida Provisória 1.394; o custo da infraestrutura item por item; o aluguel da conta de uma campanha; se
Cloak e SODAX servem com SOL; quantos aparelhos usam a loja de dApps; uma criação aberta que tenha sustentado volume.
