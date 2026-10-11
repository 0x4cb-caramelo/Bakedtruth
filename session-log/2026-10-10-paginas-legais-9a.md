# 2026-10-10 — As páginas legais da resposta 9a: os termos fora do ar e a privacidade corrigida

## Context

A revisão jurídica da Sprint 13 (`docs/legal/2026-10-10-sprint-13-legal-review.md`, item M5) achou as páginas
`brot.markets/terms` e `brot.markets/privacy`, no ar desde 8/10, descrevendo o produto anterior. Os termos falavam em
USDC, pagamento automático com pior caso de 55 horas e poderes da equipe diferentes dos de `/record`. A privacidade
prometia "No profiles", prometia apagar a cópia da atividade de uma carteira e dizia que o navegador guarda só o tema.
O rodapé do site novo não linkava privacidade nenhuma.

O fundador respondeu 9a: tirar `/terms` do ar até a Sprint 17, corrigir `/privacy` mantendo o formulário de saída da
lista de espera, e linkar a privacidade no rodapé do site antes de ele ser público. O texto se prepara no repositório,
e a publicação da landing é do fundador. Depois de mesclar o PR #64, o Ronaldo pediu: "merge #64 and start the 9a legal
pages PR".

## Decision

### 1. Os termos

- `public/terms.html` deixou de ser gerado e servido, e `/terms` responde 404. Uma página de texto no lugar dos termos
  poderia ser lida como termos; um 404 não promete nada.
- Saíram os links para `/terms` do rodapé da página inicial, do `/2` e da privacidade, e também do menu e do rodapé do
  docs.brot.markets. Três frases do wiki que citavam seções dos termos antigos foram tiradas.
- `docs/legal/TERMS-OF-SERVICE.md` fica como registro do que foi publicado, com uma nota dizendo que não está no ar.
- A privacidade citava "the Terms, section 2" para a idade e a lista de países. Agora diz "adults, 18 and over", e a
  checagem de país, que só valerá com dinheiro real, não aponta mais para os termos.
- Testes: nenhuma página da landing aponta para `/terms`, a página não existe e o servidor responde 404.

### 2. A privacidade

O que mudou, cada item conferido no código:

- **Campanhas no lugar de mercados.** O dado da campanha é a carteira e as entradas na Solana, públicas e
  permanentes. A cópia que o servidor guarda fica em memória, nunca em disco: some quando o serviço reinicia.
- **O ranking do devnet.** O que ele mostra (endereço, pontos, campanhas em que entrou; sem valores, sem taxa de
  acerto); que é calculado no servidor e que a página acha a linha da carteira no navegador; como sair (mensagem no X,
  assinatura da carteira, resposta em até 15 dias, resposta 8a); e a lista de quem saiu, guardada no servidor.
- **O que o site novo guarda no navegador:** o tema, o nome da carteira usada por último, as campanhas salvas, o
  registro de uma entrada em andamento (apagado um dia depois de ela se resolver) e, só na aba aberta, quantas vezes a
  página recarregou à espera de uma atualização do programa. Nada disso é enviado.
- **Quem mais vê dados:** o serviço de RPC, que vê o IP e, ao ler saldo e entradas, a carteira; e o X, por onde chegam
  denúncias e pedidos de saída do ranking.
- **"No profiles" virou "No profiles of people"**, com o que o ranking mostra, e o pedido de apagar a cópia da
  atividade virou a explicação de que não há cópia em disco para apagar.

O que não mudou: a frase de propósito da lista de espera, porque mudá-la seria mudar o consentimento (plano técnico,
§8.1), e por isso o "markets" dela ficou; o formulário de saída; os 12 meses; os nomes dos fundadores; e o "No
cookies", conferido na landing no ar, que não manda `Set-Cookie`.

A frase antes da primeira entrada (`SHEET.public`) passou de "appears" para "can appear" no ranking, porque desde a
resposta 3a nem toda entrada do lado vencedor pontua. A privacidade repete essa frase.

### 3. O rodapé do site novo

O endereço da privacidade (`PRIVACY_URL`) ficou em `app/lib/config.ts`, e não num arquivo de texto do site: o teste de
vocabulário barra "markets" em qualquer arquivo de texto, e um domínio é configuração, não texto. O rótulo "Privacy"
ficou em `copy-site.ts`. A lista de avisos obrigatórios ganhou o link, e o smoke web confere o rodapé em toda rota.
Quando o site novo assumir o endereço da landing, a página e o formulário precisam vir para ele (plano técnico, §8.1).

