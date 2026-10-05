# Brot Markets — Roteiro de sprints

**Versão:** 0.0.1 · **Estado:** aprovado pelo fundador em 5/10/2026 ("docs aprovados, podemos dar início") · **Data:** 5 de outubro de 2026 · **Etapa:** Fase 4,
etapa 4.4 do wizard

Diz em que ordem o produto é construído, o que cada sprint entrega e o que conta como pronto. Não tem datas nem
duração: o fundador pediu o plano "ignorando qto tempo falta". Valem a sequência, as dependências e o critério de
pronto. Cada sprint tem um arquivo em `docs/sprints/`.

**Referências.** `B3` é um bloco do plano técnico (`docs/technical/TECHNICAL-PLAN.md`, seção 3.1); `Q4`, `T3` e `C7`
são as perguntas das seções 14.2, 14.3 e 14.4 dele. `R-07`, `F3` e `L-12` são regras, fluxos e lacunas do resumo de
produto (`docs/product/PRODUCT-BRIEF.md`). `P4 §3.3` é a Parte 4 do plano de negócio, seção 3.3.

## Resumo para o fundador

São 20 sprints, em seis grupos. A ordem é a que você pediu: programa e serviços na devnet, depois a ligação entre
eles, depois o site na Ledger².

| Grupo | Sprints | O que passa a existir |
|---|---|---|
| 1. O programa do pote | 00 a 05 | O contrato que guarda o USDC de cada pergunta, registra as apostas, lê o resultado na rede e calcula quanto cada um recebe. No fim, um ciclo inteiro roda na devnet: abrir a pergunta, apostar, resolver, esperar as 6 horas e pagar |
| 2. Os serviços | 06 a 08 | O serviço que resolve e paga sozinho, no servidor que já temos; o segundo, em outro provedor, que vigia o primeiro e avisa o CTO; e o que guarda o histórico e calcula os pontos |
| 3. O design system | -1 | As cores, as fontes e os componentes da Ledger², em claro e escuro, e o conteúdo novo das telas que ainda mostram o modelo antigo |
| 4. O site | 09 a 13 | A lista de perguntas, a página da pergunta com a aposta, minhas apostas, os estados da pergunta, a classificação e os avisos. Fecha o MVP da devnet |
| 5. Antes da rede principal | 14 e 15 | A indicação, a segunda leitura da disputa e o patrocínio pago com pedido de pergunta |
| 6. Segurança e abertura | 16 a 18 | Carteira com duas assinaturas de três, teto global, pausa testada, plano de incidente, as duas auditorias com as correções e, só então, dinheiro real |

**Quatro coisas para saber.**

1. **O design system leva o número -1 porque o método pede, mas na sua ordem ele vem depois do programa e dos
   serviços.** Ele não depende do programa e pode correr em paralelo. Só o site espera por ele.
2. **Nenhum serviço e nenhuma tela usa o programa antes de o teste de dinheiro passar.** É o teste da Sprint 04: ele
   sorteia centenas de operações e confere, depois de cada uma, que nenhum centavo sumiu nem apareceu.
3. **Há decisões suas que travam sprints.** A seção 5 as agrupa pela primeira sprint que cada uma trava. As que
   travam mais cedo: aprovar os documentos da Fase 4; dizer quem guarda as chaves (Q12); os limites da aposta (Q3);
   e quem pode acionar a leitura e o pagamento (Q1).
4. **Rede principal só com os três critérios** (P4 §3.4): duas auditorias com as falhas graves corrigidas, carteira
   2 de 3 e teto global gravado no programa. Se faltar um, a abertura espera.

**O que este roteiro não promete:** data. A seção 6 traz a menor sequência que deixa algo demonstrável na devnet,
para o hackathon.

## 1. Como ler

- **Número não é calendário.** A numeração segue a prioridade do fundador. Sprints sem dependência entre si podem
  correr juntas: a 01 com a 02; a 06 com a 08; a -1 com qualquer uma até a 08.
