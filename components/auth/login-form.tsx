"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { login } from "@/lib/auth/actions";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    const result = await login(values, redirectTo);
    if (result && "error" in result) {
      toast.error(result.error);
    }
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
          <Input
            type="password"
            placeholder="Password"
            aria-label="Password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
          )}
          <Link
            href="/forgot-password"
            className="mt-1.5 inline-block text-xs text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-foreground hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
