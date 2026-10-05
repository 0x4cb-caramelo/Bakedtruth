# Brot Markets — Plano técnico (Technical Plan)

**Versão:** 0.0.1 · **Estado:** aprovado pelo fundador em 5/10/2026 ("docs aprovados, podemos dar início") · **Data:** 5 de outubro de 2026 · **Etapa:** Fase 4,
etapa 4.2 do wizard

Diz como o produto de `docs/product/PRODUCT-BRIEF.md` será construído. Não escreve código nem decide regra de
negócio. O fundador lê o resumo abaixo e a seção 14.2.

**Marcas.** **[F]** fato lido, com o arquivo. **[DF]** decisão do fundador, que não é reaberta aqui. **[DP]** decisão
deste plano, com a alternativa descartada. **[Q]** pergunta em aberto (seção 14). **[AC]** a conferir: depende de
fonte que não foi lida (seção 14.4).

`R-07`, `F3` e `L-12` são as regras, os fluxos e as lacunas do resumo de produto. `P4 §4.5` é a Parte 4 do plano de
negócio, seção 4.5.

## Resumo para o fundador

| Peça | O que faz | Onde roda |
|---|---|---|
| O programa | Guarda o USDC de cada pergunta num cofre próprio, registra as apostas, lê o resultado na rede e calcula quanto cada um recebe | Solana (devnet agora) |
| Serviço de resolução e pagamento | A cada minuto aciona a leitura, espera a janela de 6 horas e envia os pagamentos | Servidor que já existe |
| Serviço de histórico | Copia o que o programa registrou e entrega ao site atividade, minhas apostas e classificação | Mesmo servidor |
| Segundo serviço e vigia | Confere o principal a cada 5 minutos, tenta religar, assume e manda email ao CTO | Outro provedor, a contratar |
| O site | As telas, na direção Ledger², em claro e escuro | Mesmo servidor, atrás do Cloudflare |

**O que se reaproveita.** Do código do Ronaldo: quatro leitores (queima, liquidez travada na Meteora, pool de
staking e stake de validador), o cofre por pergunta e o método do teste que sorteia operações. Do site: a conexão
da carteira e o mascote. O caminho do dinheiro é todo novo.

**Um aviso.** Dois desses leitores (pool de staking e Meteora) não estão na cópia de trabalho deste repositório, e sim
na versão mais nova do repositório do Ronaldo, já baixada. Trazê-los é o primeiro passo.

**As quatro decisões que mais pesam.**

1. **A chave do serviço não manda em dinheiro.** Qualquer carteira pode acionar a leitura e o envio, porque o
   resultado sai do dado lido e o destino é sempre a carteira que apostou. Não há botão no site. Se os dois
   serviços caírem, alguém de fora ainda aciona. Depende da sua confirmação (pergunta 1).
2. **O programa é compilado na conferência automática do GitHub, nunca no servidor**, que é dividido com outro
   projeto e não tem compilador.
3. **A indicação fica quase toda fora do programa.** Ele grava só quem indicou quem; o repasse sai da conta da
   operação, toda semana, com relatório público. É menos código para auditar, e quem indica depende da empresa para
   receber.
4. **Há um banco pequeno, que só copia a rede.** Sem ele não há classificação, histórico nem "minhas apostas"
   depois do pagamento. Se o arquivo se perder, é refeito.

**O que fica sem resposta.** Ninguém verificou se a Pyth, a rede que dá os preços, funciona na devnet como o leitor
de preço precisa. É a primeira tarefa. As doze perguntas para você estão na seção 14.2. **Respondido na Sprint 01:
a Pyth serve na devnet** (`knowledge-base/tecnologia/pyth-leitor-de-preco.md`).

## 1. Stack recommendation

O que o repositório já fixa fica como está **[F]** (`CLAUDE.md`, `Cargo.toml`, `package.json`, `ci.yml`).

| Camada | Escolha e versão | Situação |
|---|---|---|
| Programa | Anchor `=1.1.2` (`anchor-lang`; `anchor-spl` com features padrão); Rust 1.89.0; Solana CLI 3.1.x | Mantida **[F]** |
| Stake de validador | `solana-epoch-stake =3.0.0` | Mantida **[F]** |
| Moeda | USDC clássico, endereço fixo por rede (`USDC_MINT`) | Mantida **[F]** |
| Leitor de preço | Pyth, conta `PriceUpdateV2`, lida por leitor próprio | Nova **[DP]** **[AC]** |
| Pacotes e testes | Bun 1.4.2; LiteSVM com `@solana/kit ~8.3.0` | Mantida **[F]** |
| Testes com contas reais | Surfpool, versão a fixar | Nova **[DP]** **[AC]** |
| Cliente da rede | `@anchor-lang/core ^1.2.0` com `@solana/web3.js ^1.99.0` | Mantida **[F]** |
| Site | Next.js 16.3.8, React 19.2.8, Tailwind v4, `@solana/wallet-adapter-*` | Mantida **[F]** |
| Serviços | TypeScript em Bun 1.4.2; SQLite pelo módulo `bun:sqlite` | Nova **[DP]** **[AC]** |
| Site em produção | `next start` em Node 22 (o servidor tem a v22.23.3) | Nova **[DP]** |
| Compilação verificável | `solana-verify`, a fixar antes da rede principal | Nova **[DP]** |

Nada alfa nem beta. Peça com versão "a fixar" só entra depois de uma prova de versão estável e de compatibilidade
com o Anchor 1.1.2 (seção 14.4).

## 2. Stack rationale

Cada linha é **[DP]**.

| Peça | Escolha | Alternativa descartada | Por quê |
|---|---|---|---|
| Leitor de preço | Escrito à mão, no estilo dos outros: confere dono, formato e cada campo, e é testado contra contas reais capturadas | A biblioteca da Pyth para Rust | Não foi lido se ela compila com `anchor-lang 1.1.2`, e o repositório já pagou por dependência fora de linha (`solana-epoch-stake` preso em 3.0.0 **[F]**). Revê-se depois da prova B1 |
| Tempo no programa | Data e hora (`Clock::unix_timestamp`) | Número de bloco, como hoje | R-07 fala em horas e dias; o bloco da devnet dura cerca de 235 ms, e não 400 **[F]** (`CLAUDE.md`) |
| Serviços | Bun | Node com banco à parte | Já roda `@anchor-lang/core` e `web3.js` neste repositório **[F]** (`scripts/devnet*.ts`), traz SQLite embutido e se instala na pasta do usuário `brot` |
| Banco | SQLite num arquivo | Postgres; ou nenhum banco | O Postgres do servidor é do outro projeto, e a regra é não mexer **[DF]**; um novo pediria contêiner. Sem banco não há classificação nem histórico (seção 3.5) |
| Cliente da rede | Manter `@anchor-lang/core`, `web3.js` 1.x e wallet-adapter | Migrar já para `@solana/kit` e `@solana/react`, que a skill de Solana recomenda para código novo | O conjunto atual é exercitado pelo teste de devnet **[F]**, e o plano de negócio manda manter a conexão da carteira (P4 §2.2). Fica como dívida (T9) |

## 3. Architecture assumptions

### 3.1 As peças e a ordem de construção

```
carteira ──assina──▶ programa brot_markets ◀──aciona── keeper principal (servidor atual)
    ▲                      │ contas e eventos ◀──aciona── keeper reserva (outro provedor) ──email──▶ CTO
    │                      ▼
  site ◀──JSON── indexer + API (SQLite) ──lê a rede por RPC
```

A ordem é a pedida pelo fundador **[DF]**: programa e backend na devnet, depois a ligação, depois o site. Em
blocos, sem datas, para o roteiro de sprints:

| Bloco | Entrega | Depende de |
|---|---|---|
| B0 | Trazer `upstream/main` (leitores e contas reais capturadas); criar `programs/brot-markets` e `packages/sdk` | — |
| B1 | Prova do leitor de preço: ler um `PriceUpdateV2` real, na devnet e no Surfpool | B0 |
| B2 | Núcleo do pote: configuração, pergunta, posição, aposta, fechamento, teto, pausa | B0 |
| B3 | Leitores portados e o de preço; `resolve_question`; "Anulada" | B1, B2 |
| B4 | Janela de 6 horas, acerto, pagamento, taxa; teste aleatório de invariantes | B3 |
| B5 | `packages/sdk` completo; scripts da equipe; ciclo inteiro na devnet | B4 |
| B6 | Keeper no servidor; keeper reserva e vigia no segundo provedor | B5 |
| B7 | Indexer, API e pontuação | B5 |
| B8 | Site Ledger² ligado à API e ao programa | B5, B7 e o design system |
| B9 | Antes da rede principal: indicação, patrocínio, segunda leitura, compilação verificável, carteira 2 de 3 | B4 |

### 3.2 Estrutura do repositório

**[DP] O programa novo nasce ao lado do antigo, em `programs/brot-markets`, com endereço próprio.**
`programs/pred-provable` fica congelado e sai do workspace, num commit só, quando os quatro leitores estiverem
portados com os testes. Alternativa descartada: reescrever dentro da pasta antiga. O site atual e os testes dependem
do IDL antigo, e portar um leitor com o original ao lado permite rodar os dois contra a mesma conta. Custo: dois
programas compilados por algum tempo. Arquivo portado mantém o aviso de autoria da licença MIT **[F]** (`LICENSE`).

