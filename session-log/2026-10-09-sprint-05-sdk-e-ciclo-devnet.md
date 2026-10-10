# 2026-10-09 — Sprint 05: o SDK, a conferência React Native e o ciclo devnet preparado

## Ponto de partida

- A Sprint 05 depende da 04, e o PR #41 (Sprint 04) está aberto, com as três verificações do CI verdes, mas não
  mesclado. A branch `sprint-05-sdk-devnet-cycle` foi aberta sobre a cabeça do #41 (`3f1ddcb`), e não sobre a `main`:
  sem a 04 não há liquidação nem os 12.000 vetores que o SDK precisa repetir. Quando o #41 entrar na `main` por merge
  comum, o PR da 05 mostra só os próprios commits; se entrar por squash, a branch da 05 precisa de rebase.
- O trabalho foi feito num worktree próprio (`../brot-s05`), com a pasta `target/` copiada do worktree da 04 sem os
  keypairs. Nenhum keypair local tem o endereço declarado do programa (`6G2d…uVN`): o backup dele é ação do fundador.
- Linha de base, antes de qualquer mudança: os 307 testes TypeScript passavam.

## Decisões tomadas sem o fundador (as mais conservadoras; todas revisáveis)

1. **O nome do pacote: `@brot/sdk`.** É o nome da proposta e do plano técnico (A-3, A-6, §3.2, §3.5). O pacote é
   privado, então o escopo npm não pesa, e mudar um `package.json` é menor do que reescrever os documentos. A raiz do
   repositório liga o pacote como dependência de workspace, e testes e scripts importam `@brot/sdk/read` e
   `@brot/sdk/tx` pelo mapa `exports`, como o site e o app vão importar.
2. **T9: o cliente Codama, gerado do IDL do Shank, é a camada de codecs e construtores do SDK.** O IDL do Shank não traz
   o discriminador de cada evento nem as sementes das PDAs; esses ficam escritos à mão e são conferidos por testes
   contra o código-fonte do programa (`tests/sdk/contract-*.test.ts`) e contra o kit de testes. As mensagens de erro
   vêm do IDL, e não do módulo de erros do Codama, que lê `process.env` (global do Node) e apaga as mensagens em build
   de produção. A alternativa, codecs escritos à mão, ficou só no kit de testes, como oráculo independente.
3. **Kit 8.4.0.** Os 27 subpacotes estão publicados em 8.4.0 (28/9/2026). Instalação congelada limpa, typecheck e os
   307 testes passaram nela. O aviso do `CLAUDE.md` sobre a 8.4.0 deixa de valer.
4. **zod 4.6.5 e dependency-cruiser 18.4.0**, fixados exatos, os dois com mais de duas semanas de publicados. O
   dependency-cruiser pede Node 22 ou mais novo; roda sob o Bun (`bunx --bun`), que o CI já instala.
5. **A regra de portabilidade tem três partes.** O dependency-cruiser cuida das importações (nada de Node, React,
   Next, React Native, web3.js v1, Anchor, nem do módulo de erros do Codama; `read` nunca importa `tx`; `read` e `tx`
   nunca importam `schemas` nem zod; indexador e relay só `read`). O `tsconfig` do SDK só conhece ES2022, o que barra
   `window` e `document`. E um verificador com o compilador (`scripts/sdk-portability.ts`) barra `Buffer`, `process`,
   `fetch`, `TextEncoder` e `setTimeout`, porque os tipos do Kit trazem o `@types/node` e o `tsconfig` sozinho deixa
   esses passarem. `tests/sdk/boundaries.test.ts` planta uma violação de cada uma das nove regras numa cópia do SDK e
   exige que todas disparem.
6. **As margens das prévias [AC].** O `max_lamports` de uma abertura sai 1% acima da cobrança no momento da prévia
   (arredondado para cima); o `min_return_bps` de uma entrada sai 1% abaixo da estimativa. Os dois protegem quem assina
   e o cliente pode mudar a margem; a da entrada vai de 0 a 20% e nada mais (uma margem de 100% tirava a proteção sem
   aviso).
