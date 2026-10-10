# 2026-10-09 (noite) — Sprint 05: as respostas do Ronaldo, o id novo, o deploy no devnet e o smoke que passou

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

## Depois: as confirmações na sessão, o id novo, o deploy e o smoke (22h30 a 23h30)

Perguntado na sessão, o Ronaldo confirmou com as próprias palavras: mesclar o #41; um id novo para o programa, porque o
keypair do `6G2d…uVN` não estava aqui; chaves novas geradas nesta máquina; e ele mesmo poria SOL de teste pelo faucet.
Depois: "funded, merge 44 and 45", e "Yes, you run it" para o deploy.

1. **As mesclas na `main`, todas com mescla comum e o CI verde antes:** PR #41, a Sprint 04 (`2066c61`); PR #44, o
   `CampaignFinalized` nos caminhos da equipe (`0dd362a`); PR #45, o id novo (`c20e79a`). O PR #43, da Sprint 05,
   passou a apontar para a `main`, e a branch recebeu a `main`: o SDK ganhou a autoridade de eventos nova e o smoke
   passou a esperar os dois eventos da confirmação da equipe. 400 testes TypeScript, os testes Rust, o lint, o
   typecheck e os quatro ensaios locais (deploy, equipe, smoke, seed) passaram com o id novo.
2. **As chaves, em `~/.config/solana/` desta máquina, fora de qualquer repositório, permissão 600:**
   `brot-markets-program-devnet.json` (o id `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o`),
   `brot-devnet-upgrade-ronaldo.json` (`6N7rUnJ88yyBiZmGEn3DjyyX9AEtmwzXNGUsps2A4wcq`: chave de upgrade, admin e
   recebedor das taxas no devnet) e `brot-devnet-team-ronaldo.json` (`3EgrFsDDBks8zG31rquNvtP1BR91BVArypwtiBg6XwMz`, a
   chave de time dele). Geradas sem frase-semente na tela; o backup dos três arquivos é do Ronaldo.
3. **O artefato:** execução 38014319993 do CI na `main` em `c20e79a`, `brot_markets.so` com sha256
   `cf2359377323449bac0f67f6464f5e21dcb7ac85a9ffe07bfa52ec185b46a3a8`. O build local da mesma fonte deu o mesmo hash.
