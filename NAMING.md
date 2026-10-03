# Análise de nome e branding

Data: 2026-10-02. Escopo: o nome atual ("Provable KPI Markets", repo `pred-provable`), conflitos existentes, e alternativas
mais curtas.

## Veredito

**Não use "Provable" como nome do produto.** O nome já pertence a uma empresa grande do mesmo setor (cripto/blockchain),
com marca registrada pedida para serviços que cobrem o nosso caso. Vale trocar agora, enquanto o custo ainda é baixo.

## 1. Quem já usa "Provable"

| Quem | O que é | Por que importa |
| --- | --- | --- |
| **Provable** (provable.com, ex-Aleo Network Foundation) | Lab por trás da blockchain Aleo: Leo, snarkVM, SDK, Shield (carteira de stablecoin privada), Aleo Explorer. Investidores: a16z, SoftBank, Coinbase Ventures, Tiger Global. Agregadores citam ~US$ 298 M levantados. | Mesmo setor, mesma palavra, mesma audiência de devs cripto. Domínios `.com`, `.io`, `.markets`, `.fun`, `.app` e o org `provable` no npm e no GitHub já estão ocupados. |
| **Marca PROVABLE** (Provable Inc.) | Pedido registrado em 2025-07-18, cobrindo software financeiro em blockchain, DeFi, serviços de verificação, carteiras, redes blockchain e jogos. | Cobre o nosso uso. Li isso num resumo de busca; o site do USPTO bloqueou o acesso direto (403). **Confirme no TESS/USPTO antes de decidir qualquer coisa jurídica.** |
| **Provable Things** (ex-Oraclize, 2015 a 2019) | Oráculo da Ethereum que virou "Provable" em 2019 e entrou no Poseidon Group. | Ironia ruim: nosso pitch é "sem oráculo", e o nome já foi uma marca de oráculo. |
| **Provably** (provably.ai) | ZK + agentes de IA para analytics verificável. | Quase-homônimo no mesmo vocabulário "verificável". |
| **"Provably fair"** | Termo padrão de cassinos cripto. | Associa o nome a jogo de azar, o que pesa contra um produto que quer ser "bounty", não aposta. |

Consequências práticas: busca por "Provable" devolve a Aleo; um juiz de hackathon ou um investidor vai assumir que há
relação; e há risco real de notificação de marca se o produto crescer.

## 2. Como o mercado se chama

Prediction markets em 2026: Polymarket, Kalshi, Drift BET, World (Phantom, Solana), Limitless, Hedgehog, Path Protocol,
Monaco Protocol, TBD, DFlow (tokeniza Kalshi na Solana), Gamba, e dezenas de repos genéricos ("Solana-Prediction-Market",
"SOLPredict", "proofmarket"). Padrão:

- Uma ou duas sílabas, palavra comum ou inventada (Kalshi, Polymarket, World, Limitless).
- Nenhum carrega "prediction" no nome. Descrevem a categoria no subtítulo.
- Nomes com "proof" já têm ocupantes pequenos (`proofmarket`, `proofbounty`).

Nosso produto **não é** prediction market clássico: é bounty sobre meta on-chain com resolução por leitura de conta. Um
nome que evoca *irreversibilidade* ou *marco* diferencia melhor do que um que evoca *previsão*.

## 3. Critérios

1. Curto (máx. 7 letras, 1 a 2 sílabas), fácil de falar em inglês e em português.
2. Evoca o que é único: a meta só avança num sentido, e a resolução é uma leitura, não um julgamento.
3. Sem cheiro de jogo de azar (regulação, e a barreira de entrada de patrocinadores corporativos).
4. Domínio, npm e GitHub com chance real de obter.
5. Sem colisão com projeto conhecido de cripto/ZK/oráculo.

## 4. Candidatos

Disponibilidade medida em 2026-10-02 por consulta DNS (NS) via Cloudflare DoH, mais HTTP no registry do npm e na API do
GitHub. **"livre" significa que o domínio não resolve (NXDOMAIN), não que esteja à venda**: pode haver reserva, parking
ou preço premium. Confirme num registrar. Não consultei handles do X nem bases oficiais de marca.

### Palavras únicas: todas ocupadas onde importa

