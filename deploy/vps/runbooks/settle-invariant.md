# Runbook: uma liquidação recusada por um invariante de dinheiro

**Alerta:** `settle_invariant`, uma vez por campanha. O programa recusou um passo de liquidação (pagar uma entrada, a
parte do criador, o prêmio, a taxa ou o fechamento, ou a finalização) com `InvariantViolated` (6101),
`SnapshotInconsistent` (6102, a fotografia do pote não bate com os livros), `PaidOutAboveSnapshot` (6179),
`EntryPayoutAboveShare` (6180), `RefundPayoutAboveEntry` (6181) ou `OneSidedPayoutNotExact` (6182). A linha traz a
campanha, o passo e o código.

**O que significa.** Os livros da campanha não batem com o cofre ou com o snapshot: o programa travou o pagamento antes
de mover um lamport, como deve. Nenhuma liquidação que o programa produz chega aqui; é um defeito no código ou um
estado que não devia existir. Repetir não resolve: o keeper continua tentando com espera, e cada tentativa é recusada
do mesmo jeito.

**Quem age.** O CTO, e a chave da equipe de plantão para a pausa.

**Como.**
1. Pause as entradas (`scripts/team/pause.ts --cluster <rede> --yes`, [incident-plan.md](incident-plan.md)): novas
   entradas param; pagamentos e reembolsos de outras campanhas seguem.
2. Leia a campanha (`scripts/rehearsal/settle-steps.ts status`) e compare `paid_out_total`, `one_sided_fees`, as
   flags e o snapshot com o saldo do cofre e com a matemática do SDK (`snapshot`, `entryPayout`).
3. Ache o passo que o programa recusou e a transação de cada pagamento já feito na campanha (o histórico do
   indexador).
4. Não force nada pela mão: a correção é uma atualização do programa, revista e aprovada como manda o plano de
   incidente. Registre tudo no `session-log/`.

**Prazo.** Pausa no mesmo turno do alerta; a análise começa em até 1 hora.
