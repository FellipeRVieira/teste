import { useCallback, useState } from "react";
import * as categoryService from "../services/categoryService";

// Estado central do domínio de categorias, no mesmo padrão de
// useTransactions.js, para manter Transações, Dashboard e a tela de
// Categorias sincronizadas.
export function useCategories() {
  const [categories, setCategories] = useState(() => categoryService.getAll());

  const addCategory = useCallback((input) => {
    const created = categoryService.create(input);
    setCategories((prev) => [...prev, created]);
    return created;
  }, []);

  const editCategory = useCallback((id, patch) => {
    const updated = categoryService.update(id, patch);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deactivateCategory = useCallback((id) => {
    const updated = categoryService.deactivate(id);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteCategory = useCallback((id) => {
    categoryService.remove(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { categories, addCategory, editCategory, deactivateCategory, deleteCategory };
}
