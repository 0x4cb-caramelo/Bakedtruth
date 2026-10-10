# 2026-10-10 — Sprint 09 fechada para o hackathon

## Decisões do fundador (mesmo dia)

- Migração para `@brot/sdk` e `.env.example` atualizado: feitos agora, para o Lucas.
- Servidor (`brot-web`, teste de Bun, rotas do túnel) e testes em emulador ou celular: **adiados para o fim do hackathon**.
- Nomes de rota aprovados (`/my-entries`, `/leaderboard`, `/record`, e `/abrir`); piso de SOL de 0,005 aprovado.
- Lucas constrói as telas de campanha, de entrada e de ranking, com o dados. O site só tem as cascas e o acesso ao SDK.
- Lista de espera mantida como rota própria; decks como estão, por link.

## O que foi feito

- `@brot/sdk` entra como dependência do app. `app/lib/brot.ts` é a porta única para o SDK (`read` e `tx`); o rodapé
  mostra o link do programa com o `PROGRAM_ID` do SDK. O build passa.
- `.env.example` da raiz reescrito: site, API de leitura, keeper (só os nomes, valores no servidor) e scripts de devnet,
  com placeholders e sem segredos.
- A marca passa a ser **Brot Markets**, com o slogan de campanhas on-chain. O texto antigo (USDC, "markets", trading) saiu
  com as constantes não usadas. Baked continua sendo o mascote.
- Sprint 09 fechada no documento, com a disposição de cada item.

## Pendências

1. **Revisão do fundador:** o slogan (a frase de efeito) e as falas do mascote são do texto antigo, e foram mantidos.
2. **Fim do hackathon:** `brot-web`, teste de Bun, rotas do túnel, e testes de MWA em emulador e celular.
3. **Lucas:** telas de campanha (Sprint 10 e 11), criação (19), ranking e registro (13), com o cliente da API e o SDK.
4. `services/landing` continua no ar; a retirada fica para depois do hackathon.
