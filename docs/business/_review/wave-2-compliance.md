# Onda 2, agente 2D: conformidade

Data: 4 de outubro de 2026.

**Isto não é parecer jurídico.** O relatório mostra o que as regras e os casos dizem, com a fonte, onde o plano fica
exposto e o que levar a um advogado. Não digo o que a lei permite. Os graus de exposição são INFERÊNCIA minha.

Legenda: **FATO** = li o texto na fonte oficial (regulador, diário oficial, tribunal, documento da própria empresa).
**FATO SEC.** = imprensa, escritório de advocacia, agregador. **INFERÊNCIA** = raciocínio meu. "Não encontrado" = procurei
e não achei. Severidade: **crítica** (pode derrubar o negócio ou expor a equipe pessoalmente), **alta**, **média**,
**baixa**.

Limite do método. Três tipos de leitura, e marco qual foi usado em cada fonte na lista final: (a) texto integral
devolvido pela ferramenta; (b) trechos devolvidos pela busca; (c) resumo feito por modelo auxiliar. O tipo (c) precisa
de releitura humana antes de ir para o Business Plan.

## Resumo em dez linhas

1. A Resolução CMN 5.298 e a Nota Técnica 2958 existem e dizem o que o relatório anterior dizia. Li as duas na fonte.
2. **Novo e não estava em nenhum arquivo:** a Medida Provisória 1.394, de 25/9/2026, proibiu a aposta de quota fixa em
   todo o país e revogou quase toda a Lei 14.790. O caminho "tirar licença de bet no Brasil" deixou de existir.
3. O pote não fixa o multiplicador na hora da aposta. A lei define quota fixa pelo multiplicador. A Nota Técnica, porém,
   fala em prêmio "determinável" e descarta os argumentos de formato. Ninguém decidiu o caso do pote: ponto para advogado.
4. A lista dos 27 sites bloqueados inclui plataformas cripto on-chain (Hedgehog Markets, Predict.fun). Ser on-chain e
   sem cadastro não tirou ninguém da lista.
5. **Novo:** a autoridade europeia de mercados (ESMA) declarou em 3/7/2026 que contrato de evento sobre referência
   financeira é opção binária, proibida ao varejo na União Europeia. Toca as perguntas de preço por oráculo.
6. Polymarket e Kalshi proíbem por escrito negociar quem pode influenciar o resultado. O plano permite e ainda esconde.
7. No caso Tornado Cash, o código imutável foi protegido; quem controlava interface, taxas e triagem foi condenado.
8. Token B (venda privada, recompra paga pela taxa, "dividendo") encosta nos testes da SEC e da CVM. Os termos do
   pump.fun, segundo a leitura feita, proíbem usar o token para captação, repasse de receita e "pump and dump".
9. Não achei nenhuma norma da CVM, posterior a abril, definindo "referencial econômico-financeiro".
10. As três exposições mais graves: equipe no Brasil operando pote com dinheiro real; patrocinador anônimo que controla o
    resultado e aposta; token B com promessa de retorno.

## 1. Brasil: o que conferi na fonte oficial

### 1.1 Resolução CMN nº 5.298, de 24/4/2026 (FATO, texto integral, site do Banco Central)

Publicada no Diário Oficial de 27/4/2026, seção 1, página 36. Aprovada na sessão de 23/4/2026 (Voto 19/2026-CMN).

- **Art. 3º:** "Ficam vedadas a oferta e a negociação, no país, de contratos derivativos cujos ativos subjacentes estejam
  relacionados a: I - evento real de temática esportiva [...]; II - evento virtual de jogos on-line [...]; e III - evento
  real ou virtual de natureza política, eleitoral, social, cultural, de entretenimento ou de qualquer outra temática que,
  a critério da Comissão de Valores Mobiliários, não seja representativa de referencial econômico-financeiro."
- **Parágrafo único** (o que conta como referencial econômico-financeiro): "I - os índices de preços ou taxas, os índices
  de valores mobiliários, os índices de títulos, as taxas de juros, as taxas de câmbio, classificação ou índice relativos
  a risco de crédito; II - os preços de mercadorias (commodities), de ativos financeiros e de valores mobiliários
  negociados em mercados organizados de bolsa e de balcão ou registrados e depositados em infraestruturas do mercado
  financeiro autorizadas a funcionar pelo Banco Central do Brasil ou pela Comissão de Valores Mobiliários; e III - outros
  referenciais relacionados a variáveis de interesse econômico ou financeiro relevante, que sejam apurados com base em
  preços ou metodologias consistentes e passíveis de verificação."
- **Art. 4º:** as vedações "se aplicam às ofertas em território nacional de derivativos negociados no exterior, conforme
  regulamentação da Comissão de Valores Mobiliários".
- **Art. 5º:** a CVM adotará "as medidas necessárias à regulamentação complementar". **Art. 6º:** vigência em 4/5/2026.

O que o texto deixa em aberto para o nosso caso (INFERÊNCIA, sem concluir):

- A norma fala de "contratos derivativos". Se um registro de aposta num pote é contrato derivativo, o texto não diz.
- "Queima de token", "renúncia de autoridade" e "liquidez travada" não aparecem na lista. Cairiam em "qualquer outra
  temática", cujo enquadramento fica "a critério da CVM".
- Preço de token por oráculo: o inciso II fala de ativos negociados em mercados organizados **autorizados** pelo Banco
  Central ou pela CVM. O inciso III abre para "variáveis de interesse econômico ou financeiro relevante".

**Severidade: crítica.** Ponto para advogado.

### 1.2 O que a CVM publicou depois

**Não encontrado.** Duas buscas (página de legislação da CVM e imprensa jurídica de maio a outubro de 2026) não
devolveram resolução, consulta pública nem ofício circular regulamentando a 5.298. O que achei:

- A Nota Técnica 2958 cita o **Ofício nº 6/2026/CVM/SMI**, resposta da CVM à Fazenda. Não li o ofício. A Nota resume: a
  CVM "informa que, até o momento, encontra-se registrados e admitidos à negociação, em mercados organizados, somente
  contratos de eventos estruturados cujos subjacentes referem-se ao resultado de variáveis como taxas de juros, índices
  de preços, taxas de câmbio e outros indicadores financeiros" (FATO, citação dentro de documento oficial).
- Escritórios registram que a regra complementar ainda viria (FATO SEC.: Lefosse, 27/4/2026; Bocater, 6/5/2026).

Informação faltante: pedir ao advogado a conferência em gov.br/cvm e o texto do Ofício 6/2026.

### 1.3 Nota Técnica SEI nº 2958/2026/MF (FATO, texto integral, gov.br/fazenda)

Existe. Processo 19995.001912/2026-19, documento SEI 60754019, assinada em 23/4/2026 pela Secretária de Prêmios e
Apostas. Assunto: "Exploração ilegal de apostas de quota fixa por fornecedores dos denominados Mercados de Previsão".

O que ela diz, com o número do parágrafo:

- **§9:** a Lei 14.790 define aposta como "ato por meio do qual se coloca determinado valor em risco na expectativa de
  obtenção de um prêmio" e quota fixa como "fator de multiplicação do valor apostado que define o montante a ser recebido
  pelo apostador, em caso de premiação, para cada unidade de moeda nacional apostada".
- **§12:** o enquadramento "não decorre da nomenclatura adotada pelos agentes econômicos, mas da verificação de seus
  elementos estruturais".
- **§18:** os três elementos: "(i) a existência de um evento futuro; (ii) a assunção de risco pelo usuário, mediante
  dispêndio financeiro; e (iii) a expectativa de obtenção de prêmio previamente determinável, calculado com base em uma
  quota/fator multiplicador".
