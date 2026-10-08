# Brot — poses para animação

17 artes individuais em PNG RGBA transparente, cada uma nas pastas `small` (440 × 280) e `large` (1200 × 800).

Os números correspondem à lista original. Poses laterais olham para a direita; use `scaleX(-1)` para inverter. Os arquivos ficam apoiados na última linha do quadro; nas poses aéreas, mova o quadro inteiro pela trajetória. Não recorte automaticamente a transparência, pois o quadro fixo faz parte do posicionamento.

Corrida: alternar 03 e 04; ambos têm o mesmo retângulo de cabeça, linha de pescoço e base, registrados no manifest. Sugestão inicial: 180 ms por quadro, ajustável à velocidade da cena. A prévia GIF é apenas demonstração sobre fundo escuro.

Apontar: 09 → 10 → 11. Comer: 12 → 13; objeto: 14 → 15. Cortina: 16 → 17. Corda e slides ficam no código; não estão desenhados nos PNGs.

Adesivo vazio: 01, com cavidade transparente e etiqueta brot.markets. Esse contorno deriva do adesivo de braços cruzados usado como referência nesta sessão. Sobreponha à versão cheia correspondente e alinhe seus limites visíveis.

Exportação com nearest-neighbor e cobertura alpha binária para contornos nítidos, sem suavização. As poses são quadros-chave; deslocamentos e transições pertencem à animação. `manifest.json` informa dimensões e âncoras; `prompts.json` registra as instruções de geração.

## As poses que já existiam (acrescentado em 7/10/2026)

As oito poses anteriores e as duas peças prontas foram trazidas para as mesmas duas pastas, com o prefixo `e` (de
"existente"), para a biblioteca ficar num lugar só. Os arquivos de origem não foram apagados nem alterados.

| Arquivo | Pose | De onde veio a pequena | De onde veio a grande |
|---|---|---|---|
| `e01-neutro` | Em pé, olhos redondos | `prototype-lab/shared/mascot/deadpan.png` | imagem do deck (`baked-standing`) |
| `e02-cetico` | Mão no queixo | `skeptical.png` | a pequena, ampliada |
| `e03-impaciente` | Braços cruzados | `impatient.png` | imagem do deck (`baked-arms-crossed`) |
| `e04-batendo-o-pe` | Mãos na cintura | `tapping.png` | imagem do deck (`baked-hips`) |
| `e05-cansado` | Sentado, olhos fechados | `tired.png` | a pequena, ampliada |
| `e06-emburrado` | Sentado, abraçando os joelhos | `sulking.png` | imagem do deck (`baked-sit-grumpy`) |
| `e07-aprovando` | Joinha | `approve.png` | a pequena, ampliada |
| `e08-apontando` | Braço esticado para a direita | `point.png` | a pequena, ampliada |
| `e09-adesivo-cheio` | O adesivo com o pão dentro | a grande, reduzida | imagem do deck (`baked-sticker`) |
| `e10-selo` | O selo Proof > Promises | a grande, reduzida | imagem do deck (`badge-proof`) |

**O que foi arrumado na posição.**

- **Pequenas:** já estavam no padrão (440 × 280, pés na última linha, centralizadas). Foram copiadas como estavam.
  São cerca de 10% menores dentro do quadro que as 17 novas; não foram ampliadas, para não borrar o pixel.
- **Grandes:** cada uma tinha um quadro diferente e sobra embaixo dos pés. Foram recortadas no contorno visível,
  levadas à altura do quadro (1200 × 800) e apoiadas na última linha, centralizadas, como as novas.
- **Quatro grandes vieram da pequena ampliada** (cético, cansado, aprovando, apontando): o pixel fica mais grosso que
  nas grandes nativas. Servem de reserva; se forem para a tela em tamanho grande, vale redesenhar.
- **`e09-adesivo-cheio` foi ajustado ao contorno do `01-adesivo-vazio`**, pixel a pixel nos limites visíveis, para
  um poder trocar pelo outro sem a imagem pular. É o par usado na capa do deck.

**O que o deck usa.** As 17 novas, o `e01-neutro`, o `e07-aprovando` (no slide de criadores) e o
`e09-adesivo-cheio`, convertidos para WebP. Desde 8/10/2026 o deck no ar é o v4, em `services/landing/public/pitch/img/`
(o `/pitch3` foi para `services/landing/history/pitch-3/`). O nome de cada pose no código está em
`public/pitch/sprites.js`; a de joinha é citada direto na página.

**O que não está aqui.** O `manifest.json`, o `prompts.json` e a prévia em GIF citados acima não vieram com as
imagens. Os pontos de encaixe usados pelas cenas (o punho na pose pendurada, o punho na corda da cortina) foram
medidos nos próprios desenhos e estão anotados nos arquivos das cenas.
