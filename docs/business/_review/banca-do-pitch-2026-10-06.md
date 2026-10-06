# Banca do pitch de 6/10/2026: críticas, avaliação e recomendação

O fundador apresentou o deck de oito slides (a versão que está em `/pitch`) a uma banca de três avaliadores, gravou a
apresentação e a sabatina, e pediu: separar as críticas e sugestões, ligar cada uma ao slide e ao roteiro, avaliar,
dizer como melhorar e recomendar.

- **A transcrição corrigida** está em `knowledge-base/pitch/2026-10-06-banca-transcricao.md`. Os horários citados
  aqui são os dela.
- **Nada foi mudado no deck nem no plano.** Este documento é a avaliação. O que entra no deck é decisão do fundador.
- **Quem avalia aqui** é quem organizou o material (o assistente), com base no plano de negócio v0.0.2, no Product
  Brief e na pesquisa do repositório. Onde a avaliação depende de algo não conferido, isso está dito.

## 1. Resumo

A banca gostou do produto, do mascote e do lançamento limitado, e reprovou a forma como o produto foi contado. As
quatro mensagens que mais pesam:

1. **O diferencial não foi dito.** Para a Voz 4, o Brot é uma camada de incentivo: o projeto paga para a comunidade
   mover uma métrica on-chain dele. O deck vendeu "mais um mercado de previsão".
2. **Falta mostrar os mercados.** Nenhum slide mostra exemplos concretos do que se pode abrir. A Voz 4 chamou esse
   de "o seu slide mais importante".
3. **Texto demais, número de menos.** Os slides 2, 3, 4, 5 e 6 foram chamados de carregados. O pedido que se repete
   é um número grande por slide.
4. **Token e a palavra "bet" atrapalham.** O cartão do token no pump.fun e a palavra "bet" foram apontados como
   coisas que fazem um jurado dar nota menor.

A recomendação está na seção 10: montar uma terceira versão do deck, como prévia fora do ar, com o que está marcado
"adotar", e levar ao fundador seis decisões que só ele toma.

## 2. Como ler os vereditos

| Veredito | O que quer dizer |
|---|---|
| **Adotar** | A sugestão melhora o deck e cabe no que o plano já diz. Pode entrar sem nova decisão |
| **Adotar em parte** | A direção está certa, mas a forma sugerida perde algo ou contraria um fato |
| **Não adotar** | Contraria uma decisão registrada do plano, ou está errada no detalhe |
| **Decisão do fundador** | Mexe em regra do negócio, em dado pessoal ou em posicionamento |
| **Pesquisar antes** | Depende de um fato que o repositório não tem |

## 3. A crítica central: "você não entendeu o seu produto"

**O que foi dito (Voz 4, 10:32, 18:04 e 22:01).** "Você é uma camada de incentivo." "Isso é uma bounty platform. É
uma layer de incentivo pra galera fazer volume on-chain no seu protocolo. Você não falou isso em nenhum momento."
"O produto é foda. Você tem que entender o seu produto."

**Avaliação.** Está certa, e não é ideia nova para o projeto. O programa de onde o Brot nasceu se chamava "Provable
KPI Markets": um projeto punha dinheiro como prêmio por uma meta que se lê na rede. O fundador mudou a economia para
o pote, e a linha de patrocínio guardou essa ideia. O que se perdeu foi a forma de contar. A primeira versão do deck
tinha um slide de como funciona e um de tipos de pergunta; a segunda cortou os dois, e é a falta deles que a banca
sentiu.

**O cuidado.** Os exemplos que a Voz 4 deu de improviso foram "carteiras ativas na semana", "TVL de tanto" e "mais
de 10 mil holders". **O programa não lê nenhum dos três.** Número de holders e de carteiras ativas não está gravado
numa conta: alguém teria de calcular fora da rede, e esse alguém é justamente o intermediário que o slide 2 critica.
TVL ao vivo foi rejeitado no projeto porque um empréstimo-relâmpago o move por um instante. Dizer esses exemplos no
palco contradiz a promessa central. Os exemplos têm de sair dos cinco tipos do plano (Product Brief, R-13): preço de
ativo grande, queima de oferta, liquidez travada na Meteora, tamanho de pool de staking e stake de validador.

