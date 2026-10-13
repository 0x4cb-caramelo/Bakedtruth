# Runbook: preço SOL/USD velho (aberturas pagas bloqueadas)

**Alerta:** `sol_usd_stale`: a conta patrocinada SOL/USD da Pyth está mais velha que `max_price_age` da configuração,
ou não pôde ser lida (o campo `reason` diz por quê).

**O que significa.** Toda abertura paga é cobrada nesse preço. Enquanto ele estiver velho, o programa recusa abrir
campanha paga (`SolUsdStale` e parentes). Campanhas abertas, entradas e pagamentos continuam normais.

**Quem age.** O CTO.

**Como.**
1. Confira a idade (`ageSeconds`) e se o problema é geral da Pyth (status da Pyth, explorador da conta
   `7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE`).
2. Se a Pyth parou de atualizar a conta patrocinada na devnet, não há ação no nosso lado: registre e avise o time.
3. Se veio junto um `pyth_program_changed`, siga primeiro `pyth-program-changed.md`.

**Prazo.** Conferir em até 1 hora.
