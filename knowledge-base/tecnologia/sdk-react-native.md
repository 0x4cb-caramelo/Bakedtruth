# O SDK no React Native — a conferência da Sprint 05

Levantamento de 9 de outubro de 2026, feito para a linha da definição de pronto da Sprint 05: "o SDK publica ESM com
`exports`; uma conferência automática empacota as duas metades com o Metro para Android e roda os vetores de matemática
no motor do React Native [AC: a ferramenta, ainda sem app]. Fica registrado o que o app precisa adicionar
(`crypto.getRandomValues`, `crypto.subtle`, `bigint`)" (proposta de arquitetura §3.2). O que está em "Fatos" foi lido na
fonte (o código do React Native e do Hermes nas etiquetas citadas, o registro npm, os próprios arquivos baixados) ou
visto rodando nesta máquina (Arch Linux x64, Node 26.8.1). O que é conclusão minha está em "Inferências". A conferência
está em `tests/react-native/` (`run.mjs`) e roda no CI como o trabalho "Mobile bundle".

## Veredito

**O SDK roda no Hermes, e a matemática não precisa de nada além de `BigInt`.** As duas metades, `@brot/sdk/read` e
`@brot/sdk/tx`, empacotam com o Metro do jeito que um build release Android do React Native 0.87.1 empacota; o hermesc
dessa versão compila os três pacotes (leitura, transação e vetores) sem erro; e os 24.000 vetores do Rust (12.000 de
cada arquivo, os oito tipos) dão no Hermes exatamente o resultado do Rust, sem polyfill nenhum.

**O app precisa adicionar duas coisas, e só duas, para o que o SDK faz hoje:**
1. `crypto.subtle.digest("SHA-256")`, para qualquer PDA. Sem ele, o primeiro endereço derivado falha (erro 3610001 do
   Kit, `SOLANA_ERROR__SUBTLE_CRYPTO__DIGEST_UNIMPLEMENTED`), e com isso todo construtor de transação. Com um SHA-256 só,
   o endereço sai igual ao do Node.
2. `crypto.getRandomValues`, para o id aleatório de uma abertura (T17). Sem ele, `randomCampaignId()` recusa.

`crypto.subtle` Ed25519 (gerar chave, assinar, verificar) **não** é preciso: quem assina é a carteira, pelo MWA. Também
não: `fetch`, `WebSocket`, `AbortController`, `EventTarget` e `URL`, que o próprio React Native 0.87.1 define ao
iniciar. `TextDecoder` só se algum código decodificar texto UTF-8, o que o SDK não faz hoje.

**A VM.** O Hermes que o React Native 0.87.1 usa (versão 1.0.0, bytecode 98) não tem VM publicada: o pacote npm traz só
o compilador. A conferência automática roda o JavaScript na VM do lançamento v0.13.0 do Hermes, a mais nova com binário
publicado, que se apresenta como 0.12.0 (bytecode 96) e não lê o bytecode 98. A rodada com uma VM da própria versão do
React Native, construída da etiqueta de origem nesta máquina, rodou o bytecode do hermesc 1.0.0 com o mesmo
resultado, vetor por vetor (seção 1.6); essa rodada é manual, por causa do tempo de construção.

## 1. Fatos

### 1.1 As ferramentas e as versões fixadas

Fonte: registro npm (`npm view`, 9/10/2026) e `tests/react-native/package-lock.json`, resolvido de `registry.npmjs.org`
(a `.npmrc` da pasta fixa o registro, como o `bunfig.toml` faz para o workspace: o `~/.npmrc` desta máquina aponta para
`registry.npmmirror.com`, que o projeto deixou na Sprint 02, T15).

