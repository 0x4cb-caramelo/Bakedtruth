# Onda 2 — Viabilidade do MVP

Data: 4 de outubro de 2026. Agente 2F, Onda 2 (red team), grupo 2.

Marcações: **FATO** (li no código, no repositório ou nos documentos do projeto), **FATO SECUNDÁRIO** (pesquisa de outro
agente), **INFERÊNCIA** (raciocínio meu, incluindo todas as estimativas de tamanho e de ordem). Método: só leitura; nada
foi compilado nem testado. Tamanho é relativo (pequeno, médio, grande), não é prazo nem horas.

## Resumo em dez linhas

1. O que foi pedido cabe em um MVP, desde que "MVP" seja lançado em degraus. Tudo junto, ligado no primeiro dia com
   dinheiro real e sem auditoria, não cabe com segurança (concordo com o agente 2C, item M1).
2. O que se aproveita do código atual é pouco em volume e muito em valor: os leitores on-chain (`resolver.rs`, 234
   linhas), o `resolve` (66), a ideia de cofre PDA e o método de teste aleatório de invariantes. O resto da parte
   econômica (oito instruções, sete campos do `Market`) sai.
3. O programa de pote é um programa novo, ao lado do atual. É o item mais longo da corrente e tudo depende dele.
4. Proponho cinco fases: (1) pote na devnet; (2) produto jogável; (3) patrocínio; (4) saída antecipada, desligada por
   padrão; (5) mainnet fechada com tetos. A fase 1 é a menor coisa que prova a ideia com dinheiro de teste.
5. A saída antecipada entra no MVP como código escrito e testado, mas só é ligada, pergunta a pergunta, depois de
   simulação e revisão externa. Mostro abaixo como isso respeita a decisão do Lucas.
6. O maior risco de execução é a dependência de uma pessoa (o Ronaldo) e de uma revisão externa que ainda não existe,
   somada ao tamanho do programa novo. O segundo é decidir regras de dinheiro que ninguém fechou (tabela do pote de um
   lado só, "70/30", destino da penalidade).
7. Cloak e SODAX entram como orientação ao usuário, não como integração no site, no MVP. Não mudo a decisão: ofereço
   a ordem e a razão.
8. Tipos de pergunta na mainnet do MVP: preço de ativos grandes (Pyth), foto de pool de staking e, com teto de pote,
   liquidez travada e queima em token clássico. Os tipos de "chave" e Token-2022 ficam para depois.
9. Há pelo menos 20 lacunas de produto sem dono. As três mais urgentes: o painel da equipe, o que o usuário vê quando
   a chance muda e a pergunta anulada.
10. Nada disto muda uma decisão do Lucas; onde discordo, está marcado como DISCORDO, com alternativa.

## 1. Inventário: o que existe, o que muda, o que é novo

Tamanhos: P pequeno, M médio, G grande. Risco: B baixo, M médio, A alto.

### 1.1 Programa (`programs/pred-provable`, 1.717 linhas de Rust no total)

| Componente | Hoje | Destino | Tamanho do trabalho | Risco |
|---|---|---|---|---|
| `resolver.rs` (nove leitores, `validate_new_market`, `ratchet_met`, `require_trading_open`) | 234 linhas, testado com fixtures reais | **Aproveita.** Troca de prazo em blocos (`cutoff_slot`, `deadline_slot`) por data e hora; `require_trading_open` passa a guardar a aposta | P a M | M (mexe no coração testado) |
| `instructions/resolve.rs` | 66 linhas; aberto a qualquer um, só no topo, definitivo | **Aproveita**; acrescenta terceiro resultado (Anulada), foto dos totais para o resgate e recompensa a quem chamar | M | A (resultado errado é definitivo) |
| `outcome.rs` (transferências assinadas pelo PDA, `transfer_checked`) | 129 linhas | **Aproveita em parte** (cofre e payout); a parte de mint SPL sai | P | B |
| Cofre PDA `["vault", market]` | existe | **Aproveita** | P | B |
| `events.rs` | um evento por instrução | **Muda**: eventos novos; o app monta histórico deles | P | B |
| `state.rs` (`Market`, 88 linhas) | orçamento, `sponsor_no`, mints, reservas do pool | **Reescreve**: `pot_yes`, `pot_no`, prêmio neutro, penalidades por lado, taxa, fechamento, estado explícito | M | A |
| `create_market` | qualquer um cria, com orçamento | **Muda**: só papel da equipe, dois passos, teto de pote, parâmetros em hash | M | M |
| `buy_yes`, `mint_pair`, `burn_pair`, `add_liquidity`, `remove_liquidity`, `swap`, `withdraw_budget`, `redeem` | 8 instruções | **Saem** | — | — |
| Novo: `Config` (papéis, taxa, destino das taxas, pausa) | não existe (FATO: sem chave de administrador hoje) | **Novo** | M | A |
| Novo: `place_bet` + conta `Position` por apostador | — | **Novo** | G | A |
| Novo: `claim` e devolução (pote de um lado só, Anulada) | — | **Novo** | M | A |
| Novo: taxa contabilizada e envio ao destino único | — | **Novo** | P | M |
| Novo: pedido de pergunta com depósito travado (molde: `escrow` da Solana Foundation) | — | **Novo** | G | A |
| Novo: prêmio neutro e aposta de patrocinador (travada) | — | **Novo** | M | A |
| Novo: `exit_position` (saída com penalidade) | — | **Novo** | G | A (a mais perigosa, 2C S1 a S8) |
| Novo: pausa em três níveis; função de invariante no fim de toda instrução | — | **Novo** | P | M |
| Novo: leitor Pyth (preço) | não existe | **Novo** | M | A (2C R7) |
| Novo: leitores Token-2022 | não existe | **Depois do MVP** | M | A |
| Leitor da formatura do pump.fun | "on hold" no `RESOLVERS.md` | **Depois do MVP** | G | A |

