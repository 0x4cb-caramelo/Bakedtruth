# Runbook: o keeper primário não responde

**Alerta:** "primary down" (e-mail para as duas caixas, quando o provedor de e-mail for escolhido; até lá, linha
`alert` no diário do standby).

**O que significa.** O standby não recebeu resposta de `GET /healthz` do primário há 10 minutos. A vigia confere a
cada 5 minutos. Ainda não é certeza de falha: pode ser o túnel, a rede ou o próprio processo.

**Quem age.** O CTO. O revisor do dia ainda não tem nome (Sprint 16); até lá, quem recebe o alerta é o CTO.

**Como.**
1. Confirme no servidor: `systemctl status brot-keeper` e `journalctl -u brot-keeper -n 50`. Não copie URLs nem chaves
   para chats.
2. Se o processo parou, peça o reinício pelo caminho de sempre: `sudo systemctl restart brot-keeper`.
3. Se o processo roda mas não responde, veja o túnel (`brot-tunnel`), sem alterar a configuração dele sem aviso.
4. Ao voltar, o alerta "standby took over" não se repete sozinho: confira no diário do standby que ele voltou a
   dormir (só envia de novo quando o primário cai).

**Prazo.** Vigia: a cada 5 minutos. Assume o standby após 10 minutos de silêncio e 3 pedidos de reinício sem
resposta. Aja em até 15 minutos da chegada do alerta.
