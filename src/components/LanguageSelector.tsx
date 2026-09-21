import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, Language } from '../utils/i18n';
import { sound } from '../audio/soundEngine';

interface LanguageSelectorProps {
  variant?: 'compact' | 'expanded' | 'chips';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();

  const handleSelect = (lang: Language) => {
    sound.playSfx('menuSelect');
    setLanguage(lang);
  };

  // Variant: Chips (Dual toggle buttons with full labels)
  if (variant === 'chips') {
    return (
      <div
        id="language-selector-chips"
        className={`inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-md select-none ${className}`}
      >
        <div className="flex items-center gap-1 px-1.5 sm:px-2 text-slate-400 text-[10px] sm:text-xs font-mono font-bold">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xs:inline">IDIOMA:</span>
        </div>

        <button
          type="button"
          id="lang-btn-chips-es"
          onClick={() => handleSelect('es')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            language === 'es'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.6)]'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Cambiar idioma a Español"
        >
          <span className="text-sm leading-none">🇪🇸</span>
          <span className="tracking-wide">ESPAÑOL</span>
          {language === 'es' && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
        </button>

        <button
          type="button"
          id="lang-btn-chips-en"
          onClick={() => handleSelect('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            language === 'en'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.6)]'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Switch language to English"
        >
          <span className="text-sm leading-none">🇬🇧</span>
          <span className="tracking-wide">ENGLISH</span>
          {language === 'en' && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
        </button>
      </div>
    );
  }

  // Default / Compact: Direct dual-button pill for header (No dropdown, zero fail rate on mobile & desktop)
  return (
    <div
      id="header-language-toggle"
      className={`inline-flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-sm backdrop-blur-md select-none ${className}`}
      role="group"
      aria-label="Selector de idioma / Language selector"
    >
      <button
        type="button"
        id="lang-header-btn-es"
        onClick={() => handleSelect('es')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer active:scale-95 ${
          language === 'es'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
        }`}
        title="Español (ES)"
        aria-pressed={language === 'es'}
      >
        <span className="text-xs sm:text-sm leading-none">🇪🇸</span>
        <span className="font-mono tracking-wider font-bold">ES</span>
      </button>

      <button
        type="button"
        id="lang-header-btn-en"
        onClick={() => handleSelect('en')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer active:scale-95 ${
          language === 'en'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
        }`}
        title="English (EN)"
        aria-pressed={language === 'en'}
      >
        <span className="text-xs sm:text-sm leading-none">🇬🇧</span>
        <span className="font-mono tracking-wider font-bold">EN</span>
      </button>
    </div>
  );
};
