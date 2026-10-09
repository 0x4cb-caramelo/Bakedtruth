# 2026-10-09 — A página /3: a original, com as cores do deck e o texto mais curto

## O que era verdade antes

- A página inicial (`services/landing/public/index.html`) usa o visual Ledger²: azul, Barlow Condensed e Inter.
- A `/2` (PRs #38 e #39) traz o mesmo texto com o visual inteiro do deck: cores, IBM Plex, cartões escuros.

## O que os fundadores decidiram

Lucas, em 9/10/2026, falando por ele e pelo Ronaldo: "a gente gostou mais do copy e disposição das coisas no
original, mas com as novas cores do novo. A gente tem que buscar reduzir e simplificar um pouco mais os textos, ter
menos linhas de leitura, coisa que no pitch temos essa conceituação". Pediu uma `/3` com essas diretrizes, um quadro
laranja dizendo que o site está em construção, nas nossas palavras ("we are baking this website"), e tudo numa
branch nova.

## Como foi feito, e por quê

- **Disposição e fontes da original, por construção.** A `/3` carrega o `styles.css` da página inicial. Não há
  cópia: o que o Ronaldo mudar na disposição da original vale para a `/3` na hora.
- **Só as cores trocadas.** `public/3/colors.css` redefine os tokens de cor nos dois temas com a paleta do deck e
  desenha o aviso. A única regra de disposição que ele toca é o espaço acima da capa, por causa do aviso. Um teste
  falha se uma cor da original ficar sem correspondente: foi assim que a barra do exemplo saiu azul no tema claro na
  primeira tentativa.
- **Os cartões seguem a original** (claros no tema claro). Os cartões sempre escuros da `/2` são disposição do
  deck, não cor, e ficaram de fora.
- **Texto no jeito do deck:** um título e uma linha curta por bloco. 232 palavras contra 299; no computador, cada
  princípio cabe em uma linha (eram três) e a chamada em duas (eram três).
- **O que não mudou, de propósito:** a frase de consentimento sob o formulário (`lib/leads.mjs` grava a versão
  dela com cada email; mudar a frase pede versão nova e revisão de privacidade), as falas e os pousos do mascote, e o
  rascunho do X.
- **O rodapé** ficou mais curto e manteve as quatro afirmações: fase de teste na devnet, tokens de teste, programa
  sem auditoria, nada ali é oferta, disponibilidade por país indefinida. Saiu a palavra "bet", que o plano de
  negócios não usa fora da marca.

## Em aberto

- A `/3` não foi publicada: mescla e servidor esperam a palavra do Lucas.
- Qual das três vira a página inicial, e o que acontece com a `/2`.
- O texto curto é uma proposta; o Lucas e o Ronaldo revisam frase por frase.
- O aviso laranja só está na `/3`. Falta decidir se vai também para os termos, a privacidade e o docs.
