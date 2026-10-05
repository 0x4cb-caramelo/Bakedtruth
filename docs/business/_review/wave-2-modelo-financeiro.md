# Onda 2, agente 2E: modelo financeiro do Baked Market

Data: 4 de outubro de 2026.

Papel deste relatório: entregar o modelo financeiro que o Business Plan vai usar, com todas as contas à mostra. As
decisões do fundador (seção 1 de `ideacao-perguntas-e-respostas.md`) foram respeitadas. As correções do red team
financeiro (`wave-2-business-finance.md`, agente 2B) foram usadas como insumo e a crítica dele não é repetida aqui.

Como ler:

- **FATO** e **FATO SECUNDÁRIO**: vêm dos arquivos da Onda 1 e da Onda 2, com a marca que cada arquivo deu. Não fiz
  pesquisa nova na web.
- **INFERÊNCIA**: toda conta e toda projeção deste arquivo. Nenhum número de volume, carteira, patrocinador, receita,
  resultado ou caixa abaixo é dado medido. A fórmula de cada um está na seção 1.3.
- **SUPOSIÇÃO**: valor que escolhi para poder fazer a conta, sem fonte. Está na tabela de premissas, com o motivo.
- Valores em dólares (o pote é em USDC). "M1" é o primeiro mês com dinheiro real na rede principal. "T5" a "T8" são
  os trimestres do segundo ano (meses 13 a 15, 16 a 18, 19 a 21 e 22 a 24).
- "Sentido A" do 70/30: 70% do patrocínio para a banca e 30% para o pote. "Sentido B": 30% banca e 70% pote.
- "Regime (a)": a taxa se divide em quatro partes desde o primeiro dia. "Regime (b)": a regra de partida do red team.

Conferência: as tabelas foram geradas por um script e conferidas com `node` antes de gravar. Os totais de volume, de
taxa e de caixa em 12 e em 24 meses foram refeitos por soma fechada e batem com o script (seção 3.6).

Limites (leia antes de usar os números):

- Não existe dado de uso do Baked Market. O programa de pote ainda não foi escrito.
- Três premissas não têm dado em nenhuma plataforma: quanto cada carteira aposta por mês, quanto dinheiro sai antes da
  resolução e quantos patrocinadores pagam. O modelo é sensível às três (seção 8).
- O modelo não tem impostos, não tem custo de aquisição paga e não tem a venda privada do segundo token como receita.

## Resumo em dez linhas

1. De cada US$ 100 apostados, a taxa rende US$ 2,55 (3% do pote final, que é 85% do apostado depois das saídas
   antecipadas) e a operação recebe US$ 0,64. O volume de equilíbrio é o custo mensal dividido por 0,6375%.
2. Cenário ruim: US$ 45 mil apostados no mês 12 e US$ 30 mil no mês 24; receita de US$ 1.148 e US$ 765 no mês. Não
   se paga em nenhum regime. Consome US$ 118 mil em 24 meses, ou US$ 68 mil se a equipe parar no mês 6.
3. Cenário razoável: US$ 300 mil no mês 12 e US$ 750 mil no mês 24; receita de US$ 9.400 (sentido A) ou US$ 8.400
   (B) no mês 12 e de US$ 22.275 ou US$ 20.475 no mês 24.
4. Cenário otimista: US$ 1,5 milhão no mês 12 e US$ 5 milhões no mês 24; receita de US$ 46.300 ou US$ 41.700 no mês
   12 e de US$ 140.800 ou US$ 133.200 no mês 24. Exige 13,7 vezes o dinheiro que o World tem travado hoje.
5. Equilíbrio no regime (a): razoável no mês 8 (A) ou 13 (B), e volta ao déficit no mês 18, quando a equipe passa a
   receber; otimista no mês 4. No regime (b): razoável no mês 6 e otimista no mês 2, sem recaída. Ruim: nunca.
6. O gasto antes do lançamento (US$ 51,5 mil, faixa de 30 a 75 mil) é a maior parte do capital. Total com reserva de
   seis meses: ruim US$ 125 a 136 mil; razoável US$ 77 mil em (b) e US$ 83 a 109 mil em (a); otimista US$ 70 a 73 mil.
7. A regra de partida economiza pouco enquanto ninguém recebe (US$ 3 a 11 mil) e muito quando há salário: com custo
   de US$ 10 mil desde o primeiro mês, o razoável pede US$ 174 a 210 mil em (a) e US$ 123 a 132 mil em (b).
8. Patrocínio: no razoável a banca recebe US$ 63 mil em 24 meses no sentido A e US$ 27 mil no B. Sem nenhum
   patrocinador, o razoável só empata no mês 17 em (a) e o capital sobe para US$ 118 mil.
9. O fundo de prêmios recebe 0,64% do volume e só se paga se causar 25% do volume. Bitcoin: o razoável acumula
   US$ 12,4 mil em 12 meses e US$ 54 mil em 24; uma queda de 50% tira US$ 27 mil, nove meses do custo sem salário.
10. Metas de 90 dias: ruim, menos de US$ 45 mil apostados e 150 carteiras; razoável, US$ 150 mil e 375 carteiras;
    otimista, US$ 750 mil e 1.500 carteiras. Em todos, o número que decide é quantas carteiras voltam sem prêmio.

---

## 1. Premissas

### 1.1 Decisões do fundador que o modelo respeita

| Decisão | Como entra no modelo |
|---|---|
| Taxa de 3% do pote, cobrada também na devolução de pote de um lado só | 3% sobre o pote final de toda pergunta, tenha ou não os dois lados |
| Destino da taxa em quatro partes iguais | 25% tesouraria em Bitcoin, 25% operação, 25% recompra e queima, 25% fundo de prêmios. É o regime (a) |
| Patrocinador em faixas de 500, 1.500 e 5.000 dólares | Contagem de patrocinadores por faixa, por mês |
| Divisão "70/30" entre banca e pool | Os dois sentidos, lado a lado, em toda tabela |
| Saída antecipada com penalidade, que fica no pote | Parte do dinheiro sai antes; a penalidade fica; a taxa incide sobre o que sobra |
| Moeda USDC | Todas as contas em dólar, sem risco de câmbio dentro do pote |

### 1.2 Tabela de premissas

| # | Premissa | Valor | De onde veio | Quão frágil é |
|---|---|---|---|---|
| 1 | Taxa | 3% do pote final | Decisão do fundador | Firme. A forma (fixa, sobre o pote inteiro) foi questionada por 2A e 2B; ver 8.6 |
| 2 | Parcela da operação | 25% da taxa | Decisão do fundador | Firme como decisão. É a premissa que mais pesa |
| 3 | Dinheiro que sai antes da resolução | 20% do apostado | SUPOSIÇÃO de 2B (seção 3.4), mantida para os dois relatórios usarem a mesma conta | Muito alta. O mecanismo não tem precedente (agente 1H) |
| 4 | Penalidade média de quem sai | 25% | SUPOSIÇÃO de 2B, compatível com a fórmula de 1H (`5% + 20% × tempo + queda`, exemplos de 11% a 35%) | Muito alta |
| 5 | Pote final como parte do apostado | 85% = 1 − 20% × (1 − 25%) | Conta sobre 3 e 4 | Herda a fragilidade de 3 e 4 |
| 6 | Taxa sobre o valor devolvido na saída | Não cobrada | Leitura literal da decisão ("penalidade pro pote"; taxa é "3% do pote") | Em aberto. 2B propôs cobrar; a diferença está em 8.5 |
| 7 | Depósito por carteira ativa por mês | US$ 150 (ruim), 200 (razoável), 250 (otimista) | SUPOSIÇÃO. 2B usou US$ 200. Único dado vizinho: Solana, dez/2025, US$ 1.360 por carteira em três semanas, com giro de livro de ordens (Step Data, via `market-research.md`) | Muito alta. "Não achei" em `publico-web3.md` |
| 8 | Carteiras ativas por mês | Trajetórias da seção 3.1 | SUPOSIÇÃO ancorada em World, Limitless, Myriad e PNP | Muito alta |
| 9 | Subida do volume | Linha reta até o mês 12 e outra até o mês 24 | SUPOSIÇÃO. É a mesma forma que 2B usou | Muito alta. Os concorrentes mostram picos e quedas de 80% a 96% |
| 10 | Perguntas abertas por mês | 8 (ruim); 8 a 24 (razoável); 12 a 80 (otimista) | SUPOSIÇÃO sobre a capacidade da equipe | Alta. 2A (O4) diz que não há fonte de perguntas toda semana |
| 11 | Duração média entre a aposta e a resolução | 14 dias | SUPOSIÇÃO, entre os 7 e os 30 dias de 2B | Alta. Não muda a receita do mês; muda o dinheiro travado (8.3) |
| 12 | Patrocinadores por mês | Zero (ruim); até cinco por mês, mais um de 5.000 por trimestre (razoável); até doze por mês (otimista) | SUPOSIÇÃO. Ruim em zero a pedido de 2A; razoável e otimista chegam no mês 7 à "base" e ao "otimista" de 2B | Muito alta. Não há precedente pago nem conversa registrada |
| 13 | Destino da parte da banca no patrocínio | 100% para a operação | Recomendação de 2B. Não é decisão | Em aberto. Se for dividida em quatro, ver 8.5 |
| 14 | Taxa de 3% sobre o dinheiro do patrocinador e do fundo dentro do pote | Cobrada no exemplo da seção 2; ignorada nos cenários | Premissa do agente 1F | Baixo efeito: US$ 80 a 110 por mês no razoável, mês 12 |
| 15 | Custo do nível 1 (ninguém recebe) | US$ 3.000 por mês | 2B: RPC 499 (FATO, Helius), site e agendadores 150, empresa 150, contador e advogado 500, reserva de auditoria 1.700 | Média |
| 16 | Custo do nível 2 (equipe enxuta) | US$ 10.000 por mês | 2B: nível 1 mais 2.000 por fundador, 2.000 de comunidade, 1.000 de suporte | Alta |
| 17 | Custo do nível 3 | US$ 25.000 por mês | `ECONOMICS.md`, que o chama de "placeholder". A divisão por linha é SUPOSIÇÃO minha | Alta |
| 18 | Quando a equipe sobe de nível | Nível 2 depois de três meses seguidos com US$ 400 mil apostados; nível 3 depois de três meses com US$ 1,57 milhão | O primeiro marco é de 2B (10.5). O segundo é meu: é o volume que paga o nível 2 na divisão em quatro | Alta. Ver a ressalva em 4.4 |
| 19 | Gasto antes do lançamento | US$ 51.500 | Pontos médios das faixas de 2B: auditoria 30.000, empresa 4.000, avaliação jurídica 10.000, prêmios iniciais 7.500 | Alta. Faixa de 30 a 75 mil; só cotação real resolve |
| 20 | Reserva | Seis meses do custo do nível 1 (US$ 18.000) | Fórmula de 2B (10.1) | Média |
| 21 | Momento da taxa | Lançada no mês da aposta | Simplificação minha | Média. Na prática entra na resolução: atraso igual à duração da pergunta |
| 22 | Preço do bitcoin | US$ 63.800 (ago/2026) | CoinGape, via agente 1F | Média. Só usado para converter em unidades |
| 23 | Token da venda privada | Não muda o caixa. Antes de o token existir, a parcela da recompra fica guardada em USDC | Cronograma do agente 1G (token nos meses 6 a 9) | Alta |
| 24 | Impostos, aquisição paga, bloqueio geográfico | Fora do modelo | 2B: "para contador" e "para advogado" | Alta. Podem mudar a margem e o mercado |

