# Mascote vivo na página inicial e a segunda versão do deck em `/pitch`

- **Data:** 5 de outubro de 2026, à noite, depois de o endereço entrar no ar
- **Fase:** 5 (Chegada), fora do roteiro de sprints
- **Pedido do fundador:** "absolutamente perfeito o site estar online, e aquela captura de email está funcionando? ele
  vai pra onde? ele salva como? e bora animar o cacetinho para ele se mexer na página, como temos no protótipo? e o
  botão do suggest, vamos deixar pré-escrito um exemplo de frase e pergunta já nos mencionando e com uma hashtag
  junto? e outra, o pitch foi atualizado, o novo arquivo está em docs\technical\Brot Markets Pitch v2.html, coloque
  lá no lugar do /pitch no site e na hora de fazer, confira se ele está funcional, sem bugs"

A sessão que começou o trabalho caiu depois de escrever os arquivos e antes de testar. Outra sessão retomou do estado
do disco e da transcrição: conferiu, corrigiu o que estava quebrado, testou e publicou.

## Decisões e porquês

### 1. O mascote: o comportamento do protótipo, sem inventar

- **Escolhido:** portar `prototype-lab/shared/mascot.js`, que é o comportamento aprovado (`DESIGN-DIRECTION.md`,
  "Mascote"): ele só fica em pé em pontos declarados na página, pula para o mais próximo de onde o ponteiro para,
  muda de pose conforme o que está sob o ponteiro, cansa e emburra se ninguém mexe, e fala ao pousar e ao ser
  cutucado. Na página são cinco pontos: o título, o cartão de exemplo, dois dos três princípios e o rodapé.
- **Em três arquivos**, e não em um, pela regra das 200 linhas: `mascot.js` (onde ficar), `mascot-body.js`
  (desenho) e `mascot-senses.js` (o que ele percebe).
- **Estilos no `styles.css`**, e não criados pelo script como no protótipo: a política de conteúdo da página
  inicial não aceita estilo embutido, e ela não foi afrouxada. Um teste novo falha se alguém puser estilo ou script
  embutido nas páginas.
- **Privacidade:** o mascote lê a posição do ponteiro, a rolagem e o foco do teclado só para se mover. Não guarda
  nem envia nada, então a regra de privacidade não é acionada e o texto da página de privacidade continua certo.
- **Acessibilidade:** é decorativo (`aria-hidden`), não recebe foco, segue o foco do teclado, fica parado com
  "reduzir movimento" e encolhe no celular para não cobrir o texto.
- **Novo em relação ao protótipo:** quando alguém entra na lista de espera, ele faz a pose de aprovação e diz "Fine.
  You're in.". É adição de quem construiu.

### 2. O botão de sugestão

Abre o X com um rascunho pronto: `Question for @brotmarkets:`, a pergunta de exemplo da própria página (`"Does SOL
touch $300 by Dec 31?"`), `The chain can answer it.` e `#BrotMarkets`. A pessoa troca a pergunta pela dela. Um teste
garante que a menção e a hashtag continuam no link. A hashtag foi escolha de quem construiu; trocar custa uma linha.

### 3. O deck: a segunda versão do fundador entra como veio

O arquivo novo tem 8 slides no lugar de 12: título, problema, solução, patrocínio, taxa, mercado, distribuição e
fechamento. Ficou mais curto e voltado a projetos parceiros. Ele adotou a ideia do slide de problema (que na
primeira revisão era adição de quem revisou) e o escreveu do jeito dele, com três concorrentes pelo nome.

- **Escolhido:** o mesmo caminho da primeira versão. O pacote de 13 MB que se desempacota no navegador vira uma
  página de 28 KB sobre o palco que já existia, com as mesmas imagens (seis eram iguais byte a byte; entraram a pose
  sentada e o código QR).
- **A animação do deck novo foi portada**, porque faz parte do que o fundador desenhou: a entrada de cada slide, o
  mascote correndo em três pulos na troca, e o final do último slide (piscada, brilhos, a seta que aponta para o
  código QR). O script original dependia do motor do pacote; virou `deck-motion.js`, com os mesmos tempos.
