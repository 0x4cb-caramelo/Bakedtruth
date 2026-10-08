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
5. **Tudo passou na primeira rodada integrada.** Os 126 testes TypeScript do programa novo (quase todos rodam o
   binário no LiteSVM), escritos sem o binário, passaram de primeira; nenhum teste foi ajustado na integração.
   `bun run test:rust`: 156 (145 do programa novo); `bun run test`: 293. Depois das correções da onda 3: 157 (146),
   298 e 130.
6. **As faixas de códigos de erro por frente não foram usadas.** A escolha 3 do contrato reservava 6100 a 6200 por
   frente; o `error.rs` ficou contínuo de 6000 a 6070, e um código novo entra no fim, a partir de 6071.

### O que as medidas mostraram

- **Aluguel:** a variável de sistema Rent da devnet e da rede principal guarda 5.080 lamports por byte com limiar
  1,0, lida em 8/10/2026 às 20:05 UTC. O Pinocchio 0.11 lê só o primeiro campo como lamports por byte, então o
  aluguel que o programa calcula é o da rede [F]. Era o risco 4 da frente A, fechado. O LiteSVM 1.5.0 e o Mollusk
  usam 6.960 por byte; os testes leem o aluguel do próprio cluster de teste.
- **Tamanhos:** `GlobalConfig` 400 bytes (2.682.240 lamports na devnet), `Campaign` 512 (3.251.200), `Entry` 100
  (1.158.240), cofres sem dados (650.240). Uma abertura custa ao criador 3.901.440 lamports de aluguel, cerca de
  0,0039 SOL; o plano estimava 0,0035.
- **Computação, no LiteSVM:** abertura paga 23.043 CU, gratuita 16.019; primeira entrada 6.943 (cria a `Entry`),
  segunda 4.276; inicialização 13.603; cada instrução de admin de 1.573 a 1.724. Um evento custa 70 CU no quadro do
  evento mais 946 que o runtime cobra por CPI. Depois da onda 3 os números de abertura e da primeira entrada viraram
  faixas (paga 20.084 a 23.043, primeira entrada 6.959 a 9.959): achar a PDA canônica custa cerca de 1.500 CU por
  bump tentado, e o bump muda com o id da campanha e a chave do baker, que mudam de uma rodada para outra.
- **Binário:** 67.384 bytes, e uma recompilação local dá o mesmo SHA-256. Depois da onda 3, 67.984 bytes.

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
| D | Um preço publicado à frente do relógio conta como fresco | A Pyth assina o horário; um teto transformaria a deriva do relógio em recusa de preço bom. **Revisto na onda 3:** até 60 s à frente; além disso, velho |
| D | A confiança exatamente no limite passa; igualdade no alvo conta como tocado | Os sinais do plano são ≥ e ≤ |
| D | Os erros do próprio leitor (dono, formato) valem também para o SOL/USD | O plano diz "lê"; códigos próprios para o SOL/USD seriam quatro códigos novos, decisão da Sprint 03 |
| D | Sem verificação da I14 dentro do programa | É da Sprint 04 (`math/invariant.rs`); os testes conferem a I14 ao lamport |
| E | Depósito de zero não chama o System Program | Uma abertura gratuita não move nada (I14); toda entrada é recusada abaixo do mínimo antes |
| E | A pausa falha fechada | Qualquer nível diferente de `Normal` recusa a entrada |
| E | A `Entry` nova é criada antes da estimativa | Diverge da ordem literal de `checks.rs` ("regras, depois efeitos"), mas a transação é atômica |
| E | O cofre só pela PDA, sem `owned_by` | A entrada só credita o cofre, e o endereço está preso pela campanha e pelo bump guardado. **Revisto na onda 3:** a entrada confere também o dono |
| B, E | A entrada mínima é lida da configuração a cada entrada, e não copiada na abertura | O plano diz as duas coisas (§3.4.1: a campanha guarda o que copiou; §3.4.3: a entrada lê "pausa e mínimo"); a escolha vai ao fundador |
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
- Os `worktrees` das frentes ficaram em `.claude/worktrees/` até a integração; enquanto existiam, o `os-self-test` e
  um teste do `test:os` acusavam arquivos de lá. Foram removidos, com as sete branches locais das frentes, antes das
  conferências padrão.

## Follow-up

- O que passa para as Sprints 03 a 05 está no arquivo da sprint, seção "Carried to Sprints 03 to 05".
- As revisões da onda 3 entram abaixo.

## Revisões da onda 3

### Multi-AI Review — o módulo `checks` e o preço da abertura

