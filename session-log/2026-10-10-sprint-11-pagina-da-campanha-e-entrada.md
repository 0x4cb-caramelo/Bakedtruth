# 2026-10-10 — Sprint 11: a página da campanha e a entrada pelo site

## Ponto de partida

- Branch `sprint-11-site-campaign-entry`, aberta da `main` em `012c501` (PR #57 já mesclado). O prompt de entrada dizia
  que o texto do aviso de dinheiro preso (L-03) não estava decidido; ele já estava aprovado e na `main`, então o painel
  usa o texto do fundador, sem mudança.
- O binário do programa nesta máquina era de 8/10, anterior ao id novo, e os testes em LiteSVM falhavam com ele. Foi
  trocado pelo artefato do CI da `main` (`012c501`, execução 38034785759, SHA-256 conferido). O `cpi_proxy.so` não vem
  no artefato; os três testes que dependem dele falham só nesta máquina, como antes.

## Decisões técnicas da sprint (nenhuma é de produto)

1. **A estimativa do painel é a do SDK.** O painel mostra o `checkJoin` do SDK, o mesmo número sobre o qual o
   `prepareJoin` assina o `min_return_bps`. Escrita com até quatro casas, sem arredondar para cima: o 3,067 da P1 §3.2
   aparece como "3.0666" (30.666 bps), e o 3,10 como "3.10" (31.000 bps).
2. **A página lê a rede pelo SDK.** Campanha, config, relógio, a conta lida, a `Entry` da carteira e a do criador vêm por
   RPC. A API de leitura dá só o interruptor de entradas (K-11): ela não traz idade máxima do preço, entrada mínima,
   época, valor registrado nem bytes.
3. **Atividade e histórico da chance (L-23 = sim)** saem dos eventos `EntryAdded` das últimas 20 transações da
   campanha, decodificados pelo SDK, até o indexador ter a rota de atividade.
4. **A marca do criador (BR-26)** é lida da própria `Entry` do criador na rede, já que o indexador não existe.
5. **A guarda de nova tentativa (A-9):** o registro (total da entrada e `lastValidBlockHeight`) é salvo antes da
   carteira; sem resposta, a página consulta a cada 2 s (a cadência do keeper, proposta §2.6) até a altura finalizada
   passar (o prazo cresce até a altura do momento da resposta da carteira mais 150 blocos); toda tentativa seguinte
   passa o total salvo, e nenhuma tentativa nova é preparada enquanto outra está em aberto. Só a recusa na carteira ou
   no preflight conta como "nada enviado". Com assinatura devolvida, quem decide é o status confirmado dela; sem
   assinatura, o total da entrada é a única testemunha.
6. **O smoke web roda no LiteSVM, não no Surfpool:** o mesmo binário, com as contas Pyth capturadas e frescas, no
   processo, sem namespace de rede. O que ele testa é a ligação do site; o comportamento do programa num validador real
   é o ciclo de devnet da Sprint 05.
7. **Playwright 1.63.0 fixado** (publicado em 4/9/2026; o 1.64.0 tinha três dias). O Chromium dele, o 1243, já estava
   nesta máquina.
8. **Os testes da sprint ficam em `tests/site`**, para o CI rodá-los com `bun run test` (os do app não rodam no CI).

## Os textos finais dos avisos antes da assinatura

- Estimativa: "Estimate, not a promise: it is net of Brot's fee and the creator's share, and it changes with every entry
  until entries close."
- Entrada grande (P1 §3.2): "Your own entry counts in the pot: the more you put on a side, the lower that side's return
  per 1." Quando é o caso, com os números: "Est. X per 1 for a minimum entry, Y per 1 with yours."
- Trava (L-03, texto do fundador): "Your entry stays locked until the campaign ends. You cannot take it out before then.
  Payouts go to your wallet automatically after the result is read."
- Taxa: "Brot keeps 10% of the losing side. The creator gets 1% of the entries." (ou "This campaign has no creator
  share.")
- Pote de um lado só: "If only one side has entries when they close, every entry is refunded: the first wallet in full,
  the others less 1%."
- Devnet: "Solana devnet: entries use test SOL, which has no real value. The program is not audited yet."

## As revisões

- **Texto (copywriter):** nenhuma palavra proibida, o L-03 intacto, nada de "no human picks the winner". Aplicado:
  "est." em todo número estimado; o piso deixou de soar como promessa ("Lowest estimate you accept", e "Later entries can
  still lower it."); uma saída em palavras para entradas fechadas, resposta já conhecida e pausa; a anulação automática
  que passa pela revisão de 6 horas ganhou texto próprio; as regras por tipo seguem o programa (o preço precisa da banda
  de confiança inteira além do alvo; queima e trava só contam SIM lido antes do prazo, TP §3.4.6; o "alvo atingido
  depois do prazo dá NÃO" saiu dos tipos por época).

- **Segurança (red team do que o baker assina):** o pior achado era real. Com o armazenamento do navegador bloqueado,
  nada guardava o registro na memória; e depois de um acompanhamento que parava por erro de rede, a página oferecia
  "Review again" antes de a primeira transação expirar: as duas coisas podiam pôr uma segunda entrada. Corrigido: o
  registro vive na memória da página e no localStorage; pertence a uma tentativa (só ela atualiza ou apaga); enquanto
  uma tentativa está em aberto, nenhuma outra é preparada ("Still checking your entry", com "Check again"); um status
  só conta confirmado; um erro só é do programa quando a instrução dele falhou (lido da transação que entrou); o prazo
  cresce até a vida do blockhash depois da resposta da carteira, e a validade antes de assinar é medida em blocos; a
  recusa no preflight conta como "não enviado"; o recibo sem assinatura mostra os lados reais da entrada; o painel fica
  enquanto a entrada corre; o build recusa uma URL de RPC com chave. Adiado: nonce na CSP no lugar de
  `'unsafe-inline'`; comparar a transação que entrou com o resumo; um smoke com carteira que muda os bytes.

- **Coordenação:** aprovada com ressalvas, sem bloqueio no código. Corrigidos antes do PR: os detalhes da lista do
  relay (as três confirmações do `getBlockHeight`, o `getTransaction` da guarda, o histórico no
  `getSignatureStatuses`, o Lighthouse com o id da Sprint 03), textos velhos aqui e na sprint, e os adiamentos no
  Technical Plan (§7.2).

## Privacidade (a guarda guarda dados no navegador)

1. Dados: o endereço da carteira, a campanha, o lado, o valor e o total da entrada de uma tentativa, e a assinatura.
2. Por quê: sem isso, uma página recarregada não sabe que uma entrada pode já ter entrado (A-9).
3. Onde: só no navegador da pessoa (memória da página e localStorage). Nada vai a servidor nenhum.
4. Quem acessa: a própria página, no navegador da pessoa. 5. Controle: a origem do site (o navegador isola por origem).
6. Retenção: um registro resolvido sai na hora; um recusado ou expirado, depois de um dia; um em aberto, quando o
   acompanhamento o resolve.
7. Logs: nenhum. 8. Apagar: limpar os dados do site no navegador apaga tudo; nada fica em outro lugar.
9. Política: o endereço da carteira já é público na rede; a política de privacidade do site novo (Sprint 13) deve
   citar este registro local.

## O que o smoke achou (corrigido na sprint)

- "Use Installed Wallet" não fazia nada depois de recarregar a página: o adaptador já tinha a carteira selecionada (ele
  lembra a última no navegador), e o `select()` não mudava nada. Código da Sprint 09; agora conecta direto.
- A guarda dizia "entrou" a uma entrada que falhou (6066) quando outra entrada da mesma carteira mudava o total. Agora o
  status da assinatura decide quando a carteira devolve uma.

## A lista do relay

`docs/technical/relay-allowlist.md`: onze métodos (`getAccountInfo`, `getMultipleAccounts`, `getLatestBlockhash`,
`simulateTransaction`, `getMinimumBalanceForRentExemption`, `sendTransaction`, `getSignatureStatuses`,
`getBlockHeight`, `getSignaturesForAddress`, `getTransaction`, `getBalance`) e nenhum WebSocket, vistos nos testes e no
navegador.

## Verificado e não verificado

- Verificado: os 38 testes de `tests/site`; o conjunto da raiz (514 passam; os 3 do `cpi_proxy` só falham por falta do
  binário aqui); os 34 testes do app; lint e build do app; o smoke web, 10 de 10; no devnet, pela RPC pública e só
  leitura, a preparação e a simulação de uma entrada nas campanhas existentes (resumo confiável, simulação OK); a página
  no Chromium, em 1280 e 412 px, com as campanhas reais do devnet.
- Não verificado: assinar e enviar no devnet com carteira real; a atividade na API (a rota não existe); celular e
  emulador (adiados para o fim do hackathon).

## Pendências

1. **Fundador:** de onde ler o ProgramData para a A-8 até o relay `/rpc` existir. Sem resposta, a A-8 não foi
   construída.
2. **Fundador (não bloqueia):** o piso que o baker assina; o painel usa o padrão do SDK, 1% abaixo da estimativa.
3. **Fim do hackathon:** a assinatura no devnet com carteira real, e conferir nos testes de celular se a CSP deixa o MWA
   falar com a carteira pelo WebSocket local.
