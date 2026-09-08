import React, { useRef, useState } from 'react';
import { Shield, Zap, Wind, Swords, ArrowUp } from 'lucide-react';
import { GameInputState } from '../game/gameEngine';

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
        className="relative w-full flex-1 min-h-[190px] max-h-[44vh] p-1.5 sm:p-3 flex flex-col justify-between z-20 select-none touch-control-surface bg-gradient-to-b from-[#050711] via-[#090e24] to-[#040610] border-t border-cyan-900/40 overflow-hidden"
      >
        {/* Secondary Row / Utilities: Dash, Block, Special */}
        <div className="flex items-center justify-end gap-2 px-1">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dash', true);
            }}
            onPointerUp={() => onUpdateInput('dash', false)}
            onPointerCancel={() => onUpdateInput('dash', false)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold border transition-transform active:scale-95 ${
              inputs.dash
                ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                : 'bg-slate-900/90 text-sky-300 border-sky-500/40'
            }`}
            title="Dash"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold">DASH</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('block', true);
            }}
            onPointerUp={() => onUpdateInput('block', false)}
            onPointerCancel={() => onUpdateInput('block', false)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold border transition-transform active:scale-95 ${
              inputs.block
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/40'
            }`}
            title="Escudo"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold">ESCUDO</span>
          </button>

          <button
            disabled={!canUseSpecial}
            onPointerDown={(e) => {
              e.preventDefault();
              if (canUseSpecial) onUpdateInput('special', true);
            }}
            onPointerUp={() => onUpdateInput('special', false)}
            onPointerCancel={() => onUpdateInput('special', false)}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold border transition-transform active:scale-95 ${
              inputs.special
                ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.9)]'
                : canUseSpecial
                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900/50 text-slate-600 border-slate-800'
            }`}
            title="Especial SP"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-bold">SP {energy}</span>
          </button>
        </div>

        {/* Main Dual Thumb Area */}
        <div className="flex items-center justify-between px-1 sm:px-2 pt-1 pb-1">
          {/* Left: Joystick or D-Pad (Uncluttered, pure control) */}
          <div className="flex flex-col items-center">
            {controlMode === 'joystick' ? (
              <div
                ref={joystickBaseRef}
                onPointerDown={handlePointerDownJoystick}
                onPointerMove={handlePointerMoveJoystick}
                onPointerUp={handlePointerUpJoystick}
                onPointerCancel={handlePointerUpJoystick}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950/80 backdrop-blur-md border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center cursor-grab active:cursor-grabbing touch-control-surface"
              >
                <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                <div className="absolute h-full w-[1px] bg-cyan-500/20" />
                <div className="absolute w-8 h-8 rounded-full border border-cyan-500/30" />
                <div
                  style={{
                    transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                    transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
                  }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-lg border-2 ${
                    isDraggingJoystick
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-200 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.8)]'
                      : 'bg-slate-800/90 border-cyan-500/60 text-cyan-300'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-cyan-200/80" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 shadow-xl touch-control-surface">
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onUpdateInput('left', true);
                  }}
                  onPointerUp={() => onUpdateInput('left', false)}
                  onPointerCancel={() => onUpdateInput('left', false)}
                  className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg border-2 ${
                    inputs.left
                      ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                      : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
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
                  className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg border-2 ${
                    inputs.right
                      ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                      : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex items-center gap-2 touch-control-surface">
            {/* Dagger Throw with Live Recharge Visualizer */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('dagger', true);
              }}
              onPointerUp={() => onUpdateInput('dagger', false)}
              onPointerCancel={() => onUpdateInput('dagger', false)}
              className={`relative overflow-hidden w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 shrink-0 ${
                inputs.dagger
                  ? 'bg-purple-600 text-white border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.9)]'
                  : daggersAvailable > 0
                  ? 'bg-gradient-to-b from-purple-900/90 to-slate-950/90 text-purple-200 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900/90 text-slate-500 border-purple-950/60'
              }`}
            >
              {/* Pixel Kunai Icon */}
              <svg viewBox="0 0 10 18" className="w-3.5 h-3.5 mb-0.5 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]">
                <circle cx="5" cy="16" r="1.5" fill="none" stroke={daggersAvailable > 0 ? '#facc15' : '#475569'} strokeWidth="1" />
                <rect x="4.5" y="11" width="1" height="4" fill={daggersAvailable > 0 ? '#c084fc' : '#334155'} />
                <rect x="2.5" y="10.5" width="5" height="1" rx="0.5" fill={daggersAvailable > 0 ? '#facc15' : '#475569'} />
                <polygon points="5,1 9,10.5 1,10.5" fill={daggersAvailable > 0 ? '#c084fc' : '#1e293b'} stroke={daggersAvailable > 0 ? '#ffffff' : '#475569'} strokeWidth="0.8" />
              </svg>
              <span className="text-[8px] font-mono leading-none font-bold">
                {daggersAvailable < 3 ? `${daggersAvailable}/3 (${daggerRechargePercent}%)` : '3/3 MAX'}
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
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 shrink-0 ${
                inputs.attack
                  ? 'bg-cyan-400 text-slate-950 border-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.9)]'
                  : 'bg-gradient-to-br from-cyan-900/90 to-blue-950/90 text-cyan-200 border-cyan-400/60 shadow-md'
              }`}
            >
              <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[8px] font-mono font-black">ATACAR</span>
            </button>

            {/* Jump Button - Contained cleanly inside frame */}
            <button
              id="portrait-btn-jump"
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('jump', true);
              }}
              onPointerUp={() => onUpdateInput('jump', false)}
              onPointerCancel={() => onUpdateInput('jump', false)}
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 shrink-0 overflow-hidden select-none p-1 ${
                inputs.jump
                  ? 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.9)]'
                  : 'bg-gradient-to-br from-rose-700 to-pink-700 text-rose-100 border-rose-300/70 shadow-lg'
              }`}
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-black tracking-wide leading-none truncate max-w-full">
                SALTAR
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Landscape Mode Layout (Widescreen Floating Controls)
  return (
    <div 
      id="touch-controls-landscape"
      style={{
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
      className="absolute inset-x-0 bottom-0 pointer-events-none flex items-end justify-between z-20 select-none touch-control-surface"
    >
      {/* LEFT SIDE: Clean Virtual Joystick or D-Pad (Without clutter) */}
      <div className="flex flex-col items-start pointer-events-auto p-2">
        {controlMode === 'joystick' ? (
          /* Virtual Analog Joystick */
          <div
            ref={joystickBaseRef}
            onPointerDown={handlePointerDownJoystick}
            onPointerMove={handlePointerMoveJoystick}
            onPointerUp={handlePointerUpJoystick}
            onPointerCancel={handlePointerUpJoystick}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950/80 backdrop-blur-md border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />
            <div className="absolute w-8 h-8 rounded-full border border-cyan-500/30" />

            <div
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
              }}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg border-2 ${
                isDraggingJoystick
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-200 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.8)]'
                  : 'bg-slate-800/90 border-cyan-500/60 text-cyan-300'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-cyan-200/80" />
            </div>
          </div>
        ) : (
          /* D-Pad Buttons */
          <div className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('left', true);
              }}
              onPointerUp={() => onUpdateInput('left', false)}
              onPointerCancel={() => onUpdateInput('left', false)}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-base border-2 ${
                inputs.left
                  ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
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
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-base border-2 ${
                inputs.right
                  ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
              }`}
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Action Buttons Array */}
      <div className="flex flex-col items-end gap-1 pointer-events-auto p-1.5 sm:p-2">
        {/* Secondary Row: Dash, Block, Special */}
        <div className="flex items-center gap-1 bg-slate-950/70 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-lg">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dash', true);
            }}
            onPointerUp={() => onUpdateInput('dash', false)}
            onPointerCancel={() => onUpdateInput('dash', false)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-transform active:scale-95 ${
              inputs.dash
                ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                : 'bg-slate-900/90 text-sky-300 border-sky-500/40'
            }`}
            title="Dash (Shift)"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[7px] font-mono leading-none">DASH</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('block', true);
            }}
            onPointerUp={() => onUpdateInput('block', false)}
            onPointerCancel={() => onUpdateInput('block', false)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-transform active:scale-95 ${
              inputs.block
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/40'
            }`}
            title="Escudo (E)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[7px] font-mono leading-none">ESC</span>
          </button>

          <button
            disabled={!canUseSpecial}
            onPointerDown={(e) => {
              e.preventDefault();
              if (canUseSpecial) onUpdateInput('special', true);
            }}
            onPointerUp={() => onUpdateInput('special', false)}
            onPointerCancel={() => onUpdateInput('special', false)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-transform active:scale-95 ${
              inputs.special
                ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.9)]'
                : canUseSpecial
                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900/50 text-slate-600 border-slate-800'
            }`}
            title="Especial (Q)"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[7px] font-mono leading-none">SP {energy}</span>
          </button>
        </div>

        {/* Primary Row: Daggers, Sword Attack, Jump */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 sm:p-1.5 rounded-3xl border border-slate-800 shadow-2xl">
          {/* Dagger Throw with Live Recharge Visualizer */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dagger', true);
            }}
            onPointerUp={() => onUpdateInput('dagger', false)}
            onPointerCancel={() => onUpdateInput('dagger', false)}
            className={`relative overflow-hidden w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
              inputs.dagger
                ? 'bg-purple-600 text-white border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.9)]'
                : daggersAvailable > 0
                ? 'bg-gradient-to-b from-purple-900/90 to-slate-950/90 text-purple-200 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-slate-900/90 text-slate-500 border-purple-950/60'
            }`}
          >
            {/* Pixel Kunai Icon */}
            <svg viewBox="0 0 10 18" className="w-3.5 h-3.5 mb-0.5 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]">
              <circle cx="5" cy="16" r="1.5" fill="none" stroke={daggersAvailable > 0 ? '#facc15' : '#475569'} strokeWidth="1" />
              <rect x="4.5" y="11" width="1" height="4" fill={daggersAvailable > 0 ? '#c084fc' : '#334155'} />
              <rect x="2.5" y="10.5" width="5" height="1" rx="0.5" fill={daggersAvailable > 0 ? '#facc15' : '#475569'} />
              <polygon points="5,1 9,10.5 1,10.5" fill={daggersAvailable > 0 ? '#c084fc' : '#1e293b'} stroke={daggersAvailable > 0 ? '#ffffff' : '#475569'} strokeWidth="0.8" />
            </svg>
            <span className="text-[7px] sm:text-[8px] font-mono leading-none font-bold">
              {daggersAvailable < 3 ? `${daggersAvailable}/3 (${daggerRechargePercent}%)` : '3/3 MAX'}
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
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
              inputs.attack
                ? 'bg-cyan-400 text-slate-950 border-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.9)]'
                : 'bg-gradient-to-br from-cyan-900/90 to-blue-950/90 text-cyan-200 border-cyan-400/60 shadow-md'
            }`}
          >
            <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[7px] sm:text-[8px] font-mono font-black">ATACAR</span>
          </button>

          {/* Jump Button - Strictly Contained Inside Button Frame */}
          <button
            id="landscape-btn-jump"
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('jump', true);
            }}
            onPointerUp={() => onUpdateInput('jump', false)}
            onPointerCancel={() => onUpdateInput('jump', false)}
            className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 shrink-0 overflow-hidden select-none p-1 ${
              inputs.jump
                ? 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.9)]'
                : 'bg-gradient-to-br from-rose-700 to-pink-700 text-rose-100 border-rose-300/70 shadow-lg'
            }`}
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-black tracking-wide leading-none truncate max-w-full">
              SALTAR
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