- **Nomes.** Arquivo `docs/sprints/sprint-XX-topico.md` e branch com o mesmo nome, aberta da `main`; commits com a
  marca `[STAGE:CHEGADA]`.
- **Antes do código,** o método exige a aprovação do plano de negócio, do documento de design, do resumo de
  produto, do plano técnico e deste roteiro (wizard, etapa 5.1). Os cinco estão aprovados desde 5/10/2026, e a etapa 4.3
  (`docs/technical/registry-pick.md`) foi feita na Sprint 00.
- **Agentes e skills** citados são só os do projeto. A skill de Solana que o plano técnico cita fica na máquina do
  usuário.

## 2. As sprints

**Situação em 5/10/2026.** A Sprint 00 está concluída, com a tag `sprint-00`. Nenhuma outra começou. A próxima é a 01.

| # | Sprint | Bloco | Depende de |
|---|---|---|---|
| -1 | [Design system](sprints/sprint--1-design-system.md) | pré-requisito de B8 | 00 |
| 00 | [Setup](sprints/sprint-00-setup.md) | B0 | — |
| 01 | [Fundação: prova do leitor de preço](sprints/sprint-01-foundation.md) | B1 | 00 |
| 02 | [Núcleo do pote](sprints/sprint-02-pot-core.md) | B2 | 00 |
| 03 | [Leitores e resolução](sprints/sprint-03-readers-resolution.md) | B3 | 01, 02 |
| 04 | [Janela, acerto, pagamento e taxa](sprints/sprint-04-settlement-invariants.md) | B4 | 03 |
| 05 | [SDK e ciclo na devnet](sprints/sprint-05-sdk-devnet-cycle.md) | B5 | 04 |
| 06 | [Servidor e keeper principal](sprints/sprint-06-keeper-server.md) | B6 | 05 |
| 07 | [Keeper reserva e vigia](sprints/sprint-07-standby-watchdog.md) | B6 | 06 |
| 08 | [Indexer, API e pontuação](sprints/sprint-08-indexer-api-points.md) | B7 | 05; 06 para publicar |
| 09 | [Site: casca, tema e carteira](sprints/sprint-09-site-shell.md) | B8 | 05, 06, 08, -1 |
| 10 | [Site: lista de perguntas](sprints/sprint-10-site-question-list.md) | B8 | 09 |
| 11 | [Site: pergunta e aposta](sprints/sprint-11-site-question-bet.md) | B8 | 09, 10 |
| 12 | [Site: minhas apostas e estados](sprints/sprint-12-site-my-bets-states.md) | B8 | 11, 06 |
| 13 | [Site: classificação, avisos e textos](sprints/sprint-13-site-notices-copy.md) | B8 | 12, 08, 07 |
| 14 | [Indicação e segunda leitura](sprints/sprint-14-referral-second-read.md) | B9 | 04, 07, 08, 12 |
| 15 | [Patrocínio pago](sprints/sprint-15-sponsorship.md) | B9 | 04, 05, 12 |
| 16 | [Endurecimento](sprints/sprint-16-hardening.md) | B9 e seção 7 | 14, 15, 07 |
| 17 | [Auditoria e correções](sprints/sprint-17-audit-fixes.md) | seção 7 | 16 |
| 18 | [Rede principal com teto](sprints/sprint-18-mainnet-capped.md) | seção 7 | 17 |

## 3. Mapa de dependências

```
00 ──┬──▶ 01 ──┐
     ├──▶ 02 ──┴──▶ 03 ──▶ 04 ──▶ 05 ──┬──▶ 06 ──▶ 07
     │                                 └──▶ 08
     └──▶ -1   (em paralelo; não espera o programa)

05 + 06 + 08 + (-1) ──▶ 09 ──▶ 10 ──▶ 11 ──▶ 12 ──▶ 13   (a 13 também espera a 07)

04 + 07 + 08 + 12 ──▶ 14 ──┐
04 + 05 + 12 ───────▶ 15 ──┴──▶ 16 ──▶ 17 ──▶ 18
```

