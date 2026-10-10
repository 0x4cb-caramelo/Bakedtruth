# Runbook: a segunda leitura não bate

**Alerta:** "second read differs". A campanha foi para a fila de revisão (`KEEPER_REVIEW_QUEUE`, um arquivo JSON por
linha).

**O que significa.** A leitura feita pelo standby, por outro provedor de RPC, não confere com a do primário: preço,
horário de publicação ou a conta. Pode ser um RPC com dado atrasado, ou uma leitura errada do primário. A campanha
não se resolve sozinha pela fila.

**Quem age.** O revisor do dia (ainda sem nome: o CTO até lá).

**Como.**
1. Leia a linha da fila: campanha, preço e horário de cada leitura.
2. Confirme a conta na Pyth pelo explorador, usando a conta de preço da campanha (o endereço está na campanha).
3. Se a leitura do primário estava errada, anule pelo `team_void_campaign`. Se estava certa, confirme o resultado.
4. Registre a decisão no `session-log/`.

**Prazo.** Até o fim da janela de revisão da campanha; a fila é revista a cada dia útil.
