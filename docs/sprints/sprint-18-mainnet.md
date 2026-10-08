# Sprint 18 — Rede principal com teto

**Estado:** planejada · **Branch:** `sprint-18-mainnet-capped` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | Seção 7 ("Antes da rede principal") e seção 10; P4 §3.4 |
| Depende de | Sprint 17 |
| Regras e fluxos cobertos | R-29 (a regra escrita da divisão), R-30 e R-32. Todos os fluxos, agora com dinheiro real |

## Objetivo

Abrir com dinheiro real, com o teto global no primeiro degrau, só depois dos três critérios cumpridos por inteiro.

## Critério de pronto

- [ ] Os três critérios de P4 §3.4 foram conferidos, um por um, com evidência: dois relatórios públicos, sem falha
      grave aberta; carteira 2 de 3 dona da chave de atualização, com assinatura de teste; teto gravado no programa
      auditado.
- [ ] O programa publicado é o artefato de `solana-verify build`, com a feature `mainnet`. A publicação é uma
      proposta na carteira 2 de 3. `verify-from-repo` confere, e o repositório é público no commit que está na
      rede.
- [ ] Publicar e inicializar aconteceram na mesma sessão. O `admin` e o `fee_owner` são a carteira 2 de 3.
- [ ] Um ciclo completo rodou na rede principal, com pote mínimo.
- [ ] O keeper principal, o reserva e o indexer apontam para a rede principal, com carteiras só de SOL e RPC pago.
      Os alertas foram testados.
- [ ] O plano de incidente foi ensaiado uma vez: pausar e retomar.
- [ ] A regra da tesouraria está escrita: 25% e 75% da taxa (R-29), quem assina e em que dia (P8).
- [ ] No site: os avisos certos, os termos e o bloqueio por país conforme a avaliação jurídica.
- [ ] A skill `release-check` passa.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- O programa na rede principal, com o endereço publicado.
- Os serviços e o site apontados para ela.
- O registro público do que foi conferido em cada critério.

## Fora desta sprint

Subir o teto: cada degrau vem depois de duas semanas sem incidente, como rotina (P4 §4.4). A fase 1.2. Os tokens.

## Decisões do fundador que travam a sprint

- Confirmar que os três critérios estão cumpridos. Se faltar um, a abertura espera (P2).
- A empresa aberta e a avaliação jurídica concluída (P4 §3.1, P5).
- O valor do primeiro degrau do teto e a regra dos degraus (P4).
- A guarda da tesouraria (P8).

## Agentes e skills

- **Agentes:** `coordinator-agent`, `technical-security-red-team-agent`, `legal-compliance-agent`, `launch-agent`.
- **Skills:** `release-check`, `multi-ai-review` (a decisão de abrir), `secrets-discipline`, `secrets-scan`,
  `verify-build-works`, `usage-monitor` (o custo real de RPC e das máquinas depois da abertura), `decision-log`,
  `sprint-management`.

## Portões de segurança

- **Rede principal só depois de auditoria, carteira 2 de 3 e teto global.** Sem os três, a sprint não abre.
- A chave de atualização nunca esteve em arquivo nem em máquina ligada à internet.
- Quem chama primeiro a inicialização vira administrador: publicar e inicializar na mesma sessão.
- Qualquer mudança no programa depois da auditoria pede nova revisão.
- `secrets-scan` no fechamento.

## Testes

`verify-from-repo` sobre o programa publicado. O ciclo completo com pote mínimo. A aposta que passaria do teto,
recusada na rede principal. O ensaio de pausa.

## Riscos

- Programa novo com dinheiro real (gravidade crítica). O teto baixo limita a perda.
- A equipe não conferir uma resolução, e um resultado errado ser pago: não há correção depois de `Settling`.
- Uma pergunta só ocupar o teto inteiro, porque não há teto por pergunta (P4 §4.4).
- A regra brasileira (P4, capítulo 7).

## Artefatos esperados

O endereço do programa na rede principal, a saída de `verify-from-repo`, o registro dos três critérios, a regra da
tesouraria, os arquivos de ambiente de produção em `/etc/brot-markets` (nunca no repositório).

## Changelog e session-log

- **Changelog:** abertura na rede principal, com o teto.
- **Session-log:** a evidência de cada critério; o valor do teto; o que ficou para a fase 1.2.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
