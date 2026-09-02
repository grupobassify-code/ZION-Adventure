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
import { LEVEL_CONFIGS } from './game/levelData';
import { recordLevelCompletion, recordCheckpointSave, getActiveSaveSlot, setActiveSlotId } from './game/saveManager';
import { lockLandscapeOrientation, requestFullscreenAndLockLandscape } from './utils/orientation';
import { initPreventZoom } from './utils/preventZoom';
import { RotatePrompt } from './components/RotatePrompt';

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
    }, 450);

    setTimeout(() => {
      setTransitionActive(false);
    }, 950);
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

  // Audio activation & Orientation lock helper on user interaction
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

  // Main Canvas & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);
    const renderer = rendererRef.current;

    let animId: number;

    const loop = () => {
      // 1. Update Game Simulation Logic
      engine.update(inputsRef.current);

      // 2. Render High-Performance Retro Visual Frame
      renderer.beginFrame(engine.screenShake);
      renderer.render(engine);
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
      onClick={unlockAudioAndLockLandscape}
      onTouchStart={unlockAudioAndLockLandscape}
      className="relative w-full h-full bg-[#050711] overflow-hidden flex items-center justify-center select-none touch-none"
    >
      {/* 0. Orientation Landscape Guard Prompt */}
      {isPortrait && !promptDismissed && (
        <RotatePrompt onDismiss={() => setPromptDismissed(true)} />
      )}

      {/* Screen Wipe Transition Curtain */}
      <ScreenTransition
        isActive={transitionActive}
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
          onStartGame={handleStartGameFromMenu}
          onOpenCredits={() => {
            unlockAudioAndLockLandscape();
            setIsCreditsOpen(true);
          }}
          audioActive={audioUnlocked && engine.settings.soundEnabled}
          onToggleAudio={() => {
            unlockAudioAndLockLandscape();
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
          onTogglePause={() => engine.togglePause()}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleAudio={() => {
            unlockAudioAndLockLandscape();
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
      <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-[16/9] flex items-center justify-center game-canvas-container touch-none select-none">
        <canvas
          ref={canvasRef}
          id="game-canvas"
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="w-full h-full object-contain image-rendering-pixelated shadow-2xl rounded-lg touch-none select-none"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* On-Screen Mobile Virtual Joystick & Combat Action Buttons */}
      {!inMainMenu && (
        <TouchControls
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
            unlockAudioAndLockLandscape();
            inputsRef.current[key] = val;
          }}
          onUpdateAnalogX={(val) => {
            inputsRef.current.analogX = val;
          }}
        />
      )}

      {/* Non-Intrusive Level 1 Controls Tutorial Popup */}
      {!inMainMenu && !engine.isPaused && !engine.isLevelWon && (
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

      {/* Pause Menu Modal (P / ESC) */}
      {!inMainMenu && engine.isPaused && (
        <PauseModal
          levelIndex={engine.levelIndex}
          settings={engine.settings}
          onResume={() => engine.togglePause()}
          onRestart={() => {
            engine.togglePause();
            triggerLevelTransition(engine.levelIndex, false);
          }}
          onQuitToTitle={() => {
            engine.togglePause();
            sound.stopMusic();
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
