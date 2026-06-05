// ============================================================
// STORAGE — IndexedDB (survives cache clears) + localStorage fallback
// ============================================================

const DB_NAME = "arise_db", DB_VERSION = 1, STORE = "data";

const openDB = () => new Promise((res, rej) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
  req.onsuccess = e => res(e.target.result);
  req.onerror = () => rej(req.error);
});

const idbGet = async (key) => {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => res(req.result ?? null);
      req.onerror = () => rej(req.error);
    });
  } catch { return null; }
};

const idbSet = async (key, value) => {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error);
    });
  } catch { return false; }
};

// Save: write to both IndexedDB (primary) and localStorage (fallback)
export const saveData = async (key, value) => {
  localStorage.setItem(key, JSON.stringify(value)); // instant fallback
  await idbSet(key, value);                          // durable primary
};

// Load: try IndexedDB first, fall back to localStorage
export const loadData = async (key) => {
  const idb = await idbGet(key);
  if (idb !== null) return idb;
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};

// Legacy sync helper for non-critical reads
export const LS = (k, v) =>
  v === undefined
    ? (() => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } })()
    : localStorage.setItem(k, JSON.stringify(v));
