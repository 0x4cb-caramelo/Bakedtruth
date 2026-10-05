# Sprint 01 — Fundação: prova do leitor de preço

**Estado:** concluída em 5/10/2026, com um critério não cumprido e levado para a Sprint 03 (a leitura no Surfpool) · **Branch:** `sprint-01-foundation` · **Datas:** sem datas, por decisão do fundador

| | |
|---|---|
| Bloco do plano técnico | B1 |
| Depende de | Sprint 00 |
| Regras e fluxos cobertos | Prepara R-09 e R-13. Não implementa regra |

## Objetivo

Responder, com uma conta real, se a Pyth serve na devnet do jeito que o leitor de preço precisa. É a primeira peça
porque o fundador decidiu que o leitor de preço é construído primeiro (R-13) e porque ninguém verificou isso até
hoje (P4 §2.4).

## Critério de pronto

- [x] Um `PriceUpdateV2` real da devnet, de SOL e de BTC, está em `tests/fixtures/`, capturado com
      `scripts/capture-fixtures.ts`. Ou está registrado, com a fonte, que ele não existe lá (C1).
- [x] Um teste em Rust lê a conta capturada: dono, formato e cada campo que o leitor usa. Com a conta cortada, dá
      erro, nunca pânico.
- [ ] A mesma leitura passa no Surfpool, com o modelo de `PriceUpdateV2` dele, numa versão estável fixada (C4).
      **Não cumprido.** A versão estável foi identificada (v1.6.0) e não foi fixada em nenhum arquivo; a leitura
      não foi feita. Foi para a Sprint 03. O porquê está no registro, abaixo.
- [x] Uma nota em `knowledge-base/tecnologia/` responde C1, C2, C3, C4 e C12, cada uma com fonte primária, separando
      fato de inferência. Duas respostas são parciais: se a biblioteca da Pyth compila (C2) e se o Surfpool simula
      o stake de época (C4) não foram conferidos, e a nota diz isso.
- [x] A decisão T2 está registrada: leitor escrito à mão ou a biblioteca da Pyth.
- [x] Há um veredito escrito para o fundador: serve; serve só no Surfpool; ou não serve.
- [x] Fechamento comum (`docs/SPRINTS.md`, seção 4).

## Entregas

- As contas capturadas e o teste de leitura.
- Um rascunho de `readers/price_touch.rs` só com a leitura, sem regra de aposta nem de resolução.
- A versão do Surfpool fixada.
- A nota de pesquisa e o veredito.

## Fora desta sprint

A trava da aposta, o SIM por toque e os números do leitor (Sprint 03). A publicação de preço pelo serviço (Sprint
06). Qualquer instrução do pote.

## Decisões do fundador que travam a sprint

Nenhuma para começar. Para fechar, só se a Pyth não servir na devnet: o fundador escolhe entre abrir com quatro
tipos e rever a decisão dos cinco (P1 §4.2; plano técnico, seção 13).

## Agentes e skills

- **Agentes:** `research-agent` (C1 a C4, nas fontes primárias), `technical-security-red-team-agent`,
  `coordinator-agent`.
- **Skills:** `sprint-management`, `decision-log`, `cost-watchdog` (C3: a taxa por atualização de preço e se o
  serviço de preços exige chave), `codemap`, `secrets-scan`.

## Portões de segurança

- Nenhuma dependência alfa ou beta. A biblioteca da Pyth só entra com prova de que compila com `anchor-lang 1.1.2`.
- A chave do serviço de preços, se existir, fica fora do repositório.
- `secrets-scan` no fechamento.

## Testes

`bun run test:rust`, com a conta real e com a conta malformada. A leitura no Surfpool.

## Riscos

- A Pyth não servir na devnet (gravidade alta no plano técnico). Aí o leitor é testado só no Surfpool, e a decisão
  dos cinco tipos volta ao fundador.
- A biblioteca puxar uma dependência fora de linha, como já aconteceu com `solana-epoch-stake`.
- O Surfpool não ter versão estável.

## Artefatos esperados

`tests/fixtures/*.bin` de preço, o teste de leitura, a nota em `knowledge-base/tecnologia/`, `CODEMAP.md`.

## Changelog e session-log

- **Changelog:** prova do leitor de preço e o resultado.
- **Session-log:** o veredito, a escolha de T2 e as alternativas descartadas.

## Registro e retrospectiva

### Veredito

**A Pyth serve na devnet.** O receptor e as contas de preço de SOL e de BTC existem lá, nos mesmos endereços da
rede principal, e o leitor lê as contas reais. Seguem os cinco tipos de pergunta.

### O que foi entregue

