# Colosseum, Crypto World's Fair: rascunho da submissão

- **Situação:** rascunho de 9/10/2026, para o Lucas revisar. Nada foi enviado ao Colosseum.
- **Prazo:** 12/10/2026, 23h59 no horário do Pacífico, que é **3h59 de 13/10 em Brasília** (FATO, regulamento oficial,
  lido em 7/10/2026 e registrado em `knowledge-base/market/pumpfun-model-for-open-markets.md`).
- **Idioma:** todo o conteúdo enviado precisa estar em inglês (FATO, regulamento, §12(a)). Por isso as respostas abaixo
  estão em inglês e as explicações em português.
- **Trilha:** Solana (dez prêmios de US$ 10 mil; FATO, `colosseum.com/worldsfair`, lido em 9/10/2026).

**O que este rascunho não viu.** O formulário de verdade fica dentro do portal, atrás do login, e eu não o abri. Os
campos da seção 1 são os que o Colosseum publica nas perguntas frequentes (`colosseum.com/hackathon`, lido em
9/10/2026). O portal pode ter outros nomes, outros campos e limites de caracteres. Quando o Lucas colar os campos
reais, as respostas são ajustadas campo por campo.

**Uma decisão que este pedido desfaz.** Em 8/10/2026 o fundador respondeu "16 nao se preocupe com deadline", e o BP
v0.0.4 registrou que o hackathon de 12/10 saía do plano (Parte 4, seção 3.2). Em 9/10/2026 ele pediu a submissão. O
plano ainda diz o contrário e precisa de uma linha quando a submissão for confirmada.

## 1. O que o formulário pede, e como estamos

| Campo, como o Colosseum publica | Situação | Onde está a resposta |
|---|---|---|
| "Product name and a brief description" | Pronto para revisar | 2.1 e 2.2 |
| "Which blockchains and tools are being integrated" | Pronto para revisar | 2.3 |
| "All teammates, with context on their backgrounds and previous experience" | **Falta:** os arquivos só têm nome e cargo | 2.4 |
| "Where the team is located" | **Falta:** não está nos arquivos | 2.4 |
| "A product logo or graphic" | Existe o desenho; falta exportar no formato que o portal pedir | 2.5 |
| "A GitHub repository link" | **Decisão:** o repositório é privado | 2.6 |
| Vídeo de apresentação, de dois a três minutos | **Não gravado.** O roteiro existe | 2.7 |
| Vídeo de demonstração, de até três minutos | **Não gravado,** e depende do programa na devnet | 2.7 |
| "Go-to-market strategy, demand validation, and plans for developing distribution" | Pronto para revisar | 2.8 |
| Declarar o trabalho anterior ("must disclose all relevant past development work") | Pronto para revisar | 2.9 |

