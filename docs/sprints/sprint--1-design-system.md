# Sprint -1 — Design system

**Estado:** planejada · **Branch:** `sprint--1-design-system` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | Pré-requisito de B8 (seção 3.6) |
| Depende de | Sprint 00, só pelo repositório e pelo CI. Não depende do programa |
| Regras e fluxos cobertos | Nenhuma regra de dinheiro. Prepara as telas de F1 a F7, F9 e F12 |

**Onde entra na ordem.** Na prioridade do fundador, depois do programa e dos serviços. Como não depende deles, pode
correr em paralelo. É pré-requisito só das Sprints 09 a 13.

## Objetivo

Transformar o protótipo aprovado (`prototype-lab/prototype-n/`) e o `docs/product/DESIGN-DIRECTION.md` em tokens,
componentes e primitivas de layout de verdade, dentro de `app/`, e redesenhar o conteúdo das telas que ainda
mostram o modelo antigo: preço, compra e venda, resgate.

## Critério de pronto

- [ ] `app/styles/tokens.css` traz as variáveis de cor do documento de design: o escuro em `:root`, o claro em
      `:root[data-theme='light']`. O `@theme` do Tailwind v4 aponta para elas, e nenhum componente usa cor literal.
- [ ] O tema é decidido por um script no `<head>`, antes do CSS, com a chave `brot-theme`.
- [ ] Barlow Condensed 700 e Inter 400, 500 e 600 são servidas pelo próprio site (C10).
- [ ] Cada componente do inventário do documento de design tem um primitivo em `app/components/ui/`, nos dois temas,
      ou está marcado como cortado.
- [ ] Cada um dos 19 conflitos e cada linha da tabela de lacunas de tela tem desenho novo, aprovado pelo fundador, e
      o `DESIGN-DIRECTION.md` registra o resultado (último item do handoff checklist).
- [ ] Os três pares de contraste abaixo de 4,5 e os quatro problemas de acessibilidade listados no documento estão
      corrigidos.
- [ ] `cd app && bun run lint && bun run build` passa.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- Um primitivo por componente do inventário do documento de design, da faixa de status ao rodapé. O mascote é
  mantido.
- Primitivas de layout: página, mosaico, grade, a tela da pergunta em duas colunas e um ponto de quebra abaixo de
  700px.
- Cores para os cinco tipos de R-13, no lugar das cinco categorias antigas.
- O desenho do conteúdo novo: chance e retorno estimado, pote com dois totais, dois prazos, os cinco estados, a
  janela de 6 horas, pote de um lado só, carteira conectada, minhas apostas, confirmação antes de assinar,
  carregamento, erro, pergunta de preço e classificação.

O meio do redesenho (protótipo em `prototype-lab/` ou direto em `app/`) é escolhido na abertura da sprint.

## Fora desta sprint

Telas ligadas a dados reais (09 a 13). Indicação, patrocínio, Cloak e SODAX (14, 15 e 17). Trocar a direção
aprovada. Mexer no programa.

## Decisões do fundador que travam a sprint

- Qual dos dois escuros é o oficial, e qual é o tema padrão (plano técnico, seção 3.6).
- O idioma do site (L-01).
- Se a pergunta mostra o histórico da chance e a atividade (L-23).
- O texto do aviso de dinheiro preso (L-03); o lugar do selo e do destaque do parceiro (L-24).
- Para fechar: a aprovação das telas redesenhadas.

## Agentes e skills

- **Agentes:** `dev-product-agent` (nada do modelo antigo sobrou), `copywriter-agent` (os textos das telas),
  `coordinator-agent`.
- **Skills:** `sprint-management`, `codemap`, `verify-build-works`, `decision-log`, `secrets-scan`.

## Portões de segurança

- Nenhum script e nenhuma fonte de terceiros nas páginas.
- Ler `app/node_modules/next/dist/docs/` antes de escrever código do app (`app/AGENTS.md`).
- `secrets-scan` no fechamento.

## Testes

Build e lint do app. Conferência visual nos dois temas e em largura de celular. Contraste dos pares corrigidos.
Teclado, com foco visível.

## Riscos

- O redesenho virar nova rodada de protótipo. Reduz: prender-se ao inventário e à tabela de conflitos.
- O site herdar o modelo antigo por inércia (resumo de produto, seção 15).

## Artefatos esperados

`app/styles/tokens.css`, `app/components/ui/*`, `docs/product/DESIGN-DIRECTION.md` atualizado, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** design system criado; documento de design atualizado.
- **Session-log:** escuro oficial, tema padrão, idioma, e cada conflito resolvido de forma diferente da esperada.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