| Ferramenta | Versão | Publicada | Por quê |
|---|---|---|---|
| `metro`, `metro-config`, `metro-runtime` | 0.87.1 | 13/9/2026 | A linha que os pacotes do React Native 0.87.1 pedem (`^0.87.0`); a 0.87.1 é a mais nova dela |
| `@react-native/metro-config`, `metro-babel-transformer`, `babel-preset`, `js-polyfills` | 0.87.1 | 26/8/2026 | Os padrões do React Native 0.87.1, a versão `latest` no npm |
| `@babel/core` | 7.29.7 | 25/5/2026 | Os pacotes 0.87.1 pedem `^7.25.2`; a 8.x fica fora |
| `hermes-compiler` | 250829098.0.17 | 21/8/2026 | Exatamente o que o `react-native` 0.87.1 fixa nas dependências |
| `@noble/hashes` | 2.4.0 | 27/8/2026 | Só para o SHA-256 de teste da conferência (`entries/digest-shim.js`), não para o app |
| Hermes VM | v0.13.0, `hermes-cli-linux.tar.gz` | 16/8/2024 | O lançamento mais novo do Hermes com VM publicada (seção 1.2) |
| Node no CI | 24.21.0 | 7/9/2026 | Metro 0.87 pede Node `^22.13`, `^24.3` ou 26+; o do runner é mais velho |

Todas as versões fixadas têm mais de duas semanas de publicadas. `actions/setup-node` está fixada na v7.0.0 (commit
`820762786026740c76f36085b0efc47a31fe5020`, de 14/7/2026); a v7.1.0 saiu em 8/10/2026 e ficou de fora pela idade.

### 1.2 O Hermes: o compilador do React Native e a VM que existe

- **O compilador.** O pacote `hermes-compiler` 250829098.0.17 traz só `hermesc` (Linux, macOS, Windows) e um
  `index.js`. O binário se apresenta "Hermes release version: 1.0.0", "HBC bytecode version: 98". Pedido para executar,
  ele recusa: "Please choose output, e.g. -emit-binary. hermesc does not support -exec."
- **A origem.** O facebook/hermes tem a etiqueta `hermes-v250829098.0.17` (commit
  `3477757eb2475555cf8d8df24bfb1deb0613880d`), com o mesmo número do pacote npm. Nenhum lançamento do GitHub publica uma
  VM construída dela.
- **Os lançamentos com VM.** A API de lançamentos do facebook/hermes lista de v0.1.0 (2019) a **v0.13.0** (16/8/2024),
  todos com `hermes-cli-linux*.tar.gz`. A v0.13.0 é a última. O arquivo não tem `digest` na API; as somas abaixo foram
  calculadas nesta máquina e estão fixadas em `tests/react-native/hermes.mjs`, que confere a do arquivo antes de
  extrair e a do binário depois.

| Arquivo | Tamanho | SHA-256 |
|---|---|---|
| v0.13.0 `hermes-cli-linux.tar.gz` | 48.369.832 bytes | `aead6eb0b8f563bb022354352eae32dad96c933330b6c1941b6db17674ca68ae` |
| `hermes`, dentro dele | 37.727.296 bytes | `ae13b09993b46ae44d85880cc2adebf76290adb52ee0f7fad9f0dde270a2eb08` |

- **A VM da v0.13.0 se apresenta "0.12.0"**, bytecode 96: o lançamento não atualizou a versão no binário. Ela roda o
  JavaScript (compila por conta própria) mas recusa o bytecode do hermesc 1.0.0: "Wrong bytecode version. Expected 96
  but got 98".
- **Qual Hermes cada React Native fixa** (`npm view react-native@<versão> dependencies.hermes-compiler`): 0.87.1 e
  0.86.3, 250829098.0.17; 0.85.3, 250829098.0.10; a 0.88.0-rc.4 (`next`) e o `nightly` de 9/10/2026, 260318099.0.4,
  uma linha nova.

### 1.3 Como o React Native 0.87.1 empacota um build release Android

Fonte: o código do React Native na etiqueta `v0.87.1`, lido pela API do GitHub.

- `packages/gradle-plugin/.../TaskConfiguration.kt`, linhas 79 a 81: num build com Hermes,
  `minifyEnabled = !isHermesEnabledInThisVariant` e `devEnabled = false`. Ou seja, o Metro **não** minifica: quem otimiza
  é o hermesc.
- `.../tasks/BundleHermesCTask.kt`: o Metro roda com `--platform android --dev false --minify <minifyEnabled>`, e o
  hermesc com `-w -emit-binary -max-diagnostic-width=80 -out <hbc> <js>` mais `hermesFlags`.
