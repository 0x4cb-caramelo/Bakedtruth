<!-- Cópia do arquivo que o fundador enviou em 8/10/2026 (SHA-256 da original: da89615c1d74406229fe5b10f080b51f3b489af094dee174ccb23b1473ce358b). Única mudança: os links para arquivos que não existem neste repositório viraram texto. -->
<!-- Gerado em 8/10/2026 juntando BUSINESS-PLAN.md e as quatro partes BP-v0.0.3-parte-*.md, nesta ordem. As partes continuam sendo a fonte: se uma delas mudar, gere de novo. -->

# Brot Markets — Business Plan v0.0.3

**Versão:** 0.0.3, de 8 de outubro de 2026. Derivada do pitch de 7 de outubro de 2026, por ordem do fundador: "tomar
o pitch como verdade, e transformar o Business plan conforme o pitch". Onde o pitch e a v0.0.2 discordam, vale o
pitch; onde ele se cala, vale a v0.0.2, mais curta. Estado: rascunho para revisão do fundador.

**A versão anterior fica na pasta.** Os quatro arquivos da v0.0.2 (`BP-v0.0.2-parte-1-produto.md` a
`BP-v0.0.2-parte-4-construcao-e-risco.md`) continuam aqui, porque o resumo de produto, o plano técnico e os arquivos
das sprints citam os números das seções deles. Eles também guardam o detalhe que a v0.0.3 resume, sobretudo nos
tokens. O que mudou, seção por seção, e cada conta refeita estão na revisão de impacto,
`_review/bp-impact-review-v0.0.3.md`.

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
| 1. Produto | `BP-v0.0.3-parte-1-produto.md` | O que é o Brot Markets, os três públicos, o pote, a taxa, quem abre um mercado e como ele se resolve |
| 2. Mercado e negócio | `BP-v0.0.3-parte-2-mercado-e-negocio.md` | O tamanho do mercado, os concorrentes, as quatro receitas, as projeções e os quatro motores de crescimento |
| 3. Tokens | `BP-v0.0.3-parte-3-tokens.md` | O que está decidido sobre os dois tokens, que o pitch não apresenta, e o conflito com a resposta pronta do roteiro |
| 4. Construção e risco | `BP-v0.0.3-parte-4-construcao-e-risco.md` | O que será construído e em que ordem, as regras de criação no programa, o que protege o dinheiro, a equipe, a regulação e os riscos |

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
`ideacao-perguntas-e-respostas.md`.

## O que vem depois

1. **As respostas do fundador às dezenove decisões.** Oito delas (1, 2, 6, 7, 10, 13, 15 e 16) travam a Sprint 02,
   que escreve o núcleo do programa.
2. **A revisão do resumo de produto, do plano técnico e da Sprint 02** contra esta versão. Eles ainda descrevem a
   equipe abrindo as perguntas e o pedido do patrocinador.
3. **O acordo escrito do Bernardo e do Ronaldo** sobre nome e cargo, e o termo entre os sócios sobre o código.
4. **A avaliação jurídica**, pela lista da Parte 4, seção 6.2, com as seis perguntas novas.

## Histórico e bastidores

- O pitch que originou esta versão: os slides em `services/landing/public/pitch3/`, o roteiro e as respostas prontas
  em `../../services/landing/pitch3-notes.md`, e a frase de elevador em
  `PITCH.md`.
- `_review/bp-impact-review-v0.0.3.md`: o que o pitch muda no plano, as contas
  refeitas, os riscos novos e as catorze primeiras decisões.
- `_review/revisao-bp-v0.0.3.md`: a revisão final desta versão, com os defeitos
  encontrados e as contas conferidas.
- `BP-v0.0.2-parte-1-produto.md` a `BP-v0.0.2-parte-4-construcao-e-risco.md`: a versão anterior, de 5/10/2026.
- `_review/BUSINESS-PLAN-v0.0.1.md`: a primeira versão, com 16 capítulos.
- `_review/user-review-v0.0.1.md`: a leitura do fundador sobre a v0.0.1.
- `_review/bp-impact-review-v0.0.2.md` e
  `_review/correcoes-bp-v0.0.2-partes-1-e-2.md`: a revisão de impacto
  da v0.0.2 e o modelo financeiro refeito com a taxa decidida.
- `_review/wave-2-*.md` e `_review/wave-3-coordinator.md`: os relatórios de revisão e as objeções.
- `knowledge-base/`: as pesquisas, com o índice de fontes em `knowledge-base/market/source-index.md`.


---

# Brot Markets — Business Plan v0.0.3 — Parte 1: Produto

**Data:** 8 de outubro de 2026.
**Estado:** rascunho para revisão do fundador. Esta versão foi derivada do pitch de 7 de outubro de 2026, por ordem
dele: "tomar o pitch como verdade, e transformar o Business plan conforme o pitch". Onde o pitch e a v0.0.2
discordam, vale o pitch. Onde o pitch se cala, vale a v0.0.2, mais curta. Substitui a Parte 1 da v0.0.2, que fica na
pasta como versão anterior. As Partes 2 (mercado e negócio), 3 (tokens) e 4 (construção e risco) vêm depois.

**Como ler.** Cada regra traz uma de três marcas.

- **Decisão** é o que o fundador decidiu em 4 ou 5 de outubro de 2026, com as palavras dele entre aspas quando
  ajudam.
- **Decisão do pitch** é uma regra que está no deck de 7 de outubro de 2026. Ela vem citada em inglês, como está na
  tela.
- **Proposta, aguardando decisão** é o que este documento sugere e o fundador ainda não aprovou.

Números que vêm de fora trazem etiqueta: FATO (lido na fonte), FATO SECUNDÁRIO (lido em quem citou a fonte) e
INFERÊNCIA (conta ou conclusão nossa). "Pitch" são três coisas: a tela (os dez slides), a fala (o roteiro do
fundador e as respostas prontas) e a frase de elevador que ele aprovou. Quando o texto aponta para o plano anterior,
escreve "v0.0.2, P1 §3.7": Parte 1, seção 3.7.

Cinco termos aparecem no texto inteiro. **USDC** é a moeda digital que vale 1 dólar. **SOL** é a moeda da rede
Solana. **Devnet** é a rede de testes da Solana, em que o dinheiro não tem valor. **MVP** é a primeira versão do
produto. **Programa** é o código que roda na Solana e guarda o dinheiro.

**O que mudou desde a v0.0.2.**

1. O projeto que patrocina passa a ser o cliente e vem primeiro. São três públicos: o projeto, quem escolhe um lado
   e quem abre mercados.
2. Qualquer carteira abre um mercado, por 0,02 SOL, dentro das regras. Antes só a equipe abria.
3. Quem abriu o mercado fica com 1% do pote. De onde sai esse 1% ainda não está decidido (seção 3.4).
4. No patrocínio, 90% viram prêmio e 10% são taxa de marketing. Eram 70% e 30%. A tela diz "a partir de 500
   dólares"; os valores de 1.500 e 5.000 deixam de ser regra.
5. A página de sugestões pelo X perde a função: quem tem uma ideia abre o mercado. O pedido de pergunta, com
   resposta da equipe em 14 dias, também perde, e a proposta é que saia (decisão 4, seção 3.7).
6. A lista de tipos deixa de ser "o que a equipe pode abrir" e vira "as regras": o que o programa aceita de
   qualquer pessoa.
7. O texto de produto tem duas trilhas de dinheiro, e não três: as entradas e o patrocínio. E duas moedas: USDC no
   pote, SOL só na taxa de abertura.
8. A janela de 6 horas e a disputa continuam. O plano registra o conflito delas com a frase "No human in the loop"
   (seção 4.5).
9. O texto de produto usa "mercado", "entrar" e "escolher um lado". Entram a frase de elevador, a frase da capa e o
   lema "Proof > Promises".
10. Não mudaram: a taxa de 10% do lado perdedor, o pote de um lado só, o mercado anulado, a regra de fechamento, a
    indicação, o pagamento automático, os cinco tipos e a forma de resolver.

## 1. Resumo

### 1.1 O que é

O Brot Markets é um mercado de previsão: um lugar em que pessoas põem dinheiro no resultado de uma pergunta sobre
o futuro. Ele roda na Solana. "Brot" é pão em alemão, e o mascote é um pãozinho. A frase da capa do pitch resume o
produto. Em português: **"Mercados de previsão que a rede resolve. O mercado de previsão em que os projetos põem
dinheiro atrás das próprias promessas, e a rede prova se eles cumpriram."**

Quatro ideias definem o produto.

- **É um pote.** Cada mercado tem um cofre em que entra o dinheiro de quem escolheu SIM e de quem escolheu NÃO. No
  fim, quem acertou divide o pote, descontada a taxa.
- **A rede responde.** O produto só aceita mercados cuja resposta fica gravada numa conta da Solana. O programa lê
  essa conta e grava o resultado. Ninguém vota e ninguém informa nada.
- **O projeto é cliente.** Um projeto que prometeu algo que a rede consegue medir, como queimar tokens, patrocina o
  mercado sobre a própria promessa. A comunidade dele escolhe um lado, e a promessa vira campanha.
- **Qualquer um abre.** Qualquer carteira abre um mercado, pagando 0,02 SOL, desde que ele seja de um tipo que o
  programa sabe ler.

### 1.2 Como funciona, em um exemplo

O exemplo é o do slide de receita. Alguém abre o mercado "O token T queima 100 milhões de tokens até 30 de
novembro?".

1. **Entradas.** Entram 600 USDC no SIM e 400 no NÃO. O pote é de 1.000. A tela mostra a "chance" de cada lado, que
   é a fatia do pote: SIM 60%, NÃO 40%.
2. **Fechamento.** As entradas param antes do fim, para ninguém entrar já sabendo o resultado.
3. **Resolução.** Um serviço da plataforma manda o programa ler a conta do token. Se a queima aconteceu dentro do
   prazo, o resultado é SIM. Se o prazo acabou sem ela, é NÃO.
4. **Janela de 6 horas.** A equipe pode conferir a leitura. Ela só confirma ou anula; nunca troca o vencedor. Se
   ninguém conferir, a janela acaba sozinha.
5. **Pagamento.** O dinheiro vai direto para a carteira de quem acertou, sem botão de resgate.

A queima aconteceu, e o SIM ganhou. O lado perdedor tem 400. A taxa do Brot é de 10% disso: **40 USDC**. Sobram
**960** para quem acertou, e cada 1 USDC posto no SIM recebe 960 ÷ 600 = 1,60. É a conta do slide.

Falta uma parcela, que está no slide de criadores: quem abriu o mercado fica com 1% do pote, 10 USDC. Ao pé da
letra, esses 10 saem do pote: quem acertou recebe 950, e não 960, e cada 1 USDC recebe 1,583 (seção 3.4).

### 1.3 O que está decidido

- O pote é em USDC. O produto começa na devnet, com dinheiro de teste.
- A taxa do Brot é de 10% do lado perdedor. Da taxa, 25% vão para a tesouraria e 75% para a operação, até as
  contas equilibrarem (Parte 2, seção 4.2).
- Qualquer carteira abre um mercado por 0,02 SOL, dentro das regras, e quem abriu fica com 1% do pote.
- O patrocínio começa em 500 dólares: 90% viram prêmio e 10% são taxa de marketing. De 20 a 30 projetos parceiros
  ganham um mercado grátis no lançamento.
- Não há saída antecipada no MVP: quem entrou fica até o fim.
- As entradas fecham por uma regra só, e os mercados duram até 90 dias.
- Pote de um lado só devolve as entradas: a primeira carteira não paga taxa e as demais pagam 1%. Mercado anulado
  devolve tudo, sem taxa.
- O site abre com cinco tipos de mercado. O que uma única chave decide de graça fica fora.
- Dois serviços agendados cuidam da resolução. Depois dela vêm a janela de 6 horas e o pagamento automático.
- A indicação paga 20% da taxa por 90 dias a quem indica, e o indicado recebe de volta a taxa dos primeiros 50 USDC,
  com teto de 5 USDC.

### 1.4 O que falta decidir

O pitch trouxe regras novas e deixou perguntas que só o fundador responde. As que tocam o produto são treze, e a
seção 5 traz a lista com a recomendação de cada uma. As quatro maiores:

- **De onde sai o 1% de quem abriu o mercado** (seção 3.4). Do pote, do prêmio de quem acertou ou da taxa do Brot.
- **Se a janela de 6 horas fica**, diante de "No human in the loop" (seção 4.5).
- **Quais tipos de mercado abrem a qualquer pessoa desde o primeiro dia** (seção 4.2). Em alguns deles dá para
  empurrar o resultado.
- **O que o patrocinador recebe pelos 10%**, e se existem valores acima de 500 dólares com nome próprio (seção 3.7).

## 2. O que é e para quem

### 2.1 Um mercado de previsão em que o projeto é cliente

Pote é o cofre de um mercado. Todas as entradas vão para ele e, no fim, quem acertou divide o que sobrou depois da
taxa. O prêmio de quem acerta é o dinheiro de quem errou. O formato dispensa duas coisas de que os líderes do setor
precisam: alguém vendendo a um preço e profissionais oferecendo liquidez o tempo todo.

Todo mercado de previsão precisa de alguém, ou de alguma coisa, que diga qual foi o resultado. O slide do problema
diz onde o setor falha: "Someone always stands between the event and your payout", isto é, sempre há alguém entre o
fato e o pagamento. Na Polymarket, a maior plataforma do setor em blockchain, detentores de um token votam quando o
resultado é contestado, e o processo leva de 4 a 6 dias (FATO, documentação da Polymarket, 3/out/2026). No World,
que funciona dentro da carteira Phantom, uma chave da empresa grava o resultado (FATO SECUNDÁRIO, Chainstack Labs,
11/set/2026). No PNP, dois modelos de linguagem decidem (FATO, documentação do PNP, out/2026). Em março de 2025, um
mercado de 7 milhões de dólares na Polymarket foi resolvido como SIM sem o fato ter ocorrido (FATO SECUNDÁRIO,
CoinDesk e outros, mar/2025).

**Decisão do pitch.** "Brot only lists markets the chain can answer. If the answer isn't stored in a Solana
account, the market doesn't open." O Brot só aceita mercados que a rede consegue responder. É a mesma escolha que o
fundador fez em 4/10/2026: "eu quero trabalhar com oráculo, mas um que possa resolver onchain".

O que o pitch acrescenta é o lugar do projeto. A frase de elevador, aprovada pelo fundador em 7/10/2026, apresenta
o Brot como "a prediction market built as a growth engine for on-chain projects": um mercado de previsão construído
como motor de crescimento para projetos que vivem na blockchain. Na fala: "o mercado trata projeto cripto como
assunto. A gente trata como cliente." A regra por trás dessa frase é o patrocínio (seção 3.7). A frase não cria
regra nova.

Por decisão do fundador, o produto **não** tem tokens de SIM e de NÃO (a entrada é um registro em nome da carteira,
e não um token que circula), preço travado, rendimento do pote nem saída antecipada no MVP (seção 3.10).

### 2.2 Três públicos

**O projeto que patrocina.** É o cliente. Um projeto anuncia uma meta que a rede consegue medir, como queimar 100
milhões de tokens até uma data, e põe dinheiro no mercado sobre essa meta. O fundador já tinha visto isso em
4/10/2026: "sendo em oráculo on chain, e possibilitando você abrir a questão de algo sobre si mesmo, você acaba
criando uma forma de marketing". Na v0.0.2 esse era o "segundo público". No pitch ele vem primeiro.

**Quem escolhe um lado.** É quem já usa carteira de criptomoedas. **Decisão.** "queremos pessoal da web3", com
acesso "100% onchain da solana, via wallet, sem kyc". A pessoa entra com a carteira e não passa pela conferência de
identidade com documento, que é o que a sigla em inglês KYC nomeia. Não há bloqueio por país por enquanto; o assunto
está na Parte 4, seção 6.

**Quem abre mercados.** É o público novo. **Decisão do pitch.** "Anyone can open a market, pump.fun style." A
pessoa escolhe um tipo de mercado, paga 0,02 SOL e fica com 1% do pote. O pitch supõe que ela procure a pergunta
que divide opiniões e divulgue o próprio mercado: "Creators hunt for the questions that split the timeline, and
promote their own markets." É hipótese, e a evidência que existe aponta para o outro lado: o PNP tem criação
aberta, dá ao criador 30% da taxa e registrou 206 transações em seis meses (FATO, leitura da rede, 4/out/2026). A
Parte 2, seções 2.5 e 3.2, trata disso.

A comparação com o pump.fun, a plataforma de Solana em que qualquer pessoa lança um token em minutos, é uma imagem:
quanto custa criar um token lá não está registrado no nosso material.

O tamanho desse público, na fonte: o pump.fun somava 80 milhões de carteiras e mais de 214 bilhões de dólares
negociados desde a criação, com média de cerca de 347 milhões por dia (FATO SECUNDÁRIO, The Block, jun/2026). A
mesma fonte mostra a queda de 2026: a receita diária do pump.fun era de 800 mil dólares, contra 4,8 milhões seis
meses antes. Carteira não é pessoa, e os 80 milhões são o total desde a criação, e não gente ativa hoje. Se esse
público quer entrar em mercados sobre fatos lidos da rede é hipótese (Parte 2, seção 2.5).

### 2.3 O que existe hoje

Existem dois programas no repositório. O antigo segue outro modelo, em que um patrocinador vende o SIM com
desconto. Ele tem 1.717 linhas e 138 testes (FATO, repositório, 5/out/2026) e está congelado. **Decisão.** O
programa do Brot é escrito do zero, "olhando pro código dele para reaproveitar os trechos e pedaços que nos
interessam". O que se aproveita são os leitores, o desenho do cofre e o método de teste.

O programa novo tem, hoje, um leitor de preço e nenhuma instrução. Leitor é o pedaço do programa que abre uma conta
da Solana, lê um número e responde sim ou não. Instrução é cada operação que o programa aceita, como abrir um
mercado ou registrar uma entrada. Em outras palavras: nada do que este documento descreve funciona ainda. As duas
primeiras etapas de construção estão fechadas, e a terceira é a que escreve o pote (Parte 4, seção 2.1).

