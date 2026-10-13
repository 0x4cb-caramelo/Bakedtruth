# 2026-10-13 — Auditoria do roteiro e as sprints que faltam, em faixas paralelas

**Pedido.** O Ronaldo colou um pedido longo (papel de engenheiro-chefe, seis blocos): achar no repositório toda
sprint do roteiro que não terminou, classificar cada item aberto (A: a IA faz; F: decisão do fundador; X: pessoa,
compra ou terceiro), juntar as decisões numa lista só, e executar o resto em faixas paralelas, cada uma dona dos
seus arquivos, com integração em série pelo líder. O pedido descrevia uma máquina Windows/WSL; esta sessão roda na
máquina Linux do Ronaldo (sem WSL, sem `env.sh`), na `main` limpa em `395efa5`.

## O que a auditoria achou (conferido no git, no GitHub e no site no ar)

- Fechadas com tag: 00 a 05, 11, 12, 13 e 19. Sem tag e com itens abertos: -1, 06, 07, 09 e 10 (fechadas "para o
  hackathon"), 08 em andamento. Planejadas: 14 a 18 e 20 a 22. A lista de memória do fundador (14, 15, 16, 17, 18,
  20, 21, 22) estava certa, mas não mostrava as parciais.
- **A página de privacidade no ar é a antiga e `/terms` responde 200**, embora a resposta 9a tire `/terms` do ar até a
  Sprint 17 e mande corrigir a privacidade antes de o site ser público. O landing no ar é de `ab764ab`, que não
  contém o PR #65; o banner manda o público ao `/dev0x`. Conserto: publicar o landing da `main` (depende das palavras
  do Ronaldo).
- A API de leitura está no ar (o registro da Sprint 08 dizia "não implantada"); o indexador está no PR #72 em
  rascunho, que conflitava com a `main` (o líder mesclou a `main` nele: `fb8a143`).
- A resolução real do keeper ainda não foi vista; a campanha de teste `FmDo…` vence em 14/10 às 04h48min41s UTC.
- Nenhum código de Android; nenhuma troca da Trilha B registrada.

## Respostas do Ronaldo (13/10, na caixa de perguntas)

1. `sponsor_add_prize` (um terceiro pôr prêmio na campanha de outro): **adiada para amanhã**, "i need too talk with
   my partners". Não entra no andaime; se ficar, entra depois, no fim das listas.
2. O piso da entrada selada: **US$ 500**, cobrado na rede ao preço SOL/USD da Pyth, com o limite de lamports, pela
   mesma conversão da abertura.
3. A disputa: **as duas etapas agora** (segunda leitura por qualquer carteira; a mesma leitura paga, uma diferente
   abre 48 h para o admin confirmar ou anular, nunca inverter; pior caso 55 h).
4. As regras de dinheiro da indicação: **como recomendado** (teto do reembolso 0,05 SOL; limites 0,4576 e 2,2879
   SOL; só entradas vencedoras contam para os 20%; a rotina semanal prepara as transferências e uma pessoa assina de
   uma carteira de operações, sem chave no servidor; sem atestado nem triagem de carteira no devnet, D5 a).

## Decisões de engenharia do líder (registradas, reversíveis)

- A entrada selada é uma instrução própria (`sponsor_join_campaign`) que chama o núcleo da entrada comum, extraído
  de `join_campaign.rs`; os 10% ficam numa conta própria por patrocinador e campanha (`SealedFee`), e não no cofre
  da campanha, porque o `Campaign` tem 512 bytes com só 4 de reserva: a contabilidade e a asserção do cofre (I1,
  I15) não mudam. Os 4 bytes de reserva viram `sealed_fees_open`, e o `close_campaign` espera esse contador zerar.
  Um `settle_sealed_fee` devolve a taxa ao patrocinador numa anulação por falha da casa e a manda ao cofre de taxas
  em todo outro caso.
- A disputa: a segunda leitura compara resultado, motivo, `met_late` e valor exatamente; qualquer diferença sobe
  para a etapa 2 (subir à toa vai para pessoas, que é o lado seguro); nada grava um resultado novo. A etapa 2 que
  vence sem decisão deixa qualquer carteira finalizar com o resultado gravado (o pior caso de 55 h do BP). Um erro
  suspeito no leitor se resolve com a anulação da equipe na janela, nunca com a disputa: a releitura roda o mesmo
  código.
- A indicação recusa o endereço zero e o próprio indicado como indicador (higiene; uma segunda carteira continua
  possível, o risco aceito do P1 §3.9).

## Faixas (ver o manifesto no registro do fechamento)

Primeira onda, sem depender de decisão: CI e cadeia de suprimento da Sprint 16; pacote de auditoria da 17; roteiro
da mainnet da 18 com ensaio num fork do Surfpool; indexador da 08; keeper das 06 e 07 (pagamento automático
desligado por padrão até o fundador decidir). Depois das respostas: o andaime das 14 e 15, e três faixas do programa.

## O que voltou das faixas até aqui

