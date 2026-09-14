import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { SIGNUPS_ENABLED } from "@/lib/auth/config";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your KYSneakers account.",
};

type RawSearchParams = { [key: string]: string | string[] | undefined };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  if (!SIGNUPS_ENABLED) redirect("/login");

  const sp = await searchParams;
  const redirectTo = getSafeRedirectPath(sp.redirect);

  return (
    <>
      <h1 className="mb-6 text-center font-heading text-3xl tracking-wide text-foreground">
        Create an account
      </h1>
      <SignupForm redirectTo={redirectTo} />
    </>
  );
}
