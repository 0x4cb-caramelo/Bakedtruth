# 2026-10-09 — Sprint 03, integração: oito frentes num binário só, a paridade, a saída do Anchor, as revisões e as quatro correções

## Context

Continuação de `2026-10-09-sprint-03-abertura-contrato-e-valores.md`. Com o contrato congelado (`7706db9`), as
frentes A a F escreveram leitores, resolução, trava de entrada e abertura em worktrees próprios, sem `cargo
build-sbf`; a frente S preparou o Surfpool; a frente G preparou a saída do Anchor na branch `s03-lane-g`; a frente R
foi medir a rede. Este registro cobre a integração das frentes, as medidas no binário integrado, a paridade com o
programa congelado, a saída do `pred-provable` e do Anchor, as quatro revisões da onda 3 e o que foi corrigido
depois delas. A sessão bateu no limite de uso duas vezes, uma com as revisões e a frente R no meio do caminho; os
dois trabalhos foram retomados dos seus registros salvos, sem medir nada de novo.

Nada aqui dependeu do fundador. O pull request contra a `main` fica aberto para ele mesclar.

## Decision

### 1. A ordem da integração e o que ela achou

As frentes entraram na branch da sprint na ordem E, F, D, S, C, A, B, sem conflito. Dois testes da Sprint 02 que
abrem campanha depois de mudar os parâmetros passaram a assinar a versão deles (`28d9598`); os dois pontos que a
frente A levantou foram corrigidos nos arquivos do integrador (`d08014f`: a distância mínima divide antes de
multiplicar, porque a primeira forma estourava o i128 acima de 1,7 × 10³⁴; um alvo em zero ou abaixo num tipo "pelo
menos" já está atingido, `TargetAlreadyTouched`), e o segundo foi levado aos tipos de época (`2cbadb5`). O primeiro
`bun run build:program` do programa integrado deu um binário de 93.216 bytes, e os 150 testes que as frentes
escreveram sem binário passaram na primeira rodada, junto com os da Sprint 02. A IDL não mudou entre o contrato e o
programa integrado: nenhuma frente alterou a interface.

Dois achados da integração, registrados no arquivo da sprint:

- os worktrees das frentes compartilhavam um `CARGO_TARGET_DIR`, e o cargo reaproveita a biblioteca `brot-markets`
  de outro worktree quando o hash da unidade coincide; a frente F achou, as frentes foram avisadas, e a integração
  ganhou um diretório de destino só dela, onde todo número do registro foi medido;
- a rodada X0.9 (`scripts/checks-mutation.mjs`) segura o único binário enquanto roda, o que bloqueou as outras
  conferências pela duração dela; fica para a Sprint 04 um diretório de destino por worktree desde o começo.

### 2. A paridade com o programa congelado, e a saída do Anchor

`tests/parity/` rodou 62 de 62 em `c1dafa9`, o último commit com os dois programas. Toda diferença entre o original
e o porte é uma das oito desejadas (`met_late`; `UnreadableAccount` depois do prazo; a distância de 1%; as marcas de
opção do SPL; as anulações `MissedWindow`; a conta de voto zerada; `StakeAtLeast` fechado), cada uma afirmada com a
fonte na suíte. As tabelas foram para `docs/sprints/sprint-03-parity.md`, e a suíte saiu com o original: dependia de
`tests/helpers.ts` e do cliente Anchor.

A frente G entrou em seguida (`b46a56d`, `fc906b0`): saem `programs/pred-provable`, `Anchor.toml`, a IDL e os tipos
em `target/`, `app/lib/idl`, `tests/pred-provable.test.ts`, `tests/helpers.ts` e `tests/parity/`; o `Cargo.lock`
perde 175 pacotes sem subir nenhum; o CI fica sem o passo do Anchor, com o build só do `brot-markets`, a
conferência de IDL desatualizada sobre `packages/sdk/src/idl` e o artefato do binário novo. O `CLAUDE.md` passou a
dizer o estado real (Sprint 02 mesclada no PR #35, sem tag; Sprint 03 em revisão).

### 3. As revisões da onda 3 e o que foi feito com cada achado

Quatro revisores leram o programa integrado em `c1dafa9`, num worktree congelado para isso: segurança, advogado do
diabo, um leitor independente só com o plano técnico, e produto. Nenhum achou como tirar SOL de um pote, da
tesouraria ou de uma entrada. Os achados, consolidados, estão na tabela "Reviews (Wave 3)" do arquivo da sprint.
Aqui, o porquê de cada decisão:

| Achado | Decisão | Por quê |
|---|---|---|
| F1, entrar no SIM depois do toque (alta; três revisores) | **Não codificado; vira a pergunta 8 ao fundador** | A trava de entrada lê a conta patrocinada, que atualiza a cada minuto; a prova do SIM aceita qualquer conta completa de até 60 s. Um baker que vê o toque numa atualização recém-postada entra no SIM e resolve na mesma transação. As três correções propostas (margem na trava; `last_entry_at`; devolver na Sprint 04 as entradas datadas depois do `publish_time` da prova) mudam quem ganha, e a regra do pedido é não construir regra de dinheiro sem resposta. Recomendação registrada: a margem agora e a devolução na Sprint 04. O indexador já consegue comparar a hora de cada entrada com o `publish_time` da prova |
| F2, o `StaleFeed` dependia do segundo em que alguém resolvia (média; três revisores) | **Corrigido**: limiar `max(max_age, STALE_FEED_MIN_SECONDS = 600)` [AC] | A devnet publica a cada 62 a 64 s; com `max_age` perto disso, a mesma campanha anulava ou gravava NÃO conforme o resolvedor chegasse num intervalo ou logo depois de uma atualização, e um baker do NÃO podia postar uma atualização depois do prazo para forçar o NÃO. Dez batimentos da devnet é um piso que nenhum intervalo normal alcança e que ainda anula um feed de fato parado. Decisão de teste, não de dinheiro: o D7 continua o mesmo |
| F3, expoente mudado no meio da campanha forçava NÃO (média; dois revisores) | **Corrigido**: depois da janela, expoente diferente do guardado anula (`UnreadableAccount`) | Toda prova do SIM da janela era recusada com `PriceExponentChanged`; o NÃO seria um veredito que ninguém pôde contestar. Só a governança da Pyth muda um expoente, então ninguém provoca a anulação |
| F4, preço zero ou negativo provava o SIM de "abaixo de" (baixa; os quatro) | **Corrigido**: recusado como prova nas duas direções, com o `PriceNonPositive` da abertura | Era a pergunta 7 ao fundador; os quatro revisores a leram como fato técnico (um preço negativo é um feed com problema, não um toque), e não como regra de dinheiro. Fechada |
| F5, `NotResolvableYet` nunca saía para o tipo preço (baixa; independente) | **Corrigido**: o endereço do programa na vaga da prova vale como "sem prova" | A instrução sempre passava uma prova ao leitor, então quem não tinha nada a oferecer recebia `ProofDoesNotTouch` da conta que preenchesse a vaga. Sem mudança de interface |
| F6 a F13 e os quatro itens de produto | **Registrados**, cada um com a sprint que o atende | Nenhum muda uma regra desta sprint: o 1% comprável no pool de stake é risco escrito (TP §3.4.10, Sprint 16); o `params_version` sobe só com os termos, de propósito; o evento sem `conf` deixa a faixa para o indexador; o freio de slot espera a medida da frente R |

As correções entraram em `17dcb1c`: três testes em Rust a mais (255) e um em TypeScript (a contagem era 259 nesse ponto; a medida ao fechar a sprint foi 262), a IDL igual, o binário
em 93.480 bytes. O X0.9 não foi repetido: nenhuma checagem de `checks.rs` ou `checks/top_level.rs` foi tocada.

### 4. Os valores "a confirmar" e a frente R

A frente R mediu as duas redes em 2026-10-09 pelos RPCs públicos (`scripts/devnet-clock-probe.ts`,
`scripts/push-oracle-probe.ts`, `scripts/pyth-sponsored-feeds.ts`). Os dois valores que a abertura deixou "a
confirmar" ficam confirmados [F]:

| Medida | Devnet | Rede principal | O que decide |
|---|---|---|---|
| Tempo de slot, amostras de um minuto | 720 minutos: 231,7 a 244,9 ms, mediana 239; nenhum minuto abaixo de 100 ms nem acima de 500 ms | 263 minutos: 259,7 a 281,7 ms, mediana 267,9; idem | **`MIN_SLOT_MS` = 100 confirmado**: o freio de slot é pelo menos 2,3 vezes mais folgado que qualquer minuto medido, então nunca recusa um preço bom; **`EPOCH_START_SLOW_SLOT_MS` = 500 confirmado**: nenhuma média chegou perto |
| Médias por época (a atual e as cinco anteriores) | 234,5 a 238,9 ms | 267,2 a 268,7 ms | O pior caso da regra do começo da época é quase o dobro do medido |
| SIMD-0525, `reduce_slot_time_to_*` | as quatro portas (350, 300, 250, 200 ms) ativas desde agosto | a de 200 ms ativa desde 2026-10-08 | O alvo é 200 ms nas duas redes; o freio de 100 ms guarda uma margem de duas vezes contra o próprio alvo |
| Alpenglow (SIMD-0326) | ativo desde o slot 504.144.000 (2026-09-25) | ausente | A devnet roda Alpenglow; a rede principal ainda não (C12, C23 do plano) |
| `unix_timestamp` do `Clock` contra o relógio de parede | −2,4 a +0,6 s, mediana −0,7 (299 leituras) | −2,0 a −0,9 s, mediana −1,0 (180) | Os 60 s da prova, da espera e do adiantamento máximo são 25 vezes a pior deriva vista |
| Contas patrocinadas, 12 minutos, 240 leituras cada | 14 atualizações por conta, 8 a 65 s entre elas, mediana 62 a 63; nenhuma regressão de `publish_time` ou `posted_slot` | 143 por conta, 5 a 6 s entre elas; nenhuma regressão | **"Só anda para a frente" observado [AC]**, com o limite dos 12 minutos; o batimento da devnet é de um minuto, o da rede principal de cinco segundos |
| Transações do push oracle | 1.000 recentes, 0 falhas; de 60 na conta SOL/USD, 40 escreveram, 19 não chamavam o oráculo, **1 foi pulada por não ser mais nova**, sem falhar | 5.000 recentes, 0 falhas | Uma atualização mais velha é pulada, não recusada: nenhuma transação bem-sucedida move a conta para trás |
| Quem escreve as contas patrocinadas | três pagadores na janela (45, 11 e 4 de 60) | um pagador (29 de 60), mais 30 leituras pelo Lighthouse `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95` | Qualquer um com uma atualização assinada pela Hermes empurra para a conta patrocinada; a pergunta 1 ao fundador é sobre quais feeds, não sobre quem escreve |

O batimento da devnet (62 a 65 s) é também o número por trás do piso do `StaleFeed`: 600 s é nove vezes o maior
intervalo visto. A varredura das contas de fatia 0 de feeds não patrocinados foi concluída (na rede principal: 183 contas, 120
fora da lista, 78 de um mesmo pagador, 102 paradas; `knowledge-base/tecnologia/pyth-feeds-patrocinados.md`). A
leitura das fontes do push oracle e do receptor num commit fixado não foi concluída na Sprint 03; a Sprint 04 a faz.

## Alternatives considered

- **Codificar a margem na trava de entrada (F1) agora.** Teria fechado o achado mais grave da revisão, mas a margem
  decide quem pode entrar e com que preço, e cada valor dela muda quem ganha. É a regra do pedido; ficou como
  pergunta 8, com recomendação.
- **Uma prova de vida como prova do NÃO (D7 alternativo).** Qualquer um postaria uma atualização fresca depois do
  prazo e o programa gravaria NÃO sobre ela, sem olhar a conta patrocinada. Resolve o F2 por outro caminho, mas
  muda o D7, que o fundador aprovou com a proposta 0.4. Registrado para ele.
- **`StaleFeed` em `max_age` puro, com `max_age` mínimo maior.** Empurraria o piso para a configuração, onde um
  erro do admin o derruba de volta a 30 s. A constante [AC] não depende de chave.
- **Anular por expoente com um motivo próprio.** Pediria um valor novo no enum `VoidReason` e na IDL por um caso que
  só a governança da Pyth produz. `UnreadableAccount` diz o que importa: a conta não serve para esta campanha.

## Consequences

- Uma campanha de preço na devnet com `max_age` de 30 a 120 s não anula mais por um batimento perdido.
- Um feed reescalado pela Pyth no meio da campanha anula, e as entradas voltam (Sprint 04).
- Um preço negativo assinado pela Pyth não prova nada.
- Quem resolve sem prova põe o endereço do programa na vaga, e o SDK (Sprint 05) faz isso por padrão.
- A pergunta 8 entra na lista do fundador antes do NÃO do tipo preço valer dinheiro de verdade.

## Follow-up

- O pull request da sprint contra a `main`, aberto sem mesclar; o número entra no arquivo da sprint, no `CLAUDE.md`,
  no `CHANGELOG.md` e no `docs/SPRINTS.md`.
- Sprint 04: a devolução das entradas datadas depois da prova, se o fundador escolher esse caminho para a pergunta
  8; a anulação à mão (`StaleFeed` depois de uma atualização; `MissedWindow`) e o teste aleatório de invariantes.
- Sprint 05: o SDK oferece "sem prova" por padrão e mostra as recusas da abertura antes da assinatura.

## Fontes

- `docs/sprints/sprint-03-readers-resolution.md`, seções "Record and retrospective" e "Reviews (Wave 3)".
- `docs/sprints/sprint-03-parity.md`.
- `programs/brot-markets/src/readers/price_touch/proof.rs` (a documentação do módulo tem a regra do `StaleFeed`).
- `knowledge-base/tecnologia/pyth-leitor-de-preco.md` e `pyth-feeds-patrocinados.md`.
- Os quatro pareceres da onda 3, recebidos em 2026-10-09 (não versionados; o resumo está na tabela da sprint).
