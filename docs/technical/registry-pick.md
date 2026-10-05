# Brot Markets — Escolha de pacotes (Registry pick)

**Versão:** 0.0.1 · **Estado:** rascunho, para decisão do fundador · **Data:** 5 de outubro de 2026 · **Etapa:** Fase 4,
etapa 4.3 do wizard

Lista para decisão. **Nada foi instalado:** a skill `registry-pick` só indica, e quem instala é o fundador. Cada
pacote tem uma ficha em `docs/registry/packs/<nome>.md`. Licença, data e avisos abaixo são os que a ficha registra.

## Resumo para o fundador

O catálogo tem 72 pacotes. A maioria é para outro tipo de projeto: inteligência artificial, cursos, robôs de
trading, painéis de SaaS. Ficaram **nenhum obrigatório, 3 recomendados, 5 opcionais e 64 de fora**.

- **Nenhum é indispensável** para executar o roteiro: as sprints só citam agentes e skills que o projeto já tem.
- **Os três que eu mandaria instalar:** `gitleaks`, que procura senhas e chaves esquecidas no código e no
  histórico, antes de o repositório ficar público; `solana-claude` (regras de Solana e Anchor para o assistente); e
  `trailofbits-skills` (revisão de segurança). Os dois últimos estão no catálogo com licença "a conferir": dá para
  ler já, mas copiar para o repositório só depois de conferir a licença.

Todas as fichas foram conferidas em abril ou maio de 2026, há cinco meses.

## Registry recommendation for Brot Markets

Sinais do projeto (project signals detected):

- **Stack:** Anchor 1.1.2 e Rust 1.89 no programa; Bun 1.4.2, TypeScript e SQLite nos serviços; Next.js 16 e
  Tailwind v4 no site (plano técnico, seção 1).
- **Domínio:** mercado de previsão em pote, com o USDC guardado pelo programa.
- **Conformidade:** nenhum dado pessoal para apostar (plano técnico, seção 8); duas auditorias externas antes da
  rede principal (seção 7).
- **Interface:** site web, direção Ledger² aprovada em 3/10/2026 (`docs/product/DESIGN-DIRECTION.md`).
- **Hospedagem:** servidor próprio, dividido com outro projeto; sem Vercel e sem Supabase (seção 12).
- **Repositório público:** não conferido. Precisa ser público antes da rede principal (seção 7).
- **Prática da equipe com Claude Code:** não informada.

**Passada de design (etapa 3.1).** Não existe `docs/technical/registry-pick-design.md`, e a busca em `docs/` e
`session-log/` não achou registro dela. Por isso os pacotes de design são avaliados aqui, e quase todos ficam de
fora: a direção já está aprovada.

### Instalar (must install)

Nenhum. O candidato era o `gitleaks`, porque a Sprint 00 pede varredura de segredos no CI. Durante a redação
apareceu na árvore de trabalho, ainda sem commit, `scripts/ci-secret-scan.js`, que cumpre esse critério com os
padrões do hook do próprio projeto. Se esse script não entrar, o `gitleaks` volta para esta lista.

### Recomendado (recommended)

