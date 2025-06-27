/**
 * Language-Aware Logo Component
 * 
 * Automatically switches between English and Mandarin logos based on the current language setting.
 * Uses the existing English logo and the new Mandarin logo provided by the user.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @created 2025-06-27
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PicklePlusNewLogo } from './PicklePlusNewLogo';
import mandarinLogoPath from '@assets/Pickle (950 x 500 px)_1750986917966.png';

interface LanguageAwareLogoProps {
  height?: string;
  width?: string;
  className?: string;
  preserveAspectRatio?: boolean;
  onClick?: () => void;
}

export function LanguageAwareLogo({ 
  height = "32px", 
  width = "auto", 
  className = "",
  preserveAspectRatio = true,
  onClick 
}: LanguageAwareLogoProps) {
  const { language } = useLanguage();

  // Use Mandarin logo when language is Chinese, English logo otherwise
  if (language === 'zh') {
    return (
      <img
        src={mandarinLogoPath}
        alt="球界+"
        className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
        style={{
          height,
          width,
          objectFit: preserveAspectRatio ? 'contain' : 'cover'
        }}
        onClick={onClick}
      />
    );
  }

  // Default to English logo
  return (
    <div className={`${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <PicklePlusNewLogo 
        height={height}
        width={width}
        preserveAspectRatio={preserveAspectRatio}
      />
    </div>
  );
}