# Runbook: programa da Pyth mudou

**Alerta:** `pyth_program_changed`: o receptor da Pyth (`rec2HH…`) ou o seu push oracle (`pyt2F…`) tem um slot de
instalação ou uma autoridade de atualização diferente do que o keeper conhece (`services/keeper/src/pyth-watch.ts`,
lido em 13/10/2026 e igual à base de conhecimento de 5/10/2026). O campo `error` diz se a conta sumiu.

**O que significa.** O leitor de preço confia nesses dois programas. Uma reinstalação pode mudar o formato das contas
de preço ou a regra de verificação. Não é sinal de ataque por si: a Pyth atualiza seus programas. Mas o time precisa
olhar antes de confiar em novas resoluções de preço.

**Quem age.** O CTO; a decisão de pausar campanhas de preço é do time.

**Como.**
1. Confira o slot novo no explorador e o anúncio da Pyth (`docs.pyth.network`).
2. Rode os testes do leitor contra uma conta nova (`scripts/capture-fixtures.ts` e `tests/fixtures`), lendo o diff.
3. Se o formato mudou, pause as entradas (`scripts/team/pause.ts`) até o leitor ser revisado.
4. Revisado, atualize o valor conhecido em `pyth-watch.ts` num commit revisado e registre no `session-log/`.

**Prazo.** Conferir no mesmo dia; antes disso, trate novas resoluções de preço como a revisar.
