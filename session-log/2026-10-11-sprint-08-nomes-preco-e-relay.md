# 2026-10-11 — Sprint 08, segunda parte: os nomes, o preço e o relay

## Ponto de partida

- A `main` estava em `5bf3636`, a mescla da Sprint 19 (PR #68, tag `sprint-19`). A API de leitura do MVP da Sprint 08
  (`services/api`: health, a lista, cada campanha e, desde a Sprint 13, o ranking) já estava nela, vinda da branch
  `sprint-08-read-api`.
- O Ronaldo pediu "as peças que faltam da Sprint 08", no recorte que eu tinha proposto: a rota dos nomes, a do preço e
  o relay com o bloqueio por país. O indexador em SQLite fica para depois.
- A branch `sprint-08-price-names-relay` saiu da `origin/main` sem acompanhar a `main` (o envio vai sempre pelo nome).

## Decisões, e por quê

- **O escopo, em três passos verdes** (o Ronaldo, 11/10): primeiro `/api/v1/names` e `/api/v1/price` na API de
  leitura, que destravam os dois itens que a caixa de abertura esperava; depois o `services/rpc`. Implantação, túnel e
  Cloudflare ficam com o fundador.
- **O preço: CoinGecko com a Pyth de reserva** (o Ronaldo, 11/10), com a condição de uma checagem jurídica dos termos
  do CoinGecko antes de rodar em público. Li a documentação do CoinGecko em 11/10: a chave do plano Demo vai no
  cabeçalho `x-cg-demo-api-key` em `api.coingecko.com`, a do pago no `x-cg-pro-api-key` em `pro-api.coingecko.com`, e
  existe a API sem chave, atualizada a cada 60 s. Os termos pedem "Powered by CoinGecko" em qualquer plano (o plano
  técnico citava "Data provided by CoinGecko", da página de preços), desencorajam guardar os dados e proíbem
  redistribuir o acesso sem contrato. A chave, quando houver, vai num cabeçalho, nunca na URL.
- **O preço vale só para exibição.** O programa cobra a abertura pela Pyth que ele mesmo lê; a rota diz isso em cada
  resposta (`use`). O CoinGecko com mais de dez minutos não vale; a Pyth entra no lugar. A diferença entre os dois vai
  para o log, e acima de 2% como `price-gap`, para o caminho de alertas.
- **As regras dos nomes foram para o SDK** (`parseAccountNames`), porque o site, a API e depois o app precisam das
  mesmas.
- **O bloqueio por país existe, mas vazio** (o Ronaldo, 11/10: "dont block nothing yet"). A lista
  `GEO_BLOCK_COUNTRIES` vem vazia; uma sigla que não tenha duas letras impede o relay de subir, para um erro de
  digitação não virar bloqueio de ninguém sem ninguém saber.
- **Uma conta de dono que nenhum leitor aceita volta com o dono e o tamanho, sem os dados**, em vez de nula, como o
  documento da lista do relay já permitia: assim a caixa de abertura continua dizendo de quem é a conta, e o relay não
  serve os bytes de outro programa.
- **O typecheck da raiz passou a cobrir `services/`.** O CI só rodava o typecheck de `tests/`, `scripts/` e
  `packages/`; um erro de tipo na API ou no relay passaria.

## O que o teste na web achou, com o relay no meio

O `E2E_RELAY=1` põe o relay entre o navegador e a cadeia de teste, em todas as cenas. Na primeira rodada, 6 falharam:

- **Um defeito real do relay:** o cache guardava a `GlobalConfig` por 1,5 s. Depois de despausar, a página recarregada
  dentro desse tempo continuou dizendo "Entries are paused". O programa recusa o que estiver errado, mas a página age
  sobre as contas do próprio programa, então o cache passou a guardar só as contas de outros programas e os sysvars,
  nunca a config, uma campanha ou uma entrada.
- **Um defeito do teste:** o endereço da RPC que o teste de "rede fora" corta não chegava aos processos do Playwright,
  então o corte caía na porta errada. O executor agora passa o endereço para eles.
- As outras quatro falhas eram consequência da segunda: o teste deixou o preço velho para os seguintes.

## As revisões

- **A jurídica e de privacidade** (`docs/legal/2026-10-11-sprint-08-legal-review.md`) leu os termos do CoinGecko de
  5/9/2025: atribuição "Powered by CoinGecko" em qualquer plano, nenhum uso "for or to promote gambling", nada de
  redistribuir o acesso sem contrato, termos de uso próprios com as cláusulas deles antes de tudo, a API sem chave fora
  de uso em produção e o Demo para testes, com 10.000 chamadas por mês. Nenhum plano cabe hoje, então o CoinGecko ficou
  desligado por padrão e a rota serve o preço da Pyth, o mesmo que o programa cobra. A condição que o Ronaldo pôs na
  escolha ("uma checagem jurídica antes de ir ao ar") foi o que decidiu isso. Ela também pediu que o relay esqueça o
  IP de quem parou de chamar em cerca de um minuto, não depois de mil chamadas: entrou uma varredura a cada 10 s. O
  texto da privacidade para o dia em que o site passar a usar o relay está pronto no relatório, sem publicar.
- **A de segurança** não achou nada alto e achou seis médios, todos corrigidos: um valor hostil numa opção (e, na API de
  leitura, `?state=constructor`) fazia o serviço responder com a pilha inteira do erro; um processo local podia forjar
  os cabeçalhos do Cloudflare; uma origem só podia gastar o orçamento diário de todos; a unidade não conseguia rodar o
  Bun com o próprio usuário e deixava a chave no ambiente. Agora há opções tipadas, uma resposta genérica para qualquer
  erro, `development: false` (no servidor de saúde do keeper também), um cabeçalho secreto que o túnel acrescenta, um
  balde por /48, uma reserva do orçamento para assinar, o grupo `brot-bun` e as credenciais pelo `LoadCredential=`. A
  regra de limite do Cloudflare em `/rpc` virou pré-condição da rota.

## O que fica com o fundador

- Seguir os passos de `deploy/vps/README.md` ("The relay"): a conta de RPC do relay com limite de gasto (D4), o usuário
  e o grupo `brot-bun`, os dois arquivos de credencial, as duas regras do Cloudflare (o limite por IP em `/rpc` e o
  cabeçalho `x-brot-tunnel`), a unidade, a rota `/rpc` do túnel por último, e o texto da privacidade no mesmo dia.
- O CoinGecko (D4): escrever ao suporte deles sobre a cláusula de "gambling" e sobre mostrar o preço por uma API
  própria, ou tirar o CoinGecko do plano e ficar com a Pyth.
- Conferir no servidor se o `CF-IPCountry` chega pelo túnel (C9), antes de qualquer país entrar na lista.
