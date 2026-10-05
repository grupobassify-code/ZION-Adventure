import { CharacterSkin, ZoneId } from '../types';

export interface CharacterConfig {
  id: CharacterSkin;
  name: string;
  subtitle: string;
  title: string;
  originZone: ZoneId;
  element: string;
  rarity: 'LEGENDARIO' | 'ÉPICO' | 'MÍTICO';
  rarityColor: string;
  rarityBorder: string;
  rarityGlow: string;
  rarityBg: string;
  description: string;
  quote: string;

  // Visual Assets
  splashImage: string;
  pixelArtImage: string;

  // Clock piece unlock requirement
  unlockPieceId?: string;
  unlockRequirement: string;
  unlockZoneName: string;

  // Combat Modifiers (Balanced)
  speedMultiplier: number;
  defenseMultiplier: number; // multiplier on incoming damage (< 1.0 = sturdier)
  meleeDamage: number;
  meleeDuration: number;
  meleeReach: number;
  meleeColor: string;
  critChance: number;
  critMultiplier: number;

  // Daggers / Ranged Projectiles
  daggerName: string;
  daggerKind: 'normal' | 'sakuraShuriken' | 'magmaDart' | 'sandDart' | 'empDisc' | 'jadeDart' | 'iceShard' | 'steamBolt' | 'ironJavelin' | 'anchorHarpoon' | 'primalClaw' | 'starPebble';
  daggerSpeed: number;
  daggerDamage: number;
  daggerColor: string;

  // Super Ability (Q / V)
  specialName: string;
  specialCost: number;
  specialRadius: number;
  specialColor: string;
  specialStyle: 'sphere' | 'lotus' | 'caldera' | 'sandstorm' | 'empShock' | 'quetzalBurst' | 'blizzardStorm' | 'clockworkOverload' | 'knightsWrath' | 'krakenTide' | 'dinoRoar' | 'supernova';

  abilities: {
    name: string;
    type: string;
    desc: string;
  }[];
}

