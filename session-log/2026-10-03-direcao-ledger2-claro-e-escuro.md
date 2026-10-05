# 2026-10-03 — Direção escolhida: Ledger² (D), com tema claro (N); app em espera pelo upstream

## Context

O dia começou com a direção de design em aberto e treze direções no Prototype Lab (ver
[`2026-10-03-lab-de-d-a-m-e-direcao-reaberta.md`](2026-10-03-lab-de-d-a-m-e-direcao-reaberta.md)). Na retomada, o
Lucas decidiu em dois passos:

1. Primeiro: F (Tape²) como layout oficial e K (Desk) como tema claro, "como se um fosse o light e o outro o dark",
   com um meio-termo para a inversão, e autorização para implementar no app.
2. Antes de qualquer arquivo do app ser alterado, ele mandou esperar: "A gente tem que se basear no repo cf07, o
   Ronaldo vai atualizar lá agora". Com o Ronaldo ainda sem atualizar, veio o segundo passo: "vamos usar o layout D,
   Ledger2, e dele queremos a sua versão light".

## Decision

1. **O layout do site é a D · Ledger²**, no escuro, com **uma versão clara da própria D**. Isso substitui a aprovação
   da C (2 de outubro) e a combinação F + K (algumas horas antes, nunca implementada).
2. **A versão clara foi construída no lab como direção N** (`prototype-lab/prototype-n/`), não no app. Mesma marcação
   da D, mesmos blocos de `shared/ledger.js`; só um conjunto de tokens claros sobre `shared/ledger.css` e um botão de
   tema. O escuro da N são os valores padrão de `ledger.css`, que reproduzem a D.
3. **O app (`app/`) fica parado até a sincronização com `0xcf07/pred-provable`.** Ele continua com o layout da C.
4. **As outras direções ficam no lab.** Ninguém pediu para apagar.

## Alternatives considered

- **F no escuro e K no claro:** foi a escolha de poucas horas antes. Eram duas direções com forma e tipografia
  diferentes (pixel e sombra dura contra papel e IBM Plex), o que exigiria tokenizar também borda, raio, sombra e
  fonte para o botão de tema parecer uma inversão. O Lucas não registrou por que trocou; a D com versão clara resolve
  a mesma vontade com uma direção só.
- **Usar a K como o claro da D:** a K já é clara e nasceu da estrutura da D, mas tem outra tipografia, cantos retos e
  acrescenta tabela, faixa de números e feed. O pedido foi a versão clara da D, não outra direção.
- **Implementar direto no app:** descartado por ordem do Lucas enquanto o upstream não é atualizado. A sessão de 2 de
  outubro já tinha mostrado o custo de aplicar layout numa base prestes a ser substituída.
- **N só clara, sem botão:** o botão custa pouco e mostra a inversão, que é o que o app vai precisar.

## Why this decision

A D era a direção que o Lucas vinha apontando como a mais próxima ("o ledger2 é o que está mais próximo"). Fazer a
versão clara como tokens sobre a mesma estrutura mantém um site só com dois temas, e deixa a passagem para o app
barata: são variáveis, não componentes novos.

## Risks

- **A N foi aprovada pelo Lucas no mesmo dia** ("N aprovado"), depois de vê-la no lab. A paleta clara (chão `#eef1f6`,
  painéis brancos, azul `#2f5fe6`, âmbar `#b5670f`) foi proposta de quem construiu e conferida em navegador headless;
  ele não pediu ajustes.
- **`DESIGN-DIRECTION.md` continua descrevendo a C** abaixo da linha de status. Enquanto não for reescrito, a Fase 4
  não tem de onde derivar o Product Brief.
- **O app e o documento de direção discordam** do que foi decidido até a sincronização acontecer.
- **A escolha segue sem BP:** não há personas nem posicionamento escritos para ancorá-la (Fase 2 não rodou).
- **"Upcoming" e "Sponsor a goal" existem na D e não no programa.** Na passagem para o app precisam virar lacuna
  registrada ou ser trocados por algo que o programa tenha.
- Contraste dos textos pequenos da N foi estimado, não medido com ferramenta.
- Nada disto está commitado.

## Follow-ups

- Reescrever `DESIGN-DIRECTION.md` para D e N (tokens dos dois temas, telas, fluxo, lacunas, o que foi rejeitado).
- Commit do que está no disco antes de trazer o upstream; depois, sincronizar com `0xcf07/pred-provable`.
- Aplicar D e N ao app depois da sincronização.
- Decidir o que fazer com a Fase 2 (BP) e seguir para a Fase 4.

## Related links

- Lab: [`prototype-lab/README.md`](../prototype-lab/README.md)
- Direção: [`docs/product/DESIGN-DIRECTION.md`](../docs/product/DESIGN-DIRECTION.md)
- Decisão anterior: [`2026-10-03-lab-de-d-a-m-e-direcao-reaberta.md`](2026-10-03-lab-de-d-a-m-e-direcao-reaberta.md)
- Sprint: —
