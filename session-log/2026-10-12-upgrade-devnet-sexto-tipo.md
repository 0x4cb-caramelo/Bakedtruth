# 2026-10-12 — O sexto tipo no devnet: o upgrade do programa, o site novo em `brot.markets/dev0x` e a campanha de demonstração

Horários em UTC. No horário de Brasília, tudo aconteceu na noite de 12/10 (o upgrade às 22h08).

## O pedido

Chegou num texto colado, com partes cortadas no fim de algumas linhas (completadas pelo sentido óbvio). Pedia, nesta
ordem: conferir tudo sem enviar nada; baixar o artefato do CI da `main` depois do PR #76 (o sexto tipo,
`DbcGraduated`); aumentar a conta ProgramData à mão e só então fazer o upgrade; conferir o programa no devnet; mesclar
o PR #78 (o site e os documentos do sexto tipo, que o #77 tinha levado para a branch do #76 em vez da `main`); publicar
o site em `brot.markets/dev0x` a partir dessa `main`; o Ronaldo abrir a campanha de demonstração; e este registro, por
um PR de documentos. A ordem importa porque o build do site grava o slot do último deploy do programa (A-8): ele só
pode ser feito depois do upgrade.

Como o pedido veio só como texto colado, e minhas notas dizem para confirmar com o Ronaldo antes de uma mescla, a
sessão perguntou antes de enviar qualquer coisa, já com tudo conferido, avisando que o site no ar não assinaria nada
entre o upgrade e o build novo. A resposta foi "Yes, all of it": o upgrade, a mescla do #78 e o site.

## Antes de enviar, só leitura

- **A ferramenta:** `solana-cli 3.1.10`. **O cluster:** o hash de gênese é o do devnet
  (`EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG`).
- **A chave:** a de upgrade de devnet do Ronaldo, `6N7rUnJ88yyBiZmGEn3DjyyX9AEtmwzXNGUsps2A4wcq`, na máquina dele,
  fora de qualquer repositório e com permissão 600; saldo de 4,64831785 SOL. Ela pagou tudo o que vem abaixo.
- **O programa** `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o`: loader v3, ProgramData
  `8Vy9jyzijx41ntzQHniZFUBA4jFvuwueFtNXUtGvUYGK`, autoridade `6N7r…`, último deploy no slot 509.389.614, 159.576
  bytes de programa. Tudo como o pedido dizia.
