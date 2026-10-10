# BRAND.md

- **Projeto:** Brot Markets
- **Aprovado em:** 2026-10-09
- **Aprovado por:** Lucas, em nome dos fundadores: "o cinco ficou excelente, encontramos nosso copy e nossas cores, acho
  que temos que documentar isso como oficial, para termos como base e ser usado por todos".
- **Página de referência:** `services/landing/public/5/` (a `/5`). Tudo o que está aqui foi lido dela e de
  `services/landing/public/styles.css`. Quando o documento e a página discordarem, a página vale e o documento é
  corrigido.
- **O que este documento decide:** o nome, o símbolo, o mascote, a voz, o texto oficial, as cores, as fontes, os
  tamanhos, a grade e os componentes da página.
- **O que ele não decide:** as telas do aplicativo. A estrutura delas continua em
  [`DESIGN-DIRECTION.md`](DESIGN-DIRECTION.md). As cores de lá (azul como destaque, claro frio) são mais antigas que
  esta decisão; alinhar aquele documento e o aplicativo a este é uma pendência, listada no fim.
- **De onde vêm as regras:** quase todas descrevem a página aprovada. Onde uma regra generaliza além dela (os limites
  de palavras, por exemplo), isso está dito no próprio trecho e na seção 13.
- **Por que as decisões foram tomadas:**
  [`session-log/2026-10-09-site-3-original-com-cores-do-deck.md`](../../session-log/2026-10-09-site-3-original-com-cores-do-deck.md).

---

## 1. A marca em uma página

| Item | Regra |
|---|---|
| Nome | **Brot Markets**, com as duas iniciais maiúsculas, em texto corrido |
| Assinatura | `brot.markets`, em minúsculas, com `.markets` na cor de destaque |
| Símbolo | o pão simples, sem rosto e sem pernas |
| Mascote | **Baked**, o pão com rosto. Anda pela página; não é o símbolo |
| Produto | On-Chain Campaigns: uma pergunta de SIM ou NÃO que uma conta da rede responde |
| Tom | seco, curto e factual |
| Cores | azul-marinho e laranja no escuro; creme e ferrugem no claro |
| Fontes | Barlow Condensed 700 nos títulos, Inter no texto |
| Onde falamos | `brot.markets` e `@brotmarkets` no X |

## 2. Nome, símbolo e mascote

### 2.1 Assinatura

- Escreve-se `brot.markets`, tudo em minúsculas, em Barlow Condensed 700.
- `brot` usa a cor do texto e `.markets` usa a cor de destaque (`--crust`).
- Na barra do topo: 30px, entrelinha 1, espaço entre letras de -0,3px, a 8px do símbolo.
- Em texto corrido usa-se "Brot Markets", sem cor e sem ponto.

### 2.2 Símbolo: o pão

- É o pão simples do desenho `14-pao-inteiro`, sem rosto e sem pernas.
- Arquivo do site: `services/landing/public/img/brot-loaf.webp` (174 × 104 pixels).
- Origem: `docs/product/poses/small/14-pao-inteiro.png`, recortado no contorno do pão.
- Na barra do topo ocupa uma caixa de 58 × 37 pixels, sem deformar (`object-fit: contain`).
- É o único desenho ao lado da assinatura. O mascote nunca entra nesse lugar.

### 2.3 Mascote: Baked

- É o pão com rosto, braços e pernas. Tem oito poses: `deadpan`, `skeptical`, `impatient`, `tapping`, `tired`,
  `sulking`, `approve` e `point` (`img/baked-<pose>.webp`).
- Fica em pé sobre a borda de cima de alguns blocos da página e pula para o mais próximo de onde o ponteiro para.
- Tem 84px de altura. Em janelas com menos de 700px de largura fica a 60%.
- Nunca fica atrás da barra do topo e nunca tira um clique do que está embaixo dele.
- Fala em balões curtos. Na página aprovada, a fala mais longa tem seis palavras.