**Veredito: adotar o enquadramento, com os exemplos do plano.** Ver o slide novo proposto na seção 8.

## 4. Slide a slide

### Slide 1, capa

| Nº | Quem | O que disse | Avaliação | Veredito |
|---|---|---|---|---|
| B-01 | Vozes 2 e 4 | "Parimutuel" é difícil, usa outra palavra | É termo de corrida de cavalo, e nem a banca do meio cripto o reconheceu. Trocar o subtítulo por "USDC pools on Solana. Winners split the pot. Settled by on-chain data anyone can verify" | Adotar |
| B-02 | Voz 4 | "Tira esse..." (leitura provável: o selo "Colosseum Hackathon 2026") | O deck serve também para parceiros e investidores. O selo o prende a um evento | Adotar |

No roteiro: nada muda. Para um vídeo gravado, tirar o palavrão da apresentação do mascote.

### Slide 2, problema

| Nº | Quem | O que disse | Avaliação | Veredito |
|---|---|---|---|---|
| B-03 | Voz 2 | Um número grande, focado na Polymarket ("de 4 a 6 dias"), no lugar de três cartões iguais | Três cartões do mesmo peso não deixam o olho saber o que importa. Certo | Adotar |
| B-04 | Vozes 3 e 4 | O número grande deveria ser um caso de resolução errada com prejuízo gigante | Melhor que "4 a 6 dias", porque é dinheiro perdido e não prazo. **Já há um caso com fonte na pesquisa:** em março de 2025, um mercado de 7 milhões de dólares na Polymarket resolveu SIM sem o fato ter acontecido; um detentor votou com 25% dos votos e não houve reembolso (`knowledge-base/competitors/top-5-competitor-analysis.md`, com CoinDesk e Cointelegraph) | Adotar, com este caso |
| B-05 | Voz 4 | Usar o caso do mercado de que a MicroStrategy venderia Bitcoin | Não está na pesquisa do projeto. Pode ser melhor que o de 7 milhões, mas não entra em slide sem fonte lida | Pesquisar antes |
| B-06 | Voz 4 | Trocar "company key" por "custodial key" | "Custodial" é a chave que guarda o dinheiro do usuário. No World o problema é outro: uma chave da empresa grava o resultado (P2 §3.2). O termo sugerido afirma uma coisa que a pesquisa não diz. "Admin key" ou "operator key" dizem o certo | Não adotar; usar "admin key" |
| B-07 | Voz 4 | Dizer por que é ruim um modelo de linguagem decidir dinheiro | Certo, e cabe em uma frase da fala: "um modelo de linguagem pode ser enganado por uma notícia falsa, e não há a quem recorrer" | Adotar, na fala |
| B-08 | Voz 4 | Tirar a frase do rodapé e deixar só as fontes | A frase repete o que o slide já mostra | Adotar |

No roteiro: a frase "quem tem mais token tem mais voz sobre o seu dinheiro" é a melhor do trecho e fica. Entra o
caso de 7 milhões logo depois dela. O esclarecimento que o fundador deu à banca (06:39), de que a resolução pode ser
rápida e o problema está nas disputas, deve entrar na fala, porque é o que impede alguém de dizer "mas a Polymarket
resolve em minutos".

Efeito no portão de redação do `PITCH.md`: o slide passa a apontar um concorrente com ainda mais força. Por link,
para jurado, serve. Para abrir aos buscadores, segue sendo decisão do fundador.

### Slide 3, solução

| Nº | Quem | O que disse | Avaliação | Veredito |
|---|---|---|---|---|
| B-09 | Vozes 2 e 4 | O parágrafo é longo e repete o título | Cortar para uma linha. A Voz 4 gostou da forma negativa ("if the answer isn't stored..."): manter essa e tirar o resto | Adotar |
| B-10 | Voz 4 | "Wallet-only" e "USDC pools" não diferenciam; só "Auto payout" ajuda. Sugere "no human intervention" | Certo: carteira e USDC todo concorrente tem. Três linhas que só o Brot pode dizer: "No human in the loop", "Anyone can re-check the read" e "Auto payout" | Adotar |
| B-11 | Voz 4 | "Markets", não "questions" (repetido no slide 6) | "Market" é a palavra da categoria, e o jurado pensa nela. No site, para o usuário comum, "question" foi escolha do plano e pode ficar | Adotar no deck |
| B-12 | Voz 2 | Uma demo no lugar do mascote | Certo no princípio: jurado de hackathon pontua o que vê funcionando. **Mas o programa do pote ainda não existe** (é a Sprint 02). O que existe: o protótipo aprovado e o leitor de preço lendo contas reais da rede de testes. Dá para pôr uma tela do protótipo, com o rótulo "prototype", e trocar por gravação real quando houver | Adotar em parte |

