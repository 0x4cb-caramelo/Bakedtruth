# Brot Markets — Business Plan v0.0.4

**Versão:** 0.0.4, de 8 de outubro de 2026. Derivada da v0.0.3 com as decisões que o fundador tomou em 8/10/2026.
Onde elas e a v0.0.3 discordam, valem as de 8/10; onde se calam, vale a v0.0.3. Estado: rascunho para revisão do
fundador.

**As versões anteriores ficam guardadas.** A v0.0.3, de 8/10/2026, está nas quatro partes
[`BP-v0.0.3-parte-1-produto.md`](BP-v0.0.3-parte-1-produto.md) a
[`BP-v0.0.3-parte-4-construcao-e-risco.md`](BP-v0.0.3-parte-4-construcao-e-risco.md), com a revisão de impacto em
[`_review/bp-impact-review-v0.0.3.md`](_review/bp-impact-review-v0.0.3.md). O arquivo único que o fundador enviou
(`BP-v0.0.3-completo.md`) é uma cópia montada dessas partes e fica fora do git. Os quatro arquivos da v0.0.2
(`BP-v0.0.2-parte-1-produto.md` a `BP-v0.0.2-parte-4-construcao-e-risco.md`) continuam na pasta, porque o resumo de
produto, o plano técnico e os arquivos das sprints citam as seções deles. O que mudou, item por item, e o que cada
mudança move nos outros documentos está na revisão de impacto,
[`_review/bp-impact-review-v0.0.4.md`](_review/bp-impact-review-v0.0.4.md).

O plano está em quatro partes. Este arquivo é o índice e o resumo. A numeração das seções é a mesma da v0.0.3, para
as citações continuarem certas.

**Como ler as partes.** **Decisão** é o que o fundador decidiu em 4 ou 5/10/2026. **Decisão do pitch** é uma regra do
deck de 7/10/2026. **Decisão, de 8/10/2026** é uma das respostas novas, com as palavras dele entre aspas. **Proposta,
aguardando decisão** é sugestão que o fundador ainda não aprovou. Números de fora trazem etiqueta: FATO (lido na
fonte), FATO SECUNDÁRIO (lido em quem citou a fonte) e INFERÊNCIA (conta ou conclusão nossa). Toda projeção é
inferência.

**As palavras.** Desde 8/10/2026 o produto é uma **campanha on-chain** ("On-Chain Campaign"). Quem entra numa campanha
é um **baker**; quem a abre é o **criador**; os lados são **SIM** e **NÃO**; o dinheiro fica no **pote**. A marca
continua Brot Markets. Para o nosso produto, os documentos não usam mais "mercado", "aposta" nem "escolher um lado".

**Acréscimo de 12/10/2026, sem nova versão: o sexto tipo.** O programa ganhou um sexto tipo de campanha, a graduação
de uma curva de lançamento da Meteora (DBC): "a curva do token T completa até a data D?". As escolhas M-1 a M-7 de
[`docs/technical/meteora-readers-plan.md`](../technical/meteora-readers-plan.md) vieram fixadas no pedido desse dia
(`session-log/2026-10-12-sexto-tipo-dbc-graduated.md`): só curvas cotadas em SOL, de 85 SOL para cima, com ao menos
10% do valor ainda faltando na abertura; o SIM pode ser comprado por quem pagar o resto da curva, e a página da
campanha diz isso; o tipo abre no devnet e fica fechado na rede principal até as auditorias cobrirem o leitor. A Parte
1 o descreve na seção 4.2, e a Parte 4 o conta nas seções 4.2 e 4.3. Como o resto da v0.0.4, espera a leitura do
fundador.

## As quatro partes