```
programs/brot-markets/src/
  lib.rs  constants.rs  error.rs  events.rs  vault.rs
  state/         config.rs  cap.rs  question.rs  position.rs  enums.rs  referral.rs  sponsor.rs
  math/          fees.rs  payout.rs  schedule.rs  invariant.rs
  readers/       mod.rs  cursor.rs  spl_mint.rs  damm_v2.rs  stake_pool.rs  vote_stake.rs  price_touch.rs
  instructions/  admin/  questions/  betting/  resolution/  settlement/  referral/  sponsorship/
programs/brot-markets/tests/   leitores contra contas reais (Rust)
programs/pred-provable/        antigo, congelado; sai depois de B3
packages/sdk/src/   idl/  pdas.ts  math.ts  readers/  instructions/  events.ts  view.ts  format.ts  errors.ts
services/keeper/src/    loop.ts  tasks/  health.ts  watchdog.ts  alert.ts  signer.ts  rpc.ts
services/indexer/src/   ingest.ts  db/  points.ts  api/
app/                app/ (rotas)  features/<funcionalidade>/  components/ui/  styles/tokens.css
content/            partners.json  suggestions.json  void-log/  powers.md
scripts/            devnet*.ts  team/  capture-fixtures.ts
tests/              bun test + LiteSVM, por funcionalidade
deploy/vps/         unidades do systemd, push-deploy.sh, README
```

Regras **[DF]** (`.claude/rules/`): uma instrução e um leitor por arquivo, abaixo de 200 linhas; cabeçalho
`Purpose:`; `node scripts/codemap.js` a cada arquivo criado. `packages/sdk` substitui `app/lib` como biblioteca
compartilhada e não importa React nem Next; uma regra do ESLint (`no-restricted-imports`) garante. Os hooks de
`app/lib/hooks.ts` e `program.ts` vão para `app/features`. O workspace do Bun ganha `packages/*` e `services/*`.

### 3.3 O que se aproveita, arquivo por arquivo

**Fato que muda o ponto de partida [F].** A cópia de trabalho (`feat/layout-tape`) tem seis leitores, em 234 linhas.
Os de pool de staking e de Meteora estão só em `upstream/main` (commit `7b3196d`, de 3/out/2026), onde `resolver.rs`
tem 732 linhas, nove leitores e contas reais em `tests/fixtures/*.bin`. A fonte dos leitores é `upstream/main`.

| Arquivo | Destino | O que acontece |
|---|---|---|
| `resolver.rs` (de `upstream/main`) | Adapta | Vira `readers/`, um arquivo por leitor, com `Cursor`, as funções de leitura e os testes. Saem os quatro leitores de R-14 e `LockedAtLeast`, que volta na fase 1.2 |
| `state.rs` | Sai quase todo | `ResolverKind` vira `ReaderKind`, com cinco variantes; `Market` sai. Fica a disciplina de saldo escriturado em campo |
| `outcome.rs` | Adapta | `deposit_usdc`, `pay_usdc` e `with_market_signer` viram `vault.rs`. O que emite e move token de resultado sai |
| `instructions/resolve.rs` | Adapta | Fica a trava de chamada só no nível da transação. Passa a gravar "em revisão" e ganha "Anulada" |
| `instructions/create_market.rs` | Adapta | Ficam o cofre em endereço derivado e a validação da conta lida |
| `events.rs`, `error.rs`, `constants.rs` | Adapta | Fica o padrão (um evento por instrução, um erro por falha), `USDC_MINT` com a feature `mainnet` e `MIN_STAKE` |
| As outras oito instruções | Saem | Venda, pares, pool, resgate e saque do orçamento são o modelo antigo |
| `app/lib/market.ts`, `metric.ts` | Adapta | Ficam endereços derivados, `decodeEvents` e a leitura igual à do programa. Saem as contas do pool; entram chance, retorno estimado e preço |
| `app/lib/instructions.ts`, `view.ts`, `history.ts` | Reescritos | Para as instruções, os estados e os eventos novos. `history.ts` passa a rodar no indexer |
| `app/lib/format.ts`, `config.ts`, `tokens.ts`, `brand.ts`, `mascot/` | Aproveita | `format.ts` troca blocos por data e hora; o nome passa a Brot Markets |
| `tests/pred-provable.test.ts` | Sai com o programa antigo | Fica o método do teste aleatório (linha 1662) e os casos dos leitores |
| `tests/helpers.ts`, `burn_goal.rs`, `scripts/devnet.ts`; `capture-fixtures.ts` (de `upstream/main`) | Aproveita | Cliente LiteSVM, molde dos testes em Rust, conexão de devnet e captura de contas. `devnet-smoke.ts` e `devnet-seed.ts` são reescritos |

### 3.4 O programa `brot_markets`

Tudo aqui é **[DP]**, salvo marca em contrário. As instruções se chamam `quem_verbo_objeto`, como a skill de Solana
recomenda (`references/programs/design-patterns.md`).

#### 3.4.1 Contas

| Conta | Endereço derivado | Campos | Quem paga o aluguel |
|---|---|---|---|
| `GlobalConfig` | `["config"]` | `admin`, `pending_admin`, `team: [Pubkey; 5]`, `team_len`, `operating_level` (`Normal`, `BetsHalted`), `loser_fee_bps`, `one_sided_fee_bps`, `fee_owner`, `question_count`, `bump`, `_reserved` | Quem inicializa |
| `CapState` | `["cap"]` | `global_cap`, `open_total`, `bump` | Quem inicializa |
| `Question` | `["question", id]` | Identidade: `id`, `proposer`, `approver`, `text_hash`. Leitura: `kind`, `target`, `metric_account`, `threshold`. Tempo: `opens_at`, `bets_close_at`, `deadline_at`. Pote: `pool_yes`, `pool_no`, `first_bettor`, `positions_open`, `event_seq`. Taxa: `fee_bps`, `one_sided_fee_bps`. Patrocínio: `prize_amount`, `prize_funder`, `platform_cut_held`. Resultado: `status`, `outcome`, `observed_value`, `met_late`, `resolved_at`, `review_ends_at`, `contest_stage`, `void_reason`, `void_note_hash`. Acerto: `settle_mode`, `winning_total`, `distributable`, `fee_total`, `paid_out_total`, `fee_collected`, `prize_settled`. `bump`, `_reserved` | Quem propõe |
| Cofre da pergunta | `["vault", question]` | Conta de USDC; a autoridade é a `Question` | Quem propõe |
| `Position` | `["position", question, bettor]` | `question`, `bettor`, `amount_yes`, `amount_no`, `is_first`, `bump` | O apostador; volta para ele no acerto |
| Cofre de taxas | `["fee_vault"]` | Conta de USDC; a autoridade é a `GlobalConfig` | Quem inicializa |
| `ReferralLink` (B9) | `["referral", referee]` | `referee`, `referrer`, `created_at`, `bump` | O indicado |
| `SponsorRequest` (B9) | `["sponsor_request", requester, n]`, com cofre `["sponsor_escrow", request]` | `requester`, `amount`, `form` (`NeutralPrize`, `SponsorBet { side }`), `disclosed`, `question` ou `params_hash`, `status`, `created_at`, `bump` | O patrocinador |

- **Saldos escriturados.** USDC mandado à mão para o cofre não vira aposta nem muda a chance (herdado **[F]**,
  `state.rs`).
- **Uma `Position` por carteira e pergunta**, com os dois lados (L-07, **[Q]** 3).
- **O texto da pergunta fica fora da rede.** O site gera a frase dos parâmetros, por modelo fixo por tipo; a conta
  guarda o `text_hash`.

#### 3.4.2 Estados e transições

O fundador decidiu cinco estados **[DF]** (P1 §3.1). O programa grava `status` e `outcome`; "fechada" sai do
relógio, sem transação.

| Estado público | No programa |
|---|---|
| (não aparece) | `Proposed`: à espera da segunda pessoa |
| Aberta | `Open`, com a aposta permitida |
| Fechada | `Open`, com `agora ≥ bets_close_at` ou com o fato já acontecido (R-08) |
| Em revisão | `InReview`; ou `Contested`, com o pagamento pausado |
| Paga | `Settling` (pagamentos saindo) ou `Settled`, com `outcome` `Yes` ou `No` |
| Anulada | `Settling` ou `Settled`, com `outcome` `Void` |

```
Proposed ─approve─▶ Open ─resolve─▶ InReview ─confirm, ou 6 h vencidas─▶ Settling ─última posição─▶ Settled
                                      │  └─void─▶ Settling (Void)
                                      └─contest─▶ Contested ─mesma leitura, ou decisão─▶ Settling
```

Não há seta de volta. Transição fora do desenho é recusada com erro próprio.

#### 3.4.3 Instruções

