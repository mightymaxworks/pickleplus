interface PicklePlusLogoProps {
  className?: string;
}

export function PicklePlusLogo({ className = "h-8 w-auto" }: PicklePlusLogoProps) {
  // Calculate text size based on className height
  let textSize = "text-2xl";
  let letterSpacing = "tracking-tight";
  let fontWeight = "font-extrabold";
  
  if (className.includes("h-32")) {
    textSize = "text-6xl";
    letterSpacing = "tracking-tighter";
  } else if (className.includes("h-24")) {
    textSize = "text-5xl";
    letterSpacing = "tracking-tight";
  }
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <h1 className={`${textSize} ${fontWeight} ${letterSpacing} text-[#FF5722]`}>
        PICKLE<span className="text-[#2196F3] font-black">+</span>
      </h1>
    </div>
  );
}
