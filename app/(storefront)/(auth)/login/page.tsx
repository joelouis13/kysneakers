import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your KYSneakers account.",
};

type RawSearchParams = { [key: string]: string | string[] | undefined };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;
  const redirectTo = getSafeRedirectPath(sp.redirect);

  return (
    <>
      <h1 className="mb-6 text-center font-heading text-3xl tracking-wide text-foreground">
        Log in to KYSneakers
      </h1>
      <LoginForm redirectTo={redirectTo} />
    </>
  );
}
