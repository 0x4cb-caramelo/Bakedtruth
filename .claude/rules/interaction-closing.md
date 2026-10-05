# Fechamento de interação

Toda resposta ao fundador termina com duas partes, nesta ordem: **o que foi feito** e **os próximos passos**. Vale
para qualquer interação, da mais curta à mais longa.

Regra pedida pelo Lucas em 5/10/2026: "a cada interação comigo, quero que você finalize com um breve relatório do
que foi feito, num texto minimamente compreessível, e depois me diga quais os próximos passos, trazendo sugestões dos
caminhos, pensando o plano, e me dizendo qual seria a recomendação pra gente."

## 1. O que foi feito

Um relatório breve, que ele entenda sem ter acompanhado o trabalho.

- **Comece pelo resultado**, e não pela história de como se chegou nele.
- **Português simples.** Termo técnico só quando não há outro, e explicado na primeira vez. Sem rótulo interno, sem
  número de execução, sem nome de arquivo que ele não precise abrir.
- **Diga o que foi conferido e o que não foi.** "Passou nos testes" e "não rodei" são informações diferentes.
- **Diga o que deu errado**, inclusive erro seu, no mesmo tom do resto.
- **Diga o que mudou fora do repositório:** servidor, GitHub, domínio, qualquer serviço.
- **Proporcional.** Uma pergunta respondida pede uma ou duas linhas. Uma sprint fechada pede alguns parágrafos. Se
  o relatório passa de uma tela, está longo.

## 2. Os próximos passos

Depois do relatório, sempre.

- **Os caminhos possíveis**, de dois a quatro. Para cada um: o que ele entrega e o que custa ou arrisca.
- **Pensando o plano.** Os caminhos saem do roteiro (`docs/SPRINTS.md`), do que está em aberto (`CHANGELOG.md`, bloco
  "não lançado") e das decisões que só ele toma. Diga qual sprint ou qual pendência cada caminho move.
- **A recomendação.** Uma só, com o porquê em uma ou duas frases. Se a recomendação depende de uma resposta dele,
  diga qual.
- **O que depende dele.** Decisões, nomes, compras e acessos que travam algum caminho ficam listados à parte, para
  não se perderem no meio do texto.

## O que não fazer

- Não inventar caminho para parecer que há escolha. Se só um faz sentido, diga isso e diga por quê.
- Não repetir o relatório inteiro da interação anterior. O que não mudou cabe em uma linha.
- Não encerrar com pergunta vaga ("quer que eu continue?"). A recomendação já diz o que viria a seguir.
- Não esconder pendência antiga porque ela é incômoda. Se continua travando algo, continua na lista.

## Exemplo curto

> **O que foi feito.** Corrigi a conta da taxa no exemplo da página 3: estava com 3% e o certo é 10% do lado
> perdedor. Conferi os outros quatro exemplos do capítulo; estavam certos. Não mexi em mais nada.
>
> **Próximos passos.**
> 1. Seguir para a Parte 3 do plano. Entrega o capítulo de tokens; não depende de nada seu.
> 2. Rever antes a Parte 2 com a taxa nova. Evita retrabalho nas tabelas; atrasa a Parte 3.
>
> **Recomendo o 2**, porque três tabelas da Parte 2 usam a taxa antiga e a Parte 3 cita essas tabelas.
