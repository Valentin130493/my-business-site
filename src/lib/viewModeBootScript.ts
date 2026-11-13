import { VIEW_MODE_3D, VIEW_MODE_STORAGE_KEY } from "@/constants/viewMode";

// Выполняется до отрисовки: режим из прошлого визита ставится сразу, без мигания обычной версии
export const VIEW_MODE_BOOT_SCRIPT = `try{if(localStorage.getItem("${VIEW_MODE_STORAGE_KEY}")==="${VIEW_MODE_3D}")document.documentElement.dataset.view="${VIEW_MODE_3D}"}catch(e){}`;
