# 2026-10-05 — Regra de fechamento de interação

## Context

Depois do fechamento da Sprint 00 e da auditoria de documentação, o Lucas pediu uma regra de trabalho: "a cada
interação comigo, quero que você finalize com um breve relatório do que foi feito, num texto minimamente
compreessível, e depois me diga quais os próximos passos, trazendo sugestões dos caminhos, pensando o plano, e me
dizendo qual seria a recomendação pra gente."

Ao longo da sessão ele já tinha reclamado de respostas sem contexto e de expressões complicadas, e as respostas
longas do dia terminavam ora com um resumo, ora com uma lista de pendências, sem forma fixa.

## Decision

1. **A regra vira arquivo do projeto**, `.claude/rules/interaction-closing.md`. O assistente carrega tudo que está
   em `.claude/rules/` no começo de cada sessão, então ela vale para qualquer conversa neste repositório.
2. **Duas partes, nesta ordem:** o que foi feito, e os próximos passos.
3. **O relatório** começa pelo resultado, usa português simples, separa o que foi conferido do que não foi, diz o
   que deu errado e o que mudou fora do repositório, e é proporcional ao tamanho da interação.
4. **Os próximos passos** trazem de dois a quatro caminhos, cada um com o que entrega e o que custa, ligados ao
   roteiro de sprints e ao que está em aberto no changelog; uma recomendação só, com o porquê; e, à parte, o que
   depende dele.
5. **A regra também entra na lista de regras de ouro do `CLAUDE.md`**, como item 8.

## Alternatives considered

- **Guardar só na memória do assistente.** Valeria para as sessões desta máquina e deste usuário. Como regra do
  projeto, vale para qualquer pessoa ou agente que trabalhe no repositório, e fica no histórico.
- **Um formato fixo, com cabeçalhos obrigatórios e tamanho mínimo.** Deixaria toda resposta curta com cara de
  relatório. A regra pede proporção: uma pergunta respondida fecha em uma ou duas linhas.
- **Sempre três caminhos.** Forçaria a inventar opção quando só uma faz sentido. A regra manda dizer isso.

## Why this decision

Ele decide o rumo do produto e não acompanha cada passo técnico. Um fechamento com forma fixa deixa a decisão dele
mais barata: ele lê o que mudou, vê as opções e responde com um número.

## Risks

- **Respostas mais longas.** O fechamento soma texto a toda interação. A regra limita o relatório a uma tela.
- **Recomendação repetida.** Se a mesma pendência trava vários dias, ela aparece em todo fechamento. É de propósito:
  a regra manda não esconder pendência antiga que continua travando algo.

## Follow-ups

- Aplicar a partir da própria resposta em que a regra foi criada.

## Related links

- A regra: [`.claude/rules/interaction-closing.md`](../.claude/rules/interaction-closing.md)
- Roteiro de sprints: [`docs/SPRINTS.md`](../docs/SPRINTS.md)
- Sprint: —
