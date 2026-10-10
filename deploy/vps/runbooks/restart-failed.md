# Runbook: o reinício do primário falhou

**Alerta:** "restart failed": o standby pediu o reinício três vezes (`POST /restart`), sem resposta do primário, e
passou a assumir o ciclo (ver `standby-took-over.md`).

**O que significa.** O pedido de reinício foi assinado e aceito, mas o processo não voltou. Ou a assinatura foi
recusada (segredo errado ou relógio desalinhado de mais de 60 segundos), ou o caminho `brot-keeper-restart.path`
não está instalado.

**Quem age.** O CTO, com o dono do servidor avisado antes de qualquer mudança.

**Como.**
1. No primário: `systemctl status brot-keeper-restart.path` e `journalctl -u brot-keeper-restart`. Se o caminho não
   está instalado, é o motivo: a instalação precisa de aviso prévio ao dono do servidor (README, "Sprint 07").
2. Se o caminho está ativo e o arquivo de bandeira ficou parado, reinicie a mão: `sudo systemctl restart brot-keeper`.
3. Se a assinatura foi recusada, confira o relógio do VM 2 (`timedatectl`). Não troque o segredo sem registrar.

**Prazo.** Em até 30 minutos, enquanto o standby mantém o ciclo.
