# Servidor e domínio — o que existe e o que foi criado

Levantamento de 5 de outubro de 2026, feito por leitura do projeto vizinho `agenttokenfy` e por consulta direta ao
servidor e ao Cloudflare. Nenhum segredo está neste arquivo: tokens, chaves e endereços IP ficam fora do repositório.

Pedido do fundador: "vamos levar este projeto pro nosso VPS, sem mexer no projeto que tem lá".

## 1. Fatos, conferidos na fonte

### 1.1 O servidor

| Item | Valor | Como foi conferido |
|---|---|---|
| Provedor e plano | Hostinger KVM 2 | `agenttokenfy/docs/adr/ADR-019-self-hosted-platform.md` |
| Processador | 2 vCPU, x86_64 | `nproc`, `uname -m` |
| Memória | 7,9 GB no total; 5,9 GB disponíveis; 2 GB de swap | `free -m` |
| Disco | 97 GB; 78 GB livres | `df -h /` |
| Sistema | Ubuntu 22.04.5 LTS | `lsb_release` |
| Onde fica | Leste dos Estados Unidos | ADR-019 |
| Carga | 0,3 (baixa) | `uptime` |
| Acesso | Atalho de SSH `agent-rails-vps` na máquina do fundador, usuário `lucas`, com sudo sem senha | `~/.ssh/config`, `sudo -n true` |
| Outra pessoa com acesso | `ronaldo` | `getent passwd` |

### 1.2 Quem já mora lá

O servidor é dividido entre dois projetos. As regras de convivência estão em
`agenttokenfy/deploy/vps/README.md` e no ADR-019.

| Projeto | Pastas | Serviços | Portas locais |
|---|---|---|---|
| `ash` (site, email, lista de envio) | `/opt/ash*`, `/var/backups/ash-*`, `/etc/ash-*` | unidades `ash-*`, 15 contêineres Docker no total da máquina | 25, 465, 587, 993 abertas para fora; 9000 local |
| `agent-rails` (painel e banco) | `/srv/agent-rails`, `/etc/agent-rails`, `/var/backups/agent-rails` | `agent-rails-dashboard`, `agent-rails-supabase`, backups | 3000, 8000, 54322, 54329; 4101 a 4103 para demonstrações |

Outras portas em uso: 22 (SSH) e 20241.

### 1.3 As regras da casa (do manual do `agent-rails`)

- Nada abre porta para fora. O tráfego chega por um túnel do Cloudflare. A porta 80 é do `ash`.
- Cada projeto tem um usuário de serviço próprio, sem docker, sem sudo e sem SSH. O que precisa de docker roda como
  unidade do root lendo arquivos do root.
- Segredos ficam em `/etc/<projeto>/*.env`, do root, com permissão 0600 ou 0640. Nunca no repositório nem em chat.
- O código chega como um pacote do Git enviado pelo SSH de quem faz o deploy. O servidor não tem credencial do
  GitHub.
- **Reinício, `apt upgrade` e mudança de firewall, de sshd ou do serviço do docker só com aviso prévio ao outro
  lado.** Reinício, só com o de acordo da outra pessoa.

### 1.4 Ferramentas instaladas

| Ferramenta | Situação |
|---|---|
| Node | v22.23.3 |
| Git | 2.34.1 |
| Docker | 29.8.1 |
| Bun, Rust, Cargo, Solana, Anchor | não instalados |
| gcc, make, pkg-config | não instalados |
| cloudflared no sistema | não instalado (o túnel do outro projeto roda em contêiner) |

### 1.5 O Cloudflare

- O token fica em `F:\AceleradoraECO\agenttokenfy\.aios\secrets\cloudflare.env`, com as variáveis
  `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_API_TOKEN`. A pasta `/startup-se`, citada pelo fundador, não existe.
- O token enxerga 18 domínios da conta e pode ler e editar DNS e configurações de zona em todos.
- **Na manhã de 5/10/2026, `brot.markets` não estava na conta nem respondia no DNS público.** À noite, estava: ver a
  seção 2.1.

## 2. O que foi criado em 5 de outubro de 2026

Só o espaço do projeto e uma cópia do código. Nenhum pacote instalado, nenhuma porta aberta, nenhum serviço ligado,
nenhuma mudança no DNS.

| O que | Dono e permissão | Para quê |
|---|---|---|
| Usuário de serviço `brot` | sistema, sem login; só o próprio grupo | Roda e constrói o que for do projeto |
| `/var/lib/brot-markets` | `brot`, 0750 | Pasta pessoal do usuário de serviço |
| `/srv/brot-markets` | root, 0755 | Raiz do projeto |
| `/srv/brot-markets/repo.git` | `brot`, 0750 | Repositório Git sem pasta de trabalho, que recebe os pacotes |
| `/srv/brot-markets/work/current` | `brot`, 0750 | Cópia de trabalho. Nasceu na branch `feat/layout-tape` e passou para a `main` no fechamento da Sprint 00 |
| `/etc/brot-markets` | root, grupo `brot`, 0750 | Vazia. Lugar dos arquivos de ambiente |

O código chegou como pacote do Git pelo SSH, e o commit no servidor era o mesmo da máquina do fundador (`3222acb`).
No fechamento da Sprint 00, no mesmo dia, a cópia foi levada para a `main`, com a tag `sprint-00`, e é atualizada
a cada merge na `main`.
Depois da criação, o painel do `agent-rails` seguia ativo, os 15 contêineres seguiam rodando e a carga não mudou.

