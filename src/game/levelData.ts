import { Boss, Checkpoint, Collectible, Enemy, Hazard, Landmark, LevelConfig, NodePillar, Platform, SecretItem } from '../types';

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    id: 'neon-1',
    zone: 'neon',
    act: 1,
    title: 'Zona 1 · Acto 1 — Bosque Neón',
    subtitle: 'El Despertar de la Arboleda Antigua',
    lore: [
      {
        title: 'ZION — EL BOSQUE NEÓN',
        lines: [
          'Hace generaciones, el Bosque Neón protegía una energía pura capaz de iluminar los mundos.',
          'Pero una misteriosa señal ha corrompido a sus guardianes mecánicos y alterado el flujo natural.',
          'Zion empuña su espada de luz y dagas arrojadizas para adentrarse en la arboleda bioluminiscente.'
        ],
        author: 'Crónicas de los Bosques'
      },
      {
        title: 'GUÍA DE COMBATE Y HABILIDADES',
        lines: [
          '• A/D o Joystick: Moverse con aceleración suave. ESPACIO: Saltar.',
          '• ATAQUE (J/Z): Combo cuerpo a cuerpo de espada de luz.',
          '• DAGAS (K/X): Proyectiles de energía recargables a distancia.',
          '• BLOQUEO (E/C): Despliega un escudo de luz. ¡Bloquea a tiempo para Parry!',
          '• ESQUIVA/DASH (Shift/L): Deslizamiento rápido e invulnerable para esquivar trampas.',
          '• ESPECIAL (Q/V): Detona una explosión de energía al llenar tu barra de SP.'
        ],
        author: 'Manual de Combate'
      }
    ],
    worldWidth: 7200,
    themeColor: '#22d3ee',
    accentColor: '#4ade80'
  },
  {
    id: 'neon-2',
    zone: 'neon',
    act: 2,
    title: 'Zona 1 · Acto 2 — El Guardián',
    subtitle: 'El Núcleo del Santuario Tecnológico',
    lore: [
      {
        title: 'EL SANTUARIO CENTRAL',
        lines: [
          'Las raíces metálicas convergen en una gran cámara sellada por una barrera impenetrable.',
          'El Guardián Neón protege el paso con un escudo de plasma cargado por 3 Nodos de Energía.',
          'Para vulnerar su defensa, debes impactar con tus dagas o espada los 3 pilares antes de atacarlo.'
        ],
        author: 'Advertencia del Centinela'
      }
    ],
    worldWidth: 6800,
    themeColor: '#06b6d4',
    accentColor: '#a855f7'
  },
  {
    id: 'sakura-1',
    zone: 'sakura',
    act: 1,
    title: 'Zona 2 · Acto 1 — Bajo los Cerezos',
    subtitle: 'El Sendero Sagrado de los Pétalos',
    lore: [
      {
        title: '🌸 EL BOSQUE DE CEREZO JAPONÉS',
        lines: [
          'Tras apaciguar al Guardián Neón, una puerta mística te transporta al oriente eterno.',
          'Aquí los cerezos florecen sin cesar, pero espíritus kitsune y guardianes kage patrullan los puentes.',
          'Usa el viento sagrado y tu Dash invulnerable para cruzar los precipicios y templos torii.'
        ],
        author: 'Códice Sakura'
      }
    ],
    worldWidth: 7400,
    themeColor: '#f472b6',
    accentColor: '#fb7185'
  },
  {
    id: 'sakura-2',
    zone: 'sakura',
    act: 2,
    title: 'Zona 2 · Acto 2 — Cuando Cae la Noche',
    subtitle: 'Duelo Lunar contra la Maestra Ninja',
    lore: [
      {
        title: '🌙 EL TEMPLO DE LA LUNA ROJA',
        lines: [
          'La noche cubre el bosque de cerezos. Plataformas lunares aparecen y desaparecen al compás de la luna.',
          'En el patio principal del templo aguarda la Maestra Ninja Rosa, custodia del misterio oriental.',
          'Usa tu Escudo de Luz para bloquear sus shurikens y contraataca con tu habilidad especial.'
        ],
        author: 'Pergamino del Eclipse'
      }
    ],
    worldWidth: 7200,
    themeColor: '#e879f9',
    accentColor: '#38bdf8'
  },
  {
    id: 'lavacliff-1',
    zone: 'lavacliff',
    act: 1,
    title: 'Zona 3 · Acto 1 — Lavacliff: Acantilados Volcánicos',
    subtitle: 'El Rugido del Caldero Exterior',
    lore: [
      {
        title: '🌋 LOS ACANTILADOS DE LAVACLIFF',
        lines: [
          'Más allá de los bosques sagrados se alza la imponente caldera volcánica de Lavacliff.',
          'Ríos de magma ardiente fluyen por las fallas geológicas mientras géiseres de fuego rugen en la superficie.',
          'Las rocas basálticas se hunden bajo tu peso: muévete con agilidad y esquiva las salamandras escupefuego.'
        ],
        author: 'Diario del Cartógrafo Ígneo'
      },
      {
        title: 'PELIGROS DE LA CORTEZA VOLCÁNICA',
        lines: [
          '• ROCAS BASÁLTICAS: Se hunden lentamente al pisarlas antes de recuperarse.',
          '• GÉISERES DE FUEGO: Emiten humo antes de desatar una llamarada vertical letal.',
          '• ESTALACTITAS ARDIENTES: Caerán al detectar tu presencia debajo de ellas.',
          '• LAVA FUNDIDA: El contacto con el magma quema y drena la salud al instante.'
        ],
        author: 'Guía de Supervivencia'
      }
    ],
    worldWidth: 7800,
    themeColor: '#f97316',
    accentColor: '#ef4444'
  },
  {
    id: 'lavacliff-2',
    zone: 'lavacliff',
    act: 2,
    title: 'Zona 3 · Acto 2 — Lavacliff: Núcleo de Magma Subterráneo',
    subtitle: 'El Coloso de Magma Primordial',
    lore: [
      {
        title: '🔥 EL NÚCLEO DE MAGMA SUBTERRÁNEO',
        lines: [
          'Has descendido a las profundidades de la caldera volcánica, donde el calor distorsiona la realidad.',
          'En el corazón del magma arde Ignis, el Coloso de Magma Primordial, custodiando la forja del planeta.',
          'Aprovecha tus habilidades, esquiva sus golpes sísmicos de magma y quiebra su armadura volcánica.'
        ],
        author: 'Profecía de la Llama Eterna'
      }
    ],
    worldWidth: 7600,
    themeColor: '#dc2626',
    accentColor: '#f59e0b'
  },
  {
    id: 'desert-1',
    zone: 'desert',
    act: 1,
    title: 'Zona 4 · Acto 1 — Santuario del Desierto: Dunas Olvidadas',
    subtitle: 'El Susurro de las Pirámides Doradas',
    lore: [
      {
        title: '☀️ EL SANTUARIO DEL DESIERTO',
        lines: [
          'En los confines del reino se extiende el inhóspito Santuario del Desierto, tierra de antiguos faraones.',
          'Vientos abrasadores levantan tormentas de arena mientras escarabajos dorados y serpientes cornudas custodian las ruinas.',
          'Cuidado con las fosas de arena movediza y las gigantescas cuchillas oscilantes de los antiguos arquitectos.'
        ],
        author: 'Papiro del Nómada Solar'
      },
      {
        title: 'TRAMPAS Y AMENAZAS DEL DESIERTO',
        lines: [
          '• ARENA MOVEDIZA: Te hundirás rápidamente si te detienes; salta o usa Dash para escapar.',
          '• CUCHILLAS PENDULARES: Guadañas oscilantes que seccionan los pasajes estrechos.',
          '• ESCARABAJOS ACORAZADOS: Blindados y veloces; bloquéalos con tu escudo antes de atacar.',
          '• SERPIENTES DE ARENA: Emergen por sorpresa disparando veneno y púas doradas.'
        ],
        author: 'Tablilla de Advertencia'
      }
    ],
    worldWidth: 8200,
    themeColor: '#f59e0b',
    accentColor: '#10b981'
  },
  {
    id: 'desert-2',
    zone: 'desert',
    act: 2,
    title: 'Zona 4 · Acto 2 — Cripta del Faraón: El Sepulcro Sagrado',
    subtitle: 'El Despertar de la Momia Eterna',
    lore: [
      {
        title: '⚱️ EL SEPULCRO DEL FARAÓN AKHEN\'RA',
        lines: [
          'Te adentras en la cámara subterránea del santuario, iluminada por antorchas de fuego místico y jeroglíficos mágicos.',
          'Estatuas de Anubis disparan rayos malditos y guerreros momificados custodian el sarcófago dorado.',
          'En el trono del sepulcro te aguarda el Faraón Akhen\'Ra, la Momia Eterna, listo para desatar la maldición milenaria.'
        ],
        author: 'Inscripción del Sarcófago'
      }
    ],
    worldWidth: 8000,
    themeColor: '#d97706',
    accentColor: '#8b5cf6'
  },
  {
    id: 'krono-1',
    zone: 'krono',
    act: 1,
    title: 'Zona 5 · Acto 1 — Krono City: Distrito Tecnológico',
    subtitle: 'Autopistas de Neón y Redes de Plasma',
    lore: [
      {
        title: '🏙️ KRONO CITY — LA METRÓPOLIS DEL TIEMPO',
        lines: [
          'Más allá del Santuario del Desierto se oculta Krono City, la cúspide de la tecnología y el control temporal.',
          'Rascacielos cibernéticos de aleación y autopistas holográficas se extienden bajo un cielo de datos.',
          'Drones cazadores, torretas de plasma y sabuesos biónicos patrullan las cintas transportadoras y barreras electromagnéticas.'
        ],
        author: 'Bitácora del Sistema Kronos'
      },
      {
        title: 'NUEVAS MECÁNICAS DE KRONO CITY',
        lines: [
          '• CINTAS TRANSPORTADORAS: Aceleran o frenan tu avance en la dirección de la energía.',
          '• SUELOS EMP ELECTRIFICADOS: Descargas periódicas de alto voltaje; salta o usa Dash para no recibir daño.',
          '• DRONES Y TORRETAS CIBER: Apuntan con lásers de precisión; desvía sus disparos con bloqueo o destruye sus emisores.',
          '• SABUESOS BIÓNICOS: Rápidos y letales; embisten en línea recta al detectar tu proximidad.'
        ],
        author: 'Manual Cibernético'
      }
    ],
    worldWidth: 8400,
    themeColor: '#06b6d4',
    accentColor: '#3b82f6'
  },
  {
    id: 'krono-2',
    zone: 'krono',
    act: 2,
    title: 'Zona 5 · Acto 2 — Krono City: Reactor de Fusión & Red Central',
    subtitle: 'El Laberinto de Alta Tensión sin Retorno',
    lore: [
      {
        title: '⚡ REACTOR DE FUSIÓN & RED CENTRAL',
        lines: [
          'Has entrado a las entrañas de Krono City. La energía cuántica satura los conductos de alta tensión.',
          'Este sector es una prueba extrema de precisión: no hay un jefe tradicional al final, sino un laberinto tecnológico de máxima exigencia.',
          'Desactiva los 3 Nodos de Seguridad Cuántica para estabilizar el reactor y desbloquear el portal hacia la Cúspide de Krono.'
        ],
        author: 'Protocolo de Purga Cuántica'
      }
    ],
    worldWidth: 8600,
    themeColor: '#6366f1',
    accentColor: '#ec4899'
  },
  {
    id: 'krono-3',
    zone: 'krono',
    act: 3,
    title: 'Zona 5 · Acto 3 — La Cúspide de Krono: El Trono Mecánico',
    subtitle: 'Batalla Definitiva: Titán Mecánico Kronos-Ω',
    lore: [
      {
        title: '🤖 EL TITÁN MECÁNICO KRONOS-Ω',
        lines: [
          'En el pináculo de Krono City despierta el arma definitiva: el Titán Mecánico Kronos-Ω.',
          '⚠️ ALERTA MÁXIMA — SOLO TIENES 1 OPORTUNIDAD: Si caes en este combate definitivo, el sistema reiniciará la red de Krono City.',
          '• Dispara dagas a sus 2 Núcleos de Energía elevados para apagar su Escudo de Sobrecarga.',
          '• Cuando lance su ráfaga masiva de misiles, entrará en fase de SOBRECALENTAMIENTO: ¡golpea sus ventiladores expuestos!',
          '• Realiza Bloqueos Perfectos (Parry) ante sus megacañones para noquearlo y desatar tu combo definitivo.'
        ],
        author: 'Directiva de Emergencia 00'
      }
    ],
    worldWidth: 6800,
    themeColor: '#8b5cf6',
    accentColor: '#ef4444'
  },
  {
    id: 'krono-travel',
    zone: 'travel',
    act: 1,
    title: 'Kronos Travel',
    subtitle: 'La Fusión Dimensional de las Eras',
    lore: [
      {
        title: '🌌 KRONOS TRAVEL — LA FUSIÓN DE LAS ERAS',
        lines: [
          'La derrota del Titán Kronos ha desatado una fisura temporal en el continuo dimensional.',
          'Todos los mundos, biomas, peligros y enemigos se han fusionado en una única y monumental odisea continua.',
          'Cruzarás los Bosques Neón, los Templos de Sakura, los Mares de Magma, las Tumbas del Desierto y la Metrópolis Cuántica.',
          '¡Supera este desafío definitivo para convertirte en el auténtico Amo del Espacio-Tiempo!'
        ],
        author: 'Fisura Dimensional Kronos'
      }
    ],
    worldWidth: 9600,
    themeColor: '#38bdf8',
    accentColor: '#f43f5e'
  }
];