### 4. O docs.brot.markets

O site de documentação ainda descreve o produto anterior: USDC, mercados, o ganho de quem abre, uma equipe que anula.
Daqui só saíram os links para os termos. Tirar o site do ar, ou reescrevê-lo, é decisão do fundador, e foi perguntado.

### 5. A revisão jurídica do texto

Uma revisão independente (rascunho para o advogado, não parecer) conferiu cada frase contra o código: a frase de
propósito da lista de espera ficou idêntica, o ranking não recebe carteira nenhuma, a lista de quem saiu é aplicada
antes do ranking, os logs não guardam email, carteira nem IP, e o que o navegador guarda bate com o código. Achou dois
problemas que já estavam na página de 8/10:

- **O IP não era esquecido em um minuto.** O limitador da landing só limpava endereços vencidos quando o mapa
  enchia, então um endereço ficava na memória até o serviço reiniciar. Corrigido no código, não no texto: o servidor
  agora varre os endereços vencidos a cada 10 segundos, e um teste confere.
- **"We keep no backup copy" não estava conferido.** O servidor é um Hostinger KVM 2, e a Hostinger oferece backups
  semanais. A página agora diz que a Brot não guarda outra cópia e que o provedor pode guardar backups do servidor por
  um tempo limitado. Se eles estão ligados, e por quanto tempo, quem vê é o fundador, no painel.

Aplicado também: o registro da lista de espera tem quatro campos, e não três (o quarto é de qual formulário veio); a
página nomeia a Hostinger, o RPC do devnet e o que a Cloudflare vê (inclusive o que se digita nos formulários); diz a
base legal do ranking e do uso do IP (o interesse legítimo, a confirmar com o advogado), que os dados saem do país, que
pedir no X liga a conta do X à carteira, e que sair do ranking não esconde a carteira na página de uma campanha; e saiu
a checagem de país, que não existe. Saíram os links para `/terms` que restavam no README e na prévia das telas em
`/dev0x/`.

Ficam com o fundador, por serem decisões ou acessos dele: conferir os backups da Hostinger; um email de contato (quem
está na lista de espera deu um email, não uma conta do X) e se o prazo de 15 dias vale para todo pedido; apagar a
conversa no X depois de atender um pedido de saída do ranking; uma linha "18 anos ou mais" no site novo, já que ela
morava nos termos; e o que o painel da Cloudflare guarda e se ele põe cookies (C13).

### 6. Depois da mescla: os detalhes do fundador

Com o PR #65 mesclado, o Ronaldo respondeu o que a revisão jurídica deixou com ele: os backups da Hostinger estão
ligados e guardam 30 dias; o contato é gm@brot.markets; 15 dias valem para todo pedido; a conversa no X é apagada
depois de um pedido de saída do ranking; o site novo ganha uma linha de 18 anos no rodapé; a Cloudflare guarda os
registros básicos por até 7 dias; e o docs.brot.markets sai do ar. A mensagem veio colada, e por isso o assistente
pediu a confirmação dele com as próprias palavras antes de mesclar e publicar fatos novos na página; ele confirmou.

- **O email.** O domínio brot.markets não tem registro MX nem SPF: hoje um email para gm@brot.markets volta. A
  página já dá o endereço, e o roteamento (o Email Routing da Cloudflare, por exemplo) vem antes de publicar a landing.
  O Ronaldo disse que cuida disso.
- **O docs.brot.markets** responde 410 em todo endereço, com uma linha de texto e sem nenhuma página antiga. Um 404
  sugeriria um endereço errado; o 410 diz que saiu do ar. As páginas e o gerador ficam no repositório para a reescrita.
- **A linha de 18 anos** está no rodapé de toda página do site novo e na lista de avisos obrigatórios; o smoke web a
  confere em toda rota.

## Consequences

- Quando o fundador publicar a landing, `/terms` some e a privacidade nova entra no ar. A própria página promete um
  post no X quando muda, e promete mudar antes de coletar algo novo: por isso a landing e o post vêm antes de a API do
  ranking ir ao ar.
- Com a privacidade publicada e linkada, a última condição da revisão de privacidade para o ranking ir ao ar fica
  cumprida. Falta reimplantar a API.
