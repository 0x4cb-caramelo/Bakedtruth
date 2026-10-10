# 2026-10-10 — Sprint 09, segundo incremento

## O que foi feito

- Itens de código da Sprint -1 (tokens, script de tema em `<head>` com a chave `brot-theme`, fontes Barlow Condensed e
  Inter pelo `next/font`, primitivos em `app/components/ui/`).
- Rotas-casca: `/`, `/abrir`, `/c/[id]`, `/my-entries`, `/leaderboard`, `/record`. Avisos em todas as telas, em inglês.
- Registro MWA uma vez, para o cluster do site; `@solana-mobile/wallet-standard-mobile` 0.6.0 (publicado em 17/08/2026).
  A 0.7.0 (07/10/2026) tem menos de duas semanas e não foi usada.
- Carteira: "Use Installed Wallet" conecta só por esse clique; estados desconectado, conectado, sem SOL (link de
  faucet só em devnet) e desconectar.
- Cliente da API no site (`app/lib/api-client.ts`) e a linha de estado na página inicial; `entriesAllowed` é verdadeiro
  só quando a saúde da API é `ok`.
- Removidos: componentes da direção C, a rota `markets`, o cliente antigo do programa (Anchor, `buffer`).
- `bun run lint` e `bun run build` passam; em execução: tema, estado da API e rotas conferidos.

## Não verificado

- Conexão real de carteira (precisa de carteira no navegador ou do emulador Android com a carteira falsa).
- Chamada da API a partir de um navegador de verdade; larguras de celular.

## Decisões para o fundador confirmar

- Nomes de rota em inglês (`/my-entries`, `/leaderboard`, `/record`), e `/abrir` mantido como o documento da sprint diz.
- Piso sem SOL de 0,005 SOL na tela da carteira.

## Pendências

1. `@brot/sdk` ainda não é importado pelo app (o critério pede `read` e `tx`).
2. `.env.example` da raiz ainda é o modelo da OS.
3. Servidor: `brot-web.service`, teste de Bun e rotas do túnel (pedem nova autorização).
4. Testes em emulador e celular.
