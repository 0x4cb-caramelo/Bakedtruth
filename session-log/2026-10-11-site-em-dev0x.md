# 2026-10-11 — O site em `brot.markets/dev0x`

## O pedido

Chegou num texto colado, pedindo duas coisas: resolver os conflitos do PR #69 e mesclá-lo com o CI verde, e preparar
o site (`app/`) para responder em `brot.markets/dev0x`, com a raiz do domínio intocada (a página de espera), para os
jurados do Colosseum e o vídeo da demo. O texto pedia Nginx e PM2.

Antes de agir, a sessão conferiu o que o texto supunha e perguntou ao Ronaldo quatro coisas. As respostas dele:

- **O #69 mesclado como está**, com o `content/README.md` aprovado só por ele; a segunda revisão (Lucas ou Bernardo)
  fica aberta depois da mescla.
- **A prévia do protótipo vai para `/prototype/`.** Ela morava em `/dev0x/`, servida pelo landing, e o site ia ocupar
  esse caminho.
- **Túnel e systemd**, como o servidor já é. Não há Nginx nem PM2 lá: o `brot.markets` chega pelo túnel do Cloudflare,
  cujas rotas ficam no painel, e cada serviço é uma unidade do systemd em `127.0.0.1`.
- **A API de leitura em `brot.markets/api/v1`**, no mesmo endereço do site, sem CORS. Sem ela o site não aceita
  entradas (K-11), e ela não estava no servidor.

## A mescla do #69

A revisão visual (PR #70) tinha entrado na `main` antes, e a `main` entrou na branch da Sprint 08 com cinco
conflitos: a mudança, o índice das sessões, as decisões do dia, o mapa do código (gerado de novo) e as importações de
um teste na web. Ficaram as duas entradas de cada lado. O teste na web passou inteiro (44), a bateria toda também
(737, e as três do proxy de CPI que só o CI monta), o CI ficou verde, e o #69 entrou pela mescla `4002577`, com o CI
da `main` verde depois.

O autoteste do sistema operacional do projeto disse "incoerente" nesta máquina, mas só por uma cópia antiga de um
agente em `.claude/worktrees/`, ignorada pelo Git; fora dela não havia erro, e o CI, que parte de uma cópia limpa,
passou.

## O caminho base

- **Vem do ambiente, no build:** `NEXT_PUBLIC_BASE_PATH=/dev0x`, em `deploy/vps/site-build.conf`. Aqui e no teste na
  web ele fica vazio, e nada muda. Fixar `/dev0x` no código obrigaria a reescrever a navegação de todos os testes.
- **O Next prefixa sozinho** os links, o roteador e os próprios arquivos. Não prefixa um `<img src>`, os ícones do
  manifesto nem o ícone que o site entrega à carteira do celular: esses passam por `app/lib/base-path.ts`. A busca
  no código achou só esses lugares, e nenhum endereço montado à mão.
- **`noindex` sob o caminho base**, como a prévia que estava em `/dev0x/` sempre teve. Os jurados entram pelo link;
  deixar o site num buscador é decisão do fundador.

## No servidor

Duas unidades, cada uma com seu usuário, no padrão das do keeper e do relay: `brot-site` (o Next sob o Bun fixado, o
mesmo comando que o teste na web roda no modo Bun, em `127.0.0.1:4230`) e `brot-api` (em `127.0.0.1:4220`). Usuários
separados porque, se a API um dia usar uma RPC com chave, o processo do site não deve conseguir ler a configuração
dela. Duas rotas novas no painel do túnel, acima da do landing, porque o túnel usa a primeira rota que casar. Os
passos estão em `deploy/vps/README.md` ("The site under /dev0x").

## O ensaio, e o defeito que ele pegou

Os passos do servidor foram repetidos aqui: um `git archive` da árvore, `bun install --frozen-lockfile
--ignore-scripts`, o build sob o Bun com `site-build.conf`, a API e o site rodando dessa cópia.

A primeira subida respondeu 200 na raiz e 404 em `/dev0x`. O `next start` lê o `next.config.ts` de novo ao subir, e o
caminho base só existia no ambiente do build. A unidade agora carrega o mesmo `site-build.conf`
(`EnvironmentFile=`). Na segunda subida, num navegador:

- todos os links internos de cinco páginas ficaram sob `/dev0x`;
- o Baked, os ícones e o manifesto vieram com o prefixo;
- a busca e a página de uma campanha funcionaram;
- nenhum pedido ao próprio site falhou.

O único erro no console é a folha de estilo do Google que o pacote da carteira pede e a política de segurança do site
bloqueia, igual à `main`.

## O CI do PR #71

O primeiro CI do #71 falhou no autoteste do projeto: o `/dev0x` entre crases, no mapa do código, parecia um comando
que não existe. Ele entrou na lista de caminhos do site que o autoteste aceita, ao lado de `/abrir` e `/rpc`, com o
`/prototype` do landing.

## O que fica com o Ronaldo e o fundador

- Rodar os passos no servidor e criar as duas rotas no painel do Cloudflare.
- A RPC pública do devnet responde 429 sob carga. Se a demo precisar de mais, uma URL com chave vai só para a API (o
  arquivo de configuração dela fica só para o root), e o navegador espera o relay (3a).
- Decidir se o site sai do `noindex` depois do Hackathon.
- A segunda revisão do `content/README.md`, agora já na `main`.
