import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your KYSneakers account.",
};

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="mb-6 text-center font-heading text-3xl tracking-wide text-foreground">
        Choose a new password
      </h1>
      <ResetPasswordForm />
    </>
  );
}
