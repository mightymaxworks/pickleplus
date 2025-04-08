import React from 'react';
import pickleLogoPath from '../../assets/pickle-plus-logo.png';

interface PicklePlusNewLogoProps {
  className?: string;
}

export const PicklePlusNewLogo: React.FC<PicklePlusNewLogoProps> = ({ className }) => {
  return (
    <img 
      src={pickleLogoPath} 
      alt="Pickle+ Logo" 
      className={className} 
      style={{ 
        height: 'auto',
        width: 'auto',
        maxHeight: '100%',
        maxWidth: '100%',
        objectFit: 'contain'
      }}
    />
  );
};