| Nome | .com | .io | .xyz | .markets | npm / GitHub |
| --- | --- | --- | --- | --- | --- |
| provable | ocupado | ocupado | n/d | ocupado | ocupados |
| cairn | ocupado | ocupado | ocupado | ocupado | ocupados |
| qed | ocupado | ocupado | ocupado | livre | ocupados |
| ratchet | ocupado | n/d | ocupado | ocupado | ocupados |
| latch | ocupado | ocupado | ocupado | livre | ocupados |
| fait | ocupado | ocupado | ocupado | livre | ocupados |
| tripwire | ocupado | ocupado | ocupado | livre | ocupados |
| moot, vow, oath, pawl, quod | ocupado | ocupado | ocupado | livre | ocupados |

Nenhuma palavra única serve de nome sozinha. A saída padrão do setor é **palavra + sufixo** (`ratchet.markets`,
`getcairn.xyz`) ou uma grafia própria. `.markets` está livre para quase todas, o que combina com o produto.

### Compostos testados (todos livres em .xyz, .io, .markets, .fun, .app, npm e GitHub)

`ratchetmarkets` (.com livre), `cairnmarkets` (.com livre), `latchmarkets` (.com livre), `qedmarkets` (.com livre),
`tripwiremarkets` (.com livre), `goalpostfi` (.com livre), `kpibounty` (.com livre), `burnbounty` (.com livre).
`qedfi`, `cairnfi`, `latchfi` têm `.com` ocupado. `provablemarkets` tem `.com` ocupado e é o pior caso de marca.

### Avaliação

| Nome | Ideia | A favor | Contra | Nota |
| --- | --- | --- | --- | --- |
| **Ratchet** | Catraca: só gira num sentido, como cada resolver (autoridade revogada, supply que só cai, token trancado). | É a metáfora exata do produto. Uma palavra, duas sílabas. Slogan pronto: *"Markets that only move one way."* | Em inglês americano "ratchet" também é gíria pejorativa. `.com` e `.io` do nome puro ocupados. | **8/10** |
| **Cairn** | Montinho de pedras que marca trilha ou marco. | Evoca meta e marco. Pronúncia simples. Visual forte (pilha de pedras). | Muito usado em cripto e IA: `cairnchain` (blockchain), `cairn-protocol` (agentes), `cairnwake.com` (agente de IA em Solana). Marca fraca por saturação. | 6/10 |
| **Tripwire** | Fio de gatilho: dispara quando a meta é atingida. | Descreve o `resolve` permissionless. Memorável. | Já existe a empresa de segurança Tripwire (conhecimento geral, não verifiquei). Longo (8 letras). Tom de "armadilha". | 6/10 |
| **Latch** | Trava que não volta. | Curto, 5 letras, irreversibilidade. | A Latch Inc. (fechaduras inteligentes, conhecimento geral) é bem conhecida. Sem sentido de mercado. | 5/10 |
| **QED** | "Quod erat demonstrandum": está provado. | Mantém o espírito de "Provable". 3 letras. | `QED Protocol` (blockchain ZK) e `QEDIT` (ZK, Tel Aviv) são do mesmo universo; `.com`, `.io` e `.xyz` ocupados. Colide com a categoria que queremos evitar. | 5/10 |
| **Fait** | De *fait accompli*: fato consumado. | Curto, elegante, resolução instantânea e final. | Pronúncia ambígua em inglês ("fate"/"fay"). Só funciona para quem conhece a expressão. | 5/10 |
| Moot, Vow, Oath | | | "Moot" significa "irrelevante" em inglês americano. "Oath" foi marca da Verizon. "Vow" é genérico. | 3/10 |

### Alternativa: manter a raiz, tirar a colisão

Se o time gosta do significado de "Provable", dá para usar a palavra só como **descritor**, não como nome: a linha
*"Resolution is a read, not a judgement."* já está no README e é o melhor ativo de marca do projeto. Variações grafadas
(`Provbl`, `Provabl`) herdam o risco jurídico e parecem erro de digitação. Não recomendo.

## 5. Recomendação

1. **Primeira escolha: Ratchet** (`ratchet.markets` ou `getratchet.xyz`; confirmar `ratchetmarkets.com`). Resolva a
   conotação de gíria com identidade visual de engrenagem/mecânica, não de rua. Se o time achar a gíria arriscada,
   **Cairn** é a segunda opção, aceitando a saturação.
