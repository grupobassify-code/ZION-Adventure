// 32-Bit Studio Master Arcade Soundtrack - Zion: Kronos Fractured
// Each track features a totally unique musical identity: distinct scales, rhythmic meters, genres, and iconic melodic hooks.

export const N = {
  REST: 0,
  C0: 16.35, Cs0: 17.32, D0: 18.35, Ds0: 19.45, Eb0: 19.45, E0: 20.6, F0: 21.83, Fs0: 23.12, G0: 24.5, Gs0: 25.96, Ab0: 25.96, A0: 27.5, As0: 29.14, Bb0: 29.14, B0: 30.87,
  C1: 32.7, Cs1: 34.65, D1: 36.71, Ds1: 38.89, Eb1: 38.89, E1: 41.2, F1: 43.65, Fs1: 46.25, G1: 49.0, Gs1: 51.91, Ab1: 51.91, A1: 55.0, As1: 58.27, Bb1: 58.27, B1: 61.74,
  C2: 65.41, Cs2: 69.3, D2: 73.42, Ds2: 77.78, Eb2: 77.78, E2: 82.41, F2: 87.31, Fs2: 92.5, G2: 98.0, Gs2: 103.83, Ab2: 103.83, A2: 110.0, As2: 116.54, Bb2: 116.54, B2: 123.47,
  C3: 130.81, Cs3: 138.59, D3: 146.83, Ds3: 155.56, Eb3: 155.56, E3: 164.81, F3: 174.61, Fs3: 185.0, G3: 196.0, Gs3: 207.65, Ab3: 207.65, A3: 220.0, As3: 233.08, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.0, Gs4: 415.3, Ab4: 415.3, A4: 440.0, As4: 466.16, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Ds5: 622.25, Eb5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, Ab5: 830.61, A5: 880.0, As5: 932.33, Bb5: 932.33, B5: 987.77,
  C6: 1046.5, Cs6: 1108.73, D6: 1174.66, Ds6: 1244.51, Eb6: 1244.51, E6: 1318.51, F6: 1396.91, Fs6: 1479.98, G6: 1567.98, Gs6: 1661.22, Ab6: 1661.22, A6: 1760.0, As6: 1864.66, Bb6: 1864.66, B6: 1975.53,
  C7: 2093.0,
};

export interface TrackPattern32 {
  tempo: number;
  leadWave: OscillatorType;
  harmonyWave: OscillatorType;
  bassWave: OscillatorType;
  arpWave?: OscillatorType;
  filterCutoff?: number;
  leadNotes: number[];
  harmonyNotes: number[];
  bassNotes: number[];
  arpNotes?: number[];
  drumPattern: number[];
}

