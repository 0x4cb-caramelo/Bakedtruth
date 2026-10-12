# O que o Cloudflare registra de quem visita o site (C13)

Levantamento de 10 de outubro de 2026, na Sprint 13, para a revisão de privacidade do ranking e do canal de denúncia
(gate 5). Lido nas páginas do próprio Cloudflare; nada foi aberto no painel da conta, que é do fundador.

## Fatos, com fonte

1. **O Cloudflare trata o IP de quem visita.** A política de privacidade, em vigor desde 4/11/2025, diz que os dados
   tratados de quem acessa o site de um cliente ("End Users") "may include but is not limited to IP addresses, traffic
   routing data". [CF-PP]
2. **O dono do site vê esses dados no painel.** A mesma política chama de "Customer Logs" "the End User data that we
   make available to our Customers via the Service dashboard". [CF-PP]
3. **O Cloudflare se diz operador desses dados, e não controlador.** "Cloudflare is a data processor for any of the
   content provided by Customers and End Users", e "Cloudflare has no direct relationship with End Users". [CF-PP]
4. **Não há prazo de guarda escrito para esses registros.** A política diz só que guarda dados pessoais "for a period of
   time that is consistent with the business purposes"; o prazo de 25 horas que ela cita é do resolvedor 1.1.1.1, outro
   produto. [CF-PP]
5. **O envio dos registros de cada pedido (Logpush) vale agora também no plano gratuito,** cobrado por uso: "Logpush is
   available with self-service, usage-based pricing on Free, Pro, and Business plans" (página atualizada em
   2/10/2026). [CF-LP] Documentação mais antiga dizia que era só do plano Enterprise; a página de preços é a mais nova.
6. **A zona `brot.markets` está no plano gratuito** (consulta à API do Cloudflare em 5/10/2026,
   `servidor-e-dominio.md`).
7. **A zona tenta injetar o script de estatísticas do Cloudflare** (visto em 5/10/2026); a CSP do site o bloqueia, e
   desligá-lo no painel espera o fundador (`CHANGELOG.md`, itens em aberto).

## Inferências

- Todo pedido ao site e à API passa pelo Cloudflare com o IP de quem visita e o endereço pedido. Por isso nenhum
  endereço pedido pelo site leva a carteira de quem visita: o ranking é lido inteiro e a linha da carteira é achada no
  navegador (Sprint 13). [INFERÊNCIA a partir dos fatos 1 e 2]
- Os pedidos de RPC do navegador (as leituras da rede, "My entries" incluído) vão direto ao provedor de RPC, hoje o
  público do devnet, sem passar pelo Cloudflare; ali a carteira e o IP aparecem juntos, risco já registrado no plano
  técnico (§7.3) para o relay da Sprint 08.

## Em aberto (do fundador, no painel)

- Se o Logpush, o Instant Logs ou o Log Explorer estão ligados na conta. Pelo repositório, nenhum foi configurado
  [A CONFERIR].
- ~~Quanto tempo o painel mostra os registros de pedidos nesse plano.~~ **Lido pelo fundador no painel em
  10/10/2026:** a Cloudflare guarda os registros básicos de acesso por até 7 dias. A página de privacidade diz isso.
- Desligar a injeção do script de estatísticas na zona.

## Fontes

- [CF-PP] Cloudflare, Privacy Policy, "effective as of November 4th, 2025": https://www.cloudflare.com/privacypolicy/
  (lida em 10/10/2026).
- [CF-LP] Cloudflare Docs, Logpush pricing, "Last updated Oct 2, 2026":
  https://developers.cloudflare.com/logs/logpush/pricing/ (lida em 10/10/2026).
