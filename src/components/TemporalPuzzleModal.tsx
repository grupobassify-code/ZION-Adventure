import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Puzzle,
  Zap,
  Radio,
  Grid,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  Eye,
  X,
  Volume2,
  VolumeX,
  ArrowRight,
  Shield,
  Clock,
  Compass,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { MallaMission, ZoneId, TemporalPuzzleType } from '../types';
import { MALLA_ZONES } from '../game/mallaTemporalData';
import { useLanguage } from '../utils/i18n';

interface TemporalPuzzleModalProps {
  mission: MallaMission;
  zoneId: ZoneId;
  onSolve: () => void;
  onSkip?: () => void;
}

// 12 Themed Zone Relic Artwork definitions for the Jigsaw puzzle
interface ZoneRelicTheme {
  title: string;
  symbol: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgGradient: string;
  runePath: string; // SVG path
}

const ZONE_RELIC_CONFIGS: Record<ZoneId, ZoneRelicTheme> = {
  neon: {
    title: 'Núcleo del Guardián Neón',
    symbol: '🤖',
    primaryColor: '#06b6d4',
    secondaryColor: '#10b981',
    accentColor: '#38bdf8',
    bgGradient: 'from-cyan-950 via-slate-900 to-emerald-950',
    runePath: 'M50 15 L85 50 L50 85 L15 50 Z M50 30 L70 50 L50 70 L30 50 Z',
  },
  sakura: {
    title: 'Loto Espiritual del Dojo',
    symbol: '🌸',
    primaryColor: '#f472b6',
    secondaryColor: '#fb7185',
    accentColor: '#fbcfe8',
    bgGradient: 'from-pink-950 via-slate-900 to-rose-950',
    runePath: 'M50 15 Q65 35 85 50 Q65 65 50 85 Q35 65 15 50 Q35 35 50 15 Z',
  },
  lavacliff: {
    title: 'Corazón del Dragón Ignis',
    symbol: '🌋',
    primaryColor: '#f97316',
    secondaryColor: '#ef4444',
    accentColor: '#fde047',
    bgGradient: 'from-orange-950 via-red-950 to-slate-950',
    runePath: 'M50 10 L65 35 L90 40 L70 60 L75 88 L50 75 L25 88 L30 60 L10 40 L35 35 Z',
  },
  desert: {
    title: 'Escarabajo Dorado de Ra',
    symbol: '🏺',
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    accentColor: '#fef08a',
    bgGradient: 'from-amber-950 via-yellow-950 to-slate-950',
    runePath: 'M50 15 C75 15 85 40 85 60 C85 75 70 85 50 85 C30 85 15 75 15 60 C15 40 25 15 50 15 Z',
  },
  krono: {
    title: 'Microchip del Rascacielos Neón',
    symbol: '🏙️',
    primaryColor: '#06b6d4',
    secondaryColor: '#8b5cf6',
    accentColor: '#67e8f9',
    bgGradient: 'from-cyan-950 via-purple-950 to-slate-950',
    runePath: 'M20 20 H80 V80 H20 Z M35 35 H65 V65 H35 Z M50 20 V35 M50 65 V80 M20 50 H35 M65 50 H80',
  },
  jungle: {
    title: 'Totem de Jade de Kukulkán',
    symbol: '🌿',
    primaryColor: '#10b981',
    secondaryColor: '#eab308',
    accentColor: '#86efac',
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    runePath: 'M50 12 L80 40 L70 85 L30 85 L20 40 Z M50 30 L65 48 L58 72 L42 72 L35 48 Z',
  },
  blizzard: {
    title: 'Cristal Criogénico de Yukio',
    symbol: '❄️',
    primaryColor: '#38bdf8',
    secondaryColor: '#93c5fd',
    accentColor: '#e0f2fe',
    bgGradient: 'from-sky-950 via-blue-950 to-slate-950',
    runePath: 'M50 10 V90 M10 50 H90 M22 22 L78 78 M22 78 L78 22',
  },
  steampunk: {
    title: 'Gran Engranaje de Latón',
    symbol: '⚙️',
    primaryColor: '#d97706',
    secondaryColor: '#fbbf24',
    accentColor: '#fed7aa',
    bgGradient: 'from-amber-950 via-orange-950 to-slate-950',
    runePath: 'M50 20 A30 30 0 1 0 50 80 A30 30 0 1 0 50 20 M50 38 A12 12 0 1 1 50 62 A12 12 0 1 1 50 38',
  },
  castlesmash: {
    title: 'Corona Oscura del Nigromante',
    symbol: '🏰',
    primaryColor: '#64748b',
    secondaryColor: '#f59e0b',
    accentColor: '#cbd5e1',
    bgGradient: 'from-slate-900 via-purple-950 to-slate-950',
    runePath: 'M20 75 L20 35 L35 50 L50 25 L65 50 L80 35 L80 75 Z',
  },
  piratestreasure: {
    title: 'Moneda Maldita del Kraken',
    symbol: '🏴‍☠️',
    primaryColor: '#0284c7',
    secondaryColor: '#facc15',
    accentColor: '#38bdf8',
    bgGradient: 'from-blue-950 via-sky-950 to-slate-950',
    runePath: 'M50 15 A35 35 0 1 0 50 85 A35 35 0 1 0 50 15 M40 40 L60 60 M60 40 L40 60',
  },
  jurasicdraft: {
    title: 'Fósil de Ámbar Mesozoico',
    symbol: '🦖',
    primaryColor: '#15803d',
    secondaryColor: '#ea580c',
    accentColor: '#4ade80',
    bgGradient: 'from-green-950 via-amber-950 to-slate-950',
    runePath: 'M50 15 C70 15 85 30 85 55 C85 75 65 85 50 85 C30 85 15 70 15 45 C15 25 30 15 50 15 Z',
  },
  themoon: {
    title: 'Singularidad Cuántica Doomsday',
    symbol: '🚀',
    primaryColor: '#818cf8',
    secondaryColor: '#38bdf8',
    accentColor: '#c7d2fe',
    bgGradient: 'from-indigo-950 via-slate-950 to-blue-950',
    runePath: 'M50 15 A35 35 0 1 1 49.9 15 M50 35 A15 15 0 1 1 49.9 35 M20 50 H80 M50 20 V80',
  },
  travel: {
    title: 'Vórtice del Viaje Cuántico',
    symbol: '🌀',
    primaryColor: '#a855f7',
    secondaryColor: '#06b6d4',
    accentColor: '#e879f9',
    bgGradient: 'from-purple-950 via-slate-950 to-cyan-950',
    runePath: 'M50 20 A30 30 0 1 0 80 50 A30 30 0 1 0 50 20 M50 35 A15 15 0 1 1 65 50',
  },
};