7. **O esquema zod da abertura (Apêndice B)** exige `deadlineAt` também para os dois tipos de época, como o programa
   exige (a linha 5 vale para todo tipo desde a Sprint 03); o esboço do Apêndice B não tinha.
8. **Um segundo arquivo de vetores.** `tests/vectors/snapshot-vectors.csv` (12.000 linhas, de
   `programs/brot-markets/tests/math_vectors_snapshot.rs`) cobre o que os vetores da 04 não cobriam: o snapshot de
   finalize, com cerca de um sexto das linhas no limiar da regra de viabilidade (uma em três das linhas de SIM e de
   NÃO), o pagamento por entrada, a estimativa da entrada e o calendário. Só código de teste mudou no lado Rust; o
   programa não mudou.
9. **A ferramenta da conferência React Native [AC].** Metro 0.87.1 com o preset do React Native 0.87.1; o `hermesc`
   que essa versão traz (Hermes 1.0.0, bytecode 98); e, para executar, a VM do Hermes v0.13.0, a versão mais nova com
   VM publicada (se apresenta como 0.12.0), fixada por SHA-256. Uma VM 1.0.0 construída aqui, da etiqueta certa, rodou
   o bytecode compilado com o mesmo resultado; essa rodada é manual (cerca de 53 minutos de construção). O `npm ci`
   roda com `--ignore-scripts`: nenhum pacote do lockfile tem script de instalação.
10. **O cluster local é o Surfpool 1.5.0 `--offline`, isolado da rede**, e não o `solana-test-validator`, que não roda
    nesta máquina (falta AVX2). A primeira escolha era o `solana-test-validator`, para não usar o Surfpool, que faz fork
    da mainnet e portanto lê um cluster vivo; no modo offline, dentro de um namespace de rede só com loopback, ele não
    lê cluster nenhum, e a instrução da sessão (não tocar cluster até o fundador escolher o caminho do deploy) fica
    cumprida pelo kernel.
11. **A linha de coautoria dos commits diz "Claude Opus 5.5"**, o modelo que de fato escreveu esta sprint, e não o
    "Claude Haiku 5.5" que o prompt trazia.
12. **O teto da taxa de prioridade que o resumo aceita como confiável: 0,001 SOL [AC]**, mudável por quem chama. Acima
    disso, o resumo diz "não assine". O limite de unidades vale 1.400.000 quando a transação não fixa um, o maior que o
    runtime aceita, para a conta nunca ficar abaixo do real.
13. **O resumo só confia em mensagens legacy e v0 sem tabela de endereços**, as que o SDK constrói; uma mensagem v1 (o
    Kit 8.4 já monta) leva as configurações de custo na própria mensagem, e o resumo a recusa em vez de lê-la pela
    metade.

## O que ficou provado, e como

- **A matemática:** os 24.000 vetores do Rust (os dois arquivos) passam pelo SDK sem nenhuma diferença, no Bun e no
  Hermes. Mutações de controle, feitas à mão (nenhum script as guarda): arredondar a taxa para baixo dá 6.954
  diferenças; trocar `>` por `>=` na regra de viabilidade dá 133.
- **As regras de abertura:** 37 códigos de recusa diferentes de `user_open_campaign`, cada caso dos testes do próprio
  programa que os construtores do SDK conseguem produzir enviado aos dois lados, com o mesmo erro, e a mesma cobrança
  gravada quando os dois aceitam. A revisão de coordenação achou cinco casos que faltavam; entraram, e concordam.
  Mutação de controle: tirar o limite distante do alvo de preço derruba o teste.