- `.../ReactExtension.kt`: `hermesFlags` vale `["-O", "-output-source-map"]` por padrão.
- `packages/community-cli-plugin/src/commands/bundle/index.js`: `--unstable-transform-profile` vale `default`.
- `@react-native/metro-config` 0.87.1 (`dist/index.js`): `resolverMainFields` `["react-native", "browser", "main"]`,
  plataformas `android` e `ios`, condição de exportação `react-native`, os dois polyfills de `@react-native/js-polyfills`
  (`console.js`, `error-guard.js`), o transformador Babel do React Native com `inlineRequires`, e
  `getModulesRunBeforeMainModule` com `react-native/setup-env`, o arranque do app.

A conferência (`tests/react-native/bundle.mjs`, `metro.config.cjs`) usa exatamente esses padrões e essas opções. Só tira
o `react-native/setup-env`, que exige o pacote `react-native` e um aparelho e não é código do SDK, e aponta o Metro para a
raiz do repositório, de onde `@brot/sdk/read` e `@brot/sdk/tx` resolvem pelo link do workspace
(`node_modules/@brot/sdk`) e pelo mapa `exports` do pacote.

### 1.4 O que o Metro resolveu

- **O `@solana/kit` 8.4.0 publica uma versão para React Native**: a condição `react-native` do seu `exports` aponta
  para `dist/index.native.mjs` (e `program-client-core.native.mjs`), ao lado de `browser`, `node`, `edge-light` e
  `workerd`.
- **Todo pacote `@solana/*` entrou pela versão nativa.** O mapa de fontes de cada pacote lista os arquivos que ele
  levou; em todos, cada `@solana/*` veio de `*.native.mjs`, nenhum de `browser` ou `node` (a conferência falha se vier).
- **Não é preciso pôr `mjs` nas extensões do Metro.** Com as extensões padrão do React Native
  (`js, jsx, json, ts, tsx`), o Metro 0.87.1 resolveu as mesmas 39 versões nativas: o alvo de um `exports` é um arquivo
  exato.

| Pacote | Metro (JavaScript) | Arquivos do SDK | Pacotes `@solana/*` | hermesc (bytecode) |
|---|---|---|---|---|
| `read` | 3.942 KiB | 72 | 39, todos `native.mjs` | 652 KiB |
| `tx` | 4.630 KiB | 100 | 41, todos `native.mjs` | 735 KiB |
| vetores | 8.732 KiB | 72 | 39, todos `native.mjs` | 2.729 KiB |

Medido na última rodada de 9/10/2026, com o SDK como estava naquela hora; os números crescem com ele. O pacote de
vetores carrega os dois arquivos CSV como texto.

### 1.5 O que rodou na VM da v0.13.0

Visto rodando `node tests/react-native/run.mjs` nesta máquina; o trabalho "Mobile bundle" do CI roda o mesmo comando.

- **Globais da VM de linha de comando:** `TextEncoder` existe; `crypto`, `TextDecoder`, `fetch`, `WebSocket`,
  `EventTarget`, `AbortController`, `structuredClone`, `URL`, `Intl` e `console` não existem. `BigInt`,
  `BigInt64Array` e `DataView.setBigUint64` existem e funcionam. O `console` dos pacotes é o polyfill do React Native,
  que cai no `print` da linha de comando.
- **`read`:** o módulo carrega com todas as exportações. `configAddress()` sem `crypto` é recusado com o erro 3610001
  do Kit (`SOLANA_ERROR__SUBTLE_CRYPTO__DIGEST_UNIMPLEMENTED`); depois de instalar só um `crypto.subtle.digest` SHA-256,
  dá `FSFeeWWVwNKL8LWSNGejM6ZLKSw79WaP1GwmpZcxLFqw`, o mesmo PDA `["config"]` que o Node deriva com o Kit.
- **`tx`:** o módulo carrega; `randomCampaignId()` sem `crypto.getRandomValues` recusa ("crypto.getRandomValues is
  missing: polyfill it on this runtime"); com o SHA-256, `buildSweepFees` monta a instrução inteira (5 contas, 1 byte de
  dados), com a conta de config igual à do Node.
