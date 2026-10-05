# Onda 3, agente 3A: ficha de consistência do coordenador

Data: 4 de outubro de 2026.

Papel deste arquivo: consolidar as Ondas 1 e 2, resolver as contradições entre os relatórios, fixar os números e as
definições que o Business Plan (BP) vai usar e dizer aos três redatores (3B, 3C e 3D) o que escrever em cada capítulo.
Os redatores não vão poder perguntar nada: o que não estiver aqui, eles não usam.

**A regra que governa o BP.** O fundador pediu "um BP de pelo menos 35 páginas", detalhando o projeto com o que ele
buscou e quer que vire. A espinha do documento é a visão dele. As decisões dele entram como decisões. Onde o red team
discorda, a discordância entra como objeção registrada, com a evidência e a alternativa, sem substituir a decisão.
Nenhum risco achado pelas ondas fica de fora.

Como ler:

- **FATO**: fonte primária (documentação oficial, página de regulador, texto de lei, dado lido direto na rede, arquivo
  do repositório).
- **FATO SECUNDÁRIO**: imprensa, agregador, rastreador de dados, blog, escritório de advocacia, estimativa de terceiro.
- **INFERÊNCIA**: conta ou raciocínio dos agentes ou meu. Inclui toda projeção e toda premissa sem dado (marcada
  "premissa sem dado").
- **[A confirmar]**: ninguém conseguiu verificar; o BP repete essa marca ao lado do número ou da frase.
- Códigos: `D-nn` decisão do fundador; `K-nn` contradição resolvida; `N-xx-nn` número canônico; `OBJ-nn` objeção
  registrada; `AC-nn` ponto a confirmar; `R-nn` risco.
- Nomes dos arquivos, abreviados: `ideacao` = `docs/business/ideacao-perguntas-e-respostas.md`; `briefing` =
  `docs/business/BRIEFING-MERCADO-DE-POTE.md`; `1A` = `competitor-longlist.md`; `1B` = `market-research.md`; `1C` =
  `regulacao.md`; `1D` = `publico-web3.md`; `1E` = `top-5-competitor-analysis.md`; `1F` =
  `monetizacao-e-tesouraria.md`; `1G` = `dois-tokens-e-ico-privado.md`; `1H` =
  `saida-fechamento-cron-e-perguntas.md`; `2A` = `wave-2-devils-advocate.md`; `2B` = `wave-2-business-finance.md`;
  `2C` = `wave-2-technical-security.md`; `2D` = `wave-2-compliance.md`; `2E` = `wave-2-modelo-financeiro.md`; `2F` =
  `wave-2-viabilidade-mvp.md`. Caminhos completos na seção "Fontes".

Método e limites: li por inteiro os dezesseis arquivos acima, o plano das ondas, e quatro arquivos de apoio
(`receita-mercados-de-previsao.md`, `patrocinio-e-destaque-pago.md`, `pesquisa-nome-do-site.md` e partes de
`modelos-de-token.md` e de `privacidade-entre-redes-e-x.md`). Não houve pesquisa na web. Refiz à mão as contas que
copiei (lista na seção 4.14). Nenhum número novo foi criado, salvo somas e divisões sobre números das ondas, marcadas
como INFERÊNCIA minha.

## Resumo em dez linhas

1. As ondas responderam sete das oito perguntas em aberto da ideação. A que resta, o sentido do "70/30", só o fundador
   responde; o BP mostra os dois sentidos em toda conta.
2. O que ninguém conseguiu mostrar: que existe demanda por apostar em fatos lidos on-chain. É a objeção número um.
3. Volumes de Polymarket e Kalshi: os números "contraditórios" medem a mesma coisa em duas réguas. O BP usa dólares
   pagos (Kalshi cerca de US$ 13,5 bi e Polymarket cerca de US$ 4,6 bi em setembro de 2026) e cita o valor de face ao
   lado.
4. Taxa efetiva do setor: de 1,9% a 5% dos dólares pagos. O "cerca de 1%" de `1B` era sobre valor de face e sai.
5. Melee não opera com dinheiro real (beta em rede de teste, fonte secundária, a confirmar). Os volumes do site dele
   são ilustração de tela e não entram no BP.
6. Número central das finanças: de cada US$ 100 apostados, US$ 0,64 paga a operação (0,75 sem saída antecipada).
   Equilíbrio: US$ 471 mil, 1,57 milhão ou 3,92 milhões apostados por mês, conforme o nível de custo.
7. Três cenários fixados (modelo de `2E`): US$ 45 mil, 300 mil e 1,5 milhão apostados no mês 12. O ruim não se paga.
   Capital com reserva: US$ 70 a 136 mil, dos quais US$ 51,5 mil antes do lançamento.
8. Vinte e nove objeções registradas; doze de severidade crítica (seção 6).
9. Regulação: o agente 2D leu na fonte a Resolução CMN 5.298 e a Nota Técnica 2958 e achou a Medida Provisória 1.394,
   de 25/9/2026. A MP não foi verificada pelo agente principal: entra no BP como "a confirmar".
10. O BP tem três partes, com alvo de 7.200, 7.600 e 7.700 palavras (22.500 no total). O roteiro por capítulo, com
    seções numeradas para as remissões, está na seção 8.

---

## 1. Veredito de completude

### 1.1 As oito perguntas que a ideação mandou as ondas atacarem (`ideacao`, seção 7)

| # | Pergunta | Respondida? | Onde | O que ficou |
|---|---|---|---|---|
| 1 | Qual parte do patrocínio é da banca e qual é da pool (o "70/30") | Não. É decisão do fundador | `1F` seção 4; `2B` seção 4; `2E` em toda tabela | As ondas calcularam os dois sentidos e recomendam 30% banca e 70% pote. Segue em aberto |
| 2 | Regra de fechamento para perguntas de mais de dois ou três meses | Sim, com duas propostas que se contradizem | `1H` seção 2.3; `2C` E4; `2F` fase 1 | `1H` propõe dois marcos (T1 e T2). `2C` e `2F` propõem um fechamento só e perguntas de até 30 dias no MVP. Ver K-16 |
| 3 | Como funciona a saída antecipada com penalidade sem esvaziar o prêmio | Sim, no papel | `1H` seção 1; `2C` seção 2 | Fórmula proposta e seis furos achados. A simulação com apostadores estratégicos não foi feita |
| 4 | Quais tipos de pergunta abrem no primeiro dia, em linguagem simples | Sim | `1H` seção 4; `2C` seções 1 e 14; `2F` seção 9 | Cardápio proposto; falta o aval do fundador |
| 5 | Outras formas de monetização além dos 3% | Sim | `1F` seções 1 e 2 | Doze formas; só taxa e patrocínio têm número |
| 6 | O que é o fundo de prêmios e como ele se paga | Sim | `1F` seção 5; `2B` seção 5; `2E` seção 6 | Regra de medição com três sinais; nenhuma plataforma publicou o retorno |
| 7 | O desenho dos dois tokens e a ordem de lançamento | Sim, como proposta | `1G` seção 6; objeções em `2A`, `2B`, `2D`, `2F` | Distribuição, travas e cronograma propostos; jurisdição e parecer faltando |
| 8 | O que significa operar sem KYC, com patrocinador anônimo e dinheiro real | Sim, como descrição das regras | `1C`; `2D` | O que as regras dizem está levantado. O que elas permitem é ponto para advogado |

### 1.2 O que mais as ondas responderam

- Lista de 20 concorrentes e análise dos 5 principais (`1A`, `1E`).
- Tamanho do mercado nas duas réguas e tamanho real em Solana (`1B`, `1E`).
- Público web3 e do pump.fun em números; perfis só como hipótese (`1D`).
- Faixas de patrocínio contra preços de anúncio praticados (`1F`).
- Tesouraria em Bitcoin: precedentes e formas de guardar (`1F`).
- Cron de resolução: opções em Solana, riscos e arquitetura (`1H`, `2C`).
- Modelo financeiro com três cenários, dois regimes e sensibilidades (`2E`).
- Inventário do código, cinco fases, doze sprints (`2F`).
- Trinta requisitos mínimos de segurança antes da rede principal (`2C`, seção 13).
- Mapa de exposição regulatória com dezoito linhas e perguntas para advogado (`2D`).

### 1.3 O que ficou sem resposta (vai ao capítulo 16 do BP)

| # | Lacuna | Por quê | Quem resolve |
|---|---|---|---|
| 1 | Existe demanda por apostas em fatos lidos on-chain? | Nenhum mercado desse tipo foi achado em nenhuma plataforma; nenhuma entrevista | Teste de demanda (OBJ-01) |
| 2 | Quanto cada carteira aposta por mês, e com que frequência | "Não achei" em todas as fontes | Entrevistas ou beta |
| 3 | A fórmula da saída aguenta apostadores estratégicos? | A simulação em código não foi feita (regra do ambiente) | Simulação e revisão externa |
| 4 | Sentido do "70/30" e destino da parte da banca no patrocínio | Decisão do fundador | Fundador |
| 5 | Tabela completa do pote de um lado só (prêmio neutro, penalidades) | Ninguém decidiu | Fundador |
| 6 | Enquadramento legal do pote no Brasil; jurisdição; países bloqueados | Ponto para advogado | Advogado |
| 7 | Cotações reais de auditoria, empresa e parecer | Só faixas de blogs de fornecedores | Três cotações |
| 8 | Posição do sócio técnico: seis perguntas do briefing, prazo, dedicação, acordo | Sem resposta registrada | Fundador e Ronaldo |
| 9 | Quem guarda a chave de atualização do programa; terceira chave do multisig | Não encontrado | Fundador e Ronaldo |
| 10 | Tamanho da equipe e quem abre perguntas, quantas por semana | Não encontrado em nenhum documento | Fundador |
| 11 | Melee: taxa, data da rede principal, token | Dados só de fontes secundárias | Conferir |
| 12 | Preços oficiais de destaque (DexScreener Boosts, CoinGecko, CoinMarketCap) | Só revendedores e agregadores | Conferir |
| 13 | Situação da Medida Provisória 1.394 (vigência, conversão) | Lida só pelo agente 2D | Advogado |
| 14 | Holder Rewards ligado? Token de teste antes? Nome no singular? | Perguntas da rodada 5 sem resposta | Fundador |
| 15 | Um patrocinador real disposto a assinar carta de intenção | Nenhuma conversa registrada | Fundador |

### 1.4 Veredito

A base é suficiente para escrever o BP v0.0.1 com a visão do fundador como espinha, desde que: (a) a demanda apareça
como hipótese a testar, não como premissa; (b) o "70/30" apareça nos dois sentidos; (c) toda projeção leve a etiqueta
INFERÊNCIA e a tabela de premissas; (d) regulação seja descrita, nunca concluída. Nenhum capítulo fica sem material.

---

## 2. Tabela de decisões do fundador

Fonte: `ideacao`, seção 1 (estado consolidado) e rodadas. Trechos entre aspas são palavras dele. Estado: **decidido**,
**ambíguo** (ele disse algo que admite duas leituras) ou **em aberto** (ele não decidiu ou pediu ajuda).

O redator apresenta as linhas "decidido" como decisão, com a citação quando houver. Linhas "ambíguo" e "em aberto"
vão ao capítulo 16 e, no capítulo de origem, aparecem com as opções.

| ID | Tema | Decisão, nas palavras dele quando há citação | Estado |
|---|---|---|---|
| D-01 | Natureza do produto | "ele foi montado errado, não é essa a proposta dele ... queremos que seja um mercado de previsão". O modelo do código (patrocinador vende YES com desconto) não é a proposta | Decidido |
| D-02 | Mecanismo | Uma pool (pote) por pergunta; apostas em SIM ou NÃO; quem acerta divide o pote; sem preço garantido na compra, sem limite de compra. "Sem preço travado, vamos trabalhar com o que é 'normal' do mercado, e pensar em um ou dois diferenciais" | Decidido |
| D-03 | Registro da aposta | Sem tokens de SIM e NÃO: "o que precisamos fazer é o registro do voto por dinheiro comprado por cada votante, e apenas isso" | Decidido |
| D-04 | Três trilhas de dinheiro | A mesma pool recebe dinheiro por três trilhas: (a) as apostas; (b) o patrocinador; (c) o token | Decidido |
| D-05 | Moeda | "A moeda vai ser usdc, vamos abandonar a ideia de sol." | Decidido |
| D-06 | Rendimento do pote | "esquece o rendimento do pote, vamos abandonar isso, não serve de nada." | Decidido |
| D-07 | Pote de um lado só | Devolve cobrando taxa. "A banca nunca perde, e nem a igreja faz caridade sem cobrar." | Decidido. Casos-limite (prêmio neutro, penalidades) em aberto |
| D-08 | Saída antes da resolução | "saída antes da resolução, vamos fazer agora no mvp." Forma: "a pessoa pode sair antes com ganho proporcional menor, ou perca proporcional maior, deixando uma penalidade pro pote." | Decidido. Fórmula e parâmetros em aberto |
| D-09 | Fechamento das apostas | Padrão de 80% da duração, com mínimo de 24 horas; menos de 24 horas só como "opção avançada", "com um double cheque para confirmar e log da operação de quem aprovou" | Decidido |
| D-10 | Fechamento em perguntas longas | "ainda temos que pensar para acima de 2-3 meses se 80% não é muito longo, e pode ser gradual." | Em aberto |
| D-11 | Dois ciclos de pergunta | Primeiro: a equipe monta as perguntas ("vamos deixar que a equipe abra as perguntas"). Segundo: o patrocinador pede uma pergunta, com o pagamento travado até a equipe aceitar ou recusar; "se for recusado devolve a grana travada" | Decidido |
| D-12 | Sugestões do público | Pelo X. Página com "um monitor vindo do X, e orientação da galera como eles podem fazer para fazer as sugestões" | Decidido |
| D-13 | Resolução | Só por dado on-chain. "eu quero trabalhar com oráculo, mas um que possa resolver onchain, diferente das questões abertas de geopolítica que depende um oráculo que claramente pode ser manipulado" | Decidido |
| D-14 | Resolução antes da data | "Se acontecer algo antes da data marcada, ela pode sim se resolver." | Decidido |
| D-15 | Acionamento da resolução | "talvez a gente resolva com um sistema cron pela nossa plataforma, acionando o resolver." | Decidido como direção; o desenho está em aberto |
| D-16 | Tipos de pergunta do primeiro dia | "não tenho a menor ideia e você vai me ajudar a decidir". Sobre a explicação técnica: "não entendi nada. foda-se" | Em aberto. Reapresentar em linguagem simples |
| D-17 | Preço de token pequeno como pergunta | Ele questionou a restrição: "Por que ficaria? Com base no quê" | Em aberto |
| D-18 | Faixas de patrocínio | Três faixas: 500, 1.500 e 5.000 dólares | Decidido |
| D-19 | Divisão do valor do patrocínio | "70/30 dessa grana vai pra banca e a outra parte pra liquidez como neutra ou aposta de patrocinador" | Ambíguo: não ficou dito se 70% é da banca ou da pool |
| D-20 | Onde o patrocinador entra | Pode pedir pergunta ou entrar numa pergunta já aberta pela equipe | Decidido |
| D-21 | Formas do patrocínio | Duas, à escolha dele: prêmio neutro (soma ao pote sem lado) ou aposta de patrocinador (num lado) | Decidido |
| D-22 | Patrocinador anônimo | Pode ficar anônimo, usando o Cloak para esconder o pagador. "o patrocinador anônimo pode escolher uma das duas formas, sim." | Decidido |
| D-23 | Quem controla o resultado pode apostar? | "Sim e não." Esclarecido: "O sim e o não é a resposta à pergunta que foi criada e diz respeito a n empresa ... sobre qualquer coisa que seja verificável onchain." Quem coloca prêmio pode apostar? "Sim." | Decidido: não há proibição |
| D-24 | Contrapartidas do patrocinador | Selo, destaque, posição fixa, pote mínimo garantido, texto na pergunta, publicação no X: "são aceitáveis" | Decidido. Prazos e quantidades em aberto |
| D-25 | Curadoria da página inicial | "a curadoria pode ser por situação de destaque e/ou pump de marketing via sponsor" | Decidido |
| D-26 | Taxa | 3% do pote. "receita dos 3%, sim." Critério dito antes: "vamos trabalhar dentro das taxas de mercado, nem maior, nem menor." | Decidido |
| D-27 | Destino da taxa | "25% para um treasure btc da empresa, 25% para operação (não deve ser todo o custo que foi estimado), 25% recompra e queima do nosso token em ico privado e, 25% para fundo de prêmios" | Decidido |
| D-28 | Outras formas de receita; o que é o fundo de prêmios | "essas empresas não tem outras formas de monetização, não?"; o fundo, "que ainda não foi dito o que seria esse fundo, e pra que serve" | Em aberto: as ondas responderam, falta o aval dele |
| D-29 | Dois tokens | Um no pump.fun: "é expeculativo, e vamos usar para pumpar mesmo e tudo bem". Outro em "ico privado mais robusto": "aí a gente tem liberdade para desenhar ele". A recompra e queima é do token do ICO privado | Decidido |
| D-30 | Ordem dos tokens | "começar pelo pump.fun para servir de marketing pra nossa plataforma e depois pensarmos um ICO privado mais robusto." | Decidido |
| D-31 | 30% das compras do token para as pools | "isso só vamos conseguir fazer com base em nosso próprio token ico privado" | Decidido quanto a qual token; como fazer está em aberto |
| D-32 | Objetivo do token | Dito antes: "subir preço e entregar dividendo aos holders" | Ambíguo: a divisão da taxa (D-27) não tem parcela de dividendo |
| D-33 | Holder Rewards do pump.fun; token de teste antes | Sem resposta | Em aberto |
| D-34 | Público | "queremos pessoal da web3." | Decidido |
| D-35 | Acesso | "100% onchain da solana, via wallet, sem kyc" | Decidido |
| D-36 | Bloqueios geográficos | "deixar para fazermos a implementação dos bloqueios ao final". Bloquear Brasil e EUA? "Por enquanto não, e ainda não sabemos." | Decidido adiar; quais países está em aberto |
| D-37 | Dinheiro real | "a plataforma é uma empresa em construção com deploy a ser feita na mainnet" | Decidido |
| D-38 | Concorrentes | "qualquer empresa de mercado de predição é concorrente direto" | Decidido |
| D-39 | Nome, mascote, layout | "Baked Market, já temos mascote, inclusive." Mascote: Baked. Layout: Ledger² no escuro, com tema claro (direção N aprovada) | Decidido. "Market" no singular: sem resposta; o BP usa o singular |
| D-40 | Outras redes e privacidade | Pagamento de outras redes: SODAX ("o nome da empresa é sodax - https://www.sodax.com"). Privacidade: Cloak | Decidido |
| D-41 | Hackathon, divisão com o Ronaldo, jurisdição | "esquece isso, não precisa para agora."; "por enquanto é irrelevante, eu te aviso o que fazer." | Decidido adiar |
| D-42 | Quem cria ganha parte da taxa | "acho justo que quem criar possa ganhar uma parte da pergunta." | Em aberto (hoje a equipe cria) |
| D-43 | Metas de 90 dias | "você mesmo pode nos dizer ... o que seriam metas ruins, razoáveis e otimistas." | Delegado às ondas; proposta em N-FM (seção 4.9) |

Três avisos para os redatores:

1. O `briefing` é anterior à rodada 5 e está superado em três pontos: diz que a saída fica para a fase 2 (vale D-08),
   mostra a taxa dividida em 50/25/25 (vale D-27) e propõe rendimento do pote em SOL (vale D-06). Não copiar essas
   partes.
2. O `CLAUDE.md` e o `docs/product/DESIGN-DIRECTION.md` ainda descrevem a direção visual C ("Tape"). Vale D-39
   (Ledger² com tema claro). O BP diz só o que está em D-39 e registra que o documento de design precisa ser reescrito.
3. D-23 não está escrita na seção 1 da ideação; vem das rodadas 2 e 3. É a decisão que a OBJ-02 ataca.

---

## 3. Contradições resolvidas

Para cada contradição: o que cada relatório diz, qual número vale, por quê, e como citar no BP. Onde a contradição é
entre uma decisão do fundador e uma proposta de agente, vale a decisão, e a proposta vira objeção (seção 6).

### 3.1 Mercado e concorrentes

**K-01. Volumes de Polymarket e Kalshi: valor de face contra dólares pagos.**

- O que diverge: `1A` traz Kalshi com US$ 64,2 bi em 30 dias e, em outra linha, US$ 1,3 bi "no mês"; Polymarket com
  US$ 10,3 bi em abril de 2026 e US$ 773 mi "até meados de setembro". `1B` traz Kalshi com US$ 29,2 bi em junho de
  2026 e US$ 15,8 bi numa semana, e Polymarket com US$ 10,5 bi e US$ 8,9 bi por mês.
- Resolução (`1E`, seção 6.2): são duas réguas. **Valor de face** soma cada contrato a US$ 1. **Dólares pagos** soma
  o que foi desembolsado. De 4/set a 3/out/2026 o setor somou US$ 81,8 bi em valor de face e US$ 21,7 bi em dólares
  pagos, média de US$ 0,27 por contrato. Os números de US$ 1,3 bi e US$ 773 mi são de um artigo de setembro de 2025.
  Os números da Sacra e da The Block para a Polymarket são cerca do dobro dos do DefiLlama porque contam cada
  negócio duas vezes (Paradigm, dez/2025).
- **Vale:** setembro de 2026, em dólares pagos: Kalshi cerca de US$ 13,5 bi e Polymarket cerca de US$ 4,6 bi
  (US$ 4,63 bi). Em valor de face, 30 dias até 3/out/2026: Kalshi cerca de US$ 64 bi e Polymarket cerca de US$ 14 bi
  (dois braços: 4,7 + 9,5).
- Por quê: o pote do Baked Market mede dinheiro depositado. Só "dólares pagos" é comparável.
- Como citar: sempre as duas colunas, com a régua no cabeçalho; comparar o Baked Market só com dólares pagos.
  Etiqueta FATO SECUNDÁRIO (DefiLlama e DefiRate, via `1E`). Para a Kalshi, acrescentar: "o DefiLlama não declara o
  método; a leitura 'dólares pagos' é inferência do agente 1E" [A confirmar, AC-05].
- **Não usar:** Kalshi US$ 29,2 bi e US$ 15,8 bi; Polymarket US$ 10,3 bi, 10,5 bi, 8,9 bi e 12,9 bi; US$ 1,3 bi e
  US$ 773 mi; as faixas (a), (b), (c) e (d) da seção 5 de `1B`.

**K-02. Taxa efetiva do setor.**

- O que diverge: `1B` calcula "take rate ~1%" (receita anualizada sobre volume em valor de face). `1F`, na tabela da
  seção 1, traz "Kalshi ~1,2% a 1,5% do volume; Polymarket ~0,67%". `1E` mede sobre dólares pagos: Polymarket 2,0%,
  Limitless 1,9%, World (Phantom) de 2,5% a 5% do valor pago, mais a margem do formador de mercado.
- **Vale:** "medida em dólares pagos, a taxa efetiva do setor fica entre 1,9% e 5%". Complemento: a Kalshi arrecadou
  US$ 263,5 mi sobre US$ 22,88 bi negociados em 2025, 1,15% (FATO SECUNDÁRIO, BJ21, via `1F`); a base desse volume não
  é declarada.
- Por quê: a taxa do Baked Market incide sobre dinheiro depositado.
- Como citar: "os 3% do pote ficam dentro da faixa do setor em potes equilibrados" (INFERÊNCIA de `1E`), sempre junto
  da ressalva da OBJ-07 (em pote desequilibrado, 3% do pote pesa muito mais).
- **Não usar:** "cerca de 1%" e "Polymarket ~0,67%".

**K-03. Melee opera com dinheiro real?**

- O que diverge: `1A` e a pesquisa anterior (`mercados-de-previsao-web3.md`) citam volumes do site do Melee (mercado
  com "15.87M volume", "Creator earnings $317,375") como escala. `1E` mostra que são ilustração de tela da página de
  entrada e que o beta roda em rede de teste, "no real money at risk".
- **Vale:** até 4/out/2026 não há prova de volume com dinheiro real no Melee; ele não aparece no DefiLlama.
- Como citar: "o Melee, o concorrente mais parecido, ainda não opera com dinheiro real (FATO SECUNDÁRIO: fio de
  usuário republicado pela KuCoin em 9/set/2026; não é comunicado oficial) [A confirmar, AC-04]". O que é firme:
  US$ 3,5 mi captados em set/2025 (FATO SECUNDÁRIO) e 49.247 pessoas na fila (FATO, site).
- **Não usar:** nenhum volume, número de traders ou ganho de criador do site do Melee.

**K-04. A taxa da Limitless.**

- O que diverge: `receita-mercados-de-previsao.md` diz "taxa que cresce perto da resolução, de 0,03% até 3%" (fonte
  secundária). `1H` e `1E` leram a documentação oficial: a taxa depende do **preço**, não do tempo.
- **Vale:** AMM 0,40% fixa; no livro de ordens, compra de 0,40% a 3,00% (3,00% até 50 centavos, caindo até 0,40%
  perto de 1 dólar) e venda de 0,42% a 1,50% (máximo em 50 centavos); só paga quem toma liquidez. Taxa efetiva em 30
  dias: 1,9% (US$ 186,8 mil sobre US$ 9,88 mi). FATO (documentação) e INFERÊNCIA (a efetiva).
- Consequência: "taxa que sobe com o tempo, em produto real" não foi encontrada. O BP não cita a Limitless como
  precedente disso.

**K-05. PNP Protocol: é um projeto só? Está ativo?**

- O que diverge: `1A` deixou em aberto se pnp.exchange e pnp.fun são o mesmo projeto e não achou escala.
- Resolução (`1E`, seção 6.1): é o mesmo projeto (a página do token aponta os dois endereços). Está quase parado.
- **Vale:** 206 transações no programa principal entre 16/mar e 17/set/2026, nenhuma depois (FATO, leitura da rede em
  4/out/2026; ressalva: pode haver outros programas não medidos). Token PNP: valor de mercado de US$ 108.661,
  liquidez de US$ 31.219 e US$ 258 negociados em 24 horas em 4/out/2026 (FATO SECUNDÁRIO, DexScreener); queda de
  cerca de 93% em 13 meses (INFERÊNCIA). Taxa de 1% por negociação, 30% dela para o criador (FATO, documentação). O
  site anuncia outro produto ("A coin that trades Polymarket").
- Como citar: referência de ideias (criador com 30% da taxa, resolução por modelo de linguagem como contraexemplo),
  não rival por usuários.

**K-06. Programa de indicação da Polymarket.**

- `1D`: 30% das taxas dos indicados diretos e 10% dos indiretos, por 180 dias. `1E`: 10% e 5%. `1F`: 10% e 5%,
  durante os primeiros 30 dias do indicado, e só para quem já negociou US$ 10.000.
- **Vale:** 10% da taxa líquida dos indicados diretos e 5% dos indiretos, por 30 dias, com exigência de US$ 10.000
  negociados (FATO, documentação e central de ajuda, via `1F`). Dois agentes concordam; `1D` leu um resumo só.

**K-07. Rótulo dos dados do DefiLlama, do DefiRate e do DexScreener.**

- `1E` e `2E` marcam como FATO; `1F` marca como FATO SECUNDÁRIO.
- **Vale:** FATO SECUNDÁRIO. O plano das ondas (A.4) reserva FATO para fonte primária e põe "agregador" em FATO
  SECUNDÁRIO. Leitura direta da rede (RPC) é FATO.

**K-08. Limitless, volume recente.** `1A` e `1D`: US$ 10,13 mi em 30 dias (3/out/2026). `1E`: US$ 10,75 mi em
setembro de 2026; a taxa efetiva usa US$ 9,88 mi. São janelas diferentes. **Vale:** US$ 10,75 mi em setembro de 2026
(mês fechado), contra o pico de US$ 250,9 mi em maio de 2026: queda de 96%.

**K-09. Kalshi, volume de 2025.** `1B`: US$ 23,8 bi. `1F`: US$ 22,88 bi. **Vale:** "cerca de US$ 23 bilhões em 2025"
(FATO SECUNDÁRIO; duas fontes, 22,9 e 23,8).

**K-10. Usuários da Phantom.** `1D`: cerca de 15 mi por mês no 1º trimestre de 2026 (fonte fraca). `1E`: a Phantom
declara mais de 20 mi de usuários da carteira. **Vale:** "a Phantom declara mais de 20 milhões de usuários (FATO
SECUNDÁRIO); cerca de 15 milhões ativos por mês no início de 2026 (FATO SECUNDÁRIO, fonte fraca)".

**K-11. Quanto a ICE investiu na Polymarket.** `1F`: comunicado da ICE de 7/out/2025 anuncia até US$ 2 bi, a cerca de
US$ 8 bi de avaliação antes do aporte (FATO). `1B` e `1E`: US$ 1,6 bi investidos (US$ 1,0 bi em out/2025 e US$ 600 mi
em mar/2026; FATO SECUNDÁRIO). **Vale:** os dois, assim: "anunciou até US$ 2 bi; investiu US$ 1,6 bi até mar/2026".

**K-12. Projeção da Bernstein e ritmo atual.** A projeção é de cerca de US$ 240 bi de volume em 2026 e US$ 1 tri em
2030. Só os 30 dias até 3/out/2026 somaram US$ 81,8 bi em valor de face. Os dois números não fecham, e `1B` já tinha
notado que o crescimento anual citado (33%) não bate com a própria projeção. **Vale:** citar a projeção como projeção
(FATO SECUNDÁRIO, Decrypt, 14/abr/2026), sem taxa de crescimento, e **não anualizar** o número de 30 dias. O método
da Bernstein não foi lido [A confirmar, AC-06].

**K-13. Mercado alcançável.** `1B`, seção 5(d), estima US$ 0,1 a 0,5 bi por ano para um entrante, mas descreve o Baked
como "bounty" (o modelo antigo). `2A` (O16) pede o descarte. **Vale:** as réguas de `2E` (N-FC, seção 4.7): World,
Limitless, Jupiter e Myriad, em dólares pagos.

