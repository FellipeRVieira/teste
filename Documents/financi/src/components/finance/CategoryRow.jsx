import { Pencil, Trash2 } from "lucide-react";

const TYPE_LABEL = { expense: "Despesa", income: "Receita", both: "Ambos" };

export default function CategoryRow({ category, onEdit, onDelete }) {
  return (
    <div className="transaction-row support-row">
      <span className="transaction-icon" style={{ background: `${category.color}1f` }}>{category.icon}</span>
      <div className="transaction-info">
        <strong>{category.name}</strong>
        <small>{TYPE_LABEL[category.type] || category.type}{category.active === false ? " · inativa" : ""}</small>
      </div>
      <div className="transaction-row-actions">
        <button type="button" className="icon-btn small" onClick={() => onEdit(category)} aria-label="Editar">
          <Pencil size={14} />
        </button>
        <button type="button" className="icon-btn small danger" onClick={() => onDelete(category)} aria-label="Excluir">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
