# Brot Markets — Resumo de produto (Product Brief)

**Versão:** 0.0.1 · **Estado:** aprovado pelo fundador em 5/10/2026 ("docs aprovados, podemos dar início") · **Data:** 5 de outubro de 2026 · **Etapa:** Fase 4,
etapa 4.1 do wizard

Diz a agentes e desenvolvedores o que construir. Não é texto para investidor (isso é o plano de negócio) nem
arquitetura (isso é o plano técnico, que vem depois e lê este documento).

**Método.** Engenharia reversa do plano de negócio v0.0.2 e do protótipo aprovado, a direção Ledger²
(`prototype-lab/prototype-d/`, escura, e `prototype-lab/prototype-n/`, clara). O que o plano decide está transcrito
com a referência. O que nenhum dos dois decide está na seção 14, sem resposta inventada.

**Referências.** `P1 §3.3` é a Parte 1 do plano (`docs/business/BP-v0.0.2-parte-*.md`), seção 3.3. `IQR` é
`docs/business/ideacao-perguntas-e-respostas.md`, seção 1, que prevalece quando duas partes divergem. `R-07` é uma
regra da seção 5; `L-12`, uma lacuna da seção 14.

**Aviso sobre o protótipo.** Ele foi feito antes de o produto ser redefinido e mostra o modelo antigo: preço do token
SIM, compra e venda, patrocinador vendendo com desconto. Dele vale a forma: layout, componentes, mascote e tom. O
conteúdo de cada tela segue a seção 13.

## 1. O produto em uma frase

Um mercado de previsão em pote, na Solana, para o público de cripto: a pessoa entra só com a carteira, aposta USDC no
SIM ou no NÃO de uma pergunta cuja resposta está gravada na rede, e quem acerta divide o pote e recebe sozinho na
carteira (P1 §1.1, §1.2).

## 2. Para quem

O plano descreve papéis, e não personas com nome e idade. Este documento não cria nenhuma.

| Papel | Quem é | Fonte |
|---|---|---|
| Apostador | Quem já usa carteira de cripto na Solana ("queremos pessoal da web3"). Entra sem cadastro | P1 §2.2 |
| Projeto patrocinador | Equipe de um token ou protocolo que prometeu algo verificável na rede, como uma queima, e paga para pôr prêmio numa pergunta e aparecer | P1 §3.7 |
| Parceiro gratuito | Um dos 20 a 30 projetos convidados a ter uma pergunta sem pagar, em troca de divulgação | P2 §4.3 |
| Quem indica | Um apostador que traz outro | P1 §3.8 |
| Quem sugere | Qualquer pessoa que propõe uma pergunta pelo X | P1 §4.1 |
| Equipe | Três sócios. Abre perguntas, confere resoluções e recebe os alertas dos serviços (o CTO) | P4 §6.1 |

## 3. O que cada um quer fazer

- **Apostador:** apostar no que acha que vai acontecer com um ativo ou um projeto, sem cadastro; saber antes de
  assinar quanto pode receber e por quanto tempo o dinheiro fica preso; conferir de onde saiu o resultado; receber
  sem pedir (P1 §2.2, §3.2, §3.9, §4.7).
- **Patrocinador e parceiro:** abrir uma pergunta sobre a própria promessa, deixar a rede provar que cumpriu e levar
  a própria comunidade a acompanhar (P1 §2.2, P2 §4.3).
- **Quem indica:** ganhar parte da taxa de quem trouxe (P1 §3.8).
- **Equipe:** abrir só perguntas que ninguém decide de graça; nunca escolher o vencedor; saber na hora quando um
  serviço caiu (P1 §4.3, §4.4, §4.5).

## 4. Os fluxos, passo a passo

Toda pergunta passa por cinco estados (P1 §3.1): **aberta** (recebe apostas), **fechada** (as apostas pararam),
**em revisão** (o resultado foi lido e a janela de 6 horas corre), **paga** e **anulada**. O título de cada fluxo diz
em que fase ele entra (seção 6).

### F1. Ver a pergunta e o pote (MVP)

- **Quem e gatilho:** qualquer visitante, com ou sem carteira, abre a página inicial ou o link de uma pergunta.
- **Passos:** (1) filtra por tipo e por estado, busca e ordena a lista, como no protótipo; (2) abre uma pergunta.
- **O que vê:** o texto, o tipo, a data final e o momento do fechamento; o total do pote e de cada lado; a chance de
  cada lado (R-03); o retorno estimado por 1 USDC, já descontada a taxa, com a palavra "estimativa" (R-04); o número
  lido agora, a meta e o link da conta; o estado; o selo e o aviso do patrocinador (R-19).
- **Se der errado:** rede indisponível, pote vazio e pote com um lado só não têm tela decidida (L-05, L-06).

### F2. Apostar (MVP)

- **Quem e gatilho:** um apostador com carteira e USDC, de teste na devnet, escolhe um lado numa pergunta aberta.
- **Passos:**
  1. Conecta a carteira. Não há cadastro.
  2. Escolhe SIM ou NÃO e digita o valor.
  3. A tela recalcula o retorno estimado com a aposta dele já no pote. Com 300 no SIM e 700 no NÃO, 1 USDC no SIM
     rende 3,10; se entrarem mais 700 no SIM, passa a 1,63 (R-02; P1 §3.2).
  4. Lê os avisos obrigatórios (seção 11) e assina.
  5. O programa registra a aposta em nome da carteira, sem emitir token. A mesma carteira aposta quantas vezes
     quiser, sem limite de valor (R-05).
