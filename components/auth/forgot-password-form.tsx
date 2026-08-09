"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth/actions";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/auth/schemas";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordValues) {
    const result = await requestPasswordReset(values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("If an account exists for that email, we've sent a reset link.");
    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full max-w-sm flex-col gap-4"
    >
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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