export const CHARACTERS_CONFIG: Record<CharacterSkin, CharacterConfig> = {
  // -------------------------------------------------------------
  // ZONA 1: BOSQUE NEÓN — ZION CLÁSICO
  // -------------------------------------------------------------
  zion: {
    id: 'zion',
    name: 'Zion Clásico',
    subtitle: 'Atuendo Cuántico Original',
    title: 'Zion con Armadura Cuántica de Neón • Zona 1: Bosque Neón',
    originZone: 'neon',
    element: 'Energía Cuántica Neón',
    rarity: 'LEGENDARIO',
    rarityColor: 'text-amber-400',
    rarityBorder: 'border-amber-400',
    rarityGlow: 'rgba(245, 158, 11, 0.4)',
    rarityBg: 'bg-amber-500/15',
    description:
      'El atuendo original de Zion, forjado en el Santuario de Bosque Neón. Su espada de plasma y bufanda de energía cuántica ofrecen un balance perfecto de velocidad, agilidad y control del tiempo.',
    quote: '«El tiempo no se detiene... nosotros lo comandamos.»',

    splashImage: '/src/assets/images/zion_hero_skin_1790959669519.jpg',
    pixelArtImage: '/src/assets/images/zion_pixel_skin_1790959971139.jpg',

    unlockPieceId: undefined,
    unlockRequirement: 'Disponible desde el inicio · Skin Predeterminada',
    unlockZoneName: 'Zona 1 · Bosque Neón',

    speedMultiplier: 1.0,
    defenseMultiplier: 1.0,
    meleeDamage: 2,
    meleeDuration: 10,
    meleeReach: 24,
    meleeColor: '#22d3ee',
    critChance: 0.06,
    critMultiplier: 1.5,

    daggerName: 'Dagas Cuánticas Arrojadizas',
    daggerKind: 'normal',
    daggerSpeed: 5.2,
    daggerDamage: 1,
    daggerColor: '#38bdf8',

    specialName: 'Singularidad de Kronos',
    specialCost: 70,
    specialRadius: 68,
    specialColor: '#22d3ee',
    specialStyle: 'sphere',

    abilities: [
      {
        name: 'Espada de Plasma Neón',
        type: 'Ataque Principal',
        desc: 'Filo de fotones equilibrado que neutraliza proyectiles y asesta combos rítmicos de 3 golpes.',
      },
      {
        name: 'Dagas Cuánticas Arrojadizas',
        type: 'A Distancia',
        desc: 'Proyectiles precisos de energía comprimida que cruzan el campo en trayectoria recta.',
      },
      {
        name: 'Escudo de Luz Temporal',
        type: 'Defensa / Parry',
        desc: 'Barrera hexagonal que desvía ataques y activa contraataques en tiempo bala.',
      },
      {
        name: 'Singularidad de Kronos',
        type: 'Especial Mítico',
        desc: 'Detonación esférica de 360° que desacelera el tiempo y disipa proyectiles hostiles.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 2: SPIRIT BLOSSOM (SAKURA) — ZION FLOR ASTRAL
  // -------------------------------------------------------------
  zizz: {
    id: 'zizz',
    name: 'Zion Flor Astral',
    subtitle: 'Atuendo Kunoichi de Sakura',
    title: 'Zion con Manto Astral de Sakura • Zona 2: Sakura',
    originZone: 'sakura',
    element: 'Éter Astral & Pétalos Sakura',
    rarity: 'ÉPICO',
    rarityColor: 'text-fuchsia-400',
    rarityBorder: 'border-fuchsia-400',
    rarityGlow: 'rgba(217, 70, 239, 0.4)',
    rarityBg: 'bg-fuchsia-500/15',
    description:
      'Zion viste el traje de Kunoichi tejido con seda del Cerezo Astral. Sus katanas gemelas cortan con rapidez cegadora y un 28% de probabilidad de asestar golpes críticos.',
    quote: '«Entre el pétalo que cae y el filo que danza, el tiempo desaparece.»',

    splashImage: '/src/assets/images/zion_sakura_skin_1791043028355.jpg',
    pixelArtImage: '/src/assets/images/zion_sakura_skin_1791043028355.jpg',

    unlockPieceId: 'sakura',
    unlockRequirement: 'Coloca la Pieza 2 (Péndulo Sakura) en el Reloj',
    unlockZoneName: 'Zona 2 · Cerezo Astral (Sakura)',

    speedMultiplier: 1.08,
    defenseMultiplier: 1.05,
    meleeDamage: 2,
    meleeDuration: 8,
    meleeReach: 23,
    meleeColor: '#f472b6',
    critChance: 0.28,
    critMultiplier: 1.8,

    daggerName: 'Shurikens Lunares de Sakura',
    daggerKind: 'sakuraShuriken',
    daggerSpeed: 5.8,
    daggerDamage: 1,
    daggerColor: '#fb7185',

    specialName: 'Danza del Loto Astral',
    specialCost: 65,
    specialRadius: 62,
    specialColor: '#f472b6',
    specialStyle: 'lotus',

    abilities: [
      {
        name: 'Katanas Gemelas de Sakura',
        type: 'Ataque Doble Veloz',
        desc: 'Cortes en abanico 20% más rápidos con un 28% de probabilidad de asestar golpes críticos devastadores.',
      },
      {
        name: 'Shurikens Lunares Giratorios',
        type: 'A Distancia',
        desc: 'Estrellas ninja resplandecientes que giran a gran velocidad dejando estelas de pétalos.',
      },
      {
        name: 'Desvanecimiento de Pétalos',
        type: 'Evasión Ligera',
        desc: 'Dash de velocidad supersónica que deja una ráfaga de pétalos rosados envolventes.',
      },
      {
        name: 'Danza del Loto Astral',
        type: 'Especial Astral',
        desc: 'Torbellino místico de cuchillas de loto que corta en rápida sucesión con invulnerabilidad temporal.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 3: ACANTILADOS DE LAVA — ZION PALADÍN ÍGNEO
  // -------------------------------------------------------------
  kael: {
    id: 'kael',
    name: 'Zion Paladín Ígneo',
    subtitle: 'Armadura Volcánica de Magma',
    title: 'Zion con Placas de Lava • Zona 3: Acantilados de Lava',
    originZone: 'lavacliff',
    element: 'Fuego Estelar & Magma Cuántico',
    rarity: 'MÍTICO',
    rarityColor: 'text-orange-400',
    rarityBorder: 'border-orange-400',
    rarityGlow: 'rgba(249, 115, 22, 0.4)',
    rarityBg: 'bg-orange-500/15',
    description:
      'Zion se equipa con la armadura pesada forjada en las calderas de lava. Su blindaje reduce el daño recibido un 12% y blande el mandoble volcánico con devastador impacto sísmico.',
    quote: '«Ni la gravedad ni el tiempo pueden extinguir la llama primordial.»',

    splashImage: '/src/assets/images/zion_volcano_skin_1791043039985.jpg',
    pixelArtImage: '/src/assets/images/zion_volcano_skin_1791043039985.jpg',

    unlockPieceId: 'lavacliff',
    unlockRequirement: 'Coloca la Pieza 3 (Engranaje Ígneo) en el Reloj',
    unlockZoneName: 'Zona 3 · Acantilados de Lava',

    speedMultiplier: 0.94,
    defenseMultiplier: 0.88,
    meleeDamage: 3,
    meleeDuration: 12,
    meleeReach: 28,
    meleeColor: '#f97316',
    critChance: 0.05,
    critMultiplier: 1.5,

    daggerName: 'Piro-Dardos de Magma',
    daggerKind: 'magmaDart',
    daggerSpeed: 4.6,
    daggerDamage: 2,
    daggerColor: '#f97316',

    specialName: 'Erupción de Falla Solar',
    specialCost: 75,
    specialRadius: 76,
    specialColor: '#ef4444',
    specialStyle: 'caldera',

    abilities: [
      {
        name: 'Mandoble Sísmico Volcánico',
        type: 'Impacto Pesado',
        desc: 'Golpes contundentes de mayor alcance (+4) y daño (+1) que empujan y rompen defensas enemigas.',
      },
      {
        name: 'Piro-Dardos de Magma',
        type: 'A Distancia Pesado',
        desc: 'Lanzas ígneas que infligen daño doble (2 HP) dejando chispas incandescentes.',
      },
      {
        name: 'Blindaje de Obsidiana',
        type: 'Defensa Pesada Pasiva',
        desc: 'Coraza reforzada que reduce un 12% todo el daño que recibe Zion.',
      },
      {
        name: 'Erupción de Falla Solar',
        type: 'Especial Titánico',
        desc: 'Desata columnas de lava y ondas tectónicas ardientes que pulverizan a los rivales.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 4: DESIERTO EGIPCIO — ZION CENTINELA SOLAR
  // -------------------------------------------------------------
  anuk: {
    id: 'anuk',
    name: 'Zion Centinela Solar',
    subtitle: 'Atuendo del Faraón Sagrado',
    title: 'Zion con Tocado Nemes • Zona 4: Desierto Egipcio',
    originZone: 'desert',
    element: 'Oro Sagrado & Viento Solar',
    rarity: 'LEGENDARIO',
    rarityColor: 'text-amber-400',
    rarityBorder: 'border-amber-400',
    rarityGlow: 'rgba(245, 158, 11, 0.4)',
    rarityBg: 'bg-amber-500/15',
    description:
      'Zion porta el tocado real de oro y lapislázuli con la bendición del Dios Ra. Es inmune a las arenas movedizas y empuña la espada curva Khopesh de oro sagrado.',
    quote: '«Las arenas sepultan imperios, pero el sol de Ra siempre renace.»',

    splashImage: '/src/assets/images/zion_egypt_skin_1791043051324.jpg',
    pixelArtImage: '/src/assets/images/zion_egypt_skin_1791043051324.jpg',

    unlockPieceId: 'desert',
    unlockRequirement: 'Coloca la Pieza 4 (Escarabajo Solar) en el Reloj',
    unlockZoneName: 'Zona 4 · Desierto Egipcio',

    speedMultiplier: 1.02,
    defenseMultiplier: 0.96,
    meleeDamage: 2,
    meleeDuration: 9,
    meleeReach: 25,
    meleeColor: '#eab308',
    critChance: 0.14,
    critMultiplier: 1.6,

    daggerName: 'Dardos de Cristal Solar',
    daggerKind: 'sandDart',
    daggerSpeed: 5.4,
    daggerDamage: 1,
    daggerColor: '#f59e0b',

    specialName: 'Tormenta del Ojo de Ra',
    specialCost: 70,
    specialRadius: 70,
    specialColor: '#eab308',
    specialStyle: 'sandstorm',

    abilities: [
      {
        name: 'Khopesh de Oro Sagrado',
        type: 'Corte Ágil Curvo',
        desc: 'Espada curva egipcia que corta con ráfagas de polvo de oro y filo solar.',
      },
      {
        name: 'Dardos de Cristal Solar',
        type: 'A Distancia',
        desc: 'Plumas afiladas de cristal y oro que vuelan en línea recta dejando destellos de espejismo.',
      },
      {
        name: 'Paso del Espejismo',
        type: 'Pasiva de Terreno',
        desc: 'Inmunidad natural a arenas movedizas y 10% más de impulso vertical en saltos.',
      },
      {
        name: 'Tormenta del Ojo de Ra',
        type: 'Superpoder Solar',
        desc: 'Convoca un vórtice celestial de arena y fuego que barre proyectiles y quema a los rivales.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 5: KRONO CITY — ZION AGENTE DE FUSIÓN
  // -------------------------------------------------------------
  vector: {
    id: 'vector',
    name: 'Zion Agente de Fusión',
    subtitle: 'Exo-Traje Táctico de Datos',
    title: 'Zion con Traje de Fusión • Zona 5: Krono City',
    originZone: 'krono',
    element: 'Pulso Iónico & Datos Cuánticos',
    rarity: 'ÉPICO',
    rarityColor: 'text-indigo-400',
    rarityBorder: 'border-indigo-400',
    rarityGlow: 'rgba(99, 102, 241, 0.4)',
    rarityBg: 'bg-indigo-500/15',
    description:
      'Zion viste el exo-traje de nano-carbono con visor de escaneo HUD. Blande nanodagas de pulso iónico de alta frecuencia y desata pulsos electromagnéticos PEM.',
    quote: '«Todo sistema tiene una brecha... y yo soy su colapso.»',

    splashImage: '/src/assets/images/zion_krono_skin_1791043062194.jpg',
    pixelArtImage: '/src/assets/images/zion_krono_skin_1791043062194.jpg',

    unlockPieceId: 'krono',
    unlockRequirement: 'Coloca la Pieza 5 (Corazón Cuántico) en el Reloj',
    unlockZoneName: 'Zona 5 · Krono City',

    speedMultiplier: 1.05,
    defenseMultiplier: 1.0,
    meleeDamage: 2,
    meleeDuration: 9,
    meleeReach: 24,
    meleeColor: '#6366f1',
    critChance: 0.12,
    critMultiplier: 1.6,

    daggerName: 'Discos PEM de Krono',
    daggerKind: 'empDisc',
    daggerSpeed: 5.7,
    daggerDamage: 1,
    daggerColor: '#818cf8',

    specialName: 'Sobrecarga de Fusión Cuántica',
    specialCost: 68,
    specialRadius: 72,
    specialColor: '#6366f1',
    specialStyle: 'empShock',

    abilities: [
      {
        name: 'Nanodagas de Pulso Iónico',
        type: 'Corte de Alta Frecuencia',
        desc: 'Hojas cibernéticas ultra-rápidas que desprenden chispas de datos en cada combo.',
      },
      {
        name: 'Discos PEM Holográficos',
        type: 'A Distancia Veloz',
        desc: 'Discos arrojadizos rotatorios cargados de energía electromagnética de alta velocidad.',
      },
      {
        name: 'Batería de Sobrecarga',
        type: 'Pasiva de Combate',
        desc: 'Recarga energía de Superpoder un 15% más rápido al conectar ataques y bloqueos.',
      },
      {
        name: 'Sobrecarga de Fusión Cuántica',
        type: 'Superpoder Electromagnético',
        desc: 'Onda expansiva de pulso PEM que aturde sistemas y causa una potente sobretensión digital.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 6: JUNGLE RUN (SELVA MAYA) — ZION GUERRERO JAGUAR
  // -------------------------------------------------------------
  balam: {
    id: 'balam',
    name: 'Zion Guerrero Jaguar',
    subtitle: 'Manto Sagrado de la Selva',
    title: 'Zion con Manto de Jaguar • Zona 6: Selva Maya',
    originZone: 'jungle',
    element: 'Jade Ancestral & Furia Jaguar',
    rarity: 'MÍTICO',
    rarityColor: 'text-emerald-400',
    rarityBorder: 'border-emerald-400',
    rarityGlow: 'rgba(16, 185, 129, 0.4)',
    rarityBg: 'bg-emerald-500/15',
    description:
      'Zion viste el yelmo de jade tallado y el manto sagrado del jaguar maya. Se mueve con salto felino indomable y empuña la maza ceremonial Macuahuitl de obsidiana.',
    quote: '«En la espesura de la selva, el jaguar acecha antes del amanecer.»',

    splashImage: '/src/assets/images/zion_maya_skin_1791043074490.jpg',
    pixelArtImage: '/src/assets/images/zion_maya_skin_1791043074490.jpg',

    unlockPieceId: 'jungle',
    unlockRequirement: 'Coloca la Pieza 6 (Gema Sagrada) en el Reloj',
    unlockZoneName: 'Zona 6 · Selva Maya (Jungle Run)',

    speedMultiplier: 1.03,
    defenseMultiplier: 0.94,
    meleeDamage: 2,
    meleeDuration: 9,
    meleeReach: 26,
    meleeColor: '#10b981',
    critChance: 0.16,
    critMultiplier: 1.7,

    daggerName: 'Espinas de Jade Sagrado',
    daggerKind: 'jadeDart',
    daggerSpeed: 5.2,
    daggerDamage: 1,
    daggerColor: '#34d399',

    specialName: 'Furia Ancestral de Kukulkán',
    specialCost: 72,
    specialRadius: 74,
    specialColor: '#10b981',
    specialStyle: 'quetzalBurst',

    abilities: [
      {
        name: 'Macuahuitl de Jade Ancestral',
        type: 'Corte Ceremonial Feroz',
        desc: 'Maza de madera dura con navajas de jade y obsidiana con alto impacto y 16% de crítico.',
      },
      {
        name: 'Espinas de Jade Sagrado',
        type: 'A Distancia',
        desc: 'Dardos venenosos de piedra preciosa que vuelan con silbido y rastro de esporas selváticas.',
      },
      {
        name: 'Salto Felino de la Selva',
        type: 'Pasiva de Movimiento',
        desc: 'Mayor agarre en lianas y balanceo, con zancada atlética y reducción de retroceso.',
      },
      {
        name: 'Furia Ancestral de Kukulkán',
        type: 'Superpoder Místico',
        desc: 'Ráfaga arremolinada de plumas de quetzal y garras de jaguar que desgarra en 360°.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 7: BLIZZARD PEAK — ZION CAZADOR GLACIAL
  // -------------------------------------------------------------
  blizzard: {
    id: 'blizzard',
    name: 'Zion Cazador Glacial',
    subtitle: 'Atuendo Criogénico de Nieve',
    title: 'Zion con Traje Térmico de Hielo • Zona 7: Blizzard Peak',
    originZone: 'blizzard',
    element: 'Hielo Criogénico & Escarcha Cuántica',
    rarity: 'LEGENDARIO',
    rarityColor: 'text-cyan-300',
    rarityBorder: 'border-cyan-400',
    rarityGlow: 'rgba(6, 182, 212, 0.4)',
    rarityBg: 'bg-cyan-500/15',
    description:
      'Zion viste el traje de invierno reforzado con cuello de piel y nanofibras térmicas. No resbala en el hielo, esquía a máxima velocidad y empuña filos de plasma de cristal helado.',
    quote: '«El frío congela el movimiento, pero afila el espíritu.»',

    splashImage: '/src/assets/images/zion_blizzard_pixel_1790960491185.jpg',
    pixelArtImage: '/src/assets/images/zion_blizzard_pixel_1790960491185.jpg',

    unlockPieceId: undefined,
    unlockRequirement: 'Derrota a Yukio el Yeti en Blizzard Peak (Acto 3)',
    unlockZoneName: 'Zona 7 · Blizzard Peak',

    speedMultiplier: 1.06,
    defenseMultiplier: 0.98,
    meleeDamage: 2,
    meleeDuration: 9,
    meleeReach: 24,
    meleeColor: '#67e8f9',
    critChance: 0.15,
    critMultiplier: 1.6,

    daggerName: 'Carámbanos de Hielo Criogénico',
    daggerKind: 'iceShard',
    daggerSpeed: 5.6,
    daggerDamage: 1,
    daggerColor: '#a5f3fc',

    specialName: 'Tormenta del Cero Absoluto',
    specialCost: 70,
    specialRadius: 72,
    specialColor: '#38bdf8',
    specialStyle: 'blizzardStorm',

    abilities: [
      {
        name: 'Hojas de Cristal Criogénico',
        type: 'Ataque Helado Rápido',
        desc: 'Cortes que desprenden escarcha cuántica y congelan proyectiles enemigos.',
      },
      {
        name: 'Carámbanos Arrojadizos',
        type: 'A Distancia',
        desc: 'Proyectiles de hielo afilado de alta velocidad que perforan objetivos.',
      },
      {
        name: 'Tracción Glacial',
        type: 'Pasiva de Terreno',
        desc: 'Inmunidad a resbalones sobre hielo y aceleración mejorada al esquiar.',
      },
      {
        name: 'Tormenta del Cero Absoluto',
        type: 'Superpoder Criogénico',
        desc: 'Ventisca gélida que ralentiza el campo y fragmenta enemigos cercanos.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 8: STEAMPUNK FOUNDRY — ZION INGENIERO A VAPOR
  // -------------------------------------------------------------
  steampunk: {
    id: 'steampunk',
    name: 'Zion Ingeniero a Vapor',
    subtitle: 'Armadura de Bronce y Relojería',
    title: 'Zion con Exoesqueleto de Engranajes • Zona 8: Steampunk Foundry',
    originZone: 'steampunk',
    element: 'Presión de Vapor & Mecánica Cuántica',
    rarity: 'ÉPICO',
    rarityColor: 'text-amber-500',
    rarityBorder: 'border-amber-500',
    rarityGlow: 'rgba(245, 158, 11, 0.4)',
    rarityBg: 'bg-amber-500/15',
    description:
      'Zion viste una armadura industrial forjada con aleaciones de bronce y engranajes mecánicos. Empuña un sable a pistón de vapor que expulsa chorros hirvientes con fuerza.',
    quote: '«La precisión de los engranajes rige el curso de la historia.»',

    splashImage: '/src/assets/images/zion_steampunk_pixel_1790960502966.jpg',
    pixelArtImage: '/src/assets/images/zion_steampunk_pixel_1790960502966.jpg',

    unlockPieceId: undefined,
    unlockRequirement: 'Derrota a Vulkan-Ω en Steampunk Foundry (Acto 3)',
    unlockZoneName: 'Zona 8 · Steampunk Foundry',

    speedMultiplier: 0.98,
    defenseMultiplier: 0.92,
    meleeDamage: 3,
    meleeDuration: 11,
    meleeReach: 26,
    meleeColor: '#f59e0b',
    critChance: 0.10,
    critMultiplier: 1.6,

    daggerName: 'Remaches de Alta Presión',
    daggerKind: 'steamBolt',
    daggerSpeed: 5.4,
    daggerDamage: 2,
    daggerColor: '#fbbf24',

    specialName: 'Sobrecarga de Caldera Cuántica',
    specialCost: 72,
    specialRadius: 75,
    specialColor: '#f59e0b',
    specialStyle: 'clockworkOverload',

    abilities: [
      {
        name: 'Sable a Pistón de Vapor',
        type: 'Impacto Mecánico',
        desc: 'Golpes reforzados con pistones neumáticos de vapor que infligen daño pesado.',
      },
      {
        name: 'Remaches de Alta Presión',
        type: 'A Distancia',
        desc: 'Proyectiles de metal incandescente expulsados a gran potencia.',
      },
      {
        name: 'Engranajes Blindados',
        type: 'Pasiva Defensiva',
        desc: 'Reduce un 8% el daño recibido y resiste el empuje de trampas industriales.',
      },
      {
        name: 'Sobrecarga de Caldera Cuántica',
        type: 'Superpoder de Vapor',
        desc: 'Emisión masiva de vapor supercalentado y detonación de engranajes mecánicos.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 9: CASTLE SMASH — ZION CABALLERO REAL
  // -------------------------------------------------------------
  castlesmash: {
    id: 'castlesmash',
    name: 'Zion Caballero Real',
    subtitle: 'Armadura de Placas de la Fortaleza',
    title: 'Zion con Armadura de Asedio • Zona 9: Castle Smash',
    originZone: 'castlesmash',
    element: 'Acero Templado & Honor Real',
    rarity: 'LEGENDARIO',
    rarityColor: 'text-blue-400',
    rarityBorder: 'border-blue-500',
    rarityGlow: 'rgba(59, 130, 246, 0.4)',
    rarityBg: 'bg-blue-500/15',
    description:
      'Zion se equipa con la armadura de placas de acero pulido y gualdrapa azul heráldica. Su mandoble de caballero rompe escudos y murallas con impacto demoledor.',
    quote: '«Por el reino y la corona del tiempo, ninguna muralla resistirá.»',

    splashImage: '/src/assets/images/zion_castle_pixel_1790960512934.jpg',
    pixelArtImage: '/src/assets/images/zion_castle_pixel_1790960512934.jpg',

    unlockPieceId: undefined,
    unlockRequirement: 'Derrota al Rey Demoledor en Castle Smash (Acto 3)',
    unlockZoneName: 'Zona 9 · Castle Smash',

    speedMultiplier: 0.96,
    defenseMultiplier: 0.86,
    meleeDamage: 3,
    meleeDuration: 12,
    meleeReach: 27,
    meleeColor: '#3b82f6',
    critChance: 0.08,
    critMultiplier: 1.5,

    daggerName: 'Jabalinas de Acero Templado',
    daggerKind: 'ironJavelin',
    daggerSpeed: 5.0,
    daggerDamage: 2,
    daggerColor: '#60a5fa',

    specialName: 'Bastión de la Guardia Real',
    specialCost: 74,
    specialRadius: 78,
    specialColor: '#3b82f6',
    specialStyle: 'knightsWrath',

    abilities: [
      {
        name: 'Mandoble del Bastión Real',
        type: 'Tajo Pesado Rompe-Murallas',
        desc: 'Golpes majestuosos de amplio barrido que rompen guardias y causan alto daño.',
      },
      {
        name: 'Jabalinas de Acero',
        type: 'A Distancia',
        desc: 'Lanzas forjadas arrojadizas que infligen daño contundente a enemigos lejanos.',
      },
      {
        name: 'Placas de Acero Templado',
        type: 'Defensa Pasiva',
        desc: 'El peto reforzado absorbe un 14% de todo el daño recibido.',
      },
      {
        name: 'Bastión de la Guardia Real',
        type: 'Superpoder de Fortaleza',
        desc: 'Cúpula heráldica de espadas espectrales que defiende y barre la zona.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 10: PIRATE'S TREASURE — ZION CORSARIO DEL OCÉANO
  // -------------------------------------------------------------
  pirate: {
    id: 'pirate',
    name: 'Zion Corsario del Océano',
    subtitle: 'Atuendo de Capitán de los Mares',
    title: 'Zion con Atuendo de Corsario • Zona 10: Pirate\'s Treasure',
    originZone: 'piratestreasure',
    element: 'Mareas Oceánicas & Viento de Tempestad',
    rarity: 'ÉPICO',
    rarityColor: 'text-teal-400',
    rarityBorder: 'border-teal-400',
    rarityGlow: 'rgba(20, 184, 166, 0.4)',
    rarityBg: 'bg-teal-500/15',
    description:
      'Zion viste la casaca de capitán de galeón con ribetes de oro y tricornio pirata. Empuña el alfanje curvo de abordaje imbuido con la furia de las mareas.',
    quote: '«El oro es pasajero, la libertad del océano es eterna.»',

    splashImage: '/src/assets/images/zion_pirate_pixel_1790960521738.jpg',
    pixelArtImage: '/src/assets/images/zion_pirate_pixel_1790960521738.jpg',

    unlockPieceId: undefined,
    unlockRequirement: 'Derrota al Capitán Barbanegra en Pirate\'s Treasure (Acto 3)',
    unlockZoneName: 'Zona 10 · Pirate\'s Treasure',

    speedMultiplier: 1.04,
    defenseMultiplier: 0.98,
    meleeDamage: 2,
    meleeDuration: 9,
    meleeReach: 25,
    meleeColor: '#14b8a6',
    critChance: 0.20,
    critMultiplier: 1.7,

    daggerName: 'Arpones de Abordaje Rápido',
    daggerKind: 'anchorHarpoon',
    daggerSpeed: 5.5,
    daggerDamage: 1,
    daggerColor: '#2dd4bf',

    specialName: 'Maremoto del Kraken Ancestral',
    specialCost: 68,
    specialRadius: 74,
    specialColor: '#14b8a6',
    specialStyle: 'krakenTide',

    abilities: [
      {
        name: 'Alfanje de Abordaje Rápido',
        type: 'Corte Ágil de Tempestad',
        desc: 'Cuchilladas acrobáticas que cortan el aire con ráfagas salinas y 20% crítico.',
      },
      {
        name: 'Arpones de Abordaje',
        type: 'A Distancia',
        desc: 'Arpones con punta de arpón que impactan con rapidez.',
      },
      {
        name: 'Pies Marineros',
        type: 'Pasiva de Movilidad',
        desc: 'Mayor agilidad en balanceos y balance perfecto en plataformas móviles.',
      },
      {
        name: 'Maremoto del Kraken Ancestral',
        type: 'Superpoder de Marea',
        desc: 'Ola gigante de agua marina y tentáculos de energía que arrasan la pantalla.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 11: JURASSIC DRAFT — ZION JINETE REX
  // -------------------------------------------------------------
  jurassic: {
    id: 'jurassic',
    name: 'Zion Jinete Rex',
    subtitle: 'Coraza Primitiva de Hueso y Colmillo',
    title: 'Zion con Armadura de Furia Primitiva • Zona 11: Jurassic Draft',
    originZone: 'jurasicdraft',
    element: 'Furia de los Titanes Prehistóricos',
    rarity: 'MÍTICO',
    rarityColor: 'text-lime-400',
    rarityBorder: 'border-lime-400',
    rarityGlow: 'rgba(132, 204, 22, 0.4)',
    rarityBg: 'bg-lime-500/15',
    description:
      'Zion se viste con coraza forjada de huesos de depredadores alfa y garras de raptor. Blande un colmillo gigante prehistórico que desgarra con fuerza salvaje.',
    quote: '«Antes del tiempo y la civilización, solo reinaba la fuerza pura.»',

    splashImage: '/src/assets/images/zion_jurassic_pixel_1790960530257.jpg',
    pixelArtImage: '/src/assets/images/zion_jurassic_pixel_1790960530257.jpg',

    unlockPieceId: undefined,
    unlockRequirement: 'Derrota al T-Rex Titán en Jurassic Draft (Acto 3)',
    unlockZoneName: 'Zona 11 · Jurassic Draft',

    speedMultiplier: 1.04,
    defenseMultiplier: 0.90,
    meleeDamage: 3,
    meleeDuration: 10,
    meleeReach: 27,
    meleeColor: '#84cc16',
    critChance: 0.18,
    critMultiplier: 1.75,

    daggerName: 'Garras Dentadas Arrojadizas',
    daggerKind: 'primalClaw',
    daggerSpeed: 5.3,
    daggerDamage: 2,
    daggerColor: '#a3e635',

    specialName: 'Rugido Sísmico de los Titanes',
    specialCost: 72,
    specialRadius: 76,
    specialColor: '#84cc16',
    specialStyle: 'dinoRoar',

    abilities: [
      {
        name: 'Gran Colmillo del Apex Predator',
        type: 'Corte Salvaje Desgarrador',
        desc: 'Hojas dentadas de hueso fósil que infligen alto daño con sangrado temporal.',
      },
      {
        name: 'Garras Dentadas',
        type: 'A Distancia',
        desc: 'Proyectiles de fósil afilado arrojados a gran velocidad.',
      },
      {
        name: 'Instinto del Cazador',
        type: 'Pasiva Primitiva',
        desc: 'Resistencia a caídas altas y un 10% más de empuje en saltos.',
      },
      {
        name: 'Rugido Sísmico de los Titanes',
        type: 'Superpoder Prehistórico',
        desc: 'Onda de choque titánica que aturde a los enemigos y desintegra proyectiles.',
      },
    ],
  },

  // -------------------------------------------------------------
  // ZONA 12: LA LUNA — ZION COSMONAUTA LUNAR
  // -------------------------------------------------------------
  moon: {
    id: 'moon',
    name: 'Zion Cosmonauta Lunar',
    subtitle: 'Traje Espacial Cuántico Estelar',
    title: 'Zion con Traje de Gravedad Cero • Zona 12: La Luna',
    originZone: 'themoon',
    element: 'Gravedad Cero & Polvo Cósmico',
    rarity: 'MÍTICO',
    rarityColor: 'text-violet-300',
    rarityBorder: 'border-violet-400',
    rarityGlow: 'rgba(168, 85, 247, 0.5)',
    rarityBg: 'bg-violet-500/15',
    description:
      'Zion porta el traje espacial de exploración lunar con casco de oro reflectante y manto de nebulosa interestelar. Salta con ingravidez cósmica y corta con haz de luz estelar.',
    quote: '«Desde el mar de la tranquilidad, contemplamos el infinito.»',

    splashImage: '/src/assets/images/zion_moon_pixel_1790960540581.jpg',
    pixelArtImage: '/src/assets/images/zion_moon_pixel_1790960540581.jpg',

    unlockPieceId: undefined,
    unlockRequirement: 'Derrota al Señor del Eclipse en La Luna (Acto 3)',
    unlockZoneName: 'Zona 12 · La Luna',

    speedMultiplier: 1.05,
    defenseMultiplier: 0.94,
    meleeDamage: 3,
    meleeDuration: 9,
    meleeReach: 26,
    meleeColor: '#c084fc',
    critChance: 0.22,
    critMultiplier: 1.8,

    daggerName: 'Meteoritos de Polvo Estelar',
    daggerKind: 'starPebble',
    daggerSpeed: 6.0,
    daggerDamage: 2,
    daggerColor: '#e879f9',

    specialName: 'Colapso de Supernova Lunar',
    specialCost: 75,
    specialRadius: 80,
    specialColor: '#a855f7',
    specialStyle: 'supernova',

    abilities: [
      {
        name: 'Espada de Haz Fotónico Estelar',
        type: 'Filo Láser Interestelar',
        desc: 'Cuchilla de plasma cósmico con estela de nebulosa y alto porcentaje de crítico.',
      },
      {
        name: 'Meteoritos de Polvo Estelar',
        type: 'A Distancia Veloz',
        desc: 'Fragmentos estelares que vuelan a velocidad cósmica.',
      },
      {
        name: 'Micro-Gravedad Lunar',
        type: 'Pasiva de Salto',
        desc: 'Mayor tiempo de suspensión en el aire y caída suave controlada.',
      },
      {
        name: 'Colapso de Supernova Lunar',
        type: 'Superpoder Galáctico',
        desc: 'Implosión gravitatoria estelar que atrae y desintegra todo a su alrededor.',
      },
    ],
  },
};

export function getCharacterConfig(skin?: string | CharacterSkin): CharacterConfig {
  if (skin === 'zizz' || skin === 'zyssa') return CHARACTERS_CONFIG.zizz;
  if (skin === 'kael') return CHARACTERS_CONFIG.kael;
  if (skin === 'anuk') return CHARACTERS_CONFIG.anuk;
  if (skin === 'vector') return CHARACTERS_CONFIG.vector;
  if (skin === 'balam') return CHARACTERS_CONFIG.balam;
  if (skin === 'blizzard') return CHARACTERS_CONFIG.blizzard;
  if (skin === 'steampunk') return CHARACTERS_CONFIG.steampunk;
  if (skin === 'castlesmash') return CHARACTERS_CONFIG.castlesmash;
  if (skin === 'pirate') return CHARACTERS_CONFIG.pirate;
  if (skin === 'jurassic') return CHARACTERS_CONFIG.jurassic;
  if (skin === 'moon') return CHARACTERS_CONFIG.moon;
  return CHARACTERS_CONFIG.zion;
}