**K-14. Recompra do PUMP.** `briefing`: mais de US$ 350 mi e 81% abaixo do pico (sem data). `1F`: mais de US$ 230 mi
em 2025, 72% abaixo do pico e 41% abaixo do preço da oferta (jan/2026). `1G`: 162,72 bi de PUMP destruídos e preço de
US$ 0,004684 em 28/ago/2026, 17% acima do preço de venda (Blockworks, 21/set/2026). São fotos de datas diferentes.
**Vale:** as duas fotos datadas (jan/2026 e ago-set/2026). **Não usar** "US$ 350 mi" nem "81%".

**K-15. Tokens do pump.fun são Token-2022?** `modelos-de-token.md` diz "não confirmado". O `briefing`, posterior,
registra leitura da rede em 3/out/2026: 7 de 7 tokens novos eram Token-2022, com metadados no próprio token e
autoridades revogadas. **Vale:** o `briefing` (FATO, amostra de 7).

### 3.2 Produto e técnica

**K-16. Regra de fechamento.** `1H` propõe dois marcos (T1 e T2) com teto de 25% por lado na reta final. `2C` (E4) e
`2F` propõem um fechamento só e perguntas de até 30 dias no MVP, porque o teto cria uma corrida de robôs. **Vale:** a
decisão D-09 (80% da duração, mínimo de 24 horas) é a regra do produto. A proposta de `1H` entra como resposta à
pergunta D-10, para perguntas longas, em fase posterior. O limite de 30 dias entra como objeção (OBJ-21).

**K-17. Golpe da chance na saída.** `1H`: com a fórmula proposta, o golpista tem "prejuízo certo". `2C` (S1): se o
golpista domina o lado vencedor por outra carteira, recebe a própria penalidade de volta; no exemplo, lucro de
US$ 304,50 contra US$ 60,30 sem o golpe. **Vale:** `2C`. O BP não repete "prejuízo certo".

**K-18. Quanto do prêmio sobra numa fuga em massa.** `1H`: de 55% a 63%. `2C` (S2): é o melhor caso; com entradas em
momentos diferentes cai para cerca de 34%. **Vale:** "de cerca de um terço a 63%, conforme a ordem das entradas".

**K-19. Saída: MVP ou fase 2.** `briefing`: fase 2. `ideacao` (rodada 5): MVP. **Vale:** MVP (D-08). O red team pede
que nasça desligada por pergunta (OBJ-04).

**K-20. Resolução embutida na aposta.** `1H` propõe gravar o resultado na primeira interação que encontra a meta
cumprida. `2C` (R5) rejeita: fura a trava do `resolve` contra chamada por outro programa. **Vale:** `2C`. O site monta
a transação com o `resolve` na frente, como instrução separada.

**K-21. Recompensa a quem resolve.** `1H`: fase 2. `2A` e `2C`: desde o MVP. **Vale como proposta:** desde o MVP.

**K-22. Cardápio do primeiro dia.** `1H` lista oito perguntas, incluindo formatura no pump.fun, queima no nosso token
e, como reserva, perguntas decididas por uma chave. `2C` e `2F` cortam formatura, Token-2022, stake de validador e as
perguntas de chave. **Vale como proposta ao fundador:** o cardápio de `2F`, seção 9 (N-TQ, seção 4.12). O de `1H`
aparece como o cardápio ampliado das fases seguintes.

**K-23. "Sem oráculo".** O `briefing` diz "sem oráculo humano". `1H`: com preço pela Pyth, "sem oráculo" deixa de ser
verdade. **Vale:** "resolução por dado verificável on-chain". É compatível com D-13 ("oráculo, mas um que possa
resolver onchain").

**K-24. "Ninguém controla".** O programa atual não tem chave de administrador. O novo terá (abrir pergunta, taxa,
pausa, atualização). **Vale:** o BP diz quem pode o quê (quadro de `2C`, seção 4) e não escreve "ninguém controla".

**K-25. Licença do código.** `2F`: "não encontrado". `2B`: MIT em nome de Ronaldo Pereira. **Vale:** `2B`. Conferi o
arquivo `LICENSE` em 4/out/2026: "MIT License, Copyright (c) 2026 Ronaldo Pereira" (FATO).

**K-26. Piso da penalidade.** `1H`: 5%. `2C`: 10%. Nenhum foi decidido. **Vale:** a fórmula de `1H` é a "fórmula
proposta"; as emendas de `2C` (piso de 10%, penalidade marcada por lado, espera em horas) são a "fórmula revista".
O BP mostra as duas e diz que os parâmetros dependem de simulação.

### 3.3 Finanças

**K-27. Fração do volume que paga a operação.** `2B`: 0,75% (25% de 3%). `2E`: 0,6375%, porque a saída antecipada
tira dinheiro do pote antes da taxa (premissas: 20% do dinheiro sai, com penalidade média de 25%; pote final de 85%).
**Vale:** 0,6375% como número de trabalho, sempre com a frase "0,75% se ninguém sair antes". As premissas de saída
não têm dado (INFERÊNCIA, premissa sem dado).

**K-28. Volume de equilíbrio.** `briefing`: US$ 1,7 mi por mês (com 50% da taxa na operação: superado). `2B`:
US$ 400 mil, 1,33 mi e 3,33 mi. `2E`: US$ 470.588, 1.568.627 e 3.921.569. **Vale:** os de `2E` (arredondados: 471
mil, 1,57 milhão e 3,92 milhões), com os de `2B` na coluna "sem saída antecipada".

**K-29. Aposta nova por dólar de prêmio.** `1F` e `2B`: US$ 33. `2E`: US$ 39. **Vale:** 39 (e 33 sem saídas).

**K-30. Capital necessário.** `2B`: US$ 65 a 110 mil, 180 a 225 mil ou 480 a 525 mil (meses até o equilíbrio
supostos). `2E`: por cenário e regime (N-FK, seção 4.8). **Vale:** `2E`. Os números de `2B` aparecem só como "se o
custo for fixo desde o primeiro mês" na forma da tabela 4.4 de `2E`.

**K-31. Gasto antes do lançamento.** `2B`: US$ 30 a 75 mil. `2E`: US$ 51.500 (pontos médios). **Vale:** US$ 51.500,
com a faixa de 30 a 75 mil ao lado. `2C` e `2F` dizem que o custo de auditoria "não foi pesquisado"; `2B` pesquisou
(blogs de empresas de auditoria). Vale `2B`, como FATO SECUNDÁRIO, com AC-09.

**K-32. Taxa sobre o valor devolvido na saída.** `2B` propõe cobrar 3%. `2E` não cobra (leitura literal de D-08 e
D-26). **Vale no modelo:** não cobrada. Fica como pergunta em aberto.

**K-33. Marco para a equipe passar a receber.** `2B`: três meses seguidos com US$ 400 mil apostados. `2E`: esse marco
só paga o nível 2 se a regra de partida valer. **Vale:** o marco e o regime da taxa são decididos juntos.

### 3.4 Regulação e tokens

**K-34. Brasil: fontes e fatos novos.** `1C` trabalhou com imprensa e escritórios. `2D` leu na fonte a Resolução CMN
5.298 e a Nota Técnica 2958 e acrescentou a Medida Provisória 1.394/2026 e a declaração da ESMA de 3/7/2026.
**Vale:** `2D`. Três correções a `1C`: a lista dos 27 sites não está na Nota Técnica (saiu na imprensa; a Anatel
confirma o bloqueio); Anjouan é rota excluída segundo a fonte lida; a base do bloqueio passou do art. 17 da Lei
14.790 para o art. 23 da MP. A MP entra com [A confirmar, AC-01].

**K-35. Data das perguntas e respostas da SEC.** `1C`: 27/9/2026, com a dúvida de que era domingo. `1G`: publicada em
25/9/2026 e alterada em 28/9/2026 (página oficial). **Vale:** `1G`.

**K-36. Ordem dos tokens.** `1G` propõe o token do pump.fun junto com o produto (mês 0), venda privada nos meses 4 a
6 e token B nos meses 6 a 9. `2A` propõe o token A só depois de algumas semanas de perguntas resolvidas. `2D` propõe
tirar o token B do cronograma até haver parecer. `2F` deixa os dois fora do MVP. **Vale:** D-30 (pump.fun primeiro,
ICO privado depois). O cronograma de `1G` aparece como proposta; as três discordâncias, na OBJ-13.

**K-37. Os "30%".** D-31: 30% de cada compra do token do ICO privado para as pools. `1G`: como taxa permanente do
token, quem paga 1.000 fica com 703 e, se revender, com 490; propõe 30% do que a venda privada arrecadar. **Vale:**
a decisão, com a conta de `1G` e a alternativa na OBJ-14.

**K-38. Cloak e SODAX: integrar ou orientar.** D-40 decide usar os dois. `2C` e `2F`: no MVP, orientação e página
separada, sem pacote de terceiros na página de aposta. **Vale:** a decisão; a forma de `2C` é a OBJ-23.

**K-39. Direção de design.** Ver o aviso 2 da seção 2: vale D-39.

**K-40. Rendimento pago pela Polymarket sobre posições.** A própria fonte diverge (4,00% na documentação, 3,25% na
central de ajuda). **Vale:** 3,25% ao ano, "financiado pela tesouraria da Polymarket" (FATO, central de ajuda, via
`1F`): é custo dela, não receita.

---

## 4. Ficha de números canônicos

Regra: **os redatores só usam números desta ficha.** Cada número leva, no BP, a etiqueta e a fonte curta entre
parênteses, por exemplo "(FATO SECUNDÁRIO, DefiLlama, set/2026)". Onde a coluna "Etiqueta" traz "INFERÊNCIA (premissa
sem dado)", o BP diz que é premissa. Valores em dólares americanos. "mi" = milhões; "bi" = bilhões.

Arredondamento permitido no texto corrido: US$ 15,44 mi pode virar "cerca de US$ 15 milhões". Em tabela, o valor
exato desta ficha.

### 4.1 Mercado (N-ME)

| ID | Número | Valor | Data | Fonte | Etiqueta |
|---|---|---|---|---|---|
| N-ME-01 | Volume do setor em 30 dias, valor de face | US$ 81,8 bi | 4/set a 3/out/2026 | `1E` 6.2 (DefiRate) | FATO SECUNDÁRIO |
| N-ME-02 | Volume do setor em 30 dias, dólares pagos | US$ 21,7 bi; média de US$ 0,27 por contrato | idem | `1E` 6.2 (DefiRate) | FATO SECUNDÁRIO |
| N-ME-03 | Kalshi, valor de face, 30 dias | US$ 64,2 bi | idem | `1E` 6.2 (DefiRate) | FATO SECUNDÁRIO |
| N-ME-04 | Kalshi, dólares pagos | US$ 13,7 bi em 30 dias; US$ 13,5 bi em setembro | até 3/out/2026 | `1E` 6.2 (DefiLlama) | FATO SECUNDÁRIO; a régua é INFERÊNCIA (AC-05) |
| N-ME-05 | Razão entre valor de face e dólares pagos, Kalshi | cerca de 4,7 vezes (64,2 ÷ 13,7) | idem | `1E` 6.2 | INFERÊNCIA |
| N-ME-06 | Polymarket, valor de face, 30 dias | US$ 14,2 bi (internacional 4,7 + EUA 9,5) | 4/set a 3/out/2026 | `1E` 6.2 (DefiRate) | FATO SECUNDÁRIO |
| N-ME-07 | Polymarket, dólares pagos | US$ 4,63 bi em setembro (três braços); 30 dias: internacional 2,19 + EUA 2,41 | set/2026 | `1E` 3.9 (DefiLlama) | FATO SECUNDÁRIO |
| N-ME-08 | Polymarket, série em dólares pagos | nov/2025 US$ 1,88 bi; mar/2026 5,09 bi; jun/2026 5,95 bi; set/2026 4,63 bi; acumulado 56,5 bi | até set/2026 | `1E` 3.9 (DefiLlama) | FATO SECUNDÁRIO |
| N-ME-09 | Polymarket, taxas arrecadadas | zero em 2025; jan/2026 US$ 3,7 mi; abr/2026 40,6 mi; set/2026 93,6 mi; acumulado 435,3 mi | até set/2026 | `1E` 3.6 (DefiLlama) | FATO SECUNDÁRIO |
| N-ME-10 | Polymarket, parte da taxa devolvida a usuários | cerca de 24% (2º e 3º trimestres de 2026) | 2026 | `1F` 2.2 (DefiLlama) | INFERÊNCIA sobre FATO SECUNDÁRIO |
| N-ME-11 | Kalshi em 2025 | cerca de US$ 23 bi negociados; US$ 263,5 mi de taxa (1,15%); 89% da taxa vem de esportes | 2025 | `1F` 2.1 (BJ21); `1B` | FATO SECUNDÁRIO |
| N-ME-12 | Kalshi e Polymarket juntas em 2025 | mais de US$ 44 bi; régua não declarada | dez/2025 | `1B` (The Block) | FATO SECUNDÁRIO |
| N-ME-13 | Fatia da Kalshi no volume semanal | 77% | fim de set/2026 | `1B` (Artemis, via Crypto Economy) | FATO SECUNDÁRIO |
| N-ME-14 | Projeção da Bernstein | volume de cerca de US$ 240 bi em 2026 e US$ 1 tri em 2030; receita do setor de cerca de US$ 500 mi (2025) para US$ 10,8 bi (2030) | 14/abr/2026 | `1B` (Decrypt) | FATO SECUNDÁRIO (projeção; AC-06) |
| N-ME-15 | Peso dos esportes no volume do setor | 62% hoje; 31% projetado para 2030 | abr/2026 | `1B` (Bernstein) | FATO SECUNDÁRIO |
| N-ME-16 | Polymarket por assunto | esporte 39% a 40%; política 32%; cripto 20% | mai/2026 | `1D` seção 2 | FATO SECUNDÁRIO |
| N-ME-17 | Previsão em Solana no lançamento da Kalshi tokenizada | US$ 28,6 mi em cerca de 3 semanas (Jupiter + DFlow); cerca de 21 mil carteiras; 98% do volume da DFlow veio da Phantom | meados de dez/2025 a 5/jan/2026 | `1B` (Step Data) | FATO SECUNDÁRIO |
| N-ME-18 | Previsão da Jupiter | US$ 5,5 mi em 30 dias | out/2026 | `1E` (DefiLlama) | FATO SECUNDÁRIO |
| N-ME-19 | Plataformas on-chain menores somadas (Azuro, Limitless, Myriad, PolyBet) | menos de 4% do volume mensal da Polymarket | mai/2026 | `1D` seção 2 | FATO SECUNDÁRIO |
| N-ME-20 | Queda de volume depois de campanhas de incentivo | Opinion −80,7% e Myriad −93,8% (1º para 2º tri de 2026); Limitless −96% (mai a set/2026) | 2026 | `1F` 5.3 (Predictefy); `1E` 5.9 | FATO SECUNDÁRIO |
| N-ME-21 | Todos os mercados sobre o pump.fun na Polymarket | cerca de US$ 262,81 mil no total; são sobre o token PUMP | sem data | `1D` seção 6 (Cryptorank) | FATO SECUNDÁRIO, fonte fraca |
| N-ME-22 | Mercados abertos sobre queima, renúncia, trava ou formatura de tokens de terceiros | nenhum encontrado em qualquer plataforma | out/2026 | `1D` seção 6 | FATO (ausência em busca limitada) |
| N-ME-23 | Avaliações e capital dos líderes | Kalshi US$ 22 bi (mai/2026); Polymarket US$ 15 bi (2026); ICE anunciou até US$ 2 bi e investiu US$ 1,6 bi | 2025 e 2026 | `1B` (Sacra); `1F` (comunicado da ICE) | FATO SECUNDÁRIO; o anúncio da ICE é FATO |
| N-ME-24 | Negociação artificial na Polymarket | cerca de 25% da atividade histórica | estudo citado em 2026 | `1B` (Columbia, via Sacra) | FATO SECUNDÁRIO |
| N-ME-25 | Interesse de busca por mercados de previsão | caiu 83% desde o pico da Copa de 2026 | 2026 | `1B` (The Defiant) | FATO SECUNDÁRIO |
| N-ME-26 | Concentração da receita na Polymarket | taxa mediana por carteira de US$ 0,99 (jan a 8/jul/2026); as 100 maiores carteiras pagaram 24% | 9/jul/2026 | `1F` 2.2 (PolyScalping) | FATO SECUNDÁRIO |
| N-ME-27 | Vendas públicas de token no mundo | 1º tri/2026: 105 vendas, US$ 390 mi; 2º tri/2026: 37 vendas, US$ 58 mi (média de US$ 1,57 mi) | 4/set/2026 | `1G` 2.2 (Flexe.io, CryptoRank) | FATO SECUNDÁRIO |
| N-ME-28 | Bloqueios e banimentos de mercados de previsão | França (16-17/7/2026), Bélgica, Polônia, Portugal, Itália, Países Baixos e outros; Brasil bloqueou 27 sites em abr/2026 | 2025 e 2026 | `1C`; `2D` 1.3 e 2.3 | FATO (França, Anatel); FATO SECUNDÁRIO (demais) |

### 4.2 Concorrentes (N-CO)

| ID | Concorrente | Número ou fato | Data | Fonte | Etiqueta |
|---|---|---|---|---|---|
| N-CO-01 | Melee | Captou US$ 3,5 mi (rodada liderada pela Variant; anjo: Anatoly Yakovenko, cofundador da Solana) | set/2025 | `1E` 1.9 | FATO SECUNDÁRIO |
| N-CO-02 | Melee | 49.247 pessoas na fila de espera ("predictors in line") | 4/out/2026 | `1E` 1.2 (site) | FATO |
| N-CO-03 | Melee | Beta em rede de teste, sem dinheiro real; perto do lançamento na rede principal em 22/jul/2026 | set/2026 | `1E` 1.2 | FATO SECUNDÁRIO (AC-04) |
| N-CO-04 | Melee | Mecanismo: pote com curva e "piso de retorno"; saída antecipada por um cofre separado que compra a posição com desconto | 2026 | `1E` 1.4 (documento oficial) | FATO |
| N-CO-05 | Melee | Taxa: não publicada. Criador recebe "até 20%" (de quê, não está claro). Token: não anunciado. Auditoria pública: nenhuma | out/2026 | `1E` 1.5 a 1.10 | não encontrado (AC-04) |
| N-CO-06 | PNP | Taxa de 1% por negociação; 30% dela para o criador | out/2026 | `1E` 2.4 (documentação) | FATO |
| N-CO-07 | PNP | 206 transações no programa principal em seis meses; nenhuma depois de 17/set/2026 | 16/mar a 4/out/2026 | `1E` 2.8 (leitura da rede) | FATO |
| N-CO-08 | PNP | Token: valor de mercado de US$ 108.661; liquidez de US$ 31.219; US$ 258 negociados em 24 h; queda de cerca de 93% em 13 meses | 4/out/2026 | `1E` 2.6 (DexScreener) | FATO SECUNDÁRIO; a queda é INFERÊNCIA |
| N-CO-09 | PNP | Resolução por dois modelos de linguagem (Perplexity e Grok), com uma DAO de retaguarda; o criador pode nomear uma carteira como juiz | out/2026 | `1E` 2.5 (documentação) | FATO |
| N-CO-10 | Polymarket | Resolução pelo oráculo UMA: caução de cerca de US$ 750, 2 horas de contestação, 4 a 6 dias se houver disputa | 3/out/2026 | `1E` 3.5 (documentação) | FATO |
| N-CO-11 | Polymarket | Mais de 1.150 mercados foram a arbitragem em 2026 até maio, mais que 2025 inteiro; em cerca de 1 de cada 5 disputas um votante tinha posição no mercado julgado | mai/2026 | `1E` 3.5 (Wall Street Journal, via Finance Magnates) | FATO SECUNDÁRIO |
| N-CO-12 | Polymarket | Mercado de US$ 7 mi resolveu SIM sem o fato ter ocorrido; um detentor votou com 25% dos votos; sem reembolso | mar/2025 | `1E` 3.5 (CoinDesk e outros) | FATO SECUNDÁRIO |
| N-CO-13 | Polymarket | 821 contas ganharam US$ 8,2 mi em janelas de liquidação provavelmente manipuladas nos mercados de Bitcoin de 5 minutos; 93% do prejuízo caiu no varejo | ago/2026 | `1E` 3.5 (CoinDesk) | FATO SECUNDÁRIO |
| N-CO-14 | Polymarket | O token do oráculo (UMA) vale US$ 37,5 mi no total, 99% abaixo do topo de 2021 | 4/out/2026 | `1E` 3.5 (CoinGecko) | FATO SECUNDÁRIO |
| N-CO-15 | Polymarket | Usuários ativos por dia: de cerca de 59 mil (out/2025) para quase 150 mil (meados de mar/2026) | 2025 e 2026 | `1E` 3.9 | FATO SECUNDÁRIO |
| N-CO-16 | Polymarket | Token POLY confirmado em 24/out/2025 e ainda não lançado | 3/out/2026 | `1E` 3.7 | FATO SECUNDÁRIO; a ausência de lançamento é FATO (central de ajuda) |
| N-CO-17 | Polymarket | O Brasil está na lista de países que só podem fechar posição | 3/out/2026 | `1C`; `1E` 3.1 (documentação) | FATO |
| N-CO-18 | Polymarket | Processada pelo estado de Nova York por jogo ilegal sem licença | 24/set/2026 | `1E` 3.10; `2D` 2.2 | FATO |
| N-CO-19 | Polymarket | "Sponsor Market Rewards": mínimo de US$ 0,1 por dia; o patrocinador não recebe nada; mediana de US$ 3 por dia por mercado; 882 de 17.866 mercados recebem US$ 50 ou mais por dia | set/2026 | `patrocinio-e-destaque-pago.md`; `1F` 3.1 (Vultax) | FATO (regras); FATO SECUNDÁRIO (valores) |
| N-CO-20 | World (Phantom) | Volume: jun/2026 US$ 1,14 mi; jul 13,22 mi; ago 22,20 mi; set 15,44 mi; acumulado 52,94 mi | set/2026 | `1E` 4.9 (DefiLlama) | FATO SECUNDÁRIO |
| N-CO-21 | World (Phantom) | Dinheiro travado: US$ 170,8 mil; cada dólar girou cerca de 90 vezes no mês | set/2026 | `1E` 4.9; `2B` 2.4 | FATO SECUNDÁRIO; o giro é INFERÊNCIA |
| N-CO-22 | World (Phantom) | Uma chave da empresa cria os mercados e grava o resultado; a instrução não leva prova nem oráculo | 11/set/2026 | `1E` 4.5 (Chainstack Labs) | FATO SECUNDÁRIO |
| N-CO-23 | World (Phantom) | Ficou 29,5 horas fora do ar depois do lançamento de 9/set/2026; lista de espera de mais de 1 milhão; cerca de 4.000 mercados abertos | set/2026 | `1E` 4.1, 4.4 e 4.10 | FATO SECUNDÁRIO |
| N-CO-24 | Phantom | Mais de 20 mi de usuários declarados; cerca de 15 mi ativos por mês no início de 2026 | 2026 | `1E` 4.1; `1D` seção 1 | FATO SECUNDÁRIO (o segundo, fonte fraca) |
| N-CO-25 | Limitless | Volume mensal, em US$ mi: nov/2025 65,2; dez 75,6; jan/2026 47,2; fev 72,5; mar 91,0; abr 102,8; mai 250,9; jun 173,0; jul 85,9; ago 27,5; set 10,75. Acumulado: US$ 1,467 bi | set/2026 | `1E` 5.9 (DefiLlama) | FATO SECUNDÁRIO |
| N-CO-26 | Limitless | Queda de 96% entre maio e setembro de 2026; causa não encontrada | 2026 | `1E` 5.9 | INFERÊNCIA |
| N-CO-27 | Limitless | Taxas arrecadadas: US$ 3,82 mi em mai/2026; US$ 0,20 mi em set/2026; US$ 14,13 mi no total | set/2026 | `1E` 5.6 (DefiLlama) | FATO SECUNDÁRIO |
| N-CO-28 | Limitless | Token LMTS: de US$ 0,694 (22/out/2025) para US$ 0,0420, queda de 94%; o detentor não recebe nada das taxas | 4/out/2026 | `1E` 5.7 (CoinGecko, DefiLlama) | FATO SECUNDÁRIO |
| N-CO-29 | Limitless | Captou cerca de US$ 17 mi (US$ 7 mi até jul/2025 e US$ 10 mi em 20/out/2025) | 2025 | `1E` 5.9 | FATO SECUNDÁRIO; a soma é INFERÊNCIA |
| N-CO-30 | Limitless | Qualquer usuário cria mercado; o criador recebe 2% das taxas; reembolso escrito em caso de resolução errada | out/2026 | `1E` 5.4 e 5.5 (documentação) | FATO |
| N-CO-31 | Os cinco | Nenhum resolve por leitura direta de conta on-chain; nenhum vende patrocínio de pergunta com contrapartida | out/2026 | `1E` seção 8 e resumo | INFERÊNCIA sobre os fatos lidos |
| N-CO-32 | Outros | Hedgehog Markets e Predict.fun (on-chain) estão entre os 27 sites bloqueados no Brasil | abr/2026 | `2D` 1.3 (Exame, Folha) | FATO SECUNDÁRIO |
| N-CO-33 | Outros | Drift sofreu ataque de US$ 285 mi em 1/abr/2026 | abr/2026 | `1A` | FATO SECUNDÁRIO |
| N-CO-34 | Outros | Hyperliquid HIP-4: US$ 331,1 mi nas 9 primeiras semanas, desde 2/mai/2026 | 2026 | `1A` | FATO SECUNDÁRIO |

Quadro comparativo que o capítulo 6 reproduz (fonte: `briefing` seção 11, corrigido por `1E`):

| | Mecanismo | Quem abre as perguntas | Como resolve | Identificação |
|---|---|---|---|---|
| Polymarket | Livro de ordens | A equipe, com sugestões do público | Oráculo UMA, com votação em caso de disputa | Carteira no site internacional; cadastro nos EUA |
| Kalshi | Livro de ordens, bolsa regulada nos EUA | A empresa | Regra do contrato e decisão interna | Cadastro completo |
| Melee (Solana) | Pote com curva e piso de retorno | Meta: qualquer um | Pessoas (criador ou equipe); página oficial em construção | Não encontrado |
| PNP (Solana) | Curva de ligação; também pote entre duas partes | Qualquer um | Modelos de linguagem; DAO de retaguarda | Nenhuma mencionada |
| World (Solana, na Phantom) | Formadores de mercado acionados por roteador | Só a chave da empresa | Chave da empresa, alimentada pelo Chainlink fora da rede | Opcional; bloqueia regiões sob sanção |
| Limitless (Base) | Livro de ordens e AMM | Equipe e qualquer usuário | Pyth, Chainlink, provedores esportivos e, em parte, a equipe | Sem cadastro de rotina; bloqueia EUA e outros |
| Baked Market | Pote | A equipe; patrocinador pede | Leitura de dado on-chain | Só carteira (D-35) |

### 4.3 Taxas praticadas (N-TX)

| ID | Quem | Taxa | Fonte | Etiqueta |
|---|---|---|---|---|
| N-TX-01 | Polymarket (internacional) | Só paga quem toma liquidez: contratos × coeficiente × p × (1 − p). Coeficiente: cripto 0,07; esportes, economia, cultura e clima 0,05; finanças, política e tecnologia 0,04; geopolítica 0. Exemplo: 100 ações de cripto a US$ 0,50 pagam US$ 1,75, ou 3,5% dos US$ 50 pagos | `1E` 3.6 (documentação, 3/out/2026) | FATO |
| N-TX-02 | Polymarket, taxa efetiva | 2,0% dos dólares pagos (US$ 93,2 mi sobre US$ 4,61 bi em 30 dias) | `1E` 3.6 | INFERÊNCIA |
| N-TX-03 | Kalshi | 0,07 × contratos × p × (1 − p) para quem toma liquidez; teto de 1,75 centavo por contrato a 50 centavos | `receita-mercados-de-previsao.md` | FATO SECUNDÁRIO |
| N-TX-04 | Limitless | AMM 0,40%; livro: compra de 0,40% a 3,00%, venda de 0,42% a 1,50%; efetiva de 1,9% | `1E` 5.6; `1H` 2.2 | FATO; a efetiva é INFERÊNCIA |
| N-TX-05 | World (Phantom) | 0,1 × p × (1 − p) × contratos. Exemplo oficial: 100 contratos a US$ 0,75 pagam US$ 1,875 (2,5% dos US$ 75). A 50%, 5% do valor pago. Mais a margem do formador: de 0% a 8% observados | `1E` 4.6 | FATO (fórmula); FATO SECUNDÁRIO (margem) |
| N-TX-06 | PNP | 1% por negociação | `1E` 2.6 | FATO |
| N-TX-07 | PancakeSwap Prediction | 3% do pote de cada rodada; rodada cancelada devolve 100%, sem taxa | `receita-mercados-de-previsao.md`; `1H` 3.2 | FATO |
| N-TX-08 | FactCheck (Solana) | 2,5% do pote | `receita-mercados-de-previsao.md` | FATO SECUNDÁRIO |
| N-TX-09 | PredictIt | 10% do lucro de cada posição vencedora e 5% no saque | `receita-mercados-de-previsao.md` | FATO SECUNDÁRIO |
| N-TX-10 | Faixa do setor | De 1,9% a 5% dos dólares pagos | `1E` resumo, item 9 | INFERÊNCIA |
| N-TX-11 | Baked Market | 3% do pote, cobrados também na devolução do pote de um lado só | `ideacao` seção 1 | Decisão (D-26, D-07) |
| N-TX-12 | Comparação no favorito | Lado vencedor com 90% do pote: no Baked a taxa leva 30% do ganho; na Polymarket (cripto), 0,7% do valor pago. Com 97% do pote num lado, quem acerta recebe exatamente o que pôs; acima disso, perde | `2A` O6; `2B` 3.2 | INFERÊNCIA |

Tabela obrigatória do capítulo 7 (o favorito e a taxa fixa; `2A` O6 e `2B` 3.2; INFERÊNCIA; conferida):

