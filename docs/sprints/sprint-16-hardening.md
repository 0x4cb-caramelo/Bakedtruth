# Sprint 16 — Endurecimento

**Estado:** planejada · **Branch:** `sprint-16-hardening` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B9, em parte, e a seção 7 ("Antes da rede principal") |
| Depende de | Sprints 14 e 15, ou a decisão do fundador de abrir sem elas; e a 07 |
| Regras e fluxos cobertos | R-30, R-31 e R-32 |

## Objetivo

Deixar o programa e a operação no estado que vai para a auditoria: compilação verificável, carteira 2 de 3, teto com
o valor decidido, pausa testada, plano de incidente e quadro público de quem pode o quê. A versão que sai daqui é a
que as duas empresas leem.

## Critério de pronto

- [ ] `solana-verify build` roda no CI, e o hash é o mesmo em duas execuções.
- [ ] A carteira 2 de 3 existe, com aparelhos físicos e espera pública de 24 a 48 horas. Na devnet, ela é dona da
      chave de atualização e do `admin` (pela troca em dois passos) e fez uma assinatura de teste (T7, C11).
- [ ] `CapState` tem o valor decidido e foi testado na devnet: a aposta que passaria do teto é recusada, e volta a
      entrar quando uma pergunta paga.
- [ ] Pausa: o teste I10 roda com todas as instruções da versão. Resolução, pagamento e devolução funcionam com a
      pausa ligada, e só o `admin` retoma.
- [ ] `content/powers.md` está publicado em `/registro`: quem guarda cada chave e o limite de cada poder.
- [ ] O plano de incidente existe, em uma página: quem pausa, quem fala, onde publica, em quanto tempo, e quem
      substitui o CTO no alerta.
- [ ] `deploy/vps/README.md` diz onde vive cada chave e como trocar. Nenhuma chave ligada à internet tem poder sobre
      dinheiro. O keeper tem cofre de chaves.
- [ ] Domínio, Cloudflare, servidor e GitHub têm segundo fator com chave física; a `main` tem proteção de ramo.
- [ ] T4 está decidida: `emit!` ou `emit_cpi!`, e se há fuzzing dedicado.
- [ ] A versão candidata está marcada, com commit e hash, e foi enviada às duas empresas.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

O passo de `solana-verify` no CI; a carteira 2 de 3, com o produto escolhido; o plano de incidente; o quadro de
poderes; a versão candidata.

## Fora desta sprint

As correções de auditoria, os termos e o bloqueio por país (17). O teto por pergunta (fase futura). Subir o teto por
degraus, que é operação depois da abertura.

## Decisões do fundador que travam a sprint

- **P3:** os nomes dos três que assinam. O terceiro sócio não aparece com nome nos arquivos lidos.
- **P4 (L-19):** o primeiro valor do teto.
- Quem é o dono da rotina de conferir cada resolução, e quem substitui o CTO (P4 §4.6, §6.1).
- Se a 14 ou a 15 não estiverem prontas: mover a data ou abrir sem elas (P4 §3.3).

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent`, `devils-advocate-agent` (o plano de incidente),
  `coordinator-agent`.
- **Skills:** `multi-ai-review`, `secrets-discipline`, `secrets-scan`, `decision-log`, `plain-portuguese-explainer`,
  `release-check`, `sprint-management`, `codemap`.

## Portões de segurança

- Depois desta sprint o programa só muda por correção de auditoria.
- Nenhuma assinatura da carteira 2 de 3 fica em arquivo.
- `secrets-scan` no fechamento, sobre a versão candidata.

## Testes

A conferência padrão e o teste aleatório sobre a versão candidata. O ensaio de pausa e de retomada na devnet, pela
carteira 2 de 3.

## Herdado da Sprint 01

Da revisão adversarial do leitor de preço (`knowledge-base/tecnologia/pyth-leitor-de-preco.md`, seção 1.8).

- Antes da rede principal, saber quem controla a atualização dos programas da Pyth lá: a autoridade é o endereço derivado `6oXTdojyfDS8m5VtTaYB9xRCxpKGSvKJFndLUPV3V3wT`, e não foi conferido que programa ou carteira com várias assinaturas está por trás dele. O risco está na seção 13 do plano técnico.

## Herdado da Sprint 00

Da revisão de segurança que fechou a Sprint 00 (`docs/sprints/sprint-00-setup.md`).

- Atestar a origem do `.so` com `actions/attest-build-provenance`, num trabalho próprio, e conferir com `gh attestation verify`. O `SHA256SUMS` de hoje é escrito pelo mesmo trabalho que compila e só detecta download corrompido.
- Fixar o SHA-256 do instalador da Solana e do binário do Anchor no workflow, e compilar o artefato de publicação num trabalho sem cache.
- Compilar e publicar a variante `mainnet` com nome próprio (`brot_markets.mainnet.so`), com IDL por rede, e um roteiro de publicação que confere a rede antes de publicar.
- Trocar ou reforçar a varredura de segredos com o `gitleaks` (recomendado em `docs/technical/registry-pick.md`): ela ainda não pega chave em base58, URL com usuário e senha, segredo em hexadecimal nem arquivo binário.
- `CODEOWNERS` para `.github/`, `scripts/ci-secret-scan.js` e `.claude/hooks/`. A proteção da `main` não existe em repositório privado da conta gratuita: decidir entre mudar de plano e tornar o repositório público.
- Decidir o registro do `bun.lock`, hoje `registry.npmmirror.com`. Teste: trocar o host pelo registro oficial numa branch e rodar `bun install --frozen-lockfile`.

## Riscos

- O produto de carteira não ter espera pública para atualizar programa (C11).
- Os três que assinam serem da mesma empresa (P4 §4.2).
- O plano de incidente depender de uma pessoa só (P4 §6.2).

## Artefatos esperados

`.github/workflows/ci.yml`, `content/powers.md`, o plano de incidente, `deploy/vps/README.md`, o commit e o hash da
versão candidata.

## Changelog e session-log

- **Changelog:** compilação verificável; carteira 2 de 3; teto; plano de incidente; quadro de poderes.
- **Session-log:** o produto de carteira escolhido, o valor do teto e o porquê, T4.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