### Slide 4, patrocínio

| Nº | Quem | O que disse | Avaliação | Veredito |
|---|---|---|---|---|
| B-13 | Voz 4 | "'O burn vai acontecer' é mercado tosco." Tem de ser meta com número: "o burn vai passar de tanto" | Certo, por três motivos. O projeto controla o resultado, então todo mundo vai no SIM. Pote de um lado só rende taxa quase zero para a casa. E "vai acontecer?" não tem prazo nem medida. Uma meta com número e data divide opinião: "vai queimar mais de 1 milhão de tokens até 30/11?" | Adotar, no slide e na fala |
| B-14 | Voz 4 | Não pode ser qualquer pessoa abrindo qualquer mercado | Já é a regra do plano: a equipe abre as perguntas. Falta estar na tela: "Curated: the team lists every market" | Adotar |
| B-15 | Vozes 2 e 4 | Texto demais | O fluxo em quatro caixas mais três faixas mais uma frase é muita coisa. Com o slide novo de exemplos, este pode ficar só com o fluxo e o preço | Adotar |
| B-16 | Voz 3 | Confusão: "30% aqui e 10% ali?" | A banca não entendeu que são duas receitas. Resolve com uma frase na tela e na fala: "ganhamos de dois jeitos: 10% do lado perdedor em todo mercado, e 30% de cada patrocínio" | Adotar |
| B-17 | Voz 4 | Trocar as três faixas por valor contínuo com piso, e quem põe mais aparece mais alto | Faz sentido econômico: como 70% do patrocínio já vira pote, quem paga mais já tem o pote maior. No slide dá para escrever "from $500" sem mexer em nada. Mudar a regra de preço mexe na Parte 1 (§3.7) e nas projeções da Parte 2 | Slide: adotar. Regra: decisão do fundador |
| B-18 | Voz 4 | "Não gosto de você pegar 30%." Usar os 30% para recomprar e queimar o token, e dizer isso | Contraria decisão registrada. O fundador chegou a querer recompra (rodada de 4/10) e o plano a pôs em espera até o mês 13 (P3 §4.6). O texto do token diz: "ninguém promete preço, recompra, nem que um segundo token vá existir". Prometer recompra no palco é prometer ganho a quem compra o token, que é o que a avaliação jurídica pendente precisa ver antes | Não adotar |
| B-19 | Voz 4 | "Você não pode ter token pro hackathon"; em vez disso, uma taxa fixa em SOL que depois vira token | A primeira parte é uma afirmação sobre o regulamento que não foi conferida. A segunda cria uma promessa de conversão futura, com o mesmo problema da B-18 | Pesquisar antes; não adotar a conversão |

Sobre os 30%: a objeção é legítima mesmo sem token. O jeito de responder é dizer o que os 30% pagam (curadoria da
pergunta, a leitura on-chain, o destaque na página) e pôr na frente os 70% que viram prêmio para a comunidade do
próprio patrocinador. A resposta dada na hora (11:29, "só pra ter mais um jeitinho de ganhar dinheiro") confirma a
desconfiança em vez de desfazê-la.

### Slide 5, modelo de taxa

