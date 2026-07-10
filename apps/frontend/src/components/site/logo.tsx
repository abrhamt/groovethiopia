import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-7 h-7 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Groovethiopia Logo"
          fill
          sizes="28px"
          className="object-contain"
          priority
        />
      </div>
      <div className="flex items-baseline gap-px">
        <span className="text-xl font-serif font-semibold text-gradient-gold">Groove</span>
        <span className="text-xl font-serif font-light text-foreground">thiopia</span>
      </div>
    </div>
  );
}