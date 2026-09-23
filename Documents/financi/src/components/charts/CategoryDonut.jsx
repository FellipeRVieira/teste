import { formatCurrency } from "../../utils/currency";

const SLICE_COLORS = ["var(--primary)", "#36b995", "#ee756f", "#f1a34c", "#b8bbc6", "#6ce0d6"];

export default function CategoryDonut({ items, total }) {
  if (!items.length) {
    return (
      <section className="panel category-panel">
        <div className="panel-heading"><div><h2>Gastos por categoria</h2><p>Onde seu dinheiro foi usado</p></div></div>
        <div className="category-body">
          <p style={{ color: "var(--muted)", fontSize: 11, margin: "12px 20px" }}>
            Nenhuma despesa registrada neste mês ainda.
          </p>
        </div>
      </section>
    );
  }

  let cursor = 0;
  const stops = items.map((item, i) => {
    const start = cursor;
    cursor += item.percent;
    return `${SLICE_COLORS[i % SLICE_COLORS.length]} ${start}% ${cursor}%`;
  });

  return (
    <section className="panel category-panel">
      <div className="panel-heading"><div><h2>Gastos por categoria</h2><p>Onde seu dinheiro foi usado</p></div></div>
      <div className="category-body">
        <div className="donut" style={{ background: `conic-gradient(${stops.join(", ")})` }}>
          <div><strong>{formatCurrency(total)}</strong><span>Total de gastos</span></div>
        </div>
        <div className="category-list">
          {items.map((item) => (
            <div className="category-row" key={item.categoryId}>
              <div className="category-name"><span className="category-icon">{item.icon}</span><span>{item.name}</span></div>
              <strong>{item.percent}%</strong>
              <small>{formatCurrency(item.value)}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
