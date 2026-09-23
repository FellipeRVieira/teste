import { useCallback, useMemo, useState } from "react";
import * as budgetService from "../services/budgetService";

// Estado central do orçamento de um mês. `monthKey` segue o mesmo formato
// usado em Transações/Dashboard ("2026-09"). Se ainda não existir um
// registro para o mês, expõe um orçamento vazio (sem limites) até que o
// usuário defina algum.
export function useBudget(monthKey) {
  const [budgets, setBudgets] = useState(() => budgetService.getAll());

  const budget = useMemo(
    () => budgets.find((b) => b.month === monthKey) || { id: null, month: monthKey, totalLimit: 0, categories: [] },
    [budgets, monthKey]
  );

  const saveTotalLimit = useCallback(
    (totalLimit) => {
      budgetService.setTotalLimit(monthKey, totalLimit);
      setBudgets(budgetService.getAll());
    },
    [monthKey]
  );

  const saveCategoryLimit = useCallback(
    (categoryId, limit) => {
      budgetService.setCategoryLimit(monthKey, categoryId, limit);
      setBudgets(budgetService.getAll());
    },
    [monthKey]
  );

  const removeCategoryLimit = useCallback(
    (categoryId) => {
      budgetService.removeCategoryLimit(monthKey, categoryId);
      setBudgets(budgetService.getAll());
    },
    [monthKey]
  );

  return { budget, saveTotalLimit, saveCategoryLimit, removeCategoryLimit };
}
