import { useState, useEffect } from 'react';
import type { LevelConfig } from '../types';

export type Language = 'es' | 'en';

const LANGUAGE_STORAGE_KEY = 'zion_adventure_language';

// In-memory language fallback to ensure instant switching even in sandboxed iframes or private browsing
let inMemoryLanguage: Language | null = null;

// Event emitter to notify components when language changes
const listeners = new Set<(lang: Language) => void>();

export function getSavedLanguage(): Language {
  if (inMemoryLanguage) {
    return inMemoryLanguage;
  }
  if (typeof window === 'undefined') return 'es';
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'es' || saved === 'en') {
      inMemoryLanguage = saved;
      return saved;
    }
    // Auto-detect browser language if not set
    if (navigator.language && navigator.language.toLowerCase().startsWith('en')) {
      inMemoryLanguage = 'en';
      return 'en';
    }
  } catch (e) {
    console.warn('Could not read saved language, falling back to default:', e);
  }
  inMemoryLanguage = 'es';
  return 'es';
}

export function setSavedLanguage(lang: Language) {
  inMemoryLanguage = lang;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {
    console.warn('Could not persist language to localStorage:', e);
  }
  listeners.forEach((fn) => {
    try {
      fn(lang);
    } catch (err) {
      console.error('Error in language listener:', err);
    }
  });
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
    achievements: 'LOGROS',
    ribbonEras: '8 ERAS DIMENSIONALES',
    ribbonLevels: '22 NIVELES',
    ribbonBosses: 'JEFES ÉPICOS',
    ribbonSlots: '3 PARTIDAS',
    privacyPolicy: 'Política de Privacidad',
    googleDocsLink: 'Google Docs',
    sevenZones: '7 ZONAS',
    thirteenLevels: '13 NIVELES',
    sixBosses: '6 JEFES',
    phasesAndAi: 'FASES & IA',
    threeSlots: '3 PARTIDAS',
    autosave: 'AUTOGUARDADO',

    // Home Screen Exploration & Features
    scrollDownPrompt: 'DESLIZA HACIA ABAJO PARA EXPLORAR',
    exploreGameHeader: '¿QUÉ HAY EN ZION ADVENTURE?',
    gameModesTitle: 'MODOS DE JUEGO & DESAFÍOS',
    exploreGameSubtitle: 'Descubre todos los modos de juego, biomas dimensionales y habilidades de combate',
    modeStoryTitle: 'Aventura Principal (8 Eras)',
    modeStoryDesc: 'Recorre 22 niveles desde el Bosque Neón hasta Blizzard Rush, recolecta cristales y derrota a 6 jefes épicos.',
    modeOnlyUpTitle: 'Kronos Only Up! (Vertical)',
    modeOnlyUpDesc: 'Torre infinita de plataformas hacia el cielo con trampas móviles. ¿Qué tan alto podrás llegar?',
    modeVsAiTitle: 'Carrera VS Inteligencia Artificial',
    modeVsAiDesc: 'Compite cabeza a cabeza contra corredores IA en 4 dificultades con física idéntica.',
    modeTimeAttackTitle: 'Modo Contrarreloj (Time Attack)',
    modeTimeAttackDesc: 'Cronómetro milimétrico y fantasma en tiempo real para perfeccionar cada curva y salto.',
    modeOnlineTitle: 'Duelo Multijugador 1v1 Online',
    modeOnlineDesc: 'Crea o únete a salas en línea para competir en tiempo real y ganar copas de temporada.',
    modeClockTitle: 'El Reloj de Kronos & Vestidor',
    modeClockDesc: 'Reconstruye las piezas del reloj temporal y desbloquea skins legendarias para personalizar a Zion.',
    playModeBtn: 'JUGAR',
    exploreErasTitle: 'LAS 8 ERAS DIMENSIONALES',
    exploreErasSubtitle: 'Mundos únicos con biomas, peligros climáticos y guardianes',
    exploreAbilitiesTitle: 'ARSENAL Y COMBATE DE ZION',
    exploreAbilitiesSubtitle: 'Domina el salto temporal y cada una de las técnicas de combate',
    featureAutosaveTitle: 'Autoguardado Seguro',
    featureAutosaveDesc: '3 ranuras de memoria independientes que guardan tu progreso al instante en tu dispositivo.',
    featureJukeboxTitle: 'Jukebox Chiptune Retro',
    featureJukeboxDesc: 'Banda sonora original épica compuesta con sintetizadores y estilo arcade de 16 bits.',
    featureMobileTitle: 'Optimizado para Celular',
    featureMobileDesc: 'Controles táctiles de alta respuesta con opción de Joystick virtual o D-Pad clásico.',
    featureSafeTitle: '100% Seguro y Privado',
    featureSafeDesc: 'Sin anuncios invasivos ni compras ocultas, cumpliendo las políticas de Google Play.',
    backToTopBtn: 'VOLVER AL INICIO',

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
    zone_steampunk_name: 'Steampunk',
    zone_steampunk_sub: 'Fábrica de Vapor, Engranajes y Ascenso Only Up 1000m',
    zone_castlesmash_name: 'Castle Smash',
    zone_castlesmash_sub: 'Asedio Medieval, Almenas de Piedra y Lord Malakar',
    zone_piratestreasure_name: "Pirate's Treasure",
    zone_piratestreasure_sub: 'Costas Tropicales, Arrecife Submarino y el Cofre Maldito',

    // Kronos Clock & Locker Cards
    clockRestored: '✓ PORTAL & RELOJ RESTAURADO',
    clockFractured: 'PORTAL DIMENSIONAL FRACTURADO',
    clockTitle: 'KRONOS CLOCK — PORTAL DIMENSIONAL (12 PIEZAS)',
    lockerUnlockedBadge: 'Casillero Desbloqueado',
    clockDesc: 'Reconstruye el colosal mecanismo del portal dimensional con las 12 piezas ancestrales (1 por cada zona del multiverso). ¡Se necesitan las 12 piezas sagradas para estabilizar el nexo y desbloquear el Casillero de skins estilo Fortnite!',
    piecesCount: 'Piezas Portal [{placed}/12]:',
    enterClockCardBtn: 'ACCEDER AL RELOJ DE KRONOS',
    enterClockBtn: 'ENTRAR AL RELOJ',
    lockerShortcut: 'CASILLERO',
    lockerCardTitle: 'ARMARIO DE SKINS (ESTILO FORTNITE)',
    lockerCardSub: 'Personaliza a Zion con atuendos Legendarios y Cuánticos',
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

    // Pause Modal
    pauseTitle: 'JUEGO EN PAUSA',
    pauseResume: 'CONTINUAR',
    pauseRestart: 'Reiniciar Nivel',
    pauseQuit: 'Salir',
    pauseControlsGuide: 'Guía de Controles & Showdown',
    pauseSavedProgress: 'Progreso Guardado',
    pauseSfx: 'Efectos SFX',
    pauseMusic: 'Música Chiptune',
    pausePerfTitle: 'Sincronización & Rendimiento 60 FPS',
    pausePerfDesc: 'Velocidad constante y fluida en todos los dispositivos',
    pauseFixedPhysics: 'Física Fija 60Hz',
    pauseUltraMode: 'Modo Ultra Rápido',
    pauseFpsCounter: 'Ver Contador FPS',
    pauseTouchControls: 'Control Táctil Móvil',
    pauseTouchDesc: 'Elige Joystick Virtual o Botones D-Pad',

    // Victory Modal
    victoryTitle: '¡PORTAL ABIERTO!',
    victoryAdventureComplete: '¡AVENTURA COMPLETADA!',
    victorySpecialStageComplete: '¡SPECIAL STAGE COMPLETADA!',
    victorySpecialStageSubtitle: 'Dimensión Cuántica Superada',
    victoryCrystals: 'Cristales',
    victorySecrets: 'Secretos',
    victoryTime: 'Tiempo',
    victoryEnemies: 'Enemigos',
    victoryRankTitle: 'Rango de Desempeño',
    victoryRankS: '¡Maestría Legendaria!',
    victoryRankA: '¡Excelente Exploración!',
    victoryRankB: '¡Buen Desempeño!',
    victoryRankC: '¡Nivel Superado!',
    victoryNextAct: 'SIGUIENTE ACTO',
    victoryReplay: 'Rejugar',
    victoryLevelPortal: 'PORTAL DE NIVELES',
    victoryCreditsPortal: 'PORTAL A LOS CRÉDITOS',
    victoryContinueAdventure: 'CONTINUAR AVENTURA',
    victoryJungleUnlockTitle: '¡NUEVA ZONA DESBLOQUEADA!',
    victoryJungleUnlockDesc: 'Zona 6: Jungle Run (Selva Maya) ya está disponible',
    victoryKronosPieceTitle: '¡PIEZA ANCESTRAL DE KRONOS OBTENIDA!',
    victoryKronosPieceDesc: '¡Encasíllala en el Gran Reloj!',

    // Mode Level Select
    modeVsAiBadge: 'Carrera 1v1 vs Algoritmo',
    modeTimeAttackBadge: 'Contrarreloj & Fantasma',
    modeNoBossWarning: '(Sin niveles con jefe)',
    modeSelectTrackVsAi: 'SELECCIONA PISTA VS IA',
    modeSelectTrackTimeAttack: 'SELECCIONA CIRCUITO CONTRARRELOJ',
    modeBossLevelBadge: 'Nivel con Jefe',
    modeBossExcluded: 'No disponible en este modo (sin jefes)',
    modeLevelLocked: 'Bloqueado. Desbloquea en Modo Aventura',
    modeBestTime: 'Mejor tiempo',
    modeTrackDetails: 'Detalles de la Pista',
    modeBossRestriction: 'Restricción del Modo: Los niveles con jefe no se pueden jugar en VS IA ni Contrarreloj. Selecciona un Acto 1 o 2.',
    modeAiDifficultyLabel: 'Dificultad del Rival IA:',
    modeAiDiffNormal: 'Normal',
    modeAiDiffFast: 'Rápido',
    modeAiDiffExpert: 'Experto',
    modeAiBotDesc: '🤖 La IA navegará plataformas, saltará obstáculos y correrá hacia la meta en tiempo real.',
    modePersonalBest: 'Récord Personal:',
    modeNoRecordYet: 'Sin récord aún',
    modeGhostOnTrack: 'Fantasma en Pista:',
    modeGhostActive: '✓ Activo para Carrera',
    modeGhostNone: 'No grabado aún',
    modeStartVsAiBtn: '¡COMENZAR CARRERA VS IA!',
    modeStartTimeAttackBtn: '¡INICIAR CONTRARRELOJ!',

    // HUD
    hudLevelShort: 'NV.',
    hudDownhillBadge: 'DESCENSO',
    hudPause: 'PAUSA',
    hudShieldBroken: '¡Escudo Roto!',
    hudShieldEnergy: 'Escudo',
    hudSpEnergy: 'Energía SP',
    hudLives: 'Vidas',
    hudCrystals: 'Cristales',
    hudYou: 'Tú',
    hudAiRival: 'Rival IA',

    // Kronos Clock View
    clockBackBtn: 'Volver a Zonas',
    clockNexusTitle: 'NEXO DIMENSIONAL KRONOS',
    clockRestoredBadge: '✓ PORTAL RESTAURADO (12/12)',
    clockFracturedBadge: 'FRACTURADO [{count}/12 PIEZAS]',
    clockMainTitle: 'EL PORTAL & RELOJ DE KRONOS',
    clockDemoBtn: 'Probar 12/12 (Demo)',
    clockLockerBtn: 'CASILLERO DE SKINS',
    clockLockerLocked: 'Casillero Bloqueado ({count}/12 piezas)',
    clockStatusRestored: '⚡ PORTAL DIMENSIONAL: 12 PIEZAS SINCRONIZADAS',
    clockStatusFractured: '⚠️ PORTAL FRACTURADO — 12 PIEZAS REQUERIDAS',
    clockReplayCinematic: 'Repetir Cinemática',
    clockPortalCompleteTitle: '¡PORTAL DIMENSIONAL ACTIVADO AL 100%!',
    clockPortalFracturedTitle: 'PORTAL FRACTURADO — REQUIERE 12 PIEZAS SAGRADAS',
    clockPortalCompleteDesc: 'Todas las 12 piezas sagradas han sido ensambladas en el portal de Kronos. El flujo dimensional está completamente estabilizado y el Casillero de Skins está abierto.',
    clockPortalFracturedDesc: 'Se necesitan las 12 piezas ancestrales (1 por cada una de las 12 zonas del juego) para reactivar el portal y desbloquear el Casillero de Skins. Aunque los jefes de las zonas 9 a 12 aún están en desarrollo, ¡aquí puedes ver las 12 reliquias requeridas para la apertura del Casillero!',
    clockLockerUnlockedTitle: '🔓 CASILLERO DE PERSONAJES DESBLOQUEADO',
    clockLockerLockedTitle: '🔒 CASILLERO BLOQUEADO — REQUIERE 12 PIEZAS',
    clockLockerUnlockedDesc: '¡Has restaurado las 12 piezas! Accede al vestidor de atuendos y personaliza a Zion.',
    clockLockerLockedDesc: 'Progreso: {count}/12 piezas colocadas. Al reunir las 12 se desbloqueará el Casillero.',
    clockLockerOpenBtn: 'ABRIR',
    clockPlaceAllBtn: 'COLOCAR TODAS LAS PIEZAS DISPONIBLES ({count})',
    clockPieceAssembled: 'ENSAMBLADA EN EL PORTAL',
    clockPieceInsert: 'ENCAJAR EN EL PORTAL',
    clockPieceSoon: 'Próximamente ({boss})',

    // Character Locker
    lockerTitle: 'VESTIDOR DE ATUENDOS & SKINS',
    lockerSubtitle: 'Elige tu aspecto dimensional favorito para Zion y personaliza su presencia.',
    lockerBackBtn: 'Volver',
    lockerSelectBtn: 'SELECCIONAR ASPECTO',
    lockerEquippedBadge: 'EQUIPADO',
    lockerLockedBadge: 'BLOQUEADO',
    lockerUnlockPrompt: 'Desbloquea completando el Reloj de Kronos (12 Piezas)',
    lockerStatsSpeed: 'Velocidad',
    lockerStatsJump: 'Salto',
    lockerStatsDefense: 'Defensa',
    lockerStatsAttack: 'Ataque',
    lockerAbilitiesHeader: 'HABILIDADES DE COMBATE',

    // Dialog & Cutscenes
    dialogSkip: 'Saltar historia',
    dialogNext: 'CONTINUAR',
    dialogStartLevel: 'COMENZAR NIVEL',

    // Level Intro Banner
    introBossBattle: 'DUELO DE JEFE',
    introObjectiveBoss: 'OBJETIVO: Desactiva los 3 Nodos y Derrota al Guardián',
    introObjectiveNormal: 'OBJETIVO: Recolecta Cristales y Llega al Portal',
    introTapToPlay: '(Toca para continuar jugando)',

    // Result Modals
    vsAiWinTitle: '¡VICTORIA EN LA CARRERA!',
    vsAiLoseTitle: '¡DERROTA EN LA META!',
    vsAiWinHeader: '¡SUPERASTE A LA IA!',
    vsAiLoseHeader: '¡{ai} LLEGÓ PRIMERO!',
    vsAiWinDesc: 'Tus reflejos cuánticos y precisión de salto fueron superiores al algoritmo.',
    vsAiLoseDesc: 'La IA optimizó su ruta a la meta. ¡Intenta de nuevo para vencerla!',
    vsAiYourTime: 'Tu Tiempo',
    vsAiRivalTime: 'Tiempo Rival',
    vsAiTrack: 'Pista',
    vsAiDifficulty: 'Dificultad',
    vsAiRetryBtn: 'Reintentar Pista',
    vsAiSelectTrackBtn: 'Cambiar Pista',
    vsAiMenuBtn: 'Menú Principal',

    timeAttackResultTitle: '¡TIEMPO REGISTRADO!',
    timeAttackNewBest: '¡NUEVO RÉCORD PERSONAL!',
    timeAttackFinalTime: 'Tiempo Final',
    timeAttackDelta: 'Diferencia vs Fantasma',
    timeAttackPreviousBest: 'Mejor Marca Anterior',
    timeAttackGhostSaved: 'FANTASMA GUARDADO PARA PRÓXIMAS CARRERAS',
    timeAttackRetryBtn: 'Reintentar Circuito',

    onlyUpFallTitle: '¡CAÍDA EN KRONOS ONLY UP!',
    onlyUpNewBest: '¡NUEVA ALTURA MÁXIMA!',
    onlyUpAltitude: 'Altura Alcanzada',
    onlyUpBestAltitude: 'Récord Personal',
    onlyUpClimbTime: 'Tiempo de Ascenso',
    onlyUpRetryBtn: 'Escalar de Nuevo',
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
    achievements: 'ACHIEVEMENTS',
    ribbonEras: '8 DIMENSIONAL ERAS',
    ribbonLevels: '22 LEVELS',
    ribbonBosses: 'EPIC BOSSES',
    ribbonSlots: '3 SLOTS',
    privacyPolicy: 'Privacy Policy',
    googleDocsLink: 'Google Docs',
    sevenZones: '7 ZONES',
    thirteenLevels: '13 LEVELS',
    sixBosses: '6 BOSSES',
    phasesAndAi: 'PHASES & AI',
    threeSlots: '3 SLOTS',
    autosave: 'AUTOSAVE',

    // Home Screen Exploration & Features
    scrollDownPrompt: 'SCROLL DOWN TO EXPLORE',
    exploreGameHeader: "WHAT'S IN ZION ADVENTURE?",
    gameModesTitle: 'GAME MODES & CHALLENGES',
    exploreGameSubtitle: 'Discover all game modes, dimensional eras, and combat abilities',
    modeStoryTitle: 'Main Adventure (8 Eras)',
    modeStoryDesc: 'Traverse 22 levels from the Neon Forest to Blizzard Rush, collect crystals, and defeat 6 epic bosses.',
    modeOnlyUpTitle: 'Kronos Only Up! (Vertical)',
    modeOnlyUpDesc: 'Infinite vertical platform tower into the sky with dynamic hazards. How high can you climb?',
    modeVsAiTitle: 'Race VS Artificial Intelligence',
    modeVsAiDesc: 'Compete head-to-head against bot runners across 4 difficulties with identical physics.',
    modeTimeAttackTitle: 'Time Attack Mode',
    modeTimeAttackDesc: 'Precision millisecond stopwatch with live ghost runner to perfect every jump.',
    modeOnlineTitle: 'Online 1v1 Multiplayer Duel',
    modeOnlineDesc: 'Create or join online rooms to duel in real-time and win seasonal trophies.',
    modeClockTitle: 'The Kronos Clock & Locker',
    modeClockDesc: 'Rebuild time pieces to unlock legendary skins to customize Zion.',
    playModeBtn: 'PLAY',
    exploreErasTitle: 'THE 8 DIMENSIONAL ERAS',
    exploreErasSubtitle: 'Unique worlds with dynamic biomes, environmental hazards, and guardians',
    exploreAbilitiesTitle: "ZION'S COMBAT ARSENAL",
    exploreAbilitiesSubtitle: 'Master temporal leaping and every combat technique',
    featureAutosaveTitle: 'Secure Autosave',
    featureAutosaveDesc: '3 independent memory slots that save your progress instantly on your device.',
    featureJukeboxTitle: 'Retro Chiptune Jukebox',
    featureJukeboxDesc: 'Epic original chiptune soundtrack composed with synthesizers and 16-bit arcade spirit.',
    featureMobileTitle: 'Optimized for Mobile',
    featureMobileDesc: 'High-response touch controls with virtual Joystick or classic D-Pad.',
    featureSafeTitle: '100% Safe & Private',
    featureSafeDesc: 'No invasive ads or hidden purchases, fully compliant with Google Play policies.',
    backToTopBtn: 'BACK TO TOP',

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
    zone_steampunk_name: 'Steampunk',
    zone_steampunk_sub: 'Steam Factory, Gears and 1000m Vertical Ascent',
    zone_castlesmash_name: 'Castle Smash',
    zone_castlesmash_sub: 'Medieval Siege, Stone Battlements and Lord Malakar',
    zone_piratestreasure_name: "Pirate's Treasure",
    zone_piratestreasure_sub: 'Tropical Beach, Submerged Reef & Cursed Chest Shipwreck',

    // Kronos Clock & Locker Cards
    clockRestored: '✓ PORTAL & CLOCK RESTORED',
    clockFractured: 'DIMENSIONAL PORTAL FRACTURED',
    clockTitle: 'KRONOS CLOCK — DIMENSIONAL PORTAL (12 PIECES)',
    lockerUnlockedBadge: 'Locker Unlocked',
    clockDesc: 'Rebuild the colossal dimensional portal mechanism with the 12 ancestral pieces (1 from each multiverse zone). All 12 sacred pieces are required to stabilize the nexus and unlock the Fortnite-style Skin Locker!',
    piecesCount: 'Portal Pieces [{placed}/12]:',
    enterClockCardBtn: 'ENTER KRONOS CLOCK',
    enterClockBtn: 'ENTER CLOCK',
    lockerShortcut: 'LOCKER',
    lockerCardTitle: 'SKIN LOCKER (FORTNITE STYLE)',
    lockerCardSub: 'Customize Zion with Legendary and Quantum Outfits',
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

    // Pause Modal
    pauseTitle: 'GAME PAUSED',
    pauseResume: 'RESUME',
    pauseRestart: 'Restart Level',
    pauseQuit: 'Quit',
    pauseControlsGuide: 'Controls Guide & Showdown',
    pauseSavedProgress: 'Progress Saved',
    pauseSfx: 'SFX Audio',
    pauseMusic: 'Chiptune Music',
    pausePerfTitle: '60 FPS Sync & Performance',
    pausePerfDesc: 'Smooth and consistent frame rate across all devices',
    pauseFixedPhysics: 'Fixed 60Hz Physics',
    pauseUltraMode: 'Ultra Fast Mode',
    pauseFpsCounter: 'Show FPS Counter',
    pauseTouchControls: 'Mobile Touch Controls',
    pauseTouchDesc: 'Choose Virtual Joystick or D-Pad buttons',

    // Victory Modal
    victoryTitle: 'PORTAL OPENED!',
    victoryAdventureComplete: 'ADVENTURE COMPLETED!',
    victorySpecialStageComplete: 'SPECIAL STAGE CLEARED!',
    victorySpecialStageSubtitle: 'Quantum Dimension Cleared',
    victoryCrystals: 'Crystals',
    victorySecrets: 'Secrets',
    victoryTime: 'Time',
    victoryEnemies: 'Enemies',
    victoryRankTitle: 'Performance Rank',
    victoryRankS: 'Legendary Mastery!',
    victoryRankA: 'Excellent Exploration!',
    victoryRankB: 'Good Performance!',
    victoryRankC: 'Level Cleared!',
    victoryNextAct: 'NEXT ACT',
    victoryReplay: 'Replay',
    victoryLevelPortal: 'LEVEL SELECT',
    victoryCreditsPortal: 'CREDITS PORTAL',
    victoryContinueAdventure: 'CONTINUE ADVENTURE',
    victoryJungleUnlockTitle: 'NEW ZONE UNLOCKED!',
    victoryJungleUnlockDesc: 'Zone 6: Jungle Run (Mayan Jungle) is now available',
    victoryKronosPieceTitle: 'ANCIENT KRONOS PIECE OBTAINED!',
    victoryKronosPieceDesc: 'Slot it into the Great Clock!',

    // Mode Level Select
    modeVsAiBadge: '1v1 Race vs Algorithm',
    modeTimeAttackBadge: 'Time Attack & Ghost',
    modeNoBossWarning: '(Boss levels excluded)',
    modeSelectTrackVsAi: 'SELECT TRACK FOR VS AI',
    modeSelectTrackTimeAttack: 'SELECT TRACK FOR TIME ATTACK',
    modeBossLevelBadge: 'Boss Level',
    modeBossExcluded: 'Not available in this mode (no bosses)',
    modeLevelLocked: 'Locked. Unlock in Adventure Mode',
    modeBestTime: 'Best Time',
    modeTrackDetails: 'Track Details',
    modeBossRestriction: 'Mode Restriction: Boss levels cannot be played in VS AI or Time Attack. Select Act 1 or 2.',
    modeAiDifficultyLabel: 'AI Rival Difficulty:',
    modeAiDiffNormal: 'Normal',
    modeAiDiffFast: 'Fast',
    modeAiDiffExpert: 'Expert',
    modeAiBotDesc: '🤖 AI bot will navigate platforms, jump obstacles, and race toward the goal in real time.',
    modePersonalBest: 'Personal Best:',
    modeNoRecordYet: 'No record yet',
    modeGhostOnTrack: 'Ghost on Track:',
    modeGhostActive: '✓ Active for Race',
    modeGhostNone: 'Not recorded yet',
    modeStartVsAiBtn: 'START RACE VS AI!',
    modeStartTimeAttackBtn: 'START TIME ATTACK!',

    // HUD
    hudLevelShort: 'LV.',
    hudDownhillBadge: 'DOWNHILL',
    hudPause: 'PAUSE',
    hudShieldBroken: 'Shield Broken!',
    hudShieldEnergy: 'Shield',
    hudSpEnergy: 'SP Energy',
    hudLives: 'Lives',
    hudCrystals: 'Crystals',
    hudYou: 'You',
    hudAiRival: 'AI Rival',

    // Kronos Clock View
    clockBackBtn: 'Back to Zones',
    clockNexusTitle: 'KRONOS DIMENSIONAL NEXUS',
    clockRestoredBadge: '✓ PORTAL RESTORED (12/12)',
    clockFracturedBadge: 'FRACTURED [{count}/12 PIECES]',
    clockMainTitle: 'THE KRONOS PORTAL & CLOCK',
    clockDemoBtn: 'Test 12/12 (Demo)',
    clockLockerBtn: 'SKINS LOCKER',
    clockLockerLocked: 'Locker Locked ({count}/12 pieces)',
    clockStatusRestored: '⚡ DIMENSIONAL PORTAL: 12 PIECES SYNCHRONIZED',
    clockStatusFractured: '⚠️ FRACTURED PORTAL — 12 PIECES REQUIRED',
    clockReplayCinematic: 'Replay Cinematic',
    clockPortalCompleteTitle: 'DIMENSIONAL PORTAL 100% ACTIVATED!',
    clockPortalFracturedTitle: 'FRACTURED PORTAL — REQUIRES 12 SACRED PIECES',
    clockPortalCompleteDesc: 'All 12 sacred pieces have been assembled into the Kronos portal. The dimensional flow is completely stabilized and the Skins Locker is open.',
    clockPortalFracturedDesc: 'All 12 ancient pieces (1 from each of the 12 zones) are required to reactivate the portal and unlock the Skins Locker. View all 12 sacred relics required here!',
    clockLockerUnlockedTitle: '🔓 CHARACTER LOCKER UNLOCKED',
    clockLockerLockedTitle: '🔒 LOCKER LOCKED — REQUIRES 12 PIECES',
    clockLockerUnlockedDesc: 'You restored all 12 pieces! Access the outfit dressing room and customize Zion.',
    clockLockerLockedDesc: 'Progress: {count}/12 pieces placed. Collect all 12 to unlock the Locker.',
    clockLockerOpenBtn: 'OPEN',
    clockPlaceAllBtn: 'PLACE ALL AVAILABLE PIECES ({count})',
    clockPieceAssembled: 'ASSEMBLED IN PORTAL',
    clockPieceInsert: 'SLOT INTO PORTAL',
    clockPieceSoon: 'Coming Soon ({boss})',

    // Character Locker
    lockerTitle: 'OUTFITS & SKINS DRESSING ROOM',
    lockerSubtitle: 'Choose your favorite dimensional look for Zion and customize his presence.',
    lockerBackBtn: 'Back',
    lockerSelectBtn: 'SELECT SKIN',
    lockerEquippedBadge: 'EQUIPPED',
    lockerLockedBadge: 'LOCKED',
    lockerUnlockPrompt: 'Unlock by completing the Kronos Clock (12 Pieces)',
    lockerStatsSpeed: 'Speed',
    lockerStatsJump: 'Jump',
    lockerStatsDefense: 'Defense',
    lockerStatsAttack: 'Attack',
    lockerAbilitiesHeader: 'COMBAT ABILITIES',

    // Dialog & Cutscenes
    dialogSkip: 'Skip story',
    dialogNext: 'CONTINUE',
    dialogStartLevel: 'START LEVEL',

    // Level Intro Banner
    introBossBattle: 'BOSS BATTLE',
    introObjectiveBoss: 'OBJECTIVE: Deactivate 3 Nodes & Defeat Boss',
    introObjectiveNormal: 'OBJECTIVE: Collect Crystals & Reach Portal',
    introTapToPlay: '(Tap to start playing)',

    // Result Modals
    vsAiWinTitle: 'RACE VICTORY!',
    vsAiLoseTitle: 'RACE DEFEAT!',
    vsAiWinHeader: 'YOU BEAT THE AI!',
    vsAiLoseHeader: '{ai} FINISHED FIRST!',
    vsAiWinDesc: 'Your quantum reflexes and jumping precision bested the algorithm.',
    vsAiLoseDesc: 'The AI optimized its path to the goal. Try again to beat it!',
    vsAiYourTime: 'Your Time',
    vsAiRivalTime: 'Rival Time',
    vsAiTrack: 'Track',
    vsAiDifficulty: 'Difficulty',
    vsAiRetryBtn: 'Retry Track',
    vsAiSelectTrackBtn: 'Change Track',
    vsAiMenuBtn: 'Main Menu',

    timeAttackResultTitle: 'TIME RECORDED!',
    timeAttackNewBest: 'NEW PERSONAL BEST!',
    timeAttackFinalTime: 'Final Time',
    timeAttackDelta: 'Delta vs Ghost',
    timeAttackPreviousBest: 'Previous Best',
    timeAttackGhostSaved: 'GHOST SAVED FOR FUTURE RACES',
    timeAttackRetryBtn: 'Retry Circuit',

    onlyUpFallTitle: 'FALL IN KRONOS ONLY UP!',
    onlyUpNewBest: 'NEW RECORD ALTITUDE!',
    onlyUpAltitude: 'Altitude Reached',
    onlyUpBestAltitude: 'Personal Record',
    onlyUpClimbTime: 'Climb Time',
    onlyUpRetryBtn: 'Climb Again',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS['es'];

export function translate(
  key: TranslationKey,
  lang: Language = getSavedLanguage(),
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['es'];
  let text = (dict as any)[key] || (TRANSLATIONS['es'] as any)[key] || key;

  if (params) {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    }
  }

  return text;
}

