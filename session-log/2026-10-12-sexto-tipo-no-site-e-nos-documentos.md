# 2026-10-12 — O sexto tipo no site e nos documentos

## O pedido

Um pedido colado na sessão: a integração do sexto tipo, `DbcGraduated`, no site (a caixa de abertura e a página da
campanha) e nos documentos oficiais, numa branch nova, `feat/dbc-graduation-ui`, criada a partir da
`feat/dbc-graduation-reader` (PR #76, em rascunho). Na caixa: o tipo nas opções, o campo do pool da Meteora, as recusas
6148 a 6152 com o texto já escrito. Na página: componentes próprios, uma barra de `quote_reserve` sobre
`migration_quote_threshold` e a frase "YES can be bought by anyone who pays the rest of the curve." Nos documentos: o
BP, o resumo de produto e os Termos, toda menção a "five kinds" ou "5 kinds" passando a seis, uma descrição breve do
tipo, e a nota de que os Termos precisam de revisão jurídica final. Para terminar: lint, tipos e build do app passando,
e um PR novo em rascunho.

O pedido falava em "market type". O `CLAUDE.md` manda dizer "campaign kind" (nunca "market" fora da marca) e vale mais
que o pedido; o código e os textos novos seguem o `CLAUDE.md`.

## O que foi feito

- **A página da campanha** (`app/features/campaign-page/`): `curve.ts` lê a curva pelo leitor do SDK (o dono antes de
  qualquer byte) e calcula o que a página mostra: quanto juntou, o limite, a fatia preenchida, o que falta, o estágio e
  o segundo em que completou; e o "se lido agora" pela mesma regra do programa (`stamped_resolution`).
  `curve-progress.tsx` desenha a barra, o estágio, o que falta ou quando completou, e o aviso de que o SIM pode ser
  comprado, sempre à vista. O resto da página (o painel da prova, os comandos de reconferência, o título, a cor do tipo)
  ganhou o sexto tipo.
- **A lista e a página inicial**: o cartão lê quanto a curva juntou e só dá SIM a uma curva completa até o prazo; a
  frase do tipo é "Meteora launch curve X raises its full 85 SOL"; o filtro ganhou "Graduation".
- **A caixa de abertura** (`app/features/open-campaign/`): o modelo `dbc-graduation`; a leitura da config que o pool
  aponta (mais um `getAccountInfo`); a conferência do pool e da config na ordem do leitor; a meta mostrada só para
  leitura (`curve-target.tsx`); as recusas no campo do pool; o modelo aberto em todo cluster menos a mainnet.
- **Os documentos**: o BP v0.0.4 (índice, Parte 1, Parte 4), o resumo de produto, os Termos, o `PITCH.md`, o README, a
  página dos tipos do docs (e o HTML gerado por `build-docs.mjs`), o plano técnico (v0.1.9), a lista do relay, o status
  do plano da Meteora e o CHANGELOG.
- **Testes**: `tests/site/curve.test.ts` (a página, o cartão, a frase) e `tests/site/open-curve.test.ts` (a caixa, e
  a caixa até o programa no LiteSVM); os testes que contavam cinco tipos passaram a seis.

## Decisões minhas, e por quê

- **A meta não se digita.** O programa só aceita a meta igual ao limite da curva (`TargetNotThreshold`), então um campo
  livre só serviria para errar. A caixa lê o limite da config e o põe na meta; enquanto a config não foi lida, a meta é
  0, que o programa nunca aceita, porque recusa o pool ou a config antes de ler a meta.
- **A conferência do campo do pool inclui a curva completa e a curva cheia demais.** Essas recusas são da linha 3 (a
  meta), mas a meta não é do criador: o que ele pode trocar é o pool. Por isso aparecem junto ao campo do pool, com
  texto próprio ("This curve has already completed…", "This curve is more than 90% full…"), e não junto à meta.
- **Uma config que não existe é recusada como `ReaderWrongOwner`**, que é o que o programa responderia: a conta lida
  seria do System Program, vazia. Com um pool de verdade não acontece.
- **A leitura da caixa vale só para o tipo para o qual foi feita.** Antes, trocar de tipo com o mesmo endereço reusava
  a leitura do tipo anterior até a nova chegar; no sexto tipo isso faria a conferência piscar uma recusa falsa, porque a
  leitura antiga não tem a config.
- **A fatia preenchida nunca arredonda para cima** (99,99% aparece "99.9%"), para uma curva aberta nunca parecer
  completa.
- **O cartão, sem o relógio da rede, decide pelo carimbo**: completa com carimbo depois do prazo é NÃO; sem carimbo, SIM.
  A página, que tem o relógio da rede, usa a regra inteira. O caso que diverge (completa, sem carimbo, depois do prazo)
  não acontece numa DBC de verdade, que grava o carimbo ao completar.
- **Os documentos ganharam um acréscimo datado, sem versão nova do BP nem do resumo de produto.** As escolhas M-1 a M-7
  vieram fixadas no pedido de 12/10/2026, fora das decisões de 8/10/2026; o BP diz isso e as põe na lista do que espera
  o fundador. Uma v0.0.5 com revisão de impacto fica como opção.
- **Os registros históricos ficaram como estavam**: os session logs, as entradas antigas do CHANGELOG, os arquivos das
  sprints, as versões antigas do BP, as revisões em `_review/`, a proposta de arquitetura, o `prototype-lab/` e o
  `knowledge-base/`. Onde um documento atual registra uma decisão de 8/10/2026 com "cinco tipos", a frase ficou e
  ganhou "seis desde 12/10/2026".
- **Os Termos continuam fora do ar**: ganharam a nota de 12/10/2026 no topo e o sexto tipo na seção 4, com a frase de
  que o SIM pode ser comprado; nenhuma página os publica.

## O que foi conferido

- No app: `bun run lint`, `bunx tsc --noEmit` e `bun run build` (Next 16.3.8) passam, também depois das últimas mudanças.
- Na raiz: os 783 testes TypeScript passam (eram 770; 13 novos), com `bunx tsc --noEmit`, `bun run lint` (Prettier,
  dependency-cruiser, o typecheck ES2022 do SDK e a portabilidade), o mapa de código em dia, o `os-self-test`
  (coerente, com o aviso de sempre), os 172 testes do OS e a varredura de segredos limpa.
- Os 51 testes do site provisório passam com o HTML do docs regerado.
- A abertura feita pela caixa foi aceita pelo programa no LiteSVM, de graça e paga, no pool real de estágio 0 com a
  config de 85 SOL; as recusas da caixa (curva de 11 SOL, curva em USDC, curva completa, curva 90% e um lamport cheia)
  foram recusadas pelo programa com o mesmo erro.
- Não conferido: a tela num navegador (nenhum teste na web foi escrito para o sexto tipo), o upgrade no devnet e o
  Rust, que não mudou.

## Em aberto

- **O upgrade no devnet**, com o programa do PR #76, e só depois o build do site: o build grava o slot do deploy do
  programa (A-8) e se recusa a assinar contra outro (`ProgramUpgraded`). Antes do upgrade, o espelho do SDK na caixa
  aceita o sexto tipo, mas a simulação antes de assinar o recusa (o programa no devnet não conhece o byte 5,
  `UnknownReaderKind`). Com o piso de 85 SOL, uma campanha de teste no devnet precisa de um pool da DBC no devnet com
  config de 85 SOL ou mais, cotada em SOL.
- **A revisão jurídica final dos Termos**, antes de qualquer publicação, e a confirmação de M-1 a M-7 pelo fundador.
- **Nomes revisados para pools da DBC**: o arquivo de nomes ainda não aceita o tipo `curve` (o schema do SDK lista
  quatro tipos); um pool da DBC aparece pelo endereço curto.
- **O teste na web (Playwright)** do sexto tipo, que este trabalho não escreveu.
