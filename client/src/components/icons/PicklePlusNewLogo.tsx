import React from 'react';
import pickleLogoPath from '../../assets/pickle-plus-logo.png';

interface PicklePlusNewLogoProps {
  className?: string;
  preserveAspectRatio?: boolean;
  width?: string | number;
  height?: string | number;
}

export const PicklePlusNewLogo: React.FC<PicklePlusNewLogoProps> = ({ 
  className, 
  preserveAspectRatio = true,
  width,
  height
}) => {
  return (
    <img 
      src={pickleLogoPath} 
      alt="Pickle+ Logo" 
      className={className} 
      style={{ 
        height: height || 'auto',
        width: width || '100%',
        maxHeight: preserveAspectRatio ? '100%' : 'none',
        maxWidth: preserveAspectRatio ? '100%' : 'none',
        objectFit: 'contain'
      }}
    />
  );
};