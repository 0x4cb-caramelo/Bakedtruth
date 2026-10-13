# 2026-10-13 — O ticker da curva no título e os botões de lado limpos

## O pedido

Um pedido colado na sessão, em duas partes, sobre a branch `feat/dbc-graduation-ui`:

1. **Os botões SIM e NÃO do painel de entrada** mostravam a estimativa ("est. 2.8826 per 1") dentro do botão. O
   pedido: o botão só com "YES" ou "NO", centralizado, e a estimativa embaixo de cada botão, no texto neutro da página.
2. **O título de uma campanha de graduação** dizia o endereço do pool ("Meteora launch curve 12uL…7Dny raises its full
   85 SOL?"). O pedido: o ticker do token no lugar, "$BROT", e os endereços (o do pool e o do mint, o "CA") só nos
   detalhes da prova, com botão de copiar e link para o explorador. O pool de demonstração do devnet,
   `12uLN2texEDbadM4WzJm6Dry8Quc8qFpDQEwhSdi7Dny`, entra em `content/account-names.json` como `$BROT`.

Durante o trabalho vieram dois esclarecimentos. O primeiro, em português: não é só para aquele endereço; qualquer pool
que qualquer pessoa cole nesse tipo deve mostrar o ticker, com os últimos quatro caracteres do endereço se preciso, mas
nunca só o endereço. O segundo, colado: ler o `base_mint` do pool (byte 136), achar o símbolo nos metadados da Metaplex
ou na extensão do Token-2022; pool revisado mostra o nome limpo, `$BROT`; pool de qualquer outra pessoa mostra
`$TICKER (…7Dny)`; o símbolo é limpo (sem caracteres de controle, com tamanho máximo), e quem imita SOL, USDC, USDT,
WSOL ou BROT vira `Token (…7Dny)`; e a exceção à A-11 fica escrita.

## Por que isso é uma exceção à A-11

A A-11, da proposta de arquitetura aprovada em 8/10/2026, diz que nenhum texto do criador é guardado nem mostrado, e
que nomes vêm só da lista revisada ou da lista da Pyth, **nunca de metadados de token que o dono do token pode mudar**.
O ticker de um token é exatamente isso. Para os outros cinco tipos a regra continua: eles mostram o endereço curto ou o
nome revisado.

O registro do upgrade do devnet (`2026-10-12-upgrade-devnet-sexto-tipo.md`) tinha deixado essa escolha em aberto e
proposto o caminho que respeita a A-11: o nome só da lista revisada; sem ele, o endereço do token (o CA) com copiar,
explorador e o aviso de que qualquer pessoa cria um token com qualquer nome; e uma caixinha "Conferi o endereço" antes
de assinar. O pedido de hoje escolheu o outro caminho, o que muda a A-11, e por isso pede o Lucas, como aquele
registro já dizia. Daquela proposta entraram a lista revisada aceitando curvas e o CA na prova, com copiar e
explorador; o aviso sobre nomes de token e a caixinha antes de assinar ficaram de fora deste trabalho.

O argumento do pedido, que eu acho correto: uma curva de lançamento é um token novo por natureza, então nenhuma equipe
consegue revisar o nome antes de alguém abrir campanha nele, e "12uL…7Dny" não diz nada a quem vai entrar. O risco que
a A-11 evita é o de alguém se passar por outro token. A resposta a esse risco aqui é o sufixo: dois tokens podem ter o
mesmo ticker, mas não o mesmo pool, e o sufixo está sempre lá para quem não foi revisado.

## O que foi feito

- **O SDK lê o símbolo** (`packages/sdk/src/read/chain/token-symbol.ts`): a conta de metadados da Metaplex (o PDA
  `["metadata", programa, mint]`, chave 4) e a extensão TokenMetadata (tipo 19) que um mint Token-2022 guarda em si
  mesmo, como a DBC grava. Dono primeiro, depois o layout, pelo `Cursor` com limites, e a conta precisa nomear o mint
  para o qual foi lida. O `readCurveBaseMint` (em `dbc.ts`) lê o byte 136 do pool depois das mesmas recusas do leitor
  do pool. Testado em contas reais da mainnet que já estavam em `tests/fixtures`: o PDA do WIF e o do USDC dão os
  endereços capturados, os símbolos são "$WIF", "USDC" e "PYUSD", e o mint do pool de estágio 0 termina em "BAGS".
- **O SDK diz o que do símbolo pode aparecer** (`tickerOf`, no mesmo arquivo): o ticker perde os caracteres de controle
  e um `$` inicial; sobra só se for de 1 a 10 letras e dígitos ASCII e não imitar SOL, WSOL, USDC, USDT ou BROT, em
  qualquer caixa. Fica no SDK, e não no site, porque o app Android vai precisar da mesma regra; e porque o teste de
  vocabulário do site proíbe, com razão, que o código do site escreva os nomes das moedas de dólar.
- **O site decide o nome** (`app/features/campaigns/curve-name.ts`): o nome revisado como está escrito; senão
  `$TICKER (…7Dny)`; senão `Token (…7Dny)`.
- **O site lê o ticker no navegador** (`curve-tokens.ts`): os pools numa chamada `getMultipleAccounts`, depois os mints
  e os metadados em outra, em lotes de 100. Cada pool é lido uma vez por visita: a lista, a página da campanha e a caixa
  de abertura dividem a leitura. Leitura que falha é esquecida, e a próxima tela tenta de novo.
- **O nome aparece em toda frase** (`curve-names.tsx`): os cartões da lista e da página inicial, o título e o cabeçalho
  da página da campanha (o nome no topo e a regra), a frase da folha de entrada, as linhas de "My entries", a prévia da
  caixa de abertura, o cartão da prévia e a folha "Check before you sign" da abertura. Os nomes revisados vêm do
  `content/account-names.json`, lido no servidor pelo layout raiz; um pool revisado nunca é lido. O post de resolução
  que a equipe publica à mão (`scripts/team/resolution-post.ts`) nomeia a curva do mesmo jeito.
- **Os endereços ficam na prova** (`proof-panel.tsx`): nos "Proof details", a conta lida (o pool) e o mint do token,
  "Token mint (CA)", cada um com link para o explorador e botão de copiar. O botão de copiar saiu do painel de
  reconferência para um arquivo próprio (`copy-button.tsx`), com uma versão só de ícone.
- **A lista revisada aceita curvas**: o tipo `curve` e um nome que pode começar com `$` (`packages/sdk/src/schemas/
  account-names.ts`); a busca da caixa acha "$BROT" digitando "brot" e nunca propõe uma meta para uma curva.
- **O relay serve inteiras as contas da Metaplex e do Token-2022** (`services/rpc/src/accounts.ts`). Sem isso, pelo
  relay os metadados viriam vazios e toda curva seria `Token (…7Dny)`. O relay ainda não está no ar (o site lê a RPC
  pública do devnet direto, `deploy/vps/site-build.conf`); quando entrar, já entra servindo os metadados.
- **Os botões de lado** (`side-picker.tsx`, `entry.css`): o botão só com a palavra, centralizada, em 21 px; embaixo, a
  chance e a estimativa ("62% · est. 2.8826 per 1", ou "refund if alone") no texto neutro, ligadas ao botão por
  `aria-describedby`, para o leitor de tela ouvir as duas coisas juntas.
- **Os documentos**: o plano técnico v0.1.10 (a A-11 com a exceção, a seção "Display names" com a tabela da regra e o
  risco escrito, o relay, a tabela do `content/`), o `content/README.md` e o CHANGELOG.

- **Os cartões e o slide da página inicial**, num segundo pedido do mesmo dia ("aplica o visual nos cartões também"):
  os atalhos SIM e NÃO de cada cartão e do slide "Open now" passam a levar só a palavra, com o que 1 SOL rende
  embaixo. Um link só cobre o botão e a linha, e o botão acende com o ponteiro em qualquer dos dois. O estilo virou
  uma peça compartilhada (`.side-cell` e `.side-est`, em `components.css`), usada também pelo painel de entrada.

## Decisões minhas, e por quê

- **Nos cartões a linha de baixo não repete a chance**: o cartão já a mostra em letra grande logo acima da barra. E
  o "Join" antes de YES e NO saiu dos cartões vazios, para o botão ter só a palavra, como pedido; o "No entries yet"
  embaixo continua dizendo que ninguém entrou ainda.

- **O sufixo é o fim do endereço do pool, não do mint.** O pool é o que a campanha guarda e o que a prova mostra
  primeiro, e o fim dele se escreve sem nenhuma leitura, inclusive no `Token (…7Dny)`. O exemplo do pedido (`…7Dny`) é
  o fim do pool.
- **A chance foi para baixo do botão junto com a estimativa.** O pedido dizia que o botão tem só "YES" ou só "NO".
  Tirar a chance da tela perderia informação, então ela abre a linha de baixo, em negrito, antes da estimativa.
- **Símbolo fora do ASCII não aparece, nem limpo pela metade.** Um "ЅOL" em cirílico, um emoji ou uma marca de direção
  são justamente as formas de imitar outro token; tirar só os caracteres estranhos poderia transformar uma imitação no
  original. O mesmo para mais de 10 caracteres: cortar mudaria o nome.
- **Enquanto o ticker não chegou, a frase diz `Token (…7Dny)`**, e não o endereço curto: o pedido foi nunca mostrar só o
  endereço. A troca para `$TEST (…7Dny)` acontece assim que a leitura volta, que na mesma visita é imediata.
- **O nome revisado vem do layout raiz**, lido no servidor, e não do `/api/v1/names`: assim o site não depende de a API
  estar com a regra nova, e um arquivo quebrado só deixa as curvas com o ticker lido, com o erro no log.
- **A folha "Check before you sign" da abertura usa o ticker lido para o pool assinado**, não para o rascunho (a regra
  H1 da Sprint 19), e a linha logo abaixo continua mostrando o endereço inteiro do pool.

## O que ficou em aberto

- **A A-11 é uma invariante da arquitetura aprovada pelo fundador.** A exceção está escrita como pedida, e o PR
  (aberto no mesmo dia, depois de juntar a `main` com o upgrade do devnet) espera a confirmação do Lucas antes da
  mescla.
- **O aviso sobre nomes de token e a caixinha "Conferi o endereço"**, propostos no registro do upgrade, não entraram.
- **O token do pool de demonstração se chama "TEST" na cadeia.** A lista revisada o chama de `$BROT`, como o pedido
  mandou. Para a cadeia e para o explorador, o token continua "TEST".
- **O relay ainda não está no ar.** Hoje o site lê a RPC pública do devnet, que serve os metadados; o relay só passa a
  importar quando for publicado, e a versão desta branch já os serve.
- **Conferido num navegador**, com o site rodando localmente contra o devnet: a 1280 e a 412 px, os botões só com a
  palavra e a linha embaixo; a campanha de demonstração com `$BROT` no título, no nome e na regra, e o pool e o mint na
  prova; a lista da página inicial com `$BROT`; e, com a lista revisada esvaziada só durante o teste, `$TEST (…7Dny)`
  lido da cadeia na caixa de abertura e no título. O aviso de hidratação que o modo de desenvolvimento mostra vem do
  botão da carteira no topo e já existia.
- **O dono de um token pode mudar o símbolo depois** que a campanha abriu (metadados mutáveis). O site lê de novo a
  cada visita; o sufixo e os endereços da prova não mudam.
