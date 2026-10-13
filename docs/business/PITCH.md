# Brot Markets: apresentação resumida do plano

- **Projeto:** Brot Markets
- **Derivado do plano de negócio:** v0.0.2, de 5/10/2026
- **Última atualização:** 2026-10-05
- **Público:** investidores e avaliadores de hackathon
- **Situação de publicação:** em 5/10/2026 o fundador mandou publicar o deck dele em `brot.markets/pitch`. O deck
  está pronto e servido só por link, fora dos buscadores. A aprovação linha por linha do portão continua pendente
  (ver o fim). Este documento, em português, segue não publicado.

**Como ler.** Todo número vem do plano. Entre parênteses, P1 a P4 são as quatro partes, § é a seção e "Resumo" é o
`BUSINESS-PLAN.md`. FATO SECUNDÁRIO é número lido em quem citou a fonte. INFERÊNCIA é conta nossa. Toda projeção é
inferência, e nenhuma é promessa.

## 1. Em uma linha

Um mercado de previsão na Solana para quem já usa carteira de cripto: aposta-se em USDC no SIM ou no NÃO, quem
acerta divide o pote, e o resultado é lido de um dado gravado na própria rede (P1 §1.1).

## 2. O problema

Todo mercado de previsão precisa de alguém que diga o resultado, e é nesse ponto que o setor acumula queixas. Na
maior plataforma on-chain, quando o resultado é contestado, detentores de um token votam, e o processo leva de 4 a
6 dias (FATO, P1 §2.1). Em 2026, até maio, mais de 1.150 mercados dela foram a arbitragem, mais que em 2025 inteiro
(FATO SECUNDÁRIO, P2 §3.3). O plano não mediu quantas pessoas isso afeta nem quanto custa a elas.

## 3. Por que agora

O plano não tem um capítulo sobre isso. O que ele registra (FATO SECUNDÁRIO, P2 §2.2 a §2.4 e §3.3):

- **A favor.** O setor é grande e é novo: 21,7 bilhões de dólares pagos em 30 dias, até 3/10/2026. Cobrar taxa
  também é novo. E o concorrente mais parecido, em pote e em Solana, ainda não opera com dinheiro real.
- **Contra.** O interesse de busca pelo setor caiu 83% desde o pico da Copa de 2026. A receita diária do pump.fun,
  onde está o nosso público, caiu a um sexto em seis meses.

## 4. A solução

O Brot Markets só abre perguntas cuja resposta fica gravada na Solana, e o programa lê essa resposta. Não há voto,
juiz nem oráculo de opinião (Resumo). As perguntas de preço usam um oráculo de preço conferido na própria rede (P1
§4.7). Entra-se só com a carteira, sem cadastro.

São seis tipos de pergunta: preço de ativo grande, queima de tokens, liquidez travada na Meteora, tamanho de pool de
staking, stake de validador e, desde 12/10/2026, a graduação de uma curva de lançamento da Meteora, fechada na rede
principal até as auditorias (P1 §4.2). Ficam fora os tipos em que uma pessoa decide o resultado
de graça (P1 §4.3). Não há saída antecipada nesta versão (P1 §3.6).

## 5. Como funciona

1. **Apostar.** A equipe abre a pergunta "O SOL toca 300 dólares até 31 de dezembro?". Entram 300 USDC no SIM e 700
   no NÃO. As apostas fecham quando faltam 5% da duração (P1 §1.2; Resumo).
2. **Resolver.** Dois serviços agendados acionam a leitura na rede. A equipe tem 6 horas para confirmar ou anular, e
   nunca troca o vencedor. Pergunta anulada devolve tudo, sem taxa (P1 §1.2 e §1.3).
3. **Receber.** O pagamento sai sozinho para a carteira de quem acertou. Se der SIM, a casa fica com 70 e cada 1
   USDC apostado no SIM recebe 3,10 (P1 §1.2).

## 6. Para quem

O público principal é quem já usa aplicações em blockchain, com recorte em Solana e no pump.fun. O segundo são
projetos que patrocinam uma pergunta sobre a própria meta, como uma queima prometida (P1 §2.2).

O plano não tem entrevistas nem personas com nome. Tem quatro perfis escritos como hipótese, a conferir no beta
(INFERÊNCIA, P2 §2.4).

## 7. Mercado

O plano não calcula TAM, SAM nem SOM. Usa estes números:

