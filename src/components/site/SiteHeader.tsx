import { Link } from "@tanstack/react-router";
import owl from "@/assets/dra-lechuza.png";
import { CONCEPTS } from "@/lib/concepts";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src={owl} alt="" width={1024} height={1024} className="size-9" />
          <span className="font-display text-lg font-semibold leading-none">
            Prueba<span className="text-primary">&</span>Error
          </span>
        </Link>
        <nav className="-mx-1 flex flex-1 gap-1 overflow-x-auto px-1 md:justify-end">
          {CONCEPTS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              activeOptions={{ exact: true }}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" }}
            >
              {c.short}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:justify-between">
        <p>Prueba & Error · Hecho por José Emilio Martínez y Zoe Santillán Galindo (y el Dr. Roc)</p>
        <p>Este material educativo no sustituye el juicio clínico.</p>
      </div>
    </footer>
  );
}
