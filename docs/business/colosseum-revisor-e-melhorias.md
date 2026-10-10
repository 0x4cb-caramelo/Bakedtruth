# Colosseum: o que foi ao revisor, o que voltou e o que falta melhorar

- **Situação:** 10/10/2026. Nada foi enviado ao Colosseum. O formulário está preenchido no espelho da Superteam
  Brasil (`revisor.superteam.com.br`), que dá uma nota e devolve sugestões, e não envia nada.
- **Prazo:** 12/10/2026, 23h59 do Pacífico, que é 3h59 de 13/10 em Brasília.
- **Nota do revisor:** 61 de 100, com dois bloqueios que desclassificam: os vídeos e duas respostas em português.
- **Onde está o porquê de cada resposta:** `docs/business/colosseum-submissao.md`, seções 5 a 8. Este documento junta
  o texto que foi ao revisor, o retorno e a lista do que falta.

**O que este documento não viu.** Eu não abri o formulário nem o revisor: o Lucas colou as perguntas e o retorno. As
respostas da seção 1 são as que escrevi para cada campo. O que está de fato na tela só ele vê; onde o revisor citou um
trecho, está dito. O que ele preencheu por conta própria e o revisor não citou não está aqui.

**Dados pessoais.** Idade, gênero, cidade e participação na empresa não estão neste repositório e não devem entrar:
os jurados podem receber acesso de leitura a ele.

## 1. O que foi ao revisor

Os textos estão em inglês porque o regulamento exige (§12(a)). A contagem trata cada quebra de linha como dois
caracteres.

### 1.1 Aba "Project details"

É a segunda versão das respostas, de 10/10/2026, escrita depois que o programa foi publicado na devnet. O botão
"Accelerator application" é decisão dos sócios; não sei como ficou.

**Project name**

```text
Brot Markets
```

**Brief description** (491 de 500 caracteres)

O revisor citou o fim desta resposta: é a que estava na tela.

```text
Brot Markets is a permissionless prediction market on Solana where the chain itself decides the result. A project opens a YES/NO campaign on a milestone Solana can measure (a token burn, liquidity locked on Meteora, staked SOL, a Pyth price) and funds the prize. Its community takes sides with SOL. At the deadline the program reads the target account and the winners split the pot. No vote, no judge, no opinion oracle: anyone can re-read the same account. Live on devnet. Proof > Promises.
```

**Project website**

```text
https://brot.markets
```

**What are you building, and who is it for?** (996 de 1000 caracteres)

O revisor a pôs entre as fortes, e ainda assim pediu a frase sobre quem controla o resultado (seção 4).

```text
We are building prediction markets with nobody in the middle: the program reads the outcome from a Solana account. No person, token vote or AI model reports it. Each market is an On-Chain Campaign.

Who it is for:
1. On-chain projects, our paying customer. A team that promised its holders something measurable (burn 100M tokens by Nov 30, lock liquidity on Meteora, reach a stake target) opens a campaign on it for US$500 in SOL, and 90% becomes the prize for its community. A promise that lived in a post nobody checks becomes a public countdown the chain settles.
2. Their communities, and any Solana wallet: join YES or NO with SOL, no sign-up; winners split the pot, paid straight to the wallet.

Brot keeps 10% of the losing side; the creator earns 1% of entries, a reason to promote it.

Working today on devnet: a full cycle ran end to end. A US$500 opening paid in SOL at the Pyth price, YES and NO entries, the result read from a burned mint, then winners, creator and fee paid.
```

**Why did you decide to build this, and why build it now?** (995 de 1000 caracteres)

Nota do revisor: OK.

```text
Why: in every prediction market someone stands between the event and your payout. In March 2025 a US$7M Polymarket market settled on an event that never happened, with no refunds. Disputes there go to a token vote that takes 4 to 6 days; World writes results with a company key; PNP asks two language models. We asked the opposite question: which markets need nobody? Those whose answer already sits in an on-chain account. That limit became the product. What a chain can prove (a burn, locked liquidity, stake, a price) is what crypto projects promise their holders, and nobody holds them to it. So the project is our customer, not our topic: it funds a campaign on its own promise, and the chain shows whether it delivered.

Why now: the category is large and new, US$21.7B in 30 days (DefiRate), and on Solana it has barely started: World in Phantom went from US$1.1M a month in June to US$15.4M in September 2026 (DefiLlama). We found no live market on a token burn or on locked liquidity.
```

