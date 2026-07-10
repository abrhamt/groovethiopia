import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Groovethiopia Logo"
          fill
          sizes="32px"
          className="object-contain"
          priority
        />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight text-gradient-gold font-serif">
          Groove
        </span>
        <span className="text-2xl font-light tracking-tight text-foreground font-serif">
          thiopia
        </span>
      </div>
    </div>
  );
}