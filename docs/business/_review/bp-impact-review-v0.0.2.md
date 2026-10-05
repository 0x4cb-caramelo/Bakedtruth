# Revisão de impacto e pauta — BP v0.0.2

Data: 4 de outubro de 2026. Etapa 2.8 do wizard. Este arquivo tem três funções: registra a segunda devolutiva do
Lucas, mostra o efeito de cada mudança no resto do plano, e serve de pauta para quem escreve a Parte 1.

O Lucas pediu o BP em três ou quatro partes de 20 a 30 páginas, e a primeira agora: "podemos ir pra construção do BP
versão 0.0.2, mas vamos fazer apenas a primeira parte, neste momento."

## 1. Segunda devolutiva do Lucas (4 de outubro)

Trechos entre aspas são palavras dele. Vale sobre a revisão anterior onde houver conflito.

### Produto (Parte 1)

- **Nome: Brot Markets.** "eu já disse que será Brot Markets". "Brot" é pão em alemão; o mascote é o pãozinho Baked.
- **Token A e a conta do item 2.5:** "não vamos vincular o token A com a nossa empresa ... ele é um marketing com
  grandes limitações ... porém será importante para servir de canal de tração para pessoas conhecerem e irem visitar a
  nossa plataforma".
- **Perguntas curtas:** são o motivo da opção avançada: "para situações de apostas curtas a gente possa trabalhar com
  valores menores do que 24h". Dependem de fluxo: "do contrário a gente morre de termos baixas apostas apenas por
  termos baixo fluxo". Entram quando houver público e canal de distribuição.
- **Forma da taxa:** em aberto. Pediu simulação das duas formas (seção 2).
- **Pote de um lado só:** primeiro apostador sem taxa; os demais pagam 1% ("vamos na sua recomendação").
- **Pergunta anulada:** devolve tudo. "talvez seja a única forma de devolvermos tudo sem cobrarmos taxa".
- **Janela de 6 horas:** a equipe "pode só confirmar ou anular"; "se não revisar a tempo o pagamento saia sozinho ao
  fim das 6h".
- **Contestação:** só a equipe no MVP, com canal público de aviso; qualquer apostador com depósito na fase 1.2.
- **Disputa:** "uma arbitragem de resolução de disputas com novos oráculos e até revisão humana, em duas etapas", sem
  voto por token em staking, porque "é justamente neste ambiente que ocorre a manipulação dos resultados".
- **Esportes:** "a gente pensa numa fase 2 criarmos um oráculo específico pra isso".
- **Indicação:** aceita, financiada pela própria taxa do indicado: "vamos implementar desde o mvp".
- **Parceiros:** os 20 a 30 projetos convidados "nos entregam publicidade e postagem nas suas redes sociais".
- Faltou contexto nas perguntas sobre marco único de fechamento, cardápio do primeiro dia e vigia do serviço
  agendado. Elas voltam explicadas na Parte 1, como propostas.

### Negócio (Parte 2)

- **Fundo de prêmios no mês 10:** sai da operação só se ela já estiver paga.
- **Custos:** infraestrutura de até 1.000 dólares por mês no primeiro ano; três sócios com pró-labore de pelo menos
  1.500 dólares cada. Total de referência: 5.500 dólares por mês.
- **Investimento buscado:** "de USD50k nos primeiros 6 meses a USD 350k até o final do primeiro ano", mas "temos que
  trabalhar no bootstrap, sem depender de conseguirmos qualquer coisa".
- **Aquisição:** perto de zero em mídia paga. Há uma planilha com cerca de 50 mil investidores mapeados, numa pasta ao
  lado do projeto, para convite por email e funil de captação. **Ponto de atenção:** é dado pessoal e disparo em massa;
  precisa da revisão de privacidade do projeto antes de qualquer construção.
- **Esportes:** fase 2, para ampliar o público além do web3.

### Tokens (Parte 3)

- Taxa de criador do token A inteira para o fundo de prêmios: "perfeito".
- Queimar A para comprar B com desconto: "excelente, sim. Vamos partir desse desenho", para o A "não ser descartável".
- Tempo de posse medido por staking com trava: "isso".
- Repasse ao cofre do B só depois do equilíbrio; pediu mais recomendações sobre o que é saudável para a empresa.
- O que alimenta as pools é uma fatia das recompensas em USDC: "perfeito".
- Governança começa por quais perguntas abrir, na fase 2, depois do lançamento do B.
- Ordem (A com o produto utilizável; B depois do equilíbrio) e distribuição do B: de acordo.

### Construção (Parte 4)

- Critério para sair da devnet: auditoria, multisig e teto global temporário. Auditoria em negociação com duas
  empresas (uma delas, proofofexploit.com).
