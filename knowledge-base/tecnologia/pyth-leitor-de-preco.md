# Pyth e o leitor de preço — prova da Sprint 01

Levantamento de 5 de outubro de 2026. Responde às perguntas C1, C2, C3, C4 e C12 do plano técnico (seção 14.4), que
o plano marcava como "a conferir". Tudo o que está em "Fatos" foi lido na fonte: a própria rede, por consulta
direta, ou a documentação oficial da Pyth. O que é conclusão minha está em "Inferências".

## Veredito

**A Pyth serve na devnet.** Os programas existem lá, nos mesmos endereços da rede principal; as contas de preço de
SOL e de BTC existem, com o formato esperado; e o leitor escrito nesta sprint lê as contas reais. A decisão de abrir
com cinco tipos de pergunta, com o preço construído primeiro, se sustenta.

Três coisas mudam em relação ao que o plano supunha, e nenhuma derruba o veredito:

1. **A documentação da Pyth data de 26 de agosto de 2026 uma atualização do núcleo.** Há duas gerações de programas
   na Solana, e a recomendada para integração nova não é a que todo material antigo cita. Os programas da geração
   atualizada estão na rede desde 5 de maio de 2026 (seção 1.8); o que mudou em agosto, pelo que se vê de fora, foi
   a documentação e o serviço de preços.
2. **O serviço público de preços passou a exigir chave**, com teste gratuito e planos pagos. Só precisa dele quem
   publica preço por conta própria.
3. **Na rede principal a conta de preço patrocinada renova a cada 5 a 11 segundos.** Isso pode dispensar o nosso
   serviço de publicar preço, que era a parte que exigiria a chave. Na devnet ela renova a cada 62 a 64 segundos.

## 1. Fatos

### 1.1 As duas gerações de programas (C1)

Fonte: `docs.pyth.network/price-feeds/core/upgrade/contracts` e `.../upgrade/preparing/solana`, lidas em 5/10/2026,
e consulta às duas redes.

| Programa | Geração anterior | Geração atualizada |
|---|---|---|
| Receptor (dono das contas de preço) | `rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ` | `rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp` |
| Contas de preço patrocinadas | `pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT` | `pyt2F414BA6dPttK6RddPZUdHfapoBN24GL5wbrPCou` |
| Wormhole | `HDwcJBJXjL9FpJ7UBsYBtaDjsBUhuLCUYoz3zr8SWWaQ` | `HDw2E7P8X1SkCyjvoGsfBGAVUutKcj874bXjHrpVYrVL` |

- A documentação diz: "The same program addresses are used across SVM networks." Os seis programas existem na
  devnet e na rede principal (conferido por `getAccountInfo`).
- A documentação diz que a geração anterior foi atualizada no lugar pela DAO e continua funcionando, e recomenda a
  atualizada para integração nova. Diz também: "Each endpoint's payloads verify only on its own contract
  generation." Na rede, o receptor anterior da rede principal não é reinstalado desde março de 2025 (seção 1.8). O
  que "atualizada no lugar" quer dizer ali: não conferido.
- O endereço de cada conta de preço é derivado do programa de contas e do identificador do preço. Como o programa
  mudou, os endereços das contas mudaram.

### 1.2 As contas de preço de SOL e BTC

Identificadores, do serviço da Pyth (`/v2/price_feeds`, que responde sem chave):

| Ativo | Identificador |
|---|---|
| SOL/USD | `ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d` |
| BTC/USD | `e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43` |

Endereços das contas (fatia 0), iguais na devnet e na rede principal:

| Ativo | Geração anterior | Geração atualizada |
|---|---|---|
| SOL/USD | `7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE` | `7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE` |
| BTC/USD | `4cSM2e6rvbGQUFiJbqytoVMi5GgghSMr8LwVrT9VPSPo` | `APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5` |

As oito contas (dois ativos, duas gerações, duas redes) existem, pertencem ao receptor da geração correspondente,
têm 134 bytes e trazem o identificador certo.

### 1.3 O formato da conta `PriceUpdateV2` (C2)

Conferido byte a byte nas oito contas, com os valores batendo com o preço de mercado e o slot gravado batendo com o
slot da rede no momento.

