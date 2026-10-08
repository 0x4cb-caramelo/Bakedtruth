# 2026-10-08 — A proposta de arquitetura refeita sobre o BP v0.0.3: abertura por qualquer carteira; nada decidido ainda

## Context

O pedido, em inglês: planejar a stack e a arquitetura, conferir a proposta de arquitetura da véspera e atualizá-la
tomando como base o novo plano de negócio, o BP v0.0.3 de 8/10/2026.

O BP v0.0.3 chegou como um arquivo único, montado com o índice e as quatro partes. As partes, a revisão de impacto
que ele cita e a terceira versão do deck não estão no repositório. O `docs/business/BUSINESS-PLAN.md` ainda é a v0.0.2.

A proposta 0.2, de 7/10/2026, foi escrita sobre o BP v0.0.2, em que só a equipe abria mercados, em duas pessoas.
O BP v0.0.3 reescreve o plano a partir do pitch de 7/10/2026, e cinco regras dele chegam ao programa:
- qualquer carteira abre um mercado por 0,02 SOL, "dentro das regras";
- quem abriu fica com 1% do pote, e ainda não se sabe de onde sai esse 1%;
- o SOL volta, só para a taxa de abertura;
- o patrocínio passa a 90% de prêmio e 10% de taxa, e o pedido de pergunta com 14 dias sai, como proposta;
- o teto por mercado volta à mesa.

## Decision

São **propostas**. O plano técnico, o resumo de produto e o roteiro não mudaram. O próprio BP pede que o resumo de
produto, o plano técnico e a Sprint 02 sejam revistos antes de a Sprint 02 começar, e a proposta 0.3 é a base técnica
dessa revisão.

1. **A stack fica.** Abrir a criação muda o que o programa confere e quantos mercados os serviços vigiam. Não muda o
   que os serviços são. Continuam recusados PostgreSQL, Redis, indexador por gRPC e LangGraph, cada um com o gatilho
   que o traria de volta.
2. **"Dentro das regras" vira código do programa.** Uma instrução nova, `user_open_market`, substitui a abertura em
   duas pessoas. Ela confere:
   - o tipo;
   - a conta lida;
   - a lista de contas aceitas;
   - a duração de 3 a 90 dias;
   - as taxas, que quem abre não escolhe;
   - os tetos.

   Não recebe texto nenhum. Por isso não há título para moderar nem texto de terceiro para injetar numa página ou num
   modelo de IA.
3. **O 1% de quem abriu é uma função só, com três corpos possíveis.** As contas guardadas na rede são iguais nos
   desenhos A, B e C do BP. Só a conta do pagamento, na Sprint 04, espera a decisão 1. A proposta constrói o B, que o BP
   recomenda, porque ele mantém "quem acerta nunca recebe menos do que pôs" como regra que o teste sorteado confere.
4. **Quem abre paga exatamente 0,02 SOL.** O programa desconta da taxa o aluguel das contas novas e manda o resto à
   carteira de várias assinaturas. No fechamento, o aluguel volta para essa mesma carteira. O aluguel dá cerca de um
   terço da taxa: é estimativa, a medir na Sprint 02.
5. **Achado novo: o teto global sai barato de ocupar.** A primeira carteira de um pote de um lado só não paga taxa, e o
   mercado pode durar 90 dias. Com um teto global de exemplo de 10 mil dólares e teto de mil por mercado, dez mercados
   e 0,2 SOL travam todos os outros por até 90 dias, e o dinheiro volta inteiro no fim. A proposta recomenda uma regra
   de equilíbrio entre os dois lados de cada mercado, mais um alerta e a subida do teto como resposta. A regra não
   elimina o ataque: faz ele custar cerca de 1% do dinheiro travado. Entra como insumo da decisão 18 do BP.
6. **Os serviços crescem sem mudar de natureza:**
   - o keeper lê as contas em lotes de 100;
   - o preço é tratado por ativo, e não por mercado;
   - um teto de mercados abertos limita o trabalho;
   - a revisão das 6 horas passa a ser por exceção;
   - o indexer ordena a página inicial e tira dela os mercados vazios, sem mexer na rede.
7. **Três telas para os motores de crescimento:**
   - o cartão de cada mercado para o X;
   - o painel "confira você mesmo", que sustenta o "Anyone can re-check" do pitch;
   - a caixa de abertura, por modelos de frase, sem IA.

   O protótipo aprovado não tem tela de abertura. Por isso entra a decisão D8.
8. **IA e Seeker seguem como estavam.** A abertura não precisa de modelo. O revisor de IA opcional muda de alvo: em vez
   de conferir rascunhos de mercado da equipe, confere as propostas de conta para a lista. Para a loja do Seeker,
   mercado aberto por qualquer pessoa conta como conteúdo de usuário e pede um botão de denúncia.