- **Vetores:** 24.000 linhas em 2 a 3 s, nenhuma diferença: `split` 6.000, `payout` 2.000, `one_sided` 2.000,
  `opening` 2.000 (`math-vectors.csv`); `snapshot` 6.000, `entry` 2.000, `estimate` 2.000, `schedule` 2.000
  (`snapshot-vectors.csv`). Nenhum polyfill instalado.
- **A conferência falha quando deve:** uma linha de vetor diferente, um módulo que não carrega, um pacote `@solana/*`
  não nativo, ou uma VM que não lê o bytecode do hermesc dão saída diferente de zero (a última foi provada pondo a VM
  0.12.0 no lugar da exata: "exact VM reads bytecode 96, hermesc writes 98", saída 1).

### 1.6 A rodada no Hermes 1.0.0, construído da etiqueta

Para rodar o bytecode que o React Native 0.87.1 de fato publica, a VM foi construída nesta máquina da etiqueta de
origem do compilador: `git clone --depth 1 --branch hermes-v250829098.0.17` (commit
`3477757eb2475555cf8d8df24bfb1deb0613880d`), `cmake -G Ninja -DCMAKE_BUILD_TYPE=Release
-DHERMES_ENABLE_TEST_SUITE=OFF`, `ninja hermes`. Levou cerca de 53 minutos com dois processos e prioridade baixa, numa
máquina de quatro núcleos ocupada com outros testes; é por isso que o CI não faz o mesmo a cada rodada.

- O binário se apresenta "Hermes release version: 1.0.0", "HBC bytecode version: 98": a mesma versão do hermesc do
  pacote npm. Esta construção saiu com `HERMES_ENABLE_INTL` desligado (a opção não foi passada; foi o valor que a
  configuração escolheu), então sem `Intl`.
- **Globais:** `TextEncoder`, `console` e `WeakRef` existem; `crypto`, `TextDecoder`, `fetch`, `WebSocket`,
  `AbortController`, `structuredClone` e `URL` não existem, como na 0.12.0. `BigInt` funciona.
- **A rodada** (`HERMES_EXACT_VM=<binário> node tests/react-native/run.mjs`) executou os três arquivos `.hbc` que o
  hermesc 1.0.0 gerou, com `hermes -b`: os mesmos resultados da 0.12.0, linha por linha. `read` carrega (175
  exportações), recusa o PDA sem `crypto` (3610001) e dá `FSFeeWWVwNKL8LWSNGejM6ZLKSw79WaP1GwmpZcxLFqw` com o SHA-256;
  `tx` carrega (31 exportações), recusa o id sem `getRandomValues` e monta o `sweep_fees` com a conta de config certa; os
  24.000 vetores dão zero diferença, em cerca de 1,3 s. Saída da rodada inteira: 0.

### 1.7 Onde o Kit e o SDK usam cada global

Fonte: as versões nativas do Kit 8.4.0 (`node_modules/.bun/@solana+<pacote>@8.4.0*/node_modules/@solana/<pacote>/
dist/index.native.mjs`) e `packages/sdk/src`. Uma busca só pelo nome dá falsos positivos (as mensagens de erro do Kit
citam "WebSocket", "btoa" e outros), então a tabela lista o ponto de uso.

| Global | Onde | Quando é usada |
|---|---|---|
| `crypto.subtle.digest` | `@solana/addresses` (`getProgramDerivedAddress`, `createAddressWithSeed`), depois de `assertDigestCapabilityIsAvailable` (`@solana/assertions`) | Em toda derivação de PDA |
| `crypto.getRandomValues` | `packages/sdk/src/tx/builders/campaign.ts` (`randomCampaignId`); `@solana/keys` (`createKeyPairFromBytes`, que confere o par assinando bytes aleatórios) | Ao sortear o id de uma abertura; ao montar uma chave a partir de bytes, o que o app não faz |
| `crypto.subtle` Ed25519 (`generateKey`, `sign`, `verify`, `importKey`, `exportKey`) | `@solana/keys`, `@solana/signers`, `@solana/addresses` (`getAddressFromPublicKey`, `getPublicKeyFromAddress`) | Ao gerar, importar ou usar uma chave, o que a carteira faz, não o app |
| `TextEncoder` | `@solana/codecs-strings` e `@solana/signers` (lidos no carregamento), `@solana/addresses` (sementes em texto) | Ao codificar texto UTF-8 |
| `TextDecoder` | `@solana/codecs-strings` (`globalThis.TextDecoder`, lido no carregamento do módulo) | Ao decodificar texto UTF-8 (`getUtf8Decoder`) |
| `fetch` | `@solana/rpc-transport-http` | Em toda chamada RPC por HTTP |
| `AbortController` | `@solana/rpc`, `@solana/rpc-spec`, `@solana/rpc-subscriptions*`, `@solana/subscribable`, `@solana/transaction-confirmation` | Ao cancelar uma chamada RPC ou uma inscrição |
| `WebSocket`, `EventTarget` | `@solana/rpc-subscriptions-channel-websocket` (os dois lidos no carregamento do módulo) | Só em inscrições por WebSocket (`rpcSubscriptions`) |
| `structuredClone` | Nenhum uso nas versões nativas do Kit 8.4.0 | — |

