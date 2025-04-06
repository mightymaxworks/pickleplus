import logoImage from "../../assets/pickle-logo.png";

export function PicklePlusLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img src={logoImage} alt="PICKLE+" className="h-10" />
      <span className="text-xs text-muted-foreground mt-1">Powered by CourtIQ™</span>
    </div>
  );
}