| | Programa antigo, congelado | Brot Markets |
|---|---|---|
| Quem põe o dinheiro primeiro | O patrocinador, com um orçamento | Quem escolhe um lado |
| Posição do usuário | Tokens de SIM e de NÃO, a preço fixo | Um registro por carteira, sem token e sem preço |
| Quem abre | O patrocinador | Qualquer carteira, dentro das regras |
| Receita | Nenhuma no código | Taxa de 10% do lado perdedor, taxa de marketing e taxa de abertura |

**Decisão.** "vamos montar inteiramente na devnet inicialmente". Tudo o que este documento descreve acontece
primeiro com dinheiro de teste. A ida à rede principal, com dinheiro real, tem três condições, que o pitch repete:
"After an audit, a multisig and a cap", isto é, depois de uma auditoria externa, de uma carteira que só assina com
a aprovação de várias pessoas e de um teto para o total nos potes (Parte 4, seção 4.1).

## 3. O produto

### 3.1 O pote, as duas moedas e os cinco estados

**Decisão.** Cada mercado tem o seu pote. O dinheiro chega a ele por duas trilhas.

- **As entradas.** Qualquer carteira põe um valor no lado SIM ou no lado NÃO, quantas vezes quiser. Entrada é o
  valor que uma carteira põe num lado; fica registrado em nome dela. É a trilha principal: sem ela não há pote.
- **O patrocínio.** Um projeto paga para pôr um prêmio no mercado sobre a própria meta (seção 3.7).

A v0.0.2 trazia uma terceira trilha, a do token. O pitch não apresenta token, e ela sai do texto de produto. O que
sobra dela está na Parte 3.

O produto passa a ter duas moedas, cada uma num lugar.

- **USDC no pote. Decisão.** "A moeda vai ser usdc, vamos abandonar a ideia de sol." Entrar com 100 USDC é entrar
  com 100 dólares. Na devnet é USDC de teste.
- **SOL na taxa de abertura. Decisão do pitch.** "0.02 SOL to open a market." É o único ponto em que o SOL volta ao
  produto. A consequência é prática: a plataforma passa a receber e guardar uma segunda moeda, cujo preço em dólares
  oscila (Parte 4, seção 4.7).

O caminho de um mercado tem cinco estados:

| Estado | O que acontece | Seção |
|---|---|---|
| Aberto | Recebe entradas nos dois lados | 3.2 |
| Fechado | As entradas param; o mercado espera o fato ou a data final | 3.6 |
| Em revisão | O programa leu a rede e gravou SIM ou NÃO; a equipe tem 6 horas para confirmar ou anular | 4.5 |
| Pago | O dinheiro foi enviado às carteiras de quem acertou | 3.10 |
| Anulado | Não pôde ser decidido: todos recebem de volta o que puseram | 3.5 |

### 3.2 A conta do pote

A conta é uma divisão. Soma-se tudo o que entrou, tira-se a taxa, e o que sobra é repartido entre quem acertou, na
proporção do que cada um pôs. A taxa do Brot é de 10% do lado perdedor (seção 3.3), e por isso depende de qual lado
ganha. O exemplo-base é o mercado de preço do slide de solução: "O SOL toca 300 dólares até 31 de dezembro?", com
300 USDC no SIM e 700 no NÃO. A tabela ainda não inclui a parte de quem abriu o mercado, que a seção 3.4 soma.

| | Se der SIM | Se der NÃO |
|---|---|---|
| Total do lado que ganhou | 300 USDC | 700 USDC |
| Chance mostrada na tela (fatia do pote) | 30% | 70% |
| Total do lado que perdeu | 700 | 300 |
| Taxa: 10% do lado que perdeu | 70 | 30 |
| Sobra para quem acertou | 930 | 970 |
| Cada 1 USDC do lado que ganhou recebe | 930 ÷ 300 = 3,10 | 970 ÷ 700 = 1,39 |
| Quem entrou com 100 recebe | 310,00 | 138,57 |

Dois termos saem daí. **Chance** é a fatia do pote que está em cada lado; não é preço nem probabilidade garantida.
**Retorno** é quanto cada 1 USDC recebe se o lado ganhar.

Duas consequências precisam estar na tela antes de a pessoa assinar a entrada.

**O retorno só fica definido quando as entradas fecham.** Cada entrada nova muda as fatias. No pote do exemplo,
entram mais 700 no SIM, que passa a ter 1.000. Se der SIM, a taxa é 70, sobram 1.630, e cada 1 USDC do SIM passa a
receber 1.630 ÷ 1.000 = 1,63. Antes eram 3,10. Quem entrou vendo 3,10 não tem esse número garantido. Por isso a
tela mostra o retorno como "estimativa", sempre já descontadas a taxa e a parte de quem abriu.

**Uma entrada grande baixa o retorno do próprio lado.** Um pote com 5.000 de cada lado paga 1,90 por dólar. Quem
põe 10.000 no SIM leva o SIM a 15.000. Se der SIM, a taxa é 500, sobram 19.500, e o SIM paga 19.500 ÷ 15.000 =
1,30. Quem entra grande derruba o próprio prêmio.

**O teto por mercado.** **Decisão**, de 4/10/2026: o pote não tem limite, e o teto por mercado ficou guardado: "no
mvp não vamos lidar com isso, mas guarde essa informação para revisitarmos numa fase futura". Com a criação aberta,
o assunto deixa de estar guardado e volta a estar em aberto, por dois motivos novos. Primeiro, ninguém mais escolhe
as metas, e num mercado sobre um token sem valor o resultado pode ser empurrado de graça (seção 4.2). Segundo, o
teto que existe é a soma de todos os potes abertos, e uma carteira sozinha pode ocupá-lo (Parte 4, seção 4.4).
**Proposta, aguardando decisão:** teto por mercado nos tipos em que dá para empurrar o resultado.

### 3.3 A taxa: 10% do lado perdedor

**Decisão**, confirmada pelo pitch. A taxa é a parte do pote que fica com o Brot. Ela é de **10% do lado
perdedor**, o que dá no mesmo que 10% do ganho de quem acertou. O fundador ficou com a recomendação do plano
("forma da taxa, sua recomendação"), e o slide de receita diz o mesmo: "10% of the losing side. Winners get their
money back, plus the rest."

**A conta.** Chame de V o total do lado que ganhou e de P o total do lado que perdeu.

- Taxa do Brot = 0,10 × P.
- Sobra para quem acertou, antes da parte de quem abriu = V + 0,90 × P.
- Cada 1 USDC do lado vencedor recebe (V + 0,90 × P) ÷ V.

**Por que sobre o lado perdedor.** Polymarket e Kalshi cobram por uma fórmula sobre o preço de cada negociação, e
no pote não há preço na hora da entrada. O equivalente é cobrar sobre o que os vencedores ganham. Uma taxa fixa
sobre o pote inteiro, que foi a primeira ideia, comeria o ganho de quem acerta quando quase todo o pote está no
lado vencedor.

**Tabela 1. Taxa e retorno por 1 USDC do lado vencedor**, num pote de 1.000 USDC, sem a parte de quem abriu (contas
conferidas por script na v0.0.2). "Fatia vencedora" é a parte do pote que estava no lado que ganhou.

| Fatia vencedora | Taxa do Brot | Cada 1 USDC recebe |
|---|---|---|
| 30% (o lado menor vence) | 70 | 3,100 |
| 50% | 50 | 1,900 |
| 60% (o pote do slide) | 40 | 1,600 |
| 70% | 30 | 1,386 |
| 90% | 10 | 1,100 |
| 97% | 3 | 1,028 |
| 99% | 1 | 1,009 |

Leitura: só com a taxa do Brot, quem acerta sempre recebe mais do que pôs, mesmo com 99% do pote no lado dele.

**Tabela 2. Receita esperada do Brot, em % do pote**, supondo que o lado com fatia `q` vence com probabilidade
`q`, que é o que acontece quando quem entra está bem informado. A conta é `2 × 0,10 × q × (1 − q)`.

| Fatia do favorito | Receita esperada, em % do pote |
|---|---|
| 50% | 5,00 |
| 70% | 4,20 |
| 90% | 1,80 |
| 95% | 0,95 |

Leitura: a taxa rende 5% do pote no meio a meio, 4,2% com 70 a 30 e 1,8% com 90 a 10. A fala do pitch diz o mesmo
com outras palavras: "o nosso negócio é a pergunta polêmica". Quanto mais dividido o mercado, mais ele rende.

**O custo da escolha.** A receita deixa de ser uma porcentagem fixa do volume e passa a depender da mistura de
mercados, que ninguém mediu. A Parte 2, seção 4.2, usa como base 3,70% do volume e mostra que esse número vai de
2,70% a 4,18% conforme a mistura. Em pote equilibrado o Brot cobra 5% do pote, no topo da faixa do setor, que vai
de 1,9% a 5% dos dólares pagos (INFERÊNCIA sobre as taxas publicadas pelos concorrentes, out/2026).

**Uma frase do pitch que pede precisão.** O título do slide é "We only earn from the losing side". Vale para a
taxa do pote. As outras três receitas do Brot não saem do lado perdedor: a taxa de marketing (seção 3.7), a taxa
de abertura (seção 4.1) e o 1% do pote de um lado só (seção 3.5).

### 3.4 A parte de quem abriu: 1% do pote

**Decisão do pitch.** "1% of the pot goes to whoever opened it." Quem abriu o mercado fica com 1% do pote. Este
documento chama esse valor de "a parte de quem abriu o mercado".

A regra do slide diz quanto, e não diz de onde sai. São três leituras possíveis. A primeira é a regra do pitch, ao
pé da letra. As outras duas são **Proposta, aguardando decisão**. Chame de C a parte de quem abriu.

| Desenho | Parte de quem abriu | Quem acertou recebe | Brot fica com |
|---|---|---|---|
| A. Ao pé da letra: sai do pote | `C = 0,01 × (V + P)` | `0,99 V + 0,89 P` | `0,10 P` |
| B. Sai do prêmio, com teto | `C = mínimo(0,01 × (V + P); 0,90 P)` | `V + 0,90 P − C`, nunca menos que `V` | `0,10 P` |
| C. Sai da taxa do Brot | `C = mínimo(0,01 × (V + P); 0,10 P)` | `V + 0,90 P` | `0,10 P − C` |

**A regra do pitch, no exemplo do próprio pitch.** O pote do slide de receita tem 1.000 USDC, 600 no lado que
acertou e 400 no que errou. A taxa do Brot é 40. A parte de quem abriu é 1% de 1.000: 10. No desenho A, quem acertou
recebe 1.000 − 40 − 10 = **950, e não os 960 que o slide mostra**. Os 960 só valem em mercado sem essa parte, ou no
desenho C, em que os 10 saem dos 40 do Brot.

Num pote de 1.000 USDC, quanto recebe cada 1 USDC do lado vencedor em cada desenho:

| Fatia do lado vencedor | Taxa do Brot | A | B | C | Brot em C |
|---|---|---|---|---|---|
| 30% | 70 | 3,067 | 3,067 | 3,100 | 60 |
| 50% | 50 | 1,880 | 1,880 | 1,900 | 40 |
| 60% (o pote do slide) | 40 | 1,583 | 1,583 | 1,600 | 30 |
| 90% | 10 | 1,089 | 1,089 | 1,100 | 0 |
| 97% | 3 | 1,018 | 1,018 | 1,028 | 0; quem abriu leva 3 |
| 99% | 1 | 0,999 | 1,000; quem abriu leva 9 | 1,009 | 0; quem abriu leva 1 |

Quatro consequências, na ordem em que pesam.

**Em A e em B, quem paga é quem acerta.** O prêmio encolhe em 1% do pote. Dizer que o 1% "sai do lado perdedor" não
muda isso: quem perde já perde tudo, e o que se tira do lado perdedor é tirado do prêmio de quem ganhou.

**Em A, acima de 98,89% do pote num lado, quem acerta recebe menos do que pôs.** O limiar é
`1 ÷ (1 + 0,01 ÷ 0,89)`. Acontece quando o lado perdedor é menor que 1,12% do vencedor. Na última linha da tabela,
com 99% no lado vencedor, cada 1 USDC volta como 0,999. É raro e é pequeno, mas quebra a frase do slide, "Winners
get their money back, plus the rest", e a decisão do fundador de que ninguém perde por acertar. O desenho B existe
para fechar esse caso: a parte de quem abriu nunca passa de 90% do lado perdedor, e quem acerta recebe pelo menos o
que pôs.

**O custo de quem entra sobe.** Em A e B, um pote meio a meio perde 6%: 5 da taxa do Brot e 1 de quem abriu. A
faixa do setor vai de 1,9% a 5% (INFERÊNCIA, seção 3.3). E, em pote desigual, quem abriu ganha tanto quanto o Brot,
ou mais: o 1% do pote equivale a 2% do lado perdedor no meio a meio, a 10% no 90 a 10, igual à taxa do Brot, e a
20% no 95 a 5.

**Em C, quem paga é o Brot.** Quem acerta recebe o que o slide de receita promete, e a receita do Brot cai cerca de
1 ponto do pote em quase todo formato: de 5,0% para 4,0% no meio a meio e de 1,8% para 0,8% no 90 a 10. Em pote
muito desigual o Brot fica com zero. O efeito no caixa está na Parte 2, seções 4.4 e 5.4.

**Entrar nos dois lados do próprio mercado não compensa em A.** Quem abre um mercado e põe 500 em cada lado recebe
950 de 1.000. Em C, num pote muito desigual, a mesma manobra sai de graça, o que permite inflar volume sem custo.

**Proposta, aguardando decisão: o desenho B.** Não custa receita ao Brot e mantém "quem acerta nunca recebe menos
do que pôs". O preço é dizer, sem rodeio, que o prêmio de quem acerta encolhe em 1% do pote, e ajustar o exemplo
do slide de receita para 950 nos mercados que têm essa parte. Ficam em aberto, na mesma decisão: se o 1% incide
sobre o prêmio do patrocinador (seção 3.7) e se a equipe, quando abre um mercado, fica com ele (seção 4.1).

### 3.5 Pote de um lado só e mercado anulado

**Pote de um lado só** é o mercado em que só um lado recebeu entradas. Não há perdedor para pagar o vencedor, então
o pote devolve as entradas, qualquer que seja o resultado.

**Decisão.** "apenas o primeiro apostador tem proteção contra taxa". A primeira carteira a entrar não paga nada, e
as demais pagam 1% do que puseram. O motivo: cobrar de todos puniria justamente quem o lançamento mais precisa, que
é quem entra primeiro num mercado vazio.

Exemplo. Ana abre o pote com 100 USDC no SIM. Bruno põe 200 no SIM e Carla, 300. Ninguém entra no NÃO.

| Carteira | Entrou com | Taxa | Recebe de volta |
|---|---|---|---|
| Ana, a primeira | 100 | 0 | 100 |
| Bruno | 200 | 2 | 198 |
| Carla | 300 | 3 | 297 |

O Brot fica com 5 USDC. É por causa desta regra que o roteiro do pitch evita a frase "quem acerta sempre ganha":
aqui não há ganho para ninguém.

**Mercado anulado** é um terceiro resultado, além de SIM e NÃO: o mercado não pôde ser decidido. Serve para três
casos: a conta que seria lida deixou de poder ser lida; a janela de leitura foi perdida por falha do serviço; ou a
equipe, na revisão de 6 horas, concluiu que a leitura estava errada (seção 4.5).

**Decisão.** Mercado anulado devolve tudo, sem taxa: "talvez seja a única forma de devolvermos tudo sem cobrarmos
taxa". Quem entrou com 100 recebe 100. O precedente é o PancakeSwap Prediction, também um pote, que devolve 100%
quando a rodada é cancelada (FATO, documentação do PancakeSwap).

**Decisão: o prêmio do patrocinador nesses dois casos.** O prêmio volta inteiro ao patrocinador ("ok"). A taxa de
marketing segue a causa: o Brot fica com ela no pote de um lado só, porque a divulgação foi entregue, e a devolve no
mercado anulado por falha da plataforma. A regra é a da v0.0.2, com 10% no lugar de 30%.

**O que o pitch deixou sem regra.** Duas perguntas nasceram com a criação aberta. No pote de um lado só e no
mercado anulado, quem abriu recebe o 1%? E os 0,02 SOL voltam? **Proposta, aguardando decisão:** nada para quem
abriu nos dois casos, porque não houve prêmio a repartir, e a taxa de abertura não volta, porque devolvê-la
enfraquece a barreira contra mercados de lixo.

### 3.6 Fechamento

Fechamento é o momento em que as entradas param, antes da data final, para ninguém entrar já sabendo o resultado.

**Por que um pote precisa fechar antes.** Numa bolsa, quem compra tarde paga caro. Num pote não há preço: quem
entra no último minuto recebe o mesmo retorno de quem arriscou desde o primeiro dia, e dilui essa pessoa. Exemplo:
o pote tem 500 no SIM e 500 no NÃO; falta uma hora e o fato não aconteceu, então o NÃO é quase certo. Quem está no
NÃO desde o começo receberia 1,90 por dólar. Um oportunista põe 5.000 no NÃO. A taxa é 50 e sobram 5.950 para os
5.500 do NÃO. Ele recebe 5.409,09, um lucro de 409,09 quase sem risco, e quem estava no NÃO passa a receber 1,082
por dólar.

**Decisão: uma regra só.** "um fechamento só, porém vamos sim permitir perguntas acima de 30 dias, limitados a 90
no mvp". As entradas fecham quando faltam 5% da duração do mercado, com mínimo de 24 horas e máximo de 7 dias. Nos
mercados de fato que não volta atrás, como uma queima, as entradas também travam no instante em que o fato acontece.

| Duração do mercado | Fecha no dia | Dias sem entrada no fim |
|---|---|---|
| 3 dias | 2,0 | 1,0 |
| 7 dias | 6,0 | 1,0 |
| 14 dias | 13,0 | 1,0 |
| 30 dias | 28,5 | 1,5 |
| 60 dias | 57,0 | 3,0 |
| 90 dias | 85,5 | 4,5 |

**Quem escolhe a duração.** Na v0.0.2 era a equipe. Com a criação aberta, é quem abre o mercado. **Proposta,
aguardando decisão (decisão 15):** de 3 a 90 dias. O teto de 90 já é decisão. O piso de 3 dias era a recomendação
da v0.0.2 para a equipe e vira regra do programa: num mercado de dois dias, sobra um dia para entrar e um dia parado.