Além dos campos: cada membro da equipe precisa ter a própria conta no portal ("every team member must create an
account"), e cada pessoa só pode estar em uma submissão.

## 2. As respostas propostas

### 2.1 Nome

> Brot Markets

### 2.2 Descrição curta e descrição longa

**Curta.** É a frase que o Lucas escreveu para a inscrição do DemoDay e pôs na capa do deck em 9/10/2026:

> Permissionless prediction markets that turn on-chain milestones into growth campaigns, settled by the chain itself.

**Longa (proposta).** Parte da frase de elevador aprovada em 7/10/2026 (`PITCH.md`), com as regras do BP v0.0.4: tudo
em SOL e a abertura por US$ 500.

> Brot Markets runs On-Chain Campaigns on Solana: YES/NO questions that an on-chain account answers. A project picks
> a milestone the chain can measure (a token burn, liquidity locked on Meteora, the size of a stake pool, a
> validator's stake, or a Pyth price) and opens a campaign on it for US$500 in SOL; 90% of that becomes the prize.
> Its community joins YES or NO with SOL. At the deadline anyone can trigger the resolution: the program reads the
> target account and settles. No vote, no judge, no opinion oracle. Winners split the pot. Brot keeps 10% of the
> losing side, and the creator earns 1% of the entries. A project's promise becomes a campaign that proves itself.

**A escolha de palavras.** A frase curta diz "prediction markets", que é como o jurado encaixa o projeto; a longa usa
"campaign", que é a palavra do produto desde 8/10/2026. A frase aprovada em 7/10 dizia "sponsor a market"; aqui virou
"opens a campaign". Se o Lucas preferir "market" nas duas, troca-se sem mudar regra nenhuma.

### 2.3 Redes e ferramentas integradas

> Solana (devnet). The program is written in Rust on Pinocchio, with no Anchor. It reads third-party accounts
> directly, checking owner and layout before any byte: Pyth price accounts through the upgraded pull-oracle receiver
> (campaign outcomes, and the SOL/USD price that charges the US$500 opening fee), SPL Token mints (supply after a
> burn), Meteora DAMM v2 pools (locked liquidity), SPL stake pools (size at an epoch) and vote accounts with the
> epoch-stake syscall (a validator's stake). Client: a Shank IDL and a Codama-generated client on @solana/kit. Tests:
> Mollusk and LiteSVM on real mainnet account bytes, plus a Surfpool mainnet-fork scenario. Site and services: Next.js,
> Bun and Node.

Fonte: `CLAUDE.md` e `docs/sprints/sprint-03-readers-resolution.md`.

### 2.4 Equipe e localização

O que os arquivos têm é o slide de equipe do deck (BP v0.0.4, Parte 4, seção 5.1):

| Nome | Cargo no slide |
|---|---|
| Bernardo Nery | Head Baker · CEO |
| Lucas Galvão | Chief Oven Officer · COO and CLO |
| Ronaldo Pereira | Chief Toasting Officer · CTO |

**Falta, e só eles sabem:** a experiência anterior de cada um, em duas ou três frases, e onde a equipe está. Não
escrevi nenhuma das duas coisas, porque não estão nos arquivos.

**Três cuidados.**

- **O de acordo do Bernardo e do Ronaldo.** O plano registra que falta o acordo escrito dos dois para aparecerem com
  nome em versões públicas (decisão 12, ainda aberta). O Colosseum publica os projetos numa página aberta.
- **O plano dizia que a equipe se apresentava como uma pessoa** (`PITCH.md`, seção 10). O portal pede todos os membros,
  e os jurados olham se a equipe "Were the ones to do this work, rather than a third party" (FATO, perguntas
  frequentes, item 13). A leitura segura é listar os três.
- **O histórico do Git tem quatro identidades:** `0xcf02` (82 commits), `lglucas` (74), `0x4cb-caramelo` (36) e
  `0xcf07` (13), contadas na `main` em 9/10/2026. A submissão precisa dizer de quem é cada uma. Não deduzi.

### 2.5 Logotipo

O símbolo aprovado em 9/10/2026 é o pão simples (`docs/product/BRAND.md`, na branch do site, ainda não mesclada). O
desenho de origem é `docs/product/poses/large/14-pao-inteiro.png`, com 1200 × 800 pixels. Falta saber o formato e o
tamanho que o portal pede, para exportar.

### 2.6 Repositório

`https://github.com/0x4cb-caramelo/Bakedtruth`, **privado** em 9/10/2026. O Colosseum aceita repositório privado
"if access is granted to hackathon@colosseum.com for review", e diz que os abertos são "encouraged". O regulamento
também lista "Open-source" entre os critérios (§8).

Dois caminhos:

1. **Dar acesso de leitura a `hackathon@colosseum.com`.** Não expõe nada ao público. Recomendado para o prazo.
2. **Abrir o repositório.** Vale mais no critério de código aberto, mas não se desfaz: o repositório guarda o plano de
   negócio, as notas jurídicas, os registros de decisão com nomes e todo o histórico. Antes de abrir, pede uma
   varredura de segredos no histórico inteiro e a revisão de privacidade que a regra do projeto exige para publicar
   documentos.

A licença do repositório é MIT, em nome de Ronaldo Pereira (`LICENSE`).

### 2.7 Vídeos

- **Apresentação, de dois a três minutos.** "One of the first resources judges review." O roteiro em inglês está em
  `docs/business/roteiro-pitch-v4.md` (426 palavras, cerca de 3 minutos; comitado na branch do site, ainda não
  mesclada), com um corte para 2 minutos. O roteiro segue
  o deck no ar, que ainda fala em USDC, semente e teto; o BP v0.0.4 diz SOL e nenhum teto. Gravar antes de alinhar os
  dois leva a divergência para o vídeo.
- **Demonstração, de até três minutos,** técnica: como o produto funciona, as escolhas de desenho e por que Solana. O
  que dá para mostrar depende do que estiver no ar até o dia (seção 3).
- **Atualizações semanais de um minuto.** O Colosseum pede uma por semana durante o evento. Os arquivos não registram
  nenhuma enviada.

### 2.8 Entrada no mercado, validação de demanda e distribuição

Fonte: BP v0.0.4, Parte 2, seções 2.5, 6.2 e 6.3. Os números de fora são FATO SECUNDÁRIO no plano.

**Go-to-market**

> Our customer is the on-chain project, not the individual trader. Four engines, no paid media. (1) Launch partners:
> 20 to 30 projects each open one campaign on their own milestone for free and show it to their community. (2)
> Referrals: whoever brings a wallet earns 20% of its fee for 90 days, in SOL. (3) Every campaign is a card made to be
> posted on X, and every resolution is a post with the number the program read. (4) The creator earns 1% of the
> entries, so whoever opens a campaign has a reason to promote it.

**Validação de demanda**

> Not demonstrated yet, and we say so plainly. The program is not deployed, so there are no users, and no launch
> partner is signed. What we have: a waitlist on brot.markets, and two rounds of outside feedback (a pitch panel on
> 6 Oct and a mentor review on 8 Oct 2026) that moved the positioning from "one more prediction market" to a growth
> tool for on-chain projects. What we read in the market: prediction markets moved US$21.7B in the 30 days to
> 3 Oct 2026 (DefiRate); on Solana, World inside Phantom grew from US$1.1M a month in June to US$15.4M in September
> 2026 (DefiLlama); and we found no open market on a token burn or on locked liquidity. Three tests are planned: a
> devnet beta with points (wallets that return within 30 days, pots that end one-sided), the free partner campaigns
> (would each partner pay the US$500 for the next one?), and paid campaigns opened by people outside the team.

A confirmar pelo Lucas: quantos emails a lista de espera tem (não consultei o servidor) e como descrever a banca de
6/10 e os mentores de 8/10, que o plano não nomeia.

**Distribuição**

> On Solana, distribution runs through wallets. We start where the projects already speak to their holders: X and
> their own communities, through the partner campaigns and the campaign cards. An Android app for the Solana dApp
> Store is planned, on the same backend. The larger channel, an integration with a wallet, has to be earned with
> months of resolutions without an error. The measure we watch is not volume but the share of wallets that join again
> within 30 days.

### 2.9 Trabalho anterior

> Everything in the repository was written during the hackathon window: the earliest commit in its history is dated
> 1 Oct 2026. Two things to disclose. (1) The project started on 1 Oct as "pred-provable" (Provable KPI Markets), an
> Anchor program by our CTO in which a sponsor sold discounted YES tokens as a bounty on an on-chain goal. On 3 Oct
> we redefined the product as pot-based campaigns and rewrote the program from scratch on Pinocchio
> (programs/brot-markets). What carried over is the way of resolving: four account readers (token supply, Meteora
> DAMM v2 locked liquidity, stake pool size, validator stake) were ported, checked against the old program on the same
> captured mainnet accounts (62 cases), and the old program and Anchor were then removed. (2) The repository was set
> up with a pre-existing process kit (AI Dev OS v0.5.6: working rules, review agents and CI scripts), which holds no
> product code.

**Sugestão minha, a decidir:** dizer também que o código foi escrito com assistentes de IA (os commits trazem essa
atribuição). Não conferi se o regulamento trata do assunto; dizer não custa nada e evita a pergunta.

A confirmar pelo Ronaldo: que o `pred-provable` começou mesmo em 1/10/2026. É o que o histórico deste repositório
mostra; o repositório dele não foi conferido.

## 3. O que existe hoje, para a descrição e para a demonstração

Conferido em 9/10/2026, na `main` e nos pedidos abertos.

| Parte | Situação |
|---|---|
| Programa `brot-markets` (id `6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN`): configuração, equipe e pausa; abertura paga, cobrada em SOL pelo preço SOL/USD da Pyth; entrada em SOL; os cinco leitores; a trava de entrada; `resolve_campaign`, que qualquer carteira dispara e que recusa ser chamada de dentro de outro programa | Na `main` (Sprints 02 e 03) |
| Testes do programa: 255 em Rust e 262 em TypeScript, sobre contas reais capturadas da rede principal, e um cenário num fork da rede principal | Na `main` |
| Liquidação, pagamento, taxas, parte do criador e invariantes | Em revisão, pedido 41 (Sprint 04) |
| A biblioteca do cliente e o ciclo na devnet, "preparado, não publicado": ensaiado num cluster local, sem deploy | Rascunho, pedido 43 (Sprint 05) |
| Programa novo na devnet | **Não publicado** |
| Telas das campanhas | Protótipo, pedido 36; o aplicativo no repositório ainda mostra o programa antigo |
| `brot.markets` (lista de espera), `docs.brot.markets` e o deck em `brot.markets/pitch` | No ar |

**O que isso quer dizer para o vídeo de demonstração.** Hoje dá para mostrar o programa resolvendo nos testes e no
fork da rede principal, e o site. Um ciclo de verdade na devnet (abrir, entrar, resolver, pagar) depende de mesclar os
pedidos 41 e 43 e de publicar o programa, que são decisões do fundador listadas no pedido 43.

## 4. O que depende do Lucas

1. Os campos reais do portal, com os limites de caracteres.
2. A experiência de cada sócio e a localização da equipe.
3. O de acordo do Bernardo e do Ronaldo para aparecerem com nome.
4. De quem é cada uma das quatro identidades do Git.
5. Repositório: acesso ao Colosseum ou abertura.
6. Se o deck e o roteiro são alinhados ao BP v0.0.4 antes de gravar.
7. Se a devnet sai até 12/10 (as decisões do pedido 43) ou se a demonstração mostra os testes e o fork.
8. Quem grava os dois vídeos e quando.
9. O número da lista de espera, se for para citar.
10. Se inscreve também a trilha lateral do Superteam Brasil, de cerca de US$ 5 mil, com prazo às 23h59 de Brasília do
    dia 12 (FATO SECUNDÁRIO, de 7/10/2026; não conferido de novo).