- **Se der errado:**
  - Apostas fechadas, pelo prazo ou porque o fato já aconteceu: o programa recusa (R-07, R-08).
  - Pergunta de preço sem preço fresco: a aposta não entra (R-09).
  - Teto global atingido ou site em pausa, na rede principal: sem apostas novas (R-30, R-31).
  - Saldo insuficiente, carteira sem SOL, assinatura recusada, transação que falha: sem tela decidida (L-06). A tela
    em que a pessoa acompanha as próprias apostas também não existe (L-02).

### F3. Pergunta resolvida e pagamento automático (MVP)

- **Quem e gatilho:** o serviço agendado age quando o fato acontece, mesmo antes da data final, ou quando a data
  passa.
- **Passos:**
  1. O serviço principal confere a cada minuto o que já pode ser resolvido e aciona a leitura (R-22).
  2. O programa lê a conta da pergunta e compara com a meta: cumprida, SIM; data vencida sem a meta, NÃO. Ninguém
     informa nada (P1 §4.4).
  3. A pergunta fica "em revisão" por 6 horas (F6).
  4. Confirmada, ou vencida a janela, o serviço envia a cada vencedor a parte dele (R-02, R-24). O serviço não
     escolhe quem recebe nem quanto.
  5. A pergunta passa a "paga".
- **O que vê:** o resultado, com o número lido, a meta e o link; o relógio da janela; depois, o valor recebido.
- **Se der errado:**
  - O serviço principal cai: o segundo assume (R-22).
  - A leitura não acontece a tempo: o prazo vence, o programa grava NÃO, e a equipe anula na janela (P4 §8).
  - A conta de USDC do vencedor foi fechada: o valor fica reservado em nome dele, sem prazo (R-24). Como ele é
    avisado e como recebe: L-15.

### F4. Pote de um lado só (MVP)

- **Quem e gatilho:** a pergunta é resolvida com apostas em um lado só.
- **Passos:** (1) sem perdedor para pagar o vencedor, o pote devolve as apostas, qualquer que seja o resultado; (2) o
  primeiro apostador recebe tudo o que pôs, e os demais pagam 1% (R-10); (3) o prêmio do patrocinador volta inteiro
  (R-12); (4) a devolução sai pelo envio automático de F3.
- **Exemplo (P1 §3.4):** todos no SIM. Ana, a primeira, pôs 100; Bruno, 200; Carla, 300. Recebem 100, 198 e 297. A
  casa fica com 5.
- **Se der errado:** as falhas de envio de F3. Não há tela para a devolução (L-04).

### F5. Pergunta anulada (MVP)

- **Quem e gatilho (P1 §3.4):** a conta deixou de poder ser lida; a janela de leitura foi perdida por falha do
  serviço; ou a equipe concluiu, na janela de 6 horas, que a leitura estava errada. Em pergunta de preço, também
  quando o preço não pôde ser lido até o prazo (P4 §5.1).
- **Passos:** (1) a pergunta passa a "anulada"; (2) cada um recebe o que apostou, sem taxa (R-11); (3) o prêmio do
  patrocinador volta inteiro, e os 30% da plataforma seguem a causa (R-12, R-18); (4) a anulação fica pública, com o
  motivo (P4 §4.3).
- **Se der errado:** as falhas de envio de F3. Não há tela, nem definição de quem grava "anulada" fora da janela de
  6 horas (L-04).

### F6. Janela de 6 horas e contestação (MVP, com partes depois)

- **Quem e gatilho:** a equipe, quando um resultado é gravado. No MVP, o público só avisa.
- **Passos:**
  1. A tela mostra "em revisão" e o relógio de 6 horas.
  2. Alguém da equipe confere a leitura e só pode confirmar ou anular. Não existe inverter (R-23).
  3. Confirmou: paga na hora. Ninguém revisou: paga sozinho ao fim das 6 horas. Anulou: F5.
  4. Chegou um aviso pelo canal público e a equipe aciona a contestação: o pagamento pausa (R-25).
  5. Etapa 1, até 1 hora: o dado é lido de novo por outro provedor de acesso à rede e, em pergunta de preço, por um
     segundo oráculo. Leituras iguais: paga. Diferentes: etapa 2.
  6. Etapa 2, até 48 horas: dois de três membros da equipe decidem, só entre confirmar e anular, e publicam o motivo
     (R-26).
- **O que vê:** o relógio e, com contestação, o prazo novo. No pior caso, 55 horas depois da resolução.
- **Por fase:** os passos 1 a 3 estão no MVP; a etapa 1 entra antes da rede principal; a contestação pelo apostador,
  com depósito, e a arbitragem interna entram na fase 1.2 (seção 16, item 3).
- **Se der errado:** sem ninguém da equipe, o pagamento sai sozinho. O canal público e o segundo oráculo não foram
  escolhidos (L-13, L-14).

### F7. A equipe abre uma pergunta, o primeiro ciclo (MVP)

- **Quem e gatilho:** duas pessoas da equipe, uma propõe e outra aprova (R-32), por escolha própria, por sugestão
  aceita (F11) ou por combinação com um parceiro (F9).
- **Passos:** (1) escolhe um dos cinco tipos (R-13); (2) informa a conta da Solana que será lida, a meta e a data
  final, de até 90 dias (R-06); (3) o programa confere, na criação, se a conta serve para o tipo (P1 §4.1); (4) a
  segunda pessoa aprova; (5) a pergunta nasce "aberta", com o fechamento de R-07.
- **Regra de escolha:** nos tipos em que empurrar o resultado custa dinheiro, só metas caras de empurrar (P4 §4.4).
- **Se der errado:** conta que não serve para o tipo, ou token do padrão novo (Token-2022) em pergunta de queima: a
  criação é recusada (P1 §4.3). O painel da equipe não está desenhado (L-12).

