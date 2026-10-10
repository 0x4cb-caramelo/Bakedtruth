# 2026-10-10 — Sprint 06 fechada; Sprint 08 no mínimo: a API de leitura para o Lucas

## Decisões do fundador

- **Prazo:** o Colosseum fecha em **12 de outubro de 2026**, a data firme. Faltam cerca de 48 horas.
- **Trilha Seeker (mobile):** há outra trilha, a do celular Seeker, com a mesma data. **Não há entrega de Android planejada
  na Sprint 20 a 22 para esse prazo, e o escopo exato da submissão não foi informado.** Pergunta aberta (ver pendências).
- **Lucas:** precisa listar campanhas ativas e resolvidas sem chamar o RPC no navegador. Pedido: uma API de leitura,
  enxuta. Sprint 08 reduzida a isso.
- **Destinos aprovados:** os itens não construídos da Sprint 07 vão para as Sprints 13, 14 e 16, como propôs o agente.
- **Sprint 06 fechada** pelo fundador, sem a resolução real observada. O fundador deixa o toque do BTC/USD acontecer
  por conta própria. Os destinos dos itens não construídos da Sprint 06 são propostas, ainda não aprovadas.

## O que foi feito (`services/api`)

- `snapshot.ts`: uma leitura da cadeia por ciclo (campanhas do programa, decodificadas pelo SDK; estado público com o
  relógio da cadeia). Sem estado próprio.
- `store.ts`: guarda o último snapshot bom; uma falha de atualização mantém o anterior e registra só o nome do erro,
  para não expor a URL do RPC.
- `routes.ts`, `query.ts`, `dto.ts`: `/api/v1/health`, `/api/v1/campaigns` (filtro por estado, `limit`, `offset`) e
  `/api/v1/campaigns/:address`. Parâmetro desconhecido ou valor ruim: 400. Valores grandes como texto; endereços em base58.
- Testes: `bun test services/api` com 13 testes, sem cluster.
- **Verificado ao vivo:** a API, apontada para o devnet público (RPC sem chave), leu 4 campanhas no slot 509443307, com
  a campanha de teste `FmDo…` entre elas; a lista e o filtro responderam; um parâmetro desconhecido deu 400.

## O que não foi feito

- **Não está publicada.** Ela roda em loopback. Um endereço público exige uma rota no túnel (Cloudflare), que o fundador
  deixou de lado. Lucas precisa de uma forma de chegar até ela: ver pendências.
- Só o mínimo da Sprint 08 está pronto: sem indexador SQLite, sem histórico, atividade, ranking, pontos, preço, nomes,
  DTOs em zod, `brot-rpc` nem o cache da Cloudflare.
- O estado "fechada porque o resultado já é conhecível" depende da conta da métrica e não entrou; a campanha aparece
  como aberta até fechar por tempo ou época.

## Pendências

1. **Hospedagem da API para o Lucas:** (a) uma rota no túnel, o que toca a Cloudflare, ou (b) rodar a API no
   computador dele ou na minha máquina por enquanto. Preciso da escolha.
2. **Trilha Seeker:** o que a submissão exige (um APK, uma loja, ou só um vídeo/demonstração?) e para quando.
3. **Nomes dos campos da API:** a primeira versão usa nomes provisórios; Lucas confirma ou pede outros.
