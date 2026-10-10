# 2026-10-10 — A prévia das telas de campanha em `/dev0x/`

## Pedido

O Ronaldo pediu que as telas da Sprint -1 (`prototype-lab/campaigns/`) fiquem no ar em `brot.markets/dev0x/`, sem
listagem, para o time clicar em cada tela e estado antes da Sprint 06. A entrega é um PR contra a `main`; a mescla e
o deploy esperam a confirmação do Ronaldo, com as palavras dele.

## O que foi decidido

- **Só as telas vieram para a branch nova** (`feat/dev0x-campaigns-preview`, a partir da `origin/main`), com
  `git checkout` dos arquivos de `prototype-lab/campaigns/` da branch `sprint--1-design-system`. Não entrou nada do
  `app/` nem a base antiga do PR #36, que segue em aberto e não foi mesclado.
- **Uma cópia só.** O servidor lê `prototype-lab/campaigns/` do próprio repositório; nada foi copiado para
  `services/landing/public/`.
- **Sem alterar o protótipo.** O script de tema do `index.html` entrou na CSP pelo hash, em vez de virar arquivo.
  Assim, o teste confere o hash contra o próprio HTML: se alguém editar o script, o CI falha antes do deploy.
- **A moldura própria é permitida (`frame-ancestors 'self'`).** A lista de estados (`#/screens`) e o cartão de
  compartilhar se emolduram. Com `'none'`, o Chromium bloqueava as prévias. Continua proibido emoldurar de outra origem.
- **Sem `robots.txt`.** Um `Disallow` impediria o rastreador de ver o `noindex`. A página fica fora da página
  inicial e do `robots.txt`, como manda a regra.
- **`/dev0x` responde 302 para `/dev0x/`**, porque os caminhos do protótipo são relativos.

## O que ficou de fora

- Nenhuma mudança em `/pitch`, na página inicial, nos cabeçalhos da documentação, na lista de espera, no Cloudflare
  ou no DNS.
- Nenhuma mudança em `public/robots.txt`.

## Verificação

- `node --test "services/landing/tests/*.test.mjs"`: 45 de 45 (36 antigos e 9 novos em `tests/dev0x.test.mjs`).
- Chromium headless, em 21 endereços (todas as rotas e os estados do cabeçalho): nenhum erro de CSP. Uma mensagem
  de console que o protótipo escreve de propósito (`Prototype state`), e um aviso do cabeçalho `Permissions-Policy`
  (`interest-cohort`) que já existia nas outras páginas.
- A rota de cada tela abre o próprio título.

## Pendências registradas

- O cabeçalho `Permissions-Policy` manda `interest-cohort`, que o Chromium não reconhece. É de todas as páginas do
  site; mexer nele é outra decisão, não deste PR.
- Nomes de projetos reais (validador e tokens) aparecem no mock. Confirmar com o Ronaldo antes de uma versão pública.
