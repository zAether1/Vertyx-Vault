export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-card bg-graphite-900 ${className ?? ""}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[vv-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-graphite-800/80 to-transparent" />
      <style>{`@keyframes vv-shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}
