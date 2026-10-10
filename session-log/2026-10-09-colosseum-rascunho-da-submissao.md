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
