# 2026-10-13 — A publicação do ticker da curva no `/dev0x`

## O pedido

Uma sessão em outra máquina preparou a publicação da `main` em `df09357435d5` (a mescla do PR #80, o ticker da curva
e os botões de lado limpos) e parou: lá não havia o atalho de SSH do servidor, e ela supôs que ele ficava na máquina do
Lucas. O Ronaldo colou a mensagem aqui e respondeu que essa máquina era, na verdade, a dele: "check if we can publish
from here".

O acesso foi conferido sem tocar em nada. O envio do pacote esperou a palavra dele, porque um pedido de conferência não
autoriza trocar o site no ar (o modo automático do Claude Code recusou o `scp` até então). Ele respondeu "publish
df09357435d5".

## O que foi conferido antes

- **O acesso:** `ssh agent-rails-vps` entra como `ronaldo`, com `sudo` sem senha. A versão no ar era `570fa306b4d3`,
  `brot-api` e `brot-site` estavam ativos, a porta 4239 estava livre, e havia disco e memória de sobra.
- **As afirmações da outra sessão**, todas certas:
  - a `main` estava em `df09357435d5`, com o CI verde (execução 38346226973);
  - entre `570fa306b4d3` e ela, nada mudou nas unidades, no `site-build.conf`, no `bun.lock` nem nos `package.json`;
    em `deploy/`, só o `deploy/devnet/README.md`;
  - o programa no devnet continua com o último deploy no slot 510.454.676, o mesmo do build que estava no ar (lido na
    ProgramData `8Vy9jyzijx41ntzQHniZFUBA4jFvuwueFtNXUtGvUYGK`).

## A publicação

Seguido o roteiro de `deploy/vps/README.md` ("The site under /dev0x", passo 4, e "A new release"), como na versão
anterior (`2026-10-12-upgrade-devnet-sexto-tipo.md`).

- **O pacote:** `git archive` da `main` em `df09357435d5`, sha256
  `754e2d3f4d80b0f4882c2b0183bfefca054032ed041e98a48979645754b286cc`, enviado por `scp` e conferido no servidor.
- **A versão nova, montada ao lado da atual,** com o site no ar: a instalação sem scripts (751 pacotes) e o build do
  Next sob o Bun fixado, de 04h43min30s a 04h44min21s UTC. O log diz "A-8: this build is for the program deploy at
  slot 510454676". O slot aparece num arquivo do pacote do navegador; o antigo (509.389.614), em nenhum.
- **Testada antes da troca,** numa unidade temporária com o usuário e as restrições do site, na porta 4239: as oito
  páginas (`/dev0x`, `/abrir`, `/leaderboard`, `/how-it-works`, `/fees`, `/my-entries`, `/record` e a da campanha de
  demonstração) responderam 200, com `X-Robots-Tag: noindex, nofollow, noarchive`; `/abrir` oferece "Graduation"; a
  página da campanha já traz `$BROT` no HTML do servidor. A unidade foi parada e a porta ficou livre.
- **A troca:** o atalho `current` passou de `releases/570fa306b4d3` para `releases/df09357435d5`, e `brot-api` e
  `brot-site` foram reiniciados às 04h45min20s UTC. A API disse `ok` em uns três segundos, e o ranking estava completo
  às 04h47min50s.
- **Conferido de fora:**
  - a landing na raiz, `https://brot.markets/dev0x` (com o `x-robots-tag`), `https://brot.markets/prototype/` e a
    página da campanha de demonstração respondem 200, e `https://brot.markets/api/v1/health` diz `ok`;
  - o HTML no ar traz o build novo (`aEDJVrCxiopVAVD6ssXYZ`);
  - num navegador sem tela, a 1280 e a 412 px, a campanha `8670587885290160238` diz "Meteora launch curve $BROT
    raises its full 85 SOL?", com o selo `$BROT`. Os botões dizem só "YES" e "NO", com "refund if alone" embaixo de
    cada um, e "Token mint (CA)" está nos detalhes da prova. O painel de entrada mostra o valor e o "Connect". Na
    página inicial, os cartões trazem os botões limpos, com a estimativa embaixo.
