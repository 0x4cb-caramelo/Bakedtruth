# 2026-10-10 — Sprint 06: o modo real no servidor e o `ProofStale`, que é de tempo e não de renovação

## Pedido

O fundador confirmou o saldo da chave (1 SOL) e pediu: desligar o modo de teste (`KEEPER_DRY_RUN=0`), reiniciar a
unidade e implementar a renovação da prova de preço, para o caminho feliz funcionar de ponta a ponta no devnet.

## O que foi feito

- `KEEPER_DRY_RUN=0` no servidor e reinício da unidade `brot-keeper`. Sem reinícios indesejados.
- **Diagnóstico do `ProofStale`:** a regra da janela de prova (`programs/brot-markets/src/readers/price_touch/proof.rs`)
  exige que a prova tenha no máximo 60 s. A conta patrocinada da Pyth na devnet atualiza a cada 62 a 64 s. Com um ciclo
  de 60 s, o keeper lia às vezes uma conta com mais de 60 s e recebia `ProofStale`. Confirmado no diário: às 04:30:19
  as duas campanhas recusaram com `ProofStale`, e na leitura seguinte voltaram a `ProofDoesNotTouch`.
- **Correção aplicada:** ciclo de **15 s** (`KEEPER_CYCLE_MS=15000`). Com atualizações a cada 63 s, uma leitura a cada
  15 s cai dentro da janela de 60 s em todo ciclo de atualização. Custa mais chamadas ao RPC público (três campanhas,
  uma simulação cada).
- **Não foi implementada a renovação da prova postando um preço próprio.** Isso exige o serviço de preços da Pyth
  (Hermes), que responde 401 sem chave. A chave de teste grátis ainda não existe aqui, e não se deve inventar um
  caminho que não foi testado. Também não é o que trava hoje: a própria conta patrocinada já é a prova quando a leitura
  cai dentro da janela.
- **Campanhas atuais:** duas são de preço (`5w8f…`, alvo US$ 86.759, e `G6Un…`, alvo US$ 104.254, no sentido contrário
  ao preço, que está em torno de US$ 109.663); seus prazos estão a dias de distância, e o preço não tocou o alvo. A
  terceira (`Cufc…`) é de outro tipo e é "ainda não" para o programa. Nenhuma pode resolver agora.

## O que NÃO foi feito

- **Nenhum `resolve_campaign` real foi enviado**, e não há como provar um agora: exige que o preço toque o alvo de uma
  campanha aberta, dentro da janela. As três campanhas existentes não estão nessa condição.
- Não foi aberta uma campanha nova de teste. Isso gasta SOL da carteira de quem abre e muda o devnet, e é decisão do
  fundador (ver as opções na resposta).

## Pendências

1. Escolher como provar uma resolução real: abrir uma campanha de teste com alvo logo acima ou abaixo do preço atual
   (a carteira que abre paga a abertura em SOL de devnet), ou esperar um toque natural.
2. Renovação própria da prova (Hermes) só com a chave, que o fundador ainda não colocou.
