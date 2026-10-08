# Revisão dos mentores, deck v4 em `/pitch`, e o começo dos termos de uso

- **Data:** madrugada de 8 de outubro de 2026 (das 2h28 às 4h23); registro escrito na tarde do mesmo dia
- **Fase:** 5 (Chegada), site provisório; o item dos termos toca a Fase 2 (jurídico do plano)
- **Por que este registro veio depois:** a sessão acabou no limite de uso da conta, no meio da terceira tarefa. O
  `CHANGELOG.md` recebeu o v4 e a troca para `/pitch`; o resto (a falha do CI, os termos, o índice do docs) ficou só
  na conversa.

## 1. O plano inteiro num arquivo só (2h28)

Ele perguntou: "Se o O BUSINESS-PLAN.md virou o índice, com o plano em uma página, então cadÊ o BP em si? Me passe o
documento", e depois "monte em md, mesmo". Juntei o índice e as quatro partes da v0.0.3 em
`docs/business/BP-v0.0.3-completo.md`, com um comentário no topo dizendo que é gerado e que as partes continuam
sendo a fonte. **Fica fora do Git de propósito:** é uma cópia de 188 KB que envelhece na primeira edição de qualquer
parte. Se ele quiser o arquivo no repositório, o certo é um script que o gere, e não a cópia comitada.

## 2. A revisão do `/pitch3` com os mentores (2h41, PR 21)

Ele trouxe duas gravações do celular, transcritas automaticamente, de uma conversa de três ou quatro pessoas, e
pediu: "organize e analise a transcrição, e pelo contexto tente deduzir quem era o quê e organize as críticas,
mudanças, sugestões e etc por slide". As transcrições foram para `knowledge-base/pitch/` como vieram (brutas); a
análise está em `docs/business/_review/revisao-do-pitch-2026-10-08.md`.

- **Quem é quem foi deduzido, e a certeza está escrita por linha.** O programa de transcrição renumera as vozes em
  cada gravação; o fundador e "alguém da equipe, provavelmente o Ronaldo" ficaram com certeza alta, os dois mentores
  só se separam na primeira gravação. Os mentores ficam sem nome, como a banca de 6/10.
- **Seis decisões do fundador, R1 a R6,** com a minha recomendação em cada uma. Nada foi mudado no deck nem no plano
  nessa etapa.

## 3. O deck v4 (3h18, PR 22)

A resposta dele veio slide a slide ("vamos deixar como v4"). O v4 nasceu de uma cópia do `/pitch3`, em `/pitch4`,
para o `/pitch3` continuar comparável. O que mudou está no `CHANGELOG.md`; o que importa para o porquê:

- **R1 e R2 respondidas pelo próprio deck:** "6, exato, pode juntar os dois slides seguindo a sugestão deles". Abrir
  mercado passa a pedir uma semente de 500 dólares ou mais, 90% vira prêmio e 10% é taxa; os 0,02 SOL saem. Isso
  muda as decisões 2 e 15 do BP v0.0.3, que ainda diz 0,02 SOL. **O plano não foi tocado.**
- **"1% of the market's volume"** no lugar de "1% do pote". Volume (o que foi apostado) e pote (apostas mais 90% da
  semente) não são o mesmo número; o plano precisa dizer qual vale.
- **R3 sem resposta direta:** "slide que sobra, não vamos criar novo slide, não, vamos direto pro growth". O slide de
  proteção contra manipulação não entrou; quais métricas entram no lançamento continua em aberto.
- **R5, equipe:** ele mandou as fotos reais, a virada do retrato para a foto e o LinkedIn de cada um. O acordo escrito
  do Bernardo e do Ronaldo sobre nome e rosto não está registrado.
- **R4 (o valor da taxa reduzida dos três primeiros meses) e R6 (o prazo de entrega)** seguem com ele.

## 4. Um deck só no ar (4h07, PR 23)

O pedido tinha três partes. A primeira: "vamos tirar do ar os pitches zero, 2 e 3, e passar o 4 para o endereço
/pitch, e os que foram tirados do ar ficam guardados no repo apenas para fins de história e evolução do pitch", mais
ajustes no deck.

- **Os decks antigos foram para `services/landing/history/`, com os roteiros, e não para o lixo,** porque ele pediu
  a história. Nada lá é servido; um README diz como reabrir um deles.
- **`/pitch2`, `/pitch3` e `/pitch4` redirecionam para `/pitch/`** em vez de dar 404, porque esses links já tinham
  sido mandados para gente de fora.