| Instrução | Quem pode chamar | O que faz |
|---|---|---|
| `admin_initialize_config` | A chave de atualização do programa, conferida na rede | Cria `GlobalConfig`, `CapState` e o cofre de taxas, uma vez |
| `admin_set_team`, `admin_set_cap`, `admin_set_fee_owner`, `admin_transfer_admin`, `admin_accept_admin` | `admin` | Equipe, teto, dono do destino das taxas e troca do `admin` em dois passos |
| `admin_resume_bets` | `admin` | `BetsHalted` volta a `Normal` |
| `team_propose_question` | Uma chave de `team` | Confere a conta lida, calcula `bets_close_at`, cria a `Question` em `Proposed` e o cofre |
| `team_approve_question` | Outra chave de `team` | `Proposed` vira `Open` |
| `team_cancel_proposal`, `team_pause_bets` | Uma chave de `team` | Desfaz uma proposta ainda não aprovada; liga a pausa |
| `team_confirm_result`, `team_void_question`, `team_open_contest` | Uma chave de `team`, só em `InReview` | Paga na hora; anula, com código do motivo e hash do texto; pausa o pagamento |
| `user_place_bet` | Qualquer carteira | Seção 3.4.4 |
| `resolve_question` | Qualquer carteira, só no nível da transação | Lê a conta, grava `outcome` e `observed_value`, abre a janela |
| `reread_question`, `admin_decide_contest` (B9) | Qualquer carteira; `admin` | As duas etapas da disputa (seção 3.4.7) |
| `finalize_question` | Qualquer carteira, depois de `review_ends_at` | Fotografa os totais, grava `settle_mode`, baixa o teto |
| `settle_position` | Qualquer carteira | Paga uma posição e fecha a conta (seção 3.4.5) |
| `collect_fee`, `settle_prize`, `close_question`, `sweep_fees` | Qualquer carteira | Taxa para o cofre de taxas; prêmio de volta; varre o resto; cofre de taxas para a conta do `fee_owner` |
| `user_link_referrer`; as quatro instruções de patrocínio (B9) | O indicado; o patrocinador e a equipe | Seções 3.4.11 e 3.4.12 |

Instrução aberta tem o mesmo efeito, chame quem chamar: o segundo serviço que chegar recebe erro e nada muda.

#### 3.4.4 A conta do dinheiro

**Aposta, `user_place_bet(side, amount, min_return_bps)`.** Recusa se: a pergunta não está `Open`; passou de
`bets_close_at`; o leitor diz que o resultado já é conhecível (R-08; em preço, sem preço fresco ou com o alvo
tocado); a pausa está ligada; `amount` é menor que `MIN_BET` (1 USDC); ou o teto seria ultrapassado. Com
`min_return_bps` acima de zero, recusa também se o retorno estimado caiu abaixo do pedido, o que protege de uma
aposta grande que entra na frente. Marca `first_bettor` se o pote estava vazio.

**Fechamento (R-06, R-07).** O programa calcula
`bets_close_at = deadline_at − limitar(5% × duração, 24 h, 7 dias)`. Duração máxima de 90 dias e mínima acima de 24
horas. Em tipo de época, a aposta também trava quando a época medida começa.

**Acerto, `finalize_question`.** V é o total do lado vencedor e P o do perdedor, em unidades mínimas.

| Modo | Quando | Taxa | Cada posição recebe |
|---|---|---|---|
| `Split` | `Yes` ou `No`, com os dois lados acima de zero | `fee_total = teto(P × fee_bps ÷ 10.000)` | `piso(aposta_vencedora × distributable ÷ V)`, com `distributable = V + P − fee_total + prize_amount`. O lado perdedor recebe zero |
| `OneSided` | `Yes` ou `No`, com um lado em zero | Por posição, `teto(aposta × 100 ÷ 10.000)`; zero para `first_bettor` | `aposta − taxa`, qualquer que seja o resultado (R-10) |
| `Refund` | `Void` | Zero | A aposta inteira (R-11) |

- **Arredondamento.** Taxa para cima, pagamento para baixo, contas em 128 bits. O resto da divisão é menor que uma
  unidade mínima (0,000001 USDC) por posição vencedora e vai para o cofre de taxas em `close_question`.
- **Totais fotografados** no acerto. Nenhum pagamento lê o saldo vivo do cofre.
- **Taxa fixa por pergunta.** `fee_bps` é copiada na proposta e não muda; o teto é `MAX_FEE_BPS` (1.000), constante
  no código (R-32).
- **Prêmio neutro (R-17)** entra em `distributable`, sem taxa. Em `OneSided` e `Refund` volta ao patrocinador
  (R-12).
- **Aposta de patrocinador** é uma `Position` comum e segue a regra de qualquer apostador (L-11, **[Q]** 5).
- **A isenção do primeiro apostador** vale para a posição inteira da primeira carteira (**[Q]** 3).

#### 3.4.5 O pagamento automático

| Pergunta | Resposta |
|---|---|
| Quem envia | O keeper, com `settle_position` para cada posição de uma pergunta em `Settling` |
| Quanto e para quem | O programa calcula o valor pela foto dos totais. O destino tem de ser uma conta de USDC cuja autoridade é o `bettor` da posição. Quem chama não escolhe nenhum dos dois (R-24) |
| Como não paga duas vezes | Transferência e fechamento da `Position` na mesma instrução. A conta deixa de existir, e posição só nasce com a pergunta em `Open` |
| Taxa de rede e aluguel | A carteira do keeper paga a taxa. O aluguel da `Position` volta ao apostador, inclusive na posição perdedora, que passa pela mesma instrução com valor zero |
| Conta de USDC fechada, de outro dono ou congelada | Falha só aquela posição. O valor fica no cofre, em nome dela, sem prazo. O keeper tenta de novo todo dia, e o dono pode chamar a instrução pela própria carteira (L-15, **[Q]** 2) |
| Lotes | Várias instruções por transação, simuladas antes; a que falhar sai do lote. Tamanho a medir **[AC]** |

**O keeper nunca cria conta de USDC para ninguém.** Recriá-la, a cerca de 0,002 SOL (P4 §4.5), foi descartado: quem
fecha a conta recupera o depósito, e apostar o mínimo com muitas carteiras tiraria SOL do serviço. A instrução é
aberta para o dinheiro dos vencedores não ficar preso se a empresa parar.

#### 3.4.6 A resolução: quem aciona

Não há botão público de resolver **[DF]**. Há duas formas de cumprir; nas duas, quem decide o resultado é o dado
lido.

| | (A) Só as chaves dos dois serviços | (B) Qualquer carteira, sem botão no site |
|---|---|---|
| Chave do serviço roubada | O ladrão pode segurar a resolução; a troca passa pela carteira 2 de 3 | Nada a ganhar: a chave só guarda SOL de taxa |
| Os dois serviços caem | Ninguém resolve: um SIM verdadeiro vira NÃO no prazo, e a janela de época se perde | Um apostador, um parceiro ou a equipe aciona |
| Risco próprio | Disponibilidade presa a duas chaves ligadas à internet | Alguém aciona de madrugada; nosso serviço faria o mesmo um minuto depois |

**Recomendação: (B)**, que o plano de negócio já registra como compatível com a decisão (P4 §4.5). Confirmar,
anular, contestar, pausar e abrir pergunta seguem restritos à equipe. **[Q]** 1.

| Família | Antes do prazo | Depois do prazo |
|---|---|---|
| Fato que não volta (queima, Meteora) | Meta cumprida: `Yes`. Senão, erro | `No`. Se a meta aparece cumprida nessa leitura tardia, grava `met_late`, e a vigia avisa a equipe, que ainda pode anular |
| Foto de época (pool de staking, validador) | Na época medida: `Yes` ou `No` | Época perdida: `Void` (`MissedWindow`). O código atual grava NÃO **[F]** (`resolve_stake_pool`), o que num pote entregaria o dinheiro sem leitura |
| Preço, por toque | Prova de preço no alvo: `Yes` | `No` |
| Qualquer uma | Conta ilegível: erro | Conta ilegível: `Void` (`UnreadableAccount`) |

#### 3.4.7 A janela de 6 horas, a contestação e a anulação

| Momento | Quem grava | Instrução |
|---|---|---|
| Resultado lido; a janela abre | Keeper, ou qualquer carteira | `resolve_question` |
| Confirma, ou anula com motivo, dentro das 6 horas | Uma chave da equipe | `team_confirm_result`, `team_void_question` |
| Ninguém revisou e as 6 horas venceram | Keeper, ou qualquer carteira | `finalize_question` |
| Contestação (no MVP, só a equipe aciona) | Uma chave da equipe | `team_open_contest`; prazo de 1 hora |
| Etapa 1: segunda leitura (B9) | Qualquer carteira | `reread_question`. Igual: paga. Diferente: etapa 2, com 48 horas |
| Etapa 2: dois de três (B9) | `admin`, a carteira 2 de 3 | `admin_decide_contest` |

- **Etapa 2 sem código de votação.** Os dois de três de R-26 são as duas assinaturas da carteira da empresa.
- **Fora da janela ninguém anula.** Depois de `Settling` o resultado é final. As anulações automáticas
  (`MissedWindow`, `UnreadableAccount`) são gravadas pelo programa em `resolve_question`. Responde L-04.
- **Motivo público.** O programa grava o código e o hash; o texto fica em `content/void-log/` (P4 §4.3).

#### 3.4.8 Os leitores

`ReaderKind` é fechado, sem leitor genérico. Cada leitor confere dono e formato antes de ler **[F]**
(`resolver.rs`) e expõe três funções: `validate_at_creation`, `outcome_knowable` (a trava de R-08) e `try_resolve`.

| Leitor | Tipo (R-13) | Observação |
|---|---|---|
| `SupplyAtMost` | Queima | Só token clássico, com emissão renunciada; Token-2022 falha na conferência e é recusado **[F]** |
| `DammV2LockedAtLeast` | Liquidez travada na Meteora | De `upstream/main`. Lê `permanent_lock_liquidity`, que só cresce **[F]** |
| `StakePoolTvlAtLeast` | Pool de staking | De `upstream/main`. Lê a foto que a pool grava por época |
| `StakeAtLeast` | Stake de validador | Nunca deu SIM em teste: o LiteSVM devolve zero **[F]** (`CLAUDE.md`). Só abre pergunta real depois de um SIM conferido na devnet |
| `PriceTouch { feed_id, direction }` | Preço de ativo grande | Novo; abaixo |

