# 2026-10-13 — Sprint 14: a indicação e a disputa em duas etapas

Construída na execução paralela do líder (o registro geral do dia está em
`2026-10-13-auditoria-do-roteiro-e-faixas.md`, no PR #85). Nada foi publicado no devnet: a publicação depende da
mescla na `main` (o artefato do CI só sai dela) e das palavras do Ronaldo.

## Como foi feita

- **O andaime** (`fd67706`, comum às Sprints 14 e 15): as cinco instruções novas como esboços que recusavam, com os
  discriminadores 22 a 26, os erros 6153 a 6174, os eventos 18 a 22, as contas `ReferralLink` (etiqueta 4) e
  `SealedFee` (6), e os quatro bytes de reserva do `Campaign` virando `sealed_fees_open`. Três ferramentas de teste
  precisaram de ajuste (os construtores do SDK, o resumo que recusa o que não descreve e a tabela de poderes); o
  ajuste foi aprovado pelo líder porque o resumo continua recusando o que não conhece.
- **Três faixas do programa e uma de fora**, cada uma com seus arquivos: o vínculo (L14A), a disputa (L14B), a
  rotina de indicação (L14R); e o teste de dinheiro, arquivo do líder, estendido por uma faixa sob a direção dele.
- **O adendo do líder** (`a038f0b`): a aresta Contested → Settled, porque sem ela uma campanha contestada sem entrada
  nunca saía da disputa, com o prêmio e a taxa de abertura presos; e o erro 6175, `ConfirmWithVoidReason`.

## Decisões

- **A contestação só abre depois de toda entrada contada** (`NotTallied`): o `tally_late_joins` só roda em revisão,
  então uma campanha contestada antes de contar as entradas não teria saída. O keeper conta antes.
- **"Antes da primeira entrada" é decidido pela ordem da cadeia** (slot, lugar da transação no bloco, instrução), e não
  pelo relógio: no mesmo slot, o próprio bloco decide, lido uma vez; enquanto não é lido, o vínculo fica indeciso e não
  rende.
- **O razão dos pagamentos fica num arquivo próprio**, para uma reconstrução do indexador nunca apagar o que já foi
  pago; cada transferência leva o memo `brot-referral:<lote>:<índice>`, e uma linha nunca é paga duas vezes.
- **O mínimo de aluguel de uma carteira vazia é lido da RPC**: 650.240 lamports na devnet e na mainnet (128 × 5.080);
  o LiteSVM ainda responde 890.880, a taxa antiga.

## A revisão adversária

Nenhum caminho para mandar SOL ao lugar errado nem para inverter um resultado. Achados:

- **F1, grave, de desenho (D2):** qualquer carteira encerra uma contestação aberta pela equipe com uma releitura igual
  e o resultado contestado é pago; numa campanha de curva, um swap seguido da releitura na mesma transação monta a
  "mesma leitura" de propósito. Nenhuma chave da equipe sozinha impede (desde 9/10 a equipe não anula um SIM ou NÃO).
  Proposta ao fundador: a releitura igual só paga depois da hora da etapa 1, e nessa hora uma chave da equipe pode
  mandar a disputa à etapa 2. **Em aberto até a resposta; nada vai ao devnet antes dela.**
- **F2 a F10, corrigidos antes do PR:** o limite de 55 horas garantido na própria cadeia; uma prova oferecida inválida
  recusada em vez de subir de etapa; dois textos do resumo; o padrão do SDK para a conta de prova; documentação.

## Achado em código antigo

O teste de dinheiro reproduziu um defeito da Sprint 04 que o pacote de auditoria já apontava (O-3): contar só parte
das entradas tardias de um padeiro não trava o corte de uma prova de SIM anterior, e uma entrada feita depois do toque
provado pode dividir o pote dos perdedores. O dinheiro se conserva, mas vai para quem não devia. Vai para o
endurecimento da Sprint 16, antes do congelamento: recusar o `tally_late_joins` de um SIM de preço até passar o prazo
em que uma prova anterior ainda poderia valer.

## O que fica com o fundador

D2; as cinco leituras da indicação (os 90 dias contam entradas feitas na janela; toda entrada conta para os dois
limites; a devolução não tem janela; o 1% de um pote de um lado só não é devolvido; arredondar para baixo por
entrada); o texto do aviso antes de o indicado assinar e na página de privacidade; a retenção do razão.

## Depois, no mesmo dia: as respostas do fundador e o D2 construído

As respostas do Ronaldo de 13/10 que tocam esta sprint, dadas na caixa de perguntas (o registro geral do dia está no
PR #85), ficam também aqui:

- **D2: (a), com uma etapa 1 de 24 horas.** A proposta falava em uma hora; o líder pediu a confirmação, porque 24
  horas mudam o §4.5 do BP, e o Ronaldo confirmou na própria caixa. A releitura igual só paga depois das 24 horas da
  etapa 1 (`RereadBeforeTimelock`, erro 6176); nesse prazo, uma chave da equipe leva a disputa à etapa 2 chamando
  `team_open_contest` de novo; uma leitura diferente continua subindo na hora. É a resposta ao F1: a releitura roda o
  mesmo código dos leitores e não pega um defeito deles, e as 24 horas dão à equipe o tempo de levar a disputa ao admin.
- **O que mudou.** A faixa L14B construiu no mesmo dia (`3d524c9` a `05fe0d8`): o programa; o SDK (a vista com o fim
  da espera e a escalada possível, `contestTimelockEndsAt` e `contestEscalable`, e o resumo que diz se a assinatura
  abre ou escala a disputa); o teste aleatório, em 12 sementes; os testes da escalada e do pior caso; os scripts e o
  ensaio da equipe (44 de 44); a prova de mutação (17 ids, 37 casos). O keeper, quando fizer a releitura, precisa
  simulá-la antes: a igual é recusada até `contestTimelockEndsAt`.
- **O número do BP muda:** o pior caso, do resultado lido ao pagamento, passa de 55 para 78 horas (6 + 24 + 48), e
  uma chave da equipe pode segurar um pagamento por até 72 horas. A nota datada entrou no §4.5 da parte 1 do BP, sem
  reescrever a seção.
- **As cinco leituras da indicação: aprovadas como recomendado** (as cinco acima).
- **As regras de dinheiro da indicação, "como recomendado":** o teto de 0,05 SOL e os limites de 0,4576 e 2,2879 SOL
  (P-6); só as entradas vencedoras, sem o 1% de um pote de um lado só; uma pessoa assina o pagamento semanal, de uma
  carteira de operações, e nenhuma chave vai ao servidor; D5 (a), nada no devnet.
- **O indexador:** as três definições aprovadas, e a rota pela API de leitura (`/api/v1`) também, a construir depois,
  fora desta branch.

Continuam com o fundador: o texto do aviso antes de o indicado assinar e na página de privacidade; a retenção do razão;
onde aparece o saldo da indicação (L-10).

## O keeper liquidando sozinho no devnet

- **A resolução de verdade já tinha acontecido.** O keeper resolveu `FmDoXD1qx2ZfLr71WjrHHxFhLqDRkA6s24je1YfCj1Ho`
  sozinho em 11/10, às 15h59min17s UTC (`23agRJq8nJtzUjNy…`); o diário do servidor e a cadeia mostram. Os registros
  das Sprints 06 e 07 diziam que ela ainda não tinha sido vista, e foram corrigidos.
- **O pagamento sem ninguém apertar nada.** A pedido do Ronaldo, nas palavras dele ("turn on the keeper payout with
  the current unit"), o código do keeper do PR #88 (release `88a00f9`) entrou na unidade de sempre com
  `KEEPER_SETTLE=on`, depois de um ensaio sem envio na porta 4239, que finalizaria as duas campanhas sem falha. O
  reinício foi às 19h03 UTC. Pousaram no devnet: `FmDo…` (finalize `5Z5zdkN5…`, prêmio e taxa `ZqDWtcrs…`,
  fechamento `647Zc7S2…`, este apesar de um 429 na consulta de confirmação) e `G6Un…` (finalize `3dRvL3Lz…`, prêmio e
  taxa `4Ev4MJCH…`, fechamento `4XEdx7xh…`). A varredura das taxas não foi enviada, provavelmente porque o cofre de
  taxas estava abaixo do mínimo de 0,01 SOL. O env anterior está em `/etc/brot-markets/bak-20261013/keeper.env`; a
  volta atrás é apontar `current` para `releases/cc87637`, restaurar esse env e reiniciar.
- **A RPC da Helius.** Mais tarde no mesmo dia, também a pedido do Ronaldo, o `KEEPER_RPC_URL` do `keeper.env`
  passou a apontar para o endpoint de devnet da Helius, com a chave (a escolha do D4, de 10/10), no lugar da RPC
  pública, que respondia 429. A chave não vai ao repositório, a um log nem a um chat; o keeper registra só a origem.
  O env anterior está em `/etc/brot-markets/bak-20261013/keeper.env.before-helius`. Depois da troca: a unidade ativa,
  nenhum erro e nenhum 429 nos primeiros ciclos, a liquidação ligada e nada pendente.
- **Ainda não:** a unidade nova, com identidade própria, não foi instalada; depende do dono do servidor.
