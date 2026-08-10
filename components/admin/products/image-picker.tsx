"use client";

import { Star, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ImageInput } from "@/lib/admin/products/types";

export type ImageDraft =
  | { kind: "existing"; id: string; url: string; isFeatured: boolean }
  | { kind: "new"; tempId: string; file: File; previewUrl: string; isFeatured: boolean };

export function toImageInputs(drafts: ImageDraft[]): ImageInput[] {
  return drafts.map((d) =>
    d.kind === "existing"
      ? { kind: "existing", id: d.id, isFeatured: d.isFeatured }
      : { kind: "new", file: d.file, isFeatured: d.isFeatured }
  );
}

export function ImagePicker({
  value,
  onChange,
}: {
  value: ImageDraft[];
  onChange: (next: ImageDraft[]) => void;
}) {
  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const additions: ImageDraft[] = Array.from(fileList).map((file) => ({
      kind: "new",
      tempId: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      isFeatured: false,
    }));
    const next = [...value, ...additions];
    if (!next.some((d) => d.isFeatured)) next[0] = { ...next[0], isFeatured: true };
    onChange(next);
  }

  function removeAt(index: number) {
    const item = value[index];
    if (item.kind === "new") URL.revokeObjectURL(item.previewUrl);
    const next = value.filter((_, i) => i !== index);
    if (item.isFeatured && next.length > 0) next[0] = { ...next[0], isFeatured: true };
    onChange(next);
  }

  function setFeatured(index: number) {
    onChange(value.map((d, i) => ({ ...d, isFeatured: i === index })));
  }

  return (
    <div>
      <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground hover:border-primary">
        Click to select images
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {value.map((draft, index) => {
            const url = draft.kind === "existing" ? draft.url : draft.previewUrl;
            const key = draft.kind === "existing" ? draft.id : draft.tempId;
            return (
              <div key={key} className="group relative aspect-square overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- mix of blob: previews and remote URLs, not worth next/image's domain config here */}
                <img src={url} alt="" className="size-full object-cover" />

                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm"
                >
                  <X className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setFeatured(index)}
                  className={cn(
                    "absolute bottom-1 left-1 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium",
                    draft.isFeatured
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/90 text-foreground opacity-0 group-hover:opacity-100"
                  )}
                >
                  <Star className={cn("size-3", draft.isFeatured && "fill-current")} />
                  {draft.isFeatured ? "Featured" : "Set featured"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {value.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">No images yet — you can still save as a draft.</p>
      )}
    </div>
  );
}

