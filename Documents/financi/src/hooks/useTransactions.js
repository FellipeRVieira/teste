import { useCallback, useState } from "react";
import * as transactionService from "../services/transactionService";

// Estado central do domínio de transações. Qualquer página que precise
// ler ou alterar lançamentos deve usar este hook, para que Dashboard,
// Transações e Análises fiquem sempre sincronizados.
export function useTransactions() {
  const [transactions, setTransactions] = useState(() => transactionService.getAll());

  const addTransaction = useCallback((input) => {
    const created = transactionService.create(input);
    setTransactions((prev) => [created, ...prev]);
    return created;
  }, []);

  const editTransaction = useCallback((id, patch) => {
    const updated = transactionService.update(id, patch);
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const deleteTransaction = useCallback((id) => {
    transactionService.remove(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { transactions, addTransaction, editTransaction, deleteTransaction };
}