2. Subtítulo mantém a categoria: *"Ratchet: bounty markets on provable on-chain goals."* "Provable" continua vivo como
   adjetivo, sem ser o nome.
3. Antes de commitar: busca no USPTO e no WIPO Global Brand Database (classes 9, 36, 42) para o nome escolhido, handle
   no X, org no GitHub, checagem no Colosseum e no Solana Compass de projetos homônimos, e um registrar real para o
   domínio.

## 6. Custo de renomear (hackathon, prazo ~2026-10-12)

"provable" aparece em cerca de 30 arquivos (UI, README, scripts, testes, IDL, CI). A maior parte é só texto de
apresentação. **O nome do programa Anchor (`pred_provable`) e o crate fazem parte do IDL e do deploy em devnet.** Trocá-lo
exige `bun run build:program`, regenerar e commitar o IDL, e redeploy.

Plano de baixo risco:

- Agora: trocar só a marca visível (título do README, cabeçalho, `app/app/layout.tsx`, textos da UI e do chat em
  `app/lib/chat.ts`, `package.json` do app). Nenhuma mudança on-chain.
- Mantém `pred-provable` / `pred_provable` como nome interno do crate e programa até depois do hackathon.
- Pós-hackathon: renomear programa, crate, repo e IDL numa única passada, com novo program ID.

## Fontes

