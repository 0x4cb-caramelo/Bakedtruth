# 2026-10-16 — O app Android, a carteira pelo MWA e a inscrição na Superteam

## Os pedidos

Ronaldo, entre 15 e 16/10/2026:

1. Um APK para a trilha mobile da Solana Mobile (o hackathon CLOCK IN, com uma exceção que os organizadores abriram no
   Discord; ele já tem a plataforma de submissão). "Só para submeter", e "pra ontem".
2. Depois, a inscrição no bounty da Superteam Brasil "Get your Seeker app to Mainnet", que fecha em 16/10 às 23h59
   (horário de Brasília) e anuncia os vencedores em 19/10. Ele pede o app rodando na devnet num Android, um vídeo de até
   5 minutos, um repositório público que compile a partir de um clone limpo, notas de prontidão para a mainnet (até 500
   palavras) e o custo da publicação. "Não queremos publicar em mainnet ainda."

## O APK

- **Uma casca em volta do site, não um app React Native.** O `solana-mobile webshell` (CLI 0.6.0) gera um WebView que
  abre `https://brot.markets/dev0x` e entrega à carteira os pedidos do Mobile Wallet Adapter. Cabe no prazo e reaproveita
  o site inteiro. O preço: o critério de desempate da Superteam prefere um app que use o Seeker "rather than being a web
  app in a shell".
- **A chave de assinatura é de teste e fica fora do repositório.** O mesmo arquivo (SHA-256 `8ffb28f0…d835`) está no
  link do Google Drive da submissão à Solana Mobile e na pré-release `android-devnet-v0.1.0` do GitHub.
- **O APK só abre o site**, então cada publicação do site chega a quem já instalou, sem um APK novo.

## Por que a carteira não conectava: duas causas, a segunda a de fundo

1. **A Solflare abria a própria página web na mainnet-beta.** O site criava o adaptador dela sem rede, e o SDK da Solflare
   assume a mainnet-beta; dentro do WebView não há extensão, então o botão "Solflare" caía nessa página. Correção
   `a7c9b15`: dentro do app, a lista mostra só o Mobile Wallet Adapter; fora dele, a Solflare recebe a rede do site.
   Publicada como `a7c9b1561f71` (15/10, ~21h40 UTC).
2. **A CSP recusava o canal da carteira.** Com a lista certa, a carteira abria e o app ficava em "connecting". Num
   emulador Android 15 com a carteira de teste da Solana Mobile (fakewallet) e o DevTools do WebView, a página tentou 21
   vezes `ws://localhost:<porta>/solana-wallet`, o canal que a carteira abre no próprio celular, e o `connect-src` recusou
   todas, até a biblioteca desistir aos 30 s. Com a CSP desligada pelo DevTools, e depois com a CSP nova servida
   localmente, a carteira pediu a autorização na devnet e o app voltou conectado. Correção `79318d1` (`ws://localhost:*`,
   com um teste que falha sem a regra), publicada como `79318d17428d` (16/10, ~03h05 UTC); em seguida o próprio APK do
   Drive conectou no emulador contra o site no ar.

**Por que a biblioteca MWA ficou na 0.6.0.** A 0.7.0 (protocolo 3.0.1, de 7 a 9/10) rejeita os pedidos pendentes quando
a sessão cai, em vez de deixá-los pendurados; ajudaria a mostrar erros, mas não era a causa, é nova e o teste passou com
a 0.6.0. Fica como melhoria.

**Por que o JavaScript parado em segundo plano foi descartado.** No emulador, um relógio de um segundo seguiu contando
com a carteira na frente (WebView 124). Num celular com outra versão isso ainda pode diferir, por isso falta o teste do
Lucas num aparelho.

## O iPhone

O Ronaldo pôs o site na tela inicial do iPhone; a Solflare abria o Brot no navegador dela em vez de conectar. Não é o
mesmo erro: o Mobile Wallet Adapter não existe no iOS (a documentação da Solana Mobile diz que não há suporte em app nem
em navegador, porque o iOS suspende apps em segundo plano), e os adaptadores da Solflare e da Phantom, num iPhone,
mandam de propósito para o navegador da carteira (`solflare.com/ul/v1/browse/…`, `phantom.app/ul/browse/…`). As
alternativas para conectar dentro do ícone da tela inicial: WalletConnect (o suporte da Solflare e da Phantom na Solana
não foi confirmado), uma carteira embutida com login Google/Apple (muda a regra de produto, e o Phantom Connect parou de
aceitar cadastros em setembro) ou uma extensão do Safari. A escolha é dos sócios; a recomendação foi explicar isso na
tela agora e testar o WalletConnect depois da inscrição.

## O repositório para a inscrição

- **`android/`** é o projeto gerado, sem mudança no Kotlin nem no Gradle; só o caminho da chave no `twa-manifest.json`
  virou um nome de arquivo local, e `*.keystore` fica fora do Git.
- **O README** passa a dizer o estado de 16/10 e como rodar o site, a API e o app. Num clone limpo da branch, todas as
  instruções funcionaram depois de uma correção: o `bun run build:program` parava no IDL sem o `shank-cli 0.4.9`, que o
  README citava sem dizer como instalar; a linha de instalação entrou. O binário saiu com 209.824 bytes, o tamanho do
  programa no devnet, e o IDL gerado não diferiu do que está no repositório.
- **O repositório é público** (conferido em 15/10). Em 14/10 o registro dizia "repo publico por hora nao"; a mudança não
  estava escrita. A revisão de segurança de 15/10 (SEC-30) apontava detalhes do servidor em `deploy/vps/README.md` e em
  `knowledge-base/tecnologia/servidor-e-dominio.md`, que agora estão públicos, com o histórico.

## O que ficou aberto

- O teste num celular de verdade (Lucas) e o vídeo.
- A nota de prontidão para a mainnet (493 palavras) e o custo (cerca de 1,1 SOL sem folga e 2,2 SOL com o dobro de espaço
  para atualizações) estão no texto da inscrição, fora do repositório porque ele leva os dados da equipe.
- A decisão sobre o repositório público.
- Esta branch precisa entrar na `main` antes de qualquer publicação do site feita a partir da `main`, ou as duas
  correções da carteira saem do ar.
