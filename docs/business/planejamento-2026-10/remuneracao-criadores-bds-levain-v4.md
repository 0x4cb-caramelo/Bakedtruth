# Criadores, BDs e Levain: o plano v4 (resumo)

Resumo do documento vivo "Brot Markets — Plano de criadores, BDs e Levain (v4)", de 19/10/2026. As versões 1 (17/10),
2 (17/10) e 3 (19/10) vieram antes; a v3 foi atualizada no mesmo documento para virar a v4. Nada disto está ainda no
programa, no plano de negócios ou nos Termos.

## Em uma frase

Com as regras da v4 e a taxa mantida em 10% do lado perdedor, o Brot fica com US$ 146,8 mil em seis meses no cenário
de base (US$ 84,8 mil na v2), e com cerca de US$ 50,5 mil no cenário cético, com metade do volume dos KOLs.

## Quem paga quem

| Persona | Recebe | Quem paga |
| --- | --- | --- |
| Criador (KOL ou projeto) | 1% / 1,2% / 1,5% das entradas, pelo tier, sempre, inclusive em campanha grátis | O lado perdedor do pote |
| BD (Miller) | 10% / 15% / 20% / 25% da taxa, pela faixa de volume do mês dos criadores dele | O Brot, da taxa |
| Baker | O pote, quando acerta; Crumbs, quando perde | Os perdedores; o Brot, nos Crumbs |
| Patrocinador | A vitrine do patrocínio | Ele mesmo |
| Brot | 10% do lado perdedor, a parte da abertura, 15% do prêmio adicional e a parte do criador nas campanhas da casa | Perdedores, quem abre, quem patrocina |

## O que foi decidido (Lucas, 17 a 19/10/2026)

- **Tudo em USDC**, com conversão de SOL e de moedas líquidas dentro do app. O Brot paga a conversão até um teto;
  acima dele, paga o usuário.
- **Tiers** Loaf, Batch e Bakery a US$ 500, 2.500 e 10.000; parte do criador de 1%, 1,2% e 1,5%.
- **Levain** de 120 dias a partir do lançamento (até 16/03/2027), sem limite de criadores ou BDs, com aberturas
  grátis em três níveis e metas de volume e carteiras. O Brot não põe prêmio: o prêmio é opcional e vem do criador ou
  de um patrocinador.
- **BD:** faixas de 10% a 25% da taxa, pela faixa cheia e sem teto; vínculo com o criador mês a mês, pelas entregas
  do mês anterior, com um mês de folga; indicação de outro BD a 15% da taxa do indicado por 90 dias, em dois graus;
  fixo de até US$ 1.000 (o Fixo 2) nos meses em que a meta é batida, a partir do 4º mês.
- **Campanha patrocinada pelo caminho C:** o KOL abre e o projeto acrescenta o prêmio.
- **Campanhas da casa:** o Brot abre sozinho a Rodada relâmpago e a Corrida de formação e fica com a parte do criador.
- **Bake-off:** dois criadores, tier meio a meio como padrão, combinável; cada um recebe a parte sobre as entradas do
  seu lado.
- **Caminho B:** 70% da parte do criador para o KOL e 30% para o projeto que pagou o tier, ajustável.
- **A taxa fica em 10%** e não aparece como porcentagem em anúncio: a tela mostra o multiplicador líquido de quem
  acerta, e o Brot fica com cerca de 4% do pote em média.
- **Os Crumbs** são a base do airdrop de um token futuro, como rascunho para os sócios.
- **Coleções de NFT por evento** (The/Garage e Island DAO) e entradas de outras redes e privacidade depois do USDC.

## O que está proposto e aberto

| Proposta | Por quê |
| --- | --- |
| A abertura deixa 15 / 20 / 25% para o Brot (era 10 / 12 / 15%) | A vitrine da Bakery dá muito mais trabalho que a da Loaf |
| A parte do criador dividida entre até três recebedores | Resolve o Bake-off, o patrocínio e parcerias com a mesma peça |
| Quem controla o resultado não entra na campanha | O criador que decide a métrica e aposta nela leva o pote |
| Uma campanha por pergunta | Dois potes rasos pagam pior que um fundo |
| A meta do fixo medida no que o Brot líquida recebe | A taxa média varia de 2,7% a 4,5% |
| A faixa de 25% do BD vira 20% depois do Levain | Só pesa acima de US$ 500 mil por mês, quando o BD já ganha mais de US$ 3.700 |
| Crumbs de consolo: só quem perde ganha ponto | Custa um quinto da versão anterior e mira quem mais desiste |
| Créditos grátis do Levain vencem em 60 dias | Sem prazo, o criador nunca compra um tier |
| Fornada, o bilhete combinado | Nas plataformas grandes, as combinadas são a maior parte do volume |
| API aberta e Semeadores | Robôs que entram no lado barato equilibram os potes e sobem a taxa |
| Turbo pago, no lugar da alavancagem | Dá a sensação sem o Brot emprestar dinheiro |

## Os tipos de pergunta

Quinze tipos: os seis que o programa já lê (preço, oferta do token, pool da Meteora, stake pool, stake de validador e
saída da curva de lançamento), sete desenhados na v2 (Bake-off, Escada, Promessa de tesouraria, Torneio, Temporada,
Pergunta sob medida e Lançamento completo) e dois novos da casa (Rodada relâmpago e Corrida de formação). O documento
vivo traz, para cada um, quem abre, quem paga, como divide e o que muda no programa.

## A projeção de seis meses

| Cenário | Brot fica (US$) | Depois do custo de US$ 5.500 por mês (US$) |
| --- | --- | --- |
| v2, regras antigas | 84.832 | +51.832 |
| v3, com as alavancas e a taxa em 10% | 119.716 | +86.716 |
| v4, com Fornada, Semeadores, Turbo e as coleções | 146.808 | +113.808 |
| Cético: metade do volume dos KOLs, sem casa e sem produtos novos | 50.482 | +17.482 |

As premissas de volume das alavancas novas são do plano, não de fontes. O confronto com o tamanho do mercado está em
[`knowledge-base/market/mercados-de-previsao-por-categoria-2026.md`](../../../knowledge-base/market/mercados-de-previsao-por-categoria-2026.md).

## O que muda no programa, por ordem

1. USDC em tudo: cofres como contas de token, abertura sem a Pyth, todos os pagamentos em USDC.
2. Os três tiers e o crédito de abertura do Levain com o criador como dono.
3. A parte do criador dividida entre até três recebedores.
4. O prêmio adicional do patrocinador (a instrução da Sprint 15), em USDC.
5. A lista de quem não pode entrar em cada campanha.
6. Leitores novos: comparação entre duas contas, preço num horário exato, saldo de uma conta de token e a curva do
   pump.fun.
7. Uma campanha por pergunta.
8. O pote da Fornada e o fundo de Turbo.