### F8. O patrocinador pede uma pergunta, o segundo ciclo (antes da rede principal)

- **Quem e gatilho:** um projeto quer uma pergunta sobre a própria meta, ou quer pôr prêmio numa já aberta.
- **Passos:**
  1. Escolhe a faixa (R-15), a forma, prêmio neutro ou aposta de patrocinador (R-17), e se mostra o nome. "Não
     divulgado" só vale com prêmio neutro (R-19).
  2. Se pede pergunta nova, descreve e paga. O pagamento fica travado (R-20).
  3. A equipe aceita ou recusa. O aceite abre a pergunta e aplica o dinheiro numa mesma operação: 70% no pote e 30%
     para a plataforma (R-16).
  4. A pergunta segue de F7 em diante, com o selo, o texto do patrocinador e o aviso de R-19.
- **Se der errado:**
  - Recusa: libera o saque, feito pelo próprio patrocinador. Sem resposta em 14 dias: ele cancela sozinho.
  - Pote de um lado só ou pergunta anulada: R-12 e R-18.
  - Cloak fora do ar: o patrocínio não divulgado fica indisponível; o resto segue (P4 §5.1).
  - Nenhuma tela deste fluxo está desenhada (L-11).

### F9. Parceiro gratuito (MVP)

- **Quem e gatilho:** um dos 30 primeiros projetos convidados aceita o convite.
- **Passos:** (1) combina com a equipe uma pergunta sobre uma meta dele; (2) a equipe a abre por F7, com selo, nome,
  link e destaque de 72 horas na página inicial; (3) o parceiro publica na abertura e na resolução e deixa a pergunta
  fixada enquanto as apostas estiverem abertas; (4) no fim, recebe o relatório de volume e de carteiras (R-21).
- **Regras:** valem o aviso de R-19 e as exclusões de R-14. Não entra dinheiro do parceiro, e o fluxo não depende do
  módulo de patrocínio (P4 §3.3).
- **Se der errado:** o plano não diz o que acontece com o parceiro que não publica (L-24).

### F10. Indicação (antes da rede principal)

- **Quem e gatilho:** o indicado chega pelo convite de alguém, antes da primeira aposta.
- **Passos:**
  1. O vínculo é gravado uma única vez, antes da primeira aposta do indicado (P4 §4.7).
  2. O indicado aposta e paga a taxa como todo mundo.
  3. Quando uma aposta dele ganha, quem indicou recebe 20% da taxa que a casa recebeu dela, por 90 dias (R-27).
  4. Ao completar 250 USDC apostados, o indicado recebe de volta a taxa dos primeiros 50, até 5 USDC (R-28).
- **Se der errado:** a autoindicação, com duas carteiras, é risco aceito, sem trava (P4 §4.7). Como o vínculo é
  criado, quando os 90 dias começam e onde se vê o saldo: L-10.

### F11. Sugestão pelo X (fase não fixada, L-17)

- **Quem e gatilho:** qualquer pessoa quer propor uma pergunta.
- **Passos:** (1) lê no site como sugerir; (2) publica no X; (3) a equipe escolhe o que aparece na página; (4) a
  sugestão aceita vira pergunta por F7.
- **Regras (P1 §4.1):** lista escolhida pela equipe, nunca menção automática; página separada da página de aposta;
  nenhuma sugestão vira pergunta sem revisão humana.
- **Se der errado:** com o X fora do ar, a página fica sem a lista, e nenhuma aposta depende dela (P4 §5.1). Guardar
  o nome de usuário de quem sugeriu é dado pessoal (seção 11).

### F12. Pontuação na devnet (MVP)

- **Quem e gatilho:** o apostador acerta uma pergunta durante o mês de testes.
- **Passos:** (1) aposta USDC de teste em perguntas reais, com resolução real; (2) quem acerta ganha pontos; (3) uma
  classificação pública mostra os pontos (P2 §2.6, §6.2).
- **Regra:** pontos por acerto, nunca por volume (P2 §3.5).
- **Se der errado:** a fórmula dos pontos, o que eles valem depois e como se consegue USDC de teste não estão
  decididos (L-08, L-09).

## 5. As regras de negócio

V é o total apostado no lado que ganhou; P, o total no lado que perdeu.

