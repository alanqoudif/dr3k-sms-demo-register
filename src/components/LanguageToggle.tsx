
import React from 'react';
import { Language } from '@/utils/translations';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
          currentLanguage === 'en'
            ? 'bg-cyan-500 text-gray-900'
            : 'text-gray-300 hover:text-white'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-gray-500">|</span>
      <button
        onClick={() => onLanguageChange('ar')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
          currentLanguage === 'ar'
            ? 'bg-cyan-500 text-gray-900'
            : 'text-gray-300 hover:text-white'
        }`}
        aria-label="Switch to Arabic"
      >
        AR
      </button>
    </div>
  );
};