| Onde ele está | Pose | Fala |
|---|---|---|
| Título | `deadpan` | "Prove it." |
| Cartão de exemplo | `skeptical` | "It's a read. Not a vote." |
| Princípio 1 | `point` | "I only believe accounts." |
| Princípio 2 | `deadpan` | "One pot. No order book." |
| Princípio 3 | `approve` | "Fine. It checks out." |
| Rodapé | `tired` | "Not audited. Stay sharp." |

- Quando alguém clica nele, responde com uma destas, em ordem: "Prove it.", "I only believe accounts.", "Not audited.
  Stay sharp.", "Devnet. Test money.", "Still baking."
- É rabugento e calado, nunca vendedor.
- A biblioteca completa de desenhos, com as 17 poses de animação, está em `docs/product/poses/`.

## 3. Voz e palavras

- **Frases curtas.** Um fato por frase.
- **Sem tom de venda.** O texto diz o que a rede faz: "The program reads a Solana account and settles."
- **Não somos um cassino.** A direção de design já registrava isso, e continua valendo.
- **O site e o deck estão em inglês.**

| Usar | Não usar |
|---|---|
| campaign | market, fora do nome da marca |
| entry, join | bet |
| baker (quem entra), creator (quem abre) | |
| pot | |
| YES, NO | |
| SOL | qualquer outro token: tudo é em SOL |

Regras de fundo, que vêm do plano de negócio (BP v0.0.4) e valem para qualquer texto:

- Tudo é em SOL. Não há token de resultado, nem saída antecipada, nem teto de valor.
- A página aprovada diz, na faixa e no rodapé, que o programa está na rede de teste, com tokens de teste e sem
  auditoria. Enquanto isso for verdade, todo texto novo diz o mesmo.
- Nada no site é oferta nem convite para colocar dinheiro de verdade. O rodapé diz isso com todas as letras.

## 4. Texto oficial

Este é o texto aprovado, bloco por bloco, com a contagem de palavras e as linhas medidas a 1440px (computador) e a
390px (celular) de largura.

| Bloco | Texto | Palavras | Linhas no computador | Linhas no celular |
|---|---|---|---|---|
| Faixa | ● Solana Devnet · Test tokens only, no real money | 10 | 1 | 1 |
| Aviso | **We are baking this website.** Some parts are still in the oven. | 12 | 1 | 2 |
| Chamada | Coming soon | 2 | 1 | 1 |
| Título | On-Chain Campaigns the chain answers. | 5 | 2 | 2 |
| Abertura | Join YES or NO with SOL. Winners split the pot. No vote, no judge. | 14 | 1 | 2 |
| Rótulo do campo | Get an email when campaigns open | 6 | 1 | 1 |
| Botão | Notify me | 2 | 1 | 1 |
| Consentimento | By sending, you agree that we keep your email to tell you when Brot Markets opens. Nothing else is stored. Privacy and how to leave. | 26 | 2 | 3 |
| Depois de enviar | **You're on the list.** We'll write when campaigns open. | 9 | 2 | 2 |
| Cartão, rótulo | Example · not a live campaign | 6 | 1 | 1 |
| Cartão, pergunta | Does SOL touch $300 by Dec 31? | 7 | 1 | 2 |
| Cartão, lados | Yes 30% · No 70% | 4 | 1 | 1 |
| Cartão, fatos | Pot: 3 SOL Yes · 7 SOL No. Resolved by: The Pyth price account | 14 | 2 | 2 |
| Cartão, nota | Each % is that side's share of the pot. | 9 | 1 | 1 |
| Princípio 1 | **The chain answers.** The program reads a Solana account and settles. | 3 + 8 | 1 + 1 | 1 + 1 |
| Princípio 2 | **One pot per campaign.** Winners split it by what each put in. No order book. | 4 + 11 | 1 + 1 | 1 + 1 |
| Princípio 3 | **Paid to your wallet.** No sign-up. No claim button. | 4 + 5 | 1 + 1 | 1 + 1 |
| Sugestão | **Have a question the chain can answer?** Post it on X. We read every one. | 15 | 1 | 2 |
| Botão da sugestão | Suggest a question on X | 5 | 1 | 1 |
| Rodapé | Test phase on Solana devnet, with test tokens. The program is not audited. Nothing here is an offer or an invitation to put in real money, and availability by country has not been decided. | 34 | 2 | 3 |
| Rodapé, links | Terms · Privacy · X · © 2026 Brot Markets | 7 | 1 | 1 |