| # | Regra | Número exato | Fonte |
|---|---|---|---|
| R-01 | Taxa | 10% do lado perdedor: 0,10 × P | P1 §3.3 |
| R-02 | Pagamento ao vencedor | Cada 1 USDC do lado vencedor recebe (V + 0,90 × P) ÷ V. Com 300 no SIM e 700 no NÃO: 3,10 se der SIM; 1,39 se der NÃO | P1 §3.2 |
| R-03 | Chance | A fatia do pote em cada lado. Não é preço nem probabilidade garantida | P1 §3.2 |
| R-04 | Retorno estimado | R-02 sobre o pote de agora. Muda a cada aposta e só fica definido no fechamento | P1 §3.2 |
| R-05 | Moeda e limites | USDC. Registro por carteira, sem token. Sem limite de compra, sem teto por pergunta e sem saída antes do fim | P1 §2.1, §3.2, §3.6 |
| R-06 | Duração | Até 90 dias. Recomendação: 3 dias ou mais | P1 §3.5 |
| R-07 | Fechamento das apostas | Quando faltam 5% da duração, com mínimo de 24 horas e máximo de 7 dias. Pergunta de 30 dias fecha no dia 28,5 | P1 §3.5 |
| R-08 | Trava no fato | Em fato que não volta atrás, como a queima, as apostas travam no instante do fato, e a pergunta pode resolver antes da data | P1 §3.5, §4.1 |
| R-09 | Pergunta de preço | Toque: SIM se o preço encostar no alvo em qualquer momento do prazo. Toda aposta exige preço fresco | P1 §4.2 |
| R-10 | Pote de um lado só | Devolve. O primeiro apostador não paga taxa; os demais pagam 1% do que apostaram | P1 §3.4 |
| R-11 | Pergunta anulada | Devolve tudo, sem taxa | P1 §3.4 |
| R-12 | Prêmio do patrocinador em R-10 e R-11 | Volta inteiro ao patrocinador | P1 §3.4 |
| R-13 | Tipos do primeiro dia | Cinco: preço de ativo grande, queima de oferta, liquidez travada na Meteora, tamanho de pool de staking e stake de validador. Queima, só em tokens do padrão clássico. O leitor de preço é construído primeiro | P1 §4.2, §4.3 |
| R-14 | Tipos fora | Decididos de graça por uma chave: renúncia de emissão, renúncia de congelamento, programa imutável e metadados imutáveis. Tokens travados: fora no primeiro dia. Preço de token pequeno: depois, em três degraus. Geopolítica e política: por desenho. Esportes: fase 2 | P1 §4.3 |
| R-15 | Faixas de patrocínio | 500, 1.500 e 5.000 dólares | P1 §3.7 |
| R-16 | Divisão do patrocínio | 70% para o pote e 30% para a plataforma: 350 e 150; 1.050 e 450; 3.500 e 1.500. Os 30% vão para a operação | P1 §3.7, P2 §4.2 |
| R-17 | Formas de patrocínio | Prêmio neutro: sem lado, sem taxa, inteiro para os vencedores. Aposta de patrocinador: num lado, com selo, conta como aposta comum | P1 §3.7 |
| R-18 | Os 30% quando o prêmio volta | Ficam com a plataforma no pote de um lado só e na anulação por causa de fora; voltam na anulação por falha dela | P4 §4.8 |
| R-19 | Patrocinador não divulgado | Oculto para o público, identificado para a equipe; só com prêmio neutro. Aviso na pergunta: "o patrocinador pode controlar o resultado e pode ter apostado" | P1 §3.7 |
| R-20 | Pedido de pergunta | Pagamento travado. O aceite abre a pergunta e aplica o dinheiro numa só operação. A recusa libera o saque pelo patrocinador. Com 14 dias sem resposta, ele cancela sozinho | P1 §4.1, P4 §4.7 |
| R-21 | Parceiros gratuitos | Os 30 primeiros. Uma pergunta por projeto, destaque de 72 horas e duas publicações do parceiro | P2 §4.3 |
| R-22 | Serviços agendados | O principal confere a cada minuto. O segundo, em outro provedor, confere o principal a cada 5 minutos; com 10 minutos sem resposta, tenta religar até 3 vezes; depois assume, a cada 5 minutos, e manda email ao CTO. Sem botão público de resolver | P1 §4.4 |
| R-23 | Janela de revisão | 6 horas. A equipe só confirma ou anula. Sem revisão, o pagamento sai sozinho | P1 §4.5 |
| R-24 | Pagamento | Automático, sem botão de resgate, sempre para a carteira que apostou. A plataforma paga a taxa de rede (0,000005 SOL por envio). Conta de USDC fechada: valor reservado, sem prazo | P1 §3.9, P4 §4.5 |
| R-25 | Contestação | Dentro das 6 horas; pausa o pagamento. No MVP, só a equipe aciona. Na fase 1.2, qualquer apostador da pergunta, com depósito (50 USDC é o exemplo do plano), devolvido se proceder | P1 §4.5, §4.6 |
| R-26 | Disputa em duas etapas | Etapa 1: segunda leitura, até 1 hora. Etapa 2: dois de três membros da equipe, até 48 horas, só confirmar ou anular, com o motivo publicado. Sem voto por token. Pior caso: 55 horas | P1 §4.6 |
| R-27 | Indicação, quem indica | 20% da taxa que a casa recebeu das apostas vencedoras do indicado, por 90 dias | P1 §3.8 |
| R-28 | Indicação, indicado | Devolução da taxa dos primeiros 50 USDC, depois de 250 USDC apostados. Teto de 5 USDC | P1 §3.8 |
| R-29 | Destino da taxa | 25% para a tesouraria e 75% para a operação, até a operação se pagar | P2 §4.1 |
| R-30 | Teto global | Na rede principal: limite para a soma dos potes abertos; no limite, sem apostas novas até uma pergunta pagar. Começa baixo e sobe por degraus. Valor não fixado (L-19) | P4 §4.4 |
| R-31 | Pausa | Só bloqueia apostas novas. Resolução, pagamento e devolução nunca pausam. Não existe saque de emergência | P4 §4.6 |
| R-32 | Quem pode o quê | Abrir pergunta: duas pessoas. Confirmar ou anular: uma chave da equipe. Trocar o código: duas assinaturas de três, com espera pública. Mudar a taxa de pergunta aberta: ninguém | P4 §4.2, §4.3 |

R-31 e os detalhes de R-32 são proposta da revisão técnica, a fechar no plano técnico. O restante é decisão do
fundador.

## 6. Escopo por fase

A ordem vem de P4 §3.1 e §3.3: núcleo primeiro.

**6.1 MVP na devnet (fase 1, cerca de um mês).** O usuário aposta USDC de teste em perguntas reais dos cinco tipos,
acompanha a resolução, recebe sozinho e soma pontos. Os parceiros ganham a pergunta gratuita. Precisa estar pronto:

