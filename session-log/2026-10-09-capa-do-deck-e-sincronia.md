# 2026-10-09 — A frase nova na capa do deck, a sincronia do repositório e o roteiro do v4 no Git

## O que era verdade antes

- A capa do deck no ar (`brot.markets/pitch`, o v4) dizia, sob o título: "Permissionless prediction markets, settled
  by on-chain data."
- A branch `feat/site-3-original-com-cores-do-deck` (as páginas `/3`, `/4` e `/5` e o `BRAND.md`) estava dois commits
  atrás da `main`.
- Quatro arquivos estavam no disco sem estar no Git: o roteiro de fala do v4, o plano de negócio v0.0.3 num arquivo
  só e os dois originais do deck do fundador.

## A frase da capa

O Lucas, em 9/10/2026: "agora vamos voltar pro pitch que está online, no slide 1 mudar a frase que tem lá para
'Permissionless prediction markets that turn on-chain milestones into growth campaigns, settled by the chain
itself.'" É a frase que ele escreveu na inscrição do DemoDay.

- **O que mudou:** só a frase de apoio do slide 1. O título ("Prediction markets the chain resolves.") ficou.
- **A descrição da página acompanha a frase.** Ele não pediu; foi escolha minha, para a prévia de link não mostrar a
  frase antiga. Se ele preferir a descrição anterior, volta numa linha.
- **"on-chain" não quebra no hífen.** Na primeira medida a palavra partia em duas linhas. Ela e "the chain itself."
  ganharam a marca que impede a quebra. A frase ocupa três linhas e cabe no slide a 1920, 1366 e 390 pixels.
- **Foi ao ar no mesmo dia,** pelo pedido de mudança 42, porque o pedido dele era sobre o deck "que está online". O
  servidor não tem credencial do GitHub: o código foi num pacote do git por SSH, e só o serviço do site foi
  reiniciado.
- **O deck continua dizendo "prediction markets".** É o deck do fundador, e a regra de palavras do plano de negócio
  (campaign, e não market) vale para o produto e o site, não para ele. A frase de elevador aprovada em 7/10 também
  mantém "prediction market" como a palavra da categoria.

## A sincronia e o que entrou no Git

O Lucas, mais tarde: "leia todas as nossas regras, e depois vamos para contexto ver nosso changelog, sessions e
memories, e últimas conversas no chat, além de sincronizar com o nosso repo. Se tinha coisa antes que não commitamos,
vamos fazer isso, e atualizar nossos docs tbm."

- **A `main` entrou na branch do site.** Um conflito só, no `CODEMAP.md`, que é gerado e foi regenerado. Os 61 testes
  do site passam.
- **O roteiro do v4 foi comitado** (`docs/business/roteiro-pitch-v4.md`). Estava pronto desde a madrugada de 9/10,
  esperando a palavra dele. Ganhou uma linha dizendo que a frase da capa mudou e que a fala da capa, que segue o
  título, não muda.
- **Três arquivos continuam fora do Git, e não por esquecimento.** A decisão está registrada em
  `2026-10-08-mentores-deck-v4-e-termos.md`: o `BP-v0.0.3-completo.md` é uma cópia de 188 KB das quatro partes e
  envelhece na primeira edição de qualquer uma; os dois "Brot Markets Pitch" em `docs/technical/` são os originais do
  fundador, com 10 e 13 MB. Li "coisa que não commitamos" como o que esperava autorização, e não como desfazer essa
  decisão: 23 MB no histórico de um repositório não saem mais. Se ele quiser os três no repositório, é uma palavra.

## O que o Ronaldo abriu enquanto isso

Visto na sincronia, sem mexer em nada:

- **Pedido 41, Sprint 04** (liquidação, pagamento, taxas, parte do criador e invariantes): aberto contra a `main`.
- **Pedido 43, Sprint 05** (o SDK e o ciclo na devnet, "preparado, não publicado"): rascunho, sobre a branch da
  Sprint 04.
- **Pedido 36, Sprint -1** (o design das telas das campanhas): rascunho, ainda sobre a direção de design antiga, de
  antes do `BRAND.md`.

## Em aberto

- A branch do site (`/3`, `/4`, `/5` e `BRAND.md`) segue sem pedido de mudança e sem publicação: espera a palavra do
  Lucas.
- Os outros slides do deck ainda falam em USDC, semente e teto para a rede principal; o BP v0.0.4 diz tudo em SOL e
  nenhum teto. O DemoDay é em 10/10/2026 e a entrega do Colosseum em 12/10/2026.
- O Ronaldo ainda não foi avisado do `BRAND.md`, e o pedido 36 segue a direção antiga.