- **O pacote de auditoria** (`docs/audit/`, branch `sprint-17-audit-fixes`, `212898c`): escopo, modelo de ameaças,
  as auditorias do Pinocchio e o fluxo de correções. As duas auditorias achadas (Zellic, 30/6/2025; Neodyme,
  12/6/2025) cobrem o `pinocchio` 0.8.4 e o `pinocchio-system` 0.2.3; o programa fixa 0.11.2 e 0.6.1, e nenhuma
  auditoria posterior foi achada. O líder conferiu quatro das lacunas que o pacote listou: a asserção do cofre em
  `pay_from_vault` compara um valor com ele mesmo, e `move_lamports` só confere o saldo (mais fraco do que o plano
  diz); nenhum teste leva o `tally_late_joins` às suas duas recusas; o script de mutação deixa de fora as checagens de
  `checks/close.rs` e `checks/paying.rs`; a abertura grátis da equipe fica fora do limite de campanhas abertas, o que
  é decisão do fundador de 9/10 (resposta 4), com o alerta de abertura por chave da equipe como mitigação. Todas vão
  para o endurecimento antes do congelamento (Sprint 16), depois de 14 e 15.
- **Um buraco no desenho da disputa, achado pela auditoria.** Uma chave da equipe não anula um SIM ou NÃO (decisão
  de 9/10, `c32aa8c`, `TeamVoidNotAutomatic`); só a etapa 2, pelo admin (o 2 de 3), anula. A segunda leitura roda o
  mesmo código do programa, então um erro num leitor se repete nela, "a mesma leitura paga", e a etapa 2 nunca é
  alcançada. A proposta ao fundador (D2): a mesma leitura paga só depois da hora da etapa 1, e nessa hora uma chave da
  equipe pode mandar a disputa para a etapa 2 (sem mover dinheiro) quando a leitura independente do standby (outra
  RPC, outro código) discordar. Até a resposta, a faixa da disputa constrói o desenho aprovado com o "mesma leitura
  paga" isolado numa função.
- **O roteiro da mainnet** (`deploy/mainnet/README.md`, esta branch): ensaiado num fork da mainnet no Surfpool, quatro
  vezes de ponta a ponta. As decisões que as fontes impuseram e as quatro perguntas novas ao fundador (M-1 a M-4: um
  ou dois multisigs, a duração do time lock, os parâmetros propostos, quem segura a carteira do dia) estão no registro
  da Sprint 18.

## Respostas do Ronaldo, segunda rodada (13/10, à tarde)

Coladas num bloco só; as que mexem fora do repositório ele confirmou com as próprias palavras na caixa de perguntas.

- **D2, a mesma leitura numa disputa:** (a), com a etapa 1 de **24 horas** (confirmado na caixa: "24 hours"). A mesma
  leitura só paga depois delas, e nesse prazo uma chave da equipe pode mandar a disputa ao admin; o pior caso passa de
  55 para 78 horas (6 + 24 + 48). Construído na branch da Sprint 14 (o registro dela diz como).
- **A entrada selada feita tarde:** o Brot fica com os 10% (a regra de hoje, presa num teste da Sprint 15).
- **As cinco leituras das regras da indicação:** aprovadas como recomendado.
- **As tags das Sprints -1, 09 e 10:** postas ("Yes, tag all three now"), com a lista do que fica em cada uma.
- **O pagamento automático do keeper no devnet:** ligado ("turn on the keeper payout with the current unit"), e a RPC
  do keeper trocada para a Helius ("use the Helius RPC for the keeper"); o registro vai com a branch da Sprint 14.
- **Os limites dos alertas:** aprovados (exposição de 100 SOL, 20 aberturas por hora, varredura mínima de 0,01 SOL).
- **O repositório público antes da mainnet:** (a); é o que destrava a atestação de origem do CI (Sprint 16).
- **O indexador:** as três definições aprovadas, e o caminho público pela API de leitura em `/api/v1`, sem mudança na
  Cloudflare (a construir depois da mescla do indexador).
- **A landing publicada a partir da `main`** ("Yes, publish it now"); o registro está em
  `2026-10-13-landing-tags-e-pr-88.md`, com o PR #88 mesclado.

## Respostas do Ronaldo, terceira rodada (13/10, à noite)

- **M-1:** (a) dois multisigs com as mesmas três carteiras: o trancado guarda a autoridade de atualização; o outro, o
  admin e o recebedor das taxas.
- **M-2:** (a) time lock de 24 horas.
- **M-3:** aprovados os parâmetros propostos (1.000 campanhas abertas, preço de até 60 s, confiança de até 50 pontos
  base, 30 s de idade da campanha na abertura).
- **M-4:** o Ronaldo segura a carteira física no dia do lançamento, e o primeiro ciclo na mainnet inclui uma abertura
  paga.
- **`content/powers.md`:** "Lucas and Bernardo have reviewed and approved it", como relatado pelo Ronaldo; o líder não
  tem como conferir a revisão deles.
- **As mesclas:** autorizou mesclar #86, #85, #87, #72 e #89 nessa ordem ("Yes, merge all five as described"), cada
  um só com o CI verde no último commit e com a `main` trazida antes. O #86 (o pacote de auditoria) entrou na `main`
  como `b863ce3`.