| Medida | Valor | Fonte, como está no plano |
|---|---|---|
| Setor de mercados de previsão, em dólares pagos | 21,7 bilhões em 30 dias, até 3/10/2026 | FATO SECUNDÁRIO, DefiRate (P2 §2.2) |
| World, a melhor vitrine em Solana, dentro da carteira Phantom | 15,44 milhões em set/2026 | FATO SECUNDÁRIO, DefiLlama (P2 §2.3) |
| pump.fun: carteiras desde a criação | 80 milhões; carteira não é pessoa | FATO SECUNDÁRIO, The Block, jun/2026 (P2 §2.4) |
| Mercados abertos sobre queima, trava de liquidez ou outro fato de token | Zero encontrados | FATO, busca limitada, out/2026 (P2 §1.1) |

É um nicho: esporte, política e economia, a maior parte do volume, não se leem numa conta da Solana (P2 §3.4). O
preço de ativo grande é o único dos nossos tipos de pergunta com demanda conhecida (P2 §2.5). **A demanda pelos
demais não foi demonstrada:** não há mercado parecido aberto, entrevista nem um dia de uso (P2 §2.6).

## 8. Por que nós

Tudo abaixo vem de P2 §3.3 e §3.4, e as comparações são INFERÊNCIA.

- **Resultado conferível.** Nenhum dos cinco concorrentes estudados resolve por leitura direta de uma conta
  on-chain.
- **Patrocínio de pergunta com contrapartida.** Nenhum dos cinco vende isso. Pelo mesmo motivo, não há preço de
  referência para as nossas faixas.

A taxa, a equipe abrindo as perguntas, a entrada só com a carteira e o pote já existem em outras plataformas.
Ficamos atrás em dois pontos: sem saída antecipada e sem público. O diferencial pode ser copiado com trabalho de
engenharia, e resultado conferível, sozinho, não traz ninguém.

## 9. Modelo de negócio

**Taxa.** A casa fica com 10% do lado perdedor de cada pote. Quem acerta nunca recebe menos do que apostou
(Resumo). Na média, isso dá 3,70% do volume apostado (INFERÊNCIA). É a premissa mais frágil do modelo: vai de 2,70%
a 4,18% conforme a mistura de perguntas, que ninguém mediu. Da taxa, 25% vão para a tesouraria e 75% para a
operação, até a operação se pagar (P2 §4.1).

**Patrocínio.** Faixas de 500, 1.500 e 5.000 dólares, com 70% para o pote e 30% para a plataforma. Os primeiros 20
a 30 parceiros entram sem pagar. No primeiro ano, o plano conta com o patrocínio para trazer público e quase não
conta com ele como receita (P2 §1.2 e §5.1).

**As contas** (INFERÊNCIA, P2 §1.3 e §1.4). O custo é de 5.500 dólares por mês. A operação se paga com 208.630
dólares apostados por mês.

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Mês em que a operação se paga | Não chega | 9 | 2 |
| Ponto mais baixo do caixa | −116.565 | −27.474 | −9.705 |
| Caixa no mês 24 | −116.565 | 27.767 | 798.462 |

O cenário ruim não se paga com capital nenhum. O otimista depende de um canal de distribuição que hoje não existe.
Com maioria de perguntas de favorito claro, o razoável só se paga no mês 12 (P2 §5.4). Critério de parada: aos 180
dias na rede principal, com volume mensal de até 45 mil dólares, a empresa para ou muda de rumo (Resumo).

**Tokens** (P3 §1). O token A nasce no pump.fun, serve para trazer gente ao site e não dá direito a nada. O token B
só sai depois que a operação se pagar. Quem o trava ganha desconto na taxa, voto sobre quais perguntas abrir e
parte num cofre que recebe 20% do resultado. No cenário razoável, esse cofre receberia cerca de 900 dólares por
mês, para dividir entre todos (INFERÊNCIA). O plano não promete preço nem rendimento para nenhum dos dois.

## 10. Onde estamos e o que buscamos

**Estágio, em 5/10/2026.** Não há usuários, tração, patrocinador pagante nem investidor a declarar (P2 §5.1). Existe
na rede de testes um programa feito para um modelo anterior. O programa do pote será escrito de novo, aproveitando
os leitores (P4 §1.1).

**Próximos passos.** Cerca de um mês na rede de testes, com pontuação e parceiros convidados. A equipe está
construindo para o hackathon Colosseum, com prazo em 12/10/2026 (P4 §3.1 e §3.2). A rede principal só abre com
auditoria externa, carteira com duas assinaturas de três e teto global para o total apostado. Se um faltar, a data
anda (Resumo).

