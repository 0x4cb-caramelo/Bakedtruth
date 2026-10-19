# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

A Sprint 02, o núcleo do pote em Pinocchio, foi mesclada na `main` pelo PR #35 em 8/10/2026 (o PR #30 trazia a branch
`sprint-02-pot-core`) e ganhou a tag `sprint-02` em 9/10/2026. A Sprint 03, os leitores e a resolução, foi mesclada
na `main` pelo PR #40 em 9/10/2026, com a tag `sprint-03` (`docs/sprints/sprint-03-readers-resolution.md`). Quem
mesclou os PRs #37 e #40 foi o Ronaldo, com a liberdade que o Lucas lhe deu; ele também respondeu as perguntas ao
fundador das Sprints 02 a 04 (`session-log/2026-10-09-respostas-do-fundador-e-mescla-da-sprint-03.md`). Na noite de
9/10/2026 entraram na `main`, a pedido do Ronaldo: a Sprint 04 pelo PR #41 (tag `sprint-04`), o `CampaignFinalized`
nos caminhos da equipe pelo PR #44 e o id novo do programa pelo PR #45; já em 10/10, a Sprint 05 pelo PR #43 (tag
`sprint-05`). O programa roda no devnet desde a noite de 9/10.

A Sprint 06, o servidor e o keeper principal, foi aberta em 10/10/2026 a partir da `origin/main` (`6b5e3ec`), na branch
`sprint-06-keeper-server`. Nada de código entrou ainda: a primeira tarefa é a checagem do Bun 1.4.2 no servidor.

Em 10/10/2026 a Sprint 12 entrou na `main` pelo PR #61 (tag `sprint-12`, `107fec2`), e a Sprint 13 foi aberta a partir
dessa tag, na branch `sprint-13-site-notices-copy`. Na mesma noite a Sprint 13 entrou na `main` pelo PR #63 (tag
`sprint-13`, `2dc5cb1`, depois do CI verde na `main`), e o fundador respondeu as doze perguntas dela, todas como
recomendado (1a a 12a).

### Added

- **A fornada de planos: planejamento e estudos de mercado para as próximas fases** (17 a 19/10/2026, a pedido do
  Lucas; `session-log/2026-10-19-fornada-de-planos.md`). Só documentação: nada mudou no programa, no site ou no
  servidor.
  - **Os resumos dos planos** em `docs/business/planejamento-2026-10/`: a remuneração de criadores, BDs e Levain na
    versão 4 (USDC, tiers, faixas do BD, 15 tipos de pergunta, campanhas da casa, Crumbs, Fornada, API com Semeadores,
    Turbo e a projeção de seis meses), o programa de lançamento de 17/11 e a captação (a /welcome com o mascote e a
    máquina de e-mails em código aberto). Os documentos vivos são do Claude e privados; os termos da rodada, as listas
    de contatos e os detalhes do envio ficam fora do repositório.
  - **Seis estudos com fontes** na base de conhecimento: o mercado de previsão por categoria e o pedaço que o Brot
    alcança, comparáveis de valuation e de token, whitepapers de referência e os quatro pães, o custo do NFT do
    Laser Breadfier, USDC e swap na Solana, e as ferramentas da máquina de captação.
  - **O mascote passa a se chamar Cacetinho** (decisão do Lucas), com a proposta de personalidade em
    `docs/product/cacetinho-personalidade.txt`. O site, o guia da marca e o deck ainda usam Baked, até a palavra dele.
  - **O README** ganhou "What we are planning next".

- **Os logos do X e do Discord no ar** (PR #103, publicados em 19/10/2026 a pedido do Ronaldo;
  `session-log/2026-10-19-logos-x-discord-no-ar.md`). No `brot.markets` e no `/2/`, os dois logos no topo e o Discord
  ao lado do X no rodapé: só os três arquivos do PR instalados na cópia do landing, com backup, e o `brot-landing`
  reiniciado. No `/dev0x`, a release `bf2a5ce3282a`, testada antes na porta 4239; a de volta é a `1f8427f98d5c`, que
  estava no ar desde 16/10 sem registro e agora está em `deploy/vps/README.md`. Na mesma visita ao servidor, o
  indexador foi achado fora do ar desde o reinício do servidor em 17/10: as dependências dele dividiam arquivos com as
  releases do site, e o `chown` de cada release do site tirava a leitura dele. Com a palavra do Ronaldo, elas foram
  instaladas de novo como cópias próprias, e as cinco rotas voltaram às 03h41 UTC.

- **O app Android no repositório, e o README em dia** (16/10/2026, para a inscrição no bounty da Superteam Brasil, que
  pede um repositório público que compile a partir de um clone limpo). `android/` é o projeto que o CLI da Solana
  Mobile gerou (`solana-mobile webshell` 0.6.0) em volta de `brot.markets/dev0x`, sem mudança no Kotlin nem no Gradle;
  só o caminho da chave de assinatura no `twa-manifest.json` virou um nome de arquivo local, e a chave fica fora do Git.
  O `gradle-wrapper.jar` também fica fora: o verificador de segredos do CI recusa arquivos compactados, e o jar gerado
  pelo CLI não é o do Gradle 9.7.1 (o SHA-256 dele não bate com o publicado); o README manda gerá-lo com o Gradle.
  O `android/README.md` diz como instalar o APK publicado, como compilar a versão de teste e como assinar a de
  lançamento. O README da raiz passa a dizer o estado de 16/10 (o keeper, a API, o indexador e o site no ar na devnet;
  o app Android em andamento) e como rodar o site, a API e o app.

- **O polimento da página inicial do site** (15/10/2026). A barra do topo mostra o pão do brot.markets
  (`app/public/img/brot-loaf.webp`, o mesmo arquivo da landing, no tamanho e no espaçamento dela) no lugar do Baked.
  O bloco "How it works" ganhou um X amarelo no canto, que o esconde de vez neste navegador: a escolha fica no
  `localStorage` (`brot-home-how`), e um script no `<head>` marca o `<html>` antes da primeira pintura, como o tema,
  para que quem já fechou não veja o bloco piscar (`app/features/home/how-closed.ts`,
  `tests/site/home-how-closed.test.ts`). O custo da abertura virou um cartão discreto de letra miúda, que agora diz
  para que é a cobrança ("Opening a campaign costs US$500 in SOL"); ele aparecia em 15 px e negrito porque a regra do
  subtítulo também pegava as linhas dele. O título e o subtítulo já eram os pedidos. Na página da campanha, a regra
  em uma linha mostra o prazo como uma contagem regressiva ("… within 4d 07h 13m 06s. Otherwise NO."), contada a
  partir do relógio da rede como o relógio da revisão (o gancho saiu de `state-panel.tsx` para `use-countdown.ts`). A
  data exata fica no passar do mouse, em "Full rules" e na prova; depois do prazo, a linha volta a dizer a data
  (`app/features/campaign-page/rule-line.tsx`, `tests/site/campaign-head.test.ts`). A janela "Check before you sign"
  da entrada ganhou o desenho do mockup do fundador ("Confirm entry — before / after", 1a): o lado como selo, o que
  se paga contra o que volta se o lado ganhar, o efeito de uma entrada grande numa barra, o custo e os campos do
  programa dobrados com os valores exatos e crus, os avisos numa lista e as regras dobradas, e o valor no botão com o
  que a carteira deve mostrar (`app/features/entry/review-*.tsx`, `tests/site/entry-review.test.ts`). Os avisos
  obrigatórios seguem palavra por palavra; o L-03 aparece nas suas duas frases, que juntas são o texto aprovado.

- **"Sign" funciona no primeiro clique** (15/10/2026). No devnet saem cerca de 4,45 blocos por segundo (medido), então
  os 150 blocos de vida de uma transação duram uns 34 s, e o "Sign" exigia 60 de sobra: quem lia a janela por mais de
  uns 20 s via o clique preparar a transação de novo, a janela fechar e voltar com "Prepared again", e só o segundo
  clique abria a carteira. Agora a transação vencida é preparada de novo sem fechar a janela e, quando só o blockhash
  mudou (o resumo dos bytes, o total, a estimativa e o pote iguais), o mesmo clique segue para a carteira; termos
  novos ainda voltam para a revisão, com o aviso junto ao botão. Um segundo clique durante a checagem não faz nada, e
  o botão diz "Preparing for your wallet…" (`app/features/entry/fresh-join.ts`, `tests/site/fresh-join.test.ts`).
  Reproduzido no navegador com uma carteira de teste que só recusa: antes, 0 pedidos à carteira; depois, 1.

- **A fotografia do pote conferida contra os livros (S-8)** (15/10/2026; `session-log/2026-10-15-s8-fotografia-do-pote.md`).
  Os sócios escolheram corrigir antes do congelamento. Quando uma campanha é decidida, os totais do snapshot de um
  `Split` precisam bater com os potes da campanha menos as entradas tardias (6102). Cada pagamento de devolução e de
  pote de um lado só é conferido contra os valores da própria entrada (6181, 6182), e a checagem por entrada do `Split`
  calcula a parte antecipada por conta própria. O keeper avisa (`settle_invariant`) também nessas recusas. Nenhum valor
  de pagamento mudou.

- **As notas da Sprint -1 na `main`, e os dois últimos PRs de fora resolvidos** (14/10/2026). As quatro notas de
  sessão da Sprint -1 que só estavam no rascunho #36 (`session-log/2026-10-08-sprint-menos-1-abertura-design.md`,
  `2026-10-09-sprint-menos-1-porte-e-aprovacoes.md`, `2026-10-09-sprint-menos-1-primitivos-e-registro.md`,
  `2026-10-09-sprint-menos-1-fechamento.md`) foram copiadas como estavam, com as suas linhas no índice. O rascunho,
  obsoleto como código, fecha com este PR. O #96, do Dependabot (`actions/upload-artifact` 7.0.2 e
  `actions/download-artifact` 8.0.2, fixadas por hash), entrou na `main` como `83d58f3` com o CI verde. Este é o último
  PR, a pedido do Ronaldo ("no maximo mais uma PR, mergeie depois e nao faca mais nenhuma pr"); ficam em aberto só as
  decisões com os sócios.

- **A última rodada no ar e as tags de cinco sprints** (14/10/2026; `session-log/2026-10-14-indexador-no-ar-e-segunda-atualizacao.md`).
  Com as palavras do Ronaldo, o #95 entrou na `main` (`6bd0f68`), e o binário do CI dela (`c002c5c3…`) foi para o devnet
  no slot 510.894.454, sem extensão e com o hash conferido na rede. O site (`6bd0f68171d2`) e o keeper (`6bd0f68`, com o
  alerta `settle_invariant`) foram publicados nesse commit, cada um ensaiado antes na porta 4239. As tags `sprint-06` e
  `sprint-07` (`88a00f9`), `sprint-08` (`8af10e2`), `sprint-14` e `sprint-15` (`98b6ece`) foram postas, cada uma com a
  lista do que ficou aberto. Este é o único PR destes registros, a pedido do Ronaldo.

- **As últimas mudanças antes do congelamento** (14/10/2026). Num `Split`, o pagamento de cada entrada é conferido
  contra a parte dela no snapshot guardado (`EntryPayoutAboveShare`, 6180). O keeper avisa (`settle_invariant`) quando
  uma liquidação é recusada por uma dessas checagens de segurança. O teste da pausa fixa a contagem de cada arquivo que
  nomeia o campo. Os arquivos de unidade leem as credenciais pelo caminho completo, porque o systemd 249 do servidor
  ignora o `%d`. Uma terceira revisão adversária não achou pagamento legítimo que esbarre na checagem nova; o achado
  baixo que ela deixou (as entradas do próprio snapshot) fica no escopo da auditoria, para os sócios decidirem junto
  com o congelamento.
- **O indexador no ar, e a segunda atualização do dia no devnet** (14/10/2026;
  `session-log/2026-10-14-indexador-no-ar-e-segunda-atualizacao.md`). Com as palavras do Ronaldo ("pode instalar o
  indexador", "pode mergear a 94", "e todo o resto atualizar ci etc publicar site"):
  - **O #94 entrou na `main`** (`2e7a28c`).
  - **O programa do devnet.** Recebeu o binário do CI dela (`9c5e9ffb…`, o mesmo do build local), sem extensão, no
    slot 510.880.658, com o hash conferido na rede.
  - **O site e o keeper.** Foram publicados nesse commit, cada um ensaiado antes na porta 4239.
  - **O indexador.** Roda no servidor desde as 05h22 UTC, com usuário próprio e a RPC pública do devnet, e as rotas
    dele (atividade, ranking, entradas por carteira) respondem em público pelo `brot-api`. A primeira partida falhou:
    o systemd 249 do servidor não entende o `%d` nas linhas `Environment=`. Um complemento da unidade resolveu no
    servidor, e os quatro arquivos de unidade do repositório passam a usar o caminho completo das credenciais.

- **O programa do devnet atualizado e o site publicado** (14/10/2026;
  `session-log/2026-10-14-devnet-atualizado-e-site-publicado.md`). Com a palavra do Ronaldo, o #93 entrou na `main`
  (`a5e6014`) e o binário do CI dela (`86ecf1c8…`, o mesmo do build local) foi implantado no devnet: a conta do
  programa foi estendida em 40.960 bytes (0,208 SOL) e a implantação caiu no slot 510.863.588, com o hash conferido na
  rede. O site (release `a5e6014e42f3`) foi compilado para esse slot, testado na porta 4239 e posto no ar; a API diz
  `ok`, com as entradas abertas. As Sprints 14 e 15 e o endurecimento da 16 rodam no devnet desde então.
- **Os achados da revisão do endurecimento, no programa** (14/10/2026, faixa P2). Cada instrução que paga confere
  primeiro um teto a partir do snapshot (`PaidOutAboveSnapshot`, 6179), para pegar um valor errado e não só um
  movimento fora dos livros. O fechamento devolve o aluguel como `min(aluguel, cofre − devido)`, para que um aumento do
  aluguel mínimo nunca o trave. Mover o corte grava também o preço da prova anterior. O teste da pausa ganhou a abertura
  grátis e uma checagem estática das duas portas. O keeper conta as entradas de um SIM de preço assim que o corte fica
  final.
- **A leitura segura de transações** (14/10/2026; a revisão adversária do endurecimento, F1 e F2). Todo leitor de
  transações do programa usa a mesma constante de versão do SDK; o devnet já serve transações v1, e uma real virou
  fixture. Uma transação ilegível é contada e pulada: nunca para o indexador, o histórico da API nem os scripts da
  equipe. Onde pular poderia pagar duas vezes (a varredura dos pagamentos da indicação), o leitor para e nomeia a
  assinatura. A busca do evento de resolução diz "incompleta" em vez de devolver um evento antigo e confere o publish
  time da campanha. O relay aceita as versões 0 e 1.
- **O pacote de auditoria em dia com as Sprints 14 e 15** (14/10/2026; `docs/audit/`). O escopo ganhou as seções da
  indicação, da disputa em duas etapas e da entrada selada, com as citações em `8af10e2`; o modelo de ameaças, três
  classes novas de ataque; e o mapa das checagens, os ids novos. As linhas dos arquivos que o endurecimento reescreveu
  são atualizadas no congelamento.

- **Sprint 16, o endurecimento do programa antes do congelamento** (14/10/2026, faixa L16P, branch
  `sprint-16-prefreeze`; `session-log/2026-10-14-sprint-16-endurecimento-antes-do-congelamento.md`). Corrige o que o
  pacote de auditoria listou antes de congelar a versão das firmas. **O-3:** a contagem de um SIM de preço espera a
  prova passar do prazo da janela (`CutoffNotFinal`, 6178), para que uma contagem parcial não deixe o corte das
  entradas tardias móvel. Era um defeito de dinheiro da Sprint 04, reproduzido pelo teste aleatório e agora preso num
  teste. **G-2:** cada instrução que paga confere a variação do cofre contra os livros, e o fechamento confere que o
  cofre cobre o que eles guardam. **G-16:** as recusas da contagem e os slots de Join. **G-10:** a pausa com as 27
  instruções. **G-1:** a prova de mutação cobre `checks/close.rs`, `checks/paying.rs` e as checagens novas. **SDK:** a
  busca do evento de resolução lê toda versão de transação. Nenhum valor de pagamento mudou e nenhum layout mudou.
- **O keeper novo no servidor, com a segunda RPC, e as mesclas da noite** (14/10/2026;
  `session-log/2026-10-14-keeper-novo-e-segunda-rpc.md`). Com as palavras do Ronaldo ("mergeie 92 e 91, adicione o
  novo keeper e segunda RPC"), os PRs #92 (a Sprint 14 com a 15 e o keeper, `98b6ece`) e #91 (as rotas do indexador
  pela API, `8af10e2`) entraram na `main`, cada um com o CI verde no commit da ponta. O keeper da release `8af10e2`
  roda no servidor desde as 00h46 UTC, depois de um ensaio sem envio na porta 4239. Ele liquida as taxas seladas antes
  do fechamento e relê a disputa na etapa 1 pela RPC B, que é a RPC pública do devnet da Solana, sem chave e de outro
  provedor que a Helius. A volta atrás está em `deploy/vps/README.md`. A atualização do programa no devnet e a nova
  publicação do site ficaram para depois da correção do O-3 (Sprint 16), a pedido do Ronaldo.
- **Sprint 16, os registros que não dependem do endurecimento** (14/10/2026). Onde mora cada chave e segredo, e como
  trocar cada um (`deploy/vps/README.md`, nenhum valor escrito), com o motivo de nenhuma chave ligada à internet mover
  dinheiro de usuário. O plano de incidente numa página (`deploy/vps/runbooks/incident-plan.md`): quem pausa, o que a
  pausa para e o que nunca para, quem retoma; as lacunas **[F]** são do fundador. Os limites dos alertas aprovados em
  13/10 nos runbooks. Marcados com a evidência: o build verificável no CI, a checagem T12 do binário da mainnet e os
  parâmetros da mainnet.

- **As rotas do indexador públicas pela API de leitura** (branch `feat/api-indexer-route`, 13/10/2026; Sprint 08, a
  resposta (a) do fundador sobre o caminho público; `session-log/2026-10-13-rotas-do-indexador-pela-api.md`). O
  `brot-api`, já público em `brot.markets/api/v1`, encaminha ao indexador, no loopback, exatamente as cinco rotas de
  leitura dele (a atividade e a chance de uma campanha, a atividade recente, as entradas de uma carteira e a ordem da
  página inicial), sem mudança na Cloudflare nem no túnel. Só GET e HEAD; o caminho e a consulta passam como vieram;
  nenhum cabeçalho do cliente segue adiante além do `accept`; o CORS é o da API; o indexador fora do ar dá 503, a
  demora 504 e uma resposta acima de 1 MB 502, sempre no formato de erro da API e sem o endereço do indexador
  (`API_INDEXER_URL`, só no loopback; `off` desliga). As três listas sem limite do indexador ganharam páginas
  (`?limit=` de 1 a 500, 100 por padrão, e o cursor `?before=`, com `next_before` na resposta), para nenhuma resposta
  chegar ao teto. Nada foi publicado: vale quando o indexador for instalado e o `brot-api` reiniciado, um ato do
  Ronaldo no servidor.

- **13/10/2026, ações em produção pedidas pelo Ronaldo, nas palavras dele** (`session-log/2026-10-13-landing-tags-e-pr-88.md`):
  o landing de `brot.markets` passou de `ab764ab` para a `main` em `395efa5`, depois do teste na porta 4239: a página
  de privacidade corrigida está no ar e `/terms` responde 404 (a resposta 9a); as tags `sprint--1` (`635c77a`),
  `sprint-09` (`368a76a`) e `sprint-10` (`b4f3b55`) foram criadas com as listas do que fica; o PR #88 (o keeper das
  Sprints 06 e 07) entrou na `main` (`88a00f9`). O pagamento automático do keeper no devnet ainda não foi ligado: o
  servidor continua com o keeper antigo, à espera da palavra do Ronaldo para a instalação.

- **Sprint 15, a entrada selada do patrocinador** (branch `sprint-15-sponsorship`, 13/10/2026; construída e testada, não
  publicada no devnet; `docs/sprints/sprint-15-sponsorship.md`, `session-log/2026-10-13-sprint-15-entrada-selada.md`).
  Base: o andaime das Sprints 14 e 15 (`fd67706`).
  - **`sponsor_join_campaign`**: o patrocinador entra no SIM ou no NÃO com pelo menos US$ 500 (o `opening_fee_usd`),
    cobrados ao preço SOL/USD da Pyth pela mesma conversão da abertura, com o teto de lamports e a versão das regras de
    criação travada entre a prévia e a assinatura; 90% entram no pote pelo mesmo caminho da entrada comum, 10% ficam
    retidos numa conta do próprio patrocinador (`SealedFee`) até o resultado. A pausa recusa a entrada selada.
  - **`settle_sealed_fee`**: qualquer carteira liquida depois do resultado; a taxa volta ao patrocinador numa anulação
    por falha da casa e vai ao cofre de taxas em todo outro caso; o `close_campaign` espera toda taxa retida.
  - **O núcleo da entrada comum** saiu de `join_campaign.rs` para `join_core.rs` e `join_slots.rs`, na mesma ordem e com
    os mesmos erros: nenhum dos 40 testes da entrada comum mudou.
  - **O SDK**: o construtor, a cotação, a conferência na ordem do programa, a preparação segura (`prepareSealedEntry`:
    "ok" só quando conferência, resumo e simulação concordam) e o resumo do que se assina com a parte da taxa em
    números; o relay passa a barrar a entrada selada de um país bloqueado.
  - **O teste de dinheiro** (I1 a I15) sorteia a entrada selada, a liquidação da taxa, SOL mandado à mão para a conta e
    o fechamento esperando a taxa; verde em 35 sementes. A revisão adversária não achou nada grave: o achado médio (o
    teste de dinheiro) e quatro menores entraram antes do PR, revistos numa segunda passada; a taxa da entrada selada
    feita tarde ficou com o fundador, presa por um teste.
  - **O andaime das Sprints 14 e 15 vem junto** (`fd67706`): se esta sprint entrar na `main` antes da 14, as três
    instruções da 14 (`user_link_referrer`, `reread_campaign`, `admin_decide_contest`) chegam como esboços que recusam
    tudo, com os erros 6153 a 6165 e os eventos 18 a 20.
  - **O `bun run test` passa a rodar também `services/`** (a mesma linha do PR #87).
- **O keeper liquida, envia com orçamento e vigia a cadeia** (branch `sprint-07-keeper-carryover`, 13/10/2026; itens
  abertos das Sprints 06 e 07). Nada instalado no servidor; nada enviado à devnet.
  - **Liquidação atrás de `KEEPER_SETTLE`, desligada por padrão** (se o keeper da devnet paga é decisão do fundador):
    tally (o de um SIM de preço espera o fim da janela, para o corte ainda poder voltar a uma prova anterior; os outros
    resultados na hora), finalize depois da janela, `settle_entry` em lotes, parte do criador, prêmio, taxa, fechamento
    e sweep, cada passo só quando o estado permite e com o destino gravado na cadeia. Testado em LiteSVM: Split,
    OneSided, Refund por causa externa e falha da casa, cada lamport contra a matemática do SDK; dois keepers ao mesmo
    tempo (um aterrissa, o outro recebe `AlreadySettled` e nada se move duas vezes).
  - **Envio**: limite de unidades pela simulação, taxa de prioridade presa por tipo de instrução e por teto em
    lamports, reenvio até o `lastValidBlockHeight`, instrução que falha sai do lote; repetição com espera crescente.
  - **Leituras em lote**: um `getProgramAccounts` e `getMultipleAccounts` de 100; só simula a resolução de quem pode
    resolver. Medido em processo: 1.000 campanhas abertas, 14 chamadas de RPC por ciclo.
  - **Alertas novos**, cada um com runbook e teste: campanha parada (10 e 30 minutos), NÃO com `met_late`, 80% de
    `max_open_campaigns`, aberturas por hora, abertura por chave do time, exposição nos cofres, crédito reservado
    antigo, SOL/USD velho, mudança no programa da Pyth, segunda leitura sem conferência. Os campos da própria linha do
    alerta não podem mais ser sobrescritos pelo detalhe.
  - **Segunda leitura**: a campanha de preço contra a transação que gravou a prova no `posted_slot`, pelo RPC B; os
    outros tipos pelo `recheck` do SDK; o diário diz qual RPC respondeu.
  - **Unidades** `brot-keeper` e `brot-keeper-standby` com usuário próprio, segredos por `LoadCredential=` e
    `ProtectProc=invisible`; não instaladas.
- **O pacote de auditoria para as duas firmas** (branch `sprint-17-audit-fixes`, 13/10/2026; Sprint 17, a parte que
  não depende delas; `docs/audit/`). Cinco documentos, cada afirmação sobre o código com arquivo e linha em `395efa5`:
  - **`SCOPE.md`:** as 22 instruções; as dez regras de abertura do TP §3.4.10 com o código e o erro de cada uma; a
    abertura cobrada ao preço da Pyth, o `max_lamports` e a guarda do `id`; os tetos dos parâmetros; os seis leitores e
    quais abrem na mainnet; entradas, resolução, janela, liquidação e o caminho da reserva; taxas e a parte do criador;
    o `VoidReason`; poderes e pausa; eventos; I1 a I15; as lacunas conhecidas antes do congelamento; seções a preencher
    para as Sprints 14 e 15.
  - **`THREAT-MODEL.md`:** ativos, atores, fronteiras de confiança, quinze classes de ataque com o índice por
    instrução, e os riscos que o fundador aceitou (sem teto, sem lista de contas, o criador que controla a conta
    medida, a autoindicação).
  - **`PINOCCHIO.md`:** as duas auditorias públicas do Pinocchio (Zellic, 30/6/2025; Neodyme, 12/6/2025) cobrem a
    versão 0.8.4; o programa fixa a 0.11.2, e nenhuma auditoria posterior foi achada. O plano técnico dizia só
    "auditado pela Zellic": corrigido (§1 e C38).
  - **`FIX-WORKFLOW.md`:** de um achado à correção (teste que reproduz primeiro, as conferências antes de voltar à
    firma, a confirmação dela, o hash novo, o relatório público).
  - **`README.md`:** o bloco da versão candidata, a preencher no congelamento (tag, commit, hashes, o comando do
    `solana-verify`), e o mapa de cada checagem para os seus testes.
- **O roteiro da mainnet e o ensaio dele num fork do Surfpool** (branch `sprint-18-mainnet`, 13/10/2026; Sprint 18,
  a parte que não depende de ninguém; `deploy/mainnet/README.md`; `session-log/2026-10-13-auditoria-do-roteiro-e-faixas.md`).
  Nunca executado: nada foi enviado à mainnet nem ao devnet, e nenhuma chave de verdade foi usada.
  - **O roteiro** (`deploy/mainnet/README.md`): as condições do dia com a evidência de cada uma (os dois relatórios,
    o multisig 2 de 3 em carteiras de hardware, a empresa, a revisão do advogado, a regra de tesouraria), os passos do
    artefato do CI ao primeiro ciclo de 0,01 SOL, os pontos de parada e a atualização depois do lançamento.
  - **Três decisões tomadas pelas fontes:** o primeiro deploy não pode ser uma proposta do multisig (o loader do Agave
    3.1.10 não aceita `DeployWithMaxDataLen` por CPI), então uma carteira de hardware publica a partir de um buffer e
    passa a autoridade de upgrade ao cofre do Squads na mesma sessão; o cofre inicializa o `GlobalConfig` (admin e
    `fee_recipient` = cofre, sem chave de admin intermediária); o time lock do Squads é o último ato da sessão.
  - **As respostas do fundador de 13/10 (M-1 a M-4), agora o caminho padrão:** dois multisigs com as mesmas três
    carteiras, o da autoridade de upgrade com time lock de 24 horas e o do admin e das taxas sem trava; o Ronaldo
    segura a carteira de hardware no dia; o primeiro ciclo tem uma abertura paga ao lado da abertura da equipe. O passo
    7 virou duas propostas: o cofre do upgrade inicializa o `GlobalConfig` (taxas no cofre do admin) e indica o cofre
    do admin como o próximo admin, que aceita em seguida. O script recusa um multisig nomeado duas vezes, membros
    diferentes, trava no multisig do admin e qualquer trava do upgrade que não seja 0 ou 24 horas.
  - **Os scripts** (`scripts/deploy/mainnet-*.ts`, `bun run deploy:mainnet`): só a mainnet-beta pelo hash de gênese,
    o fork do Surfpool reconhecido à parte, a autoridade de upgrade só numa carteira de hardware, o binário amarrado
    ao SHA-256 digitado, simulação por padrão.
  - **O ensaio** (`scripts/mainnet/`, `bun run mainnet:rehearse`): num fork da mainnet no Surfpool, com o binário do
    recurso `mainnet`, o programa Squads v4 de verdade e contas reais (SOL/USD, mints): deploy, passagem da autoridade,
    inicialização pelo cofre, abertura paga de US$ 500 ao preço da Pyth igual à cotação do SDK, um ciclo inteiro, o
    time lock recusando antes da hora, a pausa e a retomada. Passou de ponta a ponta quatro vezes (43 conferências em
    13 passos), e de novo no caminho das respostas do fundador (51 conferências em 12 passos; a abertura paga cobrou
    4,662 SOL; os pagamentos, o 1% do criador e a parte do Brot iguais aos do SDK). Não ensaiado: as carteiras de hardware, as esperas de verdade, o app e a CLI do Squads, o
    `solana-verify` (precisa de Docker) e os serviços na mainnet.
  - **Os parâmetros da mainnet** em `deploy/mainnet/init-params.mainnet.json`, aprovados pelo fundador em 13/10
    (M-3): `max_open_campaigns` 1.000, `max_price_age` 60 s, `max_price_conf_bps` 50, `campaign_max_age` 30 s.
  - **Teste:** 5 novos (`tests/ops/mainnet-deploy.test.ts`), as guardas sem rede, o par de multisigs incluído.
- **Sprint 16, a integridade da versão no CI** (branch `sprint-16-hardening`, 13/10/2026;
  `docs/technical/verifiable-build.md`). Toda ferramenta que o CI baixa é fixada pelo SHA-256 e instalada por um script
  só (`scripts/ci/install-pinned.sh`): a CLI da Solana e as platform-tools, o Bun, o Node, o gitleaks e o binário do
  `solana-verify` 0.5.2; o `setup-bun` e o `setup-node` saíram. O `solana-verify build` roda duas vezes do zero, na
  imagem do Docker fixada pelo digest, e o CI falha se os dois hashes e os binários testados não forem iguais byte a
  byte; o binário do devnet publicado no `programs-<sha>` passa a sair desse build. O build `mainnet` sai num artefato
  à parte, `programs-mainnet-<sha>`, com a mesma lista de recursos que os testes do T12 usam. O gitleaks reforça a
  varredura de segredos (chaves da Solana em JSON e em base58, URLs com chave, segredos em hex, keystores); um
  `CODEOWNERS` cobre o `.github/`, a varredura e os hooks; uma checagem recusa no `bun.lock` qualquer registro que não
  seja o npmjs.org. A atestação de origem não sai: o GitHub só a oferece a repositórios públicos ou a organizações
  pagas, e isso é decisão do fundador.
- **O keeper paga sozinho no devnet** (13/10/2026, a pedido do Ronaldo; `deploy/vps/README.md`,
  `docs/sprints/sprint-06-keeper-server.md`). O código do keeper do PR #88 (as pendências das Sprints 06 e 07, release
  `88a00f9`) entrou no servidor às 19h03 UTC, na unidade de sempre e com `KEEPER_SETTLE=on`, depois de um ensaio sem
  envio na porta 4239. O keeper liquidou sozinho as duas campanhas que esperavam: `FmDo…` (finalize `5Z5zdkN5…`,
  prêmio e taxa `ZqDWtcrs…`, fechamento `647Zc7S2…`) e `G6Un…` (finalize `3dRvL3Lz…`, prêmio e taxa `4Ev4MJCH…`,
  fechamento `4XEdx7xh…`). A resolução de verdade da Sprint 06 já tinha sido vista: o keeper resolveu `FmDo…` sozinho
  em 11/10/2026, às 15h59min17s UTC (`23agRJq8nJtzUjNy…`). Mais tarde no mesmo dia, também a pedido do Ronaldo, a RPC
  do keeper passou da RPC pública do devnet, que respondia 429, para a da Helius no devnet (a escolha do D4, de
  10/10): a chave fica só no arquivo de configuração do servidor, e o keeper registra só a origem. Depois da troca, a
  unidade ativa, nenhum erro e nenhum 429 nos primeiros ciclos, a liquidação ligada e nada pendente. As cópias de
  segurança e o caminho de volta estão no README. A unidade com identidade própria continua não instalada: depende do
  dono do servidor.

