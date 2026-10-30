import type { ReactNode } from "react";
import owl from "@/assets/dra-lechuza.png";
import { cn } from "@/lib/utils";

type GuideProps = {
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = { sm: "w-20", md: "w-28 md:w-32", lg: "w-40 md:w-56" };

/** Dra. Lechuza, the site's guide, with a comic-style speech bubble. */
export function Guide({ children, title = "Dr. Roc", size = "md", className }: GuideProps) {
  return (
    <div className={cn("flex items-end gap-3 md:gap-5", className)}>
      <img
        src={owl}
        alt="Dr. Roc, la guía"
        width={1024}
        height={1024}
        loading="lazy"
        className={cn("owl-bob shrink-0", sizes[size])}
      />
      <div className="speech-bubble mb-6 flex-1 px-5 py-4 text-[0.95rem] leading-relaxed">
        <span
          aria-hidden
          className="absolute -left-[9px] bottom-6 size-4 rotate-45 border-b-[1.5px] border-l-[1.5px] border-foreground bg-bubble"
        />
        <p className="eyebrow mb-1">{title}</p>
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
}
