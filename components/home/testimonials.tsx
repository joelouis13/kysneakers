import { Star } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    name: "Kwame A.",
    location: "Accra",
    rating: 5,
    quote:
      "Copped the Jordan 4 Retro and it arrived in two days, exactly as pictured. KYSneakers is legit.",
  },
  {
    name: "Ama S.",
    location: "Kumasi",
    rating: 5,
    quote:
      "Best sneaker store in Ghana, hands down. The Samba OG fit perfectly and packaging was premium.",
  },
  {
    name: "Kojo B.",
    location: "Takoradi",
    rating: 4,
    quote:
      "Great selection and the mobile money checkout was smooth. Will definitely order again.",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-center font-heading text-3xl tracking-wide text-foreground">
        What Our Customers Say
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="rounded-xl border border-border bg-card p-6">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={
                    i < t.rating
                      ? "size-4 fill-secondary text-secondary"
                      : "size-4 text-border"
                  }
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials(t.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
