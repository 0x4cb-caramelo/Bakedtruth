# Revisão de impacto: BP v0.0.3 → v0.0.4

**Data:** 8 de outubro de 2026. **Origem:** as respostas do fundador de 8/10/2026, nesta sessão
(`session-log/2026-10-08-decisoes-do-fundador-bp-v0.0.4.md`). **Base:** a v0.0.3, nas quatro partes
`docs/business/BP-v0.0.3-parte-*.md`. **Regra do método:** toda mudança no plano de negócio é conferida
contra o que ela move nos outros documentos (skill `business-plan-impact-review`).

Esta revisão não muda os documentos que ela lista, exceto o próprio plano (v0.0.4) e a proposta de arquitetura (versão
0.4). O resumo de produto, o plano técnico, o roteiro, as sprints, o documento de design, o deck e o site no ar ficam
como estão até o fundador aprovar a v0.0.4.

## 1. As mudanças e o que cada uma move

| # | Mudança de 8/10/2026 | No plano | Fora do plano | Peso |
|---|---|---|---|---|
| 1 | **Tudo em SOL** ("tudo em sol"). Desfaz a decisão de 4/10 sobre o USDC | P1 §3.1 e todos os exemplos; P2 receitas, equilíbrio e um risco novo (preço do SOL); P4 cofre, tesouraria, Cloak e SODAX | Plano técnico (cofre de USDC, `USDC_MINT`, `transfer_checked`, conta de USDC do vencedor); `app/lib` e o programa congelado, que usam USDC; a torneira de USDC de teste da Circle no beta; `CLAUDE.md` ("People bet USDC") | Alto |
| 2 | **Abrir custa US$ 500 em SOL: 90% prêmio, 10% Brot.** Era 0,02 SOL | P1 §3.7 e §4.1 (abertura e patrocínio viram a mesma regra); P2 §4.4 (a taxa de abertura vira receita); P2 §6.2 (o motor "quem abre divulga" enfraquece) | Plano técnico (nova leitura de preço na abertura; prêmio depositado na abertura); resumo de produto (fluxo de abertura); o deck diz "0.02 SOL to open a market" e "pump.fun style" | Alto |
| 3 | **Preço do SOL para cobrar os US$ 500.** O fundador pediu pesquisa ("coingecko ou outro"). Proposta: Pyth lida pelo programa; CoinGecko só para exibir | P1 §4.1 | Proposta de arquitetura (leitura da Pyth SOL/USD na abertura) | Médio |
| 4 | **O 1% do criador sai do pote; da taxa do Brot só no caso extremo** | P1 §3.4 (os desenhos A, B e C deixam de ser opções); P2 §4.4 e §5 (as linhas do desenho C saem: o 1% quase não custa ao Brot) | Plano técnico (a conta do pagamento e as invariantes) | Médio |
| 5 | **Sem teto, nem global nem por campanha** | P4 §3.4 e §4.1 (a rede principal passa a ter dois critérios, e não três); P4 §4.4; P4 §7 (o risco de erro no programa perde o limite) | Plano técnico (`CapState`, `admin_set_cap`, a invariante I7); roteiro (critério de pronto da Sprint 16 e da 18); o slide "After an audit, a multisig and a cap" | Alto |
| 6 | **Sem lista de contas aprovadas** ("nao lidaremos com tokenomics") | P1 §4.2; P4 §4.3; P4 §7 (o risco do token sem valor fica sem esse redutor) | Proposta de arquitetura (sai a lista na rede e o registro revisado) | Alto |
| 7 | **Vocabulário: campanhas on-chain; baker; criador; SIM/NÃO; pote** | Todas as partes | Resumo de produto §12; plano técnico e código (nomes); site no ar, deck, `CLAUDE.md`; a memória do assistente | Médio |
| 8 | **Equipe abre; parceiros abrem de graça** | P1 §3.8 e §4.1 | Plano técnico (chave da equipe abre sem pagar) | Baixo |
| 9 | **Pedido de pergunta sai; patrocínio 90/10 fica** | P1 §3.7; P4 §4.6 | Plano técnico (sai a conta de pedido e quatro instruções); Sprint 15 encolhe | Baixo |
| 10 | **Pinocchio no lugar do Anchor** | P4 §2 e §7 (risco novo: checagem esquecida) | Plano técnico §1, §2, §3.4; CI; `CLAUDE.md` (comandos de build e testes); `packages/sdk` (IDL e cliente) | Alto |
| 11 | **Tudo em Bun, se viável** | P4 §2 | Plano técnico §1 e §12; a proposta mudava os serviços para Node 22 e volta atrás | Baixo |
| 12 | **App Android, mesmo backend, front próprio** | P4 §3.1 (uma fase nova) | Roteiro (nenhuma sprint para o app); documento de design (sem tela abaixo de 700 px); resumo de produto | Médio |
| 13 | **Sem IA** | P4 | Proposta de arquitetura (sai a camada de IA); a rota de chat herdada no app continua saindo na Sprint 09 | Baixo |
| 14 | **Sem prazo de hackathon** | P4 §1.3 e §3.2 | Roteiro §6 (a sequência mínima para o hackathon perde o motivo) | Baixo |
| 15 | **Advogado na equipe** | P4 §5.1 e §6 | Nenhum | Baixo |
| 16 | **Regras mínimas de abertura e sem texto livre; abertura, taxa de abertura e 1% do criador no núcleo** ("ok"; "site monta a frase"; "12 sim") | P1 §2.3, §3.6 e §4.2; P4 §3.3 e §4.3 | Plano técnico e Sprint 02 (as regras na instrução que abre); resumo de produto (a frase montada pelo site) | Médio |

