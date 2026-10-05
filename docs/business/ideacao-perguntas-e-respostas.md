# Ideação — perguntas e respostas do Lucas

Registro das cinco rodadas de perguntas e respostas de 3 e 4 de outubro de 2026 (Fase 2 do wizard, etapas 2.1 e 2.2).
As respostas do Lucas são a fonte da verdade do produto: onde o código ou o `README.md` dizem outra coisa, vale o que
está aqui. Trechos entre aspas são palavras dele.

Quando uma resposta posterior muda uma anterior, vale a posterior. A seção 1 traz o estado consolidado; as seções 2 a
6 trazem cada rodada na ordem em que aconteceu.

## 1. Estado consolidado (vale este)

### Decisões de 5 de outubro de 2026, sobre as Partes 1 e 2 do BP v0.0.2 — prevalecem sobre tudo abaixo

Registro completo, com as contas, em [`_review/correcoes-bp-v0.0.2-partes-1-e-2.md`](_review/correcoes-bp-v0.0.2-partes-1-e-2.md).

- **Forma da taxa: 10% do lado perdedor.** "forma da taxa, sua recomendação". Os 3% do pote saem. Na média, a casa
  fica com 3,70% do volume, supondo metade das perguntas equilibrada e metade com favorito claro (inferência).
- **Fechamento das apostas:** "um fechamento só, porém vamos sim permitir perguntas acima de 30 dias, limitados a 90
  no mvp". Vale a regra do T2 para todas as perguntas. A regra dos 80% sai.
- **Vigia do serviço agendado:** 10 minutos sem resposta e 3 tentativas de religar; depois "o segundo assume o cron
  e envia notificação para o cto saber que tem um sistema down".
- **Disputa em duas etapas:** aprovada. Os revisores da segunda etapa são "membros da equipe", dois de três.
- **Indicação:** 20% por 90 dias, sobre a taxa que a casa recebeu das apostas vencedoras do indicado. O indicado
  recebe de volta a taxa dos primeiros 50 USDC apostados depois de completar 250 USDC apostados. O teto dessa
  devolução (proposto: 5 USDC) ainda não foi confirmado por ele.
- **Pote de um lado só:** o 1% dos demais apostadores fica como regra à parte.
- **Prêmio do patrocinador** em pote de um lado só ou pergunta anulada: volta inteiro ao patrocinador.
- **Tipo "tokens travados":** fora da lista do primeiro dia.
- **Os 30% do patrocínio** que ficam com a plataforma vão inteiros para a operação até o equilíbrio.
- **Parceiros:** uma pergunta gratuita por parceiro, com destaque de 72 horas.
- **Devnet e rede principal:** "provavelmente vamos pra mainnet já no início do mês 2". Cerca de um mês de devnet.
- **Critério de parada:** aceito. Aos 180 dias na rede principal, com volume mensal de até 45 mil dólares, a empresa
  para ou muda de rumo.
- **Lista de investidores:** "não tem problema, pois são e-mails de negócios, e não dados pessoais". O convite por
  email segue.
- **Tipos de pergunta do primeiro dia:** primeiro ele disse "esse trecho você segue me entregando sem contexto, eu
  não sei o que é, e quais as suas recomendações". Depois da explicação refeita, decidiu no mesmo dia: "das três
  saídas, vamos com o recomendado (a)". O site abre com cinco tipos (preço de ativo grande, queima, liquidez travada
  na Meteora, pool de staking e stake de validador), e o leitor de preço é a primeira peça a construir.
- **Teto da devolução ao indicado:** 5 USDC por indicado, aprovado ("está ótimo").
- **Tokens, as sete propostas da Parte 3:** "sobre as 7 decisões, concordo". Passam a valer: (1) a equipe cria o
  token A, compra até 2% em carteira declarada, trava por 12 meses e não negocia depois; (2) staking do B com travas
  de 1, 3, 6 e 12 meses e pesos 1, 1,5, 2 e 3, valendo para desconto, voto e cofre; (3) desconto na taxa em quatro
  faixas, de 10% a 40%, com revisão se os descontos passarem de 10% da taxa num trimestre; (4) 20% do resultado do
  mês ao cofre, só com caixa positivo e 33.000 dólares de reserva, e um quinto disso para as pools das perguntas;
  (5) distribuição do B: venda privada 15%, reserva da ponte 10%, liquidez 12%, crescimento 25%, equipe 15%,
  tesouraria 13%, reserva futura 10%; (6) ponte com 20% de desconto e até 30% de cada compra paga com A queimado;
  (7) venda privada depois de três meses seguidos com a operação paga, de 60 a 90 dias antes do lançamento do B.