A página inteira tem 242 palavras, contando os rótulos.

### Limites por tipo de bloco

Os números da página aprovada funcionam como teto: um bloco reescrito, ou um bloco novo do mesmo tipo, não passa
deles. São os números da página, e não uma decisão separada sobre cada um.

| Tipo | Palavras | Linhas |
|---|---|---|
| Título de página | até 5 | 2 |
| Frase de abertura | até 14, e até 66 caracteres | 1 no computador, 2 no celular |
| Título de princípio | até 4 | 1 |
| Pergunta de campanha | até 7 | 1 no computador, 2 no celular |
| Texto de princípio | até 11 | 1 |
| Caixa de chamada (sugestão, aviso) | até 15 | 1 no computador, 2 no celular |
| Rótulo de botão | até 5 | 1 |
| Fala do mascote | até 6 | 1 |

### O que não se reescreve

- **A frase de consentimento.** O servidor guarda a versão dela (`v1-2026-10-05`) com cada email. Mudar uma palavra
  exige nova versão e revisão de privacidade.
- **O rodapé.** É aviso legal. Só muda com revisão.
- **A faixa do topo**, enquanto o programa estiver na rede de teste.

## 5. Cores

A página tem dois temas. Cada cor tem um nome (`--bg`, `--accent`) e dois valores, um por tema. Nenhum componente
usa cor escrita direto: usa o nome. Os valores estão em `services/landing/public/5/colors.css`.

### 5.1 As cores principais

| Papel | Nome | Escuro | Claro |
|---|---|---|---|
| Fundo da página | `--bg` | `#10151c` azul-marinho | `#f6eddb` creme |
| Cartões e campos | `--panel` | `#171e29` | `#fffaf0` |
| Caixa de sugestão | `--raised` | `#171e29` | `#efe2c8` |
| Linhas | `--line` | `#263041` | `#e2d4ba` |
| Linhas fortes | `--line-strong` | `#3a4558` | `#cdbb98` |
| Texto | `--text` | `#f7eedb` | `#1b1611` |
| Texto de apoio | `--muted` | `#d9d1c1` | `#3d3328` |
| Letra miúda | `--dim` | `#a3acba` | `#6b5e4e` |
| Destaque (botão) | `--accent` | `#eea546` laranja | `#a8481b` ferrugem |
| Destaque em texto e links | `--accent-soft` | `#eea546` | `#a8481b` |
| Link sob o ponteiro | `--accent-hover` | `#f7cd8f` | `#7a3212` |
| Texto sobre o destaque | `--on-accent` | `#10151c` | `#f7eedb` |
| `.markets` e o ponto da faixa | `--crust` | `#eea546` | `#a8481b` |

### 5.2 As cores de função

