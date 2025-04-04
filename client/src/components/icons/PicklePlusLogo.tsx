interface PicklePlusLogoProps {
  className?: string;
}

export function PicklePlusLogo({ className = "h-8 w-auto" }: PicklePlusLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 24 24"
        className="text-[#FF5722] mr-2"
        fill="currentColor"
      >
        <path d="M12.981,5.646c-1.55-0.46-2.067-1.991-2.067-1.991S8.548,2.715,5.923,3.225
        C4.029,3.589,3.388,5.297,3.065,6.394C2.51,8.228,2.695,10.22,3.332,12.045
        c1.433,4.115,5.196,5.605,5.196,5.605h0.006c0.354,0.138,0.686,0.218,0.983,0.239
        c0.933,0.066,1.484-0.917,1.484-0.917s2.109-3.803,4.184-1.191
        c0.537,0.775,1.046,1.513,1.458,2.073c1.207,1.646,2.389,1.919,3.088,1.685
        c0.885-0.297,1.292-1.278,1.246-2.204c-0.138-2.779-2.388-5.122-2.388-5.122
        S16.396,6.673,12.981,5.646z M7.193,14.16c-1.185,0-2.147-0.86-2.147-1.92
        c0-1.059,0.962-1.919,2.147-1.919c1.186,0,2.147,0.86,2.147,1.919
        C9.34,13.3,8.379,14.16,7.193,14.16z"/>
      </svg>
      <h1 className="text-2xl font-bold font-product-sans text-[#FF5722]">
        Pickle<span className="text-[#2196F3]">+</span>
      </h1>
    </div>
  );
}