- **Os quatro testes antes do lançamento do token A** (carteira do fundo na divisão da taxa de criador, ferramentas
  de trava com o padrão Token-2022, termos completos do pump.fun, destino do fundo se a empresa parar): "ok".
- **Sem pendência do fundador nas Partes 1, 2 e 3.**

### Alterações da revisão do BP v0.0.1 (4 de outubro de 2026) — prevalecem sobre o resto desta seção

Registro completo em [`_review/user-review-v0.0.1.md`](_review/user-review-v0.0.1.md).

- **Saída antecipada: fora do MVP.** "Neste mvp vamos trabalhar sem possibilidade de saída." A fórmula proposta fica
  documentada para a fase 2.
- **Patrocínio, o "70/30":** "70 pro pote/pool e 30 pra banca/plataforma".
- **Destino da taxa:** "25% da taxa para treasure e todos os demais 75% para a operação", até as contas equilibrarem
  ("pode ser de 5 a 12 meses"). Fundo de prêmios só "a partir do mês 10". Recompra só "com caixa da empresa a partir
  do mês 13", como decisão futura.
- **Pote de um lado só:** "apenas o primeiro apostador tem proteção contra taxa".
- **Fechamento de perguntas longas:** a proposta do T2 (fecha quando faltam 5% da duração, mínimo de 24 horas, máximo
  de 7 dias). Opção avançada: aprovada como proposta.
- **Patrocinador anônimo:** anônimo para o público e identificado para a equipe; aviso na pergunta de que o
  patrocinador pode controlar o resultado e pode ter apostado; anônimo só com prêmio neutro.
- **Perguntas decididas por uma única chave:** fora do pote na primeira versão.
- **Preço de token pequeno:** entra em três degraus, não no primeiro dia.
- **Resolução:** dois serviços agendados, o segundo em outro provedor vigiando o primeiro e avisando o CTO por email.
  Sem botão público por ora. Depois de resolvida, a pergunta fica travada "cerca de 6h" até alguém da equipe revisar e
  confirmar. Arbitragem interna na fase 1.2; ambiente de disputa no roteiro.
- **Pagamento ao vencedor:** automático, sem botão de resgate.
- **SODAX e Cloak:** integrados na plataforma.
- **MVP inteiro na devnet** (em 5 de outubro ganhou prazo: cerca de um mês, ver o bloco acima).
- **Parceiros:** convidar de 20 a 30 projetos como patrocinadores sem pagamento, em troca de divulgação.
- **Tokens:** o token A deve poder alimentar as pools; o token B com desconto por quantidade e por tempo, staking, e
  tempo de posse como poder de voto; estudar a queima do A na compra do B.
- **Fase 2, a estudar:** esportes por oráculo, contratos perpétuos, taxa de construtor, indicação e afiliados, taxa de
  depósito e saque, teto de pote.
- **Nome: Brot Markets.** "eu já disse que será Brot Markets". O mascote é o pãozinho Baked.
- **Segunda devolutiva (4 de outubro), registrada em** [`_review/bp-impact-review-v0.0.2.md`](_review/bp-impact-review-v0.0.2.md):
  pote de um lado só cobra 1% dos demais apostadores; pergunta anulada devolve tudo sem taxa; na janela de 6 horas a
  equipe só confirma ou anula, e sem revisão o pagamento sai sozinho; contestação só pela equipe no MVP e por qualquer
  apostador com depósito na fase 1.2; disputa em duas etapas, sem voto por token; indicação desde o MVP, paga pela
  taxa do próprio indicado; parceiros entregam publicidade e publicações; custo de referência de 5.500 dólares por mês
  (três sócios a 1.500 mais até 1.000 de infraestrutura); investimento buscado de 50 mil dólares em seis meses a 350 mil
  em um ano, sem depender dele; Cloak integrado já na devnet; sem bloqueio de país por enquanto; CTO é o Ronaldo.