**What technologies are you using or integrating with to build your product?**

São 2365 caracteres. **O campo cortou o texto** em "Web: Next.js (App Router), Tailwind CSS, Solana wallet-adapter and Bun; the". Nota do revisor: fraca.

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

**Which chains does your product use?** Só `Solana`.

**How does your product use these chains?** (480 de 500 caracteres)

O revisor a pôs entre as fortes.

```text
Solana is the product, not a settlement layer under it. One Solana program holds each campaign's pot in SOL in a program-owned vault and settles by reading other Solana accounts directly: a Pyth price, an SPL mint's supply, a Meteora DAMM v2 pool, a stake pool, a validator's epoch stake. The US$500 opening fee is charged in SOL at the on-chain Pyth SOL/USD price. Entries, payouts and fees are SOL, wallet to program. Live on devnet: 5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o
```

**What category best describes your product?** `Markets & Exchanges`. A lista não tem uma opção de mercados de
previsão. O revisor deu 6 de 6 em "categoria escolhida com cuidado".

**Is your project a mobile-focused dApp?** `No`. O app Android está no plano e não foi construído.

**Where is your team primarily based?** e **Team Telegram contact:** preenchidos pelo Lucas; não estão nos arquivos.

**Did anyone not listed on the team here do meaningful work on this project?** (573 de 600 caracteres)

```text
No. Every product decision, review and merge was made by the team members listed. Three notes so the history reads correctly. (1) Git shows four author identities for two people: 0xcf02 and 0xcf07 are Ronaldo Pereira (CTO); lglucas and 0x4cb-caramelo are Lucas Galvão. (2) Much of the code, tests and documentation was written with an AI coding assistant (Claude Code), directed and reviewed by us; it appears as co-author in commits. (3) The repository was set up with AI Dev OS v0.5.6, a pre-existing process kit (working rules and CI scripts) that holds no product code.
```

**Is there anything else judges should know about your project that isn't captured above?** (497 de 500 caracteres)

```text
Everything was built inside the hackathon window: first commit on 1 Oct 2026. It began that day as pred-provable, an Anchor program by our CTO (sponsor-priced YES tokens). On 3 Oct we redefined it as pot-based campaigns and rewrote it on Pinocchio; four readers were ported and checked against the old program on the same mainnet accounts (62 cases). Limits: devnet only, unaudited, no real money. The team can void a result (full refund), never flip it. Mainnet waits for an audit and a multisig.
```

### 1.2 Aba "Media and code"

| Campo | O que foi | O que o revisor viu |
|---|---|---|
| Project logo or graphic | `Yes`; três PNG quadrados em `docs/business/colosseum/` | Não comentou |
| GitHub link | `https://github.com/0x4cb-caramelo/Bakedtruth` | Privado; perde os pontos de código aberto |
| Acesso a `hackathon@colosseum.com` | Não dado até a madrugada de 10/10 (sem convite pendente, pela API do GitHub) | Pede para conferir o convite |
| Demo video e Pitch video | Não gravados. Os dois campos tinham o mesmo endereço provisório | "Um clipe de música": bloqueia |
| Show demo video on the public project page | Recomendação: marcar | Não comentou |
| Live product link | Propus o programa no Explorer. O Lucas pôs `brot.markets/dev0x` | Falta o protocolo no endereço |
| X profile | `@brotmarkets` | 11 de 11 |
| Pitch deck (PDF, extra da Superteam) | O primeiro PDF, de 10/10 | Cartão espelhado no slide 3 |

**Please share any important context about your repo** (496 de 500 caracteres)

O revisor citou o começo desta resposta e a pôs entre as fortes.

```text
Private monorepo, all written inside the hackathon window. The product is programs/brot-markets (the Solana program), packages/sdk (the client), scripts/ (devnet deploy and the full-cycle smoke) and tests/. Not product yet: app/ still renders the UI of our first design and is replaced in the site sprints, and README.md still describes that first design (pred-provable). services/landing is brot.markets. docs/ is our plan, in Portuguese. .claude/, templates/ and stack-packs/ are a process kit.
```

**Access instructions**

O revisor a pôs entre as fortes.