- **O artefato:** `programs-91a5bede4eb0bb71ce23c7a0800a79704fc0c1e4`, da execução 38327381894 do CI (um push na
  `main`, verde, no commit `91a5bed`, a mescla do #76). O `SHA256SUMS` conferiu os dois arquivos; `brot_markets.so` tem
  163.800 bytes e sha256 `63610a32d6dfa243af80f741dad328645e49fdd3c2d34173e0471c4a2982d7e4`; o IDL do artefato é, byte
  a byte, o da `main`.
- **O servidor:** o acesso por SSH com sudo funciona; a versão no ar era `6a52505c9aba`, construída para o slot
  509.389.614; a API respondia `ok`; a porta 4239, usada para o teste, estava livre.
- **O PR #78:** aberto, sem conflito, com o CI verde no commit da ponta (`5ac4a269`).
- **A RPC:** uma RPC com chave, passada por variável de ambiente. A chave não foi escrita em arquivo, commit nem log, e
  toda saída passou por um filtro que apaga chaves, identificadores com cara de UUID e frases de recuperação. Todo
  comando do `solana` levou `--url` explícito, porque o padrão desta máquina é a mainnet.

## O programa

- **O aumento da ProgramData** (01h08min01s): `solana program extend` com 10.240 bytes. Assinatura
  `51gvu4iQRg9eULzdKZPxjatZVo2j9UwvJmKCNCtJVfL15PU96L3A1iuZs4wXBW5yZ95sXuVCbZrG2c1y2K5UDCG2`, slot 510.454.443,
  finalizada. O aluguel foi de 0,0520192 SOL (10.240 bytes a 5.080 lamports). O CLI não imprimiu a assinatura; ela foi
  lida no histórico da conta ProgramData. O próprio aumento grava o slot dele na ProgramData (o "Last Deployed In Slot"
  passou a 510.454.443), e por isso o loader recusa um upgrade nesse mesmo slot; o upgrade veio quase um minuto depois.
- **O upgrade** (de 01h08min49s a 01h09min00s, onze segundos): `solana program deploy` com o artefato, `--use-rpc`, preço
  por unidade de computação 10.000, 50 rodadas de assinatura e `--no-auto-extend`. Assinatura
  `2GkUHe1U4DwM62rEWembKtu9QSfjgMiV3jw7AgZzM7eynyCXD5DxgWqQL8dBUT8UjgMbbWsnJKePk5F7pezvtyLm`, no slot 510.454.676, às
  01h08min59s. O log do loader diz "Upgraded program 5Rx8…".
- **Conferido depois**, com o compromisso `finalized`:
  - a autoridade continua `6N7r…`;
  - a ProgramData tem 169.816 bytes;
  - o último deploy é o slot 510.454.676;
  - os primeiros 163.800 bytes do programa baixado da rede dão o sha256 do artefato, e os outros 6.016 são zeros;
  - nenhum buffer ficou aberto em nome da autoridade.
- **O custo:** o saldo foi de 4,64831785 a 4,595418977 SOL, ou seja, 0,052898873 SOL no total (o aluguel do aumento e as
  taxas). O buffer, de uns 0,83 SOL, voltou no fim do deploy.

## A mescla do #78

Conferido de novo antes: a mesma ponta, sem conflito, CI verde nela. Mesclado às 01h09min43s, como merge commit
(`570fa306b4d39811a6994fcf577625976e27c3c3`), com a ponta conferida na hora (`--match-head-commit`). O CI da `main`
nesse commit (execução 38330797413) passou nos quatro trabalhos: Program, Repo, App e Mobile bundle.

## O site

Seguido o roteiro de `deploy/vps/README.md` ("The site under /dev0x", passo 4, e "A new release"). Entre a versão no
ar (`6a52505c9aba`) e a nova, nada mudou nas unidades, nas configurações, no `bun.lock` nem nos `package.json`: só o
código do site e do SDK.

- **O pacote:** `git archive` da `main` em `570fa306b4d3`, sha256
  `d00ce9e850f4e703b7d5f92350621b788172dcea0bed89ef610bb89f0898475d`, enviado por `scp` e conferido no servidor.
- **A versão nova, montada ao lado da atual,** com o site no ar: a instalação sem scripts (751 pacotes) e o build do
  Next sob o Bun fixado, de 01h16min19s a 01h17min18s. O log diz "A-8: this build is for the program deploy at slot
  510454676": o slot novo. O slot novo aparece num arquivo do pacote do navegador, e o antigo em nenhum.
- **Testada antes da troca,** numa unidade temporária com o usuário e as restrições do site, na porta interna 4239: as
  oito páginas (`/dev0x`, `/abrir`, `/leaderboard`, `/how-it-works`, `/fees`, `/my-entries`, `/record` e a página de
  uma campanha) responderam 200, com `X-Robots-Tag: noindex, nofollow, noarchive`, e `/abrir` oferece "Graduation".
  A unidade temporária foi parada e a porta ficou livre.
- **A troca:** o atalho `current` passou de `releases/6a52505c9aba` para `releases/570fa306b4d3`, e `brot-api` e
  `brot-site` foram reiniciados às 01h18min24s. A API voltou a dizer `ok` em uns dez segundos. Logo depois do reinício,
  o ranking dela ainda estava incompleto, relendo o histórico; às 02h13 estava completo e sem erro de leitura.
- **Conferido de fora:**
  - `https://brot.markets/dev0x` responde 200, com o `x-robots-tag`;
  - `https://brot.markets/api/v1/health` diz `ok`;
  - a página inicial responde 200;
  - o HTML no ar traz o build novo (`E57ebcP311uCHHEbu3Zsy`), e o arquivo servido traz o slot 510.454.676;
  - o `assertDeploy` do SDK, a mesma checagem que o site faz antes de assinar, rodado contra a RPC pública do devnet,
    passa com 510.454.676 e recusa 509.389.614 (`ProgramUpgraded`);
  - num navegador sem tela, duas campanhas abertas mostram o painel de entrada com o campo de valor e o "Connect", sem
    o aviso "Entries are not taken on this site right now". Os únicos erros no console são os dois de sempre: a folha
    de estilo do Google e o script de estatísticas do Cloudflare, bloqueados pela política do site.
- **Não conferido aqui:** uma entrada assinada depois do upgrade. A abertura da campanha de demonstração, assinada
  depois no site com a carteira da equipe (abaixo), mostra que a trava A-8 deixa assinar: a caixa confere o deploy
  antes de entregar a transação à carteira.

## A janela sem assinatura

De 01h08min59s (o upgrade) a 01h18min24s (a troca do site), uns nove minutos e meio, o site no ar era o build do slot
509.389.614 e recusava assinar qualquer coisa, como a A-8 manda. Ver as páginas continuou funcionando.

## O que deu errado

- **Dois scripts meus no servidor pararam no meio,** sem efeito: um `grep` sem nenhum resultado devolve código 1, e o
  script tratava isso como falha. Um contava o slot antigo no pacote (zero, o resultado certo); o outro contava quem
  escutava na porta 4239 depois de parar o teste (ninguém, também certo). As duas partes foram rodadas de novo.
- **A assinatura do aumento** não saiu na tela, e a primeira leitura do histórico escondeu a linha dela por causa de um
  filtro meu. A segunda leitura trouxe a assinatura.

## A campanha de demonstração

O passo 8 era do Ronaldo: abrir em `/dev0x/abrir`, com a carteira da equipe, uma campanha "Graduation" no pool
`12uLN2texEDbadM4WzJm6Dry8Quc8qFpDQEwhSdi7Dny`. Os scripts `scripts/team/open.ts` e `seed:devnet` não servem para isso:
não passam a config do pool como décima conta.

- **O pool, conferido só por leitura** com o leitor do SDK: config `JAHdAi27fMHsUn3b2uhAmTeVf8zTJpKXhH2vT4UUKiDJ`,
  cotado em SOL, limite de 85 SOL, nada juntado, estágio 0. Os dois de reserva também estão intactos:
  `5Pc94WkxdvfCBkXtrYWhn3CRvJo24yDiRLdG3N9rcjS` e `77gSVGFuGQAM2DQmdSYxPSGaHTQg2UaA55AF5TmzLTz`, cada um com 0 de 85 SOL
  no estágio 0. A carteira da equipe (`3Egr…XwMz`) tem 0,054 SOL de teste, o bastante para o aluguel e as taxas de uma
  abertura grátis.
- **A frase:** o Ronaldo pediu a frase da campanha. Na caixa, escrever "curve graduates in 30 days" faz o site
  oferecer só o modelo Graduation, com prazo de 30 dias; com a palavra "Meteora", ele oferece antes o modelo da trava
  de liquidez da DAMM v2. A campanha ficaria assim: "Meteora launch curve 12uL…7Dny raises its full 85 SOL", e o título
  da página, a mesma frase com "?".
- **Ele parou antes de abrir:** "estou achando que so colocar pool e o endereco base58 fica pouco user friendly,
  teriamos como colocar esse endereco mas na frase da UI ficar algo direfernte tipo o nome da pool ou algo assim?
  teremos que colocar disclaimers tambem pra garantie que o usuario esteja realmente colocando o endereco correto.
  vamos falar a respeito disso antes de eu abrir a campanha". A campanha ficou para depois dessa conversa: como o pool
  aparece na frase (um nome no lugar do endereço) e que avisos garantem que quem abre colou o pool certo.
- **O que a sessão propôs** (as respostas dele seguem abertas):
  - o nome legível vem só da lista revisada pela equipe (`content/account-names.json`), como a regra A-11 da
    arquitetura aprovada já diz ("never from token metadata that the token's owner can change"). A lista passa a
    aceitar curvas, e o nome passa a aparecer também no título, nos cartões e na página, e não só na caixa de abertura;
  - sem nome revisado, a caixa e a página mostram o endereço do token (o "CA", que os projetos publicam no X e no site),
    com botão de copiar, o link do explorador e o aviso de que qualquer pessoa cria um token com qualquer nome ou logo;
  - antes de assinar a abertura de uma conta sem nome revisado, uma caixinha "Conferi o endereço".
- **Por que não o nome do próprio token:** qualquer pessoa cria um token chamado "Solana" ou "Brot", e quem guardou o
  direito de editar os metadados pode trocar o nome depois que os padeiros entraram. O token deste pool se chama
  "Test" e foi criado por outra pessoa no devnet; os dois de reserva se chamam "Flush Two" e "Test Token UILQ" (lidos
  nos metadados da Metaplex de cada token). Como a campanha guarda só o endereço do pool, um nome revisado que entre
  depois aparece também nas campanhas já abertas, e nada disso mexe no programa.
- **Aberta pelo Ronaldo** às 02h34min51s, com a carteira da equipe, ainda com o endereço na frase: a campanha
  `8670587885290160238`, conta `3yJ3QxApTtSV8sPasRiowceKsXGrhw9HuDQ8ogJDiuN2`, transação
  `2RQNL84W4PDYmdBwQqLXe73DBrgQxz7F7gmf8BXrxrhQSzyMvfYWYDpngCsuMPxhYXPmzvh9WDaQ12zSHsz4sXxu` (slot 510.476.240). A
  conferência de abertura (`scripts/team/check-opening.ts`, só leitura) diz "a free opening: paid 0, prize 0, fee 0" e
  "The opening matches the formula.": grátis, sem parte do criador, meta de 85 SOL (o limite da curva), entradas até
  19/10 às 02h33 UTC e prazo em 20/10 às 02h33 UTC, sete dias.
- **A página**, `brot.markets/dev0x/c/8670587885290160238`, num navegador sem tela: o título "Meteora launch curve
  12uL…7Dny raises its full 85 SOL?", a barra da curva (0% filled, "0.0000 SOL raised of 85.0000 SOL", "On the curve",
  "85.0000 SOL still to raise before the curve completes and the token graduates."), o aviso "YES can be bought by
  anyone who pays the rest of the curve." com a explicação, "If read now: NO", e o painel de entrada com o campo de
  valor, sem o aviso de entradas fechadas. No console, só os dois bloqueios de sempre.

## Para voltar atrás

- **O site:** apontar `current` para `releases/6a52505c9aba` e reiniciar `brot-api` e `brot-site`. A versão antiga
  ficou no servidor, mas foi construída para o slot antigo: com o programa novo, ela mostra as campanhas e não assina.
- **O programa:** não há volta simples. Voltar ao binário anterior seria outro upgrade, com o artefato antigo e a
  mesma revisão. O aumento da ProgramData não se desfaz.

## O que fica com o Ronaldo e o fundador

- Decidir de onde vem o nome legível (só a lista revisada, ou também o nome que o token declara, o que muda a regra
  A-11 e pede o Lucas) e que avisos a caixa e a página dão; depois, a mudança no site e, para um nome revisado, a
  segunda revisão de `content/` (Lucas ou Bernardo).
- Conferir com uma carteira ligada uma entrada assinada no site novo.
- Mesclar este registro.