- O pote: aposta, registro por apostador, taxa, fechamento, pote de um lado só e o resultado "anulada".
- Os cinco leitores: o de preço, novo e construído primeiro, e os quatro reaproveitados do programa atual.
- Os dois serviços agendados, a janela de 6 horas com confirmar e anular, e o pagamento automático.
- A pontuação, com classificação pública.
- O site novo, na direção Ledger², com o aviso de fase de testes em toda tela.
- O Cloak como demonstração para o hackathon, em duas redes (P4 §5.2).

Ficam de fora: dinheiro real, SODAX e patrocínio pago.

**6.2 Antes da rede principal (o que abre a fase 2).**

- A indicação (F10) e o patrocínio pago, com pedido de pergunta e a opção "não divulgado" (F8).
- A segunda leitura da disputa (etapa 1 de F6).
- O teto global, a pausa, o plano de incidente e o quadro público de quem pode o quê.
- Os termos de uso, os avisos, o bloqueio por país como interruptor e o SODAX.
- Os três critérios, cumpridos por inteiro: duas auditorias com as falhas graves corrigidas, carteira com duas
  assinaturas de três e teto global gravado no programa (P4 §3.4). Se faltar um, a data anda.

Se esse bloco não estiver pronto quando o código for para a auditoria, o fundador escolhe entre mover a data e abrir
a rede principal sem ele (P4 §3.3).

**6.3 Fase 1.2.** Contestação por qualquer apostador da pergunta, com depósito, e a arbitragem interna. O leitor do
padrão novo de token (Token-2022), que destrava o tipo "tokens travados". O teto global revisto.

**6.4 Fase 2.** Saída antecipada, com a fórmula guardada em P1 §3.6. Esportes, com oráculo próprio. Teto por
pergunta. Aviso dos serviços por Telegram. Afiliados e taxa de construtor (P2 §4.8).

**6.5 Decidido, sem fase fixada.** Perguntas de menos de três dias, com fechamento abaixo de 24 horas mediante
segunda assinatura da equipe: entram "quando houver público e canal de distribuição" (P1 §3.5). Preço de token
pequeno, degraus 2 e 3 (P1 §4.3). Perguntas de mais de 90 dias (P1 §3.5). Fundo de prêmios, não antes do mês 10
(P2 §4.5).

**Tokens.** Os tokens A e B não fazem parte do MVP nem deste documento. Fora do escopo agora; ver a Parte 3.

## 7. O que não é objetivo

- Tokens de SIM e de NÃO, preço travado, livro de ofertas ou pool de liquidez (P1 §2.1).
- Vender a posição ou sair antes do fim, no MVP (P1 §3.6).
- Rendimento do dinheiro parado no pote (P1 §2.1).
- Botão público de resolver e botão de resgate (P1 §3.9, §4.4).
- Cadastro, email ou conferência de identidade (P1 §2.2).
- Voto por token para decidir resultado, em qualquer fase (P1 §4.6, P3 §1.2).
- A equipe inverter um resultado ou sacar dinheiro de usuário em emergência (P1 §4.5, P4 §4.6).
- Perguntas de opinião, geopolítica ou política, e perguntas decididas de graça por uma chave (P1 §4.3).
- Criação de pergunta pelo público: a equipe abre, o público sugere e o patrocinador pede (P1 §4.1).
- Pontuar por volume (P2 §3.5) e mídia paga (P2 §6.2).
- Prometer preço, retorno ou rendimento, do pote ou de qualquer token (P1 §2.4).

## 8. Momento de ativação

O plano não nomeia um momento de ativação (L-25). O que ele sustenta: a promessa central é receber sem pedir
("Acertou? O prêmio chega sozinho na sua carteira, em até 6 horas", P1 §4.7), e a medida principal não é o volume, e
sim a parcela das carteiras que aposta de novo em 30 dias (P2 §6.5).

## 9. O que faz a pessoa voltar

Só o que o plano sustenta:

- Cada pergunta resolvida vira uma publicação no X, com o número lido, a meta e o link (P2 §6.2).
- Os parceiros trazem perguntas novas e as mostram à própria comunidade (P2 §4.3).
- A indicação paga a quem indica durante 90 dias (R-27).
- Na devnet, a pontuação e a classificação pública (F12).

**Como se mede (P2 §5.6, §6.5):** carteiras que apostam de novo em 30 dias (menos de 10% é sinal ruim; de 20% a 35% é
o razoável) e potes que terminam de um lado só (mais de 40% é sinal ruim).

O plano não tem canal para avisar a pessoa de que uma pergunta resolveu ou de que o pagamento chegou (L-16).

## 10. Lógica de receita

- **Taxa:** R-01. Na média, 3,70% do volume, de 2,70% a 4,18% conforme a mistura de perguntas, que ninguém mediu
  (P2 §4.1).
- **Patrocínio:** os 30% de R-16. No primeiro ano fica perto de zero, porque os 30 primeiros parceiros não pagam
  (P2 §4.3).
- **Indicação é custo, não receita** (P2 §4.4).
- **Para o produto:** pergunta equilibrada rende mais que pergunta com favorito claro, e a de preço é a que tende ao
  equilíbrio (P2 §2.5, §4.1).

Projeções, ponto de equilíbrio e critério de parada: P2, capítulos 4 e 5.

## 11. Confiança e conformidade como requisito de produto

- **Entrada só com a carteira.** Sem cadastro, sem email e sem conferência de identidade (P1 §2.2). Para apostar, o
  produto não coleta dado pessoal (P2 §6.5).
- **Bloqueio por país, como interruptor.** Hoje não há bloqueio. O site precisa de uma chave de liga e desliga, para
  a resposta da avaliação jurídica valer no mesmo dia (P4 §7.5). Com ele ligado, quem já apostou continua recebendo
  (P4 §8).
