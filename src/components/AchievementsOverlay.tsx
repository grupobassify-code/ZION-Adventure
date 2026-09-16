import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Medal,
  Shield,
  Swords,
  Skull,
  Crown,
  Zap,
  Gem,
  Sparkles,
  Star,
  Compass,
  Wind,
  Timer,
  Flame,
  Target,
  Radio,
  Clock,
  Lock,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';
import {
  ACHIEVEMENTS,
  AchievementDef,
  AchievementCategory,
  AchievementTier,
  loadUnlockedAchievements,
  getAchievementStats,
} from '../game/achievements';
import { useLanguage } from '../utils/i18n';
import { sound } from '../audio/soundEngine';

interface AchievementsOverlayProps {
  slotId?: number;
  onClose: () => void;
}

export const AchievementsOverlay: React.FC<AchievementsOverlayProps> = ({ slotId, onClose }) => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'all' | AchievementCategory>('all');
  const [tierFilter, setTierFilter] = useState<'all' | AchievementTier>('all');

  const unlockedMap = loadUnlockedAchievements();
  const stats = getAchievementStats();

  const getIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Shield':
        return <Shield className={className} />;
      case 'Swords':
        return <Swords className={className} />;
      case 'Skull':
        return <Skull className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Gem':
        return <Gem className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Star':
        return <Star className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Wind':
        return <Wind className={className} />;
      case 'Timer':
        return <Timer className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Radio':
        return <Radio className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Trophy':
      default:
        return <Trophy className={className} />;
    }
  };

  const getTierBadge = (tier: AchievementTier) => {
    switch (tier) {
      case 'platinum':
        return {
          label: language === 'es' ? 'Platino' : 'Platinum',
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
          cardBorder: 'border-cyan-500/40 hover:border-cyan-400',
          glow: 'shadow-[0_0_18px_rgba(6,182,212,0.25)]',
          iconColor: 'text-cyan-400',
        };
      case 'gold':
        return {
          label: language === 'es' ? 'Oro' : 'Gold',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          cardBorder: 'border-amber-500/40 hover:border-amber-400',
          glow: 'shadow-[0_0_18px_rgba(245,158,11,0.25)]',
          iconColor: 'text-amber-400',
        };
      case 'silver':
        return {
          label: language === 'es' ? 'Plata' : 'Silver',
          bg: 'bg-slate-300/20 text-slate-200 border-slate-300/40',
          cardBorder: 'border-slate-500/40 hover:border-slate-300',
          glow: 'shadow-[0_0_14px_rgba(203,213,225,0.15)]',
          iconColor: 'text-slate-300',
        };
      case 'bronze':
      default:
        return {
          label: language === 'es' ? 'Bronce' : 'Bronze',
          bg: 'bg-orange-700/20 text-orange-300 border-orange-500/40',
          cardBorder: 'border-orange-700/40 hover:border-orange-500',
          glow: 'shadow-[0_0_12px_rgba(194,65,12,0.15)]',
          iconColor: 'text-orange-400',
        };
    }
  };

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (tierFilter !== 'all' && a.tier !== tierFilter) return false;
    return true;
  });

  const categories: { id: 'all' | AchievementCategory; labelEs: string; labelEn: string }[] = [
    { id: 'all', labelEs: 'Todos', labelEn: 'All' },
    { id: 'combat', labelEs: 'Combate & Jefes', labelEn: 'Combat & Bosses' },
    { id: 'exploration', labelEs: 'Exploración & Cristales', labelEn: 'Exploration & Crystals' },
    { id: 'speed', labelEs: 'Velocidad & Tiempo', labelEn: 'Speed & Time' },
    { id: 'mastery', labelEs: 'Maestría & Desafíos', labelEn: 'Mastery & Challenges' },
  ];

  return (
    <div
      id="achievements-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border-2 border-amber-400/40 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden relative">
        {/* Background ambient accents */}
        <div className="absolute -top-36 -left-36 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-36 -right-36 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md shadow-amber-950/50">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white font-heading tracking-wide">
                  {language === 'es' ? 'SALA DE LOGROS & MEDALLAS' : 'HALL OF ACHIEVEMENTS & MEDALS'}
                </h2>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {stats.unlockedCount} / {stats.total} ({stats.percentage}%)
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {language === 'es'
                  ? 'Completa hitos legendarios para desbloquear trofeos y medallas de honor'
                  : 'Complete legendary milestones to earn trophies and medals of honor'}
              </p>
            </div>
          </div>

          <button
            id="close-achievements-btn"
            onClick={() => {
              sound.playSfx('menuSelect');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={language === 'es' ? 'Cerrar' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stat Ribbon */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 relative z-10">
          {/* Progress Bar & Rate */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{language === 'es' ? 'Progreso Global' : 'Overall Progress'}</span>
              <span className="font-mono font-bold text-amber-400">{stats.percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Points earned */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">{language === 'es' ? 'Puntos de Honor' : 'Honor Points'}</div>
              <div className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                {stats.earnedPoints} <span className="text-slate-500 font-normal">/ {stats.totalPoints}</span>
              </div>
            </div>
          </div>

          {/* Medals count */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2 col-span-2 sm:col-span-2 justify-between">
            <div className="text-[11px] text-slate-400 hidden xs:inline">
              {language === 'es' ? 'Medallero:' : 'Medals:'}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300" title="Platino">
                <Crown className="w-3 h-3 text-cyan-400" />
                <span>{stats.platinum}</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-[10px] font-mono text-amber-300" title="Oro">
                <Medal className="w-3 h-3 text-amber-400" />
                <span>{stats.gold}</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-500/30 text-[10px] font-mono text-slate-300" title="Plata">
                <Award className="w-3 h-3 text-slate-300" />
                <span>{stats.silver}</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-950/60 border border-orange-500/30 text-[10px] font-mono text-orange-300" title="Bronce">
                <Trophy className="w-3 h-3 text-orange-400" />
                <span>{stats.bronze}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Tier Filter Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-950/30 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0 relative z-10">
          {/* Category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-full">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setSelectedCategory(c.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/40'
                    : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {language === 'es' ? c.labelEs : c.labelEn}
              </button>
            ))}
          </div>

          {/* Tier selector */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Filter className="w-3 h-3 text-slate-500" />
            <select
              value={tierFilter}
              onChange={(e) => {
                sound.playSfx('menuSelect');
                setTierFilter(e.target.value as any);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-0.5 text-xs outline-none cursor-pointer"
            >
              <option value="all">{language === 'es' ? 'Todas las Medallas' : 'All Medals'}</option>
              <option value="platinum">{language === 'es' ? 'Platino' : 'Platinum'}</option>
              <option value="gold">{language === 'es' ? 'Oro' : 'Gold'}</option>
              <option value="silver">{language === 'es' ? 'Plata' : 'Silver'}</option>
              <option value="bronze">{language === 'es' ? 'Bronce' : 'Bronze'}</option>
            </select>
          </div>
        </div>

        {/* Achievements Grid Container */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] sm:max-h-[64vh] grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          {filteredAchievements.map((achievement) => {
            const unlocked = unlockedMap[achievement.id];
            const target = achievement.target || 1;
            const currentProgress = unlocked?.progress || 0;
            const isUnlocked = currentProgress >= target;
            const tierStyle = getTierBadge(achievement.tier);
            const title = language === 'es' ? achievement.titleEs : achievement.titleEn;
            const desc = language === 'es' ? achievement.descriptionEs : achievement.descriptionEn;

            return (
              <div
                key={achievement.id}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-2.5 ${
                  isUnlocked
                    ? `bg-slate-950/80 ${tierStyle.cardBorder} ${tierStyle.glow}`
                    : 'bg-slate-950/40 border-slate-800/80 opacity-80'
                }`}
              >
                {/* Header of card: Icon, Title & Medal */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-transform ${
                      isUnlocked
                        ? `${tierStyle.bg} shadow-md`
                        : 'bg-slate-900/90 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? (
                      getIcon(achievement.iconName, `w-6 h-6 ${tierStyle.iconColor}`)
                    ) : (
                      <Lock className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isUnlocked ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {title}
                      </h4>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${tierStyle.bg}`}
                      >
                        {tierStyle.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                      {desc}
                    </p>
                  </div>
                </div>

                {/* Progress / Status Bottom bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  {/* Progress info */}
                  {achievement.target && achievement.target > 1 ? (
                    <div className="flex items-center gap-2 flex-1 max-w-[65%]">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isUnlocked ? 'bg-emerald-400' : 'bg-cyan-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.round((currentProgress / target) * 100))}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {Math.min(target, currentProgress)} / {target}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {language === 'es' ? 'Completado' : 'Completed'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Lock className="w-3 h-3" />
                          {language === 'es' ? 'Desafío Pendiente' : 'Locked Milestone'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Points tag */}
                  <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-[11px] shrink-0">
                    <Sparkles className="w-3 h-3" />
                    <span>+{achievement.points} PTS</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0 relative z-10">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {language === 'es'
              ? '💡 Consejo: Completa niveles sin daño o recolecta el 100% de cristales para desbloquear medallas de Oro y Platino.'
              : '💡 Tip: Complete levels without damage or collect 100% crystals to unlock Gold and Platinum medals.'}
          </div>

          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/50 active:scale-95 transition-all cursor-pointer text-center"
          >
            {language === 'es' ? 'ENTENDIDO' : 'CONTINUE'}
          </button>
        </div>
      </div>
    </div>
  );
};
