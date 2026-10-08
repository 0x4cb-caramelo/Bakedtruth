# 2026-10-08 — Decisões sobre o BP v0.0.3: tudo em SOL, abertura por US$ 500, sem teto, Pinocchio; BP v0.0.4 e arquitetura 0.4

## Context

Depois da proposta de arquitetura 0.3, as decisões vieram em duas mensagens. A primeira, em inglês, trazia as mudanças
e as perguntas: Pinocchio ou Quasar, keeper só em SOL, sem IA, app de celular. A segunda, em português, respondia às
dezesseis perguntas que o assistente juntou numa lista. O pedido: atualizar o plano de negócio e a proposta de
arquitetura com as decisões e as considerações. Antes, o assistente deveria apontar o que merecesse atenção e não
estivesse nas mensagens.

## Decision

As palavras exatas estão em `docs/business/ideacao-perguntas-e-respostas.md`, seção "Decisões de 8 de outubro de
2026". Em resumo:

1. **Tudo em SOL**, desfazendo o USDC de 4/10.
2. **Abrir uma campanha custa US$ 500 em SOL**: 90% viram prêmio no pote e 10% ficam com o Brot. A equipe também abre;
   os parceiros abrem de graça.
3. **O 1% do criador sai do pote**, e da taxa do Brot só quando faria o vencedor receber menos do que pôs.
4. **Sem teto**, nem global nem por campanha, e **sem lista de contas aprovadas**.
5. **Vocabulário "On-Chain Campaigns"**: baker, criador, SIM/NÃO, pote; a marca fica.
6. **Construção:**
   - Pinocchio no lugar do Anchor;
   - Bun em tudo, se viável;
   - app Android com o mesmo backend;
   - sem IA;
   - sem prazo de hackathon;
   - advogado na equipe.

O que o assistente pesquisou e propôs, a pedido:

- **Pinocchio, e não Quasar.**
  - O Pinocchio é da Anza, está na versão 0.11.2 (de 9/6/2026), foi auditado pela Zellic e é a base do p-token, que
    substituiu o SPL Token.
  - O Quasar está em beta, sem auditoria e sem versão publicada; o README diz "has not been audited. APIs may change".
- **Preço para cobrar os US$ 500: Pyth, lida pelo programa.**
  - O programa não consegue ler a CoinGecko. Usá-la exigiria um servidor gravando o preço com uma chave, e essa chave
    passaria a mandar na taxa.
  - O uso comercial do plano gratuito da CoinGecko não está claro.
  - A CoinGecko fica para exibir preço e para as contas do plano: US$ 109,27 em 8/10/2026, às 15:29 UTC.
- **Bun:** viável para os serviços.
  - O Bun 1.4.2 é estável e pede glibc 2.17 ou mais nova; o Ubuntu 22.04 tem a 2.35. Falta conferir a CPU do servidor.
  - O Next.js rodando sob o Bun não tem documentação oficial do Next.js. Por isso o site roda em Bun só se passar no
    teste, com o Node 22 de reserva.
- **O 1% do criador, lido ao pé da letra, tem um salto.** Quando o pote cruza o limite, o criador cai de cerca de 1.000
  para cerca de 110, e o Brot perde a taxa inteira.
  - A leitura proposta tira do pote o que dá sem deixar ninguém abaixo do que pôs, e só a diferença sai da taxa.
  - Assim, o criador recebe o 1% inteiro e o Brot perde menos. Fica para o fundador confirmar.

## Alternatives considered

- **Quasar.** Recusado: beta, sem auditoria, com a interface mudando. Um artigo de julho de 2026 fala em pressão para
  encerrá-lo; não foi confirmado.
- **CoinGecko lida por um servidor nosso.** Recusada como fonte da cobrança, pelos motivos acima.
- **Node 22 nos serviços**, a sugestão anterior. Trocada por Bun, a pedido, depois da checagem de viabilidade.
- **Manter o teto global** como terceiro critério da rede principal. O fundador decidiu tirar, e o risco ficou escrito.

## Consequences

- **BP v0.0.4** em `docs/business/`: o índice em `BUSINESS-PLAN.md` e quatro partes. A v0.0.3 fica nas quatro
  partes `docs/business/BP-v0.0.3-parte-*.md`, que entraram na `main` pelo pull request #20; o arquivo único que o
  fundador enviou é uma cópia montada delas e ficou fora do git, como a sessão da `main` tinha decidido. A revisão de
  impacto está em `docs/business/_review/bp-impact-review-v0.0.4.md`.
- **A proposta de arquitetura passa à versão 0.4**: Pinocchio, SOL nativo, abertura com preço da Pyth, sem teto, sem
  lista, sem IA, app Android, Bun.
