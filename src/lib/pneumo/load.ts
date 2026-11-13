// Точки загрузки three.js: отдельные чанки, которые тянутся только в 3D-режиме
export function loadPneumoScene() {
  return import("./scene");
}

export function loadGaugeScene() {
  return import("./gauge");
}
