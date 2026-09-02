import React, { useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, X, LogOut, Smartphone, Swords, ShieldCheck, Music } from 'lucide-react';
import { LEVEL_CONFIGS } from '../game/levelData';
import { GameSettings } from '../types';
import { PrivacyModal } from './PrivacyModal';
import { SoundtrackModal } from './SoundtrackModal';

interface PauseModalProps {
  levelIndex: number;
  settings: GameSettings;
  onResume: () => void;
  onRestart: () => void;
  onQuitToTitle?: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelIndex,
  settings,
  onResume,
  onRestart,
  onQuitToTitle,
  onUpdateSettings,
}) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showJukebox, setShowJukebox] = useState(false);
  const currentConfig = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showJukebox && <SoundtrackModal onClose={() => setShowJukebox(false)} />}
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏸️</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-100 font-heading tracking-wide">
              JUEGO EN PAUSA
            </h2>
          </div>
          <button
            onClick={onResume}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Continuar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Combat & Movement Controls Guide */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-cyan-400" />
            <span>Guía de Controles & Showdown</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Moverse</span>
              <span className="font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded">A / D o Joystick</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Saltar</span>
              <span className="font-mono font-bold text-rose-300 bg-slate-800 px-1.5 py-0.5 rounded">ESPACIO / W</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Ataque Combo</span>
              <span className="font-mono font-bold text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded">J / Z / Clic</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Lanzar Daga</span>
              <span className="font-mono font-bold text-purple-300 bg-slate-800 px-1.5 py-0.5 rounded">K / X</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Escudo / Showdown</span>
              <span className="font-mono font-bold text-emerald-300 bg-slate-800 px-1.5 py-0.5 rounded">E / C</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Esquiva / Dash</span>
              <span className="font-mono font-bold text-sky-300 bg-slate-800 px-1.5 py-0.5 rounded">SHIFT / L</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Especial SP</span>
              <span className="font-mono font-bold text-pink-300 bg-slate-800 px-1.5 py-0.5 rounded">Q / V (50 SP)</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Pausa</span>
              <span className="font-mono font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">P / ESC</span>
            </div>
          </div>
        </div>

        {/* Mobile Control Mode Selector */}
        <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-slate-200">Control Táctil Móvil</div>
              <div className="text-[10px] text-slate-400">Elige Joystick Virtual o Botones D-Pad</div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onUpdateSettings({ controlMode: 'joystick' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                settings.controlMode === 'joystick'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Joystick
            </button>
            <button
              onClick={() => onUpdateSettings({ controlMode: 'dpad' })}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                settings.controlMode === 'dpad'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              D-Pad
            </button>
          </div>
        </div>

        {/* Current Level & Save Status */}
        <div className="flex items-center justify-between bg-slate-950/80 px-3.5 py-2.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentConfig.themeColor || '#06b6d4' }} />
            <div>
              <div className="text-xs font-bold text-slate-200">
                Acto {currentConfig.act}: {currentConfig.title}
              </div>
              <div className="text-[10px] text-slate-400">{currentConfig.subtitle}</div>
            </div>
          </div>
          <div className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-500/30">
            💾 Progreso Guardado
          </div>
        </div>

        {/* Audio Settings */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-semibold ${
              settings.soundEnabled
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            <span>Efectos SFX</span>
          </button>

          {/* Music Toggle */}
          <button
            onClick={() => onUpdateSettings({ musicEnabled: !settings.musicEnabled })}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-semibold ${
              settings.musicEnabled
                ? 'bg-pink-950/40 border-pink-500/40 text-pink-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Música Chiptune</span>
          </button>
        </div>

        {/* Action Buttons: Continuar, Reiniciar Nivel, Salir & Privacidad */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onQuitToTitle || onRestart}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-all"
              title="Salir al Menú Principal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>

            <button
              onClick={() => setShowPrivacy(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-800 text-xs transition-all"
              title="Ver Política de Privacidad"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Privacidad</span>
            </button>

            <button
              onClick={() => setShowJukebox(true)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs transition-all"
              title="Ver Banda Sonora / Jukebox"
            >
              <Music className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">BSO</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar Nivel</span>
            </button>

            <button
              onClick={onResume}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-900/50 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>CONTINUAR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
