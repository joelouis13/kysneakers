// Confusable-free alphabet (no 0/O/1/I) — the DB's `unique` constraint on
// order_number is the real collision safety net, this just keeps numbers
// short and readable.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function generateOrderNumber(date = new Date()): string {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `KYS-${y}${m}${d}-${randomSuffix()}`;
}
