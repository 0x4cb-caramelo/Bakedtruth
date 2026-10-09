# 2026-10-09 — Sprint 04: as seis decisões do fundador e a emenda do contrato

## Decisões confirmadas pelo fundador (2026-10-09)

1. **Recuperação tardia: a etapa `tally_late_joins`.** Entre a resolução e a finalização, uma instrução lê as contas
   de junção de cada padeiro, soma o que foi feito a partir do `publish_time` da prova do SIM e fecha cada conta com
   o aluguel de volta ao padeiro. A campanha só finaliza quando todas as entradas estão contabilizadas. A regra não
   muda: a parte tardia volta inteira, e o instantâneo a subtrai.
2. **Conta de junção na `UserJoinCampaign`, posição 6.** A conta de junção entra antes do System Program, que passa
   para a posição 7; o evento vai para 8 e o programa para 9. A liquidação recebe as contas de junção depois dos slots
   fixos — não, agora, porque a contabilização tira as junções da liquidação (ver a emenda).
3. **Margem de 1% no buffer de entrada**, e o risco residual que a frente G reportou (um movimento que cruza o alvo
   dentro de um intervalo de publicação e nunca aparece perto antes) fica aceito.
4. **Campanha sem entrada, anulada por falha da casa:** a Brot fica com os 10% (resposta 8).
5. **Motivos de anulação que a equipe pode escolher:** `MissedWindow`, `StaleFeed`, `TeamHouseFailure`,
   `TeamOutsideCause`. Não podem: `None` e `UnreadableAccount`.
6. **Piso de aluguel: lido do sysvar do Rent.** O programa lê o valor no momento da operação.

## Correção de um erro meu

Eu havia sugerido que o valor de 650.240 lamports da TP estava errado (a conta do modelo dava 890.880). Não está: a TP
mediu 650.240 na devnet em 2026-10-08, a 5.080 lamports por byte (`getMinimumBalanceForRentExemption`, [E55]). O
número de 890.880 vem do valor por byte padrão do LiteSVM, que é mais antigo. Por isso **não alterei a TP**. O que muda
é o modelo de teste: deve ler o sysvar do Rent do LiteSVM, não usar o padrão. (Decisão 6 continua: o programa lê do
sysvar.)

## Emenda do contrato (commit deste registro)

- `Campaign` (512 bytes, inalterado): `publish_time` (i64, gravado pela resolução), `late_yes`, `late_no` (u64, somados
  pela contabilização), `entries_untallied` (u32, decrementado por entrada contabilizada). Reserva: 20 bytes.
- `Entry` (100 → **116 bytes**): `joins_tallied` (u32), `late_yes`, `late_no` (u64) por padeiro. Reserva: 8 bytes.
- `UserJoinCampaign`: conta `join` na posição 6 (gravável); System Program 7, evento 8, programa 9.
- `tally_late_joins` (discriminador 21): campanha (gravável), entrada (gravável), padeiro (gravável, recebe o aluguel),
  evento e programa; depois, as contas de junção, em ordem de índice, pelo menos uma. Corpo: lote G (stub por enquanto).
- Evento `LateTallied` (discriminador 17, 92 bytes); erro `NotTallied` (6114, bloco C).

## Pendente nas frentes

- **Frente C (finalização e liquidação):** a finalização recusa com `NotTallied` enquanto houver entrada não contabilizada;
  a liquidação não recebe contas de junção (a conta de junção sai na contabilização) e recusa uma entrada não
  contabilizada. A taxa de uma pote de um só lado sai da soma por entrada, guardada na campanha (a frente D recebe
  essa regra).
- **Frente G:** escrever a conta `Join` na `UserJoinCampaign` (slot 6), o corpo de `tally_late_joins`, e atualizar a
  entrada para 116 bytes.
- **Frente D:** `publish_time` gravado pela resolução (registro da Sprint 03).
