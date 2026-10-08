# Notas para a revisão dos termos e da privacidade

**No ar desde 8/10/2026,** em `brot.markets/terms` e `brot.markets/privacy`, depois de o fundador escrever "revisado e
pode inserir no site, no rodapé". As páginas são geradas destes dois arquivos; um teste do site
(`services/landing/tests/pages.test.mjs`) falha se um título ou uma frase do Baked divergir entre o arquivo e a
página. Este arquivo de notas não vai ao ar.

**Pedido do fundador, 8/10/2026:** "crie um nosso, com o que você julgar ser um contrato bom pra gente, porém
minimalista, e sem juridiquês, direto ao ponto, e inclusive trazendo um pouco de brincadeira do nosso tom do
pãozinho, as nossas piadas, onde puder. Vamos transformar até isso numa experiência." E, na rodada seguinte: "termos
de serviço e privacidade, me monte estes dois arquivos".

Não é parecer jurídico. É um rascunho para um advogado revisar.

## 1. Como os textos foram montados

- **Em inglês,** como o resto do site. O idioma do produto (L-01) segue aberto; se for português, os dois são
  traduzidos depois da revisão, e não antes.
- **A experiência:** cada seção abre com "the crumb", uma linha do Baked que resume a regra. A piada fica na linha
  de resumo e nos títulos, nunca dentro da regra, para o humor não mudar o que a regra diz. Os dois terminam com um
  fecho do Baked.
- **Fonte das regras:** o BP v0.0.3 (Parte 1, seções 3 e 4; Parte 4, seções 4.1, 4.2 e 6) e o deck v4 que está no
  ar. Onde os dois discordam, os termos seguem o v4, que é a palavra mais recente do fundador, e marcam
  **[TO CONFIRM]**.
- **Fonte dos fatos de privacidade:** a página `/privacy` que está no ar e o plano técnico, seções 8 e 8.1. A
  política não promete nada que o site não faça hoje, e o que é do app futuro está escrito como futuro.
- **Os concorrentes como contraste:** os 13 documentos baixados estão em `knowledge-base/legal/concorrentes/`. O
  World (`world/terms-of-service.md`) é o mais próximo de nós: protocolo na Solana, só carteira, mercados abertos
  por terceiros.

## 2. As lacunas, e o que foi ao ar no lugar delas

O fundador aprovou sem preencher as lacunas. Colchete não vai ao ar, então cada uma virou uma frase verdadeira de
"ainda não definido". Trocar qualquer uma é editar o arquivo e regenerar a página.

| Lacuna | O que diz agora | Onde |
|---|---|---|
| Empresa | "A company is being set up; when it exists, these terms will name it" | Termos §1; Privacidade §1 |
| Países bloqueados | "While everything runs on devnet with test tokens, we block no country; the list will be published here before any real money" | Termos §2 |
| Detalhes da parte de quem abre | "The fine print of the opener's share, and whether the opening fee comes back when we caused an annulment, will be written here before the first market opens" | Termos §7 |
| Teto de responsabilidade | "capped at an amount we'll state here before any real money is in play" | Termos §11 |
| Lei e foro | "will be set when the company exists, before any real money" | Termos §13 |
| Email de contato | Saiu; o contato é só o X | Termos §13; Privacidade §1 |

O nome dos três sócios está nas duas páginas, que são públicas e indexáveis, diferente do deck, que é só por link. O
acordo escrito do Bernardo e do Ronaldo sobre nome continua sem registro.

## 3. Regras que os termos afirmam e o plano ainda não decidiu

Cada uma está marcada no texto. Se a decisão for outra, o texto muda junto.

1. **Semente de 500 USDC para abrir mercado (90% prêmio, 10% taxa).** É o v4. O BP v0.0.3 ainda diz 0,02 SOL
   (decisões 2 e 15). Os termos não falam em SOL.
2. **"1% of the market's volume" para quem abriu.** É o v4. O plano diz 1% do pote e propõe o desenho B, com teto
   para quem acerta nunca receber menos do que pôs (Parte 1, §3.4). Os termos tratam volume como a soma das
   entradas, sem o prêmio da semente.
