# 2026-10-12 — O sexto tipo, `DbcGraduated`: a graduação de uma curva da Meteora (DBC)

## O pedido

Um pedido colado na sessão, com as decisões fixas que o plano `docs/technical/meteora-readers-plan.md` propunha (M-1 a
M-7): o tipo novo no byte 5, acrescentado no fim; 85 SOL de piso (1 SOL no build `drill`); só o `VirtualPool` da DBC
(o `TransferHookPool` recusado) e só configs cotadas em wSOL; ao abrir, ao menos 10% do limite ainda faltando; a
resolução pelo `finish_curve_timestamp`; o SIM pode ser comprado; aberto em todo build menos o de mainnet. Pedia o
leitor no modelo do `damm_v2.rs`, contas reais capturadas, testes, IDL, SDK, uma demonstração num fork da mainnet no
Surfpool e um PR em rascunho, sem mesclar. Fora do pedido: a caixa de abertura e a página da campanha (exceto o texto
de recusa que um teste exigisse), o upgrade no devnet (que o Ronaldo faz pelo `deploy/devnet/README.md`), o BP, o
resumo de produto e os Termos.

## O que foi feito

- **O leitor** (`programs/brot-markets/src/readers/dbc_graduation.rs`, e `dbc_graduation/config.rs` para a config):
  confere o dono antes de ler qualquer byte, o tamanho (424 bytes o pool, 1.048 a config) e o discriminador; lê
  `config` (72), `quote_reserve` (240), `migration_progress` (308) e `finish_curve_timestamp` (344), e na config
  `quote_mint` (8) e `migration_quote_threshold` (264). Os offsets vieram do código-fonte da DBC e foram conferidos em
  doze contas reais.
- **A abertura** recebe a config do pool como décima conta (`CreationContext.curve_config`). A ordem das recusas: o
  pool (dono, tamanho, discriminador, transfer hook), a config (a do próprio pool, dono, tamanho, cotada em wSOL), o
  piso, o alvo igual ao limite, a curva ainda aberta, e 10% do limite ainda faltando (`min_distance` com 1.000 bps).
- **A trava de entrada** fecha quando o estágio passa de 0, e só então.
- **A resolução** (`stamped_resolution`, ao lado de `fact_resolution` em `readers/shared.rs`): curva completa até o
  prazo é SIM, mesmo resolvida depois, porque o próprio pool diz quando completou; completa depois do prazo é NÃO com
  `met_late`; ainda na curva depois do prazo é NÃO; ilegível é recusada até o prazo e anulada depois.
- **Cinco erros novos, 6148 a 6152**, e `DBC_GRADUATED_OPENS` na regra da linha 1.
- **Doze contas da mainnet** (slot 456.186.130), achadas com `getProgramAccounts` e capturadas por
  `scripts/capture-fixtures-dbc.ts`.
- **Testes**: quatro arquivos Rust no host; um no LiteSVM com o ciclo inteiro; a paridade de cada recusa entre o
  programa e o `validateOpenCampaign`; o caminho A-3 do SDK (preparar, resumir, simular), o `recheck`, o schema e as
  constantes conferidas contra o código Rust.
- **IDL e SDK**: o IDL e o cliente Codama regenerados; no SDK, `chain/dbc.ts`, o tipo nas validações, na trava, no
  `recheck`, no schema, no builder, na preparação da abertura e no resumo dos bytes assinados.
- **Site**: o texto das cinco recusas e o mínimo para o app compilar.
- **A demonstração** (`scripts/surfpool/dbc-graduation.ts`, com `scripts/surfpool/dbc.ts`).
- **Documentos**: o plano técnico v0.1.8 (§3.4.6, §3.4.8 e §3.4.10), o `CLAUDE.md`, o status do plano da Meteora, o
  CHANGELOG e este registro.

## Decisões minhas, e por quê

- **Os códigos começam em 6148, e não em 6098.** O 6101 já é `InvariantViolated`, então a partir de 6098 só cabiam três
  códigos, e o `CLAUDE.md` diz que os códigos são acrescentados no fim e nunca reaproveitados. O pedido mandava seguir
  o `CLAUDE.md` quando os dois discordassem. O comentário do `error.rs` dizia "a partir de 6147", que já estava em uso;
  agora diz 6153.
