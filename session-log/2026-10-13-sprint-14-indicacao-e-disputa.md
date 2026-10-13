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
