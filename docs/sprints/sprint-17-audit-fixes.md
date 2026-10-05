# Sprint 17 — Auditoria e correções

**Estado:** planejada · **Branch:** `sprint-17-audit-fixes` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | Seções 7 e 8; resumo de produto, seção 6.2 |
| Depende de | Sprint 16 |
| Regras e fluxos cobertos | R-32 (o que a equipe faz fica público); os requisitos de confiança do resumo de produto, seção 11 |

## Objetivo

Duas empresas de fora leem a versão exata, as falhas graves são corrigidas e conferidas por quem as apontou, e os
relatórios ficam públicos. Enquanto elas leem, o site ganha o que a rede principal exige e que não toca o programa:
os termos, o bloqueio por país e a página do SODAX.

## Critério de pronto

**Auditoria.**

- [ ] Há dois relatórios sobre a versão exata, com commit e hash, cobrindo no mínimo: aposta, resolução, acerto,
      pagamento, os cinco leitores, patrocínio e configuração.
- [ ] Toda falha grave foi corrigida, com um teste que a reproduz, e conferida por quem a apontou.
- [ ] Depois das correções, a conferência padrão, o teste aleatório e `solana-verify build` passam, e a versão final
      tem hash novo.
- [ ] Os relatórios estão públicos, com link no site.

**Em paralelo, no site.**

- [ ] Termos de uso, aviso de risco e política de privacidade estão publicados, com o conteúdo vindo da avaliação
      jurídica. A política diz que a aposta é pública e permanente, e cita o limitador e o Cloudflare.
- [ ] `GEO_BLOCK` e `GEO_BLOCK_COUNTRIES`: com o interruptor ligado, o painel de aposta some para o país listado;
      posições e pagamentos seguem visíveis (teste).
- [ ] A página do SODAX existe em rota própria, com o aviso de carteira sem SOL.
- [ ] Os avisos da rede principal estão prontos: o de fase de testes sai; "programa ainda sem auditoria" só sai com
      os relatórios públicos.
- [ ] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- As correções, cada uma com teste, e a versão final.
- Os textos legais, o interruptor de país e a página do SODAX.

## Fora desta sprint

Qualquer função nova no programa: o que entra depois da auditoria não foi auditado (P4 §4.1). A opinião jurídica: o
agente escreve o rascunho, e quem decide é o advogado. O SODAX funcionando, que só existe na rede principal.

## Decisões do fundador que travam a sprint

- A pergunta às duas empresas: prazo, escopo e de que versão precisam; e o nome da segunda (P4 §9.3). Convém fazer
  já.
- A avaliação jurídica concluída (P5), que dá o conteúdo dos termos (L-21) e do bloqueio (L-20).
- **L-18:** o desenho da página do SODAX.
- Usar ou não a exceção combinada de P2: abrir com uma auditoria concluída e teto menor.

## Agentes e skills

- **Agentes:** `technical-security-red-team-agent`, `bug-triage-agent`, `legal-compliance-agent` (rascunho dos
  textos), `copywriter-agent`, `coordinator-agent`.
- **Skills:** `privacy-audit`, `multi-ai-review`, `release-check`, `secrets-scan`, `decision-log`,
  `sprint-management`, `codemap`.

## Portões de segurança

- Toda correção passa pelo teste aleatório antes de voltar a quem auditou.
- **Dado pessoal:** o país do visitante e o IP passam pela skill `privacy-audit` antes de fechar. O IP não vai para
  disco.
- O código do SODAX não entra na página de aposta.
- Nenhum texto promete preço, retorno ou rendimento. `secrets-scan` no fechamento.

## Testes

Um teste por falha corrigida. O teste aleatório e a conferência padrão sobre a versão final. O interruptor de país,
ligado e desligado.

## Riscos

- O prazo é de terceiros e não está nos arquivos lidos.
- Uma correção que muda o programa pede nova leitura.
- O Cloudflare não entregar o país pelo túnel (C9).

## Artefatos esperados

Os dois relatórios, o commit e o hash da versão final, os textos legais, `app/features/` (bloqueio, SODAX),
`CODEMAP.md`.

## Changelog e session-log

- **Changelog:** auditorias concluídas e correções; termos; bloqueio por país; página do SODAX.
- **Session-log:** cada falha grave e a correção; o que a avaliação jurídica concluiu; se a exceção de P2 foi usada.

## Registro e retrospectiva

Preenchidos durante a sprint e no fechamento.