O código do próprio SDK não usa `Buffer`, `TextEncoder`, `crypto.subtle` nem `fetch` diretamente
(`packages/sdk/src/read/bytes.ts`): os PDAs passam pelo Kit, e as leituras por RPC também (`read/rpc.ts` cria o
cliente com `createSolanaRpc`, que usa `fetch` e `AbortController`). Só o `randomCampaignId` lê
`crypto.getRandomValues` direto.

### 1.8 O que o React Native 0.87.1 define ao iniciar

Fonte: `packages/react-native/src/private/setup/setUpDefaultReactNativeEnvironment.js`, `Libraries/Core/setUpXHR.js` e
`src/private/setup/setUpDOM.js` na etiqueta `v0.87.1`. O `react-native/setup-env` roda antes do módulo principal.

- `setUpXHR.js`: `fetch`, `Headers`, `Request`, `Response`, `FormData`, `WebSocket`, `Blob`, `File`, `FileReader`,
  `URL`, `URLSearchParams`, `AbortController`, `AbortSignal`.
- `setUpDOM.js`: `Event`, `EventTarget`, `CustomEvent` e as classes de DOM só de leitura.
- Também: timers, `Promise`, tratamento de erros, `navigator`, `performance`. **Nada de `crypto` nem de `TextDecoder`.**

## 2. O que o app precisa adicionar

| Global | Para quê | Hermes 0.12.0 e 1.0.0 (linha de comando) | React Native 0.87.1 | O app |
|---|---|---|---|---|
| `BigInt` | Toda a matemática e os inteiros de 64 bits dos codecs | Sim | — | Nada |
| `crypto.subtle.digest` (SHA-256) | Todo PDA: os endereços do `read` e todo construtor do `tx` | Não | Não | **Precisa**, antes do primeiro PDA |
| `crypto.getRandomValues` | O id aleatório de uma abertura (T17) | Não | Não | **Precisa**, para abrir campanha |
| `crypto.subtle` Ed25519 | Gerar chave, assinar, verificar | Não | Não | Não precisa: quem assina é a carteira (MWA) |
| `TextEncoder` | Texto UTF-8, sementes em texto | Sim | — | Nada |
| `TextDecoder` | Decodificar texto UTF-8 | Não | Não | Só se algum código decodificar texto; o SDK não decodifica hoje |
| `fetch`, `AbortController` | Toda leitura por RPC (o cliente do Kit que `read/rpc.ts` cria) | Não | Sim | Nada |
| `WebSocket`, `EventTarget` | Inscrições por WebSocket | Não | Sim | Nada; o cliente novo confirma consultando o status da transação, sem WebSocket (TP §3.3) |

**A ordem importa.** `@solana/codecs-strings` guarda `globalThis.TextDecoder` e `globalThis.TextEncoder`, e o canal de
WebSocket guarda `WebSocket` e `EventTarget`, no momento em que o módulo carrega. Um polyfill instalado depois disso não
é visto. Por isso os polyfills ficam no topo do arquivo de entrada do app, antes de qualquer `import` do SDK ou do Kit.
O `crypto.subtle` e o `crypto.getRandomValues` são lidos a cada chamada, mas a mesma regra evita surpresa.

