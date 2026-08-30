export class EmailConfigError extends Error {
  constructor(missing: string) {
    super(`Email sending is not fully configured: missing ${missing}.`);
    this.name = "EmailConfigError";
  }
}

export function getResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new EmailConfigError("RESEND_API_KEY");
  return apiKey;
}

export function getFromEmail(): string {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) throw new EmailConfigError("RESEND_FROM_EMAIL");
  return fromEmail;
}
