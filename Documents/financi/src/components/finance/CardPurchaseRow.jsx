import { Pencil, Trash2, ShoppingBag } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

export default function CardPurchaseRow({ purchase, onEdit, onDelete }) {
  return (
    <div className="transaction-row support-row">
      <span className="transaction-icon" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
        <ShoppingBag size={14} />
      </span>
      <div className="transaction-info">
        <strong>{purchase.description}</strong>
        <small>
          {formatCurrency(purchase.monthlyAmount)}/mês · {purchase.installments}x · total {formatCurrency(purchase.totalAmount)}
          {purchase.purchaseDate ? ` · ${new Date(purchase.purchaseDate + "T00:00:00").toLocaleDateString("pt-BR")}` : ""}
        </small>
      </div>
      <div className="transaction-row-actions">
        <button type="button" className="icon-btn small" onClick={() => onEdit(purchase)} aria-label="Editar compra">
          <Pencil size={14} />
        </button>
        <button type="button" className="icon-btn small danger" onClick={() => onDelete(purchase)} aria-label="Excluir compra">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
