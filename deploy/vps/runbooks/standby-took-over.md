# Runbook: o standby assumiu o ciclo

**Alerta:** "standby took over".

**O que significa.** O primário falhou: o reinício pedido não o trouxe de volta, e o standby passou a rodar o ciclo
sozinho, a cada 5 minutos, com a vigia de feeds contínua. Ele envia transações agora. O CTO precisa saber que o
sistema roda em modo de contingência.

**Quem age.** O CTO. O revisor do dia ainda não tem nome.

**Como.**
1. Abra o diário do standby e confirme `takeover` com o motivo (`primary down`, `restart failed`).
2. Veja se há campanhas em `InReview` ou liquidação parada: a alerta "campaign idle" chega se houver.
3. Conserte o primário (ver `primary-down.md`). Quando ele responder de novo, o standby volta a só observar; confira
   no diário a linha de retorno.
4. Anote no `session-log/` o início e o fim do takeover, e o que o standby enviou nesse intervalo.

**Prazo.** Assumiu: a qualquer momento depois de 10 minutos de silêncio e 3 pedidos de reinício. Confira o estado em
até 30 minutos. Enquanto o standby roda, duas chaves podem enviar; o programa recusa a segunda chamada.
