# 2026-10-08 — O plano de implementação em inglês: plano técnico v0.1.0 e roteiro v0.1.0

## Context

No mesmo dia das decisões sobre o BP v0.0.3, o fundador respondeu às seis perguntas que ainda travavam o começo do
código ("sim para todos") e pediu: "depois disso faca o plano de implementacao. todo em ingles". As seis respostas
estão em `session-log/2026-10-08-decisoes-do-fundador-bp-v0.0.4.md`, seção "Complemento". Entre elas, a proposta de
arquitetura 0.4 foi aprovada como está.

O plano técnico aprovado em 5/10/2026 (v0.0.1, em português) e o roteiro de sprints (v0.0.1) descreviam o produto
antigo: USDC, Anchor, teto global, só a equipe abrindo perguntas em duas pessoas, pedido de pergunta, IA.

## Decision

O plano de implementação são três peças, todas em inglês:

1. **`docs/technical/TECHNICAL-PLAN.md` v0.1.0.** Reescrito a partir da proposta 0.4 e da v0.0.1, com a mesma
   numeração de seções da v0.0.1, para que as referências "TP §3.4.x" continuem valendo.
   - A seção 3.4 deixa de ser uma lista de diferenças e passa a ser o desenho completo do programa em Pinocchio:
     contas, estados, instruções, cofre em SOL, pagamento, leitores, chaves, abertura paga, invariantes I1 a I15,
     eventos, a conta do dinheiro com exemplo e o módulo de checagens.
   - A seção 3.7 é nova: o app Android.
   - O apêndice A rastreia cada requisito (BR-xx) até a seção e a sprint.
2. **`docs/SPRINTS.md` v0.1.0.**
3. **Os arquivos das Sprints -1 e 02 a 22.**
   - As Sprints 00 e 01, fechadas, ficaram como estavam.
   - Quatro arquivos mudaram de nome, por causa do vocabulário: as Sprints 10, 11, 12 e 18.
   - Quatro sprints são novas: a 19, a caixa de abertura de campanha no site (`/abrir`), e a 20, a 21 e a 22, o app
     Android, em trilha separada (Track B).

**Uma leitura do assistente, a confirmar com o fundador.** A proposta trazia três decisões próprias com recomendação,
e a aprovação "como está" foi lida como aprovação dessas recomendações:

- **D6:** renomear os termos no código e no texto.
- **D7:** anular a campanha de preço cuja fonte parou de atualizar.
- **D8:** desenhar a tela de abertura na Sprint -1.

O plano técnico e o roteiro dizem isso uma vez, às claras. Pelo mesmo motivo, o site em Bun, se passar no teste da
Sprint 09, deixou de ser pergunta aberta.

## Alternatives considered

- **Um documento novo, "plano de implementação", ao lado dos outros.** Recusado: a regra das camadas de documentação
  dá ao plano técnico o "como" e ao roteiro o "em que ordem". Um terceiro documento repetiria os dois.
- **Renumerar as sprints para encaixar a caixa de abertura depois da 11.** Recusado: o plano de negócio e a proposta
  citam as Sprints 14 a 18 pelo número. A regra da v0.0.1, "número não é calendário", já permite a 19 rodar antes da 13
  terminar, como a -1 roda em paralelo.
- **Reescrever também o resumo de produto.** Fica para depois: o pedido foi o plano de implementação. Enquanto isso, o
  plano técnico cita o BP v0.0.4 e os requisitos BR-xx, e não as regras R-xx do resumo antigo.

## Consequences

- O plano técnico v0.0.1 e o roteiro v0.0.1 continuam no histórico do git: o último texto de ambos está no commit
  `0b40554`, a `main` de antes desta mudança.
- O `CLAUDE.md` passou a descrever o produto novo e diz que os comandos de Anchor valem até a Sprint 03.
- Pequenas correções na proposta 0.4, achadas pelos redatores:
  - a auditoria fica na Sprint 17, e não na 16;
  - a devolução por indicação é uma transferência semanal, fora do cofre.
- Correções no plano de negócio:
  - duas frases ainda chamavam de pendentes a regra do 1% e a fonte do preço;
  - o site em Bun saiu da lista de pendências.
- Ajustes entre as fontes, feitos na redação:
  - as instruções de pausa ficam na Sprint 02, e não na 04, porque a abertura precisa delas;
  - a troca do registro de pacotes (T15) vai para a abertura da Sprint 02, antes de a Codama trazer pacotes novos;
  - o teste de troca de serviço roda na Sprint 07 e se repete com carga na 08, onde o `brot-rpc` nasce;
  - a página do Cloak fica na Sprint 15, e a do SODAX na 17.

## Follow-up

- **Fundador:** as perguntas abertas na seção 14.2 do plano técnico e na seção 5 do roteiro. A primeira que trava algo
  é a D4, a verba, na Sprint 06. Antes de qualquer sprint: confirmar a leitura sobre D6, D7 e D8.
- **Equipe:** revisar o resumo de produto e o documento de design contra o BP v0.0.4, porque a Sprint -1 e a 19
  dependem deles. Corrigir o deck e o site no ar. Abrir a Sprint 02.
