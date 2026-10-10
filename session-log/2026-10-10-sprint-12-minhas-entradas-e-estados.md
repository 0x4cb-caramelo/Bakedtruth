# 2026-10-10 — Sprint 12: minhas entradas, os estados da campanha, o resgate da reserva e o ensaio no devnet

## Ponto de partida

- A Sprint 11 estava mesclada (PR #60, tag `sprint-11`). A Sprint 12 foi aberta da `origin/main` nesse ponto, na branch
  `sprint-12-site-my-entries-states`, com o prompt de seis blocos que a sessão anterior deixou e as respostas do
  fundador coladas junto.
- O binário local do programa (`target/deploy/brot_markets.so`) foi conferido contra o artefato do CI da `main` (run
  38065802976): o mesmo SHA-256 e o IDL igual ao do SDK. Os 3 testes do `cpi-proxy` seguem falhando só nesta máquina,
  porque o artefato não traz esse programa de teste; o CI roda os três.

## As respostas do fundador (registradas aqui, na sprint e no roteiro)

1. **L-01:** as rotas são `/my-entries` e `/record`.
2. **L-04:** o estado com o pagamento pausado chama-se "Contested".
3. **L-13:** resultado errado se reporta na conta oficial no X, https://x.com/brotmarkets. A página da campanha mostra
   o link, simples (sem script do X, K-10), em todo estado depois da leitura do resultado.
4. **O texto do pagamento no devnet:** até o keeper liquidar (tarefa de servidor separada), a tela diz "Waiting for
   payout" e não promete hora. No devnet isso substitui "Pago sozinho, ao fim da janela de 6 horas" da sprint.
5. **As cinco campanhas do ensaio são do fundador:** a primeira entrega foi a receita só de leitura, com tipo, mint ou
   feed, meta, datas, carteira e comando de cada uma.

## Decisões tomadas na sprint, e por quê

- **O histórico vem da rede, não da API.** A rota `/api/v1/wallets/:address/entries` é da Sprint 08 e não existe; o
  indexador também não. Como a liquidação fecha a `Entry`, o que a carteira recebeu só existe nos eventos. A página lê
  as transações da própria carteira (`getSignaturesForAddress`, 50 por vez, com "Read older transactions"), decodifica
  pelo SDK e soma só `EntrySettled`, `CreatorShareSettled` e `PrizeSettled`. As entradas abertas vêm das contas `Entry`
  de cada campanha que a API lista ou que o histórico cita. Alternativa recusada: escanear as contas do programa pelo
  navegador (`getProgramAccounts` não está na lista do relay e custaria caro).
- **O dinheiro é o espelho do SDK.** Entrou no SDK `math/stored.ts`, que espelha o que o programa paga a partir da
  campanha guardada (`pot_rule`, `prize_return`, a parte do criador, o `input_of` do snapshot), testado contra cada
  pagamento real no LiteSVM. O site não recalcula regra nenhuma.
- **O piso do "Receive" é o mínimo de aluguel mais a taxa,** não o que o programa confere. O criador assina e paga a
  taxa, e a rede recusa um pagador de taxa que fique abaixo do mínimo; o teste mostrou isso no LiteSVM (um lamport a
  menos e a transação não entra).
- **A tela não diz que o keeper tenta de novo todo dia.** O keeper do servidor só resolve; prometer isso seria prometer
  o que o devnet não faz. A sprint registra o desvio.
- **Valores exatos ao lamport** para o que a carteira tem, espera ou recebeu; só estimativa leva "est." e arredonda. Por
  isso o smoke da Sprint 11 passou a ler "0.5 SOL" em vez de "0.5000".
- **Campanha fechada não é "não encontrada".** Depois do `close_campaign`, a página diz que a campanha foi fechada
  depois dos pagamentos e manda para `/my-entries`.
- **O formato público do void log** ficou no SDK (`@brot/sdk/schemas`, zod), com o JSON Schema gerado e checado no CI;
  a regra de dado pessoal passou a ser uma só, usada pelo script da equipe e pela checagem. O registro aceita também uma
  correção, que nomeia o registro corrigido, porque o README já dizia que correção é um arquivo novo.

## O ensaio no devnet

- A receita está em `deploy/devnet/rehearsal-sprint-12.md`: C1 SIM (queima de um mint do fundador, abertura paga, com a
  parte do criador reservada e resgatada), C2 NÃO (equipe, grátis), C3 anulada (stake pool que ninguém atualiza:
  `MissedWindow`), C4 pote de um lado só, C5 abertura paga sem entrada (o prêmio volta, os 10% ficam). Cerca de 82 horas
  a partir do início e uns 9,7 SOL de devnet mais 1 SOL depois (quase tudo volta).
- **O que não dá para forçar no devnet:** a anulação por feed parado (`StaleFeed`) e o estado contestado (fechado até a
  Sprint 14). Os dois estão cobertos nos testes e no smoke web.
- Dois scripts novos, testados contra o programa no LiteSVM (não em surfnet nem no devnet): `scripts/rehearsal/open-paid.ts`
  e `scripts/rehearsal/settle.ts`. Nada foi enviado ao devnet por esta sessão.

## O que continua aberto (do fundador)

1. A aprovação do texto da campanha sem nenhuma entrada ([Q]).
2. O aviso L-03, aprovado na Sprint 11, termina com "Payouts go to your wallet automatically after the result is read",
   o que o devnet ainda não faz. Mudar o texto é decisão do fundador.
3. A entrada com a Phantom da Sprint 11 segue "relatada, não verificada" até chegar a assinatura ou o endereço da
   carteira no devnet.
4. O ensaio das cinco campanhas (as escritas no devnet são dele).
