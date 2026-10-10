# services/landing

O site "em breve" do Brot Markets: a página inicial com a lista de espera, os termos, a privacidade e o deck em
`/pitch`. O mesmo serviço responde por `docs.brot.markets`, a documentação. É provisório. Na Sprint 09 o site de verdade (`app/`, em Next.js) assume o endereço e esta pasta sai.

Não tem dependências. Roda com o Node que já existe no servidor (22 ou mais novo).

## O que tem aqui

| Caminho | O que é |
|---|---|
| `server.mjs` | Entrada HTTP: cabeçalhos de segurança, `/healthz`, API da lista e arquivos estáticos; no endereço `docs.`, as páginas de `docs-site/` |
| `lib/api.mjs` | `POST /api/leads` (entrar) e `POST /api/leads/remove` (sair) |
| `lib/leads.mjs` | Validação do email e o arquivo da lista |
| `lib/rate-limit.mjs` | Limite de pedidos por endereço, só em memória |
| `lib/static.mjs` | Serve `public/`, sem deixar sair da pasta |
| `lib/campaigns.mjs` | Serve a prévia das telas de campanha em `/dev0x/`, a partir de `prototype-lab/campaigns/` (uma cópia só) e com a CSP do protótipo |
| `public/` | Página inicial, privacidade, 404, fontes e imagens |
| `public/terms.html`, `public/privacy.html` | Termos e privacidade, gerados de `docs/legal/*.md` por `scripts/build-legal.mjs`. Edite o texto lá e rode o script; os testes falham se página e texto divergirem |
| `public/2/` | A página inicial com o visual do deck (opção A, 9/10/2026), em `/2`, fora dos buscadores: o mesmo conteúdo de `index.html`, palavra por palavra (`tests/two.test.mjs` compara), com `base.css` e `home.css` próprios e as fontes de `public/pitch/`. Mudou o texto da página inicial? Mude aqui também |
| `public/mascot*.js` | O Baked andando pela página inicial: `mascot.js` decide onde ele fica, `mascot-body.js` desenha, `mascot-senses.js` percebe o ponteiro, a rolagem e o teclado. Não guarda nem envia nada |
| `public/pitch/` | O deck, desde 8/10/2026 o v4: nove slides, a demo animada e uma cena do mascote por troca, com os modos completo, leve (`N`) e desligado (`M`). Um palco leve (`deck.js`, `deck.css`) e o movimento em módulos curtos (`motion.js` decide; `scenes.js`, `exits.js`, `lever.js`, `team.js` têm as cenas; `sprites.js` as imagens de `img/`) |
| `history/` | Os decks anteriores, guardados só como história, sem ser servidos: `pitch-1` (os oito slides do fundador), `pitch-2` (a resposta à banca) e `pitch-3` (o de dez slides), cada um com o seu roteiro de fala. Os endereços `/pitch2`, `/pitch3` e `/pitch4` levam ao deck atual |
| `docs-site/` | `docs.brot.markets`. As páginas são geradas de `docs/wiki/` por `scripts/build-docs.mjs` (o menu está no script); edite o texto lá e rode o script. `docs.css` é escrito à mão. Desse endereço o servidor só empresta do `public/` as imagens, as fontes, `styles.css` e `app.js`. Fica fora dos buscadores (`X-Robots-Tag`) até o fundador aprovar |
| `scripts/markdown.mjs` | O conversor do Markdown simples que os termos e o wiki usam, comum aos dois geradores |
| `deploy/` | As duas unidades do systemd: o site e o túnel do Cloudflare |
| `tests/` | Testes do armazenamento, do limitador, do servidor por HTTP e do que as páginas prometem (`pages.test.mjs`) |

## Rodar e testar

```bash
node services/landing/server.mjs            # http://localhost:4200
node --test "services/landing/tests/*.test.mjs"
```

Sem configuração, a lista vai para `services/landing/data/leads.jsonl`, que o Git ignora. As variáveis estão em
`.env.example`.

## A lista de espera

Cada inscrito é uma linha:

```json
{"email":"pessoa@exemplo.com","at":"2026-10-05T21:00:00.000Z","consent":"v1-2026-10-05","source":"landing"}
```

