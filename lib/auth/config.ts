/**
 * Temporary lockdown: new account sign-ups (email/password and Google, which
 * auto-creates a Supabase user on first login) are disabled for now — only
 * existing (staff) accounts can log in. Flip this back to true to reopen
 * sign-ups; it's the single switch for the signup page, action, and the
 * login form's "Sign up"/Google options.
 */
export const SIGNUPS_ENABLED = false;