**Leitor de preço, modalidade de toque (R-09).** Os números são ponto de partida, a calibrar.

| Regra | Como |
|---|---|
| Conta aceita | `PriceUpdateV2` do programa receptor da Pyth, com verificação completa e o `feed_id` gravado na criação **[AC]** |
| Criação | Exige preço fresco, grava o expoente e recusa alvo já tocado |
| Aposta | Preço com no máximo 30 segundos; recusa se `preço + margem de erro` alcança o alvo. Esses 30 segundos são a fresta que sobra |
| SIM | `publish_time` dentro do prazo; `preço − margem de erro ≥ alvo`; margem de até 0,5% do preço; prova entregue em até 60 segundos da publicação |
| Origem do preço | O keeper publica a cada 10 segundos enquanto houver pergunta de preço aberta e tenta resolver na mesma transação. O programa aceita qualquer conta válida. **A revisão da Sprint 01 propõe separar: na aposta, só a conta patrocinada do ativo; na prova, qualquer conta completa. Decide-se na Sprint 03** |

- **A prova tem prazo** para um toque antigo não ser apresentado depois de uma aposta. Custo: um toque mais curto que
  o intervalo de leitura pode não contar; a pergunta precisa dizer "vale o preço provado na rede" (**[Q]** 4).
- **Prova B1**, antes de qualquer outra peça: ler um `PriceUpdateV2` real na devnet. Se a Pyth não servir lá, o
  leitor é testado só no Surfpool, que traz um modelo de `PriceUpdateV2` para SOL, BTC e ETH **[F]** (skill de
  Solana, `surfpool/overview.md`), e a decisão dos cinco tipos volta ao fundador (P1 §4.2). **Feita na Sprint 01: a
  Pyth serve, e os cinco tipos seguem.**

Token-2022 fica para a fase 1.2, com lista positiva de extensões e revisão própria (P4 §2.4).

#### 3.4.9 Poderes e chaves

| Poder | Quem | Limite no código |
|---|---|---|
| Atualizar o programa; `admin` | Devnet: uma chave em arquivo, da empresa, com um sócio nomeado. Rede principal: carteira 2 de 3, aparelhos físicos, espera pública de 24 a 48 horas **[DF]** (P3) | Compilação verificável; troca do `admin` em dois passos |
| Abrir pergunta | Duas chaves de `team`, de pessoas diferentes | `proposer ≠ approver`; só os cinco tipos |
| Confirmar, anular, contestar | Uma chave de `team` | Só em `InReview`; nunca inverte |
| Pausar | Uma chave de `team` | Só `Normal` para `BetsHalted` |
| Retomar; mudar o teto; mudar a taxa das perguntas futuras | `admin` | `MAX_FEE_BPS`; pergunta aberta não muda |
| Mover as taxas | Qualquer carteira aciona `sweep_fees` | Só para conta cuja autoridade é `fee_owner` |
| Resolver, acertar, pagar | Qualquer carteira (recomendação B) | Destino e valor fixados pelo programa |
| Mover dinheiro de apostador | Ninguém | Não existe instrução, nem saque de emergência |

- **A pausa nunca trava pagamento nem devolução (R-31).** `operating_level` é lido em três instruções:
  `user_place_bet`, `team_approve_question` e `sponsor_create_request`. Um teste roda todas as outras com a pausa
  ligada.
- **Dupla aprovação de verdade** exige as chaves com pessoas diferentes; `content/powers.md` publica quem guarda
  cada uma. O produto de carteira com várias assinaturas fica a escolher **[AC]**.

#### 3.4.10 O teto global (R-30)

`CapState.open_total` soma o que entrou nos cofres de perguntas ainda não acertadas. Sobe na aposta e no aceite de
patrocínio; desce de uma vez em `finalize_question`. A aposta que passaria de `global_cap` é recusada, e só o
`admin` muda o teto. Na devnet ele fica ligado, com valor de teste (L-19). A conta é separada da configuração, para
a aposta escrever só nela. Alternativa descartada: conferir o teto no site, o que não cumpre "gravado no programa"
(P4 §3.4). Custo aceito: as apostas de todas as perguntas entram em fila nessa conta; o limite real fica a medir
**[AC]**.

#### 3.4.11 A indicação (B9)

**[DP] O programa grava só o vínculo; o repasse é rotina do serviço** (a escolha que P4 §3.3 deixou para cá).

| Parte | Onde mora |
|---|---|
| Quem indicou quem | `ReferralLink`, assinado pelo indicado, uma vez, imutável |
| "Antes da primeira aposta" | Conferido pelo indexer: as duas datas estão na rede |
| Taxa de cada aposta vencedora do indicado | `fee_total × aposta ÷ V`, dos eventos, conferida contra a `Question` |
| Os 20% por 90 dias (R-27) e a devolução de até 5 USDC (R-28) | Rotina semanal, da carteira da operação, com relatório público |
| Como o vínculo nasce | Link `?ref=<carteira>`; o site propõe a assinatura antes da primeira aposta (L-10) |

Alternativa descartada: repartir a taxa dentro de `settle_position`. Custo aceito: quem indica depende da empresa
para receber. Início dos 90 dias: **[Q]** 9.

#### 3.4.12 O patrocínio (B9)

Molde: o programa `escrow` da Solana Foundation, em `solana-refs/escrow` (revisão técnica, C8). `sponsor_create_request` trava
o USDC no cofre do pedido (R-20). `team_accept_request` é a aprovação da pergunta proposta e aplica o dinheiro na
mesma instrução: 70% viram `prize_amount` ou uma `Position` do patrocinador, e os 30% ficam em
`platform_cut_held`, no cofre da pergunta, até o desfecho. No fim vão para o cofre de taxas ou, em `Void` por falha
da casa, voltam: o `void_reason` decide (R-16, R-18, **[Q]** 6). A recusa só muda o estado;
`sponsor_withdraw_request`, assinada pelo patrocinador, vale depois da recusa ou de 14 dias pendente. `amount` é
conferido contra as três faixas, e `disclosed = false` é recusado com `SponsorBet` (R-15, R-19). O parceiro
gratuito (F9) não usa nada disto: é pergunta aberta pela equipe, com selo em `content/partners.json`.

#### 3.4.13 Invariantes de dinheiro

Conferidas no fim de cada instrução que move USDC e, nos testes, depois de cada operação sorteada.

| # | Invariante |
|---|---|
| I1 | Saldo do cofre ≥ apostas + prêmio + `platform_cut_held` − o que já saiu. Igual quando ninguém mandou USDC à mão |
| I2 | `pool_yes` e `pool_no` são a soma dos lados de todas as `Position` |
| I3 | `Split`: `fee_total + distributable` é igual a apostas mais prêmio; os pagamentos nunca passam de `distributable` |
| I4 | `OneSided`: pagamentos mais taxas somam as apostas; `first_bettor` recebe o que pôs |
| I5 | `Refund`: cada um recebe exatamente o que apostou; o prêmio volta inteiro |
| I6 | Depois da última posição, a sobra é menor que o número de posições, em unidades mínimas; depois de `close_question`, zero |
| I7 | `open_total` é a soma dos cofres não acertados e nunca passa de `global_cap` |
| I8 | Nenhuma posição é paga duas vezes; nenhum pagamento sai para conta que não é do `bettor` |
| I9 | Dividir uma aposta em várias carteiras nunca aumenta o total recebido |
| I10 | Com a pausa ligada, só as três instruções da seção 3.4.9 falham |

#### 3.4.14 Eventos

Um por instrução, com `emit!`, levando `question` e `seq` para o indexer notar falha na sequência; `emit_cpi!`, que
a skill recomenda, fica para rever antes da auditoria (T4). Lista: `ConfigInitialized`, `ConfigChanged`,
`BetsPaused`, `BetsResumed`, `QuestionProposed`, `QuestionOpened`, `ProposalCancelled`, `BetPlaced` (com os dois
totais depois da aposta), `QuestionResolved` (com o número lido), `ResultConfirmed`, `QuestionVoided`,
`ContestOpened`, `ContestClosed`, `QuestionFinalized`, `PositionSettled`, `FeeCollected`, `PrizeSettled`,
`QuestionClosed`, `ReferralLinked` e os quatro de patrocínio.

#### 3.4.15 Onde mora cada regra

| Regra | Conta ou instrução |
|---|---|
| R-01, R-02, R-10, R-11 | `finalize_question`, nos modos `Split`, `OneSided` e `Refund`; `settle_position` |
| R-03, R-04 | `pool_yes`, `pool_no`; as contas em `packages/sdk/math.ts`, conferidas contra o programa nos testes |
| R-05 | `Position`; `USDC_MINT`; não existe instrução de saída |
| R-06, R-07 | `team_propose_question`, `math/schedule.rs` |
| R-08, R-09 | `outcome_knowable` de cada leitor, chamada na aposta; `readers/price_touch.rs` |
| R-12 | `settle_prize` |
| R-13, R-14 | `ReaderKind`, com cinco variantes; o que está fora não tem leitor |
| R-15 a R-20 | `SponsorRequest` e as quatro instruções de patrocínio |
| R-21, R-29 | Fora do programa: `content/partners.json` e relatório do indexer; `sweep_fees` leva tudo ao `fee_owner` |
| R-22 | `services/keeper` nos dois provedores (seção 3.5) |
| R-23, R-24 | `review_ends_at`, `team_confirm_result`, `team_void_question`, `finalize_question`; `settle_position` |
| R-25, R-26 | `team_open_contest`, `reread_question`, `admin_decide_contest`. Contestação com depósito: fase 1.2 |
| R-27, R-28 | `ReferralLink` e a rotina do serviço |
| R-30, R-31, R-32 | `CapState`; `operating_level` e I10; `GlobalConfig.team`, `admin`, `MAX_FEE_BPS` |

