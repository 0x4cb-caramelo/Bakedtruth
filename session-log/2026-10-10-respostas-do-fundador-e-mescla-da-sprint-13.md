# 2026-10-10 — As respostas do fundador às doze perguntas da Sprint 13, a mescla e a tag

## Context

A Sprint 13 terminou construída e revisada no PR #63, com o CI verde, e com doze perguntas ao fundador numa lista só
(`docs/sprints/sprint-13-site-notices-copy.md`). O Ronaldo pediu a mescla ("you can merge"), e o PR #63 entrou na
`main` às 21:04 UTC (`2dc5cb1`).

Depois chegou, colada, uma mensagem que aprovava todas as recomendações e pedia o registro, a mescla e a tag. Como veio
só colada e já estava em parte velha (o PR já estava mesclado, e a 8a não dizia quem guarda o login do X), o
assistente pediu confirmação antes de mexer no GitHub. O Ronaldo confirmou: "Yes, 1a to 12a all as recommended". Disse
quem guarda o login: "I (the CTO) hold the X account login, secured with an Authenticator app for 2FA". E escolheu o
caminho mais rápido: a tag no `2dc5cb1` assim que o CI da `main` passasse, para começar a Sprint 19 em outra aba, e o
registro mais a 3a num PR à parte, feito numa worktree separada, para as duas frentes andarem juntas.

## Decision

### 1. As respostas

| # | Pergunta | Resposta |
|---|---|---|
| 1 | De onde vêm os números do ranking | (a) A rota `/api/v1/leaderboard` da API de leitura, a partir dos eventos do programa, como construída |
| 2 | O que os pontos valem depois do devnet (L-09) | (a) "Points only count on devnet. They are not money, and nothing is promised for them after the test phase." |
| 3 | O que pontua | (a) Nenhum dos três casos: carteira nos dois lados, pote devolvido, carteira de quem abriu numa campanha de queima, trava ou stake |
| 4 | O relatório do parceiro (L-24) | (a) Um arquivo de texto por campanha de parceiro, sem endereço; quem não posta perde o destaque de 72 horas e o próximo convite |
| 5 | Para onde vai "Report this campaign" | (a) A conta do X, https://x.com/brotmarkets |
| 6 | BP-5 e BP-11 | (a) "No human picks the winner." e Baked por escrito, Cacetinho só falado |
| 7 | Os limites dos três testes de demanda | (a) Os da v0.0.2 para os testes 1 e 2; o teste 3 medido no devnet, com a marca antes da mainnet |
| 8 | O login do X e o prazo para sair do ranking | (a) 15 dias, a confirmar com o advogado; o login fica com o CTO, com aplicativo autenticador como segundo fator |
| 9 | As páginas `/terms` e `/privacy` no ar | (a) `/terms` sai do ar até a Sprint 17; `/privacy` é corrigida e linkada no rodapé do site antes de ele ser público; o texto se prepara no repositório e o fundador publica a landing |
| 10 | A coluna de taxa de acerto | (a) Continua fora |
| 11 | "Your entry back plus your share of the rest" com a regra de viabilidade | (a) Aprovada de novo |
| 12 | A colheita de prêmio | (a) A regra se decide antes da mainnet; nada muda no devnet |

### 2. A tag antes do registro

O `sprint-13` foi criado no `2dc5cb1` depois que a execução 38086211030 do CI na `main` passou nos quatro trabalhos
(Repo, Mobile bundle, App e Program), anotado no mesmo formato do `sprint-12`. A tag não leva as respostas nem a 3a:
o PR de acompanhamento, cortado da `main` na mesma tag, leva os dois. Foi o caminho que o Ronaldo escolheu, porque a
Sprint 19 não depende da regra de pontos e o tempo do hackathon conta.

O PR de acompanhamento e a Sprint 19 mexem nos mesmos arquivos de registro (`CHANGELOG.md`, `docs/SPRINTS.md`,
`CODEMAP.md`). O segundo a ser mesclado vai precisar trazer a `main` antes, como aconteceu com os PRs #62 e #63: sem
isso, o GitHub não roda o CI de um PR em conflito.

### 3. A regra 3a no código

- **Os dois lados:** `BOTH_SIDES_SCORE` passou a falso. A carteira continua contando como "entrou" na campanha.
- **O pote devolvido:** uma campanha que só existe nos eventos conta como devolvida pelo `CampaignFinalized` com
  `OneSided`. Para uma campanha viva, a API de leitura usa o modo que o finalize gravou ou, se o resultado já é final
  e o finalize não rodou (no devnet ninguém roda), o modo que ele gravaria, pela mesma conta do programa que o SDK
  espelha (`snapshotOf`). As entradas fecham na resolução, então os totais de um resultado final também são finais. O
  SIM de preço continua esperando a liquidação, porque as entradas tardias só se conhecem no tally.
- **Quem abriu:** a carteira que abriu não pontua nos tipos em que quem abre pode controlar o resultado: todos menos
  preço, os mesmos que já mostram o aviso do criador. O criador vem do `CampaignOpened` ou, para a campanha viva, da
  própria conta, caso o evento de abertura não tenha sido lido.
- **As outras carteiras de quem abriu continuam pontuando.** Nada na rede liga uma carteira a outra. Adivinhar pela
  origem do dinheiro seria montar um perfil, o que a revisão de privacidade recusou. A página diz isso com todas as
  letras.
- **Um pote devolvido conta como "decidido"** (o resultado foi lido) e não pontua (ninguém recebeu pelo palpite). O
  contador "decided" não aparece na API; ficou com o sentido de antes.
- **Se a conta do SDK recusar os totais** de uma campanha, ela não fica final: o finalize recusaria também. Assim uma
  campanha estranha não derruba o ranking de todo mundo.
- **Testes:** a regra (`tests/sdk/points-3a.test.ts`), a rota (`services/api/tests/leaderboard-pot.test.ts`) e um
  ciclo inteiro no LiteSVM com um pote de um lado só (`tests/api/leaderboard.test.ts`), onde a carteira dos dois lados
  agora fica com zero. Os arquivos de teste foram divididos para ficarem abaixo de 200 linhas.

A regra mudou antes de a API ir ao ar no devnet, então nenhum ranking publicado é reescrito.

## Consequences

- Das condições da revisão de privacidade (plano técnico, §8.2) para o ranking ir ao ar, a 3 e a 8 estão resolvidas.
  Falta a 9a: a `/privacy` corrigida e linkada no rodapé.
- Ficam para depois: o texto das páginas da 9a (o fundador publica a landing); o relatório do parceiro, da Sprint 08;
  a marca do teste 3 e a regra contra a colheita de prêmio, antes da mainnet (a segunda é mudança no programa, dentro
  do escopo da auditoria); e a reimplantação da API, que é passo de servidor do fundador.
- O plano técnico foi para a v0.1.6.
