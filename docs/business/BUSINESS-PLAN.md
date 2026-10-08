# Brot Markets — Business Plan v0.0.3

**Versão:** 0.0.3, de 8 de outubro de 2026. Derivada do pitch de 7 de outubro de 2026, por ordem do fundador: "tomar
o pitch como verdade, e transformar o Business plan conforme o pitch". Onde o pitch e a v0.0.2 discordam, vale o
pitch; onde ele se cala, vale a v0.0.2, mais curta. Estado: rascunho para revisão do fundador.

**A versão anterior fica na pasta.** Os quatro arquivos da v0.0.2 (`BP-v0.0.2-parte-1-produto.md` a
`BP-v0.0.2-parte-4-construcao-e-risco.md`) continuam aqui, porque o resumo de produto, o plano técnico e os arquivos
das sprints citam os números das seções deles. Eles também guardam o detalhe que a v0.0.3 resume, sobretudo nos
tokens. O que mudou, seção por seção, e cada conta refeita estão na revisão de impacto,
[`_review/bp-impact-review-v0.0.3.md`](_review/bp-impact-review-v0.0.3.md).

O plano está em quatro partes. Este arquivo é o índice e o resumo. Cada número e cada regra abaixo está explicado,
com a fonte ou a conta, na parte indicada.

**Como ler as partes.** **Decisão** é o que o fundador decidiu em 4 ou 5/10/2026, com as palavras dele entre aspas.
**Decisão do pitch** é uma regra que está no deck de 7/10/2026, citada em inglês como está na tela. **Proposta,
aguardando decisão** é sugestão que o fundador ainda não aprovou. Números de fora trazem etiqueta: FATO (lido na
fonte), FATO SECUNDÁRIO (lido em quem citou a fonte) e INFERÊNCIA (conta ou conclusão nossa). Toda projeção é
inferência.

## As quatro partes

| Parte | Arquivo | O que responde |
|---|---|---|
| 1. Produto | [`BP-v0.0.3-parte-1-produto.md`](BP-v0.0.3-parte-1-produto.md) | O que é o Brot Markets, os três públicos, o pote, a taxa, quem abre um mercado e como ele se resolve |
| 2. Mercado e negócio | [`BP-v0.0.3-parte-2-mercado-e-negocio.md`](BP-v0.0.3-parte-2-mercado-e-negocio.md) | O tamanho do mercado, os concorrentes, as quatro receitas, as projeções e os quatro motores de crescimento |
| 3. Tokens | [`BP-v0.0.3-parte-3-tokens.md`](BP-v0.0.3-parte-3-tokens.md) | O que está decidido sobre os dois tokens, que o pitch não apresenta, e o conflito com a resposta pronta do roteiro |
| 4. Construção e risco | [`BP-v0.0.3-parte-4-construcao-e-risco.md`](BP-v0.0.3-parte-4-construcao-e-risco.md) | O que será construído e em que ordem, as regras de criação no programa, o que protege o dinheiro, a equipe, a regulação e os riscos |

## O plano em uma página

**O que é.** A frase da capa do pitch, em português: "Mercados de previsão que a rede resolve. O mercado de previsão
em que os projetos põem dinheiro atrás das próprias promessas, e a rede prova se eles cumpriram." Cada mercado é um
pote em USDC, a moeda digital que vale 1 dólar. Quem entra escolhe um lado, SIM ou NÃO, e quem acerta divide o pote.
A resposta está gravada numa conta da Solana, e o programa só a lê: não há voto, juiz nem modelo de linguagem.
Entra-se só com a carteira, sem cadastro.

**Para quem.** Três públicos: o projeto cripto que patrocina o mercado sobre a própria meta, e que é o cliente; quem
escolhe um lado; e quem abre mercados.