### 3.5 Os serviços fora da rede

| Serviço | Onde roda | O que faz | Chave e dinheiro que ela controla |
|---|---|---|---|
| `brot-keeper` | Servidor atual | A cada 60 segundos: resolve o que já pode, publica preço, acerta o que venceu a janela, paga em lotes e tenta de novo as posições reservadas | Carteira 1. Só o SOL das taxas de rede; nenhum USDC de usuário |
| `brot-keeper` em modo reserva, com a vigia | Outro provedor (**[Q]** 8) | A cada 5 minutos confere o principal. Com 10 minutos sem resposta, pede o religamento até 3 vezes; depois assume o mesmo laço, a cada 5 minutos, e manda email ao CTO (R-22) | Carteira 2, diferente da 1. Idem |
| `brot-indexer` | Servidor atual | Lê as transações do programa, grava no SQLite, serve a API de leitura e o repasse de RPC | Nenhuma |

**O keeper.**

- Decide fora da rede o que tentar, com os leitores de `packages/sdk` que o site também usa, e simula antes de
  enviar. Não guarda estado: relê a rede a cada ciclo.
- Principal e reserva usam provedores de RPC diferentes. O reserva relê a conta de cada pergunta resolvida, compara
  com `observed_value` e avisa a equipe se diferir: é a segunda leitura de R-26.
- **Saúde.** `GET /healthz` devolve a hora do último ciclo completo, o saldo de SOL e as pendências. A vigia também
  olha a rede: pergunta resolvível e parada há mais de 10 minutos é alarme.
- **Religar.** A vigia chama `POST /restart`, com assinatura HMAC. O serviço grava um arquivo-sinal, e uma unidade
  `path` do systemd, do root, reinicia o keeper. O usuário `brot` continua sem sudo.
- **Alertas por email:** principal caiu, reserva assumiu, SOL baixo, NÃO gravado com `met_late`, segunda leitura
  diferente, posição reservada há mais de 7 dias. Saem do segundo provedor, por um serviço de email a escolher
  **[AC]**; o servidor de email do projeto vizinho não é usado.

**Banco de dados: sim, pequeno e descartável [DP].** Hoje o navegador lê as assinaturas e decodifica os eventos, sem
indexador **[F]** (`app/lib/history.ts`). Isso não se mantém: a `Position` fecha no pagamento, e o que foi recebido
só existe nos eventos (L-02); a classificação soma as apostas de todas as perguntas (F12); o histórico da chance,
lido por visitante, estoura o limite do RPC público (revisão técnica, F1); e o relatório do parceiro (R-21) e as
contas da indicação são agregações.

O banco guarda só o que saiu da rede e é refeito do zero se o arquivo se perder: não pede backup e não decide
dinheiro. Custo: um serviço a mais e segundos de atraso na tela. Tabelas: `questions`, `bets` (com os dois totais
depois de cada aposta), `settlements`, `question_events`, `points` e `referrals` (B9); toda linha guarda
`signature`, `seq` e `block_time`. O que a equipe escreve à mão (selo de parceiro, sugestões, texto das anulações,
quadro de poderes) fica em `content/`, no Git, revisado por duas pessoas.

- **Pontuação da devnet (F12).** O indexer calcula: pontos por acerto, nunca por volume **[DF]**. Fórmula a decidir
  (**[Q]** 7). Muitas carteiras inflam a classificação; o freio é o limite de USDC de teste.
- **Sugestões pelo X (F11).** `content/suggestions.json`, mantido pela equipe, com o link e o resumo. Sem API nem
  script do X: custo zero, e nada aparece sem revisão humana (P1 §4.1).
- **USDC de teste (L-08).** O programa usa o USDC de devnet da Circle **[F]** (`constants.rs`), obtido na torneira
  da Circle **[F]** (`scripts/devnet-smoke.ts`). O limite dela não foi lido **[AC]**; **[Q]** 10.

### 3.6 O site

Base: `app/`, em Next.js 16.3.8 com App Router. `app/AGENTS.md` manda ler `node_modules/next/dist/docs/` antes de
escrever código, porque a versão tem mudanças que quebram **[F]**.

| O quê | Decisão |
|---|---|
| Fica e refaz-se | Ficam `providers.tsx`, `wallet-button.tsx`, `toast.tsx` e o mascote. O resto de `app/components` é a direção C ("Tape") e é refeito; `globals.css` traz os tokens dela **[F]** |
| Organização | `app/features/<funcionalidade>/{components,hooks,copy.ts}`, com os textos de tela em `copy.ts` (o idioma não foi decidido, L-01). `components/ui/` só para os primitivos da Ledger². A lista "Saved" fica no `localStorage` (L-16) |
| Tokens de design | `app/styles/tokens.css` com as variáveis de `DESIGN-DIRECTION.md`: o escuro em `:root`, o claro em `:root[data-theme='light']`. O bloco `@theme` do Tailwind v4 aponta para elas; nenhum componente usa cor literal |
| Tema | `data-theme` em `<html>`, decidido por um script curto no `<head>`, antes do CSS, como no protótipo. A chave do `localStorage` passa a `brot-theme` |
| Fontes | Barlow Condensed 700 e Inter 400, 500 e 600, servidas pelo próprio site **[AC]** |
| Dados | Listas e histórico vêm de `/api/v1`. Antes de assinar, o painel relê a `Question` na rede e simula |
| Código de fora | Nenhum script de terceiro nas páginas de aposta; cabeçalhos de segurança em `next.config.ts`. Cloak, SODAX e X em rotas próprias (P4 §5.1) |
| Bloqueio por país | Variável `GEO_BLOCK`: ligada, o servidor lê o país informado pelo Cloudflare **[AC]** e esconde o painel de aposta. Posições e pagamentos seguem visíveis (L-20) |
| Painel da equipe | Sem tela no MVP: a equipe opera por `scripts/team/`, cada pessoa com a própria chave. A página pública de registro existe desde o MVP (L-12) |

Rotas: `/`, `/q/[id]`, `/minhas-apostas`, `/classificacao`, `/registro`, `/sugestoes`. Antes de B8, o
`DESIGN-DIRECTION.md` precisa dizer qual dos dois escuros é o oficial e qual é o tema padrão.

## 4. Data model assumptions

Ponto de partida: `prototype-lab/shared/mock-data.js`.

| No mock | Vira | Onde mora |
|---|---|---|
| `markets[].id`, `cat` | `Question.id`; `Question.kind`, um dos cinco tipos | Rede |
| `name`, `icon`, `bg`, `tone` | Nome do token (Metaplex, como em `tokens.ts`); cor por tipo | Rede e site |
| `title` | Frase gerada dos parâmetros; `text_hash` | Site; o hash na rede |
| `yes` (preço do SIM) | **Sai.** Chance: `pool_yes ÷ (pool_yes + pool_no)` | Calculado |
| `volume` | **Muda.** Dois totais: `pool_yes` e `pool_no` | Rede |
| `days`, `deadline` | **Muda.** Dois momentos: `bets_close_at` e `deadline_at` | Rede |
| `field`, `current`, `target`, `progress`, `proof`, `address` | Leitura ao vivo de `metric_account`; `threshold`; `target` | Rede |
| `history` (preço) | **Muda.** Histórico da chance | Banco (`bets`) |
| `resolved` | **Muda.** `status`, `outcome`, `settle_mode`, `review_ends_at` | Rede |
| `upcoming[]` | **Sai.** Não há estado público antes de "aberta" | — |
| `activity[]` | `bets`, `settlements`, `question_events`. "sold" sai | Banco |
| `leaders[]` | `points`. `profit` e `volume` não pontuam | Banco |
| `wallet.address`, `usdc` | Carteira conectada e saldo lido | Rede |
| `wallet.positions[]` | `Position.amount_yes` e `amount_no`. `shares` e `avg` saem | Rede; depois do pagamento, banco |
| `sponsors{}` | **Muda.** `prize_funder`, `prize_amount`; selo e nome em `content/partners.json`. `budget` sai | Rede e Git |

O que o mock não tem e o sistema precisa: identificadores (`Question.id`, `signature`, `seq`); dono do registro
(`Position.bettor`, `proposer`, `approver`, `prize_funder`); datas; papéis (`team`, `admin`, `operating_level`);
auditoria (eventos, `void_reason`, `content/void-log/`); e os estados `Proposed`, `InReview`, `Contested` e
`Settling`.

## 5. Auth model

| Quem | Como se identifica | O que pode |
|---|---|---|
| Visitante | Não se identifica | Ler tudo |
| Apostador | Assina a transação com a carteira; sem cadastro, sessão ou cookie **[DF]** | Apostar; receber o que é dele |
| Equipe | Chave em `GlobalConfig.team`, uma por pessoa | Propor, aprovar, confirmar, anular, contestar, pausar |
| Empresa | A carteira 2 de 3 (`admin` e chave de atualização) | Configurar, retomar, decidir disputa, atualizar |
| Serviços | Carteira própria, sem privilégio na rede | Acionar instruções abertas |

A assinatura identifica, e a conta derivada de pergunta e carteira diz de quem é o registro. O site e a API não têm
login, rota administrativa nem escrita; o único segredo de entrada no servidor é o HMAC de `POST /restart`.

## 6. API conventions

