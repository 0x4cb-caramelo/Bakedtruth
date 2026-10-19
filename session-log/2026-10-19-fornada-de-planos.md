# 17 a 19/10/2026: a fornada de planos

Sessão longa com o Lucas, só de planejamento e pesquisa, depois da Sprint 18 e antes do lançamento de 17/11/2026. Nada
mudou no programa, no site ou no servidor. Os planos foram escritos como documentos do Claude (privados) e estão
resumidos em [`docs/business/planejamento-2026-10/`](../docs/business/planejamento-2026-10/README.md).

## O que foi pedido, na ordem

1. **17/10.** O plano de remuneração de criadores, BDs, bakers e do Brot: tiers de abertura, o programa de primeiros
   parceiros (Levain), projeções de seis meses e uma projeção de escala. Saíram a v1 e, com as respostas dele, a v2
   (comissão do BD por faixa de volume, indicação de BDs, fixo por meta, pontos no lugar da indicação de bakers).
2. **17/10.** O programa de lançamento: Discord, convites, as reuniões de 30/10, beta fechado e lançamento em 17/11,
   com o Levain de 120 dias.
3. **18/10.** A personalidade do mascote (do Kogepan, rabugento, à malandragem brasileira e à cultura degen).
4. **18/10.** O plano de captação v1: a /welcome com o mascote, a máquina de e-mails, as listas de investidores, o
   whitepaper e a rodada. O Lucas rejeitou as ressalvas jurídicas e o envio só depois do lançamento.
5. **19/10.** O plano de captação v2, com disparos a partir de 21/10, rastreio completo e automação no n8n; depois,
   21 comentários dele no documento, a planilha de valuation e a aba do plano técnico (feita por outra sessão).
6. **19/10.** O plano de remuneração v3 (USDC, 15 tipos de pergunta, alavancas de lucro, o NFT Laser Breadfier, o
   confronto cético com o mercado) e a v4 (as respostas dele e três produtos novos: Fornada, API com Semeadores e Turbo).

## As decisões do Lucas que mudam o produto

- Tudo em USDC, com conversão no app e o Brot cobrindo a conversão até um teto.
- O mascote passa a se chamar Cacetinho. Os quatro papéis ganham nomes de pão: Cacetinho, Baguete, Pão de Forma e
  Croissant. Trocar o nome no site, no guia da marca e no deck espera a palavra dele.
- O BD ganha por faixa de volume, pela faixa cheia, sem teto; vínculo mês a mês com um mês de folga; fixo no máximo de
  US$ 1.000.
- Campanhas da casa (o Brot abre e fica com a parte do criador), Bake-off com dois criadores, campanha patrocinada
  pelo caminho C.
- A taxa fica em 10% do lado perdedor e não aparece como porcentagem em anúncio.
- Os Crumbs são a base de um airdrop futuro, como rascunho para os sócios.

## O que foi feito fora do repositório

- **Documentos do Claude:** remuneração v1, v2 e v4 (a v3 virou a v4 no mesmo documento), programa de lançamento,
  captação v1 e v2 (com abas de textos dos e-mails, estudo do token, plano técnico e valuation). Os links estão no
  README da pasta de planejamento.
- **Uma lista de contatos de evento triada:** e-mails únicos, MX conferido só por DNS, classificação por perfil. Fica
  na pasta privada das listas, fora do repositório. A planilha original, que estava em `docs/business` sem proteção do
  Git, foi movida para lá, e `docs/business/*.xlsx` e `*.csv` foram excluídos do Git nesta máquina
  (`.git/info/exclude`).
- **A planilha de valuation** com fórmulas, numa pasta interna fora do repositório.
- **Leitura, só leitura, do servidor da Brot e do servidor de outro projeto** (com a liberação dele), para mapear o
  sistema de e-mail que já existia.

## O que deu errado, e o que mudou por isso

- A primeira versão do plano de captação trouxe ressalvas jurídicas e uma pergunta sobre ferramentas que o servidor já
  tinha. O Lucas, que é advogado, rejeitou as duas. Os planos seguintes ficaram sem ressalva jurídica e partem do que
  já roda no servidor (memória `founder-wants-aggressive-web3-plans`).
- A primeira conferência de MX travou: uma consulta de DNS sem tempo limite ficou esperando para sempre. Refeita com
  limite por consulta e servidores públicos, terminou em menos de cinco minutos.
- Outra sessão do Claude respondeu aos comentários do plano de captação antes desta. Ela pôs de volta ressalvas
  jurídicas e sugeriu validar e-mails a partir do IP que vai enviar. Os dois pontos foram corrigidos.
- Na v3, o texto dizia que o cenário cético ficava acima do custo em todos os meses. O gráfico mostrou que os meses 1 e
  2 ficam abaixo, e o texto foi corrigido.

## Em aberto

- As propostas ainda não decididas do plano de remuneração v4 (a tabela de decisões dele) e as perguntas novas.
- O nome do mascote no site, no guia da marca e no deck.
- A ordem do programa com o Ronaldo: USDC, o leitor do pump.fun, a Fornada e o Turbo.
- O material do Colosseum de 12/10, ainda sem commit no branch `docs/roteiro-pitch-foguete`, espera a palavra do
  Lucas para ir a público.
