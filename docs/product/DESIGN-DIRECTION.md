# DESIGN-DIRECTION.md

- **Project:** nome ainda em aberto (nome de trabalho no protótipo: "baked"; o mascote se chama Baked)
- **Approved on:** 2026-10-02
- **Approved by:** Lucas
- **Chosen direction:** `prototype-c` ("Tape")
- **Status em 2026-10-03: substituída, documento ainda não reescrito.** O Lucas escolheu a `prototype-d` ("Ledger²")
  como layout do site, com a `prototype-n` ("Ledger² Light") como tema claro; a N foi aprovada por ele no mesmo dia
  ("N aprovado"). Falta a reescrita deste documento (tokens dos dois temas, telas, fluxo, lacunas). **Tudo abaixo desta linha ainda descreve a
  C** e não vale como direção; o app também segue com a C até a sincronização com o upstream. Motivos em
  [`session-log/2026-10-03-direcao-ledger2-claro-e-escuro.md`](../../session-log/2026-10-03-direcao-ledger2-claro-e-escuro.md).

Pasta de origem: `prototype-lab/prototype-c/`, mais os arquivos compartilhados em `prototype-lab/shared/` (`mock-data.js`, `app.js`, `mascot.js` e as poses em `mascot/`).

---

## Why this direction won

O dono do projeto escolheu a C depois de ver as três no navegador ("vamos de C"). Ele não registrou os motivos, e não existe BP v0.0.2 para ancorar a escolha em personas.

Leitura de quem construiu os protótipos, a confirmar: a C é a única em que o mascote e a interface falam a mesma língua (pixel art), e a única que não parece mais um clone de Polymarket ou Kalshi. O formato de placar também casa com o produto, que mostra números lidos da chain e não opiniões.

## What the other directions did better

- **A · Ledger:** a grade de cards mostra mais informação por mercado de uma vez (gráfico da cotação, linha de prova, volume) e é a mais próxima das convenções que o `CLAUDE.md` do repositório original exige (Kalshi, Polymarket, Trueo). O painel "Live read" do hero explica o produto em um olhar.
- **B · Oven:** a metáfora de "ponto do assado" para a prova ("Is it done yet?", "Done at") é a redação mais clara das três para quem não é de cripto. O card em destaque no hero dá um caminho óbvio para o primeiro clique. O shader WebGPU é o efeito de fundo mais marcante.

Candidatos a enxerto na C: o gráfico de cotação por linha (hoje só existe na tela de mercado) e a redação "done / not done" da B.

## What was rejected, and why

| Elemento rejeitado | Veio de | Por que não |
|---|---|---|
| Fonte Pixelify Sans | primeira versão da C | Os algarismos são ambíguos: "20%" lia como "80%" e "500,000" como "$00,000". Trocada por Jersey 15. |
| Mascote pousando no topo de cada item da lista | A e B | Nas linhas estreitas da C ele cobriria a linha de cima. Na C ele anda pelo trilho à esquerda. |
| Paleta quente e fonte serifada | B | Não foi a direção escolhida. |
| Grade de cards como formato principal dos mercados | A e B | Não foi a direção escolhida; a C usa linhas. |
| Rótulos numerados "01 / 02 / 03" nos passos | referência `baked-home.html` | Padrão genérico que o lab evita; os passos da C são ligados por setas. |

---

## Color tokens

Só existe tema escuro. Tema claro é lacuna para a Fase 4, não esquecimento.

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#0b111c` | fundo da página |
| `--panel` | `#111a2a` | painéis, linha em hover |
| `--raised` | `#18243a` | filtro ativo |
| `--line` | `#2a3a58` | bordas e divisórias (sempre 2px) |
| `--text` | `#e8eefb` | texto principal |
| `--muted` | `#92a3c0` | texto secundário |
| `--dim` | `#63748f` | texto terciário, ícones inativos |
| `--blue` | `#6aa8ff` | categoria ativa, blocos de progresso, links |
| `--crust` | `#f2a94e` | marca, botão primário, próximo bloco, trilho aceso |
| `--yes` | `#3ddc97` | lado YES |
| `--no` | `#ff6b8a` | lado NO |
| fundos de YES / NO | `#0f2a22` / `#32131d` | botões Yes e No em repouso |
| sombra dura | `4px 4px 0 #04070d` | botões e painéis |

