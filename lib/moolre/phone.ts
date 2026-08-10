/** Normalizes +233/233/0-prefixed (with optional spaces/dashes) Ghanaian numbers to Moolre's expected 0-prefixed local format. */
export function toLocalPhone(input: string): string | null {
  const digits = input.replace(/[\s-]/g, "").replace(/^\+/, "");

  let local: string | null = null;
  if (digits.startsWith("233") && digits.length === 12) {
    local = `0${digits.slice(3)}`;
  } else if (digits.startsWith("0") && digits.length === 10) {
    local = digits;
  }

  if (local && /^0\d{9}$/.test(local)) return local;
  return null;
}

export function isValidGhPhone(input: string): boolean {
  return toLocalPhone(input) !== null;
}