- Cloak integrado já na devnet, para a trilha de privacidade do hackathon; SODAX na fase da mainnet.
- Sem bloqueio de país por enquanto; empresa ainda não constituída: "estamos codando pro colosseum".
- **O programa será reescrito aqui, do zero**, "olhando pro código dele para reaproveitar os trechos e pedaços que nos
  interessam", seguindo as regras de código do Lucas.
- CTO: Ronaldo. Alerta por email, com Telegram na fase 2.

## 2. Simulação da taxa

Duas formas, num pote de 1.000 USDC. "Fatia vencedora" é a parte do pote que estava no lado que ganhou.

- **Forma A, a decidida até aqui:** 3% do pote inteiro.
- **Forma B:** 10% do lado perdedor, que é o mesmo que 10% do ganho dos vencedores.
- **Forma C:** igual à B, com 8%.
- A fórmula da Polymarket e da Kalshi é `coeficiente × contratos × preço × (1 − preço)`. Ela precisa de um preço por
  negociação, que o pote não tem. Aplicada ao pote como se a fatia fosse o preço, com o coeficiente de 0,07, dá a última
  coluna, só para comparação.

**Tabela 1. Taxa e retorno do vencedor por 1 USDC apostado** (contas conferidas por script).

| Fatia vencedora | A: taxa | A: recebe | B: taxa | B: recebe | C: taxa | C: recebe | Fórmula dos líderes |
|---|---|---|---|---|---|---|---|
| 30% (azarão vence) | 30 | 3,233 | 70 | 3,100 | 56 | 3,147 | 14,70 |
| 50% | 30 | 1,940 | 50 | 1,900 | 40 | 1,920 | 17,50 |
| 60% | 30 | 1,617 | 40 | 1,600 | 32 | 1,613 | 16,80 |
| 70% | 30 | 1,386 | 30 | 1,386 | 24 | 1,394 | 14,70 |
| 80% | 30 | 1,212 | 20 | 1,225 | 16 | 1,230 | 11,20 |
| 90% | 30 | 1,078 | 10 | 1,100 | 8 | 1,102 | 6,30 |
| 95% | 30 | 1,021 | 5 | 1,047 | 4 | 1,048 | 3,33 |
| 97% | 30 | 1,000 | 3 | 1,028 | 2,40 | 1,028 | 2,04 |
| 99% | 30 | 0,980 | 1 | 1,009 | 0,80 | 1,009 | 0,69 |

Leitura: na forma A, com 97% do pote no lado vencedor, quem acerta recebe exatamente o que pôs; com 99%, perde 2%
mesmo acertando. Nas formas B e C quem acerta sempre ganha. Em potes equilibrados a B cobra mais que a A (50 contra
30); a partir de 70% no lado vencedor, cobra menos.

**Tabela 2. Receita esperada da casa, em % do pote**, supondo que o lado com fatia `q` vence com probabilidade `q`
(apostadores bem informados). Fórmula da forma B: `2 × 0,10 × q × (1 − q)`.

| Fatia do favorito | A | B (10%) | C (8%) |
|---|---|---|---|
| 50% | 3,00 | 5,00 | 4,00 |
| 60% | 3,00 | 4,80 | 3,84 |
| 70% | 3,00 | 4,20 | 3,36 |
| 75% | 3,00 | 3,75 | 3,00 |
| 80% | 3,00 | 3,20 | 2,56 |
| 81,6% | 3,00 | 3,00 | 2,40 |
| 85% | 3,00 | 2,55 | 2,04 |
| 90% | 3,00 | 1,80 | 1,44 |
| 95% | 3,00 | 0,95 | 0,76 |

**Tabela 3. Três misturas de perguntas**, com 1 milhão de USDC apostado no mês (INFERÊNCIA: as misturas são hipótese).

| Mistura | A | B (10%) | C (8%) |
|---|---|---|---|
| Maioria de perguntas de preço, equilibradas (70% dos potes entre 50% e 60%; 30% entre 80% e 90%) | 30.000 | 41.800 | 33.440 |
| Meio a meio | 30.000 | 37.000 | 29.600 |
| Maioria de fatos on-chain com favorito claro (30% equilibrados; 70% entre 85% e 95%) | 30.000 | 26.950 | 21.560 |

**Recomendação (proposta, aguardando decisão):** forma B, 10% do lado perdedor. Motivos: ninguém perde por acertar;
a explicação cabe numa frase ("a casa fica com 10% do que os vencedores ganham"); rende mais que os 3% sempre que o
favorito tem menos de 81,6% do pote, que é o caso das perguntas de preço do cardápio proposto; e some o problema da
taxa em pote de um lado só, onde não há ganho. O custo: em perguntas com favorito muito claro a receita cai, e em pote
equilibrado a casa cobra 5% do pote, no topo da faixa do setor (1,9% a 5% dos dólares pagos). A forma C fica dentro da
faixa em todos os casos e rende menos.

