# 2026-10-19 — Os logos do X e do Discord no ar, e o indexador de volta depois do reinício

Pedido do Ronaldo, num texto colado: autorizar a chave SSH de um segundo computador no usuário `ronaldo` do servidor, e
publicar os logos do PR #103 (`bf2a5ce`) no `brot.markets` e no `/dev0x`, registrando a release e o caminho de volta.

## A chave SSH

A chave pública pedida entrou uma vez no `authorized_keys` do `ronaldo`, ao lado da que já estava lá, sem remover
nenhuma; as permissões ficaram como o SSH pede. O acesso a partir do outro computador não foi testado daqui.

## O landing (03h25 UTC)

- **Antes:** a cópia do landing (`/srv/brot-markets/work/current`, Git do usuário `brot`) está em `395efa5`, e os três
  arquivos do PR eram byte a byte os desse commit. Entre `395efa5` e `bf2a5ce`, só esses três mudaram no landing.
- **A troca:** só os três instalados a partir de `bf2a5ce`, com backup em `/srv/brot-markets/work/bak-20261019-landing/`,
  e o `brot-landing` reiniciado. Não houve ensaio na 4239: são três arquivos estáticos, e a volta é um `git checkout`.
- **Conferido de fora:** `/` e `/2/` 200, cada uma com o Discord no topo e no rodapé; `/live.css?v=2` 200, igual ao da
  `main`. Numa captura sem tela, os dois logos aparecem no topo e "Privacy · X · Discord" no rodapé.

## O site no `/dev0x` (03h30 UTC)

- **O que estava no ar:** a release `1f8427f98d5c` (`main` depois do PR #102), de 16/10 às 03h51 UTC, sem registro no
  repositório; o registro parava na `79318d17428d`. Ela agora é o caminho de volta.
- **O que entrou junto:** nada além do PR #103. A diferença para a release no ar é o rodapé, o componente dos logos, a
  linha de abertura da página inicial e o CSS dele (mais os arquivos do landing e o `CODEMAP.md`, que o site não usa).
  A API, o SDK, o programa, as dependências e a configuração do build são os mesmos; por isso só o `brot-site` reiniciou.
- **O teste:** a release montada ao lado (o build leu o slot 511223702, o do programa no ar) e servida por uma unidade
  temporária como `brot-site` na 4239. As oito páginas responderam 200 como as da 4230, a CSP é a mesma, e o log não teve
  nenhuma linha de erro. A primeira tentativa do roteiro parou antes da conferência por um `grep` sem resultado sob
  `pipefail` (a versão antiga não tem o Discord); a contagem foi corrigida e o teste rodou de novo, sem refazer o build.
- **Conferido de fora:** `/dev0x` 200, os logos do X e do Discord embaixo do subtítulo, e "X · Discord" no fim do
  rodapé, também numa captura sem tela. O console mostra dois bloqueios da CSP que não vêm desta release: a fonte DM Sans
  que a folha de estilo do wallet-adapter importa e o beacon que o Cloudflare injeta.

## O indexador, fora do ar de 17/10 a 19/10

Na checagem do servidor, o `brot-indexer` estava em laço de reinício (mais de 21 mil tentativas), com
`Cannot find module '@solana/kit'`, desde o reinício do servidor em 17/10 às ~18h15 UTC; as cinco rotas dele respondem
503 (`/api/v1/activity` conferida de fora). A causa: o `bun install` feito como root cria links físicos dos arquivos
do cache do root, então a release do indexador e as releases do site compartilham os mesmos arquivos (o `package.json`
do `@solana/kit` é o mesmo inode nas três, com 15 links), e o `chown -R root:brot-web` de cada release do site passa
esses arquivos para o grupo `brot-web`, do qual o `brot-indexer` não faz parte. O processo antigo tinha os módulos na
memória; o reinício expôs o problema. Esta publicação repetiu o mesmo `chown`, mas sobre arquivos que já eram
`brot-web`.

**A correção (03h41 UTC)**, com a palavra do Ronaldo ("pode corrigir o indexador"): a unidade parada, as três pastas
`node_modules` da release apagadas e instaladas de novo como cópias (`--backend=copyfile`, que o Bun 1.4.2 oferece), e a
release devolvida ao grupo `brot-indexer`. Nenhum arquivo dela compartilha inode agora, e o estado em SQLite não foi
tocado. Depois da partida: saúde `ok`, nenhum reinício, e as cinco rotas 200 por fora. O `as_of_slot` dele (511591708)
é a última transação do programa no devnet (16/10), então ele está em dia. Daqui em diante, qualquer release instalada
como root para um usuário fora do `brot-web` (o indexador, o relay) usa cópias. As releases do site seguem com links,
porque o `chown` delas só alcança arquivos do próprio `brot-web`.

## O que fica aberto

- Os registros que já estavam atrasados: a atualização do programa no devnet de 15/10 e o keeper `5df3529`.
- O teste da chave SSH a partir do outro computador.