**Data:** 2026-10-08 · **Artefato:** a branch `sprint-02-pot-core` em `f1a9bc0` (o coordenador leu `f5982e7`) ·
**Raio de impacto:** financeiro (o programa vai guardar SOL de outras pessoas; o Pinocchio não confere nada sozinho)
· **Revisores:** `technical-security-red-team-agent`; advogado do diabo (Sonnet); modelo independente (Fable),
corretude e exploração; e o `coordinator-agent` no fechamento. Todos só leram; nenhum arquivo foi escrito por eles.

**O que cada um disse, nas quatro perguntas da skill:**

- **Segurança (7/10; 8 para a implementação, 6 para o desenho).** Maior preocupação: o tipo preço aceita qualquer
  feed da Pyth, e o plano promete "preço de um ativo grande", fora do alcance de quem abre. Falha mais provável:
  aberturas pagas recusadas com `SolUsdStale` quando a conta patrocinada atrasa (falha fechada, nada se move).
  Alternativa: uma lista compilada de feeds aceitos, só de acréscimo.
- **Advogado do diabo (7/10; aritmética 9, código 8, prova de completude 6, política de oráculo 5).** Maior
  preocupação: a mesma do feed, e logo atrás a completude: o X0.9 provava as 15 funções, não as cerca de 70
  chamadas. Falha mais provável: disponibilidade, e na Sprint 04 um pagamento que esqueça `distinct` ou o dono do
  cofre passaria por tudo que hoje está verde. Alternativa: uma matriz de slots gerada da lista de contas do Shank.
- **Modelo independente (8/10).** Maior preocupação: a abertura cobra ao preço médio, e quem abre posta a atualização
  que o programa lê, então pode escolher a mais alta dos últimos segundos (até ~1% no teto de 300 s). Falha mais
  provável: recusa, não perda. Alternativa: cobrar em `p − conf`.

**Reconciliação.** Concordaram: o feed livre; o cofre só pelo endereço na entrada; o horário à frente sem limite; o
preço que protege quem abre mas não a Brot; a chave da equipe vazada enchendo a válvula; a prova por função e não
por chamada, com duas assinaturas como única defesa nos caminhos pré-pagos. Discordaram: a gravidade do feed, e se o
D-i (sem lista de contas aceitas) cobre também os feeds. Isso fica com o fundador. **Confiança líquida (a mínima):
7.** Nenhum revisor abaixo de 7 e nenhuma falha explorável: **seguir**, com as correções abaixo.

**O que entrou no código nesta PR** (só onde nenhuma regra de dinheiro muda):

1. Um preço publicado mais de 60 s à frente do relógio da rede é recusado como velho
   (`MAX_PRICE_CLOCK_LEAD_SECONDS`, [AC]; as medidas da Sprint 01 viram 1 a 2 s). Testes em +60 s e +61 s.
2. A entrada confere o dono do cofre, além do endereço. Teste com o cofre de outro dono.
3. `state::init` recusa uma conta que já tenha etiqueta ou versão (`AlreadyInitialized`). Teste no host.
4. Testes novos: a inicialização e a abertura gratuita da equipe sem assinatura, com as contas pagas de antemão
   (`MissingSignature`, nenhuma conta criada); a abertura paga de uma campanha sobre o próprio SOL/USD.
5. O cabeçalho de `checks.rs` nomeia a exceção da ordem (a entrada cria a `Entry` antes da estimativa).
6. A prova por chamada: 21 mutantes, um de cada vez (cada `checks::signer`, cada papel, o `EntryMismatch`, o dono
   do cofre, a guarda do `init`, o limite de horário), todos derrubaram o seu teste. O script do X0.9 rodou de novo
   e deu a mesma tabela.

**O que não entrou, e por quê.** Quatro achados mudam regra de dinheiro ou desfazem decisão registrada, então vão ao
fundador antes da Sprint 03: a lista de feeds; a cota das aberturas gratuitas da equipe (ou anular campanha aberta
sem entradas); cobrar em `p − conf`; o feed do SOL/USD como constante. Os demais foram escritos nos arquivos das
Sprints 03, 04 e 05; a tabela completa, achado por achado, está em `docs/sprints/sprint-02-pot-core.md`, "Reviews".

**O fechamento do coordenador:** 16 itens, todos de texto, feitos; as linhas velhas do plano técnico ficaram listadas
no arquivo da sprint ("TP to align"), porque o plano viaja no PR #27, que o fundador ainda não revisou. O portão de
privacidade: o commit `c82be03` mudou o rótulo do formulário, não a frase de consentimento, então a versão do
consentimento fica.

**Skills:** `multi-ai-review` (este registro) e `secrets-scan` (nenhum `.env` versionado, os três `.env.example` só
com marcadores, `ci-secret-scan` limpo na branch).
