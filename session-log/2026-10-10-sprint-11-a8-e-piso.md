# 2026-10-10 — Sprint 11: a A-8 (pausa na atualização do programa) e o piso de 1%

## Ponto de partida

- A Sprint 11 estava pronta no PR #60 (`7240c66`, CI verde), com duas perguntas ao fundador: de onde ler o ProgramData
  para a A-8 até o relay `/rpc` existir, e se o piso que o baker assina fica em 1% abaixo da estimativa.
- O Ronaldo respondeu as duas pela opção (a): ler o slot do último deploy pela RPC pública do devnet agora, dentro do
  SDK; manter o piso em 1% no devnet. Ele fará o teste de dez minutos com a Phantom no devnet na máquina dele, sem que
  eu espere o resultado, e o PR #60 só será mesclado depois da A-8 pronta e do teste dele. Pediu também que a leitura do
  ProgramData entrasse em `docs/technical/relay-allowlist.md`, e que a Sprint 12 não começasse.

## Decisões do fundador (10/10/2026)

1. **A-8 lê o ProgramData pela RPC pública do devnet**, no SDK, até o relay `/rpc` da Sprint 08 existir.
2. **O piso fica em 1% abaixo da estimativa no devnet** (`min_return_bps`; o SDK aceita até 20%).

## Decisões técnicas (nenhuma é de produto)

1. **A conferência fica no SDK, não no site.** `assertDeploy` lê os 45 primeiros bytes do ProgramData (o estado, o
   slot e a autoridade; nunca os bytes do programa), confere o dono (o carregador atualizável) antes de ler, e lança
   `ProgramUpgraded` se o slot não é o esperado. `prepareJoin` e `prepareOpenCampaign` recebem `deploySlot` e conferem
   antes de qualquer outra leitura; sem `deploySlot`, nada muda (scripts e keeper). Assim o app Android e a caixa de
   criação (Sprint 19) usam a mesma regra (A-6), como o plano técnico já pedia.
2. **O build do site grava o slot.** `next.config.ts` lê o slot uma vez, pela mesma RPC que o navegador usa, e o põe no
   pacote como `NEXT_PUBLIC_PROGRAM_DEPLOY_SLOT`; um valor dado no ambiente vence. Se a leitura falha, o build fica sem
   slot e nunca assina (mensagem própria: a página não sabe a versão do programa). Consequência: **depois de cada
   atualização do programa, o site precisa ser construído de novo**; até lá, ele pausa a assinatura. Ficou como passo 5
   em `deploy/devnet/README.md` e como linha na §7.2 do plano técnico.
3. **Duas conferências na página:** na revisão (pela preparação do SDK) e de novo logo antes de entregar à carteira,
   junto com a conferência dos blocos que restam ao blockhash. Uma atualização pode cair enquanto o resumo está na tela.
4. **Recarregar com espera crescente.** Na falha, a página mostra "Brot's program was just updated", conta o tempo e
   recarrega: 5 s, depois 30 s, 2 min e então 10 min para cada recarga da mesma aba que ainda encontra o site antigo.
   Uma conferência que passa zera a contagem. A contagem fica no `sessionStorage` (só nesta aba); se o navegador não
   deixa guardar, a espera é a mais longa. Fechar a janela para a contagem; a próxima revisão confere de novo.
5. **O piso de 1% fica explícito** (`FLOOR_BPS` em `submit.ts`), em vez de depender do padrão do SDK.
6. **O risco aceito:** uma RPC que mente sobre o slot pode pausar a assinatura sem motivo ou esconder uma atualização,
   como pode mentir sobre qualquer conta que a página lê; as verificações do próprio programa continuam limitando o que
   uma entrada faz. Fica registrado na §7.2 do plano técnico até o relay.

## O que foi feito

- SDK: `packages/sdk/src/read/program-data.ts` (leitura, conferência, `deploySlotFrom`) e o `deploySlot` nas duas
  preparações; testes em `tests/sdk/program-data.test.ts`.
- Site: `app/lib/deploy.ts`, `app/next.config.ts`, o fluxo da entrada, as duas mensagens novas e a contagem
  (`upgrade-pause.ts`, `reload-countdown.tsx`); testes em `tests/site/upgrade-pause.test.ts`.
- Smoke web: rota de controle `/deploy` e `tests/e2e/upgrade.e2e.ts`, com uma atualização antes da revisão (a página
  recarrega sozinha e, com o deploy de volta, a entrada entra) e outra entre a revisão e a carteira (nada é assinado; o
  "Reload now" recarrega e a próxima espera é de 30 s).
- Documentos: a lista do relay (a leitura do ProgramData, só esse endereço, fatia de 45 bytes, nunca em cache), o plano
  técnico, a sprint, o roteiro, o README do deploy e o CHANGELOG.

## Verificado e não verificado

- Verificado nesta máquina: 41 testes em `tests/site` e 2 em `tests/sdk/program-data.test.ts`; `tsc`, lint e lint do
  SDK; lint e build do app (o build leu o slot 509.389.614 do devnet, só leitura, e ele aparece no pacote do navegador);
  o smoke web, 12 passaram e 10 pulados de propósito (as falhas rodam só em desktop).
- Não verificado: a pausa contra uma atualização real no devnet (não houve atualização; o smoke simula a troca do slot
  no LiteSVM); assinar no devnet com carteira real (o teste com a Phantom é do fundador).

## Pendências

1. **Fundador:** o teste de dez minutos com a Phantom no devnet; depois dele, a decisão de mesclar o PR #60.
2. **Sprint 08:** o relay `/rpc` com a regra do ProgramData (um endereço, fatia de 45 bytes, sem cache).
3. **A cada atualização do programa:** construir o site de novo (passo 5 do README do deploy).
