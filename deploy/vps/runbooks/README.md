# Runbooks dos alertas (Sprint 07)

Um arquivo por alerta. Cada um diz o que o alerta significa, quem age, como e em quanto tempo. Os prazos vêm da
Sprint 07: vigia a cada 5 minutos, assume após 10 minutos sem resposta, campanha resolvível parada por 10 minutos,
liquidação parada por 30 minutos.

| Alerta | Runbook |
|---|---|
| Primário não responde | [primary-down.md](primary-down.md) |
| Standby assumiu o ciclo | [standby-took-over.md](standby-took-over.md) |
| Reinício do primário falhou | [restart-failed.md](restart-failed.md) |
| SOL baixo na carteira do keeper | [keeper-sol-low.md](keeper-sol-low.md) |
| NÃO com `met_late` | [met-late-no.md](met-late-no.md) |
| Segunda leitura diferente | [second-read-mismatch.md](second-read-mismatch.md) |
| Campanha parada | [campaign-idle.md](campaign-idle.md) |
| Campanhas abertas acima de 80% | [open-campaigns-high.md](open-campaigns-high.md) |

Quem recebe: o CTO. O revisor do dia ainda não tem nome (Sprint 16 exige um antes do mainnet). Os alertas de
e-mail dependem do provedor (decisão do fundador, D4); até lá o alerta aparece como linha `alert` no diário.