| Posição | Tamanho | Campo |
|---|---|---|
| 0 | 8 | Discriminador: `22 f1 23 63 9d 7e f4 cd` |
| 8 | 32 | Quem pode regravar a conta |
| 40 | 1 | Nível de verificação: 1 é completa; 0 é parcial e vem seguido de mais um byte |
| 41 | 32 | Identificador do preço |
| 73 | 8 | Preço, inteiro com sinal |
| 81 | 8 | Margem de erro, inteiro sem sinal |
| 89 | 4 | Expoente (−8 em SOL e BTC: o preço é o inteiro dividido por 100 milhões) |
| 93 | 8 | Horário de publicação, em segundos |
| 101 | 24 | Horário anterior e média móvel do preço e da margem |
| 125 | 8 | Slot em que a conta foi gravada |
| 133 | 1 | Sobra, zero quando a verificação é completa |

As duas gerações gravam o mesmo formato e o mesmo discriminador. O que as distingue é o dono da conta.

A fonte mais forte do formato é o próprio programa: o receptor atualizado publica na rede a descrição das suas
contas (o IDL, `pyth_solana_receiver` 0.2.1), e ela declara os mesmos campos, na mesma ordem (seção 1.8).

### 1.4 Frequência de atualização das contas patrocinadas

Medido em 5/10/2026, lendo a conta de SOL a cada 8 a 10 segundos.

| Rede | Geração | Intervalo entre atualizações | Idade do preço observada |
|---|---|---|---|
| Rede principal | Atualizada | 5 a 11 segundos | 0 a 5 segundos |
| Rede principal | Anterior | 55 segundos | até 31 segundos |
| Devnet | Atualizada | 62 a 64 segundos | 5 a 64 segundos |
| Devnet | Anterior | 320 segundos | até 312 segundos |

A documentação dá, para as contas patrocinadas, "55 seconds heartbeat / 0.5% price deviation" como padrão: a conta
é regravada a cada 55 segundos ou quando o preço se move 0,5%, o que vier primeiro.

Numa leitura da rede principal, o horário de publicação estava 2 segundos **à frente** do relógio de quem lia.

### 1.5 Taxa e chave (C3)

- **Taxa por atualização: zero.** A configuração do receptor, lida nas duas redes, tem
  `single_update_fee_in_lamports = 0` e exige 3 assinaturas. Quem publica paga só a taxa de rede.
- **O serviço de preços exige chave.** A documentação: "Hermes now requires an API Key", desde 26 de agosto de
  2026; "a free trial is included, paid plans cover ongoing use". Conferido: `hermes.pyth.network` devolve 401 ao
  pedido de preço assinado sem chave. A listagem de identificadores responde sem chave.
- **O endereço novo do serviço** para a geração atualizada é `pyth.dourolabs.app/hermes`, com a chave no cabeçalho
  `Authorization`. A chave se obtém no Pyth Terminal.
- **A devnet aceita os mesmos preços assinados** que a rede principal: a configuração do receptor lista a mesma
  fonte válida nas duas.
- **Há quem publique na devnet agora.** As 25 transações mais recentes do receptor anterior na devnet tinham entre
  0 e 28 segundos e vinham de pelo menos três pagadores diferentes.

### 1.6 Surfpool (C4)

- Última versão: **v1.6.0**, de 18 de setembro de 2026, marcada como estável. As seis versões anteriores também
  (fonte: API de lançamentos do repositório `txtx/surfpool`).
- Binários publicados: Linux x64 e macOS. **Não há binário para Windows.**
- Traz modelos de `PriceUpdateV2` para SOL/USD, BTC/USD, ETH/USD e ETH/BTC, e um sistema de cenários que regrava
  contas ao longo do tempo (fonte: a skill de Solana instalada, `surfpool/overview.md`).
- Se ele simula o stake de época: **não conferido**.

### 1.7 O relógio da rede (C12)

Uma leitura de cada rede em 5/10/2026, comparando o relógio da rede com o relógio real: devnet 1 segundo à frente;
rede principal, zero. É uma amostra só, e não uma medida de desvio ao longo do tempo.

### 1.8 O que a própria rede diz dos programas

