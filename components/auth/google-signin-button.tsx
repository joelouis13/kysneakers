"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GoogleIcon } from "@/components/icons/social";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton({ redirectTo }: { redirectTo: string }) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleClick() {
    setIsRedirecting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      toast.error("Google sign-in isn't available right now. Please try email instead.");
      setIsRedirecting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={isRedirecting}
      onClick={handleClick}
    >
      {isRedirecting ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
      {isRedirecting ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}
