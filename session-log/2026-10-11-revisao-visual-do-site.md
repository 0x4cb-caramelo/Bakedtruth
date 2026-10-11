# 2026-10-11 — A revisão visual do site: as telas aprovadas da Sprint -1 no `app/`

## Ponto de partida

- Testando o site na própria máquina, o Ronaldo viu que ele não se parecia com o desenho aprovado: o PR #67 tinha
  trazido só as cores da marca (`app/styles/tokens.css`), e a estrutura das telas continuava a das sprints do site.
- O pedido chegou num texto colado, que apontava como referência os arquivos `/3`, `/4` e `/5` da branch
  `feat/site-3-original-com-cores-do-deck`. Antes de agir, li a branch: ela só tem três versões da página de espera
  (`services/landing/public/3`, `4` e `5`), com as cores do deck. Nenhum cartão de campanha, nenhuma `/abrir`, nenhum
  ranking. As telas do site aprovadas pelo fundador em 10/10 são as da Sprint -1, em `prototype-lab/campaigns/`,
  servidas em `brot.markets/dev0x/`.
- Perguntei qual das duas seguir. O Ronaldo escolheu o protótipo de `/dev0x/`, nas cores e fontes do `BRAND.md`.
  Depois acrescentou, com as próprias palavras: "if you cant reconstruct everything right now, just make sure the
  screens that we did in the begining of the sprints, are really funcional". Daí a ordem: a moldura, a página inicial e
  os cartões, a página da campanha com a entrada, a abertura e Minhas entradas; depois o resto.
- A branch `feat/full-ui-overhaul` saiu da `origin/main` sem acompanhar a `main`, numa cópia à parte do repositório
  (`../brot-ui`), para não mexer no site que o Ronaldo estava testando nem no agente do indexador.

## Decisões, e por quê

- **Os estilos do protótipo entraram como estão,** em `app/styles/ui/`, dentro das camadas `base` e `components`.
  Converter mil e trezentas linhas de CSS para classes do Tailwind seria mais lento e mais sujeito a erro do que copiar
  o que já foi aprovado. As camadas mantêm os utilitários do Tailwind valendo onde os dois se encontram. As variáveis
  do `tokens.css` do site já tinham os nomes das do protótipo, então as cores da marca entraram sozinhas.
- **A marcação de cada tela foi refeita sobre as classes do protótipo,** mas cada leitura, regra e fluxo continuou o
  mesmo. Quando o protótipo mostra algo que o site não tinha, entrou o que dá para ler de verdade: a leitura de agora
  contra o alvo em cada cartão vem das contas, numa chamada em lote a cada 30 s, decodificadas pelos leitores do SDK;
  o custo da abertura no topo é a cotação da caixa de abertura.
- **Onde o texto do site é mais novo que o do protótipo, ficou o do site:**
  - "Use Installed Wallet" (S1);
  - os avisos inteiros na faixa, em qualquer largura;
  - o pagamento que ainda não é automático no devnet (o protótipo dizia "No claim button", e existe o "Receive");
  - os rótulos dos tipos da Sprint 19.
- **A regra das 24 horas continua:** a página inicial esconde a campanha sem entradas depois de um dia. As quatro
  campanhas abertas no devnet hoje estão assim, e por isso o carrossel diz que não há campanha aberta; o interruptor
  "All campaigns, unlisted too" mostra as quatro.

## O que deu errado no caminho

- O botão "Open a campaign" do topo da página aparecia girando inteiro. O protótipo anima a borda com uma `@keyframes`
  chamada `spin`; o Tailwind tem a sua `spin`, que gira o elemento, e a dele vencia. O botão passou a usar a
  `brot-spin` que o site já tinha.
- No celular, a barra do topo passava 4 px da tela por causa de "No installed wallet found"; no celular o botão diz
  "No wallet found".
- O ícone do tema sumiu: o CSS do protótipo só mostra os ícones com as classes `sun` e `moon`.
- O teste de avisos guardava que o rodapé morava em `app/layout.tsx`; o registro aponta agora para
  `components/site-footer.tsx`.

## O que mudou nos testes, e por quê

- No celular, "How it works" fica no menu, como no protótipo: o teste abre o menu antes de clicar.
- Ligada a carteira, o sinal é o chip com o endereço e o saldo; o "Disconnect" mora no menu dele. Os testes esperam o
  chip.

## Os ajustes do Ronaldo depois de ver a revisão

Ele abriu a versão nova na porta 3100 e pediu três coisas:
- o título e o subtítulo da página inicial exatamente como no pitch;
- "Connect" no lugar de "Use Installed Wallet";
- "campaign" e "campaigns" no lugar de "question" e "questions".

- **O título e o subtítulo.** A capa do deck em `/pitch` diz "Prediction markets the chain resolves." e "Permissionless
  prediction markets that turn on-chain milestones into growth campaigns, settled by the chain itself.". Copiadas
  exatamente, as duas linhas poriam "prediction markets" no site, contra a regra do Lucas de 8/10 (nunca "market" fora
  da marca), que um teste do site guarda. Perguntei. O Ronaldo escolheu a forma do pitch com "campaigns", e deu o
  porquê: "Strategically and legally, framing our product as 'campaigns' rather than 'prediction markets' protects us
  from gambling associations and perfectly fits our hackathon positioning as a growth primitive for creators and
  protocols." E pediu a regra "strictly intact across the entire site and tests, with absolutely no exceptions".
  Ficou "Campaigns the chain resolves." e "Permissionless campaigns that turn on-chain milestones into growth, settled
  by the chain itself.".
- **"Connect".** Só o rótulo mudou: o botão continua conectando só pelo clique de quem usa, pela carteira instalada
  (S1). Os testes procuram o nome exato, "Connect", para não confundir com "Disconnect".
