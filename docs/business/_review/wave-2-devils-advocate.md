# Onda 2, agente 2A: advogado do diabo

Data: 4 de outubro de 2026.

Papel deste relatório: atacar as premissas do produto e do modelo do Baked Market e, para cada objeção, propor uma
correção concreta. Não mudo nenhuma decisão do Lucas. Onde discordo, digo que discordo, mostro o motivo e deixo a
alternativa para ele decidir.

Como ler:

- **FATO**, **FATO SECUNDÁRIO** e "não encontrado" vêm dos arquivos da Onda 1, com a marca que cada arquivo deu. Não
  fiz pesquisa nova na web: este relatório ataca o plano com o que a própria Onda 1 achou.
- **INFERÊNCIA** é raciocínio meu. Toda conta deste arquivo é minha e está mostrada para ser conferida.
- Severidade: **crítica** (derruba o negócio ou expõe a equipe se não for tratada antes da rede principal), **alta**
  (compromete o lançamento ou a confiança), **média** (custa dinheiro ou tempo), **baixa** (incômodo).
- Não opino sobre o que a lei permite. Os pontos jurídicos estão escritos como "ponto para advogado".

## Resumo em dez linhas

1. A premissa central não tem prova: a Onda 1 não achou nenhum mercado aberto sobre queima, renúncia ou trava de
   tokens de terceiros, em nenhuma plataforma, e escreveu "demanda direta pelo recorte: não demonstrada".
2. O produto é único onde não há demanda medida (fatos on-chain de token) e é mais um onde há demanda (preço de
   cripto), e ali chega com um mecanismo pior para prazo curto: fechamento mínimo de 24 horas antes do fim.
3. "Sem oráculo" responde a uma queixa real do setor, mas a queixa é de mercados subjetivos, que o Baked não terá. Nos
   tipos em que o dono de uma chave decide o resultado, "ninguém decide" é falso: decide o dono da chave.
4. Patrocinador anônimo, que controla o resultado e pode apostar num lado, é a combinação que os líderes proíbem. O
   Lucas recusou a restrição proposta no briefing. É o maior risco de reputação do plano.
5. A taxa de 3% sobre o pote inteiro torna o favorito inapostável: com 97% do pote num lado, quem acerta recebe
   exatamente o que pôs. Fatos on-chain costumam ser desequilibrados; o pote só funciona perto de 50 a 50.
6. A divisão 25/25/25/25 deixa 0,75% do volume para pagar a operação. Com o custo de US$ 25 mil do `ECONOMICS.md`, o
   equilíbrio pede US$ 3,33 milhões apostados por mês: 22% do que o World faz dentro da Phantom.
7. A concorrência não é terreno vazio. Melee tem US$ 3,5 milhões e não lançou; PNP parou; Limitless caiu 96%; o World,
   com 15 a 20 milhões de usuários de carteira ao lado, faz US$ 15 milhões por mês. O sinal é de nicho pequeno.
8. A saída antecipada no MVP não tem precedente, não entrega o "ganho" que o Lucas descreveu e usa três parâmetros
   sem referência. É o item de maior risco técnico com o menor retorno comprovado.
9. Equipe brasileira, sem identificação do usuário, com token "para pumpar" e jurisdição adiada: a Resolução CMN
   5.298/2026 e a Nota Técnica 2958 da Fazenda existem e miram exatamente esse tipo de produto. Ponto para advogado.
10. Continuam de pé: a leitura on-chain (é real e única entre os cinco), o pote como mecanismo que não quebra, a
    equipe abrindo as perguntas, o USDC, a taxa dentro da faixa do setor e o código de resolução já pronto.

## 1. Quadro das objeções

| # | Objeção em uma frase | Severidade |
|---|---|---|
| O1 | Ninguém demonstrou que o público web3 quer apostar em fatos lidos on-chain | Crítica |
| O2 | Onde o produto é único não há demanda medida; onde há demanda ele é mais um, e com fechamento lento | Alta |
| O3 | "Sem oráculo" é virtude que o engenheiro vê; o apostador vê outra coisa | Alta |
| O4 | Não há fonte de perguntas interessantes toda semana, e só 3 dos 8 exemplos têm leitor pronto | Alta |
| O5 | Pote sem retorno conhecido, dinheiro parado por semanas e multa de 3% para quem aposta primeiro | Alta |
| O6 | Taxa de 3% sobre o pote inteiro inviabiliza qualquer pergunta desequilibrada | Alta |
| O7 | Não há motivo demonstrado para alguém pagar US$ 500 a 5.000 numa plataforma sem audiência | Alta |
| O8 | Patrocinador anônimo que controla o resultado e aposta num lado transforma o produto em golpe com recibo | Crítica |
| O9 | Saída antecipada no MVP: sem precedente, sem ganho, com parâmetros no escuro | Alta |
| O10 | Token "para pumpar" numa casa de apostas corrói a única coisa que ela vende: confiança | Alta |
| O11 | Os concorrentes parados são sinal de nicho pequeno, e a conta de equilíbrio não fecha nesse nicho | Crítica |
| O12 | Brasil: equipe identificável, regra nova contra o setor, sem identificação e sem jurisdição escolhida | Crítica |
| O13 | Resolução por cron: se o serviço da equipe falha, o SIM verdadeiro vira NÃO, para sempre | Alta |
| O14 | Nove contradições entre as próprias decisões do fundador | Média a alta |
| O15 | O escopo do "MVP" é o de um produto maduro, depende de um sócio que ainda não respondeu e não cita auditoria | Alta |
| O16 | Parte da Onda 1 foi escrita sem ler as decisões do Lucas; há números que não devem ir ao BP | Média |
| O17 | O nome carrega a gíria errada para uma casa cujo risco é resultado arranjado | Baixa |

## 2. As objeções em detalhe

### O1. A demanda pelo recorte não foi demonstrada

**Objeção.** O plano inteiro parte de "o público web3 quer apostar em fatos que a própria chain decide", e nenhum dado
da Onda 1 sustenta isso.

**Evidência.**

- `publico-web3.md`, seção 6: "Mercados de queima, renúncia de autoridade, trava de liquidez, formatura: não encontrei
  nenhum aberto em qualquer plataforma" e "Demanda direta pelo recorte: **não demonstrada**". A ressalva do próprio
  agente: "A ausência pode ser falta de procura ou falta de ferramenta; não dá para distinguir".
- Mesma seção: todos os mercados sobre o pump.fun no Polymarket somam cerca de US$ 262,81 mil (FATO SECUNDÁRIO, sem
  data), e são sobre o token PUMP, não sobre fatos on-chain de tokens de terceiros.
