"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "ready_for_dispatch",
  "dispatched",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`${pathname}?${params.toString()}`);
  }

  function submitSearch() {
    updateParams((params) => {
      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onBlur={submitSearch}
        onKeyDown={(e) => e.key === "Enter" && submitSearch()}
        placeholder="Search order #, customer name or email..."
        className="w-72"
      />

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) =>
          updateParams((params) => (v === "all" ? params.delete("status") : params.set("status", v)))
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
