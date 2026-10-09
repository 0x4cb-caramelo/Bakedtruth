# 2026-10-09 — A página /3: a original, com as cores do deck e o texto mais curto

## O que era verdade antes

- A página inicial (`services/landing/public/index.html`) usa o visual Ledger²: azul, Barlow Condensed e Inter.
- A `/2` (PRs #38 e #39) traz o mesmo texto com o visual inteiro do deck: cores, IBM Plex, cartões escuros.

## O que os fundadores decidiram

Lucas, em 9/10/2026, falando por ele e pelo Ronaldo: "a gente gostou mais do copy e disposição das coisas no
original, mas com as novas cores do novo. A gente tem que buscar reduzir e simplificar um pouco mais os textos, ter
menos linhas de leitura, coisa que no pitch temos essa conceituação". Pediu uma `/3` com essas diretrizes, um quadro
laranja dizendo que o site está em construção, nas nossas palavras ("we are baking this website"), e tudo numa
branch nova.

## Como foi feito, e por quê

- **Disposição e fontes da original, por construção.** A `/3` carrega o `styles.css` da página inicial. Não há
  cópia: o que o Ronaldo mudar na disposição da original vale para a `/3` na hora.
- **Só as cores trocadas.** `public/3/colors.css` redefine os tokens de cor nos dois temas com a paleta do deck e
  desenha o aviso. A única regra de disposição que ele toca é o espaço acima da capa, por causa do aviso. Um teste
  falha se uma cor da original ficar sem correspondente: foi assim que a barra do exemplo saiu azul no tema claro na
  primeira tentativa.
- **Os cartões seguem a original** (claros no tema claro). Os cartões sempre escuros da `/2` são disposição do
  deck, não cor, e ficaram de fora.
- **Texto no jeito do deck:** um título e uma linha curta por bloco. 232 palavras contra 299; no computador, cada
  princípio cabe em uma linha (eram três) e a chamada em duas (eram três).
- **O que não mudou, de propósito:** a frase de consentimento sob o formulário (`lib/leads.mjs` grava a versão
  dela com cada email; mudar a frase pede versão nova e revisão de privacidade), as falas e os pousos do mascote, e o
  rascunho do X.
- **O rodapé** ficou mais curto e manteve as quatro afirmações: fase de teste na devnet, tokens de teste, programa
  sem auditoria, nada ali é oferta, disponibilidade por país indefinida. Saiu a palavra "bet", que o plano de
  negócios não usa fora da marca.

## A /4, no mesmo dia

Depois de ver a `/3` rodando localmente, o Lucas respondeu: "o copy no 3 acertou, é isso. Mas as cores passaram no
exagero, as cores do 2 eram boas, vamos fazer um /4 com estas correções, e a fonte do 3 é o mesmo do original, e a
gente gosta dele tbm."

- **O que ficou decidido:** o texto curto da `/3` e as fontes da original (Barlow Condensed e Inter) estão aprovados.
- **O que "as cores do 2" quer dizer aqui.** A paleta da `/2` e a da `/3` são a mesma. O que mudou foi o uso: na
  `/3` os cartões seguiam a original e ficavam creme sobre creme, com as etiquetas SIM e NÃO em tons pastel, a
  faixa do topo bege e o botão com o anel giratório. Na `/2` o exemplo e os três princípios eram cartões escuros
  sobre o creme, a faixa era escura e o botão era liso. A `/4` volta a esse uso. A leitura que fiz na `/3`,
  "cartão escuro é disposição do deck, não cor", estava errada.
- **Como:** `public/4/colors.css` redefine os tokens de cor e, dentro dos cartões, troca os tokens pelos escuros,
  seja qual for o tema da página. Um teste confere que o arquivo só declara cor, fora o aviso.
- **A `/4` ainda saiu errada na primeira vez.** Resposta do Lucas: "vc tem o fundo marrom e não azul/nave como era
  no original, ainda tem muito marrom, e eu disse especificamente que queremos as cores do /2, e ele não tinha esses
  marrons". A `/2` tem dois temas: no escuro é azul-marinho com laranja; no claro é creme com blocos marrom-escuros.
  A leitura mais provável é que ele viu a `/2` no escuro em `brot.markets`, onde o navegador lembra a escolha; no
  `localhost` tudo abre no claro, e a `/4` tinha copiado justamente o tema claro da `/2`. Faltou conferir em qual
  tema ele estava julgando.
- **A correção:** nenhum creme e nenhum marrom. O escuro é o azul-marinho e laranja da `/2`. O claro fica com o
  fundo azulado, os painéis brancos e a tinta da original, com os mesmos cartões azul-marinho e o mesmo laranja; o
  laranja de texto no claro é um tom mais fundo (`#c2410c`), para dar leitura. Um teste proíbe as cores creme e
  marrom no arquivo.
- **O tema claro, puxado para o branco.** Depois da correção o Lucas escreveu: "ok, melhorou, mas agora que você me
  disse e eu me dei conta, como fica a versão light? não pode ser marrom, tem que ser puxado pra branco." O claro já
  não tinha creme, mas o fundo era o azul-acinzentado da original (`#eef1f6`). Passou a quase branco (`#f8f9fb`),
  com os painéis brancos e a tinta azul-marinho. Os cartões azul-marinho ficaram, porque ele aprovou o escuro e
  pediu só que o claro puxasse para o branco; trocá-los por cartões brancos é uma decisão dele, ainda não tomada.
  Saíram também três tons que puxavam para o marrom, nos dois temas: o fundo do NO (`#3d2422`, agora o vinho da
  original, `#402530`), o fundo dos números dos princípios (laranja a 15% sobre azul-marinho dava um marrom turvo,
  agora `#2f3a4e`) e o laranja do link sob o ponteiro (`#9a3412`, agora a tinta). A letra miúda do claro escureceu
  um pouco (`#5f6a7d`) e passou a ter contraste 5,2 sobre o fundo. O teste exige um fundo claro quase branco e
  nunca quente, e proíbe os três tons.
- **A causa do marrom, achada depois.** O Lucas avisou que "o botão de light não funciona". O botão funciona: clique
  real em cinco larguras de janela, partindo dos dois temas, sempre troca. O navegador padrão dele é o Opera, com a
  opção de forçar páginas escuras ligada (`webkit.webprefs.force_dark_mode_enabled` nas preferências). Reproduzido
  num Chromium sem tela com a mesma chave do motor (`--blink-settings=forceDarkModeEnabled=true`): a `/4` clara é
  pintada cinza-escura, a `/3` creme é pintada **marrom**, e o tema escuro do site fica praticamente como é. Ou
  seja, o "fundo marrom" que ele viu na `/3` e na primeira `/4` era o navegador escurecendo o creme, e o tema claro
  nunca apareceu para ele como foi desenhado. A leitura registrada acima (ele teria visto a `/2` no escuro em
  `brot.markets`) continua possível, mas não é mais a explicação principal. Pedir ao navegador que respeite o claro
  (`color-scheme: only light`, por CSS ou por `meta`) não mudou nada nesse teste; no Opera de verdade não foi
  testado. Nada foi alterado no site por causa disso.
- **A `/3` continua na branch** para comparação; um teste garante que o texto das duas é o mesmo.

## A /5, no mesmo dia

Depois de saber que o Opera dele escurecia as páginas claras, o Lucas escreveu: "ok, vamos pegar o sistema light do /3
e o dark do /4, e o texto ainda precisa diminuir um pouco, por exemplo o primeiro texto está com 3 linhas e queremos
com duas linhas 'On-Chain Campaigns the chain answers.'"

- **Cores:** o tema claro é o da `/3` (o creme do deck, com ferrugem e cartões claros) e o escuro é o da `/4`
  (azul-marinho e laranja). Li ao pé da letra: ele citou as duas páginas pelo número. O creme é justamente o que o
  Opera dele pintava de marrom, então o parecer sobre o claro só vale visto num navegador que não force páginas
  escuras. O `5/colors.css` copia os dois blocos de cor e põe só no escuro o que a `/4` muda além deles (a faixa, o
  aviso de inscrição, a caixa de sugestão e o botão vazado). No navegador, os 84 elementos da página têm as mesmas
  cores da `/3` no claro e da `/4` no escuro.
- **Título em duas linhas:** as palavras são as mesmas. A coluna do título tem 593px a partir de 1180px de janela, e
  "On-Chain Campaigns" só cabe nela até 80px de letra; o máximo caiu de 84px para 78px. Em celular muito estreito
  (menos de 360px) a letra cai de 44px para 38px pelo mesmo motivo. Medido em dezesseis larguras, de 320px a 1920px:
  duas linhas em todas, ou uma só em tablet.
- **Texto:** li "diminuir" como menos linhas de leitura, que é o que ele vem pedindo. A frase de abertura perdeu "A
  Solana account gives the answer", que o título e o primeiro princípio já dizem, e cabe em uma linha no computador.
  O resto é o texto da `/3`, que ele aprovou. O rodapé (duas linhas) e a frase de consentimento (duas linhas) não
  foram tocados: um é aviso legal e a outra tem a versão guardada com cada email.
- **A `/3` e a `/4` continuam na branch** para comparação.

## Em aberto

- A `/3`, a `/4` e a `/5` não foram publicadas: mescla e servidor esperam a palavra do Lucas.
- Visitante com navegador que força páginas escuras vê o tema claro escurecido pelo navegador, fora das cores da
  marca. Abrir no tema escuro do site quando o sistema do visitante pede escuro resolveria; muda a regra de tema do
  `DESIGN-DIRECTION.md` e o `app.js` de todas as páginas, então é decisão do Lucas.
- Qual delas vira a página inicial, e o que acontece com a `/2` e a `/3`.
- O texto curto é uma proposta; o Lucas e o Ronaldo revisam frase por frase.
- O aviso laranja só está na `/3`. Falta decidir se vai também para os termos, a privacidade e o docs.
