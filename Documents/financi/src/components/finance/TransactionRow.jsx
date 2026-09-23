import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { formatRelativeDate } from "../../utils/dates";

export default function TransactionRow({ transaction, category, account, onEdit, onDelete }) {
  const isIncome = transaction.type === "income";
  return (
    <div className="transaction-row">
      <span className="transaction-icon">{category?.icon || "•"}</span>
      <div className="transaction-info">
        <strong>{transaction.description}</strong>
        <small>{category?.name || "Sem categoria"}{account ? ` · ${account.name}` : ""}</small>
      </div>
      <small className="transaction-date">{formatRelativeDate(transaction.date)}</small>
      <strong className={isIncome ? "amount-positive" : "amount-negative"}>
        {isIncome ? "+" : "-"} {formatCurrency(Math.abs(transaction.amount))}
      </strong>
      {(onEdit || onDelete) && (
        <div className="transaction-row-actions">
          {onEdit && (
            <button type="button" className="icon-btn small" onClick={() => onEdit(transaction)} aria-label="Editar">
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button type="button" className="icon-btn small danger" onClick={() => onDelete(transaction)} aria-label="Excluir">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
