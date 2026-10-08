# Os decks `/pitch2` e `/pitch3`: da banca ao deck de dez slides

- **Data:** da noite de 6 à madrugada de 8 de outubro de 2026
- **Fase:** 5 (Chegada), em rodadas do site provisório, fora do roteiro de sprints
- **Escrito em:** 8/10/2026, depois do fato. O trabalho foi para o `CHANGELOG.md` e para
  `docs/business/_review/plano-do-pitch3.md` na hora, mas não ganhou registro de sessão. Este arquivo cobre o porquê;
  o detalhe, slide a slide e bloco a bloco, continua no plano do `/pitch3`.

## Os pedidos, na ordem

1. **`/pitch2`, 6/10, 18h56:** "crie um /pitch2 usando as melhores condições e recomendações referente ao que fora
   criticado, porém e obviamente seguindo a nossa estrutura, branding e paozinho correndo em todos os slides (vamos
   mexer nisso depois). Pode construir e deployar imediatamente, que eu vou avaliar online". No ar às 19h12 (PR 11).
2. **Enxugar, 6/10, 19h18:** "podemos tirar em alguns cerca de 30 -40%, e no slide 4 tirar o texto final que fala dos
   tiers. no slide 5 podemos voltar ao projeto anterior que era simplesmente 3%, e aumente para 3.5%". No ar às 19h27
   (PR 12): de 789 para 482 palavras visíveis.
3. **Frase de elevador,** três rodadas na mesma noite; a versão 1 foi aprovada em 7/10 e está no `PITCH.md`.
4. **`/pitch3`, 7/10, de madrugada:** a pauta dele depois de ver o `/pitch2`: uma cena do mascote por troca de slide,
   "contando" uma história; uma demo animada no slide de solução; sem o slide de exemplos de mercado; sem o ponto de
   equilíbrio; slide de equipe; contador de parceiros com logos. Ele desenhou as 17 poses novas enquanto o plano era
   montado. PRs 13 (o deck), 14 (as cenas), 15 (modo leve, tecla `N`), 16 (ordem nova, sete marcas fictícias,
   links da capa).
5. **Roteiro de fala** do `/pitch3`, 7/10 à tarde, adaptado do que ele levou à banca (`pitch3-notes.md`, hoje em
   `services/landing/history/pitch-3/roteiro.md`), e as respostas sobre a troca de 3,5% para 10%.
6. **Rodada das regras, 7/10, 18h16:** a taxa volta a "10% do lado perdedor"; patrocínio 90/10 ("10% é taxa de
   marketing"); slide novo de criadores: qualquer um abre um mercado "como na pump-fun" por 0,02 SOL e fica com 1%
   do pote. PR 17. Em seguida a cena do mascote no slide de criadores (PR 18).
7. **Retratos da equipe, 7/10, 21h34:** "coloque lá e pode subir online em deploy sem testes, imediatamente e rapido".
   PR 19, publicado sem rodar os testes locais, como ele pediu; o CI do pull request rodou.

## Decisões, e porquês

**No `/pitch2`, onde a análise da banca deixava a escolha a ele, apliquei a minha recomendação e disse isso.** Ele
tinha mandado construir e publicar de uma vez para julgar no ar; parar para perguntar seis coisas atrasaria o que ele
pediu. Ficaram: sem a palavra "bet", sem o cartão do token, "From $500" com as faixas em letra pequena, a taxa dita
como regra, concorrentes com nome e o caso dos 7 milhões, uma linha de fase de testes na capa, sem slide de equipe.

**A taxa de 3,5% do pote entrou no deck sem mexer no plano.** Ele pediu a frase no slide, e não disse se a regra do
produto mudava. Escrevi o custo que o plano já tinha achado numa taxa sobre o pote inteiro (com 99% do pote num lado,
quem acerta recebe 0,975 por dólar) e recalculei o equilíbrio pela fórmula do plano, cerca de 221 mil dólares por
mês. Na rodada das regras do `/pitch3` ele voltou aos 10% do lado perdedor, o que encerrou a dúvida.

**Contra a banca, mais mascote, e não menos.** A banca pediu menos pãozinho correndo. Ele preferiu uma cena diferente
por troca, contando uma história. Para isso não virar ruído, três regras de construção: cada cena dura até 1,5
segundo, a troca seguinte cancela a cena em curso, e a tecla `M` desliga todo o movimento. Depois ele pediu o modo
leve (`N`), com a lista dele de cenas por slide.

**Parceiros fictícios com etiqueta.** Ele quis ver o contador de parceiros animado antes de ter parceiros. A lista
nasceu vazia, e só passou a ter as sete marcas que ele desenhou com cada entrada marcada `example`, o cartão dizendo
"example" e um teste que barra tirar a etiqueta enquanto houver exemplo. Um contador "7 of 30" sem essa marca seria
um fato inventado diante de quem assiste.

**As regras novas do deck não foram para o plano naquela hora.** Patrocínio 90/10, qualquer um abrindo mercado em
SOL e o 1% de quem abriu contradiziam o BP v0.0.2. Cada uma foi listada no `CHANGELOG.md` como pendência, com o
custo: o 1% tirado do pote inteiro faz quem acerta pagar parte dele. O plano só mudou no dia seguinte, quando ele
pediu o BP v0.0.3 a partir do pitch (`2026-10-08-bp-v0.0.3-do-pitch.md`).

**Cada arquivo de movimento ganhou um `?v=` próprio.** O Cloudflare manda o navegador guardar scripts por quatro horas;
sem trocar o número, quem já tinha visto o deck continuaria com a versão velha.

## O que deu errado, ou ficou como leitura minha

- **Ordem nova dos slides e a lista do modo leve:** a lista dele foi escrita na ordem antiga. Mantive cada cena com o
  conteúdo do slide, e não com a posição; ele não confirmou.
- **"A comunidade vota o seu lado":** escrevi "picks a side: YES or NO", porque o deck vende "sem votação". Avisei.
- **Quem é quem na equipe** (Bernardo CEO, Lucas COO e CLO, Ronaldo CTO) foi leitura minha pela ordem em que ele
  listou; os cargos inventados de padaria (Head Baker e outros) foram proposta.

## Onde está hoje

Desde 8/10/2026 nenhum desses decks está no ar. Os três foram para `services/landing/history/` (ver
`2026-10-08-mentores-deck-v4-e-termos.md`), e o v4, que nasceu de uma cópia do `/pitch3`, ocupa `/pitch`.