- **Não grava** IP, navegador nem localização. O endereço de quem pede serve só de chave do limitador, em memória.
- **Entrar duas vezes** e **sair sem estar na lista** respondem "ok", para a API não revelar quem está inscrito.
- **Sair** apaga a linha na hora (`/privacy` tem o formulário).
- **Doze meses** depois da inscrição a linha é apagada sozinha, na partida do serviço e a cada 24 horas. A página de
  privacidade promete esse prazo: mudar um exige mudar o outro (`RETENTION_MS` em `server.mjs`).
- **Teto de 50 mil linhas**, para uma enxurrada não encher o disco de um servidor dividido.
- **Mudou a frase de consentimento** embaixo do formulário? Suba `CONSENT_VERSION` em `lib/leads.mjs`.

No servidor o arquivo é `/var/lib/brot-markets/leads/leads.jsonl`, do usuário `brot`, com permissão 0600. Quem lê:
o próprio serviço e quem administra o servidor. Para contar ou exportar:

```bash
sudo wc -l /var/lib/brot-markets/leads/leads.jsonl
sudo cat /var/lib/brot-markets/leads/leads.jsonl      # é dado pessoal: não cole em chat nem em issue
```

As nove perguntas de privacidade respondidas estão em `docs/technical/TECHNICAL-PLAN.md`.

## O deck em `/pitch`

- **Só por link.** A página manda `noindex` (na marcação e no cabeçalho `X-Robots-Tag`), a página inicial não aponta
  para ela e o `robots.txt` não a cita. Isso muda quando o fundador aprovar, linha por linha, o portão de redação de
  `docs/business/PITCH.md`. Um teste falha se alguém ligar a página inicial ao deck antes disso.
- **Navegação:** setas, espaço, clique, deslizar, `F` para tela cheia, `#3` no endereço abre o slide 3. No celular
  em pé os slides ficam empilhados.
- **PDF:** imprimir a página (Ctrl+P) gera um slide por folha, em 1920 × 1080.
- **Um deck só no ar.** As versões anteriores ficam em `history/`, fora do que o servidor entrega; o `README` de lá
  diz como abrir uma delas de novo. Os endereços antigos (`/pitch2` a `/pitch9`) redirecionam para `/pitch/`.
- **Editar um slide:** cada `<section class="slide">` de `public/pitch/index.html` é um slide, num quadro de
  1920 × 1080, com os estilos na própria marcação, como o fundador desenhou.

## A prévia das telas em `/dev0x/`

- **Para o time, sem link.** As telas de campanha (`prototype-lab/campaigns/`, dados de mentira, nada se conecta
  à carteira nem à rede) saem em `/dev0x/`. A página manda `noindex, nofollow, noarchive`, a página inicial não aponta
  para ela e o `robots.txt` não a cita. `/dev0x` leva a `/dev0x/` (302), porque os caminhos do protótipo são relativos.
- **CSP própria.** Só o que o protótipo usa: os arquivos da própria origem, o script inline de tema por hash (o
  `tests/dev0x.test.mjs` recalcula o hash do `index.html`) e estilos inline só nos atributos `style` que o código
  escreve. Pode ser emoldurada pela própria origem (`frame-ancestors 'self'`), porque a lista de estados e o cartão
  de compartilhar se emolduram; de outra origem, não.
- **Dados de mentira, conferidos.** O protótipo não tem e-mail nem nome de pessoa; as carteiras são `Demo…`, e as demais
  contas são rotuladas no próprio mock como feeds de preço. Nomes de projetos reais (validador, tokens) precisam de
  confirmação do Ronaldo antes de uma versão pública, e a equipe só aparece com acordo por escrito (BP, P-9).

## Publicar no servidor

O desenho é o do plano técnico: o site escuta em `127.0.0.1:4200` e só o túnel do Cloudflare do próprio projeto
chega nele. Nenhuma porta abre para fora.

1. Levar o código: pacote do Git enviado por SSH para `/srv/brot-markets/repo.git`, e a cópia de trabalho em
   `/srv/brot-markets/work/current` atualizada para a `main`.
2. Na primeira vez: criar `/var/lib/brot-markets/leads` (dono `brot`, 0700), `/etc/brot-markets/landing.env` a
   partir de `.env.example`, e instalar `deploy/brot-landing.service`.
3. A cada atualização: `sudo systemctl restart brot-landing` e conferir `curl -s localhost:4200/healthz`.

O túnel (`deploy/brot-tunnel.service`) só precisa ser mexido se o endereço ou a porta mudarem. O passo a passo da
primeira instalação e os nomes criados no Cloudflare estão em `knowledge-base/tecnologia/servidor-e-dominio.md`.
