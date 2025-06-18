import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh-CN' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-sm"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">
        {language === 'en' ? '中文' : 'English'}
      </span>
      <span className="sm:hidden">
        {language === 'en' ? '中' : 'EN'}
      </span>
    </Button>
  );
}