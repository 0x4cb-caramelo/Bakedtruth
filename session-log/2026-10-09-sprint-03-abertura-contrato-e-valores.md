# 2026-10-09 — Sprint 03, abertura: as perguntas ao fundador, os fatos da onda 0, o contrato e os valores [AC]

## Context

O pedido foi executar a Sprint 03 ("Readers and resolution; Anchor leaves the workspace") de ponta a ponta, no
mesmo formato da Sprint 02: uma onda 0 em série, que fecha o contrato antes de qualquer frente começar; frentes em
paralelo, cada uma no seu `git worktree`, sem `cargo build-sbf` nas frentes; a integração em série; a saída do
Anchor por último, num commit só, porque os testes de paridade precisam do `pred-provable`; e as revisões da onda 3.
Um pull request contra a `main` no fim, com o CI verde, sem mesclar.

Fontes, nesta ordem: `docs/sprints/sprint-03-readers-resolution.md`; as seções "Reviews", "Carried to Sprints 03 to
05", "Deviations" e "Retrospective" de `docs/sprints/sprint-02-pot-core.md`; o plano técnico v0.1.1, lido da branch
do PR #37 (`docs/tp-align-sprint-02`), ainda aberto (§3.2, §3.4.6, §3.4.8, §3.4.10, §3.4.17, §10, §14.2); o §4 de
`docs/SPRINTS.md`; os dois registros da Sprint 02. O PR #36 (Sprint -1) também segue aberto, em rascunho.

A branch `sprint-03-readers-resolution` saiu da `main` (`ec8d24d`), no worktree `brot-s03`. Cada frente ganhou um
worktree próprio saído da branch da sprint, e não da `main`: era a lição da retrospectiva da Sprint 02.

## Decision

### 1. As perguntas abertas ao fundador continuam abertas

