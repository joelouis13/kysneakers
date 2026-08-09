"use client";

import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selected, setSelected] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setSelected(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={selected === i}
            className={cn(
              "relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors sm:size-20",
              selected === i ? "border-primary" : "border-transparent hover:border-border"
            )}
          >
            <Image
              src={src}
              alt={`${productName} thumbnail ${i + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        aria-label="Zoom image"
        className="group relative aspect-square flex-1 overflow-hidden rounded-xl bg-muted"
      >
        <Image
          src={images[selected]}
          alt={productName}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
        <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ZoomIn className="size-4" />
        </span>
      </button>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent
          showCloseButton
          className="max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-3xl"
        >
          <DialogTitle className="sr-only">{productName}</DialogTitle>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={images[selected]}
              alt={productName}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
