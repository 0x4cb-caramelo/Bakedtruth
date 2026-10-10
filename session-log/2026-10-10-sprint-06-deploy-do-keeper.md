# 2026-10-10 — Sprint 06: o keeper no servidor, em modo de teste (dry run)

## Pedido e autorização

O fundador autorizou: uma chave nova de devnet para o keeper, com o endereço entregue para ele financiar (0,5 SOL,
dele, com a palavra "funded" de volta); um arquivo de ambiente root/brot para a URL do RPC, com o devnet público
por enquanto (a Helius entra depois, colada por ele no servidor); e a unidade do systemd com reinício em falha,
implantada no servidor compartilhado agora.

## O que foi feito

- **Chave:** gerada localmente, arquivo em `~/.config/brot-markets/` (modo 600, fora do repositório). Endereço:
  `BXnkrQMGxfU97WPeVHKLncEVsj6ackJ9Fkb5eFx8HALU`. Uma cópia foi enviada ao servidor, em
  `/etc/brot-markets/keeper-devnet.json` (root:brot, 0640), pelo SSH e sem arquivo temporário.
- **Ambiente:** `/etc/brot-markets/keeper.env` (root:brot, 0640), com o devnet público e `KEEPER_DRY_RUN=1`.
- **Bun 1.4.2:** movido para `/var/lib/brot-markets/bun/bun`; o SHA-256 continua `a83d26…dda0`, o pinado.
- **Código:** a versão `755798c` (a branch `sprint-06-keeper-server`, ainda não na `main`) em
  `/srv/brot-markets/keeper/releases/755798c`, com `current` apontando para ela. Dependências instaladas como `brot`.
  Os 10 testes do keeper passam no servidor.
- **Unidade:** `brot-keeper.service` (cópia em `deploy/vps/brot-keeper.service`). Usuário `brot`, reinício em falha após
  5 s, limite de 256 MB e 50% de CPU, sandbox (sem escrita em disco, sem porta pública). Habilitada e iniciada.
- **Conferido:** a unidade está ativa, sem reinícios; o `/healthz` local responde; o site da landing continua em `ok`.
  O `systemd-analyze verify` só reclamou de uma unidade do snapd, que não é nossa.

## O que o teste em modo de simulação mostrou

- O keeper listou **3 campanhas abertas** no devnet. Na primeira rodada, o programa recusou duas com `ProofStale` (a
  prova de preço está velha) e deixou uma como `NotYet`. Nenhuma foi enviada, por ser modo de teste.
- **A recusa `ProofStale` é um limite real do MVP:** o keeper usa a própria conta do preço como prova. Se ela não foi
  atualizada depois do prazo, nenhuma campanha desse tipo resolve. Atualizar a prova (o fluxo da Hermes e do
  receptor da Pyth) é trabalho pendente da sprint, e não está no caminho feliz de hoje.
- **Saldo:** a chave já mostra 1 SOL (`1000000000` lamports) no momento do teste. Não fui eu que a financiei (a torneira
  recusou), e o fundador ainda não respondeu "funded". Conferir a origem antes de qualquer envio.

## O que NÃO foi feito

- Nenhum envio ao devnet: o modo de teste continua ligado, e nenhuma campanha passou na simulação.
- A troca para o RPC da Helius: depende da colagem da URL pelo fundador no arquivo de ambiente.
- Nada de finalização, liquidação ou pagamentos.

## Próximo passo, à espera do fundador

1. Confirmar a origem do 1 SOL na chave. Se for o envio do fundador, responder "funded".
2. Só então: `KEEPER_DRY_RUN=0` e reiniciar a unidade, para que o keeper envie o `resolve_campaign` quando a
   simulação passar. Antes disso, uma campanha em condição de resolver precisa existir (hoje há prova velha).
