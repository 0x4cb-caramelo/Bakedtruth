# Briefing de ideação — contexto para nome e mascote

**Para quem lê:** este documento explica um projeto em construção para que você possa propor um **nome** e desenhar um **mascote**. Ele foi escrito a partir do código do projeto, não de um plano de negócio. Onde algo é interpretação e não fato do código, está marcado como tal.

**Data:** 2 de outubro de 2026. **Estágio:** MVP de hackathon, rodando na rede de testes (devnet) da Solana, sem auditoria.

---

## 1. O projeto em uma frase

Um mercado de previsão em que a resposta não é decidida por ninguém: ela é **lida diretamente da blockchain**.

O lema que já está no produto é: *"Resolution is a read, not a judgement"* (a resolução é uma leitura, não um julgamento).

## 2. O problema que ele ataca

Mercados de previsão como Polymarket e Kalshi fazem perguntas do tipo "o candidato X vai ganhar?" e as pessoas compram SIM ou NÃO. No fim, alguém precisa declarar o resultado: um oráculo, um comitê, uma votação. Esse é o ponto fraco do modelo. Quem declara pode errar, demorar, ser contestado ou ser corrompido, e por isso existem janelas de disputa que travam o dinheiro por dias.

Este projeto só aceita perguntas cuja resposta já está escrita, de forma pública e verificável, numa conta da própria blockchain. Não há oráculo, comitê, indexador nem janela de disputa. A mesma transação que enxerga a meta cumprida encerra o mercado e libera o pagamento.

## 3. Como funciona, em linguagem simples

Há dois papéis principais.

- **O patrocinador (sponsor)** quer que uma meta on-chain aconteça. Ele deposita um orçamento em USDC (dólar digital) e põe à venda tokens "SIM" por um preço abaixo do que eles pagam se a meta for cumprida. A diferença é a recompensa que ele oferece.
- **O executor (doer)** compra o SIM barato e depois **vai lá e faz a meta acontecer**. Quando a meta se cumpre, cada SIM vale 1 USDC cheio.

Exemplo: o patrocinador vende SIM a 0,60 USDC. Quem compra e cumpre a meta recebe 1,00 USDC por token. Os 0,40 de diferença saem do orçamento do patrocinador. Se a meta não for cumprida até o prazo, o patrocinador recebe tudo de volta, inclusive o que os compradores pagaram.

Esse é o ponto mais diferente do projeto, e vale destacar: em mercados de previsão comuns, alguém conseguir mexer no resultado é fraude. Aqui, **mexer no resultado é o produto**. O mercado funciona como uma recompensa pública por uma meta mensurável. Por isso o projeto se descreve como "KPI markets" (mercados de indicadores): aposta-se que um número vai chegar a um alvo, e quem aposta tem incentivo para levá-lo até lá.

Além dos dois papéis, qualquer pessoa pode especular: depositar USDC, receber um par SIM + NÃO, ficar com o lado em que acredita e vender o outro.

## 4. O que pode ser perguntado

Só entram metas que **não podem ser falsificadas com dinheiro emprestado por alguns segundos** e que, uma vez cumpridas, **não voltam atrás**. Hoje são seis tipos, agrupados em cinco categorias no app:

| Categoria | Pergunta típica | Por que não dá para fraudar |
|---|---|---|
| **Burn** (queima) | "O fornecimento do token X vai cair para N?" | Ninguém mais pode emitir o token, então a quantidade só diminui |
| **Renounce** (renúncia) | "O token X vai renunciar ao poder de emitir (ou de congelar)?" | Uma autoridade revogada nunca pode ser reativada |
| **Lock** (trava) | "N tokens X vão ser travados para sempre?" | Vão para um endereço do qual ninguém tem a chave |
| **Immutable** (imutável) | "O programa X vai se tornar imutável?" | Revogar o direito de atualizar um programa é um caminho sem volta |
| **Stake** | "O validador X vai ter N SOL em stake na época E?" | O stake é fixo por época e leva uma época para ativar |

A lista é fechada de propósito. Cada tipo sabe exatamente qual conta ler e como conferir se ela é legítima.

## 5. As garantias que o produto promete

Estas três frases já aparecem na tela inicial, como os princípios do produto:

1. **Resolution is a read.** Cada mercado lê uma única conta on-chain. Sem oráculo, sem comitê, sem janela de disputa.
2. **Backed 1:1 in USDC.** Cada token SIM tem um USDC guardado no cofre do mercado. Quem ganha resgata 1 para 1, a qualquer momento depois.
3. **Guarded trading.** A negociação para no instante em que a meta é cumprida, para que ninguém compre um vencedor já conhecido por um preço velho.

Outras garantias que estão no código:

- **Qualquer pessoa pode resolver o mercado.** Não é preciso permissão; basta apertar o botão quando a meta estiver cumprida ou o prazo vencido.
- **O patrocinador não pode fugir.** Depois da primeira venda, o orçamento fica travado até o prazo ou a resolução, e ele não consegue interromper a venda.
- **A prova está na tela.** Cada mercado tem um cartão "On-chain proof" que mostra o valor atual, o alvo, uma barra de progresso e o endereço da conta que está sendo lida, atualizado a cada poucos segundos.

## 6. Quem usa (interpretação, não está escrito no código)

