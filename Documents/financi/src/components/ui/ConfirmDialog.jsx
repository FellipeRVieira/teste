import { AlertTriangle, HelpCircle } from "lucide-react";

// Substitui window.confirm() por um diálogo estilizado, consistente com o
// restante da UI (mesmo overlay/animação do Modal). `danger` deixa o ícone
// e o botão de confirmação em vermelho, para ações destrutivas/irreversíveis.
export default function ConfirmDialog({
  title = "Confirmar ação",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="modal confirm-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className={`confirm-icon ${danger ? "danger" : ""}`}>
          {danger ? <AlertTriangle size={22} /> : <HelpCircle size={22} />}
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={danger ? "danger-btn" : "primary-btn"} onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
