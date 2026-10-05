# Revisão do fundador sobre o BP v0.0.1

Registro da leitura do Lucas em 4 de outubro de 2026 (etapa 2.7 do wizard). Ele leu até o capítulo 8: "Do item 9 pra
baixo eu nem li, pois precisávamos resolver as questões acima". Trechos entre aspas são palavras dele. As decisões
abaixo prevalecem sobre o BP v0.0.1 e sobre o estado consolidado anterior.

## 1. Forma do documento

- "115 páginas foi exagero, poderia ser de 30 a 45 páginas."
- "vamos reduzir o BP, podemos pensar ele em 3 a 4 partes, cada parte sendo de 20-30 páginas. E, neste momento, vamos
  pensar apenas na primeira parte".

Divisão proposta para a v0.0.2, em quatro documentos de 20 a 30 páginas:

| Parte | Conteúdo | Vem dos capítulos |
|---|---|---|
| 1 Produto | O que é, o pote, as regras, os tipos de pergunta, a resolução e a revisão | 1 a 4 |
| 2 Mercado e negócio | Mercado, concorrência, taxa, parceiros e patrocínio, aquisição, projeções | 5, 6, 7, 9, 10 |
| 3 Tokens | Token A, token B, staking, governança, tesouraria, recompra | 8 |
| 4 Construção e risco | Tecnologia, roteiro, equipe, riscos, regulação, decisões | 11 a 16 |

## 2. Correções e decisões, item por item

