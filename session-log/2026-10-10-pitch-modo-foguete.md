# 2026-10-10 — O modo foguete do deck: a lambo no slide 4, o foguete e a lua no slide 5

## Pedido

O fundador, à tarde, com o deck v5.1 no ar: "no slide 4 vamos trocar o nosso paozinho pela parte que ele entra na
lambo e percorre o gráfico de lambo, e qdo clicar pra ir pro slide 5 a gente pega a parte que ele sai da lambo, e sai
voando conforme o grafico avança no slide 5 e nos ultimos meses ele chega na lua e bate. Quero tbm que esta versão
inteira seja uma versão extra no painel de controle (...) um novo botão, que pode ser um icone de foguete, que serve
pra ter todas as animações ligadas (...) ou seja, a versão motion on e lighter off continua igual ao que temos hoje."
Depois de ver na máquina dele: "pode subir online, excelente."

Os nove desenhos são dele, em `docs/product/tothemoon/` (fora do Git, como os outros originais): quatro da lambo
sobre fundo creme e cinco, já transparentes, da saída do carro, do capacete, do foguete e da batida na lua.

## O que foi decidido por ele

- É um **modo a mais**, com botão próprio de foguete na barra. Os modos completo, mais leve e sem movimento ficam
  como estavam.
- No modo foguete todas as animações do modo completo tocam; só os dois slides de mercado trocam o pãozinho a pé
  pelas imagens novas.
- A ordem da história: entra na lambo e percorre o gráfico (slide 4); sai da lambo, voa com o gráfico e bate na lua
  nos últimos meses (slide 5).

## O que eu decidi, por falta de instrução, e por quê

- **As nove imagens entram, na ordem dos arquivos.** Slide 4: ao lado do carro, entrando, dirigindo, acelerando, e de
  novo dirigindo ao estacionar em setembro. Slide 5: saindo, capacete, foguete, foguete em pânico (depois de 72% do
  voo) e a batida.
- **O carro inclina com a linha** no meio de cada mês e fica reto onde para. O foguete aponta ao longo da linha
  pontilhada e, nos últimos 20% do voo, embica até o ângulo do desenho da batida, para a troca de imagem não dar um
  salto.
- **A lua aparece antes da batida,** na borda direita do slide: é o próprio desenho da batida, com tudo escondido menos
  o lado de lá da lua. Sem isso ela surgiria do nada no último quadro.
- **A faixa "$1B+ a month" fica 210 px mais à esquerda neste modo,** porque no lugar de sempre ela cobriria a chama do
  foguete. O texto, o número e o aviso de que é cenário nosso não mudam.
- **A lambo some quando o foguete decola:** não há desenho dela vazia.
- **Os dois desenhos da lambo de frente vêm cortados nas duas pontas;** as bordas foram esfumadas. O da lua vem cortado
  embaixo e à direita: embaixo foi esfumado, e à direita o corte fica fora do slide.
- **As imagens novas só são pedidas ao servidor por quem liga o modo** (cerca de 760 KB), para o deck normal não ficar
  mais pesado.
- **Tecla R e `?motion=rocket`,** no padrão das outras (M, N, `?motion=off`, `?motion=lite`).
- **O gráfico, os números e as frases são os mesmos nos quatro modos.** Só muda o que percorre a linha.

## Como foi feito

- `pitch/moon.js` é o modo inteiro: a lista dos nove desenhos, o tamanho e o ponto de apoio de cada um, e as três
  cenas (`drive`, `liftOff` e o estado parado, `landed`). Tirar o modo é apagar esse arquivo, o botão e os desvios em
  `scenes.js`, `exits.js` e `motion.js`.
- `chart.js` passou a aceitar um "passageiro" (`ride`) no lugar do pãozinho e a dizer onde a linha termina e com que
  inclinação (`end`). Sem passageiro desenha o que desenhava.
- `market.js` exporta o que as cenas novas reaproveitam e ganhou `words`, a troca de títulos do slide 5, que era um
  trecho de `pullBack`.
- As imagens: o fundo creme dos quatro desenhos da lambo foi removido por preenchimento a partir das bordas (as manchas
  claras de dentro do pão ficam), a sombra do chão saiu, a poeira ficou; tudo reduzido a 836 px e gravado em WebP.
  O script ficou fora do repositório, como os das poses anteriores.

## O que foi conferido

- Os 45 testes do site, com conferências novas: os nove desenhos existem, cada pose citada está na lista, o botão está
  na página, os modos antigos continuam chamando as cenas antigas e `sprites.js` não carrega as imagens novas.
- Num navegador de teste, 14 quadros parados das duas cenas, sem erro no console; e, desligando o botão no meio, o
  pãozinho de volta nos dois slides, no tamanho e no lugar de antes.
- Não conferido por mim: a animação em velocidade real, tela cheia, outro navegador e o modo mais leve (o código dele
  não mudou). O fundador viu rodando na máquina dele antes de mandar publicar.

## Pendências

- **O tom.** Lambo e lua são os memes de "ficar rico", e o guia de marca diz que as piadas não convidam a pôr dinheiro.
  Fica como modo extra, desligado por padrão; se ele for para o vídeo do Colosseum, é decisão do fundador.
- **O roteiro de fala** (`docs/business/roteiro-pitch-v5.md`) não cita o modo: as marcações de cena dos slides 4 e 5
  valem para o modo normal. No modo foguete a cena do slide 4 leva cerca de 1,2 s a mais e a do 5, cerca de 1,6 s.
- **O PDF do deck** sai do modo sem movimento e não muda.
- As pendências do v5.1 seguem: o 1% de quem abre (taxa ou pote), o "$1B+ a month" sem fonte e o slide 2 com "World,
  inside Phantom".
