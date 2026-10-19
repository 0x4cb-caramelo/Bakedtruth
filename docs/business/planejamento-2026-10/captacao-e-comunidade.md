# Captação e comunidade: a /welcome e a máquina de e-mails (resumo)

Resumo do documento vivo "Brot Markets — Plano de captação v2", de 19/10/2026, e das abas dele. A v1 (18/10) foi
refeita depois das respostas do Lucas: menos ressalvas, mais automação e o primeiro envio já na quarta, 21/10. Os
termos da rodada, as listas de contatos e os detalhes do envio ficam fora daqui (ver o README desta pasta).

## O funil

Todas as entradas levam a uma porta só, a /welcome, onde o Cacetinho recebe a pessoa e conduz cada perfil para um
pedido próprio.

| Perfil | O objetivo da apresentação | O pedido no fim |
| --- | --- | --- |
| Investidor | Convencer a investir: narrativa, timing, distribuição, ritmo de entrega (commits ao vivo) e o token | Conversa de 20 minutos na agenda do Bernardo e o papel do investidor |
| Projeto web3 | Proposta de uso: a comunidade do projeto numa pergunta que a rede responde | Propor a primeira campanha |
| KOL ou comunidade | Convite e hype: o que o criador ganha, o Levain, o beta | Vaga no beta e cargo no Discord |
| BD | Proposta de parceria: as faixas de comissão | Candidatura e conversa |
| Curioso ou baker | Apresentar e gerar hype | Testar no devnet, entrar no Discord, aviso de 17/11 |

Cada perfil tem uma apresentação de 6 a 8 telas, no motor do deck do `/pitch`, e um vídeo de 60 a 90 segundos feito
com o HyperFrames, renderizado fora do servidor. Quem chega por e-mail traz um código pessoal, e o Cacetinho já sabe o
nome e o perfil. Página e e-mails em inglês.

## A máquina

Tudo em código aberto, no servidor que já roda o site:

- **n8n**, o cérebro: importa, pontua, agenda os toques e avisa, com o estado de cada lead numa tabela própria;
- **Listmonk e o servidor de e-mail próprio**, que enviam com pixel e links rastreados por pessoa;
- **Umami**, com gravação de sessão, mapa de calor e funis, ligado ao código do lead;
- **NocoDB**, a tela do funil;
- **a /welcome**, que grava cada passo numa tabela de eventos.

Os alertas de lead quente vão por webhook a um canal privado do Discord. As respostas ao remetente (assinado "Brot
Markets Staff") são lidas pelo n8n, que tira da sequência quem respondeu.

## A cadência

Quatro toques em 14 dias por categoria, cada um com outro ângulo e na voz do Cacetinho, sem dizer de onde veio o
contato. Quem age na página sai da sequência fria e entra na trilha do seu perfil. O envio sobe em rampa, com teto
diário somado entre todas as campanhas e pausa automática se as devoluções ou os adiamentos passarem do limite. A
pausa tem roteiro de diagnóstico, correção e volta com metade do volume, e há um segundo domínio aquecido como plano B.

## O que conta como interesse

Abertura de e-mail quase não conta: o Apple Mail baixa o pixel de toda mensagem, o Gmail busca imagens por um
servidor próprio, e os filtros das empresas clicam nos links. O plano descarta cliques nos primeiros 10 segundos e
cliques num link-armadilha invisível, e só considera engajado quem age na página (digita o nome, escolhe o perfil, vê
telas). A pontuação vai de 1 ponto por abertura a 50 por agendamento; acima de 60 o lead é quente.

## Os quatro papéis e o mascote

- O plano de negócios v0.0.4 vira a fotografia de 8/10/2026. As fontes da verdade passam a ser quatro papéis com
  nomes de pão: **Cacetinho** (light paper, para bakers, contado pelo mascote), **Baguete** (white paper, para
  criadores e parceiros), **Pão de Forma** (yellow paper, para desenvolvedores e auditores) e **Croissant** (para
  investidores, só por pedido). Rascunho em português, depois em inglês.
- O mascote passou a se chamar **Cacetinho**, o pão do Rio Grande do Sul de onde vem a equipe (antes, Baked). A
  personalidade proposta está em [`../../product/cacetinho-personalidade.txt`](../../product/cacetinho-personalidade.txt).
  Trocar o nome no site, no guia da marca e no deck espera a palavra do Lucas.

## O cronograma

Sprints curtas de 19/10 a 17/11: a base no servidor, o primeiro envio em 21/10, a automação completa antes dos toques
2, o conteúdo e o Discord até 30/10, a escala até 6/11 e o lançamento em 17/11.