### 1.2 Biblioteca do cliente (`app/lib`, 1.329 linhas)

| Arquivo | Destino | Tamanho | Risco |
|---|---|---|---|
| `market.ts` (PDAs, cotações do AMM, `decodeEvents`) | Cotações do AMM saem; PDAs e `decodeEvents` ficam; entram cotações de pote (chance, retorno estimado depois da taxa, retorno mínimo aceito) | M | M (tem de bater com o programa; os testes usam o mesmo código) |
| `metric.ts` (leitores no cliente) | Aproveita; ganha o leitor de preço | P a M | B |
| `instructions.ts` | Reescreve para as instruções novas | M | M |
| `view.ts`, `format.ts`, `history.ts`, `hooks.ts` | Aproveita em parte; `history.ts` precisa de servidor (2C F1) | M | M |
| `config.ts`, `program.ts`, `idl/` | Regenera o IDL do programa novo | P | B |
| `brand.ts`, `mascot/` | Aproveita | — | B |
| `tokens.ts` | Provavelmente sai ou encolhe (não há token SPL de SIM e NÃO) | P | B |

### 1.3 Aplicativo (`app/components`)

Estado: o app segue com a direção C ("Tape"); o Lucas escolheu a D ("Ledger²") com a N como tema claro; o
`DESIGN-DIRECTION.md` diz em seu topo que ainda não foi reescrito (FATO).

| Componente | Destino | Tamanho | Risco |
|---|---|---|---|
| `providers.tsx`, `wallet-button.tsx`, `toast.tsx` | Aproveita | P | B |
| `mascot.tsx`, `ticker.tsx` | Aproveita | P | B |
| `cell-field.tsx`, `tape-context.tsx` | São da direção C; provavelmente saem | P | B |
| `site-header.tsx`, `primitives.tsx` | Reescreve para Ledger² e dois temas | M | M |
| `home/*` (featured, browse, tile, hero-meter, sidebar) | Reescreve (a home do Ledger² é outra) | G | M |
| `market/*` (trade-card, position-card, chart-card, proof-card, details, market-view) | `trade-card` (AMM) e `position-card` (tokens) saem; entram aposta, resgate, devolução; `proof-card` aproveita; `chart-card` precisa de histórico novo | G | M |
| Novo: painel da equipe, tela de patrocínio, página de sugestões do X, página "trazer dinheiro de outra rede", termos e avisos | — | G | M |
| Novo: rota de repasse de RPC no servidor | — | M | M |

### 1.4 Testes

| Componente | Destino | Tamanho | Risco |
|---|---|---|---|
| `tests/pred-provable.test.ts` (1.798 linhas), `tests/helpers.ts` (343) | Boa parte dos testes é de AMM e tokens e deixa de valer (o briefing já diz isso). O que fica: testes de leitores, fixtures reais (`tests/fixtures/*.bin`), `resolve`, helpers de LiteSVM | G | M |
| Teste aleatório de invariantes | **Reaproveita o método**; invariante nova (2C S7) com `exit_position` no sorteio | M | A (é a rede de proteção) |
| `programs/pred-provable/tests/burn_goal.rs` (anchor-litesvm) | Mantém só o que cobre `resolve` e queima | P | B |
| Novo: teste de dois usuários (A tenta mexer na posição de B), de arredondamento, de cada linha da tabela do pote de um lado só, de estratégias (simulação da saída) | — | G | A |

### 1.5 Protótipo e documentos

`prototype-lab/prototype-d` e `prototype-n` existem como HTML (FATO). Falta o `DESIGN-DIRECTION.md` novo (tokens dos
dois temas, telas, fluxo). Trabalho de design: M.

## 2. Dependências: o que precisa existir antes do quê

```
[Decisões de regra] -> [Especificação do pote] -> [Programa: núcleo] -> [Programa: resolve/claim/devolução]
                                                        |                         |
                                                        +-> [IDL + cliente] -> [App]     [Serviço agendado] -> [Alarme/plantão]
                                  [Leitor Pyth] -------+
                          [Pedido de pergunta (escrow)] -> [Patrocínio: prêmio neutro e aposta] -> [UI de patrocínio]
                          [Pote estável + invariantes] -> [Saída] -> [Simulação] -> [Revisão externa]
[Multisig + compilação verificável + pausa + auditoria] --------------------------------------> [Mainnet]
```

Dependências que merecem frase própria:

1. **Decisões de regra antes do programa.** Hoje há quatro lacunas que viram erro de código se não forem fechadas:
   a tabela do pote de um lado só (2C E8), o "70/30" (quem fica com qual parte), o destino da penalidade (2C S1) e o
   resultado Anulada (2C R6). Sem elas o programa tem de adivinhar. Custo de fechar: uma conversa com o Lucas, tendo
   a tabela pronta (seção 8.2).
2. **Programa antes do app.** O app só ganha sentido com o IDL do programa novo. Mas o design (Ledger²), os textos e o
   painel da equipe podem avançar em paralelo, contra um programa de mentira (mocks).
3. **Leitor de preço antes das perguntas de preço.** O Pyth é o que o público mais aposta (FATO SECUNDÁRIO, briefing
   seção 9) e o tipo mais seguro contra manipulação (2C R7: ninguém controla o resultado). Pede também: preço fresco
   em toda aposta de pergunta de preço, idade máxima, margem de erro, só ativos grandes.
4. **Leitores de Token-2022 antes das perguntas de queima em tokens do pump.fun.** Os quatro leitores de token hoje
   aceitam só o programa clássico (FATO, briefing seção 9) e os tokens novos do pump.fun são Token-2022 (FATO
   SECUNDÁRIO). Antes de aceitar Token-2022 falta lista positiva de extensões, medição de custo de computação (2C TK1
   e C6) e revisão. Fica fora do MVP e **não bloqueia nenhuma fase**.
