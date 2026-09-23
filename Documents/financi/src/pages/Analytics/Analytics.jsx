import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import Header from "../../components/layout/Header";
import EmptyState from "../../components/ui/EmptyState";
import FinancialChart from "../../components/charts/FinancialChart";
import CategoryDonut from "../../components/charts/CategoryDonut";
import TransactionRow from "../../components/finance/TransactionRow";
import { useTransactions } from "../../hooks/useTransactions";
import { useCategories } from "../../hooks/useCategories";
import { useAccounts } from "../../hooks/useAccounts";
import { useAnalytics } from "../../hooks/useAnalytics";
import { formatCurrency } from "../../utils/currency";
import { currentMonthKey, monthKeyOffset, monthYearLabel } from "../../utils/dates";

const METRICS = [
  { key: "income", label: "Receitas" },
  { key: "expenses", label: "Despesas" },
  { key: "balance", label: "Saldo" },
  { key: "savingsRate", label: "Taxa de economia" },
];

function formatMetric(key, value) {
  return key === "savingsRate" ? `${value.toFixed(1)}%` : formatCurrency(value);
}

function downloadCsv(monthKey, transactions, categories, accounts) {
  const header = ["Data", "Tipo", "Descrição", "Categoria", "Conta/Cartão", "Valor"];
  const rows = transactions.map((t) => {
    const category = categories.find((c) => c.id === t.categoryId);
    const account = accounts.find((a) => a.id === t.accountId);
    const amount = String(t.amount).replace(".", ",");
    return [t.date, t.type === "income" ? "Receita" : "Despesa", t.description, category?.name || "", account?.name || "", amount];
  });
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `financas-${monthKey}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Analytics() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  const availableMonths = useMemo(() => {
    const set = new Set(transactions.map((t) => t.date?.slice(0, 7)).filter(Boolean));
    set.add(selectedMonth);
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [transactions, selectedMonth]);

  const [compareMonth, setCompareMonth] = useState(() => {
    const [y, m] = currentMonthKey().split("-").map(Number);
    return monthKeyOffset(1, new Date(y, m - 1, 1));
  });

  const analytics = useAnalytics(transactions, categories, {
    monthKey: selectedMonth,
    compareMonthKey: compareMonth || null,
  });

  const isCurrentMonth = selectedMonth === currentMonthKey();
  const currentMonthTransactions = useMemo(
    () => transactions.filter((t) => t.date?.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  function goToPreviousMonth() {
    const [y, m] = selectedMonth.split("-").map(Number);
    setSelectedMonth(monthKeyOffset(1, new Date(y, m - 1, 1)));
  }

  function goToNextMonth() {
    const [y, m] = selectedMonth.split("-").map(Number);
    setSelectedMonth(monthKeyOffset(-1, new Date(y, m - 1, 1)));
  }

  const compareOptions = availableMonths.filter((key) => key !== selectedMonth);
  const hasAnyTransaction = transactions.length > 0;

  return (
    <>
      <Header eyebrow="ANÁLISES" title="Análises" />
      <main className="content">
        <p className="page-lead">
          Todos os números abaixo são calculados a partir dos seus lançamentos reais — nada aqui é estimado ou
          projetado automaticamente.
        </p>

        {!hasAnyTransaction ? (
          <EmptyState
            icon="📊"
            title="Ainda não há lançamentos suficientes"
            description="Cadastre receitas e despesas em Transações para ver análises aqui."
          />
        ) : (
          <>
            <div className="month-switcher">
              <button type="button" className="icon-btn small" onClick={goToPreviousMonth} aria-label="Mês anterior">
                <ChevronLeft size={16} />
              </button>
              <strong>{monthYearLabel(selectedMonth)}</strong>
              <button type="button" className="icon-btn small" onClick={goToNextMonth} aria-label="Próximo mês">
                <ChevronRight size={16} />
              </button>
              {!isCurrentMonth && (
                <button type="button" className="link-btn" onClick={() => setSelectedMonth(currentMonthKey())}>
                  Voltar para o mês atual
                </button>
              )}
              <button
                type="button"
                className="secondary-btn analytics-export-btn"
                onClick={() => downloadCsv(selectedMonth, currentMonthTransactions, categories, accounts)}
                disabled={currentMonthTransactions.length === 0}
              >
                <Download size={15} /> Exportar CSV do mês
              </button>
            </div>

            <section className="stats-grid">
              <article className="stat-card balance"><div className="stat-top"><span>Saldo</span><span className="stat-icon">◉</span></div><strong>{formatCurrency(analytics.overview.balance)}</strong></article>
              <article className="stat-card income"><div className="stat-top"><span>Receitas</span><span className="stat-icon">↑</span></div><strong>{formatCurrency(analytics.overview.income)}</strong></article>
              <article className="stat-card expense"><div className="stat-top"><span>Despesas</span><span className="stat-icon">↓</span></div><strong>{formatCurrency(analytics.overview.expenses)}</strong></article>
              <article className="stat-card saving"><div className="stat-top"><span>Taxa de economia</span><span className="stat-icon">↗</span></div><strong>{analytics.overview.savingsRate.toFixed(1)}%</strong></article>
            </section>

            <div className="main-grid">
              <FinancialChart series={analytics.yearlySeries} />
              <CategoryDonut items={analytics.expensesByCategory} total={analytics.overview.expenses} />
            </div>

            <div className="main-grid lower">
              <section className="panel">
                <div className="panel-heading">
                  <div><h2>Comparação entre períodos</h2><p>{monthYearLabel(selectedMonth)} vs. período selecionado</p></div>
                  <select value={compareMonth} onChange={(e) => setCompareMonth(e.target.value)}>
                    <option value="">Não comparar</option>
                    {compareOptions.map((key) => (
                      <option key={key} value={key}>{monthYearLabel(key)}</option>
                    ))}
                  </select>
                </div>
                {!analytics.comparison ? (
                  <EmptyState icon="🔍" title="Escolha um período" description="Selecione um mês acima para comparar com o período atual." />
                ) : (
                  <div className="compare-list">
                    {METRICS.map((metric) => {
                      const data = analytics.comparison[metric.key];
                      const delta = data.change;
                      return (
                        <div className="compare-row" key={metric.key}>
                          <span className="compare-label">{metric.label}</span>
                          <strong>{formatMetric(metric.key, data.a)}</strong>
                          <span className={`compare-delta ${delta === null ? "" : delta >= 0 ? "positive" : "negative"}`}>
                            {delta === null ? "sem dado anterior" : `${delta >= 0 ? "↑" : "↓"} ${Math.abs(delta).toFixed(1)}%`}
                          </span>
                          <small>{formatMetric(metric.key, data.b)} em {monthYearLabel(analytics.comparison.monthKeyB)}</small>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="panel">
                <div className="panel-heading"><div><h2>Maiores gastos</h2><p>{monthYearLabel(selectedMonth)}</p></div></div>
                {analytics.topExpenses.length === 0 ? (
                  <EmptyState icon="🧾" title="Nenhuma despesa neste mês" description="Os maiores gastos do mês aparecem aqui." />
                ) : (
                  <div className="transaction-list padded">
                    {analytics.topExpenses.map((t) => (
                      <TransactionRow
                        key={t.id}
                        transaction={t}
                        category={categories.find((c) => c.id === t.categoryId)}
                        account={accounts.find((a) => a.id === t.accountId)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="panel">
              <div className="panel-heading"><div><h2>Tendências e insights</h2><p>Leitura automática dos seus lançamentos, sem recomendações</p></div></div>
              <div className="insight-list">
                {analytics.trend.direction === "insufficient" ? (
                  <p className="muted-note" style={{ margin: "0 20px 18px" }}>
                    Ainda não há meses suficientes com lançamentos para identificar uma tendência.
                  </p>
                ) : (
                  <div className="insight-item">
                    <span className="insight-item-icon">{analytics.trend.direction === "up" ? "📈" : analytics.trend.direction === "down" ? "📉" : "➖"}</span>
                    <p>
                      Suas despesas estão{" "}
                      <strong>{analytics.trend.direction === "up" ? "em alta" : analytics.trend.direction === "down" ? "em queda" : "estáveis"}</strong>{" "}
                      nos últimos {analytics.yearlySeries.length} meses, com média mensal de{" "}
                      <strong>{formatCurrency(analytics.trend.avgExpense)}</strong>.
                    </p>
                  </div>
                )}

                <div className="insight-item">
                  <span className="insight-item-icon">💰</span>
                  <p>
                    Sua taxa de economia em {monthYearLabel(selectedMonth)} foi de{" "}
                    <strong>{analytics.overview.savingsRate.toFixed(1)}%</strong> da receita do mês.
                  </p>
                </div>

                {analytics.categoryShift.length > 0 && analytics.categoryShift[0].delta !== 0 && (
                  <div className="insight-item">
                    <span className="insight-item-icon">{analytics.categoryShift[0].delta >= 0 ? "⬆️" : "⬇️"}</span>
                    <p>
                      A categoria com maior variação foi <strong>{analytics.categoryShift[0].name}</strong>, com{" "}
                      <strong>{formatCurrency(Math.abs(analytics.categoryShift[0].delta))}</strong>{" "}
                      {analytics.categoryShift[0].delta >= 0 ? "a mais" : "a menos"} em relação a {monthYearLabel(compareMonth)}.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
