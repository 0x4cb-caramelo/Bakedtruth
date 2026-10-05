# Pauta — BP v0.0.2, Parte 4: Construção e risco

Roteiro para o redator da Parte 4. O arquivo a escrever é `docs/business/BP-v0.0.2-parte-4-construcao-e-risco.md`.

Tamanho: **entre 9.000 e 12.000 palavras**. O teto é duro. O fundador reclamou do tamanho da v0.0.1 ("115 páginas foi
exagero") e pediu partes de 20 a 30 páginas.

Esta é a última das quatro partes. Ela responde a três perguntas: o que será construído e em que ordem; o que
protege o dinheiro dos usuários; e o que pode dar errado, com o que fazer em cada caso.

**O que esta parte não é.** Não é o Plano Técnico. O método do projeto (o wizard) manda escrever o resumo de produto,
o plano técnico e o roteiro de sprints **depois** do plano de negócio, a partir do protótipo aprovado. A Parte 4 dá a
visão de negócio da construção: fases, critérios, pessoas, custos e riscos. Não escolhe biblioteca, não desenha
contas do programa, não lista instruções. Onde uma escolha técnica for necessária para o argumento, diga a escolha
em uma frase e aponte que o detalhe é do plano técnico.

## 1. Decisões do Lucas que governam a Parte 4

Trechos entre aspas são palavras dele. Tudo aqui entra no texto como **Decisão**.

| # | Assunto | Decisão | Citação |
|---|---|---|---|
| 1 | Quem escreve o programa | Reescrito neste repositório, do zero, aproveitando trechos do código do sócio | "a gente que vai reescrever o código aqui, e do zero", "olhando pro código dele para reaproveitar os trechos e pedaços que nos interessam" |
| 2 | Regras de código | As do fundador: arquivos curtos, organização por funcionalidade, sem segredo no código | "vamos passar a adotar as minhas regras e Golden rules" |
| 3 | Responsável técnico | O Ronaldo é o CTO e recebe os alertas | "o CTO é o Ronaldo" |
| 4 | Onde o MVP roda | Começa na devnet, com USDC de teste e pontuação | "vamos montar inteiramente na devnet inicialmente" |
| 5 | Ida para a rede principal | No início do mês 2 | "provavelmente vamos pra mainnet já no início do mês 2" |
| 6 | Critério para sair da devnet | Auditoria externa, carteira com várias assinaturas e teto global temporário para o total apostado | De acordo |
| 7 | Auditoria | Duas empresas, sem custo | "as duas auditorias dos dois sites que te passei vão custar zero reais" |
| 8 | Avaliação jurídica | Feita pelo fundador e por colegas, sem custo | "a avaliação jurídica eu consigo gratuitamente também, eu memso posso fazer" |
| 9 | Abertura da empresa | Cerca de 2.000 dólares. A empresa ainda não existe | "A abertura da empresa vai custar sim uns 2k dol"; "estamos codando pro colosseum" |
| 10 | Bloqueio de país e identificação | Sem identificação do usuário: só a carteira. Sem bloqueio de país por enquanto | "100% onchain da solana, via wallet, sem kyc" |
| 11 | Hackathon | A equipe está construindo para o hackathon Colosseum, e para a trilha de privacidade com o Cloak | "estamos codando pro colosseum" |
| 12 | Cloak e SODAX | Os dois integrados. Cloak já na devnet; SODAX na fase da rede principal | De acordo |
| 13 | Resolução | Dois serviços agendados em provedores diferentes; sem botão público de resolver | "Sobre o botão resolver, esquece" |
| 14 | Vigia | 10 minutos sem resposta e 3 tentativas; depois o segundo assume e avisa o CTO por email. Telegram na fase 2 | "o segundo assume o cron e envia notificação para o cto saber que tem um sistema down" |
| 15 | Janela de 6 horas e disputa | A equipe só confirma ou anula. Disputa em duas etapas; na segunda, dois de três membros da equipe | "pode ser, mas membros da equipe, né?" |
| 16 | Pagamento | Automático, sem botão de resgate | "na polymarket ele vai direto pro teu saldo, não faz sentido ter botão de claim" |
| 17 | Saída antecipada | Fora do MVP. A fórmula fica guardada para a fase 2 | "Neste mvp vamos trabalhar sem possibilidade de saída" |
| 18 | Teto por pergunta | Fora do MVP, guardado | "no mvp não vamos lidar com isso, mas guarde essa informação para revisitarmos numa fase futura" |
| 19 | Tipos de pergunta do primeiro dia | Cinco tipos; o leitor de preço é construído primeiro | "das três saídas, vamos com o recomendado (a)" |
| 20 | Custos | 5.500 dólares por mês: três sócios a 1.500 e até 1.000 de infraestrutura | Informado pelo fundador |
| 21 | Critério de parada | Aos 180 dias na rede principal, com volume mensal de até 45 mil dólares, a empresa para ou muda de rumo | "ok" |
| 22 | Tokens | Token A com o produto utilizável; token B depois do equilíbrio. O staking do B é um programa novo | "sobre as 7 decisões, concordo" |
| 23 | Esportes | Fase 2, com um oráculo próprio | "a gente pensa numa fase 2 criarmos um oráculo específico pra isso" |
| 24 | Lista de investidores | Tratada como contatos de negócio | "são e-mails de negócios, e não dados pessoais" |

## 2. Fatos que a Parte 4 precisa usar

Todos estão nos arquivos da seção 6. O redator confere cada um na fonte antes de citar.

- **O que existe hoje.** Um programa de 1.717 linhas na devnet, que faz outra coisa (recompensa paga por
  patrocinador), com nove leitores de dado on-chain que se aproveitam. A biblioteca do cliente e o app existem e
  serão refeitos em boa parte. O inventário está em `wave-2-viabilidade-mvp.md`, seção 1.
- **Token-2022.** Os tokens novos do pump.fun usam esse padrão (7 de 7 amostrados). Os leitores atuais só leem o
  padrão clássico. Sem um leitor novo, não há pergunta sobre o token A nem a ponte da Parte 3.
- **Leitor de preço.** Não existe. A candidata é a Pyth: 1.881 preços, 423 de cripto, em 4 de outubro de 2026.
- **Cloak e SODAX só existem na rede principal.** A decisão 12 diz "Cloak já na devnet". A revisão técnica registra
  que a parte privada roda na rede principal mesmo com o programa na devnet. Esse ponto precisa ser dito com
  clareza, com o que dá e o que não dá para mostrar no hackathon.
- **Brasil.** A Resolução CMN 5.298, de 2026, e a Nota Técnica SPA 2958 foram lidas na fonte e tratam mercados de
  previsão como atividade não autorizada. A lista de 27 sites bloqueados inclui plataformas on-chain. A Medida
  Provisória 1.394, de 25/9/2026, proíbe a aposta de quota fixa em todo o país, inclusive por empresa do exterior,
  e revoga quase toda a lei das apostas. **Conferida no Planalto pelo coordenador em 5/10/2026, depois de esta
  pauta ser escrita** (FATO). Não foram conferidos a tramitação no Congresso nem o Decreto 13.128, que a página
  cita.
- **Um mês de devnet contra os três critérios.** Auditoria, carteira com várias assinaturas e teto global precisam
  caber em cerca de um mês. A revisão de viabilidade estimava bem mais tempo de construção. Esse conflito é o ponto
  central do capítulo de roteiro.
- **O modelo financeiro** (Parte 2): equilíbrio em 208.630 dólares apostados por mês; no cenário razoável a
  operação se paga no mês 9 e o caixa mínimo é de −27.474; no ruim, não se paga.

## 3. Três tensões que a Parte 4 precisa dizer com clareza

As decisões são do fundador e ficam. O texto registra a tensão, a evidência e a alternativa, sem mudar a decisão.

1. **Prazo.** Programa reescrito do zero, leitor de preço novo, dois serviços agendados, pagamento automático,
   indicação, patrocínio, Cloak, auditoria e carteira com várias assinaturas, tudo antes do início do mês 2. Dizer
   o que cabe, o que não cabe e o que acontece com a data se um dos três critérios não ficar pronto.
2. **Sem identificação e sem bloqueio de país, com sócios no Brasil.** Dizer o que a pesquisa leu na regra
   brasileira, o que isso pode significar para pessoas que moram no país, e quais estruturas plataformas parecidas
   adotaram. É o primeiro ponto da avaliação jurídica. O documento não dá parecer.
3. **Dependência de poucas pessoas.** Um programa novo, com dinheiro de terceiros, escrito por uma equipe de três,
   com o conhecimento do código antigo concentrado no CTO.

## 4. Propostas que a Parte 4 leva ao fundador

Cada uma entra como **Proposta, aguardando decisão**, com: uma frase dizendo o que está sendo decidido; por que é
uma decisão; um exemplo concreto, em dinheiro quando couber; as opções com o custo de cada uma; e a recomendação com
o porquê. O fundador reclamou três vezes de propostas "sem contexto". No máximo oito propostas.

| # | O que decidir | Ponto de partida |
|---|---|---|
| 1 | O que entra no primeiro mês (devnet e hackathon) e o que fica para depois | O pote com apostas, a resolução por leitura, o pagamento automático, os quatro tipos de pergunta com leitor pronto e o leitor de preço. Patrocínio, indicação e disputa completa entram antes da rede principal, não necessariamente no primeiro mês |
| 2 | O que acontece com a data da rede principal se a auditoria não ficar pronta | A data anda. Nenhum dinheiro real sem os três critérios |
| 3 | Quem assina a carteira de várias assinaturas e quantas assinaturas ela pede | Duas de três, com os três sócios. A revisão técnica aponta que a terceira pessoa precisa estar definida |
| 4 | O valor do teto global temporário e quando ele sobe | Um teto total baixo no primeiro mês de dinheiro real, que sobe por degraus conforme semanas sem incidente |
| 5 | Onde a empresa é aberta e como o Brasil é tratado no lançamento | Assunto da avaliação jurídica. O documento mostra as estruturas que plataformas parecidas adotaram e o custo de cada uma |
| 6 | O acordo com o Ronaldo sobre o código que será reaproveitado | Deixar por escrito, antes de aproveitar trechos, de quem é o código e sob qual licença |
| 7 | O que fazer com os 30% da plataforma quando o patrocínio volta ao patrocinador | Pendência herdada da Parte 1: no pote de um lado só e na pergunta anulada, o prêmio volta inteiro. Falta dizer o destino dos 30% |
| 8 | Onde fica guardada a tesouraria em Bitcoin e quem paga a taxa de rede dos pagamentos automáticos | Pendências herdadas das Partes 1 e 2 |

Se alguma puder ser fundida ou já estiver decidida nos arquivos, funda ou retire, e diga isso no relatório.

## 5. Roteiro da Parte 4

| Capítulo | Conteúdo | Palavras |
|---|---|---|
| Cabeçalho | Como ler (as mesmas marcas das outras partes), o que esta parte é e o que ela não é | 250 |
| 1. Resumo | O que será construído, em que ordem, o que protege o dinheiro, os maiores riscos, o que falta decidir | 900 |
| 2. O que existe e o que será construído | O inventário em linguagem simples: o que se aproveita, o que se refaz, o que é novo. Por que reescrever do zero e o que isso custa | 1.300 |
| 3. O roteiro em fases | Devnet e hackathon; rede principal com tetos; fase 1.2; fase 2. Para cada fase: o que o usuário consegue fazer, o que precisa estar pronto, o que fica de fora. A tensão do prazo | 2.200 |
| 4. O que protege o dinheiro | Auditoria; carteira com várias assinaturas; quem pode alterar o programa; tetos; os dois serviços agendados; janela de 6 horas; pausa; plano de incidente; guarda da tesouraria | 1.800 |
| 5. Peças de fora | Pyth, Cloak, SODAX, pump.fun e o X: o que cada uma faz, o que acontece se cair, e o que só funciona na rede principal | 1.100 |
| 6. Pessoas e empresa | Quem faz o quê; o que depende de uma pessoa só; abertura da empresa; custos; o método de trabalho e os documentos que vêm depois deste plano | 1.000 |
| 7. Regulação | O que foi lido na fonte, o que está a confirmar, o que a avaliação jurídica precisa olhar, em lista | 1.300 |
| 8. Riscos | Tabela única: risco, gravidade, o que reduz, o que fazer se acontecer. Inclui o critério de parada | 1.200 |
| 9. Decisões pendentes e objeções | A tabela das propostas, as objeções da v0.0.1 que tocam a construção e o que vem depois do plano | 1.000 |

Total: cerca de 12.050 no roteiro; ajuste os capítulos para fechar abaixo de 12.000.

## 6. O que ler antes de escrever

Leia com `cat` ou `sed -n` pelo Bash; a ferramenta Read devolve só a primeira linha destes arquivos.

1. `docs/business/ideacao-perguntas-e-respostas.md`, seção 1 inteira. É a fonte da verdade.
2. `docs/business/_review/correcoes-bp-v0.0.2-partes-1-e-2.md`.
3. As três partes prontas, pelo menos o cabeçalho e o capítulo 1 de cada uma, e todo trecho que diz "Parte 4"
   (procure com `grep -n "Parte 4"`): `BP-v0.0.2-parte-1-produto.md`, `BP-v0.0.2-parte-2-mercado-e-negocio.md`,
   `BP-v0.0.2-parte-3-tokens.md`. Cada remissão dessas é uma promessa que a Parte 4 precisa cumprir.
4. `docs/business/_review/wave-2-viabilidade-mvp.md`, inteiro. **Atenção:** é anterior a várias decisões (previa
   saída antecipada, botão público de resolver, taxa de 3% em quatro destinos). Vale a tabela 1 desta pauta.
5. `docs/business/_review/wave-2-technical-security.md`, inteiro, com atenção às seções 3, 4, 5, 6, 7, 8 e 13.
6. `docs/business/_review/wave-2-compliance.md`, inteiro, com atenção às seções 1, 6, 7, 8 e 9.
7. `docs/business/_review/wave-2-devils-advocate.md`: os riscos de execução e de mercado.
8. `docs/business/_review/wave-3-coordinator.md`: procure por "OBJ-" para a lista completa das objeções.
9. `knowledge-base/tecnologia/privacidade-entre-redes-e-x.md` e
   `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md`.
10. `docs/business/_review/BUSINESS-PLAN-v0.0.1.md`, capítulos 11 a 16 (linhas 3077 a 4414): a versão anterior.
11. `CLAUDE.md` na raiz do repositório: descreve o programa atual e as regras de trabalho do projeto.

## 7. Regras de escrita

- Português simples, frases diretas, para quem não é programador. Todo termo técnico vem explicado na primeira vez:
  auditoria, carteira com várias assinaturas, chave de atualização, oráculo, serviço agendado, rede de testes.
- Toda regra tem um exemplo. Onde houver conta, confira com `node -e`.
- **Decisão.** com a citação entre aspas para o que o fundador decidiu. **Proposta, aguardando decisão** para o que
  este documento sugere. Números de fora com etiqueta: FATO, FATO SECUNDÁRIO ou INFERÊNCIA, com a fonte.
- Não invente fato, número, prazo, nome de empresa, citação nem decisão. Se a pesquisa não tem o dado, diga que não
  tem. Em especial: não invente a data do hackathon, o prazo da auditoria nem o nome de quem assina a carteira.
- A visão do fundador é a espinha do texto. Quem discorda registra a objeção ao lado, com evidência e alternativa.
- Diga o custo e o risco de cada desenho, sem suavizar.
- Em regulação, aponte o que a avaliação jurídica precisa olhar. Não dê parecer.
- Sem travessões longos no meio da frase, sem frases de efeito, sem "não é X, é Y".