```text
No login is needed, and there is no hosted app yet: today the product is the program on Solana devnet, driven by scripts. Everything below opens in a browser on Solana Explorer (cluster: devnet).

Program:
https://explorer.solana.com/address/5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o?cluster=devnet

A full paid cycle, run on 9 Oct 2026:
- Opening, US$500 charged as 4.5617 SOL at the Pyth SOL/USD price:
https://explorer.solana.com/tx/5QReYZ2pYcjhmCNuxMo593CkZawTFk75BMNAozACbZkn3hYEJTLWEnvRkiJMeXtkxUFMQZUcSJYBmPLJtRD1grPD?cluster=devnet
- Resolution, YES read from the mint's supply after the burn:
https://explorer.solana.com/tx/4ayGsUNYWkih6qf1ZsbdxU6mtZeoEd1wWUQFNxdrjroCEtuoK1aB5mjZo51qAFd76j7wdWuVwpcFjYkvSkwGjqfj?cluster=devnet

Three campaigns open now, opened by the team:
- BTC/USD above US$86,759.43 within 14 days: 5w8fmXruBuMswT4Aa8XAcNZihEf3T5jU8sxTpJCChPE4
- SOL/USD below US$104.25 within 7 days: G6UntC4XuXZUZ6JiDEc8dY12SRkzUfTmDKoZTa7PbFkm
- A token burn to 500,000 within 30 days: CufcjrYXt36YkeS2FdMx5voBkbbSdw2rTmrcQTSbL59J

To run the cycle yourself, see the header of scripts/devnet-smoke.ts in the repository: one command runs it on a local cluster, another on devnet (about 4.7 devnet SOL).

Product docs: https://docs.brot.markets
```

**Demo video: o roteiro**

Roteiro escrito, vídeo não gravado. Até 3 minutos.

```text
[0:00 SCREEN: brot.markets home]
This is Brot Markets: prediction markets the chain itself resolves. Today the product is a Solana program, live on devnet. Let me show it working.

[0:12 SCREEN: Solana Explorer, the program address, cluster devnet]
This is the program. No vote, no company key and no AI model decides a result here. The program reads an account.

[0:25 SCREEN: terminal, the cycle starting; or the opening transaction on Explorer]
A campaign opens on a real question: will this token's supply be burned down to 990,000 before the deadline? Opening costs 500 dollars, charged in SOL at the Pyth price that the program reads on-chain: 4.56 SOL. Ninety percent of it becomes the prize.

[0:50 SCREEN: the two entry transactions]
Two wallets take sides. One joins YES, one joins NO, both in SOL. No sign-up, just a wallet.

[1:05 SCREEN: the refused retry]
If a wallet sends the same entry twice, the program refuses the second one. Nothing is charged twice.

[1:15 SCREEN: the burn, then the resolution transaction and its event]
Now the tokens are burned. Anyone can ask the program to resolve. It opens the token's mint account, checks who owns it, reads the supply and compares it with the target. The answer is YES, and it is written on-chain with the number it read.

[1:45 SCREEN: the mint account on Explorer, supply field]
And this is the point: you can open the same account yourself and see the same number. Same account, same answer.

[2:00 SCREEN: the payout transactions]
The winners are paid straight to their wallets. The creator gets one percent of the entries. Brot keeps ten percent of the losing side. Every lamport matches what our SDK predicted before signing.

[2:25 SCREEN: the three open campaigns on Explorer]
Three campaigns are open on devnet right now: Bitcoin's price, Solana's price, and a token burn.

[2:40 SCREEN: brot.markets]
What is not here yet: the site where you click YES or NO, and the service that resolves on its own. This is devnet, unaudited, with no real money. Mainnet comes after an external audit and a multisig.

Brot Markets. Proof over promises.
```

**Pitch video: o roteiro**

Roteiro escrito, vídeo não gravado. Até 2 minutos. A linha do Bernardo está em colchetes.

