# Sprint 09 — Site: casca, tema e carteira

**Estado:** planejada · **Branch:** `sprint-09-site-shell` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B8 (seção 3.6) |
| Depende de | Sprints 05, 08 e -1; a 06, pelo túnel e pelo deploy |
| Regras e fluxos cobertos | Os avisos de fase de testes e de programa sem auditoria (resumo de produto, seção 11). A base de F1 e F2 |

## Objetivo

O site novo, na Ledger², fica de pé no servidor: casca, tema claro e escuro, carteira conectada e a ligação com a
API e com o programa. Ainda não há tela de pergunta.

## Critério de pronto

- [ ] `app/` está organizado em `app/features/<funcionalidade>/{components,hooks,copy.ts}`; `components/ui/` tem só
      os primitivos da Sprint -1.
- [ ] Os componentes da direção Tape saíram. Ficam `providers.tsx`, `wallet-button.tsx`, `toast.tsx` e o mascote.
- [ ] `app/lib/hooks.ts` e `program.ts` foram para `app/features`, e o app importa `packages/sdk`.
- [ ] Existem as rotas `/`, `/q/[id]`, `/minhas-apostas`, `/classificacao`, `/registro` e `/sugestoes`.
- [ ] Toda tela mostra o aviso de fase de testes e "programa ainda sem auditoria".
- [ ] A carteira tem os estados: desconectada; conectada, com endereço, saldo de USDC e desconectar; sem USDC; sem
      SOL.
- [ ] O nome "baked" saiu dos lugares que o documento de design lista. A marca é Brot Markets; o Baked é o mascote.
- [ ] Nenhum script de terceiro. Os cabeçalhos de segurança estão em `next.config.ts`. Nenhum segredo em variável
      `NEXT_PUBLIC_`.
- [ ] `brot-web.service` (`next start`, Node 22) roda em `127.0.0.1:4200`, e o túnel leva o domínio até ele, com a
      API em `/api`.
- [ ] `cd app && bun run lint && bun run build` passa.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- A casca: faixa de status, barra superior, rodapé, campo de pontos, poleiros do mascote e o botão de tema.
- O cliente de `/api/v1` e o uso de `/rpc`.
- A unidade do systemd e o deploy do site, com volta à versão anterior se a saúde não responder.

## Fora desta sprint

A lista de perguntas (10). A pergunta e a aposta (11). O bloqueio por país (17). O painel da equipe, que não tem
tela no MVP.

## Decisões do fundador que travam a sprint

Nenhuma nova. Precisam estar respondidas **Q11** (o domínio), da Sprint 06, e o idioma (L-01) e o tema padrão, da
Sprint -1.

## Agentes e skills

- **Agentes:** `dev-product-agent`, `technical-security-red-team-agent` (cabeçalhos; nada secreto no pacote do
  navegador), `coordinator-agent`.
- **Skills:** `feature-scaffold`, `sprint-management`, `verify-build-works`, `secrets-scan`, `codemap`,
  `release-check`.

## Portões de segurança

- Ler `app/node_modules/next/dist/docs/` antes de escrever código do app (`app/AGENTS.md`).
- As regras do servidor compartilhado, como na Sprint 06.
- A chave do provedor de RPC nunca vai ao navegador.
- `secrets-scan` no fechamento.

## Testes

Build e lint do app. Conferência nos dois temas e em largura de celular. Conectar e desconectar uma carteira na
devnet. `ss -ltn` no servidor.

## Herdado da Sprint 00

Da revisão de segurança que fechou a Sprint 00 (`docs/sprints/sprint-00-setup.md`).

- A rota de chat que veio do upstream (`app/app/api/chat/route.ts`) não entra no site novo como está: o limite de uso se contorna trocando um cabeçalho, não há teto de gasto, o contexto vem do cliente e o texto descreve o produto antigo. Decidir nesta sprint: sai, ou é reescrita.
- Se ficar: chave exclusiva com limite de crédito no provedor; visitante identificado por `CF-Connecting-IP`; teto global por dia; contexto montado no servidor; texto para o produto de pote; aviso na interface de que a pergunta vai a um terceiro; e as nove perguntas de `.claude/rules/privacy-audit.md`.
- Até a decisão, a variável `OPENROUTER_API_KEY` não é configurada em nenhum ambiente.

## Riscos

- Esta versão do Next tem mudanças que quebram.
- Como ela serve as fontes ainda não foi conferido (C10).
- O site antigo sai do ar na troca. Combinar o momento com o fundador.

## Artefatos esperados

`app/app/` (rotas), `app/features/`, `app/next.config.ts`, a unidade `brot-web.service` em `deploy/vps/`,
`app/.env.example`, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** site novo na Ledger²; direção Tape retirada.
- **Session-log:** o endereço usado e o porquê; o que ficou do app antigo.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