| Item do critério de pronto | Evidência |
|---|---|
| Contas reais da devnet | `tests/fixtures/pyth-sol-usd-devnet.bin`, `pyth-btc-usd-devnet.bin` e `pyth-sol-usd-devnet-legacy.bin`, 134 bytes cada, slot 507785675, com o SHA-256 em `tests/fixtures/index.json` |
| Teste em Rust | `programs/brot-markets/tests/price_reader.rs`, dez testes: lê SOL e BTC campo a campo; recusa o receptor anterior, outro dono, outro ativo, conta cortada em qualquer tamanho, conta esticada, conta zerada, outro tipo de conta e todo nível de verificação que não seja o completo. `tests/cursor.rs`, cinco testes do leitor de bytes |
| Nota de pesquisa | `knowledge-base/tecnologia/pyth-leitor-de-preco.md` |
| Decisão T2 | Leitor escrito à mão. Na nota (seção 2), no plano técnico (14.3) e no `session-log/` |
| Veredito | No topo da nota e acima |
| Conferência automática | Execução 37339469159, no primeiro envio, e 37342351689, depois das correções da revisão: os três trabalhos passam. O IDL editado à mão é idêntico ao gerado |

### O que não foi feito

**A leitura no Surfpool.** O critério pedia que a mesma leitura passasse no Surfpool, com a versão fixada. Não foi
feito, e a decisão foi minha, tomada no meio da sprint:

- O Surfpool era a saída para o caso de a Pyth não existir na devnet. Ela existe.
- Ele não tem binário para Windows; rodaria só na conferência automática.
- Sem instrução no programa, não há o que executar dentro dele: seria ler os mesmos bytes por outro caminho.

Foi para a Sprint 03, onde há instrução e onde o sistema de cenários dele simula o preço encostando no alvo. Está
registrado lá, numa seção "Herdado da Sprint 01". A sprint fecha com este critério em aberto, e o fundador pode
reabri-la se discordar.

Também não foram feitos, e a nota diz: compilar a biblioteca da Pyth com o `anchor-lang 1.1.2`; conferir se o
Surfpool simula o stake de época; medir a frequência das contas por mais de dois minutos.

### O que mudou em relação ao planejado

- **A Pyth tem duas gerações de programas na Solana.** O plano não sabia. O leitor aceita só a atualizada.
- **O serviço de preços passou a exigir chave.** Afeta a Sprint 06, e não esta.
- **O leitor exige o ativo esperado.** Não estava no rascunho; entrou pela revisão adversarial.
- **As contas capturadas ganharam código de conferência.** O índice guarda o SHA-256 de cada uma, um teste confere,
  e o script de captura confere a rede antes de gravar.
- **As ferramentas locais não foram atualizadas.** A máquina não tinha memória nem disco para isso.

### Revisão adversarial

Feita pelo `technical-security-red-team-agent` sobre o leitor, os testes, as contas capturadas e a nota. Nenhum
achado crítico ou alto. Os fatos que ela trouxe sobre a Pyth foram conferidos de novo, direto nas duas redes, antes
de entrarem na nota.

| Achado | Gravidade | O que foi feito |
|---|---|---|
| O leitor devolvia o preço de qualquer ativo, e quem chamasse podia esquecer de conferir | Média | Corrigido: o ativo esperado é parâmetro obrigatório, com erro próprio e teste |
| Nenhum teste exercitava o leitor de bytes (`Cursor`) | Média | Corrigido: cinco testes diretos |
| Aceitar qualquer conta válida na aposta deixa escolher o preço mais velho admitido | Média | Sprint 03, que decide o desenho. No plano técnico (3.4.8) e na seção "Herdado" da 03 |
| Na devnet, uma chave comum controla a atualização do receptor | Baixa agora, alta na rede principal | Risco registrado na seção 13 do plano técnico; a vigia na Sprint 07; quem controla na rede principal, na Sprint 16 |
| Testes que passariam com o leitor errado | Baixa | Corrigido em parte: todos os níveis de verificação, conta zerada, bytes não lidos. Valores extremos e uma conta da rede principal, na Sprint 03 |
| Contas capturadas trocáveis sem aviso | Baixa | Corrigido: SHA-256 no índice, teste, conferência da rede e do dono no script, `*.bin` marcado como binário |
| A nota dizia que a atualização foi em 26/8, e os programas estão na rede desde 5/5 | Baixa | Corrigido: seção 1.8 da nota, com o que a rede mostra |

### Retrospectiva

- **Funcionou:** ir à rede antes de escrever código. As oito contas lidas byte a byte deram o formato e mostraram
  as duas gerações, que nenhum documento do projeto citava. A revisão adversarial achou um defeito de forma que os
  testes não achariam.
- **Custou:** o IDL foi editado à mão duas vezes, porque a máquina não compila. A conferência automática confirmou
  as duas, e leva cerca de dois minutos com o cache quente.
- **Errei:** disse ao fundador que a conferência automática estava rodando quando o pull request nem tinha sido
  criado, por queda de conexão; estimei de cinco a dez minutos por conferência, e são dois; recomendei atualizar as
  ferramentas locais sem ter olhado a memória e o disco da máquina.
- **Decidi sozinho deixar um critério de pronto para depois.** A razão está escrita, mas a escolha deveria ter sido
  levada ao fundador na hora, e não no fechamento.
- **Segue aberto para a Sprint 03:** o limite de 30 segundos para a idade do preço na devnet, que é pergunta para
  o fundador. **Para a Sprint 06:** a chave do serviço de preços.