```text
Hi, I'm Lucas. With Bernardo and Ronaldo, I'm building Brot Markets: prediction markets the blockchain itself resolves.

In a prediction market, when it really counts, who decides what's true? In March 2025, a seven-million-dollar market on Polymarket settled on an event that never happened. No refunds. There is always someone between the event and your payout: a token vote, a company key, an AI model.

So Brot only opens markets the chain can answer. A project picks a promise Solana can measure: a token burn, locked liquidity, staked SOL. It opens a campaign for five hundred dollars in SOL, and ninety percent becomes the prize for its community. People take sides, YES or NO. At the deadline, the program reads the account and pays the winners. Nobody picks the winner, and anyone can check the same account.

We earn ten percent of the losing side. And the project gets what a post never gave it: a promise its community follows, and proof that it delivered.

Why us? Ronaldo, our CTO, wrote the on-chain readers this product stands on. Bernardo, our CEO, [ONE LINE: what he did at Vega Crypto and hol]. And I'm the lawyer on the team, and I run operations.

In ten days we went from the first commit to a program live on devnet: a campaign opened and paid for, resolved from a burned token, and paid out, with more than seven hundred tests behind it.

Next: the site, an external audit, and our first launch partners.

Brot Markets. Proof over promises.
```

### 1.3 Aba "Team": o perfil do Lucas

O que propus, a partir do slide de equipe (não sei como ficou na tela):

| Campo | Proposta |
|---|---|
| Full name | Lucas Lopes Galvão (já estava) |
| Role / title | `Co-founder, COO and CLO` |
| LinkedIn URL | `https://www.linkedin.com/in/lucasgalvao/` |
| GitHub URL | `https://github.com/lglucas`, a confirmar que é a conta pessoal dele |
| Are you looking for a cofounder? | `No` |
| Are you a technical founder? | `No`, a decidir por ele |

O que o Lucas escreveu por conta própria, pelo que o revisor citou:

- **"What's the most impressive thing you've built or accomplished outside of this project?"**, em português: "A
  minha aceleradora de startups e uma tokenizadora que estavamos tokenizando uma mina de rubis."
- **"Tell us about a time you went to extreme lengths to accomplish something"**, em português. O texto não veio.
- **"Where have you worked or built before?"** O texto dele não veio. A sugestão do revisor, montada sobre ele, é:
  "Founder of Aceleradora ECO, a startup accelerator. Founder of Complian.cc. Lawyer at my own firm, Lopes Galvão
  Advogados."

A lista da equipe mostra os três como "Inscrito no Arena (Crypto World's Fair)". O cargo do Bernardo está "CO".

**You could be working on anything right now — why choose this?** (983 de 1000 caracteres)

Rascunho meu, que o revisor pôs entre as fortes.

```text
Because it is a market I can defend line by line. Every prediction market has to answer one question: who says what happened? Today the answer is a token vote, a company key or an AI model, and that is where results get disputed and manipulated. When we started Brot I set one rule and refused to trade it away: we only use an oracle the chain itself can verify. The rule threw out most markets, and what it left is the part I find most useful: the promises crypto projects make to their holders (a burn, locked liquidity, staked SOL) that nobody holds them to. Let a project open a market on its own promise and it becomes marketing that proves itself.

I am the lawyer on a three-person team, so I also know what this product must not become, and I would rather build inside a narrow rule we can keep than a broad one we cannot. In ten days we took that rule from the first commit to a program that opened, resolved and paid a real campaign on devnet. That pace is why I am here.
```

### 1.4 Aba "How you're building": o apoio da Anthropic

É outra tela, sobre como a equipe usa o Claude. As respostas do Lucas tinham 581 e 677 caracteres para um limite de
500; estas são as encurtadas. Não sei se passaram pelo revisor. "What % of your monthly AI spend is currently on
Anthropic?" ficou em 81-100%, resposta dele.

Dois ajustes de sentido ao encurtar: "no admin key" virou "nobody picking the winner", porque a equipe tem uma chave
que pausa e anula; e "we're onboarding" virou "we want as launch partners", porque nenhum parceiro está fechado.

**Where do you want support from Anthropic?** (487 de 500 caracteres)

```text
We're three people building a Solana program that will hold third-party funds. It is written in Pinocchio, which validates no account for us, so every missed check is a potential exploit. We'd value Applied AI guidance on using Claude Code to review each instruction for missing account and signer checks before our two external audits, and API credits to run that review on every change. The founder community would help us reach the 20 to 30 crypto projects we want as launch partners.
```

**What are you building on Claude?** (494 de 500 caracteres)

```text
Brot Markets runs On-Chain Campaigns on Solana, a prediction-market format. A project puts a SOL prize behind its own measurable promise (a token burn, locked liquidity, staked SOL, a price), users back YES or NO, and our program settles by reading the Solana account that holds the answer: no token vote, no LLM, nobody picking the winner. Claude Code writes and reviews our Pinocchio program and services, and Claude stress-tests our plan and pitch. For three people, it is an extra engineer.
```

