# Surfpool e o leitor de preço — a rodada da Sprint 03

Levantamento de 9 de outubro de 2026, feito para o critério que a Sprint 01 passou à Sprint 03: "o Surfpool 1.6.0
fixado na conferência automática com o SHA-256 do binário conferido, e o leitor de preço rodando dentro de uma
instrução contra o modelo de `PriceUpdateV2` dele, com um cenário que move o preço através do alvo; e anotado se ele
simula o stake de época". O que está em "Fatos" foi lido na fonte (o código do Surfpool nas etiquetas `v1.5.0` e
`v1.6.0`, a API de lançamentos do GitHub, os próprios arquivos baixados) ou visto rodando o Surfpool 1.5.0 nesta
máquina. O binário 1.6.0 foi baixado e conferido, mas **não foi executado aqui**: quem o executa é a conferência
automática. O que é conclusão minha está em "Inferências".

## Veredito

**O modelo de preço do Surfpool serve, com um ajuste.** Nas versões 1.5.0 e 1.6.0 ele só modela a geração anterior da
Pyth: a conta que o modelo deriva sozinho é a `7UVimf…`, do receptor `rec5EK…`, que o nosso leitor recusa de
propósito. Para escrever na conta patrocinada atualizada (`7AviUf…`, do receptor `rec2HH…`), a rodada registra a mesma
descrição de conta do modelo sob o receptor atualizado; o formato é idêntico. Sem esse registro, o Surfpool ignora a
mudança de preço em silêncio e responde sucesso, e por isso a rodada confere cada mudança nos bytes da conta.

**O Surfpool não simula o stake de época.** Em nenhuma das duas versões `sol_get_epoch_stake` devolve outra coisa que
zero. A pergunta de stake de validador (`StakeAtLeast`) não ganha um SIM no Surfpool.

## 1. Fatos

### 1.1 O lançamento e o binário

Fonte: API de lançamentos do GitHub (`/repos/txtx/surfpool/releases`), lida em 9/10/2026.

- O repositório mudou de dono: `txtx/surfpool` responde 301 para `solana-foundation/surfpool`, inclusive no endereço
  de download dos arquivos. A conferência automática baixa direto do endereço novo.
- **v1.6.0**, publicada em 18/9/2026 às 16h47 (UTC), estável. **v1.5.0**, de 13/7/2026.
- Cada lançamento traz quatro arquivos, enviados pelo robô de publicação no mesmo minuto do lançamento: Linux x64,
  macOS x64, macOS arm64 **e Windows x64**. A nota da Sprint 01 (`pyth-leitor-de-preco.md`, seção 1.6) diz que não há
  binário para Windows; o arquivo `surfpool-windows-x64.tar.gz` existe desde pelo menos a v1.1.2. Se ele roda no
  Windows, não conferido.
- O lançamento **não publica arquivo de somas de verificação**. A única soma publicada é o campo `digest` de cada
  arquivo na API, calculado pelo próprio GitHub ao receber o arquivo. É nela que o `surfpool update` confia
  (`crates/cli/src/cli/update/mod.rs`: "SHA256 digest computed by GitHub server-side at upload time").

### 1.2 As somas SHA-256

Calculadas nesta máquina em 9/10/2026, cada download numa pasta própria e vazia.

| Arquivo | Tamanho | SHA-256 | Conferência |
|---|---|---|---|
| v1.6.0 `surfpool-linux-x64.tar.gz` | 36.196.094 bytes | `cb471b00aa3b7d603338eb74ebfec1d23959ecba005b5f1be42ba8d174107fc2` | Igual ao `digest` do GitHub |
| v1.6.0 `surfpool`, o único arquivo dentro dele | 103.395.912 bytes | `53128829df4b482c2ade476bca5bbf6f34f30a4f32bab25e02d2aa5f9de49263` | Calculada; o GitHub não publica a do binário |
| v1.5.0 `surfpool-linux-x64.tar.gz` | 34.170.467 bytes | `5b20a3b46e60c4f819af7b4da5c3ea211f76041710617841cc23247d15887ddc` | Igual ao `digest` do GitHub e à soma fixada no projeto agent-rails |
| v1.5.0 `surfpool`, dentro dele | 101.648.968 bytes | `5c1b29156dc9785589e64d5298edd6c4b88ced5df42e3e4f4660929330ad067a` | Idêntico ao `~/.local/bin/surfpool` usado nas rodadas locais |

