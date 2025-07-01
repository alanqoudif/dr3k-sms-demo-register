
import React, { useState, useEffect } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { RegistrationForm } from '@/components/RegistrationForm';
import { translations, Language } from '@/utils/translations';

const Index = () => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && ['en', 'ar'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference and update document direction
  useEffect(() => {
    localStorage.setItem('preferred-language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">
            {t.title}
          </h1>
          <LanguageToggle 
            currentLanguage={language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <div className="inline-block p-4 bg-gray-800 rounded-full mb-6">
              <svg 
                className="w-12 h-12 text-cyan-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <h2 className={`text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto ${isRTL ? 'font-arabic' : ''}`}>
              {t.description}
            </h2>
          </div>
        </div>

        {/* Registration Form */}
        <RegistrationForm language={language} />

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p className={isRTL ? 'font-arabic' : ''}>
            {language === 'en' 
              ? 'Demo powered by Automapi SMS service' 
              : 'تجربة مدعومة بخدمة Automapi للرسائل النصية'
            }
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