| Papel | Nome | Escuro | Claro |
|---|---|---|---|
| Fundo do YES | `--yes-bg` | `#1c3a30` | `#dcefdc` |
| Letra do YES | `--yes-fg` | `#a6ffcf` | `#1c5a3f` |
| Fundo do NO | `--no-bg` | `#402530` | `#f6dcd0` |
| Letra do NO | `--no-fg` | `#ff9a7a` | `#a32e17` |
| Faixa do topo | `--strip-bg` | `#0b0f15` | `#efe2c8` |
| Aviso depois de enviar | `--notice-bg` | `#1c3a30` | `#fbe3bd` |
| Trilho da barra | `--track` | `#263041` | `#e2d4ba` |
| Barra preenchida | `--fill` | de `#c2410c` a `#eea546` | de `#a8481b` a `#eea546` |
| Fundo do número do princípio | `--ic-bg` | `#2f3a4e` | `#a8481b` a 12% |
| Pontos do fundo | `--dot-rgb` | `163, 172, 186` | `107, 94, 78` |
| Botão sob o ponteiro | `--cta-hover` | `#f7cd8f` | `#8c3a14` |
| Borda do botão | `--cta-ring` | `#eea546`, lisa | anel giratório ferrugem e laranja |
| Balão do mascote | `--say-bg` / `--say-fg` | `#f7eedb` / `#10151c` | `#1b1611` / `#f7eedb` |
| Sombra do mascote | `--pet-shadow` | preto a 55% | `#1b1611` a 30% |
| Erro do formulário | `--error` | `#ff9a7a` | `#a32e17` |
| Sombra dos cartões | `--shadow` | nenhuma | leve, `#1b1611` a 5% e a 18% |
| Aviso "we are baking" | `--baking-bg` / `--baking-fg` | `#eea546` / `#10151c` | `#eea546` / `#1b1611` |

### 5.3 Como usar

- **O laranja `#eea546` é a cor da marca.** No escuro é o destaque de tudo. No claro aparece só em fundos (o aviso e a
  ponta da barra), porque sobre creme não dá leitura como letra.
- **No claro, o destaque em letra e em botão é a ferrugem `#a8481b`.**
- **O aviso "we are baking" é laranja nos dois temas.**
- **Verde e vermelho são só do YES e do NO.** Na página aprovada não aparecem em botão, link nem título.
- **Nenhum azul.** Os azuis da versão anterior da página (`#4f7dff`, `#2f5fe6` e parentes) saíram. Um teste impede a
  volta nos arquivos de cores da `/3` e da `/4`, de onde a `/5` copia os dois temas.
- **No escuro**, a faixa do topo não tem linha embaixo, a caixa de sugestão tem uma borda laranja de 4px à esquerda e
  o botão da sugestão é vazado em laranja.
- **No claro**, a caixa de sugestão é a de fundo mais escuro (`--raised`) e o botão dela é um botão claro comum.
- **Fundo de pontos:** um ponto de 1px a cada 24px, na cor `--dot-rgb` a 16%.

### 5.4 Leitura (contraste)

O mínimo usado é 4,5 para letra comum. Os pares abaixo foram calculados e passam.

| Par | Escuro | Claro |
|---|---|---|
| Texto sobre o fundo | 15,9 | 15,4 |
| Texto de apoio sobre o fundo | 12,1 | 10,6 |
| Letra miúda sobre o fundo | 8,0 | 5,4 |
| Destaque sobre o fundo | 8,8 | 5,0 |
| Texto do botão sobre o botão | 8,8 | 5,0 |
| YES | 10,5 | 6,7 |
| NO | 6,7 | 5,4 |
| Faixa do topo | 8,4 | 9,6 (o trecho colorido: 4,5) |
| Aviso "we are baking" | 8,8 | 8,6 |

O número do princípio no tema claro (ferrugem sobre ferrugem a 12%) não foi calculado. É letra grande, de 20px.

## 6. Fontes e tamanhos

| Fonte | Peso | Arquivo | Uso |
|---|---|---|---|
| Barlow Condensed | 700 | `fonts/barlow-condensed-700.woff2` | títulos, assinatura, números |
| Inter | 400 a 600 | `fonts/inter-var.woff2` | todo o resto |

As duas ficam no próprio site. Nenhuma fonte vem de fora. O deck usa IBM Plex; o site não.

