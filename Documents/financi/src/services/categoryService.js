import { readJSON, writeJSON } from "./storageService";
import { categories as seedCategories } from "../data/mockData";

const KEY = "categories";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `cat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadAll() {
  return readJSON(KEY, null) ?? seed();
}

function seed() {
  writeJSON(KEY, seedCategories);
  return seedCategories;
}

function persist(categories) {
  writeJSON(KEY, categories);
  return categories;
}

export function getAll() {
  return loadAll();
}

export function create(input) {
  const category = {
    id: generateId(),
    name: input.name?.trim() || "",
    type: input.type || "expense",
    icon: input.icon?.trim() || "✨",
    color: input.color || "#858a9a",
    active: input.active ?? true,
  };
  const all = [...loadAll(), category];
  persist(all);
  return category;
}

export function update(id, patch) {
  const all = loadAll().map((c) => (c.id === id ? { ...c, ...patch } : c));
  persist(all);
  return all.find((c) => c.id === id);
}

// Categorias não são removidas fisicamente para não quebrar transações já
// lançadas que referenciam o id — desativar é a operação padrão.
export function deactivate(id) {
  return update(id, { active: false });
}

export function remove(id) {
  const all = loadAll().filter((c) => c.id !== id);
  persist(all);
}
