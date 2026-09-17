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
    // Immediately remove the current achievement from queue to dismiss instantly without delay
    setCurrentQueue((prev) => (prev.length > 0 ? prev.slice(1) : []));
  }, []);

  // When an achievement appears at the front of queue, show it for strictly 3 seconds
  useEffect(() => {
    if (currentQueue.length > 0) {
      setVisible(true);

      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }

      // Auto-dismiss strictly after 3 seconds (3000ms)
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
  }, [currentQueue[0]?.id, dismissCurrent]);

  if (currentQueue.length === 0 || !visible) return null;

  const current = currentQueue[0];
  const title = language === 'es' ? current.titleEs : current.titleEn;
  const desc = language === 'es' ? current.descriptionEs : current.descriptionEn;

  return (
    <div
      id="achievement-toast-banner"
      onClick={() => dismissCurrent()}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto max-w-md sm:max-w-lg w-[94%] transition-all duration-300 ease-out transform select-none cursor-pointer"
    >
      <div className="bg-slate-900/95 border-2 border-amber-400/90 rounded-2xl p-3 sm:p-4 shadow-[0_12px_40px_rgba(245,158,11,0.35),0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-3 sm:gap-3.5 hover:border-amber-300 transition-colors relative overflow-hidden">
        {/* Visual 3-second auto-dismiss progress bar */}
        <div
          key={current.id}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-300 w-full animate-[shrink_3s_linear_forwards]"
          style={{
            animation: 'shrinkWidth 3s linear forwards',
          }}
        />

        {/* Glowing Trophy Badge */}
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-lg shadow-amber-950/70">
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

        {/* Manual Dismiss Button with high visibility */}
        <button
          id="dismiss-achievement-toast-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismissCurrent();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            dismissCurrent();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-amber-400 hover:text-white transition-all cursor-pointer border border-amber-400/30 shadow-md shrink-0 min-h-[38px]"
          title={language === 'es' ? 'Quitar (No / Cerrar)' : 'Dismiss notification'}
          aria-label={language === 'es' ? 'Quitar logro' : 'Close achievement'}
        >
          <X className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-bold text-slate-200">
            {language === 'es' ? 'Quitar' : 'Close'}
          </span>
        </button>
      </div>
    </div>
  );
};
