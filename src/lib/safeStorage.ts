/**
 * Safe Storage Utility
 * 
 * Wraps localStorage and sessionStorage with try-catch and in-memory fallback.
 * This prevents crashes on mobile browsers that block storage access
 * (private browsing, restrictive security policies, embedded webviews, etc.)
 */

// In-memory fallback stores — used when browser storage is inaccessible
const memorySessionStore = new Map<string, string>();
const memoryLocalStore = new Map<string, string>();

/** Test whether a storage API is available and functional */
function isStorageAvailable(type: 'sessionStorage' | 'localStorage'): boolean {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Cache the check results so we don't re-test every call
let _sessionOk: boolean | null = null;
let _localOk: boolean | null = null;

function sessionOk(): boolean {
  if (_sessionOk === null) _sessionOk = typeof window !== 'undefined' && isStorageAvailable('sessionStorage');
  return _sessionOk;
}

function localOk(): boolean {
  if (_localOk === null) _localOk = typeof window !== 'undefined' && isStorageAvailable('localStorage');
  return _localOk;
}

// ─── Session Storage ─────────────────────────────────────────

export function safeSessionGet(key: string): string | null {
  try {
    if (sessionOk()) return window.sessionStorage.getItem(key);
  } catch { /* blocked */ }
  return memorySessionStore.get(key) ?? null;
}

export function safeSessionSet(key: string, value: string): void {
  try {
    if (sessionOk()) {
      window.sessionStorage.setItem(key, value);
      return;
    }
  } catch { /* blocked */ }
  memorySessionStore.set(key, value);
}

export function safeSessionRemove(key: string): void {
  try {
    if (sessionOk()) {
      window.sessionStorage.removeItem(key);
      return;
    }
  } catch { /* blocked */ }
  memorySessionStore.delete(key);
}

// ─── Local Storage ───────────────────────────────────────────

export function safeLocalGet(key: string): string | null {
  try {
    if (localOk()) return window.localStorage.getItem(key);
  } catch { /* blocked */ }
  return memoryLocalStore.get(key) ?? null;
}

export function safeLocalSet(key: string, value: string): void {
  try {
    if (localOk()) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch { /* blocked */ }
  memoryLocalStore.set(key, value);
}

export function safeLocalRemove(key: string): void {
  try {
    if (localOk()) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch { /* blocked */ }
  memoryLocalStore.delete(key);
}

// ─── Supabase Custom Storage Adapter ─────────────────────────
// Pass this to Supabase's `auth.storage` option so it doesn't
// crash internally when localStorage is blocked on mobile.

export const safeStorageAdapter = {
  getItem: (key: string): string | null => safeLocalGet(key),
  setItem: (key: string, value: string): void => safeLocalSet(key, value),
  removeItem: (key: string): void => safeLocalRemove(key),
};