- **Nenhum código de fora na página de aposta.** Cloak, SODAX e X ficam em páginas próprias (P4 §5.1).
- **O que a equipe faz fica público:** toda anulação e toda decisão de disputa, com o motivo; o quadro de quem pode o
  quê; os relatórios de auditoria (P1 §4.5, §4.6; P4 §3.4, §4.3).
- **Dado pessoal.** O plano aponta um ponto: o nome de usuário de quem sugere pelo X (P4 §5.3), que passa por
  `.claude/rules/privacy-audit.md` antes de ser construído.
- **Textos legais** (termos de uso, aviso de risco, política de privacidade) antes do dinheiro real; o conteúdo
  depende da avaliação jurídica (P4 §7.6; L-21).

**Avisos obrigatórios nas telas**

| Aviso | Onde | Texto | Fonte |
|---|---|---|---|
| Fase de testes | Toda tela e toda publicação, enquanto na devnet | "Estamos em fase de testes. Aqui se aposta com USDC de teste, que não vale dinheiro." | P1 §4.7 |
| Retorno é estimativa | Junto do retorno e antes da assinatura | "Retorno estimado agora: 3,10 por 1. Muda até o fechamento" | P1 §3.2, §4.7 |
| Dinheiro preso até o fim | Antes da assinatura | Texto não decidido. Não há saída; em pergunta de 90 dias, são até três meses | P1 §3.5, §3.6 |
| Taxa | Antes da assinatura | "A casa fica com 10% do que os vencedores ganham." | P1 §4.7 |
| Prazo do pagamento | Na pergunta em revisão, com relógio | "Pago sozinho, em até 6 horas". Com contestação, o prazo novo | P1 §4.5, §4.7 |
| Programa sem auditoria | Enquanto não houver relatório | "programa ainda sem auditoria" | P4 §4.1 |
| Patrocinador | Em toda pergunta patrocinada, inclusive a de parceiro | O aviso de R-19 | P1 §3.7, P2 §4.3 |
| Carteira sem SOL | Para quem chega pelo SODAX | Texto não decidido | P4 §5.3 |

**O que nunca se promete:** preço, retorno, rendimento ou recompra de token (P1 §2.4, P2 §4.7), e as expressões da
coluna "em vez de" da seção 12.

## 12. Tom da interface

**A regra do fundador (P1 §4.7):** frases "num sentido mais marketeiro e agradável de ler, sem ser mentira". Cada
frase descreve algo que o produto faz de fato.

**Frases decididas**

- "A resposta já está na rede. A gente só lê."
- "Aqui nenhum token vota para decidir quem ganhou."
- "Acertou? O prêmio chega sozinho na sua carteira, em até 6 horas."
- "Quem acerta divide o pote. Simples assim."
- "A equipe confere. O dado decide."
- "Cada pergunta mostra o número lido, a meta e o link. Confira você mesmo."
- "Entre com a carteira e aposte em USDC." Na devnet, só com a ressalva de fase de testes.
- "A casa fica com 10% do que os vencedores ganham."
- Para projetos: "Prometeu queimar? Abra a pergunta e deixe a rede provar."
- Do mascote: "Brot é pão em alemão. O Baked é o nosso pãozinho: resultado saído do forno da rede."

**Trocas decididas**

| Em vez de | Dizemos |
|---|---|
| "Sem oráculo" | "Resultado lido direto da rede"; nas perguntas de preço, "preço de um oráculo conferido na própria rede" |
| "Pago em minutos" | "Pago sozinho, em até 6 horas" |
| "Sem disputa" | "Disputa curta, em duas etapas, sem voto por token" |
| "Patrocinador anônimo" | "Patrocinador não divulgado", com o aviso de R-19 |
| "Ninguém controla" | "A equipe não escolhe o vencedor: só confirma ou anula", com a lista pública de quem pode o quê |
| "Ganhe 3 vezes" | "Retorno estimado agora: 3,10 por 1. Muda até o fechamento" |

**Vocabulário.** "Chance" e "retorno estimado", nunca "preço". "Apostar", nunca "comprar" ou "negociar": quem aposta
não compra a um preço, entra numa divisão (P1 §2.1, §3.2). "Pote". "Não divulgado".

**O que o protótipo acrescenta.** Em D e N o texto é curto e seco, e o mascote fala pouco:
`prototype-lab/shared/mock-data.js` o descreve como "quietly grumpy: short, dry, never salesy". Das falas dele, "It's
a read. Not a vote." continua verdadeira; "No oracle. Just me, reading." deixa de valer, porque as perguntas de preço
usam um oráculo.

**A conferir.** Esta seção saiu do plano e dos textos do protótipo, porque o `docs/product/DESIGN-DIRECTION.md`
estava em reescrita. Ela precisa ser conferida contra a versão nova dele. O idioma do site está em aberto (L-01).

## 13. O protótipo aprovado, tela a tela

D e N têm o mesmo conteúdo; a N acrescenta o alternador de tema. São duas telas, a página inicial (`#/`) e a pergunta
(`#/m/<id>/<lado>`). O fluxo clicável: filtrar ou buscar, abrir uma pergunta ou clicar em Yes ou No num card, digitar
um valor, ver a estimativa. "Connect wallet", "Sponsor a goal" e "Notify" só abrem uma faixa de aviso.

Veredito: **mantém**, **muda** (a forma fica, o conteúdo troca) ou **cortado**.

