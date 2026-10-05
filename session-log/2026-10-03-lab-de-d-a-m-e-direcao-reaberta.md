# 2026-10-03 — Lab de D a M, e a direção de design reaberta

## Context

Com a C aprovada e aplicada ao app, o Lucas voltou ao Prototype Lab em quatro rodadas no mesmo dia:

1. **Wireframe em mosaico.** Mexer na estrutura da home, não no visual: carrossel grande dos mercados em negociação à
   esquerda, "Upcoming" e "Closing soon" à direita, os três princípios abaixo e então as abas. Aplicado a A, B e C como
   D, E e F, mais uma G "bem cara de gambling".
2. **Mercado preditivo web3** (H, I, J), usando as referências Aceternity UI, canvas, WebGPU e Spline, perto de Ledger
   e Tape, "porém deixando diferente".
3. **Mais três a partir da Ledger²**, "a que está mais próxima", comparando com mercados preditivos e web3 (K, L, M).
4. **Refação de K, L e M**, porque a primeira versão das três manteve o visual da D e mudou só o conteúdo: "esses
   últimos três praticamente não tiveram diferença".

## Decision

1. **As treze direções (A a M) ficam guardadas.** Nenhuma é apagada.
2. **A direção de design está em aberto.** Palavras do Lucas ao encerrar: "ainda não decidimos como vai ser". A
   aprovação da C em 2 de outubro deixa de ser a decisão final; o `DESIGN-DIRECTION.md` passa a dizer isso no topo.
3. **O app continua com o layout da C** até haver nova decisão. Nada no app foi alterado nesta data.
4. **Código compartilhado do lab:** `shared/mosaic.js` (carrossel e listas laterais, usado de D a M),
   `shared/shader.js` (WebGPU com reserva em Canvas 2D, usado pela I) e `shared/ledger.js` com `shared/ledger.css`
   (estrutura da Ledger² com cor, raio, borda e fonte como variáveis, usados por K, L e M).

## Alternatives considered

- **K, L e M com a folha de estilo da D** e diferenças só de conteúdo: foi a primeira entrega e foi rejeitada. Para o
  Lucas, variação de protótipo precisa ser visível em cor e estilo.
- **H, I e J na estrutura original** (título e medidor no topo) em vez do mosaico: não foi feito; o mosaico era o pedido
  estrutural mais recente. Fica como dúvida a confirmar.
- **Cena real do Spline na J:** exige um endereço `.splinecode` exportado do editor deles, que não existe. A moeda foi
  feita em CSS 3D, com o ponto de encaixe marcado no código.
- **Copiar o WebGPU da B para a I:** preferiu-se extrair um utilitário, porque a repetição já existia em B e E.

## Why this decision

Nenhuma rodada produziu uma escolha. O Lucas indicou proximidade ("o Ledger² é o que está mais próximo"; antes, "a gente
estava bem próximo" com Ledger e Tape) sem fechar. Guardar tudo custa pouco e permite montar a direção final misturando
peças.

## Risks

- **A G e a L contrariam a hipótese de marca** do `DESIGN-DIRECTION.md` ("não somos um cassino"; tom seco e factual). São
  testes de extremo, não propostas.
- **O shader WebGPU da I não foi exercitado:** o navegador headless usado na conferência não tem adaptador WebGPU. Só o
  caminho de reserva em canvas foi visto funcionando.
- **A comparação com Kalshi, Polymarket e apps web3 em K, L e M é de memória.** Nenhuma página de concorrente foi aberta
  nessas rodadas.
- **O ranking de traders da L não tem de onde sair hoje:** nenhuma conta do programa guarda isso e o app não tem
  indexador.
- **Dados sintéticos novos** em `shared/mock-data.js` (`upcoming`, `leaders`, `wallet`, `sponsors`). Se a Fase 4 derivar
  entidades desse arquivo, nem tudo ali corresponde a algo que o programa tem.
- No celular, o balão de fala do mascote corta na borda direita em todas as direções.
- Tudo isto está sem commit.

## Follow-ups

- Escolher a direção, ou a mistura, e então atualizar `DESIGN-DIRECTION.md` e o app.
- Confirmar se o mosaico é a estrutura da home.
- Commit e PR da `feat/layout-tape`.
- Gerar o `CODEMAP.md` depois do commit (o gerador só enxerga arquivos rastreados).
- Se a comparação com concorrentes pesar na escolha, fazer a pesquisa com fontes.

## Related links

- Lab: [`prototype-lab/README.md`](../prototype-lab/README.md)
- Direção: [`docs/product/DESIGN-DIRECTION.md`](../docs/product/DESIGN-DIRECTION.md)
- Decisão anterior: [`2026-10-02-prototipo-direcao-c-e-nome-em-aberto.md`](2026-10-02-prototipo-direcao-c-e-nome-em-aberto.md)
- Sprint: —
