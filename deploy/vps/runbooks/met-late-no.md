# Runbook: NÃO registrado com `met_late`

**Alerta:** "NO recorded with met_late".

**O que significa.** Uma campanha de estado irreversível (oferta já atingida) foi registrada como NÃO, porque o alvo
foi atingido só depois do prazo, numa leitura tardia. O sistema marcou `met_late`. Pela regra da BP, o time pode
anular a campanha dentro da janela de revisão.

**Quem age.** O CTO e o revisor do dia (sem nome ainda). A decisão de anular é do time, nunca automática.

**Como.**
1. Abra a campanha pelo endereço de conta nos registros e confirme o alvo e o horário da leitura.
2. Se a leitura tardia for correta e o alvo foi atingido a tempo, use `team_void_campaign` dentro da janela (`scripts/team/void.ts`,
   simulado por padrão; `--yes` só com decisão registrada).
3. Registre a decisão em `session-log/`, com o endereço e o motivo.

**Prazo.** Antes do fim da janela de revisão da campanha. Se a janela já fechou, registre e siga a regra do BP.
