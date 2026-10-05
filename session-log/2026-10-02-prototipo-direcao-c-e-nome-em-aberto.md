# 2026-10-02 — Protótipo: direção C aprovada, nome do site em aberto

## Context

O projeto entrou no AI Dev OS com código já escrito, então a Fase 2 (Ideação) não rodou: não existe BP v0.0.2. O
pedido foi redesenhar o site na direção de `docs/product/baked-home.html`, aproveitando efeitos no estilo do Aceternity
UI, canvas e WebGPU, com o mascote Baked se movendo entre lugares fixos da página, e ver isso num Prototype Lab antes
de mexer no app.

O lab foi construído a partir do programa existente, da página de referência e de
`knowledge-base/briefing-ideacao-nome-e-mascote.md`, com três direções sobre os mesmos dados e a mesma lógica:
A · Ledger, B · Oven e C · Tape.

## Decision

1. **Direção C ("Tape") aprovada pelo Lucas em 2 de outubro** ("vamos de C"), registrada em
   `docs/product/DESIGN-DIRECTION.md`.
2. **Nome do site deixado em aberto.** A pesquisa chegou a dois finalistas, Ovenproof e Baked Markets. "baked" segue
   como nome de trabalho. O mascote se chama Baked e isso não muda.
3. **O mascote não segue o cursor livremente.** A página declara poleiros (`data-perch`) e ele salta para o mais próximo
   de onde o ponteiro parou.

Esta decisão foi reaberta no dia seguinte: ver
[`2026-10-03-lab-de-d-a-m-e-direcao-reaberta.md`](2026-10-03-lab-de-d-a-m-e-direcao-reaberta.md).

## Alternatives considered

- **A · Ledger:** a grade de cards mostra mais informação por mercado e é a mais próxima das convenções de Kalshi e
  Polymarket.
- **B · Oven:** a redação "done / not done" é a mais clara para quem não é de cripto; o shader WebGPU é o efeito de
  fundo mais marcante.
- **Fonte Pixelify Sans na C:** descartada porque os algarismos eram ambíguos ("20%" lia como "80%"); trocada por
  Jersey 15.
- **Nomes descartados** (Bakeoff, Breadcrumb, Welldone, Bakemark e outros): motivos em
  `knowledge-base/pesquisa-nome-do-site.md`.

## Why this decision

O dono do projeto não registrou os motivos da escolha. Leitura de quem construiu os protótipos, a confirmar: a C era a
única em que mascote e interface falavam a mesma língua (pixel art) e a única que não parecia mais um clone de
Polymarket; o formato de placar casa com um produto que mostra números lidos da chain.

O nome ficou em aberto porque nenhum dos dois finalistas é claramente melhor: Ovenproof não colide com nada em cripto
mas não tem o `.com`; Baked Markets tem o `.com` e carrega as colisões de "baked".

## Risks

- A escolha não está ancorada em personas nem em posicionamento, porque não há Business Plan.
- A pesquisa de nome não consultou nenhuma base de marcas (INPI, USPTO).
- Só existe tema escuro, e o `DESIGN-DIRECTION.md` lista quinze lacunas que o protótipo implica e não mostra.

## Follow-ups

- Escolher o nome e trocá-lo em `app/lib/brand.ts` e nos documentos.
- Consultar bases de marcas antes de fechar o nome.
- Decidir se a Fase 2 (BP) será feita depois ou registrada como pulada.

## Related links

- Direção: [`docs/product/DESIGN-DIRECTION.md`](../docs/product/DESIGN-DIRECTION.md)
- Pesquisa de nome: [`knowledge-base/pesquisa-nome-do-site.md`](../knowledge-base/pesquisa-nome-do-site.md)
- Lab: [`prototype-lab/README.md`](../prototype-lab/README.md)
- Sprint: —
