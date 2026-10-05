# Kalshi: como funciona (docs.kalshi.com + help.kalshi.com)

Data da leitura: 3 de outubro de 2026.

Escopo: o índice de docs.kalshi.com (llms.txt: cerca de 244 páginas de conteúdo, mais 5 specs YAML). Foram
abertas quase todas as páginas do índice (ver "Fontes": cerca de 240 de docs.kalshi.com), mais artigos de
help.kalshi.com, news.kalshi.com e trechos de busca sobre o Rulebook. As páginas de referência de API foram abertas
uma a uma e resumidas por grupo, sem transcrição de campos. As leituras passaram por um resumidor automático
(WebFetch), então citações literais são raras e números devem ser conferidos na fonte antes de virarem decisão.
As páginas de kalshi.com (taxas, impostos, KYC, Member Agreement) continuaram com HTTP 429. Tudo que não foi lido
está em "Não lido". Segunda rodada de leitura feita no mesmo dia.

Convenção: "FATO" = lido na fonte citada. "INFERÊNCIA" = interpretação minha, só na seção final.

## Resumo em dez linhas

1. A Kalshi é uma bolsa regulada pela CFTC (Designated Contract Market). Ela não aposta contra o usuário.
2. Os mercados são criados e aprovados pela equipe de mercados da Kalshi; usuários só sugerem ideias.
3. Cada mercado é um contrato binário (Sim/Não) que paga 1 dólar por contrato ao lado vencedor.
4. A negociação é por livro de ordens: quem posta é maker, quem executa é taker; o usuário vende antes do fim.
5. A API só mostra bids, porque um bid de Sim a X equivale a um ask de Não a (1 - X).
6. A liquidação ocorre depois de a fonte oficial publicar o resultado, em geral cerca de 3 horas depois.
7. Se a condição ocorre antes, o mercado pode fechar e resolver antes da data final. Em caso de dúvida, um
   Comitê de Revisão de Resultado da própria Kalshi decide (Rule 7.1 do Rulebook, só em trecho de busca).
8. Taxa de taker: 0,07 x contratos x P x (1 - P), arredondada para cima; maker só em séries listadas.
9. Há juros sobre saldo e posições, programa de liquidez, programa de market makers e indicação.
10. KYC é obrigatório antes de negociar; há lista de jurisdições restritas; emite formulários 1099 nos EUA.

## 1. Quem cria os mercados e como

FATO (help.kalshi.com/en/articles/13823833-suggesting-a-new-market): usuários propõem mercados pelo portal de ideias
(kalshi.com/ideas/feed). A equipe de mercados avalia se a proposta cumpre regras da CFTC, não é fácil de manipular
e é de interesse dos usuários. Nem toda sugestão vira mercado.

FATO (news.kalshi.com/p/what-is-the-market-life-cycle): ideias vêm de membros ou da equipe; passam por "revisão
minuciosa" da equipe da Kalshi e da CFTC antes de listar. Depois de aprovado, o mercado fica pesquisável e abre.