**Na rede.** Um código de erro por ponto de falha, com teste; um evento por instrução; valores em unidades mínimas
(`u64`), com contas em `u128`; todo USDC movido por `transfer_checked`.

**Fora da rede.** Só leitura, JSON, sob `/api/v1`.

| Convenção | Regra |
|---|---|
| Valores, endereços, datas | Texto em unidades mínimas de USDC; base58; segundos desde 1970, em UTC |
| Erro | `{ "error": { "code", "message" } }`, sem rastro de pilha |
| Limite | Por endereço de internet, em memória; nada é gravado |
| Rotas | `/questions`, `/questions/:id`, `/questions/:id/activity`, `/questions/:id/chance`, `/wallets/:address/positions`, `/leaderboard`, `/health` |
| Repasse de RPC | `/rpc` aceita só os métodos de que a carteira precisa. A chave do provedor pago nunca vai ao navegador |

## 7. Security baseline

**A linha de base (`.claude/rules/security-baseline.md`) aplicada aqui.**

| Regra | Neste produto |
|---|---|
| Segredo nunca no código | Só em `/etc/brot-markets/*.env`; `.env.example` sem valores; hook de commit **[F]**; varredura antes de cada versão |
| Autenticação antes da função sensível; autorização separada | Assinatura e papéis entram em B2, antes de qualquer instrução que mova USDC. Toda instrução confere de quem é a conta |
| Nunca confiar no cliente | O programa refaz toda conta de valor. Site e keeper só simulam |
| Teste com dois usuários | A não recebe, não fecha e não redireciona a posição de B, nem saca o pedido de patrocínio de B |
| Rota administrativa, limite, erro | Não há rota administrativa; limite na API e no repasse de RPC; sem rastro de pilha |
| Chave de serviço só no servidor | Carteiras do keeper, chave do RPC, segredo HMAC e token do túnel nunca em variável `NEXT_PUBLIC_` |
| Menor privilégio; aviso externo com assinatura | Chave de RPC por serviço; token do Cloudflare restrito ao túnel; `POST /restart` confere HMAC e data |
| Vazamento | Trocar a chave primeiro. A carteira do keeper não tem privilégio na rede: gera-se outra e move-se o SOL. Registrar em `session-log/` |

**Riscos próprios deste desenho.**

| Risco | Resposta |
|---|---|
| Quem chama primeiro a inicialização vira administrador | Só a chave de atualização inicializa, conferida contra os dados do programa; publicar e inicializar na mesma sessão |
| Site tomado | Segundo fator com chave física em domínio, Cloudflare, servidor e GitHub; proteção de ramo; versões travadas |

**Antes da rede principal.** Os três critérios do fundador **[DF]** (P4 §3.4) e o que os torna verificáveis.

| Requisito | O que conta como pronto |
|---|---|
| Auditoria externa | Duas empresas, relatório sobre a versão exata, falhas graves corrigidas e conferidas, relatórios públicos. Escopo mínimo: aposta, resolução, acerto, pagamento, os cinco leitores, patrocínio e configuração |
| Carteira 2 de 3 | Dona da chave de atualização e do `admin`, em aparelhos físicos, com espera pública e uma assinatura de teste |
| Teto global | `CapState` na versão auditada, com o valor decidido, testado na devnet |
| Compilação verificável | `solana-verify build` na conferência automática; `verify-from-repo` depois da publicação **[F]** (`solana-refs/solana-verifiable-build`); repositório público no commit que está na rede |
| Pausa e plano de incidente | Pausa testada com I10. Uma página: quem pausa, quem fala, onde publica, em quanto tempo, e quem substitui o CTO no alerta (P4 §4.6, §6.2) |
| Chaves | Nenhuma chave ligada à internet com poder sobre dinheiro; anotado onde vive cada uma e como trocar |
| Ciclo completo e aviso | Um ciclo na devnet e um na rede principal, com pote mínimo. "Programa ainda sem auditoria" visível enquanto for verdade |

Deliberadamente adiado: teto por pergunta (fase futura **[DF]**), Token-2022 e contestação com depósito (fase 1.2),
segundo oráculo (L-14), cofre de chaves para o keeper (antes da rede principal).

### 7.1 Adiado na Sprint 00

A regra `security-baseline` manda registrar aqui o que foi adiado de propósito. A revisão adversarial que fechou a
Sprint 00 não achou nada crítico; isto é o que ficou para depois, com a sprint que herda.

| O que ficou | Risco enquanto não é feito | Sprint |
|---|---|---|
| Atestar a origem do `.so`; reproduzir o hash com `solana-verify` | Quem compromete o trabalho de compilação entrega um binário com hash coerente | 16 |
| Fixar o SHA-256 das ferramentas baixadas no CI (instalador da Solana, binário do Anchor) | A origem de uma ferramenta comprometida compromete o programa | 16 |
| Variante `mainnet` compilada e publicada com nome próprio, e conferência da rede ao publicar | Publicar a variante errada cria um programa cujo colateral não é o USDC real | 16; o endereço do USDC na configuração, na 02 |
| Varredura de segredos: base58, URL com senha, hexadecimal, binário | Um desses formatos entra no repositório sem ser visto | 16 |
| `CODEOWNERS` e proteção da `main` | Um envio direto à `main` não passa pela conferência antes de entrar | 16 |
| Registro do `bun.lock` num espelho de terceiro | Disponibilidade de um terceiro em todo build; os hashes nunca foram comparados com o registro oficial | 16 |
| Rota de chat do upstream, com chave de servidor e sem limite de uso real | Com a chave configurada, vira um modelo gratuito de uso geral pago pela empresa | 09; até lá, sem chave |
| Baixar o artefato pelo número da execução e guardar a chave do endereço do programa fora de `target/` | Publicar o artefato errado, ou perder o endereço | 05 |

## 8. Privacy/compliance baseline

Para apostar, o produto não coleta dado pessoal **[DF]**. Sobram três pontos, cada um com as nove perguntas de
`.claude/rules/privacy-audit.md`.

| Pergunta | Endereço de carteira | Nome de usuário do X nas sugestões | Endereço de internet do visitante |
|---|---|---|---|
| 1. Que dado | Endereço público e as apostas ligadas a ele; pseudônimo, mas ligável a uma pessoa | O nome, dentro do link da publicação | IP e país |
| 2. Por quê | "Minhas apostas", atividade e classificação | Crédito e link da sugestão escolhida | Limitar abuso; bloqueio por país, se ligado |
| 3. Onde fica | Na rede, público e permanente; cópia no SQLite | `content/suggestions.json`, no Git | Em memória; nunca em disco |
| 4. Quem acessa | Qualquer pessoa | Qualquer pessoa, na página | Só o processo |
| 5. Controle | Nenhum: é público | Revisão de duas pessoas para entrar | Não há leitura por pessoas |
| 6. Retenção | Na rede, para sempre | Enquanto a sugestão estiver na página | Minutos |
| 7. Logs | Os serviços registram assinaturas e carteiras; nunca IP | Histórico do Git | Os do Cloudflare seguem a conta do Cloudflare **[AC]** |
| 8. Exclusão e exportação | A cópia pode ser apagada; a rede, não. O site diz isso antes da primeira aposta | Sai a pedido; publicação apagada no X sai da página | Nada a exportar |
| 9. Documento ou consentimento | A política de privacidade explica que a aposta é pública e permanente (L-21) | Decidir se a página mostra o nome ou só o link; revisão de privacidade antes de construir (P4 §5.3) | A política cita o limitador e o Cloudflare |

Sem dado pessoal: o programa (só chaves públicas), o keeper e o banco, que copia a rede. Não há estatística de
visitas; se entrar, as nove perguntas voltam. O relatório do parceiro traz volume e número de carteiras, sem
endereços.

## 9. Testing strategy

| Camada | O que se testa | Ferramenta |
|---|---|---|
| Leitores | Cada um contra contas reais capturadas; conta cortada ou malformada dá erro, nunca pânico | `cargo test`, com `tests/fixtures/*.bin` **[F]** (`upstream/main`) |
| Contas de valor | Taxa, pagamento, fechamento e arredondamento como funções puras; os exemplos do plano viram casos | `cargo test`; `bun test` em `packages/sdk` |
| Instruções | Um teste por instrução e por código de erro; toda transição, permitida e proibida | `bun test` com LiteSVM |
| **Invariantes, aleatório** | Com semente fixa, centenas de operações sorteadas (apostar, pausar, mandar USDC à mão, avançar o relógio, resolver, anular, acertar, pagar fora de ordem e duas vezes, fechar a conta de USDC de um vencedor), com I1 a I10 conferidas depois de cada uma | `bun test` com LiteSVM, no método que já existe **[F]** |
| Dois usuários; pote de um lado só | A contra B em cada instrução com dono. Uma linha por caso: só vencedores, só perdedores, ninguém, um só apostador, com e sem prêmio | `bun test` |
| Leitor de preço | Preço fresco, velho, com margem larga, de outro ativo, conta falsa, toque dentro e fora do prazo | LiteSVM com contas capturadas; Surfpool com o modelo da Pyth **[AC]** |
| Serviços | O laço do keeper; a vigia com o principal derrubado; o indexer refazendo o banco do zero | `bun test` |
| Ciclo inteiro | Propor, aprovar, apostar, resolver, janela, pagar, com o keeper de verdade | `scripts/devnet-smoke.ts`, reescrito |

