# 2026-10-10 — Sprint 11 fechada: o relato do teste com a Phantom, a conferência no devnet e a mescla

## Ponto de partida

- O PR #60 estava aberto, mesclável e com o CI verde em `a32acac` (a A-8 e o piso de 1%). A regra que o próprio
  Ronaldo deu para a mescla: depois da A-8 pronta e do teste de dez minutos com a Phantom no devnet, feito na própria
  máquina.
- O Ronaldo relatou: "The 0.01 SOL entry went through perfectly, the transaction was signed, and the UI reacted exactly
  as expected." Pediu a mescla do PR #60, a Sprint 11 marcada como concluída nos documentos, a tag `sprint-11` e o
  prompt do próximo agente para a Sprint 12, no formato de seis blocos (papel, tarefa, contexto, raciocínio, condições
  de parada, saída).

## A conferência no devnet (fatos)

- Feita só por leitura, às 15:45 UTC, pela RPC pública do devnet e por uma segunda RPC (Helius; a chave fica fora do
  repositório e não foi impressa).
- `getSignaturesForAddress` do programa (`5Rx8…9n8o`), nas duas RPCs: a última transação é das 04:48:46 UTC, uma
  abertura de campanha (duas contas criadas, de 3.251.200 e 650.240 lamports), logo depois de uma tentativa recusada
  às 04:46 com `DurationTooShort` (6051). Nenhuma transação do programa depois disso.
- O primeiro commit do código da entrada no site é das 08:29 UTC; o da A-8, das 10:10 UTC. Nenhuma entrada feita pelo
  site da Sprint 11 chegou, portanto, ao programa no devnet.
- A página só mostra "You're in" quando a RPC dela devolve a assinatura como `confirmed` ou `finalized`
  (`app/features/entry/watch.ts`). **Inferência, não conferida:** o teste passou por outra RPC, outro cluster ou outro
  programa (por exemplo, um `app/.env.local` diferente do `app/.env.example`), ou rodou em outro ambiente.
- O programa não foi atualizado nesse meio-tempo: o ProgramData continua no slot 509.389.614, o mesmo que o build da
  A-8 grava. O site construído para a A-8 continua valendo.

## Decisão

1. **Mesclar mesmo assim, como pedido.** A mescla não publica nada: o CI não faz deploy, e o site novo não está no
   servidor. O código passou em todas as verificações automáticas, e a assinatura com carteira de teste injetada roda
   no smoke web. A decisão de mesclar é do fundador, que a tomou duas vezes na mesma conversa.
2. **Registrar o teste como relatado, não como verificado.** A sprint, o roteiro, o CHANGELOG e o PR dizem que o
   fundador relatou o teste e que a transação não foi encontrada no devnet. A entrada assinada com carteira real fica
   em aberto até a assinatura aparecer.
3. **Pedir a assinatura** (na atividade da Phantom) ou a RPC do `app/.env.local` usado no teste.

## O que foi feito

- Documentos: a sprint (estado, registro, definição de pronto, retrospectiva), a linha 11 do roteiro, o CHANGELOG, este
  registro e o índice. O texto do PR #60 ganhou o fechamento.
- O PR #60 mesclado na `main` com um commit de mescla, como os anteriores; a tag anotada `sprint-11` no commit de
  mescla. A branch fica no GitHub, como as das outras sprints.
- O prompt da Sprint 12 entregue ao Ronaldo, no formato pedido.

## O que a Sprint 12 encontra (anotado no prompt)

- A API de leitura (`services/api`) serve só `campaigns`, `campaigns/:address` e `health`: não existe a rota das
  entradas de uma carteira que a sprint pede para o histórico.
- O programa no devnet usa as constantes reais (campanha de no mínimo 3 dias, janela de revisão de 6 horas, entradas
  fechando 24 horas antes do prazo): o ensaio de cinco campanhas no devnet não cabe numa sessão.
- Seguem abertas as decisões L-13 (o canal público para contestar um resultado), L-04 (o nome público do estado com o
  pagamento pausado) e o texto da campanha que termina sem entradas ([Q]).

## Pendências

1. **Fundador:** a assinatura da entrada de 0,01 SOL, ou a RPC do `app/.env.local` usado no teste.
2. As da A-8 continuam: o relay `/rpc` com a regra do ProgramData (Sprint 08) e construir o site de novo a cada
   atualização do programa.
3. Sprint 12: L-13, L-04 e o texto da campanha sem entradas.