| Fatia do lado vencedor no pote | Cada US$ 1 recebe (0,97 ÷ fatia) | Ganho sem taxa | Parte do ganho que a taxa leva |
|---|---|---|---|
| 50% | 1,940 | 1,000 | 6% |
| 70% | 1,386 | 0,429 | 10% |
| 80% | 1,213 | 0,250 | 15% |
| 90% | 1,078 | 0,111 | 30% |
| 95% | 1,021 | 0,053 | 60% |
| 97% | 1,000 | 0,031 | 100% |
| 99% | 0,980 | 0,010 | mais que tudo: quem acerta perde 2% |

### 4.4 O exemplo do pote (N-PO)

Estes são os exemplos numéricos oficiais. Os redatores não criam exemplos com outros valores sem conferir a conta.

**N-PO-01. Exemplo-base (`briefing` 3.2; decisão D-02 e D-26).** Pote com 300 USDC no SIM e 700 no NÃO; taxa de 3%.

- Pote total: 1.000. Taxa: 30. Sobram 970 para quem acertar.
- Se der SIM: cada 1 USDC no SIM recebe 970 ÷ 300 = 3,23.
- Se der NÃO: cada 1 USDC no NÃO recebe 970 ÷ 700 = 1,39.
- Chance mostrada na tela: a fatia do pote. SIM 30%, NÃO 70%.
- Duas consequências que o usuário precisa ver: o retorno só fica definido quando as apostas fecham; uma aposta
  grande num lado baixa o retorno desse lado.

**N-PO-02. O retorno muda quando entra dinheiro (`2D` 1.4).** No pote acima, entram mais 700 no SIM: pote de 1.700,
sobram 1.649, e cada 1 USDC do SIM passa a receber 1.649 ÷ 1.000 = 1,65 (antes, 3,23).

**N-PO-03. Pote de um lado só (`2A` O5; `2E` seção 2).** Ana põe 100 no SIM e ninguém aposta no NÃO: ela recebe 97.
Dez pessoas põem 2.000 no SIM e ninguém entra no NÃO: taxa de 60 (15 para cada parcela) e 0,97 por dólar.

**N-PO-04. Aposta grande derruba o próprio retorno (`2B` 2.5).** Pote com 5.000 de cada lado paga 1,94 por dólar. Quem
põe 10.000 no SIM faz o SIM passar a pagar 1,29 (0,97 × 20.000 ÷ 15.000).

**N-PO-05. Pote com patrocinador num lado (`briefing` seção 5).** Com 1.000 em cada lado, cada lado paga 1,94. Se o
patrocinador põe 5.000 no SIM: pote de 7.000, sobram 6.790; o SIM (6.000) passa a pagar 1,13 e o NÃO (1.000), 6,79.

**N-PO-06. Aposta de última hora (`1H` 2.1).** Pote 500 no SIM e 500 no NÃO; falta uma hora e o NÃO é quase certo.
Quem está no NÃO desde o começo receberia 1,94. Um oportunista põe 5.000 no NÃO: recebe 5.290,91 (lucro de 290,91
quase sem risco) e os apostadores antigos do NÃO passam a receber 1,058 por dólar.

### 4.5 Patrocínio (N-PA)

**Sentido A:** 70% para a banca e 30% para o pote. **Sentido B:** 30% para a banca e 70% para o pote. O fundador não
disse qual vale (D-19). Toda tabela mostra os dois.

N-PA-01. Quanto vai para cada lado (aritmética direta):

| Faixa | Sentido A: banca | Sentido A: pote | Sentido B: banca | Sentido B: pote |
|---|---|---|---|---|
| US$ 500 | 350 | 150 | 150 | 350 |
| US$ 1.500 | 1.050 | 450 | 450 | 1.050 |
| US$ 5.000 | 3.500 | 1.500 | 1.500 | 3.500 |

N-PA-02. Pote de exemplo do patrocínio (`1F` 4.1): US$ 10.000 em apostas, 6.000 no SIM e 4.000 no NÃO; taxa de 3%
sobre o pote inteiro, inclusive sobre o dinheiro do patrocinador (premissa de `1F`; não decidido). Sem patrocinador: a
banca fica com 300; se o SIM vence, cada US$ 1 recebe 1,617; se o NÃO vence, 2,425; os apostadores, somados, perdem 3%.

N-PA-03. A banca no total (`1F` 4.2; INFERÊNCIA; conferida):

| Faixa | Sentido | Vai ao pote | Fica com a banca | Taxa de 3% sobre o pote maior | Banca no total |
|---|---|---|---|---|---|
| US$ 500 | A | 150 | 350 | 304,50 | 654,50 |
| US$ 500 | B | 350 | 150 | 310,50 | 460,50 |
| US$ 1.500 | A | 450 | 1.050 | 313,50 | 1.363,50 |
| US$ 1.500 | B | 1.050 | 450 | 331,50 | 781,50 |
| US$ 5.000 | A | 1.500 | 3.500 | 345,00 | 3.845,00 |
| US$ 5.000 | B | 3.500 | 1.500 | 405,00 | 1.905,00 |

N-PA-04. Prêmio neutro: o que muda para o apostador (`1F` 4.3; INFERÊNCIA; conferida):

| Faixa e sentido | Prêmio no pote | SIM vence: cada US$ 1 recebe | NÃO vence: cada US$ 1 recebe | Saldo de todos os apostadores juntos |
|---|---|---|---|---|
| Sem patrocinador | 0 | 1,617 | 2,425 | perdem 300 (−3,0%) |
| US$ 500, A | 150 | 1,641 | 2,461 | perdem 154,50 (−1,5%) |
| US$ 500, B | 350 | 1,673 | 2,510 | ganham 39,50 (+0,4%) |
| US$ 1.500, A | 450 | 1,689 | 2,534 | ganham 136,50 (+1,4%) |
| US$ 1.500, B | 1.050 | 1,786 | 2,680 | ganham 718,50 (+7,2%) |
| US$ 5.000, A | 1.500 | 1,859 | 2,789 | ganham 1.155 (+11,6%) |
| US$ 5.000, B | 3.500 | 2,183 | 3,274 | ganham 3.095 (+31,0%) |

N-PA-05. A linha dos 3,09% (`1F` 4.3 e 4.5; INFERÊNCIA; conferida). O prêmio neutro cobre a taxa quando passa de
3,09% do total apostado (0,97 × (apostas + prêmio) = apostas). Num pote de US$ 10.000 a linha é US$ 309. Acima dela,
quem aposta nos dois lados na proporção do pote lucra sem risco, e esse dinheiro entra até 32,3 vezes o prêmio:

| Prêmio no pote | Apostas que ele sustenta até zerar a vantagem | Taxa de 3% gerada nesse ponto |
|---|---|---|
| US$ 150 | US$ 4.850 | US$ 150 |
| US$ 350 | US$ 11.317 | US$ 350 |
| US$ 1.050 | US$ 33.950 | US$ 1.050 |
| US$ 3.500 | US$ 113.167 | US$ 3.500 |

N-PA-06. Aposta de patrocinador no SIM, mesmo pote (`1F` 4.4; INFERÊNCIA; conferida):

| Faixa e sentido | Aposta no SIM | SIM vence: cada US$ 1 recebe | Patrocinador recebe de volta | NÃO vence: cada US$ 1 recebe |
|---|---|---|---|---|
| Sem patrocinador | 0 | 1,617 | n/a | 2,425 |
| US$ 500, A | 150 | 1,601 | 240 | 2,461 |
| US$ 500, B | 350 | 1,581 | 553 | 2,510 |
| US$ 1.500, A | 450 | 1,572 | 707 | 2,534 |
| US$ 1.500, B | 1.050 | 1,520 | 1.596 | 2,680 |
| US$ 5.000, A | 1.500 | 1,487 | 2.231 | 2,789 |
| US$ 5.000, B | 3.500 | 1,378 | 4.824 | 3,274 |

Leitura fixada: quem apostou no mesmo lado do patrocinador ganha menos; se o patrocinador acerta, recupera quase tudo
(na faixa de US$ 5.000 do sentido B, paga 5.000 e recebe 4.824: o "patrocínio" custou 176). Isso é aposta com selo,
não prêmio.

N-PA-07. Preços praticados em produtos comparáveis (`1F` 3.1; `patrocinio-e-destaque-pago.md`):

| Produto | Preço | Etiqueta |
|---|---|---|
| DexScreener, anúncio de token | "a partir de US$ 299" | FATO (página oficial) |
| DexScreener, barra de tendências | "a partir de US$ 2.000" | FATO SECUNDÁRIO |
| DexScreener, Boosts (12 a 24 horas) | De cerca de US$ 100 a milhares | FATO (a duração); preço [A confirmar, AC-03] |
| DEXTools, pares em alta por 24 horas | US$ 1.500 a 2.000 (tabela de 2024) | FATO SECUNDÁRIO antigo |
| CoinGecko e CoinMarketCap, banner por dia | A partir de US$ 1.350 e de US$ 1.150 | Fonte fraca (agência revendedora) [A confirmar, AC-03] |
| CoinGecko, custo por mil impressões numa campanha real | US$ 8 | FATO SECUNDÁRIO (Trilokana, mai/2025) |
| Metaculus, torneio financiado | US$ 15 a 20 mil de prêmio | FATO SECUNDÁRIO |
| Myriad, competição da Copa | US$ 100.000 | FATO SECUNDÁRIO |

N-PA-08. Impressões que a parte da banca teria de entregar, a US$ 8 por mil (`1F` 3.2; INFERÊNCIA): faixa de
US$ 500, de 18.750 (sentido B) a 43.750 (sentido A); faixa de US$ 5.000, de 187.500 a 437.500.

N-PA-09. Proposta de contrapartidas por faixa (`1F` 3.3; INFERÊNCIA; prazos e quantidades são proposta):

| | Faixa 1: US$ 500 | Faixa 2: US$ 1.500 | Faixa 3: US$ 5.000 |
|---|---|---|---|
| Pergunta | Entra numa já aberta | Entra ou pede uma, sujeita a aprovação | Pede pergunta sob medida, sujeita a aprovação |
| Selo "Patrocinado por X" (ou "Anônimo") | Sim | Sim | Sim |
| Texto na pergunta | Nome e link | Nome, link e uma frase | Nome, link, frase e imagem |
| Destaque na página inicial | Não | 72 horas | Posição fixa no topo durante a janela de apostas |
| Publicação no X, rotulada como parceria paga | 1 | 2 | 4 e fio de resultado |
| Relatório ao fim | Não | Volume e número de carteiras | Volume, carteiras, impressões e cliques |

N-PA-10. Quanto volume de apostas cada patrocínio substitui, se a parte da banca for inteira para a operação (`2B`
4.3; parte da banca ÷ 0,75%; INFERÊNCIA): US$ 500: 46.667 (A) ou 20.000 (B); US$ 1.500: 140.000 ou 60.000;
US$ 5.000: 466.667 ou 200.000. Se a parte da banca também for dividida em quatro, dividir por quatro. Não decidido.

N-PA-11. Custo de vender à mão (`2B` 4.5; INFERÊNCIA, premissa sem dado: 5 horas a US$ 25): US$ 125 por venda. A
faixa de US$ 500 no sentido B rende à banca US$ 25 depois desse custo.

N-PA-12. Cofre de USDC do Cloak: cerca de 2.560 USDC (2.562,72), cerca de 50 operações por dia (`briefing` seção 5;
`2C` P1; origem: `PRIVACY_PLAN.md` do sócio; FATO SECUNDÁRIO). Um patrocínio de 500 é um quinto do cofre; o de 1.500,
mais da metade; o de 5.000, quase o dobro (INFERÊNCIA).

### 4.6 Destino da taxa, fundo de prêmios, Bitcoin e recompra (N-DT)

N-DT-01. O caminho de cada US$ 100 apostados, pela decisão (D-26 e D-27), sem saída antecipada (`2B` seção 1):

| Destino | Valor | Parcela do volume |
|---|---|---|
| Volta aos vencedores | US$ 97,00 | 97% |
| Taxa da casa | US$ 3,00 | 3% |
| Tesouraria em Bitcoin (25% da taxa) | US$ 0,75 | 0,75% |
| Operação (25%) | US$ 0,75 | 0,75% |
| Recompra e queima do token da venda privada (25%) | US$ 0,75 | 0,75% |
| Fundo de prêmios (25%) | US$ 0,75 | 0,75% |

N-DT-02. O mesmo caminho com a saída antecipada do modelo (`2E` 1.3; INFERÊNCIA, premissas sem dado: 20% do dinheiro
sai antes, com penalidade média de 25%). De cada US$ 100: US$ 15 voltam a quem saiu; o pote final é de US$ 85; a
taxa é de US$ 2,55; cada uma das quatro parcelas recebe US$ 0,6375 (0,64); os vencedores recebem US$ 82,45.
Conferência: 15 + 82,45 + 2,55 = 100.

N-DT-03. Por volume, sem saída antecipada (`2B` seção 1; aritmética):

| Volume apostado por mês | Taxa (3%) | Cada uma das quatro parcelas |
|---|---|---|
| US$ 100 mil | 3.000 | 750 |
| US$ 400 mil | 12.000 | 3.000 |
| US$ 1 milhão | 30.000 | 7.500 |
| US$ 1,33 milhão | 40.000 | 10.000 |
| US$ 3,33 milhões | 100.000 | 25.000 |

N-DT-04. Fundo de prêmios, quanto precisa atrair (`2E` 6.2; entre parênteses, `2B` 5.1, sem saídas; INFERÊNCIA):

| O que se quer recuperar com o prêmio | Aposta nova por US$ 1 de prêmio | Parcela do volume que teria de existir por causa do fundo |
|---|---|---|
| A taxa inteira | US$ 39 (33) | 25% |
| A metade que fica na empresa (operação e Bitcoin) | US$ 78 (67) | 50% |
| Só o que paga custo (operação) | US$ 157 (133) | 100% |

N-DT-05. Fundo de prêmios, quanto entra em cada cenário (`2E` 6.1; INFERÊNCIA):

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Entra no mês 12 | 287 | 1.913 | 9.563 |
| Entra no mês 24 | 191 | 4.781 | 31.875 |
| Entrou em 12 meses | 2.725 | 12.431 | 62.156 |
| Entrou em 24 meses | 5.546 | 54.028 | 321.938 |
| Pote médio no mês 12 (volume ÷ perguntas) | 5.625 | 18.750 | 37.500 |

N-DT-06. Fundo de prêmios, regra dos três sinais (`2E` 6.3; INFERÊNCIA; os limites, fora 39 e 20%, são premissa).
Medidos a cada trimestre, depois de 40 perguntas com prêmio sorteado:

| Sinal | Como se mede | Verde | Vermelho |
|---|---|---|---|
| Volume adicional por dólar de prêmio | (volume das perguntas com prêmio − volume de perguntas parecidas sem prêmio) ÷ prêmio | 39 ou mais | Abaixo de 20 |
| Retorno sem prêmio | Parcela das carteiras novas que aposta de novo, em 30 dias, numa pergunta sem prêmio | 20% ou mais | Abaixo de 10% |
| Colheita | Parcela do prêmio que foi para carteiras que apostaram nos dois lados | Até 20% | Acima de 50% |

Decisão: três verdes, aumentar; nenhum vermelho, manter (gasta até metade da parcela); qualquer vermelho, cortar
(só o mínimo para abrir potes). Nos primeiros 90 dias: US$ 7.500 postos pelos sócios, em prêmios de abertura de até
3% do pote, em metade das perguntas, sorteadas.

N-DT-07. Fundo de prêmios, exemplos (INFERÊNCIA; conferidos):

- Medição (`1F` 5.5): prêmio de US$ 300. Perguntas parecidas sem prêmio fazem US$ 4.000. Se esta fez US$ 15.000, o
  adicional é 11.000 e a taxa adicional, 330: pagou-se por pouco. Se fez US$ 8.000, o adicional é 4.000, a taxa
  adicional é 120 e o fundo perdeu 180.
- Colheita (`1G` 4.3): pote vazio recebe 100 de prêmio neutro; alguém aposta 1 no SIM e 1 no NÃO; qualquer que seja
  o resultado, recebe 97% de 102, isto é, 98,94 por 2 apostados.
- Limite (`2E` 6.2): o fundo inteiro dá para pôr o prêmio no teto de 3% do pote em uma de cada cinco perguntas.

N-DT-08. Fundo de prêmios, precedentes (`1F` 5.2 e 5.3; FATO SECUNDÁRIO): a Polymarket pagou US$ 22,90 mi em
recompensa de liquidez de janeiro a 7/set/2026; a Kalshi, US$ 2,95 mi em 30 dias; predict.fun fez competição de
US$ 2 mi em 39 dias; Myriad, de US$ 100 mil. Retorno medido de prêmios (apostador novo e retenção por dólar): não
encontrado em nenhuma plataforma. Usos propostos, do mais ao menos defensável: abrir o pote (prêmio pequeno para o
primeiro apostador), garantir pote mínimo, torneio por acerto, indicação com trava.

N-DT-09. Tesouraria em Bitcoin, precedentes (`1F` 6.1):

| Quem | Percentual e base | O que aconteceu | Etiqueta |
|---|---|---|---|
| Tether | Até 15% do lucro líquido | US$ 1,5 bi em BTC em mar/2023 | FATO SECUNDÁRIO |
| Block | 10% do lucro bruto dos produtos de bitcoin, todo mês | Primeira compra de US$ 4,4 mi (abr/2024) | FATO |
| Méliuz (Brasil) | Até 10% do caixa | 45,72 BTC a preço médio de US$ 90.926 (mar/2025) | FATO |
| Strategy | Sem percentual fixo; comprado com dívida e ações | 847.363 BTC a preço médio de US$ 75.651; perda não realizada de US$ 14,46 bi no 1º tri/2026 | FATO SECUNDÁRIO |
| Metaplanet | Sem percentual fixo | 43.000 BTC custaram US$ 4,07 bi e valiam US$ 2,5 bi em 30/jun/2026 (38% abaixo do custo) | FATO SECUNDÁRIO |
| Baked Market | 25% da taxa bruta, antes de qualquer custo | Decisão (D-27) | Decisão |

Protocolo de aposta ou de previsão que mande percentual fixo da taxa para Bitcoin: não encontrado. Preço do Bitcoin:
perto de US$ 58.800 no fim de jun/2026 e de US$ 63.800 em 12/ago/2026 (FATO SECUNDÁRIO, Decrypt e CoinGape, via `1F`).

N-DT-10. Tesouraria em Bitcoin, quanto se acumula no regime (a) (`2E` 7.1 e 7.2; INFERÊNCIA):

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Comprado em 12 meses, a preço de custo | 2.725 | 12.431 | 62.156 |
| Comprado em 24 meses, a preço de custo | 5.546 | 54.028 | 321.938 |
| Em unidades, a US$ 63.800 | 0,09 | 0,85 | 5,05 |
| Perda com queda de 50% depois de 24 meses | 2.773 | 27.014 | 160.969 |

Exemplo simples (`1F` 6.2, sem saídas): com US$ 1 milhão apostado por mês, US$ 7.500 por mês vão para Bitcoin,
US$ 90.000 por ano; uma queda de 38% tira US$ 34.200. No razoável, a perda de US$ 27 mil equivale a nove meses do
custo do nível 1.

N-DT-11. Tesouraria em Bitcoin, a conta do red team (`2B` 6.2; INFERÊNCIA): se o volume sobe em linha reta até o
equilíbrio em T meses, o déficit acumulado da operação e o valor enviado ao Bitcoin são iguais (custo × T ÷ 2).
Exemplo: custo de US$ 10.000 e 18 meses dão US$ 90.000 de déficit e US$ 90.000 em Bitcoin.

N-DT-12. Como guardar Bitcoin a partir de Solana (`1F` 6.3). Token que representa Bitcoin dentro de Solana: cbBTC
(guardado pela Coinbase, que pode congelar endereços; 3.582 BTC em Solana em set/2025), WBTC, zBTC, tBTC (FATO
SECUNDÁRIO; números com mais de um ano). Bitcoin nativo fora de Solana: multiassinatura própria ou custodiante; a
conversão passa por corretora que pede a identificação da empresa e a origem dos recursos. Proposta em etapas
(INFERÊNCIA): acumular em USDC numa conta pública; trocar por cbBTC uma vez por mês, em data fixa, e guardar em cofre
multiassinatura público; acima de um teto (exemplo: 1 BTC), resgatar para Bitcoin nativo; regra escrita de venda.

N-DT-13. Recompra e queima, precedentes (`1F` seção 7; `1G` 5.3; `1E`):

| Caso | Número | Data | Etiqueta |
|---|---|---|---|
| Jupiter | Mais de US$ 70 mi em 2025, metade da receita; cobriu cerca de 6% dos tokens desbloqueados; token 89% abaixo do pico | jan/2026 | FATO SECUNDÁRIO |
| Helium | Parou a recompra em 2/jan/2026: o mercado não reagia | jan/2026 | FATO SECUNDÁRIO |
| pump.fun (PUMP), foto 1 | Mais de US$ 230 mi em 2025; token 72% abaixo do pico e 41% abaixo do preço da oferta | jan/2026 | FATO SECUNDÁRIO |
| pump.fun (PUMP), foto 2 | 162,72 bi de PUMP destruídos (mais de 16% da oferta máxima); preço de US$ 0,004684, 17% acima do preço de venda de US$ 0,004 | 28/ago e 21/set/2026 | FATO SECUNDÁRIO (Blockworks) |
| Raydium | Mais de US$ 200 mi desde o início; manteve o programa | jan/2026 | FATO SECUNDÁRIO |
| Tokens de mercados de previsão | LMTS −94%; PNP −93%; UMA −99% | out/2026 | FATO SECUNDÁRIO |

Regra que sai dos casos (INFERÊNCIA de `1F`): recompra só reduz a oferta se for maior que os desbloqueios e emissões
do mesmo período.

N-DT-14. Recompra do Baked contra os desbloqueios (`2B` 7.2; INFERÊNCIA sobre a distribuição proposta por `1G` e a
avaliação de exemplo de US$ 5 milhões):

| Período depois do lançamento do token B | Tokens destravados por mês | Em dólares |
|---|---|---|
| Meses 1 a 3 | 0,83% da oferta | US$ 41,7 mil |
| Meses 4 a 6 | 1,53% | US$ 76,4 mil |
| Meses 7 a 9 | 3,01% | US$ 150,7 mil |
| Meses 10 a 18 | 2,18% | US$ 109,0 mil |

Com US$ 1 milhão apostado por mês, a recompra é de US$ 7.500 por mês e cobre de 5% a 18% dos desbloqueios. A recompra
só iguala os desbloqueios dos meses 4 a 6 com US$ 10,2 milhões apostados por mês.

N-DT-15. Avaliação que a recompra sustenta, se o comprador exigir que a recompra anual represente 20% do valor do
token (`2E` seção 5; fator 0,3825 × volume mensal; INFERÊNCIA): mês 12, ruim US$ 17.213, razoável US$ 114.750,
otimista US$ 573.750; mês 24, ruim US$ 11.475, razoável US$ 286.875, otimista US$ 1.912.500. Nem o otimista do mês 24
sustenta a avaliação de exemplo de US$ 5 milhões; para isso seriam precisos cerca de US$ 11 milhões apostados por mês
sem saídas (`2B` 7.3) ou cerca de US$ 13 milhões com as premissas de saída (conta minha: 5.000.000 ÷ 0,3825).

N-DT-16. Outras formas de receita (`1F` seção 1; `2E` 3.5). Resposta ao fundador: os líderes têm outras linhas, mas a
taxa é a única com peso comprovado (100% da receita bruta da Polymarket medida on-chain em 2026; única linha com
número na Kalshi).

| Forma | Quem faz | Cabe no Baked? |
|---|---|---|
| Venda e licenciamento de dados | Polymarket (ICE), Kalshi (CNBC, CNN) | Depois; precisa de volume. Valores não divulgados |
| Juros do dinheiro parado | Kalshi | Não (D-06) |
| Contratos perpétuos e alavancagem | Kalshi, Polymarket | Não; é outro produto |
| Taxa de construtor (front-end de terceiros) | Polymarket (até 1%) | Depois, como canal de distribuição |
| Indicação e afiliados | Polymarket, cassinos cripto | Sim, mas é custo de aquisição |
| Patrocínio de pergunta | Ninguém entre os líderes | Sim: é a segunda trilha |
| Taxa de depósito e saque | Kalshi (até 2% em cartão), PredictIt (5% no saque) | Não; a carteira é do usuário |
| Assinatura profissional | Só terceiros (US$ 15 a 299 por mês) | Depois, e pequeno |
| Taxa de análise de quem pede pergunta | Derivação | Alternativa; conflita em parte com "se for recusado devolve" |
| Fatia da penalidade de saída para a banca | Derivação | Não decidido. Com 20% da penalidade, renderia 1,0% do volume: razoável US$ 3.000 no mês 12 e US$ 7.500 no mês 24 (`2E` 3.5) |
| Taxa de criador do token do pump.fun | pump.fun paga ao criador | De 0,05% a 0,95% do volume do token; proposta de `1G`: inteira para o fundo de prêmios |

### 4.7 Modelo financeiro: premissas e cenários (N-FC)

Tudo nesta seção vem de `2E` e é INFERÊNCIA. Nenhum número de volume, carteira, patrocinador, receita ou caixa é dado
medido. "M1" é o primeiro mês com dinheiro real na rede principal. O modelo não tem impostos, custo de aquisição
paga nem a venda privada do token como receita.

N-FC-01. Premissas (o capítulo 9 reproduz esta tabela):

| Premissa | Valor | Origem | Fragilidade |
|---|---|---|---|
| Taxa | 3% do pote final | Decisão (D-26) | Firme; a forma é contestada (OBJ-07) |
| Parcela da operação | 25% da taxa | Decisão (D-27) | Firme; é a que mais pesa |
| Dinheiro que sai antes da resolução | 20% do apostado | Premissa sem dado (`2B`) | Muito alta |
| Penalidade média de quem sai | 25% | Premissa sem dado (`2B`) | Muito alta |
| Pote final como parte do apostado | 85% | Conta sobre as duas linhas acima | Herda a fragilidade |
| Taxa sobre o valor devolvido na saída | Não cobrada | Leitura literal de D-08 | Em aberto |
| Depósito por carteira ativa por mês | US$ 150 (ruim), 200 (razoável), 250 (otimista) | Premissa sem dado | Muito alta |
| Subida do volume | Linha reta até o mês 12 e outra até o mês 24 | Premissa sem dado | Muito alta: concorrentes mostram picos e quedas de 80% a 96% |
| Perguntas abertas por mês | 8 (ruim); 8 a 24 (razoável); 12 a 80 (otimista) | Premissa sem dado | Alta |
| Duração média entre a aposta e a resolução | 14 dias | Premissa sem dado | Alta |
| Patrocinadores por mês | Zero (ruim); até 5, mais um de US$ 5.000 por trimestre (razoável); até 12 (otimista) | Premissa sem dado | Muito alta: não há precedente pago |
| Destino da parte da banca no patrocínio | 100% para a operação | Recomendação de `2B`; não é decisão | Em aberto |
| Custo do nível 1 (ninguém recebe) | US$ 3.000 por mês: auditoria (reserva) 1.700; infraestrutura 650; jurídico e contábil 650 | `2B` 2.1 | Média |
| Custo do nível 2 (equipe enxuta) | US$ 10.000 por mês: o nível 1, mais equipe 5.000 e comunidade 2.000 | `2B` 2.1 | Alta |
| Custo do nível 3 | US$ 25.000 por mês: equipe 16.000; auditoria 2.500; infraestrutura 1.300; jurídico 1.200; marketing 4.000 | `ECONOMICS.md` do sócio ("placeholder"); a divisão é de `2E` | Alta |
| Quando a equipe sobe de nível | Nível 2 depois de três meses seguidos com US$ 400 mil apostados; nível 3 depois de três meses com US$ 1,57 milhão | `2B` e `2E` | Alta |
| Gasto antes do lançamento | US$ 51.500: auditoria 30.000; empresa 4.000; avaliação jurídica 10.000; prêmios iniciais 7.500. Faixa: 30 a 75 mil | `2B` seção 9; pontos médios de `2E` | Alta (AC-09) |
| Reserva | Seis meses do custo do nível 1: US$ 18.000 | `2B` | Média |

N-FC-02. Fórmulas (`2E` 1.3): volume = carteiras ativas × depósito por carteira; pote final = volume × 85%; taxa =
pote final × 3% (2,55% do volume); cada parcela = taxa ÷ 4 (0,6375% do volume); banca no patrocínio = patrocínio
bruto × 70% (sentido A) ou × 30% (sentido B); receita total = taxa + banca no patrocínio; dinheiro da operação =
parcela da operação + banca no patrocínio; caixa acumulado = −51.500 + soma dos resultados.

N-FC-03. Os três cenários (`2E` 3.1):

| | Ruim | Razoável | Otimista |
|---|---|---|---|
| Carteiras ativas | 50 no mês 1; 300 do mês 6 ao 12; caem para 200 no mês 24 | 125 a mais por mês até 1.500 no mês 12; 3.750 no mês 24 | 500 a mais por mês até 6.000 no mês 12; 20.000 no mês 24 |
| Depósito por carteira por mês | US$ 150 | US$ 200 | US$ 250 |
| Volume no mês 12 | US$ 45 mil | US$ 300 mil | US$ 1,5 milhão |
| Volume no mês 24 | US$ 30 mil | US$ 750 mil | US$ 5 milhões |
| Régua no mês 12 | Taxa de US$ 1.148 no mês, perto dos US$ 1.319 que a Myriad arrecadou em 30 dias | 1,9% do World de set/2026; 2,8% do Limitless de set/2026 | 9,7% do World; 14% do Limitless de set/2026 |
| Régua no mês 24 | Volume de 24 meses (US$ 870 mil) igual a 3,3 vezes tudo o que os mercados de pump.fun somaram na Polymarket | 4,9% do World; 7,0% do Limitless; 14% da Jupiter | 32% do World; 47% do Limitless; 91% da Jupiter |
| Dinheiro travado no mês 24, com perguntas de 14 dias | US$ 14 mil | US$ 350 mil, 2 vezes o World | US$ 2,33 milhões, 13,7 vezes o World |
| O que precisa ser verdade | O produto funciona e quase ninguém volta | Um nicho pequeno e fiel, sem distribuição paga | Um canal de distribuição (integração com carteira) que hoje não existe |

