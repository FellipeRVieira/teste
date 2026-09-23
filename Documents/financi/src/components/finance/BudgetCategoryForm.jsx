import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { parseCurrencyInput } from "../../utils/currency";

function toAmountText(value) {
  if (!value && value !== 0) return "";
  return String(value).replace(".", ",");
}

// Formulário para definir o limite de uma categoria no orçamento do mês.
// Ao editar, a categoria já está fixada (não faz sentido trocar a
// categoria de um limite já existente — a UI cria um novo limite em vez
// disso), então o select só aparece na criação.
export default function BudgetCategoryForm({ categories, initialValue, onSubmit, onCancel }) {
  const isEditing = Boolean(initialValue?.categoryId);
  const [categoryId, setCategoryId] = useState(initialValue?.categoryId || "");
  const [limit, setLimit] = useState(toAmountText(initialValue?.limit));
  const [errors, setErrors] = useState({});

  const selectedCategory = categories.find((c) => c.id === categoryId);

  function validate() {
    const nextErrors = {};
    const parsedLimit = limit.trim() === "" ? NaN : parseCurrencyInput(limit);
    if (!categoryId) nextErrors.categoryId = "Selecione uma categoria.";
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) nextErrors.limit = "Informe um limite maior que zero.";
    setErrors(nextErrors);
    return { valid: Object.keys(nextErrors).length === 0, parsedLimit };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { valid, parsedLimit } = validate();
    if (!valid) return;
    onSubmit({ categoryId, limit: parsedLimit });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="field-hint">
        O limite é apenas um valor de referência definido por você, comparado às despesas já lançadas na categoria.
      </p>

      {isEditing ? (
        <label>
          Categoria
          <input value={`${selectedCategory?.icon || ""} ${selectedCategory?.name || ""}`.trim()} disabled />
        </label>
      ) : (
        <label>
          Categoria
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </label>
      )}
      {errors.categoryId && <p className="field-error">{errors.categoryId}</p>}

      <label>
        Limite mensal
        <input inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0,00" />
      </label>
      {errors.limit && <p className="field-error">{errors.limit}</p>}

      <div className="modal-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary-btn">
          {isEditing ? <><Save size={18} /> Salvar alterações</> : <><Plus size={18} /> Adicionar limite</>}
        </button>
      </div>
    </form>
  );
}
