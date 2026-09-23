import { useMemo, useState } from "react";
import { ArrowDownUp, Plus } from "lucide-react";
import Header from "../../components/layout/Header";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import TransactionRow from "../../components/finance/TransactionRow";
import TransactionForm from "../../components/finance/TransactionForm";
import { useTransactions } from "../../hooks/useTransactions";
import { useCategories } from "../../hooks/useCategories";
import { useAccounts } from "../../hooks/useAccounts";
import { formatCurrency } from "../../utils/currency";
import { getTotalIncome, getTotalExpenses } from "../../utils/finance";
import { currentMonthKey, monthKeyOffset, shortMonthLabel } from "../../utils/dates";

const PERIOD_OPTIONS = [
  { value: "all", label: "Todos os períodos" },
  { value: currentMonthKey(), label: `${shortMonthLabel(currentMonthKey())} (este mês)` },
  { value: monthKeyOffset(1), label: `${shortMonthLabel(monthKeyOffset(1))} (mês passado)` },
];

export default function Transactions() {
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [type, setType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [modalState, setModalState] = useState(null); // null | { mode: "create" } | { mode: "edit", transaction }

  const filtered = useMemo(() => {
    let result = transactions;

    if (period !== "all") result = result.filter((t) => t.date?.startsWith(period));
    if (type !== "all") result = result.filter((t) => t.type === type);
    if (categoryId !== "all") result = result.filter((t) => t.categoryId === categoryId);
    if (accountId !== "all") result = result.filter((t) => t.accountId === accountId);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(q));
    }

    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case "date-asc": return a.date < b.date ? -1 : 1;
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc": return a.amount - b.amount;
        case "date-desc":
        default: return a.date < b.date ? 1 : -1;
      }
    });
    return sorted;
  }, [transactions, period, type, categoryId, accountId, search, sortBy]);

  const totalIncome = getTotalIncome(filtered);
  const totalExpenses = getTotalExpenses(filtered);

  function handleSubmit(data) {
    if (modalState?.mode === "edit") {
      editTransaction(modalState.transaction.id, data);
    } else {
      addTransaction(data);
    }
    setModalState(null);
  }

  function handleDelete(transaction) {
    const confirmed = window.confirm(`Excluir o lançamento "${transaction.description}"? Esta ação não pode ser desfeita.`);
    if (confirmed) deleteTransaction(transaction.id);
  }

  const hasFilters = search || period !== "all" || type !== "all" || categoryId !== "all" || accountId !== "all";

  return (
    <>
      <Header
        eyebrow="LANÇAMENTOS"
        title="Transações"
        onNewTransaction={() => setModalState({ mode: "create" })}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por descrição..."
      />
      <main className="content">
        <section className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="stat-card income">
            <div className="stat-top"><span>Receitas no filtro</span><span className="stat-icon">↑</span></div>
            <strong>{formatCurrency(totalIncome)}</strong>
          </div>
          <div className="stat-card expense">
            <div className="stat-top"><span>Despesas no filtro</span><span className="stat-icon">↓</span></div>
            <strong>{formatCurrency(totalExpenses)}</strong>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>Lançamentos encontrados</span><span className="stat-icon">↗</span></div>
            <strong>{filtered.length}</strong>
          </div>
        </section>

        <section className="panel" style={{ marginTop: 15 }}>
          <div className="filters-bar">
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIOD_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="all">Todas as categorias</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="all">Todas as contas/cartões</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <button
              type="button"
              className="select-btn"
              onClick={() => setSortBy(sortBy === "date-desc" ? "date-asc" : "date-desc")}
              title="Ordenar por data"
            >
              <ArrowDownUp size={14} /> Data
            </button>
            <button
              type="button"
              className="select-btn"
              onClick={() => setSortBy(sortBy === "amount-desc" ? "amount-asc" : "amount-desc")}
              title="Ordenar por valor"
            >
              <ArrowDownUp size={14} /> Valor
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Nenhum lançamento encontrado"
              description={hasFilters ? "Ajuste os filtros ou a busca para ver outros lançamentos." : "Adicione seu primeiro lançamento para começar a organizar suas finanças."}
              action={(
                <button type="button" className="primary-btn" onClick={() => setModalState({ mode: "create" })} style={{ marginTop: 14 }}>
                  <Plus size={18} /> Nova transação
                </button>
              )}
            />
          ) : (
            <div className="transaction-list padded">
              {filtered.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  category={categories.find((c) => c.id === t.categoryId)}
                  account={accounts.find((a) => a.id === t.accountId)}
                  onEdit={(tx) => setModalState({ mode: "edit", transaction: tx })}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {modalState && (
        <Modal
          eyebrow={modalState.mode === "edit" ? "EDITAR LANÇAMENTO" : "NOVO LANÇAMENTO"}
          title="O que aconteceu?"
          onClose={() => setModalState(null)}
        >
          <TransactionForm
            categories={categories}
            accounts={accounts}
            initialValue={modalState.mode === "edit" ? modalState.transaction : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setModalState(null)}
          />
        </Modal>
      )}
    </>
  );
}
