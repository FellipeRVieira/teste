import { readJSON, writeJSON } from "./storageService";
import { goals as seedGoals } from "../data/mockData";

const KEY = "goals";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadAll() {
  return readJSON(KEY, null) ?? seed();
}

function seed() {
  writeJSON(KEY, seedGoals);
  return seedGoals;
}

function persist(goals) {
  writeJSON(KEY, goals);
  return goals;
}

export function getAll() {
  return loadAll();
}

export function create(input) {
  const goal = {
    id: generateId(),
    title: input.title?.trim() || "",
    targetAmount: Math.abs(Number(input.targetAmount) || 0),
    currentAmount: Math.abs(Number(input.currentAmount) || 0),
    deadline: input.deadline || null,
    icon: input.icon?.trim() || "🎯",
    color: input.color || "#6c5ce7",
    status: input.status || "active",
  };
  const all = [...loadAll(), goal];
  persist(all);
  return goal;
}

export function update(id, patch) {
  const all = loadAll().map((g) => {
    if (g.id !== id) return g;
    const next = { ...g, ...patch };
    if (patch.targetAmount !== undefined) next.targetAmount = Math.abs(Number(patch.targetAmount) || 0);
    if (patch.currentAmount !== undefined) next.currentAmount = Math.abs(Number(patch.currentAmount) || 0);
    return next;
  });
  persist(all);
  return all.find((g) => g.id === id);
}

// Aporte é sempre um registro/planejamento manual de progresso da meta —
// nunca uma transferência real entre contas (docs/00-PROJECT-OVERVIEW.md,
// CLAUDE.md). Apenas soma ao valor já acumulado da meta.
export function addContribution(id, amount) {
  const all = loadAll().map((g) => {
    if (g.id !== id) return g;
    const nextAmount = Math.max(0, g.currentAmount + (Number(amount) || 0));
    const status =
      g.status === "paused" ? g.status : g.targetAmount > 0 && nextAmount >= g.targetAmount ? "completed" : "active";
    return { ...g, currentAmount: nextAmount, status };
  });
  persist(all);
  return all.find((g) => g.id === id);
}

export function setStatus(id, status) {
  return update(id, { status });
}

// Metas não são referenciadas por transações, então a exclusão é física.
export function remove(id) {
  const all = loadAll().filter((g) => g.id !== id);
  persist(all);
}