**Equipe** (P4 §6.1). São três sócios. Lucas é o fundador e dono do produto. Ronaldo é o CTO e autor do programa
atual. O terceiro sócio não aparece com nome nos documentos. No hackathon, a equipe se apresenta como uma pessoa.

**O que buscamos.** O fundador busca de 50 mil dólares nos primeiros seis meses a 350 mil até o fim do primeiro
ano, e o plano não depende disso (P2 §5.5). O cenário razoável pede cerca de 27,5 mil até o mês 9 (INFERÊNCIA, P2
§1.4). O plano não traz valuation, rodada aberta nem termos.

**Riscos que o plano declara** (Resumo; P4 §1.3 e §7).

- **Demanda não demonstrada.**
- **Regra brasileira, em aberto.** A Resolução CMN 5.298, a Nota Técnica SEI 2958/2026 e a Medida Provisória 1.394,
  de 25/9/2026, que proíbe a aposta de quota fixa no país, inclusive por empresa do exterior. Se o pote é esse tipo
  de aposta é a primeira pergunta da avaliação jurídica, que ainda vai ser feita. A tramitação da medida no
  Congresso não foi conferida.
- **Prazo.** O núcleo do pote cabe em um mês. Construir tudo e concluir duas auditorias no mesmo mês não cabe.
- **Poucas pessoas** para um programa novo, com dinheiro de terceiros.

---

## Frase de elevador

**Aprovada pelo fundador em 7/10/2026** ("Esse 1 ficou bom"). Em inglês, cerca de 20 segundos falada. É a referência
para qualquer texto que apresente o Brot em poucas linhas: abertura da fala, inscrição do hackathon, mensagem a um
projeto parceiro.

> Brot Markets is a prediction market built as a growth engine for on-chain projects. You pick a milestone the
> blockchain can measure, like a burn, locked liquidity or staked SOL, and sponsor a market on it. Your community
> takes sides, talks about it and shares it. At the deadline, the chain itself reads the result and pays the
> winners. No votes, no judges. Your milestone becomes a campaign that proves itself.

**O que ela faz de propósito.** São as quatro escolhas que saíram da banca de 6/10/2026 e das rodadas com o
fundador:

1. **Começa por nós,** e não pela dor dos concorrentes. O pedido dele: "mais do que começar pelas dores dos outros,
   vamos direto ao ponto".
2. **Mantém "prediction market"** como o nome da categoria, porque é por ele que jurado e investidor nos encaixam, e
   diz logo em seguida o que nos separa: "built as a growth engine for on-chain projects".
3. **Fala com o projeto, na segunda pessoa.** O cliente da frase é quem patrocina, e não quem dá o palpite.
4. **Não usa "bet".** Usa "takes sides".

**Cuidados ao reusar.**

- "Growth engine" é o enquadramento que a banca pediu ("camada de incentivo"). O plano chama a mesma coisa de
  patrocínio (P1 §3.7). As duas palavras descrevem a mesma regra; a frase não cria regra nova.
- Os três exemplos (queima, liquidez travada, SOL em staking) são tipos que o programa lê. Não trocar por número de
  holders, carteiras ativas ou TVL, que ele não lê.
- A frase não diz a taxa, de propósito: ela estava em discussão quando a frase foi aprovada.

**Versão de uma linha, candidata, ainda não aprovada:**

> The prediction market where projects put money behind their own promises, and the chain proves whether they
> delivered.

**Outras frases da mesma rodada, guardadas como inspiração.** Nenhuma foi aprovada.

- Para jurado e investidor, com a receita: "Brot Markets turns prediction markets into an incentive layer for
  on-chain goals. Projects pay to open a market on their own KPI: tokens burned, liquidity locked, SOL staked.
  Seventy percent becomes the prize pool for their community. The crowd takes sides, the metric becomes a story, and
  Solana settles it: the program reads the account and pays the winners. We earn on every pot and every
  sponsorship."
- Curta: "Brot is the prediction market the chain resolves, and projects use it as marketing."
- Pelo contraste: "Every other prediction market asks someone who won. Brot just reads the blockchain."
- Três palavras: "Don't trust. Read the chain."

## O deck em `/pitch`

O fundador montou um deck próprio, em inglês, para o hackathon Colosseum, e pediu em 5/10/2026: "quero que você
avalie a qualidade e conteúdo, e coloque online no site também depois de arrumado e melhorado no endereço /pitch".
O deck é a apresentação; este documento continua sendo a fonte, e o deck não deve dizer o que o plano não diz.