### 1.3 Como o modelo calcula (todas as linhas são INFERÊNCIA)

```text
volume apostado      = carteiras ativas × depósito por carteira
pote final           = volume apostado × 85%
taxa                 = pote final × 3%                      (2,55% do volume apostado)
cada parcela         = taxa ÷ 4                             (0,6375% do volume apostado)
banca no patrocínio  = patrocínio bruto × 70% (sentido A) ou × 30% (sentido B)
receita total        = taxa + banca no patrocínio
dinheiro da operação = parcela da operação + banca no patrocínio
resultado, regime a  = dinheiro da operação − custo operacional
folga, regime b      = dinheiro da operação + parcelas de Bitcoin e de recompra − custo operacional
caixa acumulado      = −51.500 + soma dos resultados (no regime b, soma também as parcelas usadas para pagar custo)
```

O fundo de prêmios é pago pela parcela dele e não entra no resultado. A parte do patrocínio que vai ao pote não é
receita: é prêmio para quem acerta.

---

## 2. Economia de uma pergunta

O que é: um pote de exemplo, do primeiro dólar ao último, para mostrar quem recebe o quê. Todos os números são
INFERÊNCIA (conta minha sobre as regras decididas e sobre a fórmula de saída proposta pelo agente 1H).

**A pergunta.** "O token T queima 50% da oferta até o dia 30?" Janela de 30 dias.

**Passo 1, o fundo de prêmios abre o pote.** A casa põe US$ 150 do fundo, sem lado, para o primeiro apostador não
entrar num pote vazio.

**Passo 2, as apostas.**

| Lado | Quem | Valor |
|---|---|---|
| SIM | Ana | US$ 1.000 |
| SIM | Bruno | US$ 1.000 |
| SIM | Outros | US$ 4.000 |
| NÃO | Carla | US$ 1.500 |
| NÃO | Outros | US$ 2.500 |
| Total | | US$ 10.000 (60% no SIM, 40% no NÃO) |

**Passo 3, o patrocinador.** Um projeto paga a faixa de US$ 1.500 como prêmio neutro (sem lado).

| Sentido | Fica com a banca | Vai ao pote |
|---|---|---|
| A (70% banca) | US$ 1.050 | US$ 450 |
| B (30% banca) | US$ 450 | US$ 1.050 |

**Passo 4, uma saída antecipada.** No dia 15 (metade da janela) o Bruno decide sair. A fórmula proposta pelo agente
1H é `penalidade = 5% + 20% × tempo decorrido + queda da chance do lado dele`.

- Tempo: 50% da janela, então 20% × 50% = 10%.
- Queda: o SIM tinha 60%. No meio da retirada do Bruno o SIM tem 5.500 de 9.500, ou 57,89%. A queda é
  1 − 57,89 ÷ 60 = 3,51%.
- Penalidade: 5% + 10% + 3,51% = 18,51%, ou US$ 185,09. O Bruno recebe US$ 814,91. Os US$ 185,09 ficam no pote.

**Passo 5, o fechamento e a resolução.** O programa lê a conta do token: a queima passou de 50%. Dá SIM.

| Linha | Sentido A | Sentido B |
|---|---|---|
| Apostas que ficaram (SIM 5.000, NÃO 4.000) | 9.000,00 | 9.000,00 |
| Penalidade do Bruno | 185,09 | 185,09 |
| Prêmio do patrocinador | 450,00 | 1.050,00 |
| Prêmio do fundo | 150,00 | 150,00 |
| **Pote final** | **9.785,09** | **10.385,09** |
| Taxa de 3% | 293,55 | 311,55 |
| Vai para quem acertou | 9.491,54 | 10.073,54 |
| Cada US$ 1 no SIM recebe | 1,8983 | 2,0147 |

Sem prêmio, sem patrocinador e sem saída, o mesmo pote pagaria 1,6167 por dólar no SIM (9.700 ÷ 6.000).

**Quanto cada um recebe.**

| Quem | Pôs | Recebe no sentido A | Recebe no sentido B |
|---|---|---|---|
| Ana (SIM) | 1.000,00 | 1.898,31 | 2.014,71 |
| Outros do SIM | 4.000,00 | 7.593,23 | 8.058,83 |
| Bruno (saiu no dia 15) | 1.000,00 | 814,91 | 814,91 |
| Carla (NÃO) | 1.500,00 | 0 | 0 |
| Outros do NÃO | 2.500,00 | 0 | 0 |
| Patrocinador (prêmio neutro) | 1.500,00 | 0, mais as contrapartidas | 0, mais as contrapartidas |

Se desse NÃO, cada US$ 1 no NÃO receberia 2,3729 (A) ou 2,5184 (B), e a Carla levaria US$ 3.559,33 ou US$ 3.777,58.

**Quanto fica com a casa.**

| Linha | Sentido A | Sentido B |
|---|---|---|
| Taxa de 3% | 293,55 | 311,55 |
| Tesouraria em Bitcoin (25%) | 73,39 | 77,89 |
| Operação (25%) | 73,39 | 77,89 |
| Recompra e queima (25%) | 73,39 | 77,89 |
| Fundo de prêmios (25%) | 73,39 | 77,89 |
| Parte da banca no patrocínio | 1.050,00 | 450,00 |
| **Total da casa nesta pergunta** | **1.343,55** | **761,55** |
| Dinheiro que paga custo (operação + banca) | 1.123,39 | 527,89 |
| Saldo do fundo de prêmios nesta pergunta (recebeu − pôs 150) | −76,61 | −72,11 |

Conferência: entram US$ 11.650,00 (apostas 10.000, patrocínio 1.500, fundo 150). Saem US$ 11.650,00 nos dois
sentidos (Bruno 814,91; vencedores; taxa; banca). O cofre fecha em zero.

Três leituras (INFERÊNCIA):

1. Nesta pergunta o patrocinador de US$ 1.500 paga mais custo do que a parcela da operação na taxa: US$ 1.050 contra
   US$ 73 no sentido A, e US$ 450 contra US$ 78 no B.
2. O fundo de prêmios pôs US$ 150 e recebeu de volta cerca de US$ 75. Ele só empata se o prêmio tiver trazido aposta
   que não existiria sem ele (seção 6).
3. A saída do Bruno tirou US$ 814,91 da base da taxa. A casa perdeu US$ 24,45 de taxa e o pote ganhou US$ 185,09.

**Pote de um lado só.** Dez pessoas põem US$ 2.000 no SIM e ninguém entra no NÃO. Pela decisão do fundador, a casa
devolve cobrando a taxa: US$ 60 de taxa (US$ 15 para cada parcela) e US$ 0,97 de volta por dólar apostado.

---

## 3. Três cenários para 24 meses

### 3.1 Em que cada cenário se ancora

Fatos usados como régua (todos via `top-5-competitor-analysis.md`, `market-research.md` e `publico-web3.md`):

| Referência | Número | Marca |
|---|---|---|
| World, dentro da Phantom | US$ 1,14 mi no primeiro mês (jun/2026); US$ 15,44 mi em set/2026; US$ 170,8 mil travados | FATO, DefiLlama |
| Limitless | US$ 250,9 mi em mai/2026; US$ 10,75 mi em set/2026; US$ 0,20 mi de taxas em set/2026; US$ 17 mi captados | FATO, DefiLlama; captação FATO SECUNDÁRIO |
| Myriad | US$ 2,79 mi numa semana de dez/2025; volume −93,8% do 1º para o 2º tri de 2026; US$ 1.319 de taxas em 30 dias, sem data | FATO SECUNDÁRIO (DeFiRate, Predictefy, DefiLlama via busca) |
| PNP Protocol | 206 transações em seis meses; token −93% | FATO, RPC público e DexScreener |
| Previsão da Jupiter | US$ 5,5 mi em 30 dias | FATO, DefiLlama, via 2B |
| Toda a previsão em Solana, dez/2025 | US$ 28,6 mi em três semanas, cerca de 21 mil carteiras | FATO SECUNDÁRIO, Step Data |
| Mercados sobre o pump.fun no Polymarket | Cerca de US$ 263 mil no total | FATO SECUNDÁRIO fraco, agregador sem data |

Os três cenários (INFERÊNCIA; a trajetória é SUPOSIÇÃO):

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Carteiras ativas | 50 no mês 1, 300 do mês 6 ao 12, caem para 200 no mês 24 | 125 por mês até 1.500 no mês 12; 3.750 no mês 24 | 500 por mês até 6.000 no mês 12; 20.000 no mês 24 |
| Depósito por carteira por mês | US$ 150 | US$ 200 | US$ 250 |
| Volume no mês 12 | US$ 45 mil | US$ 300 mil | US$ 1,5 milhão |
| Volume no mês 24 | US$ 30 mil | US$ 750 mil | US$ 5 milhões |
| Régua no mês 12 | Taxa de US$ 1.148, perto dos US$ 1.319 que a Myriad arrecadou em 30 dias | 1,9% do World de set/2026; 2,8% do Limitless de set/2026; 26% do primeiro mês do World | 9,7% do World; 14% do Limitless de set/2026; 1,3 vez o primeiro mês do World |
| Régua no mês 24 | Volume de 24 meses (US$ 870 mil) igual a 3,3 vezes tudo o que os mercados de pump.fun somaram no Polymarket | 4,9% do World; 7,0% do Limitless de set/2026; 14% da Jupiter | 32% do World; 47% do Limitless de set/2026 (2% do pico dele); 91% da Jupiter; as mesmas 21 mil carteiras de toda a previsão em Solana em dez/2025 |
| Dinheiro travado no mês 24, com perguntas de 14 dias | US$ 14 mil | US$ 350 mil, 2 vezes o World | US$ 2,33 milhões, 13,7 vezes o World |
| O que precisa ser verdade | O produto funciona e quase ninguém volta | Um nicho pequeno e fiel, sem distribuição paga | Um canal de distribuição (integração com carteira) que hoje não existe |

O cenário ruim não é o piso. O piso é o PNP: volume perto de zero. Nesse caso a perda é o gasto de pré-lançamento
mais US$ 3.000 por mês até a equipe parar.

Conta do dinheiro travado: volume do mês × 14 ÷ 30. Um pote não gira o capital (2B, 2.4); o World gira 90 vezes.

### 3.2 Cenário ruim

Sem patrocinador (pedido do agente 2A). Nível 1 de custo nos 24 meses: ninguém recebe.

**Operação e receita**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Perguntas abertas | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 8 | 24 | 24 | 24 | 24 |
| Apostadores ativos (fim do período) | 50 | 100 | 150 | 200 | 250 | 300 | 300 | 300 | 300 | 300 | 300 | 300 | 275 | 250 | 225 | 200 |
| Volume apostado | 7.500 | 15.000 | 22.500 | 30.000 | 37.500 | 45.000 | 45.000 | 45.000 | 45.000 | 45.000 | 45.000 | 45.000 | 127.500 | 116.250 | 105.000 | 93.750 |
| Pote final (85% do volume) | 6.375 | 12.750 | 19.125 | 25.500 | 31.875 | 38.250 | 38.250 | 38.250 | 38.250 | 38.250 | 38.250 | 38.250 | 108.375 | 98.813 | 89.250 | 79.688 |
| Taxa de 3% do pote final (é a receita total) | 191 | 383 | 574 | 765 | 956 | 1.148 | 1.148 | 1.148 | 1.148 | 1.148 | 1.148 | 1.148 | 3.251 | 2.964 | 2.678 | 2.391 |

