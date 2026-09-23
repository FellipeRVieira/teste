import { readJSON, writeJSON } from "./storageService";
import { budget as seedBudget } from "../data/mockData";

// Orçamento por mês (docs/04-DATA-MODEL.md). Cada registro representa o
// limite geral e os limites por categoria de um mês (`month`, "2026-09").
// Nenhum valor aqui movimenta dinheiro: são apenas limites informados pelo
// usuário, comparados aos lançamentos reais em utils/finance.js
// (getBudgetUsage).
const KEY = "budgets";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `budget-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadAll() {
  return readJSON(KEY, null) ?? seed();
}

function seed() {
  const seeded = [seedBudget];
  writeJSON(KEY, seeded);
  return seeded;
}

function persist(budgets) {
  writeJSON(KEY, budgets);
  return budgets;
}

export function getAll() {
  return loadAll();
}

export function getByMonth(monthKey) {
  return loadAll().find((b) => b.month === monthKey) || null;
}

// Garante que exista um registro de orçamento para o mês informado,
// criando um vazio (sem limite geral nem por categoria) quando necessário.
export function ensureMonth(monthKey) {
  const existing = getByMonth(monthKey);
  if (existing) return existing;
  const created = { id: generateId(), month: monthKey, totalLimit: 0, categories: [] };
  persist([...loadAll(), created]);
  return created;
}

export function setTotalLimit(monthKey, totalLimit) {
  const current = ensureMonth(monthKey);
  const value = Math.max(0, Number(totalLimit) || 0);
  const all = loadAll().map((b) => (b.id === current.id ? { ...b, totalLimit: value } : b));
  persist(all);
  return all.find((b) => b.id === current.id);
}

export function setCategoryLimit(monthKey, categoryId, limit) {
  const current = ensureMonth(monthKey);
  const value = Math.max(0, Number(limit) || 0);
  const all = loadAll().map((b) => {
    if (b.id !== current.id) return b;
    const exists = b.categories.some((c) => c.categoryId === categoryId);
    const categories = exists
      ? b.categories.map((c) => (c.categoryId === categoryId ? { ...c, limit: value } : c))
      : [...b.categories, { categoryId, limit: value }];
    return { ...b, categories };
  });
  persist(all);
  return all.find((b) => b.id === current.id);
}

export function removeCategoryLimit(monthKey, categoryId) {
  const current = ensureMonth(monthKey);
  const all = loadAll().map((b) =>
    b.id === current.id ? { ...b, categories: b.categories.filter((c) => c.categoryId !== categoryId) } : b
  );
  persist(all);
  return all.find((b) => b.id === current.id);
}
