# Runbook: campanha parada

**Alertas:** `campaign_idle`. Duas regras: uma campanha **resolvível** (o programa aceitou a simulação de
`resolve_campaign`) que continua aberta há mais de 10 minutos (`phase: "resolvable"`); uma campanha em **liquidação**
(janela de revisão encerrada, ou já finalizada e não fechada) cuja conta não muda há mais de 30 minutos
(`phase: "settling"`). O campo `keeperSettles` diz se o keeper que alertou liquida (`KEEPER_SETTLE=on`). O tempo é
contado pelo relógio da máquina desde o primeiro ciclo que viu a condição; um reinício começa a contagem de novo.

**O que significa.** O keeper deveria ter agido e não agiu: ou o preço já bateu e ninguém resolveu, ou a liquidação
travou. O sistema não paga sozinho se o keeper estiver parado.

**Quem age.** O CTO.

**Como.**
1. Confira o diário do keeper ativo (primário, ou standby se ele assumiu): procure `failed` ou `refused` com o
   endereço da campanha.
2. `refused` com nome de erro: anote o nome; não force o envio. Erros de leitura (`ProofStale`) voltam sozinhos no
   próximo ciclo.
3. `failed` sem nome: confira o saldo de SOL (ver `keeper-sol-low.md`) e a conexão do RPC.
4. `phase: "settling"` com `keeperSettles: false`: a liquidação pelo keeper está desligada (decisão do fundador). Até
   ela ser ligada, alguém do time liquida à mão (qualquer carteira pode; os destinos são os gravados).
5. Se o keeper estiver saudável e a campanha continuar parada, qualquer carteira pode chamar a mesma instrução; registre
   a chamada no `session-log/`.

**Prazo.** Confira em até 10 minutos da chegada (resolvível) ou 30 (liquidação).
