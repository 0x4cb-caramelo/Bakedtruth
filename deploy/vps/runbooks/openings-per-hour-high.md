# Runbook: aberturas demais em uma hora

**Alerta:** `openings_per_hour_high`: mais campanhas abertas na última hora do que `KEEPER_OPENINGS_PER_HOUR_MAX`
(padrão 20, aprovado pelo fundador em 13/10/2026).

**O que significa.** Um pico de aberturas: lançamento de parceiro, um bot, ou uma chave do time vazada (veja também
`team-key-opening.md`). Abrir custa US$ 500 para quem não é do time, então um pico pago é caro para quem o faz.

**Quem age.** O CTO.

**Como.**
1. Liste as campanhas abertas na última hora (site, API ou `/healthz`) e veja quem abriu.
2. Se forem aberturas do time sem combinação, siga `team-key-opening.md`.
3. Se for um pico legítimo, confira se o ciclo do keeper continua abaixo de 60 s (`last.durationMs`) e se o limite
   de campanhas abertas está longe (`open-campaigns-high.md`).

**Prazo.** Revisar em até 1 hora.
