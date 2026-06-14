// ============================================================
// STORAGE — IndexedDB (übersteht Cache-Clears) + localStorage-Fallback
// Härtung: Schreibfehler werden NICHT mehr still verschluckt.
//  - Quota-/Write-Fehler werden an Listener gemeldet (onSaveError),
//    damit die App warnen kann statt Fortschritt still zu verlieren.
//  - idbGet/idbSet werfen nie (resolven null/false) — keine unhandled
//    Promise-Rejections mehr, auch ohne IndexedDB (SSR/Tests).
// ============================================================

const DB_NAME = "arise_db", DB_VERSION = 1, STORE = "data";
const hasIDB = () => typeof indexedDB !== "undefined" && indexedDB !== null;

// ── Schreibfehler-Broadcast ────────────────────────────────
const saveErrorListeners = new Set();
let softQuotaWarned = false;

/** Registriert einen Listener für Speicherfehler. Gibt Unsubscribe zurück. */
export function onSaveError(cb) {
  if (typeof cb === "function") saveErrorListeners.add(cb);
  return () => saveErrorListeners.delete(cb);
}
function emitSaveError(info) {
  for (const cb of saveErrorListeners) { try { cb(info); } catch (_) {} }
}

/** Grobe Größe eines Werts (serialisierte Zeichen) — für die Quota-Heuristik. */
export function estimateSize(value) {
  try { return JSON.stringify(value).length; } catch { return 0; }
}

// localStorage-Cap variiert je Browser (~5 MB). Ab hier proaktiv warnen.
const LS_SOFT_LIMIT = 3_000_000;

const openDB = () => new Promise((res, rej) => {
  try {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
    req.onsuccess = e => res(e.target.result);
    req.onerror   = () => rej(req.error);
  } catch (e) { rej(e); }
});

const idbGet = async (key) => {
  if (!hasIDB()) return null;
  try {
    const db = await openDB();
    return await new Promise((res) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => res(req.result ?? null);
      req.onerror   = () => res(null);
    });
  } catch { return null; }
};

const idbSet = async (key, value) => {
  if (!hasIDB()) return false;
  try {
    const db = await openDB();
    return await new Promise((res) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => res(true);
      tx.onerror    = () => res(false);
    });
  } catch { return false; }
};

/**
 * Speichert in IndexedDB (langlebige Primärablage) UND localStorage (instant).
 * Meldet Fehler an onSaveError-Listener statt sie zu verschlucken.
 * @returns {Promise<{ok:boolean, idb:boolean, ls:boolean, quotaWarn:boolean, error:?string}>}
 */
export const saveData = async (key, value) => {
  const result = { ok: false, idb: false, ls: false, quotaWarn: false, error: null };

  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch (e) {
    result.error = "serialize";
    emitSaveError({ key, reason: "serialize", error: e });
    return result;
  }

  // localStorage-Fallback (instant) — Quota-sicher
  try {
    localStorage.setItem(key, serialized);
    result.ls = true;
    if (serialized.length > LS_SOFT_LIMIT) {
      result.quotaWarn = true;
      if (!softQuotaWarned) { softQuotaWarned = true; emitSaveError({ key, reason: "quota_soft", error: null }); }
    }
  } catch (e) {
    result.error = "quota";
    emitSaveError({ key, reason: "quota", error: e });
  }

  // IndexedDB (durable primary)
  result.idb = await idbSet(key, value);

  // Beide Pfade fehlgeschlagen → echter Schreibfehler (kritisch)
  if (!result.idb && !result.ls) {
    result.error = result.error || "write";
    emitSaveError({ key, reason: "write", error: null });
  }

  result.ok = result.idb || result.ls;
  return result;
};

/** Lädt: erst IndexedDB, dann localStorage-Fallback. */
export const loadData = async (key) => {
  const idb = await idbGet(key);
  if (idb !== null) return idb;
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};

/** Legacy-Sync-Helper für unkritische Reads/Writes. */
export const LS = (k, v) =>
  v === undefined
    ? (() => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } })()
    : (() => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} })();