- **O keeper aprende as Sprints 14 e 15** (13/10/2026, faixa L14K, `a827b1e` e `c6ec66e`; no PR da Sprint 14). Fecha
  uma campanha só depois de liquidar cada taxa selada aberta (`settle_sealed_fee`, para o patrocinador gravado), para
  nunca mandar um fechamento que o programa recusa. Numa disputa na etapa 1, um keeper com a RPC B simula a releitura
  por ela: a mesma leitura, recusada até o fim das 24 horas, espera sem contar como falha; uma diferente vai na hora
  para a etapa 2 e avisa a equipe; a disputa vencida é finalizada e liquidada. Ele nunca abre nem decide uma disputa.
  Alertas novos, cada um com o seu runbook: disputa aberta, etapa 2 perto do fim, releitura diferente e taxa selada
  ainda aberta. Nada muda no `keeper.env`; no servidor ele relê só quando a RPC B for configurada.
- **Sprint 14: as correções da segunda revisão adversária** (13/10/2026; `docs/sprints/sprint-14-referral-second-read.md`,
  "Record"). A revisão não achou como pagar cedo, ou para o lado errado, um resultado contestado, nem como travar um
  pote. **S1:** o `team_open_contest` escolhia abrir ou escalar pelo estado gravado, e uma abertura repetida (um 429
  depois de ela pousar, ou dois membros da equipe no mesmo alerta) escalava a disputa; agora o ato é o byte assinado
  (`1` abre, `2` escala), com `ContestAlreadyOpen` (6177) e `NotContested`, o resumo do SDK lê o ato do byte, e
  `scripts/team/contest.ts --escalate` escala, ou abre e escala na mesma transação (faixa L14B, `9d8df7c` a
  `9f19d88`). **R1 a R4 e I1**, na rotina semanal da indicação e no indexador: o arquivo de assinatura roda uma vez e
  confere o memo de cada linha na cadeia antes de enviar; uma linha que não pode ser creditada (um sysvar, por
  exemplo) fica presa para uma pessoa e as outras são simuladas no preparo; a numeração dos lotes nunca se repete; o
  arquivo confere o hash de gênese da rede e lê a URL da RPC de um arquivo; o indexador lê a anulação do admin (faixa
  L14R, `0db32d1`, `f9480d7`, `d3372bc`).
- **Sprint 14: a resposta do fundador ao D2, construída** (13/10/2026, faixa L14B, `3d524c9` a `05fe0d8`). O Ronaldo
  respondeu (a), com uma etapa 1 de 24 horas: a releitura igual só paga depois delas (`RereadBeforeTimelock`, erro
  6176), e nesse prazo uma chave da equipe leva a disputa à etapa 2 chamando `team_open_contest` de novo. O pior caso,
  do resultado lido ao pagamento, passa de 55 para 78 horas (6 + 24 + 48), garantido na cadeia com ou sem keeper. O SDK
  mostra o fim da espera e se a escalada ainda cabe (`contestTimelockEndsAt`, `contestEscalable`), e o resumo diz se a
  assinatura abre ou escala a disputa. Conferido: a escalada e cada recusa dela (LiteSVM e Mollusk), o pior caso de 78
  horas, o teste aleatório em 12 sementes, o ensaio da equipe (44 de 44) e a prova de mutação dos 17 ids da disputa
  (37 casos). Antes de enviar uma releitura, o keeper precisa simulá-la: a igual é recusada até `contestTimelockEndsAt`.

- **Sprint 14: as correções da revisão adversária, F3 a F10** (13/10/2026). F3: o pior caso vale na cadeia, com ou sem
  keeper (uma releitura atrasada não acrescenta tempo, e uma etapa 1 sem releitura vence 48 horas depois do seu
  prazo). F4: uma prova oferecida que o leitor recusa recusa a releitura, em vez de levá-la à etapa 2. F5: a nota do
  admin sobre o SIM de fato relido depois do prazo. F6: o resumo da decisão do admin só promete a devolução da taxa de
  abertura quando entrou alguém. F7: o aluguel do vínculo de indicação entra no máximo que se assina e no texto. F8: o
  comentário da guarda do `team_open_contest`. F9: a releitura não oferece prova por padrão. F10: os textos da interface
  e do plano técnico sobre a releitura e o seu `CampaignFinalized`.

- **Sprint 14, indicação e disputa em duas etapas** (branch `sprint-14-referral-second-read`, 13/10/2026; construída
  e testada, não publicada no devnet; `docs/sprints/sprint-14-referral-second-read.md`,
  `session-log/2026-10-13-sprint-14-indicacao-e-disputa.md`). Base: o andaime das Sprints 14 e 15 (cinco instruções
  novas, os erros 6153–6175, os eventos 18–22, as contas `ReferralLink` e `SealedFee`) e o indexador da Sprint 08.
  - **O vínculo de indicação** (`user_link_referrer`): o indicado assina uma vez, com o próprio aluguel, e nada muda
    nem fecha o vínculo depois; recusa o endereço zero e o próprio indicado; um endereço pago antes é completado; nunca
    pausado. 66 casos provam que nenhuma instrução altera um vínculo.
  - **A disputa em duas etapas**: `team_open_contest` ligado (só depois de toda entrada contada), `reread_campaign`
    (qualquer carteira, só no nível de cima: a mesma leitura paga com o resultado gravado, depois das 24 horas da etapa
    1; outra leva à etapa 2, de 48 horas; nunca grava um resultado), `admin_decide_contest` (o admin confirma ou anula, nunca inverte: conferido em
    todas as 65.536 combinações de argumentos) e o fim da etapa 2 no `finalize_campaign`. A aresta Contested → Settled
    para a campanha sem entrada, e o erro 6175 para a confirmação com motivo de anulação.
  - **A indicação fora do programa** (`services/indexer`, `scripts/referral/`): as tabelas de indicação, "antes da
    primeira entrada" pela ordem da cadeia, a base `(taxa − parte da taxa do criador) × entrada ÷ V` conferida contra o
    snapshot da campanha, os 20% por 90 dias e a devolução até 0,05 SOL; a rotina semanal prepara o lote para uma
    pessoa assinar (nenhuma chave no servidor), registra o que pousou pela marca no memo e publica o relatório só com
    carteiras e valores.
  - **O teste de dinheiro** (I1 a I15) agora sorteia vincular, contestar, reler, decidir e deixar vencer a etapa 2, e
    confere o contador de campanhas abertas em toda saída; os scripts da equipe usam a contestação de verdade.
  - **A revisão adversária** (do andaime à integração da disputa, `fd67706` a `e978f5c`) não achou caminho para mandar
    SOL ao lugar errado nem para inverter um resultado; achou um problema de desenho grave, a releitura igual que paga um
    resultado contestado (o D2, respondido e construído em 13/10, acima), e correções menores (F3 a F10, acima). A
    segunda revisão, das mudanças posteriores, está com o líder.

- **Sprint 08, a terceira fatia do indexador** (branch `sprint-08-indexer`, PR #72, 13/10/2026; construída e testada,
  não implantada; o registro em `docs/sprints/sprint-08-indexer-api-points.md`). A ordem da página inicial calculada
  no indexador e servida em `/api/v1/ranking` (X1.9); os KPIs e o relatório do parceiro sem endereço nenhum; o
  `content/partners.json` vazio com o esquema gerado do zod do SDK e a checagem de todo arquivo de conteúdo no CI; os
  pontos iguais aos do SDK em toda regra 3a; o `feed_history` gravado; o `logsSubscribe` só para acordar a ingestão
  (o teste achou que o Kit 8.4 não avisa quando o nó fecha o socket); o alerta da entrada da carteira de quem abriu numa
  campanha que ele pode mover; os DTOs em zod da API e os campos `program_last_deploy_slot` e `entries_allowed` no
  `/api/v1/health`; a unidade `brot-indexer.service`, escrita e não instalada; o limite do faucet do devnet (2 pedidos a
  cada 8 horas); a revisão de privacidade das nove perguntas.

