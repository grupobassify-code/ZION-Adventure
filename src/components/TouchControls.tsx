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
        className="relative w-full flex-1 min-h-[220px] max-h-[46vh] p-2 sm:p-3 pb-3 flex flex-col justify-between z-20 select-none touch-control-surface bg-gradient-to-b from-[#050711] via-[#090e24] to-[#040610] border-t border-cyan-900/40 overflow-hidden"
      >
        {/* Secondary Row / Utilities: Dash, Block, Special - Large Ergonomic Touch Buttons */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 px-1 pt-0.5">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dash', true);
            }}
            onPointerUp={() => onUpdateInput('dash', false)}
            onPointerCancel={() => onUpdateInput('dash', false)}
            className={`min-h-[46px] px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-black border-2 transition-transform active:scale-95 shadow-md ${
              inputs.dash
                ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.8)]'
                : 'bg-slate-900/90 text-sky-300 border-sky-500/50'
            }`}
            title="Dash"
          >
            <Wind className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            <span className="font-mono font-black tracking-wider">DASH</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('block', true);
            }}
            onPointerUp={() => onUpdateInput('block', false)}
            onPointerCancel={() => onUpdateInput('block', false)}
            className={`min-h-[46px] px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-black border-2 transition-transform active:scale-95 shadow-md ${
              inputs.block
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/50'
            }`}
            title="Escudo"
          >
            <Shield className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            <span className="font-mono font-black tracking-wider">ESCUDO</span>
          </button>

          <button
            disabled={!canUseSpecial}
            onPointerDown={(e) => {
              e.preventDefault();
              if (canUseSpecial) onUpdateInput('special', true);
            }}
            onPointerUp={() => onUpdateInput('special', false)}
            onPointerCancel={() => onUpdateInput('special', false)}
            className={`min-h-[46px] px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-black border-2 transition-transform active:scale-95 shadow-md ${
              inputs.special
                ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.9)]'
                : canUseSpecial
                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900/50 text-slate-600 border-slate-800'
            }`}
            title="Especial SP"
          >
            <Zap className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            <span className="font-mono font-black tracking-wider">SP {energy}</span>
          </button>
        </div>

        {/* Main Dual Thumb Area */}
        <div className="flex items-center justify-between px-2 sm:px-4 pt-1 pb-1">
          {/* Left: Extra Large Joystick or D-Pad */}
          <div className="flex flex-col items-center">
            {controlMode === 'joystick' ? (
              <div
                ref={joystickBaseRef}
                onPointerDown={handlePointerDownJoystick}
                onPointerMove={handlePointerMoveJoystick}
                onPointerUp={handlePointerUpJoystick}
                onPointerCancel={handlePointerUpJoystick}
                className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-slate-950/85 backdrop-blur-md border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center cursor-grab active:cursor-grabbing touch-control-surface"
              >
                <div className="absolute w-full h-[1px] bg-cyan-500/25" />
                <div className="absolute h-full w-[1px] bg-cyan-500/25" />
                <div className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-cyan-500/35" />
                <div
                  style={{
                    transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                    transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
                  }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg border-2 ${
                    isDraggingJoystick
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-200 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.9)]'
                      : 'bg-slate-800/90 border-cyan-500/60 text-cyan-300'
                  }`}
                >
                  <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-cyan-200/90" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 p-2 rounded-2xl border-2 border-slate-800 shadow-xl touch-control-surface">
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onUpdateInput('left', true);
                  }}
                  onPointerUp={() => onUpdateInput('left', false)}
                  onPointerCancel={() => onUpdateInput('left', false)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl border-2 transition-transform active:scale-95 ${
                    inputs.left
                      ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
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
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl border-2 transition-transform active:scale-95 ${
                    inputs.right
                      ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                      : 'bg-slate-900/90 text-cyan-300 border-cyan-500/50'
                  }`}
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* Right: Primary Action Buttons - Significantly Enlarged for Mobile */}
          <div className="flex items-center gap-2 sm:gap-3 touch-control-surface">
            {/* Dagger Throw with Live Recharge Visualizer */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('dagger', true);
              }}
              onPointerUp={() => onUpdateInput('dagger', false)}
              onPointerCancel={() => onUpdateInput('dagger', false)}
              className={`relative overflow-hidden w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 shrink-0 ${
                inputs.dagger
                  ? 'bg-purple-600 text-white border-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.9)]'
                  : daggersAvailable > 0
                  ? 'bg-gradient-to-b from-purple-900/95 to-slate-950/95 text-purple-200 border-purple-500/70 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-900/90 text-slate-500 border-purple-950/60'
              }`}
            >
              {/* Pixel Kunai Icon */}
              <svg viewBox="0 0 10 18" className="w-5 h-5 sm:w-5.5 sm:h-5.5 mb-0.5 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]">
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
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950/90 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-300 transition-all duration-75"
                    style={{ width: `${daggerRechargePercent}%` }}
                  />
                </div>
              )}
            </button>

            {/* Sword Attack Combo - Large Easy Touch Target */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('attack', true);
              }}
              onPointerUp={() => onUpdateInput('attack', false)}
              onPointerCancel={() => onUpdateInput('attack', false)}
              className={`w-15 h-15 sm:w-17 sm:h-17 md:w-18 md:h-18 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 shrink-0 ${
                inputs.attack
                  ? 'bg-cyan-400 text-slate-950 border-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.95)]'
                  : 'bg-gradient-to-br from-cyan-900/95 to-blue-950/95 text-cyan-200 border-cyan-400/70 shadow-lg'
              }`}
            >
              <Swords className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
              <span className="text-[10px] sm:text-[11px] font-mono font-black">ATACAR</span>
            </button>

            {/* Jump Button - Extra Large Hero Action Button */}
            <button
              id="portrait-btn-jump"
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('jump', true);
              }}
              onPointerUp={() => onUpdateInput('jump', false)}
              onPointerCancel={() => onUpdateInput('jump', false)}
              className={`w-17 h-17 sm:w-19 sm:h-19 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 shrink-0 overflow-hidden select-none p-1 shadow-xl ${
                inputs.jump
                  ? 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_22px_rgba(244,63,94,0.95)]'
                  : 'bg-gradient-to-br from-rose-700 to-pink-700 text-rose-100 border-rose-300/80 shadow-lg'
              }`}
            >
              <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] shrink-0" />
              <span className="text-[11px] sm:text-xs font-black tracking-wider leading-none truncate max-w-full">
                SALTAR
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
      {/* LEFT SIDE: Extra Large Virtual Joystick or D-Pad */}
      <div className="flex flex-col items-start pointer-events-auto p-2 sm:p-3">
        {controlMode === 'joystick' ? (
          /* Virtual Analog Joystick */
          <div
            ref={joystickBaseRef}
            onPointerDown={handlePointerDownJoystick}
            onPointerMove={handlePointerMoveJoystick}
            onPointerUp={handlePointerUpJoystick}
            onPointerCancel={handlePointerUpJoystick}
            className="relative w-34 h-34 sm:w-38 sm:h-38 md:w-42 md:h-42 rounded-full bg-slate-950/85 backdrop-blur-md border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="absolute w-full h-[1px] bg-cyan-500/25" />
            <div className="absolute h-full w-[1px] bg-cyan-500/25" />
            <div className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-cyan-500/35" />

            <div
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
              }}
              className={`w-15 h-15 sm:w-17 sm:h-17 rounded-full flex items-center justify-center shadow-xl border-2 ${
                isDraggingJoystick
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-200 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.9)]'
                  : 'bg-slate-800/90 border-cyan-500/60 text-cyan-300'
              }`}
            >
              <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-cyan-200/90" />
            </div>
          </div>
        ) : (
          /* D-Pad Buttons - Extra Large for Easy Finger Pressing */
          <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-3xl border-2 border-slate-800 shadow-2xl">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('left', true);
              }}
              onPointerUp={() => onUpdateInput('left', false)}
              onPointerCancel={() => onUpdateInput('left', false)}
              className={`w-17 h-17 sm:w-19 sm:h-19 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-transform active:scale-95 ${
                inputs.left
                  ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.8)]'
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
              className={`w-17 h-17 sm:w-19 sm:h-19 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl border-2 transition-transform active:scale-95 ${
                inputs.right
                  ? 'bg-cyan-500 text-slate-950 border-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.8)]'
                  : 'bg-slate-900/90 text-cyan-300 border-cyan-500/50'
              }`}
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Action Buttons Array with Super Generous Touch Hitboxes */}
      <div className="flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-auto p-2 sm:p-3">
        {/* Secondary Row: Dash, Block, Special */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-950/80 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-xl">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dash', true);
            }}
            onPointerUp={() => onUpdateInput('dash', false)}
            onPointerCancel={() => onUpdateInput('dash', false)}
            className={`w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-xl flex flex-col items-center justify-center font-black border-2 transition-transform active:scale-95 ${
              inputs.dash
                ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.85)]'
                : 'bg-slate-900/90 text-sky-300 border-sky-500/50'
            }`}
            title="Dash (Shift)"
          >
            <Wind className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            <span className="text-[9px] sm:text-[10px] font-mono leading-none font-black">DASH</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('block', true);
            }}
            onPointerUp={() => onUpdateInput('block', false)}
            onPointerCancel={() => onUpdateInput('block', false)}
            className={`w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-xl flex flex-col items-center justify-center font-black border-2 transition-transform active:scale-95 ${
              inputs.block
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.85)]'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/50'
            }`}
            title="Escudo (E)"
          >
            <Shield className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            <span className="text-[9px] sm:text-[10px] font-mono leading-none font-black">ESC</span>
          </button>

          <button
            disabled={!canUseSpecial}
            onPointerDown={(e) => {
              e.preventDefault();
              if (canUseSpecial) onUpdateInput('special', true);
            }}
            onPointerUp={() => onUpdateInput('special', false)}
            onPointerCancel={() => onUpdateInput('special', false)}
            className={`w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-xl flex flex-col items-center justify-center font-black border-2 transition-transform active:scale-95 ${
              inputs.special
                ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.95)]'
                : canUseSpecial
                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900/50 text-slate-600 border-slate-800'
            }`}
            title="Especial (Q)"
          >
            <Zap className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            <span className="text-[9px] sm:text-[10px] font-mono leading-none font-black">SP {energy}</span>
          </button>
        </div>

        {/* Primary Row: Daggers, Sword Attack, Jump - Extra Large Mobile Hitboxes */}
        <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-950/85 backdrop-blur-md p-2 rounded-3xl border-2 border-slate-800 shadow-2xl">
          {/* Dagger Throw with Live Recharge Visualizer */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dagger', true);
            }}
            onPointerUp={() => onUpdateInput('dagger', false)}
            onPointerCancel={() => onUpdateInput('dagger', false)}
            className={`relative overflow-hidden w-15 h-15 sm:w-17 sm:h-17 md:w-18 md:h-18 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
              inputs.dagger
                ? 'bg-purple-600 text-white border-purple-200 shadow-[0_0_18px_rgba(168,85,247,0.95)]'
                : daggersAvailable > 0
                ? 'bg-gradient-to-b from-purple-900/95 to-slate-950/95 text-purple-200 border-purple-500/70 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-slate-900/90 text-slate-500 border-purple-950/60'
            }`}
          >
            {/* Pixel Kunai Icon */}
            <svg viewBox="0 0 10 18" className="w-5 h-5 sm:w-5.5 sm:h-5.5 mb-0.5 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]">
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
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950/90 overflow-hidden">
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
            className={`w-17 h-17 sm:w-19 sm:h-19 md:w-21 md:h-21 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
              inputs.attack
                ? 'bg-cyan-400 text-slate-950 border-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.95)]'
                : 'bg-gradient-to-br from-cyan-900/95 to-blue-950/95 text-cyan-200 border-cyan-400/70 shadow-lg'
            }`}
          >
            <Swords className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="text-[9px] sm:text-[10px] font-mono font-black">ATACAR</span>
          </button>

          {/* Jump Button - Massive, Easy-to-hit Primary Jump Button */}
          <button
            id="landscape-btn-jump"
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('jump', true);
            }}
            onPointerUp={() => onUpdateInput('jump', false)}
            onPointerCancel={() => onUpdateInput('jump', false)}
            className={`w-19 h-19 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 shrink-0 overflow-hidden select-none p-1.5 shadow-2xl ${
              inputs.jump
                ? 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_24px_rgba(244,63,94,0.95)]'
                : 'bg-gradient-to-br from-rose-700 to-pink-700 text-rose-100 border-rose-300/80 shadow-xl'
            }`}
          >
            <ArrowUp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3] shrink-0" />
            <span className="text-[11px] sm:text-xs font-black tracking-wider leading-none truncate max-w-full">
              SALTAR
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
