# Baked Market — Business Plan

- **Versão:** v0.0.1
- **Data:** 4 de outubro de 2026
- **Estado:** primeira versão, para leitura e correção do fundador (etapa 2.7 do wizard). Nada do que está aqui foi
  implementado.
- **Dono do produto:** Lucas. Onde este documento e qualquer outro arquivo do repositório discordarem sobre o que o
  produto é, valem as respostas dele em [`ideacao-perguntas-e-respostas.md`](ideacao-perguntas-e-respostas.md).

## Como este documento foi feito

1. **Cinco rodadas de perguntas e respostas** com o fundador, em 3 e 4 de outubro de 2026, registradas em
   [`ideacao-perguntas-e-respostas.md`](ideacao-perguntas-e-respostas.md).
2. **Onda 1, pesquisa (8 agentes):** concorrentes, tamanho do mercado, regulação, público, monetização, os dois
   tokens e os problemas técnicos. Arquivos em `knowledge-base/`; fontes em
   [`knowledge-base/market/source-index.md`](../../knowledge-base/market/source-index.md).
3. **Onda 2, red team (6 agentes):** advogado do diabo, negócio e finanças, técnica e segurança, conformidade, modelo
   financeiro e viabilidade do MVP. Arquivos em [`_review/`](_review/).
4. **Onda 3, consolidação e redação (4 agentes):** um coordenador fixou os números e resolveu as contradições
   ([`_review/wave-3-coordinator.md`](_review/wave-3-coordinator.md)); três redatores escreveram as partes.

## Como ler

- **As decisões do fundador aparecem como decisões.** Quando houver citação entre aspas, são palavras dele.
- **"Objeção registrada"** marca um ponto em que a pesquisa ou o red team discordam de uma decisão. A objeção traz a
  evidência e a alternativa, e não substitui a decisão: quem decide é o fundador.
- **Cada número tem etiqueta.** FATO: fonte primária (documentação oficial, norma, dado on-chain). FATO SECUNDÁRIO:
  imprensa, agregador ou blog. INFERÊNCIA: raciocínio ou projeção nossa. Toda projeção financeira é INFERÊNCIA.
- **"A confirmar"** marca o que nenhum agente conseguiu verificar na fonte.
- Este documento não é parecer jurídico nem recomendação de investimento. Os pontos regulatórios descrevem o que as
  normas e os casos dizem e são assunto para advogado.

## Sumário

**Parte A — o que é**

1. Sumário executivo
2. Problema e oportunidade
3. O produto
4. Perguntas e resolução on-chain
5. Mercado e público

**Parte B — como ganha dinheiro**

6. Concorrência
7. Modelo de negócio e receita
8. Os dois tokens
9. Projeções financeiras
10. Entrada no mercado

**Parte C — como se constrói e o que pode dar errado**

11. Tecnologia e arquitetura
12. Roteiro
13. Equipe e operação
14. Riscos
15. Regulação e conformidade
16. Decisões em aberto e próximos passos

Anexo A. Glossário · Anexo B. Fontes · Anexo C. Índice das objeções registradas

---

## 1. Sumário executivo

### 1.1 O que é o Baked Market

O Baked Market é um mercado de previsão: um lugar em que pessoas apostam dinheiro no resultado de uma pergunta sobre
o futuro. Ele roda na Solana, a blockchain escolhida para o produto, e é feito para quem já usa carteira de
criptomoedas. Três decisões do fundador definem o que ele é.

**Decisão.** É um mercado de previsão, e não uma recompensa paga por meta cumprida, que é o que o código atual faz:
"ele foi montado errado, não é essa a proposta dele ... queremos que seja um mercado de previsão".

**Decisão.** Cada pergunta tem uma pool (pote): o cofre em que entram todas as apostas daquela pergunta. As apostas
vão para o lado SIM ou para o lado NÃO. No fim, quem acertou divide o que sobrou depois da taxa. Não há preço
garantido na hora da aposta.

**Decisão.** O resultado sai da leitura de um dado gravado na própria blockchain (on-chain), que qualquer pessoa
pode conferir. Nas palavras dele: "eu quero trabalhar com oráculo, mas um que possa resolver onchain, diferente das
questões abertas de geopolítica que depende um oráculo que claramente pode ser manipulado".

### 1.2 Para quem

**Decisão.** "queremos pessoal da web3." O acesso é "100% onchain da solana, via wallet, sem kyc": a pessoa entra só
com a carteira, sem identificação (sem KYC, que é a conferência de quem é o usuário, com documento).

Esse público existe em número. O pump.fun, a plataforma de Solana em que qualquer pessoa lança um token em minutos,
somava 80 milhões de carteiras únicas e mais de US$ 214 bilhões negociados desde a criação, com média de cerca de
US$ 347 milhões por dia (FATO SECUNDÁRIO, The Block, jun/2026). A mesma fonte mostra a queda de 2026: a receita
diária do pump.fun era de US$ 800 mil, contra US$ 4,8 milhões seis meses antes (FATO SECUNDÁRIO, The Block,
jun/2026). Carteira não é pessoa: quantas pessoas reais há por trás desses números não foi encontrado.

### 1.3 Como funciona, em um exemplo

Uma pergunta tem 300 USDC apostados no SIM e 700 no NÃO. USDC é a moeda digital que vale 1 dólar; é a moeda do
produto. O pote é de 1.000. A taxa de 3% tira 30 e sobram 970 para quem acertar.

- Se der SIM, cada 1 USDC apostado no SIM recebe 970 ÷ 300 = 3,23.
- Se der NÃO, cada 1 USDC apostado no NÃO recebe 970 ÷ 700 = 1,39.
- A "chance" que a tela mostra é a fatia do pote em cada lado: SIM 30%, NÃO 70%.

O retorno só fica definido quando as apostas fecham, porque cada aposta nova muda as fatias (ver seção 3.3).

### 1.4 Como ganha dinheiro

**Decisão.** A taxa é de 3% do pote. O critério dito pelo fundador: "vamos trabalhar dentro das taxas de mercado,
nem maior, nem menor."

**Decisão.** A taxa se divide em quatro partes iguais: "25% para um treasure btc da empresa, 25% para operação (não
deve ser todo o custo que foi estimado), 25% recompra e queima do nosso token em ico privado e, 25% para fundo de
prêmios".

**Decisão.** Há uma segunda fonte: o patrocínio de pergunta, em três faixas, de US$ 500, US$ 1.500 e US$ 5.000. O
patrocinador põe dinheiro numa pergunta e recebe contrapartidas de visibilidade (ver seções 3.7 e 7.4).

Uma consequência dessa divisão precisa estar à vista desde a primeira página: só um quarto da taxa paga as contas da
empresa. De cada US$ 100 apostados, US$ 3 são taxa e US$ 0,75 vão para a operação. Com as premissas de saída
antecipada do modelo financeiro, esse valor cai para US$ 0,64 (INFERÊNCIA, premissas sem dado; ver seções 7.3 e
9.2). É esse número, e não os 3%, que decide quanto volume o negócio precisa.

O plano prevê ainda dois tokens, um lançado no pump.fun e outro numa venda privada ("ICO privado", nas palavras do
fundador). Eles são a terceira trilha de dinheiro das pools e estão descritos no capítulo 8, sem nenhuma promessa
de preço ou de retorno.

### 1.5 O que já existe e o que falta

Existe um programa (o código que roda na Solana e guarda o dinheiro) publicado na rede de testes (devnet), a rede de
ensaio, com dinheiro de mentira. Ele tem 1.717 linhas, 138 testes, nove leitores on-chain e uma resolução que
qualquer pessoa pode acionar (FATO, repositório, 4/out/2026). Leitor on-chain é a parte do programa que abre uma
conta da Solana, lê um número ou uma chave e responde sim ou não, sem ninguém informar nada. Essa é a parte que se
aproveita.

Falta quase todo o resto. A parte econômica do programa atual segue o modelo antigo e sai; o programa de pote é
novo, estimado em 1.500 a 2.500 linhas (INFERÊNCIA, estudo de viabilidade, out/2026). O repositório se descreve
como protótipo de hackathon, na rede de testes e sem auditoria (FATO, repositório). Antes de receber dinheiro real
na rede principal (mainnet) faltam também a auditoria externa, a empresa, a avaliação jurídica e as decisões de
regra listadas no capítulo 16.

### 1.6 Os números do plano

A tabela resume o que as Partes B e C detalham. Dois pares de termos aparecem nela. **Sentido A e sentido B** são as
duas leituras da frase do fundador sobre o patrocínio ("70/30"): no A, 70% do valor fica com a banca (a empresa que
opera) e 30% vai ao pote; no B, o contrário. Ele ainda não disse qual vale. **Regime (a) e regime (b)** são duas
ordens para o destino da taxa: no (a), ela se divide em quatro desde o primeiro dia, como decidido; no (b), proposto
pela revisão crítica, as parcelas de Bitcoin e de recompra esperam em USDC e cobrem o déficit até a operação se
pagar (ver seção 9.5).

Tabela 1.1: o plano em números. Todas as linhas de projeção são INFERÊNCIA do modelo financeiro (out/2026), sobre
premissas sem dado de uso; valores em dólares.

| Item | Valor | Etiqueta |
|---|---|---|
| Taxa | 3% do pote | Decisão |
| Faixas de patrocínio | 500, 1.500 e 5.000 | Decisão |
| Parte de cada 100 apostados que paga a operação | 0,75 (0,64 com saída antecipada) | INFERÊNCIA |
| Volume apostado no mês 12 | Ruim: 45 mil. Razoável: 300 mil. Otimista: 1,5 milhão | INFERÊNCIA (premissa sem dado) |
| Receita total no mês 12 | Ruim: 1.148. Razoável: 9.400 (A) ou 8.400 (B). Otimista: 46.300 (A) ou 41.700 (B) | INFERÊNCIA |
| Volume mensal de equilíbrio com custo de 3.000 por mês | 470.588 no regime (a); 156.863 no regime (b) | INFERÊNCIA |
| Capital necessário, com reserva | 70 a 110 mil nos cenários razoável e otimista; 125 a 136 mil no ruim | INFERÊNCIA |
| Gasto antes do lançamento | 51.500 (faixa de 30 a 75 mil) | INFERÊNCIA; cotações **[A confirmar]** |
| Meta razoável de 90 dias | 150 mil apostados no total; 375 carteiras ativas no terceiro mês; 24 perguntas resolvidas, nenhuma errada | INFERÊNCIA |
| Régua de tamanho | O World, dentro da carteira Phantom, fez 15,44 milhões em setembro de 2026 | FATO SECUNDÁRIO (DefiLlama, set/2026) |

O cenário ruim não se paga em nenhum regime. E ele não é o piso: o piso é volume perto de zero (ver seção 9.3).

### 1.7 Os maiores riscos

A revisão crítica registrou 29 objeções a decisões do plano, 12 delas de severidade crítica. Todas aparecem em caixas
"Objeção registrada" nas seções em que a decisão é apresentada, e o quadro completo está no capítulo 14. As cinco
que pesam mais:

1. **A demanda não está demonstrada.** Ninguém mostrou que o público web3 quer apostar em fatos lidos on-chain
   (OBJ-01, seção 2.5).
2. **Quem controla o resultado pode apostar, inclusive anônimo.** Em parte das perguntas uma pessoa decide o
   resultado de graça (OBJ-02, seção 3.7; OBJ-03, seção 4.2).
3. **Só 0,64% do volume paga a operação.** A divisão da taxa em quatro multiplica por quatro o volume necessário
   (OBJ-09, seção 7.3).
4. **Brasil, jurisdição e identificação.** A equipe mora no país em que a regra contra o setor é mais recente, e
   não há empresa nem parecer (OBJ-17, OBJ-18 e OBJ-20, capítulo 15).
5. **Programa novo, sem auditoria, com a saída antecipada dentro.** É a peça mais nova e a menos testada (OBJ-04,
   seção 3.6; OBJ-26, seção 12.1).

### 1.8 Próximos passos

1. Revisão deste plano pelo fundador e versão v0.0.2, com análise de impacto de cada mudança.
2. Decisões pendentes de regra, que são 14 (lista na seção 16.1), a começar pelo sentido do "70/30", pela tabela do
   pote de um lado só, pelo destino da penalidade e pelo cardápio de perguntas do primeiro dia.
3. Consulta a advogado brasileiro com prática em cripto, antes de gastar com construção: enquadramento do pote,
   jurisdição, lista de países, patrocinador anônimo, tokens.
4. Acordo escrito com o sócio técnico, respostas às perguntas do briefing, prazo e dedicação; definição de quem
   guarda a chave de atualização (a carteira que pode trocar o código do programa) e de quem é a terceira chave do
   multisig (a carteira que só assina quando várias pessoas aprovam).
5. Teste de demanda: 10 a 15 conversas com o público-alvo, beta com pontuação e sem dinheiro, e três cartas de
   intenção de patrocinadores.
6. Três cotações de auditoria e orçamento de pré-lançamento.
7. Fase 1 do roteiro: o pote na rede de testes.

## 2. Problema e oportunidade

### 2.1 O problema: quem decide o resultado

Todo mercado de previsão precisa de alguém, ou de alguma coisa, que diga qual foi o resultado. É nesse ponto que o
setor acumula as queixas mais documentadas. Três casos mostram os três jeitos de errar; o capítulo 6 descreve cada
concorrente por inteiro.

**Votação.** A Polymarket, a maior plataforma on-chain, usa um oráculo com votação (o UMA). Oráculo é um serviço que
traz para dentro da blockchain um dado de fora dela. No UMA, alguém propõe o resultado deixando uma caução de cerca
de US$ 750; há 2 horas para contestar; se alguém contesta, detentores de um token votam, e o processo leva de 4 a 6
dias (FATO, documentação da Polymarket, 3/out/2026). Em 2026, até maio, mais de 1.150 mercados foram a arbitragem,
mais que em 2025 inteiro, e em cerca de 1 de cada 5 disputas um votante tinha posição no mercado julgado (FATO
SECUNDÁRIO, Wall Street Journal via Finance Magnates, mai/2026). Em março de 2025, um mercado de US$ 7 milhões foi
resolvido como SIM sem o fato ter ocorrido; um detentor votou com 25% dos votos, e não houve reembolso (FATO
SECUNDÁRIO, CoinDesk e outros, mar/2025). O token que dá direito a voto vale US$ 37,5 milhões no total, 99% abaixo
do topo de 2021 (FATO SECUNDÁRIO, CoinGecko, 4/out/2026), e decide mercados muito maiores do que ele. Mesmo onde o
resultado é um preço, houve problema: 821 contas ganharam US$ 8,2 milhões em janelas de liquidação provavelmente
manipuladas nos mercados de Bitcoin de 5 minutos, e 93% do prejuízo caiu sobre o varejo (FATO SECUNDÁRIO, CoinDesk,
ago/2026).

**Chave da empresa.** O World, o mercado de previsão que funciona dentro da carteira Phantom, se apresenta como
automático. Na rede, porém, uma chave da empresa cria os mercados e grava o resultado, e a instrução que grava não
leva prova nem oráculo (FATO SECUNDÁRIO, Chainstack Labs, 11/set/2026). O usuário confia em quem guarda a chave.

**Modelo de linguagem.** No PNP, em Solana, dois modelos de linguagem (Perplexity e Grok) decidem o resultado, com
uma organização de detentores de token de retaguarda, e o criador da pergunta pode nomear uma carteira como juiz
(FATO, documentação do PNP, out/2026).

**Decisão.** O fundador não quer nenhum dos três: "eu quero trabalhar com oráculo, mas um que possa resolver
onchain, diferente das questões abertas de geopolítica que depende um oráculo que claramente pode ser manipulado".

### 2.2 A oportunidade: fatos que a própria rede decide

Parte do que o público de cripto acompanha já está gravada na blockchain: a oferta total de um token, se uma chave
de controle foi abandonada, quanto dinheiro está travado numa pool de negociação. Um leitor on-chain é a parte do
programa que abre uma conta da Solana, lê um número ou uma chave e responde sim ou não, sem ninguém informar nada.
Exemplo: para a pergunta "a oferta do token T cai para 900 milhões até o dia 30?", o leitor de queima lê a oferta do
token e compara com a meta. Não há caução, não há prazo de contestação e não há juiz.

Nenhum dos cinco concorrentes analisados resolve por leitura direta de conta on-chain (INFERÊNCIA sobre os fatos
lidos na análise de concorrentes, out/2026; ver seção 6.7). A mesma análise faz quatro ressalvas, que este plano
adota: o diferencial é real em confiança; é um nicho em tamanho; não é escudo contra manipulação; e pode ser copiado
(ver seção 6.8).

O segundo diferencial vem do primeiro. Nas palavras do fundador: "sendo em oráculo on chain, e possibilitando você
abrir a questão de algo sobre si mesmo, você acaba criando uma forma de marketing". Um projeto que prometeu queimar
parte do próprio token pode patrocinar a pergunta sobre essa queima: o público aposta, a pergunta circula e o
cumprimento da promessa fica provado na rede. Nenhum dos cinco concorrentes vende patrocínio de pergunta com
contrapartida (INFERÊNCIA sobre os fatos lidos, out/2026). O mesmo desenho traz o risco mais sério do plano, que é
quem controla o resultado apostar nele; ele está na seção 3.7.

### 2.3 Por que agora

**A favor.**

- O setor cresceu. Em 30 dias, de 4/set a 3/out/2026, os mercados de previsão somaram US$ 81,8 bilhões em valor de
  face e US$ 21,7 bilhões em dólares pagos (FATO SECUNDÁRIO, DefiRate, out/2026). São duas réguas para a mesma
  atividade, explicadas na seção 5.1; a que se compara com um pote é a segunda. Na Polymarket, em dólares pagos, o
  mês passou de US$ 1,88 bilhão em nov/2025 para US$ 5,95 bilhões em jun/2026 e US$ 4,63 bilhões em set/2026 (FATO
  SECUNDÁRIO, DefiLlama, set/2026).
- O rival mais parecido não lançou. O Melee, também um pote em Solana, captou US$ 3,5 milhões em set/2025 (FATO
  SECUNDÁRIO) e tem 49.247 pessoas na fila de espera (FATO, site do Melee, 4/out/2026), mas ainda não opera com
  dinheiro real: o beta roda em rede de teste (FATO SECUNDÁRIO, fio de usuário republicado pela KuCoin em
  9/set/2026; não é comunicado oficial) **[A confirmar]**.
- Quem tem a melhor distribuição ainda é pequeno. O World fez US$ 15,44 milhões em set/2026 (FATO SECUNDÁRIO,
  DefiLlama, set/2026).

**Contra, com o mesmo peso.**

- O público-alvo encolheu em 2026. A receita diária do pump.fun caiu de US$ 4,8 milhões para US$ 800 mil em seis
  meses, e a taxa de formatura (a parcela dos tokens que vende toda a curva inicial e passa a ser negociada numa
  pool comum) estava em 0,26%, contra cerca de 1,4% no histórico (FATO SECUNDÁRIO, The Block e Dune, jun/2026).
- Plataformas menores perderam quase todo o volume quando o incentivo acabou: Opinion caiu 80,7% e Myriad 93,8% do
  primeiro para o segundo trimestre de 2026 (FATO SECUNDÁRIO, Predictefy, 2026); a Limitless caiu 96% entre maio e
  setembro de 2026 (INFERÊNCIA sobre dados do DefiLlama; causa não encontrada).
- A regulação apertou em 2026, no Brasil e fora dele (ver capítulo 15).

A janela existe se a demanda existir. É essa condição que a seção 2.5 trata.

### 2.4 O que o Baked Market propõe

A proposta cabe em três frases. Um pote simples por pergunta, em que quem acerta divide o dinheiro de quem errou. Um
resultado verificável on-chain, pago em minutos e sem disputa. E o patrocínio de pergunta como segunda trilha de
dinheiro para o pote e como ferramenta de marketing para quem patrocina.

Isso muda o que o programa atual faz. O programa atual responde à pergunta "como pagar alguém para cumprir uma meta
on-chain"; o fundador quer responder a outra: "como deixar o público web3 apostar em fatos que a própria rede
decide".

Tabela 2.1: programa atual contra Baked Market (FATO, briefing do modelo de pote, 3/out/2026).

| | Programa atual | Baked Market |
|---|---|---|
| Quem põe o dinheiro primeiro | O patrocinador, com um orçamento | Os apostadores |
| Preço | SIM a preço fixo, escolhido pelo patrocinador | Não há preço: há a fatia de cada lado no pote |
| Limite de compra | O orçamento limita o SIM subsidiado | Nenhum, por decisão (ver OBJ-22, seção 3.3) |
| Lado NÃO | Só de forma indireta | Aposta direta, igual ao SIM |
| Posição do usuário | Tokens de SIM e de NÃO | Um registro por apostador, sem token |
| Receita | Nenhuma no código | Corte de 3% do pote e patrocínio |

O fundador viu o defeito do modelo antigo ao usar o aplicativo: sem pool de negociação, a "chance" exibida era só o
preço que o patrocinador tinha digitado. As perguntas dele na primeira rodada de ideação apontam o mesmo: por que há
limite de compra, quem fixa os preços e por que criar um token para cada lado.

### 2.5 O que ainda não está provado

A demanda é hipótese, não premissa. O que a pesquisa achou:

- Nenhum mercado aberto sobre queima, renúncia de chave, trava de liquidez ou formatura de tokens de terceiros foi
  encontrado em qualquer plataforma (FATO, ausência em busca limitada, out/2026). O agente que pesquisou fez a
  ressalva: "A ausência pode ser falta de procura ou falta de ferramenta; não dá para distinguir".
- Todos os mercados sobre o pump.fun na Polymarket somaram cerca de US$ 262,81 mil no total, e são sobre o token
  PUMP, não sobre fatos de tokens de terceiros (FATO SECUNDÁRIO, fonte fraca, Cryptorank, sem data) **[A
  confirmar]**.
- Quantas pessoas reais usam o pump.fun por dia, quanto cada carteira aposta e com que frequência: não encontrado em
  nenhuma fonte. Os perfis de usuário da seção 5.4 são hipótese; nenhuma entrevista foi feita.

Uma conta dá a ordem de grandeza. Se o Baked Market capturasse todo o volume que a Polymarket já teve em mercados
ligados ao pump.fun, a taxa de 3% renderia 262.810 × 0,03 = US$ 7.884. Esse é o total, não o valor por mês
(INFERÊNCIA da revisão crítica).

> **Objeção registrada OBJ-01 · severidade crítica**
>
> **Decisão do fundador:** resolução só por dado on-chain, para o público web3 ("queremos pessoal da web3").
>
> **O que a revisão crítica achou:** ninguém demonstrou que esse público quer apostar em fatos lidos on-chain. O
> plano inteiro (finanças, roteiro, tokens) supõe uma demanda que nenhum dado sustenta.
>
> **Evidência:** a pesquisa de público não achou nenhum mercado aberto sobre queima, renúncia, trava ou formatura em
> nenhuma plataforma e escreveu "demanda direta pelo recorte: não demonstrada" (FATO, ausência em busca limitada,
> out/2026).
>
> **Alternativa proposta:** testar antes de reescrever o programa. Dez a quinze conversas com o público-alvo, com a
> pergunta "em qual destas dez perguntas você poria 20 dólares hoje?"; um beta com pontuação e sem dinheiro, usando
> os leitores que já existem, para medir quais tipos de pergunta atraem carteiras; depois, quatro semanas de potes
> com teto baixo. O critério de continuar ou parar é escrito antes do teste.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

## 3. O produto

### 3.1 As três trilhas de dinheiro

**Decisão.** Cada pergunta tem uma pool (pote), e o mesmo pote recebe dinheiro por três trilhas: as apostas, o
patrocinador e o token.

**Primeira trilha: as apostas.** Qualquer carteira põe um valor no lado SIM ou no lado NÃO. Aposta é o valor que uma
carteira põe num lado; fica registrado em nome dela. É a trilha principal: sem ela não há pote.

**Segunda trilha: o patrocinador.** É quem paga uma das três faixas (US$ 500, 1.500 ou 5.000) para pôr dinheiro
numa pergunta e receber contrapartidas de visibilidade. O produto do patrocínio está na seção 3.7; a conta de quanto
vai para a banca e quanto vai para o pote, na seção 7.4.

**Terceira trilha: o token.** O plano tem dois tokens. O primeiro é lançado no pump.fun, como marketing. O segundo é
desenhado pela empresa e vendido numa venda privada ("ICO privado", nas palavras do fundador). A ideia de que parte
do dinheiro do token alimente os potes vale para o segundo: "isso só vamos conseguir fazer com base em nosso próprio
token ico privado". Tudo sobre os tokens está no capítulo 8.

O que o produto **não** tem, também por decisão:

- **Tokens de SIM e de NÃO.** "o que precisamos fazer é o registro do voto por dinheiro comprado por cada votante, e
  apenas isso". A posição do apostador é um registro dentro do programa, não um token que circula.
- **Preço travado.** "Sem preço travado, vamos trabalhar com o que é 'normal' do mercado, e pensar em um ou dois
  diferenciais". O apostador não compra a um preço; ele entra numa divisão.
- **Rendimento do pote.** "esquece o rendimento do pote, vamos abandonar isso, não serve de nada." O dinheiro fica
  parado no cofre até a resolução.

**Decisão.** A moeda é o USDC, a moeda digital que vale 1 dólar: "A moeda vai ser usdc, vamos abandonar a ideia de
sol." Apostar 100 USDC é apostar 100 dólares.

### 3.2 O ciclo de uma pergunta

Pergunta é uma frase com resposta SIM ou NÃO, uma data final e uma regra de como se decide. Exemplo: "A oferta do
token T cai para 900 milhões até o dia 30?".

**Decisão.** Há dois ciclos de pergunta. "na realidade existem dois ciclos de perguntas, a primeira é da equipe
montando as perguntas". No primeiro, a equipe abre a pergunta por conta própria: "vamos deixar que a equipe abra as
perguntas". No segundo, um patrocinador pede uma pergunta.

Os passos do primeiro ciclo:

1. **Abertura.** A equipe escolhe um tipo de pergunta do cardápio (seção 4.5), a conta da Solana que será lida, a
   meta, a data final e a data de fechamento das apostas. O programa confere, já na criação, se aquela conta serve
   para aquele tipo de pergunta.
2. **Apostas.** Qualquer carteira aposta em SIM ou em NÃO, quantas vezes quiser. O programa guarda o total de cada
   lado e quanto cada apostador pôs em cada lado.
3. **Fechamento.** As apostas param na data de fechamento (seção 3.5), ou antes, no instante em que o fato acontece.
4. **Resolução.** Alguém aciona a leitura; o programa lê a rede e grava o resultado, de forma definitiva (capítulo
   4). **Decisão:** a pergunta pode ser resolvida antes da data: "Se acontecer algo antes da data marcada, ela pode
   sim se resolver."
5. **Resgate.** Quem acertou retira a sua parte do pote, já descontada a taxa.

No segundo ciclo, o patrocinador pede a pergunta e deixa o pagamento travado. **Decisão:** "ele pode solicitar uma
pergunta, e travar o pagamento até a nossa equipe revisar ... se for recusado devolve a grana travada." Aceita a
pergunta, ela segue os mesmos cinco passos. O patrocinador também pode entrar numa pergunta que a equipe já abriu.

A revisão técnica propõe três regras para o pedido travado, que não mudam a decisão e evitam dinheiro preso
(proposta, não decidida): o aceite abre a pergunta e aplica o dinheiro na mesma transação, ou não acontece; a recusa
só libera o saque, e quem saca é o próprio patrocinador; e, se a equipe não responder em 14 dias, o patrocinador
cancela sozinho e recupera tudo.

O público participa de outro jeito: sugere perguntas pelo X (seção 3.8).

**Em aberto.** O fundador disse: "acho justo que quem criar possa ganhar uma parte da pergunta." Hoje só a equipe
cria; a regra para quem sugere ou pede não foi definida (ver seção 16.1).

### 3.3 A conta do pote

Pote é o cofre de uma pergunta: todas as apostas entram nele e, no fim, quem acertou divide o que sobrou depois da
taxa. Ele existe porque dispensa duas coisas que os líderes do setor precisam ter: alguém vendendo a um preço e
profissionais oferecendo liquidez. No pote, o prêmio de quem acerta é o dinheiro de quem errou.

O exemplo-base deste plano, usado em todos os capítulos (conta sobre as decisões do fundador):

| | Lado SIM | Lado NÃO |
|---|---|---|
| Apostado | 300 USDC | 700 USDC |
| Chance mostrada na tela (fatia do pote) | 30% | 70% |
| Pote total | 1.000 | 1.000 |
| Taxa de 3% | 30 | 30 |
| Sobra para quem acertar | 970 | 970 |
| Se este lado ganhar, cada 1 USDC recebe | 970 ÷ 300 = 3,23 | 970 ÷ 700 = 1,39 |
| Quem apostou 100 recebe | 323,33 | 138,57 |

Dois termos saem daí. **Chance** é a fatia do pote que está em cada lado, mostrada na tela; não é preço nem
probabilidade garantida. **Retorno** é quanto cada 1 USDC apostado recebe se o lado ganhar.

Duas consequências precisam estar na tela antes de a pessoa assinar.

**O retorno só fica definido quando as apostas fecham.** No pote do exemplo, entram mais 700 no SIM. O pote passa a
1.700, sobram 1.649 depois da taxa, e cada 1 USDC do SIM passa a receber 1.649 ÷ 1.000 = 1,65. Antes eram 3,23.
Quem apostou vendo 3,23 não tem esse número garantido (INFERÊNCIA, conta conferida).

**Uma aposta grande baixa o retorno do próprio lado.** Um pote com 5.000 de cada lado paga 1,94 por dólar. Quem põe
10.000 no SIM faz o pote ir a 20.000 e o SIM passar a pagar 0,97 × 20.000 ÷ 15.000 = 1,29 (INFERÊNCIA, conta
conferida). O apostador grande derruba o próprio prêmio.

A revisão de produto propõe que a tela mostre o retorno como "estimativa", sempre depois da taxa, e que o usuário
informe na própria transação o pior retorno que aceita.

**Decisão.** O pote não tem limite de compra. A revisão crítica pede um limite de segurança:

> **Objeção registrada OBJ-22 · severidade alta**
>
> **Decisão do fundador:** pote "sem limite de compra".
>
> **O que a revisão crítica achou:** toda pergunta precisa de um teto de pote, isto é, um valor máximo que a
> pergunta aceita, fixado na criação, para o prêmio nunca valer mais que o custo de forçar o resultado.
>
> **Evidência:** quem consegue forçar o resultado ganha, no máximo, o pote do lado oposto. Onde forçar é barato, um
> pote grande é convite: completar a curva de um token do pump.fun nos últimos 10% custa 2,16 SOL (FATO, medição do
> sócio técnico, citada no relatório técnico de out/2026).
>
> **Alternativa proposta:** aceitar o teto como regra de segurança e dizer que "sem limite" vale abaixo do teto.
> Teto por pergunta (por exemplo, uma pergunta de queima com teto de 5.000 USDC) e teto total do programa no período
> inicial.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.4 Pote de um lado só

Pote de um lado só é a pergunta em que só um lado recebeu apostas. Não há perdedor para pagar o vencedor.

**Decisão.** Nesse caso o pote devolve as apostas, cobrando a taxa: "Podemos devolver cobrando taxa, sim. A banca
nunca perde, e nem a igreja faz caridade sem cobrar."

Exemplo (conta conferida): Ana põe 100 no SIM e ninguém aposta no NÃO. Ela recebe 97. Em escala maior: dez pessoas
põem 2.000 no SIM e ninguém entra no NÃO. A taxa é de 60 (15 para cada uma das quatro parcelas) e cada dólar
apostado volta como 0,97.

A decisão cobre o caso simples. Com prêmio de patrocinador e com penalidades de saída dentro do pote, sobram casos
sem regra, e caso sem regra num programa é dinheiro preso. A tabela abaixo é a proposta da revisão técnica.

**Em aberto.** O fundador precisa decidir as quatro linhas (ver seção 16.1).

| Caso | Proposta |
|---|---|
| Só o lado vencedor tem apostas | Devolve menos a taxa; prêmio neutro e penalidades vão a esses vencedores |
| Só o lado perdedor tem apostas (ninguém acertou) | Devolve menos a taxa; o prêmio neutro volta ao patrocinador; as penalidades vão ao fundo de prêmios |
| Ninguém apostou e há prêmio neutro | O prêmio volta ao patrocinador |
| O lado vencedor ficou vazio porque todos saíram antes | Igual à segunda linha |

Prêmio neutro é o dinheiro que o patrocinador soma ao pote sem escolher lado (seção 3.7). Penalidade é a parte da
aposta que quem sai antes deixa para trás (seção 3.6). Fundo de prêmios é a reserva da banca, alimentada por 25% da
taxa (seção 7.5).

> **Objeção registrada OBJ-08 · severidade alta**
>
> **Decisão do fundador:** pote de um lado só devolve cobrando taxa.
>
> **O que a revisão crítica achou:** a taxa pune o primeiro apostador, que é quem o lançamento mais precisa. Quem
> entende a regra espera os outros entrarem; se todos esperam, o pote fica vazio.
>
> **Evidência:** cem potes de US$ 200 de um lado só rendem US$ 150 à operação (100 × 200 × 3% × 25%; INFERÊNCIA). E
> a referência de mercado dos 3%, o PancakeSwap Prediction, devolve 100% na rodada cancelada, sem taxa (FATO,
> documentação).
>
> **Alternativa proposta:** manter a cobrança com valor reduzido (1% ou um valor fixo pequeno), ou zero durante o
> lançamento; e decidir a tabela completa dos casos de um lado só.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.5 Fechamento das apostas

Fechamento é o momento em que as apostas param, antes da data final, para ninguém entrar já sabendo o resultado.

**Por que um pote precisa fechar antes.** Numa bolsa, quem compra tarde paga caro. Num pote não há preço: quem entra
no último minuto recebe o mesmo retorno de quem arriscou desde o primeiro dia, e dilui essa pessoa. Exemplo
(INFERÊNCIA, conta conferida): o pote tem 500 no SIM e 500 no NÃO; falta uma hora e o fato não aconteceu, então o
NÃO é quase certo. Quem está no NÃO desde o começo receberia 1,94 por dólar. Um oportunista põe 5.000 no NÃO. Ele
recebe 5.290,91, um lucro de 290,91 quase sem risco, e os apostadores antigos do NÃO passam a receber 1,058 por
dólar. Quem correu o risco ficou com as sobras.

**Decisão.** As apostas fecham quando passam 80% da duração da pergunta, e nunca menos de 24 horas antes da data
final. Uma pergunta de 30 dias fecha no dia 24. Prazo menor que 24 horas só como "opção avançada", "com um double
cheque para confirmar e log da operação de quem aprovou".

O programa atual já ajuda num ponto: nas perguntas de fato irreversível, as apostas travam sozinhas no instante em
que o fato acontece. O fechamento por data cuida do outro lado, o NÃO ficando certo conforme o prazo acaba.

**Como a opção avançada pode funcionar** (proposta técnica): a pergunta com fechamento curto só é criada com duas
assinaturas de pessoas diferentes da equipe; quem aprovou fica gravado na própria pergunta e num evento on-chain; e
a tela mostra um selo "fechamento curto". Um detalhe pesa aqui: o programa atual mede prazo em blocos da rede, cujo
tempo varia (235 milissegundos medidos na rede de testes, contra 400 nominais; FATO, repositório). Uma regra de "24
horas" pede relógio de verdade, e o programa novo deve guardar data e hora.

**Em aberto.** Sobre perguntas longas, o fundador disse: "ainda temos que pensar para acima de 2-3 meses se 80% não
é muito longo, e pode ser gradual." Numa pergunta de 180 dias, a regra dos 80% deixa 36 dias sem apostas. A pesquisa
técnica propõe, para essas perguntas e para uma fase posterior, dois marcos no lugar de um:

- **T1**, o fim das apostas livres: quando faltam 20% da duração, limitado a no máximo 14 dias antes do fim.
- **T2**, o fechamento total: quando faltam 5% da duração, com mínimo de 24 horas e máximo de 7 dias.

Entre T1 e T2 ainda se aposta, mas cada lado só pode crescer 25% sobre o tamanho que tinha em T1, e ninguém sai.

| Duração | Regra decidida (80%): fecha no dia | Dias fechados pela regra decidida | T1 | T2 | Dias fechados na proposta |
|---|---|---|---|---|---|
| 7 dias | 5,6 | 1,4 | dia 5,6 | dia 6,0 | 1,0 |
| 30 dias | 24,0 | 6,0 | dia 24,0 | dia 28,5 | 1,5 |
| 90 dias | 72,0 | 18,0 | dia 76,0 | dia 85,5 | 4,5 |
| 180 dias | 144,0 | 36,0 | dia 166,0 | dia 173,0 | 7,0 |

Para perguntas de até 70 dias, T1 cai exatamente nos 80% decididos. Com o teto de 25%, o oportunista do exemplo
acima só consegue pôr 125 no NÃO, e os apostadores antigos recebem 1,746 em vez de 1,058 (INFERÊNCIA, conta
conferida). A revisão de segurança discorda dessa proposta para a primeira versão, porque o teto cria uma corrida de
robôs para ocupá-lo. A discordância está na caixa abaixo.

> **Objeção registrada OBJ-21 · severidade alta**
>
> **Decisão do fundador:** fechamento a 80% da duração, com mínimo de 24 horas; a regra para perguntas longas está
> em aberto.
>
> **O que a revisão crítica achou:** o mínimo de 24 horas trava as perguntas curtas, que são o que esse público
> aposta; e perguntas longas não cabem na primeira versão.
>
> **Evidência:** concorrentes operam perguntas de preço de cripto com prazos de 5 minutos a 1 semana (FATO,
> documentação dos concorrentes, out/2026). Com 24 horas fechadas, uma pergunta de dois dias fica um dia aberta e
> um dia parada, e uma pergunta de um dia só existe pela opção avançada, com duas assinaturas a cada vez.
>
> **Alternativa proposta:** aprovar uma vez, por duas chaves, um modelo de série curta (por exemplo, "o SOL toca X
> em 24 horas") e deixar o serviço abrir as rodadas; na primeira versão, um fechamento só e perguntas de até 30
> dias; a regra gradual dos dois marcos fica para as perguntas longas, depois.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.6 Saída antecipada

Saída antecipada é desistir da aposta antes da resolução e receber parte do dinheiro de volta. A parte que fica para
trás é a penalidade.

**Decisão.** A saída entra na primeira versão: "saída antes da resolução, vamos fazer agora no mvp." A forma: "a
pessoa pode sair antes com ganho proporcional menor, ou perca proporcional maior, deixando uma penalidade pro pote."

**O que os outros fazem** (FATO, documentação de cada um, lida em out/2026):

| Onde | Dá para sair antes? | Como |
|---|---|---|
| PancakeSwap Prediction, corridas de cavalo, Melee (versão alfa) | Não | Quem entrou fica até o fim |
| Melee (modelo novo) | Sim | Um cofre separado, de investidores, compra a posição com desconto |
| Casas de aposta | Sim | A própria casa recompra a aposta |
| Polymarket, Kalshi, Limitless | Sim | Vende-se a posição a outro usuário |

Em todos os casos, sair significa alguém assumir o lugar de quem sai. Um pote que devolve dinheiro do próprio cofre,
cobrando penalidade, não apareceu em nenhum precedente (FATO do agente de pesquisa: ausência em pesquisa, out/2026).
O desenho do fundador é novo, e por isso os números abaixo não têm referência de mercado.

**Por que uma penalidade fixa não basta.** O prêmio de quem acerta é o dinheiro de quem errou. Se quem errou pode
pegar o dinheiro de volta quando percebe que vai perder, o prêmio some. No pote de 300 no SIM e 700 no NÃO, o NÃO
receberia 1,386 por dólar se ninguém saísse. Se todo o SIM sai pagando penalidade fixa (INFERÊNCIA, conta
conferida):

| Penalidade fixa | Retorno do NÃO se todo o SIM sair |
|---|---|
| 5% | 0,991: quem acertou perde dinheiro |
| 10% | 1,012 |
| 20% | 1,053 |
| 30% | 1,095 |
| 50% | 1,178 |

**A fórmula proposta.** A pesquisa técnica propõe uma penalidade que cresce com o tempo e com a queda da chance do
lado de quem sai (INFERÊNCIA; os parâmetros não têm referência de mercado e dependem de simulação) **[A
confirmar]**:

```text
devolução   = aposta × (1 − penalidade)
penalidade  = mínimo( 90% ,  5%  +  20% × tempo  +  queda )
tempo       = fração já decorrida da janela de saída (0 na abertura, 1 quando a saída fecha)
queda       = 1 − chance do seu lado na saída ÷ chance do seu lado na sua entrada   (zero se a chance subiu)
```

Em palavras: os 5% fixos são um pedágio, para ninguém entrar e sair de graça. O tempo encarece a saída conforme o
fim se aproxima, porque a saída tardia é a mais informada. A queda cobra de quem sai o estrago que a própria saída
faz na chance do lado dele. A saída fecha junto com as apostas e trava no instante em que o fato acontece.

Exemplos, no pote de 300 no SIM e 700 no NÃO (INFERÊNCIA, contas conferidas):

| Situação | Tempo | Queda | Penalidade | Recebe de cada 100 |
|---|---|---|---|---|
| Aposta pequena (10 dos 300) sai cedo | 25% | 1,2% | 11,2% | 88,83 |
| Ana (100 dos 300) sai cedo | 25% | 12,3% | 22,3% | 77,72 |
| Ana sai na metade da janela | 50% | 12,3% | 27,3% | 72,72 |
| Ana sai quase no fim da janela | 90% | 12,3% | 35,3% | 64,72 |
| A chance do lado dela subiu, sai na metade | 50% | 0 | 15,0% | 85,00 |

A Ana paga 12,3% de queda sem notícia nenhuma porque ela é um terço do lado: a saída dela, sozinha, derruba a
chance do SIM. Quem é pequeno paga quase só o pedágio e o tempo.

**O que a tela mostra.** O valor antes de assinar: "Sair agora devolve 77,72 dos seus 100,00. Penalidade de 22,3%."
O número muda a cada dia e a cada aposta alheia, e por isso a transação leva o valor mínimo que o usuário aceita.

**O que a fórmula não resolve.** Numa fuga em massa, sobra de cerca de um terço a 63% do prêmio, conforme a ordem em
que as pessoas entraram (INFERÊNCIA). Quando uma aposta muito grande entra contra um apostador, a penalidade dele
pode ir a 80% ou 90% sem que ele tenha feito nada. E há um furo de segurança no destino da penalidade, tratado na
seção 11.6 junto com a fórmula revista (piso de 10%, penalidade marcada por lado, espera mínima em horas).

**Em aberto.** A banca cobra os 3% também sobre o valor devolvido a quem sai? O modelo financeiro supõe que não
(ver seção 9.2).

> **Objeção registrada OBJ-04 · severidade crítica**
>
> **Decisão do fundador:** saída antecipada na primeira versão.
>
> **O que a revisão crítica achou:** a saída é a peça mais nova e mais perigosa do programa e não deve nascer ligada
> em todas as perguntas.
>
> **Evidência:** não há precedente de pote que devolva dinheiro a quem sai; os parâmetros da fórmula não têm
> referência de mercado; e a revisão no papel já achou seis furos antes de qualquer simulação (INFERÊNCIA, revisão
> técnica e de segurança, out/2026).
>
> **Alternativa proposta:** escrever e testar a saída na primeira versão, mas com uma chave por pergunta, que nasce
> desligada. Ligar pergunta a pergunta, começando por potes pequenos, depois de simulação com apostadores
> estratégicos e de revisão externa dessa instrução.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

> **Objeção registrada OBJ-06 · severidade alta**
>
> **Decisão do fundador:** quem sai antes pode sair "com ganho proporcional menor".
>
> **O que a revisão crítica achou:** num pote puro não existe ganho para realizar antes do fim. A fórmula proposta
> entrega a "perca proporcional maior" e a "penalidade pro pote"; o ganho, não.
>
> **Evidência:** quando o lado fica mais provável, o prêmio dele encolhe na mesma medida. Com o pote em 300 no SIM e
> 700 no NÃO, uma aposta de 100 no SIM "vale" 30% × 323 = 97. Entra dinheiro no SIM e o pote vai a 600 e 700: a
> chance sobe para 46%, o retorno cai para 2,10 e a aposta "vale" 46% × 210 = 97 (INFERÊNCIA, conta conferida).
>
> **Alternativa proposta:** na primeira versão, saída só com devolução e penalidade, dito na tela que ela nunca dá
> lucro. O ganho na saída fica para uma fase posterior, pela venda da posição a outra pessoa, que é o que os
> precedentes fazem.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.7 O patrocinador

Patrocinador é quem paga uma das três faixas para pôr dinheiro numa pergunta e receber contrapartidas.

O próprio fundador começou em dúvida ("sigo com a dúvida se há necessidade de um sponsor, e se sim, para qual
razão?") e respondeu a ela ao longo da ideação: o patrocinador põe prêmio no pote ("Assim você até provocava um
aumento da tvl da pool") e usa a pergunta como marketing de si mesmo. O produto, nas palavras dele, "segue sendo um
mercado para negociar probabilidade, mas mascarado com esse marketing de fomo como ferramenta da própria empresa."

**Decisões.**

- Três faixas: US$ 500, US$ 1.500 e US$ 5.000.
- O patrocinador pode pedir uma pergunta, com o pagamento travado (seção 3.2), ou entrar numa pergunta já aberta
  pela equipe.
- Ele escolhe entre duas formas: prêmio neutro ou aposta de patrocinador.
- Pode ficar anônimo, e o anônimo escolhe qualquer das duas formas: "o patrocinador anônimo pode escolher uma das
  duas formas, sim."
- Recebe contrapartidas. As listadas (selo, destaque, posição fixa, pote mínimo garantido, texto na pergunta,
  publicação no X) "são aceitáveis".
- A página inicial pode ser organizada por patrocínio: "a curadoria pode ser por situação de destaque e/ou pump de
  marketing via sponsor".

**Em aberto.** A divisão do valor pago. A frase do fundador foi: "70/30 dessa grana vai pra banca e a outra parte
pra liquidez como neutra ou aposta de patrocinador". Não ficou dito se os 70% são da banca ou do pote. Este plano
mostra os dois sentidos em toda conta (aritmética direta):

| Faixa | Sentido A: banca | Sentido A: pote | Sentido B: banca | Sentido B: pote |
|---|---|---|---|---|
| US$ 500 | 350 | 150 | 150 | 350 |
| US$ 1.500 | 1.050 | 450 | 450 | 1.050 |
| US$ 5.000 | 3.500 | 1.500 | 1.500 | 3.500 |

A receita de cada sentido e os preços que o mercado pratica por visibilidade estão na seção 7.4.

**As duas formas, com números.** O pote de exemplo do patrocínio tem US$ 10.000 em apostas, 6.000 no SIM e 4.000 no
NÃO. Sem patrocinador, o SIM paga 1,617 por dólar e o NÃO, 2,425.

- **Prêmio neutro** é dinheiro somado ao pote sem escolher lado; aumenta o retorno de quem acertar, qualquer que
  seja o resultado. Com 1.050 de prêmio (a faixa de US$ 1.500 no sentido B), o SIM passa a pagar 1,786 e o NÃO,
  2,680 (INFERÊNCIA, conta conferida). Os dois lados ganham.
- **Aposta de patrocinador** é o dinheiro entrando num lado, como uma aposta grande, com selo. O efeito é outro. Num
  pote com 1.000 em cada lado, cada lado paga 1,94. Se o patrocinador põe 5.000 no SIM, o pote vai a 7.000, sobram
  6.790, o SIM passa a pagar 1,13 e o NÃO, 6,79. No pote de 10.000, uma aposta de 3.500 no SIM (a faixa de US$ 5.000
  no sentido B) faz o SIM pagar 1,378 em vez de 1,617, e, se der SIM, o patrocinador recebe 4.824 de volta
  (INFERÊNCIA, contas conferidas).

A leitura da pesquisa: quem apostou no mesmo lado do patrocinador ganha menos, e o patrocinador que acerta recupera
quase tudo (pagou 5.000 e recebeu 4.824). Isso é uma aposta com selo, não um prêmio. As contas supõem que a taxa de
3% incide também sobre o dinheiro do patrocinador que entra no pote, o que não foi decidido.

**Contrapartidas por faixa** (proposta da pesquisa de monetização; prazos e quantidades não foram decididos):

| | Faixa 1: US$ 500 | Faixa 2: US$ 1.500 | Faixa 3: US$ 5.000 |
|---|---|---|---|
| Pergunta | Entra numa já aberta | Entra ou pede uma, sujeita a aprovação | Pede pergunta sob medida, sujeita a aprovação |
| Selo "Patrocinado por X" (ou "Anônimo") | Sim | Sim | Sim |
| Texto na pergunta | Nome e link | Nome, link e uma frase | Nome, link, frase e imagem |
| Destaque na página inicial | Não | 72 horas | Posição fixa no topo durante a janela de apostas |
| Publicação no X, rotulada como parceria paga | 1 | 2 | 4 e fio de resultado |
| Relatório ao fim | Não | Volume e número de carteiras | Volume, carteiras, impressões e cliques |

**Anônimo e quem controla o resultado.** "Anônimo" é a palavra da decisão; o que a ferramenta de privacidade de fato
esconde está na seção 3.9. Sobre quem controla o resultado apostar, o fundador respondeu "Sim e não", e esclareceu:
"O sim e o não é a resposta à pergunta que foi criada e diz respeito a n empresa ... sobre qualquer coisa que seja
verificável onchain." Perguntado se quem coloca prêmio pode apostar: "Sim." **Decisão:** não há proibição.

> **Objeção registrada OBJ-02 · severidade crítica**
>
> **Decisão do fundador:** o patrocinador pode ficar anônimo, escolhe qualquer das duas formas, e quem controla o
> resultado da pergunta não é impedido de apostar.
>
> **O que a revisão crítica achou:** anônimo, que controla o resultado e aposta num lado, é a combinação que os
> líderes do setor proíbem. É informação privilegiada oferecida como produto.
>
> **Evidência:** Polymarket e Kalshi proíbem por escrito que negocie quem pode influenciar o resultado (FATO, regras
> de integridade das duas plataformas, 2026). Exemplo com números (INFERÊNCIA, conta conferida): a equipe de um
> token pede a pergunta "o token X queima 10% da oferta até o dia 30?" e decide sozinha se queima. O público põe
> 1.000 no SIM e 1.000 no NÃO. O patrocinador, anônimo, põe 5.000 no NÃO e não queima. O pote é de 7.000; a taxa,
> 210; sobram 6.790 para os 6.000 do NÃO. O patrocinador recebe 5.658: lucro de 658, tirado de quem apostou no SIM.
>
> **Alternativa proposta:** da mais leve à mais dura. (1) Anônimo para o público e identificado para a equipe. (2)
> Declaração assinada pela carteira de que o patrocinador não controla a conta lida pela pergunta. (3) Aviso na
> pergunta: "o patrocinador pode controlar o resultado e pode ter apostado". (4) Anônimo só com prêmio neutro. (5)
> Aposta de lado só em perguntas que ninguém controla, como preço de ativo grande. (6) Regra pública de que a
> equipe não aposta.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.8 Sugestões pelo X

**Decisão.** O público sugere perguntas pelo X. O site terá uma página com "um monitor vindo do X, e orientação da
galera como eles podem fazer para fazer as sugestões".

Há duas formas de trazer o X para o site, com custos diferentes. Embutir uma linha do tempo (de um perfil ou de uma
lista) é gratuito. Ler por programa as publicações que mencionam a marca custa US$ 0,005 por publicação lida (FATO,
documentação do X, 3/out/2026). A segunda forma tem custo que cresce com o barulho: mil menções lidas custam
US$ 5 (1.000 × 0,005), e alguém que inunde a marca de menções faz a conta subir.

A revisão de segurança propõe três regras (proposta): a página mostra uma lista escolhida pela equipe, nunca menção
automática, porque conteúdo de terceiros traz golpes e links; a página de sugestões fica separada da página em que a
carteira assina a aposta; e nenhuma sugestão vira pergunta sem revisão humana, o que já é a decisão (a equipe abre
as perguntas).

### 3.9 Outras redes e privacidade

**Decisão.** Para receber dinheiro de outras blockchains, o SODAX ("o nome da empresa é sodax -
https://www.sodax.com"). Para o pagador anônimo, o Cloak: "a gente usa a Cloak para esconder o pagador."

**SODAX**, em linguagem simples: um serviço que traz dinheiro de outras blockchains e entrega USDC na carteira da
pessoa em Solana. Quem tem dinheiro na rede Base chega com USDC em Solana pagando 0,1%. Ele só existe na rede
principal e não aciona o programa de apostas: entrega o dinheiro na carteira, e a aposta é um segundo passo (FATO e
FATO SECUNDÁRIO, documentação do SODAX, 3/out/2026).

**Cloak**, em linguagem simples: um serviço de privacidade em Solana que esconde quem pagou a quem. O patrocinador
deposita, saca para uma carteira nova e patrocina com ela. O depósito é grátis e o saque custa 0,3% mais 0,45 USDC;
só existe na rede principal; o relatório de auditoria não foi publicado (FATO e FATO SECUNDÁRIO, documentação do
Cloak, 3/out/2026).

O limite do Cloak é de tamanho. Esconder um pagamento depende de haver muitos outros parecidos em volta. Segundo o
plano de privacidade do sócio técnico, o cofre de USDC do Cloak tinha cerca de 2.560 USDC e cerca de 50 operações
por dia (FATO SECUNDÁRIO) **[A confirmar: tamanho atual]**. Um patrocínio de 500 é um quinto desse cofre; o de
1.500, mais da metade; o de 5.000, quase o dobro (INFERÊNCIA). Um valor desses entra e sai sozinho, e fica fácil
de ligar as duas pontas.

> **Objeção registrada OBJ-23 · severidade alta**
>
> **Decisão do fundador:** usar o SODAX para outras redes e o Cloak para o pagador anônimo.
>
> **O que a revisão crítica achou:** integrados ao site, os dois põem código de terceiros na página em que a
> carteira assina; e o Cloak não esconde um patrocínio grande.
>
> **Evidência:** o cofre de USDC do Cloak tinha cerca de 2.560 USDC, e um patrocínio de 5.000 é quase o dobro disso
> (FATO SECUNDÁRIO, plano de privacidade do sócio; a comparação é INFERÊNCIA). Os dois serviços só existem na rede
> principal, o que obriga a testar a integração com dinheiro real.
>
> **Alternativa proposta:** na primeira versão, orientação em vez de integração. O patrocinador usa o Cloak por
> conta própria e chega com uma carteira nova; o SODAX fica numa página separada, "Trazer dinheiro de outra rede";
> e a tela diz "pagador não divulgado", não "anônimo".
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 3.10 Nome, mascote e layout

**Decisão.** "Baked Market, já temos mascote, inclusive." O mascote se chama Baked. O layout aprovado é o Ledger² no
escuro, com tema claro (a direção N do laboratório de protótipos).

O nome segue o padrão do setor, que é "uma palavra + Markets": Hedgehog Markets, Melee Markets, Triad Markets,
Myriad Markets, Manifold Markets. Os maiores usam uma palavra só: Polymarket, Kalshi, Limitless (FATO, pesquisa de
nome, 2/out/2026). A mesma pesquisa registrou os riscos da palavra "baked": o código de negociação `BAKED` já é
usado por terceiros, a palavra tem a gíria de "chapado", e há vizinhança com outros projetos de nome parecido.

Três pontos ficam registrados **[A confirmar]**:

- **Singular ou plural.** A pesquisa de nome foi feita com "Baked Markets". O fundador escreveu "Baked Market", e a
  pergunta sobre o singular ficou sem resposta. Este plano usa o singular.
- **Marca.** Nenhuma base de marcas foi consultada; só busca na web.
- **Documento de design.** O documento de direção de design do repositório ainda descreve outra direção visual
  ("Tape"). Vale a decisão acima, e o documento precisa ser reescrito.

> **Objeção registrada OBJ-28 · severidade baixa**
>
> **Decisão do fundador:** o nome é Baked Market.
>
> **O que a revisão crítica achou:** "baked" tem a gíria de "chapado" e, em inglês de mercado, "baked in" quer dizer
> "já decidido de antemão". É uma leitura ruim para uma casa cujo maior risco é resultado arranjado.
>
> **Evidência:** a pesquisa de nome já registrava a gíria e o código `BAKED` em uso por terceiros (FATO, pesquisa de
> nome, 2/out/2026); a leitura de "baked in" é INFERÊNCIA da revisão; nenhuma base de marcas foi consultada.
>
> **Alternativa proposta:** manter o nome e usar a leitura a favor: o resultado está "assado" na rede e qualquer um
> confere. Só funciona se a OBJ-02 for resolvida.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

## 4. Perguntas e resolução on-chain

O fundador disse, sobre a primeira explicação dos tipos de pergunta, que não tinha entendido nada e que faltaram
contexto e explicação. Este capítulo é a segunda tentativa. Cada tipo vem com uma frase sobre o que ele pergunta e
uma pergunta de exemplo.

### 4.1 O que é resolver lendo a rede

Resolução é o ato de gravar o resultado da pergunta, de forma definitiva. No Baked Market ela funciona assim:

1. Cada pergunta é criada apontando para uma conta da Solana. Conta é o lugar em que a rede guarda um dado: o
   registro de um token, o saldo de um cofre, o estado de uma pool.
2. Quando alguém aperta "Resolver", o programa abre essa conta, lê um número ou uma chave e compara com a meta.
3. Se a meta foi cumprida, grava SIM. Se a data final passou sem a meta, grava NÃO. Não há terceira pessoa
   informando nada.

Qualquer pessoa pode apertar o botão: o apostador, a equipe ou um desconhecido. O resultado é o mesmo, porque sai do
dado e não de quem apertou. O custo é a taxa da rede: 0,000005 SOL por resolução, de modo que mil resoluções custam
0,005 SOL (FATO, relatório técnico de out/2026; a soma é INFERÊNCIA). SOL é a moeda da rede Solana.

**Decisão.** A pergunta pode ser resolvida antes da data: "Se acontecer algo antes da data marcada, ela pode sim se
resolver." Se a queima prometida acontece no dia 10, a pergunta pode pagar no dia 10.

Compare com o que os concorrentes fazem (detalhes na seção 6.7):

- Na Polymarket, alguém propõe o resultado e, se houver contestação, detentores de um token votam; leva de 4 a 6
  dias (FATO, documentação, 3/out/2026).
- No World, uma chave da empresa grava o resultado (FATO SECUNDÁRIO, Chainstack Labs, 11/set/2026).
- No PNP, dois modelos de linguagem decidem (FATO, documentação, out/2026).

### 4.2 Os nove tipos de pergunta prontos e as três famílias

O programa atual já sabe ler nove tipos de fato (FATO, repositório). O sócio técnico só aceitou fatos de duas
espécies: os que não voltam atrás (o que foi queimado está queimado) e os que são uma foto tirada numa data.

Algumas palavras, antes da tabela. **Queima** é destruir tokens para sempre, reduzindo a oferta. **Renúncia de
autoridade** é o dono de uma chave abrir mão, para sempre, de um poder: o de criar tokens novos, o de congelar
carteiras ou o de alterar um programa. **Liquidez travada** é dinheiro posto numa pool de negociação e travado para
sempre, para o token sempre poder ser trocado. **Validador** é um computador que confirma as transações da rede, e
**stake** é o SOL que as pessoas confiam a ele. **Época** é o "dia" da Solana para contas de stake; dura cerca de
dois dias.

| # | Tipo | O que pergunta | Pergunta de exemplo | Quem controla o resultado |
|---|---|---|---|---|
| 1 | Queima de oferta | A quantidade total do token cai até um número? | "A oferta do token T cai para 900 milhões até 31 de dezembro?" | Qualquer um que tenha o token e o queime. Custa dinheiro: o token queimado some |
| 2 | Renúncia de emissão | O time abre mão do poder de criar tokens novos? | "O time do projeto P renuncia à emissão do token até o fim do mês?" | Só quem tem a chave de emissão. Custo zero |
| 3 | Renúncia de congelamento | O time abre mão do poder de congelar a carteira dos outros? | "O token T fica sem autoridade de congelamento até o dia 30?" | Só quem tem a chave. Custo zero |
| 4 | Programa imutável | O código de um programa fica travado, sem atualização possível? | "O protocolo P torna o programa imutável até o dia 30?" | Só quem tem a chave de atualização. Custo zero |
| 5 | Tokens travados | Uma quantidade do token foi mandada para um cofre de onde ninguém tira? | "Pelo menos X tokens da pool P ficam travados para sempre até o dia 30?" | Qualquer um que tenha os tokens. Custa dinheiro: ficam presos |
| 6 | Stake de validador | Um validador tem pelo menos X SOL confiados a ele numa época? | "O validador V entra na época E com X SOL ou mais?" | Quem confia SOL ao validador, antes de a época virar |
| 7 | Total depositado numa pool de staking | Uma pool de staking tem pelo menos X SOL no começo de uma época? | "O JitoSOL começa a época E com X SOL ou mais?" | Quem deposita. O dinheiro precisa atravessar a virada da época |
| 8 | Liquidez travada na Meteora | Uma pool da Meteora tem pelo menos X de liquidez travada para sempre? | "A pool T/SOL chega a X de liquidez travada até o dia 30?" | Quem põe liquidez e trava. Custa dinheiro: fica presa |
| 9 | Metadados imutáveis | Nome, símbolo e imagem do token ficam congelados? | "O token T congela os metadados até o dia 30?" | Só quem tem a chave de metadados. Custo zero |

A última coluna é a que importa num mercado de apostas. Ela separa os nove tipos em três famílias (INFERÊNCIA da
pesquisa técnica, out/2026):

| Família | Tipos | O que significa num pote |
|---|---|---|
| Decisão de quem tem a chave, a custo zero | 2, 3, 4 e 9 | Uma pessoa decide o resultado de graça. Ela pode apostar antes, por outra carteira, e levar o pote do outro lado |
| Alguém precisa gastar ou travar dinheiro | 1, 5 e 8 | Dá para forçar o SIM, mas custa dinheiro de verdade. Só vale a pena se o pote do NÃO for maior que o custo |
| Foto numa data | 6 e 7 | Depende de muito dinheiro parado atravessando a virada da época. É o resultado menos controlável |

No modelo antigo, a primeira família era o produto: o patrocinador pagava justamente para o dono da chave agir. Num
mercado de apostas ela vira o maior risco.

> **Objeção registrada OBJ-03 · severidade crítica**
>
> **Decisão do fundador:** os tipos de pergunta do primeiro dia estão em aberto, e quem controla o resultado não é
> impedido de apostar.
>
> **O que a revisão crítica achou:** perguntas decididas de graça por uma única chave são uma opção gratuita para o
> dono da chave. Quem aposta contra ele está doando.
>
> **Evidência:** em quatro dos nove tipos prontos uma pessoa decide o resultado sem custo (FATO, repositório).
> Exemplo (INFERÊNCIA, conta conferida): no fechamento, o pote tem 3.000 no SIM e 7.000 no NÃO. O dono da chave, por
> uma carteira nova, põe 3.000 no SIM antes do fechamento; o pote vai a 6.000 e 7.000. Depois do fechamento ele usa
> a chave e resolve. Recebe 3.000 ÷ 6.000 × 97% × 13.000 = 6.305: lucro de 3.305, sem risco. Se o pote estivesse
> pesado no SIM, ele apostaria no NÃO e simplesmente não agiria.
>
> **Alternativa proposta:** deixar essa família fora do pote na primeira versão. Se entrar, só com teto de pote
> baixo, selo "resultado controlado por uma parte" e sem patrocínio com lado. A revisão avisa que o selo sozinho não
> protege ninguém, porque o prejuízo de quem aposta contra é certo.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 4.3 O padrão novo de token (Token-2022)

Na Solana, os tokens não são programas separados. Todos são registrados num programa comum, o "programa de tokens".
Existem dois. O clássico, usado pelo USDC e por quase tudo que é antigo. E o novo, chamado Token-2022, que deixa o
token ter funções extras embutidas: cobrar taxa em cada transferência, guardar nome e imagem dentro do próprio
token, e outras. O novo não é uma atualização do antigo; é outro programa, com outras regras.

Isso importa por dois fatos que se encontram:

- Os tokens novos do pump.fun são Token-2022, com os dados dentro do próprio token e as chaves de controle já
  abandonadas: 7 de 7 na amostra lida na rede em 3/out/2026 (FATO, amostra pequena).
- Os quatro leitores de token do programa atual só aceitam o padrão clássico. Diante de um token novo, eles não leem
  errado: recusam (FATO, repositório).

A consequência prática é direta. Queima, renúncia e metadados não funcionam hoje nos tokens que o público do
pump.fun negocia, nem funcionariam no token do próprio Baked Market se ele nascer lá. E duas perguntas perdem o
sentido nesses tokens, porque já nascem respondidas: a renúncia de emissão e a de congelamento.

O que precisa ser construído é um leitor que aceite o padrão novo e recuse, por padrão, qualquer token com função
perigosa ou desconhecida, como a que permite a um terceiro queimar o saldo de qualquer carteira. É o primeiro item
da ordem de construção da seção 4.5.

### 4.4 Preço como pergunta

**Em aberto.** A primeira proposta deixava de fora as perguntas de preço de token pequeno. O fundador questionou:
"Por que ficaria? Com base no quê". A resposta tem três partes, todas com conta.

**Parte 1: numa pool pequena, o preço se move por um instante e volta.** A maioria das pools de negociação define o
preço pela divisão entre as duas reservas. Exemplo (INFERÊNCIA, conta da pesquisa técnica):

1. A pool tem 100 SOL e 10.000.000 de tokens. O preço é 0,00001 SOL por token.
2. A pergunta aberta é "o token vale o dobro até sexta?", e o pote tem dinheiro no NÃO.
3. O atacante aposta no SIM.
4. Numa única transação, ele compra tokens com 41,42 SOL. A pool fica com 141,42 SOL e 7.071.068 tokens, e o preço
   lido é 0,00002: dobrou.
5. Na mesma transação, ele aciona a resolução. O programa lê o preço, vê o dobro e grava SIM, para sempre.
6. Ainda na mesma transação, ele revende os tokens. Recupera os 41,42 SOL menos cerca de 0,21 SOL de taxas.
7. O preço voltou. Ninguém viu o token dobrar. Ele saca o pote do NÃO.

Ele nem precisa ter os 41 SOL. Existe o empréstimo relâmpago: um empréstimo tomado e devolvido dentro da mesma
transação, que serve exatamente para mover um número por um instante.

**Parte 2: já aconteceu, em Solana.** No caso Mango, em 11 de outubro de 2022, o preço usado pelo protocolo para um
token de pouca negociação foi de cerca de US$ 0,04 para US$ 0,54 em uns 30 minutos, e a retirada foi de US$ 114 a
116 milhões (FATO, denúncias da SEC e da CFTC). Ali havia até oráculo de preço, e ele relatou fielmente um preço
empurrado.

**Parte 3: há formas de tornar seguro o bastante.** A primeira é a média no tempo (em inglês, TWAP): em vez do preço
de um instante, usa-se a média do preço durante um período. Numa média de 30 minutos, um pico de 100 vezes o preço
que dure 15 segundos move a média em 3,9% (INFERÊNCIA). A segunda é a Pyth, uma rede de oráculos de preço em que
corretoras e formadores de mercado publicam preços assinados, que o programa confere. Em 4/out/2026 ela tinha 1.881
preços, 423 de cripto, incluindo SOL, Bitcoin e as memecoins grandes (FATO, consulta direta). Para 64 ativos, a
Pyth mantém em Solana uma conta de preço atualizada a cada 55 segundos ou a cada 0,5% de variação (FATO,
documentação; a lista dos 64 não foi conferida) **[A confirmar]**.

A Pyth é um oráculo. Ela é compatível com a decisão do fundador ("oráculo, mas um que possa resolver onchain"),
porque o preço assinado é conferido pelo programa dentro da rede. Mas o produto deixa de poder dizer "sem oráculo"
(seção 4.8).

A forma mais simples de pergunta de preço é a de **toque**: dá SIM se o preço encostar no alvo em qualquer momento
do prazo. Exemplo: "O BTC toca US$ 80.000 até o dia 30?". Basta um preço assinado, dentro do prazo, igual ou acima
do alvo. Sobra uma fresta, que o programa precisa fechar: entre o preço tocar o alvo e alguém levar a prova para a
rede, as apostas seguem abertas. A correção proposta é exigir um preço fresco em toda aposta desse tipo de pergunta.

A resposta direta à pergunta do fundador: preço de token pequeno pode entrar, mas não no primeiro dia e não lendo
uma pool num instante. Entra em três degraus (proposta):

1. Ativos com preço na Pyth, incluindo as memecoins grandes.
2. Tokens com pool na Raydium ou na Meteora (modelo DLMM), pela média no tempo, com liquidez travada mínima e teto
   de pote.
3. Tokens que só existem na PumpSwap, por uma receita de preço na Switchboard, outra rede de oráculos. Esse degrau
   troca a leitura pura da rede pela confiança numa rede de oráculos.

> **Objeção registrada OBJ-24 · severidade alta**
>
> **Decisão do fundador:** em aberto. Ele questionou a exclusão do preço de token pequeno ("Por que ficaria? Com
> base no quê").
>
> **O que a revisão crítica achou:** preço de token pequeno, lido de uma pool num instante, pode ser movido e
> devolvido na mesma transação.
>
> **Evidência:** numa pool de 100 SOL, dobrar o preço custa cerca de 0,21 SOL em taxas (INFERÊNCIA, pesquisa
> técnica); no caso Mango, o preço do oráculo foi de US$ 0,04 a US$ 0,54 em 30 minutos (FATO, denúncias da SEC e da
> CFTC, 2022).
>
> **Alternativa proposta:** entrar nos três degraus acima, e não no primeiro dia.
>
> **Situação:** não há decisão a substituir; a resposta e a alternativa ficam para o fundador decidir.

### 4.5 Cardápio proposto para o primeiro dia

**Em aberto.** Sobre quais tipos de pergunta abrem no primeiro dia, o fundador disse: "não tenho a menor ideia e
você vai me ajudar a decidir". A tabela abaixo é a proposta do estudo de viabilidade, para ele decidir.

O critério da proposta é uma pergunta só: **"alguém decide este resultado de graça?"**. Se sim, o tipo fica fora da
primeira versão. A coluna "fase" segue o roteiro de construção da seção 12.1: na fase 2 o produto fica jogável na
rede de testes; na fase 3 entra o patrocínio.

| Tipo | Pergunta de exemplo | Fase | Observação |
|---|---|---|---|
| Preço de SOL e de Bitcoin pela Pyth, na modalidade toque | "O SOL toca US$ X até o dia D?" | 2 | Leitor novo; preço fresco em toda aposta; ninguém controla o resultado |
| Total depositado numa pool de staking no começo de uma época | "O JitoSOL começa a época E com X SOL ou mais?" | 2 | Leitor pronto; só com os dois serviços agendados no ar (seção 4.6) |
| Liquidez travada na Meteora | "A pool T/SOL chega a X de liquidez travada até o dia D?" | 3 | Leitor pronto; teto de pote abaixo do custo de forçar |
| Queima de oferta em token do padrão clássico | "A oferta do token T cai para X até o dia D?" | 3 | Leitor pronto; teto de pote; os tokens do pump.fun ficam de fora até o leitor do padrão novo |
| Renúncia de chave, programa imutável, metadados imutáveis | "O time do projeto P renuncia à emissão até o dia D?" | Depois | Uma pessoa decide o resultado de graça (OBJ-03) |
| Stake de validador | "O validador V entra na época E com X SOL ou mais?" | Depois | O SIM não pôde ser testado fora de uma rede real |
| Formatura no pump.fun; preço de token pequeno | "O token T se forma no pump.fun até o dia D?" | Depois | Dá para forçar com empréstimo relâmpago; exige travas (seção 4.4) |

Lida de cima para baixo, a tabela diz que o primeiro dia teria duas famílias: preço de ativos grandes, que é o que
esse público mais aposta (seção 5.5), e fotos de época. Os fatos de token, que são a assinatura do produto, entram
na fase seguinte e com teto de pote.

A ordem de construção dos leitores novos sai daí (proposta): primeiro o leitor do padrão novo de token, que libera
queima nos tokens do pump.fun; depois o preço pela Pyth; depois a formatura no pump.fun.

**A formatura como exemplo de pergunta de azarão.** Formatura é o momento em que um token do pump.fun vende toda a
curva inicial e passa a ser negociado numa pool comum. É um fato legível na rede e que esse público acompanha. Mas
só 0,26% dos tokens se formavam em junho de 2026, contra cerca de 1,4% no histórico (FATO SECUNDÁRIO, The Block e
Dune, jun/2026): "o token T se forma?" é quase sempre uma aposta no improvável. E dá para forçar o SIM comprando o
resto da curva. O sócio técnico mediu a perda mínima de quem força: 18,66 SOL numa curva intocada, 2,16 SOL nos
últimos 10% e 0,07 SOL no último 1% (FATO, medição do sócio técnico). Uma pergunta aberta com a curva quase cheia e
um pote grande no NÃO seria dinheiro grátis. Por isso ela só entra com travas: abrir com a curva longe do fim,
fechar as apostas quando ela passar de certo ponto e manter o pote abaixo do custo de forçar.

### 4.6 Quem aciona a resolução

**Decisão (direção).** "talvez a gente resolva com um sistema cron pela nossa plataforma, acionando o resolver."
Serviço agendado (em inglês, cron) é um programa de computador que acorda de tempos em tempos e faz uma tarefa
sozinho. Aqui, a tarefa é conferir, a cada minuto, se alguma pergunta já pode ser resolvida, e apertar o botão.

**Por que ele existe, se qualquer pessoa pode resolver.** Na maior parte dos casos alguém tem interesse em apertar o
botão. Quando o fato acontece, quem apostou no SIM quer receber. Quando o prazo passa, quem apostou no NÃO quer
receber. O caso em que ninguém se mexe é um só: o fato aconteceu, os apostadores do SIM não perceberam, e os do NÃO
ficam quietos, esperando o prazo. É para esse caso que o serviço existe. A revisão de segurança acrescenta que, se o
lado do SIM tiver poucos apostadores desatentos, o silêncio rende o pote inteiro ao NÃO.

**A arquitetura proposta, em linguagem simples** (INFERÊNCIA da pesquisa técnica e da revisão de segurança):

1. Um serviço próprio, sempre ligado, que vigia as perguntas abertas e resolve assim que dá.
2. Um segundo serviço, igual, em outro provedor e com outra chave. Se o primeiro cair, a resolução atrasa minutos,
   não dias.
3. Um botão público "Resolver" no site, visível a qualquer visitante quando a pergunta já pode ser resolvida.
4. Um alarme que avisa a equipe quando uma pergunta está "resolvível e não resolvida" há mais de 15 minutos, e
   alguém de plantão para atendê-lo.
5. Uma recompensa pequena, paga pelo próprio programa a quem resolve, tirada da taxa. Ela cria interessados que não
   dependem da equipe. A revisão crítica pede que ela exista desde a primeira versão.

A chave do serviço não tem poder nenhum. Se for roubada, o ladrão leva o pouco de SOL que estava nela, e nada mais:
o resultado continua saindo do dado lido, não de quem apertou.

**Por que não usar um agendador que já roda dentro da rede.** O programa atual recusa a resolução quando ela é
chamada por outro programa. A trava é proposital: impede que alguém embrulhe a resolução numa operação de empréstimo
relâmpago (FATO, repositório). O efeito colateral é que os agendadores on-chain, como o Tuk Tuk, não conseguem
acioná-la (FATO SECUNDÁRIO; segundo fonte secundária, o código do Tuk Tuk não foi lido) **[A confirmar]**. A revisão
de segurança recomenda manter a trava e não embutir a resolução em outras instruções: o site monta a transação com a
resolução na frente da aposta ou do resgate, como passo separado.

A arquitetura técnica completa está na seção 11.5.

### 4.7 Quando a resolução falha

A regra do programa atual é simples e dura: se o prazo passou, o resultado é NÃO. O programa não tem como saber,
depois, em que dia a meta foi cumprida (FATO, repositório).

Exemplo. A pergunta é "a oferta do token T cai para 900 milhões até o dia 30?". A queima acontece no dia 10. Ninguém
aperta "Resolver": o serviço estava fora do ar e os apostadores do SIM não viram. No dia 30 o prazo vence, alguém
resolve, e o resultado gravado é NÃO. Quem acertou perde tudo, sem disputa e sem volta.

Nas perguntas de época a janela é ainda mais curta, de cerca de dois dias (FATO, repositório). Um fim de semana com
o serviço parado e um SIM verdadeiro vira NÃO.

Há um precedente de quem previu a falha. O PancakeSwap Prediction, também um pote, fecha cada rodada com um operador
próprio; quando o operador falha, a rodada é cancelada e devolve 100% das apostas, sem taxa (FATO, documentação).

A proposta técnica é criar um terceiro resultado, além de SIM e NÃO: **pergunta anulada**. A pergunta não pôde ser
decidida e as apostas voltam. Ele serve para dois casos: a conta que seria lida deixou de poder ser lida depois do
prazo (ela pertence a programas de terceiros, que podem mudar de formato), e a janela de uma pergunta de época foi
perdida. O que acontece com a taxa, com o prêmio neutro e com as penalidades numa pergunta anulada ainda não foi
definido (ver seção 16.1).

> **Objeção registrada OBJ-25 · severidade crítica**
>
> **Decisão do fundador:** a resolução é acionada por um serviço agendado da própria plataforma.
>
> **O que a revisão crítica achou:** se o serviço falha, um SIM verdadeiro vira NÃO, para sempre. "Ninguém decide o
> resultado" passa a depender de um servidor da equipe estar no ar.
>
> **Evidência:** pela regra do programa, meta cumprida no dia 10 e não provada até o prazo é gravada como NÃO (FATO,
> repositório). O PancakeSwap, quando o operador falha, devolve 100% (FATO, documentação).
>
> **Alternativa proposta:** dois serviços agendados em provedores diferentes; botão público; recompensa on-chain a
> quem resolve, desde a primeira versão; alarme e plantão; o terceiro resultado, "Anulada"; janela de época perdida
> vira devolução, não NÃO; e um plano escrito de indenização para o caso de a falha ser da equipe.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 4.8 O que dizer ao público

A forma de falar do produto precisa caber no que ele entrega. Três frases que circularam nos documentos anteriores
não cabem.

- **"Sem oráculo."** Com perguntas de preço pela Pyth, deixa de ser verdade. O fundador pediu "oráculo, mas um que
  possa resolver onchain", e é isso que o produto tem. A frase correta é "resolução por dado verificável on-chain".
- **"Ninguém controla."** O programa atual não tem nenhuma chave de administrador. O novo terá: alguém abre as
  perguntas, alguém pode pausar as apostas numa emergência, alguém pode atualizar o código. O plano publica quem
  pode o quê, com os limites de cada poder (quadro na seção 11.4), e não escreve "ninguém controla".
- **"Anônimo."** O Cloak não esconde valores grandes (seção 3.9). A tela diz o que é verdade: "pagador não
  divulgado".

O que o apostador sente, e que pode ser dito sem exagero: o resultado sai sozinho, da leitura da rede; o pagamento
vem em minutos, sem prazo de disputa; e qualquer pessoa confere. A revisão crítica propõe tornar essa conferência um
objeto de tela: em cada pergunta, o número lido agora, a meta e o link da conta.

> **Objeção registrada OBJ-27 · severidade média**
>
> **Decisão do fundador:** resolução só por dado on-chain e patrocinador anônimo, nas palavras usadas na ideação.
>
> **O que a revisão crítica achou:** "sem oráculo", "anônimo" e "ninguém controla" prometem o que o produto não
> entrega.
>
> **Evidência:** preço exige a Pyth, que é um oráculo; o Cloak não esconde valores grandes (FATO SECUNDÁRIO, plano
> de privacidade do sócio); e a equipe abre perguntas, pausa e atualiza o código (INFERÊNCIA, revisão de segurança).
>
> **Alternativa proposta:** "resultado verificável on-chain, pago em minutos, sem disputa"; "pagador não
> divulgado"; e publicar quem pode o quê.
>
> **Situação:** a decisão vale; a alternativa trata só da redação e fica para o fundador decidir.

## 5. Mercado e público

### 5.1 Duas réguas para medir volume

Os números de volume dos mercados de previsão parecem se contradizer de uma fonte para outra. Não se contradizem:
medem a mesma atividade com duas réguas.

Nos líderes do setor, o usuário compra contratos que pagam US$ 1 se o resultado se confirmar e nada se não se
confirmar. O preço do contrato fica entre zero e 1 dólar.

- **Valor de face** soma cada contrato a US$ 1, tenha custado o que for.
- **Dólares pagos** soma o que as pessoas de fato desembolsaram.

Exemplo: 100 contratos comprados a US$ 0,27 cada dão valor de face de 100 e dólares pagos de 27. Quanto mais
contratos baratos se negociam, como em apostas esportivas combinadas, maior a distância entre as duas réguas.

| | Valor de face | Dólares pagos |
|---|---|---|
| O que soma | Cada contrato a US$ 1 | O que foi desembolsado |
| Setor inteiro, 30 dias (4/set a 3/out/2026) | US$ 81,8 bi | US$ 21,7 bi; média de US$ 0,27 por contrato |
| Kalshi | US$ 64,2 bi em 30 dias | US$ 13,7 bi em 30 dias; US$ 13,5 bi em setembro de 2026 |
| Polymarket | US$ 14,2 bi em 30 dias (internacional 4,7 + Estados Unidos 9,5) | US$ 4,63 bi em setembro de 2026; em 30 dias, internacional 2,19 + Estados Unidos 2,41 |
| Fonte e etiqueta | FATO SECUNDÁRIO, DefiRate, out/2026 | FATO SECUNDÁRIO, DefiRate (setor) e DefiLlama (Kalshi e Polymarket), out/2026 |

Na Kalshi, o valor de face é cerca de 4,7 vezes os dólares pagos (64,2 ÷ 13,7; INFERÊNCIA).

Nota sobre a tabela: o DefiLlama não declara o método que usa para a Kalshi; a leitura de que o número dele é
"dólares pagos" é inferência do agente de pesquisa **[A confirmar]**.

**A regra deste plano.** Um pote mede dinheiro depositado. Por isso o Baked Market só se compara com dólares pagos.
Quando um número em valor de face aparece, ele vem com a régua dita ao lado.

### 5.2 O tamanho do mercado de previsão

**O setor é grande e é novo.** Kalshi e Polymarket, juntas, negociaram mais de US$ 44 bilhões em 2025 (FATO
SECUNDÁRIO, The Block, dez/2025; régua não declarada). A Kalshi sozinha fez cerca de US$ 23 bilhões em 2025 e
arrecadou US$ 263,5 milhões em taxas, 1,15% do negociado; 89% dessa taxa veio de esportes (FATO SECUNDÁRIO,
dados de 2025, via pesquisa de monetização; a base do volume não é declarada). Na Polymarket, em dólares pagos, o
volume mensal foi de US$ 1,88 bilhão em nov/2025, 5,09 bilhões em mar/2026, 5,95 bilhões em jun/2026 e 4,63 bilhões
em set/2026, com US$ 56,5 bilhões acumulados (FATO SECUNDÁRIO, DefiLlama, set/2026).

**A cobrança de taxa também é nova.** A Polymarket não arrecadou nada em 2025. Em 2026, as taxas foram de US$ 3,7
milhões em janeiro para US$ 40,6 milhões em abril e US$ 93,6 milhões em setembro, com US$ 435,3 milhões acumulados
(FATO SECUNDÁRIO, DefiLlama, set/2026). O setor só começou a provar que cobra neste ano.

**O capital entrou.** A Kalshi foi avaliada em US$ 22 bilhões em mai/2026 e a Polymarket em US$ 15 bilhões em 2026
(FATO SECUNDÁRIO, Sacra). A ICE, dona da bolsa de Nova York, anunciou até US$ 2 bilhões na Polymarket (FATO,
comunicado da ICE, 7/out/2025) e investiu US$ 1,6 bilhão até mar/2026 (FATO SECUNDÁRIO).

**A projeção mais citada.** A Bernstein projeta volume de cerca de US$ 240 bilhões em 2026 e de US$ 1 trilhão em
2030, com a receita do setor indo de cerca de US$ 500 milhões em 2025 para US$ 10,8 bilhões em 2030 (FATO
SECUNDÁRIO, Decrypt, 14/abr/2026). É projeção de terceiro, e o método não foi lido **[A confirmar]**. Este plano não
anualiza o número de 30 dias da tabela acima para comparar com ela, nem usa a projeção como premissa.

**O mercado é concentrado.** A Kalshi tinha 77% do volume semanal no fim de set/2026 (FATO SECUNDÁRIO, Artemis via
Crypto Economy). E é concentrado em esportes: 62% do volume hoje, com 31% projetados para 2030 (FATO SECUNDÁRIO,
Bernstein, abr/2026). Nada disso é legível numa conta da Solana.

**Três sinais de alerta.** Cerca de 25% da atividade histórica da Polymarket foi negociação artificial, segundo um
estudo da Universidade Columbia (FATO SECUNDÁRIO, via Sacra, 2026). O interesse de busca por mercados de previsão
caiu 83% desde o pico da Copa de 2026 (FATO SECUNDÁRIO, The Defiant, 2026), sinal de sazonalidade ligada a esporte.
E vários países bloquearam ou baniram plataformas do setor em 2025 e 2026, o Brasil entre eles (ver capítulo 15).

### 5.3 O mercado em Solana

O mercado de previsão em Solana é uma fração pequena do setor.

- Quando a Kalshi passou a oferecer seus contratos em Solana, a soma dos dois canais (Jupiter e DFlow) foi de
  US$ 28,6 milhões em cerca de três semanas, de meados de dez/2025 a 5/jan/2026, com cerca de 21 mil carteiras. Da
  parte da DFlow, 98% veio da integração com a Phantom (FATO SECUNDÁRIO, Step Data, jan/2026).
- A área de previsão da Jupiter fez US$ 5,5 milhões em 30 dias (FATO SECUNDÁRIO, DefiLlama, out/2026).
- O World, dentro da Phantom, fez US$ 1,14 milhão em jun/2026, 13,22 milhões em julho, 22,20 milhões em agosto e
  15,44 milhões em setembro, com 52,94 milhões acumulados (FATO SECUNDÁRIO, DefiLlama, set/2026).

A leitura é direta. O World tem por trás a carteira que o público de Solana já usa, que declara mais de 20 milhões
de usuários (FATO SECUNDÁRIO), e fez cerca de US$ 15 milhões em setembro de 2026. Esse é o tamanho real do melhor
canal de distribuição da rede. Quem lê os números da Polymarket e imagina o mesmo em Solana erra por um fator de
cerca de 300 (4,63 bilhões ÷ 15,44 milhões; INFERÊNCIA).

Um detalhe do World importa para as finanças do pote. Ele tinha US$ 170,8 mil travados (FATO SECUNDÁRIO, DefiLlama,
set/2026), o que significa que cada dólar girou cerca de 90 vezes no mês (INFERÊNCIA). Dinheiro travado é o total
parado dentro de um protocolo num dado momento; giro é quantas vezes o mesmo dólar é apostado num período. No pote,
o dólar entra uma vez por pergunta e fica parado até a resolução. A consequência está na seção 9.4.

### 5.4 O público web3 e do pump.fun

**Decisão.** "queremos pessoal da web3." O recorte que a pesquisa usou é o público de Solana e, dentro dele, o do
pump.fun.

| Medida | Valor | Data | Etiqueta |
|---|---|---|---|
| Endereços ativos em Solana por semana | 27,1 milhões, sem filtro de robôs | Semana até 18/jan/2026 | FATO SECUNDÁRIO (Nansen, via BlockEden) |
| Usuários ativos por dia em Solana | Cerca de 4,3 milhões | 2026, sem data exata | FATO SECUNDÁRIO, fonte fraca |
| pump.fun: carteiras únicas acumuladas | 80 milhões | jun/2026 | FATO SECUNDÁRIO (The Block) |
| pump.fun: volume desde a criação | Mais de US$ 214 bilhões | jun/2026 | FATO SECUNDÁRIO (The Block) |
| pump.fun: carteiras ativas por mês | Pico de 5,2 milhões (mai/2025); 1,8 milhão (dez/2025) | 2025 | FATO SECUNDÁRIO, fonte fraca |
| pump.fun: volume diário médio em 30 dias | Cerca de US$ 347 milhões | jun/2026 | FATO SECUNDÁRIO (The Block) |
| pump.fun: receita diária | US$ 800 mil, contra US$ 4,8 milhões seis meses antes | jun/2026 | FATO SECUNDÁRIO (The Block) |
| pump.fun: taxa de formatura | 0,26% (média de 7 dias); histórica de cerca de 1,4% | jun/2026 | FATO SECUNDÁRIO (The Block, Dune) |
| pump.fun: receita de 2025 | US$ 971,37 milhões | 29/abr/2026 | FATO SECUNDÁRIO (CoinDesk) |

Duas leituras. O público é grande em quantidade de carteiras. E a atividade caiu forte em 2026: receita diária a um
sexto, carteiras mensais a um terço do pico, formatura a um quinto do histórico (INFERÊNCIA sobre a tabela).

**O que não se sabe.** Carteira ativa inclui robôs e várias carteiras da mesma pessoa. Quantas pessoas reais usam o
pump.fun por dia: não encontrado. Quanto cada carteira aposta numa plataforma de previsão on-chain e com que
frequência: não encontrado. Toda premissa de depósito por carteira no capítulo 9 é premissa sem dado.

**Quatro perfis, como hipótese.** Nenhuma entrevista foi feita; o quadro abaixo é suposição da pesquisa de público,
a validar no teste de demanda (INFERÊNCIA, premissa sem dado, out/2026).

| Perfil | O que busca | O que o afasta | Onde se informa |
|---|---|---|---|
| Trader de memecoin | Giro rápido, retorno em minutos, a sensação de ter lido antes dos outros | Cadastro, prazo longo, pergunta sem dinheiro do outro lado | X, Telegram, DexScreener, grupos de dicas |
| Comunidade de um token | Prova pública de meta cumprida, ânimo coletivo | Meta que parece manipulável, taxa alta | Telegram, Discord, X do projeto |
| Formador de opinião do X cripto | Conteúdo compartilhável, ganhar com a audiência | Risco de reputação, resolução contestável | X, Telegram |
| Equipe de projeto | Divulgar uma meta, atrair detentores do token | Pagar sem retorno mensurável, risco jurídico | X, DexScreener, agências de influenciadores |

A tabela já aponta uma tensão que o capítulo 3 registra: o primeiro perfil quer prazo curto, e a regra de fechamento
decidida deixa as perguntas curtas na exceção (OBJ-21, seção 3.5).

### 5.5 No que esse público aposta

- Na Polymarket, em mai/2026, esporte era de 39% a 40% do volume, política 32% e cripto 20% (FATO SECUNDÁRIO,
  mai/2026).
- Cripto é a porta de entrada: cerca de 40% da atividade inicial dos novos usuários da Polymarket no primeiro
  trimestre de 2026 foi em mercados de cripto (FATO SECUNDÁRIO, The Defiant).
- As plataformas on-chain menores (Azuro, Limitless, Myriad e PolyBet), somadas, tinham menos de 4% do volume mensal
  da Polymarket em mai/2026 (FATO SECUNDÁRIO).
- Todos os mercados sobre o pump.fun na Polymarket somaram cerca de US$ 262,81 mil, e são sobre o token PUMP (FATO
  SECUNDÁRIO, fonte fraca, Cryptorank, sem data).

A leitura da pesquisa (INFERÊNCIA): o que une esse público é preço de cripto em prazo curto e eventos de grande
atenção, como esporte e eleição. Fatos de projeto de token (queima, renúncia, trava de liquidez) não aparecem como
categoria relevante em nenhuma plataforma. Isso sustenta duas escolhas da proposta de cardápio da seção 4.5: começar
por preço de ativos grandes e tratar os fatos de token como assinatura do produto, não como fonte principal de
volume. E é a base da objeção OBJ-01 (seção 2.5).

### 5.6 Quem pagaria patrocínio

Os candidatos a patrocinador são equipes de token, plataformas de lançamento de tokens, validadores e protocolos
(hipótese; não há dado sobre a disposição de pagar por uma pergunta patrocinada).

O que esses projetos já pagam por visibilidade dá a ordem de grandeza:

- No DexScreener, o site em que esse público acompanha preços, o anúncio de um token custa "a partir de US$ 299"
  (FATO, página oficial) e a barra de tendências, "a partir de US$ 2.000" (FATO SECUNDÁRIO).
- Um micro-influenciador cobra cerca de US$ 500 por publicação, e um lançamento de token gasta de US$ 40 mil a 150
  mil em divulgação (fonte fraca, blogs de agência, 2026).

As faixas de US$ 500, 1.500 e 5.000 ficam, portanto, na faixa de preço de um anúncio nesses canais. A diferença é
que esses canais têm audiência de milhões, e o Baked Market começa sem audiência; a comparação completa, com o
custo por mil impressões, está na seção 7.4, junto com a objeção OBJ-15. Com a receita diária do pump.fun a um sexto
do que era, o orçamento de marketing do projeto médio provavelmente encolheu em 2026 (INFERÊNCIA).

### 5.7 O tamanho que o plano considera

O plano não promete o tamanho da Polymarket. As projeções do capítulo 9 foram presas a réguas de plataformas reais,
todas em dólares pagos (INFERÊNCIA do modelo financeiro, out/2026; as réguas são FATO SECUNDÁRIO, DefiLlama,
set/2026 e out/2026):

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume apostado no mês 12 | US$ 45 mil | US$ 300 mil | US$ 1,5 milhão |
| Régua no mês 12 | Taxa de US$ 1.148 no mês, perto dos US$ 1.319 que a Myriad arrecadou em 30 dias | 1,9% do World de set/2026; 2,8% da Limitless de set/2026 | 9,7% do World; 14% da Limitless de set/2026 |
| Volume apostado no mês 24 | US$ 30 mil | US$ 750 mil | US$ 5 milhões |
| Régua no mês 24 | Em 24 meses, US$ 870 mil: 3,3 vezes tudo o que os mercados de pump.fun somaram na Polymarket | 4,9% do World; 7,0% da Limitless; 14% da Jupiter | 32% do World; 47% da Limitless; 91% da Jupiter |
| O que precisa ser verdade | O produto funciona e quase ninguém volta | Um nicho pequeno e fiel, sem distribuição paga | Um canal de distribuição, como a integração com uma carteira, que hoje não existe |

A leitura da tabela: o cenário razoável pede que o Baked Market chegue, em um ano, a cerca de 2% do que o World faz
hoje com a Phantom inteira por trás. O otimista pede um décimo. Nenhum dos dois é pequeno para um produto novo, sem
canal de distribuição e num mercado em que três plataformas menores perderam de 80% a 96% do volume em meses (seção
2.3). O cenário ruim, que não se paga, tampouco é o piso: o piso é o de um concorrente de Solana que está quase
parado, com volume perto de zero (ver seção 6.3).

Os cenários completos, o ponto de equilíbrio, o capital necessário e as metas de 90 dias estão no capítulo 9.



## 6. Concorrência

### 6.1 Mapa dos concorrentes

**Decisão.** Para o fundador, "qualquer empresa de mercado de predição é concorrente direto, porém cada qual com os
seus diferenciais" (D-38). Mercado de previsão é o lugar em que pessoas apostam dinheiro no resultado de uma pergunta
sobre o futuro. Por essa régua, a lista de concorrentes é longa. A pesquisa levantou vinte nomes e escolheu cinco para
análise profunda.

A tabela abaixo resume a lista longa. Ela traz só o que a pesquisa confirmou; onde a informação não apareceu, está
escrito "não encontrado". Os termos técnicos da coluna "Mecanismo" são três. **Livro de ordens** é uma lista de
ofertas de compra e de venda: compra-se de outra pessoa, a um preço conhecido. **Formador de mercado automático
(AMM)** é um contrato com uma fórmula que faz o papel da contraparte: sempre há preço, mas ele piora em compras
grandes. **Pote** é o cofre de uma pergunta: todas as apostas entram nele e quem acertou divide o que sobra depois da
taxa. É o mecanismo do Baked Market (ver seção 3.3).

Tabela 6.1. Lista longa de concorrentes (FATO e FATO SECUNDÁRIO, lista longa e análise dos cinco, out/2026).

| # | Nome | Rede ou país | Mecanismo | Quem abre as perguntas | Como resolve |
|---|---|---|---|---|---|
| 1 | Polymarket | Polygon; aplicativo regulado nos EUA | Livro de ordens | A equipe, com sugestões do público | Oráculo UMA, com votação em caso de disputa |
| 2 | Kalshi | EUA, bolsa regulada | Livro de ordens | A empresa | Regra do contrato e decisão interna |
| 3 | Melee | Solana | Pote com curva e piso de retorno | Meta: qualquer um | Pessoas (criador ou equipe); página oficial em construção |
| 4 | World | Solana, dentro da carteira Phantom | Formadores de mercado acionados por roteador | Só a chave da empresa | Chave da empresa, alimentada pelo Chainlink fora da rede |
| 5 | Limitless | Base | Livro de ordens e AMM | Equipe e qualquer usuário | Pyth, Chainlink, provedores esportivos e, em parte, a equipe |
| 6 | PNP Protocol | Solana | Curva de ligação; também pote entre duas partes | Qualquer um | Modelos de linguagem; DAO de retaguarda |
| 7 | Hedgehog Markets | Solana e Eclipse | AMM binário | Equipe | Não encontrado |
| 8 | Drift BET | Solana | Livro de ordens | Não encontrado | Não encontrado |
| 9 | DFlow | Solana | Transforma contratos da Kalshi em tokens | Kalshi | Kalshi |
| 10 | Jupiter (previsão) | Solana | Integração com a Kalshi | Terceiros | Terceiros |
| 11 | Phantom | Solana | O mesmo do World | O mesmo do World | O mesmo do World |
| 12 | Myriad Markets | Abstract, Linea e BNB | AMM | Equipe | Não encontrado |
| 13 | Azuro | Redes compatíveis com Ethereum | Pool de liquidez para apostas esportivas | Não confirmado | Não confirmado |
| 14 | PancakeSwap Prediction | BNB Chain | Pote de preço em rodadas curtas | O protocolo (inferência) | Oráculo de preço (inferência) [A confirmar] |
| 15 | FactCheck | Solana | Pote | Não encontrado | Não encontrado |
| 16 | Manifold | Fora de blockchain, dinheiro de brinquedo | AMM | Qualquer um | O criador |
| 17 | PredictIt | EUA | Livro de ordens | A empresa | A empresa |
| 18 | Robinhood | EUA | Distribui contratos de parceiros | Parceiros | Parceiros |
| 19 | Coinbase | EUA | Não encontrado | Não encontrado | Não encontrado |
| 20 | Hyperliquid HIP-4 | Hyperliquid | Resultados em rede própria | O protocolo | O protocolo [A confirmar] |

**Como os cinco foram escolhidos.** Quatro critérios, pesados pelo perfil do Baked Market: semelhança de modelo (pote
ou curva, em Solana); sobreposição de público (web3 e pump.fun); ameaça por atenção; e existência de dados para
analisar. Saíram Melee e PNP (os mais parecidos), Polymarket (a maior marca no público de cripto), World (a maior
distribuição dentro de Solana) e Limitless (referência de taxas, criação aberta e token).

**Por que a Kalshi fica fora dos cinco.** É a maior do setor em volume, mas é uma bolsa regulada nos Estados Unidos,
exige cadastro completo e 89% da taxa que arrecadou em 2025 veio de esportes (FATO SECUNDÁRIO, BJ21, 2025). Serve de
referência de escala, não de rival pelo mesmo público.

**A escala de cada um.** Este capítulo compara volumes só em dólares pagos, que é o dinheiro de fato desembolsado e o
único número comparável com um pote. A explicação das duas réguas (valor de face e dólares pagos) está na seção 5.1.

Tabela 6.2. Volume recente em dólares pagos (FATO SECUNDÁRIO, DefiLlama e DefiRate, set e out/2026).

| Concorrente | Volume em dólares pagos | Período | Observação |
|---|---|---|---|
| Kalshi | Cerca de US$ 13,5 bi | Setembro de 2026 | Em valor de face, US$ 64,2 bi em 30 dias; a régua "dólares pagos" é inferência [A confirmar] |
| Polymarket | US$ 4,63 bi | Setembro de 2026 | Em valor de face, US$ 14,2 bi em 30 dias |
| World | US$ 15,44 mi | Setembro de 2026 | Dentro da Phantom |
| Limitless | US$ 10,75 mi | Setembro de 2026 | Era US$ 250,9 mi em maio de 2026 |
| Jupiter (previsão) | US$ 5,5 mi | 30 dias, outubro de 2026 | Revende contratos da Kalshi |
| Melee | Sem dinheiro real | Até 4/out/2026 | Fonte secundária [A confirmar] |
| PNP | Não aparece nos rastreadores | Até 4/out/2026 | 206 transações em seis meses (FATO, leitura da rede) |

A leitura da tabela é dura e precisa ser dita: os dois líderes somam bilhões por mês; todo o resto, somado, é uma
fração pequena disso. O World, com mais de 20 milhões de usuários declarados da Phantom por trás (FATO SECUNDÁRIO),
fez em setembro cerca de 0,3% do que a Polymarket fez no mesmo mês (15,44 ÷ 4.630; INFERÊNCIA).

### 6.2 Melee

O Melee é o concorrente mais parecido com o Baked Market: roda em Solana, usa pote e quer pagar a quem cria a
pergunta. É também o que tem mais dinheiro e mais nomes por trás entre os pequenos.

- **Capital.** Captou US$ 3,5 milhões em setembro de 2025, em rodada liderada pela Variant, com Anatoly Yakovenko,
  cofundador da Solana, entre os investidores-anjo (FATO SECUNDÁRIO, imprensa de Solana, set/2025).
- **Fila.** O site mostrava 49.247 pessoas na fila de espera em 4/out/2026 (FATO, site do Melee).
- **Estado.** O beta roda na rede de testes, sem dinheiro real (FATO SECUNDÁRIO: fio de usuário republicado pela
  KuCoin em 9/set/2026; não é comunicado oficial) **[A confirmar]**. Em 22/jul/2026 a imprensa de Solana dizia que
  ele estava perto do lançamento na rede principal (FATO SECUNDÁRIO).
- **Mecanismo.** Pote com uma curva de preço e um "piso de retorno", que é o mínimo que a posição recebe se o lado
  dela vencer e ela for mantida até o fim (FATO, documento oficial, 2026).
- **O que não está publicado.** A taxa; a base dos "até 20%" que o criador receberia; o token; uma auditoria
  (não encontrado, out/2026) **[A confirmar]**.

Até 4/out/2026 não há prova de volume com dinheiro real no Melee. Os números grandes que aparecem na página de
entrada dele são ilustração de tela e não entram neste plano.

**A diferença de desenho na saída antecipada.** Saída antecipada é desistir da aposta antes da resolução e receber
parte do dinheiro de volta. No Melee, quem quer sair vende a posição, com desconto, a um cofre separado, abastecido por
terceiros; a oferta depende de esse cofre ter saldo, e o desconto fica com ele (FATO, documento oficial). No Baked
Market, pela decisão do fundador, a penalidade de quem sai fica no pote e aumenta o prêmio de quem ficou (ver seção
3.6). O desenho do Baked é mais simples de explicar e não depende do dinheiro de terceiros. Em troca, não tem
precedente em nenhum produto encontrado, e a revisão de segurança achou furos nele (ver seção 11.6).

**Leitura.** A janela existe: o rival mais parecido ainda não largou. Mas ele tem caixa, investidores de peso, fila
e um beta com pontuação que prende o usuário antes do lançamento. A janela só vale alguma coisa se a demanda
existir, e isso ainda é hipótese (ver seção 2.5).

### 6.3 PNP Protocol

O PNP ("predict and pump") se apresenta como a mistura de pump.fun com Polymarket: qualquer pessoa cria uma pergunta
em segundos, e a negociação acontece numa curva de ligação, que é uma fórmula em que o preço sobe conforme entra
dinheiro. A pesquisa confirmou que pnp.exchange e o token PNP no pump.fun são o mesmo projeto.

- **Taxa.** 1% por negociação, com 30% dessa taxa para quem criou a pergunta (FATO, documentação, out/2026).
  Exemplo: US$ 100.000 negociados geram US$ 1.000 de taxa e US$ 300 para o criador (100.000 × 1% × 30%; INFERÊNCIA).
- **Resolução.** Dois modelos de linguagem (Perplexity e Grok) avaliam as evidências e gravam o resultado, com uma
  DAO de retaguarda (DAO é um grupo de detentores de um token que decide por voto); o criador pode nomear uma
  carteira como juiz (FATO, documentação, out/2026).
- **Uso.** O programa principal teve 206 transações entre 16/mar e 17/set/2026 e nenhuma depois (FATO, leitura da
  rede em 4/out/2026). Ressalva: pode haver outros programas do PNP que não foram medidos **[A confirmar]**.
- **Token.** Valor de mercado de US$ 108.661, liquidez de US$ 31.219 e US$ 258 negociados em 24 horas em
  4/out/2026 (FATO SECUNDÁRIO, DexScreener); queda de cerca de 93% em 13 meses (INFERÊNCIA).
- **Rumo.** O site hoje anuncia outro produto.

**Leitura.** O PNP não é rival por usuários: está quase parado. É referência de ideias em dois sentidos. A favor: dar
ao criador uma parte da taxa, coisa que o fundador considera justa ("acho justo que quem criar possa ganhar uma parte
da pergunta", D-42, ainda em aberto). Contra: resolver por modelo de linguagem, com o criador podendo ser o juiz, é o
oposto do que o Baked Market propõe, e é o que quem aposta não consegue conferir.

### 6.4 Polymarket

A Polymarket é a referência de escala do público de cripto e, ao mesmo tempo, a fonte dos casos mais documentados de
resolução contestada.

**Escala.** Em dólares pagos, o volume mensal foi de US$ 1,88 bilhão em novembro de 2025 para US$ 5,09 bilhões em
março de 2026, US$ 5,95 bilhões em junho e US$ 4,63 bilhões em setembro de 2026; o acumulado é de US$ 56,5 bilhões
(FATO SECUNDÁRIO, DefiLlama, set/2026). Os usuários ativos por dia passaram de cerca de 59 mil em outubro de 2025
para quase 150 mil em meados de março de 2026 (FATO SECUNDÁRIO). A dona da Bolsa de Nova York, a ICE, anunciou até
US$ 2 bilhões de investimento (FATO, comunicado de 7/out/2025) e investiu US$ 1,6 bilhão até março de 2026 (FATO
SECUNDÁRIO).

**Taxa.** A Polymarket não cobrou nada em 2025. Passou a cobrar em 2026: US$ 3,7 milhões em janeiro, US$ 40,6 milhões
em abril e US$ 93,6 milhões em setembro, com US$ 435,3 milhões no acumulado (FATO SECUNDÁRIO, DefiLlama). A regra:
só paga quem aceita uma oferta que já estava no livro, pela fórmula contratos × coeficiente × p × (1 − p), em que p é
o preço. O coeficiente é 0,07 em cripto. Exemplo oficial: 100 ações de cripto a US$ 0,50 pagam US$ 1,75, ou 3,5% dos
US$ 50 pagos (FATO, documentação, 3/out/2026). Na média, a taxa efetiva é de 2,0% dos dólares pagos (US$ 93,2 milhões
sobre US$ 4,61 bilhões em 30 dias; INFERÊNCIA). Cerca de 24% do que ela arrecada volta aos usuários (INFERÊNCIA sobre
dados do DefiLlama, 2º e 3º trimestres de 2026).

**Resolução.** A Polymarket usa o oráculo UMA. Oráculo é um serviço que traz para dentro da blockchain um dado de
fora dela. No UMA, alguém propõe o resultado deixando uma caução de cerca de US$ 750; se ninguém contesta em 2 horas,
vale; se alguém contesta, os detentores do token UMA votam, e o processo leva de 4 a 6 dias (FATO, documentação,
3/out/2026). Os problemas registrados:

- Mais de 1.150 mercados foram a arbitragem em 2026 até maio, mais que 2025 inteiro; em cerca de 1 de cada 5
  disputas, um votante tinha posição no mercado que julgava (FATO SECUNDÁRIO, Wall Street Journal via Finance
  Magnates, mai/2026).
- Um mercado de US$ 7 milhões resolveu SIM sem o fato ter ocorrido; um detentor votou com 25% dos votos; não houve
  reembolso (FATO SECUNDÁRIO, CoinDesk e outros, mar/2025).
- 821 contas ganharam US$ 8,2 milhões em janelas de liquidação provavelmente manipuladas nos mercados de Bitcoin de
  5 minutos; 93% do prejuízo caiu no pequeno apostador (FATO SECUNDÁRIO, CoinDesk, ago/2026).
- O token que decide as disputas vale US$ 37,5 milhões no total, 99% abaixo do topo de 2021 (FATO SECUNDÁRIO,
  CoinGecko, 4/out/2026). É um oráculo pequeno decidindo mercados que giram bilhões por mês.

**Quem abre e quem patrocina.** As perguntas são abertas pela equipe, com sugestões do público pelo X. Existe um
programa chamado "Sponsor Market Rewards": qualquer um deposita dinheiro para premiar quem deixa ofertas no livro de
um mercado. O mínimo é de US$ 0,1 por dia e o patrocinador não recebe nada em troca (FATO, documentação). A mediana é
de US$ 3 por dia por mercado, e só 882 de 17.866 mercados recebem US$ 50 ou mais por dia (FATO SECUNDÁRIO, Vultax,
set/2026). Esses números voltam na seção 7.4, porque são o único precedente de "patrocínio de mercado" achado.

**Outros fatos.** O token POLY foi confirmado em 24/out/2025 e ainda não tinha sido lançado em 3/out/2026 (FATO
SECUNDÁRIO; a ausência de lançamento é FATO, central de ajuda). O Brasil está na lista de países que só podem fechar
posição, não abrir (FATO, documentação, 3/out/2026). O estado de Nova York processou a empresa em 24/set/2026 (FATO;
ver capítulo 15).

### 6.5 World (dentro da Phantom)

O World é o concorrente com a melhor distribuição: aparece dentro da Phantom, a carteira que o público de Solana já
usa. A Phantom declara mais de 20 milhões de usuários (FATO SECUNDÁRIO) e teria cerca de 15 milhões ativos por mês
no início de 2026 (FATO SECUNDÁRIO, fonte fraca).

- **Volume.** US$ 1,14 milhão em junho de 2026, US$ 13,22 milhões em julho, US$ 22,20 milhões em agosto e US$ 15,44
  milhões em setembro; US$ 52,94 milhões no acumulado (FATO SECUNDÁRIO, DefiLlama, set/2026).
- **Dinheiro travado.** US$ 170,8 mil. Dinheiro travado é o total parado dentro do protocolo num dado momento. Com
  esse valor, cada dólar girou cerca de 90 vezes no mês (INFERÊNCIA). O número importa para a seção 9.4: no pote, o
  dólar entra uma vez por pergunta e fica parado até a resolução.
- **Quem decide.** Uma chave da empresa cria os mercados e grava o resultado; a instrução que grava o resultado não
  leva prova nem oráculo (FATO SECUNDÁRIO, Chainstack Labs, 11/set/2026). A empresa diz que o resultado vem do
  Chainlink, mas esse serviço roda fora da rede e alimenta a chave: quem olha a rede não consegue distinguir.
- **Taxa.** 0,1 × p × (1 − p) × contratos. Exemplo oficial: 100 contratos a US$ 0,75 pagam US$ 1,875, ou 2,5% dos
  US$ 75 pagos; com o preço em 50 centavos, a taxa é de 5% do valor pago (FATO, documentação). Além disso há a margem
  de quem forma o preço, de 0% a 8% nos casos observados (FATO SECUNDÁRIO).
- **Falhas.** Ficou 29,5 horas fora do ar depois do lançamento de 9/set/2026; tinha lista de espera de mais de 1
  milhão de pessoas e cerca de 4.000 mercados abertos (FATO SECUNDÁRIO, set/2026).

**Leitura.** O World mostra duas coisas ao mesmo tempo. A primeira: mesmo com a melhor vitrine de Solana, o volume é
pequeno. A segunda: o usuário aceita uma chave única decidindo tudo, desde que a experiência seja simples (assinar e
pronto, pagamento automático). É o concorrente que o Baked Market mais precisa estudar pelo lado da experiência.

### 6.6 Limitless

A Limitless é a maior plataforma de previsão na rede Base. Interessa por três motivos: publica tudo (taxas, regras de
indicação e política de reembolso), deixa qualquer usuário criar pergunta e tem token próprio. O que aconteceu com o
volume e com o token dela é o aviso mais claro do setor.

Tabela 6.3. Limitless, volume mensal em milhões de dólares (FATO SECUNDÁRIO, DefiLlama, set/2026).

| nov/25 | dez/25 | jan/26 | fev/26 | mar/26 | abr/26 | mai/26 | jun/26 | jul/26 | ago/26 | set/26 |
|---|---|---|---|---|---|---|---|---|---|---|
| 65,2 | 75,6 | 47,2 | 72,5 | 91,0 | 102,8 | 250,9 | 173,0 | 85,9 | 27,5 | 10,75 |

- **A queda.** De maio a setembro de 2026 o volume caiu 96% (INFERÊNCIA); a causa não foi encontrada. O acumulado é
  de US$ 1,467 bilhão.
- **Taxa.** No AMM, 0,40% fixa; no livro de ordens, compra de 0,40% a 3,00% e venda de 0,42% a 1,50%, conforme o
  preço, e só paga quem aceita uma oferta que já estava no livro (FATO, documentação). A taxa efetiva em 30 dias foi
  de 1,9% (US$ 186,8 mil sobre US$ 9,88 milhões; INFERÊNCIA). A arrecadação foi de US$ 3,82 milhões em maio de 2026
  para US$ 0,20 milhão em setembro, com US$ 14,13 milhões no total (FATO SECUNDÁRIO, DefiLlama).
- **Token.** O LMTS saiu de US$ 0,694 em 22/out/2025 para US$ 0,0420 em 4/out/2026, queda de 94%; quem segura o token
  não recebe nada das taxas (FATO SECUNDÁRIO, CoinGecko e DefiLlama).
- **Capital.** Captou cerca de US$ 17 milhões em 2025 (FATO SECUNDÁRIO; a soma é INFERÊNCIA).
- **Criação e reembolso.** Qualquer usuário cria mercado e recebe 2% das taxas dele; há uma política escrita de
  reembolso para o caso de resolução errada (FATO, documentação, out/2026).

**Leitura.** Dezessete milhões de dólares captados, token, pontos e criação aberta não seguraram o volume. O risco
que a Limitless ilustra é o de construir volume com incentivo e vê-lo ir embora quando o incentivo acaba. Esse risco
volta na seção 7.5 (fundo de prêmios) e na seção 8.7 (ordem dos tokens).

### 6.7 Como cada um resolve

Resolução é o ato de gravar o resultado da pergunta, de forma definitiva. É onde o Baked Market quer ser diferente.
Nele, a resolução é feita por um leitor on-chain: uma parte do programa que abre uma conta da Solana, lê um número ou
uma chave e responde sim ou não, sem ninguém informar nada (ver seção 4.1).

Tabela 6.4. Quadro comparativo (FATO e FATO SECUNDÁRIO, análise dos cinco, out/2026).

| | Mecanismo | Quem abre as perguntas | Como resolve | Identificação |
|---|---|---|---|---|
| Polymarket | Livro de ordens | A equipe, com sugestões do público | Oráculo UMA, com votação em caso de disputa | Carteira no site internacional; cadastro nos EUA |
| Kalshi | Livro de ordens, bolsa regulada nos EUA | A empresa | Regra do contrato e decisão interna | Cadastro completo |
| Melee (Solana) | Pote com curva e piso de retorno | Meta: qualquer um | Pessoas (criador ou equipe); página oficial em construção | Não encontrado |
| PNP (Solana) | Curva de ligação; também pote entre duas partes | Qualquer um | Modelos de linguagem; DAO de retaguarda | Nenhuma mencionada |
| World (Solana, na Phantom) | Formadores de mercado acionados por roteador | Só a chave da empresa | Chave da empresa, alimentada pelo Chainlink fora da rede | Opcional; bloqueia regiões sob sanção |
| Limitless (Base) | Livro de ordens e AMM | Equipe e qualquer usuário | Pyth, Chainlink, provedores esportivos e, em parte, a equipe | Sem cadastro de rotina; bloqueia EUA e outros |
| Baked Market | Pote | A equipe; patrocinador pede | Leitura de dado on-chain | Só carteira (D-35) |

**A resposta.** Nenhum dos cinco resolve por leitura direta de conta on-chain, sem pessoa, sem votação e sem serviço
externo informando o resultado (INFERÊNCIA sobre os fatos lidos, out/2026). A Polymarket vota. O World automatiza
fora da rede e grava com uma chave. A Limitless usa oráculos de preço, provedores esportivos e a própria equipe. O PNP
pergunta a modelos de linguagem, mesmo quando o assunto é um número on-chain. No Melee, decide o criador ou a equipe.
Pyth e Chainlink, que aparecem na tabela, são redes de oráculos: publicam dentro da blockchain preços colhidos fora
dela.

Ressalva **[A confirmar]**: fora dos cinco, o PancakeSwap Prediction (pote de preço em rodadas curtas) e o
Hyperliquid HIP-4 podem resolver on-chain; a pesquisa não verificou.

### 6.8 Onde o Baked Market é diferente e onde não é

As cinco conclusões da pesquisa, sem suavizar.

1. **É diferencial real em confiança.** A queixa mais documentada do setor é a resolução: mais de 1.150 mercados em
   arbitragem na Polymarket só até maio de 2026, um caso de US$ 7 milhões sem reembolso, a chave única do World.
   "O programa lê a conta e qualquer um confere" responde a essa queixa e dispensa caução, prazo de disputa e juiz.
2. **É nicho em tamanho.** Esportes são 62% do volume do setor (FATO SECUNDÁRIO, Bernstein, abr/2026), e política e
   economia vêm em seguida. Nada disso se lê numa conta da Solana. Dentro de cripto, a maior parte das apostas é sobre
   preço de Bitcoin e de Ethereum em corretoras, que também não é dado on-chain. A fatia do volume atual que caberia
   na regra do Baked Market não foi encontrada, e é pequena.
3. **O nicho coincide com o público, em hipótese.** Quem vive no pump.fun acompanha coisas que estão on-chain: se um
   token queima oferta, se trava liquidez, se completa a curva. Aí a regra é vantagem, não limite. Mas a pesquisa não
   achou nenhum mercado aberto sobre queima, renúncia, trava ou formatura de tokens de terceiros em nenhuma plataforma
   (FATO, ausência em busca limitada, out/2026). A coincidência é plausível e não está provada (ver seção 2.5).
4. **Não é escudo contra manipulação.** O caso dos US$ 8,2 milhões mostra que um mercado resolvido por número pode ser
   empurrado por quem aposta. Token pequeno é mais fácil de empurrar que Bitcoin. O que protege é a escolha da
   pergunta, a média no tempo e o teto de pote (ver seções 4.2 e 4.4), não a leitura on-chain em si.
5. **Pode ser copiado.** O World já tem o encanamento automático; trocar a chave por leitura on-chain em perguntas de
   cripto é trabalho de engenharia, não uma barreira (risco R-15, seção 14.2). A defesa possível é chegar primeiro e
   ter comunidade.

**O segundo diferencial.** Nenhum dos cinco vende patrocínio de pergunta com contrapartida (INFERÊNCIA sobre os fatos
lidos). É diferencial e é risco: não existe preço de referência para as faixas de US$ 500, 1.500 e 5.000 (ver
seção 7.4).

**Onde o Baked Market não é diferente.** A taxa de 3% está dentro da faixa do setor em potes equilibrados (seção
7.2). A equipe abrindo as perguntas é o que fazem Polymarket e World; quem abriu a criação para qualquer um (PNP e
Limitless) não mostrou que isso traz volume. Entrar só com carteira, sem identificação, é o que fazem PNP e
Limitless. O pote é o mecanismo do Melee e do PancakeSwap Prediction. Nada disso, sozinho, faz alguém trocar de
plataforma.

A frase que o plano sustenta para o público é "resultado verificável on-chain, pago em minutos, sem disputa". O plano
não promete o tamanho de mercado da Polymarket.

### 6.9 O que copiar

Tabela 6.5. Onde cada um é mais forte, onde é mais fraco e o que copiar (INFERÊNCIA, apoiada nos fatos das seções 6.2
a 6.6).

| Concorrente | Mais forte que o Baked Market | Mais fraco que o Baked Market | O que copiar |
|---|---|---|---|
| Melee | US$ 3,5 mi captados; mecanismo de pote com piso e saída já publicado; fila de 49 mil; pontuação que prende o usuário antes do lançamento | Sem dinheiro real até hoje; resolução por pessoas; regra de preço difícil de explicar; taxa e token indefinidos; sem auditoria | Beta com pontuação antes da rede principal; mostrar na tela quanto a pessoa recebe se acertar; códigos de comunidade |
| PNP | Criação em segundos por qualquer um; criador recebe 30% da taxa; ferramentas prontas para robôs e agentes | Quase sem uso; resolução por modelo de linguagem; criador pode ser o juiz; token caiu 93%; mudou de produto | Checagem automática, na criação, de se a pergunta pode ser resolvida; tipos de pergunta por modelo pronto |
| Polymarket | Marca, liquidez e US$ 4,6 bi por mês; sai-se a qualquer hora; indicação e parceiros; US$ 1,6 bi da ICE; qualquer assunto | Resolução contestada e sem reembolso; Brasil só fecha posição; usuário não cria nem patrocina de verdade; não é Solana | Regra "o título descreve, as regras decidem"; indicação com parte da taxa; média no tempo em vez de foto do instante; sugestão de pergunta pelo X (já está no plano) |
| World | Está dentro da carteira que o público já usa; aposta sem depósito prévio; pagamento automático; resolução em minutos | Uma chave decide tudo; taxa não publicada e mais cara (até 5% do valor pago, mais margem); sem disputa; 29,5 horas fora do ar no lançamento; só US$ 15 mi por mês | Assinar e pronto, sem depósito; pagamento automático ao vencedor; publicar a taxa, já que eles não publicam |
| Limitless | Documentação exemplar; taxa, indicação e reembolso escritos; criação aberta com selo; US$ 17 mi captados | Volume caiu 96% e token 94%; o token não recebe taxa; cópia da Polymarket; resolução manual em parte; não é Solana | Política de reembolso por resolução errada, escrita; página de taxas com exemplo numérico; selo que separa pergunta da equipe e de terceiro |

**O que copiar barato**, em ordem de custo:

1. **Página de taxas com exemplo numérico.** A do Baked Market já tem o exemplo pronto (seção 3.3).
2. **Política de reembolso escrita** para o caso de resolução errada. Liga-se à objeção OBJ-25 (seção 4.7).
3. **Pagamento sem fricção** ao vencedor. O World paga sozinho; no Baked Market o desenho técnico prevê que o
   vencedor retire a sua parte (seção 11.3), e o que se copia é a facilidade: um botão, uma assinatura.
4. **Indicação com parte da taxa**, com trava contra autoindicação. É custo de aquisição, não receita (seção 10.2).
5. **Beta com pontuação e sem dinheiro**, antes da rede principal. É também o teste de demanda da seção 2.5.

## 7. Modelo de negócio e receita

### 7.1 De onde vem a receita

O Baked Market tem duas linhas de receita com número e uma lista de opções para depois.

| Linha | Sobre o que incide | Quanto | Estado |
|---|---|---|---|
| Taxa | O pote de cada pergunta, na resolução | 3% | Decidido (D-26) |
| Patrocínio | O valor pago pelo patrocinador | Faixas de US$ 500, 1.500 e 5.000; a parte que fica com a banca é 70% ou 30% | Faixas decididas (D-18); divisão ambígua (D-19) |
| Outras formas | Dados, indicação, taxa de parceiro, fatia da penalidade e outras | Sem número firme | Opções futuras (seção 7.7) |

Três termos, para o capítulo inteiro. **Pote (pool)** é o cofre de uma pergunta: todas as apostas entram nele e, no
fim, quem acertou divide o que sobrou depois da taxa. **Taxa** é a parte do pote que fica com a banca. **Banca** é a
empresa que opera a plataforma e recebe a taxa.

O setor confirma a ordem de importância. Nos líderes, a taxa por negociação é a única linha com peso comprovado: é
100% da receita bruta da Polymarket medida on-chain em 2026, e é a única linha com número divulgado na Kalshi, que
arrecadou US$ 263,5 milhões em 2025 (FATO SECUNDÁRIO, DefiLlama e BJ21). A pergunta do fundador, "essas empresas não
tem outras formas de monetização, não?", é respondida por inteiro na seção 7.7. A resposta curta: têm, mas nenhuma
com valor divulgado.

A terceira trilha de dinheiro do produto, o token (D-04), não é linha de receita da empresa neste plano. O que o
token pode levar aos potes está no capítulo 8; por que a venda do token não entra como caixa está na seção 9.6.

### 7.2 A taxa de 3%

**Decisão.** A taxa é de 3% do pote: "receita dos 3%, sim." O critério que o fundador deu antes: "vamos trabalhar
dentro das taxas de mercado, nem maior, nem menor." A taxa é cobrada também na devolução do pote de um lado só
(D-07, seção 3.4).

No exemplo da seção 3.3 (300 no SIM, 700 no NÃO), o pote é de 1.000, a taxa é de 30 e sobram 970 para quem acertar.

**Como a taxa se compara.** Os concorrentes cobram de jeitos diferentes, e por isso a comparação exige uma régua
comum: a taxa efetiva, que é quanto a plataforma arrecada dividido pelo que os usuários pagaram.

Tabela 7.1. O que os concorrentes cobram.

| Quem | Como cobra | Exemplo ou taxa efetiva | Etiqueta |
|---|---|---|---|
| Polymarket (internacional) | Só paga quem aceita uma oferta do livro: contratos × coeficiente × p × (1 − p). Coeficiente: cripto 0,07; esportes, economia, cultura e clima 0,05; finanças, política e tecnologia 0,04; geopolítica 0 | 100 ações de cripto a US$ 0,50 pagam US$ 1,75 (3,5% dos US$ 50). Efetiva: 2,0% dos dólares pagos | FATO (documentação, 3/out/2026); a efetiva é INFERÊNCIA |
| Kalshi | 0,07 × contratos × p × (1 − p), para quem aceita a oferta; teto de 1,75 centavo por contrato a 50 centavos | Em 2025, US$ 263,5 mi de taxa sobre cerca de US$ 23 bi (1,15%; a régua do volume não é declarada) | FATO SECUNDÁRIO [A confirmar] |
| Limitless | Formador de mercado automático (AMM): 0,40% fixa. Livro de ordens: compra de 0,40% a 3,00%; venda de 0,42% a 1,50% | Efetiva: 1,9% | FATO (documentação); a efetiva é INFERÊNCIA |
| World (Phantom) | 0,1 × p × (1 − p) × contratos, mais a margem de quem forma o preço (0% a 8% observados) | 100 contratos a US$ 0,75 pagam US$ 1,875 (2,5% dos US$ 75). A 50 centavos, 5% do valor pago | FATO (fórmula); FATO SECUNDÁRIO (margem) |
| PNP | 1% por negociação | US$ 1.000 de taxa em US$ 100.000 negociados | FATO (documentação) |
| PancakeSwap Prediction | 3% do pote de cada rodada; rodada cancelada devolve 100%, sem taxa | Pote de 1.000: 30 | FATO |
| FactCheck (Solana) | 2,5% do pote | Pote de 1.000: 25 | FATO SECUNDÁRIO |
| PredictIt | 10% do lucro de cada posição vencedora e 5% no saque | Lucro de 100: 10 | FATO SECUNDÁRIO |
| Faixa do setor | Taxa efetiva sobre dólares pagos | De 1,9% a 5% | INFERÊNCIA |
| **Baked Market** | 3% do pote, cobrados também na devolução do pote de um lado só | Pote de 1.000: 30 | Decisão (D-26, D-07) |

Medida em dólares pagos, a taxa efetiva do setor fica entre 1,9% e 5% (INFERÊNCIA, análise dos cinco, out/2026). Os
3% do pote ficam dentro dessa faixa em potes equilibrados. Há uma diferença de forma que o usuário precisa entender:
no livro de ordens paga-se a cada compra e a cada venda; no pote paga-se uma vez, no fim, sobre o pote inteiro. É
essa segunda característica que a objeção OBJ-07, logo abaixo, ataca.

**O caminho de cada US$ 100 apostados.** A tabela mostra para onde vai o dinheiro em dois casos. O primeiro supõe
que ninguém sai antes da resolução. O segundo usa as premissas do modelo financeiro para a saída antecipada (desistir
da aposta antes da resolução e receber parte do dinheiro de volta): 20% do dinheiro sai antes, pagando penalidade
média de 25%. Essas duas premissas não têm dado; são INFERÊNCIA (premissa sem dado).

Tabela 7.2. O caminho de cada US$ 100 apostados (INFERÊNCIA; aritmética sobre as decisões D-26 e D-27).

| Destino | Sem saída antecipada | Com a saída antecipada do modelo |
|---|---|---|
| Volta a quem saiu antes | 0 | US$ 15,00 |
| Pote final | US$ 100,00 | US$ 85,00 |
| Volta aos vencedores | US$ 97,00 | US$ 82,45 |
| Taxa da casa (3% do pote final) | US$ 3,00 | US$ 2,55 |
| Tesouraria em Bitcoin (25% da taxa) | US$ 0,75 | US$ 0,6375 |
| Operação (25%) | US$ 0,75 | US$ 0,6375 |
| Recompra e queima do token da venda privada (25%) | US$ 0,75 | US$ 0,6375 |
| Fundo de prêmios (25%) | US$ 0,75 | US$ 0,6375 |

Conferência da segunda coluna: 15 + 82,45 + 2,55 = 100. A saída antecipada tira dinheiro do pote antes de a taxa ser
cobrada, e por isso reduz a receita. Cobrar ou não os 3% sobre o valor devolvido a quem sai é pergunta em aberto; o
modelo não cobra, pela leitura literal das decisões.

**O favorito e a taxa fixa.** Chance é a fatia do pote que está em cada lado. Quando um lado concentra quase todo o
pote, sobra pouco dinheiro do lado perdedor para dividir, e a taxa de 3% sobre o pote inteiro passa a comer uma parte
grande do ganho de quem acertou.

Tabela 7.3. A parte do ganho que a taxa leva, conforme a fatia do lado vencedor (INFERÊNCIA, revisão crítica).

| Fatia do lado vencedor no pote | Cada US$ 1 recebe (0,97 ÷ fatia) | Ganho sem taxa | Parte do ganho que a taxa leva |
|---|---|---|---|
| 50% | 1,940 | 1,000 | 6% |
| 70% | 1,386 | 0,429 | 10% |
| 80% | 1,213 | 0,250 | 15% |
| 90% | 1,078 | 0,111 | 30% |
| 95% | 1,021 | 0,053 | 60% |
| 97% | 1,000 | 0,031 | 100% |
| 99% | 0,980 | 0,010 | mais que tudo: quem acerta perde 2% |

> **Objeção registrada OBJ-07 · severidade alta**
>
> **Decisão do fundador:** taxa de 3% do pote.
>
> **O que a revisão crítica achou:** a taxa fixa sobre o pote inteiro castiga quem aposta no favorito. Quanto mais o
> pote pende para o lado que vence, maior a parte do ganho que a taxa leva. Perguntas sobre fatos on-chain tendem a
> ter favorito claro.
>
> **Evidência:** com 90% do pote no lado vencedor, a taxa leva 30% do ganho; com 97%, quem acerta recebe exatamente
> o que pôs; acima disso, perde dinheiro mesmo acertando (INFERÊNCIA, revisão crítica, tabela 7.3). No mesmo caso de
> 90%, a Polymarket cobraria 0,7% do valor pago numa pergunta de cripto (INFERÊNCIA sobre a fórmula oficial).
>
> **Alternativa proposta:** manter 3% como teto e mudar a base: a taxa passa a ser o menor entre 3% do pote e 10% do
> lado perdedor; ou limitar a taxa ao tamanho do prêmio. Exemplo: pote de 1.000 com 950 no lado vencedor. Hoje a taxa
> é 30 e o vencedor recebe 1,021 por dólar (970 ÷ 950). Com o teto pelo lado perdedor, a taxa é 5 (10% de 50) e o
> vencedor recebe 1,047 (995 ÷ 950). No modelo financeiro, a taxa média cai para 2,3% e a regra se paga se trouxer
> 30% mais volume (seção 9.7). Em pote equilibrado nada muda.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 7.3 O destino da taxa

**Decisão.** O fundador dividiu a taxa em quatro partes iguais: "25% para um treasure btc da empresa, 25% para
operação (não deve ser todo o custo que foi estimado), 25% recompra e queima do nosso token em ico privado e, 25%
para fundo de prêmios" (D-27).

O que é cada parte, em uma linha:

- **Tesouraria em Bitcoin.** Reserva da empresa guardada em Bitcoin (seção 7.6).
- **Operação.** O dinheiro que paga as contas: auditoria, infraestrutura, jurídico e, quando houver, equipe
  (seção 9.2).
- **Recompra e queima.** A empresa usa essa parte para comprar o próprio token da venda privada no mercado e
  destruí-lo, reduzindo a oferta (seção 8.5).
- **Fundo de prêmios.** Reserva para pôr prêmio nos potes (seção 7.5).

Tabela 7.4. Quanto cada parte recebe, por volume apostado no mês, sem saída antecipada (INFERÊNCIA; aritmética).

| Volume apostado por mês | Taxa (3%) | Cada uma das quatro partes |
|---|---|---|
| US$ 100 mil | 3.000 | 750 |
| US$ 400 mil | 12.000 | 3.000 |
| US$ 1 milhão | 30.000 | 7.500 |
| US$ 1,33 milhão | 40.000 | 10.000 |
| US$ 3,33 milhões | 100.000 | 25.000 |

A frase que este plano não pode omitir: **a margem que paga as contas não é 3%, é 0,75% do volume (0,64% com a saída
antecipada).** De cada US$ 100 apostados, US$ 0,64 chega à operação. Todo o resto do capítulo 9 decorre desse número:
para pagar um custo de US$ 3.000 por mês, é preciso que US$ 471 mil sejam apostados no mês; para US$ 10.000, US$ 1,57
milhão; para US$ 25.000, US$ 3,92 milhões (INFERÊNCIA, modelo financeiro; seção 9.4).

Dois detalhes de funcionamento. A divisão em quatro é feita fora do programa, por uma carteira que só assina quando
várias pessoas aprovam (multisig), com registro público (seção 11.4). E a parte da recompra não tem o que comprar
enquanto o token da venda privada não existir; a proposta é acumulá-la em USDC (a moeda digital que vale 1 dólar),
numa conta pública, até lá (seção 8.7).

> **Objeção registrada OBJ-09 · severidade crítica**
>
> **Decisão do fundador:** a taxa se divide em quatro partes de 25% (Bitcoin, operação, recompra e queima, fundo de
> prêmios).
>
> **O que a revisão crítica achou:** dividir em quatro desde o primeiro dia deixa só 0,75% do volume para pagar a
> operação e multiplica por quatro o volume de equilíbrio. Enquanto a operação não se paga, a empresa compra Bitcoin
> e recompra token com uma mão e pede dinheiro aos sócios com a outra.
>
> **Evidência:** no cenário razoável, o regime da decisão chega ao azul e volta ao déficit no mês 18, quando a equipe
> passa a receber; durante a subida, cada dólar de déficit coberto pelos sócios é igual a um dólar enviado ao Bitcoin
> (INFERÊNCIA, modelo financeiro e revisão de finanças; seções 9.5 e 7.6).
>
> **Alternativa proposta:** a "regra de partida". O destino final continua o que o fundador decidiu; muda a ordem.
> Até a operação se pagar por três meses seguidos e haver seis meses de custo guardados, as partes de Bitcoin e de
> recompra ficam em USDC, em contas públicas, e podem cobrir o déficit, com registro. Depois do gatilho, o excedente
> segue para Bitcoin e recompra. O fundo de prêmios recebe os seus 25% desde o primeiro dia.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

As duas contas, lado a lado. O **regime (a)** é a decisão aplicada sem condição; o **regime (b)** é a regra de
partida. A comparação completa, por cenário, está na seção 9.5.

Tabela 7.5. A decisão e a regra de partida (INFERÊNCIA, modelo financeiro; "A" e "B" são os sentidos do 70/30).

| | Regime (a): a decisão | Regime (b): regra de partida |
|---|---|---|
| De cada US$ 100 apostados, quanto pode pagar custo | US$ 0,6375 (US$ 0,75 sem saída antecipada) | US$ 1,9125 (US$ 2,25 sem saída antecipada) |
| Volume por mês para pagar US$ 3.000 de custo | US$ 470.588 | US$ 156.863 |
| Volume por mês para pagar US$ 10.000 de custo | US$ 1.568.627 | US$ 522.876 |
| Cenário razoável: primeiro mês no azul (A / B) | Mês 8 / mês 13 | Mês 6 / mês 6 |
| Cenário razoável: capital dos sócios, sem reserva (A / B) | US$ 65.238 / 91.322 | US$ 58.628 / 59.028 |
| Bitcoin e recompra | Recebem desde o primeiro dia | Esperam em USDC até o gatilho; depois recebem o excedente |
| Fundo de prêmios | 25% da taxa | 25% da taxa |

### 7.4 Patrocínio

Patrocinador é quem paga uma das três faixas para pôr dinheiro numa pergunta e receber contrapartidas (selo,
destaque, texto na pergunta, publicação no X). O produto está descrito na seção 3.7. Aqui fica a conta.

**Decisão.** Três faixas: US$ 500, 1.500 e 5.000 (D-18). O dinheiro do patrocinador entra no pote de uma de duas
formas, à escolha dele (D-21). No **prêmio neutro**, o dinheiro é somado ao pote sem escolher lado e aumenta o
retorno de quem acertar, qualquer que seja o resultado. Na **aposta de patrocinador**, o dinheiro entra num lado,
como uma aposta grande, com selo.

**Em aberto.** A divisão do valor pago. O fundador disse: "70/30 dessa grana vai pra banca e a outra parte pra
liquidez como neutra ou aposta de patrocinador" (D-19). A frase admite duas leituras, e só ele pode dizer qual vale.
No **sentido A**, 70% ficam com a banca e 30% vão ao pote. No **sentido B**, 30% ficam com a banca e 70% vão ao pote.
Toda tabela deste plano mostra os dois.

**O pote de exemplo.** US$ 10.000 em apostas, 6.000 no SIM e 4.000 no NÃO. A taxa de 3% incide sobre o pote
inteiro, inclusive sobre o dinheiro do patrocinador (premissa da pesquisa; não decidido). Sem patrocinador, a banca
fica com 300; se o SIM vence, cada US$ 1 recebe 1,617; se o NÃO vence, 2,425; os apostadores, somados, perdem 3%.

Tabela 7.6. O que a banca recebe, no total, em cada faixa e sentido (INFERÊNCIA, pesquisa de monetização).

| Faixa | Sentido | Vai ao pote | Fica com a banca | Taxa de 3% sobre o pote maior | Banca no total |
|---|---|---|---|---|---|
| US$ 500 | A | 150 | 350 | 304,50 | 654,50 |
| US$ 500 | B | 350 | 150 | 310,50 | 460,50 |
| US$ 1.500 | A | 450 | 1.050 | 313,50 | 1.363,50 |
| US$ 1.500 | B | 1.050 | 450 | 331,50 | 781,50 |
| US$ 5.000 | A | 1.500 | 3.500 | 345,00 | 3.845,00 |
| US$ 5.000 | B | 3.500 | 1.500 | 405,00 | 1.905,00 |

No sentido A a banca recebe mais por patrocínio. No sentido B o pote fica maior, e é o pote maior que o apostador vê.

Tabela 7.7. Prêmio neutro: o que muda para o apostador (INFERÊNCIA, pesquisa de monetização).

| Faixa e sentido | Prêmio no pote | SIM vence: cada US$ 1 recebe | NÃO vence: cada US$ 1 recebe | Saldo de todos os apostadores juntos |
|---|---|---|---|---|
| Sem patrocinador | 0 | 1,617 | 2,425 | perdem 300 (−3,0%) |
| US$ 500, A | 150 | 1,641 | 2,461 | perdem 154,50 (−1,5%) |
| US$ 500, B | 350 | 1,673 | 2,510 | ganham 39,50 (+0,4%) |
| US$ 1.500, A | 450 | 1,689 | 2,534 | ganham 136,50 (+1,4%) |
| US$ 1.500, B | 1.050 | 1,786 | 2,680 | ganham 718,50 (+7,2%) |
| US$ 5.000, A | 1.500 | 1,859 | 2,789 | ganham 1.155 (+11,6%) |
| US$ 5.000, B | 3.500 | 2,183 | 3,274 | ganham 3.095 (+31,0%) |

**A linha dos 3,09%.** É o tamanho do prêmio, em relação às apostas, a partir do qual os apostadores, somados,
deixam de perder para a taxa. A conta: o prêmio cobre a taxa quando 0,97 × (apostas + prêmio) = apostas, isto é,
quando o prêmio passa de 3,09% do total apostado. Num pote de US$ 10.000 a linha é US$ 309. A faixa de US$ 500 só
passa dessa linha no sentido B (350 contra 309); no sentido A, os 150 que vão ao pote não cobrem a taxa.

Acima da linha acontece outra coisa: quem aposta nos dois lados, na proporção do pote, lucra sem risco. Esse
dinheiro entra até o prêmio deixar de compensar, o que pode chegar a 32,3 vezes o valor do prêmio (INFERÊNCIA,
pesquisa de monetização).

| Prêmio no pote | Apostas que ele sustenta até zerar a vantagem | Taxa de 3% gerada nesse ponto |
|---|---|---|
| US$ 150 | US$ 4.850 | US$ 150 |
| US$ 350 | US$ 11.317 | US$ 350 |
| US$ 1.050 | US$ 33.950 | US$ 1.050 |
| US$ 3.500 | US$ 113.167 | US$ 3.500 |

A leitura tem dois lados (INFERÊNCIA). Para a banca é bom: cada dólar de prêmio pode voltar como até um dólar de
taxa. Para a medição é ruim: esse volume não é de apostador de verdade e some no pote seguinte que não tiver prêmio.

Tabela 7.8. Aposta de patrocinador no SIM, mesmo pote (INFERÊNCIA, pesquisa de monetização).

| Faixa e sentido | Aposta no SIM | SIM vence: cada US$ 1 recebe | Patrocinador recebe de volta | NÃO vence: cada US$ 1 recebe |
|---|---|---|---|---|
| Sem patrocinador | 0 | 1,617 | não se aplica | 2,425 |
| US$ 500, A | 150 | 1,601 | 240 | 2,461 |
| US$ 500, B | 350 | 1,581 | 553 | 2,510 |
| US$ 1.500, A | 450 | 1,572 | 707 | 2,534 |
| US$ 1.500, B | 1.050 | 1,520 | 1.596 | 2,680 |
| US$ 5.000, A | 1.500 | 1,487 | 2.231 | 2,789 |
| US$ 5.000, B | 3.500 | 1,378 | 4.824 | 3,274 |

Na aposta de patrocinador, quem apostou no mesmo lado dele ganha menos, porque divide o prêmio com uma aposta grande.
E, se o patrocinador acerta, recupera quase tudo: na faixa de US$ 5.000 do sentido B, ele paga 5.000 e recebe 4.824,
de modo que o "patrocínio" custou 176. Isso é aposta com selo, não prêmio. A objeção sobre o patrocinador que
controla o resultado e aposta num lado é a OBJ-02, na seção 3.7.

**O que os precedentes sustentam.** A pesquisa separou os casos pelo que está sendo vendido. Quando se vende
**prêmio**, quase tudo vai ao pote: é assim no programa da Polymarket, no prêmio garantido dos torneios de pôquer e
nos torneios financiados do Metaculus. Quando se vende **vitrine**, tudo vai ao site: é assim no DexScreener, no
DEXTools, no CoinGecko e no CoinMarketCap. Não foi encontrado precedente de divisão 70/30 em nenhum dos dois sentidos
(INFERÊNCIA, pesquisa de monetização). O sentido B é o que os precedentes de dinheiro somado ao pote sustentam. O
sentido A só se defende se o produto for anúncio, e anúncio se cobra por audiência entregue.

**O preço das faixas contra o mercado.**

Tabela 7.9. Preços praticados em produtos comparáveis.

| Produto | Preço | Etiqueta |
|---|---|---|
| DexScreener, anúncio de token | "a partir de US$ 299" | FATO (página oficial) |
| DexScreener, barra de tendências | "a partir de US$ 2.000" | FATO SECUNDÁRIO |
| DexScreener, Boosts (12 a 24 horas) | De cerca de US$ 100 a milhares | FATO (a duração); preço [A confirmar] |
| DEXTools, pares em alta por 24 horas | US$ 1.500 a 2.000 (tabela de 2024) | FATO SECUNDÁRIO antigo |
| CoinGecko e CoinMarketCap, banner por dia | A partir de US$ 1.350 e de US$ 1.150 | Fonte fraca (agência revendedora) [A confirmar] |
| CoinGecko, custo por mil impressões numa campanha real | US$ 8 | FATO SECUNDÁRIO (Trilokana, mai/2025) |
| Metaculus, torneio financiado | US$ 15 a 20 mil de prêmio | FATO SECUNDÁRIO |
| Myriad, competição da Copa | US$ 100.000 | FATO SECUNDÁRIO |

As três faixas estão dentro do que equipes de token já pagam por destaque. O problema é outro: esses sites vendem
uma audiência de milhões, que o Baked Market não tem no lançamento. A US$ 8 por mil impressões, a parte da banca numa
faixa de US$ 500 teria de entregar de 18.750 impressões (sentido B) a 43.750 (sentido A); na faixa de US$ 5.000, de
187.500 a 437.500 (INFERÊNCIA). Um site novo não entrega isso por pergunta. O que o patrocinador compra de concreto,
no começo, é o prêmio visível dentro do pote, coisa que nenhum site de anúncio vende.

**Quanto vale um patrocínio para a operação.** Se a parte da banca for inteira para a operação, cada patrocínio
substitui um volume de apostas igual à parte da banca dividida por 0,75% (INFERÊNCIA, revisão de finanças):

| Faixa | Sentido A: parte da banca | Volume de apostas que substitui | Sentido B: parte da banca | Volume de apostas que substitui |
|---|---|---|---|---|
| US$ 500 | 350 | US$ 46.667 | 150 | US$ 20.000 |
| US$ 1.500 | 1.050 | US$ 140.000 | 450 | US$ 60.000 |
| US$ 5.000 | 3.500 | US$ 466.667 | 1.500 | US$ 200.000 |

Se a parte da banca também for dividida em quatro, como a taxa, esses volumes caem para um quarto. Isso não foi
decidido. Há ainda o custo de vender: uma venda feita à mão foi estimada em US$ 125 (5 horas a US$ 25; INFERÊNCIA,
premissa sem dado). Na faixa de US$ 500 do sentido B, a banca fica com 150 e, depois desse custo, com US$ 25.

**Perguntas em aberto sobre o patrocínio [A confirmar com o fundador].** Qual parte é da banca (sentido A ou B). Se
a parte da banca vai inteira para a operação ou se divide em quatro. Se o dinheiro do patrocinador dentro do pote
paga os 3%. As três estão na lista da seção 16.1.

> **Objeção registrada OBJ-15 · severidade alta**
>
> **Decisão do fundador:** patrocínio em três faixas, de US$ 500, 1.500 e 5.000.
>
> **O que a revisão crítica achou:** o preço é o de uma vitrine com milhões de usuários. O Baked Market ainda não tem
> vitrine, e não há precedente de alguém pagando por patrocínio de pergunta com contrapartida.
>
> **Evidência:** no maior programa parecido, o da Polymarket, a mediana é de US$ 3 por dia por mercado, só 882 de
> 17.866 mercados recebem US$ 50 ou mais por dia e o patrocinador não recebe nada em troca (FATO, regras; FATO
> SECUNDÁRIO, valores, Vultax, set/2026). Não há nenhuma conversa registrada com um patrocinador em potencial.
>
> **Alternativa proposta:** conseguir de três a cinco cartas de intenção antes de construir o fluxo; vender a faixa
> de US$ 500 só por autoatendimento, sem trabalho humano; no começo, mandar quase tudo ao pote (sentido B); não
> projetar o patrocínio como receita central no primeiro ano.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 7.5 Fundo de prêmios

O fundador disse que o fundo "ainda não foi dito o que seria ... e pra que serve". Esta seção responde do zero.

**O que é.** O fundo de prêmios é uma reserva da banca, alimentada por 25% da taxa, para pôr prêmio nos potes e dar
ao primeiro apostador um motivo para entrar. É dinheiro que a casa dá a quem aposta, além do que os perdedores pagam.

**Por que existe.** Pote vazio não atrai ninguém. O primeiro apostador de uma pergunta não sabe se vai aparecer
alguém do outro lado. Se ninguém aparecer, ele recebe o dinheiro de volta menos a taxa: põe 100 e recebe 97 (seção
3.4). Entrar primeiro é, portanto, um mau negócio. Um prêmio já colocado no pote muda essa conta: quem entra primeiro
passa a disputar um dinheiro que já está lá.

**Quanto entra.** Como a taxa é 3% do pote e o fundo fica com um quarto dela, o fundo recebe 0,75% do volume
apostado (0,64% com a saída antecipada). Exemplo: com US$ 1 milhão apostado no mês, a taxa é de US$ 30.000 e o fundo
recebe US$ 7.500. Nos três cenários do capítulo 9:

Tabela 7.10. Quanto entra no fundo de prêmios (INFERÊNCIA, modelo financeiro; valores em dólares).

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Entra no mês 12 | 287 | 1.913 | 9.563 |
| Entra no mês 24 | 191 | 4.781 | 31.875 |
| Entrou em 12 meses | 2.725 | 12.431 | 62.156 |
| Entrou em 24 meses | 5.546 | 54.028 | 321.938 |
| Pote médio no mês 12 (volume ÷ perguntas) | 5.625 | 18.750 | 37.500 |

**Para que serve.** Quatro usos, do mais ao menos defensável (INFERÊNCIA, pesquisa de monetização):

1. **Abrir o pote.** Um prêmio pequeno em cada pergunta nova, para o primeiro apostador não entrar num pote vazio.
2. **Garantir pote mínimo** nas perguntas que a equipe quer em destaque.
3. **Torneio por período**, com classificação por acerto, não por volume.
4. **Indicação**, com trava contra autoindicação.

O que evitar: prêmio proporcional ao volume apostado, que atrai dinheiro que vai embora quando o prêmio acaba; e
prêmio grande demais em pote pequeno, que atrai a **colheita de prêmio**, isto é, apostar nos dois lados só para
levar o prêmio, sem opinião sobre a pergunta. Exemplo da colheita: um pote vazio recebe 100 de prêmio neutro; alguém
aposta 1 no SIM e 1 no NÃO; qualquer que seja o resultado, recebe 97% de 102, isto é, 98,94 por 2 apostados.

**O que os outros fazem.** A Polymarket pagou US$ 22,90 milhões em recompensa de liquidez de janeiro a 7/set/2026; a
Kalshi, US$ 2,95 milhões em 30 dias; a predict.fun fez uma competição de US$ 2 milhões em 39 dias; a Myriad, uma de
US$ 100 mil (FATO SECUNDÁRIO). A Polymarket devolve aos usuários cerca de 24% do que arrecada (INFERÊNCIA sobre FATO
SECUNDÁRIO, DefiLlama, 2026): os 25% do Baked Market estão na mesma faixa. Mas o retorno medido desses prêmios
(apostador novo e retenção por dólar gasto) não foi encontrado em nenhuma plataforma. E o que se viu depois de
campanhas de incentivo foi queda: Opinion −80,7% e Myriad −93,8% do primeiro para o segundo trimestre de 2026;
Limitless −96% de maio a setembro de 2026 (FATO SECUNDÁRIO).

**Como se mede se está se pagando.** A regra de bolso: cada dólar de prêmio só volta para a casa se trouxer aposta
que não existiria sem ele. Quanta aposta, depende do que se quer recuperar.

Tabela 7.11. Quanto o prêmio precisa atrair (INFERÊNCIA, modelo financeiro; entre parênteses, sem saída antecipada).

| O que se quer recuperar com o prêmio | Aposta nova por US$ 1 de prêmio | Parcela do volume que teria de existir por causa do fundo |
|---|---|---|
| A taxa inteira | US$ 39 (33) | 25% |
| A metade que fica na empresa (operação e Bitcoin) | US$ 78 (67) | 50% |
| Só o que paga custo (operação) | US$ 157 (133) | 100% |

A primeira linha vem de 1 ÷ 2,55% (ou 1 ÷ 3%, sem saídas). A última linha diz uma coisa incômoda: medido só pelo
dinheiro que paga custo, o fundo não se paga, porque teria de ser a causa de todo o volume.

Exemplo de medição numa pergunta. O prêmio foi de US$ 300. Perguntas parecidas, sem prêmio, fazem US$ 4.000 de
volume.

- Se esta fez US$ 15.000, o volume adicional é de 11.000 e a taxa adicional, de 330: o prêmio se pagou por pouco.
- Se esta fez US$ 8.000, o adicional é de 4.000, a taxa adicional é de 120, e o fundo perdeu 180 nessa pergunta.

Para a comparação ser possível, é preciso haver perguntas com prêmio e sem prêmio. Por isso a proposta é sortear
quais recebem prêmio. A regra de decisão proposta tem três sinais, medidos a cada trimestre, depois de 40 perguntas
com prêmio sorteado.

Tabela 7.12. A regra dos três sinais (INFERÊNCIA, modelo financeiro; os limites, fora 39 e 20%, são premissa).

| Sinal | Como se mede | Verde | Vermelho |
|---|---|---|---|
| Volume adicional por dólar de prêmio | (volume das perguntas com prêmio − volume de perguntas parecidas sem prêmio) ÷ prêmio | 39 ou mais | Abaixo de 20 |
| Retorno sem prêmio | Parcela das carteiras novas que aposta de novo, em 30 dias, numa pergunta sem prêmio | 20% ou mais | Abaixo de 10% |
| Colheita | Parcela do prêmio que foi para carteiras que apostaram nos dois lados | Até 20% | Acima de 50% |

A decisão: três verdes, aumentar o gasto; nenhum vermelho, manter (o fundo gasta até metade do que recebe); qualquer
vermelho, cortar (só o mínimo para abrir potes). Nos primeiros 90 dias, antes de haver taxa acumulada, a proposta é
os sócios porem US$ 7.500 em prêmios de abertura de até 3% do pote, em metade das perguntas, sorteadas. O tamanho do
fundo impõe um limite natural: ele inteiro dá para pôr o prêmio no teto de 3% do pote em uma de cada cinco perguntas.

> **Objeção registrada OBJ-16 · severidade alta**
>
> **Decisão do fundador:** 25% da taxa para o fundo de prêmios.
>
> **O que a revisão crítica achou:** o fundo só se paga se for a causa de um quarto de todo o volume; na medida que
> paga custo (a parte da operação), não se paga.
>
> **Evidência:** nenhuma plataforma publicou o retorno dos prêmios que distribuiu; Opinion, Myriad e Limitless
> perderam de 80% a 96% do volume quando o incentivo acabou (FATO SECUNDÁRIO, Predictefy e DefiLlama, 2026).
>
> **Alternativa proposta:** o dinheiro entra no fundo como decidido, mas só sai por regra: os três sinais medidos por
> trimestre, o critério de corte escrito antes do lançamento, prêmio com trava contra a colheita e prioridade para
> abrir potes.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 7.6 Tesouraria em Bitcoin

**Decisão.** 25% da taxa vão para "um treasure btc da empresa" (D-27): uma reserva da empresa guardada em Bitcoin,
comprada todo mês com um quarto da taxa bruta, antes de qualquer custo.

**Quem já fez algo parecido.**

Tabela 7.13. Precedentes de tesouraria em Bitcoin.

| Quem | Percentual e base | O que aconteceu | Etiqueta |
|---|---|---|---|
| Tether | Até 15% do lucro líquido | US$ 1,5 bi em Bitcoin em mar/2023 | FATO SECUNDÁRIO |
| Block | 10% do lucro bruto dos produtos de bitcoin, todo mês | Primeira compra de US$ 4,4 mi (abr/2024) | FATO |
| Méliuz (Brasil) | Até 10% do caixa | 45,72 BTC a preço médio de US$ 90.926 (mar/2025) | FATO |
| Strategy | Sem percentual fixo; comprado com dívida e ações | 847.363 BTC a preço médio de US$ 75.651; perda não realizada de US$ 14,46 bi no 1º tri/2026 | FATO SECUNDÁRIO |
| Metaplanet | Sem percentual fixo | 43.000 BTC custaram US$ 4,07 bi e valiam US$ 2,5 bi em 30/jun/2026 (38% abaixo do custo) | FATO SECUNDÁRIO |
| Baked Market | 25% da taxa bruta, antes de qualquer custo | Decisão (D-27) | Decisão |

Não foi encontrado nenhum protocolo de aposta ou de previsão que mande um percentual fixo da taxa para Bitcoin. O
preço do Bitcoin estava perto de US$ 58.800 no fim de junho de 2026 e de US$ 63.800 em 12/ago/2026 (FATO SECUNDÁRIO,
Decrypt e CoinGape).

**Quanto se acumula.**

Tabela 7.14. Bitcoin acumulado pela decisão, regime (a) (INFERÊNCIA, modelo financeiro; valores em dólares).

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Comprado em 12 meses, a preço de custo | 2.725 | 12.431 | 62.156 |
| Comprado em 24 meses, a preço de custo | 5.546 | 54.028 | 321.938 |
| Em unidades de Bitcoin, a US$ 63.800 | 0,09 | 0,85 | 5,05 |
| Perda com queda de 50% depois de 24 meses | 2.773 | 27.014 | 160.969 |

Um exemplo simples, sem saída antecipada: com US$ 1 milhão apostado por mês, US$ 7.500 por mês vão para Bitcoin,
US$ 90.000 por ano; uma queda de 38%, como a que a Metaplanet carregava, tira US$ 34.200 no papel. No cenário
razoável, a perda de US$ 27 mil equivale a nove meses do custo do nível mais enxuto de operação (US$ 3.000 por mês).
A consequência prática: a tesouraria em Bitcoin não pode ser a reserva que paga as contas num mês ruim. A hipótese de
que o volume de apostas cai junto com o Bitcoin, o que juntaria os dois problemas, não foi verificada **[A
confirmar]**.

**Como guardar.** Há dois caminhos (FATO SECUNDÁRIO; os números da pesquisa têm mais de um ano). O primeiro é um
token que representa Bitcoin dentro de Solana, como o cbBTC, guardado pela Coinbase, que pode congelar endereços. O
segundo é Bitcoin de verdade, fora de Solana, em multisig próprio ou em custodiante; a conversão passa por corretora
que pede a identificação da empresa e a origem dos recursos. A proposta em etapas (INFERÊNCIA): acumular em USDC
numa conta pública; trocar por cbBTC uma vez por mês, em data fixa, e guardar em cofre multisig público; acima de um
teto (por exemplo, 1 Bitcoin), resgatar para Bitcoin de verdade; e ter uma regra escrita de quando se pode vender.

> **Objeção registrada OBJ-10 · severidade alta**
>
> **Decisão do fundador:** 25% da taxa para a tesouraria em Bitcoin.
>
> **O que a revisão crítica achou:** a base é a taxa bruta, antes de qualquer custo. A empresa compraria Bitcoin
> enquanto ainda não paga as próprias contas.
>
> **Evidência:** Tether, Block e Méliuz usam lucro ou caixa excedente como base, não receita bruta; a Metaplanet
> estava 38% abaixo do custo em junho de 2026 (FATO e FATO SECUNDÁRIO, tabela 7.13). A conta: se o volume sobe em
> linha reta até o equilíbrio em T meses, o déficit acumulado da operação e o valor enviado ao Bitcoin são iguais
> (custo × T ÷ 2). Com custo de US$ 10.000 e 18 meses, são US$ 90.000 de déficit e US$ 90.000 em Bitcoin
> (INFERÊNCIA, revisão de finanças).
>
> **Alternativa proposta:** acumular em USDC até o gatilho da regra de partida (objeção OBJ-09, seção 7.3); depois,
> compra mensal em data fixa; regra escrita de venda e de quem assina o cofre. Como alternativa de base: 25% do que
> sobrar depois dos custos.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 7.7 Outras formas de receita

O fundador perguntou: "essas empresas não tem outras formas de monetização, não?". Têm. A tabela lista todas as que
a pesquisa achou, quem as usa e se cabem no Baked Market. O que a tabela não tem é valor: os líderes não divulgam
quanto cada uma rende.

Tabela 7.15. Outras formas de receita (FATO e FATO SECUNDÁRIO, pesquisa de monetização; a última coluna é INFERÊNCIA).

| Forma | Quem faz | Cabe no Baked Market? |
|---|---|---|
| Venda e licenciamento de dados | Polymarket (ICE), Kalshi (CNBC, CNN) | Depois; precisa de volume. Valores não divulgados |
| Juros do dinheiro parado | Kalshi | Não: o fundador abandonou o rendimento do pote (D-06) |
| Contratos perpétuos e alavancagem | Kalshi, Polymarket | Não; é outro produto |
| Taxa de construtor (site de terceiros que manda apostas) | Polymarket (até 1%) | Depois, como canal de distribuição |
| Indicação e afiliados | Polymarket, cassinos cripto | Sim, mas é custo de aquisição, não receita |
| Patrocínio de pergunta | Ninguém entre os líderes | Sim: é a segunda trilha (seção 7.4) |
| Taxa de depósito e saque | Kalshi (até 2% em cartão), PredictIt (5% no saque) | Não; a carteira é do usuário |
| Assinatura profissional | Só terceiros (US$ 15 a 299 por mês) | Depois, e pequeno |
| Taxa de análise de quem pede pergunta | Derivação da pesquisa | Alternativa; conflita em parte com "se for recusado devolve a grana travada" |
| Fatia da penalidade de saída para a banca | Derivação da pesquisa | Não decidido. Com 20% da penalidade, renderia 1,0% do volume: no razoável, US$ 3.000 no mês 12 e US$ 7.500 no mês 24 |
| Taxa de criador do token do pump.fun | O pump.fun paga ao criador do token | De 0,05% a 0,95% do volume do token; a proposta é mandá-la inteira ao fundo de prêmios (seção 8.2) |

Duas leituras. A primeira: das formas que cabem hoje, só a taxa e o patrocínio têm número. A segunda: a única "outra
receita" com tamanho é a fatia da penalidade de saída, e ela mexe na letra de uma decisão do fundador ("deixando uma
penalidade pro pote", D-08). Fica como pergunta para ele, com a ressalva de que depende de premissas sem dado.

### 7.8 Uma pergunta do começo ao fim

Este exemplo junta tudo o que o capítulo explicou: aposta, prêmio do fundo, patrocínio nos dois sentidos, saída
antecipada, taxa e divisão em quatro. Todos os valores são INFERÊNCIA do modelo financeiro, conferidos.

A pergunta: "O token T queima 50% da oferta até o dia 30?".

1. **Abertura.** O fundo de prêmios abre o pote com US$ 150, sem lado.
2. **Apostas.** No SIM entram 6.000: Ana põe 1.000, Bruno põe 1.000 e outros põem 4.000. No NÃO entram 4.000: Carla
   põe 1.500 e outros põem 2.500. Total apostado: 10.000.
3. **Patrocínio.** Um patrocinador paga a faixa de US$ 1.500, como prêmio neutro. No sentido A, 1.050 ficam com a
   banca e 450 vão ao pote. No sentido B, 450 ficam com a banca e 1.050 vão ao pote.
4. **Saída.** No dia 15 o Bruno desiste. Pela fórmula proposta (seção 3.6), a penalidade dele é de 5% + 20% × 50% +
   3,51% = 18,51%, ou 185,09. Ele recebe 814,91; os 185,09 ficam no pote.
5. **Resolução.** O token queima a oferta. Dá SIM.

Tabela 7.16. A conta da pergunta, nos dois sentidos do 70/30 (valores em dólares).

| Linha | Sentido A | Sentido B |
|---|---|---|
| Apostas que ficaram (SIM 5.000, NÃO 4.000) | 9.000,00 | 9.000,00 |
| Penalidade do Bruno | 185,09 | 185,09 |
| Prêmio do patrocinador | 450,00 | 1.050,00 |
| Prêmio do fundo | 150,00 | 150,00 |
| Pote final | 9.785,09 | 10.385,09 |
| Taxa de 3% | 293,55 | 311,55 |
| Vai para quem acertou | 9.491,54 | 10.073,54 |
| Cada US$ 1 no SIM recebe | 1,8983 | 2,0147 |
| Ana (pôs 1.000) recebe | 1.898,31 | 2.014,71 |
| Cada parte da taxa (25%) | 73,39 | 77,89 |
| Parte da banca no patrocínio | 1.050,00 | 450,00 |
| Total da casa nesta pergunta | 1.343,55 | 761,55 |
| Dinheiro que paga custo (operação + banca) | 1.123,39 | 527,89 |

Sem prêmio, sem patrocinador e sem saída, o mesmo pote pagaria 1,6167 por dólar no SIM. Conferência do cofre: entram
11.650 (apostas 10.000, patrocínio 1.500, fundo 150) e saem 11.650 nos dois sentidos.

Três leituras:

1. **O patrocinador paga mais custo do que a taxa.** Nesta pergunta, a parte da banca no patrocínio é de US$ 1.050
   contra US$ 73 da parte da operação na taxa (sentido A), ou de US$ 450 contra US$ 78 (sentido B). Um patrocinador
   vale, para as contas, muitas perguntas sem patrocinador. Por isso a evidência de que ele existe (objeção OBJ-15)
   pesa tanto.
2. **O fundo pôs 150 e recebeu de volta cerca de 75.** Ele só empata se o prêmio tiver trazido aposta que não
   existiria sem ele. É o que a regra dos três sinais mede.
3. **A saída do Bruno tirou US$ 814,91 da base da taxa.** A casa deixou de arrecadar US$ 24,45 (814,91 × 3%) e o
   pote ganhou US$ 185,09. Quem ficou saiu ganhando; a banca, não.

## 8. Os dois tokens

Regra deste capítulo: nada aqui é promessa de retorno, de preço ou de valorização. Tudo o que trata de distribuição,
travas e datas é proposta da pesquisa (INFERÊNCIA), não decisão. O que as regras dizem sobre tokens está no capítulo
15.

### 8.1 Por que dois tokens

**Decisão.** O Baked Market terá dois tokens (D-29). O primeiro será lançado no pump.fun; nas palavras do fundador,
"é expeculativo, e vamos usar para pumpar mesmo e tudo bem" (a objeção a essa linguagem é a OBJ-13, na seção 8.7). O
segundo virá de um "ico privado mais robusto", e é o token desenhado pela empresa: "aí a gente tem liberdade para
desenhar ele". A recompra e queima, que recebe 25% da taxa, é do segundo token.

**Decisão.** A ordem (D-30): "começar pelo pump.fun para servir de marketing pra nossa plataforma e depois pensarmos
um ICO privado mais robusto."

Daqui em diante, **token A** é o do pump.fun e **token B** é o da venda privada. Venda privada, que o fundador chama
de "ICO privado", é a venda de tokens a compradores escolhidos, por contrato, antes de o token estar no mercado, com
trava.

A divisão de papéis é esta: o token A dá atenção e comunidade, a custo baixo; o token B carrega a economia do
produto. O problema de qualquer projeto com dois tokens é sempre o mesmo: o que acontece com quem comprou o primeiro
quando o segundo aparece. A seção 8.8 trata disso.

| | Token A (pump.fun) | Token B (venda privada) |
|---|---|---|
| Papel | Marketing e comunidade; especulativo e declarado como tal | Token da empresa; é o que recebe a recompra e queima |
| Onde nasce | Na curva do pump.fun, com as regras do pump.fun | Emissão própria, desenhada pela empresa |
| O que o alimenta | Nada da receita da plataforma; a proposta é a taxa de criador ir ao fundo de prêmios | 25% da taxa da plataforma, em recompra e queima (D-27) |
| Direitos de quem segura | Nenhum prometido | Nenhum prometido; a oferta diminui com a queima |
| Estado | Decidido lançar; detalhes em aberto | Decidido ter; desenho é proposta |

### 8.2 Token A, no pump.fun

Sobre a explicação anterior desta parte, o fundador disse: "não entendi nada". Esta é a segunda tentativa, sem
jargão.

**O que é o pump.fun.** É um site, em Solana, em que qualquer pessoa cria um token em poucos minutos, sem programar
nada. Quem cria escolhe o nome, a imagem e pouco mais. O resto é igual para todo mundo, e é o pump.fun que define.

**Como o token é vendido.** O pump.fun vende o token por uma curva de ligação: uma fórmula em que o preço sobe
conforme entra dinheiro. Quem compra cedo paga menos; quem compra depois paga mais. Ninguém negocia com ninguém nessa
fase: compra-se da curva e vende-se para a curva.

**O que é a formatura.** Quando a curva vende todos os tokens que tinha para vender, o token "se forma": sai da
curva e passa a ser negociado numa pool comum, como qualquer outro token. É raro: em junho de 2026, só 0,26% dos
tokens se formavam, contra uma média histórica de cerca de 1,4% (FATO SECUNDÁRIO, The Block e Dune, jun/2026).

**O que o pump.fun impõe.** A tabela traz as regras e, ao lado, o que cada uma quer dizer para o Baked Market.

Tabela 8.1. As regras do pump.fun para quem lança um token.

| Regra | O que quer dizer na prática | Etiqueta |
|---|---|---|
| 1 bilhão de tokens; 793,1 milhões na curva; sem reserva de equipe e sem trava | A empresa não fica com nenhum token de graça. Se quiser ter, compra na curva, como qualquer pessoa | FATO (repositório oficial) |
| De cada compra na curva, 98,75% vão para a reserva da curva, 0,95% para o pump.fun e 0,30% para o criador | O dinheiro de quem compra não vai para a empresa: fica guardado na curva, para pagar quem vender. A empresa recebe só 0,30% | FATO (página de taxas, 20/mai/2026) |
| Depois da formatura, a taxa do criador vai de 0,95% a 0,05% do volume, conforme o valor de mercado; o pico de 0,95% vale entre 420 e 1.470 SOL de valor de mercado | A empresa continua recebendo uma fração pequena de cada negociação; a fração cai conforme o token cresce (SOL é a moeda da Solana) | FATO (idem) |
| A taxa do criador pode ser dividida entre até 10 carteiras; a divisão é definida uma única vez | Dá para apontar a taxa de criador para a carteira do fundo de prêmios. Depois de definida, não muda | FATO (documentação oficial) |
| "Holder Rewards": a taxa do criador inteira vai para quem segura o token, paga pelo pump.fun; é irreversível | É uma alternativa ao item anterior: ou a taxa vai para quem segura o token, ou vai para onde a empresa apontar. Ligou, não desliga | FATO (documentação oficial) |
| Completar uma curva do zero exige cerca de 85 SOL; o valor de mercado vai de 28 SOL na criação a 411 SOL na formatura | A formatura depende de entrar dinheiro de verdade; não é a empresa que decide | INFERÊNCIA (sobre os parâmetros públicos) |
| Os tokens novos seguem o padrão Token-2022, com as informações dentro do próprio token e com as autoridades revogadas: 7 de 7 na amostra lida na rede em 3/out/2026 | Depois de criado, ninguém cria mais unidades nem altera o token. Não há o que "desenhar" | FATO (amostra pequena) |

**O que o pump.fun deixa fazer.** Lançar rápido e barato; receber a taxa de criador; escolher, uma única vez, para
onde essa taxa vai; comprar na curva como qualquer um.

**O que o pump.fun não deixa fazer.** Reservar tokens para a equipe; travar tokens por contrato da própria
plataforma; mudar a oferta; ficar com o dinheiro das compras; cobrar um percentual próprio de cada compra; mudar as
regras do token depois. É por isso que o fundador concluiu que o token desenhado tem de ser outro (seção 8.4).

**O que o token A pode alimentar.** A proposta da pesquisa é apontar a taxa de criador inteira para o fundo de
prêmios (seção 7.5). Exemplo: se o token A negociar US$ 2 milhões num mês, a 0,30%, o fundo recebe US$ 6.000
(INFERÊNCIA, pesquisa de tokens). Para comparação, é o que o fundo receberia de US$ 800 mil apostados na plataforma
(6.000 ÷ 0,75%; INFERÊNCIA). Essa passa a ser a utilidade real do token A: a negociação dele paga prêmios nas
perguntas, sem depender de promessa da empresa.

**Em aberto.** Três pontos sem resposta do fundador (D-33): se o "Holder Rewards" fica ligado (se ficar, a taxa de
criador vai para quem segura o token e não sobra nada para o fundo de prêmios); se haverá um token de teste antes;
e se a carteira do fundo de prêmios pode ser uma conta de programa nessa divisão **[A confirmar]**. Como as duas
escolhas sobre a taxa de criador são irreversíveis, a decisão precisa vir antes do lançamento.

### 8.3 Token B, na venda privada

**Como se faz uma venda privada hoje.** O comprador paga antes e recebe depois, com trava; um contrato diz quanto,
quando e sob que condições. Há três formas de contrato em uso (FATO SECUNDÁRIO, pesquisa de tokens): o acordo de
entrega futura de tokens, em que o investidor paga agora e recebe os tokens quando forem emitidos; a compra de
participação na empresa com direito a receber tokens se um dia existirem; e a venda direta de tokens já emitidos, com
data de entrega e trava. A terceira é a que corresponde a um "ICO privado" feito depois de o produto estar no ar. A
venda pode ser organizada pela própria empresa ou por plataformas como Echo, Sonar, Legion, Buidlpad, MetaDAO e
CoinList. Na MetaDAO, que roda em Solana, 20% do USDC (a moeda digital que vale 1 dólar) de toda venda vai, por
regra do programa, para as pools de liquidez do token (FATO, documentação): é o precedente mais próximo de "uma
parte do dinheiro da venda já sai carimbada".

**O mercado de vendas está fraco.** No mundo, as vendas públicas de token foram 105 no primeiro trimestre de 2026,
somando US$ 390 milhões, e 37 no segundo, somando US$ 58 milhões, com média de US$ 1,57 milhão por venda (FATO
SECUNDÁRIO, Flexe.io e CryptoRank, 4/set/2026). Nenhum custo fixo do plano se apoia na venda (risco R-17, seção
14.2).

**Distribuição e travas propostas.** Trava é um contrato que segura tokens e os solta num calendário; desbloqueio é
o momento em que os tokens saem da trava e podem ser vendidos.

Tabela 8.2. Distribuição proposta para o token B (INFERÊNCIA, pesquisa de tokens; soma 100%).

| Fatia | % | Trava |
|---|---|---|
| Venda privada | 15% | 10% no lançamento; depois 6 meses parado e 12 meses de liberação linear |
| Detentores do token A e primeiros apostadores | 10% | 25% no lançamento e o resto em 9 meses, por saldo de A e por taxa paga na plataforma |
| Liquidez travada | 12% | 18 meses parada e 12 de liberação linear |
| Crescimento e comunidade | 25% | 3 meses parado e 36 de liberação linear, em cofre público com teto mensal |
| Equipe | 15% | 18 meses parado e 30 de liberação linear |
| Tesouraria | 13% | 6 meses parado e 36 de liberação linear |
| Reserva para rodadas futuras e listagens | 10% | Travada até decisão pública |

A oferta proposta é de 1 bilhão, fixa, num token comum, sem taxa de transferência; cerca de 16% estariam em
circulação no primeiro dia. Para referência (FATO SECUNDÁRIO): em cerca de 85% das empresas, a equipe fica 1 ano
parada e recebe ao longo de 4 anos, e equipe e investidores têm entre 15% e 30% cada. No extremo oposto, o token do
próprio pump.fun, o PUMP, vendeu 33% da oferta a US$ 0,004 (US$ 1,32 bilhão arrecadado, avaliação total de US$ 4
bilhões) com 100% livre no primeiro dia.

**O destino proposto do dinheiro da venda.** Avaliação é quanto vale o total de tokens ao preço da venda. No exemplo
usado pela pesquisa, vender 15% da oferta a uma avaliação de US$ 5 milhões arrecada US$ 750.000. Destino proposto:
30% para o fundo de prêmios (225.000), 30% para a liquidez travada (225.000) e 40% para a operação (300.000). A
avaliação de US$ 5 milhões é número de exemplo, não meta: a seção 8.5 mostra que o volume projetado não a sustenta.

Tudo nesta seção depende de duas coisas que ainda não existem: a jurisdição da empresa e um parecer jurídico sobre o
token, cujo custo foi estimado entre US$ 15 e 50 mil (fonte fraca) **[A confirmar: pedir cotações]**. Ver capítulo 15.

### 8.4 A ideia dos 30%

A ideia nasceu de uma pergunta do fundador: "para cada 1 dólar que alguém comprar do nosso token ... a gente pega 30%
e redistribui aumentando liquidez em todas as pools das perguntas? Isso é positivo?".

**Por que não é possível no pump.fun.** De cada compra na curva, 98,75% vão para a reserva da própria curva, 0,95%
para o pump.fun e 0,30% para o criador (FATO, página de taxas, 20/mai/2026). Não há como desviar 30%.

**Decisão.** A ideia vale para o token B (D-31): "isso só vamos conseguir fazer com base em nosso próprio token ico
privado, que aí a gente tem liberdade para desenhar ele."

**Em aberto.** Como fazer. Há duas leituras de "30% de cada compra". Na primeira, o token B nasce com uma taxa
permanente de 30%, cobrada pelo próprio token em toda transferência (o Token-2022, o segundo programa de tokens
da Solana, tem essa função embutida). Na segunda, 30% do dinheiro que a venda privada arrecadar vai para as pools,
de uma vez.

A primeira leitura tem uma conta difícil. Premissas: uma pool de negociação com 100.000 USDC e 10 milhões de tokens,
preço de US$ 0,01, e alguém que compra 1.000 USDC.

Tabela 8.3. O que acontece com quem compra, conforme a taxa do token (INFERÊNCIA, pesquisa de tokens).

| Taxa do token | Tokens que o comprador recebe | USDC que chega às pools das perguntas | Valor do que o comprador tem | Se revender na hora, recebe | Alta de preço para empatar |
|---|---|---|---|---|---|
| 0% | 99.010 | 0 | 1.010 | 1.000 | 0% |
| 1% | 98.020 | 10 | 1.000 | 980 | 2,0% |
| 5% | 94.059 | 50 | 959 | 902 | 10,8% |
| 10% | 89.109 | 101 | 907 | 810 | 23,5% |
| 30% | 69.307 | 302 | 703 | 490 | 104,1% |

Com 30%, quem paga 1.000 fica com 703 de valor e, se revender, com 490, porque paga a taxa duas vezes (0,70 × 0,70 =
0,49). O preço precisa mais que dobrar para ele empatar. Há outros três efeitos: a taxa é cobrada em token, não em
USDC, de modo que a tesouraria teria de vender o próprio token para ter dinheiro para os potes; ela incide em toda
transferência, inclusive no saque de quem comprou na venda privada; e um token com taxa não é aceito em toda pool e
carteira. Não foi encontrado nenhum caso de taxa permanente acima de 10%; a faixa que o mercado de Solana aceita é
de 1% a 2% (INFERÊNCIA, pesquisa de tokens).

Tabela 8.4. Cinco desenhos para o mesmo objetivo (INFERÊNCIA, pesquisa de tokens).

| Desenho | O comprador paga 1.000 e recebe | O que as pools das perguntas recebem | Quem paga |
|---|---|---|---|
| A. Taxa de 30% no token (Token-2022) | 703 (490 se revender) | 302 por 1.000 comprados | O comprador, duas vezes |
| B. Taxa de 30% só na compra (curva ou programa próprio) | 700 | 300 por 1.000 | O comprador, uma vez |
| C. 30% do que a venda privada arrecadar, carimbado | 1.000, ao preço da venda | 300 por 1.000 arrecadados, de uma vez | A empresa (fica com 70% do caixa) |
| D. 25% da taxa da plataforma (já decidido, D-27) | Não envolve o token | 0,75% do volume apostado, todo mês | O apostador, dentro dos 3% |
| E. Taxa de criador do token A enviada ao fundo | 987,50 | 0,05% a 0,95% do volume do token | Quem negocia, dentro da taxa normal |

No desenho C, a frase do fundador continua verdadeira na venda privada: de cada dólar pago pelo token, 30 centavos
vão para as pools das perguntas, numa conta pública. No exemplo da seção 8.3, seriam US$ 225.000 no fundo de prêmios.

Um cuidado vale para qualquer dos cinco desenhos: dinheiro posto num pote sem condição pode ser colhido por quem
aposta nos dois lados (seção 7.5). De onde quer que venha, o prêmio precisa de regra.

> **Objeção registrada OBJ-14 · severidade média**
>
> **Decisão do fundador:** 30% de cada compra do token da venda privada vão para as pools das perguntas.
>
> **O que a revisão crítica achou:** como taxa permanente do token, 30% destrói quem compra.
>
> **Evidência:** quem paga 1.000 fica com 703 de valor e, se revender, com 490; nenhum caso lido teve taxa
> permanente acima de 10% (INFERÊNCIA, pesquisa de tokens, tabela 8.3).
>
> **Alternativa proposta:** 30% do que a venda privada arrecadar, carimbado para o fundo de prêmios, sem taxa no
> token (desenho C), somado aos 25% da taxa da plataforma já decididos (desenho D); como reforço, a taxa de criador
> do token A (desenho E).
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 8.5 Recompra e queima

**Decisão.** 25% da taxa da plataforma vão para a recompra e queima do token B (D-27, D-29). Recompra e queima é a
empresa usar parte da receita para comprar o próprio token no mercado e destruí-lo, reduzindo a oferta. Exemplo: com
US$ 1 milhão apostado no mês, são US$ 7.500 de recompra.

**O que aconteceu com quem fez.**

Tabela 8.5. Precedentes de recompra (FATO SECUNDÁRIO, pesquisa de monetização e de tokens).

| Caso | O que aconteceu | Data |
|---|---|---|
| Jupiter | Mais de US$ 70 mi em 2025, metade da receita; cobriu cerca de 6% dos tokens desbloqueados; token 89% abaixo do pico | jan/2026 |
| Helium | Parou a recompra em 2/jan/2026: o mercado não reagia | jan/2026 |
| pump.fun (PUMP), primeira foto | Mais de US$ 230 mi em 2025; token 72% abaixo do pico e 41% abaixo do preço da oferta | jan/2026 |
| pump.fun (PUMP), segunda foto | 162,72 bi de PUMP destruídos (mais de 16% da oferta máxima); preço de US$ 0,004684, 17% acima do preço de venda de US$ 0,004 | 28/ago e 21/set/2026 |
| Raydium | Mais de US$ 200 mi desde o início; manteve o programa | jan/2026 |
| Tokens de mercados de previsão | LMTS −94%; PNP −93%; UMA −99% | out/2026 |

A regra que sai dos casos (INFERÊNCIA): a recompra só reduz a oferta em circulação se for maior que os desbloqueios e
as emissões do mesmo período. Quando os desbloqueios são maiores, entra no mercado mais token do que a recompra tira.

**A conta contra os desbloqueios.** Aplicando a distribuição da tabela 8.2 e a avaliação de exemplo de US$ 5 milhões:

Tabela 8.6. Tokens destravados por mês, pela distribuição proposta (INFERÊNCIA, revisão de finanças).

| Período depois do lançamento do token B | Tokens destravados por mês | Em dólares |
|---|---|---|
| Meses 1 a 3 | 0,83% da oferta | US$ 41,7 mil |
| Meses 4 a 6 | 1,53% | US$ 76,4 mil |
| Meses 7 a 9 | 3,01% | US$ 150,7 mil |
| Meses 10 a 18 | 2,18% | US$ 109,0 mil |

Com US$ 1 milhão apostado por mês, a recompra é de US$ 7.500 por mês e cobre de 5% a 18% dos desbloqueios. Ela só
iguala os desbloqueios dos meses 4 a 6 com US$ 10,2 milhões apostados por mês.

**Quanto de avaliação a recompra sustenta.** Suponha um comprador que só aceita a avaliação se a recompra de um ano
representar 20% do valor do token. A conta é: avaliação sustentada = 0,3825 × volume mensal apostado (INFERÊNCIA,
modelo financeiro). No mês 12, isso dá US$ 17.213 no cenário ruim, US$ 114.750 no razoável e US$ 573.750 no otimista.
No mês 24: US$ 11.475, US$ 286.875 e US$ 1.912.500. Nem o cenário otimista do mês 24 sustenta a avaliação de exemplo
de US$ 5 milhões. Para isso seriam precisos cerca de US$ 11 milhões apostados por mês sem saídas antecipadas, ou
cerca de US$ 13 milhões com as premissas de saída do modelo (5.000.000 ÷ 0,3825; INFERÊNCIA).

> **Objeção registrada OBJ-11 · severidade alta**
>
> **Decisão do fundador:** 25% da taxa para recompra e queima do token da venda privada.
>
> **O que a revisão crítica achou:** a recompra é pequena perto dos desbloqueios e não sustenta o preço.
>
> **Evidência:** a Jupiter gastou mais de US$ 70 milhões, cobriu cerca de 6% dos desbloqueios e o token ficou 89%
> abaixo do pico (FATO SECUNDÁRIO, jan/2026); com US$ 1 milhão apostado por mês, a recompra do Baked Market cobriria
> de 5% a 18% dos desbloqueios propostos (INFERÊNCIA, revisão de finanças, tabela 8.6).
>
> **Alternativa proposta:** recompra só depois do ponto de equilíbrio e de o token existir; desenhar os desbloqueios
> pelo tamanho da recompra, e não o contrário; não prometer preço.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 8.6 "Dividendo aos holders"

**Ambíguo.** Antes de dividir a taxa em quatro, o fundador tinha dito que o objetivo do token era "subir preço e
entregar dividendo aos holders" (D-32). A divisão decidida depois (D-27) não tem parte nenhuma para repasse a quem
segura o token. As duas falas não fecham, e a pendência vai à lista da seção 16.1.

**Como seria possível pagar a quem segura um token, sem obrigar a travar.** Existe um desenho público para isso, no
programa de recompensas da Solana Foundation (FATO, pesquisa de tokens). Em linguagem simples:

1. A empresa cria um cofre de recompensa que acompanha um token e paga em outra moeda, por exemplo USDC.
2. Quem segura o token faz uma única transação de adesão. O token continua na carteira dele.
3. Cada vez que a empresa deposita, o programa não percorre os detentores um a um. Ele atualiza um único número: a
   recompensa por token.
4. Quando o detentor saca, o programa multiplica o saldo dele pela variação desse número desde o último saque.

Exemplo: a empresa deposita 1.000 USDC; a soma dos saldos de quem aderiu é de 10 milhões de tokens. A recompensa por
token sobe 0,0001 USDC. Quem tem 250.000 tokens pode sacar 25 USDC, sem ter travado nada.

Três ressalvas da pesquisa: o código desse modo não estava no ramo principal do repositório oficial em 4/out/2026;
não foi confirmado se a auditoria o cobre; e o saldo registrado pode ficar velho (quem adere com saldo alto e vende
depois continua recebendo pelo saldo antigo até alguém pedir a atualização). No token A existe um caminho pronto, o
"Holder Rewards" do pump.fun (seção 8.2), que é irreversível.

**De onde sairia o dinheiro.** Hoje, de lugar nenhum. Se o objetivo continuar, ele sai de dentro dos 25% do token
(por exemplo, metade para a queima e metade para o repasse) ou de outra parte da taxa. Qualquer das duas mexe na
decisão D-27.

O que os reguladores dizem sobre repasse está no capítulo 15.

> **Objeção registrada OBJ-12 · severidade alta**
>
> **Decisão do fundador:** o objetivo declarado do token é "subir preço e entregar dividendo aos holders".
>
> **O que a revisão crítica achou:** o "dividendo" não tem fonte na divisão da taxa e é a palavra que os reguladores
> citam.
>
> **Evidência:** a divisão em 25/25/25/25 não tem parte de repasse (decisão D-27); a promessa de participação no
> resultado é o sinal que as autoridades de valores mobiliários examinam (FATO, textos descritos na seção 15.5).
>
> **Alternativa proposta:** tirar "dividendo" do plano e do material público; ou dizer de qual parte da taxa ele sai
> e levar o desenho ao advogado antes de anunciar.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 8.7 Ordem de lançamento

**Decisão.** Primeiro o token A, no pump.fun; depois a venda privada do token B (D-30).

A ordem proposta pela pesquisa para executar essa decisão (INFERÊNCIA, pesquisa de tokens):

| Passo | Quando | Por quê |
|---|---|---|
| 1. Produto na rede principal, com perguntas abertas | Mês 0 | O token nasce ao lado de algo que já funciona |
| 2. Token A no pump.fun, com a taxa de criador apontada para o fundo de prêmios | Mês 0, junto com o produto | O texto de lançamento já avisa que haverá um token B |
| 3. Período de medição | Meses 1 a 4 | Sem volume real não há como dar preço ao token B |
| 4. Venda privada do token B | Meses 4 a 6 | Por contrato, com trava |
| 5. Lançamento do token B, distribuição aos detentores do token A e início da recompra | Meses 6 a 9 | Referência de intervalo: do PURR ao HYPE passaram 7,5 meses |

Antes de o token B existir, a parte da taxa destinada à recompra não tem o que comprar; a proposta é guardá-la em
USDC, numa conta pública, e usá-la no passo 5. O lugar dos tokens no roteiro de construção está na seção 12.5:
nenhuma instrução do programa de pote depende deles.

> **Objeção registrada OBJ-13 · severidade alta**
>
> **Decisão do fundador:** um token no pump.fun, "para pumpar mesmo", lançado primeiro; o token da venda privada
> depois.
>
> **O que a revisão crítica achou:** a linguagem e a ordem corroem a confiança, que é exatamente o que uma casa de
> apostas vende. Três revisores discordam do cronograma, cada um num ponto: um propõe o token A só depois de algumas
> semanas de perguntas resolvidas; outro propõe tirar o token B do cronograma até haver parecer jurídico; o terceiro
> deixa os dois tokens fora do primeiro lançamento.
>
> **Evidência:** os tokens do setor caíram: LMTS 94%, PNP 93% e UMA 99% (FATO SECUNDÁRIO, out/2026); os termos do
> pump.fun, segundo a leitura feita, proíbem "pump and dump" **[A confirmar: reler antes de usar]**; não foi achado
> nenhum caso de plataforma com produto real lançada pela curva do pump.fun (ausência em pesquisa, out/2026).
>
> **Alternativa proposta:** produto primeiro, com volume medido; token A depois, no modelo do PURR (sem promessa, com
> a carteira da equipe declarada e travada); token B só depois de meses de volume real e do parecer; nenhuma das
> palavras "pumpar", "dividendo" ou "subir preço" em material público.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 8.8 O que dizer a quem comprar o token A

Quem compra o token A vai querer saber o que acontece com ele quando o token B sair. A pesquisa propõe seis pontos,
ditos por escrito no dia do lançamento do token A (INFERÊNCIA, pesquisa de tokens):

1. **Dizer antes.** O token A é um memecoin, isto é, um token de comunidade, sem produto por trás dele; não dá
   direito a receita, a voto nem a conversão. A empresa lançará um segundo token, e 10% dele estão reservados a
   quem segurar o token A, por uma regra pública.
2. **O token A continua existindo.** Sem troca obrigatória, sem queima para receber o outro, sem prazo que expira.
   Nunca usar a frase "sem utilidade".
3. **A regra dos 10% é pública e mecânica.** Proporcional ao saldo de token A ao longo do tempo, com adesão simples,
   e parte dela por taxa paga na plataforma. Sem lista escolhida à mão.
4. **Avisar do efeito esperado.** Quando o segundo token de um projeto sai, o primeiro costuma cair em relação a ele.
   Dizer isso antes é melhor do que deixar o mercado descobrir.
5. **O token A segue alimentando os prêmios.** A taxa de criador continua indo para o fundo de prêmios. É a utilidade
   real dele.
6. **Nenhuma promessa de preço**, em nenhum dos dois tokens.

Tabela 8.7. Precedentes de projetos com dois tokens (pesquisa de tokens).

| Caso | O que fizeram | Resultado | Etiqueta |
|---|---|---|---|
| PURR e HYPE (Hyperliquid) | Memecoin sem venda, sem equipe e sem utilidade declarada; depois, um segundo token dado aos usuários; nenhuma conversão | Os dois vivos; a razão PURR/HYPE caiu cerca de 90% | FATO SECUNDÁRIO |
| FLOKI e TokenFi | 56% do segundo token para quem travasse o primeiro | 20% do FLOKI em circulação travado em menos de três semanas; a Bybit retirou o TokenFi por liquidez inicial de US$ 2.000 | FATO e FATO SECUNDÁRIO |
| ai16z para elizaOS | Troca obrigatória; o detentor recebeu 6 de cada 10 unidades novas | Queda de 28,14% em 24 horas na relistagem | FATO e FATO SECUNDÁRIO |
| Padre e PUMP | O pump.fun avisou que o token PADRE perdia a utilidade | Queda de 67%; a empresa voltou atrás | FATO SECUNDÁRIO |
| Pump Pumpkin | Token no pump.fun para ser queimado e trocado por outro | A carteira criadora vendeu em 11 minutos; queda de 92% | FATO SECUNDÁRIO |
| SafeMoon | Taxa de 10% em cada venda, com repasse a detentores e à liquidez | Presidente condenado por fraude em 21/5/2025 (por mentir sobre a liquidez e desviar dinheiro, não pela taxa) | FATO |
| MetaDAO | 20% do USDC de toda venda vai, por regra do programa, para as pools de liquidez | Modelo em uso | FATO |

**O que funcionou:** dar o segundo token a quem tem o primeiro, sem conversão (PURR e HYPE; FLOKI e TokenFi). **O que
não funcionou:** converter com perda (elizaOS), anunciar que o primeiro token ficou "sem utilidade" (Padre) e pedir
que o detentor destrua um token para receber outro (Pump Pumpkin). O memecoin que aguentou foi o que nunca prometeu
nada. E há uma lacuna que a pesquisa registrou: não foi encontrada nenhuma plataforma com receita própria que tenha
lançado um memecoin no pump.fun e, depois, um segundo token por venda privada. O Baked Market seria o primeiro caso
conhecido, sem precedente para copiar.

## 9. Projeções financeiras

### 9.1 Como ler as projeções

Tudo neste capítulo é INFERÊNCIA. O produto não tem um único dia de uso com dinheiro real; não existe dado medido de
volume, de carteiras, de patrocinadores, de receita ou de caixa. Os números abaixo são o resultado de fórmulas
aplicadas a premissas, e as premissas mais importantes são suposições sem dado, marcadas assim na tabela da seção 9.2.

Quatro avisos antes das tabelas:

- **"Mês 1"** é o primeiro mês com dinheiro real na rede principal (mainnet), a rede em que o dinheiro é de verdade.
  O tempo de construção e de auditoria antes disso não está nas tabelas.
- **O modelo não inclui** impostos, aquisição paga de usuários nem a venda privada do token como receita ou caixa.
- **Valores em dólares.** "A" e "B" são os dois sentidos do "70/30" do patrocínio (seção 7.4).
- **Serve para comparar caminhos, não para prever.** O uso certo destas tabelas é ver o que muda quando uma decisão
  muda (o regime da taxa, o sentido do 70/30, o nível de custo), e não tomar o cenário razoável como previsão.

### 9.2 Premissas

Tabela 9.1. Premissas do modelo (INFERÊNCIA, modelo financeiro; "premissa sem dado" quer dizer suposição).

| Premissa | Valor | Origem | Fragilidade |
|---|---|---|---|
| Taxa | 3% do pote final | Decisão (D-26) | Firme; a forma é contestada (OBJ-07) |
| Parte da operação | 25% da taxa | Decisão (D-27) | Firme; é a que mais pesa |
| Dinheiro que sai antes da resolução | 20% do apostado | Premissa sem dado | Muito alta |
| Penalidade média de quem sai | 25% | Premissa sem dado | Muito alta |
| Pote final como parte do apostado | 85% | Conta sobre as duas linhas acima | Herda a fragilidade |
| Taxa sobre o valor devolvido na saída | Não cobrada | Leitura literal de D-08 | Em aberto |
| Depósito por carteira ativa por mês | US$ 150 (ruim), 200 (razoável), 250 (otimista) | Premissa sem dado | Muito alta |
| Subida do volume | Linha reta até o mês 12 e outra até o mês 24 | Premissa sem dado | Muito alta: concorrentes mostram picos e quedas de 80% a 96% |
| Perguntas abertas por mês | 8 (ruim); 8 a 24 (razoável); 12 a 80 (otimista) | Premissa sem dado | Alta |
| Duração média entre a aposta e a resolução | 14 dias | Premissa sem dado | Alta |
| Patrocinadores por mês | Zero (ruim); até 5, mais um de US$ 5.000 por trimestre (razoável); até 12 (otimista) | Premissa sem dado | Muito alta: não há precedente pago |
| Destino da parte da banca no patrocínio | 100% para a operação | Recomendação da revisão; não é decisão | Em aberto |
| Custo do nível 1 (ninguém recebe) | US$ 3.000 por mês: auditoria (reserva) 1.700; infraestrutura 650; jurídico e contábil 650 | Revisão de finanças | Média |
| Custo do nível 2 (equipe enxuta) | US$ 10.000 por mês: o nível 1, mais equipe 5.000 e comunidade 2.000 | Revisão de finanças | Alta |
| Custo do nível 3 | US$ 25.000 por mês: equipe 16.000; auditoria 2.500; infraestrutura 1.300; jurídico 1.200; marketing 4.000 | Número provisório do sócio técnico; a divisão é do modelo | Alta |
| Quando a equipe sobe de nível | Nível 2 depois de três meses seguidos com US$ 400 mil apostados; nível 3 depois de três meses com US$ 1,57 milhão | Revisão e modelo | Alta |
| Gasto antes do lançamento | US$ 51.500: auditoria 30.000; empresa 4.000; avaliação jurídica 10.000; prêmios iniciais 7.500. Faixa: 30 a 75 mil | Pontos médios das faixas da revisão | Alta [A confirmar: três cotações] |
| Reserva | Seis meses do custo do nível 1: US$ 18.000 | Revisão de finanças | Média |

**As fórmulas.** Estão à mostra para que qualquer leitor refaça a conta.

```text
volume apostado          = carteiras ativas × depósito por carteira
pote final               = volume × 85%
taxa                     = pote final × 3%            (2,55% do volume)
cada parte da taxa       = taxa ÷ 4                   (0,6375% do volume)
banca no patrocínio      = patrocínio bruto × 70% (sentido A)  ou  × 30% (sentido B)
receita total            = taxa + banca no patrocínio
dinheiro da operação     = parte da operação + banca no patrocínio
caixa acumulado          = −51.500 + soma dos resultados de cada mês
```

Exemplo, cenário razoável, mês 12: 1.500 carteiras × US$ 200 = US$ 300.000 de volume; pote final de 255.000; taxa de
7.650; cada parte, 1.912,50. Sem patrocínio, a operação recebe US$ 1.913 nesse mês, contra um custo de US$ 3.000.

### 9.3 Três cenários

O fundador pediu que as ondas de pesquisa dissessem o que seria ruim, razoável e otimista. Cada cenário tem uma
régua, isto é, um número real de um concorrente para dar a ordem de grandeza.

Tabela 9.2. Em que cada cenário se apoia (INFERÊNCIA; as réguas usam FATO SECUNDÁRIO, DefiLlama, set e out/2026).

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Carteiras ativas | 50 no mês 1; 300 do mês 6 ao 12; caem para 200 no mês 24 | 125 a mais por mês até 1.500 no mês 12; 3.750 no mês 24 | 500 a mais por mês até 6.000 no mês 12; 20.000 no mês 24 |
| Depósito por carteira por mês | US$ 150 | US$ 200 | US$ 250 |
| Volume no mês 12 | US$ 45 mil | US$ 300 mil | US$ 1,5 milhão |
| Volume no mês 24 | US$ 30 mil | US$ 750 mil | US$ 5 milhões |
| Régua no mês 12 | Taxa de US$ 1.148 no mês, perto dos US$ 1.319 que a Myriad arrecadou em 30 dias | 1,9% do World de set/2026; 2,8% do Limitless de set/2026 | 9,7% do World; 14% do Limitless de set/2026 |
| Régua no mês 24 | Volume de 24 meses (US$ 870 mil) igual a 3,3 vezes tudo o que os mercados de pump.fun somaram na Polymarket | 4,9% do World; 7,0% do Limitless; 14% da Jupiter | 32% do World; 47% do Limitless; 91% da Jupiter |
| Dinheiro travado no mês 24, com perguntas de 14 dias | US$ 14 mil | US$ 350 mil, 2 vezes o World | US$ 2,33 milhões, 13,7 vezes o World |
| O que precisa ser verdade | O produto funciona e quase ninguém volta | Um nicho pequeno e fiel, sem distribuição paga | Um canal de distribuição (integração com carteira) que hoje não existe |

Tabela 9.3. A trajetória, em meses selecionados (INFERÊNCIA, modelo financeiro).

| Cenário | Mês | Carteiras ativas | Volume apostado | Taxa (3% do pote final) | Receita total, A | Receita total, B |
|---|---|---|---|---|---|---|
| Ruim | 3 | 150 | 22.500 | 574 | 574 | 574 |
| Ruim | 6 | 300 | 45.000 | 1.148 | 1.148 | 1.148 |
| Ruim | 12 | 300 | 45.000 | 1.148 | 1.148 | 1.148 |
| Ruim | 24 | 200 | 30.000 | 765 | 765 | 765 |
| Razoável | 3 | 375 | 75.000 | 1.913 | 1.913 | 1.913 |
| Razoável | 6 | 750 | 150.000 | 3.825 | 4.175 | 3.975 |
| Razoável | 12 | 1.500 | 300.000 | 7.650 | 9.400 | 8.400 |
| Razoável | 24 | 3.750 | 750.000 | 19.125 | 22.275 | 20.475 |
| Otimista | 3 | 1.500 | 375.000 | 9.563 | 9.913 | 9.713 |
| Otimista | 6 | 3.000 | 750.000 | 19.125 | 20.875 | 19.875 |
| Otimista | 12 | 6.000 | 1.500.000 | 38.250 | 46.300 | 41.700 |
| Otimista | 24 | 20.000 | 5.000.000 | 127.500 | 140.800 | 133.200 |

Tabela 9.4. Resumo de 24 meses (INFERÊNCIA, modelo financeiro; conferido por soma).

| | Ruim | Razoável, A | Razoável, B | Otimista, A | Otimista, B |
|---|---|---|---|---|---|
| Volume somado, 12 meses | 427.500 | 1.950.000 | 1.950.000 | 9.750.000 | 9.750.000 |
| Volume somado, 24 meses | 870.000 | 8.475.000 | 8.475.000 | 50.500.000 | 50.500.000 |
| Taxa somada, 24 meses | 22.185 | 216.113 | 216.113 | 1.287.750 | 1.287.750 |
| Banca no patrocínio, 24 meses | 0 | 63.350 | 27.150 | 214.200 | 91.800 |
| Patrocínio que foi aos potes, 24 meses | 0 | 27.150 | 63.350 | 91.800 | 214.200 |
| Custo operacional, 24 meses | 72.000 | 121.000 | 121.000 | 333.000 | 333.000 |
| Caixa no mês 24, regime (a) | −117.954 | −55.122 | −91.322 | 151.638 | 29.238 |
| Caixa no mês 24, regime (b) | −106.861 | −34.344 | −51.130 | 154.547 | 36.434 |

**Os patrocinadores supostos.** No ruim, nenhum. No razoável: nenhum nos meses 1 a 3; um de US$ 500 por mês nos
meses 4 a 6; dois de 500 e um de 1.500 por mês nos meses 7 a 12; no segundo ano, três de 500 e dois de 1.500 por
mês, mais um de 5.000 por trimestre. No otimista: um de 500 por mês nos meses 1 a 3; dois de 500 e um de 1.500 nos
meses 4 a 6; quatro de 500, três de 1.500 e um de 5.000 por mês nos meses 7 a 12; no segundo ano, seis, quatro e
dois por mês. Nenhum desses números tem precedente (objeção OBJ-15, seção 7.4).

**O custo em cada cenário.** No ruim, o nível 1 (US$ 3.000 por mês) durante os 24 meses. No razoável, o nível 1 até
o mês 17 e o nível 2 (US$ 10.000) a partir do mês 18. No otimista, o nível 1 até o mês 6, o nível 2 do mês 7 ao 15
e o nível 3 (US$ 25.000) a partir do mês 16.

Três coisas que as tabelas dizem e que precisam ser escritas com todas as letras:

1. **O cenário ruim não se paga em nenhum regime.** O caixa cai até o mês 24 e continua caindo.
2. **O cenário ruim não é o piso.** O piso verdadeiro é o do PNP (seção 6.3): volume perto de zero.
3. **O cenário razoável termina os 24 meses com caixa negativo** nos dois sentidos e nos dois regimes. Ele chega a
   meses no azul (seção 9.5), mas não recupera, em dois anos, o que foi gasto antes do lançamento.

### 9.4 Ponto de equilíbrio

Ponto de equilíbrio é o volume apostado por mês em que a parte da taxa que vai para a operação paga o custo. A conta
é o custo dividido pela fração do volume que chega à operação: 0,6375% no regime (a) e 1,9125% no regime (b); sem
saída antecipada, 0,75% e 2,25%. Os dois regimes estão definidos na seção 9.5.

Tabela 9.5. Volume de equilíbrio por mês, sem patrocínio (INFERÊNCIA, modelo financeiro e revisão de finanças).

| Nível de custo | Custo por mês | Regime (a) | Regime (b) | Regime (a), sem saída antecipada | Regime (b), sem saída antecipada |
|---|---|---|---|---|---|
| 1. Ninguém recebe | 3.000 | 470.588 | 156.863 | 400.000 | 133.333 |
| 2. Equipe enxuta | 10.000 | 1.568.627 | 522.876 | 1.333.333 | 444.444 |
| 3. Número do sócio | 25.000 | 3.921.569 | 1.307.190 | 3.333.333 | 1.111.111 |

Pela decisão do fundador (regime (a)), o equilíbrio fica em US$ 471 mil, US$ 1,57 milhão e US$ 3,92 milhões apostados
por mês, conforme o nível de custo. Para dar a medida: US$ 3,33 milhões por mês são 22% do que o World fez em
setembro de 2026, com a Phantom inteira por trás.

**O pote não gira o dinheiro.** Giro é quantas vezes o mesmo dólar é apostado num período. Num livro de ordens, o
dólar entra e sai várias vezes por dia: no World, cada dólar girou cerca de 90 vezes no mês (INFERÊNCIA). No pote, o
dólar entra uma vez e fica parado até a resolução. A consequência: para fazer o mesmo volume, o pote precisa de muito
mais dinheiro parado, e tanto mais quanto mais longas forem as perguntas.

Tabela 9.6. Dinheiro travado necessário para pagar cada nível de custo, regime (a), sem patrocínio (INFERÊNCIA).

| Duração média da pergunta | Nível 1 | Nível 2 | Nível 3 |
|---|---|---|---|
| 3 dias | 47.059 | 156.863 | 392.157 |
| 7 dias | 109.804 | 366.013 | 915.033 |
| 14 dias | 219.608 | 732.026 | 1.830.065 |
| 30 dias | 470.588 | 1.568.627 | 3.921.569 |

A régua: o World tem US$ 170,8 mil travados (FATO SECUNDÁRIO, DefiLlama, set/2026). Com perguntas de 30 dias, pagar o
nível 2 pede nove vezes isso; com perguntas de 3 dias, menos do que o World tem hoje. É o argumento financeiro para
começar por perguntas curtas (risco R-05, seção 14.2).

**Quanto vale um apostador.** Supondo um apostador que põe US$ 200 por mês durante seis meses (INFERÊNCIA, premissa
sem dado): ele aposta US$ 1.200 no total, gera US$ 36 de taxa, e US$ 9 disso pagam custo. Do outro lado, os custos
de trazer um usuário documentados em cripto, entre 2021 e 2023, foram de US$ 77 por usuário na Coinbase, cerca de
US$ 600 por endereço na distribuição gratuita de tokens (airdrop) da Optimism e de US$ 2.175 a 2.500 na da Arbitrum
(FATO SECUNDÁRIO). Para um custo de US$ 77 se pagar só com a parte da operação, o apostador teria de apostar
US$ 10.267 na vida. A US$ 200 por mês e sem saídas antecipadas, os três níveis de custo pedem 2.000, 6.667 e 16.667
carteiras ativas. A conclusão vai para o
capítulo 10: aquisição paga não fecha.

### 9.5 Dois regimes para o destino da taxa

**Regime (a).** A taxa se divide em quatro desde o primeiro dia. É a decisão do fundador (D-27), aplicada sem
condição.

**Regime (b).** É a "regra de partida" proposta pela revisão crítica (objeção OBJ-09, na seção 7.3). O destino final
é o do fundador; muda a ordem. Enquanto a parte da operação não paga o custo, as partes de Bitcoin e de recompra
cobrem a diferença, com registro; o que sobra delas fica em USDC, a moeda digital que vale 1 dólar, em conta
pública. Quando a operação cobre o custo por três meses seguidos e há seis meses de custo guardados, o excedente
segue para Bitcoin e recompra. O fundo de prêmios recebe os seus 25% nos dois regimes.

Tabela 9.7. Primeiro mês no azul e caixa mínimo, com o custo subindo por marco (INFERÊNCIA, modelo financeiro).

| Cenário | Sentido | Regime (a): primeiro mês no azul | Regime (a): caixa mínimo | Regime (b): primeiro mês no azul | Regime (b): caixa mínimo |
|---|---|---|---|---|---|
| Ruim | A = B | Não chega | −117.954 no mês 24, ainda caindo | Não chega | −106.861 no mês 24, ainda caindo |
| Razoável | A | Mês 8 | −65.237 no mês 7 | Mês 6 | −58.628 no mês 5 |
| Razoável | B | Mês 13 | −91.322 no mês 24, ainda caindo | Mês 6 | −59.028 no mês 5 |
| Otimista | A | Mês 4 | −54.669 no mês 3 | Mês 2 | −51.759 no mês 1 |
| Otimista | B | Mês 4 | −55.269 no mês 3 | Mês 2 | −51.959 no mês 1 |

Como ler. "Primeiro mês no azul" é o primeiro mês em que o dinheiro da operação paga o custo daquele mês; "caixa
mínimo" é o ponto mais fundo do caixa acumulado, contando os US$ 51.500 gastos antes do lançamento. No cenário
razoável, o regime (a) empata e depois volta ao déficit no mês 18, quando a equipe passa a receber; no regime (b)
não há recaída. No otimista, os dois regimes dão quase no mesmo. No ruim, nenhum dos dois resolve.

**E se a parte da operação fosse outra?** A tabela mostra o que muda, no regime (a) e no cenário razoável, quando a
fração da taxa que vai para a operação sobe.

| Fração da taxa para a operação | Primeiro mês no azul (A / B) | Resultado no mês 24 (A / B) |
|---|---|---|
| 25% (a decisão) | 8 / 13 | −2.069 / −3.869 |
| 50% | 7 / 8 | +2.713 / +913 |
| 75% (igual à regra de partida) | 6 / 6 | +7.494 / +5.694 |
| 100% | 5 / 5 | +12.275 / +10.475 |

Nenhuma fração salva o cenário ruim (INFERÊNCIA, modelo financeiro). O que essa tabela diz, no razoável, é que a
decisão de 25% deixa o mês 24 no vermelho e que qualquer fração de 50% para cima o põe no azul. O marco para a equipe
passar a receber e o regime da taxa precisam ser decididos juntos: o marco de US$ 400 mil apostados por três meses
só paga o nível 2 se a regra de partida valer.

### 9.6 Capital necessário e uso dos recursos

A conta do capital: gasto antes do lançamento (US$ 51.500) + déficits cobertos pelos sócios em 24 meses + reserva de
seis meses do custo do nível 1 (US$ 18.000).

Tabela 9.8. Capital necessário (INFERÊNCIA, modelo financeiro).

| Cenário | Sentido | Regime (a): sem reserva | Regime (a): com reserva | Regime (b): sem reserva | Regime (b): com reserva |
|---|---|---|---|---|---|
| Ruim | A = B | 117.954 | 135.954 | 106.861 | 124.861 |
| Razoável | A | 65.238 | 83.238 | 58.628 | 76.628 |
| Razoável | B | 91.322 | 109.322 | 59.028 | 77.028 |
| Otimista | A | 54.669 | 72.669 | 51.759 | 69.759 |
| Otimista | B | 55.269 | 73.269 | 51.959 | 69.959 |

Em uma frase: de US$ 70 a 110 mil com reserva nos cenários razoável e otimista; de US$ 125 a 136 mil no ruim. O
gasto antes do lançamento domina a conta: no razoável, ele é de 56% a 88% do capital sem reserva. Como a faixa desse
gasto vai de US$ 30 a 75 mil, três cotações de auditoria mudam mais este plano do que refinar a projeção de volume.

Tabela 9.9. Uso dos recursos no cenário razoável, sentido A, regime (a) (INFERÊNCIA, modelo financeiro).

| Uso | Valor |
|---|---|
| Auditoria do programa | 30.000 |
| Abertura da empresa | 4.000 |
| Avaliação jurídica do produto e dos termos | 10.000 |
| Prêmios iniciais (primeiros 90 dias) | 7.500 |
| **Subtotal antes do lançamento** | **51.500** |
| Déficits cobertos pelos sócios em 24 meses | 13.738 |
| Reserva de seis meses do custo do nível 1 | 18.000 |
| **Total** | **83.238** |

**Se o custo for fixo desde o primeiro mês.** As tabelas acima supõem que ninguém recebe até o volume chegar ao
marco. Se houver salário desde o começo, o capital muda de patamar.

Tabela 9.10. Capital dos sócios, sem reserva, com custo fixo desde o mês 1 (INFERÊNCIA, modelo financeiro).

| Cenário | Custo fixo | Sentido | Regime (a): capital | Regime (b): capital | Regime (a): primeiro mês no azul | Regime (b): primeiro mês no azul |
|---|---|---|---|---|---|---|
| Ruim | 3.000 | A = B | 117.954 | 106.861 | Não chega | Não chega |
| Ruim | 10.000 | A = B | 285.954 | 274.861 | Não chega | Não chega |
| Razoável | 3.000 | A | 65.238 | 58.628 | Mês 8 | Mês 6 |
| Razoável | 10.000 | A | 174.122 | 123.052 | Mês 20 | Mês 14 |
| Razoável | 10.000 | B | 210.322 | 132.234 | Não chega | Mês 14 |
| Razoável | 25.000 | A | 534.122 | 426.066 | Não chega | Não chega |
| Otimista | 10.000 | A | 88.466 | 66.106 | Mês 7 | Mês 4 |
| Otimista | 25.000 | A | 235.022 | 145.213 | Mês 14 | Mês 8 |

**De onde o capital pode vir.**

| Fonte | Encaixe com o modelo |
|---|---|
| Sócios | Cobre o nível 1 nos cenários razoável e otimista. É a única fonte que não depende de terceiros |
| Receita | Paga o custo do mês a partir do mês 8 a 13 no razoável e do mês 4 no otimista, enquanto ninguém recebe |
| Regra de partida | Não é capital novo; reduz o que os sócios põem (compare as colunas da tabela 9.8) |
| Patrocínio | No razoável, US$ 16.500 brutos no primeiro ano (3 × 500 + 6 × 2.500), dos quais 11.550 (A) ou 4.950 (B) ficam com a banca. Ajuda, não financia |
| Venda privada do token B | Não entra como caixa em nenhum cenário: a recompra projetada não sustenta a avaliação de exemplo (seção 8.5) |
| Token A | Não financia a operação: o dinheiro das compras fica na curva e a taxa de criador é proposta para o fundo de prêmios |
| Investidores, hackathon, aceleração | Sem número neste modelo |

Dois riscos, registrados por inteiro na seção 14.2. O capital não tem fonte garantida, e a venda privada é circular:
ela precisa acontecer antes do volume, e o preço dela só se justifica depois do volume (risco R-03). E os custos vêm
antes da receita: de US$ 30 a 75 mil antes do primeiro dólar de taxa (risco R-04).

**Custos fora do modelo mensal.**

Tabela 9.11. Faixas de custo levantadas (revisão de finanças e de conformidade).

| Custo | Faixa | Etiqueta |
|---|---|---|
| Auditoria do programa | US$ 7 a 20 mil (programa simples); US$ 20 a 60 mil (protocolo padrão); primeira auditoria estimada em US$ 15 a 45 mil | FATO SECUNDÁRIO (blogs de empresas de auditoria) [A confirmar] |
| Acesso à rede (RPC, Helius) | US$ 49, 499 ou 999 por mês | FATO (página oficial, 4/out/2026) |
| Empresa no exterior | Abertura de US$ 1,5 a 6 mil; manutenção de US$ 1 a 2,5 mil por ano | FATO SECUNDÁRIO (prestadores) |
| Avaliação jurídica do produto e dos termos | US$ 5 a 15 mil | Fonte fraca |
| Parecer jurídico do token | US$ 15 a 50 mil | Fonte fraca |
| Licença de jogo no exterior | Ilha de Man: 5.250 libras de pedido e 36.750 por ano; Curaçao: 4.592 euros de pedido e 47.450 por ano | FATO SECUNDÁRIO (fonte comercial) |
| Soma antes do primeiro dólar de taxa | US$ 30 a 75 mil | INFERÊNCIA |

A tabela 9.8 não inclui o parecer jurídico do token, um segundo desenvolvedor por contrato nem reembolso por falha
de resolução.

> **Objeção registrada OBJ-29 · severidade baixa**
>
> **Decisão do fundador:** sobre o hackathon, "esquece isso, não precisa para agora."
>
> **O que a revisão crítica achou:** uma fonte barata de capital e de validação está sendo deixada passar, num plano
> em que o capital não tem fonte garantida.
>
> **Evidência:** o prazo do Colosseum é 12 de outubro de 2026 (revisão de finanças); os valores de prêmio e de
> aceleração não foram conferidos **[A confirmar]**.
>
> **Alternativa proposta:** reconsiderar a submissão do que já existe na rede de testes. É decisão do fundador.
>
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 9.7 Sensibilidades

A tabela muda uma premissa de cada vez, no cenário razoável. "Capital" é sem reserva.

Tabela 9.12. Sensibilidades (INFERÊNCIA, modelo financeiro).

| Caso | Receita no mês 12 (A / B) | Receita no mês 24 (A / B) | Regime (a): primeiro mês no azul (A / B) | Regime (a): capital (A / B) | Regime (b): capital (A / B) |
|---|---|---|---|---|---|
| Base (taxa de 3%) | 9.400 / 8.400 | 22.275 / 20.475 | 8 / 13 | 65.238 / 91.322 | 58.628 / 59.028 |
| Taxa de 2%, mesmo volume | 6.850 / 5.850 | 15.900 / 14.100 | 12 / 14 | 73.131 / 109.331 | 61.756 / 62.375 |
| Taxa de 4%, mesmo volume | 11.950 / 10.950 | 28.650 / 26.850 | 7 / 11 | 63.988 / 73.313 | 56.775 / 56.975 |
| Volume 50% abaixo | 5.575 / 4.575 | 12.713 / 10.913 | 13 / 14 | 69.734 / 76.909 | 63.430 / 65.042 |
| Sem saída antecipada | 10.750 / 9.750 | 25.650 / 23.850 | 7 / 12 | 64.513 / 81.788 | 57.525 / 57.763 |
| Saídas de 40% do dinheiro | 8.050 / 7.050 | 18.900 / 17.100 | 10 / 13 | 66.294 / 100.856 | 60.181 / 60.781 |
| Banca do patrocínio dividida em quatro | 9.400 / 8.400 | 22.275 / 20.475 | 14 / 14 | 102.634 / 111.684 | 58.803 / 59.122 |
| Sem nenhum patrocinador | 7.650 | 19.125 | 17 | 118.472 | 59.459 |
| Teto da taxa pelo lado perdedor (taxa média de 2,3%) | 7.615 / 6.615 | 17.813 / 16.013 | 11 / 13 | 67.728 / 103.928 | 60.752 / 61.352 |

O que a tabela ensina:

- **O patrocínio pesa mais do que parece.** Sem nenhum patrocinador, o regime (a) só chega ao azul no mês 17 e o
  capital quase dobra (118.472 contra 65.238). E o patrocínio é justamente a linha sem precedente.
- **O destino da parte da banca vale tanto quanto o sentido do 70/30.** Dividir a parte da banca em quatro, como a
  taxa, leva o capital do regime (a) de 65 para 103 mil no sentido A.
- **O regime (b) quase não sente nenhuma dessas mudanças.** O capital fica entre 57 e 65 mil em todas as linhas.
- **Três empates.** A taxa de 2% rende o mesmo que a de 3% se trouxer 50% mais volume. A de 4% rende o mesmo se
  perder até 25% do volume. O teto pelo lado perdedor (alternativa da objeção OBJ-07) se paga se trouxer 30% mais
  volume. Ninguém mediu quanto o volume muda com a taxa num pote, de modo que os três empates são contas, não
  previsões.

### 9.8 Metas de 90 dias e critério de parada

O fundador delegou a definição: "você mesmo pode nos dizer ... o que seriam metas ruins, razoáveis e otimistas"
(D-43). A proposta está abaixo. As linhas de volume, carteiras, taxa e pote médio saem dos três cenários (meses 1 a
3). As linhas de retorno, de potes de um lado só e de volume por dólar de prêmio são premissa sem dado.

Tabela 9.13. Metas ao fim de 90 dias com dinheiro real (INFERÊNCIA, modelo financeiro).

| Medida | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume apostado, somado | Até US$ 45 mil | US$ 150 mil | US$ 750 mil ou mais |
| Volume no terceiro mês | US$ 22.500 | US$ 75.000 | US$ 375.000 |
| Carteiras ativas no terceiro mês | 150 | 375 | 1.500 |
| Perguntas abertas e resolvidas | 24 | 24 | 36 |
| Pote médio por pergunta | US$ 1.875 | US$ 6.250 | US$ 20.833 |
| Taxa arrecadada | US$ 1.148 | US$ 3.825 | US$ 19.125 |
| Carteiras que apostam de novo em 30 dias, em pergunta sem prêmio | Menos de 10% | 20% a 35% | Mais de 35% |
| Potes que terminam de um lado só | Mais de 40% | Cerca de 20% | Menos de 10% |
| Volume adicional por dólar de prêmio | Abaixo de 20 | 20 a 39 | 39 ou mais |
| Patrocínio | Nenhuma carta de intenção | Três cartas de intenção; primeiro pagamento no mês 4 | Três patrocinadores de US$ 500 pagos |
| Resolução | Qualquer resultado errado ou prazo perdido | Nenhum | Nenhum |
| Caixa acumulado no mês 3, regime (a) | −US$ 60.213 | −US$ 59.544 | −US$ 54.669 |

As réguas: o World fez US$ 1,14 milhão no primeiro mês, dentro da Phantom (FATO SECUNDÁRIO, DefiLlama). A meta
razoável de 90 dias é 57% de tudo o que os mercados ligados ao pump.fun somaram na Polymarket (FATO SECUNDÁRIO, fonte
fraca); a otimista é 66% do primeiro mês do World.

**Como usar a tabela.** O retorno sem prêmio manda mais que o volume. Volume alto com retorno abaixo de 10% é o
padrão que antecedeu as quedas de 80% a 96% dos concorrentes (seção 7.5). Volume modesto com retorno de 30% é um
negócio pequeno e real. Uma linha da tabela não é meta de crescimento, e sim condição: um único resultado errado ou
prazo de resolução perdido põe os 90 dias na coluna "ruim", qualquer que seja o volume.

**Critério de parada proposto (INFERÊNCIA).** Se, aos 180 dias, o volume do mês for de até US$ 45 mil e o retorno
sem prêmio estiver abaixo de 10%, o cenário é o ruim, que não se paga em nenhum regime. Parar no mês 6 limita a perda
a US$ 68.496 no regime (a) e a US$ 66.488 no regime (b); seguir até o mês 24 leva a US$ 117.954. O critério deve ser
escrito antes do lançamento, quando ainda é fácil ser frio. O número que decide, em todos os cenários, é quantas
carteiras voltam a apostar sem prêmio.

### 9.9 O que o modelo não sabe

A lista do que falta, para o leitor pesar as tabelas pelo que elas valem:

1. **Quanto cada carteira aposta por mês.** Não há dado em nenhuma plataforma. Se for a metade do suposto, todo o
   volume cai pela metade.
2. **Quantas carteiras aparecem e quantas voltam.** As trajetórias são linhas retas; os concorrentes mostram picos
   seguidos de quedas de 80% a 96%, que o modelo não reproduz.
3. **Se existe demanda pelo recorte.** A pesquisa registrou que a demanda direta não está demonstrada (seção 2.5).
4. **Quanto dinheiro sai antes da resolução, e com que penalidade.** O mecanismo não tem precedente.
5. **Quantos patrocinadores pagam.** Não há precedente pago nem conversa registrada.
6. **O sentido do 70/30 e o destino da parte da banca.**
7. **O efeito da taxa no volume.** Ninguém mediu num pote.
8. **Quão desequilibrados serão os potes.** O modelo cobra 3% de todo pote e não reduz o volume dos desequilibrados.
9. **A duração real das perguntas.** Muda o dinheiro travado e o atraso da taxa.
10. **O custo real.** Auditoria, empresa e advogado vêm de faixas de blogs de fornecedores; o nível 3 é um número
    provisório do sócio técnico.
11. **O prazo até o lançamento.** Cada mês de reescrita e de auditoria custa tempo e não está nas tabelas.
12. **Impostos, câmbio e contabilidade** da empresa, da tesouraria em Bitcoin e do token.
13. **Bloqueio geográfico.** Se países forem bloqueados, o público muda (ver capítulo 15).
14. **Se o volume de apostas cai junto com o Bitcoin.** Hipótese não verificada.
15. **Quanto do volume o fundo de prêmios causa.** Nenhuma plataforma publicou esse retorno.
16. **A venda privada do token B.** Preço, data e destino são propostas; não entra como receita nem como caixa.
17. **Reembolso por resolução errada, falha do programa ou ataque.** É um passivo sem valor no modelo.
18. **O custo de vender patrocínio.** É tempo de sócio, que o modelo não conta como caixa.
19. **O sócio técnico.** O modelo supõe que o programa é escrito e mantido sem custo de equipe no nível 1.

## 10. Entrada no mercado

### 10.1 Princípio: aquisição orgânica

O ponto de partida é uma conta da seção 9.4. Um apostador que põe US$ 200 por mês durante seis meses deixa US$ 9
para pagar custo (INFERÊNCIA, premissa sem dado). Trazer um usuário, em cripto, já custou de US$ 77 a US$ 2.500
(FATO SECUNDÁRIO, 2021 a 2023). Comprar usuários, portanto, não fecha: cada apostador comprado custaria várias vezes
o que ele devolve.

Um exemplo com preço de mercado. Uma publicação paga de um micro-influenciador custa cerca de US$ 500 (fonte fraca,
blogs de agência, 2026). Para se pagar só com a parte da operação, ela teria de trazer 56 apostadores com o perfil
acima (500 ÷ 9; INFERÊNCIA). Um pacote de lançamento de token, de US$ 40 mil a 150 mil (fonte fraca), está fora de
qualquer conta deste plano.

Daí o princípio: os canais que cabem são os gratuitos e os que outra pessoa paga. É também por isso que o cenário
razoável do capítulo 9 foi desenhado como "um nicho pequeno e fiel, sem distribuição paga".

### 10.2 Canais

**O X, o mascote e a página de sugestões.** O público sugere perguntas pelo X, e o site terá uma página com "um
monitor vindo do X, e orientação da galera como eles podem fazer para fazer as sugestões" (D-12). A linha do tempo
embutida no site é gratuita; ler menções de forma automática custa US$ 0,005 por publicação lida (FATO, preços do X,
3/out/2026). O mascote, o Baked, dá rosto à conta. E cada pergunta resolvida vira uma publicação que nenhum
concorrente consegue fazer igual: o resultado foi lido na rede, e qualquer pessoa confere. O produto está na seção
3.8.

**A comunidade que cada patrocinador traz.** É o canal mais específico do Baked Market. Um projeto que patrocina uma
pergunta sobre a própria queima de tokens divulga a pergunta para a comunidade dele, porque tem interesse em que ela
seja vista. Nas palavras do fundador: "sendo em oráculo on chain, e possibilitando você abrir a questão de algo sobre
si mesmo, você acaba criando uma forma de marketing". Cada patrocinador é, ao mesmo tempo, receita e distribuição. O
canal só existe se os patrocinadores existirem, o que ainda não foi demonstrado (objeção OBJ-15, seção 7.4).

**O token A.** Pela decisão do fundador, o token do pump.fun vem primeiro "para servir de marketing pra nossa
plataforma" (D-30). A proposta de ordem e a objeção à linguagem do lançamento estão na seção 8.7.

**Indicação com parte da taxa.** Quem traz um apostador recebe uma fração da taxa que ele gerar. O precedente é a
Polymarket: 10% da taxa líquida dos indicados diretos e 5% dos indiretos, por 30 dias, e só para quem já negociou
US$ 10.000 (FATO, documentação e central de ajuda). No Baked Market isso é custo de aquisição, não receita, e
precisa de trava contra a autoindicação: sem identificação, uma pessoa abre quantas carteiras quiser e indica a si
mesma.

**Integração com carteira, como objetivo de médio prazo.** A distribuição em Solana passa pelas carteiras. Quando os
contratos da Kalshi chegaram a Solana em forma de token, a previsão na rede somou US$ 28,6 milhões em cerca de três
semanas, com cerca de 21 mil carteiras, e 98% do volume da DFlow, um dos dois canais, veio da Phantom (FATO
SECUNDÁRIO, Step Data, dez/2025 a jan/2026). O cenário otimista do capítulo 9 depende de um canal assim, que hoje
não existe. Não é algo que se pede no primeiro dia: é algo que se conquista com meses de resolução sem erro.

**O que os outros fizeram.** O Melee juntou 49.247 pessoas numa fila de espera com um beta de pontuação, sem
dinheiro real (FATO, site, 4/out/2026): é o modelo barato de aquecer o público antes da rede principal. A Limitless
fez pontos e token, e o volume caiu 96% de maio a setembro de 2026; Opinion e Myriad, que rodavam campanhas de pontos
por volume, perderam 80,7% e 93,8% do volume de um trimestre para o outro (FATO SECUNDÁRIO, 2026). A lição: pontuar
acerto prende; pontuar volume atrai dinheiro que vai embora.

### 10.3 Antes de construir: validar

O plano inteiro supõe duas coisas que ninguém demonstrou: que o público web3 quer apostar em fatos lidos on-chain, e
que projetos pagam para patrocinar perguntas. As duas podem ser testadas antes de gastar com a reescrita do programa
e com a auditoria. As propostas são da revisão crítica; não são decisões.

- **Teste de demanda** (objeção OBJ-01, seção 2.5): de 10 a 15 conversas com o público-alvo; um beta com pontuação e
  sem dinheiro; quatro semanas de potes com teto baixo; e o critério de continuar ou parar escrito antes de começar.
- **Cartas de intenção** (objeção OBJ-15, seção 7.4): de três a cinco projetos reais dispostos a se comprometer por
  escrito com um patrocínio. Se, em trinta dias de conversa, ninguém se comprometer nem com US$ 500, a segunda
  trilha de receita é hipótese.

Os dois testes custam tempo de sócio e quase nenhum dinheiro, e respondem às duas perguntas de que as projeções mais
dependem.

### 10.4 Sequência de lançamento

O lançamento segue as cinco fases do roteiro (seção 12.1), sem datas:

1. **O pote na rede de testes.** O mecanismo novo funcionando, com dinheiro de mentira.
2. **O produto jogável na rede de testes.** Perguntas reais, resolução real, sem dinheiro real. É aqui que cabe o
   beta com pontuação.
3. **O patrocínio.** As faixas, o pedido de pergunta e as contrapartidas.
4. **A saída antecipada**, escrita e testada, desligada por padrão.
5. **A rede principal, fechada e com tetos de pote.** Dinheiro real, para um grupo limitado, depois da auditoria.

Dentro de cada fase, as perguntas curtas vêm primeiro. O motivo é financeiro (tabela 9.6): com perguntas de 3 dias,
o dinheiro parado necessário para pagar o custo é um décimo do que seria com perguntas de 30 dias. E é também de
hábito: quem recebe o resultado em três dias volta mais cedo para apostar de novo.

### 10.5 Como medir

A meta de entrada no mercado não é volume. É retenção: a parcela das carteiras que aposta de novo, em 30 dias, numa
pergunta sem prêmio. É o número que separa um público de verdade de um público que veio buscar incentivo, e é o que
decide entre os cenários do capítulo 9. As metas de 90 dias e o critério de parada estão na seção 9.8; a regra dos
três sinais do fundo de prêmios, na seção 7.5.

Três medidas acompanham a retenção desde o primeiro dia, todas tiradas do registro público do programa: a parcela de
potes que termina de um lado só (pote vazio é sinal de pergunta sem interesse); o volume adicional por dólar de
prêmio; e, para cada patrocinador, quantas carteiras e quanto volume a pergunta dele trouxe, porque é esse relatório
que vende o patrocínio seguinte.

Um limite para todos os canais: nenhum material em português e nenhuma campanha dirigida ao Brasil antes do parecer
jurídico (ver capítulo 15).



## 11. Tecnologia e arquitetura

Este capítulo explica as peças técnicas do Baked Market para quem não programa. Cada peça vem com o que é, por que
existe e um exemplo. Onde é preciso entrar em detalhe, há um trecho "Para quem vai construir", que o leitor não
técnico pode pular sem perder o fio. Os nomes das instruções do programa aparecem só entre parênteses, depois da
explicação em português.

### 11.1 O que existe hoje

Existe um programa pronto e testado, mas ele faz outra coisa. **Programa** é o código que roda na Solana (a
blockchain em que o produto roda) e guarda o dinheiro dos potes. O programa atual tem 1.717 linhas na linguagem
Rust, 138 testes e nove leitores on-chain, e não tem nenhuma chave de administrador (FATO, repositório, lido em
4/out/2026). **Leitor on-chain** é a parte do programa que abre uma conta da Solana, lê um número ou uma chave e
responde sim ou não, sem ninguém informar nada. Exemplo: o leitor de queima lê a oferta de um token e compara com a
meta.

O que esse programa faz bem é exatamente o que o Baked Market precisa: ler a rede e gravar o resultado. As duas
peças que cuidam disso somam 300 linhas: a que reúne os nove leitores tem 234 e a que grava o resultado tem 66
(FATO, repositório, 4/out/2026). A resolução é aberta a qualquer pessoa e é definitiva numa só operação.

O que ele não é: um mercado de previsão em pote. No programa atual, um patrocinador vende, com desconto, fichas de
SIM como recompensa por uma meta. **Decisão.** "ele foi montado errado, não é essa a proposta dele ... queremos que
seja um mercado de previsão".

Três fatos sobre o estado do código que o leitor precisa ter em mente (FATO, repositório e arquivo `LICENSE`,
4/out/2026):

- O repositório se descreve como protótipo de hackathon, na **rede de testes (devnet)**, que é a rede de ensaio, com
  dinheiro de mentira. Nada dele roda na **rede principal (mainnet)**, em que o dinheiro é real.
- O código não passou por **auditoria**, que é a revisão do programa por uma empresa de segurança independente.
- A licença é MIT, em nome de Ronaldo Pereira, o sócio técnico, e 11 dos 16 registros de alteração listados são
  dele. A consequência para a equipe está na seção 13.3.

### 11.2 O programa novo

O Baked Market pede um programa novo, escrito ao lado do atual, e não um remendo. Do atual aproveita-se a parte de
ler e resolver. Sai a parte econômica inteira. O programa novo é estimado em 1.500 a 2.500 linhas (INFERÊNCIA,
relatório de viabilidade, 4/out/2026).

| Situação | Peça | Em linguagem simples |
|---|---|---|
| Fica | Os nove leitores e as conferências de cada tipo de pergunta | A parte que lê a rede e diz se a meta foi cumprida |
| Fica | A resolução (`resolve`) | Qualquer pessoa aciona; o programa lê a rede e grava o resultado; não há volta |
| Fica | A trava das apostas quando o fato acontece (`require_trading_open`) | Se a meta já foi cumprida, ninguém mais aposta; no programa novo, a mesma trava vale para a saída |
| Fica | O cofre de cada pergunta e as transferências conferidas | O dinheiro só sai com a assinatura do próprio programa |
| Fica | Um aviso público por operação (eventos) | O site monta o histórico a partir desses avisos |
| Fica | O método de teste aleatório de invariantes | Um robô faz milhares de sequências de operações e confere, a cada passo, se a conta fecha |
| Muda | O registro de cada pergunta | Saem sete campos do modelo antigo; entram o total do SIM, o total do NÃO, o prêmio neutro, as penalidades de cada lado, a taxa, o fechamento e o estado |
| Muda | A abertura de pergunta | Hoje qualquer um abre; passa a ser só a equipe, em dois passos, com teto de pote |
| Muda | Os prazos | De contagem de blocos para data e hora |
| Sai | Oito instruções do modelo antigo | Comprar SIM com desconto, criar e destruir pares de fichas, pôr e tirar liquidez, trocar fichas, sacar orçamento e resgatar fichas |
| Novo | Configuração | Quem é da equipe, qual é a taxa, para onde ela vai, se o sistema está pausado |
| Novo | Apostar (`place_bet`) e o registro de cada apostador | O valor que uma carteira pôs em cada lado, em nome dela, sem virar token |
| Novo | Resgatar (`claim`) e devolver | O vencedor retira a sua parte; o pote de um lado só e a pergunta anulada devolvem |
| Novo | Taxa contabilizada e envio a um destino único | A taxa fica anotada em cada pergunta e segue para uma só conta |
| Novo | Pedido de pergunta com depósito travado; prêmio neutro; aposta de patrocinador | A segunda trilha de dinheiro (ver seção 3.7) |
| Novo | Sair antes (`exit_position`) | A saída antecipada com penalidade (ver seções 3.6 e 11.6) |
| Novo | Pausa em três níveis | Normal; sem apostas novas; sem apostas nem saídas |
| Novo | Leitor de preço pela Pyth | Para perguntas de preço do SOL e do Bitcoin (ver seção 4.4) |
| Depois | Leitores para Token-2022; formatura no pump.fun | Fora do primeiro lançamento (ver seção 12.4) |

Fonte da tabela: briefing do modelo de pote, seção 4, e relatório de viabilidade, seção 1.1 (FATO quanto ao que
existe; INFERÊNCIA quanto ao que é novo).

**A conta que tem de fechar sempre.** O cofre de uma pergunta precisa ter, em qualquer momento, pelo menos tudo o
que o programa deve. Exemplo: com 300 USDC no SIM e 700 no NÃO, o programa deve 1.000; o cofre tem de ter 1.000 ou
mais. Se alguém mandar 5 USDC direto ao cofre, por fora, o cofre passa a ter 1.005 e a dívida continua 1.000: sobra
nunca é problema, falta é. Esse tipo de regra se chama invariante: uma conta que vale antes e depois de toda
operação. No programa atual, um teste aleatório já confere as invariantes do modelo antigo depois de cada
operação. O programa novo mantém o método e troca as contas.

#### Para quem vai construir

A invariante proposta pela revisão técnica, conferida no fim de toda instrução, com reversão da transação se não
fechar (INFERÊNCIA, relatório técnico e de segurança, item S7):

```text
saldo contabilizado = pote do SIM + pote do NÃO + prêmio neutro
                    + penalidades do SIM + penalidades do NÃO + taxa devida
saldo real do cofre ≥ saldo contabilizado
```

Os saldos são contabilizados em campos do registro da pergunta, e não lidos da conta de token, como o programa
atual já faz de propósito. Os estados da pergunta são explícitos (Aberta, Fechada, Resolvida ou Anulada), em vez de
conferências soltas de data. O teste aleatório de invariantes é refeito para o pote, com a saída no sorteio, e
confere três propriedades: a soma dos resgates mais a taxa nunca passa do cofre; a devolução nunca passa da aposta;
fatiar uma entrada ou uma saída em várias operações nunca melhora o resultado.

### 11.3 Contas e dinheiro

**Um cofre por pergunta.** **Cofre** é a conta de USDC de uma pergunta, que pertence ao programa; só ele assina a
saída de dinheiro. Ter um cofre por pergunta isola o risco: um erro ou um bloqueio atinge uma pergunta, não todas.
O cofre fica num endereço que o próprio programa deriva, e ninguém consegue criá-lo antes para travar a abertura.

**Um registro por apostador.** Cada aposta cria um registro em nome da carteira. Toda conta nova na Solana exige um
depósito de aluguel, devolvido quando a conta fecha: cerca de 0,0017 SOL por registro (INFERÊNCIA, relatório
técnico, item C2, 4/out/2026). Quem paga é o apostador, e a tela precisa dizer isso: numa aposta de 1 USDC, o
depósito é uma parte relevante do valor.

**Quem chega só com USDC não consegue apostar.** A rede cobra as suas taxas em SOL. Quem traz USDC de outra
blockchain, ou saca de um serviço de privacidade para uma carteira nova, chega sem SOL para a taxa da rede e para o
depósito de aluguel. A proposta para o MVP é avisar na tela, e não oferecer "nós pagamos a taxa": isso criaria um
serviço da casa que vê quem é quem e gasta dinheiro a pedido de qualquer um (INFERÊNCIA, relatório técnico, item
P2).

**Pagamento sempre puxado por quem recebe.** O resgate, a saída e a devolução do patrocínio são acionados por quem
vai receber, que assina e indica a própria conta de USDC. A equipe e o serviço agendado nunca "empurram" dinheiro
para a conta de alguém. Motivo: no padrão de token usado, o dono de uma conta pode reatribuí-la, e uma operação que
dependa da conta de um terceiro pode ser travada por ele (FATO, documentação do repositório).

**Só USDC, com endereço fixo.** **Decisão.** "A moeda vai ser usdc, vamos abandonar a ideia de sol." O programa
aceita um único token, o USDC emitido pela Circle, gravado no código. USDC enviado direto ao endereço do cofre, por
fora de uma operação do programa, não vira aposta nem prêmio: a tela nunca mostra o endereço do cofre como destino
de pagamento. Há um risco que vem com a moeda (R-14): o emissor pode congelar contas de USDC (INFERÊNCIA, a
conferir; a conta de registro do USDC não foi lida). O cofre por pergunta limita o estrago a uma pergunta.

**Três resultados.** Além de SIM e NÃO, a revisão técnica propõe um terceiro: **pergunta anulada**, que é o
resultado em que a pergunta não pôde ser decidida e as apostas voltam. Exemplo: a conta que seria lida deixou de
existir, ou o programa de terceiros que a mantém mudou de formato (R-09). Sem esse terceiro resultado, uma leitura
impossível vira NÃO pela regra do prazo. É proposta; depende do aval do fundador e do sócio técnico (ver seção
16.2).

**Prazos em data e hora.** O programa atual mede prazo em blocos, e o tempo de um bloco varia: o projeto mediu 235
milissegundos na rede de testes, contra 400 nominais (FATO, documentação do repositório). Uma regra como "fecha 24
horas antes" pede relógio de verdade. O programa novo guarda o fechamento e o fim em data e hora.

### 11.4 Chaves e poderes

O programa atual não tem chave de administrador: qualquer um cria uma pergunta, não há taxa nem pausa. O programa
novo terá chaves, porque a equipe abre as perguntas, cobra a taxa e precisa poder parar o sistema num defeito. Por
isso o plano não diz "ninguém controla": diz quem pode o quê.

Quatro definições, antes do quadro:

- **Chave de atualização** é a carteira que pode trocar o código do programa. Quem a tem pode esvaziar todos os
  cofres, porque todos são assinados pelo programa.
- **Multisig** é uma carteira que só assina quando várias pessoas aprovam. No formato 2 de 3, duas de três pessoas
  precisam assinar.
- **Trava de tempo** é a espera obrigatória entre aprovar e executar uma mudança, para o público ver antes.
  Exemplo: uma mudança de taxa só vale 48 horas depois de aprovada.
- **Compilação verificável** é a prova pública de que o código que roda na rede é o do repositório. Qualquer pessoa
  confere com uma ferramenta.

Quadro de poderes proposto (INFERÊNCIA, relatório técnico, seção 4, 4/out/2026):

| Poder | Quem | Limite gravado no código |
|---|---|---|
| Atualizar o programa | Multisig 2 de 3 com trava de tempo | Compilação verificável a cada versão |
| Abrir pergunta | Uma chave da equipe propõe, outra aprova | Teto de pote obrigatório; só os tipos permitidos |
| Mudar a taxa padrão | Multisig com trava de tempo | Teto constante; não afeta pergunta já aberta |
| Enviar as taxas ao destino | Qualquer pessoa | Só para a conta gravada na configuração |
| Aceitar ou recusar patrocínio | Uma chave da equipe | O aceite aplica o dinheiro na mesma transação; a recusa só libera o saque pelo patrocinador |
| Pausar | Uma chave da equipe | Nunca bloqueia resgate, devolução nem resolução |
| Despausar | Multisig | Nenhum |
| Resolver | Qualquer pessoa | Nenhum |

**O risco que este quadro trata (R-01, crítico).** Hoje os roteiros de implantação usam uma carteira guardada num
arquivo de computador. Se a rede principal seguisse o mesmo padrão, o dinheiro de todos os usuários dependeria de
um arquivo num notebook. Quem tem essa chave hoje: não encontrado [A confirmar, AC-18]. A recomendação da
referência técnica é multisig 2 de 3, com chaves em dispositivos físicos e trava de tempo; hoje não há terceira
pessoa definida (FATO quanto à recomendação e à lacuna, relatório técnico, item K1). Duas pessoas não fazem um 2 de
3.

**Por que não travar o código para sempre.** Um programa imutável não pode ser alterado por ninguém, nem para
roubar, nem para corrigir. Sem auditoria, travar o código é travar os defeitos. A formulação proposta é:
"atualizável por multisig, com espera pública, até a auditoria".

**A divisão da taxa em quatro fica fora do programa.** **Decisão.** "25% para um treasure btc da empresa, 25% para
operação (não deve ser todo o custo que foi estimado), 25% recompra e queima do nosso token em ico privado e, 25%
para fundo de prêmios". A proposta técnica não muda o destino, só o lugar em que a divisão acontece: o programa
junta a taxa de cada pergunta e a envia para uma única conta, que pertence ao multisig; a divisão em quatro é feita
pelo multisig, com registro público. Motivo: trocar USDC por Bitcoin ou recomprar token dentro do programa traria
corretoras de terceiros e preço manipulável para dentro do código que guarda os potes (INFERÊNCIA, relatório
técnico, item K5).

#### A opção avançada de fechamento, com dupla confirmação e registro

**Decisão.** O fechamento padrão é em 80% da duração, com mínimo de 24 horas; menos de 24 horas só como "opção
avançada", "com um double cheque para confirmar e log da operação de quem aprovou". A regra do produto está na
seção 3.5. Aqui fica como ela se constrói (INFERÊNCIA, pesquisa de saída, fechamento e resolução, seção 2.4, e
relatório técnico, item K7):

1. A configuração do programa guarda a lista das chaves da equipe.
2. Ao abrir uma pergunta, o programa exige pelo menos 24 horas entre o fechamento e o fim. Se o prazo for menor, só
   aceita com uma segunda assinatura, de uma chave diferente da primeira.
3. O registro fica em dois lugares: a pergunta guarda para sempre quem aprovou o fechamento curto, e o programa
   emite um aviso on-chain com quem criou, quem aprovou e quantas horas ficaram.
4. Na tela, a pergunta mostra um selo "fechamento curto" com as duas carteiras.

O cuidado que a revisão técnica acrescenta: se as duas chaves estiverem no mesmo computador ou com a mesma pessoa,
a dupla confirmação é de fachada, e o registro on-chain mostra duas chaves como se protegesse. As duas assinaturas
devem vir do multisig, de pessoas diferentes. Exemplo: uma pergunta de dois dias que feche 6 horas antes do fim só
abre se a pessoa A propuser e a pessoa B aprovar, e as duas carteiras ficam gravadas na pergunta.

### 11.5 A resolução na prática

**Decisão.** A resolução é acionada pela plataforma: "talvez a gente resolva com um sistema cron pela nossa
plataforma, acionando o resolver." A visão de produto está nas seções 4.6 e 4.7; aqui fica a arquitetura.

**O que é um cron.** **Serviço agendado (cron)** é um programa de computador que acorda de tempos em tempos e faz
uma tarefa sozinho. Aqui, a tarefa é chamar a resolução. Exemplo: a cada minuto o serviço confere se alguma
pergunta já pode ser resolvida e, se pode, envia a transação. O serviço não decide nada: quem decide é o programa,
lendo a rede. A chave do serviço não tem poder nenhum, porque a resolução é aberta a qualquer carteira.

**Por que ele precisa de redundância.** Pela regra atual do programa, se o prazo passou, o resultado é NÃO. Meta
cumprida no dia 10 e ninguém aciona a resolução até o dia 30: o resultado gravado é NÃO (FATO, código do programa,
4/out/2026). O programa não tem como descobrir, depois, quando a meta foi cumprida. Um serviço único fora do ar
transforma um SIM verdadeiro em NÃO, para sempre, sem disputa. E há um incentivo torto: quando o fato acontece,
quem apostou no NÃO ganha se ninguém perceber até o prazo.

A arquitetura proposta tem cinco peças (INFERÊNCIA, pesquisa de saída, fechamento e resolução, seção 3.4, e
relatório técnico, item R1):

| Peça | O que é | Para que serve |
|---|---|---|
| Serviço principal, sempre ligado | Um programa da equipe num servidor. Acorda por aviso, quando a conta medida muda, e por varredura, a cada minuto | Resolver em minutos, sem depender de ninguém lembrar |
| Segundo agendador, em outro provedor | O mesmo código, em outra empresa de hospedagem, com outro acesso à rede e outra chave, rodando a cada 5 a 15 minutos | Se o principal cair, a resolução atrasa minutos, não dias |
| Botão público "Resolver" | Aparece no site, para qualquer visitante, quando a simulação diz que a pergunta já pode ser resolvida | Tirar da equipe a exclusividade de fato |
| Recompensa on-chain a quem resolve | Um valor pequeno, tirado da taxa, pago pelo programa a quem acionar a resolução | Criar interessados que não dependem da casa |
| Alarme e plantão | Um vigia avisa a equipe se uma pergunta estiver "resolvível e não resolvida" há mais de 15 minutos | Uma pessoa atende; quem é essa pessoa está em aberto (seção 13.2) |

**Quanto custa.** Uma resolução custa 5.000 lamports, que são 0,000005 SOL, por assinatura (FATO, documentação da
Solana). Mil resoluções custam 0,005 SOL (INFERÊNCIA, soma). O custo relevante não é a taxa da rede: é o servidor,
o acesso pago à rede e uma pessoa atendendo o alarme.

**Perguntas de época.** **Época** é o "dia" da Solana para contas de rendimento por validação (stake); dura cerca
de dois dias. Nas perguntas que fotografam um valor numa época, a janela para provar o SIM é de cerca de dois dias
(FATO, código do programa). Um fim de semana com o serviço parado e o SIM verdadeiro vira NÃO. Por isso a proposta
é só abrir perguntas de época quando os dois agendadores estiverem no ar.

**Por que a resolução não é embutida na aposta.** A pesquisa inicial propôs que a primeira aposta ou o primeiro
resgate que encontrasse a meta cumprida já gravasse o resultado. A revisão técnica rejeitou: a resolução recusa ser
chamada de dentro de outro programa, de propósito, para ninguém embrulhá-la numa operação de empréstimo relâmpago;
embutida numa aposta, ela furaria a própria trava. Vale a revisão: o site monta a transação com a resolução na
frente, como instrução separada. Pelo mesmo motivo, agendadores que rodam dentro da rede, como o Tuk Tuk, não
conseguem acionar a resolução (FATO SECUNDÁRIO, documentação de um projeto concorrente do Tuk Tuk) [A confirmar,
AC-11].

**O que acontece se falhar.** Hoje, nada devolve o dinheiro: a falha vira NÃO. A referência dos 3% do pote, o
PancakeSwap Prediction, cancela a rodada e devolve 100%, sem taxa, quando o operador falha (FATO, documentação do
PancakeSwap). As propostas para fechar essa lacuna estão na caixa OBJ-25, na seção 4.7: o terceiro resultado
"Anulada", a devolução quando a janela de época é perdida e um plano escrito de indenização. Se a empresa indeniza,
e com que dinheiro, é decisão do fundador (seção 16.1, item 12).

### 11.6 A segurança da saída antecipada

**Decisão.** "saída antes da resolução, vamos fazer agora no mvp." A forma: "a pessoa pode sair antes com ganho
proporcional menor, ou perca proporcional maior, deixando uma penalidade pro pote." A regra e a fórmula estão na
seção 3.6. Esta seção trata só da segurança, e começa por um resumo do mecanismo para o leitor que chegou direto
aqui.

**O mecanismo, em um exemplo.** **Saída antecipada** é desistir da aposta antes da resolução e receber parte do
dinheiro de volta. **Penalidade** é a parte que quem sai deixa para trás. Na fórmula proposta (INFERÊNCIA; os
parâmetros não têm referência de mercado [A confirmar, AC-25]):

```text
devolução   = aposta × (1 − penalidade)
penalidade  = mínimo( 90% ,  5%  +  20% × tempo  +  queda )
tempo       = fração já decorrida da janela de saída (0 na abertura, 1 quando a saída fecha)
queda       = 1 − chance do seu lado na saída ÷ chance do seu lado na sua entrada   (zero se a chance subiu)
```

São três parcelas: um pedágio fixo de 5%; uma parcela que cresce com o tempo, até 20%; e uma parcela que cobra de
quem sai o estrago que a saída faz na chance do próprio lado. Exemplo, no pote da seção 3.3 (300 no SIM, 700 no
NÃO): a Ana tem 100 dos 300 do SIM, entrou com o SIM em 30% e sai com um quarto da janela decorrida. A saída dela
leva o SIM de 300 para 200; no meio do caminho, o SIM tem 250 de 950, ou 26,3%. A queda é 1 − 26,3 ÷ 30 = 12,3%. A
penalidade é 5% + 20% × 25% + 12,3% = 22,3%. De cada 100, a Ana recebe 77,72 e deixa 22,28 no pote (INFERÊNCIA,
conta conferida).

**O furo que a revisão técnica achou.** A penalidade, ao ficar no pote, vira prêmio de quem acertar. Se quem saiu
também é dono do lado vencedor, por outra carteira, ele recebe a própria penalidade de volta, menos a taxa. O
exemplo abaixo usa uma pergunta de resultado controlável e um pote de terceiros com 100 no SIM e 100 no NÃO
(INFERÊNCIA, relatório técnico, item S1; conta conferida pelo coordenador):

| Passo | SIM | NÃO | O que acontece |
|---|---|---|---|
| 1. O dono do resultado põe 900 de verdade no SIM, pela carteira A | 1.000 | 100 | Ele tem 90% do lado do SIM |
| 2. Põe 2.000 "de mentira" no SIM, pela carteira B | 3.000 | 100 | A tela mostra SIM com 96,8%; o NÃO passa a pagar cerca de 30 por 1 |
| 3. Entram 400 no NÃO, atraídos pelo retorno | 3.000 | 500 | São as vítimas |
| 4. A carteira B sai com 95% da janela decorrida | 1.000 | 500 | Penalidade de 5% + 19% + 17,3% = 41,3%, ou 826,70, que ficam no pote |
| 5. O dono cumpre a meta e a pergunta resolve SIM | | | Pote final de 2.326,70; depois da taxa de 3%, 2.256,90 |

A carteira A recebe 90% de 2.256,90, ou 2.031,20. O dono gastou 900 mais 826,70 de penalidade: 1.726,70. Lucro de
304,50. Sem o golpe, com o pote em 1.000 a 100, o lucro dele seria de 60,30. A diferença saiu dos 400 que entraram
no NÃO. A pesquisa inicial tinha concluído que esse golpe dava "prejuízo certo"; a conta dela supunha que o
golpista tinha só um terço do lado vencedor. Vale a revisão.

> **Objeção registrada OBJ-05 · severidade crítica**
> **Decisão do fundador:** quem sai antes deixa "uma penalidade pro pote".
> **O que a revisão crítica achou:** a penalidade volta ao pote, e quem domina o lado vencedor a recebe de volta.
> A penalidade deixa de ser custo para quem monta o golpe da chance com duas carteiras.
> **Evidência:** no exemplo acima, o golpe rende lucro de 304,50 em vez de 60,30 (INFERÊNCIA, relatório técnico e
> de segurança, item S1, 4/out/2026; conta conferida).
> **Alternativa proposta:** marcar a penalidade pelo lado de quem saiu. Ela vai aos vencedores só se o lado de quem
> saiu perder; se esse lado ganhar, vai ao fundo de prêmios, que abastece outros potes. No mesmo exemplo, o lucro
> de 304,50 vira prejuízo de 417,20. No caso comum, em que sai quem ia perder, a frase "penalidade pro pote"
> continua valendo.
> **Situação:** a decisão vale; a alternativa muda a letra da decisão e fica para o fundador decidir (seção 16.1,
> item 3).

**Os demais achados** (INFERÊNCIA, relatório técnico, seção 2, 4/out/2026):

- **Fuga em massa.** Quando sai uma notícia ruim e um lado inteiro foge, sobra para quem ficou de cerca de um terço
  a 63% do prêmio, conforme a ordem das entradas. Quem entrou cedo num lado pequeno tem uma saída barata para
  sempre.
- **O apostador honesto trancado.** Quando uma carteira grande aposta contra você, a sua chance cai e a sua
  penalidade sobe para 80% a 90%, sem você ter feito nada. O botão "Sair" que mostrava perto de 80 passa a mostrar
  10 a 20.
- **Sair depois do fato.** Se o programa não conferir o estado da pergunta, quem perdeu sai depois de perder, e
  esse dinheiro falta para o último vencedor. A saída precisa chamar a mesma trava das apostas, com a mesma conta
  lida.
- **Corrida.** Entre o usuário ver "recebe 85" e a transação entrar, uma aposta contrária pode levar o valor a 15.
- **Regra que depende da ordem.** A mesma operação, fatiada em várias, paga diferente. É terreno de robô.

**A fórmula revista**, que junta as correções propostas: penalidade marcada por lado; piso de 10% no lugar de 5%;
espera mínima, medida em horas, entre apostar e sair; valor mínimo aceito informado pelo usuário, com a transação
falhando se a conta der menos; posição de patrocinador sem saída; saída desligada em pergunta de preço; e uma chave
por pergunta (`exit_enabled`) que nasce desligada. Nenhum piso foi decidido: o plano mostra a fórmula proposta e a
revista, e os parâmetros dependem de uma simulação com apostadores estratégicos que ainda não foi feita [A
confirmar, AC-25].

A proposta de escrever e testar a saída no MVP, mas com a chave desligada por padrão e ligada pergunta a pergunta,
é a objeção OBJ-04, cuja caixa está na seção 3.6. No roteiro, ela aparece como a fase 4 (seção 12.1).

### 11.7 Site e servidor

**O site hoje lê a rede direto do navegador.** O histórico de cada pergunta é montado no navegador de cada
visitante, sem um servidor no meio. Para ler a rede, o site usa um serviço de **acesso à rede (RPC)**, que é o
serviço pago que deixa o site ler a blockchain e enviar transações. Dois problemas (R-12; FATO quanto ao código,
INFERÊNCIA quanto ao efeito):

1. O endereço público de acesso tem limite por visitante [A confirmar, AC-17]. Uma página inicial com dezenas de
   perguntas, cada uma buscando o próprio histórico, estoura o limite e fica em branco no dia do lançamento.
2. Uma chave paga posta no navegador é pública: qualquer um copia e gasta a cota.

A correção é um componente novo: um repasse pelo servidor da casa, com limite por visitante, e um serviço pequeno
que guarda o histórico e as posições. Para dimensionar: cada visita custa cerca de 510 créditos de leitura; o plano
de US$ 49 por mês aguenta perto de 19.600 visitas por mês e o de US$ 499, 196 mil (INFERÊNCIA, relatório de
finanças, premissa de 50 transações por página; preços dos planos: FATO, página oficial da Helius, 4/out/2026).

**O site é o elo mais fraco (R-11).** O programa pode estar certo e o usuário perder tudo assinando uma transação
maliciosa servida pelo domínio da casa. Basta uma conta tomada: a da hospedagem, a do registro do domínio ou a do
GitHub. A proposta: segundo fator com chave física nas três contas, versões de pacotes travadas e nenhum código de
terceiros na página em que a carteira assina a aposta.

**Privacidade pelo Cloak e entrada de outras redes pelo SODAX.** **Decisão.** O pagamento de outras redes usa o
SODAX ("o nome da empresa é sodax - https://www.sodax.com") e a privacidade usa o Cloak ("a gente usa a Cloak para
esconder o pagador").

| | Cloak | SODAX |
|---|---|---|
| O que é | Serviço de privacidade em Solana que esconde quem pagou a quem | Serviço que traz dinheiro de outras blockchains e entrega USDC na carteira em Solana |
| Exemplo | O patrocinador deposita, saca para uma carteira nova e patrocina com ela | Quem tem dinheiro na rede Base chega com USDC em Solana |
| Custo | Depósito grátis; saque de 0,3% mais 0,45 USDC (FATO, documentação do Cloak, 3/out/2026) | Taxa de 0,1% (FATO, documentação do SODAX, 3/out/2026) |
| Onde roda | Só na rede principal; não há rede de testes | Só na rede principal; não há rede de testes |
| O que entrega | USDC numa carteira; não aciona uma operação do programa | USDC numa carteira; não aciona uma operação do programa |
| Limite principal | O cofre de USDC do Cloak tinha cerca de 2.560 USDC e cerca de 50 operações por dia (FATO SECUNDÁRIO, plano de privacidade do sócio) [A confirmar, AC-10] | Quem chega só com USDC não tem SOL para a taxa da rede (seção 11.3) |
| Auditoria | O site diz que foi auditado; o relatório não foi publicado (FATO, documentação do Cloak) | Há relatórios de auditoria listados na documentação; não foram lidos (FATO, documentação do SODAX) |

Os limites, em linguagem direta. No Cloak, a privacidade vem de se misturar a outros valores. Um patrocínio de
US$ 500 é um quinto do cofre inteiro; o de US$ 1.500, mais da metade; o de US$ 5.000, quase o dobro (INFERÊNCIA
sobre o tamanho do cofre). Entra um valor único e sai o mesmo valor: o conjunto em que ele se esconde é de um. O
operador do Cloak vê remetente, destinatário e valores, e pode recusar uma operação. E a carteira nova chega sem
SOL: se o patrocinador mandar SOL da carteira principal, ligou as duas em público e desfez a privacidade. No SODAX,
o caminho seguro é a entrega na carteira do próprio usuário, que só depois assina a aposta; USDC entregue direto no
endereço de um cofre é dinheiro perdido. Como os dois só existem na rede principal, toda integração é testada com
dinheiro real.

A revisão técnica propõe, para o MVP, orientar em vez de integrar: o patrocinador usa o Cloak por conta própria e
chega com uma carteira nova; o SODAX fica numa página separada, "Trazer dinheiro de outra rede"; e a tela diz
"pagador não divulgado", não "anônimo". É a objeção OBJ-23, cuja caixa está na seção 3.9. O que as normas e os
casos dizem sobre aceitar dinheiro vindo de um serviço de privacidade está na seção 15.7.

**A página de sugestões pelo X.** **Decisão.** O público sugere perguntas pelo X, numa página com "um monitor
vindo do X, e orientação da galera como eles podem fazer para fazer as sugestões". Três cuidados: mostrar uma
linha do tempo embutida, que é gratuita, e uma lista curada pela equipe, em vez de exibir menções automáticas; se
um dia um robô ler menções, cada publicação lida custa US$ 0,005 (FATO, tabela de preços do X, 3/out/2026), o que
pede um orçamento mensal fixo; e o código do X não é carregado na mesma página em que a carteira assina.

**Nomes de usuário do X são dado pessoal.** Guardar quem sugeriu o quê é tratar dado pessoal. A regra de
privacidade do projeto exige responder nove perguntas antes de guardar qualquer coisa: que dado é, por que é
necessário, onde fica, quem acessa, como o acesso é controlado, por quanto tempo fica, que registros são gerados, o
que acontece num pedido de exclusão e se a mudança pede atualização de política ou de consentimento. Nenhuma foi
respondida ainda.

### 11.8 Requisitos mínimos antes da rede principal

**Decisão.** "a plataforma é uma empresa em construção com deploy a ser feita na mainnet". A revisão técnica listou
trinta requisitos mínimos de segurança para esse passo (INFERÊNCIA, relatório técnico e de segurança, seção 13,
4/out/2026). São o piso, não o teto, e não substituem uma auditoria.

| Grupo | Nº | Requisito |
|---|---|---|
| Chaves e código | 1 | Chave de atualização em multisig 2 de 3, com chaves em dispositivos físicos e trava de tempo |
| Chaves e código | 2 | Compilação verificável publicada a cada versão; repositório público na versão que está na rede |
| Chaves e código | 3 | Nenhuma chave isolada e ligada à internet com poder sobre dinheiro; o serviço agendado só aciona operações abertas a qualquer um |
| Chaves e código | 4 | Configuração criada pela chave de atualização, na mesma transação da publicação do programa |
| Chaves e código | 5 | Varredura de segredos limpa; segredos só em variáveis de ambiente; anotado como trocar cada um |
| Limites gravados no código | 6 | Teto constante para a taxa; a taxa de cada pergunta não muda depois de criada |
| Limites gravados no código | 7 | Teto de pote por pergunta e teto total do programa no período inicial |
| Limites gravados no código | 8 | Nenhuma operação da equipe move dinheiro de apostadores; destino das taxas fixo na configuração |
| Limites gravados no código | 9 | Pausa em três níveis; resgate, devolução e resolução nunca pausam |
| Limites gravados no código | 10 | Moeda: só o USDC clássico, com endereço fixo; tokens do padrão Token-2022 recusados nos leitores até haver suporte |
| Contas e aritmética | 11 | Conferência da invariante no fim de toda operação; estados explícitos da pergunta |
| Contas e aritmética | 12 | Aritmética conferida, com números grandes, arredondando sempre a favor do pote; aposta e saída mínimas de 1 USDC |
| Contas e aritmética | 13 | Totais fotografados na resolução; o resgate fecha a posição; a tabela do pote de um lado só inteira no código |
| Contas e aritmética | 14 | Pagamentos sempre puxados por quem recebe, para a conta que ele indica |
| Contas e aritmética | 15 | Terceiro resultado, "Anulada", para conta lida que ficou ilegível |
| Testes | 16 | Teste aleatório de invariantes refeito para o pote, com a saída no sorteio |
| Testes | 17 | Teste com dois usuários: A não resgata, não sai e não fecha a posição de B |
| Testes | 18 | Um teste para cada linha das tabelas do pote de um lado só, das perguntas de preço e do pedido de pergunta |
| Testes | 19 | Revisão externa, no mínimo, da saída, do resgate e da devolução; sem ela, a saída fica desligada |
| Testes | 20 | Um ciclo completo na rede de testes e um na rede principal com potes mínimos, antes de abrir ao público |
| Perguntas | 21 | Nenhuma pergunta de resultado decidido de graça por uma chave, ou só com teto baixo e selo |
| Perguntas | 22 | Todo tipo novo passa pela prova do sócio técnico: uma transação consegue mover o número e voltar? Se sim, fica fora |
| Perguntas | 23 | Perguntas de preço: só ativos grandes, só "toque", com margem de erro, idade máxima e preço fresco em toda aposta |
| Perguntas | 24 | Abertura de pergunta em dois passos, por duas pessoas; frase gerada dos parâmetros gravados na rede |
| Operação | 25 | Dois agendadores em provedores diferentes, botão público de resolver, recompensa a quem resolve, alarme e plantão |
| Operação | 26 | Chave de acesso à rede fora do navegador; repasse com limite; histórico guardado em servidor |
| Operação | 27 | Segundo fator com chave física em domínio, hospedagem e GitHub; nenhum código de terceiros na página de aposta |
| Operação | 28 | Plano de incidente de uma página; aviso visível de "programa sem auditoria" enquanto for verdade |
| Operação | 29 | As nove perguntas da regra de privacidade respondidas para os nomes de usuário do X |
| Operação | 30 | Pontos levados a advogado antes de ligar: dinheiro vindo de serviço de privacidade, patrocinador não identificado em pergunta controlável, ausência de identificação do usuário |

O item 28 merece uma frase à parte: enquanto o programa não tiver auditoria, o site diz isso, em lugar visível. O
custo de uma primeira auditoria é estimado em US$ 15 a 45 mil (FATO SECUNDÁRIO, blogs de empresas de auditoria)
[A confirmar, AC-09: pedir três cotações].

## 12. Roteiro

O roteiro não tem datas. Ele é feito de fases, de sprints (ciclos curtos de trabalho com uma entrega definida) e de
critérios de pronto. Motivo: o tamanho da equipe e as horas disponíveis não estão em nenhum documento (seção 13.1),
e um calendário sem esses dois dados seria invenção. Tudo neste capítulo vem do relatório de viabilidade do MVP, de
4/out/2026, e é INFERÊNCIA, salvo onde indicado. MVP é a primeira versão do produto que já entrega o essencial.

### 12.1 As cinco fases

| Fase | Objetivo | O que o usuário consegue | Pronto quando |
|---|---|---|---|
| 1. Pote na rede de testes | Provar que o ciclo "apostar, resolver pela leitura da rede, resgatar" funciona e que a conta do cofre fecha | A equipe abre uma pergunta; qualquer carteira aposta em SIM ou NÃO com USDC de teste; qualquer carteira resolve; o vencedor resgata; o pote de um lado só devolve com taxa; a pergunta anulada devolve | Os testes passam, inclusive o teste aleatório de invariantes com milhares de sequências; um roteiro executa o ciclo completo na rede de testes; cada linha da tabela do pote de um lado só tem um trecho de código e um teste |
| 2. Produto jogável na rede de testes | Alguém de fora da equipe entra no site, aposta com USDC de teste e acompanha o resultado; a equipe opera sem linha de comando | Ver a página inicial, abrir uma pergunta, ver chance e retorno estimado, apostar, ver a posição, resgatar, apertar o botão público de resolver, trocar entre tema escuro e claro; ler a página de sugestões do X. A equipe propõe e aprova perguntas com duas chaves e pausa | Site publicado em endereço de teste; os dois agendadores resolvendo perguntas de teste; leitor de preço do SOL e do Bitcoin testado; página de aposta sem código de terceiros; repasse do acesso à rede no servidor; alarme funcionando; teste com pessoas de fora |
| 3. Patrocínio | Provar a segunda trilha de dinheiro | O patrocinador entra numa pergunta aberta ou pede uma, trava o depósito (500, 1.500 ou 5.000), escolhe prêmio neutro ou aposta de patrocinador; a equipe aceita ou recusa; a pergunta mostra o selo e o destaque | Testes com dois usuários no depósito travado; a aposta de patrocinador nasce sem saída; a devolução nunca é "empurrada" pela equipe; o patrocinador cancela sozinho depois de 14 dias; a divisão do "70/30" gravada no código depois da decisão do fundador |
| 4. Saída antecipada, escrita, testada e desligada por padrão | Entregar a decisão do fundador com o risco contido | Nas perguntas em que a saída estiver ligada, ver o botão "Sair", o valor mínimo aceito e o custo máximo (até 90%) antes de apostar; sair pagando a penalidade | Penalidade marcada por lado (precisa do aval do fundador); a saída fecha junto com as apostas e trava quando o fato acontece; piso de 10%; espera em horas; simulação com apostadores estratégicos feita; revisão externa só dessa operação contratada |
| 5. Rede principal fechada, com tetos | Dinheiro real, em valor pequeno, com tudo o que protege o usuário | Apostar USDC real num cardápio curto de perguntas da equipe, com teto por pergunta e teto total; patrocinar; chegar de outra rede pelo SODAX numa página separada; usar o Cloak por conta própria | Multisig 2 de 3 com três pessoas definidas; compilação verificável; revisão externa do programa inteiro concluída e correções aplicadas; pausa testada; plano de incidente; plantão; termos e avisos publicados; bloqueios geográficos prontos como interruptor; saída ligada só em perguntas de pote pequeno e só depois da revisão |

Duas leituras do quadro. A primeira: a rede principal é a quinta fase, não a primeira. A segunda: a decisão de adiar
os bloqueios geográficos para o fim ("deixar para fazermos a implementação dos bloqueios ao final") cabe no roteiro
como está, porque a fase 5 é o fim; a discussão sobre quais países está no capítulo 15.

> **Objeção registrada OBJ-26 · severidade crítica**
> **Decisão do fundador:** dinheiro real na rede principal ("a plataforma é uma empresa em construção com deploy a
> ser feita na mainnet"), com o escopo completo do MVP.
> **O que a revisão crítica achou:** não é uma mudança no programa atual, é um programa novo, sem auditoria, com
> mais de dez sistemas novos, escrito por poucas pessoas.
> **Evidência:** o repositório se descreve como protótipo de hackathon, na rede de testes e sem auditoria, e a
> reescrita invalida boa parte dos 138 testes (FATO, repositório e briefing do modelo de pote, 4/out/2026).
> **Alternativa proposta:** lançar em cinco fases, com a rede principal na quinta, e com teto de pote, multisig,
> compilação verificável, pausa e auditoria externa como condição para abrir.
> **Situação:** a decisão vale; a alternativa não muda o destino, muda a ordem, e fica para o fundador decidir.

### 12.2 Os doze sprints

"Depende de" aponta o que precisa estar pronto antes.

| Sprint | Entrega | Depende de | Fase |
|---|---|---|---|
| 1 | Decisões de regra fechadas (tabela do pote de um lado só, "70/30", destino da penalidade, resultado "Anulada", duração máxima); especificação do pote em uma página; esqueleto do programa novo ao lado do atual; conferência da invariante escrita; decisão de quem é a terceira chave do multisig e de quem guarda a chave de atualização; acordo de licença do código com o sócio técnico | Fundador e sócio técnico | 1 |
| 2 | Núcleo do programa: configuração, registro novo da pergunta, registro do apostador, abertura de pergunta só pela equipe e em dois passos, aposta com retorno mínimo aceito, prazos em data e hora, estados explícitos; testes | Sprint 1 | 1 |
| 3 | Resolução adaptada (foto dos totais, recompensa a quem aciona), resgate, devolução, "Anulada", taxa contabilizada e envio ao destino; teste aleatório de invariantes; roteiro na rede de testes com USDC de teste. Fim da fase 1 | Sprint 2 | 1 |
| 4 | Leitor de preço pela Pyth (SOL e Bitcoin) com preço fresco em cada aposta; cardápio fechado; serviço agendado e segundo agendador; alarme; repasse do acesso à rede e histórico guardados em servidor | Sprint 3 | 2 |
| 5 | Documento de design reescrito; site base no layout aprovado, com dois temas: página inicial, página da pergunta, aposta, posição, resgate, devolução; estados vazios e erros | Sprint 3; o design pode começar durante o sprint 3 | 2 |
| 6 | Painel da equipe (propor, aprovar com duas chaves, pausar), opção avançada de fechamento, página de sugestões do X, termos e avisos, teste com pessoas de fora. Fim da fase 2 | Sprints 4 e 5 | 2 |
| 7 | Programa do patrocínio: pedido de pergunta com depósito travado, aceite que abre e aplica na mesma transação, recusa, cancelamento depois de 14 dias, prêmio neutro, aposta de patrocinador sem saída, selo | Sprint 3 | 3 |
| 8 | Site do patrocínio: faixas de 500, 1.500 e 5.000, acompanhamento, selo, destaque, contrapartidas básicas; instruções para chegar com carteira nova. Fim da fase 3 | Sprints 6 e 7 | 3 |
| 9 | Programa da saída: penalidade por lado, valor mínimo aceito, espera em horas, chave por pergunta desligada; simulação com apostadores estratégicos | Sprint 7, estável | 4 |
| 10 | Site da saída; invariantes com a saída; revisão externa dessa operação; correções. Fim da fase 4 | Sprint 9 | 4 |
| 11 | Endurecimento: multisig 2 de 3, compilação verificável, pausa testada, plano de incidente, plantão, segundo fator em domínio, hospedagem e GitHub, bloqueio geográfico como interruptor, varredura de segredos; envio do programa à auditoria | Sprints 8 e 10 | 5 |
| 12 | Correções da auditoria; implantação na rede principal com tetos; página "Trazer dinheiro de outra rede"; teste real do SODAX e do Cloak com valor pequeno; saída ligada em pergunta de pote pequeno, só se a revisão liberar. Fim da fase 5 | Sprint 11 | 5 |

Três observações sobre a ordem:

1. **O sprint 1 não tem código de produto.** Ele fecha decisões de regra. Quatro delas viram erro de programa se
   ficarem para depois: o sentido do "70/30", a tabela do pote de um lado só, o destino da penalidade e o cardápio
   do primeiro dia (seção 16.1).
2. **A revisão externa precisa ser contratada por volta do sprint 7**, com orçamento e agenda, porque a espera por
   um auditor não depende da equipe.
3. **Há trabalho que corre em paralelo.** O design pode começar durante o sprint 3; a página de sugestões do X e os
   termos podem ser escritos por outra pessoa a qualquer momento.

### 12.3 Cada desejo do fundador e a fase em que entra

| Desejo do fundador | Fase | Observação |
|---|---|---|
| Pote de USDC por pergunta; apostar em SIM e NÃO | 1 | Sem ressalva |
| A equipe abre as perguntas | 1 (por roteiro) e 2 (por painel) | Sem ressalva |
| Resolução por leitura da rede | 1 | Sem ressalva |
| Serviço agendado aciona a resolução | 2 | Antes disso, o botão público |
| Pote de um lado só devolve com taxa | 1 | A tabela inteira precisa estar decidida antes de programar (seção 3.4) |
| Fechamento em 80% da duração, mínimo de 24 horas | 1 | A revisão propõe duração máxima de 30 dias no MVP (caixa OBJ-21, seção 3.5) |
| Opção avançada com dupla confirmação | 2 | Pelo multisig, não por duas chaves da mesma pessoa (seção 11.4) |
| Taxa de 3% com quatro destinos | 1 (a conta) e 5 (a divisão) | A divisão é feita pelo multisig, fora do programa (seção 11.4) |
| Página de sugestões com o X | 2 | Lista curada primeiro |
| Layout aprovado, tema claro e escuro, mascote | 2 | O documento de design precisa ser reescrito antes [A confirmar, AC-19] |
| Patrocinador em três faixas, prêmio neutro ou lado | 3 | Sem ressalva |
| Patrocinador anônimo | 3, como carteira nova | Selo "pagador não divulgado" (caixas OBJ-02 e OBJ-23, seções 3.7 e 3.9) |
| Pedir pergunta com depósito travado | 3 | Sem ressalva |
| Saída antecipada com penalidade | 4 (código) e 5 (ligada por pergunta) | Caixas OBJ-04 e OBJ-05 (seções 3.6 e 11.6) |
| Entrada de outras redes pelo SODAX | 5 | Página separada |
| Privacidade pelo Cloak | 5 | Orientação e teste real com valor pequeno |

Os tipos de pergunta de cada fase estão nas seções 4.2 e 4.5.

### 12.4 O que fica fora do primeiro lançamento na rede principal

A revisão técnica listou quinze itens que ela deixaria fora do primeiro lançamento com dinheiro real, e não do
produto (INFERÊNCIA, relatório técnico e de segurança, seção 14). A coluna da direita diz como cada item se
relaciona com as decisões do fundador. Só o primeiro contraria a letra de uma decisão; os demais são ordem de
entrega, e alguns coincidem com objeções que têm caixa em outra seção.

| Nº | O que ficaria fora do primeiro lançamento | Relação com as decisões |
|---|---|---|
| 1 | A saída ligada em todas as perguntas. O código entra; a chave por pergunta nasce desligada | Contraria "vamos fazer agora no mvp" na parte do "ligada no primeiro dia" (OBJ-04, seção 3.6) |
| 2 | Perguntas decididas por uma chave: renúncia de emissão, renúncia de congelamento, programa imutável, metadados | Ordem de entrega; o cardápio está em aberto (OBJ-03, seção 4.2) |
| 3 | Rendimento de validador numa época e formatura no pump.fun | Ordem de entrega |
| 4 | Preço de token pequeno e pergunta de preço do tipo "fechamento" | Ordem de entrega; responde à pergunta do fundador em três degraus (OBJ-24, seção 4.4) |
| 5 | Leitores para tokens do padrão Token-2022 | Ordem de entrega |
| 6 | Fechamento em dois marcos, com teto por lado. Um fechamento só, pela regra decidida, e perguntas de até 30 dias | Ordem de entrega; mantém a regra decidida e adia a parte "pode ser gradual" (OBJ-21, seção 3.5) |
| 7 | Integração do Cloak dentro do site | Ordem de entrega; muda a forma, não o uso (OBJ-23, seção 3.9) |
| 8 | Janela do SODAX dentro do fluxo de aposta | Ordem de entrega; página separada ou link (OBJ-23, seção 3.9) |
| 9 | Patrocínio com lado, por pagador não divulgado, em pergunta de resultado controlável | Ordem de entrega no cardápio proposto, em que ninguém controla o resultado; a restrição em si é a OBJ-02 (seção 3.7) |
| 10 | Pedido de pergunta com depósito travado, no primeiro degrau | Ordem de entrega; entra na fase 3 |
| 11 | Divisão da taxa em quatro, recompra e compra de Bitcoin dentro do programa | Ordem de entrega; a divisão decidida é feita pelo multisig (seção 11.4) |
| 12 | Desconto de taxa e peso de voto por saldo do token | Ordem de entrega |
| 13 | Robô que lê menções do X | Ordem de entrega; lista curada e sugestão manual primeiro |
| 14 | Resolução embutida na aposta ou no resgate; agendadores que rodam dentro da rede | Escolha técnica (seção 11.5) |
| 15 | Prazo de fechamento menor que 24 horas | Ordem de entrega; a opção avançada espera o multisig em uso diário (seção 11.4) |

O que fica no primeiro lançamento, pela mesma lista: apostar, resgatar, devolver o pote de um lado só, taxa de 3%
juntada por pergunta, abertura pela equipe em dois passos, teto de pote, pausa, multisig, compilação verificável,
resolução aberta com recompensa, dois agendadores e um cardápio curto em que ninguém decide o resultado.

#### A regra gradual para perguntas longas

**Em aberto.** Sobre o fechamento em perguntas longas, o fundador disse: "ainda temos que pensar para acima de 2-3
meses se 80% não é muito longo, e pode ser gradual." A dúvida procede: pela regra decidida, uma pergunta de 180
dias fecha no dia 144 e fica 36 dias parada.

A pesquisa propõe uma regra gradual, com dois marcos em vez de um (INFERÊNCIA, pesquisa de saída, fechamento e
resolução, seção 2.3; conta conferida pelo coordenador):

- **Primeiro marco (T1):** o fim menos 20% da duração, limitado a no máximo 14 dias antes do fim. Até T1, apostas
  livres e saída permitida.
- **Segundo marco (T2):** o fim menos 5% da duração, com mínimo de 24 horas e máximo de 7 dias. Entre T1 e T2, a
  "reta final": ainda se aposta, mas cada lado só pode crescer 25% sobre o tamanho que tinha em T1, e ninguém sai.
  Depois de T2, nada.

| Duração da pergunta | Regra decidida (80%): fecha no dia | Dias fechados pela regra decidida | T1 | T2 | Dias fechados na proposta |
|---|---|---|---|---|---|
| 7 dias | 5,6 | 1,4 | dia 5,6 | dia 6,0 | 1,0 |
| 30 dias | 24,0 | 6,0 | dia 24,0 | dia 28,5 | 1,5 |
| 90 dias | 72,0 | 18,0 | dia 76,0 | dia 85,5 | 4,5 |
| 180 dias | 144,0 | 36,0 | dia 166,0 | dia 173,0 | 7,0 |

Para perguntas de até 70 dias, T1 cai exatamente nos 80% decididos: a decisão fica preservada como o fim das
apostas livres. A diferença aparece nas longas: numa pergunta de seis meses, o tempo totalmente fechado cai de 36
dias para 7. O teto de 25% serve para segurar a aposta de última hora. Exemplo: num pote de 500 no SIM e 500 no
NÃO, faltando uma hora e com o NÃO quase certo, o oportunista que hoje poria 5.000 no NÃO só consegue pôr 125, e
os apostadores antigos do NÃO recebem 1,746 por dólar em vez de 1,058 (INFERÊNCIA, conta conferida). Como o teto
vale para o lado inteiro, e não por carteira, dividir o dinheiro em mil carteiras não adianta.

A revisão técnica e o relatório de viabilidade discordam de construir isso agora: o teto por lado cria uma corrida
de robôs pelo espaço que resta, e as perguntas longas não cabem no MVP. A posição consolidada é: a regra decidida
(80% com mínimo de 24 horas) é a regra do produto; a regra gradual é a resposta proposta para as perguntas longas,
numa fase posterior; e a duração máxima no MVP fica em aberto (seção 16.1, item 4). Se o fundador quiser perguntas
longas antes, a duração máxima pode ficar na configuração e mudar sem mexer no programa.

### 12.5 Os tokens no roteiro

**Decisão.** São dois tokens, e a ordem é: "começar pelo pump.fun para servir de marketing pra nossa plataforma e
depois pensarmos um ICO privado mais robusto." O token A é o do pump.fun, a plataforma de Solana em que qualquer
pessoa lança um token em minutos; o token B é o da venda privada ("ICO privado"). O desenho dos dois está no
capítulo 8.

O lugar deles no roteiro tem três posições registradas:

- **A ordem proposta pela pesquisa de tokens** (INFERÊNCIA, 4/out/2026): no mês 0, o produto na rede principal e o
  token A; nos meses 1 a 4, medição; nos meses 4 a 6, a venda privada do token B; nos meses 6 a 9, o lançamento do
  token B, a distribuição aos detentores do token A e o início da recompra. Antes de o token B existir, a parcela
  da recompra fica em USDC numa conta pública.
- **A posição do relatório de viabilidade:** os dois tokens ficam fora do MVP. Nenhuma operação do programa de pote
  depende deles, de modo que podem entrar depois sem reescrever nada. O risco apontado é o escopo crescer com os
  tokens no meio da construção.
- **As discordâncias quanto ao momento** (token A só depois de semanas de perguntas resolvidas; token B fora do
  cronograma até haver parecer jurídico) estão na caixa OBJ-13, na seção 8.7.

O que as normas dizem sobre os dois tokens está na seção 15.5.

## 13. Equipe e operação

### 13.1 A equipe hoje

São duas pessoas e assistentes de código.

- **O fundador, Lucas.** É o dono do produto e das decisões de regra: o que é o pote, quanto se cobra, o que o
  patrocinador recebe, o que entra e o que fica fora. Não é engenheiro de protocolo. As decisões dele são a espinha
  deste plano.
- **O sócio técnico, Ronaldo.** É o autor do programa atual e dos documentos técnicos que o acompanham (a economia
  do modelo antigo, os tipos de pergunta e o plano de privacidade).
- **Assistentes de código.** Programas de inteligência artificial que escrevem e revisam código sob orientação. O
  site e boa parte dos testes dependem deles.

O tamanho real da equipe, as horas que cada um dedica e o prazo que cada um tem: não encontrado em nenhum
documento do projeto. Este capítulo trabalha com papéis, não com pessoas, e a lacuna vai para a lista de decisões
(seção 16.1, item 8) e para as perguntas ao sócio técnico (seção 16.2).

### 13.2 Papéis e quem falta

| Papel | Quem hoje | Observação |
|---|---|---|
| Dono do produto e das decisões de regra | Fundador | O sprint 1 é dele (seção 12.2) |
| Programa em Solana | Sócio técnico e assistente de código | É o gargalo: poucas pessoas, e o ambiente atual não compila |
| Site | Assistente de código | Aproveita parte do site existente |
| Design | Fundador e os protótipos aprovados | O documento de design precisa ser reescrito [A confirmar, AC-19] |
| Operação do serviço agendado e plantão | Sem dono | Alguém precisa atender o alarme (seção 11.5) |
| Revisão externa e auditoria | Sem contratada | Orçar e contratar por volta do sprint 7 |
| Jurídico | Sem dono | O parecer é o primeiro gasto proposto (seção 16.4) |
| Moderação das perguntas e do X | Equipe, sem dono | Inclui revisar o texto do patrocinador |
| Terceira chave do multisig | Sem dono | Sem terceira pessoa não há 2 de 3 (seção 11.4) |

Fonte: relatório de viabilidade, seção 5.2 (INFERÊNCIA, 4/out/2026). Cinco papéis não têm dono. Dois deles
bloqueiam a rede principal: a terceira chave e a auditoria.

### 13.3 A dependência do sócio técnico

O programa atual, que é o ativo mais sólido do projeto, é obra de uma pessoa. A licença do código é MIT, em nome de
Ronaldo Pereira, e 11 dos 16 registros de alteração listados são dele (FATO, arquivo `LICENSE` e histórico do
repositório, 4/out/2026).

| O que depende dele | Detalhe | Efeito se ele não estiver disponível |
|---|---|---|
| Conhecimento dos leitores | Por que cada leitor resiste a um empréstimo relâmpago; o que não pôde ser verificado fora de uma rede real | Aproveita-se o código como está e não se escrevem leitores novos de risco; o leitor de preço fica sem segunda opinião |
| Chave de atualização | Quem a tem hoje: não encontrado [A confirmar, AC-18] | Na rede principal, o programa novo é implantado com multisig próprio |
| Repositório e licença | O repositório de origem é dele; o do projeto é derivado | Sem acordo escrito, o reaproveitamento dos leitores e da resolução fica em dúvida. Precisa estar resolvido antes do sprint 2 |
| Revisão do programa novo | Ele conhece o desenho e os pontos sutis | A revisão externa deixa de ser recomendável e passa a ser obrigatória |
| Padrão novo de token e formatura no pump.fun | Ele mapeou o formato | Fora do MVP; não bloqueia |
| Terceira chave do multisig | Sem dono | Decisão dos dois sócios |

**Decisão.** Sobre a divisão com o sócio, o fundador disse: "por enquanto é irrelevante, eu te aviso o que fazer."

> **Objeção registrada OBJ-19 · severidade crítica**
> **Decisão do fundador:** a divisão com o sócio técnico "por enquanto é irrelevante".
> **O que a revisão crítica achou:** uma pessoa só domina o programa, sem acordo escrito, sem prazo e sem resposta
> registrada às perguntas que o briefing preparou para ela.
> **Evidência:** a licença é MIT em nome do sócio, 11 dos 16 registros de alteração são dele e as seis perguntas do
> briefing não têm resposta registrada (FATO, repositório e arquivo `LICENSE`, 4/out/2026).
> **Alternativa proposta:** acordo de sócios antes de qualquer gasto de construção ou de auditoria; resposta
> escrita às seis perguntas, com prazo; chave de atualização num multisig com os dois; orçar um segundo
> desenvolvedor por contrato.
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir. O relatório de viabilidade registra que
> a licença e a chave de atualização não podem esperar além do sprint 2.

### 13.4 A operação do dia a dia

Um mercado de previsão em que a equipe abre as perguntas é um trabalho recorrente, não só um programa no ar.
Quatro rotinas:

1. **Abrir perguntas.** **Decisão.** "vamos deixar que a equipe abra as perguntas". Uma pessoa propõe e outra
   aprova (seção 11.4). Quem propõe, quem aprova e quantas perguntas por semana: em aberto. O risco (R-16, alto) é
   não haver assunto toda semana: fatos irreversíveis na rede são raros, e só três dos oito exemplos de pergunta
   levantados na pesquisa têm leitor pronto (INFERÊNCIA, revisão crítica). A mitigação proposta são séries
   recorrentes geradas por regra, como uma pergunta de preço por semana, e uma meta de cardápio com responsável.
2. **Atender o alarme.** Quando uma pergunta fica "resolvível e não resolvida" por mais de 15 minutos, alguém
   precisa agir. O plantão não tem dono nem horário.
3. **Moderar.** O texto que o patrocinador põe na pergunta é revisado antes de ir ao ar e exibido como texto puro,
   sem links ativos. As sugestões do X viram pergunta só por decisão humana, nunca automaticamente.
4. **Medir o fundo de prêmios.** A regra dos três sinais, medida a cada trimestre, pede alguém que faça a conta
   (ver seção 7.5).

O custo de cada tamanho de operação está na seção 9.2. A capacidade de construir é um risco à parte (R-19, alto):
há poucas pessoas que escrevem Rust, o ambiente de trabalho atual não compila o programa nem roda os testes, e a
agenda de um auditor não depende da equipe. A mitigação proposta é uma máquina dedicada a compilar, ou a integração
contínua do repositório fazendo esse papel, e a contratação da revisão por volta do sprint 7.

### 13.5 Regras da casa

Nenhuma regra desta seção está decidida. São propostas da revisão crítica para tratar um risco específico (R-13): a
equipe é parte informada. Ela vê os pedidos de patrocínio antes do público e opera o serviço que aciona a
resolução. Sozinho, o risco é médio; combinado com a decisão de que quem controla o resultado pode apostar (OBJ-02,
seção 3.7), é crítico.

| Regra proposta | O que evita |
|---|---|
| A equipe não aposta nas perguntas que abre | Aposta com informação que o público não tem |
| As carteiras da equipe são publicadas | Qualquer pessoa confere a regra acima na rede |
| Nenhuma pergunta sobre o token da casa | A equipe decidir o resultado de uma pergunta em que ela mesma ganha |
| Pedido de patrocínio aceito e aplicado na mesma transação | A equipe aceitar o dinheiro e não abrir a pergunta |
| Plano de incidente de uma página, antes da rede principal | Improviso num defeito: quem pausa, quem fala, onde se publica, em quanto tempo (R-18) |

Se a equipe pode apostar e se pode haver pergunta sobre o token da casa são decisões do fundador (seção 16.1, item
11). O que os dois líderes do setor escreveram sobre isso está na seção 15.6.

## 14. Riscos

### 14.1 Como ler este capítulo

Este capítulo reúne tudo o que a pesquisa e a revisão crítica acharam de frágil no plano. São 48 itens de dois
tipos:

- **Objeções registradas (OBJ-01 a OBJ-29).** Cada uma é uma discordância da revisão crítica com uma decisão ou uma
  premissa do fundador. A decisão continua valendo. A caixa de cada objeção, com a evidência e a alternativa, está
  na seção do assunto; o índice está no Anexo C.
- **Riscos (R-01 a R-19).** São fragilidades que não contrariam nenhuma decisão: existem qualquer que seja a
  escolha do fundador.

A severidade segue a definição da revisão crítica. **Crítica:** derruba o negócio, causa perda de dinheiro de
usuário ou expõe a equipe, se não for tratada antes da rede principal. **Alta:** compromete o lançamento ou a
confiança. **Média:** custa dinheiro ou tempo. **Baixa:** incômodo. Onde dois revisores deram severidades
diferentes, vale a maior.

Nenhuma objeção foi resolvida pelas ondas de pesquisa. Resolver uma objeção é decidir, e decidir é do fundador.

### 14.2 Quadro de riscos

A coluna "Dono proposto" é INFERÊNCIA deste plano: indica quem teria de agir, não quem aceitou a tarefa. As
evidências levam a etiqueta da ficha de números; onde não há etiqueta, a evidência é uma constatação da revisão
crítica (INFERÊNCIA). Tudo com data de 4/out/2026, salvo indicação.

#### Críticos (15)

| Código | Risco | Evidência | Mitigação proposta | Dono proposto | Seção |
|---|---|---|---|---|---|
| OBJ-01 | Ninguém demonstrou que o público quer apostar em fatos lidos on-chain | Nenhum mercado aberto sobre queima, renúncia, trava ou formatura foi achado em nenhuma plataforma (FATO, ausência em busca limitada, out/2026) | 10 a 15 conversas, beta com pontuação e sem dinheiro, quatro semanas de potes com teto baixo, critério de continuar ou parar escrito antes | Fundador | 2.5 |
| OBJ-02 | Patrocinador anônimo, que controla o resultado, aposta num lado | Polymarket e Kalshi proíbem por escrito (FATO, 2026); no exemplo, o patrocinador põe 5.000 no NÃO, não cumpre a meta e lucra 658 (INFERÊNCIA) | Anônimo para o público e identificado para a equipe; declaração assinada; aviso na pergunta; aposta de lado só em perguntas que ninguém controla | Fundador | 3.7 e 15.6 |
| OBJ-03 | Perguntas decididas de graça por uma única chave | Em quatro dos nove tipos prontos uma pessoa decide o resultado sem custo; no exemplo, o dono aposta 3.000 e lucra 3.305 sem risco (INFERÊNCIA) | Deixar essa família fora no MVP; se entrar, teto baixo, selo e sem patrocínio com lado | Fundador | 4.2 |
| OBJ-04 | A saída antecipada nasce ligada em todas as perguntas | Nenhum precedente de pote que devolva dinheiro a quem sai; a revisão no papel achou seis furos | Código no MVP com a chave por pergunta desligada; ligar depois de simulação e de revisão externa | Fundador e sócio técnico | 3.6 |
| OBJ-05 | A penalidade volta ao pote e quem domina o lado vencedor a recebe de volta | No exemplo, lucro de 304,50 em vez de 60,30 (INFERÊNCIA) | Penalidade marcada pelo lado de quem saiu | Fundador | 11.6 |
| OBJ-09 | A divisão da taxa em quatro deixa 0,64% do volume para pagar a operação | No cenário razoável, a operação volta ao déficit no mês 18 (INFERÊNCIA, modelo financeiro) | Regra de partida: as parcelas de Bitcoin e de recompra esperam em USDC e cobrem o déficit até a operação se pagar | Fundador | 7.3 |
| OBJ-17 | Bloqueios geográficos para o fim, com a equipe no Brasil | Resolução CMN 5.298 e Nota Técnica 2958 (FATO, 2026); 27 sites bloqueados, entre eles plataformas on-chain (FATO SECUNDÁRIO, abr/2026) | Bloqueio por endereço de internet desde o primeiro dia, com a lista decidida com advogado | Fundador e advogado | 15.2 |
| OBJ-18 | Sem país e sem pessoa jurídica | Sem jurisdição não há venda de token, tesouraria nem termos de uso | Parecer curto antes de gastar com construção; jurisdição antes da venda do token B | Fundador e advogado | 15.9 |
| OBJ-19 | Uma pessoa só domina o programa, sem acordo nem prazo | Licença MIT em nome do sócio; 11 dos 16 registros de alteração são dele (FATO) | Acordo de sócios; respostas escritas; multisig com os dois; segundo desenvolvedor orçado | Fundador e sócio técnico | 13.3 |
| OBJ-20 | Sem identificação nenhuma, o cofre e o patrocinador desconhecido encostam em deveres legais citados | A Lei 9.613 lista "captação de apostas com pagamento de prêmios" entre as atividades obrigadas a identificar clientes (FATO, trecho) | Adotar a definição do setor; identificar o patrocinador perante a equipe | Fundador e advogado | 15.8 |
| OBJ-25 | Se o serviço agendado falha, um SIM verdadeiro vira NÃO para sempre | Regra do programa: meta cumprida e não provada até o prazo é gravada como NÃO (FATO) | Dois agendadores, botão público, recompensa, alarme e plantão; resultado "Anulada"; plano de indenização | Sócio técnico; plantão sem dono | 4.7 e 11.5 |
| OBJ-26 | Programa novo, sem auditoria, com mais de dez sistemas novos, com dinheiro real | O repositório se descreve como protótipo de hackathon, sem auditoria (FATO) | Cinco fases, rede principal na quinta, tetos, multisig e auditoria como condição | Fundador e sócio técnico | 12.1 |
| R-01 | A chave de atualização pode esvaziar todos os cofres | Hoje os roteiros usam uma carteira em arquivo; quem tem a chave: não encontrado | Multisig 2 de 3 com trava de tempo; compilação verificável | Fundador e sócio técnico; terceira chave sem dono | 11.4 |
| R-02 | O apostador vale pouco e custa caro para trazer | US$ 9 para a operação em seis meses (INFERÊNCIA, premissa sem dado), contra custos de aquisição de US$ 77 a US$ 2.500 em cripto (FATO SECUNDÁRIO, 2021 a 2023) | Aquisição paga perto de zero; medir quantas carteiras voltam sem prêmio | Fundador | Capítulo 9 |
| R-03 | Capital sem fonte garantida; a venda privada é circular | A venda precisa acontecer antes do volume e o preço só se justifica depois dele | Lançar no nível 1 de custo com capital dos sócios; marcos antes de cada gasto | Fundador | Capítulo 9 |

#### Altos (24)

| Código | Risco | Evidência | Mitigação proposta | Dono proposto | Seção |
|---|---|---|---|---|---|
| OBJ-06 | Num pote puro não existe ganho para realizar antes do fim | Uma aposta de 100 "vale" 97 antes e depois de o lado ficar mais provável (INFERÊNCIA) | Saída só com devolução e penalidade; o ganho fica para a venda da posição a outra pessoa, numa fase posterior | Fundador | 3.6 |
| OBJ-07 | Taxa fixa de 3% sobre o pote castiga quem aposta no favorito | Com 90% do pote no lado vencedor a taxa leva 30% do ganho; com 97%, quem acerta recebe o que pôs (INFERÊNCIA) | Taxa igual ao menor entre 3% do pote e 10% do lado perdedor | Fundador | 7.2 |
| OBJ-08 | A taxa no pote de um lado só pune o primeiro apostador | A referência dos 3%, o PancakeSwap, devolve 100% na rodada cancelada (FATO) | Cobrança reduzida, ou zero no lançamento; tabela completa dos casos | Fundador | 3.4 |
| OBJ-10 | 25% da taxa bruta para Bitcoin, antes de qualquer custo | Tether, Block e Méliuz usam lucro ou caixa excedente; a Metaplanet estava 38% abaixo do custo em jun/2026 (FATO SECUNDÁRIO) | Acumular em USDC até o gatilho; compra mensal em data fixa; regra de venda escrita | Fundador | 7.6 |
| OBJ-11 | A recompra é pequena perto dos desbloqueios | A Jupiter gastou mais de US$ 70 mi, cobriu cerca de 6% dos desbloqueios e o token caiu 89% do pico (FATO SECUNDÁRIO, jan/2026) | Recompra só depois do equilíbrio; desbloqueios desenhados pelo tamanho da recompra; nenhuma promessa de preço | Fundador | 8.5 |
| OBJ-12 | O "dividendo" não tem fonte na divisão da taxa e é a palavra que os reguladores citam | A divisão em quatro parcelas de 25% não tem parcela de repasse | Tirar a palavra do plano, ou dizer de qual fatia sai e levar ao advogado | Fundador e advogado | 8.6 |
| OBJ-13 | Token no pump.fun "para pumpar", lançado primeiro | Tokens de mercados de previsão: LMTS −94%, PNP −93%, UMA −99% (FATO SECUNDÁRIO, out/2026) | Produto primeiro; token A sem promessa; token B depois de volume real e de parecer | Fundador | 8.7 |
| OBJ-15 | Faixas de patrocínio sem vitrine e sem precedente pago | No programa parecido da Polymarket a mediana é de US$ 3 por dia por mercado (FATO SECUNDÁRIO, set/2026) | Três a cinco cartas de intenção antes de construir o fluxo | Fundador | 7.4 |
| OBJ-16 | O fundo de prêmios só se paga se causar um quarto de todo o volume | Opinion, Myriad e Limitless perderam de 80% a 96% do volume quando o incentivo acabou (FATO SECUNDÁRIO, 2026) | Três sinais medidos por trimestre; critério de corte escrito antes | Fundador | 7.5 |
| OBJ-21 | O mínimo de 24 horas trava as perguntas curtas; as longas não cabem no MVP | Concorrentes operam preço de cripto em 5 minutos a 1 semana | Séries curtas aprovadas uma vez por duas chaves; perguntas de até 30 dias no MVP | Fundador | 3.5 e 12.4 |
| OBJ-22 | "Sem limite de compra" colide com a necessidade de teto de pote | Completar uma curva do pump.fun nos últimos 10% custa 2,16 SOL (FATO, documento do sócio) | Teto por pergunta e teto total no período inicial | Fundador e sócio técnico | 3.3 |
| OBJ-23 | Cloak e SODAX integrados põem código de terceiros na página de aposta; o Cloak não esconde valor grande | O cofre de USDC do Cloak tinha cerca de 2.560 USDC (FATO SECUNDÁRIO) [A confirmar, AC-10] | Orientação em vez de integração; "pagador não divulgado" | Fundador | 3.9 e 11.7 |
| OBJ-24 | Preço de token pequeno pode ser movido e devolvido na mesma transação | Numa pool de 100 SOL, dobrar o preço custa cerca de 0,21 SOL em taxas (INFERÊNCIA) | Três degraus: preço pela Pyth; média no tempo com liquidez travada e teto; rede de oráculos | Fundador e sócio técnico | 4.4 |
| R-04 | Custos que vêm antes da receita | US$ 30 a 75 mil antes do primeiro dólar de taxa (INFERÊNCIA) [A confirmar, AC-09] | Orçamento de pré-lançamento com três cotações de auditoria | Fundador | Capítulo 9 |
| R-05 | O pote não gira o dinheiro | No World, cada dólar girou cerca de 90 vezes no mês (INFERÊNCIA sobre FATO SECUNDÁRIO, set/2026); no pote, uma vez por pergunta | Perguntas curtas primeiro | Fundador | Capítulo 9 |
| R-06 | Forçar o SIM pagando | Compensa sempre que o pote do NÃO for maior que o custo de forçar | Teto de pote abaixo do custo de forçar, medido na criação | Sócio técnico | 3.3 e 11.8 |
| R-07 | Aposta de última hora dilui quem arriscou cedo | 5.000 no lado quase certo rendem 290,91 quase sem risco (INFERÊNCIA) | Fechamento; prazos em data e hora | Sócio técnico | 3.5 e 11.3 |
| R-08 | Casos do pote de um lado só sem regra | Com prêmio neutro e penalidades, há quatro casos sem definição | Escrever a tabela inteira antes de programar | Fundador | 3.4 |
| R-09 | A conta lida deixa de poder ser lida | Programas de terceiros podem mudar de formato | Resultado "Anulada"; recusar tokens cujo registro pode ser fechado | Sócio técnico | 11.3 |
| R-10 | Perguntas de preço: aposta entre o toque e a prova | O preço só existe na rede quando alguém publica | Preço fresco em toda aposta; só ativos grandes; saída desligada | Sócio técnico | 4.4 e 11.8 |
| R-11 | O site como elo mais fraco | Uma conta de hospedagem, de domínio ou do GitHub tomada serve transação maliciosa | Segundo fator com chave física; nenhum código de terceiros na página de aposta | Sócio técnico | 11.7 |
| R-12 | Acesso à rede pelo navegador | O endereço público tem limite; uma chave paga no navegador é pública | Repasse pelo servidor, com limite; histórico em servidor | Sócio técnico | 11.7 |
| R-16 | Não há fonte de perguntas toda semana | Fatos irreversíveis são raros; só três dos oito exemplos têm leitor pronto | Séries recorrentes geradas por regra; meta de cardápio com responsável | Fundador; moderação sem dono | 13.4 |
| R-19 | Capacidade de construir | Poucas pessoas de Rust; o ambiente atual não compila nem roda testes; auditor sem agenda | Máquina de compilação ou integração contínua; contratar a revisão no sprint 7 | Fundador e sócio técnico | 13.4 |

#### Médios (7)

| Código | Risco | Evidência | Mitigação proposta | Dono proposto | Seção |
|---|---|---|---|---|---|
| OBJ-14 | 30% de cada compra, como taxa permanente do token, destrói o comprador | Quem paga 1.000 fica com 703 de valor e, se revender, com 490 (INFERÊNCIA) | 30% do que a venda privada arrecadar, sem taxa no token | Fundador | 8.4 |
| OBJ-27 | "Sem oráculo", "anônimo" e "ninguém controla" prometem o que o produto não entrega | Preço exige a Pyth; a equipe abre perguntas, pausa e atualiza o código | "Resultado verificável on-chain"; "pagador não divulgado"; publicar quem pode o quê | Fundador | 4.8 |
| R-13 | A equipe como parte informada (crítico se combinado com a OBJ-02) | Ela vê os pedidos de patrocínio antes do público e opera o serviço de resolução | A equipe não aposta; carteiras publicadas; nenhuma pergunta sobre o token da casa | Fundador | 13.5 |
| R-14 | O USDC pode ser congelado pelo emissor | Dinheiro vindo de serviço de privacidade aumenta a exposição (INFERÊNCIA, a conferir, AC-16) | Cofre por pergunta; cofre de taxas esvaziado com frequência | Sócio técnico | 11.3 |
| R-15 | O diferencial pode ser copiado | O World já tem o encanamento automático | Chegar primeiro e ter comunidade | Fundador | Capítulo 6 |
| R-17 | Mercado de vendas de token fraco | 37 vendas e US$ 58 mi no segundo trimestre de 2026, no mundo (FATO SECUNDÁRIO, set/2026) | Meta de arrecadação modesta; nenhum custo fixo apoiado na venda | Fundador | Capítulo 8 |
| R-18 | Sem plano de incidente | Não há quem pausa, quem fala e onde se publica | Uma página, antes da rede principal | Fundador e sócio técnico | 13.5 |

#### Baixos (2)

| Código | Risco | Evidência | Mitigação proposta | Dono proposto | Seção |
|---|---|---|---|---|---|
| OBJ-28 | O nome: "baked" tem a gíria de "chapado" e "baked in" quer dizer "já decidido de antemão" | A pesquisa de nome registrava a gíria e o código `BAKED` em uso por terceiros; nenhuma base de marcas foi consultada | Manter o nome e usar a leitura a favor; só funciona se a OBJ-02 for resolvida | Fundador | 3.10 |
| OBJ-29 | Uma fonte barata de capital e de validação está sendo deixada passar | O prazo do hackathon Colosseum é 12/out/2026; valores de prêmio não conferidos [A confirmar, AC-27] | Reconsiderar a submissão do que já existe | Fundador | 9.6 |

### 14.3 Os riscos críticos

**1. Demanda (OBJ-01).** É a pergunta que este plano não responde, e tudo o mais a supõe. A pesquisa não achou, em
nenhuma plataforma, um mercado aberto sobre queima, renúncia, trava ou formatura de tokens de terceiros (FATO,
ausência em busca limitada, out/2026). O mais perto disso são mercados sobre o token do pump.fun na Polymarket, que
somaram cerca de US$ 262,81 mil no total (FATO SECUNDÁRIO, fonte fraca, sem data). Não houve nenhuma entrevista. A
ausência pode significar que ninguém tentou ou que ninguém quer; só um teste distingue as duas coisas.

**2. Integridade: quem controla o resultado aposta (OBJ-02, OBJ-03, R-13).** Em quatro dos nove tipos de pergunta
que o programa já lê, uma pessoa decide o resultado sem gastar nada: basta assinar, ou não assinar, uma renúncia.
No exemplo da revisão técnica, o dono da chave aposta 3.000, age depois do fechamento e lucra 3.305 sem risco; no
exemplo da revisão de conformidade, o patrocinador anônimo põe 5.000 no NÃO, não cumpre a meta e lucra 658 sobre
quem apostou no SIM (INFERÊNCIA nos dois). Somada à equipe, que vê os pedidos antes do público, a combinação é a
que os dois líderes do setor proíbem por escrito. Um mercado em que o público acredita que alguém joga com as
cartas marcadas não tem segundo mês.

**3. Dinheiro do usuário (OBJ-04, OBJ-05, OBJ-25, OBJ-26, R-01).** São cinco caminhos pelos quais um usuário perde
dinheiro sem ter errado a previsão. A saída antecipada, sem precedente de mercado, tem um furo que rende 304,50 a
quem monta o golpe com duas carteiras, e numa fuga em massa deixa para quem ficou de cerca de um terço a 63% do
prêmio. A resolução, se o serviço falha, grava NÃO para um SIM verdadeiro, sem volta. O programa é novo, sem
auditoria, num repositório que se descreve como protótipo. E a chave que pode trocar o código, e com isso esvaziar
todos os cofres, hoje vive num arquivo, com dono não identificado.

**4. Finanças (OBJ-09, R-02, R-03).** O número que organiza as finanças não é 3%, é 0,64%: de cada US$ 100
apostados, US$ 0,64 paga a operação, ou US$ 0,75 se ninguém sair antes (INFERÊNCIA, modelo financeiro; as premissas
de saída não têm dado). Com isso, o volume de equilíbrio é de US$ 471 mil, 1,57 milhão ou 3,92 milhões apostados
por mês, conforme o nível de custo. Um apostador que ponha US$ 200 por mês durante seis meses deixa US$ 9 para a
operação (INFERÊNCIA, premissa sem dado). O capital necessário, com reserva, vai de US$ 70 a 110 mil nos cenários
razoável e otimista e de US$ 125 a 136 mil no ruim, dos quais US$ 51,5 mil antes do lançamento; o cenário ruim não
se paga em nenhum regime (INFERÊNCIA). A fonte desse capital não está definida, e a venda privada do token não a
resolve: ela teria de acontecer antes do volume que justificaria o preço. Os números completos estão no capítulo
9.

**5. Regulação e pessoas (OBJ-17, OBJ-18, OBJ-20, OBJ-19).** Três objeções tratam de onde a empresa existe, de quem
ela deixa entrar e de quem ela conhece: ver capítulo 15. A quarta trata de quem constrói: uma pessoa só domina o
programa, sem acordo escrito (seção 13.3).

### 14.4 Os riscos altos

São 24. Agrupados pelo que ameaçam:

- **A conta do apostador (OBJ-06, OBJ-07, OBJ-08, R-07, R-08).** A promessa de "ganho proporcional menor" na saída
  não existe num pote puro. A taxa fixa sobre o pote inteiro pesa pouco em potes equilibrados e muito no favorito:
  com 90% do pote no lado vencedor, leva 30% do ganho. No pote de um lado só, a taxa cai sobre o primeiro
  apostador, que é quem o lançamento mais precisa. A aposta de última hora dilui quem arriscou cedo. E a tabela dos
  casos de um lado só ainda tem quatro linhas sem regra.
- **O destino da taxa (OBJ-10, OBJ-11, OBJ-16).** Bitcoin comprado com receita bruta, recompra menor que os
  desbloqueios e fundo de prêmios sem retorno medido por nenhuma plataforma. Os três têm precedentes que foram mal.
- **A segunda e a terceira trilhas (OBJ-12, OBJ-13, OBJ-15).** Patrocínio a preço de vitrine sem vitrine; um token
  apresentado com as palavras que corroem a confiança de uma casa de apostas; e um "dividendo" sem fonte.
- **O cardápio e os prazos (OBJ-21, OBJ-22, OBJ-24, R-06, R-10, R-16).** As perguntas curtas, que são o que o
  público aposta, esbarram no mínimo de 24 horas. Toda pergunta precisa de teto de pote. O preço de token pequeno
  pode ser movido por um instante. E falta assunto para abrir perguntas toda semana.
- **A infraestrutura (OBJ-23, R-09, R-11, R-12).** Código de terceiros na página em que a carteira assina; contas
  lidas que podem mudar de formato; o site como elo mais fraco; e o acesso à rede feito pelo navegador.
- **O caixa e a capacidade (R-04, R-05, R-19).** De US$ 30 a 75 mil saem antes do primeiro dólar de taxa. O pote
  usa cada dólar uma vez por pergunta, enquanto um concorrente gira o mesmo dólar cerca de 90 vezes por mês. E a
  equipe que constrói é pequena, num ambiente que hoje não compila.

### 14.5 O que continua de pé

A revisão crítica fechou com a lista do que resistiu ao ataque. Ela é parte do quadro de riscos tanto quanto as
objeções:

1. A leitura direta da rede é real e única entre os cinco concorrentes analisados.
2. O código de resolução é o ativo mais sólido: nove leitores, resolução aberta a qualquer um, trava automática das
   apostas quando o fato acontece e teste aleatório de invariantes.
3. O pote não quebra: não precisa de formador de mercado e o cofre nunca fica devendo.
4. A equipe abrir as perguntas é o que fazem a Polymarket e o World; quem abriu a criação para qualquer um não
   mostrou que isso traz volume.
5. USDC, sem rendimento do pote e sem tokens de SIM e NÃO: as três escolhas simplificam o programa e a explicação.
6. Os 3% estão dentro da faixa do setor em potes equilibrados.
7. Prêmio dentro do pote é algo que nenhum site de anúncio vende.
8. Dar o segundo token a quem segura o primeiro, sem conversão, tem um precedente que funcionou.
9. A janela existe, se a demanda existir: o rival mais parecido ainda não lançou com dinheiro real (FATO
   SECUNDÁRIO) [A confirmar, AC-04].

## 15. Regulação e conformidade

### 15.1 Aviso

Este capítulo não é parecer jurídico. Ele descreve o que cada norma ou caso diz, com a fonte, e marca o que é ponto
para advogado. Não afirma que algo é permitido, legal ou ilegal. Os graus de exposição que aparecem aqui são
INFERÊNCIA do agente de conformidade, não opinião jurídica. As normas foram lidas em 4 de outubro de 2026; o que
foi lido no texto integral está marcado FATO, e o que veio da imprensa ou de escritórios, FATO SECUNDÁRIO.

Duas decisões do fundador organizam o capítulo. **Decisão.** O acesso é "100% onchain da solana, via wallet, sem
kyc". **Decisão.** Os bloqueios geográficos ficam para o fim: "deixar para fazermos a implementação dos bloqueios
ao final"; e, sobre bloquear o Brasil e os Estados Unidos: "Por enquanto não, e ainda não sabemos." **KYC** é a
sigla em inglês para a identificação do usuário: a conferência de quem ele é, com documento.

#### Mapa de exposição

Cada linha liga uma decisão a uma regra ou a um caso que a toca. A coluna "Exposição" é INFERÊNCIA.

| Nº | Decisão do fundador | Regra ou caso que a toca | Exposição | Pergunta para o advogado |
|---|---|---|---|---|
| 1 | Mercado de previsão em pote, com dinheiro real | Nota Técnica 2958; Medida Provisória 1.394 [A confirmar, AC-01]; Decreto-Lei 3.688, art. 50 | Alta | O pote é aposta de quota fixa, jogo de azar, loteria não autorizada, derivativo ou nenhum deles? |
| 2 | Perguntas sobre fatos on-chain de cripto | Resolução CMN 5.298: "qualquer outra temática", "a critério" da CVM | Alta | Queima, renúncia e liquidez travada são "referencial econômico-financeiro"? Cabe consulta à CVM? |
| 3 | Perguntas de preço por oráculo | Resolução CMN 5.298; declaração da ESMA de 3/7/2026; acordo da CFTC de 2022 | Alta | Pergunta de preço de token é derivativo no Brasil e opção binária na Europa? |
| 4 | Só carteira, sem identificação | Lei 9.613, art. 9º; Nota Técnica 2958; autoridade francesa de jogos | Alta | A empresa é pessoa obrigada? Que identificação mínima é exigida, e de quem? |
| 5 | O cofre do programa guarda USDC e a equipe controla a atualização | Lei 14.478, arts. 2º e 5º; Resolução BCB 520 | Alta | Isso é "custódia ou administração" em nome de terceiros? Precisa de autorização? |
| 6 | Equipe brasileira | Resolução CMN 5.298; Medida Provisória 1.394 [A confirmar, AC-01]; Resolução BCB 520; caso Polymarket | Alta | Empresa no exterior com sócios e desenvolvedores residentes no Brasil: qual é o risco pessoal? |
| 7 | Bloqueio geográfico adiado | Bloqueio dos 27 sites; autoridade francesa; CFTC 2022; termos dos concorrentes | Alta | Quais países bloquear no primeiro dia? O Brasil entra? |
| 8 | Patrocinador anônimo | Lei 9.613, art. 9º; ordem judicial do caso Storm; regras de integridade dos líderes | Alta | A empresa pode receber de um pagador que ela mesma não conhece? |
| 9 | O patrocinador aposta; quem controla o resultado não é impedido | Regras da Polymarket e da Kalshi; Código Penal, art. 171-A | Alta | Que regra mínima de conflito afasta a responsabilidade da plataforma? |
| 10 | Pagamento pelo Cloak | Caso Tornado Cash; Lei 9.613 | Média | Em que condições aceitar fundos vindos de ferramenta de privacidade? |
| 11 | Token A no pump.fun, "para pumpar" | Declaração da SEC sobre meme coins; termos do pump.fun [A confirmar, AC-12] | Média | Que comunicação a equipe pode fazer sobre o token A? Pode negociar o próprio token? |
| 12 | Token B em venda privada | Parecer de Orientação CVM 40; MiCA, art. 4º | Alta | Com que contrato, a quem e em que países se pode vender? |
| 13 | 25% da taxa em recompra e queima do token B | Perguntas e respostas da SEC, pergunta 2.5 | Alta | Anunciar a recompra antes de o produto funcionar é promessa de retorno? |
| 14 | "Dividendo aos holders" | SEC contra DeFi Money Market; Parecer de Orientação CVM 40 | Alta | Existe forma de repasse que não torne o token valor mobiliário? |
| 15 | 25% da taxa em tesouraria de Bitcoin | Nenhuma regra específica encontrada | Baixa | Tratamento contábil e tributário, conforme a sede |
| 16 | Saída antecipada com penalidade | Nota Técnica 2958: equivale ao "cash out" | Média | A saída aproxima o pote da aposta descrita na Nota? |
| 17 | Página do X e publicação de patrocínios | Medida Provisória 1.394 [A confirmar, AC-01]; autoridade francesa (multa de 100 mil euros) | Média | A divulgação das chances a público brasileiro ou francês é publicidade vedada? |
| 18 | Pote de um lado só devolve cobrando taxa | Código de Defesa do Consumidor, por força da Lei 14.478, art. 13 | Baixa | Cobrar taxa numa pergunta sem contraparte exige aviso prévio destacado? |

Fonte: relatório de conformidade, seção 7, condensado.

### 15.2 Brasil

Seis textos tocam o produto. O que cada um diz:

**Resolução CMN nº 5.298, de 24/4/2026, em vigor desde 4/5/2026** (FATO, texto integral, Banco Central). Veda a
oferta e a negociação, no país, de derivativos sobre evento esportivo, jogos on-line e evento político, eleitoral,
social, cultural, de entretenimento "ou de qualquer outra temática que, a critério da Comissão de Valores
Mobiliários, não seja representativa de referencial econômico-financeiro". Vale também para derivativos negociados
no exterior e ofertados aqui. Nenhuma norma posterior da CVM definindo "referencial econômico-financeiro" foi
encontrada até 4/10/2026 [A confirmar, AC-02].

**Nota Técnica SEI nº 2958/2026/MF, de 23/4/2026** (FATO, texto integral, Ministério da Fazenda). Afirma que as
plataformas de mercado de previsão "exploram ilicitamente a modalidade lotérica de aposta de quota fixa" e sugere o
bloqueio. Diz que basta "prêmio previamente determinável". Aponta a falta de identificação de usuários como risco.
Trata a saída antes do fim como equivalente ao "cash out" das casas de aposta.

**O bloqueio de abril de 2026.** A Anatel notificou cerca de 19 mil prestadoras de internet a pedido da Fazenda, em
24/4/2026 (FATO, Anatel). A imprensa listou 27 sites, entre eles Polymarket e Kalshi e duas plataformas on-chain,
Hedgehog Markets e Predict.fun (FATO SECUNDÁRIO, Exame e Folha). Ser on-chain e sem cadastro não tirou ninguém da
lista.

**Medida Provisória nº 1.394, de 25/9/2026.** Segundo a leitura do agente de conformidade, a MP 1.394, de
25/9/2026, proíbe em todo o país a exploração, a oferta, a intermediação e a publicidade de loterias de aposta de
quota fixa, inclusive por agente no exterior que as ofereça a pessoa no Brasil; revoga quase toda a Lei 14.790; e
prevê, para provedores de aplicações, multa de até 10% do faturamento ou R$ 50 milhões por infração **[A
confirmar, AC-01: texto e vigência a conferir no Planalto e com advogado]**. A medida não foi verificada pelo
agente principal, e a tramitação no Congresso não foi conferida. Uma medida provisória depende de conversão em lei.
Se o texto se confirmar, deixa de existir no Brasil o caminho de obter licença de aposta.

**Lei 14.478/2022 e Resoluções BCB 519, 520 e 521** (FATO, a lei; FATO SECUNDÁRIO, prazo e capital). A lei diz que
prestadora de serviços de ativos virtuais só funciona com autorização, e inclui entre esses serviços a "custódia ou
administração de ativos virtuais" em nome de terceiros. Os pedidos de autorização iriam até 30/10/2026, com capital
mínimo de R$ 10,8 a 37,2 milhões [A confirmar na norma, AC-13]. A mesma lei criou o art. 171-A do Código Penal,
"Fraude com a utilização de ativos virtuais", com reclusão de 4 a 8 anos (FATO).

**Lei 9.613/1998, art. 9º** (FATO, trecho). Lista entre as pessoas obrigadas a identificar clientes as sociedades
com "sistemáticas de captação de apostas com pagamento de prêmios" e as prestadoras de serviços de ativos virtuais.
Os arts. 10 e 11, que trazem os deveres, não foram relidos.

**A dúvida central, sem concluir.** O que distingue o pote é que ele não fixa o multiplicador na hora da aposta. No
exemplo da seção 3.3 (300 no SIM, 700 no NÃO), quem põe 1 USDC no SIM receberia 3,23; se depois entram mais 700 no
SIM, passa a receber 1,65. As leis citadas na Nota Técnica definem quota fixa pelo multiplicador definido no
momento da aposta. A mesma Nota, porém, fala em prêmio "determinável" e descreve a bolsa de apostas como aquela em
que o prêmio decorre "da ponderação entre os valores apostados pelos usuários". Há duas leituras, e as duas levam
ao advogado: se o pote for quota fixa, vale o que a Nota concluiu para Polymarket e Kalshi; se não for, sai de uma
definição e pode entrar em outra, como jogo de azar ou loteria não autorizada, em normas que não foram lidas [A
confirmar, AC-21]. Ninguém decidiu o caso do pote.

> **Objeção registrada OBJ-17 · severidade crítica**
> **Decisão do fundador:** "deixar para fazermos a implementação dos bloqueios ao final"; bloquear o Brasil e os
> Estados Unidos: "Por enquanto não, e ainda não sabemos."
> **O que a revisão crítica achou:** a equipe mora no país em que a regra contra o setor é a mais recente, e
> "adiado" não pode significar "depois da rede principal".
> **Evidência:** a Resolução CMN 5.298 e a Nota Técnica 2958 existem (FATO, textos integrais, abr/2026); 27 sites
> foram bloqueados, inclusive plataformas on-chain (FATO SECUNDÁRIO, abr/2026); a Polymarket põe o Brasil entre os
> países que só podem fechar posição (FATO, documentação, 3/out/2026).
> **Alternativa proposta:** bloqueio por endereço de internet no MVP, desde o primeiro dia com dinheiro real, com a
> lista de países decidida com advogado; nenhum material em português nem campanha no Brasil até o parecer.
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir. No roteiro, o bloqueio entra como
> interruptor na fase 5, que é o fim da construção (seção 12.1).

### 15.3 Estados Unidos

**O acordo da CFTC com a Polymarket, de 3/1/2022** (FATO, comunicado da agência). A CFTC é a agência americana
que regula derivativos. Multou a Polymarket em US$ 1,4 milhão por oferecer opções binárias de evento fora de uma
bolsa registrada, e escreveu que a regra vale "regardless of the technology used", isto é, qualquer que seja a
tecnologia usada. Um dos exemplos citados era uma pergunta de preço de cripto.

**Os estados** (FATO, páginas oficiais). Em 2026, Nevada, Illinois, Rhode Island, Connecticut, Missouri e Nova York
moveram ações ou emitiram ordens contra a Polymarket. Nevada incluiu a empresa do Panamá que opera a plataforma
internacional. Nova York a processou em 24/9/2026 por jogo ilegal sem licença.

Duas leituras do agente de conformidade sobre esses casos (INFERÊNCIA): a licença federal não protegeu a operação
americana da Polymarket da lei estadual de jogo; e quase todas as medidas estaduais miram contratos esportivos, que
o Baked Market não oferece. O que os casos têm em comum com o plano é ponto para advogado: uma pergunta de preço,
oferecida a pessoas nos Estados Unidos, por uma plataforma sem registro.

### 15.4 Europa

**França** (FATO, autoridade nacional de jogos, 16 e 17/7/2026). A autoridade mandou bloquear a Polymarket.
Registrou que o bloqueio geográfico que a plataforma já tinha "has been circumvented", isto é, foi contornado.
Citou a falta de identificação dos usuários. A publicidade de jogo não autorizado tem multa de 100 mil euros.
Outros países europeus bloquearam ou baniram mercados de previsão em 2025 e 2026, entre eles Bélgica, Polônia,
Portugal, Itália e Países Baixos (FATO SECUNDÁRIO).

**ESMA, a autoridade europeia de mercados, em 3/7/2026** (FATO, trechos). Declarou que o contrato de evento sobre
uma referência financeira é instrumento financeiro e cai na proibição de opções binárias ao varejo; os demais
podem ser aposta, conforme a lei de cada país. Consequência para o plano, sem concluir: as perguntas de preço têm
uma exposição própria, diferente da das perguntas sobre queima ou liquidez travada, que não aparecem em nenhuma
norma lida.

**MiCA, o regulamento europeu de criptoativos, art. 4º, em vigor desde 30/12/2024** (FATO). A oferta pública de um
criptoativo na União Europeia exige que o ofertante seja pessoa jurídica e publique um documento de informação. Há
isenção do documento para ofertas a menos de 150 pessoas por país, de até 1 milhão de euros em 12 meses ou só a
investidores qualificados. A isenção dispensa o documento, mas não dispensa ser pessoa jurídica. Só pesa se houver
comprador europeu de token.

### 15.5 Tokens

O desenho dos dois tokens está no capítulo 8. Aqui, só o que os reguladores escreveram (FATO, salvo indicação;
ponto para advogado em todas as linhas):

| Documento | O que diz |
|---|---|
| SEC, perguntas e respostas sobre criptoativos, pergunta 2.5 (publicada em 25/9/2026, alterada em 28/9/2026) | Anunciar recompra não é promessa de esforço gerencial quando o sistema é funcional e não tem parte central; pode ser, se o sistema não é funcional e a recompra é apresentada como rendimento. A página avisa que não tem força de lei |
| SEC, declaração sobre meme coins (27/2/2025) | Meme coin com uso limitado ou nenhum não envolve oferta de valor mobiliário; não vale para produto rotulado assim para fugir da lei [A confirmar, AC-12: lida por resumo] |
| SEC contra DeFi Money Market (6/8/2021) | Um token que prometia parte dos lucros foi tratado como contrato de investimento |
| CVM, Parecer de Orientação 40 (11/10/2022) | Contrato de investimento coletivo: expectativa de benefício econômico, esforço de terceiro, oferta pública |
| Termos do pump.fun (data não identificada) | Proíbem usar o token em captação, em repasse de receita e em "pump and dump" [A confirmar, AC-12: lidos por resumo] |
| Textos de venda do PUMP e do WLFI | "no dividend"; "no right to any return, dividend, airdrop or other distribution" (FATO SECUNDÁRIO e FATO) |

Os dois tokens, lado a lado (INFERÊNCIA, relatório de conformidade, seção 3.2):

| | Token A (pump.fun) | Token B (venda privada) |
|---|---|---|
| Quem vende | A curva do pump.fun; a equipe não recebe o dinheiro da compra | A empresa, a compradores escolhidos |
| O que o comprador espera | Nada prometido, se a comunicação for coerente | Queima custeada por 25% da taxa; o fundador falou em "dividendo" |
| De quem depende o valor | Em tese, da demanda | Do volume apostado, isto é, do trabalho da equipe |
| Texto que encosta | Declaração de meme coins; termos do pump.fun | Pergunta 2.5 da SEC; Parecer CVM 40; MiCA, art. 4º |
| Frase do fundador exposta | "vamos usar para pumpar mesmo" | "subir preço e entregar dividendo aos holders" |

Três observações do agente de conformidade (INFERÊNCIA):

1. A proteção descrita na pergunta 2.5 pede duas condições: sistema funcional e ausência de parte central. O Baked
   Market terá uma equipe que abre as perguntas, aciona a resolução, recebe a taxa e executa a recompra.
2. Ligar o token A ao produto, com desconto na taxa, voto em sugestões ou direito ao token B, afasta-o da descrição
   de token "com uso limitado ou nenhum". Sem ligação, ele não serve ao produto. É uma tensão do desenho.
3. A tesouraria de 25% em Bitcoin não apareceu em nenhuma regra lida. É assunto contábil e tributário.

As objeções sobre o "dividendo" e sobre a linguagem e a ordem dos tokens estão nas caixas OBJ-12 e OBJ-13, nas
seções 8.6 e 8.7.

### 15.6 Integridade de mercado

**Decisão.** Não há proibição de apostar para quem controla o resultado. Perguntado se quem coloca prêmio pode
apostar, o fundador respondeu: "Sim."

O que os dois líderes escreveram (FATO, páginas oficiais, 2026): a Polymarket e a Kalshi proíbem negociar a quem
pode influenciar o resultado. Na lista de condutas proibidas da Polymarket está "Trade if you can influence the
outcome". A Kalshi publicou um caso com a sanção aplicada: banimento de 5 anos e penalidade financeira de 10
vezes. A Nota Técnica 2958 trata a possibilidade de o apostador afetar o resultado como um defeito do setor (FATO).

A objeção e o exemplo numérico estão na caixa OBJ-02, na seção 3.7. As alternativas que a revisão de conformidade
propõe mudam a forma, não a decisão, e vão da mais leve à mais dura:

1. Anônimo para o público, identificado para a equipe: o selo mostra "Anônimo" e a equipe sabe quem é.
2. Declaração assinada pela carteira de que o patrocinador não controla a conta lida pela pergunta, com retenção do
   prêmio se a declaração for falsa.
3. Conferência automática na abertura: recusar a aposta de lado quando a carteira é a autoridade da conta lida. Não
   funciona se o dinheiro veio pelo Cloak, e isso precisa estar escrito.
4. Aviso na pergunta: "o patrocinador pode controlar o resultado e pode ter apostado".
5. Anônimo só com prêmio neutro. O fundador decidiu o contrário; é a opção coerente com as regras dos líderes.

Se a plataforma que aceita a pergunta, recebe o patrocínio e oculta o patrocinador entra na descrição do art. 171-A
do Código Penal é ponto para advogado.

### 15.7 Privacidade: o caso Tornado Cash e o Cloak

O Tornado Cash é um serviço de privacidade na rede Ethereum. O que aconteceu, em ordem (FATO, salvo indicação):

| Data | Fato |
|---|---|
| 26/11/2024 | Um tribunal federal americano decide que os contratos imutáveis do Tornado Cash não são "propriedade" de ninguém e, por isso, não podem ser sancionados |
| 21/3/2025 | O Tesouro americano retira a sanção [A confirmar, AC-12: comunicado lido por resumo] |
| 6/8/2025 | Roman Storm, um dos criadores, é condenado. O corpo do comunicado da condenação não foi lido, só o título |

O ponto que interessa ao plano está na ordem da juíza do caso Storm: a decisão sobre os contratos imutáveis não
afetava a acusação, porque o acusado controlava a interface e havia implantado uma triagem de sanções ineficaz.
**Triagem de sanções** é conferir se uma carteira está em lista de sanção antes de aceitar o dinheiro dela.

Três diferenças entre aquele caso e o plano, sem concluir (INFERÊNCIA do agente de conformidade): a proteção
reconhecida vale para código que ninguém controla, e o programa do Baked Market terá chave de atualização e uma
equipe que opera o site; uma triagem de fachada foi usada pela acusação, de modo que uma triagem malfeita pode
pesar contra quem a adota; e o Baked Market não seria o serviço de privacidade, e sim o destinatário de dinheiro
que passou por um.

**O que o Cloak diz fazer** (FATO, documentação do Cloak) [A confirmar, AC-12: lida por resumo]. Toda transação
passa por triagem contra listas de sanção e de alto risco, por um parceiro, antes de ser transmitida; a transação
marcada é bloqueada. O usuário tem uma chave de visualização que gera um relatório das próprias transações. O
relatório de auditoria ainda não foi publicado. A página não diz se a triagem é no depósito ou no saque. A triagem
confere listas, não identifica ninguém, e o resultado não chega ao Baked Market: o patrocinador continua
desconhecido para a equipe, salvo se entregar o relatório da chave de visualização. A proposta de conformidade é
aceitar patrocínio vindo do Cloak só com esse relatório entregue à equipe. Em que condições aceitar esses fundos é
ponto para advogado.

### 15.8 Sem identificação: o padrão do setor

**Decisão.** "100% onchain da solana, via wallet, sem kyc".

O que as plataformas que se apresentam como "sem KYC" fazem na prática (FATO, termos e documentação de cada uma,
lidos em trechos, out/2026):

| Plataforma | Países barrados | Meio | O que os termos dizem |
|---|---|---|---|
| Polymarket (internacional) | Bloqueio total de países sob sanção; uma lista de países que só podem fechar posição, entre eles Brasil, Estados Unidos, Reino Unido, França, Alemanha, Itália e Austrália | Endereço de internet, no site e na interface de programação | Proíbe uso de rede privada virtual; vale a localização física |
| Limitless | Acesso: países sob sanção. Negociação: Estados Unidos e outros | Aviso ao tentar negociar | Maioridade; fora das listas de sanção; a empresa pode exigir prova de idade e de identidade a qualquer momento |
| Myriad | 19 territórios, entre eles Estados Unidos, França, Singapura e Suíça | Declaração do usuário | Não ser residente de território proibido nem estar em lista de sanção |
| pump.fun | Lista de jurisdições proibidas (não extraída); sanções dos Estados Unidos, do Reino Unido, da União Europeia e das Nações Unidas | Não lido | Maioridade; proíbe rede privada virtual e identidades descartáveis |
| Unhedged | Estados Unidos, Reino Unido, França, Singapura, Austrália e outros | Bloqueio por endereço de internet | Identificação "a critério" da empresa ou quando a lei exigir |
| Kalshi | Opera com identificação completa | Cadastro | Barra políticos e pessoas ligadas ao resultado |

O que o quadro mostra (INFERÊNCIA do agente de conformidade):

1. Nenhuma plataforma sem identificação deixa de bloquear os Estados Unidos e os países sob sanção.
2. Todas guardam o direito de pedir identificação depois. No setor, "sem KYC" quer dizer "sem KYC na entrada".
3. O bloqueio por endereço de internet é o meio padrão e é contornável. A autoridade francesa bloqueou a Polymarket
   mesmo com ele.
4. Não foi achada plataforma comparável com equipe declaradamente brasileira.

> **Objeção registrada OBJ-20 · severidade crítica**
> **Decisão do fundador:** "100% onchain da solana, via wallet, sem kyc".
> **O que a revisão crítica achou:** sem identificação nenhuma, o cofre com dinheiro de terceiros e o patrocinador
> desconhecido encostam em deveres legais citados.
> **Evidência:** a Lei 9.613 lista as "sistemáticas de captação de apostas com pagamento de prêmios" entre as
> atividades obrigadas a identificar clientes (FATO, trecho do art. 9º); no setor, "sem KYC" quer dizer sem
> identificação na entrada, com bloqueio por endereço de internet, triagem de sanções e direito de pedir
> identificação depois (FATO, termos dos concorrentes, out/2026; a leitura é INFERÊNCIA).
> **Alternativa proposta:** adotar a definição do setor e identificar o patrocinador perante a equipe, mesmo com o
> selo "Anônimo" ao público.
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir. Se a lei citada se aplica ao Baked
> Market é ponto para advogado.

### 15.9 Estruturas que plataformas parecidas adotaram

**Decisão.** A jurisdição não é assunto agora: "esquece isso, não precisa para agora."

Sem recomendar nenhuma, estas são as estruturas encontradas (FATO SECUNDÁRIO, salvo indicação):

| Estrutura | Quem adotou | O que aconteceu |
|---|---|---|
| Empresa no exterior, sem licença, com bloqueio de países | Polymarket internacional e Limitless, ambas por empresas do Panamá | A Polymarket foi bloqueada por reguladores de jogo de vários países e incluída na ação de Nevada. A imprensa relata que a equipe trabalhava em Nova York |
| Bolsa regulada | Kalshi | Exige identificação. Não protegeu contra as ações dos estados americanos |
| Licença de jogo no exterior | BetDEX, bolsa de apostas em Solana, licenciada na Ilha de Man em 1/11/2022 (FATO, comunicado da empresa) | Aceita apostas só de países selecionados. A licença traz identificação e regras contra lavagem |
| Bloquear o país de origem | A Polymarket bloqueia os Estados Unidos na plataforma internacional | A equipe continuou no país |
| Fundação | Não encontrado exemplo em fonte primária | Informação faltante |

Custos de licença de jogo no exterior (FATO SECUNDÁRIO, fonte comercial, mai/2026): Ilha de Man, 5.250 libras de
pedido e 36.750 por ano; Curaçao, 4.592 euros de pedido e 47.450 por ano. A abertura de uma empresa no exterior
custa de US$ 1,5 a 6 mil, com manutenção de US$ 1 a 2,5 mil por ano (FATO SECUNDÁRIO, prestadores); a avaliação
jurídica do produto e dos termos, de US$ 5 a 15 mil, e o parecer jurídico do token, de US$ 15 a 50 mil (fonte
fraca) [A confirmar, AC-09: pedir cotações].

A leitura do agente de conformidade sobre o caso da Polymarket (INFERÊNCIA): onde as pessoas trabalham importa
tanto quanto o país do registro.

> **Objeção registrada OBJ-18 · severidade crítica**
> **Decisão do fundador:** a jurisdição "não precisa para agora".
> **O que a revisão crítica achou:** sem país e sem pessoa jurídica não há venda de token, tesouraria nem termos
> de uso; a jurisdição deixou de poder ser assunto para depois.
> **Evidência:** o caso da Polymarket mostra que onde as pessoas trabalham pesa tanto quanto o país do registro
> (FATO SECUNDÁRIO, imprensa, 2026); o art. 4º do MiCA exige pessoa jurídica de quem oferta um token na União
> Europeia (FATO); a venda privada não pode ser desenhada sem a jurisdição (INFERÊNCIA).
> **Alternativa proposta:** parecer curto de advogado brasileiro antes de gastar com construção; escolher a
> jurisdição antes de desenhar a venda do token B e a tesouraria.
> **Situação:** a decisão vale; a alternativa fica para o fundador decidir.

### 15.10 O que precisa existir antes da rede principal

"Prática" quer dizer adotado pelos concorrentes lidos. "Exigência citada" quer dizer que há texto legal lido que
toca o ponto; se ele se aplica ao Baked Market é ponto para advogado. Fonte: relatório de conformidade, seção 9
(INFERÊNCIA quanto à lista; FATO quanto aos textos citados).

| Nº | Item | Natureza |
|---|---|---|
| 1 | Parecer escrito de advogado brasileiro sobre as linhas 1 a 6 do mapa de exposição | Prática, e condição dos demais |
| 2 | Pessoa jurídica constituída, com sede definida | Exigência citada (MiCA, art. 4º); prática |
| 3 | Termos de uso: quem opera, lei aplicável, idade, países barrados, proibição de rede privada virtual, declaração sobre sanções, direito de pedir identificação depois | Prática; exigência citada (Código de Defesa do Consumidor) |
| 4 | Política de privacidade: carteira, endereço de internet, contas do X de quem sugere, registros de aprovação | Exigência citada (Lei 13.709, não relida) e regra do projeto |
| 5 | Bloqueio por endereço de internet dos países escolhidos, no site e na interface de programação | Prática; a autoridade francesa considerou insuficiente o bloqueio contornável |
| 6 | Triagem de carteiras contra listas de sanção antes de aceitar aposta ou patrocínio | Prática; uma triagem de fachada foi usada pela acusação no caso Storm |
| 7 | Regra de integridade: quem controla ou influencia o resultado não aposta, nem por terceiros; sanção escrita | Prática |
| 8 | Regra para a equipe: não aposta nas perguntas que abre nem negocia com informação interna | Prática |
| 9 | Identificação do patrocinador perante a equipe, mesmo com selo "Anônimo" ao público | Prática; exigência citada (Lei 9.613, art. 9º) |
| 10 | Avisos de risco na tela: o retorno só fica definido no fechamento; aposta grande reduz o retorno; pote de um lado só devolve com taxa; a saída tem penalidade; a resolução é final | Prática; exigência citada (Código de Defesa do Consumidor) |
| 11 | Aviso na pergunta patrocinada: quem pagou, se apostou, se pode controlar o resultado | Ausente nos concorrentes; decorre da seção 15.6 |
| 12 | Registro permanente das decisões da equipe: abertura, recusa, fechamento abaixo de 24 horas, quem aprovou | Decisão já tomada pelo fundador; prática |
| 13 | Divulgação de quem controla a atualização do programa e o cofre; auditoria | Prática |
| 14 | Política de comunicação: sem promessa de ganho, sem divulgar chances a países barrados | Exigência citada (lei francesa; Medida Provisória 1.394 [A confirmar, AC-01]) |
| 15 | Texto dos dois tokens revisado: sem "dividendo", sem promessa de preço; o que cada token não dá | Prática; exigência citada (MiCA) |
| 16 | Venda do token B só depois do produto no ar e do parecer | Decorre da pergunta 2.5 da SEC |
| 17 | Plano de resposta a ordem de bloqueio ou notificação: quem responde, como os usuários sacam | Prática; Connecticut exigiu permitir o saque |
| 18 | Verificação do prazo de 30/10/2026 para pedido de autorização de prestadora, se a linha 5 do mapa for "sim" | Exigência citada, com data de fonte secundária [A confirmar, AC-13] |

Alguns itens tocam decisões do fundador e têm caixa de objeção em outra seção: o 5 (OBJ-17, seção 15.2), o 7 e o 9
(OBJ-02, seção 3.7, e OBJ-20, seção 15.8), o 15 e o 16 (OBJ-12 e OBJ-13, seções 8.6 e 8.7). O item 8 é a regra da
casa proposta na seção 13.5. Os demais são documentos, avisos e rotinas, e não contrariam nenhuma decisão.

### 15.11 Perguntas para o advogado

Em ordem de urgência (relatório de conformidade, 4/out/2026):

1. O pote, operado por equipe residente no Brasil, é aposta de quota fixa, jogo de azar ou loteria não autorizada,
   derivativo, ou nenhum deles? Qual é o risco pessoal dos sócios e dos desenvolvedores, mesmo com empresa no
   exterior e Brasil bloqueado?
2. O cofre do programa, com a equipe controlando a atualização e cobrando taxa, faz da empresa prestadora de
   serviços de ativos virtuais ou pessoa obrigada pela lei de lavagem de dinheiro? Se sim, que identificação é
   exigida?
3. Patrocinador anônimo que controla o resultado e aposta: qual é a responsabilidade da plataforma e que regra
   mínima a afasta?
4. Token B com recompra custeada pela taxa e "dividendo": é valor mobiliário no Brasil, nos Estados Unidos e na
   Europa? A quem e como pode ser vendido? O token A cabe nos termos do pump.fun?
5. Que estrutura (país, tipo de entidade, licença ou nenhuma) e que lista de países barrados adotar antes da rede
   principal?
6. Perguntas de preço por oráculo: derivativo no Brasil, opção binária na Europa?
7. Cabe consulta formal à CVM sobre "referencial econômico-financeiro" para fatos on-chain?
8. A Medida Provisória 1.394 foi convertida, alterada ou perdeu eficácia? O que muda se cair?
9. A página do X e a divulgação de patrocínios são publicidade vedada em algum país-alvo?
10. Aceitar fundos vindos do Cloak cria dever adicional de diligência?

**O que não foi lido** [A confirmar, AC-21 e AC-12]: os arts. 10 e 11 da Lei 9.613; a Lei 13.709, de dados
pessoais; o art. 51 do Decreto-Lei 3.688; os Decretos-Lei 6.259 e 204; os arts. 6º, 7º, 13, 14 e 15 do MiCA e o
título sobre abuso de mercado; o Ofício 6/2026/CVM/SMI; o corpo do comunicado da condenação no caso Storm; os
termos de uso da Polymarket internacional e do PancakeSwap. Foram lidos só por resumo de um modelo auxiliar, e
precisam ser relidos antes de qualquer uso: os termos do pump.fun, a declaração da SEC sobre meme coins, o
comunicado do Tesouro americano de 21/3/2025 e as perguntas frequentes do Cloak.

## 16. Decisões em aberto e próximos passos

### 16.1 Decisões pendentes do fundador

São catorze, em ordem de urgência. Só o fundador pode tomá-las: as ondas de pesquisa levantaram as opções e os
números, mas escolher entre elas é decidir o produto. As quatro primeiras travam o início da construção, porque
viram erro de programa se ficarem para depois do primeiro sprint (seção 12.2).

| Nº | Decisão pendente | O que precisa ser respondido | Onde estão as opções |
|---|---|---|---|
| 1 | O "70/30" do patrocínio | Qual parte é da banca e qual é do pote; se a parte da banca vai inteira para a operação ou se divide em quatro; se o dinheiro do patrocinador dentro do pote paga os 3% | Seções 3.7 e 7.4 |
| 2 | Pote de um lado só | A tabela completa: para onde vão o prêmio neutro e as penalidades em cada caso, e o valor da taxa nesse caso | Seção 3.4 |
| 3 | Saída antecipada | Aceita que a saída não dê ganho, só devolução com penalidade? A penalidade é marcada por lado? A saída nasce desligada por pergunta? Cobra 3% sobre o valor devolvido? Uma parte da penalidade pode ir para a banca? | Seções 3.6 e 11.6 |
| 4 | Fechamento | A regra para perguntas longas e a duração máxima no MVP | Seções 3.5 e 12.4 |
| 5 | Cardápio do primeiro dia | Quais tipos abrem; perguntas decididas por uma chave ficam fora, ou entram com selo e teto; preço de token pequeno; aceitar a Pyth como "oráculo que resolve on-chain" | Seções 4.2, 4.4 e 4.5 |
| 6 | Patrocinador anônimo | Mantém a aposta de lado em qualquer pergunta? O patrocinador se identifica perante a equipe? | Seções 3.7 e 15.6 |
| 7 | Taxa | A regra de partida e o seu gatilho; a forma da taxa (teto pelo lado perdedor) | Seções 7.2 e 7.3 |
| 8 | Custos e capital | O nível de custo real; quanto os sócios põem e por quanto tempo; quando passam a receber; o critério de parada | Capítulo 9 e seção 13.1 |
| 9 | Tokens | "30% do arrecadado" no lugar de "30% de cada compra"? O "dividendo" sai do plano, ou de qual fatia vem? A função Holder Rewards do pump.fun fica ligada? Qual o momento do token A em relação ao produto? | Seções 8.4, 8.6, 8.7 e 12.5 |
| 10 | Bloqueio geográfico e jurisdição | Quais países, e se o Brasil entra; em que país fica a empresa | Seções 15.2, 15.8 e 15.9 |
| 11 | Chaves e regras da casa | Quem são as três chaves do multisig; quem atende o alarme; a equipe pode apostar; pode haver pergunta sobre o token da casa | Seções 11.4 e 13.5 |
| 12 | Resolução errada por falha do serviço | A empresa indeniza? Com que dinheiro? | Seções 4.7 e 11.5 |
| 13 | Teste de demanda e hackathon | Testar a demanda antes de reescrever o programa? Submeter ao hackathon o que já existe? | Seções 2.5 e 9.6 |
| 14 | Nome e criadores | "Baked Market" no singular; quem sugere ou cria uma pergunta ganha parte da taxa? | Seção 3.10 e capítulo 7 |

Sobre o item 14, o fundador já disse: "acho justo que quem criar possa ganhar uma parte da pergunta." Como hoje é
a equipe que cria, a regra fica em aberto até haver quem a receba.

### 16.2 Perguntas para o sócio técnico

As seis primeiras são as do briefing do modelo de pote, que seguem sem resposta registrada. As demais vieram da
revisão técnica.

1. O que do modelo de pote você considera errado ou perigoso, tecnicamente?
2. Faz sentido um programa novo ao lado do atual, ou uma versão 2 do mesmo?
3. Quanto custa dar suporte ao padrão Token-2022 nos leitores, já que você mapeou o formato? Quanto processamento
   custa percorrer as extensões desse padrão dentro de cada aposta?
4. Preço pela Pyth: você vê forma segura de ler num instante marcado? Aceita exigir preço fresco em toda aposta de
   pergunta de preço?
5. O que dos documentos de economia e de privacidade você quer manter?
6. Submetemos o modelo atual ao hackathon e seguimos com o pote depois?
7. Quem tem hoje a chave de atualização do programa? [A confirmar, AC-18]
8. Quanto tempo você tem, e para quais sprints?
9. Aceita o terceiro resultado, "Anulada"?
10. Aceita trocar os prazos de blocos por data e hora?
11. Em que termos o código atual pode ser reaproveitado? O acordo precisa estar escrito antes do sprint 2 (seção
    13.3).

#### Perguntas para o advogado

As dez perguntas para o advogado, em ordem de urgência, estão na seção 15.11. A primeira decide todas as outras: o
que é o pote, perante a lei, quando operado por uma equipe que mora no Brasil. Em seguida vêm o cofre e a
identificação, o patrocinador anônimo que aposta, os dois tokens, a estrutura e os países, as perguntas de preço, a
consulta à CVM, a situação da Medida Provisória 1.394, a publicidade e os fundos vindos do Cloak. A revisão de
conformidade propõe que essa consulta seja o primeiro gasto, antes da construção (seção 16.4, passo 3).

### 16.3 A confirmar

Vinte e oito pontos não puderam ser verificados. No texto, cada um aparece com a marca **[A confirmar]**.

| Código | Ponto | O que falta |
|---|---|---|
| AC-01 | Medida Provisória nº 1.394, de 25/9/2026 | Foi lida só pelo agente de conformidade; conferir texto e vigência no Planalto e com advogado; tramitação não conferida |
| AC-02 | Regulamentação da CVM para a Resolução 5.298 | Nenhuma norma encontrada até 4/10/2026; um ofício da CVM não foi lido |
| AC-03 | Preços de destaque pago | Tabelas do DexScreener, do CoinGecko, do CoinMarketCap e do DEXTools sem fonte oficial ou antigas |
| AC-04 | Dados do Melee | Beta sem dinheiro real vem de fio de usuário; taxa, data da rede principal e token não encontrados |
| AC-05 | Régua do DefiLlama | O método para a Kalshi não é declarado; a correção da contagem dupla da Polymarket não tem data confirmada |
| AC-06 | Projeção da Bernstein | O relatório original e o método não foram lidos; não fecha com o ritmo atual |
| AC-07 | O "70/30" | Qual parte é da banca; se ela se divide em quatro; se o dinheiro do patrocinador no pote paga os 3% |
| AC-08 | Aposta média, frequência e pessoas reais | Não há dado em nenhuma plataforma; é premissa sem dado em todo uso |
| AC-09 | Custos de auditoria, de empresa e de pareceres | Só faixas de blogs de fornecedores; pedir três cotações |
| AC-10 | Cloak e SODAX | Tamanho atual do cofre do Cloak; relatório de auditoria; se entregam a endereço de programa; se o SODAX paga comissão a quem integra |
| AC-11 | O Tuk Tuk não consegue acionar a resolução | Vem do documento de um concorrente; o código do Tuk Tuk não foi lido |
| AC-12 | Textos lidos só por resumo de modelo auxiliar | Termos do pump.fun; documentos da SEC na releitura; comunicado do Tesouro americano; perguntas frequentes do Cloak |
| AC-13 | Prestadoras de ativos virtuais | Prazo de 30/10/2026 e capital mínimo vêm de fonte secundária; conferir na norma |
| AC-14 | Números de audiência de fonte fraca | Usuários ativos da Phantom; carteiras mensais do pump.fun; usuários diários de Solana |
| AC-15 | Pyth | Lista dos 64 ativos com conta fixa; disponibilidade na rede de testes; taxa por atualização |
| AC-16 | Congelamento do USDC | A autoridade de congelamento do registro do USDC não foi lida |
| AC-17 | Limites técnicos | Limite do endereço público de acesso à rede; teto de processamento por conta por bloco |
| AC-18 | Chave de atualização do programa | Quem a tem hoje |
| AC-19 | Documento de design e nome | O documento de design ainda descreve a direção anterior; "Market" no singular sem resposta; nenhuma base de marcas consultada |
| AC-20 | Token A | Holder Rewards ligado ou não; se a carteira do fundo de prêmios pode ser uma conta de programa na divisão da taxa de criador |
| AC-21 | Leis não lidas | Arts. 10 e 11 da Lei 9.613; Lei 13.709; art. 51 do Decreto-Lei 3.688; Decretos-Lei 6.259 e 204; MiCA, arts. 6º, 7º, 13, 14 e 15 |
| AC-22 | Limitless | Causa do salto de maio e da queda até setembro de 2026 |
| AC-23 | Mercados de pump.fun na Polymarket | O total de US$ 262,81 mil vem de agregador, sem data |
| AC-24 | Volume de apostas e preço do Bitcoin | A hipótese de que caem juntos não foi verificada |
| AC-25 | Fórmula da saída | A simulação com apostadores estratégicos não foi feita; os parâmetros não têm referência |
| AC-26 | Tabela de taxas da Kalshi | A página oficial não abriu; a fórmula vem de fonte secundária |
| AC-27 | Hackathon Colosseum | Valores de prêmio e de aceleração não conferidos |
| AC-28 | PNP e outros | Outros programas do PNP não medidos; se PancakeSwap Prediction e Hyperliquid resolvem on-chain: não verificado |

### 16.4 Próximos passos, em ordem

1. Revisão deste plano pelo fundador e versão v0.0.2, com análise de impacto de cada mudança.
2. Decisões pendentes de regra (lista da seção 16.1), a começar pelo sentido do "70/30", pela tabela do pote de um
   lado só, pelo destino da penalidade e pelo cardápio do primeiro dia.
3. Consulta a advogado brasileiro com prática em cripto, antes de gastar com construção: enquadramento do pote,
   jurisdição, lista de países, patrocinador anônimo, tokens.
4. Acordo escrito com o sócio técnico, respostas às perguntas do briefing, prazo e dedicação; definição de quem
   guarda a chave de atualização e de quem é a terceira chave do multisig.
5. Teste de demanda: 10 a 15 conversas com o público-alvo, beta com pontuação e sem dinheiro, e três cartas de
   intenção de patrocinadores.
6. Três cotações de auditoria e orçamento de pré-lançamento.
7. Fase 1 do roteiro: o pote na rede de testes.

A ordem tem um motivo. Os passos 2 a 6 custam pouco e respondem às perguntas que mais pesam: se a regra fecha, se a
lei deixa, se quem constrói está junto, se alguém quer o produto e quanto custa protegê-lo. O passo 7 é o primeiro
que consome meses de trabalho. Fazer os seis primeiros antes dele é o que separa um plano de uma aposta.

## Anexo A. Glossário

Os termos estão em ordem alfabética, com uma definição e um exemplo. Os números dos exemplos são os do corpo do
plano, onde aparecem com etiqueta e fonte.

| Termo | Definição | Exemplo |
|---|---|---|
| Acesso à rede (RPC) | Serviço pago que deixa o site ler a blockchain e enviar transações | Helius, de US$ 49 a 999 por mês |
| Aposta | O valor que uma carteira põe num lado; fica registrado em nome dela, sem virar token | Ana põe 100 USDC no SIM |
| Aposta de patrocinador | O dinheiro do patrocinador entra num lado, como uma aposta grande, com selo | 3.500 no SIM: o SIM passa a pagar 1,378 e, se der SIM, o patrocinador recebe 4.824 |
| Auditoria | Revisão do programa por uma empresa de segurança independente, antes de receber dinheiro real | De US$ 15 a 45 mil, segundo blogs de auditores |
| Avaliação | Quanto vale o total de tokens ao preço da venda | Vender 15% por US$ 750 mil é uma avaliação de US$ 5 milhões |
| Banca | A empresa que opera a plataforma e recebe a taxa | "A banca nunca perde" é a frase do fundador para a taxa no pote de um lado só |
| Bloqueio geográfico | Impedir o acesso de certos países ao site, em geral pelo endereço de internet | A Polymarket deixa o Brasil só fechar posição |
| Carteira | Aplicativo que guarda as chaves do usuário e assina as transações; é a única "conta" do usuário no Baked Market | Phantom |
| Carteiras múltiplas | Sem identificação, uma pessoa abre quantas carteiras quiser; regra "por carteira" não segura ninguém | Um limite de 100 USDC por carteira se contorna com dez carteiras |
| Chance | A fatia do pote que está em cada lado, mostrada na tela; não é preço nem probabilidade garantida | 300 no SIM de um pote de 1.000: a tela mostra SIM 30% |
| Chave de atualização | A carteira que pode trocar o código do programa; quem a tem pode esvaziar todos os cofres | Deve ficar num multisig |
| Cloak | Serviço de privacidade em Solana que esconde quem pagou a quem | O patrocinador saca para uma carteira nova e patrocina com ela |
| Cofre | A conta de USDC de uma pergunta, que pertence ao programa; só ele assina a saída de dinheiro | Um cofre por pergunta |
| Colheita de prêmio | Apostar nos dois lados só para levar o prêmio neutro, sem opinião sobre a pergunta | Pote vazio com 100 de prêmio: quem põe 1 em cada lado recebe 98,94 |
| Compilação verificável | Prova pública de que o código que roda na rede é o do repositório | Qualquer pessoa confere com uma ferramenta |
| Contrapartida | O que o patrocinador recebe em troca: selo, destaque, posição fixa, texto na pergunta, publicação no X | Selo "Patrocinado por X" e 72 horas de destaque na página inicial |
| Curva de ligação (bonding curve) | Fórmula em que o preço sobe conforme entra dinheiro; quem entra cedo paga menos | No pump.fun, 793,1 milhões de tokens são vendidos pela curva |
| Desbloqueio | Tokens que saem da trava e podem ser vendidos | 1,53% da oferta por mês |
| Dinheiro travado | O total parado dentro dos potes ou de um protocolo num dado momento | O World tinha US$ 170,8 mil travados |
| Dólares pagos | Jeito de medir volume somando o que foi desembolsado; é o comparável com um pote | 100 contratos comprados a US$ 0,27 dão 27 de dólares pagos |
| Empréstimo relâmpago | Empréstimo tomado e devolvido dentro da mesma transação; serve para mover um número por um instante | Comprar com 41 SOL emprestados, dobrar o preço de uma pool pequena, resolver e devolver |
| Época | O "dia" da Solana para contas de stake; dura cerca de dois dias | "O JitoSOL começa a época 850 com 15 milhões de SOL?" |
| Fechamento | O momento em que as apostas param, antes da data final, para ninguém entrar já sabendo o resultado | Pergunta de 30 dias fecha no dia 24 (80% da duração) |
| Formador de mercado automático (AMM) | Um contrato com uma fórmula faz o papel da contraparte; sempre há preço, mas ele piora em compras grandes | A Limitless usa um, com taxa de 0,40% |
| Formatura (no pump.fun) | O momento em que um token vende toda a curva inicial e passa a ser negociado numa pool comum | Só 0,26% dos tokens se formavam em junho de 2026 |
| Fundo de prêmios | Reserva da banca, alimentada por 25% da taxa, para pôr prêmio nos potes e dar ao primeiro apostador um motivo para entrar | Com US$ 1 milhão apostado no mês, o fundo recebe US$ 7.500 |
| Giro | Quantas vezes o mesmo dólar é apostado num período; no pote, o dólar entra uma vez por pergunta | No World, cada dólar girou cerca de 90 vezes no mês |
| Identificação (KYC) | Conferência de quem é o usuário, com documento | A Kalshi exige; o Baked Market, por decisão, não |
| Lado | Cada uma das duas respostas possíveis, SIM ou NÃO | Com 300 no SIM e 700 no NÃO, o lado do NÃO é o maior |
| Leitor on-chain | Parte do programa que abre uma conta da Solana, lê um número ou uma chave e responde sim ou não, sem ninguém informar nada | O leitor de queima lê a oferta do token e compara com a meta |
| Linha dos 3,09% | Tamanho do prêmio, em relação às apostas, a partir do qual os apostadores, somados, deixam de perder para a taxa | Num pote de 10.000, um prêmio acima de 309 |
| Liquidez travada | Dinheiro posto numa pool de negociação e travado para sempre, para o token sempre poder ser trocado | 100 SOL travados na pool T/SOL da Meteora |
| Livro de ordens | Lista de ofertas de compra e de venda; compra-se de outra pessoa, a um preço conhecido | 100 ações SIM a US$ 0,60 custam 60; se der SIM, viram 100 |
| Média no tempo | Em vez do preço de um instante, a média do preço durante um período; resiste a picos | Um pico de 15 segundos move 3,9% uma média de 30 minutos |
| Mercado de previsão | Lugar em que pessoas apostam dinheiro no resultado de uma pergunta sobre o futuro | "O SOL toca US$ 300 até 31 de dezembro?": quem acha que sim aposta no SIM |
| Multisig | Carteira que só assina quando várias pessoas aprovam | 2 de 3: duas de três pessoas precisam assinar |
| Nível de custo | Três tamanhos de operação: 1, ninguém recebe (US$ 3.000 por mês); 2, equipe enxuta (US$ 10.000); 3, número do sócio (US$ 25.000) | O plano de partida é o nível 1 |
| On-chain | Gravado na blockchain, onde qualquer pessoa pode conferir | A oferta total de um token é um número on-chain |
| Oráculo | Serviço que traz para dentro da blockchain um dado de fora dela | A Pyth publica o preço do Bitcoin assinado por corretoras |
| Oráculo com votação (UMA) | Alguém propõe o resultado deixando uma caução; se contestado, detentores de um token votam | Na Polymarket: caução de cerca de US$ 750, 2 horas para contestar |
| Patrocinador | Quem paga uma das três faixas (US$ 500, 1.500 ou 5.000) para pôr dinheiro numa pergunta e receber contrapartidas | Um projeto paga US$ 1.500 numa pergunta sobre a própria queima |
| Pausa | Poder da equipe de parar apostas novas numa emergência, sem bloquear resgates | Um defeito é descoberto: a equipe pausa as apostas |
| Pedido de pergunta | O patrocinador pede uma pergunta e deixa o pagamento travado; a equipe aceita ou recusa, e a recusa devolve tudo | Depósito de US$ 1.500 travado até a análise |
| Penalidade | A parte da aposta que quem sai deixa para trás | Ana pôs 100 e sai cedo: 22,28 ficam no pote |
| Pergunta | Uma frase com resposta SIM ou NÃO, uma data final e uma regra de como se decide | "A oferta do token T cai para 900 milhões até o dia 30?" |
| Pergunta anulada | Terceiro resultado proposto, além de SIM e NÃO: a pergunta não pôde ser decidida e as apostas voltam | A conta que seria lida deixou de existir depois do prazo |
| Pergunta de "toque" | Pergunta de preço que dá SIM se o preço encostar no alvo em qualquer momento do prazo | "O BTC toca US$ 80.000 até o dia 30?" |
| Ponto de equilíbrio | O volume apostado por mês em que a parte da taxa que vai para a operação paga o custo | Com custo de US$ 3.000: US$ 471 mil por mês |
| Pote (pool) | O cofre de uma pergunta: todas as apostas entram nele e, no fim, quem acertou divide o que sobrou depois da taxa | 300 USDC no SIM e 700 no NÃO formam um pote de 1.000 |
| Pote de um lado só | Pergunta em que só um lado recebeu apostas; não há perdedor para pagar o vencedor | Ana põe 100 no SIM, ninguém entra no NÃO: ela recebe 97 |
| Prêmio neutro | Dinheiro somado ao pote sem escolher lado; aumenta o retorno de quem acertar, qualquer que seja o resultado | US$ 350 de prêmio num pote de 10.000 fazem o SIM pagar 1,673 em vez de 1,617 |
| Programa | O código que roda na Solana e guarda o dinheiro dos potes | O programa de pote do Baked Market |
| pump.fun | Plataforma de Solana em que qualquer pessoa lança um token em minutos, vendido por uma curva de preço | O token A será lançado lá |
| Pyth | Rede de oráculos de preço em que corretoras e formadores de mercado publicam preços assinados, que o programa confere | "O SOL toca US$ X?" se decide com um preço assinado da Pyth |
| Queima | Destruir tokens para sempre, reduzindo a oferta | Um projeto queima 10% da oferta do próprio token |
| Recompra e queima | A empresa usa parte da receita para comprar o próprio token no mercado e destruí-lo, reduzindo a oferta | 25% da taxa: com US$ 1 milhão apostado no mês, US$ 7.500 |
| Rede principal (mainnet) e rede de testes (devnet) | A rede em que o dinheiro é real e a rede de ensaio, com dinheiro de mentira | O programa atual só existe na rede de testes |
| Regime (a) e regime (b) | (a): a taxa se divide em quatro desde o primeiro dia. (b): regra de partida, em que Bitcoin e recompra esperam em USDC e cobrem o déficit até a operação se pagar | No cenário razoável, o (a) chega ao azul no mês 8 e o (b), no mês 6 |
| Renúncia de autoridade | O dono de uma chave abre mão, para sempre, do poder de criar tokens novos, de congelar carteiras ou de alterar um programa | O time renuncia à emissão: ninguém mais cria tokens novos |
| Resgate | O ato de o vencedor retirar a sua parte depois da resolução | Ana tinha 100 no SIM, deu SIM: ela resgata 323 |
| Resolução | O ato de gravar o resultado da pergunta, de forma definitiva | Qualquer pessoa aperta "Resolver"; o programa lê a rede e grava SIM |
| Retorno | Quanto cada 1 USDC apostado recebe se o lado ganhar; só fica definido quando as apostas fecham | No pote de 300 e 700, o SIM recebe 3,23 por 1 e o NÃO, 1,39 |
| Saída antecipada | Desistir da aposta antes da resolução e receber parte do dinheiro de volta | Ana pôs 100, sai cedo e recebe 77,72 |
| Selo | Marca visível na pergunta dizendo quem patrocinou, ou "Anônimo" | "Patrocinado por Projeto T" |
| Sentido A e sentido B do "70/30" | As duas leituras da frase do fundador. A: 70% do patrocínio para a banca, 30% para o pote. B: o contrário | Faixa de US$ 500: no A, 150 vão ao pote; no B, 350 |
| Serviço agendado (cron) | Programa de computador que acorda de tempos em tempos e faz uma tarefa sozinho; aqui, chamar a resolução | A cada minuto o serviço confere se alguma pergunta já pode ser resolvida |
| SODAX | Serviço que traz dinheiro de outras blockchains e entrega USDC na carteira em Solana | Quem tem dinheiro na rede Base chega com USDC em Solana, pagando 0,1% |
| Solana | A blockchain em que o produto roda | As apostas são transações na Solana |
| Taxa | A parte do pote que fica com a banca: 3% | Pote de 1.000: 30 de taxa, 970 para os vencedores |
| Taxa efetiva | Quanto a plataforma arrecada dividido pelo que os usuários pagaram | Polymarket: 2,0% em setembro de 2026 |
| Tesouraria em Bitcoin | Reserva da empresa guardada em Bitcoin | 25% da taxa convertidos em Bitcoin todo mês |
| Teto de pote | Valor máximo que uma pergunta aceita, fixado na criação, para o prêmio nunca valer mais que o custo de forçar o resultado | Pergunta de queima com teto de 5.000 USDC |
| Token A | O token do Baked Market lançado no pump.fun; especulativo, sem direito a receita | Decisão do fundador: "é expeculativo" |
| Token B | O token do Baked Market desenhado pela empresa e vendido em venda privada | É o que recebe a recompra e queima |
| Token-2022 | O segundo programa de tokens da Solana, com funções extras embutidas no próprio token; é o padrão dos tokens novos do pump.fun | Um token desse padrão pode cobrar taxa em cada transferência |
| Trava de tempo | Espera obrigatória entre aprovar e executar uma mudança, para o público ver antes | Mudança de taxa só vale 48 horas depois de aprovada |
| Trava e liberação gradual | Contrato que segura tokens e os solta num calendário | Equipe: 18 meses parado e 30 de liberação |
| Triagem de sanções | Conferir se uma carteira está em lista de sanção antes de aceitar o dinheiro dela | O Cloak diz fazer isso antes de cada transação |
| USDC | Moeda digital que vale 1 dólar, emitida pela Circle | Apostar 100 USDC é apostar 100 dólares |
| Valor de face | Jeito de medir volume somando cada contrato a US$ 1 | 100 contratos comprados a US$ 0,27 dão valor de face de 100 |
| Venda privada ("ICO privado") | Venda de tokens a compradores escolhidos, por contrato, antes de o token estar no mercado, com trava | Vender 15% da oferta a um grupo de compradores |

## Anexo B. Fontes

Este plano não fez pesquisa própria na internet: todos os números vêm dos arquivos abaixo, lidos em 4 de outubro
de 2026. Os endereços das fontes externas estão na seção "Fontes" de cada arquivo.

**Decisões e plano**

| Arquivo | O que cobre |
|---|---|
| `docs/business/ideacao-perguntas-e-respostas.md` | As cinco rodadas de perguntas e respostas do fundador. É a fonte da verdade do produto |
| `docs/business/BRIEFING-MERCADO-DE-POTE.md` | O briefing do modelo de pote para o sócio técnico. É anterior à quinta rodada e está superado em três pontos: saída, divisão da taxa e rendimento do pote |
| `docs/business/_review/plano-das-ondas.md` | O plano das três ondas de pesquisa e as regras de etiqueta dos números |
| `docs/business/_review/wave-3-coordinator.md` | A ficha de consistência: decisões, contradições resolvidas, números canônicos, objeções e roteiro deste plano |

**Onda 1: pesquisa**

| Arquivo | O que cobre |
|---|---|
| `knowledge-base/competitors/competitor-longlist.md` | A lista de vinte concorrentes |
| `knowledge-base/competitors/top-5-competitor-analysis.md` | A análise dos cinco principais e as duas réguas de volume |
| `knowledge-base/market/market-research.md` | Tamanho do mercado e projeções |
| `knowledge-base/market/publico-web3.md` | O público web3 e o pump.fun em números |
| `knowledge-base/market/regulacao.md` | Regulação, por imprensa e escritórios; corrigida pelo relatório de conformidade |
| `knowledge-base/market/monetizacao-e-tesouraria.md` | Formas de receita, patrocínio, fundo de prêmios, tesouraria em Bitcoin e recompra |
| `knowledge-base/market/dois-tokens-e-ico-privado.md` | O desenho dos dois tokens e a venda privada |
| `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md` | Saída antecipada, fechamento das apostas, serviço agendado e tipos de pergunta |

**Onda 2: revisão crítica**

| Arquivo | O que cobre |
|---|---|
| `docs/business/_review/wave-2-devils-advocate.md` | As premissas frágeis do plano e o que continua de pé |
| `docs/business/_review/wave-2-business-finance.md` | Os furos do modelo de negócio, custos e capital |
| `docs/business/_review/wave-2-technical-security.md` | Manipulação do pote, saída, resolução, chaves, contas, privacidade, site e os trinta requisitos |
| `docs/business/_review/wave-2-compliance.md` | Normas e casos no Brasil, nos Estados Unidos e na Europa; mapa de exposição; perguntas para o advogado |
| `docs/business/_review/wave-2-modelo-financeiro.md` | Os três cenários, os dois regimes, o equilíbrio, o capital e as sensibilidades |
| `docs/business/_review/wave-2-viabilidade-mvp.md` | O inventário do código, as cinco fases, os doze sprints e os papéis |

**Apoio**

| Arquivo | O que cobre |
|---|---|
| `knowledge-base/market/receita-mercados-de-previsao.md` | Como os mercados de previsão ganham dinheiro, com as taxas de cada um |
| `knowledge-base/market/patrocinio-e-destaque-pago.md` | Preços de destaque pago e programas de patrocínio |
| `knowledge-base/market/modelos-de-token.md` | Modelos de token e as regras do pump.fun |
| `knowledge-base/tecnologia/privacidade-entre-redes-e-x.md` | Cloak, SODAX e a integração com o X |
| `knowledge-base/pesquisa-nome-do-site.md` | A pesquisa do nome |
| `knowledge-base/referencias/` | Documentação da Polymarket e da Kalshi |
| `LICENSE` | A licença do código |

Não entraram neste plano: `knowledge-base/market/rendimento-do-pote.md`, porque o assunto foi abandonado pelo
fundador; `knowledge-base/competitors/mercados-de-previsao-web3.md`, substituído pelas pesquisas de concorrentes da
Onda 1; e os documentos do sócio técnico sobre economia, tipos de pergunta e privacidade, que ainda não estão no
ramo principal do repositório e foram citados pelo que os relatórios das ondas trouxeram deles.

## Anexo C. Índice das objeções registradas

Vinte e nove objeções: doze críticas, treze altas, duas médias e duas baixas. A caixa de cada uma, com a evidência
e a alternativa, está na seção indicada.

| Código | Decisão atacada | Objeção, em uma frase | Severidade | Seção da caixa |
|---|---|---|---|---|
| OBJ-01 | Apostas em fatos on-chain para o público web3 | Ninguém demonstrou que esse público quer apostar nisso | Crítica | 2.5 |
| OBJ-02 | Patrocinador anônimo escolhe qualquer forma; quem controla o resultado pode apostar | É a combinação que os líderes do setor proíbem | Crítica | 3.7 |
| OBJ-03 | Tipos de pergunta em aberto | Perguntas decididas de graça por uma chave são opção gratuita para o dono da chave | Crítica | 4.2 |
| OBJ-04 | Saída antecipada no MVP | A peça mais nova e perigosa não deve nascer ligada em todas as perguntas | Crítica | 3.6 |
| OBJ-05 | "Uma penalidade pro pote" | A penalidade volta para quem domina o lado vencedor | Crítica | 11.6 |
| OBJ-06 | "Ganho proporcional menor" na saída | Num pote puro não existe ganho para realizar antes do fim | Alta | 3.6 |
| OBJ-07 | Taxa de 3% do pote | A taxa fixa sobre o pote inteiro castiga quem aposta no favorito | Alta | 7.2 |
| OBJ-08 | Pote de um lado só devolve cobrando taxa | A taxa pune o primeiro apostador | Alta | 3.4 |
| OBJ-09 | Divisão da taxa em quatro | Sobra 0,64% do volume para pagar a operação | Crítica | 7.3 |
| OBJ-10 | 25% para tesouraria em Bitcoin | A base é a taxa bruta, antes de qualquer custo | Alta | 7.6 |
| OBJ-11 | 25% para recompra e queima do token B | A recompra é pequena perto dos desbloqueios | Alta | 8.5 |
| OBJ-12 | "Subir preço e entregar dividendo aos holders" | O "dividendo" não tem fonte e é a palavra que os reguladores citam | Alta | 8.6 |
| OBJ-13 | Token no pump.fun "para pumpar", lançado primeiro | A linguagem e a ordem corroem a confiança que uma casa de apostas vende | Alta | 8.7 |
| OBJ-14 | 30% de cada compra do token para as pools | Como taxa permanente, 30% destrói o comprador | Média | 8.4 |
| OBJ-15 | Faixas de 500, 1.500 e 5.000 | É preço de vitrine, sem vitrine e sem precedente pago | Alta | 7.4 |
| OBJ-16 | 25% para o fundo de prêmios | O fundo só se paga se causar um quarto de todo o volume | Alta | 7.5 |
| OBJ-17 | Bloqueios geográficos para o fim | A equipe mora no país em que a regra contra o setor é a mais recente | Crítica | 15.2 |
| OBJ-18 | Jurisdição "não é assunto agora" | Sem país e sem pessoa jurídica não há venda de token, tesouraria nem termos de uso | Crítica | 15.9 |
| OBJ-19 | Divisão com o sócio "por enquanto é irrelevante" | Uma pessoa só domina o programa, sem acordo nem prazo | Crítica | 13.3 |
| OBJ-20 | "Sem kyc" | Sem identificação nenhuma, o cofre e o patrocinador desconhecido encostam em deveres legais citados | Crítica | 15.8 |
| OBJ-21 | Fechamento em 80% com mínimo de 24 horas; perguntas longas | O mínimo de 24 horas trava as perguntas curtas; as longas não cabem no MVP | Alta | 3.5 |
| OBJ-22 | "Sem limite de compra" | Toda pergunta precisa de teto de pote | Alta | 3.3 |
| OBJ-23 | Cloak e SODAX | Integrados, põem código de terceiros na página de aposta; o Cloak não esconde um patrocínio grande | Alta | 3.9 |
| OBJ-24 | Preço de token pequeno como pergunta | O preço lido num instante pode ser movido e devolvido na mesma transação | Alta | 4.4 |
| OBJ-25 | Resolução acionada por serviço agendado da plataforma | Se o serviço falha, um SIM verdadeiro vira NÃO, para sempre | Crítica | 4.7 |
| OBJ-26 | Dinheiro real na rede principal, com o escopo do MVP | É um programa novo, sem auditoria, com mais de dez sistemas novos | Crítica | 12.1 |
| OBJ-27 | Como se fala do produto | "Sem oráculo", "anônimo" e "ninguém controla" prometem o que o produto não entrega | Média | 4.8 |
| OBJ-28 | O nome Baked Market | "Baked" tem a gíria de "chapado" e "baked in" quer dizer "já decidido de antemão" | Baixa | 3.10 |
| OBJ-29 | Hackathon "não precisa para agora" | Uma fonte barata de capital e de validação está sendo deixada passar | Baixa | 9.6 |
