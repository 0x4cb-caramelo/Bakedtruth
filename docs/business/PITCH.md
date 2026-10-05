# Brot Markets: apresentação resumida do plano

- **Projeto:** Brot Markets
- **Derivado do plano de negócio:** v0.0.2, de 5/10/2026
- **Última atualização:** 2026-10-05
- **Público:** investidores e avaliadores de hackathon
- **Situação de publicação:** não publicado. Nada foi aprovado, e a decisão do fundador está pendente (ver o fim).

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

No primeiro dia são cinco tipos de pergunta: preço de ativo grande, queima de tokens, liquidez travada na Meteora,
tamanho de pool de staking e stake de validador (P1 §4.2). Ficam fora os tipos em que uma pessoa decide o resultado
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

## Portão de redação para publicação

**Estado em 5/10/2026: nada aprovado para publicação.** A pergunta da etapa 2.9 (tudo público, versão enxuta com a
completa restrita, ou nada online por enquanto) ainda não foi feita ao fundador. Nenhuma coluna está marcada. A
última lista o que rever se a resposta for publicar.

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

**As cinco perguntas da regra de privacidade.**

1. **Alguma persona leva a uma pessoa real?** Não. O plano não tem persona com nome.
2. **Os entrevistados aceitaram ser descritos em público?** Não se aplica: nenhuma entrevista foi feita (P2 §2.4).
3. **A seção de equipe expõe mais do que as pessoas aceitaram?** A conferir. O texto cita Lucas e Ronaldo, sem
   registro de consentimento, e diz "três sócios", o que diverge da apresentação no hackathon.
4. **A página terá analytics?** Não decidido. Se tiver, é coleta de dado pessoal e reabre as nove perguntas.
5. **Dá para despublicar?** Na prática, não. Publicar é permanente.

**Aprovação**

- [ ] O fundador leu a tabela e aprovou linha por linha.
- [ ] A auditoria de privacidade rodou sobre personas e equipe.
- [ ] Nenhum concorrente aparece ao lado de um ponto fraco específico.
- [ ] Todo número publicado é um que o projeto aceita ver citado.
- [ ] A decisão e o motivo estão registrados em `session-log/`.

**Responsável pela manutenção:** não definido. Sem responsável, o método manda não publicar.