O cenário ruim não é o piso. O piso é o do PNP: volume perto de zero.

N-FC-04. Trajetória, por mês selecionado (`2E` 3.2 a 3.4). "A" e "B" são os sentidos do 70/30.

| Cenário | Mês | Carteiras ativas | Volume apostado | Taxa (3% do pote final) | Receita total, A | Receita total, B |
|---|---|---|---|---|---|---|
| Ruim | 3 | 150 | 22.500 | 574 | 574 | 574 |
| Ruim | 6 | 300 | 45.000 | 1.148 | 1.148 | 1.148 |
| Ruim | 12 | 300 | 45.000 | 1.148 | 1.148 | 1.148 |
| Ruim | 24 | 200 | 30.000 | 765 | 765 | 765 |
| Razoável | 3 | 375 | 75.000 | 1.913 | 1.913 | 1.913 |
| Razoável | 6 | 750 | 150.000 | 3.825 | 4.175 | 3.975 |
| Razoável | 12 | 1.500 | 300.000 | 7.650 | 9.400 | 8.400 |
| Razoável | 24 | 3.750 | 750.000 | 19.125 | 22.275 | 20.475 |
| Otimista | 3 | 1.500 | 375.000 | 9.563 | 9.913 | 9.713 |
| Otimista | 6 | 3.000 | 750.000 | 19.125 | 20.875 | 19.875 |
| Otimista | 12 | 6.000 | 1.500.000 | 38.250 | 46.300 | 41.700 |
| Otimista | 24 | 20.000 | 5.000.000 | 127.500 | 140.800 | 133.200 |

N-FC-05. Quadro-resumo de 24 meses (`2E` 3.6; conferido por soma):

| | Ruim | Razoável, A | Razoável, B | Otimista, A | Otimista, B |
|---|---|---|---|---|---|
| Volume somado, 12 meses | 427.500 | 1.950.000 | 1.950.000 | 9.750.000 | 9.750.000 |
| Volume somado, 24 meses | 870.000 | 8.475.000 | 8.475.000 | 50.500.000 | 50.500.000 |
| Taxa somada, 24 meses | 22.185 | 216.113 | 216.113 | 1.287.750 | 1.287.750 |
| Banca no patrocínio, 24 meses | 0 | 63.350 | 27.150 | 214.200 | 91.800 |
| Patrocínio que foi aos potes, 24 meses | 0 | 27.150 | 63.350 | 91.800 | 214.200 |
| Custo operacional, 24 meses | 72.000 | 121.000 | 121.000 | 333.000 | 333.000 |
| Caixa no mês 24, regime (a) | −117.954 | −55.122 | −91.322 | 151.638 | 29.238 |
| Caixa no mês 24, regime (b) | −106.861 | −34.344 | −51.130 | 154.547 | 36.434 |

N-FC-06. Patrocinadores supostos em cada cenário (`2E` 3.2 a 3.4): ruim, nenhum. Razoável: nenhum nos meses 1 a 3;
um de US$ 500 por mês nos meses 4 a 6; dois de 500 e um de 1.500 por mês nos meses 7 a 12; três de 500 e dois de
1.500 por mês no segundo ano, mais um de 5.000 por trimestre. Otimista: um de 500 por mês nos meses 1 a 3; dois de
500 e um de 1.500 nos meses 4 a 6; quatro de 500, três de 1.500 e um de 5.000 por mês nos meses 7 a 12; seis, quatro
e dois por mês no segundo ano.

N-FC-07. Custo por cenário (`2E`): ruim, nível 1 nos 24 meses. Razoável: nível 1 até o mês 17 e nível 2 a partir do
mês 18. Otimista: nível 1 até o mês 6, nível 2 do mês 7 ao 15, nível 3 a partir do mês 16.

N-FC-08. Economia de uma pergunta (`2E` seção 2; INFERÊNCIA; conferida). É o exemplo completo obrigatório do
capítulo 7. Pergunta: "O token T queima 50% da oferta até o dia 30?".

- O fundo de prêmios abre o pote com US$ 150, sem lado.
- Apostas: SIM 6.000 (Ana 1.000, Bruno 1.000, outros 4.000); NÃO 4.000 (Carla 1.500, outros 2.500). Total: 10.000.
- Patrocinador: faixa de US$ 1.500, como prêmio neutro. Sentido A: 1.050 para a banca e 450 ao pote. Sentido B: 450
  e 1.050.
- Saída: no dia 15 o Bruno sai. Penalidade pela fórmula proposta: 5% + 20% × 50% + 3,51% = 18,51%, ou 185,09. Ele
  recebe 814,91; os 185,09 ficam no pote.
- Dá SIM.

| Linha | Sentido A | Sentido B |
|---|---|---|
| Apostas que ficaram (SIM 5.000, NÃO 4.000) | 9.000,00 | 9.000,00 |
| Penalidade do Bruno | 185,09 | 185,09 |
| Prêmio do patrocinador | 450,00 | 1.050,00 |
| Prêmio do fundo | 150,00 | 150,00 |
| Pote final | 9.785,09 | 10.385,09 |
| Taxa de 3% | 293,55 | 311,55 |
| Vai para quem acertou | 9.491,54 | 10.073,54 |
| Cada US$ 1 no SIM recebe | 1,8983 | 2,0147 |
| Ana (pôs 1.000) recebe | 1.898,31 | 2.014,71 |
| Cada parcela da taxa (25%) | 73,39 | 77,89 |
| Parte da banca no patrocínio | 1.050,00 | 450,00 |
| Total da casa nesta pergunta | 1.343,55 | 761,55 |
| Dinheiro que paga custo (operação + banca) | 1.123,39 | 527,89 |

Sem prêmio, patrocinador nem saída, o mesmo pote pagaria 1,6167 por dólar no SIM. Conferência: entram 11.650
(apostas 10.000, patrocínio 1.500, fundo 150) e saem 11.650 nos dois sentidos.

### 4.8 Equilíbrio, capital e sensibilidades (N-FK)

Tudo de `2E` (e de `2B` onde indicado). INFERÊNCIA.

**Regime (a):** a taxa se divide em quatro desde o primeiro dia. É a decisão (D-27) aplicada sem condição.
**Regime (b):** a "regra de partida" do red team (OBJ-09). O destino final é o do fundador; muda a ordem: enquanto a
parte da operação não paga o custo, as parcelas de Bitcoin e de recompra cobrem a diferença, com registro; o que
sobra delas fica em USDC, em conta pública; quando a operação cobre o custo por três meses seguidos e há seis meses
de custo guardados, o excedente segue para Bitcoin e recompra. O fundo de prêmios recebe os seus 25% nos dois.

N-FK-01. Volume de equilíbrio por mês, sem patrocínio (`2E` 4.2; `2B` 2.2):

| Nível de custo | Custo por mês | Regime (a) | Regime (b) | Regime (a), sem saída antecipada | Regime (b), sem saída antecipada |
|---|---|---|---|---|---|
| 1. Ninguém recebe | 3.000 | 470.588 | 156.863 | 400.000 | 133.333 |
| 2. Equipe enxuta | 10.000 | 1.568.627 | 522.876 | 1.333.333 | 444.444 |
| 3. Número do sócio | 25.000 | 3.921.569 | 1.307.190 | 3.333.333 | 1.111.111 |

Conta: custo ÷ 0,6375% no regime (a); custo ÷ 1,9125% no regime (b); sem saídas, 0,75% e 2,25%. No texto corrido:
"US$ 471 mil, 1,57 milhão e 3,92 milhões por mês". Régua: US$ 3,33 milhões é 22% do que o World fez em set/2026.

N-FK-02. Primeiro mês no azul e caixa mínimo (`2E` 4.3; plano de custo por marco):

| Cenário | Sentido | Regime (a): primeiro mês no azul | Regime (a): caixa mínimo | Regime (b): primeiro mês no azul | Regime (b): caixa mínimo |
|---|---|---|---|---|---|
| Ruim | A = B | Não chega | −117.954 no mês 24, ainda caindo | Não chega | −106.861 no mês 24, ainda caindo |
| Razoável | A | Mês 8 | −65.237 no mês 7 | Mês 6 | −58.628 no mês 5 |
| Razoável | B | Mês 13 | −91.322 no mês 24, ainda caindo | Mês 6 | −59.028 no mês 5 |
| Otimista | A | Mês 4 | −54.669 no mês 3 | Mês 2 | −51.759 no mês 1 |
| Otimista | B | Mês 4 | −55.269 no mês 3 | Mês 2 | −51.959 no mês 1 |

Leitura fixada: no razoável, o regime (a) empata e depois volta ao déficit no mês 18, quando a equipe passa a
receber; no regime (b) não há recaída. No otimista os dois regimes dão quase no mesmo.

N-FK-03. Capital necessário (`2E` seção 5): gasto antes do lançamento (51.500) + déficits cobertos pelos sócios em
24 meses + reserva (18.000).

| Cenário | Sentido | Regime (a): sem reserva | Regime (a): com reserva | Regime (b): sem reserva | Regime (b): com reserva |
|---|---|---|---|---|---|
| Ruim | A = B | 117.954 | 135.954 | 106.861 | 124.861 |
| Razoável | A | 65.238 | 83.238 | 58.628 | 76.628 |
| Razoável | B | 91.322 | 109.322 | 59.028 | 77.028 |
| Otimista | A | 54.669 | 72.669 | 51.759 | 69.759 |
| Otimista | B | 55.269 | 73.269 | 51.959 | 69.959 |

No texto: "de US$ 70 a 110 mil com reserva nos cenários razoável e otimista; de US$ 125 a 136 mil no ruim". O
pré-lançamento é de 56% a 88% do capital sem reserva no razoável. A tabela não inclui o parecer jurídico do segundo
token (US$ 15 a 50 mil, fonte fraca), um segundo desenvolvedor por contrato nem reembolso por falha de resolução.

N-FK-04. Uso dos recursos (tabela obrigatória do capítulo 9; razoável, sentido A, regime (a); soma de N-FK-03):
antes do lançamento US$ 51.500 (auditoria 30.000; empresa 4.000; avaliação jurídica 10.000; prêmios iniciais 7.500);
déficits cobertos em 24 meses US$ 13.738; reserva de seis meses US$ 18.000; total US$ 83.238.

N-FK-05. Se o custo for fixo desde o primeiro mês (`2E` 4.4; capital dos sócios, sem reserva):

| Cenário | Custo fixo | Sentido | Regime (a): capital | Regime (b): capital | Regime (a): primeiro mês no azul | Regime (b): primeiro mês no azul |
|---|---|---|---|---|---|---|
| Ruim | 3.000 | A = B | 117.954 | 106.861 | Não chega | Não chega |
| Ruim | 10.000 | A = B | 285.954 | 274.861 | Não chega | Não chega |
| Razoável | 3.000 | A | 65.238 | 58.628 | Mês 8 | Mês 6 |
| Razoável | 10.000 | A | 174.122 | 123.052 | Mês 20 | Mês 14 |
| Razoável | 10.000 | B | 210.322 | 132.234 | Não chega | Mês 14 |
| Razoável | 25.000 | A | 534.122 | 426.066 | Não chega | Não chega |
| Otimista | 10.000 | A | 88.466 | 66.106 | Mês 7 | Mês 4 |
| Otimista | 25.000 | A | 235.022 | 145.213 | Mês 14 | Mês 8 |

N-FK-06. Perda no cenário ruim com critério de parada (`2E` seções 5 e 9): parar no mês 6 limita a perda a
US$ 68.496 no regime (a) e a US$ 66.488 no (b); seguir até o mês 24 leva a US$ 117.954.

N-FK-07. Sensibilidades (`2E` seção 8; uma premissa de cada vez; razoável; "capital" sem reserva):

| Caso | Receita no mês 12 (A / B) | Receita no mês 24 (A / B) | Regime (a): primeiro mês no azul (A / B) | Regime (a): capital (A / B) | Regime (b): capital (A / B) |
|---|---|---|---|---|---|
| Base (taxa de 3%) | 9.400 / 8.400 | 22.275 / 20.475 | 8 / 13 | 65.238 / 91.322 | 58.628 / 59.028 |
| Taxa de 2%, mesmo volume | 6.850 / 5.850 | 15.900 / 14.100 | 12 / 14 | 73.131 / 109.331 | 61.756 / 62.375 |
| Taxa de 4%, mesmo volume | 11.950 / 10.950 | 28.650 / 26.850 | 7 / 11 | 63.988 / 73.313 | 56.775 / 56.975 |
| Volume 50% abaixo | 5.575 / 4.575 | 12.713 / 10.913 | 13 / 14 | 69.734 / 76.909 | 63.430 / 65.042 |
| Sem saída antecipada | 10.750 / 9.750 | 25.650 / 23.850 | 7 / 12 | 64.513 / 81.788 | 57.525 / 57.763 |
| Saídas de 40% do dinheiro | 8.050 / 7.050 | 18.900 / 17.100 | 10 / 13 | 66.294 / 100.856 | 60.181 / 60.781 |
| Banca do patrocínio dividida em quatro | 9.400 / 8.400 | 22.275 / 20.475 | 14 / 14 | 102.634 / 111.684 | 58.803 / 59.122 |
| Sem nenhum patrocinador | 7.650 | 19.125 | 17 | 118.472 | 59.459 |
| Teto da taxa pelo lado perdedor (taxa média de 2,3%) | 7.615 / 6.615 | 17.813 / 16.013 | 11 / 13 | 67.728 / 103.928 | 60.752 / 61.352 |

Empates: a taxa de 2% rende o mesmo que a de 3% se trouxer 50% mais volume; a de 4% rende o mesmo se perder até 25%
do volume; o teto pelo lado perdedor se paga se trouxer 30% mais volume. Ninguém mediu quanto o volume muda com a
taxa num pote.

N-FK-08. Fração da taxa que vai para a operação, regime (a), razoável (`2E` 8.2): com 25% (decisão), primeiro mês no
azul 8 (A) ou 13 (B) e resultado no mês 24 de −2.069 ou −3.869; com 50%, meses 7 ou 8 e resultado de +2.713 ou +913;
com 75% (igual à regra de partida), mês 6 e +7.494 ou +5.694; com 100%, mês 5 e +12.275 ou +10.475. Nenhuma fração
salva o cenário ruim.

N-FK-09. O pote não gira o dinheiro (`2B` 2.4; `2E` 8.3). Dinheiro travado necessário para pagar cada nível de
custo, regime (a), sem patrocínio:

| Duração média da pergunta | Nível 1 | Nível 2 | Nível 3 |
|---|---|---|---|
| 3 dias | 47.059 | 156.863 | 392.157 |
| 7 dias | 109.804 | 366.013 | 915.033 |
| 14 dias | 219.608 | 732.026 | 1.830.065 |
| 30 dias | 470.588 | 1.568.627 | 3.921.569 |

Régua: o World tem US$ 170,8 mil travados. Com perguntas de 30 dias, pagar o nível 2 pede nove vezes isso; com
perguntas de 3 dias, menos do que o World tem hoje.

N-FK-10. Quanto vale um apostador (`2B` 8.1; INFERÊNCIA, premissa sem dado: US$ 200 por mês durante seis meses):
total apostado US$ 1.200; taxa gerada US$ 36; parte que paga custo US$ 9. Custos de aquisição documentados em cripto
(FATO SECUNDÁRIO, 2021 a 2023): Coinbase US$ 77; airdrop da Optimism cerca de US$ 600 por endereço; airdrop da
Arbitrum US$ 2.175 a 2.500. Para um custo de US$ 77 se pagar só com a parte da operação, o apostador teria de apostar
US$ 10.267 na vida. Carteiras necessárias a US$ 200 por mês, sem saídas: 2.000, 6.667 e 16.667 para os três níveis.

N-FK-11. Custos fora do modelo mensal (`2B` seção 9):

| Custo | Faixa | Etiqueta |
|---|---|---|
| Auditoria do programa | US$ 7 a 20 mil (programa simples); US$ 20 a 60 mil (protocolo padrão); primeira auditoria estimada em US$ 15 a 45 mil | FATO SECUNDÁRIO (blogs de empresas de auditoria; AC-09) |
| Acesso à rede (RPC, Helius) | US$ 49, 499 ou 999 por mês | FATO (página oficial, 4/out/2026) |
| Empresa no exterior | Abertura de US$ 1,5 a 6 mil; manutenção de US$ 1 a 2,5 mil por ano | FATO SECUNDÁRIO (prestadores) |
| Avaliação jurídica do produto e dos termos | US$ 5 a 15 mil | Fonte fraca |
| Parecer jurídico do token | US$ 15 a 50 mil | Fonte fraca |
| Licença de jogo no exterior | Ilha de Man: 5.250 libras de pedido e 36.750 por ano; Curaçao: 4.592 euros de pedido e 47.450 por ano | FATO SECUNDÁRIO (`2D` 8.3, fonte comercial) |
| Soma antes do primeiro dólar de taxa | US$ 30 a 75 mil | INFERÊNCIA |

### 4.9 Metas de 90 dias (N-FM)

Resposta ao pedido D-43. Fonte: `2E` seção 9. As linhas de volume, carteiras, taxa e pote médio saem dos cenários
(meses 1 a 3); as de retorno, potes de um lado só e volume por dólar de prêmio são premissa sem dado.

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

Réguas: o World fez US$ 1,14 mi no primeiro mês, dentro da Phantom; a meta razoável de 90 dias é 57% de tudo o que
os mercados de pump.fun somaram na Polymarket; a otimista é 66% do primeiro mês do World.

Critério de parada proposto (INFERÊNCIA): se aos 180 dias o volume do mês for de até US$ 45 mil e o retorno sem
prêmio estiver abaixo de 10%, o cenário é o ruim, que não se paga em nenhum regime. O critério deve ser escrito antes
do lançamento. O número que decide, em todos os cenários, é quantas carteiras voltam sem prêmio.

### 4.10 Público web3 e pump.fun (N-PF)

| ID | Número | Valor | Data | Fonte | Etiqueta |
|---|---|---|---|---|---|
| N-PF-01 | Endereços ativos em Solana por semana | 27,1 milhões (sem filtro de robôs) | semana até 18/jan/2026 | `1D` (Nansen, via BlockEden) | FATO SECUNDÁRIO |
| N-PF-02 | Usuários ativos por dia em Solana | cerca de 4,3 milhões | 2026, sem data exata | `1D` | FATO SECUNDÁRIO, fonte fraca |
| N-PF-03 | pump.fun, carteiras únicas acumuladas e volume vitalício | 80 milhões de carteiras; mais de US$ 214 bi | jun/2026 | `1D` (The Block) | FATO SECUNDÁRIO |
| N-PF-04 | pump.fun, carteiras ativas por mês | pico de 5,2 mi (mai/2025); 1,8 mi (dez/2025) | 2025 | `1D` | FATO SECUNDÁRIO, fonte fraca |
| N-PF-05 | pump.fun, volume diário médio em 30 dias | cerca de US$ 347 mi | jun/2026 | `1D` (The Block) | FATO SECUNDÁRIO |
| N-PF-06 | pump.fun, receita diária | US$ 800 mil, contra US$ 4,8 mi seis meses antes | jun/2026 | `1D` (The Block) | FATO SECUNDÁRIO |
| N-PF-07 | pump.fun, taxa de formatura (tokens que completam a curva) | 0,26% (média de 7 dias); histórica de cerca de 1,4% | jun/2026 | `1D` (The Block, Dune) | FATO SECUNDÁRIO |
| N-PF-08 | pump.fun, receita de 2025 | US$ 971,37 mi | 29/abr/2026 | `modelos-de-token.md` (CoinDesk) | FATO SECUNDÁRIO |
| N-PF-09 | Pessoas reais (não carteiras) por dia no pump.fun | não encontrado | — | `1D` | não encontrado |
| N-PF-10 | Tamanho típico de aposta e frequência em plataformas on-chain | não encontrado | — | `1D` | não encontrado |
| N-PF-11 | Perfis de usuário (trader de memecoin, comunidade de um token, formador de opinião do X, equipe de projeto) | hipótese; nenhuma entrevista | out/2026 | `1D` seção 3 | INFERÊNCIA (premissa sem dado) |
| N-PF-12 | Cripto como porta de entrada na Polymarket | cerca de 40% da atividade inicial dos novos usuários | 1º tri/2026 | `1D` (The Defiant) | FATO SECUNDÁRIO |
| N-PF-13 | Limitless, origem dos usuários | cerca de 60% Ásia-Pacífico e 30% Europa | 2026 | `1D` | FATO SECUNDÁRIO |
| N-PF-14 | Preço de influenciadores | micro-influenciador cerca de US$ 500 por publicação; lançamento de token de US$ 40 mil a 150 mil | 2026 | `1D` (blogs de agência) | Fonte fraca |
| N-PF-15 | Leitura de menções no X por API | US$ 0,005 por publicação lida; a linha do tempo embutida é gratuita | 3/out/2026 | `briefing` seção 10; `privacidade-entre-redes-e-x.md` | FATO |

Regras do pump.fun para quem lança um token (N-PF-16 a N-PF-21; `briefing` 7.1; `modelos-de-token.md`; `1H` 4.4):

| ID | Regra | Etiqueta |
|---|---|---|
| N-PF-16 | 1 bilhão de tokens; 793,1 milhões na curva; sem reserva de equipe e sem trava | FATO (repositório oficial) |
| N-PF-17 | De cada compra na curva: 98,75% para a reserva da curva, 0,95% para o pump.fun e 0,30% para o criador (taxa total de 1,25%) | FATO (página de taxas, 20/mai/2026) |
| N-PF-18 | Depois da formatura, a taxa do criador vai de 0,95% a 0,05% do volume, conforme o valor de mercado; o pico de 0,95% vale entre 420 e 1.470 SOL de valor de mercado | FATO (idem) |
| N-PF-19 | A taxa do criador pode ser dividida entre até 10 carteiras; a divisão é definida uma única vez. "Holder Rewards": a taxa do criador inteira vai para quem segura o token, paga pelo pump.fun; é irreversível | FATO (`briefing` 7.1) |
| N-PF-20 | Completar uma curva do zero exige cerca de 85 SOL; o valor de mercado vai de 28 SOL na criação a 411 SOL na formatura | INFERÊNCIA (`1H` 4.4, sobre os parâmetros públicos) |
| N-PF-21 | Os tokens novos são Token-2022, com metadados no próprio token e autoridades revogadas: 7 de 7 na amostra lida na rede em 3/out/2026 | FATO (amostra pequena) |

### 4.11 Tokens (N-TK)

N-TK-01. Nomes: **token A** é o do pump.fun; **token B** é o da venda privada ("ICO privado", nas palavras do
fundador). Tudo o que segue sobre distribuição, travas e cronograma é proposta de `1G` (INFERÊNCIA), não decisão.

N-TK-02. A conta dos 30% como taxa do token (`1G` 4.1; INFERÊNCIA; premissas: pool com 100.000 USDC e 10 milhões de
tokens, preço de US$ 0,01, compra de 1.000 USDC):

| Taxa do token | Tokens que o comprador recebe | USDC que chega às pools das perguntas | Valor do que o comprador tem | Se revender na hora, recebe | Alta de preço para empatar |
|---|---|---|---|---|---|
| 0% | 99.010 | 0 | 1.010 | 1.000 | 0% |
| 1% | 98.020 | 10 | 1.000 | 980 | 2,0% |
| 5% | 94.059 | 50 | 959 | 902 | 10,8% |
| 10% | 89.109 | 101 | 907 | 810 | 23,5% |
| 30% | 69.307 | 302 | 703 | 490 | 104,1% |

Leitura fixada: com 30%, quem paga 1.000 fica com 703 de valor e, se revender, com 490 (0,70 × 0,70 = 0,49). A taxa
é cobrada em token, em toda transferência (inclusive no saque de quem comprou na venda privada), e a tesouraria tem
de vender o token para ter USDC. Taxa permanente acima de 10%: nenhum caso encontrado. Faixa que o mercado de Solana
aceita: 1% a 2%.

N-TK-03. Alternativas para o mesmo objetivo (`1G` 4.2):

| Desenho | O comprador paga 1.000 e recebe | O que as pools recebem | Quem paga |
|---|---|---|---|
| A. Taxa de 30% no token (Token-2022) | 703 (490 se revender) | 302 por 1.000 comprados | O comprador, duas vezes |
| B. Taxa de 30% só na compra (curva ou programa próprio) | 700 | 300 por 1.000 | O comprador, uma vez |
| C. 30% do que a venda privada arrecadar, carimbado | 1.000, ao preço da venda | 300 por 1.000 arrecadados, de uma vez | A empresa (fica com 70% do caixa) |
| D. 25% da taxa da plataforma (já decidido, D-27) | Não envolve o token | 0,75% do volume apostado, todo mês | O apostador, dentro dos 3% |
| E. Taxa de criador do token A enviada ao fundo | 987,50 | 0,05% a 0,95% do volume do token | Quem negocia, dentro da taxa normal |

Proposta de `1G`: C mais D, com E como reforço, e sem taxa no token. Exemplo de C: venda de 15% da oferta a uma
avaliação total de US$ 5 milhões (número de exemplo do sócio) arrecada US$ 750.000; 30% são US$ 225.000 no fundo de
prêmios. Exemplo de E: US$ 2 milhões negociados por mês do token A a 0,30% rendem US$ 6.000.

N-TK-04. Distribuição e travas propostas para o token B (`1G` 6.2; soma 100%):

| Fatia | % | Trava |
|---|---|---|
| Venda privada | 15% | 10% no lançamento; depois 6 meses parado e 12 meses de liberação linear |
| Detentores do token A e primeiros apostadores | 10% | 25% no lançamento e o resto em 9 meses, por saldo de A e por taxa paga na plataforma |
| Liquidez travada | 12% | 18 meses parada e 12 de liberação linear |
| Crescimento e comunidade | 25% | 3 meses parado e 36 de liberação linear, em cofre público com teto mensal |
| Equipe | 15% | 18 meses parado e 30 de liberação linear |
| Tesouraria | 13% | 6 meses parado e 36 de liberação linear |
| Reserva para rodadas futuras e listagens | 10% | Travada até decisão pública |

Oferta de 1 bilhão, fixa; token comum, sem taxa de transferência; em circulação no primeiro dia: cerca de 16%.
Destino proposto do dinheiro da venda (exemplo de US$ 750.000): 30% fundo de prêmios (225.000), 30% liquidez travada
(225.000), 40% operação (300.000).

N-TK-05. Ordem proposta por `1G` (6.3): mês 0, produto na rede principal e token A; meses 1 a 4, medição; meses 4 a
6, venda privada do token B; meses 6 a 9, lançamento do token B, distribuição aos detentores de A e início da
recompra. Antes de o token B existir, a parcela da recompra fica em USDC numa conta pública. Referência de intervalo:
PURR para HYPE, 7,5 meses.

N-TK-06. Precedentes de dois tokens (`1G` seção 1):

| Caso | O que fizeram | Resultado | Etiqueta |
|---|---|---|---|
| PURR e HYPE (Hyperliquid) | Memecoin sem venda, sem equipe e sem utilidade declarada; depois, segundo token dado aos usuários; nenhuma conversão | Os dois vivos; a razão PURR/HYPE caiu cerca de 90% | FATO SECUNDÁRIO |
| FLOKI e TokenFi | 56% do segundo token para quem travasse o primeiro | 20% do FLOKI em circulação travado em menos de três semanas; a Bybit retirou o TokenFi por liquidez inicial de US$ 2.000 | FATO e FATO SECUNDÁRIO |
| ai16z para elizaOS | Troca obrigatória; o detentor recebeu 6 de cada 10 unidades novas | Queda de 28,14% em 24 horas na relistagem | FATO e FATO SECUNDÁRIO |
| Padre e PUMP | O pump.fun avisou que o token PADRE perdia a utilidade | Queda de 67%; a empresa voltou atrás | FATO SECUNDÁRIO |
| Pump Pumpkin | Token no pump.fun para ser queimado e trocado por outro | A carteira criadora vendeu em 11 minutos; queda de 92% | FATO SECUNDÁRIO |
| SafeMoon | Taxa de 10% em cada venda, com repasse a detentores e à liquidez | Presidente condenado por fraude em 21/5/2025 (a condenação foi por mentir sobre a liquidez e desviar dinheiro, não pela taxa) | FATO |
| MetaDAO | 20% do USDC de toda venda vai, por regra do programa, para as pools de liquidez | Modelo em uso | FATO |

Não encontrado: plataforma com receita própria que tenha lançado um memecoin no pump.fun e, depois, um segundo token
por venda privada.

N-TK-07. Travas típicas (`1G` 2.5; FATO SECUNDÁRIO): equipe com 1 ano parado e liberação em 4 anos em cerca de 85%
das empresas; equipe e investidores entre 15% e 30% cada. PUMP: venda de 33% da oferta a US$ 0,004 (US$ 1,32 bi
arrecadados, avaliação total de US$ 4 bi), 100% livre no primeiro dia.

N-TK-08. O que os reguladores disseram sobre recompra e repasse (`1G` 5.2; `2D` 3.1). Só descrição; ponto para
advogado.