export const LEVEL_LOCALIZATION: Record<string, { titleEs: string; titleEn: string; subtitleEs: string; subtitleEn: string }> = {
  'neon-1': {
    titleEs: 'Zona 1 · Acto 1 — Bosque Neón',
    titleEn: 'Zone 1 · Act 1 — Neon Forest',
    subtitleEs: 'El Despertar de la Arboleda Antigua',
    subtitleEn: 'The Awakening of the Ancient Grove',
  },
  'neon-2': {
    titleEs: 'Zona 1 · Acto 2 — Copa Corrupta',
    titleEn: 'Zone 1 · Act 2 — Corrupted Canopy',
    subtitleEs: 'Árboles Cibernéticos y Peligros Sobrecargados',
    subtitleEn: 'Cyber Trees & Overcharged Hazards',
  },
  'neon-3': {
    titleEs: 'Zona 1 · Acto 3 — Núcleo Neón: Guardián Volt',
    titleEn: 'Zone 1 · Act 3 — Neon Core: Volt Guardian',
    subtitleEs: 'El Primer Gran Desafío de Zion',
    subtitleEn: "Zion's First Guardian Challenge",
  },
  'sakura-1': {
    titleEs: 'Zona 2 · Acto 1 — Valles del Cerezo',
    titleEn: 'Zone 2 · Act 1 — Whispering Petals',
    subtitleEs: 'Valles Espirituales y Santuario Kitsune',
    subtitleEn: 'Spiritual Valleys & Sacred Torii Paths',
  },
  'sakura-2': {
    titleEs: 'Zona 2 · Acto 2 — Puertas Torii de la Niebla',
    titleEn: 'Zone 2 · Act 2 — Mist Torii Gates',
    subtitleEs: 'Desfiladeros Celestiales y Espectros del Viento',
    subtitleEn: 'Celestial Gorges & Ethereal Phantoms',
  },
  'sakura-3': {
    titleEs: 'Zona 2 · Acto 3 — Santuario Sagrado: Kitsune Espiritual',
    titleEn: 'Zone 2 · Act 3 — Sacred Shrine: Spirit Kitsune',
    subtitleEs: 'El Guardián Celestial de Nueve Colas',
    subtitleEn: 'The Legendary Nine-Tailed Guardian',
  },
  'lavacliff-1': {
    titleEs: 'Zona 3 · Acto 1 — Cresta Volcánica',
    titleEn: 'Zone 3 · Act 1 — Volcanic Ridge',
    subtitleEs: 'Caminos de Magma y Ceniza Ardiente',
    subtitleEn: 'Magma Trails & Blazing Ash Platforms',
  },
  'lavacliff-2': {
    titleEs: 'Zona 3 · Acto 2 — Cavernas de Obsidiana',
    titleEn: 'Zone 3 · Act 2 — Obsidian Caverns',
    subtitleEs: 'Fosos de Fuego y Columnas de Humo',
    subtitleEn: 'Fire Pits & Molten Geysers',
  },
  'lavacliff-3': {
    titleEs: 'Zona 3 · Acto 3 — Trono de Caldera: Gólem Ígneo',
    titleEn: 'Zone 3 · Act 3 — Caldera Throne: Ignis Golem',
    subtitleEs: 'El Guardián del Núcleo Fundido',
    subtitleEn: 'The Colossus of Molten Core',
  },
  'desert-1': {
    titleEs: 'Zona 4 · Acto 1 — Mar de Arena',
    titleEn: 'Zone 4 · Act 1 — Sea of Sand',
    subtitleEs: 'Dunas Doradas y Ruinas Olvidadas',
    subtitleEn: 'Golden Dunes & Sunken Ruins',
  },
  'desert-2': {
    titleEs: 'Zona 4 · Acto 2 — Tumba de los Faraones',
    titleEn: 'Zone 4 · Act 2 — Tomb of the Pharaohs',
    subtitleEs: 'Pasajes Secretos y Trampas de Púas',
    subtitleEn: 'Hidden Passages & Spike Traps',
  },
  'desert-3': {
    titleEs: 'Zona 4 · Acto 3 — Cámara Sagrada: Guardián Anubis',
    titleEn: 'Zone 4 · Act 3 — Sacred Chamber: Anubis Warden',
    subtitleEs: 'El Juez de las Arenas Eternas',
    subtitleEn: 'The Sentinel of the Forgotten Sands',
  },
  'krono-1': {
    titleEs: 'Zona 5 · Acto 1 — Templo del Tiempo',
    titleEn: 'Zone 5 · Act 1 — Temple of Time',
    subtitleEs: 'Engranajes Colosales y Ruedas Dentadas',
    subtitleEn: 'Colossal Cogwheels & Clockwork Machinery',
  },
  'krono-2': {
    titleEs: 'Zona 5 · Acto 2 — Nexo Temporal',
    titleEn: 'Zone 5 · Act 2 — Temporal Nexus',
    subtitleEs: 'Plataformas Inestables y Desfases Cuánticos',
    subtitleEn: 'Unstable Platforms & Quantum Phase-Shifts',
  },
  'krono-3': {
    titleEs: 'Zona 5 · Acto 3 — Núcleo de Kronos: El Tejedor Temporal',
    titleEn: 'Zone 5 · Act 3 — Kronos Core: The Time Weaver',
    subtitleEs: 'La Batalla por el Flujo Cuántico',
    subtitleEn: 'The Clash for the Space-Time Continuum',
  },
  'krono-travel': {
    titleEs: 'Viaje Cuántico — Portal Hiperespacial',
    titleEn: 'Quantum Travel — Hyperspace Portal',
    subtitleEs: 'Desafío de Alta Velocidad hacia Nuevas Eras',
    subtitleEn: 'High-Speed Slipstream Challenge',
  },
  'jungle-1': {
    titleEs: 'Zona 6 · Acto 1 — Senderos de la Selva',
    titleEn: 'Zone 6 · Act 1 — Jungle Trails',
    subtitleEs: 'Lianas, Ciénagas y Monolitos Antiguos',
    subtitleEn: 'Ancient Vines, Swamps & Mayan Monoliths',
  },
  'jungle-2': {
    titleEs: 'Zona 6 · Acto 2 — Templo del Sol',
    titleEn: 'Zone 6 · Act 2 — Temple of the Sun',
    subtitleEs: 'Catacumbas Enraizadas y Trampas Ocultas',
    subtitleEn: 'Rooted Catacombs & Concealed Dart Traps',
  },
  'jungle-3': {
    titleEs: 'Zona 6 · Acto 3 — Altar del Jaguar: Balam',
    titleEn: 'Zone 6 · Act 3 — Altar of the Jaguar: Balam',
    subtitleEs: 'El Depredador de las Sombras Ancestrales',
    subtitleEn: 'The Shadow Predator of the Rainforest',
  },
  'blizzard-1': {
    titleEs: 'Zona 7 · Acto 1 — Cima Helada (Descenso en Esquís)',
    titleEn: 'Zone 7 · Act 1 — Frozen Summit (Downhill Skiing)',
    subtitleEs: 'Velocidad Extrema, Cavernas de Hielo y Bosque Polar',
    subtitleEn: 'Extreme Speed, Ice Caves & Polar Forest',
  },
  'blizzard-2': {
    titleEs: 'Zona 7 · Acto 2 — Paso del Glaciar',
    titleEn: 'Zone 7 · Act 2 — Glacier Pass',
    subtitleEs: 'Vientos Gélidos y Cornisas Resbaladizas',
    subtitleEn: 'Freezing Blizzards & Slippery Ice Ledges',
  },
  'blizzard-3': {
    titleEs: 'Zona 7 · Acto 3 — Guarida del Yeti: Yukio el Coloso',
    titleEn: 'Zone 7 · Act 3 — Yeti Lair: Yukio the Colossus',
    subtitleEs: 'El Titán de las Nieves Eternas',
    subtitleEn: 'The Abominable Titan of Eternal Snow',
  },
  'steampunk-1': {
    titleEs: 'Zona 8 · Acto 1 — Fundición a Vapor',
    titleEn: 'Zone 8 · Act 1 — Steam Foundry',
    subtitleEs: 'Pistones Hidráulicos, Chimeneas y Tuberías',
    subtitleEn: 'Hydraulic Pistons, Smoke Stacks & Brass Gears',
  },
  'steampunk-2': {
    titleEs: 'Zona 8 · Acto 2 — Fábrica de Engranajes',
    titleEn: 'Zone 8 · Act 2 — Gear Factory',
    subtitleEs: 'Calderas Hirvientes y Ascenso Mecánico 1000m',
    subtitleEn: 'Boiling Furnaces & 1000m Vertical Ascent',
  },
  'steampunk-3': {
    titleEs: 'Zona 8 · Acto 3 — Núcleo del Reactor: Vulkan-Ω',
    titleEn: 'Zone 8 · Act 3 — Reactor Core: Vulkan-Ω',
    subtitleEs: 'El Coloso del Vapor Hiperbárico',
    subtitleEn: 'The Colossal Hyperbaric Steam Engine',
  },
  'castlesmash-1': {
    titleEs: 'Zona 9 · Acto 1 — Murallas del Bastión',
    titleEn: 'Zone 9 · Act 1 — Bastion Ramparts',
    subtitleEs: 'Asedio Medieval, Almenas de Piedra y Barricadas',
    subtitleEn: 'Medieval Siege, Stone Battlements & Barricades',
  },
  'castlesmash-2': {
    titleEs: 'Zona 9 · Acto 2 — Mazmorras y Patio de Armas',
    titleEn: 'Zone 9 · Act 2 — Dungeons & Courtyard',
    subtitleEs: 'Muros Agrietados, Péndulos Afilados y Rejas de Asedio',
    subtitleEn: 'Cracked Masonry, Spiked Pendulums & Portcullises',
  },
  'castlesmash-3': {
    titleEs: 'Zona 9 · Acto 3 — Torre del Trono: Lord Malakar',
    titleEn: 'Zone 9 · Act 3 — Throne Tower: Lord Malakar',
    subtitleEs: 'El Coloso Rompemuros · El Blasón Real de Hierro',
    subtitleEn: 'The Wall-Breaker Warlord & The Royal Iron Crest',
  },
  'piratestreasure-1': {
    titleEs: 'Zona 10 · Acto 1 — Bahía del Corsario y Playa del Tesoro',
    titleEn: 'Zone 10 · Act 1 — Corsair Bay & Treasure Beach',
    subtitleEs: 'Costas de Arena Dorada, Palmeras Tropicales y Piratas Malditos',
    subtitleEn: 'Golden Sand Shores, Tropical Palms & Cursed Pirates',
  },
  'piratestreasure-2': {
    titleEs: 'Zona 10 · Acto 2 — Arrecife Submarino y Fosa Abisal',
    titleEn: 'Zone 10 · Act 2 — Submerged Reef & Abyssal Trench',
    subtitleEs: 'Inmersión Oceánica · Menor Gravedad, Medusas Eléctricas y Géiseres',
    subtitleEn: 'Ocean Dive · Low Gravity, Electric Jellyfish & Geysers',
  },
  'piratestreasure-3': {
    titleEs: 'Zona 10 · Acto 3 — El Naufragio y el Cofre Maldito',
    titleEn: 'Zone 10 · Act 3 — The Shipwreck & Cursed Chest',
    subtitleEs: 'Fosa Abisal · Batalla contra el Titánico Mímico del Naufragio',
    subtitleEn: 'Abyssal Trench · Battle against the Titanic Shipwreck Mimic',
  },
};