**Destino da taxa e custos**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Cada uma das quatro parcelas da taxa (25%) | 48 | 96 | 143 | 191 | 239 | 287 | 287 | 287 | 287 | 287 | 287 | 287 | 813 | 741 | 669 | 598 |
| Nível de custo (fim do período) | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| Equipe | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Auditoria (reserva mensal) | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 5.100 | 5.100 | 5.100 | 5.100 |
| Infraestrutura | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 1.950 | 1.950 | 1.950 | 1.950 |
| Jurídico e contábil | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 1.950 | 1.950 | 1.950 | 1.950 |
| Marketing e comunidade | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Custo operacional total | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 9.000 | 9.000 | 9.000 | 9.000 |
| Fundo de prêmios (pago pela parcela dele) | 48 | 96 | 143 | 191 | 239 | 287 | 287 | 287 | 287 | 287 | 287 | 287 | 813 | 741 | 669 | 598 |

**Resultado e caixa, regime (a)** (sentidos A e B iguais, porque não há patrocínio)

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Dinheiro da operação | 48 | 96 | 143 | 191 | 239 | 287 | 287 | 287 | 287 | 287 | 287 | 287 | 813 | 741 | 669 | 598 |
| Resultado | -2.952 | -2.904 | -2.857 | -2.809 | -2.761 | -2.713 | -2.713 | -2.713 | -2.713 | -2.713 | -2.713 | -2.713 | -8.187 | -8.259 | -8.331 | -8.402 |
| Caixa acumulado | -54.452 | -57.357 | -60.213 | -63.022 | -65.783 | -68.496 | -71.209 | -73.922 | -76.635 | -79.348 | -82.062 | -84.775 | -92.962 | -101.221 | -109.551 | -117.954 |

**Resultado e caixa, regime (b)**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Folga antes de Bitcoin e recompra | -2.857 | -2.713 | -2.570 | -2.426 | -2.283 | -2.139 | -2.139 | -2.139 | -2.139 | -2.139 | -2.139 | -2.139 | -6.562 | -6.777 | -6.992 | -7.207 |
| Parcelas usadas para pagar custo | 96 | 191 | 287 | 383 | 478 | 574 | 574 | 574 | 574 | 574 | 574 | 574 | 1.626 | 1.482 | 1.339 | 1.195 |
| Aporte dos sócios | 2.857 | 2.713 | 2.570 | 2.426 | 2.283 | 2.139 | 2.139 | 2.139 | 2.139 | 2.139 | 2.139 | 2.139 | 6.562 | 6.777 | 6.992 | 7.207 |
| Liberado para Bitcoin e recompra | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Saldo retido em USDC | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Caixa acumulado | -54.357 | -57.070 | -59.639 | -62.066 | -64.348 | -66.488 | -68.627 | -70.767 | -72.906 | -75.045 | -77.185 | -79.324 | -85.886 | -92.662 | -99.654 | -106.861 |

### 3.3 Cenário razoável

Patrocínio: nenhum nos meses 1 a 3; um de US$ 500 por mês nos meses 4 a 6; dois de 500 e um de 1.500 por mês nos
meses 7 a 12 (a "base" de 2B); três de 500 e dois de 1.500 por mês no segundo ano, mais um de 5.000 por trimestre.
Custo: nível 1 até o mês 17; nível 2 a partir do mês 18 (três meses seguidos acima de US$ 400 mil: 15, 16 e 17).

**Operação e receita**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Perguntas abertas | 8 | 8 | 8 | 12 | 12 | 12 | 16 | 16 | 16 | 16 | 16 | 16 | 72 | 72 | 72 | 72 |
| Apostadores ativos (fim do período) | 125 | 250 | 375 | 500 | 625 | 750 | 875 | 1.000 | 1.125 | 1.250 | 1.375 | 1.500 | 2.063 | 2.625 | 3.188 | 3.750 |
| Volume apostado | 25.000 | 50.000 | 75.000 | 100.000 | 125.000 | 150.000 | 175.000 | 200.000 | 225.000 | 250.000 | 275.000 | 300.000 | 1.125.000 | 1.462.500 | 1.800.000 | 2.137.500 |
| Pote final (85% do volume) | 21.250 | 42.500 | 63.750 | 85.000 | 106.250 | 127.500 | 148.750 | 170.000 | 191.250 | 212.500 | 233.750 | 255.000 | 956.250 | 1.243.125 | 1.530.000 | 1.816.875 |
| Taxa de 3% do pote final | 638 | 1.275 | 1.913 | 2.550 | 3.188 | 3.825 | 4.463 | 5.100 | 5.738 | 6.375 | 7.013 | 7.650 | 28.688 | 37.294 | 45.900 | 54.506 |
| Patrocinadores (500 / 1.500 / 5.000) | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 | 2 / 1 / 0 | 2 / 1 / 0 | 2 / 1 / 0 | 2 / 1 / 0 | 2 / 1 / 0 | 2 / 1 / 0 | 9 / 6 / 1 | 9 / 6 / 1 | 9 / 6 / 1 | 9 / 6 / 1 |
| Patrocínio bruto | 0 | 0 | 0 | 500 | 500 | 500 | 2.500 | 2.500 | 2.500 | 2.500 | 2.500 | 2.500 | 18.500 | 18.500 | 18.500 | 18.500 |
| Banca no sentido A (70%) | 0 | 0 | 0 | 350 | 350 | 350 | 1.750 | 1.750 | 1.750 | 1.750 | 1.750 | 1.750 | 12.950 | 12.950 | 12.950 | 12.950 |
| Banca no sentido B (30%) | 0 | 0 | 0 | 150 | 150 | 150 | 750 | 750 | 750 | 750 | 750 | 750 | 5.550 | 5.550 | 5.550 | 5.550 |
| Receita total, sentido A | 638 | 1.275 | 1.913 | 2.900 | 3.538 | 4.175 | 6.213 | 6.850 | 7.488 | 8.125 | 8.763 | 9.400 | 41.638 | 50.244 | 58.850 | 67.456 |
| Receita total, sentido B | 638 | 1.275 | 1.913 | 2.700 | 3.338 | 3.975 | 5.213 | 5.850 | 6.488 | 7.125 | 7.763 | 8.400 | 34.238 | 42.844 | 51.450 | 60.056 |

O que vai ao pote é o patrocínio bruto menos a parte da banca. No mês 24 (mês sem a faixa de 5.000): volume de
US$ 750.000, taxa de US$ 19.125, banca de US$ 3.150 (A) ou US$ 1.350 (B), receita de US$ 22.275 ou US$ 20.475.

**Destino da taxa e custos**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Cada uma das quatro parcelas da taxa (25%) | 159 | 319 | 478 | 638 | 797 | 956 | 1.116 | 1.275 | 1.434 | 1.594 | 1.753 | 1.913 | 7.172 | 9.323 | 11.475 | 13.627 |
| Nível de custo (fim do período) | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 |
| Equipe | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5.000 | 15.000 | 15.000 |
| Auditoria (reserva mensal) | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 5.100 | 5.100 | 5.100 | 5.100 |
| Infraestrutura | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 1.950 | 1.950 | 1.950 | 1.950 |
| Jurídico e contábil | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 1.950 | 1.950 | 1.950 | 1.950 |
| Marketing e comunidade | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2.000 | 6.000 | 6.000 |
| Custo operacional total | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 9.000 | 16.000 | 30.000 | 30.000 |
| Fundo de prêmios (pago pela parcela dele) | 159 | 319 | 478 | 638 | 797 | 956 | 1.116 | 1.275 | 1.434 | 1.594 | 1.753 | 1.913 | 7.172 | 9.323 | 11.475 | 13.627 |

**Resultado e caixa, regime (a)**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Dinheiro da operação, A | 159 | 319 | 478 | 988 | 1.147 | 1.306 | 2.866 | 3.025 | 3.184 | 3.344 | 3.503 | 3.663 | 20.122 | 22.273 | 24.425 | 26.577 |
| Resultado, A | -2.841 | -2.681 | -2.522 | -2.012 | -1.853 | -1.694 | -134 | 25 | 184 | 344 | 503 | 663 | 11.122 | 6.273 | -5.575 | -3.423 |
| Caixa acumulado, A | -54.341 | -57.022 | -59.544 | -61.556 | -63.409 | -65.103 | -65.237 | -65.212 | -65.028 | -64.684 | -64.181 | -63.519 | -52.397 | -46.123 | -51.698 | -55.122 |
| Dinheiro da operação, B | 159 | 319 | 478 | 788 | 947 | 1.106 | 1.866 | 2.025 | 2.184 | 2.344 | 2.503 | 2.663 | 12.722 | 14.873 | 17.025 | 19.177 |
| Resultado, B | -2.841 | -2.681 | -2.522 | -2.212 | -2.053 | -1.894 | -1.134 | -975 | -816 | -656 | -497 | -337 | 3.722 | -1.127 | -12.975 | -10.823 |
| Caixa acumulado, B | -54.341 | -57.022 | -59.544 | -61.756 | -63.809 | -65.703 | -66.837 | -67.812 | -68.628 | -69.284 | -69.781 | -70.119 | -66.397 | -67.523 | -80.498 | -91.322 |

**Resultado e caixa, regime (b)**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Folga antes de Bitcoin e recompra, A | -2.522 | -2.044 | -1.566 | -737 | -259 | 219 | 2.097 | 2.575 | 3.053 | 3.531 | 4.009 | 4.488 | 25.466 | 24.920 | 17.375 | 23.830 |
| Parcelas usadas para pagar custo, A | 319 | 638 | 956 | 1.275 | 1.594 | 1.694 | 134 | 0 | 0 | 0 | 0 | 0 | 0 | 3.503 | 6.050 | 4.616 |
| Aporte dos sócios, A | 2.522 | 2.044 | 1.566 | 738 | 259 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Liberado para Bitcoin e recompra, A | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1.972 | 25.466 | 17.113 | 0 | 0 |
| Saldo retido em USDC, A | 0 | 0 | 0 | 0 | 0 | 219 | 2.316 | 4.866 | 7.734 | 10.922 | 14.428 | 16.281 | 5.159 | 3.191 | 20.091 | 42.728 |
| Caixa acumulado, A | -54.022 | -56.066 | -57.631 | -58.369 | -58.628 | -58.628 | -58.628 | -58.603 | -58.419 | -58.075 | -57.572 | -56.909 | -45.787 | -36.011 | -35.536 | -34.344 |
| Folga antes de Bitcoin e recompra, B | -2.522 | -2.044 | -1.566 | -937 | -459 | 19 | 1.097 | 1.575 | 2.053 | 2.531 | 3.009 | 3.488 | 18.066 | 17.520 | 9.975 | 16.430 |
| Parcelas usadas para pagar custo, B | 319 | 638 | 956 | 1.275 | 1.594 | 1.894 | 1.134 | 975 | 816 | 656 | 497 | 338 | 0 | 5.303 | 12.975 | 10.823 |
| Aporte dos sócios, B | 2.522 | 2.044 | 1.566 | 938 | 459 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Liberado para Bitcoin e recompra, B | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 13.838 | 16.130 | 0 | 0 |
| Saldo retido em USDC, B | 0 | 0 | 0 | 0 | 0 | 19 | 1.116 | 2.691 | 4.744 | 7.275 | 10.284 | 13.772 | 14.278 | 11.492 | 21.467 | 37.897 |
| Caixa acumulado, B | -54.022 | -56.066 | -57.631 | -58.569 | -59.028 | -59.028 | -59.028 | -59.028 | -59.028 | -59.028 | -59.028 | -59.028 | -55.306 | -51.130 | -51.130 | -51.130 |

