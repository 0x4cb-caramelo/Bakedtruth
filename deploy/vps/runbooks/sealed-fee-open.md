# Runbook: taxa de entrada selada aberta numa campanha finalizada

**Alerta:** `sealed_fee_open`: uma campanha finalizada (`Settling` ou `Settled`) ainda tem taxa de patrocinador
(`SealedFee`) aberta em mais de um ciclo do keeper. O `close_campaign` espera todas (`SealedFeesOpen`).

**O que significa.** Com `KEEPER_SETTLE=on`, o keeper liquida cada taxa (`settle_sealed_fee`) no mesmo ciclo em que vê a
campanha finalizada; se ela continua aberta, ou a liquidação está desligada, ou a instrução está sendo recusada (veja o
diário: `settle-refused` ou `settle-failed` com `sealedFee:` e o motivo). Um patrocinador cujo endereço não pode
receber lamports trava a taxa (achado I4 da Sprint 15).

**Quem age.** O CTO.

**Como.**
1. Confira `/healthz`: `settle` e `last.settle.pending.sealedFees`.
2. Com a chave desligada, decida com o fundador quem liquida (qualquer carteira pode; o destino é o gravado).
3. Com a chave ligada, leia o motivo da recusa no diário e registre no `session-log/`.

**Prazo.** No mesmo dia útil.
