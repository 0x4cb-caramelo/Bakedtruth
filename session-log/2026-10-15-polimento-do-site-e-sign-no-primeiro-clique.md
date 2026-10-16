# 2026-10-15 — O polimento do site e o "Sign" no primeiro clique

## Os pedidos

Uma rodada de ajustes de interface no site do `/dev0x`, pedida pelo fundador em sequência, cada um visto antes no site
local (`http://127.0.0.1:4250/dev0x`, com a API de leitura do devnet repassada por um relé local):

1. **O pão no topo.** O `/dev0x` mostrava o Baked inteiro na barra; o brot.markets mostra o pão (`img/brot-loaf.webp`).
   O mesmo arquivo (mesmo SHA-256) foi copiado para `app/public/img/`, no tamanho e no espaçamento da landing.
2. **O título e o subtítulo da página inicial.** Já eram os pedidos ("Campaigns the chain resolves."); nada mudou.
3. **"How it works" com um X amarelo que fecha de vez neste navegador.** A escolha fica no `localStorage`
   (`brot-home-how`). Em vez de estado do React, um script no `<head>` marca o `<html>` antes da primeira pintura, como o
   tema já faz, e o CSS esconde o bloco. Assim o servidor e o navegador desenham o mesmo HTML: quem fechou não vê o bloco
   piscar, e quem chega pela primeira vez não vê a página pular. No tema claro o X usa a cor de destaque do tema
   (ferrugem), porque amarelo sobre creme não se lê.
4. **O "US$500 in SOL" mais discreto, e dizendo para que é a cobrança.** Ele aparecia em 15 px e negrito por um erro de
   especificidade: a regra do subtítulo (`.home-lead > div > p`) também pegava as linhas do custo. Corrigida, e o custo
   virou um cartão de letra miúda: "Opening a campaign costs US$500 in SOL · 90% becomes its prize". O pedido dizia
   "open a market"; ficou "campaign", pela regra de vocabulário.
5. **O prazo como contagem regressiva** na linha da regra da campanha ("… within 4d 07h 13m 06s. Otherwise NO."),
   contada pelo relógio da rede, com o gancho do relógio da revisão (agora compartilhado em `use-countdown.ts`). A data
   exata fica no passar do mouse, em "Full rules" e na prova; depois do prazo, a linha volta a dizer a data.
6. **A janela "Check before you sign" no desenho do mockup do fundador** ("Confirm entry — before / after", 1a).

## As decisões na janela de entrada

- **Os avisos aprovados ficaram palavra por palavra.** O mockup reescrevia o L-03 (o texto do fundador, marcado "não
  editar sem nova decisão"), o de entradas públicas e o de devnet. O desenho foi aplicado, as palavras não: o L-03
  aparece nas suas duas frases, em duas linhas da lista, e um teste confere que juntas são o texto aprovado. Trocar a
  redação continua sendo decisão do fundador.
- **Sem "profit" e sem "share"**: a regra de vocabulário proíbe a primeira, e o produto não tem cotas. Ficou
  "13.3172× your entry" e o aviso aprovado de entrada grande.
- **O valor de retorno na cor do lado** (vermelho para NO), porque no site o verde é o YES; os números na fonte da marca
  (Barlow), não na Geist Mono do mockup.

## O "Sign" que só ia de segunda

O fundador relatou que o primeiro clique em "Sign" não fazia nada ou voltava para a mesma tela. A causa, medida no
devnet: saem cerca de 4,45 blocos por segundo, então os 150 blocos de vida de uma transação duram uns 34 s, e o "Sign"
exigia 60 de sobra. Quem lia a janela por mais de uns 20 s via o clique preparar a transação de novo, passando por um
estado em que a janela fecha e reabre, com um aviso pequeno no topo. Durante a checagem nada reagia, e um segundo clique
abria uma segunda tentativa em paralelo.

A correção (`app/features/entry/fresh-join.ts`): a transação vencida é preparada de novo sem fechar a janela; quando só
o blockhash mudou (o resumo dos bytes, o total, a estimativa e o pote iguais), o que a pessoa revisou é o que a carteira
assina, e o mesmo clique segue. Termos novos voltam para a revisão, com o aviso junto ao botão. O botão diz "Preparing
for your wallet…" e um segundo clique não faz nada.

Reproduzido no navegador com uma carteira de teste que só conta os pedidos e recusa todos (o endereço público da chave
da equipe, com SOL no devnet, para a simulação passar; nada foi assinado nem enviado): com o código antigo, esperando
25 s e clicando uma vez, 0 pedidos à carteira e "Prepared again" na tela; com a correção, 1 pedido, 2,2 s depois do
clique; com dois cliques rápidos, 1 pedido.

## O que ficou em aberto

- **Mais tempo para aprovar na carteira.** Quem clica antes dos 20 s chega à carteira com no mínimo uns 13 s de
  validade (60 blocos). Subir a folga para uns 100 blocos daria uns 22 s, ao custo de uma espera de ~2 s no "Sign" mais
  vezes. Só vale se aparecerem falhas de "expirou".
- **O painel de entrada** ao lado ainda mostra os avisos no formato antigo.
- **A publicação no servidor** não sai desta máquina: aqui não há o atalho `ssh agent-rails-vps`.
