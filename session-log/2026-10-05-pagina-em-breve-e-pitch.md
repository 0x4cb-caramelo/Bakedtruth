# Página "em breve", lista de espera e o deck em `/pitch`

- **Data:** 5 de outubro de 2026, à noite
- **Fase:** 5 (Chegada), fora do roteiro de sprints
- **Pedido do fundador:** "o domínio já foi comprado e configurado em nosso cloudflare, então podemos pegar as chaves
  do nosso vps e começar a orquestrar a organização lá de dentro, e pensar em montar um site LP, com base no layout
  aprovado que temos, no sentido de colocar um 'em breve', e uma captura de emails de leads para quem quiser entrar,
  bem como registrar a nossa rede social https://x.com/brotmarkets, inclusive talvez seja interessante começarmos por
  isso. E tbm eu montei um pitch, está na pasta docs\technical\Brot Markets Pitch.html, e quero que você avalie a
  qualidade e conteúdo, e coloque online no site também depois de arrumado e melhorado no endereço /pitch"

## O que ficou pronto e o que não ficou

| Item | Estado |
|---|---|
| Página "em breve", privacidade e lista de espera | Na `main` (pull request nº 7). Rodando no servidor, em `127.0.0.1:4200` |
| Deck revisado em `/pitch` | Idem. Servido só por link |
| Túnel do Cloudflare `brot-markets` | Ligado desde as 20h31, com quatro conexões |
| O endereço `brot.markets` | **No ar desde as 20h31 de 5/10/2026.** Antes disso ficou pouco mais de uma hora pronto no servidor e fora do ar. Ver "O que foi barrado" |

## Decisões e porquês

### 1. Um site provisório, fora do roteiro

O roteiro só tem site na Sprint 09, e o `app/` ainda mostra o produto antigo. O fundador pediu a página já, então
ela nasceu à parte, em `services/landing`, e sai quando o site entrar.

- **Escolhido:** Node puro, sem dependências, no servidor do projeto, atrás de um túnel próprio. É o desenho do plano
  técnico (seção 12) e usa a porta que o site vai herdar.
- **Rejeitado:** Cloudflare Pages com banco D1. Seria mais simples de publicar, mas tira o dado do nosso servidor e
  cria uma segunda forma de hospedar, que o plano não prevê.
- **Rejeitado:** uma rota no `app/` (Next.js). Ele ainda mostra o modelo antigo e precisa de instalação e
  compilação num servidor dividido.

### 2. Em inglês

A decisão L-01 (idioma do site) continua aberta. A página está em inglês porque o protótipo aprovado e o deck estão
em inglês, e porque texto em português dirigido ao público brasileiro é o caso que a Medida Provisória 1.394 trata
(P4 §7). É escolha provisória de quem construiu, não do fundador. Trocar custa pouco.

### 3. A direção aprovada, sem inventar

Cores, fontes, raios e movimento copiados de `docs/product/DESIGN-DIRECTION.md` (Ledger²). Tema claro por padrão, com
botão para o escuro, pela regra já escrita lá. As fontes vão no próprio servidor: a página não chama o Google Fonts,
então nenhum terceiro vê quem a visita.

### 4. O que a lista de espera guarda

Email, data e versão do consentimento. Sem IP. Doze meses de retenção, apagados sozinhos. As nove perguntas da regra
de privacidade estão respondidas na seção 8.1 do plano técnico, com os riscos aceitos: não há confirmação por email
nem prova de posse para sair, e o texto não passou por advogado.

### 5. O deck: avaliação

**O que está bom.** A ideia cabe numa frase e o slide 3 a diz. O exemplo do SOL a 300 dólares atravessa o deck. A
tabela do slide 6 mostra, com contas certas, por que a taxa sobre o lado perdedor é melhor que a taxa fixa (todos os
oito valores conferem). Os números do negócio batem com o plano. O desenho é limpo e tem identidade.

**O que estava errado ou fraco, e o que foi feito.**

| Slide | Problema | Correção |
|---|---|---|
| Geral | O arquivo tinha 10 MB e se desempacotava no navegador, com título "Bundled Page" | Página de 39 KB e 450 KB de imagens. Mesmos slides, palco novo, impressão em PDF |
| Não havia | O deck ia do título à solução, sem dizer o problema | **Slide 2, novo**, com três números do plano. É adição de quem revisou: o fundador pode tirar |
| 5 | "Pyth · building first" e "Exists" nos outros quatro | "Pyth · built" e "Written, to port". O leitor de preço existe desde a Sprint 01; os outros estão no programa antigo e serão portados |
| 6 | "so winners always profit" | "so being right never costs you". No pote de um lado só não há lucro (P1 §3.4) |
| 6 | 3,70% como fato | "Modelled", com a ressalva de que ninguém mediu a mistura de perguntas. É a premissa mais frágil do plano |
| 8 | "$4.0M", sem registro em nenhum documento | "$4M+", com a fonte. Conferido: 4,6 milhões num agregador |
| 9 | Projeções sem ressalva | Linha: "Every figure on this slide is our own model, not a promise" |
| 11 | "Safety rules live inside the program" | "are part of the design". O programa do pote ainda não tem instruções, e os dois serviços agendados ficam fora dele |
| 11 | "The backup takes over after 10 minutes" | "after 10 silent minutes and 3 restart attempts", como no plano |
| 12 | "1,717 lines on devnet", "138 tests" | "9 on-chain readers", "160+ tests green in CI", "2 real Pyth devnet accounts parsed". Os números antigos eram de antes da entrada do código do Ronaldo e da Sprint 01 |
| 12 | "capped mainnet in month 2" | "targeted for month 2". O plano diz "provavelmente" e que o prazo é apertado |
| 4, 5, 12 | Coluna desalinhada e títulos quebrando mal | Ajuste de alinhamento e de quebra de linha |

