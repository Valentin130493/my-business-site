import { urlFromEnv } from "./env";

export const BOT_API_URL = urlFromEnv("BOT_API_URL").replace(/\/+$/, "");
