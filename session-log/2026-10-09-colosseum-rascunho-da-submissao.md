# 2026-10-09 — Colosseum: a submissão volta ao plano, e o rascunho das respostas

## O que era verdade antes

- Em 8/10/2026 o fundador respondeu "16 nao se preocupe com deadline", e o BP v0.0.4 tirou do plano o hackathon de
  12/10/2026 e a demonstração prevista (Parte 4, seção 3.2).
- O `PITCH.md` dizia que, no hackathon, a equipe se apresentava como uma pessoa.
- Não havia nenhum arquivo sobre a submissão.

## O que o Lucas pediu

Em 9/10/2026, à noite: "Depois, vamos preencher um formulário referente à submissão do nosso projeto no colosseum, e
para isso vamos abrir um novo branch específico."

## O que foi feito, e por quê

- **A branch `docs/colosseum-submissao` sai da `main`,** e não da branch do site. A submissão não depende das páginas
  `/3` a `/5`, e assim cada uma é mesclada quando ele quiser. O custo: o rascunho cita dois arquivos que só existem na
  branch do site (o roteiro do v4 e o `BRAND.md`), e diz isso onde cita.
- **O rascunho é `docs/business/colosseum-submissao.md`.** As respostas estão em inglês, porque o regulamento exige
  (§12(a)); as explicações, em português.
- **Os campos vêm das perguntas frequentes do Colosseum, e não do formulário.** O portal fica atrás do login, e a
  extensão do navegador não conectou. O rascunho diz isso no topo: nomes de campos e limites de caracteres podem ser
  outros.
- **Nada foi inventado sobre a equipe.** Os arquivos têm só nome e cargo dos três. A experiência de cada um e a
  localização ficaram em branco, a preencher por eles.
- **A descrição longa usa "campaign"; a curta, "prediction markets".** A curta é a frase que ele escreveu para o
  DemoDay e pôs na capa do deck. A longa parte da frase de elevador aprovada em 7/10 e troca "sponsor a market" por
  "opens a campaign", com as regras do BP v0.0.4. É proposta; a troca de volta não muda regra.
- **A validação de demanda diz que não há.** O plano diz isso sem rodeio (Parte 2, seção 2.5), e os jurados que
  conhecem o caso do Trepa vão perguntar. A resposta lista o que existe (lista de espera, duas rodadas de crítica de
  fora) e os três testes planejados.
- **O trabalho anterior é declarado por inteiro.** O commit mais antigo do histórico é de 1/10/2026, dentro da janela
  do evento (14/9 a 12/10). Declaram-se o `pred-provable`, de onde vieram quatro leitores, e o AI Dev OS, que é
  anterior e não tem código de produto. Sugeri declarar também o uso de assistentes de IA; não conferi o regulamento
  sobre isso.

## Achados que mudam a submissão

- **O repositório é privado.** O Colosseum aceita, com acesso de leitura a `hackathon@colosseum.com`. Abrir vale mais
  no critério de código aberto, mas publica o plano de negócio, as notas jurídicas e os registros com nomes, e não se
  desfaz. A recomendação do rascunho é dar o acesso.
- **O programa novo não está na devnet.** Abertura, entrada e resolução estão na `main`; o pagamento está no pedido
  41 e o ciclo na devnet no pedido 43, "preparado, não publicado". O vídeo de demonstração depende disso.
- **O histórico tem quatro identidades de autor,** e a submissão precisa dizer de quem é cada uma.

## Em aberto

- Os campos reais do portal.
- A experiência e a localização da equipe, e o de acordo do Bernardo e do Ronaldo para aparecerem com nome.
- Acesso ou abertura do repositório.
- Alinhar o deck e o roteiro ao BP v0.0.4 antes de gravar os vídeos.
- A devnet até 12/10, ou a demonstração só com os testes e o fork.
- A linha do BP v0.0.4 que diz que o hackathon saiu do plano, quando a submissão for confirmada.

## 10/10/2026, de madrugada: a segunda versão das respostas da primeira aba

**O que o Lucas pediu.** "você poderia me dar respostas melhores, mais longas e bem pensadas, e me dar as respostas na
mesma ordem que eu te entreguei as perguntas?"

**O que mudou no chão antes de escrever.** Ao reler o estado do código, a main tinha andado: na noite de 9 para
10/10 o Ronaldo mesclou os pedidos 41, 44, 45 e 43 e publicou o programa na devnet, num id novo (5Rx8…n8o). A
primeira versão das respostas, de horas antes, dizia que o programa abria, recebia entradas e resolvia, com 517
testes, e que estava "Devnet today" sem estar. Conferi a conta na rede, só leitura: existe, é executável, 54
transações.

**As escolhas da segunda versão.**

- **Usar quase todo o limite de cada campo,** contando cada quebra de linha como dois caracteres, para não estourar
  se o portal contar assim.
- **Dizer o que rodou, com o endereço,** em vez de adjetivo. Um revisor automático confere um endereço; não confere
  "robusto".
- **O estado de cada tipo de campanha vai no campo de tecnologias,** o único sem limite: preço e queima rodam na
  devnet; Meteora e pool de staking só têm teste com contas da rede principal; stake de validador está desligado.
  Escrever "cinco tipos funcionando" seria desmentido pelo próprio repositório.
- **A janela da equipe entra na última resposta.** O texto diz "no vote, no judge"; a equipe pode anular e devolver,
  nunca inverter. É a frase que o BP propõe ("no human picks the winner") dita antes que alguém a ache no código.
- **Tirei "quem acerta nunca recebe menos do que pôs".** No pote de um lado só, a partir da segunda carteira há 1% de
  taxa; o roteiro do pitch já evita essa frase pelo mesmo motivo.
- **Os testes viraram "mais de 740"** (436 em Rust e 307 em TypeScript, do registro da Sprint 04). Não rodei os testes.
- **As identidades do Git foram preenchidas como leitura minha,** marcada para o Lucas confirmar: o usuário do Git e
  a conta que publica nesta máquina, e o README, que atribui o pred-provable ao Ronaldo.

**Achado novo.** O README da raiz ainda descreve o pred-provable, com Anchor e USDC. É a primeira página que um jurado
abre, e contradiz o formulário. Entrou na lista do que falta.

**Em aberto.** As abas "Media and code" e "Team"; a categoria (a lista de opções não veio); país, Telegram, a marca
da aceleradora; a confirmação das identidades do Git e de que ninguém de fora trabalhou no projeto.