**Decisão: a opção avançada, só para a equipe.** Fechamento com menos de 24 horas exige a assinatura de uma segunda
pessoa da equipe, registrada na rede. O fundador a quer para que, "para situações de apostas curtas a gente possa
trabalhar com valores menores do que 24h", e disse quando entra: quando houver fluxo de gente, "do contrário a gente
morre de termos baixas apostas apenas por termos baixo fluxo".

### 3.7 Patrocínio: 90% de prêmio, 10% de taxa de marketing

Patrocinador é o projeto que põe dinheiro no mercado sobre a própria meta. O slide de patrocínio mostra o caminho
em quatro passos:

1. **O projeto fixa uma meta** que a rede consegue medir: "burn 100M tokens by Nov 30".
2. **Ele patrocina o mercado** sobre essa meta.
3. **A comunidade escolhe um lado**, SIM ou NÃO.
4. **A rede resolve o resultado.**

Na fala: "É marketing que se prova sozinho." Hoje a promessa de um projeto vive numa publicação e ninguém cobra. No
mercado, ela ganha data, dinheiro dos dois lados e uma resposta lida na rede.

**Decisão do pitch.** "From $500. 90% becomes the prize pool. 10% is a marketing fee." O patrocínio começa em 500
dólares. Do valor pago, 90% viram prêmio no pote e 10% ficam com o Brot, como taxa de marketing. A regra da v0.0.2,
em que a plataforma ficava com 30% do valor pago, está revogada. O slide fecha com outra regra: "Every market runs
inside the same on-chain rules". O mercado patrocinado segue as regras de qualquer outro (seção 4.2).

| Valor pago | Vira prêmio (90%) | Taxa de marketing (10%) |
|---|---|---|
| 500 | 450 | 50 |
| 1.500 | 1.350 | 150 |
| 5.000 | 4.500 | 500 |

Só a primeira linha está no pitch. Os valores de 1.500 e 5.000 eram as faixas da v0.0.2 e ficam aqui como tamanhos
supostos, para as contas. **Proposta, aguardando decisão:** 500 como piso, sem faixas fixas.

**Decisão: duas formas de entrar no pote**, à escolha do patrocinador. O exemplo usa um pote com 10.000 USDC em
entradas, 6.000 no SIM e 4.000 no NÃO. Sem patrocínio, o SIM paga 1,600 por dólar e o NÃO, 2,350.

- **Prêmio neutro** é dinheiro somado ao pote sem escolher lado. Aumenta o retorno de quem acertar, qualquer que
  seja o resultado. Com um patrocínio de 1.500, o prêmio é de 1.350: o SIM passa a pagar 1,825 e o NÃO, 2,688. Com
  a divisão antiga eram 1,775 e 2,613. O prêmio neutro não paga a taxa do pote, porque só o lado perdedor é base
  dela.
- **Entrada com selo** é o dinheiro do patrocinador entrando num lado, como uma entrada grande, com o nome dele. O
  efeito é outro. Na conta da v0.0.2, 3.500 USDC postos no SIM baixam o SIM de 1,600 para 1,379 e sobem o NÃO para
  3,138. Quem escolheu o mesmo lado do patrocinador ganha menos; quem escolheu o outro ganha mais, se acertar. Se
  o lado dele perder, esse dinheiro entra na base da taxa como qualquer outro.

**O risco: quem controla o resultado entrar nele.** O projeto decide sozinho se cumpre a meta. Exemplo: o público
põe 1.000 no SIM e 1.000 no NÃO. O patrocinador, escondido, põe 5.000 no NÃO e não queima. Ele recebe 5.750: lucro
de 750, tirado de quem escolheu o SIM. Polymarket e Kalshi proíbem por escrito que negocie quem pode influenciar o
resultado (FATO, regras de integridade das duas plataformas, 2026).

**Decisão.** O fundador escolheu três travas ("vamos de alternativas 1, 3 e 4"): o patrocinador pode não ser
divulgado ao público, mas a equipe sabe quem é; o mercado traz o aviso "o patrocinador pode controlar o resultado e
pode ter escolhido um lado"; e quem não mostra o nome só entra com prêmio neutro. A ferramenta que esconde o
pagador é o Cloak, um serviço de privacidade em Solana, que só esconde bem valores pequenos (Parte 4, seção 2.2).
Há uma tensão a registrar: o pitch vende o projeto mostrando a própria promessa, e um patrocinador que se esconde é
o contrário disso. O caso passa a ser a exceção.

**O que sai.** A v0.0.2 tinha o pedido de pergunta: o patrocinador descrevia o mercado, deixava o pagamento travado
e esperava a resposta da equipe. Com a criação aberta, o pedido perde a função. **Proposta, aguardando decisão:** o
projeto abre o próprio mercado e deposita o prêmio na mesma hora.

**O que o pitch deixou em aberto.** Três pontos, todos **Proposta, aguardando decisão**:

- **As contrapartidas.** A v0.0.2 listava selo, texto, destaque na página inicial, publicações no X e relatório,
  em quantidades por faixa. Com 10%, um patrocínio de 500 deixa 50 dólares para o Brot, que não pagam quatro
  publicações. A proposta: selo, nome e link em todos; publicações e destaque combinados caso a caso.
- **Patrocinar um mercado aberto por outra pessoa.** O slide mostra o projeto no próprio mercado. Não diz se ele
  pode pôr prêmio num mercado que outra carteira abriu.
- **O 1% de quem abriu sobre o prêmio.** Num pote de 10.000 com prêmio de 4.500, o 1% seria de 145, dos quais 45
  viriam do prêmio. A proposta: o 1% incide só sobre as entradas, nunca sobre o prêmio.

### 3.8 Parceiros de lançamento

**Decisão**, confirmada pelo pitch: "Launch partners: 20–30 projects get one market free." O fundador vai "convidar
parceiros da rede para entrar como patrocinador ... sem que eles tenham a obrigação de pagar qualquer coisa, isso
para fins de marketing". Em troca, eles "nos entregam publicidade e postagem nas suas redes sociais".

A regra decidida: um mercado grátis por parceiro, com destaque de 72 horas na página inicial, em troca de duas
publicações do parceiro para a própria comunidade. Vale para os 30 primeiros.

Duas ressalvas. **Não há parceiro fechado até a data deste documento.** O slide de crescimento mostra "7 of 30" com
sete marcas inventadas e a etiqueta "example"; é ilustração. E a consequência decidida continua valendo: a receita
de patrocínio do primeiro ano fica perto de zero.

### 3.9 Indicação

Indicação é o programa em que um usuário traz outro e os dois ganham algo.

**Decisão**, confirmada pelo pitch: "Referrals, day one: 20% of the fee, for 90 days."

- **Quem indica** recebe 20% da taxa que o Brot de fato recebeu das entradas vencedoras do indicado, durante 90
  dias. Só as vencedoras contam porque a taxa é descontada do ganho: uma entrada só gera taxa quando ganha.
- **O indicado** recebe de volta a taxa cobrada sobre os primeiros 50 USDC, depois de completar 250 USDC em
  entradas, com **teto de 5 USDC**.
- O dinheiro sai do fluxo de taxas. Não há caixa próprio nem verba separada.

Exemplo. Bia indica o Caio. Em 90 dias, o Caio entra com 1.000 USDC. A taxa descontada dos ganhos dele soma 37, que
é a média de 3,70% do volume usada na Parte 2 (INFERÊNCIA). Bia recebe 20% disso, 7,40. O Caio passou dos 250 e
recebe de volta a taxa dos primeiros 50, que na média é de 1,85. O Brot fica com 27,75. Na média, o programa custa
0,74% do volume indicado, mais a devolução.

**Por que devolução com teto, e não isenção.** Com isenção, quem abrisse uma carteira nova a cada 50 dólares nunca
pagaria taxa. E, sem teto, 50 USDC num lado pequeno que ganha geram uma devolução alta: 45 USDC no exemplo da
v0.0.2.

**Indicar a si mesmo.** É possível, e a resposta pronta do pitch admite: sem cadastro não há como impedir. O ganho
tem teto: "20% de desconto na própria taxa por 90 dias, mais uma devolução de até 5 dólares".

**"Day one".** O slide não diz de qual dia. A v0.0.2 decidiu que o beta abre sem indicação. **Proposta, aguardando
decisão:** "day one" é o primeiro dia na rede principal (Parte 4, seção 3.3).

### 3.10 Pagamento automático; a saída antecipada, guardada

**Decisão**, confirmada pelo pitch: "Auto payout. No claim button." O fundador comparou com o líder: "na polymarket
ele vai direto pro teu saldo, não faz sentido ter botão de claim". Resolvido o mercado e passada a janela de 6
horas, o serviço da plataforma envia a cada carteira a parte dela. O mesmo vale para as devoluções da seção 3.5.

Duas consequências práticas:

- **A plataforma paga a taxa de rede de cada envio.** É pouco: 0,000005 SOL por transação, de modo que mil
  transações custam 0,005 SOL (FATO, relatório técnico de out/2026; a soma é INFERÊNCIA).
- **A conta de USDC de quem ganhou precisa existir.** Se a pessoa a fechou depois de entrar, o envio falha, e o
  valor fica reservado em nome dela.

O serviço que paga não escolhe quem recebe nem quanto: os valores saem do registro das entradas e do resultado
gravado. Se o serviço parar, o pagamento atrasa, e o dinheiro continua no cofre.

**Saída antecipada. Decisão.** "Neste mvp vamos trabalhar sem possibilidade de saída." Sair antes do fim e receber
parte do dinheiro fica para a fase 2. O motivo: não foi encontrado nenhum pote que devolva dinheiro do próprio cofre
a quem sai (FATO do agente de pesquisa: ausência em pesquisa, out/2026), e uma penalidade fixa esvazia o prêmio de
quem acertou. A fórmula que o fundador aprovou para estudo está na v0.0.2, P1 §3.6: a penalidade começa em 5%,
cresce com o tempo e com a queda da chance do lado de quem sai, e para em 90%.

## 4. Mercados e resolução

### 4.1 Quem abre um mercado

Um mercado é uma pergunta com resposta SIM ou NÃO, uma data final e uma regra de como se decide. Exemplo: "A oferta
do token T cai para 900 milhões até o dia 30?".

**Decisão do pitch.** "Anyone can open a market, pump.fun style. 0.02 SOL to open a market. Inside the rules. Only
markets the chain can answer." Qualquer carteira abre um mercado, pagando 0,02 SOL, desde que ele seja de um tipo
que a rede consegue responder. Na fala: "não é só projeto que abre mercado. Qualquer um abre." A regra da v0.0.2,
em que só a equipe abria, está revogada.

O caminho, passo a passo:

1. **Abertura.** Quem abre escolhe um tipo da lista (seção 4.2), a conta da Solana que será lida, a meta e a data
   final. Paga 0,02 SOL.
2. **Conferência.** O programa confere, na hora, se aquela conta serve para aquele tipo. Se não serve, o mercado
   não abre. Na v0.0.2 havia ainda a conferência de uma segunda pessoa da equipe; agora quem confere é o programa.
3. **Entradas**, até o fechamento (seção 3.6).
4. **Resolução**, pelo serviço agendado (seção 4.4). O mercado pode se resolver antes da data. **Decisão.** "Se
   acontecer algo antes da data marcada, ela pode sim se resolver." Se a queima prometida acontece no dia 10, o
   mercado resolve no dia 10.
5. **Janela de 6 horas** (seção 4.5) e **pagamento automático** (seção 3.10). No pagamento, quem abriu recebe a
   parte dele (seção 3.4).

**Para que servem os 0,02 SOL.** Na fala: "Os 0,02 SOL seguram o lixo." Abrir 1.000 mercados sem sentido custa 20
SOL. Para quem abre a sério, a taxa se paga quando o pote passa do equivalente a 2 SOL, porque 1% disso são os
0,02. A taxa também cobre o custo do mercado na rede: 0,02 SOL pagam 4.000 transações (FATO sobre o preço da
transação, seção 3.10; a divisão é INFERÊNCIA), e o cofre de USDC de cada mercado pede cerca de 0,002 SOL de
aluguel, que é o depósito que a Solana exige para manter uma conta aberta (FATO, v0.0.2, P4 §4.5). O aluguel da
conta do próprio mercado não foi medido.

**O que o pitch não diz: para onde vão os 0,02 SOL.** **Proposta, aguardando decisão:** ficam com o Brot, sem
devolução, descontado o aluguel das contas.

**O projeto abre o próprio mercado.** Não há mais um caminho separado para o patrocinador. Ele abre como qualquer
carteira e deposita o prêmio (seção 3.7).

**A equipe também abre?** O pitch não diz. **Proposta, aguardando decisão:** abre, para haver mercado de preço no
primeiro dia, e não fica com o 1% dos mercados que abre. Nesses mercados o 1% fica com quem acertou, e o exemplo do
slide de receita, com 960 para os vencedores, é exato.

**O que sai.** Os dois ciclos da v0.0.2 e a página de sugestões pelo X: quem tem uma ideia de mercado abre.

### 4.2 Dentro das regras: o que o programa aceita

"Inside the rules" é a parte da frase que segura o resto. Sem ela, o produto vira um mercado de opinião, igual aos
que o slide do problema critica. Esta seção diz o que as regras são.

Cada tipo de mercado precisa de um leitor (seção 2.3). Sem leitor, o tipo não existe. Algumas palavras antes da
tabela.

- **Oferta** é a quantidade total de um token. **Queima** é destruir tokens para sempre, reduzindo a oferta.
- **Pool de negociação** é o cofre em que um token é trocado por outro. **Liquidez travada** é dinheiro posto numa
  pool e travado para sempre. A Meteora é uma das plataformas de pools da Solana.
- **Validador** é um computador que confirma as transações da rede. **Stake** é o SOL que as pessoas confiam a ele.
  **Pool de staking** é um cofre que junta o SOL de muita gente e o distribui entre validadores.
- **Época** é o "dia" da Solana para contas de stake; dura cerca de dois dias.
- **Oráculo de preço** é um serviço em que corretoras e formadores de mercado publicam preços assinados, que o
  programa confere dentro da rede. O do Brot é a Pyth.

**Decisão**, de 5/10/2026: o site abre com cinco tipos. São os mesmos exemplos do pitch: o mercado de preço lido da
Pyth e a queima estão na demo, e a frase de elevador cita "a burn, locked liquidity or staked SOL".

| Tipo | O que pergunta | Exemplo | Quem consegue empurrar o resultado |
|---|---|---|---|
| Preço de ativo grande | O preço encosta num alvo dentro do prazo? | "O SOL toca 300 dólares até o dia 30?" | Ninguém: é o mercado inteiro do ativo |
| Queima de oferta | A quantidade total do token cai até um número? | "A oferta do token T cai para 900 milhões até o dia 30?" | Quem tem o token e o queima. Custa o valor do token queimado |
| Liquidez travada na Meteora | Uma pool tem pelo menos X de liquidez travada para sempre? | "A pool T/SOL chega a X de liquidez travada até o dia 30?" | Quem põe liquidez e trava. O dinheiro fica preso |
| Tamanho de pool de staking | A pool tem pelo menos X SOL no começo de uma época? | "O JitoSOL começa a época E com X SOL ou mais?" | Quem deposita. O dinheiro precisa atravessar a virada da época |
| Stake de validador | O validador tem pelo menos X SOL confiados a ele numa época? | "O validador V entra na época E com X SOL ou mais?" | Quem confia SOL ao validador antes de a época virar |

Dois avisos sobre os tipos. No mercado de preço, a modalidade é a de **toque**: dá SIM se o preço encostar no alvo
em qualquer momento do prazo, e toda entrada exige um preço fresco, para ninguém entrar depois de o preço já ter
tocado o alvo. Em 4 de outubro de 2026 a Pyth tinha 1.881 preços, 423 deles de cripto (FATO, consulta direta). E
os mercados de época dependem do serviço agendado: a janela para ler dura cerca de dois dias.

**O que muda com a criação aberta.** Na v0.0.2, a pergunta que separava os tipos era "alguém consegue decidir o
resultado sem gastar nada?", e quem a aplicava era a equipe, caso a caso. Com qualquer carteira abrindo, o critério
precisa virar código. O mínimo, todo ele **Proposta, aguardando decisão** (decisão 15; os itens 3 e 4 são também
as decisões 13 e 7):

1. **Só os cinco tipos.** O programa recusa qualquer outro.
2. **A conta é conferida na criação**, como a v0.0.2 já previa.
3. **Sem texto livre.** O site monta a frase a partir do tipo, da conta, da meta e da data. Com texto livre, quem
   abre escreve uma coisa e o programa lê outra, e quem entra confia na frase.
4. **Uma lista de contas aceitas** nos tipos em que isso importa: os preços da Pyth, os tokens e as pools.
5. **Duração de 3 a 90 dias** (seção 3.6).
6. **Taxas fixadas pelo programa.** Quem abre não escolhe a taxa nem a própria parte.

**O furo que a lista de contas fecha.** Na v0.0.2, a defesa contra quem empurra um resultado era a equipe só abrir
metas que custassem caro. Essa defesa some. Exemplo: alguém cria um token sem valor, abre o mercado "a oferta cai
para X até o dia 30?", espera entradas no NÃO e queima os próprios tokens, de graça. "Queimar custa dinheiro" só
vale para token que vale dinheiro. Com stake é parecido: o SOL não se perde, só muda de lugar por um tempo.

**Proposta, aguardando decisão:** o mercado de preço pela Pyth abre para qualquer carteira desde o início, porque
ninguém controla o preço de um ativo grande. Nos outros quatro tipos, só entram contas de uma lista mantida pela
carteira de várias assinaturas, com teto por mercado. O custo é claro: nesses tipos, "qualquer um abre" passa a
valer só para os tokens, as pools e os validadores da lista.

**Quem abriu pode ter um lado.** É o risco do patrocinador não divulgado (seção 3.7), agora sem ninguém
identificado. Sem cadastro não há como proibir. **Proposta, aguardando decisão:** permitir, com um aviso automático
nos tipos em que dá para empurrar: "quem abriu pode controlar o resultado e pode ter escolhido um lado".

### 4.3 O que fica fora