| Documento | O que diz | Etiqueta |
|---|---|---|
| SEC, perguntas e respostas sobre criptoativos, pergunta 2.5 (publicada em 25/9/2026, alterada em 28/9/2026) | Anunciar recompra não é promessa de esforço gerencial quando o sistema é funcional e não tem parte central; pode ser, se o sistema não é funcional e a recompra é apresentada como rendimento. A página avisa que não tem força de lei | FATO (lido por `1G`; `2D` releu por resumo: AC-12) |
| SEC, declaração sobre meme coins (27/2/2025) | Meme coin com uso limitado ou nenhum não envolve oferta de valor mobiliário; não vale para produto rotulado assim para fugir da lei | FATO (resumo de modelo auxiliar: AC-12) |
| SEC contra DeFi Money Market (6/8/2021) | Token que prometia parte dos lucros foi tratado como contrato de investimento | FATO |
| CVM, Parecer de Orientação 40 (11/10/2022) | Contrato de investimento coletivo: expectativa de benefício econômico, esforço de terceiro, oferta pública | FATO |
| Termos do pump.fun (data não identificada) | Proíbem usar o token em captação, repasse de receita e "pump and dump" | Resumo de modelo auxiliar: [A confirmar, AC-12] |
| Texto do PUMP e do WLFI | "no dividend", "no right to any return, dividend, airdrop or other distribution" | FATO SECUNDÁRIO e FATO |

### 4.12 Técnica: código, perguntas, saída, fechamento e resolução (N-TQ)

| ID | Número ou fato | Fonte | Etiqueta |
|---|---|---|---|
| N-TQ-01 | Programa atual: 1.717 linhas de Rust; `resolver.rs` com 234 e `resolve.rs` com 66; 138 testes; nove leitores on-chain; nenhuma chave de administrador | `2F` 1.1; `briefing`; `2C` seção 4 | FATO |
| N-TQ-02 | O repositório se descreve como protótipo de hackathon, na rede de testes e sem auditoria. Licença MIT em nome de Ronaldo Pereira; 11 dos 16 commits listados são dele | `CLAUDE.md`; `2B` 11.1; arquivo `LICENSE` | FATO |
| N-TQ-03 | Sai do programa: oito instruções e sete campos do `Market`. Fica: leitores, `resolve`, cofre, eventos, método de teste de invariantes. Programa novo estimado em 1.500 a 2.500 linhas | `2F` 1.1 e seção 11 | FATO; a estimativa é INFERÊNCIA |
| N-TQ-04 | Os nove tipos prontos: queima de oferta; renúncia de emissão; renúncia de congelamento; programa imutável; tokens travados; stake de validador numa época; TVL de pool de staking numa época; liquidez travada para sempre na Meteora DAMM v2; metadados imutáveis | `briefing` seção 9; `1H` 4.1 | FATO |
| N-TQ-05 | Três famílias: (1) decisão de quem tem a chave, custo zero: renúncia de emissão, renúncia de congelamento, programa imutável, metadados; (2) alguém gasta ou trava dinheiro: queima, tokens travados, liquidez travada; (3) foto numa data: stake de validador, TVL de pool de staking | `1H` 4.1 | INFERÊNCIA |
| N-TQ-06 | Os quatro leitores de token só aceitam o padrão clássico (registro de exatamente 82 bytes); recusam Token-2022 sem ler errado | `1H` 4.2 | FATO |
| N-TQ-07 | Custo de uma resolução: 5.000 lamports (0,000005 SOL) por assinatura; mil resoluções custam 0,005 SOL | `1H` 3.2 e 3.3 | FATO; a soma é INFERÊNCIA |
| N-TQ-08 | Regra atual: se o prazo passou, é NÃO; meta cumprida no dia 10 e ninguém resolve até o dia 30, o resultado gravado é NÃO. Nas perguntas de época a janela é de cerca de dois dias | `1H` 3.1 | FATO |
| N-TQ-09 | O `resolve` rejeita chamada feita por outro programa; por isso agendadores on-chain como o Tuk Tuk não conseguem chamá-lo | `1H` 3.1 e 3.2 | FATO (a rejeição); FATO SECUNDÁRIO (o Tuk Tuk; AC-11) |
| N-TQ-10 | Arquitetura proposta de resolução: serviço próprio sempre ligado; segundo agendador em outro provedor; botão público "Resolver"; alarme para "resolvível e não resolvida há mais de 15 minutos"; recompensa on-chain a quem resolve | `1H` 3.4; `2C` R1 | INFERÊNCIA |
| N-TQ-11 | Pyth: 1.881 preços, 423 de cripto, em 4/out/2026 (inclui SOL, BTC e memecoins grandes); 64 ativos com conta fixa em Solana, atualizados a cada 55 segundos ou 0,5% de variação | `1H` 4.3 | FATO (a contagem); a lista dos 64 não foi conferida |
| N-TQ-12 | Manipular preço lido de uma pool num instante: numa pool com 100 SOL e 10 milhões de tokens, dobrar o preço custa comprar com 41,42 SOL e revender na mesma transação, perdendo cerca de 0,21 SOL em taxas | `1H` 4.3 | INFERÊNCIA |
| N-TQ-13 | Caso Mango (11/out/2022): preço do oráculo de cerca de US$ 0,04 para US$ 0,54 em uns 30 minutos; retirada de US$ 114 a 116 milhões | `1H` 4.3 (denúncias da SEC e da CFTC) | FATO |
| N-TQ-14 | Média no tempo: numa média de 30 minutos, um pico de 100 vezes o preço que dure 15 segundos move a média em 3,9% | `1H` 4.3 | INFERÊNCIA |
| N-TQ-15 | Forçar a formatura no pump.fun: perda mínima de 18,66 SOL numa curva intocada, 2,16 SOL nos últimos 10% e 0,07 SOL no último 1% | `1H` 4.4 (`RESOLVERS.md` do sócio) | FATO |
| N-TQ-16 | Depósito de aluguel de cada posição de apostador: cerca de 0,0017 SOL, devolvido quando a conta fecha | `2C` C2 | INFERÊNCIA |
| N-TQ-17 | Cloak: só rede principal; depósito grátis; saque de 0,3% mais 0,45 USDC; relatório de auditoria não publicado. SODAX: só rede principal; entrega USDC na carteira; taxa de 0,1%; não chama instrução de programa | `privacidade-entre-redes-e-x.md`; `briefing` seção 10; `2C` P1 e P3 | FATO e FATO SECUNDÁRIO |
| N-TQ-18 | Custo de leitura da rede pelo site: cerca de 510 créditos por visita; o plano de US$ 49 aguenta perto de 19.600 visitas por mês e o de US$ 499, 196 mil | `2B` seção 9 | INFERÊNCIA (premissa: 50 transações por página) |
| N-TQ-19 | Multisig recomendado: 2 de 3, com chaves em dispositivos físicos e trava de tempo; hoje não há terceira pessoa definida | `2C` K1 | FATO (a recomendação da referência); a lacuna é FATO |
| N-TQ-20 | Roteiro: cinco fases e doze sprints, sem datas | `2F` seções 3 e 4 | INFERÊNCIA |

N-TQ-21. Cardápio proposto para o MVP (`2F` seção 9; para o fundador decidir). Critério: "alguém decide este
resultado de graça?".

| Tipo | Fase | Observação |
|---|---|---|
| Preço de SOL e de BTC pela Pyth, modalidade "toque" ("o SOL toca US$ X até o dia D?") | 2 | Leitor novo; preço fresco em toda aposta; ninguém controla o resultado |
| TVL de pool de staking no começo de uma época ("o JitoSOL começa a época E com X SOL ou mais?") | 2 | Leitor pronto; só com os dois agendadores no ar |
| Liquidez travada na Meteora | 3 | Leitor pronto; teto de pote abaixo do custo de forçar |
| Queima de oferta em token clássico | 3 | Leitor pronto; teto de pote; tokens do pump.fun ficam de fora até o suporte a Token-2022 |
| Renúncia de chave, programa imutável, metadados imutáveis | Depois | Uma pessoa decide o resultado de graça (OBJ-03) |
| Stake de validador | Depois | Não testável com SIM fora de uma rede real |
| Formatura no pump.fun; preço de token pequeno | Depois | Empréstimo relâmpago; exige travas (N-TQ-22) |

N-TQ-22. Resposta à pergunta D-17, em três degraus (`1H` 4.3): (1) ativos com preço na Pyth, incluindo as memecoins
grandes; (2) tokens com pool na Raydium ou na Meteora DLMM, pela média no tempo, com liquidez travada mínima e teto
de pote; (3) tokens só na PumpSwap, por receita na Switchboard, o que troca leitura pura da rede por confiança numa
rede de oráculos. Ordem de construção dos leitores novos: Token-2022; preço pela Pyth; formatura no pump.fun.

N-TQ-23. Saída antecipada: a fórmula proposta (`1H` 1.5; INFERÊNCIA; parâmetros sem referência de mercado):

```text
devolução   = aposta × (1 − penalidade)
penalidade  = mínimo( 90% ,  5%  +  20% × tempo  +  queda )
tempo       = fração já decorrida da janela de saída (0 na abertura, 1 quando a saída fecha)
queda       = 1 − chance do seu lado na saída ÷ chance do seu lado na sua entrada   (zero se a chance subiu)
```

Exemplos (pote com 300 no SIM e 700 no NÃO; conferidos):

| Situação | Tempo | Queda | Penalidade | Recebe de cada 100 |
|---|---|---|---|---|
| Aposta pequena (10 dos 300) sai cedo | 25% | 1,2% | 11,2% | 88,83 |
| Ana (100 dos 300) sai cedo | 25% | 12,3% | 22,3% | 77,72 |
| Ana sai na metade da janela | 50% | 12,3% | 27,3% | 72,72 |
| Ana sai quase no fim da janela | 90% | 12,3% | 35,3% | 64,72 |
| A chance do lado dela subiu, sai na metade | 50% | 0 | 15,0% | 85,00 |

N-TQ-24. Saída antecipada: por que a penalidade fixa não basta (`1H` 1.3; INFERÊNCIA; conferida). No pote 300/700, se
todo o SIM sai pagando penalidade fixa, o retorno do NÃO, que seria 1,386 sem saída, fica em: 0,991 com 5% (o
vencedor perde dinheiro); 1,012 com 10%; 1,053 com 20%; 1,095 com 30%; 1,178 com 50%.

N-TQ-25. Saída antecipada: o que os outros fazem (`1H` 1.1). PancakeSwap Prediction, corridas de cavalo e o Melee
alfa: não se sai. Melee novo: um cofre separado compra a posição com desconto. Casas de aposta: a casa recompra.
Polymarket, Kalshi e Limitless: vende-se a outro usuário. Pote que devolve dinheiro com penalidade: nenhum precedente
encontrado (FATO do agente: ausência em pesquisa). Num pote puro não existe "ganho" para realizar antes do fim:
quando o seu lado fica mais provável, o prêmio dele encolhe na mesma medida (INFERÊNCIA; exemplo em `1H` 1.2: 100 no
SIM "valem" 97 com o pote em 300/700 e continuam valendo 97 com o pote em 600/700).

N-TQ-26. Saída antecipada: o furo achado pelo red team (`2C` S1; INFERÊNCIA; conferida). Pergunta de resultado
controlável; pote de terceiros com 100 no SIM e 100 no NÃO. O dono põe 900 no SIM por uma carteira e 2.000 "de
mentira" no SIM por outra; a tela mostra SIM com 96,8%; entram 400 no NÃO, atraídos pelo retorno; a segunda carteira
sai com 95% da janela decorrida, pagando penalidade de 41,3% (826,70); o dono cumpre a meta. Pote final de 2.326,70;
depois da taxa, 2.256,90; a primeira carteira recebe 90%, ou 2.031,20. Gasto: 900 + 826,70 = 1.726,70. Lucro de
304,50, contra 60,30 sem o golpe. Com a penalidade marcada por lado (vai aos vencedores só se o lado de quem saiu
perder; senão, ao fundo de prêmios), o lucro vira prejuízo de 417,20.

N-TQ-27. Saída antecipada: os demais achados de `2C` (seção 2): numa fuga em massa, sobra de cerca de um terço a
63% do prêmio; a fórmula pode levar a penalidade de um apostador honesto a 80% a 90% quando uma baleia entra contra
ele; sair depois do fato ou depois da resolução, se o programa não conferir o estado, tira dinheiro do último
vencedor. Fórmula revista proposta: penalidade marcada por lado; piso de 10%; espera mínima em horas; valor mínimo
aceito informado pelo usuário; posição de patrocinador sem saída; saída desligada em pergunta de preço; chave
`exit_enabled` por pergunta, que nasce desligada.

N-TQ-28. Fechamento: a regra decidida e a proposta gradual (`1H` 2.3; INFERÊNCIA; conferida). Proposta: T1 = fim −
20% da duração, limitado a no máximo 14 dias antes do fim (até T1, apostas livres e saída permitida); T2 = fim − 5%
da duração, com mínimo de 24 horas e máximo de 7 dias (entre T1 e T2, cada lado só pode crescer 25% sobre o tamanho
que tinha em T1 e não há saída; depois de T2, nada).

| Duração | Regra decidida (80%): fecha no dia | Dias fechados pela regra decidida | T1 | T2 | Dias fechados na proposta |
|---|---|---|---|---|---|
| 7 dias | 5,6 | 1,4 | dia 5,6 | dia 6,0 | 1,0 |
| 30 dias | 24,0 | 6,0 | dia 24,0 | dia 28,5 | 1,5 |
| 90 dias | 72,0 | 18,0 | dia 76,0 | dia 85,5 | 4,5 |
| 180 dias | 144,0 | 36,0 | dia 166,0 | dia 173,0 | 7,0 |

Para perguntas de até 70 dias, T1 cai exatamente nos 80% decididos. Com o teto de 25%, o oportunista de N-PO-06 só
consegue pôr 125 no NÃO e os apostadores antigos recebem 1,746 em vez de 1,058.

N-TQ-29. Fechamento: detalhes técnicos (`1H` 2.3 e 2.4; `2C` E4 e K7). O programa atual mede prazo em blocos, cujo
tempo varia (235 milissegundos medidos na rede de testes, contra 400 nominais); o programa novo deve guardar data e
hora. A opção avançada de menos de 24 horas (D-09) se implementa com duas assinaturas de pessoas diferentes, vindas
do multisig, com o registro gravado no mercado e num evento on-chain.

N-TQ-30. Quadro de poderes proposto (`2C` seção 4; INFERÊNCIA):

| Poder | Quem | Limite no código |
|---|---|---|
| Atualizar o programa | Multisig 2 de 3 com trava de tempo | Compilação verificável a cada versão |
| Abrir pergunta | Uma chave da equipe propõe, outra aprova | Teto de pote obrigatório; tipos permitidos |
| Mudar a taxa padrão | Multisig com trava de tempo | Teto constante; não afeta pergunta já aberta |
| Enviar as taxas ao destino | Qualquer um | Só para a conta gravada na configuração |
| Aceitar ou recusar patrocínio | Uma chave da equipe | O aceite aplica o dinheiro na mesma transação; a recusa só libera o saque pelo patrocinador |
| Pausar | Uma chave da equipe | Nunca bloqueia resgate, devolução nem `resolve` |
| Despausar | Multisig | — |
| Resolver | Qualquer um | — |

N-TQ-31. As cinco fases (`2F` seção 3): (1) pote na rede de testes; (2) produto jogável na rede de testes; (3)
patrocínio; (4) saída antecipada, escrita e testada, desligada por padrão; (5) rede principal fechada, com tetos.
Os doze sprints estão em `2F`, seção 4; o capítulo 12 reproduz a tabela.

### 4.13 Regulação: datas, textos e números (N-RG)

Nenhuma linha desta seção é opinião sobre o que a lei permite. Tudo é "o que o texto diz", para o capítulo 15.

| ID | Norma ou caso | O que diz, em uma frase | Data | Fonte | Etiqueta |
|---|---|---|---|---|---|
| N-RG-01 | Resolução CMN nº 5.298 | Veda a oferta e a negociação, no país, de derivativos sobre evento esportivo, jogos on-line e evento político, eleitoral, social, cultural, de entretenimento "ou de qualquer outra temática que, a critério da Comissão de Valores Mobiliários, não seja representativa de referencial econômico-financeiro"; vale para derivativos negociados no exterior e ofertados aqui | 24/4/2026; vigência em 4/5/2026 | `2D` 1.1 (texto integral, Banco Central) | FATO |
| N-RG-02 | CVM depois da 5.298 | Nenhuma norma posterior encontrada definindo "referencial econômico-financeiro" | até 4/10/2026 | `2D` 1.2 | não encontrado (AC-02) |
| N-RG-03 | Nota Técnica SEI nº 2958/2026/MF | Plataformas de mercado de previsão "exploram ilicitamente a modalidade lotérica de aposta de quota fixa"; sugere bloqueio; basta "prêmio previamente determinável"; aponta a falta de identificação de usuários como risco; a saída antes do fim equivale ao "cash out" | 23/4/2026 | `2D` 1.3 (texto integral, Fazenda) | FATO |
| N-RG-04 | Bloqueio no Brasil | A Anatel notificou cerca de 19 mil prestadoras a pedido da Fazenda; a imprensa listou 27 sites, entre eles Polymarket, Kalshi, Hedgehog Markets e Predict.fun | 24/4/2026 | `2D` 1.3 | FATO (Anatel); FATO SECUNDÁRIO (a lista) |
| N-RG-05 | Medida Provisória nº 1.394 | Proíbe em todo o país a exploração, a oferta, a intermediação e a publicidade de loterias de aposta de quota fixa, inclusive por agente no exterior; revoga quase toda a Lei 14.790; multa de até 10% do faturamento ou R$ 50 milhões por infração para provedores | 25/9/2026 | `2D` 1.5 | [A confirmar, AC-01]: lida só pelo agente 2D; não verificada pelo agente principal |
| N-RG-06 | Lei 14.478/2022 e Resoluções BCB 519, 520 e 521 | Prestadora de serviços de ativos virtuais precisa de autorização; inclui "custódia ou administração de ativos virtuais" em nome de terceiros; pedidos até 30/10/2026 e capital mínimo de R$ 10,8 a 37,2 milhões (estes dois, fonte secundária) | 2022 e 2025 | `2D` 1.6 | FATO (lei); FATO SECUNDÁRIO (prazo e capital; AC-13) |
| N-RG-07 | Lei 9.613/1998, art. 9º | São obrigadas a identificar clientes as sociedades com "sistemáticas de captação de apostas com pagamento de prêmios" e as prestadoras de serviços de ativos virtuais | — | `2D` 1.6 | FATO (trecho) |
| N-RG-08 | CFTC contra a Polymarket | Multa de US$ 1,4 milhão por oferecer opções binárias de evento fora de bolsa; "regardless of the technology used"; um dos exemplos era pergunta de preço de cripto | 3/1/2022 | `2D` 2.1 | FATO |
| N-RG-09 | Estados americanos | Ações ou ordens de Nevada, Illinois, Rhode Island, Connecticut, Missouri e Nova York contra a Polymarket em 2026; Nevada incluiu a empresa do Panamá | 2026 | `2D` 2.2 | FATO |
| N-RG-10 | França, autoridade de jogos | Mandou bloquear a Polymarket; o bloqueio geográfico existente "has been circumvented"; cita a falta de identificação; publicidade de jogo não autorizado tem multa de 100 mil euros | 16 e 17/7/2026 | `1C`; `2D` 2.3 | FATO |
| N-RG-11 | ESMA (autoridade europeia de mercados) | Contrato de evento sobre referência financeira é instrumento financeiro e cai na proibição de opções binárias ao varejo; os demais podem ser aposta pela lei nacional | 3/7/2026 | `2D` 2.3 | FATO (trechos) |
| N-RG-12 | MiCA, art. 4º | Oferta pública de criptoativo na União exige pessoa jurídica e documento; há isenção para menos de 150 pessoas por país, até 1 milhão de euros em 12 meses ou só investidores qualificados | em vigor desde 30/12/2024 | `2D` 2.4 | FATO |
| N-RG-13 | Regras de integridade da Polymarket e da Kalshi | Proíbem negociar quem pode influenciar o resultado ("Trade if you can influence the outcome"); sanção na Kalshi publicada: banimento de 5 anos e multa de 10 vezes | 2026 | `2D` 4.1 | FATO |
| N-RG-14 | Tornado Cash | Tribunal: contratos imutáveis não são "propriedade" (26/11/2024); sanção retirada em 21/3/2025; Roman Storm condenado em 6/8/2025; a juíza registrou que ele controlava a interface e implantou uma triagem de sanções ineficaz | 2024 e 2025 | `2D` 5.1 | FATO (o corpo do comunicado da condenação não foi lido) |
| N-RG-15 | Padrão do setor sem identificação | Polymarket, Limitless, Myriad e Unhedged bloqueiam países por IP ou por termos e guardam o direito de pedir identificação depois; nenhuma deixa de bloquear os Estados Unidos e os países sob sanção | out/2026 | `2D` seção 6 | FATO (trechos); a leitura é INFERÊNCIA |
| N-RG-16 | Estruturas adotadas por plataformas parecidas | Empresa no Panamá (Polymarket internacional; Limitless); bolsa regulada (Kalshi); licença de jogo no exterior (BetDEX, Ilha de Man, 1/11/2022) | 2021 a 2026 | `2D` seção 8 | FATO SECUNDÁRIO; BetDEX é FATO |
| N-RG-17 | Código Penal, art. 171-A (criado pela Lei 14.478) | "Fraude com a utilização de ativos virtuais", reclusão de 4 a 8 anos | 2022 | `2D` 1.6 | FATO |

### 4.14 Contas conferidas por mim

Refiz à mão, e bateram: N-PO-01 a N-PO-06; a tabela do favorito (seção 4.3); N-PA-01 a N-PA-06 e N-PA-08; N-DT-01 a
N-DT-03; os fatores 0,6375% e 1,9125% e os seis volumes de N-FK-01; as somas de N-FC-05 (volume, taxa e custo em 24
meses); as metas de volume, taxa e pote médio de N-FM; N-FK-04; as réguas de N-FC-03; os exemplos de N-TQ-23, N-TQ-24
e N-TQ-26; a tabela de N-TQ-28; N-FC-08 (pote, taxa, pagamento e conferência do cofre); as porcentagens de queda de
LMTS, Limitless e Metaplanet; a razão de 4,7 vezes da Kalshi.

Não refiz (são saída do script de `2E`, que declara conferência com `node`): as linhas mês a mês de caixa nos dois
regimes, N-FK-02, N-FK-03, N-FK-05, N-FK-07 e N-FK-08. O redator copia esses valores sem alterar.

---

## 5. Glossário em linguagem simples

Uma definição e um exemplo por termo. O redator usa estas definições, com estas palavras, na primeira vez em que o
termo aparece em cada capítulo. O Anexo A do BP (Parte C) reproduz o glossário inteiro em ordem alfabética.

Termos preferidos e termos a evitar: "pote" (na primeira vez, "pool (pote)"); "pergunta" (não "mercado", salvo ao
falar dos concorrentes); "banca" para a empresa que opera; "rede principal (mainnet)" e "rede de testes (devnet)";
"sem identificação (sem KYC)"; "saída antecipada" (não "cash out"); "resolução por dado verificável on-chain" (não
"sem oráculo"); "token A" e "token B" depois de apresentados; "venda privada" com "ICO privado" entre aspas, como
palavra do fundador.

### 5.1 O produto

| Termo | Definição | Exemplo |
|---|---|---|
| Mercado de previsão | Lugar em que pessoas apostam dinheiro no resultado de uma pergunta sobre o futuro | "O SOL toca US$ 300 até 31 de dezembro?": quem acha que sim aposta no SIM |
| Pergunta | Uma frase com resposta SIM ou NÃO, uma data final e uma regra de como se decide | "A oferta do token T cai para 900 milhões até o dia 30?" |
| Pote (pool) | O cofre de uma pergunta: todas as apostas entram nele e, no fim, quem acertou divide o que sobrou depois da taxa | 300 USDC no SIM e 700 no NÃO formam um pote de 1.000 |
| Lado | Cada uma das duas respostas possíveis, SIM ou NÃO | Com 300 no SIM e 700 no NÃO, o lado do NÃO é o maior |
| Aposta | O valor que uma carteira põe num lado; fica registrado em nome dela, sem virar token | Ana põe 100 USDC no SIM |
| Chance | A fatia do pote que está em cada lado, mostrada na tela; não é preço nem probabilidade garantida | 300 no SIM de um pote de 1.000: a tela mostra SIM 30% |
| Retorno | Quanto cada 1 USDC apostado recebe se o lado ganhar; só fica definido quando as apostas fecham | No pote 300/700, o SIM recebe 3,23 por 1 e o NÃO, 1,39 |
| Taxa | A parte do pote que fica com a banca: 3% | Pote de 1.000: 30 de taxa, 970 para os vencedores |
| Banca | A empresa que opera a plataforma e recebe a taxa | "A banca nunca perde" é a frase do fundador para a taxa no pote de um lado só |
| Pote de um lado só | Pergunta em que só um lado recebeu apostas; não há perdedor para pagar o vencedor | Ana põe 100 no SIM, ninguém entra no NÃO: ela recebe 97 |
| Fechamento | O momento em que as apostas param, antes da data final, para ninguém entrar já sabendo o resultado | Pergunta de 30 dias fecha no dia 24 (80% da duração) |
| Saída antecipada | Desistir da aposta antes da resolução e receber parte do dinheiro de volta | Ana pôs 100, sai cedo e recebe 77,72 |
| Penalidade | A parte da aposta que quem sai deixa para trás | Na saída acima, 22,28 ficam no pote |
| Resgate | O ato de o vencedor retirar a sua parte depois da resolução | Ana tinha 100 no SIM, deu SIM: ela resgata 323 |
| Pergunta anulada | Terceiro resultado proposto, além de SIM e NÃO: a pergunta não pôde ser decidida e as apostas voltam | A conta que seria lida deixou de existir depois do prazo |
| Teto de pote | Valor máximo que uma pergunta aceita, fixado na criação, para o prêmio nunca valer mais que o custo de forçar o resultado | Pergunta de queima com teto de 5.000 USDC |

### 5.2 Patrocínio e prêmios

| Termo | Definição | Exemplo |
|---|---|---|
| Patrocinador | Quem paga uma das três faixas (US$ 500, 1.500 ou 5.000) para pôr dinheiro numa pergunta e receber contrapartidas | Um projeto paga US$ 1.500 numa pergunta sobre a própria queima |
| Prêmio neutro | Dinheiro somado ao pote sem escolher lado; aumenta o retorno de quem acertar, qualquer que seja o resultado | US$ 350 de prêmio num pote de 10.000 fazem o SIM pagar 1,673 em vez de 1,617 |
| Aposta de patrocinador | O dinheiro do patrocinador entra num lado, como uma aposta grande, com selo | 3.500 no SIM: o SIM passa a pagar 1,378 e, se der SIM, o patrocinador recebe 4.824 |
| Contrapartida | O que o patrocinador recebe em troca: selo, destaque, posição fixa, texto na pergunta, publicação no X | Selo "Patrocinado por X" e 72 horas de destaque na página inicial |
| Selo | Marca visível na pergunta dizendo quem patrocinou, ou "Anônimo" | "Patrocinado por Projeto T" |
| Pedido de pergunta | O patrocinador pede uma pergunta e deixa o pagamento travado; a equipe aceita ou recusa, e a recusa devolve tudo | Depósito de US$ 1.500 travado até a análise |
| Sentido A e sentido B do "70/30" | As duas leituras da frase do fundador. A: 70% do patrocínio para a banca, 30% para o pote. B: o contrário | Faixa de US$ 500: no A, 150 vão ao pote; no B, 350 |
| Fundo de prêmios | Reserva da banca, alimentada por 25% da taxa, para pôr prêmio nos potes e dar ao primeiro apostador um motivo para entrar | Com US$ 1 milhão apostado no mês, o fundo recebe US$ 7.500 |
| Colheita de prêmio | Apostar nos dois lados só para levar o prêmio neutro, sem opinião sobre a pergunta | Pote vazio com 100 de prêmio: quem põe 1 em cada lado recebe 98,94 |
| Linha dos 3,09% | Tamanho do prêmio, em relação às apostas, a partir do qual os apostadores, somados, deixam de perder para a taxa | Num pote de 10.000, um prêmio acima de 309 |

### 5.3 Resolução e perguntas

| Termo | Definição | Exemplo |
|---|---|---|
| Resolução | O ato de gravar o resultado da pergunta, de forma definitiva | Qualquer pessoa aperta "Resolver"; o programa lê a rede e grava SIM |
| On-chain | Gravado na blockchain, onde qualquer pessoa pode conferir | A oferta total de um token é um número on-chain |
| Leitor on-chain | Parte do programa que abre uma conta da Solana, lê um número ou uma chave e responde sim ou não, sem ninguém informar nada | O leitor de queima lê a oferta do token e compara com a meta |
| Oráculo | Serviço que traz para dentro da blockchain um dado de fora dela | A Pyth publica o preço do Bitcoin assinado por corretoras |
| Oráculo com votação (UMA) | Alguém propõe o resultado deixando uma caução; se contestado, detentores de um token votam | Na Polymarket: caução de cerca de US$ 750, 2 horas para contestar |
| Pyth | Rede de oráculos de preço em que corretoras e formadores de mercado publicam preços assinados, que o programa confere | "O SOL toca US$ X?" se decide com um preço assinado da Pyth |
| Pergunta de "toque" | Pergunta de preço que dá SIM se o preço encostar no alvo em qualquer momento do prazo | "O BTC toca US$ 80.000 até o dia 30?" |
| Serviço agendado (cron) | Programa de computador que acorda de tempos em tempos e faz uma tarefa sozinho; aqui, chamar a resolução | A cada minuto o serviço confere se alguma pergunta já pode ser resolvida |
| Época | O "dia" da Solana para contas de stake; dura cerca de dois dias | "O JitoSOL começa a época 850 com 15 milhões de SOL?" |
| Queima | Destruir tokens para sempre, reduzindo a oferta | Um projeto queima 10% da oferta do próprio token |
| Renúncia de autoridade | O dono de uma chave abre mão, para sempre, do poder de criar tokens novos, de congelar carteiras ou de alterar um programa | O time renuncia à emissão: ninguém mais cria tokens novos |
| Liquidez travada | Dinheiro posto numa pool de negociação e travado para sempre, para o token sempre poder ser trocado | 100 SOL travados na pool T/SOL da Meteora |
| Formatura (no pump.fun) | O momento em que um token vende toda a curva inicial e passa a ser negociado numa pool comum | Só 0,26% dos tokens se formavam em junho de 2026 |
| Empréstimo relâmpago | Empréstimo tomado e devolvido dentro da mesma transação; serve para mover um número por um instante | Comprar com 41 SOL emprestados, dobrar o preço de uma pool pequena, resolver e devolver |
| Média no tempo | Em vez do preço de um instante, a média do preço durante um período; resiste a picos | Um pico de 15 segundos move 3,9% uma média de 30 minutos |

