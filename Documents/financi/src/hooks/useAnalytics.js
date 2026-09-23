import { useMemo } from "react";
import {
  getPeriodTransactions,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getSavingsRate,
  getExpensesByCategory,
  getMonthlySeries,
  getPeriodComparison,
  getTopExpenses,
  getSpendingTrend,
  getCategoryShift,
} from "../utils/finance";
import { monthKeyOffset, shortMonthLabel } from "../utils/dates";

// Agrega os indicadores da página de Análises (RF08), no mesmo espírito de
// useFinanceSummary.js: a página só consome este hook, todo o cálculo fica
// centralizado aqui e em utils/finance.js.
export function useAnalytics(transactions, categories, { monthKey, compareMonthKey, monthsForChart = 12 } = {}) {
  return useMemo(() => {
    const [y, m] = monthKey.split("-").map(Number);
    const referenceDate = new Date(y, m - 1, 1);

    const currentMonth = getPeriodTransactions(transactions, monthKey);

    const overview = {
      income: getTotalIncome(currentMonth),
      expenses: getTotalExpenses(currentMonth),
      balance: getBalance(currentMonth),
      savingsRate: getSavingsRate(currentMonth),
    };

    const yearlySeries = getMonthlySeries(transactions, monthsForChart, referenceDate, monthKeyOffset, shortMonthLabel);
    const expensesByCategory = getExpensesByCategory(currentMonth, categories);
    const topExpenses = getTopExpenses(transactions, monthKey, 5);
    const trend = getSpendingTrend(yearlySeries);
    const comparison = compareMonthKey ? getPeriodComparison(transactions, monthKey, compareMonthKey) : null;
    const categoryShift = compareMonthKey ? getCategoryShift(transactions, categories, monthKey, compareMonthKey).slice(0, 3) : [];

    return { monthKey, overview, yearlySeries, expensesByCategory, topExpenses, trend, comparison, categoryShift };
  }, [transactions, categories, monthKey, compareMonthKey, monthsForChart]);
}