- `publico-web3.md`, seção 2: no Polymarket, em maio de 2026, esporte foi 39% a 40% do volume, política 32% e cripto
  20% (FATO SECUNDÁRIO). "Fatos de projeto de token não aparecem como categoria relevante" (INFERÊNCIA do agente 1D).
- `top-5-competitor-analysis.md`, seção 8: "A fatia do volume atual que caberia na nossa regra: n/e, e certamente
  pequena".
- `publico-web3.md`, seção 3: os quatro perfis de usuário são suposição, "sem fonte verificada"; nenhuma entrevista.
- `publico-web3.md`, seção 1: a receita diária do pump.fun caiu de US$ 4,8 milhões para US$ 800 mil em seis meses e a
  taxa de formatura foi a 0,26%. O público que se quer alcançar está encolhendo em 2026.

**Cenário de falha.** O programa é reescrito, auditado e lançado. As perguntas abrem e recebem dezenas de dólares.
Conta de ordem de grandeza (INFERÊNCIA): se o Baked capturasse **todo** o volume que o Polymarket já teve em mercados
ligados ao pump.fun, a taxa de 3% renderia US$ 7.884 no total (262.810 × 0,03), não por mês. Com potes minúsculos, o
pote de um lado só vira regra, e a regra dele é devolver cobrando taxa (ver O5).

**Severidade.** Crítica.

**Correção proposta.** Testar a demanda antes de reescrever o programa, com critério escrito de continuar ou parar:

1. Dez a quinze conversas com gente dos quatro perfis da seção 3 de `publico-web3.md`, com a pergunta "em qual destas
   dez perguntas você poria 20 dólares hoje?". Custo: uma semana.
2. Um beta com pontuação, sem dinheiro, como o Melee fez (fila de 49 mil pessoas, FATO em `top-5`, seção 1.2), usando
   os leitores que já existem. Mede quais tipos de pergunta atraem carteiras.
3. Só então a rede principal, com teto de pote baixo por quatro semanas.
4. Três números para decidir, fixados antes (os valores são proposta minha, a calibrar pelo agente 2E): carteiras
   distintas de fora da equipe por pergunta; parcela que volta para uma segunda pergunta sem prêmio; e a relação
   entre o dinheiro posto por apostadores e o posto por prêmio ou patrocínio.

### O2. Único onde não há demanda, comum onde há

**Objeção.** Para ter o que o público aposta, o Baked precisa de pergunta de preço; e em preço ele deixa de ser único
e passa a competir com um mecanismo mais lento.

**Evidência.**

- `saida-fechamento-cron-e-perguntas.md`, seção 4.5: "Se o lançamento vier antes dos leitores novos, o primeiro dia
  tem só as perguntas 4, 5 e 7, que não são o que o público mais aposta". As perguntas de preço dependem de um leitor
  novo, da Pyth.
- Mesma fonte, seção 5, item 8: "'Sem oráculo' deixa de ser verdade com preço pela Pyth".
- Em preço de cripto de prazo curto já operam: Polymarket (mercados de 5 e 15 minutos e 4 horas), Limitless (por hora,
  dia e semana), Melee (mercados de SOL de 5 minutos no beta) e PancakeSwap (rodadas de 5 minutos). Fontes: `top-5`,
  seções 1.3, 3.5 e 5.1; `saida-fechamento`, seção 2.2.
- Decisão do Lucas: fechamento em 80% da duração, com mínimo de 24 horas antes do fim; menos que isso só como "opção
  avançada", com dupla confirmação e registro.

**Cenário de falha (INFERÊNCIA).** Com mínimo de 24 horas fechado, uma pergunta de dois dias fica um dia aberta e um
dia parada. Pergunta de um dia não existe sem a opção avançada. O perfil "trader de memecoin" quer "giro rápido,
retorno em minutos" (`publico-web3`, seção 3, suposição). O produto que esse público usa vira, no Baked, a exceção que
exige duas assinaturas da equipe a cada pergunta. O resultado é um cardápio de perguntas longas, de desfecho raro,
para um público de prazo curto.

**Severidade.** Alta.

**Correção proposta.** Escolher de propósito, e escrever no BP, qual das duas posições o Baked ocupa:

- **Posição A, especialista:** fatos on-chain de token como assinatura, preço só de "toque" em prazo de semanas, e
  aceitar que o mercado é pequeno. Exige a prova de demanda de O1.
- **Posição B, generalista de cripto:** séries curtas de preço como produto principal. Exige trocar a dupla
  confirmação por pergunta por uma aprovação única de **modelo de série** (por exemplo, "SOL toca X em 24 horas",
  aprovado uma vez por duas chaves e depois aberto todo dia pelo serviço). Mantém o controle que o Lucas pediu, com o
  registro de quem aprovou o modelo, sem travar a operação.

Não recomendo misturar as duas sem dizer qual paga as contas.

### O3. "Sem oráculo" é virtude de engenheiro

**Objeção.** O apostador não compra "leitura direta de conta"; compra pergunta interessante, retorno e saque rápido.

**Evidência.**

- A favor do diferencial (`top-5`, seção 8): a queixa mais documentada do setor é a resolução, com mais de 1.150
  mercados em arbitragem no Polymarket até maio de 2026 e um caso de US$ 7 milhões sem reembolso.
- Contra: essas disputas são de mercados que dependem de interpretação (acordo entre países, "aquisição"). O Baked não
  terá esses mercados. Nos mercados de preço, os concorrentes já resolvem de forma automática, e a queixa ali não é o
  oráculo, é a manipulação: US$ 8,2 milhões ganhos em janelas de liquidação dos mercados de 5 minutos (`top-5`, 3.5).
  O mesmo arquivo conclui: "Não é escudo contra manipulação" e "Pode ser copiado".
- O World grava o resultado com uma chave da empresa, sem prova, e ainda assim fez US$ 15,44 milhões em setembro de
  2026 (`top-5`, seções 4.5 e 4.9). Centralização não impediu o uso.
- `saida-fechamento`, seção 4.1: em quatro dos nove tipos (renúncia de emissão, renúncia de congelamento, programa
  imutável, metadados) "uma pessoa decide o resultado de graça" e "quem aposta contra o dono da chave está doando".
- `ideacao`, seção 1: sobre a explicação dos tipos de pergunta, o próprio dono do produto respondeu "não entendi
  nada". Se o diferencial precisou de três rodadas de explicação para o fundador, não vai caber numa linha para o
  apostador (INFERÊNCIA).
- A confiança que sobra não é "em ninguém": é na equipe, que escolhe a conta, o alvo e a data, aprova prazos curtos e
  roda o cron (O13). O `ECONOMICS.md` do sócio previa revogar a chave de atualização do programa; o plano do pote não
  diz quem a guarda nem quando ela é revogada.

