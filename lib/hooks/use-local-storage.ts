"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * `localStorage`-backed external store, read via `useSyncExternalStore` so
 * the server render and first client render both show `initialValue`
 * (avoiding a hydration mismatch), then React syncs in the real persisted
 * value right after hydration completes.
 */
function createLocalStorageStore<T>(key: string, initialValue: T) {
  let listeners: Array<() => void> = [];
  let cache: T = initialValue;
  let cacheInitialized = false;

  function getSnapshot(): T {
    if (typeof window === "undefined") return initialValue;
    if (!cacheInitialized) {
      try {
        const raw = window.localStorage.getItem(key);
        cache = raw ? (JSON.parse(raw) as T) : initialValue;
      } catch {
        cache = initialValue;
      }
      cacheInitialized = true;
    }
    return cache;
  }

  function set(next: T | ((prev: T) => T)) {
    const value = typeof next === "function" ? (next as (prev: T) => T)(getSnapshot()) : next;
    cache = value;
    cacheInitialized = true;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Ignore quota/privacy-mode storage errors — state still works in-memory.
      }
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  function getServerSnapshot(): T {
    return initialValue;
  }

  return { subscribe, getSnapshot, getServerSnapshot, set };
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  // `initialValue` is only read the first time a given `key` is used — pass
  // a stable default (e.g. a module-level constant) if you need it to never
  // change across renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const store = useMemo(() => createLocalStorageStore(key, initialValue), [key]);
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return [value, store.set] as const;
}
