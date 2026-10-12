# 2026-10-12 — A página inicial "ainda assando": o pãozinho, os exemplos que rodam e a faixa para o devnet

## O pedido

Do Lucas, em 12/10/2026, sobre a página inicial do `brot.markets` (o site provisório, `services/landing`):

- "substituir o logo que tem no menu top bar, pelo nosso pãozinho, que temos apenas ele";
- no lado direito do topo, "aquela mecânica de demo rotacionando e vivo, mas com 4 exemplos novos e diferentes, e não
  os mesmos do pitch";
- "logo abaixo do menutopbar vamos colocar um aviso num retangulo das nossas cores do paozinho, dizendo que o site está
  under construction, mas usando nossos termos que ainda estamos baking, e com todo o retangulo clicável para
  direcionar pro devnet, nossa página /dev0x";
- e, no meio do trabalho: "coloca nosso favicon da pagina inicial dentro do /dev0x também".

## O que foi feito

- **A marca da barra do topo** é o pão simples (`img/brot-loaf.webp`), como o `BRAND.md` já dizia. A imagem estava só
  na branch da `/5` (`feat/site-3-original-com-cores-do-deck`) e foi copiada de lá. O Baked continua andando pela
  página.
- **A faixa "Still baking."** fica entre a barra do topo e a página, nas cores da casca (laranja `#eea546`, texto
  escuro), igual nos dois temas. A faixa inteira é um link para `/dev0x`. O texto: "This page is still in the oven. The
  devnet site is out already: join or open a campaign with test SOL, which has no real value." e o botão "Try it on
  devnet →".
- **Os exemplos do topo** (`examples.js`, `live.css`): quatro cartões em sequência, sem parar. Um ponteiro lê a
  pergunta, entra num lado com 0,5 SOL, as porcentagens mudam, e o cartão mostra "Resolved by the chain", o que a
  pessoa ganhou ou perdeu e para onde foi cada SOL do pote. Os quatro:
  1. preço: "Does ETH fall to $2,000 by Nov 30?" (entra no NO e acerta, +0,66);
  2. stake pool: "Does $POOL's stake pool reach 1M SOL by the last epoch of 2026?" (entra no YES e erra);
  3. queima: "Does $TOKEN's supply fall to 900M by Dec 15?" (entra no YES e acerta, +0,29);
  4. liquidez travada: "Does $TOKEN lock 500k of Meteora liquidity for good by Jan 15?" (entra no NO e erra).
- **O ícone da aba do `/dev0x`** (`app/app/favicon.ico`) era o triângulo padrão do Next. Passou a ser o Baked do
  favicon da página inicial, centrado num quadrado transparente, em 16, 32, 48, 64 e 96 px.

## Decisões minhas, e por quê

- **A conta dos exemplos é a do programa, e não a do deck.** O deck tira o 1% do criador da taxa da Brot (0,30, 0,10 e
  9,60 num pote de 10); o programa e a página de taxas do site tiram do pote (0,40, 0,10 e 9,50). A página inicial é
  do produto, então segue o programa. Um teste confere com o exemplo da página de taxas.
- **As palavras são as do site:** "campaign", "join", "side", "pot". Nenhum "market", "bet" ou "vote" nos cartões, e um
  teste guarda isso.
- **Dois acertos e dois erros, sem saldo acumulado.** O deck soma um "YOUR BALANCE"; numa página pública isso parece
  convite. Cada cartão diz "not a live campaign", e a linha de baixo diz "Made-up examples, in test SOL".
- **Só tipos que abrem hoje no devnet** (preço, queima, liquidez travada, stake pool). O stake de validador ainda não
  abre e ficou de fora. Os nomes são `$TOKEN` e `$POOL`, para não sugerir parceria com ninguém.
- **A animação para** com o ponteiro em cima do cartão e com a aba escondida, e não roda para quem pede menos
  movimento no sistema. Sem JavaScript a página mostra o primeiro exemplo, parado.
- **Arquivos novos em vez de mexer no `styles.css`:** assim a página de privacidade e a 404 não precisam de versão
  nova. A `/2` recebeu as mesmas mudanças, porque um teste exige que ela diga o mesmo que a página inicial.
- **A página de privacidade e a 404 seguem com o Baked na barra.** O pedido era a página inicial.

## O que foi conferido

- Os 51 testes do site provisório passam (47 de antes e 4 novos, em `tests/home.test.mjs`).
- Num navegador sem tela, com o servidor local: a página inicial nos dois temas, no celular (390 px, sem rolagem
  lateral) e a `/2` nos dois temas; os quatro exemplos passaram em sequência com os números certos; nenhum erro no
  console e nenhum arquivo faltando, com a política de segurança do site ligada.
- Não conferido: o `/dev0x` com o ícone novo (precisa do build do Next), e um celular de verdade.

## Em aberto

- O ícone do `/dev0x` só aparece depois de um build novo do site no servidor (`brot-site`), que é do Ronaldo.
- A página ainda diz "Coming soon" e "Get an email when campaigns open on devnet", e a faixa nova diz que o devnet já
  está no ar. O texto do formulário é o que as pessoas consentiram; mudar é decisão do Lucas.
- A faixa leva o público ao `/dev0x`, que mostra o ranking e a abertura de campanhas, antes de a página de privacidade
  nova estar no ar.

## A publicação (12/10, à tarde)

O Lucas viu a página rodando na máquina dele e escreveu: "Excelente, pode fazer o deploy e colocar online direto,
alterando depois o changelog, sessions e memories, commit e push."

- **Só a página inicial foi publicada.** O servidor estava no commit `bb604aa`, atrás da `main`, que tem as páginas
  legais novas ainda sem ordem de publicação. A mudança foi refeita sobre o commit do servidor (`ab764ab`), enviada
  como um pacote com esse único commit e puxada na cópia de trabalho, sem reiniciar o serviço: o site lê os arquivos a
  cada pedido. Depois a `main` entrou na branch, com um conflito numa linha de teste.
- **Um teste antigo falha no commit publicado, de propósito:** "the home page and /pitch do not link to /dev0x" é do
  tempo em que `/dev0x` era a prévia escondida do protótipo. Na `main` ele já fala de `/prototype`, e ali os 51 passam.
- **A edição à mão do Ronaldo** em `services/landing/lib/campaigns.mjs`, na cópia do servidor, ficou como estava.
- **Conferido de fora, em `https://brot.markets/`:** a página, o estilo, o script e o pão respondem 200; a faixa aponta
  para `/dev0x`, que responde 200; num navegador sem tela os quatro exemplos rodaram nos dois temas. O único erro no
  console é o script de estatísticas do Cloudflare, bloqueado pela política do site como em todas as páginas.
- **O ícone do `/dev0x` não foi publicado.** Está no repositório; aparece quando o site de lá for reconstruído.
- **Um tropeço no caminho:** o servidor local que eu tinha deixado aberto para o Lucas ver a página segurava o arquivo
  `index.html`, e a troca de versão na cópia de trabalho travou. Desliguei o servidor local e refiz o passo.