### 5.4 Solana, tokens e chaves

| Termo | Definição | Exemplo |
|---|---|---|
| Solana | A blockchain em que o produto roda | As apostas são transações na Solana |
| Carteira | Aplicativo que guarda as chaves do usuário e assina as transações; é a única "conta" do usuário no Baked Market | Phantom |
| USDC | Moeda digital que vale 1 dólar, emitida pela Circle | Apostar 100 USDC é apostar 100 dólares |
| Programa | O código que roda na Solana e guarda o dinheiro dos potes | O programa de pote do Baked Market |
| Cofre | A conta de USDC de uma pergunta, que pertence ao programa; só ele assina a saída de dinheiro | Um cofre por pergunta |
| Rede principal (mainnet) e rede de testes (devnet) | A rede em que o dinheiro é real e a rede de ensaio, com dinheiro de mentira | O programa atual só existe na rede de testes |
| Identificação (KYC) | Conferência de quem é o usuário, com documento | A Kalshi exige; o Baked Market, por decisão, não |
| Token-2022 | O segundo programa de tokens da Solana, com funções extras embutidas no próprio token; é o padrão dos tokens novos do pump.fun | Um token Token-2022 pode cobrar taxa em cada transferência |
| pump.fun | Plataforma de Solana em que qualquer pessoa lança um token em minutos, vendido por uma curva de preço | O token A será lançado lá |
| Curva de ligação (bonding curve) | Fórmula em que o preço sobe conforme entra dinheiro; quem entra cedo paga menos | No pump.fun, 793,1 milhões de tokens são vendidos pela curva |
| Token A | O token do Baked Market lançado no pump.fun; especulativo, sem direito a receita | Decisão D-29 |
| Token B | O token do Baked Market desenhado pela empresa e vendido em venda privada | É o que recebe a recompra e queima |
| Venda privada ("ICO privado") | Venda de tokens a compradores escolhidos, por contrato, antes de o token estar no mercado, com trava | Vender 15% da oferta a um grupo de compradores |
| Trava e liberação gradual | Contrato que segura tokens e os solta num calendário | Equipe: 18 meses parado e 30 de liberação |
| Desbloqueio | Tokens que saem da trava e podem ser vendidos | 1,53% da oferta por mês |
| Recompra e queima | A empresa usa parte da receita para comprar o próprio token no mercado e destruí-lo, reduzindo a oferta | 25% da taxa: com US$ 1 milhão apostado no mês, US$ 7.500 |
| Tesouraria em Bitcoin | Reserva da empresa guardada em Bitcoin | 25% da taxa convertidos em Bitcoin todo mês |
| Multisig | Carteira que só assina quando várias pessoas aprovam | 2 de 3: duas de três pessoas precisam assinar |
| Chave de atualização | A carteira que pode trocar o código do programa; quem a tem pode esvaziar todos os cofres | Deve ficar num multisig |
| Trava de tempo | Espera obrigatória entre aprovar e executar uma mudança, para o público ver antes | Mudança de taxa só vale 48 horas depois de aprovada |
| Compilação verificável | Prova pública de que o código que roda na rede é o do repositório | Qualquer pessoa confere com uma ferramenta |
| Auditoria | Revisão do programa por uma empresa de segurança independente, antes de receber dinheiro real | De US$ 15 a 45 mil, segundo blogs de auditores |
| Pausa | Poder da equipe de parar apostas novas numa emergência, sem bloquear resgates | Um defeito é descoberto: a equipe pausa as apostas |
| Carteiras múltiplas | Sem identificação, uma pessoa abre quantas carteiras quiser; regra "por carteira" não segura ninguém | Um limite de 100 USDC por carteira se contorna com dez carteiras |
| Acesso à rede (RPC) | Serviço pago que deixa o site ler a blockchain e enviar transações | Helius, de US$ 49 a 999 por mês |
| Cloak | Serviço de privacidade em Solana que esconde quem pagou a quem | O patrocinador saca para uma carteira nova e patrocina com ela |
| SODAX | Serviço que traz dinheiro de outras blockchains e entrega USDC na carteira em Solana | Quem tem dinheiro na rede Base chega com USDC em Solana, pagando 0,1% |

### 5.5 Mercado e finanças

| Termo | Definição | Exemplo |
|---|---|---|
| Livro de ordens | Lista de ofertas de compra e de venda; compra-se de outra pessoa, a um preço conhecido | 100 ações SIM a US$ 0,60 custam 60; se der SIM, viram 100 |
| Formador de mercado automático (AMM) | Um contrato com uma fórmula faz o papel da contraparte; sempre há preço, mas ele piora em compras grandes | Limitless usa um, com taxa de 0,40% |
| Valor de face | Jeito de medir volume somando cada contrato a US$ 1 | 100 contratos comprados a US$ 0,27 dão valor de face de 100 |
| Dólares pagos | Jeito de medir volume somando o que foi desembolsado; é o comparável com um pote | Os mesmos 100 contratos dão 27 de dólares pagos |
| Taxa efetiva | Quanto a plataforma arrecada dividido pelo que os usuários pagaram | Polymarket: 2,0% em setembro de 2026 |
| Dinheiro travado | O total parado dentro dos potes ou de um protocolo num dado momento | O World tinha US$ 170,8 mil travados |
| Giro | Quantas vezes o mesmo dólar é apostado num período; no pote, o dólar entra uma vez por pergunta | No World, cada dólar girou cerca de 90 vezes no mês |
| Ponto de equilíbrio | O volume apostado por mês em que a parte da taxa que vai para a operação paga o custo | Com custo de US$ 3.000: US$ 471 mil por mês |
| Regime (a) e regime (b) | (a): a taxa se divide em quatro desde o primeiro dia. (b): regra de partida, em que Bitcoin e recompra esperam em USDC e cobrem o déficit até a operação se pagar | No razoável, o (a) chega ao azul no mês 8 e o (b), no mês 6 |
| Nível de custo | Três tamanhos de operação: 1, ninguém recebe (US$ 3.000 por mês); 2, equipe enxuta (US$ 10.000); 3, número do sócio (US$ 25.000) | O plano de partida é o nível 1 |
| Avaliação | Quanto vale o total de tokens ao preço da venda | Vender 15% por US$ 750 mil é uma avaliação de US$ 5 milhões |
| Bloqueio geográfico | Impedir o acesso de certos países ao site, em geral pelo endereço de internet | A Polymarket deixa o Brasil só fechar posição |
| Triagem de sanções | Conferir se uma carteira está em lista de sanção antes de aceitar o dinheiro dela | O Cloak diz fazer isso antes de cada transação |

---

## 6. Objeções registradas

Cada linha é uma discordância do red team com uma decisão ou uma premissa do fundador. A decisão continua valendo no
BP. A objeção entra uma única vez, numa caixa "Objeção registrada", na seção indicada na última coluna; os outros
capítulos remetem a ela pelo código. Severidade, como o red team definiu: **crítica** (derruba o negócio, causa perda
de dinheiro de usuário ou expõe a equipe se não for tratada antes da rede principal), **alta** (compromete o
lançamento ou a confiança), **média** (custa dinheiro ou tempo), **baixa**. Onde dois agentes deram severidades
diferentes, vale a maior.

### 6.1 Quadro

| ID | Decisão atacada | A objeção | Evidência, em uma frase | Alternativa proposta | Severidade | Caixa no BP |
|---|---|---|---|---|---|---|
| OBJ-01 | D-13, D-34 (apostas em fatos on-chain para o público web3) | Ninguém demonstrou que esse público quer apostar em fatos lidos on-chain (`2A` O1) | A Onda 1 não achou nenhum mercado aberto sobre queima, renúncia, trava ou formatura em nenhuma plataforma e escreveu "demanda direta pelo recorte: não demonstrada" | Testar antes de reescrever o programa: 10 a 15 conversas, beta com pontuação e sem dinheiro, quatro semanas de potes com teto baixo, com critério de continuar ou parar escrito antes | Crítica | 2.5 |
| OBJ-02 | D-21, D-22, D-23 (patrocinador anônimo escolhe qualquer forma; quem controla o resultado pode apostar) | Anônimo, que controla o resultado e aposta num lado, é a combinação que os líderes proíbem (`2A` O8; `2C` E5; `2D` 4.2) | Polymarket e Kalshi proíbem por escrito negociar quem pode influenciar o resultado; no exemplo de `2D`, o patrocinador põe 5.000 no NÃO, não cumpre a meta e lucra 658 sobre quem apostou no SIM | Da mais leve à mais dura: anônimo para o público e identificado para a equipe; declaração assinada pela carteira; aviso na pergunta; anônimo só com prêmio neutro; aposta de lado só em perguntas que ninguém controla; equipe não aposta | Crítica | 3.7 |
| OBJ-03 | D-16 (tipos de pergunta em aberto) e D-23 | Perguntas decididas de graça por uma única chave são opção gratuita para o dono da chave (`2C` E1; `1H` 4.1) | Em quatro dos nove tipos prontos uma pessoa decide o resultado sem custo; no exemplo de `2C`, o dono aposta 3.000, age depois do fechamento e lucra 3.305 sem risco | Deixar essa família fora do pote no MVP; se entrar, só com teto de pote baixo, selo "resultado controlado por uma parte" e sem patrocínio com lado | Crítica | 4.2 |
| OBJ-04 | D-08 (saída antecipada no MVP) | A saída é a peça mais nova e perigosa; não deve nascer ligada em todas as perguntas (`2A` O9; `2C` M1; `2F` 3.1) | Não há precedente de pote que devolva dinheiro a quem sai, os parâmetros não têm referência e a revisão no papel já achou seis furos | Escrever e testar a saída no MVP, mas com a chave por pergunta desligada; ligar pergunta a pergunta, começando por potes pequenos, depois de simulação e de revisão externa | Crítica (`2C`); alta (`2A`) | 3.6 |
| OBJ-05 | D-08 ("deixando uma penalidade pro pote") | A penalidade volta ao pote e quem domina o lado vencedor a recebe de volta (`2C` S1) | No exemplo, o golpe da chance rende lucro de 304,50 em vez de 60,30 | Marcar a penalidade pelo lado de quem saiu: vai aos vencedores só se esse lado perder; se ganhar, vai ao fundo de prêmios. Muda a letra da decisão e precisa do aval do fundador | Crítica | 11.6 |
| OBJ-06 | D-08 ("ganho proporcional menor") | Num pote puro não existe ganho para realizar antes do fim (`1H` 1.2; `2F` 3.1) | Quando o lado fica mais provável, o prêmio dele encolhe na mesma medida: a aposta de 100 "vale" 97 antes e depois | Saída do MVP só com devolução e penalidade; o ganho na saída fica para uma fase posterior, pela venda da posição a outra pessoa, que é o que os precedentes fazem | Alta | 3.6 |
| OBJ-07 | D-26 (3% do pote) | Taxa fixa sobre o pote inteiro castiga quem aposta no favorito (`2A` O6; `2B` 3.2; `2C` E9) | Com 90% do pote no lado vencedor a taxa leva 30% do ganho; com 97%, quem acerta recebe o que pôs; acima disso, perde | Manter 3% como teto e mudar a base: taxa = o menor entre 3% do pote e 10% do lado perdedor; ou limitar a taxa ao tamanho do prêmio. No modelo, a taxa média cai para 2,3% e a regra se paga com 30% mais volume | Alta | 7.2 |
| OBJ-08 | D-07 (pote de um lado só devolve cobrando taxa) | A taxa pune o primeiro apostador, que é quem o lançamento mais precisa (`2A` O5; `2B` 3.3) | Cem potes de US$ 200 de um lado só rendem US$ 150 à operação, e a referência dos 3%, o PancakeSwap, devolve 100% na rodada cancelada | Manter a cobrança com valor reduzido (1% ou um valor fixo pequeno), ou zero durante o lançamento; decidir também a tabela completa dos casos de um lado só | Alta | 3.4 |
| OBJ-09 | D-27 (divisão da taxa em quatro) | Dividir em quatro desde o primeiro dia deixa 0,75% do volume para pagar a operação e multiplica por quatro o volume de equilíbrio (`2B` furo 1; `2A` O11; `1F`) | No razoável, o regime da decisão volta ao déficit no mês 18; durante a subida, cada dólar de déficit coberto pelos sócios é igual a um dólar enviado ao Bitcoin | Regra de partida (regime (b)): o destino final fica como decidido; até a operação se pagar por três meses seguidos e haver seis meses de custo guardados, as parcelas de Bitcoin e de recompra ficam em USDC, em contas públicas, e podem cobrir o déficit com registro | Crítica | 7.3 |
| OBJ-10 | D-27 (25% para tesouraria em Bitcoin) | A base é a taxa bruta, antes de qualquer custo (`2B` furo 5; `1F` 6.2) | Tether, Block e Méliuz usam lucro ou caixa excedente como base; Metaplanet estava 38% abaixo do custo em jun/2026 | Acumular em USDC até o gatilho da regra de partida; depois, compra mensal em data fixa; regra escrita de venda e de quem assina o cofre; alternativa de base: 25% do que sobrar depois dos custos | Alta | 7.6 |
| OBJ-11 | D-27, D-29 (25% para recompra e queima do token B) | A recompra é pequena perto dos desbloqueios e não sustenta o preço (`2B` furo 6; `1F` seção 7) | A Jupiter gastou mais de US$ 70 mi, cobriu 6% dos desbloqueios e o token caiu 89%; com US$ 1 milhão apostado por mês a recompra cobre de 5% a 18% dos desbloqueios propostos | Recompra só depois do equilíbrio e de o token existir; desenhar os desbloqueios pelo tamanho da recompra; não prometer preço | Alta | 8.5 |
| OBJ-12 | D-32 ("subir preço e entregar dividendo aos holders") | O "dividendo" não tem fonte na divisão da taxa e é a palavra que os reguladores citam (`1G` 6.5; `2A` O14; `2D` 3.2) | A divisão 25/25/25/25 não tem parcela de repasse; SEC e CVM tratam promessa de participação no resultado como sinal de contrato de investimento | Tirar "dividendo" do plano e do material público, ou dizer de qual fatia sai e levar ao advogado | Alta | 8.6 |
| OBJ-13 | D-29, D-30 (token no pump.fun "para pumpar", lançado primeiro) | A linguagem e a ordem corroem a confiança que uma casa de apostas vende (`2A` O10; `2D` 3.2; `2F`) | LMTS caiu 94%, PNP 93% e UMA 99%; os termos do pump.fun, segundo a leitura feita, proíbem "pump and dump"; não foi achado caso de plataforma com produto real lançada pela curva do pump.fun | Produto primeiro, com volume medido; token A depois, no modelo do PURR (sem promessa, carteira da equipe declarada e travada); token B só depois de meses de volume real e do parecer; nenhuma das palavras "pumpar", "dividendo" ou "subir preço" em material público | Alta | 8.7 |
| OBJ-14 | D-31 (30% de cada compra do token para as pools) | Como taxa permanente do token, 30% destrói o comprador (`1G` seção 4) | Quem paga 1.000 fica com 703 de valor e, se revender, com 490; nenhum caso lido teve taxa permanente acima de 10% | 30% do que a venda privada arrecadar, carimbado para o fundo de prêmios, sem taxa no token; reforço pela taxa de criador do token A | Média | 8.4 |
| OBJ-15 | D-18 (faixas de 500, 1.500 e 5.000) | O preço é de vitrine com milhões de usuários; o Baked não tem vitrine e não há precedente pago (`2A` O7; `2B` furo 3; `1F` 3.2) | No maior programa parecido, o da Polymarket, a mediana é de US$ 3 por dia por mercado e o patrocinador não recebe nada | Três a cinco cartas de intenção antes de construir o fluxo; faixa de US$ 500 só por autoatendimento; no começo, quase tudo ao pote (sentido B); não projetar patrocínio como receita central no primeiro ano | Alta | 7.4 |
| OBJ-16 | D-27 (25% para fundo de prêmios) | O fundo só se paga se causar um quarto de todo o volume; na medida que paga custo, não se paga (`2B` furo 4) | Nenhuma plataforma publicou o retorno de prêmios; Opinion, Myriad e Limitless perderam de 80% a 96% do volume quando o incentivo acabou | O dinheiro entra no fundo, mas só sai por regra: três sinais medidos por trimestre, critério de corte escrito antes, prêmio com trava contra colheita, prioridade para abrir potes | Alta | 7.5 |
| OBJ-17 | D-36 (bloqueios geográficos para o fim; Brasil: "por enquanto não") | A equipe mora no país em que a regra contra o setor é mais recente (`2A` O12; `2D` seções 1 e 6) | A Resolução CMN 5.298 e a Nota Técnica 2958 existem; 27 sites foram bloqueados, inclusive plataformas on-chain; a Polymarket põe o Brasil em "só fechar posição" | Bloqueio por IP no MVP, desde o primeiro dia, com a lista de países decidida com advogado; sem material em português nem campanha no Brasil até o parecer | Crítica | 15.2 |
| OBJ-18 | D-41 (jurisdição "não é assunto agora") | Sem país e sem pessoa jurídica não há venda de token, tesouraria nem termos de uso (`2A` O12; `2D`; `1G`) | O caso da Polymarket mostra que onde as pessoas trabalham importa tanto quanto o país do registro; a venda privada não pode ser desenhada sem a jurisdição | Parecer curto de advogado brasileiro antes de gastar com construção; escolher a jurisdição antes de desenhar a venda do token B e a tesouraria | Crítica | 15.9 |
| OBJ-19 | D-41 (divisão com o sócio "por enquanto é irrelevante") | Uma pessoa só domina o programa, sem acordo, prazo nem resposta registrada (`2B` furo 10; `2F` 5.1) | A licença é MIT em nome do sócio, 11 dos 16 commits são dele e as seis perguntas do briefing não têm resposta registrada | Acordo de sócios antes de qualquer gasto de construção ou auditoria; resposta escrita às seis perguntas, com prazo; chave de atualização em multisig com os dois; orçar um segundo desenvolvedor por contrato | Crítica | 13.3 |
| OBJ-20 | D-35 ("sem kyc") | Sem identificação nenhuma, o cofre com dinheiro de terceiros e o patrocinador desconhecido encostam em deveres legais citados (`2D` 1.6, seção 6 e mapa) | No setor, "sem KYC" quer dizer sem identificação na entrada, com bloqueio por IP, triagem de sanções e direito de pedir identificação depois; a Lei 9.613 lista "captação de apostas com pagamento de prêmios" entre as atividades obrigadas | Adotar a definição do setor e identificar o patrocinador perante a equipe, mesmo com selo "Anônimo" ao público | Crítica | 15.8 |
| OBJ-21 | D-09, D-10 (fechamento a 80% com mínimo de 24 horas; perguntas longas) | O mínimo de 24 horas trava as perguntas curtas, que são o que o público aposta; perguntas longas não cabem no MVP (`2A` O2; `2C` E4; `2F`) | Concorrentes operam preço de cripto em 5 minutos a 1 semana; com 24 horas fechadas, uma pergunta de dois dias fica um dia parada | Aprovar uma vez, por duas chaves, um modelo de série curta e deixar o serviço abrir as rodadas; no MVP, um fechamento só e perguntas de até 30 dias; a regra gradual de `1H` fica para as perguntas longas, depois | Alta | 3.5 |
| OBJ-22 | D-02 ("sem limite de compra") | Toda pergunta precisa de teto de pote (`1H` 4.1; `2C` E2; `2A` O14) | Quem consegue forçar o resultado ganha, no máximo, o pote do lado oposto; completar uma curva do pump.fun nos últimos 10% custa 2,16 SOL | Aceitar o teto como regra de segurança e dizer que "sem limite" vale abaixo do teto; teto por pergunta e teto total do programa no período inicial | Alta | 3.3 |
| OBJ-23 | D-40 (Cloak e SODAX) | Integrados ao site, os dois põem código de terceiros na página em que a carteira assina; e o Cloak não esconde um patrocínio grande (`2C` P1 a P3) | O cofre de USDC do Cloak tinha cerca de 2.560 USDC: um patrocínio de 5.000 é quase o dobro; os dois só existem na rede principal | No MVP, orientação em vez de integração: o patrocinador usa o Cloak por conta própria e chega com carteira nova; SODAX em página separada; na tela, "pagador não divulgado" | Alta | 3.9 |
| OBJ-24 | D-17 (pergunta do fundador sobre preço de token pequeno) | Preço de token pequeno, lido de uma pool num instante, pode ser movido e devolvido na mesma transação (`1H` 4.3; `2C` R7) | Numa pool de 100 SOL, dobrar o preço custa cerca de 0,21 SOL em taxas; no caso Mango o preço do oráculo foi de US$ 0,04 a US$ 0,54 em 30 minutos | Entrar em três degraus: ativos com preço na Pyth; média no tempo com liquidez travada mínima e teto de pote; receita na Switchboard. Não no primeiro dia | Alta | 4.4 |
| OBJ-25 | D-15 (resolução acionada por cron da plataforma) | Se o serviço falha, um SIM verdadeiro vira NÃO, para sempre (`2A` O13; `2C` R1 e R2) | Pela regra do programa, meta cumprida no dia 10 e não provada até o prazo é gravada como NÃO; o PancakeSwap, quando o operador falha, devolve 100% | Dois agendadores em provedores diferentes, botão público, recompensa on-chain a quem resolve desde o MVP, alarme e plantão; terceiro resultado "Anulada"; janela de época perdida vira devolução; plano escrito de indenização | Crítica (`2C`); alta (`2A`) | 4.7 |
| OBJ-26 | D-37 (dinheiro real na rede principal) e o escopo do MVP | É um programa novo, sem auditoria, com mais de dez sistemas novos (`2A` O15; `2C` M1; `2F` risco 1) | O repositório se descreve como protótipo de hackathon, sem auditoria; a reescrita invalida boa parte dos 138 testes | Lançar em cinco fases, com a rede principal na quinta, tetos de pote, multisig, compilação verificável, pausa e auditoria externa como condição | Crítica | 12.1 |
| OBJ-27 | D-13, D-22 (como se fala do produto) | "Sem oráculo", "anônimo" e "ninguém controla" prometem o que o produto não entrega (`2A` O3; `1H`; `2C`) | Preço exige a Pyth; o Cloak não esconde valores grandes; a equipe abre perguntas, pausa e atualiza o código | "Resultado verificável on-chain, pago em minutos, sem disputa"; "pagador não divulgado"; publicar quem pode o quê | Média | 4.8 |
| OBJ-28 | D-39 (nome Baked Market) | "Baked" tem a gíria de "chapado" e "baked in" quer dizer "já decidido de antemão" (`2A` O17; `pesquisa-nome-do-site.md`) | A pesquisa de nome já registrava a gíria e o ticker `BAKED` em uso por terceiros; nenhuma base de marcas foi consultada | Manter o nome e usar a leitura a favor ("o resultado está assado na rede e qualquer um confere"); só funciona se a OBJ-02 for resolvida | Baixa | 3.10 |
| OBJ-29 | D-41 (hackathon "não precisa para agora") | Uma fonte barata de capital e de validação está sendo deixada passar (`2B` 10.2) | O prazo do Colosseum é 12 de outubro de 2026; valores de prêmio não conferidos | Reconsiderar a submissão do que já existe; é decisão do fundador | Baixa | 9.6 |

Contagem: 29 objeções. Doze críticas (OBJ-01, 02, 03, 04, 05, 09, 17, 18, 19, 20, 25 e 26); treze altas (OBJ-06, 07,
08, 10, 11, 12, 13, 15, 16, 21, 22, 23 e 24); duas médias (OBJ-14 e OBJ-27); duas baixas (OBJ-28 e OBJ-29). No BP,
o Anexo C lista as 29 com a seção em que cada caixa está.

### 6.2 O que continua de pé depois do red team (`2A`, fim)

O capítulo 14 fecha com esta lista, para o fundador ver o que resistiu:

1. A leitura direta on-chain é real e única entre os cinco concorrentes analisados.
2. O código de resolução é o ativo mais sólido: nove leitores, resolução aberta a qualquer um, trava automática das
   apostas quando o fato acontece, teste aleatório de invariantes.
3. O pote não quebra: não precisa de formador de mercado e o cofre nunca fica devendo.
4. A equipe abrindo as perguntas é o que fazem Polymarket e World; quem abriu a criação para qualquer um não mostrou
   que isso traz volume.
5. USDC, sem rendimento do pote e sem tokens de SIM e NÃO simplificam o programa e a explicação.
6. Os 3% estão dentro da faixa do setor em potes equilibrados.
7. Prêmio dentro do pote é algo que nenhum site de anúncio vende.
8. Dar o segundo token a quem segura o primeiro, sem conversão, tem um precedente que funcionou (PURR e HYPE).
9. A janela existe, se a demanda existir: o rival mais parecido não lançou.

### 6.3 Riscos que não são objeção a uma decisão (para o capítulo 14)

| ID | Risco | Evidência | Mitigação proposta | Severidade | Fonte |
|---|---|---|---|---|---|
| R-01 | A chave de atualização do programa pode esvaziar todos os cofres | Hoje os scripts usam uma carteira em arquivo; quem tem a chave: não encontrado | Multisig 2 de 3 com trava de tempo; compilação verificável | Crítica | `2C` K1 |
| R-02 | O apostador vale pouco e custa caro para trazer | US$ 9 para a operação em seis meses, contra custos de aquisição de US$ 77 a US$ 2.500 | Aquisição paga perto de zero; medir retorno sem prêmio | Crítica | `2B` furo 7 |
| R-03 | Capital sem fonte garantida; a venda privada é circular | A venda precisa acontecer antes do volume e o preço só se justifica depois dele | Lançar no nível 1 com capital dos sócios; marcos antes de cada gasto | Crítica | `2B` furo 9 |
| R-04 | Custos que vêm antes da receita | US$ 30 a 75 mil antes do primeiro dólar de taxa | Orçamento de pré-lançamento com três cotações de auditoria | Alta | `2B` furo 8 |
| R-05 | O pote não gira o dinheiro | O World gira cada dólar cerca de 90 vezes por mês; no pote, uma vez por pergunta | Perguntas curtas primeiro | Alta | `2B` 2.4 |
| R-06 | Forçar o SIM pagando | Vale a pena sempre que o pote do NÃO for maior que o custo de forçar | Teto de pote abaixo do custo de forçar, medido na criação | Alta | `2C` E2 |
| R-07 | Aposta de última hora dilui quem arriscou cedo | 5.000 no lado quase certo rendem 290,91 sem risco | Fechamento; prazos em data e hora, não em blocos | Alta | `2C` E4 |
| R-08 | Casos do pote de um lado só sem regra | Com prêmio neutro e penalidades, há quatro casos sem definição | Escrever a tabela inteira antes de programar | Alta | `2C` E8 |
| R-09 | A conta lida deixa de poder ser lida | Programas de terceiros (pool de staking, pump.fun) podem mudar de formato | Resultado "Anulada"; recusar tokens com autoridade de fechar o registro | Alta | `2C` R6 |
| R-10 | Perguntas de preço: aposta entre o toque e a prova | O preço só existe na rede quando alguém publica | Preço fresco em toda aposta; só ativos grandes; saída desligada | Alta | `2C` R7 |
| R-11 | O site como elo mais fraco | Conta de hospedagem, de domínio ou do GitHub tomada serve transação maliciosa | Segundo fator com chave física; nenhum script de terceiro na página de aposta | Alta | `2C` F4 |
| R-12 | Acesso à rede no navegador | Endereço público tem limite; chave paga no navegador é pública | Repasse pelo servidor, com limite; histórico guardado em servidor | Alta | `2C` F1 |
| R-13 | A equipe como parte informada | Ela vê os pedidos de patrocínio antes do público e opera o serviço de resolução | Regra pública: a equipe não aposta; carteiras da equipe publicadas; nenhuma pergunta sobre o token da casa | Média (crítica se combinada com OBJ-02) | `2C` E10; `2A` O8 |
| R-14 | O USDC pode ser congelado pelo emissor | Dinheiro vindo de serviço de privacidade aumenta a exposição | Cofre por pergunta; cofre de taxas esvaziado com frequência | Média | `2C` C7 (AC-16) |
| R-15 | O diferencial pode ser copiado | O World já tem o encanamento automático | Chegar primeiro e ter comunidade | Média | `1E` seção 8 |
| R-16 | Não há fonte de perguntas toda semana | Fatos irreversíveis são raros; só três dos oito exemplos têm leitor pronto | Séries recorrentes geradas por regra; meta de cardápio com responsável | Alta | `2A` O4 |
| R-17 | Mercado de vendas de token fraco | 37 vendas e US$ 58 mi no 2º trimestre de 2026, no mundo | Meta de arrecadação modesta; nenhum custo fixo apoiado na venda | Média | `1G` 2.2 |
| R-18 | Sem plano de incidente | Não há quem pausa, quem fala e onde se publica | Uma página, antes da rede principal | Média | `2C` F6 |
| R-19 | Capacidade de construir | Poucas pessoas de Rust; o ambiente atual não compila nem roda testes; auditor sem agenda | Máquina de build ou CI; contratar a revisão por volta do sprint 7 | Alta | `2F` seção 7 |

---

## 7. Pontos a confirmar

O BP marca cada um com **[A confirmar]** ao lado da frase ou do número e os reúne na seção 16.3.