### 3.4 Cenário otimista

Patrocínio: um de US$ 500 por mês nos meses 1 a 3; dois de 500 e um de 1.500 nos meses 4 a 6; quatro de 500, três de
1.500 e um de 5.000 por mês nos meses 7 a 12 (o "otimista" de 2B); seis, quatro e dois por mês no segundo ano. É
aposta, não previsão. Custo: nível 1 até o mês 6; nível 2 do mês 7 ao 15; nível 3 a partir do mês 16.

**Operação e receita**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Perguntas abertas | 12 | 12 | 12 | 20 | 20 | 20 | 40 | 40 | 40 | 40 | 40 | 40 | 240 | 240 | 240 | 240 |
| Apostadores ativos (fim do período) | 500 | 1.000 | 1.500 | 2.000 | 2.500 | 3.000 | 3.500 | 4.000 | 4.500 | 5.000 | 5.500 | 6.000 | 9.500 | 13.000 | 16.500 | 20.000 |
| Volume apostado | 125.000 | 250.000 | 375.000 | 500.000 | 625.000 | 750.000 | 875.000 | 1.000.000 | 1.125.000 | 1.250.000 | 1.375.000 | 1.500.000 | 6.250.000 | 8.875.000 | 11.500.000 | 14.125.000 |
| Pote final (85% do volume) | 106.250 | 212.500 | 318.750 | 425.000 | 531.250 | 637.500 | 743.750 | 850.000 | 956.250 | 1.062.500 | 1.168.750 | 1.275.000 | 5.312.500 | 7.543.750 | 9.775.000 | 12.006.250 |
| Taxa de 3% do pote final | 3.188 | 6.375 | 9.563 | 12.750 | 15.938 | 19.125 | 22.313 | 25.500 | 28.688 | 31.875 | 35.063 | 38.250 | 159.375 | 226.313 | 293.250 | 360.188 |
| Patrocinadores (500 / 1.500 / 5.000) | 1 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 | 2 / 1 / 0 | 2 / 1 / 0 | 2 / 1 / 0 | 4 / 3 / 1 | 4 / 3 / 1 | 4 / 3 / 1 | 4 / 3 / 1 | 4 / 3 / 1 | 4 / 3 / 1 | 18 / 12 / 6 | 18 / 12 / 6 | 18 / 12 / 6 | 18 / 12 / 6 |
| Patrocínio bruto | 500 | 500 | 500 | 2.500 | 2.500 | 2.500 | 11.500 | 11.500 | 11.500 | 11.500 | 11.500 | 11.500 | 57.000 | 57.000 | 57.000 | 57.000 |
| Banca no sentido A (70%) | 350 | 350 | 350 | 1.750 | 1.750 | 1.750 | 8.050 | 8.050 | 8.050 | 8.050 | 8.050 | 8.050 | 39.900 | 39.900 | 39.900 | 39.900 |
| Banca no sentido B (30%) | 150 | 150 | 150 | 750 | 750 | 750 | 3.450 | 3.450 | 3.450 | 3.450 | 3.450 | 3.450 | 17.100 | 17.100 | 17.100 | 17.100 |
| Receita total, sentido A | 3.538 | 6.725 | 9.913 | 14.500 | 17.688 | 20.875 | 30.363 | 33.550 | 36.738 | 39.925 | 43.113 | 46.300 | 199.275 | 266.213 | 333.150 | 400.088 |
| Receita total, sentido B | 3.338 | 6.525 | 9.713 | 13.500 | 16.688 | 19.875 | 25.763 | 28.950 | 32.138 | 35.325 | 38.513 | 41.700 | 176.475 | 243.413 | 310.350 | 377.288 |

No mês 24: volume de US$ 5.000.000, taxa de US$ 127.500, banca de US$ 13.300 (A) ou US$ 5.700 (B), receita de
US$ 140.800 ou US$ 133.200. Para comparar: a Limitless arrecadou US$ 200 mil de taxas em setembro de 2026.

**Destino da taxa e custos**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Cada uma das quatro parcelas da taxa (25%) | 797 | 1.594 | 2.391 | 3.188 | 3.984 | 4.781 | 5.578 | 6.375 | 7.172 | 7.969 | 8.766 | 9.563 | 39.844 | 56.578 | 73.313 | 90.047 |
| Nível de custo (fim do período) | 1 | 1 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 3 | 3 | 3 |
| Equipe | 0 | 0 | 0 | 0 | 0 | 0 | 5.000 | 5.000 | 5.000 | 5.000 | 5.000 | 5.000 | 15.000 | 48.000 | 48.000 | 48.000 |
| Auditoria (reserva mensal) | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 1.700 | 5.100 | 7.500 | 7.500 | 7.500 |
| Infraestrutura | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 1.950 | 3.900 | 3.900 | 3.900 |
| Jurídico e contábil | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 650 | 1.950 | 3.600 | 3.600 | 3.600 |
| Marketing e comunidade | 0 | 0 | 0 | 0 | 0 | 0 | 2.000 | 2.000 | 2.000 | 2.000 | 2.000 | 2.000 | 6.000 | 12.000 | 12.000 | 12.000 |
| Custo operacional total | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 3.000 | 10.000 | 10.000 | 10.000 | 10.000 | 10.000 | 10.000 | 30.000 | 75.000 | 75.000 | 75.000 |
| Fundo de prêmios (pago pela parcela dele) | 797 | 1.594 | 2.391 | 3.188 | 3.984 | 4.781 | 5.578 | 6.375 | 7.172 | 7.969 | 8.766 | 9.563 | 39.844 | 56.578 | 73.313 | 90.047 |

Nível 3 por linha (SUPOSIÇÃO): equipe 16.000 (dois fundadores a 4.000, um desenvolvedor de Solana por contrato a
6.000, suporte a 2.000), auditoria 2.500, infraestrutura 1.300, jurídico 1.200, marketing 4.000.

**Resultado e caixa, regime (a)**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Dinheiro da operação, A | 1.147 | 1.944 | 2.741 | 4.938 | 5.734 | 6.531 | 13.628 | 14.425 | 15.222 | 16.019 | 16.816 | 17.613 | 79.744 | 96.478 | 113.213 | 129.947 |
| Resultado, A | -1.853 | -1.056 | -259 | 1.938 | 2.734 | 3.531 | 3.628 | 4.425 | 5.222 | 6.019 | 6.816 | 7.613 | 49.744 | 21.478 | 38.213 | 54.947 |
| Caixa acumulado, A | -53.353 | -54.409 | -54.669 | -52.731 | -49.997 | -46.466 | -42.837 | -38.412 | -33.191 | -27.172 | -20.356 | -12.744 | 37.000 | 58.478 | 96.691 | 151.638 |
| Dinheiro da operação, B | 947 | 1.744 | 2.541 | 3.938 | 4.734 | 5.531 | 9.028 | 9.825 | 10.622 | 11.419 | 12.216 | 13.013 | 56.944 | 73.678 | 90.413 | 107.147 |
| Resultado, B | -2.053 | -1.256 | -459 | 938 | 1.734 | 2.531 | -972 | -175 | 622 | 1.419 | 2.216 | 3.013 | 26.944 | -1.322 | 15.413 | 32.147 |
| Caixa acumulado, B | -53.553 | -54.809 | -55.269 | -54.331 | -52.597 | -50.066 | -51.037 | -51.212 | -50.591 | -49.172 | -46.956 | -43.944 | -17.000 | -18.322 | -2.909 | 29.238 |

**Resultado e caixa, regime (b)**

| Linha | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | T5 | T6 | T7 | T8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Folga antes de Bitcoin e recompra, A | -259 | 2.131 | 4.522 | 8.313 | 10.703 | 13.094 | 14.784 | 17.175 | 19.566 | 21.956 | 24.347 | 26.738 | 129.431 | 134.634 | 184.838 | 235.041 |
| Parcelas usadas para pagar custo, A | 1.594 | 1.056 | 259 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Aporte dos sócios, A | 259 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Liberado para Bitcoin e recompra, A | 0 | 0 | 0 | 0 | 0 | 20.763 | 0 | 0 | 9.525 | 21.956 | 24.347 | 26.738 | 97.763 | 76.303 | 183.478 | 180.094 |
| Saldo retido em USDC, A | 0 | 2.131 | 6.653 | 13.028 | 20.997 | 9.797 | 20.953 | 33.703 | 38.522 | 32.503 | 25.688 | 18.075 | 0 | 36.853 | 0 | 0 |
| Caixa acumulado, A | -51.759 | -51.759 | -51.759 | -49.822 | -47.087 | -43.556 | -39.928 | -35.503 | -30.281 | -24.262 | -17.447 | -9.834 | 39.909 | 61.388 | 99.600 | 154.547 |
| Folga antes de Bitcoin e recompra, B | -459 | 1.931 | 4.322 | 7.313 | 9.703 | 12.094 | 10.184 | 12.575 | 14.966 | 17.356 | 19.747 | 22.138 | 106.631 | 111.834 | 162.038 | 212.241 |
| Parcelas usadas para pagar custo, B | 1.594 | 1.256 | 459 | 0 | 0 | 0 | 972 | 175 | 0 | 0 | 0 | 0 | 0 | 2.741 | 0 | 0 |
| Aporte dos sócios, B | 459 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Liberado para Bitcoin e recompra, B | 0 | 0 | 0 | 0 | 0 | 17.363 | 0 | 0 | 0 | 0 | 32.828 | 22.138 | 106.631 | 0 | 183.872 | 212.241 |
| Saldo retido em USDC, B | 0 | 1.931 | 6.253 | 12.628 | 20.597 | 12.797 | 22.981 | 35.556 | 49.900 | 65.838 | 50.541 | 47.528 | 20.584 | 131.000 | 93.753 | 61.606 |
| Caixa acumulado, B | -51.959 | -51.959 | -51.959 | -51.022 | -49.287 | -46.756 | -46.756 | -46.756 | -46.134 | -44.716 | -42.500 | -39.487 | -12.544 | -11.125 | 4.288 | 36.434 |

### 3.5 Outras receitas que a Onda 1 achou cabíveis

O agente 1F concluiu que só duas linhas merecem número (corte do pote e patrocínio) e que as demais entram como
opção futura. Sigo essa leitura: nenhuma das linhas abaixo está no resultado dos cenários. A tabela mostra quanto
cada uma renderia se fosse ligada (INFERÊNCIA).

| Forma | Situação | Conta | Ruim M12 / M24 | Razoável M12 / M24 | Otimista M12 / M24 |
|---|---|---|---|---|---|
| Taxa na devolução de pote de um lado só | Decidida. Já está dentro dos 3% | Não muda a receita, porque a taxa incide sobre todo pote | incluída | incluída | incluída |
| Fatia da penalidade de saída para a banca | Não decidida. A decisão hoje é "penalidade pro pote" | Com 20% da penalidade: volume × 20% × 25% × 20% = 1,0% do volume | 450 / 300 | 3.000 / 7.500 | 15.000 / 50.000 |
| Taxa de análise de quem pede pergunta | Alternativa de 1F. Conflita em parte com "se for recusado devolve" | US$ 50 (SUPOSIÇÃO) por pedido das faixas de 1.500 e 5.000 | 0 / 0 | 50 / 100 | 200 / 300 |
| Taxa de criador do token do pump.fun | Proposta de 1G: vai inteira ao fundo de prêmios | 0,05% a 0,95% do volume do token. Exemplo de 1G: US$ 500 mil negociados a 0,30% rendem US$ 1.500 | não projetada | não projetada | não projetada |
| Venda de dados, taxa de front-end, assinatura | "Depois" (1F) | Nem os líderes divulgam quanto rendem | sem valor | sem valor | sem valor |