**Cenário de falha.** O site abre com "sem oráculo" na manchete. O visitante não sabe o que é oráculo; o que sabe
desconfia, porque o primeiro escândalo será um dono de chave que apostou contra a própria comunidade (O8). A frase
vira munição contra a marca: "ninguém decide, só o dono do token".

**Severidade.** Alta.

**Correção proposta.**

1. Trocar a promessa. Em vez de "sem oráculo", três benefícios que o apostador sente: "o resultado sai sozinho", "você
   saca em minutos, sem disputa" e "qualquer um confere com um clique". O agente 1H já pede "resolução por dado
   verificável on-chain".
2. Tornar a verificação um objeto de tela: em cada pergunta, o número lido agora, o alvo, e o link da conta.
3. Dizer na tela quem controla o resultado de cada pergunta (selo proposto pelo agente 1H) e publicar quem guarda a
   chave de atualização do programa e sob que regra.

### O4. De onde vêm as perguntas, toda semana

**Objeção.** A equipe abre as perguntas, mas não existe estoque, cadência nem capacidade definidos, e o cardápio
pronto é curto e de desfecho raro.

**Evidência.**

- `ideacao`, seção 1: tipos de pergunta do primeiro dia, "sem decisão".
- `saida-fechamento`, seção 4.2: os leitores de token só aceitam o padrão clássico, e os tokens novos do pump.fun são
  Token-2022. Queima, renúncia e metadados "não funcionam hoje nos tokens que o público do pump.fun negocia". Duas
  perguntas "já nascem respondidas" nesses tokens (renúncia de emissão e de congelamento).
- Mesma fonte, seção 4.4: formatura no pump.fun é "quase sempre, uma aposta de azarão" (0,26% dos tokens).
- Escala de comparação: o World tinha cerca de 4.000 mercados abertos em setembro de 2026 (`top-5`, 4.4).
- Sugestões pelo X pressupõem audiência que ainda não existe.
- Tamanho da equipe e horas dedicadas a abrir perguntas: não encontrado em nenhum documento do plano.

**Cenário de falha (INFERÊNCIA).** Fatos irreversíveis são eventos raros. A maioria das perguntas termina em NÃO por
prazo vencido, depois de semanas, com as apostas fechadas nos últimos 20%. Um site com seis perguntas paradas, todas
caminhando para NÃO, não dá motivo para voltar na semana seguinte.

**Severidade.** Alta.

**Correção proposta.** Montar uma fábrica de perguntas antes de montar o programa:

1. **Séries recorrentes geradas por regra**, não por inspiração: uma por época da Solana (cerca de dois dias) sobre
   pools de staking, uma semanal de "toque" de preço por ativo, uma mensal de queima por token com programa de queima
   conhecido. A equipe aprova o modelo; o serviço abre as rodadas.
2. **Meta de cardápio no BP:** quantas perguntas abertas ao mesmo tempo e quantas novas por semana, com o nome de quem
   responde por isso.
3. **Ordem de construção** já proposta pelo agente 1H (Token-2022, Pyth, formatura) como pré-requisito do lançamento,
   não como melhoria posterior.

### O5. Pote sem retorno conhecido, dinheiro parado e multa para o primeiro

**Objeção.** O apostador não sabe quanto ganha, espera semanas sem rendimento e, se for o primeiro e ninguém vier,
paga 3% por ter tentado.

**Evidência.**

- `BRIEFING`, seção 3.2: "o retorno só fica definido quando as apostas fecham, e uma aposta grande num lado baixa o
  retorno desse lado".
- Os líderes usam livro de ordens, com retorno conhecido na compra. O único precedente de pote puro citado é o
  PancakeSwap, em rodadas de 5 minutos, em que a incerteza dura minutos (`saida-fechamento`, 1.1 e 2.2).
- O Melee, o mais parecido conosco, acrescentou um "piso de retorno" ao pote e justifica: o pote "historically fails
  when late capital dilutes the payouts of earlier winning participants" (`top-5`, 1.4; `saida-fechamento`, 2.1).
- Literatura citada pelo agente 1H: apostadores informados "have an incentive to bet at the end".
- Decisões do Lucas: "pote de um lado só: devolve cobrando taxa" e "esquece o rendimento do pote".

**Cenário de falha (INFERÊNCIA).** Ana abre o pote com 100 no SIM. Ninguém aposta no NÃO. Ela recebe 97. O produto
cobrou 3 dólares de quem fez exatamente o que ele mais precisa no começo: ser a primeira. Quem entende a regra espera
os outros; todos esperam; o pote fica vazio até perto do fechamento, e a "chance" na tela, que é só a fatia do pote,
não informa nada durante a maior parte da vida da pergunta.

**Severidade.** Alta.

**Correção proposta.** O pote fica. O que muda em volta dele:

1. **Discordo de cobrar taxa no pote de um lado só durante o lançamento.** "A banca nunca perde" continua verdade se a
   banca cobrar zero: ela só não ganha. Alternativa intermediária: cobrar apenas o custo de rede. É decisão do Lucas.
2. Mostrar três números antes de assinar: retorno se o pote fechasse agora, retorno se entrar o dobro no seu lado, e
   o pior caso (devolução).
3. Usar o fundo de prêmios primeiro para abrir potes (uso 1 da seção 5.4 de `monetizacao-e-tesouraria.md`).
4. Avaliar bônus de madrugador, que tem precedente (OpenTote e Melee, `saida-fechamento`, 2.2).
5. Preferir perguntas curtas enquanto não houver rendimento nem saída com ganho.

### O6. A taxa de 3% sobre o pote inteiro mata a pergunta desequilibrada

**Objeção.** Cobrar 3% do pote total, e não do lucro, faz o lado favorito perder dinheiro mesmo acertando, e fatos
on-chain raramente são 50 a 50.

**Evidência e conta (INFERÊNCIA; a regra vem do `BRIEFING`, seção 3.2).** Cada 1 USDC do lado vencedor recebe
0,97 dividido pela fatia desse lado no pote.

| Fatia do lado vencedor no pote | Recebe por 1 USDC | Lucro sem taxa | Parte do lucro que a taxa leva |
|---|---|---|---|
| 50% | 1,940 | 1,000 | 6% |
| 80% | 1,213 | 0,250 | 15% |
| 90% | 1,078 | 0,111 | 30% |
| 95% | 1,021 | 0,053 | 60% |
| 97% | 1,000 | 0,031 | 100% |
| 99% | 0,980 | 0,010 | Mais que tudo: quem acerta perde 2% |

