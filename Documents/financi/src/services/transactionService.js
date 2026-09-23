import { readJSON, writeJSON } from "./storageService";
import { initialTransactions } from "../data/mockData";

const KEY = "transactions";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `t-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadAll() {
  return readJSON(KEY, null) ?? seed();
}

function seed() {
  writeJSON(KEY, initialTransactions);
  return initialTransactions;
}

function persist(transactions) {
  writeJSON(KEY, transactions);
  return transactions;
}

export function getAll() {
  return loadAll();
}

export function create(input) {
  const now = new Date().toISOString();
  const transaction = {
    id: generateId(),
    type: input.type,
    description: input.description?.trim() || "",
    amount: Math.abs(Number(input.amount) || 0),
    categoryId: input.categoryId,
    accountId: input.accountId || null,
    date: input.date,
    notes: input.notes?.trim() || "",
    createdAt: now,
    updatedAt: now,
  };
  const all = [transaction, ...loadAll()];
  persist(all);
  return transaction;
}

export function update(id, patch) {
  const all = loadAll().map((t) =>
    t.id === id
      ? {
          ...t,
          ...patch,
          amount: patch.amount !== undefined ? Math.abs(Number(patch.amount) || 0) : t.amount,
          updatedAt: new Date().toISOString(),
        }
      : t
  );
  persist(all);
  return all.find((t) => t.id === id);
}

export function remove(id) {
  const all = loadAll().filter((t) => t.id !== id);
  persist(all);
}
