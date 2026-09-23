import { useMemo } from "react";
import {
  getPeriodTransactions,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getSavingsRate,
  getExpensesByCategory,
  getMonthlySeries,
  getBudgetUsage,
} from "../utils/finance";
import { currentMonthKey, monthKeyOffset, shortMonthLabel } from "../utils/dates";

// Deriva todos os indicadores do Dashboard a partir dos lançamentos reais
// (docs/09-ACCEPTANCE-CRITERIA.md), para o mês informado em `monthKey`
// (por padrão, o mês corrente). `categories` é recebido do domínio de
// Categorias (services/categoryService.js) e `budget` do domínio de
// Orçamento (services/budgetService.js, via hooks/useBudget.js) em vez de
// serem importados diretamente de data/mockData.js.
export function useFinanceSummary(transactions, categories, budget, { monthKey: selectedMonthKey, monthsForChart = 6 } = {}) {
  return useMemo(() => {
    const monthKey = selectedMonthKey || currentMonthKey();
    const [y, m] = monthKey.split("-").map(Number);
    const referenceDate = new Date(y, m - 1, 1);
    const previousMonthKey = monthKeyOffset(1, referenceDate);

    const currentMonth = getPeriodTransactions(transactions, monthKey);
    const previousMonth = getPeriodTransactions(transactions, previousMonthKey);

    const income = getTotalIncome(currentMonth);
    const expenses = getTotalExpenses(currentMonth);
    const balance = getBalance(currentMonth);
    const previousIncome = getTotalIncome(previousMonth);
    const previousExpenses = getTotalExpenses(previousMonth);

    const percentChange = (current, previous) => {
      if (previous <= 0) return null;
      return ((current - previous) / previous) * 100;
    };

    return {
      monthKey,
      income,
      expenses,
      balance,
      savingsRate: getSavingsRate(currentMonth),
      incomeChange: percentChange(income, previousIncome),
      expensesChange: percentChange(expenses, previousExpenses),
      expensesByCategory: getExpensesByCategory(currentMonth, categories),
      monthlySeries: getMonthlySeries(transactions, monthsForChart, referenceDate, monthKeyOffset, shortMonthLabel),
      budgetUsage: getBudgetUsage(budget, transactions, monthKey),
      recentTransactions: [...currentMonth]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 5),
    };
  }, [transactions, categories, budget, selectedMonthKey, monthsForChart]);
}