- **O programa será reescrito neste repositório, do zero**, reaproveitando trechos do código do sócio e seguindo as
  regras de código do Lucas.
- **Gasto antes da rede principal:** "as duas auditorias dos dois sites que te passei vão custar zero reais. A
  abertura da empresa vai custar sim uns 2k dol, e a avaliação jurídica eu consigo gratuitamente também".
- **Forma da taxa:** estava em aberto em 4 de outubro; decidida em 5 de outubro (10% do lado perdedor, ver o bloco
  acima). A simulação das três formas está em `_review/bp-impact-review-v0.0.2.md`.
- **Token A:** canal de tração, sem vínculo com a empresa. A queima do A na compra do B fica como desenho de partida.
- **Forma do BP:** três ou quatro partes de 20 a 30 páginas; a primeira é a de produto.

### Estado antes da revisão

### Produto

- É um **mercado de previsão**. "ele foi montado errado, não é essa a proposta dele ... queremos que seja um mercado
  de previsão". O modelo do código (patrocinador vende YES com desconto como recompensa) não é a proposta.
- **Uma pool (pote) por pergunta.** As apostas entram em SIM ou em NÃO; quem acerta divide o pote. Sem preço garantido
  na compra, sem limite de compra.
- **Sem tokens SPL de SIM e NÃO.** "o que precisamos fazer é o registro do voto por dinheiro comprado por cada
  votante, e apenas isso".
- **Três trilhas de dinheiro para a mesma pool:** (a) as apostas; (b) o patrocinador; (c) o token.
- **Moeda: USDC.** "A moeda vai ser usdc, vamos abandonar a ideia de sol."
- **Rendimento do pote: abandonado.** "esquece o rendimento do pote, vamos abandonar isso, não serve de nada."
- **Pote de um lado só:** devolve cobrando taxa. "A banca nunca perde, e nem a igreja faz caridade sem cobrar."
- **Saída antes da resolução: entra no MVP.** "saída antes da resolução, vamos fazer agora no mvp." A forma: "a pessoa
  pode sair antes com ganho proporcional menor, ou perca proporcional maior, deixando uma penalidade pro pote."
- **Fechamento das apostas:** padrão de 80% da duração, com mínimo de 24 horas; menos de 24 horas só como "opção
  avançada", "com um double cheque para confirmar e log da operação de quem aprovou". Em aberto: "ainda temos que
  pensar para acima de 2-3 meses se 80% não é muito longo, e pode ser gradual."

### Perguntas e resolução

- **Dois ciclos de pergunta.** Primeiro: a equipe monta as perguntas. Segundo: o patrocinador pede uma pergunta, com
  o pagamento travado até a equipe aceitar ou recusar; "se for recusado devolve a grana travada".
- **O público sugere pelo X.** Página do site com "um monitor vindo do X, e orientação da galera como eles podem
  fazer para fazer as sugestões".
- **Resolução só por dado on-chain.** "eu quero trabalhar com oráculo, mas um que possa resolver onchain, diferente
  das questões abertas de geopolítica que depende um oráculo que claramente pode ser manipulado".
- **Pode resolver antes da data** se o fato acontecer.
- **Acionamento:** "talvez a gente resolva com um sistema cron pela nossa plataforma, acionando o resolver."
- **Quais tipos de pergunta no primeiro dia: sem decisão.** "não tenho a menor ideia e você vai me ajudar a decidir".
  Sobre a explicação técnica dos tipos e do Token-2022: "não entendi nada. foda-se". Precisa ser reapresentado em
  linguagem simples.
- **Preço de token pequeno como pergunta:** ele questionou a restrição ("Por que ficaria? Com base no quê"). Sem
  decisão.

### Patrocinador

- **Três faixas: 500, 1.500 e 5.000** dólares.
- **Divisão do valor do patrocínio:** "70/30 dessa grana vai pra banca e a outra parte pra liquidez como neutra ou
  aposta de patrocinador". **Ambíguo:** não ficou dito se 70% é da banca ou da pool. Tratar como em aberto e mostrar
  os dois cenários.
