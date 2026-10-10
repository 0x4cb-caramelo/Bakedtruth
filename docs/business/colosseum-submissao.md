# Colosseum, Crypto World's Fair: rascunho da submissão

- **Situação:** rascunho de 9/10/2026, para o Lucas revisar. Nada foi enviado ao Colosseum.
- **Prazo:** 12/10/2026, 23h59 no horário do Pacífico, que é **3h59 de 13/10 em Brasília** (FATO, regulamento oficial,
  lido em 7/10/2026 e registrado em `knowledge-base/market/pumpfun-model-for-open-markets.md`).
- **Idioma:** todo o conteúdo enviado precisa estar em inglês (FATO, regulamento, §12(a)). Por isso as respostas abaixo
  estão em inglês e as explicações em português.
- **Trilha:** Solana (dez prêmios de US$ 10 mil; FATO, `colosseum.com/worldsfair`, lido em 9/10/2026).

**O que este rascunho não viu.** A primeira aba do formulário de verdade chegou depois e está na seção 5; as outras
duas ainda não. O formulário fica dentro do portal, atrás do login, e eu não o abri. Os
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

Escritas em 9/10/2026, antes de o programa ir para a devnet e antes de a primeira aba do formulário chegar. Onde
divergem das seções 3 e 5, valem as seções 3 e 5: em especial, "The program is not deployed", na validação de
demanda, deixou de ser verdade.

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

Conferido em 10/10/2026, de madrugada, na `main` (f48237b) e na devnet. Na noite de 9 para 10/10 o Ronaldo mesclou os
pedidos 41, 44, 45 e 43 e publicou o programa; a versão de 9/10 desta seção dizia que nada disso tinha acontecido.

| Parte | Situação |
|---|---|
| Programa `brot-markets`: abertura paga em SOL pelo preço SOL/USD da Pyth, entrada, os cinco leitores, a trava de entrada, a resolução, a janela da equipe (confirma ou anula, nunca inverte), a liquidação, o pagamento, a taxa e a parte do criador | Na `main` (Sprints 02 a 05) |
| Programa na devnet | **Publicado** em 9/10/2026, 23h27 de Brasília, no id novo `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o` (o id antigo, `6G2d…uVN`, foi abandonado). Li a conta na rede em 10/10: existe, é executável, e tinha 54 transações, 52 com sucesso |
| Ciclo inteiro na devnet, por script | Rodou: abertura paga de US$ 500 (4,5617 SOL a 109,61), entradas no SIM e no NÃO, resultado lido de um token queimado, confirmação da equipe, pagamento, parte do criador e taxa. As assinaturas estão em `session-log/2026-10-09-sprint-05-respostas-do-deploy-e-leituras-devnet.md`, na `main` |
| Campanhas abertas na devnet para o site | Três, da equipe: BTC/USD, SOL/USD e uma queima |
| Tipos na devnet | Preço e queima rodam. Meteora e pool de staking só foram testados com contas reais da rede principal: não há pool na devnet. Stake de validador está construído e desligado em toda compilação, até haver um SIM registrado na devnet |
| Testes | 436 em Rust e 307 em TypeScript, como registrado no fechamento da Sprint 04; a Sprint 05 acrescentou os da biblioteca. **Não rodei os testes nesta sessão**; o número vem dos registros de sprint |
| Biblioteca do cliente (`@brot/sdk`) | Na `main`: refaz 24.000 contas geradas pelo programa, sem divergência |
| Serviço que resolve e paga sozinho | Não existe ainda (Sprint 06). Na devnet, quem aciona é um script |
| Telas das campanhas | Protótipo, pedido 36; o aplicativo no repositório ainda mostra o programa antigo |
| `README.md` na raiz | **Ainda descreve o `pred-provable`,** o programa antigo, com Anchor e USDC. É a primeira página que um jurado abre |
| `brot.markets` (lista de espera), `docs.brot.markets` e o deck em `brot.markets/pitch` | No ar |

