import React, { useState, useMemo } from 'react';
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
  Search,
  ChevronRight,
  Info,
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

type StatusFilter = 'all' | 'unlocked' | 'locked';

export const AchievementsOverlay: React.FC<AchievementsOverlayProps> = ({ slotId, onClose }) => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'all' | AchievementCategory>('all');
  const [tierFilter, setTierFilter] = useState<'all' | AchievementTier>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const unlockedMap = loadUnlockedAchievements();
  const stats = getAchievementStats();

  const getIcon = (iconName: string, className = 'w-6 h-6') => {
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
          bg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50',
          cardBorder: 'border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.18)]',
          iconBg: 'bg-gradient-to-br from-cyan-400/20 to-blue-600/30 border-cyan-400/60 text-cyan-300 shadow-lg shadow-cyan-950/60',
          accentText: 'text-cyan-400',
        };
      case 'gold':
        return {
          label: language === 'es' ? 'Oro' : 'Gold',
          bg: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
          cardBorder: 'border-amber-500/50 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.18)]',
          iconBg: 'bg-gradient-to-br from-amber-400/20 to-orange-600/30 border-amber-400/60 text-amber-300 shadow-lg shadow-amber-950/60',
          accentText: 'text-amber-400',
        };
      case 'silver':
        return {
          label: language === 'es' ? 'Plata' : 'Silver',
          bg: 'bg-slate-300/20 text-slate-200 border-slate-300/50',
          cardBorder: 'border-slate-500/50 hover:border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.12)]',
          iconBg: 'bg-gradient-to-br from-slate-300/20 to-slate-500/30 border-slate-300/60 text-slate-200 shadow-lg shadow-slate-950/60',
          accentText: 'text-slate-300',
        };
      case 'bronze':
      default:
        return {
          label: language === 'es' ? 'Bronce' : 'Bronze',
          bg: 'bg-orange-700/20 text-orange-200 border-orange-500/50',
          cardBorder: 'border-orange-700/50 hover:border-orange-500 shadow-[0_0_15px_rgba(194,65,12,0.12)]',
          iconBg: 'bg-gradient-to-br from-orange-600/20 to-amber-900/30 border-orange-500/60 text-orange-300 shadow-lg shadow-orange-950/60',
          accentText: 'text-orange-400',
        };
    }
  };

  const categories: { id: 'all' | AchievementCategory; labelEs: string; labelEn: string }[] = [
    { id: 'all', labelEs: 'Todos los Logros', labelEn: 'All Feats' },
    { id: 'combat', labelEs: 'Combate & Jefes', labelEn: 'Combat & Bosses' },
    { id: 'exploration', labelEs: 'Exploración & Cristales', labelEn: 'Exploration & Crystals' },
    { id: 'speed', labelEs: 'Velocidad & Tiempo', labelEn: 'Speed & Time' },
    { id: 'mastery', labelEs: 'Maestría & Desafíos', labelEn: 'Mastery & Challenges' },
  ];

  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => {
      // Category filter
      if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
      // Tier filter
      if (tierFilter !== 'all' && a.tier !== tierFilter) return false;

      // Status filter
      const unlocked = unlockedMap[a.id];
      const target = a.target || 1;
      const currentProgress = unlocked?.progress || 0;
      const isUnlocked = currentProgress >= target;

      if (statusFilter === 'unlocked' && !isUnlocked) return false;
      if (statusFilter === 'locked' && isUnlocked) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (language === 'es' ? a.titleEs : a.titleEn).toLowerCase();
        const desc = (language === 'es' ? a.descriptionEs : a.descriptionEn).toLowerCase();
        if (!title.includes(q) && !desc.includes(q)) return false;
      }

      return true;
    });
  }, [selectedCategory, tierFilter, statusFilter, searchQuery, unlockedMap, language]);

  return (
    <div
      id="achievements-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
    >
      <div className="w-full max-w-5xl h-[92vh] max-h-[820px] bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden relative backdrop-blur-xl">
        {/* Subtle decorative ambient lights */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Bar: Spacious, uncluttered, with core progression overview */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-800/90 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/25 to-yellow-600/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-950/60 shrink-0">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white font-heading tracking-wide">
                  {language === 'es' ? 'SALA DE LOGROS & MEDALLAS' : 'HALL OF ACHIEVEMENTS & MEDALS'}
                </h2>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-400/40 px-2.5 py-0.5 rounded-full shadow-inner">
                  {stats.unlockedCount} / {stats.total} ({stats.percentage}%)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'es'
                  ? 'Supera hazañas legendarias para ganar medallas de honor y puntos cuánticos'
                  : 'Overcome legendary feats to earn medals of honor and quantum points'}
              </p>
            </div>
          </div>

          {/* Right Header: Medallero & Close Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3.5">
            {/* Medallero badges row */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-inner">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300" title="Platino">
                <Crown className="w-3.5 h-3.5 text-cyan-400" />
                <span>{stats.platinum}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-xs font-mono font-bold text-amber-300" title="Oro">
                <Medal className="w-3.5 h-3.5 text-amber-400" />
                <span>{stats.gold}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-500/30 text-xs font-mono font-bold text-slate-300" title="Plata">
                <Award className="w-3.5 h-3.5 text-slate-300" />
                <span>{stats.silver}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-950/60 border border-orange-500/30 text-xs font-mono font-bold text-orange-300" title="Bronce">
                <Trophy className="w-3.5 h-3.5 text-orange-400" />
                <span>{stats.bronze}</span>
              </div>
            </div>

            {/* Total Gamer Points Badge */}
            <div className="hidden md:flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-2xl text-xs font-mono font-bold text-amber-300 shadow-inner">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>{stats.earnedPoints} <span className="text-slate-500">/ {stats.totalPoints} PTS</span></span>
            </div>

            {/* Close Button */}
            <button
              id="close-achievements-btn"
              onClick={() => {
                sound.playSfx('menuSelect');
                onClose();
              }}
              className="w-10 h-10 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
              title={language === 'es' ? 'Cerrar' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Global Progress Bar Strip */}
        <div className="px-5 sm:px-7 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-4 shrink-0 relative z-10">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              {language === 'es' ? 'Progreso Global:' : 'Global Progress:'}
            </span>
            <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden border border-slate-700/80 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 whitespace-nowrap">
              {stats.percentage}%
            </span>
          </div>

          <div className="flex md:hidden items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>{stats.earnedPoints} PTS</span>
          </div>
        </div>

        {/* 3. Filters & Search Navigation Toolbar */}
        <div className="px-5 sm:px-7 py-3 bg-slate-950/40 border-b border-slate-800/70 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shrink-0 relative z-10">
          {/* Category Tabs: Generous padding, no cramped horizontal scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setSelectedCategory(c.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === c.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-300 text-slate-950 shadow-md shadow-amber-950/50 font-black'
                    : 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {language === 'es' ? c.labelEs : c.labelEn}
              </button>
            ))}
          </div>

          {/* Secondary Controls: Status, Tier, and Search */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status pills: Todos / Desbloqueados / Pendientes */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setStatusFilter('all');
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-750 text-white font-bold bg-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'es' ? 'Todos' : 'All'}
              </button>
              <button
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setStatusFilter('unlocked');
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'unlocked'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                {language === 'es' ? 'Desbloqueados' : 'Unlocked'}
              </button>
              <button
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setStatusFilter('locked');
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'locked'
                    ? 'bg-slate-700 text-amber-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'es' ? 'Pendientes' : 'Locked'}
              </button>
            </div>

            {/* Tier Select */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={tierFilter}
                onChange={(e) => {
                  sound.playSfx('menuSelect');
                  setTierFilter(e.target.value as any);
                }}
                className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer font-medium"
              >
                <option value="all" className="bg-slate-900 text-white">{language === 'es' ? 'Todas Medallas' : 'All Medals'}</option>
                <option value="platinum" className="bg-slate-900 text-cyan-300">{language === 'es' ? 'Platino' : 'Platinum'}</option>
                <option value="gold" className="bg-slate-900 text-amber-300">{language === 'es' ? 'Oro' : 'Gold'}</option>
                <option value="silver" className="bg-slate-900 text-slate-300">{language === 'es' ? 'Plata' : 'Silver'}</option>
                <option value="bronze" className="bg-slate-900 text-orange-300">{language === 'es' ? 'Bronce' : 'Bronze'}</option>
              </select>
            </div>

            {/* Quick Search */}
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'es' ? 'Buscar logro...' : 'Search feat...'}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Achievements List Area: Airy, spacious, relaxed cards */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto min-h-0 relative z-10">
          {filteredAchievements.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-3xl border border-slate-800">
              <Trophy className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-300">
                {language === 'es' ? 'No se encontraron logros' : 'No achievements found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {language === 'es'
                  ? 'Prueba ajustando los filtros de categoría, medalla o el término de búsqueda.'
                  : 'Try adjusting your category filters, medal tier, or search query.'}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setTierFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'es' ? 'Restablecer Filtros' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3.5 ${
                      isUnlocked
                        ? `bg-slate-950/85 ${tierStyle.cardBorder}`
                        : 'bg-slate-950/40 border-slate-800/90 hover:border-slate-700/80 opacity-90'
                    }`}
                  >
                    {/* Top Row: Icon + Title + Badges */}
                    <div className="flex items-start gap-4">
                      {/* Large 52x52px Icon container with generous breathing room */}
                      <div
                        className={`w-13 h-13 rounded-2xl border flex items-center justify-center shrink-0 transition-transform ${
                          isUnlocked
                            ? `${tierStyle.iconBg}`
                            : 'bg-slate-900/90 border-slate-800 text-slate-500'
                        }`}
                      >
                        {isUnlocked ? (
                          getIcon(achievement.iconName, `w-7 h-7 ${tierStyle.accentText}`)
                        ) : (
                          <Lock className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4
                            className={`text-sm sm:text-base font-black tracking-wide ${
                              isUnlocked ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {title}
                          </h4>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Tier Badge */}
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${tierStyle.bg}`}
                            >
                              {tierStyle.label}
                            </span>
                            {/* Points badge */}
                            <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-yellow-400" />
                              +{achievement.points}
                            </span>
                          </div>
                        </div>

                        {/* Full description without cut-off or clamping */}
                        <p className="text-xs sm:text-[13px] text-slate-300/90 leading-relaxed mt-1.5 font-normal">
                          {desc}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Status / Progress Bar */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                      {/* Multi-step progress bar or simple status pill */}
                      {achievement.target && achievement.target > 1 ? (
                        <div className="flex items-center gap-3 flex-1 max-w-[75%]">
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/80 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isUnlocked
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.round((currentProgress / target) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-300 shrink-0">
                            {Math.min(target, currentProgress)} / {target}
                          </span>
                        </div>
                      ) : (
                        <div>
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              {language === 'es' ? '¡Desbloqueado!' : 'Completed!'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                              {language === 'es' ? 'Desafío Pendiente' : 'Milestone Locked'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Right indicator */}
                      <div className="text-[11px] font-mono text-slate-500">
                        {isUnlocked ? (
                          <span className="text-emerald-400/90 font-bold">✓ 100%</span>
                        ) : (
                          <span>{Math.min(100, Math.round((currentProgress / target) * 100))}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Footer Bar: Spacious, helpful, with prominent exit action */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-800/90 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0 hidden sm:block" />
            <span>
              {language === 'es'
                ? 'Tip: Puedes revisar tus logros en cualquier momento desde el menú principal o pausando la partida (P / ESC).'
                : 'Tip: You can review your achievements anytime from the main menu or by pausing the game (P / ESC).'}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              onClose();
            }}
            className="w-full sm:w-auto px-7 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-950/50 active:scale-95 transition-all cursor-pointer text-center"
          >
            {language === 'es' ? 'VOLVER AL JUEGO' : 'BACK TO GAME'}
          </button>
        </div>
      </div>
    </div>
  );
};
