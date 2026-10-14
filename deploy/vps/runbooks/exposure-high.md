# Runbook: SOL demais nos cofres das campanhas

**Alerta:** `exposure_high`: a soma dos lamports em todos os cofres de campanha ainda não fechados passou do limite
`KEEPER_EXPOSURE_ALERT_LAMPORTS` (padrão 100 SOL, aprovado pelo fundador em 13/10/2026).

**O que significa.** Nenhum teto limita quanto o programa guarda (BP v0.0.4: sem cap). Se houver um defeito no
programa, é isso que está em risco. O alerta não diz que há defeito: diz que a exposição cresceu além do combinado.

**Quem age.** O CTO. O fundador revê o número uma vez por mês.

**Como.**
1. Confira em `/healthz` o campo `last.exposureLamports` e quantas campanhas estão abertas (`last.campaigns`).
2. Veja se o crescimento é esperado (uma campanha grande, um parceiro novo) ou estranho (entradas repetidas de poucas
   carteiras, uma campanha que não liquida).
3. Se o número for esperado, combine com o fundador um novo limite e troque a variável no `keeper.env`.
4. Se não for, avalie pausar as entradas (`scripts/team/pause.ts`, simulado sem `--yes`) e registre no `session-log/`.

**Prazo.** No mesmo dia útil.
