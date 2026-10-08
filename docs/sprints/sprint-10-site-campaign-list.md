# Sprint 10 — Site: lista de perguntas

**Estado:** planejada · **Branch:** `sprint-10-site-question-list` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B8 (seções 3.6 e 4) |
| Depende de | Sprint 09 |
| Regras e fluxos cobertos | R-03, R-04 e R-07, na tela; R-19 (o aviso na pergunta de parceiro); R-21 (selo e destaque). F1 (a lista) e F9 |

## Objetivo

A página inicial com dados reais: filtrar, buscar, ordenar e ver, em cada card, a chance, o retorno estimado, o
pote e os prazos.

## Critério de pronto

- [ ] `/` lê `/api/v1/questions`.
- [ ] O card mostra: o tipo; o texto gerado dos parâmetros, conferido contra o `text_hash`; a chance de cada lado; o
      retorno estimado, com a palavra "estimativa"; o total do pote e de cada lado; o fechamento das apostas e a
      data final; a prova, com a barra; e o estado.
- [ ] As categorias são os cinco tipos de R-13. Os filtros são os cinco estados e "Saved", guardado no
      `localStorage`. A ordenação é por tamanho do pote, fechamento e chance do SIM.
- [ ] O card existe nos cinco estados. "Em revisão" tem relógio. Não há "Redemption".
- [ ] Pote vazio mostra "sem chance" (L-05).
- [ ] O destaque mostra a pergunta de parceiro com selo, nome, link e 72 horas, lidos de `content/partners.json`. O
      aviso de R-19 aparece em toda pergunta de parceiro.
- [ ] "Closing soon" conta o fechamento das apostas. "Upcoming" e "Notify" não existem.
- [ ] Há tela de carregamento, de erro de rede e de vazio para a grade, o carrossel e a lista lateral.
- [ ] "Como funciona" traz os passos do pote e abre também no celular.
- [ ] A lista longa pagina ou carrega por partes.
- [ ] A busca tem anel de foco, e o carrossel não anuncia cada troca ao leitor de tela.
- [ ] `cd app && bun run lint && bun run build` passa.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- A funcionalidade da lista em `app/features/`, com o mosaico, os princípios, os filtros e a grade.
- `content/partners.json`, com o formato do selo.
- Os textos dos passos e dos princípios, revistos pela tabela de conflitos do documento de design.

## Fora desta sprint

A página da pergunta (11). "Sponsor a goal" e o pedido de pergunta (15): o link fica fora até lá. Avisar o usuário
da abertura de uma pergunta (L-16).

## Decisões do fundador que travam a sprint

Nenhuma nova. Precisa estar respondido, da Sprint -1, onde ficam o selo e o destaque do parceiro (L-24).

## Agentes e skills

- **Agentes:** `dev-product-agent`, `copywriter-agent` (passos e princípios), `coordinator-agent`.
- **Skills:** `feature-scaffold`, `sprint-management`, `verify-build-works`, `codemap`, `secrets-scan`.

## Portões de segurança

- `content/partners.json` fica no Git e entra com a revisão de duas pessoas.
- Nenhuma tela promete retorno: o número é sempre "estimativa".
- Nenhum script de terceiro. `secrets-scan` no fechamento.

## Testes

Build e lint. Conferência da lista contra as perguntas abertas pelo `seed:devnet`: a chance e o retorno da tela
batem com `packages/sdk/math.ts`. Filtros, busca e ordenação à mão. Teclado e largura de celular.

## Riscos

- O card herdar "preço" e "volume" do protótipo. Reduz: a tabela de conflitos como lista de conferência.
- O texto da pergunta divergir do `text_hash`.
- Poucas perguntas na devnet deixarem o mosaico vazio: o estado vazio precisa existir.

## Artefatos esperados

`app/features/` (a lista), `content/partners.json`, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** página inicial com dados reais; selo e destaque de parceiro.
- **Session-log:** o que mudou em relação ao desenho aprovado na Sprint -1, e o porquê.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