5. **Formatura no pump.fun** depende do leitor Token-2022 e de resolver o conflito do empréstimo relâmpago (o sócio
   deixou "on hold"). Fora do MVP.
6. **Pote antes do patrocínio.** Prêmio neutro e aposta de patrocinador só existem como parcelas do pote.
7. **Saída depois do pote estável.** A saída depende de `Position` com histórico (soma aposta × chance), de estados
   explícitos e da função de invariante. Escrevê-la antes de o pote estar testado é o risco máximo.
8. **Serviço agendado depois de `resolve` e antes do dinheiro real.** Sem ele, a regra "meta cumprida e não provada
   vira NÃO" derruba usuários (2C R2).
9. **Multisig, compilação verificável e pausa antes da mainnet**, não antes da devnet. Na devnet pode ser carteira em
   arquivo; na mainnet não (2C K1).
10. **Servidor de RPC e histórico antes da home pública.** Sem ele a home estoura o limite no lançamento (2C F1).
11. **Cloak e SODAX dependem de mainnet.** Não existe rede de testes de nenhum dos dois (FATO SECUNDÁRIO, 2C P1 e P3).
    O único teste real é na mainnet, com valor pequeno. Isso os empurra para a última fase.

## 3. Fatias de entrega

### Fase 1 — Pote na devnet (a menor coisa que prova a ideia)

- **Objetivo:** provar que o ciclo "apostar, resolver pela leitura on-chain, resgatar" funciona com USDC de teste e que
  o programa novo fecha a conta (invariante).
- **O usuário consegue:** (por linha de comando ou página mínima) a equipe abre uma pergunta; qualquer carteira aposta
  em SIM ou NÃO; qualquer carteira resolve; o vencedor resgata; o pote de um lado só devolve com taxa; a pergunta
  anulada devolve.
- **Pronto quando:** os testes de LiteSVM passam, incluindo o teste aleatório de invariantes com milhares de sequências;
  um roteiro de devnet (como o `smoke:devnet` de hoje) executa o ciclo completo com USDC de teste (Circle devnet); a
  tabela do pote de um lado só tem um ramo de código e um teste por linha.
- **Fica de fora:** patrocínio, saída, painel, app novo, Pyth (usa um dos leitores atuais já testados, por exemplo
  foto de pool de staking), cron, Cloak, SODAX, X.
- **Desejos do fundador atendidos:** pool de USDC por pergunta; SIM e NÃO; a equipe abre as perguntas; devolução com
  taxa no pote de um lado só; taxa de 3% contabilizada; resolução por leitura on-chain; fechamento padrão (80% da
  duração, mínimo 24 horas).
- **Nota sobre o fechamento:** DISCORDO em parte de aceitar "mais de dois ou três meses" no MVP; proponho duração
  máxima de 30 dias nesta fase (2C E4 recomenda o mesmo), com o 80% e o mínimo de 24 horas. O fechamento gradual
  ("pode ser gradual") fica para depois. Alternativa: se o Lucas quiser perguntas longas, a duração máxima fica em
  `Config` e muda sem mexer no programa.

### Fase 2 — Produto jogável na devnet

- **Objetivo:** alguém de fora do time entra no site, vê perguntas, aposta com USDC de teste e acompanha o resultado,
  com a cara Ledger² e o mascote; a equipe opera sem terminal.
- **O usuário consegue:** ver a home, abrir uma pergunta, ver chance e retorno estimado depois da taxa, apostar com
  limite mínimo aceito, ver sua posição, resgatar ou receber devolução; ver "resolvível" e apertar o botão público;
  trocar entre tema escuro e claro. A equipe: propor e aprovar pergunta em duas chaves, pausar. Qualquer pessoa: ler a
  página de sugestões do X (lista curada, instruções, linha do tempo embutida).
- **Pronto quando:** app publicado em endereço de teste; serviço agendado nosso e segundo agendador resolvendo as
  perguntas de teste; leitor Pyth com SOL e BTC testado; página de aposta sem script de terceiro; repasse de RPC no
  servidor; alarme de "resolvível e não resolvida há 15 minutos"; teste com pessoas de fora.
- **Fica de fora:** patrocínio, saída, Token-2022, mainnet.
- **Desejos atendidos:** layout Ledger² com tema claro e escuro e o mascote; resolução acionada por serviço agendado;
  perguntas de preço; página de sugestões com o X (lista curada; ler menções por API é opcional e custa 0,005 dólar
  por publicação, FATO SECUNDÁRIO, briefing seção 10); fechamento com opção avançada (dupla confirmação feita por duas
  assinaturas de multisig, 2C K7).

### Fase 3 — Patrocínio

- **Objetivo:** provar a segunda trilha de dinheiro.
- **O usuário consegue:** o patrocinador entra numa pergunta aberta pela equipe ou pede uma, trava o depósito (500,
  1.500 ou 5.000), escolhe prêmio neutro ou aposta de patrocinador; a equipe aceita (o aceite abre a pergunta e aplica
  o dinheiro na mesma transação) ou recusa (o patrocinador saca); o patrocinador cancela sozinho depois de 14 dias; a
  pergunta mostra selo "Patrocinado por X" ou "Pagador não divulgado" e destaque na home.
- **Pronto quando:** testes de dois usuários no escrow; teste da tabela de patrocínio (patrocinador com outra carteira
  no lado vencedor, 2C E5); aposta de patrocinador nasce travada (sem saída, 2C E6); depósito do patrocinador nunca é
  empurrado pela equipe (2C C3); divisão "70/30" fixada em código depois da decisão do Lucas.
- **Fica de fora:** Cloak integrado no site; contrapartidas com valor em dinheiro (só selo, destaque, texto e
  publicação no X); pote mínimo garantido (precisa de regra própria).
- **Desejos atendidos:** patrocínio em três faixas; prêmio neutro ou aposta num lado; pedir pergunta com depósito
  travado; entrar em pergunta já aberta; anônimo (como "pagador não divulgado", via carteira nova);
  contrapartidas.