**Como a Sprint -1 e o pedido "programa primeiro" se conciliam.** A -1 não lê o programa: não bloqueia as Sprints
00 a 08 nem é bloqueada por elas. Com uma só frente de trabalho, entra depois da 08. É pré-requisito apenas das
Sprints 09 a 13.

## 4. O que vale para toda sprint

**Os seis portões do roteiro.**

1. **Dinheiro.** O teste aleatório de invariantes (I1 a I10) passa na Sprint 04 antes de qualquer sprint de serviço
   ou de site usar o programa. Volta a rodar, ampliado, quando a 14 e a 15 mexem no programa.
2. **Chaves.** Nenhuma chave no repositório. A skill `secrets-scan` roda no fechamento de toda sprint.
3. **Servidor compartilhado.** Tudo roda como o usuário `brot`, com porta só em `127.0.0.1` e segredo em
   `/etc/brot-markets`. Reinício, `apt upgrade` e mudança de firewall só com aviso ao outro lado. Nada do outro
   projeto é tocado.
4. **Compilação.** O programa é compilado na conferência automática do GitHub, nunca no servidor. Vai para a rede o
   artefato de lá, com o SHA-256 conferido.
5. **Dado pessoal.** A skill `privacy-audit` roda antes de fechar as Sprints 08, 13 e 17.
6. **Rede principal** só depois de auditoria, carteira 2 de 3 e teto global.

**Fechamento comum.** Entra no critério de pronto de todas:

1. A conferência padrão passa.
2. `secrets-scan` limpa.
3. `node scripts/codemap.js` rodado, com o `CODEMAP.md` no mesmo commit.
4. `CHANGELOG.md` atualizado e as decisões no `session-log/`.
5. Revisão do `coordinator-agent`; revisão adversarial quando a sprint toca dinheiro, chave ou dado pessoal.
6. Documento da sprint com o estado final e a retrospectiva; merge na `main` e tag (`docs/sprint-system.md`).

**Conferência padrão.** Desde a Sprint 00 os comandos de Rust cobrem os dois pacotes, e `test:rust` roda os dois.

```bash
bun run build:program && bun run test && bun run test:rust
cargo fmt --all -- --check
cargo clippy --locked -p pred-provable --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
bunx tsc --noEmit && bun run lint
cd app && bun run lint && bun run build
node scripts/codemap.js --check && node scripts/os-self-test.js && node scripts/ci-secret-scan.js origin/main
```

## 5. Decisões do fundador que travam sprints

Cada decisão aparece uma vez, na primeira sprint que ela trava.

| Sprint | O que precisa de resposta |
|---|---|
| 00 | Aprovar o resumo de produto, o plano técnico e este roteiro. Dar o sinal para trazer o `upstream/main` |
| 01, para fechar | Se a Pyth não servir na devnet: abrir com quatro tipos ou rever a decisão dos cinco (P1 §4.2) |
| 02 | **Q3:** aposta mínima, apostar nos dois lados, alcance da isenção do primeiro apostador (L-07). **Q12:** quem guarda a chave de atualização na devnet e quem tem chave de equipe |
| 03 | **Q1:** quem pode acionar a leitura e o pagamento. **Q4:** o que conta como "encostou no alvo" |
| 04 | **Q2:** o vencedor pode pedir o envio pela própria carteira (L-15) |
| 06 | **Q8:** verba para o acesso pago à rede. **Q11:** o domínio. **Q12:** o Ronaldo saber que o projeto vai para o servidor |
| 07 | **Q8:** o provedor da segunda máquina e o serviço de email, ou adiar o segundo serviço |
| 08 | **Q7:** a fórmula dos pontos (L-09) |
| -1 | Escuro oficial; tema padrão; idioma (L-01); gráfico da chance (L-23); aviso de dinheiro preso (L-03); selo e destaque (L-24); aprovar as telas redesenhadas |
| 11 | **Q10:** como se consegue USDC de teste (L-08) |
| 12 | O canal público de contestação (L-13); o nome público do estado durante a disputa (L-04) |
| 13 | A fase da página de sugestões e o nome do X (L-17); o que os pontos valem depois (L-09); o relatório do parceiro (L-24) |
| 14 | **Q9:** início dos 90 dias; onde se vê o saldo (L-10); a etapa 2 antes da fase 1.2 e o segundo oráculo (L-14); quem assina o repasse semanal |
| 15 | **Q5** e **Q6**; as telas (L-11); a página do Cloak (L-18); as contrapartidas das faixas pagas |
| 16 | Os três que assinam (P3); o primeiro valor do teto (P4, L-19); o dono da rotina de conferência e o substituto do CTO; abrir sem a 14 ou a 15 |
| 17 | Prazo, escopo e versão das duas auditorias, e o nome da segunda empresa; a avaliação jurídica (L-20, L-21); a página do SODAX (L-18) |
| 18 | Confirmar os três critérios; a empresa aberta; a regra da tesouraria (P8) |

