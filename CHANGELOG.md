# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

Nada depois da Sprint 01. A próxima é a Sprint 02, o núcleo do pote (`docs/sprints/sprint-02-pot-core.md`).

### Em aberto

- **Sprints:** a 00 e a 01 estão concluídas. A 02 depende de saber quem guarda a chave de atualização na devnet e
  quem tem chave de equipe (pergunta 12 do plano técnico).
- **Leitura no Surfpool:** era critério de pronto da Sprint 01 e não foi feita. Está na Sprint 03.
- **Perguntas novas para o fundador, da Sprint 01:** se o limite de 30 segundos para a idade do preço vale também
  na devnet, onde a conta patrocinada chega a 64 segundos, ou vira parâmetro por pergunta (Sprint 03); e se vale
  obter a chave do serviço de preços da Pyth, necessária só se o nosso serviço publicar preço (Sprint 06).
- **Desenho da pergunta de preço:** a revisão da Sprint 01 propõe aceitar, na aposta, só a conta patrocinada do
  ativo, e na prova qualquer conta completa. O plano técnico hoje aceita qualquer conta válida. Decide-se na
  Sprint 03.
- **Quem controla a Pyth:** na rede principal, a autoridade que atualiza os programas é um endereço derivado cujo
  controle não foi conferido. Risco na seção 13 do plano técnico; conferir antes da rede principal (Sprint 16).
- **Perguntas do fundador:** as doze da seção 14.2 do plano técnico valem com a resposta recomendada, porque os
  documentos foram aprovados sem alteração. Três não têm resposta padrão: a verba e o fornecedor do segundo
  serviço, a compra do domínio `brot.markets` e os nomes de quem guarda chave.
- **Apresentação resumida do plano:** escrita, não publicada. Falta o fundador decidir se e como publicar, e
  qual versão da seção de equipe vai na inscrição do hackathon.
- **Coerência do BP v0.0.2:** há pontos que se contradizem entre as partes (critério de parada, tesouraria,
  quando sai o token A, cabeçalhos que ainda dizem "rascunho"). Falta uma passada para resolvê-los.
- **Direção de design:** Ledger² escura e clara, aprovada e documentada. O app ainda mostra a direção C; a troca
  é a Sprint -1 e as Sprints 09 a 13. Várias telas do protótipo mostram o modelo antigo e precisam de conteúdo novo.
- **Nome:** Brot Markets. O app, os protótipos e o `package.json` da raiz ainda dizem "baked" ou `pred-provable`.
- **Servidor:** o projeto tem espaço próprio no servidor compartilhado, só com o código. Faltam o domínio na conta
  do Cloudflare, o túnel e o lugar do segundo serviço agendado.
- **Ferramentas locais:** a máquina de desenvolvimento tem Anchor 1.0.0 e Solana 2.2.16, e o projeto fixa 1.1.2 e
  3.1.x. O programa só compila na conferência automática.
- **Chave do endereço do programa:** só na máquina do fundador, em `target/deploy/`. Precisa de cópia de segurança.
- **Proteção da `main`:** indisponível em repositório privado da conta gratuita do GitHub.
- **`bun.lock`** aponta para `registry.npmmirror.com`, herdado do upstream. Falta decidir se volta ao registro
  oficial do npm.
- **Achados de segurança adiados:** na seção 7.1 do plano técnico e nas Sprints 02, 05, 09 e 16.
- **Regulação:** falta conferir a tramitação da MP 1.394 no Congresso e ler o Decreto 13.128, de 2026.
- **BP v0.0.2:** fechado, sem proposta em aberto. Faltam o primeiro valor do teto global e os nomes de quem assina a
  carteira com várias assinaturas.
- **Não verificado:** transações no app (conectar, comprar, vender, resolver) e o shader WebGPU da direção I.
- **`CODEMAP.md`:** o gerador aponta arquivos acima de 200 linhas e sem cabeçalho `Purpose:`, quase todos do
  programa e do app antigos; os números atuais estão no topo do próprio mapa.

---

## [sprint-01] — 2026-10-05 — A Pyth serve na devnet: o leitor de preço lê contas reais

Sprint 01 do roteiro (`docs/sprints/sprint-01-foundation.md`), mais o que entrou na `main` depois da tag
`sprint-00`. Entrou por dois pull requests: o #5, com a regra de fechamento de interação, e o #6, com a sprint. A
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