Consulta direta às duas redes em 5/10/2026, depois da revisão adversarial da sprint: a conta de dados de cada
programa guarda o slot da última instalação e quem pode atualizá-lo.

| Programa | Rede principal, última instalação | Devnet, última instalação |
|---|---|---|
| Receptor atualizado (`rec2HH...`) | 5/5/2026 (slot 417825260) | 5/5/2026 (slot 460336311) |
| Contas patrocinadas atualizadas (`pyt2F4...`) | 5/5/2026 (slot 417825281) | 5/5/2026 (slot 460336332) |
| Receptor anterior (`rec5EK...`) | 16/3/2025 (slot 327047637) | 31/8/2026 (slot 491006444) |

- **Quem pode atualizar os três programas.** Na rede principal, `6oXTdojyfDS8m5VtTaYB9xRCxpKGSvKJFndLUPV3V3wT`,
  um endereço derivado de programa (fora da curva): quem o controla, e com quantas assinaturas, **não conferido**.
  Na devnet, `upg8KLALUN7ByDHiBu4wEbMDTC6UnSVFSYfTyGfXuzr`, uma chave comum.
- **O formato declarado pelo receptor** (IDL lido da devnet): `PriceUpdateV2` tem `writeAuthority`,
  `verificationLevel`, `priceMessage` e `postedSlot`. `VerificationLevel` tem `Partial { numSignatures: u8 }` e
  `Full`, nessa ordem. `PriceFeedMessage` tem `feedId`, `price` (i64), `conf` (u64), `exponent` (i32),
  `publishTime`, `prevPublishTime`, `emaPrice` e `emaConf`. O IDL é o que o programa declara, e não prova do
  código instalado; o código-fonte do receptor não foi lido.
- **Qualquer pessoa posta um preço.** Em `postUpdate` assinam o pagador, a conta nova e o `writeAuthority`, todos
  escolhidos por quem chama. A lista de erros do receptor não tem erro de preço velho: se ele confere a idade do
  preço ao postar, **não conferido**; o leitor não conta com isso.
- **O receptor tem instruções de governança** que trocam a fonte dos preços, o endereço do Wormhole e o mínimo de
  assinaturas (`setDataSources`, `setWormholeAddress`, `setMinimumSignatures`), sem reinstalar o programa.
- **Os códigos de rede**, usados pelo script de captura para não confundir as duas: rede principal
  `5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d`, devnet `EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG`.

## 2. Decisões desta sprint

| Decisão | Escolha | Alternativa descartada | Por quê |
|---|---|---|---|
| Qual geração o leitor aceita | A atualizada (`rec2HH...`) | A anterior; ou as duas | É a recomendada para integração nova e a que renova mais rápido. Aceitar as duas daria ao programa dois programas de fora em que confiar, em vez de um |
| Como ler a conta (T2) | Leitor escrito à mão, com conferência de dono, tamanho, discriminador e nível de verificação | A biblioteca `pyth-solana-receiver-sdk` 1.2.0, com a opção `pro-compatible` | O formato são 134 bytes e doze campos, já conferidos em oito contas reais. A biblioteca traria uma dependência cuja compatibilidade com o `anchor-lang 1.1.2` **não foi testada**; o repositório já ficou preso numa versão por causa de dependência assim |
| Verificação parcial | Recusada | Aceitar com um mínimo de assinaturas | Verificação parcial desloca os campos em um byte e significa menos assinaturas conferidas |
| Tamanho da conta | Exatamente 134 bytes | Aceitar 133 ou mais | Qualquer outro tamanho não é uma conta que o receptor criou |
| O ativo esperado | Faz parte da leitura: o leitor recebe o identificador e recusa outro | Devolver o preço e deixar a conferência para quem chama | Como qualquer pessoa posta um preço assinado de qualquer ativo, esquecer a conferência faria um preço de BTC responder a uma pergunta de SOL. Achado da revisão adversarial |

## 3. Inferências (minhas, a validar)

- **Na rede principal, a conta patrocinada pode bastar.** A regra do plano é aceitar aposta com preço de no máximo
  30 segundos. Com a conta renovando a cada 5 a 11 segundos, a regra é cumprida sem que o nosso serviço publique
  preço. Sem publicar, não se usa o serviço de preços e não se precisa de chave. Falta medir por dias, e não por
  um minuto, e saber o que acontece quando o patrocínio de uma conta acaba.