| Elemento | Fonte | Tamanho | Peso | Entrelinha | Detalhe |
|---|---|---|---|---|---|
| Título da página | Barlow Condensed | de 44px a 78px (6,4% da largura da janela) | 700 | 0,96 | -0,6px entre letras; 38px abaixo de 360px |
| Assinatura | Barlow Condensed | 30px | 700 | 1 | -0,3px entre letras |
| Pergunta do cartão | Barlow Condensed | 30px | 700 | 1,02 | -0,3px entre letras |
| Números de YES e NO | Barlow Condensed | 32px | 700 | 0,9 | algarismos de largura fixa |
| Aviso, parte forte | Barlow Condensed | 24px | 700 | 1 | maiúsculas, 0,3px entre letras |
| Título de princípio | Barlow Condensed | 22px | 700 | 1 | maiúsculas, 0,3px entre letras |
| "You're on the list." | Barlow Condensed | 22px | 700 | 1,1 | maiúsculas, 0,3px entre letras |
| Número do princípio | Barlow Condensed | 20px | 700 | 1 | |
| Frase de abertura | Inter | 17px | 400 | 1,5 | largura máxima de 560px |
| Campo de email | Inter | 16px | 400 | | |
| Texto base | Inter | 14px | 400 | 1,45 | |
| Botão principal | Inter | 14px | 600 | | |
| Texto de princípio, sugestão, aviso | Inter | 13px | 400 (aviso: 500) | 1,45 | |
| Fatos do cartão | Inter | 12,5px | 600 | | |
| Chamada "Coming soon" | Inter | 12px | 600 | | maiúsculas, 1,4px entre letras |
| Rótulos, link do topo, botão vazado | Inter | 12px | 600 | | |
| Letra miúda | Inter | 12px | 400 | | |
| Balão do mascote | Inter | 12px | 600 | 1,2 | |
| Faixa do topo, rótulos do cartão | Inter | 11px | 500 | | rótulos do cartão em maiúsculas |
| Rodapé | Inter | 11px | 400 (links: 500) | | |

**O título tem de caber em duas linhas.** A coluna dele tem 593px de largura no computador, e "On-Chain Campaigns"
só cabe nela até 80px de letra. Por isso o máximo é 78px. Um título novo, mais comprido, pede medir de novo.

## 7. Grade e medidas

| Medida | Valor |
|---|---|
| Largura máxima do conteúdo | 1180px, com 28px de margem de cada lado (1124px úteis) |
| Margem lateral no celular | 16px |
| Cantos arredondados | 7px em botões e campos, 10px em cartões e caixas, 12px no cartão de exemplo |
| Faixa do topo | 7px de respiro em cima e embaixo |
| Barra do topo | 62px de altura, presa no topo, com fundo translúcido e desfoque de 10px |
| Botão de tema | 34 × 34px, ícone de 16px |
| Aviso | 28px abaixo da barra, respiro de 12px por 18px |
| Bloco principal | duas colunas, 1,25 para 1, com 56px entre elas; começa 52px abaixo do aviso |
| Formulário | 34px abaixo da abertura, largura máxima de 520px, 10px entre campo e botão |
| Cartão de exemplo | respiro de 18px por 20px; 60px livres em cima, que é onde o mascote fica em pé |
| Princípios | três colunas, 14px entre elas, 84px abaixo do bloco principal; respiro de 16px por 18px |
| Caixa de sugestão | 14px abaixo dos princípios, respiro de 16px por 18px |
| Rodapé | 70px abaixo da sugestão, com uma linha em cima |

**Uma coluna só a partir de 860px de largura para baixo.** O bloco principal e os princípios empilham, o campo e o
botão do formulário empilham, o link do X some da barra do topo, e o espaço acima do bloco principal e dos princípios
cai para 44px.

### 7.1 Desenho da página no computador

