// Encapsula o acesso ao localStorage para que nenhum componente
// leia/escreva a chave diretamente (docs/05-TRANSACTION-DOMAIN.md).
// Quando o backend for definido, este arquivo é o único ponto a trocar
// por uma implementação baseada em API.

const PREFIX = "finance:";

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`storageService: falha ao ler "${key}"`, err);
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`storageService: falha ao gravar "${key}"`, err);
    return false;
  }
}

export function removeKey(key) {
  window.localStorage.removeItem(PREFIX + key);
}
