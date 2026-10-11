# 2026-10-11 — Sprint 08, terceira parte: o indexador (primeira fatia)

## Ponto de partida

- O Ronaldo confirmou, com as próprias palavras, "start the SQLite indexer (the rest of Sprint 08) on a fresh branch
  from main". A branch `sprint-08-indexer` saiu da `origin/main` (`5bf3636`) sem acompanhar a `main`, numa cópia
  separada do repositório, porque o site de teste dele rodava da pasta principal.
- A segunda parte da Sprint 08 (os nomes, o preço e o relay) está no PR #69, ainda aberto. Esta branch não depende dela.

## O que entrou nesta fatia

- `services/indexer`: o arquivo SQLite (WAL, uma escrita só, a versão do esquema no `user_version`), a listagem das
  assinaturas do programa em `finalized`, a leitura de cada transação, os eventos decodificados pelo SDK e as projeções
  (campanhas, entradas, pagamentos e pontos), a reconstrução num arquivo novo, e um `main.ts` que roda a ingestão em
  laço. Ficaram para depois: as rotas da API, os DTOs em zod, o ranking, o `content/partners.json`, os KPIs, a gravação
  do `feed_history`, a cópia noturna, os alertas, a unidade e o `logsSubscribe`.

## Decisões, e por quê

- **A campanha é chaveada por endereço e abertura, não pelo id.** O plano desenhava `id` como chave e `address` único.
  Mas o endereço da campanha sai do id, e um id fechado pode abrir outra campanha: a regra dos pontos do SDK já tratava
  isso ("every `CampaignOpened` starts a new campaign at that address"). A chave virou (endereço, abertura).
- **Cada assinatura guarda o seu lugar na cadeia (`ord`).** Um slot tem muitas transações, e a ordem entre elas só vem
  da listagem. Guardando o lugar de cada assinatura listada, uma transação lida tarde, ou relida por causa de um buraco,
  continua no lugar dela. O ponto de controle ficou em dois níveis: a assinatura mais nova listada (`checkpoints`) e o
  estado de cada assinatura (`signatures`), cada um movido numa transação SQLite só.
- **O evento guarda os próprios bytes (`raw`).** O JSON é para quem lê. As projeções e os pontos decodificam de novo os
  bytes pelo SDK, então nenhum número grande passa por texto e volta errado.
- **As projeções de um endereço são refeitas inteiras a cada evento que chega.** Assim a ordem de chegada não importa:
  dentro de uma abertura vale o `seq`, que o programa numera sem buraco. Custa recalcular a campanha a cada entrada,
  o que no devnet é pouco; fica anotado para quando houver muito volume.
