# Runbook: estágio 2 perto do prazo, sem decisão

**Alerta:** `contest_stage2_ending`: uma disputa no estágio 2 tem menos de 6 horas até o prazo (`contestEndsAt`) e o
admin ainda não decidiu. O campo `minutesLeft` diz quanto falta.

**O que significa.** Quando o prazo passa sem decisão, a disputa caduca: o resultado gravado vale e o keeper finaliza
a campanha e paga. Se o admin queria anular, é agora.

**Quem age.** O admin (no mainnet, a multisig 2 de 3).

**Como.**
1. Leia o motivo da disputa e a releitura (veja `contest-reread-differs.md`).
2. Decida com `scripts/team/decide.ts` (confirmar ou anular, com a nota) antes do prazo.
3. Se a decisão é deixar o resultado valer, não há o que fazer: registre no `session-log/`.

**Prazo.** Antes de `contestEndsAt`.
