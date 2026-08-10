"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { ADMIN_NAV_ITEMS } from "./nav-items";

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = item.enabled && (pathname === item.href || pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;

        if (!item.enabled) {
          return (
            <span
              key={item.label}
              className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground opacity-50"
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                {item.label}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                Soon
              </Badge>
            </span>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border lg:block">
        <div className="flex h-16 items-center px-4">
          <Link href="/admin" className="font-heading text-lg tracking-wide text-primary">
            KYSNEAKERS ADMIN
          </Link>
        </div>
        <NavList pathname={pathname} />
      </aside>

      <div className="border-b border-border p-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="size-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <span className="font-heading text-lg tracking-wide text-primary">
                  KYSNEAKERS ADMIN
                </span>
              </SheetTitle>
            </SheetHeader>
            <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