- **As regras de entrada:** cada recusa de `user_join_campaign` que o SDK consegue produzir, nos dois lados, com o
  mesmo erro; com o retorno mínimo igual à estimativa do SDK a entrada passa, e com um ponto-base a mais é recusada, ou
  seja, a estimativa do SDK é a do programa até o ponto-base.
- **O decodificador:** em transações reais do LiteSVM, no formato do `getTransaction`: um evento forjado por outro
  programa é recusado pelo próprio programa (6016); uma transação que falhou é pulada, embora traga o evento; um evento
  dentro de uma chamada aninhada e outro com a autoridade numa tabela de endereços são lidos; duplicatas somem. E no
  formato do `simulateTransaction`, com endereços em vez de índices: as mesmas regras, os mesmos eventos.
- **O kit de testes usa o SDK:** toda transação dos testes tem os eventos decodificados pelo SDK; os 7 eventos que o kit
  descreve à mão têm os campos conferidos, e os outros 11, da Sprint 04, o discriminador e o tamanho contra o código do
  programa. Os fluxos comuns (config, time, abertura, entrada) são montados pelos construtores do SDK.

## O deploy, os scripts e o cluster local

- **O procedimento do deploy está escrito e ensaiado, não executado** (`deploy/devnet/README.md`,
  `scripts/deploy/`): o artefato do CI baixado pelo id da execução, amarrado ao commit revisado e conferido pelo
  `SHA256SUMS`; o keypair do programa só do backup e só se for o id declarado; só o loader v3, nunca `program-v4` nem
  `--final`; a inicialização e o time na mesma sessão. O ensaio (`bun run deploy:rehearse`) usa o binário compilado
  aqui, empacotado como o artefato do CI, e faz um `solana program deploy` de verdade, em endereços descartáveis, no
  cluster local isolado; o mesmo binário em outro endereço falha na inicialização (`PrivilegeEscalation`, ou
  `ProgramFailedToComplete` em algumas rodadas), que é o motivo da regra do id declarado. O download do artefato foi
  testado à parte, só leitura no GitHub, na execução `37998756475` da `main` (o binário da Sprint 03; nunca para
  publicar).
- **O `solana-test-validator` 3.1.10 não roda nesta máquina** (falta AVX2 no processador). Os ensaios usam o Surfpool
  1.5.0 `--offline` dentro de um namespace de rede só com loopback (`unshare -rn`): nada sai da máquina, garantido
  pelo kernel. Ressalva: o Surfpool roda sobre o LiteSVM, e não sobre o validador Agave, então a linha "num validador
  de verdade" fica atendida na letra e não no motivo, e ficou desmarcada; a rodada no runtime do Agave vai para a
  Sprint 06 (`knowledge-base/tecnologia/devnet-o-que-so-o-cluster-mostra.md`).
- **Conferido por mim, de novo, depois do assistente:** o smoke (ciclo completo, todo valor igual ao do SDK, as duas
  tentativas repetidas recusadas), o ensaio da equipe, o ensaio do deploy, o seed e a rodada negativa (373 casos da
  matriz, 50 recusas de regra, abertura paga igual à cotação), todos com código 0.
- **`smoke:devnet` e `seed:devnet` foram reescritos em SOL sobre o SDK**; nenhum script nem teste importa mais o
  `app/lib`. Eles rodam no cluster local por padrão e só tocam o devnet com `-- --cluster devnet`.

## As três revisões, e o que mudou por causa delas

Três revisões, só leitura, cada achado com arquivo e linha: segurança do SDK (dinheiro e resumo), coordenação do
registro da sprint, e segurança do procedimento de deploy e inicialização (o escopo que a sprint pede).