- **Pode pedir pergunta ou entrar numa pergunta já aberta pela equipe.**
- **Duas formas, à escolha dele:** prêmio neutro (soma ao pote sem lado) ou aposta de patrocinador (num lado).
- **Pode ficar anônimo**, usando o Cloak para esconder o pagador, e o anônimo também escolhe qualquer das duas formas.
- **Recebe contrapartidas.** As listadas (selo, destaque, posição fixa, pote mínimo garantido, texto na pergunta,
  publicação no X) "são aceitáveis".

### Receita

- **3% do pote.**
- **Destino da taxa:** "25% para um treasure btc da empresa, 25% para operação (não deve ser todo o custo que foi
  estimado), 25% recompra e queima do nosso token em ico privado e, 25% para fundo de prêmios".
- Pergunta dele ainda sem resposta completa: "essas empresas não tem outras formas de monetização, não?" e o que é e
  para que serve o fundo de prêmios.

### Token

- **Dois tokens.** Um no pump.fun: "é expeculativo, e vamos usar para pumpar mesmo e tudo bem". Outro em "ico privado
  mais robusto", que é o desenhado: "aí a gente tem liberdade para desenhar ele". A recompra e queima é do token do
  ICO privado.
- **A ideia de 30% das compras do token irem para as pools** só vale para o token do ICO privado.
- Objetivo declarado antes: "subir preço e entregar dividendo aos holders".

### Empresa, público e marca

- Público: "queremos pessoal da web3".
- Acesso: "100% onchain da solana, via wallet, sem kyc". Bloqueios geográficos ficam para o fim.
- Dinheiro real, mainnet: "a plataforma é uma empresa em construção com deploy a ser feita na mainnet".
- Concorrentes: "qualquer empresa de mercado de predição é concorrente direto".
- Nome: **Baked Market**. Mascote: Baked. Layout: Ledger² no escuro, com tema claro (direção N aprovada).
- Pagamento de outras redes: SODAX (sodax.com). Privacidade: Cloak.
- Hackathon, divisão com o Ronaldo e jurisdição: não são assunto agora.

## 2. Rodada 1 — dez perguntas

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Quem é o primeiro patrocinador que você imagina pagando? | "sigo com a dúvida se há necessidade de um sponsor, e se sim, para qual razão?" |
| 2 | Queremos equipes patrocinando mercados sobre as próprias promessas, mesmo ganhando quando falham? | "Talvez não queremos isso, e se quisermos, para qual situação seria interessante?" Viu uso como "marketing de fomo em que ela tem informação privilegiada" ou como pesquisa de mercado. |
| 3 | Qual tipo de meta é a porta de entrada? | "não sei, acho que é cedo pra essa pergunta." |
| 4 | É mercado para negociar probabilidade ou ferramenta de recompensa? | "ele segue sendo um mercado para negociar probabilidade, mas mascarado com esse marketing de fomo como ferramenta da própria empresa." |
| 5 | De onde vem a receita? | "como as empresas de mercado de predição ganham sua receita? ... me diga todas as formas, e todas as suas porcentagens." |
| 6 | Qual hackathon, prazo e ambição? | "esquece isso, não precisa para agora." |
| 7 | Como é a divisão com o Ronaldo? | "por enquanto é irrelevante, eu te aviso o que fazer." |
| 8 | Dinheiro real está no horizonte? | "deploy a ser feita na mainnet, então é óbvio que a compra das respostas são com dinheiro real." |
| 9 | Qualquer pessoa cria mercado? | "qq pessoa poderá criar qualquer pergunta que funcione dentro do nosso escopo." (mudou na rodada 3) |
| 10 | Quem é concorrente ou referência de modelo? | "qualquer empresa de mercado de predição é concorrente direto, porém cada qual com os seus diferenciais." |

Junto com as respostas ele apontou os erros do desenho atual: por que há limite de compra; quem fixa os preços de YES
e NO; "talvez o sponsor seja desnecessário, pois a liquidez é feita por voto comprado"; "A meta, geralmente, é
realizada por um gatilho de tempo"; e por que criar token SPL para YES e NO.

