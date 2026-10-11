# 2026-10-10 — Sprint 19: a caixa de abertura em `/abrir`

## Ponto de partida

- A `origin/main` contém a tag `sprint-13` (conferido com `git merge-base --is-ancestor`), com os PRs #64 (a regra 3a
  dos pontos), #65 (as páginas legais) e #66 (os detalhes do fundador na privacidade, a linha de 18 anos e o
  docs.brot.markets fora do ar). A branch `sprint-19-site-open-campaign` saiu de `70fc29b`.
- O binário local do programa é o do artefato do CI da `main` (run 38094571074, SHA-256 `cf2359…a3a8`). Os 3 testes do
  `cpi-proxy` falham só nesta máquina, como sempre.
- O SDK da Sprint 05 já tinha as regras da abertura (`validateOpenCampaign`, a cotação, `prepareOpenCampaign` e os
  testes de paridade contra o programa). A sprint é a camada do site por cima deles; nada mudou no programa nem no SDK.
- As cinco perguntas ao fundador foram feitas no começo, numa lista só (abaixo), e o trabalho seguiu sem esperar.

## Decisões tomadas na sprint, e por quê

- **A margem do `max_lamports` é 1%.** É o "quote + 1%" do desenho aprovado na Sprint -1. Em US$ 500 isso cobre uma
  variação de uns US$ 5 entre a prévia e a assinatura; o SOL/USD do devnet atualiza a cada 62 a 64 s, e um movimento
  de 1% num minuto é raro (inferência, não medida aqui). Acima dela o programa recusa e nada é cobrado. Uma margem maior deixaria quem abre pagar
  mais do que viu; uma menor faria aberturas honestas falharem.
- **A frase é o modelo v1 de cada tipo, numa função só, a de todas as páginas.** Antes, só a de preço era uma frase; as
  outras diziam "Burn campaign So11…1112". Se a caixa escrevesse a sua própria frase, o que quem abre lê seria diferente
  do cartão e da página. A frase de preço não mudou; as outras ganharam o alvo. As contas aparecem pelo endereço
  encurtado; o nome revisado aparece ao lado, na caixa, nunca dentro da frase, porque só a caixa lê a lista de nomes.
- **Os nomes vêm de `content/account-names.json`, vazio, e da lista fixa da Pyth.** A rota `/api/v1/names` da Sprint 08
  não existe. O arquivo segue a regra dos outros de `content/`: muda só por commit revisado por duas pessoas, e um nome
  que pareça link, @handle ou pessoa quebra o teste. Nome não é portão (D-i): conta sem nome também abre.
- **O US$ mostrado é o dos termos da abertura e o preço da Pyth que o programa cobra, com a hora.** A rota
  `/api/v1/price` (CoinGecko, D-e) não existe. Os US$ 500, 450 e 50 são os termos; o SOL é o que o programa cobra.
  Nenhuma segunda fonte de preço entra até a rota existir.
- **As leituras passam pela RPC do site, a pública do devnet,** como na entrada da Sprint 11, porque o relay `/rpc` não
  existe. A lista do relay (`docs/technical/relay-allowlist.md`) ganhou o que a caixa chama. A recusa por país, que é do
  relay, espera por ele.
- **O id sorteado é da página, guardado no "Review and sign".** O DoD pede guardar antes de entregar à carteira; guardar
  já ao conectar deixaria um registro com a carteira no navegador de quem só olhou. O mesmo id vale para toda
  reconstrução; depois de uma abertura (desta carteira ou de outra no mesmo id) a página sorteia outro.
- **A segunda testemunha da guarda lê a própria rede.** Com o registro apagado, o plano mandava perguntar ao indexador,
  que não existe. A caixa lê as transações recentes da carteira (até 20 assinaturas, 5 transações, da última meia hora),
  só antes de uma abertura paga sem registro, e oferece a campanha que achar. A RPC vê o endereço da carteira com o IP,
  como já vê em "My entries"; a privacidade diz isso.
- **A recusa aparece no campo dela, e o botão diz a primeira.** Cada recusa tem lugar (o tipo, a conta, o alvo, o prazo,
  o valor, a caixa, ou só depois de assinar), mensagem e etiqueta curta; a linha do plano (1 a 10) não vai para a tela.
  Uma regra é só da caixa, mais rígida que o programa: o prazo precisa de 10 minutos além dos 3 dias, para a transação
  caber na regra quando chegar.
- **No lugar do cartão de compartilhar, o cartão da lista.** O cartão de compartilhar (`opengraph-image`) ficou para
  depois na Sprint 10 e não existe; mostrar uma imagem que o X nunca vai mostrar seria prometer algo falso.
- **A chave da equipe abre só de graça,** como o DoD pede: sem `opening_usd`. O prêmio da equipe (C44), que o programa
  aceita, não tem tela nem script ainda.
- **O teste na web roda no LiteSVM,** como o da Sprint 11, e não no Surfpool: o mesmo binário, com as contas da Pyth
  capturadas, no mesmo processo.

## O que mudou em relação ao desenho da Sprint -1

- Queima, trava e pool de stake abrem agora (o programa abre quatro tipos desde a Sprint 03); o protótipo marcava
  "Opens later". O stake de validador segue fechado até o SIM no devnet.
- A lista de feeds é a lista compilada do programa (17 no devnet), lida ao vivo; os que não servem agora ficam atrás de
  um "N more listed feeds, not usable right now".
- Saíram os botões de revisão do protótipo ("Review aid") e o "Share on X" da tela final.
- A opção "Add a prize" da equipe saiu, pelo DoD.
- "The team can only confirm or void a result, within 6 hours" virou "during the review window": o teste de texto
  proíbe prometer prazo.

## O texto de cada recusa

Está em `app/features/open-campaign/copy-refusals.ts`, uma entrada por erro do programa com linha no plano; o teste
`tests/site/open-refusals.test.ts` falha quando falta uma. Em resumo: linha 1, o tipo que não existe ou ainda não abre;
linha 2, a conta de outro dono, de outro formato, a cunhagem ainda viva, o pool que parou de atualizar; linha 3, o alvo
já atingido, perto demais (1%, contado da borda da faixa de confiança no preço) ou impossível; linha 4, o feed fora da
lista, não verificado, velho, incerto demais, sem preço válido; linha 5, o prazo fora de 3 a 90 dias e a época já
começada ou depois do prazo; linha 7, menos de US$ 500, o preço que passou do máximo (nada cobrado), o SOL/USD velho
(aberturas pagas esperam; a equipe abre), incerto ou inutilizável; linha 8, a pausa, o limite de campanhas abertas e os
termos que mudaram desde a prévia; linha 9, transação malformada; linha 10, o id que já tem campanha.

## Perguntas ao fundador (feitas no começo, nenhuma trava o PR)

1. A abertura no devnet, paga e da equipe, e a conferência só de leitura: (a) depois da mescla, com os passos no
   `deploy/devnet/README.md`; (b) depois do site no servidor. Recomendado (a).
2. A privacidade publicada antes de `/abrir` ficar público: (a) publicar a landing antes; (b) tirar a leitura da RPC.
   Recomendado (a), construído.
3. Nomes de contas: (a) nenhum além da Pyth, a equipe adiciona com duas revisões; (b) o fundador nomeia alguns já.
   Recomendado (a), construído.
4. O US$ ao lado do SOL: (a) os termos e o preço da Pyth até a rota existir; (b) travar a caixa até a Sprint 08.
   Recomendado (a), construído.
5. Os celulares reais (Phantom e Solflare, Android e iOS), com a lista nova.
