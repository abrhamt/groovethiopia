// Wordmark logo — placeholder until real logo arrives
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-1 ${className}`}>
      <span className="text-2xl font-semibold tracking-tight text-gradient-gold font-serif">
        Groove
      </span>
      <span className="text-2xl font-light tracking-tight text-foreground font-serif">
        thiopia
      </span>
    </div>
  );
}