"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/lib/hooks/use-local-storage";

export function CookieConsent() {
  const [accepted, setAccepted] = useLocalStorageState("cookie-consent", false);

  if (accepted) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          We use cookies to keep your cart and account working and to improve your experience. By
          continuing to use this site, you agree to our use of cookies. Read our{" "}
          <Link href="/privacy" className="font-medium text-foreground hover:underline">
            Privacy Policy
          </Link>{" "}
          to learn more.
        </p>
        <Button size="sm" variant="secondary" className="shrink-0" onClick={() => setAccepted(true)}>
          Accept
        </Button>
      </div>
    </div>
  );
}
