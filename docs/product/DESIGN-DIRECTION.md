# DESIGN-DIRECTION.md

- **Project:** Brot Markets (mascote: Baked, o pãozinho)
- **Approved on:** 2026-10-03
- **Approved by:** Lucas
- **Chosen direction:** combinação `ledger2-d-n`: D · Ledger² no escuro, N · Ledger² Light no claro
- **Status em 2026-10-05:** este documento substitui a versão de 2 de outubro, que descrevia a direção C ("Tape"). A C
  foi trocada em 3 de outubro: o Lucas pediu "vamos usar o layout D, Ledger2, e dele queremos a sua versão light" e,
  depois de ver a N no lab, respondeu "N aprovado". Os motivos estão em
  [`session-log/2026-10-03-direcao-ledger2-claro-e-escuro.md`](../../session-log/2026-10-03-direcao-ledger2-claro-e-escuro.md).
- **Status em 2026-10-10: as cores mudaram para as da marca.** O site (`app/`) usa as cores de
  [`BRAND.md`](BRAND.md) §5, tiradas da página `/5` que o Lucas aprovou em 9/10: azul-marinho e laranja no escuro,
  creme e ferrugem no claro, nenhum azul. A estrutura, a tipografia, os componentes e o resto da direção Ledger²
  continuam valendo. A troca e as escolhas que ela pediu estão em [Cores](#cores); a tabela antiga ficou como histórico.
- **Status em 2026-10-11: o site tem a estrutura das telas aprovadas, não só as cores** (a revisão visual, branch
  `feat/full-ui-overhaul`, a pedido do Ronaldo). As telas da Sprint -1 (`prototype-lab/campaigns/`, servidas em
  `/dev0x/`, aprovadas pelo fundador em 10/10) passaram para `app/`:
  - **Os estilos do protótipo** estão em `app/styles/ui/` como estão (dez arquivos), dentro das camadas `base` e
    `components`, para os utilitários do Tailwind valerem onde os dois se encontram. As cores vêm de
    `app/styles/tokens.css`, cujas variáveis têm os nomes do protótipo, então o azul do Ledger² vira o laranja da marca
    sem tocar nos arquivos portados. `additions.css` guarda só o que o site precisa a mais.
  - **O que ganhou a estrutura do protótipo:**
    - a moldura: a faixa da devnet, a barra do topo com o Baked, as três abas, a busca, "Open a campaign", o tema, a
      carteira (o chip com saldo e o menu) e, abaixo de 1180 px, o menu com todas as rotas; o rodapé;
    - a página inicial inteira: a linha de topo com o custo da abertura agora, o carrossel "Open now" com o painel de
      leitura, "Closing soon", "Answered recently", os passos e os princípios, a barra de filtros e a grade;
    - o cartão de campanha, com a leitura de agora contra o alvo, lida em lote;
    - a página da campanha e o painel de entrada;
    - a caixa de abertura (números em círculo, as letras dos tipos, a direção em duas metades, o "$" do alvo, as
      faixas de valor);
    - Minhas entradas e o ranking.

    Fees, How it works e o registro ganharam a cabeça de página e os títulos do protótipo.
  - **Os pedidos do Ronaldo depois de ver a revisão (11/10):**
    - o título e o subtítulo da página inicial são os da capa do pitch, no vocabulário do site: "Campaigns the chain
      resolves." e "Permissionless campaigns that turn on-chain milestones into growth, settled by the chain itself.";
    - o botão da carteira diz "Connect" e abre a lista "Connect a wallet" do desenho aprovado; a carteira escolhida
      conecta só pelo clique (S1), e o erro dela aparece;
    - um só botão de abrir campanha: o da barra, no amarelo da marca; o grande da página inicial saiu;
    - a busca da caixa de abertura completa o que se digita, como a do protótipo (`open-slots.js`): a frase inteira de
      cada campanha sugerida, agrupada por tipo, com a direção, o prazo e o alvo lidos do texto; nunca um alvo já
      atingido; exemplos na caixa vazia; e o Baked desconfiado fora do que a cadeia confere;
    - "$" antes do preço, como no protótipo: na frase ("SOL/USD reaches $150") e nos outros preços em US$ (a regra, a
      prova, os cartões); um feed de razão (SSOL/SOL.RR) fica sem "$";
    - os efeitos do protótipo que seguem o mouse (`effects.js`): o campo de pontos atrás da página, que acende em volta
      do cursor, e a luz sobre os cartões da grade;
    - a página da campanha mais enxuta: o título como pergunta ("…$150?"), a regra numa linha com a inteira em "Full
      rules", os detalhes da prova em "Proof details", as notas da entrada em "Read before you enter" (na cor de
      destaque), "Re-check it yourself" mais fino e a estimativa sem espaço sobrando;
    - "question" virou "campaign" no texto do site;
    - a regra do vocabulário segue inteira, sem exceção.
  - **Onde ficaram as palavras do site, e não as do protótipo:**
    - a faixa diz os dois avisos inteiros em qualquer largura;
    - o terceiro princípio diz que no devnet o pagamento ainda não é automático (o protótipo dizia "No claim button");
    - os rótulos dos tipos na caixa de abertura são os da Sprint 19.
  - **Ainda não estão no site:**
    - o cartão de compartilhar (BR-33);
    - o painel "About this campaign";
    - a linha do tempo "Where it is" enquanto a campanha está aberta;
    - a lista densa de `#/campaigns` (no site, o interruptor "All campaigns, unlisted too" da grade);
    - a barra fixa de entrada do celular na página da campanha (no site, o painel vai na coluna);
    - o selo de parceiro (não há `content/partners.json`);
    - as falas próprias do Baked em cada tela.

| Identificador | `ledger2-d-n` |
|---|---|
| Pastas de origem | `prototype-lab/prototype-d/`, `prototype-lab/prototype-n/` |
| O que veio de cada | Da D: estrutura, marcação, tipografia e o tema escuro. Da N: o tema claro e o botão de tema. |
| Pasta consolidada | `prototype-lab/prototype-n/`. Ela já contém os dois temas: o claro em `prototype-n/styles.css` e o escuro nos valores padrão de `prototype-lab/shared/ledger.css`. |