## 2. O que o revisor retornou

Tudo nesta seção é do revisor. Os percentuais vêm de um estudo dele sobre submissões anteriores, que eu não li (FATO
SECUNDÁRIO).

### 2.1 A nota: 61 de 100

"Prontidão para ser finalista. Não é uma probabilidade. 100 significa que você fez tudo o que o estudo mediu como
mudável." Ele acrescenta que o perfil mais forte do estudo ficou em 37% de finalistas, e que "não dá para prever
vencedores".

| Critério | Nota | O que ele disse |
|---|---|---|
| Um número de tração real | 0 de 14 | Os números do texto são mercado, preço e testes. Com número real de uso: 30,0% de finalistas, contra 10,5%; só 40 projetos, "trate como teto" |
| Link do X do projeto | 11 de 11 | |
| Nada simulado descrito como produto | 10 de 10 | |
| Descreve o produto, não a infraestrutura | 10 de 10 | |
| Até 6 tecnologias | 0 de 9 | Contou 20. De 2 a 6: 18,3% de finalistas; 7: 11,5%; 8: 7,2% |
| Chain citada por nome | 9 de 9 | |
| Sem fornecedor de LLM na descrição | 8 de 8 | |
| Stack não é só frontend | 0 de 7 | React, Tailwind e Next.js juntos: 4,9% de finalistas; a média é 10,7% |
| Categoria escolhida com cuidado | 6 de 6 | |
| Repositório público | 0 de 5 | Não vem do estudo: é o regulamento, §8(e) |
| Diz "mainnet" se está em mainnet; diz "Rust" se usa Rust | não se aplica | |

**A conta por trás do 61 (INFERÊNCIA minha).** Os critérios que se aplicam somam 89 pontos, e a submissão fez 54:
54 ÷ 89 = 61%. Pela mesma conta, a lista de seis tecnologias leva a 70 de 89 (79); o repositório público, a 75 (84);
e o número de tração, a 89 (100).

### 2.2 O resumo dele

> O produto é concreto: ciclo completo na devnet, com transações no explorer. O problema mais grave é de
> elegibilidade: pitch e demo apontam para o mesmo vídeo (um clipe de música), e [duas respostas do perfil] estão em
> português, o que é motivo de desqualificação.

### 2.3 O que fazer (7)

| | Gravidade | Campo | O que está errado | Como melhorar, segundo ele |
|---|---|---|---|---|
| 1 | Bloqueia | Pitch video e demo video | O mesmo endereço nos dois, que não mostra produto nem time | Gravar o pitch (até 2 min, time e ideia, em inglês) e a demo (até 3 min, o ciclo na devnet); título em inglês; abrir sem login |
| 2 | Bloqueia | Perfil, duas respostas | Em português; §12(a)(i) desclassifica | Reescrever em inglês; rever se os outros campos têm trechos em português |
| 3 | Alta | Technologies | Cerca de 20 entradas, e o texto termina cortado | "Rust, Pinocchio, Pyth, Meteora DAMM v2, SPL Stake Pool, Next.js" |
| 4 | Alta | Brief description | Nenhum número de usuários ou transações | Convidar usuários reais às três campanhas abertas, contar entradas e carteiras, escrever o total. "Se ninguém usar, não estime nem invente número" |
| 5 | Alta | GitHub link | Privado; o regulamento pontua código aberto | Tornar público, se puder |
| 6 | Média | Context about your repo | O mesmo | Público se não houver segredos; confirmar o convite; atualizar o README |
| 7 | Média | What are you building | Quem abre a campanha pode controlar a conta que decide | Uma frase sobre o que impede isso; e o que acontece se a conta for inválida ou a Pyth falhar |

### 2.4 Campo a campo

- **Já estão fortes:** "What are you building, and who is it for?", "How does your product use these chains?",
  "Please share any important context about your repo", "Access instructions" e "You could be working on anything
  right now — why choose this?".
- **Fracas:** "What technologies..." ("lista gigante e cortada; vira inventário") e "Where have you worked or built
  before?" ("não diz o que fez nelas nem por que isso importa em mercados on-chain").