| Item do BP | O que ele disse | Efeito |
|---|---|---|
| Até 2.5 | "está tudo okey" | Mantém |
| 2.5, a conta de 262.810 | "essa conta está errada. que volume de 262k O QUÊ é este?" | O número é em dólares: o volume total dos mercados da Polymarket sobre o token PUMP, os únicos ligados ao pump.fun que a pesquisa achou. Não é o volume da Polymarket, que foi de cerca de 4,6 bilhões de dólares em setembro de 2026. A frase não dizia a unidade nem o que media. Reescrever |
| OBJ-22, teto de pote | "no mvp não vamos lidar com isso, mas guarde essa informação para revisitarmos numa fase futura" | Fica registrado para fase futura |
| OBJ-08, pote de um lado só | "apenas o primeiro apostador tem proteção contra taxa" | Decisão nova: o primeiro apostador não paga taxa na devolução |
| 3.5, opção avançada | "concordo" | Segunda assinatura da equipe e registro on-chain |
| 3.5, perguntas longas | "a proposta do T2 é mais interessante" | Fechamento total quando faltam 5% da duração, mínimo de 24 horas, máximo de 7 dias |
| OBJ-21 | "sinceramente, eu não entendi" | Reexplicar (ver seção 3) |
| 3.6, saída antecipada | "eu gostei muito da fórmula proposta, e quero que isso seja documentado como algo a ser melhor trabalhado na fase 2. Neste mvp vamos trabalhar sem possibilidade de saída" | **Saída fora do MVP.** A fórmula fica documentada para a fase 2. Resolve OBJ-04 e OBJ-06 por ora |
| 3.7, o "70/30" | "70 pro pote/pool e 30 pra banca/plataforma" | Ambiguidade resolvida |
| OBJ-02 | "vamos de alternativas 1, 3 e 4" | Anônimo para o público e identificado para a equipe; aviso na pergunta de que o patrocinador pode controlar o resultado e pode ter apostado; anônimo só com prêmio neutro |
| 3.8 | "concordo com todas as sugestões propostas" | Mantém |
| OBJ-23 | "não, vamos seguir o plano e integrar os dois serviços dentro da nossa plataforma" | SODAX e Cloak integrados |
| OBJ-28, nome | "e se pensarmos o nome em alemão, algo como Bröt Markets?" | Em estudo (ver seção 3) |
| OBJ-03 | "sim, vamos seguir a alternativa proposta" | Perguntas decididas por uma única chave ficam fora do pote na primeira versão |
| OBJ-24 | "vamos seguir a proposta alternativa recomendada" | Preço de token pequeno entra em três degraus, não no primeiro dia |
| 4.6, serviço agendado | Redundância em outro provedor, junto do backup: o segundo serviço vigia o primeiro e, se ele cair "após xx minutos, e yy tentativas de tentar religar", assume em "ritmo e cadência mais lenta" e "envia email ao CTO". "Sobre o botão resolver, esquece" | Dois serviços; sem botão público por ora |
| 4.7 e OBJ-25 | "um serviço internamente de arbitragem que iremos construir na fase 1.2". Por ora, depois de resolvida a pergunta "fica travada por cerca de 6h em aguardo de alguém da equipe revise e confirme que a resolução foi correta, liberando o pagamento" | **Decisão nova:** janela de revisão de 6 horas antes do pagamento |
| OBJ-27 | "vamos ter ambiente de disputa sim ... pensarmos no futuro um que seja menos manipulável". Redação "num sentido mais marketeiro e agradável de ler, sem ser mentira" | Disputa entra no roteiro; reescrever as frases de promessa |
| 6.9, o que copiar | 1 sim; 2 sim; 3 sim, "na polymarket ele vai direto pro teu saldo, não faz sentido ter botão de claim"; 4 gosta de indicação, mas quer estudar de onde sai o dinheiro e que "os dois precisam ganhar algo"; 5 "vamos montar inteiramente na devnet inicialmente" | Pagamento automático; indicação a estudar; MVP na devnet |
| 7.2 e OBJ-07 | Por que taxa fixa se os concorrentes usam fórmula? "Se a gente adotasse a fórmula deles ganharíamos mais? ... por que você não sugeriu a alteração" | Pergunta em aberto (ver seções 3 e 4) |
| OBJ-09, destino da taxa | "vamos dividir 25% da taxa para treasure e todos os demais 75% para a operação ... até equilibrarmos as contas, coisa que pode ser de 5 a 12 meses" | **Decisão nova**, substitui os quatro quartos |
| 7.4 | Recalcular com o 70/30 certo, "sabendo que não teremos tantos assim" | Recalcular |
| 7.4, esportes | Perguntou se dá para conferir resultado de esporte on-chain, ou por oráculo de boa reputação. "Se sim, vamos considerar isso para fase 2" | Estudo para a fase 2 |
| OBJ-15, patrocinador | "a gente pretende convidar parceiros da rede para entrar como patrocinador ... sem que eles tenham a obrigação de pagar qualquer coisa, isso para fins de marketing ... 20 a 30 projetos". "temos que também considerar outras formas de adquirir clientes" | **Decisão nova:** programa de parceiros gratuito |
| 7.5 e OBJ-16, fundo de prêmios | "vamos prometer essa feature no futuro". "poderá ser criada a partir do mês 10, e depois de 2 meses captando recursos ele passar a ser direcionado ao seu lugar" | Fundo de prêmios a partir do mês 10 |
| 7.6, tesouraria em Bitcoin | "começa desde o dia zero, mas depois do mês 12 a gente repensa" | Mantém 25% desde o início |
| 7.15 | Para a fase 2: contratos perpétuos e alavancagem, taxa de construtor, indicação e afiliados, taxa de depósito e saque | Lista da fase 2 |
| 8.2 | "muito interessante se for possível fazer com que o token A possa ser usado ... para alimentar as nossas pools" | Desenhar |
| 8.4 | "precisa ser melhor desenhado, definitivamente ele não está funcionando" | Substituir pelo desenho de staking |
| Token B | Desconto por faixa de quantidade e por tempo; pool de staking, com parte servindo para alimentar as pools; o tempo de posse como poder de voto, "ao invés de inventarmos de ter uma moeda própria para governança" | Desenhar |
| Token A para comprar B | Usar o A para comprar o B com desconto, queimando o A. "quais as consequências possíveis? O mercado apreciaria isso?" | Pergunta em aberto |
| 8.5 e OBJ-11, recompra | "só faríamos isso com caixa da empresa a partir do mês 13, não antes"; "deixar como decisão a ser tomada no futuro" | Recompra em espera |
| 8.6 e OBJ-12 | Parte dos lucros vai para o cofre de quem segura o token B, somada ao ganho do staking. "Faz sentido?" | Pergunta em aberto |

## 3. Respostas às dúvidas dele

**OBJ-21, em linguagem simples.** A regra diz que as apostas fecham pelo menos 24 horas antes do fim. Numa pergunta
de dois dias, isso deixa um dia para apostar e um dia parado. Numa pergunta de um dia, não sobra tempo nenhum, e ela
só existiria pela opção avançada, com duas assinaturas da equipe a cada vez. O público web3 aposta justamente em
prazos curtos, de minutos a uma semana. A objeção propõe aprovar uma vez, com duas assinaturas, um modelo de pergunta
curta que se repete (por exemplo "o SOL toca tal preço em 24 horas"), e deixar o serviço abrir as rodadas sozinho.

