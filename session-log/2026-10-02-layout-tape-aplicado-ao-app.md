# 2026-10-02 — Layout Tape aplicado ao app, sobre a versão nova do upstream

## Context

Com a direção C aprovada, o pedido foi aplicá-la como layout oficial da plataforma. O app que estava no repositório era
o scaffold antigo do `pred-provable`; a versão nova do Ronaldo (tokens YES/NO com USDC, pool, explorador de mercados,
tela de mercado, compra e venda) estava no `upstream` e nunca tinha sido mesclada.

## Decision

1. **Atualizar a base antes de aplicar o layout.** Branch nova `feat/layout-tape`; merge do `upstream` em
   `0xcf07/pred-provable@638752c`, commit `fc69674`, só local. Os dois conflitos (`CLAUDE.md` e `package.json`) foram
   resolvidos juntando o conteúdo do projeto com o do AI Dev OS.
2. **Aplicar a C pelos tokens.** Paleta, cantos retos, bordas de 2 px, sombras duras e as fontes Jersey 15 e Space
   Grotesk entram em `globals.css` e `layout.tsx`; a maior parte dos componentes herda isso sem mudar de lógica.
3. **Casca nova:** ticker, cabeçalho com categorias segmentadas, grade de células ao fundo, medidor no topo da home,
   fita de mercados em linhas com trilho luminoso, prova on-chain primeiro na tela de mercado.
4. **Mascote portado para TypeScript** (`app/lib/mascot/`, `app/components/mascot.tsx`) e montado uma vez no layout.
5. **Nome provisório num só lugar:** `app/lib/brand.ts`.
6. **O ticker só mostra mercados que a página já carregou.**

## Alternatives considered

- **Aplicar a C no scaffold antigo:** seria trabalho descartado no primeiro merge do upstream.
- **Ticker lendo as transações de cada evento recente:** foi a primeira versão. Gerou erros 429 no RPC público da
  devnet, a ponto de a tela de mercado não carregar, e causou um laço de renderização. Descartada.

## Why this decision

Mesclar primeiro custou dois conflitos e evitou refazer o layout. Passar o visual pelos tokens mantém os componentes do
upstream reconhecíveis, o que facilita os próximos merges. O ticker restrito ao que já foi carregado mantém a home em
32 chamadas ao RPC em 45 s, sem 429, contra 38 do app original (medição daquela sessão).

## Risks

- **Nada além do merge está commitado**, e nada foi enviado ao GitHub.
- **Transações não foram testadas.** Conectar carteira, comprar, vender e resolver mudaram só no visual; `bun test`,
  `cargo test` e o `next build` de produção não rodaram. Tipos e lint passavam.
- **"Sponsor a goal" não existe no app:** o upstream não tem criação de mercado.
- `featured.tsx` e `sidebar.tsx` saíram da home, mas os arquivos continuam no repositório.
- **O disco F: é FAT32** e quebra a instalação de dependências; o servidor de desenvolvimento roda de uma cópia no
  disco C:, que precisa ser sincronizada depois de cada edição.

## Follow-ups

- Commit e PR da `feat/layout-tape`, quando o Lucas autorizar.
- Rodar os testes do programa e o build de produção.
- Remover ou reaproveitar `featured.tsx` e `sidebar.tsx`.
- A direção foi reaberta em 3 de outubro: o layout no app continua sendo o da C até haver nova decisão.

## Related links

- Direção: [`docs/product/DESIGN-DIRECTION.md`](../docs/product/DESIGN-DIRECTION.md)
- Decisão anterior: [`2026-10-02-prototipo-direcao-c-e-nome-em-aberto.md`](2026-10-02-prototipo-direcao-c-e-nome-em-aberto.md)
- Commit: `fc69674` (merge do upstream)
- Sprint: —