| Nº | Quem | O que disse | Avaliação | Veredito |
|---|---|---|---|---|
| B-20 | Vozes 2 e 4 | Jogar fora o 3,70% e a tabela. Só "10%", e dizer que varia | O 3,70% deve sair da tela: é modelado, e o plano o chama de sua premissa mais frágil (P1 §3.3); a pergunta "o que é 3,7?" (13:43) mostra que ele confunde. A tabela inteira é pesada, mas ela é a prova de que a taxa é melhor que a fixa. Guardar **uma** linha: com favorito de 99%, a taxa fixa de 3% devolve 0,980 por dólar a quem acertou, e a do Brot devolve 1,009 | Adotar em parte |
| B-21 | Voz 4 | Mostrar para onde vai a taxa: tanto queimado, tanto para a tesouraria | Mostrar o destino é bom. O que o plano tem hoje: 20% da taxa para quem indicou, por 90 dias; do resto, 25% para a tesouraria e 75% para a operação até o ponto de equilíbrio. Não há queima (recompra em espera). O slide mostra isso, sem inventar a parcela queimada | Adotar em parte |
| B-22 | Voz 2 | Juntar tokenomics neste slide | O fundador perguntou à banca se isso não confundiria, e a Voz 4 respondeu que um token lançado no pump.fun "não tem como ser planejado". Juntar duas coisas num slide que já confunde piora. E qualquer texto sobre token espera a avaliação jurídica (P3 §7.1) | Não adotar |
| B-23 | Voz 4 | Em vez de tokenomics, o fluxo do token: onde queima, sem inflação | É o limite certo se um dia houver o que mostrar. Hoje não há queima no plano | Não adotar agora |

### Slide 6, mercado

| Nº | Quem | O que disse | Avaliação | Veredito |
|---|---|---|---|---|
| B-24 | Voz 2 | "Muito ruim", o olho não sabe onde pousar. Fazer TAM, SAM e SOM | É a forma que investidor espera. Dá para montar só com números do plano, sem inventar: setor inteiro, 21,7 bilhões em 30 dias; mercados de cripto, cerca de 0,9 bilhão por mês (estimativa nossa, e a tela tem de dizer); mercado de previsão dentro da Solana, o World com 15,4 milhões em setembro. O fecho vem do plano: as contas empatam com 209 mil por mês, que é 1,4% do que o World já faz (P2) | Adotar |
| B-25 | Voz 4 | "Kalshi on Solana" não é métrica boa: não é on-chain e durou pouco | O dado é de três semanas, lido em janeiro de 2026. Está velho para um slide de outubro. A série do World (1,14; 13,22; 22,20; 15,44 milhões de junho a setembro) é on-chain, é recente e já está no plano | Adotar: trocar pelo World |
| B-26 | Voz 4 | Usar o volume do mercado de previsão da Jupiter | Pode ser o melhor número da Solana hoje. Não está na pesquisa | Pesquisar antes |
| B-27 | Voz 4 | "Crypto markets", não "crypto questions" | Mesma troca da B-11 | Adotar |

### Slide 7, go-to-market

| Nº | Quem | O que disse | Avaliação | Veredito |
|---|---|---|---|---|
| B-28 | Voz 2 | Mostrou o erro dos outros e não como o Brot fica grande | O número grande do slide é a queda de um concorrente. Ele ocupa o lugar que deveria ser do plano de crescimento | Adotar: tirar o destaque |
| B-29 | Voz 4 | O dado da Myriad "não te ajuda" | Vale como uma frase da fala ("não compramos volume com pontos"), não como destaque. Tirar também resolve a ressalva do portão de redação, que pedia trocar os nomes | Adotar |
| B-30 | Voz 4 | Superteam: cada projeto ou membro ganha dois mercados grátis | A melhor ideia concreta da noite. Dá nome e canal aos "20 a 30 parceiros", que hoje são uma intenção. Depende de conversa com a Superteam, e não se anuncia antes de combinar | Adotar como plano; no slide só depois de combinado |
| B-31 | Vozes 2 e 4 | Submeter também ao hackathon do Seeker | Não conferido: regulamento, prazo e se aceita projeto inscrito em outro | Pesquisar antes |
| B-32 | Vozes 2 e 4 | "Ideas from X" é fraco. Ficar em dois tópicos | Sugestão de pergunta pelo X é canal de conteúdo, não de crescimento. Ficam parceiros e indicação | Adotar |
| B-33 | Voz 4 | Um cartão do slide faz o jurado baixar a nota (pelo contexto, o do token no pump.fun) | Coincide com o que o portão de redação já recomendava: tirar o cartão do token até a avaliação jurídica. A fala "só pra fazer barulho, porque é pump.fun" reforça a leitura ruim | Adotar: tirar o cartão e a frase |
| B-34 | Voz 4 | O mais importante é começar com patrocinadores, senão não há mercado | É o risco de partida a frio, e o plano concorda: por isso os parceiros gratuitos. Vale dizer assim, como problema e resposta | Adotar, na fala |