export function getLevelTitle(configOrId: { id: string; title: string; act?: number } | string, lang: Language): string {
  const id = typeof configOrId === 'string' ? configOrId : configOrId.id;
  const item = LEVEL_LOCALIZATION[id];
  if (item) {
    return lang === 'es' ? item.titleEs : item.titleEn;
  }
  if (typeof configOrId !== 'string') {
    if (lang === 'en') {
      return configOrId.title
        .replace(/Zona (\d+)/i, 'Zone $1')
        .replace(/Acto (\d+)/i, 'Act $1');
    }
    return configOrId.title;
  }
  return id;
}

export function getLevelSubtitle(configOrId: { id: string; subtitle: string } | string, lang: Language): string {
  const id = typeof configOrId === 'string' ? configOrId : configOrId.id;
  const item = LEVEL_LOCALIZATION[id];
  if (item) {
    return lang === 'es' ? item.subtitleEs : item.subtitleEn;
  }
  if (typeof configOrId !== 'string') {
    return configOrId.subtitle;
  }
  return '';
}

export const ZONE_NAMES_EN: Record<string, { name: string; subtitle: string }> = {
  neon: { name: 'Neon Forest', subtitle: 'The Awakening of the Ancient Grove' },
  sakura: { name: 'Spirit Blossom', subtitle: 'Spiritual Valleys and Kitsune Shrine' },
  lavacliff: { name: 'Lava Cliffs', subtitle: 'Magma Calderas, Fire Pits and Fire Titan' },
  desert: { name: 'Sand Dunes', subtitle: 'Golden Pyramids, Ancient Traps and Anubis Guardian' },
  krono: { name: 'Kronos Temple', subtitle: 'Temporal Machinery and Giant Cogwheels' },
  travel: { name: 'Quantum Travel', subtitle: 'High-Speed Dimensional Slipstream' },
  jungle: { name: 'Jungle Run', subtitle: 'Mayan Ruins, Vines and Apex Predator Balam' },
  blizzard: { name: 'Blizzard Rush', subtitle: 'Downhill Skiing, Snowy Forest and Colossal Yeti' },
  steampunk: { name: 'Steampunk', subtitle: 'Steam Factory, Gears and 1000m Only Up Boss' },
  castlesmash: { name: 'Castle Smash', subtitle: 'Medieval Siege, Stone Battlements and Lord Malakar' },
  piratestreasure: { name: 'Pirates Treasure', subtitle: 'Tropical Beach, Submerged Reef & Cursed Chest Shipwreck' },
  jurasicdraft: { name: 'Jurassic Draft', subtitle: 'Mesozoic Jungle, Pterodactyls and Colossal T-Rex' },
  themoon: { name: 'The Moon', subtitle: 'Sea of Tranquility, Low Gravity and Mecha Titan' },
};

