import { readJSON, writeJSON } from "./storageService";
import { cardPurchases as seedCardPurchases } from "../data/mockData";

// Compras parceladas representativas, informadas manualmente pelo usuário
// por cartão (CLAUDE.md, docs/04-DATA-MODEL.md). Não representam cobranças
// reais nem movimentam a fatura automaticamente — servem apenas para o
// usuário organizar quanto de cada compra ainda impacta a mensalidade do
// cartão.
const KEY = "cardPurchases";

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `compra-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadAll() {
  return readJSON(KEY, null) ?? seed();
}

function seed() {
  writeJSON(KEY, seedCardPurchases);
  return seedCardPurchases;
}

function persist(purchases) {
  writeJSON(KEY, purchases);
  return purchases;
}

function computeTotal(monthlyAmount, installments) {
  return Math.abs(Number(monthlyAmount) || 0) * Math.max(1, Number(installments) || 1);
}

export function getAll() {
  return loadAll();
}

export function getByCard(cardId) {
  return loadAll().filter((p) => p.cardId === cardId);
}

export function create(input) {
  const now = new Date().toISOString();
  const monthlyAmount = Math.abs(Number(input.monthlyAmount) || 0);
  const installments = Math.max(1, Number(input.installments) || 1);
  const purchase = {
    id: generateId(),
    cardId: input.cardId,
    description: input.description?.trim() || "",
    monthlyAmount,
    installments,
    totalAmount: computeTotal(monthlyAmount, installments),
    purchaseDate: input.purchaseDate || null,
    createdAt: now,
    updatedAt: now,
  };
  const all = [purchase, ...loadAll()];
  persist(all);
  return purchase;
}

export function update(id, patch) {
  const all = loadAll().map((p) => {
    if (p.id !== id) return p;
    const next = { ...p, ...patch, updatedAt: new Date().toISOString() };
    if (patch.monthlyAmount !== undefined) next.monthlyAmount = Math.abs(Number(patch.monthlyAmount) || 0);
    if (patch.installments !== undefined) next.installments = Math.max(1, Number(patch.installments) || 1);
    next.totalAmount = computeTotal(next.monthlyAmount, next.installments);
    return next;
  });
  persist(all);
  return all.find((p) => p.id === id);
}

// Compras não são referenciadas por transações nem por outros domínios,
// então a exclusão é física (mesmo padrão de goalService.remove()).
export function remove(id) {
  const all = loadAll().filter((p) => p.id !== id);
  persist(all);
}

// Usado quando um cartão é excluído de verdade — remove as compras
// parceladas que ficariam órfãs, já que elas só existem no contexto de
// um cartão específico.
export function removeByCard(cardId) {
  const all = loadAll().filter((p) => p.cardId !== cardId);
  persist(all);
}
