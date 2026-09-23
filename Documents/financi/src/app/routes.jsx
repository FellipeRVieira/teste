import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard/Dashboard";
import Transactions from "../pages/Transactions/Transactions";
import Analytics from "../pages/Analytics/Analytics";
import Budget from "../pages/Budget/Budget";
import Goals from "../pages/Goals/Goals";
import Cards from "../pages/Cards/Cards";
import Alerts from "../pages/Alerts/Alerts";
import Settings from "../pages/Settings/Settings";
import Help from "../pages/Help/Help";
import EmptyState from "../components/ui/EmptyState";

function NotFound() {
  return (
    <main className="content">
      <EmptyState title="Página não encontrada" description="Verifique o endereço ou volte para o Dashboard." />
    </main>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transacoes" element={<Transactions />} />
      <Route path="/analises" element={<Analytics />} />
      <Route path="/orcamento" element={<Budget />} />
      <Route path="/metas" element={<Goals />} />
      <Route path="/cartoes" element={<Cards />} />
      <Route path="/alertas" element={<Alerts />} />
      <Route path="/configuracoes" element={<Settings />} />
      <Route path="/ajuda" element={<Help />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