A conferência automática fixa as duas primeiras e confere as duas: a do arquivo antes de abri-lo, a do binário depois.

### 1.3 O modelo de `PriceUpdateV2`

Fonte: `crates/core/src/scenarios/protocols/pyth/v2/` (`overrides.yaml` e `idl.json`) e
`crates/core/src/surfnet/svm.rs` nas duas etiquetas; as cadeias de texto dos dois binários.

- **Um modelo só, "Override Price Feed"** (`pyth-price-feed-v2`). A conta é derivada das sementes
  `[0 em u16 little-endian, feed_id]` sob `pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT`, o programa de contas
  patrocinadas da geração anterior. Para SOL/USD, isso dá `7UVimf…`.
- **A descrição da conta** (o IDL) que acompanha o modelo tem `address: rec5EK…`, o receptor anterior. Ela declara
  `PriceUpdateV2` com o mesmo discriminador e os mesmos campos que o nosso leitor lê. É idêntica nas duas versões.
- **Nenhuma das duas versões conhece a geração atualizada**: os binários não contêm `rec2HH` nem `pyt2F4`.
- **Como uma mudança é aplicada** (igual nas duas versões): o Surfpool resolve o endereço, busca a conta na rede de
  origem se `fetchBeforeUse` for verdadeiro, e procura o IDL **pelo dono da conta**. Sem IDL para o dono, registra um
  aviso e pula a mudança; a chamada `surfnet_registerScenario` responde sucesso do mesmo jeito. Com o IDL, decodifica a
  conta, troca os campos pedidos por caminho com pontos (`price_message.price`, `posted_slot`), recodifica e guarda os
  bytes que sobram no fim: a conta continua com 134 bytes, o mesmo dono e o mesmo saldo. O identificador do modelo
  (`templateId`) não entra nessa aplicação; serve ao painel do Surfpool.
- **O que mudou na 1.6.0** (lançamento, PR 751): o modelo passou a listar, além do preço, a margem de erro, o
  expoente, o horário de publicação, o horário anterior, as médias móveis e o slot gravado, e os valores passam a ser
  convertidos pelo tipo que o IDL declara. Na 1.5.0 o modelo lista só o preço, mas a aplicação aceita qualquer campo
  por caminho: a margem, os dois horários e o slot foram trocados assim na 1.5.0, conferido rodando.
- **Quando uma mudança acontece**: a de slot relativo 0 é aplicada durante a própria chamada de registro; as outras,
  quando a rede local chega ao slot do registro mais o slot relativo.

Visto rodando a 1.5.0 numa cópia local da rede principal, em 9/10/2026:

- Uma mudança de preço na `7AviUf…` sem IDL para `rec2HH…`: a conta não mudou, a chamada respondeu sucesso, e o
  registro do Surfpool trouxe "No IDL registered for program rec2HH… (owner of account 7AviUf…), skipping override".
- Depois de `surfnet_registerIdl` com o mesmo IDL e `address` trocado para `rec2HH…`: preço, margem, horário de
  publicação, horário anterior e slot gravado mudaram como pedido; dono `rec2HH…`, 134 bytes, verificação completa e o
  identificador de SOL/USD ficaram.
- Uma mudança registrada no slot 454.754.019 para dali a quatro slots apareceu no 454.754.023.

### 1.4 Os comandos que movem um preço

| Comando | O que faz | Na rodada |
|---|---|---|
| `surfnet_registerScenario` | Registra mudanças de conta numa linha do tempo de slots, pelo modelo | Sim: o preço fresco, o preço abaixo do alvo e o movimento |
| `surfnet_registerIdl`, `surfnet_getActiveIdl` | Registra e lê a descrição de contas de um programa | Sim: o IDL do modelo, copiado para `rec2HH…` |
| `surfnet_setAccount` | Escreve os bytes de uma conta diretamente (os dados em hexadecimal) | Só para instalar o programa e dar saldo às carteiras |
| `surfnet_timeTravel`, `surfnet_pauseClock`, `surfnet_resumeClock` | Movem e param o relógio; servem para envelhecer um preço | Não. Pelo texto do modelo da 1.6.0, `absoluteTimestamp` vai em milissegundos |

### 1.5 O relógio da rede local

Fonte: `crates/core/src/surfnet/svm.rs` (1.6.0) e medida na 1.5.0.