### Slide 8, encerramento

| Nº | Quem | O que disse | Avaliação | Veredito |
|---|---|---|---|---|
| B-35 | Voz 4 | "Legal esse launch limitado. Boa estratégia" | Manter. É o único slide sem pedido de mudança | Manter |

### Sobre o deck inteiro

| Nº | Quem | O que disse | Avaliação | Veredito |
|---|---|---|---|---|
| B-36 | Voz 3 | "Eu não usaria a palavra 'bet' em nada" | Concordo. Bate com o risco já registrado (a medida provisória sobre publicidade de aposta) e com o enquadramento de camada de incentivo. Trocar por "predict", "take a side", "back YES or NO". Trocar a palavra não muda a natureza jurídica do produto: é posicionamento, e não proteção. O site também usa "Bet USDC" | Decisão do fundador |
| B-37 | Voz 2 | O mascote correndo a cada troca de slide tira o foco. Só no primeiro e no último | A animação veio do deck do fundador. Em apresentação ao vivo, oito corridas competem com quem fala | Adotar |
| B-38 | Voz 2 | Falta a equipe: "como vou investir em você se não vi a tua cara?" | Certo para investidor. O plano diz que no hackathon a equipe se apresenta como uma pessoa, e que na prática são três sócios (P4 §6.1). Nome e foto dos sócios pedem o de acordo de cada um | Decisão do fundador |
| B-39 | Voz 2 | Falta falar de concorrentes | O slide 2 já é o de concorrentes, mas a banca não o leu assim. Com o número grande (B-04) e uma linha com as três formas de resolver, ele cumpre o papel. Não precisa de outro slide | Adotar em parte |
| B-40 | Voz 2 | Falta o roteiro ("agora isso, depois isso"), fundido com o go-to-market | Uma linha de três tempos no slide de go-to-market: rede de testes agora; parceiros no lançamento; rede principal só com auditoria e teto. O plano trata o prazo da rede principal como apertado, então o slide não deve prometer data | Adotar |
| B-41 | Voz 2 | Dar pão a cada pessoa da banca antes de começar | Barato, memorável e coerente com a marca | Adotar |
| B-42 | Voz 2 | "Me manda o pitch que eu dou uma olhada e te mando o feedback" | É um pedido, com retorno prometido. Mandar o link do deck | Ação do fundador |

## 5. A fala do fundador: o que ajustar

Não são críticas da banca. São pontos em que o que foi dito diverge do plano, ou deixou a banca confusa.

| Nº | Onde | O que foi dito | O problema | Como dizer |
|---|---|---|---|---|
| F-01 | Roteiro, slide 5 | "Quem acerta sempre ganha" | Não confere com o plano. Em pote de um lado só não há perdedor para pagar o vencedor: quem acerta recebe de volta o que pôs, e quem entrou depois do primeiro ainda paga 1% (P1 §3.4). Ver a nota abaixo, que também corrige o slide | "A taxa sai do lado que perdeu" |
| F-02 | Sabatina, 14:09 | "Essa é a fórmula da Polymarket que a gente vai copiar mesmo" | Está errado e derruba o diferencial do slide. A Polymarket cobra por uma fórmula sobre o preço, em média 2,0% dos dólares pagos; o Brot cobra 10% do lado perdedor (P2 §3.2) | "A nossa é diferente da deles: 10% só do lado que perdeu" |
| F-03 | Sabatina, 13:26 | "10% é nosso. Só que não é 10%, não; é 10% balanceado" | Ninguém entendeu, e a pergunta seguinte foi "o que é 3,7?" | "10% do lado que perdeu. Num pote meio a meio, isso dá 5% do pote. Num 90 a 10, se o favorito vence, dá 1%; na média, 1,8%" (P1 §3.3, tabela 2) |
| F-04 | Sabatina, 11:29 | "Só pra ter mais um jeitinho de ganhar dinheiro" | Responde a uma dúvida sobre os 30% confirmando a desconfiança | "Os 30% pagam a curadoria e o destaque. Os 70% viram prêmio para a comunidade de quem patrocina" |
| F-05 | Sabatina, 14:56 | "A ideia é depois fazer um token realmente bonitinho" | É promessa de segundo token, que o texto do plano manda não fazer | Não falar de token futuro. Se perguntarem: "o token é só marca, não dá direito a nada" |
| F-06 | Roteiro, slide 7 | "Token no pump.fun só pra fazer barulho, porque é pump.fun" | Convida a leitura que a Voz 4 apontou | Sai junto com o cartão (B-33) |
| F-07 | Roteiro, slides 4 e 5 | "A queima vai acontecer?" e "treta gera FOMO, FOMO gera aposta" | A primeira é o mercado fraco da B-13. A segunda junta "aposta" e FOMO, o oposto do que a B-36 pede | Meta com número e prazo. "Pergunta que divide opinião é a que enche o pote" |
| F-08 | Tempo | A apresentação levou cerca de 5 minutos e 15 segundos | O limite do vídeo do hackathon não foi conferido. Com os improvisos, o tempo passa do roteiro | Conferir o limite e cortar para caber |

