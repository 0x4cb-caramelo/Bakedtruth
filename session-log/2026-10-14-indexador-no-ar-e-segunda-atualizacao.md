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