- **§27 e §28:** o formato entre usuários não afasta o enquadramento; a Portaria 1.231 já prevê "bolsa de apostas".
- **§33 a §35:** o argumento central é que, comprada a posição, o usuário sabe quanto recebe ("irá ganhar U$ 1 dólar ...
  por posição comprada") e "é o multiplicador existente no momento da compra da posição ... que permanece sendo válido".
- **§39:** saída antes do fim equivale ao "cash out" já previsto para apostas.
- **§54 e §66:** em eventos não esportivos, "os próprios participantes ou agentes interessados podem influenciar direta
  ou indiretamente os resultados"; eles "podem ter o resultado afetado pelos próprios apostadores".
- **§60:** aponta como risco a "ausência de procedimentos robustos de identificação de usuários (KYC), monitoramento de
  transações, comunicação de operações suspeitas e rastreabilidade de fluxos financeiros".
- **§62:** a Lei 14.790, art. 26, impedia de apostar "atletas e outras pessoas que podem influenciar no resultado", e
  também cônjuges e parentes até o segundo grau.
- **§72:** a Procuradoria da Fazenda entende que a Secretaria tem poder de polícia mesmo quando o objeto é evento não
  autorizado ("eventos políticos, sociais, econômicos, culturais, etc.").
- **§73 (recomendação):** as plataformas "que ofertam contratos de eventos reais de temáticas esportivas e outras
  temáticas diversas de econômico financeiras exploram ilicitamente a modalidade lotérica de aposta de quota fixa,
  sugerindo-se que seu acesso por brasileiros seja bloqueado".

Correções ao relatório anterior (`regulacao.md`):

- A lista dos sites **não está na Nota Técnica**. A Agência Nacional de Telecomunicações confirma o bloqueio em notícia
  oficial de 24/4/2026: notificou "19 mil prestadoras" a pedido da Fazenda (FATO). A lista nominal dos 27 saiu na imprensa
  (FATO SEC.: Exame e Folha, 24/4/2026): PredictIt, Palpita, Cravei, Previsao, Véspera, Palpitano, Prévias, Predict
  (predict.fun), ProphetX, Robinhood, OG, Fanatics Markets, Novig, **Hedgehog Markets**, IBKR ForecastTrader, Voxfi,
  Futuriza, Eu Já Sabia, MercadoPred, Palpitada, Pliks, PolySwipe, PRED Exchange, Ruckus, Stride, Polymarket e Kalshi.
- Hedgehog Markets é mercado de previsão on-chain em Solana e Predict.fun é cripto. INFERÊNCIA: ser on-chain, só com
  carteira, não impediu a inclusão.

**Severidade: crítica.**

### 1.4 O pote é "aposta de quota fixa"? O texto, sem concluir

O que distingue o pote. Com 300 USDC no SIM e 700 no NÃO e taxa de 3%, quem põe 1 USDC no SIM recebe 3,23 se nada
mudar. Se depois entrarem mais 700 no SIM, o pote vai a 1.700, sobram 1.649, e cada 1 USDC do SIM passa a receber
1,65. O multiplicador só existe quando as apostas fecham.

Textos que tocam o ponto:

| Texto | O que diz | Fonte |
|---|---|---|
| Lei 13.756/2018, art. 29, §1º | quota fixa é o sistema "em que é definido, no momento de efetivação da aposta, quanto o apostador pode ganhar" | FATO, transcrito na Nota 2958, §7 |
| Lei 14.790/2023, art. 2º | quota fixa é o "fator de multiplicação do valor apostado que define o montante a ser recebido" | FATO, transcrito na Nota 2958, §9 |
| MP 1.394/2026, art. 3º, I | aposta de quota fixa é o "ato por meio do qual se coloca determinado valor em risco na expectativa de obtenção de prêmio cujo montante é definido por fator de multiplicação" | FATO, Planalto |
| Nota 2958, §18 | basta "prêmio previamente determinável" | FATO |
| Nota 2958, tabela 01 | na bolsa de apostas, a "premiação da aposta decorre da ponderação entre os valores apostados pelos usuários" | FATO |
| Decreto-Lei 3.688/1941, art. 50, §3º | jogo de azar é "a) o jogo em que o ganho e a perda dependem exclusiva ou principalmente da sorte; b) as apostas sobre corrida de cavalos fora de hipódromo ...; c) as apostas sobre qualquer outra competição esportiva" | FATO, Planalto (trecho) |
| Decreto-Lei 3.688/1941, art. 50, §2º | multa "de R$ 2.000,00 ... a R$ 200.000,00" para "quem é encontrado a participar do jogo, ainda que pela internet ou por qualquer outro meio de comunicação, como ponteiro ou apostador" | FATO, Planalto (trecho) |

Duas leituras possíveis, e as duas levam ao advogado (INFERÊNCIA):

- Se o pote **é** quota fixa: vale o que a Nota 2958 concluiu para Polymarket e Kalshi.
- Se o pote **não é** quota fixa: sai de uma definição e pode entrar em outra (jogo de azar, loteria não autorizada).
  Não li o art. 51 do Decreto-Lei 3.688, o Decreto-Lei 6.259/1944 nem o Decreto-Lei 204/1967.

**Severidade: crítica.**

### 1.5 Medida Provisória nº 1.394, de 25/9/2026 (FATO, texto integral, Planalto) — novo

Não está em nenhum arquivo do projeto. Publicada em edição extra do Diário Oficial de 25/9/2026, nove dias antes
deste relatório.

- **Art. 1º:** "Ficam proibidas, no território nacional, a exploração, a oferta, a intermediação e a publicidade de
  loterias de aposta de quota fixa, em meio físico ou virtual, inclusive quando realizadas por agente sediado no exterior
  que as ofereça a pessoa localizada no território nacional." O §1º diz que a proibição "abrange" as apostas esportivas e
  os jogos on-line.
- **Art. 4º e 6º:** as autorizações existentes se extinguem em trinta dias; ficam "vedadas novas concessões, permissões e
  autorizações".
- **Art. 14:** bancos e instituições de pagamento não podem "processar, liquidar ou viabilizar transações destinadas a
  loterias de aposta de quota fixa".
- **Art. 16:** veda publicidade, inclusive "todo conteúdo que oferte, promova, divulgue ou facilite o acesso", dirigido ao
  público brasileiro.
- **Art. 19 a 22:** provedores de aplicações e lojas de aplicativos têm dever de impedir a circulação; multa de até 10%
  do faturamento do grupo no país ou até R$ 50 milhões por infração.
- **Art. 23:** a Fazenda e a Justiça podem requerer bloqueio de sites pela agência de telecomunicações.
- **Art. 25:** Polícia Federal, Receita Federal e o Conselho de Controle de Atividades Financeiras compartilham
  informações.
- **Art. 28:** perdimento, por processo administrativo, dos valores em contas bloqueadas de operador irregular.
- **Art. 29:** revoga os arts. 1º a 21, 22 a 24, 25 a 40, 43 a 48 e 54 da Lei 14.790 e o Capítulo V da Lei 13.756.

O que muda para o plano (INFERÊNCIA):

1. Não existe mais, no Brasil, a opção "obter licença de aposta". A opção 8.3 abaixo só existe fora do país.
2. O art. 17 da Lei 14.790, que a Nota 2958 usou para pedir o bloqueio, foi revogado e substituído pelo art. 23 da MP.
3. Medida provisória tem força de lei desde a publicação e depende de conversão pelo Congresso. Não conferi a tramitação.
4. As perguntas do Baked não são esportivas. Se a MP alcança um pote sobre fato on-chain depende da mesma dúvida de 1.4.

**Severidade: crítica.**

### 1.6 Lei 14.478/2022 e normas do Banco Central (FATO, Planalto e site do Banco Central)

- **Art. 2º:** prestadoras de serviços de ativos virtuais "somente poderão funcionar no País mediante prévia autorização".
- **Art. 5º:** é prestadora "a pessoa jurídica que executa, em nome de terceiros, pelo menos um dos serviços": "I - troca
  entre ativos virtuais e moeda nacional ou moeda estrangeira; II - troca entre um ou mais ativos virtuais; III -
  transferência de ativos virtuais; IV - custódia ou administração de ativos virtuais ou de instrumentos que possibilitem
  controle sobre ativos virtuais; ou V - participação em serviços financeiros e prestação de serviços relacionados à
  oferta por um emissor ou venda de ativos virtuais."
- **Art. 10:** cria o crime do art. 171-A do Código Penal, "Fraude com a utilização de ativos virtuais", com pena de
  "reclusão, de 4 (quatro) a 8 (oito) anos, e multa".
- **Art. 12:** inclui as prestadoras entre as pessoas obrigadas pela lei de lavagem de dinheiro e aumenta a pena, de um
  terço a dois terços, quando o crime usa ativo virtual.
- **Art. 13:** aplica-se o Código de Defesa do Consumidor "às operações conduzidas no mercado de ativos virtuais".
- **Resolução BCB 520, de 10/11/2025** (li o início): disciplina as sociedades prestadoras. Art. 1º, parágrafo único: o
  funcionamento no país "é caracterizado se a prestadora: I - está constituída no Brasil ...; e II - possui sede e
  administração localizadas em território nacional". Modalidades: intermediária, custodiante e corretora.
- **Resolução BCB 519:** processo de autorização; exige endereço físico de uso exclusivo, vedado coworking.
- **Resolução BCB 521:** inclui operações com ativos virtuais no mercado de câmbio.
- Prazos e capital (FATO SEC., Tokeniza, 9/1/2026): vigência em 2/2/2026, pedidos de autorização até 30/10/2026, capital
  mínimo entre R$ 10,8 milhões e R$ 37,2 milhões. Não conferi na norma.

**Lei 9.613/1998, art. 9º, parágrafo único** (FATO, Planalto, trecho). São pessoas obrigadas a identificar clientes e
comunicar operações: "VI - as sociedades que, mediante sorteio, método assemelhado, exploração de loterias, inclusive de
apostas de quota fixa, ou outras sistemáticas de captação de apostas com pagamento de prêmios, realizem distribuição de
dinheiro" e "XIX - as prestadoras de serviços de ativos virtuais". Não reli os arts. 10 e 11, que trazem os deveres.

Onde o plano fica exposto (INFERÊNCIA): um cofre do programa que guarda USDC de terceiros, com a equipe controlando a
atualização do programa e cobrando taxa, é ou não "custódia ou administração ... em nome de terceiros"? E um pote é
"sistemática de captação de apostas com pagamento de prêmios"? Se a resposta a qualquer das duas for sim, "sem
identificação do usuário" colide com um dever legal citado. **Severidade: crítica.** Ponto para advogado.

## 2. Estados Unidos e Europa

### 2.1 Acordo da CFTC com a Polymarket (FATO, comunicado 8478-22, de 3/1/2022)

A Commodity Futures Trading Commission é o regulador federal de derivativos dos Estados Unidos.

- Alvo: "Blockratize, Inc. d/b/a Polymarket". Motivo: oferecer "off-exchange event-based binary options contracts" sem
  registro. Multa de US$ 1,4 milhão, encerramento dos mercados e ordem de cessar.
- A plataforma operava "deploying smart contracts hosted on a blockchain". O regulador: "All derivatives markets must
  operate within the bounds of the law regardless of the technology used, and particularly including those in the
  so-called decentralized finance or 'DeFi' space."
- Um dos exemplos citados é pergunta de preço de cripto: "Will $ETH (Ethereum) be above $2,500 on July 22?".
- O comunicado registra que a Polymarket "creates, defines, hosts, and resolves" os mercados. No Baked, a equipe abre as
  perguntas e aciona a resolução (INFERÊNCIA: é o mesmo papel).

**Severidade: alta** (vale se houver usuário americano; por isso todos bloqueiam os Estados Unidos).

### 2.2 Estados americanos (FATO, páginas oficiais)

| Estado | Data | Medida | Fonte |
|---|---|---|---|
| Nevada | 16/1/2026 | Ação civil contra Blockratize, QCX e **Adventure One QSS** (a empresa do Panamá) | Gaming Control Board |
| Nevada | 3/6/2026 | Liminar: Polymarket não pode oferecer contratos de esporte, eleição e entretenimento no estado | Procurador-geral |
| Illinois | 27/1/2026 | Ordem de cessar; a lei pune site que permite aposta "upon the result of any sport, game, contest, political nomination" | Gaming Board |
| Rhode Island | 21/5/2026 | Ação contra Kalshi e Polymarket | Procurador-geral |
| Connecticut | 8/9/2026 | Ordem de cessar; exige permitir o saque dos fundos dos residentes | Carta oficial (cópia em stateaffairs.com) |
| Missouri | 16 a 18/9/2026 | Ordem de cessar a seis empresas | Carta oficial (cópia) e comunicado |
| Nova York | 24/9/2026 | Ação judicial pedindo devolução dos ganhos e multa de três vezes o ganho | Procuradora-geral |

O que os casos mostram (INFERÊNCIA): a licença federal não protegeu a Polymarket US da lei estadual de jogo, e Nevada
incluiu a empresa do Panamá. Quase todas as medidas miram contratos esportivos, que o Baked não oferece.

### 2.3 França e outros reguladores europeus

**Autoridade francesa de jogos, comunicado de 17/7/2026** (FATO, anj.fr). Em 16/7/2026 mandou os provedores bloquearem o
site. Pontos que tocam o plano:

- O bloqueio geográfico existia e não bastou: a medida "has been circumvented".
- A ausência de identificação é citada: "the absence ... of a user identification system to verify their integrity
  (known as KYC)".
- Publicidade de jogo não autorizado é crime, com multa de 100 mil euros, e alcança quem "has publicly disseminated the
  odds and payout ratios offered by these unauthorized sites". Toca a página do X e as publicações de patrocínio.
- A autoridade espera "user identity and location verification that is sufficiently early and robust".

**Autoridade Europeia dos Valores Mobiliários e dos Mercados, declaração de 3/7/2026** (FATO, esma.europa.eu, referência
ESMA35-243228190-8148). Novo em relação ao relatório anterior.

- "Not all event contracts are financial instruments. Only event contracts with an event question related to an
  underlying mentioned in Section C(4) to (10) of Annex I of MiFID II classify as financial instruments."
- Os que são instrumento financeiro são derivativos e caem nas medidas nacionais contra opções binárias: "the marketing,
  distribution or sale to retail clients of event contracts that meet the definition of financial instruments is
  prohibited".
- Mesmo para cliente não varejo, exige-se autorização de empresa de investimento.
- O comunicado de imprensa acrescenta que contratos de evento "may (also) qualify as bets under national gambling
  legislation".

INFERÊNCIA: na Europa há duas portas. Pergunta sobre referência financeira (preço por oráculo é a candidata) pode ser
opção binária; as demais podem ser aposta. Se um criptoativo é "subjacente" da lista citada, não conferi.

Outros países, pela Nota 2958 (FATO SEC., a Nota cita imprensa): Portugal bloqueou por operadoras; Países Baixos mandaram
cessar em fevereiro de 2026; Bélgica, Itália, Alemanha, Grécia, Polônia, Romênia, Suíça e Hungria restringiram;
Argentina e Colômbia bloquearam. Não li os comunicados desses reguladores.

**Severidade: alta.**

### 2.4 MiCA: o que exige de quem oferta um token (FATO, texto do art. 4º no site da ESMA)

MiCA é o regulamento europeu de criptoativos (Regulamento UE 2023/1114).

- **Art. 4º, 1:** ninguém faz oferta ao público, na União, de criptoativo que não seja token referenciado a ativos nem
  de moeda eletrônica, "unless that person: (a) is a legal person; (b) has drawn up a crypto-asset white paper ...;
  (c) has notified the crypto-asset white paper ...; (d) has published the crypto-asset white paper ...; (e) has drafted
  the marketing communications ... in accordance with Article 7; (f) has published the marketing communications ...;
  (g) complies with the requirements for offerors laid down in Article 14."
- **Art. 4º, 2:** as letras (b), (c), (d) e (f) não se aplicam a: "(a) an offer to fewer than 150 natural or legal
  persons per Member State ...; (b) over a period of 12 months ... the total consideration ... does not exceed
  EUR 1 000 000 ...; (c) an offer ... addressed solely to qualified investors".
- **Art. 4º, 3:** o título não se aplica quando o criptoativo é oferecido de graça, é recompensa de validação, é token
  de utilidade para serviço que já existe, ou só serve numa rede limitada de comerciantes.
- **Art. 4º, 4:** as isenções caem se o ofertante divulga a intenção de buscar admissão à negociação.

Notar: a isenção dispensa o documento, mas **não** dispensa ser pessoa jurídica (a) nem as regras de conduta (g).
Não li os arts. 6º, 7º, 13, 14 e 15, nem o título sobre abuso de mercado (manipulação e informação privilegiada).
Informação faltante para o item "vamos usar para pumpar".

**Severidade: média** (só pesa se houver comprador europeu).

## 3. Tokens: recompra, queima e repasse de receita

### 3.1 O que os reguladores disseram

| Documento | O que diz | Leitura |
|---|---|---|
| SEC, perguntas e respostas sobre criptoativos, pergunta 2.5, atualizada em 28/9/2026 | "Where a crypto system is functional and has no central party, an issuer's announcement of a non-security crypto asset buyback program would not constitute a representation or promise to undertake essential managerial efforts. Where a crypto system is not functional, however, such an announcement could constitute a representation or promise ... if the issuer presents the buyback as creating yield or return for token holders." Aviso da página: "these FAQs have no legal force or effect". | FATO, reli (resumo de modelo auxiliar) |
| SEC, declaração sobre meme coins, 27/2/2025 | Meme coin é ativo com "limited or no use or functionality". As transações "do not involve the offer and sale of securities" porque os compradores "are not making an investment in an enterprise" e os promotores "are not undertaking ... managerial and entrepreneurial efforts". Não vale para produtos "labeled 'meme coins' in an effort to evade"; fraude segue punível. | FATO, reli (resumo) |
| SEC contra DeFi Money Market (2021); SEC contra SafeMoon (2023) | Token que prometia parte dos lucros foi tratado como contrato de investimento; token com repasse a detentores foi alvo. | FATO do agente 1G, não reli |
| CVM, Parecer de Orientação 40 (2022) | Contrato de investimento coletivo: expectativa de benefício econômico, esforço de terceiro, oferta pública. | FATO do agente 1G, não reli |
| Termos do pump.fun (data não identificada) | Seção 21.t proíbe usar o token "in connection with any capital raise, pooled investment scheme, profit-sharing arrangement, revenue participation right". Seção 21.d proíbe "pump and dump schemes, wash trading, spoofing". Seção 21.s alcança conduta fora da plataforma. Lei aplicável: Ilhas Virgens Britânicas. | FATO, resumo de modelo auxiliar: **reler antes de usar** |

### 3.2 Token sem direitos no pump.fun e token vendido em rodada privada

| | Token A (pump.fun) | Token B (rodada privada) |
|---|---|---|
| Quem vende | A curva do pump.fun; a equipe não recebe o dinheiro da compra | A empresa, a compradores escolhidos |
| O que o comprador espera | Nada prometido, se a comunicação for coerente | Queima custeada por 25% da taxa; o fundador falou em "dividendo" |
| De quem depende o valor | Em tese, da demanda | Do volume apostado, isto é, do trabalho da equipe |
| Texto que encosta | Declaração de meme coins: só vale sem "managerial efforts" e sem uso para fugir da lei. Termos do pump.fun, 21.d e 21.t | Pergunta 2.5: exige sistema funcional e "no central party". Parecer CVM 40. MiCA, art. 4º |
| Frase do fundador exposta | "vamos usar para pumpar mesmo" | "subir preço e entregar dividendo aos holders" |

Três observações (INFERÊNCIA):

1. A proteção da pergunta 2.5 pede duas condições. O Baked terá uma equipe que abre as perguntas, aciona a resolução,
   recebe a taxa e executa a recompra. O `dois-tokens-e-ico-privado.md` cita a definição de "parte central" como quem
   tem "operational, economic, or voting control". Não reli essa definição.
2. Ligar o token A ao produto (desconto na taxa, voto em sugestões, elegibilidade ao token B) afasta-o da descrição de
   "limited or no use or functionality". Sem ligação, ele não serve ao produto. É uma tensão do desenho.
3. A tesouraria de 25% em Bitcoin não apareceu em nenhuma regra lida. É assunto contábil e tributário. Severidade baixa.

**Severidade do conjunto: alta** (crítica se a venda do token B ocorrer antes do parecer).

## 4. Integridade de mercado

### 4.1 As regras dos dois líderes (FATO, páginas oficiais)

**Polymarket**, plataforma internacional (integrity.polymarket.com; regras nos termos de uso, anunciadas em março de
2026). É violação:

- "Trade on stolen confidential information": negociar com informação confidencial cujo uso viole dever de confiança.
- "Trade on illegal tips": negociar com informação repassada por quem tinha esse dever.
- "**Trade if you can influence the outcome.** You may not trade on any contract if you hold a position of authority or
  influence sufficient to affect the outcome of the underlying event. You also may not trade at the direction of someone
  who holds such a position."
- Exemplo da própria página: "You control the outcome of this market, so you're prohibited from trading."
- Sanção na plataforma sem cadastro: "banning wallet addresses and referring the user and matter to law enforcement"
  (comunicado da empresa, 23/3/2026).

**Kalshi** (página de integridade): "CFTC-approved Kalshi Rules prohibit any person from trading on a contract if he or
she has any ability to influence, directly or indirectly, the outcome of the underlying event." Caso publicado: editor do
programa de um criador de vídeos negociou mercados sobre os vídeos; pena de "5-year ban, 10× financial penalty".

**Polymarket US**, livro de regras: "Source Prohibition" alcança quem tem informação não pública da fonte ou está "in a
position to influence the determination" do resultado. A página da empresa registra que, em abril de 2026, o
Departamento de Justiça e a CFTC acusaram um militar por usar informação sigilosa em mercado de previsão.

**Brasil:** a Lei 14.790, art. 26, impedia de apostar quem pode influenciar o resultado e seus parentes (FATO, pela Nota
2958, §62; artigo revogado pela MP 1.394). A Nota usa esse risco como razão para tratar o setor como ilegal (§54 e §66).

### 4.2 O que isso significa para o patrocinador anônimo que aposta

A decisão do fundador: o patrocinador pode pedir a pergunta, pode ficar anônimo pelo Cloak, pode apostar num lado, e
quem controla o resultado não é impedido de apostar.

Exemplo com números. A equipe do token X pede a pergunta "o token X queima 10% da oferta até 30/11?". Ela decide se
queima. O público põe 1.000 USDC no SIM e 1.000 no NÃO. O patrocinador, anônimo, põe 5.000 no NÃO e não queima.

- Pote: 7.000. Taxa de 3%: 210. Sobram 6.790 para 6.000 apostados no NÃO: 1,1317 por USDC.
- O patrocinador recebe 5.658 (lucro de 658). Os demais do NÃO recebem 1.132 (lucro de 132). A casa fica com 210.
- Os 1.000 USDC perdidos por quem apostou no SIM foram para quem controlava o resultado, para a casa e para quem seguiu
  o mesmo lado. A casa recebeu ainda a parte do patrocínio que fica com ela.

O que as fontes dizem sobre essa situação (sem opinar sobre a lei):

- É exatamente a conduta que Polymarket e Kalshi proíbem por escrito.
- A Nota 2958 trata a possibilidade de o apostador afetar o resultado como defeito do setor.
- O art. 171-A do Código Penal descreve "organizar, gerir, ofertar ... ou intermediar operações que envolvam ativos
  virtuais ... com o fim de obter vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro". Se a
  plataforma que aceita a pergunta, recebe o patrocínio e oculta o patrocinador entra nessa descrição é ponto para
  advogado.

Alternativas que não mudam a decisão, só a forma (correção proposta):

1. **Anônimo para o público, identificado para a equipe.** O selo mostra "Anônimo"; a equipe sabe quem é e guarda.
2. **Declaração assinada pela carteira** de que o patrocinador não controla a conta lida pela pergunta, com cláusula
   de retenção do prêmio se a declaração for falsa.
3. **Checagem on-chain na abertura:** recusar aposta de lado quando a carteira é a autoridade da conta medida. Não
   funciona se o dinheiro veio pelo Cloak, e isso precisa estar escrito.
4. **Aviso na pergunta:** "o patrocinador pode controlar o resultado e pode ter apostado".
5. A proposta do briefing: anônimo só coloca prêmio neutro. O fundador decidiu o contrário; registro que é a opção
   coerente com as regras dos líderes.

**Severidade: crítica.**

## 5. Privacidade: Tornado Cash e o Cloak

### 5.1 O que aconteceu, em ordem

| Data | Fato | Fonte |
|---|---|---|
| 8/8/2022 | O Tesouro americano sanciona o Tornado Cash | FATO do arquivo `privacidade-entre-redes-e-x.md`, não reli |
| 26/11/2024 | Tribunal do 5º Circuito, Van Loon: "we hold that Tornado Cash's immutable smart contracts ... are not the 'property' of a foreign national or entity, meaning (1) they cannot be blocked under IEEPA, and (2) OFAC overstepped its congressionally defined authority." O mesmo acórdão: "OFAC's concerns with illicit foreign actors laundering funds are undeniably legitimate." | FATO, acórdão (trechos) |
| 21/3/2025 | O Tesouro retira a sanção: "we have exercised our discretion to remove the economic sanctions against Tornado Cash"; segue "deeply concerned" com a Coreia do Norte | FATO, reli (resumo) |
| 6/8/2025 | Roman Storm condenado; título do comunicado da promotoria: "Founder Of Tornado Cash Crypto Mixing Service Convicted Of Knowingly Transmitting Criminal Proceeds" | FATO só do título; o corpo não abriu |
| 26/4/2027 | Novo julgamento marcado para as acusações sem veredito | FATO SEC., do mesmo arquivo |

O ponto decisivo está na ordem da juíza do caso Storm ao negar a reconsideração (FATO, documento judicial em cópia do
CourtListener): Van Loon não afeta a acusação porque a conduta "incorporates, but is not limited to, the immutable smart
contracts". O acusado "retained control over other decisions such as the operation and design of the user interface",
implementou o registro de repassadores e "deliberately implemented an ineffective sanctions screen".

### 5.2 O que isso sugere para um produto que aceita pagamento por ferramenta de privacidade (INFERÊNCIA)

- A proteção de Van Loon vale para código que ninguém controla. O programa do Baked terá autoridade de atualização e uma
  equipe que opera a interface, abre perguntas, aceita patrocinadores e cobra taxa.
- No caso Storm, uma triagem de sanções "deliberadamente ineficaz" foi usada pela acusação. Triagem de fachada pode
  pesar contra.
- O Baked não seria o misturador; seria o destinatário de dinheiro que passou por um.

### 5.3 O que o Cloak diz fazer (FATO, docs.cloak.ag, resumo de modelo auxiliar)

- "Every transaction is screened against sanctions and high-risk lists via Range, our screening partner, before it
  broadcasts"; "flagged transactions are blocked with a support path".
- Chave de visualização: "your viewing key produces a CSV or PDF report of your own transactions".
- Auditoria: "The full report is being prepared for publication". Relatório não publicado.
- A página não diz se a triagem é no depósito ou no saque, nem fala de identificação ou países restritos.

A triagem do Cloak confere listas de sanção; não identifica ninguém, e o resultado não chega ao Baked. O patrocinador
continua desconhecido para a equipe, salvo se entregar o relatório da chave de visualização (INFERÊNCIA). No Brasil, a
Lei 9.613 aumenta a pena de lavagem quando o crime usa ativo virtual (FATO, pela Lei 14.478, art. 12).

Correção proposta: aceitar patrocínio pelo Cloak só com o relatório da chave de visualização entregue à equipe.

**Severidade: alta.**

## 6. Padrão do setor sem identificação: quem bloqueia o quê

| Plataforma | Países barrados | Meio | O que os termos dizem | Fonte |
|---|---|---|---|---|
| Polymarket (internacional) | Total: Irã, Síria, Cuba, Coreia do Norte, Crimeia, Donetsk, Luhansk. Só fechar posição: 37 entradas, entre elas **Brasil**, Estados Unidos, Reino Unido, França, Alemanha, Itália, Austrália | IP, no site e na API | Proíbe VPN; vale a localização física | FATO, `polymarket-docs.md` e `polymarket-help.md`; as contagens variam entre páginas |
| Limitless (Base) | Acesso: Rússia, Belarus, Cuba, Irã, Coreia do Norte, Síria e regiões ocupadas da Ucrânia. Negociação: Estados Unidos, "Republic of China", Ontário e Alberta | Aviso ao tentar negociar | 18 anos; fora das listas de sanção; a empresa pode "require You to provide proof of age, identity, and/or eligibility at any time" | FATO, docs.limitless.exchange (trechos) |
| Myriad | 19 territórios: Estados Unidos, França, Singapura, Suíça, Malta, Ontário, Irã, Coreia do Norte, Síria e outros | Declaração do usuário; meio técnico não lido | Não ser residente de território proibido nem estar em lista de sanção | FATO, help.myriad.markets (trechos) |
| pump.fun | "Prohibited Jurisdiction" (lista não extraída); sanções dos Estados Unidos, Reino Unido, União Europeia e Nações Unidas | Não lido | 18 anos; proíbe VPN e "burner identities" | FATO, resumo de modelo auxiliar |
| Unhedged | Estados Unidos, Reino Unido, França, Singapura, Ontário, Austrália, Bélgica, Polônia | "IP-based geoblocking" | Identificação "at our discretion or as required by law" | FATO, unhedged.gg (trechos) |
| Kalshi | Opera com identificação; barra políticos e pessoas ligadas ao resultado | Cadastro | Livro de regras aprovado pela CFTC | FATO, kalshi.com |

PancakeSwap Prediction: a página de termos não abriu. Não lido.

O que o quadro mostra (INFERÊNCIA):

1. Nenhuma plataforma sem identificação deixa de bloquear os Estados Unidos e os países sob sanção.
2. Todas guardam o direito de pedir identificação depois. "Sem KYC" no setor quer dizer "sem KYC na entrada".
3. O bloqueio por IP é o meio padrão e é contornável. A autoridade francesa bloqueou a Polymarket mesmo com ele.
4. O Brasil já está na lista de "só fechar posição" da Polymarket. Limitless e Myriad não o listam nas versões lidas.
5. Não achei plataforma comparável com equipe declaradamente brasileira. Informação faltante.

**Severidade da decisão "bloqueio geográfico adiado": crítica** se "adiado" significar "depois da mainnet".

## 7. Mapa de exposição

Grau de exposição é **INFERÊNCIA** em todas as linhas.

| # | Decisão do fundador | Regra ou caso que a toca | Fonte | Exposição | Pergunta para o advogado |
|---|---|---|---|---|---|
| 1 | Mercado de previsão em pote, dinheiro real | Nota 2958 §18 e §73; MP 1.394 art. 1º e 3º; Decreto-Lei 3.688 art. 50 | gov.br/fazenda; Planalto | Alto | O pote é quota fixa, jogo de azar, loteria não autorizada, derivativo ou nenhum? |
| 2 | Perguntas sobre fatos on-chain de cripto | CMN 5.298 art. 3º, III: "qualquer outra temática", "a critério da CVM" | bcb.gov.br | Alto | Queima, renúncia e liquidez travada são "referencial econômico-financeiro"? Cabe consulta à CVM? |
| 3 | Perguntas de preço por oráculo | CMN 5.298, parágrafo único, II e III; ESMA 3/7/2026; CFTC 2022 (exemplo do ETH) | bcb.gov.br; esma.europa.eu; cftc.gov | Alto | Pergunta de preço de token é derivativo no Brasil e opção binária na Europa? |
| 4 | Só carteira, sem identificação | Lei 9.613 art. 9º, VI e XIX; Nota 2958 §60; ANJ 17/7/2026 | Planalto; gov.br; anj.fr | Alto | A empresa é pessoa obrigada? Que identificação mínima é exigida, e de quem? |
| 5 | Cofre do programa guarda USDC; equipe controla a atualização | Lei 14.478 art. 2º e 5º, IV; Resolução BCB 520 | Planalto; bcb.gov.br | Alto | Isso é "custódia ou administração ... em nome de terceiros"? Precisa de autorização? |
| 6 | Equipe brasileira | CMN 5.298 art. 4º; MP 1.394 art. 1º; Resolução BCB 520 art. 1º; caso Polymarket (equipe em Nova York) | bcb.gov.br; Planalto; Wired (sec.) | Alto | Empresa no exterior com sócios e desenvolvedores residentes no Brasil: qual o risco pessoal? |
| 7 | Bloqueio geográfico adiado | Bloqueio dos 27 sites; ANJ; CFTC 2022; termos dos concorrentes | Anatel; anj.fr; cftc.gov | Alto | Quais países bloquear no primeiro dia? O Brasil entra? |
| 8 | Patrocinador anônimo | Lei 9.613 art. 9º; ordem do caso Storm; integridade dos líderes | Planalto; documento judicial; polymarket.com | Alto | A empresa pode receber de pagador que ela mesma não conhece? |
| 9 | Patrocinador aposta; quem controla o resultado não é impedido | Polymarket ("Trade if you can influence the outcome"); Kalshi; Lei 14.790 art. 26 (revogado); Código Penal art. 171-A | polymarket.com; kalshi.com; Planalto | Alto | Que regra mínima de conflito afasta a responsabilidade da plataforma? |
| 10 | Pagamento pelo Cloak | Van Loon; ordem do caso Storm; retirada da sanção; Lei 9.613 | ca5.uscourts.gov; treasury.gov | Médio | Em que condições aceitar fundos vindos de ferramenta de privacidade? |
| 11 | Token A no pump.fun, "para pumpar" | SEC, meme coins (ressalvas); termos do pump.fun 21.d e 21.s; SEC contra SafeMoon | sec.gov; pump.fun | Médio | Que comunicação a equipe pode fazer sobre o token A? Pode negociar o próprio token? |
| 12 | Token B em rodada privada | Parecer CVM 40; MiCA art. 4º; isenções americanas (via 1G) | cvm.gov.br (via 1G); esma.europa.eu | Alto | Com que contrato, a quem e em que países se pode vender? |
| 13 | 25% da taxa em recompra e queima do token B | SEC, pergunta 2.5 ("functional", "no central party") | sec.gov | Alto | Anunciar a recompra antes de o produto funcionar é promessa de retorno? |
| 14 | "Dividendo aos holders" | SEC contra DeFi Money Market; Parecer CVM 40, item iv | sec.gov e CVM (via 1G) | Alto | Existe forma de repasse que não torne o token valor mobiliário? |
| 15 | 25% da taxa em tesouraria de Bitcoin | Nenhuma regra específica encontrada | Não encontrado | Baixo | Tratamento contábil e tributário, conforme a sede. |
| 16 | Saída antecipada com penalidade | Nota 2958 §39: equivale ao "cash out" | gov.br/fazenda | Médio | A saída aproxima o pote da aposta descrita na Nota? |
| 17 | Página do X e publicação de patrocínios | MP 1.394 art. 16 e 19; ANJ (multa de 100 mil euros) | Planalto; anj.fr | Médio | A divulgação das chances a público brasileiro ou francês é publicidade vedada? |
| 18 | Pote de um lado só devolve cobrando taxa | Código de Defesa do Consumidor, por força da Lei 14.478 art. 13 | Planalto | Baixo | Cobrar taxa numa pergunta que não teve contraparte exige aviso prévio destacado? |

## 8. Opções de estrutura que plataformas parecidas adotaram

Sem recomendar. Cada opção com exemplo, fonte e o que aconteceu.

**8.1 Empresa no exterior, sem licença, com bloqueio de países.** Polymarket: a plataforma internacional é operada pela
Adventure One QSS Inc. (nome confirmado nos documentos oficiais da França e de Nevada), constituída no Panamá em
15/10/2021 (FATO SEC., Sportico, 19/2/2026). Limitless: operada por empresa panamenha, a Street Chow Inc. (FATO SEC.,
PredictorHQ). O que aconteceu: bloqueada por reguladores de jogo de mais de dez países, incluída na ação de Nevada.
A imprensa relata que a equipe da empresa panamenha trabalhava em Nova York e que o escritório no Panamá estava vazio
(FATO SEC., Wired, 17/7/2026; NPR, 5/5/2026); um ex-advogado da CFTC disse: "We would have really liked to know that the
people purportedly in Panama weren't actually in Panama." INFERÊNCIA: onde as pessoas trabalham importa tanto quanto o
país do registro.

**8.2 Bolsa regulada.** Kalshi é bolsa designada pela CFTC. A Polymarket comprou a QCEX e voltou aos Estados Unidos
(FATO SEC.). A Limitless Markets US, LLC protocolou livro de regras na CFTC em maio de 2026 (FATO, cftc.gov). Exige
identificação. Não protegeu contra as ações estaduais (seção 2.2).

**8.3 Licença de jogo no exterior.** BetDEX Exchange, bolsa de apostas esportivas em Solana, licenciada pela autoridade
de jogo da Ilha de Man em 1/11/2022 (FATO, comunicado da empresa); aceita apostas de "select countries". Custos (FATO
SEC., Jagelski & Partners, 13/5/2026, fonte comercial): Ilha de Man, 5.250 libras de pedido e 36.750 por ano; Curaçao,
4.592 euros de pedido e 47.450 por ano, com diretor residente e regras contra lavagem. A mesma fonte diz que a lei de
Curaçao "does not name event contracts". **Correção ao `regulacao.md`:** a fonte trata Anjouan como opção excluída,
porque o banco central das Comores afirma que nenhuma licença de jogo on-line foi emitida no país. Licença de jogo traz
identificação e regras contra lavagem.

**8.4 Bloquear o país de origem.** A Polymarket bloqueia os Estados Unidos na plataforma internacional. Para o Baked, o
equivalente seria bloquear o Brasil. O relato do item 8.1 mostra o limite: a equipe continua no país.

**8.5 Fundação.** Não encontrei, nesta sessão, fonte primária de um mercado de previsão operado por fundação. A NPR
relata que o Drift Protocol usa o mesmo escritório de advocacia do Panamá (FATO SEC.). Informação faltante.

**8.6 Empresa de investimento autorizada na Europa.** Citada pela ESMA para contratos de evento que sejam instrumento
financeiro. Mesmo autorizada, não pode vender opção binária ao varejo.

**8.7 Mercado autorizado no Brasil.** A 5.298 admite contratos sobre referencial econômico-financeiro; a B3 tem uma
plataforma de "Contratos de Evento" (FATO SEC., Lefosse). Exige ser mercado organizado autorizado. Não é o produto.

## 9. O que precisa existir antes da mainnet

"Prática" = adotado pelos concorrentes lidos. "Exigência citada" = há texto legal lido que toca o ponto; se ele se
aplica ao Baked é ponto para advogado.

| # | Item | Natureza | Base |
|---|---|---|---|
| 1 | Parecer escrito de advogado brasileiro sobre os itens 1 a 6 do mapa | Prática (e condição dos demais) | Seção 1 |
| 2 | Pessoa jurídica constituída, com sede definida | Exigência citada (MiCA art. 4º, 1, a); prática | ESMA; termos dos concorrentes |
| 3 | Termos de uso: quem opera, lei aplicável, idade, países barrados, proibição de VPN, declaração sobre sanções, direito de pedir identificação depois | Prática; exigência citada no Brasil (Código de Defesa do Consumidor, Lei 14.478 art. 13) | Limitless, Myriad, pump.fun, Polymarket |
| 4 | Política de privacidade: carteira, endereço IP, contas do X de quem sugere, registros de aprovação | Exigência citada (Lei 13.709/2018, não relida) e regra do projeto (`privacy-audit`) | A conferir |
| 5 | Bloqueio por IP dos países escolhidos, no site e na interface de programação | Prática; a autoridade francesa considerou insuficiente o bloqueio contornável | Polymarket; ANJ |
| 6 | Triagem de carteiras contra listas de sanção antes de aceitar aposta ou patrocínio | Prática; uma triagem de fachada foi usada pela acusação no caso Storm | Cloak; Limitless; ordem do caso Storm |
| 7 | Regra de integridade: quem controla ou influencia o resultado não aposta, nem por terceiros; sanção escrita | Prática; padrão legal citado no Brasil (Lei 14.790 art. 26, revogado) | Polymarket; Kalshi; Nota 2958 §62 |
| 8 | Regra para a própria equipe: não aposta nas perguntas que abre nem negocia com informação interna | Prática | Regras 2.10 da Polymarket US e 2.11 da Kalshi |
| 9 | Identificação do patrocinador perante a equipe, mesmo com selo "Anônimo" ao público | Prática; exigência citada (Lei 9.613 art. 9º) | Seções 4 e 5 |
| 10 | Avisos de risco na tela: retorno só definido no fechamento; aposta grande reduz o retorno; pote de um lado devolve com taxa; saída tem penalidade; resolução é final | Prática; exigência citada (Código de Defesa do Consumidor) | Briefing 3.2 |
| 11 | Aviso na pergunta patrocinada: quem pagou, se apostou, se pode controlar o resultado | Prática ausente nos concorrentes; decorre da seção 4 | INFERÊNCIA |
| 12 | Registro permanente das decisões da equipe: abertura, recusa, fechamento abaixo de 24 horas, quem aprovou | Decisão já tomada; prática | `ideacao`, seção 1 |
| 13 | Divulgação de quem controla a atualização do programa e o cofre; auditoria | Prática | Cloak; SODAX |
| 14 | Política de comunicação: sem promessa de ganho, sem divulgar chances a países barrados | Exigência citada (MP 1.394 art. 16; lei francesa, via ANJ) | Planalto; anj.fr |
| 15 | Texto dos dois tokens revisado: sem "dividendo", sem promessa de preço; o que cada token não dá | Prática; exigência citada (MiCA art. 4º e 7º) | PUMP e WLFI (via 1G) |
| 16 | Venda do token B só depois do produto no ar e do parecer | Decorre da pergunta 2.5 da SEC | sec.gov |
| 17 | Plano de resposta a ordem de bloqueio ou notificação: quem responde, como os usuários sacam | Prática; Connecticut exigiu permitir o saque | Carta de Connecticut |
| 18 | Verificação do prazo de 30/10/2026 para pedido de autorização de prestadora, se o item 5 do mapa for "sim" | Exigência citada, com data de fonte secundária | Resoluções BCB 519 e 520 |

## O que isto muda no plano (INFERÊNCIA)

1. **Jurisdição não pode mais ser "assunto para depois".** Com a MP 1.394, o Brasil passou em cinco meses de "regra
   contra mercados de previsão" para "proibição geral da aposta de quota fixa". A empresa e o tratamento do Brasil
   precisam estar decididos antes de qualquer dinheiro real.
2. **"Sem KYC" precisa de definição exata.** No setor significa "sem identificação na entrada, com bloqueio por IP,
   triagem de sanções e direito de identificar depois". Proposta: adotar essa definição e identificar o patrocinador.
3. **O patrocinador anônimo que aposta é a decisão mais exposta e a mais barata de ajustar**, pelas alternativas 1 a 4
   da seção 4.2.
4. **Perguntas de preço têm exposição própria** no Brasil (5.298), na Europa (opção binária) e nos Estados Unidos (o
   exemplo do ETH no caso de 2022). Queima, renúncia e liquidez travada não aparecem em nenhuma norma lida.
5. **O token B deve sair do cronograma até o parecer.** O token A precisa de regra de comunicação.
6. **O bloqueio geográfico entra no MVP.** É o item mais simples da lista e o primeiro que todo concorrente tem.
7. **Corrigir no `regulacao.md`:** incluir a MP 1.394 e a declaração da ESMA; a lista dos 27 não está na Nota Técnica;
   Anjouan é rota excluída segundo a fonte lida; a base do bloqueio mudou do art. 17 da Lei 14.790 para o art. 23 da MP.

## Perguntas em aberto

**Para o advogado, em ordem de urgência:**

1. O pote, operado por equipe residente no Brasil, é aposta de quota fixa, jogo de azar ou loteria não autorizada,
   derivativo, ou nenhum? Qual o risco pessoal dos sócios e desenvolvedores, mesmo com empresa no exterior e Brasil
   bloqueado?
2. O cofre do programa, com a equipe controlando a atualização e cobrando taxa, faz da empresa prestadora de serviços de
   ativos virtuais ou pessoa obrigada pela lei de lavagem? Se sim, que identificação é exigida?
3. Patrocinador anônimo que controla o resultado e aposta: qual a responsabilidade da plataforma e que regra mínima a
   afasta?
4. Token B com recompra custeada pela taxa e "dividendo": é valor mobiliário no Brasil, nos Estados Unidos e na Europa?
   A quem e como pode ser vendido? O token A cabe nos termos do pump.fun?
5. Que estrutura (país, tipo de entidade, licença ou nenhuma) e que lista de países barrados adotar antes da mainnet?
6. Perguntas de preço por oráculo: derivativo no Brasil, opção binária na Europa?
7. Cabe consulta formal à CVM sobre "referencial econômico-financeiro" para fatos on-chain?
8. A MP 1.394 foi convertida, alterada ou perdeu eficácia? O que muda se cair?
9. A página do X e a divulgação de patrocínios são publicidade vedada em algum país-alvo?
10. Aceitar fundos vindos do Cloak cria dever adicional de diligência?

**Não consegui confirmar:**

- Norma da CVM posterior a abril de 2026 sobre a 5.298 (não encontrada); o Ofício 6/2026/CVM/SMI (não lido).
- Corpo do comunicado da promotoria sobre a condenação de Storm (só o título).
- Termos de uso da Polymarket internacional e do PancakeSwap (as páginas não abriram).
- MiCA, arts. 6º, 7º, 13, 14, 15 e o título de abuso de mercado.
- Comunicados oficiais de Portugal, Países Baixos, Bélgica, Itália e Reino Unido (só pela Nota 2958 e pela imprensa).
- Prazo de 30/10/2026 e capital mínimo das prestadoras, direto na norma.
- Arts. 10 e 11 da Lei 9.613, a Lei 13.709, o art. 51 do Decreto-Lei 3.688, os Decretos-Lei 6.259 e 204.
- Exemplo, em fonte primária, de mercado de previsão operado por fundação.
- Lidos só por resumo de modelo auxiliar, a reler: termos do pump.fun, perguntas e respostas da SEC, declaração de meme
  coins, comunicado do Tesouro de 21/3/2025 e perguntas frequentes do Cloak.

## Fontes

Consultadas em 4/10/2026. Tipo de leitura: (a) texto integral; (b) trechos devolvidos pela busca; (c) resumo de modelo
auxiliar.

**Primárias**

- Resolução CMN 5.298 (a): https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolução%20CMN&numero=5298
- Nota Técnica SEI nº 2958/2026/MF (a):
  https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/apostas-de-quota-fixa/legislacao/sei_60754019_nota_tecnica_2958.pdf
- Medida Provisória 1.394/2026 (a): https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1394.htm
- Lei 14.478/2022 (a): https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14478.htm
- Resoluções BCB 519, 520 e 521 (a, parcial): https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo (Resolução BCB,
  números 519, 520 e 521)
- Decreto-Lei 3.688/1941, art. 50 (b): http://planalto.gov.br/ccivil_03/decreto-lei/del3688.htm
- Lei 9.613/1998, art. 9º (b): https://www.planalto.gov.br/ccivil_03/leis/l9613.htm
- Anatel, bloqueio (b):
  https://www.gov.br/anatel/pt-br/assuntos/noticias/anatel-viabiliza-bloqueio-de-plataformas-de-apostas-preditivas-apos-determinacao-do-ministerio-da-fazenda
- CFTC, comunicado 8478-22 (a): https://www.cftc.gov/PressRoom/PressReleases/8478-22
- CFTC, livro de regras da Limitless Markets US (b): https://www.cftc.gov/filings/documents/2026/orgdcmlmexhibitm260504.pdf
- Nevada Gaming Control Board, 16/1/2026 (b):
  https://www.gaming.nv.gov/siteassets/content/about/press-release/ngcb-files-civil-enforcement-action-against-polymarket.pdf
- Procurador-geral de Nevada, 3/6/2026 (b):
  https://ag.nv.gov/News/PR/2026/Attorney_General_Ford_Announces_Preliminary_Injunction_in_Prediction_Market_Case/
- Illinois Gaming Board, 27/1/2026 (b):
  https://igb.illinois.gov/content/dam/soi/en/web/igb/documents/sports/cease-and-desist-letters/20260127-cease-desist-letter-polymarket.pdf
- Procuradora-geral de Nova York, 24/9/2026 (b):
  https://ag.ny.gov/press-release/2026/attorney-general-james-and-governor-hochul-announce-lawsuit-against-polymarket
- Procurador-geral de Rhode Island, 21/5/2026 (b):
  https://riag.ri.gov/press-releases/attorney-general-neronha-sues-kalshi-and-polymarket-unlawfully-conducting-sports
- Cartas de Connecticut (8/9/2026) e Missouri (16/9/2026), cópias (b):
  https://cms.stateaffairs.com/wp-content/uploads/2026/09/Polymarket-Cease-Desist.pdf e
  https://cms.stateaffairs.com/wp-content/uploads/2026/09/26916-MO-Polymarket-Cease-and-Desist.pdf
- Autoridade francesa de jogos, 17/7/2026 (a, cortado no fim):
  https://anj.fr/promotion-illegal-gambling-services-blocking-polymarket-website
- ESMA, declaração de 3/7/2026 (b):
  https://www.esma.europa.eu/sites/default/files/2026-07/ESMA35-243228190-8148_Public_Statement_on_the_application_of_the_national_product_intervention_measures_on_binary_options_to_event_contracts.pdf
  e https://www.esma.europa.eu/press-news/esma-news/esma-reminds-firms-existing-rules-and-obligations-under-binary-option-measures
- MiCA, art. 4º (a):
  https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-4-offers-public-crypto-assets-other
- SEC, perguntas e respostas (c):
  https://www.sec.gov/about/divisions-offices/division-corporation-finance/faqs-crypto-assets
- SEC, meme coins (c): https://www.sec.gov/newsroom/speeches-statements/staff-statement-meme-coins
- Van Loon v. Treasury (b): https://www.ca5.uscourts.gov/opinions/pub/23/23-50669-CV0.pdf
- Ordem no caso Storm, cópia (b):
  https://storage.courtlistener.com/recap/gov.uscourts.nysd.604938/gov.uscourts.nysd.604938.127.0.pdf
- Promotoria de Nova York, 6/8/2025 (só o título):
  https://www.justice.gov/usao-sdny/pr/founder-tornado-cash-crypto-mixing-service-convicted-knowingly-transmitting-criminal
- Tesouro americano, 21/3/2025 (c): https://home.treasury.gov/news/press-releases/sb0057
- Polymarket, integridade (b): https://integrity.polymarket.com/ e https://integrity.polymarket.us/
- Polymarket US, livro de regras (b): https://polymarketexchange.com/files/legal/Polymarket%20US%20Rulebook%20(2026.08.05).pdf
- Kalshi, integridade (b): https://kalshi.com/market-integrity/blocked-traders e
  https://kalshi.com/policy-center/insider-trading
- Kalshi, livro de regras (b):
  https://kalshi-public-docs.s3.amazonaws.com/regulatory/rulebook/Kalshi%20DCM%20Rulebook%20v.1.29.pdf
- Limitless, termos (b): https://docs.limitless.exchange/user-guide/terms-of-service
- Myriad, termos (b): https://help.myriad.markets/Myriad-Terms-and-Conditions-234c9e49da8280749056d50fa31ae850
- pump.fun, termos (c): https://pump.fun/docs/terms-and-conditions
- Unhedged, termos (b): https://unhedged.gg/terms
- Cloak, perguntas frequentes (c): https://docs.cloak.ag/guide/faq
- BetDEX, comunicado de 1/11/2022 (b):
  https://www.prnewswire.com/news-releases/betdex-exchange-becomes-first-fully-licensed-sports-betting-exchange-on-blockchain-301664556.html
- Do repositório: `knowledge-base/referencias/polymarket-docs.md`, `polymarket-help.md`,
  `knowledge-base/market/dois-tokens-e-ico-privado.md`, `knowledge-base/tecnologia/privacidade-entre-redes-e-x.md`

**Secundárias**

- Lista dos 27 sites: https://exame.com/brasil/poribicao-de-apostas-preditivas-veja-lista-de-plataformas-bloqueadas/ e
  https://www1.folha.uol.com.br/mercado/2026/04/governo-brasileiro-proibe-kalshi-e-polymarket-de-oferecer-apostas-esportivas-e-politicas.shtml
- Lefosse (27/4/2026):
  https://lefosse.com/noticias/alerta/mercados-preditivos-no-brasil-o-que-muda-com-as-novas-regras-publicadas-pelo-conselho-monetario-nacional-e-pela-secretaria-de-premios-e-apostas/
- Bocater (6/5/2026): https://www.bocater.com.br/publicacoes/newsletter/cmn-edita-norma-para-disciplinar-os-mercados-de-previsao/
- Eugênio Aragão (6/5/2026), crítica à Nota Técnica: https://eugenioaragao.adv.br/prevendo-o-futuro-dos-mercados-preditivos-no-brasil/
- Polymarket, comunicado de 23/3/2026:
  https://www.businesswire.com/news/home/20260320997513/en/Polymarket-Publishes-Enhanced-Market-Integrity-Rules-Across-Its-DeFi-Platform-and-CFTC-Regulated-U.S.-Exchange
- Sportico (19/2/2026): https://www.sportico.com/business/sports-betting/2026/polymarket-panama-adventure-one-prediction-market-1234885035/
- Wired (17/7/2026): https://www.wired.com/story/whats-up-with-polymarkets-panama-entity/
- NPR (5/5/2026): https://www.npr.org/2026/05/05/nx-s1-5807918/polymarket-panama-prediction-market
- Jagelski & Partners (13/5/2026), fonte comercial: https://jagelski.com/prediction-market-licensing/
- PredictorHQ, Limitless: https://predictorhq.com/reviews/limitless/
- Tokeniza (9/1/2026), prazos do Banco Central: https://tokeniza.com.br/regulacao-tokenizacao-brasil/
- PwC Legal (9/7/2026), sobre a ESMA:
  https://legal.pwc.de/en/news/articles/esmas-public-statement-confirms-that-existing-binary-options-prohibitions-apply-to-event-contracts
