import Header from "../../components/layout/Header";

const FAQ_SECTIONS = [
  {
    title: "Sobre o FINANCE",
    items: [
      {
        q: "O que é o FINANCE?",
        a: "Um organizador financeiro pessoal. Ele ajuda a registrar, categorizar e visualizar receitas, despesas, orçamento e metas — não é um banco nem uma carteira digital.",
      },
      {
        q: "O FINANCE movimenta dinheiro de verdade?",
        a: "Não. Nenhum pagamento, PIX, transferência, compra, investimento ou cobrança real é processado pela plataforma. Tudo que você vê é organizado a partir de dados informados manualmente.",
      },
    ],
  },
  {
    title: "Contas e cartões",
    items: [
      {
        q: "Contas e cartões estão conectados ao meu banco?",
        a: "Não. São registros representativos que você cria e atualiza manualmente, para organizar de onde vêm as receitas e despesas.",
      },
      {
        q: "Como funciona a fatura do cartão?",
        a: "O valor da fatura atual é digitado por você no cadastro do cartão. Você também pode lançar compras parceladas em Cartões → Compras, informando o valor mensal e em quantas vezes a compra foi dividida — o total mensal comprometido é somado automaticamente.",
      },
    ],
  },
  {
    title: "Orçamento e metas",
    items: [
      {
        q: "Como o orçamento é calculado?",
        a: "Você define um limite geral e, opcionalmente, limites por categoria em Orçamento. A utilização é sempre calculada a partir das despesas já lançadas em Transações, nunca digitada manualmente.",
      },
      {
        q: "O que acontece quando registro um aporte em uma meta?",
        a: "O aporte apenas soma ao valor já guardado da meta — é um registro de planejamento, nunca uma transferência real entre contas ou cartões.",
      },
    ],
  },
  {
    title: "Alertas e preferências",
    items: [
      {
        q: "De onde vêm os alertas?",
        a: "Todos os alertas são recalculados a partir do orçamento e das metas já cadastrados (limite próximo/excedido, meta concluída ou perto do prazo). Nada é armazenado separadamente.",
      },
      {
        q: "Posso desligar algum tipo de alerta?",
        a: "Sim, em Configurações você pode ocultar alertas de orçamento e/ou de metas. Isso afeta tanto a página Alertas quanto o indicador no menu lateral.",
      },
    ],
  },
  {
    title: "Meus dados",
    items: [
      {
        q: "Onde meus dados ficam salvos?",
        a: "No armazenamento local (localStorage) deste navegador. Ainda não existe login nem sincronização entre dispositivos — isso está previsto para a Fase 6 do roadmap, ainda não iniciada.",
      },
      {
        q: "Se eu limpar os dados do navegador, perco tudo?",
        a: "Sim. Como ainda não há backend, limpar o localStorage (ou trocar de navegador/dispositivo) apaga o que foi cadastrado.",
      },
    ],
  },
];

export default function Help() {
  return (
    <>
      <Header eyebrow="AJUDA" title="Central de ajuda" />
      <main className="content">
        <p className="page-lead">
          Perguntas frequentes sobre como o FINANCE funciona hoje. Se algo não estiver aqui, é provável que ainda não
          tenha sido implementado — dá uma olhada em Configurações para ver o que já está disponível.
        </p>

        {FAQ_SECTIONS.map((section) => (
          <section className="panel" style={{ marginTop: 15 }} key={section.title}>
            <div className="panel-heading">
              <div><h2>{section.title}</h2></div>
            </div>
            <div className="help-list">
              {section.items.map((item) => (
                <div className="help-item" key={item.q}>
                  <strong>{item.q}</strong>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
