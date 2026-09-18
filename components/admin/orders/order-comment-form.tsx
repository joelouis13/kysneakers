"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateOrderComment } from "@/lib/admin/orders/actions";

export function OrderCommentForm({ orderId, currentComment }: { orderId: string; currentComment: string | null }) {
  const [comment, setComment] = useState(currentComment ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const result = await updateOrderComment(orderId, comment);
    setIsSaving(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Comment saved");
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Comment for Customer
      </label>
      <p className="mb-2 text-xs text-muted-foreground">
        Shown to the customer on their order tracking page — e.g. delivery updates or delays.
      </p>
      <Textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="e.g. Shipped via DHL, tracking number XYZ123"
      />
      <Button
        className="mt-2"
        size="sm"
        onClick={handleSave}
        disabled={isSaving || comment.trim() === (currentComment ?? "")}
      >
        {isSaving && <Loader2 className="size-4 animate-spin" />}
        {isSaving ? "Saving..." : "Save Comment"}
      </Button>
    </div>
  );
}
