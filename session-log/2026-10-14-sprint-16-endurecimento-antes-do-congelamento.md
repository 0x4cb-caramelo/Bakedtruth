# 2026-10-14 — Sprint 16: o endurecimento do programa antes do congelamento

O pacote de auditoria (Sprint 17, PR #86) listou o que precisava ser corrigido antes de congelar a versão que as duas
firmas vão ler (`docs/audit/SCOPE.md` §17). Com as Sprints 14 e 15 na `main` (PR #92), a faixa L16P corrigiu tudo na
branch `sprint-16-prefreeze`, a partir de `a1e9c97`.

## O defeito de dinheiro (O-3)

Achado pelo teste aleatório na Sprint 14, em código da Sprint 04. Numa campanha de preço resolvida com SIM, uma prova
anterior ainda dentro do prazo pode mover o corte das entradas tardias para trás, mas só "antes de qualquer contagem".
A regra contava entradas inteiras. Contar só parte das entradas de um padeiro deixava o corte móvel, e as entradas já
contadas como cedo continuavam cedo depois que ele voltava. Assim, uma entrada feita depois do toque comprovado podia
dividir o pote dos perdedores.

A correção é a menor que fecha o caso, sem mudar layout: a contagem de um SIM de preço espera a prova passar do prazo
da janela (`CutoffNotFinal`, 6178). Depois disso qualquer prova anterior é mais velha que a guardada e não passa mais,
então o corte já é final quando a primeira entrada é contada. Outros tipos e resultados contam na hora. A reprodução
virou teste permanente: falha no binário antigo (2 SOL onde deviam ser 3) e passa no novo.

## As outras lacunas

- **G-2, a asserção do cofre.** O pagamento conferia um valor com ele mesmo. Agora cada instrução que paga confere a
  variação do cofre contra a variação nos livros, e o fechamento confere que o cofre cobre o que os livros ainda
  guardam. Nenhum valor mudou.
- **G-16.** Cada recusa da contagem testada pelo programa, e os slots de Join conferidos: um Join só leitura ou
  repetido acabava num erro do próprio runtime.
- **G-10.** A pausa testada com as 27 instruções: recusa exatamente a abertura, a entrada e a entrada selada.
- **G-1.** A prova de mutação cobre as duas checagens da Sprint 04 que estavam de fora e as novas: 11 de 11 casos
  falham com a checagem desligada.
- **O SDK.** A busca do evento de resolução lê toda versão de transação que o cluster serve, e volta à 0 se a RPC
  recusar a opção.

## As conferências

1.100 testes TypeScript, 562 Rust e 564 da mainnet; a suíte negativa do Surfpool, 513 de 513; o teste aleatório na
semente fixa e em mais 24 (12 da faixa e 12 do líder). Na branch juntada à `main`, as 16 conferências passaram (1.125
testes TypeScript).

## A revisão adversária

Só leitura. O argumento do O-3 se sustenta: o relógio do cluster nunca volta ao longo de um fork, então nenhuma prova
anterior continua fresca depois de uma contagem. A asserção do cofre não trava nenhum pagamento legítimo, e nenhum
teste foi enfraquecido. Os achados vão para um passo seguinte, antes do congelamento:

- **Alto, fora do programa:** o indexador, o histórico da API, as minhas entradas do site e os scripts da equipe leem
  transações só na versão 0. Uma transação v1 que cite o programa pararia o indexador e os scripts.
- **Médio:** a reconferência do SDK pode perder uma resolução v1, e o relay só aceita a versão 0.
- **Baixo:** o corte movido guarda o preço da primeira prova, e a asserção do cofre pega movimento fora dos livros, mas
  não um valor errado.
- **Informativos:** um aumento do aluguel acima do SOL mandado à mão travaria um fechamento; o keeper pode contar um
  SIM de preço já depois da janela da prova; e falta, no teste da pausa, uma abertura grátis.

## O que fica

- Os outros leitores de eventos ainda pedem a versão 0: a atividade e as minhas entradas do site, o indexador, o
  histórico da API e a lista do relay.
- Falta, no teste aleatório, uma operação que conte só parte das entradas de um padeiro.
- Atenção depois da atualização do devnet: o fechamento agora recusa um cofre com menos do que os livros. Só o aluguel
  e o pó podem ficar de fora.

## A atualização do devnet

O Ronaldo pediu, em 14/10, para esperar este endurecimento antes de atualizar o programa e publicar o site. Com este
PR na `main`, o líder volta a pedir a confirmação do commit.

## Os achados, corrigidos na manhã seguinte

Duas faixas, a partir do PR #93. A faixa R tornou segura a leitura de transações. Todo leitor usa uma constante de
versão do SDK, e o devnet já serve transações v1: uma real virou fixture. Uma transação ilegível é contada e pulada,
nunca para o indexador nem os scripts; a varredura de pagamentos da indicação para e nomeia a assinatura, porque pular
ali poderia pagar duas vezes. A faixa P2 fez o resto: o teto por pagamento a partir do snapshot (6179), o fechamento
com o aluguel limitado ao que sobra, o preço guardado no corte movido, a pausa com a abertura grátis e o keeper
contando assim que o corte fica final. Uma segunda revisão adversária leu essas mudanças antes do PR.

A segunda revisão adversária confirmou que as correções se sustentam. Nenhum pagamento que o programa produz, em
qualquer modo ou ordem, chega ao teto novo, e o fechamento novo nunca paga o que os livros devem. Ficaram um achado
baixo e três informativos, anotados no escopo da auditoria (S-5 a S-7). O teto cobre o total, e não cada padeiro, e
uma checagem por entrada fecharia isso. O teste estático da pausa pode ser mais estrito. A regra do aluguel precisa ser
escrita em I14 e I15.

