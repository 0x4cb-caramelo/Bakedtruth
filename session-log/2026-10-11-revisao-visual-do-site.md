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

## O que fica

- O cartão de compartilhar, o painel "About this campaign", a linha do tempo "Where it is" com a campanha aberta, a
  lista densa de todas as campanhas, a barra fixa de entrada do celular, o selo de parceiro e as falas do Baked por tela.
- Fees, How it works e o registro só ganharam a cabeça e os títulos; o corpo deles segue o das sprints.