**Taxa fixa ou fórmula dos concorrentes.** Polymarket e Kalshi cobram `coeficiente × contratos × p × (1 − p)`, onde
`p` é o preço pago. A fórmula faz a taxa ser maior quando o resultado é incerto (preço perto de 50 centavos) e quase
zero quando é quase certo. Eles podem usar isso porque cada negociação tem um preço. No pote não há preço na hora da
aposta, então a fórmula não se aplica ao pé da letra. O equivalente no pote é cobrar sobre o que os vencedores ganham,
isto é, sobre o lado perdedor. Com 10% do lado perdedor: pote equilibrado paga 5% do pote; pote 70/30 em que o
favorito vence paga 3%; pote 90/10 paga 1%. Em média, com apostadores bem informados, a receita esperada é
`0,2 × q × (1 − q)` do pote, onde `q` é a fatia do lado favorito: é a mesma forma da fórmula dos líderes. Rende mais
que os 3% fixos quando o favorito tem menos de 82% do pote e menos quando tem mais. E resolve a OBJ-07 por inteiro:
quem acerta nunca perde dinheiro, porque a taxa sai só do ganho. O BP v0.0.1 propôs apenas um teto porque a instrução
era preservar os 3%; a opção da fórmula deveria ter sido posta na mesa.

**Esportes.** Resultado de jogo não nasce on-chain: alguém precisa publicar. As opções são redes de oráculos que
assinam dados de provedores esportivos, ou um oráculo com disputa. Não foi pesquisado. Dois avisos: é a categoria que
a Resolução CMN 5.298 e a lei brasileira de apostas citam pelo nome, e a pesquisa sobre o tema depende de busca na
web, esgotada nesta sessão.

**Queimar o token A para comprar o B com desconto.** A pesquisa achou dois precedentes de dois tokens: a Hyperliquid
entregou o segundo aos usuários do primeiro sem conversão, e o primeiro sobreviveu; a troca forçada do ai16z derrubou
o preço 28% num dia. A queima opcional é um terceiro caminho, sem caso igual encontrado. Consequências prováveis
(inferência): dá utilidade ao A e reduz a oferta dele; o preço do A tende a acompanhar o valor do desconto; se o
desconto for grande, vira distribuição do B a preço baixo; e faz o A parecer um direito sobre o B, ponto para o
advogado.

**O cofre de quem segura o token B.** O desenho faz sentido como mecanismo e tem nome: repasse de receita a quem faz
staking. Três ressalvas. Primeiro, staking sozinho não gera ganho: o dinheiro vem da receita repassada ou da emissão
de tokens novos. Segundo, "tempo segurando na carteira" não é mensurável on-chain sem travar o token; com staking, o
tempo fica registrado. Terceiro, é o desenho que reguladores examinam, e GMX e Gains suspenderam os deles em 2026.

**Nome.** Em alemão a palavra é "Brot", sem trema; "Bröt" não existe. Consulta de DNS em 4 de outubro de 2026,
só indicativa: `brot.markets`, `brotmarkets.com`, `brotmarket.com`, `brotmarkets.xyz`, `brotmarkets.io` e `brot.fun`
não resolvem; `brot.xyz` e `bakedmarket.com` já têm servidor de nomes. Domínio que não resolve não é garantia de
estar à venda, e nenhuma base de marcas foi consultada.

## 4. Perguntas em aberto

### Parte 1 — Produto

1. **Forma da taxa.** Contexto: 3% fixos do pote castigam quem aposta no favorito. Opções: (a) 3% do pote; (b) 10% do
   lado perdedor; (c) o menor entre os dois. Recomendo (b): é o equivalente da fórmula dos líderes e ninguém perde por
   acertar.
2. **Pote de um lado só.** Contexto: decidido que o primeiro apostador não paga. Opções para os demais: (a) 3% do que
   apostaram; (b) 1%; (c) valor fixo pequeno. Recomendo (b), porque não houve ganho de ninguém.
3. **Perguntas curtas.** Contexto: o mínimo de 24 horas inviabiliza perguntas de um ou dois dias. Opções: (a) só
   perguntas de três dias ou mais; (b) modelo de série curta aprovado uma vez. Recomendo (b) na fase 2 e (a) no MVP.
