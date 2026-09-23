import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { parseCurrencyInput } from "../../utils/currency";

const TYPE_OPTIONS = [
  { value: "checking", label: "Conta corrente" },
  { value: "savings", label: "Poupança" },
  { value: "cash", label: "Dinheiro em espécie" },
  { value: "other", label: "Outra" },
];

function toAmountText(value) {
  if (!value && value !== 0) return "";
  return String(value).replace(".", ",");
}

export default function AccountForm({ initialValue, onSubmit, onCancel }) {
  const isEditing = Boolean(initialValue?.id);
  const [name, setName] = useState(initialValue?.name || "");
  const [type, setType] = useState(initialValue?.type || "checking");
  const [initialBalance, setInitialBalance] = useState(toAmountText(initialValue?.initialBalance));
  const [color, setColor] = useState(initialValue?.color || "#6c5ce7");
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};
    const parsedBalance = initialBalance.trim() === "" ? 0 : parseCurrencyInput(initialBalance);
    if (!name.trim()) nextErrors.name = "Nome é obrigatório.";
    if (!Number.isFinite(parsedBalance)) nextErrors.initialBalance = "Informe um valor válido.";
    setErrors(nextErrors);
    return { valid: Object.keys(nextErrors).length === 0, parsedBalance };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { valid, parsedBalance } = validate();
    if (!valid) return;
    onSubmit({ name: name.trim(), type, initialBalance: parsedBalance, color });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="field-hint">
        Registro organizacional — não conecta com seu banco nem movimenta dinheiro real.
      </p>

      <label>
        Nome
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Conta Corrente" />
      </label>
      {errors.name && <p className="field-error">{errors.name}</p>}

      <label>
        Tipo
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>

      <label>
        Saldo inicial <span className="optional">(informativo)</span>
        <input
          inputMode="decimal"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          placeholder="0,00"
        />
      </label>
      {errors.initialBalance && <p className="field-error">{errors.initialBalance}</p>}

      <label>
        Cor
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: 40, padding: 4 }} />
      </label>

      <div className="modal-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary-btn">
          {isEditing ? <><Save size={18} /> Salvar alterações</> : <><Plus size={18} /> Adicionar conta</>}
        </button>
      </div>
    </form>
  );
}
