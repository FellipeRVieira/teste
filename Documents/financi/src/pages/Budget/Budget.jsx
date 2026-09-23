import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Save } from "lucide-react";
import Header from "../../components/layout/Header";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import BudgetCategoryForm from "../../components/finance/BudgetCategoryForm";
import BudgetCategoryRow from "../../components/finance/BudgetCategoryRow";
import { useTransactions } from "../../hooks/useTransactions";
import { useCategories } from "../../hooks/useCategories";
import { useBudget } from "../../hooks/useBudget";
import { getBudgetUsage } from "../../utils/finance";
import { formatCurrency, parseCurrencyInput } from "../../utils/currency";
import { currentMonthKey, monthKeyOffset, monthYearLabel } from "../../utils/dates";

function toAmountText(value) {
  if (!value && value !== 0) return "";
  return String(value).replace(".", ",");
}

// Formulário simples de limite geral do mês — mantido local à página, no
// mesmo espírito de StatCard em Dashboard.jsx.
function TotalLimitForm({ initialValue, onSubmit, onCancel }) {
  const [value, setValue] = useState(toAmountText(initialValue));
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const parsed = value.trim() === "" ? 0 : parseCurrencyInput(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Informe um valor válido.");
      return;
    }
    onSubmit(parsed);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="field-hint">
        O limite geral é apenas uma referência mensal definida por você, comparada ao total de despesas já lançadas.
      </p>
      <label>
        Limite geral do mês
        <input autoFocus inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" />
      </label>
      {error && <p className="field-error">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary-btn"><Save size={18} /> Salvar limite</button>
      </div>
    </form>
  );
}

export default function Budget() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { budget, saveTotalLimit, saveCategoryLimit, removeCategoryLimit } = useBudget(selectedMonth);
  const [modalState, setModalState] = useState(null); // { type: "total" | "category", mode?, entry? }

  const usage = getBudgetUsage(budget, transactions, selectedMonth);
  const budgetableCategories = categories.filter((c) => c.active !== false && c.type !== "income");
  const availableCategories = budgetableCategories.filter(
    (c) => !budget.categories.some((entry) => entry.categoryId === c.id)
  );

  function goToPreviousMonth() {
    const [y, m] = selectedMonth.split("-").map(Number);
    setSelectedMonth(monthKeyOffset(1, new Date(y, m - 1, 1)));
  }

  function goToNextMonth() {
    const [y, m] = selectedMonth.split("-").map(Number);
    setSelectedMonth(monthKeyOffset(-1, new Date(y, m - 1, 1)));
  }

  function closeModal() {
    setModalState(null);
  }

  function handleSaveTotal(value) {
    saveTotalLimit(value);
    closeModal();
  }

  function handleSaveCategory(data) {
    saveCategoryLimit(data.categoryId, data.limit);
    closeModal();
  }

  function handleDeleteCategory(entry) {
    const category = categories.find((c) => c.id === entry.categoryId);
    const confirmed = window.confirm(`Remover o limite definido para "${category?.name || "esta categoria"}"?`);
    if (confirmed) removeCategoryLimit(entry.categoryId);
  }

  return (
    <>
      <Header eyebrow="ORÇAMENTO" title="Orçamento" />
      <main className="content">
        <p className="page-lead">
          Defina limites de referência para o mês. Os valores utilizados são sempre calculados a partir das suas
          despesas já lançadas — nenhum pagamento é feito por aqui.
        </p>

        <div className="month-switcher">
          <button type="button" className="icon-btn small" onClick={goToPreviousMonth} aria-label="Mês anterior">
            <ChevronLeft size={16} />
          </button>
          <strong>{monthYearLabel(selectedMonth)}</strong>
          <button type="button" className="icon-btn small" onClick={goToNextMonth} aria-label="Próximo mês">
            <ChevronRight size={16} />
          </button>
          {selectedMonth !== currentMonthKey() && (
            <button type="button" className="link-btn" onClick={() => setSelectedMonth(currentMonthKey())}>
              Voltar para o mês atual
            </button>
          )}
        </div>

        <section className="panel" style={{ marginTop: 15 }}>
          <div className="panel-heading">
            <div>
              <h2>Orçamento geral do mês</h2>
              <p>{usage.totalLimit > 0 ? "Limite definido por você" : "Ainda sem limite geral definido"}</p>
            </div>
            <button type="button" className="primary-btn" onClick={() => setModalState({ type: "total" })}>
              {usage.totalLimit > 0 ? "Editar limite" : "Definir limite"}
            </button>
          </div>
          <div className="budget-summary">
            <div><span>Utilizado</span><strong>{formatCurrency(usage.totalUsed)}</strong></div>
            <div><span>Disponível</span><strong className={usage.totalLimit > 0 && usage.totalUsed > usage.totalLimit ? "negative" : "positive"}>{formatCurrency(usage.available)}</strong></div>
            <div
              className="budget-ring"
              style={{ background: `conic-gradient(${usage.percent > 100 ? "var(--danger)" : "var(--primary)"} 0 ${Math.min(100, usage.percent)}%, #ececf2 ${Math.min(100, usage.percent)}%)` }}
            >
              <span>{usage.percent}%</span>
            </div>
          </div>
          {usage.totalLimit > 0 && usage.totalUsed > usage.totalLimit && (
            <p className="over-limit-note">O total gasto já ultrapassou o limite geral definido para o mês.</p>
          )}
          {usage.totalLimit > 0 && usage.totalUsed <= usage.totalLimit && usage.percent >= 80 && (
            <p className="near-limit-note">O total gasto já está perto do limite geral definido para o mês.</p>
          )}
        </section>

        <section className="panel" style={{ marginTop: 15 }}>
          <div className="panel-heading">
            <div><h2>Limites por categoria</h2><p>Comparados às despesas lançadas em cada categoria</p></div>
            <button
              type="button"
              className="primary-btn"
              disabled={availableCategories.length === 0}
              onClick={() => setModalState({ type: "category", mode: "create" })}
            >
              <Plus size={18} /> Adicionar limite
            </button>
          </div>
          {usage.categories.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="Nenhum limite por categoria"
              description="Adicione limites para as categorias de despesa que você quer acompanhar de perto."
            />
          ) : (
            <div className="budget-manage-list">
              {usage.categories.map((entry) => (
                <BudgetCategoryRow
                  key={entry.categoryId}
                  entry={entry}
                  category={categories.find((c) => c.id === entry.categoryId)}
                  onEdit={(e) => setModalState({ type: "category", mode: "edit", entry: e })}
                  onDelete={handleDeleteCategory}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {modalState?.type === "total" && (
        <Modal eyebrow="ORÇAMENTO GERAL" title="Limite geral do mês" onClose={closeModal}>
          <TotalLimitForm initialValue={usage.totalLimit} onSubmit={handleSaveTotal} onCancel={closeModal} />
        </Modal>
      )}

      {modalState?.type === "category" && (
        <Modal
          eyebrow={modalState.mode === "edit" ? "EDITAR LIMITE" : "NOVO LIMITE"}
          title="Limite por categoria"
          onClose={closeModal}
        >
          <BudgetCategoryForm
            categories={modalState.mode === "edit" ? budgetableCategories : availableCategories}
            initialValue={modalState.mode === "edit" ? modalState.entry : undefined}
            onSubmit={handleSaveCategory}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </>
  );
}