**Nota sobre a F-01: o slide 5 também exagera, e o erro é de quem o revisou.** Nas duas revisões do deck o título
do slide 5 foi trocado de "so winners always profit" para "so being right never costs you". A troca melhorou a
frase e não a deixou exata. Pelo exemplo do próprio plano (P1 §3.4): num pote em que ninguém apostou no NÃO, Bruno
põe 200 no SIM, o SIM vence e ele recebe 198. Acertar custou 2 a ele. É um caso raro, e a regra do 1% existe por um
bom motivo, mas a frase diz "never". O mesmo vale para "ninguém perde por acertar", que o plano usa em §3.3 como
motivo da escolha da taxa, antes de abrir a exceção em §3.4.

A saída é o slide e a fala dizerem a regra, e não uma garantia: **"The fee comes out of the losing side."** É
verdade em todo pote com dois lados, e não promete nada sobre o pote de um lado só. Entra na terceira versão se o
fundador concordar, e a frase do plano fica para a passada de coerência.

## 6. O que não adotar, reunido

1. **Recompra e queima do token com os 30% (B-18).** O plano tirou a recompra do lançamento, e o texto do token diz
   que ninguém a promete. Reabrir isso é mudar a Parte 3 e passa pela avaliação jurídica.
2. **"Custodial key" (B-06).** Diz uma coisa que a pesquisa não sustenta. "Admin key" diz o certo.
3. **Exemplos com holders, carteiras ativas e TVL (seção 3).** O programa não lê nenhum deles, e usá-los contradiz o
   slide 2.
4. **Tokenomics no slide de taxa (B-22).** Junta dois assuntos num slide que já confunde.
5. **Taxa fixa em SOL que vira token depois (B-19).** É promessa de token futuro.

Nos cinco casos a banca aponta um problema real. O que não se adota é a solução sugerida.

## 7. Como melhorar além do que a banca pediu

1. **Abrir pelo caso, e não pela categoria.** A primeira frase depois da capa pode ser o caso de 7 milhões: "em
   março de 2025, um mercado de 7 milhões de dólares pagou o lado errado, e ninguém foi reembolsado". A banca pediu o
   número no slide; ele rende mais como abertura da fala.
2. **Uma frase para o que o Brot é.** "On-chain KPI markets: projects put money behind their own promises, and the
   chain settles." Ela atende a crítica central sem abandonar "prediction market", que é o nome da categoria e o
   termo dos números do slide de mercado.
