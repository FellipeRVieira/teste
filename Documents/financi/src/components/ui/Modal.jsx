import { X } from "lucide-react";

export default function Modal({ eyebrow, title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