function getEnemyStats(type: Enemy['type']): { hp: number; xp: number; score: number } {
  switch (type) {
    case 'patrol':
      return { hp: 2, xp: 25, score: 100 };
    case 'sentinel':
      return { hp: 3, xp: 35, score: 150 };
    case 'hopper':
      return { hp: 2, xp: 30, score: 120 };
    case 'charger':
      return { hp: 4, xp: 50, score: 200 };
    case 'sphere':
      return { hp: 2, xp: 30, score: 130 };
    case 'kitsune':
      return { hp: 3, xp: 45, score: 180 };
    case 'kage':
      return { hp: 3, xp: 50, score: 220 };
    case 'kagered':
      return { hp: 5, xp: 75, score: 350 };
    case 'kodama':
      return { hp: 3, xp: 40, score: 160 };
    case 'yurei':
      return { hp: 2, xp: 40, score: 170 };
    case 'butterfly':
      return { hp: 1, xp: 20, score: 80 };
    case 'salamander':
      return { hp: 3, xp: 50, score: 200 };
    case 'magma_golem':
      return { hp: 6, xp: 85, score: 380 };
    case 'flame_wisp':
      return { hp: 2, xp: 35, score: 150 };
    case 'fire_hopper':
      return { hp: 3, xp: 45, score: 180 };
    case 'scarab':
      return { hp: 4, xp: 60, score: 240 };
    case 'mummy_warrior':
      return { hp: 6, xp: 90, score: 400 };
    case 'sand_serpent':
      return { hp: 3, xp: 55, score: 250 };
    case 'anubis_statue':
      return { hp: 7, xp: 110, score: 480 };
    case 'desert_vulture':
      return { hp: 3, xp: 45, score: 190 };
    case 'cyber_drone':
      return { hp: 3, xp: 60, score: 260 };
    case 'cyberturret':
      return { hp: 5, xp: 80, score: 360 };
    case 'cyber_hound':
      return { hp: 4, xp: 70, score: 320 };
    case 'plasma_trooper':
      return { hp: 6, xp: 95, score: 420 };
    case 'gravity_orb':
      return { hp: 3, xp: 50, score: 220 };
    default:
      return { hp: 2, xp: 25, score: 100 };
  }
}

