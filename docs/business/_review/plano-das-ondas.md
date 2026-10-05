# Plano das ondas de pesquisa e instruções comuns aos agentes

Aprovado pelo Lucas em 4 de outubro de 2026, nas palavras dele: "Vamos soltar a onda 1, com pelo menos 7 agentes, mas
quero eles em dois grupos, um depois do outro. Depois ... a onda 2, com pelo menos 5 agentes, também em dois grupos um
depois do outro, e por fim, a onda 3, com pelo menos 3 agentes. Quero que isso tudo seja compilado, imediatamente, sem
precisar de nenhuma permissão extra minha, um BP de pelo menos 35 páginas".

## A. Instruções comuns (todo agente lê antes de começar)

### A.1 O que é o projeto

Baked Market: mercado de previsão em Solana para o público web3. Uma pool (pote) por pergunta; quem acerta divide o
pote; a resolução é leitura de dado on-chain, sem oráculo humano. Repositório: `F:\AceleradoraECO\bakedtruth`.

### A.2 Fonte da verdade, nesta ordem

1. `docs/business/ideacao-perguntas-e-respostas.md`, seção 1 ("Estado consolidado"). São as decisões do Lucas, dono do
   produto. **Onde qualquer outro arquivo disser outra coisa, vale este.**
2. `docs/business/BRIEFING-MERCADO-DE-POTE.md`, lido junto com os comentários do Lucas na seção 6 do arquivo acima.
3. As pesquisas já feitas, em `knowledge-base/` (lista em A.3). Leia as que tocam o seu tema antes de pesquisar, para
   não repetir e para corrigir o que estiver fraco.
4. O código e o `README.md` descrevem o que existe hoje (um modelo de patrocinador com recompensa), **não** o produto
   que será construído. Use-os só para saber o que se aproveita.

Não mude as decisões do Lucas. Se você achar que uma decisão é ruim, diga isso com o motivo e com a alternativa, sem
substituí-la.

### A.3 Pesquisas existentes

- `knowledge-base/referencias/polymarket-docs.md`, `polymarket-help.md`, `kalshi-docs.md`
- `knowledge-base/competitors/mercados-de-previsao-web3.md`
- `knowledge-base/market/receita-mercados-de-previsao.md`, `modelos-de-token.md`, `rendimento-do-pote.md`,
  `patrocinio-e-destaque-pago.md`
- `knowledge-base/tecnologia/privacidade-entre-redes-e-x.md`
- No repositório do sócio, ainda não mesclado, legível com `git show upstream/main:ARQUIVO`: `RESOLVERS.md`,
  `ECONOMICS.md`, `PRIVACY_PLAN.md`, `NAMING.md` (só agentes com acesso a shell).

### A.4 Disciplina

- Nunca invente fato, número, concorrente, lei ou preço. O que não achar: "não encontrado".
- Marque cada afirmação como **FATO** (fonte primária: documentação oficial, página do regulador, dado on-chain),
  **FATO SECUNDÁRIO** (imprensa, agregador, blog) ou **INFERÊNCIA** (raciocínio seu). Cada número com fonte e data.
- A ferramenta de leitura de páginas devolve resumo feito por um modelo auxiliar. Número importante: confirme em
  segunda leitura ou segunda fonte.
- Não opine sobre o que a lei permite. Descreva o que a regra ou o caso diz, com a fonte, e marque como ponto para
  advogado.
- Escreva em português do Brasil, para um fundador que não é engenheiro de protocolo. Para cada conceito: o que é,
  por que existe, um exemplo com números. Sem siglas soltas. Ele rejeitou respostas curtas demais e sem contexto.

### A.5 Formato do arquivo de saída

Título; data; "Resumo em dez linhas"; corpo em seções; "O que isto muda no plano" (marcado como INFERÊNCIA);
"Perguntas em aberto"; "Fontes". Linhas de até 120 caracteres (tabelas podem passar).

### A.6 Regras do ambiente

- Um hook bloqueia a PRIMEIRA chamada de Write ou Edit em cada arquivo e pede fatos. Responda no seu texto: (1) quem
  vai referenciar o arquivo (o Business Plan e o `CHANGELOG.md`); (2) que não existe arquivo equivalente (faça Glob; se
  não tiver Glob, diga); (3) que não lê nem grava dados; (4) a instrução do usuário entre aspas (a frase do topo deste
  arquivo). Depois repita a mesma chamada. Não use o shell para contornar.
- Grave só o seu arquivo de saída. Não altere outros arquivos. Não faça commit.
- Devolva ao agente principal no máximo 200 palavras: o que achou de mais importante, o que contradiz o plano e o que
  não conseguiu confirmar.

## B. Onda 1 — pesquisa (8 agentes)

**Grupo 1**