**Decisão: o que uma única chave decide de graça.** Chave é a senha que dá a alguém um poder sobre um token ou um
programa: criar tokens novos, congelar carteiras, alterar o código. Renunciar é abrir mão desse poder para sempre.
Ficam fora quatro tipos: renúncia de emissão, renúncia de congelamento, programa imutável e metadados imutáveis. O
dono da chave decide o resultado sem gastar nada e pode entrar antes, por outra carteira. A conta: o pote tem 3.000
no SIM e 7.000 no NÃO, e o dono da chave põe 3.000 no SIM pouco antes do fechamento. Ele usa a chave, o mercado
resolve SIM e ele recebe 6.150: lucro de 3.150, sem risco. O fundador decidiu: "sim, vamos seguir a alternativa
proposta".

**Tokens do padrão novo.** Na Solana há dois programas de token: o clássico e o novo, chamado Token-2022, que os
tokens recentes do pump.fun usam: 7 de 7 na amostra lida na rede em 3 de outubro de 2026 (FATO, amostra pequena).
Os leitores que existem só aceitam o clássico; diante de um token novo, recusam (FATO, repositório). A queima entra,
no primeiro dia, só para tokens do padrão clássico. É um limite sério para um produto que se compara ao pump.fun:
os tokens de lá, hoje, ficam fora.

**Decisão: tokens travados** ficam fora no primeiro dia ("ok"), pelo mesmo limite do padrão clássico.

**Decisão: preço de token pequeno, em três degraus.** Numa pool pequena, o preço é a divisão entre duas reservas e
pode ser movido por um instante, com dinheiro emprestado e devolvido na mesma transação. Já aconteceu em Solana: no
caso Mango, em outubro de 2022, a retirada foi de 114 a 116 milhões de dólares (FATO, denúncias dos reguladores
americanos SEC e CFTC). Os degraus aceitos ("vamos seguir a proposta alternativa recomendada"): primeiro, ativos
com preço num oráculo, que é o tipo da tabela; depois, tokens com pool na Raydium ou na Meteora, pela média do
preço num período; por último, tokens que só existem na pool do pump.fun. Os detalhes estão na v0.0.2, P1 §4.3.

**Fora por desenho: opinião.** Geopolítica, política e tudo o que depende de alguém dizer o que aconteceu. É a
decisão de origem do produto e a resposta pronta do pitch: "Não existe mercado de opinião."

**Esportes: fase 2.** Resultado de jogo não nasce na rede; alguém precisa publicar. O fundador quer, "numa fase 2
criarmos um oráculo específico pra isso". É a categoria que as regras brasileiras citam pelo nome (Parte 4, seção
6.1).

### 4.4 Como o mercado se resolve

1. Cada mercado nasce apontando para uma conta da Solana. Conta é o lugar em que a rede guarda um dado: o registro
   de um token, o estado de uma pool, um preço assinado.
2. Na resolução, o programa abre essa conta, lê o número e compara com a meta.
3. Se a meta foi cumprida, grava SIM. Se a data final passou sem a meta, grava NÃO. Ninguém informa nada.

O resultado sai do dado, e não de quem acionou a leitura. **Decisão do pitch.** "Anyone can re-check. Same account,
same answer": qualquer pessoa abre a mesma conta e vê o mesmo número.

**Decisão: quem aciona.** Um serviço agendado, que é um programa de computador que acorda de tempos em tempos e
faz uma tarefa sozinho. Ele confere a cada minuto se algum mercado já pode ser resolvido. O site não tem botão
público de resolver ("Sobre o botão resolver, esquece").

**Prazo vencido é NÃO.** O programa não tem como saber depois em que dia a meta foi cumprida. Exemplo: a queima
acontece no dia 10, o serviço está fora do ar e ninguém aciona a leitura. No dia 30 o prazo vence e o resultado
gravado é NÃO. Quem acertou perderia tudo. Por isso o serviço não pode falhar.

**Decisão: dois serviços.** O segundo roda em outro provedor e vigia o principal a cada 5 minutos. Com 10 minutos
sem resposta, tenta religá-lo, até 3 vezes. Se não religar, assume a resolução, a cada 5 minutos, e manda email ao
CTO ("o segundo assume o cron e envia notificação para o cto saber que tem um sistema down"). Por trás dos dois
ficam a janela de 6 horas e o resultado "Anulado". Quanto custa vigiar muitos mercados abertos por terceiros não
foi medido (Parte 4, seção 4.5).

### 4.5 A janela de 6 horas e a disputa

**Decisão.** Depois de resolvido, o mercado "fica travado por cerca de 6h em aguardo de alguém da equipe revise e
confirme que a resolução foi correta, liberando o pagamento". Três regras:

- **A equipe só confirma ou anula.** Ela "pode só confirmar ou anular". Não existe a opção de inverter. Anular
  devolve a cada um o que pôs.
- **Se ninguém revisar, o pagamento sai sozinho** "ao fim das 6h". O dinheiro nunca depende de alguém da equipe
  estar acordado.
- **No MVP, só a equipe aciona a contestação.** Qualquer pessoa avisa por um canal público.

**Decisão: a disputa em duas etapas**, sem voto por token, porque "é justamente neste ambiente que ocorre a
manipulação dos resultados".

| Passo | O que acontece | Prazo |
|---|---|---|
| Gatilho | Um aviso de contestação pausa o pagamento. No MVP só a equipe aciona; depois, qualquer carteira que entrou no mercado, com um depósito | Dentro das 6 horas |
| Etapa 1: segunda fonte | O mesmo dado é lido de novo por um caminho independente. Se confirma, o pagamento sai. Se diverge, sobe | Até 1 hora |
| Etapa 2: revisão humana | Três membros da equipe examinam; decide o acordo de dois. Só confirmam ou anulam, e o motivo é publicado | Até 48 horas |

Três limites: não há voto por token; a equipe nunca inverte um resultado; e, no pior caso, o pagamento sai 55 horas
depois da resolução.

**O conflito com o pitch. Decisão do pitch.** O slide de solução diz "No human in the loop. The program reads the
account", e a fala, "Sem votação, sem chave da empresa, sem IA". A janela é uma pessoa no caminho, e anular exige
uma chave da equipe.
Ao pé da letra, a frase tira a janela e a etapa 2 da disputa. A consequência seria esta: uma leitura errada é paga
sem volta, e a falha dos dois serviços ao mesmo tempo, que faz um SIM virar NÃO, fica sem proteção.

O pitch não cita a janela, e por isso este plano a mantém, como decisão de 5/10/2026 que o pitch não revogou.
**Proposta, aguardando decisão:** manter a janela até a auditoria, como freio que só devolve, e trocar a frase por
"no human picks the winner": nenhuma pessoa escolhe o vencedor. Essa frase o produto cumpre.

### 4.6 Como falamos disso

O fundador pediu frases "num sentido mais marketeiro e agradável de ler, sem ser mentira". O pitch deu as três que
abrem qualquer texto.

- **A frase de elevador**, aprovada em 7/10/2026: "Brot Markets is a prediction market built as a growth engine for
  on-chain projects. You pick a milestone the blockchain can measure, like a burn, locked liquidity or staked SOL,
  and sponsor a market on it. Your community takes sides, talks about it and shares it. At the deadline, the chain
  itself reads the result and pays the winners. No votes, no judges. Your milestone becomes a campaign that proves
  itself."
- **A frase da capa:** "Prediction markets the chain resolves."
- **O lema:** "Proof > Promises". Na fala: "É prova, não promessa."

**O que trocamos e por quê.**

| Em vez de | Dizemos | Por quê |
|---|---|---|
| "Aposte" | "Entre", "escolha um lado" | É a linha do pitch, que não usa "bet" em nenhum slide |
| "No human in the loop" | "Nenhuma pessoa escolhe o vencedor" | A equipe pode anular e pausar (seção 4.5). Proposta |
| "Só ganhamos do lado perdedor" | "A taxa do pote sai só do lado perdedor" | Há taxa de marketing, taxa de abertura e o 1% do pote de um lado só |
| "Quem acerta sempre ganha" | "Quem acerta recebe o seu de volta e mais a parte dele no resto" | Em pote de um lado só não há ganho; no desenho A, acima de 98,89%, quem acerta recebe menos |
| "Compartilhe para entrar" | "Cada mercado vira um cartão para postar no X" | "Share to take a side" é um cartão, e não uma condição para entrar |
| "Sem oráculo" | "Resultado lido direto da rede" | O mercado de preço usa um oráculo, a Pyth, conferido na rede |
| "Pago em minutos" | "Pago sozinho, ao fim da janela de 6 horas" | Existe a janela; com contestação, até 55 horas (seção 4.5) |
| "Ganhe 3 vezes" | "Retorno estimado agora: 3,10 por 1" | O retorno só fica definido no fechamento |

**O mascote.** Os documentos e a marca o chamam de Baked. Na fala do pitch ele é "o Cacetinho". **Proposta,
aguardando decisão:** Baked na escrita e Cacetinho como apelido falado.

**Enquanto o produto estiver na devnet**, toda tela e toda publicação dizem: "Estamos em fase de testes. Aqui se
entra com USDC de teste, que não vale dinheiro."

## 5. Decisões e pontos abertos

### 5.1 O que o pitch decidiu

| Assunto | O que passa a valer | Seção |
|---|---|---|
| Quem abre | Qualquer carteira, por 0,02 SOL, dentro das regras | 4.1 |
| Quem abriu | Fica com 1% do pote | 3.4 |
| Patrocínio | A partir de 500 dólares; 90% de prêmio e 10% de taxa de marketing | 3.7 |
| O projeto | É o cliente, e vem primeiro | 2.2 |
| Palavras | "Mercado", "entrar", "escolher um lado"; frase de elevador, capa e lema | 4.6 |

As dez decisões de 5/10/2026 continuam valendo (v0.0.2, P1 §5.1): o pitch não revogou nenhuma. Uma delas, a disputa
em duas etapas, com revisão humana, entra no conflito com "No human in the loop" (seção 4.5).

### 5.2 O que espera decisão do fundador

Os números de 1 a 14 são os da revisão de impacto (`_review/bp-impact-review-v0.0.3.md`, seção 6). A 15 junta as
regras mínimas de criação, que a revisão propôs sem número. As de 16 a 19 tocam a construção (Parte 4, capítulo 8).

| Nº | Decisão | Recomendação | Seção |
|---|---|---|---|
| 1 | De onde sai o 1% de quem abriu | Desenho B: do prêmio, com teto | 3.4 |
| 2 | Para onde vão os 0,02 SOL | Para o Brot, sem devolução, descontado o aluguel | 4.1 |
| 3 | Valores acima de 500 e contrapartidas | 500 como piso, sem faixas; selo, nome e link em todos | 3.7 |
| 4 | O pedido de pergunta com resposta em 14 dias | Sai | 3.7 |
| 5 | "No human in the loop" e a janela | Manter a janela; trocar a frase | 4.5 |
| 6 | A equipe abre mercados? Fica com o 1%? | Abre, sem o 1% | 4.1 |
| 7 | Tipos em que dá para empurrar, abertos a todos | Lista de contas aceitas e teto por mercado; o preço abre a todos | 4.2 |
| 9 | "Referrals, day one" | "Day one" é o primeiro dia na rede principal | 3.9 |
| 10 | O 1% sobre o prêmio, no anulado e no pote de um lado só | Só sobre as entradas; nada nos dois casos | 3.5, 3.7 |
| 11 | O nome do mascote | Baked na escrita; Cacetinho na fala | 4.6 |
| 13 | Texto livre no mercado | Não | 4.2 |
| 14 | Quem abriu escolhendo lado | Permitir, com aviso automático | 4.2 |
| 15 | As regras mínimas de criação | Só os cinco tipos; conta conferida na abertura; de 3 a 90 dias; taxas fixadas pelo programa | 3.6, 4.2 |

### 5.3 O que a pesquisa não encontrou

- Evidência de que a criação aberta traz volume. Os dois casos conhecidos apontam para o outro lado (Parte 2,
  seção 3.2).
- Quanto custa criar um token no pump.fun, para sustentar a comparação do slide.
- O aluguel da conta de um mercado, e portanto quanto dos 0,02 SOL sobra.
- A mistura real de mercados, de que a receita depende.
- Um pote que devolva dinheiro do próprio cofre a quem sai antes do fim.
- Quantas pessoas reais há por trás das 80 milhões de carteiras do pump.fun.



---

# Brot Markets — Business Plan v0.0.3 — Parte 2: Mercado e negócio

**Data:** 8 de outubro de 2026.
**Estado:** rascunho para revisão do fundador. Derivada do pitch de 7 de outubro de 2026, por ordem dele. Onde o
pitch e a v0.0.2 discordam, vale o pitch; onde ele se cala, vale a v0.0.2, mais curta. Substitui a Parte 2 da
v0.0.2, que fica na pasta como versão anterior.

**Como ler.** As marcas são as da Parte 1: **Decisão** (do fundador, em 4 ou 5/10/2026), **Decisão do pitch**
(regra do deck de 7/10/2026, citada em inglês como está na tela) e **Proposta, aguardando decisão**. Números de
mercado trazem FATO (lido na fonte) ou FATO SECUNDÁRIO (lido em quem citou a fonte), com a data. Toda projeção é
INFERÊNCIA: conta nossa sobre premissas declaradas, e não previsão. Os valores estão em dólares.

Cinco termos aparecem no texto inteiro. **Volume** é a soma de tudo o que entrou nos potes num período. **Taxa
média** é quanto o Brot arrecada, na média, de cada 100 dólares de volume. **Ponto de equilíbrio** é o volume
mensal em que a empresa paga as próprias contas. **Caixa** é o dinheiro da operação, somado desde antes do
lançamento. **Mês 1** é o primeiro mês com dinheiro real, na rede principal. O pote, a taxa e os tipos de mercado
estão na Parte 1.

**O que mudou desde a v0.0.2.**

1. Entra o quadro de mercado do pitch (TAM, SAM e SOM), com a definição e a etiqueta de cada número.
2. São três públicos, e os perfis ganham um quinto: quem abre mercados.
3. Os testes de demanda passam de dois para três. O terceiro mede os mercados abertos por quem não é da equipe.
4. Na comparação com os concorrentes, a linha do Brot muda: qualquer carteira abre. A ideia que estava guardada,
   dar uma parte a quem cria o mercado, foi adotada.
5. As receitas passam a ser quatro. Entram a taxa de abertura e um custo possível, a parte de quem abriu.
6. O patrocínio rende um terço do que rendia: 10% do valor pago, e não 30%. Trinta parceiros pagando 500 dólares
   dariam 1.500 à plataforma, e não 4.500.
7. Os cenários foram refeitos com o patrocínio a 10%. O ponto de equilíbrio não muda. O caixa do cenário razoável
   no mês 24 cai de 27.767 para 21.467.
8. Os canais passam a ser os quatro motores do slide de crescimento. Saem as sugestões pelo X.
9. Fundo de prêmios, tesouraria, recompra e fase 2 ficam numa seção só, "em espera".

## 1. Resumo

### 1.1 O mercado, nos três números do pitch

- **21,7 bilhões de dólares** em 30 dias é o volume do setor inteiro de mercados de previsão, de 4 de setembro a 3
  de outubro de 2026, em dinheiro de fato pago (FATO SECUNDÁRIO, DefiRate, out/2026). É o "TAM" do slide.
- **Cerca de 0,9 bilhão por mês** é a nossa estimativa do volume em mercados sobre cripto (INFERÊNCIA). É o "SAM".
- **15,4 milhões de dólares** foi o volume de setembro de 2026 do World, o mercado de previsão que funciona dentro
  da carteira Phantom (FATO SECUNDÁRIO, DefiLlama, set/2026). É o "SOM" do slide, e é o volume inteiro de um
  concorrente, e não a nossa fatia.

A seção 2.1 diz o que cada número mede e o que ele não é. Um quarto número continua valendo, e o pitch não o
mostra: **zero** é o número de mercados sobre queima, trava de liquidez ou outro fato de token de terceiros que a
pesquisa encontrou em qualquer plataforma (FATO, ausência em busca limitada, out/2026). O nosso tipo de mercado
ainda não tem demanda demonstrada.

### 1.2 Como a empresa ganha dinheiro

São quatro receitas (seção 4.1). Duas têm número.

- **A taxa do pote.** O Brot fica com 10% do lado perdedor. Na média, isso dá 3,70% do volume (INFERÊNCIA; de
  2,70% a 4,18%, conforme a mistura de mercados). De cada dólar de taxa, 25 centavos vão para a tesouraria e 75
  para a operação, que paga as contas.
- **A taxa de marketing.** O projeto que patrocina paga a partir de 500 dólares; 90% viram prêmio e 10% ficam com
  o Brot. Um patrocínio de 500 deixa 50 dólares.
- **A taxa de abertura.** Quem abre um mercado paga 0,02 SOL. Quanto isso rende depende de dois números que
  ninguém tem: quantos mercados serão abertos e o preço do SOL.
- **O 1% do pote de um lado só**, que é pequeno e está fora do modelo.

Há um custo novo, ainda sem dono: o 1% do pote para quem abriu o mercado. Se ele sair do prêmio de quem acertou,
não custa nada ao Brot. Se sair da taxa do Brot, custa até 27% dela (seção 4.4).

### 1.3 O ponto de equilíbrio

O custo de referência é de 5.500 dólares por mês: três sócios recebendo 1.500 cada um, mais até 1.000 de
infraestrutura. Com a taxa média de 3,70%, a empresa paga esse custo quando o volume chega a **208.630 dólares
por mês** (INFERÊNCIA). Com o pitch lido ao pé da letra, esse número não muda, porque a parte de quem abriu não sai
da taxa do Brot. Para dar a medida: 208.630 é 1,4% do que o World fez em setembro de 2026.

O número sobe em dois casos: se a maioria dos mercados tiver favorito claro (285.900), ou se a parte de quem abriu
sair da taxa do Brot (de 241.228 a 285.900, seção 5.2).

### 1.4 Os três cenários

Todos os valores são INFERÊNCIA, com a taxa média de 3,70% e o patrocínio a 10%. O caixa parte de 7.500 negativos:
2.000 da abertura da empresa e 5.500 de um mês de devnet.

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume no mês 12 | 45.000 | 300.000 | 1.500.000 |
| Volume no mês 24 | 31.250 | 712.500 | 4.708.333 |
| Mês em que a operação se paga | Não chega | 9 | 2 |
| Ponto mais baixo do caixa | −116.565, no mês 24, e caindo | −27.674 | −9.705, no mês 1 |
| Caixa no mês 24 | −116.565 | 21.467 | 783.963 |

