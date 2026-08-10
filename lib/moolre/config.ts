export class MoolreConfigError extends Error {
  constructor(missing: string) {
    super(`Moolre is not fully configured: missing ${missing}.`);
    this.name = "MoolreConfigError";
  }
}

export function getMoolreBaseUrl(): string {
  return process.env.MOOLRE_BASE_URL ?? "https://api.moolre.com";
}

export function getMoolreCredentials(): {
  apiUser: string;
  apiKey: string;
  accountNumber: string;
} {
  const apiUser = process.env.MOOLRE_API_USER;
  const apiKey = process.env.MOOLRE_API_KEY;
  const accountNumber = process.env.MOOLRE_ACCOUNT_ID;

  if (!apiUser) throw new MoolreConfigError("MOOLRE_API_USER");
  if (!apiKey) throw new MoolreConfigError("MOOLRE_API_KEY");
  if (!accountNumber) throw new MoolreConfigError("MOOLRE_ACCOUNT_ID");

  return { apiUser, apiKey, accountNumber };
}
