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
  Terminal,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import {
  ACHIEVEMENTS,
  AchievementCategory,
  AchievementTier,
  loadUnlockedAchievements,
  getAchievementStats,
  unlockAchievement,
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

  const [unlockedMap, setUnlockedMap] = useState(() => loadUnlockedAchievements());
  const stats = getAchievementStats();

  // Secret Terminal Easter Egg Modal State
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalError, setTerminalError] = useState<string | null>(null);
  const [terminalSuccess, setTerminalSuccess] = useState(false);

  const handleTerminalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = terminalInput.trim();
    if (clean === 'Kr0n0s-M@ster' || clean.toLowerCase() === 'kr0n0s-m@ster') {
      unlockAchievement('mirando_donde_no_se_debe');
      sound.playSfx('special');
      sound.playSfx('crystal');
      setTerminalSuccess(true);
      setTerminalError(null);
      setUnlockedMap(loadUnlockedAchievements());
      setTimeout(() => {
        setShowTerminalModal(false);
        setTerminalSuccess(false);
        setTerminalInput('');
      }, 2400);
    } else {
      sound.playSfx('hit');
      setTerminalError(
        language === 'es'
          ? 'Contraseña rechazada. Pista: Revisa con mucha atención las anomalías al final de los créditos...'
          : 'Passcode rejected. Hint: Check the anomalies at the end of the credits very closely...'
      );
    }
  };

  const getIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className={className} />;
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
        <div className="px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 border-b border-slate-800/90 bg-slate-950/95 flex flex-col gap-2 shrink-0 relative z-10">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Title & Status */}
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400/25 to-yellow-600/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 shadow-md shadow-amber-950/60 shrink-0">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-lg md:text-2xl font-black text-white font-heading tracking-wide truncate">
                    {language === 'es' ? 'LOGROS & MEDALLAS' : 'ACHIEVEMENTS & MEDALS'}
                  </h2>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-400/40 px-2 py-0.5 rounded-full shrink-0">
                    {stats.unlockedCount}/{stats.total} ({stats.percentage}%)
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-slate-400 mt-0.5 truncate font-normal">
                  {language === 'es'
                    ? 'Supera hazañas legendarias a través de todas las zonas para ganar medallas y puntos'
                    : 'Overcome legendary feats across all zones to earn medals and points'}
                </p>
              </div>
            </div>

            {/* Right: Medals tally & Close Button */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Compact Medals Row (Optimized for Mobile) */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-slate-800 px-1.5 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold">
                <span className="flex items-center gap-0.5 text-cyan-300" title="Platino">
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                  <span>{stats.platinum}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-0.5 text-amber-300" title="Oro">
                  <Medal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  <span>{stats.gold}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-0.5 text-slate-300" title="Plata">
                  <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />
                  <span>{stats.silver}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-0.5 text-orange-300" title="Bronce">
                  <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />
                  <span>{stats.bronze}</span>
                </span>
              </div>

              {/* Total Gamer Points Badge (Desktop) */}
              <div className="hidden lg:flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{stats.earnedPoints} <span className="text-slate-500 font-semibold">/ {stats.totalPoints} PTS</span></span>
              </div>

              {/* Close Button: Large touch target (min 44px on mobile) */}
              <button
                id="close-achievements-btn"
                onClick={() => {
                  sound.playSfx('menuSelect');
                  onClose();
                }}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
                title={language === 'es' ? 'Cerrar' : 'Close'}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Integrated Slim Progress Bar */}
          <div className="w-full bg-slate-800/90 h-1.5 sm:h-2 rounded-full overflow-hidden border border-slate-700/80">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

        {/* 2. Navigation & Filters Bar: Compact and horizontally scrollable for mobile */}
        <div className="px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 bg-slate-950/70 border-b border-slate-800/70 flex flex-col gap-2 shrink-0 relative z-10">
          {/* Row 1: Category Chips (Smooth Horizontal Scroll on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
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
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Status Pills */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[11px] sm:text-xs">
                <button
                  onClick={() => {
                    sound.playSfx('menuSelect');
                    setStatusFilter('all');
                  }}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
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
                  className={`px-2 sm:px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
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
                  className={`px-2 sm:px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    statusFilter === 'locked'
                      ? 'bg-slate-800 text-amber-300 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'es' ? 'Pendientes' : 'Locked'}
                </button>
              </div>

              {/* Tier Filter Dropdown */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
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

            {/* Mobile Search Box */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[140px] max-w-xs justify-end">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'es' ? 'Buscar logro...' : 'Search feat...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-7 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
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
                const isSecretEasterEgg = achievement.id === 'mirando_donde_no_se_debe';

                const title = !isUnlocked && isSecretEasterEgg
                  ? '“???”'
                  : language === 'es' ? achievement.titleEs : achievement.titleEn;

                const desc = !isUnlocked && isSecretEasterEgg
                  ? (language === 'es'
                      ? '«Vaya vaya, ¿a quién tenemos aquí? Por favor, introduce la contraseña...» (Toca aquí para abrir la terminal secreta)'
                      : '«Well well, look who we have here. Please enter the passcode...» (Tap here to open secret terminal)')
                  : language === 'es' ? achievement.descriptionEs : achievement.descriptionEn;

                return (
                  <div
                    key={achievement.id}
                    onClick={() => {
                      if (isSecretEasterEgg && !isUnlocked) {
                        sound.playSfx('menuSelect');
                        setShowTerminalModal(true);
                      }
                    }}
                    className={`p-3 sm:p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                      isSecretEasterEgg && !isUnlocked
                        ? 'bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)] cursor-pointer active:scale-[0.99]'
                        : isUnlocked
                        ? `bg-slate-950/95 ${tierStyle.cardBorder}`
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-95'
                    }`}
                  >
                    {/* Top Section: Icon + Details */}
                    <div className="flex items-start gap-3 sm:gap-3.5">
                      {/* Compact Icon Container (44x44 on mobile, 48x48 on tablet/desktop) */}
                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center shrink-0 transition-transform ${
                          isSecretEasterEgg && !isUnlocked
                            ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-950/80 animate-pulse'
                            : isUnlocked
                            ? `${tierStyle.iconBg}`
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        {isSecretEasterEgg && !isUnlocked ? (
                          <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300 animate-pulse" />
                        ) : isUnlocked ? (
                          getIcon(achievement.iconName, `w-5 h-5 sm:w-6 sm:h-6 ${tierStyle.accentText}`)
                        ) : (
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                        )}
                      </div>

                      {/* Content details */}
                      <div className="flex-1 min-w-0">
                        {/* Upper line: Tier badge and Points pill */}
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              isSecretEasterEgg && !isUnlocked
                                ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/70 shadow-sm shadow-emerald-950/50'
                                : tierStyle.bg
                            }`}
                          >
                            {isSecretEasterEgg && !isUnlocked ? 'SECRETO' : tierStyle.label}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
                            +{achievement.points} PTS
                          </span>
                          {isSecretEasterEgg && !isUnlocked && (
                            <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 animate-pulse">
                              <KeyRound className="w-2.5 h-2.5" />
                              <span>TOCAR AQUÍ</span>
                            </span>
                          )}
                        </div>

                        {/* Title: Highly legible on all screens */}
                        <h4
                          className={`text-sm sm:text-base font-bold tracking-tight leading-snug ${
                            isSecretEasterEgg && !isUnlocked
                              ? 'text-emerald-200 font-mono tracking-wider'
                              : isUnlocked
                              ? 'text-white'
                              : 'text-slate-200'
                          }`}
                        >
                          {title}
                        </h4>

                        {/* Full description */}
                        <p
                          className={`text-xs sm:text-sm leading-relaxed mt-1 ${
                            isSecretEasterEgg && !isUnlocked ? 'text-emerald-300/90 font-mono' : 'text-slate-300/90'
                          }`}
                        >
                          {desc}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Section: Progress Bar or Completion Status */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      {achievement.target && achievement.target > 1 ? (
                        <div className="flex items-center gap-2 flex-1 max-w-[80%]">
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isUnlocked ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.round((currentProgress / target) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                            {currentProgress}/{target}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {language === 'es' ? 'Desbloqueado' : 'Unlocked'}
                            </span>
                          ) : isSecretEasterEgg ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/40">
                              <KeyRound className="w-3 h-3 text-emerald-400" />
                              {language === 'es' ? 'Requiere Clave' : 'Requires Passcode'}
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

        {/* SECRET TERMINAL MODAL FOR "MIRANDO DONDE NO SE DEBE" EASTER EGG */}
        {showTerminalModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTerminalModal(false);
            }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
          >
            <div className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-slate-950 border-2 border-emerald-500/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.35)] relative flex flex-col gap-3 sm:gap-4 text-left">
              {/* Scanline pattern */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16, 185, 129, 0.8) 3px, rgba(16, 185, 129, 0.8) 4px)',
                }}
              />

              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest">
                  <Terminal className="w-4 h-4 animate-pulse" />
                  <span>TERMINAL CLASIFICADA // KRONOS</span>
                </div>
                <button
                  onClick={() => setShowTerminalModal(false)}
                  className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all shrink-0 active:scale-95"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dialogue requested by the user */}
              <div className="z-10 bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-emerald-500/40">
                <p className="text-xs sm:text-sm font-mono text-emerald-300 font-bold leading-relaxed">
                  «Vaya vaya, ¿a quién tenemos aquí?... Por favor, introduce la contraseña:»
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  (Pista: Está encriptada como algo raro al final de los créditos...)
                </p>
              </div>

              {/* Success / Error Messages */}
              {terminalSuccess ? (
                <div className="z-10 p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-center space-y-2 animate-bounce">
                  <div className="text-emerald-300 font-mono font-black text-sm">
                    🔓 ¡ACCESO CONCEDIDO!
                  </div>
                  <div className="text-xs text-white font-bold">
                    Logro Desbloqueado: «Mirando donde no se debe» (+250 PTS)
                  </div>
                  <p className="text-[11px] text-emerald-400/90 font-mono leading-relaxed">
                    «¿Te gusta husmear donde no debes? Esto confirma que Zion Adventure oculta más misterios de los que creías...»
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTerminalSubmit} className="z-10 flex flex-col gap-3">
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={terminalInput}
                      onChange={(e) => {
                        setTerminalInput(e.target.value);
                        setTerminalError(null);
                      }}
                      placeholder="Introduce la contraseña..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/60 focus:border-emerald-400 text-emerald-200 placeholder:text-slate-600 font-mono text-base outline-none shadow-inner"
                    />
                  </div>

                  {terminalError && (
                    <div className="text-[11px] font-mono text-rose-400 bg-rose-950/60 p-2.5 rounded-lg border border-rose-500/40 leading-snug">
                      {terminalError}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowTerminalModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-all active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-black tracking-wider transition-all shadow-md shadow-emerald-950/50 active:scale-95"
                    >
                      VERIFICAR LLAVE
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