4. **Duração máxima e marco único.** Contexto: sem saída no MVP, o primeiro marco da regra gradual perde função.
   Opções: (a) só o T2; (b) T1 e T2. Recomendo (a), com perguntas de até 30 dias no MVP.
5. **A janela de 6 horas.** Contexto: a equipe revisa antes de pagar. Opções: (a) a equipe só confirma ou anula;
   (b) pode inverter o resultado. E, se ninguém revisar: (c) libera sozinho ao fim das 6 horas; (d) fica travado.
   Recomendo (a) e (c): a equipe nunca escolhe o vencedor, e o dinheiro nunca depende de alguém estar acordado.
6. **Quem pode contestar na janela.** Opções: (a) só a equipe; (b) qualquer apostador, com depósito. Recomendo (a) no
   MVP, com um canal público de aviso, e (b) na fase 1.2.
7. **Resultado "Anulada".** Contexto: sem ele, falha da equipe vira NÃO. Recomendo criar: devolve tudo.
8. **Cardápio do primeiro dia.** Contexto: saem os tipos decididos por uma chave; tokens do pump.fun ainda não são
   lidos. Recomendo: queima em token clássico, liquidez travada na Meteora, TVL de pool de staking, stake de validador
   e preço de ativo grande por oráculo, que é leitor a construir.
9. **Vigia do serviço agendado.** Recomendo 10 minutos sem resposta e 3 tentativas antes de o segundo assumir.
10. **Nome.** Opções: Baked Market, Brot Markets. Recomendo decidir depois de consultar registrador e base de marcas;
    "Brot" combina com o mascote.

### Parte 2 — Mercado e negócio

11. **De onde sai o fundo de prêmios no mês 10.** Opções: (a) 25% tirados da operação; (b) só de investimento ou de
    patrocínio. Recomendo (a) apenas se a operação já estiver paga; senão (b).
12. **Programa de parceiros.** Contexto: 20 a 30 projetos convidados, sem pagar. Perguntas: o que eles entregam em
    troca, e até quando é gratuito. Recomendo duas publicações por pergunta e gratuidade para os 30 primeiros.
13. **Indicação.** Contexto: os dois lados precisam ganhar. Proposta: quem indica recebe 20% da taxa gerada pelo
    indicado por 90 dias; o indicado não paga taxa nas primeiras apostas até 50 dólares. Custa no máximo 0,6% do volume
    indicado.
14. **Custo mensal real.** Contexto: as projeções usaram 3 mil, 10 mil e 25 mil dólares. Qual é o número?
15. **Investimento.** Contexto: ele citou a possibilidade de investimento antes do mês 10. Quanto e quando?
16. **Verba de aquisição nos seis primeiros meses.** Recomendo perto de zero em mídia paga: parceiros, conteúdo no X
    e beta com pontuação.
17. **Esportes na fase 2.** Confirmar que é estudo, e para qual público, dado o enquadramento no Brasil.

### Parte 3 — Tokens

18. **Token A alimentando as pools.** Proposta: a taxa de criador do pump.fun vai 100% para o fundo de prêmios. A
    divisão é definida uma única vez e não muda.
19. **Queimar A para comprar B.** Recomendo adotar, opcional e com teto, depois de consulta jurídica.
20. **Como medir o tempo de posse do B.** Opções: (a) staking com trava; (b) saldo na carteira. Recomendo (a).
21. **Repasse ao cofre do B.** Quanto do lucro e a partir de quando. Recomendo só depois do equilíbrio.
22. **O que alimenta as pools.** Recomendo uma fatia das recompensas em USDC, nunca o token B em staking.
23. **O que os holders votam.** Recomendo começar por "quais sugestões de pergunta a equipe abre".
24. **Ordem e datas.** Recomendo o A só com o produto utilizável, e o B depois do equilíbrio.
25. **Distribuição do B.** Recomendo partir da proposta do sócio: venda privada 15%, equipe 15% com trava de 18 meses.

### Parte 4 — Construção e risco

26. **Critério para sair da devnet.** Recomendo auditoria, multisig e teto global temporário.
27. **Fase do SODAX e do Cloak.** Os dois só existem na rede principal. Recomendo integrar na fase da mainnet.
28. **Brasil.** Bloquear ou não no lançamento, e onde constituir a empresa. Assunto para advogado.
29. **Acordo com o Ronaldo** e quem reescreve o programa.
30. **Quem assina o multisig e quem é o CTO** que recebe os alertas.
