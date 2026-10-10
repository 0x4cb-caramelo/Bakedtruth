# 2026-10-10 — Sprint 06: abertura, e a prévia `/dev0x/` já estava no ar

## Pedido

Pedido de 10/10/2026, em duas partes: (1) verificar se as telas da Sprint -1 já estavam na `main` ou no ar, e, se
estivessem, pular a publicação em `/dev0x/` e abrir a Sprint 06; (2) abrir a Sprint 06 com as decisões do fundador:
valores reais, RPC da Helius e foco no caminho feliz do MVP.

## O que foi verificado

- As telas (`prototype-lab/campaigns/`) e a rota `/dev0x/` estavam na `origin/main` desde o PR #46 (commits
  `8b48a27` e `b05b4db`, mesclado em 10/10/2026). Por isso a publicação não foi refeita.
- Verificação ao vivo, só leitura: `https://brot.markets/dev0x/` responde 200 com `X-Robots-Tag: noindex, nofollow,
  noarchive` e a CSP do site. `https://brot.markets/dev0x` responde 302. A página inicial responde 200.
- **Não foi verificado:** o commit que o servidor roda hoje. Isso exige SSH no servidor compartilhado, e a abertura
  da sprint não precisa dele. Fica como item de conferência no primeiro acesso ao servidor (a checagem do Bun).

## O que foi decidido

- **Abertura da Sprint 06 em branch própria**, `sprint-06-keeper-server`, a partir da `origin/main` (`6b5e3ec`), em
  um worktree separado. A cópia principal ficou onde estava.
- **D4 respondida: RPC da Helius.** A chave fica como credencial no servidor, nunca no repositório. O plano de partida
  é o Developer (US$49 por mês), da proposta, para o devnet. O tamanho do plano sai dos créditos medidos nesta sprint,
  não da estimativa da proposta. Motivo: a instrução do pedido; o custo, US$49 por mês, está nas fontes da proposta
  (E40, lida em 6/10/2026). Não foi conferido de novo na página da Helius.
- **Valores reais.** O keeper roda contra o programa que já está no devnet (`5Rx8…n8o`), com as constantes reais, como
  decidido na Sprint 05. O teste de X1.1 com as constantes de teste (drill) não é o alvo; a rodada no devnet é a real.
- **Caminho feliz primeiro.** Ordem: uma campanha aberta, as entradas, a resolução, a finalização após a janela de
  revisão, a liquidação e os pagamentos, tudo feito pelo keeper sem ninguém acionar, no devnet. A checagem do Bun no
  servidor vem antes de tudo, como manda o plano.
- **Nada saiu da lista de pronto.** Os itens que não são o caminho feliz (casos de erro além dos testes listados,
  a carga de 1.000 campanhas, o teste de resistência do Bun, as identidades por unidade, a rotação do token do túnel e
  o script de publicação com volta atrás) continuam abertos e não entram na afirmação do caminho feliz.

## O que não foi feito

- Nenhuma conexão com o servidor. Nenhum `sudo`. Nenhum push, nenhum PR, nenhuma mescla.
- O comando de checagem do Bun ainda não foi rodado; é o primeiro passo da sprint, no servidor, e exige aviso ao dono
  do servidor compartilhado.
- O código do keeper ainda não existe.

## Pendências

- O dono do servidor precisa concordar com as identidades por unidade (T13). Continua aberto.
- P-7 (tesouraria) para a metade mensal da conversão de SOL. Continua aberto; a metade do reabastecimento não espera.
- Se a checagem do Bun falhar, o D-p volta ao fundador antes de qualquer outra coisa.
