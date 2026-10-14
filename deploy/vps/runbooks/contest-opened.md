# Runbook: disputa aberta (estágio 1 ou 2)

**Alerta:** `contest_opened`: uma campanha está em disputa (`Contested`). Dispara uma vez por estágio: no estágio 1
(uma chave do time abriu a disputa dentro da janela) e de novo no estágio 2 (o time escalou, ou uma releitura deu
diferente). O campo `contestEndsAt` é o prazo do estágio.

**O que significa.** O pagamento está pausado. No estágio 1 qualquer carteira pode reler a campanha
(`reread_campaign`): a mesma leitura paga a partir do prazo do estágio 1 (24 horas); uma leitura diferente leva ao
estágio 2. No estágio 2 o admin decide (confirma ou anula) em até 48 horas. Sem decisão, o resultado gravado vale e o
keeper finaliza a campanha quando a disputa caduca (no máximo 78 horas depois da resolução).

**Quem age.** O time (estágio 1: decidir se escala); o admin (estágio 2: decidir).

**Como.**
1. Abra a campanha pelo endereço e leia o motivo da disputa no registro do time.
2. Estágio 1: se o time quer a decisão do admin, escale com `scripts/team/contest.ts <campanha> --escalate`, antes do
   prazo.
3. Estágio 2: o admin decide com `scripts/team/decide.ts` e publica a nota em `content/void-log/` quando anular.
4. O keeper nunca abre, escala ou decide uma disputa: só relê (com o RPC B configurado) e finaliza o que caducou.

**Prazo.** Estágio 1: antes das 24 horas. Estágio 2: antes das 48 horas (veja `contest-stage2-ending.md`).
