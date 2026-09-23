import { useState } from "react";
import { Save } from "lucide-react";
import Header from "../../components/layout/Header";
import { usePreferences } from "../../app/PreferencesContext";

const THEME_OPTIONS = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

const FUTURE_ITEMS = [
  {
    title: "Moeda",
    description: "Hoje fixo em Real (BRL) em toda a aplicação — trocar exige revisar todos os pontos que formatam valores.",
  },
  {
    title: "Primeiro dia do mês financeiro",
    description:
      "Os períodos seguem o mês do calendário. Mudar isso afeta Dashboard, Orçamento e Análises, então precisa ser decidido com calma.",
  },
  {
    title: "Segurança e login",
    description: "Só faz sentido junto da Fase 6 (persistência/autenticação), que ainda depende de decisões de backend.",
  },
];

export default function Settings() {
  const { preferences, updatePreferences } = usePreferences();
  const [name, setName] = useState(preferences.name);
  const [nameError, setNameError] = useState("");

  function handleNameSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Informe um nome.");
      return;
    }
    setNameError("");
    updatePreferences({ name: name.trim() });
  }

  return (
    <>
      <Header eyebrow="CONFIGURAÇÕES" title="Configurações" />
      <main className="content">
        <p className="page-lead">
          Preferências salvas apenas neste navegador — ainda não há login nem sincronização entre dispositivos (isso
          depende da Fase 6, de persistência/autenticação, que ainda não foi iniciada).
        </p>

        <section className="panel">
          <div className="panel-heading">
            <div><h2>Perfil</h2><p>Como seu nome aparece no menu lateral e no topo das páginas</p></div>
          </div>
          <form className="settings-form" onSubmit={handleNameSubmit} noValidate>
            <label>
              Nome
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="Seu nome"
              />
            </label>
            {nameError && <p className="field-error">{nameError}</p>}
            <div className="settings-form-actions">
              <button type="submit" className="primary-btn">
                <Save size={18} /> Salvar nome
              </button>
            </div>
          </form>
        </section>

        <section className="panel" style={{ marginTop: 15 }}>
          <div className="panel-heading">
            <div><h2>Aparência e notificações</h2><p>Aplicadas imediatamente, sem precisar salvar</p></div>
          </div>
          <div className="settings-form">
            <label>
              Tema
              <select
                value={preferences.theme}
                onChange={(e) => updatePreferences({ theme: e.target.value })}
              >
                {THEME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="settings-toggle-group">
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={preferences.notifyBudgetAlerts}
                  onChange={(e) => updatePreferences({ notifyBudgetAlerts: e.target.checked })}
                />
                Mostrar alertas de orçamento (limite próximo ou excedido)
              </label>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={preferences.notifyGoalAlerts}
                  onChange={(e) => updatePreferences({ notifyGoalAlerts: e.target.checked })}
                />
                Mostrar alertas de metas (concluída ou perto do prazo)
              </label>
            </div>
            <p className="field-hint" style={{ marginTop: 16, marginBottom: 0 }}>
              Essas preferências controlam o que aparece na página Alertas e o indicador de notificações no menu
              lateral — nenhum alerta é enviado por e-mail, push ou SMS.
            </p>
          </div>
        </section>

        <section className="panel" style={{ marginTop: 15 }}>
          <div className="panel-heading">
            <div><h2>Em definição</h2><p>Listado no RF10 como "futuramente" — depende de decisões de produto/infra antes de codificar</p></div>
          </div>
          <div className="settings-future-list">
            {FUTURE_ITEMS.map((item) => (
              <div key={item.title} className="settings-future-item">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