O deck está em `services/landing/public/pitch/`, e o roteiro de fala em `services/landing/pitch-notes.md`. Houve
duas versões no mesmo dia:

- **Primeira (13 slides):** os 12 do fundador, revisados, mais um de problema. A avaliação e a lista do que mudou
  estão em `session-log/2026-10-05-pagina-em-breve-e-pitch.md`.
- **Segunda (8 slides), a que está no ar:** o fundador refez o deck e pediu a troca ("o pitch foi atualizado, o novo
  arquivo está em docs\technical\Brot Markets Pitch v2.html, coloque lá no lugar do /pitch no site"). Ficou mais
  curto e mais voltado a projetos parceiros: saíram os slides de como funciona, tipos de pergunta, modelo de negócio,
  segurança e roteiro; entrou um slide de problema dele, com três concorrentes pelo nome. O que foi ajustado e
  conferido está em `session-log/2026-10-05-mascote-na-pagina-e-deck-v2.md`.

**Onde a primeira versão do deck e o plano não batiam.** Três pontos. A segunda versão não traz nenhum dos três (o
mercado do $LAPTOP, a contagem de fundadores e o prazo da rede principal saíram da tela), e todos os números que ela
mostra constam na Parte 2 do plano. A tabela fica como registro:

| Ponto | O deck diz | O plano diz |
|---|---|---|
| Mercado de lançamento de token | Um mercado da Polymarket sobre o token $LAPTOP negociou mais de 4 milhões de dólares | Nada. O número foi conferido num agregador (4,6 milhões, FATO SECUNDÁRIO, `knowledge-base/market/mercado-de-token-na-polymarket.md`) e precisa entrar na Parte 2 |
| Equipe | "3 founders" e "2-of-3 founder multisig" | No hackathon a equipe se apresenta como uma pessoa (P4 §6.1) |
| Rede principal | "Capped mainnet targeted for month 2" | "Provavelmente" no início do mês 2, e construir tudo com duas auditorias no mesmo mês não cabe (P4 §1.3) |

## Portão de redação para publicação

**Estado em 5/10/2026.** O fundador escolheu publicar o deck, o que responde à pergunta da etapa 2.9. O que ele
ainda não fez foi aprovar cada linha abaixo, e o método exige isso antes de uma página pública. Por isso o deck foi
preparado na forma mais fácil de desfazer: **só por link** (`noindex` na página e no cabeçalho, sem link na página
inicial, fora do `robots.txt`). Para abrir aos buscadores e ligar na página inicial, falta marcar a tabela.

Nenhuma coluna está marcada. A última lista o que rever, e a tabela seguinte diz o que o deck mostra hoje em cada
linha, com a recomendação de quem o revisou.

| Seção | Público | Restrito | Não publicar | O que rever antes |
|---|:---:|:---:|:---:|---|
| Em uma linha | | | | O art. 16 da MP 1.394 veda publicidade de aposta de quota fixa ao público brasileiro, e não se sabe se o pote é esse tipo de aposta (P4 §7.1 e §7.3) |
| Problema | | | | Manter a plataforma citada sem nome |
| Por que agora | | | | Números de terceiros, lidos de segunda mão |
| Solução | | | | Na rede de testes, todo texto público leva o aviso de fase de testes (P1 §4.7) |
| Como funciona | | | | O mesmo aviso |
| Personas | | | | Não há persona com nome. Os quatro perfis são hipótese |
| Mercado e fontes | | | | Conferir cada fonte na origem |
| Por que nós | | | | A tabela do plano com pontos fracos de concorrentes (P2 §3.2) não vai a público |
| Modelo de negócio | | | | Taxa e faixas de patrocínio ainda não foram anunciadas. Texto sobre tokens passa antes pela avaliação jurídica (P3 §7.1) |
| Tração e métricas | | | | Não há tração a publicar |
| Projeções financeiras | | | | Em geral, não publicar. São inferência |
| Economia por unidade | | | | Em geral, não publicar |
| Captação e valuation | | | | Em geral, não publicar. Não há valuation |
| Registro de riscos | | | | Em geral, não publicar |
| Equipe | | | | Dado pessoal. Não há consentimento registrado |

**O que o deck mostra, linha por linha.** Vale para a segunda versão, de oito slides, que está no ar. A recomendação
é de quem revisou o deck. A decisão é do fundador.

| Seção | O que o deck mostra | Recomendação |
|---|---|---|
| Em uma linha, solução | Slides 1 e 3. A regra do produto: só abre pergunta cuja resposta está numa conta de Solana | Público. **Nenhum slide diz mais que é fase de testes** (na primeira versão o roteiro dizia "Devnet"). Pôr o aviso antes de abrir (P1 §4.7). O deck está em inglês, o que reduz, e não elimina, a dúvida do art. 16 da MP 1.394 |
| Problema | Slide 2, do fundador. Polymarket, World (na Phantom) e PNP **pelo nome**, cada um com a forma como resolve: voto de token em 4 a 6 dias, chave da empresa, dois modelos de linguagem | As três afirmações constam no plano (P2 §3.2), com fonte, e estão ditas sem adjetivo. Ainda assim é concorrente com nome ao lado de um ponto fraco, e o portão pedia manter sem nome. **Decidir antes de abrir** |
| Mercado e fontes | Slide 6. Polymarket, Kalshi e pump.fun com nome; sete números de terceiros, todos na Parte 2 do plano como fato de segunda mão; "~$0.9B" é estimativa nossa, e a tela diz isso | Público, depois de conferir cada fonte na origem |
| Por que nós | Slide 7. "Myriad's volume drop −94%" e "Opinion fell 81%" | **Trocar antes de abrir.** São dois concorrentes com nome ao lado de um ponto fraco. Sugestão: "two points-driven platforms lost 81% and 94% of their volume" |
| Modelo de negócio: taxa e patrocínio | Slide 5: 10% do lado perdedor, média modelada de 3,70%. Slide 4: faixas de 500, 1.500 e 5.000 dólares, 70/30, 20 a 30 parceiros com uma pergunta grátis | Publicar o deck é anunciar a taxa e as faixas. Decidir se é a hora |
| Tokens | Slide 7, um cartão: token no pump.fun, sem direito na empresa, taxa de criador para prêmios. Slide 6: "80M pump.fun wallets" como público-alvo | **Tirar o cartão do público** até a avaliação jurídica (P3 §7.1) |
| Chamada a parceiros | Slide 8: "Let's build your startup's question together", vagas limitadas a 20 a 30 projetos, código QR para `x.com/brotmarkets` (conferido: aponta para lá) | É uma oferta comercial pública. Por link, para quem recebe a apresentação, está no lugar certo |
| Projeções, economia, roteiro | A segunda versão não traz. Saíram o custo mensal, o ponto de equilíbrio e o prazo da rede principal | Nada a decidir |
| Tração, captação, valuation, riscos | O deck não traz | Nada a decidir |
| Equipe | Nenhum nome e nenhuma contagem de fundadores na tela. "I'm Lucas, founder" está só no roteiro de fala, que não é publicado | Nada a decidir |

**Resumo da recomendação.** Manter o link direto como está, para jurados, parceiros e investidores. Para a versão
aberta: pôr o aviso de fase de testes, tirar o cartão do token, trocar os nomes do slide 7 e decidir sobre os nomes
do slide 2.

**As cinco perguntas da regra de privacidade.**

1. **Alguma persona leva a uma pessoa real?** Não. O plano não tem persona com nome.
2. **Os entrevistados aceitaram ser descritos em público?** Não se aplica: nenhuma entrevista foi feita (P2 §2.4).
3. **A seção de equipe expõe mais do que as pessoas aceitaram?** A conferir. O texto cita Lucas e Ronaldo, sem
   registro de consentimento, e diz "três sócios", o que diverge da apresentação no hackathon. O deck só traz o
   nome do Lucas, posto por ele; o Ronaldo e o terceiro sócio não aparecem.
4. **A página terá analytics?** Não. O site provisório não tem estatística de visitas nem cookies. Se entrar, é
   coleta de dado pessoal e reabre as nove perguntas.
5. **Dá para despublicar?** Na prática, não. Publicar é permanente.

**Aprovação**

- [ ] O fundador leu a tabela e aprovou linha por linha.
- [ ] A auditoria de privacidade rodou sobre personas e equipe.
- [ ] Nenhum concorrente aparece ao lado de um ponto fraco específico.
- [ ] Todo número publicado é um que o projeto aceita ver citado.
- [x] A decisão e o motivo estão registrados em `session-log/2026-10-05-pagina-em-breve-e-pitch.md`.

**Responsável pela manutenção:** não definido. Sem responsável, o método manda não publicar em aberto. É mais um
motivo para o deck ficar só por link até o fundador dizer quem cuida dele.
