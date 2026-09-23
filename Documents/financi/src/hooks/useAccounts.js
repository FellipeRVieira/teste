import { useCallback, useMemo, useState } from "react";
import * as accountService from "../services/accountService";

// Estado central do domínio de contas e cartões representativos, no
// mesmo padrão de useTransactions.js.
export function useAccounts() {
  const [accounts, setAccounts] = useState(() => accountService.getAll());

  const bankAccounts = useMemo(() => accounts.filter((a) => a.kind === "account"), [accounts]);
  const cards = useMemo(() => accounts.filter((a) => a.kind === "card"), [accounts]);

  const addAccount = useCallback((input) => {
    const created = accountService.createAccount(input);
    setAccounts((prev) => [...prev, created]);
    return created;
  }, []);

  const addCard = useCallback((input) => {
    const created = accountService.createCard(input);
    setAccounts((prev) => [...prev, created]);
    return created;
  }, []);

  const editAccount = useCallback((id, patch) => {
    const updated = accountService.update(id, patch);
    setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const deactivateAccount = useCallback((id) => {
    const updated = accountService.deactivate(id);
    setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const deleteAccount = useCallback((id) => {
    accountService.remove(id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    accounts,
    bankAccounts,
    cards,
    addAccount,
    addCard,
    editAccount,
    deactivateAccount,
    deleteAccount,
  };
}