9. **Decisões.** Das 19 decisões do BP, 15 tocam a arquitetura, e a seção 5.1 da proposta liga cada uma à sprint que
   ela trava. Pela leitura do código, a Sprint 02 precisa das decisões 2, 6, 13, 15 e 16; a 7 vale a partir da 03; a 1
   e a 10, da 04. O BP lista oito como travas da 02, e perguntar as oito agora continua sendo o caminho mais barato.
10. **Decisões da própria proposta:**
    - A D1 (a base da taxa) fecha. O BP v0.0.3 confirma 10% do lado perdedor; só falta corrigir o `/pitch2`, que
      ainda diz 3,5%.
    - Entra a D8, a tela de abertura.
    - A D6 passa a incluir a troca de `Question` por `Market` no código.

## Alternatives considered

- **Taxa de 0,02 SOL mais o aluguel por fora.** Recusada: o custo de abrir passaria de 0,02 SOL, contra o número do
  slide. Com o desconto do aluguel, o número fica exato.
- **Depósito de abertura devolvível**, como a pesquisa de 7/10 sugeria. Recusado agora: o BP fixou uma taxa que não
  volta (decisão 2). Fica como gatilho, se a taxa espantar quem abre a sério.
- **Teto por carteira contra a ocupação do teto global.** Recusado como defesa principal: sem cadastro, uma carteira
  nova contorna o limite de graça.
- **Limite para um lado só enquanto o outro está vazio.** Era a primeira versão da defesa. A checagem mostrou que não
  funciona: a mesma carteira pode ficar nos dois lados, põe 1 USDC no outro e o limite cai. Trocado pela regra de
  equilíbrio.
- **Lista fechada também para os preços da Pyth, como porta de entrada.** O BP diz as duas coisas: uma passagem põe os
  preços na lista, e a proposta do próprio BP abre o tipo de preço a todos. A arquitetura concilia assim: a entrada de
  um ativo na lista serve para dar o teto daquele ativo, e não para barrar quem abre. Fica como pergunta dentro da
  decisão 7.
- **IA na caixa de abertura.** Recusada como padrão: um modelo de frase resolve, com resposta igual para o mesmo texto.
  O modelo só entra depois, se o fundador quiser (D2), e nunca escreve um endereço de conta.

## Consequences

- **A Sprint 02 cresce:** passa de "núcleo do pote" a "núcleo do pote e abertura por qualquer carteira". O BP diz que
  cabe no mês de devnet "se for a única prioridade".
- **O hackathon de 12/10 e o plano passam a apontar para o mesmo lugar.** O recorte para quatro dias é um tipo só, de
  ponta a ponta: mercado de preço em SOL ou BTC, aberto por qualquer carteira. São os dois únicos ativos com preço
  fresco na devnet.
- **A proposta cita o BP v0.0.3 por seção,** mas as partes dele não estão no repositório. Enquanto não forem
  guardadas, a citação aponta para um arquivo que só o fundador tem.
- **A seção 6 da proposta lista o que muda** no plano técnico, no resumo de produto, no documento de design, no
  roteiro, no `CLAUDE.md` e no site no ar, se ela for aprovada.

## O que deu errado no caminho

- **A checagem independente achou erros na primeira redação da 0.3, todos corrigidos antes de entregar:**
  - a conta de quem abre e entra nos dois lados estava com os números do exemplo do slide (o certo é receber 950 de
    1.000, como o BP diz);
  - a primeira defesa contra a ocupação do teto não funcionava;
  - a Sprint 02 dependia da lista de contas, que só nasce na 03;
  - quatro rótulos de fonte estavam errados, entre eles o prazo da MP no Congresso, que o BP marca como não conferido.

- **As versões dos pacotes não foram conferidas de novo.** São as lidas em 6 e 7/10, um dia antes, e o documento diz
  isso.
- **O tamanho da conta do mercado é estimado (cerca de 430 bytes),** e com ele o aluguel. O BP também não tem esse
  número. A medida é tarefa da Sprint 02 (T19).

## Follow-up

- **Fundador:**
  - as decisões do BP que travam a Sprint 02 (2, 6, 13, 15 e 16, e de preferência as oito que o BP lista);
  - o pedido do parecer jurídico (L0);
  - a D8, a tela de abertura.
- **Repositório:** guardar as partes do BP v0.0.3 e a revisão de impacto em `docs/business/`.
- **Equipe, na abertura da Sprint 02:** T4, T9, T10 a T12 e T17 a T19.
- **Site:** o `/pitch2` ainda mostra a taxa de 3,5% do pote, que o BP v0.0.3 contradiz.

## Fontes

- `docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md`, versão 0.3, e o Apêndice C.
- O BP v0.0.3, cópia montada de 8/10/2026.
- `knowledge-base/market/pumpfun-model-for-open-markets.md`.
- `docs/technical/TECHNICAL-PLAN.md`, seção 3.4.