| Parte | Arquivo | O que responde |
|---|---|---|
| 1. Produto | [`BP-v0.0.4-parte-1-produto.md`](BP-v0.0.4-parte-1-produto.md) | O que é o Brot Markets, os três públicos, o pote em SOL, a taxa, quem abre uma campanha, o 1% do criador e como ela se resolve |
| 2. Mercado e negócio | [`BP-v0.0.4-parte-2-mercado-e-negocio.md`](BP-v0.0.4-parte-2-mercado-e-negocio.md) | O tamanho do setor, os concorrentes, as receitas, o equilíbrio com aberturas pagas, o risco do preço do SOL e os motores de crescimento |
| 3. Tokens | [`BP-v0.0.4-parte-3-tokens.md`](BP-v0.0.4-parte-3-tokens.md) | O que está decidido sobre os dois tokens, que não mudou em 8/10/2026 |
| 4. Construção e risco | [`BP-v0.0.4-parte-4-construcao-e-risco.md`](BP-v0.0.4-parte-4-construcao-e-risco.md) | O que será construído e com quê (Pinocchio, Bun, app Android), em que ordem, o que protege o dinheiro sem teto, a equipe, a regulação e os riscos |

## O plano em uma página

**O que é.** Campanhas on-chain que a rede resolve: projetos põem dinheiro atrás das próprias promessas, e a rede
prova se eles cumpriram. Cada campanha é um pote em SOL. Os bakers entram no SIM ou no NÃO, e quem acerta divide o
pote. A resposta está gravada numa conta da Solana, e o programa só a lê: não há voto, juiz nem modelo de linguagem.
Entra-se só com a carteira, sem cadastro.

**Uma moeda só.** **Decisão, de 8/10/2026:** "tudo em sol". Entradas, pote, prêmio, pagamentos, devoluções, indicação
e taxas são em SOL. Isso desfaz a decisão de 4/10/2026, que tinha escolhido o USDC. Para as contas, o plano usa o
preço da CoinGecko de 8/10/2026, 15:29 UTC: **US$ 109,27 por SOL** (FATO). Os exemplos seguem em dólares, para
facilitar a leitura.

**Para quem.** Três públicos: o projeto cripto que abre e patrocina a campanha sobre a própria meta, e que é o
cliente; os bakers; e quem abre campanhas.

**Abrir uma campanha.** **Decisão, de 8/10/2026:** custa **US$ 500, pagos em SOL** (4,58 SOL ao preço de referência).
Desses, 90% (US$ 450) viram prêmio no pote e 10% (US$ 50) ficam com o Brot. Abrir é, portanto, patrocinar com o
mínimo: a regra de abertura e a do patrocínio passam a ser a mesma. A equipe também abre campanhas, e os 20 a 30
parceiros de lançamento abrem de graça. Para cobrar os US$ 500, a proposta é o programa ler o preço SOL/USD da Pyth
na hora; a CoinGecko não pode ser lida pelo programa e fica para mostrar preço no site (Parte 1, seção 4.1).

**Como funciona, no exemplo do slide.** Entram 600 no SIM e 400 no NÃO, e dá SIM. A taxa do Brot é de 10% do lado
perdedor: 40. O criador recebe 1% do pote, 10, que sai do pote. Sobram 950 para quem acertou: cada 1 posto no SIM
recebe 1,583. Numa campanha paga, os US$ 450 de prêmio somam-se a isso: os vencedores dividem 1.400, ou 2,333 por 1.

**O 1% do criador.** **Decisão, de 8/10/2026:** sai do pote; só quando isso faria quem acertou receber menos do que
pôs, sai da taxa do Brot. Esse caso acontece quando quase todo o pote está no lado que ganhou (acima de 98,89% do pote,
sem prêmio), e não quando a disputa é apertada. Nesse caso, também decidido em 8/10/2026, sai do pote o que der
sem deixar ninguém abaixo do que pôs, e só a diferença sai da taxa (Parte 1, seção 3.4).

**Como o Brot ganha.** A taxa do pote dá, na média, 3,70% do volume (de 2,70% a 4,18%, conforme a mistura de
campanhas); dela, 25% vão para a tesouraria e 75% para a operação. Cada abertura paga deixa US$ 50 para a operação. O
patrocínio acima dos US$ 500 deixa 10%. E o 1% do pote de um lado só, pequeno e fora do modelo. O 1% do criador quase
não custa nada ao Brot, porque sai do pote.

