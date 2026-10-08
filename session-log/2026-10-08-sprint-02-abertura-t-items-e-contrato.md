# 2026-10-08 — Sprint 02, abertura: os T-items, a compilação do primeiro dia e o contrato congelado

## Context

O fundador mandou executar a Sprint 02 ("Pot core on Pinocchio: config, paid opening, vault, entries") de ponta a
ponta, com agentes em paralelo, cada um no seu `git worktree`, e um pull request contra a `main` no fim, sem
mesclar. A ordem pedida: uma onda 0 em série (branch, T15, a compilação do primeiro dia, os T-items no
`session-log/`, e o contrato congelado antes de qualquer agente começar), seis frentes em paralelo (A `checks`,
B admin e estado, C matemática, D abertura, E entradas, F ferramentas), a integração em série e as revisões.

O PR #27 (`docs/architecture-seeker-ai`, com o plano técnico v0.1.0 e o roteiro) ainda não foi mesclado, então a
branch `sprint-02-pot-core` saiu dele. O PR desta sprint carrega também os commits do #27.

Fontes, nesta ordem: `docs/sprints/sprint-02-pot-core.md`, `docs/technical/TECHNICAL-PLAN.md` v0.1.0 (§3.4.1 a
3.4.4, 3.4.8 a 3.4.10, 3.4.14, 3.4.16, 3.4.17, §7, §9, §10) e `docs/SPRINTS.md` §4.

## Decision

### O que a onda 0 resolveu antes do contrato

1. **T15 e C30, feitos primeiro** (commit `7d770ce`). O `bun.lock` baixava tudo de `registry.npmmirror.com` porque
   o `~/.npmrc` desta máquina aponta para o espelho. Um `bunfig.toml` na raiz fixa `registry.npmjs.org` (ele vence
   o `~/.npmrc`: conferido com `bun install --verbose`), e o lockfile passou a gravar cada pacote com a URL vazia,
   que é como o bun registra o registro padrão. Conferido com cache novo e `bun install --frozen-lockfile`: 705
   pacotes baixados, todos de `registry.npmjs.org`, todos com o sha512 que o lockfile já tinha. Os dois
   `trustedDependencies` saíram: `sharp` 0.35.5 não tem script de instalação, e o `postinstall` do
   `unrs-resolver` 1.12.2 só rebaixaria um binário que o bun já instala como dependência opcional, fora da
   conferência do lockfile.
2. **A compilação do primeiro dia passou** (C14). Um programa mínimo com `pinocchio = "=0.11.2"` e
   `pinocchio-system = "=0.6.1"` (o par que o crates.io resolve: o `pinocchio-system` 0.6.1 pede `pinocchio` 0.11)
   compila com `cargo build-sbf` da Solana CLI 3.1.10 (platform-tools v1.52, rustc 1.89.0): 4.720 bytes. O
   esqueleto do contrato, com todos os módulos, compila em 9.680 bytes. A parte "no CI" só se confere quando o PR
   rodar; fica registrada no arquivo da sprint.
3. **O programa liga `std`.** O crate `shank`, que só traz os atributos do IDL, não declara `#![no_std]`; com ele
   no grafo, o `#[panic_handler]` próprio colide com o do `std` (`duplicate lang item panic_impl`). O programa usa
   então o `pinocchio::entrypoint!` comum, com o gancho de pânico do `std`. Custo medido: cerca de 200 bytes no
   binário de teste. O atributo de cada derive do Shank não gera código em tempo de execução (lido no código do
   `shank_macro` 0.4.9).
4. **T4: eventos por self-CPI desde a Sprint 02.** O teste do primeiro dia: um programa Pinocchio que emite um
   evento por chamada a si mesmo, assinada pela PDA `["__event_authority"]`, rodado no `litesvm` do npm 1.5.0.
   - O evento volta inteiro: `TransactionMetadata.innerInstructions()` mostra a instrução interna, com altura de
     pilha 2 e os bytes certos. Isso responde C16: o `litesvm` do npm expõe instruções internas.
   - Custo: 7.244 CU a transação inteira, com uma busca de PDA dentro do tratador; com a autoridade como constante,
     menos.
   - Uma chamada direta, de fora, da instrução de evento é recusada: ninguém além do programa assina pela PDA.
   - **A conta do próprio programa precisa vir na instrução.** Sem ela, a chamada falha com `MissingAccount`. Por
     isso toda instrução termina com duas contas, `event_authority` e `program`, como no `emit_cpi!` do Anchor.
   - A autoridade de eventos é `E5CgcK5xs4YfPdBLnCWTAA9ruStbTqLjEzTxtVaRuB5o`, bump 254, conferida por teste.
   - Formato: a instrução interna carrega `[0xFF, discriminador do evento, bytes do evento]`. O `0xFF` não é usado
     por instrução nenhuma.
