// Selectors financeiros centralizados.
// Regra do domínio: Dashboard, Transações e Análises devem ler destes
// helpers em vez de recalcular totais de forma independente em cada página.

export function getPeriodTransactions(transactions, monthKey) {
  if (!monthKey || monthKey === "all") return transactions;
  return transactions.filter((t) => t.date?.startsWith(monthKey));
}

export function getTotalIncome(transactions) {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

export function getTotalExpenses(transactions) {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

export function getBalance(transactions, initialBalance = 0) {
  return initialBalance + getTotalIncome(transactions) - getTotalExpenses(transactions);
}

export function getSavingsRate(transactions) {
  const income = getTotalIncome(transactions);
  const expenses = getTotalExpenses(transactions);
  if (income <= 0) return 0;
  return ((income - expenses) / income) * 100;
}

export function getExpensesByCategory(transactions, categories) {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const byCategory = new Map();
  for (const t of expenses) {
    byCategory.set(t.categoryId, (byCategory.get(t.categoryId) || 0) + Number(t.amount || 0));
  }

  return Array.from(byCategory.entries())
    .map(([categoryId, value]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        categoryId,
        name: category?.name || "Sem categoria",
        icon: category?.icon || "•",
        value,
        percent: total > 0 ? Math.round((value / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function getMonthlySeries(transactions, monthsCount, referenceDate, monthKeyOffset, shortMonthLabel) {
  const months = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const key = monthKeyOffset(i, referenceDate);
    const monthTransactions = getPeriodTransactions(transactions, key);
    months.push({
      month: shortMonthLabel(key),
      key,
      income: getTotalIncome(monthTransactions),
      expense: getTotalExpenses(monthTransactions),
    });
  }
  return months;
}

export function getBudgetUsage(budget, transactions, monthKey) {
  const periodTransactions = getPeriodTransactions(transactions, monthKey);
  const categories = (budget?.categories || []).map((entry) => {
    const used = periodTransactions
      .filter((t) => t.type === "expense" && t.categoryId === entry.categoryId)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { ...entry, used, percent: entry.limit > 0 ? Math.min(999, Math.round((used / entry.limit) * 100)) : 0 };
  });
  const totalUsed = categories.reduce((sum, c) => sum + c.used, 0);
  const totalLimit = budget?.totalLimit || 0;
  return {
    categories,
    totalUsed,
    totalLimit,
    available: Math.max(0, totalLimit - totalUsed),
    percent: totalLimit > 0 ? Math.min(999, Math.round((totalUsed / totalLimit) * 100)) : 0,
  };
}

// Soma as compras parceladas representativas de um cartão — nunca lê a
// fatura real do cartão, apenas os lançamentos manuais de compra
// cadastrados pelo usuário (CLAUDE.md).
export function getCardPurchasesSummary(purchases) {
  return purchases.reduce(
    (acc, purchase) => ({
      count: acc.count + 1,
      monthlyTotal: acc.monthlyTotal + (Number(purchase.monthlyAmount) || 0),
      totalAmount: acc.totalAmount + (Number(purchase.totalAmount) || 0),
    }),
    { count: 0, monthlyTotal: 0, totalAmount: 0 }
  );
}

export function getGoalProgress(goal) {
  if (!goal.targetAmount) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

// Alertas derivados do orçamento e das metas já cadastrados — nenhum dado
// próprio é armazenado, tudo é recalculado a partir de dados reais
// (CLAUDE.md: "alertas baseados nos dados cadastrados").
export function getBudgetAlerts(budgetUsage, categories) {
  const alerts = [];

  if (budgetUsage.totalLimit > 0 && budgetUsage.totalUsed > budgetUsage.totalLimit) {
    alerts.push({
      id: "budget-total",
      type: "budget",
      severity: "high",
      title: "Orçamento geral do mês excedido",
      message: `O total gasto já ultrapassou o limite geral definido para o mês (${budgetUsage.percent}%).`,
    });
  } else if (budgetUsage.totalLimit > 0 && budgetUsage.percent >= 80) {
    alerts.push({
      id: "budget-total-near",
      type: "budget",
      severity: "medium",
      title: "Orçamento geral do mês perto do limite",
      message: `O total gasto já está em ${budgetUsage.percent}% do limite geral definido para o mês.`,
    });
  }

  budgetUsage.categories
    .filter((entry) => entry.limit > 0 && entry.used > entry.limit)
    .forEach((entry) => {
      const category = categories.find((c) => c.id === entry.categoryId);
      alerts.push({
        id: `budget-${entry.categoryId}`,
        type: "budget",
        severity: "high",
        title: `Limite de "${category?.name || "categoria"}" excedido`,
        message: `Você já usou ${entry.percent}% do limite definido para esta categoria neste mês.`,
      });
    });

  budgetUsage.categories
    .filter((entry) => entry.limit > 0 && entry.used <= entry.limit && entry.percent >= 80)
    .forEach((entry) => {
      const category = categories.find((c) => c.id === entry.categoryId);
      alerts.push({
        id: `budget-near-${entry.categoryId}`,
        type: "budget",
        severity: "medium",
        title: `Limite de "${category?.name || "categoria"}" perto do fim`,
        message: `Você já usou ${entry.percent}% do limite definido para esta categoria neste mês.`,
      });
    });

  return alerts;
}

export function getGoalAlerts(goals) {
  const alerts = [];

  goals
    .filter((g) => g.status === "completed")
    .forEach((g) => {
      alerts.push({
        id: `goal-completed-${g.id}`,
        type: "goal",
        severity: "success",
        title: `Meta "${g.title}" concluída`,
        message: "O valor planejado para esta meta foi atingido.",
      });
    });

  goals
    .filter((g) => g.status === "active" && g.deadline)
    .forEach((g) => {
      const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft >= 0 && daysLeft <= 30 && getGoalProgress(g) < 100) {
        alerts.push({
          id: `goal-deadline-${g.id}`,
          type: "goal",
          severity: "medium",
          title: `Meta "${g.title}" perto do prazo`,
          message: `Faltam ${daysLeft} dia(s) para o prazo planejado e a meta ainda não foi concluída.`,
        });
      }
    });

  return alerts;
}

// --- Análises (Fase 5) -----------------------------------------------
// Os selectors abaixo reaproveitam getPeriodTransactions/getTotalIncome/
// getTotalExpenses/getSavingsRate já usados pelo Dashboard, para manter um
// único cálculo de "o que é receita/despesa/saldo" em todo o app.

// RF08: "comparação entre períodos" — compara dois meses (não precisam ser
// consecutivos) usando os mesmos totais do Dashboard.
export function getPeriodComparison(transactions, monthKeyA, monthKeyB) {
  const periodA = getPeriodTransactions(transactions, monthKeyA);
  const periodB = getPeriodTransactions(transactions, monthKeyB);

  function metric(getValue) {
    const a = getValue(periodA);
    const b = getValue(periodB);
    const change = b > 0 ? ((a - b) / b) * 100 : null;
    return { a, b, change };
  }

  return {
    monthKeyA,
    monthKeyB,
    income: metric(getTotalIncome),
    expenses: metric(getTotalExpenses),
    balance: metric((t) => getBalance(t)),
    savingsRate: metric(getSavingsRate),
  };
}

// RF08: "maiores gastos" do período selecionado.
export function getTopExpenses(transactions, monthKey, limit = 5) {
  return getPeriodTransactions(transactions, monthKey)
    .filter((t) => t.type === "expense")
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, limit);
}

// RF08: "tendências e insights" — leitura textual simples sobre a série
// mensal já usada no gráfico de evolução (getMonthlySeries), sem gerar
// nenhuma recomendação financeira automatizada, só descrever o que já
// aconteceu nos lançamentos.
export function getSpendingTrend(monthlySeries) {
  const withData = monthlySeries.filter((m) => m.income > 0 || m.expense > 0);
  if (withData.length < 2) return { direction: "insufficient", avgExpense: withData[0]?.expense || 0 };

  const first = withData[0];
  const last = withData[withData.length - 1];
  const avgExpense = withData.reduce((sum, m) => sum + m.expense, 0) / withData.length;
  const change = first.expense > 0 ? ((last.expense - first.expense) / first.expense) * 100 : null;

  let direction = "stable";
  if (change !== null) {
    if (change > 5) direction = "up";
    else if (change < -5) direction = "down";
  }

  return { direction, change, avgExpense, first, last };
}

// Maior variação de gasto por categoria entre dois períodos — insumo para
// o insight "categoria que mais cresceu/caiu".
export function getCategoryShift(transactions, categories, monthKeyA, monthKeyB) {
  const byA = getExpensesByCategory(getPeriodTransactions(transactions, monthKeyA), categories);
  const byB = getExpensesByCategory(getPeriodTransactions(transactions, monthKeyB), categories);
  const mapB = new Map(byB.map((c) => [c.categoryId, c.value]));

  return byA
    .map((c) => {
      const previous = mapB.get(c.categoryId) || 0;
      return { ...c, previous, delta: c.value - previous };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}
