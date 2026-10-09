# 2026-10-08 — Plano técnico v0.1.1: alinhado ao que a Sprint 02 construiu e mediu

## Context

A Sprint 02 foi mesclada na `main` pelo PR #35, junto com o PR #27, que trazia o plano técnico v0.1.0. Enquanto o #27
estava aberto e sem a revisão do fundador, o plano não podia ser editado; por isso o fechamento da sprint listou as
linhas velhas numa tabela, "TP to align after PR #27 merges", no fim de `docs/sprints/sprint-02-pot-core.md`. Com o #35
mesclado, a tabela pôde ser aplicada.

No corpo do PR #35 o fundador escreveu: "as decisões ali são minhas e do Ronaldo, e escritas por ele. O que foi feito lá
no código dele a gente traz como nova realidade [...] pode tocar ficha e continuar."

Fontes: o arquivo da Sprint 02 (a tabela, os tamanhos e o aluguel, o X0.9, os desvios, o que foi para as Sprints 03 a
05, as revisões e as decisões do fundador), os dois registros da Sprint 02 de 8/10/2026, o código em
`programs/brot-markets` e o `.github/workflows/ci.yml`.

## Decision

O plano técnico passa a v0.1.1. Cada linha da tabela foi aplicada, conferida no código ou nas fontes:

- **Versões:** `pinocchio-system` 0.6.1, fixado com o `pinocchio` 0.11.2; Shank e shank-cli 0.4.9; Mollusk 0.14.0, e não
  0.16.0, porque o 0.15 e o 0.16 dependem da Agave 4.3, que declara Rust 1.97.1. O crate `litesvm` 0.17 tem o mesmo
  problema: a Sprint 03 usa a versão mais nova que compila com o Rust 1.89 (a 0.16, a conferir) ou registra antes a
  troca de Rust.
- **Eventos:** por chamada do programa a si mesmo desde a Sprint 02 (T4 decidido no primeiro dia). Toda instrução
  termina com as contas `event_authority` e `program`. Saiu o `sol_log_data` como opção viva; a regra do decodificador
  contra eventos forjados ficou.
- **O que existe:** as dez instruções; os tamanhos e o aluguel medidos (abertura: 3.901.440 lamports na devnet); os três
  valores de treino (15 minutos, 10 minutos e o fechamento de entradas 5 minutos antes do prazo); `max_price_age` de 120
  s na inicialização da devnet; `checks::system_program`; o CI como está hoje.
- **O que muda de status:** o C42 respondido (nem o Pinocchio nem o runtime recusam a mesma conta em dois lugares); o
  T15 e o C30 feitos; a cópia do D6 na página em breve feita (`c82be03`); C14, C15, C16, C17, C30, C42 e C43 fechados
  na seção 14.4.
- **Decisões do fundador:** o D6 e a leitura do prêmio posto pela equipe (C44) passam a [FD], pelo texto do PR #35. O
  Q12 continua como confirmação.
- **Perguntas abertas na seção 14.2:** a lista de feeds da Pyth (e se o D-i cobre também os feeds); uma cota própria
  para as aberturas gratuitas da equipe; cobrar a abertura em `p − conf`; o feed do SOL/USD como constante do programa;
  e a entrada mínima lida a cada entrada, que chega às campanhas já abertas.
- **O cabeçalho:** os dois commits citados para o texto da v0.0.1 guardam o mesmo texto. O `2089b81` é o último que o
  mudou; o `0b40554` é a `main` de antes da v0.1.0. O cabeçalho cita os dois.

## Alternatives considered

- **Reescrever as seções inteiras com o que a sprint aprendeu.** Recusado: a tabela nomeia linhas, e o plano é a fonte
  que as sprints citam por seção. A mudança ficou em frases, com poucas extensões fora da tabela para não deixar o
  plano se contradizendo (a seção 13 com os 120 s e a chave vazada; o C20 e o E49 com a versão do `litesvm`).
- **Deixar o D6 e o C44 como confirmações pendentes.** Era o que o arquivo da sprint pedia antes do PR #35. O texto do
  fundador no PR toma o que foi construído como decisão, então os dois passam a [FD].
- **Tratar a entrada mínima como decidida pelo código.** Recusado: o fundador decidiu o que foi construído, mas os
  termos publicados prometem o contrário ("An open market keeps the rules it opened with"), e a pergunta pede algo que
  não existe. Fica [Q].

## Consequences

- O plano técnico passa a descrever o que o código da Sprint 02 faz, com as medidas dela.
- A seção 14.2 tem seis linhas novas abertas: as quatro das revisões, a entrada mínima e a confirmação do Q12.
- Nenhum código mudou.

## Follow-up

- O fundador responder às quatro perguntas das revisões antes da Sprint 03, e à da entrada mínima.
- O Q12, confirmado de vez antes do deploy da Sprint 05.
- O estado da Sprint 02 foi corrigido no mesmo PR, onde ainda dizia "em revisão no PR #30": o topo do arquivo da
  sprint, o cabeçalho do bloco "não lançado" e o "Em aberto" do `CHANGELOG.md`, o `docs/SPRINTS.md` e o `CLAUDE.md`.
  A tag `sprint-02` espera o fundador.
