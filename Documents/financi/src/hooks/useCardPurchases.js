import { useCallback, useMemo, useState } from "react";
import * as cardPurchaseService from "../services/cardPurchaseService";

// Estado central das compras parceladas representativas por cartão, no
// mesmo padrão de useAccounts.js / useGoals.js.
export function useCardPurchases() {
  const [purchases, setPurchases] = useState(() => cardPurchaseService.getAll());

  const byCard = useMemo(() => {
    const map = new Map();
    for (const purchase of purchases) {
      const list = map.get(purchase.cardId) || [];
      list.push(purchase);
      map.set(purchase.cardId, list);
    }
    return map;
  }, [purchases]);

  const getPurchasesByCard = useCallback((cardId) => byCard.get(cardId) || [], [byCard]);

  const addPurchase = useCallback((input) => {
    const created = cardPurchaseService.create(input);
    setPurchases((prev) => [created, ...prev]);
    return created;
  }, []);

  const editPurchase = useCallback((id, patch) => {
    const updated = cardPurchaseService.update(id, patch);
    setPurchases((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deletePurchase = useCallback((id) => {
    cardPurchaseService.remove(id);
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const deletePurchasesByCard = useCallback((cardId) => {
    cardPurchaseService.removeByCard(cardId);
    setPurchases((prev) => prev.filter((p) => p.cardId !== cardId));
  }, []);

  return {
    purchases,
    getPurchasesByCard,
    addPurchase,
    editPurchase,
    deletePurchase,
    deletePurchasesByCard,
  };
}
