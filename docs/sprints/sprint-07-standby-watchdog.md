# Sprint 07 — Keeper reserva e vigia

**Estado:** planejada · **Branch:** `sprint-07-standby-watchdog` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B6, segunda metade (seção 3.5) |
| Depende de | Sprint 06 |
| Regras e fluxos cobertos | R-22, inteira; R-26, só a leitura de conferência com alerta. F3, quando o principal falha |

## Objetivo

Se o serviço principal cair, o segundo assume e o CTO fica sabendo. O segundo roda em outro provedor, com outra
carteira e outro RPC.

## Critério de pronto

- [ ] `services/keeper/src` ganha `watchdog.ts` e `alert.ts`; o mesmo pacote roda com `KEEPER_MODE=standby`.
- [ ] A vigia confere o principal a cada 5 minutos. Com 10 minutos sem resposta, pede o religamento até 3 vezes;
      depois assume o mesmo laço, a cada 5 minutos, e manda email ao CTO. Há teste com o principal derrubado.
- [ ] `POST /restart` confere a assinatura HMAC e a data, grava um arquivo-sinal, e uma unidade `path` do systemd,
      do root, reinicia o keeper. O usuário `brot` segue sem sudo.
- [ ] Um pedido de `/restart` sem assinatura, ou velho, é recusado (teste).
- [ ] A vigia também olha a rede: pergunta resolvível parada há mais de 10 minutos é alarme.
- [ ] O reserva relê por outro RPC a conta de cada pergunta resolvida, compara com `observed_value` e avisa a equipe
      se diferir.
- [ ] Os seis alertas saem por email: principal caiu; reserva assumiu; SOL baixo; NÃO gravado com `met_late`; segunda
      leitura diferente; posição reservada há mais de 7 dias.
- [ ] Com os dois keepers ligados, a segunda chamada da mesma instrução recebe erro e nada muda (teste).
- [ ] Ensaio na devnet: parar `brot-keeper.service`, ver o reserva assumir e o email chegar.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- O modo reserva e a vigia, numa máquina pequena fora da Hostinger.
- O religamento remoto e os alertas.
- A escolha do segundo provedor, do segundo RPC e do serviço de email (T5).

## Fora desta sprint

`reread_question` gravada na rede (14). O aviso por Telegram (fase 2). O plano de incidente e o cofre de chaves do
keeper (16).

## Decisões do fundador que travam a sprint

- **Q8:** qual provedor recebe a segunda máquina, qual serviço manda o email e com que verba; ou adiar o segundo
  serviço. A recomendação do plano técnico é contratar já.

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent` (o HMAC, a unidade `path`, o que a carteira 2 alcança),
  `devils-advocate-agent` (dois serviços com o mesmo código têm o mesmo defeito), `coordinator-agent`.
- **Skills:** `sprint-management`, `cost-watchdog` (a segunda máquina e o email), `secrets-discipline`,
  `secrets-scan`, `verify-build-works`, `codemap`, `decision-log`, `release-check`.

## Portões de segurança

- A carteira 2 é diferente da 1 e guarda só SOL de taxa.
- `RESTART_HMAC_SECRET` vive só nos dois `keeper.env`. O endereço público expõe apenas `/healthz` e `/restart`.
- O email sai do segundo provedor. O servidor de email do projeto vizinho não é usado.
- O ensaio para apenas unidades `brot-*`. Qualquer coisa além disso pede aviso ao outro lado.
- `secrets-scan` no fechamento.

## Testes

`bun test` da vigia, com o principal simulado como derrubado. O ensaio na devnet, com as duas máquinas.

## Riscos

- Dois serviços com o mesmo código têm o mesmo defeito (gravidade alta). A janela de 6 horas e a anulação continuam
  atrás deles.
- A rotina de conferir cada resolução ainda não tem dono (P4 §4.6). O alerta chega, mas alguém precisa agir.
- O email de alerta cair na caixa de spam.

## Artefatos esperados

`services/keeper/src/watchdog.ts`, `alert.ts`, a unidade `path` em `deploy/vps/`, o README com a troca de cada
segredo, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** keeper reserva e vigia; alertas por email.
- **Session-log:** o provedor escolhido e o custo; o resultado do ensaio de queda.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