- **Não conferido:** uma entrada assinada nesta versão. O programa não mudou desde a anterior, e o build aponta o mesmo
  slot, então a trava A-8 deixa assinar como antes.

## O que deu errado, ou pede atenção

- **Na primeira visita à página da campanha,** entre um e dois minutos depois da troca, o painel mostrou "Entries are
  not taken on this site right now". O site só aceita entradas quando lê `ok` na saúde da API, e uma leitura que falha
  conta como "não" (K-11, `useEntriesAllowed`). Na visita seguinte, a 412 px, e de novo a 1280 px minutos depois, o
  painel aceitava entradas; todas as leituras da saúde feitas de fora, desde as 04h45min22s, disseram `ok`. Leitura:
  uma falha passageira dessa consulta logo depois do reinício, quando a API ainda relia o histórico. Não se repetiu.
- **O erro #418 do React** ("o HTML do servidor não bate com o do navegador") aparece em todas as páginas no navegador
  sem tela. Não é desta versão: a anterior (`570fa306b4d3`) e a nova rodaram uma de cada vez na porta 4239 e foram
  abertas pelo mesmo túnel, no mesmo navegador. As duas dão o mesmo erro em `/dev0x`, na página da campanha e em
  `/fees`, que é estática, sem o script da Cloudflare no caminho. Vem, então, da moldura comum das páginas. O registro
  da versão anterior listava só os dois erros de sempre no console (a folha da Google e o script da Cloudflare);
  provavelmente aquela conferência não escutava os erros da página, só os do console. O React refaz a árvore no
  navegador e a página funciona, mas o erro custa uma segunda renderização na carga. A causa e a correção estão no fim
  deste registro.
- **O histórico da API** relê tudo a cada reinício e não tenta de novo, até o próximo, uma transação que não voltou
  depois de cinco tentativas. Antes da troca eram 39 puladas e 21 eventos guardados; depois, 40 e 20. Não é desta
  versão: o log da API mostra 36 a 39 puladas desde que ela entrou no ar, em 11/10. O programa tem 70 transações que
  deram certo, e a RPC pública ainda devolve as mais antigas, então o motivo não é a janela de histórico dela. A causa
  e a correção estão logo abaixo.

## O histórico da API e o limite da RPC pública

O Ronaldo pediu para seguir com os próximos passos, e o recomendado era descobrir por que o histórico pula
transações.

- **A causa é o limite da RPC, e não o decodificador.** As leituras da API foram refeitas daqui, uma transação por vez,
  com o mesmo SDK. As dez primeiras voltaram e decodificaram; as outras 60 receberam HTTP 429, "Too Many Requests",
  mesmo a uns três pedidos por segundo. Os cabeçalhos da resposta dizem o limite: `x-ratelimit-method-limit: 10` para
  `getTransaction`, numa janela que se comporta como dez segundos (uma leitura a cada três segundos nunca foi recusada).
- **Como isso virava transações puladas:** depois de um reinício, o histórico pede quatro de cada vez, até 200 por
  rodada, a cada 15 segundos. Passadas as dez primeiras, a RPC recusa o resto, e o código contava cada 429 como uma
  tentativa perdida. Na quinta recusa, a transação ficava de fora até o reinício seguinte.
- **O tamanho do estrago:** a mesma leitura, com a correção, achou 53 eventos que o ranking conta; o ranking no ar
  tinha 20. Mais da metade do histórico estava de fora desde 11/10.
- **A correção** (`services/api/src/history.ts` 0.3.0): um 429 não gasta tentativa. A transação recusada guarda o
  lugar, e a rodada para de ler até a próxima, então uma rodada recusada custa no máximo quatro chamadas. `null` e
  qualquer outra recusa continuam contando, e a transação ainda é pulada depois de cinco. Três testes novos: os dois do
  429 falham no código anterior, e o terceiro prende que um 503 ainda conta.