FATO (resultado de busca, páginas assets.kalshi.com/regulatory/product-certifications/*.pdf; não abri os PDFs):
a KalshiEX LLC notifica a CFTC que "autocertifica" novos contratos (Seção 5c(c) do Commodity Exchange Act e
40.2(a) das regras da CFTC), com cartas datadas de 2026 enviadas pelo portal da CFTC.

FATO (help.kalshi.com/en/articles/13823765-how-is-kalshi-regulated, só vi o resultado de busca): a Kalshi opera
como DCM sob a CFTC.

FATO (docs.kalshi.com/api-reference/multivariate/create-market-in-multivariate-event-collection.md): existe um
caso em que qualquer usuário autenticado cria mercados pela API: dentro de uma "coleção de eventos multivariados"
(combos) já definida pela Kalshi, escolhendo mercados existentes e o lado (sim/não). Limite de 5000 criações por
semana. O usuário não define pergunta nem regra nova; só combina mercados que a Kalshi já listou.

FATO: nada nas páginas de API lidas permite a um usuário criar uma pergunta nova com regras próprias.

## 2. Estrutura: séries, eventos, mercados, contratos

FATO (docs.kalshi.com/getting_started/terms.md):
- Série: coleção de eventos relacionados, que olham dados parecidos em períodos distintos e sem dependência lógica.
- Evento: coleção de mercados e "a unidade básica com que o membro interage".
- Mercado: um único mercado binário, o objeto de nível mais baixo.
- Hierarquia: série, evento, mercado. Categoria e tags são metadados de descoberta na série.

FATO (docs.kalshi.com/api-reference/market/get-market.md): o mercado tem `market_type` "binary" ou "scalar"; campos
`yes_sub_title`, `no_sub_title`, `rules_primary`, `rules_secondary`, `notional_value_dollars` (valor de um contrato
na liquidação), `open_interest_fp`, `can_close_early`, `early_close_condition`, `expiration_value`. Mercados
escalares usam `strike_type` (greater, less, between, functional, custom, structured) e `floor_strike`/`cap_strike`.

FATO (docs.kalshi.com/api-reference/events/get-event.md): `mutually_exclusive` é verdadeiro quando no máximo um
mercado do evento resolve Sim; `collateral_return_type` MECNET (mutuamente exclusivos) ou DIRECNET (direcional)
libera colateral por netting dentro do evento, se o netting estiver ativado na conta.

FATO (docs.kalshi.com/api-reference/market/get-series.md): a série tem `frequency`, `settlement_sources` (fontes
oficiais, nome e URL), `contract_url` (link para o arquivamento do contrato original), `contract_terms_url`,
`fee_type`, `fee_multiplier`, `additional_prohibitions`.

FATO (docs.kalshi.com/api-reference/multivariate/get-multivariate-event-collection.md): coleção multivariada agrupa
eventos em uma estrutura negociável (combos), com `size_min`/`size_max`, `is_ordered` e `functional_description`.

FATO (docs.kalshi.com/getting_started/targets_and_milestones.md): "milestones" ligam eventos a ocorrências reais;
"structured targets" identificam entidades (times, jogadores) referenciadas por mercados.

FATO (docs.kalshi.com/getting_started/fixed_point_migration.md): preços em dólares com até 4 casas (`_dollars`);
quantidades com até 2 casas (`_fp`), mínimo 0,01 contrato. Cada mercado define uma grade de preços (`price_ranges`)
e há 15 estruturas, de `linear_cent` (tick de 1 centavo) a estruturas com ticks finos nas pontas.

FATO (docs.kalshi.com/getting_started/exchange_sharding.md): vários motores de matching; shard 0 padrão, 1 combos,
2 cripto e commodities, 3 tênis, beisebol e basquete. Colateral deve ser pré-alocado por shard.

## 3. Como se negocia

FATO (help.kalshi.com/en/articles/13823808-who-are-you-trading-with): o usuário negocia com outros membros, não
com a bolsa. Maker posta primeiro, taker executa. Tipos de trader: direcional, hedger e market maker. A maioria dos
participantes é varejo.

FATO (docs.kalshi.com/getting_started/orderbook_responses.md): o livro devolve só bids (`yes_dollars`,
`no_dollars`). "Um BID de SIM a X equivale a um ASK de NÃO a (1,00 - X)". Spread de Sim = 1 - melhor bid de Não -
melhor bid de Sim.

FATO (docs.kalshi.com/getting_started/order_direction.md): direção em dois vocabulários, `outcome_side` (yes/no)
e `book_side` (bid/ask). Comprar Sim = vender Não em exposição. Campos legados valem até 28 de maio de 2026.

FATO (docs.kalshi.com/api-reference/orders/create-order-v2.md): `time_in_force` = fill_or_kill,
good_till_canceled, immediate_or_cancel; `post_only`; `reduce_only` (exige immediate_or_cancel);
`self_trade_prevention_type` = taker_at_cross ou maker; `cancel_order_on_pause`; `expiration_time`; `subaccount`;
`order_group_id`; `client_order_id` (deduplicação, 409 em duplicata). Preço e quantidade seguem a grade do mercado.

FATO (help.kalshi.com/en/articles/13823811-limit-orders): ordem limite que fica no livro e é executada por outro
trader evita taxa de taker; sem garantia de execução.

FATO (news.kalshi.com/p/selling-early): o usuário pode vender o contrato antes do vencimento para travar lucro,
limitar perda ou liberar capital. Exemplo da página: comprar Sim a 15 centavos e vender a 40 realiza 25 centavos.

FATO (help.kalshi.com/en/articles/13823844-portfolio-balances-and-positions): o valor de posição mostrado "não é
um valor garantido pelo qual você possa vender"; depende de liquidez.

FATO (help.kalshi.com/en/articles/13823818-flip-selling): "flip selling" permite vender mais contratos do que se
tem (vende os que possui e compra o lado oposto para o restante); precisa ser ativado nas configurações.

FATO (docs.kalshi.com/getting_started/rfqs.md): RFQ para blocos e combos. Quem pede especifica mercado e tamanho;
market makers respondem com `yes_bid` e `no_bid`; o solicitante aceita; o maker confirma em janela de 30 s
(execução em 15 s). Em mercados de alta volatilidade, incluindo todos os combos, 3 s e 1 s. O criador pode
ocultar a identidade (`obscure_creator_id`).

FATO (docs.kalshi.com/getting_started/order_groups.md): grupos de ordens cancelam automaticamente quando contratos
executados em janela móvel de 15 segundos passam do limite (1 a 1.000.000).

FATO (docs.kalshi.com/getting_started/maintenance_and_pauses.md): manutenção toda quinta, das 3h às 5h ET (pausa de
trading: só cancelamentos). Pausa de exchange é rara e bloqueia tudo. Ordens permanecem no livro salvo configuração.

FATO (docs.kalshi.com/getting_started/subaccounts.md): subaccounts 0 a 63, só via API, só para contas Direct;
chaves de API podem ser restritas a uma subaccount.

FATO (help.kalshi.com/en/articles/13823819): market makers aprovados podem ter "limites de posição ajustados".

FATO SECUNDÁRIO (trechos de busca de arquivos do Rulebook na CFTC; não abri o texto): a Regra 5.14(a) dizia
"Kalshi impôs limites de posição de 25.000 dólares em todos os contratos"; foi emendada para valer "conforme
especificado nos Termos e Condições de cada contrato". Um exemplo citado: contratos de CPI com limite de 25.000
dólares por membro. Uma alteração posterior, não efetiva antes de 27 de novembro de 2024, trocou "Position Limit"
por "Position Accountability Level" em alguns contratos, com 25.000 contratos por strike por membro. Esses números
são de 2021 a 2024 e podem ter mudado; confirmar nos Termos de cada mercado.

NÃO CONFIRMADO: regras de margem do mercado de eventos (os docs de eventos só falam em netting por evento).

FATO (docs.kalshi.com/api-reference/orders/amend-order-v2.md): alterar só a expiração ou reduzir o tamanho preserva
a posição na fila; aumentar o tamanho ou mudar o preço manda a ordem para o fim da fila (prioridade preço-tempo,
docs.kalshi.com/api-reference/orders/get-order-queue-position.md). Custos de token: criar 10 por ordem, cancelar 2,
consultar ordem 2 (create-order-v2, cancel-order-v2, get-order). Cancelar tudo cobra 2 tokens e pode cancelar
ordens colocadas no último minuto (cancel-all-orders.md). Estados de ordem: resting, canceled, executed.

FATO (docs.kalshi.com/api-reference/market/get-markets.md, get-market-orderbook.md, get-trades.md): dados de mercado
são públicos, sem chave; get-markets filtra por status (unopened, open, closed, settled), máximo 1.000 por página;
livro com até 100 níveis de profundidade, 100 mercados por chamada múltipla; trades até 1.000 por página.

FATO (docs.kalshi.com/api-reference/order-groups/*): até 100.000 grupos de ordens por usuário; limite de contratos
em janela de 15 s; grupos disparados cancelam tudo até serem reiniciados (reset).

FATO (docs.kalshi.com/api-reference/communications/*): no máximo 100 RFQs abertos por vez; quantidade em passos de
0,01; blocos (block trades) são propostos entre comprador e vendedor com id de usuário, preço, quantidade e prazo.
Endpoints de quote antigos (get/delete/accept/confirm quote sem o RFQ no caminho) estão marcados como obsoletos.

FATO (docs.kalshi.com/api-reference/exchange/*): há endpoint de status (exchange_active, trading_active,
transferências ativas, por shard), de agenda (horário padrão e janelas de manutenção, em ET) e de "user data
timestamp" (há pequeno atraso entre eventos da bolsa e a API).

FATO (docs.kalshi.com/api-reference/events/get-event-fee-changes.md): taxas podem ser sobrescritas por evento
(`fee_type_override`, `fee_multiplier_override`), com data agendada.

FATO (docs.kalshi.com/margin.md): existe um produto separado, "Perps" (futuros perpétuos com margem), com REST,
WebSocket e FIX próprios, liberado "membro a membro". Fora do escopo do mercado de previsão (ver seção 10).

## 4. Liquidação e resolução

FATO (docs.kalshi.com/getting_started/market_lifecycle.md): estados: Initialized, Active, Inactive, Closed,
Determined, Disputed, Amended, Finalized. Initialized vira Active em `open_time`; ativo ou inativo vira Closed
em `close_time`. Closed vira Determined quando o resultado é fixado; Determined ou Amended vira Finalized no
pagamento. Existe estado Disputed (resultado contestado, pode ser re-determinado, depois Amended). Depois de
`close_time`, ordens novas dão erro e as ordens abertas são canceladas.

FATO (docs.kalshi.com/getting_started/market_settlement.md): holders de Sim recebem 1 dólar por contrato se o
resultado é Sim; holders de Não recebem 1 dólar se é Não. Só posições líquidas (após netting) são liquidadas.
Taxas de liquidação são tipicamente zero em binários; escalares sub-centavo podem ter taxa. Pagamento arredondado
em centavos.

FATO (docs.kalshi.com/api-reference/market/get-market.md): campos `result` (yes, no, scalar),
`settlement_value_dollars`, `settlement_ts` e `settlement_timer_seconds` ("tempo após a determinação em que o
mercado liquida"). `expected_expiration_time` e `latest_expiration_time` marcam a janela prevista da resolução.
`is_provisional`: o mercado pode ser removido após a determinação se não teve atividade.

FATO (help.kalshi.com/en/articles/13823821-market-faqs): a maioria dos mercados liquida cerca de 3 horas depois
de o resultado ser confirmado; pode demorar mais se a Kalshi depende de uma agência de origem para publicar o
resultado final. Se um mercado padrão não liquidar após cerca de 12 horas, falar com o suporte. Combos liquidam
mais devagar. Um combo com valores intermediários (ex.: 0,70) paga o produto dos valores.

FATO (help.kalshi.com/markets/markets-101/market-rules): cada mercado tem regras na própria página, com a
condição de resolução em Sim e a "fonte de verificação do resultado". Um mercado aberto ou sem determinação "não
indica de forma alguma" que o critério foi ou não cumprido. Os mercados são revisados pela equipe, que determina
o resultado quando decide que o critério foi cumprido.

FATO (news.kalshi.com/p/what-is-the-market-life-cycle): o mercado pode fechar e resolver antes das datas finais
se a condição ocorrer antes (exemplo da página: perdão de dívida estudantil fecharia no instante do anúncio, sem
esperar 31 de dezembro de 2024). `can_close_early` e `early_close_condition` descrevem isso na API.

FATO (docs.kalshi.com/getting_started/settlement_bounds.md): mercados escalares com "floor" elevam um piso de
liquidação conforme parte do resultado se torna certa; o piso libera saldo aos holders de Sim. A própria página diz
que o recurso "ainda não está no ar" (lançamento a definir). O changelog diz o contrário (ver Não lido, item 8).

FATO (docs.kalshi.com/fix/market-settlement.md): relatório de liquidação FIX (35=UMS) traz resultado, preço Sim
antes da taxa, posições, pagamento depois da taxa. "A taxa reduz o pagamento, não o preço de liquidação."

FATO SECUNDÁRIO (trechos de busca de versões do Rulebook arquivadas na CFTC e da cópia hospedada pela Robinhood;
não consegui abrir o texto, os PDFs voltam comprimidos): "Source Agency" é a agência que publica o valor
subjacente ou de expiração do contrato. Regra 6.3: a liquidação ocorre no máximo no dia seguinte à expiração,
exceto se o resultado estiver em revisão. Regra 7.1 (Market Outcome Review Process): antes da liquidação, a Kalshi
pode abrir a revisão "a seu exclusivo critério", considerando fatores como circunstâncias que afetem a confiabilidade
ou a transparência do subjacente; o "Outcome Review Committee" determina o resultado final, em até 24 horas.
Terceiros (oddsshopper, defirate) afirmam que a decisão do comitê é final e sem recurso independente; isso é
leitura de terceiros, não do texto.

FATO (docs.kalshi.com/api-reference/live-data/get-weather-index.md e get-weather-index-calibrations.md): para
mercados de temperatura horária, a própria Kalshi calcula o índice de temperatura da cidade (série por minuto,
Fahrenheit com 0,01 de precisão), com pesos e offsets de estações, histórico de configuração "append-only" e
recalibração semanal. Ou seja, a Kalshi publica o dado que usa para liquidar.

NÃO CONFIRMADO: o texto exato do Rulebook sobre disputa e a existência de recurso. Fica como "Não lido".

## 5. Taxas

FATO (docs.kalshi.com/getting_started/fee_rounding.md): cada fill gera taxa de trade (arredondada para cima a
0,000001 dólar), taxa de arredondamento e rebate. Alvo de precisão do saldo: 0,0001 dólar para membros diretos,
0,01 para não diretos. Taxa líquida = taxa de trade + taxa de arredondamento - rebate (mínimo 0).

FATO (docs.kalshi.com/api-reference/market/get-series.md e exchange/get-series-fee-changes.md): `fee_type` por
série: quadratic, quadratic_with_maker_fees, quadratic_with_combo_maker_fees, flat; `fee_multiplier` por série; a
página remete a kalshi.com/docs/kalshi-fee-schedule.pdf. Mudanças de taxa são agendadas por série.

FATO (help.kalshi.com/en/articles/13823805-fees): a Kalshi cobra "taxa de transação sobre o ganho esperado do
contrato". Mercados específicos (eleições, premiações, finais esportivas) podem ter estrutura de taxa diferente.
A taxa aparece antes da compra, no ícone de informação ao lado de "You're buying". Perps têm taxa própria.

FATO (help.kalshi.com/kalshi-101/how-does-kalshi-make-money): a receita vem de taxa de transação; a Kalshi diz não
ter interesse financeiro no resultado.

FATO SECUNDÁRIO (resultado de busca citando kalshi.com/docs/kalshi-fee-schedule.pdf, "Fee Schedule for July 2026
- 7.7.26 Update"; o PDF em si NÃO consegui abrir, deu HTTP 429 três vezes): taker = arredondar para cima
(M x 0,07 x C x P x (1 - P)), com M = multiplicador (padrão 1), C contratos, P preço em dólares; o arredondamento
é feito de modo que taxa + custo da posição fique em centicent. Maker = arredondar para cima
(M x 0,0175 x C x P x (1 - P)), com M padrão 0 salvo séries listadas. Taxa de trade só é cobrada em ordens
executadas de imediato contra o livro; ordens que ficam descansando não pagam, salvo séries com maker fee. Cancelar
não custa nada. Esses números coincidem com os que já tínhamos; a confirmação é em texto de busca da página
oficial, não leitura direta. A afirmação "S&P 500 e Nasdaq-100 usam 0,035" vem de sites de terceiros (pm.wiki e
similares) e não foi confirmada na fonte oficial.

Outras taxas (só em resultado de busca, help.kalshi.com/en/articles/13823795-card-deposits e
13823798-bank-deposits): depósito via cartão de débito pode ter 2% de processamento; ACH sem taxa; saque sem taxa.

## 6. Incentivos

FATO (help.kalshi.com/en/articles/13823847-apy-on-kalshi): juros de 3,50% ao ano (variável) sobre caixa e posições
abertas; acúmulo diário sobre o valor líquido do portfólio à meia-noite ET; pagamento mensal, normalmente na
primeira semana do mês seguinte (até 10 dias úteis). Exige saldo de pelo menos 250 dólares e residência elegível
nos EUA; o SSN é exigido acima de 10 dólares de juros por ano.

FATO (help.kalshi.com/en/articles/13823851-liquidity-incentive-program): paga por ordens descansando no livro. A
cada snapshot, acha um preço de referência descendo do melhor bid até o tamanho acumulado atingir um quinto do
tamanho-alvo; ordens na referência ou melhores têm crédito total, piores são penalizadas por fator de desconto;
pontuação = participação relativa. Recompensas de 1 a 1.000 dólares por mercado por dia, pagamento mínimo 1 dólar,
programa até 1 de janeiro de 2027. Excluídos: funcionários, afiliados, corretoras e usuários internacionais.

FATO (help.kalshi.com/en/articles/15410219-liquidity-provider-program): "Designated Liquidity Providers" por
leilão periódico; o market maker informa a recompensa mínima aceita; exige Market Maker Agreement; mais de 80
séries; término em 31/12/2026; de 1 a 6 provedores por mercado.

FATO (help.kalshi.com/en/articles/13823819-how-to-become-a-market-maker-on-kalshi): market makers aprovados podem
ter taxas reduzidas e limites de posição ajustados, em troca de cotar dois lados (exigência de 98% de cada hora
nos produtos cobertos). Parceiros FCM: Webull Financial, Robinhood Derivatives, Direct Access USA.

FATO (docs.kalshi.com/api-reference/incentive-programs/get-incentives.md): tipos `liquidity` e `volume` (mais dois
de margem); `period_reward` em centi-cents; `max_reward_per_account`; status all, active, upcoming, closed, paid_out.

FATO (help.kalshi.com/en/articles/13823783-kalshi-referral-program-faq): link de indicação; o bônus sai depois de
cadastro, verificação de identidade e requisito de negociação; código em até 72 h da criação e antes do 1º
depósito; o valor original do crédito geralmente não é sacável; crédito expira em 7 dias; há teto vitalício;
só EUA.

FATO (help.kalshi.com/en/articles/16076644-liquidity-and-volume-incentive-programs-where-to-find-them): os
programas aparecem em kalshi.com/incentives, em selos nos mercados (pool, prazo, Target Size, Discount Factor) e
em pontos coloridos no livro (azul = nível qualificado). Estimativas são provisórias; a pontuação final sai após o
fim do programa; recompensas abaixo de 1 dólar por programa não são pagas.

## 7. Conta, KYC e geografia

FATO (help.kalshi.com/en/articles/13823778-signing-up-as-an-individual): ter 18 anos ou mais e passar verificação
de documento quando pedida.

FATO (resultado de busca da página kalshi.com/market-integrity/customer-identification; abrir
kalshi.com/market-integrity/kyc-surveillance deu 429): ninguém negocia antes de concluir o KYC; coleta nome,
endereço, data de nascimento, telefone, documento ou SSN. Há triagem de pessoas bloqueadas: certos condenados,
desqualificados pela CFTC, sancionados, e altos cargos públicos e seus familiares.

FATO (help.kalshi.com/en/articles/14026044-can-i-trade-on-kalshi-from-outside-the-united-states): pode-se negociar
de muitos países, sujeito ao Member Agreement. Internacionais usam cartão Visa/Mastercard, transferência (mínimo
1.000 dólares) ou cripto; sem ACH, PayPal ou Venmo.

FATO SECUNDÁRIO (lista de jurisdições restritas em resultado de busca sobre o Member Agreement; não abri o PDF):
constam, entre outros, Austrália, Canadá, França, Índia, Itália, Reino Unido, Suíça, Singapura, Rússia, China e
países sob sanções dos EUA. O Brasil não aparece na lista que vi, mas isso NÃO é confirmação de que seja
permitido: conferir no Member Agreement.

FATO (help.kalshi.com/en/articles/13823798-bank-deposits e 13823803-bank-withdrawals): depósito por banco via
Plaid ou Aeropay, só EUA, só conta em nome do usuário, mínimo 10 dólares, sem taxa, liquida em até 5 dias úteis. A
Kalshi pode creditar parte do valor na hora (exemplo da página: 150 de 200 dólares); se o ACH falhar, o valor é
debitado e disputas podem gerar saldo negativo. Saque por banco: sem taxa, só EUA, vários dias úteis; pode haver
"security hold" após depósito recente.

FATO (resultados de busca de help.kalshi.com, artigos 13823795, 13823802, 13823804): cartão de débito (instantâneo,
mínimo 10, taxa possível de 2%), cripto (saque em cerca de 30 min, exige depósito cripto prévio). Há limite diário
de saque personalizado.

FATO (docs.kalshi.com/api-reference/portfolio/get-deposits.md e get-withdrawals.md): tipos de depósito e saque:
ach, wire, crypto, debit, apm; status pending, applied, failed, returned; cada registro traz `fee_cents`.

FATO (help.kalshi.com/en/articles/13823765-how-is-kalshi-regulated): a Kalshi é DCM sob a CFTC; a página fala em
transparência, integridade de mercado e prevenção de fraude, e remete a uma página regulatória com rulebooks.

## 8. Impostos

Não consegui ler https://kalshi.com/account/taxes (HTTP 429 em duas tentativas, em momentos diferentes). O que
segue vem de outras páginas.

FATO (help.kalshi.com/documents-and-taxes/tax-info e
help.kalshi.com/en/articles/13823849-what-tax-documentation-does-kalshi-provide): quem atinge os limites do IRS
recebe 1099-INT (juros), 1099-MISC (créditos e recompensas), 1099-B (proventos de transações de corretora,
transferências cripto) e 1099-DA (ativos digitais, via ZeroHash). Entrega eletrônica via Zenwork. Lucros e perdas
calculados por FIFO. O extrato de Profit and Loss fica em Conta, Tax Info, por ano; atualiza no dia 1 de cada mês.
A Kalshi diz que não dá aconselhamento tributário. Se nenhum formulário aparece, provavelmente o limite não foi
atingido.

FATO (resultado de busca da ajuda): limites de reporte citados: mais de 10 dólares de juros por ano; mais de 600
dólares em créditos de incentivo por ano civil. Não abri a página que traz esses valores; vem do trecho de busca.
O SSN é necessário para receber juros ou recompensas acima do limite.

## 9. Superfícies para desenvolvedores

FATO (docs.kalshi.com/getting_started/api_environments.md): REST de produção
`https://external-api.kalshi.com/trade-api/v2`; demo `https://external-api.demo.kalshi.co/trade-api/v2`;
WebSocket `wss://external-api-ws.kalshi.com/trade-api/ws/v2` (demo em .demo.kalshi.co). Credenciais de demo e
produção não são compartilhadas. Dados de mercado são públicos, sem autenticação. AWS PrivateLink só para
membros Premier ou acima.

FATO (docs.kalshi.com/getting_started/demo_env.md): demo em demo.kalshi.co com fundos simulados; preços e
comportamento "podem não refletir os reais".

FATO (docs.kalshi.com/getting_started/api_keys.md): chaves Ed25519 (recomendada) ou RSA-2048 (RSA-PSS SHA-256).
Cabeçalhos `KALSHI-ACCESS-KEY`, `KALSHI-ACCESS-TIMESTAMP` (ms) e `KALSHI-ACCESS-SIGNATURE` (timestamp + método +
caminho sem query). A chave privada não é guardada pela Kalshi.

FATO (docs.kalshi.com/sdks/overview.md): SDKs oficiais `kalshi_python_sync`, `kalshi_python_async` e
`kalshi-typescript`; `kalshi-python` está abandonado; SDKs podem ficar atrás da API; specs OpenAPI e AsyncAPI
publicadas.

FATO (docs.kalshi.com/getting_started/rate_limits.md): balde de tokens, a maioria dos requests custa 10 tokens.
Tokens por segundo (leitura/escrita): Basic 200/100; Advanced 300/300; Expert 600/600; Premier 1.200/1.200;
Paragon 2.400/2.400; Prime 4.800/4.800; Prestige 12.000/9.600. Rajada de 3 segundos nos baldes maiores. Estouro
devolve 429, sem penalidade; recomenda-se backoff exponencial.

FATO (docs.kalshi.com/fix/connectivity.md): FIX 5.0 SP2 sobre FIXT.1.1, TLS 1.2+, um serviço por porta (8228 a
8233: ordens, retransmissão, drop copy, posições e liquidação, RFQ, market data); uma conexão ativa por chave.

FATO (docs.kalshi.com/getting_started/pagination.md): paginação por cursor. Canais WebSocket listados no índice
(llms.txt, só os títulos): orderbook, ticker, trades públicos, fills do usuário, posições, ciclo de vida de
mercado, comunicações (RFQ), grupos de ordens, ordens do usuário, e feeds CF Benchmarks e Pyth.

FATO (docs.kalshi.com/getting_started/historical_data.md): dados migram de endpoints vivos para históricos
(mercados, candles, trades, ordens, posições), cada um com seu corte de data. Os 8 endpoints históricos
(api-reference/historical/*) espelham os vivos; o de cutoff devolve os marcos de arquivamento.

FATO (docs.kalshi.com/api-reference/account/*): a Kalshi tem faixas de uso de API. Subir para Advanced é
automático se pelo menos 1 das últimas 100 ordens veio por API (30 tokens). As faixas Expert a Prestige dependem de
volume nos últimos 30 dias, com limiares para ganhar e manter (os números não aparecem no resumo lido). Criar
subaccount exige a faixa Advanced. Criar chave com chave pública própria é para Premier ou market maker.

FATO (docs.kalshi.com/api-reference/api-keys/*): chaves têm escopos (read, write, trade, transfer...); o escopo
amplo `write` exige incluir `read`; chaves podem ser presas a uma subaccount ou a um subtrader de FCM (exclusivos);
chaves de FCM só funcionam em FIX e WebSocket, não em REST; a chave privada é devolvida uma única vez.

FATO (docs.kalshi.com/websockets/*): WebSocket exige autenticação no handshake mesmo para canais públicos
(ticker, trades, ciclo de vida de mercado); canais privados: orderbook, fills, posições, comunicações, grupos de
ordens, ordens do usuário. A Kalshi envia ping a cada 10 s. Códigos de erro de 1 a 27 (26 = limite de mercados por
assinatura, 27 = limite de comandos). Eventos de ciclo de vida: created, activated, deactivated,
close_date_updated, determined, settled, price_level_structure_updated.

FATO (docs.kalshi.com/websockets/pyth-value.md, cfbenchmarks-value*.md, cfbenchmarks/rest-passthrough.md): a Kalshi
revende dados de preço: CF Benchmarks (índices como BRTI e ETHUSD_RTI, 1 tick por segundo ou 5 Hz; passthrough
REST custa 50 tokens por chamada) e Pyth (assinatura de 1.000 dólares por mês, 7 dias grátis).

FATO (docs.kalshi.com/fix/*): FIX só aceita ordens limite (OrdType=2); validade Day, GTC, IOC, FOK, GTD; post-only e
reduce-only; ClOrdID único de até 64 caracteres; acesso FIX é padrão para Premier; heartbeat de 30 s; logon com
Ed25519 ou RSA-2048; sessões de retransmissão com janela de 24 a 72 h; drop copy só consulta, janela de 3 h;
market data até 1.000 símbolos por pedido e 100.000 assinaturas por sessão; preço em dólares com 4 casas se tag
21005=Y.

FATO (docs.kalshi.com/api-reference/fcm/*): endpoints para membros FCM (corretoras) gerenciarem subtraders: teto
diário de prêmio por subtrader, categorias bloqueadas, fills, ordens e posições. Não se aplicam a usuários comuns.

FATO (docs.kalshi.com/changelog/index.md, aberta diretamente): a página lista entradas com datas escritas como
"October 8, 2026", "October 1, 2026", "September 24, 2026" e "September 17, 2026" no topo, e entradas desde
"June 18, 2026" na parte mais antiga visível. Ou seja, a data de 8 de outubro de 2026 está na fonte, depois da
data da leitura (3 de outubro de 2026); não sei explicar. Itens de 1 de outubro dizem que `settlement_bounds_type`
e `settlement_floor_dollars` já aparecem nas respostas de mercado, enquanto a página settlement_bounds.md diz que o
recurso "ainda não está no ar": há contradição entre as duas páginas, que não resolvi. Outro item (24 de setembro):
limites de leitura e escrita 20% maiores para as faixas Premier a Prestige.

## 10. Perps (futuros perpétuos com margem)

FATO (help.kalshi.com/en/articles/14679970-what-are-perpetual-futures): perpétuos de Bitcoin sem vencimento, ganho
ou perda segue o preço do BTC; alavancagem de até 6x; funding a cada 8 horas, limitado a mais ou menos 2%; negocia
24 horas; mínimo de cerca de 8 dólares para abrir posição; a página diz que a 6x um movimento adverso de 17% zera a
margem; clearing pela Kalshi Klear LLC com contas segregadas.

FATO (help.kalshi.com/en/articles/15357594-how-margin-works): margem isolada (e portfólio para cripto
cobrível entre si); margem inicial, de manutenção e de variação; dois ciclos de liquidação por dia (cerca de 12h e
16h ET); a margem rende cerca de 3,25% ao ano enquanto está no clearing (fonte: help.kalshi.com/en/articles/15357594).

FATO (help.kalshi.com/en/articles/16071417-perps-fees-explained): taxa sobre o valor nocional inteiro (não sobre a
margem), cobrada na abertura e no fechamento; maker menor que taker; taxas por faixa de volume. Exemplo de taxa de
API (margin-rest/fees): 0,0005 = 5 pontos-base maker e 0,0012 = 12 pontos-base taker, apenas como exemplo de formato.

FATO (help.kalshi.com/en/articles/15357656-applying-for-perpetuals-access): só usuários dos EUA com KYC completo
podem pedir acesso; há questionário de experiência e tutorial obrigatório; a maioria usa a Kalshi Prime (FCM).

FATO (docs.kalshi.com/margin/*, margin-rest/*, margin-ws/*, fix-margin/*): API paralela à de eventos. Pontos de
negócio: faixa de preço (banding) com lances no mínimo 80% do melhor bid ou 1.000 ticks abaixo, e asks no máximo
120% do melhor ask ou 1.000 ticks acima (ticks de 0,0001); gatilhos de saída (stop-loss, take-profit, trailing), com
no máximo 1 trailing e 20 brackets por posição; limite de risco nocional por membro; parâmetros de risco públicos
(limiar de liquidação, fila de liquidação, multiplicador de margem inicial); funding estimado por índice de prêmio
por segundo; `market_version` sobe em ações corporativas e ordens contra versão antiga recebem 409; nada de
batch, RFQ, histórico ou fila de posição no Perps.

FATO (docs.kalshi.com/api-reference/portfolio/intra-account-transfer.md): fundos andam entre as instâncias
"event_contract" e "margined" da mesma conta; transferências entre shards não são atômicas.

## Não lido

Falhas de leitura (HTTP 429, tentadas pelo menos 3 vezes cada, espaçadas ao longo da sessão):
1. https://kalshi.com/account/taxes: HTTP 429 em quatro tentativas. Provavelmente exigiria login de qualquer forma.
   Equivalente público: help.kalshi.com/documents-and-taxes/tax-info (seção 8).
2. https://kalshi.com/fee-schedule: HTTP 429 em duas tentativas.
3. https://kalshi.com/docs/kalshi-fee-schedule.pdf: HTTP 429 em cinco tentativas. Os números de taxa da seção 5 são
   de trechos de busca desse PDF, não de leitura direta. Itens sem confirmação: lista de séries com maker fee,
   multiplicadores por série, exceção do S&P/Nasdaq.
4. https://kalshi.com/market-integrity/kyc-surveillance, /customer-identification, /blocked-traders,
   /regulated-vs-unregulated, https://kalshi.com/policy-center/insider-trading e https://kalshi.com/faq: HTTP 429.
   O conteúdo de KYC só veio de trecho de busca.
5. https://kalshi.com/docs/kalshi-member-agreement.pdf: HTTP 429. A lista de países restritos é só de trecho de busca.
6. Rulebook: https://cdn.robinhood.com/assets/robinhood/legal/KalshiEX_LLC_Rulebook.pdf e
   https://www.cftc.gov/filings/orgrules/rule022123kexdcm002.pdf abriram, mas o texto veio como PDF comprimido
   (FlateDecode) e o resumidor não conseguiu extrair; salvei os binários localmente e a sessão não tem leitor de PDF
   (falta pdftoppm). Regras 5.14, 6.3 e 7.1 vêm só de trechos de busca (seções 3 e 4). Não achei link oficial do
   Rulebook em docs.kalshi.com nem em help.kalshi.com; usei cópias arquivadas na CFTC e na Robinhood.
7. Resumos inúteis do resumidor (página aberta, conteúdo não extraído): api-reference/portfolio/
   get-total-resting-order-value.md e api-reference/communications/confirm-rfq-quote.md. A segunda tem equivalente
   em rfqs.md (confirmação em 30 s).
8. As 5 specs (openapi.yaml, perps_openapi.yaml, perps_scm_openapi.yaml, asyncapi.yaml, perps_asyncapi.yaml): não
   abri. docs.kalshi.com/llms-full.txt e sitemap.xml: não tentei, por ter usado llms.txt como índice.
9. Número exato dos limiares de volume das faixas de API (Expert a Prestige) e das tabelas de taxa do Perps: o
   resumo lido não os traz.
10. Página da lista de jurisdições restritas e limites de posição atuais por mercado: só trechos de busca de 2021
    a 2024; confirmar nos Termos de cada mercado e no Member Agreement.
11. Contradição não resolvida: changelog (settlement bounds já nas respostas) contra settlement_bounds.md (recurso
    ainda não no ar). Entradas de changelog com data de 8 de outubro de 2026 estão de fato na fonte (seção 9).

## O que isto sugere para o nosso produto (INFERÊNCIA, não fato)

- A Kalshi é curada e regulada: só a equipe lista mercados, e usuários apenas sugerem. A promessa de "qualquer
  pessoa cria perguntas" nos diferencia, mas retira o filtro anti-manipulação e legal que a Kalshi afirma aplicar.
- A resolução da Kalshi depende de fonte oficial e de equipe humana, com horas de espera e estado de disputa. A
  nossa leitura on-chain é instantânea e irreversível; isso é vantagem, mas vale limitar mercados a métricas
  que realmente sejam verificáveis on-chain.
- O formato Kalshi tem livro de ordens com maker/taker, saída antes do fim e contrato que paga 1. Num modelo de pote
  (parimutuel) não existe saída antecipada nem preço contínuo; isso é uma troca de produto, não um detalhe.
- A taxa de taker em P x (1 - P) cobra mais em probabilidade 50% e menos nas pontas. O maker pagar zero atrai
  liquidez. Se escolhermos livro, vale pensar em um desenho parecido.
- Os incentivos da Kalshi (juros sobre posições, liquidez por snapshot, indicação com teto e validade curta) mostram
  as ferramentas padrão para seed de liquidez; um token próprio faria o papel dessas recompensas.
- A disputa na Kalshi é decidida por um comitê interno, em até 24 horas (Rulebook, via busca). Um mercado com
  resolução on-chain não precisa de comitê, mas perde a válvula de escape para pergunta mal escrita.
- Limite de posição da Kalshi (25.000 dólares por membro em contratos antigos, via busca) é uma defesa contra
  manipulação; sem KYC, um limite por carteira é fácil de contornar com várias carteiras.
- O Perps mostra que a Kalshi separa produtos com margem do mercado de previsão e exige aprovação, questionário e
  tutorial para o produto alavancado; vale lembrar isso antes de qualquer alavancagem no nosso produto.
- A Kalshi exige KYC, tem lista de países restritos e reporta impostos (1099). Nosso modelo sem KYC fica fora desse
  quadro; as consequências legais e fiscais do nosso caso precisam de análise jurídica própria, não inferível daqui.

## Fontes

Lidas diretamente (WebFetch):
- https://docs.kalshi.com/llms.txt
- https://docs.kalshi.com/welcome/index.md
- https://docs.kalshi.com/getting_started/api_environments.md
- https://docs.kalshi.com/getting_started/demo_env.md
- https://docs.kalshi.com/getting_started/api_keys.md
- https://docs.kalshi.com/sdks/overview.md
- https://docs.kalshi.com/getting_started/quick_start_market_data.md
- https://docs.kalshi.com/getting_started/quick_start_create_order.md
- https://docs.kalshi.com/getting_started/rate_limits.md
- https://docs.kalshi.com/getting_started/pagination.md
- https://docs.kalshi.com/getting_started/orderbook_responses.md
- https://docs.kalshi.com/getting_started/order_direction.md
- https://docs.kalshi.com/getting_started/fixed_point_migration.md
- https://docs.kalshi.com/getting_started/fee_rounding.md
- https://docs.kalshi.com/getting_started/order_groups.md
- https://docs.kalshi.com/getting_started/subaccounts.md
- https://docs.kalshi.com/getting_started/sub_users_vs_subaccounts.md
- https://docs.kalshi.com/getting_started/market_lifecycle.md
- https://docs.kalshi.com/getting_started/market_settlement.md
- https://docs.kalshi.com/getting_started/settlement_bounds.md
- https://docs.kalshi.com/getting_started/historical_data.md
- https://docs.kalshi.com/getting_started/rfqs.md
- https://docs.kalshi.com/getting_started/targets_and_milestones.md
- https://docs.kalshi.com/getting_started/maintenance_and_pauses.md
- https://docs.kalshi.com/getting_started/exchange_sharding.md
- https://docs.kalshi.com/getting_started/terms.md
- https://docs.kalshi.com/changelog/index.md
- https://docs.kalshi.com/websockets.md
- https://docs.kalshi.com/fix/connectivity.md
- https://docs.kalshi.com/fix/market-settlement.md
- https://docs.kalshi.com/margin.md
- https://docs.kalshi.com/api-reference/market/get-market.md
- https://docs.kalshi.com/api-reference/market/get-series.md
- https://docs.kalshi.com/api-reference/events/get-event.md
- https://docs.kalshi.com/api-reference/exchange/get-series-fee-changes.md
- https://docs.kalshi.com/api-reference/incentive-programs/get-incentives.md
- https://docs.kalshi.com/api-reference/multivariate/get-multivariate-event-collection.md
- https://docs.kalshi.com/api-reference/multivariate/create-market-in-multivariate-event-collection.md
- https://docs.kalshi.com/api-reference/orders/create-order-v2.md
- https://docs.kalshi.com/api-reference/portfolio/get-balance.md
- https://docs.kalshi.com/api-reference/portfolio/get-positions.md
- https://docs.kalshi.com/api-reference/portfolio/get-settlements.md
- https://help.kalshi.com/documents-and-taxes/tax-info
- https://help.kalshi.com/en/articles/13823849-what-tax-documentation-does-kalshi-provide
- https://help.kalshi.com/en/articles/13823833-suggesting-a-new-market
- https://help.kalshi.com/markets/markets-101/market-rules
- https://help.kalshi.com/en/articles/13823821-market-faqs
- https://help.kalshi.com/en/articles/13823808-who-are-you-trading-with
- https://help.kalshi.com/en/articles/13823819-how-to-become-a-market-maker-on-kalshi
- https://help.kalshi.com/en/articles/13823818-flip-selling
- https://help.kalshi.com/kalshi-101/what-is-kalshi
- https://help.kalshi.com/kalshi-101/how-does-kalshi-make-money
- https://help.kalshi.com/en/articles/13823805-fees
- https://help.kalshi.com/en/articles/13823847-apy-on-kalshi
- https://help.kalshi.com/en/articles/13823851-liquidity-incentive-program
- https://help.kalshi.com/en/articles/15410219-liquidity-provider-program
- https://help.kalshi.com/en/articles/13823783-kalshi-referral-program-faq
- https://help.kalshi.com/en/articles/13823811-limit-orders
- https://help.kalshi.com/en/articles/13823828-the-orderbook
- https://help.kalshi.com/en/articles/13823844-portfolio-balances-and-positions
- https://help.kalshi.com/en/articles/14026044-can-i-trade-on-kalshi-from-outside-the-united-states
- https://help.kalshi.com/en/articles/13823778-signing-up-as-an-individual
- https://news.kalshi.com/p/selling-early
- https://news.kalshi.com/p/what-is-the-market-life-cycle

Só em trechos de resultado de busca (conteúdo não aberto): fee-schedule.pdf (atualização de 7 de julho de 2026),
help.kalshi.com artigos de depósito e saque (13823795, 13823798, 13823802 a 13823804),
kalshi.com/market-integrity/customer-identification, kalshi.com/docs/kalshi-member-agreement.pdf,
help.kalshi.com/en/articles/13823765-how-is-kalshi-regulated e assets.kalshi.com/regulatory/product-certifications/.
Fontes secundárias citadas só para a exceção 0,035: pm.wiki/learn/kalshi-fees-explained e polykal.net.
Fontes secundárias sobre a revisão de resultado: oddsshopper.com (kalshi-settlement-review-window) e defirate.com.
Cópias do Rulebook citadas só por trecho de busca: www.cftc.gov/filings/orgrules/rule061521kexdcm002.pdf,
cdn.robinhood.com/assets/robinhood/legal/KalshiEX_LLC_Rulebook.pdf.

Segunda rodada, páginas abertas diretamente (todas em https://docs.kalshi.com/, sufixo .md):
- getting_started/: quick_start_authenticated_requests, quick_start_websockets, making_your_first_request
- margin/price-banding
- api-reference/api-keys/: get-api-keys, create-api-key, generate-api-key, delete-api-key
- api-reference/account/: get-account-api-limits, upgrade-account-api-usage-level,
  get-account-api-usage-level-volume-progress, list-non-default-endpoint-costs
- api-reference/portfolio/: intra-account-transfer, get-intra-account-transfers, get-intra-account-transfer,
  create-subaccount, transfer-between-subaccounts, get-all-subaccount-balances, get-subaccount-transfers,
  get-subaccount-netting, update-subaccount-netting, get-deposits, get-withdrawals, get-fills,
  get-total-resting-order-value, get-target-balance-allocation, set-target-balance-allocation
- api-reference/market/: get-markets, get-market-orderbook, get-multiple-market-orderbooks, get-market-candlesticks,
  batch-get-market-candlesticks, get-trades, get-series-list
- api-reference/events/: get-events, get-event-metadata, get-event-candlesticks, get-event-fee-changes,
  get-event-forecast-percentile-history, get-multivariate-events
- api-reference/orders/: get-orders, get-order, batch-create-orders-v2, cancel-order-v2, cancel-all-orders,
  batch-cancel-orders-v2, amend-order-v2, decrease-order-v2, get-queue-positions-for-orders, get-order-queue-position
- api-reference/order-groups/: get-order-groups, create-order-group, get-order-group, delete-order-group,
  reset-order-group, trigger-order-group, update-order-group-limit
- api-reference/communications/: get-communications-id, get-block-trade-proposals, propose-block-trade,
  accept-block-trade-proposal, get-rfqs, create-rfq, get-rfq, delete-rfq, get-rfq-quote, delete-rfq-quote,
  accept-rfq-quote, confirm-rfq-quote, get-quotes, create-quote, get-quote, delete-quote, accept-quote, confirm-quote
- api-reference/exchange/: get-exchange-status, get-exchange-schedule, get-user-data-timestamp
- api-reference/search/: get-tags-for-series-categories, get-filters-for-sports
- api-reference/live-data/: get-live-data, get-live-data-with-type, get-multiple-live-data, get-game-stats,
  get-event-live-data, get-weather-index, get-weather-index-calibrations
- api-reference/milestone/: get-milestone, get-milestones
- api-reference/structured-targets/: get-structured-targets, get-structured-target
- api-reference/multivariate/: get-multivariate-event-collections
- api-reference/fcm/: get-fcm-fills, get-fcm-orders, list-fcm-subtraders, create-fcm-subtrader,
  get/update/delete-fcm-subtrader-event-contract-daily-cap, get/update-fcm-subtrader-blocked-categories,
  get-fcm-positions
- api-reference/historical/: get-historical-cutoff-timestamps, get-historical-market-candlesticks,
  get-historical-fills, get-historical-orders, get-historical-positions, get-historical-trades,
  get-historical-markets, get-historical-market
- cfbenchmarks/rest-passthrough
- websockets/: websocket-connection, connection-keep-alive, orderbook-updates, market-ticker, cfbenchmarks-value,
  cfbenchmarks-value-5hz, pyth-value, public-trades, user-fills, market-positions, market-and-event-lifecycle,
  multivariate-market-and-event-lifecycle, communications, order-group-updates, user-orders
- fix/: common-components, authentication, order-entry, order-groups, market-data, rfq-messages, drop-copy,
  listener-sessions, error-handling, subpenny-pricing
- margin-rest/fcm/: create-margin-fcm-subtrader, get/update/delete-fcm-subtrader-risk-controls,
  update-fcm-notional-risk-limit, delete-fcm-notional-risk-limit
- margin-rest/account/get-perps-account-api-limits; margin-rest/exchange/: get-exchange-status, get-enabled-status
- margin-rest/risk/: get-risk-parameters, get-notional-risk-limit, get-risk
- margin-rest/orders/: get-orders, create-order, cancel-all-orders, get-order, cancel-order, decrease-order, amend-order
- margin-rest/market/: get-markets, get-market, get-market-orderbook, get-market-candlesticks, get-trades
- margin-rest/portfolio/: get-fills, get-positions, get-balance, intra-account-transfer, create-subaccount,
  transfer-between-subaccounts
- margin-rest/fees/: get-fee-tiers, get-fee-tier-rates; margin-rest/funding/: get-funding-history,
  get-historical-funding-rates, get-funding-rate-estimate, get-premium-index
- margin-rest/order-groups/: os 7 (get-order-groups, create, get, delete, reset, trigger, update-order-group-limit)
- margin-rest/exit-triggers/: get/set/cancel-isolated-exit-trigger(s), get-cross-exit-triggers, set-cross-exit-trigger,
  cancel-cross-exit-triggers, update-cross-exit-trigger, cancel-cross-exit-trigger-by-id
- margin-ws/websockets/: websocket-connection, connection-keep-alive, orderbook-updates, market-ticker, public-trades,
  user-fills, user-orders, order-group-updates
- fix-margin/: connectivity, authentication, order-entry, order-groups, market-data, drop-copy, listener-sessions,
  error-handling
Outras: https://help.kalshi.com/en/articles/13823765-how-is-kalshi-regulated, 14679970-what-are-perpetual-futures,
15357656-applying-for-perpetuals-access, 15357594-how-margin-works, 16071417-perps-fees-explained,
16076644-liquidity-and-volume-incentive-programs-where-to-find-them, 13823842-finding-markets,
13823798-bank-deposits, 13823803-bank-withdrawals.