O cenário ruim não se paga em momento nenhum. O razoável equilibra no mês 9 e pede cerca de 27,7 mil dólares até
lá. O otimista depende de um canal de distribuição que hoje não existe; o mês de equilíbrio e o ponto mais baixo
dele não mudam com o pitch (seção 5.3). As trajetórias de volume são as mesmas da v0.0.2: o pitch afirma que criadores e
parceiros trazem volume, e não há dado para mudar a curva.

### 1.5 O que continua aberto

Do que o fundador precisa decidir, três pontos mexem nas contas: de onde sai o 1% de quem abriu, para onde vão os
0,02 SOL e o que o patrocinador recebe pelos 10% (seção 7). E três números continuam sem medida: a mistura real de
mercados, quantos mercados terceiros vão abrir e a data de ida à rede principal.

## 2. Mercado e público

### 2.1 TAM, SAM e SOM

São três siglas do vocabulário de investidor. **TAM** é o mercado total: tudo o que se gasta na categoria. **SAM**
é a parte do total que o produto consegue atender. **SOM** é a parte que ele pode de fato conquistar. O slide de
mercado traz um número para cada uma. Os três estão corretos como números; o que pede cuidado são os rótulos.

| Sigla no slide | Número | O que mede de fato | Etiqueta | O que não é |
|---|---|---|---|---|
| TAM, "All prediction markets" | 21,7 bilhões em 30 dias | O volume do setor inteiro, em dólares pagos, de 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate | Não é receita. E 62% do volume do setor eram esportes, que a rede não lê |
| SAM, "Crypto markets" | Cerca de 0,9 bilhão por mês | `20% × 4,63 bilhões = 0,926`. A fatia de cripto é a da Polymarket em maio de 2026; o volume é o da Polymarket em setembro | INFERÊNCIA | Vale para uma plataforma, e não para o setor. Os dois números são de meses diferentes |
| SOM, "Inside Solana" | 15,4 milhões no mês | O volume inteiro do World em setembro de 2026 | FATO SECUNDÁRIO, DefiLlama | Não é a nossa fatia. O rótulo "SOM" é nosso |

O que o plano tira daí é mais modesto que os rótulos. O número que a empresa precisa alcançar é o ponto de
equilíbrio, 208.630 dólares por mês, que é 1,4% do que o World fez em setembro (seção 5.2).

**"13× in three months."** A conta confere: `15,44 ÷ 1,14 = 13,5`, de junho a setembro. A tela omite o mês do
meio: agosto foi de 22,20 milhões, e setembro caiu 30% em relação a ele. O World cresceu muito e já recuou.

**Três frases da fala, ditas com a precisão da fonte.**

- "Cripto é a porta de entrada de 40% dos novos usuários." A fonte diz: cerca de 40% da atividade inicial dos novos
  usuários da Polymarket, no primeiro trimestre de 2026, foi em mercados de cripto (FATO SECUNDÁRIO, The Defiant).
- "80 milhões de carteiras no pump.fun." São 80 milhões desde a criação. Ativas por mês eram 1,8 milhão em dezembro
  de 2025, de fonte fraca, e carteira não é pessoa (seção 2.4).
- "A Polymarket foi de 1,9 para 4,6 bilhões por mês em dez meses." Na fonte: 1,88 bilhão em novembro de 2025 e 4,63
  bilhões em setembro de 2026. As taxas dela foram de zero em 2025 a 93,6 milhões em setembro de 2026 (FATO
  SECUNDÁRIO, DefiLlama).

### 2.2 O tamanho do setor e as duas réguas

Os números do setor parecem se contradizer de uma fonte para outra, porque há duas formas de medir. Nos líderes, o
usuário compra contratos que pagam 1 dólar se o resultado se confirmar. **Valor de face** soma cada contrato a 1
dólar, tenha custado o que for. **Dólares pagos** soma o que as pessoas de fato desembolsaram. Um pote mede
dinheiro depositado. Por isso este documento só usa dólares pagos.

| Medida | Valor | Data | Etiqueta e fonte |
|---|---|---|---|
| Setor inteiro, em dólares pagos | 21,7 bilhões em 30 dias | 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate |
| Setor inteiro, em valor de face | 81,8 bilhões em 30 dias | 4/set a 3/out/2026 | FATO SECUNDÁRIO, DefiRate |
| Kalshi, em dólares pagos | 13,7 bilhões em 30 dias | até 3/out/2026 | FATO SECUNDÁRIO, DefiLlama; a régua é inferência |
| Polymarket, em dólares pagos | 4,63 bilhões no mês | set/2026 | FATO SECUNDÁRIO, DefiLlama |
| Fatia da Kalshi no volume semanal | 77% | fim de set/2026 | FATO SECUNDÁRIO, Artemis, via Crypto Economy |
| Peso dos esportes no volume do setor | 62% | abr/2026 | FATO SECUNDÁRIO, Bernstein |

O setor é grande, novo e concentrado: uma empresa tem três quartos do volume, e quase dois terços são esportes.
Cobrar taxa também é novo: a Polymarket não cobrou nada em 2025.

Três sinais de alerta, que o pitch não mostra e o plano mantém. Cerca de 25% da atividade histórica da Polymarket
foi negociação artificial, segundo um estudo da Universidade Columbia (FATO SECUNDÁRIO, via Sacra, 2026). O
interesse de busca por mercados de previsão caiu 83% desde o pico da Copa de 2026 (FATO SECUNDÁRIO, The Defiant,
2026). E vários países bloquearam plataformas do setor; o Brasil bloqueou 27 sites em abril de 2026 (FATO
SECUNDÁRIO, imprensa, abr/2026).

### 2.3 O que os entrantes recentes alcançaram

| Quem | O que tinha a favor | O que alcançou | Etiqueta e fonte |
|---|---|---|---|
| World, dentro da Phantom | Uma carteira com mais de 20 milhões de usuários declarados | Em milhões: 1,14 em jun/2026; 13,22 em julho; 22,20 em agosto; 15,44 em setembro | FATO SECUNDÁRIO, DefiLlama, set/2026 |
| Contratos da Kalshi em Solana, por Jupiter e DFlow | A marca da líder | 28,6 milhões em cerca de três semanas, com cerca de 21 mil carteiras; 98% do volume da DFlow veio da Phantom | FATO SECUNDÁRIO, Step Data, jan/2026 |
| Limitless, na rede Base | Cerca de 17 milhões captados, token próprio, pontos e criação aberta | 250,9 milhões em mai/2026; 10,75 milhões em set/2026 | FATO SECUNDÁRIO, DefiLlama, set/2026 |
| Opinion e Myriad | Campanhas de pontos por volume | Quedas de 80,7% e de 93,8% do primeiro para o segundo trimestre de 2026 | FATO SECUNDÁRIO, Predictefy, 2026 |
| Melee, em Solana | 3,5 milhões captados; também usa pote | 49.247 pessoas na fila de espera; sem dinheiro real até 4/out/2026 | FATO, site do Melee; o estado é FATO SECUNDÁRIO |
| PNP, em Solana | Qualquer pessoa cria um mercado em segundos | 206 transações em seis meses; nenhuma depois de 17/set/2026 | FATO, leitura da rede, 4/out/2026 |

Três leituras, todas INFERÊNCIA sobre a tabela.

1. **Quem decide o volume é a distribuição.** Em Solana, ela passa pela carteira: 98% do volume de um dos canais
   da Kalshi veio de dentro da Phantom.
2. **Volume comprado com incentivo vai embora.** Três plataformas perderam de 80% a 96% do volume em poucos meses,
   depois de campanhas de pontos e de token. É o que a fala do pitch resume em "Volume comprado vai embora."
3. **Criação aberta, sozinha, não trouxe volume.** Limitless e PNP deixam qualquer pessoa criar mercados, e estão
   entre as que mais caíram ou menos andaram. Isso pesa contra a hipótese do slide de criadores, e a seção 3.2
   volta ao ponto.

### 2.4 Os três públicos em números

Os três públicos estão na Parte 1, seção 2.2: o projeto que patrocina, quem escolhe um lado e quem abre mercados.
O recorte que a pesquisa usou é o público de Solana e, dentro dele, o do pump.fun.

| Medida | Valor | Data | Etiqueta e fonte |
|---|---|---|---|
| Endereços ativos em Solana por semana | 27,1 milhões, sem filtro de robôs | Semana até 18/jan/2026 | FATO SECUNDÁRIO, Nansen, via BlockEden |
| pump.fun: carteiras únicas desde a criação | 80 milhões | jun/2026 | FATO SECUNDÁRIO, The Block |
| pump.fun: carteiras ativas por mês | Pico de 5,2 milhões em mai/2025; 1,8 milhão em dez/2025 | 2025 | FATO SECUNDÁRIO, fonte fraca |
| pump.fun: volume médio por dia | Cerca de 347 milhões de dólares | jun/2026 | FATO SECUNDÁRIO, The Block |
| pump.fun: receita por dia | 800 mil dólares, contra 4,8 milhões seis meses antes | jun/2026 | FATO SECUNDÁRIO, The Block |

O público é grande em número de carteiras, e a atividade caiu forte: a receita diária do pump.fun ficou em um sexto
do que era, e as carteiras ativas por mês, em um terço do pico (INFERÊNCIA sobre a tabela). Quantas pessoas reais
usam o pump.fun por dia não foi encontrado. Quanto cada carteira põe numa plataforma de previsão, e com que
frequência, também não.

**Cinco perfis, como hipótese.** Nenhuma entrevista foi feita. Os quatro primeiros são suposição da pesquisa da
v0.0.2; o quinto nasce do pitch e é suposição desta revisão (INFERÊNCIA, a conferir no beta).

| Perfil | O que busca | O que o afasta |
|---|---|---|
| Equipe de projeto | Divulgar uma meta e atrair quem segura o token | Pagar sem retorno que se possa medir |
| Comunidade de um token | Prova pública de que a meta foi cumprida | Meta que parece manipulável, taxa alta |
| Quem negocia memecoins | Giro rápido e a sensação de ter visto antes dos outros | Cadastro, prazo longo, mercado sem dinheiro do outro lado |
| Formador de opinião do X | Conteúdo que se compartilha | Risco de reputação, resultado contestável |
| Quem abre mercados | O 1% do pote e a autoria de um mercado que circula | Pote vazio, que rende menos que os 0,02 SOL; lista curta de tipos |

**O que une esse público** (INFERÊNCIA da pesquisa): preço de cripto em prazo curto e eventos de grande atenção.
Fatos de projeto de token, como queima ou trava de liquidez, não aparecem como categoria relevante em plataforma
nenhuma. O preço de ativo grande é o único tipo com demanda conhecida, e é por ele que o volume deve começar. Os
fatos de token são o que o pitch vende ao projeto, mas não se pode contar com eles como fonte principal de volume
antes de ver dinheiro de verdade.

### 2.5 A demanda não foi demonstrada: três testes

Dito sem rodeio: ninguém mostrou que o público web3 quer entrar em mercados sobre fatos lidos da rede, nem que
projetos pagam para ter um, nem que terceiros abrem mercados bons. Não há mercado parecido aberto em lugar nenhum,
não há entrevista e não há um dia de uso. O plano inteiro depende dessas três hipóteses. Cada uma tem um teste, e
os três custam pouco.

**Teste 1: o beta na devnet, com pontuação.** **Decisão.** "vamos montar inteiramente na devnet inicialmente". O
produto abre com mercados reais e resolução real, com USDC de teste, e quem acerta ganha pontos. O Melee fez isso e
juntou 49.247 pessoas numa fila (FATO, site do Melee, 4/out/2026). O beta mede quantas carteiras aparecem sem mídia
paga, quantas voltam em 30 dias, quais tipos recebem entradas nos dois lados e quantos potes terminam de um lado
só. O ponto vai para quem acerta, e não para quem movimenta mais: é a diferença entre este beta e as campanhas de
pontos que o pitch recusa. O limite do teste: dinheiro de teste não prova que a pessoa arriscaria dinheiro de
verdade.

**Teste 2: os parceiros.** Os 20 a 30 projetos convidados testam se projetos querem mercados sobre as próprias
metas. Mede-se quantos aceitam, quantos publicam o combinado, quantas carteiras cada publicação traz e quantas
entram. No fim, uma pergunta direta a cada parceiro: pagaria os 500 dólares? Se nenhum pagaria, o patrocínio como
receita continua sendo hipótese.

**Teste 3: os mercados abertos por terceiros.** É o teste novo. Mede-se quantos mercados quem não é da equipe
abre, quantos deles recebem entradas nos dois lados, quantos terminam de um lado só ou vazios, e quanto do volume
vem deles. Essa última medida é a fração que a seção 5.4 chama de `s`.

**Proposta, aguardando decisão.** Escrever, antes de o beta abrir, o que conta como sinal bom e como sinal ruim.
As réguas propostas para os dois primeiros testes são as da v0.0.2: menos de 10% das carteiras voltando em 30 dias
é sinal ruim, e de 20% a 35% é razoável; mais de 40% dos potes terminando de um lado só é sinal ruim. Para o
terceiro teste não há régua de referência; ela precisa ser escolhida antes do lançamento.

## 3. Concorrência

### 3.1 Os cinco concorrentes, lado a lado

**Decisão.** Para o fundador, "qualquer empresa de mercado de predição é concorrente direto, porém cada qual com
os seus diferenciais". A pesquisa levantou vinte nomes e olhou cinco de perto: o Melee e o PNP, os mais parecidos;
a Polymarket, a maior marca no público de cripto; o World, a maior distribuição dentro de Solana; e a Limitless,
referência de taxas publicadas e de token próprio. Os três do slide do problema estão entre eles. A Kalshi fica
fora: é a maior do setor, mas é uma bolsa regulada nos Estados Unidos, com cadastro completo.

Três termos para ler a tabela. **Livro de ordens** é uma lista de ofertas de compra e de venda. **Formador de
mercado automático** é um programa com uma fórmula que faz o papel da outra parte. **Curva** é uma fórmula em que
o preço sobe conforme entra dinheiro. Regras e fórmulas são FATO; volumes e falhas são FATO SECUNDÁRIO; médias de
taxa e quedas em percentual são INFERÊNCIA (documentação de cada plataforma, DefiLlama e leitura da rede, set e
out/2026).

| | Mecanismo | Quem abre os mercados | Como resolve | Taxa | Escala | Ponto fraco |
|---|---|---|---|---|---|---|
| Polymarket | Livro de ordens | A equipe, com sugestões do público | Oráculo UMA; se alguém contesta, detentores de um token votam, em 4 a 6 dias | Fórmula sobre o preço; na média, 2,0% dos dólares pagos | 4,63 bilhões em set/2026 | Resolução contestada e sem reembolso |
| World (Solana, na Phantom) | Formadores de mercado acionados por um roteador | Só a chave da empresa | A chave da empresa grava o resultado | De 2,5% a 5% do valor pago nos exemplos, mais a margem de quem forma o preço | 15,44 milhões em set/2026 | Uma chave decide tudo; 29,5 horas fora do ar no lançamento |
| Limitless (Base) | Livro de ordens e formador automático | A equipe e qualquer usuário | Oráculos de preço, provedores esportivos e, em parte, a equipe | De 0,40% a 3,00%; na média, 1,9% | 10,75 milhões em set/2026; eram 250,9 em maio | O volume caiu 96% em quatro meses |
| Melee (Solana) | Pote com curva e piso de retorno | Meta: qualquer pessoa | Pessoas: o criador ou a equipe | Não publicada | Sem dinheiro real; 49.247 na fila | Ainda não lançou; regra de preço difícil de explicar |
| PNP (Solana) | Curva; também pote entre duas partes | Qualquer pessoa | Dois modelos de linguagem; o criador pode nomear o juiz | 1% por negociação; 30% disso para quem criou | 206 transações em seis meses | Quase parado |
| **Brot Markets** | Pote | Qualquer carteira, dentro dos tipos que o programa lê | Leitura de uma conta da rede, com janela de 6 horas | 10% do lado perdedor; na média, 3,70% do volume (INFERÊNCIA). Mais 1% do pote para quem abriu | Devnet, sem usuários | Sem público, sem canal de distribuição, demanda não demonstrada |

### 3.2 O que cada um ensina

**Polymarket: a escala e o problema da resolução.** Mais de 1.150 mercados foram a arbitragem em 2026 até maio, e
em cerca de 1 de cada 5 disputas um votante tinha posição no mercado que julgava (FATO SECUNDÁRIO, Wall Street
Journal, via Finance Magnates, mai/2026). Um mercado de 7 milhões de dólares resolveu SIM sem o fato ter ocorrido,
e não houve reembolso (FATO SECUNDÁRIO, CoinDesk, mar/2025). É o caso que abre o slide do problema. Mas a
Polymarket tem o que nos falta: marca, dinheiro dos dois lados, qualquer assunto e saída a qualquer hora.

**World: a experiência vence a desconfiança.** Uma chave da empresa cria os mercados e grava o resultado, sem
prova (FATO SECUNDÁRIO, Chainstack Labs, 11/set/2026). Mesmo assim o público usa, porque é fácil: está dentro da
carteira e o pagamento chega sozinho. A lição é incômoda para um pitch que vende prova: resultado conferível,
sozinho, não traz ninguém; precisa vir junto com a mesma facilidade.

**Limitless: o aviso sobre criação aberta e incentivos.** Cerca de 17 milhões de dólares captados, token, pontos e
criação aberta de mercados não seguraram o volume: ele caiu 96% de maio a setembro de 2026. A causa da queda não
foi encontrada. O que a Limitless faz bem é publicar tudo: taxas, regras de indicação e política de reembolso
(FATO, documentação, out/2026).

**Melee: o mais parecido ainda não largou.** Roda em Solana, usa pote e captou 3,5 milhões de dólares (FATO
SECUNDÁRIO, imprensa de Solana, set/2025). O beta roda na rede de testes, com pontuação. Ele tem caixa,
investidores e fila; a janela só vale alguma coisa se a demanda existir.

**PNP: o aviso mais direto.** Qualquer pessoa cria um mercado, e quem cria recebe 30% da taxa. É o desenho mais
próximo do slide de criadores, e está quase parado: 206 transações em seis meses. A v0.0.2 dizia que a criação
aberta do PNP era "o oposto do que propomos" e deixava guardada a ideia de pagar o criador. O pitch adotou as
duas. O que passa a nos separar do PNP é uma coisa só: lá dois modelos de linguagem decidem o resultado; aqui o
programa lê uma conta.

