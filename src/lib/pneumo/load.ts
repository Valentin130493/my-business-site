// Единственная точка загрузки three.js: отдельный чанк, который тянется только для 3D-режима
export function loadPneumoScene() {
  return import("./scene");
}
