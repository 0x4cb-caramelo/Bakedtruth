# 2026-10-14 — O #93 na `main`, o programa do devnet atualizado e o site publicado

## O pedido

O Ronaldo, por escrito: "pode mesclar o #93, atualizar o programa no devnet com o binário do CI da main depois dele e
publicar o site". Ele havia pedido, na noite anterior, que a atualização esperasse a correção do O-3; ela estava no #93.

## O que foi feito, em ordem

1. **A mescla.** O #93 entrou como `a5e6014`, com o CI verde no commit da ponta (`fcedeaf`). O CI da `main` compilou o
   programa duas vezes do zero e publicou o binário: `86ecf1c8…`, 205.576 bytes, o mesmo do build daqui. O IDL do
   artefato é o do repositório, byte a byte.
2. **Antes de enviar, só leitura.** O endereço público da chave de upgrade nesta máquina é a autoridade do programa
   (`6N7r…4wcq`), com 4,595 SOL. A conta do programa tinha 169.816 bytes. A RPC da Helius foi usada por um arquivo de
   configuração temporário, legível só pelo dono, e cada saída passou por um filtro que esconde a chave. O arquivo foi
   apagado no fim.
3. **A extensão.** A conta cresceu 40.960 bytes, até 210.776, e custou 0,208 SOL: o devnet cobra 5.080 lamports por
   byte, então ficou abaixo dos ~0,3 SOL estimados. Não tem volta.
4. **A atualização.** O programa foi implantado no slot 510.863.588. Lido de volta, os primeiros 205.576 bytes têm o
   hash do artefato e o resto é zero. A autoridade não mudou. A chave ficou com 4,386 SOL, porque o aluguel do buffer
   voltou.
5. **O site.** A release `a5e6014e42f3` foi compilada no servidor; o build diz "A-8: this build is for the program
   deploy at slot 510863588". Ela foi testada na porta 4239 com uma unidade transitória: as oito páginas responderam
   como as da release no ar. Depois veio a troca (antes `353c2a3a1b90`) e o reinício do `brot-api` e do `brot-site`,
   por volta de 04h21 UTC. A API diz `ok`, com `program_last_deploy_slot` 510863588 e as entradas abertas. De fora,
   `brot.markets/dev0x` responde 200 com `noindex`. O ranking se completou em poucos minutos. As rotas do indexador
   respondem 503, como devem enquanto ele não estiver instalado.
6. **O keeper** recusou uma simulação no slot exato da atualização (`UnsupportedProgramId`) e seguiu normal.

## O que não foi conferido

Uma entrada de verdade no site novo, com uma carteira, fica com o Ronaldo.

## O caminho de volta

Para o site, apontar `current` para `353c2a3a1b90` e reiniciar os dois serviços. Para o programa, só implantando de
novo o binário anterior (`63610a32…`, do artefato do CI de `df09357`).