Comparação: no Polymarket, comprar o favorito a 90 centavos em mercado de cripto custa 0,07 × 0,9 × 0,1 = 0,0063 por
contrato, 6,3% do lucro possível (fórmula em `top-5`, 3.6). No Baked, o mesmo favorito paga 30%.

Onde isso pega: formatura no pump.fun, com chance real perto de 1%. Um pote racional teria 99% no NÃO, e aí o NÃO
perde dinheiro acertando. Logo ninguém racional aposta no NÃO, o pote fica de um lado só, e a regra do lado só devolve
cobrando taxa. O mesmo vale para toda pergunta que caminha para NÃO conforme o prazo acaba.

`top-5`, resumo, item 9, diz que "os 3% do pote estão dentro da faixa" do setor. Isso é verdade para a média, medida em
dólares pagos, e falso nas pontas.

**Severidade.** Alta.

**Correção proposta.** Manter os 3% como teto e mudar a base, para simulação pelo agente 2E:
`taxa = mínimo(3% do pote; 10% do lado perdedor)`. Exemplo: pote de 1.000 com 950 no lado vencedor. Hoje a taxa é 30
e o vencedor recebe 1,021. Com a regra, a taxa é 5 e o vencedor recebe 1,047. A banca ganha menos nesse pote, mas o
pote passa a existir. Os 10% são ponto de partida meu, sem referência de mercado.

### O7. Por que alguém pagaria 500, 1.500 ou 5.000 dólares

**Objeção.** As faixas têm preço de vitrine de site com milhões de usuários, e o Baked não tem vitrine; o único
programa parecido que existe não cobra nada e move pouco.

**Evidência.**

- O próprio Lucas, rodada 1: "sigo com a dúvida se há necessidade de um sponsor, e se sim, para qual razão?".
- `top-5`, "O que isto muda no plano", item 4: "Patrocínio de pergunta não tem precedente entre os cinco".
- `monetizacao-e-tesouraria.md`, seção 3.2: a US$ 8 por mil impressões, a faixa de US$ 500 teria de entregar de 18.750
  a 43.750 impressões; "um site novo não entrega isso por pergunta". No programa de patrocínio do Polymarket a mediana
  é de US$ 3 por dia por mercado, e o patrocinador "não recebe nada".
- Mesma fonte, pergunta em aberto 12: "Algum mercado de previsão já vendeu patrocínio de pergunta a marca, com valor?
  Não achei nenhum".
- `publico-web3`, seção 5: com a receita do pump.fun em queda, "o orçamento de marketing do token médio provavelmente
  é pequeno".
- A divisão "70/30" segue ambígua. Se 70% forem da banca, a faixa de US$ 500 põe US$ 150 no pote
  (`monetizacao`, seção 4.2).
- `monetizacao`, seção 4.5: prêmio neutro acima de 3,09% do pote pode ser colhido por quem aposta nos dois lados.

**Cenário de falha.** Nenhum patrocinador nos primeiros meses, e o modelo financeiro contava com essa linha para
completar o custo que os 25% da operação não cobrem (O11). Ou pior: o único patrocinador que aparece é o da O8.

**Severidade.** Alta.

**Correção proposta.**

1. Antes de construir o módulo de pedido de pergunta, conseguir cinco intenções por escrito de equipes de token.
2. Nos primeiros dez patrocínios, cobrar pouco ou nada da parte da banca e mandar quase tudo ao pote (o cenário B da
   Onda 1, 30% banca e 70% pote, é o que os precedentes sustentam). O que se compra no começo é dado: quanto de aposta
   nova cada dólar de prêmio traz.
3. Separar na tabela de preços "destaque" e "prêmio", como sugere `monetizacao`, seção 4.6, para o patrocinador saber
   o que comprou e o apostador saber quanto entrou de fato no pote.
4. Regra contra a colheita do prêmio: liberar o prêmio só no fechamento e limitado a uma fração das apostas reais.

### O8. O patrocinador anônimo que controla o resultado

**Objeção.** O plano permite que alguém esconda a identidade, peça uma pergunta sobre algo que só ele decide e aposte
num lado: é informação privilegiada vendida como produto.

**Evidência.**

- `BRIEFING`, seção 5: "Um patrocinador anônimo que controla o resultado da pergunta é o caso que as regras de
  integridade do Polymarket proíbem. Proposta: anônimo só coloca prêmio neutro".
- `ideacao`, rodada 5: o Lucas recusou a proposta: "o patrocinador anônimo pode escolher uma das duas formas, sim".
- `ideacao`, rodada 1: ele descreveu o uso como "marketing de fomo em que ela tem informação privilegiada".
- `saida-fechamento`, seção 4.1: na família "decisão de quem tem a chave", o custo de forçar o resultado é zero.
- `monetizacao`, seção 4.4: a aposta de patrocinador de US$ 5.000, no cenário B, volta como US$ 4.824 se ele acerta.
  Para quem controla o resultado, "se ele acerta" não é condição.
- `BRIEFING`, seção 5: o cofre de USDC do Cloak tinha cerca de 2.560 USDC. Um patrocínio de US$ 5.000 é quase o dobro
  do cofre inteiro (INFERÊNCIA): o anonimato da faixa maior não se sustenta nem tecnicamente.
- `BRIEFING`, seção 12, risco 1: "sem KYC só dá para sinalizar".
- Caso real do setor: militar acusado de ganhar US$ 440 mil no Polymarket com informação sigilosa (`top-5`, 3.10).

**Cenário de falha (INFERÊNCIA).** A equipe de um token anuncia que vai renunciar à emissão até o dia 30 e patrocina a
pergunta. A comunidade, animada, põe 4.000 no SIM. Uma carteira sem nome põe 1.000 no NÃO. A equipe não renuncia. O
NÃO recebe 0,97 × 5.000 ÷ 1.000 = 4,85 por 1: lucro de 3.850 sem fazer nada. O Baked cobrou 150 de taxa e ficou com
a manchete "plataforma em que o projeto rouba os próprios holders". Repare que o golpe nem precisa do patrocínio:
basta a pergunta existir.

**Variantes que o plano também não cobre:**

- **A equipe do Baked aposta.** Ela escolhe pergunta, alvo e prazo, e sabe quem é o patrocinador. Não há regra.
- **Pergunta sobre o próprio token.** O exemplo 6 do cardápio do agente 1H é "a oferta do nosso token cai para X?".
  Quem faz a recompra e queima é a casa: é a casa abrindo mercado sobre um resultado que ela controla.

**Severidade.** Crítica.