- **Patrocinadores:** equipes de tokens e protocolos, comunidades e DAOs que querem provar um compromisso ou pagar para que ele aconteça. Por exemplo, um projeto que quer mostrar que vai queimar tokens, renunciar ao poder de emitir mais ou tornar seu código imutável.
- **Executores:** quem tem o poder ou a capacidade de cumprir a meta, e quer ser pago por isso com valor conhecido de antemão.
- **Especuladores e formadores de mercado:** quem negocia a probabilidade de a meta ser cumprida.
- **Observadores:** investidores que usam o preço do SIM como sinal de quão crível é a promessa de um projeto.

## 7. Conceitos centrais (matéria-prima para nome e mascote)

Estas são as ideias que sustentam o produto. As sete primeiras vêm direto do código e dos textos do app; as metáforas no fim são sugestões minhas.

- **Leitura, não julgamento.** Não existe juiz. Existe um olho que lê o que está escrito. O ícone usado hoje para "prova" no app é um olho que escaneia.
- **Prova.** A palavra "provable" (comprovável) é o nome de trabalho atual. A verdade aqui é conferida, não declarada.
- **Irreversibilidade.** Tudo o que o produto mede é caminho sem volta: queimar, renunciar, travar, tornar imutável. O que está feito, está feito.
- **Fogo e cinza.** A primeira categoria do app é a queima de tokens. Os mercados de demonstração usam tokens chamados Ember (brasa), Ashfall (cinzas), Frost (gelo), Keystone (pedra-chave) e Vaultline (cofre).
- **Recompensa por fazer.** Não é só apostar; é ser pago para fazer acontecer.
- **Lastro e cofre.** Cada SIM tem 1 USDC guardado atrás dele.
- **Instantâneo e definitivo.** Meta cumprida e pagamento liberado na mesma transação.

Sugestões de território metafórico (interpretação): o forno e o que já foi assado e não volta a ser massa; a balança ou a régua que mede sem opinar; o carimbo ou o selo; o notário; a testemunha que só relata o que viu; o olho; a fênix e a brasa.

## 8. Nomes de trabalho atuais

- **`pred-provable`**: nome técnico do repositório original e do programa.
- **"Provable"**: nome exibido no app hoje. Título da aba: "Provable · KPI markets on Solana".
- **"Bakedtruth"**: nome do repositório onde o projeto está sendo continuado. Lido como "verdade assada", conversa bem com a ideia de algo irreversível e já selado, mas ainda não é um nome decidido.

Nenhum deles é definitivo. O nome final é justamente o que se quer explorar.

## 9. Identidade visual que já existe

O app foi redesenhado para seguir as convenções de Kalshi, Polymarket e Trueo; um visual de "dashboard genérico" foi rejeitado.

- **Tema escuro**, com superfícies em tons de ardósia (`#12151b` de fundo, `#1a1e26` nos cartões).
- **Azul como cor de marca** (`#4f7dff`), usado só na moldura da interface.
- **Verde (`#22c98c`) e vermelho (`#f0506e`) reservados para SIM e NÃO.** Âmbar (`#f2b33d`) para avisos e ações pendentes.
- **Tipografia:** Barlow Condensed em títulos (condensada, com cara de placar esportivo), Inter no texto, Geist Mono para números e endereços.
- **Tom dos textos:** seco, direto, factual, em inglês. Frases curtas, sem exageros. Exemplo: "Resolves YES the moment the goal is met on-chain, by anyone, in the same transaction."

Um mascote não precisa copiar essa paleta, mas precisa conviver com ela, inclusive em tamanho pequeno, sobre fundo escuro.

## 10. Restrições e cuidados

- **Idioma do produto:** inglês. O público é global e nativo de cripto. A equipe é brasileira.
- **O nome precisa funcionar em inglês**, ser fácil de falar e de escrever, e idealmente ter domínio e identificador livres.
- **Não deve soar como cassino ou aposta esportiva.** O diferencial é rigor e prova, não sorte.
- **Não deve prometer mais do que o produto faz.** Ele não prevê eleições nem esportes; só metas on-chain verificáveis.
- **O mascote deve transmitir confiança e imparcialidade**, com alguma personalidade. Quem lê e atesta, não quem opina.
- É um produto financeiro ainda em teste, sem auditoria. O material de marca não deve sugerir segurança garantida.

## 11. O que se pede

1. **Nome:** uma lista de candidatos, cada um com a lógica por trás, como soa em inglês e em português, e os riscos (significados indesejados, nomes parecidos já usados em cripto).
2. **Mascote:** dois ou três conceitos distintos, cada um com o personagem, a ligação com os conceitos da seção 7, a personalidade e como ele apareceria no produto (logo, estados de SIM e NÃO, meta cumprida, telas vazias, avisos).
3. **Coerência entre os dois:** nome e mascote devem contar a mesma história.

---

## Apêndice — de onde veio cada informação

Tudo o que não está marcado como interpretação foi tirado do repositório `0xcf07/pred-provable`, no estado de 2 de outubro de 2026 (commit `638752c`): o `README.md` (economia, ciclo de vida e limites), o `CLAUDE.md` (arquitetura e decisões de produto), os textos das telas em `app/components/` e `app/lib/` (princípios, categorias, redação das perguntas, cartão de prova), as cores em `app/app/globals.css` e os mercados de demonstração em `scripts/devnet-seed.ts`.

A seção 6 (quem usa) e o fim da seção 7 (território metafórico) são leitura do autor deste briefing e devem ser tratadas como hipóteses.
