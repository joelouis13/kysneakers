"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { signup } from "@/lib/auth/actions";
import { signupSchema, type SignupValues } from "@/lib/auth/schemas";

export function SignupForm({ redirectTo }: { redirectTo: string }) {
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(values: SignupValues) {
    const result = await signup(values, redirectTo);
    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }
    if (result && "needsEmailConfirmation" in result) {
      setNeedsEmailConfirmation(true);
    }
  }

  if (needsEmailConfirmation) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
        <MailCheck className="size-10 text-primary" />
        <p className="text-sm text-muted-foreground">
          If this is a new address, check your inbox to confirm it before signing in.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <GoogleSignInButton redirectTo={redirectTo} />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div>
          <Input
            placeholder="Full name"
            aria-label="Full name"
            aria-invalid={!!errors.fullName}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="mt-1.5 text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Input
            type="email"
            placeholder="Email address"
            aria-label="Email address"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <PasswordInput
            placeholder="Password"
            aria-label="Password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-foreground hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