Arquivos lidos: `prototype-d/{index.html,styles.css,view.js}`, `prototype-n/{index.html,styles.css,view.js}` e, em
`prototype-lab/shared/`, `ledger.css`, `ledger.js`, `app.js`, `mosaic.js`, `mascot.js`, `mock-data.js` e as oito poses
em `mascot/`. Caminhos abaixo são relativos a `prototype-lab/`.

**Aviso de leitura.** O protótipo foi feito antes de o produto ser redefinido. A linguagem visual vale. O conteúdo
de várias telas não vale mais: ver [Conflitos com o produto decidido](#conflitos-com-o-produto-decidido). As
referências "P1 §3.2" apontam para `docs/business/BP-v0.0.2-parte-1-produto.md`, seção 3.2 (P2 e P4 são as partes 2
e 4 do mesmo plano).

---

## A direção em um parágrafo

A Ledger² é uma mesa de operações: superfícies em ardósia, um único azul para a interface, verde e vermelho só para
SIM e NÃO, e o âmbar da casca do pão para a marca. A home abre com um mosaico (carrossel à esquerda, duas listas à
direita), depois três princípios, os filtros e uma grade de cards. Os títulos e os números usam Barlow Condensed; o
resto usa Inter. O tema claro é a mesma página com as superfícies invertidas: mesma marcação, mesmos raios, mesma
tipografia e mesmo movimento. Só mudam as variáveis de cor, a sombra dos painéis e a cor dos tokens de mercado.

### Como o tema é trocado

Tudo em `prototype-n/`. A D sozinha não tem botão de tema.

1. `index.html` nasce com `<html data-theme="light">`.
2. Um script no `<head>`, antes do CSS, decide o tema: o parâmetro de URL `?theme=dark|light` vence; se não houver,
   vale `localStorage.getItem("baked-theme")`; se não houver, fica `light`. Qualquer valor diferente de `"dark"`
   vira `light`.
3. O escuro não tem seletor próprio: são os valores padrão de `:root` em `shared/ledger.css`. O claro é
   `:root[data-theme='light']` em `prototype-n/styles.css`, que redefine as variáveis.
4. O botão `.theme[data-theme-toggle]` fica entre "How it works" e "Connect wallet". Mostra a lua no claro e o sol no
   escuro. O clique (`prototype-n/view.js`) inverte `data-theme`, grava em `localStorage` (`baked-theme`, dentro de
   `try/catch`), atualiza `aria-label` e `title` ("Switch to the dark theme") e dispara `resize` para o campo de
   pontos redesenhar com a cor nova.
5. A troca anima `background-color .2s, border-color .2s` em `body`, `.top`, `.card`, `.carousel`, `.side-box`,
   `.proof`, `.chart` e `.order`; desliga com `prefers-reduced-motion`.

`prefers-color-scheme` não é consultado. O parâmetro de URL não é gravado; só o clique grava.

## Why this direction won

Registro do `session-log` de 3 de outubro: a D era a que o Lucas apontava como a mais próxima ("o ledger2 é o que
está mais próximo"). Fazer o claro como variáveis sobre a mesma estrutura mantém um site só com dois temas e deixa a
passagem para o app barata. A escolha foi feita dois dias antes do BP v0.0.2 e não foi amarrada a personas; o público
decidido depois é "pessoal da web3" (P1 §2.2).

## What the other directions did better

Fonte: `prototype-lab/README.md`.

- **M · Vault** mostra o que a D não tem: carteira conectada, posições do usuário e um aviso de transação.
- **K · Desk** tem faixa de números, lista em tabela e feed de atividade.
- **L · Arena** escreve a regra de resolução em uma frase na página do mercado.

## What was rejected, and why

| Elemento rejeitado | Veio de | Por que não |
|---|---|---|
| Direção C "Tape" (pixel art, mercados em linhas) | aprovação de 2/10 | Reaberta em 3/10 ("ainda não decidimos como vai ser") e substituída pela D no mesmo dia. O motivo não foi registrado. |
| F no escuro com K no claro | decisão de 3/10, horas antes | Duas direções com forma e fonte diferentes; o botão de tema não pareceria uma inversão. Nunca implementada. |
| K como o claro da D | K · Desk | Outra tipografia, cantos retos e blocos a mais. O pedido foi a versão clara da própria D. |
| N só clara, sem botão | alternativa da N | O botão custa pouco e mostra a inversão de que o app precisa. |
| Etiqueta de variação de preço no carrossel (`.delta`) | `shared/ledger.js` (K, L, M) | A D não tem; a N esconde com `display: none`. |

---

## Tokens

### Cores

**Desde 2026-10-10, as cores da marca** (o item em aberto de `BRAND.md` §13, pedido pelo Ronaldo: "port BRAND.md's
colors ... to our current functional Next.js site"). Os valores ficam em `app/styles/tokens.css`; os componentes leem os
nomes, nunca uma cor escrita direto.

- **O que vem do `BRAND.md` §5, sem mudança:** fundo, painel, linhas, texto, apoio, letra miúda, destaque e a cor do
  texto sobre ele, botão e botão sob o ponteiro, anel do botão, `--crust`, YES, NO, faixa do topo, trilho e barra
  preenchida, erro, pontos do fundo, balão e sombra do mascote, sombras. Nos dois temas.
- **O escuro continua sendo o tema de abertura do site**, como na direção aprovada em 3/10. A `/5` abre no claro
  (`BRAND.md` §9); o site não.
- **Onde o site difere da marca, e por quê:**
  - `--raised` no escuro é `#1f2836`, um passo acima do painel. Na marca ele é igual ao painel, porque a `/5` só o usa
    na caixa de sugestão; no site ele marca campos, botões desligados e caixas dentro de um painel.
  - `--notice-bg` no escuro é `#232c3b`, azul-acinzentado. Na marca é o verde do "you joined" da lista de espera, que é
    o mesmo verde do fundo do YES; no site ele está atrás das caixas de informação e da linha "You" do ranking, que
    pareceriam YES.
- **O que a marca não define e o site precisa**, tirado da mesma paleta, sem azul e com verde e vermelho só no YES e
  no NO: os chips de estado (aberta em laranja; fechada e anulada em cinza da paleta; em revisão e contestada em
  âmbar; resultado final em creme sobre neutro, para não parecer YES), os blocos dos tipos (preço em azul-ardósia da
  paleta, `#2f3a4e`; os outros como estavam), as barras do YES, do NO e do prêmio (o prêmio em laranja), o aviso
  (`--warn`, um âmbar mais amarelo que o destaque) e a borda dos campos.
- **Leitura, conferida par a par** (WCAG): todo texto passa de 4,5 e toda borda de campo e barra passa de 3, nos dois
  temas; os pares da marca dão os números do `BRAND.md` §5.4 (texto 15,9 e 15,4; destaque 8,8 e 5,0; YES 10,5 e 6,7;
  NO 6,7 e 5,4). O teste `tests/site/tokens.test.ts` recalcula todos e falha se uma troca quebrar a leitura, se um azul
  voltar ou se uma cor da marca mudar sem mudar o `BRAND.md`.
- **Dois defeitos que a troca mostrou, corrigidos:** o anel do botão principal nunca aparecia (a classe virava
  `background-color`, que não aceita gradiente); agora é desenhado com `background`, gira só no claro e para para quem
  pede menos movimento (`BRAND.md` §10). E o botão principal desligado levava as cores do ligado e do desligado ao
  mesmo tempo: no escuro, com o texto do destaque agora escuro, o texto sumia. Agora leva só as do desligado.

**Valores do protótipo Ledger², em uso até 2026-10-10** (histórico). Escuro: `:root` de `shared/ledger.css`. Claro:
`:root[data-theme='light']` de `prototype-n/styles.css`.

| Variável | Escuro | Claro | Uso |
|---|---|---|---|
| `--bg` | `#10141b` | `#eef1f6` | fundo da página; fundo do campo de valor |
| `--panel` | `#181d27` | `#fff` | cards, painéis, `select`; no claro, também a busca |
| `--raised` | `#212838` | `#e3e8f0` | busca (escuro); caixas dos passos |
| `--line` | `#2a3243` | `#d5dbe6` | bordas e divisórias |
| `--line-strong` | `#36466a` | `#b4bfd2` | borda dos passos e do botão "Notify"; pontos inativos do carrossel |
| `--text` | `#edf0f5` | `#131a26` | texto principal |
| `--muted` | `#9aa4b6` | `#556074` | texto secundário |
| `--dim` | `#6b7588` | `#6b7689` | rótulos de 11px da prova |
| `--accent` | `#4f7dff` | `#2f5fe6` | aba ativa, ponto ativo, foco, botão primário (`--cta-bg: var(--accent)`) |
| `--accent-soft` | `#a8beff` | `#2a52c9` | links, `eyebrow`, `kicker`, ícones dos princípios |
| `--accent-hover` | `#bdccff` | `#1b3a9c` | hover dos títulos |
| `--on-accent` | `#fff` | `#fff` | texto do botão primário |
| `--crust` | `#efbc74` | `#b5670f` | marca, "● Solana Devnet", marcador salvo |
| `--warn` | `#f2b33d` | `#a86200` | prazo em "Closing soon" |
| `--yes-bg` / `--yes-fg` | `#153b32` / `#6be1b4` | `#dff5ea` / `#0a7a52` | botão Yes |
| `--no-bg` / `--no-fg` | `#402530` / `#fa9aac` | `#fde6ea` / `#c0243f` | botão No |
| `--done-bg` / `--done-fg` | `#23392f` / `#b9e9d6` | `#dff5ea` / `#0a6b48` | faixa "Resolved" |
| `--strip-bg` / `--strip-fg` | `#0c1016` / `var(--muted)` | `#e3e8f0` / `var(--muted)` | faixa de status |
| `--top-bg` | `color-mix(in srgb, var(--bg) 88%, transparent)` | não redefinido; recalcula com o `--bg` claro | barra superior |
| `--feature-bg` | `linear-gradient(115deg, #1f2735, #151b25 70%)` | `linear-gradient(115deg, #fff, #e8eefa 70%)` | carrossel |
| `--note-bg` / `--note-fg` | `#232b3a` / `#c7d1e4` | `#e3e8f0` / `#3a4557` | nota do mercado |
| `--notice-bg` | `#263249` | `#dfe8ff` | aviso |
| `--track` | `#2c3547` | `#dde3ec` | trilho da barra de progresso |
| `--fill` | `linear-gradient(90deg, #5d7fe0, #9db8ff)` | `linear-gradient(90deg, #2f5fe6, #6f93ff)` | preenchimento da barra |
| `--pressed-bg` / `--pressed-fg` | `#293242` / `var(--text)` | `#d9e0ec` / `var(--text)` | filtro de status ativo |
| `--ic-bg` | `#23305180` | `#e3eaff` | caixa do ícone dos princípios |
| `--spot` / `--spot-edge` | `rgba(79, 125, 255, .16)` / `#8fb0ff` | `rgba(47, 95, 230, .09)` / `#2f5fe6` | holofote dos cards |
| `--dot-rgb` | `150, 175, 235` | `60, 85, 140` | campo de pontos |
| `--spark-line` / `--spark-fill` | `#7b9ae9` / `rgba(79, 125, 255, .1)` | `#2f5fe6` / `rgba(47, 95, 230, .09)` | mini-gráfico do card |
| `--slide-line` / `--slide-fill` | `#8fb0ff` / `rgba(79, 125, 255, .12)` | `#2f5fe6` / `rgba(47, 95, 230, .1)` | gráfico do carrossel |
| `--chart-line` / `--chart-fill` | `#24c78f` / `rgba(36, 199, 143, .1)` | `#0a8a5c` / `rgba(10, 138, 92, .1)` | gráfico do mercado |
| `--cta-hover` | `#6590ff` | `#2450cf` | hover do botão primário |
| `--cta-ring` | `conic-gradient(from var(--spin), #2b4fc2 0 62%, #dfe8ff 80%, #2b4fc2 100%)` | `conic-gradient(from var(--spin), #1f43b0 0 62%, #c9d8ff 80%, #1f43b0 100%)` | anel do botão primário |
| `--pet-say-bg` / `--pet-say-fg` | `#f3dfbd` / `#1c1408` | `#131a26` / `#fff` | balão do mascote |
| `--pet-shadow` | não definido; `mascot.js` usa `rgba(0,0,0,.5)` | `rgba(19, 26, 38, .28)` | sombra do mascote |
| `color-scheme` | `dark` | `light` | controles nativos |

`--row-hover` (`#1d2431` / `#f3f6fb`) está definido nos dois temas e não é usado pela D nem pela N.

**Token do mercado (`.token`).** No escuro, cada mercado traz o próprio par de cores em `shared/mock-data.js` (`bg` e
`tone`; por exemplo EMBER `#4a2d26` / `#f7b778`). No claro, a cor vem da categoria (`prototype-n/styles.css`):

| Categoria | Fundo | Texto |
|---|---|---|
| Burn | `#fde6d6` | `#a3470f` |
| Renounce | `#dcecf7` | `#1d5a80` |
| Lock | `#e8e4f7` | `#4f3f9a` |
| Immutable | `#dff0e3` | `#2a6a3c` |
| Stake | `#f8ecc9` | `#8a5a06` |

**Só no claro**, por regra fora das variáveis: `.status` ganha `border-bottom: 1px solid var(--line)`; `.search` ganha
`box-shadow: inset 0 0 0 1px var(--line)`; o hover de Yes/No escurece (`brightness(.95)`; no escuro clareia,
`brightness(1.2)`).

**O escuro da N não é a D pixel a pixel.** A D (`prototype-d/styles.css`) tem valores fixos onde `ledger.css` tem
variáveis. Diferenças encontradas:

| Elemento | D | Escuro da N |
|---|---|---|
| Raio da busca, do botão primário, do aviso, da nota e das setas do carrossel | `8px` | `7px` (`--r-sm`) |
| Raio do `.token` e da caixa de ícone | `9px` | `7px` |
| Caixas dos passos | fundo `#1d2638` | `#212838` (`--raised`) |
| Pontos inativos do carrossel | `#3a455c` | `#36466a` |
| Número da prova no card (`.evidence-line b`) | `#c4ccd9` | `#edf0f5` |
| Hover de Yes/No | `brightness(1.25)` | `brightness(1.2)` |
| Campo de pontos | de `130, 155, 215` até `170, 195, 255` perto do cursor | cor fixa `150, 175, 235` |

Só `ledger.css` dá nome a todas as cores nos dois temas. A D usa `--blue` e `--blue-soft` no lugar de `--accent` e
`--accent-soft`, e define `--yes: #24c78f` e `--no: #f06a85` sem usá-las. Qual dos dois escuros é o oficial precisa
ser confirmado (ver o fim do documento).

### Tipografia

Fontes carregadas do Google Fonts nos dois `index.html`: Barlow Condensed 600 e 700; Inter 400, 500, 600 e 700.
`--display: 'Barlow Condensed', 'Arial Narrow', sans-serif`; `--body: Inter, system-ui, sans-serif`;
`--num: var(--display)`. Iguais nos dois temas. Não foi encontrado uso de Barlow Condensed 600 nem de Inter 700.

| Papel | Família | Tamanho | Peso | Altura de linha |
|---|---|---|---|---|
| Título do mercado (`.detail h2`) | Barlow Condensed | `clamp(30px, 3.4vw, 46px)` | 700 | 1.02; `letter-spacing: -.3px` |
| Título do carrossel (`.slide-title`) | Barlow Condensed | `clamp(26px, 2.6vw, 38px)` | 700 | 1.02; `-.3px` |
| Marca (`.brand`) | Barlow Condensed | 30px | 700 | 1; `-.3px` |
| Título das caixas laterais (`.side-box h2`) | Barlow Condensed | 22px, maiúsculas | 700 | 1; `.3px` |
| Número grande (`.chance strong`) | Barlow Condensed | 32px no card, 52px no carrossel | 700 | .9; `tabular-nums` |
| Leitura da prova (`.read-values b`) | Barlow Condensed | 34px no painel; alvo 26px | 700 | 1; `tabular-nums` |
| Número da lista lateral / letra do token | Barlow Condensed | 20px / 22px (16px no `.sm`) | 700 | 1 |
| Corpo | Inter | 14px | 400 | 1.45 |
| Título de painel (`h3`) | Inter | 14px | 600 | herdada |
| Título do card (`.card-title`) | Inter | 13.5px | 600 | 1.4 |
| Categorias e busca | Inter | 13px | 400 | herdada |
| Texto dos princípios; título da linha lateral | Inter | 12.5px | 400 / 600 | herdada |
| Botões, filtros, links, nota, linhas da prova | Inter | 12px | 400 ou 600 | herdada |
| Legendas (status, rodapé, prova no card, contagem) | Inter | 11px | 400 ou 500 | herdada |
| Campo de valor | Inter | 16px | 400 | herdada |
| Balão do mascote | Inter | 12px | 600 | 1.2 |

"Herdada" é a do corpo, 1.45. Não há fonte monoespaçada.

### Espaçamento, raios, bordas e sombras

Não há escala formal de espaçamento. Valores copiados de `shared/ledger.css`:

- **Página:** `main` com `max-width: 1440px` e `padding: 22px 28px 40px`. Margem lateral de 28px em todas as faixas
  (16px até 860px).
- **Ritmo vertical da home:** mosaico `margin-top: 96px`; princípios `margin-top: 44px`; filtros
  `margin: 52px 0 40px`; rodapé `margin-top: 70px`.
- **Grade:** `repeat(auto-fill, minmax(290px, 1fr))`, `gap: 44px 14px`.
- **Mosaico:** `minmax(0, 1.85fr) minmax(300px, 1fr)`, `gap: 14px`; carrossel com `min-height: 440px`.
- **Mercado:** `minmax(0, 1.7fr) minmax(0, 1fr)`, `gap: 22px`; nota com `margin-bottom: 70px`; painel de compra com
  `margin-top: 74px` e `position: sticky; top: 84px`.
- **Preenchimento:** card `15px` (`gap: 13px`); painéis `18px 20px`; caixas laterais `14px 16px`; princípios e passos
  `16px 18px`; botões Yes/No `9px 11px`; botão primário `9px 15px`.
- **Densidade:** compacta. Texto de 11 a 14px, com números grandes.
- **Raios** (iguais nos dois temas): `--r: 10px` (cards, painéis), `--r-sm: 7px` (botões, campos, token),
  `--r-lg: 12px` (carrossel, caixas laterais); `4px` nas barras e nos pontos; miolo do botão primário
  `calc(var(--r-sm) - 1.5px)`.
- **Bordas:** `--bw: 1px`. Exceções: sublinhado de 2px na categoria ativa; anel de 1.5px no botão primário; Yes/No
  selecionado com `box-shadow: inset 0 0 0 1.5px currentColor`; foco com
  `outline: 2px solid var(--accent); outline-offset: 3px`.
- **Sombra:** `--shadow: none` no escuro. No claro,
  `0 1px 2px rgba(19, 26, 38, .05), 0 10px 24px -14px rgba(19, 26, 38, .18)` em cards, painéis, carrossel, caixas
  laterais, passos e princípios. O balão do mascote usa `0 6px 18px rgba(0,0,0,.35)` (`mascot.js`).

### Movimento

| O quê | Valor | Arquivo |
|---|---|---|
| Anel do botão primário | `spin 3.2s linear infinite` sobre `@property --spin` | `shared/ledger.css` |
| Entrada do slide | `slide-in .45s ease`, de `opacity: 0; translateX(16px)` | `shared/ledger.css` |
| Troca automática do carrossel | 5.500 ms; pausa com cursor ou foco; não roda com `prefers-reduced-motion` | `shared/mosaic.js` |
| Ponto ativo do carrossel | `width .2s` (7px para 20px) | `shared/ledger.css` |
| Barra de progresso | `width .7s` | `shared/ledger.css` |
| Holofote dos cards | `opacity .25s`; gradientes radiais de 260px e 220px seguem o cursor | `shared/ledger.css`, `shared/ledger.js` |
| Hover de Yes/No | `filter .15s` | `shared/ledger.css` |
| Barra superior | `backdrop-filter: blur(10px)` | `shared/ledger.css` |
| Campo de pontos | grade de 24px; ponto de raio 1 a 2.2; opacidade .07 a .57 num raio de 190px do cursor | `shared/ledger.js` |
| Troca de tema | `background-color .2s, border-color .2s` | `prototype-n/styles.css` |

`prefers-reduced-motion` desliga o anel, a entrada do slide, a troca automática, a transição de tema e a respiração
do mascote. Não desliga a barra de progresso, o holofote nem o campo de pontos.

---

## Component inventory

| Componente | Onde aparece | Variantes vistas | Notas |
|---|---|---|---|
| Faixa de status `.status` | topo de todas as telas | única | "● Solana Devnet · Design preview" e "Example markets · Not audited" |
| Barra superior `.top` | todas as telas | única | Fixa no topo. Marca (pose `deadpan` de 34px e a palavra "baked"), busca, "How it works", botão de tema, "Connect wallet" |
| Botão primário `.cta` | barra superior; painel de compra (`.cta.wide`) | repouso, hover | Azul com anel girando |
| Botão de tema `.theme` | barra superior, só na N | lua (claro), sol (escuro) | 34×34px, borda de 1px |
| Abas de categoria `.cats` | abaixo da barra | ativa, inativa | Trending, Burn, Renounce, Lock, Immutable, Stake; à direita, o link "Sponsor a goal". Rola de lado com a barra de rolagem escondida |
| Aviso `.notice` | topo do conteúdo | única | Aparece ao clicar em carteira, "Sponsor a goal" ou "Notify"; fecha no × |
| Carrossel `.carousel` | home | 5 slides | Rótulo "Trading now", setas, pontos; cada slide tem token, título, número, Yes/No, prova, rodapé e gráfico |
| Caixa lateral `.side-box` | home | "Upcoming" (linha com botão "Notify"), "Closing soon" (linha clicável com % e prazo) | Até 4 linhas cada |
| Passos `.steps` e princípios `.principles` | home | passo (sem ícone), princípio (com ícone) | Três colunas. Os passos só aparecem com "How it works" |
| Barra de filtros `.toolbar` | home | filtro ativo, inativo | Active, Closing soon, Resolved, Saved; contagem; `select` de ordenação |
| Card de mercado `.card` | grade da home | aberto, resolvido, salvo | Token, título, número, mini-gráfico, Yes/No ou faixa "Resolved", prova, volume, prazo, marcador |
| Token `.token` | cards, carrossel, listas | 40px, 30px (`.sm`) | Uma letra |
| Botões Yes / No `.odds` | cards, carrossel, painel de compra | repouso, hover, selecionado (`.is-on`) | Texto à esquerda, valor em `¢` à direita |
| Prova `.evidence` e `.proof` | card e carrossel; painel na tela do mercado | com barra, sem barra | No painel: leitura atual, alvo, conta lida, prazo, resolução |
| Barra de progresso `.bar` | prova | 6px; 3px no card | `role="progressbar"` |
| Gráficos | card (`.spark`, 200×34), carrossel (600×200), mercado (600×150) | linha sobre área | SVG; azul no card e no carrossel, verde no mercado |
| Painel de compra `.order` | tela do mercado | "Buy YES", "Buy NO", "Redemption" | Yes/No, valor em USDC, estimativa, botão, "Design preview · No transactions" |
| Nota `.note`, voltar `.back` | tela do mercado | única | "Example market · Preview values, not live account data" |
| Estado vazio `.empty` | grade | única | Pose `sulking`, "No markets here yet." e "Clear filters" |
| Campo de pontos `#dots` | fundo de todas as telas | única | `canvas` fixo |
| Rodapé `.foot` | todas as telas | única | Duas frases |
| Ícones | toda a interface | 10 em `shared/app.js`, mais sol e lua | SVG de traço 2, pontas redondas |

O seletor de direções no canto inferior esquerdo (`labNav`, em `shared/app.js`) é do laboratório e não faz parte do
design. `ledger.css` também traz `.box`, `.trade`, `.seg` e `.chart-head`, usados só por K, L e M.

### Mascote (Baked)

Comportamento em `shared/mascot.js`; poleiros declarados em `index.html`, `prototype-d/view.js` e `shared/ledger.js`.

- Não segue o cursor. Fica em poleiros (`data-perch`) e salta para o mais próximo de onde o cursor parou, depois de
  170 ms de espera e 520 ms de permanência mínima. O salto dura de 300 a 820 ms, em arco, com amassado de 170 ms ao
  pousar. Aqui ele é liso: `init({ size: 84 })`, sem passos nem pixelização.
- Poleiros desta direção: carrossel ("Trading now."), caixa "Upcoming" (pose `impatient`, "Not open yet."), os três
  princípios, a barra de filtros (`skeptical`), cada card (no resolvido: `approve` e "Fine. It checks out."), o
  painel de prova (`point`, "It's a read. Not a vote."), o painel de compra (`deadpan` com SIM, `skeptical` com NÃO)
  e o rodapé (`tired`, "Not audited. Stay sharp.").
- Humor por elemento (`data-mood`): `approve` sobre Yes, `skeptical` sobre No, `tapping` sobre "Connect wallet" do
  painel de compra.
- Por tempo: `tired` após 9 s parado, `sulking` após 22 s; `tapping` com cursor frenético.
- Fala ao pousar (a mesma frase só repete depois de 15 s) e ao ser clicado, com as frases de `quips`.
- Balão: `#f3dfbd` com texto `#1c1408` no escuro; `#131a26` com texto `#fff` no claro; raio de 7px.
- Abaixo de 700px de largura encolhe para 60%. Ignora o movimento do toque; em tela de toque, troca de poleiro com rolagem e foco.
- Imagens estáticas: `deadpan.png` na marca, `sulking.png` no estado vazio.

## Screens that exist

Arquivo de todas: `prototype-lab/prototype-n/index.html` (a D tem as mesmas, sem o botão de tema).

| Tela ou estado | O que mostra | Como chegar |
|---|---|---|
| Home | Faixa de status, barra, categorias, mosaico, princípios, filtros, grade, rodapé | `index.html` ou `#/` |
| Home com passos | Linha de três passos entre o mosaico e os princípios | botão "How it works" |
| Home filtrada | Grade por categoria, status, busca (título, categoria, nome, endereço) e ordenação (volume, prazo, preço do YES) | abas, filtros, busca, `select` |
| Lista vazia | Mascote emburrado e "Clear filters" | filtro "Saved" sem itens, ou busca sem resultado |
| Mercado aberto | Voltar, categoria e nome, título, nota, prova, gráfico e painel de compra | `#/m/1/YES` ou `#/m/1/NO` |
| Mercado sem barra | A mesma, sem barra de progresso (metas de autoridade e de stake) | `#/m/2/YES` |
| Mercado resolvido | Painel "Redemption", estimativa "Trading closed", resolução "Resolved YES" | `#/m/10/YES` |
| Aviso | Faixa com texto e × | "Connect wallet", "Sponsor a goal", "Notify" |
| Tema claro e escuro | A mesma página nos dois temas | botão de tema ou `?theme=dark` |

Os dados são dez mercados e quatro "upcoming" de `shared/mock-data.js`; só um está resolvido, e como SIM.

## Primary user flow, as actually clicked

1. A pessoa abre a home no tema claro. O carrossel mostra os cinco mercados abertos de maior volume e troca a cada
   5,5 s; setas e pontos trocam à mão.
2. À direita, "Upcoming" lista quatro mercados ainda fechados e "Closing soon" lista os quatro de prazo mais curto.
   "Notify" só mostra um aviso.
3. Ela troca de categoria, de status, ordena ou busca. A grade e a contagem respondem na hora.
4. Passa o cursor pela grade: o holofote acompanha e o mascote salta para o card.
5. Clica no marcador de um card. Ele fica âmbar e o mercado entra no filtro "Saved". Não persiste ao recarregar.
6. Clica no título ou em "Yes"/"No" (card, carrossel ou "Closing soon"). Abre a tela do mercado, com o lado escolhido
   marcado e a página no topo.
7. Lê a prova, troca de lado pelos botões e digita um valor. A linha de estimativa recalcula
   ("50.00 YES at 20¢ · pays $50 if YES").
8. Clica em "Connect wallet". Aparece o aviso de que nada é conectado nem enviado.
9. Volta por "Back to markets", pela marca ou pelo botão voltar do navegador.
10. Em qualquer momento, o botão de tema inverte a página e guarda a escolha.

Nada é assinado nem enviado. "Sponsor a goal" só mostra um aviso.

---

## Conflitos com o produto decidido

O protótipo mostra o modelo antigo, em que um patrocinador vende um token SIM com desconto. O produto decidido é um
pote: aposta-se em USDC no SIM ou no NÃO, sem token, sem preço e sem saída antes do fim (P1 §2.1 e §2.3). **Cada
linha abaixo precisa ser redesenhada na etapa de design system. Este documento não propõe a tela nova.**

| # | O que o protótipo mostra | O que o produto decidido pede | Referência |
|---|---|---|---|
| 1 | Número grande com o rótulo "YES price"; botões "Yes 20¢" e "No 80¢" | "Chance": a fatia do pote em cada lado. Não há preço | P1 §1.2, §3.2 |
| 2 | Gráficos de "YES price history" no card, no carrossel e no mercado ("YES price · 20¢") | Não existe preço para desenhar. O que o gráfico passa a mostrar não foi encontrado no plano | P1 §2.1 |
| 3 | Painel "Buy YES" / "Buy NO" com estimativa em cotas ("50.00 YES at 20¢ · pays $50 if YES") | Aposta registrada em nome da carteira, sem cota. "Retorno estimado", já com a taxa, com o aviso de que muda até o fechamento | P1 §2.1, §3.2, §4.7 |
| 4 | Pagamento fixo de 1 USDC por cota ("Winners redeem 1:1") | Divisão do pote, com taxa de 10% do lado perdedor | P1 §3.2, §3.3 |
| 5 | "Redemption" e "Resolved YES · Redemption available" | Pagamento automático, sem botão de resgate | P1 §3.9 |
| 6 | "Resolution: Anyone, the moment the account says so" | Dois serviços agendados acionam a leitura; não há botão público | P1 §4.4 |
| 7 | Princípio "No oracle, no committee, no dispute window" e a fala "No oracle. Just me, reading." | Perguntas de preço usam oráculo on-chain; há janela de 6 horas e disputa em duas etapas | P1 §4.5, §4.6, §4.7 |
| 8 | Princípio "Backed 1:1 in USDC. Every YES sits on one USDC" | Não há token de SIM | P1 §2.1 |
| 9 | Princípio "Guarded trading" (a negociação para quando a meta é cumprida) | Vale em parte: as apostas travam quando o fato acontece e também fecham quando faltam 5% da duração. A palavra é "aposta" | P1 §3.5 |
| 10 | Passos "Sponsor a goal", "Make it happen", "Read the result" | A equipe abre a pergunta; apostas; fechamento; leitura; janela; pagamento | P1 §1.2, §4.1 |
| 11 | "Sponsor a goal": escolher a meta, o alvo, o prazo e financiar o orçamento | Patrocínio em três faixas, 70% para o pote, como prêmio neutro ou aposta com nome; pedido de pergunta com pagamento travado | P1 §3.7 |
| 12 | "Upcoming" com "$400 budget" e "Notify" (lembrete da abertura da venda) | Não há orçamento nem venda. Se existe pergunta anunciada antes de abrir não foi encontrado no plano | P1 §2.3 |
| 13 | Categorias Burn, Renounce, Lock, Immutable, Stake; 7 dos 10 mercados são de renúncia, imutabilidade ou trava | Cinco tipos no primeiro dia: preço de ativo grande, queima, liquidez travada na Meteora, pool de staking, stake de validador. Renúncia e imutabilidade ficam fora; tokens travados, fora no primeiro dia | P1 §4.2, §4.3 |
| 14 | Status Active, Closing soon, Resolved, Saved | Cinco estados: Aberta, Fechada, Em revisão, Paga, Anulada | P1 §3.1 |
| 15 | Ordenação "YES price ↓" | Não há preço | P1 §3.2 |
| 16 | Um número só de volume ("$712 vol.") | O pote tem um valor em cada lado, e a chance sai deles | P1 §3.2 |
| 17 | Um prazo só ("6d left") | Há dois momentos: o fechamento das apostas e a data final | P1 §3.5 |
| 18 | Faixa "Solana Devnet · Design preview" | Toda tela na devnet diz: "Estamos em fase de testes. Aqui se aposta com USDC de teste, que não vale dinheiro." | P1 §4.7 |
| 19 | Nome "baked" e rodapé "baked · KPI markets on Solana" | Brot Markets; Baked é o mascote | P1 §1.1 |

Onde o nome "baked" aparece, para corrigir na implementação: `<title>`, texto e `aria-label` da marca, rodapé,
`brand.name` em `mock-data.js` e a chave `baked-theme` do `localStorage`. O protótipo não foi alterado.

**O que continua valendo sem mudança:** o bloco de prova (leitura atual, alvo, conta lida, prazo), que é o que o
plano pede em "cada pergunta mostra o número lido, a meta e o link" (P1 §4.7); a entrada só pela carteira (P1 §2.2);
os botões Yes/No como atalho para a tela da pergunta; e toda a linguagem visual desta página.

## Gaps: implied but never shown

| Lacuna | Onde apareceria | Pergunta aberta / referência |
|---|---|---|
| Carteira desconectada e conectada | barra superior, painel de compra | Só existe o botão, que mostra um aviso. Faltam saldo, endereço, desconectar e carteira sem USDC ou sem SOL (P4 §5.3) |
| Minhas apostas | tela do mercado, área própria | O registro por apostador (P1 §2.1) não tem tela |
| Confirmação antes de assinar | painel de compra | Avisos obrigatórios: retorno é estimativa; aposta grande baixa o próprio retorno (P1 §3.2); sem saída até o fim (P1 §3.6); dinheiro preso por até 90 dias (P1 §3.5) |
| Carregamento | grade, carrossel, prova, gráfico | O protótipo é síncrono. Nada desenhado |
| Erro | leitura da rede, transação recusada, valor inválido | Nada desenhado. O campo só tem `min="0"` |
| Estados vazios | carrossel, "Upcoming", "Closing soon" | Só a grade tem estado vazio. Sem mercado aberto, o carrossel não foi previsto em `mosaic.js` |
| Estados Fechada, Em revisão, Paga | card e tela da pergunta | O protótipo só tem aberto e resolvido (P1 §3.1) |
| Janela de 6 horas | tela da pergunta | "A tela mostra o relógio" (P1 §4.5). Contestação pausada e disputa (P1 §4.6) também não existem |
| Pergunta anulada | card, tela da pergunta | Terceiro resultado, com devolução sem taxa (P1 §3.4) |
| Resultado NÃO | card, tela da pergunta | O único resolvido do protótipo é SIM |
| Pote de um lado só | card, tela da pergunta | Chance de 100% de um lado; devolução; primeiro apostador sem taxa, os demais com 1% (P1 §3.4) |
| Pagamento recebido | tela da pergunta, minhas apostas | Como a pessoa vê que recebeu, e o caso do valor reservado quando a conta de USDC foi fechada (P1 §3.9) |
| Patrocinador | card, tela da pergunta, home | Selo, nome, link, frase, imagem, destaque de 72 horas ou fixo; "não divulgado" com o aviso obrigatório (P1 §3.7). Formulário de pedido e faixas |
| Indicação | área própria | Link de quem indica, quanto recebeu, devolução ao indicado (P1 §3.8) |
| Sugestões pelo X | página separada | Lista escolhida pela equipe e orientação de como sugerir; fica longe da página de aposta (P1 §4.1) |
| Pontuação da devnet | área própria | Pontos por acerto e classificação pública (P2 §6.1 e §6.2; P4 §3.1) |
| Pergunta de preço | prova | Não há exemplo do tipo "toque" com leitura de oráculo (P1 §4.2) |
| Teto global atingido | painel de compra | O programa recusa apostas novas (P4 §4.4) |
| Dados longos | cards, listas | Título sem limite de linhas no card; reticências só nas listas laterais; sem paginação (10 mercados) |
| Idioma | tudo | A interface está em inglês (`lang="en"`); as frases do plano estão em português (P1 §4.7). Idioma do site: não encontrado |
| Tema padrão | tudo | A N abre no claro e não lê a preferência do sistema. Qual tema é o padrão: não encontrado |
| Celular | tudo | Ver a seção seguinte. Registrado no `session-log` de 3/10: o balão do mascote corta na borda direita |

## Acessibilidade e responsividade

Só o que o código permite afirmar. Nada foi testado com leitor de tela nem em aparelho.

**Contraste** (razão WCAG, calculada a partir dos valores acima; 4,5 é o mínimo para texto pequeno, 3 para texto
grande e para elementos gráficos):

| Par | Escuro | Claro |
|---|---|---|
| `--text` sobre `--bg` / `--panel` | 16,16 / 14,78 | 15,41 / 17,45 |
| `--muted` sobre `--bg` / `--panel` | 7,35 / 6,72 | 5,60 / 6,34 |
| `--dim` sobre `--panel` (rótulos de 11px da prova) | **3,64** | 4,59 |
| `--accent-soft` sobre `--panel` | 9,22 | 6,67 |
| `--on-accent` sobre `--accent` (botão primário, 12px) | **3,68**; no hover **3,01** | 5,38; no hover 6,72 |
| `--crust` sobre `--bg` (marca, 30px) | 10,65 | 3,78 |
| `--crust` sobre `--strip-bg` ("● Solana Devnet", 11px) | 11,00 | **3,47** |
| `--yes-fg` sobre `--yes-bg` | 7,66 | 4,69 |
| `--no-fg` sobre `--no-bg` | 6,74 | 4,96 |
| `--done-fg` sobre `--done-bg` | 9,24 | 5,73 |
| `--warn` sobre `--panel` | 9,08 | 4,76 |
| `--note-fg` sobre `--note-bg` | 9,25 | 7,87 |
| `--accent` sobre `--bg` (anel de foco) | 5,02 | 4,76 |
| `--line` sobre `--panel` (bordas, inclusive a do campo de valor) | 1,32 | 1,39 |
| Token de mercado | 6,67 a 7,58 | 5,03 a 6,72 |

Em negrito, os pares de texto pequeno abaixo de 4,5: três casos, dois no escuro e um no claro.

**O que o código tem:** `:focus-visible` com contorno de 2px; `aria-pressed` em categorias, filtros e marcador;
`aria-live="polite"` na contagem e no carrossel; `role="progressbar"` com valores; `role="status"` no aviso;
`aria-label` na busca, na ordenação, nas setas e no botão de tema; mascote e campo de pontos com `aria-hidden`; o
mascote também reage ao foco do teclado; SIM e NÃO têm texto, não só cor.

**O que o código mostra como problema:**

- O campo de busca não tem anel de foco: `.search input { outline: 0 }` vence `:focus-visible`, e `.search` não tem
  `:focus-within`.
- O carrossel troca sozinho dentro de uma região `aria-live`, então cada troca é anunciada.
- Os gráficos com `aria-label` não têm `role="img"`.
- Até 860px o link "How it works" some (`display: none`), e os passos ficam sem caminho no celular.

**Pontos de quebra existentes:**

| Largura | O que muda | Arquivo |
|---|---|---|
| até 980px | Mosaico e slide em uma coluna; gráfico do slide com `min-height: 140px` | `shared/ledger.css` |
| até 860px | Mercado, passos e princípios em uma coluna; barra superior quebra e a busca ocupa a linha inteira; margens de 16px; painel de compra deixa de ser `sticky` | `shared/ledger.css` |
| abaixo de 700px | Mascote a 60% | `shared/mascot.js` |

A grade se ajusta sozinha (`minmax(290px, 1fr)`). Não há ponto de quebra abaixo de 700px.

---

## Brand hypothesis carried forward

- **Tone of voice:** seco, curto e factual. O mascote é rabugento em silêncio ("Prove it.", "I only believe
  accounts."), nunca vendedor (`shared/mock-data.js`). As frases em inglês e as que dizem "no oracle" passam pela
  revisão da tabela de conflitos.
- **What kind of company this makes us look like:** uma mesa de operações que mostra o que leu da rede, com um
  pãozinho rabugento em cima (`prototype-d/styles.css`, `prototype-n/styles.css`).
- **What we are deliberately NOT:** um cassino. A direção G do lab testou esse registro como teste de extremo, sem propô-lo
  (`prototype-lab/README.md`).

## O que não foi possível determinar pelo código

- Qual escuro é o oficial: o da D (`prototype-d/styles.css`) ou o da N (`shared/ledger.css`). Diferem em raios e em
  alguns tons.
- O tema padrão e se a preferência do sistema deve ser seguida.
- O idioma do site.
- Estados de foco, hover e desabilitado além dos listados: não encontrados no protótipo.
- Como a página se comporta em aparelho real, com leitor de tela e com muitos mercados: o código não responde.
- As oito poses foram listadas pelo nome do arquivo e pelo uso em `mascot.js`; as imagens não foram abertas.

## Handoff checklist

- [x] Every token above has a real value, not a placeholder.
- [x] Every screen in the prototype is listed.
- [x] The flow section matches the clickable flow, not the intended one.
- [x] The gaps table is filled in.
- [x] `prototype-lab/prototype-n/`, `prototype-lab/prototype-d/` e `prototype-lab/shared/` estão no Git.
- [ ] Conflitos e lacunas resolvidos na etapa de design system, antes do resumo de produto.