A conclusão das duas últimas lições, sem suavizar: **criação aberta não é motor de crescimento provado.** O plano a
trata como hipótese a testar (seção 2.5), e não como fonte de volume nas contas.

### 3.3 Onde ficamos e o que copiamos

Cinco conclusões.

1. **O diferencial em confiança é real.** "O programa lê a conta e qualquer um confere" responde à queixa mais
   documentada do setor. Nenhum dos cinco resolve por leitura direta de uma conta da rede (INFERÊNCIA sobre os
   fatos lidos, out/2026). Fora dos cinco, o PancakeSwap Prediction e o Hyperliquid talvez resolvam assim; a
   pesquisa não verificou.
2. **É um nicho.** Esporte, política e economia, a maior parte do volume do setor, não se leem numa conta da
   Solana. A fatia do volume atual que caberia na nossa regra não foi encontrada, e é pequena.
3. **Não é escudo contra manipulação.** Na Polymarket, 821 contas ganharam 8,2 milhões de dólares em mercados de
   Bitcoin de 5 minutos, em momentos de liquidação provavelmente manipulados (FATO SECUNDÁRIO, CoinDesk, ago/2026).
   Mercado decidido por número pode ser empurrado por quem entra nele. Na v0.0.2 o que protegia era a equipe
   escolher as metas. Agora são as regras no programa (Parte 1, seção 4.2).
4. **Pode ser copiado.** O World já tem a parte automática pronta. Trocar a chave por leitura da rede, nos mercados
   de cripto, é trabalho de engenharia. A defesa possível é chegar primeiro e ter comunidade.
5. **O patrocínio é só nosso, para o bem e para o mal.** A fala diz "a parte que ninguém está fazendo". O que a
   pesquisa sustenta é menos: nenhum dos cinco estudados vende patrocínio de mercado com selo, em busca limitada
   (INFERÊNCIA). É diferencial, e é a razão de não existir preço de referência.

**Onde não somos diferentes.** A taxa fica dentro da faixa do setor, de 1,9% a 5% dos dólares pagos (INFERÊNCIA),
antes de somar a parte de quem abriu. A criação aberta é o que fazem PNP e Limitless. Entrar só com a carteira
também. O pote é o mecanismo do Melee e do PancakeSwap Prediction. **Onde ficamos atrás:** não há saída antecipada,
e os concorrentes têm público.

**Decisão: o que copiamos.** As cinco primeiras linhas são da v0.0.2. A sexta veio com o pitch.

| O que | De quem | Como fica no Brot |
|---|---|---|
| Página de taxas com exemplo numérico | Limitless | Uma página pública com a conta do pote, já descontadas a taxa e a parte de quem abriu |
| Política de reembolso escrita | Limitless | Mercado anulado devolve tudo, sem taxa |
| Pagamento automático | World | O prêmio chega sozinho à carteira, sem botão de resgate |
| Indicação com parte da taxa | Polymarket | 20% da taxa por 90 dias (seção 4.5) |
| Beta com pontuação antes do dinheiro real | Melee | Na devnet, com pontos por acerto |
| Criação aberta, com uma parte para quem cria | PNP, Limitless | Qualquer carteira abre por 0,02 SOL e fica com 1% do pote, só nos tipos que o programa lê |

Uma coisa não copiamos: pontuar volume. Opinion e Myriad premiaram quem movimentava mais, e o volume foi embora
quando o prêmio acabou.

## 4. Como a empresa ganha dinheiro

### 4.1 As quatro receitas

O slide de receita diz "We only earn from the losing side". Vale para a primeira linha da tabela, que é a única
com peso comprovado no setor: a taxa é toda a receita da Polymarket medida na rede em 2026 (FATO SECUNDÁRIO,
DefiLlama, 2026). As outras três existem e são menores.

| Receita | Regra | Marca | Tem número no modelo? |
|---|---|---|---|
| Taxa do pote | 10% do lado perdedor | Decisão, confirmada pelo pitch | Sim: 3,70% do volume, na média |
| Taxa de marketing | 10% do valor do patrocínio | Decisão do pitch | Sim, pequena (seção 4.3) |
| Taxa de abertura | 0,02 SOL por mercado aberto | Decisão do pitch | Não: faltam o número de mercados e o preço do SOL (seção 4.4) |
| 1% do pote de um lado só | Pago por todos, menos pela primeira carteira | Decisão | Não: fora do modelo desde a v0.0.2 |

E há uma saída nova, que pode ou não ser custo do Brot: o 1% do pote para quem abriu o mercado (seção 4.4).

### 4.2 A taxa e o destino dela

**Quanto a taxa rende depende do pote.** Num pote de 1.000 dólares dividido meio a meio, a taxa é de 50, ou 5% do
pote. Num pote de 900 contra 100, é de 10 se o favorito ganha e de 90 se o lado menor ganha; se o favorito ganhar
nove vezes em dez, a média é 1,8% do pote. A resposta pronta do pitch cita dois destes valores: 5% do pote no meio
a meio e 1% quando o favorito vence.

Para o negócio, o número que importa é a taxa média. Ela depende da mistura de mercados, e ninguém mediu essa
mistura. A tabela mostra três misturas, com 1 milhão de USDC de volume no mês (INFERÊNCIA; as misturas são
hipótese).

| Mistura | Taxa média | Taxa no mês |
|---|---|---|
| Maioria equilibrada (70% dos potes entre 50% e 60%; 30% entre 80% e 90%) | 4,18% | 41.800 |
| Meio a meio (base) | 3,70% | 37.000 |
| Maioria com favorito claro (30% equilibrados; 70% entre 85% e 95%) | 2,70% | 26.950 |

Todas as tabelas deste documento usam 3,70%. É a premissa mais frágil do modelo. A fala do pitch conta com a linha
de cima: quem abre mercados procuraria "a pergunta polêmica", a que divide. Se for assim, a média sobe para 4,18%. Se
a criação aberta trouxer mercados de resultado óbvio, vai para o outro lado. Não há dado para escolher.

**O destino. Decisão.** "vamos dividir 25% da taxa para treasure e todos os demais 75% para a operação ... até
equilibrarmos as contas, coisa que pode ser de 5 a 12 meses, e mudarmos as regras internas." Tesouraria é a reserva
da empresa (seção 4.6). Operação é o dinheiro que paga as contas do mês.

O caminho de cada 1.000 dólares de volume, com a taxa média de 3,70% (INFERÊNCIA):

| Destino | Valor |
|---|---|
| Volta a quem acertou | 963,00 |
| Tesouraria (25% da taxa) | 9,25 |
| Operação (75% da taxa) | 27,75 |
| Da parte da operação, o que paga a indicação (suposição do modelo) | 1,39 |
| Da parte da operação, o que sobra para pagar as contas | 26,36 |

Em mercado aberto por um terceiro, com o pitch ao pé da letra, a primeira linha perde 10 dólares, que vão para
quem abriu: 963 − 10 = 953. As outras linhas não mudam.

**A pilha sobre a taxa.** Quatro coisas saem, ou podem sair, da mesma taxa: a tesouraria (25%), a indicação (20%
da taxa do indicado), a parte de quem abriu (se o desenho escolhido for o C) e, se um dia existir, o desconto do
token (Parte 3). Falta dizer em que ordem. **Proposta, aguardando decisão:** escrever a ordem junto com a decisão
sobre o 1% (Parte 4, seção 4.6).

### 4.3 Patrocínio

**Decisão do pitch.** "From $500. 90% becomes the prize pool. 10% is a marketing fee." O produto está na Parte 1,
seção 3.7. Aqui fica a conta: `prêmio = 0,90 × valor pago` e `Brot = 0,10 × valor pago`.

A última coluna diz quanto volume renderia o mesmo à operação. Ela divide a parte do Brot por 2,63625%, que é o que
a operação recebe de cada dólar de volume (`3,70% × 75% × 95%`).

| Valor pago | Prêmio, antes e agora | Brot, antes e agora | Volume que rende o mesmo, antes e agora |
|---|---|---|---|
| 500 | 350 e 450 | 150 e 50 | 5.690 e 1.897 |
| 1.500 | 1.050 e 1.350 | 450 e 150 | 17.070 e 5.690 |
| 5.000 | 3.500 e 4.500 | 1.500 e 500 | 56.899 e 18.966 |

Só o valor de 500 está no pitch. Os de 1.500 e 5.000 ficam como tamanhos supostos (Parte 1, seção 3.7).

Três leituras.

- **O patrocínio deixou de pesar nas contas.** Para pagar um mês de custo só com patrocínios de 500 eram precisos
  36,7 (`5.500 ÷ 150`). Agora são 110 (`5.500 ÷ 50`). Um patrocínio de 500 vale para a operação o mesmo que 1.897
  dólares de volume.
- **O projeto recebe mais pelo que paga.** De cada 500 dólares, 450 viram prêmio para a comunidade dele. É o
  argumento de venda do slide, e é um argumento melhor que o da v0.0.2.
- **Os 10% vão inteiros para a operação**, até o equilíbrio, sem parte para a tesouraria. **Decisão** de
  5/10/2026 ("concordo"), tomada quando a parte da plataforma era maior; a regra de destino continua.

**O que não existe: precedente.** O programa mais parecido é o da Polymarket, em que qualquer pessoa deposita
dinheiro para premiar um mercado. Lá o patrocinador não recebe nada em troca, e a mediana é de 3 dólares por dia
por mercado (FATO, regras; FATO SECUNDÁRIO, valores, Vultax, set/2026). Ninguém foi encontrado vendendo patrocínio
de mercado com selo e destaque.

**O preço.** No DexScreener, o site em que esse público acompanha preços, o anúncio de um token custa "a partir de
US$ 299" (FATO, página oficial), e a barra de tendências, "a partir de US$ 2.000" (FATO SECUNDÁRIO). O piso de 500
dólares está dentro do que equipes de token já pagam por destaque. A diferença é que esses sites vendem uma
audiência de milhões, e o Brot começa sem audiência. O que o patrocinador compra de concreto, no começo, é o prêmio
à vista dentro do pote, coisa que nenhum site de anúncio vende.

Por tudo isso, as projeções contam muito pouco com o patrocínio pago (seção 5.1).

### 4.4 Quem abre: a taxa de abertura e o 1%

**A taxa de abertura, pelo lado do caixa. Decisão do pitch.** "0.02 SOL to open a market." A conta da receita é
`receita do mês = N × (0,02 × PREÇO_SOL − ALUGUEL)`. `N` é o número de mercados abertos no mês. `PREÇO_SOL` é o
preço do SOL em dólares. `ALUGUEL` é o depósito que a Solana exige para manter as contas do mercado abertas.
Nenhum dos três está medido. A tabela abaixo é **ilustração, e não fato**: usa três preços supostos e ignora o
aluguel.

| `PREÇO_SOL` suposto | Por mercado | 100 mercados no mês | Mercados para pagar sozinhos os 5.500 |
|---|---|---|---|
| 100 | 2 | 200 | 2.750 |
| 200 | 4 | 400 | 1.375 |
| 300 | 6 | 600 | 917 |

A leitura: a taxa de abertura é barreira, e não negócio. Mesmo com o SOL a 300 dólares, seriam precisos 917
mercados abertos num mês para ela pagar o custo sozinha. O que ela faz bem é encarecer o lixo: abrir 1.000 mercados
sem sentido custa 20 SOL. Do aluguel sabe-se uma parte: o cofre de USDC de cada mercado pede cerca de 0,002 SOL,
10% da taxa (FATO, v0.0.2, P4 §4.5). O da conta do mercado não foi medido. Para onde vão os 0,02 SOL o pitch não
diz; a proposta está na Parte 1, seção 4.1.

**O 1% de quem abriu, pelo lado do caixa.** A Parte 1, seção 3.4, mostra os três desenhos. Para as contas da
empresa, eles se dividem em dois grupos.

- **Desenhos A e B: não custa nada ao Brot.** Quem paga é quem acerta. A taxa média continua em 3,70% e o ponto de
  equilíbrio não muda. O custo aparece em outro lugar: o pote meio a meio passa a perder 6%, acima da faixa do
  setor, e o exemplo do slide de receita deixa de fechar.
- **Desenho C: custa cerca de 1 ponto do pote.** A receita esperada cai de 5,0% para 4,0% do pote no meio a meio e
  de 1,8% para 0,8% no 90 a 10. Com todo o volume em mercados abertos por terceiros, a taxa média cai de 3,70% para
  2,70% na mistura de base, de 4,18% para 3,18% na equilibrada e de 2,70% para 1,86% na de favorito claro. Na
  mistura de base, a perda chega a 27% da taxa.

Como nem todo o volume virá de mercados de terceiros, a conta do desenho C depende de uma fração, `s`: a parte do
volume que está nesses mercados. Na mistura de base, `taxa média = 3,70% − s × 1,00%`. A fração `s` é mais um
número que ninguém tem; o terceiro teste da seção 2.5 serve para medi-la.

**O que quem abre ganha.** O 1% do pote paga os 0,02 SOL quando o pote passa do equivalente a 2 SOL. Em dólares,
isso depende do `PREÇO_SOL`, e por isso não há valor aqui. Para comparar com o único precedente no nosso material:
o PNP dá a quem cria 30% de uma taxa de 1% por negociação.

### 4.5 Parceiros e indicação

**Os parceiros de lançamento.** **Decisão**, confirmada pelo pitch: de 20 a 30 projetos ganham um mercado grátis,
em troca de duas publicações (Parte 1, seção 3.8). Não há parceiro fechado até a data deste documento.

A conta de quanto se abre mão ficou menor. Se os 30 parceiros pagassem 500 dólares, seriam 15.000, dos quais 1.500
ficariam com a plataforma (`30 × 500 × 10%`). Na v0.0.2 eram 4.500. Nos dois casos, menos que um mês de custo. Ao
abrir mão desse valor, o programa busca três coisas que ele não compraria: público com motivo para entrar,
mercados sobre metas reais e prova, isto é, trinta mercados resolvidos sem erro com nomes que o público conhece. A
consequência assumida continua: no primeiro ano, os parceiros são aquisição de público, e não receita. O parceiro
gratuito também não traz prêmio para o pote: aquele mercado depende só das entradas.

**A indicação.** **Decisão**, confirmada pelo pitch: quem indica recebe 20% da taxa do indicado por 90 dias; o
indicado recebe de volta a taxa dos primeiros 50 USDC, com teto de 5 USDC, depois de completar 250 (Parte 1, seção
3.9).

A conta, com a taxa média de 3,70% (INFERÊNCIA): o indicado entra com 1.000 dólares em 90 dias, e a taxa descontada
dos ganhos dele soma 37. Quem indicou recebe 7,40. A devolução ao indicado é, na média, de 1,85. O Brot fica com
27,75, ou 75% do que teria sem a indicação. Indicação é custo para trazer gente, e não receita. No modelo, ela
consome 5% da parte da operação, supondo que um quarto do volume venha de indicados ainda dentro dos 90 dias. Se
for metade do volume, o custo dobra. A devolução não está nesses 5%.

Uma comparação: a Polymarket paga 10% da taxa dos indicados diretos e 5% dos indiretos, por 30 dias, e só a quem
já negociou 10.000 dólares (FATO, documentação). A regra daqui é mais generosa. O risco que sobra é a pessoa
indicar a si mesma; o fundador aceitou o risco, que no pior caso custa 0,74% do volume.

### 4.6 Em espera: fundo de prêmios, tesouraria, recompra e fase 2

O pitch não fala de nenhum dos quatro. As decisões de 5/10/2026 continuam valendo, e os detalhes ficam na v0.0.2,
P2 §4.5 a §4.8.

**Fundo de prêmios.** É uma reserva do Brot para pôr prêmio dentro dos potes, porque pote vazio não atrai ninguém.
**Decisão.** "vamos prometer essa feature no futuro": o fundo "poderá ser criada a partir do mês 10", e só recebe a
sobra da operação, até o limite de 25% da taxa. No cenário razoável refeito, ele soma 65.755 dólares até o mês 24;
eram 66.055 (INFERÊNCIA). O risco: para recuperar 1 dólar em taxa, o prêmio precisa trazer 27 dólares de volume
novo (`1 ÷ 3,70%`), e ninguém publicou se isso acontece. As regras de gasto precisam estar escritas antes do mês
10.

**Tesouraria.** É a reserva da empresa, comprada com 25% de toda a taxa. **Decisão.** Ela "começa desde o dia
zero, mas depois do mês 12 a gente repensa". No cenário razoável, soma 18.038 dólares no mês 12 e 78.394 no mês 24
(INFERÊNCIA, a preço de compra); esses dois números não mudam, porque a taxa do pote não mudou. O ponto que
continua de pé: a base é a taxa bruta, antes de qualquer custo, e no mês 12 a empresa teria essa reserva com o
caixa ainda negativo. Por isso a tesouraria não pode ser a reserva que paga as contas num mês ruim. A guarda está
na Parte 4, seção 4.7.

**Recompra.** É a empresa comprar o próprio token no mercado e destruí-lo. **Decisão.** "só faríamos isso com
caixa da empresa a partir do mês 13, não antes". Está fora das projeções. A resposta pronta do pitch vai mais
longe: "a gente não promete preço nem recompra". Nenhum texto do produto promete recompra, preço ou retorno.

**Fase 2.** As outras formas de receita que os líderes usam ficam na lista da v0.0.2, e a maior é também a mais
distante: esportes são 62% do volume do setor (FATO SECUNDÁRIO, Bernstein, abr/2026), mas resultado de jogo não
nasce na rede, e é a categoria que as regras brasileiras citam pelo nome.

## 5. Projeções

### 5.1 Premissas

Tudo neste capítulo é INFERÊNCIA. O produto não tem um dia de uso com dinheiro real, e não existe dado medido de
volume, de carteiras nem de receita. As tabelas servem para comparar caminhos e ver o que muda quando uma premissa
muda. Não são previsão, e o cenário razoável não é promessa. O modelo da v0.0.2 foi remontado por script na revisão
de impacto, reproduziu as tabelas publicadas e só então recebeu as regras novas. Ele não inclui impostos, mídia
paga nem venda de token.

