# O relógio das redes — Alpenglow na devnet, tempo de slot e deriva do `Clock` (C12, C23)

Medida de 9 de outubro de 2026 (Sprint 03, frente R), para os dois valores [AC] que a abertura da sprint deixou "a
confirmar": `MIN_SLOT_MS` = 100 (o freio de slot nunca pode recusar um preço bom) e `EPOCH_START_SLOW_SLOT_MS` = 500
(o pior caso da regra que exige a época medida começar antes do prazo), e para o que a deriva do relógio significa
para os prazos e para a janela de prova de 60 s. Marcas: **[F]** fato com fonte, **[INF]** inferência minha, **[AC]**
escolha da equipe.

## Veredito

- **`MIN_SLOT_MS` = 100 confirmado [F].** Nenhum minuto medido ficou abaixo de 231,7 ms por slot na devnet nem de
  259,7 ms na rede principal; o freio é pelo menos 2,3 vezes mais folgado que qualquer medida. As portas de
  recurso do SIMD-0525 miram 200 ms nas duas redes: ainda o dobro do freio.
- **`EPOCH_START_SLOW_SLOT_MS` = 500 confirmado [F].** Nenhum minuto passou de 281,7 ms; as médias por época ficam
  em 234,5 a 238,9 ms (devnet) e 267,2 a 268,7 ms (rede principal).
- **A deriva do `Clock` cabe em 2,4 segundos [F]**, com o relógio da rede em geral atrás do de parede. Os 60 s da
  prova, da espera depois do prazo e do adiantamento máximo são 25 vezes isso.
- **A devnet roda Alpenglow desde 25/9/2026; a rede principal ainda não [F].**

## 1. Fatos

### 1.1 Como foi medido

`scripts/devnet-clock-probe.ts`, 9/10/2026, devnet das 04:25 às 04:36 UTC (299 leituras a cada 2 s) e rede
principal das 04:32 às 04:38 UTC (180 leituras), pelos RPCs públicos. Três fontes: `getRecentPerformanceSamples`
(amostras de um minuto; 720 na devnet, 263 na rede principal), a diferença de slot contra o relógio de parede desta
máquina (sincronizada por NTP) em janelas de 30 e 60 s, e a média por época (`slots_in_epoch` e a duração de cada
uma das cinco épocas anteriores e da atual). A deriva é `Clock.unix_timestamp` menos o relógio de parede, descontada
a latência da chamada.

### 1.2 Tempo de slot

| Medida | Devnet | Rede principal |
|---|---|---|
| Amostras de um minuto: mínimo, mediana, máximo | 231,7 / 239,0 / 244,9 ms | 259,7 / 267,9 / 281,7 ms |
| Minutos abaixo de 100 ms, ou acima de 500 ms | 0 e 0 (de 720) | 0 e 0 (de 263) |
| Janelas de 60 s contra o relógio de parede | 230,4 a 244,3 ms (269 janelas) | 259,9 a 281,8 ms (150) |
| Média das cinco épocas anteriores e da atual | 234,5 a 238,9 ms | 267,2 a 268,7 ms |
| Intervalo entre notificações de slot (`slotSubscribe`) | mediana 200 ms; 223 de 2.504 abaixo de 100 ms | mediana 256 ms; 60 de 1.328 abaixo de 100 ms |

Os intervalos entre notificações medem a entrega pela conexão, não o slot: chegam em rajadas depois de uma pausa
(máximo 2,0 s na devnet, 3,9 s na rede principal). O freio do programa compara `Clock::slot − posted_slot` com
`segundos × 1.000 / 100`, uma média sobre pelo menos 30 s, para a qual valem as duas primeiras linhas [INF].

### 1.3 Portas de recurso (feature gates), lidas nas contas `Feature1111…`

