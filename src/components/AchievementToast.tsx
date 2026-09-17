import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import { AchievementDef, onAchievementUnlocked } from '../game/achievements';
import { useLanguage } from '../utils/i18n';
import { sound } from '../audio/soundEngine';

export const AchievementToast: React.FC = () => {
  const { language } = useLanguage();
  const [currentQueue, setCurrentQueue] = useState<AchievementDef[]>([]);
  const [visible, setVisible] = useState(false);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = onAchievementUnlocked((achievement) => {
      sound.playSfx('secret');
      setCurrentQueue((prev) => [...prev, achievement]);
    });
    return unsub;
  }, []);

  const dismissCurrent = useCallback(() => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }
    // Animate out
    setVisible(false);
    // Remove the current achievement from queue after exit animation
    setTimeout(() => {
      setCurrentQueue((prev) => prev.slice(1));
    }, 250);
  }, []);

  // When an achievement appears at the front of queue, show it for 3 seconds
  useEffect(() => {
    if (currentQueue.length > 0) {
      setVisible(true);

      // Auto-dismiss strictly after 3 seconds (3000ms) as requested
      autoDismissTimerRef.current = setTimeout(() => {
        dismissCurrent();
      }, 3000);

      return () => {
        if (autoDismissTimerRef.current) {
          clearTimeout(autoDismissTimerRef.current);
          autoDismissTimerRef.current = null;
        }
      };
    } else {
      setVisible(false);
    }
  }, [currentQueue.length > 0 ? currentQueue[0].id : null, dismissCurrent]);

  if (currentQueue.length === 0 || !visible) return null;

  const current = currentQueue[0];
  const title = language === 'es' ? current.titleEs : current.titleEn;
  const desc = language === 'es' ? current.descriptionEs : current.descriptionEn;

  return (
    <div
      id="achievement-toast-banner"
      onClick={() => dismissCurrent()}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-md sm:max-w-lg w-[94%] transition-all duration-300 ease-out transform select-none cursor-pointer"
    >
      <div className="bg-slate-900/95 border-2 border-amber-400/90 rounded-2xl p-3 sm:p-4 shadow-[0_12px_40px_rgba(245,158,11,0.35),0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-3 sm:gap-3.5 hover:border-amber-300 transition-colors">
        {/* Glowing Trophy Badge */}
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-lg shadow-amber-950/70 animate-bounce">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-slate-950" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-amber-400 uppercase font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              {language === 'es' ? '¡LOGRO DESBLOQUEADO!' : 'ACHIEVEMENT UNLOCKED!'}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/40">
              +{current.points} PTS
            </span>
          </div>
          <div className="text-sm sm:text-base font-black text-white truncate mt-0.5 font-heading">
            {title}
          </div>
          <div className="text-xs text-slate-300 line-clamp-1 mt-0.5">
            {desc}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          id="dismiss-achievement-toast-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismissCurrent();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-90 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/80 shadow-sm shrink-0 min-h-[36px]"
          title={language === 'es' ? 'Quitar notificación' : 'Dismiss notification'}
          aria-label={language === 'es' ? 'Cerrar' : 'Close'}
        >
          <X className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-bold text-slate-200 hidden sm:inline">
            {language === 'es' ? 'Cerrar' : 'Close'}
          </span>
        </button>
      </div>
    </div>
  );
};
