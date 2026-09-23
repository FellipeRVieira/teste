export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

export function parseCurrencyInput(raw) {
  if (typeof raw === "number") return raw;
  const normalized = String(raw ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : NaN;
}
