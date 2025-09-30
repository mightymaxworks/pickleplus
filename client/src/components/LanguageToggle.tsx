import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white">
          <Languages className="h-4 w-4" />
          {language === 'en' ? 'English' : '中文'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
        <DropdownMenuItem onClick={() => setLanguage('en')} className="text-white hover:bg-slate-700 cursor-pointer">
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('zh-CN')} className="text-white hover:bg-slate-700 cursor-pointer">
          🇨🇳 中文
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}