export function buildLevel(levelIndex: number) {
  const config = LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0];
  const LW = config.worldWidth;

  const platforms: Platform[] = [];
  const hazards: Hazard[] = [];
  const enemies: Enemy[] = [];
  const crystals: Collectible[] = [];
  const secrets: SecretItem[] = [];
  const heals: Collectible[] = [];
  const checkpoints: Checkpoint[] = [];
  const landmarks: Landmark[] = [];
  let nodes: NodePillar[] = [];
  let boss: Boss | null = null;
  let goal = { x: LW - 240, y: 92, w: 28, h: 56 };

  let enemyId = 1;

  if (config.id === 'neon-1') {
    // -------------------------------------------------------------
    // ZONA 1 · ACTO 1 — BOSQUE NEÓN
    // -------------------------------------------------------------
    const gaps = [
      { x: 420, w: 55 }, { x: 920, w: 50 }, { x: 1480, w: 60 },
      { x: 2050, w: 55 }, { x: 2650, w: 65 }, { x: 3250, w: 55 },
      { x: 3850, w: 60 }, { x: 4480, w: 55 }, { x: 5100, w: 65 },
      { x: 5750, w: 55 }, { x: 6400, w: 65 }
    ];
    let start = 0;
    for (const g of gaps) {
      if (start < g.x) platforms.push({ x: start, y: 148, w: g.x - start, h: 40, kind: 'ground' });
      start = g.x + g.w;
    }
    platforms.push({ x: start, y: 148, w: LW - start, h: 40, kind: 'ground' });

    for (let s = 0; s < 16; s++) {
      const b = 90 + s * 430;
      const p1: Platform = { x: b + 35, y: 112, w: 76, h: 9, kind: 'ledge' };
      const p2: Platform = { x: b + 160, y: 82, w: 76, h: 9, kind: 'ledge' };
      const p3: Platform = { x: b + 285, y: 106, w: 82, h: 9, kind: 'ledge' };
      platforms.push(p1, p2, p3);

      crystals.push({ x: b + 55, y: 94, w: 8, h: 10, taken: false, t: Math.random() * 6.28 });
      crystals.push({ x: b + 180, y: 64, w: 8, h: 10, taken: false, t: Math.random() * 6.28 });
      crystals.push({ x: b + 305, y: 88, w: 8, h: 10, taken: false, t: Math.random() * 6.28 });
      if (s % 2 === 0) {
        crystals.push({ x: b + 335, y: 130, w: 8, h: 10, taken: false, t: Math.random() * 6.28 });
      }

      if (s % 3 === 1) hazards.push({ x: p1.x + 40, y: p1.y - 7, w: 18, h: 7, type: 'spike' });
      if (s % 4 === 2) hazards.push({ x: p3.x + 12, y: p3.y - 7, w: 20, h: 7, type: 'spike' });
    }

    for (let x = 600, i = 0; x < 6600; x += 420, i++) {
      const type = i % 3 === 0 ? 'laserGate' : i % 2 === 0 ? 'spike' : 'vine';
      hazards.push({
        x,
        y: type === 'laserGate' ? 95 : 141,
        w: type === 'laserGate' ? 14 : type === 'spike' ? 20 : 18,
        h: type === 'laserGate' ? 53 : 7,
        type,
        active: true,
        cycleTimer: i * 20
      });
    }

    const enemyTypes: Enemy['type'][] = ['patrol', 'sentinel', 'hopper', 'charger', 'sphere'];
    for (let x = 700, i = 0; x < 6600; x += 380, i++) {
      const type = enemyTypes[i % enemyTypes.length];
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: 134,
        w: 14,
        h: 14,
        min: x - 75,
        max: x + 110,
        vx: i % 2 === 0 ? 0.48 : -0.45,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        wait: 0,
        charge: 0,
        angle: Math.random() * 6.28
      });
    }

    checkpoints.push(
      { x: 1600, y: 108, w: 10, h: 40, active: false, spawn: { x: 1620, y: 110 } },
      { x: 3400, y: 108, w: 10, h: 40, active: false, spawn: { x: 3420, y: 110 } },
      { x: 5200, y: 108, w: 10, h: 40, active: false, spawn: { x: 5220, y: 110 } }
    );

    heals.push(
      { x: 1100, y: 126, w: 10, h: 12, taken: false },
      { x: 3100, y: 126, w: 10, h: 12, taken: false },
      { x: 4900, y: 126, w: 10, h: 12, taken: false }
    );

    secrets.push(
      { x: 550, y: 58, w: 10, h: 10, taken: false, name: '✦ Reliquaria de Luz Primordial' },
      { x: 2250, y: 52, w: 10, h: 10, taken: false, name: '✦ Cristal de Resonancia Neón' },
      { x: 4160, y: 50, w: 10, h: 10, taken: false, name: '✦ Glifo de los Antiguos Sabios' },
      { x: 6100, y: 54, w: 10, h: 10, taken: false, name: '✦ Núcleo de Sobrecarga Estelar' }
    );
  } else if (config.id === 'neon-2') {
    // -------------------------------------------------------------
    // ZONA 1 · ACTO 2 — EL GUARDIÁN
    // -------------------------------------------------------------
    const gaps = [
      { x: 400, w: 58 }, { x: 950, w: 55 }, { x: 1520, w: 60 },
      { x: 2100, w: 55 }, { x: 2680, w: 65 }, { x: 3280, w: 55 },
      { x: 3880, w: 65 }, { x: 4480, w: 55 }, { x: 5080, w: 65 }
    ];
    let start = 0;
    for (const g of gaps) {
      if (start < g.x) platforms.push({ x: start, y: 148, w: g.x - start, h: 40, kind: 'ground' });
      start = g.x + g.w;
    }
    platforms.push({ x: start, y: 148, w: LW - start, h: 40, kind: 'ground' });

    for (let s = 0; s < 13; s++) {
      const b = 100 + s * 410;
      platforms.push(
        { x: b + 40, y: 110, w: 80, h: 9, kind: 'ledge' },
        { x: b + 175, y: 78, w: 80, h: 9, kind: 'ledge' },
        { x: b + 300, y: 102, w: 80, h: 9, kind: 'ledge' }
      );
      crystals.push(
        { x: b + 60, y: 92, w: 8, h: 10, taken: false, t: Math.random() * 6.28 },
        { x: b + 195, y: 60, w: 8, h: 10, taken: false, t: Math.random() * 6.28 }
      );
      if (s % 3 === 0) {
        hazards.push({ x: b + 210, y: 69, w: 20, h: 7, type: 'spike' });
      }
    }

    const enemyTypes: Enemy['type'][] = ['sentinel', 'charger', 'hopper', 'patrol'];
    for (let x = 600, i = 0; x < 5400; x += 380, i++) {
      const type = enemyTypes[i % enemyTypes.length];
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: 134,
        w: 14,
        h: 14,
        min: x - 80,
        max: x + 90,
        vx: i % 2 === 0 ? 0.45 : -0.45,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        wait: 0,
        charge: 0,
        angle: Math.random() * 6.28
      });
    }

    checkpoints.push(
      { x: 1500, y: 108, w: 10, h: 40, active: false, spawn: { x: 1520, y: 110 } },
      { x: 3300, y: 108, w: 10, h: 40, active: false, spawn: { x: 3320, y: 110 } },
      { x: 4800, y: 108, w: 10, h: 40, active: false, spawn: { x: 4820, y: 110 } },
      { x: 5900, y: 108, w: 10, h: 40, active: false, spawn: { x: 5920, y: 110 }, arena: true }
    );

    heals.push(
      { x: 1000, y: 126, w: 10, h: 10, taken: false },
      { x: 2900, y: 126, w: 10, h: 10, taken: false },
      { x: 4500, y: 126, w: 10, h: 10, taken: false }
    );

    secrets.push(
      { x: 800, y: 48, w: 10, h: 10, taken: false, name: '✦ Batería Antigua de Fusión' },
      { x: 2500, y: 46, w: 10, h: 10, taken: false, name: '✦ Módulo Cibernético Alfa' },
      { x: 4200, y: 44, w: 10, h: 10, taken: false, name: '✦ Chip de Memoria Perdida' }
    );

    platforms.push({ x: 5700, y: 148, w: 1100, h: 40, kind: 'arena' });
    platforms.push({ x: 5840, y: 108, w: 90, h: 9, kind: 'ledge' });
    platforms.push({ x: 6010, y: 80, w: 90, h: 9, kind: 'ledge' });
    platforms.push({ x: 6180, y: 104, w: 90, h: 9, kind: 'ledge' });
    platforms.push({ x: 6360, y: 76, w: 90, h: 9, kind: 'ledge' });

    nodes = [
      { id: 1, x: 5880, y: 118, w: 12, h: 30, taken: false },
      { id: 2, x: 6050, y: 90, w: 12, h: 30, taken: false },
      { id: 3, x: 6220, y: 114, w: 12, h: 30, taken: false }
    ];

    boss = {
      x: 6160,
      y: 112,
      w: 24,
      h: 30,
      hp: 15,
      maxHp: 15,
      vx: 0,
      vy: 0,
      alive: true,
      shield: true,
      phase: 1,
      inv: 0,
      flash: 0,
      jumpTimer: 80,
      shotTimer: 90,
      name: 'Guardián Neón MK-IV',
      title: 'GUARDIÁN NEÓN MK-IV',
      subtitle: 'Autómata Centinela Ancestral',
      state: 'idle',
      stateTimer: 60,
      telegraphTimer: 0,
      stagger: 0,
      maxStagger: 70,
      isStaggered: false,
      facing: -1,
      shockwaves: [],
      introTimer: 0
    };

    goal = { x: 6600, y: 90, w: 30, h: 58 };
  } else if (config.id === 'sakura-1') {
    // -------------------------------------------------------------
    // ZONA 2 · ACTO 1 — BAJO LOS CEREZOS
    // -------------------------------------------------------------
    const gaps = [
      { x: 650, w: 75 }, { x: 1400, w: 85 }, { x: 2200, w: 80 },
      { x: 3050, w: 85 }, { x: 3900, w: 80 }, { x: 4750, w: 90 },
      { x: 5600, w: 85 }, { x: 6450, w: 80 }
    ];
    let start = 0;
    for (const g of gaps) {
      if (start < g.x) platforms.push({ x: start, y: 148, w: g.x - start, h: 40, kind: 'ground' });
      hazards.push({ x: g.x, y: 156, w: g.w, h: 28, type: 'water' });
      start = g.x + g.w;
    }
    platforms.push({ x: start, y: 148, w: LW - start, h: 40, kind: 'ground' });

    for (let i = 0; i < 16; i++) {
      const b = 80 + i * 420;
      platforms.push(
        { x: b + 35, y: 114, w: 88, h: 9, kind: 'bridge' },
        { x: b + 175, y: 80, w: 80, h: 9, kind: 'ledge' },
        { x: b + 310, y: 106, w: 84, h: 9, kind: 'bridge' }
      );

      crystals.push(
        { x: b + 60, y: 96, w: 8, h: 10, taken: false, t: Math.random() * 6.28 },
        { x: b + 200, y: 62, w: 8, h: 10, taken: false, t: Math.random() * 6.28 }
      );

      if (i % 2 === 0) {
        const stats = getEnemyStats('kitsune');
        enemies.push({
          id: enemyId++,
          type: 'kitsune',
          x: b + 90,
          y: 132,
          w: 14,
          h: 14,
          min: b + 30,
          max: b + 150,
          vx: 0.45,
          vy: 0,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: b + 90,
          angle: Math.random() * 6.28
        });
      }
      if (i % 3 === 1) {
        const stats = getEnemyStats('kage');
        enemies.push({
          id: enemyId++,
          type: 'kage',
          x: b + 210,
          y: 66,
          w: 14,
          h: 16,
          min: b + 175,
          max: b + 260,
          vx: -0.65,
          vy: 0,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: b + 210,
          cool: 45
        });
      }
      if (i % 3 === 2) {
        const stats = getEnemyStats('kodama');
        enemies.push({
          id: enemyId++,
          type: 'kodama',
          x: b + 325,
          y: 132,
          w: 14,
          h: 14,
          min: b + 285,
          max: b + 375,
          vx: 0.35,
          vy: 0,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: b + 325,
          cool: 60
        });
      }
      if (i % 4 === 0) {
        hazards.push({ x: b + 340, y: 141, w: 24, h: 7, type: 'spike' });
      }
    }

    landmarks.push(
      { type: 'torii', x: 260, y: 104, scale: 1.2, label: 'PUERTA DEL BOSQUE' },
      { type: 'bridge', x: 920, y: 116, w: 200, label: 'PUENTE DEL ARROYO' },
      { type: 'waterfall', x: 1550, y: 72, h: 78, label: 'CASCADA SAGRADA' },
      { type: 'shrine', x: 2350, y: 88, label: 'SANTUARIO OCULTO' },
      { type: 'bamboo', x: 2800, y: 75, h: 75, label: 'SENDERO DE BAMBÚ' },
      { type: 'bridge', x: 3350, y: 116, w: 220, label: 'PUENTE DE PIEDRA' },
      { type: 'torii', x: 4150, y: 104, scale: 1.1, label: 'TEMPLO DEL CREPÚSCULO' },
      { type: 'lanterns', x: 4950, y: 75, w: 330, label: 'CAMINO DE FAROLES' },
      { type: 'waterfall', x: 5800, y: 86, h: 64, label: 'JARDÍN DEL AGUA' },
      { type: 'torii', x: 6600, y: 102, scale: 1.25, label: 'PORTAL FINAL' }
    );

    secrets.push(
      { x: 2380, y: 40, w: 10, h: 12, taken: false, name: '🌸 Santuario del Cerezo Milenario' },
      { x: 4200, y: 42, w: 10, h: 12, taken: false, name: '🎐 Campana del Viento Celestial' },
      { x: 6050, y: 38, w: 10, h: 12, taken: false, name: '💮 Pétalo Dorado Inmortal' }
    );

    heals.push(
      { x: 1100, y: 126, w: 10, h: 10, taken: false },
      { x: 2750, y: 126, w: 10, h: 10, taken: false },
      { x: 4500, y: 126, w: 10, h: 10, taken: false },
      { x: 6150, y: 126, w: 10, h: 10, taken: false }
    );

    checkpoints.push(
      { x: 1700, y: 108, w: 10, h: 40, active: false, spawn: { x: 1720, y: 110 } },
      { x: 3600, y: 108, w: 10, h: 40, active: false, spawn: { x: 3620, y: 110 } },
      { x: 5300, y: 108, w: 10, h: 40, active: false, spawn: { x: 5320, y: 110 } }
    );

    goal = { x: 7100, y: 90, w: 30, h: 58 };
  } else if (config.id === 'sakura-2') {
    // -------------------------------------------------------------
    // ZONA 2 · ACTO 2 — CUANDO CAE LA NOCHE
    // -------------------------------------------------------------
    const gaps = [
      { x: 650, w: 75 }, { x: 1380, w: 85 }, { x: 2180, w: 90 },
      { x: 3000, w: 80 }, { x: 3850, w: 95 }, { x: 4700, w: 90 },
      { x: 5550, w: 85 }
    ];
    let start = 0;
    for (const g of gaps) {
      if (start < g.x) platforms.push({ x: start, y: 148, w: g.x - start, h: 40, kind: 'ground' });
      hazards.push({ x: g.x, y: 156, w: g.w, h: 28, type: 'water' });
      start = g.x + g.w;
    }
    platforms.push({ x: start, y: 148, w: LW - start, h: 40, kind: 'ground' });

    for (let i = 0; i < 15; i++) {
      const b = 80 + i * 410;
      platforms.push(
        { x: b + 35, y: 114, w: 86, h: 9, kind: 'bridge' },
        { x: b + 175, y: 80, w: 80, h: 9, kind: 'ledge' },
        { x: b + 310, y: 104, w: 84, h: 9, kind: 'bridge' }
      );

      crystals.push(
        { x: b + 62, y: 96, w: 8, h: 10, taken: false, t: Math.random() * 6.28 },
        { x: b + 198, y: 62, w: 8, h: 10, taken: false, t: Math.random() * 6.28 }
      );

      if (i % 2 === 0) {
        const stats = getEnemyStats('yurei');
        enemies.push({
          id: enemyId++,
          type: 'yurei',
          x: b + 110,
          y: 120,
          w: 14,
          h: 16,
          min: b + 50,
          max: b + 175,
          vx: 0.35,
          vy: 0,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: b + 110,
          t: Math.random() * 6.28,
          solid: true
        });
      }
      if (i % 3 === 1) {
        const stats = getEnemyStats('kagered');
        enemies.push({
          id: enemyId++,
          type: 'kagered',
          x: b + 205,
          y: 66,
          w: 14,
          h: 16,
          min: b + 175,
          max: b + 270,
          vx: -0.75,
          vy: 0,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: b + 205,
          cool: 50
        });
      }
      if (i % 3 === 2) {
        const stats = getEnemyStats('butterfly');
        enemies.push({
          id: enemyId++,
          type: 'butterfly',
          x: b + 330,
          y: 92,
          w: 14,
          h: 12,
          min: b + 280,
          max: b + 380,
          vx: 0.6,
          vy: 0,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: b + 330,
          t: Math.random() * 6.28
        });
      }
      if (i % 4 === 0) {
        hazards.push({ x: b + 260, y: 141, w: 24, h: 7, type: 'spike' });
      }
    }

    const moonPlats: Platform[] = [
      { x: 680, y: 96, w: 72, h: 8, kind: 'moon', phase: 0 },
      { x: 800, y: 68, w: 60, h: 8, kind: 'moon', phase: 70 },
      { x: 1620, y: 94, w: 84, h: 8, kind: 'moon', phase: 30 },
      { x: 1750, y: 62, w: 64, h: 8, kind: 'moon', phase: 110 },
      { x: 2680, y: 88, w: 90, h: 8, kind: 'moon', phase: 50 },
      { x: 3380, y: 70, w: 72, h: 8, kind: 'moon', phase: 20 },
      { x: 4280, y: 92, w: 82, h: 8, kind: 'moon', phase: 80 },
      { x: 5120, y: 74, w: 76, h: 8, kind: 'moon', phase: 40 }
    ];
    platforms.push(...moonPlats);

    landmarks.push(
      { type: 'lanterns', x: 430, y: 66, w: 300, label: 'AVENIDA DE LINTERNAS' },
      { type: 'bridge', x: 1020, y: 116, w: 240, label: 'PUENTE SOBRE EL LAGO' },
      { type: 'shrine', x: 1850, y: 88, label: 'SANTUARIO DE LA LUNA' },
      { type: 'bamboo', x: 2580, y: 68, h: 82, label: 'BOSQUE DE BAMBÚ NOCTURNO' },
      { type: 'waterfall', x: 3250, y: 82, h: 68, label: 'CASCADA NOCTURNA' },
      { type: 'torii', x: 4050, y: 102, scale: 1.2, label: 'TORII DE LA LUNA' },
      { type: 'bridge', x: 4850, y: 116, w: 260, label: 'PUENTE DE NIEBLA' },
      { type: 'lanterns', x: 5400, y: 68, w: 360, label: 'CAMINO DEL TEMPLO' },
      { type: 'shrine', x: 6100, y: 86, label: 'PATIO DE LA MAESTRA' }
    );

    secrets.push(
      { x: 1880, y: 42, w: 10, h: 12, taken: false, name: '🌙 Orbe de Luz Lunar' },
      { x: 3260, y: 38, w: 10, h: 12, taken: false, name: '💧 Gota del Manantial Puro' },
      { x: 5150, y: 40, w: 10, h: 12, taken: false, name: '🎐 Campana de la Noche Serena' }
    );

    heals.push(
      { x: 1200, y: 126, w: 10, h: 10, taken: false },
      { x: 2950, y: 126, w: 10, h: 10, taken: false },
      { x: 4600, y: 126, w: 10, h: 10, taken: false }
    );

    checkpoints.push(
      { x: 1550, y: 108, w: 10, h: 40, active: false, spawn: { x: 1570, y: 110 } },
      { x: 3400, y: 108, w: 10, h: 40, active: false, spawn: { x: 3420, y: 110 } },
      { x: 5100, y: 108, w: 10, h: 40, active: false, spawn: { x: 5120, y: 110 } },
      { x: 6220, y: 108, w: 10, h: 40, active: false, spawn: { x: 6240, y: 110 }, arena: true }
    );

    platforms.push({ x: 6000, y: 148, w: 1150, h: 40, kind: 'arena' });
    platforms.push({ x: 6140, y: 108, w: 100, h: 9, kind: 'ledge' });
    platforms.push({ x: 6310, y: 82, w: 100, h: 9, kind: 'ledge' });
    platforms.push({ x: 6490, y: 104, w: 100, h: 9, kind: 'ledge' });
    platforms.push({ x: 6680, y: 76, w: 100, h: 9, kind: 'ledge' });

    boss = {
      x: 6480,
      y: 112,
      w: 24,
      h: 30,
      hp: 16,
      maxHp: 16,
      vx: 0,
      vy: 0,
      alive: true,
      phase: 1,
      inv: 0,
      flash: 0,
      jumpTimer: 80,
      shotTimer: 95,
      attackTimer: 125,
      name: 'Maestra Kunoichi Rosa',
      title: 'MAESTRA KUNOICHI ROSA',
      subtitle: 'Sombra del Cerezo y Espada Ilusoria',
      state: 'idle',
      stateTimer: 50,
      telegraphTimer: 0,
      stagger: 0,
      maxStagger: 75,
      isStaggered: false,
      facing: -1,
      shockwaves: [],
      introTimer: 0
    };

    goal = { x: 6950, y: 90, w: 30, h: 58 };
  } else if (config.id === 'lavacliff-1') {
    // -------------------------------------------------------------
    // ZONA 3 · ACTO 1 — LAVACLIFF: ACANTILADOS VOLCÁNICOS (Exterior)
    // -------------------------------------------------------------
    const lavaGaps = [
      { x: 550, w: 90 }, { x: 1250, w: 110 }, { x: 2050, w: 100 },
      { x: 2850, w: 120 }, { x: 3700, w: 105 }, { x: 4550, w: 125 },
      { x: 5400, w: 110 }, { x: 6250, w: 130 }, { x: 7050, w: 100 }
    ];

    let start = 0;
    for (const g of lavaGaps) {
      if (start < g.x) {
        platforms.push({ x: start, y: 148, w: g.x - start, h: 40, kind: 'ground' });
      }
      // Real lava pool sitting at the bottom of the volcanic chasm
      hazards.push({ x: g.x, y: 154, w: g.w, h: 30, type: 'lava' });

      // Sinking basalt stepping stones inside the gap so player can cross
      platforms.push({
        x: g.x + 22,
        y: 144,
        w: 32,
        h: 12,
        kind: 'sinking',
        sinkTimer: 0,
        sinkOffset: 0,
        originalY: 144
      });
      if (g.w > 100) {
        platforms.push({
          x: g.x + g.w - 54,
          y: 144,
          w: 32,
          h: 12,
          kind: 'sinking',
          sinkTimer: 0,
          sinkOffset: 0,
          originalY: 144
        });
      }

      start = g.x + g.w;
    }
    platforms.push({ x: start, y: 148, w: LW - start, h: 40, kind: 'ground' });

    for (let s = 0; s < 18; s++) {
      const b = 90 + s * 410;
      const p1: Platform = { x: b + 35, y: 112, w: 82, h: 10, kind: 'basalt' };
      const p2: Platform = { x: b + 170, y: 80, w: 80, h: 10, kind: 'basalt' };
      const p3: Platform = { x: b + 300, y: 105, w: 84, h: 10, kind: 'basalt' };
      platforms.push(p1, p2, p3);

      crystals.push(
        { x: b + 55, y: 92, w: 8, h: 10, taken: false, t: Math.random() * 6.28 },
        { x: b + 190, y: 60, w: 8, h: 10, taken: false, t: Math.random() * 6.28 },
        { x: b + 320, y: 85, w: 8, h: 10, taken: false, t: Math.random() * 6.28 }
      );

      if (s % 3 === 1) {
        hazards.push({
          x: p2.x + 25,
          y: p2.y + p2.h,
          w: 12,
          h: 18,
          type: 'stalactite',
          originalY: p2.y + p2.h,
          fallVy: 0,
          isFalling: false
        });
      }
    }

    for (let x = 850, i = 0; x < 7200; x += 480, i++) {
      hazards.push({
        x,
        y: 142,
        w: 18,
        h: 10,
        type: 'geyser',
        warnTimer: 0,
        erupting: false,
        cycleTimer: (i * 35) % 180,
        maxCycle: 180
      });
    }

    for (let x = 700, i = 0; x < 7100; x += 360, i++) {
      const type: Enemy['type'] = i % 4 === 0 ? 'salamander' : i % 4 === 1 ? 'magma_golem' : i % 4 === 2 ? 'flame_wisp' : 'fire_hopper';
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: type === 'flame_wisp' ? 105 : 132,
        w: type === 'magma_golem' ? 18 : 14,
        h: type === 'magma_golem' ? 18 : 14,
        min: x - 80,
        max: x + 95,
        vx: i % 2 === 0 ? 0.45 : -0.45,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        wait: 0,
        charge: 0,
        cool: 50,
        angle: Math.random() * 6.28
      });
    }

    landmarks.push(
      { type: 'volcano_vent', x: 300, y: 110, scale: 1.2, label: 'BOCA DEL VOLCÁN' },
      { type: 'basalt_arch', x: 1000, y: 88, w: 180, label: 'ARCO DE BASALTO' },
      { type: 'lava_fall', x: 1750, y: 65, h: 85, label: 'CASCADA DE MAGMA' },
      { type: 'obsidian_pillar', x: 2500, y: 92, scale: 1.1, label: 'PILAR DE OBSIDIANA' },
      { type: 'volcano_vent', x: 3350, y: 110, scale: 1.15, label: 'FUMAROLA ACTIVA' },
      { type: 'basalt_arch', x: 4200, y: 88, w: 200, label: 'PASO DE CENIZA' },
      { type: 'lava_fall', x: 5000, y: 65, h: 85, label: 'TORRENTE ÍGNEO' },
      { type: 'obsidian_pillar', x: 5900, y: 92, scale: 1.2, label: 'MONOLITO DEL FUEGO' },
      { type: 'volcano_vent', x: 6700, y: 110, scale: 1.3, label: 'CRÁTER EXTERIOR' }
    );

    secrets.push(
      { x: 1780, y: 38, w: 10, h: 12, taken: false, name: '🌋 Corazón de Obsidiana Ancestral' },
      { x: 3380, y: 36, w: 10, h: 12, taken: false, name: '🔥 Fragmento de Magma Puro' },
      { x: 5050, y: 36, w: 10, h: 12, taken: false, name: '⚒️ Reliquia del Herrero Volcánico' },
      { x: 6750, y: 38, w: 10, h: 12, taken: false, name: '✦ Piedra Solar Incandescente' }
    );

    heals.push(
      { x: 1100, y: 126, w: 10, h: 10, taken: false },
      { x: 2700, y: 126, w: 10, h: 10, taken: false },
      { x: 4400, y: 126, w: 10, h: 10, taken: false },
      { x: 6100, y: 126, w: 10, h: 10, taken: false }
    );

    checkpoints.push(
      { x: 1600, y: 108, w: 10, h: 40, active: false, spawn: { x: 1620, y: 110 } },
      { x: 3550, y: 108, w: 10, h: 40, active: false, spawn: { x: 3570, y: 110 } },
      { x: 5350, y: 108, w: 10, h: 40, active: false, spawn: { x: 5370, y: 110 } }
    );

    goal = { x: 7550, y: 90, w: 30, h: 58 };
  } else if (config.id === 'lavacliff-2') {
    // -------------------------------------------------------------
    // ZONA 3 · ACTO 2 — LAVACLIFF: NÚCLEO DE MAGMA SUBTERRÁNEO (Boss: Ignis)
    // -------------------------------------------------------------
    const magmaLakes = [
      { x: 600, w: 100 }, { x: 1350, w: 115 }, { x: 2150, w: 110 },
      { x: 2950, w: 120 }, { x: 3800, w: 110 }, { x: 4650, w: 125 },
      { x: 5500, w: 120 }
    ];

    let start = 0;
    for (const lake of magmaLakes) {
      if (start < lake.x) {
        platforms.push({ x: start, y: 148, w: lake.x - start, h: 40, kind: 'ground' });
      }
      hazards.push({ x: lake.x, y: 154, w: lake.w, h: 30, type: 'lava' });

      platforms.push({
        x: lake.x + 24,
        y: 144,
        w: 34,
        h: 12,
        kind: 'sinking',
        sinkTimer: 0,
        sinkOffset: 0,
        originalY: 144
      });
      if (lake.w > 100) {
        platforms.push({
          x: lake.x + lake.w - 56,
          y: 144,
          w: 34,
          h: 12,
          kind: 'sinking',
          sinkTimer: 0,
          sinkOffset: 0,
          originalY: 144
        });
      }

      start = lake.x + lake.w;
    }
    platforms.push({ x: start, y: 148, w: LW - start, h: 40, kind: 'ground' });

    for (let s = 0; s < 15; s++) {
      const b = 90 + s * 400;
      const p1: Platform = { x: b + 40, y: 112, w: 82, h: 10, kind: 'basalt' };
      const p2: Platform = { x: b + 175, y: 80, w: 80, h: 10, kind: 'basalt' };
      const p3: Platform = { x: b + 305, y: 105, w: 84, h: 10, kind: 'basalt' };
      platforms.push(p1, p2, p3);

      crystals.push(
        { x: b + 60, y: 92, w: 8, h: 10, taken: false, t: Math.random() * 6.28 },
        { x: b + 195, y: 60, w: 8, h: 10, taken: false, t: Math.random() * 6.28 }
      );

      if (s % 2 === 0) {
        hazards.push({
          x: p2.x + 30,
          y: p2.y + p2.h,
          w: 14,
          h: 18,
          type: 'stalactite',
          originalY: p2.y + p2.h,
          fallVy: 0,
          isFalling: false
        });
      }
    }

    for (let x = 800, i = 0; x < 6000; x += 450, i++) {
      hazards.push({
        x,
        y: 142,
        w: 18,
        h: 10,
        type: 'geyser',
        warnTimer: 0,
        erupting: false,
        cycleTimer: (i * 40) % 180,
        maxCycle: 180
      });
    }

    for (let x = 700, i = 0; x < 5800; x += 350, i++) {
      const type: Enemy['type'] = i % 3 === 0 ? 'magma_golem' : i % 3 === 1 ? 'salamander' : 'flame_wisp';
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: type === 'flame_wisp' ? 104 : 132,
        w: type === 'magma_golem' ? 18 : 14,
        h: type === 'magma_golem' ? 18 : 14,
        min: x - 75,
        max: x + 95,
        vx: i % 2 === 0 ? 0.45 : -0.45,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        cool: 45,
        angle: Math.random() * 6.28
      });
    }

    landmarks.push(
      { type: 'magma_pipe', x: 400, y: 70, w: 220, label: 'CONDUCTO DE MAGMA' },
      { type: 'lava_fall', x: 1200, y: 60, h: 90, label: 'CATARATA DE FUEGO' },
      { type: 'obsidian_pillar', x: 2000, y: 92, scale: 1.2, label: 'ALTAR SUBTERRÁNEO' },
      { type: 'basalt_arch', x: 2850, y: 88, w: 220, label: 'CAVERNA MAGMÁTICA' },
      { type: 'lava_fall', x: 3700, y: 60, h: 90, label: 'TORRENTE PRIMORDIAL' },
      { type: 'obsidian_pillar', x: 4550, y: 92, scale: 1.2, label: 'FORJA DE LOS TITANES' },
      { type: 'magma_pipe', x: 5350, y: 70, w: 240, label: 'NÚCLEO DEL VOLCÁN' },
      { type: 'volcano_vent', x: 6200, y: 110, scale: 1.35, label: 'CÁMARA DE IGNIS' }
    );

    secrets.push(
      { x: 1250, y: 34, w: 10, h: 12, taken: false, name: '🔥 Chispa del Fuego Primordial' },
      { x: 2900, y: 34, w: 10, h: 12, taken: false, name: '🌋 Núcleo de Lava Cristalizada' },
      { x: 4600, y: 34, w: 10, h: 12, taken: false, name: '🛡️ Coraza del Herrero Titán' }
    );

    heals.push(
      { x: 1050, y: 126, w: 10, h: 10, taken: false },
      { x: 2750, y: 126, w: 10, h: 10, taken: false },
      { x: 4450, y: 126, w: 10, h: 10, taken: false }
    );

    checkpoints.push(
      { x: 1500, y: 108, w: 10, h: 40, active: false, spawn: { x: 1520, y: 110 } },
      { x: 3300, y: 108, w: 10, h: 40, active: false, spawn: { x: 3320, y: 110 } },
      { x: 5100, y: 108, w: 10, h: 40, active: false, spawn: { x: 5120, y: 110 } },
      { x: 6390, y: 108, w: 10, h: 40, active: false, spawn: { x: 6410, y: 110 }, arena: true }
    );

    platforms.push({ x: 6150, y: 148, w: 1250, h: 40, kind: 'arena' });
    platforms.push({ x: 6300, y: 108, w: 100, h: 10, kind: 'basalt' });
    platforms.push({ x: 6480, y: 80, w: 100, h: 10, kind: 'basalt' });
    platforms.push({ x: 6660, y: 104, w: 100, h: 10, kind: 'basalt' });
    platforms.push({ x: 6850, y: 76, w: 100, h: 10, kind: 'basalt' });

    boss = {
      x: 6650,
      y: 104,
      w: 28,
      h: 36,
      hp: 18,
      maxHp: 18,
      vx: 0,
      vy: 0,
      alive: true,
      phase: 1,
      inv: 0,
      flash: 0,
      jumpTimer: 85,
      shotTimer: 100,
      attackTimer: 130,
      name: 'Ignis, Coloso de Magma Primordial',
      title: 'IGNIS — COLOSO DE MAGMA',
      subtitle: 'Guardia del Corazón Volcánico',
      state: 'idle',
      stateTimer: 60,
      telegraphTimer: 0,
      stagger: 0,
      maxStagger: 80,
      isStaggered: false,
      facing: -1,
      shockwaves: [],
      introTimer: 0
    };

    goal = { x: 7350, y: 90, w: 30, h: 58 };
  } else if (config.id === 'desert-1') {
    // -------------------------------------------------------------
    // ZONA 4 · ACTO 1 — SANTUARIO DEL DESIERTO: DUNAS OLVIDADAS
    // -------------------------------------------------------------
    const gaps = [
      { x: 550, w: 75 }, { x: 1180, w: 90 }, { x: 1850, w: 85 },
      { x: 2550, w: 95 }, { x: 3280, w: 90 }, { x: 4050, w: 100 },
      { x: 4850, w: 95 }, { x: 5650, w: 110 }, { x: 6450, w: 100 },
      { x: 7250, w: 105 }
    ];

    let start = 0;
    for (const g of gaps) {
      if (g.x > start) {
        platforms.push({
          x: start,
          y: 148,
          w: g.x - start,
          h: 40,
          kind: 'ground'
        });
      }
      start = g.x + g.w;
    }
    if (start < LW) {
      platforms.push({
        x: start,
        y: 148,
        w: LW - start,
        h: 40,
        kind: 'ground'
      });
    }

    // Quicksand Pits over selective gaps
    for (const qx of [1180, 2550, 4050, 5650, 7250]) {
      platforms.push({
        x: qx,
        y: 154,
        w: 85,
        h: 24,
        kind: 'quicksand'
      });
      hazards.push({
        x: qx,
        y: 152,
        w: 85,
        h: 26,
        type: 'quicksand'
      });
    }

    // Elevated Sandstone Ruins & Stepping Ledges
    for (let s = 450; s < 7500; s += 360) {
      const p1 = { x: s, y: 110 - (s % 3) * 18, w: 75, h: 10, kind: 'sandstone' as const };
      const p2 = { x: s + 140, y: 78 + (s % 2) * 20, w: 80, h: 10, kind: 'sandstone' as const };
      platforms.push(p1, p2);

      crystals.push(
        { x: p1.x + 25, y: p1.y - 14, w: 8, h: 8, taken: false },
        { x: p2.x + 35, y: p2.y - 14, w: 8, h: 8, taken: false }
      );

      // Bone spikes on lower ground near ruins
      if (s % 2 === 0) {
        hazards.push({
          x: s + 75,
          y: 142,
          w: 22,
          h: 8,
          type: 'sandSpike'
        });
      }

      // Swinging blades between temple arches
      if (s % 4 === 0) {
        hazards.push({
          x: s + 100,
          y: 65,
          w: 16,
          h: 55,
          type: 'swingingBlade',
          bladeAngle: 0,
          bladeSpeed: 0.045
        });
      }

      // Falling Sandstone Blocks
      if (s % 5 === 0) {
        hazards.push({
          x: p1.x + 30,
          y: p1.y - 20,
          w: 18,
          h: 16,
          type: 'fallingBlock',
          originalY: p1.y - 20,
          fallVy: 0,
          isFalling: false
        });
      }
    }

    // Desert Enemies Spawning
    for (let x = 600, i = 0; x < 7500; x += 320, i++) {
      const type: Enemy['type'] = i % 4 === 0 ? 'scarab' : i % 4 === 1 ? 'sand_serpent' : i % 4 === 2 ? 'desert_vulture' : 'patrol';
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: type === 'desert_vulture' ? 62 : type === 'sand_serpent' ? 140 : 132,
        w: type === 'scarab' ? 16 : type === 'sand_serpent' ? 14 : 16,
        h: type === 'scarab' ? 14 : type === 'sand_serpent' ? 18 : 14,
        min: x - 80,
        max: x + 95,
        vx: i % 2 === 0 ? 0.6 : -0.6,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        cool: 50,
        angle: Math.random() * 6.28
      });
    }

    landmarks.push(
      { type: 'pyramid', x: 450, y: 70, scale: 1.3, label: 'GRAN PIRÁMIDE SOLAR' },
      { type: 'sand_dune', x: 1300, y: 110, w: 260, label: 'DUNAS DORADAS' },
      { type: 'obelisk', x: 2150, y: 80, scale: 1.2, label: 'OBELISCO DE RA' },
      { type: 'oasis', x: 3050, y: 130, w: 220, label: 'OASIS ESMERALDA' },
      { type: 'sphinx', x: 4100, y: 75, scale: 1.4, label: 'ESFINGE MILENARIA' },
      { type: 'ancient_columns', x: 5200, y: 88, w: 260, label: 'COLUMNAS DEL SANTUARIO' },
      { type: 'pharaoh_statue', x: 6300, y: 80, scale: 1.3, label: 'COLOSO DE HORUS' },
      { type: 'pyramid', x: 7400, y: 70, scale: 1.2, label: 'ENTRADA AL SEPULCRO' }
    );

    secrets.push(
      { x: 1350, y: 38, w: 10, h: 12, taken: false, name: '⚱️ Reliquia del Escarabajo Solar' },
      { x: 3100, y: 38, w: 10, h: 12, taken: false, name: '📜 Papiro Sagrado de los Faraones' },
      { x: 5250, y: 38, w: 10, h: 12, taken: false, name: '👁️ Ojo Dorado de Horus' }
    );

    heals.push(
      { x: 1100, y: 126, w: 10, h: 10, taken: false },
      { x: 3000, y: 126, w: 10, h: 10, taken: false },
      { x: 5050, y: 126, w: 10, h: 10, taken: false },
      { x: 6950, y: 126, w: 10, h: 10, taken: false }
    );

    checkpoints.push(
      { x: 1600, y: 108, w: 10, h: 40, active: false, spawn: { x: 1620, y: 110 } },
      { x: 3500, y: 108, w: 10, h: 40, active: false, spawn: { x: 3520, y: 110 } },
      { x: 5450, y: 108, w: 10, h: 40, active: false, spawn: { x: 5470, y: 110 } },
      { x: 7300, y: 108, w: 10, h: 40, active: false, spawn: { x: 7320, y: 110 } }
    );

    goal = { x: LW - 240, y: 92, w: 30, h: 58 };
  } else if (config.id === 'desert-2') {
    // -------------------------------------------------------------
    // ZONA 4 · ACTO 2 — CRIPTA DEL FARAÓN: EL SEPULCRO SAGRADO
    // -------------------------------------------------------------
    const gaps = [
      { x: 600, w: 80 }, { x: 1350, w: 85 }, { x: 2150, w: 90 },
      { x: 2950, w: 85 }, { x: 3750, w: 90 }, { x: 4550, w: 95 },
      { x: 5350, w: 90 }
    ];

    let start = 0;
    for (const g of gaps) {
      if (g.x > start) {
        platforms.push({
          x: start,
          y: 148,
          w: g.x - start,
          h: 40,
          kind: 'ruins'
        });
      }
      start = g.x + g.w;
    }
    if (start < 6200) {
      platforms.push({
        x: start,
        y: 148,
        w: 6200 - start,
        h: 40,
        kind: 'ruins'
      });
    }

    // 3 Canopic Sacred Seal Pillars to unlock Pharaoh's Chamber
    nodes = [
      { id: '1', x: 1800, y: 90, w: 18, h: 58, taken: false },
      { id: '2', x: 3600, y: 70, w: 18, h: 58, taken: false },
      { id: '3', x: 5200, y: 90, w: 18, h: 58, taken: false }
    ];

    // High Sandstone Sarcophagus platforms & Ledges
    for (let s = 400; s < 6000; s += 340) {
      const p1 = { x: s, y: 104 - (s % 3) * 16, w: 80, h: 12, kind: 'ruins' as const };
      const p2 = { x: s + 150, y: 72 + (s % 2) * 22, w: 85, h: 12, kind: 'ruins' as const };
      platforms.push(p1, p2);

      crystals.push(
        { x: p1.x + 30, y: p1.y - 14, w: 8, h: 8, taken: false },
        { x: p2.x + 35, y: p2.y - 14, w: 8, h: 8, taken: false }
      );

      // Curse Runes & Swinging Blades in the Crypt
      if (s % 2 === 0) {
        hazards.push({
          x: s + 60,
          y: 144,
          w: 24,
          h: 6,
          type: 'curseRune'
        });
      }

      if (s % 3 === 0) {
        hazards.push({
          x: s + 110,
          y: 60,
          w: 16,
          h: 60,
          type: 'swingingBlade',
          bladeAngle: 0,
          bladeSpeed: 0.05
        });
      }

      if (s % 4 === 0) {
        hazards.push({
          x: p1.x + 35,
          y: p1.y - 20,
          w: 18,
          h: 16,
          type: 'fallingBlock',
          originalY: p1.y - 20,
          fallVy: 0,
          isFalling: false
        });
      }
    }

    // Crypt Enemies
    for (let x = 650, i = 0; x < 6000; x += 320, i++) {
      const type: Enemy['type'] = i % 4 === 0 ? 'anubis_statue' : i % 4 === 1 ? 'mummy_warrior' : i % 4 === 2 ? 'scarab' : 'sand_serpent';
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: type === 'anubis_statue' ? 124 : type === 'mummy_warrior' ? 128 : 134,
        w: type === 'anubis_statue' ? 20 : type === 'mummy_warrior' ? 18 : 16,
        h: type === 'anubis_statue' ? 24 : type === 'mummy_warrior' ? 20 : 14,
        min: x - 75,
        max: x + 85,
        vx: i % 2 === 0 ? 0.45 : -0.45,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        cool: 45,
        angle: Math.random() * 6.28
      });
    }

    landmarks.push(
      { type: 'sarcophagus', x: 450, y: 92, scale: 1.2, label: 'CÁMARA FUNERARIA' },
      { type: 'ancient_columns', x: 1350, y: 85, w: 220, label: 'PASADIZO DE ANUBIS' },
      { type: 'pharaoh_statue', x: 2250, y: 80, scale: 1.3, label: 'GUARDIÁN DEL TRONO' },
      { type: 'sarcophagus', x: 3150, y: 92, scale: 1.2, label: 'SEPULCRO DE LOS SUMOS SACERDOTES' },
      { type: 'obelisk', x: 4100, y: 80, scale: 1.2, label: 'OBELISCO MALDITO' },
      { type: 'ancient_columns', x: 5000, y: 85, w: 240, label: 'SALA DE LAS TRES RELIQUIAS' },
      { type: 'pharaoh_statue', x: 6200, y: 80, scale: 1.4, label: 'CÁMARA DEL FARAÓN' }
    );

    secrets.push(
      { x: 1400, y: 34, w: 10, h: 12, taken: false, name: '👑 Corona Dorada de Ra' },
      { x: 3200, y: 34, w: 10, h: 12, taken: false, name: '🔮 Joya de la Momia Eterna' },
      { x: 5100, y: 34, w: 10, h: 12, taken: false, name: '⚰️ Cetro Ancestral del Faraón' }
    );

    heals.push(
      { x: 1200, y: 126, w: 10, h: 10, taken: false },
      { x: 3000, y: 126, w: 10, h: 10, taken: false },
      { x: 4800, y: 126, w: 10, h: 10, taken: false }
    );

    checkpoints.push(
      { x: 1600, y: 108, w: 10, h: 40, active: false, spawn: { x: 1620, y: 110 } },
      { x: 3400, y: 108, w: 10, h: 40, active: false, spawn: { x: 3420, y: 110 } },
      { x: 5100, y: 108, w: 10, h: 40, active: false, spawn: { x: 5120, y: 110 } },
      { x: 6440, y: 108, w: 10, h: 40, active: false, spawn: { x: 6460, y: 110 }, arena: true }
    );

    // Pharaoh Boss Arena
    platforms.push({ x: 6150, y: 148, w: 1450, h: 40, kind: 'arena' });
    platforms.push({ x: 6300, y: 108, w: 90, h: 10, kind: 'ruins' });
    platforms.push({ x: 6480, y: 78, w: 90, h: 10, kind: 'ruins' });
    platforms.push({ x: 6660, y: 104, w: 90, h: 10, kind: 'ruins' });
    platforms.push({ x: 6850, y: 76, w: 90, h: 10, kind: 'ruins' });

    boss = {
      x: 6700,
      y: 102,
      w: 26,
      h: 36,
      hp: 20,
      maxHp: 20,
      vx: 0,
      vy: 0,
      alive: true,
      phase: 1,
      inv: 0,
      flash: 0,
      jumpTimer: 85,
      shotTimer: 100,
      attackTimer: 120,
      name: 'Faraón Akhen\'Ra, La Momia Eterna',
      title: 'FARAÓN AKHEN\'RA — LA MOMIA ETERNA',
      subtitle: 'Soberano del Santuario y las Arenas Malditas',
      state: 'idle',
      stateTimer: 60,
      telegraphTimer: 0,
      stagger: 0,
      maxStagger: 85,
      isStaggered: false,
      facing: -1,
      shockwaves: [],
      introTimer: 0
    };

    goal = { x: 7550, y: 90, w: 30, h: 58 };
  } else if (config.id === 'krono-1') {
    // -------------------------------------------------------------
    // ZONA 5 · ACTO 1 — KRONO CITY: DISTRITO TECNOLÓGICO
    // -------------------------------------------------------------
    for (let x = 0; x < LW; x += 320) {
      const isConveyor = (x / 320) % 3 === 1;
      const isEmp = (x / 320) % 5 === 4;
      
      if (isConveyor) {
        platforms.push({ 
          x, 
          y: 148, 
          w: 260, 
          h: 40, 
          kind: 'conveyor',
          speed: 1.6,
          dir: (x % 640 === 0) ? 1 : -1
        });
      } else {
        platforms.push({ x, y: 148, w: 260, h: 40, kind: 'cyber' });
      }

      if (isEmp) {
        hazards.push({
          x: x + 40,
          y: 146,
          w: 180,
          h: 12,
          type: 'empFloor',
          cycleTimer: (x % 120),
          maxCycle: 140,
          active: false
        });
      }

      if (x > 300 && x < LW - 400) {
        platforms.push({ x: x + 60, y: 104, w: 85, h: 10, kind: 'cyber' });
        platforms.push({ x: x + 180, y: 72, w: 75, h: 10, kind: 'cyber' });

        if (x % 600 === 0) {
          platforms.push({ 
            x: x + 120, 
            y: 42, 
            w: 80, 
            h: 10, 
            kind: 'conveyor',
            speed: 1.4,
            dir: 1
          });
        }
      }
    }

    for (let x = 800; x < LW - 800; x += 650) {
      hazards.push({
        x: x + 40,
        y: 40,
        w: 12,
        h: 108,
        type: 'plasmaBeam',
        cycleTimer: (x % 90),
        maxCycle: 120,
        active: true
      });
    }

    for (let x = 500; x < LW - 600; x += 320) {
      const eMod = Math.floor(x / 320) % 5;
      if (eMod === 0) {
        const stats = getEnemyStats('cyber_drone');
        enemies.push({
          id: x,
          type: 'cyber_drone',
          x,
          y: 65,
          w: 16,
          h: 16,
          vx: 1.2,
          vy: 0,
          min: x - 90,
          max: x + 90,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 45,
          angle: 0
        });
      } else if (eMod === 1) {
        const stats = getEnemyStats('cyberturret');
        enemies.push({
          id: x,
          type: 'cyberturret',
          x,
          y: 130,
          w: 18,
          h: 20,
          vx: 0,
          vy: 0,
          min: x,
          max: x,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 60,
          angle: 0
        });
      } else if (eMod === 2) {
        const stats = getEnemyStats('cyber_hound');
        enemies.push({
          id: x,
          type: 'cyber_hound',
          x,
          y: 130,
          w: 22,
          h: 16,
          vx: -1.6,
          vy: 0,
          min: x - 120,
          max: x + 120,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 30,
          facing: -1
        });
      } else if (eMod === 3) {
        const stats = getEnemyStats('plasma_trooper');
        enemies.push({
          id: x,
          type: 'plasma_trooper',
          x,
          y: 124,
          w: 18,
          h: 24,
          vx: 0.9,
          vy: 0,
          min: x - 80,
          max: x + 80,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 50,
          facing: 1
        });
      } else {
        const stats = getEnemyStats('gravity_orb');
        enemies.push({
          id: x,
          type: 'gravity_orb',
          x,
          y: 80,
          w: 14,
          h: 14,
          vx: 0.8,
          vy: 0.6,
          min: x - 60,
          max: x + 60,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 40,
          angle: 0
        });
      }
    }

    for (let x = 180; x < LW - 200; x += 130) {
      crystals.push({ x, y: 120 - (x % 50), w: 8, h: 8, taken: false });
    }

    landmarks.push(
      { type: 'cyber_skyscraper', x: 500, y: 20, w: 120, label: 'DISTRITO COMERCIAL KRONOS' },
      { type: 'holo_billboard', x: 1600, y: 40, scale: 1.2, label: 'RED KRONOS ONLINE' },
      { type: 'antenna_tower', x: 2800, y: 15, scale: 1.3, label: 'TORRE DE TRANSMISIÓN CUÁNTICA' },
      { type: 'cyber_skyscraper', x: 4200, y: 20, w: 140, label: 'SECTOR ALTA TECNOLOGÍA' },
      { type: 'holo_billboard', x: 5600, y: 40, scale: 1.2, label: 'ACCESO RESTRINGIDO A LA RED CENTRAL' },
      { type: 'antenna_tower', x: 7000, y: 15, scale: 1.4, label: 'NEXO DE TELETRANSPORTACIÓN' }
    );

    secrets.push(
      { x: 1800, y: 30, w: 10, h: 12, taken: false, name: '⚡ Microchip Cuántico Kronos-α' },
      { x: 4400, y: 24, w: 10, h: 12, taken: false, name: '💾 Holodisco de Seguridad Central' },
      { x: 6800, y: 30, w: 10, h: 12, taken: false, name: '🔋 Batería de Plasma Iónico' }
    );

    heals.push(
      { x: 1500, y: 126, w: 10, h: 10, taken: false },
      { x: 3600, y: 126, w: 10, h: 10, taken: false },
      { x: 5800, y: 126, w: 10, h: 10, taken: false }
    );

    checkpoints.push(
      { x: 2000, y: 108, w: 10, h: 40, active: false, spawn: { x: 2020, y: 110 } },
      { x: 4500, y: 108, w: 10, h: 40, active: false, spawn: { x: 4520, y: 110 } },
      { x: 7000, y: 108, w: 10, h: 40, active: false, spawn: { x: 7020, y: 110 } }
    );

    goal = { x: 8050, y: 90, w: 30, h: 58 };
  } else if (config.id === 'krono-2') {
    // -------------------------------------------------------------
    // ZONA 5 · ACTO 2 — KRONO CITY: REACTOR DE FUSIÓN & RED CENTRAL
    // (Extrema dificultad, sin jefe tradicional, guantelete de alta tensión con 3 Nodos Cuánticos)
    // -------------------------------------------------------------
    for (let x = 0; x < LW; x += 300) {
      const isGap = (x > 1200 && x < 1500) || (x > 3200 && x < 3500) || (x > 5400 && x < 5700) || (x > 7200 && x < 7500);
      if (!isGap) {
        platforms.push({ x, y: 148, w: 240, h: 40, kind: 'cyber' });
      }

      platforms.push({ 
        x: x + 40, 
        y: 102, 
        w: 90, 
        h: 10, 
        kind: (x % 600 === 0) ? 'conveyor' : 'cyber',
        speed: 1.8,
        dir: (x % 1200 === 0) ? 1 : -1
      });

      platforms.push({ x: x + 160, y: 68, w: 85, h: 10, kind: 'cyber' });

      if (x % 450 === 0) {
        platforms.push({ x: x + 100, y: 36, w: 70, h: 10, kind: 'cyber' });
      }
    }

    for (let x = 600; x < LW - 600; x += 480) {
      hazards.push({
        x: x + 60,
        y: 146,
        w: 160,
        h: 12,
        type: 'empFloor',
        cycleTimer: (x % 80),
        maxCycle: 100,
        active: false
      });

      hazards.push({
        x: x + 120,
        y: 35,
        w: 14,
        h: 115,
        type: 'plasmaBeam',
        cycleTimer: ((x * 2) % 90),
        maxCycle: 110,
        active: true
      });
    }

    // 3 Quantum Security Node Pillars to stabilize the fusion reactor
    nodes.push(
      { x: 1850, y: 56, w: 16, h: 36, taken: false, id: 1 },
      { x: 4250, y: 26, w: 16, h: 36, taken: false, id: 2 },
      { x: 6750, y: 26, w: 16, h: 36, taken: false, id: 3 }
    );

    for (let x = 400; x < LW - 500; x += 260) {
      const eMod = Math.floor(x / 260) % 5;
      if (eMod === 0) {
        const stats = getEnemyStats('cyberturret');
        enemies.push({
          id: x,
          type: 'cyberturret',
          x,
          y: 92,
          w: 18,
          h: 20,
          vx: 0,
          vy: 0,
          min: x,
          max: x,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 50,
          angle: 0
        });
      } else if (eMod === 1) {
        const stats = getEnemyStats('plasma_trooper');
        enemies.push({
          id: x,
          type: 'plasma_trooper',
          x,
          y: 124,
          w: 18,
          h: 24,
          vx: 1.1,
          vy: 0,
          min: x - 100,
          max: x + 100,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 40,
          facing: 1
        });
      } else if (eMod === 2) {
        const stats = getEnemyStats('cyber_hound');
        enemies.push({
          id: x,
          type: 'cyber_hound',
          x,
          y: 128,
          w: 22,
          h: 16,
          vx: -1.7,
          vy: 0,
          min: x - 130,
          max: x + 130,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 25,
          facing: -1
        });
      } else if (eMod === 3) {
        const stats = getEnemyStats('cyber_drone');
        enemies.push({
          id: x,
          type: 'cyber_drone',
          x,
          y: 50,
          w: 16,
          h: 16,
          vx: 1.4,
          vy: 0,
          min: x - 100,
          max: x + 100,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 35,
          angle: 0
        });
      } else {
        const stats = getEnemyStats('gravity_orb');
        enemies.push({
          id: x,
          type: 'gravity_orb',
          x,
          y: 70,
          w: 14,
          h: 14,
          vx: 1.0,
          vy: 0.8,
          min: x - 70,
          max: x + 70,
          alive: true,
          hp: stats.hp,
          maxHp: stats.hp,
          xpValue: stats.xp,
          scoreValue: stats.score,
          hitFlash: 0,
          home: x,
          cool: 35,
          angle: 0
        });
      }
    }

    for (let x = 160; x < LW - 200; x += 110) {
      crystals.push({ x, y: 110 - (x % 60), w: 8, h: 8, taken: false });
    }

    landmarks.push(
      { type: 'reactor_core', x: 600, y: 25, scale: 1.3, label: 'REACTOR PRINCIPAL DE FUSIÓN' },
      { type: 'antenna_tower', x: 2000, y: 15, scale: 1.4, label: 'CONDUCTO DE ALTA TENSIÓN' },
      { type: 'cyber_skyscraper', x: 3800, y: 20, w: 150, label: 'MATRIZ DE PROCESAMIENTO' },
      { type: 'reactor_core', x: 5500, y: 25, scale: 1.4, label: 'NÚCLEO DE CONTENCIÓN MAGNÉTICA' },
      { type: 'warp_portal', x: 8100, y: 40, scale: 1.5, label: 'PORTAL HACIA EL TRONO MECÁNICO' }
    );

    secrets.push(
      { x: 2200, y: 25, w: 10, h: 12, taken: false, name: '💠 Núcleo de Fusión Sobrecargado' },
      { x: 5000, y: 20, w: 10, h: 12, taken: false, name: '🔑 Llave Maestra Cuántica' },
      { x: 7400, y: 24, w: 10, h: 12, taken: false, name: '⚡ Condensador Infinito Kronos' }
    );

    heals.push(
      { x: 1600, y: 126, w: 10, h: 10, taken: false },
      { x: 3800, y: 126, w: 10, h: 10, taken: false },
      { x: 6200, y: 126, w: 10, h: 10, taken: false }
    );

    checkpoints.push(
      { x: 1900, y: 108, w: 10, h: 40, active: false, spawn: { x: 1920, y: 110 } },
      { x: 4300, y: 108, w: 10, h: 40, active: false, spawn: { x: 4320, y: 110 } },
      { x: 6800, y: 108, w: 10, h: 40, active: false, spawn: { x: 6820, y: 110 } }
    );

    goal = { x: 8200, y: 90, w: 30, h: 58 };
  } else if (config.id === 'krono-3') {
    // -------------------------------------------------------------
    // ZONA 5 · ACTO 3 — LA CÚSPIDE DE KRONO: EL TRONO MECÁNICO
    // (GRAN JEFE FINAL: TITÁN MECÁNICO KRONOS-Ω - 1 SOLA OPORTUNIDAD)
    // -------------------------------------------------------------
    platforms.push({ x: 0, y: 148, w: LW, h: 40, kind: 'arena' });
    
    // Multi-tier floating battle platforms
    platforms.push({ x: 350, y: 108, w: 100, h: 10, kind: 'cyber' });
    platforms.push({ x: 550, y: 76, w: 110, h: 10, kind: 'cyber' });
    platforms.push({ x: 750, y: 46, w: 100, h: 10, kind: 'cyber' });
    
    platforms.push({ x: 1100, y: 108, w: 100, h: 10, kind: 'cyber' });
    platforms.push({ x: 1300, y: 76, w: 110, h: 10, kind: 'cyber' });
    platforms.push({ x: 1500, y: 46, w: 100, h: 10, kind: 'cyber' });

    // 2 Overclock Power Relays on high platforms to disable the Mech's Overdrive Shield in phase 1 & 3
    nodes.push(
      { x: 600, y: 40, w: 18, h: 34, taken: false, id: 'core1' },
      { x: 1350, y: 40, w: 18, h: 34, taken: false, id: 'core2' }
    );

    for (let x = 100; x < 2000; x += 120) {
      crystals.push({ x, y: 110 - (x % 40), w: 8, h: 8, taken: false });
    }
    heals.push(
      { x: 300, y: 126, w: 10, h: 10, taken: false },
      { x: 800, y: 126, w: 10, h: 10, taken: false },
      { x: 1400, y: 126, w: 10, h: 10, taken: false }
    );

    secrets.push(
      { x: 750, y: 20, w: 12, h: 14, taken: false, name: '🏆 Corona Suprema del Tiempo: Kronos' }
    );

    checkpoints.push(
      { x: 770, y: 108, w: 10, h: 40, active: true, spawn: { x: 790, y: 110 }, arena: true }
    );

    landmarks.push(
      { type: 'kronos_statue', x: 950, y: 20, scale: 1.6, label: 'EL TRONO SUPREMO DE KRONOS' },
      { type: 'antenna_tower', x: 250, y: 15, scale: 1.4, label: 'CONDUCTO ENERGÉTICO KRONOS' },
      { type: 'antenna_tower', x: 1650, y: 15, scale: 1.4, label: 'RELAY CUÁNTICO PRINCIPAL' },
      { type: 'credits_gate', x: 2200, y: 40, scale: 1.6, label: 'PORTAL HACIA EL DESTINO (CRÉDITOS)' }
    );

    // Giant Robot Mech Boss: Titán Mecánico Kronos-Ω
    boss = {
      x: 1050,
      y: 80,
      w: 52,
      h: 68,
      hp: 24,
      maxHp: 24,
      vx: 0,
      vy: 0,
      alive: true,
      phase: 1,
      inv: 0,
      flash: 0,
      jumpTimer: 85,
      shotTimer: 85,
      attackTimer: 100,
      name: 'Titán Mecánico Kronos-Ω',
      title: 'TITÁN MECÁNICO KRONOS-Ω — EL ARMA DEFINITIVA',
      subtitle: 'Coloso Tecnológico & Amo del Tiempo',
      state: 'idle',
      stateTimer: 60,
      telegraphTimer: 0,
      stagger: 0,
      maxStagger: 95,
      isStaggered: false,
      facing: -1,
      shockwaves: [],
      introTimer: 0,
      overheatTimer: 0,
      shieldCores: 2
    };

    goal = { x: 2200, y: 88, w: 34, h: 62 };
  } else if (config.id === 'krono-travel') {
    // -------------------------------------------------------------
    // NIVEL EXTRA — KRONOS TRAVEL: LA FUSIÓN DIMENSIONAL
    // (Junta todos los enemigos, escenarios, mecánicas, obstáculos y peligros en un solo nivel masivo)
    // -------------------------------------------------------------
    
    // -------------------------------------------------------------
    // SECTOR 1: BOSQUE NEÓN (0 -> 1800)
    // -------------------------------------------------------------
    const neonGaps = [{ x: 380, w: 50 }, { x: 850, w: 55 }, { x: 1350, w: 60 }];
    let nStart = 0;
    for (const g of neonGaps) {
      if (nStart < g.x) platforms.push({ x: nStart, y: 148, w: g.x - nStart, h: 40, kind: 'ground' });
      nStart = g.x + g.w;
    }
    platforms.push({ x: nStart, y: 148, w: 1800 - nStart, h: 40, kind: 'ground' });

    for (let s = 0; s < 4; s++) {
      const bx = 120 + s * 400;
      platforms.push(
        { x: bx + 40, y: 112, w: 75, h: 9, kind: 'ledge' },
        { x: bx + 160, y: 82, w: 75, h: 9, kind: 'ledge' },
        { x: bx + 270, y: 108, w: 80, h: 9, kind: 'ledge' }
      );
      crystals.push(
        { x: bx + 60, y: 95, w: 8, h: 10, taken: false },
        { x: bx + 180, y: 65, w: 8, h: 10, taken: false },
        { x: bx + 290, y: 90, w: 8, h: 10, taken: false }
      );
      if (s % 2 === 1) hazards.push({ x: bx + 65, y: 105, w: 18, h: 7, type: 'spike' });
    }

    hazards.push(
      { x: 500, y: 95, w: 14, h: 53, type: 'laserGate', active: true, cycleTimer: 0 },
      { x: 1050, y: 95, w: 14, h: 53, type: 'laserGate', active: true, cycleTimer: 30 },
      { x: 1550, y: 141, w: 22, h: 7, type: 'spike' }
    );

    const neonEnemies: Enemy['type'][] = ['patrol', 'sentinel', 'hopper', 'charger', 'sphere'];
    for (let x = 300, i = 0; x < 1700; x += 280, i++) {
      const type = neonEnemies[i % neonEnemies.length];
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: 134,
        w: 14,
        h: 14,
        min: x - 60,
        max: x + 90,
        vx: i % 2 === 0 ? 0.45 : -0.45,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        wait: 0,
        charge: 0,
        angle: 0
      });
    }

    landmarks.push(
      { type: 'warp_portal', x: 200, y: 40, scale: 1.4, label: 'ENTRADA A LA FISURA DIMENSIONAL' },
      { type: 'reactor_core', x: 1200, y: 25, scale: 1.2, label: 'NÚCLEO DE FUSIÓN NEÓN' }
    );

    checkpoints.push(
      { x: 1750, y: 108, w: 10, h: 40, active: false, spawn: { x: 1770, y: 110 } }
    );
    heals.push({ x: 1760, y: 126, w: 10, h: 10, taken: false });

    // -------------------------------------------------------------
    // SECTOR 2: BOSQUE DE SAKURA (1800 -> 3600)
    // -------------------------------------------------------------
    const sakuraGaps = [{ x: 2150, w: 65 }, { x: 2650, w: 70 }, { x: 3150, w: 65 }];
    let sStart = 1800;
    for (const g of sakuraGaps) {
      if (sStart < g.x) platforms.push({ x: sStart, y: 148, w: g.x - sStart, h: 40, kind: 'ground' });
      sStart = g.x + g.w;
    }
    platforms.push({ x: sStart, y: 148, w: 3600 - sStart, h: 40, kind: 'ground' });

    for (let s = 0; s < 4; s++) {
      const bx = 1850 + s * 420;
      platforms.push(
        { x: bx + 50, y: 114, w: 80, h: 8, kind: 'bridge' },
        { x: bx + 160, y: 80, w: 75, h: 8, kind: 'moon', phase: s * 1.5 },
        { x: bx + 270, y: 106, w: 80, h: 8, kind: 'bridge' }
      );
      crystals.push(
        { x: bx + 70, y: 96, w: 8, h: 10, taken: false },
        { x: bx + 180, y: 64, w: 8, h: 10, taken: false },
        { x: bx + 290, y: 90, w: 8, h: 10, taken: false }
      );
    }

    hazards.push(
      { x: 2100, y: 141, w: 22, h: 7, type: 'spike' },
      { x: 2800, y: 141, w: 22, h: 7, type: 'spike' },
      { x: 3300, y: 141, w: 24, h: 7, type: 'spike' }
    );

    const sakuraEnemies: Enemy['type'][] = ['kage', 'kagered', 'kitsune', 'yurei', 'kodama', 'butterfly'];
    for (let x = 1950, i = 0; x < 3500; x += 260, i++) {
      const type = sakuraEnemies[i % sakuraEnemies.length];
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: type === 'yurei' || type === 'butterfly' ? 90 : 134,
        w: 14,
        h: 14,
        min: x - 70,
        max: x + 80,
        vx: i % 2 === 0 ? 0.45 : -0.45,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        wait: 0,
        charge: 0,
        angle: 0
      });
    }

    landmarks.push(
      { type: 'torii', x: 1900, y: 30, scale: 1.3, label: 'TORII DE LA CONVERGENCIA' },
      { type: 'shrine', x: 2700, y: 30, scale: 1.3, label: 'SANTUARIO ANCESTRAL' },
      { type: 'bamboo', x: 3400, y: 35, scale: 1.2, label: 'ARBOLEDA DE BAMBÚ ESPIRITUAL' }
    );

    secrets.push({ x: 2600, y: 20, w: 10, h: 12, taken: false, name: '💠 Brújula del Continuo Espacio-Tiempo' });
    checkpoints.push(
      { x: 3550, y: 108, w: 10, h: 40, active: false, spawn: { x: 3570, y: 110 } }
    );
    heals.push({ x: 3560, y: 126, w: 10, h: 10, taken: false });

    // -------------------------------------------------------------
    // SECTOR 3: ACANTILADOS DE LAVA (3600 -> 5400)
    // -------------------------------------------------------------
    platforms.push(
      { x: 3600, y: 148, w: 300, h: 40, kind: 'ground' },
      { x: 3900, y: 156, w: 1200, h: 40, kind: 'ground' }, // Lava lake basin
      { x: 5100, y: 148, w: 300, h: 40, kind: 'ground' }
    );

    // Lava Hazard floor
    hazards.push({ x: 3900, y: 152, w: 1200, h: 36, type: 'lava' });

    // Sinking basalt rock stepping stones over the magma
    for (let bx = 3940, i = 0; bx < 5050; bx += 110, i++) {
      platforms.push({
        x: bx,
        y: 130 - (i % 3) * 18,
        w: 55,
        h: 12,
        kind: 'basalt',
        sinkTimer: 0,
        isSinking: false,
        originalY: 130 - (i % 3) * 18
      });
      crystals.push({ x: bx + 22, y: 105 - (i % 3) * 18, w: 8, h: 10, taken: false });
    }

    // Lava geysers and dropping stalactites
    for (let x = 4050, i = 0; x < 5000; x += 180, i++) {
      if (i % 2 === 0) {
        hazards.push({
          x,
          y: 60,
          w: 22,
          h: 90,
          type: 'geyser'
        });
      } else {
        hazards.push({
          x,
          y: 10,
          w: 12,
          h: 22,
          type: 'stalactite'
        });
      }
    }

    const lavaEnemies: Enemy['type'][] = ['magma_golem', 'salamander', 'flame_wisp', 'fire_hopper'];
    for (let x = 3700, i = 0; x < 5300; x += 220, i++) {
      const type = lavaEnemies[i % lavaEnemies.length];
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: type === 'flame_wisp' ? 85 : 120,
        w: 14,
        h: 14,
        min: x - 40,
        max: x + 60,
        vx: i % 2 === 0 ? 0.45 : -0.45,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        wait: 0,
        charge: 0,
        angle: 0
      });
    }

    landmarks.push(
      { type: 'volcano_vent', x: 3750, y: 25, scale: 1.4, label: 'CRÁTER MAGMÁTICO DIMENSIONAL' },
      { type: 'lava_fall', x: 4400, y: 15, scale: 1.4, label: 'CASCADA DE LAVA PURA' },
      { type: 'basalt_arch', x: 5050, y: 20, scale: 1.3, label: 'ARCO DE BASALTO ÍGNEO' }
    );

    secrets.push({ x: 4500, y: 15, w: 10, h: 12, taken: false, name: '🌸 Reliquia Trascendente de Sakura' });
    checkpoints.push(
      { x: 5350, y: 108, w: 10, h: 40, active: false, spawn: { x: 5370, y: 110 } }
    );
    heals.push({ x: 5360, y: 126, w: 10, h: 10, taken: false });

    // -------------------------------------------------------------
    // SECTOR 4: SANTUARIO DEL DESIERTO (5400 -> 7200)
    // -------------------------------------------------------------
    const desertGaps = [{ x: 5750, w: 80 }, { x: 6300, w: 80 }, { x: 6850, w: 80 }];
    let dStart = 5400;
    for (const g of desertGaps) {
      if (dStart < g.x) platforms.push({ x: dStart, y: 148, w: g.x - dStart, h: 40, kind: 'ground' });
      // Quicksand in gaps
      platforms.push({ x: g.x, y: 148, w: g.w, h: 40, kind: 'quicksand' });
      dStart = g.x + g.w;
    }
    platforms.push({ x: dStart, y: 148, w: 7200 - dStart, h: 40, kind: 'ground' });

    for (let s = 0; s < 4; s++) {
      const bx = 5500 + s * 420;
      platforms.push(
        { x: bx + 50, y: 112, w: 80, h: 9, kind: 'sandstone' },
        { x: bx + 160, y: 80, w: 75, h: 9, kind: 'ruins' },
        { x: bx + 270, y: 106, w: 80, h: 9, kind: 'sandstone' }
      );
      crystals.push(
        { x: bx + 70, y: 94, w: 8, h: 10, taken: false },
        { x: bx + 180, y: 62, w: 8, h: 10, taken: false },
        { x: bx + 290, y: 88, w: 8, h: 10, taken: false }
      );
    }

    // Pendulum scythes and falling blocks
    hazards.push(
      { x: 5800, y: 30, w: 20, h: 80, type: 'swingingBlade' },
      { x: 6350, y: 30, w: 20, h: 80, type: 'swingingBlade' },
      { x: 6900, y: 30, w: 20, h: 80, type: 'swingingBlade' }
    );

    const desertEnemies: Enemy['type'][] = ['mummy_warrior', 'scarab', 'sand_serpent', 'anubis_statue', 'desert_vulture'];
    for (let x = 5550, i = 0; x < 7100; x += 240, i++) {
      const type = desertEnemies[i % desertEnemies.length];
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: type === 'desert_vulture' ? 85 : 134,
        w: 14,
        h: 14,
        min: x - 60,
        max: x + 80,
        vx: i % 2 === 0 ? 0.45 : -0.45,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        wait: 0,
        charge: 0,
        angle: 0
      });
    }

    landmarks.push(
      { type: 'pyramid', x: 5550, y: 20, scale: 1.4, label: 'GRAN PIRÁMIDE DEL DESTINO' },
      { type: 'sphinx', x: 6250, y: 30, scale: 1.3, label: 'ESFINGE SAGRADA DE RA' },
      { type: 'obelisk', x: 7050, y: 20, scale: 1.4, label: 'OBELISCO DEL TIEMPO' }
    );

    secrets.push({ x: 6400, y: 15, w: 10, h: 12, taken: false, name: '🔥 Corazón de Magma Primordial' });
    checkpoints.push(
      { x: 7150, y: 108, w: 10, h: 40, active: false, spawn: { x: 7170, y: 110 } }
    );
    heals.push({ x: 7160, y: 126, w: 10, h: 10, taken: false });

    // -------------------------------------------------------------
    // SECTOR 5: KRONO METRÓPOLIS CIBERPUNK (7200 -> 8600)
    // -------------------------------------------------------------
    platforms.push(
      { x: 7200, y: 148, w: 350, h: 40, kind: 'ground' },
      // High-speed Conveyors
      { x: 7550, y: 148, w: 250, h: 40, kind: 'conveyor', dir: 1, speed: 1.5 },
      { x: 7800, y: 148, w: 200, h: 40, kind: 'ground' },
      { x: 8000, y: 148, w: 280, h: 40, kind: 'conveyor', dir: -1, speed: 1.5 },
      { x: 8280, y: 148, w: 320, h: 40, kind: 'ground' }
    );

    // Floating Cyber Ledges & Hologram platforms
    for (let s = 0; s < 3; s++) {
      const bx = 7300 + s * 400;
      platforms.push(
        { x: bx + 50, y: 110, w: 85, h: 9, kind: 'cyber' },
        { x: bx + 160, y: 78, w: 80, h: 9, kind: 'hologram', phase: s * 2 },
        { x: bx + 270, y: 106, w: 85, h: 9, kind: 'cyber' }
      );
      crystals.push(
        { x: bx + 70, y: 92, w: 8, h: 10, taken: false },
        { x: bx + 180, y: 60, w: 8, h: 10, taken: false },
        { x: bx + 290, y: 88, w: 8, h: 10, taken: false }
      );
    }

    hazards.push(
      { x: 7450, y: 95, w: 14, h: 53, type: 'laserGate' },
      { x: 7900, y: 95, w: 14, h: 53, type: 'laserGate' },
      { x: 8350, y: 142, w: 28, h: 6, type: 'empFloor' }
    );

    const cyberEnemies: Enemy['type'][] = ['plasma_trooper', 'cyberturret', 'cyber_drone', 'cyber_hound', 'gravity_orb'];
    for (let x = 7300, i = 0; x < 8500; x += 220, i++) {
      const type = cyberEnemies[i % cyberEnemies.length];
      const stats = getEnemyStats(type);
      enemies.push({
        id: enemyId++,
        type,
        x,
        y: type === 'cyber_drone' || type === 'gravity_orb' ? 85 : 134,
        w: 14,
        h: 14,
        min: x - 60,
        max: x + 75,
        vx: i % 2 === 0 ? 0.5 : -0.5,
        vy: 0,
        alive: true,
        hp: stats.hp,
        maxHp: stats.hp,
        xpValue: stats.xp,
        scoreValue: stats.score,
        hitFlash: 0,
        home: x,
        wait: 0,
        charge: 0,
        angle: 0
      });
    }

    landmarks.push(
      { type: 'cyber_skyscraper', x: 7350, y: 15, w: 160, label: 'TORRE CUÁNTICA KRONOS' },
      { type: 'holo_billboard', x: 7850, y: 35, scale: 1.3, label: 'HOLOGRAMA DEL CONTINUO' },
      { type: 'antenna_tower', x: 8400, y: 15, scale: 1.4, label: 'RELAY DE LA MATRIZ' }
    );

    secrets.push({ x: 8100, y: 20, w: 10, h: 12, taken: false, name: '👑 Cetro Eterno de Anubis y Kronos' });
    checkpoints.push(
      { x: 8550, y: 108, w: 10, h: 40, active: false, spawn: { x: 8570, y: 110 } }
    );
    heals.push({ x: 8560, y: 126, w: 10, h: 10, taken: false });

    // -------------------------------------------------------------
    // SECTOR 6: EL NÚCLEO DE FUSIÓN DIMENSIONAL (8600 -> 9600)
    // (El Gran Desafío Final que fusiona todas las mecánicas juntas)
    // -------------------------------------------------------------
    platforms.push(
      { x: 8600, y: 148, w: 200, h: 40, kind: 'ground' },
      // Magma river below with conveyor and basalt stepping stones
      { x: 8800, y: 156, w: 500, h: 40, kind: 'ground' },
      { x: 9300, y: 148, w: 300, h: 40, kind: 'arena' }
    );
    hazards.push({ x: 8800, y: 152, w: 500, h: 36, type: 'lava' });

    // Multi-tier fusion platforms
    platforms.push(
      { x: 8820, y: 124, w: 75, h: 9, kind: 'conveyor', dir: 1, speed: 1.6 },
      { x: 8930, y: 96, w: 75, h: 9, kind: 'moon', phase: 0 },
      { x: 9040, y: 68, w: 80, h: 9, kind: 'basalt', sinkTimer: 0, isSinking: false, originalY: 68 },
      { x: 9150, y: 96, w: 75, h: 9, kind: 'hologram', phase: 2 },
      { x: 9240, y: 124, w: 75, h: 9, kind: 'sandstone' }
    );

    // Hazard Gauntlet
    hazards.push(
      { x: 8900, y: 25, w: 20, h: 80, type: 'swingingBlade' },
      { x: 9100, y: 55, w: 22, h: 90, type: 'geyser' },
      { x: 9280, y: 95, w: 14, h: 53, type: 'laserGate' }
    );

    // Elite Boss-Level Guardian Squad (All Eras)
    const finaleEnemies: Enemy['type'][] = ['plasma_trooper', 'anubis_statue', 'magma_golem', 'kagered', 'cyberturret'];
    for (let i = 0; i < finaleEnemies.length; i++) {
      const type = finaleEnemies[i];
      const stats = getEnemyStats(type);
      const ex = 8850 + i * 110;
      enemies.push({
        id: enemyId++,
        type,
        x: ex,
        y: 110 - (i % 2) * 20,
        w: 16,
        h: 16,
        min: ex - 40,
        max: ex + 40,
        vx: i % 2 === 0 ? 0.5 : -0.5,
        vy: 0,
        alive: true,
        hp: stats.hp + 2,
        maxHp: stats.hp + 2,
        xpValue: stats.xp * 2,
        scoreValue: stats.score * 2,
        hitFlash: 0,
        home: ex,
        cool: 25,
        angle: 0
      });
    }

    for (let x = 8650; x < 9500; x += 70) {
      crystals.push({ x, y: 110 - (x % 50), w: 8, h: 10, taken: false });
    }

    landmarks.push(
      { type: 'dimensional_rift', x: 8750, y: 20, scale: 1.6, label: 'FISURA DIMENSIONAL SUPREMA' },
      { type: 'travel_beacon', x: 9400, y: 25, scale: 1.6, label: 'FARO DIMENSIONAL DE KRONOS: VICTORIA' }
    );

    secrets.push({ x: 9350, y: 20, w: 12, h: 14, taken: false, name: '⭐ Reloj Cuántico de Dmn: Fusión Dimensional' });
    heals.push({ x: 9380, y: 126, w: 10, h: 10, taken: false });

    goal = { x: 9450, y: 88, w: 36, h: 62 };
  }

  return {
    config,
    platforms,
    hazards,
    enemies,
    crystals,
    secrets,
    heals,
    checkpoints,
    landmarks,
    nodes,
    boss,
    goal
  };
}
