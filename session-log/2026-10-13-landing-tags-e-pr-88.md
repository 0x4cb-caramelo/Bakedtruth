# 2026-10-13 — O landing com a privacidade corrigida, as tags de -1, 09 e 10, e o PR #88 na main

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