3. **Dizer o que ainda não está pronto.** O lema é "Proof > Promises". Uma linha honesta ("on devnet, test tokens,
   not audited") combina com o lema e resolve a ressalva do portão de redação: hoje nenhum slide diz que é fase de
   testes.
4. **Preparar as três respostas que faltaram.** Como a taxa funciona (F-03), por que 30% do patrocínio (F-04) e o
   que é o token (F-05). Foram as três perguntas em que a resposta saiu pior que o slide.
5. **Mostrar a leitura on-chain acontecendo.** O leitor de preço da Sprint 01 já lê contas reais da Pyth na rede de
   testes. Uma tela com a conta, o valor lido e o endereço que qualquer um pode conferir é demonstração real do
   diferencial, antes de o pote existir.

## 8. Proposta de estrutura para a terceira versão

Nove slides. Entra um, e nenhum some: o que muda é o conteúdo de cada um.

| Nº | Slide | O que muda |
|---|---|---|
| 1 | Capa | Subtítulo sem "parimutuel"; sem o selo do hackathon; mascote animado aqui |
| 2 | Problema | Número grande: 7 milhões pagos ao lado errado. Embaixo, uma linha com as três formas de resolver: voto de token, admin key, LLM. Só as fontes no rodapé |
| 3 | Solução | Uma linha de texto. Três diferenças: sem humano no meio, qualquer um reconfere, pagamento automático. Tela do protótipo, com rótulo |
| 4 | **Novo: como é um mercado do Brot** | Três ou quatro exemplos, só dos tipos que o programa lê: preço do SOL até uma data; queima acima de X até uma data; liquidez travada na Meteora até uma data; pool de staking acima de N. A frase da seção 7, item 2 |
| 5 | Patrocínio | O fluxo em quatro passos, com a meta com número. "From $500, 70% becomes the prize." "Curated: the team lists every market" |
| 6 | Como ganhamos | "10% of the losing side", grande, com "the fee comes out of the losing side" no lugar de "never costs you". As duas receitas numa frase. Uma linha de comparação (99%: 0,980 contra 1,009). Para onde a taxa vai |
| 7 | Mercado | TAM, SAM e SOM com os números do plano, e o fecho de 1,4% do World |
| 8 | Crescimento e roteiro | Dois canais: parceiros de lançamento e indicação. Uma linha de três tempos |
| 9 | Encerramento | Como está, com a equipe se o fundador decidir. Mascote animado aqui |

## 9. O que não foi conferido

| Ponto | Por que importa |
|---|---|
| O caso da MicroStrategy na Polymarket (B-05) | Pode substituir o de 7 milhões no slide 2 |
| O volume do mercado de previsão da Jupiter (B-26) | Pode ser o melhor número da Solana para o slide 7 |
| Se o regulamento do hackathon proíbe token (B-19) | Decide o que se pode dizer sobre o token |
| O limite de tempo do vídeo do hackathon (F-08) | Decide quanto cortar da fala |
| O hackathon do Seeker: regra e prazo (B-31) | Decide se vale uma segunda inscrição |
| Os nomes das Vozes 2, 3 e 4 | A gravação não os traz de forma confiável |
| Trechos marcados `[?]` na transcrição | Em especial a fala das 20:52, sobre o que faz o jurado baixar a nota |

## 10. Recomendação

**Montar a terceira versão do deck como prévia, fora do ar, para o fundador revisar antes de trocar o que está em
`/pitch`.** Entram os itens marcados "adotar" e "adotar em parte", o slide novo de exemplos e o roteiro de fala
corrigido. Os slides 2 e 7 usam o que a pesquisa já tem (o caso de 7 milhões e a série do World), então a versão não
espera pesquisa nova; se a pesquisa trouxer algo melhor, troca-se depois.

O porquê: as quatro mensagens de maior peso da banca têm resposta dentro do que o plano já decidiu. Nenhuma pede
mudança de regra. Com o prazo do hackathon em 12/10/2026, que o fundador confirmou, o que mais rende é refazer a
forma de contar agora e deixar as mudanças de regra para depois.

**Decisões que só o fundador toma:**

1. A palavra "bet" sai do deck? E do site? (B-36)
2. O slide de equipe: com quem, e com foto? (B-38)
3. O patrocínio no slide: três faixas ou "from $500"? E a regra de preço, muda? (B-17)
4. O cartão do token sai do deck? (B-33)
5. Os nomes de concorrentes no slide 2, agora com um caso de prejuízo. (B-04 e o portão de redação)
6. O título do slide 5: trocar "so being right never costs you" por "the fee comes out of the losing side"? (nota
   da F-01)

**Ações do fundador:** mandar o link do deck à Voz 2, que pediu (B-42); falar com a Superteam (B-30).
