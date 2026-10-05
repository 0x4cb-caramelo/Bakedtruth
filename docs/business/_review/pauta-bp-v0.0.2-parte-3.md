# Pauta — BP v0.0.2, Parte 3: Tokens

Roteiro para o redator da Parte 3. O arquivo a escrever é `docs/business/BP-v0.0.2-parte-3-tokens.md`.

Tamanho: **entre 9.000 e 12.000 palavras**. O teto é duro. O fundador reclamou do tamanho da v0.0.1 ("115 páginas foi
exagero") e pediu partes de 20 a 30 páginas.

## 1. Decisões do Lucas que governam a Parte 3

Trechos entre aspas são palavras dele. Tudo aqui entra no texto como **Decisão**, nunca como proposta.

| # | Assunto | Decisão | Citação |
|---|---|---|---|
| 1 | Dois tokens | Um no pump.fun (token A) e um desenhado pela empresa, com venda privada (token B) | A: "é expeculativo, e vamos usar para pumpar mesmo e tudo bem". B: "ico privado mais robusto", "aí a gente tem liberdade para desenhar ele" |
| 2 | Papel do token A | Canal de tração, sem vínculo com a empresa | "não vamos vincular o token A com a nossa empresa ... ele é um marketing com grandes limitações ... porém será importante para servir de canal de tração para pessoas conhecerem e irem visitar a nossa plataforma" |
| 3 | Taxa de criador do token A | Vai inteira para o fundo de prêmios das perguntas | "muito interessante se for possível fazer com que o token A possa ser usado ... para alimentar as nossas pools"; sobre os 100%: "perfeito" |
| 4 | Ponte entre os dois | Quem tem A pode queimá-lo para comprar B com desconto. Opcional e com teto | "excelente, sim. Vamos partir desse desenho"; o objetivo é "criar essa utilidade ao token A, e ele não ser descartável" |
| 5 | Descontos para quem tem B | Por faixa de quantidade e por tempo | "quem holdar poder ter descontos por faixas de quantia do nosso token holdado, e por tempo, quanto mais tempo maior o desconto" |
| 6 | Como medir o tempo | Staking com trava | "isso" |
| 7 | Voto | Quantidade vezes tempo, no próprio token B. Sem token separado de governança | "o próprio hold da moeda x tempo pode tbm servir como poder de voto em governança, ao invés de inventarmos de ter uma moeda própria para governança" |
| 8 | O que se vota | Começa por quais perguntas abrir. Fase 2, depois do lançamento do B | "isso, e depois vamos pensando melhor o que poderemos oferecer, mas tbm será numa fase 2, não no início" |
| 9 | O que o voto nunca decide | O resultado de uma pergunta | Sobre voto por token em disputa: "é justamente neste ambiente que ocorre a manipulação dos resultados" |
| 10 | Cofre de quem faz staking do B | Recebe parte do lucro da empresa, só depois do equilíbrio | "uma parte dos lucros a gente redistribuir para este pool/vault daqueles que estiverem holdando o nosso token b"; "vamos pensar jeitos de fazer isso para nos beneficiar economicamente" |
| 11 | O que alimenta as pools das perguntas | Uma fatia das recompensas em USDC. Nunca o token B que está em staking | "perfeito" |
| 12 | A ideia antiga dos 30% de cada compra do token | Abandonada | "definitivamente ele não está funcionando" |
| 13 | Recompra e queima do B | Em espera | "só faríamos isso com caixa da empresa a partir do mês 13, não antes"; "deixar como decisão a ser tomada no futuro" |
| 14 | Ordem | Token A quando o produto estiver utilizável. Token B depois do equilíbrio | De acordo |
| 15 | Distribuição do B | Parte da proposta do sócio (Ronaldo, o CTO) | De acordo |
| 16 | Destino da taxa da plataforma | 25% tesouraria em Bitcoin, 75% operação, até o equilíbrio. Depois dele voltam à mesa: fundo de prêmios, recompra e repasse | "25% da taxa para treasure e todos os demais 75% para a operação" |

Ele pediu, sobre o cofre (decisão 10), "mais recomendações sobre o que é saudável para a empresa". A Parte 3 precisa
responder a isso com números.

## 2. Fatos e números já levantados

### 2.1 O pump.fun (FATO, lido na documentação e conferido na rede em out/2026)

- Todo token nasce com 1 bilhão de unidades; 793,1 milhões ficam na curva de venda.
- De cada compra na curva, 98,75% vão para a reserva da curva.
- Taxa de criador: 0,30% enquanto o token está na curva; de 0,05% a 0,95% depois que ele sai dela.
- A taxa de criador pode ser dividida entre até 10 carteiras. A divisão é definida uma única vez.
- O programa de recompensas a detentores do pump.fun, uma vez ligado, não desliga.
- Os tokens novos do pump.fun usam o padrão Token-2022: 7 de 7 amostrados na rede principal. Os leitores do programa
  atual só leem o padrão clássico. Por isso não dá, hoje, para abrir pergunta sobre o próprio token A.

### 2.2 Quanto a taxa de criador do token A pode render (INFERÊNCIA; o volume é hipótese)

| Volume negociado do token A por dia | A 0,05% | A 0,30% | A 0,95% |
|---|---|---|---|
| 10.000 | 150 por mês | 900 por mês | 2.850 por mês |
| 50.000 | 750 por mês | 4.500 por mês | 14.250 por mês |
| 250.000 | 3.750 por mês | 22.500 por mês | 71.250 por mês |

Ninguém sabe qual volume o token A terá. A maioria dos tokens do pump.fun morre em dias. A pesquisa tem os dados.

### 2.3 O que sobra para repartir (INFERÊNCIA; modelo da Parte 2, taxa de 10% do lado perdedor, média de 3,70%)

"Resultado" é o que sobra no mês depois do custo de 5.500 e do fundo de prêmios.

| Cenário razoável | Volume | Taxa | Resultado do mês | Caixa acumulado |
|---|---|---|---|---|
| Mês 13 | 375.000 | 13.875 | 1.667 | −25.225 |
| Mês 18 | 487.500 | 18.038 | 3.592 | −11.114 |
| Mês 21 | 600.000 | 22.200 | 5.518 | 5.439 |
| Mês 24 | 712.500 | 26.363 | 7.443 | 27.767 |

No cenário razoável a operação se paga no mês 9, mas o caixa acumulado só fica positivo no mês 21. No segundo ano
inteiro: volume de 6.525.000, taxa de 241.425, resultado somado de 54.659, fundo de prêmios de 60.356.

| Fatia do resultado do ano 2 repassada ao cofre | Razoável: no ano | Razoável: por mês | Otimista: no ano | Otimista: por mês |
|---|---|---|---|---|
| 10% | 5.466 | 455 | 64.813 | 5.401 |
| 20% | 10.932 | 911 | 129.627 | 10.802 |
| 30% | 16.398 | 1.366 | 194.440 | 16.203 |

Leitura honesta: no cenário razoável, o repasse é de centenas de dólares por mês. Isso não sustenta um token. No
cenário ruim não há resultado para repartir.

Custo do desconto na taxa (decisão 5), como ilustração: se 20% da taxa vier de apostadores com desconto médio de
25%, a casa abre mão de 5% da taxa. No ano 2 do cenário razoável, 12.071 dólares.

### 2.4 Regulação (ver `_review/wave-2-compliance.md` e `knowledge-base/market/regulacao.md`)

Repasse de resultado a quem segura um token e recompra são os desenhos que reguladores examinam. A pesquisa registra
que GMX e Gains suspenderam os deles em 2026. O fundador informou que faz a avaliação jurídica ele mesmo ou com
colegas, sem custo. A Parte 3 aponta os pontos que essa avaliação precisa olhar; não dá parecer.

## 3. Uma tensão que a Parte 3 precisa dizer com clareza

A decisão 2 diz que o token A não tem vínculo com a empresa. As decisões 3 e 4 criam dois vínculos de fato: a taxa de
criador do A cai no fundo de prêmios da plataforma, e o A queimado compra o B com desconto. As três decisões são do
fundador e ficam. O texto deve:

1. Dizer o que "sem vínculo" quer dizer na prática: o A não dá direito a receita, a voto nem a conversão garantida; a
   receita da plataforma não compra nem sustenta o A; a empresa não promete preço.
2. Dizer quais são os dois vínculos que existem e por que o fundador os quer.
3. Registrar como objeção, com a alternativa: quanto mais o A servir para obter o B, mais ele se parece com um
   direito sobre o B. É o primeiro ponto da avaliação jurídica.

## 4. Propostas que a Parte 3 leva ao fundador

Cada uma entra como **Proposta, aguardando decisão**, com contexto, um exemplo em dinheiro, as opções e a
recomendação. O fundador reclamou três vezes de propostas "sem contexto". Antes de cada proposta, uma frase diz o
que está sendo decidido e por que é uma decisão. Os números abaixo são ponto de partida; o redator pode ajustar se a
pesquisa indicar outro, dizendo o motivo.

| # | O que decidir | Ponto de partida |
|---|---|---|
| 1 | O que "sem vínculo" quer dizer na prática para o token A: quem lança, de qual carteira, o que é dito no dia | A equipe lança, compra na curva como qualquer um, declara a carteira e trava o que comprou por 12 meses. Texto do dia: o A é um memecoin, não dá direito a nada, e existirá um token B |
| 2 | Faixas de trava do staking do B e peso de cada uma | 1, 3, 6 e 12 meses, com pesos 1, 1,5, 2 e 3. O peso vale para desconto, voto e parte no cofre |
| 3 | Tabela de desconto na taxa para quem tem B em staking | Quatro faixas por quantidade ponderada pelo peso: 10%, 20%, 30% e 40% de desconto. Teto de 40% |
| 4 | Quanto do resultado vai ao cofre, e a partir de quando | 20% do resultado do mês. Só começa quando o caixa acumulado estiver positivo e houver seis meses de custo guardados (33.000 dólares). No cenário razoável isso é perto do mês 24 |
| 5 | A fatia das recompensas que alimenta as pools das perguntas | De tudo que for ao cofre, 20% vão para o fundo de prêmios |
| 6 | A ponte: tamanho do desconto e teto da queima | 20% de desconto; no máximo 30% de cada compra de B paga com A queimado; no total, até 10% da oferta do B sai por esse caminho. O A é avaliado pela média de preço de 7 dias |
| 7 | Distribuição e travas do B | A tabela da pesquisa (`dois-tokens-e-ico-privado.md`, seção 6.2), com a fatia de 10% de "detentores do A" trocada pela ponte da proposta 6 |
| 8 | Quando acontece a venda privada | O B só é lançado depois do equilíbrio. A venda privada pode vir antes do lançamento ou junto. A recomendação pesa o que o comprador da venda recebe e quando |

No máximo oito propostas. Se alguma puder ser fundida, funda.

## 5. Roteiro da Parte 3

| Capítulo | Conteúdo | Palavras |
|---|---|---|
| Cabeçalho | Como ler (as mesmas convenções das Partes 1 e 2) e o que mudou desde a v0.0.1 | 250 |
| 1. Resumo | Os dois tokens em uma página: o que cada um é, o que está decidido, o que falta, o calendário | 800 |
| 2. Por que dois tokens | O problema que cada um resolve. Os casos de dois tokens que a pesquisa achou e o que aconteceu com cada um, em tabela curta | 1.000 |
| 3. O token A | O que é o pump.fun em linguagem simples; o papel do A; a taxa de criador indo ao fundo de prêmios e quanto pode render; o que "sem vínculo" quer dizer; o que dizer a quem compra; os riscos | 1.800 |
| 4. O token B | Para que serve; staking com trava; descontos; voto; o cofre e o que é saudável repassar; o que alimenta as pools; recompra em espera; distribuição e travas | 3.200 |
| 5. A ponte entre os dois | Queimar A para comprar B: como funciona, um exemplo em dinheiro, as consequências prováveis, os casos parecidos | 1.200 |
| 6. Ordem e calendário | A com o produto utilizável; B depois do equilíbrio; o que acontece em cada cenário da Parte 2, inclusive no ruim | 800 |
| 7. Regulação e riscos | O que a avaliação jurídica precisa olhar, em lista; os riscos de mercado e de reputação | 1.000 |
| 8. Decisões pendentes e objeções | A tabela das propostas e as objeções da v0.0.1 que tocam os tokens, com a situação de cada uma | 1.200 |

Total: cerca de 11.250 palavras.

## 6. O que ler antes de escrever

Leia com `cat` pelo Bash; a ferramenta Read devolve só a primeira linha destes arquivos.

1. `docs/business/ideacao-perguntas-e-respostas.md`, seção 1 inteira. É a fonte da verdade.
2. `docs/business/_review/correcoes-bp-v0.0.2-partes-1-e-2.md`. As decisões mais recentes e o modelo financeiro.
3. `docs/business/BP-v0.0.2-parte-1-produto.md`: o cabeçalho (para copiar as convenções), o capítulo 1 e a seção 2.4.
4. `docs/business/BP-v0.0.2-parte-2-mercado-e-negocio.md`: capítulo 1 e seções 4.5 a 4.7 (fundo de prêmios,
   tesouraria, recompra) e 6.3 (o papel do token A).
5. `knowledge-base/market/dois-tokens-e-ico-privado.md`, inteiro. É a pesquisa principal desta parte. **Atenção:** a
   seção 6 dela é anterior a várias decisões da tabela 1 (por exemplo, previa recompra desde o início e uma fatia de
   10% do B para quem segura o A). Vale a tabela 1 desta pauta.
6. `knowledge-base/market/modelos-de-token.md`, inteiro.
7. `knowledge-base/market/monetizacao-e-tesouraria.md`: só o que tocar recompra, repasse e tesouraria.
8. `docs/business/_review/wave-2-compliance.md`: o que tocar tokens.
9. `docs/business/_review/BUSINESS-PLAN-v0.0.1.md`, capítulo 8 (linhas 2208 a 2577): a versão anterior, para saber o que existia e
   quais objeções (OBJ-11, OBJ-12 e vizinhas) foram registradas. `docs/business/_review/wave-3-coordinator.md` tem a
   lista completa das objeções; procure por "OBJ-" e por "token".

## 7. Regras de escrita

- Português simples, frases diretas, para quem não é da área. Todo termo técnico vem explicado na primeira vez em que
  aparece: staking, trava, curva de venda, taxa de criador, queima, recompra, venda privada, liberação gradual.
- Toda regra tem um exemplo com números. Confira as contas com `node -e`.
- **Decisão.** com a citação entre aspas para o que o fundador decidiu. **Proposta, aguardando decisão** para o que
  este documento sugere. Números de fora com etiqueta: FATO, FATO SECUNDÁRIO ou INFERÊNCIA, com a fonte.
- Não invente fato, número, caso, citação nem decisão. Se a pesquisa não tem o dado, diga que não tem.
- A visão do fundador é a espinha do texto. Quem discorda registra a objeção ao lado, com evidência e alternativa,
  sem mudar a decisão.
- Diga o custo e o risco de cada desenho. Em especial: staking sozinho não gera ganho, o dinheiro vem da receita
  repassada ou de tokens novos; e, no cenário razoável, o repasse é pequeno.
- Sem travessões longos no meio da frase, sem frases de efeito, sem "não é X, é Y".
- Nada de promessa de preço para nenhum dos dois tokens, nem no texto do plano.
