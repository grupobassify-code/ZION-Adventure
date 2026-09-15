import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleSelect = (lang: Language) => {
    if (lang !== language) {
      sound.playSfx('menuSelect');
      setLanguage(lang);
    }
    setDropdownOpen(false);
  };

  // Variant: Chips (Dual toggle buttons - ideal for Title screen)
  if (variant === 'chips') {
    return (
      <div
        id="language-selector-chips"
        className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-md ${className}`}
      >
        <div className="flex items-center gap-1 px-2 text-slate-400 text-[10px] sm:text-xs font-mono font-bold">
          <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span className="hidden xs:inline">IDIOMA:</span>
        </div>

        <button
          type="button"
          id="lang-btn-es"
          onClick={() => handleSelect('es')}
          className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            language === 'es'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-100'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Cambiar idioma a Español"
        >
          <span className="text-sm leading-none">🇪🇸</span>
          <span className="tracking-wide">ESPAÑOL</span>
          {language === 'es' && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
        </button>

        <button
          type="button"
          id="lang-btn-en"
          onClick={() => handleSelect('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.6)] scale-100'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Switch language to English"
        >
          <span className="text-sm leading-none">🇬🇧</span>
          <span className="tracking-wide">ENGLISH</span>
          {language === 'en' && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
        </button>
      </div>
    );
  }

  // Variant: Expanded Dropdown / Pill (Ideal for header)
  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        id="language-selector-button"
        onClick={() => {
          sound.playSfx('menuSelect');
          setDropdownOpen((prev) => !prev);
        }}
        className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 transition-all flex items-center gap-1.5 text-[10px] sm:text-xs font-bold shadow-md active:scale-95 cursor-pointer"
        title={language === 'es' ? 'Selector de idioma (Español / English)' : 'Language selector (English / Español)'}
        aria-label="Language Selector"
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
        <span className="text-sm leading-none">{language === 'es' ? '🇪🇸' : '🇬🇧'}</span>
        <span className="hidden sm:inline font-mono uppercase tracking-wider">
          {language === 'es' ? 'ES' : 'EN'}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div
          id="language-dropdown-menu"
          className="absolute right-0 mt-1.5 w-36 sm:w-40 rounded-xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl backdrop-blur-xl p-1 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2 py-1 text-[9px] font-mono text-cyan-400/80 font-bold tracking-wider uppercase border-b border-slate-800">
            {language === 'es' ? 'IDIOMA / LANG' : 'LANGUAGE / IDIOMA'}
          </div>

          <button
            type="button"
            id="lang-option-es"
            onClick={() => handleSelect('es')}
            className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              language === 'es'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🇪🇸</span>
              <span>Español</span>
            </div>
            {language === 'es' && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />}
          </button>

          <button
            type="button"
            id="lang-option-en"
            onClick={() => handleSelect('en')}
            className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              language === 'en'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">🇬🇧</span>
              <span>English</span>
            </div>
            {language === 'en' && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />}
          </button>
        </div>
      )}
    </div>
  );
};
