import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import AppRoutes from "./routes";
import { PreferencesProvider } from "./PreferencesContext";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <PreferencesProvider>
      <div className="app-shell">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="page"><AppRoutes /></div>
      </div>
    </PreferencesProvider>
  );
}