```
+--------------------------------------------------------------------------+
| ● Solana Devnet · Test tokens only, no real money              (faixa)   |
+--------------------------------------------------------------------------+
| [pão] brot.markets                          @brotmarkets on X   [tema]   |
+--------------------------------------------------------------------------+
|                                                                          |
|  +--------------------------------------------------------------------+  |
|  | WE ARE BAKING THIS WEBSITE.  Some parts are still in the oven.     |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
|  COMING SOON                                          (Baked, em pé)     |
|  On-Chain Campaigns                          +-------------------------+ |
|  the chain answers.                          | EXAMPLE · NOT A LIVE... | |
|                                              | Does SOL touch $300...? | |
|  Join YES or NO with SOL. Winners split...   | [ Yes 30% ] [ No 70% ]  | |
|                                              | =======-----------------| |
|  Get an email when campaigns open            | POT          RESOLVED BY| |
|  [ you@example.com        ] [ Notify me ]    | 3 SOL Yes..  The Pyth.. | |
|  By sending, you agree that we keep...       | Each % is that side's.. | |
|                                              +-------------------------+ |
|                                                                          |
|  +--------------------+ +--------------------+ +--------------------+    |
|  | [1]                | | [2]                | | [3]                |    |
|  | THE CHAIN ANSWERS  | | ONE POT PER CAMP.  | | PAID TO YOUR WALLET|    |
|  | The program reads..| | Winners split it.. | | No sign-up. No...  |    |
|  +--------------------+ +--------------------+ +--------------------+    |
|  +--------------------------------------------------------------------+  |
|  | Have a question the chain can answer? ... [Suggest a question on X]|  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
+--------------------------------------------------------------------------+
| Test phase on Solana devnet, with...        Terms  Privacy  X  © 2026    |
+--------------------------------------------------------------------------+
```

### 7.2 Desenho da página no celular

```
+------------------------------+
| ● Solana Devnet · Test...    |
+------------------------------+
| [pão] brot.markets    [tema] |
+------------------------------+
| +--------------------------+ |
| | WE ARE BAKING THIS       | |
| | WEBSITE. Some parts...   | |
| +--------------------------+ |
| COMING SOON         (Baked)  |
| On-Chain Campaigns           |
| the chain answers.           |
| Join YES or NO with SOL...   |
| Get an email when...         |
| [ you@example.com          ] |
| [        Notify me         ] |
| By sending, you agree...     |
|                              |
| +--------------------------+ |
| | cartão de exemplo        | |
| +--------------------------+ |
| +--------------------------+ |
| | [1] THE CHAIN ANSWERS    | |
| +--------------------------+ |
| | [2] ONE POT PER CAMPAIGN | |
| +--------------------------+ |
| | [3] PAID TO YOUR WALLET  | |
| +--------------------------+ |
| | Have a question...       | |
| | [Suggest a question on X]| |
| +--------------------------+ |
+------------------------------+
| Test phase on Solana...      |
| Terms  Privacy  X  © 2026    |
+------------------------------+
```

A ordem dos blocos é esta: faixa, barra, aviso, título com formulário, cartão de exemplo, três princípios, sugestão,
rodapé.

## 8. Componentes

| Componente | Regras |
|---|---|
| Faixa do topo | Uma linha, 11px. Começa com o ponto e "Solana Devnet" na cor de destaque |
| Barra do topo | Símbolo e assinatura à esquerda; link do X e botão de tema à direita. Acompanha a rolagem |
| Aviso "we are baking" | Faixa laranja com letra escura, a parte forte em maiúsculas. Existe enquanto o site estiver em construção |
| Botão principal | Fundo de destaque. No escuro é liso e clareia sob o ponteiro. No claro tem um anel que gira em 3,2 segundos |
| Campo de email | Fundo de cartão, linha forte, 16px de letra |
| Cartão de exemplo | Sempre diz "Example · not a live campaign". A barra mostra a parte do YES |
| YES e NO | YES à esquerda e verde; NO à direita e vermelho. Sempre com a palavra, nunca só a cor |
| Princípio | Número numa caixa de 34px, título em maiúsculas, uma linha de texto |
| Caixa de sugestão | Uma frase e um botão. No celular o botão vai para a linha de baixo |
| Botão secundário | No escuro, contorno e letra laranja; sob o ponteiro, enche de laranja. No claro, botão claro com linha |
| Rodapé | O aviso legal à esquerda, os links à direita, 11px |
| Foco do teclado | Contorno de 2px na cor de destaque, a 3px do elemento |

## 9. Temas