| # | Elemento | O que mostra hoje | Veredito | O que o plano decide no lugar |
|---|---|---|---|---|
| 1 | Faixa de status | "Solana Devnet · Design preview · Not audited" | Muda | Os avisos de fase de testes e de programa sem auditoria (seção 11) |
| 2 | Marca, no cabeçalho e no rodapé | "baked · KPI markets on Solana" | Muda | Brot Markets; o mascote Baked fica (P1 §1.1) |
| 3 | Busca | Perguntas, tokens e endereços | Mantém | O plano não trata |
| 4 | "How it works" | Três passos: patrocinar, cumprir, ler | Muda | Os passos do pote: apostar, fechar, ler, janela, pagar (P1 §1.2) |
| 5 | "Connect wallet" | Só um aviso | Mantém | É a única forma de entrar (P1 §2.2). Falta o estado conectado (L-02) |
| 6 | Alternador de tema (só na N) | Claro e escuro | Mantém | O plano não trata |
| 7 | Categorias | Trending, Burn, Renounce, Lock, Immutable, Stake | Muda | Os cinco tipos de R-13. "Renounce" e "Immutable" saem (R-14). "Lock" passa de tokens travados a liquidez travada na Meteora. Faltam preço e pool de staking |
| 8 | "Sponsor a goal" | Só um aviso | Muda | O pedido de pergunta (F8), fora do MVP da devnet |
| 9 | Carrossel "Trading now" | As cinco perguntas de maior volume, com preço do SIM e gráfico | Muda | Perguntas em destaque. O destaque passa a ter dono: parceiro e patrocinador (P1 §3.7). "Trading" sai |
| 10 | Caixa "Upcoming" | Perguntas que vão abrir, com orçamento e "Notify" | Cortado | Não há estado antes de "aberta" (P1 §3.1), nem orçamento de patrocinador, nem canal para notificar (L-16) |
| 11 | Caixa "Closing soon" | Menos dias até a data final | Muda | Passa a contar o fechamento das apostas (R-07) |
| 12 | Três princípios | "No oracle, no committee, no dispute window"; "Backed 1:1 in USDC"; "Guarded trading" | Muda | O primeiro perde "no oracle" e "no dispute window" (seção 12). O segundo sai: não há token com lastro. O terceiro vira R-07 e R-08 |
| 13 | Filtros de estado | Active, Closing soon, Resolved, Saved | Muda | Os cinco estados de P1 §3.1. "Saved" fica, sem lugar decidido para a lista (L-16) |
| 14 | Ordenação | Volume, Deadline, YES price | Muda | Tamanho do pote, fechamento e chance do SIM |
| 15 | Card da pergunta | Preço do SIM, minigráfico, botões "Yes 20¢" e "No 80¢", prova on-chain com barra, volume, dias, salvar | Muda | Chance e retorno estimado no lugar do preço; os botões levam à aposta naquele lado; "volume" vira o total do pote. A prova e a barra ficam |
| 16 | Card de pergunta resolvida | "Resolved YES · Redemption available" | Muda | "Em revisão", com relógio, e depois "paga". Sem resgate (R-24) |
| 17 | Estado vazio | "No markets here yet." e "Clear filters" | Mantém | |
| 18 | Pergunta: cabeçalho | Tipo, nome, título e a nota "Example market" | Mantém | A nota sai com dados reais |
| 19 | Painel "On-chain proof" | Valor lido, meta, barra, conta com link, prazo e "Resolution: Anyone, the moment the account says so" | Muda | Fica: sustenta "Confira você mesmo" (P1 §4.7). Quem resolve passa a ser o serviço da plataforma (R-22). Entra o fechamento |
| 20 | Gráfico "YES price" | Histórico do preço do SIM | Muda | Não há preço. O equivalente seria o histórico da chance, que o plano não pede (L-23) |
| 21 | Painel de ordem | "Buy YES", valor e "50.00 YES at 20¢ · pays $50 if YES" | Muda | Aposta num lado; estimativa por R-02, com a aposta já no pote; avisos antes da assinatura (F2) |
| 22 | Painel de ordem, pergunta resolvida | "Redemption" | Cortado | O pagamento é automático (R-24) |
| 23 | Faixa de aviso | Mensagens do sistema | Mantém | |
| 24 | Mascote nos poleiros | Pula entre pontos fixos e solta falas curtas | Mantém | As falas são revistas pela seção 12 |
| 25 | Navegação do laboratório | Troca entre as direções | Cortado | Não é parte do design |

**Dados do `mock-data.js` que D e N não mostram.** `activity`, `leaders`, `wallet` e `sponsors` servem a outras
direções do laboratório e não são telas aprovadas. "sold", `shares`, o preço médio de entrada e o `budget` do
patrocinador são do modelo antigo e não entram no modelo de dados. Carteira e classificação voltam como lacunas
(L-02, L-09).

## 14. Lacunas

O que o produto decidido pede e nem o plano nem o protótipo resolvem. Nenhuma tem resposta aqui. As de dinheiro ou
de regra pedem decisão do fundador; as de tela vão para o `DESIGN-DIRECTION.md` e para o plano técnico.