export const TRACKS_32BIT: Record<string, TrackPattern32> = {
  // =========================================================================
  // 1. MENÚ PRINCIPAL: «CHRONOS 32-BIT REBIRTH»
  // Género: Nostalgic Dream Synthwave (108 BPM)
  // Identidad: Melodía melancólica y lírica, notas largas sostenidas con pausas emotivas.
  // =========================================================================
  menuTheme: {
    tempo: 108,
    leadWave: 'triangle',
    harmonyWave: 'sine',
    bassWave: 'triangle',
    arpWave: 'sine',
    filterCutoff: 2100,
    leadNotes: [
      // Frase 1: Suspiro melancólico (F - E - D - C - A) con notas largas y aire
      N.F5, N.REST, N.E5, N.REST, N.D5, N.REST, N.C5, N.REST, N.A4, N.REST, N.REST, N.REST, N.C5, N.D5, N.E5, N.REST,
      // Frase 2: Respuesta suave ascendente hacia el noveno intervalo
      N.G5, N.REST, N.F5, N.REST, N.E5, N.D5, N.C5, N.REST, N.D5, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST,
      // Frase 3: Clímax dulce en La mayor séptima
      N.A5, N.REST, N.G5, N.REST, N.F5, N.E5, N.D5, N.REST, N.Bb4, N.REST, N.D5, N.F5, N.A5, N.G5, N.F5, N.E5,
      // Frase 4: Resolución tranquila de regreso al hogar
      N.F5, N.REST, N.E5, N.D5, N.C5, N.REST, N.A4, N.REST, N.F4, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST
    ],
    harmonyNotes: [
      N.F3, N.A3, N.C4, N.E4, N.F3, N.A3, N.C4, N.E4, N.D3, N.F3, N.A3, N.C4, N.D3, N.F3, N.A3, N.C4,
      N.Bb2, N.D3, N.F3, N.A3, N.Bb2, N.D3, N.F3, N.A3, N.C3, N.E3, N.G3, N.B3, N.C3, N.E3, N.G3, N.B3,
      N.D3, N.F3, N.A3, N.C4, N.D3, N.F3, N.A3, N.C4, N.Bb2, N.D3, N.F3, N.A3, N.Bb2, N.D3, N.F3, N.A3,
      N.G2, N.Bb2, N.D3, N.F3, N.G2, N.Bb2, N.D3, N.F3, N.F2, N.A2, N.C3, N.E3, N.F2, N.A2, N.C3, N.REST
    ],
    bassNotes: [
      N.F1, N.REST, N.F1, N.REST, N.D1, N.REST, N.D1, N.REST, N.Bb0, N.REST, N.Bb0, N.REST, N.C1, N.REST, N.C1, N.REST,
      N.D1, N.REST, N.D1, N.REST, N.Bb0, N.REST, N.Bb0, N.REST, N.G0, N.REST, N.G0, N.REST, N.F0, N.REST, N.F0, N.REST
    ],
    arpNotes: [
      N.A4, N.C5, N.E5, N.G5, N.F4, N.A4, N.C5, N.E5, N.D4, N.F4, N.A4, N.C5, N.E4, N.G4, N.B4, N.D5
    ],
    drumPattern: [
      2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0,
      2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0
    ]
  },

  // =========================================================================
  // 2. ZONA 1 (BOSQUE NEÓN · ACTO 1): «NEO-GENESIS OVERDRIVE»
  // Género: Arcade Funk Pop & Slap Bass (136 BPM)
  // Identidad: Síncopa bailable, ritmo saltarín con contratiempos tipo Sonic / OutRun.
  // =========================================================================
  neonAct1: {
    tempo: 136,
    leadWave: 'square',
    harmonyWave: 'triangle',
    bassWave: 'sawtooth',
    arpWave: 'square',
    filterCutoff: 3400,
    leadNotes: [
      // Compás sincopado con ataques al contratiempo
      N.REST, N.C5, N.E5, N.REST, N.G5, N.REST, N.A5, N.G5, N.REST, N.F5, N.D5, N.REST, N.C5, N.C5, N.E5, N.G5,
      N.A5, N.REST, N.C6, N.REST, N.B5, N.G5, N.E5, N.REST, N.D5, N.REST, N.E5, N.D5, N.C5, N.REST, N.REST, N.REST,
      N.REST, N.E5, N.G5, N.A5, N.C6, N.D6, N.C6, N.A5, N.REST, N.F5, N.A5, N.C6, N.B5, N.G5, N.E5, N.D5,
      N.C5, N.E5, N.G5, N.A5, N.C6, N.B5, N.A5, N.G5, N.A5, N.REST, N.C6, N.REST, N.C5, N.REST, N.C5, N.REST
    ],
    harmonyNotes: [
      N.C4, N.E4, N.G4, N.C5, N.C4, N.E4, N.G4, N.C5, N.F3, N.A3, N.C4, N.F4, N.F3, N.A3, N.C4, N.F4,
      N.A3, N.C4, N.E4, N.A4, N.A3, N.C4, N.E4, N.A4, N.G3, N.B3, N.D4, N.G4, N.G3, N.B3, N.D4, N.G4
    ],
    bassNotes: [
      // Slap Bass contagioso: Octavas y síncopas vivas
      N.C2, N.C3, N.REST, N.C2, N.E2, N.G2, N.REST, N.C2, N.F1, N.F2, N.REST, N.F1, N.A1, N.C2, N.REST, N.F1,
      N.A1, N.A2, N.REST, N.A1, N.C2, N.E2, N.REST, N.A1, N.G1, N.G2, N.REST, N.G1, N.B1, N.D2, N.G1, N.REST
    ],
    arpNotes: [
      N.C5, N.E5, N.G5, N.C6, N.E5, N.G5, N.C6, N.E6, N.F4, N.A4, N.C5, N.F5, N.A4, N.C5, N.F5, N.A5
    ],
    drumPattern: [
      4, 1, 5, 1, 4, 4, 5, 1, 4, 1, 5, 1, 4, 1, 5, 6,
      4, 1, 5, 1, 4, 4, 5, 1, 4, 1, 5, 4, 4, 6, 5, 5
    ]
  },

  // =========================================================================
  // 3. ZONA 1 JEFE: «HYPER-CORE CONFRONTATION»
  // Género: Cyberpunk Industrial Breakbeat (150 BPM)
  // Identidad: Tensión cromática, tritono (F#), golpes de alarma y bajo atronador.
  // =========================================================================
  neonBoss: {
    tempo: 150,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3900,
    leadNotes: [
      // Motivo de alarma con tritono y saltos punzantes
      N.C5, N.C5, N.Fs5, N.C5, N.C5, N.Fs5, N.C5, N.G5, N.F5, N.Eb5, N.D5, N.C5, N.Fs4, N.G4, N.C5, N.REST,
      N.Eb5, N.Eb5, N.A5, N.Eb5, N.Eb5, N.A5, N.Eb5, N.Bb5, N.Ab5, N.G5, N.F5, N.Eb5, N.G4, N.Ab4, N.Eb5, N.REST,
      N.C6, N.B5, N.Bb5, N.A5, N.Ab5, N.G5, N.Fs5, N.F5, N.Eb5, N.D5, N.C5, N.Fs5, N.G5, N.Eb5, N.C5, N.REST,
      N.C5, N.Fs5, N.G5, N.C6, N.Fs5, N.G5, N.C6, N.Eb6, N.D6, N.C6, N.Fs5, N.G5, N.C5, N.REST, N.C5, N.REST
    ],
    harmonyNotes: [
      N.C4, N.Eb4, N.Fs4, N.G4, N.C4, N.Eb4, N.Fs4, N.G4, N.Ab3, N.C4, N.Eb4, N.Ab4, N.Ab3, N.C4, N.Eb4, N.Ab4
    ],
    bassNotes: [
      N.C1, N.C1, N.C2, N.C1, N.Fs1, N.C1, N.G1, N.C1, N.Ab0, N.Ab0, N.Eb1, N.Ab0, N.F0, N.G0, N.Ab0, N.Bb0
    ],
    drumPattern: [
      6, 1, 5, 6, 6, 2, 5, 1, 6, 1, 5, 6, 6, 6, 5, 1,
      6, 1, 5, 6, 6, 2, 5, 4, 6, 6, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 4. ZONA 2 (SAKURA · ACTO 1): «PETALS OF ETERNITY»
  // Género: Neo-Oriental Tradicional Folk (116 BPM)
  // Identidad: Escala pentatónica Insen japonesa (D, Eb, G, A, C), ornamentos koto, aire zen.
  // =========================================================================
  sakuraAct1: {
    tempo: 116,
    leadWave: 'triangle',
    harmonyWave: 'sine',
    bassWave: 'triangle',
    arpWave: 'sine',
    filterCutoff: 2400,
    leadNotes: [
      // Melodía pura tradicional japonesa, intervalos amplios y pausas reflexivas
      N.D5, N.REST, N.D5, N.Eb5, N.D5, N.REST, N.A4, N.REST, N.C5, N.D5, N.G5, N.REST, N.Eb5, N.D5, N.C5, N.A4,
      N.D5, N.REST, N.G5, N.A5, N.C6, N.REST, N.D6, N.REST, N.C6, N.A5, N.G5, N.Eb5, N.D5, N.REST, N.REST, N.REST,
      N.A5, N.REST, N.C6, N.D6, N.Eb6, N.D6, N.C6, N.A5, N.G5, N.A5, N.C6, N.A5, N.G5, N.Eb5, N.D5, N.C5,
      N.D5, N.Eb5, N.D5, N.A4, N.C5, N.D5, N.G5, N.A5, N.D5, N.REST, N.A4, N.REST, N.D4, N.REST, N.D4, N.REST
    ],
    harmonyNotes: [
      N.D3, N.A3, N.D4, N.G4, N.D3, N.A3, N.D4, N.G4, N.C3, N.G3, N.C4, N.E4, N.C3, N.G3, N.C4, N.E4,
      N.Bb2, N.F3, N.Bb3, N.D4, N.Bb2, N.F3, N.Bb3, N.D4, N.A2, N.E3, N.A3, N.Cs4, N.A2, N.E3, N.A3, N.Cs4
    ],
    bassNotes: [
      N.D1, N.REST, N.A0, N.REST, N.D1, N.REST, N.G1, N.REST, N.C1, N.REST, N.G0, N.REST, N.C1, N.REST, N.E1, N.REST,
      N.Bb0, N.REST, N.F0, N.REST, N.Bb0, N.REST, N.D1, N.REST, N.A0, N.REST, N.E0, N.REST, N.A0, N.REST, N.D1, N.REST
    ],
    arpNotes: [
      N.D4, N.Eb4, N.G4, N.A4, N.C5, N.D5, N.G5, N.A5, N.C5, N.A4, N.G4, N.Eb4, N.D4, N.A3, N.D4, N.Eb4
    ],
    drumPattern: [
      2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0,
      2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0
    ]
  },

  // =========================================================================
  // 5. ZONA 2 JEFE: «CRIMSON MOON SHINDIG»
  // Género: Kabuki Taiko Battle Beat (152 BPM)
  // Identidad: Escala Kumoi (E, F, A, B, C), silencios dramáticos (Ma) y cortes marciales.
  // =========================================================================
  sakuraBoss: {
    tempo: 152,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3800,
    leadNotes: [
      // Golpe súbito y silencio teatral
      N.E5, N.F5, N.E5, N.B4, N.C5, N.E5, N.F5, N.REST, N.REST, N.B5, N.A5, N.F5, N.E5, N.REST, N.REST, N.REST,
      N.F5, N.E5, N.F5, N.A5, N.B5, N.C6, N.B5, N.REST, N.REST, N.C6, N.B5, N.A5, N.F5, N.E5, N.F5, N.REST,
      N.E6, N.REST, N.C6, N.B5, N.A5, N.F5, N.E5, N.REST, N.B5, N.REST, N.A5, N.F5, N.E5, N.C5, N.B4, N.REST,
      N.E5, N.F5, N.A5, N.B5, N.C6, N.B5, N.C6, N.E6, N.F6, N.E6, N.B5, N.F5, N.E5, N.REST, N.E5, N.REST
    ],
    harmonyNotes: [
      N.E3, N.B3, N.E4, N.F4, N.E3, N.B3, N.E4, N.F4, N.C3, N.G3, N.C4, N.E4, N.C3, N.G3, N.C4, N.E4
    ],
    bassNotes: [
      N.E1, N.REST, N.E1, N.B0, N.E1, N.REST, N.F1, N.REST, N.C1, N.REST, N.G0, N.REST, N.C1, N.REST, N.E1, N.REST
    ],
    drumPattern: [
      6, 0, 5, 0, 6, 6, 5, 0, 0, 1, 5, 6, 6, 0, 5, 5,
      6, 0, 5, 0, 6, 6, 5, 0, 6, 6, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 6. ZONA 3 (ACANTILADOS DE LAVA · ACTO 1): «MAGMA FORGE OVERDRIVE»
  // Género: Neoclassical Gothic Metal / Castlevania style (142 BPM)
  // Identidad: Escala menor armónica, arpegios barrocos rápidos y palm-mute pesado.
  // =========================================================================
  lavacliffAct1: {
    tempo: 142,
    leadWave: 'sawtooth',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    filterCutoff: 3700,
    leadNotes: [
      // Riff barroco de guitarra distorsionada estilo Yngwie / Castlevania
      N.E4, N.G4, N.B4, N.Ds5, N.E5, N.B4, N.G4, N.E4, N.Fs4, N.A4, N.C5, N.Ds5, N.B4, N.G4, N.Fs4, N.E4,
      N.G4, N.B4, N.E5, N.G5, N.Fs5, N.Ds5, N.B4, N.A4, N.G4, N.B4, N.Ds5, N.Fs5, N.E5, N.REST, N.E4, N.REST,
      N.E5, N.Ds5, N.E5, N.Fs5, N.G5, N.Fs5, N.G5, N.A5, N.B5, N.A5, N.G5, N.Fs5, N.E5, N.Ds5, N.C5, N.B4,
      N.C5, N.E5, N.G5, N.C6, N.B5, N.G5, N.Ds5, N.B4, N.E5, N.B4, N.G4, N.Ds4, N.E4, N.REST, N.E4, N.REST
    ],
    harmonyNotes: [
      N.E3, N.G3, N.B3, N.E4, N.E3, N.G3, N.B3, N.E4, N.B2, N.Ds3, N.Fs3, N.B3, N.B2, N.Ds3, N.Fs3, N.B3,
      N.C3, N.E3, N.G3, N.C4, N.C3, N.E3, N.G3, N.C4, N.B2, N.Ds3, N.Fs3, N.B3, N.E3, N.G3, N.B3, N.REST
    ],
    bassNotes: [
      N.E1, N.E1, N.E1, N.B0, N.E1, N.E1, N.G1, N.E1, N.B0, N.B0, N.B0, N.Fs0, N.B0, N.B0, N.A0, N.B0,
      N.C1, N.C1, N.C1, N.G0, N.C1, N.C1, N.E1, N.C1, N.B0, N.B0, N.Ds1, N.Fs1, N.E1, N.REST, N.E0, N.REST
    ],
    drumPattern: [
      6, 1, 5, 1, 6, 2, 5, 1, 6, 1, 5, 1, 6, 6, 5, 1,
      6, 1, 5, 1, 6, 2, 5, 4, 6, 1, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 7. ZONA 3 JEFE: «IGNIS COLOSSUS UNLEASHED»
  // Género: Doom Metal Stomp (148 BPM)
  // Identidad: Pesadez volcánica, tritono triturador, ritmo implacable de titán.
  // =========================================================================
  lavacliffBoss: {
    tempo: 148,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3900,
    leadNotes: [
      // Riff titánico pesado de lava con tritono Bb y pausas machacantes
      N.E4, N.E4, N.Bb4, N.E4, N.G4, N.F4, N.E4, N.REST, N.E4, N.E4, N.Bb4, N.B4, N.D5, N.Bb4, N.G4, N.E4,
      N.E5, N.Bb4, N.G4, N.E4, N.F4, N.G4, N.Bb4, N.B4, N.C5, N.B4, N.Bb4, N.G4, N.E4, N.REST, N.E4, N.REST,
      N.E4, N.G4, N.Bb4, N.E5, N.F5, N.E5, N.Bb4, N.G4, N.E4, N.G4, N.Bb4, N.D5, N.Cs5, N.Bb4, N.G4, N.E4,
      N.Bb4, N.A4, N.G4, N.F4, N.E4, N.G4, N.Bb4, N.E5, N.E4, N.REST, N.Bb4, N.REST, N.E4, N.REST, N.E4, N.REST
    ],
    harmonyNotes: [
      N.E3, N.Bb3, N.E4, N.G4, N.E3, N.Bb3, N.E4, N.G4, N.C3, N.G3, N.Bb3, N.E4, N.C3, N.G3, N.Bb3, N.E4
    ],
    bassNotes: [
      N.E1, N.E1, N.E0, N.E1, N.Bb0, N.E1, N.G0, N.E1, N.C1, N.C1, N.G0, N.C1, N.Bb0, N.C1, N.E1, N.C1
    ],
    drumPattern: [
      6, 6, 5, 6, 6, 6, 5, 1, 6, 6, 5, 6, 6, 6, 5, 5,
      6, 6, 5, 6, 6, 6, 5, 4, 6, 6, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 8. ZONA 4 (DESIERTO EGIPCIO · ACTO 1): «MIRAGE OF RA»
  // Género: Maqam Hijaz Árabe Auténtico (126 BPM)
  // Identidad: Escala con intervalo característico de 1.5 tonos (D, Eb, F#, G, A, Bb, C#), danza de la serpiente.
  // =========================================================================
  desertAct1: {
    tempo: 126,
    leadWave: 'sawtooth',
    harmonyWave: 'triangle',
    bassWave: 'triangle',
    filterCutoff: 2700,
    leadNotes: [
      // Melodía sinuosa de serpiente con el intervalo Eb -> F#
      N.D5, N.Eb5, N.Fs5, N.G5, N.Fs5, N.Eb5, N.D5, N.REST, N.Cs5, N.D5, N.Eb5, N.Fs5, N.Eb5, N.D5, N.Cs5, N.D5,
      N.G5, N.A5, N.Bb5, N.Cs6, N.Bb5, N.A5, N.G5, N.Fs5, N.G5, N.Fs5, N.Eb5, N.D5, N.D5, N.REST, N.REST, N.REST,
      N.D6, N.Cs6, N.Bb5, N.A5, N.G5, N.Fs5, N.Eb5, N.D5, N.Eb5, N.Fs5, N.G5, N.A5, N.Fs5, N.Eb5, N.D5, N.Cs5,
      N.D5, N.Eb5, N.Fs5, N.G5, N.A5, N.Bb5, N.Cs6, N.D6, N.D5, N.REST, N.A4, N.REST, N.D4, N.REST, N.D4, N.REST
    ],
    harmonyNotes: [
      N.D3, N.A3, N.D4, N.Fs4, N.D3, N.A3, N.D4, N.Fs4, N.Eb3, N.Bb3, N.Eb4, N.G4, N.Eb3, N.Bb3, N.Eb4, N.G4,
      N.G3, N.D4, N.G4, N.Bb4, N.G3, N.D4, N.G4, N.Bb4, N.A3, N.E4, N.A4, N.Cs5, N.A3, N.E4, N.A4, N.Cs5
    ],
    bassNotes: [
      N.D1, N.REST, N.D1, N.A0, N.D1, N.Fs1, N.D1, N.REST, N.Eb1, N.REST, N.Eb1, N.Bb0, N.Eb1, N.G1, N.Eb1, N.REST,
      N.G1, N.REST, N.G1, N.D1, N.G1, N.Bb1, N.G1, N.REST, N.A0, N.REST, N.A0, N.E0, N.A0, N.Cs1, N.D1, N.REST
    ],
    drumPattern: [
      4, 1, 5, 1, 4, 1, 5, 1, 4, 1, 5, 1, 4, 4, 5, 1,
      4, 1, 5, 1, 4, 1, 5, 4, 4, 1, 5, 1, 4, 4, 5, 5
    ]
  },

  // =========================================================================
  // 9. ZONA 4 (DESIERTO · ACTO 2): «TOMB OF THE SUN GOD»
  // Género: Deep Ambient Cavern & Mystic Flute (104 BPM)
  // Identidad: Silencios profundos, ecos resonantes, misterio de tumbas antiguas.
  // =========================================================================
  desertAct2: {
    tempo: 104,
    leadWave: 'triangle',
    harmonyWave: 'sine',
    bassWave: 'sine',
    filterCutoff: 1900,
    leadNotes: [
      // Notas espaciadas como flauta resonando en una cámara funeraria
      N.D4, N.REST, N.REST, N.Fs4, N.A4, N.REST, N.Cs5, N.D5, N.REST, N.REST, N.Bb4, N.A4, N.G4, N.Fs4, N.Eb4, N.D4,
      N.G4, N.REST, N.REST, N.Bb4, N.D5, N.REST, N.Eb5, N.D5, N.REST, N.REST, N.Cs5, N.Bb4, N.A4, N.G4, N.Fs4, N.REST,
      N.D5, N.REST, N.Cs5, N.Bb4, N.A4, N.REST, N.G4, N.Fs4, N.Eb4, N.REST, N.D4, N.Cs4, N.D4, N.REST, N.REST, N.REST
    ],
    harmonyNotes: [
      N.D3, N.A3, N.D4, N.Fs4, N.D3, N.A3, N.D4, N.Fs4, N.G3, N.D4, N.G4, N.Bb4, N.G3, N.D4, N.G4, N.Bb4
    ],
    bassNotes: [
      N.D1, N.REST, N.A0, N.REST, N.D1, N.REST, N.Fs1, N.REST, N.G1, N.REST, N.D1, N.REST, N.G1, N.REST, N.Bb1, N.REST
    ],
    drumPattern: [
      2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0
    ]
  },

  // =========================================================================
  // 10. ZONA 4 JEFE: «AKHEN'RA AWAKENING»
  // Género: Fast Egyptian War Drive (152 BPM)
  // Identidad: Trinos veloces a 152 BPM, torbellino de arena y furia ancestral.
  // =========================================================================
  desertBoss: {
    tempo: 152,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3800,
    leadNotes: [
      N.D5, N.Eb5, N.D5, N.Cs5, N.D5, N.Eb5, N.Fs5, N.G5, N.Fs5, N.Eb5, N.D5, N.Cs5, N.D5, N.Fs5, N.A5, N.REST,
      N.Cs6, N.D6, N.Cs6, N.Bb5, N.A5, N.G5, N.Fs5, N.Eb5, N.D5, N.Eb5, N.Fs5, N.G5, N.D5, N.REST, N.D5, N.REST,
      N.D6, N.REST, N.Cs6, N.Bb5, N.A5, N.REST, N.G5, N.Fs5, N.Eb5, N.REST, N.D5, N.Cs5, N.D5, N.Eb5, N.Fs5, N.REST,
      N.G5, N.Fs5, N.Eb5, N.D5, N.Cs5, N.D5, N.Eb5, N.Fs5, N.D6, N.REST, N.A5, N.REST, N.D5, N.REST, N.D5, N.REST
    ],
    harmonyNotes: [
      N.D3, N.A3, N.D4, N.Fs4, N.D3, N.A3, N.D4, N.Fs4, N.Eb3, N.Bb3, N.Eb4, N.G4, N.Eb3, N.Bb3, N.Eb4, N.G4
    ],
    bassNotes: [
      N.D1, N.D1, N.A0, N.D1, N.D1, N.Fs1, N.D1, N.D0, N.Eb1, N.Eb1, N.Bb0, N.Eb1, N.Eb1, N.G1, N.Eb1, N.Eb0
    ],
    drumPattern: [
      6, 1, 5, 1, 6, 2, 5, 1, 6, 1, 5, 1, 6, 6, 5, 1,
      6, 1, 5, 1, 6, 2, 5, 4, 6, 1, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 11. ZONA 5 (KRONO CITY · ACTO 1): «CYBER METROPOLIS 2099»
  // Género: 80s Darksynth Outrun (132 BPM)
  // Identidad: Bajo rodante de sintetizador analógico continuo, melodía cinematográfica épica.
  // =========================================================================
  kronoAct1: {
    tempo: 132,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    arpWave: 'square',
    filterCutoff: 3300,
    leadNotes: [
      // Melodía épica de carretera nocturna con notas ligadas
      N.A4, N.REST, N.C5, N.REST, N.E5, N.REST, N.A5, N.REST, N.G5, N.E5, N.D5, N.E5, N.G5, N.REST, N.REST, N.REST,
      N.F5, N.REST, N.A5, N.REST, N.C6, N.REST, N.E6, N.REST, N.D6, N.C6, N.A5, N.F5, N.G5, N.REST, N.REST, N.REST,
      N.A5, N.REST, N.C6, N.D6, N.E6, N.REST, N.D6, N.C6, N.D6, N.REST, N.C6, N.A5, N.G5, N.REST, N.E5, N.REST,
      N.F5, N.G5, N.A5, N.C6, N.D6, N.E6, N.G6, N.E6, N.A5, N.REST, N.E5, N.REST, N.A4, N.REST, N.A4, N.REST
    ],
    harmonyNotes: [
      N.A3, N.C4, N.E4, N.A4, N.A3, N.C4, N.E4, N.A4, N.F3, N.A3, N.C4, N.F4, N.F3, N.A3, N.C4, N.F4,
      N.D3, N.F3, N.A3, N.D4, N.D3, N.F3, N.A3, N.D4, N.G3, N.B3, N.D4, N.G4, N.G3, N.B3, N.D4, N.G4
    ],
    bassNotes: [
      // Darksynth rolling bass en semicorcheas continuas
      N.A1, N.A1, N.A1, N.A1, N.A1, N.A1, N.A1, N.A1, N.F1, N.F1, N.F1, N.F1, N.F1, N.F1, N.F1, N.F1,
      N.D1, N.D1, N.D1, N.D1, N.D1, N.D1, N.D1, N.D1, N.G1, N.G1, N.G1, N.G1, N.G1, N.G1, N.G1, N.G1
    ],
    arpNotes: [
      N.A4, N.C5, N.E5, N.A5, N.C5, N.E5, N.A5, N.C6, N.F4, N.A4, N.C5, N.F5, N.A4, N.C5, N.F5, N.A5
    ],
    drumPattern: [
      4, 1, 5, 1, 4, 1, 5, 1, 4, 1, 5, 1, 4, 4, 5, 1,
      4, 1, 5, 1, 4, 1, 5, 4, 4, 1, 5, 1, 4, 4, 5, 5
    ]
  },

  // =========================================================================
  // 12. ZONA 5 (KRONO CITY · ACTO 2): «FUSION REACTOR»
  // Género: Industrial Acid Cyberpunk (144 BPM)
  // Identidad: Bajo ácido 303 punzante con cortes metálicos secos.
  // =========================================================================
  kronoAct2: {
    tempo: 144,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3600,
    leadNotes: [
      N.D4, N.REST, N.F4, N.G4, N.Gs4, N.A4, N.C5, N.D5, N.REST, N.C5, N.A4, N.Gs4, N.G4, N.F4, N.D4, N.REST,
      N.F5, N.D5, N.C5, N.D5, N.F5, N.G5, N.Gs5, N.A5, N.REST, N.F5, N.D5, N.C5, N.D5, N.REST, N.REST, N.REST
    ],
    harmonyNotes: [
      N.D3, N.A3, N.D4, N.F4, N.D3, N.A3, N.D4, N.F4, N.Bb2, N.F3, N.Bb3, N.D4, N.Bb2, N.F3, N.Bb3, N.D4
    ],
    bassNotes: [
      N.D1, N.D2, N.D1, N.F1, N.D1, N.Gs1, N.D1, N.A1, N.Bb0, N.Bb1, N.Bb0, N.D1, N.Bb0, N.F1, N.Bb0, N.G1
    ],
    drumPattern: [
      6, 1, 5, 1, 6, 2, 5, 1, 6, 1, 5, 1, 6, 6, 5, 1,
      6, 1, 5, 1, 6, 2, 5, 4, 6, 1, 5, 1, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 13. ZONA 5 JEFE: «TITAN KRONOS-Ω CLIMAX»
  // Género: Gran Final Sinfónico (156 BPM)
  // Identidad: Clímax orquestal de campanas y cuerdas de sintetizador a toda potencia.
  // =========================================================================
  kronoBoss: {
    tempo: 156,
    leadWave: 'sawtooth',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    filterCutoff: 4100,
    leadNotes: [
      N.C5, N.Eb5, N.G5, N.C6, N.B5, N.G5, N.Eb5, N.G5, N.Ab5, N.C6, N.Eb6, N.D6, N.C6, N.B5, N.Ab5, N.G5,
      N.C6, N.Eb6, N.G6, N.C7, N.B6, N.G6, N.Eb6, N.C6, N.D6, N.Eb6, N.F6, N.G6, N.C6, N.REST, N.C5, N.REST
    ],
    harmonyNotes: [
      N.C4, N.Eb4, N.G4, N.C5, N.C4, N.Eb4, N.G4, N.C5, N.Ab3, N.C4, N.Eb4, N.Ab4, N.Ab3, N.C4, N.Eb4, N.Ab4
    ],
    bassNotes: [
      N.C2, N.C2, N.G1, N.C2, N.C2, N.Eb2, N.C2, N.C1, N.Ab1, N.Ab1, N.Eb1, N.Ab1, N.Ab1, N.C2, N.Ab1, N.Ab0
    ],
    drumPattern: [
      6, 6, 5, 6, 6, 6, 5, 1, 6, 6, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 14. ZONA EXTRA: «DIMENSIONAL ODYSSEY (KRONOS TRAVEL)»
  // Género: Multizone Speed Medley (146 BPM)
  // Identidad: Saltos dinámicos entre dimensiones a gran velocidad.
  // =========================================================================
  kronosTravel: {
    tempo: 146,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3500,
    leadNotes: [
      N.E5, N.G5, N.B5, N.E6, N.D6, N.B5, N.G5, N.A5, N.C6, N.A5, N.F5, N.G5, N.B5, N.G5, N.E5, N.REST,
      N.A5, N.C6, N.E6, N.A6, N.G6, N.E6, N.C6, N.D6, N.F6, N.D6, N.B5, N.G5, N.E6, N.REST, N.E5, N.REST
    ],
    harmonyNotes: [
      N.E3, N.B3, N.E4, N.G4, N.E3, N.B3, N.E4, N.G4, N.A3, N.E4, N.A4, N.C5, N.A3, N.E4, N.A4, N.C5
    ],
    bassNotes: [
      N.E1, N.E1, N.B0, N.E1, N.E1, N.G1, N.E1, N.E0, N.A1, N.A1, N.E1, N.A1, N.A1, N.C2, N.A1, N.A0
    ],
    drumPattern: [
      4, 1, 5, 1, 4, 1, 5, 1, 4, 1, 5, 1, 4, 4, 5, 1,
      4, 1, 5, 1, 4, 1, 5, 4, 4, 1, 5, 1, 4, 4, 5, 5
    ]
  },

  // =========================================================================
  // 15. ZONA 6 (SELVA MAYA · ACTO 1): «ANCIENT MAYA CANOPY»
  // Género: Polirritmia Tribal Africana/Maya 6/8 (128 BPM)
  // Identidad: Timbre de marimba de madera, acentos en tresillos y saltos selváticos.
  // =========================================================================
  jungleAct1: {
    tempo: 128,
    leadWave: 'triangle',
    harmonyWave: 'sine',
    bassWave: 'triangle',
    filterCutoff: 2500,
    leadNotes: [
      // Melodía sincopada de marimba de madera en la jungla
      N.E4, N.G4, N.A4, N.REST, N.B4, N.REST, N.D5, N.B4, N.A4, N.G4, N.E4, N.REST, N.G4, N.A4, N.B4, N.REST,
      N.D5, N.E5, N.G5, N.REST, N.E5, N.D5, N.B4, N.A4, N.B4, N.A4, N.G4, N.E4, N.D4, N.E4, N.REST, N.REST,
      N.G5, N.REST, N.E5, N.D5, N.B4, N.D5, N.E5, N.REST, N.A4, N.B4, N.D5, N.B4, N.A4, N.G4, N.E4, N.REST
    ],
    harmonyNotes: [
      N.E3, N.B3, N.E4, N.G4, N.E3, N.B3, N.E4, N.G4, N.A3, N.E4, N.A4, N.C5, N.A3, N.E4, N.A4, N.C5
    ],
    bassNotes: [
      N.E1, N.REST, N.B0, N.E1, N.REST, N.G1, N.E1, N.REST, N.A0, N.REST, N.E0, N.A0, N.REST, N.C1, N.A0, N.REST
    ],
    drumPattern: [
      2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 2, 1, 1
    ]
  },

  // =========================================================================
  // 16. ZONA 6 JEFE: «FANGS OF BALAM»
  // Género: Shamanic Predator Chase (152 BPM)
  // Identidad: Tambores chamánicos frenéticos, rugidos sintetizados y persecución.
  // =========================================================================
  jungleBoss: {
    tempo: 152,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3700,
    leadNotes: [
      N.E4, N.G4, N.A4, N.Bb4, N.B4, N.D5, N.E5, N.G5, N.F5, N.E5, N.D5, N.B4, N.Bb4, N.A4, N.G4, N.E4,
      N.E5, N.G5, N.A5, N.Bb5, N.B5, N.D6, N.E6, N.D6, N.B5, N.G5, N.E5, N.D5, N.E5, N.REST, N.E4, N.REST
    ],
    harmonyNotes: [
      N.E3, N.G3, N.B3, N.E4, N.E3, N.G3, N.B3, N.E4, N.C3, N.G3, N.C4, N.E4, N.C3, N.G3, N.C4, N.E4
    ],
    bassNotes: [
      N.E1, N.E1, N.B0, N.E1, N.E1, N.G1, N.E1, N.E0, N.C1, N.C1, N.G0, N.C1, N.C1, N.E1, N.C1, N.C0
    ],
    drumPattern: [
      6, 1, 5, 1, 6, 2, 5, 1, 6, 1, 5, 1, 6, 6, 5, 1,
      6, 1, 5, 1, 6, 2, 5, 4, 6, 1, 5, 1, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 17. ZONA 7 (BLIZZARD PEAK · ACTO 1): «SUB-ZERO ALPINE RUSH»
  // Género: 90s Sega Eurobeat / Ice Cap Ski Rush (146 BPM)
  // Identidad: Acordes brillantes de hielo, bajo bailable veloz y sensación de viento frío en la cara.
  // =========================================================================
  blizzardSki: {
    tempo: 146,
    leadWave: 'sawtooth',
    harmonyWave: 'triangle',
    bassWave: 'sawtooth',
    filterCutoff: 3600,
    leadNotes: [
      // Melodía súper alegre de esquí a alta velocidad tipo Ice Cap Zone
      N.C5, N.REST, N.D5, N.Eb5, N.G5, N.REST, N.F5, N.Eb5, N.D5, N.C5, N.D5, N.Eb5, N.F5, N.REST, N.Eb5, N.D5,
      N.Eb5, N.REST, N.F5, N.G5, N.Bb5, N.REST, N.Ab5, N.G5, N.F5, N.Eb5, N.F5, N.G5, N.C6, N.REST, N.REST, N.REST,
      N.C6, N.Bb5, N.Ab5, N.G5, N.Ab5, N.G5, N.F5, N.Eb5, N.F5, N.G5, N.Ab5, N.Bb5, N.G5, N.Eb5, N.D5, N.C5,
      N.Eb5, N.F5, N.G5, N.Bb5, N.C6, N.D6, N.Eb6, N.D6, N.C6, N.REST, N.G5, N.REST, N.C5, N.REST, N.C5, N.REST
    ],
    harmonyNotes: [
      N.C4, N.Eb4, N.G4, N.C5, N.C4, N.Eb4, N.G4, N.C5, N.Ab3, N.C4, N.Eb4, N.Ab4, N.Ab3, N.C4, N.Eb4, N.Ab4,
      N.Bb3, N.D4, N.F4, N.Bb4, N.Bb3, N.D4, N.F4, N.Bb4, N.G3, N.B3, N.D4, N.G4, N.G3, N.B3, N.D4, N.G4
    ],
    bassNotes: [
      N.C2, N.C2, N.G1, N.C2, N.C2, N.Eb2, N.C2, N.C1, N.Ab1, N.Ab1, N.Eb1, N.Ab1, N.Ab1, N.C2, N.Ab1, N.Ab0,
      N.Bb1, N.Bb1, N.F1, N.Bb1, N.Bb1, N.D2, N.Bb1, N.Bb0, N.G1, N.G1, N.D1, N.G1, N.G1, N.B1, N.G1, N.G0
    ],
    drumPattern: [
      4, 1, 5, 1, 4, 1, 5, 1, 4, 1, 5, 1, 4, 4, 5, 1,
      4, 1, 5, 1, 4, 1, 5, 4, 4, 1, 5, 1, 4, 4, 5, 5
    ]
  },

  // =========================================================================
  // 18. ZONA 7 (BLIZZARD PEAK · ACTO 2): «GLACIAL FROST & ICE PINES»
  // Género: Crystal Music Box & Snow Chill (100 BPM)
  // Identidad: Campanas de cristal lentas, nieve flotando suavemente en la montaña.
  // =========================================================================
  blizzardForest: {
    tempo: 100,
    leadWave: 'sine',
    harmonyWave: 'triangle',
    bassWave: 'sine',
    filterCutoff: 1800,
    leadNotes: [
      N.C5, N.Eb5, N.G5, N.C6, N.Bb5, N.G5, N.Eb5, N.G5, N.F5, N.Ab5, N.C6, N.Eb6, N.D6, N.Bb5, N.G5, N.F5,
      N.Eb5, N.G5, N.Bb5, N.Eb6, N.D6, N.C6, N.Bb5, N.C6, N.G5, N.Bb5, N.C6, N.D6, N.C6, N.REST, N.REST, N.REST
    ],
    harmonyNotes: [
      N.C4, N.Eb4, N.G4, N.C5, N.C4, N.Eb4, N.G4, N.C5, N.Ab3, N.C4, N.Eb4, N.Ab4, N.Ab3, N.C4, N.Eb4, N.Ab4
    ],
    bassNotes: [
      N.C2, N.REST, N.G1, N.REST, N.C2, N.REST, N.Eb2, N.REST, N.Ab1, N.REST, N.Eb1, N.REST, N.Ab1, N.REST, N.C2, N.REST
    ],
    drumPattern: [
      2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0
    ]
  },

  // =========================================================================
  // 19. ZONA 7 JEFE: «YETI MOUNTAIN STOMP»
  // Género: Heavy Frost Battle Stomp (150 BPM)
  // =========================================================================
  blizzardBoss: {
    tempo: 150,
    leadWave: 'sawtooth',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    filterCutoff: 3700,
    leadNotes: [
      N.C4, N.Eb4, N.F4, N.Fs4, N.G4, N.Bb4, N.C5, N.Eb5, N.D5, N.C5, N.Bb4, N.G4, N.Fs4, N.F4, N.Eb4, N.C4,
      N.C5, N.Eb5, N.G5, N.Bb5, N.C6, N.Bb5, N.G5, N.Eb5, N.F5, N.Fs5, N.G5, N.Bb5, N.C5, N.REST, N.C5, N.REST
    ],
    harmonyNotes: [
      N.C3, N.Eb3, N.G3, N.C4, N.C3, N.Eb3, N.G3, N.C4, N.Ab2, N.Eb3, N.Ab3, N.C4, N.Ab2, N.Eb3, N.Ab3, N.C4
    ],
    bassNotes: [
      N.C1, N.C1, N.G0, N.C1, N.C1, N.Eb1, N.C1, N.C0, N.Ab0, N.Ab0, N.Eb0, N.Ab0, N.Ab0, N.C1, N.Ab0, N.Ab0
    ],
    drumPattern: [
      6, 1, 5, 1, 6, 2, 5, 1, 6, 1, 5, 1, 6, 6, 5, 1,
      6, 1, 5, 1, 6, 2, 5, 4, 6, 1, 5, 1, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 20. ZONA 8 (STEAMPUNK FOUNDRY · ACTO 1): «CLOCKWORK STEAM FOUNDRY»
  // Género: Victorian Ragtime & Mechanical Brass Swing (128 BPM)
  // Identidad: Ritmo sincopado con saltillos de reloj mecánico, silbidos de vapor y gracia victoriana.
  // =========================================================================
  steampunkAct1: {
    tempo: 128,
    leadWave: 'square',
    harmonyWave: 'triangle',
    bassWave: 'sawtooth',
    filterCutoff: 3100,
    leadNotes: [
      // Melodía saltarina de reloj victoriano con síncopa ragtime
      N.G4, N.REST, N.Bb4, N.B4, N.D5, N.REST, N.G5, N.REST, N.F5, N.D5, N.B4, N.C5, N.D5, N.REST, N.REST, N.REST,
      N.Eb5, N.REST, N.D5, N.C5, N.B4, N.C5, N.D5, N.B4, N.G4, N.REST, N.Bb4, N.A4, N.G4, N.REST, N.REST, N.REST,
      N.D5, N.REST, N.F5, N.Fs5, N.G5, N.REST, N.B5, N.REST, N.A5, N.F5, N.D5, N.Eb5, N.F5, N.D5, N.B4, N.A4,
      N.G4, N.Bb4, N.D5, N.F5, N.G5, N.B5, N.D6, N.B5, N.G5, N.REST, N.D5, N.REST, N.G4, N.REST, N.G4, N.REST
    ],
    harmonyNotes: [
      N.G3, N.B3, N.D4, N.G4, N.G3, N.B3, N.D4, N.G4, N.C3, N.E3, N.G3, N.C4, N.C3, N.E3, N.G3, N.C4,
      N.Eb3, N.G3, N.Bb3, N.Eb4, N.Eb3, N.G3, N.Bb3, N.Eb4, N.D3, N.Fs3, N.A3, N.D4, N.D3, N.Fs3, N.A3, N.D4
    ],
    bassNotes: [
      // Oom-pah victoriano clásico: Bajo en 1 y 3, acordes en 2 y 4
      N.G1, N.REST, N.D2, N.REST, N.G1, N.REST, N.B1, N.REST, N.C1, N.REST, N.G1, N.REST, N.C1, N.REST, N.E1, N.REST,
      N.Eb1, N.REST, N.Bb1, N.REST, N.Eb1, N.REST, N.G1, N.REST, N.D1, N.REST, N.A1, N.REST, N.D1, N.REST, N.Fs1, N.REST
    ],
    drumPattern: [
      2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 4, 1, 5, 1
    ]
  },

  // =========================================================================
  // 21. ZONA 8 (FÁBRICA · ACTO 2): «RUST & MOLTEN GEARS»
  // Género: Industrial Machinery Heavy Stride (138 BPM)
  // =========================================================================
  steampunkAct2: {
    tempo: 138,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3300,
    leadNotes: [
      N.C4, N.Eb4, N.G4, N.C5, N.Bb4, N.G4, N.Eb4, N.F4, N.G4, N.Bb4, N.G4, N.Eb4, N.F4, N.G4, N.F4, N.Eb4,
      N.C4, N.Eb4, N.F4, N.G4, N.Bb4, N.C5, N.Eb5, N.C5, N.Bb4, N.G4, N.F4, N.Eb4, N.C4, N.REST, N.C4, N.REST
    ],
    harmonyNotes: [
      N.C3, N.G3, N.C4, N.Eb4, N.C3, N.G3, N.C4, N.Eb4, N.Ab2, N.Eb3, N.Ab3, N.C4, N.Ab2, N.Eb3, N.Ab3, N.C4
    ],
    bassNotes: [
      N.C1, N.C1, N.G0, N.C1, N.C1, N.Eb1, N.C1, N.C0, N.Ab0, N.Ab0, N.Eb0, N.Ab0, N.Ab0, N.C1, N.Ab0, N.Ab0
    ],
    drumPattern: [
      6, 1, 5, 1, 6, 2, 5, 1, 6, 1, 5, 1, 6, 6, 5, 1,
      6, 1, 5, 1, 6, 2, 5, 4, 6, 1, 5, 1, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 22. ZONA 8 JEFE: «BOILER OVERLOAD ONLY UP 1000m»
  // Género: Frantic Steam Meltdown (152 BPM)
  // =========================================================================
  steampunkBoss: {
    tempo: 152,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3800,
    leadNotes: [
      N.G4, N.Bb4, N.C5, N.Cs5, N.D5, N.F5, N.G5, N.Bb5, N.A5, N.G5, N.F5, N.D5, N.Cs5, N.C5, N.Bb4, N.G4,
      N.G5, N.Bb5, N.D6, N.F6, N.G6, N.F6, N.D6, N.Bb5, N.C6, N.D6, N.F6, N.G6, N.G5, N.REST, N.G4, N.REST
    ],
    harmonyNotes: [
      N.G3, N.D4, N.G4, N.Bb4, N.G3, N.D4, N.G4, N.Bb4, N.Eb3, N.Bb3, N.Eb4, N.G4, N.Eb3, N.Bb3, N.Eb4, N.G4
    ],
    bassNotes: [
      N.G1, N.G1, N.D1, N.G1, N.G1, N.Bb1, N.G1, N.G0, N.Eb1, N.Eb1, N.Bb0, N.Eb1, N.Eb1, N.G1, N.Eb1, N.Eb0
    ],
    drumPattern: [
      6, 6, 5, 6, 6, 6, 5, 1, 6, 6, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 23. ZONA 9 (CASTLE SMASH · ACTO 1): «CITADEL OF THE VALIANT»
  // Género: Chivalric Medieval Brass March (120 BPM)
  // Identidad: Fanfarria triunfal de trompetas en cuartas y quintas (D-A-D-F-E-D), redoble de asedio.
  // =========================================================================
  castleAct1: {
    tempo: 120,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3300,
    leadNotes: [
      // Fanfarria heroica de trompetas de caballero andante
      N.D4, N.REST, N.A4, N.REST, N.D5, N.REST, N.F5, N.E5, N.D5, N.REST, N.C5, N.D5, N.A4, N.REST, N.REST, N.REST,
      N.F4, N.G4, N.A4, N.C5, N.D5, N.F5, N.E5, N.C5, N.D5, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST,
      N.A5, N.REST, N.F5, N.D5, N.G5, N.REST, N.E5, N.C5, N.F5, N.D5, N.C5, N.Bb4, N.A4, N.REST, N.REST, N.REST,
      N.D4, N.F4, N.A4, N.D5, N.C5, N.A4, N.F4, N.E4, N.D4, N.REST, N.A4, N.REST, N.D4, N.REST, N.D4, N.REST
    ],
    harmonyNotes: [
      N.D3, N.A3, N.D4, N.F4, N.D3, N.A3, N.D4, N.F4, N.Bb2, N.F3, N.Bb3, N.D4, N.Bb2, N.F3, N.Bb3, N.D4,
      N.F3, N.C4, N.F4, N.A4, N.F3, N.C4, N.F4, N.A4, N.A2, N.E3, N.A3, N.Cs4, N.A2, N.E3, N.A3, N.Cs4
    ],
    bassNotes: [
      N.D1, N.REST, N.A0, N.D1, N.D1, N.F1, N.D1, N.REST, N.Bb0, N.REST, N.F0, N.Bb0, N.Bb0, N.D1, N.Bb0, N.REST,
      N.F1, N.REST, N.C1, N.F1, N.F1, N.A1, N.F1, N.REST, N.A0, N.REST, N.E0, N.A0, N.A0, N.Cs1, N.D1, N.REST
    ],
    drumPattern: [
      2, 1, 3, 1, 2, 2, 3, 1, 2, 1, 3, 1, 4, 4, 5, 1
    ]
  },

  // =========================================================================
  // 24. ZONA 9 JEFE: «LORD MALAKAR'S SIEGE HAMMER»
  // Género: Gothic Heavy Siege Metal (152 BPM)
  // =========================================================================
  castleBoss: {
    tempo: 152,
    leadWave: 'sawtooth',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    filterCutoff: 3900,
    leadNotes: [
      N.D4, N.D4, N.F4, N.A4, N.G4, N.F4, N.E4, N.F4, N.D4, N.F4, N.A4, N.D5, N.C5, N.Bb4, N.A4, N.REST,
      N.D5, N.F5, N.A5, N.D6, N.C6, N.Bb5, N.A5, N.G5, N.A5, N.F5, N.E5, N.D5, N.D5, N.REST, N.D4, N.REST
    ],
    harmonyNotes: [
      N.D3, N.A3, N.D4, N.F4, N.D3, N.A3, N.D4, N.F4, N.G3, N.D4, N.G4, N.Bb4, N.G3, N.D4, N.G4, N.Bb4
    ],
    bassNotes: [
      N.D1, N.D1, N.A0, N.D1, N.D1, N.F1, N.D1, N.D0, N.G1, N.G1, N.D1, N.G1, N.G1, N.Bb1, N.G1, N.G0
    ],
    drumPattern: [
      6, 6, 5, 6, 6, 6, 5, 1, 6, 6, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 25. ZONA 10 (PIRATE'S TREASURE · ACTO 1): «HIGH SEAS CORSAIR SHANTY»
  // Género: Sea Shanty Jig Pirata 6/8 (132 BPM)
  // Identidad: Compás alegre de tripulación pirata, acordeón synth y brindis de galeón.
  // =========================================================================
  pirateBeach: {
    tempo: 132,
    leadWave: 'square',
    harmonyWave: 'triangle',
    bassWave: 'triangle',
    filterCutoff: 3000,
    leadNotes: [
      // Melodía típica de marinero pirata en 6/8
      N.A4, N.D5, N.D5, N.E5, N.F5, N.D5, N.D5, N.REST, N.F5, N.G5, N.A5, N.F5, N.E5, N.C5, N.A4, N.REST,
      N.A4, N.D5, N.D5, N.E5, N.F5, N.G5, N.A5, N.D5, N.F5, N.E5, N.D5, N.Cs5, N.D5, N.REST, N.D5, N.REST,
      N.F5, N.A5, N.A5, N.G5, N.F5, N.G5, N.A5, N.F5, N.G5, N.F5, N.E5, N.D5, N.E5, N.C5, N.A4, N.C5,
      N.D5, N.F5, N.A5, N.G5, N.F5, N.E5, N.D5, N.Cs5, N.D5, N.F5, N.A5, N.D6, N.D5, N.REST, N.D5, N.REST
    ],
    harmonyNotes: [
      N.D4, N.F4, N.A4, N.D5, N.D4, N.F4, N.A4, N.D5, N.F4, N.A4, N.C5, N.F5, N.A3, N.C4, N.E4, N.A4
    ],
    bassNotes: [
      N.D1, N.D1, N.A0, N.D1, N.D1, N.F1, N.D1, N.D0, N.F1, N.F1, N.C1, N.F1, N.A0, N.A0, N.E0, N.A0
    ],
    drumPattern: [
      4, 1, 5, 1, 4, 1, 5, 1, 4, 1, 5, 1, 4, 4, 5, 1,
      4, 1, 5, 1, 4, 1, 5, 4, 4, 1, 5, 1, 4, 4, 5, 5
    ]
  },

  // =========================================================================
  // 26. ZONA 10 (PIRATE · ACTO 2): «ABYSSAL WHISPERS»
  // Género: Submerged Aqua Ambient (106 BPM)
  // =========================================================================
  pirateUnderwater: {
    tempo: 106,
    leadWave: 'sine',
    harmonyWave: 'triangle',
    bassWave: 'sine',
    filterCutoff: 1700,
    leadNotes: [
      N.E4, N.G4, N.B4, N.E5, N.D5, N.B4, N.A4, N.G4, N.A4, N.C5, N.E5, N.D5, N.C5, N.A4, N.G4, N.REST,
      N.F4, N.A4, N.C5, N.F5, N.E5, N.C5, N.A4, N.F4, N.B4, N.D5, N.Fs5, N.E5, N.D5, N.B4, N.REST, N.REST
    ],
    harmonyNotes: [
      N.E3, N.B3, N.E4, N.G4, N.E3, N.B3, N.E4, N.G4, N.A3, N.E4, N.A4, N.C5, N.A3, N.E4, N.A4, N.C5
    ],
    bassNotes: [
      N.E1, N.REST, N.B0, N.REST, N.E1, N.REST, N.G1, N.REST, N.A0, N.REST, N.E0, N.REST, N.A0, N.REST, N.C1, N.REST
    ],
    drumPattern: [
      2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0
    ]
  },

  // =========================================================================
  // 27. ZONA 10 JEFE: «KRAKEN'S CURSED CHEST»
  // Género: Sunken Galleon Mimic Metal (152 BPM)
  // =========================================================================
  pirateBoss: {
    tempo: 152,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3800,
    leadNotes: [
      N.C4, N.Ds4, N.G4, N.Fs4, N.F4, N.Ds4, N.C4, N.REST, N.C4, N.Ds4, N.G4, N.Fs4, N.G4, N.As4, N.C5, N.REST,
      N.C5, N.As4, N.G4, N.Fs4, N.F4, N.Ds4, N.C4, N.Ds4, N.F4, N.Fs4, N.G4, N.As4, N.B4, N.C5, N.Ds5, N.REST
    ],
    harmonyNotes: [
      N.C3, N.G3, N.C4, N.Ds4, N.C3, N.G3, N.C4, N.Ds4, N.F3, N.C4, N.F4, N.As4, N.F3, N.C4, N.F4, N.As4
    ],
    bassNotes: [
      N.C1, N.C1, N.G0, N.C1, N.C1, N.Ds1, N.C1, N.C0, N.F1, N.F1, N.C1, N.F1, N.F1, N.As1, N.F1, N.F0
    ],
    drumPattern: [
      6, 6, 5, 6, 6, 6, 5, 1, 6, 6, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 28. ZONA 11 (JURASSIC DRAFT · ACTO 1): «VALLEY OF THE RAPTORS»
  // Género: Prehistoric Tribal Beast Stomp (138 BPM)
  // Identidad: Tambores tribales pesados, intervalos pentatónicos oscuros y llamadas de dinosaurio.
  // =========================================================================
  jurassicAct1: {
    tempo: 138,
    leadWave: 'square',
    harmonyWave: 'sawtooth',
    bassWave: 'triangle',
    filterCutoff: 2900,
    leadNotes: [
      N.E4, N.G4, N.A4, N.REST, N.B4, N.D5, N.B4, N.A4, N.G4, N.E4, N.G4, N.A4, N.B4, N.REST, N.D5, N.E5,
      N.D5, N.B4, N.A4, N.G4, N.E4, N.D4, N.E4, N.G4, N.A4, N.B4, N.A4, N.G4, N.E4, N.REST, N.E4, N.REST
    ],
    harmonyNotes: [
      N.E3, N.B3, N.E4, N.G4, N.E3, N.B3, N.E4, N.G4, N.D3, N.A3, N.D4, N.F4, N.D3, N.A3, N.D4, N.F4
    ],
    bassNotes: [
      N.E1, N.E1, N.B0, N.E1, N.E1, N.G1, N.E1, N.E0, N.D1, N.D1, N.A0, N.D1, N.D1, N.F1, N.D1, N.D0
    ],
    drumPattern: [
      4, 1, 5, 1, 4, 1, 5, 1, 4, 1, 5, 1, 4, 4, 5, 1,
      4, 1, 5, 1, 4, 1, 5, 4, 4, 1, 5, 1, 4, 4, 5, 5
    ]
  },

  // =========================================================================
  // 29. ZONA 11 (JURASSIC · ACTO 2): «VOLCANIC PTEROSAUR RIDGE»
  // Género: Volcanic Flight Thermals (144 BPM)
  // =========================================================================
  jurassicAct2: {
    tempo: 144,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    filterCutoff: 3400,
    leadNotes: [
      N.D4, N.F4, N.A4, N.D5, N.C5, N.A4, N.G4, N.F4, N.D4, N.F4, N.G4, N.Gs4, N.A4, N.C5, N.D5, N.REST,
      N.F5, N.D5, N.C5, N.A4, N.G4, N.F4, N.D4, N.F4, N.G4, N.A4, N.C5, N.D5, N.F5, N.E5, N.D5, N.REST
    ],
    harmonyNotes: [
      N.D3, N.A3, N.D4, N.F4, N.D3, N.A3, N.D4, N.F4, N.C3, N.G3, N.C4, N.E4, N.C3, N.G3, N.C4, N.E4
    ],
    bassNotes: [
      N.D1, N.D1, N.A0, N.D1, N.D1, N.F1, N.D1, N.D0, N.C1, N.C1, N.G0, N.C1, N.C1, N.E1, N.C1, N.C0
    ],
    drumPattern: [
      6, 1, 5, 1, 6, 2, 5, 1, 6, 1, 5, 1, 6, 6, 5, 1,
      6, 1, 5, 1, 6, 2, 5, 4, 6, 1, 5, 1, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 30. ZONA 11 JEFE: «APEX TITAN REX SHOWDOWN»
  // Género: Apex Predator Heavy Metal (154 BPM)
  // =========================================================================
  jurassicBoss: {
    tempo: 154,
    leadWave: 'sawtooth',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    filterCutoff: 3800,
    leadNotes: [
      N.B3, N.D4, N.F4, N.Fs4, N.F4, N.D4, N.B3, N.REST, N.B3, N.D4, N.Fs4, N.G4, N.Fs4, N.D4, N.B3, N.REST,
      N.B4, N.A4, N.Fs4, N.F4, N.D4, N.B3, N.D4, N.Fs4, N.G4, N.A4, N.B4, N.D5, N.Fs5, N.F5, N.D5, N.REST
    ],
    harmonyNotes: [
      N.B2, N.Fs3, N.B3, N.D4, N.B2, N.Fs3, N.B3, N.D4, N.G2, N.D3, N.G3, N.B3, N.G2, N.D3, N.G3, N.B3
    ],
    bassNotes: [
      N.B0, N.B0, N.Fs0, N.B0, N.B0, N.D1, N.B0, N.B0, N.G0, N.G0, N.D0, N.G0, N.G0, N.B0, N.G0, N.G0
    ],
    drumPattern: [
      6, 6, 5, 6, 6, 6, 5, 1, 6, 6, 5, 6, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 31. ZONA 12 (LA LUNA · ACTO 1): «COUNTDOWN TO INFINITY»
  // Género: Heroic Space Odyssey Synthwave (140 BPM)
  // Identidad: Ascenso estelar majestuoso, acordes que se elevan al espacio profundo.
  // =========================================================================
  moonLaunchAct1: {
    tempo: 140,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    arpWave: 'square',
    filterCutoff: 3500,
    leadNotes: [
      N.C4, N.Eb4, N.G4, N.C5, N.Bb4, N.G4, N.Eb4, N.G4, N.F4, N.Ab4, N.C5, N.Eb5, N.D5, N.Bb4, N.G4, N.F4,
      N.Eb4, N.G4, N.Bb4, N.Eb5, N.D5, N.C5, N.Bb4, N.C5, N.G4, N.Bb4, N.C5, N.D5, N.Eb5, N.F5, N.G5, N.REST,
      N.C5, N.G5, N.F5, N.Eb5, N.D5, N.C5, N.Bb4, N.C5, N.Ab4, N.C5, N.Eb5, N.Ab5, N.G5, N.Eb5, N.D5, N.C5,
      N.Bb4, N.D5, N.F5, N.Bb5, N.A5, N.F5, N.D5, N.Bb4, N.G4, N.C5, N.Eb5, N.G5, N.C6, N.REST, N.C5, N.REST
    ],
    harmonyNotes: [
      N.G3, N.C4, N.Eb4, N.G4, N.G3, N.C4, N.Eb4, N.G4, N.Ab3, N.C4, N.Eb4, N.Ab4, N.Ab3, N.C4, N.Eb4, N.Ab4,
      N.Bb3, N.Eb4, N.G4, N.Bb4, N.Bb3, N.Eb4, N.G4, N.Bb4, N.G3, N.B3, N.D4, N.G4, N.G3, N.B3, N.D4, N.G4
    ],
    bassNotes: [
      N.C2, N.C2, N.C1, N.C2, N.C2, N.G1, N.C2, N.C2, N.Ab1, N.Ab1, N.Eb1, N.Ab1, N.Ab1, N.C2, N.Ab1, N.Ab1,
      N.Eb1, N.Eb1, N.Bb0, N.Eb1, N.Eb1, N.G1, N.Eb1, N.Eb1, N.G1, N.G1, N.D1, N.G1, N.G1, N.B1, N.G1, N.G1
    ],
    arpNotes: [
      N.C4, N.Eb4, N.G4, N.C5, N.Eb4, N.G4, N.C5, N.Eb5, N.Ab3, N.C4, N.Eb4, N.Ab4, N.C4, N.Eb4, N.Ab4, N.C5
    ],
    drumPattern: [
      4, 1, 5, 1, 4, 1, 5, 1, 4, 1, 5, 1, 4, 4, 5, 1,
      4, 1, 5, 1, 4, 1, 5, 4, 4, 1, 5, 1, 4, 4, 5, 5
    ]
  },

  // =========================================================================
  // 32. ZONA 12 JEFE: «COSMIC DOOMSDAY CLIMAX»
  // Género: Sonic 3 Doomsday Zone Tribute Space Rock (158 BPM)
  // Identidad: Bajo galopante incesante de rock cósmico, solo de guitarra sintética épico.
  // =========================================================================
  moonDoomsdayBoss: {
    tempo: 158,
    leadWave: 'sawtooth',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    arpWave: 'square',
    filterCutoff: 4200,
    leadNotes: [
      // Fanfarria Doomsday con vuelo supersónico
      N.D5, N.D5, N.F5, N.A5, N.G5, N.F5, N.E5, N.F5, N.D5, N.D5, N.F5, N.A5, N.Bb5, N.A5, N.G5, N.A5,
      N.F5, N.G5, N.A5, N.D6, N.C6, N.Bb5, N.A5, N.G5, N.A5, N.F5, N.E5, N.D5, N.Cs5, N.E5, N.A5, N.REST,
      N.D5, N.F5, N.A5, N.D6, N.C6, N.D6, N.C6, N.A5, N.Bb5, N.D6, N.F6, N.E6, N.D6, N.C6, N.Bb5, N.A5,
      N.G5, N.Bb5, N.D6, N.G6, N.F6, N.E6, N.D6, N.C6, N.D6, N.REST, N.A5, N.REST, N.D5, N.D5, N.F5, N.A5
    ],
    harmonyNotes: [
      N.D4, N.F4, N.A4, N.D5, N.C4, N.E4, N.G4, N.C5, N.Bb3, N.D4, N.F4, N.Bb4, N.A3, N.Cs4, N.E4, N.A4,
      N.D4, N.F4, N.A4, N.D5, N.F4, N.A4, N.C5, N.F5, N.G4, N.Bb4, N.D5, N.G5, N.A4, N.Cs5, N.E5, N.A5
    ],
    bassNotes: [
      // Bajo galopante de rock espacial
      N.D2, N.D2, N.D1, N.D2, N.C2, N.C2, N.G1, N.C2, N.Bb1, N.Bb1, N.F1, N.Bb1, N.A1, N.A1, N.E1, N.A1,
      N.D2, N.D2, N.D1, N.D2, N.F2, N.F2, N.C2, N.F2, N.G2, N.G2, N.D2, N.G2, N.A2, N.A2, N.E2, N.A2
    ],
    drumPattern: [
      6, 1, 5, 1, 6, 2, 5, 1, 6, 1, 5, 1, 6, 6, 5, 1,
      6, 1, 5, 1, 6, 2, 5, 4, 6, 1, 5, 1, 6, 6, 5, 5
    ]
  },

  // =========================================================================
  // 33. CRÉDITOS Y EPÍLOGO: «ZION'S ETERNAL VICTORY»
  // Género: Uplifting Heroic Anthem & Nostalgia (118 BPM)
  // Identidad: Gran final conmovedor con acordes cálidos y resolución emocional.
  // =========================================================================
  creditsTune: {
    tempo: 118,
    leadWave: 'triangle',
    harmonyWave: 'sine',
    bassWave: 'sine',
    filterCutoff: 2600,
    leadNotes: [
      N.C5, N.REST, N.E5, N.G5, N.A5, N.REST, N.G5, N.E5, N.D5, N.REST, N.C5, N.D5, N.E5, N.REST, N.REST, N.REST,
      N.F5, N.REST, N.A5, N.C6, N.B5, N.REST, N.A5, N.F5, N.G5, N.REST, N.E5, N.C5, N.D5, N.REST, N.REST, N.REST,
      N.C6, N.REST, N.B5, N.A5, N.G5, N.REST, N.E5, N.G5, N.A5, N.REST, N.G5, N.F5, N.E5, N.D5, N.C5, N.REST,
      N.C5, N.E5, N.G5, N.C6, N.E6, N.D6, N.C6, N.G5, N.C6, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST
    ],
    harmonyNotes: [
      N.C4, N.E4, N.G4, N.C5, N.C4, N.E4, N.G4, N.C5, N.F3, N.A3, N.C4, N.F4, N.F3, N.A3, N.C4, N.F4,
      N.A3, N.C4, N.E4, N.A4, N.A3, N.C4, N.E4, N.A4, N.G3, N.B3, N.D4, N.G4, N.G3, N.B3, N.D4, N.G4
    ],
    bassNotes: [
      N.C2, N.REST, N.G1, N.REST, N.F1, N.REST, N.C2, N.REST, N.A1, N.REST, N.E1, N.REST, N.G1, N.REST, N.D1, N.REST,
      N.C2, N.REST, N.G1, N.REST, N.C2, N.REST, N.G1, N.REST, N.C2, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST, N.REST
    ],
    drumPattern: [
      2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 4, 1, 5, 1
    ]
  },

  // =========================================================================
  // MODO ENTRENAMIENTO · DOJO VIRTUAL DE PRÁCTICA (132 BPM)
  // Inspirado en la enérgica banda sonora electrónica retro / chiptune del archivo
  // =========================================================================
  trainingTheme: {
    tempo: 132,
    leadWave: 'square',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    arpWave: 'triangle',
    filterCutoff: 3800,
    leadNotes: [
      N.E5, N.REST, N.E5, N.G5, N.A5, N.REST, N.G5, N.REST, N.E5, N.REST, N.D5, N.E5, N.G5, N.REST, N.A5, N.B5,
      N.D6, N.REST, N.B5, N.A5, N.B5, N.REST, N.A5, N.G5, N.E5, N.G5, N.A5, N.B5, N.A5, N.G5, N.E5, N.REST,
      N.E5, N.E5, N.G5, N.A5, N.B5, N.REST, N.D6, N.REST, N.E6, N.REST, N.D6, N.B5, N.A5, N.G5, N.A5, N.B5,
      N.A5, N.G5, N.E5, N.D5, N.E5, N.G5, N.A5, N.B5, N.E6, N.REST, N.D6, N.REST, N.B5, N.A5, N.G5, N.REST
    ],
    harmonyNotes: [
      N.E4, N.G4, N.B4, N.E5, N.C4, N.E4, N.G4, N.C5, N.D4, N.Fs4, N.A4, N.D5, N.B3, N.Ds4, N.Fs4, N.B4,
      N.E4, N.G4, N.B4, N.E5, N.C4, N.E4, N.G4, N.C5, N.D4, N.Fs4, N.A4, N.D5, N.B3, N.Ds4, N.Fs4, N.B4
    ],
    bassNotes: [
      N.E2, N.E2, N.E2, N.E2, N.C2, N.C2, N.C2, N.C2, N.D2, N.D2, N.D2, N.D2, N.B1, N.B1, N.B1, N.B1,
      N.E2, N.E2, N.E2, N.E2, N.C2, N.C2, N.C2, N.C2, N.D2, N.D2, N.D2, N.D2, N.B1, N.B1, N.B1, N.B1
    ],
    arpNotes: [
      N.E3, N.B3, N.E4, N.G4, N.C3, N.G3, N.C4, N.E4, N.D3, N.A3, N.D4, N.Fs4, N.B2, N.Fs3, N.B3, N.Ds4
    ],
    drumPattern: [
      4, 1, 5, 1, 4, 1, 5, 1, 4, 1, 5, 1, 4, 1, 5, 7
    ]
  }
};
