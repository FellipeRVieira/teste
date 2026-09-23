import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import Header from "../../components/layout/Header";
import Modal from "../../components/ui/Modal";
import ProgressBar from "../../components/ui/ProgressBar";
import FinancialChart from "../../components/charts/FinancialChart";
import CategoryDonut from "../../components/charts/CategoryDonut";
import TransactionRow from "../../components/finance/TransactionRow";
import TransactionForm from "../../components/finance/TransactionForm";
import { useTransactions } from "../../hooks/useTransactions";
import { useCategories } from "../../hooks/useCategories";
import { useAccounts } from "../../hooks/useAccounts";
import { useBudget } from "../../hooks/useBudget";
import { useGoals } from "../../hooks/useGoals";
import { useFinanceSummary } from "../../hooks/useFinanceSummary";
import { formatCurrency } from "../../utils/currency";
import { getGoalProgress } from "../../utils/finance";
import { currentMonthKey, monthKeyOffset, monthYearLabel } from "../../utils/dates";

function StatCard({ label, value, meta, type }) {
  return (
    <article className={`stat-card ${type || ""}`}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{type === "balance" ? "◉" : type === "income" ? "↑" : type === "expense" ? "↓" : "↗"}</span>
      </div>
      <strong>{value}</strong>
      <small className={type === "expense" ? (meta.startsWith("↓") ? "positive" : "negative") : "positive"}>{meta}</small>
    </article>
  );
}

