# 2026-10-10 — Sprint 06: a campanha de teste aberta pela chave de equipe, e o cuidado com o 429

## O que aconteceu

- Três tentativas do script de abertura: a primeira, com prazo de dois dias, recusou com `DurationTooShort` (0x17a3,
  o mínimo do devnet é de três dias). A segunda, já com o prazo de quatro dias, **foi confirmada** (transação
  `4gs7kkzMkqE3ocWZU4nfd5sd4NBCY3ipJigdAxeSGoCFauqpGhZCvEBziuPNLcT7s9XyJmuWQBaQswyGi7FjyWya`, sem erro), mas o script
  parou depois do envio com `429 Too many requests` ao consultar o estado da transação. A terceira tentativa, com o
  mesmo script, não foi feita: uma nova abertura teria criado uma segunda campanha.
- **Conferência antes de tentar de novo:** as assinaturas recentes da chave de equipe (`3EgrFs…`) mostram a transação
  acima como confirmada e a anterior (com `DurationTooShort`) como falha.
- **A campanha:** `FmDoXD1qx2ZfLr71WjrHHxFhLqDRkA6s24je1YfCj1Ho`. Aberta, tipo preço (BTC/USD), dir. "acima",
  alvo 83.660,41574 (escala −8, 8366041574000), prazo `1791953321` (cerca de quatro dias depois da abertura), conta
  patrocinada `APgzQG…`. O preço, na abertura, estava cerca de 1,3% abaixo do alvo.

## O que o keeper faz agora

- Monitora a campanha a cada ciclo de 15 s. Quando o preço patrocinado tocar o alvo dentro da janela e a leitura tiver
  no máximo 60 s, a simulação passa e o keeper envia `resolve_campaign`. Um toque pode levar horas ou dias.
- Um observador ligado ao diário do servidor procura o evento `resolved`, e avisa quando aparecer.

## Lição

Um 429 depois do envio **não** quer dizer que a transação falhou. Antes de rodar o script de novo, consultar as assinaturas
da chave que assina. O script de abertura não tem retentativa nem verificação de duplicidade; isso fica como melhoria.