Para desfazer tudo: `sudo userdel -r brot`, `sudo rm -rf /srv/brot-markets /etc/brot-markets`.

## 2.1 O que foi criado em 5 de outubro de 2026, à noite: o site provisório

O fundador avisou que o domínio estava comprado e na conta, e pediu a página "em breve" com o deck em `/pitch`.

**O domínio, como foi encontrado (FATO, consulta à API do Cloudflare).**

| Item | Valor |
|---|---|
| Zona `brot.markets` | Ativa, plano gratuito, criada em 5/10/2026. Servidores de nome do Cloudflare |
| Registros de DNS | Dois, herdados do registrador: `brot.markets` e `*.brot.markets`, os dois apontando para a página de estacionamento do Porkbun, sem passar pelo Cloudflare |
| HTTPS | Modo "full". "Sempre HTTPS" desligado. TLS mínimo 1.0 |
| Roteamento de email | Não configurado |
| O que o endereço mostra | A página de estacionamento do registrador (resposta 200) |

**O que foi criado no servidor.** Nenhum pacote instalado e nenhuma porta aberta para fora.

| O que | Dono e permissão | Para quê |
|---|---|---|
| Unidade `brot-landing.service` | `/etc/systemd/system/`, root | Roda `services/landing/server.mjs` como o usuário `brot`, em `127.0.0.1:4200`, com limite de 256 MB e meio processador |
| `/etc/brot-markets/landing.env` | root, grupo `brot`, 0640 | Porta, endereço público e caminho da lista. Sem segredo |
| `/var/lib/brot-markets/leads` | `brot`, 0700 | A lista de espera (`leads.jsonl`, 0600). É dado pessoal |

Conferido no servidor: os 21 testes passam com o Node de lá; `/healthz`, a página e `/pitch/` respondem 200; uma
inscrição de teste foi gravada e apagada; o serviço usa 15 MB; o painel do outro projeto e os 15 contêineres
seguiam ativos.

**O que foi criado no Cloudflare.** Um túnel chamado `brot-markets` (identificador
`8f186c9a-90b5-4ea1-a8f2-4997204c9095`), só do projeto. Está **inativo**: não tem rota nem conector.

**O que falta para o endereço abrir.** O sistema de permissões da sessão recusou estas ações, e elas esperam a
autorização do fundador:

1. Instalar o `cloudflared` como arquivo único em `/srv/brot-markets/bin`, sem pacote do sistema. A versão escolhida
   é a 2026.9.3, de 24/9/2026, e não a 2026.10.0, que saiu horas antes. Conferir o SHA-256 publicado na página da
   versão.
2. Gravar o token do túnel em `/etc/brot-markets/tunnel.env` (root, 0600) e ligar a unidade `brot-tunnel.service`,
   que está em `services/landing/deploy/`.
3. Definir as rotas do túnel: `brot.markets` e `www.brot.markets` para `http://127.0.0.1:4200`.
4. Trocar o registro de `brot.markets` pelo endereço do túnel, criar o de `www` e apagar o curinga `*.brot.markets`,
   que hoje leva qualquer subdomínio ao estacionamento do registrador.
5. Ligar "Sempre HTTPS" e subir o TLS mínimo para 1.2.

Para desfazer esta parte: parar e desabilitar a unidade `brot-landing`, apagar a unidade, o `landing.env` e a pasta
`leads`, e apagar o túnel `brot-markets` no painel do Cloudflare.

## 3. Inferências (minhas, a validar no plano técnico)

- **O servidor aguenta os serviços do Brot Markets.** Um site em Next.js e dois ou três serviços pequenos em Node
  cabem com folga nos 5,9 GB disponíveis. O painel do outro projeto usa cerca de 600 MB.
- **Compilar o programa da Solana no servidor é o ponto de atenção.** Uma compilação em Rust ocupa os dois
  processadores por vários minutos e pode usar alguns GB de memória, numa máquina que entrega email e serve o painel
  de outro projeto. Além disso, o servidor não tem compilador. As saídas são: compilar dentro de um contêiner, com
  limite de processador e de memória, sem instalar nada no sistema; ou compilar na integração contínua do GitHub e
  levar só o resultado. A primeira não muda nada para os vizinhos; a segunda nem usa o servidor.
- **O segundo serviço agendado não pode morar neste servidor.** A decisão do plano é dois serviços em provedores
  diferentes. Este servidor pode hospedar um deles.
- **Faixa de portas sugerida:** 4200 a 4299, que está livre. Só em `127.0.0.1`.
- **O servidor fica nos Estados Unidos.** Para a leitura da rede Solana isso é indiferente ou melhor; para o usuário
  no Brasil, o site passa pelo Cloudflare de qualquer forma.

## 4. Perguntas em aberto

1. ~~O domínio `brot.markets` foi comprado?~~ Respondida em 5/10/2026: comprado e na conta do Cloudflare.
2. O Ronaldo também usa este servidor. Ele já sabe que o Brot Markets vai morar lá?
3. ~~O túnel do Cloudflare: usar o que já existe ou criar um só do Brot Markets?~~ Decidido no plano técnico: um
   túnel próprio. Criado em 5/10/2026, ainda inativo (seção 2.1).
4. Onde fica o segundo serviço agendado.
