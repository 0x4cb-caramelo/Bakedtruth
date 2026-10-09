# Lighthouse — o programa de asserções que a carteira acrescenta à transação

Levantamento de 9 de outubro de 2026, para a lista de programas que o `brot-rpc` aceita em `sendTransaction` e
`simulateTransaction` (Sprint 08; plano técnico, seção 3.5 e item C22 da seção 14.4). Marcas: **[F]** fato com fonte,
**[INF]** inferência minha, **[AC]** escolha da equipe.

## Resposta

O endereço do Lighthouse é **`L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95`**, o mesmo na rede principal e na devnet
**[F]**. Nas duas redes ele existe e é executável. Na rede principal não tem mais autoridade de atualização: o código
instalado não muda. Na devnet ainda tem.

## 1. Fatos

### 1.1 O endereço, na fonte

| Fonte | O que diz |
|---|---|
| `README.md` do repositório `Jac0xb/lighthouse` (commit `4c579479`, de 27/4/2025, o mais recente), seção "Addresses" | "Devnet: `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95`" e "Mainnet Beta: `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95`" |
| `programs/lighthouse/src/lib.rs`, linha 26, no mesmo commit | `declare_id!("L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95");` |
| Versões publicadas no repositório | v2.0.0 em 7/10/2024; v0.1.0 em 18/4/2024 |
| `verify.osec.io/status/L2TExMFK…` (OtterSec), lido em 9/10/2026 | `is_verified: true`, `is_frozen: true`, código do repositório `jac0xb/lighthouse`, hash `b70084e0d1de4a55…`, verificado em 7/10/2024 |
| `docs.phantom.com/developer-powertools/lighthouse` (a fonte E69 do plano técnico) | "When you submit a transaction to Phantom, it may be augmented with Lighthouse assertion instructions before being submitted to the network." A página não traz o endereço do programa |

O repositório se descreve como "The Solana assertion protocol": instruções que conferem o estado de contas e fazem a
transação falhar se a conferência não passa (README, seção de exemplos) **[F]**. O que cada instrução pode gravar não
foi lido aqui.

### 1.2 O programa na rede

Lido por `getAccountInfo` nas duas redes em 9/10/2026 (conta do programa e cabeçalho da conta de dados).

| Rede | Dono | Executável | Conta de dados | Última instalação | Quem pode atualizar |
|---|---|---|---|---|---|
| Rede principal | `BPFLoaderUpgradeab1e…` | sim | `CJ5WEjifs4d77pEA9DpewppByFjHcAkNv3YYSuSoDk7c` | slot 294179293, 7/10/2024 05:28 UTC | ninguém: autoridade removida |
| Devnet | `BPFLoaderUpgradeab1e…` | sim | `CJ5WEjifs4d77pEA9DpewppByFjHcAkNv3YYSuSoDk7c` | slot 331168540, 7/10/2024 04:48 UTC | `W1ckNjLqZ2UoijogQj9rMCacdFtn6KJm3Caxs1oPgdx` |

A data da última instalação coincide com a da versão v2.0.0 e com a verificação da OtterSec.

### 1.3 Em uso

O serviço que mantém frescas as contas de preço da Pyth na rede principal (pagador `9F6ApEtzkHVdZXzsury6BYmyEh4pahDBxuhNLaGC6saC`)
manda, junto de cada atualização, uma transação com instruções do Wormhole e uma do Lighthouse. Visto nas dez
transações mais recentes da conta SOL/USD em 9/10/2026, entre 04:08:57 e 04:09:21 UTC: cinco pares, cada um com uma
transação dessas e a atualização em si **[F]**.

## 2. Inferências

- **Na rede principal o endereço pode entrar na lista sem medo de troca de código** [INF]: o programa é imutável, e o
  código instalado é o do repositório, segundo a OtterSec. Uma lista que aceita o Lighthouse aceita exatamente aquele
  código.
- **Na devnet, aceitar o Lighthouse é confiar numa chave** [INF]: `W1ckNj…` pode reinstalar o programa. Quem a
  controla: não conferido. Como o relay da devnet não protege dinheiro de verdade, o risco é pequeno.
- **Que a Phantom usa este endereço é inferência** [INF]: a página dela não o imprime. A ligação vem de ser o único
  programa chamado Lighthouse, com código verificado e uso visto na rede. Conferir no tráfego real do cliente na Sprint
  11, quando a lista final sai do registro de chamadas.

## 3. O que isto significa

- **Para a lista do relay (Sprint 08)** [AC, a decidir lá]: aceitar `L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95` nas
  duas redes, ao lado de `brot_markets` e do ComputeBudget. Sem ele, uma entrada assinada pela Phantom com asserções
  seria recusada pelo próprio relay.
- **Para o programa `brot-markets`:** nada. O Lighthouse roda como instrução separada na mesma transação, e o programa
  não o chama nem depende dele.
- **Vigiar:** a autoridade de atualização na rede principal continuar vazia. Cabe no vigia da Sprint 07, que já olha
  as instalações do receptor da Pyth.

## Fontes

- https://github.com/Jac0xb/lighthouse (README e `programs/lighthouse/src/lib.rs` no commit
  `4c579479c98635e419b1b167f08be02a71604a71`; versões em `/releases`)
- https://verify.osec.io/status/L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95
- https://docs.phantom.com/developer-powertools/lighthouse
- Consultas diretas às duas redes (`getAccountInfo` com `jsonParsed` na conta do programa; com `dataSlice` de 45 bytes
  na conta de dados; `getBlockTime` nos slots de instalação), 9/10/2026. O mesmo se repete com
  `solana program show L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95 --url mainnet-beta` numa máquina com chave padrão.
- As transações do pagador `9F6ApE…`: `getSignaturesForAddress` na conta `7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE`
  e `getTransaction` em cada uma, rede principal, 9/10/2026.