- A página abre no tema claro.
- O botão do canto direito troca o tema, e o navegador lembra a escolha (chave `baked-theme`). É a única coisa que
  o site guarda no navegador: não há cookie nem medição de visitas.
- Um endereço terminado em `?theme=dark` ou `?theme=light` vence a escolha lembrada.
- **Navegador que força páginas escuras** (o Opera tem essa opção) repinta o tema claro por conta própria: o creme
  vira marrom. O tema escuro do site quase não muda. Ao avaliar cor, confira se o navegador não está com essa opção
  ligada.

## 10. Movimento

- A troca de tema leva 0,2 segundo.
- O mascote respira num ciclo de 3,4 segundos e pula entre os blocos.
- O anel do botão principal gira no tema claro.
- Quem pede menos movimento no sistema não vê o anel girar nem o mascote respirar.

## 11. Regras de construção

- **Nenhum estilo e nenhum script dentro da página.** O servidor recusa (política de segurança de conteúdo). Tudo
  vai em arquivo.
- **Cor só no arquivo de cores.** A disposição e as fontes ficam em `styles.css`. Um teste garante que o arquivo de
  cores só declara cor, fora o aviso e o tamanho do título.
- **Arquivo de estilo mudou, o número `?v=` sobe.** A rede de distribuição guarda os estilos por horas.
- **Fora dos buscadores** (`noindex`) enquanto a página não for a inicial.
- **Os testes que seguram esta marca** estão em `services/landing/tests/five.test.mjs`: cores iguais às aprovadas,
  tamanho do título, frase de abertura dentro do limite, símbolo certo na barra, frase de consentimento intacta,
  nenhum "bet" e nenhum "market" fora do nome.

| O quê | Onde |
|---|---|
| Página aprovada | `services/landing/public/5/index.html` |
| Cores | `services/landing/public/5/colors.css` |
| Disposição, fontes e tamanhos | `services/landing/public/styles.css` |
| Mascote | `services/landing/public/mascot.js`, `mascot-body.js`, `mascot-senses.js` |
| Tema e formulário | `services/landing/public/app.js` |
| Símbolo | `services/landing/public/img/brot-loaf.webp` |
| Desenhos de origem | `docs/product/poses/` |

## 12. Onde esta marca já vale, e onde ainda não

| Lugar | Estado em 2026-10-09 |
|---|---|
| `/5` | É a referência. Está numa branch, ainda não publicada |
| Página inicial no ar (`brot.markets`) | Ainda a versão anterior, em azul, com o mascote na barra |
| Termos, privacidade e `docs.brot.markets` | Ainda não seguem este documento; têm o mascote na barra |
| Deck (`/pitch`) | Mesma família de cores, com as fontes IBM Plex |
| Aplicativo | Ainda não segue este documento |
| Ícone da aba do navegador | Ainda é o mascote (`img/favicon.png`) |

## 13. Em aberto

- **Alinhar `DESIGN-DIRECTION.md` e o aplicativo a estas cores.** A direção aprovada em 3/10 usa azul como destaque
  e um claro frio. O pedido de mudança aberto para a sprint de design segue essa direção antiga.
- **Publicar a `/5` como página inicial**, e decidir o que acontece com as páginas `/2`, `/3` e `/4`.
- **Levar o símbolo e as cores para os termos, a privacidade e o docs.**
- **Trocar o ícone da aba** pelo pão, se o símbolo valer também lá.
- **Abrir no tema escuro para quem usa o sistema em modo escuro.** Evitaria o creme repintado de marrom pelos
  navegadores que forçam páginas escuras. Muda a regra de tema da seção 9.
- **A imagem de compartilhamento** (`img/og.png`) não foi revista contra este documento.
- **Os limites de palavras da seção 4** são os números da página aprovada. Não houve uma decisão separada sobre
  cada um.
- **As regras de uso generalizadas** (o símbolo sozinho ao lado da assinatura, verde e vermelho só no YES e no NO)
  descrevem a página aprovada. Vale confirmar que os fundadores querem cada uma como regra.