5. **Mollusk 0.14.0, e não o 0.16.0 do plano** (§1, §9). O 0.15 e o 0.16 dependem da Agave 4.3, cujos crates
   declaram `rust-version` 1.97.1; o repositório fixa o Rust 1.89 (`rust-toolchain.toml`), e a compilação do
   primeiro dia foi definida nele. O 0.14.0 resolve para a Agave 4.1.2, que não declara Rust mais novo. Um
   `.cargo/config.toml` liga o resolvedor que respeita a versão do Rust
   (`incompatible-rust-versions = "fallback"`), para que um `cargo update` futuro não volte para a 4.3; os builds
   com `--locked` não mudam. Os tipos que o Mollusk usa ficam fixados nas versões que ele mesmo resolve
   (`solana-account` 4.7.0, `solana-instruction` 3.5.1, `solana-pubkey` 4.4.0). O `solana-address` do programa
   ficou no 2.8.0 que o lockfile já tinha, para não mexer em nada do programa congelado: o lockfile só ganhou
   pacotes.
   - **Herança para a Sprint 03:** o crate `litesvm` 0.17.0, que o plano escolhe para o teste do `StakeAtLeast`,
     tem o mesmo problema (Agave 4.3). A 0.16 declara Rust 1.89 sobre a Agave 4.2.

### Os T-items

| T | Decisão | Por quê |
|---|---|---|
| T4 | Self-CPI desde já, com `[event_authority, program]` no fim de toda instrução | Voltou no LiteSVM no primeiro dia (item 4); o plano manda self-CPI quando isso acontece |
| T9 | Shank 0.4.9 como atributos: `ShankAccount`, `ShankInstruction`, `ShankType`, `#[idl_type("u64")]` nos campos guardados como bytes. O IDL e o ensaio do Codama ficam com a frente F; a decisão final é da Sprint 05 | O Shank lê o código, não compila nada; o `idl_type` deixa o IDL mostrar `u64` onde o layout guarda 8 bytes |
| T10 | `expected_entry_total` é a entrada inteira do baker, os dois lados, antes desta entrada (0 na primeira) | Uma transação repetida encontra outro total e falha, em vez de entrar duas vezes |
| T11 | `fee_bps`, nome neutro, no `GlobalConfig` e nos parâmetros de criação | O plano adotou; D1 está fechado |
| T12 | Feature `drill`: duração mínima de 15 minutos, janela de revisão de 10 minutos e fechamento de entradas no mínimo 5 minutos antes do prazo **[AC]**. A feature `mainnet` recusa `drill` em tempo de compilação. A checagem de CI fica com a frente F | Com o piso de 24 horas, uma campanha de 15 minutos fecharia antes de abrir; por isso o terceiro valor de treino, que as fontes não citam |
| T17 | A campanha mora em `["campaign", id]` (u64 little-endian) e é criada só no bump canônico (`checks::canonical_pda`) | Um bump fora do canônico deixaria existir uma segunda conta para o mesmo `id` e furaria a trava de repetição |
| T18 | `max_open_campaigns`: 1.000 na devnet **[AC]**, teto de código 10.000 | 1.000 é a carga que o keeper precisa aguentar (X1.8); o teto é dez vezes isso |
| T19 | Tamanhos do contrato: `GlobalConfig` 400 bytes, `Campaign` 512, `Entry` 100; os dois cofres sem dados. O aluguel é medido no LiteSVM e conferido na devnet na integração | Os grupos de resultado e de acerto (Sprints 03 e 04) já estão no layout, zerados, e cada conta termina numa área reservada; o tamanho medido agora é o tamanho final |
| T23 | Os 10% da abertura ficam no cofre da campanha, escriturados em `opening_fee_lamports`, até o resultado | O plano adotou; o desconto ou o reembolso são da Sprint 04 |
| T24 | Uma checagem, um teste negativo; e a prova, uma vez por checagem, de que tirar a checagem faz o teste falhar (X0.9) | Com Pinocchio, uma checagem esquecida é uma falha de segurança |
| T25 | `max_lamports` assinado na abertura; acima dele, `OpeningAboveMaxLamports` | O preço do SOL muda entre a prévia e a assinatura |

