import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { CONCEPTS } from "@/lib/concepts";

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 pt-12 md:pt-16">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.05] md:text-6xl">{title}</h1>
      {children && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{children}</div>}
    </section>
  );
}

export function Section({ title, kicker, children }: { title?: string; kicker?: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {kicker && <p className="eyebrow">{kicker}</p>}
      {title && <h2 className="mb-6 mt-2 text-2xl font-semibold md:text-3xl">{title}</h2>}
      {children}
    </section>
  );
}

export function ConceptPager({ current }: { current: string }) {
  const i = CONCEPTS.findIndex((c) => c.to === current);
  const prev = i > 0 ? CONCEPTS[i - 1] : null;
  const next = i < CONCEPTS.length - 1 ? CONCEPTS[i + 1] : null;
  return (
    <nav className="mx-auto mt-12 grid max-w-6xl gap-3 px-4 md:grid-cols-2">
      {prev ? (
        <Link to={prev.to} className="card-paper group flex items-center gap-3 p-5 transition-transform hover:-translate-y-0.5">
          <ArrowLeft className="size-5 text-primary transition-transform group-hover:-translate-x-1" />
          <span>
            <span className="eyebrow block">Anterior</span>
            <span className="font-display text-lg font-semibold">{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          to={next.to}
          className="card-paper group flex items-center justify-end gap-3 p-5 text-right transition-transform hover:-translate-y-0.5"
        >
          <span>
            <span className="eyebrow block">Siguiente</span>
            <span className="font-display text-lg font-semibold">{next.label}</span>
          </span>
          <ArrowRight className="size-5 text-primary transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </nav>
  );
}
