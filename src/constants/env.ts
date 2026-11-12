export function urlFromEnv(name: string): string {
  const url = process.env[name]?.trim() ?? "";
  if (url.length > 0 && !/^https?:\/\//.test(url)) {
    throw new Error(`${name} must be an http(s) URL, got "${url}"`);
  }
  return url;
}
