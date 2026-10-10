# 2026-10-10 — Colosseum: o formulário inteiro, o PDF do deck e o retorno do revisor

Continua `2026-10-09-colosseum-rascunho-da-submissao.md`, que guarda o começo: a volta da submissão ao plano, o
rascunho, a segunda versão da primeira aba, a categoria e a segunda aba.

## O que era verdade antes

- O rascunho da submissão tinha as duas primeiras abas do formulário respondidas e os roteiros dos dois vídeos.
- O deck só existia como página (`brot.markets/pitch`); o formulário da Superteam pede um PDF.
- Ninguém de fora tinha lido as respostas.

## O que o Lucas pediu, na ordem

1. "consegue pegar o nosso pitch e transformar cada pagina em pdf?"
2. A terceira aba, "Team": "vamos para o ultimo grupo de perguntas".
3. Duas respostas de outra tela, sobre o apoio da Anthropic: "acho que tenmos que diminuir as respostas".
4. O retorno do revisor da Superteam: "rodei o revisor.superteam.com.br e veio o retorno".
5. "vamos documentar tudo, changelog, sessions e memories, e todas essas respostas que enviamos pro revisor, o que ele
   retornou, e as melhorias que precisamos fazer num novo documento md."

## O que foi feito, e por quê

- **O PDF sai da regra de impressão que o deck já tinha,** com o movimento desligado (`?motion=off`), e não de
  capturas de tela: o texto fica selecionável, o que serve a um revisor que lê os slides. Um arquivo com os nove
  slides e um arquivo por slide, porque "cada página em PDF" tem as duas leituras.
- **Os PDFs ficam fora do Git.** São derivados do deck e mudam quando ele mudar; os três logotipos, que são
  origem, entraram.
- **O perfil do Lucas não foi inventado.** Os arquivos só têm nome, cargo, o endereço do LinkedIn e dois vínculos.
  Preenchi o que o slide sustenta, rascunhei uma resposta ("why choose this?") com as decisões dele que os registros
  guardam, e pedi os fatos para o resto. Idade, cidade e participação não entram no repositório: os jurados podem
  receber acesso de leitura.
- **As duas respostas da Anthropic foram encurtadas com dois ajustes de sentido,** para não dizer o que o código
  desmente: "no admin key" virou "nobody picking the winner", e "we're onboarding" virou "we want as launch partners".
- **A lista de tecnologias troca "Next.js" por "Claude Code".** O revisor sugeriu seis itens com Next.js. O campo pede
  as ferramentas de IA pelo nome, e o Next.js ainda não faz parte do produto novo. As duas listas têm seis itens.
- **A resposta sobre manipulação diz o que o código garante,** e não que o criador não influencia. Ele decide se
  cumpre a própria promessa, e o plano registra que quem entra contra corre esse risco. O programa garante três
  coisas: a autoridade de emissão revogada na abertura, a trava de entrada quando o resultado já se sabe, e a
  anulação com devolução quando a conta não pode ser lida ou o preço está velho.
- **O número de uso oferecido é o da equipe, dito como tal.** O revisor pede usuários de fora e avisa: "se ninguém
  usar, não estime nem invente número". Não há usuário de fora, nem tela ou comando para uma carteira de fora entrar.
- **O documento novo é separado do rascunho.** `colosseum-submissao.md` guarda o porquê de cada resposta, na ordem
  em que foram escritas; `colosseum-revisor-e-melhorias.md` junta o que foi ao revisor, o que voltou e o que falta.

## O que deu errado

- **O primeiro PDF saiu com os cartões espelhados.** Os cartões que viram (o exemplo do slide de solução e as fotos
  do slide de equipe) têm frente e verso, e a impressão para PDF desenha os dois. Eu disse que tinha conferido os nove
  slides, mas tinha conferido uma renderização da tela com a regra de impressão, e não o arquivo. O revisor apontou o
  slide 3. O segundo PDF esconde os versos e foi conferido no próprio arquivo, aberto no leitor de PDF do navegador,
  página por página.
- **A resposta de tecnologias não cabia no campo.** O campo não mostrava limite na colagem, e escrevi 2.365
  caracteres; o portal cortou o texto no meio de uma frase.
- **As respostas da primeira versão envelheceram em horas.** Diziam que o programa não estava na devnet; o Ronaldo
  publicou na mesma noite. Passei a buscar a `main` antes de afirmar o que existe.
- **O shell falhou três vezes ao gravar textos com tabelas,** e a causa só apareceu na terceira: linhas que começam
  com barra vertical. Arquivos assim passaram a ser gravados com a ferramenta de escrita.

## Achados

- O repositório é privado e não havia convite a `hackathon@colosseum.com` (API do GitHub, 10/10).
- A varredura do histórico inteiro da `main` com os padrões do projeto não achou credencial. Os padrões não cobrem
  arquivo de chave da Solana nem endereço de RPC com chave.
- `complian.cc`, citado no slide de equipe, responde "Account Suspended".
- Na lista da equipe do formulário, o cargo do Bernardo está "CO".
- O `README.md` da raiz ainda descreve o `pred-provable`.
- A nota do revisor é a fração dos pontos que se aplicam: 54 de 89 dá 61 (conta minha, a partir da tabela dele).

## Em aberto

A lista completa, com dono e situação, está na seção 3 de `docs/business/colosseum-revisor-e-melhorias.md`. O que
desclassifica: os dois vídeos e a resposta "extreme lengths" em inglês, cujo texto não veio.
