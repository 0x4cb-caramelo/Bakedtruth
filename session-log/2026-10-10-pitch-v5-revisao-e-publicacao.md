# 2026-10-10 — O deck v5.1: da conversa depois do pitch ao `/pitch`

## Pedido

O fundador apresentou o deck v4 a colegas de madrugada, gravou a conversa depois da apresentação e pediu: organizar a
transcrição por slide; montar uma versão nova numa pasta `/pitch5` para ver na máquina dele; depois de duas rodadas
("vamos para a versão 5.1"), escrever o roteiro em português e em inglês e pôr o deck novo "no lugar do /pitch no
site".

## O que foi decidido, e por quem

Todas as decisões de conteúdo são do fundador, em três mensagens do dia. O registro de cada uma, com o que ele disse,
está na seção 8 de `docs/business/_review/revisao-do-pitch-2026-10-10.md`.

- **O slide "How we earn" sai** e a taxa passa para dentro do demo do slide de solução.
- **O demo toca quatro exemplos em sequência,** e não mais um cartão que vira de um lado para o outro. O terceiro mostra
  os 10% do lado perdedor; o quarto, no mesmo mercado, o 1% de quem abriu. O texto da esquerda troca nos dois, e um
  saldo embaixo soma os quatro. A velocidade é 0,8 da primeira versão.
- **Tudo em SOL.** "A nossa moeda é apenas SOL, não adotamos usdc na plataforma."
- **O mercado vira dois slides sobre um gráfico só.** Saem TAM, SAM e SOM. No primeiro, o mascote corre de junho a
  setembro de 2026, mês a mês. Na troca, o texto some, o gráfico se afasta e os meses chegam um a um até outubro de
  2028, com a bandeira "We'll be here". A extrapolação foi pedida por ele: "extrapolando e sendo marketeiros mesmo".
- **O slide "Open a market" sai.** "Ele foi parar lá no slide 3."
- **A empresa do gráfico se escreve world.xyz.**
- **A linha do site e do X vai para o pé da capa.**

## O que eu decidi, por falta de instrução, e por quê

- **Os quatro meses do gráfico são os medidos** (1,14, 13,22, 22,20 e 15,44 milhões de dólares, da DefiLlama, como
  estão no plano de negócio). Ele pediu "mês a mês" e, antes, "um gráfico crescente". As duas coisas não cabem juntas:
  agosto ficou acima de setembro. Desenhei o que foi medido, porque inventar julho e agosto para a linha só subir seria
  dado falso num slide de mercado.
- **O cenário está em linha pontilhada e com uma frase embaixo** que diz que é projeção nossa, e não medida nem de
  terceiros.
- **O número da bandeira, "$1B+ a month", é provisório:** 5% dos 21,7 bilhões da categoria. Ele pediu a projeção e não
  deu o número. Está numa constante (`TARGET`, em `pitch/chart.js`).
- **Os valores do demo em SOL** (entrada de 0,5, potes de 10) são os mesmos de antes divididos por cem.
- **O slide 5 abre no último quadro do slide 4.** Foi o jeito de fazer a transição que ele descreveu sem trocar o
  motor do deck, que anda de slide em slide: são dois slides com as mesmas caixas na mesma altura.
- **O v4 foi para `services/landing/history/pitch-4/`,** com o roteiro dele, como os três anteriores. O endereço
  `/pitch5`, que serviu de prévia, passa a redirecionar para `/pitch/`.

## Onde o deck e o programa não batem

**O 1% de quem abriu.** O fundador pediu que o exemplo 4 mostre o 1% "sendo tomado do nosso fee": num pote de 10 SOL,
0,30 para o Brot, 0,10 para quem abriu e 9,60 para quem acertou. O programa na devnet faz diferente
(`programs/brot-markets/src/math/payout.rs`): o 1% sai do pote, ao lado da taxa, e só sai da taxa quando o lado
perdedor não cobre. No mesmo pote dá 0,40, 0,10 e 9,50, que é também o que o deck v4 mostrava. Avisei três vezes e
construí o que foi pedido. Uma palavra em `pitch/pot.js` (`CREATOR_FROM`) troca os números e a frase. Enquanto não se
decidir, o deck no ar descreve uma regra que o programa não cumpre.

## O que ficou em aberto

- A regra do 1%, acima: ou o deck volta para 0,40, 0,10 e 9,50, ou o programa muda.
- O número da projeção.
- Com o slide "Open a market" fora, o deck não diz mais quanto custa abrir um mercado (os 500 dólares, os 90% que
  viram prêmio, os 10% da taxa de abertura). O roteiro diz isso numa frase; a tela, não.
- O slide de problema ainda diz "World, inside Phantom"; o de mercado diz world.xyz. A grafia não foi conferida na
  fonte, e o plano de negócio diz "World".
- O slide de crescimento ainda diz "a cap"; o plano v0.0.4 não tem teto.
- A versão parada do deck, que vira o PDF, mostra só o primeiro cartão do demo: sem a taxa e sem o 1%.
- O deck segue dizendo "market"; o plano e o programa dizem "campaign".
- `docs/business/PITCH.md` ainda descreve o deck de oito slides de 5/10 como "o que está no ar".
- Os nomes dos colegas da gravação não foram confirmados, e a revisão não nomeia ninguém.

## Conferido

- Os 45 testes de `services/landing/tests/` passam. O teste do deck foi reescrito para os oito slides, para SOL e para
  o gráfico; ele confere que os quatro meses medidos estão no código e que a frase da projeção está na tela.
- A página foi aberta num navegador sem tela, slide a slide, em cada momento do demo e da transição do mercado: sem
  erros no console, saldo final +0,70 SOL, oito slides.
- Não conferido: a leitura em voz alta do roteiro. As durações são estimativa pelo número de palavras.
