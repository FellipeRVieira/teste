import { useState } from "react";
import { PiggyBank } from "lucide-react";
import { parseCurrencyInput, formatCurrency } from "../../utils/currency";

// Aporte é sempre um registro/planejamento manual do progresso da meta —
// nunca uma transferência real entre contas (CLAUDE.md).
export default function GoalContributionForm({ goal, onSubmit, onCancel }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const parsed = parseCurrencyInput(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    onSubmit(parsed);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="field-hint">
        Este aporte apenas atualiza o valor guardado de "{goal.title}" ({formatCurrency(goal.currentAmount)} de{" "}
        {formatCurrency(goal.targetAmount)}). Nenhum valor é debitado de conta ou cartão.
      </p>

      <label>
        Valor do aporte
        <input autoFocus inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
      </label>
      {error && <p className="field-error">{error}</p>}

      <div className="modal-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary-btn">
          <PiggyBank size={18} /> Registrar aporte
        </button>
      </div>
    </form>
  );
}
