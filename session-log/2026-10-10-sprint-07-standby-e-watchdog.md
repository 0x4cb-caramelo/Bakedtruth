# 2026-10-10 — Sprint 07: o keeper standby, o watchdog e os alertas (em construção)

## Pedido

Abrir e construir a Sprint 07 a partir da `origin/main` (que já traz a Sprint 06, PR #47), com o caminho feliz do MVP
primeiro. Sem provedor, chave, conta de e-mail ou gasto que o fundador não tenha aprovado: a segunda VM, a segunda
empresa de RPC e o provedor de e-mail ficam em aberto.

## O que foi feito (no repositório, sem servidor)

- **O envio só acontece com a porta aberta.** Um standby só envia depois de assumir e enquanto o primário não responde.
  A regra está em `standby.ts`, e a porta é checada em `send.ts`, no ponto mais baixo, antes de qualquer chamada de
  RPC. Testada antes do resto: com o primário vivo, o envio é recusado sem chamar o RPC.
- **Assumir:** o watchdog sonda o `/healthz` do primário a cada 5 minutos. Depois de 10 minutos sem resposta, pede
  reinício até 3 vezes (um intervalo de watchdog entre pedidos). Sem resposta depois disso, o standby assume. Na linha
  do tempo com o primário parado: alerta no primeiro silêncio, reinícios aos 10, 15 e 20 minutos, assunção aos 25.
- **Reinício pelo primário:** `POST /restart` checa HMAC-SHA256 sobre o timestamp e o corpo, com janela de 60 s, e
  compara a assinatura em tempo constante. Recusa sem escrever nada. Aceito, grava o arquivo-sinal; uma unidade `path`
  da raiz reinicia o keeper. O endpoint só existe quando o primário recebe o segredo.
- **Alertas:** `alert.ts` com deduplicação de 15 minutos. Hoje o único canal é o diário do serviço (journal): o
  provedor de e-mail é a decisão D4 do fundador.
- **Observação contínua de preço:** o standby confere a cada 5 s as campanhas de preço abertas. Passa pela mesma porta.
- **Segunda leitura:** cada campanha de preço em revisão é lida nos dois provedores. Diferença de conteúdo com o mesmo
  horário de publicação vai para a fila de revisão e dispara alerta. Diferença de horário é "não verificado", porque o
  feed publica a cada ~62 s.
- **Unidades e runbooks:** `deploy/vps/brot-keeper-restart.{path,service}` e `brot-keeper-standby.service`, mais um
  runbook por alerta em `deploy/vps/runbooks/`. Nada foi instalado.
- **Verificação:** `bun test services/keeper` (59 testes), `tsc` do keeper limpo, e duas execuções reais do processo
  contra um RPC inacessível: o primário responde ao `/healthz` e recusa `POST /restart` sem assinatura (401); o
  standby, sem primário, emite a sequência de alertas e assume.

## O que mudou no primário (`brot-keeper`, servidor)

Nada foi implantado. Mudanças no código que rodaria no servidor: o endpoint `POST /restart` só existe com o segredo
configurado; a porta de envio é aberta por padrão; o alerta `keeper_sol_low` é uma linha de diário a mais, abaixo de
0,5 SOL. A listagem de campanhas passou a aceitar um status, mantendo `listOpenCampaigns`.

## O que não foi feito (lista aberta da Sprint 07)

- Segunda VM, segunda empresa de RPC, provedor de e-mail: decisões do fundador (D4).
- Teste de queda em devnet, com as duas máquinas e as duas caixas de entrada.
- Alertas que faltam: campanha parada (10 min e 30 min), `met_late`, campanhas abertas acima de 80%, aberturas por hora,
  abertura por chave de equipe, SOL/USD antigo, crédito reservado por mais de 7 dias, exposição, upgrade do Pyth.
- Segunda leitura do comprovante no `posted_slot` (precisa de consulta de transação por slot) e dos outros quatro tipos.
- Em produção: `ReadWritePaths=/run/brot-markets` no `brot-keeper.service` (o `ProtectSystem=strict` impede a escrita do
  sinal), a rota do túnel para o `/healthz` e o `/restart`, o segredo no servidor e a unidade `path` instalada. Tudo
  isso altera o servidor compartilhado e precisa de aviso prévio ao dono.

## Decisões tomadas sem o fundador (e por quê)

1. **O intervalo entre reinícios é o do watchdog (5 min).** O enunciado não fixa o espaçamento; assim a assunção
   acontece depois de três pedidos espaçados, e não em rajada.
2. **Sem devolução automática.** Quando o primário volta, o standby fecha a porta na hora, mas continua "assumido".
   Devolver sozinho geraria oscilação.
3. **Alertas só no diário.** Sem provedor aprovado, não há envio de e-mail. Nenhum serviço externo foi contratado.
4. **Segunda leitura entre dois provedores, não contra o comprovante do primário.** O programa não guarda o preço
   tocado na campanha, então o comprovante exige a consulta de transação (pendente). A versão atual pega divergência
   de provedor, não fraude da prova.
5. **Piso de SOL de 0,5** (`KEEPER_SOL_FLOOR_LAMPORTS`). Valor de trabalho; o fundador confirma.
6. **Segredo do `/restart` com pelo menos 32 caracteres**, lido de um arquivo no início. Nunca no ambiente.

## Decisões do fundador (mesmo dia, modo de hackathon)

- **D4 adiada para depois do hackathon:** sem segunda VM, sem RPC em outra empresa agora, e o e-mail também fica para
  depois; os alertas vão para o diário. Os itens de redundância estão marcados como "Deferred to Post-Hackathon" no
  documento da sprint.
- **Autorizado pelo fundador:** `ReadWritePaths=/run/brot-markets` no `brot-keeper.service`, o segredo HMAC e a rota do
  túnel; o merge do PR #48 na `main`; e a implantação do primário no servidor, com o keeper único em execução.

## Pendências para o fundador

1. Provedor de e-mail e caixas de entrada (bloqueia os alertas por e-mail).
2. Segunda VM e chave da carteira 2 (bloqueia o standby de verdade).
3. Empresa e chave da segunda RPC (bloqueia a segunda leitura real).
4. Aviso ao dono do servidor para o `ReadWritePaths` e a unidade `path` (bloqueia o reinício remoto).