## 2. As contas refeitas

Todas são INFERÊNCIA, conferidas por script em 8/10/2026, com o preço de referência de US$ 109,27 por SOL (CoinGecko,
8/10/2026, 15:29 UTC).

**Conversões.** US$ 500 = 4,5758 SOL; US$ 450 = 4,1182 SOL; US$ 50 = 0,4576 SOL; o custo mensal de US$ 5.500 = 50,334
SOL; o equilíbrio de US$ 208.630 = 1.909 SOL por mês.

**O equilíbrio com aberturas pagas.** A operação recebe 2,63625% de cada dólar de volume (`3,70% × 75% × 95%`), e os
US$ 50 de cada abertura paga vão inteiros para a operação. Com N aberturas pagas por mês, o volume de equilíbrio é
`(5.500 − 50 × N) ÷ 0,0263625`.

| N por mês | Volume de equilíbrio por mês |
|---|---|
| 0 | 208.630 |
| 10 | 189.663 |
| 20 | 170.697 |
| 30 | 151.731 |
| 50 | 113.798 |
| 110 | 0 |

**O 1% do criador.** Como sai do pote, a taxa média do Brot continua em 3,70%. O caso em que ele sai da taxa só ocorre
quando o lado vencedor passa de 98,89% do pote, sem prêmio; nesses potes a taxa já é quase zero. Com o prêmio de US$ 450
de uma campanha paga, o caso quase não ocorre: só em potes acima de cerca de US$ 45 mil e muito desiguais. Os exemplos
completos estão na Parte 1, seção 3.4.

**O que não foi refeito.** Os cenários de caixa mês a mês: o modelo da revisão da v0.0.3 não está no repositório. A
v0.0.4 mantém os números da v0.0.3, em dólares, e diz que o patrocínio que eles contavam passa a ser abertura paga.

## 3. Contradições que as decisões criam

1. **O deck.** O slide de criadores diz "0.02 SOL to open a market" e "pump.fun style"; o de crescimento diz "MAINNET
   After an audit, a multisig and a cap". As três frases deixam de valer. O deck também usa "market" em todas as telas.
2. **O motor "quem abre divulga".** Com US$ 500 de entrada e 1% do pote, o criador só recupera o que pagou em potes acima
   de US$ 50 mil. Quem abre tende a ser projeto, que é o cliente, e não a pessoa caçando a pergunta polêmica que o pitch
   descreve.
3. **"Tudo em SOL" e a tesouraria.** A decisão de 5/10 guardava a tesouraria em USDC e depois em Bitcoin, e a proposta
   19 da v0.0.3 convertia o SOL em USDC. Com a plataforma toda em SOL e os custos em dólar, a regra precisa ser escrita
   de novo (P-7).