| Pacote | Por que neste projeto | Sprints | Como, e o que altera | Licença · conferido em · avisos |
|---|---|---|---|---|
| [`gitleaks`](../registry/packs/gitleaks.md) | Varre o repositório e todo o histórico, com regras mantidas por fora. O script do projeto só olha as linhas novas de cada branch. O projeto lida com chaves de carteira, e o repositório precisa ficar público antes da rede principal | 16 a 18; na 00, como segundo passo do CI, se quiser | Ficha: `brew install gitleaks`, `go install github.com/gitleaks/gitleaks/v8@latest`, ou a `gitleaks-action` no CI. Aqui: um passo no CI, com a ação fixada por hash. Não muda programa, serviços nem site | MIT, "confirmar no upstream" · 30/4/2026 · a ficha não traz comando para Windows nem a licença da `gitleaks-action` |
| [`solana-claude`](../registry/packs/solana-claude.md) | É o único pacote do catálogo feito para Solana e Anchor. O caminho do dinheiro no programa é todo novo, e as regras do projeto hoje são genéricas | 00 a 05, 14 e 15 | Ficha: `open https://github.com/solanabr/solana-claude` e copiar as regras e skills que servirem para `stack-packs/solana/`, que hoje só tem um README. Altera só as instruções do assistente. Regra que contrarie o `CLAUDE.md` (versões presas, LiteSVM, `@anchor-lang/core`) não entra | "conferir no upstream" · 30/4/2026 · licença indefinida. O roteiro diz que já há uma skill de Solana na máquina do usuário; o catálogo não informa se é a mesma |
| [`trailofbits-skills`](../registry/packs/trailofbits-skills.md) | A ficha indica para contratos e para projeto que entra em produção. O programa guarda USDC e vai a duas auditorias; a revisão prévia não as substitui | 02 a 04, 14 a 16, e 17 antes de mandar o código aos auditores | Ficha: `open https://github.com/trailofbits/skills`; instalar do upstream, revisando cada skill antes de adotar. Acrescenta skills de revisão ao assistente; não muda código | "conferir no upstream" · 30/4/2026 · licença indefinida. Sobrepõe as skills de segurança do `everything-claude-code`; a ficha diz que este é o mais conservador |

### Opcional (optional)

| Pacote | Por que neste projeto | Sprints | Como, e o que altera | Licença · conferido em · avisos |
|---|---|---|---|---|
| [`cis-hardening-guide`](../registry/packs/cis-hardening-guide.md) | Lista de conferência para endurecer servidor. Serve para a máquina do keeper reserva. No servidor atual quase não se aplica: a regra da casa proíbe mudança de sistema | 07 e 16 | Só leitura: `open https://github.com/Jacob-Hegy/CIS-Hardening-Guide`. A ficha manda não copiar | "conferir no upstream" · 30/4/2026 |
| [`everything-claude-code`](../registry/packs/everything-claude-code.md) | Coleção de skills (TDD, revisão de segurança, testes de ponta a ponta). Já estava carregada na sessão do Claude Code que gerou este documento: nada a instalar | 01 a 13, conforme a skill | Ficha: plugin do upstream, sem copiar para o repositório (`.claude/skills/external/affaan-everything-claude-code.md`) | "conferir no upstream" · 30/4/2026 · a ficha manda auditar cada skill antes de adotar |
| [`phantom-ui`](../registry/packs/phantom-ui.md) | Gera sozinho o estado de carregamento das telas, que a Sprint -1 precisa desenhar | -1, 10 a 12 | Ficha: `npm install @aejkatappaja/phantom-ui` (aqui seria em `app/`, com Bun). Dependência nova do site, cerca de 8 kB | MIT · 30/4/2026 · versão 0.9.0, anterior à 1.0. Não serve com CSP que bloqueie Web Components |
| [`system-design-primer`](../registry/packs/system-design-primer.md) | Leitura sobre filas, cache e balanceamento de carga. A ficha indica para dar vocabulário a fundador que não programa | 06 a 08 | Nada a instalar: ler no GitHub | MIT (código) + CC-BY 4.0 (texto) · 30/4/2026 |
| [`understand-anything`](../registry/packs/understand-anything.md) | Transforma o código num grafo navegável e ajuda a explicar o repositório a quem não programa. O `CODEMAP.md` já cobre parte disso | 00, depois de trazer o `upstream` | Plugin; a ficha manda seguir o README do upstream | MIT · 9/5/2026 · conferir antes se o código passa por serviço externo |

### Deixados de fora, e por quê (skipped)

