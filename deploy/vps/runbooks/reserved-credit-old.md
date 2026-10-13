# Runbook: parte do criador reservada há mais de 7 dias

**Alerta:** `reserved_credit_old`: a parte do criador de uma campanha ficou reservada no cofre (a carteira do criador
estava vazia demais para recebê-la sem ficar abaixo do mínimo de aluguel) e continua lá há mais de 7 dias, contados da
resolução (a campanha não guarda a hora da reserva; por isso o alerta pode chegar até a janela de revisão antes).

**O que significa.** O dinheiro é do criador e está seguro no cofre. No programa atual quem paga o aluguel é sempre o
criador, e o `close_campaign` paga a reserva junto com os aluguéis; o keeper com `KEEPER_SETTLE=on` fecha a campanha
no mesmo ciclo. Uma reserva velha quer dizer que o fechamento não está acontecendo.

**Quem age.** O CTO.

**Como.**
1. Confira em `/healthz` se o keeper liquida (`settle: "on"`) e se a campanha está em `last.settle.pending.close`.
2. Com a chave desligada, decida com o fundador quem fecha (qualquer carteira pode chamar `close_campaign`; o destino
   é sempre o gravado).
3. O criador também pode reivindicar a reserva sozinho, com `settle_creator_share`, a partir de uma carteira com saldo.

**Prazo.** Em até uma semana depois do alerta.