export function getZoneLocalizedName(zoneId: string, lang: Language): string {
  if (lang === 'en') {
    return ZONE_NAMES_EN[zoneId]?.name || zoneId;
  }
  if (zoneId === 'blizzard') return 'Blizzard Rush';
  if (zoneId === 'steampunk') return 'Steampunk';
  if (zoneId === 'castlesmash') return 'Castle Smash';
  if (zoneId === 'piratestreasure') return 'Pirates Treasure';
  if (zoneId === 'jurasicdraft') return 'Jurasic draft';
  if (zoneId === 'themoon') return 'The moon';
  const key = `zone_${zoneId}_name` as TranslationKey;
  return translate(key, 'es');
}

export function getZoneLocalizedSubtitle(zoneId: string, lang: Language): string {
  if (lang === 'en') {
    return ZONE_NAMES_EN[zoneId]?.subtitle || '';
  }
  if (zoneId === 'blizzard') return 'Descenso en Esquís, Bosque Nevado y el Yeti Colosal';
  if (zoneId === 'steampunk') return 'Fábrica de Vapor, Engranajes y Ascenso Only Up 1000m';
  if (zoneId === 'castlesmash') return 'Asedio Medieval, Almenas de Piedra y Lord Malakar';
  if (zoneId === 'piratestreasure') return 'Costas Tropicales, Arrecife Submarino y el Cofre Maldito';
  if (zoneId === 'jurasicdraft') return 'Jungla Mesozoica, Pterodáctilos y T-Rex Colosal';
  if (zoneId === 'themoon') return 'Mar de la Tranquilidad, Baja Gravedad y Mecha Titán';
  const key = `zone_${zoneId}_subtitle` as TranslationKey;
  return translate(key, 'es');
}

