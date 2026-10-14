# Plano de incidente (uma página)

Pedido pela Sprint 16 (BR-42; BP v0.0.4, Parte 4, §4: "uma página que diz quem pausa, quem fala pela casa e onde se
publica"; TP §7: "quão rápido, e quem substitui o CTO nos alertas"). O que está marcado **[F]** é decisão do fundador
e ainda não foi tomada; o resto vem do programa e dos runbooks como estão hoje.

## O que conta como incidente

Qualquer um destes: um alerta do keeper cujo runbook manda pausar (`deploy/vps/runbooks/`); uma leitura que parece
errada dentro da janela de 6 horas; um defeito relatado no programa; uma chave da equipe ou do admin que pode ter
vazado; o site ou a API mostrando um resultado diferente do da rede.

## Quem pausa, e o que a pausa faz

- **Qualquer chave da equipe pausa sozinha**, para ser rápido: `scripts/team/pause.ts --cluster <rede>` (simula; com
  `--yes` envia `team_pause_entries`).
- **A pausa só fecha a entrada de dinheiro novo:** abertura, entrada e entrada selada. Resolução, revisão, disputa,
  pagamento, devolução e fechamento continuam, com ou sem pausa (I10′). Não existe saque de emergência pela equipe.
- **Só o admin retoma** (`scripts/team/resume.ts`): no devnet, a chave de admin do Ronaldo; na rede principal, o
  multisig do admin, sem trava (M-1), que age em minutos.
- **Dentro da janela de 6 horas**, uma chave da equipe registra o motivo de uma anulação automática
  (`scripts/team/void.ts`) ou abre a disputa (`scripts/team/contest.ts`), e na etapa 1 pode levá-la ao admin
  (`--escalate`). Um SIM ou NÃO só é anulado pelo admin, na etapa 2, e nunca trocado por outro resultado.

## Quão rápido

- **Aprovado pelo Ronaldo em 14/10/2026:** alerta de dinheiro em risco (leitura errada na janela, defeito, chave
  vazada): pausar primeiro, investigar depois, no mesmo turno do alerta. Chave da equipe vazada: o admin troca a
  equipe (`scripts/team/set-team.ts`) logo depois da pausa.
- Os outros alertas seguem o prazo do próprio runbook.
- **[F], a decidir em equipe (Ronaldo, 14/10/2026):** o prazo público, em quanto tempo a casa diz algo depois de
  pausar.

## Quem fala pela casa, e onde

- **Quem fala pela casa** (decidido pelo Ronaldo em 14/10/2026): o Bernardo; na falta dele, o Lucas; por último, o
  Ronaldo.
- **[F], a decidir em equipe (Ronaldo, 14/10/2026):** onde se publica. A proposta é a página de incidente do site (TP
  §3.6, em `content/`, com revisão de duas pessoas antes de ir ao ar) e o canal da casa nas redes.
- O que se publica: o que aconteceu, o que está pausado e o que segue funcionando (pagamentos e devoluções), e o que
  muda para quem tem entrada aberta. Nunca uma chave, um endereço interno ou o nome de quem errou.

## Quem atende o alerta

- **O CTO (Ronaldo)** recebe os alertas hoje, sem substituto (BP Parte 4 §5.1).
- **Lembrete [F]:** quem substitui o CTO, o Lucas ou o Bernardo. Fica para a equipe (Ronaldo, 14/10/2026: "isso
  agora não é importante, mas coloque um lembrete"). Junto, as duas caixas de entrada que todo alerta deve alcançar
  antes da rede principal (Sprint 16). Hoje os alertas vão só para o diário do servidor.
- **[F]** Quem confere as resoluções na janela de 6 horas, por dia.

## Depois

Registro em `session-log/` no mesmo dia: o que aconteceu, o que se fez, quanto tempo levou e o que faltou. Um
defeito no programa segue `docs/audit/FIX-WORKFLOW.md`. A pausa e a retomada são ensaiadas uma vez antes da rede
principal (Sprint 18).
