# 2026-10-03 — Produto redefinido: mercado de previsão em pote, não recompensa por meta

## Context

Ao abrir a Fase 2 (Ideação), o código foi lido por inteiro e descrito como ele é: um patrocinador vende YES abaixo de
1 USDC como recompensa por uma meta on-chain. O Lucas respondeu que não é essa a proposta: "ele foi montado errado ...
queremos que seja um mercado de previsão", e pediu que o projeto fosse repensado "me tendo como melhor verdade". Foram
três rodadas de perguntas e respostas no mesmo dia. No meio delas o Ronaldo atualizou o `upstream`
(`0xcf07/pred-provable@4d672ae`) aprofundando o modelo de patrocinador.

## Decision

Estado ao fim da terceira rodada. Tudo abaixo é intenção de produto; nada foi implementado.

1. **Mecanismo:** um pote (pool) por pergunta. As apostas entram no lado SIM ou NÃO e quem acerta divide o pote. Sem
   preço garantido na compra, sem teto de compra, sem tokens SPL de resultado: um registro por apostador.
2. **Quem abre as perguntas:** a equipe, como no Polymarket e na Kalshi. O público sugere, de preferência pelo X.
3. **Resolução:** só por dados lidos on-chain. Pode resolver antes da data se o fato acontecer.
4. **Patrocinador, redefinido:** quem aposta um valor mínimo maior num dos lados, aumentando o pote. Pode ficar
   privado e pode receber contrapartida (destaque). Em aberto: se ele também pode abrir pergunta com esse depósito.
5. **Saída antes da resolução:** desejada, com penalidade que fica no pote. Em aberto se entra no MVP.
6. **Pote de um lado só:** devolve, cobrando a taxa.
7. **Público e acesso:** web3, carteira, sem KYC. Bloqueio geográfico fica para o fim.
8. **Token:** da plataforma, lançado no pump.fun, com objetivo declarado de valorizar e pagar dividendo. Desenho em
   aberto.
9. **Em exploração:** rendimento do pote para a casa, somado à taxa ou no lugar dela.

## Alternatives considered

- **Manter o modelo do código (recompensa com venda subsidiada e pool):** é o que o `upstream` aprofundou hoje, com
  proposta de taxas e de token em `ECONOMICS.md`. Rejeitado pelo Lucas como proposta do produto.
- **Livro de ordens, como os líderes:** dá retorno conhecido na compra e saída por venda, mas exige formadores de
  mercado e casamento de ordens fora da chain. Não foi escolhido.
- **Qualquer pessoa cria perguntas:** foi a posição do Lucas na primeira rodada; na terceira ele passou para "a equipe
  abre", depois de saber que é assim nos líderes.
- **Preço instantâneo de token como pergunta:** a pesquisa do Ronaldo (`RESOLVERS.md`) rejeita métricas que uma
  transação consegue subir e descer. O Lucas questionou a restrição; segue em discussão.

## Why this decision

O Lucas é quem define o produto e disse que a recompensa por meta nunca foi a proposta. O pote dispensa patrocinador,
formador de mercado e liquidez inicial, que eram as dependências do modelo anterior. A resolução por leitura on-chain,
que ele manteve, é o que o código tem de mais sólido e o que nenhum concorrente pesquisado mostrou fazer (suposição
ainda não confirmada).

## Risks

- **Dois sócios em direções opostas.** No mesmo dia o Ronaldo publicou economia, privacidade, nomes e três
  resolvedores novos para o modelo de patrocinador. O pote reescreve as instruções econômicas do programa dele.
- **Quem controla o resultado pode apostar**, e um patrocinador privado esconde justamente isso.
- **Patrocinar um lado piora o retorno de quem segue esse lado**, o contrário do efeito de marketing pretendido.
- **Saída com penalidade aberta perto do fim esvazia o prêmio**: todo perdedor sai.
- **Rendimento do pote** rende pouco em mercados curtos e tira o dinheiro do nosso cofre (ataque ao Drift em
  1/4/2026; utilização de ~100% em abril de 2026).
- **Dividendo a holders** é o desenho que reguladores examinam; GMX e Gains suspenderam os seus em 2026.
- **Sem KYC com dinheiro real** não teve análise jurídica.
- Várias cifras de concorrentes e de tokens vêm de fonte secundária; está marcado em cada arquivo de
  `knowledge-base/`.

## Follow-ups

- Respostas do Lucas à quarta rodada de perguntas (patrocinador, saída, fechamento, token, tipos de pergunta).
- Conversa com o Ronaldo sobre o modelo antes de mexer no programa.
- Depois: plano de pesquisa formal da Fase 2 e Business Plan.

## Related links

- Pesquisas: `knowledge-base/referencias/`, `knowledge-base/competitors/`, `knowledge-base/market/`,
  `knowledge-base/tecnologia/`
- Upstream: `ECONOMICS.md`, `RESOLVERS.md`, `PRIVACY_PLAN.md`, `NAMING.md` em `upstream/main` (ainda não mesclados)
- Repositórios de referência clonados fora do projeto: `F:\AceleradoraECO\solana-refs\`
- Sprint: —