4. **Campanha de preço do SOL paga em SOL.** "O SOL toca US$ 300?" paga os vencedores do SIM em SOL, que vale mais
   justamente quando o SIM ganha. Não é erro, mas precisa estar na tela.
5. **O `CLAUDE.md` e o código.** O `CLAUDE.md` descreve o produto com "People bet USDC", e o programa congelado, o
   `app/lib` e os testes usam USDC e Anchor. A troca acontece na Sprint 02; até lá, os dois convivem.
6. **O resumo de produto e o plano técnico** ainda descrevem a equipe abrindo as perguntas em duas pessoas, o USDC, o
   teto global e o Anchor.

## 4. Riscos novos ou maiores

- **Perda sem limite num erro do programa**, porque o teto saiu. Gravidade: crítica.
- **Campanha sobre token sem valor decidida por quem a abriu**, porque a lista saiu. Gravidade: crítica, com os US$ 500
  e o aviso automático como únicos redutores. Os US$ 500 pesam pouco: se ele estiver sozinho no lado que forçou, os
  US$ 450 de prêmio voltam para ele, e a manobra compensa com pouco mais de US$ 56 de terceiros do outro lado
  (INFERÊNCIA: `0,9 × X > 50`). A entrada dele no lado que força não corre risco, então ele pode entrar grande e ficar
  com quase todo o prêmio: o limite baixo vale quase sempre.
- **O preço do SOL** entre receber a receita e pagar os custos. Gravidade: alta (Parte 4, capítulo 7).
- **Uma checagem de conta esquecida no Pinocchio.** Gravidade: crítica, reduzida por um módulo único de checagens com
  teste negativo para cada uma e pelas auditorias.
- **O Bun 1.4 recém-reescrito em Rust.** Gravidade: média, reduzida por versão fixa, teste de carga e o Node como
  reserva para o site.

Saem: o prazo do hackathon, uma carteira ocupando o teto global e o emissor do USDC congelando um cofre.

## 5. O que espera o fundador

As propostas da tabela "Esperam o fundador" do índice da v0.0.4: P-1 a P-8; a fonte do preço para cobrar os US$ 500
(D-f); o site em Bun; o slide da rede principal; a conclusão jurídica lida por um colega de fora; as duas novas (a
exceção de 5/10 sem o teto e o alcance de "nao lidaremos com tokenomics"); e as decisões da v0.0.3 que continuam
abertas: 3, 5, 8, 9, 11, 12, 14 e 17. A P-1 foi decidida depois, no mesmo dia: a primeira
resposta, "opção c", não correspondia a nenhuma opção, e o fundador aceitou a recomendação, nada nos três casos. A P-3 também: a equipe não paga os US$ 500 nem fica com o 1%,
e os parceiros, contra a recomendação, também não ficam com o 1%. Por fim, "sim para todos" decidiu a P-2, a P-4, a P-5
e a D-f como recomendado, e aprovou a proposta de arquitetura 0.4.

## 6. Documentos a rever depois da aprovação

| Documento | O que muda |
|---|---|
| `docs/product/PRODUCT-BRIEF.md` | F7 e R-32 (abertura); R-05 (moeda e tetos); R-15 a R-20 (patrocínio); a tela de abertura e o app; §12 vocabulário |
| `docs/technical/TECHNICAL-PLAN.md` | Pinocchio; SOL nativo; abertura com preço da Pyth; o 1% do criador; sem teto e sem lista; Bun; app Android; nomes |
| `docs/SPRINTS.md` e `docs/sprints/` | Sprint 02 (Pinocchio, abertura, SOL); 15 (encolhe); 16 e 18 (sem teto); um lugar para o app e para a tela de abertura; §6 (hackathon) |
| `docs/product/DESIGN-DIRECTION.md` | A tela de abertura; o layout de celular |
| `CLAUDE.md` | A descrição do produto, a moeda, o framework, os comandos |
| `services/landing/public/` | O texto da página inicial, o `/pitch` e o `/pitch2` |
| `docs/business/PITCH.md` | As frases que as decisões de 8/10 desmentem |
