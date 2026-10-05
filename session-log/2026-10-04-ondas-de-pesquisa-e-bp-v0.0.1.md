# 2026-10-04 — Ondas de pesquisa e Business Plan v0.0.1

## Context

Depois de cinco rodadas de perguntas e respostas que redefiniram o produto como mercado de previsão em pote (ver
[`2026-10-03-produto-redefinido-como-mercado-de-pote.md`](2026-10-03-produto-redefinido-como-mercado-de-pote.md)), o
Lucas mandou registrar tudo e seguir o wizard: "Vamos soltar a onda 1, com pelo menos 7 agentes, mas quero eles em
dois grupos, um depois do outro ... a onda 2, com pelo menos 5 agentes ... e por fim, a onda 3, com pelo menos 3
agentes. Quero que isso tudo seja compilado, imediatamente, sem precisar de nenhuma permissão extra minha, um BP de
pelo menos 35 páginas".

Na mesma mensagem ele fechou pontos que estavam em aberto: moeda USDC; rendimento do pote abandonado; saída antecipada
no MVP; faixas de patrocínio de 500, 1.500 e 5.000 dólares; destino da taxa em quatro partes de 25% (tesouraria em
Bitcoin, operação, recompra e queima, fundo de prêmios); dois tokens (pump.fun e venda privada).

## Decision

1. **As respostas do Lucas viraram arquivo** e fonte da verdade para os agentes:
   `docs/business/ideacao-perguntas-e-respostas.md`, com o estado consolidado no topo.
2. **O plano das ondas foi escrito antes de rodar** (`docs/business/_review/plano-das-ondas.md`), com instruções
   comuns: a visão do fundador é a espinha; quem discorda registra a objeção com evidência e alternativa, sem mudar a
   decisão.
3. **Dezoito agentes em três ondas:** Onda 1 com 8 (dois grupos de 4), Onda 2 com 6 (dois grupos de 3), Onda 3 com 4
   (um coordenador, depois três redatores em paralelo).
4. **O BP foi escrito em três partes** e montado em `docs/business/BUSINESS-PLAN.md`, v0.0.1: 16 capítulos, três
   anexos, cerca de 63.700 palavras, 31 objeções registradas.
5. **As decisões do fundador entram no BP como decisões.** As doze objeções que o coordenador classificou como
   críticas aparecem ao lado delas, não no lugar.

## Alternatives considered

- **Um único redator para o BP:** não caberia em uma passada. Três redatores sobre uma ficha de números fixada pelo
  coordenador deram tamanho e consistência, ao custo de alguma repetição entre partes.
- **Enxugar o BP ao alvo de 22.500 palavras:** os três redatores passaram muito do alvo porque as tabelas e os
  exemplos obrigatórios já o excediam. Não foi cortado: o pedido era um mínimo, e o fundador reclamou de respostas
  curtas e sem contexto.
- **Parar quando a busca na web acabou:** a busca nativa bateu no teto de 200 consultas da sessão no fim do primeiro
  grupo. Os grupos seguintes usaram a busca do Exa, que também esgotou o limite gratuito durante a Onda 2. A Onda 3
  não dependia de busca.

## Why this decision

O Lucas pediu o processo completo do wizard sem interrupção. Escrever primeiro o registro das respostas e o plano
deu aos agentes uma única fonte da verdade, o que importava porque o código e os documentos do repositório descrevem
outro produto.

## Risks

- **Os quatro agentes do primeiro grupo da Onda 1 não leram as instruções comuns.** Um hook do ambiente corta a
  leitura de arquivos recém-gravados na primeira linha. Eles trabalharam só com o pedido individual; os arquivos deles
  (lista de concorrentes, tamanho de mercado, regulação, público) podem estar fora do formato e usam mais fonte
  secundária. O agente de conformidade da Onda 2 reconferiu a parte regulatória na fonte oficial.
- **A Medida Provisória 1.394, de 25/9/2026**, citada pelo agente de conformidade, não foi verificada por mim: as duas
  buscas estavam esgotadas e a página do Planalto não respondeu. Está no BP como "a confirmar".
- **Toda projeção financeira é inferência.** Faltam dados de aposta média, fração de saídas e número de patrocinadores.
- **O "70/30" do patrocínio segue ambíguo.** O BP mostra os dois sentidos.
- **O BP tem cerca de 130 páginas**, quase quatro vezes o mínimo pedido. A leitura da etapa 2.7 é longa.
- **Demanda não demonstrada:** nenhuma plataforma pesquisada tem mercados sobre queima, renúncia ou trava de tokens.
- Nada disto está commitado.

## Follow-ups

- Etapa 2.7 do wizard: o Lucas lê o BP com um bloco de notas e devolve as correções citando capítulo e seção.
- Etapa 2.8: aplicar as correções com revisão de impacto e gerar o BP v0.0.2.
- Confirmar a MP 1.394 e o sentido do "70/30".
- Conversa com o Ronaldo, com o briefing e o BP.
- Commit de tudo que está no disco.

## Atualização no mesmo dia: revisão do fundador e Parte 1 da v0.0.2

O Lucas leu a v0.0.1 até o capítulo 8 e devolveu correções em duas rodadas. O que pesou:

- **Tamanho.** "115 páginas foi exagero". A v0.0.2 sai em quatro partes de 20 a 30 páginas; a primeira, de produto,
  ficou com cerca de 11.500 palavras (`docs/business/BP-v0.0.2-parte-1-produto.md`). Na v0.0.1 os redatores passaram
  de três vezes o alvo porque só receberam um mínimo; desta vez a pauta trouxe teto.
- **Decisões que mudaram:** nome Brot Markets; saída antecipada fora do MVP; taxa 25% para a tesouraria e 75% para a
  operação até o equilíbrio; patrocínio 70% para o pote; janela de 6 horas em que a equipe só confirma ou anula;
  pagamento automático; tipos de pergunta decididos por uma chave ficam fora; parceiros gratuitos; indicação desde o
  MVP; o programa será reescrito neste repositório, do zero.
- **A forma da taxa segue aberta.** Ele perguntou por que não foi proposta a fórmula dos concorrentes. A v0.0.1 só
  propôs um teto porque preservava os 3% decididos; a simulação das três formas está em
  `docs/business/_review/bp-impact-review-v0.0.2.md`, com a recomendação de cobrar 10% do lado perdedor.
- **Pendências:** seis propostas da Parte 1 aguardam decisão; as Partes 2, 3 e 4 ainda não foram escritas; a v0.0.1
  continua em `BUSINESS-PLAN.md` até as quatro partes existirem.

## Related links

- BP: [`docs/business/BUSINESS-PLAN.md`](../docs/business/BUSINESS-PLAN.md)
- Respostas do fundador: [`docs/business/ideacao-perguntas-e-respostas.md`](../docs/business/ideacao-perguntas-e-respostas.md)
- Plano das ondas e relatórios: [`docs/business/_review/`](../docs/business/_review/)
- Pesquisas: `knowledge-base/`, com índice em `knowledge-base/market/source-index.md`
- Sprint: —