- **Conferido contra a RPC pública,** com rodadas de 15 segundos como as da API: completo em nove rodadas, uns dois
  minutos e quinze segundos, com 53 eventos e nenhuma pulada.
- **Escolhido assim, e não só uma RPC com chave:** a chave tira o limite, mas o código continuaria pulando transações
  na primeira RPC que recusasse. A correção vale para qualquer RPC. A chave (`API_HISTORY_RPC_URL`, já prevista)
  continua sendo a forma de deixar a primeira leitura rápida, e é uma decisão à parte: de quem é a chave e quanto
  custa.
- **Vale no servidor só na próxima versão publicada.** Até lá o ranking no ar segue com 20 eventos.

## Para voltar atrás

Apontar `current` para `releases/570fa306b4d3` e reiniciar `brot-api` e `brot-site`. A versão anterior foi construída
para o mesmo slot, então também assina.

## O que ficou no servidor

A versão anterior, em `releases/570fa306b4d3`; o pacote em `/tmp/brot-df09357435d5.tar.gz`, ao lado dos pacotes das
versões anteriores; e os logs da instalação e do build na pasta do `ronaldo` (`brot-install-df09357435d5.log` e
`brot-build-df09357435d5.log`).

## O erro #418 do React

Depois do histórico, o passo seguinte da lista era este erro.

- **Achado no modo de desenvolvimento,** que escreve a diferença no lugar do código. Duas partes da moldura comum saíam
  diferentes no HTML do servidor e na primeira renderização do navegador, e por isso o erro aparecia em toda página:
  - o botão da barra do topo: o servidor, que não vê carteira nenhuma, escrevia "No installed wallet found" com o
    botão desligado, e o navegador renderizava "Connect";
  - a lista "Connect a wallet", fechada mas renderizada: o servidor escrevia só o aviso, sem carteira, e o navegador
    as linhas das carteiras.
- **Por que o navegador sempre via carteira:** o adaptador da Solflare fica "Loadable" em qualquer navegador de
  computador, mesmo sem a extensão, e o site conta "Loadable" como carteira para escolher. No servidor, todo adaptador
  é "Unsupported".
- **A correção:** o `useInstalledWallet` diz que há carteira até a hidratação terminar, e a lista monta as linhas só
  depois dela. As duas usam o `useIsClient`, que passou de `features/open-campaign` para `app/lib`, para a carteira
  não depender da caixa de abertura. Quem tem carteira não vê mudança. Quem não tem vê "Connect" durante a carga e o
  aviso logo depois, quando o navegador já olhou.
- **Conferido:**
  - no modo de desenvolvimento, as oito páginas hidratam sem diferença;
  - no build de produção com as configurações do servidor, servido daqui, `/dev0x`, a página da campanha e `/fees`
    não dão erro de página, e as três davam o #418 antes;
  - "Connect" abre a lista, com "Solflare: Ready" e "Phantom: Not installed";
  - teste novo, `tests/site/wallet-render.test.ts`: o botão renderizado no servidor diz "Connect", ligado. Ele falha no
    código anterior;
  - o lint do site e o do repositório e a checagem de tipos passaram;
  - a bateria de TypeScript inteira deu 799 de 802. As três que falham precisam do `cpi_proxy.so`, o programa só de
    teste, que nunca foi construído nesta máquina (o CI constrói).
- **O binário local do programa** era de 10/10, anterior ao sexto tipo, e seis testes da caixa de abertura falhavam
  por isso. Foi trocado pelo do CI da `main` em `df09357` (execução 38346226973, sha256 conferido pelo `SHA256SUMS`, o
  mesmo `63610a32…d7e4` do devnet). O antigo ficou guardado fora do repositório.
- **Vale no ar só na próxima versão publicada,** como a correção do histórico.
