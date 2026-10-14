# 2026-10-14 — O indexador no ar, o plano de incidente respondido e a segunda atualização do dia

## O que o Ronaldo respondeu e pediu

- **O plano de incidente.**
  - Quem fala pela casa: "bernardo e depois lucas. por ultimo eu".
  - Quem substitui o CTO nos alertas: o Lucas ou o Bernardo. "isso agora nao eh importante mas coloque um lembrete",
    para ver com a equipe.
  - Onde e em quanto tempo se publica: "sera decidido em equipe".
  - "Pausar primeiro, investigar depois": "ok aprove".
- **O repositório público:** "repo publico por hora nao".
- **O indexador:** "pode instalar o indexador".
- **O #94 e o resto:** "pode mergear a 94" e "e todo o resto atualizar ci etc publicar site".
- **Como trabalhar:** "evite fazer pr que nao seja para mudanca, me diga quando terminar a funcao das sprints". Os
  registros desta rodada vão no próximo PR de mudança, junto com a última rodada antes do congelamento.

## O que foi feito

1. **As respostas do plano de incidente** foram registradas no #94, que entrou na `main` como `2e7a28c` com o CI verde
   no commit da ponta.
2. **O indexador**, a partir do pacote da `main` `2e7a28c`:
   - usuário `brot-indexer` sem login, uma cópia própria do Bun, a release, as configurações sem segredo e a
     credencial com a RPC pública do devnet;
   - a primeira partida falhou: o systemd 249 do servidor ignora `%d` nas linhas `Environment=` ("Invalid slot"). Um
     complemento da unidade com o caminho completo das credenciais resolveu, e os quatro arquivos de unidade do
     repositório passam a usar esse caminho, com um teste;
   - está ligado no boot, com a saúde `ok`. Ele lê o histórico do programa desde o começo e espera quando a RPC
     pública recusa por excesso de pedidos. As rotas respondem pelo `brot-api` dentro e fora do servidor.
3. **O programa do devnet:** o binário do CI de `2e7a28c` (`9c5e9ffb…`, 206.112 bytes, o mesmo do build local)
   coube na conta estendida de manhã, então só custou as taxas. Foi implantado no slot 510.880.658, com o hash
   conferido na rede, e o arquivo temporário com a chave da Helius foi apagado.
4. **O site:** a release `2e7a28c207bd` foi compilada para esse slot, ensaiada na 4239 (as oito páginas como as do ar,
   nenhum erro) e posta no ar. A API diz `ok`, com as entradas abertas.
5. **O keeper:** a release `2e7a28c` foi ensaiada na 4239 (quatro ciclos, nenhuma falha) e posta no ar, sem mudança
   no env.

## Os alertas, explicados ao Ronaldo

São avisos automáticos do keeper quando algo pede uma pessoa: uma campanha parada, a carteira do keeper sem SOL,
dinheiro demais nos cofres, aberturas demais numa hora, uma abertura por chave da equipe (pode ser uma chave vazada),
uma segunda leitura diferente do resultado, uma disputa aberta ou perto do fim, uma taxa selada parada, o preço da
Pyth velho, e o keeper principal fora do ar. Cada um tem um runbook que diz quem age, como e em quanto tempo. Hoje eles
vão só para o diário do servidor; as duas caixas de entrada são um item da Sprint 16.

## O caminho de volta

- **Site:** `current` em `a5e6014e42f3`.
- **Keeper:** `current` em `releases/8af10e2`.
- **Indexador:** `sudo systemctl disable --now brot-indexer`.
- **Programa:** só implantando de novo o binário anterior (`86ecf1c8…`, do artefato do CI de `a5e6014`).

## A última rodada antes do congelamento, e o custo

Os três pontos da segunda revisão e a correção das unidades foram feitos pela faixa do programa: a checagem por
entrada (6180), o alerta `settle_invariant`, o teste da pausa e os caminhos das credenciais. Uma terceira revisão não
achou pagamento legítimo que esbarre na checagem. Ela deixou um achado baixo, anotado como S-8 no escopo, e três
informativos; dois deles, nos testes e no comentário da unidade, o líder corrigiu sem agente.

O Ronaldo perguntou o que os agentes faziam e reclamou do custo: "ja consumiu quase 1m tokens". A faixa do programa
tinha trabalhado o dia inteiro, em três rodadas, e a cada passo reenvia a conversa inteira. Ela já tinha terminado o
trabalho e só esperava as sementes, então o líder a parou e rodou as sementes e a prova de mutação num shell sem
modelo: as 13 passaram, e os dois testes da checagem nova falham quando ela é removida. Daqui em diante, agentes novos
com contexto curto, e esperas longas em shell.

O Ronaldo pediu para deixar o PR e o pacote de auditoria prontos e decidir com os sócios, antes da tag do
congelamento, o prêmio de terceiros e as duas firmas.

## A última rodada no ar, as tags e um PR só

- **O pedido.** O Ronaldo: "pode mesclar o #95, atualizar o programa no devnet com o binário do CI da main depois dele
  e publicar o site e nao faca mais pr" e "pode pôr as tags das sprints 06, 07, 08, 14 e 15".
- **O #95** entrou como `6bd0f68`.
- **O programa.** O binário do CI (`c002c5c3…`, 206.784 bytes, o mesmo do build local) foi implantado no slot
  510.894.454, sem extensão, com o hash conferido na rede.
- **O site.** A release `6bd0f68171d2` foi ensaiada na 4239 e posta no ar; a API diz `ok`, com as entradas abertas.
- **As tags.** `sprint-06` e `sprint-07` em `88a00f9` (o PR #88), `sprint-08` em `8af10e2` (o PR #91), `sprint-14`
  e `sprint-15` em `98b6ece` (o PR #92). Cada uma é anotada com o que ficou aberto, como as de -1, 09 e 10.
- **O keeper.** Depois veio: "atualize o keeper abra uma pr e mergeie com admin merge depois. unica pr". A release
  `6bd0f68` foi ensaiada na 4239 (quatro ciclos, nenhuma falha) e posta no ar, com o alerta `settle_invariant`.
- **O registro.** Este PR único carrega tudo isso. Os PRs abertos que não são do líder ficam com o Ronaldo: o #96, do
  Dependabot (duas ações do GitHub, de 7.0.1 para 7.0.2 e de 8.0.1 para 8.0.2, fixadas por hash), e o rascunho #36, da
  Sprint -1, obsoleto como código, cujas notas de sessão a Sprint -1 pede copiar antes de fechá-lo.

