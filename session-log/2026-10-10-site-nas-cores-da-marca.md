# 2026-10-10 — O site novo nas cores da marca

## Context

O Ronaldo colou um pedido para levar ao site novo (`app/`) a estética da branch `feat/site-3-com-cores-do-deck`, do
Lucas. Essa branch não existe; a mais próxima, `feat/site-3-original-com-cores-do-deck`, não tem configuração do
Tailwind nem estilo do site: tem três versões da página "em breve" (`/3`, `/4` e `/5`, cada uma com o seu arquivo de
cores), o roteiro do deck e o `BRAND.md`, o documento de marca tirado da `/5`, que já está na `main` numa versão mais
nova. O `BRAND.md` §12 diz que o aplicativo ainda não segue a marca, e o §13 deixa em aberto "alinhar
DESIGN-DIRECTION.md e o aplicativo a estas cores". Com isso explicado, o Ronaldo pediu: "port BRAND.md's colors from
the site-3-original branch to our current functional Next.js site, update the tokens.css, check contrast, and update
DESIGN-DIRECTION.md".

## Decision

- **As cores da marca, com os nomes que o site já usa.** O site guarda as cores em `app/styles/tokens.css` com os mesmos
  nomes do `BRAND.md` (`--bg`, `--panel`, `--accent`…). As que a marca define entraram com o valor dela, nos dois temas.
- **O escuro continua abrindo o site.** A `/5` abre no claro, mas a direção aprovada em 3/10 e o pedido mantêm o escuro.
- **Duas diferenças de propósito.** O `--raised` do escuro ficou um passo acima do painel (`#1f2836`): na marca ele é
  igual ao painel, porque a `/5` só o usa numa caixa, e no site ele separa campos e caixas dentro de um painel. O fundo
  das caixas de informação no escuro ficou azul-acinzentado (`#232c3b`): na marca é o verde do "you joined", que é o
  mesmo verde do fundo do YES, e no site ele fica atrás dos avisos e da linha "You" do ranking.
- **O que a marca não define** saiu da mesma paleta, sem azul e com verde e vermelho só no YES e no NO: o chip de
  aberta em laranja, o de resultado final em creme sobre neutro (verde pareceria YES), o bloco do tipo preço em
  azul-ardósia da paleta, o prêmio da barra em laranja, o aviso num âmbar mais amarelo que o destaque.
- **A leitura foi calculada par a par**, e todo texto passa de 4,5 e toda borda de campo e barra de 3 nos dois temas;
  os pares da marca dão os números do `BRAND.md` §5.4. Um teste recalcula tudo e falha se um azul voltar ou se uma cor
  da marca mudar sem o `BRAND.md` mudar; ele foi conferido quebrando o destaque e a letra miúda de propósito.
- **Dois defeitos antigos apareceram com a troca, e foram corrigidos.** O anel do botão principal nunca aparecia: a
  classe virava `background-color`, que não aceita o gradiente. E o botão principal desligado levava as cores do ligado
  e do desligado juntas; a ordem do CSS deixava o texto do ligado, que no escuro agora é o azul-marinho da marca, e o
  texto sumia. O anel é desenhado com `background`, gira só no claro, como a marca pede, e para para quem pede menos
  movimento.
- **As telas foram fotografadas** nos dois temas, no computador e no celular, contra a rede do smoke web: a página de
  campanha aberta, em revisão, esperando pagamento e anulada, o ranking, as taxas, o registro, "How it works" e "My
  entries". Foi assim que o botão desligado apareceu.

## Consequences

- O site novo segue a marca nas cores. A tipografia, os componentes e o resto da direção Ledger² continuam.
- Ficam em aberto, do `BRAND.md` §13: publicar a `/5` como página inicial da landing, levar a marca aos termos e à
  privacidade, e trocar o ícone da aba pelo pão.
