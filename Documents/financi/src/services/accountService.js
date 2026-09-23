import { readJSON, writeJSON } from "./storageService";
import { accounts as seedAccounts } from "../data/mockData";

// Contas e cartões representativos compartilham a mesma coleção
// (diferenciados pelo campo `kind`), seguindo o modelo já usado em
// data/mockData.js. Nenhum registro aqui movimenta dinheiro real:
// são apenas dados organizacionais informados manualmente pelo usuário
// (docs/00-PROJECT-OVERVIEW.md e docs/04-DATA-MODEL.md).
const KEY = "accounts";

function generateId(kind) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${kind}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadAll() {
  return readJSON(KEY, null) ?? seed();
}

function seed() {
  writeJSON(KEY, seedAccounts);
  return seedAccounts;
}

function persist(accounts) {
  writeJSON(KEY, accounts);
  return accounts;
}

export function getAll() {
  return loadAll();
}

export function getAccounts() {
  return loadAll().filter((a) => a.kind === "account");
}

export function getCards() {
  return loadAll().filter((a) => a.kind === "card");
}

export function createAccount(input) {
  const account = {
    id: generateId("conta"),
    kind: "account",
    name: input.name?.trim() || "",
    type: input.type || "checking",
    initialBalance: Math.abs(Number(input.initialBalance) || 0),
    color: input.color || "#6c5ce7",
    active: input.active ?? true,
  };
  const all = [...loadAll(), account];
  persist(all);
  return account;
}

export function createCard(input) {
  const card = {
    id: generateId("cartao"),
    kind: "card",
    name: input.name?.trim() || "",
    brand: input.brand?.trim() || "",
    limit: Math.abs(Number(input.limit) || 0),
    // Fatura atual não é armazenada aqui: é sempre calculada a partir da
    // soma das compras cadastradas para o cartão (services/cardPurchaseService.js
    // + utils/finance.js -> getCardPurchasesSummary), nunca informada
    // manualmente nem a partir de movimentações reais do cartão.
    closingDay: input.closingDay ? Number(input.closingDay) : null,
    dueDay: input.dueDay ? Number(input.dueDay) : null,
    color: input.color || "#6c5ce7",
    active: input.active ?? true,
  };
  const all = [...loadAll(), card];
  persist(all);
  return card;
}

export function update(id, patch) {
  const all = loadAll().map((a) => {
    if (a.id !== id) return a;
    const next = { ...a, ...patch };
    if (patch.initialBalance !== undefined) next.initialBalance = Math.abs(Number(patch.initialBalance) || 0);
    if (patch.limit !== undefined) next.limit = Math.abs(Number(patch.limit) || 0);
    if (patch.closingDay !== undefined) next.closingDay = patch.closingDay ? Number(patch.closingDay) : null;
    if (patch.dueDay !== undefined) next.dueDay = patch.dueDay ? Number(patch.dueDay) : null;
    return next;
  });
  persist(all);
  return all.find((a) => a.id === id);
}

// Contas/cartões com lançamentos associados são desativados em vez de
// removidos, para preservar o histórico de transações já lançadas.
export function deactivate(id) {
  return update(id, { active: false });
}

export function remove(id) {
  const all = loadAll().filter((a) => a.id !== id);
  persist(all);
}
