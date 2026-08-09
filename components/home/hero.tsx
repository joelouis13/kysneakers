"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

const SLIDES: Slide[] = [
  {
    image: "/hero1.jpg",
    eyebrow: "New Season",
    title: "Step Into Something Bold",
    description:
      "Authentic sneakers and streetwear from the world's biggest names — curated for Ghana, delivered fast.",
    ctaLabel: "Shop Now",
    ctaHref: "/shop",
    secondaryLabel: "View Collections",
    secondaryHref: "/collections",
  },
  {
    image: "/hero2.jpg",
    eyebrow: "Just Dropped",
    title: "New Arrivals Are Here",
    description:
      "Fresh kicks added every week. Be first to cop the latest silhouettes before they sell out.",
    ctaLabel: "Shop New Arrivals",
    ctaHref: "/shop?sort=newest",
    secondaryLabel: "View Collections",
    secondaryHref: "/collections",
  },
  {
    image: "/hero3.jpg",
    eyebrow: "Limited Time",
    title: "Up to 20% Off Select Styles",
    description:
      "Free delivery in Accra on orders over GHS 500. Grab your favorites before the sale ends.",
    ctaLabel: "Shop the Sale",
    ctaHref: "/shop?filter=on-sale",
    secondaryLabel: "View Collections",
    secondaryHref: "/collections",
  },
];

const AUTOPLAY_MS = 6000;

export function Hero() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const slide = SLIDES[index];

  return (
    <section
      className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-primary sm:aspect-video lg:aspect-21/9">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={slide.image}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) goTo(index + 1);
              else if (info.offset.x > 80) goTo(index - 1);
            }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="pointer-events-none object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/10 to-transparent" />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 p-6 sm:p-10"
            >
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
                {slide.eyebrow}
              </span>
              <h1 className="max-w-lg font-heading text-4xl leading-none tracking-wide text-white sm:text-6xl">
                {slide.title}
              </h1>
              <p className="max-w-md text-sm text-white/85 sm:text-base">
                {slide.description}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" variant="secondary" asChild>
                  <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white bg-transparent text-white hover:bg-white hover:text-primary"
                  asChild
                >
                  <Link href={slide.secondaryHref}>{slide.secondaryLabel}</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => goTo(index - 1)}
          className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition-colors hover:bg-background sm:flex"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => goTo(index + 1)}
          className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition-colors hover:bg-background sm:flex"
        >
          <ChevronRight className="size-5" />
        </button>

        <div className="absolute bottom-4 right-4 flex gap-2 sm:bottom-6 sm:right-6">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full bg-white/50 transition-all",
                i === index ? "w-6 bg-white" : "w-1.5 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