- [Provable (provable.com)](https://provable.com/)
- [Provable no Crunchbase](https://www.crunchbase.com/organization/provable)
- [Provable Labs no PitchBook](https://pitchbook.com/profiles/company/266939-92)
- [Provable, ex-Aleo Network Foundation, no Tracxn](https://tracxn.com/d/companies/provable/__L1kT-QCorUXdpXXZFHfBx-QpqizN5vZA7ls8VFRUF_A)
- [ProvableHQ/sdk no GitHub](https://github.com/ProvableHQ/sdk)
- [Provable Things (Oraclize) adquirida pelo Poseidon Group](https://medium.com/pnetwork/provable-things-the-company-backing-the-oraclize-blockchain-oracle-gets-acquired-by-poseidon-7c7b59c50414)
- [Oraclize vira Provable (Cryptonomist)](https://en.cryptonomist.ch/2019/03/08/oraclize-security-eidoo/)
- [Marca PROVABLE, Provable Inc. (uspto.report)](https://uspto.report/TM/99291556)
- [Provably (provably.ai) no Medium](https://medium.com/@shyam_98412/provably-alpha-the-future-of-verifiable-analytics-is-here-74b8709c480e)
- [Provably fair explicado (Webopedia)](https://www.webopedia.com/crypto/learn/provably-fair/)
- [Prediction markets na Solana (Solana Compass)](https://solanacompass.com/projects/category/rwa/prediction-markets)
- [World, prediction market na Solana (BeInCrypto)](https://beincrypto.com/world-solana-prediction-market-phantom/)
- [DFlow e Kalshi na Solana](https://solana.com/news/dflow-prediction-markets-api)
- [QEDIT (Crunchbase)](https://www.crunchbase.com/organization/qed-it) e [QED Protocol (Crunchbase)](https://www.crunchbase.com/organization/qed-protocol)
- [cairnchain/cairn](https://github.com/cairnchain/cairn), [swarmproof/cairn-protocol](https://github.com/swarmproof/cairn-protocol), [cairnwake.com](https://cairnwake.com/about.html)
- [proofmarket](https://github.com/kunaldrall29/proofmarket)

## Adendo: "Kuku" / "Kookoo" (2026-10-02)

Pergunta: já existe protocolo cripto com esse nome, principalmente na Solana, mas em outras redes também?

**Resposta curta: não achei um protocolo sério, mas o nome está cheio de tokens-lixo e quase todos os domínios
estão ocupados.** O risco é de ruído e de confusão, não de colisão com uma empresa grande.

| Nome | O que achei | Rede |
| --- | --- | --- |
| **KUKU** | Vários tokens de nome idêntico, todos micro. No DexScreener (busca "kuku"), 17 pares; os maiores têm liquidez de ~US$ 8 mil e market cap de poucos milhares de dólares. Inclui `KUKU "Kuku"` (2 pares na Solana, liquidez < US$ 1 mil) e um `KUKU` em BNB Chain (`kuku`, `kukuapp`, `酷酷`). Há ainda um KUKU na Ethereum (memecoin, contrato `0xc307…D0ED`) e um token pump.fun na Solana listado em agregadores. | Solana, BNB Chain, Ethereum |
| **Kukuli / WAKUKU / Cuckoo Clock** | Memecoins vizinhos (`kukuli coin`, `WAKUKU`, `CUCKOO CLOCK`). Ocupam a mesma busca. | Solana, Ethereum |
| **Kuru** (Monad) | Não é o mesmo nome, mas é o único projeto sério parecido: DEX de orderbook on-chain, US$ 11,6 M de Series A liderada pela Paradigm. Quem digitar errado cai nele. | Monad |
| **Cuckoo Network** | Rede de IA descentralizada com token `$CAI`, em Arbitrum/Ethereum. Grafia "cuckoo", pronúncia próxima de "kookoo". | Arbitrum |
| **Kuku FM** | App indiano de audiolivros (Mebigo Labs), com IPO a caminho. Não é cripto, mas domina a busca web por "Kuku". | n/a |
| **Kookoo** | Só achei um criador de conteúdo web3 das Filipinas (parceria com a Coins.ph). Nenhum token ou protocolo. | n/a |

Não achei nada chamado Kuku/Kookoo em prediction markets, nem em projetos de hackathon da Solana ou do Colosseum
(a busca web não cobre a base do Colosseum; vale rodar o `colosseum-copilot`).

### Disponibilidade (DNS via Cloudflare DoH, indicativa; "livre" = não resolve)

| Nome | .com | .io | .xyz | .app | .fun | .markets | npm / GitHub |
| --- | --- | --- | --- | --- | --- | --- | --- |
| kuku | ocupado | ocupado | ocupado | ocupado | ocupado | livre | ocupados |
| kookoo | ocupado | ocupado | ocupado | ocupado | livre | livre | npm livre, GitHub ocupado |
| kukumarkets / kookoomarkets | livre | livre | livre | livre | livre | livre | livres |
| getkuku | ocupado | livre | livre | ocupado | livre | livre | livres |

### Avaliação como nome do produto

- **A favor:** curto, fácil de falar e lembrar, funciona em inglês e em português, tom leve que destoa de "bet".
- **Contra:**
  1. Não diz nada sobre o produto (irreversibilidade, metas, bounty); "Kuku" também soa a "cuckoo" (maluco) e "cuckold"
     em inglês, e isso pesa para um produto que quer atrair patrocinadores corporativos.
  2. Memecoin-lixo com o mesmo ticker `KUKU` em três redes: qualquer busca por token mostra dezenas de cópias, e o risco
     de impostor com o mesmo nome é alto. Um produto que depende de confiança num contrato on-chain não quer isso.
  3. `.com`, `.io`, `.xyz` e `.app` do nome puro estão ocupados; só `kukumarkets.*` ou `getkuku.*` estariam livres.
- **Nota: 4/10.** Como nome de marca é utilizável, mas fica abaixo de **Ratchet** (8/10) porque não carrega significado e
  disputa ruído com memecoins. Se a ideia é um mascote leve, "Kookoo" com "oo" é a grafia menos poluída (nenhum token
  encontrado), mas o GitHub e quase todos os domínios já têm dono.

Fontes: [KuKu na Coinbase (listagem)](https://www.coinbase.com/price/kuku), [KuKu na CoinSwitch (token pump.fun)](https://coinswitch.co/web3/kuku-8tRH3ZVCsvD5jwpassphR4aPoNvrNRAaYeAfCmCWpump), [KuKu (BNB) na Bitget](https://www.bitget.com/price/kuku), [Kuku FM no CB Insights](https://www.cbinsights.com/company/kukufm/financials), [Kuru no DefiLlama](https://defillama.com/protocol/kuru), [Kuru Labs, Series A (crypto.news)](https://crypto.news/kuru-labs-11-6m-round-sets-stage-for-the-ultimate-dex-experiment/), [Cuckoo Network](https://cuckoo.network/about-us), [Kookoo e Coins.ph](https://medium.com/@metasports/kookoo-signs-with-coins-ph-as-ambassador-6ff94d50b33d), [DexScreener](https://dexscreener.com).