| # | O que o produto pede | O que falta |
|---|---|---|
| L-01 | Um idioma para o site | O protótipo está em inglês e as frases decididas, em português. Não há decisão. O site provisório de 5/10/2026 (`services/landing`) está em inglês, por escolha provisória de quem o construiu |
| L-02 | Carteira conectada e "minhas apostas" | A tela com cada aposta, o lado, o valor, o retorno estimado, o estado e o que já foi recebido |
| L-03 | A confirmação da aposta | Onde aparecem os avisos obrigatórios e o texto do aviso de dinheiro preso |
| L-04 | As telas dos estados | "Fechada", "em revisão", "paga" e "anulada". O nome do estado durante a disputa: P1 §3.1 não tem um para o pagamento pausado. Quem grava "anulada" fora da janela de 6 horas |
| L-05 | Pote vazio e pote de um lado só, ainda abertos | O que a tela mostra como chance e como retorno quando um lado tem zero |
| L-06 | Erros e esperas | Saldo insuficiente, carteira sem SOL, assinatura recusada, transação que falha, rede fora do ar, carregamento |
| L-07 | Limites da aposta | Valor mínimo. Se a mesma carteira pode apostar nos dois lados. Se o primeiro apostador de R-10 segue isento quando aposta de novo |
| L-08 | USDC de teste | Como a pessoa o consegue para apostar na devnet |
| L-09 | A pontuação | A fórmula, a tela de classificação e o que os pontos valem depois da devnet |
| L-10 | A indicação | Como o vínculo é criado, quando começam os 90 dias, onde se vê o saldo, e se o repasse sai do programa ou de uma rotina do serviço (P4 §3.3) |
| L-11 | O patrocinador | O pedido, o aceite, a recusa, o saque e o relatório. E o destino de uma aposta de patrocinador, que tem lado, no pote de um lado só e na anulação: R-12 fala só em "prêmio" |
| L-12 | O painel da equipe | Propor e aprovar pergunta, confirmar ou anular com motivo, acionar a contestação e pausar. O registro público das anulações |
| L-13 | O canal público de contestação | Qual é |
| L-14 | A disputa antes da fase 1.2 | Se a etapa 2 já vale na rede principal ou só com a arbitragem interna. O segundo oráculo não foi escolhido (P4 §5.3) |
| L-15 | O pagamento que não chegou | Como a pessoa é avisada do valor reservado e como recebe (P4 §4.5) |
| L-16 | Avisar e lembrar, sem cadastro | Não há canal para avisar de resolução, pagamento ou anulação, nem lugar para a lista "Saved" |
| L-17 | A página de sugestões pelo X | A fase em que entra, o desenho, o texto de orientação e a guarda do nome de usuário. A conta informada pelo fundador em 5/10/2026 é `x.com/brotmarkets`; o site provisório já aponta para ela e convida a sugerir por lá |
| L-18 | As páginas do Cloak e do SODAX | O desenho das duas e o aviso de carteira sem SOL |
| L-19 | O teto global | O primeiro valor e o que a tela diz quando ele é atingido |
| L-20 | O bloqueio por país | O que a tela mostra com o interruptor ligado |
| L-21 | Os textos legais | Termos de uso, aviso de risco e política de privacidade |
| L-22 | A pergunta de preço | O protótipo não tem esse tipo. Como aparecem o preço de agora e o alvo, e o que a tela diz sem preço fresco |
| L-23 | Gráfico e atividade | Se a pergunta mostra o histórico da chance e as apostas recentes. O protótipo sugere; o plano não pede |
| L-24 | O parceiro | Onde ficam o selo e o destaque, o formato do relatório e o que acontece com quem não publica |
| L-25 | O momento de ativação | O plano não define |

## 15. Riscos de produto

A tabela completa, com gravidade e resposta, está em P4, capítulo 8. Os que mudam o que se constrói:

- **Serviços parados:** um SIM verdadeiro vira NÃO. Reduzem: dois provedores, o alerta ao CTO e a anulação na janela
  (P1 §4.4).
- **Resultado empurrado** numa pergunta de pote grande: não há teto por pergunta no MVP, e resultado lido não tem
  correção (P4 §4.4).
- **Retorno que cai depois da aposta:** quem apostou vendo 3,10 pode receber 1,63 (P1 §3.2).
- **Dinheiro preso** por até 90 dias, sem saída (P1 §3.5).
- **Patrocinador que controla o resultado e aposta:** as travas de R-19 reduzem; o risco continua (P1 §3.7).
- **Taxa de 5% do pote em pote equilibrado**, o topo da faixa do setor (P1 §3.3).
- **Leitor de preço:** não foi verificado se a Pyth funciona na devnet (P4 §2.4).
- **Prazo:** o núcleo cabe em um mês; tudo, com duas auditorias, não cabe (P4 §3.2).
- **Demanda não demonstrada e regra brasileira** (P2 §2.6; P4, capítulo 7).
- **Protótipo defasado:** a seção 13 marca 15 de 25 elementos como "muda" e 3 como "cortado", e a seção 14 lista
  telas inteiras que não existem. Sem redesenho do conteúdo, o site herda o modelo antigo.

## 16. Leituras que este documento teve de escolher

1. **Indicação.** P1 §3.8 e P2 §4.4 a põem "desde o MVP". P4 §3.3, decidido depois, abre o beta sem ela e a põe antes
   da rede principal. Este documento segue P4.
2. **Cloak.** P4 §5.2 o descreve "já na devnet", com uma carteira nova entrando como patrocinador "não divulgado";
   P4 §3.3 deixa o módulo de patrocínio para depois do núcleo. Aqui, no MVP ele é demonstração para o hackathon; como
   produto, entra com F8.
3. **Disputa.** P1 §4.6 dá as duas etapas como decididas. P4 §3.3 põe a segunda leitura antes da rede principal, e
   P4 §3.1 põe a "arbitragem interna" na fase 1.2. Não está escrito se a etapa 2 existe antes da fase 1.2 (L-14).
4. **"MVP".** A IQR diz "MVP inteiro na devnet"; P1 usa a palavra também para o que P4 leva à rede principal. Aqui,
   "MVP" é a fase 1.
5. **Contrapartidas.** P1 §1.4 diz que nada falta decidir, mas P1 §3.7 marca como proposta as quantidades e os prazos
   das faixas pagas. Aqui só entra como regra o que vale para o parceiro gratuito (R-21).
