# Runbook: o standby pediu o reinício do primário

**Alerta:** `restart_requested`: o standby, depois de 10 minutos sem resposta do primário, mandou um `POST /restart`
assinado (tentativa `attempt` de 3, uma a cada 5 minutos).

**O que significa.** O primário está calado. O pedido grava o arquivo-sinal no primário; a unidade `path` da raiz
reinicia o keeper, se estiver instalada (hoje não está, por decisão de 2026-10-10). Se o pedido falhou, chega também
`restart_failed`.

**Quem age.** O CTO.

**Como.** Siga `primary-down.md`. Se as três tentativas passarem sem resposta, o standby assume
(`standby-took-over.md`).

**Prazo.** Conferir em até 15 minutos.