export const KRONOS_PIECES_LOCALIZATION: Record<string, {
  nameEs: string;
  nameEn: string;
  subtitleEs: string;
  subtitleEn: string;
  bossNameEs: string;
  bossNameEn: string;
  zoneNameEs: string;
  zoneNameEn: string;
  loreEs: string;
  loreEn: string;
}> = {
  neon: {
    nameEs: 'Prisma de Bioluminiscencia',
    nameEn: 'Bioluminescent Prism',
    subtitleEs: 'Núcleo Neón de la Arboleda',
    subtitleEn: 'Neon Core of the Grove',
    bossNameEs: 'Guardián Volt',
    bossNameEn: 'Volt Guardian',
    zoneNameEs: 'Bosque Neón (Acto 3)',
    zoneNameEn: 'Neon Forest (Act 3)',
    loreEs: 'Focaliza la energía fotónica que nutre los árboles cibernéticos.',
    loreEn: 'Focuses photonic energy that nourishes the cybernetic trees.',
  },
  sakura: {
    nameEs: 'Espejo de los Nueve Espíritus',
    nameEn: 'Mirror of the Nine Spirits',
    subtitleEs: 'Reliquia Sagrada del Zorro Celestial',
    subtitleEn: 'Sacred Relic of the Celestial Fox',
    bossNameEs: 'Kitsune Espiritual',
    bossNameEn: 'Spirit Kitsune',
    zoneNameEs: 'Cerezo Espiritual (Acto 3)',
    zoneNameEn: 'Spirit Blossom (Act 3)',
    loreEs: 'Refleja la pureza espiritual de las flores de cerezo y disipa la corrupción.',
    loreEn: 'Reflects the spiritual purity of cherry blossoms and dispels corruption.',
  },
  lavacliff: {
    nameEs: 'Corazón de Magma de Obsidiana',
    nameEn: 'Obsidian Magma Heart',
    subtitleEs: 'Núcleo del Coloso Ígneo',
    subtitleEn: 'Core of the Molten Colossus',
    bossNameEs: 'Gólem Ígneo',
    bossNameEn: 'Ignis Golem',
    zoneNameEs: 'Acantilados de Lava (Acto 3)',
    zoneNameEn: 'Lava Cliffs (Act 3)',
    loreEs: 'Forjado en el corazón del cráter volcánico, arde con calor eterno.',
    loreEn: 'Forged in the heart of the volcanic crater, burning with eternal heat.',
  },
  desert: {
    nameEs: 'Ankh Dorado de las Arenas',
    nameEn: 'Golden Ankh of the Sands',
    subtitleEs: 'Amuleto Solar de la Eternidad',
    subtitleEn: 'Solar Amulet of Eternity',
    bossNameEs: 'Guardián Anubis',
    bossNameEn: 'Anubis Warden',
    zoneNameEs: 'Dunas de Arena (Acto 3)',
    zoneNameEn: 'Sand Dunes (Act 3)',
    loreEs: 'Antiguo artefacto faraónico que custodia los secretos del reloj de sol.',
    loreEn: 'Ancient pharaonic artifact guarding the secrets of the sundial.',
  },
  krono: {
    nameEs: 'Engranaje de la Singularidad Temporal',
    nameEn: 'Temporal Singularity Gear',
    subtitleEs: 'Corona Maestra de Chronos',
    subtitleEn: 'Master Crown of Chronos',
    bossNameEs: 'El Tejedor Temporal',
    bossNameEn: 'The Time Weaver',
    zoneNameEs: 'Templo de Kronos (Acto 3)',
    zoneNameEn: 'Kronos Temple (Act 3)',
    loreEs: 'El engranaje maestro que regula el flujo continuo de las eras.',
    loreEn: 'The master gear regulating the continuous flow of eras.',
  },
  travel: {
    nameEs: 'Catalizador Cuántico Hiperespacial',
    nameEn: 'Quantum Hyperspace Catalyst',
    subtitleEs: 'Matriz Perforadora de Dimensiones',
    subtitleEn: 'Dimension-Piercing Matrix',
    bossNameEs: 'Hiper-Rift Cuántico',
    bossNameEn: 'Quantum Hyper-Rift',
    zoneNameEs: 'Viaje Cuántico (Acto 1)',
    zoneNameEn: 'Quantum Travel (Act 1)',
    loreEs: 'Acelera las partículas a velocidades relativistas para saltar entre eras.',
    loreEn: 'Accelerates particles to relativistic speeds to leap across eras.',
  },
  jungle: {
    nameEs: 'Tótem de Jade del Jaguar Alfa',
    nameEn: 'Jade Totem of the Apex Jaguar',
    subtitleEs: 'Reliquia Sagrada de la Selva Maya',
    subtitleEn: 'Sacred Relic of the Mayan Jungle',
    bossNameEs: 'Balam, Depredador de Sombras',
    bossNameEn: 'Balam, Shadow Predator',
    zoneNameEs: 'Jungle Run (Acto 3)',
    zoneNameEn: 'Jungle Run (Act 3)',
    loreEs: 'Tallado por los sabios mayas, protege los monolitos del templo solar.',
    loreEn: 'Carved by Mayan sages, protecting the monoliths of the sun temple.',
  },
  blizzard: {
    nameEs: 'Núcleo Criogénico del Permafrost',
    nameEn: 'Cryogenic Permafrost Core',
    subtitleEs: 'Cristal Glacial de las Cumbres',
    subtitleEn: 'Glacial Crystal of the Peaks',
    bossNameEs: 'Yukio el Coloso',
    bossNameEn: 'Yukio the Colossus',
    zoneNameEs: 'Blizzard Rush (Acto 3)',
    zoneNameEn: 'Blizzard Rush (Act 3)',
    loreEs: 'Mantiene las temperaturas bajo cero y calma las ventiscas perpetuas.',
    loreEn: 'Maintains sub-zero temperatures and calms perpetual blizzards.',
  },
  steampunk: {
    nameEs: 'Núcleo Térmico de Vapor y Latón',
    nameEn: 'Thermal Core of Steam and Brass',
    subtitleEs: 'Engranaje de Alta Presión',
    subtitleEn: 'High-Pressure Gear',
    bossNameEs: 'Vulkan-Ω, Coloso del Reactor',
    bossNameEn: 'Vulkan-Ω, Reactor Colossus',
    zoneNameEs: 'Steampunk (Acto 3)',
    zoneNameEn: 'Steampunk (Act 3)',
    loreEs: 'Genera vapor hiperbárico a 1000m de altura para accionar el portal.',
    loreEn: 'Generates hyperbaric steam at 1000m altitude to power the portal.',
  },
  castlesmash: {
    nameEs: 'Blasón Real del Bastión de Hierro',
    nameEn: 'Royal Bastion Crest',
    subtitleEs: 'Emblema Feudal Forjado en Frío',
    subtitleEn: 'Cold-Forged Feudal Emblem',
    bossNameEs: 'Lord Malakar, Señor del Asedio',
    bossNameEn: 'Lord Malakar, Bastion Lord',
    zoneNameEs: 'Castle Smash (Acto 3)',
    zoneNameEn: 'Castle Smash (Act 3)',
    loreEs: 'Escudo heráldico templado que refuerza la estructura del marco temporal.',
    loreEn: 'Tempered heraldic shield strengthening the temporal framework.',
  },
  piratestreasure: {
    nameEs: 'Astrolabio Dorado del Corsario',
    nameEn: "Corsair's Golden Astrolabe",
    subtitleEs: 'Brújula Mística de Altamar',
    subtitleEn: 'Mystic High Seas Compass',
    bossNameEs: 'El Cofre Maldito del Naufragio',
    bossNameEn: 'The Cursed Mimic Chest of the Shipwreck',
    zoneNameEs: "Pirate's Treasure (Act 3)",
    zoneNameEn: "Pirate's Treasure (Act 3)",
    loreEs: 'Guía las corrientes oceánicas y revela rutas sumergidas en el tiempo.',
    loreEn: 'Guides oceanic currents and reveals submerged routes across time.',
  },
  jurasicdraft: {
    nameEs: 'Ojo de Ámbar Primordial',
    nameEn: 'Primordial Amber Eye',
    subtitleEs: 'Corazón Fósil de Titanosaurio',
    subtitleEn: 'Fossil Heart of Titanosaur',
    bossNameEs: 'Apex T-Rex Colosal',
    bossNameEn: 'Colossal Apex T-Rex',
    zoneNameEs: 'Jurassic Draft (Acto 3)',
    zoneNameEn: 'Jurassic Draft (Act 3)',
    loreEs: 'Encapsula el ADN cinético primario de la era de los grandes reptiles.',
    loreEn: 'Encapsulates the raw kinetic DNA of the great reptilian era.',
  },
  themoon: {
    nameEs: 'Matriz Gravitacional Lunar',
    nameEn: 'Lunar Gravitational Matrix',
    subtitleEs: 'Módulo de Titanio de Cero Gravedad',
    subtitleEn: 'Zero-G Titanium Module',
    bossNameEs: 'Titán Mecha Orbital',
    bossNameEn: 'Orbital Mecha Titan',
    zoneNameEs: 'The Moon (Acto 3)',
    zoneNameEn: 'The Moon (Act 3)',
    loreEs: 'Estabiliza el horizonte gravitacional y sella la conexión intergaláctica.',
    loreEn: 'Stabilizes the gravitational horizon and seals the intergalactic link.',
  },
};