**O que isso quer dizer para o vídeo de demonstração.** Dá para mostrar um ciclo de verdade na devnet, pelo terminal,
com as transações abertas num explorador. Não dá para mostrar um site em que alguém entra numa campanha: as telas não
existem.

## 4. O que depende do Lucas

1. Os campos reais do portal, com os limites de caracteres.
2. A experiência de cada sócio e a localização da equipe.
3. O de acordo do Bernardo e do Ronaldo para aparecerem com nome.
4. De quem é cada uma das quatro identidades do Git.
5. Repositório: acesso ao Colosseum ou abertura.
6. Se o deck e o roteiro são alinhados ao BP v0.0.4 antes de gravar.
7. Resolvido em 9/10/2026: o programa está na devnet (seção 3). Falta decidir se o `README.md` é reescrito antes de
   dar acesso ao repositório.
8. Quem grava os dois vídeos e quando.
9. O número da lista de espera, se for para citar.
10. Se inscreve também a trilha lateral do Superteam Brasil, de cerca de US$ 5 mil, com prazo às 23h59 de Brasília do
    dia 12 (FATO SECUNDÁRIO, de 7/10/2026; não conferido de novo).

## 5. O formulário real, parte 1: "Project details"

Em 9/10/2026 o Lucas colou a primeira aba do portal, com os campos e os limites, e pediu "as melhores possíveis
respostas para ser [considerado] e avaliado por uma AI, baseado em nosso pitch, em especial". Em 10/10/2026 pediu
"respostas melhores, mais longas e bem pensadas", na ordem das perguntas. Esta é a segunda versão; a primeira está no
commit 05e33bd. As respostas substituem as da seção 2 onde tratam do mesmo campo. Faltam as abas "Media and code" e
"Team".

**O que mudou da primeira para a segunda versão.**

- **O programa está na devnet,** e um ciclo inteiro rodou lá (seção 3). A primeira versão dizia "abre, recebe entradas
  e resolve"; esta diz o que rodou e dá o endereço, que qualquer revisor confere.
- **Cada resposta usa quase todo o limite.** A contagem trata cada quebra de linha como dois caracteres.
- **Os cinco tipos têm o estado de cada um,** no campo de tecnologias, que não tem limite: dois rodam na devnet, dois
  esperam uma pool de teste, um está desligado.
- **A janela da equipe aparece.** As respostas dizem "sem voto, sem juiz"; a equipe pode anular um resultado e devolver
  tudo, e nunca inverter. Quem lê o código acha isso, então a resposta diz antes.
- **"517 testes" virou "mais de 740",** pelos registros de sprint. Não rodei os testes nesta sessão.

