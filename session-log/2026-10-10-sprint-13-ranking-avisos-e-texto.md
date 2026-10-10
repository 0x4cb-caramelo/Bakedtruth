# 2026-10-10 — Sprint 13: o ranking, os avisos, o texto e o fechamento do MVP no devnet

## Ponto de partida

- O prompt pedia a branch a partir da tag `sprint-12`. Na primeira tentativa a tag não existia e o PR #61 seguia
  aberto; a sessão parou e disse isso, como o prompt mandava. Depois o PR #61 apareceu mesclado e a tag criada no
  commit da mescla (`107fec2`), com o aviso do Ronaldo, "ok merged you can start"; a branch
  `sprint-13-site-notices-copy` saiu da tag.
- O binário local do programa é o do artefato do CI da `main` (run 38074799966, SHA-256 `cf2359…a3a8`). Os 3 testes do
  `cpi-proxy` falham só nesta máquina, porque o artefato não traz esse programa de teste; o CI roda os três.
- As perguntas ao fundador foram feitas no começo, numa lista só (abaixo), e cada uma foi construída como recomendado,
  trocável num lugar só, enquanto a resposta não vem.

## Decisões tomadas na sprint, e por quê

- **De onde vem o ranking: a rota `/api/v1/leaderboard` da API de leitura, a partir dos eventos do programa (opção a).**
  O plano técnico já lista a rota (§6); um servidor lê a rede uma vez por atualização, em vez de cada visitante (o
  §3.5 explica por que o navegador não aguenta o lado da leitura); e o indexador da Sprint 08 pode assumir a rota
  depois. A API lê as assinaturas do próprio programa em `finalized`, de forma incremental, e guarda em memória só os
  eventos que a regra usa. Consequência: no devnet a página só funciona depois que o fundador reimplantar a API no
  servidor; isso é passo dele.
- **A rota não recebe carteira.** Mandar `?wallet=` juntaria a carteira e o IP do visitante no mesmo pedido, que passa
  pelo Cloudflare. A página lê a lista e acha a linha da carteira no próprio navegador. Quem passar das primeiras 1.000
  carteiras lidas vê que não está entre elas, e não "sem pontos".
- **Quando um resultado conta: quando é final.** Não só depois do `finalize`: no devnet ninguém finaliza sozinho (o
  keeper só resolve). Final é estar liquidando ou liquidada, ou ter a janela de 6 horas encerrada sem contestação, já
  que o programa recusa todo ato da equipe a partir do `review_ends_at`. Anulação não pontua; entrada contada como
  tardia (depois da prova de SIM) volta inteira e não pontua.
- **Carteira nos dois lados.** A Q7 ao pé da letra dá o ponto, e isso deixa o ranking ser vencido por quem entra com
  0,01 SOL nos dois lados de tudo. Foi construída a regra como decidida, com uma constante para trocar
  (`BOTH_SIDES_SCORE`), e a mudança virou pergunta ao fundador.
- **O exemplo da página de taxas em SOL, dividido por 100.** O caso da P1 §1.2 (600 e 400, prêmio de 450) vira 6 e 4
  SOL, com prêmio de 4,5 SOL: todas as razões ficam iguais (1,583 e 2,333 por 1). A página diz que o tamanho do prêmio
  em SOL depende do preço do SOL na abertura. Tudo sai do `snapshot` do SDK, a conta do `finalize`.
- **A tabela de poderes por papel e endereço, nunca por pessoa,** como o protótipo aprovado faz. Os endereços foram
  lidos do devnet nesta sessão (só leitura). A página confere cada papel na rede, no navegador, e diz quando a tabela
  ficou velha. A tabela diz que no devnet a autoridade de upgrade pode trocar o programa a qualquer hora, e que o build
  do devnet abre quatro dos cinco tipos.
- **"Report this campaign" leva à mesma conta do X do L-13,** como recomendado, numa constante. O remédio precisava
  existir de verdade para a tela poder prometê-lo: `content/unlisted.json`, mudado por commit com revisão de duas
  pessoas, tira a campanha da página inicial; a página da campanha diz isso; uma entrada malformada ou com dado pessoal
  derruba o build.
- **A lista dos avisos obrigatórios** ficou num arquivo só, com a tela e o componente de cada um; o teste renderiza as
  telas. O "Pago sozinho, ao fim da janela de 6 horas" da P1 §4.6 não entra: no devnet o fundador o trocou por "Waiting
  for payout", sem hora prometida.
- **O aviso do criador tinha duas redações** (a página e o cartão); ficou a da página.
- **Os dois achados da Sprint 12 deixados para esta sprint foram feitos:** o filtro de dado pessoal recusa domínio solto
  e as formas "@x" e "[@x]"; o site acha `content/` ou falha o build.
- **Os ícones do PWA** foram desenhados pelo Chromium fixado do smoke web (não há ferramenta de imagem na máquina), por
  um script que pode ser rodado de novo.
- **O post de resolução** é texto para uma pessoa postar: sem API do X, sem chave, e o tamanho é contado como o X conta
  (cada link vale 23).
- **X2.4:** o smoke web inteiro passou com o site construído e servido pelo próprio Bun 1.4.2 nesta máquina. O teste no
  servidor (Sprint 09) segue adiado com o resto do trabalho de servidor.
- **O `'unsafe-inline'` da CSP fica para a Sprint 16:** este Next escreve scripts próprios na página; um nonce exige
  renderizar cada página por pedido, mudança de execução do site que combina com a sprint de endurecimento.

## A revisão de privacidade (gate 5)

O ranking e o canal de denúncia passaram pelas nove perguntas (plano técnico, §8.2), com duas notas para o fundador:
quem sai do ranking se pedir (hoje não há como esconder uma carteira) e quem tem o acesso à conta do X. O que o
Cloudflare registra (C13) foi lido nas páginas do próprio Cloudflare: o IP e os dados de tráfego de cada pedido,
mostrados no painel da conta, sem prazo de guarda escrito; o Logpush agora existe também no plano gratuito
(`knowledge-base/tecnologia/cloudflare-logs-visitantes.md`). Falta ler no painel se algum envio de registros está ligado.

## As perguntas ao fundador

1. A fonte do ranking (recomendada a rota da API, construída).
2. L-09: o que a tela diz que os pontos valem depois do devnet (recomendado: não são dinheiro e nada é prometido).
3. Carteira nos dois lados: pontua ou não (recomendado: não pontua; construído como a Q7 diz).
4. L-24: o formato do relatório do parceiro e o que acontece com quem não posta.
5. Para onde leva "Report this campaign" (recomendado: a mesma conta do X).
6. BP-5 e BP-11 (recomendados, construídos).
7. As réguas dos três testes de demanda (recomendado: as da v0.0.2 para os testes 1 e 2; o 3 só medido no devnet).
