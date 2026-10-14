# Runbook: a releitura de uma disputa deu diferente

**Alerta:** `contest_reread_differs`: a simulação de `reread_campaign` (pelo RPC B, a leitura independente do standby)
diz que a leitura de agora não é a gravada na resolução. Com `KEEPER_SETTLE=on` o keeper envia a releitura na hora,
e a disputa vai para o estágio 2 (o admin decide em 48 horas); com a chave desligada, ele só simula e alerta.

**O que significa.** Nem sempre é erro: muitos resultados corretos se leem diferente horas depois (uma oferta que
continuou caindo, uma liquidez que continuou subindo, um preço que mudou). O programa manda esses casos para uma
pessoa, o lado seguro. Sem decisão, o resultado gravado vale quando o estágio 2 caduca.

**Quem age.** O admin (estágio 2), com o time.

**Como.**
1. Compare a leitura gravada (`CampaignResolved`) com a de agora (o evento `CampaignReread` da releitura).
2. Se a resolução estava certa, o admin confirma (`scripts/team/decide.ts`, confirmar); se estava errada, anula com
   o motivo e a nota em `content/void-log/`.
3. Registre a decisão no `session-log/`.

**Prazo.** Antes do fim do estágio 2.