Leitura: a fatia da penalidade é a única com tamanho. Com 20% da penalidade para a banca, ela renderia mais do que a
parcela da operação na taxa (1,0% contra 0,64% do volume). Mas depende inteira das premissas 3 e 4, que não têm dado,
e muda o incentivo de quem fica no pote. É decisão do fundador.

### 3.6 Quadro-resumo e conferência

| | Ruim | Razoável, A | Razoável, B | Otimista, A | Otimista, B |
|---|---:|---:|---:|---:|---:|
| Volume no mês 12 | 45.000 | 300.000 | 300.000 | 1.500.000 | 1.500.000 |
| Receita no mês 12 | 1.148 | 9.400 | 8.400 | 46.300 | 41.700 |
| Volume no mês 24 | 30.000 | 750.000 | 750.000 | 5.000.000 | 5.000.000 |
| Receita no mês 24 | 765 | 22.275 | 20.475 | 140.800 | 133.200 |
| Volume somado, 12 meses | 427.500 | 1.950.000 | 1.950.000 | 9.750.000 | 9.750.000 |
| Volume somado, 24 meses | 870.000 | 8.475.000 | 8.475.000 | 50.500.000 | 50.500.000 |
| Taxa somada, 24 meses | 22.185 | 216.113 | 216.113 | 1.287.750 | 1.287.750 |
| Banca no patrocínio, 24 meses | 0 | 63.350 | 27.150 | 214.200 | 91.800 |
| Patrocínio que foi aos potes, 24 meses | 0 | 27.150 | 63.350 | 91.800 | 214.200 |
| Custo operacional, 24 meses | 72.000 | 121.000 | 121.000 | 333.000 | 333.000 |
| Caixa no mês 24, regime (a) | -117.954 | -55.122 | -91.322 | 151.638 | 29.238 |
| Caixa no mês 24, regime (b) | -106.861 | -34.344 | -51.130 | 154.547 | 36.434 |

Conferência por soma fechada (exemplo do razoável, sentido A): volume de 12 meses = 25.000 × 78 = 1.950.000; volume
dos meses 13 a 24 = 12 × 300.000 + 37.500 × 78 = 6.525.000; taxa de 24 meses = 8.475.000 × 2,55% = 216.112,50;
caixa no mês 24 = −51.500 + 216.112,50 ÷ 4 + 63.350 − 121.000 = −55.121,88. O script dá −55.122.

---

## 4. Dois regimes para o destino da taxa

### 4.1 As duas regras

**Regime (a), divisão em quatro desde o primeiro dia.** É a decisão do fundador, aplicada sem condição. Todo mês, 25%
da taxa compra Bitcoin, 25% paga a operação, 25% vai para recompra e queima (guardada em USDC enquanto o token da
venda privada não existir) e 25% vai ao fundo de prêmios. Se a operação não cobre o custo, os sócios cobrem.

**Regime (b), regra de partida.** É a proposta do red team (2B, 2.7 e 6.4). O destino final continua sendo o do
fundador. Muda só a ordem. Como modelei, três coisas acontecem todo mês, nesta sequência:

1. Se a parte da operação não paga o custo do mês, as parcelas de Bitcoin e de recompra cobrem a diferença, com
   registro do que foi usado.
2. O que sobra dessas duas parcelas fica guardado em USDC, em conta separada e pública.
3. Quando a parte da operação cobre o custo por três meses seguidos e existem seis meses de custo guardados em USDC,
   o que passar dessa reserva segue para Bitcoin e para recompra, metade para cada.

O fundo de prêmios recebe os seus 25% nos dois regimes.

### 4.2 Ponto de equilíbrio em volume

Conta (INFERÊNCIA): volume de equilíbrio = (custo mensal − banca no patrocínio) ÷ fração do volume que paga custo.
A fração é 0,6375% no regime (a) e 1,9125% no regime (b).

| Nível de custo | Custo por mês | Regime (a), sem patrocínio | Regime (b), sem patrocínio | Regime (a), conta de 2B (sem saídas) | Regime (b), conta de 2B |
|---|---:|---:|---:|---:|---:|
| 1. Ninguém recebe | 3.000 | 470.588 | 156.863 | 400.000 | 133.333 |
| 2. Equipe enxuta | 10.000 | 1.568.627 | 522.876 | 1.333.333 | 444.444 |
| 3. `ECONOMICS.md` | 25.000 | 3.921.569 | 1.307.190 | 3.333.333 | 1.111.111 |

Os meus números são 18% maiores que os de 2B porque incluem a saída antecipada (premissas 3 e 4). 2B já tinha
avisado desse efeito (seção 3.4 dele).

Com o patrocínio do segundo ano do cenário razoável (US$ 3.150 por mês de banca no sentido A, US$ 1.350 no B), o
nível 2 se paga com US$ 1.074.510 (A) ou US$ 1.356.863 (B) por mês no regime (a), e com US$ 358.170 ou US$ 452.288
no regime (b).

### 4.3 Equilíbrio, caixa mínimo e mês do equilíbrio em cada cenário

"Primeiro mês no azul" é o primeiro mês em que o dinheiro disponível cobre o custo. "Caixa mínimo" é o ponto mais
baixo do caixa acumulado, contando os US$ 51.500 gastos antes do lançamento.

| Cenário | Sentido | (a) primeiro mês no azul | (a) resultado no mês 12 | (a) resultado no mês 24 | (a) caixa mínimo | (b) primeiro mês no azul | (b) folga no mês 12 | (b) folga no mês 24 | (b) caixa mínimo | (b) quando começa a liberar para Bitcoin e recompra |
|---|---|---|---:|---:|---|---|---:|---:|---|---|
| Ruim | A = B | Não chega | -2.713 | -2.809 | -117.954 no mês 24, ainda caindo | Não chega | -2.139 | -2.426 | -106.861 no mês 24, ainda caindo | Não libera |
| Razoável | A | Mês 8 | 663 | -2.069 | -65.237 no mês 7 | Mês 6 | 4.488 | 7.494 | -58.628 no mês 5 | Mês 12; para no mês 18 |
| Razoável | B | Mês 13 | -337 | -3.869 | -91.322 no mês 24, ainda caindo | Mês 6 | 3.488 | 5.694 | -59.028 no mês 5 | Mês 15; para no mês 18 |
| Otimista | A | Mês 4 | 7.613 | 20.175 | -54.669 no mês 3 | Mês 2 | 26.738 | 83.925 | -51.759 no mês 1 | Mês 6, com pausas a cada subida de nível |
| Otimista | B | Mês 4 | 3.013 | 12.575 | -55.269 no mês 3 | Mês 2 | 22.138 | 76.325 | -51.959 no mês 1 | Mês 6, com pausas a cada subida de nível |

Três leituras (INFERÊNCIA):

1. **No cenário razoável, o regime (a) empata e depois desempata.** A operação fica no azul no mês 8 (A) ou 13 (B)
   enquanto ninguém recebe. No mês 18 a equipe passa a receber (marco de 2B atingido) e o resultado volta a ser
   negativo até o mês 24. No sentido B, o caixa ainda está caindo no fim do segundo ano.
2. **No regime (b) não há recaída.** As parcelas de Bitcoin e de recompra cobrem a diferença, e a liberação para
   Bitcoin e recompra para. A decisão do fundador continua valendo, mas espera.
3. **No otimista os dois regimes dão quase no mesmo.** A operação se paga cedo e a regra de partida deixa de fazer
   diferença depois do mês 6.

### 4.4 A mesma conta com o custo fixo desde o primeiro mês

A tabela acima depende de quando a equipe sobe de nível. Esta mostra o que cada cenário de volume aguenta se o custo
for o mesmo do mês 1 ao 24. "Capital dos sócios" é o gasto de pré-lançamento mais todo déficit coberto do bolso.

| Cenário | Custo fixo | Sentido | (a) primeiro mês no azul | (a) resultado no mês 24 | (a) capital dos sócios | (b) primeiro mês no azul | (b) folga no mês 24 | (b) capital dos sócios | (b) parcelas usadas em 24 meses |
|---|---|---|---|---:|---:|---|---:|---:|---:|
| Ruim | 3.000 | A = B | Não chega | -2.809 | 117.954 | Não chega | -2.426 | 106.861 | 11.093 |
| Ruim | 10.000 | A = B | Não chega | -9.809 | 285.954 | Não chega | -9.426 | 274.861 | 11.093 |
| Ruim | 25.000 | A = B | Não chega | -24.809 | 645.954 | Não chega | -24.426 | 634.861 | 11.093 |
| Razoável | 3.000 | A | Mês 8 | 4.931 | 65.238 | Mês 6 | 14.494 | 58.628 | 6.609 |
| Razoável | 3.000 | B | Mês 13 | 3.131 | 70.119 | Mês 6 | 12.694 | 59.028 | 11.091 |
| Razoável | 10.000 | A | Mês 20 | -2.069 | 174.122 | Mês 14 | 7.494 | 123.052 | 52.738 |
| Razoável | 10.000 | B | Não chega | -3.869 | 210.322 | Mês 14 | 5.694 | 132.234 | 78.088 |
| Razoável | 25.000 | A | Não chega | -17.069 | 534.122 | Não chega | -7.506 | 426.066 | 108.056 |
| Razoável | 25.000 | B | Não chega | -18.869 | 570.322 | Não chega | -9.306 | 462.266 | 108.056 |
| Otimista | 3.000 | A | Mês 4 | 42.175 | 54.669 | Mês 2 | 105.925 | 51.759 | 2.909 |
| Otimista | 3.000 | B | Mês 4 | 34.575 | 55.269 | Mês 2 | 98.325 | 51.959 | 3.309 |
| Otimista | 10.000 | A | Mês 7 | 35.175 | 88.466 | Mês 4 | 98.925 | 66.106 | 22.359 |
| Otimista | 10.000 | B | Mês 9 | 27.575 | 93.213 | Mês 4 | 91.325 | 66.706 | 26.506 |
| Otimista | 25.000 | A | Mês 14 | 20.175 | 235.022 | Mês 8 | 83.925 | 145.213 | 89.809 |
| Otimista | 25.000 | B | Mês 18 | 12.575 | 286.741 | Mês 10 | 76.325 | 155.872 | 130.869 |

No razoável com custo de US$ 10.000, sentido A, o mês 20 fica no azul só por causa do patrocinador de US$ 5.000 que
entra uma vez por trimestre; o mês 24, sem ele, fecha negativo.

Ressalva sobre o marco de contratação. O marco de 2B (três meses com US$ 400 mil apostados) paga o nível 2 só se a
regra de partida estiver valendo: com US$ 400 mil e o patrocínio do razoável no sentido A, a operação recebe
US$ 5.700 no regime (a) e US$ 10.800 no (b), contra um custo de US$ 10.000. No regime (a), contratar aos US$ 400 mil
é contratar com déficit certo. O marco e o regime precisam ser decididos juntos.

---

## 5. Necessidade de capital até o equilíbrio

