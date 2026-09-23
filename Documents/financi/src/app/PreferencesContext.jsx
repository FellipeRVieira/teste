import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as preferencesService from "../services/preferencesService";

// Diferente dos outros domínios (contas, categorias, orçamento...), que
// usam um hook local por página lendo do localStorage a cada montagem,
// preferências precisam ficar sincronizadas em tempo real entre a
// Sidebar/Header (sempre montados) e a página de Configurações. Por isso,
// aqui usamos Context em vez do padrão hooks/ + services/ isolado.
const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => preferencesService.get());

  // Aplica o tema no elemento raiz para que os tokens de `tokens.css`
  // (bloco `[data-theme="dark"]`) sejam usados em toda a aplicação.
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme === "dark" ? "dark" : "light";
  }, [preferences.theme]);

  const updatePreferences = useCallback((patch) => {
    const updated = preferencesService.update(patch);
    setPreferences(updated);
    return updated;
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences precisa ser usado dentro de <PreferencesProvider>.");
  return ctx;
}