## 3. Rodada 2 — quinze perguntas

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Confirmo o modelo de pote, sem preço travado na compra? | "Sem preço travado, vamos trabalhar com o que é 'normal' do mercado, e pensar em um ou dois diferenciais" |
| 2 | O apostador pode sair antes da resolução? | "Não sei qual é o normal do mercado ... bem como qual seria a sua recomendação." |
| 3 | Resolve só na data ou quando a condição vira verdade? | "Acho que pode ser das duas formas ... Se acontecer algo antes da data marcada, ela pode sim se resolver." |
| 4 | As apostas fecham quanto tempo antes? | "Excelente pergunta, qual a sua sugestão e recomendação?" |
| 5 | Pote de um lado só: devolvemos sem taxa? | "Podemos devolver cobrando taxa, sim. A banca nunca perde" |
| 6 | Escopo: só fatos irreversíveis ou também preço, TVL, holders? | "eu quero trabalhar com oráculo, mas um que possa resolver onchain" |
| 7 | Qual o diferencial em uma frase? | "sendo em oráculo on chain, e possibilitando você abrir a questão de algo sobre si mesmo, você acaba criando uma forma de marketing". Perguntou quem cria as perguntas no Polymarket e na Kalshi. |
| 8 | Quem é o primeiro apostador? | "queremos pessoal da web3." |
| 9 | Quem cria paga? Ganha parte da taxa? | "acho justo que quem criar possa ganhar uma parte da pergunta. Mas real, quem cria geralmente?" |
| 10 | Empresa que controla o resultado pode apostar? | "Sim e não." (esclarecido na rodada 3) |
| 11 | Função de colocar prêmio no pote sem apostar? | "acho que isso era a ideia do sponsor originalmente, não era? Assim você até provocava um aumento da tvl da pool" |
| 12 | Qual a taxa e sobre o quê? | "vamos trabalhar dentro das taxas de mercado, nem maior, nem menor." |
| 13 | Token próprio? | "a ideia é sim de termos um, para lançarmos no pump.fun, e preciso que seja pensado um tokenomics e seu propósito" |
| 14 | Qual o serviço do primeiro dia? | "menor ideia". Pediu tabela de três concorrentes web3 com serviços, diferenciais, taxas e números. |
| 15 | Países e identidade? | "a princípio estamos pensando em fazer 100% onchain da solana, via wallet, sem kyc." |

## 4. Rodada 3 — recomendações comentadas e quinze perguntas

Pedidos novos: ler por inteiro quatro links (documentação e ajuda do Polymarket, documentação e página de impostos da
Kalshi) e clonar dez repositórios da Solana Foundation.

**Comentários às recomendações:**

| # | Recomendação | Comentário |
|---|---|---|
| 1 | Pote na primeira versão | "Sim, foi o que eu venho dizendo no funcionamento do pote de custo destravado." |
| 2 | Sem saída na primeira versão | "Podemos pensar nisso agora, ou até mesmo isso numa versão futura 2" (depois: MVP) |
| 3 | Fechamento em 80% e uma hora | "acho que pode ser até um tempo maior e não uma hora, e não entendi isso do 80%" |
| 4 | Taxa de 3%, 2% e 1% | "quero fazer umas simulações econômicas" comparando com rendimento da pool (depois abandonado) |
| 5 | Escopo em três famílias | "Não entendi porra nenhuma disso, me faltou contexto e explicação" |
| 6 | Mercado sobre si mesmo com selo | "quem vai criar será a nossa equipe, e teremos esse ambiente de sponsor ... meio que servindo de upvote num formato opt in, podendo se esconder como patrocinador." |
| 7 | Sem KYC pede bloqueio geográfico | "deixar para fazermos a implementação dos bloqueios ao final" |

