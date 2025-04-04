export function PicklePlusTextLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`font-bold text-[#FF5722] text-2xl flex items-center ${className}`}>
      <span>Pickle</span>
      <span className="text-[#2196F3]">+</span>
    </div>
  );
}