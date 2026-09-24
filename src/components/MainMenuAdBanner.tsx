import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Sparkles, ExternalLink, Settings } from 'lucide-react';
import { useAdConfig, ADSENSE_CLIENT_ID } from '../utils/adManager';
import { useLanguage } from '../utils/i18n';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface MainMenuAdBannerProps {
  onOpenAdSettings?: () => void;
  className?: string;
  allowAds?: boolean;
  userIp?: string;
}

export const MainMenuAdBanner: React.FC<MainMenuAdBannerProps> = ({
  onOpenAdSettings,
  className = '',
  allowAds = true,
  userIp,
}) => {
  const { language } = useLanguage();
  const adConfig = useAdConfig();
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Dynamic filter check: if allowAds is false (filtered out in App.tsx) or excluded by adConfig
  const effectiveIsExcluded = !allowAds || adConfig.isExcluded || !adConfig.adsEnabled;
  const displayIp = userIp || adConfig.clientIp || '192.168.68.1';

  useEffect(() => {
    // If ads are disabled for this IP (creator mode), do nothing
    if (effectiveIsExcluded) {
      return;
    }

    // Attempt to push AdSense ad request
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }
      } catch (e) {
        console.warn('AdSense push error or ad blocker detected:', e);
        setAdError(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [effectiveIsExcluded]);

  // If Creator's IP is detected & excluded: completely invisible, zero visual footprint
  if (effectiveIsExcluded) {
    return null;
  }

  // Regular Visitor: Render Google AdSense Unit
  return (
    <aside aria-label="Espacio de Publicidad AdSense" className={`w-full max-w-2xl mx-auto my-2 px-2 select-none ${className}`}>
      {/* Discreet Header Label */}
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase px-1 mb-1 tracking-wider">
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-cyan-400/70" />
          <span>{language === 'es' ? 'Publicidad' : 'Advertisement'}</span>
        </span>
        <span className="text-slate-600 text-[8px]">Google AdSense</span>
      </div>

      {/* Ad Container Box */}
      <div className="relative min-h-[50px] sm:min-h-[70px] max-h-[95px] w-full rounded-xl bg-slate-950/70 border border-slate-800/80 overflow-hidden flex items-center justify-center p-1">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '50px', maxHeight: '90px' }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot="default"
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />

        {/* Fallback badge when ad is loading or pending domain review */}
        {(!adLoaded || adError) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono text-center">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-bold">Zion Adventure</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 text-[10px] hidden xs:inline">
                {language === 'es' ? 'Espacio publicitario para jugadores web' : 'Web player ad space'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
