# Sprint 01 — Fundação: prova do leitor de preço

**Estado:** planejada · **Branch:** `sprint-01-foundation` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B1 |
| Depende de | Sprint 00 |
| Regras e fluxos cobertos | Prepara R-09 e R-13. Não implementa regra |

## Objetivo

Responder, com uma conta real, se a Pyth serve na devnet do jeito que o leitor de preço precisa. É a primeira peça
porque o fundador decidiu que o leitor de preço é construído primeiro (R-13) e porque ninguém verificou isso até
hoje (P4 §2.4).

## Critério de pronto

- [ ] Um `PriceUpdateV2` real da devnet, de SOL e de BTC, está em `tests/fixtures/`, capturado com
      `scripts/capture-fixtures.ts`. Ou está registrado, com a fonte, que ele não existe lá (C1).
- [ ] Um teste em Rust lê a conta capturada: dono, formato e cada campo que o leitor usa. Com a conta cortada, dá
      erro, nunca pânico.
- [ ] A mesma leitura passa no Surfpool, com o modelo de `PriceUpdateV2` dele, numa versão estável fixada (C4).
- [ ] Uma nota em `knowledge-base/tecnologia/` responde C1, C2, C3, C4 e C12, cada uma com fonte primária, separando
      fato de inferência.
- [ ] A decisão T2 está registrada: leitor escrito à mão ou a biblioteca da Pyth.
- [ ] Há um veredito escrito para o fundador: serve; serve só no Surfpool; ou não serve.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- As contas capturadas e o teste de leitura.
- Um rascunho de `readers/price_touch.rs` só com a leitura, sem regra de aposta nem de resolução.
- A versão do Surfpool fixada.
- A nota de pesquisa e o veredito.

## Fora desta sprint

A trava da aposta, o SIM por toque e os números do leitor (Sprint 03). A publicação de preço pelo serviço (Sprint
06). Qualquer instrução do pote.

## Decisões do fundador que travam a sprint

Nenhuma para começar. Para fechar, só se a Pyth não servir na devnet: o fundador escolhe entre abrir com quatro
tipos e rever a decisão dos cinco (P1 §4.2; plano técnico, seção 13).

## Agentes e skills

- **Agentes:** `research-agent` (C1 a C4, nas fontes primárias), `technical-security-red-team-agent`,
  `coordinator-agent`.
- **Skills:** `sprint-management`, `decision-log`, `cost-watchdog` (C3: a taxa por atualização de preço e se o
  serviço de preços exige chave), `codemap`, `secrets-scan`.

## Portões de segurança

- Nenhuma dependência alfa ou beta. A biblioteca da Pyth só entra com prova de que compila com `anchor-lang 1.1.2`.
- A chave do serviço de preços, se existir, fica fora do repositório.
- `secrets-scan` no fechamento.

## Testes

`bun run test:rust`, com a conta real e com a conta malformada. A leitura no Surfpool.

## Riscos

- A Pyth não servir na devnet (gravidade alta no plano técnico). Aí o leitor é testado só no Surfpool, e a decisão
  dos cinco tipos volta ao fundador.
- A biblioteca puxar uma dependência fora de linha, como já aconteceu com `solana-epoch-stake`.
- O Surfpool não ter versão estável.

## Artefatos esperados

`tests/fixtures/*.bin` de preço, o teste de leitura, a nota em `knowledge-base/tecnologia/`, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** prova do leitor de preço e o resultado.
- **Session-log:** o veredito, a escolha de T2 e as alternativas descartadas.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
