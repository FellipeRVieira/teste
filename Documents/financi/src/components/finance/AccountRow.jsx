import { Pencil, Trash2, Wallet } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

const TYPE_LABEL = { checking: "Conta corrente", savings: "Poupança", cash: "Dinheiro em espécie", other: "Outra" };

export default function AccountRow({ account, onEdit, onDelete }) {
  return (
    <div className="transaction-row support-row">
      <span className="transaction-icon" style={{ background: `${account.color}1f`, color: account.color }}>
        <Wallet size={14} />
      </span>
      <div className="transaction-info">
        <strong>{account.name}</strong>
        <small>
          {TYPE_LABEL[account.type] || account.type} · saldo inicial {formatCurrency(account.initialBalance)}
          {account.active === false ? " · inativa" : ""}
        </small>
      </div>
      <div className="transaction-row-actions">
        <button type="button" className="icon-btn small" onClick={() => onEdit(account)} aria-label="Editar">
          <Pencil size={14} />
        </button>
        <button type="button" className="icon-btn small danger" onClick={() => onDelete(account)} aria-label="Excluir">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
