# Runbook: campanha aberta por uma chave do time

**Alerta:** `team_key_opening`: uma campanha foi aberta por uma chave que está em `GlobalConfig.team`. Dispara uma vez
por campanha (na primeira hora depois da abertura).

**O que significa.** A chave do time abre de graça. Se a chave vazou, alguém pode abrir campanhas sem pagar os
US$ 500. Na maior parte das vezes é o próprio time; o alerta existe para que cada abertura seja reconhecida.

**Quem age.** O CTO, com quem tem chave do time.

**Como.**
1. Pelo endereço da campanha e do `creator` no alerta, confirme com o time quem abriu e por quê.
2. Se ninguém do time reconhece: trate como vazamento. Pause as entradas (`scripts/team/pause.ts`), tire a chave do
   time (`scripts/team/set-team.ts`, pelo admin) e só depois investigue.
3. Registre no `session-log/` a abertura e a confirmação (ou o incidente).

**Prazo.** Reconheça em até 1 hora. Vazamento: aja na hora.