- **OK:** "Brief description" ("falta um número real de uso") e "Why did you decide to build this..." ("os números
  são de mercado, não do seu produto").

### 2.5 O olhar do jurado

Opinião do revisor; ele avisa que não entra na nota. As respostas que o plano dá estão na seção 5.

| Tema | Leitura dele | Pergunta do jurado |
|---|---|---|
| Problema | A dor é real, mas o cliente pagante não disse que quer isso | Algum projeto real aceitou abrir uma campanha sobre a própria promessa? |
| Por que esta chain | Solana é a razão do produto | O desenho sobrevive se o dado vier de outra chain? |
| Diferencial | Claro, mas restrito ao que cabe em uma conta | Esse nicho de metas on-chain é grande o bastante para um negócio? |
| Modelo de negócio | Taxa, abertura e parte do criador estão explícitas | Qual o volume mínimo por campanha para a conta fechar? |
| Demo e verificação | Há transações e endereço; os vídeos e o repositório não ajudam | Um juiz sem o repositório vê o fluxo funcionando só por vídeo e explorer? |
| Time | Três pessoas, com advogado; coerente para um produto regulado | Quem já operou mercados de previsão, e como o time lida com o risco regulatório de apostas? |

### 2.6 O deck, e a lista "antes de enviar"

**Sobre o deck:** "conta a mesma história do formulário", está em inglês e cabe em menos de 2 minutos. Mas "não mostra
produto rodando, só desenhos de exemplo", o slide 3 tem o cartão espelhado, e não há slide de tração.

O revisor não apontou as quatro diferenças entre o deck e o formulário que eu tinha listado (USDC, "semente", teto e
"No human in the loop"). Elas continuam lá.

**Antes de enviar,** segundo ele: conferir o convite a `hackathon@colosseum.com`; pôr o protocolo no "Live product
link"; corrigir o cartão do slide 3; abrir cada endereço numa janela anônima.

## 3. As melhorias

Na ordem em que travam a submissão. "Vale" é a nota do revisor em jogo.

| | Melhoria | De quem | Situação em 10/10 | Vale |
|---|---|---|---|---|
| 1 | Gravar o vídeo de apresentação, até 2 minutos, em inglês | Lucas | Roteiro pronto (seção 1.2); falta a linha do Bernardo | Desclassifica |
| 2 | Gravar o vídeo de demonstração, até 3 minutos, em inglês | Lucas, ou Ronaldo se for com o terminal | Roteiro pronto (seção 1.2). O endereço do RPC com chave não pode aparecer | Desclassifica |
| 3 | Pôr em inglês as duas respostas do perfil | Lucas | "Most impressive": pronta (seção 4). "Extreme lengths": falta o texto dele | Desclassifica |
| 4 | Trocar o campo de tecnologias pela lista de seis | Lucas cola | Texto pronto (seção 4) | 16 pontos |
| 5 | Subir o PDF novo do deck | Lucas | Refeito e conferido; em `docs/business/colosseum/brot-markets-pitch.pdf`, fora do Git | Erro apontado |
| 6 | Corrigir o "Live product link" | Lucas | Falta `https://`. A página `/dev0x` é protótipo com dados de mentira; o endereço do programa no Explorer é o produto no ar | Risco no critério "nada simulado" |
| 7 | Acrescentar a frase sobre quem controla o resultado | Lucas cola | Texto pronto (seção 4) | Opinião do revisor |
| 8 | Acrescentar o estado de cada tipo às "Access instructions" | Lucas cola | Texto pronto (seção 4) | Honestidade: saiu do campo de tecnologias |
| 9 | Um número real de uso | Lucas decide; Ronaldo, se for com gente de fora | Não há usuário de fora, nem tela ou comando para uma carteira de fora entrar. Há o número da equipe: 54 transações, 2 campanhas liquidadas (seção 4) | 14 pontos |
| 10 | Repositório: abrir, ou convidar `hackathon@colosseum.com` | Lucas | Privado, sem convite. A varredura do histórico não achou credencial, mas os padrões não cobrem arquivo de chave da Solana nem RPC com chave. Abrir publica o plano, as notas jurídicas e os registros de sessão, sem volta | 5 pontos |
| 11 | Reescrever o `README.md` | Eu, com o pedido do Lucas (mexe na `main`) | Ainda descreve o `pred-provable`, com Anchor e USDC | Primeira página que o jurado abre |
| 12 | Completar "Where have you worked or built before?" | Lucas | Rascunho com colchetes (seção 4) | Marcada como fraca |
| 13 | Corrigir "CO" para "CEO" no cargo do Bernardo | Lucas | Na lista da equipe | |
| 14 | Decidir o que fazer com a Complian.cc | Lucas | `complian.cc` responde "Account Suspended" (lido em 10/10); está no slide de equipe, no PDF e no roteiro | |
| 15 | Alinhar o deck ao formulário | Lucas decide; eu ajusto | USDC, "semente", teto e "No human in the loop" | O revisor não apontou |
| 16 | O de acordo escrito do Bernardo e do Ronaldo | Lucas | O vídeo e a página do projeto são públicos e citam os três | Decisão 12 do plano |
| 17 | Confirmar as identidades do Git e o "No" de "anyone not listed" | Lucas | Preenchidas por leitura minha | |
| 18 | A linha do BP v0.0.4 que diz que o hackathon saiu do plano | Eu, quando a submissão for confirmada | Parte 4, seção 3.2 | |

**O item 9, com mais detalhe.** O revisor pede dez usuários reais nas campanhas abertas. Hoje isso não é possível:
as três campanhas abertas não têm nenhuma entrada, o site das campanhas não existe, e o repositório não tem um
comando para uma carteira qualquer entrar numa campanha que já existe. O caminho curto é o Ronaldo escrever esse
comando e a equipe convidar gente que saiba rodá-lo. O que dá para dizer hoje, sem inventar, é o número da equipe.

## 4. Os textos corrigidos, prontos para colar

Escritos em 10/10/2026, depois do retorno. Substituem os da seção 1 no mesmo campo.

**What technologies are you using or integrating with to build your product?**

Seis itens. O revisor sugere "Next.js" no lugar de "Claude Code"; o campo pede as ferramentas de IA pelo nome, e o Next.js ainda não faz parte do produto novo.

```text
Rust, Pinocchio, Pyth, Meteora DAMM v2, SPL Stake Pool, Claude Code
```

**What are you building, and who is it for?** (989 de 1000 caracteres)

Com a frase sobre quem controla o resultado. Ela diz o que o código garante, e não que o criador não influencia.

```text
We are building prediction markets with nobody in the middle: the program reads the outcome from a Solana account. No person, token vote or AI model reports it. Each market is an On-Chain Campaign.

Who it is for:
1. On-chain projects, our customer. A team that promised its holders something measurable (burn 100M tokens by Nov 30, lock liquidity on Meteora) opens a campaign on it for US$500 in SOL; 90% becomes the prize.
2. Their communities and any Solana wallet: join YES or NO with SOL, no sign-up; winners split the pot.

Can the creator rig it? It controls only whether it keeps its promise, and YES wins only if it does. The program reads facts that cannot be faked or undone (a burn on a mint with no mint authority, permanently locked liquidity) and stops entries once the outcome is knowable. If the account cannot be read or the Pyth price is stale, the campaign is voided and everyone is refunded.

Brot keeps 10% of the losing side; the creator earns 1% of entries.
```

**Access instructions: parágrafo a acrescentar**

Carrega o estado de cada tipo de campanha, que saiu do campo de tecnologias.

```text
What runs on devnet today: price and burn campaigns. The Meteora and stake-pool types are tested on mainnet account bytes only (there is no devnet pool to read), and the validator-stake type stays switched off until a YES is recorded on devnet. Entries are made by script: the site where a wallet clicks YES or NO is not built yet.
```

**Brief description, com o número real** (490 de 500 caracteres)

Só se o Lucas decidir usar. O número é da equipe, e o texto diz isso. Atualizar a contagem antes de enviar.

```text
Brot Markets is a permissionless prediction market on Solana where the chain itself decides the result. On devnet: 54 transactions and 2 campaigns settled end to end, run by the team so far. A project opens a YES/NO campaign on a milestone Solana can measure (a token burn, locked liquidity, staked SOL, a price) and funds the prize. Its community takes sides with SOL. At the deadline the program reads the target account and the winners split the pot. No vote, no judge. Proof > Promises.
```

**What's the most impressive thing you've built or accomplished outside of this project? A frase dele, só traduzida** (93 de 500 caracteres)

```text
My startup accelerator, and a tokenization company with which we were tokenizing a ruby mine.
```

**A mesma resposta, mais forte, com colchetes para o que só ele sabe** (392 de 500 caracteres)

```text
I founded Aceleradora ECO, a startup accelerator [CITY, since YEAR: N startups accelerated, one result you are proud of]. I also co-founded a tokenization company and led the work to tokenize a ruby mine [how far it got: the legal structure, the asset value, what happened next]. Both taught me the same thing Brot is built on: a promise about an asset is worth what can be verified about it.
```

**Where have you worked or built before?** (982 de 1000 caracteres)

Rascunho com colchetes. Os "110 commits" valem se as identidades `lglucas` e `0x4cb-caramelo` forem dele.

```text
I am a lawyer and I run my own firm, Lopes Galvão Advogados [since YEAR; your practice areas, and what you have done for crypto or fintech clients]. That is why Brot's rules were written with the regulatory questions on the table from day one, and why I hold the legal seat (CLO) as well as operations.

I founded Complian.cc [one line: what it does and who uses it].

I founded Aceleradora ECO, a startup accelerator [N startups, since YEAR]. It is where I learned to take a product from idea to first customer [if true: and it is our network for the first launch partners].

Before Brot I worked on tokenizing a real asset, a ruby mine [your role and how far it got], so I have seen how hard it is to prove an off-chain fact on-chain. Brot is the opposite bet: only facts the chain already holds.

On Brot I own the product rules, the terms and privacy policy, the site and the pitch, and I ship with an AI coding assistant: about 110 of the repository's commits are mine.
```

## 5. As perguntas do jurado, e o que o plano responde

Servem para os vídeos e para a conversa com jurados. Só o que o plano e o código dizem; onde não dizem, está dito.

| Pergunta | O que o plano responde | Onde |
|---|---|---|
| Algum projeto real aceitou abrir uma campanha sobre a própria promessa? | Não. Nenhum parceiro está fechado, e a demanda não foi demonstrada. O teste previsto são 20 a 30 parceiros abrindo de graça, com a pergunta: pagaria os US$ 500 pela próxima? | BP v0.0.4, Parte 2, seção 2.5; Parte 4, seção 5.1 |
| O desenho sobrevive se o dado vier de outra chain? | Não, e é de propósito: um programa da Solana só lê contas da própria rede. Esportes ficam para uma fase 2, com oráculo próprio | Parte 1, seções 4.1 e 4.3 |
| O nicho é grande o bastante para um negócio? | O plano diz que é um nicho. A operação se paga com US$ 208.630 de entradas por mês, 1,4% do volume do World em setembro de 2026. Se chega lá, ninguém mediu | Parte 2, seções 2.1 e 3.3 |
| Qual o volume mínimo por campanha para a conta fechar? | O plano não calcula por campanha. Por mês: 208.630, menos o que as aberturas pagam; com 110 aberturas pagas, só elas cobrem o custo de US$ 5.500. Para o criador, o 1% devolve os US$ 500 com US$ 50 mil em entradas | Parte 1, seção 4.1 |
| Um juiz sem o repositório vê o fluxo funcionando? | Pelo Explorer, sim: as transações do ciclo estão na devnet. Pelo vídeo, ainda não | `colosseum-submissao.md`, seção 6 |
| Quem já operou mercados de previsão, e o risco regulatório? | Os arquivos não registram experiência anterior da equipe com mercados de previsão. A avaliação jurídica é interna e ainda não foi feita; a primeira pergunta dela é se o pote é aposta de quota fixa | Parte 4, seções 5.1 e 6 |

## 6. O que ficou fora do repositório, e o que não foi conferido

- **Os PDFs do deck** estão em `docs/business/colosseum/` só na máquina do Lucas: são derivados do deck e mudam
  quando ele mudar. Os três logotipos estão no Git.
- **Nada foi enviado por mim** ao portal nem ao revisor. Li a devnet e o GitHub, sem escrever em nenhum dos dois.
- **Os números do revisor** não foram conferidos na origem: o estudo dele não está nos arquivos.
- **Os testes do programa** não foram rodados nesta sessão; "mais de 740" vem dos registros de sprint.
- **O erro do PDF.** A primeira versão imprimia o verso dos cartões que viram, por cima da frente, e eu disse que
  tinha conferido os slides tendo olhado uma renderização da tela, e não o arquivo. A segunda foi conferida página
  por página, no próprio PDF.
