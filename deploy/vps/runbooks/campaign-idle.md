# Runbook: campanha parada

**Alertas:** "campaign idle". Duas regras: uma campanha **resolvível** sem ação há mais de 10 minutos; uma campanha em
**liquidação** sem ação há mais de 30 minutos.

**O que significa.** O keeper deveria ter agido e não agiu: ou o preço já bateu e ninguém resolveu, ou a liquidação
travou. O sistema não paga sozinho se o keeper estiver parado.

**Quem age.** O CTO.

**Como.**
1. Confira o diário do keeper ativo (primário, ou standby se ele assumiu): procure `failed` ou `refused` com o
   endereço da campanha.
2. `refused` com nome de erro: anote o nome; não force o envio. Erros de leitura (`ProofStale`) voltam sozinhos no
   próximo ciclo.
3. `failed` sem nome: confira o saldo de SOL (ver `keeper-sol-low.md`) e a conexão do RPC.
4. Se o keeper estiver saudável e a campanha continuar parada, qualquer carteira pode chamar a mesma instrução; registre
   a chamada no `session-log/`.

**Prazo.** Confira em até 10 minutos da chegada (resolvível) ou 30 (liquidação).