**Respostas às perguntas:**

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Pote, sabendo que os líderes usam preço travado? | "Não acho que foi isso que eu defini nas minhas respostas anteriores." (o pote está confirmado; a expressão "preço travado" foi mal explicada) |
| 2 | Sem saída antes da resolução? | "acho que a pessoa pode sair antes com ganho proporcional menor, ou perca proporcional maior, deixando uma penalidade pro pote." |
| 3 | Regra de 80% e uma hora? | "Pedi explicação sobre isso." |
| 4 | Taxa de 3%? | "vamos testar antes de definirmos isso melhor." (depois: 3% confirmado) |
| 5 | O "sim" e o "não" da empresa apostar | "O sim e o não é a resposta à pergunta que foi criada e diz respeito a n empresa ... sobre qualquer coisa que seja verificável onchain." |
| 6 | Quem coloca prêmio pode apostar? | "Sim." |
| 7 | Quais perguntas no primeiro dia? | "verifique no código se há algo já relacionado a isso" |
| 8 | Preço de memecoin sem feed fica fora? | "Por que ficaria? Com base no quê" |
| 9 | Depósito contra spam para criar? | "seguirmos o mercado de quem cria é a própria banca/casa, mas ... a função do sponsor pode ser a dele mesmo criar a pergunta, e justamente este depósito mínimo ... serviria para este fim também" |
| 10 | Curadoria da home? | "a curadoria pode ser por situação de destaque e/ou pump de marketing via sponsor" |
| 11 | Token antes ou depois da mainnet? | "Qual token você se refere?" (era o da plataforma) |
| 12 | Quanto da taxa para recompra? | "isso tem que ser pensado depois que definirmos todas as rotas relacionadas ao modelo de negócios" |
| 13 | Só USDC ou também SOL? | "o que você sugere? Podemos conectar com a empresa SODEXA e receber pagamento de outras redes/moedas" |
| 14 | Bloqueamos Brasil e EUA? | "Por enquanto não, e ainda não sabemos." |
| 15 | Que número define sucesso em 90 dias? | "você mesmo pode nos dizer ... o que seriam metas ruins, razoáveis e otimistas." |

Decisões e ideias novas desta rodada: a equipe abre as perguntas ("vamos deixar que a equipe abra as perguntas");
sugestões pelo X; patrocinador como quem aposta "um valor X mínimo maior" num dos lados, podendo ser privado "com uso
de ferramentas como da cloak e/ou zcash"; exploração do rendimento da pool para a banca; token no pump.fun cujo
dinheiro de compra viraria liquidez nas pools.

## 5. Rodada 4 — as três trilhas e catorze perguntas

Ele disse que o relatório "se afastou um pouco da minha proposta" e reafirmou o desenho: (a) pool por pergunta com
liquidez inicial pela compra dos votos; (b) segunda trilha pelo patrocinador; (c) terceira trilha pelo token, com a
pergunta "para cada 1 dólar que alguém comprar do nosso token da pump.fun a gente pega 30% e redistribui aumentando
liquidez em todas as pools das perguntas? Isso é positivo?". Perguntou também se a pool pode fazer stake mantendo-se
travada, citando a objeção do Ronaldo.

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Patrocinador: lado, prêmio neutro ou os dois? | "ainda tenho as minhas dúvidas sobre qual adotar, o que você me recomenda e por quê?" |
| 2 | Mínimo fixo ou fração do pote? | "um valor fixo para dar start à pergunta, por exemplo a título de brainstorming USD 500?" |
| 3 | Quais contrapartidas? | "isso que eu quero que você me traga de exemplos e recomendações" |
| 4 | Patrocínio privado com privacidade fraca? | "A ideia é sim, de aceitarmos ... a gente usa a Cloak para esconder o pagador." |
| 5 | Patrocinador abre pergunta? | "ele pode solicitar uma pergunta, e travar o pagamento até a nossa equipe revisar ... se for recusado devolve a grana travada." |
| 6 | Saída no MVP ou versão 2? | "fase 2." (mudou na rodada 5: MVP) |
| 7 | Equipe define o fechamento, mínimo de 24 horas? | "o 80% do tempo, sendo o mínimo 24h é interessante como default, mas podendo em opção avançada definir algo menor que 24h, com um double cheque para confirmar e log" |
| 8 | Rendimento fora do MVP? | "fica dentro se você me explicar se a minha ideia é boa" (abandonado na rodada 5) |
| 9 | Token com recompra e Holder Rewards? | "você não me apresentou um plano de tokenomics do que devemos construir" |
| 10 | pump.fun ou plano do Ronaldo? | "começar pelo pump.fun para servir de marketing pra nossa plataforma e depois pensarmos um ICO privado mais robusto." |
| 11 | Quais tipos no primeiro dia? | "não tenho a menor ideia e você vai me ajudar a decidir isso" |
| 12 | "SODEXA" é o SODAX? | "o nome da empresa é sodax - https://www.sodax.com" |
| 13 | Resumo de uma página para o Ronaldo? | "quero uma preparação de 5-10 páginas sobre o projeto inteiro." |
| 14 | Nome? | "Baked Market, já temos mascote, inclusive." |

