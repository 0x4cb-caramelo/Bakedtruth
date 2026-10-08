# Os decks anteriores

Guardados só como história da evolução do pitch, a pedido do fundador em 8/10/2026: "vamos tirar do ar os pitches
zero, 2 e 3, e passar o 4 para o endereço /pitch, e os que foram tirados do ar ficam guardados no repo apenas para
fins de história e evolução do pitch."

Nada aqui é servido: o servidor só entrega o que está em `public/`. Os endereços antigos (`/pitch2`, `/pitch3`,
`/pitch4`) redirecionam para o deck atual, em `/pitch/`.

| Pasta | O que é | Esteve no ar |
|---|---|---|
| `pitch-1/` | A segunda versão do deck do fundador, oito slides, com o mascote correndo em cada troca (`deck-motion.js`). Foi a apresentada à banca de 6/10/2026 | `/pitch`, de 5 a 8/10/2026 |
| `pitch-2/` | A resposta à banca: nove slides, enxutos, com a taxa de 3,5% do pote | `/pitch2`, de 6 a 8/10/2026 |
| `pitch-3/` | O de dez slides com a demo animada, uma cena do mascote por troca e o modo leve; `deck/` tem a página e os módulos | `/pitch3`, de 7 a 8/10/2026 |

Cada pasta tem o `roteiro.md` de fala daquela versão. O v4, que está no ar, nasceu de uma cópia do `pitch-3`; o
porquê de cada mudança está em `docs/business/_review/plano-do-pitch3.md` e `revisao-do-pitch-2026-10-08.md`.

**Para abrir um deles de novo,** copie a pasta para `public/` com outro nome (por exemplo `public/pitch-antigo/`). Os
decks 1 e 2 pedem o palco e as fontes de `public/pitch/` pelo caminho `../pitch/` e as imagens antigas que estão em
`pitch-1/img/`; copie essas imagens para `public/pitch/img/` antes. O 3 pede o palco do mesmo jeito e traz as
próprias imagens em `deck/img/`. Não esqueça de tirar a regra de redirecionamento do `server.mjs` se o nome começar
por `/pitch` seguido de número.
