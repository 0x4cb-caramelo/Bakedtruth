# Wiki do docs.brot.markets

O texto da documentação pública do Brot Markets, que vai morar em `docs.brot.markets`. Pedido do fundador, 8/10/2026:
"uma página do tipo doc.brot.markets para colocar a documentação estilo wiki da parte séria da nossa empresa, para
justamente mostrarmos que temos a coisa dominada. Ali é que vamos trazer bastante coisa do que somos, estilo um
whitepaper, porém soft, explicando a nossa plataforma, seus funcionamentos e etc".

**No ar em `docs.brot.markets` desde 8/10/2026,** fora dos buscadores, depois de o fundador escrever "pode liberar o
endereço e colocar online, pois vou ler online". As páginas são geradas destes arquivos por
`services/landing/scripts/build-docs.mjs`, que também guarda o menu, e servidas pelo mesmo serviço do site. Um teste
(`services/landing/tests/docs.test.mjs`) falha se um título, a linha "In one bite" ou a descrição divergirem entre
o arquivo e a página. Este README não vai ao ar.

**Para mudar uma página:** edite o arquivo aqui, rode o script e publique as duas coisas juntas. **Página nova:**
crie o arquivo com `title` e `description` no topo e uma linha "In one bite", e ponha o caminho no menu do script.

## Como as páginas são escritas

- **Em inglês**, como o site e os termos.
- **Cada número sai do BP v0.0.3 ou dos termos que estão no ar.** Onde os dois discordam, vale o que está no ar, e a
  divergência entra na lista abaixo.
- **Cada página abre com "In one bite"**, uma linha que resume a página, no tom do Baked dos termos ("the crumb").
  O humor fica nessa linha e nos fechos; o corpo é sério.
- **As palavras do pitch:** "take a side" e "entry", nunca "bet"; "no human picks the winner", e não "no human in the
  loop", porque a equipe confirma, anula e pausa.
- **Fica de fora:** projeções, custos, ponto de equilíbrio, tokens e qualquer número de caixa. O docs é público e
  indexado.
- **Regra repetida não se reescreve.** O custo de abrir mercado e a parte de quem abriu estão nos termos, §7; as
  páginas apontam para lá até a decisão sair.

## O índice

Estado: **escrita** (página neste diretório), **pronta para escrever** (o conteúdo existe no plano), **espera
decisão** ou **espera código**.

| Seção | Página | Estado |
|---|---|---|
| 1. Start here | [What Brot Markets is](start-here/what-is-brot.md) | escrita |
| | [Why the chain decides](start-here/why-the-chain-decides.md) | escrita |
| | [Where we are today](start-here/where-we-are.md) | escrita; inclui o roteiro (seção 8) |
| 2. How it works | [The pot](how-it-works/the-pot.md) | escrita |
| | [Life of a market](how-it-works/life-of-a-market.md) | escrita |
| | [How a market is decided](how-it-works/how-a-market-is-decided.md) | escrita |
| 3. Market types | [Market types](market-types.md) | escrita |
| 4. For projects | Open a market; launch partners | espera decisão: semente de 500 ou 0,02 SOL, 1% do volume ou do pote (decisões 1, 2, 15 e 16) |
| 5. Fees | Fees and referrals | espera decisão: o "day one" da indicação (decisão 9) |
| 6. Trust and safety | Who controls what; the three criteria; why no flash-loanable metrics | pronta para escrever |
| | Program addresses | espera código |
| 7. For developers | Program, IDL, SDK | espera código (Sprint 05) |
| 9. The bakers | Team and Baked | espera decisão: o acordo escrito do Bernardo e do Ronaldo (decisão 12) |
| 10. Legal | Terms, privacy, risks | pronta: links para `/terms` e `/privacy` |
| 11. FAQ and glossary | | pronta para escrever, depois das seções 1 a 6 |

## O que estas páginas afirmam e o plano ainda não decidiu

Igual aos termos, que já estão no ar com as mesmas frases. Se a decisão for outra, as duas coisas mudam juntas.

1. **Duração de 3 a 90 dias.** O teto é decisão; o piso de 3 dias é proposta (decisão 15).
2. **Sem texto livre;** o site monta a pergunta (decisão 13, proposta).
3. **Quem abre pode ter um lado, com aviso automático** (decisão 14, proposta). O texto do aviso é o dos termos.
4. **O exemplo de 600 e 400 com 950 para quem acertou** já desconta 10 de quem abriu, como nos termos e no deck v4.
   Se o 1% sair da taxa do Brot (desenho C) ou se a equipe abrir sem ficar com ele, o exemplo vira 960.
5. **"Markets where the opener may control the result carry a warning"**: a página não diz em quais tipos, porque a
   lista de contas aceitas e o teto por mercado ainda são proposta (decisões 7 e 18).

## Antes de abrir para os buscadores

Hoje o servidor manda `X-Robots-Tag: noindex, nofollow` em tudo de `docs.brot.markets`. Para abrir, tire essa linha
de `services/landing/server.mjs` e ajuste o teste.

- **A leitura e a aprovação do fundador.**
- **A Medida Provisória 1.394, art. 16,** veda publicidade de aposta de quota fixa "direcionada ao público
  brasileiro". Um site de documentação indexado é mais exposto que o deck por link. O inglês reduz a dúvida e não a
  elimina; é a mesma pergunta jurídica dos termos (BP v0.0.3, Parte 4, §6).
- **Conferir cada regra contra o programa** quando ele existir. Hoje as páginas descrevem o produto planejado, e a de
  situação ("Where we are today") diz isso.
- **Os nomes da equipe** só entram depois do acordo escrito (decisão 12).
