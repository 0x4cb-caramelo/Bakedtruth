# Sprint 12 — Site: minhas apostas e estados da pergunta

**Estado:** planejada · **Branch:** `sprint-12-site-my-bets-states` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B8 (seções 3.6 e 14.1) |
| Depende de | Sprint 11; a 06, para haver pagamento de verdade |
| Regras e fluxos cobertos | R-10, R-11, R-23, R-24 e R-25, no que a pessoa vê. F3, F4, F5 e F6 |

## Objetivo

A pessoa acompanha o que apostou até o dinheiro chegar: fechada, em revisão com o relógio, paga, anulada, e o caso
do valor que não chegou.

## Critério de pronto

- [ ] `/minhas-apostas` mostra cada aposta com o lado, o valor, o retorno estimado, o estado e o que já foi
      recebido. As posições abertas vêm da rede; o histórico, de `/api/v1/wallets/:address/positions`.
- [ ] `/q/[id]` existe em cada estado:
  - **fechada:** o painel de aposta sai, com o motivo (prazo ou fato já acontecido);
  - **em revisão:** resultado, número lido, meta, link, o relógio de 6 horas e "Pago sozinho, em até 6 horas";
  - **contestada:** pagamento pausado e o prazo novo;
  - **paga:** SIM ou NÃO, e o valor recebido;
  - **anulada:** o motivo público e a devolução sem taxa.
- [ ] No pote de um lado só, a tela explica a devolução, o 1% e a isenção do primeiro apostador.
- [ ] Valor reservado, por conta de USDC fechada: a tela mostra o valor. Se a resposta de Q2 for "b", mostra também
      a ação "receber".
- [ ] `/registro` lista as anulações e as decisões, com o motivo, a partir de `content/void-log/`.
- [ ] A página diz por onde avisar a equipe de um resultado errado (L-13).
- [ ] Não existe botão de resgate.
- [ ] Ensaio na devnet, com o keeper: uma pergunta SIM, uma NÃO, uma anulada e uma de um lado só passam por todas
      as telas.
- [ ] `cd app && bun run lint && bun run build` passa.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- As funcionalidades "minhas apostas" e "registro", em `app/features/`.
- Os estados da página da pergunta e do card.
- `content/void-log/`, com o formato de um registro.

## Fora desta sprint

A contestação pelo apostador, com depósito (fase 1.2). Avisar o usuário de resolução ou pagamento: não há canal no
MVP (L-16). O painel da equipe. O quadro de quem pode o quê (16).

## Decisões do fundador que travam a sprint

- **L-13:** qual é o canal público de contestação.
- **L-04:** o nome público do estado enquanto o pagamento está pausado. O programa chama de `Contested`.
- Precisa estar respondida **Q2**, da Sprint 04.

## Agentes e skills

- **Agentes:** `dev-product-agent`, `copywriter-agent` (os textos de cada estado), `technical-security-red-team-agent`
  (a ação "receber"), `coordinator-agent`.
- **Skills:** `feature-scaffold`, `sprint-management`, `verify-build-works`, `codemap`, `secrets-scan`,
  `release-check`.

## Portões de segurança

- `content/void-log/` fica no Git e entra com a revisão de duas pessoas.
- "Receber" só existe para o valor reservado, e o destino continua sendo a carteira que apostou.
- O texto é "Pago sozinho, em até 6 horas"; nunca "pago em minutos".
- `secrets-scan` no fechamento.

## Testes

Build e lint. O ensaio dos quatro desfechos na devnet. A soma de "recebido" na tela bate com os eventos
`PositionSettled`.

## Riscos

- A posição fecha no pagamento: o que foi recebido só existe nos eventos. Se o indexer atrasar, a tela mostra menos.
- Sem canal de aviso, a pessoa só descobre o pagamento se voltar ao site.
- O estado "contestada" não ter saída antes da Sprint 14 (ver a Sprint 04).

## Artefatos esperados

`app/features/` (minhas apostas, registro), `content/void-log/`, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** minhas apostas; estados da pergunta; registro público.
- **Session-log:** o canal de contestação escolhido; o nome público do estado de disputa.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
