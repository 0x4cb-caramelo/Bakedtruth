# 2026-10-13 — O keeper liquida, envia com orçamento e vigia a cadeia (itens abertos das Sprints 06 e 07)

Feito pela faixa L07 da execução paralela do líder (o registro geral do dia está em
`2026-10-13-auditoria-do-roteiro-e-faixas.md`, no PR da Sprint 18). Nada foi instalado no servidor nem enviado à devnet.

## Decisões da faixa

- **A liquidação fica atrás de `KEEPER_SETTLE`, desligada a menos que o valor seja exatamente "on"** (qualquer outra
  palavra é recusada): se o keeper da devnet paga sozinho é decisão do fundador, ainda aberta.
- **O tally de um SIM de preço espera o fim da janela**; os outros resultados são contados na hora. Um tally cedo
  impediria o corte de voltar para uma prova anterior (`CutoffNotMovable`).
- **O envio espera a confirmação de cada transação**, o que limita a uns 15 a 30 por minuto. O ensaio de 1.000
  campanhas no Surfpool em menos de 60 s provavelmente pede envio concorrente, que não foi construído.
- **A segunda leitura antiga** (`second-read.ts`, que comparava dois provedores) fica com os seus testes, mas o standby
  não a usa mais; tirá-la é uma decisão para depois.

## O que fica com o fundador

Se o keeper da devnet paga (`KEEPER_SETTLE=on`): até lá, o alerta de campanha parada em liquidação se repete a cada 15
minutos por campanha cuja janela acabou. Os valores marcados [AC]: alerta de exposição em 100 SOL, 20 aberturas por
hora, sweep mínimo de 0,01 SOL, teto da taxa de prioridade de 1.000.000 microlamports por unidade (100.000 na
liquidação) e 0,001 SOL por transação.

## O que fica com o dono do servidor

A concordância com um usuário por unidade, e a instalação seguindo o cabeçalho da unidade: um valor no `keeper.env`
passa por cima do `Environment=` da unidade, então a unidade nova não pode ser copiada antes desses passos.

## Achados para depois

O `scripts/team/confirm.ts` não faz o tally antes de confirmar um SIM de preço dentro da janela; o
`findResolvedEvent` do SDK pede `maxSupportedTransactionVersion: 0`, então uma resolução enviada numa transação v1 não
apareceria nele (a devnet já tem transações v1).