| Premissa | Valor | Origem |
|---|---|---|
| Taxa do pote | 10% do lado perdedor; na média, 3,70% do volume | A forma é decisão. A média é a premissa mais frágil: vai de 2,70% a 4,18% |
| Destino da taxa | 25% para a tesouraria; 75% para a operação | Decisão |
| Parte de quem abriu | 1% do pote, fora da taxa do Brot (desenhos A ou B) | Decisão do pitch, lida ao pé da letra. O desenho C está na seção 5.4 |
| Patrocínio pago | A parte do Brot é de 10%. As quantidades são as da v0.0.2: nenhuma no ruim; no razoável, um de 500 por mês do mês 7 ao 12 e, no segundo ano, dois de 500 e um de 1.500 por mês | A divisão é decisão do pitch. As quantidades são suposição |
| Taxa de abertura | Fora do modelo | Faltam `N` e `PREÇO_SOL` |
| Fração `s` do volume em mercados de terceiros | Sem valor | Ninguém mediu |
| Custo da indicação | 5% da taxa que vai para a operação | Suposição: um quarto do volume vem de indicados nos primeiros 90 dias |
| Custo mensal | 5.500 dólares, desde o primeiro mês com dinheiro real | Decisão |
| Gasto antes do dinheiro real | 7.500 dólares: 2.000 da abertura da empresa e 5.500 de um mês de devnet. Auditoria e avaliação jurídica sem custo | Informado pelo fundador |
| Trajetória de volume | A dos três cenários da v0.0.2, sem mudança | Suposição herdada. O pitch não traz dado para mudá-la |
| Fundo de prêmios | A partir do mês 10: o menor entre 25% da taxa e a sobra da operação | Decisão |
| Recompra | Fora do modelo | Decisão |

### 5.2 Ponto de equilíbrio

Ponto de equilíbrio é o volume mensal em que a parte da operação paga os 5.500 dólares de custo. A conta é
`5.500 ÷ (taxa média × 75% × 95%)`: a operação recebe 75% da taxa, menos os 5% da indicação.

| Caso | Taxa média | Volume de equilíbrio por mês |
|---|---|---|
| **Mistura meio a meio (base)** | 3,70% | **208.630** |
| Maioria equilibrada | 4,18% | 184.672 |
| Maioria com favorito claro | 2,70% | 285.900 |
| Desenho C, com metade do volume em mercados de terceiros | 3,20% | 241.228 |
| Desenho C, com todo o volume em mercados de terceiros | 2,70% | 285.900 |

As três primeiras linhas são as da v0.0.2 e valem para o pitch ao pé da letra. As duas últimas mostram o preço de
tirar o 1% da taxa do Brot: o equilíbrio sobe de 208.630 para até 285.900 dólares por mês.

**O que 208.630 quer dizer.** É 1,4% dos 15,44 milhões que o World fez em setembro de 2026. Em carteiras, se cada
uma puser 200 dólares por mês, que é a suposição do cenário razoável, são cerca de 1.040 carteiras ativas.

### 5.3 Os três cenários

**Como ler.** **Operação** é a parte da taxa que paga as contas, já descontada a indicação. **Patrocínio** é a
parte do Brot, agora 10% do valor pago. Como 10% é um terço de 30%, cada valor dessa coluna é o da v0.0.2 dividido
por três. **Caixa** é a soma dos resultados desde antes do lançamento, partindo de −7.500. A tesouraria não entra
no caixa: é reserva à parte.

A revisão de impacto refez o modelo com o patrocínio a 10% e publicou os totais de cada cenário. O resultado e o
caixa de cada mês intermediário não foram publicados e não foram calculados aqui. Por isso as tabelas do razoável
e do otimista trazem as colunas que não mudaram e a do patrocínio, e os totais vêm no texto.

**Cenário ruim.** O volume chega a 45 mil por mês no mês 6, fica aí e cai no segundo ano. Não há patrocínio pago, e
por isso nada muda em relação à v0.0.2.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Custo | Resultado | Caixa |
|---|---|---|---|---|---|---|---|
| 6 | 45.000 | 1.665 | 416 | 1.186 | 5.500 | −4.314 | −36.348 |
| 12 | 45.000 | 1.665 | 416 | 1.186 | 5.500 | −4.314 | −62.230 |
| 18 | 38.750 | 1.434 | 358 | 1.022 | 5.500 | −4.478 | −88.804 |
| 24 | 31.250 | 1.156 | 289 | 824 | 5.500 | −4.676 | −116.565 |

Este cenário não se paga. A operação recebe no máximo 1.186 dólares por mês contra um custo de 5.500. O caixa chega
a −116.565 no mês 24 e continua caindo. Nenhum ajuste de regra conserta isso: só mais volume.

**Cenário razoável.** O volume chega a 300 mil por mês no mês 12 e a 712 mil no mês 24. É o retrato de um nicho
pequeno e fiel, sem distribuição paga.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio, antes e agora | Custo |
|---|---|---|---|---|---|---|
| 6 | 150.000 | 5.550 | 1.388 | 3.954 | 0 e 0 | 5.500 |
| 12 | 300.000 | 11.100 | 2.775 | 7.909 | 150 e 50 | 5.500 |
| 18 | 487.500 | 18.038 | 4.509 | 12.852 | 750 e 250 | 5.500 |
| 24 | 712.500 | 26.363 | 6.591 | 18.783 | 750 e 250 | 5.500 |

Os totais refeitos: a operação se paga no **mês 9**, como antes. O ponto mais baixo do caixa é **−27.674**; eram
−27.474. O caixa no mês 24 é de **21.467**; eram 27.767. A parte do Brot nos patrocínios soma 3.300 em 24 meses;
eram 9.900. O corte custa 6.300 dólares de caixa em 24 meses. O fundo de prêmios soma 65.755 até o mês 24, e a
tesouraria, 78.394.

**Cenário otimista.** O volume chega a 1,5 milhão por mês no mês 12 e a 4,7 milhões no mês 24. Depende de um canal
de distribuição, como a integração com uma carteira, que hoje não existe.

| Mês | Volume | Taxa | Tesouraria (25%) | Operação | Patrocínio, antes e agora | Custo |
|---|---|---|---|---|---|---|
| 6 | 750.000 | 27.750 | 6.938 | 19.772 | 150 e 50 | 5.500 |
| 12 | 1.500.000 | 55.500 | 13.875 | 39.544 | 750 e 250 | 5.500 |
| 18 | 2.958.333 | 109.458 | 27.365 | 77.989 | 1.400 e 467 | 5.500 |
| 24 | 4.708.333 | 174.208 | 43.552 | 124.123 | 1.400 e 467 | 5.500 |

Os totais refeitos: o caixa no mês 24 é de **783.963**; eram 798.462. A parte do Brot nos patrocínios soma 7.250
em 24 meses; eram 21.750. O corte custa 14.499 dólares de caixa. Na v0.0.2 a operação se pagava no mês 2 e o ponto
mais baixo do caixa era −9.705, no mês 1; como o patrocínio pago desse cenário só começa no mês 4, esses dois
números não mudam (INFERÊNCIA, conferida por script na revisão final do plano). Um aviso: o custo fica em 5.500
nos 24 meses, o que não é realista com esse volume. É a conta sem contratar ninguém.

### 5.4 Se uma premissa mudar

Três premissas mexem no resultado mais que todas as outras: a mistura de mercados, de onde sai o 1% e quanto do
volume vem de mercados de terceiros. A tabela refaz o cenário razoável, com a mesma trajetória de volume
(INFERÊNCIA).

| Caso | Taxa média | Mês em que a operação se paga | Ponto mais baixo do caixa | Caixa no mês 24 |
|---|---|---|---|---|
| **Pitch ao pé da letra, mistura de base** | 3,70% | 9 | −27.674 | 21.467 |
| Pitch ao pé da letra, maioria equilibrada | 4,18% | 8 | −25.102 | 40.150 |
| Pitch ao pé da letra, maioria com favorito claro | 2,70% | 12 | −36.008 | −15.826 |
| Desenho C, metade do volume em mercados de terceiros (`s` = 50%) | 3,20% | 10 | −31.200 | 2.370 |
| Desenho C, todo o volume em mercados de terceiros (`s` = 100%) | 2,70% | 12 | −36.008 | −15.826 |

Três leituras.

- **A alavanca grande é de onde sai o 1%.** Tirá-lo da taxa do Brot, com todo o volume em mercados de terceiros,
  tem o mesmo efeito que a pior mistura de mercados: a operação só se paga no mês 12, e o caixa ainda está negativo
  no mês 24. Com metade do volume, o caixa do mês 24 cai de 21.467 para 2.370.
- **A mistura continua pesando tanto quanto antes.** Entre a pior e a melhor, o caixa do mês 24 vai de −15.826 a
  40.150, com o mesmo volume.
- **As duas coisas podem se somar.** O desenho C com maioria de favorito claro leva a taxa média a 1,86%. Esse
  cenário não foi rodado.

No otimista, o desenho C leva o caixa do mês 24 de 783.963 para 660.150 com metade do volume em mercados de
terceiros, e para 536.338 com todo ele. No ruim, de −116.565 para −119.664 e −122.763.

### 5.5 Capital, captação e critério de parada

Capital necessário é o dinheiro que precisa vir de fora da receita para a empresa atravessar o ponto mais baixo do
caixa.

| Cenário | Ponto mais baixo do caixa | Quando |
|---|---|---|
| Ruim | −116.565 | Mês 24, e continua caindo |
| Razoável | −27.674 | Mês 8, como na v0.0.2 (conferido por script na revisão final) |
| Otimista | −9.705 | Mês 1 (seção 5.3) |

Três coisas a pesar. Cada mês a mais de devnet soma 5.500 dólares a todas as linhas. Com maioria de favorito
claro, ou com o desenho C em todo o volume, o ponto mais baixo do razoável desce para −36.008. E quase todo o
buraco é a retirada mensal dos três sócios, 4.500 dos 5.500: se eles a adiarem, o razoável pede muito pouco.

**Decisão: a captação.** O fundador busca investimento "de USD50k nos primeiros 6 meses a USD 350k até o final do
primeiro ano", com a ressalva: "temos que trabalhar no bootstrap, sem depender de conseguirmos qualquer coisa".
Bootstrap é tocar a empresa com o dinheiro dos sócios e da própria receita. Essa captação cobre com folga os
cenários razoável e otimista. O ruim não se paga com capital nenhum: mais dinheiro só adia o fim.

**A lista de investidores.** Existe uma planilha com cerca de 50 mil investidores mapeados, para convite por
email. **Decisão.** O fundador a trata como lista de contatos de negócio: "não tem problema, pois são e-mails de
negócios, e não dados pessoais". A ressalva continua: endereço de email com nome de pessoa pode ser lido como dado
pessoal pela LGPD, a lei brasileira de proteção de dados. O convite leva opção de descadastro, e a lista não é
publicada nem compartilhada.

**Decisão: o critério de parada.** O fundador aceitou o critério como estava proposto: "ok". Se, aos 180 dias na
rede principal, o volume do mês for de até 45 mil dólares e menos de 10% das carteiras estiverem voltando, o
cenário é o ruim, e a empresa para ou muda de rumo. Parar no mês 6 limita a perda a 36.348 dólares. Seguir até o
mês 24 leva a 116.565. O critério fica escrito antes do lançamento, quando ainda é fácil ser frio. É a decisão que
limita a perda, e o pitch não a altera.

### 5.6 Metas de 90 dias e o que o modelo não sabe

As metas dos primeiros 90 dias com dinheiro real servem para saber cedo em qual cenário a empresa está.

| Medida | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume, somado | Até 45 mil | 150 mil | 750 mil ou mais |
| Volume no terceiro mês | 22.500 | 75.000 | 375.000 |
| Carteiras ativas no terceiro mês | 150 | 375 | 1.500 |
| Carteiras que entram de novo em 30 dias | Menos de 10% | 20% a 35% | Mais de 35% |
| Potes que terminam de um lado só | Mais de 40% | Cerca de 20% | Menos de 10% |
| Taxa arrecadada, a 3,70% do volume | 1.665 | 5.550 | 27.750 |
| Mercados abertos por quem não é da equipe | Régua a definir | Régua a definir | Régua a definir |

A linha que mais importa é a das carteiras que entram de novo. Volume alto com menos de 10% delas voltando é o
retrato que veio antes das quedas de 80% a 96% dos concorrentes. A última linha é nova e não tem número: nenhuma
fonte dá uma referência.

**O que o modelo não sabe.** A lista da v0.0.2 continua: quanto cada carteira põe por mês, quantas voltam, quantos
parceiros viram pagantes, quanto do volume vem por indicação, se a auditoria e a avaliação jurídica saem mesmo a
custo zero, e se o produto sai da devnet em um mês. O pitch acrescentou seis pontos que a revisão não pôde refazer:

1. **As trajetórias de volume.** O pitch afirma que criadores e parceiros trazem volume. Não há dado para mudar a
   curva.
2. **A receita da taxa de abertura.** Faltam `N` e `PREÇO_SOL`.
3. **A fração `s`** do volume em mercados de terceiros.
4. **A mistura de mercados com criação aberta.** Mercados divididos levariam a 4,18%; mercados de lixo, ao
   contrário.
5. **O 1% do pote de um lado só**, que já estava fora do modelo.
6. **O custo dos serviços com muitos mercados.** O modelo mantém "até 1.000" dólares de infraestrutura.

## 6. Entrada no mercado

### 6.1 Agora, lançamento, rede principal

O slide de crescimento traz o roteiro em três marcos, sem datas.

| Marco | No slide | O que quer dizer |
|---|---|---|
| Agora | "Devnet, test tokens." | O produto roda na rede de testes, com USDC de teste e pontos para quem acerta. Toda tela diz que é fase de testes |
| Lançamento | "Partner markets live." | Entram os mercados dos primeiros parceiros, cada um sobre a própria meta |
| Rede principal | "After an audit, a multisig and a cap." | Dinheiro real, depois de auditoria externa, carteira de várias assinaturas e teto para o total nos potes |

O plano não acrescenta data. A que existe é a da v0.0.2, e o fundador a deu como provável: "provavelmente vamos pra
mainnet já no início do mês 2". Os três critérios precisam caber nesse prazo; se não couberem, a data anda (Parte
4, seção 3.1). O primeiro mês na rede principal é o mês 1 das projeções.

### 6.2 Os quatro motores de crescimento

**Decisão do pitch.** O slide de crescimento lista quatro motores. A fala os resume: "A gente quer gente com
motivo pra entrar."

| Motor | No slide | Como funciona | O que custa | O que falta provar |
|---|---|---|---|---|
| Parceiros | "20–30 projects get one market free." | Cada projeto mostra o próprio mercado à comunidade dele | A taxa de marketing de que o Brot abre mão: até 1.500 dólares | Se a comunidade do parceiro entra, e se algum parceiro pagaria depois |
| Indicação | "20% of the fee, for 90 days." | Quem traz uma carteira recebe parte da taxa dela | Cerca de 25% da taxa do indicado, e só quando ele ganha | Quanto do volume vem por indicação |
| Cartão para o X | "Every market is a card you post on X." | Cada mercado tem um cartão pronto para publicar. Cada resolução vira uma publicação com o número lido, a meta e o link | Tempo da equipe | Se alguém compartilha |
| Quem abre mercados | "Every creator promotes their own market." | Quem abriu ganha 1% do pote e por isso divulga | O 1%, pago por quem acerta ou pelo Brot (seção 4.4) | Tudo: os precedentes são contrários (seção 3.2) |

**Por que não há mídia paga. Decisão.** Uma carteira que põe 200 dólares por mês durante seis meses soma 1.200 de
volume e deixa cerca de 32 dólares para a operação (`1.200 × 3,70% × 75% × 95%`; INFERÊNCIA sobre uma suposição).
Trazer um usuário, em cripto, já custou de 77 a 2.500 dólares (FATO SECUNDÁRIO, casos de 2021 a 2023). Comprar
usuário custa várias vezes o que ele devolve.

**"Não vamos comprar volume com campanha de pontos."** A frase convive com o beta com pontuação: as campanhas que
o pitch recusa premiam volume, e o beta premia acerto, com dinheiro de teste (seção 2.5).

**Falta o canal grande.** Em Solana, a distribuição passa pelas carteiras (seção 2.3). Integração com uma carteira
não se pede no primeiro dia: conquista-se com meses de resolução sem erro. O cenário otimista depende dela, e ela
não está entre os quatro motores.

### 6.3 O que medir

A medida principal não é volume. É retenção: a parcela das carteiras que entra de novo em 30 dias.

| O que medir | Para que serve | Sinal ruim |
|---|---|---|
| Carteiras que entram de novo em 30 dias | Saber se há hábito | Menos de 10% |
| Potes que terminam de um lado só | Saber se os mercados interessam aos dois lados | Mais de 40% |
| Carteiras e volume que cada parceiro trouxe | Vender o patrocínio pago | Parceiro que publica e não traz ninguém |
| Mercados abertos por terceiros, e quantos recebem os dois lados | Testar o slide de criadores e medir a fração `s` | Muitos mercados vazios; régua a definir |
| De qual canal veio cada carteira | Saber onde pôr o tempo da equipe | Um canal só respondendo por quase tudo |
| Mercados resolvidos sem erro e no prazo | Sustentar a promessa central | Qualquer erro |

Quase tudo isso sai do registro público do programa, sem coletar dado pessoal.

## 7. Decisões e pontos abertos

**O que está decidido.** As sete respostas do fundador de 5/10/2026 continuam valendo onde o pitch não as mudou: a
forma da taxa, o destino da parte do Brot no patrocínio, o programa de parceiros, o benefício do indicado, o tempo
na devnet, o critério de parada e a lista de investidores. O pitch decidiu quatro coisas que tocam o caixa: a
divisão de 90% e 10% no patrocínio, a taxa de abertura de 0,02 SOL, o 1% para quem abriu e os quatro motores de
crescimento.

**O que espera decisão do fundador.** Os números de 1 a 14 são os da revisão de impacto, seção 6; a 19 é proposta
desta versão. A lista inteira está no índice, `BUSINESS-PLAN.md`.

