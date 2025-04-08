import React from 'react';
import pickleLogoPng from '@assets/Pickle (2).png';

// The official Pickle+ logo component using the provided image
export function OfficialPicklePlusLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    <img 
      src={pickleLogoPng} 
      alt="Pickle+" 
      className={className}
    />
  );
}

// White version for dark backgrounds
export function OfficialPicklePlusWhiteLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  // For the white version, we'll use the same image since it already has the proper contrast
  // against dark backgrounds (orange text and blue plus)
  return (
    <img 
      src={pickleLogoPng} 
      alt="Pickle+" 
      className={className}
    />
  );
}