**As contas.** O custo de referência é de US$ 5.500 por mês (50,3 SOL). Sem aberturas pagas, a empresa o paga com
**US$ 208.630 por mês** de volume. Cada abertura paga reduz esse número: com 30 por mês, ele cai para US$ 151.731; com
110 por mês, as aberturas pagam o custo sozinhas. Ninguém sabe quantas campanhas pagas serão abertas (Parte 2, seção
5.2). Os cenários de caixa são os da v0.0.3, em dólares, e não foram recalculados mês a mês:

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Mês em que a operação se paga | Não chega | 9 | 2 |
| Ponto mais baixo do caixa | −116.565 | −27.674 | −9.705 |
| Caixa no mês 24 | −116.565 | 21.467 | 783.963 |

O critério de parada continua: aos 180 dias na rede principal, com volume mensal de até US$ 45 mil, a empresa para ou
muda de rumo.

**As regras de abertura.** Só os seis tipos que a rede responde: preço de ativo grande pela Pyth, queima de tokens,
liquidez travada na Meteora, tamanho de pool de staking, stake de validador e, desde 12/10/2026, a graduação de uma
curva de lançamento da Meteora, fechada na rede principal até as auditorias. A conta lida é conferida na abertura. O
site monta a frase, sem texto livre. A campanha dura de 3 a 90 dias. As taxas são fixas. **Decisão, de 8/10/2026:** não
há lista de contas aprovadas ("nao lidaremos com tokenomics") e não há teto, nem global nem por campanha.

**A resolução.** Dois serviços agendados, em provedores diferentes, acionam a leitura. Depois dela há uma janela de 6
horas em que a equipe só confirma ou anula. Campanha anulada devolve tudo, sem taxa. O pagamento sai sozinho, em SOL,
direto para a carteira.

**O crescimento.** Os quatro motores do pitch continuam: de 20 a 30 parceiros com uma campanha grátis; a indicação,
com 20% da taxa por 90 dias; o cartão de cada campanha para publicar no X; e quem abre campanhas. Este último fica mais
fraco: com US$ 500 de entrada, quem abre tende a ser projeto, e não pessoa caçando a pergunta que divide. Nenhum
parceiro está fechado.

**Os tokens.** Nada mudou em 8/10/2026 (Parte 3).

**A construção.** **Decisões, de 8/10/2026:** o programa é escrito em **Pinocchio**, e não em Anchor; os serviços
rodam em **Bun**, e o site também, se passar no teste; há um **app Android**, com o mesmo backend e front próprio,
publicado na loja de dApps da Solana; **não há IA** no escopo; e **não há prazo** de hackathon. A rede principal abre
depois de uma auditoria externa e de uma carteira que exige várias assinaturas. O teto, terceiro critério do slide
("After an audit, a multisig and a cap"), saiu, e o slide precisa mudar.

**A equipe.** Como no slide: Bernardo Nery, Head Baker · CEO; Lucas Galvão, Chief Oven Officer · COO and CLO; Ronaldo
Pereira, Chief Toasting Officer · CTO. **Decisão, de 8/10/2026:** a avaliação jurídica é feita pelo advogado da equipe.
Falta o acordo escrito do Bernardo e do Ronaldo para aparecerem nas versões públicas.

## Os riscos que o plano não esconde

- **A demanda não foi demonstrada.** Nenhuma plataforma pesquisada tem campanhas sobre queima ou trava de tokens. A
  criação aberta não provou trazer volume, e agora custa US$ 500.
- **Sem teto, um erro no programa não tem limite de perda.** O teto existia para limitar o prejuízo enquanto o código é
  novo. Restam as duas auditorias, a carteira de várias assinaturas e a pausa.
- **Quem abre pode empurrar o resultado.** Sem lista de contas, quem cria um token sem valor, abre uma campanha sobre a
  queima dele e queima os próprios tokens decide o resultado. Sobram como defesa os US$ 500 e o aviso automático, e
  eles pesam pouco: se ele estiver sozinho no lado que forçou, os US$ 450 de prêmio voltam para ele, o custo líquido
  cai para cerca de US$ 50, e a manobra compensa com pouco mais de US$ 56 de terceiros do outro lado (INFERÊNCIA:
  `0,9 × X > 50`). Como a entrada dele no lado que ele mesmo força não corre risco, ele pode entrar grande e ficar com
  quase todo o prêmio, de modo que esse limite baixo vale quase sempre.
