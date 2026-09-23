import { useCallback, useState } from "react";
import * as goalService from "../services/goalService";

export function useGoals() {
  const [goals, setGoals] = useState(() => goalService.getAll());

  const addGoal = useCallback((input) => {
    const created = goalService.create(input);
    setGoals((prev) => [...prev, created]);
    return created;
  }, []);

  const editGoal = useCallback((id, patch) => {
    const updated = goalService.update(id, patch);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  // Aporte é registro/planejamento de progresso, nunca transferência real.
  const contributeToGoal = useCallback((id, amount) => {
    const updated = goalService.addContribution(id, amount);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const setGoalStatus = useCallback((id, status) => {
    const updated = goalService.setStatus(id, status);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const deleteGoal = useCallback((id) => {
    goalService.remove(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  return { goals, addGoal, editGoal, contributeToGoal, setGoalStatus, deleteGoal };
}