**Correção proposta.** Discordo da decisão de liberar as duas formas ao anônimo. Alternativas, da mais leve à mais
dura:

1. **Anônimo só com prêmio neutro** (a proposta original do briefing).
2. **Regra por tipo de pergunta, que não depende de identificar ninguém:** nos tipos em que o dono de uma chave
   decide, só se aceita prêmio neutro de qualquer patrocinador, a pergunta leva o selo "resultado controlado por uma
   parte" e o pote tem teto baixo.
3. **Se o Lucas quiser manter a aposta de quem controla o resultado,** que seja só no lado da promessa (o SIM) e com
   o nome à vista: "a equipe X apostou 3.500 que vai cumprir". É o modelo de caução do programa atual, e é honesto.
   O que não pode existir é o lado escondido.
4. **Política pública da casa:** carteiras da equipe declaradas, equipe não aposta, nenhuma pergunta sobre o token da
   casa.

### O9. Saída antecipada no MVP

**Objeção.** O item mais novo e menos testado do plano foi puxado para a primeira versão, e não entrega o que o Lucas
descreveu.

**Evidência (`saida-fechamento`, seções 1.1 a 1.7).**

- "Em nenhum precedente encontrado o pote devolve dinheiro a quem sai." PancakeSwap e o Melee alfa proíbem a saída. O
  Melee novo usa um cofre de terceiros. "A devolução com penalidade é desenho nosso."
- "Num pote puro não existe 'ganho' para realizar antes do fim." A frase do Lucas, "ganho proporcional menor", não é
  atendida pela alternativa recomendada.
- Os parâmetros 5%, 20% e 90% são "ponto de partida meu, sem referência de mercado" e "precisam de simulação".
- Com penalidade fixa de 10%, se todos os perdedores saem, quem acerta ganha 1,2%.
- Abusos já listados: robôs saem na frente, saída um instante antes da prova do fato, esvaziar um lado de propósito.
- A decisão passou por três posições: "versão futura 2", "fase 2" e "MVP" (`ideacao`, rodadas 3, 4 e 5).

**Cenário de falha (INFERÊNCIA).** O usuário aperta "Sair" numa pergunta que está perdendo e vê "você recebe 10 dos
seus 100". Tecnicamente correto, comercialmente um print que circula. Ou, no outro extremo, a penalidade é calibrada
baixa demais, os perdedores saem e o prêmio some. Em ambos os casos, cada saída também reduz o pote final e, com ele,
a taxa da banca, a menos que se cobre taxa sobre o valor devolvido, o que ninguém decidiu.

**Severidade.** Alta.

**Correção proposta.** Discordo do prazo, não da ideia.

1. Construir a instrução de saída no MVP, mas **lançar desligada por pergunta**, e ligar depois de a simulação da
   Onda 2 e das primeiras perguntas reais calibrarem os parâmetros. Os parâmetros por mercado, que o agente 1H já
   propõe, permitem isso sem trocar o programa.
2. Chamar de "desistência", não de "cash out" nem de "saída com ganho", e dizer na tela que ela nunca dá lucro.
3. Decidir se a banca cobra os 3% sobre o valor devolvido.
4. Deixar o "ganho na saída" para a fase 2, pela transferência da posição a outra pessoa, que é o que os precedentes
   fazem.

### O10. Dois tokens, um deles "para pumpar"

**Objeção.** A casa de apostas pede confiança no cofre e, na mesma página, anuncia um token cuja função declarada é
subir de preço; e o token "sério" recebe um fluxo pequeno demais para ser sério.

**Evidência.**

- `ideacao`, seção 1: "é expeculativo, e vamos usar para pumpar mesmo e tudo bem" e "subir preço e entregar dividendo
  aos holders".
- `dois-tokens-e-ico-privado.md`, seção 5.2: as duas frases "encostam" nos textos dos reguladores: "dividendo" é a
  palavra que os documentos citam, e "pumpar" descreve conduta listada pela acusação no caso SafeMoon. Ponto para
  advogado.
- `top-5`: LMTS caiu 94% e o volume da Limitless caiu 96% junto; PNP caiu 93%; UMA caiu 99%. "O plano não deve contar
  com alta de preço para atrair usuários."
- `BRIEFING`, seção 7.3: "Não foi achado nenhum caso de plataforma com produto real que tenha lançado pela curva do
  pump.fun".
- `monetizacao`, seção 7: com US$ 1 milhão apostado por mês, a recompra é de US$ 7.500 por mês e cobriria 4,5% de um
  desbloqueio de exemplo. Helium parou a recompra; a Jupiter gastou mais de US$ 70 milhões e o token caiu 89%.
- `dois-tokens`, seção 4.1: a ideia dos 30% como taxa do token dá perda de 51% na ida e volta.
- `dois-tokens`, seção 2.2: o mercado de vendas de token fez 37 vendas e US$ 58 milhões no segundo trimestre de 2026.
- `dois-tokens`, seção 6.3: entre o lançamento e o token B, os 25% da recompra não têm o que comprar por 6 a 9 meses.
- `monetizacao`, seção 5.3: volume atraído por pontos e token "tende a ir embora"; Opinion caiu 80,7% e Myriad 93,8%.

**Cenário de falha (INFERÊNCIA).** O token A sobe e cai, como a grande maioria dos tokens do pump.fun (a taxa de
formatura estava em 0,26% em junho de 2026). Quem perdeu no token conclui que a casa "puxou e largou", e é a mesma
pessoa que deveria confiar que o cofre das apostas é honesto. A atenção da equipe, que é pequena, passa do produto
para o gráfico.

**Severidade.** Alta no produto. O lado jurídico fica com o agente 2D.

**Correção proposta.** A decisão de ter dois tokens fica. Discordo da ordem e da linguagem:

1. Produto primeiro, com volume medido; token A depois, e não como chamariz (o agente 1G propõe junto; eu proponho
   depois de algumas semanas de perguntas resolvidas, para o token não ser a primeira coisa que se conhece da casa).
2. Texto do token A no modelo PURR: sem venda da equipe escondida, sem utilidade prometida, carteira da equipe
   declarada e travada, e nenhuma das palavras "pumpar", "dividendo" ou "subir preço" em material público.
3. Token B só depois de três a quatro meses de volume real, e a recompra acumulando em USDC numa conta pública até lá.
4. O BP não deve usar preço de token como fonte de usuários nem de receita em nenhum cenário.

### O11. Concorrência: terreno vazio ou cemitério

**Objeção.** Os concorrentes parados não são vaga aberta; são a medida do tamanho do nicho, e a conta do plano não
fecha nesse tamanho.

**Evidência.**

