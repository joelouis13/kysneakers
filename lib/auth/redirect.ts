/**
 * Validates a user-supplied "redirect back to" path so it can never be used
 * for an open redirect. Called at both the page level (cosmetic) and again
 * inside the server action that consumes it (the real security boundary,
 * since Server Actions are public endpoints reachable independent of the UI).
 */
export function getSafeRedirectPath(
  value: string | string[] | undefined | null,
  fallback = "/"
): string {
  if (typeof value !== "string" || value.length === 0) return fallback;

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (!decoded.startsWith("/")) return fallback;
  if (decoded.startsWith("//")) return fallback;
  if (decoded.startsWith("/\\")) return fallback;
  if (decoded.includes("://")) return fallback;

  return decoded;
}