- A rede local começa no slot da rede de origem e na hora do relógio de parede. Cada bloco produzido soma o tempo de
  slot (400 ms) ao relógio da rede; `Clock::unix_timestamp` sai dessa conta. O relógio da rede pode portanto se
  afastar do relógio de parede, e o texto do modelo da 1.6.0 diz o mesmo: o horário de publicação vale contra o relógio
  da rede local, não contra o real.
- Medido na 1.5.0: o relógio começou igual ao de parede, ao segundo, e em 5,0 s de parede andou 13 slots e 5 s.
- A conta de SOL/USD trazida da rede principal tinha o slot gravado **à frente** do slot da rede local, de 12 a 16
  slots, nas duas vezes em que olhei: a rede local parte de um slot atrás da ponta.
- `epoch_start_timestamp` e `leader_schedule_epoch` do `Clock` são sempre zero (código da 1.6.0; visto também na
  1.5.0).
- O código da 1.6.0, quando compilado com o recurso `version_check`, consulta `cloud.txtx.run/api/versions` ao
  iniciar, à procura de avisos de versão. O endereço está no binário publicado; que a consulta esteja ligada nele é
  inferência. Seria uma chamada de rede a mais na conferência automática.

### 1.6 O stake de época

Fonte: `Cargo.toml` das duas etiquetas do Surfpool; `crates/litesvm/src/callback.rs` e o `CHANGELOG.md` da LiteSVM nas
etiquetas `v0.14.0` e `v0.16.0`; a busca no código da etiqueta `v1.6.0` do Surfpool.

- **Surfpool 1.5.0 usa a LiteSVM 0.14.0**, que não responde ao pedido de stake: fica a resposta padrão, zero. A própria
  LiteSVM, ao mudar isso na 0.15.0, escreveu "previously always `0`".
- **Surfpool 1.6.0 usa a LiteSVM 0.16.0**, que já guarda um stake por conta de voto (`set_epoch_stake`) e devolve zero
  para quem não foi configurado. O código do Surfpool 1.6.0 nunca chama essa configuração e não tem comando para ela:
  `epoch_stake` só aparece no nome da chave de recurso `enable_get_epoch_stake_syscall`. O método `getVoteAccounts`
  devolve listas vazias.
- **Resposta: não simula.** Nas duas versões, `sol_get_epoch_stake` devolve zero para qualquer conta de voto e zero
  para o total. Conclusão tirada do código, sem rodar um programa que chame a função.

## 2. Decisões desta rodada

| Decisão | Escolha | Alternativa descartada | Por quê |
|---|---|---|---|
| Qual conta o cenário move | A patrocinada atualizada `7AviUf…`, trazida da rede principal, com o IDL do modelo registrado para `rec2HH…` | A `7UVimf…` que o modelo deriva | O programa só aceita a geração atualizada; a anterior seria recusada antes de qualquer leitura |
| Como saber que a mudança aconteceu | Ler os bytes da conta depois de cada mudança | Confiar na resposta do registro | O Surfpool responde sucesso quando pula a mudança |
| Os horários do preço | Carimbados pelo relógio da rede local | Os horários reais da Pyth | O relógio da rede local não é o de parede |
| A margem de erro | Fixada em 0,05% do preço | A margem real do momento | Uma margem larga num dia agitado recusaria a abertura e derrubaria a conferência sem defeito no código |
| Instalar o programa | Escrever as contas do carregador com `surfnet_setAccount`, com uma autoridade de atualização gerada em memória | `solana program deploy` | O deploy vai para o endereço do arquivo de chave, que fica fora do repositório; no agent-rails, foi parar num endereço aleatório com saída 0 |
| Avisos do Surfpool | `--log-level warn` no lugar de `--ci` | `--ci`, que força `--log-level none` | Um aviso de mudança pulada aparece na falha da conferência |
| Versão do Surfpool | A rodada recusa outra versão quando a conferência pede uma (`SURFPOOL_EXPECTED_VERSION`) | Aceitar a que estiver no PATH | Um Surfpool que não é o fixado não pode passar em silêncio |

## 3. O que a rodada prova

A rodada é `bun run scripts/surfpool/price-touch.ts`, depois de `bun run build:program`.

