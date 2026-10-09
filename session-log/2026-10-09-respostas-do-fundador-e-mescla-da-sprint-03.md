# 2026-10-09 — As respostas do fundador às perguntas das Sprints 02 a 04, e a mescla da Sprint 03

## Context

A Sprint 03 fechou com sete perguntas ao fundador: as seis da abertura e a que as revisões levantaram, entrar no SIM
depois do toque (a "pergunta 8" do PR #40; a 7, preço zero ou negativo como prova, foi fechada pelas revisões). A
Sprint 04 tinha mais duas em aberto: a campanha sem nenhuma entrada e a anulação por feed parado (`StaleFeed`).

Em 9/10/2026 o Ronaldo respondeu as nove, numa sessão com o assistente. Antes da pergunta 1 pediu dois números:
quantos tipos de campanha abrem hoje (quatro dos cinco construídos; o `StakeAtLeast` segue fechado até o SIM na
devnet) e quantos feeds de preço sobram só com a Pyth. Pela contagem da frente R
(`knowledge-base/tecnologia/pyth-feeds-patrocinados.md`), a lista oficial de feeds patrocinados dá 62 feeds na rede
principal e 17 na devnet; sem lista, 81 e 24 estavam sendo atualizados naquele dia, e até 1.883 se alguém mantiver as
contas. Antes da pergunta 5 pediu o valor da entrada mínima: 0,01 SOL (P-5), que o admin pode pôr entre 0,001 e 1 SOL.

O Ronaldo disse também que o Lucas lhe deu liberdade para mesclar sem a revisão dele, e pediu a mescla dos PRs #37 (o
plano técnico v0.1.1) e #40 (a Sprint 03), com as tags `sprint-02` e `sprint-03`.

## Decision

### 1. As respostas

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Quais feeds da Pyth uma campanha de preço pode nomear | Uma lista nossa, fixa no programa (opção c). No primeiro dia, a lista oficial de feeds patrocinados pela Pyth; feeds novos a partir da Sprint 06, quando a nossa infraestrutura os mantiver |
| 2 | Cobrar a abertura em `p − conf` | Sim |
| 3 | O feed do SOL/USD como constante do programa | Sim |
| 4 | Cota própria para as aberturas gratuitas da equipe | Sim, e sem limite: as aberturas da equipe saem do `max_open_campaigns` |
| 5 | A campanha guarda a entrada mínima com que abriu | Sim (0,01 SOL hoje) |
| 6 | Chaves da equipe (Q12) | Lucas, Ronaldo e Bernardo; o Bernardo não programa e vai usar e administrar a plataforma mais adiante |
| 8 | Entrar no SIM depois do toque | A recomendação: a margem na trava de entrada e, na Sprint 04, a devolução das entradas feitas a partir do `publish_time` da prova |
| Sprint 04 | Campanha sem nenhuma entrada | O prêmio volta a quem abriu, e a Brot fica com os US$ 50 |
| Sprint 04 | `StaleFeed`: falha da casa ou causa externa? | Causa externa: a Brot fica com os US$ 50 |

As palavras dele estão em `docs/business/ideacao-perguntas-e-respostas.md`, seção 1, e as respostas também no
comentário do PR #40, para o Lucas.

### 2. A lista de feeds, uma por rede

A lista é escolhida pela feature `mainnet`. Na devnet ela traz só os feeds da lista oficial cujas contas estão sendo
atualizadas lá (17). A lista oficial nomeia 64 feeds e só 17 existem na devnet: com a lista inteira, qualquer pessoa
poderia criar as outras 47 contas na devnet, e voltariam os feeds mantidos por estranhos.

### 3. A mescla sem a revisão do Lucas

Conferido no GitHub antes: a conta do Ronaldo (`0xcf07`) tem escrita, não admin, então a mescla "admin" não existe
para ela, e também não é preciso. A `main` não tem proteção, e nada é publicado numa mescla: na `main`, o CI só
confere. A ordem: o #37 primeiro, sem conflito; depois a `main` na branch da Sprint 03, com cinco documentos em
conflito (CHANGELOG.md, CLAUDE.md, docs/SPRINTS.md, o arquivo da Sprint 02 e o índice deste registro), todos nas
mesmas linhas de estado editadas pelos dois PRs, resolvidos mantendo os dois lados; o CI verde; o #40; e as tags
anotadas `sprint-02`, no merge do PR #35 (`ec8d24d`), e `sprint-03`, no merge do PR #40.

## Alternatives considered

- **Esperar a revisão do Lucas.** Era a recomendação anterior do assistente, um dia de espera, porque "aberturas da
  equipe sem limite" é a resposta que ele mais provavelmente questionaria. O Ronaldo preferiu seguir. O comentário no
  PR #40 convida o Lucas a discordar antes de a Sprint 04 começar, e nada do que foi respondido está construído ainda.
- **A lista de feeds:** só a lista oficial (a), nenhuma lista (b, como o código faz hoje) ou uma lista nossa que
  começa pela oficial (c). A b deixa um criador perder os US$ 50 quando um estranho para de pagar um feed (a
  resposta sobre o `StaleFeed`).
- **A cota da equipe:** a recomendação era uma cota própria com um limite pequeno. A escolha foi sem limite.

## Consequences

- A Sprint 04 constrói as respostas 1 a 5 e 8 e as duas regras da própria Sprint 04, estas como regras fixas, sem
  chave de configuração.
- A lista de feeds estreita, só para o tipo preço, o D-i ("nao tem lista de contas aprovadas", 8/10/2026).
- Aberturas da equipe sem limite: o teto de campanhas abertas, que também protegia o keeper (pensado para cerca de
  1.000 campanhas abertas), deixa de valer para elas. Uma chave da equipe vazada abriria campanhas sem fim. Ela não
  tira dinheiro de ninguém, o admin remove a chave na hora, e a pausa também para as aberturas.
- Uma campanha num feed que para de ser atualizado é anulada, e quem abriu perde os US$ 50; no primeiro dia, a lista
  evita isso.
- A frente da Sprint -1 (PR #36), que já porta o design para o `app/`, precisa mesclar a `main` de novo.

## Follow-up

- Sprint 04: construir as respostas; o plano técnico v0.1.2 registra as mudanças.
- Sprint 05: as três chaves da equipe no `admin_set_team` do deploy na devnet, a do Bernardo quando ele começar.
- Sprint 06: feeds novos entram na lista quando o keeper mantiver as contas deles.
- Sprint 16: os signatários do multisig, com o acordo escrito dos três co-fundadores.

## Fontes

- O comentário no PR #40: https://github.com/0x4cb-caramelo/Bakedtruth/pull/40#issuecomment-6083691878.
- `docs/business/ideacao-perguntas-e-respostas.md`, seção 1, "Decisões de 9 de outubro de 2026".
- `knowledge-base/tecnologia/pyth-feeds-patrocinados.md` (a contagem dos feeds).
- `programs/brot-markets/src/constants.rs` (`MIN_ENTRY_FLOOR_LAMPORTS`, `MIN_ENTRY_CEILING_LAMPORTS`,
  `MAX_OPEN_CAMPAIGNS_CEILING`).
