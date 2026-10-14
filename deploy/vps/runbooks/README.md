# Runbooks dos alertas (Sprint 07; os da vigia de cadeia, da exposição e da Pyth desde a continuação da Sprint 07)

Um arquivo por alerta. Cada um diz o que o alerta significa, quem age, como e em quanto tempo. Os prazos vêm da
Sprint 07: vigia a cada 5 minutos, assume após 10 minutos sem resposta, campanha resolvível parada por 10 minutos,
liquidação parada por 30 minutos.

Cada linha `alert` do diário tem um `kind` (o nome em `services/keeper/src/alert.ts`); o runbook é o arquivo de mesmo
nome, com `-` no lugar de `_`.

| Alerta | Runbook |
|---|---|
| Primário não responde | [primary-down.md](primary-down.md) |
| Standby assumiu o ciclo | [standby-took-over.md](standby-took-over.md) |
| O standby pediu o reinício do primário | [restart-requested.md](restart-requested.md) |
| Reinício do primário falhou | [restart-failed.md](restart-failed.md) |
| SOL baixo na carteira do keeper | [keeper-sol-low.md](keeper-sol-low.md) |
| NÃO com `met_late` | [met-late-no.md](met-late-no.md) |
| Segunda leitura diferente | [second-read-mismatch.md](second-read-mismatch.md) |
| Segunda leitura sem conferência perto do fim da janela | [second-read-unchecked.md](second-read-unchecked.md) |
| Campanha parada | [campaign-idle.md](campaign-idle.md) |
| Campanhas abertas acima de 80% | [open-campaigns-high.md](open-campaigns-high.md) |
| Aberturas demais em uma hora | [openings-per-hour-high.md](openings-per-hour-high.md) |
| Abertura por chave do time | [team-key-opening.md](team-key-opening.md) |
| SOL demais nos cofres (exposição) | [exposure-high.md](exposure-high.md) |
| Parte do criador reservada há mais de 7 dias | [reserved-credit-old.md](reserved-credit-old.md) |
| SOL/USD velho (aberturas pagas bloqueadas) | [sol-usd-stale.md](sol-usd-stale.md) |
| Programa da Pyth mudou | [pyth-program-changed.md](pyth-program-changed.md) |
| Disputa aberta (estágio 1 ou 2) | [contest-opened.md](contest-opened.md) |
| Releitura de disputa deu diferente | [contest-reread-differs.md](contest-reread-differs.md) |
| Estágio 2 perto do prazo, sem decisão | [contest-stage2-ending.md](contest-stage2-ending.md) |
| Taxa de entrada selada aberta numa campanha finalizada | [sealed-fee-open.md](sealed-fee-open.md) |

Quem recebe: o CTO. O revisor do dia ainda não tem nome (Sprint 16 exige um antes do mainnet). Os alertas de
e-mail dependem do provedor (decisão do fundador, D4); até lá o alerta aparece como linha `alert` no diário.
