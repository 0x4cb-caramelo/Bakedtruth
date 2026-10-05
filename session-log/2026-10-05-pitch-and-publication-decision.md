# 2026-10-05 — Apresentação resumida do plano e a decisão de publicar

## Context

A etapa 2.9 do método, a apresentação resumida do plano de negócio, tinha ficado para trás: o BP v0.0.2 foi fechado
e a equipe seguiu para a construção. A auditoria de documentação depois da Sprint 00 apontou a falta. O Lucas
aprovou a recomendação de escrevê-la em paralelo à Sprint 01.

## Decision

1. **`docs/business/PITCH.md` foi escrito**, em dez seções, a partir do BP v0.0.2. Cada afirmação traz a parte e a
   seção do plano de onde saiu.
2. **O texto não diz nada que o plano não diz.** Onde o modelo do método pedia um dado que o plano não tem, a
   apresentação diz que não tem: custo do problema para o usuário, tamanho de mercado calculado, personas com nome,
   tração, clientes, valuation e rodada.
3. **As ressalvas do plano ficaram:** demanda não demonstrada, cenário ruim que não se paga, taxa média como
   premissa mais frágil, cofre do token B de cerca de 900 dólares por mês, regra brasileira em aberto, nenhuma
   promessa de preço para os tokens.
4. **Nada foi publicado.** O registro de publicação está preenchido com o estado real: nenhuma aprovação, decisão
   do fundador pendente.

## Alternatives considered

- **Uma apresentação "de venda", sem as ressalvas.** Contradiria o plano, e a regra das camadas de documentação
  proíbe: a apresentação nunca acrescenta afirmação que o plano não faz.
- **Preencher tração e mercado com estimativas.** Seria inventar número.
- **Publicar numa página.** Publicar é decisão do fundador e passa pelo portão de redação.

## Why this decision

A apresentação serve a investidor e à inscrição no hackathon. Um texto que promete mais que o plano vira problema
na primeira pergunta de quem lê os dois.

## Risks

- **O plano tem pontos que se contradizem entre as partes**, e a apresentação precisou escolher uma versão em
  alguns. Os principais: o critério de parada (uma condição no resumo, duas na Parte 2); a tesouraria (Bitcoin desde
  o dia zero na Parte 2, USDC primeiro na Parte 4); quando sai o token A (três redações); o cabeçalho de três
  partes, que ainda diz "rascunho"; e o resumo, que diz não haver proposta em aberto, quando a Parte 2 lista três
  propostas menores.
- **A seção de equipe diz "três sócios" e, na frase seguinte, que no hackathon a equipe se apresenta como uma
  pessoa.** Está fiel aos documentos, mas o fundador precisa decidir qual versão vai na inscrição.
- **Não há consentimento registrado** para citar o Lucas e o Ronaldo pelo nome num texto público.
- **O artigo 16 da MP 1.394** veda publicidade de aposta de quota fixa ao público brasileiro. Se o pote for
  enquadrado assim, publicar a apresentação em português é parte do risco.

## Follow-ups

- O Lucas decide se a apresentação é publicada, e como: (a) não publicar; (b) enviar só a quem pedir; (c) página
  pública, depois do portão de redação.
- Uma passada de coerência no BP v0.0.2 para resolver as contradições entre as partes.
- Decidir a versão da seção de equipe para a inscrição no hackathon.

## Related links

- A apresentação: [`docs/business/PITCH.md`](../docs/business/PITCH.md)
- O plano: [`docs/business/BUSINESS-PLAN.md`](../docs/business/BUSINESS-PLAN.md)
- Regra de privacidade para publicação: [`.claude/rules/privacy-audit.md`](../.claude/rules/privacy-audit.md)
- Sprint: —