**Como funciona, no exemplo do slide.** Entram 600 USDC no SIM e 400 no NÃO, e dá SIM. A taxa do Brot é de 10% do
lado perdedor: 40 USDC. Sobram 960 para quem acertou, e cada 1 USDC posto no SIM recebe 1,60. Quem abriu o mercado
fica com 1% do pote, 10 USDC; ao pé da letra, esses 10 saem do pote, e cada 1 USDC no SIM recebe 1,583. De onde sai
esse 1% é a decisão mais importante em aberto (Parte 1, seção 3.4).

**Como o Brot ganha.** Quatro receitas (Parte 2, seção 4.1). A taxa do pote dá, na média, 3,70% do volume (de 2,70%
a 4,18%, conforme a mistura de mercados); dela, 25% vão para a tesouraria e 75% para a operação. A taxa de marketing:
o projeto patrocina a partir de 500 dólares, 90% viram prêmio e 10% ficam com o Brot, ou 50 dólares num patrocínio
de 500. A taxa de abertura: 0,02 SOL por mercado, cuja receita depende de quantos mercados serão abertos e do preço
do SOL, dois números que ninguém tem. E o 1% do pote de um lado só, pequeno e fora do modelo.

**As contas.** O custo de referência é de 5.500 dólares por mês. Com a taxa média de 3,70%, a empresa o paga com
**208.630 dólares por mês** de volume, e esse número não muda com o pitch ao pé da letra.

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Mês em que a operação se paga | Não chega | 9 | 2 |
| Ponto mais baixo do caixa | −116.565 | −27.674 | −9.705 |
| Caixa no mês 24 | −116.565 | 21.467 | 783.963 |

O patrocínio a 10%, e não a 30%, baixa o caixa do razoável no mês 24 de 27.767 para 21.467. O cenário ruim não se
paga com capital nenhum, e por isso há um critério de parada: aos 180 dias na rede principal, com volume mensal de
até 45 mil dólares, a empresa para ou muda de rumo.

**Os mercados.** Qualquer carteira abre um mercado, por 0,02 SOL, "inside the rules": só tipos que a rede responde.
No primeiro dia são cinco: preço de ativo grande pela Pyth (o serviço de preços assinados que o programa lê), queima
de tokens, liquidez travada na Meteora (uma das plataformas de troca da Solana), tamanho de pool de staking e stake de
validador. As entradas fecham quando faltam 5% da duração, e os mercados duram até 90
dias. Não há saída antecipada. O que o programa precisa conferir para "inside the rules" valer está em proposta
(Parte 4, seção 4.3).

**A resolução.** Dois serviços agendados, em provedores diferentes, acionam a leitura. Depois dela há uma janela de 6
horas em que a equipe só confirma ou anula. Mercado anulado devolve tudo, sem taxa. O pagamento sai sozinho.

**O crescimento.** Quatro motores, sem mídia paga: de 20 a 30 parceiros de lançamento com um mercado grátis; a
indicação, com 20% da taxa por 90 dias; o cartão de cada mercado para publicar no X; e quem abre mercados, que ganha
1% e divulga o próprio. Nenhum parceiro está fechado.

