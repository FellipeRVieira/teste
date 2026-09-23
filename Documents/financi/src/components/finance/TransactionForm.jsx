import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { parseCurrencyInput } from "../../utils/currency";
import { todayIso } from "../../utils/dates";

function toAmountText(value) {
  if (!value && value !== 0) return "";
  return String(value).replace(".", ",");
}

export default function TransactionForm({ categories, accounts, initialValue, onSubmit, onCancel }) {
  const isEditing = Boolean(initialValue?.id);
  const [type, setType] = useState(initialValue?.type || "expense");
  const [amount, setAmount] = useState(toAmountText(initialValue?.amount));
  const [description, setDescription] = useState(initialValue?.description || "");
  const [categoryId, setCategoryId] = useState(initialValue?.categoryId || "");
  const [accountId, setAccountId] = useState(initialValue?.accountId || "");
  const [date, setDate] = useState(initialValue?.date || todayIso());
  const [notes, setNotes] = useState(initialValue?.notes || "");
  const [errors, setErrors] = useState({});

  const activeCategories = categories.filter((c) => c.active !== false);
  const activeAccounts = accounts.filter((a) => a.active !== false);
  const availableCategories = activeCategories.filter((c) => c.type === type || c.type === "both");

  function validate() {
    const nextErrors = {};
    const parsedAmount = parseCurrencyInput(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = "Informe um valor maior que zero.";
    }
    if (!description.trim()) {
      nextErrors.description = "Descrição é obrigatória.";
    }
    if (!categoryId) {
      nextErrors.categoryId = "Selecione uma categoria.";
    } else {
      const category = activeCategories.find((c) => c.id === categoryId);
      if (category && category.type !== "both" && category.type !== type) {
        nextErrors.categoryId = "Esta categoria não é compatível com o tipo escolhido.";
      }
    }
    if (!date) {
      nextErrors.date = "Selecione uma data.";
    }

    setErrors(nextErrors);
    return { valid: Object.keys(nextErrors).length === 0, parsedAmount };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { valid, parsedAmount } = validate();
    if (!valid) return;

    onSubmit({
      type,
      amount: parsedAmount,
      description: description.trim(),
      categoryId,
      accountId: accountId || null,
      date,
      notes: notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="amount-input">
        <span>R$</span>
        <input
          autoFocus
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0,00"
        />
      </div>
      {errors.amount && <p className="field-error centered">{errors.amount}</p>}

      <div className="type-toggle">
        <button
          type="button"
          className={type === "income" ? "selected income-btn" : ""}
          onClick={() => { setType("income"); setCategoryId(""); }}
        >
          ↑ Receita
        </button>
        <button
          type="button"
          className={type === "expense" ? "selected expense-btn" : ""}
          onClick={() => { setType("expense"); setCategoryId(""); }}
        >
          ↓ Despesa
        </button>
      </div>

      <label>
        Categoria
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Selecione...</option>
          {availableCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </label>
      {errors.categoryId && <p className="field-error">{errors.categoryId}</p>}

      <label>
        Conta ou cartão <span className="optional">(opcional)</span>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          <option value="">Não informado</option>
          {activeAccounts.map((a) => (
            <option key={a.id} value={a.id}>{a.kind === "card" ? "💳 " : "🏦 "}{a.name}</option>
          ))}
        </select>
      </label>

      <label>
        Data
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      {errors.date && <p className="field-error">{errors.date}</p>}

      <label>
        Descrição
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: Almoço"
        />
      </label>
      {errors.description && <p className="field-error">{errors.description}</p>}

      <label>
        Observação <span className="optional">(opcional)</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: Compra semanal" />
      </label>

      <div className="modal-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary-btn">
          {isEditing ? <><Save size={18} /> Salvar alterações</> : <><Plus size={18} /> Adicionar lançamento</>}
        </button>
      </div>
    </form>
  );
}