### Os valores que as fontes não dão (C43), todos **[AC]**

| Parâmetro | Faixa no código | Valor de devnet | Por quê |
|---|---|---|---|
| `fee_bps` | até 1.000 | 1.000 | `MAX_FEE_BPS`, das fontes |
| `creator_share_bps` | até 100 | 100 | `MAX_CREATOR_SHARE_BPS`, das fontes |
| `one_sided_fee_bps` | até 100 | 100 | O 1% de hoje vira teto: o admin só baixa |
| `opening_prize_bps` | 9.000 a 10.000 | 9.000 | A parte da Brot numa abertura nunca passa dos 10% do D-b |
| `opening_fee_usd` | 1 a 5.000 | 500 | O valor é do fundador (D-b); o `max_lamports` protege cada abertura |
| `min_entry_lamports` | 1.000.000 a 1.000.000.000 | 10.000.000 | O piso mantém todo reembolso acima do aluguel mínimo de uma carteira vazia (TP §3.4.5); o valor é o P-5 |
| `max_price_age` | 1 a 300 s | 120 s | Na devnet a conta de SOL/USD atualizava a cada 62 a 64 s; o plano pede pelo menos 90 |
| `max_price_conf_bps` | 1 a 100 | 50 | 0,5%, como nas campanhas de preço **[INF]** do plano |
| `campaign_max_age` | 30 a 300 s | 120 s | O piso de 30 s é a resposta do fundador ao Q4 |

### Escolhas do contrato

1. **Layouts lidos no lugar.** Cada conta, argumento e evento é um `#[repr(C)]` de alinhamento 1, feito só de
   bytes, `Address` e invólucros little-endian (`LeU64` e afins). Uma visão sobre os bytes é segura assim que o
   comprimento bate, e a mesma struct é o layout, o tamanho (verificado em tempo de compilação) e o IDL.
2. **Toda conta do programa começa com uma etiqueta e uma versão de layout.** Etiquetas 1 (`GlobalConfig`), 2
   (`Campaign`), 3 (`Entry`); o 0 nunca é escrito, então uma conta zerada falha. Versão 1.
3. **Erros a partir de 6000**, para nunca se confundirem com os erros do System Program que um CPI repassa. Os
   cinco códigos do leitor de preço da Sprint 01 ficaram iguais. Cada frente acrescenta só na sua faixa (A a partir
   de 6100, B de 6120, C de 6140, D de 6160, E de 6180, F de 6200).
4. **Discriminadores de instrução 0 a 9**, na ordem do enum do Shank, e o `0xFF` reservado ao evento.
5. **`template_version` é posto pelo programa (1), não é argumento** **[INF]**: o esboço zod do plano não traz esse
   campo, e um número escolhido pelo criador seria uma forma de texto livre.
6. **Um só campo numérico de alvo, `target` (i128).** A tabela da `Campaign` no plano cita `target` e `threshold`,
   mas o esboço zod tem só `target`; o i128 cabe o preço (i64), o fornecimento e o stake (u64) e a liquidez da DAMM
   (u128) **[INF]**.
7. **`min_return_bps` é u32**, porque um retorno pode passar de 6,5 vezes num pote desequilibrado.
8. **A conta de SOL/USD só é lida quando a abertura paga.** Numa abertura gratuita de chave da equipe ela não é
   conferida nem lida, e por isso um SOL/USD velho não impede a equipe de abrir.
9. **A leitura de trabalho de "a equipe acrescenta prêmio" (C44)**, construída como o plano diz: a chave da equipe
   passa `opening_usd`, paga como qualquer carteira (o mesmo piso de `opening_fee_usd` e o mesmo 90/10) e guarda
   `creator_share_bps = 0`. Se o fundador ler diferente, muda só o caminho da equipe em `user_open_campaign`.
10. **D6 na ordem pedida.** A cópia primeiro: a página em breve trocou "prediction markets", "bet", "pool" e USDC
    por campanha, entrar no YES ou NO, pote e SOL (commit `c82be03`). Depois os identificadores do código, com os
    nomes do D6, e os documentos, no mesmo PR. O aviso legal do rodapé e o deck do fundador em `/pitch` não
    mudaram.

### Quem faz o quê