- **Os cenários de caixa mês a mês não foram refeitos,** porque o modelo da v0.0.3 não está no repositório. O plano
  mostra o efeito das aberturas pagas pelo volume de equilíbrio.
- **Os documentos aprovados ainda não mudaram:** resumo de produto, plano técnico, roteiro, design, deck e site no ar.
  A revisão de impacto lista o que muda em cada um.
- **A memória do assistente foi atualizada** com o vocabulário novo.

## O que deu errado no caminho

- **A resposta "opção c" ficou sem sentido.** A pergunta 9 só tinha as opções (a) e (b), e o assunto (o 1% em campanha
  anulada, em pote de um lado só e sobre o prêmio) ficou como proposta, a confirmar. Repetida a pergunta, foi
  decidida (ver "Complemento").
- **"Baker" foi registrado como escrito.** Se era "backer", basta uma troca de palavra.
- **Duas contas do brief interno estavam erradas, e os redatores das partes acharam.**
  - O limite a partir do qual compensa forçar o resultado de uma campanha sobre token sem valor não é US$ 500.
    Quem força e está no lado que ganha recebe de volta o prêmio de US$ 450, e a entrada dele nesse lado não corre
    risco. Por isso a manobra compensa com pouco mais de US$ 56 de terceiros do outro lado.
  - O mínimo de aluguel de uma carteira vazia é 650.240 lamports, medido por RPC em 8/10/2026, e não 0,00089 SOL.
- **As decisões estão registradas como do fundador.** Se quem decidiu foi outro sócio, o registro precisa do nome
  certo.

## Follow-up

- **Fundador:** as propostas P-6 a P-8 do índice do BP v0.0.4; as decisões da v0.0.3 que continuam abertas.
- **Equipe:** rever o resumo de produto, o plano técnico, a Sprint 02 e o design contra a v0.0.4; dar ao app Android e à
  tela de abertura um lugar no roteiro; corrigir o deck e o site no ar.

## Complemento, mais tarde no mesmo dia

- **P-1 decidida.** Repetida a pergunta, a resposta foi "ok para recomendacao sobre o 1% em caso de campanha anulada".
  A recomendação era um item só, com três casos, e foi registrada assim: o criador não recebe o 1% na campanha
  anulada, no pote de um lado só e sobre o prêmio da abertura. Se a intenção era só a anulada, os outros dois casos
  voltam a ser proposta.
- **P-3 decidida, e o parceiro também.** Depois de perguntar quem é a equipe (o próprio Brot abrindo campanha) e
  quem é o parceiro (um dos 20 a 30 projetos convidados a abrir uma campanha de graça em troca de divulgação), a
  resposta foi: "nao, a equipe nao paga nem fica com 1% porque nos ja cobramos taxa.nao, parceiros nao ficam com 1%".
  - A equipe não paga os US$ 500 nem fica com o 1%. Era a recomendação.
  - O parceiro também não fica com o 1%. A recomendação era o contrário, pela regra geral do criador; o motivo dela
    (dar ao parceiro mais um motivo para divulgar) sai, e o 1% fica com os vencedores.
  - Na arquitetura, toda campanha aberta por uma chave da equipe tem `creator_share_bps = 0`, e o argumento `partner`,
    que tornava o parceiro criador, sai. O vínculo da campanha com o parceiro fica em `content/partners.json`.
- **As seis perguntas que travavam o começo.** O fundador pediu, primeiro, que lhe dissessem o que precisava
  responder ("porra me fala o que eu preciso responder me explica antes"): o assistente tinha espalhado as pendências
  por várias mensagens. Reduzidas a seis, com explicação, a resposta foi "sim para todos":
  - P-2: o 1% no caso extremo sai do pote até onde der, e só a diferença da taxa do Brot;
  - P-4: os US$ 450 voltam a quem abriu na anulada e no pote de um lado só; os US$ 50 seguem a causa;
  - P-5: entrada mínima de 0,01 SOL;
  - D-f: o preço para cobrar a abertura vem da Pyth, lida pelo programa; a CoinGecko só mostra o preço no site;
  - a proposta de arquitetura 0.4 aprovada como está (a alternativa era um resumo em português antes);
  - o trabalho salvo no GitHub.
  Em seguida veio o pedido do plano de implementação, todo em inglês.

## Fontes

- Preço do SOL: API pública da CoinGecko, `simple/price`, 8/10/2026, 15:29 UTC.
- Pinocchio: crates.io (versão 0.11.2); o guia "Pinocchio vs Quasar" da Chainstack; o blog da Anza sobre o p-token.
- Quasar: o repositório `blueshift-gg/quasar`.
- Bun: o blog da versão 1.4 e a documentação de instalação; o CVE-2026-24910; o relato de falha do Next.js 16.3 com Bun
  na comunidade da Vercel.
- CoinGecko: a página de planos da API.