**Só numa rede de verdade:** o SIM do leitor de stake de validador **[F]**; a Pyth na devnet; a virada de época; o
tamanho real do lote de pagamentos; os limites dos provedores de RPC. Rodam à mão antes de cada publicação.
`anchor build` vem antes de testar, porque os testes carregam o binário **[F]** (`CLAUDE.md`).

## 10. CI/CD expectations

**A cada envio**, em `.github/workflows/ci.yml`, que já fixa Ubuntu 24.04, Solana 3.1.10, Anchor 1.1.2 e as ações
por hash **[F]**.

| Passo | Situação |
|---|---|
| `cargo fmt --check`, Prettier, `cargo clippy -D warnings` | Existe |
| `anchor build` | Existe; compila os dois programas enquanto o antigo ficar |
| IDL commitado em dia | Existe; passa a conferir `brot_markets` e `packages/sdk/idl` |
| `tsc --noEmit`, `bun test`, `cargo test`; lint e build do site | Existe; ganha `packages/sdk` e `services` |
| `node scripts/codemap.js --check`, `node scripts/os-self-test.js`, varredura de segredos | Acrescentar |
| Publicar o `.so` e o IDL como artefato, com o SHA-256 | Acrescentar |

| Destino | Como o código chega |
|---|---|
| Programa na devnet | Uma pessoa baixa o artefato, confere o SHA-256 e publica com a chave de atualização, da própria máquina. A chave não vai para o GitHub nem para o servidor |
| Programa na rede principal | O artefato de `solana-verify build`; a atualização é uma proposta na carteira 2 de 3 |
| Site e serviços | `deploy/vps/push-deploy.sh`: pacote do Git por SSH; o usuário `brot` monta a versão em `releases/<sha>`; o root troca `current` e reinicia; se `/health` não responder, volta à anterior. É o padrão do vizinho **[F]** (`agenttokenfy/deploy/vps/README.md`) |
| Keeper reserva | O mesmo pacote, no segundo provedor |

## 11. Environment variables

Sem valores. "Servidor" é `/etc/brot-markets/`, do root, `0640`, grupo `brot`.

