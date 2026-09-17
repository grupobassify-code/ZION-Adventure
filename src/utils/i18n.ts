import { useState, useEffect } from 'react';

export type Language = 'es' | 'en';

const LANGUAGE_STORAGE_KEY = 'zion_adventure_language';

// Event emitter to notify components when language changes
const listeners = new Set<(lang: Language) => void>();

export function getSavedLanguage(): Language {
  if (typeof window === 'undefined') return 'es';
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'es' || saved === 'en') {
      return saved;
    }
    // Auto-detect browser language if not set
    if (navigator.language && navigator.language.toLowerCase().startsWith('en')) {
      return 'en';
    }
  } catch (e) {
    console.error('Error reading saved language:', e);
  }
  return 'es';
}

export function setSavedLanguage(lang: Language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {
    console.error('Error saving language:', e);
  }
  listeners.forEach((fn) => fn(lang));
}

export function toggleLanguage(): Language {
  const current = getSavedLanguage();
  const next: Language = current === 'es' ? 'en' : 'es';
  setSavedLanguage(next);
  return next;
}

export function useLanguage() {
  const [lang, setLangState] = useState<Language>(() => getSavedLanguage());

  useEffect(() => {
    const handler = (newLang: Language) => {
      setLangState(newLang);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const changeLanguage = (newLang: Language) => {
    setSavedLanguage(newLang);
  };

  const toggle = () => {
    return toggleLanguage();
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    return translate(key, lang, params);
  };

  return {
    language: lang,
    setLanguage: changeLanguage,
    toggleLanguage: toggle,
    t,
  };
}

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  es: {
    // Top Bar & Common
    back: 'VOLVER',
    version: 'VERSION 2.6 EXTENDED',
    jukebox: 'JUKEBOX',
    privacy: 'PRIVACIDAD',
    controls: 'CONTROLES',
    audio: 'Audio',
    fullscreen: 'Pantalla Completa',
    language: 'IDIOMA',
    langNameEs: 'Español',
    langNameEn: 'English',
    selectLanguage: 'Seleccionar Idioma',
    audioToggleTitle: 'Activar/Desactivar Audio',
    fullscreenTitle: 'Pantalla Completa',
    controlsTitle: 'Guía de Controles',
    privacyTitle: 'Política de Privacidad (Google Play)',
    jukeboxTitle: 'Escuchar Banda Sonora Original (Jukebox)',

    // Title Screen
    tapZionToAttack: '[ TOCA A ZION PARA ATACAR ]',
    gameTitle: 'ZION ADVENTURE',
    gameSubtitle: 'LA LEYENDA DEL CONTINUO ESPACIO-TIEMPO',
    startGame: 'INICIAR JUEGO',
    online1v1: 'ONLINE 1v1',
    onlineInDev: 'Modo Online 1v1 en desarrollo',
    credits: 'CRÉDITOS',
    privacyPolicy: 'Política de Privacidad',
    googleDocsLink: 'Google Docs',
    sevenZones: '7 ZONAS',
    thirteenLevels: '13 NIVELES',
    sixBosses: '6 JEFES',
    phasesAndAi: 'FASES & IA',
    threeSlots: '3 PARTIDAS',
    autosave: 'AUTOGUARDADO',

    // Slots Screen
    slotsBadge: 'RANURAS DE MEMORIA (MÁXIMO 3)',
    slotsTitle: 'SELECCIONA O CREA TU PARTIDA',
    slotsDesc: 'Cada ranura guarda independientemente tu progreso de niveles desbloqueados, cristales, secretos y puntuación.',
    slotPrefix: 'RANURA',
    emptySlotTitle: 'Ranura {num} Vacía',
    emptySlotDesc: 'Comienza una nueva aventura desde el Bosque Neón.',
    createSaveBtn: 'CREAR PARTIDA',
    deleteSaveTooltip: 'Borrar Partida',
    levelsRatio: '{unlocked} / {total} Niveles',
    crystalsCount: '{count} Cristales',
    secretsCount: '{count} Secretos',
    scorePoints: '{score} PTS',
    totalProgress: 'PROGRESO TOTAL',
    levelPortalBtn: 'PORTAL DE NIVELES',
    deviceSaveNotice: 'Progreso guardado automáticamente en este navegador',
    resetAllDataBtn: 'Reiniciar Todos los Progresos',
    deviceLabel: 'DISPOSITIVO:',

    // New Slot Modal
    newSlotModalTitle: 'CREAR PARTIDA (RANURA {num})',
    newSlotPrompt: 'Ingresa el nombre de tu aventurero para identificar este archivo de guardado:',
    playerNamePlaceholder: 'Nombre del Jugador',
    cancelBtn: 'CANCELAR',
    confirmBtn: 'CONFIRMAR',
    defaultPlayerName: 'Aventurero {num}',

    // Delete Slot Modal
    deleteSlotModalTitle: '¿BORRAR RANURA {num}?',
    deleteSlotModalDesc: 'Se eliminarán permanentemente todos los niveles desbloqueados, cristales y récords de esta ranura.',
    yesDeleteBtn: 'SÍ, BORRAR',

    // Reset All Data Modal
    resetAllModalTitle: '¿REINICIAR TODOS LOS PROGRESOS?',
    resetAllModalDesc: 'Esta acción restablecerá todas las ranuras de guardado en este dispositivo. Todos los niveles volverán a bloquearse excepto el Acto 1.',
    resetAllConfirmBtn: 'REINICIAR TODO',

    // Zones Screen
    saveFileLabel: 'PARTIDA: {name}',
    zoneSelectTitle: 'SELECCIÓN DE ZONA',
    unlockedBadge: 'Desbloqueados: {unlocked} / {total}',
    actsCountSingular: '1 ACTO',
    actsCountPlural: '{count} ACTOS',
    completedStatus: 'Completado',
    lockedStatus: 'Bloqueado',
    enterActs: 'ENTRAR A ACTOS',
    beatPrevEra: 'SUPERAR ERA PREVIA',
    specialModesHeader: 'MODOS ESPECIALES & RELOJ DE KRONOS',
    dimensionalChallenges: 'Desafíos Dimensionales',

    // Zone Names & Subtitles
    zone_neon_name: 'Bosque Neón',
    zone_neon_sub: 'Arboleda Bioluminiscente Ancestral',
    zone_sakura_name: 'Cerezo Espiritual',
    zone_sakura_sub: 'El Sendero Místico de los Pétalos',
    zone_lavacliff_name: 'Acantilados de Lava',
    zone_lavacliff_sub: 'Caldera Volcánica y Núcleo Ígneo',
    zone_desert_name: 'Santuario del Desierto',
    zone_desert_sub: 'Pirámides Doradas y Tumbas de Faraones',
    zone_krono_name: 'Krono City',
    zone_krono_sub: 'Metrópolis Ciberpunk y Reactor Cuántico',
    zone_travel_name: 'Kronos Travel',
    zone_travel_sub: 'La Fusión Dimensional de Todas las Eras',
    zone_jungle_name: 'Jungle Run',
    zone_jungle_sub: 'Pirámide Maya, Copas de Árboles y el Jaguar Balam',
    zone_blizzard_name: 'Blizzard Rush',
    zone_blizzard_sub: 'Montaña Nevada, Esquís y el Coloso Yeti',

    // Kronos Clock & Locker Cards
    clockRestored: '✓ RELOJ RESTAURADO',
    clockFractured: 'MECANISMO FRACTURADO',
    clockTitle: 'KRONOS CLOCK — EL GRAN RELOJ',
    lockerUnlockedBadge: 'Casillero Desbloqueado',
    clockDesc: 'Reconstruye el colosal mecanismo del tiempo con las 6 piezas ancestrales obtenidas al derrotar al jefe del acto final de cada zona (¡incluyendo Jungle Run!). ¡Al completarlo se activará la cinemática de giro y desbloquearás el Casillero de skins estilo Fortnite!',
    piecesCount: 'Piezas [{placed}/6]:',
    enterClockCardBtn: 'ACCEDER AL RELOJ DE KRONOS',
    enterClockBtn: 'ENTRAR AL RELOJ',
    lockerShortcut: 'CASILLERO',
    lockerTitle: 'ARMARIO DE SKINS (ESTILO FORTNITE)',
    lockerSub: 'Personaliza a Zion con atuendos Legendarios y Cuánticos',
    openLockerBtn: 'ABRIR CASILLERO',

    // Extra Modes
    modeUnlocked: 'MODO DESBLOQUEADO',
    ascendBtn: '¡ASCENDER!',
    beatNeonForest: 'Supera Bosque Neón',
    specialStageActive: 'NIVEL EXTRA ACTIVO',
    playBtnExcl: '¡JUGAR!',
    beatOneSpecial: 'Supera 1 Special Stage',
    vsAiActiveBadge: 'ACTIVO',
    challengeAiBtn: '¡DESAFIAR IA!',
    beatSakuraBoss: 'Derrota al Jefe de Sakura',
    timeAttackGhostBadge: 'FANTASMA',
    runTimeAttackBtn: '¡CORRER!',
    beatLavaBoss: 'Derrota al Jefe 3 de Lava',

    onlyUpTitle: 'MODO ESPECIAL: SOLO HACIA ARRIBA',
    onlyUpBadge: 'DESAFÍO VERTICAL',
    onlyUpDesc: 'Sube plataformas en ascenso continuo sin caer al vacío. ¿Hasta qué altura podrás llegar?',
    onlyUpRecord: 'RÉCORD MÁXIMO: {height}m',
    playOnlyUpBtn: 'JUGAR SOLO HACIA ARRIBA',

    specialStageTitle: 'FASE ESPECIAL DIMENSIONAL',
    specialStageBadge: 'BONUS TEMPORAL',
    specialStageDesc: 'Recoge 100 cristales en un túnel de hiperespacio antes de que se agote el tiempo.',
    playSpecialStageBtn: 'JUGAR FASE ESPECIAL',

    vsAiTitle: 'VS IA: DESAFÍO CONTRA BOTS',
    vsAiBadge: 'CARRERA CONTRA REVENANT',
    vsAiDesc: 'Compite contra un bot en una carrera a toda velocidad por completar el circuito.',
    playVsAiBtn: 'SELECCIONAR CIRCUITO VS IA',

    timeAttackTitle: 'MODO CONTRARRELOJ',
    timeAttackBadge: 'RÉCORD DE VELOCIDAD',
    timeAttackDesc: 'Supera cualquier nivel en el menor tiempo posible y bate tus mejores marcas registradas.',
    playTimeAttackBtn: 'ELEGIR PISTA CONTRARRELOJ',

    // Acts Screen
    zonePrefix: 'ZONA: {name}',
    selectActTitle: 'SELECCIONA EL ACTO',
    otherZoneBtn: 'OTRA ZONA',
    actPrefix: 'ACTO {act}',
    bossBadge: 'JEFE',
    playActBtn: 'JUGAR ACTO',
    repeatActBtn: 'REPETIR ACTO',
    actLocked: 'BLOQUEADO',

    // Controls Modal
    controlsGuideHeader: 'GUÍA DE COMBATE & CONTROLES',
    closeBtn: 'CERRAR',
    ctrlMovement: 'Moverse & Acelerar',
    ctrlMovementDesc: 'Movimiento fluido y salto',
    ctrlMovementKeys: 'A / D o Flechas + Espacio',
    ctrlSword: 'Espada de Luz (Combo 3 Golpes)',
    ctrlSwordDesc: 'Ataque cuerpo a cuerpo letal',
    ctrlSwordKeys: 'J o Z',
    ctrlDagger: 'Dagas de Energía',
    ctrlDaggerDesc: 'Ataque a distancia recargable',
    ctrlDaggerKeys: 'K o X',
    ctrlShield: 'Escudo & Parry Perfecto',
    ctrlShieldDesc: 'Bloquea o noquea proyectiles',
    ctrlShieldKeys: 'E o C',
    ctrlDash: 'Dash / Esquiva Invulnerable',
    ctrlDashDesc: 'Atraviesa enemigos y trampas',
    ctrlDashKeys: 'Shift o L',
    ctrlSpecial: 'Especial (Explosión SP)',
    ctrlSpecialDesc: 'Onda expansiva devastadora',
    ctrlSpecialKeys: 'Q o V',

    // Touch Controls
    touch_jump: 'SALTAR',
    touch_attack: 'ATACAR',
    touch_dagger: 'DAGAS',
    touch_dash: 'DASH',
    touch_shield: 'ESCUDO',
    touch_sp: 'SP',

    // Coming Soon
    moreLevelsTitle: 'MÁS NIVELES PRÓXIMAMENTE',
    moreLevelsDesc: 'Nuevas dimensiones, biomas ancestrales, desafíos temporales y más guardianes en desarrollo.',
    tagNewEras: '✦ Nuevas Eras',
    tagNewBosses: '✦ Nuevos Jefes',
    tagHiddenSecrets: '✦ Secretos Ocultos',

    // Footer
    footerCopyright: 'ZION ADVENTURE © 2026 · CREADO POR DMN',
    footerPrivacy: 'Política de Privacidad',
    footerCompliant: 'GOOGLE PLAY COMPLIANT',
  },
  en: {
    // Top Bar & Common
    back: 'BACK',
    version: 'VERSION 2.6 EXTENDED',
    jukebox: 'JUKEBOX',
    privacy: 'PRIVACY',
    controls: 'CONTROLS',
    audio: 'Audio',
    fullscreen: 'Fullscreen',
    language: 'LANGUAGE',
    langNameEs: 'Español',
    langNameEn: 'English',
    selectLanguage: 'Select Language',
    audioToggleTitle: 'Toggle Audio Sound',
    fullscreenTitle: 'Toggle Fullscreen Mode',
    controlsTitle: 'Controls Guide',
    privacyTitle: 'Privacy Policy (Google Play)',
    jukeboxTitle: 'Listen to Original Soundtrack (Jukebox)',

    // Title Screen
    tapZionToAttack: '[ TAP ZION TO ATTACK ]',
    gameTitle: 'ZION ADVENTURE',
    gameSubtitle: 'THE LEGEND OF THE SPACE-TIME CONTINUUM',
    startGame: 'START GAME',
    online1v1: 'ONLINE 1v1',
    onlineInDev: 'Online 1v1 mode currently in development',
    credits: 'CREDITS',
    privacyPolicy: 'Privacy Policy',
    googleDocsLink: 'Google Docs',
    sevenZones: '7 ZONES',
    thirteenLevels: '13 LEVELS',
    sixBosses: '6 BOSSES',
    phasesAndAi: 'PHASES & AI',
    threeSlots: '3 SLOTS',
    autosave: 'AUTOSAVE',

    // Slots Screen
    slotsBadge: 'MEMORY SLOTS (MAX 3)',
    slotsTitle: 'SELECT OR CREATE SAVE FILE',
    slotsDesc: 'Each slot independently saves your unlocked levels, collected crystals, secrets, and score progress.',
    slotPrefix: 'SLOT',
    emptySlotTitle: 'Slot {num} Empty',
    emptySlotDesc: 'Begin a new adventure starting in the Neon Forest.',
    createSaveBtn: 'NEW GAME',
    deleteSaveTooltip: 'Delete Save',
    levelsRatio: '{unlocked} / {total} Levels',
    crystalsCount: '{count} Crystals',
    secretsCount: '{count} Secrets',
    scorePoints: '{score} PTS',
    totalProgress: 'TOTAL PROGRESS',
    levelPortalBtn: 'LEVEL PORTAL',
    deviceSaveNotice: 'Progress saved automatically in this browser',
    resetAllDataBtn: 'Reset All Save Progress',
    deviceLabel: 'DEVICE:',

    // New Slot Modal
    newSlotModalTitle: 'CREATE SAVE (SLOT {num})',
    newSlotPrompt: 'Enter your adventurer name to identify this save file:',
    playerNamePlaceholder: 'Player Name',
    cancelBtn: 'CANCEL',
    confirmBtn: 'CONFIRM',
    defaultPlayerName: 'Adventurer {num}',

    // Delete Slot Modal
    deleteSlotModalTitle: 'DELETE SLOT {num}?',
    deleteSlotModalDesc: 'All unlocked levels, crystals, and records in this slot will be permanently deleted.',
    yesDeleteBtn: 'YES, DELETE',

    // Reset All Data Modal
    resetAllModalTitle: 'RESET ALL GAME PROGRESS?',
    resetAllModalDesc: 'This action will reset all save slots on this device. All levels will be locked again except Act 1.',
    resetAllConfirmBtn: 'RESET EVERYTHING',

    // Zones Screen
    saveFileLabel: 'SAVE: {name}',
    zoneSelectTitle: 'ZONE SELECTION',
    unlockedBadge: 'Unlocked: {unlocked} / {total}',
    actsCountSingular: '1 ACT',
    actsCountPlural: '{count} ACTS',
    completedStatus: 'Completed',
    lockedStatus: 'Locked',
    enterActs: 'ENTER ACTS',
    beatPrevEra: 'CLEAR PREVIOUS ERA',
    specialModesHeader: 'SPECIAL MODES & KRONOS CLOCK',
    dimensionalChallenges: 'Dimensional Challenges',

    // Zone Names & Subtitles
    zone_neon_name: 'Neon Forest',
    zone_neon_sub: 'Ancient Bioluminescent Grove',
    zone_sakura_name: 'Spirit Sakura',
    zone_sakura_sub: 'The Mystical Path of Petals',
    zone_lavacliff_name: 'Lava Cliffs',
    zone_lavacliff_sub: 'Volcanic Caldera and Fiery Core',
    zone_desert_name: 'Desert Sanctuary',
    zone_desert_sub: 'Golden Pyramids and Pharaoh Tombs',
    zone_krono_name: 'Krono City',
    zone_krono_sub: 'Cyberpunk Metropolis and Quantum Reactor',
    zone_travel_name: 'Kronos Travel',
    zone_travel_sub: 'The Dimensional Fusion of All Eras',
    zone_jungle_name: 'Jungle Run',
    zone_jungle_sub: 'Mayan Pyramid, Tree Canopies and Jaguar Balam',
    zone_blizzard_name: 'Blizzard Rush',
    zone_blizzard_sub: 'Snowy Mountain, Downhill Skiing and Colossal Yeti',

    // Kronos Clock & Locker Cards
    clockRestored: '✓ CLOCK RESTORED',
    clockFractured: 'FRACTURED MECHANISM',
    clockTitle: 'KRONOS CLOCK — THE GRAND TIMEPIECE',
    lockerUnlockedBadge: 'Locker Unlocked',
    clockDesc: 'Rebuild the colossal time mechanism using the 6 ancient pieces obtained by defeating the final boss of each zone (including Jungle Run!). Completing it triggers the rotational cinematic and unlocks the Fortnite-style Skin Locker!',
    piecesCount: 'Pieces [{placed}/6]:',
    enterClockCardBtn: 'ENTER KRONOS CLOCK',
    enterClockBtn: 'ENTER CLOCK',
    lockerShortcut: 'LOCKER',
    lockerTitle: 'SKIN LOCKER (FORTNITE STYLE)',
    lockerSub: 'Customize Zion with Legendary and Quantum Outfits',
    openLockerBtn: 'OPEN LOCKER',

    // Extra Modes
    modeUnlocked: 'MODE UNLOCKED',
    ascendBtn: 'ASCEND!',
    beatNeonForest: 'Beat Neon Forest',
    specialStageActive: 'EXTRA STAGE ACTIVE',
    playBtnExcl: 'PLAY!',
    beatOneSpecial: 'Beat 1 Special Stage',
    vsAiActiveBadge: 'ACTIVE',
    challengeAiBtn: 'CHALLENGE AI!',
    beatSakuraBoss: 'Beat Sakura Boss',
    timeAttackGhostBadge: 'GHOST',
    runTimeAttackBtn: 'RUN!',
    beatLavaBoss: 'Beat Lava Boss 3',

    onlyUpTitle: 'SPECIAL MODE: ONLY UP',
    onlyUpBadge: 'VERTICAL CHALLENGE',
    onlyUpDesc: 'Climb continually ascending platforms without falling into the void. How high can you reach?',
    onlyUpRecord: 'BEST RECORD: {height}m',
    playOnlyUpBtn: 'PLAY ONLY UP',

    specialStageTitle: 'DIMENSIONAL SPECIAL STAGE',
    specialStageBadge: 'TIME BONUS',
    specialStageDesc: 'Collect 100 crystals inside a hyperspace tunnel before the clock runs out.',
    playSpecialStageBtn: 'PLAY SPECIAL STAGE',

    vsAiTitle: 'VS AI: BOT RACING CHALLENGE',
    vsAiBadge: 'RACE AGAINST REVENANT',
    vsAiDesc: 'Compete against an AI bot in a high-speed sprint to finish the circuit first.',
    playVsAiBtn: 'SELECT VS AI CIRCUIT',

    timeAttackTitle: 'TIME ATTACK MODE',
    timeAttackBadge: 'SPEEDRUN LEADERBOARD',
    timeAttackDesc: 'Beat any level in record time and improve your fastest personal bests.',
    playTimeAttackBtn: 'SELECT TIME ATTACK TRACK',

    // Acts Screen
    zonePrefix: 'ZONE: {name}',
    selectActTitle: 'SELECT ACT',
    otherZoneBtn: 'OTHER ZONE',
    actPrefix: 'ACT {act}',
    bossBadge: 'BOSS',
    playActBtn: 'PLAY ACT',
    repeatActBtn: 'REPLAY ACT',
    actLocked: 'LOCKED',

    // Controls Modal
    controlsGuideHeader: 'COMBAT & CONTROLS GUIDE',
    closeBtn: 'CLOSE',
    ctrlMovement: 'Move & Sprint',
    ctrlMovementDesc: 'Fluid movement and jumping',
    ctrlMovementKeys: 'A / D or Arrows + Space',
    ctrlSword: 'Light Sword (3-Hit Combo)',
    ctrlSwordDesc: 'Lethal close-quarters combat',
    ctrlSwordKeys: 'J or Z',
    ctrlDagger: 'Energy Daggers',
    ctrlDaggerDesc: 'Rechargeable ranged attack',
    ctrlDaggerKeys: 'K or X',
    ctrlShield: 'Shield & Perfect Parry',
    ctrlShieldDesc: 'Blocks strikes and deflects projectiles',
    ctrlShieldKeys: 'E or C',
    ctrlDash: 'Dash / Invulnerable Dodge',
    ctrlDashDesc: 'Phase through enemies and hazards',
    ctrlDashKeys: 'Shift or L',
    ctrlSpecial: 'Special (SP Blast)',
    ctrlSpecialDesc: 'Devastating shockwave blast',
    ctrlSpecialKeys: 'Q or V',

    // Touch Controls
    touch_jump: 'JUMP',
    touch_attack: 'ATTACK',
    touch_dagger: 'DAGGERS',
    touch_dash: 'DASH',
    touch_shield: 'SHIELD',
    touch_sp: 'SP',

    // Coming Soon
    moreLevelsTitle: 'MORE LEVELS COMING SOON',
    moreLevelsDesc: 'New dimensions, ancient biomes, temporal challenges, and more bosses in development.',
    tagNewEras: '✦ New Eras',
    tagNewBosses: '✦ New Bosses',
    tagHiddenSecrets: '✦ Hidden Secrets',

    // Footer
    footerCopyright: 'ZION ADVENTURE © 2026 · CREATED BY DMN',
    footerPrivacy: 'Privacy Policy',
    footerCompliant: 'GOOGLE PLAY COMPLIANT',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS['es'];

export function translate(
  key: TranslationKey,
  lang: Language = getSavedLanguage(),
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['es'];
  let text = dict[key] || TRANSLATIONS['es'][key] || key;

  if (params) {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    }
  }

  return text;
}