- **Erro meu nas marcas da equipe, corrigido:** no v4 eu tinha escrito cargo e marca de cada um ("Business
  Development Executive", "Co-Founder", "Managing Partner"...). Ele disse "você errou todas as marcas de cada um" e
  pediu só duas marcas por pessoa, e as frases engraçadas de volta.

## 5. O que deu errado: um pull request entrou com o CI vermelho

O PR 23 foi juntado ao `main` e publicado com a verificação "Repo" reprovada. O comando que esperava as verificações
e o que juntava estavam ligados por `;`, e não por `&&`, então o segundo rodou mesmo com o primeiro falhando. O limite
de uso chegou logo depois, e a causa ficou sem ser vista.

**A causa,** vista na tarde de 8/10: o `os-self-test` confere os links dos documentos, e o índice do plano
(`docs/business/BUSINESS-PLAN.md`) apontava para `services/landing/pitch3-notes.md`, que a mudança tinha movido para o
histórico. O site não foi afetado. Corrigido no mesmo commit deste registro, junto com o caminho das imagens no
`LEIA-ME` das poses. **Para não repetir:** juntar só depois de as verificações passarem, com `&&` ou conferindo o
resultado, e rodar `node scripts/os-self-test.js` localmente quando arquivos de documentação mudam de lugar.

## 6. Termos de uso: pesquisa começada, rascunho não escrito

A segunda parte do pedido: "vamos trabalhar os documentos bases do site, como terms of servisse e outros. e faça uma
lista dos documentos principais que são necessários termos, depois pesquise e leia os arquivos dos nossos principais
concorrentes (polymarket, kalshi, world.xyz e https://robinhood.com/us/en/prediction-markets/) documente e importa
os contratos/termos de cada um deles, e depois crie um nosso, com o que você julgar ser um contrato bom pra gente,
porém minimalista, e sem juridiquês, direto ao ponto, e inclusive trazendo um pouco de brincadeira do nosso tom do
pãozinho".

Foi entregue a um agente, que baixou 13 documentos e parou no limite de uso antes do resto:

| Empresa | O que foi baixado |
|---|---|
| Polymarket | Terms of Use (vigente desde 11/8/2026), Market Integrity, Geographic Restrictions |
| Kalshi | Member Agreement, Rulebook v1.29 |
| World (world.xyz) | Terms of Service, Privacy Policy |
| Robinhood | Derivatives Client Agreement, Arbitration Agreement, Fee Schedule, Event Contracts Risk Disclosure, Privacy Statement, a página de prediction markets |

Estão em `knowledge-base/legal/concorrentes/<empresa>/`, cada um com fonte, data da coleta, como foi obtido e a linha
"Cópia para referência interna. Texto de terceiros, não é nosso." **Ainda fora do Git:** entram no pull request do
item dos termos, junto com o que falta: o resumo comparativo, a lista dos documentos de que precisamos, e o rascunho
dos nossos termos. Não há política de privacidade da Kalshi; não conferi se o agente tentou baixá-la.

Por que isso foi a agente e com estas regras: o fundador é advogado, então o rascunho vai a revisão de um advogado e
não se apresenta como parecer; e a regra de pesquisa proíbe preencher do que se lembra o texto de uma página que não
abriu. Várias dessas páginas são montadas no navegador e vêm vazias por download direto; o agente achou o texto por
outros caminhos (o da Polymarket, num Google Doc embutido na página) e anotou no cabeçalho de cada arquivo como o
obteve.

## 7. O que não começou

A terceira parte: "uma página do tipo doc.brot.markets para colocar a documentação estilo wiki da parte séria da
nossa empresa ... comece me mostrar um roteiro/índice". Nada foi feito.

## Fora do Git, por decisão

- `docs/business/BP-v0.0.3-completo.md`, pelo motivo da seção 1.
- `docs/technical/Brot Markets Pitch.html` e `Brot Markets Pitch v2.html`, os originais do fundador (10 e 13 MB),
  já listados no `CHANGELOG.md` desde 5/10.

## 8. Os termos e a privacidade, do rascunho ao ar (mesmo dia, à tarde)

Depois do registro acima, o item dos termos foi retomado e terminou no ar.

- **Rascunho (PR 25).** O fundador estreitou o pedido: "termos de serviço e privacidade, me monte estes dois
  arquivos". Os dois saíram em inglês, em `docs/legal/`, com "the crumb", uma linha do Baked, no topo de cada seção.
  A piada fica no resumo e nunca dentro da regra, para o humor não mudar o que a regra diz. Os 13 documentos dos
  concorrentes entraram no Git junto.
- **Enxuto (PR 26).** "os termos de serviço ficaram muito longos, podemos e conseguimos reduzir?" De 2.962 para
  1.520 palavras, com as mesmas 13 seções e as mesmas regras. O que saiu foi detalhe repetido. Cortar mais tiraria
  regra, e eu disse isso a ele.
- **No ar (PR 28).** "revisado e pode inserir no site, no rodapé", com dois desenhos novos do Baked, um para cada
  página. Ele aprovou sem preencher as lacunas (empresa, países, teto, lei, foro, email). **Decisão minha, contada a
  ele:** colchete não vai ao ar, então cada lacuna virou uma frase verdadeira de "será definido antes de dinheiro
  real". A tabela está em `docs/legal/NOTAS-DA-REVISAO.md`, seção 2.
- **Uma fonte só.** As páginas são geradas dos arquivos de `docs/legal/` por `services/landing/scripts/build-legal.mjs`,
  e um teste falha se um título ou uma frase do Baked divergir entre texto e página. Foi conferido de propósito,
  mudando uma frase só no arquivo: o teste acusou.
- **O que deu errado.** Para desfazer essa mudança de teste usei `git checkout` no arquivo, o que o voltou à versão
  comitada e apagou também a troca das lacunas feita minutos antes. Eu tinha guardado uma cópia antes do teste e a
  restaurei; nada se perdeu. Para não repetir: desfazer uma mudança de teste pela cópia, nunca pelo `git checkout`
  de um arquivo com edição não comitada.
- **Conferido no ar,** depois da troca no servidor (commit `e1a54d8`): `/terms`, `/privacy`, as duas imagens, o
  estilo novo e o `/pitch` respondem 200; o rodapé da página inicial tem "Terms"; o formulário de sair da lista
  funciona (testado localmente, contra um arquivo temporário, e não contra a lista real).

## 9. O docs começou: sete páginas, fora do ar (mesmo dia, à noite)

- **O índice foi apresentado** ao fundador, com onze seções e três formas de montar o site (framework de
  documentação, gerador próprio como o dos termos, serviço pronto). A recomendação foi o framework, pela busca e pelo
  menu. Ele respondeu "continue de onde parou", sem escolher a ferramenta.
- **Leitura minha:** escrever o texto não depende da ferramenta, porque Markdown com `title` e `description` no topo
  serve às três. Escrevi as sete páginas das seções 1 a 3 (`docs/wiki/`), que são as marcadas "pronta" e as que
  explicam o produto. Não criei o endereço, não escolhi a ferramenta e não publiquei nada.
- **Por que as seções 4, 5 e 9 ficaram de fora:** abrir mercado, taxas e equipe dependem das decisões 1, 2, 9, 12, 15
  e 16 do plano. As páginas escritas apontam para os termos, §7, onde precisam falar do custo de abrir e da parte de
  quem abriu, para a regra não existir em dois lugares.
- **Tom:** o pedido era "estilo um whitepaper, porém soft" e "a parte séria da nossa empresa". Cada página abre com
  "In one bite", no tom do Baked, e o corpo é sério. O que nenhuma página diz: projeções, caixa, tokens e "bet".
- **Contas conferidas** contra o BP v0.0.3, Parte 1, §3.2 a §3.6: o exemplo 600/400 (950, 1,583), a tabela de retorno
  só com a taxa, o 300/700 que vira 1,63, o 5.000 a 5.000 que cai para 1,30, o pote de um lado só (0, 2, 3) e o
  oportunista do último minuto (409 de lucro, 1,08 para quem estava antes).
- **Notas da revisão:** saiu da lista de pendências a troca da página `/privacy`, feita na seção 8.

## 10. O docs no ar (mesmo dia, à noite)

- **O pedido:** "pode liberar o endereço e colocar online, pois vou ler online. os terms e privacy ficaram excelentes."
  É a liberação por escrito para o endereço novo no Cloudflare e para publicar.
- **A ferramenta, decisão minha:** ele liberou sem escolher entre as três formas. Eu tinha recomendado um framework de
  documentação, mas montei no próprio serviço do site, com um gerador como o dos termos. Motivos: nenhuma dependência
  nova num serviço que hoje não tem nenhuma; nada a construir no servidor dividido; e o texto é Markdown simples, que
  um framework lê depois sem reescrever. O que fica faltando em relação a um framework é a busca, que com sete páginas
  não faz falta. Contei isso a ele.
- **Fora dos buscadores:** o servidor manda `noindex` em todo o `docs.`. Ele quer ler; abrir para buscadores é
  publicidade indexada, que traz a dúvida da MP 1.394, art. 16, e fica para depois da aprovação dele.
- **Como o servidor separa:** pelo nome pedido. No `docs.` ele serve `docs-site/` e empresta do site só imagens,
  fontes, estilo e o script do tema. A lista de espera não responde lá, e as páginas do site não aparecem lá, nem as
  do docs no site. Os testes conferem os dois lados.
- **O conversor de Markdown** saiu do gerador dos termos para um arquivo comum aos dois. As páginas dos termos e da
  privacidade saíram idênticas, byte a byte, conferido com `cmp`.
- **Conferido antes de publicar:** 33 testes do site; uma mudança de título feita só no texto fez o teste falhar (e
  foi desfeita pela cópia, não pelo `git checkout`, como aprendido na seção 8); um navegador sem tela abriu as páginas
  em tela larga e de celular, nos dois temas, sem estouro de largura, imagem quebrada nem erro.
