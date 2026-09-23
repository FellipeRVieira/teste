import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { parseCurrencyInput } from "../../utils/currency";

function toAmountText(value) {
  if (!value && value !== 0) return "";
  return String(value).replace(".", ",");
}

export default function CardForm({ initialValue, onSubmit, onCancel }) {
  const isEditing = Boolean(initialValue?.id);
  const [name, setName] = useState(initialValue?.name || "");
  const [brand, setBrand] = useState(initialValue?.brand || "");
  const [limit, setLimit] = useState(toAmountText(initialValue?.limit));
  const [closingDay, setClosingDay] = useState(initialValue?.closingDay ? String(initialValue.closingDay) : "");
  const [dueDay, setDueDay] = useState(initialValue?.dueDay ? String(initialValue.dueDay) : "");
  const [color, setColor] = useState(initialValue?.color || "#6c5ce7");
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};
    const parsedLimit = limit.trim() === "" ? 0 : parseCurrencyInput(limit);

    if (!name.trim()) nextErrors.name = "Nome é obrigatório.";
    if (!Number.isFinite(parsedLimit) || parsedLimit < 0) nextErrors.limit = "Informe um limite válido.";
    if (closingDay && (Number(closingDay) < 1 || Number(closingDay) > 31)) nextErrors.closingDay = "Dia entre 1 e 31.";
    if (dueDay && (Number(dueDay) < 1 || Number(dueDay) > 31)) nextErrors.dueDay = "Dia entre 1 e 31.";

    setErrors(nextErrors);
    return { valid: Object.keys(nextErrors).length === 0, parsedLimit };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { valid, parsedLimit } = validate();
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      brand: brand.trim(),
      limit: parsedLimit,
      closingDay: closingDay ? Number(closingDay) : null,
      dueDay: dueDay ? Number(dueDay) : null,
      color,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="field-hint">
        Cartão representativo — os dados são preenchidos e atualizados por você. A fatura atual é calculada
        automaticamente a partir das compras cadastradas na aba Compras; nenhuma cobrança real é processada por
        esta plataforma.
      </p>

      <label>
        Nome
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cartão Nubank" />
      </label>
      {errors.name && <p className="field-error">{errors.name}</p>}

      <label>
        Bandeira <span className="optional">(opcional)</span>
        <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex.: Mastercard" />
      </label>

      <label>
        Limite
        <input inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0,00" />
      </label>
      {errors.limit && <p className="field-error">{errors.limit}</p>}

      <div className="form-grid-2">
        <label>
          Dia de fechamento <span className="optional">(opcional)</span>
          <input type="number" min="1" max="31" value={closingDay} onChange={(e) => setClosingDay(e.target.value)} placeholder="Ex.: 28" />
        </label>
        <label>
          Dia de vencimento <span className="optional">(opcional)</span>
          <input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} placeholder="Ex.: 5" />
        </label>
      </div>
      {errors.closingDay && <p className="field-error">{errors.closingDay}</p>}
      {errors.dueDay && <p className="field-error">{errors.dueDay}</p>}

      <label>
        Cor
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: 40, padding: 4 }} />
      </label>

      <div className="modal-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary-btn">
          {isEditing ? <><Save size={18} /> Salvar alterações</> : <><Plus size={18} /> Adicionar cartão</>}
        </button>
      </div>
    </form>
  );
}
