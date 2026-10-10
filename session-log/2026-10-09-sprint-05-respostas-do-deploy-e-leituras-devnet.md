# 2026-10-09 (noite) — Sprint 05: as respostas do Ronaldo sobre o deploy, as leituras no devnet e a mescla do #41

## Ponto de partida

- A sessão começou com um prompt de passagem colado pelo Ronaldo: o contexto da Sprint 05, escrito pela sessão
  anterior, e as respostas dele às decisões do deploy, redigidas em inglês por outro assistente a partir do que ele
  disse ("Eu juntei o contexto do sistema com as suas autorizações").
- Conferido antes de agir: o PR #41 (Sprint 04) aberto, com o CI verde em `3f1ddcb`, mas atrás da `main`, que recebeu
  o PR #42 (a frase da capa do deck) às 19h21; o conflito era só no `CODEMAP.md`. O PR #43 (Sprint 05) é rascunho,
  empilhado sobre o #41.

## As respostas, como chegaram

1. **Caminho do deploy:** "proceed to merge PR #41 into `main` so we can use its CI artifact for the deploy".
2. **Chave de upgrade:** "I (Ronaldo) will hold the upgrade key." Fecha o resto da Q12.
3. **Keypair do programa:** "Keep the current program ID for Devnet, assuming your read-only dry run confirms the
   ProgramData address is clean. (We will use a completely fresh, private ID for Mainnet later)."
4. **Chaves:** "Use the already prepared public keys for the admin, fee-recipient, and team (Lucas, Ronaldo,
   Bernardo)." Nenhum arquivo do repositório tem essas chaves (procurado em `deploy/`, `docs/`, `session-log/`); a
   sessão anterior as listava como pendentes. Ficam como pergunta.
5. **`main` protegida:** "Acknowledged. We treat `main` as protected." Lido como compromisso de processo: nenhuma
   configuração do GitHub foi mudada.
6. **Leituras no devnet:** "explicit go-ahead to execute all read-only devnet checks (dry run, SOL/USD price age, rents,
   clock drift)".
7. **Valores:** "Use `real` values for Devnet, not drill."
8. Fora do caminho do deploy: o `chmod +x` do gancho de pre-commit, e o `CampaignFinalized` num PR pequeno à parte
   contra a branch da Sprint 04.

As respostas ficam aqui e no arquivo da sprint. Não entraram em `docs/business/ideacao-perguntas-e-respostas.md`, que
guarda decisões de produto; estas são de operação do deploy.

## O que foi feito

1. **As leituras no devnet**, só leitura, das 22h00 às 22h06: o id do programa, o ProgramData dele e a config estão
   livres; os aluguéis batem com a Sprint 02 (5.080 lamports por byte); a conta SOL/USD atualizou a cada 61 a 63
   segundos e chegou a 64 segundos de idade, contra os 120 do `max_price_age`; o relógio do devnet ficou dentro de cerca
   de um segundo da hora de parede. Números e método em `knowledge-base/tecnologia/devnet-o-que-so-o-cluster-mostra.md`,
   seção 5. O ensaio a seco do script de deploy não rodou: ele exige o artefato do CI na `main` depois do #41 e o
   keypair do programa, e nenhum dos dois existe ainda.
2. **O PR #41 ficou pronto para mesclar:** a `main` foi mesclada na branch (`dadd513`), o `CODEMAP.md` regenerado, os
   36 testes do site passaram, e o CI ficou verde nos três trabalhos (execução 38011917575). **A mescla não foi
   feita:** a checagem de segurança desta sessão a recusou ("merge without review"), porque o pedido chegou como texto
   colado, e não nas palavras do Ronaldo. Nada foi feito para contorná-la.
3. **O gancho de pre-commit** passou de 100644 para 100755 (commit na branch da Sprint 05). Ele roda
   `scripts/pre-commit.js`: a varredura de segredos nos arquivos em stage; o lint do Biome só se o Biome estiver
   instalado, e não está.
4. **O `CampaignFinalized` nos caminhos da equipe:** numa branch própria, `fix/campaign-finalized-team-paths`, saída de
   `dadd513`, para um PR contra a branch da Sprint 04, como o Ronaldo pediu (o #41 ainda não foi mesclado).

## Decisões tomadas sem o fundador

- **Mescla comum, não squash**, quando o #41 for mesclado: assim o PR #43 continua mostrando só os próprios commits.
- **O ensaio a seco não foi forçado** por outro caminho (`--resume` ou um keypair qualquer): ele existe para conferir o
  keypair do id declarado e o artefato do commit revisado.
- **A data dos registros é 9/10/2026**, a de Brasília na hora da sessão (22h), embora o UTC já fosse dia 10.

## O que trava o deploy e o smoke

1. **A mescla do #41**, confirmada pelo Ronaldo nas palavras dele, ou feita por ele.
2. **O keypair do programa `6G2d…uVN`.** Não está nesta máquina; o id foi declarado no commit `ae8b837` do Lucas, de
   5/10, então o keypair provavelmente nasceu na máquina dele. Sem ele, o id precisa mudar.
3. **O arquivo da chave de upgrade do Ronaldo**, e as chaves públicas do admin, do recebedor das taxas e do time.
4. **SOL de teste:** cerca de 1,62 SOL para o deploy (0,80 do buffer volta no fim) e cerca de 4,7 para o smoke; a
   carteira padrão do smoke tem 1,93.
5. **Fora do deploy, mas da mescla:** a redação da regra de viabilidade da Sprint 04, que o registro da sprint deixou
   "aberta para o fundador antes da mescla", não veio nas respostas. Até a resposta, vale o que está no código.

## Fontes

O prompt colado na sessão; `docs/sprints/sprint-05-sdk-devnet-cycle.md`; `deploy/devnet/README.md`;
`docs/sprints/sprint-04-settlement-invariants.md` ("Closure status"); `session-log/2026-10-09-sprint-05-sdk-e-ciclo-devnet.md`;
GitHub, PRs #41, #42 e #43 e a execução 38011917575; o RPC público do devnet (seção 5 da nota).