| Nº | Decisão | Recomendação | Efeito nas contas |
|---|---|---|---|
| 1 | De onde sai o 1% de quem abriu | Desenho B: do prêmio, com teto | Em C, o equilíbrio sobe para até 285.900 por mês |
| 2 | Para onde vão os 0,02 SOL | Para o Brot, sem devolução, descontado o aluguel | Pequeno; cria caixa em SOL |
| 3 | Valores acima de 500 e contrapartidas | 500 como piso, sem faixas fixas | Define o que cabe em 50 dólares |
| 9 | "Referrals, day one" | "Day one" é o primeiro dia na rede principal | Nenhum no modelo, que já conta a indicação desde o mês 1 |
| 19 | Onde fica o SOL das taxas de abertura | Numa conta da carteira de várias assinaturas; repõe a carteira do serviço, e o resto vira USDC em data fixa | Nenhum no modelo; o caixa fica em dólar (Parte 4, seção 4.7) |

**As objeções da v0.0.1 que mudaram de situação com o pitch.**

| Objeção | Assunto | Situação | O que mudou |
|---|---|---|---|
| OBJ-01 | Ninguém demonstrou a demanda | Mantida, e maior | São três hipóteses, e não duas. Entra o terceiro teste (seção 2.5) |
| OBJ-15 | Preço de vitrine, sem vitrine e sem precedente pago | Mantida, com risco menor | Só o piso de 500 é regra; a parte do Brot caiu para 10%, e o modelo conta ainda menos com patrocínio |
| OBJ-16 | O fundo de prêmios só se paga se causar boa parte do volume | Adiada | Sem mudança de regra; 65.755 no razoável |
| Nova | Criação aberta como motor de crescimento | Aberta | PNP e Limitless são evidência contrária; o plano a trata como hipótese |

**O que a pesquisa não encontrou.** Um precedente de patrocínio de mercado com contrapartida. Um caso em que a
criação aberta tenha sustentado volume. A fatia do volume do setor que caberia na nossa regra. Quanto cada carteira
põe por mês numa plataforma de previsão em blockchain. A mistura real de mercados. A causa da queda da Limitless.



---

# Brot Markets — Business Plan v0.0.3 — Parte 3: Tokens

**Data:** 8 de outubro de 2026.
**Estado:** rascunho para revisão do fundador. Derivada do pitch de 7 de outubro de 2026, por ordem dele. Onde o
pitch e a v0.0.2 discordam, vale o pitch; onde ele se cala, vale a v0.0.2, mais curta. Substitui a Parte 3 da
v0.0.2, que fica na pasta como versão anterior e guarda o detalhe: opções consideradas, tabelas, casos e fontes.

**Como ler.** As marcas são as das Partes 1 e 2: **Decisão** (do fundador, em 4 ou 5/10/2026), **Decisão do pitch**
(regra do deck de 7/10/2026) e **Proposta, aguardando decisão**. Números de fora trazem FATO, FATO SECUNDÁRIO ou
INFERÊNCIA. "v0.0.2, P3 §4.5" quer dizer Parte 3 da versão anterior, seção 4.5. Atenção a uma coincidência de nomes:
dentro desta parte, "Decisão (P1)" a "(P7)" são as sete decisões sobre tokens de 5/10/2026 (seção 7), e não as
partes do plano. Os valores estão em dólares. Nada
aqui é promessa de preço, de rendimento ou de que um token vá existir.

Quatro termos. **Token** é uma unidade digital registrada na blockchain, que fica numa carteira e pode ser negociada.
**Staking** é depositar o token num programa da plataforma, que registra quanto cada carteira depositou e por quanto
tempo. **Trava** é a regra gravada na rede que impede sacar ou vender antes de uma data. **Cofre** é a conta em que a
empresa poria dinheiro para quem está em staking.

**O que mudou desde a v0.0.2.**

1. O pitch não apresenta token. Esta parte encolhe de cerca de 11.900 para cerca de 2.800 palavras.
2. A resposta pronta do roteiro ("não dá direito a receita nem a voto") bate com o token A e contradiz dois usos do
   token B: o cofre e o voto (seção 3).
3. O voto do B sobre quais mercados abrir perde o objeto: qualquer carteira abre (Parte 1, seção 4.1).
4. O cofre do B, no cenário razoável, cai de 911 para 811 dólares por mês, porque o patrocínio rende 10% (seção 5).
5. "Taxa de criador" nomeia só a do pump.fun. O 1% do pote é "a parte de quem abriu o mercado" (Parte 1, seção 3.4).
6. Não mudaram: as sete decisões de 5/10/2026, a ordem dos lançamentos e a recompra em espera.

## 1. O que o pitch diz e o que este capítulo vale

O deck de 7/10/2026 não tem slide de token, e a tela não cita token nenhum. Ele aparece só nas respostas prontas do
roteiro do fundador, para o caso de a banca perguntar:

> **"E o token?"** Não faz parte do que estamos apresentando. Se um dia houver um, não dá direito a receita nem a
> voto, e a gente não promete preço nem recompra.

Três consequências.

- **O token sai do texto de produto.** A Parte 1 descreve duas trilhas de dinheiro, as entradas e o patrocínio. A
  terceira vive só aqui.
- **As decisões de 5/10/2026 não foram revogadas.** O pitch se calou sobre elas, e onde ele se cala vale a v0.0.2.
  Elas ficam, como desenho guardado.
- **Uma frase do roteiro contradiz duas delas.** "Não dá direito a receita nem a voto" vale para o token A. Não vale
  para o token B, que daria parte num cofre, que é receita, e voto. O plano registra o conflito e o leva ao fundador.

Este capítulo é registro, e não plano de lançamento. Nenhum número daqui entra nas projeções da Parte 2.

## 2. Token A: o desenho guardado

**O que é.** Um memecoin, isto é, um token de comunidade sem produto por trás, lançado no pump.fun. O pump.fun é um
site da Solana em que qualquer pessoa cria um token em minutos. O token começa vendido por uma curva, uma fórmula em
que o preço sobe conforme entra dinheiro; quando a curva vende tudo, ele passa a ser negociado como qualquer outro, e
isso se chama formatura (v0.0.2, P3 §3.1).

**Decisão.** "não vamos vincular o token A com a nossa empresa ... ele é um marketing com grandes limitações ...
porém será importante para servir de canal de tração para pessoas conhecerem e irem visitar a nossa plataforma".

O desenho tem quatro regras (v0.0.2, P3 §3.2 a §3.5).

1. **É canal de tração, e não receita.** Não entra em conta nenhuma da empresa. Mede-se quantas carteiras chegam ao
   site por ele e quantas entram num mercado.
2. **A taxa de criador vai inteira para o fundo de prêmios.** No pump.fun, quem cria o token escolhe, uma vez e sem
   volta, para onde vai uma pequena fatia de cada negociação dele. **Decisão:** 100% para a carteira do fundo de
   prêmios dos mercados ("perfeito"). O dinheiro anda do token para os potes, nunca ao contrário.
3. **Decisão (P1), de 5/10/2026.** A equipe cria o token, publica antes a própria carteira, compra até 2% da oferta
   e trava a compra por 12 meses. Depois não compra, não vende e não paga ninguém para negociar.
4. **O texto do dia** diz que o token "não dá direito a receita nem a voto", que ninguém promete preço nem recompra,
   e que um segundo token só existirá se a operação se pagar (v0.0.2, P3 §3.5). Passa pela avaliação jurídica.

**Quando.** Com o produto utilizável: pelo menos quatro semanas na rede principal, com mercados resolvidos e pagos.
Antes disso, quatro pontos pedem leitura ou teste, e não decisão (v0.0.2, P3 §8.1): se a carteira do fundo pode ser
uma conta de programa; se as ferramentas de trava aceitam o Token-2022, o formato novo de token da Solana, que é o do
pump.fun; o texto inteiro dos termos do pump.fun; e para onde vai o dinheiro do fundo se a empresa parar.

**O que o pitch muda no token A: nenhuma regra, uma palavra.** A resposta pronta repete o texto do dia. Mas, agora
que quem abre um mercado fica com 1% do pote, "taxa de criador" fica reservada para a do pump.fun. Misturar os nomes
faria parecer que o token paga quem abre mercados, e ele não paga.

**O risco que continua.** Em junho de 2026, só 0,26% dos tokens do pump.fun chegavam à formatura (FATO SECUNDÁRIO,
The Block e Dune, jun/2026). Se o A cair 90%, o nome Brot fica ligado ao gráfico. Num produto cujo lema é "Proof >
Promises", isso pesa.

## 3. Token B: em espera, com dois pontos em conflito

O token B seria desenhado pela empresa: oferta fixa de 1 bilhão de unidades, distribuição proposta pelo sócio
Ronaldo, todos os usos passando pelo staking com trava, lançamento só depois do equilíbrio.

| Peça | O que está decidido | Diante do pitch |
|---|---|---|
| Staking (P2) | Travas de 1, 3, 6 e 12 meses, pesos 1, 1,5, 2 e 3; pontos são quantidade vezes peso | Fica |
| Desconto na taxa (P3) | Faixas de 10% a 40%, com revisão se passar de 10% da taxa num trimestre | Fica. Sai da mesma taxa que paga tesouraria e indicação (Parte 2, seção 4.2) |
| Voto | Pelos mesmos pontos, numa fase 2; começaria por quais mercados a equipe abre; nunca decide resultado | **Em conflito.** E perde o objeto |
| Cofre (P4) | 20% do resultado do mês, só com caixa positivo e 33.000 de reserva; um quinto volta aos potes como prêmio | **Em conflito.** É direito a receita |
| Recompra | Em espera; só com caixa, a partir do mês 13 | Compatível com "não promete recompra" |
| Distribuição (P5) e venda privada (P7) | A tabela da v0.0.2, P3 §4.7; venda depois de três meses seguidos com a operação paga | Ficam |

**O cofre.** A resposta pronta diz "não dá direito a receita". O cofre é exatamente isso: uma fatia do resultado da
empresa, repassada a quem trava o token. A v0.0.2 já registrava a objeção (P3 §4.5): é o desenho que os reguladores
examinam, e a GMX e a Gains, que repassavam receita a quem fazia staking, suspenderam os repasses em 2026 (FATO nas
documentações; datas em FATO SECUNDÁRIO).

**O voto.** A resposta pronta diz "nem a voto". O B votaria primeiro sobre quais mercados a equipe abre. Com a
criação aberta, ninguém precisa de voto para abrir um mercado: basta pagar 0,02 SOL. Sobra um voto sem tema. E o
pitch usa o voto por token como defeito da Polymarket ("Token vote"), no slide do problema.

**Decisão 8, aguardando o fundador.**

| Opção | O que o token B passa a ser | Custo ou risco |
|---|---|---|
| (a) Confirmar a resposta pronta | Staking e desconto na taxa | Perde os dois usos que mais atraíam quem trava |
| (b) Manter as decisões de 5/10/2026 | Desconto, cofre e voto | A frase dita à banca fica falsa para o B |
| (c) Manter o cofre, tirar o voto | Desconto e cofre | Resolve metade; a parte "receita" segue contradita |

**Proposta, aguardando decisão: a opção (a).** Se a resposta pronta vale, o token B fica só com o desconto na taxa,
em espera. É a frase que o fundador já diz em público, é a que reduz a exposição regulatória, e o cofre era pequeno
(seção 5). Quando a Gains suspendeu os repasses, manteve só o desconto para quem faz staking (FATO,
docs.gains.trade). Se o fundador preferir (b), muda a resposta do roteiro, e não o plano.

## 4. A ponte e o calendário

**A ponte. Decisão.** Quem tem token A pode queimá-lo, isto é, destruí-lo, para pagar parte da compra de token B com
desconto. É opcional e tem teto. **Decisão (P6), de 5/10/2026:** 20% de desconto, até 30% de cada compra paga com A,
reserva de 10% do B. A queima e a entrega são uma operação só, e o B comprado assim sai em staking com trava de 3
meses (v0.0.2, P3 §5). A ponte depende do B: se ele ficar em espera, ela fica junto. Dois avisos continuam. Quanto
mais o A serve para obter o B, mais parece um direito sobre o B. E o programa ainda não lê o Token-2022, então a
ponte pede código novo (Parte 4, seção 2.2).

**O calendário. Decisão.** O token A sai com o produto utilizável; o token B, depois do equilíbrio.

| Marco | Ruim | Razoável | Otimista |
|---|---|---|---|
| A operação se paga | Nunca | Mês 9 | Mês 2 |
| Token A | Mês 2 | Mês 2 | Mês 2 |
| Venda privada do B | Não acontece | Meses 12 a 14 | Meses 5 a 7 |
| Lançamento do B | Não acontece | Por volta do mês 15 | Por volta do mês 8 |

A tabela é a da v0.0.2 (P3 §6.3, INFERÊNCIA). Com o patrocínio a 10%, o mês em que a operação se paga não muda
(Parte 2, seção 1.4), e ela segue como ponto de partida. Uma linha não sobrevive: o cofre começaria por volta do mês
25 no razoável, quando o caixa passasse de 33.000; com o caixa de 21.467 no mês 24, esse mês fica mais tarde, e a
revisão não recalculou quando. "Mês 2" supõe a rede principal no início do mês 2, data que anda se faltar um dos três
critérios (Parte 4, seções 3.1 e 3.2). No cenário ruim, o token A fica sozinho.

## 5. O tamanho do dinheiro

Três números dão a medida (INFERÊNCIA, modelo da Parte 2).

- **A taxa de criador do token A.** Se o A negociar 50 mil dólares por dia, a 0,30%, o fundo de prêmios recebe 4.500
  por mês. Ninguém sabe qual volume ele terá.
- **O cofre do token B.** No cenário razoável, 20% do resultado do segundo ano seriam 9.732 dólares, ou 811 por mês.
  Eram 10.932 e 911 na v0.0.2. São centenas de dólares por mês, para dividir entre todos.
- **O cenário ruim.** Não há resultado, e o cofre recebe zero.

Staking, sozinho, não gera ganho: o dinheiro de um cofre só vem de receita repassada ou de tokens novos, e este
plano não cria tokens novos. Para comparar, entre os meses 7 e 18 depois do lançamento saem da trava 21.806 dólares
de token B por mês para cada 1 milhão de dólares de valor total (v0.0.2, P3 §4.7). Muito risco regulatório para pouco
dinheiro: é o argumento a favor da proposta da seção 3.

## 6. Regulação e riscos

Este capítulo não é parecer. **Decisão.** A avaliação jurídica é feita pelo fundador e por colegas, sem custo. O que
ela precisa responder sobre tokens é a lista da v0.0.2 (P3 §7.1), inteira e mais curta.

1. **A ponte** faz do A um direito sobre o B, e o tira da descrição de memecoin da SEC, a autoridade americana de
   valores mobiliários: ativo com "limited or no use or functionality" (FATO, 27/02/2025)?
2. **O cofre** é a "participação, parceria ou remuneração" do Parecer 40 da CVM, a Comissão de Valores Mobiliários
   (FATO, 11/10/2022)? A SEC tratou como
   contrato de investimento um token que prometia "a share of excess profits" (FATO, comunicado 2021-145).
3. **A venda privada:** contrato, compradores e países. Na Europa, o MiCA, o regulamento europeu de criptoativos,
   exige pessoa jurídica e isenta ofertas a menos de 150 pessoas por país, de até 1 milhão de euros em 12 meses, ou
   só a investidores qualificados (FATO).
4. **Os termos do pump.fun**, lidos por inteiro: cabem a taxa de criador no fundo e a ponte?
5. **O desconto e o voto:** a SEC inclui em "parte central" quem tem controle "operational, economic, or voting" de
   um sistema (FATO SECUNDÁRIO, set/2026).
6. **O staking:** a declaração da SEC de 29/05/2025 não cobre ativos com direito a renda ou lucro de empresa (FATO).
7. **A recompra, se voltar:** as perguntas e respostas da SEC de 25 e 28/09/2026 não têm força de regra (FATO).
8. **A comunicação:** "pumpar", "dividendo" e "subir preço" foram usadas contra emissores nos casos lidos.
9. **A equipe e o token A:** pode ter, e em que condições vende depois da trava?
10. **O Brasil:** para tokens, o Parecer 40. A Medida Provisória 1.394 está na Parte 4, seção 6.1.

**Os riscos que continuam** (v0.0.2, P3 §7.2 e §7.3). O token A morre cedo e leva o nome junto. O B nasce num mercado
fraco de vendas: 37 vendas públicas de token no mundo no segundo trimestre de 2026, somando 58 milhões de dólares
(FATO SECUNDÁRIO, Flexe.io citando CryptoRank, set/2026). Saem da trava mais tokens do que um cofre absorve. Staking,
cofre e ponte seriam três programas novos com dinheiro de terceiros, cada um com auditoria que a gratuidade informada
não cobre (Parte 4, seção 4.1). E um risco novo, de coerência: a banca ouviu "não dá direito a receita nem a voto".

## 7. Decisões

**O que está decidido.** As sete decisões de 5/10/2026 ("sobre as 7 decisões, concordo"); as opções estão na v0.0.2,
P3 §8.1.

| # | O que passa a valer | Diante do pitch |
|---|---|---|
| P1 | A equipe cria o token A, compra até 2%, trava 12 meses e não negocia | Fica |
| P2 | Travas de 1, 3, 6 e 12 meses; pesos 1, 1,5, 2 e 3 | Fica |
| P3 | Desconto de 10% a 40%, com revisão | Fica |
| P4 | 20% do resultado ao cofre, com 33.000 de reserva; um quinto aos potes como prêmio | Em conflito |
| P5 | A distribuição da v0.0.2, P3 §4.7 | Fica |
| P6 | Ponte de 20% de desconto, até 30% da compra, reserva de 10% | Fica, presa ao destino do B |
| P7 | Venda privada depois de três meses seguidos com a operação paga | Fica |

Continuam também o voto do B numa fase 2, em conflito com o pitch, e a recompra em espera.

**O que espera decisão do fundador** (revisão de impacto, `_review/bp-impact-review-v0.0.3.md`, seção 6).

| Nº | Decisão | Recomendação | Seção |
|---|---|---|---|
| 8 | Token B: o cofre e o voto, diante de "não dá direito a receita nem a voto" | Confirmar a resposta pronta; o B fica só com o desconto, em espera | 3 |

**O que a pesquisa não encontrou.** Os vazios da v0.0.2 (P3 §8.3) continuam: uma plataforma que tenha lançado um
memecoin e depois um segundo token por venda privada; um caso de queima opcional de um token para comprar outro com
desconto; uma tabela de desconto, com números, em concorrente; uma plataforma em que o token vota quais mercados
abrir.


---

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


---

