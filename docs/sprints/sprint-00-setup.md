# Sprint 00 — Setup

**Estado:** concluída em 5/10/2026 · **Branch:** `sprint-00-setup` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B0 |
| Depende de | Nenhuma sprint |
| Regras e fluxos cobertos | Nenhuma. É a fundação do repositório |

## Objetivo

Deixar o repositório pronto para o programa novo: trazer `upstream/main`, criar o esqueleto de
`programs/brot-markets` e de `packages/sdk`, e fazer a conferência automática (CI) conferir e publicar o que a
construção precisa.

## Critério de pronto

- [x] Os documentos da Fase 4 estão na `main`, e a branch da sprint abre de lá. Estavam em
      `feat/layout-tape` e foram para a `main` pelo PR #1.
- [x] `upstream/main` (commit `4d672ae`, que contém o `7b3196d`) está no repositório: `resolver.rs` com nove
      leitores, `tests/fixtures/*.bin` e `scripts/capture-fixtures.ts` existem na árvore.
- [x] `programs/brot-markets` existe, com endereço próprio, e `bun run build:program` compila os dois programas.
- [x] `packages/sdk` existe; o workspace do Bun inclui `packages/*` e `services/*`; `bun install --frozen-lockfile`
      passa.
- [x] O CI roda, além do que já roda, `node scripts/codemap.js --check`, `node scripts/os-self-test.js` e a
      varredura de segredos; confere o IDL de `brot_markets`; e publica o `.so` e o IDL como artefato, com o SHA-256.
- [x] A conferência padrão passa, com os comandos de Rust apontando para o pacote novo.
- [x] Um envio de teste com o `CODEMAP.md` velho e outro com o IDL velho fazem o CI falhar.
- [x] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- A vinda de `upstream/main`, por merge ou só com os leitores e as contas capturadas (T1), mantendo o aviso de
  autoria da licença MIT.
- O esqueleto do programa: `lib.rs`, `constants.rs`, `error.rs`, `events.rs` e as pastas `state/`, `math/`,
  `readers/` e `instructions/` (plano técnico, seção 3.2).
- O esqueleto de `packages/sdk`, com `idl/`; a cópia do IDL passa a ir para lá.
- O CI ampliado (plano técnico, seção 10).
- Os `.env.example` conferidos, sem valores.

## Fora desta sprint

Qualquer instrução do pote. O leitor de preço. O servidor. Mover `app/lib` para o SDK (Sprint 05). Tirar
`programs/pred-provable` do workspace (Sprint 03).

## Decisões do fundador que travam a sprint

- A aprovação do resumo de produto, do plano técnico e deste roteiro (wizard, etapa 5.1).
- O sinal para trazer o `upstream/main`: o repositório do Ronaldo pode estar no meio de uma atualização.
- A etapa 4.3 do wizard (`docs/technical/registry-pick.md`): feita nesta sprint, commit `d776d26`.

## Agentes e skills

- **Agentes:** `dev-product-agent`, `technical-security-red-team-agent` (revê o CI: ações por hash, artefato com
  hash), `coordinator-agent`.
- **Skills:** `sprint-management`, `registry-pick`, `codemap`, `os-self-test`, `secrets-discipline`, `secrets-scan`,
  `verify-build-works`, `decision-log`.

## Portões de segurança

- O par de chaves do endereço do programa novo não entra no Git.
- A chave de atualização não vai para o GitHub nem para o servidor.
- As ações do CI continuam fixadas por hash.
- `secrets-scan` no fechamento.

## Testes

Os dois conjuntos que já existem (`bun run test` e `bun run test:rust`) seguem verdes depois do merge. Os portões
novos do CI são provados com uma falha de propósito.

## Riscos

- O merge do `upstream` conflitar com `feat/layout-tape`, que difere da `main` em 220 arquivos.
- Dependências presas subirem no merge: `@solana/kit ~8.3.0` e `solana-epoch-stake =3.0.0` ficam como estão.
- Dois programas compilando deixarem o CI mais lento.

## Artefatos esperados

`programs/brot-markets/`, `packages/sdk/`, `.github/workflows/ci.yml`, `package.json` com o workspace novo,
`CODEMAP.md`.

## Changelog e session-log

- **Changelog:** programa novo criado; `upstream` trazido; CI ampliado.
- **Session-log:** a escolha de T1 e o porquê.

## Registro e retrospectiva

### O que foi entregue

| Item do critério de pronto | Evidência |
|---|---|
| Documentos na `main` | PR #1, mesclado depois de a conferência automática passar (execução 37320743002) |
| Upstream no repositório | Merge `8e8b2ec` de `0xcf07/pred-provable@4d672ae`: nove leitores em `resolver.rs`, nove arquivos em `tests/fixtures/`, `scripts/capture-fixtures.ts` |
| Programa novo | `programs/brot-markets`, endereço `6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN`; o `anchor build` do CI compila os dois programas |
| SDK e workspace | `packages/sdk`; `bun install --frozen-lockfile` passa no CI |
| CI ampliado | Trabalho "Repo" (mapa de código, coerência, varredura de segredos); IDL dos dois programas conferido. O artefato com `.so` e SHA-256 foi publicado e conferido na execução 37322085234, quando ainda saía de pull request; desde `bdc9aa2` ele sai só de push na `main`, e a primeira publicação nesse formato é a do merge desta sprint |
| Falha de propósito | Execução 37322085234: "Code map is up to date" falhou com o mapa velho, e "Check committed IDLs are up to date" falhou listando os três arquivos do IDL não commitado |
| Conferência verde | Execução 37325279961, commit `bdc9aa2`, a última que mudou código do programa e do CI: os três trabalhos passam. Os commits seguintes são de documentação e do gerador do mapa de código |