- **DISCORDO** (junto com o 2C, E5) de liberar o anônimo com aposta de lado em pergunta que o patrocinador possa
  controlar. Como a decisão do Lucas é "o anônimo escolhe qualquer das duas formas", a alternativa que preserva a
  decisão é: o anônimo escolhe qualquer das duas formas **em perguntas que ninguém controla** (preço de ativo grande,
  foto de pool), que são justamente as do cardápio do MVP. Nas demais, só prêmio neutro. No cardápio do MVP o
  conflito praticamente não aparece.

### Fase 4 — Saída antecipada (escrita, testada, desligada por padrão)

- **Objetivo:** entregar a decisão do Lucas ("saída antes da resolução, vamos fazer agora no mvp") com o risco
  contido.
- **O usuário consegue:** em perguntas com `exit_enabled`, ver "Sair" com o valor mínimo aceito e o custo máximo (até
  90%) antes de apostar; sair com penalidade.
- **Pronto quando:** penalidade marcada por lado (2C S1, precisa do aval do Lucas); trava `require_trading_open` na
  saída; saída fecha com as apostas; piso de 10%; espera mínima em horas; posição de patrocinador sem saída; simulação
  com apostadores estratégicos feita em código (a 1H pediu, a 2C não pôde fazer); invariante com `exit_position` no
  sorteio; revisão externa **só desta instrução** contratada.
- **Fica de fora:** passar a posição a outra pessoa (precedente de mercado, fase futura); ligar a saída em qualquer
  pergunta por padrão.
- **Desejos atendidos:** saída antecipada no MVP.

### Fase 5 — Mainnet fechada com tetos

- **Objetivo:** dinheiro real, valor pequeno, com tudo que protege o usuário.
- **O usuário consegue:** apostar USDC real em um cardápio curto de perguntas da equipe, com teto de pote por pergunta
  e teto total do programa; patrocinar; chegar de outra rede pelo SODAX numa página separada; usar o Cloak por conta
  própria e chegar com carteira nova.
- **Pronto quando:** upgrade authority num multisig 2 de 3 com três pessoas definidas e espera pública; compilação
  verificável publicada; revisão externa do programa inteiro concluída e correções aplicadas; pausa testada; plano de
  incidente em uma página; plantão do serviço agendado; termos e avisos publicados; bloqueios geográficos
  implementados como interruptor (o Lucas decidiu deixá-los para o fim, e este é o fim); saída ligada **só** nas
  perguntas de pote pequeno e só depois da revisão; teste real do SODAX e do Cloak com valor pequeno.
- **Fica de fora:** Token-2022, pump.fun, tokens (os dois), compra e queima, fundo de prêmios automático, rendimento,
  fechamento gradual, perguntas de preço de token pequeno.
- **Desejos atendidos:** taxa de 3% dividida em quatro destinos (por multisig, fora do programa, 2C K5); SODAX;
  Cloak (orientação, mais teste real); saída ligada por pergunta.

### Mapa dos desejos do fundador

| Desejo | Fase | Observação |
|---|---|---|
| Pool de USDC por pergunta; apostar SIM e NÃO | 1 | |
| A equipe abre as perguntas | 1 (script), 2 (painel) | |
| Resolução por leitura on-chain | 1 | |
| Serviço agendado aciona a resolução | 2 | Antes disso, o botão público |
| Pote de um lado só devolve com taxa | 1 | Tabela inteira antes de programar |
| Fechamento em 80%, mínimo 24 horas | 1 | Duração máxima de 30 dias no MVP |
| Opção avançada com dupla confirmação | 2 | Por multisig, não por duas chaves na mesma pessoa |
| Taxa de 3%, quatro destinos | 1 (conta), 5 (divisão) | A divisão é feita pelo multisig, fora do programa |
| Página de sugestões com o X | 2 | Lista curada primeiro |
| Layout Ledger², tema claro e escuro, mascote | 2 | O `DESIGN-DIRECTION.md` precisa ser reescrito antes |
| Patrocinador em três faixas, neutro ou lado | 3 | |
| Patrocinador anônimo | 3 (como carteira nova) | Selo "pagador não divulgado" |
| Pedir pergunta com depósito travado | 3 | |
| Saída antecipada com penalidade | 4 (código), 5 (ligada por pergunta) | Ver 3.1 |
| Entrada de outras redes (SODAX) | 5 | Página separada |
| Privacidade pelo Cloak | 5 | Orientação mais teste real |

### 3.1 A saída antecipada: por que adiar a ativação, e como incluí-la desligada

DISCORDO de ligar a saída em todas as perguntas desde o primeiro dia. Motivos, todos da revisão do 2C: é a única
instrução que tira dinheiro do cofre antes da resolução (M1); não tem precedente de mercado (1H); a revisão no papel já
achou um furo crítico (S1: o dono do lado vencedor recebe a própria penalidade de volta, lucro de 304,50 em vez de
60,30) e cinco médios; e o que fica retido para quem permanece é bem menor que o prometido (S2: cerca de 34%, não 55% a
63%).

Alternativa que preserva a decisão do Lucas: **a saída entra no MVP como código, mas nasce com `exit_enabled = false`
em cada pergunta**. A equipe liga pergunta a pergunta, começando por potes pequenos, depois da simulação e da revisão.
Para o usuário aparece como "Saída disponível" quando ligada. Efeito: o Lucas tem a funcionalidade no MVP; o risco só é
assumido depois de verificado; se a revisão achar problema grave, desliga-se sem atualizar o programa.

Duas decisões do Lucas que isto exige: (a) penalidade marcada por lado, indo ao fundo de prêmios quando o lado de quem
saiu ganha (2C S1); (b) aceitar que "sai com ganho proporcional menor" não existe num pote puro: só existe "perda
proporcional maior" (1H seção 1.2). A frase dele, "ganho menor ou perda maior", fica metade de pé.