- **Dois ajustes de texto, os mesmos da primeira revisão**, ambos no slide 5:
  "so winners always profit" virou "so being right never costs you" (no pote de um lado só não há lucro, P1 §3.4), e
  "Average take on volume" virou "Modelled average take on volume ... a question mix nobody has measured yet" (é a
  premissa mais frágil do plano). O fundador pode desfazer os dois.
- **Um ajuste de forma:** no slide 8, "20–30 projects" quebrava de linha no meio do intervalo.
- **Nada mais foi mexido.** Os nomes de concorrentes do slide 2 são escolha dele e ficaram.

**Conferido.** Os números do slide de mercado (1,88 e 4,63 bilhões, 93,6 milhões, 21,7 bilhões, 28,6 milhões e 21
mil carteiras, 80 milhões de carteiras) e as três afirmações do slide 2 (voto de token em 4 a 6 dias, chave da
empresa, dois modelos de linguagem) constam na Parte 2 do plano, com fonte. A conferência foi por busca no plano, e
não uma nova ida às fontes. O código QR foi lido por programa e aponta para `https://x.com/brotmarkets`.

**Segue só por link.** `noindex` na página e no cabeçalho, sem link na página inicial, fora do `robots.txt`. A
tabela do `PITCH.md` foi refeita para os oito slides. Dois pontos novos nela: nenhum slide diz mais que o produto
está em fase de testes, e o slide 2 cita concorrentes pelo nome.

### 4. A captura de email: resposta, sem mudança

Funciona, e nada foi alterado nela. O formulário manda o email para o próprio servidor do projeto, que grava uma
linha por pessoa num arquivo de texto (`/var/lib/brot-markets/leads/`), legível só pelo usuário do serviço: email,
data e hora, versão do texto de consentimento e origem. Sem IP. Sair pela página de privacidade apaga na hora; doze
meses depois da inscrição a linha é apagada sozinha. Ninguém é avisado quando entra um email novo, e não há cópia
fora do servidor: as duas coisas são lacunas a decidir.

## O que deu errado

- **A primeira sessão caiu no meio**, com os arquivos escritos e nada testado nem commitado. Não se perdeu trabalho,
  porque o estado do disco e a transcrição bastaram para retomar.
- **Bug achado na retomada, antes de publicar:** quem abrisse o deck direto no último slide (`/pitch/#8`) nunca via
  a seta final. O palco avisava "slide aberto" antes de o script de animação estar ouvindo. Corrigido pela ordem dos
  dois scripts, e um teste trava essa ordem.
- **Bug achado na retomada:** a primeira fala do mascote saía embaixo dele, em cima do texto, porque a posição do
  balão era decidida antes do primeiro desenho. Corrigido.
- **O roteiro de fala e a tabela do `PITCH.md` ainda descreviam o deck antigo.** Refeitos.

## Como foi testado

Num navegador sem tela, contra o servidor de verdade rodando na máquina: os oito slides cabem no quadro e não há
imagem quebrada nem erro no console; teclado, clique e endereço navegam; o mascote do deck aparece na troca e some
depois; a seta final aparece vindo de outro slide e em link direto; com "reduzir movimento" nada se move e a seta
está lá; no celular em pé os slides empilham. Na página inicial: o mascote aparece, pula entre os pontos, muda de
pose sobre o botão e sobre o "Yes", responde ao clique, aprova a inscrição, encolhe no celular, e a página não ganha
rolagem lateral. 26 testes automáticos, todos passando.

**Não testado:** navegadores que não sejam o Chromium, e um celular de verdade (o teste usa uma janela estreita).

## Em aberto

1. Aprovar o portão de redação do `PITCH.md`, agora para os oito slides; decidir os nomes do slide 2 e o aviso de
   fase de testes.
2. Aviso de email novo na lista e cópia de segurança do arquivo.
3. A hashtag do rascunho de sugestão (`#BrotMarkets`) e a fala nova do mascote são propostas, a confirmar.
4. Seguem as pendências do registro anterior: idioma, email de contato do domínio, avisar o Ronaldo do serviço no
   servidor.
