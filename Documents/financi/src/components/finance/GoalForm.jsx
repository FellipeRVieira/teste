import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { parseCurrencyInput } from "../../utils/currency";

const STATUS_OPTIONS = [
  { value: "active", label: "Ativa" },
  { value: "paused", label: "Pausada" },
];

function toAmountText(value) {
  if (!value && value !== 0) return "";
  return String(value).replace(".", ",");
}

export default function GoalForm({ initialValue, onSubmit, onCancel }) {
  const isEditing = Boolean(initialValue?.id);
  const [title, setTitle] = useState(initialValue?.title || "");
  const [targetAmount, setTargetAmount] = useState(toAmountText(initialValue?.targetAmount));
  const [currentAmount, setCurrentAmount] = useState(toAmountText(initialValue?.currentAmount ?? 0));
  const [deadline, setDeadline] = useState(initialValue?.deadline || "");
  const [icon, setIcon] = useState(initialValue?.icon || "🎯");
  const [color, setColor] = useState(initialValue?.color || "#6c5ce7");
  const [status, setStatus] = useState(initialValue?.status === "paused" ? "paused" : "active");
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};
    const parsedTarget = parseCurrencyInput(targetAmount);
    const parsedCurrent = currentAmount.trim() === "" ? 0 : parseCurrencyInput(currentAmount);

    if (!title.trim()) nextErrors.title = "Dê um nome para a meta.";
    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) nextErrors.targetAmount = "Informe um valor-alvo maior que zero.";
    if (!Number.isFinite(parsedCurrent) || parsedCurrent < 0) nextErrors.currentAmount = "Informe um valor já guardado válido.";

    setErrors(nextErrors);
    return { valid: Object.keys(nextErrors).length === 0, parsedTarget, parsedCurrent };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { valid, parsedTarget, parsedCurrent } = validate();
    if (!valid) return;

    const reachedTarget = parsedCurrent >= parsedTarget;
    onSubmit({
      title: title.trim(),
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      deadline: deadline || null,
      icon: icon.trim() || "🎯",
      color,
      status: reachedTarget ? "completed" : status,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="field-hint">
        Metas são planos de organização pessoal. O valor guardado é preenchido por você a qualquer momento — nenhuma
        transferência real é feita entre contas.
      </p>

      <label>
        Título
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Viagem" />
      </label>
      {errors.title && <p className="field-error">{errors.title}</p>}

      <div className="form-grid-2">
        <label>
          Valor-alvo
          <input inputMode="decimal" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0,00" />
        </label>
        <label>
          Já guardado
          <input inputMode="decimal" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0,00" />
        </label>
      </div>
      {errors.targetAmount && <p className="field-error">{errors.targetAmount}</p>}
      {errors.currentAmount && <p className="field-error">{errors.currentAmount}</p>}

      <div className="form-grid-2">
        <label>
          Prazo <span className="optional">(opcional)</span>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
        <label>
          Ícone <span className="optional">(emoji)</span>
          <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} placeholder="🎯" />
        </label>
      </div>

      <div className="form-grid-2">
        <label>
          Cor
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: 40, padding: 4 }} />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
      </div>

      <div className="modal-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary-btn">
          {isEditing ? <><Save size={18} /> Salvar alterações</> : <><Plus size={18} /> Criar meta</>}
        </button>
      </div>
    </form>
  );
}