- **O pool com transfer hook tem erro próprio** (`CurveHasTransferHook`), em vez do `ReaderBadLayout` do plano: a regra é
  um erro por recusa, e o site precisa dizer "é um pool com transfer hook", não "isto não é um pool da DBC".
- **`CurveTooSmall` fica na linha 2** (a conta serve ao tipo) e **`TargetNotThreshold` na linha 3** (o alvo).
- **Curva completa sem carimbo (zero), depois do prazo: NÃO com `met_late`.** A tabela do pedido não trata o caso; segui a
  tabela do plano (seção 4.4), que trata o que não se prova a tempo como os outros fatos irreversíveis tratam o que só se
  viu depois do prazo. Antes do prazo, qualquer curva completa é SIM: ela completou até agora.
- **Um estágio acima de 3 é `ReaderBadLayout`**: é um valor que a DBC não define.
- **Sem a décima conta, `NotEnoughAccountKeys`**, sem código próprio, como as outras contas que faltam. O builder do SDK
  sempre a passa; no SDK, a falta é erro de quem chama (`RangeError`), como o stake do `StakeAtLeast`.
- **A décima conta fica fora da lista de contas do IDL**, como as `Join` do `tally_late_joins`. O resumo dos bytes
  assinados recusava qualquer conta a mais, e a abertura desse tipo sairia como "não assine"; agora ele aceita exatamente
  uma conta só leitura depois das nove, e só nesse tipo.
- **O `open_campaign.rs` passou de 209 para 208 linhas**: a décima conta entra numa linha (`rest.first()`), e duas
  variáveis de uma linha foram para dentro da chamada do pagamento.
- **O site recebeu só o necessário para compilar.** O mapa `KIND_OF` ficou parcial, com `kindOf()`, que recusa o sexto
  tipo com uma mensagem clara até a página dele existir. A página de uma campanha desse tipo mostraria um erro, e o
  script do post de resolução também recusa esse tipo.
- **A regra de pontos**: quem abre uma campanha desse tipo pode fazer o SIM acontecer (comprando o resto da curva), então
  a carteira dele não pontua nela, como na queima e na liquidez travada.
- **O schema não tem alvo para esse tipo**: o alvo é o limite da curva, que quem chama lê da config e passa ao
  `toOpenArgs`. Uma entrada com alvo é recusada.

## O que foi conferido

- A bateria da CI na branch: fmt, lint, clippy com e sem `mainnet`, tsc, 761 testes TypeScript (eram 744), as 146
  suítes Rust, o teste do build de mainnet, o mapa de código, o `os-self-test`, a matriz de contas e o `Cargo.lock`. O
  IDL regenerado do zero não mudou nada. O app (`bun run lint` e `bun run build`) e o pacote do React Native (Metro,
  Hermes, os 24.000 vetores) passam.
- A demonstração no Surfpool 1.6.0, num fork da mainnet, passou de ponta a ponta no pool real
  `mxGZ5hpgCENm94f19rp8NoBd14E4YLXVe4ZFJXQP8S6` (0,019 SOL de 85): campanha aberta; SIM e NÃO com 1 SOL cada; resolução
  recusada com a curva aberta (`NotResolvableYet`); o `Swap2` da DBC completou a curva (estágio 2, 85,000000019 SOL,
  carimbo 1791843052); entrada recusada depois (`OutcomeKnowable`); SIM gravado; as entradas contadas, a confirmação da
  equipe, e 1,9 SOL para quem entrou no SIM, nada para o NÃO.
- Não conferido: o upgrade no devnet, que não era parte do pedido.

## Em aberto

- A caixa de abertura e a página da campanha desse tipo, incluindo dizer na página quem pode fazer o SIM acontecer.
- O upgrade no devnet. Com o piso de 85 SOL, uma demonstração no devnet precisa de uns 90 SOL de teste, ou do build
  `drill`.
- O BP, o resumo de produto, os Termos e a página dos tipos.
- A demonstração no Surfpool como passo do CI, como a do preço; ela depende de o pool continuar na curva na mainnet.
- O tipo das taxas pagas à Meteora (seção 5 do plano), ainda proposta.
- Riscos: o SIM pode ser comprado; um upgrade da DBC pode mudar o layout (as contas capturadas devem ser refeitas); nas
  plataformas orgânicas, cerca de 1% das curvas gradua, então a maioria dessas campanhas termina NÃO.