Verde e vermelho são reservados a YES e NO. O âmbar da casca é a cor de ação.

## Typography

| Role | Family | Size | Weight | Line height |
|---|---|---|---|---|
| Display (hero) | Jersey 15 | `clamp(44px, 5.4vw, 78px)` | 400 | 0.92 |
| Heading (título do mercado) | Jersey 15 | `clamp(38px, 4.8vw, 64px)` | 400 | 0.95 |
| Subheading (painéis) | Jersey 15 | 26–30px | 400 | 1 |
| Números (preço, leitura) | Jersey 15 | 38–66px | 400 | 0.9–1 |
| Body | Space Grotesk | 14px | 400–600 | 1.5 |
| Título da linha | Space Grotesk | 15px | 600 | 1.3 |
| Caption | Space Grotesk | 12–13px | 400–500 | 1.5 |

Jersey 15 só tem um peso; o negrito sintético está desligado (`font-synthesis: none`). Não há fonte monoespaçada.

## Spacing and density

- Base unit: 2px nas bordas; espaçamentos em múltiplos aproximados de 4px (não há escala formal ainda).
- Container max width: 1280px.
- Density stance: compacta nas linhas (uma linha por mercado, cerca de 74px), folgada no hero. Serve quem compara vários mercados de uma vez.
- Border radius: zero em tudo.
- Elevation: sombra dura deslocada, sem desfoque. Botões afundam ao clicar.

---

## Component inventory

| Component | Where it appears | Variants seen | Notes |
|---|---|---|---|
| Ticker | topo de todas as telas | única | Atividade recente em rolagem infinita; pausa no hover |
| Barra superior | todas as telas | única | Marca, categorias, busca, botão de carteira; fixa no topo |
| Abas segmentadas | categorias, filtros de status | ativa azul (categorias), ativa cinza (status) | Bordas quadradas compartilhadas |
| Botão | hero, barra, painel de compra | primário âmbar, alternativo escuro | Sombra dura, fonte pixel |
| Medidor do hero | home | única | Número grande, alvo, 24 blocos, texto de regra |
| Blocos de progresso | medidor, linhas, prova | 12 blocos (linha), 24 blocos (medidor, prova) | Bloco seguinte pisca em âmbar |
| Caixa de princípio / passo | home | princípio (borda cinza), passo (borda âmbar, com seta) | Passos só aparecem ao clicar "How it works" |
| Linha de mercado | home | aberta, resolvida | Token, pergunta, metadados, blocos, %, Yes/No, salvar |
| Trilho com feixe | à esquerda da lista | única | O trecho aceso acompanha a linha sob o cursor |
| Botões Yes / No | linhas, painel de compra | repouso, hover, selecionado | Viram cor cheia no hover e quando selecionados |
| Painel de prova | tela de mercado | com blocos (metas numéricas), sem blocos (metas de autoridade) | Leitura atual, alvo, conta lida, prazo, resolução |
| Gráfico em degraus | tela de mercado | única | Histórico do preço de YES |
| Painel de compra | tela de mercado | Buy YES, Buy NO, Redemption | Valor em USDC, estimativa, botão de carteira |
| Aviso | topo do conteúdo | única | Aparece ao clicar em carteira ou "Sponsor a goal" |
| Estado vazio | lista | única | Mascote emburrado, texto e "Clear filters" |
| Fundo de células | todas as telas | única | Canvas; células acendem sob o cursor |
| Mascote | todas as telas | 8 poses | Ver seção própria abaixo |

### Mascote (Baked)

Comportamento definido em `prototype-lab/shared/mascot.js`:

- Fica em poleiros declarados pela página (`data-perch`); salta para o mais próximo de onde o cursor parou, depois de uma pequena espera. Não segue o cursor livremente.
- Na C os poleiros são: o medidor do hero, as três caixas de princípios, o trilho ao lado de cada linha, o painel de prova, o painel de compra e o rodapé.
- Salta em passos discretos e com posição ajustada à grade de 4px.
- Poses por contexto: aponta para a linha ou para a prova, aprova sobre Yes e em mercados resolvidos, desconfia sobre No, bate o pé com cursor frenético ou sobre "Connect wallet", cansa após 9 s parado, emburra após 22 s.
- Fala ao pousar em alguns poleiros e ao ser clicado. Frases em `mock-data.js` (`quips`).
- Em telas com menos de 700px ele encolhe para 60% e o trilho some.

