# Runbook: SOL baixo na carteira do keeper

**Alerta:** "keeper SOL low": o saldo da carteira do keeper (primário ou standby) está abaixo do piso,
`KEEPER_SOL_FLOOR_LAMPORTS` (padrão 0,5 SOL, a confirmar).

**O que significa.** O keeper paga só taxas de rede. Sem SOL, nenhuma resolução, liquidação ou reembolso sai. O
saldo não move dinheiro dos apostadores: a conta do keeper não tem privilégio on-chain.

**Quem age.** O CTO. Reabastecer é uma transferência da carteira de taxas (`fee_recipient`), feita pelo time: no
devnet, com a chave do time em máquina do time, nunca no servidor.

**Como.**
1. Confira o saldo da carteira do keeper (o endereço público está no diário de início, campo `keeper`). Não cole a chave.
2. Transfira SOL da carteira de taxas para o endereço do keeper. Valor: o suficiente para algumas semanas de taxas;
   o consumo real está no diário.
3. Espere a confirmação e confira o saldo de novo.

**Prazo.** Reabastecer em até 24 horas no devnet; antes do mainnet, o prazo sai do runbook de carteiras (Sprint 16).