- **Na devnet, a regra dos 30 segundos não se cumpre só com a conta patrocinada** (ela chega a 64 segundos). As
  saídas: afrouxar o limite na devnet, que é rede de teste; ou publicar preço por conta própria, com a chave.
- **O limite de idade do preço deveria ser um parâmetro por pergunta**, e não um número fixo no código, justamente
  porque as duas redes se comportam de forma diferente.
- **O horário de publicação à frente do relógio precisa de tolerância.** Um leitor que calcula a idade como "agora
  menos publicação" recebe número negativo. A regra da Sprint 03 tem de tratar isso sem estouro e sem recusar preço
  bom.
- **Depender da conta patrocinada é depender de um terceiro que paga por ela.** A documentação lista quais contas
  são patrocinadas; a lista pode mudar.
- **A aposta e a prova do SIM deveriam aceitar contas diferentes.** Uma conta avulsa, postada por qualquer pessoa,
  pode trazer um preço legítimo e antigo. Se a aposta aceitar qualquer conta válida, quem aposta escolhe o preço
  mais velho que a regra admite, e a fresta de 30 segundos vira sempre a fresta inteira. A saída proposta pela
  revisão: na aposta, exigir a conta patrocinada do ativo (o endereço é derivado do identificador, e o programa de
  contas patrocinadas declara o erro `UpdatesNotMonotonic`, que sugere que ela só anda para a frente; se o código
  impõe isso, não conferido); na prova do SIM, aceitar qualquer conta completa do ativo, dentro do prazo. O plano
  técnico hoje diz "o programa aceita qualquer conta válida". É decisão de desenho da Sprint 03.
- **Quem controla a atualização do receptor controla o que o leitor lê.** Uma mudança de tamanho quebra a leitura
  e as perguntas de preço deixam de dar SIM (falha fechada, que depende de a anulação funcionar). Uma mudança de
  significado dentro dos 134 bytes não é detectável pelo programa. Daí a proposta de um vigia sobre o slot de
  instalação do receptor e sobre a configuração dele.

## 4. O que não foi feito

- **A leitura no Surfpool**, que o critério de pronto da sprint pedia. Ela era a saída para o caso de a Pyth não
  existir na devnet. Com oito contas reais lidas, a leitura de um modelo acrescenta pouco, e o Surfpool não tem
  binário para Windows; teria de rodar na conferência automática. Fica para a Sprint 03, onde o sistema de cenários
  dele serve de verdade: simular o preço encostando no alvo ao longo do tempo.
- **Publicar um preço na devnet por conta própria.** Exige a chave do serviço e uma carteira com saldo de teste. É
  da Sprint 06.
- **Compilar a biblioteca da Pyth com o `anchor-lang 1.1.2`.** Não foi tentado.
- **Medir a frequência por um período longo.** As medidas são de um minuto a dois, numa tarde.

## 5. Perguntas em aberto

1. O plano gratuito da chave da Pyth cobre o uso de uma devnet com poucas perguntas? Quanto custa o plano pago?
2. Quais contas de preço são patrocinadas na geração atualizada, além de SOL e BTC, e por quanto tempo?
3. O limite de 30 segundos vale também na devnet, ou a devnet usa um limite maior?
4. O Surfpool simula o stake de época?

## Fontes

- Consultas diretas à devnet e à rede principal (`getAccountInfo`, `getSignaturesForAddress`), 5/10/2026.
- Contas capturadas: `tests/fixtures/pyth-sol-usd-devnet.bin`, `pyth-btc-usd-devnet.bin` e
  `pyth-sol-usd-devnet-legacy.bin`, com o slot em `tests/fixtures/index.json`.
- https://docs.pyth.network/price-feeds/core/upgrade/contracts
- https://docs.pyth.network/price-feeds/core/upgrade/preparing
- https://docs.pyth.network/price-feeds/core/upgrade/preparing/solana
- https://hermes.pyth.network/v2/price_feeds (identificadores, sem chave)
- https://api.github.com/repos/txtx/surfpool/releases
