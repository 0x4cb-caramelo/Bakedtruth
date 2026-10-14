# 2026-10-08 — Sprint -1, abertura: as respostas do fundador sobre o design e o protótipo das campanhas

## Context

A Sprint 02 estava em revisão (PR #30, verde depois de resolver o conflito com a `main`). O fundador perguntou por que
as telas ainda não podiam ser feitas e mandou seguir: resolver o conflito e começar a Sprint -1, o design. Na mesma
mensagem respondeu as perguntas que travavam a sprint. Ele escreve em inglês e pediu resposta em inglês.

Por que as telas de verdade ainda esperam: as Sprints 09 a 13 e 19 leem o programa pelo SDK (05), pelo serviço que
resolve e paga (06) e pelo indexador (08), e o roteiro proíbe qualquer tela de usar o programa antes do teste de
invariantes da Sprint 04. A Sprint -1 não lê o programa: depende só da Sprint 00, e por isso abre agora.

## Decision

### As respostas do fundador (8/10/2026)

| Pergunta | Resposta | Nas palavras dele |
|---|---|---|
| Qual escuro é o oficial, qual tema é o padrão | O escuro que está no ar em brot.markets (o da N, `prototype-lab/shared/ledger.css`); o padrão é o escuro | "i only see one when i enter the site brot.markets, the default is dark theme" |
| Idioma do site (L-01) | Inglês | "site language is english default" |
| Histórico da chance na página da campanha (L-23) | Provavelmente não | "i dont know about this, but probably not" |
| Texto do aviso de trava (L-03) | Aceita sugestão | "i dont know too, i accept a susggestion" |
| Lugar do selo de parceiro (L-24) | Decide depois de ver | "i dont know too, after i decide" |
| USDC e teto | Esquecer | "forget USDC and cap" |
| O projeto antigo | Não será mais usado; conferir se é seguro apagar ou isolar, sem apagar nada antes da confirmação | "dont erase nothing before confirmation" |

Os "dois escuros" eram um detalhe do laboratório: a direção D tinha o seu escuro e a N, aprovada, outro, com raios e
alguns tons diferentes. O site no ar usa o da N, que é o que ele vê; ficou esse.

### Como a sprint roda

1. **O meio é um protótipo em `prototype-lab/campaigns/`**, HTML, CSS e módulos ES sobre dados de exemplo, e não
   direto no `app/`. O fundador precisa ver e aprovar as telas, no computador e no celular, e o `app/` ainda é o site
   antigo (direção C), que a Sprint 09 reorganiza no lugar. Depois da aprovação, os tokens e os primitivos aprovados
   passam para `app/styles/tokens.css` e `app/components/ui/`, como pede a definição de pronto.
2. **A branch sai da `sprint-02-pot-core`**, e não da `main`: a `main` ainda tem o plano v0.0.1, em português, e o
   arquivo desta sprint na versão nova só existe no PR #27, que viaja dentro do #30. Quando os dois forem mesclados,
   o PR da -1 mostra só os seus commits.
3. **A base primeiro, as telas em paralelo.** Os tokens, os componentes, o quadro do site, o card, a matemática do
   pote (em BigInt, conferida com os exemplos A, B e C do plano técnico ao lamport), os dados de exemplo (16
   campanhas, todos os tipos e estados) e o contrato (`prototype-lab/campaigns/README.md`) foram escritos antes;
   quatro agentes fazem as telas ao mesmo tempo, cada um nos seus arquivos: a home e a lista, a página da campanha e
   a entrada, a caixa de abrir campanha, e as demais páginas.
4. **O contraste foi corrigido nos tokens**, nos três pares que o documento de design apontava abaixo de 4,5:1 e num
   quarto que apareceu na conferência: o cinza das legendas no escuro (3,64 → 4,92), o texto branco do botão azul no
   escuro (3,68 → 5,29), o âmbar pequeno no claro (3,47 → 5,23) e o cinza no fundo do claro (4,05 → 4,82). Os chips de
   estado e de tipo, novos, ficaram todos acima de 5:1.

## Alternatives considered

- **Desenhar direto no `app/`.** Juntaria o redesenho com o site antigo, que ainda compila e serve de referência até
  a Sprint 09, e o fundador só veria as telas rodando o Next.js. O protótipo estático abre em qualquer navegador.
- **Ramificar da `main`.** Daria uma sprint sem o plano que ela executa.

## Consequences

- O protótipo usa as poses, as fontes e o código do mascote do site no ar, copiados sem mudança de comportamento.
- A rota de abrir campanha continua `/abrir`, como decidiu o D6; com o site em inglês, a pergunta de trocar para
  `/open` vai ao fundador.

## O que foi construído no mesmo dia

O protótipo ficou pronto para a revisão: 69 arquivos, a base feita antes e quatro frentes em paralelo (a home e a
lista; a página da campanha com a entrada; a caixa de abrir campanha; minhas entradas, ranking, taxas, quem pode o
quê, como funciona e o cartão de compartilhar). A conferência final passou por 93 estados de página a 360 px: nenhum
erro no console, um título por tela, nenhuma rolagem lateral, nenhuma palavra proibida. O detalhe está no arquivo da
sprint, seção "Where it stands".

## As perguntas que ficam com o fundador

As três primeiras fecham a sprint; as outras podem esperar a sprint que constrói a tela.

1. **Aprovar as telas**, a caixa de abertura e os layouts de celular (D8).
2. **O selo de parceiro (L-24):** A, um chip ao lado do estado, ou B, uma faixa no alto do card. Recomendação: A.
3. **O aviso de trava (L-03):** A, "No early exit. This SOL stays in the pot until the campaign is paid or voided,
   after {deadline} and a 6-hour review. You can't cancel it or move it to the other side." (recomendado, já no
   protótipo); B, "Locked until the end…"; C, "Once you sign, this SOL belongs to the pot…".
4. **A rota de abrir campanha:** manter `/abrir` (D6) com `/open` levando a ela, ou trocar por `/open`. Recomendação:
   manter, com o redirecionamento.
5. **O nome público de uma campanha contestada (L-04):** hoje "In review", com "Contested · payout paused" embaixo.
6. **A forma da frase:** "Does SOL touch $150 by Oct 31, 2026?" (a do protótipo) ou "Will…?"; e se a frase leva a
   hora, que hoje só aparece na regra.
7. **Quais feeds da Pyth uma campanha de preço pode usar:** a caixa oferece só a lista fixa (SOL/USD e BTC/USD na
   devnet). É a mesma pergunta que a revisão da Sprint 02 deixou.
8. **A margem do "Most you'll pay"** na abertura (1%) e o piso de retorno assinado na entrada (95% da estimativa).
9. **Os tipos que ainda não abrem:** mostrar e deixar ver os campos (como está) ou deixar desativados (a spec).
10. **O cartão de compartilhar sempre escuro**, com SOL em duas casas na imagem.
11. **Para onde vai "Report this campaign" (L-13):** a conta no X e um email de contato, sem formulário.
12. **Atividade recente na página da campanha (L-23):** sem feed no MVP, só "23 entries · last 12 min ago".
13. **A entrada mínima numa campanha aberta** muda com a configuração (hoje sim) ou fica a da abertura (o que os
    termos publicados prometem). É a pergunta que já estava na Sprint 02.

## Follow-up

- O fundador aprovar as telas, a caixa de abertura e os layouts de celular; escolher o lugar do selo de parceiro e o
  texto do aviso de trava.
- Passar os tokens e os primitivos aprovados para o `app/`.
- O projeto antigo: a auditoria só de leitura está registrada no relatório ao fundador; nada foi apagado.
