/**
 * Safely parse product images from the database.
 * Handles double-stringified JSON (e.g. '"[\\"url\\"]"')
 * as well as normal JSON strings and already-parsed arrays.
 */
export function parseImages(images: unknown): string[] {
  try {
    let parsed: any = images;
    // Keep parsing while we still have a string (handles double/triple encoding)
    while (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}
