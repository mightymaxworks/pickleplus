export function PicklePlusTextLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="font-bold text-[#FF5722] text-2xl flex items-center">
        <span>PICKLE</span>
        <span className="text-[#2196F3]">+</span>
      </div>
      <span className="text-xs text-muted-foreground mt-1">Powered by CourtIQ™</span>
    </div>
  );
}