## 4. Ordem de construção em sprints

Doze sprints, sem datas. "Depende de" aponta o que precisa estar pronto.

| Sprint | Entrega | Depende de | Fase |
|---|---|---|---|
| 1 | Decisões de regra fechadas (tabela do pote de um lado só, "70/30", destino da penalidade, Anulada, duração máxima); especificação do pote em uma página; esqueleto do programa novo ao lado do atual; função de invariante escrita; decisão de quem é a terceira chave do multisig e quem tem a upgrade authority; acordo de licença do código com o Ronaldo | Lucas, Ronaldo | 1 |
| 2 | Núcleo: `Config`, `Market` novo, `Position`, abrir pergunta (só equipe, dois passos), `place_bet` com retorno mínimo aceito, tempo em data e hora, estados explícitos; testes de LiteSVM; `require_trading_open` adaptado | Sprint 1 | 1 |
| 3 | `resolve` adaptado (foto dos totais, recompensa a quem chama), `claim`, devolução, Anulada, taxa contabilizada e envio ao destino; teste aleatório de invariantes; roteiro de devnet com USDC de teste (**fim da fase 1**) | Sprint 2 | 1 |
| 4 | Leitor Pyth (SOL e BTC) com preço fresco na aposta; cardápio fechado; serviço agendado v1 e segundo agendador; alarme; repasse de RPC e histórico guardados em servidor | Sprint 3 | 2 |
| 5 | `DESIGN-DIRECTION.md` reescrito; app base em Ledger², dois temas: home, página da pergunta, aposta, posição, resgate, devolução; biblioteca do cliente nova; estados vazios e erros | Sprint 3 (IDL); o design pode começar durante o sprint 3 | 2 |
| 6 | Painel da equipe (propor, aprovar em duas chaves, pausar), opção avançada de fechamento, página de sugestões do X, termos e avisos, teste com pessoas de fora (**fim da fase 2**) | Sprints 4 e 5 | 2 |
| 7 | Programa: pedido de pergunta com depósito travado, aceite que abre e aplica na mesma transação, recusa, cancelamento depois de 14 dias, prêmio neutro, aposta de patrocinador travada, selo | Sprint 3 | 3 |
| 8 | App de patrocínio: faixas 500, 1.500 e 5.000, acompanhamento, selo, destaque, contrapartidas básicas; instruções para chegar com carteira nova (**fim da fase 3**) | Sprints 6 e 7 | 3 |
| 9 | Programa: `exit_position` com penalidade por lado, valor mínimo aceito, espera em horas, `exit_enabled` desligado; simulação com apostadores estratégicos | Sprint 7 (estável) | 4 |
| 10 | App da saída; invariantes com saída; revisão externa da instrução; correções (**fim da fase 4**) | Sprint 9 | 4 |
| 11 | Endurecimento: multisig 2 de 3, compilação verificável, pausa testada, plano de incidente, plantão, segundo fator em domínio, hospedagem e GitHub, bloqueio geográfico como interruptor, varredura de segredos; envio do programa à auditoria | Sprints 8 e 10 | 5 |
| 12 | Correções da auditoria; implantação na mainnet com tetos; página "trazer dinheiro de outra rede"; teste real do SODAX e do Cloak com valor pequeno; ligar a saída em pergunta de pote pequeno só se a revisão liberar (**fim da fase 5**) | Sprint 11 | 5 |

Paralelismo possível: design (sprint 5) pode correr desde o sprint 3; página de sugestões do X e termos podem ser
escritos por outra pessoa a qualquer momento. A revisão externa precisa ser **contratada** (orçamento e agenda) por
volta do sprint 7, porque a espera por um auditor não depende de nós (INFERÊNCIA; custo e prazo de auditoria: não
encontrado, nada foi pesquisado).

## 5. Pessoas e papéis

### 5.1 O que depende hoje do Ronaldo (o sócio que escreveu o programa)

| Dependência | Detalhe | Efeito se ele não estiver disponível |
|---|---|---|
| Conhecimento dos leitores e de `RESOLVERS.md` | Por que cada leitor é seguro contra empréstimo relâmpago; o que não foi verificável fora de rede real | Aproveita-se o código como está e não se escrevem leitores novos de risco. O de Pyth fica mais lento e sem segunda opinião |
| Chave de atualização atual | **Quem a tem hoje: não encontrado** (2C K1) | Na mainnet o programa novo é implantado por nós, com multisig nosso. O programa antigo fica na devnet |
| Repositório (é dele: `0xcf07/pred-provable`) | Licença e termos de uso do código: **não encontrado**; o repositório local é derivado do dele | Se a divisão societária ou a licença não permitir o reaproveitamento, perde-se `resolver.rs`, `resolve.rs` e fixtures. Precisa de acordo escrito antes do sprint 2 |
| Revisão do programa novo | Ele conhece o desenho e os pontos sutis (ex.: a trava de CPI no `resolve`) | Substituído pela revisão externa; sem ele, ela é obrigatória e não opcional |
| Token-2022 e formatura do pump.fun | Mapeou o formato | Fora do MVP, não bloqueia |
| `ECONOMICS.md`, `PRIVACY_PLAN.md`, `NAMING.md` | Estão só em `upstream/main`, não mesclados | Já lidos pelos agentes; baixo risco |
| Terceira chave do multisig | Sem dono | Decisão de fundador; sem terceira pessoa não há 2 de 3 |

O Lucas respondeu que a divisão com o Ronaldo é "por enquanto irrelevante, eu te aviso o que fazer". Registro apenas
que o item de licença e de chave de atualização não pode esperar além do sprint 2.

### 5.2 Papéis necessários (INFERÊNCIA)

