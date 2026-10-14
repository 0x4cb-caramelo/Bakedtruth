# 2026-10-09 — Sprint -1: o fechamento, a revisão do coordenador e o que ficou aberto

## Context

Depois do porte dos primitivos, o pedido foi fechar a Sprint -1: subir o trabalho, conferir o contraste, fazer a
checagem visual e a releitura dos conflitos. Um revisor (agente coordenador, só leitura) conferiu a definição de pronto
item por item e achou falhas de registro, não de código: uma ordem de scripts afirmada sem ter sido vista, uma contagem
errada de lacunas, seções pedidas e não escritas, e o teste de contraste sem commit.

## Decisions

- **O teste de contraste é permanente** (`tests/app/tokens-contrast.test.ts`): lê `app/styles/tokens.css`, resolve as
  variáveis dos dois temas e confere 4,5:1 para texto e 3:1 para a borda de campo. Pega os pares que o protótipo deixou
  abaixo do mínimo.
- **`--dim` sobe um pouco nos dois temas** (escuro `#808ba0` → `#8590a4`; claro `#5f6a7d` → `#5e697c`). Sem isso,
  o rótulo fraco não passava em 4,5:1 sobre a superfície elevada. A mudança vale no protótipo também, para os dois
  arquivos de tokens continuarem iguais.
- **A animação da borda do botão primário se chama `orbit`, não `spin`.** O Tailwind v4 emite seu próprio `spin`, que
  gira o botão inteiro e substitui o nosso. Achado na checagem visual, não nos testes.
- **Os itens que dependem de decisão ficam abertos**, com o motivo, em vez de marcados como feitos: as três lacunas
  adiadas, os seis componentes sem primitivo (corte ou manter é do fundador), a conferência contra as seções do BP
  v0.0.4 e a passagem de leitor de tela.
- **O merge e a tag ficam com o Ronaldo**, como nas sprints anteriores. Não foram feitos aqui.

## What was done

- Teste de contraste, com 36 pares por tema, passando nos dois temas.
- `--dim` ajustado nos dois arquivos de tokens.
- `orbit` no lugar de `spin`; `EmptyState` com a imagem de largura automática.
- Seções novas em `DESIGN-DIRECTION.md`: a caixa de abrir campanha, os layouts de celular, o inventário sem primitivo e
  os quatro problemas de acessibilidade. A releitura ganhou "Lacunas (22)". Corrigida a frase sobre o script no `<head>`.
- Verificação: `bun test tests/app`, lint, `tsc`, build, testes sem binário, codemap, varredura de segredos (limpa),
  checagem visual nos dois temas em 1440, 412 e 360 px, e passagem de teclado.

## Consequences

- A Sprint -1 fica em revisão. O que falta para fechar é decisão do fundador (cortar ou manter os seis componentes e as
  três lacunas) e o merge com a tag, feito pelo Ronaldo.
- Sprint 09 herda: a caixa de abrir, os layouts de celular, a conferência dos pontos de quebra e as seções do BP v0.0.4.

## Open

- A passagem de leitor de tela, que não foi feita, e a verificação do quarto problema de acessibilidade ("Como
  funciona" abaixo de 860 px) em tela, não só no código.
