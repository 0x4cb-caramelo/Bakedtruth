# 2026-10-14 — O keeper novo com a segunda RPC, as mesclas do #92 e do #91, e a atualização do devnet adiada

## O pedido

O Ronaldo, por escrito: "mergeie 92 e 91, adicione o novo keeper e segunda RPC. que chave e palavra? faca o que voce
puder dai e depois me diga o que voce nao pode fazer." Depois ele escreveu a frase para atualizar o programa no devnet
com o `8af10e2` e publicar o site. Em seguida, antes que o líder enviasse qualquer coisa, mudou de ideia: "let's wait
for the Sprint 16 hardening (O-3 fix) before updating the program and the site". Nada foi enviado ao devnet.

## As mesclas

- **#92**, a Sprint 14 com a Sprint 15 e a parte do keeper, entrou como `98b6ece` (ponta `dc88743`, CI 38489960170).
- **#91**, as rotas do indexador pela API, ganhou a `main` com o #92 (só a tabela do roteiro e o CODEMAP conflitaram;
  1.115 testes passaram aqui, e o gitleaks não achou nada) e entrou como `8af10e2` (ponta `08a1b87`, CI 38491305134).
- O CI da `main` em `8af10e2` (38491785973) compilou o programa duas vezes do zero e deu o mesmo binário,
  `4a98884d…`, o mesmo do build daqui; o IDL do artefato é o do repositório, byte a byte.

## O keeper novo e a segunda RPC

- **Release `8af10e2`.** Um `git archive` da `main` subiu ao servidor com o SHA-256 conferido e foi instalado com
  `bun install --frozen-lockfile --filter @brot/keeper` como o usuário `brot`.
- **Antes, o ensaio na porta 4239.** Uma unidade transitória (`systemd-run`) rodou com uma cópia temporária do
  `keeper.env` mais `KEEPER_DRY_RUN=1` e a RPC B. A cópia ficou em `/run` e foi apagada no fim. Resultado: quatro
  ciclos, nenhum erro, nada enviado, a segunda leitura ligada.
- **A RPC B.** É a RPC pública do devnet da Solana, `https://api.devnet.solana.com`: de outro provedor que a Helius
  e sem chave. Ela foi acrescentada ao `keeper.env`, com o backup antes em
  `/etc/brot-markets/bak-20261014/keeper.env.before-8af10e2`.
- **No ar às 00h46 UTC.** Liquidação ligada, segunda leitura ligada, um ciclo a cada 15 s, sem falha e sem 429.
- **Volta atrás.** Apontar `current` para `releases/88a00f9`, restaurar o backup e reiniciar o `brot-keeper`.

## A chave e a palavra da atualização do devnet (o que foi respondido ao Ronaldo)

- **A chave.** A de upgrade do programa, a dele: endereço público `6N7rUnJ88yyBiZmGEn3DjyyX9AEtmwzXNGUsps2A4wcq`, com
  4,595 SOL. O líder não abriu o arquivo.
- **A conta do programa.** Tem 169.816 bytes, e o binário novo, 201.624. A extensão pedida é de pelo menos 31.808
  bytes, não tem volta e custa por volta de 0,3 SOL.
- **O site.** Precisa ser publicado logo depois da atualização: até o build novo estar no ar, ele não assina (A-8).
- **Quando.** Adiada pelo Ronaldo até a correção do O-3 entrar. Com o commit novo, o líder volta a pedir a confirmação.

## Visto de passagem

A campanha `2d8idLe9…` (toque de preço acima do alvo, prazo em 12/11) era recusada com `ProofStale` a cada ciclo do
keeper antigo. O preço passou do alvo, mas a conta da Pyth no devnet estava sem atualização recente, e o programa
recusa uma prova velha, como deve. Ela se resolve na próxima atualização do preço ou no prazo.
