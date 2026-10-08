# 2026-10-07 — Proposta de arquitetura: backend, Seeker e IA, com plano em fases; nada decidido ainda

## Context

O pedido veio em inglês, com pedido de paralelismo máximo. Pedia:
- uma arquitetura de backend de ponta a ponta;
- a escolha da stack, com o porquê;
- a camada para o celular Solana Seeker (carteira móvel, Seed Vault, loja de dApps);
- uma camada de agentes de IA;
- um roteiro em quatro fases (0 a 3), com critérios e comandos de conferência;
- toda a documentação de arquitetura em inglês.

Onze agentes trabalharam em paralelo:
- **Seis leram o repositório:** o plano de negócio em duas metades, o resumo de produto, o roteiro, o código, a base de
  conhecimento e os registros de sessão.
- **Cinco pesquisaram fora:**
  - carteira móvel, Seed Vault e token do Seeker;
  - publicação na loja de dApps;
  - infraestrutura Solana;
  - ferramentas de IA;
  - regras de lojas e lei.

No meio do trabalho veio uma regra nova do usuário: "we will not mention bets or prediction markets, are just
'markets'". O produto passa a ser descrito só como mercados, com posição e participante.

A versão 0.1 passou por quatro revisões independentes: segurança, viabilidade, advogado do diabo e checagem de cada
citação. A 0.2 incorpora o que elas acharam e é a que fica no repositório.

## Decision

São **propostas**, não decisões do fundador. O plano técnico e o roteiro não mudaram.

1. **O desenho aprovado fica.** Fica o programa único, o keeper sem estado, o SQLite que se refaz da rede e a API só
   de leitura. Recusados agora, cada um com o gatilho que o traria de volta: PostgreSQL, Redis, indexador por gRPC,
   LangGraph e gRPC entre serviços. Os números do plano são pequenos (150 a 1.500 carteiras ativas no mês 3).
2. **Nenhum documento de negócio, de produto ou do roteiro pede app de celular ou agente de IA.** O Seeker aparece só
   numa fala da banca, registrada como ideia de hackathon a pesquisar. Por isso:
   - **IA:** o padrão é nenhuma até a rede principal, e a rota de chat herdada sai na Sprint 09.
   - **Seeker:** o canal espera o parecer jurídico.
3. **Uma coisa de celular não é opcional.** O site precisa registrar a carteira móvel do jeito explícito na Sprint 09.
   Hoje funciona por acaso, e atrás do repasse de RPC planejado pediria a rede principal em vez da devnet.
4. **Se o Seeker for adiante, o APK sai do `solana-mobile webshell`.** A Solana Mobile retirou o guia de TWA em
   11/9/2026, porque a nova regra de acesso à rede local do Chrome quebra a conexão da carteira. Os navegadores de
   dentro das carteiras (Phantom, Solflare) são o outro caminho real no celular e o único no iPhone. Eles serão testados
   nas Sprints 09 a 13.
5. **Preço:** fica a divisão do plano técnico.
   - A posição lê a conta patrocinada da Pyth.
   - A prova do SIM aceita qualquer conta com verificação completa, entregue em até 60 segundos.
   - A prova robusta exige a chave paga da Pyth (US$ 500 por mês no plano mais barato) antes da rede principal.
6. **Contratos de dados antes dos serviços.**
   - Os eventos passam a ser emitidos por chamada a si mesmo (`emit_cpi!`), com um decodificador que confere sucesso,
     programa e tabelas de endereço.
   - O SDK se divide em uma parte de leitura e uma de transação.
   - Uma trava no programa (`expected_position_total`) impede que uma nova tentativa abra uma segunda posição.
7. **Segurança do servidor.** Um usuário do sistema por serviço, segredos carregados como credencial, e o repasse de
   RPC como serviço próprio, com conta própria no provedor.
8. **Decisões para o fundador:** sete (D1 a D7) e o pedido do parecer jurídico (L0). A base da taxa (D1) precisa de
   resposta antes da Sprint 04, e nenhuma decisão trava a Sprint 02.

## Alternatives considered

- **A stack pesada que o pedido sugeria.** Recusada agora pela carga do plano. Fica a tabela de gatilhos.
- **TWA com Bubblewrap.** Recusado: guia retirado pela Solana Mobile e problema aberto ao reabrir o app no Seeker.
- **App nativo.** Só com gatilho medido: queda na conexão, notificação ou exigência de loja ou parceiro.
- **Ler a prova de preço só da conta patrocinada, sem chave.** Era a recomendação da 0.1. A revisão mostrou que um
  participante do lado NÃO com chave pode apagar um toque curto antes de o keeper provar. Voltou a divisão do plano.
- **Copiloto de IA que escreve a proposta de mercado.** Recusado pela revisão: o modelo escolheria a conta que a
  resolução lê, e isso fica a um passo da resolução. Se houver IA, a pessoa escreve a partir de uma lista revisada e o
  modelo só confere.
- **Agentes que assinam (Solana Agent Kit e parecidos), e IA na resolução.** Nunca.
- **Google Play e App Store.** Sem caminho hoje para operador sem licença, e nenhum para o Brasil.

## Consequences

- **A página no ar contradiz a regra de vocabulário.** O título, a descrição, o cabeçalho e o formulário da página
  inicial usam as palavras antigas, e a página de privacidade e o `/pitch2` também. É a primeira coisa da D6.
- **Achado de segurança que vale para o servidor de hoje.** O token do túnel do Cloudflare fica no ambiente de um
  processo que roda como o mesmo usuário do site provisório. Hoje o risco é baixo, porque o site não tem dependências.
  Cresce com cada serviço novo.
- **O plano de negócio pede o parecer jurídico como primeiro passo.** A primeira pergunta é se o pote se enquadra no
  que a MP 1.394 chama de "aposta de quota fixa". A proposta recomenda pedir agora, e não na Sprint 17.
- **A seção 6 da proposta lista as linhas do plano técnico e do roteiro que mudam se ela for aprovada.**

## O que deu errado no caminho

- **A versão 0.1 recomendava a prova de preço só pela conta patrocinada.** As revisões de segurança e do advogado do
  diabo acharam o ataque. Corrigido na 0.2.
- **A 0.1 citava linhas erradas em três lugares.**
  - O volume do mês 12 apontava para a linha do mês de equilíbrio.
  - A nota da França apontava para a linha da multa nos Estados Unidos.
  - O artigo 22 da MP estava descrito como multa ao operador, quando ela é dos provedores e das lojas.

  A checagem de fontes pegou os três.
- **A 0.1 chamava de "quatro decisões que travam a Sprint 02" algo que o próprio quadro de decisões contradizia.**
- **Um relatório de pesquisa acionou o filtro de injeção do Claude Code.** Ele citava o nome de um modo de permissão
  do SDK da Anthropic. Era só citação, e nada foi seguido.

## Follow-up

- **Fundador:** D1 a D7 e o pedido do parecer jurídico (L0).
- **Equipe, na abertura da Sprint 02:**
  - T4: `emit_cpi!`;
  - T9: o teste do Codama;
  - T10: a trava de posição;
  - T11: o campo neutro da taxa;
  - T12: as constantes de ensaio na devnet.
- **Sprint 06, com o dono do servidor:** um usuário por serviço e a troca do token do túnel.

## Fontes

`docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md`, Apêndice C (fontes externas lidas em 6 e 7/10/2026) e as citações
de arquivo ao longo do documento.
