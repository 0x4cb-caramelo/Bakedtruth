# 2026-10-10 — Sprint 10: a lista de campanhas no site

## Decisões do fundador (mesmo dia)

- A UI da Lista é da IA nesta sprint: a UI do Lucas não está no repositório (verificado em todos os branches e worktrees).
- Referências visuais: `/5` (branch `feat/site-3-original-com-cores-do-deck`) e o protótipo `/dev0x/`.
- Dados que a API não traz (chance, retorno estimado) são calculados no site, pela matemática do SDK, sem esperar a API.
- O guia de marca (`docs/product/BRAND.md`) entrou na `main` (PR #55), e o rodapé e as falas do mascote seguem o guia.
- O nome Brot Markets está aprovado.

## O que foi feito

- API de leitura: os cartões recebem o feed, a direção, o expoente do preço, as taxas, o horário de abertura e o número
  de entradas.
- App: `features/campaigns/` com o modelo do cartão (`model.ts`), a frase (`sentence.ts`), a ordenação e os filtros
  (`arrange.ts`), os dados paginados (`use-campaigns.ts`), o "Salvas" no navegador (`saved.ts`), o cartão e a lista.
- Testes: 33 no app e 14 na API. Lint e build passam.
- Verificação: o navegador sem interface (Chrome headless) carregou a lista com os quatro campanhas da devnet.

## O que não foi feito

US$ (sem fonte de preço na API), barra de prova, cartão de compartilhar, selo e destaque de parceiro, nomes do arquivo
de contas, e as frases de campanhas de queima, bloqueio e aposta. Cada um tem o motivo na sprint.

## Pendências

1. O fundador revisa o layout (a referência é a `/5`, não só as cores).
2. A frase de preço ("BTC/USD reaches 83,660.42") é uma primeira versão, a confirmar.
3. A fonte do preço em US$.