- Melee: US$ 3,5 milhões captados com a Variant e o cofundador da Solana, e ainda em rede de teste (`top-5`, 1.2).
- PNP: 206 transações em seis meses, token a US$ 109 mil de valor de mercado, site anunciando outro produto.
- Limitless: de US$ 250,9 milhões em maio para US$ 10,75 milhões em setembro de 2026, com US$ 17 milhões captados.
- World: dentro da Phantom, US$ 15,44 milhões em setembro de 2026. Jupiter: US$ 5,5 milhões em 30 dias.
- `publico-web3`, seção 2: Azuro, Limitless, Myriad e PolyBet somados, menos de 4% do volume do Polymarket.
- `monetizacao`, "O que isto muda", item 8: "A divisão em quatro multiplica por quatro o volume de equilíbrio".

**Conta (INFERÊNCIA).** A operação recebe 25% de 3%, isto é, 0,75% do volume.

| Custo mensal | Volume de equilíbrio por mês | Como fração do World (US$ 15,44 mi) |
|---|---|---|
| US$ 25.000 (premissa do `ECONOMICS.md`) | US$ 3,33 milhões | 22% |
| US$ 20.000 (exemplo do agente 1F) | US$ 2,67 milhões | 17% |
| US$ 5.000 (hipótese minha, só para a conta) | US$ 667 mil | 4% |

O World tem a carteira que o público usa, aceita qualquer assunto e deixa sair a qualquer hora. O Baked teria de
fazer um quinto disso sem distribuição, com assunto restrito e com pote. E num pote o mesmo dólar entra uma vez; num
livro de ordens ele gira várias. Volume de pote é menor por construção.

Leitura honesta dos dois lados: a ausência de rival vivo no recorte **pode** ser janela (o Melee demora, ninguém lê a
conta direto). Mas quem tem dinheiro, investidores e fila ainda não provou demanda com dinheiro real, e o único que
provou volume (Limitless) o perdeu em quatro meses, por causa que a Onda 1 não encontrou.

Outro ponto: a Polymarket devolve cerca de 24% da taxa a usuários; o Baked destina 25% ao fundo de prêmios, 25% ao
Bitcoin e 25% ao token. Metade da receita vai para dois ativos voláteis antes de pagar um servidor. Os três
precedentes de tesouraria em Bitcoin usam lucro ou caixa excedente como base, não receita bruta (`monetizacao`, 6.2).

**Severidade.** Crítica.

**Correção proposta.** A divisão 25/25/25/25 fica como destino final. Proponho **gatilhos**:

1. Até a operação se pagar por três meses seguidos, a operação e o fundo de prêmios ficam com a taxa inteira; Bitcoin
   e recompra ligam depois, nos percentuais que o Lucas decidiu. É discordância minha sobre o momento, não sobre o
   destino.
2. O BP mostra o custo mensal real e enxuto, e o volume de equilíbrio nas três linhas da tabela acima.
3. O BP compara o Baked só com "dólares pagos", como pede o agente 1E, e usa World, Jupiter e Myriad como régua, não
   Polymarket.

### O12. Brasil

**Objeção.** O plano adia a jurisdição e o bloqueio geográfico justamente no país em que a equipe mora e em que a
regra contra o setor é mais recente.

**Evidência (`regulacao.md`; todas as fontes são secundárias, e o texto oficial não foi lido).**

- Resolução CMN 5.298/2026, em vigor desde 4 de maio de 2026: proíbe oferta e negociação, no Brasil, de derivativos
  cujo ativo seja evento que não é referencial econômico-financeiro, inclusive os negociados no exterior e ofertados
  aqui. A CVM ainda dirá o que conta como referencial econômico-financeiro.
- Nota Técnica SEI 2958/2026, da Secretaria de Prêmios e Apostas: trata plataformas como Polymarket e Kalshi como
  aposta de quota fixa explorada sem autorização e recomenda bloqueio. Ao menos 27 sites bloqueados.
- O Polymarket pôs o Brasil em "só fechar posição".
- Padrão europeu: reguladores de jogo lideram e citam a falta de identificação como agravante (França, julho de 2026).
- Tornado Cash: Roman Storm foi condenado em agosto de 2025 por conspiração para operar transmissão de dinheiro sem
  licença.
- `ideacao`, seção 1: "100% onchain da solana, via wallet, sem kyc"; bloqueios "para o fim"; jurisdição "não é assunto
  agora". Rodada 3, pergunta 14: bloquear Brasil e EUA? "Por enquanto não, e ainda não sabemos."
- `dois-tokens`, pergunta em aberto 4: "a venda privada não pode ser desenhada sem" a jurisdição.
- `monetizacao`, seção 6.3: converter a taxa em Bitcoin nativo passa por corretora que pedirá a origem dos recursos.

**Cenário de falha.** Descrevo, não julgo: o domínio entra numa lista de bloqueio; uma corretora recusa a conta da
empresa; a venda privada do token B não acha plataforma que a aceite sem saber o país do emissor; e as pessoas com
nome no repositório e no X são as que respondem. Se um pote de USDC sobre fato on-chain é ou não "derivativo" ou
"aposta de quota fixa" é exatamente a pergunta que ninguém respondeu. **Ponto para advogado.**

**Severidade.** Crítica.

**Correção proposta.** Discordo de deixar para o fim. Três passos baratos, antes da rede principal:

1. Um parecer curto, de advogado brasileiro com prática em cripto, sobre quatro perguntas: o pote se enquadra na CMN
   5.298 ou na Lei 14.790? Pergunta de preço de cripto é "referencial econômico-financeiro"? O que muda com
   patrocinador anônimo? Os dois tokens caem no Parecer 40 da CVM?
2. Escolher a jurisdição da empresa antes de desenhar a venda do token B e a tesouraria.
3. Bloqueio geográfico no site desde o primeiro dia. Todos os concorrentes sem identificação o mantêm (`top-5`, item
   9). É barato e mostra intenção. Sem material em português e sem campanha no Brasil até o parecer.

### O13. Resolução por cron: a falha vira NÃO

**Objeção.** "Ninguém decide o resultado" depende de um servidor da equipe estar no ar; se ele falha, um SIM
verdadeiro é gravado como NÃO, sem volta.

**Evidência (`saida-fechamento`, seção 3.1).**

- "Meta cumprida no dia 10, ninguém chama `resolve` até o dia 30, o resultado gravado é NÃO. O programa não tem como
  saber depois quando a meta foi cumprida."
- Nas perguntas de época a janela é de cerca de dois dias: "perdeu a janela, virou NÃO".
- O PancakeSwap, quando o operador falha, cancela a rodada e devolve 100%. "O nosso, hoje, não prevê: a falha vira
  NÃO."
