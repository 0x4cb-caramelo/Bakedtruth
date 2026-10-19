# A máquina de captação em código aberto: ferramentas e limites

Pesquisa de 19/10/2026, para o plano de captação v2. Servidor de referência: 2 vCPU, 8 GB (cerca de 6 GB livres),
Docker, tráfego HTTP pelo túnel da Cloudflare. **[F]** = fato com fonte; **[I]** = inferência.

## As ferramentas

| Ferramenta | O que faz no plano | Licença e versão | O que observar | Fonte |
| --- | --- | --- | --- | --- |
| HyperFrames (HeyGen) | Os vídeos de cada perfil, escritos em HTML | Apache-2.0, v0.8 (várias versões por dia) | Pede Node 22 e FFmpeg; renderizar fora do servidor; fixar a versão | [GitHub](https://github.com/heygen-com/hyperframes) |
| n8n | O cérebro: importa, pontua, agenda e avisa | Sustainable Use License (uso interno), v2.43 | Execuções paradas por dias pesam no banco: guardar o estado numa tabela própria e rodar a cada 10 minutos | [GitHub](https://github.com/n8n-io/n8n), [Wait](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/) |
| Listmonk | Envio com pixel e links rastreados por pessoa | AGPL-3.0, v6.2 | Não avisa aberturas nem cliques por webhook: ler o banco dele; não faz sequências sozinho | [GitHub](https://github.com/knadh/listmonk), [modelos](https://listmonk.app/docs/templating/) |
| Umami | Gravação de sessão, mapa de calor, funis e identificação do lead | MIT, v3.4 | Grava 15% das sessões por padrão: subir para 100% | [GitHub](https://github.com/umami-software/umami), [identify](https://docs.umami.is/docs/guides/identify-logged-in-users) |
| NocoDB | A tela do funil sobre a tabela de leads | Sustainable Use License | Tem nó pronto no n8n | [n8n](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.nocodb/) |

Pesadas demais para esse servidor: PostHog (pede 4 vCPU e 16 GB) e OpenReplay (Kubernetes). Os mapas de calor do Matomo
são um plugin pago. Twenty, como CRM, pede pelo menos 2 GB **[F]**.

## O que dá para medir de um e-mail

- O Apple Mail baixa o pixel de toda mensagem, aberta ou não
  ([Twilio](https://static1.twilio.com/docs/sendgrid/for-developers/tracking-events/understanding-apple-mail-privacy-protection-and-open-events)).
- O Microsoft Safe Links confere os links antes da entrega
  ([Microsoft](https://learn.microsoft.com/en-us/defender-office-365/safe-links-about)).
- Por isso, abertura é sinal fraco. O plano descarta cliques nos 10 primeiros segundos e cliques num link-armadilha
  invisível, e conta como interesse o que a pessoa faz na página **[I]**.
- O Gmail exige SPF ou DKIM, DNS reverso, TLS e reclamação abaixo de 0,3% de todo remetente, e DMARC e descadastro em um
  clique acima de 5 mil mensagens por dia ([Google](https://support.google.com/a/answer/81126)).

## A lição de outro projeto da casa

Um sistema parecido, num servidor de outro projeto, enviou e-mail frio em volume pelo IP do próprio servidor e
queimou a reputação do domínio em julho de 2026: o Gmail passou a recusar, e até os e-mails do produto atrasaram horas.
O plano do Brot tira três regras disso: teto diário somado entre todas as campanhas, pausa automática por devolução e
adiamento, e um segundo domínio aquecido como plano B.
