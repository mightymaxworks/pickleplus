import React from 'react';
import pickleLogoSrc from '@/assets/pickle-plus-logo-white.png';

interface PicklePlusWhiteLogoProps {
  className?: string;
  height?: number;
  width?: number;
}

export const PicklePlusWhiteLogo: React.FC<PicklePlusWhiteLogoProps> = ({
  className = '',
  height,
  width,
}) => {
  const style: React.CSSProperties = {
    height: height ? `${height}px` : 'auto',
    width: width ? `${width}px` : 'auto',
  };

  return (
    <img 
      src={pickleLogoSrc} 
      alt="Pickle Plus Logo" 
      className={className} 
      style={style}
    />
  );
};