function changeLabel(change) {
  if (change === null) return "sem dados do mês anterior";
  const arrow = change >= 0 ? "↑" : "↓";
  return `${arrow} ${Math.abs(change).toFixed(1)}% vs. mês anterior`;
}

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const { transactions, addTransaction } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { budget } = useBudget(selectedMonth);
  const { goals } = useGoals();
  const summary = useFinanceSummary(transactions, categories, budget, { monthKey: selectedMonth });
  const isCurrentMonth = selectedMonth === currentMonthKey();

  function goToPreviousMonth() {
    const [y, m] = selectedMonth.split("-").map(Number);
    setSelectedMonth(monthKeyOffset(1, new Date(y, m - 1, 1)));
  }

  function goToNextMonth() {
    const [y, m] = selectedMonth.split("-").map(Number);
    setSelectedMonth(monthKeyOffset(-1, new Date(y, m - 1, 1)));
  }

  function handleCreate(data) {
    addTransaction(data);
    setModalOpen(false);
  }

  return (
    <>
      <Header eyebrow="VISÃO GERAL" title="Dashboard" onNewTransaction={() => setModalOpen(true)} />
      <main className="content">
        <div className="month-switcher">
          <button type="button" className="icon-btn small" onClick={goToPreviousMonth} aria-label="Mês anterior">
            <ChevronLeft size={16} />
          </button>
          <strong>{monthYearLabel(summary.monthKey)}</strong>
          <button type="button" className="icon-btn small" onClick={goToNextMonth} aria-label="Próximo mês">
            <ChevronRight size={16} />
          </button>
          {!isCurrentMonth && (
            <button type="button" className="link-btn" onClick={() => setSelectedMonth(currentMonthKey())}>
              Voltar para o mês atual
            </button>
          )}
        </div>

        <section className="stats-grid">
          <StatCard label="Saldo do mês" value={formatCurrency(summary.balance)} meta={changeLabel(summary.incomeChange)} type="balance" />
          <StatCard label="Receitas" value={formatCurrency(summary.income)} meta={changeLabel(summary.incomeChange)} type="income" />
          <StatCard label="Despesas" value={formatCurrency(summary.expenses)} meta={changeLabel(summary.expensesChange !== null ? -summary.expensesChange : null)} type="expense" />
          <StatCard label="Economia do mês" value={`${summary.savingsRate.toFixed(1)}%`} meta="da receita do mês" type="saving" />
        </section>

        <div className="main-grid">
          <FinancialChart series={summary.monthlySeries} />
          <CategoryDonut items={summary.expensesByCategory} total={summary.expenses} />
        </div>

        <section className="insight">
          <div className="insight-icon">💡</div>
          <div>
            <span>INSIGHT FINANCEIRO</span>
            <h3>{summary.expensesChange !== null && summary.expensesChange < 0 ? "Você está gastando menos este mês." : "Fique de olho nas suas despesas este mês."}</h3>
            <p>
              {summary.expensesChange !== null
                ? <>Suas despesas estão <strong>{Math.abs(summary.expensesChange).toFixed(1)}% {summary.expensesChange < 0 ? "menores" : "maiores"}</strong> que no mês anterior.</>
                : "Ainda não há dados suficientes do mês anterior para comparação."}
            </p>
          </div>
          <NavLink to="/analises" className="insight-link">Ver análise <ChevronRight size={16} /></NavLink>
        </section>

        <div className="main-grid lower">
          <section className="panel transactions-panel">
            <div className="panel-heading">
              <div><h2>Transações recentes</h2><p>Seus últimos lançamentos</p></div>
              <NavLink to="/transacoes" className="link-btn">Ver todas</NavLink>
            </div>
            <div className="transaction-list">
              {summary.recentTransactions.length === 0 && (
                <p style={{ color: "var(--muted)", fontSize: 11, padding: "10px 0" }}>Nenhum lançamento ainda.</p>
              )}
              {summary.recentTransactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  category={categories.find((c) => c.id === t.categoryId)}
                  account={accounts.find((a) => a.id === t.accountId)}
                />
              ))}
            </div>
            <button type="button" className="new-entry" onClick={() => setModalOpen(true)}>+ Adicionar lançamento</button>
          </section>

          <div className="side-stack">
            <section className="panel">
              <div className="panel-heading"><div><h2>Orçamento do mês</h2><p>{monthYearLabel(summary.monthKey)}</p></div><NavLink to="/orcamento" className="link-btn">Gerenciar</NavLink></div>
              <div className="budget-summary">
                <div><span>Utilizado</span><strong>{formatCurrency(summary.budgetUsage.totalUsed)}</strong></div>
                <div><span>Disponível</span><strong className="positive">{formatCurrency(summary.budgetUsage.available)}</strong></div>
                <div className="budget-ring" style={{ background: `conic-gradient(var(--primary) 0 ${Math.min(100, summary.budgetUsage.percent)}%, #ececf2 ${Math.min(100, summary.budgetUsage.percent)}%)` }}>
                  <span>{summary.budgetUsage.percent}%</span>
                </div>
              </div>
              <div className="budget-list">
                {summary.budgetUsage.categories.map((entry) => {
                  const category = categories.find((c) => c.id === entry.categoryId);
                  return (
                    <div className="budget-row" key={entry.categoryId}>
                      <div className="budget-row-top">
                        <span>{category?.icon} {category?.name}</span>
                        <small>{formatCurrency(entry.used)} / {formatCurrency(entry.limit)}</small>
                      </div>
                      <ProgressBar percent={entry.percent} />
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading"><div><h2>Metas financeiras</h2><p>Continue construindo seus planos</p></div><NavLink to="/metas" className="link-btn">Ver metas</NavLink></div>
              <div className="goals-list">
                {goals.filter((g) => g.status !== "paused").slice(0, 4).map((goal) => {
                  const progress = getGoalProgress(goal);
                  return (
                    <div className="goal-row" key={goal.id}>
                      <span className="goal-icon">{goal.icon}</span>
                      <div className="goal-main">
                        <div><strong>{goal.title}</strong><small>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</small></div>
                        <ProgressBar percent={progress} />
                      </div>
                      <strong className="goal-percent">{progress}%</strong>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>
      {modalOpen && (
        <Modal eyebrow="NOVO LANÇAMENTO" title="O que aconteceu?" onClose={() => setModalOpen(false)}>
          <TransactionForm categories={categories} accounts={accounts} onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
        </Modal>
      )}
    </>
  );
}