| Papel | Quem hoje | Observação |
|---|---|---|
| Dono do produto e das decisões de regra | Lucas | O sprint 1 é dele |
| Programa Solana (Rust, Anchor, LiteSVM) | Ronaldo e assistente de código | Gargalo: poucas pessoas e uma máquina com pouca memória (o ambiente atual não compila) |
| App (Next.js, wallet-adapter) | Assistente de código | Aproveita o app existente |
| Design Ledger² | Lucas e protótipos D e N | Reescrever `DESIGN-DIRECTION.md` |
| Operação do serviço agendado e plantão | Sem dono | Alguém precisa atender o alarme |
| Revisão externa e auditoria | Sem contratada | Orçar até o sprint 7 |
| Jurídico | Sem dono | Fora do meu escopo; depende do relatório 2D |
| Moderação das perguntas e do X | Equipe, sem dono | Define o sprint 6 |

Ponto de atenção: o ambiente em que este trabalho roda hoje não compila nem roda testes (regra do ambiente). Um
programa novo com teste aleatório de invariantes pede uma máquina capaz de compilar, ou a CI como lugar de compilar.
Está na seção 7.

## 6. Verificação

| Fatia | Como se testa | Obrigatório antes de dinheiro real |
|---|---|---|
| Fase 1 | LiteSVM em TypeScript (como hoje) mais Rust (anchor-litesvm) para o núcleo; **teste aleatório de invariantes** (cofre contabilizado ≥ saldo devido, soma dos resgates mais taxa ≤ cofre, arredondamento para baixo no que paga); um teste por linha da tabela do pote de um lado só; teste de dois usuários; roteiro de devnet com USDC de teste | Sim: nenhum dinheiro real sem esta fase verde |
| Fase 2 | Leitor Pyth com fixtures e casos de preço velho, margem grande e conta falsa; serviço agendado (cai, o outro assume; "resolvível e não resolvida" dispara alarme); aplicação com carteira de teste; verificação de que a página de aposta não carrega script de terceiro | Serviço agendado e alarme: sim |
| Fase 3 | Escrow (aceita, recusa, cancela depois de 14 dias, resumo dos parâmetros conferido, depósito nunca empurrado); patrocinador que apostou com outra carteira; aposta travada | Sim |
| Fase 4 | Simulação em código com apostadores estratégicos (golpe da chance, entradas em tempos diferentes, baleia contra o honesto); propriedade "fatiar a entrada ou a saída nunca melhora a devolução"; invariantes com saída; revisão externa da instrução | **Sim, para ligar a saída.** Pode lançar sem ligar |
| Fase 5 | Auditoria externa do programa inteiro; compilação verificável; teste de pausa; simulação de incidente; teste real do SODAX e do Cloak com valor pequeno (não há rede de testes); varredura de segredos; teste de autorização com duas contas | Sim, todos |

O que o LiteSVM não cobre (FATO, `CLAUDE.md`): `StakeAtLeast` (o epoch stake devolve zero); tudo que depende de Cloak e
SODAX; comportamento do Pyth ao vivo. Isso se testa na devnet ou na mainnet com valor pequeno. Disponibilidade do Pyth
na devnet: não verificada.

**Obrigatório antes de dinheiro real, em resumo:** invariantes verdes; auditoria externa do programa; multisig na
upgrade authority; compilação verificável; pausa; serviço agendado duplo com alarme; teto de pote por pergunta e teto
total; página de termos; saída desligada por padrão; plano de incidente.

## 7. Riscos de execução

| # | Risco | Severidade | Mitigação |
|---|---|---|---|
| 1 | Programa novo grande, escrito por poucas pessoas e sem auditoria, lançado com dinheiro real | Crítica | Lançar em degraus (fases 1 a 5); tetos; auditoria como bloqueio da fase 5; pausa |
| 2 | Dependência do Ronaldo para conhecimento, licença e chave de atualização | Alta | Resolver licença e acordo antes do sprint 2; documentar o que ele sabe em `RESOLVERS.md` e nos testes; a revisão externa substitui |
| 3 | Regras de dinheiro sem decisão (pote de um lado só, "70/30", destino da penalidade, Anulada) | Alta | O sprint 1 só fecha isto; tabela pronta (seção 8.2) |
| 4 | Saída antecipada com furo de fórmula e sem precedente | Alta | Desligada por padrão; simulação em código; revisão externa; penalidade por lado |
| 5 | Auditor sem agenda no tempo certo (prazo e preço desconhecidos) | Alta | Contratar por volta do sprint 7; mainnet só depois |
| 6 | Capacidade de máquina e de pessoas (ambiente sem compilação, poucas pessoas de Rust) | Alta | Máquina de build dedicada ou CI como lugar de compilar; priorizar a fase 1 |
| 7 | Serviço agendado como ponto único de falha; meta cumprida e não provada vira NÃO | Alta | Dois agendadores, botão público, recompensa on-chain a quem resolve, alarme, plantão (2C R1, R2) |
| 8 | A mudança de prazo de blocos para data e hora mexe no código testado dos leitores | Média | Mudar só o campo de tempo; reaproveitar as fixtures; rodar a bateria completa dos leitores |
| 9 | Tipos de pergunta decididos por quem tem chave aparecem no cardápio porque "estão prontos" | Alta | Cardápio do MVP fechado em preço, foto de pool e liquidez travada com teto (2C E1) |
| 10 | App reescrito quase todo (G) e o `DESIGN-DIRECTION.md` ainda é o da direção C | Média | Reescrever o documento antes do sprint 5; manter mascote e carteira |
| 11 | RPC público e histórico no navegador estouram na home pública | Média | Servidor de repasse e histórico no sprint 4 |
| 12 | Cloak e SODAX só existem na mainnet; integração testada com dinheiro real | Média | Orientação no MVP; teste real com valor pequeno; página separada; sem pacote do Cloak no site |
| 13 | Terceira chave do multisig sem pessoa | Alta | Decidir no sprint 1; sem ela a mainnet não abre |
| 14 | Conformidade sem KYC, com dinheiro real e patrocinador não divulgado | Alta | Relatório 2D; bloqueios como interruptor na fase 5; advogado antes da mainnet |
| 15 | Escopo cresce com os tokens (pump.fun e ICO privado) durante o MVP | Média | Tokens fora do MVP; nenhuma instrução do programa depende deles |

