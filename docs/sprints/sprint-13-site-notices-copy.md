# Sprint 13 — Site: classificação, avisos e textos

**Estado:** planejada · **Branch:** `sprint-13-site-notices-copy` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B8 (seções 3.5, 3.6 e 8) |
| Depende de | Sprints 12, 08 e 07 |
| Regras e fluxos cobertos | R-21 (o relatório); os avisos obrigatórios e o tom (resumo de produto, seções 11 e 12). F12; F9 (o relatório); F11, se o fundador confirmar a fase |

## Objetivo

Fechar o MVP da devnet: a classificação pública, a página de sugestões, todos os avisos obrigatórios no lugar e os
textos revistos pelo tom decidido.

## Critério de pronto

- [ ] `/classificacao` mostra os pontos de `/api/v1/leaderboard`. Não há coluna de volume nem de lucro.
- [ ] `/sugestoes` mostra a lista de `content/suggestions.json` e a orientação de como sugerir, fora da página de
      aposta. **Só entra se o fundador confirmar a fase (L-17).**
- [ ] A revisão de privacidade do nome de usuário do X foi feita antes de fechar, com a decisão registrada: mostrar o
      nome ou só o link.
- [ ] Cada linha da tabela de avisos obrigatórios (resumo de produto, seção 11) que vale na devnet está na tela
      certa.
- [ ] Nenhuma expressão da coluna "em vez de" (resumo de produto, seção 12) aparece no site. A busca nos `copy.ts`
      por "preço", "comprar", "sem oráculo" e "anônimo" não acha uso indevido.
- [ ] As falas do mascote foram revistas; "No oracle. Just me, reading." saiu.
- [ ] O relatório do parceiro foi gerado para uma pergunta de exemplo.
- [ ] No celular: o balão do mascote não corta, e os passos de "como funciona" abrem.
- [ ] Um ciclo inteiro pelo site, na devnet, com os dois serviços ligados: abrir por script, apostar pelo site,
      resolver e pagar pelo keeper, e ver o resultado em "minhas apostas" e na classificação.
- [ ] A skill `release-check` passa.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- As funcionalidades "classificação" e "sugestões", em `app/features/`.
- `content/suggestions.json`, mantido pela equipe, com o link e o resumo de cada sugestão.

## Fora desta sprint

Termos de uso, política de privacidade e bloqueio por país (17). As páginas do Cloak e do SODAX (15 e 17). Ler
publicações do X por programa: a lista é escolhida à mão. Publicar no X cada pergunta resolvida, que é rotina da
equipe.

## Decisões do fundador que travam a sprint

- **L-17:** em que fase a página de sugestões entra, e se ela mostra o nome de usuário ou só o link.
- **L-09:** o que a tela diz que os pontos valem depois da devnet.
- **L-24:** o formato do relatório do parceiro, e o que acontece com o parceiro que não publica.

## Agentes e skills

- **Agentes:** `copywriter-agent`, `legal-compliance-agent` (os avisos), `devils-advocate-agent` (o MVP inteiro),
  `dev-product-agent`, `coordinator-agent`.
- **Skills:** `privacy-audit`, `release-check`, `plain-portuguese-explainer`, `sprint-management`,
  `verify-build-works`, `codemap`, `secrets-scan`.

## Portões de segurança

- **Dado pessoal:** o nome de usuário do X passa pela skill `privacy-audit`, com as nove perguntas, antes de a sprint
  fechar. Uma sugestão sai da página a pedido de quem a fez.
- Nenhuma sugestão aparece sem revisão humana, e `content/suggestions.json` entra com a revisão de duas pessoas.
- Nenhum script do X nem de terceiros nas páginas.
- Nenhuma promessa de preço, retorno ou rendimento. `secrets-scan` no fechamento.

## Testes

Build e lint. O ciclo inteiro na devnet, pelo site. A busca de vocabulário proibido. A conferência dos avisos, tela
por tela.

## Riscos

- A classificação inflada por muitas carteiras.
- A página de sugestões ficar pronta sem a fase decidida. Nesse caso ela sai desta sprint.
- Texto em dois idiomas misturados, se L-01 não estiver fechada.

## Artefatos esperados

`app/features/` (classificação, sugestões), `content/suggestions.json`, os `copy.ts` revistos, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** classificação; sugestões, se entrou; avisos e textos; MVP da devnet fechado.
- **Session-log:** as respostas de L-17, L-09 e L-24; o resultado da revisão de privacidade.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