## 6. Rodada 5 — comentários ao briefing e oito perguntas

**Comentários, seção por seção, ao `BRIEFING-MERCADO-DE-POTE.md`:**

| Seção | Comentário |
|---|---|
| 1 Resumo | "Do resumo, é bem isso." |
| 2 Por que mudar | "ok." |
| 3.1 Ciclo da pergunta | "na realidade existem dois ciclos de perguntas, a primeira é da equipe montando as perguntas, enquanto que esta opção descrita é a segunda opção. E a parte da resolução talvez a gente resolva com um sistema cron pela nossa plataforma, acionando o resolver." |
| 3.2 A conta do pote | "isso." |
| 3.3 Regras | Pote de um lado só: "isso". Fechamento: "ainda temos que pensar para acima de 2-3 meses se 80% não é muito longo, e pode ser gradual". Saída: "vamos fazer agora no mvp". Moeda: "vai ser usdc, vamos abandonar a ideia de sol". |
| 4 O que muda no programa | "ok" |
| 5 Patrocinador | Faixas de 500, 1.500 e 5.000. "70/30 dessa grana vai pra banca e a outra parte pra liquidez como neutra ou aposta de patrocinador." Pode pedir pergunta ou entrar em pergunta já aberta. Pode ficar anônimo. Pode receber contrapartidas. Escolhe entre as duas formas. "o patrocinador anônimo pode escolher uma das duas formas, sim." |
| 6 Receita | "receita dos 3%, sim. Mas essas empresas não tem outras formas de monetização, não?" Destino: 25% tesouraria em BTC, 25% operação, 25% recompra e queima do token do ICO privado, 25% fundo de prêmios, "que ainda não foi dito o que seria esse fundo, e pra que serve". |
| 7.1 O que o pump.fun impõe | "não entendi nada, mas o que importa é que é expeculativo, e vamos usar para pumpar mesmo e tudo bem" |
| 7.2 A ideia dos 30% | "isso só vamos conseguir fazer com base em nosso próprio token ico privado, que aí a gente tem liberdade para desenhar ele." |
| 8 Rendimento do pote | "esquece o rendimento do pote, vamos abandonar isso, não serve de nada." |
| 9 Tipos de pergunta | "não entendi nada. foda-se" |
| 10 Em volta do produto | "sim." |

**As oito perguntas da rodada 5:**

| # | Pergunta | Situação |
|---|---|---|
| 1 | Prêmio neutro como padrão, anônimo só no prêmio neutro? | Respondida: as duas formas existem e o anônimo escolhe qualquer uma. |
| 2 | Divisão da taxa 50/25/25? | Respondida: 25% BTC, 25% operação, 25% recompra e queima, 25% prêmios. |
| 3 | Holder Rewards ligado? Token de teste antes? | Sem resposta. |
| 4 | O token do pump.fun é o definitivo? | Respondida: são dois tokens. |
| 5 | Pote em USDC no MVP? | Respondida: USDC, sem SOL. |
| 6 | "Baked Market" no singular? | Sem resposta. |
| 7 | Preço de token pequeno fica fora? | Sem resposta. |
| 8 | Pesquisar o PNP Protocol? | Sem resposta direta; coberto pela Onda 1. |

## 7. Pontos em aberto que as ondas precisam atacar

1. Qual parte do patrocínio é da banca e qual é da pool (o "70/30").
2. Regra de fechamento para perguntas de mais de dois ou três meses.
3. Como funciona a saída antecipada com penalidade sem esvaziar o prêmio.
4. Quais tipos de pergunta abrem no primeiro dia, explicado em linguagem simples.
5. Outras formas de monetização além da taxa de 3%.
6. O que é o fundo de prêmios e como ele se paga.
7. O desenho dos dois tokens e a ordem de lançamento.
8. O que significa operar sem KYC, com patrocinador anônimo e dinheiro real.
