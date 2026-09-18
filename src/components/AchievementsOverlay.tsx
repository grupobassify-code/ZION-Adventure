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
  ChevronDown,
} from 'lucide-react';
import {
  ACHIEVEMENTS,
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

export const AchievementsOverlay: React.FC<AchievementsOverlayProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'all' | AchievementCategory>('all');
  const [tierFilter, setTierFilter] = useState<'all' | AchievementTier>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchMobile, setShowSearchMobile] = useState(false);

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
          cardBorder: 'border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.18)]',
          iconBg: 'bg-gradient-to-br from-cyan-400/30 to-blue-600/40 border-cyan-400/70 text-cyan-300 shadow-md shadow-cyan-950/60',
          accentText: 'text-cyan-400',
        };
      case 'gold':
        return {
          label: language === 'es' ? 'Oro' : 'Gold',
          bg: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
          cardBorder: 'border-amber-500/50 hover:border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.18)]',
          iconBg: 'bg-gradient-to-br from-amber-400/30 to-orange-600/40 border-amber-400/70 text-amber-300 shadow-md shadow-amber-950/60',
          accentText: 'text-amber-400',
        };
      case 'silver':
        return {
          label: language === 'es' ? 'Plata' : 'Silver',
          bg: 'bg-slate-300/20 text-slate-200 border-slate-300/50',
          cardBorder: 'border-slate-500/50 hover:border-slate-300 shadow-[0_0_16px_rgba(203,213,225,0.12)]',
          iconBg: 'bg-gradient-to-br from-slate-300/30 to-slate-500/40 border-slate-300/70 text-slate-200 shadow-md shadow-slate-950/60',
          accentText: 'text-slate-300',
        };
      case 'bronze':
      default:
        return {
          label: language === 'es' ? 'Bronce' : 'Bronze',
          bg: 'bg-orange-700/20 text-orange-200 border-orange-500/50',
          cardBorder: 'border-orange-700/50 hover:border-orange-500 shadow-[0_0_16px_rgba(194,65,12,0.12)]',
          iconBg: 'bg-gradient-to-br from-orange-600/30 to-amber-900/40 border-orange-500/70 text-orange-300 shadow-md shadow-orange-950/60',
          accentText: 'text-orange-400',
        };
    }
  };

  const categories: { id: 'all' | AchievementCategory; labelEs: string; labelEn: string; shortEs: string; shortEn: string }[] = [
    { id: 'all', labelEs: 'Todos los Logros', labelEn: 'All Feats', shortEs: 'Todos', shortEn: 'All' },
    { id: 'combat', labelEs: 'Combate & Jefes', labelEn: 'Combat & Bosses', shortEs: 'Combate', shortEn: 'Combat' },
    { id: 'exploration', labelEs: 'Exploración & Cristales', labelEn: 'Exploration & Crystals', shortEs: 'Exploración', shortEn: 'Explore' },
    { id: 'speed', labelEs: 'Velocidad & Esquí', labelEn: 'Speed & Skiing', shortEs: 'Velocidad', shortEn: 'Speed' },
    { id: 'mastery', labelEs: 'Maestría & Desafíos', labelEn: 'Mastery & Challenges', shortEs: 'Maestría', shortEn: 'Mastery' },
  ];

  // Category counts computation for clear breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; unlocked: number }> = {
      all: { total: ACHIEVEMENTS.length, unlocked: 0 },
      combat: { total: 0, unlocked: 0 },
      exploration: { total: 0, unlocked: 0 },
      speed: { total: 0, unlocked: 0 },
      mastery: { total: 0, unlocked: 0 },
    };
    for (const a of ACHIEVEMENTS) {
      const u = unlockedMap[a.id];
      const target = a.target || 1;
      const isU = (u?.progress || 0) >= target;
      if (isU) counts.all.unlocked++;
      if (counts[a.category]) {
        counts[a.category].total++;
        if (isU) counts[a.category].unlocked++;
      }
    }
    return counts;
  }, [unlockedMap]);

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
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-3 md:p-6 select-none animate-in fade-in duration-200"
    >
      <div className="w-full sm:max-w-5xl md:max-w-6xl h-[100dvh] sm:h-[94vh] max-h-[920px] bg-slate-900/98 sm:border-2 sm:border-amber-500/40 rounded-none sm:rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.22)] flex flex-col overflow-hidden relative backdrop-blur-xl">
        {/* Decorative ambient backdrop glows */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header Bar: Ultra-optimized for mobile phones (landscape & portrait) and desktop */}
        <div className="px-2.5 sm:px-6 md:px-8 py-2 sm:py-3.5 border-b border-slate-800/90 bg-slate-950/90 flex flex-col gap-1.5 sm:gap-2 shrink-0 relative z-10">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Title & Status */}
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400/25 to-yellow-600/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 shadow-md shadow-amber-950/60 shrink-0">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-lg md:text-2xl font-black text-white font-heading tracking-wide truncate">
                    {language === 'es' ? 'LOGROS & MEDALLAS' : 'ACHIEVEMENTS & MEDALS'}
                  </h2>
                  <span className="text-[9px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-400/40 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                    {stats.unlockedCount}/{stats.total} ({stats.percentage}%)
                  </span>
                </div>
                <p className="hidden md:block text-xs text-slate-400 mt-0.5 truncate font-normal">
                  {language === 'es'
                    ? 'Supera hazañas legendarias a través de las 8 zonas para ganar medallas y puntos'
                    : 'Overcome legendary feats across all zones to earn medals and points'}
                </p>
              </div>
            </div>

            {/* Right: Medals tally & Close Button */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              {/* Compact Medals Row (Optimized for Mobile) */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-mono font-bold">
                <span className="flex items-center gap-0.5 text-cyan-300" title="Platino">
                  <Crown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                  <span>{stats.platinum}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-0.5 text-amber-300" title="Oro">
                  <Medal className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  <span>{stats.gold}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-0.5 text-slate-300" title="Plata">
                  <Award className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-300" />
                  <span>{stats.silver}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-0.5 text-orange-300" title="Bronce">
                  <Trophy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-orange-400" />
                  <span>{stats.bronze}</span>
                </span>
              </div>

              {/* Total Gamer Points Badge (Desktop) */}
              <div className="hidden lg:flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{stats.earnedPoints} <span className="text-slate-500 font-semibold">/ {stats.totalPoints} PTS</span></span>
              </div>

              {/* Close Button: Large 44px touch target on mobile */}
              <button
                id="close-achievements-btn"
                onClick={() => {
                  sound.playSfx('menuSelect');
                  onClose();
                }}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
                title={language === 'es' ? 'Cerrar' : 'Close'}
              >
                <X className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Integrated Slim Progress Bar */}
          <div className="w-full bg-slate-800/90 h-1 sm:h-2 rounded-full overflow-hidden border border-slate-700/80 mt-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        {/* 2. Navigation & Filters Bar: Compact and horizontally scrollable for mobile */}
        <div className="px-3 sm:px-6 md:px-8 py-2 sm:py-3 bg-slate-950/60 border-b border-slate-800/70 flex flex-col gap-2 shrink-0 relative z-10">
          {/* Row 1: Category Chips (Smooth Horizontal Scroll on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => {
              const countInfo = categoryCounts[c.id];
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    sound.playSfx('menuSelect');
                    setSelectedCategory(c.id);
                  }}
                  className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-300 text-slate-950 shadow-md shadow-amber-950/50 font-black'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="sm:hidden">{language === 'es' ? c.shortEs : c.shortEn}</span>
                  <span className="hidden sm:inline">{language === 'es' ? c.labelEs : c.labelEn}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-slate-950/25 text-slate-900' : 'bg-slate-900/90 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {countInfo?.unlocked || 0}/{countInfo?.total || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Status Pills, Tier Dropdown & Search Toggle */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Status Pills */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] sm:text-xs">
                <button
                  onClick={() => {
                    sound.playSfx('menuSelect');
                    setStatusFilter('all');
                  }}
                  className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-slate-700 text-white font-bold shadow-sm'
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
                  className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    statusFilter === 'unlocked'
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
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
                  className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    statusFilter === 'locked'
                      ? 'bg-slate-800 text-amber-300 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'es' ? 'Pendientes' : 'Locked'}
                </button>
              </div>

              {/* Tier Filter Dropdown */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                <Filter className="w-3 h-3 text-slate-400 shrink-0" />
                <select
                  value={tierFilter}
                  onChange={(e) => {
                    sound.playSfx('menuSelect');
                    setTierFilter(e.target.value as any);
                  }}
                  className="bg-transparent text-slate-200 text-[11px] sm:text-xs outline-none cursor-pointer font-medium"
                >
                  <option value="all" className="bg-slate-900 text-white">{language === 'es' ? 'Medallas: Todas' : 'Tier: All'}</option>
                  <option value="platinum" className="bg-slate-900 text-cyan-300">{language === 'es' ? 'Platino' : 'Platinum'}</option>
                  <option value="gold" className="bg-slate-900 text-amber-300">{language === 'es' ? 'Oro' : 'Gold'}</option>
                  <option value="silver" className="bg-slate-900 text-slate-300">{language === 'es' ? 'Plata' : 'Silver'}</option>
                  <option value="bronze" className="bg-slate-900 text-orange-300">{language === 'es' ? 'Bronce' : 'Bronze'}</option>
                </select>
              </div>
            </div>

            {/* Mobile Search Icon Toggle & Desktop Search Input */}
            <div className="flex items-center gap-1.5 flex-1 max-w-xs justify-end">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'es' ? 'Buscar logro...' : 'Search feat...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-7 py-1 text-[11px] sm:text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Achievements List Area: Mobile-responsive scroll container with smooth momentum touch */}
        <div className="flex-1 p-2 sm:p-5 md:p-6 overflow-y-auto overscroll-contain min-h-0 relative z-10 pb-24 sm:pb-8 touch-pan-y">
          {filteredAchievements.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mb-2.5" />
              <h3 className="text-sm sm:text-base font-bold text-slate-200">
                {language === 'es' ? 'No se encontraron logros' : 'No achievements found'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
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
                className="mt-4 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'es' ? 'Restablecer Filtros' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
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
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-2.5 ${
                      isUnlocked
                        ? `bg-slate-950/90 ${tierStyle.cardBorder}`
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-95'
                    }`}
                  >
                    {/* Top Section: Icon + Details */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Compact Icon Container (40x40 on mobile, 48x48 on tablet/desktop) */}
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center shrink-0 transition-transform ${
                          isUnlocked
                            ? `${tierStyle.iconBg}`
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        {isUnlocked ? (
                          getIcon(achievement.iconName, `w-5 h-5 sm:w-6 sm:h-6 ${tierStyle.accentText}`)
                        ) : (
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        {/* Upper line: Tier badge and Points pill */}
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${tierStyle.bg}`}
                          >
                            {tierStyle.label}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
                            +{achievement.points} PTS
                          </span>
                        </div>

                        {/* Title: Clearly visible */}
                        <h4
                          className={`text-xs sm:text-sm font-bold tracking-tight leading-tight ${
                            isUnlocked ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {title}
                        </h4>

                        {/* Full description */}
                        <p className="text-[11px] sm:text-xs text-slate-400 leading-snug mt-1">
                          {desc}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Section: Progress Bar or Completion Status */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px] sm:text-xs">
                      {achievement.target && achievement.target > 1 ? (
                        <div className="flex items-center gap-2 flex-1 max-w-[80%]">
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isUnlocked
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.round((currentProgress / target) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-300 shrink-0">
                            {Math.min(target, currentProgress)}/{target}
                          </span>
                        </div>
                      ) : (
                        <div>
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {language === 'es' ? 'Completado' : 'Done'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-800">
                              <Lock className="w-2.5 h-2.5 text-slate-500" />
                              {language === 'es' ? 'Pendiente' : 'Locked'}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-black">✓ 100%</span>
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

        {/* 4. Compact Footer Bar with Thumb-Friendly Button for Mobile */}
        <div className="px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 border-t border-slate-800/90 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0 relative z-10">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 truncate">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              {language === 'es'
                ? 'Los logros se guardan automáticamente en tu perfil.'
                : 'Achievements are saved automatically to your profile.'}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playSfx('menuSelect');
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-950/50 active:scale-95 transition-all cursor-pointer text-center tracking-wide"
          >
            {language === 'es' ? 'VOLVER AL JUEGO' : 'BACK TO GAME'}
          </button>
        </div>
      </div>
    </div>
  );
};