- **Segurança do SDK:** 1 alta, 5 médias, 11 baixas, 6 informativas. A alta: o resumo dava "confiável" a qualquer
  instrução de orçamento de computação, então uma taxa de prioridade de 1.400 SOL passava ao lado de uma entrada de 0,1
  SOL; agora a taxa é lida, somada e tem teto. Médias corrigidas: a simulação não via evento nenhum num nó de verdade
  (o nó devolve endereços, o decodificador lia índices, e o simulador falso do teste devolvia o formato errado); uma
  entrada repetida depois de um envio que demorou somava uma segunda entrada; o resumo não era dos bytes assinados.
  Em parte: o resumo agora diz a campanha, o alvo na unidade do feed, quem cria, os termos e o preço do SOL abaixo do
  qual a abertura é recusada. Ficam abertas: a checagem do slot do último deploy no SDK (A-8, planejada para o site na
  Sprint 11), uma segunda fonte de preço para a cotação, e leituras num mesmo instante.
- **Coordenação:** aprovada com ressalvas. Corrigido: duas linhas desmarcadas (validador real e seed, ambos só locais);
  frases que diziam mais do que o teste mostrava ("todo evento conferido", "um terço das linhas", "toda regra
  provada"); o motivo errado de esperar a fusão da Sprint 05 para o deploy (o programa não mudou nela); o registro desta
  sessão (a decisão 10 e o ensaio); o plano técnico; o `CLAUDE.md`; as pendências passadas às Sprints 06 e 08.
- **Segurança do deploy:** 4 médias, 7 baixas, 2 informativas, nenhuma alta; as travas principais seguram. Corrigido:
  a execução do CI amarrada ao commit revisado e o hash do binário digitado de novo no `--execute`; o admin provado pela
  chave ou digitado; os endereços do programa, do ProgramData e da config conferidos antes de qualquer envio; uma
  retomada que não repete o que já foi feito; chaves só fora de qualquer repositório Git e com permissão 600; nada de
  conteúdo de arquivo de chave nas mensagens; o registro de anulação só vale depois da confirmação.

Erro meu, achado pelos testes: ao corrigir a simulação, passei a nomear o erro do programa só quando o índice da
instrução que falhou era um número, e o Kit entrega todo inteiro como bigint; o teste do calendário de treino pegou.

## Achados que ficam abertos

- **O programa não emite `CampaignFinalized` depois da confirmação nem da anulação pela equipe.** O plano técnico
  (§3.4.3, §3.4.14) diz que `team_confirm_result` e `team_void_campaign` emitem o próprio evento e depois
  `CampaignFinalized`; o código da Sprint 04 roda o snapshot mas emite só `ResultConfirmed` ou `CampaignVoided`
  (conferido em `instructions/resolution/team_confirm_result.rs` e `team_void_campaign.rs`). Um indexador que siga só
  os eventos perderia o snapshot dessas campanhas. Não mexi: é código de dinheiro da Sprint 04, fora do escopo da 05.
  A correção é do programa (um segundo `emit`), vai para a Sprint 08 e muda os eventos que o smoke espera.
- **Qualquer pessoa pode impedir para sempre o deploy de um id de programa num cluster.** Ensaiado no cluster local:
  lamports enviados ao endereço do ProgramData de um id ainda não publicado fazem o `solana program deploy` falhar
  ("Create Account ... already in use"), e nenhuma chave consegue tirá-los de lá. O id `6G2d…uVN` é público, então
  cerca de 0,001 SOL bastaria, no devnet hoje e na mainnet depois. O ensaio a seco do deploy aponta o caso; o remédio é
  um id novo. Para a mainnet: um id novo, mantido em segredo até o deploy.
- **O loader v3 continua sendo o caminho.** A revisão do deploy lembrou, de memória, de uma trava que desligaria novos
  deploys no loader v3. Li o conjunto de travas do Agave (`anza-xyz/agave`, `feature-set/src/lib.rs`, branch `master`,
  9/10/2026): a trava que liga o loader v4 está declarada como `LoaderV4WasAbandoned11111111111111111111111`, e não há
  trava contra deploy no v3.
- **A `main` andou depois da branch da Sprint 04:** o commit `ac6b086` (PR #42, uma correção do pitch). O PR da 05
  vai precisar de uma mescla da `main` quando o #41 entrar.

## Revisão de privacidade do registro de anulação (as nove perguntas de `.claude/rules/privacy-audit.md`)

1. **Que dado pessoal:** a chave pública do membro da equipe que anulou, e a hora (do relógio da máquina). O texto não
   pode trazer email, `@usuário` nem URL; o script recusa.
2. **Por quê:** responsabilidade. Quem anulou uma campanha precisa ser identificável; a mesma chave já assina a anulação
   na rede, onde qualquer um a lê.
3. **Onde:** `content/void-log/`, no Git, e o SHA-256 do arquivo na conta da campanha e no evento `CampaignVoided`.
4. **Quem acessa:** qualquer pessoa: o registro é público por desenho (BR-45).
5. **Controle de acesso:** só a equipe escreve (o script exige uma chave do time na config); ninguém altera depois
   (o hash está na rede).
6. **Retenção:** permanente. O Git guarda todas as versões e o hash não se apaga; por isso nada entra que possa
   precisar ser apagado.
7. **Logs:** o script imprime o registro inteiro antes de gravar e o caminho do arquivo; nada além disso.
8. **Pedido de exclusão ou exportação:** a chave pública não se apaga da rede; o texto não identifica pessoa, então não
   há o que exportar além do que já é público. Quem passar a ser membro da equipe aceita que a sua chave apareça nos
   registros (a mapear em `content/powers.md`, Sprint 13).
9. **Documentação ou consentimento:** o README do `content/void-log/` diz o que o cabeçalho traz e por quê; a ligação
   entre chave e pessoa aparece só quando `content/powers.md` for publicado, com o acordo dos três.

## Para o fundador

O que só o fundador decide (nada disso foi feito sem ele):

1. **O caminho do deploy.** O preparado é o da sprint: o artefato do CI, baixado pelo id da execução da `main`,
   amarrado ao commit que vocês revisarem. Pode ser feito depois da fusão do #41, sem esperar a da 05.
2. **Quem segura a chave de upgrade no dia** (Lucas ou Ronaldo; resto da pergunta Q12).
3. **O keypair do programa:** o backup fora de `target/deploy/` (não está nesta máquina) e se o id fica. Ninguém sabe
   por onde esse keypair andou desde a Sprint 00, e qualquer pessoa pode bloquear o id financiando o endereço do
   ProgramData; trocar o id agora é barato, e na mainnet o id deve ser novo e secreto até o deploy.
4. **Valores de treino ou reais no devnet público.** Recomendação: os reais para esta sprint, que são o artefato padrão
   do CI; o smoke fecha o ciclo assim. A Sprint 06 pede os de treino para o X1.1: decidir junto com ela.
5. **As chaves públicas do devnet:** admin, recebedor das taxas e as chaves do time (Lucas, Ronaldo, Bernardo).
6. **Proteger a `main`** antes do dia do deploy (PR com revisão, verificações obrigatórias, sem push direto): o deploy
   confia na execução do CI na `main`.
7. **As pendências da Sprint 04 depois de 12/10/2026** (cobertura aleatória dos caminhos de confirmação e anulação do
   time, a tautologia em `bookkeeping.rs`, linhas menores da definição de pronto): continuam adiadas ou entram numa
   correção da 04?
8. **As fusões:** o PR #41 (Sprint 04) e depois o da Sprint 05.

## Fontes

`docs/sprints/sprint-05-sdk-devnet-cycle.md`; `docs/technical/TECHNICAL-PLAN.md` §1, §3.1, §3.2, §3.4.14, §3.4.16,
§3.4.18, §3.4.19, §10, Apêndice B; `docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md` §2.3, §3.2;
`knowledge-base/tecnologia/sdk-react-native.md`; `deploy/devnet/README.md`; `anza-xyz/agave`,
`feature-set/src/lib.rs` (lido em 9/10/2026).