- **O preço do SOL.** A receita chega em SOL e os custos são em dólar. Se o SOL cair entre receber e pagar, a mesma
  receita paga menos. Uma campanha de 90 dias muda de valor em dólar enquanto está aberta.
- **A regra brasileira.** A Medida Provisória 1.394, de 25/9/2026, proíbe a "aposta de quota fixa" no país. Se o pote é
  esse tipo de "aposta" é a primeira pergunta da avaliação jurídica, agora a cargo do advogado da equipe. Trocar as
  palavras não muda a classificação: a Nota Técnica da Fazenda diz que ela "não decorre da nomenclatura".
- **A técnica nova.** O Pinocchio não confere as contas sozinho: cada checagem esquecida é uma falha. O Bun 1.4 é a
  primeira versão reescrita em Rust.
- **Poucas pessoas.** Um programa novo, com dinheiro de terceiros, numa equipe de três.

## Situação das decisões

**Decididas em 8/10/2026:** tudo em SOL; o preço de referência da CoinGecko (US$ 109,27); abertura por US$ 500 em SOL,
com 90% de prêmio e 10% para o Brot; a equipe abre; os parceiros abrem de graça; o 1% do criador sai do pote, e da taxa
do Brot só no caso extremo; nada de 1% na campanha anulada, no pote de um lado só e sobre o prêmio; a equipe não paga os
US$ 500 nem fica com o 1%, porque o Brot já cobra a taxa; os parceiros também não ficam com o 1%; no caso extremo, o 1%
sai do pote até onde der e só a diferença sai da taxa; os US$ 450 voltam a quem abriu na campanha anulada e no pote de
um lado só, e os US$ 50 seguem a causa; entrada mínima de 0,01 SOL; o preço para cobrar a abertura vem da Pyth, e a
CoinGecko só mostra preço no site; a proposta de arquitetura 0.4 aprovada, e com ela o site em Bun se passar no teste,
com o Node de reserva; sem teto global nem por campanha; sem lista de contas aprovadas; sem texto livre; as regras
mínimas de abertura (cinco tipos, seis desde 12/10/2026, conta conferida, 3 a 90 dias, taxas fixas); abertura, taxa e
1% no núcleo; o pedido de
pergunta sai e o patrocínio 90/10 fica; o vocabulário das campanhas; Pinocchio; Bun; app Android; sem IA; sem prazo;
advogado na equipe. Das dezenove decisões da v0.0.3, ficam resolvidas a 1, a 2, a 4, a 7, a 13, a 15, a 16 e a 18; a 6
(a equipe abre, de graça e sem o 1%); a 10, repetida como P-1, foi decidida; e a 19 virou a P-7.

**Esperam o fundador:**

| Nº | Decisão | Recomendação | Onde |
|---|---|---|---|
| P-6 | O teto da devolução da indicação | 0,05 SOL | P1 3.9 |
| P-7 | A tesouraria, com tudo em SOL | A plataforma recebe e paga em SOL; a empresa converte por mês o que precisa para os custos | P4 4.7 |
| P-8 | Cloak e SODAX com SOL | Conferir antes de usar | P4 2.2 |
| Slide | O roteiro da rede principal no deck | "MAINNET After an audit and a multisig." | P4 3.1 |
| Jurídico | A conclusão da avaliação jurídica | Por escrito, lida por um colega de fora, como a v0.0.3 recomendava | P4 5.1 |
| Nova | A exceção de 5/10/2026 (abrir a rede principal com um relatório de auditoria e um teto menor) perdeu o teto | Esperar os dois relatórios | P4 3.4 |
| R4 | Taxa reduzida nos três primeiros meses: qual valor e de qual taxa (revisão dos mentores de 8/10/2026) | Zerar só a taxa de abertura nas três primeiras campanhas de cada criador; mexer na taxa do pote mexe no equilíbrio | `_review/revisao-do-pitch-2026-10-08.md` |
| Nova | "nao lidaremos com tokenomics" vale também para os tokens A e B, ou só para a lista de contas? | Confirmar que foi só sobre a lista | P3 |
| 3, 5, 8, 9, 11, 12, 14, 17 | As da v0.0.3 que continuam | As recomendações da v0.0.3 | Cada parte |
| M-1 a M-7 | O sexto tipo, a graduação de uma curva da Meteora, e as suas regras, fixados no pedido de 12/10/2026 | Ler e confirmar, como as outras decisões deste rascunho | P1 4.2 |

