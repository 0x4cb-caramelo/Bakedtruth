# 2026-10-09 — Sprint -1: a `main` mesclada na branch, os primitivos portados e o registro no DESIGN-DIRECTION

## Context

A sessão anterior deixou o porte para o `app/` com os tokens, o script de tema, as fontes e sete primitivos, e a
lista do que faltava na seção "Porte" do `DESIGN-DIRECTION.md`. O pedido desta vez foi começar a "Front B": portar os
tokens, o script de tema, as fontes e os componentes para o `app/`, e registrar o resultado no `DESIGN-DIRECTION.md`,
depois de puxar a `main` (com as PRs #37 e #40 já mescladas). "Front B" não aparece em nenhum documento do repositório;
a leitura tomada foi o porte da Sprint -1, que é o que o `DESIGN-DIRECTION.md` e a sprint pedem.

## Decisions

- **A `main` entrou na branch por merge, não por rebase**, como nas sessões anteriores. Conflitos em `CHANGELOG.md`,
  `CODEMAP.md`, `session-log/INDEX.md` (as duas partes ficaram), em `docs/SPRINTS.md` (a linha -1 aprovada da branch e
  as linhas 02 a 04 da `main`) e nas respostas de 9/10 (a versão da `main`, que é a completa e a que está na PR #40).
- **O `Odds` (botões Sim/Não com preço em centavos) virou `SideButton`, com a chance em %.** O preço é um conceito
  do modelo antigo; o conflito 1 do `DESIGN-DIRECTION.md` já o retirava do produto.
- **Os primitivos são finos sobre classes de um só arquivo de estilo** (`app/styles/ui.css`, cópia do `components.css`
  aprovado do protótipo). Assim a aparência vem de um lugar só, e cada primitivo nomeia a classe que usa.
- **Não portados nesta etapa, com o motivo no registro:** campos, diálogo, menu e avisos rápidos (quem os usa é a
  caixa de abrir e a entrada, Sprints 11 e 19); cartão, carrossel, cabeçalho, rodapé e a moldura do site (Sprints
  09 a 13). A caixa de abrir campanha e os layouts de celular não foram portados: são telas.
- **Acréscimo ao protótipo:** a regra de movimento reduzido para a borda que gira e o esqueleto. O protótipo prometia
  a regra em um comentário e não a tinha.

## What was done

- Merge de `origin/main` na branch `sprint--1-design-system` (commit `e6d3da5`).
- `app/styles/ui.css` (novo), importado por `app/app/globals.css`.
- Primitivos em `app/components/ui/`: `button`, `side-button` (no lugar de `odds`), `token`, `state-chip`, `seal`,
  `split-bar`, `moments`, `live-value`, `empty-state`, `notice`, `segmented`, `skeleton`; `progress` e `theme-toggle`
  ficaram como estavam.
- `docs/product/DESIGN-DIRECTION.md`: a seção "Porte" foi reescrita com a tabela de primitivos, o que ficou de fora e
  por quê, o que continua aberto e a verificação desta etapa.
- `docs/sprints/sprint--1-design-system.md`: a linha de status foi atualizada.

## Consequences

- O `app/` ainda não mostra nenhum primitivo; a página atual continua na direção C, com as classes antigas como
  apelidos. Os primitivos estão prontos para as Sprints 09 a 13.
- A Sprint -1 segue aberta: falta a re-leitura da tabela de conflitos, o teste de contraste em `tests/`, a verificação
  visual nos dois temas e o fechamento comum.

## Open

- A caixa de abrir campanha e os layouts de celular: portar nas Sprints 09 a 13 e 19, com o protótipo como referência.
- O teste automático de contraste (`tests/`, "design tokens meet contrast") e a verificação visual em navegador.
