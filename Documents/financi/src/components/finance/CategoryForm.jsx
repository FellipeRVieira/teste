import { useState } from "react";
import { Plus, Save } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "expense", label: "Despesa" },
  { value: "income", label: "Receita" },
  { value: "both", label: "Ambos" },
];

export default function CategoryForm({ initialValue, onSubmit, onCancel }) {
  const isEditing = Boolean(initialValue?.id);
  const [name, setName] = useState(initialValue?.name || "");
  const [type, setType] = useState(initialValue?.type || "expense");
  const [icon, setIcon] = useState(initialValue?.icon || "✨");
  const [color, setColor] = useState(initialValue?.color || "#6c5ce7");
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Nome é obrigatório.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), type, icon: icon.trim() || "✨", color });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Nome
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Educação" />
      </label>
      {errors.name && <p className="field-error">{errors.name}</p>}

      <label>
        Ícone <span className="optional">(emoji)</span>
        <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="✨" maxLength={4} />
      </label>

      <label>
        Tipo
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>

      <label>
        Cor
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: 40, padding: 4 }} />
      </label>

      <div className="modal-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary-btn">
          {isEditing ? <><Save size={18} /> Salvar alterações</> : <><Plus size={18} /> Adicionar categoria</>}
        </button>
      </div>
    </form>
  );
}