Faltam ainda quem assina a carteira de várias assinaturas e o acordo escrito entre os sócios.

O registro das perguntas e respostas do fundador, na ordem em que aconteceram, está em
[`ideacao-perguntas-e-respostas.md`](ideacao-perguntas-e-respostas.md). As respostas de 8/10/2026 estão registradas em
`session-log/2026-10-08-decisoes-do-fundador-bp-v0.0.4.md`.

## O que vem depois

1. **O plano de implementação**, em inglês, a partir da proposta de arquitetura 0.4: o plano técnico, o roteiro de
   sprints e os arquivos de cada sprint. Depois, a resposta à P-7 (tesouraria), antes da Sprint 06.
2. **A revisão do resumo de produto, do plano técnico, da Sprint 02 e do documento de design** contra esta versão. A
   proposta de arquitetura, `docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md`, versão 0.4, é a base técnica. O roteiro
   de sprints precisa de um lugar para o app Android e para a tela de abertura.
3. **O deck e o site no ar.** O `/pitch` e o `/pitch2` ainda dizem USDC, 0,02 SOL, teto e "markets".
4. **O modelo financeiro mês a mês**, refeito com as aberturas pagas, quando o script da revisão da v0.0.3 estiver no
   repositório.

## Histórico e bastidores

- [`_review/bp-impact-review-v0.0.4.md`](_review/bp-impact-review-v0.0.4.md): o que as decisões de 8/10/2026 mudam no
  plano e nos outros documentos.
- `BP-v0.0.3-parte-1-produto.md` a `BP-v0.0.3-parte-4-construcao-e-risco.md`: a versão anterior, de 8/10/2026, feita a
  partir do pitch. O pitch que a originou, o `/pitch3`, está guardado com o roteiro em
  [`../../services/landing/history/pitch-3/`](../../services/landing/history/pitch-3/roteiro.md); o deck no ar, em
  `/pitch`, é o v4. A frase de elevador está em [`PITCH.md`](PITCH.md).
- [`_review/bp-impact-review-v0.0.3.md`](_review/bp-impact-review-v0.0.3.md) e
  [`_review/revisao-bp-v0.0.3.md`](_review/revisao-bp-v0.0.3.md): a revisão de impacto e a revisão final da v0.0.3.
- [`_review/revisao-do-pitch-2026-10-08.md`](_review/revisao-do-pitch-2026-10-08.md): a revisão do `/pitch3` com os
  mentores, com as decisões R1 a R6.
- `BP-v0.0.2-parte-1-produto.md` a `BP-v0.0.2-parte-4-construcao-e-risco.md`: a versão de 5/10/2026.
- [`_review/BUSINESS-PLAN-v0.0.1.md`](_review/BUSINESS-PLAN-v0.0.1.md): a primeira versão, com 16 capítulos.
- [`_review/user-review-v0.0.1.md`](_review/user-review-v0.0.1.md): a leitura do fundador sobre a v0.0.1.
- [`_review/bp-impact-review-v0.0.2.md`](_review/bp-impact-review-v0.0.2.md) e
  [`_review/correcoes-bp-v0.0.2-partes-1-e-2.md`](_review/correcoes-bp-v0.0.2-partes-1-e-2.md): a revisão de impacto
  da v0.0.2 e o modelo financeiro refeito com a taxa decidida.
- `_review/wave-2-*.md` e `_review/wave-3-coordinator.md`: os relatórios de revisão e as objeções.
- `knowledge-base/`: as pesquisas, com o índice de fontes em `knowledge-base/market/source-index.md`.
