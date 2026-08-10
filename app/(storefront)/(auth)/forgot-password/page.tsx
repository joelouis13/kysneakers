import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a password reset link for your KYSneakers account.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-center font-heading text-3xl tracking-wide text-foreground">
        Reset your password
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
