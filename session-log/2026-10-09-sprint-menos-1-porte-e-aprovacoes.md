# 2026-10-09 — Sprint -1: aprovações do Ronaldo, o porte para o `app/` e as decisões de 9 de outubro

## Context

A sessão anterior (8/10) deixou as respostas de design no repositório, mas as aprovações das telas e dos avisos
ainda não estavam. Ronaldo as deu no dia 9, em uma mensagem, e pediu para seguir: marcar a sprint como aprovada,
gravar as respostas dele na Q&A, mesclar a `main` na branch da Sprint -1, começar o porte para o `app/` e registrar
tudo no session-log e no CHANGELOG. Ele respondeu em inglês; o registro segue em português, como o resto do diário.

## Decisions

- **Aprovadas por Ronaldo, como estão hoje:** as telas redesenhadas, a caixa de abrir campanha, os layouts de celular,
  o aviso ao criador (P-9, como a BP-14 recomenda), o aviso de trava (L-03, opção A, a do protótipo).
- **L-24, selo de parceiro: chip** (não a faixa). Ronaldo escreveu "chip, not band".
- **Lista de feeds de preço (pergunta 1): fechada na opção C**, uma lista própria da Brot que começa com a lista oficial
  da Pyth no primeiro dia (62 feeds na rede principal, 17 na devnet). A resposta vinha de antes, e a Q&A ainda a
  dava como aberta.
- As perguntas 2 a 9 de 9/10 estão na Q&A (`docs/business/ideacao-perguntas-e-respostas.md`, seção 1). A resposta
  que vale para a 2 é `p − conf`, já decidida no dia anterior.

## What was done

- **Branch da Sprint -1 com a `main` mesclada** (por merge, não rebase, como pedido). Conflitos só no CHANGELOG (as duas
  entradas ficaram, a da Sprint 02 e a da `/2`) e no `CODEMAP.md`, regenerado.
- **Porte para o `app/`:** tokens das duas temas em `app/styles/tokens.css` (escuro em `:root`, claro em
  `[data-theme='light']`); as duas fontes do protótipo em `app/fonts/`, servidas pelo `next/font/local`, sem fonte de
  terceiros na página; script de tema no `<head>` com `brot-theme`, padrão escuro; sete primitivos em
  `app/components/ui/` (botão, chip de estado, token, Sim/Não, barra de progresso, aviso, botão de tema). Lint e build
  passaram.
- **Não feito:** o resto do inventário de componentes, a re-leitura da tabela de conflitos, as telas e a caixa de abrir
  campanha no `app/` (são das Sprints 09 a 13 e 19), e o fechamento comum da sprint.

## Consequences

- O `app/` antigo muda de aparência já agora. As classes da direção C continuam como apelidos, para as telas de hoje
  não quebrarem; elas são reescritas nas Sprints 09 a 13.
- A Sprint 03 não foi tocada nesta sessão. Ela já tem trabalho aberto em outra sessão (PR #40, ainda não mesclado).
- Este registro não toca os itens de dinheiro do programa; eles seguem na Sprint 03 e 04.

## Open

- A Sprint -1 segue aberta até o fechamento comum (`docs/SPRINTS.md`, seção 4).
- A PR #36 (Sprint -1, que ainda estava como "à espera da aprovação") precisa de atualização depois do merge com a `main`.