- **"question" virou "campaign".**
  - O título de How it works: "A campaign the chain answers".
  - O passo de abrir, na página inicial e em How it works: "the site writes the campaign…".
  - As dicas da busca da caixa de abertura: "Campaigns we can check".
  - No primeiro parágrafo de How it works, a troca literal daria "An On-Chain Campaign is a YES/NO campaign"; ficou
    "An On-Chain Campaign: YES or NO, about one Solana account.".
  - As citações internas do plano ("TP §8, question 8") não são texto do site e ficaram.
- O teste do vocabulário pegou a palavra "markets" num comentário que eu tinha escrito no arquivo de texto da página
  inicial; o comentário mudou, e o teste ficou como estava.
- **Um defeito antigo do Baked apareceu.** No teste do celular, o balão de fala passou 41 px da tela em How it works,
  embora a foto do erro o mostrasse dentro. O balão era encaixado na tela uma vez, quando aparecia. Se o toque pegava o
  Baked no meio de um pulo, ele pousava perto da borda e levava o balão junto, para fora. A regra da Sprint 13 diz que
  no celular o balão não corta. Agora o balão é encaixado de novo sempre que o Baked se move enquanto ele aparece. O
  defeito é anterior à revisão; o desenho novo mudou onde o Baked pousa e o expôs.

## Os dois consertos depois da segunda olhada

O pedido chegou num texto colado, e o Ronaldo confirmou com as próprias palavras ("Yes, both").

- **Um botão de abrir, não dois.** A página inicial tinha o botão grande amarelo no topo e o "Open a campaign" azul da
  barra. O amarelo saiu e o da barra virou o amarelo da marca (o botão primário do desenho). A linha de topo ficou só
  com o custo da abertura. O carrossel vazio ainda mostra o seu "Open a campaign" pequeno, que é o estado vazio do
  protótipo, não um terceiro botão no topo.
- **"Connect" não fazia nada.** Ele ligava direto a primeira carteira que o navegador dizia ter instalada, sem lista,
  e engolia o erro. Uma recusa, uma carteira trancada ou a carteira errada, entre várias, pareciam um botão morto. O
  desenho aprovado tem a lista "Connect a wallet", e foi o que entrou:
  - as carteiras do navegador, as detectadas primeiro e as que faltam apagadas;
  - a escolhida é selecionada e ligada, só pelo clique (S1);
  - o que a carteira responde quando não liga aparece na lista.

  Os três botões ("Connect" na barra, no painel de entrada e na caixa de abertura) abrem a mesma lista. Os testes na
  web escolhem a carteira de teste nela.

## A busca da caixa de abrir

O Ronaldo pediu que a caixa onde se escreve a campanha, em `/abrir`, completasse o texto enquanto se digita, "como a
barra de busca do Google", levando a pessoa a uma campanha que a cadeia de fato confere. Ele apontou o protótipo em
`/dev0x/` como o exemplo quase perfeito.

A busca da Sprint 19 já existia, mas sugeria rótulos soltos ("BTC/USD", "Burn"). Entrou o comportamento do protótipo
(`open-slots.js`), com o que faltava para ele guiar:

- **Cada sugestão é a frase da campanha** que ela abriria, escrita pelo mesmo modelo v1 da página da campanha, com o
  alvo na unidade do tipo e o nome revisado no lugar do endereço. O que falta aparece como "…".
- **Ela lê o que a pessoa escreve:** a direção ("falls to", "drop", "reaches"), o prazo ("in 30 days", "2 weeks",
  dentro dos 3 a 90 dias do programa) e o alvo com "k" e "m" ("120k"). Palavras de ligação ("in", "to") não contam:
  sem isso, "in" achava o INF/USD e "to" achava o "token" da queima.
- **Com o preço da Pyth lido agora, nunca sugere um alvo já atingido**, que o programa recusa. Com o BTC a 85 mil,
  "BTC reaches 50000" vira "BTC/USD falls to 50,000", o único jeito de essa campanha abrir. Corrigir a direção pareceu
  melhor do que esconder a sugestão: a frase mostra a correção antes do clique.
- **Um número sozinho** ("120000") acha os feeds com preço perto dele. **A caixa vazia** começa com três exemplos 25%
  acima do preço (BTC, SOL e ETH primeiro), e depois os cinco tipos.
- **Um feed sem preço fresco** continua achável, marcado "no fresh price now"; a caixa diz o resto quando ele é
  escolhido.
- **Fora do que a cadeia confere**, o Baked desconfiado diz "We can't check this on-chain." e mostra os três tipos mais
  próximos, como no protótipo.
- **Enter pega a primeira sugestão.** O protótipo só pegava a destacada, mas numa barra de busca o Enter faz alguma
  coisa. Depois da escolha, o cursor vai para o campo que falta: a conta, ou o alvo.

O que se digita continua só na memória da página (D-j): nada vai para servidor nem fica guardado, e a escolha preenche
só os campos, conferidos como se tivessem sido digitados. As capturas de tela mostraram mais uma falha, anterior a esta
mudança: o botão do prazo escolhido ("30 days") não aparecia marcado, porque a revisão visual não tinha levado o estilo
do protótipo para esses botões. Agora ele aparece. O teste na web da cena nova falhou na primeira rodada por um
erro do próprio teste: a frase "We can't check this on-chain." aparece duas vezes, na tela e no aviso para leitor de
tela, e o localizador pegava as duas.

## O que fica

- O cartão de compartilhar, o painel "About this campaign", a linha do tempo "Where it is" com a campanha aberta, a
  lista densa de todas as campanhas, a barra fixa de entrada do celular, o selo de parceiro e as falas do Baked por
  tela.
- Fees, How it works e o registro só ganharam a cabeça e os títulos; o corpo deles segue o das sprints.
