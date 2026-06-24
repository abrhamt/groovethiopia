import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-px", className)}>
      <span className="text-xl font-serif font-semibold text-gradient-gold">Groove</span>
      <span className="text-xl font-serif font-light text-foreground">thiopia</span>
    </div>
  );
}