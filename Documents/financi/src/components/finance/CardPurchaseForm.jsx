import { useState } from "react";
import { Plus, Save } from "lucide-react";
import { parseCurrencyInput, formatCurrency } from "../../utils/currency";
import { todayIso } from "../../utils/dates";

function toAmountText(value) {
  if (!value && value !== 0) return "";
  return String(value).replace(".", ",");
}

export default function CardPurchaseForm({ cards, initialValue, defaultCardId, onSubmit, onCancel }) {
  const isEditing = Boolean(initialValue?.id);
  const activeCards = cards.filter((c) => c.active !== false);
  const [cardId, setCardId] = useState(initialValue?.cardId || defaultCardId || activeCards[0]?.id || "");
  const [description, setDescription] = useState(initialValue?.description || "");
  const [monthlyAmount, setMonthlyAmount] = useState(toAmountText(initialValue?.monthlyAmount));
  const [installments, setInstallments] = useState(initialValue?.installments ? String(initialValue.installments) : "1");
  const [purchaseDate, setPurchaseDate] = useState(initialValue?.purchaseDate || todayIso());
  const [errors, setErrors] = useState({});

  const parsedMonthly = parseCurrencyInput(monthlyAmount);
  const parsedInstallments = Math.max(1, Number(installments) || 1);
  const computedTotal =
    Number.isFinite(parsedMonthly) && parsedMonthly > 0 ? parsedMonthly * parsedInstallments : 0;

  function validate() {
    const nextErrors = {};
    if (!cardId) nextErrors.cardId = "Selecione um cartão.";
    if (!description.trim()) nextErrors.description = "Descrição é obrigatória.";
    if (!Number.isFinite(parsedMonthly) || parsedMonthly <= 0) {
      nextErrors.monthlyAmount = "Informe um valor mensal maior que zero.";
    }
    if (!installments || Number(installments) < 1) nextErrors.installments = "Informe ao menos 1 vez.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      cardId,
      description: description.trim(),
      monthlyAmount: parsedMonthly,
      installments: parsedInstallments,
      purchaseDate: purchaseDate || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="field-hint">
        Compra representativa — organiza quanto dessa compra ainda impacta a mensalidade do cartão. Não é uma
        cobrança real e não altera a fatura atual informada manualmente.
      </p>

      <label>
        Cartão
        <select value={cardId} onChange={(e) => setCardId(e.target.value)}>
          <option value="">Selecione...</option>
          {activeCards.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      {errors.cardId && <p className="field-error">{errors.cardId}</p>}

      <label>
        Compra
        <input
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: PS5"
        />
      </label>
      {errors.description && <p className="field-error">{errors.description}</p>}

      <div className="form-grid-2">
        <label>
          Valor a pagar mensalmente
          <input
            inputMode="decimal"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
            placeholder="0,00"
          />
        </label>
        <label>
          Dividido em quantas vezes
          <input
            type="number"
            min="1"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            placeholder="Ex.: 4"
          />
        </label>
      </div>
      {errors.monthlyAmount && <p className="field-error">{errors.monthlyAmount}</p>}
      {errors.installments && <p className="field-error">{errors.installments}</p>}

      <div className="purchase-total-preview">
        <span>Total da compra</span>
        <strong>{formatCurrency(computedTotal)}</strong>
      </div>

      <label>
        Data da compra <span className="optional">(opcional)</span>
        <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
      </label>

      <div className="modal-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary-btn">
          {isEditing ? <><Save size={18} /> Salvar alterações</> : <><Plus size={18} /> Adicionar compra</>}
        </button>
      </div>
    </form>
  );
}
