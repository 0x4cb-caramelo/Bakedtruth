# 2026-10-05 — Sprint 01: a Pyth serve na devnet, e o leitor de preço lê contas reais

## Context

O Lucas respondeu "vamos na tua recomendação, pode seguir". A recomendação era: mesclar a regra de fechamento de
interação, atualizar as ferramentas da máquina e abrir a Sprint 01, com a apresentação resumida do plano correndo
em paralelo.

A Sprint 01 (`docs/sprints/sprint-01-foundation.md`) existe para responder uma pergunta que ninguém tinha
conferido: a Pyth serve na devnet do jeito que o leitor de preço precisa? O fundador decidiu que o leitor de preço
é construído primeiro, e o plano técnico listava cinco afirmações sem fonte sobre ele (C1, C2, C3, C4 e C12).

A atualização das ferramentas locais foi abandonada antes de começar: a máquina tinha 1,1 GB de memória livre e
3 GB livres no disco C:. O programa segue compilando só na conferência automática do GitHub.

## Decision

1. **Veredito: a Pyth serve na devnet.** O programa receptor e as contas de preço de SOL e de BTC existem lá, nos
   mesmos endereços da rede principal, e o leitor lê as contas reais. A escolha entre abrir com quatro ou com cinco
   tipos de pergunta não se coloca.
2. **O leitor aceita só a geração atualizada da Pyth** (receptor `rec2HH...`). A pesquisa achou o que o plano não
   sabia: desde 26/8/2026 há duas gerações de programas na Solana. A atualizada é a recomendada para integração
   nova e a que renova mais rápido.
3. **O leitor foi escrito à mão (decisão T2 do plano técnico).** Confere dono, tamanho exato de 134 bytes,
   discriminador e verificação completa, e devolve preço, margem, expoente, horário e slot.
4. **Verificação parcial é recusada**, e tamanho diferente de 134 bytes também.
5. **Só a leitura entrou.** A idade do preço, a conferência do ativo contra a pergunta, a trava da aposta e o
   "encostou no alvo" são da Sprint 03. Nada no programa chama o leitor ainda.
6. **Os testes ficam em arquivo próprio** (`programs/brot-markets/tests/price_reader.rs`), porque com eles o
   leitor passava de 200 linhas.
7. **A leitura no Surfpool, que o critério de pronto pedia, não foi feita.** Passou para a Sprint 03, registrada
   lá numa seção "Herdado da Sprint 01". A sprint fecha com esse critério marcado como não cumprido.
8. **O script de captura de contas passou a aceitar a devnet** e a capturar um grupo de contas sem tocar nas
   demais. Cada conta capturada registra de qual rede veio.
9. **O ativo esperado faz parte da leitura.** Veio da revisão adversarial: como qualquer pessoa posta pelo receptor
   um preço assinado de qualquer ativo, uma conta que passa nas conferências prova só "a Pyth assinou isto, de algum
   ativo, em algum momento". O leitor passou a receber o identificador do ativo e a recusar outro, para que esquecer
   a conferência seja erro de compilação, e não um preço de BTC respondendo a uma pergunta de SOL.
10. **As contas capturadas ganharam código de conferência.** O índice guarda o SHA-256 de cada uma, um teste
    compara, o script confere a rede pelo código dela antes de gravar e recusa conta que mudou de dono.
11. **Os achados de desenho da revisão ficaram para a Sprint 03, registrados lá:** separar a conta aceita na aposta
    da conta aceita na prova, e alargar os tipos na conta do preço menos a margem. O risco de quem controla a Pyth
    foi para a seção 13 do plano técnico, com a vigia na Sprint 07 e a conferência da rede principal na 16.

## Alternatives considered

- **Usar a biblioteca `pyth-solana-receiver-sdk` 1.2.0.** Descartada. O formato são 134 bytes e doze campos, já
  conferidos em oito contas reais. A biblioteca traria uma dependência cuja compatibilidade com o `anchor-lang
  1.1.2` não foi testada, e o repositório já ficou preso numa versão por causa de dependência assim
  (`solana-epoch-stake`). O custo da escolha: se a Pyth mudar o formato, a mudança chega por leitura quebrada, e
  não por atualização de biblioteca.
- **Aceitar as duas gerações do receptor.** Descartada. Daria ao programa dois programas de fora em que confiar,
  em vez de um.
- **Aceitar verificação parcial com um mínimo de assinaturas.** Descartada. Ela desloca os campos em um byte e
  significa menos assinaturas conferidas.
- **Fazer a leitura no Surfpool agora.** Era a saída para o caso de a Pyth não existir na devnet. Com oito contas
  reais lidas, ler um modelo acrescenta pouco. O Surfpool não tem binário para Windows, então rodaria só na
  conferência automática, e sem instrução no programa não há o que executar dentro dele: seria ler os mesmos bytes
  por outro caminho. Na Sprint 03 há instrução, e o sistema de cenários dele serve para simular o preço encostando
  no alvo.
- **Atualizar as ferramentas locais antes da sprint.** Abandonada pela falta de memória e de disco. A conferência
  automática, com o cache quente, leva cerca de dois minutos, e não os cinco a dez que eu tinha estimado.

## Consequences

- **Duas perguntas novas para o fundador.** O limite de 30 segundos para a idade do preço vale também na devnet,
  onde a conta patrocinada chega a 64 segundos, ou vira parâmetro por pergunta (trava a Sprint 03). E se vale obter
  a chave do serviço de preços da Pyth, que desde 26/8/2026 é exigida e só é necessária se o nosso serviço publicar
  preço (trava a Sprint 06).
- **Uma inferência a validar:** na rede principal a conta patrocinada renova a cada 5 a 11 segundos, o que cumpre
  os 30 segundos sem publicação nossa. Foi medido por um a dois minutos, numa tarde. Se valer por dias, a tarefa de
  publicar preço do keeper pode não ser necessária na rede principal.
- **Dependência de terceiro registrada:** a conta patrocinada é paga por outra pessoa, e a lista pode mudar.
- **O IDL foi editado à mão**, porque a máquina não compila, e a conferência automática confirmou que ele é
  idêntico ao gerado.

## O que deu errado no caminho

- A criação do pull request falhou por tempo esgotado na conexão com o GitHub, e eu tinha dito ao Lucas que a
  conferência automática já estava rodando. Não estava. O pull request (#6) foi criado na tentativa seguinte.
- O leitor passou de 200 linhas com os testes dentro; foram para arquivo próprio.
- A nota de pesquisa dizia que a atualização da Pyth foi em 26/8/2026, repetindo a documentação. A revisão
  mostrou, e eu conferi nas duas redes, que os programas da geração atualizada estão lá desde 5/5/2026. A nota foi
  corrigida e passou a separar o que a documentação diz do que a rede mostra.
- Deixei um critério de pronto para depois sem levar a escolha ao Lucas na hora. Foi relatado no fechamento.

## Follow-up

- Sprint 03: a leitura no Surfpool, a idade do preço, a conferência do ativo e o "encostou".
- Sprint 06: decidir, com medida de dias, se o keeper precisa publicar preço na rede principal.
- Fundador: as duas perguntas acima.

## Fontes

`knowledge-base/tecnologia/pyth-leitor-de-preco.md`, com as consultas às duas redes e a documentação da Pyth.
