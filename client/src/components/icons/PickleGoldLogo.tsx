import React from 'react';
import pickleGoldLogo from '../../assets/pickle-gold.png';

interface PickleGoldLogoProps {
  className?: string;
  height?: number;
}

export function PickleGoldLogo({ className, height = 30 }: PickleGoldLogoProps) {
  return (
    <img
      src={pickleGoldLogo}
      alt="PICKLE+ Gold Logo"
      className={className}
      style={{ height: `${height}px` }}
    />
  );
}