**Os tokens.** O pitch não apresenta token. O desenho decidido em 5/10/2026 fica guardado na Parte 3: o token A no
pump.fun, como canal de tração, e o token B, em espera até o equilíbrio. A resposta pronta do roteiro ("não dá
direito a receita nem a voto") contradiz o cofre e o voto do B.

**A construção.** O programa é escrito do zero; hoje tem um leitor de preço e nenhuma instrução, isto é, ainda não
aceita nenhuma operação. O roteiro do slide é "NOW Devnet, test tokens. LAUNCH Partner markets live. MAINNET After an
audit, a multisig and a cap.": agora, na rede de testes (devnet), com dinheiro de teste; no lançamento, os mercados
dos parceiros; na rede principal, com dinheiro real, só depois de uma auditoria externa, de uma carteira que exige
várias assinaturas (multisig) e de um teto para o total nos potes. Se um dos três critérios faltar, a data anda.

**A equipe.** Como no slide: Bernardo Nery, Head Baker · CEO; Lucas Galvão, Chief Oven Officer · COO and CLO; Ronaldo
Pereira, Chief Toasting Officer · CTO. O roteiro do próprio fundador chama os cargos de proposta, e falta o acordo
escrito do Bernardo e do Ronaldo para aparecerem.

## Os riscos que o plano não esconde

- **A demanda não foi demonstrada.** Nenhuma plataforma pesquisada tem mercado sobre queima ou trava de tokens. E a
  criação aberta não provou trazer volume: o PNP, aberto a qualquer pessoa, teve 206 transações em seis meses.
- **Quem abre pode empurrar o resultado.** Sem a equipe escolhendo as metas, um mercado sobre um token sem valor pode
  ser decidido de graça por quem o abriu. A defesa proposta é uma lista de contas aceitas e um teto por mercado.
- **A regra brasileira.** A Medida Provisória 1.394, de 25/9/2026, proíbe a aposta de quota fixa no país, inclusive
  por empresa do exterior. Se o pote é esse tipo de aposta é a primeira pergunta da avaliação jurídica. A tramitação
  da medida não foi conferida.
- **O prazo.** O programa novo não tem instrução, e o escopo cresceu com a criação aberta. A rede principal depende
  de duas auditorias cujo prazo ninguém conhece.
- **"No human in the loop".** A frase do slide contradiz a janela de 6 horas, a pausa e a anulação, que o plano
  mantém. A proposta é dizer "nenhuma pessoa escolhe o vencedor" (decisão 5).
- **A mistura de mercados e o 1%.** Se a maioria tiver favorito claro, ou se o 1% sair da taxa do Brot em todo o
  volume, a taxa média cai para 2,70% e o razoável só se paga no mês 12.
- **Poucas pessoas.** Um programa novo, com dinheiro de terceiros, numa equipe de três.

## Situação das decisões

As decisões de 4 e 5/10/2026 continuam valendo onde o pitch não as mudou. O pitch decidiu quem abre, a parte de quem
abriu, o patrocínio a 90% e 10%, o projeto como cliente e as palavras do produto (Parte 1, seção 5.1), e os quatro
motores de crescimento (Parte 2, seção 6.2). Ficaram dezenove decisões para o fundador. As de 1 a 14 têm a numeração
da revisão de impacto. A 15 junta as regras mínimas de criação, que a revisão propôs sem número, e as de 16 a 19 são
propostas que esta versão acrescentou. Na coluna "Onde", "P1 3.4" quer dizer Parte 1, seção 3.4.

| Nº | Decisão | Recomendação | Onde |
|---|---|---|---|
| 1 | De onde sai o 1% de quem abriu | Do prêmio de quem acertou, com teto | P1 3.4; P2 4.4; P4 4.6 |
| 2 | Para onde vão os 0,02 SOL | Para o Brot, sem devolução, descontado o aluguel | P1 4.1; P4 4.7 |
| 3 | Patrocínio acima de 500 e contrapartidas | 500 como piso, sem faixas fixas | P1 3.7; P2 4.3 |
| 4 | O pedido de pergunta com resposta em 14 dias | Sai | P1 3.7; P4 4.6 |
| 5 | "No human in the loop" e a janela | Manter a janela até a auditoria; dizer "no human picks the winner" | P1 4.5; P4 4.5 |
| 6 | A equipe abre mercados? Fica com o 1%? | Abre, sem o 1% | P1 4.1; P4 4.6 |
| 7 | Tipos em que dá para empurrar, abertos a todos | Lista de contas aceitas e teto por mercado; o preço abre a todos | P1 4.2; P4 4.3 |
| 8 | Token B: cofre e voto diante da resposta pronta | Confirmar a resposta; o B fica só com o desconto | P3 3 |
| 9 | "Referrals, day one" | O primeiro dia na rede principal | P1 3.9; P4 3.3 |
| 10 | O 1% no anulado, no pote de um lado só e sobre o prêmio | Nada nos três casos | P1 3.5; P4 4.6 |
| 11 | O nome do mascote | Baked na escrita; Cacetinho na fala | P1 4.6 |
| 12 | Cargos e o acordo do Bernardo e do Ronaldo | Pedir por escrito; até lá, sem sobrenome nas versões públicas | P4 5.1 |
| 13 | Texto livre no mercado | Não | P1 4.2; P4 4.3 |
| 14 | Quem abriu escolhendo lado | Permitir, com aviso automático | P1 4.2; P4 4.3 |
| 15 | As regras mínimas de criação | Só os cinco tipos; conta conferida na abertura; de 3 a 90 dias; taxas fixas | P1 3.6, 4.2; P4 4.3 |
| 16 | A abertura, a taxa em SOL e a parte de quem abriu no núcleo | Entram no núcleo, com as regras na instrução que abre | P4 3.3 |
| 17 | Um quarto item no "pronto" para a rede principal | Regras de criação, lista de contas e teto por mercado na versão auditada | P4 3.4 |
| 18 | Teto por mercado ou por carteira em todos os tipos | Sim, também no de preço, para ninguém ocupar sozinho o teto global | P4 4.4 |
| 19 | Onde fica o SOL das taxas de abertura | Conta da carteira de várias assinaturas; repõe o serviço; o resto vira USDC | P2 7; P4 4.7 |

Faltam também os valores e nomes que a v0.0.2 deixou: o primeiro valor do teto e quem assina a carteira.

O registro das perguntas e respostas do fundador, na ordem em que aconteceram, está em
[`ideacao-perguntas-e-respostas.md`](ideacao-perguntas-e-respostas.md).

## O que vem depois

1. **As respostas do fundador às dezenove decisões.** Oito delas (1, 2, 6, 7, 10, 13, 15 e 16) travam a Sprint 02,
   que escreve o núcleo do programa.
2. **A revisão do resumo de produto, do plano técnico e da Sprint 02** contra esta versão. Eles ainda descrevem a
   equipe abrindo as perguntas e o pedido do patrocinador.
3. **O acordo escrito do Bernardo e do Ronaldo** sobre nome e cargo, e o termo entre os sócios sobre o código.
4. **A avaliação jurídica**, pela lista da Parte 4, seção 6.2, com as seis perguntas novas.

## Histórico e bastidores

- O pitch que originou esta versão: os slides em `services/landing/public/pitch3/`, o roteiro e as respostas prontas
  em [`../../services/landing/pitch3-notes.md`](../../services/landing/pitch3-notes.md), e a frase de elevador em
  [`PITCH.md`](PITCH.md).
- [`_review/bp-impact-review-v0.0.3.md`](_review/bp-impact-review-v0.0.3.md): o que o pitch muda no plano, as contas
  refeitas, os riscos novos e as catorze primeiras decisões.
- [`_review/revisao-bp-v0.0.3.md`](_review/revisao-bp-v0.0.3.md): a revisão final desta versão, com os defeitos
  encontrados e as contas conferidas.
- `BP-v0.0.2-parte-1-produto.md` a `BP-v0.0.2-parte-4-construcao-e-risco.md`: a versão anterior, de 5/10/2026.
- [`_review/BUSINESS-PLAN-v0.0.1.md`](_review/BUSINESS-PLAN-v0.0.1.md): a primeira versão, com 16 capítulos.
- [`_review/user-review-v0.0.1.md`](_review/user-review-v0.0.1.md): a leitura do fundador sobre a v0.0.1.
- [`_review/bp-impact-review-v0.0.2.md`](_review/bp-impact-review-v0.0.2.md) e
  [`_review/correcoes-bp-v0.0.2-partes-1-e-2.md`](_review/correcoes-bp-v0.0.2-partes-1-e-2.md): a revisão de impacto
  da v0.0.2 e o modelo financeiro refeito com a taxa decidida.
- `_review/wave-2-*.md` e `_review/wave-3-coordinator.md`: os relatórios de revisão e as objeções.
- `knowledge-base/`: as pesquisas, com o índice de fontes em `knowledge-base/market/source-index.md`.