## 3. Propostas da Parte 1 que ainda aguardam decisão

1. **Forma da taxa:** A, B ou C (seção 2).
2. **Um fechamento só e duração máxima.** A regra gradual tinha dois momentos: T1, até onde apostas e saídas eram
   livres, e T2, quando tudo fecha. Sem saída no MVP, o T1 perde a função. Proposta: só o T2, e perguntas de no máximo
   30 dias no MVP.
3. **Cardápio do primeiro dia**, isto é, os tipos de pergunta que a equipe pode abrir no lançamento. Proposta: preço
   de ativo grande lido de oráculo on-chain (leitor a construir); queima de token do padrão clássico; liquidez travada
   para sempre na Meteora; tamanho de pool de staking numa época; stake de validador numa época. Ficam fora: os tipos
   decididos de graça por uma chave (renúncia de emissão, renúncia de congelamento, programa imutável, metadados
   imutáveis); tokens do padrão novo, usado pelo pump.fun, até o leitor ser atualizado; preço de token pequeno, que
   entra em três degraus.
4. **Vigia do serviço agendado.** O serviço principal confere as perguntas a cada minuto. O segundo, em outro
   provedor, confere o principal a cada 5 minutos. Proposta para o "xx minutos e yy tentativas": 10 minutos sem resposta
   e 3 tentativas de religar; então o segundo assume, rodando a cada 5 minutos, e manda email ao CTO.
5. **Disputa em duas etapas** (proposta de desenho):
   - *Gatilho.* Nas 6 horas depois da resolução, um aviso de contestação pausa o pagamento. No MVP só a equipe aciona,
     e qualquer pessoa avisa por um canal público. Na fase 1.2, qualquer apostador da pergunta aciona, com um depósito
     (por exemplo 50 USDC) devolvido se a contestação proceder.
   - *Etapa 1, segunda fonte.* O mesmo dado é lido de novo por caminho independente: outro provedor de acesso à rede
     e, em pergunta de preço, um segundo oráculo. Se as leituras confirmam a resolução, a contestação cai e o pagamento
     sai. Se divergem, vai à etapa 2. Prazo de até 1 hora.
   - *Etapa 2, revisão humana.* Dois de três membros da equipe examinam e só podem confirmar ou anular. Prazo de até 48
     horas. A decisão e o motivo são publicados.
   - Não há voto por token. A equipe nunca inverte um resultado.
6. **Indicação, os números:** quem indica recebe 20% da taxa gerada pelo indicado por 90 dias; o indicado não paga
   taxa até completar 50 USDC apostados. Sai do fluxo de taxas, sem caixa próprio.

## 4. Revisão de impacto

| Mudança | Onde mais mexe |
|---|---|
| Nome Brot Markets | Marca e textos do app (`app/lib/brand.ts`), protótipos, domínio, pesquisa de marcas; o `NAMING.md` do sócio recomendava outro nome. Parte 4 |
| Saída fora do MVP | Sai a instrução de saída e o cofre de penalidades; o modelo financeiro deixa de descontar 15% da base da taxa (a taxa efetiva volta de 2,55% para 3% na forma A). Partes 2 e 4 |
| Forma da taxa, se mudar para B ou C | Receita por pergunta passa a depender do equilíbrio do pote; todas as projeções da Parte 2 precisam ser refeitas; o programa calcula a taxa sobre o lado perdedor. Partes 2 e 4 |
| Destino da taxa em 25% tesouraria e 75% operação | O ponto de equilíbrio cai para um terço do calculado na v0.0.1 (a operação recebe 2,25% do volume, não 0,75%). Com custo de 5.500 dólares por mês, o equilíbrio fica perto de 244 mil apostados por mês na forma A. Parte 2 |
| Custo mensal de 5.500 dólares | Substitui os três níveis de custo da v0.0.1. Parte 2 |
| "70/30" definido como 70% para o pote | Receita de patrocínio por faixa: 150, 450 e 1.500 dólares para a plataforma. Parte 2 |
| Parceiros gratuitos (20 a 30) | Receita de patrocínio do primeiro ano perto de zero; o valor é aquisição. Parte 2 |
| Fundo de prêmios só no mês 10; recompra só no mês 13 | Sem saída de caixa para os dois no primeiro ano. Partes 2 e 3 |
| Janela de 6 horas e disputa em duas etapas | Novo estado da pergunta ("em revisão"), chave de equipe com poder de anular, pagamento automático depois da janela; a frase "pago em minutos" deixa de valer. Partes 1 e 4 |
| Pagamento automático ao vencedor | Alguém paga a taxa de rede de cada pagamento e as contas precisam existir; o serviço agendado ganha essa função. Parte 4 |
| Tipos de chave única fora | Quatro dos nove leitores ficam sem uso no pote; o cardápio depende do leitor de preço, que não existe. Partes 1 e 4 |
| Indicação desde o MVP | O programa ou o serviço precisa registrar quem indicou quem; receita líquida menor no volume indicado. Partes 2 e 4 |
| Cloak na devnet agora | Trabalho de integração antes do previsto; o Cloak só existe na rede principal, então a parte privada roda lá e o programa na devnet. Parte 4 |
| Reescrita do programa aqui, do zero | Muda o roteiro e a dependência do sócio; exige os documentos da Fase 4 do wizard antes do código. Parte 4 |
| Token A sem vínculo com a empresa | A conta do item 2.5 sai; o A entra como canal de tração. Partes 1 e 3 |
| Lista de 50 mil investidores | Revisão de privacidade antes de qualquer disparo. Parte 2 |

