// Dados de seed para o protótipo, no formato do modelo de dados alvo
// (docs/04-DATA-MODEL.md). Quando o backend for definido, estes dados
// deixam de ser usados como seed e passam a vir da API.

export const preferences = {
  name: "Fellipe R Vieira",
  theme: "light",
  notifyBudgetAlerts: true,
  notifyGoalAlerts: true,
};

export const categories = [
  { id: "alimentacao", name: "Alimentação", type: "expense", icon: "🍴", color: "#6c5ce7", active: true },
  { id: "casa", name: "Casa", type: "expense", icon: "🏠", color: "#00a878", active: true },
  { id: "transporte", name: "Transporte", type: "expense", icon: "🚗", color: "#ef5b63", active: true },
  { id: "compras", name: "Compras", type: "expense", icon: "🛍️", color: "#f2a93b", active: true },
  { id: "outros", name: "Outros", type: "both", icon: "✨", color: "#858a9a", active: true },
  { id: "renda", name: "Renda", type: "income", icon: "💼", color: "#00a878", active: true },
];

// `accounts` reúne contas e cartões representativos (docs/04-DATA-MODEL.md).
// Nenhum dos dois se conecta a um banco real: são registros organizacionais
// que o usuário mantém atualizados manualmente. A fatura do cartão não é
// um campo próprio: é sempre calculada a partir da soma das compras
// cadastradas para aquele cartão (ver `cardPurchases` abaixo).
export const accounts = [
  { id: "conta-pessoal", name: "Conta Pessoal", kind: "account", type: "checking", initialBalance: 0, color: "#6c5ce7", active: true },
  { id: "cartao-nubank", name: "Cartão Nubank", kind: "card", brand: "Mastercard", limit: 3500, closingDay: 28, dueDay: 5, color: "#820ad1", active: true },
  { id: "cartao-pessoal", name: "Cartão Pessoal", kind: "card", brand: "Visa", limit: 2000, closingDay: 10, dueDay: 17, color: "#1a1f71", active: true },
];

// Compras parceladas representativas, organizadas por cartão
// (docs/04-DATA-MODEL.md). São lançamentos manuais de planejamento — não
// representam cobranças reais nem são geradas a partir de movimentações
// do cartão. `monthlyAmount` é o valor da parcela e `totalAmount` é
// sempre `monthlyAmount * installments`.
export const cardPurchases = [
  {
    id: "compra-ps5",
    cardId: "cartao-nubank",
    description: "PS5",
    monthlyAmount: 250,
    installments: 4,
    totalAmount: 1000,
    purchaseDate: "2026-08-15",
    createdAt: "2026-08-15T12:00:00.000Z",
    updatedAt: "2026-08-15T12:00:00.000Z",
  },
];

export const initialTransactions = [
  { id: "t-2026-09-01", type: "expense", description: "Almoço", amount: 85.90, categoryId: "alimentacao", accountId: "cartao-nubank", date: "2026-09-04", notes: "" },
  { id: "t-2026-09-02", type: "income", description: "Salário", amount: 5200, categoryId: "renda", accountId: "conta-pessoal", date: "2026-09-04", notes: "" },
  { id: "t-2026-09-03", type: "expense", description: "Supermercado", amount: 152.40, categoryId: "compras", accountId: "cartao-nubank", date: "2026-09-03", notes: "Compra semanal" },
  { id: "t-2026-09-04", type: "expense", description: "Uber", amount: 28.50, categoryId: "transporte", accountId: "cartao-nubank", date: "2026-09-03", notes: "" },
  { id: "t-2026-09-05", type: "expense", description: "Aluguel", amount: 910, categoryId: "casa", accountId: "conta-pessoal", date: "2026-09-02", notes: "" },
  { id: "t-2026-08-01", type: "income", description: "Freelance", amount: 350, categoryId: "renda", accountId: "cartao-pessoal", date: "2026-08-19", notes: "" },
  { id: "t-2026-08-02", type: "income", description: "Salário", amount: 5000, categoryId: "renda", accountId: "conta-pessoal", date: "2026-08-05", notes: "" },
  { id: "t-2026-08-03", type: "expense", description: "Despesas do mês", amount: 1420, categoryId: "outros", accountId: "cartao-nubank", date: "2026-08-10", notes: "" },
  { id: "t-2026-07-01", type: "income", description: "Salário", amount: 4800, categoryId: "renda", accountId: "conta-pessoal", date: "2026-07-05", notes: "" },
  { id: "t-2026-07-02", type: "expense", description: "Despesas do mês", amount: 1500, categoryId: "outros", accountId: "cartao-nubank", date: "2026-07-10", notes: "" },
  { id: "t-2026-06-01", type: "income", description: "Salário", amount: 4200, categoryId: "renda", accountId: "conta-pessoal", date: "2026-06-05", notes: "" },
  { id: "t-2026-06-02", type: "expense", description: "Despesas do mês", amount: 1320, categoryId: "outros", accountId: "cartao-nubank", date: "2026-06-10", notes: "" },
  { id: "t-2026-05-01", type: "income", description: "Salário", amount: 4500, categoryId: "renda", accountId: "conta-pessoal", date: "2026-05-05", notes: "" },
  { id: "t-2026-05-02", type: "expense", description: "Despesas do mês", amount: 1600, categoryId: "outros", accountId: "cartao-nubank", date: "2026-05-10", notes: "" },
  { id: "t-2026-04-01", type: "income", description: "Salário", amount: 3900, categoryId: "renda", accountId: "conta-pessoal", date: "2026-04-05", notes: "" },
  { id: "t-2026-04-02", type: "expense", description: "Despesas do mês", amount: 1450, categoryId: "outros", accountId: "cartao-nubank", date: "2026-04-10", notes: "" },
];

// Orçamento e metas ainda são tratados como dados representativos
// (Fase 4 do roadmap). A utilização do orçamento já é derivada dos
// lançamentos reais em utils/finance.js (getBudgetUsage).
export const budget = {
  id: "budget-2026-09",
  month: "2026-09",
  totalLimit: 2200,
  categories: [
    { categoryId: "alimentacao", limit: 600 },
    { categoryId: "casa", limit: 1200 },
    { categoryId: "transporte", limit: 400 },
  ],
};

export const goals = [
  { id: "g1", title: "Viagem", targetAmount: 5000, currentAmount: 2400, icon: "✈️", status: "active" },
  { id: "g2", title: "Notebook", targetAmount: 4000, currentAmount: 1800, icon: "💻", status: "active" },
  { id: "g3", title: "Reserva de emergência", targetAmount: 10000, currentAmount: 6000, icon: "🛡️", status: "active" },
];
