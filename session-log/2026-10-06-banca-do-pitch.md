# A banca do pitch: o que foi registrado e por quê

- **Data:** 6 de outubro de 2026 (a gravação é das 0h40)
- **Fase:** 5 (Chegada), fora do roteiro de sprints
- **Pedido do fundador, em duas mensagens:**
  1. Com o roteiro da fala e a transcrição da gravação: "tem multiplas pessoas e tem que tentar entender quem é quem
     falando, contexto, e separar todas as criticas e sugestões, e alinhar com o pitch e roteiro, e indicar onde
     precisa ser feito a mudança, junto de você fazer uma avaliação do que foi sugerido, me explicando e também
     sugerindo como melhorar ainda mais, e qual a sua recomendação."
  2. Depois da análise: "agora vamos anotar e documentar isso num doc próprio, bem como num outro doc a melhor
     organização do que foi a transcrição correta do evento. Depois, changelog, sessions, memories e codemap."

## O que existe agora

| Documento | O que é |
|---|---|
| `knowledge-base/pitch/2026-10-06-banca-transcricao.md` | A transcrição corrigida e organizada: a apresentação como foi falada, a sabatina slide a slide, a lista das correções feitas e, em anexo, o roteiro em português que o fundador levou |
| `docs/business/_review/banca-do-pitch-2026-10-06.md` | A análise: 42 pontos da banca numerados (B-01 a B-42), cada um com avaliação e veredito; 8 pontos da fala do fundador (F-01 a F-08); o que não adotar; a proposta de nove slides; o que não foi conferido; a recomendação |

**Nenhuma decisão do fundador foi tomada sobre o conteúdo.** O deck em `/pitch` segue o de oito slides, e o plano não
mudou. Os vereditos da análise são de quem a escreveu.

## Decisões de registro, e porquês

### 1. Dois documentos, em duas pastas

- **A transcrição é fonte**, como as notas de pesquisa: vai em `knowledge-base/`, numa pasta nova, `pitch/`. Quem
  quiser conferir uma avaliação lê lá o que foi dito, com horário.
- **A análise é revisão crítica**, como as ondas de revisão do plano: vai em `docs/business/_review/`.
- **Rejeitado:** um arquivo só. Misturar o que foi dito com o que se acha disso é o que a regra das camadas de
  documentação existe para evitar.
- **Rejeitado:** pôr a análise dentro do `PITCH.md`. Ele é a apresentação derivada do plano; isto é uma crítica de
  fora a um deck, e nada dela foi aprovado.

### 2. Corrigir a transcrição, e mostrar o que foi corrigido

A transcrição automática errou quase todos os nomes próprios ("Cauchy" por Kalshi, "Pampfan" por pump.fun, "SDC" por
USDC) e vários termos ("tan-tan-som" por TAM, SAM e SOM). A correção usou o roteiro e os slides como gabarito.

- **Escolhido:** texto corrigido, com `[?]` onde a leitura é incerta, e uma tabela no fim com cada troca e o grau
  de certeza. Assim ninguém precisa confiar na correção: dá para refazê-la.
- **Rejeitado:** guardar só o texto bruto. Ele é ilegível em trechos decisivos.
- **Rejeitado:** reescrever as falas em texto corrido. Perderia quem disse o quê, que foi o pedido.

### 3. Privacidade: falas de outras pessoas

A transcrição traz o que três avaliadores disseram. Respostas às perguntas da regra de privacidade:

1. **Que dado:** falas de pessoas identificáveis por quem esteve lá. Um apelido incerto ("Dido") e a menção ao
   sócio Ronaldo.
2. **Por quê:** a análise precisa de quem disse o quê para pesar cada sugestão.
3. **Onde:** no repositório, que é privado (conferido em 6/10/2026).
4. **Quem acessa:** quem tem acesso ao repositório.
5. **Como se controla:** pelo acesso ao repositório. Não há outro controle.
6. **Por quanto tempo:** sem prazo definido. Lacuna.
7. **Registros gerados:** nenhum além do histórico do Git.
8. **Se alguém pedir para sair:** troca-se a fala por um resumo. O histórico do Git guarda a versão antiga, e
   apagá-la de lá é trabalho à parte.
9. **Política ou consentimento:** nenhuma política muda. Não há registro de que os avaliadores souberam da gravação
   ou concordaram com ela; isso é do fundador confirmar.

O que foi feito para reduzir: os avaliadores ficam sem nome ("Voz 2", "Voz 3", "Voz 4"); as brincadeiras pessoais
não foram transcritas; o áudio não entrou no repositório; o arquivo diz que é de uso interno e que não vai a
público.

### 4. O que a análise recusa, e por quê fica registrado

Cinco sugestões da banca não foram recomendadas, todas da Voz 4, a mais experiente da sala. Registrar o porquê
importa, porque a tentação de aceitar tudo de quem sabe mais é grande:

- **Recompra e queima do token com os 30% do patrocínio:** o plano pôs a recompra em espera (P3 §4.6) e o texto do
  token diz que ninguém a promete.
- **"Custodial key":** diz que o World guarda o dinheiro, e a pesquisa diz outra coisa: a chave grava o resultado.
- **Exemplos com holders, carteiras ativas e TVL:** o programa não lê nenhum deles.
- **Tokenomics no slide de taxa** e **taxa em SOL que vira token:** juntam ou prometem o que a avaliação jurídica
  ainda não viu.

Em todos, o problema que a banca aponta é real. O que não se recomenda é a solução.

## O que deu errado

- **A frase do slide 5 que a revisão do deck escreveu também exagera.** "So being right never costs you" foi a troca
  feita nas duas revisões. Ao conferir as citações da análise contra o plano, apareceu o caso em que ela é falsa: em
  pote de um lado só, quem entra depois do primeiro paga 1% (P1 §3.4). Está registrado na análise (nota da F-01),
  com a frase que diz só a regra. O deck no ar ainda traz a frase antiga.
- **A primeira resposta ao fundador, na conversa, repetiu o exagero:** recomendou "quem acerta nunca sai no
  prejuízo" no lugar de "quem acerta sempre ganha". O documento da análise já traz a frase corrigida.

## O que não foi conferido

O caso da MicroStrategy citado pela banca; o volume do mercado de previsão da Jupiter; se o regulamento do hackathon
proíbe token; o limite de tempo do vídeo; o hackathon do Seeker; os nomes dos avaliadores. A lista está na seção 9
da análise.

## Em aberto

1. As seis decisões do fundador listadas na seção 10 da análise: a palavra "bet", o slide de equipe, o patrocínio
   em faixas ou com piso, o cartão do token, os nomes no slide 2 e o título do slide 5.
2. Montar a terceira versão do deck, como prévia, se ele aprovar a recomendação.
3. A frase "ninguém perde por acertar" na Parte 1 do plano (§3.3), para a passada de coerência.
4. Confirmar com o fundador se os avaliadores sabiam da gravação.
5. Mandar o deck ao avaliador que o pediu; conversar com a Superteam.
6. Segue aberto o pull request nº 11 (os arquivos antigos guardados no navegador), à espera da liberação do merge.
