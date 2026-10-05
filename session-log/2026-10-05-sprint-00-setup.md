# 2026-10-05 — Sprint 00: upstream trazido, programa novo criado, CI ampliado

## Context

O Lucas aprovou os três documentos da Fase 4 com a frase "docs aprovados, podemos dar início". Ele não alterou
nenhuma das doze respostas da seção 14.2 do plano técnico, e tinha sido avisado de que, sem resposta em contrário,
valeria a recomendação. Com isso a Sprint 00 (`docs/sprints/sprint-00-setup.md`) foi aberta.

O ponto de partida: os documentos estavam em `feat/layout-tape`, a 220 arquivos da `main`; a cópia local do
programa tinha seis leitores, e os outros três estavam só em `upstream/main`; a conferência automática nunca tinha
rodado neste repositório.

## Decision

1. **`feat/layout-tape` foi para a `main` por pull request (#1), com merge, depois de a conferência automática
   passar.** Foi a primeira vez que ela rodou aqui: compilação, IDL, clippy, os dois conjuntos de testes e o build
   de produção do app, tudo verde.
2. **O upstream veio por merge inteiro (`4d672ae`), e não só os leitores.** O roteiro deixava as duas saídas. O
   merge mantém a história e o aviso de autoria da licença MIT, e os testes do programa antigo continuam cobrindo
   os nove leitores enquanto eles não são portados.
3. **Os quatro conflitos, todos no app, foram resolvidos mantendo o nosso layout e trazendo a função do upstream:**
   o `ChatProvider` passa a envolver o layout atual; os três tipos novos ganham ícone e cor na nossa tabela de
   estilos; `stakeEpoch` virou `measuredEpoch`.
4. **O programa novo nasce em `programs/brot-markets`, ao lado do antigo**, com o endereço
   `6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN`. É só o esqueleto: constantes, erro, eventos e as pastas. Não tem
   instrução.
5. **A aposta mínima entrou como constante, 1 USDC**, que é o padrão de trabalho da pergunta 3. O teto da taxa,
   1.000 pontos-base, também.
6. **`packages/sdk` nasce só com o endereço e o IDL.** Mover `app/lib` para lá é a Sprint 05.
7. **A conferência automática ganhou quatro coisas:** artefato com `.so`, IDL e tipos, com SHA-256; conferência do
   IDL dos dois programas por `git status`; clippy nos dois pacotes; e o trabalho "Repo", com o mapa de código, a
   coerência do projeto e a varredura de segredos sobre a branch.
8. **A etapa 4.3 do método foi feita:** dos 72 pacotes do catálogo, nenhum para instalar.

## Alternatives considered

- **Trazer só os leitores e as contas capturadas, sem o merge.** Evitaria os conflitos no app, mas deixaria o
  repositório divergindo do upstream sem registro, e exigiria copiar à mão os testes que cobrem os leitores.
- **Empurrar direto para a `main`, sem pull request.** Seria um avanço rápido, sem merge. O pull request deu o
  resultado da conferência automática antes de a `main` mudar.
- **Conferir o IDL com `git diff --exit-code`, como estava.** Não enxerga arquivo gerado que nunca foi commitado:
  o IDL do programa novo passaria sem existir no repositório.
- **Usar o `gitleaks` na conferência automática.** A escolha de pacotes o deixou como recomendado. O script próprio
  reaproveita os padrões que o hook de commit já usa, sem dependência nova; ele não varre o histórico.
- **Compilar na máquina do Lucas para gerar o IDL.** A máquina tem Anchor 1.0.0 e Solana 2.2.16, e o projeto fixa
  1.1.2 e 3.1.x. O IDL vem do artefato da conferência automática.
- **Atualizar o `bun.lock` com `bun install`.** O comando falhou ao trocar o arquivo no disco (o volume é FAT32). A
  entrada do pacote novo foi escrita à mão; a conferência automática confere com `--frozen-lockfile`.

## Why this decision

A Sprint 00 existe para que as sprints seguintes só escrevam o programa. Por isso ela põe de pé o que protege o
resto: a `main` com os documentos, os nove leitores no repositório, o lugar do programa novo e uma conferência
automática que falha quando o mapa de código ou o IDL ficam velhos. O critério de pronto pede a prova dessas duas
falhas, então o primeiro envio foi de propósito sem o `CODEMAP.md` regenerado e sem o IDL.

## Risks

- **O `bun.lock` aponta para `registry.npmmirror.com`** em todas as 878 entradas, e não para o registro oficial do
  npm. Veio assim do upstream. Os pacotes têm hash de integridade, então o conteúdo é conferido, mas a
  disponibilidade depende de um espelho de terceiro. Não foi alterado.
- **O explicador em chat que veio do upstream chama o OpenRouter no servidor**, com chave em variável de ambiente.
  Sem chave, responde "not configured". Ele manda dados do mercado a um terceiro; no site novo, passa pela revisão
  de privacidade antes de ser ligado.
- **A chave do endereço do programa novo está só na máquina do Lucas**, em `target/deploy/`, pasta que o Git
  ignora. Se ela se perder antes da primeira publicação, o endereço muda. Precisa de cópia de segurança.
- **O Anchor e a Solana da máquina do Lucas são mais antigos que os do projeto.** Todo ciclo de compilação passa
  pela conferência automática, que leva cerca de dez minutos sem cache.
- **Um programa sem instrução é um caso incomum para o Anchor.** A primeira compilação mostra se ele aceita.
- **A pergunta 12 segue sem resposta:** quem guarda a chave de atualização na devnet e quem tem chave de equipe. A
  Sprint 02 depende disso.

## Atualização: a conferência automática e a revisão de segurança

- **O programa sem instrução compila**, e o IDL veio do artefato, com o SHA-256 conferido.
- **As duas falhas de propósito saíram como pedido** (execução 37322085234). A do mapa de código continuou
  depois da correção, e a causa era um defeito do gerador: ele lia os arquivos como estavam no disco, e num
  checkout do Windows o fim de linha mudava a descrição de um arquivo. Foi corrigido.
- **A revisão de segurança não achou nada crítico.** Foram aplicados nesta sprint: artefato publicável só da
  `main` e só depois dos testes; `Cargo.lock` imposto; IDL antigo apagado antes do build; clippy com a variante
  `mainnet`; varredura de segredos que reconhece chave da Solana e olha commit por commit; `init-if-needed`
  desligado; lints de aritmética em `deny`. O que ficou para depois está no documento da sprint, com destino.
- **A proteção da `main` não está disponível** em repositório privado da conta gratuita do GitHub. Um envio
  direto à `main` não passa pela conferência antes de entrar.
- **Conferência final verde:** execução 37325279961, commit `bdc9aa2`.

## Atualização: o fechamento

- **A revisão de fechamento confirmou as entregas** e apontou trechos velhos em quatro documentos e a falta dos
  achados adiados nas sprints de destino. Os dois pontos foram corrigidos antes do merge.
- **O PR #2 foi mesclado às 14:51 UTC (`2b06404`), e o push não disparou a conferência automática.** Seis minutos
  depois não havia execução para o commit, com o GitHub operacional. A causa não foi encontrada. Uma execução
  manual na `main` (37328963156) passou nos três trabalhos, mas não publicava o artefato, porque a condição exigia
  evento de push.
- **O PR #3 mudou a condição** para "na `main` e fora de pull request". Mesclado às 15:06 UTC (`dfc1d6e`); desta
  vez o push disparou a conferência em segundos.
- **Artefato da sprint:** execução 37330023572, `programs-dfc1d6e73849b01c1bfa67ebcee1f3a319aa82cd`. Os seis
  SHA-256 conferem, e o `brot_markets.so` tem o mesmo código de uma compilação anterior, feita em outro commit.
- **Tag `sprint-00`** em `dfc1d6e`. A cópia no servidor está na `main`, no mesmo commit.
- **Um erro meu de leitura no caminho:** dei o PR #3 como "sem conferência" quando ela só não tinha entrado na
  fila ainda. O GitHub criava as execuções com cerca de um minuto de atraso naquele momento.

## Follow-ups

- Fechar a sprint: IDL do programa novo commitado a partir do artefato, `CODEMAP.md` em dia, conferência automática
  verde, revisão, merge do PR #2 na `main` e tag.
- Cópia de segurança da chave do endereço do programa.
- Decidir se o `bun.lock` volta ao registro oficial do npm.
- Sprint 01: a prova do leitor de preço.

## Related links

- Arquivo da sprint: [`docs/sprints/sprint-00-setup.md`](../docs/sprints/sprint-00-setup.md)
- Plano técnico: [`docs/technical/TECHNICAL-PLAN.md`](../docs/technical/TECHNICAL-PLAN.md)
- Escolha de pacotes: [`docs/technical/registry-pick.md`](../docs/technical/registry-pick.md)
- Entrada anterior: [`2026-10-05-servidor-e-inicio-da-fase-4.md`](2026-10-05-servidor-e-inicio-da-fase-4.md)
- Sprint: 00
