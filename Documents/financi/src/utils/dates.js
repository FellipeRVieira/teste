export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthKeyOffset(monthsAgo, date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth() - monthsAgo, 1);
  return currentMonthKey(d);
}

export function shortMonthLabel(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function monthYearLabel(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function isSameDay(isoA, isoB) {
  return isoA === isoB;
}

export function formatRelativeDate(iso, referenceDate = new Date()) {
  if (!iso) return "";
  const today = currentMonthKey(referenceDate) + "-" + String(referenceDate.getDate()).padStart(2, "0");
  const yesterdayDate = new Date(referenceDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = currentMonthKey(yesterdayDate) + "-" + String(yesterdayDate.getDate()).padStart(2, "0");

  if (iso === today) return "Hoje";
  if (iso === yesterday) return "Ontem";

  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

export function formatDateInput(iso) {
  return iso || "";
}

export function todayIso(date = new Date()) {
  return `${currentMonthKey(date)}-${String(date.getDate()).padStart(2, "0")}`;
}
