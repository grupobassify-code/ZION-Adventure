/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, GameInputState } from './game/gameEngine';
import { GameRenderer } from './game/renderer';
import { GAME_HEIGHT, GAME_WIDTH } from './game/constants';
import { sound } from './audio/soundEngine';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { DialogModal } from './components/DialogModal';
import { VictoryModal } from './components/VictoryModal';
import { PauseModal } from './components/PauseModal';
import { CreditsModal } from './components/CreditsModal';
import { MainMenu } from './components/MainMenu';
import { ScreenTransition } from './components/ScreenTransition';
import { LevelIntroBanner } from './components/LevelIntroBanner';
import { TutorialPopup } from './components/TutorialPopup';
import { OnlyUpResultsModal } from './components/OnlyUpResultsModal';
import { LEVEL_CONFIGS } from './game/levelData';
import { recordLevelCompletion, recordCheckpointSave, getActiveSaveSlot, setActiveSlotId } from './game/saveManager';
import { lockLandscapeOrientation, requestFullscreenAndLockLandscape } from './utils/orientation';
import { initPreventZoom } from './utils/preventZoom';
import { RotatePrompt } from './components/RotatePrompt';
import { ZoneId } from './types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  const inputsRef = useRef<GameInputState>({
    left: false,
    right: false,
    jump: false,
    dagger: false,
    attack: false,
    block: false,
    dash: false,
    special: false,
    analogX: 0,
  });

  const [, setRenderTick] = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [inMainMenu, setInMainMenu] = useState(true);
  const [mainMenuView, setMainMenuView] = useState<'title' | 'slots' | 'zones' | 'acts' | 'controls'>('title');
  const [mainMenuZone, setMainMenuZone] = useState<ZoneId | null>(null);
  const [activeSlotId, setActiveSlotIdState] = useState<number>(0);
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
  });
  const [promptDismissed, setPromptDismissed] = useState(false);

  // Transition & Intro Banner State
  const [transitionActive, setTransitionActive] = useState(false);
  const [showLevelIntro, setShowLevelIntro] = useState(false);
  const [targetLevelIndex, setTargetLevelIndex] = useState<number>(0);

  // Initialize Game Engine once
  if (!engineRef.current) {
    engineRef.current = new GameEngine(0);
  }

  const engine = engineRef.current;

  // Level Transition Trigger with Screen Wipe Curtain Animation
  const triggerLevelTransition = useCallback((nextLevelIndex: number, showLore = true) => {
    sound.playSfx('dash');
    setTargetLevelIndex(nextLevelIndex);
    setTransitionActive(true);

    setTimeout(() => {
      engine.loadLevel(nextLevelIndex, showLore);
      setShowLevelIntro(true);
      setRenderTick((t) => (t + 1) % 100000);
    }, 650);

    setTimeout(() => {
      setTransitionActive(false);
    }, 1350);
  }, [engine]);

  // Set up save persistence when a level is completed or checkpoint reached
  useEffect(() => {
    engine.onLevelComplete = () => {
      const slot = getActiveSaveSlot();
      if (slot) {
        recordLevelCompletion(
          slot.id,
          engine.levelIndex,
          {
            score: engine.stats.score,
            crystals: engine.stats.crystalsCollected,
            secrets: engine.stats.secretsFound,
            deaths: engine.stats.deaths,
            time: engine.stats.elapsedTime,
          },
          engine.player.level
        );
      }
    };

    engine.onCheckpoint = () => {
      const slot = getActiveSaveSlot();
      if (slot) {
        recordCheckpointSave(
          slot.id,
          engine.levelIndex,
          engine.stats.score,
          engine.stats.crystalsCollected,
          engine.player.level
        );
      }
    };
  }, [engine]);

  // Force React UI updates on engine state changes
  useEffect(() => {
    engine.onStateChange = () => {
      setRenderTick((t) => (t + 1) % 100000);
    };
  }, [engine]);

  // Audio activation helper on user interaction
  const unlockAudio = useCallback(() => {
    sound.unlockAudio();
    setAudioUnlocked(true);
    if (engine && !engine.inCutscene && !engine.isPaused && !inMainMenu) {
      engine.syncMusic();
    }
  }, [engine, inMainMenu]);

  // Unlock audio and optionally lock landscape
  const unlockAudioAndLockLandscape = useCallback(() => {
    sound.unlockAudio();
    setAudioUnlocked(true);
    lockLandscapeOrientation();
    if (engine && !engine.inCutscene && !engine.isPaused && !inMainMenu) {
      engine.syncMusic();
    }
  }, [engine, inMainMenu]);

  // Monitor viewport orientation, zoom prevention and landscape lock
  useEffect(() => {
    // Initial attempt to lock landscape and initialize zoom prevention
    lockLandscapeOrientation();
    const cleanupPreventZoom = initPreventZoom();

    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      if (!portrait) {
        setPromptDismissed(false);
      }
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      cleanupPreventZoom();
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Handle Fullscreen with Landscape Lock
  const handleToggleFullscreen = async () => {
    if (containerRef.current) {
      await requestFullscreenAndLockLandscape(containerRef.current);
    }
  };

  const handleStartGameFromMenu = (levelIndex: number, slotId: number) => {
    unlockAudioAndLockLandscape();
    setActiveSlotId(slotId);
    setActiveSlotIdState(slotId);
    setInMainMenu(false);
    setIsCreditsOpen(false);
    triggerLevelTransition(levelIndex, true);
  };

  const handleStartOnlyUpFromMenu = (slotId: number) => {
    unlockAudioAndLockLandscape();
    setActiveSlotId(slotId);
    setActiveSlotIdState(slotId);
    setInMainMenu(false);
    setIsCreditsOpen(false);
    setTransitionActive(true);
    setTimeout(() => {
      engine.startOnlyUpMode(slotId);
      setShowLevelIntro(false);
    }, 280);
    setTimeout(() => {
      setTransitionActive(false);
    }, 950);
  };

  // Comprehensive Keyboard Event Handlers (Movement, Jump, Attack, Block, Dash, Special, Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      unlockAudioAndLockLandscape();

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Movement
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputsRef.current.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputsRef.current.right = true;
      }

      // Jump
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        inputsRef.current.jump = true;
      }

      // Melee Sword Attack Combo
      if (e.code === 'KeyJ' || e.code === 'KeyZ') {
        inputsRef.current.attack = true;
      }

      // Throwing Dagger
      if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'KeyF') {
        inputsRef.current.dagger = true;
      }

      // Shield Defense / Parry
      if (e.code === 'KeyE' || e.code === 'KeyC') {
        inputsRef.current.block = true;
      }

      // Dodge / Dash
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyL') {
        inputsRef.current.dash = true;
      }

      // Special Energy Burst
      if (e.code === 'KeyQ' || e.code === 'KeyV') {
        inputsRef.current.special = true;
      }

      // Dialog advance with Space or Enter
      if (engine.inCutscene && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        engine.advanceCutscene();
      }

      // Pause toggle with 'P' or Escape
      if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        if (engine.inCutscene) {
          engine.skipCutscene();
        } else {
          engine.togglePause();
        }
      }

      // Quick Restart with Key R
      if (e.code === 'KeyR' && !engine.inCutscene) {
        triggerLevelTransition(engine.levelIndex, false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputsRef.current.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputsRef.current.right = false;
      }
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        inputsRef.current.jump = false;
      }
      if (e.code === 'KeyJ' || e.code === 'KeyZ') {
        inputsRef.current.attack = false;
      }
      if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'KeyF') {
        inputsRef.current.dagger = false;
      }
      if (e.code === 'KeyE' || e.code === 'KeyC') {
        inputsRef.current.block = false;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyL') {
        inputsRef.current.dash = false;
      }
      if (e.code === 'KeyQ' || e.code === 'KeyV') {
        inputsRef.current.special = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, unlockAudioAndLockLandscape, triggerLevelTransition]);

  // Main Canvas & Game Loop with Fixed-Timestep Physics Accumulator (Cross-Device Consistent 60Hz)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);
    const renderer = rendererRef.current;

    let animId: number;

    // Fixed 60Hz physics timestep (16.6667 ms)
    const FIXED_TIMESTEP = 1000 / 60;
    const MAX_ACCUMULATOR_MS = 100; // Drops spiral of death on background tabs
    const MAX_UPDATES_PER_FRAME = 4; // Max 4 catch-up updates per frame

    let lastTime = performance.now();
    let accumulator = 0;

    // Realtime FPS Measurement
    let frameCount = 0;
    let lastFpsCalc = performance.now();
    let currentFps = 60;

    const loop = (currentTime: number) => {
      let delta = currentTime - lastTime;
      lastTime = currentTime;

      // Clamp delta to safe ranges (handles negative clocks or huge background tab pause spikes)
      if (delta < 0) delta = 0;
      if (delta > MAX_ACCUMULATOR_MS) delta = MAX_ACCUMULATOR_MS;

      accumulator += delta;

      // 1. Run Fixed Simulation Updates at strictly 60Hz
      let updates = 0;
      while (accumulator >= FIXED_TIMESTEP && updates < MAX_UPDATES_PER_FRAME) {
        engine.update(inputsRef.current);
        accumulator -= FIXED_TIMESTEP;
        updates++;
      }

      // If device is struggling or lag spike occurred, flush remainder to avoid slow-motion buffer
      if (accumulator >= FIXED_TIMESTEP) {
        accumulator = 0;
      }

      // FPS Calculation
      frameCount++;
      if (currentTime - lastFpsCalc >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (currentTime - lastFpsCalc));
        frameCount = 0;
        lastFpsCalc = currentTime;
      }

      // 2. Render High-Performance Retro Visual Frame
      renderer.beginFrame(engine.screenShake);
      renderer.render(engine);

      // Render FPS Counter if enabled in settings
      if (engine.settings.showFps) {
        renderer.renderFps(currentFps);
      }

      renderer.endFrame();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engine]);

  const currentZoneColor = LEVEL_CONFIGS[engine.levelIndex]?.themeColor || '#06b6d4';

  return (
    <div
      ref={containerRef}
      id="game-viewport"
      onClick={unlockAudio}
      onTouchStart={unlockAudio}
      className={`relative w-full h-full bg-[#050711] overflow-hidden select-none ${
        isPortrait && !inMainMenu
          ? 'flex flex-col justify-between items-center'
          : 'flex items-center justify-center'
      }`}
    >
      {/* 0. Orientation Landscape Guard Prompt */}
      {isPortrait && !promptDismissed && (
        <RotatePrompt 
          onDismiss={() => setPromptDismissed(true)}
          onPlayVertical={() => setPromptDismissed(true)}
        />
      )}

      {/* Screen Wipe Transition Curtain */}
      <ScreenTransition
        isActive={transitionActive}
        levelIndex={targetLevelIndex}
        zoneColor={currentZoneColor}
      />

      {/* Prettier Level Intro Banner Overlay */}
      {!inMainMenu && !engine.inCutscene && showLevelIntro && (
        <LevelIntroBanner
          levelIndex={engine.levelIndex}
          onDismiss={() => setShowLevelIntro(false)}
        />
      )}

      {/* 1. Main Title & Save Slots & Level Selection Menu */}
      {inMainMenu && (
        <MainMenu
          initialView={mainMenuView}
          initialZone={mainMenuZone}
          onStartGame={handleStartGameFromMenu}
          onStartOnlyUp={handleStartOnlyUpFromMenu}
          onOpenCredits={() => {
            unlockAudio();
            setIsCreditsOpen(true);
          }}
          audioActive={audioUnlocked && engine.settings.soundEnabled}
          onToggleAudio={() => {
            unlockAudio();
            const next = !engine.settings.soundEnabled;
            engine.settings.soundEnabled = next;
            engine.settings.musicEnabled = next;
            sound.soundEnabled = next;
            sound.musicEnabled = next;
            if (next) engine.syncMusic();
            else sound.stopMusic();
            setRenderTick((t) => t + 1);
          }}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Game HUD Overlay */}
      {!inMainMenu && (
        <GameHUD
          engine={engine}
          audioActive={audioUnlocked && engine.settings.soundEnabled}
          isPortrait={isPortrait}
          onToggleOrientation={handleToggleFullscreen}
          onTogglePause={() => engine.togglePause()}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleAudio={() => {
            unlockAudio();
            const next = !engine.settings.soundEnabled;
            engine.settings.soundEnabled = next;
            engine.settings.musicEnabled = next;
            sound.soundEnabled = next;
            sound.musicEnabled = next;
            if (next) engine.syncMusic();
            else sound.stopMusic();
            setRenderTick((t) => t + 1);
          }}
        />
      )}

      {/* Responsive Scaled Pixel Canvas Container */}
      {isPortrait && !inMainMenu ? (
        /* Portrait: Adapt 100% to horizontal pixels of the phone with 16:9 ratio */
        <div className="relative w-full aspect-[16/9] max-h-[48vh] flex items-center justify-center bg-black/60 shadow-2xl shrink-0 overflow-hidden select-none">
          <canvas
            ref={canvasRef}
            id="game-canvas"
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="w-full h-full object-contain image-rendering-pixelated touch-none select-none"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      ) : (
        /* Landscape or Desktop: Centered 16:9 viewport scale */
        <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-[16/9] flex items-center justify-center game-canvas-container select-none">
          <canvas
            ref={canvasRef}
            id="game-canvas"
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="w-full h-full object-contain image-rendering-pixelated shadow-2xl rounded-lg touch-none select-none"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      )}

      {/* On-Screen Mobile Virtual Joystick & Combat Action Buttons */}
      {!inMainMenu && (
        <TouchControls
          isPortrait={isPortrait}
          inputs={inputsRef.current}
          daggersAvailable={engine.daggers}
          energy={engine.player.energy}
          maxEnergy={engine.player.maxEnergy}
          controlMode={engine.settings.controlMode}
          onToggleControlMode={() => {
            const nextMode = engine.settings.controlMode === 'joystick' ? 'dpad' : 'joystick';
            engine.settings.controlMode = nextMode;
            setRenderTick((t) => t + 1);
          }}
          onUpdateInput={(key, val) => {
            unlockAudio();
            inputsRef.current[key] = val;
          }}
          onUpdateAnalogX={(val) => {
            inputsRef.current.analogX = val;
          }}
        />
      )}

      {/* Non-Intrusive Level 1 Controls Tutorial Popup (Never in Only Up mode) */}
      {!inMainMenu && !engine.isPaused && !engine.isLevelWon && !engine.isOnlyUpMode && (
        <TutorialPopup
          levelIndex={engine.levelIndex}
          inCutscene={engine.inCutscene}
        />
      )}

      {/* Narrative Lore Cutscene Screen */}
      {!inMainMenu && engine.inCutscene && (
        <DialogModal
          levelIndex={engine.levelIndex}
          currentPage={engine.currentCutscenePage}
          onAdvance={() => engine.advanceCutscene()}
          onSkip={() => {
            engine.skipCutscene();
            setShowLevelIntro(true);
          }}
        />
      )}

      {/* Victory & Act Complete Modal */}
      {!inMainMenu && engine.isLevelWon && !isCreditsOpen && (
        <VictoryModal
          levelIndex={engine.levelIndex}
          stats={engine.stats}
          onNextLevel={() => {
            const nextLvl = (engine.levelIndex + 1) % LEVEL_CONFIGS.length;
            triggerLevelTransition(nextLvl, true);
          }}
          onReplayLevel={() => {
            triggerLevelTransition(engine.levelIndex, false);
          }}
          onOpenCredits={() => {
            setIsCreditsOpen(true);
          }}
          onReturnToMenu={() => {
            sound.stopMusic();
            const currZone = LEVEL_CONFIGS[engine.levelIndex]?.zone || null;
            setMainMenuView(currZone ? 'acts' : 'zones');
            setMainMenuZone(currZone);
            setInMainMenu(true);
          }}
        />
      )}

      {/* Credits Screen with Creator "Dmn" and "Kronos" Easter Egg */}
      {isCreditsOpen && (
        <CreditsModal
          stats={engine.stats}
          onClose={() => {
            setIsCreditsOpen(false);
            sound.stopMusic();
            setMainMenuView('zones');
            setInMainMenu(true);
          }}
          onRestartGame={() => {
            setIsCreditsOpen(false);
            setInMainMenu(false);
            triggerLevelTransition(0, true);
          }}
          onSelectLevel={(lvlIdx) => {
            setIsCreditsOpen(false);
            setInMainMenu(false);
            triggerLevelTransition(lvlIdx, true);
          }}
        />
      )}

      {/* Only Up Mode Game Over Results Modal */}
      {!inMainMenu && engine.isOnlyUpMode && engine.onlyUpIsGameOver && (
        <OnlyUpResultsModal
          altitude={engine.onlyUpAltitude}
          record={engine.onlyUpRecord}
          timeSurvived={engine.onlyUpTimeSurvived}
          crystals={engine.stats.crystalsCollected}
          score={engine.stats.score}
          isNewRecord={engine.onlyUpNewRecordAchieved}
          onRetry={() => {
            engine.startOnlyUpMode(engine.onlyUpActiveSlotId);
            setRenderTick((t) => t + 1);
          }}
          onReturnToMenu={() => {
            sound.stopMusic();
            setMainMenuView('zones');
            setInMainMenu(true);
          }}
        />
      )}

      {/* Pause Menu Modal (P / ESC) */}
      {!inMainMenu && engine.isPaused && (
        <PauseModal
          levelIndex={engine.levelIndex}
          settings={engine.settings}
          onResume={() => engine.togglePause()}
          onRestart={() => {
            engine.togglePause();
            if (engine.isOnlyUpMode) {
              engine.startOnlyUpMode(engine.onlyUpActiveSlotId);
              setRenderTick((t) => t + 1);
            } else {
              triggerLevelTransition(engine.levelIndex, false);
            }
          }}
          onQuitToTitle={() => {
            engine.togglePause();
            sound.stopMusic();
            const currZone = LEVEL_CONFIGS[engine.levelIndex]?.zone || null;
            setMainMenuView(currZone ? 'acts' : 'zones');
            setMainMenuZone(currZone);
            setInMainMenu(true);
          }}
          onUpdateSettings={(newSet) => {
            Object.assign(engine.settings, newSet);
            if (newSet.soundEnabled !== undefined) sound.soundEnabled = newSet.soundEnabled;
            if (newSet.musicEnabled !== undefined) {
              sound.musicEnabled = newSet.musicEnabled;
              if (newSet.musicEnabled) engine.syncMusic();
              else sound.stopMusic();
            }
            setRenderTick((t) => t + 1);
          }}
        />
      )}
    </div>
  );
}
