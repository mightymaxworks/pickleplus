import logoImage from "../../assets/pickle-logo.png";

export function PicklePlusLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={logoImage} alt="PICKLE+" className="h-10" />
    </div>
  );
}