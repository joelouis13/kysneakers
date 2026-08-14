"use client";

import Link from "next/link";
import { Loader2, LogOut } from "lucide-react";
import { useTransition } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/auth-context";
import { logout } from "@/lib/auth/actions";

export function AdminTopbar() {
  const { user } = useAuth();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const displayName = user?.user_metadata?.full_name as string | undefined;
  const initials = (displayName?.trim()[0] ?? user?.email?.[0] ?? "?").toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/">View Storefront</Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account">
            <Avatar size="sm">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="truncate">{displayName || user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isLoggingOut}
            onClick={() => startLogoutTransition(() => logout())}
          >
            {isLoggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            {isLoggingOut ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