| Frente | Arquivos que são seus |
|---|---|
| A, `checks` | `checks.rs`; os testes negativos com Mollusk; o filtro `checks refuse`; o script que prova X0.9 |
| B, admin | `instructions/admin/*`; `CreationParams::validate` em `state/config.rs`; os testes das instruções de admin e da pausa |
| C, matemática | `math/*`; os testes puros e de propriedade |
| D, abertura | `instructions/campaigns/open_campaign.rs`; `readers/mod.rs` e `readers/price_touch.rs` na parte de criação; os testes da abertura |
| E, entradas | `instructions/entries/join_campaign.rs`; `vault.rs`; os testes da entrada |
| F, ferramentas | `events.rs` (`emit` e o tratador do evento); o IDL do Shank; o ensaio do Codama; `bun run build:program`; o CI; a linha de build do `CLAUDE.md` |

O resto (`layout.rs`, `state/*`, `error.rs`, `constants.rs`, `entrypoint.rs`, `instructions/mod.rs`, os
argumentos e a ordem das contas de cada instrução, e o kit de teste em `tests/brot/`) é o contrato, congelado
nesta onda.

## Alternatives considered

- **Eventos por `sol_log_data` desde já.** Mais simples e sem as duas contas extras, mas o plano escolhe self-CPI
  sempre que ele volta no LiteSVM, e voltou; logs podem ser truncados.
- **Um programa `#![no_std]`.** Recusado porque o `shank` liga `std`. Alternativa estudada: o `shank` como
  dependência opcional, com o derive atrás de `cfg_attr`; o `shank-cli` lê o código procurando o derive literal, e o
  ganho seria só algumas centenas de bytes.
- **Atualizar o Rust para 1.97 e manter o Mollusk 0.16.** Recusado: o Rust 1.89 é restrição do projeto, a
  compilação do primeiro dia foi definida nele, e o CI e o `pred-provable` congelado usam o mesmo.
- **Layout por constantes de deslocamento e uma struct separada só para o IDL.** Duas fontes para o mesmo layout;
  uma divergência só apareceria num teste.
- **`opening_usd` opcional (`Option<u64>`).** Um opcional muda o tamanho do argumento; o 0 significa "a equipe não
  paga" e é recusado para quem não é da equipe.

## Consequences

- Toda instrução tem duas contas a mais no fim. Os clientes da Sprint 05 já nascem com elas.
- O programa leva o `std` no binário enquanto o Shank for dependência.
- Os testes de instrução só rodam depois do build SBF; as frentes escrevem os seus no escuro e eles rodam na
  integração (regra do fundador: nenhum `cargo build-sbf` nas frentes).

## Follow-up

- O fundador confirmar o D6 (que aprovar a proposta aprovou também a troca de nomes), a leitura do Q12 (Lucas e
  Ronaldo com chaves da equipe) e a leitura de trabalho do C44. O R4 (abertura mais barata nos primeiros meses) não
  foi construído.
- A prova no CI da compilação do primeiro dia: o primeiro run do PR. Feita: run 37849347333, no PR #30 (commit
  `21470da`), job Program, verde.
- Sprint 03: o crate `litesvm` 0.17 esbarra na Agave 4.3 como o Mollusk 0.16.

## Fontes

- `docs/sprints/sprint-02-pot-core.md`; `docs/technical/TECHNICAL-PLAN.md` v0.1.0; `docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md` §2.1, §2.4, §5.2, §5.3.
- crates.io: `pinocchio` 0.11.2, `pinocchio-system` 0.6.1, `shank` 0.4.9, `mollusk-svm` 0.12 a 0.16, `solana-program-runtime` 3.1.14 a 4.3.0, lidos em 8/10/2026.
- `litesvm` (npm) 1.5.0, `node_modules/.bun/litesvm@1.5.0+44ee86a28eb4b548/node_modules/litesvm/dist/internal.d.ts`.
- O crate `litesvm`, lido em 8/10/2026 com `cargo info`: a 0.16.0 e a 0.17.0 declaram, as duas, `rust-version`
  1.89.0. Um lockfile de prova com `litesvm = "=0.17.0"` resolve `solana-program-runtime` 4.3.0, que declara 1.97.1:
  o limite vem da dependência, não do crate.
- O shank-cli só lê erros de um enum com `thiserror::Error`: `shank_idl-0.4.9/src/file.rs:196-197` chama
  `extract_this_errors` (`shank_macro_impl-0.4.9/src/error/this_error.rs`).
- O `Rent` do Pinocchio 0.11 lê só o primeiro campo da variável de sistema, como lamports por byte:
  `pinocchio-0.11.2/src/sysvars/rent.rs` (`lamports_per_byte`, `from_bytes`; o padrão é 6.960).