| Porta (Agave master `5faf023`, 9/10/2026) | Devnet | Rede principal |
|---|---|---|
| `alpenglow` (SIMD-0326) | ativa desde o slot 504.144.000, 25/9/2026 19:40 UTC | ausente (nunca pedida) |
| `reduce_slot_time_to_350ms` (SIMD-0525) | ativa desde 6/8/2026 | ativa desde 19/8/2026 |
| `reduce_slot_time_to_300ms` | ativa desde 11/8/2026 | ativa desde 26/8/2026 |
| `reduce_slot_time_to_250ms` | ativa desde 18/8/2026 | ativa desde 16/9/2026 |
| `reduce_slot_time_to_200ms` | ativa desde 24/8/2026 | ativa desde 8/10/2026 06:28 UTC |
| `validator_admission_ticket` (SIMD-0357), `discard_unexpected_data_complete_shreds` (SIMD-0337), `bls_pubkey_management_in_vote_account` (SIMD-0387), `enable_bls12_381_syscall` (SIMD-0388) | ativas | ativas |
| `alpenglow_fast_leader_handover`; a chave citada no SIMD-0384 | ausentes | ausentes |

Na devnet existem as duas contas do Alpenglow: o certificado de gênese `42Ym56TQ7AKFThRv5nyoSABq5ZPgE2TLKo8BALZEtoU1`
(246 bytes) e o relógio em nanossegundos `GaGQ2vyb3xuUwjKiq9tQQWoqhzWYh7LbiLXvqG2sUzzG` (8 bytes). Na rede principal
nenhuma das duas. A porta de 200 ms está ativa nas duas redes e o slot medido é 239 e 268 ms: a porta é o alvo, não
a medida [F].

### 1.4 Deriva do relógio e confirmação

| Medida | Devnet | Rede principal |
|---|---|---|
| `Clock.unix_timestamp` − relógio de parede | −2,4 a +0,6 s, mediana −0,7 (299 leituras) | −2,0 a −0,9 s, mediana −1,0 (180) |
| Deriva no primeiro terço e no último terço da corrida | −0,7 e −0,3 s | — |
| Relógio em nanossegundos do Alpenglow − relógio de parede | −1.980 a +1.112 ms, mediana −271 | não existe |
| Segundo do `Clock` igual ao do relógio em nanossegundos | 299 de 299 | — |
| Slot confirmado − slot finalizado | 0 (−2 a 0) | 31 a 33 |
| Slot processado − confirmado | 2 (0 a 2) | 0 (−2 a 1) |

Sob o Alpenglow a confirmação é a finalidade: a diferença é zero. Na rede principal, quem lê em `confirmed` vê a
conta cerca de 32 slots (8 a 9 s) antes de ela ser final [F].

## 2. O que isso significa para o programa [INF]

- **Prazos:** um `deadline_at` cai a até 2,4 s do relógio de parede; o indexador e o site podem mostrar o prazo
  como hora de parede sem aviso.
- **A janela de 60 s:** a prova do SIM pode ter 60 s de idade e 60 s de adiantamento; a deriva de 2,4 s não muda
  nenhum dos dois lados de forma que importe.
- **O começo da época:** com slots de 239 e 268 ms, uma época da devnet dura cerca de 28,7 horas e uma da rede
  principal cerca de 32,2 horas; a regra do pior caso (500 ms) supõe 60 horas, folga de quase o dobro.
- **Quando a porta de 200 ms virar medida,** o freio de 100 ms continua o dobro mais folgado. Um slot de fato
  abaixo de 100 ms pediria uma troca do [AC]; nada medido aponta para isso.

## 3. O que não foi feito

- Medir por mais de 12 minutos de uma vez, ou em horário de pico.
- Ler quem fixa o `unix_timestamp` sob o Alpenglow (o líder, segundo o SIMD-0326) no código da Agave: aqui o fato
  observado é que o segundo do `Clock` bate com o do relógio em nanossegundos em todas as leituras.

## Fontes

- `scripts/devnet-clock-probe.ts`, corridas de 9/10/2026 (os JSONs não são versionados; os números são a cópia).
- Agave, `feature-set/src/lib.rs`, master `5faf023` (9/10/2026): os endereços das portas.
- SIMD-0326 (Alpenglow), SIMD-0525 (redução do tempo de slot), SIMD-0384.
- `knowledge-base/tecnologia/pyth-leitor-de-preco.md`, seção 1.7 (a leitura única de 5/10/2026).
