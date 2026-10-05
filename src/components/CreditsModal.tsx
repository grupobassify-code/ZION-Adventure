import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Sparkles, FastForward, Play, Pause, Home, RotateCcw, Skull, Shield, Award, Volume2, VolumeX, Clock } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { GameStats } from '../game/gameEngine';
import { useLanguage } from '../utils/i18n';

import kronoBossImg from '../assets/images/krono_boss_thumb_1790821933692.jpg';
import bgKronoMidnight from '../assets/images/bg_krono_midnight_1790899899930.jpg';
import dmnLogoImg from '../assets/images/dmn_studio_logo_1788957315939.jpg';
import zionSplashImg from '../assets/images/zion_splash_art_1788957295323.jpg';

interface CreditsModalProps {
  stats: GameStats;
  isGameCompleted?: boolean;
  onRestartGame: () => void;
  onSelectLevel: (lvlIdx: number) => void;
  onClose?: () => void;
}

type CreditsPhase = 'scrolling' | 'postcredits1' | 'postcredits2' | 'whiteout' | 'postcredits3' | 'completion';

export const CreditsModal: React.FC<CreditsModalProps> = ({
  stats,
  isGameCompleted = false,
  onRestartGame,
  onSelectLevel,
  onClose,
}) => {
  const { language } = useLanguage();
  const [phase, setPhase] = useState<CreditsPhase>('scrolling');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Hidden interaction state for 'Grupo Bassify'
  const [bassifyGlitch, setBassifyGlitch] = useState<boolean>(false);
  const [, setBassifyClickCount] = useState<number>(0);
  const glitchTimeoutRef = useRef<number | null>(null);

  // Post-credits 1 animation states (The Red Eyes)
  const [postCreditsStep, setPostCreditsStep] = useState<number>(0);
  // 0 = Dark ruins establish
  // 1 = Smoke & metallic creaking
  // 2 = Something stirring inside the chest
  // 3 = RED EYES IGNITE intensely
  // 4 = Whisper/voice line appears
  // 5 = Cut to blackout / finale

  // Post-credits 2 animation states (Green Hacker Terminal)
  const [postCredits2Step, setPostCredits2Step] = useState<number>(0);
  // 0 = Cascading green hacker code streaming
  // 1 = Mandando mensaje de llamado...
  // 2 = Mensaje recibido.
  // 3 = Sujeto encontrado.
  // 4 = Screen glitch + "Auxilio soy yo zion..." + Binary timestamp

  // Post-credits 3 animation states (Mechanical Clock Marking Time)
  const [clockSeconds, setClockSeconds] = useState<number>(53);
  const [, setClockChimePlayed] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const scrollPosRef = useRef<number>(0);

  // 1. Play credits music track on mount
  useEffect(() => {
    sound.setMusicTrack('creditsTune');
    return () => {
      sound.stopMusic();
    };
  }, []);

  // 2. Smooth vertical scroll loop (Sonic the Hedgehog / Cinema style)
  useEffect(() => {
    if (phase !== 'scrolling') return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const baseSpeed = 48; // pixels per second
    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (!isPaused && scrollContainer) {
        const delta = baseSpeed * speedMultiplier * dt;
        scrollPosRef.current += delta;
        scrollContainer.scrollTop = scrollPosRef.current;

        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const progress = maxScroll > 0 ? Math.min(1, scrollPosRef.current / maxScroll) : 0;
        setScrollProgress(progress);

        // When reaching the bottom of the credits crawl, trigger the post-credits scene!
        if (maxScroll > 100 && scrollPosRef.current >= maxScroll - 4) {
          triggerPostCredits();
          return;
        }
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [phase, isPaused, speedMultiplier]);

  // 3. Mechanical Clock Ticking Loop for Post-Credits 3
  useEffect(() => {
    if (phase !== 'postcredits3') return;

    // Reset seconds to 55 (smooth 5-second suspense to midnight 12:00:00)
    setClockSeconds(55);
    setClockChimePlayed(false);

    let sec = 55;
    const interval = setInterval(() => {
      sec += 1;
      setClockSeconds(sec);

      // Play mechanical tick / tock sound effect
      if (sec % 2 === 0) {
        sound.tone(1900, 0.02, 'triangle', 0.15, 0, 850);
      } else {
        sound.tone(1450, 0.02, 'triangle', 0.13, 0, 600);
      }

      // When reaching 60 (12:00:00)
      if (sec >= 60) {
        clearInterval(interval);
        setClockChimePlayed(true);

        // Deep reverberating midnight bell chime
        sound.tone(220, 3.2, 'sine', 0.28, 0, 110);
        sound.tone(110, 3.5, 'triangle', 0.24, 0, 55);
        sound.playSfx('stone');

        // Transition to final completion screen
        setTimeout(() => {
          setPhase('completion');
        }, 2600);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [phase]);

  // Transition into Post-Credits Scene 1 (The Red Eyes)
  const triggerPostCredits = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
    }
    setPhase('postcredits1');
    setPostCreditsStep(0);

    // Fade music and start ominous sound cues
    sound.tone(65, 1.2, 'sawtooth', 0.08, 0, 35);

    // Sequence the dramatic reveal
    setTimeout(() => {
      setPostCreditsStep(1); // Smoke & creaking
      sound.playSfx('stone');
    }, 1800);

    setTimeout(() => {
      setPostCreditsStep(2); // Something stirs
      sound.tone(110, 0.8, 'square', 0.06, 0, 45);
      sound.playSfx('laser');
    }, 3800);

    setTimeout(() => {
      setPostCreditsStep(3); // GLOWING RED EYES IGNITE!
      sound.tone(220, 1.5, 'sawtooth', 0.12, 0, 88);
      sound.tone(440, 0.4, 'triangle', 0.07, 0, 110);
    }, 5600);

    setTimeout(() => {
      setPostCreditsStep(4); // Whisper text
      sound.tone(85, 2.0, 'sawtooth', 0.08, 0, 40);
    }, 7600);

    setTimeout(() => {
      setPostCreditsStep(5); // Blackout
      sound.playSfx('explosion');
      // Transitions into Second Post-Credits Scene (Hacker Terminal Green)!
      setTimeout(() => {
        triggerSecondPostCredits();
      }, 1200);
    }, 11200);
  };

  // Transition into Second Post-Credits Scene (Hacker Terminal Green & Zion Distress Transmission)
  const triggerSecondPostCredits = () => {
    setPhase('postcredits2');
    setPostCredits2Step(0);

    // Initial terminal boot tone
    sound.tone(880, 0.09, 'sine', 0.06);

    // Step 1: Mandando mensaje de llamado...
    setTimeout(() => {
      setPostCredits2Step(1);
      sound.tone(660, 0.15, 'square', 0.08);
      sound.tone(880, 0.2, 'square', 0.08, 0.08);
    }, 2800);

    // Step 2: Mensaje recibido.
    setTimeout(() => {
      setPostCredits2Step(2);
      sound.tone(520, 0.14, 'sawtooth', 0.09);
      sound.tone(1040, 0.22, 'sine', 0.1, 0.08);
    }, 4800);

    // Step 3: Sujeto encontrado.
    setTimeout(() => {
      setPostCredits2Step(3);
      sound.tone(440, 0.16, 'square', 0.12);
      sound.tone(880, 0.35, 'square', 0.14, 0.1);
      sound.playSfx('crystal');
    }, 6800);

    // Step 4: Screen glitches violently + "Auxilio soy yo zion..." + Binary 2099 Kronos City
    setTimeout(() => {
      setPostCredits2Step(4);
      sound.tone(65, 0.6, 'sawtooth', 0.24, 0, 28);
      sound.tone(130, 0.45, 'square', 0.2, 0.05, 45);
      sound.playSfx('laser');
    }, 9000);

    // Step 5: Screen flashes white (Whiteout)
    setTimeout(() => {
      setPhase('whiteout');
      sound.tone(1200, 0.6, 'sine', 0.25, 0, 80);
      sound.playSfx('explosion');

      // Step 6: Transitions to final post-credits scene: El Reloj Marcando la Hora
      setTimeout(() => {
        setPhase('postcredits3');
      }, 1200);
    }, 15200);
  };

  const handleReturnToMenu = () => {
    sound.stopMusic();
    if (onClose) {
      onClose();
    } else {
      onSelectLevel(0);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toggle Mute
  const handleToggleSound = () => {
    if (soundMuted) {
      sound.setMasterVolume(0.5);
      sound.setMusicTrack('creditsTune');
      setSoundMuted(false);
    } else {
      sound.setMasterVolume(0);
      setSoundMuted(true);
    }
  };

  // Hidden interaction: clicking on 'Grupo Bassify' triggers distorted synth & glitch animation
  const handleBassifyClick = () => {
    // 1. Play distorted dark synth sound effect reflecting the post-credits tone
    sound.tone(52, 0.45, 'sawtooth', 0.22, 0, 24);
    sound.tone(115, 0.32, 'square', 0.16, 0.03, 40);
    sound.tone(580, 0.18, 'sawtooth', 0.12, 0.01, 95);
    sound.playSfx('stone');

    // 2. Trigger mysterious glitch effect
    if (glitchTimeoutRef.current) {
      clearTimeout(glitchTimeoutRef.current);
    }
    setBassifyClickCount((prev) => prev + 1);
    setBassifyGlitch(true);

    glitchTimeoutRef.current = window.setTimeout(() => {
      setBassifyGlitch(false);
    }, 1200);
  };

  // ---------------------------------------------------------------------------
  // PHASE 2A: PRIMERA ESCENA POSCRÉDITOS (EL DESPERTAR DE LOS OJOS ROJOS)
  // ---------------------------------------------------------------------------
  if (phase === 'postcredits1') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden select-none">
        {/* Cinematic Letterbox Aspect Ratio Container */}
        <div className="relative w-full max-w-4xl h-full max-h-[85vh] flex flex-col items-center justify-center p-4">
          
          {/* Background: Shattered Dark Citadel Chamber */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={bgKronoMidnight}
              alt="Sector Omega Ruins"
              className={`w-full h-full object-cover transition-opacity duration-1000 ${
                postCreditsStep >= 5 ? 'opacity-0' : 'opacity-25 filter grayscale contrast-150'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/95" />
          </div>

          {/* Vignette Shadow Bars (Cinema Style) */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-black z-30 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-black z-30 pointer-events-none" />

          {/* Fallen Titan Chassis / Broken Final Boss Armor */}
          <div className="relative z-10 w-full max-w-md flex flex-col items-center">
            
            {/* Location Subtitle Stamp */}
            <div
              className={`mb-6 text-center transition-opacity duration-1000 ${
                postCreditsStep >= 1 && postCreditsStep < 5 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span className="text-[11px] font-mono tracking-widest text-rose-500/80 uppercase">
                [ REGISTRO TEMPORAL · SECTOR OMEGA ]
              </span>
              <p className="text-sm font-mono text-slate-400 mt-1">
                Ruinas de la Cúspide Cuántica · 15 Minutos Después de la Batalla
              </p>
            </div>

            {/* Fallen Guardian Silhouette Frame */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex items-center justify-center">
              
              {/* Damaged Boss Silhouette */}
              <img
                src={kronoBossImg}
                alt="Fallen Titan Chassis"
                className={`w-full h-full object-cover transition-all duration-1000 ${
                  postCreditsStep >= 3
                    ? 'filter brightness-50 contrast-125 saturate-50'
                    : 'filter brightness-30 contrast-150 grayscale'
                }`}
              />

              {/* Dark Smoke / Rift Energy Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black via-rose-950/30 to-black/80 transition-opacity duration-1000 ${
                  postCreditsStep >= 2 ? 'opacity-90' : 'opacity-40'
                }`}
              />

              {/* Crackling Dimensional Distortion Sparks */}
              {postCreditsStep >= 2 && postCreditsStep < 5 && (
                <div className="absolute inset-0 pointer-events-none animate-pulse">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-600/10 rounded-full blur-2xl animate-ping" />
                  <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" />
                  <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                </div>
              )}

              {/* ========================================================================= */}
              {/* THE TWO GLOWING RED EYES (OJOS ROJOS QUE SE ILUMINAN DESDE EL INTERIOR) */}
              {/* ========================================================================= */}
              {postCreditsStep >= 3 && postCreditsStep < 5 && (
                <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-7 pointer-events-none">
                  {/* Left Red Eye */}
                  <div className="relative flex items-center justify-center">
                    {/* Intense Outer Flare */}
                    <div className="absolute w-12 h-12 bg-red-600/80 rounded-full blur-md animate-pulse" />
                    <div className="absolute w-20 h-20 bg-red-500/40 rounded-full blur-xl animate-ping" />
                    {/* Eye Core */}
                    <div className="relative w-5 h-2.5 bg-white rounded-[50%/20%] shadow-[0_0_18px_#ff0033] rotate-[-8deg] border border-red-500" />
                  </div>

                  {/* Right Red Eye */}
                  <div className="relative flex items-center justify-center">
                    {/* Intense Outer Flare */}
                    <div className="absolute w-12 h-12 bg-red-600/80 rounded-full blur-md animate-pulse" />
                    <div className="absolute w-20 h-20 bg-red-500/40 rounded-full blur-xl animate-ping" />
                    {/* Eye Core */}
                    <div className="relative w-5 h-2.5 bg-white rounded-[50%/20%] shadow-[0_0_18px_#ff0033] rotate-[8deg] border border-red-500" />
                  </div>
                </div>
              )}

              {/* Retro Scanline Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.7) 3px, rgba(0, 0, 0, 0.7) 4px)',
                }}
              />
            </div>

            {/* Ominous Dialogue / Narrative Reveal */}
            <div className="mt-6 h-16 flex items-center justify-center text-center px-4">
              {postCreditsStep === 2 && (
                <span className="text-xs font-mono text-rose-400/90 tracking-widest animate-pulse">
                  * CRUJIDO METÁLICO Y PULSOS DE ENERGÍA OSCURA *
                </span>
              )}
              {postCreditsStep >= 3 && postCreditsStep < 5 && (
                <div className="flex flex-col items-center gap-1.5 animate-fadeIn">
                  <span className="text-base sm:text-lg font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                    «...¿CREÍSTE QUE HABÍAS GANADO, ZION?...»
                  </span>
                  <p className="text-xs font-mono text-slate-400 tracking-wider">
                    «...Esto apenas acaba de comenzar.»
                  </p>
                </div>
              )}
            </div>

            {/* Skip Button for quick transition to second scene */}
            <button
              onClick={() => triggerSecondPostCredits()}
              className="mt-4 text-[10px] font-mono text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              <span>[ SALTAR A TERMINAL VERDE ➔ ]</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PHASE 2B: SEGUNDA ESCENA POSCRÉDITOS (HACKER TERMINAL VERDE & TRANSMISIÓN DE ZION)
  // ---------------------------------------------------------------------------
  if (phase === 'postcredits2') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden select-none font-mono">
        {/* Phosphor CRT Terminal Green Glow & Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/50 via-black to-black pointer-events-none" />

        {/* CRT Scanline & Curved Glass Screen Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 z-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16, 185, 129, 0.7) 3px, rgba(16, 185, 129, 0.7) 4px)',
          }}
        />

        {/* Terminal Container Box */}
        <div
          className={`relative z-20 w-full max-w-3xl h-[82vh] bg-slate-950/95 border-2 ${
            postCredits2Step >= 4
              ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.6)] animate-pulse'
              : 'border-emerald-500/80 shadow-[0_0_60px_rgba(16,185,129,0.35)]'
          } rounded-3xl p-5 sm:p-8 flex flex-col justify-between overflow-hidden`}
        >
          {/* Top Terminal Status Header */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/40 text-emerald-400 text-xs tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>TERMINAL DE INTERCEPCIÓN CUÁNTICA // V2.099</span>
            </div>
            <div className="text-[10px] text-emerald-500/80">
              CANAL: SECTOR OMEGA · FRECUENCIA 1420.405 MHz
            </div>
          </div>

          {/* Center Screen: Streaming Hacker Code and Messages */}
          <div className="flex-1 my-4 overflow-hidden flex flex-col justify-end space-y-2 text-xs sm:text-sm">
            {/* Cascading Hacker Code Lines */}
            <div className="text-emerald-500/70 text-[11px] sm:text-xs leading-relaxed space-y-0.5 opacity-80 select-none">
              <div>&gt; [0x0001] KERNEL_ATTACH // BYPASSING TEMPORAL FIREWALL... [OK]</div>
              <div>&gt; [0x0002] INJECTING PROBE TO CONTINUUM RELAY (EPOCH: 2099)...</div>
              <div>&gt; [0x0003] DECODING FREQUENCY ENVELOPE (TARGET_ID: &quot;ZION&quot;)...</div>
              <div>&gt; [0x0004] SCANNING SUB-ROUTINE CHRONO-CORE MATRIX [65,536 BYTES]...</div>
              <div>&gt; [0x0005] MEMORY ADDR: 0x7FFE049A · TELEMETRY SINK ACTIVE</div>
            </div>

            {/* Step 1: Mandando mensaje de llamado... */}
            {postCredits2Step >= 1 && (
              <div className="pt-2 text-emerald-300 font-bold text-sm sm:text-base flex items-center gap-2 animate-fadeIn">
                <span className="text-emerald-500">&gt;&gt;</span>
                <span>MANDANDO MENSAJE DE LLAMADO...</span>
                <span className="w-2 h-4 bg-emerald-400 animate-pulse ml-1 inline-block" />
              </div>
            )}

            {/* Step 2: Mensaje recibido. */}
            {postCredits2Step >= 2 && (
              <div className="text-cyan-300 font-bold text-sm sm:text-base flex items-center gap-2 animate-fadeIn">
                <span className="text-cyan-500">&gt;&gt;</span>
                <span>[OK] MENSAJE RECIBIDO.</span>
              </div>
            )}

            {/* Step 3: Sujeto encontrado. */}
            {postCredits2Step >= 3 && (
              <div className="text-yellow-300 font-black text-sm sm:text-lg flex items-center gap-2 animate-fadeIn">
                <span className="text-yellow-400">&gt;&gt;&gt;</span>
                <span>SUJETO ENCONTRADO.</span>
              </div>
            )}

            {/* Step 4: Screen Glitch + Distress Signal + Encrypted Binary Date */}
            {postCredits2Step >= 4 && (
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-black/95 border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.7)] text-center space-y-3 animate-pulse">
                {/* Glitch Warning Alert */}
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-[10px] font-black uppercase tracking-widest">
                  ⚠️ TRANSMISIÓN DE EMERGENCIA INTERCEPTADA ⚠️
                </div>

                {/* THE DISTRESS MESSAGE FROM USER BRIEF */}
                <div className="text-lg sm:text-2xl font-black text-red-400 tracking-wider drop-shadow-[0_0_15px_rgba(239,68,68,0.9)] uppercase">
                  « AUXILIO, SOY YO ZION, ESTOY EN PELIGRO »
                </div>

                {/* ENCRYPTED BINARY CODE (MYSTERY / INTRIGUE ONLY - WITHOUT REVEALING THE SECRET) */}
                <div className="pt-2 border-t border-red-500/40 text-xs sm:text-sm font-bold text-amber-300 space-y-1.5">
                  <div className="tracking-widest text-red-400 text-[10px] uppercase font-mono">
                    COORDENADA TEMPORAL ENCRIPTADA:
                  </div>
                  <div className="text-lg sm:text-2xl font-black tracking-widest font-mono text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-200 to-red-400 drop-shadow-[0_0_14px_rgba(239,68,68,0.9)] animate-pulse">
                    0010 0000 1001 1001
                  </div>
                  <div className="text-[10px] text-red-400/80 font-mono tracking-widest uppercase">
                    [ SECUENCIA BINARIA CLASIFICADA · EL TIEMPO SE AGOTA ]
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Terminal Footer */}
          <div className="pt-3 border-t border-emerald-500/40 flex items-center justify-between text-[11px] text-emerald-400/80">
            <span>SEÑAL EN TIEMPO REAL: KRONOS-NET</span>
            <button
              onClick={() => {
                setPhase('postcredits3');
              }}
              className="text-[10px] text-slate-500 hover:text-emerald-300 transition-colors uppercase tracking-widest"
            >
              [ SALTAR AL RELOJ ➔ ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PHASE 2C: WHITEOUT (LA PANTALLA SE PONE EN BLANCO Y TRANSICIONA AL RELOJ)
  // ---------------------------------------------------------------------------
  if (phase === 'whiteout') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center transition-all duration-700 select-none animate-pulse">
        <div className="text-slate-900 font-mono text-sm tracking-widest font-black uppercase opacity-20">
          [ CONEXIÓN TERMINADA ]
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PHASE 2D: TERCERA Y ÚLTIMA ESCENA POSCRÉDITOS (EL RELOJ MARCANDO LA HORA)
  // ---------------------------------------------------------------------------
  if (phase === 'postcredits3') {
    // Current second needle angle (0 to 360 deg)
    const secondAngle = ((clockSeconds % 60) / 60) * 360;
    // Minute needle angle (approaching 0 / 12)
    const minuteProgress = Math.min(60, clockSeconds) / 60;
    const minuteAngle = 354 + minuteProgress * 6; // from 354deg to 360deg
    // Hour needle angle (pointing towards 12)
    const hourAngle = 358.5 + (minuteProgress / 60) * 1.5;

    const formattedTime = `11:59:${clockSeconds < 10 ? '0' : ''}${clockSeconds >= 60 ? '00' : clockSeconds}`;

    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden select-none">
        {/* Inline Keyframes for smooth, lightweight, GPU-accelerated pendulum swing */}
        <style>{`
          @keyframes smoothPendulum {
            0% { transform: rotate(-8deg); }
            100% { transform: rotate(8deg); }
          }
        `}</style>

        {/* Ambient Overhead Light (Lightweight CSS, no lag on mobile) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-slate-950/70 via-black to-black pointer-events-none" />

        {/* Cinematic Vignette */}
        <div className="absolute top-0 left-0 right-0 h-10 sm:h-16 bg-black z-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-16 bg-black z-30 pointer-events-none" />

        <div className="relative z-20 flex flex-col items-center justify-center max-w-lg w-full max-h-[85vh]">
          
          {/* Header Subtitle */}
          <div className="mb-2 sm:mb-4 text-center">
            <span className="text-[10px] font-mono tracking-[0.3em] text-amber-500/80 uppercase">
              [ CONTINUO TEMPORAL ]
            </span>
            <p className="text-[10px] sm:text-xs font-mono text-slate-400 mt-0.5 tracking-widest">
              El tic-tac incesante del multiverso
            </p>
          </div>

          {/* Grand Mechanical Clock Component (Fluidly responsive on mobile) */}
          <div className="relative w-48 h-64 sm:w-64 sm:h-76 flex flex-col items-center justify-start shrink-0">
            
            {/* Clock Face SVG */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full shadow-[0_0_35px_rgba(245,158,11,0.25)] border-3 sm:border-4 border-amber-600/70 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-1.5 sm:p-2 flex items-center justify-center">
              
              <svg className="w-full h-full" viewBox="0 0 200 200">
                {/* Dial background circle */}
                <circle cx="100" cy="100" r="95" fill="#030712" stroke="#d97706" strokeWidth="2.5" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="#78350f" strokeWidth="1" strokeDasharray="2,4" />
                <circle cx="100" cy="100" r="76" fill="none" stroke="#b45309" strokeWidth="0.75" opacity="0.6" />

                {/* Minute & Hour Tick Marks */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = 100 + Math.sin(angle) * 82;
                  const y1 = 100 - Math.cos(angle) * 82;
                  const x2 = 100 + Math.sin(angle) * 88;
                  const y2 = 100 - Math.cos(angle) * 88;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={i % 3 === 0 ? '#f59e0b' : '#92400e'}
                      strokeWidth={i % 3 === 0 ? 2.5 : 1.2}
                    />
                  );
                })}

                {/* Roman Numerals */}
                <text x="100" y="32" textAnchor="middle" fill="#fbbf24" fontSize="13" fontFamily="serif" fontWeight="bold">XII</text>
                <text x="170" y="105" textAnchor="middle" fill="#fbbf24" fontSize="13" fontFamily="serif" fontWeight="bold">III</text>
                <text x="100" y="178" textAnchor="middle" fill="#fbbf24" fontSize="13" fontFamily="serif" fontWeight="bold">VI</text>
                <text x="30" y="105" textAnchor="middle" fill="#fbbf24" fontSize="13" fontFamily="serif" fontWeight="bold">IX</text>

                {/* Inner Decorative Gears Silhouette */}
                <circle cx="100" cy="100" r="38" fill="none" stroke="#451a03" strokeWidth="5" strokeDasharray="5,5" opacity="0.45" />
                <circle cx="100" cy="100" r="24" fill="none" stroke="#78350f" strokeWidth="2.5" opacity="0.4" />

                {/* HOUR HAND */}
                <g style={{ transformOrigin: '100px 100px', transform: `rotate(${hourAngle}deg)`, transition: 'transform 0.3s ease-out' }}>
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="56"
                    stroke="#fbbf24"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* MINUTE HAND */}
                <g style={{ transformOrigin: '100px 100px', transform: `rotate(${minuteAngle}deg)`, transition: 'transform 0.3s ease-out' }}>
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="36"
                    stroke="#fef3c7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* SECOND HAND (Snappy mechanical tick with lightweight hardware transform) */}
                <g
                  style={{
                    transformOrigin: '100px 100px',
                    transform: `rotate(${secondAngle}deg)`,
                    transition: 'transform 0.16s cubic-bezier(0.2, 1.8, 0.4, 1)',
                  }}
                >
                  <line
                    x1="100"
                    y1="114"
                    x2="100"
                    y2="24"
                    stroke="#ef4444"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="100" r="3.5" fill="#ef4444" />
                </g>

                {/* Center Pin Cap */}
                <circle cx="100" cy="100" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
                <circle cx="100" cy="100" r="1.8" fill="#18181b" />
              </svg>
            </div>

            {/* Swinging Brass Pendulum underneath (Lightweight, natural organic momentum) */}
            <div className="w-10 sm:w-12 h-14 sm:h-16 flex flex-col items-center -mt-1 pointer-events-none">
              <div
                className="w-1 bg-gradient-to-b from-amber-700 to-amber-500 h-10 sm:h-12 origin-top"
                style={{
                  animation: 'smoothPendulum 1s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate',
                  transformOrigin: 'top center',
                  willChange: 'transform',
                }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 border-2 border-amber-300/80 shadow-[0_0_10px_rgba(245,158,11,0.4)] -ml-1.5 sm:-ml-2 mt-7 sm:mt-9" />
              </div>
            </div>
          </div>

          {/* Time Display & Suspense Subtitle */}
          <div className="mt-2.5 flex flex-col items-center gap-1.5 sm:gap-2 text-center">
            {/* Digital Clock readout */}
            <div className="px-3.5 py-1 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-300 font-mono text-base sm:text-xl font-black tracking-widest shadow-inner flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse" />
              <span>{clockSeconds >= 60 ? '12:00:00' : formattedTime}</span>
            </div>

            {/* Dramatic tick-tock words / Midnight strike */}
            {clockSeconds < 60 ? (
              <p className="text-xs sm:text-sm font-mono tracking-widest text-slate-300 font-bold uppercase animate-pulse">
                {clockSeconds % 2 === 0 ? 'TIC...' : '...TOC'}
              </p>
            ) : (
              <div className="space-y-1 animate-fadeIn">
                <p className="text-sm sm:text-lg font-mono font-black text-amber-300 tracking-wider drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] uppercase">
                  « LA HORA HA LLEGADO. »
                </p>
                <p className="text-[11px] sm:text-xs font-mono text-slate-400">
                  El reloj del destino nunca se detiene.
                </p>
              </div>
            )}
          </div>

          {/* Skip Button */}
          <button
            onClick={() => setPhase('completion')}
            className="mt-3 sm:mt-5 px-3 py-1 rounded-lg text-[10px] font-mono text-slate-500 hover:text-amber-300 transition-colors uppercase tracking-widest cursor-pointer"
          >
            [ CONTINUAR ]
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PHASE 3: FINAL DE CRÉDITOS Y RESOLUCIÓN
  // (Con mensaje especial si completó el juego vs si se vio desde el menú)
  // ---------------------------------------------------------------------------
  if (phase === 'completion') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
        {/* Atmospheric Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg bg-slate-900/95 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] flex flex-col items-center text-center">
          
          {/* Golden Badge or Mystery Badge */}
          {isGameCompleted ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/60 mb-4 animate-bounce">
                <Trophy className="w-8 h-8 text-amber-300" />
              </div>

              {/* THE REQUESTED VICTORY PHRASE */}
              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 font-heading tracking-tight leading-tight">
                ¡FELICIDADES, HAS COMPLETADO ZION ADVENTURE!
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
                Has salvado el multiverso y restaurado los engranajes del tiempo. Todas las 12 dimensiones y sus guardianes han sido superados.
              </p>

              {/* Adventure Summary Stats */}
              <div className="grid grid-cols-3 gap-2 w-full mt-5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Puntos</span>
                  <p className="text-sm font-black text-cyan-300 font-mono mt-0.5">
                    {stats.score.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Tiempo</span>
                  <p className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                    {formatTime(stats.elapsedTime)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Enemigos</span>
                  <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                    {stats.enemiesDefeated}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Viewed from Main Menu */}
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-lg mb-4">
                <Sparkles className="w-7 h-7 text-cyan-300" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 font-heading tracking-tight">
                ZION ADVENTURE
              </h2>

              <p className="text-sm text-cyan-300/90 font-mono font-bold tracking-widest mt-1 uppercase">
                « CONTINUARÁ... »
              </p>

              <p className="text-xs text-slate-400 mt-2 max-w-sm">
                Las sombras del Sector Omega han despertado. Completa todas las eras de la campaña para reclamar tu victoria definitiva.
              </p>
            </>
          )}

          {/* DMN Studio Logo Stamp */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 w-full flex items-center justify-center gap-3">
            <img
              src={dmnLogoImg}
              alt="DMN Studio"
              className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40 shadow-sm"
            />
            <div className="text-left">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Desarrollado por</span>
              <span className="text-xs font-bold text-white font-heading tracking-wider">DMN & AI Co-Developer</span>
            </div>
          </div>

          {/* Return to Main Menu Button */}
          <button
            onClick={handleReturnToMenu}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-cyan-900/40 active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>VOLVER AL MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PHASE 1: SONIC & MOVIE CINEMATIC SCROLLING CREDITS
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden select-none">
      
      {/* Top Floating Control Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-cyan-300 font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>CRÉDITOS FINALES</span>
          </div>

          {/* Audio Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Mute / Unmute"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>

        {/* Playback Controls (Pause / Speed / Skip to Post-Credits) */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1 transition-all"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-green-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isPaused ? 'Reanudar' : 'Pausar'}</span>
          </button>

          {/* Speed Toggle (1x, 2x, 4x) */}
          <button
            onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2.5 : prev === 2.5 ? 5 : 1))}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1 transition-all"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{speedMultiplier}x</span>
          </button>

          {/* Skip to Post-Credits Button */}
          <button
            onClick={triggerPostCredits}
            className="px-3 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <span>POSCRÉDITOS ⚔️</span>
          </button>
        </div>
      </div>

      {/* Progress Bar along the top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 z-40">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 transition-all duration-100"
          style={{ width: `${Math.round(scrollProgress * 100)}%` }}
        />
      </div>

      {/* Main Cinematic Viewport */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* Background Starfield & Dimensional Vortex (Sonic Style) */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black" />
          {/* Retro Grid Floor */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d410_1px,transparent_1px),linear-gradient(to_bottom,#06b6d410_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        {/* Cinematic Vignette Shadows */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black via-black/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none" />

        {/* Continuous Movie Scrolling Container */}
        <div
          ref={scrollRef}
          className="w-full h-full overflow-y-scroll scrollbar-none flex flex-col items-center pointer-events-auto cursor-ns-resize"
          style={{ scrollBehavior: 'auto' }}
        >
          {/* Top Spacing to start below viewport */}
          <div className="h-[75vh] shrink-0" />

          {/* Credits Crawl Content */}
          <div className="w-full max-w-xl flex flex-col items-center text-center px-4 space-y-16">
            
            {/* 1. Main Title Card */}
            <div className="space-y-3">
              <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                <img src={zionSplashImg} alt="Zion" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                ZION ADVENTURE
              </h1>
              <p className="text-xs sm:text-sm font-mono text-cyan-400 tracking-widest uppercase">
                LA LEYENDA DEL CONTINUO ESPACIO-TIEMPO
              </p>
            </div>

            {/* 2. THE TWO DEVELOPERS AS EXPLICITLY REQUESTED */}
            <div className="space-y-12 w-full">
              
              {/* DEVELOPER 1: DMN (CREADOR Y TODO LO DEMÁS) */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border-2 border-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.25)] space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md">
                  <img src={dmnLogoImg} alt="DMN" className="w-full h-full object-cover" />
                </div>

                <div>
                  <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                    CREADOR, DIRECCIÓN GENERAL Y TODO LO DEMÁS
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 font-heading tracking-wide mt-1">
                    DMN
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2 border-t border-slate-800 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-amber-400 uppercase block">Diseño de Juego</span>
                    <span className="text-slate-200 font-medium">DMN</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-amber-400 uppercase block">Diseño de Niveles & Eras</span>
                    <span className="text-slate-200 font-medium">DMN</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-amber-400 uppercase block">Dirección Artística & Lore</span>
                    <span className="text-slate-200 font-medium">DMN</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-amber-400 uppercase block">Concepto Musical & Sonoro</span>
                    <span className="text-slate-200 font-medium">DMN</span>
                  </div>
                </div>
              </div>

              {/* DEVELOPER 2: AI CO-DEVELOPER (PARTE TÉCNICA) */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border-2 border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.25)] space-y-4">
                <div>
                  <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                    DIRECCIÓN TÉCNICA Y ARQUITECTURA DE SOFTWARE
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-400 font-heading tracking-wide mt-1">
                    AI Co-Developer (Parte Técnica)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2 border-t border-slate-800 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block">Motor de Físicas & Combate</span>
                    <span className="text-slate-200 font-medium">Parte Técnica</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block">Motor de Audio Web 32-Bit</span>
                    <span className="text-slate-200 font-medium">Parte Técnica</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block">Inteligencia Artificial de Jefes</span>
                    <span className="text-slate-200 font-medium">Parte Técnica</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase block">Renderizado & Canvas 60 FPS</span>
                    <span className="text-slate-200 font-medium">Parte Técnica</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MULTIVERSE WORLDS CRAWL (Sonic Style Realm Reel) */}
            <div className="space-y-6 pt-6">
              <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold">
                LAS 12 ERAS Y BIOMAS DEL MULTIVERSO
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-500/30 text-cyan-300">
                  01. Bosque Neón
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-pink-500/30 text-pink-300">
                  02. Cerezo Espiritual
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-orange-500/30 text-orange-300">
                  03. Acantilados Lava
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 text-amber-300">
                  04. Desierto Egipcio
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-500/30 text-cyan-300">
                  05. Krono City
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/30 text-emerald-300">
                  06. Jungle Run
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-sky-500/30 text-sky-300">
                  07. Blizzard Rush
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 text-amber-300">
                  08. Steampunk
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-500/30 text-slate-300">
                  09. Castle Smash
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-yellow-500/30 text-yellow-300">
                  10. Pirate Treasure
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-lime-500/30 text-lime-300">
                  11. Valle Jurásico
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-indigo-500/30 text-indigo-300">
                  12. La Luna
                </div>
              </div>
            </div>

            {/* 4. SUPER MEGA THANKS CARD (HIDDEN INTERACTION: DISTORTED SYNTH & MYSTERIOUS GLITCH) */}
            <div
              onClick={handleBassifyClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleBassifyClick();
                }
              }}
              title="Haz clic para sintonizar la frecuencia..."
              className={`w-full p-6 sm:p-7 rounded-3xl transition-all duration-150 cursor-pointer select-none relative overflow-hidden ${
                bassifyGlitch
                  ? 'bg-gradient-to-r from-red-950 via-black to-red-950 border-2 border-red-500 shadow-[0_0_55px_rgba(239,68,68,0.85)] scale-[1.025] -rotate-[0.6deg]'
                  : 'bg-gradient-to-r from-amber-950/90 via-purple-950/80 to-cyan-950/90 border-2 border-amber-400 hover:border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.35)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] active:scale-98'
              } space-y-3`}
            >
              {/* Glitch CRT Scanlines & Dimensional Interference Overlay */}
              {bassifyGlitch && (
                <>
                  <div
                    className="absolute inset-0 pointer-events-none opacity-45 z-20"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 50, 0.8) 3px, rgba(255, 0, 50, 0.8) 4px)',
                    }}
                  />
                  {/* Glowing Red Eyes hint reflecting the mysterious post-credits scene */}
                  <div className="absolute top-3 right-4 z-20 flex items-center gap-2 pointer-events-none animate-pulse">
                    <span className="w-2.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_#ff0033]" />
                    <span className="w-2.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_#ff0033]" />
                  </div>
                  <div className="absolute bottom-2 left-4 z-20 text-[9px] font-mono text-red-400 tracking-widest uppercase animate-pulse">
                    [ ANOMALÍA DETECTADA · SECTOR OMEGA ]
                  </div>
                </>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-black tracking-widest uppercase shadow-md animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{bassifyGlitch ? '⚠️ SEÑAL DISTORSIONADA ⚠️' : 'SUPER MEGA THANKS'}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>

              <h3
                className={`text-3xl sm:text-5xl font-black font-heading tracking-wide transition-all ${
                  bassifyGlitch
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-200 to-red-600 drop-shadow-[0_0_24px_rgba(239,68,68,0.95)] animate-pulse'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.65)]'
                }`}
              >
                {bassifyGlitch ? '“GRUPO BASSIFY”' : '“Grupo Bassify”'}
              </h3>

              <p
                className={`text-xs sm:text-sm font-mono max-w-md mx-auto leading-relaxed transition-all ${
                  bassifyGlitch
                    ? 'text-red-400 font-bold tracking-wider animate-fadeIn'
                    : 'text-amber-200/90'
                }`}
              >
                {bassifyGlitch
                  ? '«...EL BAJO HA DESPERTADO ALGO EN LAS SOMBRAS...»'
                  : 'Por la energía colosal, el bajo demoledor y el apoyo incondicional en el multiverso de Zion.'}
              </p>
            </div>

            {/* 5. SPECIAL THANKS PERSONS LIST */}
            <div className="w-full space-y-4 pt-2">
              <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase font-black flex items-center justify-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-cyan-400" /> SPECIAL THANKS
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Zeker', tag: 'Aliado Dimensional' },
                  { name: 'Dugomen', tag: 'Guardián del Nexo' },
                  { name: 'EM', tag: 'Fuerza Temporal' },
                  { name: 'F5xys', tag: 'Estratega de Combate' },
                  { name: 'EGzzG', tag: 'Espíritu Guerrero' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-lg flex flex-col items-center justify-center text-center group hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                  >
                    <span className="text-base sm:text-lg font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                      “{item.name}”
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-widest mt-0.5">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. QA & TESTERS ANÓNIMOS */}
            <div className="w-full p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> CONTROL DE CALIDAD Y PLAYTESTING
              </span>
              <h4 className="text-lg sm:text-xl font-black text-slate-200 font-heading">
                AGRADECIMIENTO A NUESTROS TESTERS
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Gracias también a mis testers por colaborar en pulir los niveles, probar el balance de los jefes y detectar bugs en cada era del multiverso (colaboradores anónimos).
              </p>
              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-cyan-400/70">
                <span>[ PROTOCOLO DE TESTEO ANÓNIMO COMPLETADO ]</span>
              </div>
            </div>

            {/* 7. EASTER EGG CLUE: "ALGO RARO AL FINAL DE LOS CRÉDITOS" CON LA CONTRASEÑA */}
            <div className="w-full p-4 sm:p-5 rounded-2xl bg-black/95 border-2 border-emerald-500/70 shadow-[0_0_35px_rgba(16,185,129,0.35)] text-left font-mono relative overflow-hidden select-text">
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase tracking-widest pb-1.5 border-b border-emerald-500/30">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  [ ANOMALÍA DETECTADA EN EL NEXO TEMPORAL ]
                </span>
                <span className="text-amber-400 animate-pulse font-mono">#0x2099-ENC</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-300 font-bold mt-2 tracking-wide leading-relaxed">
                &gt; TRANSMISIÓN RESIDUAL ENCRIPTADA: <span className="text-amber-300 font-black tracking-widest bg-emerald-950 px-2.5 py-0.5 rounded border border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.5)]">Kr0n0s-M@ster</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 italic">
                «¿Qué significa esta extraña clave?... Tal vez alguien en el menú de logros conozca su propósito.»
              </p>
            </div>

            {/* 8. Special Thanks Card to Players */}
            <div className="space-y-3 pt-6 pb-12">
              <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                A LA COMUNIDAD
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                A TODOS LOS JUGADORES DE ZION ADVENTURE
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Gracias por saltar entre dimensiones, empuñar la espada temporal y desafiar cada peligro del multiverso.
              </p>
              <div className="text-[10px] font-mono text-cyan-400/80 pt-4">
                © 2026 DMN STUDIO · TODOS LOS DERECHOS RESERVADOS
              </div>
            </div>

            {/* Bottom Spacer before triggering Post-Credits automatically */}
            <div className="h-[50vh] shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