## Screens that exist

| Screen | Purpose | File |
|---|---|---|
| Home | Hero, princípios, filtros e a fita de mercados | `prototype-lab/prototype-c/index.html` |
| Home com "How it works" aberto | Os três passos do produto | `prototype-lab/prototype-c/index.html` (botão "How it works") |
| Mercado | Prova on-chain, histórico de preço e painel de compra | `prototype-lab/prototype-c/index.html#/m/1/YES` |
| Lista vazia | Filtro sem resultado | `prototype-lab/prototype-c/index.html` (filtro "Saved" sem itens salvos) |

## Primary user flow, as actually clicked

1. A pessoa chega na home e vê o título, o medidor do $EMBER descendo em direção ao alvo e os três princípios.
2. Rola até a fita. Pode trocar de categoria na barra superior, de status nos filtros, ordenar e buscar; a lista responde na hora.
3. Passa o cursor por uma linha: o feixe do trilho acende ali e o mascote vai até ela e aponta.
4. Clica em "Yes" ou "No" na linha (ou no título). Abre a tela do mercado com o lado escolhido já selecionado.
5. Na tela do mercado, lê a prova (valor atual, alvo, conta, prazo), digita um valor em USDC e vê a estimativa de cotas e de retorno.
6. Clica em "Connect wallet". Aparece um aviso de que é só uma prévia; nada é conectado nem enviado.
7. Volta pela seta "Back to the tape" ou pelo botão voltar do navegador.

Salvar um mercado (ícone de marcador) funciona e alimenta o filtro "Saved", mas não persiste ao recarregar.

---

## Gaps: implied but never shown

| Gap | Where it would appear | Open question for Phase 4 |
|---|---|---|
| Fluxo do patrocinador | "Sponsor a goal" | O protótipo só mostra um aviso. Qual é o formulário (tipo de meta, conta, alvo, prazo, preço de YES, orçamento)? |
| Carteira conectada | barra superior, painel de compra | Como ficam saldo, posições e o botão depois de conectar? |
| Posições do usuário | tela de mercado | O app original tem um cartão de posição; a C não. Onde entra? |
| Pool e liquidez | tela de mercado | O programa tem pool com mint/burn de pares e LP. Nada disso aparece. |
| Resolver e resgatar | painel de prova, mercados resolvidos | Onde fica o botão "Resolve" quando a meta é cumprida? E o resgate? |
| Feed de atividade por mercado | tela de mercado | O ticker é global. Há feed por mercado? |
| Estados de carregamento | lista, prova, gráfico | Os dados reais vêm do RPC e demoram. O que aparece enquanto isso? |
| Estados de erro | RPC fora, transação rejeitada | Mensagens e recuperação não foram desenhadas. |
| Dados longos ou feios | linhas | Pergunta de 150 caracteres, token sem nome, 500 mercados: paginação, corte, rolagem? |
| Metas de autoridade | linhas | Sem progresso numérico, os blocos mostram o preço de YES. Isso confunde? |
| Fase "aguardando resolução" | linhas, mercado | O protótipo só tem aberto e resolvido. |
| Celular | tudo | Não quebra e não rola de lado, mas a linha empilhada e o mascote reduzido não foram revisados com cuidado. |
| Acessibilidade | tudo | Há foco visível e rótulos, mas contraste, leitor de tela e o ticker em movimento não foram auditados. O mascote respeita `prefers-reduced-motion`. |
| Tema claro | tudo | Não existe. |
| Nome e logotipo | marca | O nome está em aberto; "baked" é provisório. |

---

## Brand hypothesis carried forward

- **Tone of voice:** seco, curto, factual, em inglês. O mascote é rabugento em silêncio: "Prove it.", "Read the account.", nunca vendedor.
- **What kind of company this makes us look like:** um placar que só mostra o que leu. Com personalidade, mas sem opinião sobre o resultado.
- **What we are deliberately NOT:** um cassino, uma casa de apostas esportivas, um dashboard genérico de DeFi ou mais um clone de Polymarket.

---

## Handoff checklist

- [x] Every token above has a real value, not a placeholder.
- [x] Every screen in the prototype is listed.
- [x] The flow section matches the clickable flow, not the intended one.
- [x] The gaps table is filled in.
- [ ] `prototype-lab/prototype-c/` is committed and reachable. (Ainda não commitado.)
