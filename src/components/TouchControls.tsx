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
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  inputs,
  onUpdateInput,
  onUpdateAnalogX,
  daggersAvailable,
  energy,
  controlMode = 'joystick',
  onToggleControlMode,
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

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none p-2 sm:p-4 flex items-end justify-between z-20 select-none touch-none">
      {/* LEFT SIDE: Virtual Joystick or D-Pad */}
      <div className="flex flex-col items-start gap-1 pointer-events-auto">
        <div className="flex items-center gap-1.5 mb-1 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800 text-[10px] text-cyan-400 font-mono">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>{controlMode === 'joystick' ? 'JOYSTICK VIRTUAL' : 'PAD DIRECCIONAL'}</span>
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
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/80 backdrop-blur-md border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* Center crosshair */}
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />
            <div className="absolute w-12 h-12 rounded-full border border-cyan-500/30" />

            {/* Moving Knob */}
            <div
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
              }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg border-2 ${
                isDraggingJoystick
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-200 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.8)]'
                  : 'bg-slate-800/90 border-cyan-500/60 text-cyan-300'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-cyan-200/80" />
            </div>
          </div>
        ) : (
          /* D-Pad Buttons */
          <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('left', true);
              }}
              onPointerUp={() => onUpdateInput('left', false)}
              onPointerCancel={() => onUpdateInput('left', false)}
              onPointerLeave={() => onUpdateInput('left', false)}
              className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${
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
              onPointerLeave={() => onUpdateInput('right', false)}
              className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${
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
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        {/* Secondary Row: Dash, Block, Special */}
        <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-lg">
          {/* Dash / Esquiva */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dash', true);
            }}
            onPointerUp={() => onUpdateInput('dash', false)}
            onPointerCancel={() => onUpdateInput('dash', false)}
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-transform active:scale-95 ${
              inputs.dash
                ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                : 'bg-slate-900/90 text-sky-300 border-sky-500/40'
            }`}
            title="Esquiva / Dash (Shift)"
          >
            <Wind className="w-4 h-4" />
            <span className="text-[8px] font-mono leading-none">DASH</span>
          </button>

          {/* Block / Escudo */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('block', true);
            }}
            onPointerUp={() => onUpdateInput('block', false)}
            onPointerCancel={() => onUpdateInput('block', false)}
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-transform active:scale-95 ${
              inputs.block
                ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/40'
            }`}
            title="Escudo / Bloqueo (E)"
          >
            <Shield className="w-4 h-4" />
            <span className="text-[8px] font-mono leading-none">ESCUDO</span>
          </button>

          {/* Special Burst SP */}
          <button
            disabled={!canUseSpecial}
            onPointerDown={(e) => {
              e.preventDefault();
              if (canUseSpecial) onUpdateInput('special', true);
            }}
            onPointerUp={() => onUpdateInput('special', false)}
            onPointerCancel={() => onUpdateInput('special', false)}
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold border transition-transform active:scale-95 ${
              inputs.special
                ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.9)]'
                : canUseSpecial
                ? 'bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                : 'bg-slate-900/50 text-slate-600 border-slate-800'
            }`}
            title="Habilidad Especial (Q)"
          >
            <Zap className="w-4 h-4" />
            <span className="text-[8px] font-mono leading-none">SP {energy}</span>
          </button>
        </div>

        {/* Primary Row: Daggers, Sword Attack, Jump */}
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-2 rounded-3xl border border-slate-800 shadow-2xl">
          {/* Dagger Throw */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dagger', true);
            }}
            onPointerUp={() => onUpdateInput('dagger', false)}
            onPointerCancel={() => onUpdateInput('dagger', false)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
              inputs.dagger
                ? 'bg-purple-600 text-white border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.8)]'
                : daggersAvailable > 0
                ? 'bg-purple-950/90 text-purple-200 border-purple-500/50'
                : 'bg-slate-900/60 text-slate-600 border-slate-800'
            }`}
          >
            <span className="text-base">🗡</span>
            <span className="text-[9px] font-mono leading-none">{daggersAvailable}/3</span>
          </button>

          {/* Sword Attack Combo */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('attack', true);
            }}
            onPointerUp={() => onUpdateInput('attack', false)}
            onPointerCancel={() => onUpdateInput('attack', false)}
            className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
              inputs.attack
                ? 'bg-cyan-400 text-slate-950 border-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.9)]'
                : 'bg-gradient-to-br from-cyan-900/90 to-blue-950/90 text-cyan-200 border-cyan-400/60 shadow-md'
            }`}
          >
            <Swords className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[9px] font-mono font-black tracking-tighter">ATACAR</span>
          </button>

          {/* Jump Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('jump', true);
            }}
            onPointerUp={() => onUpdateInput('jump', false)}
            onPointerCancel={() => onUpdateInput('jump', false)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center font-bold border-2 transition-transform active:scale-90 ${
              inputs.jump
                ? 'bg-rose-500 text-slate-950 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.9)]'
                : 'bg-gradient-to-br from-rose-700 to-pink-700 text-rose-100 border-rose-300/70 shadow-lg'
            }`}
          >
            <span className="text-xs sm:text-sm font-black tracking-wider">SALTAR</span>
            <span className="text-[8px] text-rose-200/80 font-mono">SALTO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