- **Prova** que o leitor de preço do programa roda dentro de `user_open_campaign` e de `resolve_campaign` sobre os
  bytes do modelo do Surfpool, na conta patrocinada atualizada de SOL/USD; que a abertura aceita essa conta quando ela
  está fresca pelo relógio da rede; que a resolução é recusada enquanto o preço fica abaixo do alvo, com uma prova que
  só falha nisso (fresca e publicada dentro da janela da campanha); e que, depois de uma mudança agendada quatro slots
  adiante pôr preço menos margem acima do alvo, a resolução grava SIM, abre
  a janela de revisão de seis horas e emite um `CampaignResolved` com a conta da prova, o horário de publicação e o
  slot gravado.
- **Não prova** a verificação real da Pyth (o modelo escreve bytes; "completa" é o que os bytes dizem, sem Wormhole);
  que a conta patrocinada só anda para a frente (item próprio da sprint); o tempo de slot e o relógio da devnet e da
  rede principal (Alpenglow); a trava de entrada; o NÃO e o `StaleFeed` depois do prazo; nem a abertura paga, que lê o
  SOL/USD e que a abertura gratuita da equipe pula.
- **Resultado em 9/10/2026, com a 1.5.0 e o binário do contrato congelado** (leitores ainda sem corpo): tudo até a
  abertura passa; a resolução antes do movimento responde `ReaderNotReady` (6070) e a rodada sai com erro, como deve.
  A recusa e o SIM esperam o binário integrado da sprint; a conferência automática roda a 1.6.0.

## 4. Inferências (minhas, a validar)

- **O Surfpool deve passar a modelar a geração atualizada em algum momento.** Se isso acontecer, a rodada registra no
  log que o IDL já existia e segue igual.
- **A rede principal pública pode limitar a conferência automática.** A rodada faz poucas leituras remotas, mas os
  executores do GitHub dividem endereços. Se falhar por isso, a saída é um endereço privado em
  `SURFPOOL_DATASOURCE_RPC_URL`, que a rodada nunca imprime.
- **Para um SIM de stake de validador fora da devnet**, o caminho que resta é a LiteSVM em Rust com `set_epoch_stake`
  (da 0.15.0 em diante), se uma dessas versões compilar com o Rust 1.89 fixado; a 0.16.0 é a que o próprio Surfpool
  1.6.0 usa.

## 5. Perguntas em aberto

1. Qual código a resolução usa para uma prova válida que não cruza o alvo antes do prazo: `ProofDoesNotTouch` (6085) ou
   `NotResolvableYet` (6072)? A rodada aceita os dois; a escolha é da raia que escreve o leitor.
2. O valor observado de uma campanha de preço é o preço da prova? A rodada supõe que sim ("o valor lido").
3. A primeira execução na conferência automática confirma que a 1.6.0 se comporta como o código diz (a mesma
   aplicação de mudanças e o `--version` no formato `surfpool 1.6.0`).

## Fontes

- API de lançamentos: https://api.github.com/repos/txtx/surfpool/releases (redireciona para `solana-foundation`),
  lida em 9/10/2026; notas da v1.6.0 com os PRs 748 e 751.
- Código do Surfpool, etiquetas `v1.5.0` e `v1.6.0` em https://github.com/solana-foundation/surfpool:
  `crates/core/src/scenarios/protocols/pyth/v2/overrides.yaml` e `idl.json`, `crates/core/src/scenarios/README.md`,
  `crates/core/src/surfnet/svm.rs` (`materialize_overrides_for_slot`, `get_forged_account_data`, o relógio),
  `crates/core/src/rpc/surfnet_cheatcodes.rs`, `crates/types/src/scenarios.rs`, `crates/core/src/rpc/minimal.rs`,
  `crates/types/src/features.rs`, `crates/cli/src/cli/mod.rs`, `crates/cli/src/cli/update/mod.rs`, `Cargo.toml`.
- Código da LiteSVM, etiquetas `v0.14.0` e `v0.16.0` em https://github.com/LiteSVM/litesvm: `crates/litesvm/src/callback.rs`,
  `crates/litesvm/src/lib.rs`, `CHANGELOG.md`.
- Os arquivos dos lançamentos 1.5.0 e 1.6.0 para Linux x64, baixados e somados nesta máquina em 9/10/2026.
- Rodadas locais do Surfpool 1.5.0 sobre a rede principal, 9/10/2026, com `scripts/surfpool/`.
- O projeto agent-rails desta equipe (`packages/e2e/`): a instalação do programa sem chave e as duas aprovações falsas
  da conferência dele.