- **Design, com a direção já aprovada (11).** `ui-ux-pro-max`, `open-design` e `awesome-design-md` exploram ou
  impõem um visual, e o projeto já tem o seu. `nellavio` é um painel de SaaS com login e papéis; aqui a entrada é a
  carteira, e o visual de painel genérico foi rejeitado. `tegaki` anima letra manuscrita, que não cabe na Ledger².
  `app-store-screenshots` é para aplicativo de loja. `hyperframes` é vídeo. `ascii-draw` é programa de Linux, com
  licença GPL-3.0. `isomiddleearth` não tem licença declarada. `diagram-design` e `fireworks-tech-graph` fazem
  diagramas, e nenhuma sprint pede diagrama novo; se pedir, só o segundo tem licença declarada (MIT).
- **Outros métodos e ambientes para o assistente (12).** `gstack`, `ruflo`, `antigravity-awesome-skills`,
  `claude-code-harness`, `holyclaude`, `optio`, `vibeyard`, `slavingia-skills`, `anthropics-skills`,
  `agent-skills-eval`, `agent-exchange` e `jeweledtech-agentic-framework`. O projeto já segue um método, e o
  catálogo manda escolher um só. `slavingia-skills` repete as skills `processize` e `grow-sustainably`, que o
  projeto já tem. `holyclaude` e `optio` pedem Docker ou Kubernetes, que o plano técnico não usa.
- **Trading e finanças (6).** `autohedge`, `vibe-trading`, `tradingagents`, `fincept-terminal`, `kronos` e
  `miroshark` são robôs, simuladores e previsão de preço. O Brot Markets não opera nem prevê: lê um fato na rede.
  `fincept-terminal` e `miroshark` têm licença AGPL-3.0; `autohedge` é experimental.
- **Inteligência artificial, imagem e áudio (12).** `bark`, `clip`, `segment-anything`, `stable-diffusion`,
  `open-higgsfield-ai`, `locally-uncensored`, `google-research`, `pathway-llm-app`, `mirothinker`,
  `auto-research-claw`, `claude-cookbooks` e `openai-cookbook`. O produto não usa modelo de IA. `stable-diffusion`
  está arquivado na prática.
- **Cursos e bases de dados (13).** Os cinco `microsoft-*-for-beginners`, `made-with-ml`, `llms-from-scratch`,
  `python-100-days`, `python-data-science-handbook`, `tensorflow-examples` (parado desde 2020),
  `data-engineer-handbook`, `data-engineering-zoomcamp` e `quran-database`. Python, aprendizado de máquina e
  engenharia de dados não estão na stack.
- **Outras plataformas e usos (8).** `agentic-inbox` (Cloudflare Workers; aqui o Cloudflare é só o túnel),
  `googleworkspace-cli`, `cryptpad`, `openhuman`, `crawlee` (raspagem de sites), `unity-mcp` (jogos), `st3gg` e
  `yara-style-guide` (esteganografia e malware).
- **Nada a instalar (2).** `boringco` é privado e arquivado. `awesome-selfhosted` já está no repositório, em
  `docs/selfhosted/`, com licença CC-BY-SA 3.0.

### Perguntas em aberto antes de instalar (open questions)

1. **Licenças "conferir no upstream":** `solana-claude`, `trailofbits-skills`, `everything-claude-code` e
   `cis-hardening-guide`. O `README` do catálogo diz para nunca instalar pacote de licença indefinida. Conferir
   na origem antes de copiar qualquer arquivo; este documento não acessou a internet.
2. **Datas de cinco meses.** Conferir se cada pacote escolhido continua ativo.
3. **O repositório no GitHub é público hoje?** O catálogo usa isso como sinal para o `gitleaks`.
4. **Qual é a skill de Solana já instalada na máquina,** e ela é o `solana-claude`? Se for, o recomendado cai para
   "já existe".
5. **`gitleaks`:** entra já na Sprint 00 ou só antes de abrir o repositório? E pela `gitleaks-action` ou baixando o
   programa? A ficha não informa a licença da ação.
6. **Quem instala tem prática com Claude Code?** Várias fichas desaconselham pacotes grandes para iniciantes.

Refazer esta escolha se o plano técnico ou o resumo de produto mudar.