| Variável | Quem usa | Onde vive | Segredo |
|---|---|---|---|
| `NEXT_PUBLIC_CLUSTER`, `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_PROGRAM_ID` | Site | `web.env`; `app/.env.example` | Não |
| `API_INTERNAL_URL`, `GEO_BLOCK`, `GEO_BLOCK_COUNTRIES` | Site, no servidor | `web.env` | Não |
| `RPC_URL_INDEXER` | Indexer e repasse | `indexer.env` | Sim |
| `SQLITE_PATH`, `RATE_LIMIT_PER_MIN` | Indexer | `indexer.env` | Não |
| `RPC_URL_KEEPER`, `KEEPER_KEYPAIR` | Keeper | `keeper.env`, um por provedor | Sim |
| `KEEPER_MODE` (`primary`, `standby`) | Keeper | `keeper.env` | Não |
| `PRICE_SOURCE_URL`, `PRICE_SOURCE_KEY` | Keeper | `keeper.env` | A chave, sim **[AC]** |
| `PRIMARY_HEALTH_URL`, `ALERT_EMAIL_TO`, `ALERT_SMTP_URL` | Vigia | `keeper.env` do segundo provedor | A URL de email, sim |
| `RESTART_HMAC_SECRET` | Vigia e keeper principal | `keeper.env`, nos dois | Sim |
| `TUNNEL_TOKEN` | Túnel | `tunnel.env`, `0600` | Sim |
| `DEVNET_WALLET`, `DEVNET_RPC_URL`, `TEAM_KEYPAIR` | Scripts de devnet e da equipe | Máquina de quem roda **[F]**; na rede principal, aparelho físico | As carteiras, sim |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` | Configuração do túnel e do DNS | Fora deste repositório **[F]** (`servidor-e-dominio.md`) | Sim |

A cópia que os sócios alcançam é o cofre de senhas da equipe, nunca o repositório nem o chat. O
`deploy/vps/README.md` anota, para cada segredo, onde vive e como trocar.

## 12. Deployment assumptions

**O servidor [F]** (`knowledge-base/tecnologia/servidor-e-dominio.md`): Hostinger KVM 2, 2 processadores, 7,9 GB,
Ubuntu 22.04, dividido com `ash` e `agent-rails`; tem Node 22, Git e Docker; não tem Bun, Rust, Solana, Anchor nem
compilador de C. Já existem o usuário `brot`, `/srv/brot-markets` e `/etc/brot-markets`.

**As regras da casa [F]** (mesmo arquivo, §1.3) são seguidas sem exceção: nenhuma porta para fora; usuário de
serviço sem docker, sudo ou SSH; segredos em `/etc/<projeto>/*.env`; código por pacote do Git; nenhum reinício nem
mudança de sistema.

| Unidade do systemd | Usuário | Escuta em | Memória, de partida |
|---|---|---|---|
| `brot-web.service` (`next start`, Node 22) | `brot` | `127.0.0.1:4200` | 768 MB |
| `brot-indexer.service` (Bun) | `brot` | `127.0.0.1:4201` | 512 MB |
| `brot-keeper.service` (Bun) | `brot` | `127.0.0.1:4210` | 384 MB |
| `brot-tunnel.service` | A definir **[AC]** | Só conexão de saída | 128 MB |

As portas ficam só em `127.0.0.1`, na faixa 4200 a 4299, que está livre **[F]**. Cada unidade leva `MemoryMax` e
`CPUQuota`, para não tirar memória dos vizinhos. O Bun é instalado na pasta do usuário `brot`; se ele roda neste
Ubuntu é a primeira conferência de B6 **[AC]**.

**Onde o programa é compilado.**

| Opção | A favor | Contra |
|---|---|---|
| Contêiner no servidor, com limites | Não instala nada no sistema | O Anchor 1.1.x pede uma biblioteca de sistema mais nova que a do Ubuntu 22.04 **[F]** (`ci.yml`), então só roda em contêiner, que pela regra da casa é do root; a compilação ocupa os dois processadores por minutos, ao lado do email e do painel; e o servidor não precisa do binário |
| **Conferência automática do GitHub** | Já compila com as versões fixadas a cada envio; o binário sai com hash; é o caminho da compilação verificável | Depende do GitHub no dia da publicação |
| Máquina de um desenvolvedor | Rápido para iterar | A máquina do fundador não compila nem roda os testes **[F]** (P4 §6.2); o resultado não é reproduzível |

**[DP] Conferência automática.** A máquina do desenvolvedor serve só para iterar. O servidor recebe o site, os
serviços e o IDL, já commitado.

**Túnel. [DP]** Um túnel do Cloudflare só do Brot Markets, com token próprio; o que existe é do outro projeto, e a
regra é não mexer **[DF]**. Destinos: o domínio do site para `127.0.0.1:4200`, com a API repassada em `/api`; e um
nome separado, só com `/healthz` e `/restart`, para `127.0.0.1:4210`.

**Segundo serviço. [DP]** Uma máquina pequena, fora da Hostinger, com o mesmo pacote do keeper em modo reserva.
Alternativas descartadas: o agendador do GitHub, que tem intervalo mínimo de 5 minutos e pode atrasar ou descartar
tarefas, e o da Vercel, que só roda a cada minuto no plano pago **[F]** (`saida-fechamento-cron-e-perguntas.md`
§3.2). Qual provedor e a que custo: **[Q]** 8.

**Domínio.** `brot.markets` não está na conta do Cloudflare nem responde no DNS público **[F]**. Sem ele o túnel
não tem endereço: **[Q]** 11.

## 13. Risks

Os riscos de negócio estão em P4, capítulo 8. Aqui, os deste plano.

| Risco | Gravidade | O que reduz | Se acontecer |
|---|---|---|---|
| A Pyth não serve na devnet como o leitor precisa | Alta. **Afastado na Sprint 01: serve** | A prova B1 antes de tudo; o modelo de preço do Surfpool | Abrir com quatro tipos, ou voltar à decisão dos cinco (P1 §4.2) |
| Quem controla a atualização e a governança do receptor da Pyth controla o que o leitor lê. Na devnet é uma chave comum; na rede principal, um endereço derivado cujo controle não foi conferido (Sprint 01) | Média na devnet, alta na rede principal | O leitor aceita um receptor só e um tamanho exato, então mudança de formato quebra a leitura em vez de ler errado; vigia sobre a instalação e a configuração do receptor (Sprint 07); saber quem controla a autoridade antes da rede principal (Sprint 16) | Pausar as perguntas de preço; a equipe anula na janela |
| A conta patrocinada de preço é paga por terceiro e renova a cada 62 a 64 segundos na devnet (Sprint 01) | Média | Idade máxima como parâmetro; publicação própria pelo keeper, com a chave do serviço de preços | Sem preço fresco, a aposta em pergunta de preço é recusada; a pergunta segue aberta |
| Toque curto não capturado; fresta de 30 segundos na aposta | Média | Leitura a cada 10 segundos; a regra escrita na pergunta | A equipe anula na janela se o serviço falhou |
| O leitor de stake de validador nunca deu SIM em teste | Alta | Um SIM conferido na devnet antes de pergunta real | O tipo fica fechado; os outros quatro seguem |
| Dois serviços com o mesmo código têm o mesmo defeito | Alta | Janela de 6 horas; segunda leitura por outro RPC | A equipe anula na janela |
| A equipe não confere e um resultado errado é pago | Alta | Alertas de `met_late` e de leitura diferente; dono para a rotina (P4 §6.1) | Não há correção depois de `Settling` |
| Programa novo, sem revisão de fora | Crítica | Arquivos curtos, invariantes em toda instrução, teste aleatório, núcleo cedo para a auditoria | P4 §8 |
| Servidor dividido | Média | Limites por unidade; nada instalado no sistema; aviso ao outro lado | Parar as unidades `brot-*`; o keeper reserva segue |

## 14. Open questions

### 14.1 As lacunas do resumo de produto

"Resolvida" quer dizer que o plano diz como se faz; a tela de cada uma continua lacuna de design.

| Lacuna | Situação neste plano |
|---|---|
| L-02, L-22, L-23 | Resolvidas nos dados: posições pela rede e histórico pela API; preço de agora, alvo e "sem preço fresco"; histórico da chance e atividade sem custo extra (mostrar ou não: fundador) |
| L-03, L-05, L-06 | Mecânica resolvida: simulação antes de assinar e `min_return_bps`; "sem chance" com pote vazio, e retorno contando a aposta do usuário; um código de erro por falha, com mensagens em `packages/sdk/errors.ts` |
| L-04 | Resolvida (seções 3.4.2 e 3.4.7): `Contested` é o estado da disputa; fora da janela ninguém anula |
| L-07, L-08, L-09 | Propostas do plano, com pergunta ao fundador: **[Q]** 3, 10 e 7 |
| L-10, L-11, L-15 | Resolvidas no programa (seções 3.4.11, 3.4.12 e 3.4.5), com **[Q]** 9, 5, 6 e 2 |
| L-12 | MVP sem tela: scripts e página de registro. O painel segue lacuna |
| L-14 | As duas etapas são construídas em B9. Se a etapa 2 vale antes da fase 1.2: fundador. Segundo oráculo: T8 |
| L-16 | "Saved" no navegador. Canal de aviso: não há no MVP |
| L-17, L-24 | Técnica resolvida (arquivos em `content/`, relatório do indexer). A fase das sugestões e o parceiro que não publica: fundador |
| L-18 | Só o lugar: rotas próprias. Na devnet o Cloak é demonstração, sem código no site (P4 §5.2) |
| L-19, L-20 | Mecânica resolvida. O valor do teto: fundador. O texto do bloqueio depende da avaliação jurídica |
| L-01, L-13, L-21, L-25 | Não são técnicas; seguem com o fundador |

### 14.2 Perguntas para o fundador

**Situação em 5/10/2026.** O fundador aprovou este plano ("docs aprovados, podemos dar início") sem alterar nenhuma
das doze respostas. Tinha sido avisado de que, sem resposta em contrário, vale a recomendação. Por isso **a coluna
"Recomendação" é o padrão de trabalho**, e cada sprint que depende de uma pergunta a relê no fechamento. Três itens
não têm padrão possível e seguem abertos: a verba e o fornecedor da pergunta 8, a compra do domínio da pergunta 11
e os nomes da pergunta 12.

| # | Pergunta | Opções | Recomendação |
|---|---|---|---|
| 1 | Quem pode acionar a leitura do resultado e o envio dos pagamentos? Em nenhuma opção há botão no site | (A) Só os nossos dois serviços. (B) Qualquer carteira, direto na rede | **B.** Quem aciona não escolhe resultado, valor nem destino, e se os dois serviços caírem alguém de fora aciona |
| 2 | O vencedor fechou a conta de USDC, e o serviço tenta de novo todo dia. Ele também pode pedir o envio pela própria carteira? | (a) Só a tentativa automática. (b) Também uma ação "receber", só nesse caso | **b.** Sem ela, quem ganhou depende de o nosso serviço existir |
| 3 | Limites da aposta | Mínimo de 1 USDC, ou outro. Apostar nos dois lados: pode ou não. Isenção do primeiro apostador: tudo o que ele apostar, ou só a primeira aposta | **1 USDC; pode nos dois lados**, porque outra carteira contorna a proibição; **isenção para a pessoa**, a leitura literal da decisão |
| 4 | Na pergunta de preço, o que conta como "encostou no alvo"? | (a) O preço que o serviço provar na rede em até 60 segundos. (b) Qualquer preço assinado dentro do prazo, mesmo provado depois | **a.** Em (b), quem vê um toque rápido aposta no SIM e só depois apresenta a prova. Em (a), um toque de poucos segundos pode não contar, e a pergunta tem de dizer isso |
| 5 | A aposta de patrocinador, que tem lado, no pote de um lado só e na anulada | (a) Segue a regra de qualquer aposta. (b) Volta inteira, como o prêmio | **a.** R-17 diz que ela "conta como aposta comum" |
| 6 | Onde ficam os 30% do patrocínio até a pergunta terminar? | (a) No cofre da pergunta; no fim o programa manda para a casa ou devolve. (b) Com a casa desde o aceite, que devolve à mão | **a.** O programa cumpre a regra sozinho |
| 7 | A fórmula dos pontos da devnet | (a) 1 ponto por pergunta com aposta no lado certo. (b) Pontos que crescem com a dificuldade do acerto | **a**, para começar. Nas duas, muitas carteiras inflam a classificação |
| 8 | O segundo serviço precisa de outro provedor; o acesso pago à rede e o email de alerta, de fornecedor. Com que verba? | Uma máquina pequena fora da Hostinger; ou adiar o segundo serviço | **Contratar já.** Cabe na verba de infraestrutura informada |
| 9 | Os 90 dias da indicação começam quando? | (a) Na criação do vínculo. (b) Na primeira aposta do indicado | **b.** Quem indica não perde dias enquanto o indicado não aposta |
| 10 | Como a pessoa consegue USDC de teste? | (a) Link para a torneira da Circle. (b) Moeda de teste nossa, com torneira nossa | **a** agora, sem construir nada. Passar a (b), que põe uma chave a mais no servidor, se o limite da Circle travar a campanha |
| 11 | O domínio `brot.markets` foi comprado? Que endereço o site usa até lá? | (a) Comprar e pôr no Cloudflare. (b) Um subdomínio de um domínio que já está na conta | **a**, com **b** como provisório na devnet |
| 12 | Nomes: quem guarda a chave de atualização do programa novo na devnet; quem são as pessoas com chave de equipe; e o Ronaldo já sabe que o projeto vai para o servidor que ele também usa? | — | Definir antes de B2. A regra da casa pede aviso antes de instalar |

### 14.3 Perguntas que a equipe técnica resolve

| # | Pergunta | Quando |
|---|---|---|
| T1 | Trazer `upstream/main` por merge, ou só os leitores e as contas capturadas | B0 |
| T2 | Leitor de preço à mão ou com a biblioteca da Pyth; os números: idade máxima, prazo da prova, margem de erro, intervalo de publicação. **Decidido na Sprint 01: à mão. Os números ficam para a Sprint 03** | B1, B3 |
| T3 | Tamanho do lote de pagamentos e o processamento de cada instrução | B4 |
| T4 | `emit!` ou `emit_cpi!`; fuzzing dedicado | Antes da auditoria |
| T5 | Provedores de RPC (um por keeper e o do repasse) e o serviço de email | B6 |
| T6 | Como o túnel roda sem docker e sem root | B6 |
| T7 | Produto de carteira com várias assinaturas, com espera pública | B9 |
| T8 | Segundo oráculo para a disputa em pergunta de preço (L-14) | B9 |
| T9 | Migração para `@solana/kit`; fechar ou guardar a conta `Question` | Depois da devnet |

### 14.4 A conferir

O plano depende destas afirmações, e nenhuma estava nos arquivos lidos quando ele foi escrito. As que a Sprint 01
conferiu trazem o resultado em negrito; o detalhe e as fontes estão em
`knowledge-base/tecnologia/pyth-leitor-de-preco.md`.

| # | O que conferir |
|---|---|
| C1 | Se a Pyth existe na devnet: programa receptor, contas de preço e identificadores de SOL e BTC (B1). **Conferido na Sprint 01: existe, nos mesmos endereços da rede principal** |
| C2 | O formato exato de `PriceUpdateV2`; se a biblioteca da Pyth para Rust compila com `anchor-lang 1.1.2`. **Formato conferido na Sprint 01 (134 bytes). A compilação da biblioteca não foi tentada: o leitor foi escrito à mão** |
| C3 | A taxa por atualização de preço, e se o serviço público de preços exige chave. **Conferido na Sprint 01: taxa zero no receptor; o serviço exige chave desde 26/8/2026** |
| C4 | A versão estável do Surfpool, e se ele simula o stake de época. **Versão conferida na Sprint 01 (v1.6.0, sem binário para Windows). O stake de época segue sem conferir e foi para a Sprint 03** |
| C5 | O limite da torneira de USDC da Circle na devnet |
| C6 | O aluguel de uma `Position` (a revisão técnica estimou cerca de 0,0017 SOL) |
| C7 | Quantos pagamentos cabem numa transação; o limite de escrita por conta |
| C8 | Se o Bun 1.4.2 roda no Ubuntu 22.04 do servidor; `bun:sqlite` com um escritor e vários leitores |
| C9 | Se o túnel roda sem root, e se o país do visitante chega ao servidor por ele |
| C10 | Como esta versão do Next serve as fontes |
| C11 | Carteira com várias assinaturas com espera pública para atualizar programa |
| C12 | O desvio de `unix_timestamp` na devnet. **Uma amostra na Sprint 01: 1 segundo à frente. Não é medida ao longo do tempo** |
| C13 | O que o Cloudflare registra dos visitantes |

Depois deste plano: `docs/technical/registry-pick.md` (etapa 4.3) e `docs/SPRINTS.md` (etapa 4.4).
