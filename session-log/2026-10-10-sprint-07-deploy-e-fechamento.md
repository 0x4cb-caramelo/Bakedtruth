# 2026-10-10 — Sprint 07: deploy do primário no servidor e fechamento (hackathon)

## Autorizações do fundador (no mesmo dia)

- Merge do PR #48 na `main` (feito: merge commit `cc87637`).
- No servidor: ler o diretório do keeper e os nomes das chaves do ambiente; editar `brot-keeper.service` com
  `ReadWritePaths=/run/brot-markets`; criar o segredo HMAC; reiniciar `brot-keeper`. Sem Cloudflare, DNS ou túnel.
- Depois: não instalar a unidade `path` de reinício (decisão do fundador: o standby foi adiado); não acompanhar o keeper
  por horas (o fundador monitora a campanha de teste por conta própria); fechar a Sprint 07.

## O que foi feito no servidor, em ordem

1. Leitura do estado: release `755798c` ativo, `brot-keeper` ativo desde 04:29 UTC, zero reinícios, porta 4210 só em
   loopback.
2. Release `cc87637` (a `main` no merge do PR #48) desempacotada em `/srv/brot-markets/keeper/releases/cc87637` e com as
   dependências instaladas (53 pacotes, `bun install --frozen-lockfile --ignore-scripts --filter @brot/keeper`).
3. Configuração, feita pelo fundador com o comando de uma linha (`CONFIG_OK`): backup de `keeper.env` e da unidade em
   `/etc/brot-markets/bak-sprint07/`; segredo HMAC em `/etc/brot-markets/restart-secret` (root:brot, 0440), sem exibir o
   valor; duas chaves novas em `keeper.env` (`KEEPER_RESTART_SECRET_FILE`, `KEEPER_RESTART_FLAG`); diretório
   `/run/brot-markets` por `/etc/tmpfiles.d/brot-markets.conf`; `ReadWritePaths=/run/brot-markets` na unidade e
   `daemon-reload`.
4. `current` apontado para `releases/cc87637` e `brot-keeper` reiniciado às 05:47:38 UTC.

## Verificação

- `systemctl is-active brot-keeper`: active; `NRestarts`: 0.
- `/healthz` em `127.0.0.1:4210`: responde; último ciclo com 4 campanhas abertas (1 `notYet`, 3 `refused`, 0 `resolved`,
  0 `failed`); `lastError` nulo; sem erros de ciclo nos últimos três minutos.
- `POST /restart` sem assinatura: 401 (o endpoint está montado e recusa).
- Linha de início: `mode: primary`, `restartEndpoint: true`, `dryRun: false`, `cycleMs: 15000`.
- **Não verificado:** um `POST /restart` assinado (reiniciaria o keeper); os motivos das 3 recusas.

## Decisões de fechamento

- A unidade `path` de reinício **não é instalada**, por decisão do fundador. O `POST /restart` aceita pedidos assinados
  e escreve o sinal, mas nada age sobre ele ainda. O repositório reflete isso no README de `deploy/vps`.
- Itens do critério de pronto que não foram construídos (alertas de campanha parada, a prova do `posted_slot`, os
  outros tipos na segunda leitura, o teste de dois keepers, o alerta de upgrade do Pyth) ficam marcados no documento da
  sprint com destino (Sprint 13, 14 ou 16). **Confirmar com o fundador.**
- A Sprint 06 **continua aberta**: a resolução real em devnet ainda não foi vista.

## Prazo do hackathon: conflito nos documentos (para o fundador)

- `docs/business/ideacao-perguntas-e-respostas.md` e o BP v0.0.2 registram **12 de outubro de 2026** como prazo do
  Colosseum (esse último marca como "fato secundário"). Hoje é 10 de outubro.
- O BP v0.0.4 (decisão de 8/10/2026) diz: "não se preocupe com deadline", e que o plano não fixa data.
- A data precisa de confirmação em fonte oficial antes de a sequência ser decidida.

## Pendências

1. Confirmar o prazo do Colosseum (dois documentos divergem).
2. Confirmar os destinos dos itens não construídos listados no documento da Sprint 07.
3. Dizer qual é o trabalho do Lucas no frontend: não encontrei documento que o descreva no repositório.