3. **Semente em pote de um lado só ou mercado anulado:** os termos devolvem o prêmio a quem abriu, sem o 1%, como a
   regra do patrocínio. A devolução dos 10% de taxa em anulação por falha nossa ficou em aberto.
4. **A equipe abre mercados, e fica ou não com o 1%** (decisão 6).
5. **Quem pode empurrar o resultado:** os termos permitem abrir e financiar mercado sobre o próprio projeto, com o
   aviso automático "The person who opened this market may control the result and may have picked a side", e
   proíbem esconder isso. É a proposta do plano (Parte 1, §4.2). É também o ponto em que nos afastamos da
   Polymarket, que proíbe por escrito negociar quem pode influenciar o resultado. A diferença é o produto: aqui o
   projeto pôr a própria promessa em jogo é o que se vende.
6. **Duração de 3 a 90 dias:** o piso de 3 dias é proposta (decisão 15).
7. **Disputa em duas etapas e janela de 6 horas:** decididas. Os termos as descrevem sem dizer "No human in the
   loop", porque a janela é uma pessoa no caminho; dizem "Nobody votes" e que ninguém pode inverter um resultado.

## 4. O que os textos não resolvem

- **O Brasil.** A Medida Provisória 1.394, de 25/9/2026, proíbe oferecer aposta de quota fixa no país "inclusive
  quando realizadas por agente sediado no exterior", e veda publicidade "direcionada ao público brasileiro" (BP
  v0.0.3, Parte 4, §6.1). A decisão do fundador é não bloquear país por enquanto. Uma frase como "é seu dever saber
  se é legal onde você mora" não protege os sócios, que moram no Brasil. **Fato novo desta pesquisa:** a página de
  restrições da Polymarket, de 14/8/2026, põe o Brasil entre os 39 países totalmente bloqueados
  (`polymarket/geographic-restrictions.md`). O plano dizia "só fechar posição"; não é mais.
- **"Não somos custodiantes".** O World escreve que a fundação não guarda nem controla dinheiro de ninguém. Nós não
  podemos escrever isso com a mesma folga: a equipe controla a atualização do programa e pode anular e pausar. Os
  termos mostram esses poderes numa tabela (§9) em vez de negá-los. A pergunta 3 da lista jurídica do plano
  (Parte 4, §6.2) continua aberta.
- **"Aposta".** Os termos não usam a palavra, seguindo o pitch, mas dizem com todas as letras que se pode perder tudo.
  A Nota Técnica da Fazenda diz que o enquadramento "não decorre da nomenclatura".
- **Os textos descrevem o produto planejado, não o construído.** O programa novo ainda não tem instrução. Antes de
  publicar, cada regra dos termos precisa ser conferida contra o programa (taxa, teto, pausa, janela, devolução).
- **A política diz que o Cloudflare tenta injetar estatísticas e o site bloqueia** (visto em 5/10/2026). Se o
  recurso for desligado na zona, a frase sai.

## 5. Onde fomos mais curtos que os concorrentes, de propósito

- **Sem renúncia a ação coletiva e sem arbitragem obrigatória** no rascunho: o foro fica em branco para o revisor.
- **Sem "a nosso exclusivo critério"** para mudar as regras de um mercado aberto. Os termos prometem o contrário: o
  mercado aberto mantém as regras com que abriu (§12).
- **Privacidade sem a lista de tudo que se pode coletar.** O World lista aparelho, localização, cookies de anúncio e
  Google Analytics. A nossa diz o que coletamos e o que não coletamos, item por item, e promete mudar a página antes
  de coletar algo novo.

## 6. O que fica para depois

- **O resumo comparativo dos concorrentes** (`knowledge-base/legal/concorrentes/README.md`), pedido junto com os
  termos: não foi escrito. Os documentos estão lá, cada um com fonte e data.
- **A lista dos documentos de que o site precisa.** Os termos já absorvem três que os concorrentes mantêm em
  separado: aviso de risco (§10), regras de mercado (§4 a §7) e uso aceitável (§8). Ficam faltando, para a rede
  principal: a lista pública de países bloqueados, uma página de integridade de mercado com exemplos (como a da
  Polymarket) e o aviso de risco na tela antes da primeira entrada.
