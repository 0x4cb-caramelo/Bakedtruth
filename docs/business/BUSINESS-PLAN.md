# Brot Markets — Business Plan v0.0.2

**Versão:** 0.0.2, de 5 de outubro de 2026. Substitui a v0.0.1, que tinha cerca de 115 páginas e está guardada em
[`_review/BUSINESS-PLAN-v0.0.1.md`](_review/BUSINESS-PLAN-v0.0.1.md).

O plano está em quatro partes, de 20 a 30 páginas cada uma. Este arquivo é o índice e o resumo. Cada número e cada
decisão abaixo está explicado, com a fonte ou a conta, na parte indicada.

**Como ler as partes.** **Decisão** é o que o fundador decidiu, com as palavras dele entre aspas. Números de fora
trazem etiqueta: FATO (lido na fonte), FATO SECUNDÁRIO (lido em quem citou a fonte) e INFERÊNCIA (conta ou conclusão
nossa). Toda projeção financeira é inferência.

## As quatro partes

| Parte | Arquivo | O que responde |
|---|---|---|
| 1. Produto | [`BP-v0.0.2-parte-1-produto.md`](BP-v0.0.2-parte-1-produto.md) | O que é o Brot Markets, como funciona o pote, a taxa, as perguntas e a resolução |
| 2. Mercado e negócio | [`BP-v0.0.2-parte-2-mercado-e-negocio.md`](BP-v0.0.2-parte-2-mercado-e-negocio.md) | O tamanho do mercado, os concorrentes, como a empresa ganha dinheiro e as projeções |
| 3. Tokens | [`BP-v0.0.2-parte-3-tokens.md`](BP-v0.0.2-parte-3-tokens.md) | Os dois tokens, para que serve cada um, e quando saem |
| 4. Construção e risco | [`BP-v0.0.2-parte-4-construcao-e-risco.md`](BP-v0.0.2-parte-4-construcao-e-risco.md) | O que será construído e em que ordem, o que protege o dinheiro, e os riscos |

## O plano em uma página

**O que é.** Um mercado de previsão na Solana para o público de cripto. Cada pergunta tem um pote: as pessoas
apostam em USDC no SIM ou no NÃO, e quem acerta divide o pote. A resposta de toda pergunta está gravada na rede, e o
programa só a lê. Não há voto, juiz nem oráculo de opinião. Entra-se só com a carteira, sem cadastro.

**De onde vem o dinheiro do pote.** De três trilhas: as apostas, um patrocinador que acrescenta prêmio, e o token.

**Como a casa ganha.** Fica com 10% do lado perdedor. Num pote de 300 no SIM e 700 no NÃO, se der SIM a casa fica
com 70 e cada 100 apostados no SIM viram 310. Quem acerta nunca recebe menos do que apostou. Na média, isso dá
3,70% do volume apostado, e esse número depende de quantas perguntas são equilibradas, o que ninguém mediu. Da
taxa, 25% vão para a tesouraria e 75% para a operação, até a operação se pagar. O patrocínio tem faixas de 500,
1.500 e 5.000 dólares, com 70% para o pote e 30% para a plataforma.

**As contas.** O custo é de 5.500 dólares por mês. A empresa paga esse custo com 208.630 dólares apostados por mês.

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Mês em que a operação se paga | Não chega | 9 | 2 |
| Ponto mais baixo do caixa | −116.565 | −27.474 | −9.705 |
| Caixa no mês 24 | −116.565 | 27.767 | 798.462 |

O cenário ruim não se paga com capital nenhum. Por isso há um critério de parada: aos 180 dias na rede principal,
com volume mensal de até 45 mil dólares, a empresa para ou muda de rumo.

