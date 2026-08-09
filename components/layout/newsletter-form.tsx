"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
  });

  async function onSubmit() {
    // Wired up to a real subscribers table/email provider in a later phase.
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("You're subscribed! Watch your inbox for drops.");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-sm">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Your email address"
            aria-label="Email address"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          Subscribe
        </Button>
      </div>
      {errors.email && (
        <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
      )}
    </form>
  );
}
