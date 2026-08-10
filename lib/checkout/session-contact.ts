/** Stashes the contact used at checkout so the confirmation page can verify order-status lookups without a query string. */
function key(orderNumber: string): string {
  return `kysneakers:order-contact:${orderNumber}`;
}

export function setStashedContact(orderNumber: string, contact: string): void {
  sessionStorage.setItem(key(orderNumber), contact);
}

export function getStashedContact(orderNumber: string): string | null {
  return sessionStorage.getItem(key(orderNumber));
}
