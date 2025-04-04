export function PicklePlusLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="text-[#FF5722] font-bold text-3xl tracking-wider">PICKLE</div>
      <div className="text-[#2196F3] font-bold text-3xl">+</div>
    </div>
  );
}