| ID | Ponto | O que falta | Como aparece no BP |
|---|---|---|---|
| AC-01 | Medida Provisória nº 1.394, de 25/9/2026 | Foi lida só pelo agente de conformidade; o agente principal não a verificou; a tramitação no Congresso não foi conferida | "Segundo a leitura do agente de conformidade, a MP 1.394, de 25/9/2026, proíbe ... [A confirmar: texto e vigência a conferir no Planalto e com advogado]". Nunca como fato firme |
| AC-02 | Regulamentação da CVM para a Resolução 5.298 | Nenhuma norma encontrada; o Ofício 6/2026/CVM/SMI não foi lido | "Não encontrada até 4/10/2026" |
| AC-03 | Preços de destaque pago | Tabela de Boosts do DexScreener não confirmada em fonte oficial; preços de CoinGecko, CoinMarketCap e DEXTools vêm de agência revendedora ou de 2024 | Citar só as faixas de N-PA-07, com "[A confirmar]" |
| AC-04 | Dados do Melee | Beta sem dinheiro real vem de fio de usuário; taxa, base dos "20%", quem resolve no modelo novo, data da rede principal e token: não encontrados | "Fonte secundária; a confirmar" |
| AC-05 | Régua do DefiLlama | O método para a Kalshi não é declarado; a correção da contagem dupla da Polymarket não tem data confirmada | Nota de rodapé na tabela das duas réguas |
| AC-06 | Projeção da Bernstein | O relatório original e o método não foram lidos; não fecha com o ritmo atual | "Projeção de terceiro, método não lido" |
| AC-07 | O "70/30" | Qual parte é da banca; se a parte da banca se divide em quatro; se o dinheiro do patrocinador no pote paga os 3% | Os dois sentidos em toda tabela; pergunta na seção 16.1 |
| AC-08 | Aposta média, frequência e pessoas reais | Não há dado em nenhuma plataforma | "Premissa sem dado" em todo uso |
| AC-09 | Custos de auditoria, empresa e pareceres | Só faixas de blogs de fornecedores | Faixas com "[A confirmar: pedir três cotações]" |
| AC-10 | Cloak e SODAX | Tamanho atual do cofre do Cloak; relatório de auditoria; se entregam a endereço de programa; se a SODAX paga comissão a quem integra | "Segundo o plano de privacidade do sócio" |
| AC-11 | Tuk Tuk não consegue chamar o `resolve` | Vem do README de um concorrente; o código do Tuk Tuk não foi lido | "Segundo fonte secundária" |
| AC-12 | Textos lidos só por resumo de modelo auxiliar | Termos do pump.fun; perguntas e respostas da SEC e declaração de meme coins (na leitura de `2D`); comunicado do Tesouro de 21/3/2025; perguntas frequentes do Cloak | "Segundo a leitura feita; reler antes de usar" |
| AC-13 | Prestadoras de ativos virtuais | Prazo de 30/10/2026 e capital mínimo vêm de fonte secundária | "[A confirmar na norma]" |
| AC-14 | Números de audiência de fonte fraca | Usuários ativos da Phantom; carteiras mensais do pump.fun; usuários diários de Solana | Etiqueta "FATO SECUNDÁRIO, fonte fraca" |
| AC-15 | Pyth | Lista dos 64 ativos com conta fixa; disponibilidade na rede de testes; taxa por atualização | "Não conferido" |
| AC-16 | Congelamento do USDC | A autoridade de congelamento do registro do USDC não foi lida | "Inferência, a conferir" |
| AC-17 | Limites técnicos | Limite do endereço público de acesso à rede; teto de processamento por conta por bloco | "Não conferido" |
| AC-18 | Chave de atualização do programa | Quem a tem hoje | Pergunta ao sócio (16.2) |
| AC-19 | Documento de design e nome | O `DESIGN-DIRECTION.md` ainda descreve a direção C; "Market" no singular sem resposta; nenhuma base de marcas consultada | Registro no capítulo 3 |
| AC-20 | Token A | Holder Rewards ligado ou não; se a carteira do fundo de prêmios pode ser uma conta de programa na divisão da taxa de criador | Perguntas na seção 16.1 |
| AC-21 | Leis não lidas | Arts. 10 e 11 da Lei 9.613; Lei 13.709 (dados pessoais); art. 51 do Decreto-Lei 3.688; Decretos-Lei 6.259 e 204; MiCA, arts. 6º, 7º, 13, 14 e 15 | Lista na seção 15.11 |
| AC-22 | Limitless | Causa do salto de maio e da queda até setembro de 2026 | "Causa não encontrada" |
| AC-23 | Mercados de pump.fun na Polymarket | US$ 262,81 mil vem de agregador, sem data | "FATO SECUNDÁRIO, fonte fraca" |
| AC-24 | Volume de apostas e preço do Bitcoin | A hipótese de que caem juntos não foi verificada | "Hipótese não verificada" |
| AC-25 | Fórmula da saída | A simulação com apostadores estratégicos não foi feita; os parâmetros não têm referência | "Parâmetros a calibrar por simulação" |
| AC-26 | Tabela de taxas da Kalshi | A página oficial não abriu; a fórmula vem de fonte secundária | Etiqueta FATO SECUNDÁRIO |
| AC-27 | Colosseum | Valores de prêmio e de aceleração não conferidos | "Não conferido" |
| AC-28 | PNP e outros | Outros programas do PNP não medidos; se PancakeSwap Prediction e Hyperliquid HIP-4 resolvem on-chain: não verificado | Ressalva em 6.3 e 6.7 |

---

## 8. Roteiro do Business Plan por capítulo

### 8.1 Regras de montagem, comuns às três partes

**Arquivos.** Parte A em `docs/business/_review/bp-parte-a.md`; Parte B em `bp-parte-b.md`; Parte C em
`bp-parte-c.md`. O agente principal junta as três em `docs/business/BUSINESS-PLAN.md`.

**Tamanho.** Alvo de 7.200 palavras na Parte A, 7.600 na Parte B e 7.700 na Parte C: 22.500 no total. Piso de cada
parte: 6.500 palavras (o plano exige 6.000; a folga cobre a diferença de contagem). O total tem de passar de 18.000.
Conta-se o arquivo inteiro, tabelas incluídas. Os alvos por capítulo estão abaixo; faltar até 10% num capítulo é
aceitável se outro compensar.

**Títulos e numeração.** Capítulo: `## 3. O produto`. Seção: `### 3.6 Saída antecipada`. A numeração das seções é a
deste roteiro e **não muda**: as três partes são escritas em paralelo e remetem umas às outras pelo número. O redator
pode criar subtítulos de quarto nível (`####`) dentro de uma seção, sem número.

**Abertura de cada arquivo.** A Parte A abre com o bloco de título do BP:

```text
# Baked Market — Business Plan

**Versão:** v0.0.1 · **Data:** 4 de outubro de 2026 · **Estado:** primeira versão, para revisão do fundador

> **Como ler.** Este plano descreve o produto que o fundador quer construir. As decisões dele aparecem como decisões.
> Onde a pesquisa ou a revisão crítica discordam, a discordância aparece numa caixa "Objeção registrada", com a
> evidência e a alternativa, sem substituir a decisão. Cada número traz a etiqueta FATO (fonte primária), FATO
> SECUNDÁRIO (imprensa, agregador, estimativa de terceiro) ou INFERÊNCIA (conta ou projeção nossa). Nada aqui é
> promessa de retorno, de preço de token nem opinião sobre o que a lei permite.
```

As Partes B e C abrem direto no primeiro capítulo (`## 6. Concorrência` e `## 11. Tecnologia e arquitetura`),
precedido só de uma linha de comentário `<!-- BP v0.0.1, Parte B -->` ou `<!-- BP v0.0.1, Parte C -->`.

**Remissões.** Dentro da mesma parte ou para outra parte, sempre pelo número: "(ver seção 7.4)", "(ver capítulo
15)". Não escrever "como vimos acima" nem "como será visto": o leitor pode pular capítulos.

**O que não repetir.** Cada assunto tem uma casa. Fora dela, uma frase e a remissão.

| Assunto | Casa (onde é explicado por inteiro) | Nos outros capítulos |
|---|---|---|
| A conta do pote (N-PO-01) | 3.3 | "no exemplo da seção 3.3 (300 no SIM, 700 no NÃO)" |
| Saída antecipada: regra e fórmula | 3.6 | 11.6 trata só da segurança; 9.2 só da premissa financeira |
| Patrocínio: produto (faixas, duas formas, contrapartidas) | 3.7 | 7.4 traz a conta do "70/30" e a receita; 3.7 mostra só N-PA-01 |
| Tipos de pergunta e cardápio | 4.2 e 4.5 | 12.3 remete |
| Resolução e serviço agendado, visão de produto | 4.6 e 4.7 | 11.5 traz a arquitetura |
| Duas réguas de volume | 5.1 | 6.1 remete e usa só dólares pagos |
| Concorrentes | Capítulo 6 | Os capítulos 2 e 5 citam no máximo três fatos, com remissão |
| Taxa e destino da taxa | 7.2 e 7.3 | 9.4 e 9.5 trazem só os números do modelo |
| Fundo de prêmios, Bitcoin, recompra | 7.5, 7.6 e 8.5 | 9.x remete |
| Tokens | Capítulo 8 | 3.1 apresenta a terceira trilha em um parágrafo; 12.5 dá o lugar no roteiro |
| Cenários, equilíbrio, capital, metas de 90 dias | Capítulo 9 | O sumário traz uma tabela-resumo; 10.5 e 13.4 remetem |
| Chaves, multisig, requisitos de segurança | 11.4 e 11.8 | Os demais remetem |
| Fases e sprints | 12.1 e 12.2 | 10.4 remete |
| Riscos | 14.2 (quadro completo) | As caixas de objeção ficam nas seções indicadas na seção 6.1 deste arquivo |
| Leis, normas e casos | Capítulo 15 | As Partes A e B **não descrevem leis**; escrevem "ver capítulo 15" |
| Decisões pendentes e próximos passos | Capítulo 16 | 1.8 traz a lista curta, igual à de 16.4 |
| Glossário | Anexo A | Cada capítulo define o termo na primeira vez, com as palavras da seção 5 deste arquivo |

**Lista canônica de próximos passos** (usada em 1.8 e em 16.4, nesta ordem):

1. Revisão do BP pelo fundador e versão v0.0.2, com análise de impacto de cada mudança.
2. Decisões pendentes de regra (lista de 16.1), a começar pelo sentido do "70/30", pela tabela do pote de um lado
   só, pelo destino da penalidade e pelo cardápio do primeiro dia.
3. Consulta a advogado brasileiro com prática em cripto, antes de gastar com construção: enquadramento do pote,
   jurisdição, lista de países, patrocinador anônimo, tokens.
4. Acordo escrito com o sócio técnico, respostas às perguntas do briefing, prazo e dedicação; definição de quem
   guarda a chave de atualização e de quem é a terceira chave do multisig.
5. Teste de demanda: 10 a 15 conversas com o público-alvo, beta com pontuação e sem dinheiro, e três cartas de
   intenção de patrocinadores.
6. Três cotações de auditoria e orçamento de pré-lançamento.
7. Fase 1 do roteiro: o pote na rede de testes.

**Lista canônica de decisões pendentes do fundador** (para 16.1; 1.8 cita só o número de itens):

1. "70/30": qual parte é da banca; se a parte da banca vai inteira para a operação ou se divide em quatro; se o
   dinheiro do patrocinador dentro do pote paga os 3%.
2. Pote de um lado só: a tabela completa (para onde vão prêmio neutro e penalidades em cada caso) e o valor da taxa
   nesse caso.
3. Saída antecipada: aceita que não dê ganho, só devolução com penalidade? Penalidade marcada por lado? Nasce
   desligada por pergunta? Cobra 3% sobre o valor devolvido? Uma parte da penalidade pode ir para a banca?
4. Fechamento: a regra para perguntas longas e a duração máxima no MVP.
5. Cardápio do primeiro dia; perguntas decididas por uma chave (fora, ou com selo e teto); preço de token pequeno;
   aceitar a Pyth como "oráculo que resolve on-chain".
6. Patrocinador anônimo: mantém a aposta de lado em qualquer pergunta? O patrocinador se identifica perante a equipe?
7. Taxa: a regra de partida (regime (b)) e o seu gatilho; a forma da taxa (teto pelo lado perdedor).
8. Custos e capital: o nível de custo real; quanto os sócios põem e por quanto tempo; quando passam a receber; o
   critério de parada.
9. Tokens: "30% do arrecadado" no lugar de "30% de cada compra"? O "dividendo" sai do plano ou de qual fatia vem?
   Holder Rewards ligado? Momento do token A em relação ao produto.
10. Bloqueio geográfico: quais países, e se o Brasil entra; jurisdição da empresa.
11. Chaves e regras da casa: quem são as três chaves do multisig; quem atende o alarme; a equipe pode apostar; pode
    haver pergunta sobre o token da casa.
12. Resolução errada por falha do serviço: a empresa indeniza? Com que dinheiro?
13. Teste de demanda antes de reescrever o programa; submissão ao hackathon.
14. "Baked Market" no singular; se quem sugere ou cria uma pergunta ganha parte da taxa (D-42).

**Perguntas para o sócio técnico** (para 16.2): as seis do `briefing`, seção 13, e mais: quem tem hoje a chave de
atualização do programa; programa novo ao lado do atual ou versão 2; quanto tempo ele tem e para quais sprints; se
aceita o resultado "Anulada"; quanto processamento custa percorrer as extensões do Token-2022; se aceita exigir
preço fresco da Pyth em toda aposta de pergunta de preço; prazos em data e hora no lugar de blocos.

### 8.2 Parte A (capítulos 1 a 5) — alvo de 7.200 palavras

Arquivos que o redator da Parte A lê por inteiro: `ideacao`, `briefing`, `1H`, `1D`, `2C` (seções 0 a 3 e 7) e
`2F` (seções 8 e 9). Lê nas seções indicadas: `1E` (resumo, seção 0, 6.2 e seção 8), `1B` (seções 1, 2 e 6), `2A`
(O1 a O5, O8, O9, O13, O17), `2D` (seção 4.2), `privacidade-entre-redes-e-x.md` (resumo e seção A.1) e
`pesquisa-nome-do-site.md`.

#### Capítulo 1. Sumário executivo — 900 palavras

Escrito por último, só com números desta ficha. Seções:

- **1.1 O que é o Baked Market.** Mercado de previsão em Solana para o público web3; um pote por pergunta; quem
  acerta divide o pote; o resultado sai da leitura de um dado on-chain (D-01, D-02, D-13).
- **1.2 Para quem.** "queremos pessoal da web3"; carteira, sem identificação (D-34, D-35). Uma linha sobre o tamanho
  do público (N-PF-03, N-PF-05) e uma sobre a queda de 2026 (N-PF-06).
- **1.3 Como funciona, em um exemplo.** O exemplo N-PO-01 em três linhas.
- **1.4 Como ganha dinheiro.** 3% do pote; patrocínio em três faixas; destino da taxa em quatro partes (D-26, D-27,
  D-18). Dizer já aqui que só 25% da taxa paga a operação.
- **1.5 O que já existe e o que falta.** Existe: programa na rede de testes com nove leitores e resolução aberta
  (N-TQ-01). Falta: o programa de pote, que é novo (N-TQ-03), auditoria, empresa, parecer.
- **1.6 Os números do plano.** Tabela obrigatória "O plano em números", com as linhas: taxa; faixas de patrocínio;
  volume e receita no mês 12 nos três cenários (N-FC-04); volume de equilíbrio do nível 1 nos dois regimes
  (N-FK-01); capital com reserva (N-FK-03); gasto antes do lançamento (N-FC-01); meta razoável de 90 dias (N-FM);
  régua (World, N-CO-20). Etiqueta INFERÊNCIA na tabela.
- **1.7 Os maiores riscos.** Cinco linhas, com remissão ao capítulo 14: demanda não demonstrada (OBJ-01);
  patrocinador que controla o resultado e aposta (OBJ-02, OBJ-03); só 0,64% do volume paga a operação (OBJ-09);
  Brasil, jurisdição e identificação (OBJ-17, OBJ-18, OBJ-20); programa novo, sem auditoria, com a saída antecipada
  (OBJ-04, OBJ-26). Dizer que há 29 objeções registradas, 12 críticas.
- **1.8 Próximos passos.** A lista canônica de sete passos (seção 8.1), em uma linha cada.

Não usar no sumário: nomes de leis, detalhes de fórmula, mais de uma tabela.

#### Capítulo 2. Problema e oportunidade — 1.000 palavras

- **2.1 O problema: quem decide o resultado.** A queixa mais documentada do setor é a resolução. Usar N-CO-10 a
  N-CO-14 (Polymarket) e N-CO-22 (World), e N-CO-09 (PNP), em um parágrafo cada, com remissão ao capítulo 6.
  Citar o fundador: quer oráculo "que possa resolver onchain, diferente das questões abertas de geopolítica que
  depende um oráculo que claramente pode ser manipulado".
- **2.2 A oportunidade: fatos que a própria rede decide.** O que é ler um dado on-chain (definição do glossário).
  Nenhum dos cinco concorrentes resolve assim (N-CO-31). O segundo diferencial, nas palavras do fundador: "sendo em
  oráculo on chain, e possibilitando você abrir a questão de algo sobre si mesmo, você acaba criando uma forma de
  marketing". Patrocínio de pergunta não tem precedente entre os cinco (N-CO-31).
- **2.3 Por que agora.** A favor: o setor cresceu (N-ME-01, N-ME-02, N-ME-08); o rival mais parecido não lançou
  (N-CO-01 a N-CO-03); o World, com a Phantom, ainda é pequeno (N-CO-20). Contra, com o mesmo destaque: o público do
  pump.fun encolheu em 2026 (N-PF-06, N-PF-07); plataformas menores perderam de 80% a 96% do volume (N-ME-20); a
  regulação apertou (uma frase e "ver capítulo 15").
- **2.4 O que o Baked Market propõe.** Três frases de proposta: pote simples; resultado verificável on-chain;
  patrocínio de pergunta como trilha de dinheiro e de marketing. Tabela obrigatória "programa atual contra Baked
  Market" (`briefing`, seção 2).
- **2.5 O que ainda não está provado.** A demanda é hipótese. Usar N-ME-21, N-ME-22, N-PF-09 a N-PF-11. Caixa
  **OBJ-01**, com o plano de teste (conversas, beta com pontuação, potes com teto, critério escrito). Citar a
  ressalva do agente: a ausência pode ser falta de procura ou falta de ferramenta.

Exemplo numérico obrigatório: se o Baked capturasse todo o volume que a Polymarket já teve em mercados ligados ao
pump.fun, a taxa de 3% renderia US$ 7.884 no total (262.810 × 0,03; INFERÊNCIA de `2A`).

#### Capítulo 3. O produto — 2.300 palavras

- **3.1 As três trilhas de dinheiro.** D-04. Um parágrafo por trilha: apostas; patrocinador (remete a 3.7 e 7.4);
  token (remete ao capítulo 8). O que **não** tem: tokens de SIM e NÃO (D-03), rendimento do pote (D-06), preço
  travado (D-02). Moeda: USDC (D-05).
- **3.2 O ciclo de uma pergunta.** Os dois ciclos (D-11). Passos: abertura, apostas, fechamento, resolução, resgate
  (`briefing` 3.1). O pedido de pergunta com depósito travado: aceite, recusa com devolução. Propostas do red team
  para o fluxo, marcadas como proposta: o aceite abre a pergunta e aplica o dinheiro na mesma transação; o
  patrocinador pode cancelar sozinho depois de 14 dias; a recusa só libera o saque por ele (`2C` C8).
- **3.3 A conta do pote.** N-PO-01 por inteiro, com tabela. Depois N-PO-02 e N-PO-04. As duas consequências que a
  tela precisa mostrar. Caixa **OBJ-22** (teto de pote).
- **3.4 Pote de um lado só.** D-07, com a citação. N-PO-03. Tabela obrigatória dos quatro casos, como proposta a
  decidir (`2F` 8.2): só o lado vencedor tem apostas (devolve menos taxa; prêmio neutro e penalidades vão a esses
  vencedores); só o lado perdedor tem apostas (devolve menos taxa; prêmio neutro volta ao patrocinador; penalidades
  vão ao fundo de prêmios); ninguém apostou e há prêmio neutro (volta ao patrocinador); o lado vencedor ficou vazio
  porque todos saíram (igual ao segundo caso). Caixa **OBJ-08**.
- **3.5 Fechamento das apostas.** D-09 e D-10, com as citações. Por que um pote precisa fechar antes: N-PO-06. A
  opção avançada de menos de 24 horas, com dupla confirmação e registro (N-TQ-29). A proposta gradual para perguntas
  longas (N-TQ-28, com a tabela), como resposta à pergunta D-10. Caixa **OBJ-21**.
