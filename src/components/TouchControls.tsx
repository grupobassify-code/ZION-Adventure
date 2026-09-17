import React, { useRef, useState, useEffect } from 'react';
import { Shield, Zap, Wind, Swords, ArrowUp } from 'lucide-react';
import { GameInputState } from '../game/gameEngine';
import { useLanguage } from '../utils/i18n';
import { checkIsIPad } from '../utils/device';

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
  const [isIPad, setIsIPad] = useState<boolean>(() => checkIsIPad());

  useEffect(() => {
    const handleResize = () => {
      setIsIPad(checkIsIPad());
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

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
        className={`relative w-full flex-1 ${
          isIPad ? 'min-h-[220px] max-h-[38vh] p-3 sm:p-4 pb-3' : 'min-h-[160px] max-h-[34vh] p-1.5 sm:p-2.5 pb-2'
        } flex flex-col justify-between z-20 select-none touch-control-surface bg-gradient-to-b from-[#050711]/60 via-[#090e24]/60 to-[#040610]/60 backdrop-blur-md border-t border-cyan-900/30 overflow-hidden`}
      >
        {/* Secondary Row / Utilities: Dash, Block, Special */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 px-1 pt-0.5">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dash', true);
            }}
            onPointerUp={() => onUpdateInput('dash', false)}
            onPointerCancel={() => onUpdateInput('dash', false)}
            className={`${
              isIPad
                ? 'min-h-[46px] md:min-h-[50px] px-4 py-2 text-xs md:text-sm rounded-2xl'
                : 'min-h-[34px] sm:min-h-[38px] px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs rounded-xl'
            } flex items-center gap-1.5 font-black border transition-all active:scale-95 shadow-md ${
              inputs.dash
                ? 'bg-sky-400/90 text-slate-950 border-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                : 'bg-slate-900/40 backdrop-blur-sm text-sky-300/90 border-sky-500/30'
            }`}
            title="Dash"
          >
            <Wind className={isIPad ? 'w-5 h-5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
            <span className="font-mono font-black tracking-wider">{t('touch_dash')}</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('block', true);
            }}
            onPointerUp={() => onUpdateInput('block', false)}
            onPointerCancel={() => onUpdateInput('block', false)}
            className={`${
              isIPad
                ? 'min-h-[46px] md:min-h-[50px] px-4 py-2 text-xs md:text-sm rounded-2xl'
                : 'min-h-[34px] sm:min-h-[38px] px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs rounded-xl'
            } flex items-center gap-1.5 font-black border transition-all active:scale-95 shadow-md ${
              inputs.block
                ? 'bg-amber-400/90 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                : 'bg-slate-900/40 backdrop-blur-sm text-amber-300/90 border-amber-500/30'
            }`}
            title="Escudo / Shield"
          >
            <Shield className={isIPad ? 'w-5 h-5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
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
            className={`${
              isIPad
                ? 'min-h-[46px] md:min-h-[50px] px-4 py-2 text-xs md:text-sm rounded-2xl'
                : 'min-h-[34px] sm:min-h-[38px] px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs rounded-xl'
            } flex items-center gap-1.5 font-black border transition-all active:scale-95 shadow-md ${
              inputs.special
                ? 'bg-rose-500/90 text-white border-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.9)]'
                : canUseSpecial
                ? 'bg-gradient-to-tr from-rose-600/50 to-amber-500/50 text-white border-rose-400/60 animate-pulse'
                : 'bg-slate-900/25 text-slate-500/80 border-slate-800/40'
            }`}
            title="Especial SP"
          >
            <Zap className={isIPad ? 'w-5 h-5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
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
                className={`relative ${
                  isIPad ? 'w-36 h-36 md:w-40 md:h-40' : 'w-24 h-24 sm:w-28 sm:h-28'
                } rounded-full bg-slate-950/35 backdrop-blur-sm border border-cyan-500/35 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center cursor-grab active:cursor-grabbing touch-control-surface`}
              >
                <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                <div className="absolute h-full w-[1px] bg-cyan-500/20" />
                <div className={`absolute ${isIPad ? 'w-14 h-14 md:w-16 md:h-16' : 'w-9 h-9 sm:w-11 sm:h-11'} rounded-full border border-cyan-500/30`} />
                <div
                  style={{
                    transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                    transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
                  }}
                  className={`${
                    isIPad ? 'w-16 h-16 md:w-18 md:h-18' : 'w-10 h-10 sm:w-12 sm:h-12'
                  } rounded-full flex items-center justify-center shadow-md border ${
                    isDraggingJoystick
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-200 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.9)]'
                      : 'bg-slate-800/50 backdrop-blur-xs border-cyan-500/45 text-cyan-300'
                  }`}
                >
                  <div className={`${isIPad ? 'w-5 h-5 md:w-6 md:h-6' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} rounded-full bg-cyan-200/90`} />
                </div>
              </div>
            ) : (
              <div className={`flex items-center ${isIPad ? 'gap-3 p-2.5 rounded-2xl' : 'gap-1.5 sm:gap-2.5 p-1.5 rounded-xl'} bg-slate-950/35 backdrop-blur-sm border border-slate-700/30 shadow-xl touch-control-surface`}>
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onUpdateInput('left', true);
                  }}
                  onPointerUp={() => onUpdateInput('left', false)}
                  onPointerCancel={() => onUpdateInput('left', false)}
                  className={`${
                    isIPad ? 'w-18 h-18 md:w-20 md:h-20 text-3xl md:text-4xl rounded-2xl' : 'w-11 h-11 sm:w-13 sm:h-13 text-xl sm:text-2xl rounded-xl'
                  } flex items-center justify-center font-black border transition-transform active:scale-95 ${
                    inputs.left
                      ? 'bg-cyan-500/90 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                      : 'bg-slate-900/40 backdrop-blur-xs text-cyan-300/90 border-cyan-500/35'
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
                  className={`${
                    isIPad ? 'w-18 h-18 md:w-20 md:h-20 text-3xl md:text-4xl rounded-2xl' : 'w-11 h-11 sm:w-13 sm:h-13 text-xl sm:text-2xl rounded-xl'
                  } flex items-center justify-center font-black border transition-transform active:scale-95 ${
                    inputs.right
                      ? 'bg-cyan-500/90 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                      : 'bg-slate-900/40 backdrop-blur-xs text-cyan-300/90 border-cyan-500/35'
                  }`}
                >
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* Right: Primary Action Buttons */}
          <div className={`flex items-center ${isIPad ? 'gap-3' : 'gap-1.5 sm:gap-2.5'} touch-control-surface`}>
            {/* Dagger Throw */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('dagger', true);
              }}
              onPointerUp={() => onUpdateInput('dagger', false)}
              onPointerCancel={() => onUpdateInput('dagger', false)}
              className={`relative overflow-hidden ${
                isIPad ? 'w-16 h-16 md:w-18 md:h-18 rounded-2xl' : 'w-11 h-11 sm:w-13 sm:h-13 rounded-xl'
              } flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 shrink-0 ${
                inputs.dagger
                  ? 'bg-purple-600/90 text-white border-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.9)]'
                  : daggersAvailable > 0
                  ? 'bg-gradient-to-b from-purple-950/45 to-slate-950/45 backdrop-blur-xs text-purple-200/90 border-purple-500/40 shadow-sm'
                  : 'bg-slate-900/30 text-slate-500/70 border-purple-950/30'
              }`}
            >
              <svg viewBox="0 0 10 18" className={`${isIPad ? 'w-6 h-6 md:w-7 md:h-7' : 'w-4 h-4 sm:w-5 sm:h-5'} mb-0.5 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]`}>
                <circle cx="5" cy="16" r="1.5" fill="none" stroke={daggersAvailable > 0 ? '#facc15' : '#475569'} strokeWidth="1" />
                <rect x="4.5" y="11" width="1" height="4" fill={daggersAvailable > 0 ? '#c084fc' : '#334155'} />
                <rect x="2.5" y="10.5" width="5" height="1" rx="0.5" fill={daggersAvailable > 0 ? '#facc15' : '#475569'} />
                <polygon points="5,1 9,10.5 1,10.5" fill={daggersAvailable > 0 ? '#c084fc' : '#1e293b'} stroke={daggersAvailable > 0 ? '#ffffff' : '#475569'} strokeWidth="0.8" />
              </svg>
              <span className={`${isIPad ? 'text-xs md:text-sm' : 'text-[9px] sm:text-[10px]'} font-mono leading-none font-black`}>
                {daggersAvailable < 3 ? `${daggersAvailable}/3` : '3/3'}
              </span>
              {daggersAvailable < 3 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-300 transition-all duration-75"
                    style={{ width: `${daggerRechargePercent}%` }}
                  />
                </div>
              )}
            </button>

            {/* Sword Attack */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('attack', true);
              }}
              onPointerUp={() => onUpdateInput('attack', false)}
              onPointerCancel={() => onUpdateInput('attack', false)}
              className={`${
                isIPad ? 'w-20 h-20 md:w-22 md:h-22 rounded-2xl' : 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl'
              } flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 shrink-0 ${
                inputs.attack
                  ? 'bg-cyan-400/90 text-slate-950 border-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.95)]'
                  : 'bg-gradient-to-br from-cyan-950/45 to-blue-950/45 backdrop-blur-xs text-cyan-200/90 border-cyan-400/40 shadow-sm'
              }`}
            >
              <Swords className={isIPad ? 'w-8 h-8 md:w-9 md:h-9' : 'w-5.5 h-5.5 sm:w-6 sm:h-6'} />
              <span className={`${isIPad ? 'text-xs md:text-sm' : 'text-[9px] sm:text-[10px]'} font-mono font-black`}>{t('touch_attack')}</span>
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
              className={`${
                isIPad ? 'w-22 h-22 md:w-24 md:h-24 rounded-2xl' : 'w-13 h-13 sm:w-15 sm:h-15 rounded-xl'
              } flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 shrink-0 overflow-hidden select-none p-1 shadow-lg ${
                inputs.jump
                  ? 'bg-rose-500/90 text-slate-950 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.95)]'
                  : 'bg-gradient-to-br from-rose-700/55 to-pink-700/55 backdrop-blur-xs text-rose-100/90 border-rose-300/50 shadow-md'
              }`}
            >
              <ArrowUp className={`${isIPad ? 'w-10 h-10 md:w-11 md:h-11 stroke-[3.5]' : 'w-6 h-6 sm:w-7 sm:h-7 stroke-[3]'} shrink-0`} />
              <span className={`${isIPad ? 'text-sm md:text-base' : 'text-[10px] sm:text-xs'} font-black tracking-wider leading-none truncate max-w-full`}>
                {t('touch_jump')}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Landscape Mode Layout (Widescreen Floating Controls with Extra Large Easy-Touch Buttons for iPad and Translucent for Both)
  return (
    <div 
      id="touch-controls-landscape"
      style={{
        paddingLeft: isIPad ? 'max(1.5rem, env(safe-area-inset-left))' : 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: isIPad ? 'max(1.5rem, env(safe-area-inset-right))' : 'max(0.75rem, env(safe-area-inset-right))',
        paddingBottom: isIPad ? 'max(1.25rem, env(safe-area-inset-bottom))' : 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
      className="absolute inset-x-0 bottom-0 pointer-events-none flex items-end justify-between z-20 select-none touch-control-surface"
    >
      {/* LEFT SIDE: Compact/Spacious Virtual Joystick or D-Pad */}
      <div className={`flex flex-col items-start pointer-events-auto ${isIPad ? 'p-3 md:p-5' : 'p-1.5 sm:p-2.5'}`}>
        {controlMode === 'joystick' ? (
          /* Virtual Analog Joystick (Noticeably larger on iPad, translucent on both) */
          <div
            ref={joystickBaseRef}
            onPointerDown={handlePointerDownJoystick}
            onPointerMove={handlePointerMoveJoystick}
            onPointerUp={handlePointerUpJoystick}
            onPointerCancel={handlePointerUpJoystick}
            className={`relative ${
              isIPad ? 'w-36 h-36 md:w-44 md:h-44' : 'w-24 h-24 sm:w-28 sm:h-28'
            } rounded-full bg-slate-950/35 backdrop-blur-sm border border-cyan-500/35 shadow-[0_0_16px_rgba(6,182,212,0.2)] flex items-center justify-center cursor-grab active:cursor-grabbing`}
          >
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />
            <div className={`absolute ${isIPad ? 'w-14 h-14 md:w-18 md:h-18' : 'w-9 h-9 sm:w-11 sm:h-11'} rounded-full border border-cyan-500/30`} />

            <div
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
              }}
              className={`${
                isIPad ? 'w-16 h-16 md:w-20 md:h-20' : 'w-10 h-10 sm:w-12 sm:h-12'
              } rounded-full flex items-center justify-center shadow-lg border ${
                isDraggingJoystick
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-200 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.9)]'
                  : 'bg-slate-800/50 backdrop-blur-xs border-cyan-500/45 text-cyan-300'
              }`}
            >
              <div className={`${isIPad ? 'w-5 h-5 md:w-6 md:h-6' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} rounded-full bg-cyan-200/90`} />
            </div>
          </div>
        ) : (
          /* D-Pad Buttons - Scaled Proportionately on iPad, translucent on both */
          <div className={`flex items-center ${isIPad ? 'gap-3 md:gap-4 p-2.5 md:p-3.5 rounded-2xl' : 'gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl'} bg-slate-950/35 backdrop-blur-sm border border-slate-700/30 shadow-xl`}>
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onUpdateInput('left', true);
              }}
              onPointerUp={() => onUpdateInput('left', false)}
              onPointerCancel={() => onUpdateInput('left', false)}
              className={`${
                isIPad ? 'w-18 h-18 md:w-22 md:h-22 text-3xl md:text-4xl rounded-2xl' : 'w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl rounded-xl'
              } flex items-center justify-center font-black border transition-transform active:scale-95 ${
                inputs.left
                  ? 'bg-cyan-500/90 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                  : 'bg-slate-900/40 backdrop-blur-xs text-cyan-300/90 border-cyan-500/35'
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
              className={`${
                isIPad ? 'w-18 h-18 md:w-22 md:h-22 text-3xl md:text-4xl rounded-2xl' : 'w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl rounded-xl'
              } flex items-center justify-center font-black border transition-transform active:scale-95 ${
                inputs.right
                  ? 'bg-cyan-500/90 text-slate-950 border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                  : 'bg-slate-900/40 backdrop-blur-xs text-cyan-300/90 border-cyan-500/35'
              }`}
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SIDE: Action Buttons Array (Bigger on iPad, translucent on both) */}
      <div className={`flex flex-col items-end ${isIPad ? 'gap-2.5 md:gap-3.5 p-3 md:p-5' : 'gap-1.5 sm:gap-2 p-1.5 sm:p-2.5'} pointer-events-auto`}>
        {/* Secondary Row: Dash, Block, Special */}
        <div className={`flex items-center ${isIPad ? 'gap-2.5 md:gap-3 p-1.5 md:p-2 rounded-2xl' : 'gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl'} bg-slate-950/35 backdrop-blur-sm border border-slate-700/30 shadow-lg`}>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dash', true);
            }}
            onPointerUp={() => onUpdateInput('dash', false)}
            onPointerCancel={() => onUpdateInput('dash', false)}
            className={`${
              isIPad ? 'w-15 h-15 md:w-17 md:h-17 rounded-2xl' : 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg'
            } flex flex-col items-center justify-center font-black border transition-transform active:scale-95 ${
              inputs.dash
                ? 'bg-sky-400/90 text-slate-950 border-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.85)]'
                : 'bg-slate-900/35 backdrop-blur-xs text-sky-300/90 border-sky-500/35'
            }`}
            title="Dash (Shift)"
          >
            <Wind className={isIPad ? 'w-6 h-6 md:w-7 md:h-7' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'} />
            <span className={`${isIPad ? 'text-[10px] md:text-[11px]' : 'text-[8px] sm:text-[9px]'} font-mono leading-none font-black`}>{t('touch_dash')}</span>
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('block', true);
            }}
            onPointerUp={() => onUpdateInput('block', false)}
            onPointerCancel={() => onUpdateInput('block', false)}
            className={`${
              isIPad ? 'w-15 h-15 md:w-17 md:h-17 rounded-2xl' : 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg'
            } flex flex-col items-center justify-center font-black border transition-transform active:scale-95 ${
              inputs.block
                ? 'bg-amber-400/90 text-slate-950 border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.85)]'
                : 'bg-slate-900/35 backdrop-blur-xs text-amber-300/90 border-amber-500/35'
            }`}
            title="Escudo / Shield"
          >
            <Shield className={isIPad ? 'w-6 h-6 md:w-7 md:h-7' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'} />
            <span className={`${isIPad ? 'text-[10px] md:text-[11px]' : 'text-[8px] sm:text-[9px]'} font-mono leading-none font-black`}>{t('touch_shield')}</span>
          </button>

          <button
            disabled={!canUseSpecial}
            onPointerDown={(e) => {
              e.preventDefault();
              if (canUseSpecial) onUpdateInput('special', true);
            }}
            onPointerUp={() => onUpdateInput('special', false)}
            onPointerCancel={() => onUpdateInput('special', false)}
            className={`${
              isIPad ? 'w-15 h-15 md:w-17 md:h-17 rounded-2xl' : 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg'
            } flex flex-col items-center justify-center font-black border transition-transform active:scale-95 ${
              inputs.special
                ? 'bg-rose-500/90 text-white border-rose-200 shadow-[0_0_14px_rgba(244,63,94,0.95)]'
                : canUseSpecial
                ? 'bg-gradient-to-tr from-rose-600/50 to-amber-500/50 text-white border-rose-400/60 animate-pulse'
                : 'bg-slate-900/25 text-slate-500/80 border-slate-800/40'
            }`}
            title="Especial (Q)"
          >
            <Zap className={isIPad ? 'w-6 h-6 md:w-7 md:h-7' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'} />
            <span className={`${isIPad ? 'text-[10px] md:text-[11px]' : 'text-[8px] sm:text-[9px]'} font-mono leading-none font-black`}>{t('touch_sp')} {energy}</span>
          </button>
        </div>

        {/* Primary Row: Daggers, Sword Attack, Jump */}
        <div className={`flex items-center ${isIPad ? 'gap-3 md:gap-4 p-2 md:p-3 rounded-3xl' : 'gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl'} bg-slate-950/35 backdrop-blur-sm border border-slate-700/30 shadow-xl`}>
          {/* Dagger Throw with Live Recharge Visualizer */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('dagger', true);
            }}
            onPointerUp={() => onUpdateInput('dagger', false)}
            onPointerCancel={() => onUpdateInput('dagger', false)}
            className={`relative overflow-hidden ${
              isIPad ? 'w-18 h-18 md:w-20 md:h-20 rounded-2xl' : 'w-11 h-11 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-xl'
            } flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 ${
              inputs.dagger
                ? 'bg-purple-600/90 text-white border-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.95)]'
                : daggersAvailable > 0
                ? 'bg-gradient-to-b from-purple-950/45 to-slate-950/45 backdrop-blur-xs text-purple-200/90 border-purple-500/40 shadow-sm'
                : 'bg-slate-900/30 text-slate-500/70 border-purple-950/30'
            }`}
          >
            <svg viewBox="0 0 10 18" className={`${isIPad ? 'w-7 h-7 md:w-8 md:h-8' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'} mb-0.5 drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]`}>
              <circle cx="5" cy="16" r="1.5" fill="none" stroke={daggersAvailable > 0 ? '#facc15' : '#475569'} strokeWidth="1" />
              <rect x="4.5" y="11" width="1" height="4" fill={daggersAvailable > 0 ? '#c084fc' : '#334155'} />
              <rect x="2.5" y="10.5" width="5" height="1" rx="0.5" fill={daggersAvailable > 0 ? '#facc15' : '#475569'} />
              <polygon points="5,1 9,10.5 1,10.5" fill={daggersAvailable > 0 ? '#c084fc' : '#1e293b'} stroke={daggersAvailable > 0 ? '#ffffff' : '#475569'} strokeWidth="0.8" />
            </svg>
            <span className={`${isIPad ? 'text-xs md:text-sm' : 'text-[8px] sm:text-[9px]'} font-mono leading-none font-black`}>
              {daggersAvailable < 3 ? `${daggersAvailable}/3` : '3/3'}
            </span>
            {daggersAvailable < 3 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-300 transition-all duration-75"
                  style={{ width: `${daggerRechargePercent}%` }}
                />
              </div>
            )}
          </button>

          {/* Sword Attack Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              onUpdateInput('attack', true);
            }}
            onPointerUp={() => onUpdateInput('attack', false)}
            onPointerCancel={() => onUpdateInput('attack', false)}
            className={`${
              isIPad ? 'w-22 h-22 md:w-24 md:h-24 rounded-2xl' : 'w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15 rounded-xl'
            } flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 ${
              inputs.attack
                ? 'bg-cyan-400/90 text-slate-950 border-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.95)]'
                : 'bg-gradient-to-br from-cyan-950/45 to-blue-950/45 backdrop-blur-xs text-cyan-200/90 border-cyan-400/40 shadow-sm'
            }`}
          >
            <Swords className={isIPad ? 'w-9 h-9 md:w-10 md:h-10' : 'w-5.5 h-5.5 sm:w-6 sm:h-6'} />
            <span className={`${isIPad ? 'text-xs md:text-sm' : 'text-[8px] sm:text-[9px]'} font-mono font-black`}>{t('touch_attack')}</span>
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
            className={`${
              isIPad ? 'w-24 h-24 md:w-26 md:h-26 rounded-2xl' : 'w-14 h-14 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-xl'
            } flex flex-col items-center justify-center font-bold border transition-transform active:scale-90 shrink-0 overflow-hidden select-none p-1 shadow-lg ${
              inputs.jump
                ? 'bg-rose-500/90 text-slate-950 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.95)]'
                : 'bg-gradient-to-br from-rose-700/55 to-pink-700/55 backdrop-blur-xs text-rose-100/90 border-rose-300/50 shadow-md'
            }`}
          >
            <ArrowUp className={`${isIPad ? 'w-11 h-11 md:w-12 md:h-12 stroke-[3.5]' : 'w-6 h-6 sm:w-7 sm:h-7 stroke-[3]'} shrink-0`} />
            <span className={`${isIPad ? 'text-sm md:text-base' : 'text-[9px] sm:text-[10px]'} font-black tracking-wider leading-none truncate max-w-full`}>
              {t('touch_jump')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