As Sprints 05, 09 e 10 não têm decisão própria. L-02, L-05, L-06 e L-22 são de tela e se resolvem na Sprint -1.
L-12, L-16 e L-25 não travam nenhuma sprint.

**Uma pergunta que convém fazer já,** embora só trave a 17: o prazo e o escopo das duas auditorias (P4 §9.4). A
resposta diz se o núcleo pode ser lido antes de a 14 e a 15 ficarem prontas.

## 6. A menor sequência para demonstrar na devnet

Sem data. Três degraus, cada um demonstrável.

1. **00 → 01 → 02 → 03 → 04 → 05.** Um ciclo inteiro na devnet, acionado por script: abrir a pergunta, apostar,
   resolver, passar a janela e pagar. Sem tela. Se a prova da 01 falhar, segue com quatro tipos, por decisão do
   fundador.
2. **Mais a 06.** A resolução e o pagamento saem sozinhos.
3. **Mais a 08, a -1, a 09, a 10 e a 11.** Uma pessoa de fora abre o site, vê as perguntas e aposta. Com a 12,
   acompanha até receber.

A 07 não é necessária para demonstrar, mas é ela que cumpre a regra dos dois serviços (R-22).

**Cloak, a trilha de privacidade.** Pelo plano de negócio (P4 §5.2) é uma demonstração em duas redes, sem código no
site. Os documentos não fecham um ponto: a carteira nova "entra numa pergunta como patrocinador não divulgado", e o
módulo de patrocínio é a Sprint 15. Se a demonstração precisar disso de verdade, a 15 sobe na ordem; é decisão do
fundador.

## 7. Conferência: toda regra e todo fluxo em alguma sprint

| Regra | Sprints | Regra | Sprints |
|---|---|---|---|
| R-01 taxa | 04, 05, 11 | R-17 formas de patrocínio | 15 |
| R-02 pagamento | 04, 05, 11 | R-18 os 30% quando o prêmio volta | 15 |
| R-03 chance | 02, 05, 10 | R-19 não divulgado e aviso | 10, 15 |
| R-04 retorno estimado | 05, 10, 11 | R-20 pedido de pergunta | 15 |
| R-05 moeda e limites | 02, 11 | R-21 parceiros gratuitos | 08, 10, 13 |
| R-06 duração | 02 | R-22 serviços agendados | 06, 07 |
| R-07 fechamento | 02, 10 | R-23 janela de revisão | 04, 12 |
| R-08 trava no fato | 03, 11 | R-24 pagamento automático | 04, 06, 12 |
| R-09 pergunta de preço | 01, 03, 06, 11 | R-25 contestação | 04, 12, 14 |
| R-10 pote de um lado só | 04, 12 | R-26 disputa em duas etapas | 07, 14 |
| R-11 anulada | 03, 04, 12 | R-27 indicação, quem indica | 14 |
| R-12 prêmio que volta | 04, 15 | R-28 indicação, indicado | 14 |
| R-13 cinco tipos | 03, 05 | R-29 destino da taxa | 04, 18 |
| R-14 tipos fora | 03 | R-30 teto global | 02, 04, 16, 18 |
| R-15 faixas | 15 | R-31 pausa | 02, 04, 16 |
| R-16 divisão 70 e 30 | 15 | R-32 quem pode o quê | 02, 04, 16 |

