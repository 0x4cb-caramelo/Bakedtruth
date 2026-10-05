# Regulação de mercados de previsão e apostas com cripto (Onda 1, agente 1C)

Data da pesquisa: 2026-10-04. Isto NÃO é parecer jurídico. Descreve o que fontes dizem; todo ponto é ASSUNTO PARA ADVOGADO.

Limitações desta rodada (leia antes):
- Não consegui ler `plano-das-ondas.md`, `ideacao-perguntas-e-respostas.md` nem os `*-docs.md` (a leitura devolveu só a linha 1). Segui o briefing da tarefa e não apliquei o formato/regra do hook da seção A. Reveja o formato.
- O orçamento de buscas web se esgotou (200/200) antes de cobrir tudo. Itens não cobertos estão em "Não confirmado".
- Várias fontes abaixo são imprensa ou escritórios de advocacia, não o texto oficial. Está marcado em cada linha: [OFICIAL] = página de regulador ou da própria plataforma; [SECUNDÁRIA] = imprensa/escritório.

## 1. Fatos com fonte

### Brasil
- Resolução CMN nº 5.298/2026, em vigor desde 04/05/2026, proíbe oferta e negociação no Brasil de contratos derivativos cujo ativo subjacente seja evento esportivo real, evento virtual de jogos online, ou evento político, eleitoral, social, cultural, de entretenimento ou de qualquer tema que não seja referencial econômico-financeiro. Vale também para derivativos negociados no exterior e ofertados no território nacional. [SECUNDÁRIA: Lefosse https://lefosse.com/noticias/alerta/mercados-preditivos-no-brasil-o-que-muda-com-as-novas-regras-publicadas-pelo-conselho-monetario-nacional-e-pela-secretaria-de-premios-e-apostas/ ; Olhar Digital https://olhardigital.com.br/2026/04/24/pro/banco-central-proibe-mercados-preditivos-no-brasil-para-eventos-nao-economicos/ (aprovada 23/04/2026)]
- Permitido: contratos ligados a indicadores econômico-financeiros (inflação, juros, câmbio, risco de crédito, commodities, ações e ativos de mercados autorizados). A CVM detalhará regras e avaliará o que qualifica como referencial econômico-financeiro. [SECUNDÁRIA: Olhar Digital; Lefosse]
- Nota Técnica SEI nº 2958/2026 da Secretaria de Prêmios e Apostas (Fazenda): plataformas como Polymarket e Kalshi reproduzem elementos essenciais da aposta de quota fixa, o que seria exploração ilícita dessa modalidade (Lei 14.790/2023); recomenda restrição de acesso e bloqueio, com base no art. 17 da lei. [SECUNDÁRIA: Lefosse]
- O governo bloqueou ao menos 27 sites (Polymarket, Kalshi, PredictIt entre eles) via Anatel/provedores. [SECUNDÁRIA: Olhar Digital; Lefosse]
- TSE, Res. 23.735/2024: apostas vinculadas a resultado eleitoral são ilícito eleitoral (citado por Lefosse). [SECUNDÁRIA]
- Polymarket, documentação oficial: Brasil está em "Regulatory-Restricted Jurisdictions (Close-Only)": só fechar posição. Totalmente bloqueados: Irã, Síria, Cuba, Coreia do Norte, Crimeia/Donetsk/Luhansk. [OFICIAL: https://docs.polymarket.com/api-reference/geoblock]
- Motivo do "só fechar posição" para o Brasil: a documentação não declara o motivo. Inferência: coincide com a CMN 5.298 + bloqueio de abril/2026 (ver Inferências).

### Estados Unidos
- 2022: CFTC ordem + acordo com a Polymarket por operar contratos binários de evento fora de bolsa (tratados como swaps) sem registro como DCM/SEF; multa de US$ 1,4 milhão e obrigação de encerrar os mercados não conformes. [SECUNDÁRIA: DLA Piper https://www.dlapiper.com/insights/publications/2022/1/cftc-settles-enforcement-action-against-defi-platform-polymarket ; Polsinelli https://www.polsinelli.com/polsinelli-bitblog/who-would-have-predicted-it-polymarket-settles-for-operating-unregistered-swap-execution-facility]
- 2025: Polymarket comprou a QCEX (QCX LLC e QC Clearing LLC, licenciadas pela CFTC) em julho; CFTC emitiu Ordem de Designação Emendada em 25/11/2025 (DCM com modelo intermediado por FCMs); retorno ao mercado americano em 03/12/2025. [SECUNDÁRIA: Covers https://www.covers.com/industry/cftc-amended-order-gets-polymarket-one-step-closer-to-us-return-nov-25-2025 ; Finance Magnates https://www.financemagnates.com/forex/cftc-expands-polymarkets-designation-to-allow-intermediated-trading-in-us/]
- CFTC: ANPR sobre mercados de previsão publicado no Federal Register em 12/03/2026; proposta de regra (NPRM) publicada em 10/06/2026 alterando a Reg. 40.11 e criando Apêndice F à Parte 40 (comentários até 27/07/2026). [SECUNDÁRIA: JD Supra/Dechert/Seward & Kissel, via busca]
- Estados: ao menos 11 estados enviaram cease-and-desist; ações contra a Kalshi em Massachusetts, Nevada, Arizona e Michigan; em abril/2026 o Terceiro Circuito confirmou liminar impedindo Nova Jersey de aplicar lei de apostas à Kalshi (contratos esportivos = swaps, preempção federal). Litígio segue em vários estados. [SECUNDÁRIA: SBC Americas https://sbcamericas.com/2026/04/06/kalshi-appeals-court-new-jersey/ ; pm.wiki]
- Tennessee e Connecticut contestaram a Polymarket (citado em resultado de busca; sem fonte primária). [SECUNDÁRIA, fraca]

### União Europeia e outros
- França: ANJ ordenou bloqueio por provedores do site da Polymarket em 16-17/07/2026, como serviço de jogo ilegal; cita falta de KYC, geoblocking contornado, 578.751 visitas em junho/2026, apostas de clima suspeitas; publicidade a jogo ilegal tem pena penal de 100 mil euros. A nota lista Alemanha, Bélgica, Romênia, Suíça, Polônia, Países Baixos, Grécia, Itália e Portugal como tendo restringido/bloqueado mercados de previsão. O texto da página não menciona cripto. [OFICIAL: https://anj.fr/promotion-illegal-gambling-services-blocking-polymarket-website]
- Bélgica (jan/2025, após 3 avisos sem resposta) e Polônia (registro de sites proibidos, jan/2025); Portugal (SRIJ, jan/2026, ordem de 48h); Itália (acesso encerrado a partir de 27/07, ano não confirmado por mim). [SECUNDÁRIA: KuCoin News, SBC News, Il Sole 24 Ore, via busca]
- MiCA (Reg. UE 2023/1114) aplica-se integralmente desde 30/12/2024: oferta pública e admissão à negociação de cripto-ativos e prestadores de serviços. [SECUNDÁRIA: Parlamento Europeu/Legislative Observatory https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1747059]. A aplicação a tokens meme/de arrecadação não foi verificada.

### Jurisdições offshore
- Curaçao (reforma LOK 2024): exige programa AML alinhado ao FATF, com abordagem baseada em risco; espera-se triagem de carteiras e origem de fundos. Anjouan: AML manual e MLRO, entidade local, diretor residente, capital mínimo de US$ 50 mil; limiares de KYC ficam por conta do operador. [SECUNDÁRIA: track360.io e sourcecodelab.co, blogs comerciais de licenciamento, fonte fraca]
- Panamá, Ilhas Virgens Britânicas, Dubai: não pesquisados.

### Tokens: recompra e queima
- Staff da SEC (Division of Corporation Finance), FAQ de cripto atualizado: anunciar recompra de token "não equivale a promessa de esforços gerenciais essenciais" (Howey) em rede funcional; rede ainda não operacional que promove recompra como rendimento pode continuar sujeita à lei de valores mobiliários; alívio só se não houver "parte central" com controle operacional, econômico ou de voto. Data reportada: 27/09/2026 (a matéria diz "sexta-feira", mas 27/09/2026 é domingo: data a conferir). [SECUNDÁRIA: Decrypt https://decrypt.co/379412/morning-minute-sec-clears-token-buybacks-for-crypto-networks?amp=1 ; Unchained]
- Caso Munchee (SEC, 2017): venda de token de "utilidade" tratada como valor mobiliário. [SECUNDÁRIA: Crowdfund Insider; decisão original da SEC não lida]

### Tornado Cash
- 5º Circuito, Van Loon v. Treasury (26/11/2024): contratos inteligentes imutáveis não são "propriedade" sob a IEEPA; OFAC excedeu autoridade. OFAC retirou o Tornado Cash da lista SDN em 21/03/2025. Roman Storm foi condenado em 06/08/2025 por conspiração para operar transmissão de dinheiro sem licença; júri não decidiu os outros dois crimes (lavagem e sanções). Semenov permanece na SDN. [SECUNDÁRIA: CoinDesk https://www.coindesk.com/policy/2025/04/05/why-ofac-delisted-tornado-cash ; Steptoe https://www.steptoe.com/en/news-publications/international-compliance-blog/treasury-department-delists-tornado-cash-following-the-fifth-circuits-decision.html]

### Brasil, depois da pesquisa: a proibição da aposta de quota fixa

- **Medida Provisória nº 1.394, de 25 de setembro de 2026** (acrescentado em 5/10/2026; lida no Planalto,
  https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1394.htm). Ementa: "Proíbe a exploração, a oferta,
  a intermediação e a publicidade de loterias de apostas de quota fixa no território nacional, institui o Comitê
  Interinstitucional de Fiscalização da Exploração e da Publicidade Ilegal de Apostas de Quota Fixa, e altera a Lei
  nº 14.790, de 29 de dezembro de 2023."
  - Art. 1º: proíbe exploração, oferta, intermediação e publicidade, "inclusive quando realizadas por agente sediado
    no exterior que as ofereça a pessoa localizada no território nacional". O § 1º diz que a proibição "abrange as
    apostas sobre eventos reais de temática esportiva e sobre eventos virtuais de jogos on-line".
  - Art. 3º, I: aposta de quota fixa é o "ato por meio do qual se coloca determinado valor em risco na expectativa
    de obtenção de prêmio cujo montante é definido por fator de multiplicação".
  - Arts. 4º e 6º: as autorizações existentes se extinguem em trinta dias; vedadas novas.
  - Art. 14: instituições financeiras e de pagamento não podem processar transações destinadas a essas apostas.
  - Art. 16: vedada a publicidade, inclusive "todo conteúdo que oferte, promova, divulgue ou facilite o acesso",
    direcionado ao público brasileiro.
  - Arts. 19 a 22: dever de cuidado de provedores e lojas de aplicativos; multa de até 10% do faturamento do grupo
    no país, limitada a R$ 50 milhões por infração.
  - Art. 23: bloqueio de sites a pedido da Fazenda e da Justiça, com a Anatel distribuindo as ordens.
  - Art. 28: perdimento, em processo administrativo, dos valores em contas bloqueadas de operador irregular.
  - Art. 29: revoga o Capítulo V da Lei 13.756/2018 e, da Lei 14.790/2023, os arts. 1º a 21, 22 a 24, 25 a 40, 43 a
    48 e 54. Art. 30: em vigor na data da publicação.
  - **Não conferido:** a tramitação no Congresso (conversão, alteração ou perda de validade) e o Decreto nº 13.128,
    de 2026, que a página cita com "Vide".

## 2. Inferências (minhas, a validar)
- A CMN 5.298 alcança "derivativos"; perguntas sobre fatos on-chain de cripto (ex.: preço, contagem de endereços) podem ou não ser "referencial econômico-financeiro". A CVM decidirá o enquadramento. Um pote por pergunta sobre fato on-chain não nomeado na norma fica numa zona cinzenta. ASSUNTO PARA ADVOGADO.
- A Nota SPA 2958 trata mercado de previsão como aposta de quota fixa; um pote com dinheiro real e pergunta de resultado incerto pode ser lido do mesmo modo, mesmo sem ser exchange. ADVOGADO.
- O "só fechar posição" do Brasil na Polymarket é provavelmente reação à CMN 5.298/bloqueio de abril/2026 (cronologia compatível). Não há declaração oficial da Polymarket do motivo.
- Padrão europeu: reguladores de jogo (não de valores mobiliários) lideram, e citam ausência de KYC como agravante.
- Equipe brasileira + patrocinador anônimo + sem KYC: o ônus de AML recai sobre quem opera; padrão de licenças offshore (fontes fracas) pede AML/KYC mesmo com cripto.

## 3. Premissas
- A Baked Market seria operada por brasileiros; nenhuma entidade foi escolhida.
- Pergunta sobre fato on-chain de cripto, só carteira, USDC, sem identificação.

## 4. Não confirmado em fonte oficial / perguntas abertas
1. Texto oficial da Resolução CMN 5.298/2026 e da Nota Técnica SEI 2958/2026 (só li escritório e imprensa). Pedir links do bcb.gov.br e gov.br/fazenda.
2. Se a CVM já se manifestou sobre pergunta on-chain de cripto como "referencial econômico-financeiro".
3. Lei 14.478/2022 e normas do BC para prestadoras de ativos virtuais (Res. BCB 519/520/521 de 2025): busca não executada (orçamento esgotado). Aplicabilidade a um pote de USDC não analisada.
4. Linha oficial da Polymarket sobre o motivo do Brasil.
5. Texto oficial da Ordem CFTC 2022 e da Ordem Emendada 2025 (li só resumos); ações oficiais de cada estado.
6. Panamá, Ilhas Virgens Britânicas, Dubai, Reino Unido (UKGC) e ordens da Bélgica/Polônia/Itália em fonte primária.
7. Países bloqueados e método (site vs termos) de plataformas sem KYC fora Polymarket/Kalshi: não pesquisado.
8. Tokens: nenhum caso sobre repasse de receita a detentores com decisão primária; pump.fun e venda privada com recompra/queima não analisados; MiCA para esses tokens não verificado.
9. Ações contra plataformas cripto sem identificação (ex.: casos OFAC/FinCEN/DOJ) não pesquisadas.
10. Data exata da FAQ da SEC (dia da semana inconsistente).