**O maior risco de execução** é a soma dos itens 1, 2 e 6: um programa novo, sem auditoria, em mãos de poucas pessoas e
com um gargalo de conhecimento. Ele é reduzido, não eliminado, pelas fases em degraus.

## 8. Lacunas de produto que ninguém definiu

### 8.1 Lista

Urgência: **U** (bloqueia os sprints 1 a 3), **S** (antes do sprint 5 ou 6), **D** (antes da fase 5).

| # | Lacuna | O que está indefinido | Urgência |
|---|---|---|---|
| 1 | **Como a equipe abre uma pergunta** | Fluxo, quem propõe e quem aprova (duas chaves), campos, texto gerado a partir dos parâmetros, teto de pote, duração. Proposta: painel administrativo, com a pergunta como formulário por tipo e a frase gerada do tipo (2C R8) | U |
| 2 | **O que o usuário vê quando a chance muda** | A chance é a fatia do pote; o retorno só fica definido no fechamento; entre ver e assinar o número mexe (2C F2). Proposta: rótulo "estimativa"; retorno depois da taxa; limite aceito na própria transação; simulação antes de assinar; atualização ao vivo; aviso de que "chance" não é preço | U |
| 3 | **Pergunta anulada** | Quando anula (conta ilegível depois do prazo, preço removido), o que acontece com as apostas (devolvem com taxa, pela regra da banca?), prêmio neutro e penalidades; texto na tela | U |
| 4 | Tabela do pote de um lado só | Para onde vão prêmio neutro e penalidades em cada linha (2C E8) | U |
| 5 | "70/30" do patrocínio | Quem fica com 70%: banca ou pote? Dois cenários: 500 vira 350 e 150; 1.500 vira 1.050 e 450; 5.000 vira 3.500 e 1.500 | U |
| 6 | Taxa da saída | Cobra 3% também de quem sai? Entra na contabilidade (2C S7) | U |
| 7 | Tipos de pergunta do primeiro dia | O Lucas pediu ajuda; proposta na seção 9 | U |
| 8 | Aposta mínima e máxima, teto de pote, teto total | O código atual tem mínimo de 1 USDC; tetos por pergunta e total são novos. Quem decide os valores | U |
| 9 | Duração máxima e perguntas longas | Acima de 2 a 3 meses, 80% é longo e "pode ser gradual"; MVP: máximo de 30 dias | U |
| 10 | Como o patrocinador paga e acompanha | Tela de pedido; estado do depósito (travado, aceito, recusado, cancelável); recibo; aviso de que mandar ao endereço do cofre perde o dinheiro; como vê o selo e o destaque; como saca na recusa | S |
| 11 | Estados vazios | Home sem perguntas; pergunta sem apostas; pergunta com um lado só; carteira sem USDC ou sem SOL; resgate sem nada a receber | S |
| 12 | Erros | Transação recusada, preço velho, retorno abaixo do mínimo aceito, pergunta pausada, conta medida ilegível, falha de rede | S |
| 13 | Depois de resolvida | Prazo de resgate (2C C4 sugere não ter), botão "fechar posições encerradas" para recuperar o aluguel, histórico | S |
| 14 | Aluguel e SOL | Cada posição exige depósito de aluguel (cerca de 0,0017 SOL, conta do 2C); quem chega só com USDC não tem SOL; o que a tela diz | S |
| 15 | Contrapartidas do patrocinador | Selo, destaque de 12 a 24 horas, posição fixa, texto, publicação no X: duração, preço, quem aprova o texto | S |
| 16 | Pergunta sugerida pelo X | Fluxo da sugestão à pergunta, quem tria, se há recompensa a quem sugere, privacidade dos nomes (regra de privacidade) | S |
| 17 | Moderação do texto do patrocinador | Texto puro, sem links ativos, revisado | S |
| 18 | Quem cria ganha parte da taxa? | O Lucas disse "acho justo"; não ficou definido; no MVP só a equipe cria | D |
| 19 | Fundo de prêmios | O que é e para que serve (o Lucas perguntou); recebe também penalidades (2C S1) | D |
| 20 | Resolução errada por falha nossa | Indeniza? Com que dinheiro? Quem decide (2C R2) | D |
| 21 | Pausa | Quando pausar, quem comunica, o que o usuário vê (2C K6, F6) | D |
| 22 | Termos, avisos de risco, bloqueios geográficos | Sem KYC: texto, interruptor, quem decide | D |
| 23 | Carteiras da equipe apostando | Regra pública de que a equipe não aposta; carteiras da equipe publicadas (2C E10) | D |
| 24 | Moeda | Só USDC clássico, endereço fixo; aceitar SOL ou outros fica fora do MVP | — |

### 8.2 Tabela do pote de um lado só que o Lucas precisa decidir (proposta do 2C E8)

| Caso | Proposta |
|---|---|
| Só o lado vencedor tem apostas | Devolve menos taxa; prêmio neutro e penalidades vão a esses vencedores |
| Só o lado perdedor tem apostas | Devolve menos taxa; prêmio neutro volta ao patrocinador; penalidades vão ao fundo de prêmios |
| Ninguém apostou, há prêmio neutro | Volta ao patrocinador |
| O lado vencedor ficou vazio porque todos saíram | Igual à segunda linha; a saída fecha antes das apostas para tornar isto raro |

### 8.3 As três mais urgentes

