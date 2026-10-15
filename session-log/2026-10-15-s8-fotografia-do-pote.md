# 2026-10-15 — O S-8: a fotografia do pote conferida contra os livros da campanha

## A decisão

A terceira revisão adversária deixou um achado baixo, o S-8. O teto dos pagamentos (6179) e a checagem por entrada
(6180) confiavam nos números do próprio snapshot, a "fotografia do pote" tirada quando a campanha é decidida. Um erro
futuro que gravasse a fotografia errada pagaria um pouco a mais a cada vencedor, e todas as travas deixariam passar até
o teto recusar os últimos pagamentos. Hoje esse erro não existe. O Ronaldo, depois da explicação: "sim vamos corrigir
isso", antes do congelamento.

## O que mudou no programa (um agente novo, de contexto curto)

- **Na finalização**, o `check_snapshot` exige que o total de cada lado de um `Split` seja o pote daquele lado menos as
  entradas tardias (`SnapshotInconsistent`, 6102). Como roda só na finalização, nenhuma campanha já decidida passa por
  ele de novo.
- **No pagamento**, a devolução não tem taxa e paga no máximo o que a entrada pôs (6181). O pote de um lado só paga
  exatamente o que a entrada pôs menos a taxa arredondada para cima, e zero de taxa para o primeiro padeiro (6182).
- **A checagem por entrada do `Split`** (6180) calcula a parte antecipada pelos campos da entrada, sem o auxiliar do
  próprio pagamento.
- **O keeper** passa a avisar também nessas recusas.

## As conferências

1.155 testes TypeScript, 575 Rust e 577 da mainnet; o teste aleatório do dinheiro na semente fixa e em mais 12, sem
nenhuma recusa nova; a prova de mutação das três checagens novas; uma revisão adversária só de leitura antes do PR.

## A revisão e os dois ajustes

Uma revisão adversária só de leitura não achou campanha legítima recusada pelas regras novas, nem as decididas antes
da atualização. Ela deixou dois achados baixos, os dois sobre erros futuros. O primeiro padeiro agora é gravado uma vez
só, para a regra nova do pote de um lado só nunca discordar da marcação da entrada (L-1). A fotografia passa a conferir
também a taxa e o total a dividir (L-2). Depois disso: 1.156 testes TypeScript, 577 Rust e 579 da mainnet, as 13
sementes sem nenhuma recusa nova, a mutação das checagens novas, e uma revisão curta só dessa diferença.