**O que só fecha depois do merge.** O critério do artefato e o fechamento comum dependem de dois passos que
acontecem com o merge deste PR: a execução na `main` publicar `programs-<sha>` com `SHA256SUMS`, e a tag
`sprint-00`.

**O que aconteceu no merge.** O PR #2 foi mesclado às 14:51 UTC (`2b06404`), e o push não disparou a conferência
automática: seis minutos depois não havia execução para o commit, com o GitHub operacional e o arquivo válido (uma
execução manual na `main`, a 37328963156, começou sem erro). A causa não foi encontrada. Como o artefato só saía de
evento de push, ele não seria publicado. A condição passou a aceitar também execução manual na `main`, no PR #3, e
o artefato desta sprint é o dessa execução. O número dela fica no session-log da sprint.

### O que mudou em relação ao planejado

- **A branch foi criada antes de o PR #1 ser mesclado**, para adiantar o merge do upstream enquanto a conferência
  rodava. Ela recebeu a `main` por merge (`ee50dd7`) logo depois.
- **O artefato publicável sai só de push na `main`**, e não de todo envio, por achado da revisão de segurança.
  O IDL gerado tem um artefato próprio, de pré-visualização, sem binário.
- **A varredura de segredos foi reforçada além do pedido:** reconhece par de chaves da Solana e chave de API em
  URL, e olha commit por commit.
- **Dois defeitos de ferramenta do projeto apareceram e foram corrigidos:** o gerador do mapa de código dependia
  do fim de linha do checkout, e o verificador de instruções acusava nomes de um documento do upstream.
- **`init-if-needed` saiu do programa novo** e três lints de aritmética entraram em `deny`.

### Achados da revisão de segurança que ficaram para depois

| Achado | Destino |
|---|---|
| Atestar a origem do `.so` (`attest-build-provenance`) e reproduzir o hash com `solana-verify` | Sprint 16 |
| Baixar o artefato sempre pelo número da execução, nunca só pelo nome | Sprint 05, na primeira publicação na devnet |
| Fixar o SHA-256 do instalador da Solana e do binário do Anchor; compilar o artefato de publicação sem cache | Sprint 16 |
| Compilar e publicar a variante `mainnet` com nome próprio e conferir a rede antes de publicar | Sprint 16. Na Sprint 02, gravar o endereço do USDC na conta de configuração |
| `bun.lock` apontando para `registry.npmmirror.com` | Decisão do fundador com o CTO. Teste proposto: trocar o host pelo registro oficial numa branch e rodar `bun install --frozen-lockfile` |
| Rota de chat do upstream (`app/app/api/chat/route.ts`): limite de uso contornável, sem teto de gasto, contexto vindo do cliente, texto do produto antigo | Sprint 09. Até lá, sem chave configurada. Antes de o site ir ao ar, sai ou é reescrita, com revisão de privacidade |
| Padrões que a varredura ainda não pega: chave em base58, URL com usuário e senha, segredo em hexadecimal, arquivo binário | Sprint 16, com o `gitleaks` recomendado em `docs/technical/registry-pick.md` |
| `CODEOWNERS` para `.github/`, a varredura e os hooks; proteção da `main` | Sprint 16. A proteção de branch não está disponível em repositório privado da conta gratuita |
| Cópia de segurança da chave do endereço do programa, hoje só em `target/deploy/` | Fundador, antes da Sprint 05 |

### Retrospectiva

- **Funcionou:** abrir o PR antes de mesclar deu o primeiro resultado real da conferência automática, inclusive o
  build de produção do app, que nunca tinha rodado. Provar as falhas de propósito achou um defeito de verdade no
  gerador do mapa de código.
- **Custou:** a máquina de desenvolvimento não compila com as versões fixadas (Anchor 1.0.0 e Solana 2.2.16
  contra 1.1.2 e 3.1.x), então cada conferência do programa leva de cinco a dez minutos no GitHub. O IDL teve de
  vir do artefato. Vale atualizar as ferramentas locais ou montar um contêiner de desenvolvimento antes da Sprint 02.
- **Errei:** gerei três arquivos pelo terminal com escape quebrado, e um deles saiu com erro de sintaxe; o `gh`
  apontava para o repositório do upstream por padrão, e só percebi ao listar as execuções.
- **Onde os achados adiados foram registrados:** nos arquivos das Sprints 02, 05, 09 e 16, numa seção "Herdado da
  Sprint 00", e na seção 7.1 do plano técnico.
- **Segue aberto para a Sprint 02:** a pergunta 12 do plano técnico (quem guarda a chave de atualização na devnet
  e quem tem chave de equipe).
