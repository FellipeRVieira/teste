import { readJSON, writeJSON } from "./storageService";
import { preferences as seedPreferences } from "../data/mockData";

// Preferências locais do usuário (nome exibido, tema, preferências de
// notificação). Um único registro, sem CRUD de lista — mesmo espírito de
// budgetService.js, mas sem a dimensão "por mês".
// Guardadas apenas neste navegador: não há login nem sincronização entre
// dispositivos ainda (isso depende da Fase 6, ainda não iniciada).
const KEY = "preferences";

function loadPreferences() {
  return readJSON(KEY, null) ?? seed();
}

function seed() {
  writeJSON(KEY, seedPreferences);
  return seedPreferences;
}

function persist(preferences) {
  writeJSON(KEY, preferences);
  return preferences;
}

export function get() {
  return loadPreferences();
}

export function update(patch) {
  const current = loadPreferences();
  const next = { ...current, ...patch };
  if (patch.name !== undefined) next.name = patch.name?.trim() || current.name;
  if (patch.theme !== undefined) next.theme = patch.theme === "dark" ? "dark" : "light";
  if (patch.notifyBudgetAlerts !== undefined) next.notifyBudgetAlerts = Boolean(patch.notifyBudgetAlerts);
  if (patch.notifyGoalAlerts !== undefined) next.notifyGoalAlerts = Boolean(patch.notifyGoalAlerts);
  return persist(next);
}
