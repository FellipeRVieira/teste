import { Bell, ChevronDown, Plus, Search } from "lucide-react";
import { usePreferences } from "../../app/PreferencesContext";

export default function Header({
  eyebrow,
  title,
  onNewTransaction,
  newTransactionLabel = "Nova transação",
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
}) {
  const { preferences } = usePreferences();
  const initial = preferences.name?.trim()?.[0]?.toUpperCase() || "F";
  const firstName = preferences.name?.trim()?.split(" ")[0] || "Fellipe";

  return (
    <header className="header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="header-actions">
        {onSearchChange && (
          <div className="search-box">
            <Search size={17} />
            <input
              placeholder={searchPlaceholder}
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        <button className="icon-btn"><Bell size={19} /><i /></button>
        <div className="user-menu"><div className="avatar">{initial}</div><span>{firstName}</span><ChevronDown size={15} /></div>
        {onNewTransaction && (
          <button className="primary-btn" onClick={onNewTransaction}>
            <Plus size={18} /> {newTransactionLabel}
          </button>
        )}
      </div>
    </header>
  );
}
