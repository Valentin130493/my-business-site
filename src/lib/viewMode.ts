import { useSyncExternalStore } from "react";

import {
  VIEW_MODE_3D,
  VIEW_MODE_CLASSIC,
  VIEW_MODE_STORAGE_KEY,
  type ViewMode,
} from "@/constants/viewMode";

// Режим живёт в атрибуте data-view на <html>: по нему включаются стили *.3d.module.scss
const listeners = new Set<() => void>();

function readViewMode(): ViewMode {
  return document.documentElement.dataset.view === VIEW_MODE_3D
    ? VIEW_MODE_3D
    : VIEW_MODE_CLASSIC;
}

function readServerViewMode(): ViewMode {
  return VIEW_MODE_CLASSIC;
}

function subscribeViewMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function saveViewMode(mode: ViewMode): void {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch {
    // Хранилище закрыто (приватный режим) — выбор просто не запомнится
  }
}

export function applyViewMode(mode: ViewMode): void {
  document.documentElement.dataset.view = mode;
  saveViewMode(mode);
  listeners.forEach((listener) => listener());
}

export function useViewMode(): ViewMode {
  return useSyncExternalStore(subscribeViewMode, readViewMode, readServerViewMode);
}
