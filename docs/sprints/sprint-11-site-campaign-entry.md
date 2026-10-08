# Sprint 11 — Site: página da pergunta e aposta

**Estado:** planejada · **Branch:** `sprint-11-site-question-bet` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B8 (seção 3.6) |
| Depende de | Sprints 09 e 10 |
| Regras e fluxos cobertos | R-01, R-02, R-04, R-05, R-07, R-08, R-09, e as mensagens de R-30 e R-31. F1 (a pergunta) e F2 |

## Objetivo

A pessoa abre uma pergunta, confere a prova, escolhe um lado, vê quanto pode receber e assina. É a primeira aposta
feita pelo site.

## Critério de pronto

- [ ] `/q/[id]` mostra o cabeçalho e a prova: o valor lido agora, pela mesma leitura do programa; a meta; a conta,
      com link; o fechamento das apostas e a data final.
- [ ] Na pergunta de preço aparecem o preço de agora, o alvo e o que a tela diz sem preço fresco (L-22).
- [ ] O painel de aposta tem SIM ou NÃO, o valor e o retorno estimado já com a aposta do usuário no pote. Com 300 no
      SIM e 700 no NÃO, 1 USDC no SIM mostra 3,10.
- [ ] Antes da assinatura aparecem os avisos obrigatórios: retorno é estimativa; dinheiro preso até o fim; taxa;
      fase de testes.
- [ ] Antes de assinar, o painel relê a `Question` na rede e simula. A transação leva `min_return_bps`.
- [ ] Cada falha tem mensagem própria, vinda de `packages/sdk/errors.ts`: apostas fechadas; fato já aconteceu; sem
      preço fresco; teto atingido; pausa; abaixo do mínimo; saldo insuficiente; sem SOL; assinatura recusada;
      transação que falhou; rede fora do ar.
- [ ] Sem USDC de teste, a tela diz como conseguir.
- [ ] O histórico da chance e a atividade recente aparecem, se o fundador confirmou (L-23).
- [ ] Uma aposta feita pelo site aparece na rede e, em seguida, na API.
- [ ] `cd app && bun run lint && bun run build` passa.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- A funcionalidade da pergunta e a da aposta, em `app/features/`.
- Os textos dos avisos e dos erros, em `copy.ts`.

## Fora desta sprint

Minhas apostas e os estados depois do fechamento (12). O link de indicação (14). O patrocínio (15).

## Decisões do fundador que travam a sprint

- **Q10 (L-08):** como a pessoa consegue USDC de teste.
- Precisam estar respondidos, da Sprint -1: o texto do aviso de dinheiro preso (L-03) e o gráfico (L-23).

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent` (o que a carteira assina; a simulação), `copywriter-agent` (avisos
  e erros), `dev-product-agent`, `coordinator-agent`.
- **Skills:** `feature-scaffold`, `multi-ai-review` (a transação que o usuário assina), `sprint-management`,
  `verify-build-works`, `codemap`, `secrets-scan`.

## Portões de segurança

- Nenhum código de fora na página de aposta.
- O site só simula; quem faz a conta de valor é o programa.
- Vocabulário: "apostar", "chance" e "retorno estimado"; nunca "comprar" nem "preço".
- Nenhuma promessa de retorno. `secrets-scan` no fechamento.

## Testes

Build e lint. Na devnet: apostar nos dois lados; provocar cada falha da lista e ver a mensagem certa; conferir o
retorno da tela contra `packages/sdk/math.ts` e contra o que o programa grava.

## Riscos

- O retorno cair depois da aposta: quem viu 3,10 pode receber 1,63. O aviso e o `min_return_bps` reduzem.
- A fresta de 30 segundos na pergunta de preço.
- Os limites do RPC, com a prova lida ao vivo por cada visitante.

## Artefatos esperados

`app/features/` (pergunta e aposta), `copy.ts` de cada uma, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** página da pergunta e aposta pelo site.
- **Session-log:** a resposta de Q10; o texto final de cada aviso obrigatório.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
