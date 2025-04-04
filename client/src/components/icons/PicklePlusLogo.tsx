import logoImage from "@/assets/pickle-plus-logo.png";

interface PicklePlusLogoProps {
  className?: string;
}

export function PicklePlusLogo({ className = "h-8 w-auto" }: PicklePlusLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={logoImage} 
        alt="Pickle+ Logo" 
        className="w-auto h-full" 
      />
    </div>
  );
}
