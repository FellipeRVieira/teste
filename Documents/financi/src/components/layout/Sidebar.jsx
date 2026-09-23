import {
  Bell, ChevronRight, CircleHelp, CreditCard,
  Home, LineChart, Menu, Settings, Target,
  ReceiptText, WalletCards, X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { usePreferences } from "../../app/PreferencesContext";
import { useAlerts } from "../../hooks/useAlerts";

const NAV_ITEMS = [
  ["/", "Dashboard", Home],
  ["/transacoes", "Transações", ReceiptText],
  ["/analises", "Análises", LineChart],
  ["/orcamento", "Orçamento", WalletCards],
  ["/metas", "Metas", Target],
  ["/cartoes", "Cartões", CreditCard],
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { preferences } = usePreferences();
  const { alerts } = useAlerts({
    includeBudget: preferences.notifyBudgetAlerts,
    includeGoals: preferences.notifyGoalAlerts,
  });
  const alertsCount = alerts.length;
  const initial = preferences.name?.trim()?.[0]?.toUpperCase() || "F";

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="brand-mark">F</div>
        {!collapsed && <div><strong>FINANCE</strong><span>Seu dinheiro, organizado.</span></div>}
      </div>

      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Alternar menu">
        {collapsed ? <Menu size={18} /> : <X size={18} />}
      </button>

      <nav className="nav">
        <div className="nav-label">{!collapsed && "PRINCIPAL"}</div>
        {NAV_ITEMS.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={19} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        <div className="nav-label nav-spacer">{!collapsed && "GERENCIAMENTO"}</div>
        <NavLink to="/alertas" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Bell size={19} />
          {!collapsed && (
            <>
              <span>Alertas</span>
              {alertsCount > 0 && <b className="notification-dot">{alertsCount}</b>}
            </>
          )}
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/configuracoes" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Settings size={19} />{!collapsed && <span>Configurações</span>}
        </NavLink>
        <NavLink to="/ajuda" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <CircleHelp size={19} />{!collapsed && <span>Ajuda</span>}
        </NavLink>
        {!collapsed && (
          <div className="profile-mini">
            <div className="avatar">{initial}</div>
            <div><strong>{preferences.name}</strong><span>Conta pessoal</span></div>
            <ChevronRight size={16} />
          </div>
        )}
      </div>
    </aside>
  );
}
