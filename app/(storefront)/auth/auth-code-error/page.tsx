import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Link expired",
};

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <h1 className="font-heading text-3xl tracking-wide text-foreground">
        This link is invalid or has expired
      </h1>
      <p className="text-sm text-muted-foreground">
        Please request a new link and try again.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild>
          <Link href="/forgot-password">Reset password</Link>
        </Button>
      </div>
    </div>
  );
}