## 5. Pauta da Parte 1 — Produto

**Arquivo de saída:** `docs/business/BP-v0.0.2-parte-1-produto.md`.
**Tamanho:** entre 9.000 e 12.000 palavras, contadas com `wc -w`. Acima de 12.000, cortar. O fundador disse que a
versão anterior foi exagero.
**Fonte do texto:** `docs/business/_review/bp-parte-a.md` (capítulos 1 a 4 da v0.0.1), reescrito e encurtado com as
decisões das seções 1 a 3 deste arquivo e de `docs/business/ideacao-perguntas-e-respostas.md`, seção 1.
**Números:** só os de `docs/business/_review/wave-3-coordinator.md` e os deste arquivo.

| Capítulo | Conteúdo | Palavras |
|---|---|---|
| Cabeçalho | Título "Brot Markets — Business Plan v0.0.2 — Parte 1: Produto", data, estado, como ler, o que mudou desde a v0.0.1 em dez linhas | 300 |
| 1. Resumo | O que é, para quem, como funciona num exemplo, o que está decidido e o que falta decidir | 700 |
| 2. O que é e para quem | Mercado de previsão em pote; público web3; o que existe hoje e o que se aproveita; o token A como canal de tração, sem vínculo com a empresa | 900 |
| 3. O produto | 3.1 a pool por pergunta e as três trilhas; 3.2 a conta do pote com exemplo; 3.3 a taxa: as formas A, B e C com as três tabelas da seção 2 e a recomendação, como decisão pendente; 3.4 pote de um lado só e pergunta anulada; 3.5 fechamento das apostas (padrão, opção avançada para perguntas curtas, T2 para as longas, proposta de marco único e 30 dias); 3.6 saída antecipada: fora do MVP, fórmula guardada para a fase 2, em um quadro curto; 3.7 patrocinador e parceiros (faixas, 70% para o pote, duas formas, anônimo, pedido de pergunta, parceiros gratuitos); 3.8 indicação; 3.9 pagamento automático | 4.300 |
| 4. Perguntas e resolução | 4.1 os dois ciclos de pergunta e as sugestões pelo X; 4.2 os tipos de pergunta em linguagem simples, cada um com uma pergunta de exemplo e quem controla o resultado, e o cardápio proposto; 4.3 o que fica fora e por quê; 4.4 como a pergunta se resolve e o serviço agendado em dobro; 4.5 a janela de 6 horas; 4.6 a disputa em duas etapas; 4.7 como falamos disso: frases verdadeiras e agradáveis de ler | 3.600 |
| 5. Decisões pendentes e objeções | As seis propostas da seção 3 em tabela, cada uma com contexto, opções e recomendação; e uma tabela curta das objeções da v0.0.1 que tocam a Parte 1, com a situação (resolvida, adiada, mantida) | 700 |

**Regras de redação:** português do Brasil; leitor que não é engenheiro; cada conceito com definição, motivo e
exemplo com números; sem siglas soltas; decisões do fundador como decisões, com as palavras dele quando ajudar;
propostas marcadas como "Proposta, aguardando decisão"; etiquetas FATO, FATO SECUNDÁRIO e INFERÊNCIA só nos números
que vêm de fora; nada de promessa de retorno. Manter os identificadores das objeções (OBJ-02, OBJ-07 etc.), porque o
fundador revisa por eles. Sem caixas longas de objeção: a tabela do capítulo 5 basta.