Conta (INFERÊNCIA): capital = gasto antes do lançamento (US$ 51.500) + déficits cobertos pelos sócios em 24 meses +
reserva de seis meses do custo do nível 1 (US$ 18.000). Usa o plano de custo por marco da seção 3.

| Cenário | Sentido | (a) déficits cobertos | (a) capital sem reserva | (a) capital com reserva | (b) déficits cobertos | (b) capital sem reserva | (b) capital com reserva |
|---|---|---:|---:|---:|---:|---:|---:|
| Ruim | A = B | 66.454 | 117.954 | 135.954 | 55.361 | 106.861 | 124.861 |
| Razoável | A | 13.738 | 65.238 | 83.238 | 7.128 | 58.628 | 76.628 |
| Razoável | B | 39.822 | 91.322 | 109.322 | 7.528 | 59.028 | 77.028 |
| Otimista | A | 3.169 | 54.669 | 72.669 | 259 | 51.759 | 69.759 |
| Otimista | B | 3.769 | 55.269 | 73.269 | 459 | 51.959 | 69.959 |

Como ler:

- **O pré-lançamento domina.** No razoável ele é de 56% a 88% do capital sem reserva. A faixa de 2B para esse gasto
  é de US$ 30 a 75 mil: some ou subtraia até US$ 23.500 em qualquer linha da tabela.
- **O cenário ruim não tem equilíbrio.** O capital da tabela é o que se perde em 24 meses. Com um critério de parada
  no mês 6 (seção 9), a perda fica em US$ 68.496 no regime (a) e em US$ 66.488 no (b).
- **A regra de partida economiza de US$ 3 mil a 32 mil no plano por marco.** A economia grande aparece quando há
  salário desde cedo (tabela 4.4): US$ 51 a 78 mil no razoável com custo de US$ 10.000.
- **A tabela não inclui** o parecer jurídico do segundo token (US$ 15 a 50 mil, fonte fraca, via 2B), nem um segundo
  desenvolvedor por contrato, nem reembolso por falha de resolução.

De onde pode vir (as fontes são as que 2B levantou em 10.2; aqui só o encaixe com os números do modelo):

| Fonte | Encaixe com o modelo |
|---|---|
| Sócios | Cobre o nível 1 nos cenários razoável e otimista: US$ 70 a 109 mil, com reserva. É a única fonte que não depende de terceiros |
| Receita | Paga o custo a partir do mês 8 a 13 no razoável e do mês 4 no otimista, enquanto ninguém recebe |
| Regra de partida | Não é capital novo. Reduz o que os sócios põem em US$ 3 a 32 mil, e em US$ 51 a 78 mil se houver salário desde o início |
| Patrocínio | No razoável, US$ 11.550 (A) ou US$ 4.950 (B) no primeiro ano. Ajuda, não financia |
| Venda privada do segundo token (meses 4 a 6, proposta de 1G) | Para render US$ 77 mil à operação, com 40% da venda indo para ela, a venda teria de arrecadar US$ 192,5 mil; com 15% da oferta, é uma avaliação de US$ 1,28 milhão |
| Token do pump.fun | Não financia a operação (1G e 2B). A taxa de criador vai ao fundo de prêmios |
| Investidores, hackathon, aceleração | Sem número neste modelo. Valores do Colosseum: não conferidos (2B) |

Quanto de avaliação a recompra sustenta em cada cenário. Conta de 2B (7.3), refeita com a taxa efetiva deste modelo:
avaliação sustentada = recompra anual ÷ 20% = volume mensal × 0,6375% × 12 ÷ 20% = 0,3825 × volume mensal.

| Momento | Ruim | Razoável | Otimista |
|---|---:|---:|---:|
| Mês 6 (quando a venda aconteceria) | 17.213 | 57.375 | 286.875 |
| Mês 12 | 17.213 | 114.750 | 573.750 |
| Mês 24 | 11.475 | 286.875 | 1.912.500 |

Leitura: nem o cenário otimista no mês 24 sustenta, só com recompra, a avaliação de US$ 5 milhões usada como exemplo
nos arquivos do sócio e do agente 1G. A venda privada não deve ser linha de caixa do primeiro ano em nenhum cenário.

---

## 6. Fundo de prêmios

### 6.1 Quanto entra

O fundo recebe 25% da taxa: 0,6375% do volume apostado (INFERÊNCIA).

| | Ruim | Razoável | Otimista |
|---|---:|---:|---:|
| Entra no mês 12 | 287 | 1.913 | 9.563 |
| Entra no mês 24 | 191 | 4.781 | 31.875 |
| Entrou em 12 meses | 2.725 | 12.431 | 62.156 |
| Entrou em 24 meses | 5.546 | 54.028 | 321.938 |
| Por pergunta aberta, mês 12 | 36 | 120 | 239 |
| Pote médio no mês 12 (volume ÷ perguntas) | 5.625 | 18.750 | 37.500 |

Outras entradas, fora da tabela: os US$ 7.500 de prêmios iniciais pagos pelos sócios (o fundo nasce vazio, como
apontou 2B); a taxa de criador do token do pump.fun, se a proposta de 1G for aceita; e 30% do que a venda privada
arrecadar, também proposta de 1G.

### 6.2 Quanto precisa atrair de aposta nova para se pagar

Cada US$ 1 de prêmio só volta como taxa se trouxer aposta que não existiria sem ele. Com a taxa efetiva de 2,55%:

| O que se quer recuperar com o prêmio | Aposta nova por US$ 1 de prêmio | Parcela do volume que teria de existir por causa do fundo |
|---|---:|---:|
| A taxa inteira (2,55%) | US$ 39 | 25% |
| A metade que fica na empresa, operação e Bitcoin (1,275%) | US$ 78 | 50% |
| Só o que paga custo (0,6375%) | US$ 157 | 100% |

2B chegou a 33, 67 e 133 sem contar as saídas; com elas, o número sobe para 39, 78 e 157. Em dólares por mês, pela
primeira linha (a mais generosa):

| | Ruim | Razoável | Otimista |
|---|---:|---:|---:|
| Aposta nova que o fundo precisa causar no mês 12 | 11.250 | 75.000 | 375.000 |
| Idem, no mês 24 | 7.500 | 187.500 | 1.250.000 |

Um limite que sai da conta do agente 1F: prêmio acima de 3,09% das apostas de um pote dá lucro certo a quem aposta
nos dois lados. O fundo inteiro (0,6375% do volume) dá para pôr o prêmio no teto de 3% em uma de cada cinco perguntas
(0,6375 ÷ 3 = 21%). Sortear uma em cada cinco serve, ao mesmo tempo, de teto e de grupo de comparação.

### 6.3 Regra simples de decisão

A medição é a que 1F e 2B já propuseram. A regra abaixo é minha (INFERÊNCIA), e os limites que não são 39 e 20% são
SUPOSIÇÃO, para calibrar com os primeiros dados.

Três sinais, medidos a cada trimestre, só depois de 40 perguntas com prêmio sorteado:

| Sinal | Como se mede | Verde | Vermelho |
|---|---|---|---|
| Volume adicional por dólar de prêmio | (volume das perguntas com prêmio − volume de perguntas parecidas sem prêmio) ÷ prêmio | 39 ou mais | Abaixo de 20 |
| Retorno sem prêmio | Parcela das carteiras novas que aposta de novo, em 30 dias, numa pergunta sem prêmio | 20% ou mais | Abaixo de 10% |
| Colheita | Parcela do prêmio que foi para carteiras que apostaram nos dois lados | Até 20% | Acima de 50% |

| Leitura dos três sinais | Decisão | O que acontece com o dinheiro |
|---|---|---|
| Os três verdes | **Aumentar** | Gasta a parcela inteira do trimestre e pode usar o saldo acumulado |
| Nenhum vermelho, mas nem todos verdes | **Manter** | Gasta até metade da parcela; o resto acumula em USDC, em conta pública |
| Qualquer vermelho | **Cortar** | Gasta só o mínimo para abrir potes (um prêmio pequeno no primeiro apostador); o saldo acumula e o fundador decide o destino |

Nos primeiros 90 dias não há medição. Gasto proposto: os US$ 7.500 iniciais, em prêmios de abertura de até 3% do pote
(no máximo US$ 190 no pote médio do razoável), em metade das perguntas, sorteadas.

---

## 7. Tesouraria em Bitcoin e recompra

### 7.1 Quanto se acumula

No regime (a), cada uma das duas recebe 25% da taxa desde o primeiro mês (INFERÊNCIA). A recompra é do mesmo tamanho
da tesouraria; a diferença é que o Bitcoin fica guardado e o token recomprado é queimado.

| Regime (a) | Ruim | Razoável | Otimista |
|---|---:|---:|---:|
| Bitcoin comprado em 12 meses, a preço de custo | 2.725 | 12.431 | 62.156 |
| Bitcoin comprado em 24 meses, a preço de custo | 5.546 | 54.028 | 321.938 |
| Em unidades, a US$ 63.800 | 0,09 | 0,85 | 5,05 |
| Recompra e queima em 12 meses | 2.725 | 12.431 | 62.156 |
| Recompra e queima em 24 meses | 5.546 | 54.028 | 321.938 |
| Déficits cobertos pelos sócios em 24 meses, no mesmo regime | 66.454 | 13.738 (A) ou 39.822 (B) | 3.169 (A) ou 3.769 (B) |

No regime (b) parte das duas parcelas paga custo e parte espera em USDC:

| Regime (b) | Ruim | Razoável, A | Razoável, B | Otimista, A | Otimista, B |
|---|---:|---:|---:|---:|---:|
| Bitcoin comprado em 12 meses | 0 | 986 | 0 | 51.664 | 36.164 |
| Bitcoin comprado em 24 meses | 0 | 22.275 | 14.984 | 320.483 | 287.536 |
| Recompra em 24 meses | 0 | 22.275 | 14.984 | 320.483 | 287.536 |
| Saldo das duas parcelas retido em USDC no mês 24 | 0 | 42.728 | 37.897 | 0 | 61.606 |
| Parcelas usadas para pagar custo em 24 meses | 11.093 | 20.778 | 40.192 | 2.909 | 7.197 |

Conferência: no razoável A, 2 × 22.275 + 42.728 + 20.778 = 108.056, que é a soma das duas parcelas em 24 meses
(2 × 54.028).

### 7.2 Sensibilidade ao preço do Bitcoin

Simplificação: a queda é aplicada sobre todo o saldo a preço de custo, como se o preço caísse depois da última
compra. É o pior caso. Com compra mensal, a perda real depende do caminho do preço.

| Regime (a) | Custo | Vale com queda de 30% | Vale com queda de 50% | Perda com 50% |
|---|---:|---:|---:|---:|
| Ruim, 12 meses | 2.725 | 1.908 | 1.363 | 1.363 |
| Ruim, 24 meses | 5.546 | 3.882 | 2.773 | 2.773 |
| Razoável, 12 meses | 12.431 | 8.702 | 6.216 | 6.216 |
| Razoável, 24 meses | 54.028 | 37.820 | 27.014 | 27.014 |
| Otimista, 12 meses | 62.156 | 43.509 | 31.078 | 31.078 |
| Otimista, 24 meses | 321.938 | 225.356 | 160.969 | 160.969 |

Leitura (INFERÊNCIA): no razoável, uma queda de 50% no mês 24 tira US$ 27 mil, o equivalente a nove meses do custo do
nível 1 ou a quase três meses do nível 2. No regime (b) a perda seria de US$ 11 mil (A) ou US$ 7,5 mil (B), porque
menos Bitcoin foi comprado e o resto está em USDC. Referência de tamanho de queda: a Metaplanet estava 38% abaixo do
custo em junho de 2026 e a primeira compra da Méliuz, cerca de 30% (FATO SECUNDÁRIO, via agente 1F).