- **3.6 Saída antecipada.** D-08, com as duas citações. O que os outros fazem (N-TQ-25). A fórmula proposta e a
  tabela de exemplos (N-TQ-23). Por que a penalidade fixa não basta (N-TQ-24). O que a tela mostra ("Sair agora
  devolve 77,72 dos seus 100,00"). Caixas **OBJ-04** e **OBJ-06**. Remissão a 11.6 para o furo de segurança e a
  fórmula revista.
- **3.7 O patrocinador.** D-18 a D-24, com as citações, e a dúvida inicial do próprio fundador ("sigo com a dúvida se
  há necessidade de um sponsor"). As duas formas, com N-PO-05 e uma linha de N-PA-04 e de N-PA-06. Tabela N-PA-01
  (os dois sentidos). Contrapartidas por faixa (N-PA-09, como proposta). Anônimo: "anônimo" é a palavra da decisão;
  o que o Cloak esconde está em 3.9. Caixa **OBJ-02**, com o exemplo de `2D` 4.2 (público põe 1.000 no SIM e 1.000 no
  NÃO; o patrocinador põe 5.000 no NÃO e não cumpre a meta; pote de 7.000, taxa de 210, sobram 6.790; ele recebe
  5.658, lucro de 658).
- **3.8 Sugestões pelo X.** D-12. Página com instruções e linha do tempo embutida, gratuita; ler menções por API
  custa US$ 0,005 por publicação (N-PF-15). Proposta de `2C` F3: lista curada pela equipe, nunca menção automática;
  página separada da página de aposta.
- **3.9 Outras redes e privacidade.** D-40. SODAX e Cloak em linguagem simples (N-TQ-17). Limite do Cloak (N-PA-12).
  Caixa **OBJ-23**.
- **3.10 Nome, mascote e layout.** D-39. O padrão de nomes do setor ("uma palavra + Markets") e os riscos já
  registrados na pesquisa de nome. AC-19. Caixa **OBJ-28**.

Tabelas obrigatórias: quatro (N-PO-01; casos do pote de um lado só; N-TQ-23; N-PA-01). Exemplos numéricos
obrigatórios: N-PO-01, N-PO-03, N-PO-05, N-PO-06 e o da caixa OBJ-02.

#### Capítulo 4. Perguntas e resolução on-chain — 1.700 palavras

O fundador disse que não entendeu a explicação anterior dos tipos de pergunta. Este capítulo é a segunda tentativa:
frases curtas, um exemplo por tipo, nenhum nome de arquivo de código.

- **4.1 O que é resolver lendo a rede.** O programa abre uma conta da Solana, lê um número ou uma chave e responde
  sim ou não. Qualquer pessoa aperta o botão; custa uma fração de centavo (N-TQ-07). Pode resolver antes da data se
  o fato acontecer (D-14). Comparar em três linhas com votação (Polymarket), chave da empresa (World) e modelo de
  linguagem (PNP), com remissão a 6.7.
- **4.2 Os nove tipos de pergunta prontos e as três famílias.** Tabela obrigatória dos nove tipos (`1H` 4.1): o que
  pergunta, um exemplo, quem controla o resultado. Depois as três famílias (N-TQ-05). Caixa **OBJ-03**, com o
  exemplo de `2C` E1: pote com 3.000 no SIM e 7.000 no NÃO; o dono da chave põe 3.000 no SIM por uma carteira nova;
  depois do fechamento, age e resolve; recebe 3.000 ÷ 6.000 × 97% × 13.000 = 6.305; lucro de 3.305, sem risco.
- **4.3 O padrão novo de token (Token-2022).** O que é e por que importa: os tokens do pump.fun são desse padrão
  (N-PF-21) e os leitores atuais só leem o clássico (N-TQ-06). Consequência: queima, renúncia e metadados não
  funcionam hoje nos tokens que o público negocia, e duas perguntas (renúncia de emissão e de congelamento) já nascem
  respondidas neles.
- **4.4 Preço como pergunta.** Resposta direta à pergunta D-17, com a citação. A conta da pool pequena (N-TQ-12), o
  caso Mango (N-TQ-13), a média no tempo (N-TQ-14), os três degraus (N-TQ-22). O que é a Pyth (N-TQ-11). Caixa
  **OBJ-24**.
- **4.5 Cardápio proposto para o primeiro dia.** D-16: a decisão é do fundador. Tabela N-TQ-21. Critério: "alguém
  decide este resultado de graça?". Ordem de construção dos leitores novos (N-TQ-22). A formatura como exemplo de
  azarão (N-PF-07; N-TQ-15).
- **4.6 Quem aciona a resolução.** D-15, com a citação. Por que existe o serviço agendado: o único caso em que
  ninguém se mexe é o fato acontecer, o SIM não perceber e o NÃO ficar quieto. Arquitetura em linguagem simples
  (N-TQ-10). Por que os agendadores on-chain não servem hoje (N-TQ-09). Remissão a 11.5.
- **4.7 Quando a resolução falha.** N-TQ-08, com o exemplo do dia 10 e do dia 30. O precedente do PancakeSwap
  (N-TX-07). O terceiro resultado, "Anulada", como proposta. Caixa **OBJ-25**.
- **4.8 O que dizer ao público.** K-23 e K-24. Caixa **OBJ-27**.

Tabelas obrigatórias: duas (nove tipos; cardápio). Exemplos numéricos obrigatórios: OBJ-03 (3.305), N-TQ-12, N-TQ-13.

#### Capítulo 5. Mercado e público — 1.300 palavras

- **5.1 Duas réguas para medir volume.** Definições de valor de face e dólares pagos, com o exemplo dos 100 contratos
  a US$ 0,27. Tabela obrigatória das duas réguas (N-ME-01 a N-ME-07). Regra: o Baked Market só se compara com
  dólares pagos. AC-05 em nota.
- **5.2 O tamanho do mercado de previsão.** N-ME-08, N-ME-09, N-ME-11 a N-ME-15 e N-ME-23. A projeção da Bernstein
  como projeção (AC-06), sem anualizar o mês. Concentração: N-ME-13. Sinais de alerta: N-ME-24, N-ME-25, N-ME-28
  (uma frase e "ver capítulo 15").
- **5.3 O mercado em Solana.** N-ME-17, N-ME-18, N-CO-20, N-CO-21. Leitura: o tamanho real em Solana é pequeno; o
  World, com a Phantom inteira por trás, fez cerca de US$ 15 milhões em setembro de 2026.
- **5.4 O público web3 e do pump.fun.** Tabela obrigatória com N-PF-01 a N-PF-08. Dizer o que não se sabe (N-PF-09,
  N-PF-10). Os quatro perfis, como hipótese (N-PF-11): o que cada um busca, o que o afasta e onde se informa.
- **5.5 No que esse público aposta.** N-ME-16, N-PF-12, N-ME-19, N-ME-21. Leitura: o que une o público é preço de
  cripto em prazo curto e eventos de grande atenção; fatos de projeto de token não aparecem como categoria.
- **5.6 Quem pagaria patrocínio.** Equipes de token, launchpads, validadores, protocolos (hipótese). O que já pagam
  por visibilidade: N-PA-07 em duas linhas, N-PF-14, com remissão a 7.4. Orçamento provavelmente menor em 2026
  (N-PF-06).
- **5.7 O tamanho que o plano considera.** As réguas dos três cenários (N-FC-03, linhas de régua), com remissão ao
  capítulo 9. Dizer que o plano não promete o tamanho da Polymarket.

Tabelas obrigatórias: duas (réguas; público). Não descrever concorrentes em detalhe: é o capítulo 6.

### 8.3 Parte B (capítulos 6 a 10) — alvo de 7.600 palavras

Arquivos que o redator da Parte B lê por inteiro: `ideacao`, `1E`, `1F`, `1G`, `2B` e `2E`. Lê nas seções
indicadas: `1A` (tabela e escolha dos cinco), `briefing` (seções 5 a 7 e 11), `2A` (O6, O7, O10, O11, O14),
`receita-mercados-de-previsao.md`, `patrocinio-e-destaque-pago.md` e `2D` (seção 3, só para a redação das caixas
OBJ-12 e OBJ-13, sem descrever leis).

#### Capítulo 6. Concorrência — 1.700 palavras

- **6.1 Mapa dos concorrentes.** D-38, com a citação. Tabela-resumo da lista longa (`1A`): nome, cadeia, mecanismo,
  quem abre, como resolve; só o que `1A` e `1E` confirmam; "não encontrado" onde for o caso. Critério de escolha dos
  cinco. Por que a Kalshi fica fora dos cinco (EUA, cadastro, esportes). Remissão a 5.1 para as réguas.
- **6.2 Melee.** N-CO-01 a N-CO-05. É o mais parecido e ainda não opera com dinheiro real (AC-04). Diferença de
  desenho: no Melee a saída é comprada por um cofre de terceiros; no Baked, a penalidade fica no pote.
- **6.3 PNP Protocol.** N-CO-06 a N-CO-09; K-05. Referência de ideias, não rival por usuários.
- **6.4 Polymarket.** N-ME-07 a N-ME-10, N-CO-10 a N-CO-19, N-TX-01, N-TX-02. Referência de escala e de problemas
  de resolução.
- **6.5 World (dentro da Phantom).** N-CO-20 a N-CO-24, N-TX-05. Melhor distribuição, pouco volume, uma chave decide.
- **6.6 Limitless.** N-CO-25 a N-CO-30, N-TX-04. O risco do token e do incentivo.
- **6.7 Como cada um resolve.** Tabela obrigatória (quadro comparativo da seção 4.2 deste arquivo) e a resposta de
  `1E`, seção 8: nenhum resolve por leitura direta de conta on-chain. Ressalva AC-28.
- **6.8 Onde o Baked Market é diferente e onde não é.** As cinco conclusões de `1E`, seção 8, sem suavizar: é
  diferencial real em confiança; é nicho em tamanho; o nicho coincide com o público; não é escudo contra
  manipulação; pode ser copiado (R-15).
- **6.9 O que copiar.** Tabela obrigatória (`1E`, seção 7): onde cada um é mais forte, onde é mais fraco, o que
  copiar. Lista curta do que copiar barato: política de reembolso escrita, página de taxas com exemplo, pagamento
  automático, indicação com parte da taxa, beta com pontuação.

Tabelas obrigatórias: três. Usar só dólares pagos nas comparações de volume.

#### Capítulo 7. Modelo de negócio e receita — 2.000 palavras

- **7.1 De onde vem a receita.** Duas linhas com número (corte do pote e patrocínio); as demais como opção futura.
  A pergunta do fundador ("essas empresas não tem outras formas de monetização, não?") é respondida em 7.7.
- **7.2 A taxa de 3%.** D-26, com as duas citações. Tabela do que os concorrentes cobram (N-TX-01 a N-TX-11).
  N-DT-01 (o caminho de cada US$ 100) e N-DT-02 (com a saída). Tabela obrigatória do favorito (seção 4.3 deste
  arquivo). Caixa **OBJ-07**, com o exemplo: pote de 1.000 com 950 no lado vencedor; hoje a taxa é 30 e o vencedor
  recebe 1,021; com o teto pelo lado perdedor, a taxa é 5 e o vencedor recebe 1,047.
- **7.3 O destino da taxa.** D-27, com a citação inteira. Tabela N-DT-03. A frase que o BP não pode omitir: "a
  margem que paga as contas não é 3%, é 0,75% do volume (0,64% com a saída antecipada)". Caixa **OBJ-09**; a
  comparação dos dois regimes fica em 9.5.
- **7.4 Patrocínio.** D-18 e D-19. As tabelas N-PA-03, N-PA-04, N-PA-05 e N-PA-06, sempre com os dois sentidos. O
  que os precedentes sustentam (`1F` 4.6): quando se vende prêmio, quase tudo vai ao pote; quando se vende vitrine,
  tudo vai ao site; nenhum precedente de 70/30 em qualquer sentido. Preços comparáveis (N-PA-07) e impressões
  (N-PA-08). N-PA-10 e N-PA-11. Perguntas em aberto (AC-07). Caixa **OBJ-15**. Remissão a 3.7 para o produto e a
  OBJ-02.
- **7.5 Fundo de prêmios.** Resposta à pergunta do fundador sobre o que é e para que serve: definição do glossário,
  usos (N-DT-08), quanto entra (N-DT-05), quanto precisa atrair (N-DT-04), regra dos três sinais (N-DT-06), exemplos
  (N-DT-07). Caixa **OBJ-16**.
- **7.6 Tesouraria em Bitcoin.** D-27. Precedentes (N-DT-09), quanto se acumula (N-DT-10), como guardar (N-DT-12).
  Caixa **OBJ-10**, com N-DT-11.
- **7.7 Outras formas de receita.** Tabela N-DT-16.
- **7.8 Uma pergunta do começo ao fim.** O exemplo N-FC-08 inteiro, com a tabela, nos dois sentidos, e as três
  leituras de `2E` (o patrocinador paga mais custo que a parcela da operação; o fundo pôs 150 e recebeu cerca de 75;
  a saída tirou 814,91 da base da taxa).

Tabelas obrigatórias: nove (taxas do setor; N-DT-01; favorito; N-DT-03; N-PA-03; N-PA-04; N-PA-06; N-DT-16;
N-FC-08).

#### Capítulo 8. Os dois tokens — 1.500 palavras

Regra deste capítulo: nenhuma promessa de retorno, de preço ou de valorização. As palavras "pumpar", "dividendo" e
"subir preço" só aparecem entre aspas, como citação do fundador, e ao lado da objeção correspondente.

- **8.1 Por que dois tokens.** D-29 e D-30, com as citações. Um parágrafo: o token A dá atenção e comunidade; o
  token B carrega a economia do produto.
- **8.2 Token A, no pump.fun.** O que a plataforma impõe (N-PF-16 a N-PF-21), em linguagem simples (o fundador disse
  "não entendi nada" sobre essa parte). O que o token A pode alimentar: a taxa de criador para o fundo de prêmios
  (N-TK-03, linha E). Holder Rewards: em aberto (D-33).
- **8.3 Token B, na venda privada.** Como se faz uma venda privada hoje (três contratos e plataformas, `1G` seção 2,
  em um parágrafo). Distribuição e travas propostas (N-TK-04, tabela). Mercado de vendas (N-ME-27). Tudo como
  proposta; depende de jurisdição e de parecer (remissão ao capítulo 15).
- **8.4 A ideia dos 30%.** D-31, com a citação da rodada 4 ("para cada 1 dólar que alguém comprar do nosso token ...
  a gente pega 30% e redistribui aumentando liquidez em todas as pools das perguntas? Isso é positivo?"). Por que
  não é possível no pump.fun (N-PF-17). Tabelas N-TK-02 e N-TK-03. Caixa **OBJ-14**.
- **8.5 Recompra e queima.** D-27 e D-29. Precedentes (N-DT-13). A conta contra os desbloqueios (N-DT-14) e a
  avaliação sustentada (N-DT-15). Caixa **OBJ-11**.
- **8.6 "Dividendo aos holders".** D-32. Como pagar a quem segura um token sem obrigar a travar (`1G` 5.1, em
  linguagem simples, com o exemplo: 1.000 USDC depositados para 10 milhões de tokens; quem tem 250.000 saca 25).
  Caixa **OBJ-12**. Uma frase: "o que os reguladores dizem sobre repasse está no capítulo 15".
- **8.7 Ordem de lançamento.** D-30. A ordem proposta por `1G` (N-TK-05). Caixa **OBJ-13**.
- **8.8 O que dizer a quem comprar o token A.** Os seis pontos de `1G` 6.4. Precedentes (N-TK-06, tabela): o que
  funcionou (dar o segundo a quem tem o primeiro) e o que não (converter com perda; anunciar "sem utilidade").

Tabelas obrigatórias: cinco (regras do pump.fun; N-TK-02; N-TK-03; N-TK-04; N-TK-06).

#### Capítulo 9. Projeções financeiras — 1.700 palavras

- **9.1 Como ler as projeções.** Tudo é INFERÊNCIA; não há dado de uso; o modelo não tem impostos, aquisição paga
  nem venda de token como receita.
- **9.2 Premissas.** Tabela N-FC-01 inteira e as fórmulas (N-FC-02).
- **9.3 Três cenários.** Tabelas N-FC-03, N-FC-04 e N-FC-05. N-FC-06 e N-FC-07 em texto. Dizer com todas as letras:
  o ruim não se paga em nenhum regime; o piso verdadeiro é volume perto de zero.
- **9.4 Ponto de equilíbrio.** Tabela N-FK-01. O pote não gira o dinheiro (N-FK-09, com a tabela). Quanto vale um
  apostador (N-FK-10).
- **9.5 Dois regimes para o destino da taxa.** Definição dos regimes (seção 4.8 deste arquivo). Tabela N-FK-02. A
  decisão do fundador é o regime (a); o (b) é a alternativa da OBJ-09 (caixa em 7.3). N-FK-08.
- **9.6 Capital necessário e uso dos recursos.** Tabelas N-FK-03 e N-FK-04. N-FK-05 (custo fixo desde o primeiro
  mês). De onde pode vir (`2E` seção 5): sócios; receita; patrocínio; venda privada (não entra como caixa em nenhum
  cenário; N-DT-15); token A (não financia a operação). Custos fora do modelo (N-FK-11). Riscos R-03 e R-04 em uma
  frase, com remissão a 14.2. Caixa **OBJ-29**.
- **9.7 Sensibilidades.** Tabela N-FK-07 e os três empates.
- **9.8 Metas de 90 dias e critério de parada.** D-43, com a citação. Tabela N-FM inteira. O critério de parada e
  N-FK-06.
- **9.9 O que o modelo não sabe.** Os dezenove itens de `2E`, seção 10, condensados em uma lista.

Tabelas obrigatórias: nove (N-FC-01, 03, 04, 05; N-FK-01, 02, 03, 07; N-FM). Nenhum número fora da ficha.

#### Capítulo 10. Entrada no mercado — 700 palavras

- **10.1 Princípio: aquisição orgânica.** A conta de N-FK-10: aquisição paga não fecha. Os canais que cabem são os
  gratuitos ou os que outro paga.
- **10.2 Canais.** O X, o mascote e a página de sugestões (D-12); a comunidade que cada patrocinador traz; o token A
  como marketing (D-30: "para servir de marketing pra nossa plataforma"; remissão a 8.7); indicação com parte da
  taxa, com trava (precedente K-06; é custo, não receita); integração com carteira como objetivo de médio prazo
  (N-ME-17: 98% do volume da DFlow veio da Phantom). O que os outros fizeram: fila e pontuação do Melee (N-CO-02);
  pontos e token da Limitless e o que aconteceu depois (N-ME-20).
- **10.3 Antes de construir: validar.** O teste de demanda da OBJ-01 e as cartas de intenção da OBJ-15, como
  proposta, com remissão a 2.5 e a 7.4.
- **10.4 Sequência de lançamento.** As cinco fases em uma linha cada, com remissão a 12.1. Perguntas curtas primeiro
  (R-05).
- **10.5 Como medir.** Meta de retenção no lugar de meta de volume: carteiras que apostam de novo em 30 dias sem
  prêmio. Remissão a 9.8. Nada de material em português nem campanha no Brasil antes do parecer: uma frase e "ver
  capítulo 15".

### 8.4 Parte C (capítulos 11 a 16 e anexos) — alvo de 7.700 palavras

Arquivos que o redator da Parte C lê por inteiro: `ideacao`, `2C`, `2F` e `2D`. Lê nas seções indicadas: `1H`
(seções 3 e 4.2), `1C`, `2A` (O12, O13, O15 e as duas listas finais), `2B` (seções 9 a 11) e `briefing` (seções 4,
12 e 13).

#### Capítulo 11. Tecnologia e arquitetura — 1.500 palavras

Escrito para quem não é engenheiro: cada peça com o que é, por que existe e um exemplo. Nomes de instruções do
programa só entre parênteses, depois da explicação em português.

- **11.1 O que existe hoje.** N-TQ-01 e N-TQ-02. O que o programa atual faz bem (ler a rede e resolver) e o que ele
  não é (o modelo de patrocinador com recompensa não é a proposta, D-01).
- **11.2 O programa novo.** N-TQ-03. Tabela obrigatória "o que fica, o que sai, o que é novo" (`briefing` seção 4 e
  `2F` 1.1, condensada). É um programa novo ao lado do atual. As contas que têm de fechar sempre: o que o cofre tem
  é igual ou maior que o que o programa deve (`2C` S7), em linguagem simples.
- **11.3 Contas e dinheiro.** Um cofre por pergunta; um registro por apostador, com depósito de aluguel (N-TQ-16);
  pagamentos sempre puxados por quem recebe; moeda só o USDC, com endereço fixo; três resultados (SIM, NÃO,
  Anulada). O problema de quem chega só com USDC e sem SOL para pagar a rede.
- **11.4 Chaves e poderes.** O programa atual não tem chave de administrador; o novo terá. Tabela obrigatória
  N-TQ-30. Multisig, trava de tempo e compilação verificável, com as definições do glossário (N-TQ-19). R-01.
  A divisão da taxa em quatro é feita fora do programa, pelo multisig, com registro público (`2C` K5).
- **11.5 A resolução na prática.** A arquitetura de N-TQ-10, peça por peça. Custo (N-TQ-07). Perguntas de época
  (N-TQ-08). Por que não se embute a resolução na aposta (K-20). Remissão a 4.6 e 4.7 e à caixa OBJ-25.
- **11.6 A segurança da saída antecipada.** O exemplo N-TQ-26 inteiro, com a tabela de passos de `2C` S1. Os demais
  achados (N-TQ-27). A fórmula revista. Caixa **OBJ-05**. Remissão a 3.6.
- **11.7 Site e servidor.** O site hoje lê a rede direto do navegador; o que precisa virar servidor (R-12; N-TQ-18).
  O site como elo mais fraco (R-11). Cloak e SODAX fora da página de aposta (remissão à caixa OBJ-23, em 3.9).
  Nomes de usuário do X são dado pessoal: as nove perguntas da regra de privacidade do projeto antes de guardar.
- **11.8 Requisitos mínimos antes da rede principal.** Os trinta requisitos de `2C`, seção 13, em tabela obrigatória
  de seis grupos (chaves e código; limites gravados no código; contas e aritmética; testes; perguntas; operação),
  com os itens em frases curtas. Aviso visível de "programa sem auditoria" enquanto for verdade.

Tabelas obrigatórias: quatro (fica, sai, novo; poderes; passos do exemplo S1; requisitos).

#### Capítulo 12. Roteiro — 1.000 palavras

Sem datas: o roteiro é por fases, sprints e critérios de pronto (`2F`).

- **12.1 As cinco fases.** N-TQ-31. Tabela obrigatória: fase, objetivo, o que o usuário consegue, pronto quando
  (`2F` seção 3, condensada). A rede principal é a quinta fase. Caixa **OBJ-26**.
- **12.2 Os doze sprints.** Tabela obrigatória (`2F` seção 4): sprint, entrega, depende de, fase. O sprint 1 é só de
  decisões de regra. A revisão externa precisa ser contratada por volta do sprint 7.
- **12.3 Cada desejo do fundador e a fase em que entra.** Tabela obrigatória (`2F`, "Mapa dos desejos do fundador"),
  com a observação de cada linha.
- **12.4 O que fica fora do primeiro lançamento na rede principal.** A lista de `2C`, seção 14, como proposta do red
  team, dizendo em cada item se contraria uma decisão: só a saída ligada em todas as perguntas contraria (OBJ-04);
  os demais são ordem de entrega.
- **12.5 Os tokens no roteiro.** A decisão (D-30: pump.fun primeiro). A ordem proposta por `1G` (N-TK-05). A posição
  de `2F` (tokens fora do MVP; nenhuma instrução do programa depende deles). Remissão a 8.7 e à caixa OBJ-13.

#### Capítulo 13. Equipe e operação — 700 palavras

- **13.1 A equipe hoje.** O fundador (Lucas), dono do produto e das decisões de regra, que não é engenheiro de
  protocolo. O sócio técnico (Ronaldo), autor do programa atual e dos documentos técnicos. Assistentes de código.
  Tamanho da equipe e horas dedicadas: não encontrado em nenhum documento; dizer isso.
- **13.2 Papéis e quem falta.** Tabela obrigatória (`2F` 5.2): papel, quem hoje, observação. Sem dono: operação do
  serviço agendado e plantão; revisão externa e auditoria; jurídico; moderação das perguntas e do X; terceira chave
  do multisig.
- **13.3 A dependência do sócio técnico.** N-TQ-02. Tabela de `2F` 5.1, condensada. Caixa **OBJ-19**.
- **13.4 A operação do dia a dia.** Abrir perguntas (quem propõe, quem aprova, quantas por semana: em aberto; R-16);
  atender o alarme; moderar o texto do patrocinador; medir o fundo de prêmios. Custo por nível: remissão a 9.2.
  Capacidade de construir (R-19).
- **13.5 Regras da casa.** Propostas, nenhuma decidida (R-13): a equipe não aposta; carteiras da equipe publicadas;
  nenhuma pergunta sobre o token da casa; pedido de patrocínio aceito e aplicado na mesma transação; plano de
  incidente de uma página (R-18).

#### Capítulo 14. Riscos — 1.300 palavras

- **14.1 Como ler este capítulo.** A definição de cada severidade (seção 6 deste arquivo). As caixas de objeção estão
  nas seções de origem; aqui fica o quadro inteiro.
- **14.2 Quadro de riscos.** Tabela obrigatória com as 29 objeções e os 19 riscos R-01 a R-19: código, risco em uma
  frase, severidade, seção em que é tratado. Ordenada por severidade.
- **14.3 Os riscos críticos.** Um parágrafo por grupo, com o número que o sustenta: (1) demanda (OBJ-01); (2)
  integridade: quem controla o resultado aposta (OBJ-02, OBJ-03, R-13); (3) dinheiro do usuário: saída, resolução,
  chave de atualização, programa sem auditoria (OBJ-04, OBJ-05, OBJ-25, OBJ-26, R-01); (4) finanças: 0,64% do
  volume, apostador que vale US$ 9, capital sem fonte (OBJ-09, R-02, R-03); (5) regulação e pessoas: Brasil,
  jurisdição, identificação, sócio (OBJ-17, OBJ-18, OBJ-20, OBJ-19). Para regulação, só "ver capítulo 15".
- **14.4 Os riscos altos.** Lista comentada, em uma ou duas linhas cada.
- **14.5 O que continua de pé.** Os nove pontos da seção 6.2 deste arquivo.

#### Capítulo 15. Regulação e conformidade — 1.600 palavras

Regra deste capítulo: descrever o que a regra ou o caso diz, com a fonte, e marcar como ponto para advogado. Nunca
escrever que algo "é permitido", "é legal" ou "é ilegal". Graus de exposição são INFERÊNCIA do agente 2D.

- **15.1 Aviso.** Isto não é parecer jurídico.
- **15.2 Brasil.** N-RG-01 a N-RG-07 e N-RG-17. A dúvida central, sem concluir: o pote não fixa o multiplicador na
  hora da aposta, e a Nota Técnica fala em prêmio "determinável" (`2D` 1.4). A MP 1.394 com a marca **[A
  confirmar]** (AC-01), no formato da seção 7. Caixa **OBJ-17**.
- **15.3 Estados Unidos.** N-RG-08 e N-RG-09.
- **15.4 Europa.** N-RG-10 a N-RG-12. As perguntas de preço têm exposição própria (opção binária).
- **15.5 Tokens.** N-TK-08 e a tabela de `2D` 3.2 (token A contra token B). As três observações de `2D` 3.2.
  Remissão às caixas OBJ-12 e OBJ-13, no capítulo 8.
- **15.6 Integridade de mercado.** N-RG-13. Remissão à caixa OBJ-02, em 3.7. As alternativas de `2D` 4.2.
- **15.7 Privacidade: o caso Tornado Cash e o Cloak.** N-RG-14. O que o Cloak diz fazer (triagem de sanções; AC-12).
- **15.8 Sem identificação: o padrão do setor.** N-RG-15 e a tabela de `2D`, seção 6. Caixa **OBJ-20**.
- **15.9 Estruturas que plataformas parecidas adotaram.** N-RG-16 e `2D`, seção 8, sem recomendar. Custos de
  licença (N-FK-11). Caixa **OBJ-18**.
- **15.10 O que precisa existir antes da rede principal.** Tabela obrigatória com os dezoito itens de `2D`, seção 9.
- **15.11 Perguntas para o advogado.** As dez de `2D`, na ordem de urgência, e a lista do que não foi lido (AC-21).

Tabelas obrigatórias: três (mapa de exposição de `2D`, seção 7, condensado em dezoito linhas; padrão do setor; o que
precisa existir).

#### Capítulo 16. Decisões em aberto e próximos passos — 600 palavras

- **16.1 Decisões pendentes do fundador.** A lista canônica de catorze itens (seção 8.1), cada um com a remissão à
  seção em que as opções estão.
- **16.2 Perguntas para o sócio técnico.** A lista da seção 8.1.
- **16.3 A confirmar.** Tabela com os pontos AC-01 a AC-28, em uma linha cada.
- **16.4 Próximos passos, em ordem.** A lista canônica de sete passos (seção 8.1).

#### Anexos — 1.000 palavras

- **Anexo A. Glossário.** Os termos da seção 5 deste arquivo, em ordem alfabética, com definição e exemplo.
- **Anexo B. Fontes.** A lista de arquivos da seção "Fontes" deste arquivo, com uma linha sobre o que cada um cobre e
  a frase: "os endereços das fontes externas estão na seção 'Fontes' de cada arquivo".
- **Anexo C. Índice das objeções registradas.** Tabela: código, objeção em uma frase, severidade, seção da caixa
  (seção 6.1 deste arquivo).

---

## 9. Regras de redação para os três redatores

1. **Língua e tom.** Português do Brasil. Tom direto, para um fundador que não é engenheiro de protocolo e que já
   rejeitou respostas curtas demais e sem contexto. Frases completas. Prosa quando o assunto é raciocínio; tabela
   quando é comparação de números.
2. **Cada conceito com três coisas:** o que é, por que existe, um exemplo com números. A definição é a da seção 5.
3. **Sem siglas soltas.** Na primeira vez em cada capítulo, por extenso: "identificação do usuário (KYC)", "formador
   de mercado automático (AMM)", "média no tempo (TWAP)". Nomes de produtos (USDC, pump.fun, Pyth) ganham uma frase
   de explicação na primeira vez. Não usar setas, travessões em série nem abreviações de conversa.
4. **Decisões do fundador como decisões.** Formato: "**Decisão.** ..." seguido da citação entre aspas quando houver.
   Não escrever "sugere-se" ou "poderia" para o que ele decidiu. O que está ambíguo ou em aberto (seção 2) aparece
   como "**Em aberto.**", com as opções, e vai à lista de 16.1.
5. **Objeções em caixa.** Uma caixa por objeção, na seção indicada na seção 6.1, neste formato:

   ```text
   > **Objeção registrada OBJ-07 · severidade alta**
   > **Decisão do fundador:** taxa de 3% do pote.
   > **O que a revisão crítica achou:** ...
   > **Evidência:** ... (etiqueta e fonte)
   > **Alternativa proposta:** ...
   > **Situação:** a decisão vale; a alternativa fica para o fundador decidir.
   ```

   A caixa não é suavizada nem resumida a ponto de perder a evidência. O texto fora da caixa não discute com ela.
6. **Etiquetas nos números.** Todo número leva FATO, FATO SECUNDÁRIO ou INFERÊNCIA, com a fonte curta e a data:
   "(FATO SECUNDÁRIO, DefiLlama, set/2026)". Em tabela, a etiqueta pode ir numa coluna ou na legenda da tabela.
   Projeções e premissas: "INFERÊNCIA (premissa sem dado)". Pontos da seção 7: **[A confirmar]**.
7. **Só números da ficha.** Nenhum número de mercado, concorrente, preço, lei ou projeção fora da seção 4. Somas e
   porcentagens novas só se a conta for mostrada e conferida. Alvos de perguntas de exemplo ("o SOL toca US$ X")
   podem usar letras ou valores claramente ilustrativos.
8. **Nada de promessa.** Nenhuma promessa de retorno, de lucro, de preço de token ou de valorização. Nenhuma frase
   de venda ("oportunidade única", "revolucionário"). O BP é um plano, não um anúncio.
9. **Nada de opinião jurídica.** Fora do capítulo 15, leis não são descritas. No capítulo 15, só o que o texto diz e
   "ponto para advogado".
10. **Risco à vista.** Um BP que omite o que o red team achou não serve ao fundador. Quando um capítulo apresenta
    uma decisão que tem objeção, a caixa vem na mesma seção, não num apêndice.
11. **Fatos que mudaram de arquivo para arquivo:** vale a seção 3 deste arquivo. Em especial: volumes só em dólares
    pagos, com o valor de face ao lado; nenhum número do site do Melee; "resolução por dado verificável on-chain".
12. **Nomes.** "Baked Market" (singular). "O fundador" ou "Lucas"; "o sócio técnico" ou "Ronaldo". Nenhum outro
    dado pessoal. Concorrentes pelo nome usual (Polymarket, Kalshi, Melee, PNP, World, Limitless).
13. **Versão.** v0.0.1, de 4 de outubro de 2026. O estado é "primeira versão, para revisão do fundador".
14. **Formato.** Markdown. Linhas de prosa de até 120 caracteres (tabelas podem passar). Uma linha em branco antes e
    depois de tabela, lista e caixa. Sem emojis. Sem notas de rodapé numeradas: a fonte vai entre parênteses.
15. **Ambiente.** A ferramenta de leitura devolve só a primeira linha dos arquivos: ler com `cat` pelo shell. A
    primeira gravação de cada arquivo é barrada por um hook que pede fatos (seção A.6 do plano das ondas): gravar
    primeiro só o título, responder ao hook e então gravar o conteúdo. Cada redator grava só a sua parte, não altera
    outros arquivos e não faz commit.
16. **Conferência antes de entregar.** Contar as palavras do arquivo; conferir que todas as seções deste roteiro
    existem com o número certo; conferir que cada caixa de objeção atribuída à parte está presente; reler toda
    conta copiada.

Caixas por parte, para a conferência do item 16:

| Parte | Caixas que ela contém |
|---|---|
| A | OBJ-01 (2.5); OBJ-22 (3.3); OBJ-08 (3.4); OBJ-21 (3.5); OBJ-04 e OBJ-06 (3.6); OBJ-02 (3.7); OBJ-23 (3.9); OBJ-28 (3.10); OBJ-03 (4.2); OBJ-24 (4.4); OBJ-25 (4.7); OBJ-27 (4.8) |
| B | OBJ-07 (7.2); OBJ-09 (7.3); OBJ-15 (7.4); OBJ-16 (7.5); OBJ-10 (7.6); OBJ-14 (8.4); OBJ-11 (8.5); OBJ-12 (8.6); OBJ-13 (8.7); OBJ-29 (9.6) |
| C | OBJ-05 (11.6); OBJ-26 (12.1); OBJ-19 (13.3); OBJ-17 (15.2); OBJ-20 (15.8); OBJ-18 (15.9) |

---

## O que isto muda no plano (INFERÊNCIA)

Nenhuma decisão do fundador foi alterada. O que segue é leitura minha, para o agente principal e para o fundador.

1. **O BP v0.0.1 sai com a visão do fundador inteira e com 29 objeções à vista.** Doze são críticas. Nenhuma foi
   resolvida pelas ondas, porque resolvê-las é decidir, e decidir é do fundador.
2. **Catorze decisões pendentes travam o início da construção** (lista em 8.1). As quatro primeiras (70/30, pote de
   um lado só, destino da penalidade, cardápio) viram erro de código se não forem fechadas antes do primeiro sprint.
3. **A demanda é a pergunta que o BP não responde.** Tudo o mais (finanças, roteiro, tokens) supõe que ela existe.
4. **O número que organiza as finanças é 0,64% do volume, não 3%.** O plano de partida que as contas sustentam é o
   nível 1 de custo, com capital dos sócios de US$ 70 a 110 mil, dos quais US$ 51,5 mil antes do lançamento.
5. **A regulação mudou de patamar durante a pesquisa.** Se a MP 1.394 se confirmar, o caminho de licença no Brasil
   deixou de existir. O parecer jurídico passou a ser o primeiro gasto, antes da construção.
6. **Três documentos do repositório ficaram para trás** e devem ser atualizados depois do BP: o `briefing` (saída,
   divisão da taxa, rendimento), o `regulacao.md` (MP 1.394, ESMA, correções) e o `DESIGN-DIRECTION.md` (direção
   aprovada).
7. **Correções que o agente principal deve levar ao `source-index.md`:** K-01 a K-15 e K-34 a K-35.

## Perguntas em aberto

Para o fundador: as catorze da seção 8.1. Para o sócio técnico: a lista da seção 8.1. Para o advogado: as dez de
`2D`. Para conferir em fonte: os vinte e oito pontos da seção 7.

Uma pergunta que é só minha, para o agente principal: os três redatores trabalham em paralelo e o sumário executivo
(Parte A) cita números das Partes B e C. Se um redator corrigir uma conta ao escrever, o agente principal precisa
propagar a correção ao sumário na montagem.

## Fontes

Não houve pesquisa na web. Todos os números vêm dos arquivos abaixo, lidos em 4 de outubro de 2026; os endereços das
fontes externas estão na seção "Fontes" de cada um.

Decisões e plano:

- `docs/business/_review/plano-das-ondas.md`
- `docs/business/ideacao-perguntas-e-respostas.md` (fonte da verdade)
- `docs/business/BRIEFING-MERCADO-DE-POTE.md` (anterior à rodada 5; superado em três pontos, ver seção 2)

Onda 1:

- `knowledge-base/competitors/competitor-longlist.md` (agente 1A)
- `knowledge-base/competitors/top-5-competitor-analysis.md` (agente 1E)
- `knowledge-base/market/market-research.md` (agente 1B)
- `knowledge-base/market/publico-web3.md` (agente 1D)
- `knowledge-base/market/regulacao.md` (agente 1C)
- `knowledge-base/market/monetizacao-e-tesouraria.md` (agente 1F)
- `knowledge-base/market/dois-tokens-e-ico-privado.md` (agente 1G)
- `knowledge-base/tecnologia/saida-fechamento-cron-e-perguntas.md` (agente 1H)

Onda 2:

- `docs/business/_review/wave-2-devils-advocate.md` (agente 2A)
- `docs/business/_review/wave-2-business-finance.md` (agente 2B)
- `docs/business/_review/wave-2-technical-security.md` (agente 2C)
- `docs/business/_review/wave-2-compliance.md` (agente 2D)
- `docs/business/_review/wave-2-modelo-financeiro.md` (agente 2E)
- `docs/business/_review/wave-2-viabilidade-mvp.md` (agente 2F)

Apoio, lido no que foi necessário:

- `knowledge-base/market/receita-mercados-de-previsao.md` (inteiro)
- `knowledge-base/market/patrocinio-e-destaque-pago.md` (inteiro)
- `knowledge-base/pesquisa-nome-do-site.md` (inteiro)
- `knowledge-base/market/modelos-de-token.md` (resumo, seções 1 e 2, e a linha do PUMP)
- `knowledge-base/tecnologia/privacidade-entre-redes-e-x.md` (resumo e seção A.1)
- `LICENSE` (cabeçalho, para a K-25)

Não li: `knowledge-base/market/rendimento-do-pote.md` (assunto abandonado pelo fundador, D-06),
`knowledge-base/competitors/mercados-de-previsao-web3.md` (substituído por `1A` e `1E`),
`knowledge-base/market/source-index.md`, os arquivos de `knowledge-base/referencias/` e os documentos do sócio em
`upstream/main` (`ECONOMICS.md`, `RESOLVERS.md`, `PRIVACY_PLAN.md`); o que cito deles vem pelos relatórios das ondas.
