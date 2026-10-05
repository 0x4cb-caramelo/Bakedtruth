# Sprint 14 — Indicação e segunda leitura da disputa

**Estado:** planejada · **Branch:** `sprint-14-referral-second-read` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B9 (seções 3.4.7 e 3.4.11) |
| Depende de | Sprint 04 (programa), 07 e 08 (serviços), 12 (site) |
| Regras e fluxos cobertos | R-27 e R-28; R-25 e R-26. F10; F6 (etapas 1 e 2) |

## Objetivo

As duas peças pequenas de programa que entram antes da rede principal. As duas metades são independentes: o
fundador pode levar uma sem a outra (P4 §3.3).

## Critério de pronto

**Metade A, a indicação.**

- [ ] Existem a conta `ReferralLink` (`["referral", referee]`) e a instrução `user_link_referrer`: assinada pelo
      indicado, uma vez, imutável. O evento é `ReferralLinked`.
- [ ] O indexer ganha a tabela `referrals`, confere "antes da primeira aposta" pelas duas datas da rede e calcula a
      taxa de cada aposta vencedora do indicado (`fee_total × aposta ÷ V`).
- [ ] A rotina semanal calcula os 20% por 90 dias (R-27) e a devolução de até 5 USDC depois de 250 apostados (R-28),
      e publica o relatório.
- [ ] O site aceita o link `?ref=<carteira>`, propõe a assinatura antes da primeira aposta e mostra o saldo.

**Metade B, a disputa.**

- [ ] `reread_question`: leitura igual, paga; leitura diferente, etapa 2, com 48 horas. `admin_decide_contest` só
      confirma ou anula. O evento é `ContestClosed`.
- [ ] `team_open_contest` tem prazo de 1 hora. O pior caso, de 55 horas, é caso de teste.
- [ ] A decisão é publicada com o motivo em `/registro`.

**As duas.**

- [ ] O teste aleatório, ampliado com as instruções novas, mantém I1 a I10.
- [ ] O IDL e o SDK foram regenerados, e o programa foi republicado na devnet pelo artefato do CI.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- No programa: `state/referral.rs`, `instructions/referral/` e as duas instruções da disputa.
- Nos serviços: a tabela, o cálculo e a rotina de repasse; a segunda leitura pelo keeper reserva.
- No site: o vínculo, o saldo e o estado de disputa com a decisão publicada.

## Fora desta sprint

A contestação pelo apostador, com depósito, e a arbitragem interna (fase 1.2). Repartir a taxa dentro de
`settle_position`, que o plano técnico descartou. Trava contra autoindicação: é risco aceito (P4 §4.7).

## Decisões do fundador que travam a sprint

- **Q9 (L-10):** quando começam os 90 dias. E onde a pessoa vê o saldo.
- **L-14:** se a etapa 2 já vale antes da fase 1.2, e qual é o segundo oráculo da pergunta de preço (T8).
- Quem assina o repasse semanal, que sai da carteira da operação. O plano técnico não diz.

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent`, `business-red-team-agent` (o custo da autoindicação),
  `dev-product-agent`, `coordinator-agent`.
- **Skills:** `sprint-management`, `multi-ai-review` (o programa muda depois do portão da Sprint 04),
  `secrets-discipline`, `secrets-scan`, `codemap`, `verify-build-works`, `decision-log`, `release-check`.

## Portões de segurança

- O teste aleatório volta a passar antes de qualquer republicação.
- O repasse move dinheiro da operação: a chave dele não vai para o servidor sem decisão registrada.
- `admin_decide_contest` nunca inverte o resultado.
- O relatório público traz só carteiras e valores. `secrets-scan` no fechamento.

## Testes

Um teste por instrução e por erro. Dois usuários: A não cria o vínculo de B. O cálculo do repasse contra os eventos
de uma pergunta de exemplo. A disputa pelos dois caminhos, na devnet.

## Riscos

- Quem indica depende da empresa para receber: é o custo aceito de manter o repasse fora do programa.
- O segundo oráculo não estar escolhido quando a sprint abrir.
- A fatia da taxa que sai em indicação passar do previsto: a regra volta ao fundador (P4 §4.7).

## Artefatos esperados

Os arquivos do programa e dos serviços listados em Entregas, o relatório de repasse de exemplo, o IDL, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** indicação; disputa em duas etapas.
- **Session-log:** as respostas de Q9 e L-14; quem assina o repasse; qual metade entrou, se só uma.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