export function getKronosPieceLocalized(pieceId: string, lang: Language) {
  const p = KRONOS_PIECES_LOCALIZATION[pieceId];
  if (!p) {
    return {
      name: pieceId,
      subtitle: '',
      bossName: '',
      zoneName: '',
      lore: '',
    };
  }
  return {
    name: lang === 'es' ? p.nameEs : p.nameEn,
    subtitle: lang === 'es' ? p.subtitleEs : p.subtitleEn,
    bossName: lang === 'es' ? p.bossNameEs : p.bossNameEn,
    zoneName: lang === 'es' ? p.zoneNameEs : p.zoneNameEn,
    lore: lang === 'es' ? p.loreEs : p.loreEn,
  };
}

export function getLocalizedLoreItem(
  loreItem: { title: string; lines: string[]; author?: string },
  lang: Language
): { title: string; lines: string[]; author?: string } {
  if (lang === 'es') return loreItem;

  const title = loreItem.title
    .replace(/ZION — EL BOSQUE NEÓN/i, 'ZION — THE NEON FOREST')
    .replace(/GUÍA DE COMBATE Y HABILIDADES/i, 'COMBAT GUIDE & ABILITIES')
    .replace(/SANTUARIO DEL CEREZO/i, 'SHRINE OF THE SPIRIT BLOSSOM')
    .replace(/LOS ACANTILADOS DE MAGMA/i, 'THE MAGMA CLIFFS')
    .replace(/EL MAR DE ARENA/i, 'THE SEA OF SAND')
    .replace(/EL TEMPLO DE KRONOS/i, 'THE TEMPLE OF KRONOS')
    .replace(/LA SELVA MAYA/i, 'THE MAYAN JUNGLE')
    .replace(/LA CIMA HELADA/i, 'THE FROZEN SUMMIT')
    .replace(/LA FUNDICIÓN DE VAPOR/i, 'THE STEAM FOUNDRY')
    .replace(/EL BASTIÓN MEDIEVAL/i, 'THE MEDIEVAL BASTION')
    .replace(/SOBRECARGA EN LA CALDERA COLOSAL \(1000 METROS\)/i, 'OVERLOAD AT THE COLOSSAL BOILER (1000 METERS)')
    .replace(/EL ASEDIO AL BASTIÓN DE HIERRO/i, 'THE SIEGE OF THE IRON BASTION')
    .replace(/EL PATIO DE ARMAS Y LAS CATACUMBAS/i, 'THE COURTYARD AND CATACOMBS')
    .replace(/EL DESAFÍO DE LORD MALAKAR/i, 'THE DUEL WITH LORD MALAKAR')
    .replace(/DESEMBARCO EN LA COSTA PIRATA/i, 'LANDFALL ON THE CORSAIR COAST')
    .replace(/EL REINO DE LA BAJA GRAVEDAD/i, 'THE REALM OF LOW GRAVITY')
    .replace(/EL NAUFRAGIO DEL GALÉON MALDITO/i, 'THE SHIPWRECK OF THE CURSED GALLEON');

  const translatedLines = loreItem.lines.map((line) => {
    if (line.includes('A/D o Joystick')) {
      return '• A/D or Joystick: Smooth acceleration movement. SPACE: Jump.';
    }
    if (line.includes('ATAQUE (J/Z)')) {
      return '• ATTACK (J/Z): 3-hit light blade melee combo.';
    }
    if (line.includes('DAGAS (K/X)')) {
      return '• DAGGERS (K/X): Rechargeable ranged energy projectiles.';
    }
    if (line.includes('BLOQUEO (E/C)')) {
      return '• BLOCK (E/C): Deploy a light shield. Time it right for a Parry!';
    }
    if (line.includes('ESQUIVA/DASH')) {
      return '• DODGE/DASH (Shift/L): Quick invulnerable dash to phase through hazards.';
    }
    if (line.includes('ESPECIAL (Q/V)')) {
      return '• SPECIAL (Q/V): Detonate an energy shockwave when your SP gauge is full.';
    }
    if (line.includes('Hace generaciones, el Bosque Neón')) {
      return 'Generations ago, the Neon Forest protected pure energy capable of illuminating worlds.';
    }
    if (line.includes('Pero una misteriosa señal ha corrompido')) {
      return 'Now a mysterious signal has corrupted its mechanical guardians and warped nature.';
    }
    if (line.includes('Zion empuña su espada de luz')) {
      return 'Zion wields his blade of light and daggers to enter the glowing grove.';
    }
    if (line.includes('Frente a Zion se alzan los muros ciclópeos')) {
      return 'Before Zion rise the cyclopean walls of the Feudal Bastion in Castle Smash.';
    }
    if (line.includes('Los soldados de Lord Malakar han fortificado')) {
      return 'Lord Malakar\'s forces fortified every gateway with heavy oak barricades and iron chains.';
    }
    if (line.includes('Para avanzar hacia el interior de la fortaleza')) {
      return 'To breach the fortress interior, you must destroy these defensive barriers with your sword and daggers.';
    }
    if (line.includes('Las mazmorras subterráneas del castillo')) {
      return 'The subterranean castle dungeons are guarded by stone golems and armored shield knights.';
    }
    if (line.includes('Péndulos gigantes con púas oscilan')) {
      return 'Giant spiked pendulums swing over drop-pits while crumbling walls block upper watchtowers.';
    }
    if (line.includes('Derrumba los muros de piedra')) {
      return 'Demolish cracked masonry and dodge iron portcullises to breach the inner throne room!';
    }
    if (line.includes('En la cúspide de la torre fortaleza aguarda Lord Malakar')) {
      return 'At the summit of the fortress waits Lord Malakar, the warlord of the Demolisher Hammer.';
    }
    if (line.includes('Protegido tras escudos-baluarte destructibles')) {
      return 'Shielded behind fortified barricades, this titan crushes ramparts and summons fortress catapults.';
    }
    if (line.includes('Destruye sus barricadas defensivas')) {
      return 'Smash his defensive bastions, evade crushing hammer blows, and claim the 9th Quantum Clock piece!';
    }
    if (line.includes('Las corrientes dimensionales transportan a Zion a una deslumbrante')) {
      return 'Dimensional currents carry Zion to a dazzling Caribbean coastline bathed in turquoise tides.';
    }
    if (line.includes('Entre palmeras tropicales, muelles de madera flotante')) {
      return 'Among tropical palms, driftwood piers, and coral bluffs, skeletal corsairs and armored crabs stand guard.';
    }
    if (line.includes('Cruza las arenas, esquiva los cocos')) {
      return 'Sprint across the sands, dodge falling coconuts and bombs, and prepare to dive into the ocean trench!';
    }
    if (line.includes('Zion se sumerge en las profundidades del océano')) {
      return 'Zion dives into the abyssal ocean. Gravity is heavily reduced, allowing buoyant leaps and graceful glides.';
    }
    if (line.includes('Corales luminosos, medusas flotantes')) {
      return 'Luminous corals, floating electric jellyfish, and sea geysers define this submerged reef.';
    }
    if (line.includes('En el fondo de la fosa descansa el galeón pirata')) {
      return 'At the trench bed rests the ghost galleon, guarding the fabled Cursed Mimic Chest!';
    }
    if (line.includes('El cofre cobra vida con afiladas fauces')) {
      return 'The mimic chest springs to life with razor fangs, unleashing energy orbs and whirlpool surges.';
    }
    if (line.includes('Desactiva sus defensas, vence a la bestia')) {
      return 'Disable its defenses, vanquish the beast, and claim the 10th ancestral piece: Corsair\'s Golden Astrolabe!';
    }
    return line;
  });

  return {
    title,
    lines: translatedLines,
    author: loreItem.author
      ? loreItem.author
          .replace('Crónicas de los Bosques', 'Chronicles of the Groves')
          .replace('Manual de Combate', 'Combat Manual')
          .replace('Pergaminos Sagrados', 'Sacred Scrolls')
          .replace('Crónicas de los Guardianes', 'Chronicles of the Guardians')
          .replace('Bitácora del Corsario', "Corsair's Logbook")
          .replace('Archivo de la Zona Abandonada', 'Abandoned Zone Archives')
          .replace('Protocolo de Emergencia Térmica', 'Thermal Emergency Protocol')
      : undefined,
  };
}

export function getLocalizedLore(
  config: LevelConfig,
  lang: Language
): Array<{ title: string; lines: string[]; author?: string }> {
  if (!config.lore || config.lore.length === 0) return [];
  return config.lore.map((item) => getLocalizedLoreItem(item, lang));
}
