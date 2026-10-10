# 2026-10-10 — Sprint 06: a checagem do Bun no servidor e o keeper do caminho feliz

## Pedido e autorização

O fundador, que é também o dono do servidor, deu três autorizações por escrito neste dia: (1) uma identidade por
unidade no servidor (T13); (2) o adiamento de tudo que é conversão de tesouraria em reais (P-7), no modo "MVP de
hackathon"; (3) o aviso formal e a autorização para entrar no servidor compartilhado e rodar a checagem do Bun. Pediu
também: RPC da Helius no **plano gratuito** por enquanto (créditos virão de trilhas do hackathon, como FastRPC ou
Helius), a URL do RPC lida de variável de ambiente, e o keeper do caminho feliz (monitorar o programa no devnet e
disparar `resolve_campaign` quando a condição for atendida), "rápido e simples para a demo".

Isto muda a decisão de ontem: a D4 ficou com a Helius, mas no plano gratuito, e não no Developer (US$ 49 por mês).
O registro de ontem (`2026-10-10-sprint-06-abertura.md`) fica como estava; esta entrada é a mudança.

## A checagem do Bun (primeiro passo da sprint)

- Feita como o usuário `brot`, em `/var/lib/brot-markets/bun-check/`, com `sudo -u brot`. Nada instalado no sistema,
  nenhuma unidade criada, nenhuma porta aberta.
- Servidor: Ubuntu com glibc 2.35 (o plano pede 2.17 ou mais), kernel 5.15.0-191 (o plano recomenda 5.6 ou mais),
  SSE4.2 e AVX2 nas flags da CPU. O `ldd` do binário só mostra a libc do sistema.
- O zip do Bun 1.4.2 (`bun-linux-x64.zip`, baixado da release oficial) tem o SHA-256
  `36368faef7527875d5ffa52e53cd48021741f2a83eb6208a8dd64068d422a913`, igual à linha do `SHASUMS256.txt` da mesma
  release. Esse hash está em `deploy/vps/bun-1.4.2.sha256`.
- `bun --version` → 1.4.2. O SHA-256 do binário extraído é `a83d263767d839e4d2649ca8e35d07159c7afc99afdc96d731ced29e056dda0c`.
- **Limite:** a confiança no hash vem do GitHub por HTTPS, não de uma assinatura separada. Aceitável para o MVP; o
  registro guarda o hash para o dia em que o binário for trocado.
- O serviço da landing e o túnel seguem ativos, e `localhost:4200/healthz` responde `ok` depois da checagem.

## O keeper do caminho feliz

- `services/keeper` (pacote `@brot/keeper`, um workspace do Bun). Arquivos: `config.ts` (variáveis de ambiente),
  `signer.ts` (chave de arquivo fora do repositório), `campaigns.ts` (campanhas abertas, decodificadas pelo SDK),
  `resolve.ts` (a decisão e a chamada de `resolve_campaign`), `send.ts` (assinar, reenviar os mesmos bytes a cada 2 s,
  confirmar em até 60 s), `cycle.ts`, `health.ts`, `main.ts`, `log.ts`.
- **Regra de envio:** só envia o que a simulação do programa aceita, e nunca em modo de teste (`KEEPER_DRY_RUN=1`).
  `NotResolvableYet` é o "ainda não" normal; outras recusas são registradas pelo nome; uma simulação sem erro do
  programa é falha, e nada é enviado.
- **RPC:** a URL vem de `KEEPER_RPC_URL`; o log mostra só a origem. Plano gratuito da Helius, a chave como credencial.
- **Escopo do MVP, o que não entrou:** `finalize_campaign`, liquidação e pagamentos, leitura em lotes de 100, o fluxo
  de preço da Hermes, o ajuste de taxa de prioridade, as unidades de sistema e o script de publicação.

## O que foi conferido

- `bun test services/keeper`: 10 testes passam (configuração e recusas, a regra de envio, a chave, a listagem com uma
  conta que não é campanha, a rota `/healthz`).
- `tsc` no pacote do keeper: sem erros. `bun run lint:sdk`: passa (as dependências do pacote do keeper não violam
  as regras do SDK).
- `node scripts/codemap.js --check`: em dia, 604 arquivos.
- Execução real somente leitura contra o devnet (RPC público): o keeper listou **3 campanhas abertas** e fez a
  consulta do saldo. Nenhuma transação foi enviada.

## O que NÃO foi conferido

- **Nenhuma transação foi enviada ao devnet pelo keeper.** A chave de teste do keeper ficou com 0 SOL: a torneira
  pública do devnet recusou o pedido (erro interno) e, na segunda tentativa, deu o limite diário (429). Sem saldo, a
  simulação falha antes de chegar ao programa, com `AccountNotFound`, e o caminho de `resolve_campaign` ainda não rodou
  contra o programa real. Para fechar: financiar a chave de teste (torneira, ou um repasse do fundador) e rodar o
  `KEEPER_DRY_RUN=1` de novo; depois, uma campanha real com a condição atendida.
- O keeper não está no servidor. Não há unidade de sistema nem publicação; isso é a parte de unidades e publicação da sprint.

## Pendências e decisões

- A chave do keeper no devnet ainda não existe fora da máquina de teste. Quem a cria e guarda: o fundador, a ser decidido.
- Tesouraria (P-7) adiada, por autorização do fundador.
- Identidades por unidade (T13): autorizadas pelo dono do servidor; ainda não aplicadas (não há unidade de keeper).
- Os itens fora do caminho feliz continuam abertos na lista da sprint.
