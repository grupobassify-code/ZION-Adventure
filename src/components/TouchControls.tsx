import React, { useRef, useState, useEffect } from 'react';
import { Shield, Zap, Sparkles, Wind, Swords, Compass } from 'lucide-react';
import { GameInputState } from '../game/gameEngine';

interface TouchControlsProps {
  inputs: GameInputState;
  onUpdateInput: (key: keyof GameInputState, value: boolean) => void;
  onUpdateAnalogX?: (val: number) => void;
  daggersAvailable: number;
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
        {/* Secondary Row / Utilities */}
        <div className="flex items-center justify-between gap-1.5 px-1">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-slate-800 text-[9px] sm:text-[10px] text-cyan-400 font-mono">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>{controlMode === 'joystick' ? 'JOYSTICK' : 'D-PAD'}</span>
            {onToggleControlMode && (
              <button
                onClick={onToggleControlMode}
                className="ml-1 text-[9px] underline text-cyan-300 hover:text-white cursor-pointer"
              >
                Cambiar
              </button>
            )}
          </div>

          {/* Dash, Block, Special */}
          <div className="flex items-center gap-1.5">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('dash', true);
              }}
              onPointerUp={() => onUpdateInput('dash', false)}
              onPointerCancel={() => onUpdateInput('dash', false)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1 text-[11px] sm:text-xs font-bold border transition-transform active:scale-95 ${
                inputs.dash
                  ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                  : 'bg-slate-900/90 text-sky-300 border-sky-500/40'
              }`}
              title="Dash"
            >
              <Wind className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[9px] sm:text-[10px] font-mono">DASH</span>
            </button>

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('block', true);
              }}
              onPointerUp={() => onUpdateInput('block', false)}
              onPointerCancel={() => onUpdateInput('block', false)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1 text-[11px] sm:text-xs font-bold border transition-transform active:scale-95 ${
                inputs.block
                  ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                  : 'bg-slate-900/90 text-amber-300 border-amber-500/40'
              }`}
              title="Escudo"
            >
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[9px] sm:text-[10px] font-mono">ESCUDO</span>
            </button>

            <button
              disabled={!canUseSpecial}
              onPointerDown={(e) => {
                e.preventDefault();
                if (canUseSpecial) onUpdateInput('special', true);
              }}
              onPointerUp={() => onUpdateInput('special', false)}
              onPointerCancel={() => onUpdateInput('special', false)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1 text-[11px] sm:text-xs font-bold border transition-transform active:scale-95 ${
                inputs.special
                  ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.9)]'
                  : canUseSpecial
                  ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-900/50 text-slate-600 border-slate-800'
              }`}
              title="Especial SP"
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[9px] sm:text-[10px] font-mono">SP {energy}</span>
            </button>
          </div>
        </div>

        {/* Main Dual Thumb Area */}
        <div className="flex items-center justify-between px-1 sm:px-2 pt-1 pb-1">
          {/* Left: Joystick or D-Pad */}
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
          <div className="flex items-center gap-1.5 sm:gap-2 touch-control-surface">
            {/* Dagger Throw */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('dagger', true);
              }}
              onPointerUp={() => onUpdateInput('dagger', false)}
              onPointerCancel={() => onUpdateInput('dagger', false)}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
                inputs.dagger
                  ? 'bg-purple-600 text-white border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.8)]'
                  : daggersAvailable > 0
                  ? 'bg-purple-950/90 text-purple-200 border-purple-500/50'
                  : 'bg-slate-900/60 text-slate-600 border-slate-800'
              }`}
            >
              <span className="text-xs sm:text-sm">🗡</span>
              <span className="text-[7px] sm:text-[8px] font-mono leading-none">{daggersAvailable}/3</span>
            </button>

            {/* Sword Attack Combo */}
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

            {/* Jump Button */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('jump', true);
              }}
              onPointerUp={() => onUpdateInput('jump', false)}
              onPointerCancel={() => onUpdateInput('jump', false)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
                inputs.jump
                  ? 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.9)]'
                  : 'bg-gradient-to-br from-rose-700 to-pink-700 text-rose-100 border-rose-300/70 shadow-lg'
              }`}
            >
              <span className="text-[11px] sm:text-xs font-black tracking-wider">SALTAR</span>
              <span className="text-[7px] sm:text-[8px] text-rose-200/80 font-mono">SALTO</span>
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
      {/* LEFT SIDE: Virtual Joystick or D-Pad */}
      <div className="flex flex-col items-start gap-1 pointer-events-auto p-2">
        <div className="flex items-center gap-1.5 mb-1 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800 text-[10px] text-cyan-400 font-mono">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>{controlMode === 'joystick' ? 'JOYSTICK' : 'D-PAD'}</span>
          {onToggleControlMode && (
            <button
              onClick={onToggleControlMode}
              className="ml-1 text-[9px] underline text-cyan-300 hover:text-white"
            >
              Cambiar
            </button>
          )}
        </div>

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
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dagger', true);
            }}
            onPointerUp={() => onUpdateInput('dagger', false)}
            onPointerCancel={() => onUpdateInput('dagger', false)}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
              inputs.dagger
                ? 'bg-purple-600 text-white border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.8)]'
                : daggersAvailable > 0
                ? 'bg-purple-950/90 text-purple-200 border-purple-500/50'
                : 'bg-slate-900/60 text-slate-600 border-slate-800'
            }`}
          >
            <span className="text-xs sm:text-sm">🗡</span>
            <span className="text-[7px] sm:text-[8px] font-mono leading-none">{daggersAvailable}/3</span>
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

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('jump', true);
            }}
            onPointerUp={() => onUpdateInput('jump', false)}
            onPointerCancel={() => onUpdateInput('jump', false)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
              inputs.jump
                ? 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.9)]'
                : 'bg-gradient-to-br from-rose-700 to-pink-700 text-rose-100 border-rose-300/70 shadow-lg'
            }`}
          >
            <span className="text-xs sm:text-sm font-black tracking-wider">SALTAR</span>
            <span className="text-[7px] text-rose-200/80 font-mono">SALTO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
