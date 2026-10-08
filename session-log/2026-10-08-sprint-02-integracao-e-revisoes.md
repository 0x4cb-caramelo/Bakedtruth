# 2026-10-08 — Sprint 02, integração: as seis frentes, as provas e as revisões

## Context

A abertura da sprint está em `2026-10-08-sprint-02-abertura-t-items-e-contrato.md`: os T-items, a compilação do
primeiro dia e o contrato congelado no commit `10fb4aa`. Seis agentes trabalharam em paralelo, um por frente, cada um
no seu `git worktree` e sem compilar para SBF (regra do fundador). Este registro guarda o que veio depois: a
integração em série, as decisões que cada frente tomou onde as fontes não decidem, as medidas, a prova X0.9 e as
revisões da onda 3.

## Decision

### A integração

1. **Ordem A, C, B, D, E, F, como pedido.** Um conflito só: as frentes C e D criaram `tests/common/mod.rs` com
   conteúdos diferentes. O gerador pseudoaleatório da matemática ficou em `tests/common/`; as contas no formato do
   runtime, da abertura, foram para `tests/opening_support/`.
2. **Uma correção no contrato, achada pela frente E** (`ec96505`): `Campaign::load_mut` lia o id gravado, e com isso
   o tamanho da conta, antes de conferir o dono. A regra de `checks.rs` é não ler byte nenhum de conta que o programa
   não possui. Agora: slot gravável, dono, e só então o id.
3. **O codemap pula pastas `generated`**, como já pulava `dist`, `build` e `vendor`. O cliente do Codama
   (`packages/sdk/src/idl/generated`, 38 arquivos) é reescrito por `bun run idl` e traz o cabeçalho da ferramenta.
4. **O script da prova X0.9 lê o relatório JUnit do bun** (`a9e0820`). Fora de um terminal, o bun não escreve o nome
   dos testes que passam; o script da frente A parava antes de começar, como devia (saída 2: "não rodou" no build sem
   mutação).
5. **Tudo passou na primeira rodada integrada.** Os 126 testes LiteSVM do programa novo, escritos sem o binário,
   passaram de primeira; nenhum teste foi ajustado na integração. `bun run test:rust`: 156 (145 do programa novo);
   `bun run test`: 293.

### O que as medidas mostraram

- **Aluguel:** a variável de sistema Rent da devnet e da rede principal guarda 5.080 lamports por byte com limiar
  1,0, lida em 8/10/2026 às 20:05 UTC. O Pinocchio 0.11 lê só o primeiro campo como lamports por byte, então o
  aluguel que o programa calcula é o da rede [F]. Era o risco 4 da frente A, fechado. O LiteSVM 1.5.0 e o Mollusk
  usam 6.960 por byte; os testes leem o aluguel do próprio cluster de teste.
- **Tamanhos:** `GlobalConfig` 400 bytes (2.682.240 lamports na devnet), `Campaign` 512 (3.251.200), `Entry` 100
  (1.158.240), cofres sem dados (650.240). Uma abertura custa ao criador 3.901.440 lamports de aluguel, cerca de
  0,0039 SOL; o plano estimava 0,0035.
- **Computação, no LiteSVM:** abertura paga 23.043 CU, gratuita 16.019; primeira entrada 6.943 (cria a `Entry`),
  segunda 4.276; inicialização 13.603; cada instrução de admin cerca de 1.600 a 1.700. Um evento custa 70 CU no
  quadro do evento mais 946 que o runtime cobra por CPI.
- **Binário:** 67.384 bytes, e uma recompilação local dá o mesmo SHA-256.

### A prova X0.9

Quinze mutantes, um por recusa de `checks.rs`; cada um derruba os seus testes (Mollusk e LiteSVM), e o script sai
com 0. A tabela está no arquivo da sprint. O que ela ensina: sem `signer`, `tag`, `pda` ou `upgrade_authority`, a
chamada forjada passa (são a única defesa); sem `owned_by`, `writable`, `system_program` ou as contas de evento, o
runtime ainda recusa, mas com um erro que não diz o que faltou e depois de o programa já ter feito trabalho.

**C42, respondido:** sem `distinct`, a mesma conta nos dois slots de `admin_initialize_config` cai no `PdaMismatch` da
segunda PDA. Nem o Pinocchio nem o runtime recusam uma conta em dois slots; a PDA é a linha seguinte, e a partir da
Sprint 04, com pagamentos, `distinct` passa a ser a única.

### As decisões das frentes onde as fontes não decidem

