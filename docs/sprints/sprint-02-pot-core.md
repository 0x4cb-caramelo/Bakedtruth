# Sprint 02 — Núcleo do pote

**Estado:** planejada · **Branch:** `sprint-02-pot-core` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B2 (seções 3.4.1 a 3.4.4, 3.4.9 e 3.4.10) |
| Depende de | Sprint 00. Não depende da 01 |
| Regras e fluxos cobertos | R-03, R-05, R-06, R-07, R-30; R-31 e R-32 em parte. F2 e F7, no programa |

## Objetivo

O programa passa a ter configuração, equipe, pergunta, cofre, posição e aposta, com fechamento, teto global e
pausa. Ainda não lê resultado nem paga.

## Critério de pronto

- [ ] Existem as contas `GlobalConfig`, `CapState`, `Question` e `Position`, o cofre da pergunta
      (`["vault", question]`) e o cofre de taxas, com os campos da seção 3.4.1.
- [ ] Existem as instruções `admin_initialize_config`, `admin_set_team`, `admin_set_cap`, `admin_set_fee_owner`,
      `admin_transfer_admin`, `admin_accept_admin`, `admin_resume_bets`, `team_propose_question`,
      `team_approve_question`, `team_cancel_proposal`, `team_pause_bets` e `user_place_bet`.
- [ ] `math/schedule.rs` calcula `bets_close_at = deadline_at − limitar(5% × duração, 24 h, 7 dias)`. O exemplo de
      R-07 (pergunta de 30 dias fecha no dia 28,5) é caso de teste.
- [ ] Há um teste por instrução e por código de erro. `proposer ≠ approver`. Só a chave de atualização inicializa.
- [ ] A aposta é recusada fora de `Open`, depois de `bets_close_at`, com a pausa ligada, abaixo de `MIN_BET`, acima
      do teto e com retorno abaixo de `min_return_bps`.
- [ ] USDC mandado à mão para o cofre não muda `pool_yes` nem `pool_no`.
- [ ] Teste com dois usuários: A não mexe na posição de B.
- [ ] O IDL regenerado está commitado.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- As contas e as instruções acima, uma por arquivo, abaixo de 200 linhas.
- `vault.rs`, adaptado de `outcome.rs`.
- Os eventos `ConfigInitialized`, `ConfigChanged`, `BetsPaused`, `BetsResumed`, `QuestionProposed`,
  `QuestionOpened`, `ProposalCancelled` e `BetPlaced`.
- `ReaderKind`, com as cinco variantes, e a interface de três funções dos leitores (`validate_at_creation`,
  `outcome_knowable`, `try_resolve`), ainda sem leitor de verdade.

**Ponto em aberto.** A proposta de pergunta confere a conta lida, e os leitores só chegam na Sprint 03. Como esta
sprint testa a criação sem eles é escolha da equipe na abertura; o plano técnico não diz.

## Fora desta sprint

Leitores e resolução (03). Acerto, pagamento e taxa (04). Indicação e patrocínio: os campos reservados ficam em
zero. O SDK e a devnet (05).

## Decisões do fundador que travam a sprint

- **Q3 (L-07):** a aposta mínima; se a mesma carteira pode apostar nos dois lados; se a isenção do primeiro
  apostador vale para tudo o que ele apostar.
- **Q12:** quem guarda a chave de atualização na devnet e quem são as pessoas com chave de equipe. O plano técnico
  pede a resposta antes de B2.

## Agentes e skills

- **Agentes:** `dev-product-agent`, `technical-security-red-team-agent` (papéis, inicialização, saldo escriturado),
  `coordinator-agent`.
- **Skills:** `sprint-management`, `codemap`, `verify-build-works`, `decision-log`, `secrets-scan`.

## Portões de segurança

- Assinatura e papéis existem antes de qualquer instrução que mova USDC (plano técnico, seção 7).
- Todo USDC se move por `transfer_checked`.
- Não existe instrução de saída nem saque de emergência.
- As chaves de equipe ficam fora do repositório. `secrets-scan` no fechamento.

## Testes

`bun run test`, com LiteSVM, por instrução e por erro. `bun run test:rust` para `math/schedule.rs`, como função pura.

## Riscos

- Programa novo, sem revisão de fora (gravidade crítica). Reduz: arquivos curtos e um erro por ponto de falha.
- As apostas de todas as perguntas entrarem em fila na conta `CapState`. O limite real fica a medir (C7).
- A troca de bloco por data e hora (`Clock::unix_timestamp`) esconder um desvio do relógio (C12).

## Artefatos esperados

`programs/brot-markets/src/` (`state/`, `math/schedule.rs`, `instructions/admin/`, `questions/`, `betting/`), os
testes em `tests/`, o IDL em `target/idl` e em `packages/sdk/idl`, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** núcleo do pote.
- **Session-log:** as respostas de Q3 e Q12; como a criação foi testada sem leitores.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
