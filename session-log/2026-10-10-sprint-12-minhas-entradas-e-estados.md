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

## As revisões

- **Texto (31 achados, 7 obrigatórios), aplicados:** a regra da revisão dizia que a equipe pode anular o resultado,
  o que é falso (só anula um anulamento automático, nunca um SIM ou NÃO); o recibo da entrada da Sprint 11 dizia
  "Paid automatically"; "met late" afirmava quando a meta foi atingida, o que o programa não sabe; o pote de um lado
  não dizia que a Brot fica com os 10%; o rascunho da campanha sem entrada se contradizia ("nada a pagar" e "o prêmio
  volta"). Ficaram para o fundador: o aviso L-03 (aprovado) e o chip "Paid" enquanto o pagamento espera, que é nome
  de estado do BP.
- **Segurança (nenhum crítico ou alto), aplicada:** a parte reservada que o `close_campaign` paga junto com o aluguel
  não aparecia como recebida, porque o programa não emite `CreatorShareSettled` nesse caso (agora o site lê o
  `CampaignFinalized` da própria campanha; o certo é o programa emitir o evento na próxima atualização); uma rajada de
  mais de 50 transações entre duas atualizações deixava uma lacuna escondida no histórico (agora a atualização volta
  até encontrar o que já leu); "If this result stands" era exato antes do tally das entradas atrasadas (agora é
  estimativa). Os baixos também: "entrou" e "fechada" só por evento do programa, o texto do anulamento em LF antes do
  hash, o teste dos bytes entregues à carteira, o piso pelo `claimFloor`. O que ficou para depois está no plano
  técnico, §7.3.

## O que continua aberto (do fundador)

1. A aprovação do texto da campanha sem nenhuma entrada ([Q]), no rascunho revisado: "Nobody entered this campaign, so
   there are no entries to pay. The prize goes back to whoever opened it, and Brot keeps the 10% opening fee, as it
   does whenever nobody enters." Com uma consequência a confirmar: num anulamento por falha da casa sem nenhuma
   entrada, a Brot também fica com os 10% (é o que o programa faz).
2. O aviso L-03, aprovado na Sprint 11, termina com "Payouts go to your wallet automatically after the result is read",
   o que o devnet ainda não faz. Mudar o texto é decisão do fundador.
3. A entrada com a Phantom da Sprint 11 segue "relatada, não verificada" até chegar a assinatura ou o endereço da
   carteira no devnet.
4. O ensaio das cinco campanhas (as escritas no devnet são dele).
5. O chip "Paid" aparece enquanto o pagamento ainda espera; é nome de estado do BP (BR-05).

## As respostas do fundador (10/10/2026, depois do PR)

O Ronaldo colou as respostas: "1a, 2a, 3a", a assinatura da Phantom não está à mão (fica "relatada, não verificada",
sem travar) e ele roda os scripts do ensaio. Aplicado no mesmo PR:

- **1a:** o texto da campanha sem entrada fica como no rascunho revisado, e vale a consequência (anulamento por falha da
  casa sem nenhuma entrada: a Brot fica com os 10%).
- **2a:** o L-03 no devnet: "Your entry stays locked until the campaign ends. You cannot take it out before then.
  Payouts go to your wallet after the result is read; on devnet that is not automatic yet, and no time is promised."
  Quando o keeper liquidar, voltar ao texto original é nova decisão do fundador.
- **3a:** o chip de uma campanha paga diz "Result final" até as entradas serem pagas e "Paid" depois. O estado público
  (BR-05) não muda; muda só o rótulo enquanto espera.
- O pedido de mesclar e marcar a tag veio só no texto colado, sem nada digitado em volta; como a mescla na `main` é
  difícil de desfazer, a confirmação foi pedida antes de executá-la.
