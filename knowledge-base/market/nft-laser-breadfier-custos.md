# Laser Breadfier: quanto custa transformar uma foto num NFT de pãozinho

Pesquisa de 19/10/2026. A equipe fotografou quem estava no The/Garage da Superteam Brasil, em São Paulo, e transformou
cada pessoa num pãozinho. A ideia é uma coleção por evento (The/Garage e Island DAO) e, depois, o app aberto. SOL a
US$ 105,28 (CoinGecko, 19/10). **[F]** = fato com fonte; **[I]** = inferência.

## Cunhar na Solana

| Padrão | Custo por NFT | Fonte |
| --- | --- | --- |
| Metaplex Core | ~0,003 SOL (taxa de 0,0015 mais ~0,0015 de depósito), ~US$ 0,32 | [Metaplex](https://www.metaplex.com/docs/smart-contracts/core/create-asset) |
| Token Metadata (o antigo) | ~0,022 SOL, ~US$ 2,32 | [Metaplex](https://www.metaplex.com/docs/smart-contracts/core/tm-differences) |
| Comprimido (Bubblegum v2) | ~0,0001 SOL por NFT, mais a árvore (0,34 SOL para 16 mil) | [Metaplex](https://www.metaplex.com/docs/smart-contracts/bubblegum-v2/faq) |

Para algumas centenas de peças, o Core é mais simples e aparece melhor nas carteiras; o comprimido só compensa a partir
de milhares **[I]**.

## Guardar a imagem para sempre

- Arweave: ~US$ 0,05 por MiB em 19/10. Uma imagem de 1024x1024 em WebP (150 a 400 KB) custa ~US$ 0,015 **[I]**.
- O ArDrive Turbo aceita USDC na Solana e tem uploader para o Metaplex.
- Os endereços antigos da Irys que mandam arquivos para o Arweave deixam de funcionar em 1/11/2026
  ([Irys](https://docs.irys.xyz/build/d/migrating)).

## Gerar a imagem

| Modelo | Preço por imagem | Fonte |
| --- | --- | --- |
| Gemini 3.1 Flash Image | US$ 0,067 (1K) | [Google](https://ai.google.dev/gemini-api/docs/pricing) |
| gpt-image-2, modo médio | US$ 0,053 (1024x1024) | [OpenAI](https://developers.openai.com/api/docs/guides/image-generation) |
| FLUX.1 Kontext pro | US$ 0,04 | [fal.ai](https://fal.ai/models/fal-ai/flux-pro/kontext) |

Com três tentativas por pessoa, ~US$ 0,20. Óculos, cabelo, tom de pele e foto em grupo pedem nova geração: testar o
estilo em 30 rostos antes de escolher o modelo **[I]**.

## Quanto custa e quanto sobra

| Opção | Custo por unidade | Margem |
| --- | --- | --- |
| Coleção de evento a US$ 5, paga em USDC ou SOL | ~US$ 0,55 | 89% |
| App a US$ 10, pago em cripto | ~US$ 0,55 | 94% |
| App a US$ 10, geração grátis e cunhagem paga, com 10% de quem gera comprando | ~US$ 2,35 | 77% |
| O mesmo, com 5% comprando | ~US$ 4,35 | 57% |
| App a US$ 10, cartão brasileiro (Stripe, 3,99% mais R$ 0,39) | ~US$ 1,00 a 1,20 | 88% a 90% |

## O mercado, sem ilusão

- O volume de NFTs na Solana caiu de US$ 233,9 mi em janeiro de 2024 para US$ 6 mi em setembro de 2026, pela DefiLlama
  citada [aqui](https://cryptodiffer.com/feed/project-updates/nft-market-2026-marketplaces-survival).
- Pessoas pagam por uma imagem personalizada de si mesmas: o Lensa vendeu avatares de US$ 3,99 a 7,99 e teve um pico
  passageiro ([TechCrunch](https://techcrunch.com/2022/12/01/lensa-ai-climbs-the-app-store-charts-as-its-magic-avatars-go-viral)).
- Colecionáveis de evento costumam ser grátis **[I]**. US$ 5 a 10 se sustentam pelo que o NFT dá (cargo no Discord,
  Crumbs a mais, prioridade no beta), não por revenda.

## A recomendação do plano

Coleção de evento a US$ 5, como lembrança e prova de presença; app aberto a US$ 10, com geração grátis com marca
d'água, limite de três por dia por carteira e cunhagem paga; Metaplex Core; o @ do X de cada pessoa, com permissão,
para marcar nos posts.