**Como foram escritas.** A história é a do deck (o problema de quem decide, o caso de US$ 7 milhões, "Proof >
Promises", os números do mercado), e as regras são as do programa e do BP v0.0.4 (tudo em SOL). O deck no ar ainda diz
USDC, semente e teto. Cada resposta responde à pergunta na primeira frase, traz número com fonte e diz o que ainda não
existe, porque um revisor automático compara os campos entre si e com o repositório.

**A conferir pelo Lucas antes de colar.**

- **As identidades do Git** na penúltima resposta são leitura minha, e não fato confirmado: `lglucas` é o usuário do
  Git nesta máquina e `0x4cb-caramelo` é a conta que publica daqui; o `README.md` diz que o `pred-provable` é do
  Ronaldo e o hospeda em `0xcf07`; `0xcf02` assina o primeiro commit dele e as Sprints 04 e 05.
- **Ninguém de fora.** A resposta diz "No". Se alguém de fora desenhou o mascote ou o deck, ela muda.
- **Outras ferramentas de IA,** se a equipe usou alguma além do Claude Code (imagens do mascote, o deck). A pergunta
  pede todas.

Os campos seguem a ordem do formulário.

**Accelerator application (o botão no topo)**

Decisão dos sócios. Marcar inclui a candidatura à aceleradora (US$ 250 mil de pré-seed, pelo regulamento) e deve abrir
mais perguntas.

**Project name**

```text
Brot Markets
```

**Brief description** (491 de 500 caracteres)

```text
Brot Markets is a permissionless prediction market on Solana where the chain itself decides the result. A project opens a YES/NO campaign on a milestone Solana can measure (a token burn, liquidity locked on Meteora, staked SOL, a Pyth price) and funds the prize. Its community takes sides with SOL. At the deadline the program reads the target account and the winners split the pot. No vote, no judge, no opinion oracle: anyone can re-read the same account. Live on devnet. Proof > Promises.
```

**Project website**

```text
https://brot.markets
```

**What are you building, and who is it for?** (996 de 1000 caracteres)

```text
We are building prediction markets with nobody in the middle: the program reads the outcome from a Solana account. No person, token vote or AI model reports it. Each market is an On-Chain Campaign.

Who it is for:
1. On-chain projects, our paying customer. A team that promised its holders something measurable (burn 100M tokens by Nov 30, lock liquidity on Meteora, reach a stake target) opens a campaign on it for US$500 in SOL, and 90% becomes the prize for its community. A promise that lived in a post nobody checks becomes a public countdown the chain settles.
2. Their communities, and any Solana wallet: join YES or NO with SOL, no sign-up; winners split the pot, paid straight to the wallet.

Brot keeps 10% of the losing side; the creator earns 1% of entries, a reason to promote it.

Working today on devnet: a full cycle ran end to end. A US$500 opening paid in SOL at the Pyth price, YES and NO entries, the result read from a burned mint, then winners, creator and fee paid.
```

**Why did you decide to build this, and why build it now?** (995 de 1000 caracteres)

```text
Why: in every prediction market someone stands between the event and your payout. In March 2025 a US$7M Polymarket market settled on an event that never happened, with no refunds. Disputes there go to a token vote that takes 4 to 6 days; World writes results with a company key; PNP asks two language models. We asked the opposite question: which markets need nobody? Those whose answer already sits in an on-chain account. That limit became the product. What a chain can prove (a burn, locked liquidity, stake, a price) is what crypto projects promise their holders, and nobody holds them to it. So the project is our customer, not our topic: it funds a campaign on its own promise, and the chain shows whether it delivered.

Why now: the category is large and new, US$21.7B in 30 days (DefiRate), and on Solana it has barely started: World in Phantom went from US$1.1M a month in June to US$15.4M in September 2026 (DefiLlama). We found no live market on a token burn or on locked liquidity.
```

**What technologies are you using or integrating with to build your product?**

Sem limite na tela; 2365 caracteres.

```text
On-chain program: Rust on Pinocchio (Anza), no Anchor, built with cargo build-sbf in CI. It holds a closed set of five account readers, one file each, and each checks the owner and the layout of an account before reading a byte:
- Pyth pull oracle (the upgraded receiver): campaign prices, and the SOL/USD price that turns the US$500 opening fee into lamports.
- SPL Token mint: supply after a burn.
- Meteora DAMM v2 pool: permanently locked liquidity.
- SPL Stake Pool: the pool's size at an epoch.
- Vote account plus the sol_get_epoch_stake syscall: a validator's stake.
Every instruction emits one event by self-CPI, and clippy denies unchecked arithmetic and truncating casts in the crate.

Client: Shank IDL, a Codama-generated TypeScript client, @solana/kit and zod. Our SDK (@brot/sdk) has a read half and a transaction half and mirrors the program's fee and payout math: it replays 24,000 vectors produced by the Rust code with zero mismatches, on Bun and on Hermes (React Native), so the web app and the planned Android app share one library.

Testing: Mollusk and LiteSVM on real mainnet account bytes captured as fixtures (SHA-256 pinned), Surfpool for a mainnet-fork scenario, and a mutation script showing that every hand-written account check has a test that fails without it. More than 740 automated tests (436 in Rust, over 300 in TypeScript).

CI and deploy: GitHub Actions (build, tests, clippy, rustfmt, IDL drift, secret scan, a Metro and Hermes bundle job). The devnet binary is CI's artifact, verified by SHA-256 and deployed on the upgradeable loader. Program on devnet: 5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o.

Status by campaign type on devnet: price and burn campaigns are open and a full cycle has settled; the Meteora and stake-pool types are tested on mainnet bytes and wait for a devnet pool; the validator-stake type is built and stays switched off until a YES is recorded on devnet.

Web: Next.js (App Router), Tailwind CSS, Solana wallet-adapter and Bun; the landing site and the docs run on plain Node with no dependencies, behind Cloudflare.

AI tools: Claude Code (Anthropic) wrote much of the code, tests and documentation under our direction and ran adversarial reviews (a security red team and a coordinator pass) before sprints were merged. Every pull request was merged on a team member's decision.
```

**Which chains does your product use?**

Só `Solana`.

**How does your product use these chains?** (480 de 500 caracteres)

```text
Solana is the product, not a settlement layer under it. One Solana program holds each campaign's pot in SOL in a program-owned vault and settles by reading other Solana accounts directly: a Pyth price, an SPL mint's supply, a Meteora DAMM v2 pool, a stake pool, a validator's epoch stake. The US$500 opening fee is charged in SOL at the on-chain Pyth SOL/USD price. Entries, payouts and fees are SOL, wallet to program. Live on devnet: 5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o
```

**What category best describes your product?**

As opções chegaram em 10/10/2026, numa imagem da lista: DeFi, Real World Assets (RWA), RegTech & Compliance, FinTech,
Markets & Exchanges, DePIN, Developer Infrastructure, Consumer Apps, AI Platforms / Agents, Gaming, Wallet
Infrastructure, Security Tools, Social / SocialFi, NFTs, Governance/DAOs, Climate, EdTech, Supply Chain e Other. Não há
uma de mercados de previsão.

Recomendação: **Markets & Exchanges**. É a única que contém a palavra que a descrição pública usa na primeira frase
("prediction market"), e um revisor que compara os campos entre si lê as duas juntas. "Consumer Apps" é a segunda
opção: o Melee, o precedente mais próximo, foi premiado em Consumer no Breakout (FATO, registro do Colosseum, em
knowledge-base/market/pumpfun-model-for-open-markets.md), mas o Brot ainda não tem tela para o usuário, e o cliente
que paga é o projeto. "DeFi", que aparecia selecionada na imagem, descreve pior: não há empréstimo, troca nem
rendimento.

**Is your project a mobile-focused dApp?**

`No`. O app Android está no plano e não foi construído.

**Where is your team primarily based?**

O país onde os sócios moram. Não está nos arquivos.

**Please share a team Telegram contact**

Não está nos arquivos.

**Did anyone not listed on the team here do meaningful work on this project?** (573 de 600 caracteres)

```text
No. Every product decision, review and merge was made by the team members listed. Three notes so the history reads correctly. (1) Git shows four author identities for two people: 0xcf02 and 0xcf07 are Ronaldo Pereira (CTO); lglucas and 0x4cb-caramelo are Lucas Galvão. (2) Much of the code, tests and documentation was written with an AI coding assistant (Claude Code), directed and reviewed by us; it appears as co-author in commits. (3) The repository was set up with AI Dev OS v0.5.6, a pre-existing process kit (working rules and CI scripts) that holds no product code.
```

**Is there anything else judges should know about your project that isn't captured above?** (497 de 500 caracteres)

A primeira colagem mostrava o limite de 500; a segunda não mostrou o contador deste campo.

```text
Everything was built inside the hackathon window: first commit on 1 Oct 2026. It began that day as pred-provable, an Anchor program by our CTO (sponsor-priced YES tokens). On 3 Oct we redefined it as pot-based campaigns and rewrote it on Pinocchio; four readers were ported and checked against the old program on the same mainnet accounts (62 cases). Limits: devnet only, unaudited, no real money. The team can void a result (full refund), never flip it. Mainnet waits for an audit and a multisig.
```

**O aviso no topo da página:** "Você ainda não está inscrito no Colosseum 2026 pela Superteam Brasil. Inscreva-se em
hackathon.superteam.com.br". A inscrição pela Superteam Brasil é um passo à parte, ainda não feito.
