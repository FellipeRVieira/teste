import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";

export default function CardTile({ card, onEdit, onDelete, purchasesSummary }) {
  const currentInvoice = purchasesSummary?.monthlyTotal || 0;
  const purchaseCount = purchasesSummary?.count || 0;
  const used = card.limit > 0 ? Math.min(100, Math.round((currentInvoice / card.limit) * 100)) : 0;

  return (
    <article
      className="card-tile"
      style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)` }}
    >
      <div className="card-tile-top">
        <span>{card.brand || "Cartão"}</span>
        <div className="card-tile-actions">
          <button type="button" className="icon-btn small" onClick={() => onEdit(card)} aria-label="Editar">
            <Pencil size={13} />
          </button>
          <button type="button" className="icon-btn small" onClick={() => onDelete(card)} aria-label="Excluir">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <strong className="card-tile-name">{card.name}</strong>
      <div className="card-tile-invoice">
        <span>Fatura atual (soma das compras)</span>
        <strong>{formatCurrency(currentInvoice)}</strong>
      </div>
      <div className="card-tile-progress">
        <div className="progress"><i style={{ width: `${used}%`, background: "rgba(255,255,255,.85)" }} /></div>
        <small>{formatCurrency(currentInvoice)} de {formatCurrency(card.limit)} de limite</small>
      </div>
      <div className="card-tile-dates">
        {card.closingDay && <span>Fecha dia {card.closingDay}</span>}
        {card.dueDay && <span>Vence dia {card.dueDay}</span>}
        {card.active === false && <span>Inativo</span>}
      </div>
      <div className="card-tile-purchases">
        <span>{purchaseCount > 0 ? `${purchaseCount} compra(s) cadastrada(s)` : "Nenhuma compra cadastrada"}</span>
      </div>
    </article>
  );
}