---

## 8. Sensibilidades

Todas as tabelas são INFERÊNCIA e mudam uma premissa de cada vez, com o plano de custo por marco da seção 3.
"Capital" é o capital dos sócios sem a reserva.

### 8.1 Taxa de 2%, 3% e 4%, com o mesmo volume

| Taxa | Cenário | Receita no mês 12 (A / B) | Receita no mês 24 (A / B) | (a) primeiro mês no azul (A / B) | (a) capital (A / B) | (b) capital (A / B) |
|---|---|---|---|---|---|---|
| 2% | Ruim | 765 | 510 | Não chega | 119.803 | 112.408 |
| 3% | Ruim | 1.148 | 765 | Não chega | 117.954 | 106.861 |
| 4% | Ruim | 1.530 | 1.020 | Não chega | 116.105 | 101.315 |
| 2% | Razoável | 6.850 / 5.850 | 15.900 / 14.100 | 12 / 14 | 73.131 / 109.331 | 61.756 / 62.375 |
| 3% | Razoável | 9.400 / 8.400 | 22.275 / 20.475 | 8 / 13 | 65.238 / 91.322 | 58.628 / 59.028 |
| 4% | Razoável | 11.950 / 10.950 | 28.650 / 26.850 | 7 / 11 | 63.988 / 73.313 | 56.775 / 56.975 |
| 2% | Otimista | 33.550 / 28.950 | 98.300 / 90.700 | 4 / 5 | 56.263 / 80.735 | 52.556 / 52.756 |
| 3% | Otimista | 46.300 / 41.700 | 140.800 / 133.200 | 4 / 4 | 54.669 / 55.269 | 51.759 / 51.959 |
| 4% | Otimista | 59.050 / 54.450 | 183.300 / 175.700 | 3 / 3 | 53.613 / 54.013 | 51.500 / 51.500 |

O que a tabela não sabe: quanto o volume muda quando a taxa muda. Ninguém mediu isso num pote. A conta de empate é
esta: a taxa de 2% rende o mesmo que a de 3% se trouxer 50% mais volume; a de 4% rende o mesmo que a de 3% se
perder até 25% do volume.

### 8.2 Fração da taxa que vai para a operação (regime a)

O resto da taxa é dividido igualmente entre Bitcoin, recompra e prêmios.

| Operação | Ruim: resultado M24 / capital | Razoável: primeiro mês no azul (A / B) | Razoável: resultado M24 (A / B) | Razoável: capital (A / B) | Otimista: resultado M24 (A / B) |
|---|---|---|---|---|---|
| 25% (decisão) | -2.809 / 117.954 | 8 / 13 | -2.069 / -3.869 | 65.238 / 91.322 | 20.175 / 12.575 |
| 50% | -2.617 / 112.408 | 7 / 8 | 2.713 / 913 | 61.756 / 62.375 | 52.050 / 44.450 |
| 75% (igual à regra de partida) | -2.426 / 106.861 | 6 / 6 | 7.494 / 5.694 | 58.628 / 59.028 | 83.925 / 76.325 |
| 100% | -2.235 / 101.315 | 5 / 5 | 12.275 / 10.475 | 56.775 / 56.975 | 115.800 / 108.200 |

Leitura: nenhuma fração salva o cenário ruim. No razoável, 50% para a operação já basta para manter o nível 2 no
azul no mês 24.

### 8.3 Duração média das perguntas

A duração não muda a receita do mês se o volume for o mesmo. Ela muda quanto dinheiro precisa ficar travado para
fazer esse volume. Duas contas (INFERÊNCIA).

Primeira: com o mesmo dinheiro travado do razoável no mês 12 (US$ 140 mil), quanto volume e quanta taxa cabem. É um
teto, porque supõe que todo dólar pago volta a ser apostado.

| Duração média | Volume possível no mês | Taxa | Parcela da operação |
|---|---:|---:|---:|
| 3 dias | 1.400.000 | 35.700 | 8.925 |
| 7 dias | 600.000 | 15.300 | 3.825 |
| 14 dias (premissa) | 300.000 | 7.650 | 1.913 |
| 30 dias | 140.000 | 3.570 | 893 |

Segunda: quanto dinheiro travado é preciso para pagar cada nível de custo, sem patrocínio.

| Duração média | Nível 1, regime (a) | Nível 2, regime (a) | Nível 3, regime (a) | Nível 1, regime (b) | Nível 2, regime (b) | Nível 3, regime (b) |
|---|---:|---:|---:|---:|---:|---:|
| 3 dias | 47.059 | 156.863 | 392.157 | 15.686 | 52.288 | 130.719 |
| 7 dias | 109.804 | 366.013 | 915.033 | 36.601 | 122.004 | 305.011 |
| 14 dias | 219.608 | 732.026 | 1.830.065 | 73.203 | 244.009 | 610.022 |
| 30 dias | 470.588 | 1.568.627 | 3.921.569 | 156.863 | 522.876 | 1.307.190 |

Para comparar: o World tem US$ 170,8 mil travados. Com perguntas de 30 dias, pagar o nível 2 no regime (a) pede nove
vezes isso. Com perguntas de 3 dias, pede menos do que o World tem hoje.

A duração também atrasa o caixa: a taxa só entra na resolução. Com perguntas de 30 dias, desloque as tabelas de
receita um mês para a frente.

### 8.4 Volume 50% abaixo do previsto

| Cenário | Sentido | Receita no mês 12 | Receita no mês 24 | (a) primeiro mês no azul | (a) resultado no mês 24 | (a) capital | (b) primeiro mês no azul | (b) capital | Nível de custo no mês 24 |
|---|---|---:|---:|---|---:|---:|---|---:|---|
| Ruim | A = B | 574 | 383 | Não chega | -2.904 | 120.727 | Não chega | 115.181 | 1 |
| Razoável | A | 5.575 | 12.713 | Mês 13 | 2.541 | 69.734 | Mês 7 | 63.430 | 1 |
| Razoável | B | 4.575 | 10.913 | Mês 14 | 741 | 76.909 | Mês 10 | 65.042 | 1 |
| Otimista | A | 27.175 | 77.050 | Mês 4 | 4.238 | 57.059 | Mês 3 | 53.214 | 3 |
| Otimista | B | 22.575 | 69.450 | Mês 6 | -3.362 | 58.573 | Mês 3 | 53.614 | 3 |

Leitura: com metade do volume, o razoável nunca chega ao marco de US$ 400 mil, a equipe passa os 24 meses sem
receber e o resultado do mês 24 fica positivo por isso. O capital fica entre US$ 63 e 77 mil, perto do caso-base. O
custo de errar o volume para baixo é o tempo dos fundadores sem remuneração, mais do que o dinheiro.

### 8.5 Outras premissas que pesam

| Caso | Cenário | Receita M12 (A / B) | Receita M24 (A / B) | (a) primeiro mês no azul (A / B) | (a) resultado M24 (A / B) | (a) capital (A / B) | (b) capital (A / B) |
|---|---|---|---|---|---|---|---|
| Sem saída antecipada (ou com 3% cobrados sobre o valor devolvido) | Razoável | 10.750 / 9.750 | 25.650 / 23.850 | 7 / 12 | -1.225 / -3.025 | 64.513 / 81.788 | 57.525 / 57.763 |
| Saídas de 40% do dinheiro | Razoável | 8.050 / 7.050 | 18.900 / 17.100 | 10 / 13 | -2.912 / -4.712 | 66.294 / 100.856 | 60.181 / 60.781 |
| Banca do patrocínio dividida em quatro, como a taxa | Razoável | 9.400 / 8.400 | 22.275 / 20.475 | 14 / 14 | -4.431 / -4.881 | 102.634 / 111.684 | 58.803 / 59.122 |
| Sem nenhum patrocinador | Razoável | 7.650 | 19.125 | 17 | -5.219 | 118.472 | 59.459 |
| Sem saída antecipada | Otimista | 53.050 / 48.450 | 163.300 / 155.700 | 3 / 4 | 25.800 / 18.200 | 53.988 / 54.425 | 51.500 / 51.538 |
| Banca do patrocínio dividida em quatro | Otimista | 46.300 / 41.700 | 140.800 / 133.200 | 4 / 4 | 10.200 / 8.300 | 56.047 / 62.519 | 51.847 / 51.997 |
| Sem nenhum patrocinador | Otimista | 38.250 | 127.500 | 4 | 6.875 | 78.906 | 52.109 |

Leitura: no regime (a) o razoável depende do patrocínio. Sem ele, ou com a parte da banca dividida em quatro, o
capital sobe para US$ 103 a 118 mil. No regime (b), nesses mesmos casos, o capital fica em US$ 59 mil.

### 8.6 A forma da taxa: teto pelo lado perdedor

2A pediu que o modelo rodasse com `taxa = menor entre 3% do pote e 10% do lado perdedor`. A taxa efetiva passa a
depender de quão desequilibrados são os potes, e isso não tem dado. Conta com uma mistura que supus:

| Fatia do lado perdedor no pote | Taxa efetiva sobre o pote | Parcela do volume (SUPOSIÇÃO) |
|---|---:|---:|
| 30% ou mais | 3,0% | 50% |
| 20% | 2,0% | 30% |
| 10% | 1,0% | 20% |
| **Média** | **2,3%** | |

| Com taxa média de 2,3% | Receita M12 (A / B) | Receita M24 (A / B) | (a) primeiro mês no azul (A / B) | (a) capital (A / B) | (b) capital (A / B) |
|---|---|---|---|---|---|
| Ruim | 880 | 587 | Não chega | 119.248 | 110.744 |
| Razoável | 7.615 / 6.615 | 17.813 / 16.013 | 11 / 13 | 67.728 / 103.928 | 60.752 / 61.352 |
| Otimista | 37.375 / 32.775 | 111.050 / 103.450 | 4 / 4 | 55.784 / 59.398 | 52.317 / 52.517 |

A taxa cai 23% se o volume não mudar. A regra se paga se trouxer 30% mais volume (3 ÷ 2,3). O argumento de 2A e
2B é que, sem ela, os potes desequilibrados nem chegam a existir; o modelo não consegue medir isso.

---

## 9. Metas de 90 dias

O fundador pediu: "você mesmo pode nos dizer ... o que seriam metas ruins, razoáveis e otimistas". As linhas de
volume, carteiras, taxa e pote médio saem dos três cenários (meses 1 a 3). As linhas de retorno, potes de um lado só e
volume por dólar de prêmio não saem do modelo: são SUPOSIÇÃO, ancoradas no limite de "uma em cada cinco carteiras"
de 2B e na conta de US$ 39 da seção 6.

