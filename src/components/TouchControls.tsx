import React, { useRef, useState } from 'react';
import { Shield, Zap, Wind, Swords, ArrowUp } from 'lucide-react';
import { GameInputState } from '../game/gameEngine';
import { useLanguage } from '../utils/i18n';

interface TouchControlsProps {
  inputs: GameInputState;
  onUpdateInput: (key: keyof GameInputState, value: boolean) => void;
  onUpdateAnalogX?: (val: number) => void;
  daggersAvailable: number;
  daggerRechargePercent?: number;
  energy: number;
  maxEnergy: number;
  controlMode?: 'joystick' | 'dpad';
  onToggleControlMode?: () => void;
  isPortrait?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  inputs,
  onUpdateInput,
  onUpdateAnalogX,
  daggersAvailable,
  daggerRechargePercent = 0,
  energy,
  controlMode = 'joystick',
  onToggleControlMode,
  isPortrait = false,
}) => {
  const { t } = useLanguage();
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);

  const handlePointerDownJoystick = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingJoystick(true);
    joystickTouchIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateJoystickPos(e.clientX, e.clientY);
  };

  const handlePointerMoveJoystick = (e: React.PointerEvent) => {
    if (!isDraggingJoystick || e.pointerId !== joystickTouchIdRef.current) return;
    updateJoystickPos(e.clientX, e.clientY);
  };

  const handlePointerUpJoystick = (e: React.PointerEvent) => {
    if (e.pointerId !== joystickTouchIdRef.current) return;
    setIsDraggingJoystick(false);
    joystickTouchIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    onUpdateInput('left', false);
    onUpdateInput('right', false);
    if (onUpdateAnalogX) onUpdateAnalogX(0);
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2 - 12;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    const normalizedX = knobX / maxRadius;
    if (onUpdateAnalogX) {
      onUpdateAnalogX(normalizedX);
    }

    if (normalizedX < -0.3) {
      onUpdateInput('left', true);
      onUpdateInput('right', false);
    } else if (normalizedX > 0.3) {
      onUpdateInput('right', true);
      onUpdateInput('left', false);
    } else {
      onUpdateInput('left', false);
      onUpdateInput('right', false);
    }
  };

  const canUseSpecial = energy >= 50;

  if (isPortrait) {
    return (
      <div 
        id="touch-controls-portrait"
        className="relative w-full flex-1 min-h-[160px] max-h-[34vh] p-1.5 sm:p-2.5 pb-2 flex flex-col justify-between z-20 select-none touch-control-surface bg-gradient-to-b from-[#050711] via-[#090e24] to-[#040610] border-t border-cyan-900/40 overflow-hidden"
      >
        {/* Secondary Row / Utilities: Dash, Block, Special - Compact Ergonomic Touch Buttons */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 px-1 pt-0.5">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dash', true);
            }}
            onPointerUp={() => onUpdateInput('dash', false)}
            onPointerCancel={() => onUpdateInput('dash', false)}
            className={`min-h-[34px] sm:min-h-[38px] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] sm:text-xs font-black border transition-transform active:scale-95 shadow-md ${
              inputs.dash
                ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                : 'bg-slate-900/90 text-sky-300 border-sky-500/50'
            }`}
            title="Dash"
          >
            <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-mono font-black tracking-wider">{t('touch_dash')}</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('block', true);
            }}
            onPointerUp={() => onUpdateInput('block', false)}
            onPointerCancel={() => onUpdateInput('block', false)}
            className={`min-h-[34px] sm:min-h-[38px] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] sm:text-xs font-black border transition-transform active:scale-95 shadow-md ${
              inputs.block
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/50'
            }`}
            title="Escudo / Shield"
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-mono font-black tracking-wider">{t('touch_shield')}</span>
          </button>

          <button
            disabled={!canUseSpecial}
            onPointerDown={(e) => {
              e.preventDefault();
              if (canUseSpecial) onUpdateInput('special', true);
            }}
            onPointerUp={() => onUpdateInput('special', false)}
            onPointerCancel={() => onUpdateInput('special', false)}
            className={`min-h-[34px] sm:min-h-[38px] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] sm:text-xs font-black border transition-transform active:scale-95 shadow-md ${
              inputs.special
                ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.9)]'
                : canUseSpecial
                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900/50 text-slate-600 border-slate-800'
            }`}
            title="Especial SP"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-mono font-black tracking-wider">{t('touch_sp')} {energy}</span>
          </button>
        </div>

        {/* Main Dual Thumb Area */}
        <div className="flex items-center justify-between px-1.5 sm:px-3 pt-0.5 pb-0.5">
          {/* Left: Compact Joystick or D-Pad */}
          <div className="flex flex-col items-center">
            {controlMode === 'joystick' ? (
              <div
                ref={joystickBaseRef}
                onPointerDown={handlePointerDownJoystick}
                onPointerMove={handlePointerMoveJoystick}
                onPointerUp={handlePointerUpJoystick}
                onPointerCancel={handlePointerUpJoystick}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center cursor-grab active:cursor-grabbing touch-control-surface"
              >
                <div className="absolute w-full h-[1px] bg-cyan-500/25" />
                <div className="absolute h-full w-[1px] bg-cyan-500/25" />
                <div className="absolute w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-cyan-500/35" />
                <div
                  style={{
                    transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                    transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
                  }}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md border ${
                    isDraggingJoystick
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-200 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.9)]'
                      : 'bg-slate-800/90 border-cyan-500/60 text-cyan-300'
                  }`}
                >
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-cyan-200/90" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shadow-xl touch-control-surface">
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onUpdateInput('left', true);
                  }}
                  onPointerUp={() => onUpdateInput('left', false)}
                  onPointerCancel={() => onUpdateInput('left', false)}
                  className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl border transition-transform active:scale-95 ${
                    inputs.left
                      ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                      : 'bg-slate-900/90 text-cyan-300 border-cyan-500/50'
                  }`}
                >
                  ◀
                </button>
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onUpdateInput('right', true);
                  }}
                  onPointerUp={() => onUpdateInput('right', false)}
                  onPointerCancel={() => onUpdateInput('right', false)}
                  className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl border transition-transform active:scale-95 ${
                    inputs.right
                      ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                      : 'bg-slate-900/90 text-cyan-300 border-cyan-500/50'
                  }`}
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* Right: Primary Action Buttons - Scaled Proportionately */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 touch-control-surface">
            {/* Dagger Throw with Live Recharge Visualizer */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('dagger', true);
              }}
              onPointerUp={() => onUpdateInput('dagger', false)}
              onPointerCancel={() => onUpdateInput('dagger', false)}
              className={`relative overflow-hidden w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 shrink-0 ${
                inputs.dagger
                  ? 'bg-purple-600 text-white border-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.9)]'
                  : daggersAvailable > 0
                  ? 'bg-gradient-to-b from-purple-900/95 to-slate-950/95 text-purple-200 border-purple-500/70 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-900/90 text-slate-500 border-purple-950/60'
              }`}
            >
              {/* Pixel Kunai Icon */}
              <svg viewBox="0 0 10 18" className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]">
                <circle cx="5" cy="16" r="1.5" fill="none" stroke={daggersAvailable > 0 ? '#facc15' : '#475569'} strokeWidth="1" />
                <rect x="4.5" y="11" width="1" height="4" fill={daggersAvailable > 0 ? '#c084fc' : '#334155'} />
                <rect x="2.5" y="10.5" width="5" height="1" rx="0.5" fill={daggersAvailable > 0 ? '#facc15' : '#475569'} />
                <polygon points="5,1 9,10.5 1,10.5" fill={daggersAvailable > 0 ? '#c084fc' : '#1e293b'} stroke={daggersAvailable > 0 ? '#ffffff' : '#475569'} strokeWidth="0.8" />
              </svg>
              <span className="text-[9px] sm:text-[10px] font-mono leading-none font-black">
                {daggersAvailable < 3 ? `${daggersAvailable}/3` : '3/3'}
              </span>
              {/* Active Fill Bottom Gauge */}
              {daggersAvailable < 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950/90 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-300 transition-all duration-75"
                    style={{ width: `${daggerRechargePercent}%` }}
                  />
                </div>
              )}
            </button>

            {/* Sword Attack Combo */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('attack', true);
              }}
              onPointerUp={() => onUpdateInput('attack', false)}
              onPointerCancel={() => onUpdateInput('attack', false)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 shrink-0 ${
                inputs.attack
                  ? 'bg-cyan-400 text-slate-950 border-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.95)]'
                  : 'bg-gradient-to-br from-cyan-900/95 to-blue-950/95 text-cyan-200 border-cyan-400/70 shadow-md'
              }`}
            >
              <Swords className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
              <span className="text-[9px] sm:text-[10px] font-mono font-black">{t('touch_attack')}</span>
            </button>

            {/* Jump Button */}
            <button
              id="portrait-btn-jump"
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('jump', true);
              }}
              onPointerUp={() => onUpdateInput('jump', false)}
              onPointerCancel={() => onUpdateInput('jump', false)}
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-xl flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 shrink-0 overflow-hidden select-none p-1 shadow-lg ${
                inputs.jump
                  ? 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.95)]'
                  : 'bg-gradient-to-br from-rose-700 to-pink-700 text-rose-100 border-rose-300/80 shadow-md'
              }`}
            >
              <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] shrink-0" />
              <span className="text-[10px] sm:text-xs font-black tracking-wider leading-none truncate max-w-full">
                {t('touch_jump')}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Landscape Mode Layout (Widescreen Floating Controls with Extra Large Easy-Touch Buttons)
  return (
    <div 
      id="touch-controls-landscape"
      style={{
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
      className="absolute inset-x-0 bottom-0 pointer-events-none flex items-end justify-between z-20 select-none touch-control-surface"
    >
      {/* LEFT SIDE: Compact Virtual Joystick or D-Pad */}
      <div className="flex flex-col items-start pointer-events-auto p-1.5 sm:p-2.5">
        {controlMode === 'joystick' ? (
          /* Virtual Analog Joystick */
          <div
            ref={joystickBaseRef}
            onPointerDown={handlePointerDownJoystick}
            onPointerMove={handlePointerMoveJoystick}
            onPointerUp={handlePointerUpJoystick}
            onPointerCancel={handlePointerUpJoystick}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.3)] flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="absolute w-full h-[1px] bg-cyan-500/25" />
            <div className="absolute h-full w-[1px] bg-cyan-500/25" />
            <div className="absolute w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-cyan-500/35" />

            <div
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
              }}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg border ${
                isDraggingJoystick
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-200 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.9)]'
                  : 'bg-slate-800/90 border-cyan-500/60 text-cyan-300'
              }`}
            >
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-cyan-200/90" />
            </div>
          </div>
        ) : (
          /* D-Pad Buttons - Scaled Proportionately */
          <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-950/80 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('left', true);
              }}
              onPointerUp={() => onUpdateInput('left', false)}
              onPointerCancel={() => onUpdateInput('left', false)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl border transition-transform active:scale-95 ${
                inputs.left
                  ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                  : 'bg-slate-900/90 text-cyan-300 border-cyan-500/50'
              }`}
            >
              ◀
            </button>
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('right', true);
              }}
              onPointerUp={() => onUpdateInput('right', false)}
              onPointerCancel={() => onUpdateInput('right', false)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl border transition-transform active:scale-95 ${
                inputs.right
                  ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                  : 'bg-slate-900/90 text-cyan-300 border-cyan-500/50'
              }`}
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Compact Action Buttons Array */}
      <div className="flex flex-col items-end gap-1.5 sm:gap-2 pointer-events-auto p-1.5 sm:p-2.5">
        {/* Secondary Row: Dash, Block, Special */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-slate-800 shadow-lg">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dash', true);
            }}
            onPointerUp={() => onUpdateInput('dash', false)}
            onPointerCancel={() => onUpdateInput('dash', false)}
            className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex flex-col items-center justify-center font-black border transition-transform active:scale-95 ${
              inputs.dash
                ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.85)]'
                : 'bg-slate-900/90 text-sky-300 border-sky-500/50'
            }`}
            title="Dash (Shift)"
          >
            <Wind className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[8px] sm:text-[9px] font-mono leading-none font-black">{t('touch_dash')}</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('block', true);
            }}
            onPointerUp={() => onUpdateInput('block', false)}
            onPointerCancel={() => onUpdateInput('block', false)}
            className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex flex-col items-center justify-center font-black border transition-transform active:scale-95 ${
              inputs.block
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.85)]'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/50'
            }`}
            title="Escudo / Shield"
          >
            <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[8px] sm:text-[9px] font-mono leading-none font-black">{t('touch_shield')}</span>
          </button>

          <button
            disabled={!canUseSpecial}
            onPointerDown={(e) => {
              e.preventDefault();
              if (canUseSpecial) onUpdateInput('special', true);
            }}
            onPointerUp={() => onUpdateInput('special', false)}
            onPointerCancel={() => onUpdateInput('special', false)}
            className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex flex-col items-center justify-center font-black border transition-transform active:scale-95 ${
              inputs.special
                ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_14px_rgba(244,63,94,0.95)]'
                : canUseSpecial
                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900/50 text-slate-600 border-slate-800'
            }`}
            title="Especial (Q)"
          >
            <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[8px] sm:text-[9px] font-mono leading-none font-black">{t('touch_sp')} {energy}</span>
          </button>
        </div>

        {/* Primary Row: Daggers, Sword Attack, Jump */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-950/85 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-xl">
          {/* Dagger Throw with Live Recharge Visualizer */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dagger', true);
            }}
            onPointerUp={() => onUpdateInput('dagger', false)}
            onPointerCancel={() => onUpdateInput('dagger', false)}
            className={`relative overflow-hidden w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 ${
              inputs.dagger
                ? 'bg-purple-600 text-white border-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.95)]'
                : daggersAvailable > 0
                ? 'bg-gradient-to-b from-purple-900/95 to-slate-950/95 text-purple-200 border-purple-500/70 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                : 'bg-slate-900/90 text-slate-500 border-purple-950/60'
            }`}
          >
            {/* Pixel Kunai Icon */}
            <svg viewBox="0 0 10 18" className="w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]">
              <circle cx="5" cy="16" r="1.5" fill="none" stroke={daggersAvailable > 0 ? '#facc15' : '#475569'} strokeWidth="1" />
              <rect x="4.5" y="11" width="1" height="4" fill={daggersAvailable > 0 ? '#c084fc' : '#334155'} />
              <rect x="2.5" y="10.5" width="5" height="1" rx="0.5" fill={daggersAvailable > 0 ? '#facc15' : '#475569'} />
              <polygon points="5,1 9,10.5 1,10.5" fill={daggersAvailable > 0 ? '#c084fc' : '#1e293b'} stroke={daggersAvailable > 0 ? '#ffffff' : '#475569'} strokeWidth="0.8" />
            </svg>
            <span className="text-[8px] sm:text-[9px] font-mono leading-none font-black">
              {daggersAvailable < 3 ? `${daggersAvailable}/3` : '3/3'}
            </span>
            {/* Active Fill Bottom Gauge */}
            {daggersAvailable < 3 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950/90 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-300 transition-all duration-75"
                  style={{ width: `${daggerRechargePercent}%` }}
                />
              </div>
            )}
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('attack', true);
            }}
            onPointerUp={() => onUpdateInput('attack', false)}
            onPointerCancel={() => onUpdateInput('attack', false)}
            className={`w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-xl flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 ${
              inputs.attack
                ? 'bg-cyan-400 text-slate-950 border-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.95)]'
                : 'bg-gradient-to-br from-cyan-900/95 to-blue-950/95 text-cyan-200 border-cyan-400/70 shadow-md'
            }`}
          >
            <Swords className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
            <span className="text-[8px] sm:text-[9px] font-mono font-black">{t('touch_attack')}</span>
          </button>

          {/* Jump Button */}
          <button
            id="landscape-btn-jump"
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('jump', true);
            }}
            onPointerUp={() => onUpdateInput('jump', false)}
            onPointerCancel={() => onUpdateInput('jump', false)}
            className={`w-14 h-14 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 shrink-0 overflow-hidden select-none p-1 shadow-lg ${
              inputs.jump
                ? 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.95)]'
                : 'bg-gradient-to-br from-rose-700 to-pink-700 text-rose-100 border-rose-300/80 shadow-md'
            }`}
          >
            <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-black tracking-wider leading-none truncate max-w-full">
              {t('touch_jump')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