Conferidos `docs/business/ideacao-perguntas-e-respostas.md`, os registros mais novos de `session-log/` (inclusive os
da Sprint -1 e do plano v0.1.1, nas branches dos PRs #36 e #37), o `CHANGELOG.md` e os comentários dos PRs #30, #35,
#36 e #37. Nenhuma das seis tem resposta. Pela regra do pedido ("não construa regra de dinheiro sem resposta"), ficam
como estão:

| # | Pergunta | O que o código faz enquanto isso |
|---|---|---|
| 1 | Quais feeds da Pyth uma campanha de preço pode nomear | Qualquer feed cujo endereço patrocinado (fatia 0) passe nas checagens; a frente R levanta se qualquer pagador consegue criar esse endereço para um feed não patrocinado |
| 2 | Cobrar a abertura em `p − conf` | O preço médio, arredondado a favor da Brot |
| 3 | O feed do SOL/USD como constante compilada | O campo da configuração, conferido só como não nulo |
| 4 | Uma cota própria para as aberturas gratuitas da equipe | A mesma válvula para todas as aberturas |
| 5 | Copiar `min_entry_lamports` na abertura | A leitura viva a cada entrada |
| 6 | Q12: Lucas e Ronaldo com chaves da equipe | Nada a construir; `admin_set_team` aceita até cinco chaves |

### 2. Três fatos achados na onda 0, que mudam o que se constrói

1. **`prev_publish_time` não é a escrita anterior da conta** [F]. Nas cinco contas `PriceUpdateV2` capturadas (SOL e
   BTC na devnet, SOL na geração anterior, SOL e BTC na rede principal, esta capturada hoje no slot 454.743.014),
   `prev_publish_time` vale exatamente `publish_time − 1`: é o agregado anterior da Pythnet, e não a atualização
   anterior gravada na conta patrocinada (que, na devnet, vem de 62 a 64 segundos antes). O esboço do D7 no plano
   ("a última atualização antes do prazo é `publish_time` ou `prev_publish_time`") não se constrói como está escrito.
   O teste exato do `StaleFeed` ficou assim [AC]: depois do prazo e da janela da prova, a conta patrocinada é lida;
   se o `publish_time` dela é anterior ou igual ao prazo **e** mais velho que `prazo − max_age`, a campanha é anulada
   com `StaleFeed`; em qualquer outro caso, NÃO. Como a conta só anda para a frente, `publish_time <= prazo` quer
   dizer que nada foi gravado depois do prazo, e a última atualização antes dele é esse `publish_time`. Depois que
   alguma atualização chegou, o programa não enxerga a última anterior ao prazo, grava NÃO, e o histórico do indexador
   deixa a equipe anular dentro da janela de seis horas (TP §3.4.6). Um feed fresco nunca parece velho.
2. **O Mollusk 0.14, já fixado, injeta stake de época** [F]: `Mollusk` tem o campo público `epoch_stake`
   (`HashMap<Pubkey, u64>`), lido pelo `sol_get_epoch_stake` (`mollusk-svm-0.14.0/src/lib.rs`, linhas 520 e 617). O
   caminho do SIM do `StakeAtLeast` fica testado no Mollusk, sem o crate `litesvm` que a sprint citava: nenhuma
   dependência nova, nenhum Rust acima do 1.89, nenhuma linha a mais no `Cargo.lock`.
3. **O Pinocchio já expõe as três syscalls de que a sprint precisa** [F]: `pinocchio::syscalls` reexporta
   `solana-define-syscall` 5.2.0, com `sol_get_epoch_stake`, `sol_get_stack_height` e `sol_get_sysvar`. O
   `brot-markets` não precisa do crate `solana-epoch-stake` nem do seu pino (a pergunta da proposta §5.4): o pino
   sai do lockfile com o `pred-provable`.

### 3. O contrato congelado (commits `0c71cd9`, `2d162df`, `7706db9`)

- **Leitores.** `readers/mod.rs` despacha os cinco tipos, sem leitor genérico. Cada leitor expõe
  `validate_at_creation`, `outcome_knowable` e `try_resolve`, com o relógio da rede (`ChainTime`: hora, slot e
  época) no contexto. `readers/shared.rs` guarda o que os leitores compartilham: a decisão (`Decision`), a leitura que
  a sustenta (`Reading`: valor, conta, horário de publicação e slot gravado), a regra do prazo, a tabela dos fatos
  irreversíveis do TP §3.4.6 e a distância mínima da linha 3. O leitor da Pyth foi dividido, como o plano previa:
  `price_update.rs` lê a conta; `price_touch.rs` guarda as regras.
- **`resolve_campaign`**, discriminador 10, sem argumentos e sem conta assinante (qualquer carteira dispara e não
  escolhe nada, Q1): campanha, conta métrica, conta de prova (só o tipo preço a lê) e as duas contas do evento.
  `CampaignResolved` (evento 6) leva o valor lido, a conta, o horário de publicação, o slot gravado, o slot e a época
  da leitura. `checks::top_level` recusa CPI, num arquivo próprio para o `checks.rs` não passar de 200 linhas.
- **Contas:** `Campaign.epoch` e `GlobalConfig.params_version` saem da área reservada; nenhuma conta muda de tamanho.
- **Argumentos da abertura**, de 82 para 94 bytes: `epoch` (tipos de época) e `expected_params_version`.
- **Erros 6071 a 6090**, acrescentados no fim; o 6070 (`ReaderNotReady`) fica sem uso, sem reaproveitar o número.
  O `error.rs` passa de 200 linhas: o shank-cli lê os erros de um enum só, e um enum não se divide em arquivos.
- **Um programa de teste**, `tests/programs/cpi-proxy`, que repassa uma instrução por CPI: é o único jeito de
  mostrar que `resolve_campaign` recusa ser chamado de dentro de outro programa. Nunca vai para rede nenhuma.
- **O kit de teste em TypeScript** espelha tudo isso, com duas peças novas: as contas de terceiros nos testes
  (`tests/brot/readers.ts`) e uma campanha de qualquer tipo escrita direto no LiteSVM (`tests/brot/campaigns.ts`).

### 4. Os valores [AC] e por quê

| Valor | Escolha | Por quê |
|---|---|---|
| Distância mínima, preço | 1% do preço, além da borda da faixa de confiança | Um alvo a um passo da faixa é tocado na próxima atualização: a campanha nasceria decidida. 1% fica acima da faixa típica (0,05% a 0,5%) e abaixo do movimento normal de um dia |
| Distância mínima, queima | 1% do fornecimento | Queimar 1% de um token é um acontecimento; menos que isso é ruído de arredondamento de quem queima à mão |
| Distância mínima, liquidez travada (DAMM) | 1% do que já está travado, no mínimo uma unidade | A trava só cresce; abaixo de 1% qualquer posição pequena decidiria |
| Distância mínima, pool de stake | 1% do maior entre o total atual e o último instantâneo | O total de um pool grande oscila menos de 1% por dia; menos que isso a campanha seria decidida pelo próprio movimento diário |
| Distância mínima, stake de validador | 1% do stake atual | Idem, por época |
| Lado distante do alvo de preço | Acima: no máximo 10 vezes o preço; Abaixo: no mínimo um décimo do preço, e nunca zero ou menos | Uma alta de 10 vezes ou uma queda de 90% de um ativo grande em até 90 dias é uma campanha decidida no nascimento (NÃO). Hoje um alvo `Below` de 1 abre: passa a ser recusado |
| NÃO do tipo preço | Só depois de `prazo + 60 s` | Entre o prazo e 60 s depois, um toque logo antes do prazo ainda pode ser provado; sem essa espera, qualquer um gravaria NÃO na frente da prova do SIM. Depois de 60 s, nenhuma prova cumpre "publicada até o prazo" e "no máximo 60 s de idade" ao mesmo tempo |
| Regra de slot | `Clock::slot − posted_slot <= teto(segundos × 1.000 / 100 ms)` na abertura (SOL/USD e o feed da campanha), na entrada e na prova | Freio contra um relógio da rede atrasado, nunca a regra principal. 100 ms por slot é mais rápido do que qualquer rede medida: a regra nunca recusa um preço bom. A confirmar com a medida da frente R |
| Início da época contra o prazo | A época tem de começar, no pior caso, antes do prazo: `agora + slots até ela × 500 ms` | A rede principal anda perto de 400 ms por slot e a devnet perto de 235 ms; 500 ms é o lado lento com folga. Se a época começar depois do prazo, a campanha é anulada (`MissedWindow`) e a taxa de abertura volta. A confirmar com a medida da frente R |
| Época medida | Precisa ser futura (`época > época atual`) | A trava de entrada dos tipos de época é o começo dela: uma época já começada nasceria fechada |
| `StakeAtLeast` | Fechado na abertura por uma feature de build, `stake-at-least`, desligada em todo build e recusada junto com `mainnet` | Nenhuma chave consegue abrir o tipo: abri-lo é uma mudança de código revisada, depois do SIM na devnet (Sprint 05). A resolução não olha a feature: uma campanha aberta sempre resolve |
| Instantâneo do pool de stake depois do prazo | Conta, se ainda for o da época medida | O valor não se move depois de gravado; anular uma leitura válida só desperdiçaria a campanha |
| Alvo da liquidez travada | Em unidades de liquidez, no `target` i128 | O `shift` do programa congelado só existia para caber um alvo u128 num u64; o i128 cabe o alvo inteiro (o esboço zod do plano também não tem `shift`) |
| Termos que o criador viu | `expected_params_version` assinado na abertura | O layout dos argumentos ainda não foi publicado (o SDK é da Sprint 05), então a proteção sai de graça agora; cobre de uma vez a taxa, a taxa unilateral, a parte do criador, a divisão do prêmio, o preço da abertura e a idade do preço na entrada |
| Códigos próprios do SOL/USD | Quatro (`SolUsdWrongOwner`, `SolUsdBadLayout`, `SolUsdNotFullyVerified`, `SolUsdWrongFeed`) | A abertura lê duas contas da Pyth; com os códigos do leitor, um erro não dizia qual das duas falhou (X0.7) |
| Argumentos sem uso | Zerados, ou `UnusedArgumentNotZero` | Um `feed_id` numa campanha de queima seria um campo de 32 bytes que ninguém lê: texto livre pela porta dos fundos (D-j) |

### 5. Quem faz o quê

| Frente | Arquivos |
|---|---|
| A, fatos irreversíveis | `readers/spl_mint.rs`, `readers/damm_v2.rs`; testes nas contas capturadas; paridade com o `pred-provable` |
| B, tipos de época | `readers/epoch.rs`, `stake_pool.rs`, `vote_stake.rs`; o SIM do `StakeAtLeast` no Mollusk; paridade |
| C, a divisão do preço | `readers/price_touch.rs`, `price_update.rs`; a entrada, a prova do SIM, o `StaleFeed`, a linha 3 nas duas pontas |
| D, a resolução | `instructions/resolution/resolve_campaign.rs`; a tabela de resolução como testes; a recusa de CPI; o X0.9 do `top_level` |
| E, a trava de entrada | `instructions/entries/join_campaign.rs`; os testes de entrada |
| F, a abertura | `instructions/campaigns/open_campaign*`, `admin/set_creation_params.rs`; os quatro tipos, a versão dos parâmetros, os códigos do SOL/USD |
| R, fatos da rede | as perguntas da Pyth, os feeds patrocinados, o Alpenglow na devnet, o Lighthouse; notas em `knowledge-base/` |
| S, Surfpool | o Surfpool 1.6.0 fixado no CI com SHA-256; o cenário do preço cruzando o alvo |
| G, saída do Anchor | preparada em `s03-lane-g` (`c8ffa8b`); entra depois da paridade |

## Alternatives considered

- **O crate `litesvm` 0.16 para o SIM do `StakeAtLeast`.** Traria uma segunda árvore da Agave (4.2, além da 4.1 do
  Mollusk) ao lockfile e ao tempo de compilação. O Mollusk já fixado faz o mesmo.
- **Uma chave na configuração para abrir o `StakeAtLeast`.** Daria ao admin um poder novo; a feature de build não dá
  poder a chave nenhuma.
- **Gravar NÃO no tipo preço logo no prazo.** Abriria uma corrida: alguém grava NÃO antes de o serviço provar um toque
  dos últimos segundos.
- **Ler `prev_publish_time` para o `StaleFeed`, como o plano esboçava.** O campo não diz o que o plano supunha.
- **Uma lista de feeds aceitos agora.** É a pergunta 1 ao fundador; o revisor de segurança a lê como reabrir o D-i.

## Consequences

- O tipo preço não grava NÃO no primeiro minuto depois do prazo.
- Uma campanha de época cujo instantâneo foi sobrescrito, ou cuja época passou sem leitura, é anulada; o programa
  congelado gravava NÃO.
- Um alvo de preço `Below` de 1 deixa de abrir.

## Follow-up

- Os valores marcados "a confirmar" dependiam das medidas da frente R. Confirmados no mesmo dia: nenhum minuto
  medido ficou abaixo de 231 ms por slot (devnet) ou 259 ms (rede principal), nem acima de 282 ms; a seção 4 de
  `2026-10-09-sprint-03-integracao-e-revisoes.md` tem a tabela.
- O registro da integração e das revisões está em `2026-10-09-sprint-03-integracao-e-revisoes.md`.

## Fontes

- `tests/fixtures/pyth-*.bin` e `tests/fixtures/index.json` (os cinco `prev_publish_time`).
- `mollusk-svm-0.14.0/src/lib.rs` e `src/epoch_stake.rs`; `pinocchio-0.11.2/src/lib.rs` (`pub use
  solana_define_syscall::definitions as syscalls`); `solana-define-syscall-5.2.0/src/definitions.rs`.
- `programs/pred-provable/src/resolver.rs` e `instructions/resolve.rs`, o original portado.
- O plano técnico v0.1.1 na branch `docs/tp-align-sprint-02` (commit `2a05068`).
