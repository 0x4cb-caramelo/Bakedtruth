# 2026-10-13 — As rotas do indexador públicas pela API de leitura, e o fim das mesclas da noite

## A decisão

O Ronaldo respondeu (a) à pergunta do caminho público do indexador: as rotas dele chegam ao público pelo `brot-api`, que
já está no ar em `brot.markets/api/v1`, sem mudar a Cloudflare nem o túnel. O indexador continua só no loopback.

## O que foi construído (faixa L08, branch `feat/api-indexer-route`)

- **O encaminhamento** (`services/api/src/indexer-proxy.ts`): exatamente as cinco rotas de leitura do indexador, antes
  do 404 da API; nenhuma rota antiga mudou. Só GET e HEAD; caminho e consulta passam como vieram, e o indexador valida a
  consulta; do cliente só segue o `accept` (nada de cookie, autorização ou endereço); o CORS é o da API. Indexador fora
  do ar: 503; demora: 504; resposta acima de 1 MB: 502; tudo no formato de erro da API, sem o endereço do indexador.
  `API_INDEXER_URL` só aceita http no loopback, e `off` desliga.
- **As páginas** (pedido do líder, depois que a faixa achou o teto): a atividade e a chance de uma campanha e as
  entradas de uma carteira não tinham limite, e uma campanha com umas 2.000 entradas passaria de 1 MB. Agora
  `?limit=` vai de 1 a 500 (100 por padrão) e `?before=` é o cursor; a resposta ganha `next_before`. Uma campanha com
  menos de 100 itens responde como antes. A atividade passou a ordenar pelo `seq` da campanha, que nunca empata.
- **Testes:** um indexador falso para cada rota, a consulta, o HEAD, os erros passados adiante, os cabeçalhos
  descartados, a demora, a queda, o teto e o `off`; as páginas nas bordas (página exata, última página, cursor ruim,
  limite 0 e 501, empates num mesmo slot). A suíte inteira passou, menos os três testes do proxy de CPI, cujo binário
  só o CI compila.

## O que não foi feito

Nada foi publicado. As rotas valem quando o indexador for instalado no servidor (a unidade dele já existe) e o
`brot-api` for reiniciado com este código: ato do Ronaldo, com o roteiro em `deploy/vps/README.md`. O indexador ainda
espera a conta de RPC dele (D4).

## As mesclas da noite, completas

O #89 (Sprint 15) foi o último dos cinco PRs que o Ronaldo autorizou: entrou na `main` como `d648f51`, com o CI verde
no commit da ponta `65f4f18` (a primeira tentativa falhou no CODEMAP, gerado com um arquivo ainda em conflito: ele
aparecia três vezes; a lição é gerar o mapa só depois de marcar cada arquivo resolvido). A fila inteira: #86
`b863ce3`, #85 `5eacb70`, #87 `7808fdc`, #72 `86c1b96`, #89 `d648f51`. O primeiro CI da `main` com o #87 rodou os
dois builds verificáveis, que deram o mesmo binário.