| Frente | Decisão | Por quê |
|---|---|---|
| A | `derive_address` do solana-address 2.8.0, sem a checagem da curva | O `try_derive_address` só existe no 2.9.0; o bump guardado nasceu na PDA canônica, fora da curva |
| A | Dono de outro programa na criação: `WrongOwner`; dono System com dados: `AlreadyInitialized` | Nenhum dos dois estados existe numa PDA nossa; não valia um código novo |
| A | `distinct` compara endereços, não ponteiros | Endereço igual é a mesma conta no runtime |
| B | Uma equipe vazia é válida | É o caso-limite de tirar uma chave vazada; consequência: ninguém pausa até o admin nomear uma chave |
| B | O destino das taxas pode ser qualquer chave não nula | A Sprint 04 faz `sweep_fees` recusar o próprio cofre de taxas |
| B | `max_open_campaigns` pode ficar abaixo do número de abertas | Só impede aberturas novas |
| C | Expoente do preço de −18 a 0 [AC] | Acima de 0, um passo do preço vale ao menos US$ 10 por SOL; abaixo de −18, um i64 não expressa US$ 1 por SOL |
| C | Durações em i128 | Um prazo muito no passado é `DurationTooShort`, nunca estouro |
| C | As funções do `Split` recusam um lado vazio, taxa acima de P e `from_pot` acima de P − taxa + R | Nenhum pote `Split` chega a esses estados; a recusa protege a I11 dentro da função |
| C | A estimativa de pote unilateral cobra o arredondamento só sobre a entrada nova | Nunca promete mais do que o acerto pagaria sobre a `Entry` inteira |
| C | Achado: o `arithmetic_side_effects` do clippy não olha o corpo de funções `#[test]` | As regras de conversão olham; os testes desta sprint usam aritmética conferida assim mesmo |
| D | Um preço publicado à frente do relógio conta como fresco | A Pyth assina o horário; um teto transformaria a deriva do relógio em recusa de preço bom |
| D | A confiança exatamente no limite passa; igualdade no alvo conta como tocado | Os sinais do plano são ≥ e ≤ |
| D | Os erros do próprio leitor (dono, formato) valem também para o SOL/USD | O plano diz "lê"; códigos próprios para o SOL/USD seriam quatro códigos novos, decisão da Sprint 03 |
| D | Sem verificação da I14 dentro do programa | É da Sprint 04 (`math/invariant.rs`); os testes conferem a I14 ao lamport |
| E | Depósito de zero não chama o System Program | Uma abertura gratuita não move nada (I14); toda entrada é recusada abaixo do mínimo antes |
| E | A pausa falha fechada | Qualquer nível diferente de `Normal` recusa a entrada |
| E | A `Entry` nova é criada antes da estimativa | Diverge da ordem literal de `checks.rs` ("regras, depois efeitos"), mas a transação é atômica |
| E | O cofre só pela PDA, sem `owned_by` | A entrada só credita o cofre, e o endereço está preso pela campanha e pelo bump guardado |
| F | `thiserror` 2.0.21, para os erros entrarem no IDL | O shank-cli só lê erros de um enum com esse derive; o código de `Display` nunca roda na rede |
| F | O Codama funciona sobre o IDL do Shank | O `@codama/nodes-from-anchor` lê o formato v00 com origem `shank`; não há eventos nem sementes de PDA no IDL |
| F | O cliente gerado é versionado, mas o SDK não o exporta | Assim o `tsc` o confere e o CI o compara com a geração; a adoção é da Sprint 05 |

## Alternatives considered

- **A ferramenta Workflow para as seis frentes.** Ela limita os agentes simultâneos a CPUs − 2, dois nesta máquina:
  as seis frentes rodariam em três rodadas. A ferramenta Agent, com um `worktree` por agente, rodou as seis juntas.
- **Deixar cada frente compilar para SBF.** Os testes LiteSVM teriam rodado antes, mas a regra do fundador era
  outra, e o contrato com o kit de teste bastou: nada falhou na integração.
- **Corrigir o script da prova pedindo um terminal falso ao bun** (`script -q`). O relatório JUnit é o formato que o
  bun documenta para máquinas.

## Consequences

- O programa novo tem as dez instruções da sprint, cada recusa com o seu código, e a prova de que cada checagem tem
  um teste que cai sem ela.
- Os `worktrees` das frentes ficam em `.claude/worktrees/` até a sprint fechar; enquanto existirem, o
  `os-self-test` e um teste do `test:os` acusam arquivos de lá.

## Follow-up

- O que passa para as Sprints 03 a 05 está no arquivo da sprint, seção "Carried to Sprints 03 to 05".
- As revisões da onda 3 entram abaixo.

## Revisões da onda 3

Preenchido depois das revisões.
