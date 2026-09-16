import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles, CheckCircle2, X } from 'lucide-react';
import { AchievementDef, onAchievementUnlocked } from '../game/achievements';
import { useLanguage } from '../utils/i18n';
import { sound } from '../audio/soundEngine';

export const AchievementToast: React.FC = () => {
  const { language } = useLanguage();
  const [currentQueue, setCurrentQueue] = useState<AchievementDef[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = onAchievementUnlocked((achievement) => {
      sound.playSfx('secret');
      setCurrentQueue((prev) => [...prev, achievement]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (currentQueue.length > 0 && !visible) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setCurrentQueue((prev) => prev.slice(1));
        }, 300);
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [currentQueue, visible]);

  if (currentQueue.length === 0 || !visible) return null;

  const current = currentQueue[0];
  const title = language === 'es' ? current.titleEs : current.titleEn;
  const desc = language === 'es' ? current.descriptionEs : current.descriptionEn;

  return (
    <div
      id="achievement-toast-banner"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-sm sm:max-w-md w-[92%] animate-in slide-in-from-top-4 duration-300 select-none"
    >
      <div className="bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl p-3 shadow-[0_10px_35px_rgba(245,158,11,0.35)] backdrop-blur-md flex items-center gap-3">
        {/* Glowing Trophy Badge */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md shadow-amber-950/60 animate-bounce">
          <Trophy className="w-6 h-6 fill-slate-950 text-slate-950" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black tracking-wider text-amber-400 uppercase font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              {language === 'es' ? '¡LOGRO DESBLOQUEADO!' : 'ACHIEVEMENT UNLOCKED!'}
            </span>
            <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/40">
              +{current.points} PTS
            </span>
          </div>
          <div className="text-xs sm:text-sm font-black text-white truncate mt-0.5 font-heading">
            {title}
          </div>
          <div className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
            {desc}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setVisible(false)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
