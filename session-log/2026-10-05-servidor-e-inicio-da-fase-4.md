# 2026-10-05 — Espaço no servidor compartilhado e início da Fase 4

## Context

Com o BP v0.0.2 fechado, o Lucas pediu: "vamos levar este projeto pro nosso VPS, sem mexer no projeto que tem lá, e
vamos já começar a montar e pensar todo o plano de sprints (ignorando qto tempo falta), começando pelo backend e
smart conctrans na devnet, para que a gente possa juntar e conectar, e fazer o front com base no ledger2, que já
decidimos". Ele indicou onde achar o acesso: o token do Cloudflare numa pasta de outro projeto ("acho que o
/startup-se, provacvelmente") e o servidor do projeto em `F:\AceleradoraECO\agenttokenfy`.

## Decision

1. **Reconhecimento só de leitura antes de qualquer mudança.** A pasta `/startup-se` não existe; o token está em
   `agenttokenfy/.aios/secrets/cloudflare.env`. O servidor é o do atalho de SSH `agent-rails-vps`: 2 processadores,
   8 GB, Ubuntu 22.04, dividido entre os projetos `ash` (site e email) e `agent-rails` (painel e banco).
2. **O Brot Markets ganhou um espaço isolado, no padrão do vizinho:** usuário de serviço `brot` sem login, sem docker
   e sem sudo; `/srv/brot-markets` com um repositório Git que recebe pacotes e uma cópia de trabalho;
   `/etc/brot-markets` vazia. O código chegou como pacote do Git pelo SSH do Lucas, no commit `3222acb`.
3. **Nada além disso foi tocado.** Nenhum pacote instalado, nenhuma porta aberta, nenhum serviço ligado, nenhum
   túnel e nenhum registro de DNS. Depois da criação, os serviços dos dois vizinhos seguiam de pé.
4. **O plano de sprints segue a ordem do método.** Antes do roteiro vêm o documento de design, o resumo de produto e
   o plano técnico. O `DESIGN-DIRECTION.md` foi reescrito para a Ledger² escura e clara, e o `PRODUCT-BRIEF.md` foi
   escrito, os dois no mesmo dia. O plano técnico e o roteiro vêm em seguida.
5. **A ordem de construção pedida pelo Lucas vai para o roteiro:** programa e backend na devnet, depois a ligação,
   depois o front em Ledger².

## Alternatives considered

- **Instalar Rust, Solana e Anchor no servidor já.** O servidor não tem compilador, e instalar exige pacotes do
  sistema numa máquina que entrega email e serve o painel de outro projeto. Uma compilação em Rust ocupa os dois
  processadores por minutos. Ficou para o plano técnico decidir entre contêiner com limite, integração contínua ou
  máquina de desenvolvedor.
- **Publicar o site ou o protótipo num endereço.** O domínio `brot.markets` não está na conta do Cloudflare nem
  responde no DNS, e publicar é decisão do Lucas. Nada foi publicado.
- **Usar o túnel do Cloudflare que já existe.** Ele é do outro projeto. A recomendação é um túnel próprio.
- **Escrever o roteiro de sprints direto, sem o resumo de produto e o plano técnico.** Seria mais rápido, e a regra
  do projeto proíbe: o roteiro sem esses dois documentos ordena trabalho que ninguém definiu.
- **Clonar do GitHub no servidor.** Exigiria deixar uma credencial lá. O pacote do Git pelo SSH não deixa nada.

## Why this decision

O servidor é dividido e tem dono dos dois lados. O manual do vizinho pede aviso antes de reinício, atualização do
sistema e mudança de firewall, e separa cada projeto por usuário e por pasta. Criar um usuário e três pastas não
afeta os vizinhos e se desfaz com dois comandos; instalar compilador e ligar serviços afeta, e depende de decisões
que o plano técnico ainda vai tomar.

## Risks

- **O protótipo é anterior ao produto.** O documento de design lista 19 conflitos entre o que as telas mostram
  (preço, comprar e vender, resgate) e o pote decidido. O visual vale; várias telas precisam de conteúdo novo.
- **O resumo de produto tem 25 lacunas** que nem o plano nem o protótipo decidem. As mais pesadas: o idioma do site,
  a tela de "minhas apostas", a aposta mínima, a fórmula da pontuação da devnet e o canal público de contestação.
- **Três contradições entre partes do plano**, que o resumo de produto resolveu seguindo a decisão mais recente: a
  indicação e o patrocínio pago entram antes da rede principal, e não no primeiro mês de devnet.
- **O Ronaldo tem acesso ao mesmo servidor** e não foi avisado por mim. Cabe ao Lucas.
- **O usuário `lucas` do servidor está no grupo do docker e tem sudo sem senha.** Quem usa esse acesso consegue mexer
  em tudo; a separação por usuário de serviço protege contra o programa, não contra o operador.
- **O domínio não existe na conta.** Sem ele não há endereço público.

## Follow-ups

- Plano técnico (`docs/technical/TECHNICAL-PLAN.md`) e roteiro de sprints (`docs/SPRINTS.md`).
- O Lucas responde: o domínio foi comprado; o Ronaldo sabe do servidor; túnel próprio ou o existente.
- Escolher o provedor do segundo serviço agendado.
- Atualizar a cópia do código no servidor quando os documentos da Fase 4 estiverem fechados.

## Related links

- Levantamento do servidor e do Cloudflare: [`knowledge-base/tecnologia/servidor-e-dominio.md`](../knowledge-base/tecnologia/servidor-e-dominio.md)
- Documento de design: [`docs/product/DESIGN-DIRECTION.md`](../docs/product/DESIGN-DIRECTION.md)
- Resumo de produto: [`docs/product/PRODUCT-BRIEF.md`](../docs/product/PRODUCT-BRIEF.md)
- Entrada anterior: [`2026-10-05-bp-v0.0.2-taxa-decidida-e-partes-corrigidas.md`](2026-10-05-bp-v0.0.2-taxa-decidida-e-partes-corrigidas.md)
- Sprint: —