- **A transação que não volta segura as seguintes**, como a proposta pede ("stop at the first getTransaction that
  returns null"), mas só por cinco tentativas, a lição da Sprint 13. Depois disso ela é pulada e contada, e o buraco no
  `seq` da campanha faz o indexador relistar as assinaturas dela a cada atualização, com mais uma leitura da pulada, que
  não segura mais nada.
- **Só a resposta "não tenho essa transação" gasta uma tentativa.** Na revisão do próprio código vi que, como na API,
  uma chamada que falha (tempo esgotado, 429, nó fora) contava igual, e uma queda de pouco mais de um minuto faria o
  indexador pular uma transação e perder os eventos dela. Agora a chamada que falha só para a atualização e aparece com
  o nome do erro; a transação continua na fila.
- **A regra da conta viva para os pontos saiu da API para o SDK** (`campaignNow`). Os pontos dependem do que cada conta
  que ainda existe diz agora (o resultado é final? o pote divide?). A API tinha essa regra no próprio `leaderboard.ts`;
  agora as duas leem a mesma, e um teste confere que dão os mesmos pontos.
- **`settlements` não tem a coluna `reserved` do esboço.** A parte do criador reservada não emite evento
  (`settle_creator_share`); só o resgate emite. Então toda linha de pagamento é dinheiro que chegou a uma carteira.
- **O typecheck da raiz passou a cobrir `services/`**, com a mesma linha que o PR #69 escreveu, para a mescla não dar
  conflito ali.

## O que o teste achou

- **O `isFirst` do `EntryAdded` não quer dizer "primeira entrada desse padeiro".** Eu contava as contas `Entry` abertas
  por ele, e a conta da campanha paga chegou a -1. No programa, `isFirst` é a carteira cuja entrada caiu num pote vazio
  (Q3), e vem em todas as entradas dela. A conta `Entry` é uma por carteira e campanha, então as abertas passaram a ser
  as carteiras distintas.

## Como foi conferido

- Sem cluster: o arquivo (esquema, WAL, versão, recusas, leitura só) e a ingestão contra um RPC roteirizado (páginas
  curtas, um nó que ignora o `until`, uma transação que não volta, uma que nunca volta, uma chamada que falha, uma que
  a listagem do programa perdeu, uma que falhou, um endereço reaberto).
- No LiteSVM: quatro ciclos inteiros (um pago com os dois lados, pago e fechado; um pote de um lado só devolvido; uma
  anulação por feed parado; um NO em revisão). Cada conta viva bate com a linha dela (potes, prêmio, estado, resultado,
  modo, entradas abertas, último `seq`); as entradas somam os potes; o cofre de cada campanha viva guarda o aluguel mais
  o que entrou menos o que saiu por evento, e a fechada pagou exatamente o que recebeu; cada pagamento a um padeiro é o
  que chegou à carteira dele; a reconstrução num arquivo novo é igual ao arquivo vivo; uma segunda leitura não muda
  nada; os pontos são os mesmos que o ranking da API calcula sobre a mesma cadeia.

## O que fica

- As próximas fatias da Sprint 08: as rotas `/api/v1` lidas do arquivo, os DTOs em zod com testes de contrato, o
  ranking e o `content/partners.json`, os KPIs, o `feed_history` com a cópia noturna, os alertas e a unidade.
- A mescla com o PR #69 vai conflitar no `session-log/INDEX.md`, no `CHANGELOG.md` e no `bun.lock` (as duas branches
  acrescentam no mesmo lugar): manter as duas entradas e rodar `bun install` e `node scripts/codemap.js`.

## A segunda fatia: as rotas de leitura (mesmo dia, depois das mesclas)

- **Por onde voltou.** Depois do PR #71, o Ronaldo confirmou, com as próprias palavras, "Yes, both": mesclar o #71 e
  retomar o indexador numa branch fresca. As três partes da fatia 1 foram repassadas sobre a `main` (`92f86f7`); os
  conflitos foram só de registros e do mapa do código, e a base antiga ficou guardada como `sprint-08-indexer-5bf3636`.
  A branch foi enviada e virou o PR #72, em rascunho.
- **Onde as rotas moram.** O plano põe a API dentro do indexador (`services/indexer/src/api/`), mas a API que está no
  ar é a `services/api`, e a rota do túnel manda `/api/v1` para ela. As quatro rotas novas ficaram no indexador, como o
  plano pede, na porta 4201. Como o público chega a elas fica para o Ronaldo decidir: a API de leitura chama o indexador
  por dentro para esses quatro caminhos, ou o túnel ganha uma rota para a porta 4201.
- **Pelo endereço, não pelo id.** A API no ar já usa o endereço da campanha; um id fechado pode abrir de novo, então a
  rota pega a abertura mais recente, e `?opening=` escolhe outra.
- **A ordem da cadeia é (slot, lugar, instrução, interna).** Um slot tem muitas transações, e uma assinatura listada
  tarde por causa de um buraco fica no slot certo mesmo com um lugar maior.
- **O `as_of_slot` é o último slot lido inteiro.** Uma assinatura pendente segura o número, para a resposta nunca
  prometer o que ainda não foi lido.
- **O que o teste achou:** as entradas recentes saíam da mais velha para a mais nova, porque um `DESC` só vira a última
  coluna da ordem. Agora cada coluna desce.