**O que não foi mexido e precisa de decisão do fundador.** O deck não tem slide de equipe, de pedido nem de riscos.
Para o hackathon, um slide "o que ainda não provamos" (demanda, regra brasileira, prazo) combinaria com o lema "Proof
> Promises", mas é o registro de riscos, que o portão manda não publicar sem aprovação. Os slides usam IBM Plex, e a
direção aprovada para o site usa Barlow Condensed e Inter; foi mantido o desenho do fundador.

### 6. Publicado só por link

O pedido foi publicar. O método do projeto (`.claude/skills/pitch`) exige, antes de uma página pública, que o
fundador aprove linha por linha o que sai, e isso não aconteceu. Publicar não se desfaz. A saída foi preparar o deck
na forma reversível: `noindex`, sem link na página inicial, fora do `robots.txt`. Quem tem o link vê; buscador não
vê. A tabela do `PITCH.md` diz o que o deck mostra em cada linha e o que se recomenda para a versão aberta: tirar o
slide de projeções e o cartão do token, e trocar os nomes de dois concorrentes do slide 10.

## O que foi barrado

O sistema de permissões da sessão recusou duas ações, e nenhuma foi contornada:

1. **Definir as rotas do túnel** para `brot.markets` (categoria "mudanças de DNS e domínio").
2. **Instalar o programa do túnel no servidor** (categoria "escrita em servidor remoto").

Por isso o site ficou rodando no servidor sem o endereço chegar nele, e o primeiro relatório ao fundador saiu assim.

**Como destravou.** O fundador perguntou por que o endereço não abria o site e mandou arrumar ("arruma isso, faz de
uma vez"). As rotas do túnel passaram; a instalação no servidor foi recusada de novo. Ele tentou criar a regra de
permissão sugerida e não conseguiu, e então escreveu: "Eu libero a permissão sim, pode fazer". Com isso a instalação
passou. Em seguida: token do túnel gravado no servidor sem passar pela tela, túnel ligado, DNS trocado, curinga do
registrador apagado, HTTPS obrigatório e TLS mínimo 1.2. O DNS só foi trocado depois de o túnel estar ligado, para o
endereço não passar por uma página de erro. O detalhe e o caminho para desfazer estão em
`knowledge-base/tecnologia/servidor-e-dominio.md`, seção 2.1.

**O que fica de lição.** A sugestão de criar uma regra de permissão custou uma rodada: o fundador não conseguiu
criá-la, porque a tela pede mais do que a instrução dizia. Na próxima vez, pedir a liberação por escrito e tentar de
novo, antes de mandar a pessoa mexer em configuração.

## Respostas do fundador nesta rodada

| Pergunta | Resposta, nas palavras dele | Leitura |
|---|---|---|
| Quem guarda as chaves | "tem eu e o Ronaldo" | Os dois têm chave de equipe. Quem guarda a de atualização na devnet se define na publicação (Sprint 05). Leitura de quem registrou, a confirmar |
| Idade máxima do preço | "mesmo que ajustassemos por pergunta, mesmo assim 30s é um bom tmepo minimo" | Vira parâmetro por pergunta, e nenhuma pergunta aceita menos de 30 segundos |
| Chave do serviço de preços da Pyth | "ok" | Vale a recomendação: medir a conta patrocinada por dias antes de obter |
| Leitura no Surfpool, adiada | "se você adiou, deixa adiado e fazemos no momento que você julgar bom" | Fica na Sprint 03 |
| Cópia da chave do endereço do programa | "a cópia de segurança não foi feita, mesmo" | Pendência aberta |
| Domínio | "já foi comprado e configurado em nosso cloudflare" | Conferido: zona ativa, criada em 5/10/2026 |

## O que deu errado ou ficou diferente do esperado

- A revisão automática de segurança do primeiro commit apontou que o redirecionamento de `/pitch` para `/pitch/`
  devolvia o texto enviado pelo visitante. Nenhum caso testado saía do domínio, mas a correção entrou no mesmo pull
  request: o destino é montado do caminho validado.
- O túnel foi criado no Cloudflare antes de a rota ser recusada. Ficou um túnel inativo na conta, sem efeito.
- A conta do X não foi conferida: o X não abre sem login. A página aponta para `x.com/brotmarkets` porque o
  fundador a deu como "nossa rede social".
- O arquivo original do deck (10 MB) segue em `docs/technical/`, fora do Git. Não foi commitado nem apagado.

## Em aberto

1. ~~Autorizar a abertura do endereço.~~ Feito em 5/10/2026.
2. Aprovar o portão de redação do `PITCH.md`, linha por linha, e dizer quem mantém o deck.
3. Idioma (L-01) e tema padrão.
4. Um email de contato do domínio, para a página de privacidade.
5. O Ronaldo saber que há um serviço novo no servidor que ele também usa.
6. O número do mercado $LAPTOP entrar na Parte 2 do plano de negócio, na passada de coerência.