1. **Painel e fluxo de abertura da pergunta pela equipe** (lacuna 1): sem ele nem o sprint 2 tem forma.
2. **O que o usuário vê quando a chance muda** (lacuna 2): decide se o produto parece justo ou armadilha.
3. **Pergunta anulada e tabela do pote de um lado só** (lacunas 3 e 4): são casos de dinheiro preso, e o programa
   precisa deles antes de escrever uma linha.

## 9. Cardápio de perguntas do MVP (proposta, para o Lucas decidir)

O Lucas disse que não tinha ideia e pediu ajuda. Critério proposto: "alguém decide este resultado de graça?" (2C
seção 10). Três famílias em linguagem simples:

1. **Foto de um número numa data (preço, TVL):** "O SOL passa de X dólares até a data?". Ninguém controla. Entra no
   MVP, com Pyth e só ativos grandes.
2. **Alguém gasta ou trava dinheiro (queima, liquidez travada):** forçar o SIM custa dinheiro. Entra com teto de pote
   abaixo do custo de forçar.
3. **Alguém aperta um botão de graça (renunciar a uma chave):** o dono aposta e escolhe o resultado. **Fora do pote no
   MVP.**

| Tipo | Fase | Observação |
|---|---|---|
| Preço de SOL e BTC por Pyth | 2 | Leitor novo; preço fresco na aposta; saída desligada ou com preço fresco |
| TVL de pool de staking em uma época | 2 | Já existe; só depois de o serviço agendado estar rodando (2C R4) |
| Liquidez travada na Meteora | 3 | Teto de pote |
| Queima de oferta em token clássico | 3 | Só tokens clássicos; o público do pump.fun fica de fora até Token-2022 |
| Renúncia de chave, programa imutável, metadados imutáveis | Depois | Resultado controlável; pote livre é opção grátis para o dono |
| Stake de validador | Depois | Não testável fora de rede real; lê zero em validadores pequenos |
| Formatura no pump.fun, preço de token pequeno | Depois | Empréstimo relâmpago; exige média no tempo ou Pyth |

O Lucas questionou ("Por que ficaria? Com base no quê") a exclusão do preço de token pequeno. Resposta, sem decidir por
ele: o motivo é manipulação do preço de uma pool por empréstimo relâmpago e o caso Mango (preço de 0,04 para 0,54 em 30
minutos, FATO SECUNDÁRIO via 1H). A entrada pode vir com Pyth, média no tempo e teto de pote, em fase posterior.

## 10. O que isto muda no plano (INFERÊNCIA)

1. O MVP deve ser descrito no BP como **cinco fases**, com a mainnet na quinta; "MVP na mainnet" sem esta ressalva
   promete mais do que cabe com segurança.
2. O cronograma deve ser por sprints e critérios de pronto, não por data. Auditoria e multisig são bloqueios.
3. O BP deve dizer que o programa é novo, ao lado do atual, e reaproveita leitores e `resolve`.
4. O cardápio do MVP muda de critério (seção 9).
5. A saída antecipada fica no MVP, desligada por padrão; precisa de duas decisões do Lucas (penalidade por lado e
   "ganho menor" inexistente no pote puro).
6. O modelo financeiro (2E) deve usar potes com teto e perguntas de 30 dias no máximo.
7. A operação inclui servidor, dois agendadores, alarme e plantão; o custo de operação precisa incluir isto.
8. Cloak e SODAX são orientação e página separada, com teste real em valor pequeno.
9. Tokens e recompra e queima estão fora do MVP e não bloqueiam nenhuma fase.
10. Faltam donos para: terceira chave, upgrade authority, licença do código, auditor, plantonista.

## 11. Perguntas em aberto

Para o Lucas:

1. Aceita as cinco fases e a saída desligada por padrão?
2. Fecha a tabela do pote de um lado só e o "70/30" (os dois cenários estão na lacuna 5)?
3. Aceita a duração máxima de 30 dias no MVP, com o 80% e o mínimo de 24 horas?
4. Aceita o cardápio da seção 9?
5. Quem são as três chaves do multisig? Quem atende o alarme?
6. Qual o orçamento para a revisão externa e a auditoria?

Para o Ronaldo:

7. Quem tem a chave de atualização do programa hoje? Qual a licença do código?
8. Programa novo ao lado do atual (minha recomendação) ou versão 2 do mesmo?
9. Quanto tempo ele tem disponível, e para quais sprints (1 a 3 principalmente)?

Não confirmado nesta sessão: custo e prazo de auditoria; limites do RPC público; disponibilidade do Pyth na devnet;
licença do repositório do sócio; capacidade da máquina de build; linhas de Rust do programa novo (estimativa minha,
entre 1.500 e 2.500, por analogia com as 1.717 do atual).

## 12. Fontes

- `docs/business/ideacao-perguntas-e-respostas.md` (decisões do Lucas, seção 1 e rodadas).
- `docs/business/BRIEFING-MERCADO-DE-POTE.md` (seções 3, 4, 5, 9, 10, 12, 13).
- `docs/business/_review/wave-2-technical-security.md` (agente 2C: E1 a E10, S1 a S8, R1 a R9, K1 a K8, C1 a C9, TK1 a
  TK3, P1 a P3, F1 a F6, M1).
- `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md` (agente 1H; li o início, até a seção 1.2).
- `docs/business/_review/plano-das-ondas.md` (seções A e C).
- `CLAUDE.md` (arquitetura, comandos, gotchas); `docs/product/DESIGN-DIRECTION.md` (linha de status).
- Código local: `programs/pred-provable/src` (lista de arquivos e contagem de linhas), `app/components`, `app/lib`,
  `tests/`; `git log` e `git diff --stat` contra `upstream/main`.
- Referências: `F:\AceleradoraECO\solana-refs\escrow\README.md` (recibo de depósito com trava de tempo, molde do pedido
  de pergunta) e `solana-refs\rewards\README.md` (distribuição proporcional contínua, molde para repasse a holders,
  fora do MVP).

Nenhuma página da internet foi lida. Estimativas de tamanho, ordem e linhas de código são minhas.