| Agente | Tema | Arquivo de saída |
|---|---|---|
| 1A concorrentes | Lista longa de até 20 mercados de previsão (web3 e tradicionais), com PNP Protocol; escolha dos 5 principais | `knowledge-base/competitors/competitor-longlist.md` |
| 1B mercado | Tamanho e crescimento do mercado de previsão: global, cripto e Solana; volumes, usuários, receita | `knowledge-base/market/market-research.md` |
| 1C regulação | Como reguladores tratam mercados de previsão e apostas com cripto: EUA, Brasil, União Europeia, Reino Unido; casos contra plataformas sem KYC | `knowledge-base/market/regulacao.md` |
| 1D público | O público web3 e do pump.fun: quem é, quantos são, quanto movimentam, no que apostam, onde se informam | `knowledge-base/market/publico-web3.md` |

**Grupo 2** (depois do grupo 1)

| Agente | Tema | Arquivo de saída |
|---|---|---|
| 1E top 5 | Análise profunda dos 5 principais concorrentes escolhidos em 1A | `knowledge-base/competitors/top-5-competitor-analysis.md` |
| 1F monetização | Outras formas de receita dos mercados de previsão; faixas de patrocínio; fundo de prêmios; tesouraria em BTC de empresas | `knowledge-base/market/monetizacao-e-tesouraria.md` |
| 1G dois tokens | Token especulativo no pump.fun mais token de ICO privado: como se desenha, casos, travas, recompra e queima, a ideia dos 30% para as pools | `knowledge-base/market/dois-tokens-e-ico-privado.md` |
| 1H técnica | Saída antecipada com penalidade em potes; regra de fechamento gradual; cron para acionar a resolução; tipos de pergunta em linguagem simples; preço por oráculo on-chain | `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md` |

Ao fim da onda, o agente principal monta `knowledge-base/market/source-index.md`.

## C. Onda 2 — red team (6 agentes)

Cada relatório traz: riscos, contradições, premissas fracas, cenários de falha, informação faltante, correção proposta
e severidade (crítica, alta, média, baixa).

**Grupo 1**

| Agente | Tema | Arquivo de saída |
|---|---|---|
| 2A advogado do diabo | Ataca as premissas do produto e do modelo | `docs/business/_review/wave-2-devils-advocate.md` |
| 2B negócio e finanças | Ataca receita, custos, patrocínio, destino da taxa, tesouraria em BTC | `docs/business/_review/wave-2-business-finance.md` |
| 2C técnica e segurança | Ataca o programa de pote, a saída antecipada, o cron, o patrocinador anônimo, a manipulação | `docs/business/_review/wave-2-technical-security.md` |

**Grupo 2** (depois do grupo 1)

| Agente | Tema | Arquivo de saída |
|---|---|---|
| 2D conformidade | Sem KYC, patrocinador anônimo, dois tokens, recompra: o que as regras e os casos dizem | `docs/business/_review/wave-2-compliance.md` |
| 2E modelo financeiro | Três cenários (ruim, razoável, otimista) em 12 e 24 meses: volume, taxa, patrocínio, custos, ponto de equilíbrio | `docs/business/_review/wave-2-modelo-financeiro.md` |
| 2F viabilidade do MVP | Escopo, ordem de construção, o que cabe na primeira versão, roteiro por fases | `docs/business/_review/wave-2-viabilidade-mvp.md` |

## D. Onda 3 — consolidação e Business Plan (4 agentes)

1. **3A coordenador:** resolve as contradições entre os relatórios, fixa os números e as definições que o BP usa, e
   grava `docs/business/_review/wave-3-coordinator.md`.
2. **3B, 3C e 3D redatores**, em paralelo, depois do coordenador. Cada um escreve uma parte do BP, com pelo menos
   6.000 palavras, usando só o que o coordenador fixou:

| Parte | Capítulos | Arquivo de saída |
|---|---|---|
| A | 1 Sumário executivo · 2 Problema e oportunidade · 3 O produto · 4 Perguntas e resolução on-chain · 5 Mercado e público | `docs/business/_review/bp-parte-a.md` |
| B | 6 Concorrência · 7 Modelo de negócio e receita · 8 Os dois tokens · 9 Projeções financeiras · 10 Entrada no mercado | `docs/business/_review/bp-parte-b.md` |
| C | 11 Tecnologia e arquitetura · 12 Roteiro · 13 Equipe e operação · 14 Riscos · 15 Regulação e conformidade · 16 Decisões em aberto e próximos passos · Anexos | `docs/business/_review/bp-parte-c.md` |

O agente principal junta as três partes em `docs/business/BUSINESS-PLAN.md`, versão v0.0.1, confere tamanho e
coerência, e atualiza `CHANGELOG.md` e `session-log/`.