- **A curva da graduação pelo ticker, e os botões SIM e NÃO limpos** (branch `feat/curve-ticker-side-buttons`,
  13/10/2026; `session-log/2026-10-13-ticker-da-curva-e-botoes-de-lado.md`). Responde ao nome legível que o registro
  do upgrade deixou em aberto, pelo caminho que muda a A-11, aprovado pelo fundador, o Lucas, no mesmo dia.
  - **O título de uma campanha de graduação nomeia a curva pelo ticker do token**, e nunca só pelo endereço: "Meteora
    launch curve $TEST (…7Dny) raises its full 85 SOL?", o fim do endereço do pool sempre ao lado; `Token (…7Dny)`
    quando não há ticker para mostrar; o nome revisado sozinho, `$BROT`, para um pool em `content/account-names.json`
    (o de demonstração do devnet entrou). Vale para os cartões, a página da campanha, "My entries", a prévia e a
    revisão da caixa de abertura, e o post de resolução da equipe. É a única exceção à A-11 (plano técnico v0.1.10,
    §3.4.10).
  - **O ticker é lido no navegador** pelo SDK (`token-symbol.ts`): o `base_mint` do pool (byte 136), depois os
    metadados da Metaplex ou a extensão do Token-2022, dono primeiro. O SDK o limpa (`tickerOf`, a mesma regra para o
    site e o app): só de 1 a 10 letras e dígitos ASCII, e nada que imite SOL, WSOL, USDC, USDT ou BROT.
  - **Os endereços ficam na prova**: o pool e o mint do token ("Token mint (CA)"), com link e botão de copiar.
  - **O relay serve inteiras as contas da Metaplex e do Token-2022**, pronto para quando ele entrar no ar (hoje o site
    lê a RPC pública do devnet direto).
  - **Os botões SIM e NÃO** levam só a palavra; a chance e a estimativa ficam embaixo de cada um, no texto neutro. O
    mesmo nos cartões e no slide "Open now" da página inicial (sem a chance, que o cartão já mostra em destaque, e sem
    o "Join" antes da palavra), num estilo só para os três (`.side-cell` e `.side-est`).
  - **Testes**: 15 novos (`tests/sdk/token-symbol.test.ts`, `tests/site/curve-name.test.ts`,
    `tests/site/panels-render.test.ts`, um em `tests/ops/resolution-post.test.ts`), em contas reais da mainnet; dois
    testes antigos passam a esperar `Token (…XXXX)` no lugar do endereço curto. Conferido também num navegador, com o
    site rodando localmente contra o devnet, a 1280 e a 412 px.
  - **No ar em `brot.markets/dev0x`** desde as 04h45min20s UTC de 13/10/2026, na versão `df09357435d5` (a mescla do
    PR #80, CI verde), publicada da máquina do Ronaldo a pedido dele: montada ao lado da anterior, construída para o
    slot 510.454.676 (A-8; o programa não mudou) e testada na porta 4239 antes da troca. A versão anterior
    (`570fa306b4d3`) ficou no servidor. O erro #418 do React visto no navegador já existia na versão anterior
    (`session-log/2026-10-13-publicacao-do-ticker-no-dev0x.md`).
- **O sexto tipo no ar no devnet e no `/dev0x`** (12/10/2026 em Brasília, 13/10 em UTC; a pedido do Ronaldo, que
  confirmou antes de qualquer envio; `session-log/2026-10-12-upgrade-devnet-sexto-tipo.md`).
  - **O programa** `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o` foi atualizado com o artefato do CI da `main` em
    `91a5bed` (a mescla do PR #76, execução 38327381894), `brot_markets.so` com sha256
    `63610a32d6dfa243af80f741dad328645e49fdd3c2d34173e0471c4a2982d7e4` e o IDL igual ao da `main`. Primeiro a
    ProgramData foi aumentada à mão em 10.240 bytes, porque o loader recusa um aumento menor e o automático do CLI pede
    só o que falta (`51gvu4iQRg9eULzdKZPxjatZVo2j9UwvJmKCNCtJVfL15PU96L3A1iuZs4wXBW5yZ95sXuVCbZrG2c1y2K5UDCG2`); depois
    veio o upgrade (`2GkUHe1U4DwM62rEWembKtu9QSfjgMiV3jw7AgZzM7eynyCXD5DxgWqQL8dBUT8UjgMbbWsnJKePk5F7pezvtyLm`). O
    último deploy agora é o slot 510.454.676. A autoridade continua a mesma, e os bytes na rede são os do artefato. A
    chave de upgrade, a de devnet do Ronaldo (`6N7r…`), ficou na máquina dele; o custo foi de 0,0529 SOL de teste.
  - **O PR #78** (o site e os documentos do sexto tipo) entrou na `main` depois do upgrade (`570fa306`), com o CI verde.
  - **O site em `brot.markets/dev0x`** passou para a versão `570fa306b4d3` às 01h18min24s UTC de 13/10, construída
    para o slot novo (A-8) e testada numa porta interna antes da troca. A versão anterior (`6a52505c9aba`) ficou no
    servidor. Entre o upgrade e a troca, uns nove minutos e meio, o site no ar não assinava nada.
  - **A campanha de demonstração** `8670587885290160238`, no pool `12uLN2texEDbadM4WzJm6Dry8Quc8qFpDQEwhSdi7Dny`,
    foi aberta pelo Ronaldo no site, com a carteira da equipe, às 02h34 UTC de 13/10: grátis, meta de 85 SOL, prazo em
    20/10. A página mostra a barra da curva e o aviso "YES can be bought by anyone who pays the rest of the curve.".
    Ficam em aberto um nome legível no lugar do endereço na frase e os avisos que garantem o pool certo.
  - **`deploy/devnet/README.md`** ganhou a seção "Upgrading", com os passos de hoje e o porquê.
- **O sexto tipo no site e nos documentos** (branch `feat/dbc-graduation-ui`, 12/10/2026, empilhada sobre a
  `feat/dbc-graduation-reader`; `session-log/2026-10-12-sexto-tipo-no-site-e-nos-documentos.md`).
  - **A caixa de abertura** ganha o modelo "Graduation", com o campo do pool da DBC. O site lê a config que o pool
    aponta e confere os dois na ordem do leitor (`account-check.ts`). A meta não se digita: é o limite da curva,
    mostrado só para leitura com quanto a curva já juntou (`curve-target.tsx`). As recusas da curva (6148 a 6152, a
    curva já completa e a curva cheia demais) aparecem junto ao campo do pool, com texto próprio. O modelo abre em todo
    cluster menos a mainnet, como o programa.
  - **A página da campanha** mostra a curva (`curve-progress.tsx`): a barra de `quote_reserve` sobre
    `migration_quote_threshold`, a fatia preenchida (nunca arredondada para cima), o que falta ou o segundo em que a
    curva completou, o estágio, e sempre o aviso "YES can be bought by anyone who pays the rest of the curve." O "se
    lido agora" segue o carimbo do pool, antes e depois do prazo.
  - **A lista e a página inicial** leem quanto a curva juntou; o filtro ganha o tipo "Graduation", com cor própria
    (`--k-curve-*`, contraste conferido nos dois temas); o post de resolução e a revisão antes de assinar passam a
    aceitar o tipo.
  - **Os documentos contam seis tipos**: o BP v0.0.4 (o índice, a Parte 1 com a descrição do tipo na seção 4.2, a
    Parte 4), o resumo de produto (R-13), os Termos (seção 4, com a nota de que o texto precisa de revisão jurídica
    final antes de qualquer publicação), o `PITCH.md`, o README, a página dos tipos do docs e o HTML gerado, o plano
    técnico v0.1.9 e a lista do relay. Os registros históricos (session logs, sprints, versões antigas do BP, a
    proposta de arquitetura) ficaram como estavam.
  - **Testes**: 13 novos (`tests/site/curve.test.ts` e `tests/site/open-curve.test.ts`), entre eles a abertura feita
    pela caixa e aceita pelo programa no LiteSVM, de graça e paga, e cada recusa da caixa recusada igual pelo programa.
- **O sexto tipo de campanha, `DbcGraduated`: "a curva de lançamento da Meteora (DBC) do token X completa até a data
  D?"** (branch `feat/dbc-graduation-reader`, 12/10/2026; `docs/technical/meteora-readers-plan.md`,
  `session-log/2026-10-12-sexto-tipo-dbc-graduated.md`). Entra no programa, nos testes, no IDL e no SDK; a caixa de
  abertura, a página da campanha, o upgrade no devnet, o BP, o resumo de produto e os Termos ficam para depois.
  - **O leitor** (`readers/dbc_graduation.rs` e `dbc_graduation/config.rs`) lê o `VirtualPool` da DBC (o
    `TransferHookPool` é recusado) e, na abertura, o `PoolConfig` do próprio pool, passado como décima conta: só curvas
    em SOL, de 85 SOL para cima (1 SOL no build `drill`); o alvo é o limite da curva; ao abrir, falta ao menos 10% dele.
    As entradas travam quando a curva completa. A resolução lê o segundo que o próprio pool gravou
    (`finish_curve_timestamp`), e não a hora de quem resolve: completou até o prazo é SIM, mesmo resolvido depois.
  - **Cinco erros novos, 6148 a 6152**, acrescentados no fim (`CurveHasTransferHook`, `CurveConfigMismatch`,
    `CurveNotInSol`, `CurveTooSmall`, `TargetNotThreshold`), cada um com teste no host, teste no LiteSVM, a mesma recusa
    no `validateOpenCampaign` e o texto do site.
  - **Abre em todo build menos o de mainnet** (`DBC_GRADUATED_OPENS`), até as auditorias cobrirem o leitor.
  - **Doze contas reais da mainnet** em `tests/fixtures/dbc-*` (`scripts/capture-fixtures-dbc.ts`): pools nos estágios
    0 a 3, configs de 85 SOL, 11 SOL e em USDC, e um pool com transfer hook.
  - **A demonstração no Surfpool** (`scripts/surfpool/dbc-graduation.ts`): num fork da mainnet, uma campanha abre num
    pool real ainda na curva, duas pessoas entram (SIM e NÃO), uma carteira completa a curva com o swap da própria DBC,
    a resolução grava SIM, e quem entrou no SIM recebe o pote.
- **A página inicial "ainda assando"** (branch `feat/landing-still-baking`, 12/10/2026, a pedido do Lucas;
  `session-log/2026-10-12-pagina-inicial-ainda-assando.md`). A página inicial foi publicada no mesmo dia, sozinha; o ícone do `/dev0x` entrou no ar à tarde, numa versão nova do site (`6a52505c9aba`).
  - **A marca da barra do topo** é o pão simples (`img/brot-loaf.webp`), como o `BRAND.md` diz; o Baked segue andando
    pela página.
  - **A faixa "Still baking."**, nas cores da casca, entre a barra do topo e a página: inteira um link para `/dev0x`,
    dizendo que lá se entra e se abre campanha com SOL de teste, sem valor.
  - **Quatro exemplos novos rodando no topo** (`examples.js`, `live.css`), com a mecânica do demo do deck: um ponteiro
    entra num lado, a cadeia resolve, e o cartão mostra para onde foi o pote. Preço, stake pool, queima e liquidez
    travada; dois acertos e dois erros; a conta é a do programa (10% do lado perdedor e 1% das entradas, tirados do
    pote), e não a do deck. A `/2` recebeu o mesmo, porque diz o que a página inicial diz.
  - **O ícone da aba do `/dev0x`** (`app/app/favicon.ico`) deixou de ser o triângulo do Next e é o do `brot.markets`.
  - 51 testes no site provisório (4 novos, `tests/home.test.mjs`); conferido num navegador nos dois temas e no celular.
- **Sprint 08, terceira parte, segunda fatia: as rotas de leitura do indexador** (mesma branch, PR #72 em rascunho,
  11/10/2026; construídas e testadas, não implantadas): a atividade de uma campanha e a divisão depois de cada entrada,
  as entradas recentes de todas as campanhas e as entradas de uma carteira, com os esquemas em `@brot/sdk/schemas` e
  testes de contrato; servidas pelo próprio indexador em `127.0.0.1:4201`. O teste pegou as entradas recentes saindo
  da mais velha para a mais nova. Falta decidir como elas chegam ao público (pela API de leitura ou por uma rota do
  túnel).
- **Sprint 08, terceira parte: o indexador em SQLite, primeira fatia** (branch `sprint-08-indexer`, 11/10/2026;
  `services/indexer`; `docs/sprints/sprint-08-indexer-api-points.md`; construído e testado, não implantado).
  - **A ingestão:** as assinaturas do programa em `finalized`, listadas até o ponto de controle e guardadas com o lugar
    de cada uma na cadeia; cada transação lida e decodificada pelo SDK, com as quatro regras do decodificador; uma
    transação SQLite por assinatura, com os eventos (`INSERT OR IGNORE`), as projeções e o estado juntos. A transação
    que o nó diz não ter segura as seguintes por até cinco tentativas e depois é pulada e contada; uma chamada que
    falha só para a atualização, então uma queda do nó nunca faz pular nada; um buraco no `seq` de uma campanha faz
    reler as assinaturas dela.
  - **As tabelas do plano**, com uma mudança que a cadeia impôs: a campanha é chaveada por endereço e abertura, porque
    um id fechado pode abrir outra campanha. Campanhas, entradas, pagamentos, pontos e ponto de controle; o
    `feed_history` existe, e é gravado numa fatia seguinte.
  - **Os pontos** pela regra do SDK, com a regra da conta viva (`campaignNow`) agora no SDK também, usada pela API e
    pelo indexador: os dois dão os mesmos pontos.
  - **A reconstrução** num arquivo novo é igual ao arquivo vivo, e cada conta viva bate com a linha dela e com o seu
    cofre (X1.3). O teste achou que o `isFirst` de uma entrada é o primeiro padeiro do pote, não a primeira entrada da
    carteira, e a contagem das entradas abertas passou a ser por carteira.
  - **Fica para as próximas fatias:** as rotas `/api/v1` lidas do arquivo, os DTOs, o ranking, o
    `content/partners.json`, os KPIs, o `feed_history` com a cópia noturna, os alertas, a unidade e o `logsSubscribe`.
- **O site em `brot.markets/dev0x`, pronto para o servidor** (branch `feat/dev0x-deploy`, 11/10/2026, a pedido do
  Ronaldo; `deploy/vps/README.md`, "The site under /dev0x"; não implantado). A raiz do domínio continua sendo a página
  de espera.
  - **O caminho base.** O site responde só sob `NEXT_PUBLIC_BASE_PATH` (`/dev0x`, em `deploy/vps/site-build.conf`;
    vazio aqui e no teste na web). Os arquivos que o Next não prefixa sozinho (o Baked, os ícones do manifesto, o
    ícone da carteira do celular) passam por `app/lib/base-path.ts`. Sob o caminho base o site manda `noindex`, como a
    prévia que estava ali.
  - **No servidor, túnel e systemd** (sem Nginx e sem PM2, decisão do Ronaldo): `brot-site` (o Next, sob o Bun fixado,
    em `127.0.0.1:4230`) e `brot-api` (a API de leitura, em `127.0.0.1:4220`), cada uma com seu usuário; duas rotas do
    túnel, `/dev0x` e `/api/v1`, acima da rota do landing.
  - **A prévia do protótipo** saiu de `/dev0x/` para `/prototype/`, no próprio landing.
  - **Ensaiado aqui**: o pacote do commit, a instalação sem scripts, o build sob o Bun com `/dev0x`, a API e o site
    rodando dessa cópia, conferidos num navegador. O ensaio pegou um defeito: sem o caminho base também no
    `next start`, o site respondia na raiz e dava 404 em `/dev0x`; a unidade agora carrega o mesmo arquivo do build.
- **Sprint 08, segunda parte: os nomes, o preço e o relay `brot-rpc`** (branch `sprint-08-price-names-relay`, PR #69,
  11/10/2026; `docs/sprints/sprint-08-indexer-api-points.md`; construídos e testados, não implantados).
  - **`/api/v1/names`** na API de leitura: os nomes revisados de `content/account-names.json`, com as regras que saíram
    do site para o SDK (`parseAccountNames`), e os 17 feeds da lista do programa com a conta patrocinada de cada um.
  - **`/api/v1/price`**: o SOL em US$ só para exibição, da Pyth SOL/USD, o mesmo preço que o programa cobra. Sem
    CoinGecko: a revisão jurídica leu os termos dele e nenhum plano cabia (atribuição em qualquer plano, nada de
    "gambling", nada de redistribuir o acesso, termos de uso próprios antes), e o Ronaldo decidiu tirá-lo (2b); o código
    dele saiu.
  - **O `brot-rpc`** (`services/rpc/`): o único caminho do navegador até a RPC paga, só com as onze chamadas que os
    clientes da Brot fazem e os argumentos que eles usam; uma transação só com este programa, o ComputeBudget e o
    Lighthouse; a conta de outro programa volta sem os dados; limites por IP e por /64 e /48 do IPv6, esquecidos em
    cerca de um minuto; um orçamento diário com uma reserva para assinar; um cache curto só de contas de outros
    programas; o bloqueio por país construído e vazio, sem bloquear ninguém (o Ronaldo, 11/10); um cabeçalho secreto
    que o túnel acrescenta; nada de IP nem de URL no log. O teste na web inteiro passa com o relay no meio
    (`E2E_RELAY=1`), e foi assim que um defeito do cache apareceu e saiu. Sem o relay, uma cena da Sprint 12 falhou
    uma vez numa corrida (a linha de sucesso do "Receive" some quando a página relê a cadeia); ela agora confere o
    resultado, a parte paga e nenhum botão.
  - **As revisões jurídica e de segurança, aplicadas.** O relatório jurídico ficou guardado para o advogado
    (`docs/legal/2026-10-11-sprint-08-legal-review.md`), com o texto da privacidade para o dia em que o site passar a
    usar o relay. A de segurança achou um caminho para a API de leitura responder com a pilha do erro
    (`?state=constructor`), corrigido junto.
  - **As decisões do Ronaldo de 11/10** (`docs/business/ideacao-perguntas-e-respostas.md`): sem CoinGecko, só a Pyth
    (2b); o site passa para o relay no dia em que ele for instalado, com o texto da privacidade no mesmo dia (3a); no
    devnet, US$ só onde define um custo, a abertura, e nunca como valor de um pote (4a). Ele também aprovou o
    `content/README.md` como revisor; como a mudança foi feita a pedido dele, a regra de duas pessoas do `content/`
    ainda pede a revisão do Lucas ou do Bernardo.
  - **Esperando o fundador:** a conta de RPC do relay com limite de gasto, o usuário, o Bun e as credenciais no
    servidor, as duas regras do Cloudflare, a unidade, a rota `/rpc` e o texto da privacidade (`deploy/vps/README.md`).
  - **Mesclada na `main` pelo PR #69 em 11/10/2026**, a pedido do Ronaldo, depois da revisão visual (PR #70): a main
    entrou na branch e os cinco conflitos ficaram com as duas entradas. O `content/README.md` foi junto com a
    aprovação só dele, por decisão dele; a segunda revisão (Lucas ou Bernardo) continua aberta.
- **A revisão visual do site: as telas aprovadas da Sprint -1 no `app/`** (branch `feat/full-ui-overhaul`, 11/10/2026,
  a pedido do Ronaldo; mesclada na `main` pelo PR #70 no mesmo dia; `docs/product/DESIGN-DIRECTION.md`, "Status em 2026-10-11"). O PR #67 tinha trazido só as
  cores da marca; agora o site tem a estrutura do protótipo aprovado (`prototype-lab/campaigns/`, servido em
  `/dev0x/`).
  - **Os estilos do protótipo** foram para `app/styles/ui/` como estão, em camadas de CSS, com as cores da marca.
  - **Mudaram de estrutura:** a moldura (faixa, barra do topo com o Baked, busca, carteira com menu, menu do celular,
    rodapé), a página inicial (topo com o custo da abertura agora, o carrossel "Open now" com a leitura na cadeia,
    "Closing soon", "Answered recently", os passos, a barra de filtros, a grade), o cartão de campanha com a leitura
    de agora contra o alvo, a página da campanha e o painel de entrada, a caixa de abertura, Minhas entradas e o
    ranking; Fees, How it works e o registro ganharam a cabeça e os títulos do protótipo.
  - **Nada mudou no que o site faz:** as mesmas leituras, regras, textos que o teste na web confere e fluxos. Duas
    expectativas do teste mudaram com o desenho: no celular, "How it works" fica no menu; ligada a carteira, o sinal é
    o chip com o endereço e o saldo (o "Disconnect" fica no menu dela).
  - **Ainda fora:** o cartão de compartilhar, o painel "About this campaign", a linha do tempo com a campanha aberta,
    a lista densa de todas as campanhas, a barra fixa de entrada do celular e o selo de parceiro.
  - **Os pedidos do Ronaldo depois de ver a revisão:** o título e o subtítulo da página inicial são os da capa do
    pitch, no vocabulário do site ("Campaigns the chain resolves." e "Permissionless campaigns that turn on-chain
    milestones into growth, settled by the chain itself."); o botão da carteira diz "Connect"; "question" virou
    "campaign" no texto do site. A regra do vocabulário segue inteira, sem exceção.
  - **Um só botão de abrir campanha:** o grande amarelo da página inicial saiu, e o "Open a campaign" da barra virou o
    amarelo da marca.
  - **"Connect" abre a lista "Connect a wallet"** do desenho aprovado: as carteiras do navegador, a escolhida ligada só
    pelo clique e o erro da carteira à vista. Antes ele ligava a primeira carteira instalada e engolia o erro, e o
    botão parecia morto.
  - **A busca da caixa de abrir completa o que se digita**, como uma barra de busca e como o protótipo aprovado
    (`/dev0x/`): cada sugestão é a frase inteira da campanha que ela abriria ("BTC/USD reaches $120,000"), agrupada por
    tipo. Ela lê a direção ("falls to", "reaches"), o prazo ("in 30 days", "2 weeks") e o alvo com "k" ("120k"). Com o
    preço da Pyth lido agora, nunca sugere um alvo já atingido, que o programa recusaria, e a caixa vazia começa com
    exemplos a uma distância justa do preço. Fora do que a cadeia confere, o Baked desconfiado diz "We can't check
    this on-chain." e mostra os três tipos mais próximos. Enter pega a primeira sugestão, e o cursor vai para o campo
    que falta. O que se digita continua só na página (D-j). O botão do prazo escolhido voltou a aparecer marcado.
  - **"$" antes do preço:** "SOL/USD reaches $150", como o protótipo aprovado escreve, na frase da campanha (cartões,
    página da campanha, caixa de abrir, sugestões da busca) e nos outros preços em US$ da página e dos cartões: a regra,
    a prova na cadeia (preço de agora, alvo e confiança), a leitura dos cartões e o painel da página inicial. Um feed
    de razão, como SSOL/SOL.RR, continua sem "$", porque o valor dele não é em dólar.
  - **O campo de pontos do protótipo atrás da página:** os pontos acendem em volta do cursor, e a luz segue o cursor
    sobre os cartões da grade. Com "reduzir movimento" ligado no sistema, os pontos ficam parados e a luz dos cartões
    não aparece.
  - **O saldo da carteira acompanha as entradas.** O da barra do topo era lido uma vez, ao conectar, e ficava parado:
    depois de uma entrada de 0,5 SOL ele ainda dizia 5,0 SOL. Agora o site tem uma leitura só do saldo, refeita quando
    uma entrada ou uma abertura entra na cadeia, a cada 20 s com a página à vista e quando a pessoa volta para a aba.
  - **A página da campanha mais enxuta:**
    - o título pergunta: "SOL/USD reaches $150?";
    - a regra cabe numa linha, só com a condição, o alvo e o prazo; a regra inteira fica em "Full rules", fechada;
    - na prova na cadeia, o preço de agora, o alvo e o "If read now" ficam à vista; o resto (quando o preço foi
      publicado, a conta lida, o dono conferido, as datas e a resolução) fica em "Proof details", fechado; um aviso de
      preço velho ou perto do alvo continua à vista;
    - "Re-check it yourself" ficou mais fino, e a caixa da estimativa tem o tamanho do que ela diz;
    - as notas do painel de entrada ficam em "Read before you enter", na cor de destaque da marca; o aviso do
      travamento continua à vista, e a folha antes de assinar mostra todas as notas abertas;
    - o botão de entrar não mudou: "Review entry" quando a carteira cobre a entrada, e "Get devnet SOL" só quando não
      cobre.
  - **A página acompanha a entrada.** Depois que uma entrada entra na cadeia, a página relê na hora e de novo em 1,5,
    4 e 8 segundos, porque o RPC público do devnet às vezes responde por um instante com o estado de antes. A divisão,
    o pote, as entradas recentes e o saldo aparecem atualizados. Cada transação das entradas recentes é lida uma vez
    só, para essas leituras extras saírem baratas.
  - **"?" também nos cartões**, como no título da página.
  - **"Opened by …" leva à transação que abriu a campanha, no Solscan.**
  - **YES em verde e NO em vermelho** nas linhas da estimativa ("If YES wins…", "If NO wins…") e na folha antes de
    assinar.
  - **A folha "Check before you sign" mais leve.** À vista ficam o lado e o valor, o que volta se esse lado ganhar e
    o total que sai da carteira, com o aviso do travamento, o de uma entrada grande e, na primeira entrada, o de que
    as entradas são públicas. As notas ficam em "Read before you enter"; as travas do programa, os aluguéis, a taxa, a
    rede e o resumo lido dos bytes da transação ficam em "Transaction details".
  - **O balão do Baked no celular:** encaixado na tela de novo sempre que o Baked se move enquanto fala. Antes, um
    toque no meio de um pulo podia deixá-lo cortado na borda; o defeito é anterior e o desenho novo o expôs.

- **Sprint 19: a caixa de abertura em `/abrir`; qualquer carteira abre uma campanha pelo site** (branch
  `sprint-19-site-open-campaign`, 10/10/2026; `docs/sprints/sprint-19-site-open-campaign.md`; mesclada na `main` pelo
  PR #68 em 11/10/2026, a pedido do Ronaldo, com a tag `sprint-19`).
  - **A caixa** (`app/features/open-campaign/`), como o desenho aprovado da Sprint -1: 1 O quê (a busca nos modelos e
    nos nomes conhecidos, que nunca sai do navegador, e os cinco tipos), 2 Detalhes (a frase se preenchendo e os campos:
    o feed da Pyth com o estado lido na hora, a direção, a conta conferida pelas regras do leitor, o alvo, a época, o
    prazo), 3 Prévia (fixa ao lado no computador) e 4 Custo; no celular, uma barra embaixo com o total e o botão.
  - **A frase vem do modelo v1 de cada tipo** (`app/features/campaigns/sentence.ts`), a mesma função de todas as
    páginas: o que quem abre lê é o que o cartão e a página mostram. Queima e trava dizem a unidade bruta ("raw units",
    "liquidity units"); pool e stake, a época medida.
  - **A cotação** é a do SDK, ao preço da Pyth menos a faixa de confiança, com o 90/10 e o `max_lamports` 1% acima
    (a margem do desenho aprovado), calculada só a partir do valor, desde a primeira tela; sem preço fresco, "Not priced
    yet". Tudo em lamports exatos. O exemplo de referência do plano virou teste.
  - **Cada recusa das linhas 1 a 10 tem a sua mensagem** (`copy-refusals.ts`), e 21 casos recusados e 4 aceitos passam
    pela caixa e, com os mesmos argumentos, direto pelo programa no LiteSVM, que dá o mesmo veredito (A-10), em todos os
    tipos que abrem; os demais erros com linha ficam nos testes de paridade do SDK da Sprint 05.
  - **A guarda de nova tentativa (T17):** o id da campanha é sorteado uma vez e guardado no navegador quando "Sign in
    wallet" entrega a transação, nunca antes; toda reconstrução usa o mesmo id, então uma segunda tentativa falha na
    conta que já existe em vez de cobrar a abertura de novo. Sem tentativa em andamento, antes de uma abertura paga a
    caixa procura nas transações recentes da própria carteira, da mais nova para a mais antiga, uma campanha aberta na
    última meia hora e a oferece primeiro; quando não acha e não conseguiu ler tudo, diz que não sabe e quem abre
    escolhe.
  - **Antes de assinar,** "Check before you sign" mostra cada argumento, escrito só a partir da escolha preparada, e o
    resumo do SDK dos bytes que a carteira recebe (A-3), com os avisos: devnet e SOL de teste, para onde vai o prêmio,
    o que o devnet não envia sozinho, que a abertura não volta atrás, a regra sem entrada, que abrir é público e
    permanente, os 18 anos. Um link preenche os campos, nunca o valor, e nunca assina. A chave da equipe abre de graça,
    sem prêmio e sem a parte do criador, e não lê os avisos do prêmio.
  - **O teste na web** ganhou a abertura paga (o valor guardado pelo programa é a cotação da caixa) e a da equipe, nas
    duas larguras, e, no computador, três recusas e a guarda (resposta perdida num recarregamento, tentativa expirada
    refeita no mesmo id, armazenamento apagado, carteira que nunca responde).
  - **Também:** a página de taxas aponta para a caixa e diz "US$500 or more", a faixa de confiança e o teto de 1%;
    `scripts/team/check-opening.ts`, só leitura, confere uma abertura contra a fórmula (os passos no
    `deploy/devnet/README.md`); a lista de conferência dos navegadores das carteiras (X2.2) passa a existir, com a
    abertura; a página de privacidade diz quando o registro da caixa é escrito e apagado e o que o serviço de RPC vê; o
    resumo do SDK diz que a parte do criador é "1% of the entries".
  - **As revisões de texto, jurídica e adversária, aplicadas:** os itens obrigatórios e os altos (a folha escrita a
    partir do rascunho, a busca das aberturas recentes que falhava aberta, o "Free (team key)" para quem paga, a chave
    da equipe lendo sobre prêmio, os alvos sem unidade, "Row 7:" na tela, o valor vindo do link) e a maior parte dos
    recomendados. Ao corrigir, apareceram três defeitos, corrigidos com teste: um alvo com letras derrubava a caixa,
    uma data digitada antes da hora se perdia, e um feed que a Pyth deixou de verificar mostrava "Reading the feed's
    price…" para sempre. O coordenador aprovou com condições, todas aplicadas, e o teste que ele pediu para a limpeza
    de um dia achou um quarto defeito, mais antigo: um registro ilegível no navegador parava a limpeza de todos os
    outros, das aberturas e das entradas. A página da campanha passou a mostrar a unidade dos números de queima e
    trava; o resumo do SDK diz "creation rules". O relatório jurídico ficou guardado para o advogado
    (`docs/legal/2026-10-10-sprint-19-legal-review.md`). O que ficou para depois está no plano técnico, §7.5; as nove
    perguntas de privacidade, no §8.3.
  - **Esperando:** a abertura no devnet e a da equipe à mão (escrita no devnet é do fundador); os celulares reais; o
    preço em US$ do CoinGecko (`/api/v1/price`), os nomes da API, o relay `/rpc` e o bloqueio por país, o
    `content/partners.json` e o cartão de compartilhar, que são de outras sprints.

- **As respostas às seis perguntas da Sprint 19** (11/10/2026, Ronaldo): 1a, 2a, 3a, 4a e 6a, todas como recomendado;
  o item 5, os celulares, ele faz à mão. O banner do topo passa a dizer "We are in a test phase. Here you join and open
  campaigns with test SOL, which has no real value." (6a). A abertura no devnet fica para depois da mescla (1a) e a
  landing com a privacidade nova sobe antes de `/abrir` ficar público (2a), as duas com o fundador. O
  `content/powers.md` teve a aprovação do Ronaldo como segundo revisor; como a mudança foi feita a pedido dele, a regra
  de duas pessoas do `content/` ainda pede a revisão do Lucas ou do Bernardo.

- **Sprint 13: o ranking, os avisos e o texto, que fecham o MVP no devnet** (branch `sprint-13-site-notices-copy`,
  10/10/2026; `docs/sprints/sprint-13-site-notices-copy.md`).
  - **`/leaderboard`, o ranking de pontos do devnet:** 1 ponto por campanha em que a carteira entrou no lado que
    venceu, quando o resultado fica final (a janela de 6 horas acabou sem contestação, ou a campanha está liquidando);
    anulação e entrada tardia não pontuam; o tamanho da entrada nunca conta. A regra está no SDK (`pointsTable`). Os
    números vêm da rota nova `/api/v1/leaderboard` da API de leitura, que lê o histórico do próprio programa. A página
    não manda a carteira de quem visita: acha a linha dela no navegador. **No devnet, a página só funciona depois que o
    fundador reimplantar a API no servidor.**
  - **`/fees`, a página de taxas:** o exemplo da P1 §1.2 em SOL, calculado pela conta do programa no SDK (6 e 4 SOL:
    taxa 0,4, criador 0,1, vencedores 9,5, 1,583 por 1; com prêmio de 4,5 SOL, 14 e 2,333), o pote de um lado só, a
    anulação, o 90/10 da abertura e a política de devolução.
  - **A tabela de quem pode o quê em `/record`** (`content/powers.md`): cada chave por papel e endereço, nunca por
    pessoa, e o limite de cada poder no código, inclusive que no devnet a chave de upgrade troca o programa a qualquer
    hora. A página confere as chaves na rede e avisa quando a tabela ficou velha.
  - **`/how-it-works`**, com os seis passos, aberto pela barra do topo também no celular, e a frase do BP-5 ("No human
    picks the winner.") como recomendada.
  - **"Report this campaign" em toda página de campanha**, link simples para https://x.com/brotmarkets; o remédio é
    tirar a campanha da página inicial (`content/unlisted.json`, revisado por duas pessoas); ela continua na rede, com as
    entradas, o resultado e os pagamentos iguais.
  - **Os avisos obrigatórios** numa lista com a tela de cada um, e um teste que renderiza as telas. O teste de texto
    passou a barrar as frases da coluna "Em vez de" da P1 §4.6 e as promessas (retorno, rendimento, pagamento
    automático) em todo arquivo do site.
  - **O PWA só com manifesto e ícones,** sem service worker.
  - **`scripts/team/resolution-post.ts`:** o texto do post de resolução, a partir de um modelo, para uma pessoa postar;
    sem API do X.
  - **O balão do mascote não corta mais na borda da tela.**
  - Testes: a regra dos pontos; a rota do ranking em ciclos inteiros no LiteSVM; o exemplo de taxas contra a conta do
    SDK; cada aviso na sua tela; a tabela de poderes; o link de denúncia e a lista de despublicadas; o manifesto; o post
    de resolução; e o cenário "site pages and notices" no smoke web, que passou inteiro com o site no Node e no Bun 1.4.2.
- **A revisão de privacidade do ranking e do canal de denúncia** (gate 5; plano técnico, §8.2), com o que o Cloudflare
  registra de quem visita, lido nas páginas do Cloudflare (`knowledge-base/tecnologia/cloudflare-logs-visitantes.md`).
- **As revisões da Sprint 13 aplicadas** (texto, jurídica e adversarial; nenhum achado crítico): a regra de
  viabilidade na página de taxas, em "How it works" e no aviso antes de assinar; a estimativa do painel, da folha de
  revisão e dos cartões passou a mostrar o que o programa pagaria (num pote pago com 1 SOL no SIM e 0,01 no NÃO, a tela
  mostrava cerca de 5 por 1; o programa devolveria 0,99); o ranking sem taxa de acerto, com o caminho para sair dele
  (pedido no X, mensagem assinada, lista no servidor); os pontos sem os furos do SIM de preço antes do tally, do id de
  campanha reaberto e da ordem dentro do slot; o leitor do histórico em laço próprio e com prazo; a tabela de poderes
  com a causa da anulação e os tetos; o post de resolução que cabe em 280 com id real; e o CI rodando os testes do
  próprio site. O que ficou para depois está no plano técnico, §7.4. O relatório jurídico ficou guardado para o
  advogado (`docs/legal/2026-10-10-sprint-13-legal-review.md`), e o coordenador aprovou com ressalvas, aplicadas.
- **Para o fundador, achados fora da sprint:** as páginas `/terms` e `/privacy` no ar ainda falam em USDC e pagamento
  automático em até 55 horas; e entrar nos dois lados de uma campanha paga em que ninguém mais entra leva o prêmio sem
  risco (plano técnico, §13).
- **O modo foguete do deck em `/pitch`** (10/10/2026, pedido do fundador e publicado com o de acordo dele: "pode
  subir online, excelente"). Um botão de foguete na barra do deck (tecla R, ou `?motion=rocket`) liga um quarto modo:
  todas as animações do modo completo e, nos dois slides de mercado, as nove imagens novas no lugar do pãozinho a pé.
  No slide 4 ele entra na lambo e sobe o gráfico de junho a setembro; no 5 sai dela, põe o capacete e segue de foguete
  a linha do cenário até bater na lua, e só então aparece o "$1B+ a month". Os modos completo, mais leve e sem
  movimento não mudaram, nem o gráfico, os números e as frases. As imagens novas só são baixadas por quem liga o modo.
  O modo inteiro está em `services/landing/public/pitch/moon.js`; o porquê de cada escolha, em
  `session-log/2026-10-10-pitch-modo-foguete.md`. **Fica com o fundador:** se o modo vai ao vídeo do Colosseum,
  já que lambo e lua são os memes de "ficar rico" e o guia de marca pede piadas que não convidem a pôr dinheiro.

- **Sprint 12: minhas entradas e os estados da campanha** (branch `sprint-12-site-my-entries-states`, 10/10/2026;
  `docs/sprints/sprint-12-site-my-entries-states.md`). A página `/c/[id]` mostra cada estado público: entradas
  fechadas e por quê, em revisão (o resultado lido, o valor, a meta, a conta lida e o relógio das 6 horas),
  contestada (L-04: "Contested"), paga (a divisão, o pote de um lado só com a taxa de 1% para todos menos o primeiro, e a
  campanha sem nenhuma entrada) e anulada (o motivo público, a nota da equipe quando o hash bate com o da rede, o que
  volta para quem abriu e se os 10% da abertura voltam ou ficam). Em toda campanha já lida ela diz onde reportar um
  resultado errado (L-13: https://x.com/brotmarkets). A carteira conectada vê o que a entrada rende (estimativa), o que
  espera pagamento (exato, ao lamport) e o que recebeu.
- **`/my-entries`**: as entradas da carteira, o total recebido (somado só dos eventos de liquidação) e o que espera
  pagamento. Como a API ainda não tem a rota da carteira, o histórico é lido da própria rede (as transações da carteira,
  50 por vez, com "Read older transactions").
- **"Receive"**, o único resgate do site: só para a parte de 1% do criador que o programa guardou no cofre porque a
  carteira estava vazia. O SDK prepara (`prepareClaim`, com a checagem A-8 antes de tudo); a carteira precisa do mínimo
  de aluguel mais a taxa de rede.
- **`/record`**: o registro público dos anulamentos da equipe, de `content/void-log/`, com o formato público em zod e o
  JSON Schema gerado (`content/void-log/record.schema.json`), checado no CI.
- **No devnet nada paga sozinho ainda:** pela decisão do fundador, a tela diz "Waiting for payout" e não promete hora;
  isso substitui "Pago sozinho, ao fim da janela de 6 horas" no devnet. O cartão da lista deixou de dizer "pays <hora>".
- **O ensaio das cinco campanhas no devnet** (`deploy/devnet/rehearsal-sprint-12.md`), com dois scripts novos:
  `scripts/rehearsal/open-paid.ts` (abertura paga por carteira fora da equipe) e `scripts/rehearsal/settle.ts` (a
  liquidação passo a passo). As escritas no devnet são do fundador.
- Testes: ciclos inteiros no LiteSVM conferidos contra os eventos e contra o SOL que chegou a cada carteira; um caso por
  estado; o caminho da reserva de ponta a ponta; o formato do void log; os scripts do ensaio; e o cenário "campaign
  states" no smoke web (14 passaram).
- **As respostas do fundador às quatro perguntas da Sprint 12** (10/10/2026): 1a, o texto da campanha sem nenhuma
  entrada aprovado como estava (e a consequência: num anulamento por falha da casa sem entrada, a Brot fica com os
  10%, como o programa faz); 2a, o aviso L-03 no devnet passa a dizer "Payouts go to your wallet after the result is
  read; on devnet that is not automatic yet, and no time is promised."; 3a, o chip diz "Result final" enquanto o
  pagamento espera e "Paid" depois que as entradas foram pagas. A assinatura da Phantom da Sprint 11 não está à mão:
  a entrada segue relatada, não verificada, sem travar nada. O ensaio no devnet fica com o fundador.
- **As revisões da sprint aplicadas:** a de texto (nenhuma tela promete pagamento automático ou hora, nem o recibo da
  Sprint 11; a equipe só confirma um resultado, nunca anula um SIM ou NÃO) e a de segurança (a parte reservada que o
  fechamento paga conta como recebida; o histórico não esconde lacuna; a estimativa antes do tally). O aviso L-03 e o
  chip "Paid" esperam o fundador.

### Changed

- **O `/dev0x` mostra "brot.markets" inteiro no celular** (19/10/2026, pedido do Ronaldo). Abaixo de 700 px a barra
  do topo escondia o ".markets", regra que veio do protótipo para a barra não quebrar. Agora o nome e o pão encolhem
  com a largura (24px a partir de 412 px, cerca de 20px em 390, 15,6px em 360), e a busca, o "Connect" e o menu ficam
  como estavam; medido sem transbordar em 360, 375, 390, 412 e 700 px. No mesmo dia a lupa saiu da barra abaixo de
  700 px (o celular e a meia tela): ela só abria o menu, que já traz a busca. Com o espaço livre, o nome e o pão
  voltaram ao tamanho cheio (24px e 44 px; 23,4px em 360). Acima de 700 px a barra de busca continua no topo.

- **A lista de espera da landing avisa do lançamento na mainnet** (19/10/2026, pedido do Ronaldo). O rótulo do campo
  passou de "Get an email when campaigns open on devnet" a "Get an email when Brot Markets launches on mainnet", e a
  confirmação diz o mesmo, na página inicial e em `/2`, que repete o texto. A frase de consentimento ("to tell you when
  Brot Markets opens") e a privacidade ("again when they open with real money") já cobriam esse aviso, então o
  `CONSENT_VERSION` não mudou.

- **O modo claro da landing nas cores do `/dev0x`** (19/10/2026, pedido do Ronaldo). O tema claro de
  `services/landing/public/styles.css` trocou o cinza-azulado e o azul pelo creme e a ferrugem do site
  (`app/styles/tokens.css`, BRAND.md §5.1): fundo `#f6eddb`, painel `#fffaf0`, destaque e botão `#a8481b`, laranja só
  nos preenchimentos, e o SIM e o NÃO nos mesmos verdes e vermelhos de lá. Vale para a página inicial, a privacidade e
  o 404, que dividem a folha. `/2` tem estilos próprios e não mudou. Publicada, a troca não aparecia para quem já
  tinha aberto a página: o Cloudflare manda os navegadores guardarem o CSS por 4 horas, apesar do `no-cache` do
  servidor. O link passou a `styles.css?v=4`, e o README da landing diz para subir o `?v=` a cada mudança de CSS ou JS.
- **O modo escuro da landing nas cores do `/dev0x`, e a luz do ponteiro azulada no escuro** (19/10/2026, pedido do
  Ronaldo). O escuro da landing passou do azul ao azul-marinho com o laranja e o texto creme do site, menos os
  pontinhos do fundo, que ficam no azulado de antes (`--dot-rgb: 150, 175, 235`). No `/dev0x`, no escuro, os dois
  efeitos que seguem o ponteiro voltam ao azul de antes de 10/10: o brilho dos cartões (o token novo `--glow` e o
  `--spot-edge`) e os pontinhos que acendem perto dele. O `--spot`, a cor de uma opção escolhida, continua laranja, e
  o modo claro não muda.

- **O último desenho do modo foguete do deck** (11/10/2026, pedido do fundador). No fim do slide 5 o mascote passa a
  bater na lua rindo, no lugar do rosto em pânico. O desenho novo tem o mesmo enquadramento do anterior, então o
  tamanho, o ponto de apoio, o ângulo e a lua que espera na borda do slide não mudaram. O arquivo ganhou outro nome
  (`28-batendo-na-lua-feliz.webp`) para nenhum navegador mostrar o antigo guardado. O quadro anterior à batida
  continua sendo o do foguete em pânico.
- **Sprint 19: a frase das campanhas de queima, trava e stake** (10/10/2026). O cartão e a página dessas campanhas
  diziam só o tipo e o endereço ("Burn campaign So11…1112"); agora dizem a frase do modelo v1, com o alvo e a unidade
  ("So11…1112 supply falls to 1,000 raw units"; "Stake pool … holds at least … SOL at the start of epoch 812"). A frase
  de preço não mudou. **A privacidade** diz quando o navegador guarda o registro de uma abertura e quando o apaga, o que
  o serviço de RPC vê (o saldo, a transação testada antes de assinar e o andamento dela, as transações recentes antes de
  uma abertura paga, as contas conferidas na caixa) e que apagar os dados do site apaga as notas do navegador; a página
  no ar só muda quando o fundador publicar a landing.
- **O site novo nas cores da marca** (10/10/2026, pedido do Ronaldo; branch `feat/apply-deck-ui`). As cores do
  `BRAND.md` §5, tiradas da página `/5` que o Lucas aprovou (branch `feat/site-3-original-com-cores-do-deck`), entram
  em `app/styles/tokens.css`: azul-marinho e laranja no escuro, creme e ferrugem no claro, nenhum azul. O escuro segue
  como tema de abertura. Duas cores ficam diferentes da marca de propósito (o `--raised` do escuro, um passo acima do
  painel, e o fundo das caixas de informação no escuro, que na marca é o mesmo verde do YES), e as que a marca não
  define (estados, tipos, barras, aviso, borda de campo) saem da mesma paleta. Todo texto passa de 4,5 e toda borda de
  campo e barra de 3, nos dois temas; um teste novo (`tests/site/tokens.test.ts`) recalcula a leitura, barra o azul de
  volta e confere as cores da marca. A troca mostrou dois defeitos, corrigidos: o anel do botão principal nunca
  aparecia, e o botão principal desligado ficava com o texto invisível no escuro. O manifesto e os ícones do PWA foram
  para o novo fundo escuro. O `DESIGN-DIRECTION.md` e o `BRAND.md` registram a troca. Nenhum texto mudou.
- **Os detalhes do fundador na privacidade, a linha de 18 anos e o docs.brot.markets fora do ar** (10/10/2026, depois
  da mescla do PR #65; branch `fix/privacy-details-docs-down`). A privacidade passa a dar o contato gm@brot.markets,
  dizer que os backups da Hostinger guardam o arquivo da lista por até 30 dias e que a Cloudflare guarda os registros
  básicos de acesso por até 7 dias, prometer resposta em até 15 dias para todo pedido e apagar a conversa no X depois
  de atender um pedido de saída do ranking. O rodapé do site novo ganhou "Brot Markets is for adults, 18 and over.",
  que antes só os termos diziam. O docs.brot.markets, que também descrevia o produto anterior, responde 410 em todo
  endereço até a documentação ser reescrita; as páginas continuam no repositório. **Fica com o fundador:** o
  roteamento do email gm@brot.markets (hoje o domínio não tem registro de email) antes de publicar a landing, e depois o
  post no X e a nova API.
- **As páginas legais, pela resposta 9a do fundador** (10/10/2026; branch `fix/legal-pages-9a`): os termos saem do ar
  até a Sprint 17, porque descreviam o produto anterior (USDC, pagamento automático em até 55 horas, outros poderes da
  equipe). O `/terms` deixa de ser gerado e responde 404, e nenhuma página da landing nem do docs.brot.markets aponta
  mais para ele. A privacidade foi corrigida para o produto de hoje: campanhas em vez de mercados, o ranking do devnet
  (o que mostra, que é calculado em memória, como sair dele e o prazo de 15 dias), o que o site novo guarda no
  navegador, o serviço de RPC que vê a carteira e o IP, e o X como canal. A frase de propósito da lista de espera ficou
  como as pessoas consentiram, e o formulário para sair dela continua. O rodapé do site novo passou a linkar a
  privacidade, e a frase antes da primeira entrada diz que uma carteira do lado vencedor "pode" aparecer no ranking.
  Uma revisão jurídica do texto achou duas promessas antigas que não eram verdade: o IP "por um minuto" ficava na
  memória até o serviço reiniciar (agora o servidor varre os endereços vencidos a cada 10 segundos) e o "sem cópia de
  backup" não estava conferido (a página agora diz que o provedor pode guardar backups do servidor por um tempo
  limitado). **Fica com o fundador:** publicar a landing antes de a API do ranking ir ao ar e, como a própria página
  promete, avisar a mudança no X; e conferir no painel da Hostinger se os backups do servidor estão ligados.
- **A regra de pontos do ranking, pela resposta 3a do fundador** (10/10/2026, depois da mescla da Sprint 13; branch
  `sprint-13-founder-answers`): deixam de pontuar a carteira com entradas nos dois lados de uma campanha
  (`BOTH_SIDES_SCORE` agora é falso), o pote devolvido por ter um lado só ou um lado perdedor pequeno demais para pagar
  as taxas, e a carteira que abriu uma campanha de queima, trava ou stake, cujo resultado quem abriu pode controlar. As
  outras carteiras de quem abriu não têm como ser reconhecidas na rede e continuam pontuando; a página diz isso, e diz
  também que um pedido para sair do ranking é respondido em até 15 dias (resposta 8a). A API de leitura passa a dizer,
  para cada campanha viva, se o pote vai ser devolvido (pela conta do programa no SDK), quem a abriu e de que tipo ela
  é. Testes novos: a regra (`tests/sdk/points-3a.test.ts`), a rota (`services/api/tests/leaderboard-pot.test.ts`) e um
  ciclo inteiro no LiteSVM com pote de um lado só. Mudou antes de a API ir ao ar no devnet, então nenhum ranking
  publicado é reescrito.
- **As respostas do fundador às doze perguntas da Sprint 13 registradas** no documento da sprint, no roteiro, no plano
  técnico (v0.1.6: §3.4.7, §3.5, §3.6, §7.4, §8.2, §13, §14.2) e no log da sessão. Quem guarda o login da conta do X é
  o CTO, com aplicativo autenticador como segundo fator. Ficam pendentes: as páginas `/terms` (sair do ar até a Sprint
  17) e `/privacy` (corrigir e linkar no rodapé do site), que o fundador publica (resposta 9a); o relatório do parceiro,
  da Sprint 08 (L-24 respondida); e a regra contra a colheita de prêmio, antes da mainnet (resposta 12a).
- **Sprint 13:** o cartão da lista usava outra redação do aviso do criador; agora usa a da página. O filtro de dado
  pessoal do void log recusa também domínio solto e "@x" / "[@x]", e o site falha o build se não achar `content/`
  (os dois achados que a Sprint 12 deixou para esta). Os dois avisos de toda tela foram para um arquivo de texto
  (`app/components/copy-site.ts`), que o teste de vocabulário lê. O plano técnico foi para a v0.1.5.
- **Sprint 12 mesclada** (PR #61, tag `sprint-12`, 10/10/2026); o ensaio das cinco campanhas no devnet segue com o
  fundador.

- **Sprint 11 fechada e mesclada** (branch `sprint-11-site-campaign-entry`, PR #60, 10/10/2026, a pedido do Ronaldo,
  com a tag `sprint-11`; `docs/sprints/sprint-11-site-campaign-entry.md`). O Ronaldo relatou o teste com a Phantom no
  devnet: uma entrada de 0,01 SOL, assinada, com a página reagindo como esperado. **A transação não aparece no
  devnet:** conferido no mesmo dia, só por leitura e por duas RPCs, a última transação do programa é uma abertura de
  campanha às 04:48 UTC, antes de existir o código da entrada no site, e nenhuma entrada chegou depois disso. A página
  só diz "You're in" quando a RPC dela confirma a assinatura; o mais provável é que o teste tenha passado por outra
  RPC, outro cluster ou outro programa (inferência, não conferida). O programa não foi atualizado nesse meio-tempo
  (ProgramData ainda no slot 509.389.614). Falta a assinatura da transação, que fica na atividade da Phantom, para
  registrar a entrada assinada com carteira real; até lá ela segue em aberto.

### Added

- **A-8: a assinatura pausa quando o programa é atualizado** (Sprint 11, 10/10/2026, pela resposta do fundador): o SDK
  lê o slot do último deploy do programa na conta ProgramData (só os 45 primeiros bytes, com o dono conferido antes)
  pela RPC do site, a pública do devnet, até o relay `/rpc` existir; `prepareJoin` e `prepareOpenCampaign` recebem o
  slot esperado e param antes de tudo quando ele mudou. O build do site grava o slot (hoje 509.389.614); o painel
  confere na revisão e de novo logo antes da carteira. Se não bate, nada é assinado, a mensagem diz que o programa foi
  atualizado e a página recarrega depois de 5 s, 30 s, 2 min e então 10 min. Por isso o site precisa ser construído de
  novo depois de cada atualização do programa (`deploy/devnet/README.md`, passo 5).
- **O piso que o baker assina fica 1% abaixo da estimativa no devnet** (resposta do fundador, 10/10/2026), agora
  passado de forma explícita pelo `submit.ts`.
- Testes: 2 no SDK, 2 no site (41 em `tests/site`) e 2 cenários novos no smoke web (12 passaram). A leitura do
  ProgramData entrou na lista do relay (`docs/technical/relay-allowlist.md`).

### Added

- **A página da campanha e a entrada pelo site** (Sprint 11, 10/10/2026): `/c/[id]` mostra a frase, a regra de cada
  tipo, a prova lida agora pelo leitor do SDK (com "se lido agora"), os campos de preço (preço, confiança, idade máxima
  da campanha, o aviso sem preço fresco e o da margem de 1%), o pote, as entradas recentes e o histórico da chance (L-23,
  lidos dos eventos na rede), o painel de reconferência com comandos nos bytes que o leitor lê e o `recheck` do SDK, e o
  aviso do criador com a entrada da carteira dele. O painel de entrada: SIM ou NÃO, o valor exato em lamports, a
  estimativa que é a do `checkJoin` do SDK (P1 §3.2 reproduzida: 3,10 e 3,067), os avisos antes da assinatura (o L-03 do
  fundador), a revisão com o resumo determinístico do SDK (A-3), a carteira, o acompanhamento por consulta sem
  WebSocket, a guarda de nova tentativa (A-9) e uma mensagem por falha. 38 testes em `tests/site`.
- **O smoke web** (`bun run e2e`, Playwright 1.63.0 fixado): o site com uma carteira de teste injetada contra o
  programa em LiteSVM, em desktop e 412 px; 10 passaram. Achou e corrigiu dois erros: "Use Installed Wallet" não
  conectava depois de recarregar a página (código da Sprint 09), e a guarda dava como feita uma entrada que falhou
  quando outra entrada da mesma carteira mudava o total.
- **Revisões da sprint aplicadas:** a de texto ("est." em todo número estimado, o piso que não soa como promessa, uma
  saída para cada falha, regras por tipo iguais às do programa) e a de segurança do que o baker assina: o registro da
  guarda fica também na memória da página e pertence a uma tentativa; nenhuma tentativa nova enquanto outra está em
  aberto ("Check again"); status só confirmado; erro atribuído ao programa só quando a instrução dele falhou; prazo e
  validade medidos em blocos; o build recusa uma URL de RPC com chave; o registro da guarda sai do navegador um dia
  depois de resolvido. O interruptor de entradas (K-11) ainda usa a saúde da API no lugar do `entries_allowed`.
- **A lista do relay `/rpc` tirada do rastro do cliente** (`docs/technical/relay-allowlist.md`): 11 métodos, nenhum
  WebSocket. O relay em si é da Sprint 08.
- Em aberto: a assinatura no devnet com carteira real não foi verificada (a preparação e a simulação no devnet foram);
  o fundador fará o teste com a Phantom. A A-8 foi construída no mesmo dia (acima).

### Added

- **O texto do aviso de dinheiro preso (L-03) aprovado pelo fundador** (10/10/2026): "Your entry stays locked until the
  campaign ends. You cannot take it out before then. Payouts go to your wallet automatically after the result is read."
  Ele aparece na Sprint 11, antes da assinatura.

### Added

- **A lista de campanhas no site** (Sprint 10, 10/10/2026): a página inicial lista as campanhas da API de leitura, com
  busca, filtros de estado e de tipo, ordenação, o interruptor de não listadas e "Salvas" no navegador. Cada cartão mostra
  a frase, o pote em SOL, a chance por lado (nenhuma com pote vazio), o retorno estimado pela matemática do SDK e as datas.
  O preço em US$, a barra de prova, o cartão de compartilhar e o selo do parceiro ficam para depois (ver a sprint).
- **O guia de marca no repositório** (`docs/product/BRAND.md`, aprovado pelo Lucas em nome dos fundadores). O rodapé e
  as falas do mascote do site seguem o guia.

### Added

- **Sprint 09 fechada para o hackathon** (10/10/2026): o site usa `@brot/sdk` (leitura e transação) por `app/lib/brot.ts`;
  o nome é Brot Markets; o `.env.example` da raiz lista as variáveis de cada parte. Servidor e testes em celular ficam
  para o fim do hackathon, por decisão do fundador. Ver `docs/sprints/sprint-09-site-shell.md`.

### Added

- **Sprint -1 fechada** pela aprovação do fundador: tema escuro oficial, inglês, avisos mínimos e os layouts de `/dev0x/`.
  Os itens de código da sprint vão para a Sprint 09.
- **Sprint 09, primeiro incremento:** o chat embutido foi removido (D-q), e o site envia cabeçalhos de segurança e uma
  Content-Security-Policy (X2.5). O restante da sprint segue aberto.

### Added

- **A revisão do pitch de 10/10/2026, organizada por slide**
  (`docs/business/_review/revisao-do-pitch-2026-10-10.md`), a pedido do Lucas, a partir da gravação da conversa depois
  da apresentação (9 minutos; a transcrição bruta está em `knowledge-base/pitch/2026-10-10-revisao-voz-bruta.md`). Duas
  vozes de fora da equipe, sem nome confirmado. As duas ideias grandes: uma cena só, com o demo rodando e o texto
  mudando, no lugar dos slides 2, 3, 5 e 6; e um gráfico de crescimento em dois passos no lugar das bolinhas de TAM,
  SAM e SOM. O documento propõe um deck de cinco slides e separa o que não tem fonte: a série mensal do World cai 30%
  em setembro, "90% ao mês" e a projeção de dois anos não estão na pesquisa, e a comparação com a Collector Crypt não
  foi conferida. **Nada foi mudado no deck.** Ficam oito decisões com o fundador (seção 6 do documento).
- **O deck v5.1 em `/pitch`** (`services/landing/public/pitch/`, 10/10/2026), a pedido do fundador ("subir e deployar
  para o lugar do /pitch no site"). O v4 foi para `services/landing/history/pitch-4/`, com o roteiro dele, e o
  endereço `/pitch5`, que serviu de prévia durante o dia, redireciona para `/pitch/`. O roteiro de fala novo, em
  português e em inglês, com o corte de 2 minutos para o vídeo do Colosseum, está em
  `docs/business/roteiro-pitch-v5.md`; o porquê de cada escolha, em
  `session-log/2026-10-10-pitch-v5-revisao-e-publicacao.md`. O que segue descreve o caminho: a versão 5 nasceu como
  prévia em `/pitch5`, com o que o fundador decidiu depois da revisão acima (seção 8 do documento). O demo do slide de solução toca quatro exemplos em sequência, com o texto
  da esquerda trocando no terceiro (os 10% do lado perdedor) e no quarto (o 1% de quem abriu) e um saldo que soma os
  quatro; o slide "How we earn" saiu; o de mercado virou dois, as barras de 13 vezes e a projeção de dois anos, para
  a qual o slide gira. O servidor deixa de redirecionar `/pitch5` para `/pitch` (`server.mjs`), e o teste confere
  isso. O `/pitch` no ar não mudou. **Três pendências:** a prévia diz que o 1% sai da nossa taxa (30, 10 e 960), como
  o fundador pediu, e o programa tira do pote (40, 10 e 950); o "$1B+ a month" da projeção é número provisório, sem
  fonte; e a versão parada do deck, que vira o PDF, não mostra a taxa nem o 1%. **Versão 5.1, no mesmo dia:** o demo
  passou para SOL e toca a 0,8 da velocidade; os dois slides de mercado dividem um gráfico só (`pitch/chart.js`), com
  o mascote correndo de junho a setembro de 2026 mês a mês e, na troca de slide, subindo enquanto o gráfico se afasta
  até outubro de 2028, com o cenário em linha pontilhada; a linha do site e do X foi para o pé da capa; e o slide "Open
  a market" saiu, então a prévia tem oito slides e não diz mais quanto custa abrir um mercado.
- **A API de leitura para o site** (`services/api`, Sprint 08 no mínimo, 10/10/2026): `/api/v1/campaigns` lista as
  campanhas por estado (ativas, resolvidas) com paginação, `/api/v1/campaigns/:address` mostra uma, e `/api/v1/health`
  diz se o snapshot está em dia. Lê a cadeia a cada 15 s e serve da memória. Ainda sem endereço público: aguarda a
  decisão de hospedagem. Ver `services/api/README.md`.
- **Sprint 06 fechada** pelo fundador, sem a resolução real observada (`docs/sprints/sprint-06-keeper-server.md`).
- **Sprint 07 fechada para o hackathon** (10/10/2026): o primário roda a release `cc87637` no servidor, com
  `POST /restart` assinado (HMAC) ativo e `ReadWritePaths` na unidade. O modo standby, o segundo VM, a RPC B, o e-mail
  e o teste de queda em devnet ficam para depois do hackathon (D4). A unidade `path` de reinício não foi instalada, por
  decisão do fundador. Itens não construídos têm destino no documento da sprint.

- **O keeper em modo standby** (`services/keeper`, Sprint 07, 10/10/2026): `KEEPER_MODE=standby` não envia enquanto o
  primário responde; a regra está no envio, e não só no laço. O watchdog sonda o primário a cada 5 min, pede reinício
  assinado até 3 vezes e assume depois. A observação contínua de campanhas de preço e a segunda leitura (com fila de
  revisão) estão prontas. Os alertas saem só no diário até o fundador escolher o provedor de e-mail (D4). O primário
  ganha `POST /restart` com HMAC, ativo só com o segredo configurado. As unidades e os runbooks estão no repositório,
  sem instalação. A Sprint 07 segue aberta: a segunda VM, a RPC B, o e-mail e o teste de queda em devnet não foram feitos
  (`session-log/2026-10-10-sprint-07-standby-e-watchdog.md`).

- **O keeper, o caminho feliz do MVP** (`services/keeper`, 10/10/2026): a cada 60 s lista as campanhas abertas do
  programa no devnet, simula `resolve_campaign` em cada uma e envia só o que o programa aceita. Lê a URL do RPC de
  uma variável de ambiente (Helius, plano gratuito por enquanto). `GET /healthz` só em `127.0.0.1:4210`. Ainda não
  faz finalização, liquidação nem pagamento; nem o servidor, nem as unidades de sistema.
- **A checagem do Bun 1.4.2 no servidor passou** (10/10/2026): glibc 2.35, kernel 5.15, SSE4.2 e AVX2; o binário
  confere com o `SHASUMS256.txt` oficial (`deploy/vps/bun-1.4.2.sha256`). Instalado só na pasta do usuário `brot`.
- **A prévia das telas de campanha em `brot.markets/dev0x/`** (10/10/2026, pedido do Ronaldo): as telas da Sprint -1
  (`prototype-lab/campaigns/`, dados de mentira) para o time clicar antes da Sprint 06. Sem listagem: `noindex` no
  cabeçalho, nada aponta para lá, o `robots.txt` não muda. A CSP deixa o script de tema do protótipo por hash.
  `/dev0x` leva a `/dev0x/`. Testes em `services/landing/tests/dev0x.test.mjs`.

### Changed

- **O slide 4 do deck em `/pitch` diz só "world.xyz"** (10/10/2026, a pedido do fundador): saiu o trecho ", the
  prediction market inside the Phantom wallet". O slide 2 continua com "World, inside Phantom", e o roteiro de fala
  (`docs/business/roteiro-pitch-v5.md`) ainda explica quem é a world.xyz ao falar do gráfico.
- **O `README.md` passa a descrever o Brot Markets, em inglês** (10/10/2026, a pedido do Lucas: "reescrever o readme
  ... elementos degen e memeiro, misturando com a seriedade que o documento exige ... nossa autoria, nossa marca").
  Sai a descrição do `pred-provable`. Entram: o que é uma campanha, um exemplo com a conta fechada, os cinco tipos de
  leitura e o estado de cada um no devnet, o que as chaves da equipe e do admin podem fazer e o que ainda não está
  resolvido (programa atualizável por uma chave só, sem auditoria), o que está pronto e o que falta, como rodar, a
  origem no programa do Ronaldo e a equipe. Cada regra e número foi lido do código na `main` (`c3ba1ff`). O tom segue
  a voz do Baked: as piadas miram promessas, roteiros e oráculos, nenhuma convida a pôr dinheiro, e a palavra "bet"
  não aparece. O `CLAUDE.md` deixa de dizer que o README descreve o programa antigo. **Ficam com o fundador:** os
  nomes do Bernardo e do Ronaldo aparecem com cargo antes do de acordo escrito dos dois; a `LICENSE` segue em nome só
  do Ronaldo; o contato para falhas é o `@brotmarkets` no X, por falta de email do domínio; o `docs.brot.markets` não
  foi ligado, porque as páginas esperam aprovação; a tabela de estado tem data (10/10/2026) e envelhece.
- **A regra de viabilidade fica como está no código** (9/10/2026, à noite, Ronaldo): a taxa da Brot sai do lado
  perdedor e a parte do criador é calculada sobre o pote inteiro; as palavras anteriores ("taxas cobradas sobre o
  principal do lado vencedor") deixam de valer. Era a pergunta que a Sprint 04 deixou aberta antes da mescla
  (`docs/business/ideacao-perguntas-e-respostas.md`, seção 1).
- **Novo id do programa: `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o`** (9/10/2026, decisão do Ronaldo). O keypair
  do id anterior, `6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN`, não estava na máquina de quem faz o deploy no
  devnet; o id foi declarado no commit `ae8b837`, de 5/10, e ninguém sabia por onde o keypair tinha andado desde
  então. O novo keypair foi gerado na máquina do Ronaldo, fora de qualquer repositório. Mudam o `declare_id!`, a
  autoridade de eventos (`CmNehEdy55jRh7waxt2u5vbwLwe3jmRuZXv3AHi1qGwx`, bump 254 como antes), o IDL e o cliente
  Codama regenerados (`bun run idl`), e as constantes do kit de testes. O id antigo fica abandonado; nunca foi
  publicado em cluster nenhum. A mainnet terá um id próprio, mantido em segredo até o deploy.
- **Sprint 05 fechada e mesclada** (branch `sprint-05-sdk-devnet-cycle`, PR #43, tag `sprint-05`, aberta da cabeça do
  PR #41, que foi mesclado na `main` em 9/10; `docs/sprints/sprint-05-sdk-devnet-cycle.md`, "Record and retrospective"). O programa não mudou
  nesta sprint; mudou fora dela, pelos PRs #44 (`CampaignFinalized`) e #45 (o id novo), que a branch traz da `main`. O
  que entrou:
  - **O SDK, `@brot/sdk`** (antes `@brot-markets/sdk`), a biblioteca única de site, app, serviços, scripts e testes,
    com três entradas: `read` (endereços, decodificação de contas e eventos, a matemática do dinheiro, as regras de
    abertura e de entrada na ordem do programa, a cotação da abertura com o débito inteiro, o estado público pelo
    relógio da rede, `recheck`, uma mensagem por código de erro), `tx` (os 22 construtores, a simulação, o resumo
    determinístico e a preparação de uma entrada e de uma abertura antes da assinatura) e `schemas` (zod 4.6.5).
  - **T9 decidido:** o cliente gerado pelo Codama a partir do IDL do Shank é a camada de codecs e construtores.
  - **Conferido contra o programa:** os 24.000 vetores do Rust (12.000 da Sprint 04 e 12.000 novos, do snapshot com a
    regra de viabilidade, do pagamento por entrada, da estimativa e do calendário) passam sem nenhuma diferença; 37
    códigos de recusa da abertura dão o mesmo erro no SDK e no programa; os 22 construtores dão os mesmos bytes que o
    kit de testes; o decodificador recusa evento forjado, transação que falhou e duplicata, e lê evento em chamada
    aninhada e em tabela de endereços.
  - **React Native:** o SDK empacota com o Metro para Android e roda no Hermes, com os vetores sem diferença; o app vai
    precisar de `crypto.subtle.digest` e `crypto.getRandomValues`
    (`knowledge-base/tecnologia/sdk-react-native.md`). Novo trabalho de CI, "Mobile bundle", verde no PR #43 (os
    24.000 vetores sem diferença no Hermes).
  - **Regras de fronteira** (`bun run lint:sdk`, dentro de `bun run lint`): `read` não importa `tx`; nada de Node,
    React, Next, React Native, web3.js v1, Anchor nem zod em `read` e `tx`, que também não importam `schemas`; nenhum
    global de Node, Bun ou DOM. Um teste planta uma violação de cada regra numa cópia do SDK e exige que todas disparem.
  - **Dependências:** `@solana/kit` 8.4.0, zod 4.6.5 e dependency-cruiser 18.4.0, fixados.
  - **O kit de testes usa o SDK:** todo evento de todo teste passa pelo decodificador do SDK; os 7 eventos que o kit
    descreve à mão têm os campos conferidos, e os outros 11, da Sprint 04, o discriminador e o tamanho contra o
    código do programa; os fluxos comuns são montados pelos construtores do SDK.
  - **O programa está no devnet** (9/10/2026, 23h27; `deploy/devnet/README.md`):
    `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o`, do artefato do CI da `main` em `c20e79a` (execução 38014319993),
    com o `SHA256SUMS` e o IDL conferidos, o keypair só no id declarado, só o loader v3, e a inicialização e o time na
    mesma sessão. A chave de upgrade, o admin e o recebedor das taxas são a chave de devnet do Ronaldo, que respondeu as
    decisões do deploy na mesma noite; valores reais, não os de treino. Duas tentativas morreram escrevendo o buffer no
    RPC público; o deploy passou a reassinar por 50 rodadas, com uma taxa de prioridade pequena, e a terceira passou por
    um RPC com chave, mantida fora do repositório. **O smoke passou no devnet** logo depois: abertura paga, as duas
    entradas, a resolução, a confirmação da equipe com os dois eventos, os pagamentos, a taxa, o fechamento e a
    varredura, cada lamport igual ao do SDK, e as duas tentativas repetidas recusadas.
  - **O lote real de liquidação no devnet** (`bun run settle-batch:devnet`, script novo): doze `settle_entry` numa
    transação, doze eventos por self-CPI, cada pagamento igual ao do SDK; 33.630 CU (2.802 por entrada) e 1.152 dos
    1.232 bytes. **O seed** abriu três campanhas de exemplo da equipe, grátis, que ficam abertas para o site (BTC/USD
    acima, SOL/USD abaixo, uma queima). A virada de época no devnet vai para a Sprint 06.
  - **As leituras só de leitura no devnet** (9/10/2026, 22h, com a autorização do Ronaldo; nada enviado;
    `knowledge-base/tecnologia/devnet-o-que-so-o-cluster-mostra.md`, seção 5): o id do programa, o ProgramData dele e
    a config estão livres; os aluguéis (`Campaign` 3.251.200 lamports, `Entry` 1.239.520, `Join` 1.137.920); a conta
    SOL/USD atualizou a cada 61 a 63 segundos e chegou a 64 segundos de idade, contra os 120 do `max_price_age`; o
    relógio do devnet ficou dentro de cerca de um segundo da hora de parede.
  - **`smoke:devnet` e `seed:devnet` reescritos em SOL sobre o SDK** (o ciclo completo do smoke passa num cluster
    local, com todo valor igual ao do SDK e as duas tentativas repetidas recusadas); **`scripts/team/`**, um comando
    por ato da equipe, cada pessoa com a própria chave; o texto de cada anulação em `content/void-log/`.
  - **Os testes negativos num cluster local:** os 373 casos da matriz de slots, 50 recusas de regra e uma abertura
    paga igual à cotação do SDK, no Surfpool offline isolado da rede (o `solana-test-validator` precisa de AVX2, que
    esta máquina não tem).
  - **Três revisões (segurança do SDK, coordenação do registro, segurança do deploy), e o que mudou por causa delas:**
    o resumo antes da assinatura lê os bytes que a carteira assina, limita e põe teto na taxa de prioridade, só confia
    nas instruções do programa no formato do IDL e diz em palavras a campanha, o alvo na unidade do feed, quem cria, o
    preço abaixo do qual a abertura é recusada e os termos; uma entrada repetida com o total salvo é recusada em vez de
    dobrar; a simulação lê o formato que um nó de verdade devolve (antes não via evento nenhum); o `recheck` pagina e
    aguenta resposta malformada; os casos de recusa que faltavam passam nos dois lados, e as recusas da entrada também.
    O deploy ficou amarrado ao commit revisado e ao hash do binário, confere os endereços e os saldos antes de agir,
    retoma uma inicialização que não terminou, e recusa chave dentro de qualquer repositório Git; os scripts da equipe
    simulam sem assinar; o registro de anulação só vale depois que a rede confirma.
  - **Achados em aberto:** a confirmação e a anulação pela equipe não emitem o `CampaignFinalized` que o plano promete
    (correção do programa, antes do indexador); e qualquer pessoa pode impedir para sempre o deploy de um id de
    programa num cluster mandando cerca de 0,001 SOL ao endereço do ProgramData desse id (ensaiado no cluster local; o
    id do programa é público). O loader v3 continua sendo o caminho: o Agave abandonou o loader v4.
  - Plano técnico na v0.1.4 (§3.4.19).
- **Sprint 04 fechada para revisão, com PR aberto e não mesclado** (`docs/sprints/sprint-04-settlement-invariants.md`, "Closure status"). O programa ganhou liquidação, pagamento, taxas, parte do criador, a apuração tardia (`Join` por entrada, `tally_late_joins`), a regra de viabilidade (um pote só divide se o lado perdedor pagar as taxas) e o corte de revisão por prova anterior. Teste aleatório com semente fixa: 1.200 operações, 35.288 checagens de I1 a I15, sem falha. Medido: liquidação de 2.926 a 3.180 CU por entrada, 12 entradas por transação. Ficou em aberto: a redação da regra de viabilidade (taxa sobre o lado perdedor, não sobre o principal do lado vencedor), a cobertura dos caminhos de time (`confirm`, `void`) no teste aleatório e a conferência das linhas da definição de pronto sem teste. Plano técnico na v0.1.3 (§3.4.18).
- **Sprint 04 em curso, na branch `sprint-04-settlement-invariants`** (ainda sem PR). Feito até aqui: o arquivo
  `checks.rs` e o `state/campaign.rs` foram divididos sem mudança de comportamento; as pendências de documentação da
  Sprint 03 foram copiadas para as Sprints 04, 05 e 06; a decisão sobre `Contested` foi registrada (entra por
  `team_open_contest`; nada sai antes da Sprint 14); a leitura do código do push oracle da Pyth foi feita num commit
  fixado; e o plano técnico foi para a v0.1.2, alinhado ao que a Sprint 03 construiu e às respostas do fundador de
  9/10/2026.

### Added

- **Sprint 03: o programa lê o resultado sozinho, e o Anchor sai do repositório** (`programs/brot-markets`,
  9/10/2026). Os cinco tipos de campanha abrem, travam a entrada e resolvem on-chain:
  - **Os quatro leitores do `pred-provable` portados para o Pinocchio**, um arquivo cada, com o aviso MIT: a queima
    de um token (`SupplyAtMost`), a liquidez travada num pool DAMM v2 da Meteora (`DammV2LockedAtLeast`), o tamanho
    de um pool de stake numa época (`StakePoolTvlAtLeast`) e o stake de um validador numa época (`StakeAtLeast`).
    Cada um confere o dono e o formato da conta antes de ler um byte; uma conta cortada, esticada ou zerada é um erro,
    nunca um travamento. Testados nas contas reais capturadas da rede principal, e conferidos contra o programa
    congelado nas mesmas contas antes de ele sair: 62 casos, com cada diferença justificada
    (`docs/sprints/sprint-03-parity.md`).
  - **A divisão do leitor de preço:** na entrada, só a conta patrocinada da Pyth; para provar o SIM, qualquer conta
    totalmente verificada do mesmo feed, publicada dentro do prazo e com até 60 segundos; o NÃO só 60 segundos
    depois do prazo, para ninguém gravar NÃO na frente de uma prova; e o feed parado anula a campanha (`StaleFeed`)
    em vez de virar NÃO. O alvo precisa ficar a pelo menos 1% da faixa de confiança e, no lado distante, até 10 vezes
    o preço (ou um décimo); um alvo de 1 lamport deixa de abrir.
  - **`user_open_campaign` para os cinco tipos**, com as recusas das linhas 1 a 3 do plano técnico e um erro para
    cada uma; os argumentos sem uso têm de ser zero; a abertura recusa quando os parâmetros de criação mudaram desde
    a prévia que o criador viu (`expected_params_version`); quatro códigos próprios dizem qual conta da Pyth falhou
    na cobrança em SOL/USD. O `StakeAtLeast` fica fechado por uma feature de build até um SIM na devnet.
  - **Os tipos de época:** o criador passa a época e o prazo; a época precisa começar antes do prazo; a entrada fecha
    quando a época começa; uma época perdida anula (`MissedWindow`) e devolve, em vez de dizer NÃO.
  - **`resolve_campaign`:** qualquer carteira dispara e não escolhe nada; recusa ser chamada de dentro de outro
    programa (provado com um programa de teste que repassa a instrução); grava SIM, NÃO ou anulação com a janela de
    revisão de seis horas e emite `CampaignResolved` com o valor lido, a conta e, no preço, o horário e o slot da
    prova.
  - **A trava de entrada (BR-06):** a entrada é recusada assim que o resultado já é conhecível.
  - **Surfpool:** o leitor de preço rodou dentro das instruções sobre um fork da rede principal, com o preço cruzando
    o alvo e a campanha resolvendo SIM; o CI fixa o Surfpool 1.6.0 pelo SHA-256 do arquivo e do binário.
  - **O SIM do `StakeAtLeast` testado pela primeira vez**, no Mollusk, que injeta stake de época.
  - **Fatos da rede, em `knowledge-base/tecnologia/`** (frente R, com três scripts de medida em `scripts/`):
    `pyth-feeds-patrocinados.md`, quais feeds têm conta de fatia 0 e quem as mantém (na rede principal, 120 das 183
    são de feeds que a Pyth não patrocina, 78 criadas por um mesmo pagador e 102 paradas: a pergunta 1 ao fundador
    ganha o fato); `alpenglow-devnet.md`, o Alpenglow ativo na devnet desde 25/9/2026 e não na rede principal, o
    tempo de slot (231 a 245 ms e 260 a 282 ms) e a deriva do relógio (até 2,4 s), que confirmam os dois valores
    [AC] da abertura; `lighthouse.md`, o endereço do Lighthouse para a lista da Sprint 08; e, na nota da Pyth, que a
    conta patrocinada só anda para a frente (12 minutos, zero regressões; uma atualização velha é pulada, não
    recusada).
  - **Testes:** 255 em Rust e 259 em TypeScript depois das correções da revisão (252 e 258 antes delas), todos do
    programa novo; os oito filtros da sprint passam; tirar a checagem de chamada de topo derruba o teste dela (X0.9).
- **`brot.markets/2`, a página inicial com o visual do deck** (opção A, fundador, 9/10/2026): o mesmo conteúdo da
  página inicial, palavra por palavra, com o pãozinho e o formulário, e só o visual trocado: as cores do deck (carvão
  no tema escuro, creme no claro), IBM Plex e os cartões escuros dos slides. Um teste falha se o texto da `/2` e o da
  página inicial divergirem. Fica fora dos buscadores até virar a página inicial. Arquivos próprios em
  `services/landing/public/2/`, sem tocar na página atual, que o Ronaldo também edita; o `mascot.js` passou a achar as
  imagens a partir da raiz do site. **A primeira versão, publicada horas antes, estava errada:** trazia o conteúdo do
  pitch (problema, pote, abertura, roteiro) no lugar do da página inicial, e foi substituída.
- **Sprint 02: o núcleo do pote, o programa novo em Pinocchio** (`programs/brot-markets`, 8/10/2026). Sai o
  esqueleto Anchor; entra o programa que guarda SOL de verdade, ainda sem leitura de resultado nem pagamento:
  - **A configuração e a equipe:** `admin_initialize_config` (só a autoridade de upgrade, lida da conta ProgramData),
    até cinco chaves da equipe, os parâmetros de criação dentro dos tetos do código, o destino das taxas, a troca de
    admin em dois passos, a pausa por uma chave da equipe e a volta pelo admin. Os parâmetros valem só para as
    próximas campanhas, menos a entrada mínima, que cada entrada lê da configuração na hora (a confirmar com o
    fundador: o plano técnico diz as duas coisas, e os termos publicados prometem que a campanha aberta mantém as
    regras com que abriu).
  - **A abertura paga:** `user_open_campaign` do tipo preço cobra US$ 500 em SOL ao preço da Pyth SOL/USD, lido na
    hora da conta patrocinada que o programa deriva da configuração; tudo vai para o cofre da campanha, 90% como
    prêmio e 10% guardados para a Brot até o resultado. Ao preço capturado da devnet, US$ 119,22, são 4,1940 SOL. Das
    dez regras de abertura do plano técnico, oito têm o seu erro; as outras duas (o criador não passa taxa nem texto
    livre) valem pela forma dos argumentos, e um argumento a mais cai no erro de dados. Uma chave da equipe abre de
    graça, sem o 1% do criador; se quiser pôr prêmio, paga como qualquer carteira (a leitura de trabalho, a
    confirmar). Repetir a abertura com o mesmo número falha sem cobrar duas vezes.
  - **A entrada:** `user_join_campaign` leva o SOL da carteira do baker para o cofre, a partir de 0,01 SOL, com a
    trava contra a transação repetida e o retorno mínimo assinado. O pote é escriturado: SOL mandado à mão para o
    cofre não vira entrada.
  - **O módulo `checks`:** cada checagem que o Anchor fazia sozinho, escrita à mão num lugar só, com um teste que
    recusa a conta errada e a prova de que, sem a checagem, o teste falha.
  - **Eventos por chamada do programa a si mesmo**, um por instrução, com sequência contínua por campanha.
  - **O IDL do Shank** em `packages/sdk/src/idl` e um cliente gerado pelo Codama no ensaio do T9; a decisão sobre o
    Codama é da Sprint 05.
  - **Testes do programa novo:** 146 em Rust (a matemática com casos aleatórios, as checagens no Mollusk, o leitor de
    preço) e 130 em TypeScript, quase todos no LiteSVM sobre o binário; os nove filtros da sprint passam, e tirar
    qualquer checagem, ou qualquer assinatura e papel conferido dentro das instruções, derruba o teste dela.
- **O `bun.lock` baixa do `registry.npmjs.org`** (T15), e os dois `trustedDependencies` saíram depois da revisão.
- **Build e CI:** `bun run build:program` compila o programa novo com `cargo build-sbf` e escreve o IDL do Shank; o
  `anchor build` fica só para o `pred-provable`, até a Sprint 03. O CI instala o shank-cli 0.4.9 fixo, confere o IDL
  e o cliente gerado, e roda os testes com a feature `mainnet` para provar que ela não carrega valores de treino.

- **`docs.brot.markets` no ar,** fora dos buscadores, depois de o fundador escrever "pode liberar o endereço e colocar
  online, pois vou ler online" (8/10/2026). Sem dependência nova: o mesmo serviço do site responde pelo endereço
  `docs.`, com menu lateral (um menu suspenso no celular), uma página inicial com um cartão por página, anterior e
  próxima, e os dois temas. As páginas são geradas de `docs/wiki/` por `services/landing/scripts/build-docs.mjs`, e um
  teste novo falha se título, "In one bite" ou descrição divergirem. O conversor de Markdown passou a ser um arquivo
  só para os termos e o docs; as páginas dos termos e da privacidade saem idênticas, byte a byte. O site passa a ter
  33 testes.
- **As primeiras sete páginas do `docs.brot.markets`** (`docs/wiki/`), em inglês, ainda fora do ar: o que é o Brot,
  por que a rede decide, onde estamos, o pote, a vida de um mercado, como ele se decide e os cinco tipos de mercado.
  Cada uma abre com "In one bite", uma linha no tom do Baked. Os números saem do BP v0.0.3 e dos termos; o que os dois
  ainda não decidiram está listado no `docs/wiki/README.md`, junto com o índice e o estado de cada página. O
  fundador pediu em 8/10/2026 ("Depois podemos começar o docs"); a ferramenta e o endereço esperam a escolha dele.
- **Termos de serviço e política de privacidade no ar,** em `brot.markets/terms` e `/privacy`, com link no rodapé,
  depois de o fundador revisar ("revisado e pode inserir no site, no rodapé"), em 8/10/2026. Cada página abre com o
  Baked que ele desenhou (lista de conferência nos termos, escudo com cadeado na privacidade). As páginas são geradas
  dos arquivos de `docs/legal/`, e um teste novo falha se um título ou uma frase do Baked divergir entre os dois. As
  lacunas que ele não preencheu foram ao ar como frases de "ainda não definido"; a lista está em
  `docs/legal/NOTAS-DA-REVISAO.md`. A política nova substitui a antiga, que cobria só a lista de espera, e mantém o
  formulário de sair da lista. O site passa a ter 28 testes.
- **Termos de serviço e política de privacidade, primeiro rascunho** (`docs/legal/`), pedidos pelo fundador em
  8/10/2026: curtos, sem juridiquês e no tom do pãozinho. Cada seção abre com "the crumb", uma linha do Baked que
  resume a regra; a piada fica no resumo, nunca dentro da regra. Os termos descrevem o produto do BP v0.0.3 e do deck
  v4, mostram numa tabela o que a equipe pode e não pode fazer, e prometem que um mercado aberto mantém as regras com
  que abriu. A política diz o que o site guarda e o que não guarda, item por item. Um terceiro arquivo, em português,
  traz as notas para a revisão. Junto entram, para consulta interna, os 13 documentos da Polymarket, Kalshi, World e
  Robinhood em que o rascunho se apoiou (`knowledge-base/legal/concorrentes/`), cada um com fonte e data.
  No mesmo dia o fundador achou os termos longos ("ficaram muito longos, podemos e conseguimos reduzir?"): a versão
  0.2 cai de 2.962 para 1.520 palavras, com as mesmas 13 seções e as mesmas regras, perto do tamanho da política.
- **Um deck só no ar: o v4 passa para `/pitch`,** em 8/10/2026, a pedido do fundador. Os decks anteriores (o de oito
  slides que estava em `/pitch`, o `/pitch2` e o `/pitch3`) saem do ar e ficam em `services/landing/history/`, com os
  roteiros de fala, só como história. Os endereços `/pitch2`, `/pitch3` e `/pitch4` redirecionam para `/pitch/`, para
  nenhum link já enviado quebrar. Ajustes no mesmo dia: sai o "Not to scale" do slide de mercado; "on-chain" não
  quebra mais no hífen da capa; a janela da equipe cresce para a foto caber inteira depois da virada, e a corda some;
  voltam as frases de cada um, e abaixo delas só as marcas (Vega Crypto e hōl; Lopes Galvão Advogados e Complian.cc;
  Young Market e RealSet), no lugar dos cargos que eu tinha escrito.
- **Deck v4 em `/pitch4`,** em 8/10/2026, com as respostas do fundador à revisão dos mentores. O `/pitch3` fica como
  estava. Nove slides:
  - **Capa:** "Permissionless prediction markets, settled by on-chain data."; o "Proof > Promises" sai da capa.
  - **Problema:** "$7M · one market settled on an event that never happened."
  - **Receita:** a barra do pote mostra também o 1% de quem abriu o mercado; quem acertou recebe 950, e não 960. A
    demo do slide de solução conta o mesmo 1%.
  - **Patrocínio e criadores num slide só, "Open a market":** qualquer um abre um mercado com uma semente inicial de
    500 dólares ou mais; 90% da semente vira prêmio, 10% é a taxa, 1% do volume vai para quem abriu. Cena nova: o
    pãozinho puxa uma alavanca, e a semente sobe de 500 a 10 mil dólares e o mercado sobe no site. Sai o 0,02 SOL.
  - **Crescimento:** "Launch fees, first 3 months" no lugar de "Share to take a side".
  - **Equipe:** cada retrato de pãozinho vira a foto real uns três segundos depois de a cortina abrir; o nome de cada
    um leva ao LinkedIn; as linhas trazem duas atuações de cada um, ditadas pelo fundador.
  - **Fechamento:** sem a seta.
- **Revisão do `/pitch3` com dois mentores, em 8/10/2026,** organizada por slide em
  `docs/business/_review/revisao-do-pitch-2026-10-08.md`, com as transcrições brutas em `knowledge-base/pitch/`.
  Quem é quem por dedução, o que foi dito com a marca de tempo, a avaliação de cada ponto e seis decisões do
  fundador (R1 a R6). As maiores: juntar patrocínio e criadores num slide só, com uma semente mínima de 500 dólares
  no lugar dos 0,02 SOL, e usar o slide que sobra para a proteção contra manipulação. Nada foi mudado no deck nem
  no plano.
- **Business Plan v0.0.3, refeito a partir do pitch** por ordem do fundador em 7/10/2026 ("tomar o pitch como
  verdade, e transformar o Business plan conforme o pitch"), com três agentes em sequência: mapa de impacto
  (`docs/business/_review/bp-impact-review-v0.0.3.md`), redação e revisão (`_review/revisao-bp-v0.0.3.md`). Quatro
  partes, 31.742 palavras, cerca de 66 páginas; o `BUSINESS-PLAN.md` passa a ser o índice da v0.0.3, e a v0.0.2 fica
  na pasta porque o resumo de produto, o plano técnico e as sprints citam as seções dela. Entram como regra, marcada
  "Decisão do pitch": qualquer carteira abre mercado por 0,02 SOL e fica com 1% do pote; patrocínio a partir de 500
  dólares, 90% para o prêmio e 10% de taxa de marketing; o projeto patrocinador como cliente; a equipe com nome e
  cargo. A parte de tokens cai para cerca de 2.800 palavras. Ficam 19 decisões abertas; ver "Em aberto".

- **Site provisório do `brot.markets`** (`services/landing`), fora do roteiro, a pedido do fundador: página "em
  breve" na direção Ledger², em claro e escuro, com lista de espera; página de privacidade com formulário para sair;
  e o deck de pitch em `/pitch`. Node puro, sem dependências, com 21 testes que entraram na conferência automática.
- **Lista de espera** com o mínimo de dado: email, data e versão do consentimento. Sem IP. Sair apaga na hora, e
  doze meses depois da inscrição a linha é apagada sozinha. As nove perguntas de privacidade estão na seção 8.1 do
  plano técnico.
- **Deck de pitch revisado:** os 12 slides do fundador mais um de problema, num palco de 39 KB no lugar do pacote de
  10 MB. Onze correções de conteúdo, listadas no registro de sessão. Servido só por link, fora dos buscadores.
- **Nota de pesquisa** sobre o mercado do token $LAPTOP na Polymarket, que dá fonte a um número do deck.
- **Mascote vivo na página inicial do site provisório:** o Baked fica em pé em cinco pontos da página, pula para o
  mais próximo de onde o ponteiro para, muda de pose conforme o que está sob o ponteiro, fala ao pousar e ao ser
  cutucado, e aprova quando alguém entra na lista. É o comportamento do protótipo aprovado, portado em três arquivos
  curtos. Não guarda nem envia nada, e fica parado para quem pede menos movimento.
- **Testes das páginas** (`services/landing/tests/pages.test.mjs`): todo arquivo citado existe, o rascunho de
  sugestão mantém a menção e a hashtag, o mascote tem imagem para cada pose e o deck tem os oito slides. O site
  provisório passa a ter 26 testes.
- **Deck em `/pitch3`,** feito em 7/10/2026 a partir da pauta do fundador depois de ver o `/pitch2`, que fica como
  está. Nove slides. O plano, bloco a bloco, está em `docs/business/_review/plano-do-pitch3.md`.
  - **Demo animada** no slide de solução: escolhe YES num mercado, o cartão vira, escolhe NO em outro, e a rede
    resolve os dois, um ganho e uma perda.
  - **Uma cena do mascote por troca de slide,** com as 17 imagens que o fundador desenhou: sai do adesivo e cai,
    espia e puxa o slide, voa numa corda, aponta para o último passo, morde a fatia da taxa (com uma surpresa
    escondida no clique), chega em cima da bola do TAM, vem seguido por uma fila, abre a cortina de cada pessoa da
    equipe. Três regras: até 1,5 segundo por troca, a troca seguinte cancela, e a tecla `M` desliga tudo.
  - **Slide de equipe, dois retângulos novos de crescimento e o contador de parceiros,** como proposta à espera de
    confirmação. A lista de parceiros nasce vazia: nenhum parceiro inventado.
  - Sai o slide de exemplos de mercado e o ponto de equilíbrio; a capa abre pela frase de uma linha.
  - **Modo leve, tecla `N`,** entre o movimento completo e o desligado (`M`): só as cenas que o fundador escolheu,
    slide a slide. A lista está no plano.
  - **Contador de parceiros ligado com sete marcas fictícias** que o fundador desenhou
    (`docs/product/poses/fic_partners`), para a animação poder ser vista: conta de 0 a 7 e abre os quatro últimos
    cartões em leque. O cartão traz a etiqueta "example", porque não são parceiros; ver o bloco "Em aberto".
  - **Ordem nova dos slides,** pedida pelo fundador: capa, problema, solução, mercado, receita, patrocínio,
    crescimento, equipe, fechamento. Os dois endereços da capa passaram a ser links, que abrem em outra aba.
  - **Rodada das regras,** pedida pelo fundador na noite de 7/10/2026. O deck passa a ter dez slides. O de receita
    volta aos **10% do lado perdedor**, mostrados numa barra do pote em escala (600 no lado que acertou, 400 no que
    errou, 40 para o Brot, 960 para quem acertou), e a demo usa a mesma regra. No de patrocínio, os passos 3 e 4
    ficaram mais claros e a frase final diz 90% para o pote e 10% de taxa de marketing. Entra o slide **"Creators"**
    antes do de crescimento: qualquer um abre um mercado por 0.02 SOL, dentro das regras, e leva 1% do pote. No de
    crescimento, "Creators earn 1%" substitui "Proof cards". Três desses pontos saem do plano de negócio; ver o
    bloco "Em aberto".
  - **Cena do mascote no slide de criadores,** pedida pelo fundador em seguida, nos três níveis do controle de
    movimento: no completo ele cai em cima do cartão do 1%, faz joinha, e dois menores espiam de trás dos outros
    cartões; no leve já está lá e só faz o joinha; no desligado fica parado. Usa a pose de joinha que já existia.
  - **Retratos da equipe no slide de equipe:** os três desenhos que o fundador fez de cada sócio como pãozinho
    (`docs/product/team`) entram no lugar das poses do mascote.
  - **Roteiro de fala do `/pitch3`** refeito no formato do fundador, a partir do que ele levou à banca, com as
    respostas prontas para a sabatina (`services/landing/pitch3-notes.md`).
- **Biblioteca de poses do mascote** em `docs/product/poses`: as 17 novas do fundador e as 10 peças que já existiam,
  nas mesmas duas pastas e no mesmo quadro. O `LEIA-ME` de lá diz o que foi arrumado em cada uma.
- **Frase de elevador aprovada** pelo fundador em 7/10/2026, no `PITCH.md`, com o porquê de cada escolha.
- **Terceira versão do deck, em `/pitch2`,** feita a pedido do fundador a partir da análise da banca, para ele
  avaliar no ar. Nove slides no mesmo palco e na mesma linguagem visual do `/pitch`, que continua como estava: abre
  pelo caso de 7 milhões de dólares, ganha um slide de exemplos de mercado e outro de crescimento com roteiro, troca
  o mercado por TAM, SAM e SOM com números do plano, tira a palavra "bet", o token e o "parimutuel", e diz na capa
  que é fase de testes. Só por link, como o `/pitch`. O roteiro de fala, em português, está em
  `services/landing/pitch2-notes.md`. O site provisório passa a ter 28 testes.
- **Banca do pitch de 6/10/2026, em dois documentos.** A transcrição corrigida e organizada da apresentação e da
  sabatina (`knowledge-base/pitch/2026-10-06-banca-transcricao.md`), com os avaliadores sem nome, a lista das
  correções feitas e o roteiro em português do fundador. E a análise
  (`docs/business/_review/banca-do-pitch-2026-10-06.md`): 42 pontos da banca e 8 da fala, cada um com avaliação e
  veredito, a proposta de uma terceira versão do deck com nove slides e a lista do que não foi conferido.
- **Proposta de arquitetura do sistema, versão 0.2** (`docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md`, em inglês,
  como o pedido mandou). Liga cada requisito do plano de negócio a um componente e a uma sprint; escolhe a stack
  dizendo o porquê e o que faria mudar cada recusa; desenha a camada para o Seeker (registro explícito da carteira
  móvel no site, PWA e, se o fundador quiser, o APK da loja feito com o `solana-mobile webshell`) e uma camada de IA
  opcional, por padrão desligada até a rede principal; encaixa quatro fases nas sprints aprovadas, com critérios de
  saída e comandos de conferência; e lista sete decisões para o fundador, mais o pedido do parecer jurídico. A versão
  0.1 passou por quatro revisões independentes (segurança, viabilidade, advogado do diabo e checagem de fontes), e a
  0.2 incorpora o que elas acharam. É proposta: o plano técnico e o roteiro não mudaram.
- **A proposta de arquitetura refeita sobre o BP v0.0.3, versão 0.3** (8/10/2026). O plano de negócio novo deixa
  qualquer carteira abrir mercado por 0,02 SOL e dá 1% do pote a quem abriu. A proposta:
  - põe as regras de abertura dentro do programa, numa instrução nova, sem texto livre;
  - escreve o 1% como uma função só, que serve aos três desenhos do BP, e constrói o recomendado, em que quem acerta
    nunca recebe menos do que pôs;
  - deixa a taxa de 0,02 SOL exata, com o aluguel das contas descontado dela e devolvido à carteira de várias
    assinaturas no fechamento;
  - mostra que o teto global se ocupa com 0,2 SOL e propõe uma regra de equilíbrio entre os lados, que encarece o
    ataque sem eliminá-lo;
  - prepara os serviços para muitos mercados;
  - acrescenta o cartão para o X, o painel "confira você mesmo" e a caixa de abertura.

  A stack não muda. A decisão sobre a base da taxa (D1) fecha em 10% do lado perdedor, e entra a D8, a tela de
  abertura, que o protótipo não tem. Continua sendo proposta: o plano técnico, o resumo de produto e o roteiro não
  mudaram.
- **Business Plan v0.0.4** (8/10/2026), a partir das decisões do fundador sobre a v0.0.3. O índice em
  `docs/business/BUSINESS-PLAN.md` e quatro partes (`BP-v0.0.4-parte-*.md`), com a numeração da v0.0.3. O que muda:
  - tudo em SOL;
  - abrir uma campanha custa US$ 500 em SOL, com 90% virando prêmio no pote e 10% indo para o Brot;
  - o 1% do criador sai do pote, e da taxa do Brot só no caso extremo;
  - sem teto, nem global nem por campanha, e sem lista de contas aprovadas;
  - o vocabulário passa a ser "campanhas on-chain", com baker, criador, SIM/NÃO e pote;
  - na construção: Pinocchio, Bun, app Android, sem IA e sem prazo de hackathon.

  As contas usam o preço da CoinGecko de 8/10/2026 (US$ 109,27 por SOL). O volume de equilíbrio cai com cada abertura
  paga (110 por mês pagam o custo sozinhas). Os cenários de caixa mês a mês são os da v0.0.3 e não foram refeitos.
  Junto vieram:
  - a revisão de impacto (`docs/business/_review/bp-impact-review-v0.0.4.md`);
  - as respostas de 8/10 no registro de perguntas e respostas, inclusive a P-1 e a P-3, decididas depois: nada de
    1% ao criador na campanha anulada, no pote de um lado só e sobre o prêmio; a equipe abre sem pagar e sem o 1%; os
    parceiros também não ficam com o 1%; a P-2, a P-4, a P-5 e a D-f como recomendado; a proposta de arquitetura 0.4
    aprovada.
- **Proposta de arquitetura, versão 0.4**, sobre o BP v0.0.4:
  - Pinocchio no lugar do Anchor;
  - cofres em SOL nativo e pagamento direto à carteira;
  - a abertura lê o preço SOL/USD da Pyth para cobrar os US$ 500;
  - sem teto e sem lista;
  - sai a camada de IA;
  - entra o app Android, com o mesmo backend;
  - os serviços em Bun, e o site também se passar no teste.
- **O plano de implementação, em inglês** (8/10/2026), a pedido do fundador, a partir da proposta de arquitetura 0.4
  aprovada no mesmo dia:
  - `docs/technical/TECHNICAL-PLAN.md` v0.1.0 substitui a v0.0.1, que fica no histórico do git (commit `0b40554`). O programa em
    Pinocchio está descrito por inteiro, e entra uma seção sobre o app Android;
  - `docs/SPRINTS.md` v0.1.0 e os arquivos das Sprints -1 e 02 a 22. Quatro arquivos mudaram de nome (10, 11, 12 e
    18), e quatro sprints são novas: a 19, a caixa de abertura no site, e de 20 a 22, o app Android;
  - o `CLAUDE.md` descreve o produto novo.

  As recomendações D6, D7 e D8 da proposta foram lidas como aprovadas com ela, e isso está escrito para o fundador
  confirmar. O resumo de produto e o documento de design ainda não foram alinhados.
- **Pesquisa "o pump.fun dos mercados on-chain"** (`knowledge-base/market/pumpfun-model-for-open-markets.md`, em
  inglês, a pedido do usuário em 7/10/2026), com as sete notas de fonte em `knowledge-base/market/pumpfun-model-notes/`.
  Cobre a receita, as taxas, o token e o valor de mercado do pump.fun; a decisão judicial de 31/8/2026 contra ele; o
  tamanho do setor e os comparáveis; 35 tentativas de criação aberta de mercados; o catálogo do que um programa
  consegue conferir sozinho na rede, com o teto de pote pelo custo de forçar o resultado; o desenho da caixa de
  criação que completa a frase; a conta do criador; e o escopo de cinco dias para o Colosseum. Abrir a criação ao
  público desfaz quatro decisões aprovadas e fica com o fundador. A cota de busca acabou no meio da pesquisa, então
  alguns itens se apoiam em fonte secundária, e a seção de lacunas os lista. Nenhum outro documento foi alterado.

### Changed

- **A frase da capa do deck** (`/pitch`, slide 1; Lucas, 9/10/2026). Sai "Permissionless prediction markets, settled by
  on-chain data." e entra "Permissionless prediction markets that turn on-chain milestones into growth campaigns,
  settled by the chain itself.", a mesma frase que ele usou na inscrição do DemoDay. O título do slide não mudou. A
  descrição da página, que aparece em prévias de link, acompanha a frase nova. "on-chain" e "the chain itself." não
  quebram no meio da linha.
- **As respostas do fundador de 9/10/2026** às perguntas que as Sprints 02 e 03 deixaram e às duas abertas da Sprint
  04, dadas pelo Ronaldo (`docs/business/ideacao-perguntas-e-respostas.md`, seção 1; comentário no PR #40). A Sprint
  04 constrói: uma lista nossa de feeds da Pyth, fixa no programa, que começa pela lista oficial de feeds
  patrocinados (62 na rede principal e 17 na devnet), o que estreita o D-i só para o tipo preço; a abertura cobrada
  em `p − conf`; o feed do SOL/USD como constante; as aberturas da equipe fora do `max_open_campaigns` e sem limite;
  a entrada mínima copiada na abertura (hoje 0,01 SOL); a margem na trava de entrada e a devolução das entradas
  feitas a partir do `publish_time` da prova do SIM; o prêmio de volta a quem abriu numa campanha sem entradas, com
  os US$ 50 para a Brot; e o `StaleFeed` como causa externa, também com os US$ 50 para a Brot. As chaves da equipe
  ficam com o Lucas, o Ronaldo e o Bernardo.
- **O `pred-provable` e o Anchor saem do repositório** (Sprint 03, 9/10/2026), num commit só: o programa congelado,
  os seus testes, `tests/helpers.ts`, o IDL em `target/` e o `Anchor.toml`. O `Cargo.lock` perde 175 pacotes e não
  sobe versão nenhuma; o `brot-markets` chama as syscalls de stake de época, altura da pilha e sysvar pelo próprio
  Pinocchio, sem o crate `solana-epoch-stake` nem o seu pino. O CI deixa de instalar o Anchor CLI, e a checagem de
  IDL cobre só o IDL do Shank e o cliente gerado. O pacote raiz passa a se chamar `brot-markets`. O site atual
  continua com a cópia do IDL antigo em `app/lib` até a Sprint 09, e `smoke:devnet` e `seed:devnet` ainda falam com
  a instalação antiga na devnet por ela. O `CLAUDE.md` foi reescrito sem o Anchor.
- **Duas regras do plano técnico mudaram diante dos fatos** (Sprint 03): o `prev_publish_time` da Pyth é o agregado
  anterior da Pythnet, não a escrita anterior da conta (em todas as contas capturadas vale `publish_time − 1`), então
  o teste do feed parado passou a ser "nada foi gravado depois do prazo e a última escrita é mais velha que
  `prazo − max_age`"; e o NÃO do tipo preço espera 60 segundos depois do prazo.
- **Plano técnico v0.1.1** (8/10/2026): alinhado ao que a Sprint 02 construiu e mediu, linha por linha da tabela "TP
  to align" do arquivo da sprint. Entram as versões fixadas (`pinocchio-system` 0.6.1, Shank 0.4.9, Mollusk 0.14.0, que
  substitui o 0.16 por causa do Rust 1.89), os eventos por chamada do programa a si mesmo desde a Sprint 02, as dez
  instruções, os tamanhos e o aluguel medidos (3.901.440 lamports por abertura na devnet), os três valores de treino,
  o CI como está, e C14 a C17, C30, C42 e C43 fechados. O D6 e a leitura do prêmio posto pela equipe (C44) passam a
  decisão do fundador, pelas palavras dele no PR #35; a entrada mínima lida a cada entrada e as quatro perguntas das
  revisões ficam abertas na seção 14.2.
- **A página em breve com o vocabulário do D6** (8/10/2026): título, meta tags, título principal, texto de abertura,
  formulário, exemplo e princípios passam de "prediction markets", "bet", "pool" e USDC para On-Chain Campaigns,
  entrar no YES ou NO, pote e SOL. O aviso legal do rodapé e o deck em `/pitch` não mudaram.

- **Vocabulário, a pedido do usuário em 7/10/2026:** o produto passa a ser descrito só como "mercados", com
  "posição" e "participante". A proposta de arquitetura já segue a regra. Os documentos anteriores e o site no ar
  ainda não foram revistos (a página inicial usa as palavras antigas no título, na descrição e no cabeçalho), e os
  nomes no código são a decisão D6 da proposta.
- **`/pitch2` enxuto, a pedido do fundador em 6/10/2026:** cerca de 39% menos texto na tela (de 789 para 482
  palavras), sem a frase das faixas no slide de patrocínio, e o slide de receita passa a dizer uma taxa simples de
  **3,5% de cada pote**. O ponto de equilíbrio do slide de mercado foi recalculado pela conta do plano (cerca de 221
  mil por mês). **O plano de negócio ainda diz 10% do lado perdedor**; ver o bloco "Em aberto".
- **Deck em `/pitch` trocado pela segunda versão do fundador**, de oito slides, com a animação que ela trazia: entrada
  de cada slide, o mascote correndo na troca e o final do último slide. Dois ajustes de texto foram repetidos da
  primeira revisão (slide 5) e o roteiro de fala foi refeito. Segue só por link.
- **Botão de sugestão da página inicial** abre no X um rascunho pronto, com a menção a `@brotmarkets`, uma pergunta
  de exemplo e a hashtag `#BrotMarkets`.

- **Respostas do fundador de 5/10/2026 registradas** no roteiro, no plano técnico e na Sprint 02: chaves com o Lucas
  e o Ronaldo; idade do preço como parâmetro por pergunta, com piso de 30 segundos; chave da Pyth à espera da
  medida; leitura no Surfpool mantida na Sprint 03; domínio comprado.
- **`PITCH.md`:** o portão de redação passa a dizer o que o deck mostra em cada linha e o que se recomenda.

### Fixed

- **A carteira dentro do app Android** (15/10/2026, achado por um testador do APK da submissão à Solana Mobile). O
  site criava o adaptador da Solflare sem rede, e o SDK dela abre na mainnet-beta quando não recebe uma. Dentro do app
  (o shell web da Solana Mobile, um WebView) não há extensão, então tocar em "Solflare" abria a página web de conexão
  dela, na mainnet-beta. Agora, dentro do app, a lista "Connect a wallet" mostra só o Mobile Wallet Adapter, que abre o
  app de carteira do celular na devnet; a Phantom também sai de lá, porque só levava à instalação. Fora do app, a
  Solflare abre na rede do site (`app/features/wallet/web-shell.ts`, com testes). O APK não muda: ele só abre o site.
- **Nenhuma conexão pelo Mobile Wallet Adapter passava pela política de segurança do site** (15/10/2026, achado no
  mesmo APK, depois da correção acima: a carteira abria e o app ficava em "connecting"). No celular, a carteira abre
  um soquete no próprio aparelho, e a página se conecta a `ws://localhost:<porta>/solana-wallet`; o `connect-src` da
  CSP não aceitava esse endereço, então o navegador recusava cada tentativa até a biblioteca desistir, aos 30 s. A CSP
  agora aceita `ws://localhost:*` (`app/next.config.ts`, com um teste que falha sem a regra). Conferido num emulador
  Android 15 com o APK e a carteira de teste da Solana Mobile: com a CSP antiga, 21 recusas e "Failed to connect to the
  wallet websocket"; com a nova, servida localmente, nenhuma recusa, a carteira pediu a autorização na devnet e o app
  voltou conectado.
- **O erro #418 do React em todas as páginas do site** (13/10/2026, achado na publicação do ticker;
  `session-log/2026-10-13-publicacao-do-ticker-no-dev0x.md`). O servidor não vê carteira nenhuma, e o navegador quase
  sempre vê uma: o adaptador da Solflare fica "Loadable" em qualquer navegador de computador. Por isso duas partes da
  moldura comum saíam diferentes no HTML do servidor e na primeira renderização do navegador. Uma era o botão da barra
  do topo ("No installed wallet found", desligado, contra "Connect"). A outra era a lista "Connect a wallet", fechada
  mas renderizada (um aviso contra os botões das carteiras). Em toda carga, o React jogava fora a árvore e
  renderizava a página inteira de novo. Agora o `useInstalledWallet` diz que há carteira até a hidratação terminar, e
  a lista monta as linhas só depois dela, com o `useIsClient`, que saiu de `features/open-campaign` para `app/lib`.
  Quem não tem carteira vê o aviso logo depois da carga. Conferido: no modo de desenvolvimento, as oito páginas
  hidratam sem diferença; no build de produção com as configurações do servidor, `/dev0x`, a página da campanha e
  `/fees` não dão erro de página; e "Connect" abre a lista com a Solflare e a Phantom. Teste novo:
  `tests/site/wallet-render.test.ts`, que falha no código anterior. No ar desde as 05h33min49s UTC de 13/10/2026, na
  versão `353c2a3a1b90`: as páginas no ar já não dão o erro.
- **O ranking da API perdia mais da metade do histórico para o limite da RPC pública** (13/10/2026, achado na
  publicação do ticker; `session-log/2026-10-13-publicacao-do-ticker-no-dev0x.md`). A RPC pública do devnet aceita dez
  `getTransaction` a cada dez segundos por endereço (`x-ratelimit-method-limit: 10`) e responde 429 ao resto. O
  histórico lê quatro de cada vez, até 200 por rodada, contava cada 429 como uma tentativa perdida e, depois de cinco,
  pulava a transação até o próximo reinício. No servidor, eram 36 a 40 puladas desde 11/10, e o ranking no ar tinha 20
  dos 53 eventos que conta. Agora um 429 não gasta tentativa: a transação guarda o lugar e a rodada para de ler até a
  próxima (`services/api/src/history.ts` 0.3.0). Qualquer outra recusa continua contando. Contra a RPC pública, a
  leitura completa terminou em nove rodadas, uns dois minutos e quinze segundos, com os 53 eventos e nenhuma pulada.
  Testes: três novos em `services/api/tests/history.test.ts`; os dois do 429 falham no código anterior. No ar desde as
  05h33min49s UTC de 13/10/2026, na versão `353c2a3a1b90`: depois do reinício, o ranking ficou completo em 2min07s,
  com os 53 eventos e nenhuma transação pulada.
- **`CampaignFinalized` também na confirmação e na anulação pela equipe** (9/10/2026; achado da revisão da Sprint
  05, feito como PR à parte a pedido do Ronaldo). O plano técnico (§3.4.3, §3.4.14) promete que `team_confirm_result`
  e `team_void_campaign` emitem o próprio evento e depois `CampaignFinalized`; o programa rodava o snapshot e emitia só
  `ResultConfirmed` ou `CampaignVoided`, e um indexador que segue os eventos perderia o snapshot dessas campanhas.
  Agora os dois emitem `CampaignFinalized` logo depois, com o `seq` seguinte e os mesmos campos de `finalize_campaign`,
  montados num lugar só (`snapshot::finalized_event`). Custo no LiteSVM: confirmação de 3.539 para 4.785 CU, anulação
  de 2.456 para 3.701; o binário passa de 158.072 para 159.576 bytes. Testes em
  `tests/brot/team-window-events.test.ts` (os dois eventos, em ordem, com os campos do snapshot gravado), e o kit de
  testes passa a ler os três eventos. Quando isto entrar, os eventos que o smoke da Sprint 05 espera mudam
  (`scripts/validator/cycle-settle.ts`, na branch dela): a confirmação da equipe passa a emitir dois.
- **O gancho de pre-commit volta a rodar** (9/10/2026, pedido do Ronaldo). O `.husky/pre-commit` estava no Git sem
  permissão de execução desde a derivação do OS (2/10), e o Git o ignorava em silêncio ("hook was ignored because it's
  not set as executable"): commits feitos fora do Claude Code não passavam pela varredura de segredos. Agora ele é
  executável (modo 100755) e roda `scripts/pre-commit.js`: a varredura de segredos nos arquivos em stage; o lint do
  Biome só se o Biome estiver instalado, e não está neste repositório.
- **Sprint 03, o que as revisões acharam e foi corrigido antes do pull request** (9/10/2026; quatro revisores:
  segurança, advogado do diabo, independente e produto; nenhum achou como tirar SOL de ninguém):
  - **a anulação por feed parado ganha um piso de 600 segundos** (`STALE_FEED_MIN_SECONDS` [AC]): a conta
    patrocinada da devnet atualiza a cada 62 a 64 segundos, e uma campanha com `max_age` perto disso podia ser anulada
    ou virar NÃO conforme o segundo em que alguém a resolvesse; agora a última atualização antes do prazo precisa ser
    mais velha que o maior entre o `max_age` e dez minutos;
  - **o expoente do feed mudou desde a abertura, e a janela de prova fechou: anula**, em vez de registrar NÃO; toda
    prova do SIM durante a janela era recusada pelo mesmo motivo, então o NÃO seria um veredito que ninguém pôde
    contestar;
  - **preço zero ou negativo não prova o SIM**, em nenhuma direção, com o mesmo erro da abertura (`PriceNonPositive`);
    antes, um preço negativo assinado pela Pyth provaria o SIM de uma campanha "abaixo de" (era a pergunta 7 ao
    fundador; as revisões a fecharam);
  - **o endereço do próprio programa na vaga da prova vale como "sem prova"**: enquanto a janela está aberta a
    resposta é `NotResolvableYet`, e não `ProofDoesNotTouch` para qualquer conta que preenchesse a vaga; sem isso a
    recusa "ainda não dá" nunca era alcançável para uma campanha de preço;
  - testes novos para cada item (255 em Rust, 259 em TypeScript); a IDL não muda.
- **Sprint 02, o que as revisões acharam e foi corrigido antes da mescla** (8/10/2026; três revisores e o
  coordenador, nenhum achou como tirar SOL de ninguém):
  - um preço da Pyth com horário mais de 60 segundos à frente do relógio da rede passa a ser recusado como velho;
    antes, um horário adiantado por falha na origem nunca envelhecia;
  - a entrada confere que o cofre pertence ao programa, além do endereço;
  - a escrita da marca de tipo numa conta nova recusa uma conta que já tenha marca, qualquer que seja a instrução;
  - testes novos: a assinatura que falta quando alguém já pagou o aluguel das contas (a inicialização e a abertura
    gratuita da equipe, onde a assinatura é a única defesa), o cofre de outro dono na entrada, e a abertura paga de
    uma campanha sobre o próprio SOL/USD, que usa a mesma conta nas duas posições de preço;
  - a prova de que cada assinatura e cada papel conferido dentro das instruções tem um teste que cai sem ele: 21
    remoções, uma de cada vez, todas derrubaram o seu teste.

- **Conferência automática vermelha no `main` desde a troca do deck para `/pitch`** (8/10/2026). O índice do plano
  apontava para o roteiro do `/pitch3`, que foi para o histórico, e o `os-self-test` barra link quebrado. O pull
  request foi juntado mesmo assim, por erro meu no comando que juntava. O link agora leva ao histórico, e o `LEIA-ME`
  das poses aponta para as imagens do deck no ar. O site não foi afetado.
- **Redirecionamento de pasta** do site provisório montado a partir do caminho validado, e não do texto enviado pelo
  visitante. Apontado pela revisão de segurança do commit; nenhum caso testado saía do domínio.

### Em aberto

- **O R4, abertura mais barata nos primeiros meses,** não foi construído (Sprint 02).

- **Autoria no Colosseum, prazo 12/10/2026:** o plano diz que a equipe se apresenta como uma pessoa, mas o git mostra
  quatro autores desde 14/9/2026, e o regulamento pede todos os membros e verifica quem fez o trabalho. O código vindo
  do `pred-provable` também precisa ser declarado. Detalhe na seção do hackathon de
  `knowledge-base/market/pumpfun-model-for-open-markets.md`.
- **O endereço `brot.markets` está no ar desde 5/10/2026**, pelo túnel próprio do projeto, com HTTPS obrigatório. O
  que foi criado e como desfazer: `knowledge-base/tecnologia/servidor-e-dominio.md`, seção 2.1. Falta conferir se o
  país do visitante chega ao servidor e o que o Cloudflare registra dos visitantes.
- **O Cloudflare tenta injetar o script de estatísticas dele nas páginas** (visto em 5/10/2026). A política de
  conteúdo do site bloqueia, então nada é medido, mas fica um erro no console de cada visitante. Desligar na zona
  espera o de acordo do fundador.
- **Lista de espera sem cópia fora do servidor**, por decisão do fundador em 5/10/2026 ("por enquanto não precisa").
  Também não há aviso quando entra um email novo.
- **Portão de redação do deck:** o fundador mandou publicar, e falta aprovar linha por linha o que vai a público e
  dizer quem mantém o deck. Até lá ele fica só por link. A recomendação está no `PITCH.md`.
- **O deck no ar (`/pitch`, v4) mostra "7 of 30 launch spots taken" com sete logos de exemplo.** Não há sete
  parceiros: foi pedido do fundador para ver a animação, e o cartão diz "example". Antes de qualquer apresentação de
  verdade, trocar a lista (`services/landing/public/pitch/partners.js`) pelos parceiros fechados ou esvaziá-la.
- **O v4 mudou duas regras que o BP v0.0.3 acabou de registrar,** por resposta do fundador à revisão dos mentores em
  8/10/2026: abrir mercado pede uma semente de 500 dólares ou mais (90% prêmio, 10% taxa), no lugar dos 0,02 SOL
  (decisões 2 e 15 do plano); e quem abre leva "1% of the market's volume", e não 1% do pote, que não são o mesmo
  número. O plano não foi tocado; as duas pedem a revisão de impacto.
- **Da revisão dos mentores ficam com o fundador:** R3 (que métricas entram no lançamento; o slide de proteção contra
  manipulação não entrou), R4 (o valor da taxa reduzida dos três primeiros meses) e R6 (o prazo de entrega). Detalhe
  em `docs/business/_review/revisao-do-pitch-2026-10-08.md`, seção 6.
- **Termos e privacidade no ar com lacunas declaradas:** empresa, países bloqueados, teto de responsabilidade, lei e
  foro dizem "será definido antes de dinheiro real". Seis regras dos termos dependem de decisões abertas do plano, e
  o texto não resolve o risco da MP 1.394 para sócios no Brasil sem bloqueio de país
  (`docs/legal/NOTAS-DA-REVISAO.md`). Faltam o resumo comparativo dos concorrentes e a lista completa de documentos.
- **`docs.brot.markets`:** no ar com sete páginas, fora dos buscadores até o fundador ler e aprovar; abrir para eles
  traz a mesma dúvida da MP 1.394, art. 16, sobre publicidade. As seções de projetos, taxas e equipe esperam decisões
  do plano; segurança e perguntas frequentes estão prontas para escrever.
- **`docs/business/BP-v0.0.3-completo.md`,** o plano num arquivo só, pedido pelo fundador, fica fora do Git: é uma
  cópia das partes e envelhece na primeira edição.
- **19 decisões abertas no BP v0.0.3** (quadro no `docs/business/BUSINESS-PLAN.md`), oito delas antes da Sprint 02:
  1 (de onde sai o 1% de quem abriu), 2 (os 0,02 SOL), 6 (a equipe abre mercados), 7 (tipos em que dá para empurrar o
  resultado), 10, 13, 15 e 16. O resumo de produto, o plano técnico e a Sprint 02 ainda descrevem a criação só pela
  equipe e precisam ser revistos depois dessas respostas. O plano traz os nomes completos da equipe antes do de acordo
  escrito do Bernardo e do Ronaldo. O slide de receita do `/pitch3` mostrava 960 para quem acertou; o v4 já mostra
  950, com o 1% de quem abriu. Em 8/10/2026, à noite, as oito foram apresentadas ao fundador num quadro, cada uma com
  a recomendação do plano, para resposta numa sessão só ("ok em todas" ou ajustes); a 2 já pergunta se a semente de
  500 do v4 substitui os 0,02 SOL e se o 1% é do volume ou do pote. Sem resposta até o fechamento do dia.
- **O `/pitch3` diz três regras que o plano de negócio não tinha,** a pedido do fundador em 7/10/2026. Desde 8/10/2026
  estão na v0.0.3 como "Decisão do pitch"; o registro abaixo fica como histórico. O plano não
  foi alterado; cada uma pede a decisão dele e a revisão de impacto. (1) **Patrocínio 90/10:** o plano diz 70% para
  o pote e 30% para o Brot (Parte 1, §3.7), e as projeções usam os 30%; num patrocínio de 500 dólares a receita cai
  de 150 para 50. (2) **Qualquer um abre mercado, por 0.02 SOL:** o plano diz que a equipe abre as perguntas, o
  patrocinador pede e o público só sugere (Parte 1, §4.1), e o Product Brief põe a criação pelo público fora do
  produto; a moeda do produto é o USDC. Muda o desenho do programa da Sprint 02, então precisa ser decidido antes dela. (3) **1% do
  pote para quem abriu:** se sair do pote inteiro, quem acerta paga parte dele, e com mais de 98,9% do pote de um
  lado só o vencedor recebe menos do que pôs. As duas saídas (tirar do lado perdedor, ou da taxa do Brot) estão em
  `docs/business/_review/plano-do-pitch3.md`, "A rodada das regras".
- **"Ninguém perde por acertar" exagera** (Parte 1, §3.3 do plano; era também o título do slide 5 do deck de oito
  slides, hoje fora do ar): em pote de um lado só, quem entra depois do primeiro paga 1%. Entra na passada de
  coerência.
- **Site provisório, pendências:** idioma (está em inglês, por escolha provisória; L-01 segue aberta); um email de
  contato do domínio para a página de privacidade; revisão jurídica do texto de privacidade; a conta do X não foi
  conferida; o Ronaldo ser avisado do serviço novo no servidor.
- **Arquivos originais do deck** (as duas versões, 10 MB e 13 MB) em `docs/technical/`, fora do Git. Não foram
  commitados nem apagados.
- **Quem controla a Pyth:** na rede principal, a autoridade que atualiza os programas é um endereço derivado cujo
  controle não foi conferido. Risco na seção 13 do plano técnico; conferir antes da rede principal (Sprint 16).
- **Perguntas do fundador:** as doze da seção 14.2 do plano técnico valem com a resposta recomendada, porque os
  documentos foram aprovados sem alteração. Segue sem resposta a verba e o fornecedor do segundo serviço.
- **Apresentação resumida do plano:** o `PITCH.md`, em português, segue não publicado. Falta decidir qual versão
  da seção de equipe vai na inscrição do hackathon: o deck diz "3 founders".
- **Coerência do BP v0.0.2:** há pontos que se contradizem entre as partes (critério de parada, tesouraria,
  quando sai o token A, cabeçalhos que ainda dizem "rascunho"). A Parte 4 ainda dá a Pyth na devnet como não verificada, e a Parte 2 não traz o número do mercado $LAPTOP que o deck usa. Falta uma passada para resolvê-los.
- **Direção de design:** Ledger² escura e clara, aprovada e documentada. O app ainda mostra a direção C; a troca
  é a Sprint -1 e as Sprints 09 a 13. Várias telas do protótipo mostram o modelo antigo e precisam de conteúdo novo.
- **Nome:** Brot Markets. O app e os protótipos ainda dizem "baked" ou `pred-provable`; o `package.json` da raiz diz
  `brot-markets` desde a Sprint 03.
- **Servidor:** o projeto tem espaço próprio no servidor compartilhado, com o código e o site provisório rodando.
  Falta o lugar do segundo serviço agendado.
- **Ferramentas locais:** a máquina de desenvolvimento da Sprint 02 (não o servidor compartilhado) tem Solana CLI
  3.1.10 e Anchor 1.1.2, e compila os dois programas para os testes. O que for para uma rede sai só dos artefatos da
  conferência automática.
- **Chave do endereço do programa:** só na máquina do fundador, em `target/deploy/`. Precisa de cópia de segurança.
- **Proteção da `main`:** indisponível em repositório privado da conta gratuita do GitHub.
- **Achados de segurança adiados:** os da Sprint 00 que cabiam na 02 foram tratados nela (com o SOL não há mais
  casa da moeda a conferir, e uma conta com marca de tipo nunca é reiniciada); os outros seguem nas Sprints 05, 09 e
  16. Os da Sprint 01, nas Sprints 03, 07 e 16; os da Sprint 02, nas Sprints 03, 04 e 05
  (`docs/sprints/sprint-02-pot-core.md`, "Reviews").
- **Regulação:** falta conferir a tramitação da MP 1.394 no Congresso e ler o Decreto 13.128, de 2026.
- **BP v0.0.2:** fechado, sem proposta em aberto. Faltam o primeiro valor do teto global e os nomes de quem assina a
  carteira com várias assinaturas.
- **Não verificado:** transações no app (conectar, comprar, vender, resolver) e o shader WebGPU da direção I.
- **`CODEMAP.md`:** o gerador aponta arquivos acima de 200 linhas e sem cabeçalho `Purpose:`, quase todos do
  programa e do app antigos; os números atuais estão no topo do próprio mapa.
- **O que o BP v0.0.4 deixa para o fundador:**
  - o teto da indicação em SOL;
  - a tesouraria, com tudo em SOL;
  - Cloak e SODAX com SOL;
  - as decisões da v0.0.3 que continuam abertas.
- **Documentos aprovados que contradizem o BP v0.0.4:** o resumo de produto e o design ainda falam em USDC, teto e
  abertura pela equipe; o plano técnico, o roteiro e o `CLAUDE.md` já foram refeitos. O deck e o site no ar dizem
  "0.02 SOL", "a cap" e "markets". A revisão de impacto lista o que muda em cada um.
- **A confirmar com o fundador:** a leitura de que a aprovação da proposta 0.4 "como está" aprovou também as
  recomendações D6 (renomear os termos no código), D7 (anular a campanha de preço cuja fonte parou) e D8 (desenhar a
  tela de abertura na Sprint -1).
- **Achados de segurança da revisão da proposta**, que valem para o servidor de hoje: o token do túnel do Cloudflare
  fica no ambiente de um processo que roda como o mesmo usuário do site provisório, então qualquer serviço desse
  usuário consegue lê-lo. A proposta recomenda um usuário por serviço e segredos carregados como credencial (seção 2.9).

---

## [sprint-01] — 2026-10-05 — A Pyth serve na devnet: o leitor de preço lê contas reais

Sprint 01 do roteiro (`docs/sprints/sprint-01-foundation.md`), mais o que entrou na `main` depois da tag
`sprint-00`. Entrou por dois pull requests: o #5, com a regra de fechamento de interação, e o #6, com a sprint e a apresentação resumida. A
tag `sprint-01` aponta para o merge do #6. O porquê de cada decisão está em
[session-log](session-log/2026-10-05-sprint-01-leitor-de-preco.md).

**Veredito da sprint:** a Pyth serve na devnet. Os programas e as contas de preço de SOL e de BTC existem lá, nos
mesmos endereços da rede principal. Seguem os cinco tipos de pergunta.

### Added

- **Leitor de preço** (`programs/brot-markets/src/readers/price_touch.rs`), só a leitura: confere o dono, o
  tamanho exato, o tipo da conta, a verificação completa e o ativo esperado, e devolve preço, margem, expoente,
  horário e slot. Aceita só a geração atualizada da Pyth. Nenhuma instrução o chama ainda.
- **Leitor de bytes com conferência de limites** (`readers/cursor.rs`): conta mais curta que o formato é erro,
  nunca pânico.
- **Quatro erros novos no programa:** dono errado, formato errado, verificação incompleta e ativo errado. O IDL
  commitado traz os quatro.
- **Testes:** dez do leitor e cinco do leitor de bytes (`programs/brot-markets/tests/`), contra três contas reais
  da devnet em `tests/fixtures/`; e `tests/fixtures.test.ts`, que confere o tamanho e o SHA-256 de toda conta
  capturada contra o índice.
- **Nota de pesquisa** `knowledge-base/tecnologia/pyth-leitor-de-preco.md`: as duas gerações de programas da Pyth,
  os endereços, o formato da conta, a frequência de atualização nas duas redes, a taxa, a exigência de chave no
  serviço de preços e o que a própria rede diz de quem controla os programas. Responde C1, C2, C3, C4 e C12 do
  plano técnico, duas delas em parte.
- `docs/business/PITCH.md`: a apresentação resumida do plano, etapa 2.9 do método, em dez seções derivadas do
  BP v0.0.2. Mantém as ressalvas do plano e diz o que o plano não tem. Não publicada
  ([session-log](session-log/2026-10-05-pitch-and-publication-decision.md)).
- `.claude/rules/interaction-closing.md`: regra de trabalho pedida pelo fundador. Toda resposta termina com um
  relatório breve do que foi feito, em português simples, e com os próximos passos: os caminhos possíveis, ligados
  ao roteiro, e uma recomendação ([session-log](session-log/2026-10-05-regra-de-fechamento-de-interacao.md)).

### Changed

- `scripts/capture-fixtures.ts` captura também da devnet, aceita um prefixo para capturar só um grupo, grava o
  SHA-256 de cada conta no índice, confere pelo código da rede que o endereço consultado é da rede certa e recusa
  conta que mudou de dono.
- `.gitattributes` marca `*.bin` como binário, para o Git nunca mexer nos bytes de uma conta capturada.
- O plano técnico marca o que a sprint conferiu (C1 a C4, C12, T2) e ganha dois riscos: quem controla a Pyth, e a
  dependência da conta de preço patrocinada. As Sprints 03, 06, 07 e 16 ganham uma seção "Herdado da Sprint 01".

### Não feito

- **A leitura no Surfpool**, que era critério de pronto. Passou para a Sprint 03; o motivo está no documento da
  sprint.
- A atualização das ferramentas da máquina de desenvolvimento, por falta de memória e de disco.

---

## [sprint-00] — 2026-10-05 — Bakedtruth vira Brot Markets: plano de negócio, direção Ledger², documentos da Fase 4 e a fundação do programa novo

Primeiras mudanças do projeto em si; as versões abaixo desta são a história do AI Dev OS, herdada na Largada.
Trabalho de 2 a 5 de outubro de 2026. Entrou na `main` em 5 de outubro por três pull requests: o #1, com os
documentos das Fases 2 a 4 e a base do app; o #2, com a Sprint 00; e o #3, com uma correção da conferência
automática. A tag `sprint-00` aponta para `dfc1d6e`. Os motivos de cada decisão estão no `session-log/`, uma
entrada por assunto, listadas em `session-log/INDEX.md`.

### Added — Prototype Lab (`prototype-lab/`)

Catorze direções em HTML, CSS e JS sobre os mesmos dados sintéticos (`shared/mock-data.js`), a mesma lógica
(`shared/app.js`) e o mesmo mascote (`shared/mascot.js`). O `README.md` do lab descreve cada uma.

| Direções | O que são |
|---|---|
| A · Ledger, B · Oven, C · Tape | As três hipóteses de marca originais |
| D · Ledger², E · Oven², F · Tape² | As três anteriores com a home em mosaico |
| G · Casino | Registro de aposta levado ao extremo, como teste |
| H · Prism, I · Blocks, J · Orbit | Variações de Ledger e Tape com cara de mercado preditivo web3 |
| K · Desk, L · Arena, M · Vault | A estrutura da Ledger² em três visuais (papel claro, neobrutalismo, carteira roxa), com tabela e feed, descoberta e ranking, carteira simulada e ciclo de vida |
| N · Ledger² Light | A D em tema claro, com um botão que volta ao escuro da D. Só tokens sobre `shared/ledger.css`; nenhuma estrutura nova |

- `shared/mosaic.js`: carrossel e listas laterais da home em mosaico (D a M).
- `shared/shader.js`: fundo em WebGPU com reserva em Canvas 2D (I).
- `shared/ledger.js` e `shared/ledger.css`: estrutura da Ledger² com cor, raio, borda e fonte como variáveis (K, L, M).
- `shared/mock-data.js` ganhou `upcoming`, `leaders`, `wallet` e `sponsors`, todos sintéticos.

### Added — documentos

- `docs/product/DESIGN-DIRECTION.md`: a direção C como aprovada em 2 de outubro, com tokens, telas, fluxo e quinze
  lacunas. Marcada como reaberta em 3 de outubro.
- `knowledge-base/briefing-ideacao-nome-e-mascote.md`: contexto do projeto para nome e mascote.
- `knowledge-base/pesquisa-nome-do-site.md`: pesquisa de nome, com fontes; finalistas Ovenproof e Baked Markets.
- `docs/product/`: as oito poses do mascote e a página de referência `baked-home.html`.
- `knowledge-base/referencias/`: leitura da documentação e da central de ajuda do Polymarket e da documentação da
  Kalshi, com o que não pôde ser lido.
- `knowledge-base/competitors/mercados-de-previsao-web3.md`: treze mercados on-chain, três analisados.
- `knowledge-base/market/`: receita dos mercados de previsão, modelos de token e pump.fun, rendimento do pote.
- `knowledge-base/tecnologia/privacidade-entre-redes-e-x.md`: Cloak e alternativas, pagamento entre redes, API do X.
- `knowledge-base/market/patrocinio-e-destaque-pago.md`: precedentes de patrocínio em mercados de previsão e em
  plataformas de tokens.
- `docs/business/BRIEFING-MERCADO-DE-POTE.md`: briefing do modelo de pote para discussão com o Ronaldo, com cada item
  marcado como decidido, proposta ou em aberto.
- **`docs/business/BUSINESS-PLAN.md`, v0.0.2** (5 de outubro): índice e resumo de uma página das quatro partes, com
  a situação das decisões e os riscos. A v0.0.1 foi movida para `docs/business/_review/BUSINESS-PLAN-v0.0.1.md`.
- **BP v0.0.1** (4 de outubro, hoje em `_review/BUSINESS-PLAN-v0.0.1.md`): 16 capítulos e três anexos, cerca de 63.700 palavras,
  com as decisões do fundador e 31 objeções registradas. Feito pelas três ondas do wizard
  ([session-log](session-log/2026-10-04-ondas-de-pesquisa-e-bp-v0.0.1.md)).
- **`docs/business/BP-v0.0.2-parte-1-produto.md`** (4 de outubro): primeira das quatro partes do BP v0.0.2, com cerca
  de 11.500 palavras. O nome passa a ser Brot Markets. Incorpora a revisão do fundador
  (`_review/user-review-v0.0.1.md`) e a revisão de impacto com a simulação da taxa
  (`_review/bp-impact-review-v0.0.2.md`). **Corrigida em 5 de outubro** com as respostas do fundador: taxa de 10% do
  lado perdedor, um fechamento só com perguntas de até 90 dias, vigia do serviço, disputa e indicação como decisão.
  A lista dos tipos de pergunta do primeiro dia foi decidida no mesmo dia: cinco tipos, com o leitor de preço
  construído primeiro. Sobra um detalhe, o teto da devolução ao indicado.
- **`docs/business/BP-v0.0.2-parte-2-mercado-e-negocio.md`** (4 de outubro): segunda parte, com cerca de 11.500
  palavras. Modelo financeiro refeito com as decisões novas (`_review/pauta-bp-v0.0.2-parte-2.md`): 75% da taxa para a
  operação, custo de 5.500 dólares por mês. **Corrigida em 5 de outubro:** a taxa de 10% do lado perdedor vira a
  base das tabelas (média de 3,70% do volume), o gasto antes do dinheiro real passa a 7.500 (abertura da empresa e
  um mês de devnet) e o ponto de equilíbrio cai para cerca de 209 mil dólares apostados por mês. As sete decisões
  foram respondidas.
- `docs/business/_review/correcoes-bp-v0.0.2-partes-1-e-2.md` (5 de outubro): as respostas do fundador às treze
  pendências das Partes 1 e 2, com a conta do pote na taxa nova e o modelo financeiro refeito
  ([session-log](session-log/2026-10-05-bp-v0.0.2-taxa-decidida-e-partes-corrigidas.md)).
- `docs/business/_review/pauta-bp-v0.0.2-parte-3.md` (5 de outubro): roteiro da Parte 3, de tokens.
- **`docs/business/BP-v0.0.2-parte-3-tokens.md`** (5 de outubro): terceira parte, com cerca de 11.800 palavras. O
  token A no pump.fun como canal de tração, com a taxa de criador indo ao fundo de prêmios; o token B com staking
  com trava, desconto na taxa, voto e cofre; a ponte que queima A para comprar B; ordem e calendário; o que a
  avaliação jurídica precisa olhar. As sete propostas foram aprovadas pelo fundador no mesmo dia ("sobre as 7 decisões, concordo"), junto com o
  teto de 5 USDC na devolução ao indicado. O texto diz o tamanho do dinheiro: no
  cenário razoável o cofre receberia cerca de 900 dólares por mês, e no ruim, nada.
- **`docs/business/BP-v0.0.2-parte-4-construcao-e-risco.md`** (5 de outubro): quarta e última parte, com cerca de
  11.950 palavras. O que existe e o que será construído; o roteiro em quatro fases; o que protege o dinheiro
  (auditoria, carteira com várias assinaturas, tetos, os dois serviços, pausa e plano de incidente); as peças de
  fora (Pyth, Cloak, SODAX, pump.fun, X); pessoas e empresa; regulação; a tabela de riscos. Registra três tensões
  sem mudar as decisões: o prazo de um mês, a falta de bloqueio de país com sócios no Brasil, e a dependência de
  poucas pessoas. As oito propostas foram aprovadas pelo fundador no mesmo dia. Pauta em `_review/pauta-bp-v0.0.2-parte-4.md`.
- `knowledge-base/market/regulacao.md` (5 de outubro): nota sobre a Medida Provisória 1.394, de 25/9/2026, lida no
  Planalto. Ela proíbe a aposta de quota fixa em todo o país, inclusive por empresa do exterior.
- **`docs/product/DESIGN-DIRECTION.md`, reescrito** (5 de outubro): passa a descrever a direção aprovada, Ledger²
  escura (D) e clara (N), com tokens dos dois temas extraídos do código, 19 conflitos entre o protótipo e o produto
  decidido e 22 lacunas de tela. A versão da direção C saiu.
- **`docs/product/PRODUCT-BRIEF.md`, v0.0.1** (5 de outubro): resumo operacional de produto, com doze fluxos, 32
  regras de negócio com referência, escopo por fase, a confrontação do protótipo tela a tela e 25 lacunas.
- `knowledge-base/tecnologia/servidor-e-dominio.md` (5 de outubro): o servidor compartilhado, as regras de
  convivência, o que o token do Cloudflare enxerga e o espaço criado para o projeto
  ([session-log](session-log/2026-10-05-servidor-e-inicio-da-fase-4.md)).
- **`docs/technical/TECHNICAL-PLAN.md`, v0.0.1** (5 de outubro): programa novo em `programs/brot-markets`, com
  contas, instruções, estados e dez invariantes de dinheiro; três serviços fora da rede; site em Ledger²;
  implantação no servidor compartilhado; programa compilado só na integração contínua. Doze perguntas para o
  fundador e treze pontos a conferir. Achou que a cópia local tem seis leitores, e não nove.
- **`docs/SPRINTS.md` e `docs/sprints/`** (5 de outubro): roteiro de 20 sprints, sem datas, na ordem pedida pelo
  fundador: programa (00 a 05), serviços (06 a 08), design system (-1), site (09 a 13), o que entra antes da rede
  principal (14 e 15) e segurança e abertura (16 a 18). Cada sprint traz critério de pronto, regras e fluxos
  cobertos e as decisões do fundador que a travam.
- `CODEMAP.md` (5 de outubro): primeiro mapa do código, gerado por `node scripts/codemap.js`. 111 arquivos.
- `docs/business/ideacao-perguntas-e-respostas.md`: as cinco rodadas de perguntas e as respostas do Lucas, com o
  estado consolidado no topo.
- `docs/business/_review/`: plano das ondas, seis relatórios da Onda 2 (advogado do diabo, negócio e finanças, técnica
  e segurança, conformidade, modelo financeiro, viabilidade do MVP), o relatório do coordenador e as três partes do BP.
- `knowledge-base/` (Onda 1): lista longa e análise dos cinco concorrentes, tamanho de mercado, regulação, público
  web3, monetização e tesouraria, dois tokens e venda privada, saída antecipada e tipos de pergunta, e o índice de
  fontes (`market/source-index.md`, 663 endereços).
- Session log da redefinição do produto como mercado de previsão em pote
  ([entrada](session-log/2026-10-03-produto-redefinido-como-mercado-de-pote.md)). Nenhum código mudou por causa dela.

### Added — Sprint 00 (setup)

- **`programs/brot-markets`**: o programa novo, ao lado do antigo, com endereço próprio. Só o esqueleto: constantes
  (sementes, USDC, teto da taxa, aposta mínima), erro, eventos e as pastas `state/`, `math/`, `readers/` e
  `instructions/`. Nenhuma instrução.
- **`packages/sdk`**: biblioteca do cliente, por ora com o endereço do programa e o IDL. O workspace do Bun ganha
  `packages/*` e `services/*`.
- **Upstream `0xcf07/pred-provable@4d672ae`**, por merge: os leitores de pool de staking, liquidez travada na Meteora
  DAMM v2 e metadados imutáveis, as contas reais capturadas em `tests/fixtures/` e o script de captura.
- **CI**: compila os dois programas; publica `.so`, IDL e tipos como artefato com SHA-256; confere o IDL dos dois
  com `git status`; clippy nos dois pacotes; e o trabalho "Repo", com o mapa de código, a coerência do projeto e a
  varredura de segredos sobre a branch (`scripts/ci-secret-scan.js`).
- `docs/technical/registry-pick.md`: a etapa 4.3 do método. Dos 72 pacotes do catálogo, nenhum para instalar.
- **Depois da revisão de segurança:** o artefato publicável (`.so` com SHA-256) sai só de push na `main` e só
  depois dos testes; o IDL gerado tem um artefato de pré-visualização, sem binário; o `Cargo.lock` é imposto;
  o IDL antigo é apagado antes do build; o clippy compila também a variante `mainnet`.
- **Varredura de segredos:** reconhece par de chaves da Solana e chave de API em URL; o filtro de nome e o
  `.gitignore` cobrem `.env.<fase>`, `*.env`, `*keypair*.json` e `id.json`; no CI ela olha commit por commit.
- **No programa novo:** `init-if-needed` desligado e três lints de aritmética em `deny`.

### Fixed — Sprint 00

- `scripts/codemap.js`: a descrição de um arquivo dependia do fim de linha do checkout, e o `--check` falhava só
  no Linux do CI. O conteúdo é normalizado antes da leitura.
- `scripts/instruction-drift.js`: quatro nomes do `PRIVACY_PLAN.md` do upstream entram na lista de referências
  externas, com o motivo.
- `CLAUDE.md`: ganha a seção "State of the rewrite" e os comandos dos dois programas.
- Decisões e riscos em [session-log](session-log/2026-10-05-sprint-00-setup.md).

### Changed — app (`app/`)

- Base atualizada com a versão nova do `pred-provable` (`0xcf07/pred-provable@638752c`): tokens YES/NO com USDC, pool,
  explorador de mercados, tela de mercado, compra e venda.
- Layout da direção C aplicado sobre ela: paleta, cantos retos, bordas de 2 px, sombras duras, Jersey 15 e Space
  Grotesk; ticker, categorias segmentadas, grade de células ao fundo, medidor no topo, fita de mercados em linhas com
  trilho luminoso, prova on-chain primeiro na tela de mercado.
- Mascote portado para TypeScript (`app/lib/mascot/`, `app/components/mascot.tsx`).
- Nome provisório "baked" concentrado em `app/lib/brand.ts`.

### Changed — base do repositório

- `CLAUDE.md` passou a juntar a orientação do `pred-provable` com o método do AI Dev OS.
- `package.json` e `.gitignore` mesclados com os do OS na Largada
  ([session-log](session-log/2026-10-02-largada-import-pred-provable-e-os.md)).

---

## [0.5.6] — 2026-10-01 — Sensores com ponto de entrada: `npm test`, Biome, hook de feedback e pre-commit

Um scanner externo de maturidade de harness ([harness-score](https://github.com/paladini/harness-score) v1.7.5, rodado de fora do repositório) mediu o OS em **L2, 80/108**. Quatro das seis dimensões estavam entre 78% e 100%; "Sensors & Feedback" estava em 2/20, por uma causa só: os testes existiam e rodavam no CI, mas sem `package.json` não havia ponto de entrada padrão por onde um agente — ou uma ferramenta — os encontrasse. Depois desta release o mesmo scan dá **L4, 101/108**. Raciocínio e o que ficou de fora em [`session-log/2026-10-01-v0.5.6-harness-sensors.md`](session-log/2026-10-01-v0.5.6-harness-sensors.md).

Tudo aqui foi desenhado para ser **herdado**: o que entra na raiz do OS entra na raiz de todo projeto derivado.

### Added — manifesto e linter

- `package.json` na raiz, com `npm test`, `npm run lint`, `npm run format`, `npm run self-test` e `npm run codemap`. Sem campo `version`, de propósito: seria um terceiro lugar para a versão divergir. `"type": "commonjs"` é explícito porque, sem ele, o Biome trata os scripts como módulos ES e manda remover o `'use strict'` de arquivos que precisam dele.
- Biome 2.5.15 (versão exata) como única dependência, com `biome.json` no estilo que o código já usava: dois espaços, aspas simples, largura 120. `prototype-lab/` fica fora — protótipo é descartável por definição.
- `package-lock.json` commitado.

### Added — `lint-on-edit`, o primeiro hook de feedback

`.claude/hooks/lint-on-edit.js` roda em `PostToolUse` e devolve ao Claude o que o Biome achou no arquivo que ele acabou de editar. Não bloqueia e não reescreve o arquivo — formatar por baixo do agente faz o próximo `Edit` falhar em conteúdo que ele não viu mudar. Sem o Biome instalado, sai em silêncio: um clone novo se comporta como antes.

O README dos hooks passa a separar **gate** (irreversível, bloqueia) de **feedback** (reversível, avisa). Ainda durante a implementação, o hook pegou uma função declarada e nunca chamada no próprio `os-self-test.js`.

### Added — `sensor-wiring`, 12º grupo do `os-self-test`

`scripts/sensor-wiring.js` verifica que existem script `test` e `lint`, configuração de linter, lockfile, hook `PostToolUse` e pre-commit do git, e que o CI roda teste e lint — sensor que existe e não barra nada é decoração. Sensor ausente é **erro** no repo do OS e **aviso** no projeto derivado, que pode ter trocado de stack. No derivado, avisa também enquanto o `package.json` ainda se chamar `ai-dev-operating-system`.

### Added — pre-commit do git

Os hooks do Claude Code só veem o que o Claude faz; um commit pelo terminal ou pelo editor nunca passava pelo scan de segredo. `.husky/pre-commit` chama `scripts/pre-commit.js`, que roda **o mesmo `scan`** do `block-secret-commit.js` e o Biome nos arquivos staged. Sem dependência do husky: o script `prepare` faz `git config core.hooksPath .husky` no `npm install`.

### Fixed — a regra de segredos era barrada pelo próprio gate

`.claude/rules/secrets.md` trazia o cabeçalho literal de chave privada na lista de padrões, e o `block-secret-commit` casa com ele: editar aquela linha barraria o commit da própria regra. O teste que deveria garantir o contrário usava um trecho escrito à mão que omitia justamente essa linha. A regra passa a escrever `-----BEGIN ... PRIVATE KEY-----`, e o teste agora lê os arquivos reais — `CLAUDE.md` e todo `.md` de `.claude/`.

### Fixed — remover um `.env` rastreado era barrado

O gate listava os arquivos staged sem filtrar deleções, então `git rm .env` — a correção para um arquivo de segredo commitado — era tratado como "arquivo de segredo no stage". Presente desde a v0.5.2; apontado na revisão do PR. `stagedFiles()` agora ignora deleções e é compartilhada pelo gate e pelo pre-commit.

### Changed

- `npm test` chama `scripts/run-tests.js`, que lista os arquivos de teste. Um glob no script dependia do shell e falhava no Windows com Node 20.
- CI: `npm ci`, `npm test` e um passo novo de `npm run lint`.
- `templates/project/CLAUDE.md` e `stack-packs/README.md` dizem ao projeto derivado que o manifesto herdado é o ponto de partida: mesclar a stack nele, não deixar um scaffolder sobrescrever.
- `CLAUDE.md` ganha "Checking your work"; `code-style` registra que estilo é da ferramenta.
- Código existente: `require('fs')` virou `require('node:fs')`, duas atribuições dentro de expressão foram abertas, e uma passada de formatação.
- README: selo fixo "Harness Score L4" com um parágrafo datado dizendo o que a nota é e o que não é — não é auditoria de segurança nem certificação, e não vale para o projeto derivado. O selo de status, parado em v0.5.3, foi para v0.5.6.

48 testes novos, 163 no total. 80 verificações no `os-self-test`.

---

## [0.5.5] — 2026-09-28 — Auditoria de prompts para o Opus 5.5, e o drift de instruções vira check

Uma passada de `prompt-audit` sobre toda a superfície que o modelo lê — `CLAUDE.md`, template de projeto, regras, 12 agentes, 11 comandos, 28 skills — com o Opus 5.5 como alvo. Dezesseis achados com edição, cinco só sinalizados. Detalhes e raciocínio em [`session-log/2026-09-28-v0.5.5-prompt-audit.md`](session-log/2026-09-28-v0.5.5-prompt-audit.md).

### Fixed — instruções que apontavam para o que não existe

- `templates/project/CLAUDE.md` — o arquivo que vira a constituição de **todo projeto derivado** — citava `security-agent`, `/feature-new`, `/privacy-check` e `/session-log`, nenhum dos quais existe. Vinha do commit inicial. A auditoria de skills de 2026-08-08 já tinha registrado parte disso por escrito, e o defeito sobreviveu mesmo assim.
- `SECURITY.md` citava `technical-red-team-agent`; o nome é `technical-security-red-team-agent`.
- `rollback-safe`: `git revert <bad-commit>..HEAD` **não reverte o primeiro commit ruim** — o intervalo exclui a ponta esquerda. O texto já dizia "pegue o último commit bom"; o comando agora usa esse commit.

### Fixed — arquivos que contradiziam regras mais novas

- `sprint-management` e o template mandavam regenerar o codemap só ao criar, remover ou renomear arquivo. A regra `codemap.md` diz que mudar a contagem de linhas basta — é o que faz o CI falhar.
- `privacy-audit` prometia as nove perguntas da regra e a saída tinha seis campos. Entraram quem acessa, logs, caminho de exclusão/exportação e impacto em política.
- `secrets-discipline` listava `sk_`, `pk_`, `re_` e `AIza`, mas não os padrões de `rules/secrets.md` — `sk-`, `ghp_`, `AKIA` —, justamente os das chaves que a própria descrição cita.
- `os-self-test`: a tabela de verificações parou em 8 grupos; o script roda 11.
- CI: `x.com` passou a responder 403 a robôs, e o lychee reprovava o link real do perfil em `README.md` e `ATTRIBUTIONS.md`. Entrou na lista de exclusão ao lado do `linkedin.com`, pelo mesmo motivo.

### Changed — texto escrito para modelos anteriores

- `prototype-lab` passa a nomear os estilos-padrão que o modelo usa quando não recebe direção (fundo creme, itálico em manchete, rótulos "01/02/03", monoespaçado, botão pílula). Pedir "três direções distintas" sem isso tende a produzir três variações do mesmo padrão.
- Os sete agentes de uma linha (os três red teams, competitor, market, coordinator, copywriter) carregam o caminho de saída e o formato que o WIZARD define. Quem os chamava pela frase-gatilho, fora do wizard, rodava sem isso.
- Modelos fixados por versão (`cost-watchdog`, exemplo Next.js + Supabase) viraram nome de tier.
- Narrativa de versão ("invertido na v0.5.0", "Sprint -1 mudou de função", "desde a v0.5.2") saiu de `CLAUDE.md`, `project-genesis`, `sprint-roadmap`, `os-self-test`, `WIZARD.md` e `docs/wizard/phase-4`. A regra e o motivo ficaram; a arqueologia mora aqui e no session-log.
- Tetos numéricos que contradiziam o próprio template (`daily-standup` "exactly 4 bullets", `plain-portuguese-explainer` "three-line max") viraram descrição do objetivo.

### Added — `instruction-drift`, 11º grupo do `os-self-test`

`scripts/instruction-drift.js` varre a superfície de instruções e **falha** quando um arquivo cita agente, comando ou estágio do WIZARD que não existe; **avisa** quando fixa uma geração de modelo em prosa. Registros datados, `CHANGELOG` e release notes ficam fora — são história, não instrução.

Rodado contra a `main` anterior a esta release, pega os cinco defeitos de referência e os quatro modelos fixados. Na primeira execução no branch, achou o do `SECURITY.md`, que a auditoria manual tinha deixado passar.

21 testes novos, 115 no total.

---

## [0.5.4] — 2026-08-09 — O curso saiu de dentro do OS

`course/` virou repositório próprio: **`lglucas/ai-dev-os-course`**. Nada de conteúdo mudou — os 11 arquivos foram para lá com histórico via `git subtree split`, e o Sprint 0 em andamento veio junto no branch `sprint-0-systems-html`.

### Removed — `course/` (11 arquivos, 1.525 linhas)

A justificativa original de morar junto era **versionamento conjunto**, e ela não se sustentou. Este repo foi da v0.4.5 à v0.5.3 — inverteu duas fases do wizard, criou o Pitch, criou o CODEMAP — e o curso não acompanhou nenhuma delas, acumulando 66 referências a uma numeração de estágios extinta. Mesmo repositório, mesmas releases, e o material envelheceu sozinho.

O que decidiu foi a **herança**. Clonar o OS ou usar "Use this template" levava `course/` junto, e nenhum arquivo de entrada — README, `START-HERE.md`, `CLAUDE.md`, `WIZARD.md` — mencionava a pasta uma vez sequer. O aviso "pode apagar esta pasta" existia dentro da própria pasta que a pessoa não sabia que tinha, e o detach nunca a removia: quem usa o botão "Use this template" nem chega a rodar o detach.

Com o CODEMAP da v0.5.3 isso pioraria. `course/systems/` tem `.js`, `.ts` e `.sql`, e o `SKIP_DIR` do gerador não cobria `course` — então o mapa de código de um fundador passaria a listar a infraestrutura do curso como se fosse dele. Justamente o arquivo cuja função é achar o próprio código rápido.

### Kept — a convenção de tags

[`.claude/rules/wizard-stage-tags.md`](.claude/rules/wizard-stage-tags.md) fica. A convenção `[STAGE:X]` é opt-in e serve a qualquer pessoa que queira rastrear progresso do wizard pelos commits. O curso é o maior consumidor dela, não o dono.

### Added — o self-test agora verifica o manifesto do plugin

Décimo grupo de verificação. Confere que `.claude-plugin/plugin.json` está na versão do topo do `CHANGELOG.md` e que o número de skills anunciado bate com os `SKILL.md` que existem.

Foi escrito porque o defeito já tinha acontecido: o manifesto ficou parado em `"0.5.2"` e `"27 skills"` durante a v0.5.3 inteira. Atualizei as contagens do README naquela release e não propaguei para o manifesto — e como nada consumia aqueles números, nada acusou. Estreou pegando o próprio commit que a criou.

### Fixed

- `.claude-plugin/plugin.json`: versão e contagens atualizadas, e a descrição passou a citar o CODEMAP e as 12 regras.

---

## [0.5.3] — 2026-08-08 — CODEMAP: a IA acha o arquivo sem ler o repositório

Nova camada de documentação, e ela existe pelo mesmo motivo que o limite de 200 linhas: **menos token lido por tarefa**. Arquivos curtos resolvem metade; um índice de uma linha por arquivo resolve a outra.

Detalhes em [`RELEASE-NOTES-v0.5.3.md`](RELEASE-NOTES-v0.5.3.md).

### Added — `CODEMAP.md` como camada de documentação

Todo arquivo de código com uma linha sobre seu núcleo, agrupado por diretório, com contagem de linhas. **Leia antes de procurar** — uma leitura contra dezenas.

| Peça | O que faz |
|---|---|
| `scripts/codemap.js` | gera e verifica; `--check` sai 1 se divergir |
| `.claude/rules/codemap.md` | a regra, curta — ler antes de buscar, regenerar ao mexer em arquivo |
| `.claude/skills/codemap/SKILL.md` | 28ª skill, com gatilhos ("onde fica o arquivo de X?") |
| `templates/project/CODEMAP.template.md` | placeholder para projeto novo |
| Job de CI | falha quando o mapa está desatualizado |

**Escopo: o projeto derivado, não o OS.** Dentro do repositório do próprio AI Dev OS o script se desliga e sai 0 — o OS entrega a maquinaria, o projeto é que tem o código.

### Changed — a descrição é gerada, não escrita à mão

Extraída do cabeçalho `Purpose:` que a `code-style` **já exigia**. Fallback: bloco de comentário → comentário de linha → `⚠️ sem cabeçalho`.

Esse último caso é deliberado: arquivo sem cabeçalho aparece marcado no mapa, ou seja, **o codemap acaba fiscalizando a regra de cabeçalho** como efeito colateral. Se uma descrição ficou ruim, o defeito está no cabeçalho — o conserto é lá, não no mapa.

O mapa também reporta quem passou de 200 linhas. Nenhum dos dois avisos bloqueia; o que bloqueia é o mapa estar **desatualizado**.

### Changed — enforcement contínuo, não boa intenção

`sprint-management` regenera durante a sprint e no fechamento; `release-check` delega antes de qualquer release; `os-self-test` valida que a camada está fiada. E o CI falha na divergência.

Foi essa a escolha porque já sabemos o que acontece sem gate: três session-logs registram o `os-self-test` não sendo executado quando era skill.

### Added — 19 testes novos

94 no total. Cobrem extração de `Purpose:` (JSDoc, hash, multilinha nos dois estilos), os três fallbacks, escape de pipe que quebraria a tabela, a recusa em seguir symlink rastreado, e a descoberta de arquivos — incluindo o caso de `src/distribuidor/` não ser confundido com `dist/`.

### Fixed

- `templates/project/CODEMAP.template.md` linkava `.claude/rules/codemap.md`, que resolve na raiz do projeto derivado mas não de `templates/project/`. Pego pelo próprio `os-self-test`. Virou caminho em texto, com a razão explicada.
- Numeração duplicada em "Close sprint" após inserir o passo do codemap.

---

## [0.5.2] — 2026-08-08 — Prototype before spec, and the kernel that enforces the rules

The largest release since the OS went public. Two structural changes: the wizard now **prototypes before it specifies**, and the OS finally **enforces something mechanically** instead of only asking the model nicely.

Shipped as six reviewed PRs (#11–#16). Full rationale in [`RELEASE-NOTES-v0.5.2.md`](RELEASE-NOTES-v0.5.2.md).

| PR | Frente |
|---|---|
| #11 | WIZARD reestruturado em 5 fases, protótipo antes da spec |
| #12 | Auditoria de skills — 6 sem frontmatter, 10 sem gatilho |
| #13 | Artefato Pitch + a pergunta "BP online?" |
| #14 | Catálogo self-hosted com 1.346 projetos |
| #15 | Pesquisa de equivalentes para as 7 lacunas |
| #16 | O kernel: hooks, self-test no CI, plugin, testes |

---

## v0.5.2 — o kernel

Até aqui o OS era **100% persuasão**: regras que o modelo lê, skills que ele invoca, um wizard que ele segue. O `settings.json` versionado tinha três linhas e nenhum hook. A golden rule nº 1 é "nunca commite segredos" e nada impedia isso mecanicamente.

### Added — hooks PreToolUse (enforcement de verdade)

| Hook | Dispara em | Bloqueia |
|---|---|---|
| `block-secret-commit.js` | `Bash` → `git commit` | diff que adiciona algo com formato de credencial, ou `.env`/`.pem`/`.key` staged |
| `protect-env-files.js` | `Write`, `Edit`, `MultiEdit`, `NotebookEdit` | escrita em `.env` real (`.env.example` liberado) |

**Os padrões exigem formato completo, não prefixo.** `.claude/rules/secrets.md` cita `sk-` e `AKIA` como texto literal; casar por prefixo bloquearia commitar a própria regra que os define. Agora é `sk-` + 20 caracteres, `AKIA` + exatamente 16, `ghp_` + exatamente 36.

Três decisões que não são óbvias: **o hook nunca imprime o valor casado** (um alerta que ecoa a credencial a espalha); **só linhas adicionadas disparam** (remover chave vazada precisa continuar possível); e **ambos falham abertos** em payload malformado, porque hook que trava a sessão por engano faz o usuário desligar tudo.

Escape hatch por execução: `AIOS_ALLOW_SECRET_COMMIT=1`, `AIOS_ALLOW_ENV_WRITE=1`.

`.claude/hooks/README.md` documenta também **o que deliberadamente não virou hook** — forçar ordem do wizard, exigir changelog, bloquear push. Regra de bolso: hook para o que é irreversível.

### Fixed — frontmatter em comandos e agentes

Mesmo defeito do PR 3, uma camada abaixo:

| | Antes | Depois |
|---|---|---|
| Comandos com frontmatter | 0/11 | **11/11** |
| Agentes com frase-gatilho | 2/12 | **12/12** |

Os dois agentes que já tinham gatilho nasceram no pack v0.3.0 — a mesma fratura geracional das skills. `legal-compliance-agent` é acionado por dez arquivos vivos e tinha zero.

### Changed — `os-self-test` virou script e roda no CI

Era skill; dependia de alguém lembrar. Três session-logs registram ela **não sendo executada** quando teria ajudado.

`scripts/os-self-test.js` verifica estrutura canônica, frontmatter, links relativos, integridade do registry nos dois sentidos, indexação do session-log, wiring dos hooks, gitignore e artefatos de projeto — com modo repo-do-OS vs. projeto derivado detectado pelo `.aios-self`. Novo job no CI. **67 verificações, zero erro.**

### Added — manifesto de plugin

`.claude-plugin/plugin.json`. Antes o OS só se distribuía por clone ou "Use this template", sem instalação versionada nem marketplace.

### Changed — orçamento de contexto das regras reequilibrado

Tudo em `.claude/rules/` entra em todo prompt. `security-baseline` tinha **3 linhas**; `wizard-stage-tags`, **60** — 25% do orçamento para uma convenção opt-in.

Agora: `security-baseline` 42 linhas de procedimento acionável (incluindo testar com dois usuários para pegar IDOR, e rotacionar **antes** de investigar quando algo vaza), `wizard-stage-tags` 19 de ponteiro. Total 236 → 234: o ponto não era cortar, era gastar onde importa.

### Added — 75 testes, que acharam 2 bypass reais

`node:test`, zero dependências. E encontraram duas formas de contornar o hook de segredo:

1. **`git -C /tmp commit`** não era reconhecido — o regex só tratava flags sem valor.
2. **`git add . && git commit`** também passava — eu retornava no primeiro segmento do shell.

`isGitCommit` virou tokenização em vez de regex. Um hook de segurança revisado e testado à mão ainda tinha dois furos que só apareceram quando um teste tentou quinze formas de escrever o comando.

`sync-selfhosted.js` ganhou guarda `require.main` — sem ela, importá-lo num teste dispararia um `git clone`.

### Added — `docs/selfhosted/gaps.md`, closing what the mirror cannot

PR 4 documented that the awesome-selfhosted mirror covers nothing for auth, uptime, CI/CD, backup, PaaS, static sites or VPN. This closes that with original research: **90+ candidate repositories queried through the GitHub API on 2026-08-08** — stars, licence, last push, archived status. No figure written from memory.

Unlike the rest of `docs/selfhosted/`, this file is **authored, not mirrored** — MIT rather than CC-BY-SA, and never touched by `sync-selfhosted.js`.

Covers auth/SSO, uptime, CI/CD, backup, PaaS, static sites, VPN, BaaS and events, plus observability, error tracking, secrets, object storage, feature flags, search, workflow and LLM infrastructure. Each category ends with a single "if you only want one choice" recommendation — and for CI/CD that recommendation is to stay managed.

### Added — "open core" as a third licence trap

Reading the actual licence file wherever the API returned `NOASSERTION` surfaced a category the previous PR missed. **Thirteen projects open their licence with _"Portions of this software are licensed as follows"_** — authentik, SuperTokens, Dokploy, Pangolin, SigNoz, Infisical, n8n, LiteLLM, Langfuse, GrowthBook, Meilisearch, Windmill, Duplicati.

Open core means the core is free but **SSO, RBAC and audit logs live in the paid edition**. It is the cruellest trap for a founder: the project presents as open source and gets adopted, and the limitation only appears when the first corporate customer asks for single sign-on. Stage 4.2 now instructs Claude to check which edition holds the needed feature before recommending.

Reading the files also corrected facts that would otherwise have been wrong: **Sentry is FSL-1.1, not BUSL**; **Vault is BUSL-1.1**, which is precisely why **OpenBao** exists (pre-BUSL fork, MPL-2.0, Linux Foundation); **Open WebUI** ships a custom "all rights reserved" licence despite 148k stars. Conversely CapRover, Astro, NetBird and Borg looked suspicious as `NOASSERTION` but are plainly permissive.

### Documented — Supabase self-hosts, Luma has no equivalent

**Supabase** (Apache-2.0, 107.7k stars) is the most-starred repository in the entire research and does self-host — with the honest caveat that the compose file is ~10 services and running it in production is its own job.

**There is no Luma clone.** What exists covers ticketing (Hi.Events, pretix, alf.io) or 1-to-1 scheduling (Cal.com), not Luma's community-calendar experience. The closest in spirit, Mobilizon, **does not live on GitHub** — it is on framagit — so it can never surface in a star-ranked search. Stated plainly rather than pushing Cal.com as a substitute.

Two incidental warnings recorded: `calcom/cal.com` has been **renamed to `calcom/cal.diy`**, and **Attendize has had no commits since 2024-08** despite leading its category on stars — which is why stars rank candidates but do not choose them.

### Added — self-hosted catalogue (1.346 projects) and the stage 4.2 question

`docs/selfhosted/` mirrors [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) so the WIZARD can offer concrete self-hosted alternatives without a network call.

| Layer | What | Generated? |
|---|---|---|
| `shortlist-saas.md` | ~20 categories a SaaS founder actually replaces, framed as "you pay for X → alternative Y" | ✋ hand-curated |
| `INDEX.md` + `catalog/` | all 1.346 entries; 95 upstream tags collapsed into 12 macro-categories | 🤖 generated |
| `README.md` | licence carve-out, regeneration, honest trade-off table | ✋ hand-curated |
| `scripts/sync-selfhosted.js` | regenerator; never overwrites the two hand-curated files | — |
| `docs/registry/packs/awesome-selfhosted.md` | one-pager, so it is discoverable from the registry | ✋ |

**New question at WIZARD stage 4.2**, before the stack is locked: managed platforms, self-hosted, or hybrid? Presented as a question with both sides, not a recommendation. The stage carries an explicit instruction *not* to push self-hosting — "managed for everything" is frequently right for a solo non-developer, and self-hosting trades vendor cost for time and operations: backup, uptime, patching, and being the person who wakes up at 3am.

### Added — CC-BY-SA 3.0 carve-out

The OS is MIT. **The data in `docs/selfhosted/` is not** — it is CC-BY-SA 3.0 Unported, share-alike, with authors credited upstream. Attribution is stamped on every generated file, and the boundary is documented in `docs/selfhosted/README.md`, `ATTRIBUTIONS.md` and `UPSTREAM-SOURCES.md`.

`UPSTREAM-SOURCES.md` section 7 says to avoid vendoring and prefer linking. The new entry states this is a deliberate exception and gives four reasons it clears the bar: unambiguous licence, linking cannot serve stage 4.2, the copy is generated rather than forked, and it is quarantined to one directory. Future vendoring should clear the same four.

### Documented — what the catalogue does NOT cover

Measured, not assumed. **Nine upstream tags are orphaned** — the tag file exists and zero projects reference it: Backup, Federated Identity & Authentication, Identity Management, Monitoring & Status Pages, CI/CD, FaaS & Serverless, Static Site Generators, VPN, Distributed Filesystems.

Verified absent from the dataset: Keycloak, Authentik, MinIO, Supabase, Uptime Kuma, Coolify, Woodpecker, Jenkins, WireGuard, restic, Borg, Hugo, Jekyll, Cal.com, Meilisearch.

That is auth, observability, CI/CD, backup, PaaS, static sites and VPN — the first things a SaaS founder looks for. It follows from the upstream scope (self-hosted *network services and web applications*). The shortlist marks these as gaps in a dedicated table rather than omitting them silently.

### Documented — licence traps, per entry

Across the 1.346 entries: MIT 360, **AGPL-3.0 302**, **GPL-3.0 224**, Apache-2.0 143, BSD 51, **⊘ Proprietary 70** — roughly **39% copyleft**.

Six entries in the curated shortlist are not permissive and carry a ⚠️ on their own row: Sentry Self-Hosted, Directus and Outline (BUSL-1.1), Chatwoot and Budibase (⊘ Proprietary), n8n (Apache-2.0 + Commons-Clause). The AGPL note is stated precisely: running unmodified triggers nothing; the obligation begins on modify-and-serve.

### Added — Pitch artifact and the publication question (stage 2.9)

**The OS had no Pitch artifact at all.** `docs/business/` produced only `BUSINESS-PLAN.md`; the word "pitch" appeared solely in registry packs describing other tools' use cases. So "put the BP and Pitch online" required inventing the Pitch first.

New **stage 2.9** at the end of Phase 2 does two things:

1. **Writes `docs/business/PITCH.md`** — ten sections derived from BP v0.0.2. The pitch *derives* and never *adds*: every claim must already exist in the BP. If it belongs in the pitch but is missing from the BP, the BP is incomplete. This prevents a founder from contradicting their own diligence materials.
2. **Asks whether the BP and Pitch should live online** inside the product (`/pitch`, `/investors`) — as a **suggestion, not a default**, with three options: fully public, trimmed public plus gated full version, or nothing for now. **"Nada online por enquanto" is a complete answer** that closes the stage.

Inserting stage 2.9 **renumbered zero other stages** — the first test of PR 1's phase structure, one commit later.

- `templates/business/PITCH.template.md` — ten sections plus the redaction gate.
- `.claude/skills/pitch/SKILL.md` — 27th skill, so the stage is auto-invocable (PR 3's audit flagged stages without skills as a defect).

### Added — mandatory redaction gate before anything is published

Publishing a Business Plan means publishing whatever is inside it. The gate splits the document and requires row-by-row sign-off.

Never published without explicit, considered approval: financial projections, unit economics (CAC, LTV, margins), unannounced pricing, fundraising status and valuation, the internal risk register, supplier and partner terms, competitor teardowns naming specific weaknesses, and personas traceable to a real interviewee.

Three carry consequences beyond embarrassment:

- **Personas from real interviews are personal data** — LGPD applies. Consent to be interviewed is not consent to be published.
- **Competitor teardowns invite legal and PR retaliation** — positioning is safe, naming a competitor's weakness is not.
- **Published numbers become commitments** quoted back during diligence.

The template also requires naming a **maintenance owner**. A stale public BP is worse than no public BP; if nobody owns it, the honest answer is "not now".

### Changed — publication is now a privacy question

`.claude/rules/privacy-audit.md` gained a section treating publication as a form of processing: traceable personas, interviewee consent, team exposure, **analytics on the public page (which re-triggers all nine questions)**, and the fact that publication is effectively irreversible — archives and screenshots outlive the page.

### Changed — the decision routes into later phases

Choosing public or gated creates product surface, not just a document. Routes and navigation land in the Product Brief (4.1); public-vs-gated, auth model, `robots.txt`, SEO and PDF export land in the Technical Plan (4.2); view analytics go through `privacy-audit`; the page becomes a `first-100-users` / `launch-agent` asset.

### Fixed — `CLAUDE.md` artifact list, missed in PR 1

PR 1's edit to the "Required generated artifacts" list never applied — the edit hit a tool gate and the retry re-applied a different edit. The list kept the old ordering with no `DESIGN-DIRECTION.md`. Corrected here; now lists all artifacts in production order with their phase.

### Fixed — six core wizard skills were invisible to auto-invocation

A `SKILL.md` advertises itself through the `description` field in its YAML frontmatter. Six skills had **no frontmatter at all**, so their entire advertised description was their own H1 title — "Product Brief Skill", "Research Waves Skill", and so on.

They were precisely the six that drive the wizard: `project-genesis`, `research-waves`, `business-plan-impact-review`, `product-brief`, `prototype-lab`, `sprint-roadmap`. The twenty peripheral skills from the v0.3.0 vibe-coder pack all had proper frontmatter. **The oldest and most load-bearing skills were the least discoverable.**

Worst case: five live files instruct Claude to invoke `business-plan-impact-review` by name, while the skill itself could not describe when it applied.

### Changed — every skill description now states trigger conditions

Ten further skills had frontmatter but zero trigger phrases: `cost-watchdog`, `decision-log`, `feature-scaffold`, `os-self-test`, `privacy-audit`, `release-check`, `secrets-discipline`, `secrets-scan`, `sprint-management`, `verify-build-works`.

A description saying "Review features that touch personal data" is accurate and useless. What makes `privacy-audit` fire is `"vou guardar o CPF"` / `"e a LGPD?"`. All 26 descriptions now name conditions, not just behavior.

| Metric | Before | After |
|---|---|---|
| Skills with frontmatter | 20 / 26 | **26 / 26** |
| Skills with trigger phrases | 10 / 26 | **26 / 26** |

### Fixed — three overlapping skill pairs now cross-link both ways

The asymmetry always ran the same direction — the newer skill knew about the older, never the reverse.

- `secrets-discipline` ↔ `secrets-scan` — preventive workflow vs. detection pass. Neither said so; the distinction lived only in `docs/registry/packs/gitleaks.md`.
- `cost-watchdog` ↔ `usage-monitor` — preventive vs. post-launch, despite a v0.3.0 session log claiming they already cross-linked.
- `first-100-users` ↔ `grow-sustainably` — `grow-sustainably` referenced its predecessor in 7 places; `first-100-users` referenced its successor in **zero**, so founders reaching 100 users were never routed forward.

### Changed — `release-check` delegates instead of duplicating

Its checklist said "Lint/build pass" and "Privacy/security review complete" while `verify-build-works`, `secrets-scan`, and `privacy-audit` sat unreferenced. It is now a delegation table naming the responsible skill per check, with blocking vs. warning severity and a `multi-ai-review` escalation for hard-to-reverse releases. Closes an open item from `session-log/2026-05-01-v0.4.3-quick-wins.md:75`.

### Added

- `docs/skill-audit-2026-08-08.md` — full audit of all 26 skills, with the verification script.

### Changed — `docs/skill-system.md` rewritten

Its example table listed `design-prototype` and `security-review`, **neither of which exists**. Replaced with the real inventory of 26 grouped by job, plus a mandatory-frontmatter section explaining why `description` must carry trigger conditions.

### Known gaps, recorded not fixed

- **No `technical-plan` skill.** `product-brief` drives stage 4.1 and `sprint-roadmap` drives 4.4; stage 4.2 has only `WIZARD.md` prose.
- `templates/project/CLAUDE.md:62` advertises `/release-check`, which does not exist in `.claude/commands/`.

### Note on GitHub provenance

Checked, and **no change needed**. 23 of 26 skills are original to this repo. The three with declared upstream inspiration (`multi-ai-review`, `processize`, `grow-sustainably`) already link to registry packs carrying the URLs — the chain is `skill → registry pack → upstream URL`, which keeps license and review status in one place. A per-skill `source:` field was considered and declined as duplication.

### Changed — WIZARD is now 5 phases, and the prototype comes before the spec

**Breaking for anyone referencing stages by number.** The four competing numberings (`README.md` 15 steps, `WIZARD.md` overview 17 items, `WIZARD.md` stage headings `0`–`14`, `docs/wizard/` files `01`–`08`) were unified into one:

| Phase | Stages | Commit tag |
|---|---|---|
| 1 — Largada | 1.1–1.3 | `[STAGE:LARGADA]` |
| 2 — Ideação | 2.1–2.8 | `[STAGE:IDEACAO]` |
| 3 — Protótipo | 3.1–3.3 | `[STAGE:PROTOTIPO]` |
| 4 — Documentação | 4.1–4.4 | `[STAGE:DOCUMENTACAO]` |
| 5 — Chegada | 5.1 | `[STAGE:CHEGADA]` |

- **Prototype Lab moved from last-before-coding to Phase 3** — before the Product Brief and Technical Plan, which are now reverse-engineered from the approved prototype.
- **Fractional stages eliminated.** `Stage 0.5` (detach) → `1.2`. `Stage 11.5` (registry pick) → split into `3.1` (design packs, before prototyping) and `4.3` (stack packs, after the Technical Plan).
- **Phases map 1:1 onto the five commit tags** in `.claude/rules/wizard-stage-tags.md`. No translation table. This also corrects a pre-existing ordering bug: under the old order `PROTOTIPO` came chronologically *after* `DOCUMENTACAO`, so systems inferring progress from tag sequence saw projects moving backwards. The five tag values are unchanged; old commits stay valid.
  > **The convention is fixed; the consumer is not yet.** The Grand Prix system that reads these tags lives in PR `#9`, which remains open. Progress inference stops moving backwards only once `#9` merges and adopts the monotonic order.
- **Sprint -1 changed job** from building the prototype to consolidating it into a design system. `docs/sprints/sprint--1-prototype-lab.md` → `docs/sprints/sprint--1-design-system.md`.
- **BP v0.0.2 gained an exit condition** at stage 2.8: it must explicitly state personas, positioning, MVP scope, and the primary user flow, because Phase 3 has no Product Brief to read.

### Added

- `docs/product/DESIGN-DIRECTION.md` as a required Phase 3 artifact — the bridge to Phase 4. Records chosen direction, color tokens, typography scale, spacing, component inventory, screens, the flow as actually clicked, and a mandatory **"implied but never shown"** gaps table (empty states, errors, permissions, long data, offline, mobile, accessibility).
- `templates/product/DESIGN-DIRECTION.template.md`.
- `docs/technical/registry-pick-design.md` as the output of the new design-scoped registry pass.
- `docs/wizard/phase-1-largada.md` … `phase-5-chegada.md` — five phase files replacing the eight `01`–`08` topic files. Includes Technical Plan guidance, which `docs/wizard/` never had.

### Removed

- `docs/wizard/01-ideation.md`, `02-research-waves.md`, `03-business-plan.md`, `04-business-plan-review.md`, `05-product-brief.md`, `06-sprint-planning.md`, `07-prototype-lab.md`, `08-first-coding-sprint.md` — consolidated into the five phase files. Migration table kept in `docs/wizard/README.md`.

### Why

A written spec invents its own completeness: it says "the user manages their projects" and moves on. A prototype forces the question *what does this screen look like when the list is empty?* — and either it was answered or the hole is visible. Phase 4 is now required to record those gaps rather than silently fill them.

The Technical Plan gets a second benefit: its data model is derived from `prototype-lab/shared/mock-data.js`. Mock data written to make three screens look real contains exactly the fields the product displays and nothing speculative.

Phases were chosen over a renumbered flat list because inserting a step into a flat list renumbers everything downstream — which is precisely how `0.5` and `11.5` came to exist. Under phases, insertion only renumbers within one phase, and the five phase names never move.

### Migration notes

- Historical records (`CHANGELOG.md` entries below, `RELEASE-NOTES-v0.4.*.md`, prior session logs) still say "Stage 0.5" / "Stage 11.5". They were deliberately not rewritten — they accurately record what was true at the time.
- `course/` content still references the old ordering and will drift until updated separately.

---

## [0.4.5] — 2026-05-04 — Course vertical: workshop em 3 aulas (Experience Learning) + 2 sistemas planejados

### Added — Vertical educacional `course/`

Pasta `course/` adicionada como **vertical paralela**, claramente separada do OS operacional. Construída como prova viva de que vibe coder com método produz em horas o que time custaria semanas.

- `course/README.md` — manifesto da separação. Quem clona pra projeto pode ignorar/apagar a pasta sem afetar o OS.
- `course/CHANGELOG-COURSE.md` — histórico das decisões pedagógicas (v1 → v3.3) inteiro documentado.
- `course/content/shared/curso-overview.md` — TESE, TAGLINE, ARCO global do curso aplicando os 4 pilares Perestroika (Conteúdo, Forma, Emocional, Estrutural).
- `course/content/aula-1-fundacao/README.md` + `treco/po-de-diamante-po-de-fome.md` — Aula 1 completa (Tagline: "Você não está de muletas, isso aqui é um fucking Gundam!").
- `course/content/aula-2-construcao/README.md` — Aula 2 completa (Tagline: "AI sem contexto é menino no sandbox").
- `course/content/aula-3-soberania/README.md` — Aula 3 completa (Tagline: "Não somos jangada. Somos submarino nuclear pilotado por gente que ouviu a IA").
- `course/sprints/sprint-0-fundacao.md` — Sprint que constrói curso + 2 sistemas + repo demo (~40h em 4–6 semanas).
- `course/systems/trilho-red-team/BRIEF.md` — Sistema 1 (sorteio anônimo de duplas pra red team).
- `course/systems/grand-prix/BRIEF.md` — Sistema 2 (painel ao vivo com carrinhos F1 lendo commits via GitHub API).
- `course/videos/INDEX.md` — placeholder pra futuros vídeos do YouTube.

### Added — Easter egg no OS principal (opt-in)

- `.claude/rules/wizard-stage-tags.md` — convenção opcional `[STAGE:LARGADA|IDEACAO|DOCUMENTACAO|PROTOTIPO|CHEGADA]` em commit messages. Permite rastreamento automático de progresso por sistemas externos. Quem ignora não perde nada.

### Why

Workshop em 3 encontros de 2h aplicando Experience Learning (metodologia open source da Perestroika sob CC BY-SA 4.0) e construído sobre o próprio AI Dev OS. A vertical foi separada propositalmente: quem clona o template pra um projeto não deve confundir material didático com material operacional, mas o curso vive no mesmo repo pra garantir versionamento conjunto e prova viva do método.

### Notes

- v0.4.5 é **patch**, não minor — nenhuma alteração no OS operacional. Apenas adição da nova vertical.
- v0.5.0 segue reservado pras decisões arquiteturais do OS (trust tiers, plugin manifest, parallel sprints, allowlists).

---

## [0.4.4] — 2026-05-04 — Repo hardening: branch protection, GitHub Template, WIZARD Stage 0.5 (detach from OS-origin)

### Added

- `CONTRIBUTING.md` — full PT-BR contribution guide (fork → branch → PR flow), bilingual EN summary at top.
- `.github/ISSUE_TEMPLATE/question.md` — third issue template alongside bug/feature.
- `scripts/detach-os.sh` and `scripts/detach-os.ps1` — interactive, educational scripts to disconnect a derived project from the OS-origin remote (re-init mode or remote-swap mode), with secrets-discipline reminders.
- `.aios-self` — root marker file identifying the OS repo itself (used in combination with origin URL by Stage 0.5).
- `WIZARD.md` Stage 0.5 — "Detach from OS-origin (educate-and-execute)" between Stage 0 and Stage 1. Walks non-dev users through Git remotes, GitHub repo creation, PAT/SSH setup, and `.env`/`.gitignore` discipline.
- `RELEASE-NOTES-v0.4.4.md`.

### Changed

- **GitHub server-side hardening** (out-of-repo, applied via `gh` CLI):
  - Repo marked as **Template** (`gh repo edit --template`) — surfaces "Use this template" button as the recommended path.
  - **Branch protection** on `main` — requires PR, dismisses stale reviews, no force pushes, no deletions, conversation resolution required. `enforce_admins=false` so the maintainer can bypass in emergencies.
- `README.md` — Quick start now leads with "Use this template", with `git clone` collapsed as a clearly-marked fallback that points to `scripts/detach-os.*`. Added explicit "Want to contribute?" section linking `CONTRIBUTING.md`.
- `docs/installation.md` — Section 4 rewritten as Path A ("Use this template", recommended) + Path B (`git clone` with detach instructions).
- `.github/pull_request_template.md` — added checklist line: "PR opened from a fork or feature branch — no direct commits to main".

### Why

A user who follows the prior `git clone` instructions ends up with `origin` pointing to the OS repo, so any `git push` either fails (confusing for non-devs) or, if the user has push access, pollutes the OS repo with their personal project. The combination of (1) branch protection, (2) template flag, and (3) WIZARD Stage 0.5 implements the "no defaults to push" posture that's standard for public template repos (Vercel, shadcn, Cloudflare templates).

The `git clone` path is preserved for advanced users and offline scenarios, but is now clearly second-best.

---

## [0.4.3] — 2026-05-01 — Quick wins: ETHOS, /processize, /grow-sustainably, /multi-ai-review, agents-marketplace tag

Patch release implementing the five quick wins identified in v0.4.2's comparison study against `gstack` and `slavingia/skills`. No architectural changes — those remain deferred to v0.5.

### Added

- `ETHOS.md` — one-page canonical manifesto. 15 principles distilled from the operating contract; every rule, agent, skill, and command must trace back to it.
- `.claude/skills/processize/SKILL.md` + `.claude/commands/processize.md` — codify a manually-validated workflow into a documented, partially-automatable process. Inspired by Sahil Lavingia's "validate-then-automate" principle. Includes a 5-question gate, a 3-stage maturity model, and a `docs/processes/<slug>.md` output template.
- `.claude/skills/grow-sustainably/SKILL.md` + `.claude/commands/grow-sustainably.md` — post-`first-100-users` growth planner. Four pillars (retention → compress what worked → ONE new channel → founder bandwidth), tier-ordered channel taxonomy, hard rules against vanity metrics and channel diffusion, monthly `docs/business/growth-plan-<YYYY-MM>.md` output.
- `.claude/skills/multi-ai-review/SKILL.md` + `.claude/commands/multi-ai-review.md` — cross-review hard-to-reverse decisions through 2–4 independent reviewer roles. Inspired by gstack's `/codex` cross-review concept. Net confidence = MIN of reviewer scores. Three outcomes: Proceed / Modify and re-review / Block.
- `docs/registry/tags/agents-marketplace.md` — new registry tag surfacing curated skill bundles distributed as discrete installable packs (gstack, slavingia-skills, antigravity-awesome-skills, anthropics-skills, everything-claude-code, ruflo, holyclaude, vibeyard, optio, open-design, trailofbits-skills).
- `RELEASE-NOTES-v0.4.3.md`.
- Session log entry: `session-log/2026-05-01-v0.4.3-quick-wins.md`.

### Changed

- `README.md` — new "Quick wins (v0.4.3)" section between the Registry block and the Vibe Coder Pack block; status badge bumped to v0.4.3.
- `docs/registry/INDEX.md` — `Last index update` stamped with v0.4.3; `agents-marketplace` added to the tag-list section.

### Notes

- Architectural changes (plugin manifest, trust tiers enforcement, parallel sprint orchestration, marketplace migration) remain deferred to v0.5; the audit trail lives in `session-log/`.
- These five additions are non-breaking — existing projects pulling v0.4.2 receive new opt-in capabilities; nothing previously available has changed shape.

---

## [0.4.2] — 2026-04-30 — Registry batch 3 (10 packs + 1 external + comparison study)

Patch release expanding the External Repo Registry with 10 packs and 1 external SaaS. Includes a side-by-side comparison of `slavingia/skills` and `gstack` against this OS (delivered in chat; summarized in release notes). Registry total: 47 → 57 packs + 6 external resources.

### Added

- ⭐ `docs/registry/packs/slavingia-skills.md` — Sahil Lavingia's Minimalist Entrepreneur 10-skill plugin (`foundations` `learning` `ecosystem`).
- ⭐ `docs/registry/packs/auto-research-claw.md` — autonomous academic paper pipeline (`ai` `research` `agents`).
- ⭐ `docs/registry/packs/kronos.md` — foundation model for financial candlesticks, AAAI 2026 (`ai` `ml` `fintech` `research`).
- `docs/registry/packs/holyclaude.md` — containerized Claude Code env with 7 AI CLIs (`ecosystem` `tooling` `stack-pack`).
- `docs/registry/packs/optio.md` — k8s ticket-to-PR orchestration (`ecosystem` `agents` `tooling` `infra`).
- `docs/registry/packs/vibeyard.md` — Electron IDE for parallel AI agent sessions (`ecosystem` `productivity` `tooling`).
- `docs/registry/packs/diagram-design.md` — editorial-quality diagrams skill (`design` `ai` `tooling`).
- `docs/registry/packs/app-store-screenshots.md` — App Store + Play Store screenshot generator (`design` `tooling`).
- `docs/registry/packs/phantom-ui.md` — auto-generated skeleton loaders Web Component (`design` `tooling`).
- `docs/registry/packs/miroshark.md` — swarm intelligence simulation engine; AGPL-3.0 (`ai` `agents` `research` `experimental`).
- `docs/registry/external-resources/sci-bot.md` — AI research assistant grounded in Sci-Hub papers (`research` `ai`).
- `RELEASE-NOTES-v0.4.2.md`.

### Changed

- `docs/registry/INDEX.md` — 10 new pack rows + 1 external row; "Last index update" stamped with v0.4.2.
- Tag indexes updated: `ai`, `design`, `ecosystem`, `fintech`, `foundations`, `learning`, `ml`, `productivity`, `research`.
- `README.md` — status badge bumped to v0.4.2.

### Notes

- Comparison study of `slavingia/skills` + `gstack` vs this OS delivered in-chat; summary in `RELEASE-NOTES-v0.4.2.md`.
- 5 quick wins identified for follow-up v0.4.x sprints (`/processize`, `/grow-sustainably`, `ETHOS.md`, `/multi-ai-review`, `#agents-marketplace` tag).
- Architectural changes (plugin marketplace migration, trust tiers, browser automation, GBrain-like DB, Conductor-like parallel sprints) deferred to v0.5.

---

## [0.4.1] — 2026-04-30 — Registry batch 2 (7 new packs)

Patch release expanding the External Repo Registry with 7 reviewed packs. Registry total: 40 → 47 packs.

### Added

- ⭐ `docs/registry/packs/gstack.md` — Garry Tan's 23-agent virtual engineering team for Claude Code (`ecosystem` `agents` `foundations`).
- ⭐ `docs/registry/packs/tradingagents.md` — TauricResearch multi-agent LLM trading framework on LangGraph (`fintech` `agents` `ai` `research`). Paper-backed (arXiv:2412.20138).
- ⭐ `docs/registry/packs/nellavio.md` — Next.js dashboard starter with 90+ shadcn components, Better-Auth, RBAC, i18n, dual-mode (`stack-pack` `design`).
- `docs/registry/packs/antigravity-awesome-skills.md` — 1,441+ skill playbooks across multiple AI coding agents (`ecosystem` `agents` `tooling`).
- `docs/registry/packs/tegaki.md` — Animated handwriting from any font, multi-framework (`design` `tooling`).
- `docs/registry/packs/open-design.md` — Local-first AI design generation across 10 coding-agent CLIs (`design` `ai` `ecosystem`).
- `docs/registry/packs/unity-mcp.md` — MCP bridge to Unity Engine for game/3D dev (`stack-pack` `agents` `tooling`).
- `RELEASE-NOTES-v0.4.1.md`.

### Changed

- `docs/registry/INDEX.md` — 7 new rows in master table; "Last index update" stamped with v0.4.1.
- Tag indexes updated: `ai`, `design`, `ecosystem`, `fintech`, `foundations`, `research`, `stack-pack`.
- `README.md` — status badge bumped to v0.4.1.

---

## [0.4.0] — 2026-04-30 — External Repo Registry framework

This version turns the OS into a project-agnostic launchpad by introducing a **curated, on-demand catalog of external repository packs**. Instead of pre-installing every community pack, the OS now ships a registry of trusted, vetted repos that the WIZARD recommends per project based on stack, domain, compliance, and team familiarity.

### Added

- `docs/registry/` — new first-class layer of the OS:
  - `docs/registry/README.md` — how the registry works + one-pager template + conventions.
  - `docs/registry/INDEX.md` — sortable master table.
  - `docs/registry/packs/` — 10 one-pagers (anthropics-skills, everything-claude-code, ui-ux-pro-max, awesome-design-md, trailofbits-skills, solana-claude, cis-hardening-guide, yara-style-guide, gitleaks, boringco).
  - `docs/registry/tags/` — auxiliary tag indexes (security, design, foundations, stack-pack, ecosystem).
- `.claude/skills/registry-pick/SKILL.md` — reads the registry and outputs a prioritized recommendation (must / recommended / optional / skipped) for the current project. Never installs.
- `.claude/commands/registry-pick.md` — slash command entry point for the skill.
- `WIZARD.md` Stage 11.5 — registry-pick step between Technical Plan and Sprint roadmap; required output `docs/technical/registry-pick.md`.
- `RELEASE-NOTES-v0.4.0.md`.
- Session log entry: `session-log/2026-04-30-registry-framework-v0.4.0.md`.

### Changed

- `UPSTREAM-SOURCES.md` and `ATTRIBUTIONS.md` now cross-link to `docs/registry/` and clarify the separation of concerns: origin/audit (UPSTREAM) vs. installable catalog (registry).
- `README.md` features the External Repo Registry on the front page; status badge bumped to v0.4.0.
- `WIZARD.md` overview updated to include Stage 11.5; total stages bumped from 16 to 17.

---

## [0.3.0] — 2026-04-28 — Vibe Coder Non-Dev Pack

This version introduces the **Vibe Coder Non-Dev Pack**: a coordinated set of agents, skills, and templates focused on protecting, guiding, and unblocking non-developers building SaaS with AI.

### Added — Defensive layer (Phase 1)

- `.env.example` with vibe-coder-friendly inline guidance for every common integration.
- `CLAUDE.local.md.example` for personal overrides without leaking to the team.
- `.claude/skills/secrets-discipline` — safe handling of API keys, blocks accidental commits.
- `.claude/skills/cost-watchdog` — flags expensive technical choices before they ship.
- `.claude/skills/plain-portuguese-explainer` — translates jargon and errors into plain Portuguese.
- `.claude/skills/daily-standup` — 4-bullet "where we left off" briefing for solo non-dev sessions.
- `.claude/skills/os-self-test` — verifies the OS is internally coherent.
- `.github/pull_request_template.md` with OS coherence + vibe-coder impact checklist.
- `.github/ISSUE_TEMPLATE/` bug + feature templates tuned for both devs and non-devs.
- `.github/workflows/ci.yml` enforcing canonical structure, hygiene, and link integrity.

### Added — Active-help layer (Phase 2)

- `.claude/agents/bug-triage-agent` — first responder when something breaks.
- `.claude/agents/launch-agent` — coordinates public launch with a pre-launch gate and 3 launch tracks.
- `.claude/agents/legal-compliance-agent` — Privacy Policy, Terms, LGPD/GDPR baseline drafts.
- `.claude/skills/rollback-safe` — safely undoes the last AI change.
- `.claude/skills/verify-build-works` — smoke-test ladder for build + dev server + golden path.
- `.claude/skills/usage-monitor` — tracks cost across LLM, hosting, DB, email after launch.
- `.claude/skills/deploy-vercel-supabase` — first Vercel + Supabase production deploy walkthrough.
- `.claude/skills/first-100-users` — early-stage acquisition playbook without paid ads.
- `examples/nextjs-supabase-saas/README.md` — canonical Next.js + Supabase layout reference.
- `RELEASE-NOTES-v0.3.0.md`.
- Vibe Coder Non-Dev Pack session log entry.

### Changed

- `README.md` features the Vibe Coder Non-Dev Pack on the front page and links to all new agents and skills; status badge bumped to v0.3.0.

---

## [0.2.0] — 2026-04-28 — Project Genesis Wizard + Public Release Polish

### Added

- `START-HERE.md` as the single first file Claude reads.
- `WIZARD.md` as the canonical Project Genesis Wizard.
- Detailed wizard documentation under `docs/wizard/`.
- Skills under `.claude/skills/`: project-genesis, research-waves, business-plan-impact-review, product-brief, sprint-roadmap, prototype-lab, sprint-management, feature-scaffold, decision-log, release-check, secrets-scan, privacy-audit, external (affaan-everything-claude-code).
- Specialized agents under `.claude/agents/`: coordinator, devils-advocate, dev-product, research, business-red-team, technical-security-red-team, copywriter, market-research, competitor-research.
- Slash commands under `.claude/commands/`: project-start, research-waves, bp-review, sprint-plan, prototype-lab, sprint-start, sprint-close.
- Modular rules under `.claude/rules/`: golden-rules, code-style, documentation-layers, research-discipline, wizard-flow, security-baseline, git-workflow, feature-based-architecture, secrets, privacy-audit.
- Product, business, technical, knowledge-base, prototype-lab, and session-log scaffolding.
- `.gitignore` covering personal canonical files, environment files, archives, and IDE/OS artifacts.
- `RELEASE-NOTES-v0.2.0.md`.
- Public release polish session log entry under `session-log/`.

### Changed

- Migrated all rules, skills, agents, and commands from non-canonical root directories into `.claude/`, matching the official Claude Project Structure.
- Reconciled version metadata across README badge, release notes, and `templates/project/CLAUDE.md`.
- Updated `docs/documentation-layers.md` paths to reference the canonical `.claude/` runtime.
- Updated `UPSTREAM-SOURCES.md` to reflect new canonical paths.

### Removed

- Root `agents/`, `rules/`, `skills/`, `commands/` directories (non-canonical duplicates of `.claude/`).
- `docs/excluded-boringco-material.md` and `docs/import-plan-from-boringco.md` (zombie compatibility shims; useful content already lives in `docs/public-sanitization.md` and `UPSTREAM-SOURCES.md`).
- `RELEASE-NOTES-v0.1.0.md` (superseded by v0.2.0; history preserved in this changelog).
- Empty placeholder directories: `examples/nextjs-supabase-saas/`, `rules/quality/`, `rules/stack-specific/`.
- `ai-dev-operating-system-overlay-v5-public-ready.zip` (archives are not part of the repo; covered by `.gitignore`).

---

## [0.1.0] — 2026-04-27 — Initial public release

### Added

- Initial AI Dev Operating System repository structure.
- Documentation layers scaffolding: product, business, technical, sprints, changelog, session-log, knowledge-base.
- Public attribution and upstream source mapping (`UPSTREAM-SOURCES.md`, `ATTRIBUTIONS.md`, `docs/origin-map.md`).
- Security policy (`SECURITY.md`) and public sanitization notes (`docs/public-sanitization.md`).
- Installation guide (`docs/installation.md`).
- LICENSE (MIT).