- O agendador on-chain disponível (Tuk Tuk) não consegue chamar o `resolve`, segundo fonte secundária.

**Cenário de falha (INFERÊNCIA).** O servidor cai num fim de semana, uma pergunta de época perde a janela, e quem
acertou o SIM perde tudo. Pior: quem opera o cron é a equipe, e se alguém da equipe tiver posição no NÃO, deixar o
serviço cair passa a dar lucro. Não acuso ninguém; aponto que o desenho cria o incentivo e que o plano não tem regra
contra ele.

**Severidade.** Alta.

**Correção proposta.** A do agente 1H, com dois acréscimos:

1. Resolução na primeira interação, segundo agendador em outro provedor, botão público e alarme (seção 3.4 de lá).
2. **Recompensa a quem resolve**, paga pelo programa, desde o MVP e não na fase 2. Custa centavos e tira o cron da
   posição de ponto único.
3. **Nas perguntas de época, janela perdida vira devolução, não NÃO.** É o precedente do PancakeSwap.
4. Não abrir pergunta de época antes de haver dois agendadores.

### O14. Contradições entre as próprias decisões

| # | Decisão ou frase | Onde bate | Severidade | Correção proposta |
|---|---|---|---|---|
| 1 | "subir preço e entregar dividendo aos holders" | A divisão 25/25/25/25 não tem parcela de dividendo (`dois-tokens`, 6.5) | Alta | Tirar "dividendo" do plano, ou dizer de qual fatia sai e levar ao advogado |
| 2 | "Resolução só por dado on-chain", sem oráculo manipulável | Preço exige Pyth; o agente 1H diz que "sem oráculo deixa de ser verdade" | Média | Usar "dado verificável on-chain" em todo material |
| 3 | "Sem preço garantido, sem limite de compra" | A Onda 1 pede teto de pote em toda pergunta e teto de 25% por lado na reta final | Alta | Aceitar o teto como regra de segurança e dizer que "sem limite" vale abaixo do teto |
| 4 | "A banca nunca perde" (taxa no pote de um lado só) | Pune o primeiro apostador, que é quem o lançamento mais precisa (O5) | Alta | Taxa zero ou de custo no lado só durante o lançamento |
| 5 | Saída com "ganho proporcional menor" | Pote puro não tem ganho para realizar (`saida-fechamento`, 1.2) | Alta | Ganho só na fase 2, por transferência da posição |
| 6 | "A equipe abre as perguntas" e resolve sem humano | A equipe escolhe alvo, prazo e modelo, aprova prazo curto e roda o cron: há humano, só que antes | Média | Publicar as regras de abertura e a política de conflito da equipe |
| 7 | Trilha 3: "30% de cada dólar do token vai para as pools" | Impossível no pump.fun; como taxa do token B, perda de 51% (`dois-tokens`, 4.1) | Média | 30% do arrecadado na venda privada, como propõe o agente 1G |
| 8 | 25% para a operação, que "não deve ser todo o custo" | Não está dito de onde vem o resto; o patrocínio não tem demanda provada (O7) | Crítica | Gatilhos de O11 |
| 9 | "Taxas de mercado, nem maior, nem menor" | 3% do pote é a média do setor, mas é 30% do lucro do favorito a 90% (O6) | Alta | Teto pela fatia do lado perdedor |

### O15. O "MVP" tem escopo de produto maduro

**Objeção.** A primeira versão soma mais de dez sistemas novos, depende de um sócio que ainda não respondeu e não
menciona auditoria antes de receber dinheiro real.

**Evidência.**

- Itens que as decisões e a Onda 1 colocam antes ou junto do lançamento: programa de pote novo, saída com penalidade,
  fechamento em dois marcos, pedido de pergunta com depósito travado, três leitores novos (Token-2022, Pyth,
  formatura), dois agendadores com alarme, Cloak, SODAX, página de sugestões pelo X, dois tokens, tesouraria em
  Bitcoin, fundo de prêmios com medição.
- `BRIEFING`, seção 12: reescrever as instruções econômicas "invalida boa parte dos 138 testes".
- `BRIEFING`, seção 13: seis perguntas ao Ronaldo, sem resposta registrada. `ideacao`: a divisão com ele é
  "irrelevante por enquanto". O Lucas não é engenheiro de protocolo; o programa é do sócio.
- O `CLAUDE.md` do repositório descreve o código como "hackathon MVP, devnet, unaudited". Auditoria do programa novo:
  não encontrada em nenhum documento do plano.
- Referência de risco: o Drift sofreu um ataque de US$ 285 milhões em abril de 2026 (`competitor-longlist`).

**Cenário de falha.** O lançamento atrasa meses atrás do Melee, ou sai sem auditoria e com cofre de dinheiro real.

**Severidade.** Alta.

**Correção proposta.** O agente 2F detalha. O mínimo: um MVP de pote, três leitores, resolução com recompensa e teto
de pote global; todo o resto atrás de chave de ligar e desligar. Acordo escrito com o Ronaldo e resposta dele às seis
perguntas antes do BP final. Auditoria, ou no mínimo teto de pote global baixo, como condição da rede principal.

### O16. A base da Onda 1 tem buracos

**Objeção.** Os quatro agentes do primeiro grupo declararam que não conseguiram ler as decisões do Lucas, e um deles
estimou mercado para um produto que não é este.

**Evidência.** `competitor-longlist.md`, `market-research.md`, `publico-web3.md` e `regulacao.md` abrem dizendo que a
leitura devolveu só a linha 1. `market-research.md`, seção 5(d): "O Baked tem mecânica diferente (bounty)", isto é, o
modelo antigo. A mesma seção estima US$ 0,1 a 0,5 bilhão por ano para um entrante de nicho; o agente 1E mostra que o
World, com a Phantom, faz cerca de US$ 0,18 bilhão por ano. Os volumes do Melee citados na lista longa são ilustração
de tela.

**Severidade.** Média.

**Correção proposta.** O coordenador da Onda 3 usa os números do agente 1E (API, dólares pagos) e descarta a faixa
(d) do agente 1B. Regulação: ler os textos oficiais da CMN 5.298 e da Nota 2958 antes de citar no BP.

### O17. O nome

**Objeção.** "Baked" tem a gíria de "chapado" e, em inglês de mercado, "baked in" quer dizer "já decidido de
antemão": leitura ruim para uma casa cujo maior risco é resultado arranjado (O8).

**Evidência.** `knowledge-base/pesquisa-nome-do-site.md` já registra "gíria de chapado" e ticker `BAKED` em uso. A
leitura de "baked in" é INFERÊNCIA minha.

