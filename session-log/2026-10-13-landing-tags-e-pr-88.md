# 2026-10-13 — O landing com a privacidade corrigida, as tags de -1, 09 e 10, o PR #88 na main e as mesclas da noite

Pedido do Ronaldo, primeiro num texto colado ("publish the landing from main" e as respostas às decisões) e depois
confirmado nas palavras dele, numa pergunta de cada vez: publicar o landing agora, criar as três tags, mesclar o #88 e
ligar o pagamento do keeper no devnet.

## O landing (18h40 UTC)

- **Antes:** a cópia de trabalho do landing no servidor (`/srv/brot-markets/work/current`, usuário `brot`) estava em
  `ab764ab`, com uma edição à mão em `services/landing/lib/campaigns.mjs`, igual byte a byte à versão da `main`;
  `ab764ab` é ancestral da `main`, então a troca é um avanço direto.
- **O teste:** uma instância descartável da `main` (`395efa5`) na porta 4239, como o usuário `brot`, com a lista de
  espera num arquivo temporário (nenhum teste podia escrever na lista de verdade): `/` 200, `/privacy` 200 com o texto
  novo, `/terms` 404, `/prototype/` 200, `/pitch/` 200. Instância parada e apagada.
- **A troca:** a edição à mão descartada (a `main` traz o mesmo conteúdo), o pacote buscado, o avanço para `395efa5`
  e o serviço reiniciado. Conferido de fora: `/privacy` 200 com os detalhes do fundador (os dois e-mails escondidos pelo
  Cloudflare, que troca endereços nas páginas por visitantes de fora), `/terms` 404, `/` 200, `/dev0x` e a API no ar.
  Para voltar: `git reset --hard ab764ab` na cópia e o serviço reiniciado.

## As tags

`sprint--1` em `635c77a` (PR #70), `sprint-09` em `368a76a` (PRs #52 a #54) e `sprint-10` em `b4f3b55` (PR #56),
anotadas com o que cada uma deixa em aberto, e enviadas ao GitHub.

## O PR #88

Mesclado na `main` (`88a00f9`) com o CI verde no commit da ponta (`8709590`), que já roda os testes dos serviços. O
passo seguinte, levar o keeper novo ao servidor com o `KEEPER_SETTLE=on`, foi barrado pela checagem de segurança do
modo automático ("Merge Without Review") e ficou parado: o servidor segue com o keeper antigo, sem pagamento
automático, à espera da palavra do Ronaldo. A unidade nova do keeper (usuário próprio e credenciais) também pede a
concordância do dono do servidor antes de ser instalada.

Atualização da mesma noite: com as palavras do Ronaldo ("turn on the keeper payout with the current unit"), o keeper
novo foi ao servidor com o `KEEPER_SETTLE=on` na unidade de hoje e pagou as duas campanhas que esperavam; depois a RPC
dele passou para a Helius ("use the Helius RPC for the keeper"). O registro disso vai com a branch da Sprint 14.

## As mesclas da noite

Com a autorização do Ronaldo para mesclar #86, #85, #87, #72 e #89 nessa ordem ("Yes, merge all five as described"),
cada um só com o CI verde no commit da ponta e com a `main` trazida antes:

- **#86**, o pacote de auditoria (Sprint 17): `b863ce3`.
- **#85**, o roteiro da mainnet com as respostas M-1 a M-4 (Sprint 18): `5eacb70`, ponta `c1c9214`, CI 38459207505.
- **#87**, o CI e a cadeia de suprimento (Sprint 16): `7808fdc`, ponta `2f90a33`, CI 38460189296; o primeiro CI da
  `main` depois dele roda os dois builds verificáveis.
- **#72**, o indexador (Sprint 08): `86c1b96`, ponta `46240b3`, CI 38461157580.
- **#89**, este (Sprint 15): o último da fila; o commit da mescla vai no registro do próximo PR.

Os registros de -1, 09 e 10 diziam ainda "esperando a palavra para a tag": corrigidos aqui, com as tags e os commits.
