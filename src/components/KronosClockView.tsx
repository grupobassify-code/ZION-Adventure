import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Zap,
  Flame,
  Sun,
  Shield,
  Check,
  CheckCircle2,
  Lock,
  ChevronRight,
  Shirt,
  RotateCcw,
  Trophy,
  Play,
  Volume2,
  VolumeX,
  AlertCircle,
  HelpCircle,
  Gem,
  Snowflake,
  Gauge,
  Compass,
  Moon,
} from 'lucide-react';
import {
  SaveSlot,
} from '../types';
import {
  KRONOS_PIECES,
  KronosPieceInfo,
  hasKronosPiece,
  isKronosPiecePlaced,
  placeKronosPiece,
  placeAllAvailableKronosPieces,
  isKronosClockCompleted,
  isKronosLockerUnlocked,
  unlockAllKronosBossesForDemo,
} from '../game/saveManager';
import { sound } from '../audio/soundEngine';

interface KronosClockViewProps {
  slot: SaveSlot | null;
  onBack: () => void;
  onOpenLocker: () => void;
  onRefreshSlot: () => void;
}

export const KronosClockView: React.FC<KronosClockViewProps> = ({
  slot,
  onBack,
  onOpenLocker,
  onRefreshSlot,
}) => {
  const [placedPieces, setPlacedPieces] = useState<string[]>(slot?.kronosPiecesPlaced || []);
  const [isCinematicRunning, setIsCinematicRunning] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [selectedPieceInfo, setSelectedPieceInfo] = useState<KronosPieceInfo | null>(null);
  const [clockRotationAngle, setClockRotationAngle] = useState<number>(0);

  const isCompleted = isKronosClockCompleted(slot) || placedPieces.length >= KRONOS_PIECES.length;
  const isLockerUnlocked = isKronosLockerUnlocked(slot) || isCompleted;

  // Clock hands rotation loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animateClock = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // If clock is repaired or cinematic is running, hands spin!
      if (isCinematicRunning) {
        setClockRotationAngle((prev) => (prev + delta * 360) % 360);
      } else if (isCompleted) {
        setClockRotationAngle((prev) => (prev + delta * 30) % 360);
      }

      animationFrameId = requestAnimationFrame(animateClock);
    };

    animationFrameId = requestAnimationFrame(animateClock);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isCompleted, isCinematicRunning]);

  // Check if all pieces were placed right now to trigger the reassembly cinematic
  const triggerReassemblyCinematic = () => {
    setIsCinematicRunning(true);
    sound.playSfx('powerup');

    // Sequence of visual & audio cues
    setTimeout(() => {
      sound.playSfx('secret');
    }, 1200);

    setTimeout(() => {
      sound.playSfx('win');
    }, 2500);

    setTimeout(() => {
      setIsCinematicRunning(false);
      setShowCompletionModal(true);
    }, 3800);
  };

  const handlePlacePiece = (pieceId: string) => {
    if (!slot) return;
    sound.playSfx('powerup');
    const updatedSlot = placeKronosPiece(slot.id, pieceId);
    if (updatedSlot && updatedSlot.kronosPiecesPlaced) {
      setPlacedPieces([...updatedSlot.kronosPiecesPlaced]);
      onRefreshSlot();

      // If all 12 pieces are placed, start the epic cinematic!
      if (updatedSlot.kronosPiecesPlaced.length >= KRONOS_PIECES.length) {
        triggerReassemblyCinematic();
      }
    }
  };

  const handlePlaceAll = () => {
    if (!slot) return;
    const { slot: updatedSlot, newlyPlaced } = placeAllAvailableKronosPieces(slot.id);
    if (updatedSlot && newlyPlaced.length > 0) {
      sound.playSfx('win');
      setPlacedPieces([...(updatedSlot.kronosPiecesPlaced || [])]);
      onRefreshSlot();

      if (updatedSlot.kronosPiecesPlaced && updatedSlot.kronosPiecesPlaced.length >= KRONOS_PIECES.length) {
        triggerReassemblyCinematic();
      }
    }
  };

  const handleUnlockAllDemo = () => {
    if (!slot) return;
    const updatedSlot = unlockAllKronosBossesForDemo(slot.id);
    if (updatedSlot) {
      sound.playSfx('secret');
      onRefreshSlot();
      const { slot: finalSlot } = placeAllAvailableKronosPieces(slot.id);
      if (finalSlot) {
        setPlacedPieces([...(finalSlot.kronosPiecesPlaced || [])]);
        onRefreshSlot();
        triggerReassemblyCinematic();
      }
    }
  };

  // Helper to render piece icon
  const renderPieceIcon = (pieceId: string, className: string = 'w-5 h-5') => {
    switch (pieceId) {
      case 'neon':
        return <Sun className={className} />;
      case 'sakura':
        return <Sparkles className={className} />;
      case 'lavacliff':
        return <Flame className={className} />;
      case 'desert':
        return <Clock className={className} />;
      case 'krono':
        return <Zap className={className} />;
      case 'jungle':
        return <Gem className={className} />;
      case 'blizzard':
        return <Snowflake className={className} />;
      case 'steampunk':
        return <Gauge className={className} />;
      case 'castlesmash':
        return <Shield className={className} />;
      case 'piratestreasure':
        return <Compass className={className} />;
      case 'jurasicdraft':
        return <Flame className={className} />;
      case 'themoon':
        return <Moon className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Calculate owned and unplaced count
  const ownedPieces = KRONOS_PIECES.filter((p) => hasKronosPiece(slot, p.id));
  const unplacedAvailable = ownedPieces.filter((p) => !placedPieces.includes(p.id));

  return (
    <div className="relative w-full min-h-screen bg-[#050814] text-white flex flex-col select-none overflow-x-hidden font-sans">
      {/* Dynamic Background: Chronos Space Nebula & Golden Circuit Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,#090d24_50%,#030511_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf80a_1px,transparent_1px),linear-gradient(to_bottom,#38bdf80a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Cinematic Flash Effect */}
      {isCinematicRunning && (
        <div className="fixed inset-0 bg-gradient-to-r from-amber-500/20 via-cyan-400/30 to-purple-500/20 animate-pulse pointer-events-none z-50 mix-blend-screen" />
      )}

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            id="kronos-clock-back-btn"
            onClick={() => {
              sound.playSfx('menuSelect');
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 text-slate-200 text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-md min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Volver a Zonas</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className={`p-1.5 sm:p-2 rounded-xl border ${
              isCompleted
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-lg shadow-amber-500/20 animate-pulse'
                : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
            }`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  NEXO DIMENSIONAL KRONOS
                </span>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] font-bold border ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isCompleted ? '✓ PORTAL RESTAURADO (12/12)' : `FRACTURADO [${placedPieces.length}/12 PIEZAS]`}
                </span>
              </div>
              <h1 className="text-base sm:text-2xl font-black text-white font-heading tracking-wide">
                EL PORTAL & RELOJ DE KRONOS
              </h1>
            </div>
          </div>
        </div>

        {/* Action Header Links */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {!isCompleted && (
            <button
              id="unlock-all-demo-clock-btn"
              onClick={handleUnlockAllDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] sm:text-xs font-mono font-bold transition-all shadow-md active:scale-95"
              title="Probar las 12 piezas y cinemática de apertura"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Probar 12/12 (Demo)</span>
            </button>
          )}

          {isLockerUnlocked ? (
            <button
              id="open-locker-from-clock-btn"
              onClick={() => {
                sound.playSfx('menuSelect');
                onOpenLocker();
              }}
              className="flex items-center gap-2 px-3.5 py-2 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm font-heading shadow-lg shadow-orange-500/20 active:scale-95 transition-all min-h-[40px]"
            >
              <Shirt className="w-4 h-4 fill-slate-950" />
              <span>CASILLERO DE SKINS</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Casillero Bloqueado ({placedPieces.length}/12 piezas)</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Clock Sanctuary Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Clock Mechanism Chamber (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-b from-slate-900/95 via-[#0b1026]/90 to-slate-950/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden min-h-[480px]">
          {/* Ambient Chronos Vortex Glow */}
          <div
            className={`absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
              isCinematicRunning
                ? 'bg-amber-400/30 scale-125'
                : isCompleted
                ? 'bg-cyan-500/20'
                : 'bg-rose-950/20'
            }`}
          />

          {/* Clock Status Tag */}
          <div className="w-full flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-300">
                {isCompleted
                  ? '⚡ PORTAL DIMENSIONAL: 12 PIEZAS SINCRONIZADAS'
                  : '⚠️ PORTAL FRACTURADO — 12 PIEZAS REQUERIDAS'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isCompleted && (
                <button
                  onClick={triggerReassemblyCinematic}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Repetir Cinemática</span>
                </button>
              )}
            </div>
          </div>

          {/* THE BIG CLOCK SVG VISUALIZATION (12 PIECES) */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Pulsing Energy Shockwave when cinematic is running */}
            {isCinematicRunning && (
              <div className="absolute w-[360px] h-[360px] rounded-full border-4 border-amber-400/80 animate-ping pointer-events-none" />
            )}

            <svg
              className="w-72 h-72 sm:w-96 sm:h-96 filter drop-shadow-[0_0_35px_rgba(6,182,212,0.3)] transition-transform duration-700"
              viewBox="0 0 400 400"
            >
              <defs>
                {/* Radiant Radial Gradient for Center Dial */}
                <radialGradient id="clockDialGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={isCompleted ? '#1e293b' : '#0f172a'} />
                  <stop offset="70%" stopColor="#090d1f" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>

                {/* Core Singularity Gradient */}
                <radialGradient id="coreVortex" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#c084fc" />
                  <stop offset="80%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>

                {/* Neon Cyan Rim Gradient */}
                <linearGradient id="neonRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>

              {/* Outer Gear Teeth Ring (24 Teeth) */}
              <g
                className="transition-transform"
                style={{
                  transformOrigin: '200px 200px',
                  transform: isCompleted ? `rotate(-${clockRotationAngle * 0.4}deg)` : 'none',
                }}
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  return (
                    <rect
                      key={i}
                      x="193"
                      y="10"
                      width="14"
                      height="18"
                      rx="3"
                      fill={isCompleted ? '#f59e0b' : '#475569'}
                      opacity={isCompleted ? '0.85' : '0.4'}
                      transform={`rotate(${angle} 200 200)`}
                    />
                  );
                })}
              </g>

              {/* Main Outer Bezel */}
              <circle
                cx="200"
                cy="200"
                r="176"
                fill="none"
                stroke={isCompleted ? 'url(#neonRimGrad)' : '#334155'}
                strokeWidth="10"
                strokeDasharray={isCompleted ? 'none' : '15 4 8 4'}
              />

              {/* Inner Dial Face */}
              <circle
                cx="200"
                cy="200"
                r="168"
                fill="url(#clockDialGrad)"
                stroke={isCompleted ? '#0284c7' : '#1e293b'}
                strokeWidth="3"
              />

              {/* 12 Roman Numerals on Outer Ring */}
              {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map(
                (num, i) => {
                  const angle = ((i * 30 - 90) * Math.PI) / 180;
                  const x = 200 + 154 * Math.cos(angle);
                  const y = 200 + 154 * Math.sin(angle) + 4;
                  const piece = KRONOS_PIECES[i];
                  const isPlaced = piece && placedPieces.includes(piece.id);

                  return (
                    <text
                      key={num}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fill={isPlaced ? '#38bdf8' : '#64748b'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      opacity={isPlaced ? 0.95 : 0.45}
                    >
                      {num}
                    </text>
                  );
                }
              )}

              {/* 12 ANCESTRAL PIECES & SECTORS */}
              {KRONOS_PIECES.map((piece, i) => {
                const isOwned = hasKronosPiece(slot, piece.id);
                const isPlaced = placedPieces.includes(piece.id);
                const isReadyToPlace = isOwned && !isPlaced;
                const isSelected = selectedPieceInfo?.id === piece.id;

                // 12 angles around clock (i=0 is top 12 o'clock = -90 deg)
                const angleDeg = i * 30 - 90;
                const angleRad = (angleDeg * Math.PI) / 180;
                const radius = 122;
                const px = 200 + radius * Math.cos(angleRad);
                const py = 200 + radius * Math.sin(angleRad);

                // Sector wedge
                const startAngle = ((i * 30 - 14 - 90) * Math.PI) / 180;
                const endAngle = ((i * 30 + 14 - 90) * Math.PI) / 180;
                const wedgeRadius = 144;
                const innerWedgeRadius = 56;
                const x1 = 200 + wedgeRadius * Math.cos(startAngle);
                const y1 = 200 + wedgeRadius * Math.sin(startAngle);
                const x2 = 200 + wedgeRadius * Math.cos(endAngle);
                const y2 = 200 + wedgeRadius * Math.sin(endAngle);
                const ix1 = 200 + innerWedgeRadius * Math.cos(startAngle);
                const iy1 = 200 + innerWedgeRadius * Math.sin(startAngle);
                const ix2 = 200 + innerWedgeRadius * Math.cos(endAngle);
                const iy2 = 200 + innerWedgeRadius * Math.sin(endAngle);

                const sectorPath = `M ${ix1} ${iy1} L ${x1} ${y1} A ${wedgeRadius} ${wedgeRadius} 0 0 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerWedgeRadius} ${innerWedgeRadius} 0 0 0 ${ix1} ${iy1} Z`;

                return (
                  <g
                    key={piece.id}
                    id={`portal-svg-piece-${piece.id}`}
                    className="cursor-pointer transition-transform hover:scale-105"
                    opacity={isPlaced ? 1 : isOwned ? 0.95 : piece.isComingSoon ? 0.45 : 0.35}
                    onClick={() => {
                      if (isReadyToPlace) {
                        handlePlacePiece(piece.id);
                      } else {
                        sound.playSfx('menuSelect');
                        setSelectedPieceInfo(piece);
                      }
                    }}
                  >
                    {/* Sector Glow */}
                    <path
                      d={sectorPath}
                      fill={isPlaced ? `${piece.color}25` : isOwned ? `${piece.color}15` : 'rgba(30, 41, 59, 0.08)'}
                      stroke={isPlaced ? `${piece.color}55` : isSelected ? piece.color : 'rgba(71, 85, 105, 0.2)'}
                      strokeWidth={isSelected ? 1.5 : 0.5}
                    />

                    {/* Energy Conduit to Center */}
                    {isPlaced && (
                      <line
                        x1={px}
                        y1={py}
                        x2={200}
                        y2={200}
                        stroke={piece.color}
                        strokeWidth="2.5"
                        opacity="0.85"
                        strokeDasharray={isCompleted ? 'none' : '4 2'}
                      />
                    )}

                    {/* Ready to place spinning guide ring */}
                    {isReadyToPlace && (
                      <circle
                        cx={px}
                        cy={py}
                        r="18"
                        fill="none"
                        stroke="#facc15"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-spin"
                        style={{ transformOrigin: `${px}px ${py}px` }}
                      />
                    )}

                    {/* Piece Node Circle */}
                    <circle
                      cx={px}
                      cy={py}
                      r={isSelected ? 16 : 13.5}
                      fill={isPlaced ? piece.color : isOwned ? `${piece.color}88` : '#0f172a'}
                      stroke={isReadyToPlace ? '#facc15' : isSelected ? '#ffffff' : isPlaced ? piece.accentColor : '#475569'}
                      strokeWidth={isReadyToPlace ? 3 : isSelected ? 2.5 : isPlaced ? 2 : 1.5}
                      className={isReadyToPlace ? 'animate-pulse' : ''}
                      filter={isPlaced ? `drop-shadow(0 0 6px ${piece.color})` : undefined}
                    />

                    {/* Node Index Marker */}
                    <text
                      x={px}
                      y={py + 3.5}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      fill={isPlaced ? '#050814' : isReadyToPlace ? '#facc15' : '#94a3b8'}
                    >
                      {i + 1}
                    </text>
                  </g>
                );
              })}

              {/* CENTER QUANTUM CORE (Singularity of the Portal) */}
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  sound.playSfx('menuSelect');
                  const p = KRONOS_PIECES.find((item) => item.id === 'krono');
                  if (p) setSelectedPieceInfo(p);
                }}
              >
                <circle
                  cx="200"
                  cy="200"
                  r={isCompleted ? 48 : 42}
                  fill="url(#coreVortex)"
                  stroke={isCompleted ? '#38bdf8' : '#a855f7'}
                  strokeWidth={isCompleted ? 4 : 2.5}
                  className={isCompleted ? 'animate-pulse' : ''}
                  filter={isCompleted ? 'drop-shadow(0 0 15px rgba(56,189,248,0.9))' : undefined}
                />
                <Zap
                  x="188"
                  y="188"
                  width="24"
                  height="24"
                  color={isCompleted ? '#38bdf8' : '#e2e8f0'}
                  className={isCompleted ? 'animate-bounce' : ''}
                />
              </g>

              {/* FRACTURE CRACKS OVERLAY (Disappears when all 12 pieces are placed) */}
              {!isCompleted && (
                <g stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
                  <path d="M 200 200 L 170 140 L 140 120 L 120 70" />
                  <path d="M 200 200 L 230 250 L 280 270 L 320 330" />
                  <path d="M 200 200 L 240 160 L 290 150" />
                  <path d="M 200 200 L 160 260 L 110 280" />
                  <path d="M 200 200 L 130 180 L 80 180" />
                </g>
              )}

              {/* CLOCK HANDS */}
              {isCompleted ? (
                /* Restored Spinning Hands */
                <g
                  className="transition-transform"
                  style={{
                    transformOrigin: '200px 200px',
                    transform: `rotate(${clockRotationAngle}deg)`,
                  }}
                >
                  {/* Hour Hand */}
                  <line
                    x1="200"
                    y1="200"
                    x2="200"
                    y2="105"
                    stroke="#38bdf8"
                    strokeWidth="7"
                    strokeLinecap="round"
                    filter="drop-shadow(0 0 8px rgba(56,189,248,0.8))"
                  />
                  {/* Minute Hand */}
                  <line
                    x1="200"
                    y1="200"
                    x2="200"
                    y2="68"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{
                      transformOrigin: '200px 200px',
                      transform: `rotate(${clockRotationAngle * 1.8}deg)`,
                    }}
                    filter="drop-shadow(0 0 6px rgba(245,158,11,0.8))"
                  />
                  {/* Second Hand */}
                  <line
                    x1="200"
                    y1="200"
                    x2="200"
                    y2="52"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                      transformOrigin: '200px 200px',
                      transform: `rotate(${clockRotationAngle * 5}deg)`,
                    }}
                    filter="drop-shadow(0 0 5px rgba(16,185,129,0.9))"
                  />
                  {/* Pivot Pin */}
                  <circle cx="200" cy="200" r="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
                </g>
              ) : (
                /* Broken Broken Drooping Hands */
                <g>
                  <line
                    x1="200"
                    y1="200"
                    x2="245"
                    y2="260"
                    stroke="#64748b"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <line
                    x1="200"
                    y1="200"
                    x2="160"
                    y2="240"
                    stroke="#475569"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="200" cy="200" r="7" fill="#64748b" stroke="#334155" strokeWidth="2" />
                </g>
              )}
            </svg>
          </div>

          {/* Assembly Status Text */}
          <div className="text-center mt-2 z-10 w-full">
            <h3 className="text-base sm:text-lg font-black text-white font-heading">
              {isCompleted
                ? '¡PORTAL DIMENSIONAL ACTIVADO AL 100%!'
                : 'PORTAL FRACTURADO — REQUIERE 12 PIEZAS SAGRADAS'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl mx-auto leading-relaxed">
              {isCompleted
                ? 'Todas las 12 piezas sagradas han sido ensambladas en el portal de Kronos. El flujo dimensional está completamente estabilizado y el Casillero de Skins está abierto.'
                : 'Se necesitan las 12 piezas ancestrales (1 por cada una de las 12 zonas del juego) para reactivar el portal y desbloquear el Casillero de Skins. Aunque los jefes de las zonas 9 a 12 aún están en desarrollo, ¡aquí puedes ver las 12 reliquias requeridas para la apertura del Casillero!'}
            </p>

            {/* Explicit Locker Unlock Requirement Callout */}
            <div className={`mt-3 p-3 rounded-2xl border flex items-center justify-between gap-3 text-left max-w-lg mx-auto ${
              isLockerUnlocked
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl shrink-0 ${
                  isLockerUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black font-heading text-white">
                    {isLockerUnlocked
                      ? '🔓 CASILLERO DE PERSONAJES DESBLOQUEADO'
                      : '🔒 CASILLERO BLOQUEADO — REQUIERE 12 PIEZAS'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {isLockerUnlocked
                      ? '¡Has restaurado las 12 piezas! Accede al vestidor de atuendos y personaliza a Zion.'
                      : `Progreso: ${placedPieces.length}/12 piezas colocadas. Al reunir las 12 se desbloqueará el Casillero.`}
                  </p>
                </div>
              </div>

              {isLockerUnlocked && (
                <button
                  onClick={() => {
                    sound.playSfx('menuSelect');
                    onOpenLocker();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-heading shrink-0 shadow-md active:scale-95 transition-all"
                >
                  ABRIR
                </button>
              )}
            </div>

            {/* Quick action: Place all available pieces */}
            {unplacedAvailable.length > 0 && (
              <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  id="place-all-kronos-pieces-btn"
                  onClick={handlePlaceAll}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm font-heading flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition-all min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>COLOCAR TODAS LAS PIEZAS DISPONIBLES ({unplacedAvailable.length})</span>
                </button>
              </div>
            )}

            {/* Selected Piece Interactive Card on Mobile/Desktop */}
            {selectedPieceInfo && (
              <div className="w-full mt-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border-2 border-cyan-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div
                    className="p-2.5 rounded-xl border shrink-0 flex items-center justify-center"
                    style={{
                      backgroundColor: `${selectedPieceInfo.color}25`,
                      borderColor: selectedPieceInfo.color,
                      color: selectedPieceInfo.color,
                    }}
                  >
                    {renderPieceIcon(selectedPieceInfo.id)}
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase" style={{ color: selectedPieceInfo.color }}>
                      {selectedPieceInfo.zoneName} · {selectedPieceInfo.bossName}
                    </div>
                    <h4 className="text-sm font-black text-white">{selectedPieceInfo.name}</h4>
                    <p className="text-[11px] text-slate-300 italic">{selectedPieceInfo.lore}</p>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  {placedPieces.includes(selectedPieceInfo.id) ? (
                    <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" /> ENSAMBLADA EN EL PORTAL
                    </span>
                  ) : hasKronosPiece(slot, selectedPieceInfo.id) ? (
                    <button
                      onClick={() => handlePlacePiece(selectedPieceInfo.id)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs font-heading flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 active:scale-95 transition-all min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>ENCAJAR EN EL PORTAL</span>
                    </button>
                  ) : selectedPieceInfo.isComingSoon ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-lg border border-purple-500/40">
                      <Lock className="w-3.5 h-3.5 text-purple-400" /> Próximamente ({selectedPieceInfo.bossName})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Lock className="w-3.5 h-3.5 text-slate-500" /> Derrota a {selectedPieceInfo.bossName}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: The 12 Pieces Workbench / Inventory (Cols 8-12) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white font-heading tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>PIEZAS ANCESTRALES DEL PORTAL</span>
            </h3>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              {placedPieces.length} / {KRONOS_PIECES.length} Ensambladas
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[720px] overflow-y-auto pr-1">
            {KRONOS_PIECES.map((piece, index) => {
              const isOwned = hasKronosPiece(slot, piece.id);
              const isPlaced = placedPieces.includes(piece.id);

              return (
                <div
                  key={piece.id}
                  id={`kronos-piece-card-${piece.id}`}
                  onClick={() => setSelectedPieceInfo(piece)}
                  className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none overflow-hidden ${
                    isPlaced
                      ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-slate-950'
                      : isOwned
                      ? 'border-amber-500 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:border-amber-400'
                      : piece.isComingSoon
                      ? 'border-purple-800/40 bg-purple-950/20 opacity-75 hover:opacity-95'
                      : 'border-slate-800/80 bg-slate-950/50 opacity-65 hover:opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-3">
                      {/* Piece Icon Badge */}
                      <div
                        className="p-2.5 rounded-xl border shrink-0 flex items-center justify-center"
                        style={{
                          backgroundColor: isPlaced
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isOwned
                            ? `${piece.color}25`
                            : 'rgba(51, 65, 85, 0.3)',
                          borderColor: isPlaced
                            ? '#10b981'
                            : isOwned
                            ? piece.color
                            : '#475569',
                          color: isPlaced ? '#10b981' : isOwned ? piece.color : '#94a3b8',
                        }}
                      >
                        {renderPieceIcon(piece.id)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase"
                            style={{
                              backgroundColor: `${piece.color}25`,
                              color: piece.color,
                            }}
                          >
                            PIEZA {index + 1}
                          </span>
                          {piece.isComingSoon && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              Próximamente
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-white">
                            {piece.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {piece.subtitle}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Jefe: {piece.bossName} ({piece.zoneName})</span>
                        </p>
                      </div>
                    </div>

                    {/* Status & Placement Button */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      {isPlaced ? (
                        <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ENSAMBLADA
                        </span>
                      ) : isOwned ? (
                        <button
                          id={`place-piece-btn-${piece.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlacePiece(piece.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs font-heading flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                          <span>ENCAJAR</span>
                        </button>
                      ) : piece.isComingSoon ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-1 rounded border border-purple-800/60">
                          <Lock className="w-3 h-3 text-purple-400" /> EN DESARROLLO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                          <Lock className="w-3 h-3" /> BLOQUEADO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lore line */}
                  <p className="text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/80 italic">
                    "{piece.lore}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* EPIC COMPLETION MODAL */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-slate-900 via-[#0d1532] to-slate-950 p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.4)] text-center animate-in zoom-in-95 duration-300">
            {/* Pulsing Trophy Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
              <Trophy className="w-8 h-8 fill-slate-950" />
            </div>

            <span className="text-xs font-mono font-black tracking-widest text-amber-400 uppercase">
              RESTAURACIÓN DEL CONTINUO TEMPORAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
              ¡FELICIDADES, PORTAL RESTAURADO!
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
              El Gran Portal de Kronos ha vuelto a girar. Con las 12 piezas sagradas restauradas, el nexo interdimensional está completamente activo y el flujo del tiempo vuelve a estar en armonía.
            </p>

            {/* Reward Box */}
            <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Shirt className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300 font-heading">
                  ¡HAS DESBLOQUEADO EL CASILLERO DE PERSONAJES!
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Accede al casillero de skins estilo Fortnite. Zion está listo para equipar sus atuendos especiales y legendarios.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                id="modal-enter-locker-btn"
                onClick={() => {
                  sound.playSfx('menuSelect');
                  setShowCompletionModal(false);
                  onOpenLocker();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm font-heading shadow-xl shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Shirt className="w-4 h-4 fill-slate-950" />
                <span>ENTRAR AL CASILLERO AHORA</span>
              </button>

              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                Contemplar el Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
