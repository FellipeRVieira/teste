import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import ProgressBar from "../ui/ProgressBar";

// Exibe a utilização de um limite de categoria, destacando visualmente
// quando o gasto já ultrapassou o limite definido (docs/09-ACCEPTANCE-CRITERIA.md
// — "excedente é identificado").
export default function BudgetCategoryRow({ entry, category, onEdit, onDelete }) {
  const isOverLimit = entry.limit > 0 && entry.used > entry.limit;
  const isNearLimit = !isOverLimit && entry.limit > 0 && entry.percent >= 80;

  return (
    <div className={`budget-manage-row ${isOverLimit ? "over-limit" : isNearLimit ? "near-limit" : ""}`}>
      <div className="budget-row-top">
        <span>{category?.icon || "•"} {category?.name || "Categoria removida"}</span>
        <small>{formatCurrency(entry.used)} / {formatCurrency(entry.limit)}</small>
      </div>
      <ProgressBar percent={entry.percent} />
      <div className="budget-manage-row-footer">
        {isOverLimit ? (
          <span className="over-limit-badge">Limite excedido · {entry.percent}%</span>
        ) : isNearLimit ? (
          <span className="near-limit-badge">Perto do limite · {entry.percent}%</span>
        ) : (
          <span className="muted-note">{entry.percent}% utilizado</span>
        )}
        <div className="transaction-row-actions">
          <button type="button" className="icon-btn small" onClick={() => onEdit(entry)} aria-label="Editar limite">
            <Pencil size={14} />
          </button>
          <button type="button" className="icon-btn small danger" onClick={() => onDelete(entry)} aria-label="Remover limite">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