**O erro sem polyfill é um número.** As versões nativas do Kit são de produção: o erro chega como "Solana error
#3610001; Decode this error by running `npx @solana/errors decode -- 3610001`". O app deve mostrar uma mensagem própria.

### 2.1 O zod fica fora do `read` e do `tx`

Fato, visto nesta máquina em 9/10/2026: com o esquema zod da abertura dentro de `@brot/sdk/read`, a conferência falhou
ao empacotar. O build ESM do zod 4.6.5 começa com `export * as core from "../core/index.js"`
(`zod/v4/classic/external.js`), e o Babel do React Native 0.87.1, com os padrões, recusa: "Export namespace should be
first transformed by `@babel/plugin-transform-export-namespace-from`". O `@react-native/babel-preset` 0.87.1 não traz
esse plugin (`src/configs/main.js`, lido na pasta `tests/react-native/node_modules`).

O que se fez: o esquema saiu do `read` para uma entrada própria, `@brot/sdk/schemas`, e uma regra do
dependency-cruiser (`sdk-read-tx-without-zod`) impede o zod de voltar ao `read` ou ao `tx`. Depois da mudança a
conferência voltou a passar.

Para o app (Sprint 20), se quiser usar `@brot/sdk/schemas`: incluir `@babel/plugin-transform-export-namespace-from` no
Babel. O `babel-preset-expo` deve trazer esse plugin [INF, de memória, não conferido nesta sessão: conferir no código do
preset quando o app escolher a versão do Expo]. Os esquemas da API de leitura (Sprint 08) entram na mesma entrada, não no `read`.

## 3. Inferências

- **A VM 0.12.0 do CI basta para pegar uma regressão da matemática.** As duas VMs deram o mesmo resultado nas 24.000
  linhas, `BigInt` segue a especificação, e os vetores cobrem os limites (zeros, valores perto de `u64::MAX`, taxas acima
  de 100%). O que a 0.12.0 não pega é uma diferença do compilador 1.0.0; para isso o CI compila tudo com ele, e a rodada
  da seção 1.6 se repete à mão quando o React Native do app mudar.
- **Quando o React Native do app mudar de linha, a conferência muda junto.** A 0.88 (em `rc`) troca o compilador para a
  linha 260318099; o bytecode pode mudar de versão. O pino é um só lugar: `tests/react-native/package.json`.
- **A Sprint 20 fecha o que esta não fecha:** rodar o mesmo pacote no motor de um app de verdade (Expo, build de
  desenvolvimento), num emulador ou num Seeker, com os polyfills que o app escolher.

## 4. O que não foi feito

- Nenhum aparelho, emulador, Expo ou MWA: não há app (Sprint 20).
- O CI roda o JavaScript na VM 0.12.0 e compila com o hermesc 1.0.0; ele não roda o bytecode 1.0.0. Essa rodada foi
  feita uma vez, à mão, com a VM construída nesta máquina (seção 1.6), e o binário dela não foi guardado no
  repositório.
- Os polyfills que o app vai usar não foram escolhidos: é decisão da Sprint 20.

## Fontes

- facebook/react-native, etiqueta `v0.87.1`: `packages/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/
  facebook/react/{TaskConfiguration.kt,tasks/BundleHermesCTask.kt,ReactExtension.kt}`,
  `packages/community-cli-plugin/src/commands/bundle/index.js`,
  `packages/react-native/src/private/setup/{setUpDefaultReactNativeEnvironment.js,setUpDOM.js}`,
  `packages/react-native/Libraries/Core/{InitializeCore.js,setUpXHR.js}`.
- facebook/hermes: API de lançamentos (v0.13.0 e anteriores) e a etiqueta `hermes-v250829098.0.17`.
- Registro npm: `react-native`, `hermes-compiler`, `metro`, `@react-native/*`, `@babel/core`, `@noble/hashes`,
  `@solana/kit` e seus pacotes 8.4.0.
- `node_modules/@react-native/metro-config/dist/index.js`, `node_modules/@react-native/js-polyfills/console.js` e
  `error-guard.js`, `node_modules/metro-config/src/defaults/` (0.87.1).
- As versões nativas do Kit 8.4.0 e `packages/sdk/src`, nesta máquina.
