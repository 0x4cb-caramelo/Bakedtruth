# 2026-10-13 — Sprint 08: a terceira fatia do indexador

Feita pela faixa L08 da execução paralela do líder (o registro geral do dia está em
`2026-10-13-auditoria-do-roteiro-e-faixas.md`, no PR da Sprint 18). Antes, o líder mesclou a `main` até o PR #84 na
branch (`fb8a143`; os conflitos eram só nos registros).

## Decisões da faixa, a confirmar pelo fundador

- **O ranking deixa de fora as entradas da própria carteira de quem abriu.** O plano diz que nada que o criador possa
  pagar entra na conta; uma entrada dele é paga por ele.
- **O destaque de 72 horas só vale quando uma chave da equipe abriu a campanha** (`creator_is_team`), como o parceiro de
  lançamento do P-3.
- **"Retorno em 30 dias"** é entrar numa segunda campanha até 30 dias depois da primeira entrada. **"No prazo"** não é
  calculado: precisa de uma regra por tipo de campanha.

## O que os testes acharam

- O Kit 8.4 não avisa quando o nó fecha o WebSocket de forma limpa, então uma assinatura quieta ficaria morta sem
  ninguém saber: ela é renovada a cada 5 minutos.
- Um campo do detalhe de um alerta podia sobrescrever o próprio tipo do alerta. Corrigido no indexador; o mesmo padrão
  no `alert.ts` do keeper foi para a faixa do keeper.

## O que fica com o fundador

Como as rotas do indexador chegam ao público (pela API de leitura ou por uma rota do túnel); a conta de RPC dele (D4);
a retenção das cópias e a VM 2; o texto da página de privacidade antes de as rotas irem ao ar; os parceiros reais, com
revisão de duas pessoas; as três definições acima.