**As perguntas.** A equipe abre as perguntas; o público sugere pelo X; um patrocinador pode pedir uma. No primeiro
dia são cinco tipos: preço de ativo grande, queima de tokens, liquidez travada na Meteora, tamanho de pool de
staking e stake de validador. Ficam fora os tipos em que uma pessoa decide o resultado de graça. As apostas fecham
quando faltam 5% da duração, e as perguntas duram até 90 dias. Não há saída antecipada nesta versão.

**A resolução.** Dois serviços agendados, em provedores diferentes, acionam a leitura. Depois dela há uma janela
de 6 horas em que a equipe só pode confirmar ou anular. Pergunta anulada devolve tudo, sem taxa. O pagamento sai
sozinho.

**Os tokens.** O token A nasce no pump.fun e serve para trazer gente ao site; não dá direito a nada, e a taxa de
criador dele vai para o fundo de prêmios. O token B é desenhado pela empresa e só é lançado depois que a operação
se pagar: quem o trava ganha desconto na taxa, voto sobre quais perguntas abrir e parte num cofre que recebe 20% do
resultado. No cenário razoável, esse cofre receberia cerca de 900 dólares por mês. O plano não promete preço nem
rendimento para nenhum dos dois.

**A construção.** O programa é escrito de novo neste repositório, aproveitando os leitores do código atual. O MVP
começa na rede de testes, e a ida para a rede principal depende de três critérios: auditoria externa, carteira com
duas assinaturas de três e teto global para o total apostado. Se um deles faltar, a data anda.

## Os riscos que o plano não esconde

- **A demanda não foi demonstrada.** Nenhuma plataforma pesquisada tem mercado sobre queima ou trava de tokens.
- **A regra brasileira.** A Medida Provisória 1.394, de 25/9/2026, proíbe a aposta de quota fixa no país, inclusive
  por empresa do exterior. Se o pote é esse tipo de aposta é a primeira pergunta da avaliação jurídica. A
  tramitação da medida no Congresso não foi conferida.
- **O prazo.** O núcleo do pote cabe em um mês de trabalho. Construir tudo e concluir duas auditorias no mesmo mês
  não cabe.
- **Poucas pessoas.** Um programa novo, com dinheiro de terceiros, numa equipe de três.
- **A mistura de perguntas.** Se a maioria tiver favorito claro, a taxa média cai para 2,70% e o cenário razoável
  só se paga no mês 12.

## Situação das decisões

Em 5 de outubro de 2026 o fundador respondeu a todas as propostas das quatro partes. Não há proposta em aberto.
Faltam valores e nomes: o primeiro valor do teto global e quem assina a carteira.

O registro de todas as perguntas e respostas, na ordem em que aconteceram, está em
[`ideacao-perguntas-e-respostas.md`](ideacao-perguntas-e-respostas.md). É a fonte da verdade do produto.

## O que vem depois

1. A avaliação jurídica, pela lista da Parte 4, seção 7.6.
2. A apresentação resumida do plano, em dez seções.
3. O documento de design reescrito para a direção aprovada, o resumo de produto, o plano técnico e o roteiro de
   etapas. Só então, a construção.

## Histórico e bastidores

- [`_review/BUSINESS-PLAN-v0.0.1.md`](_review/BUSINESS-PLAN-v0.0.1.md): a primeira versão, com 16 capítulos.
- [`_review/user-review-v0.0.1.md`](_review/user-review-v0.0.1.md): a leitura do fundador sobre a v0.0.1.
- [`_review/bp-impact-review-v0.0.2.md`](_review/bp-impact-review-v0.0.2.md): a revisão de impacto e a simulação
  das formas de taxa.
- [`_review/correcoes-bp-v0.0.2-partes-1-e-2.md`](_review/correcoes-bp-v0.0.2-partes-1-e-2.md): o modelo financeiro
  refeito com a taxa decidida.
- `_review/wave-2-*.md` e `_review/wave-3-coordinator.md`: os relatórios de revisão e as objeções.
- `knowledge-base/`: as pesquisas, com o índice de fontes em `knowledge-base/market/source-index.md`.