// -------------------------------------------------------------
// CIRCUIT PUZZLE TYPES & DEFINITIONS
// -------------------------------------------------------------
type ConduitType = 'straight' | 'corner' | 'tee' | 'cross';

interface ConduitCell {
  id: number;
  type: ConduitType;
  rotation: number; // 0, 90, 180, 270
  targetRotation: number;
}

export const TemporalPuzzleModal: React.FC<TemporalPuzzleModalProps> = ({
  mission,
  zoneId,
  onSolve,
  onSkip,
}) => {
  const { language } = useLanguage();
  const zone = useMemo(() => MALLA_ZONES.find((z) => z.id === zoneId) || MALLA_ZONES[0], [zoneId]);
  const relic = useMemo(() => ZONE_RELIC_CONFIGS[zoneId] || ZONE_RELIC_CONFIGS.neon, [zoneId]);

  // Determine initial puzzle type based on missionIndex
  const initialType: TemporalPuzzleType = useMemo(() => {
    if (mission.missionIndex === 0) return 'jigsaw';
    if (mission.missionIndex === 1) return 'frequency';
    return 'circuit';
  }, [mission.missionIndex]);

  const [activeTab, setActiveTab] = useState<TemporalPuzzleType>(initialType);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // -------------------------------------------------------------
  // 1. JIGSAW (ROMPECABEZAS) STATE & LOGIC
  // 3x3 Tile Grid (9 pieces)
  // -------------------------------------------------------------
  const [jigsawTiles, setJigsawTiles] = useState<number[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);

  const initJigsaw = useCallback(() => {
    // 9 pieces: 0..8
    let array = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // Scramble guaranteed to not be solved
    let isDifferent = false;
    while (!isDifferent) {
      array = [...array].sort(() => Math.random() - 0.5);
      const correctCount = array.filter((val, idx) => val === idx).length;
      if (correctCount < 6) isDifferent = true;
    }
    setJigsawTiles(array);
    setSelectedTileIndex(null);
  }, []);

  const handleTileClick = (index: number) => {
    if (isSolved) return;
    sound.playSfx('menuSelect');

    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
    } else if (selectedTileIndex === index) {
      setSelectedTileIndex(null);
    } else {
      // Swap tiles
      const newTiles = [...jigsawTiles];
      const temp = newTiles[selectedTileIndex];
      newTiles[selectedTileIndex] = newTiles[index];
      newTiles[index] = temp;
      setJigsawTiles(newTiles);
      setSelectedTileIndex(null);

      sound.playSfx('dash');

      // Check win condition
      const allCorrect = newTiles.every((val, idx) => val === idx);
      if (allCorrect) {
        handlePuzzleSolved();
      }
    }
  };

  const handleJigsawHint = () => {
    if (isSolved) return;
    sound.playSfx('crystal');
    // Find first incorrectly placed tile and place it in its correct position
    const wrongIdx = jigsawTiles.findIndex((val, idx) => val !== idx);
    if (wrongIdx !== -1) {
      const correctVal = wrongIdx;
      const currentPosOfCorrectVal = jigsawTiles.indexOf(correctVal);
      if (currentPosOfCorrectVal !== -1) {
        const newTiles = [...jigsawTiles];
        newTiles[currentPosOfCorrectVal] = newTiles[wrongIdx];
        newTiles[wrongIdx] = correctVal;
        setJigsawTiles(newTiles);
        if (newTiles.every((v, i) => v === i)) {
          handlePuzzleSolved();
        }
      }
    }
  };

  // -------------------------------------------------------------
  // 2. FREQUENCY (SIMON SEQUENCE) STATE & LOGIC
  // -------------------------------------------------------------
  const [freqSequence, setFreqSequence] = useState<number[]>([]);
  const [freqPlayerStep, setFreqPlayerStep] = useState<number>(0);
  const [activeFreqFlash, setActiveFreqFlash] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);

  const initFrequency = useCallback(() => {
    // 4 step sequence of 4 buttons (0: Red/Ignis, 1: Cyan/Cronos, 2: Green/Gaia, 3: Purple/Void)
    const seq = [
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
    ];
    setFreqSequence(seq);
    setFreqPlayerStep(0);
    playDemoSequence(seq);
  }, []);

  const playDemoSequence = (seq: number[]) => {
    setIsPlayingDemo(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < seq.length) {
        const btn = seq[step];
        setActiveFreqFlash(btn);
        sound.playSfx('node');
        setTimeout(() => setActiveFreqFlash(null), 300);
        step++;
      } else {
        clearInterval(interval);
        setIsPlayingDemo(false);
      }
    }, 550);
  };

  const handleFreqButtonPress = (btnIndex: number) => {
    if (isPlayingDemo || isSolved) return;
    setActiveFreqFlash(btnIndex);
    setTimeout(() => setActiveFreqFlash(null), 250);

    sound.playSfx('node');

    if (btnIndex === freqSequence[freqPlayerStep]) {
      const nextStep = freqPlayerStep + 1;
      setFreqPlayerStep(nextStep);
      if (nextStep >= freqSequence.length) {
        handlePuzzleSolved();
      }
    } else {
      // Wrong button: feedback and replay
      sound.playSfx('hurt');
      setFreqPlayerStep(0);
      setTimeout(() => {
        playDemoSequence(freqSequence);
      }, 500);
    }
  };

  // -------------------------------------------------------------
  // 3. CIRCUIT (PIPE ALIGNMENT) STATE & LOGIC
  // 3x3 Grid connecting Top-Left (0,0) to Bottom-Right (2,2)
  // -------------------------------------------------------------
  const [circuitGrid, setCircuitGrid] = useState<ConduitCell[]>([]);

  const initCircuit = useCallback(() => {
    // Preset solvable path: (0,0)->(0,1)->(1,1)->(2,1)->(2,2)
    // We create cells with target rotations that form this path,
    // then randomly rotate each cell.
    const cells: ConduitCell[] = [
      // row 0: (0,0) Start [corner down-right], (0,1) [corner down-left], (0,2) [straight]
      { id: 0, type: 'corner', rotation: 0, targetRotation: 90 }, // conn: R, D
      { id: 1, type: 'corner', rotation: 0, targetRotation: 180 }, // conn: L, D
      { id: 2, type: 'straight', rotation: 0, targetRotation: 0 },
      // row 1: (1,0) [straight], (1,1) [tee down], (1,2) [corner]
      { id: 3, type: 'straight', rotation: 0, targetRotation: 90 },
      { id: 4, type: 'tee', rotation: 0, targetRotation: 0 }, // conn: L, R, D
      { id: 5, type: 'straight', rotation: 0, targetRotation: 90 },
      // row 2: (2,0) [corner], (2,1) [corner up-right], (2,2) End [corner up-left]
      { id: 6, type: 'straight', rotation: 0, targetRotation: 0 },
      { id: 7, type: 'corner', rotation: 0, targetRotation: 0 }, // conn: U, R
      { id: 8, type: 'corner', rotation: 0, targetRotation: 270 }, // conn: L, U
    ];

    // Scramble rotations
    cells.forEach((c) => {
      let r = (Math.floor(Math.random() * 3) + 1) * 90;
      c.rotation = (c.targetRotation + r) % 360;
    });

    setCircuitGrid(cells);
  }, []);

  const handleRotateCell = (index: number) => {
    if (isSolved) return;
    sound.playSfx('menuSelect');

    const newGrid = circuitGrid.map((cell, idx) => {
      if (idx === index) {
        return { ...cell, rotation: (cell.rotation + 90) % 360 };
      }
      return cell;
    });

    setCircuitGrid(newGrid);

    // Check if path is aligned
    const pathConnected =
      newGrid[0].rotation === newGrid[0].targetRotation &&
      newGrid[1].rotation === newGrid[1].targetRotation &&
      newGrid[4].rotation === newGrid[4].targetRotation &&
      newGrid[7].rotation === newGrid[7].targetRotation &&
      newGrid[8].rotation === newGrid[8].targetRotation;

    if (pathConnected) {
      handlePuzzleSolved();
    }
  };

  // -------------------------------------------------------------
  // 4. CIPHER (PAIR MATCHING) STATE & LOGIC
  // 6 cards (3 pairs)
  // -------------------------------------------------------------
  interface CipherCard {
    id: number;
    glyph: string;
    label: string;
    pairId: number;
    isFlipped: boolean;
    isMatched: boolean;
  }

  const [cipherCards, setCipherCards] = useState<CipherCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const initCipher = useCallback(() => {
    const glyphs = [
      { glyph: '⚡', label: 'Volt' },
      { glyph: '💎', label: 'Gema' },
      { glyph: '⏳', label: 'Cronos' },
    ];
    let cards: CipherCard[] = [];
    glyphs.forEach((g, idx) => {
      cards.push({ id: idx * 2, glyph: g.glyph, label: g.label, pairId: idx, isFlipped: false, isMatched: false });
      cards.push({ id: idx * 2 + 1, glyph: g.glyph, label: g.label, pairId: idx, isFlipped: false, isMatched: false });
    });
    cards = cards.sort(() => Math.random() - 0.5);
    setCipherCards(cards);
    setFlippedCards([]);
  }, []);

  const handleCardClick = (cardIndex: number) => {
    if (isSolved || flippedCards.length >= 2) return;
    const card = cipherCards[cardIndex];
    if (card.isFlipped || card.isMatched) return;

    sound.playSfx('menuSelect');
    const newCards = [...cipherCards];
    newCards[cardIndex].isFlipped = true;
    setCipherCards(newCards);

    const newFlipped = [...flippedCards, cardIndex];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const first = cipherCards[newFlipped[0]];
      const second = cipherCards[newFlipped[1]];

      if (first.pairId === second.pairId) {
        sound.playSfx('crystal');
        setTimeout(() => {
          newCards[newFlipped[0]].isMatched = true;
          newCards[newFlipped[1]].isMatched = true;
          setCipherCards(newCards);
          setFlippedCards([]);

          if (newCards.every((c) => c.isMatched)) {
            handlePuzzleSolved();
          }
        }, 300);
      } else {
        sound.playSfx('hurt');
        setTimeout(() => {
          newCards[newFlipped[0]].isFlipped = false;
          newCards[newFlipped[1]].isFlipped = false;
          setCipherCards(newCards);
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  // Initializer on tab change or mount
  useEffect(() => {
    setIsSolved(false);
    if (activeTab === 'jigsaw') initJigsaw();
    if (activeTab === 'frequency') initFrequency();
    if (activeTab === 'circuit') initCircuit();
    if (activeTab === 'cipher') initCipher();
  }, [activeTab, initJigsaw, initFrequency, initCircuit, initCipher]);

  const handlePuzzleSolved = () => {
    setIsSolved(true);
    sound.playSfx('levelUp');
    setTimeout(() => {
      sound.playSfx('crystal');
    }, 400);
  };

  const handleFinishAndConfirm = () => {
    sound.playSfx('checkpoint');
    onSolve();
  };

  // Count correct jigsaw pieces
  const jigsawCorrectCount = useMemo(() => {
    return jigsawTiles.filter((val, idx) => val === idx).length;
  }, [jigsawTiles]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-purple-500/50 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Top Glow Ambient Accent */}
        <div
          className="absolute top-0 inset-x-0 h-1.5 shadow-lg"
          style={{ backgroundColor: zone.themeColor }}
        />

        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-purple-500/20 bg-slate-950/60 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-md shrink-0"
              style={{ backgroundColor: `${zone.themeColor}25`, border: `2px solid ${zone.themeColor}` }}
            >
              {relic.symbol}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-mono font-black uppercase text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/30">
                  {zone.name}
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-300">
                  {language === 'es' ? 'NEXO CUÁNTICO' : 'QUANTUM NEXUS'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white font-heading truncate">
                {language === 'es' ? 'Sintoniza el Nexo de la Era' : 'Tune the Era Nexus'}
              </h2>
            </div>
          </div>

          {onSkip && !isSolved && (
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                onSkip();
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-mono font-bold transition-all shrink-0 cursor-pointer"
            >
              {language === 'es' ? 'Omitir' : 'Skip'}
            </button>
          )}
        </div>

        {/* Tab Switcher: Choose Puzzle Type */}
        <div className="px-3 pt-2 pb-1 bg-slate-950/40 border-b border-slate-800 flex items-center justify-center gap-1.5 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('jigsaw')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'jigsaw'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-300/70 hover:text-white bg-slate-900/60'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Rompecabezas' : 'Jigsaw'}</span>
          </button>

          <button
            onClick={() => setActiveTab('circuit')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'circuit'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-cyan-300/70 hover:text-white bg-slate-900/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Circuito' : 'Circuit'}</span>
          </button>

          <button
            onClick={() => setActiveTab('frequency')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'frequency'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-300/70 hover:text-white bg-slate-900/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Frecuencia' : 'Frequency'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cipher')}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cipher'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-300/70 hover:text-white bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Glifos' : 'Glyphs'}</span>
          </button>
        </div>

        {/* Puzzle Interactive Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center justify-center">
          {/* ========================================================= */}
          {/* PUZZLE TYPE 1: JIGSAW (ROMPECABEZAS)                      */}
          {/* ========================================================= */}
          {activeTab === 'jigsaw' && (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full max-w-xs text-xs font-mono text-slate-300 px-1">
                <span className="flex items-center gap-1 text-purple-300">
                  <Puzzle className="w-3.5 h-3.5 text-purple-400" />
                  <span>{relic.title}</span>
                </span>
                <span className="text-amber-300 font-bold">
                  {jigsawCorrectCount}/9 {language === 'es' ? 'piezas' : 'pieces'}
                </span>
              </div>

              {/* 3x3 Interactive Grid */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 grid grid-cols-3 grid-rows-3 gap-1 bg-slate-950 p-2 rounded-2xl border-2 border-purple-500/40 shadow-inner">
                {jigsawTiles.map((tilePiece, currentPos) => {
                  const isSelected = selectedTileIndex === currentPos;
                  const isCorrect = tilePiece === currentPos;

                  // Tile coordinate on the 3x3 original picture (0..2 col, 0..2 row)
                  const originalCol = tilePiece % 3;
                  const originalRow = Math.floor(tilePiece / 3);

                  return (
                    <button
                      key={`jigsaw-${currentPos}`}
                      onClick={() => handleTileClick(currentPos)}
                      className={`relative w-full h-full rounded-xl overflow-hidden cursor-pointer transition-all active:scale-95 border-2 ${
                        isSelected
                          ? 'border-cyan-400 ring-4 ring-cyan-400/50 scale-105 z-20'
                          : isCorrect
                          ? 'border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'border-slate-700/80 hover:border-purple-400'
                      }`}
                    >
                      {/* Sliced SVG View of the Relic */}
                      <div
                        className={`w-[300%] h-[300%] absolute transition-transform ${relic.bgGradient} bg-gradient-to-br`}
                        style={{
                          left: `-${originalCol * 100}%`,
                          top: `-${originalRow * 100}%`,
                        }}
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                          <circle cx="50" cy="50" r="40" fill={`${zone.themeColor}15`} stroke={zone.themeColor} strokeWidth="2" strokeDasharray="4 4" />
                          <path d={relic.runePath} fill={`${relic.secondaryColor}40`} stroke={relic.accentColor} strokeWidth="3" />
                          <circle cx="50" cy="50" r="14" fill={relic.primaryColor} />
                          <text x="50" y="55" fontSize="16" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                            {relic.symbol}
                          </text>
                        </svg>
                      </div>

                      {/* Correct Position Badge */}
                      {isCorrect && (
                        <div className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-950/80 text-emerald-400 shadow">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}

                      {/* Tile Number Indicator */}
                      <span className="absolute bottom-1 left-1 px-1 rounded text-[8px] font-mono font-bold bg-slate-950/70 text-slate-300">
                        #{tilePiece + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Jigsaw Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleJigsawHint}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                  <span>{language === 'es' ? 'Pista (+1 Pieza)' : 'Hint (+1 Piece)'}</span>
                </button>

                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{language === 'es' ? 'Ver Completa' : 'Preview'}</span>
                </button>

                <button
                  onClick={initJigsaw}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
                  title="Reiniciar piezas"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PUZZLE TYPE 2: CIRCUIT (ALINEACIÓN DE CONDUCTORES)        */}
          {/* ========================================================= */}
          {activeTab === 'circuit' && (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-300">
                  {language === 'es'
                    ? 'Gira los conductores para conectar el Generador de Kronos (arriba) con el Núcleo (abajo)'
                    : 'Rotate conduits to connect Kronos Generator (top) with the Core (bottom)'}
                </p>
              </div>

              {/* Circuit 3x3 Grid */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 grid grid-cols-3 grid-rows-3 gap-1.5 bg-slate-950 p-3 rounded-2xl border-2 border-cyan-500/40 shadow-inner">
                {/* Input node tag */}
                <span className="absolute -top-3 left-4 px-1.5 py-0.5 rounded bg-cyan-600 text-[8px] font-mono font-bold text-white shadow">
                  ⚡ ENTRADA
                </span>
                {/* Output node tag */}
                <span className="absolute -bottom-3 right-4 px-1.5 py-0.5 rounded bg-emerald-600 text-[8px] font-mono font-bold text-white shadow">
                  NÚCLEO 🎯
                </span>

                {circuitGrid.map((cell, idx) => {
                  const isPowerNode = idx === 0 || idx === 1 || idx === 4 || idx === 7 || idx === 8;
                  const isPowered = isPowerNode && cell.rotation === cell.targetRotation;

                  return (
                    <button
                      key={`circuit-${cell.id}`}
                      onClick={() => handleRotateCell(idx)}
                      className={`relative w-full h-full rounded-xl bg-slate-900 border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                        isPowered
                          ? 'border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {/* Conduit Graphic with Rotation */}
                      <div
                        className="w-full h-full p-2 transition-transform duration-300"
                        style={{ transform: `rotate(${cell.rotation}deg)` }}
                      >
                        <svg viewBox="0 0 40 40" className="w-full h-full">
                          {cell.type === 'straight' && (
                            <line
                              x1="20"
                              y1="0"
                              x2="20"
                              y2="40"
                              stroke={isPowered ? '#22d3ee' : '#64748b'}
                              strokeWidth="6"
                              strokeLinecap="round"
                            />
                          )}
                          {cell.type === 'corner' && (
                            <path
                              d="M20 0 V20 H40"
                              fill="none"
                              stroke={isPowered ? '#22d3ee' : '#64748b'}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                          {cell.type === 'tee' && (
                            <path
                              d="M0 20 H40 M20 20 V40"
                              fill="none"
                              stroke={isPowered ? '#22d3ee' : '#64748b'}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                        </svg>
                      </div>

                      {isPowered && (
                        <div className="absolute inset-0 bg-cyan-400/10 rounded-xl pointer-events-none animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={initCircuit}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Reiniciar Conexiones' : 'Reset Grid'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* PUZZLE TYPE 3: FREQUENCY (SIMON SEQUENCE)                 */}
          {/* ========================================================= */}
          {activeTab === 'frequency' && (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-300">
                  {isPlayingDemo
                    ? (language === 'es' ? '¡Memoriza la secuencia cuántica!' : 'Memorize the quantum sequence!')
                    : (language === 'es' ? 'Repite la secuencia tocando los orbes en orden' : 'Repeat the sequence in order')}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  {freqSequence.map((_, idx) => (
                    <div
                      key={`dot-${idx}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx < freqPlayerStep
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110'
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 4 Simon Frequency Orbs */}
              <div className="grid grid-cols-2 gap-3 w-56 sm:w-64">
                {[
                  { id: 0, label: 'Ignis', color: 'from-orange-500 to-red-600', activeRing: 'ring-orange-400' },
                  { id: 1, label: 'Kronos', color: 'from-cyan-500 to-sky-600', activeRing: 'ring-cyan-400' },
                  { id: 2, label: 'Gaia', color: 'from-emerald-500 to-green-600', activeRing: 'ring-emerald-400' },
                  { id: 3, label: 'Cosmos', color: 'from-purple-500 to-indigo-600', activeRing: 'ring-purple-400' },
                ].map((orb) => {
                  const isFlashing = activeFreqFlash === orb.id;

                  return (
                    <button
                      key={`freq-orb-${orb.id}`}
                      disabled={isPlayingDemo || isSolved}
                      onClick={() => handleFreqButtonPress(orb.id)}
                      className={`relative aspect-square rounded-2xl bg-gradient-to-br ${orb.color} p-4 flex flex-col items-center justify-center text-white font-black text-xs font-heading shadow-lg transition-all active:scale-95 cursor-pointer ${
                        isFlashing
                          ? `scale-105 ring-4 ${orb.activeRing} brightness-150 shadow-[0_0_25px_rgba(255,255,255,0.7)] z-10`
                          : 'opacity-85 hover:opacity-100 hover:scale-102'
                      }`}
                    >
                      <Sparkles className={`w-5 h-5 mb-1 ${isFlashing ? 'animate-bounce' : ''}`} />
                      <span>{orb.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                disabled={isPlayingDemo || isSolved}
                onClick={() => playDemoSequence(freqSequence)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Radio className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'es' ? 'Repetir Sonido Demo' : 'Replay Demo'}</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* PUZZLE TYPE 4: CIPHER (GLIFOS ANTIGUOS)                   */}
          {/* ========================================================= */}
          {activeTab === 'cipher' && (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-300">
                  {language === 'es'
                    ? 'Descubre las parejas de glifos cuánticos coincidentes'
                    : 'Find the matching pairs of quantum glyphs'}
                </p>
              </div>

              {/* 6 Cards Grid (3 pairs) */}
              <div className="grid grid-cols-3 gap-2 w-64 sm:w-72">
                {cipherCards.map((card, idx) => (
                  <button
                    key={`card-${card.id}`}
                    onClick={() => handleCardClick(idx)}
                    className={`aspect-[3/4] rounded-2xl border-2 flex flex-col items-center justify-center text-xl sm:text-2xl transition-all active:scale-95 cursor-pointer shadow-md ${
                      card.isMatched
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : card.isFlipped
                        ? 'bg-slate-800 border-cyan-400 text-white scale-105'
                        : 'bg-slate-950/90 border-purple-500/40 text-purple-400 hover:border-purple-300'
                    }`}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <div className="flex flex-col items-center animate-in zoom-in duration-150">
                        <span>{card.glyph}</span>
                        <span className="text-[8px] font-mono font-bold text-slate-300 mt-1 uppercase">
                          {card.label}
                        </span>
                      </div>
                    ) : (
                      <Compass className="w-6 h-6 text-purple-400/60 animate-spin" style={{ animationDuration: '8s' }} />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={initCipher}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Mezclar Cartas' : 'Shuffle Cards'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Success Banner & Confirmation Button */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-purple-500/20 bg-slate-950/80 flex flex-col gap-2 shrink-0">
          {isSolved ? (
            <div className="w-full flex flex-col gap-2 animate-in zoom-in duration-200">
              <div className="bg-emerald-950/80 border-2 border-emerald-400 rounded-2xl p-2.5 flex items-center gap-2.5 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase font-mono">
                    {language === 'es' ? '¡NEXO SINTONIZADO CON ÉXITO!' : 'NEXUS SUCCESSFULLY TUNED!'}
                  </div>
                  <div className="text-[10px] text-emerald-200/80 truncate">
                    {language === 'es'
                      ? 'La resonancia ha sido estabilizada. ¡Misión completada!'
                      : 'Resonance stabilized. Trial cleared!'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinishAndConfirm}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm font-heading shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[44px]"
              >
                <span>{language === 'es' ? 'COMPLETAR DESAFÍO Y CONTINUAR' : 'FINALIZE TRIAL & CONTINUE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>
                {language === 'es'
                  ? 'Completa el puzzle para desbloquear este hito'
                  : 'Solve the puzzle to unlock this milestone'}
              </span>
              <button
                onClick={handlePuzzleSolved}
                className="text-purple-400 hover:text-purple-200 underline text-[10px] cursor-pointer"
              >
                {language === 'es' ? 'Resolver Rápido' : 'Auto-Solve'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Jigsaw Preview Modal Reference */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative bg-slate-900 border-2 border-purple-500/60 p-4 rounded-3xl max-w-xs w-full flex flex-col items-center gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono font-bold text-purple-300">
                {language === 'es' ? 'Reliquia Completa' : 'Full Relic Art'}
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`w-48 h-48 rounded-2xl overflow-hidden border-2 border-purple-500 ${relic.bgGradient} bg-gradient-to-br shadow-inner`}>
              <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                <circle cx="50" cy="50" r="40" fill={`${zone.themeColor}15`} stroke={zone.themeColor} strokeWidth="2" strokeDasharray="4 4" />
                <path d={relic.runePath} fill={`${relic.secondaryColor}40`} stroke={relic.accentColor} strokeWidth="3" />
                <circle cx="50" cy="50" r="14" fill={relic.primaryColor} />
                <text x="50" y="55" fontSize="16" textAnchor="middle" fill="#ffffff" fontWeight="bold">
                  {relic.symbol}
                </text>
              </svg>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-mono">
              {relic.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