| Medida, ao fim de 90 dias com dinheiro real | Ruim | Razoável | Otimista |
|---|---|---|---|
| Volume apostado, somado | Até US$ 45 mil | US$ 150 mil | US$ 750 mil ou mais |
| Volume no terceiro mês | US$ 22.500 | US$ 75.000 | US$ 375.000 |
| Carteiras ativas no terceiro mês | 150 | 375 | 1.500 |
| Perguntas abertas e resolvidas | 24 | 24 | 36 |
| Pote médio por pergunta | US$ 1.875 | US$ 6.250 | US$ 20.833 |
| Taxa arrecadada | US$ 1.148 | US$ 3.825 | US$ 19.125 |
| Carteiras que apostam de novo em 30 dias, em pergunta sem prêmio | Menos de 10% | 20% a 35% | Mais de 35% |
| Potes que terminam de um lado só | Mais de 40% | Cerca de 20% | Menos de 10% |
| Volume adicional por dólar de prêmio | Abaixo de 20 | 20 a 39 | 39 ou mais |
| Patrocínio | Nenhuma carta de intenção | Três cartas de intenção; primeiro pagamento no mês 4 | Três patrocinadores de US$ 500 pagos |
| Resolução | Qualquer resultado errado ou prazo perdido | Nenhum | Nenhum |
| Caixa acumulado no mês 3, regime (a) | −US$ 60.213 | −US$ 59.544 | −US$ 54.669 |

Réguas (FATO e FATO SECUNDÁRIO): o World fez US$ 1,14 milhão no primeiro mês, dentro da Phantom. Todos os mercados
sobre o pump.fun no Polymarket somaram cerca de US$ 263 mil. A meta razoável de 90 dias é 57% desse total; a
otimista é 66% do primeiro mês do World.

Como usar (INFERÊNCIA):

- **O retorno sem prêmio manda mais que o volume.** Volume alto com retorno abaixo de 10% é o padrão que antecedeu as
  quedas de 80% a 96% dos concorrentes. Volume razoável com retorno de 30% é um negócio pequeno e real.
- **Critério de parada proposto.** Se aos 180 dias o volume do mês for de até US$ 45 mil e o retorno estiver abaixo
  de 10%, o cenário é o ruim, que não se paga em nenhum regime. Parar ali limita a perda a cerca de US$ 68 mil; seguir
  até o mês 24 leva a US$ 118 mil. O critério deve ser escrito antes do lançamento.
- **Marco de contratação.** Só passar ao nível 2 quando o dinheiro disponível no regime escolhido pagar US$ 10.000
  por três meses seguidos (ver a ressalva em 4.4).

---

## 10. O que o modelo não sabe

1. **Quanto cada carteira aposta por mês.** Não há dado em nenhuma plataforma. Usei US$ 150, 200 e 250. Se for
   metade, todo o volume cai pela metade (8.4).
2. **Quantas carteiras aparecem e quantas voltam.** As trajetórias são linhas retas supostas. Os concorrentes
   mostram picos seguidos de quedas de 80% a 96%, que o modelo não reproduz.
3. **Se existe demanda pelo recorte.** A Onda 1 escreveu "demanda direta pelo recorte: não demonstrada". Os três
   cenários supõem que alguma existe; o piso verdadeiro é o do PNP, perto de zero.
4. **Quanto dinheiro sai antes da resolução e com que penalidade.** O mecanismo não tem precedente. Usei 20% e 25%.
5. **Quantos patrocinadores pagam.** Não há precedente pago em nenhum concorrente nem conversa registrada.
6. **O sentido do 70/30 e o destino da parte da banca.** Mostrei os dois sentidos e supus 100% para a operação.
7. **O efeito da taxa no volume.** A tabela 8.1 mantém o volume fixo. Ninguém mediu a elasticidade num pote.
8. **Quão desequilibrados serão os potes.** Fatos on-chain tendem a ter favorito claro. O modelo cobra 3% de todo
   pote e não reduz o volume dos desequilibrados.
9. **A duração real das perguntas.** Muda o dinheiro travado e o atraso da taxa. Usei 14 dias.
10. **O custo real.** A auditoria (US$ 15 a 45 mil), a empresa e o advogado vêm de blogs de fornecedores. O nível 3 é
    um "placeholder" do sócio, e a divisão dele por linha é minha.
11. **O prazo até o lançamento.** O modelo começa no mês 1 com dinheiro real. Cada mês de reescrita e de auditoria
    antes disso custa tempo e não está nas tabelas.
12. **Impostos, câmbio e contabilidade** da empresa, da tesouraria em Bitcoin e do token.
13. **Bloqueio geográfico.** Se o Brasil ou os Estados Unidos forem bloqueados, o público muda. Para advogado.
14. **Se o volume de apostas cai junto com o Bitcoin.** Se cair, a tesouraria vale menos justamente quando a receita
    some. Não verificado (1F).
15. **Quanto do volume o fundo de prêmios causa.** Nenhuma plataforma publicou esse retorno.
16. **A venda privada do segundo token.** Não entra como receita nem como caixa. Preço, data e destino são propostas.
17. **Reembolso por resolução errada, falha do programa ou ataque.** É um passivo sem valor no modelo.
18. **Custo de vender patrocínio.** 2B estimou cinco horas por venda; não entra como caixa porque é tempo de sócio.
19. **O sócio técnico.** O modelo supõe que o programa é escrito e mantido sem custo de equipe no nível 1.

---

## O que isto muda no plano (INFERÊNCIA)

Nenhuma decisão do fundador foi alterada. O que segue é leitura minha, para o coordenador e para o fundador.

1. **O número de trabalho passa a ser 0,64% do volume, e não 0,75%.** A saída antecipada, decidida para o MVP, tira
   15% da base da taxa nas premissas de 2B. Os volumes de equilíbrio do Business Plan devem ser US$ 471 mil,
   US$ 1,57 milhão e US$ 3,92 milhões por mês, ou os de 2B com a ressalva de que não contam as saídas.
2. **O Business Plan deve mostrar três cenários com régua, e dizer que o ruim não se paga.** O ruim é parecido com o
   que a Myriad arrecada em taxas; o razoável é 2% a 5% do World; o otimista é um terço do World e pede 13,7 vezes o
   dinheiro travado dele.
3. **A regra de partida não é, sozinha, o que reduz o capital.** Com custo de US$ 3.000 ela economiza de US$ 3 a 11
   mil. O que ela muda é a possibilidade de os fundadores receberem: no razoável, a divisão em quatro desde o dia 1
   não sustenta o nível 2 até o mês 24 (no sentido A só fecha no azul nos meses em que entra o patrocinador de
   US$ 5.000); a regra de partida paga o nível 2 a partir do mês 14.
4. **O marco de contratação e o regime da taxa têm de ser decididos juntos.** O marco de US$ 400 mil só funciona com
   a regra de partida.
5. **O gasto antes do lançamento é o maior pedaço do capital.** De US$ 30 a 75 mil, contra US$ 7 a 40 mil de
   déficit no razoável. Três cotações de auditoria valem mais para o plano do que refinar o volume.
6. **O capital do plano, no nível 1, é de US$ 70 a 110 mil com reserva** nos cenários razoável e otimista, e a
   perda no cenário ruim é de US$ 68 mil com critério de parada no mês 6.
7. **O 70/30 vale US$ 36 mil em 24 meses no razoável** (US$ 63 mil de banca no sentido A, US$ 27 mil no B). No
   regime (b) o sentido quase não muda o capital; no (a), muda US$ 26 mil. Isso reforça a leitura de 1F e 2B: com a
   regra de partida, o sentido B (mais dinheiro no pote) custa pouco à empresa.
8. **A fatia da penalidade de saída é a única "outra receita" com tamanho** (1% do volume com 20% da penalidade).
   Vale levar ao fundador como pergunta, com a ressalva de que depende de premissas sem dado.
9. **O fundo de prêmios entra no plano com a regra de três sinais** e com gasto inicial de US$ 7.500 pago pelos
   sócios, em metade das perguntas, sorteadas, com teto de 3% do pote.
10. **A venda privada do segundo token não entra em nenhuma linha de caixa.** A recompra sustenta, no máximo,
    US$ 1,9 milhão de avaliação no otimista do mês 24.
11. **As metas de 90 dias devem trazer o retorno sem prêmio ao lado do volume**, e o critério de parada escrito.

## Perguntas em aberto

1. No "70/30", qual parte é da banca? E a parte da banca vai inteira para a operação ou se divide em quatro?
2. O fundador aceita a regra de partida? Se sim, com qual gatilho e com qual reserva?
3. Quando os fundadores passam a receber, e quanto? A resposta define o nível de custo e o capital.
4. Quanto os dois sócios podem pôr do bolso, e por quantos meses?
5. A taxa de 3% incide sobre o valor devolvido a quem sai antes? (8.5)
6. Uma parte da penalidade de saída pode ir para a banca? (3.5)
7. O dinheiro do patrocinador e do fundo dentro do pote paga os 3%?
8. O fundador aceita um critério de parada escrito antes do lançamento?
9. Qual é a aposta média e a frequência do público-alvo? Só entrevistas ou um teste respondem.
10. Qual é a duração média das perguntas que a equipe pretende abrir no primeiro trimestre?
11. Cotações reais de auditoria, de abertura de empresa e de avaliação jurídica.
12. Quanto tempo leva reescrever, testar e auditar o programa? O modelo começa a contar só no lançamento.
13. O teto da taxa pelo lado perdedor será testado? Com qual mistura de potes?
14. Existe algum patrocinador disposto a assinar carta de intenção antes do lançamento?

## Fontes

Arquivos do projeto (lidos por inteiro ou nas seções citadas). Não houve pesquisa nova na web.

- `docs/business/ideacao-perguntas-e-respostas.md` (decisões do fundador; fonte da verdade)
- `docs/business/_review/plano-das-ondas.md` (seções A e C)
- `docs/business/_review/wave-2-business-finance.md` (agente 2B): níveis de custo, gasto de pré-lançamento, regra de
  partida, marco de contratação, premissas de saída antecipada, cenários de patrocínio
- `docs/business/_review/wave-2-devils-advocate.md` (agente 2A): patrocínio zero no cenário ruim, teto da taxa pelo
  lado perdedor, objeções O6, O11 e O16
- `knowledge-base/market/monetizacao-e-tesouraria.md` (agente 1F): outras receitas, conta do 70/30, limite de 3,09%,
  fundo de prêmios, tesouraria em Bitcoin, preço do bitcoin
- `knowledge-base/market/market-research.md` (agente 1B): Solana em dez/2025, volumes do setor
- `knowledge-base/market/publico-web3.md` (agente 1D): mercados de pump.fun no Polymarket, ausência de dado de
  aposta média
- `knowledge-base/market/dois-tokens-e-ico-privado.md` (agente 1G): cronograma dos tokens, destino da venda privada,
  taxa de criador do pump.fun
- `knowledge-base/competitors/top-5-competitor-analysis.md` (agente 1E): volumes de World e Limitless, taxas, PNP
- `knowledge-base/competitors/competitor-longlist.md` (agente 1A): taxas da Myriad em 30 dias
- `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md` (agente 1H): fórmula da penalidade de saída
- `ECONOMICS.md` do sócio, seção 4 (`git show upstream/main:ECONOMICS.md`): custo de US$ 25.000 por mês
  ("placeholder"), avaliação de exemplo de US$ 5 milhões, rendimento exigido de 20%

Fontes originais dos fatos usados como régua, como citadas nesses arquivos: DefiLlama (World, Limitless, Jupiter,
Myriad), DeFiRate e Dune (semana de dez/2025), Predictefy (quedas de volume), Step Data (Solana em dez/2025), Helius
(preço do RPC), Accretion e TierZero (custo de auditoria), CoinGape e Decrypt (preço do bitcoin), RPC público da
Solana e DexScreener (PNP). Datas e ressalvas de cada uma estão nos arquivos de origem.

Não encontrado em nenhum arquivo: aposta média por carteira; fração de dinheiro que sai antes num pote; retorno
medido de prêmios; caso de patrocínio de pergunta pago; elasticidade do volume à taxa.