| Fluxo | Sprints | Fluxo | Sprints |
|---|---|---|---|
| F1 ver a pergunta e o pote | 08, 10, 11 | F7 a equipe abre uma pergunta | 02, 03, 05 |
| F2 apostar | 02, 11 | F8 patrocinador pede pergunta | 15 |
| F3 resolução e pagamento | 03, 04, 06, 12 | F9 parceiro gratuito | 10, 13 |
| F4 pote de um lado só | 04, 12 | F10 indicação | 14 |
| F5 pergunta anulada | 03, 04, 12 | F11 sugestão pelo X | 13, se L-17 confirmar |
| F6 janela e contestação | 04, 12, 14 | F12 pontuação na devnet | 08, 13 |

**Não sobrou regra nem fluxo sem sprint.** Três ressalvas:

- **R-25 e F6:** a contestação pelo apostador, com depósito, é fase 1.2 e fica fora.
- **R-29:** o programa só leva a taxa ao `fee_owner` (Sprint 04). A divisão em 25% e 75% não tem código em nenhum
  documento; entra como regra escrita da tesouraria na Sprint 18.
- **F11:** o resumo de produto não fixa a fase. Está na 13, condicionada à resposta de L-17.

## 8. O que fica fora do roteiro

| O quê | Onde está |
|---|---|
| **Fase 1.2:** contestação por qualquer apostador, com depósito, e arbitragem interna; leitor de Token-2022 e o tipo "tokens travados"; teto global revisto | Resumo de produto §6.3 |
| **Fase 2:** saída antecipada; esportes; teto por pergunta; aviso por Telegram; afiliados e taxa de construtor | Resumo de produto §6.4 |
| **Tokens A e B,** com staking, cofre e ponte | Plano de negócio, Parte 3 |
| **Sem fase fixada:** perguntas de menos de três dias ou de mais de 90; preço de token pequeno; fundo de prêmios | Resumo de produto §6.5 |
| **Dívida técnica:** migração para `@solana/kit`; fechar ou guardar a conta `Question` (T9) | Plano técnico §14.3 |
| **Sem tela no MVP:** painel da equipe (L-12); canal para avisar o usuário (L-16); moeda de teste própria (Q10, opção b); estatística de visitas | Plano técnico §3.6, §8 |
| **Rotina, não código:** publicar no X cada pergunta resolvida; subir o teto por degraus | P2 §6.2; P4 §4.4 |

## 9. Onde o roteiro se afasta dos blocos do plano técnico

- **B6 virou duas sprints** (06 e 07): o segundo serviço depende de uma contratação (Q8). O túnel e a base do
  servidor ficaram na 06.
- **B8 virou cinco sprints** (09 a 13), uma por parte do site.
- **B9 foi repartido.** Funções novas na 14 e na 15; compilação verificável e carteira 2 de 3 na 16, com o teto, a
  pausa e o plano de incidente. Assim o fundador pode cortar a 14 ou a 15 (P4 §3.3) sem levar a segurança junto.
- **Indicação e segunda leitura dividem a Sprint 14,** para o roteiro caber em 20. Têm critérios separados.
- **Auditoria e rede principal não têm bloco.** Vêm da seção 7 do plano técnico e de P4 §3.4.
- **Termos de uso, bloqueio por país e SODAX** (resumo de produto, §6.2) não têm bloco. Ficaram na 17, em paralelo
  à auditoria, porque não tocam o programa.
- **O parceiro gratuito (F9) está no MVP,** nas Sprints 10 e 13, como diz o resumo de produto (§6.1).

**Pontos que os documentos deixam abertos, e que as sprints apontam sem escolher:** como a Sprint 02 testa a criação
de pergunta antes de existirem leitores; como uma pergunta sai de `Contested` antes da Sprint 14; por onde o prêmio
entra no pote antes da Sprint 15; quem assina o repasse semanal da indicação.
