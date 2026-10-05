# Sprint 06 — Servidor e keeper principal

**Estado:** planejada · **Branch:** `sprint-06-keeper-server` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B6, primeira metade (seções 3.5, 10, 11 e 12) |
| Depende de | Sprint 05 |
| Regras e fluxos cobertos | R-22 (o serviço principal), R-24 (envio e nova tentativa), R-09 (publicação de preço). F3 |

## Objetivo

A resolução e o pagamento passam a sair sozinhos. O `brot-keeper` roda no servidor que já existe e, a cada 60
segundos, resolve o que já pode, publica preço, acerta o que venceu a janela e paga em lotes.

## Critério de pronto

- [ ] `services/keeper/src` tem `loop.ts`, `tasks/`, `health.ts`, `signer.ts` e `rpc.ts`. O serviço decide com os
      leitores do SDK, simula antes de enviar e não guarda estado.
- [ ] `bun test` do laço: resolve, acerta, paga em lote, tira do lote a instrução que falha, tenta de novo a posição
      reservada e nunca cria conta de USDC para ninguém.
- [ ] No servidor, o Bun está na pasta do usuário `brot` (C8, conferida antes de tudo), e `brot-keeper.service` roda
      como `brot`, com `MemoryMax` e `CPUQuota`.
- [ ] `ss -ltn` mostra a porta 4210 só em `127.0.0.1`. Nenhuma porta nova para fora.
- [ ] Os segredos estão só em `/etc/brot-markets/keeper.env` (root, `0640`, grupo `brot`).
- [ ] `deploy/vps/push-deploy.sh` leva o pacote do Git por SSH, monta a versão em `releases/<sha>` e volta à
      anterior se a saúde não responder. `deploy/vps/README.md` diz onde vive cada segredo e como trocar.
- [ ] Existe um túnel do Cloudflare só do Brot Markets, com token próprio (T6, C9).
- [ ] `GET /healthz` devolve a hora do último ciclo completo, o saldo de SOL e as pendências.
- [ ] Uma pergunta da devnet é resolvida, acertada e paga sem ninguém acionar.
- [ ] Depois de cada mudança no servidor, os serviços dos vizinhos seguem de pé.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- O keeper, com as tarefas de resolver, publicar preço a cada 10 segundos enquanto houver pergunta de preço aberta,
  acertar, pagar e tentar de novo todo dia.
- A base do servidor em `deploy/vps/`, e a escolha do provedor de RPC do keeper (T5).

## Fora desta sprint

O keeper reserva, a vigia, `POST /restart` e os alertas por email (07). O indexer (08). O site (09).

## Decisões do fundador que travam a sprint

- **Q8:** a verba para o acesso pago à rede.
- **Q11:** o domínio. Sem ele o túnel não tem endereço; a opção provisória é um subdomínio já na conta.
- **Q12:** o Ronaldo saber que o projeto vai para o servidor que ele também usa. A regra da casa pede aviso antes de
  instalar.

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent` (chave, túnel, unidades), `dev-product-agent`, `bug-triage-agent`,
  `coordinator-agent`.
- **Skills:** `sprint-management`, `secrets-discipline`, `secrets-scan`, `cost-watchdog`, `verify-build-works`,
  `codemap`, `decision-log`, `release-check`.

## Portões de segurança

- **Servidor compartilhado:** usuário `brot`, sem docker, sudo nem SSH; porta só em `127.0.0.1`; segredo em
  `/etc/brot-markets`; nada instalado no sistema.
- Reinício, `apt upgrade` e mudança de firewall só com aviso ao outro lado. O túnel, o banco e o email do outro
  projeto não são tocados.
- A carteira do keeper guarda só o SOL das taxas e não tem privilégio na rede.
- O teste aleatório da Sprint 04 está verde na versão publicada.
- `secrets-scan` no fechamento.

## Testes

`bun test` do laço, com a rede simulada. O ensaio na devnet, com o serviço de verdade.

## Riscos

- O Bun não rodar no Ubuntu 22.04 do servidor (C8), ou o túnel não rodar sem root (C9).
- O servidor é dividido. Reduz: limites por unidade. Se preciso, param-se só as unidades `brot-*`.

## Artefatos esperados

`services/keeper/`, `deploy/vps/`, `services/keeper/.env.example` sem valores, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** keeper principal no ar na devnet; deploy no servidor.
- **Session-log:** o que foi instalado e criado no servidor, o aviso dado ao outro lado, T5 e T6.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