**Severidade.** Baixa. O nome está decidido e tem mascote.

**Correção proposta.** Manter, e usar a leitura a favor: o resultado está "assado" na chain e qualquer um confere.
Só funciona se O8 for resolvida; se não for, a piada se escreve sozinha.

## O que isto muda no plano (INFERÊNCIA)

1. O BP deve tratar a demanda como hipótese a testar, com o teste e os critérios descritos, e não como premissa.
2. O capítulo de produto deve escolher entre as posições A e B de O2 e dizer qual paga as contas.
3. A promessa pública passa de "sem oráculo" para "resultado verificável, pago em minutos, sem disputa".
4. O capítulo de riscos deve abrir com O8 e O12, não com risco técnico.
5. O modelo financeiro (agente 2E) deve rodar com a taxa de O6, os gatilhos de O11 e patrocínio zero no cenário ruim.
6. O roteiro (agente 2F) deve pôr a saída antecipada e os dois tokens depois de volume medido.
7. A regra de resolução deve prever falha operacional com devolução nas perguntas de época.

## Perguntas em aberto

Para o Lucas:

1. Aceita testar a demanda antes de reescrever o programa? Que número faria você parar?
2. Especialista em fatos on-chain ou generalista de preço de cripto: qual é o produto principal?
3. Mantém a aposta num lado para patrocinador anônimo, sabendo do cenário de O8?
4. A equipe pode apostar? Haverá pergunta sobre o token da casa?
5. Aceita taxa zero no pote de um lado só durante o lançamento?
6. Aceita os gatilhos para ligar Bitcoin e recompra só depois do equilíbrio?
7. Quem guarda a chave de atualização do programa, e quando ela é revogada?
8. Quantas pessoas abrem perguntas, e quantas por semana?

Para o advogado (sem opinião minha): as quatro perguntas de O12.

Para os outros agentes da Onda 2:

9. 2E: simular a taxa `mínimo(3% do pote; 10% do lado perdedor)` e o volume de equilíbrio com e sem gatilhos.
10. 2C: o custo de forçar cada tipo de pergunta, para o teto de pote; e a regra de devolução na janela perdida.
11. 2D: patrocinador anônimo com Cloak, e a linguagem dos dois tokens.

Não confirmado por mim: nenhum dado novo da web foi buscado; tudo o que cito de terceiros herda a força (e a
fraqueza) da fonte da Onda 1. Tamanho da equipe, custo mensal real e posição do Ronaldo: não encontrados.

## Fontes

Internas, lidas em 4 de outubro de 2026:

- `docs/business/_review/plano-das-ondas.md` (seções A e C)
- `docs/business/ideacao-perguntas-e-respostas.md`
- `docs/business/BRIEFING-MERCADO-DE-POTE.md`
- `knowledge-base/competitors/competitor-longlist.md`
- `knowledge-base/competitors/top-5-competitor-analysis.md`
- `knowledge-base/market/market-research.md`
- `knowledge-base/market/publico-web3.md`
- `knowledge-base/market/regulacao.md`
- `knowledge-base/market/monetizacao-e-tesouraria.md`
- `knowledge-base/market/dois-tokens-e-ico-privado.md`
- `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md`
- `knowledge-base/pesquisa-nome-do-site.md` (só a linha sobre a gíria do nome)

As listas de fontes externas no fim dos quatro arquivos maiores não foram relidas; as fontes de cada número estão
nos arquivos acima, na seção "Fontes" de cada um.

## As cinco coisas que eu mudaria primeiro

1. **Provar a demanda antes de reescrever o programa (O1, O2, O4).** Conversas, beta com pontuação e quatro semanas
   de potes com teto, com critério de parar escrito antes. Junto, a fábrica de perguntas em séries recorrentes.
2. **Fechar o buraco de quem controla o resultado (O8).** Anônimo só com prêmio neutro; nos tipos de "dono da chave",
   só prêmio neutro, selo e teto; equipe não aposta; nenhuma pergunta sobre o token da casa.
3. **Advogado, jurisdição e bloqueio geográfico antes da rede principal (O12, O10).** E tirar "pumpar", "dividendo" e
   "subir preço" de todo material público.
4. **Refazer a conta da taxa (O6, O11, O5).** Teto pela fatia do lado perdedor; taxa zero no pote de um lado só no
   lançamento; Bitcoin e recompra só depois de a operação se pagar.
5. **Encolher o MVP e blindar a resolução (O9, O13, O15).** Saída construída mas desligada; tokens depois de volume
   medido; recompensa a quem resolve; janela de época perdida vira devolução; auditoria ou teto global.

## O que continua de pé

Estes pontos resistiram ao ataque. Onde há ressalva, ela está dita.

1. **A leitura direta on-chain é real e única entre os cinco concorrentes.** Nenhum deles resolve assim (`top-5`,
   seção 8). Não precisa de caução, de votação nem de prazo de disputa, e custa 5.000 lamports por resolução. O que
   caiu foi a manchete "sem oráculo", não o mecanismo.
2. **O código de resolução é o ativo mais sólido do projeto:** nove leitores, resolução aberta a qualquer um, trava
   automática das apostas quando o fato acontece, teste aleatório de invariantes. Aproveita-se quase inteiro.
3. **O pote não quebra.** Não precisa de formador de mercado, não tem contraparte para falir e "o cofre nunca fica
   devendo". Para uma equipe pequena e sem capital de liquidez, é o mecanismo certo. A ressalva é a taxa (O6) e o
   primeiro apostador (O5), que têm correção.
4. **A equipe abrindo as perguntas** é o que fazem Polymarket e World, e quem abriu a criação para qualquer um (PNP,
   Limitless) não mostrou que isso traz volume. A ressalva é a cadência (O4).
5. **USDC, sem rendimento do pote e sem tokens de SIM e NÃO** simplificam o programa e a explicação.
6. **Os 3% estão dentro da faixa do setor** em potes equilibrados: a taxa efetiva dos concorrentes vai de 1,9% a 5%
   dos dólares pagos.
7. **Prêmio dentro do pote é algo que nenhum site de anúncio vende.** Se houver patrocinador, é isso que ele compra,
   e o cenário de 70% para o pote tem precedente.
8. **A relação de distribuição entre os dois tokens** (o segundo dado a quem segura o primeiro, sem conversão) tem um
   precedente que funcionou, PURR e HYPE. A ressalva é a ordem e a linguagem (O10).
9. **A janela existe, se a demanda existir.** O rival mais parecido não lançou, e copiar a leitura on-chain é trabalho
   de engenharia que ninguém fez ainda. Isso vale pouco sem a prova de O1 e vale muito com ela.
