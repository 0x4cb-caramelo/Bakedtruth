# Runbook: campanhas abertas acima de 80% do limite

**Alerta:** "open_campaigns above 80%" do `max_open_campaigns`.

**O que significa.** Há mais campanhas abertas do que o limite de operação permite com folga. Abrir mais pode saturar
o ciclo do keeper (1.000 campanhas é a carga testada). O limite está na configuração on-chain.

**Quem age.** O CTO.

**Como.**
1. Confira o número em `/healthz` (campo `last.openCampaigns`) e o limite na configuração on-chain.
2. Se a tendência for de crescimento, avise o founder antes de subir o limite. Subir o limite não é ação de rotina.
3. Se o ciclo passar de 60 segundos (diário), veja o campo `durationMs` no diário.

**Prazo.** Revisar no mesmo dia útil.