4. **O deploy, em três tentativas.** As duas primeiras, pelo RPC público, morreram escrevendo o buffer ("Max retries
   exceeded"; depois 20 minutos sem terminar, com 429 nas leituras); cada buffer foi fechado e os 0,81 SOL voltaram à
   chave de upgrade. Entre elas, o deploy ganhou 50 rodadas de reassinatura e uma taxa de prioridade pequena
   (`scripts/deploy/checks.ts`, com teste e o ensaio local). A terceira passou por um RPC da Helius, com a chave do
   Ronaldo lida de um arquivo dele na hora de cada comando, nunca impressa nem gravada no repositório, e filtrada de
   toda saída. Assinaturas:
   - deploy do programa: `2RrgGS8RDNd3PcGgRjx4d4ipwTJH4F1BSxBydSYpAEYqHrRaJVjWigpMYhFfHpkf8wZjJGJmtWebY3wdQ2aWj4g3`
   - `admin_initialize_config`: `5h8XmnzvUCLNr85oF7UBoNf1fxGUsS2omt3gJncWD1M3AYwUBKhAiwGf2Pic1dK15vFrnkhfWr1D9aDprKHhfWsq`
   - `admin_set_team`: `dVuqmiuZ2qbeapNxmDUsqX6VmWJdVKKYmKPxDegTe3291cDj7Fi5F2AaYLJFn3T4Sh6t9ddMTUgmBViHVuQcSzn`

   O script leu de volta: loader v3, a autoridade de upgrade `6N7r…`, os bytes iguais ao artefato; a config com o admin
   `6N7r…`; o time com a chave `3Egr…`.
5. **O smoke no devnet passou** (`bun run smoke:devnet -- --cluster devnet`, código 0), com cada valor igual ao do SDK:
   - abertura paga, US$ 500 a 109,60858649 SOL/USD, 4,561686416 SOL:
     `5QReYZ2pYcjhmCNuxMo593CkZawTFk75BMNAozACbZkn3hYEJTLWEnvRkiJMeXtkxUFMQZUcSJYBmPLJtRD1grPD`
   - a abertura repetida, recusada (`AlreadyInitialized`):
     `2AbmMideJgKwD9aNoRsSgKAzEnKLRePaMfsKgehHBj7JwA2EBsVxLhAatdVvNqaUgHWpJEAWcSDMYG7FBcJxkjGy`
   - as entradas, SIM 0,05 e NÃO 0,03 SOL:
     `2jq7SP4pWefmTmcjxMbChis2LAac99owJ1NzyTyD6RQSyBEZo9rsN3L1BSVccgs6wzC5YqKwoCpxvk4nDZRSi66y`,
     `3deimJ7JjdraVM6ABi7SShT2XfvHQEYdZnoA5ZfrqQ23xyYsPMJ1sTSaS49PdMEPshw78mvMjUiFdVSMT2UBVKFs`
   - a entrada repetida, recusada (`EntryTotalMismatch`):
     `2U96iXj6YcFqfyk21D4zyVSzyrqmMmmohnz4MezCiW3Z4Ti4opg3SiHqruuZmXiyjjkAGpVydPHjyq6JdbV8tKA8`
   - a resolução (SIM pela queima):
     `4ayGsUNYWkih6qf1ZsbdxU6mtZeoEd1wWUQFNxdrjroCEtuoK1aB5mjZo51qAFd76j7wdWuVwpcFjYkvSkwGjqfj`
   - as apurações: `41ntJdr3QFenVxX48LMjy641ggY8gW2Gjd5kLEEyiTHydgA2WJMgQvRQu8Wd9365734n1gRXy2X3djhixeKBypmR`,
     `3RZEHghNjmtC5MFYRBVKJe2hg2Ppi7HBUKq2mhVt1skCF2die1hEqq19SZeEGoJYqJeKFBQ5SSCGKf8Pn35aqY3j`
   - a confirmação da equipe (`ResultConfirmed`, depois `CampaignFinalized`):
     `npGMuvUcmALSfaHVCpoQ6Y7oez8xhxG7r1BrzzcGSMzu9QXX2weRhFCFb7RAC56W2V78UPiCmC3V2kmozmNeXTP`
   - as liquidações das duas entradas: `2mMTuaUqHG4kHLesgRbLS9A4SZ8YEJEHPU82vVoTXR1uQUaQqZzJn4UY3NV4EMTeP2N6JVnte4P6d6Xk7C4rYgmD`,
     `4FmrQtUEgYb9Tk89JLbRjo3QngSVJUNAE1xxkziWtvP7CG7HRztwsoVjf6bQDVzvbuKF4gNPEovCW27CNjUbvGjU`
   - a parte do criador: `43wMhFxqSmVAfKo6HfkxpfKjhHSzsYpbD9ZcgZuweFat3nmjihKUJfvKmrgC6tiEZpa2b4miEpi7nbfeAXju21iF`
   - a taxa: `NnS343zAMLwoSazcpoTdQJjdsVroDR7yDY776ftM6XLjQnJhSrXatgvQeGAwpmn8UDKQ8cJ8vNpKcAxJo4xAaWS`
   - o prêmio (nada a mover num pote dividido): `3FhEqaFpRHhXgbazerUHd6z9jMoCtxbtTLvtQkYgH1vUZ25zMJL68Swzbwt17kUNnG2Y7KS5LzEQKWNYma3XsyTR`
   - o fechamento: `kxX2xpACcQJtP5L88KxpwdwSMiP9jE9WS25G2mN2boHub8kNjfieGbXNUwtQf1QC7QfwEVqoUGpHMynpVmKYe9A`
   - a varredura das taxas: `2cVHwKyKVHg637UFKnksWAWnGuBsz2t86oad3yzjAwXavEUpE2a3LToB6RiLiZdP4ruBVJTBpitw7mqAFsfEqGZX`

   As unidades de computação de cada uma estão na nota do cluster, seção 5.7.

## Erros meus nesta sessão

- Mandei os endereços a financiar no meio de uma tabela e de frases; o Ronaldo não os achou e precisou pedir três
  vezes. Endereço a copiar vai sozinho, um por linha.
- Um `pkill` com o padrão escrito por extenso casou com a própria linha de comando e derrubou o shell que o rodava (os
  avisos "exit 144"); os processos do deploy foram parados depois pelo número.
- Estimei o smoke em 4,7 SOL, como dizia o registro anterior; o script completa o criador até 6 SOL, e quem paga
  precisa de cerca de 6,3 SOL na primeira rodada.

## Fontes

O prompt colado na sessão; `docs/sprints/sprint-05-sdk-devnet-cycle.md`; `deploy/devnet/README.md`;
`docs/sprints/sprint-04-settlement-invariants.md` ("Closure status"); `session-log/2026-10-09-sprint-05-sdk-e-ciclo-devnet.md`;
GitHub, PRs #41, #42 e #43 e a execução 38011917575; o RPC público do devnet (seção 5 da nota).
