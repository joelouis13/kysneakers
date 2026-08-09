"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";

export function ProductSearchInput({ placeholder = "Search this collection..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </form>
  );
}
