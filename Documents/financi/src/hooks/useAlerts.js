import { useMemo } from "react";
import { useTransactions } from "./useTransactions";
import { useCategories } from "./useCategories";
import { useBudget } from "./useBudget";
import { useGoals } from "./useGoals";
import { getBudgetUsage, getBudgetAlerts, getGoalAlerts } from "../utils/finance";
import { currentMonthKey } from "../utils/dates";

// Selector compartilhado de alertas — mesma lógica usada pela página
// /alertas e pelo indicador da Sidebar, para não recalcular de formas
// diferentes em cada lugar. `includeBudget`/`includeGoals` refletem as
// preferências de notificação configuradas em /configuracoes.
export function useAlerts({ includeBudget = true, includeGoals = true } = {}) {
  const monthKey = currentMonthKey();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { budget } = useBudget(monthKey);
  const { goals } = useGoals();

  const usage = getBudgetUsage(budget, transactions, monthKey);

  const alerts = useMemo(() => {
    const budgetAlerts = includeBudget ? getBudgetAlerts(usage, categories) : [];
    const goalAlerts = includeGoals ? getGoalAlerts(goals) : [];
    return [...budgetAlerts, ...goalAlerts];
  }, [usage, categories, goals, includeBudget, includeGoals]);

  return { monthKey, alerts };
}
