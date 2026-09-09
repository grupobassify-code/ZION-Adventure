// Web Audio API Polyphonic Retro Chiptune & Arcade-Grade Synth Engine
// FM Synthesizer 16-Bit Architecture with multi-channel voices and stereo panning

export type MusicTrackName = 
  | 'menuTheme'
  | 'neonAct1' 
  | 'neonBoss' 
  | 'sakuraAct1' 
  | 'sakuraBoss' 
  | 'lavacliffAct1' 
  | 'lavacliffBoss'
  | 'desertAct1'
  | 'desertAct2'
  | 'desertBoss'
  | 'kronoAct1'
  | 'kronoAct2'
  | 'kronoBoss'
  | 'kronosTravel'
  | 'creditsTune';

export interface SoundTrackInfo {
  id: MusicTrackName;
  title: string;
  zone: string;
  tag: string;
}

export const SOUND_TRACKS_CATALOG: SoundTrackInfo[] = [
  { id: 'menuTheme', title: 'Preludio de Kronos (Menú)', zone: 'Menú de Inicio', tag: 'Melodía Ligera · Chill Retro' },
  { id: 'neonAct1', title: 'El Despertar de la Arboleda', zone: 'Bosque Neón · Acto 1', tag: 'Neo-Genesis Groove · Pop Chiptune' },
  { id: 'neonBoss', title: 'El Guardián del Núcleo', zone: 'Bosque Neón · Jefe', tag: 'Electro Boss · 16-Bit Battle' },
  { id: 'sakuraAct1', title: 'Flor de Sakura y Torii', zone: 'Bosque de Cerezo · Acto 1', tag: 'Oriental Místico · Pentatónico' },
  { id: 'sakuraBoss', title: 'Duelo de la Luna Roja', zone: 'Bosque de Cerezo · Jefe', tag: 'Ninja Beat · Darksynth' },
  { id: 'lavacliffAct1', title: 'Furia de los Acantilados', zone: 'Acantilado de Lava · Acto 1', tag: 'Magma Funk & Rock' },
  { id: 'lavacliffBoss', title: 'Ignis, Coloso de Fuego', zone: 'Acantilado de Lava · Jefe', tag: 'Heavy Metal 16-bit' },
  { id: 'desertAct1', title: 'Sol de Ra y Dunas Olvidadas', zone: 'Santuario del Desierto · Acto 1', tag: 'Egipcio Frigio · Slap Bass' },
  { id: 'desertAct2', title: 'Cámara del Faraón Oscuro', zone: 'Santuario del Desierto · Acto 2', tag: 'Místico Arcana · Ambient Beat' },
  { id: 'desertBoss', title: 'Faraón Akhen\'Ra Despierta', zone: 'Santuario del Desierto · Jefe', tag: 'Boss Faraónico · High Energy' },
  { id: 'kronoAct1', title: 'Avenida Ciberpunk & Autopistas Neón', zone: 'Krono City · Acto 1', tag: 'Darksynth Drive · Cyber Speed' },
  { id: 'kronoAct2', title: 'Reactor de Fusión y Red Central', zone: 'Krono City · Acto 2', tag: 'Industrial Techno · FM Bass' },
  { id: 'kronoBoss', title: 'Titán Mecánico Kronos-Ω', zone: 'Krono City · Jefe Final', tag: 'Gran Clímax Final · Sinfonía Chiptune' },
  { id: 'kronosTravel', title: 'Kronos Travel: Odisea Dimensional', zone: 'Nivel Extra · Fusión Suprema', tag: 'Medley Legendario Multizona' },
  { id: 'creditsTune', title: 'Himno de la Victoria de Zion', zone: 'Créditos & Epílogo', tag: 'Celebración Heroica · Ending Theme' },
];

interface MusicTrackPattern {
  tempo: number; // BPM
  leadWave: OscillatorType;
  harmonyWave: OscillatorType;
  bassWave: OscillatorType;
  arpWave?: OscillatorType;
  leadNotes: number[];
  harmonyNotes: number[];
  bassNotes: number[];
  arpNotes?: number[];
  drumPattern: number[]; // 0: none, 1: hihat, 2: kick, 3: snare, 4: kick+hihat, 5: snare+hihat, 6: kick+snare, 7: tom/fill
}

// Frequency constants for pristine tuning
const N = {
  REST: 0,
  // Octave 1
  C1: 32.7, D1: 36.7, E1: 41.2, F1: 43.7, G1: 49.0, A1: 55.0, B1: 61.7,
  // Octave 2
  C2: 65.4, Cs2: 69.3, D2: 73.4, Ds2: 77.8, E2: 82.4, F2: 87.3, Fs2: 92.5, G2: 98.0, Gs2: 103.8, A2: 110.0, As2: 116.5, B2: 123.5,
  // Octave 3
  C3: 130.8, Cs3: 138.6, D3: 146.8, Ds3: 155.6, E3: 164.8, F3: 174.6, Fs3: 185.0, G3: 196.0, Gs3: 207.7, A3: 220.0, As3: 233.1, B3: 246.9,
  // Octave 4
  C4: 261.6, Cs4: 277.2, D4: 293.7, Ds4: 311.1, E4: 329.6, F4: 349.2, Fs4: 370.0, G4: 392.0, Gs4: 415.3, A4: 440.0, As4: 466.2, B4: 493.9,
  // Octave 5
  C5: 523.3, Cs5: 554.4, D5: 587.3, Ds5: 622.3, E5: 659.3, F5: 698.5, Fs5: 740.0, G5: 784.0, Gs5: 830.6, A5: 880.0, As5: 932.3, B5: 987.8,
  // Octave 6
  C6: 1046.5, Cs6: 1108.7, D6: 1174.7, Ds6: 1244.5, E6: 1318.5, F6: 1396.9, Fs6: 1480.0, G6: 1568.0, Gs6: 1661.2, A6: 1760.0, As6: 1864.7, B6: 1975.5,
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private schedulerTimer: number | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;
  private currentTrack: MusicTrackName | null = null;
  private musicGainNode: GainNode | null = null;
  public soundEnabled = true;
  public musicEnabled = true;
  public masterVolume = 0.5;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.musicGainNode) {
      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  public unlockAudio() {
    this.initContext();
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getCurrentTrack(): MusicTrackName | null {
    return this.currentTrack;
  }

  public tone(
    frequency: number,
    duration = 0.1,
    type: OscillatorType = 'square',
    volume = 0.04,
    delay = 0,
    pitchEnd?: number
  ) {
    if (!this.soundEnabled || this.masterVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, frequency), startTime);
      if (pitchEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, pitchEnd), startTime + duration);
      }

      const effectiveVol = volume * this.masterVolume;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(effectiveVol, startTime + Math.min(0.015, duration * 0.2));
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // Audio errors safely ignored
    }
  }

  // Synthesized percussion sound generators with punchy punch & snap
  private playKick(time: number, vol = 0.04) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.11);
      gain.gain.setValueAtTime(vol * this.masterVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
      osc.connect(gain);
      gain.connect(this.musicGainNode || this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.14);
    } catch {}
  }

  private playSnare(time: number, vol = 0.028) {
    if (!this.ctx) return;
    try {
      // Noise burst for snare snap
      const bufferSize = this.ctx.sampleRate * 0.09;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1100;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * this.masterVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGainNode || this.ctx.destination);
      noise.start(time);
      noise.stop(time + 0.1);

      // Body tone (punchy mid crack)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.07);
      oscGain.gain.setValueAtTime(vol * 0.65 * this.masterVolume, time);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
      osc.connect(oscGain);
      oscGain.connect(this.musicGainNode || this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.08);
    } catch {}
  }

  private playHiHat(time: number, vol = 0.016) {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.035;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 6500;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * this.masterVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.032);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGainNode || this.ctx.destination);
      noise.start(time);
      noise.stop(time + 0.035);
    } catch {}
  }

  public playSfx(name: string) {
    if (!this.soundEnabled) return;
    switch (name) {
      case 'jump':
        this.tone(480, 0.09, 'square', 0.035, 0, 820);
        this.tone(720, 0.07, 'triangle', 0.02, 0.02, 950);
        break;
      case 'dash':
        this.tone(640, 0.12, 'sawtooth', 0.04, 0, 180);
        this.tone(360, 0.08, 'triangle', 0.03, 0.02, 90);
        break;
      case 'slash':
        this.tone(880, 0.06, 'sawtooth', 0.045, 0, 220);
        this.tone(1320, 0.04, 'triangle', 0.03, 0.01, 440);
        break;
      case 'dagger':
        this.tone(988, 0.05, 'triangle', 0.035, 0, 1480);
        this.tone(1480, 0.05, 'sine', 0.025, 0.02, 1960);
        break;
      case 'block':
        this.tone(330, 0.09, 'square', 0.045, 0, 180);
        this.tone(520, 0.06, 'triangle', 0.03, 0.02, 300);
        break;
      case 'parry':
        this.tone(988, 0.08, 'sine', 0.06, 0, 1568);
        this.tone(1568, 0.12, 'triangle', 0.05, 0.04, 2093);
        this.tone(2093, 0.15, 'sine', 0.04, 0.08, 2637);
        break;
      case 'showdownTrigger':
      case 'showdownParry':
        this.tone(130, 0.45, 'sawtooth', 0.08, 0, 65);
        this.tone(1760, 0.35, 'sine', 0.08, 0.02, 2960);
        this.tone(2637, 0.25, 'triangle', 0.06, 0.05, 3520);
        [880, 1108, 1318, 1760].forEach((f, i) => this.tone(f, 0.3, 'square', 0.04, 0.08 + i * 0.04));
        break;
      case 'showdownSlash':
        this.tone(82, 0.5, 'sawtooth', 0.09, 0, 41);
        this.tone(2200, 0.4, 'triangle', 0.08, 0.02, 330);
        this.tone(1480, 0.3, 'square', 0.07, 0.06, 160);
        break;
      case 'studioIntro':
        this.tone(73.4, 0.9, 'sawtooth', 0.08, 0, 110);
        this.tone(110.0, 0.85, 'triangle', 0.06, 0.05);
        this.tone(146.8, 0.8, 'sine', 0.05, 0.1);
        this.tone(220.0, 0.7, 'sine', 0.04, 0.15);
        this.tone(440.0, 0.6, 'triangle', 0.03, 0.25);
        this.tone(880.0, 0.5, 'sine', 0.025, 0.35);
        break;
      case 'splashLoadComplete':
        [523.3, 659.3, 784.0, 1046.5].forEach((f, i) => {
          this.tone(f, 0.22, 'sine', 0.045, i * 0.07);
        });
        break;
      case 'showdownReady':
        [1046, 1318, 1568, 2093].forEach((f, i) => this.tone(f, 0.18, 'sine', 0.05, i * 0.06));
        break;
      case 'special':
        [330, 494, 659, 988, 1318].forEach((freq, idx) => {
          this.tone(freq, 0.16, 'sawtooth', 0.045, idx * 0.04, freq * 1.5);
        });
        break;
      case 'levelUp':
        [440, 554, 659, 880, 1108, 1318].forEach((freq, idx) => {
          this.tone(freq, 0.22, 'triangle', 0.05, idx * 0.07);
        });
        break;
      case 'hit':
        this.tone(280, 0.09, 'sawtooth', 0.05, 0, 130);
        this.tone(440, 0.06, 'square', 0.03, 0.02, 220);
        break;
      case 'crit':
        this.tone(440, 0.1, 'sawtooth', 0.06, 0, 160);
        this.tone(880, 0.12, 'square', 0.05, 0.02, 330);
        break;
      case 'hurt':
        this.tone(165, 0.18, 'sawtooth', 0.06, 0, 75);
        this.tone(98, 0.22, 'square', 0.04, 0.05, 55);
        break;
      case 'crystal':
        this.tone(784, 0.08, 'sine', 0.04, 0);
        this.tone(1174, 0.12, 'triangle', 0.03, 0.05);
        this.tone(1568, 0.15, 'sine', 0.025, 0.1);
        break;
      case 'secret':
        [523, 659, 784, 1046, 1318].forEach((freq, idx) => {
          this.tone(freq, 0.14, 'triangle', 0.035, idx * 0.07);
        });
        break;
      case 'checkpoint':
        this.tone(587, 0.1, 'triangle', 0.03, 0);
        this.tone(880, 0.15, 'sine', 0.04, 0.07);
        this.tone(1174, 0.2, 'triangle', 0.035, 0.14);
        break;
      case 'heal':
        this.tone(440, 0.09, 'sine', 0.03, 0);
        this.tone(659, 0.11, 'sine', 0.035, 0.06);
        this.tone(880, 0.16, 'sine', 0.04, 0.12);
        break;
      case 'node':
        this.tone(659, 0.1, 'sine', 0.04, 0, 988);
        this.tone(1318, 0.14, 'triangle', 0.035, 0.05, 1760);
        break;
      case 'shieldBreak':
        this.tone(880, 0.2, 'square', 0.05, 0, 300);
        this.tone(440, 0.3, 'sawtooth', 0.05, 0.08, 150);
        break;
      case 'crushSlam':
      case 'bossSlam':
        this.tone(90, 0.28, 'sawtooth', 0.09, 0, 35);
        this.tone(180, 0.15, 'square', 0.05, 0.02, 60);
        break;
      case 'mineTick':
        this.tone(1760, 0.04, 'square', 0.035, 0);
        break;
      case 'mineExplode':
        this.tone(75, 0.35, 'sawtooth', 0.09, 0, 30);
        this.tone(140, 0.22, 'square', 0.06, 0.02, 45);
        break;
      case 'vortexLift':
        this.tone(523, 0.12, 'sine', 0.025, 0, 784);
        break;
      case 'buzzSaw':
        this.tone(960, 0.06, 'sawtooth', 0.035, 0, 480);
        this.tone(1440, 0.04, 'square', 0.02, 0.01, 720);
        break;
      case 'teslaShock':
        this.tone(1200, 0.08, 'square', 0.045, 0, 240);
        this.tone(600, 0.1, 'sawtooth', 0.035, 0.02, 120);
        break;
      case 'flameWhoosh':
      case 'lava':
        this.tone(220, 0.22, 'triangle', 0.05, 0, 80);
        this.tone(140, 0.18, 'sawtooth', 0.04, 0.03, 50);
        break;
      case 'acidSizzle':
        this.tone(700, 0.12, 'square', 0.035, 0, 350);
        this.tone(1050, 0.08, 'triangle', 0.02, 0.04, 525);
        break;
      case 'dartFire':
        this.tone(1250, 0.05, 'triangle', 0.04, 0, 1800);
        break;
      case 'bossWarning':
        this.tone(880, 0.1, 'square', 0.05, 0);
        this.tone(1174, 0.1, 'square', 0.05, 0.06);
        break;
      case 'laserFire':
      case 'bossShot':
        this.tone(1400, 0.08, 'sawtooth', 0.05, 0, 350);
        break;
      case 'curse':
        this.tone(300, 0.2, 'sawtooth', 0.04, 0, 120);
        this.tone(450, 0.15, 'triangle', 0.03, 0.05, 200);
        break;
      case 'menuSelect':
        this.tone(659, 0.06, 'triangle', 0.03, 0);
        this.tone(988, 0.08, 'sine', 0.035, 0.03);
        break;
      case 'portal':
      case 'warp':
        [392, 523, 659, 784, 1046, 1318].forEach((n, i) => {
          this.tone(n, 0.14, 'sine', 0.04, i * 0.05, n * 1.5);
        });
        break;
      case 'win':
        [523, 659, 784, 1046, 1318, 1568].forEach((n, i) => {
          this.tone(n, 0.2, 'triangle', 0.04, i * 0.09);
        });
        break;
      default:
        this.tone(440, 0.08, 'triangle', 0.03, 0);
        break;
    }
  }

  // Multi-channel sound themes with rich multi-bar melodic structures, retro 16-bit pop syncopation, catchy hooks and walking bass
  private trackThemes: Record<MusicTrackName, MusicTrackPattern> = {
    // ZONE 1 · ACT 1: NEON FOREST (Upbeat retro pop groove, 64 steps)
    neonAct1: {
      tempo: 138,
      leadWave: 'triangle',
      harmonyWave: 'sine',
      bassWave: 'sawtooth',
      arpWave: 'square',
      // Verse A -> Verse A2 -> Uplifting Chorus B -> Grand Resolution Cadence
      leadNotes: [
        // Bar 1 (Iconic Catchy Upbeat Hook: C-E-G-A-C5 bouncy phrasing)
        N.C4, N.E4, N.G4, N.A4, N.C5, N.A4, N.G4, N.E4,  N.D4, N.F4, N.A4, N.C5, N.D5, N.C5, N.A4, N.F4,
        // Bar 2 (Syncopated Ascent with playful triplet swing feel)
        N.E4, N.G4, N.C5, N.E5, N.D5, N.C5, N.A4, N.G4,  N.F4, N.A4, N.C5, N.D5, N.E5, N.D5, N.C5, N.D5,
        // Bar 3 (Chorus B: Soaring high register melody)
        N.E5, N.G5, N.E5, N.D5, N.C5, N.D5, N.E5, N.G4,  N.A4, N.C5, N.E5, N.D5, N.C5, N.A4, N.C5, N.D5,
        // Bar 4 (Turnaround / Energetic Cascade)
        N.E5, N.D5, N.C5, N.A4, N.G4, N.E4, N.D4, N.C4,  N.D4, N.E4, N.G4, N.A4, N.C5, N.D5, N.C5, N.REST
      ],
      harmonyNotes: [
        N.G4, N.REST, N.C5, N.REST, N.E5, N.REST, N.C5, N.REST, N.A4, N.REST, N.D5, N.REST, N.F5, N.REST, N.D5, N.REST,
        N.G4, N.REST, N.C5, N.REST, N.E5, N.REST, N.C5, N.REST, N.A4, N.REST, N.C5, N.REST, N.F5, N.REST, N.D5, N.REST,
        N.C5, N.REST, N.E5, N.REST, N.G5, N.REST, N.E5, N.REST, N.F5, N.REST, N.A5, N.REST, N.F5, N.REST, N.D5, N.REST,
        N.G5, N.REST, N.F5, N.REST, N.E5, N.REST, N.D5, N.REST, N.C5, N.REST, N.E5, N.REST, N.G5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        // Slap Bass Line (Groovy 8th notes with octave jumps)
        N.C2, N.C3, N.C2, N.D2, N.E2, N.E3, N.D2, N.C2,  N.F2, N.F3, N.F2, N.G2, N.A2, N.A3, N.G2, N.F2,
        N.C2, N.C3, N.C2, N.D2, N.E2, N.E3, N.D2, N.C2,  N.F2, N.F3, N.G2, N.G3, N.A2, N.G2, N.F2, N.G2,
        N.A2, N.A3, N.G2, N.E2, N.F2, N.F3, N.G2, N.E2,  N.F2, N.F3, N.G2, N.A2, N.As2, N.A2, N.G2, N.F2,
        N.G2, N.G3, N.F2, N.E2, N.D2, N.D3, N.C2, N.B1,  N.C2, N.E2, N.G2, N.A2, N.C3, N.G2, N.C2, N.C3
      ],
      drumPattern: [
        2, 1, 3, 1, 2, 4, 3, 1, 2, 1, 3, 1, 4, 1, 5, 1,
        2, 1, 3, 1, 2, 1, 3, 4, 2, 1, 3, 1, 4, 4, 5, 1,
        4, 1, 5, 1, 4, 1, 5, 2, 4, 1, 5, 1, 4, 4, 5, 4,
        2, 1, 3, 1, 2, 2, 3, 1, 4, 4, 5, 5, 2, 3, 5, 1
      ],
    },

    // ZONE 1 · BOSS: THE CORE GUARDIAN (Driving 16-bit Mega Drive Boss Battle, 64 steps)
    neonBoss: {
      tempo: 152,
      leadWave: 'sawtooth',
      harmonyWave: 'square',
      bassWave: 'sawtooth',
      leadNotes: [
        N.A4, N.C5, N.D5, N.Ds5, N.E5, N.Ds5, N.D5, N.C5,  N.A4, N.G4, N.A4, N.C5, N.D5, N.C5, N.A4, N.G4,
        N.A4, N.C5, N.D5, N.E5, N.G5, N.E5, N.D5, N.C5,   N.D5, N.Ds5, N.E5, N.G5, N.A5, N.G5, N.E5, N.D5,
        N.A5, N.G5, N.E5, N.D5, N.C5, N.D5, N.E5, N.G5,   N.A5, N.B5, N.C6, N.B5, N.A5, N.G5, N.E5, N.D5,
        N.Ds5, N.D5, N.C5, N.A4, N.G4, N.E4, N.D4, N.C4,  N.A3, N.C4, N.D4, N.Ds4, N.E4, N.G4, N.A4, N.REST
      ],
      harmonyNotes: [
        N.E5, N.REST, N.G5, N.REST, N.A5, N.REST, N.G5, N.REST, N.E5, N.REST, N.D5, N.REST, N.C5, N.REST, N.D5, N.REST,
        N.E5, N.REST, N.A5, N.REST, N.C6, N.REST, N.A5, N.REST, N.G5, N.REST, N.A5, N.REST, N.C6, N.REST, N.A5, N.REST,
        N.C6, N.REST, N.B5, N.REST, N.A5, N.REST, N.G5, N.REST, N.E5, N.REST, N.G5, N.REST, N.A5, N.REST, N.G5, N.REST,
        N.A5, N.REST, N.G5, N.REST, N.E5, N.REST, N.D5, N.REST, N.C5, N.REST, N.E5, N.REST, N.A5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.A2, N.A2, N.C3, N.A2, N.D3, N.D3, N.Ds3, N.D3, N.A2, N.A2, N.G2, N.A2, N.C3, N.C3, N.G2, N.A2,
        N.A2, N.A2, N.C3, N.A2, N.E3, N.E3, N.D3, N.C3, N.D3, N.D3, N.E3, N.G3, N.A3, N.A3, N.G3, N.E3,
        N.F2, N.F3, N.G2, N.G3, N.A2, N.A3, N.C3, N.A2, N.D3, N.D3, N.E3, N.G3, N.A3, N.A3, N.G3, N.E3,
        N.F2, N.F2, N.G2, N.G2, N.Gs2, N.Gs2, N.A2, N.C3, N.A2, N.A2, N.C3, N.A2, N.G2, N.G2, N.E2, N.A2
      ],
      drumPattern: [
        4, 1, 5, 1, 4, 2, 5, 1, 4, 1, 5, 1, 4, 4, 5, 1,
        4, 1, 5, 1, 4, 1, 5, 2, 4, 4, 5, 1, 4, 4, 5, 4,
        4, 1, 5, 1, 4, 2, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 4, 5, 1, 4, 2, 5, 2, 4, 4, 5, 4, 5, 5, 4, 5
      ],
    },

    // ZONE 2 · ACT 1: SAKURA FOREST (Traditional Hirajoshi Modal Pentatonic with Modern Groovy Beat, 64 steps)
    sakuraAct1: {
      tempo: 122,
      leadWave: 'sine',
      harmonyWave: 'triangle',
      bassWave: 'triangle',
      // D Insen / Hirajoshi Scale: D, Eb, G, A, Bb, D
      leadNotes: [
        N.D4, N.Ds4, N.G4, N.A4, N.As4, N.A4, N.G4, N.Ds4,  N.G4, N.A4, N.D5, N.C5, N.As4, N.A4, N.G4, N.D4,
        N.Ds4, N.G4, N.A4, N.As4, N.D5, N.As4, N.A4, N.G4,  N.A4, N.As4, N.D5, N.Ds5, N.D5, N.As4, N.A4, N.G4,
        N.D5, N.Ds5, N.G5, N.A5, N.G5, N.Ds5, N.D5, N.As4,  N.A4, N.As4, N.D5, N.As4, N.A4, N.G4, N.Ds4, N.D4,
        N.G4, N.A4, N.As4, N.D5, N.Ds5, N.D5, N.As4, N.A4,  N.G4, N.Ds4, N.D4, N.Ds4, N.G4, N.A4, N.D4, N.REST
      ],
      harmonyNotes: [
        N.A4, N.REST, N.As4, N.REST, N.D5, N.REST, N.Ds5, N.REST, N.D5, N.REST, N.As4, N.REST, N.A4, N.REST, N.G4, N.REST,
        N.Ds4, N.REST, N.G4, N.REST, N.A4, N.REST, N.As4, N.REST, N.A4, N.REST, N.As4, N.REST, N.D5, N.REST, N.As4, N.REST,
        N.D5, N.REST, N.Ds5, N.REST, N.G5, N.REST, N.Ds5, N.REST, N.A4, N.REST, N.As4, N.REST, N.D5, N.REST, N.As4, N.REST,
        N.G4, N.REST, N.A4, N.REST, N.As4, N.REST, N.D5, N.REST, N.G4, N.REST, N.Ds4, N.REST, N.D4, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.D2, N.D3, N.Ds2, N.Ds3, N.G2, N.G3, N.A2, N.A3, N.G2, N.G3, N.Ds2, N.Ds3, N.D2, N.D3, N.C2, N.D2,
        N.Ds2, N.Ds3, N.G2, N.G3, N.A2, N.A3, N.As2, N.As3, N.A2, N.A3, N.G2, N.G3, N.Ds2, N.Ds3, N.D2, N.Ds2,
        N.D2, N.D3, N.G2, N.G3, N.As2, N.As3, N.A2, N.A3, N.G2, N.G3, N.Ds2, N.Ds3, N.D2, N.D3, N.C2, N.D2,
        N.G2, N.G3, N.A2, N.A3, N.As2, N.As3, N.A2, N.A3, N.G2, N.G3, N.Ds2, N.Ds3, N.D2, N.D3, N.C2, N.D2
      ],
      drumPattern: [
        2, 1, 1, 3, 2, 1, 1, 3, 2, 1, 1, 3, 2, 2, 3, 1,
        2, 1, 1, 3, 2, 1, 1, 3, 2, 1, 4, 3, 2, 2, 5, 1,
        4, 1, 1, 3, 2, 1, 1, 3, 4, 1, 1, 3, 4, 2, 5, 1,
        2, 1, 1, 3, 2, 1, 1, 3, 2, 2, 3, 3, 2, 4, 5, 1
      ],
    },

    // ZONE 2 · BOSS: SAKURA NINJA BOSS (High-octane Ninja Blade Duel, 64 steps)
    sakuraBoss: {
      tempo: 154,
      leadWave: 'triangle',
      harmonyWave: 'sawtooth',
      bassWave: 'sawtooth',
      leadNotes: [
        N.D4, N.F4, N.A4, N.C5, N.D5, N.C5, N.A4, N.F4,  N.E4, N.G4, N.B4, N.D5, N.E5, N.D5, N.B4, N.G4,
        N.F4, N.A4, N.C5, N.E5, N.F5, N.E5, N.C5, N.A4,  N.A4, N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.C5,
        N.D5, N.F5, N.A5, N.C6, N.B5, N.A5, N.F5, N.D5,  N.E5, N.G5, N.B5, N.D6, N.C6, N.B5, N.G5, N.E5,
        N.D5, N.C5, N.A4, N.F4, N.G4, N.E4, N.D4, N.C4,  N.D4, N.F4, N.A4, N.C5, N.D5, N.E5, N.D5, N.REST
      ],
      harmonyNotes: [
        N.D5, N.REST, N.F5, N.REST, N.A5, N.REST, N.F5, N.REST, N.E5, N.REST, N.G5, N.REST, N.B5, N.REST, N.G5, N.REST,
        N.F5, N.REST, N.A5, N.REST, N.C6, N.REST, N.A5, N.REST, N.A5, N.REST, N.C6, N.REST, N.E6, N.REST, N.C6, N.REST,
        N.D6, N.REST, N.F6, N.REST, N.A6, N.REST, N.F6, N.REST, N.E6, N.REST, N.G6, N.REST, N.B6, N.REST, N.G6, N.REST,
        N.D6, N.REST, N.C6, N.REST, N.A5, N.REST, N.F5, N.REST, N.D5, N.REST, N.F5, N.REST, N.A5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.D2, N.D2, N.F2, N.D2, N.E2, N.E2, N.G2, N.E2, N.C2, N.C2, N.D2, N.C2, N.D2, N.D2, N.F2, N.D2,
        N.F2, N.F2, N.A2, N.F2, N.A2, N.A2, N.C3, N.A2, N.E2, N.E2, N.G2, N.E2, N.D2, N.D2, N.C2, N.D2,
        N.D2, N.D2, N.F2, N.A2, N.E2, N.E2, N.G2, N.A2, N.C2, N.C2, N.E2, N.G2, N.D2, N.D2, N.F2, N.D2,
        N.F2, N.F2, N.E2, N.D2, N.C2, N.C2, N.A1, N.C2, N.D2, N.D2, N.F2, N.D2, N.E2, N.E2, N.D2, N.D2
      ],
      drumPattern: [
        4, 1, 5, 1, 4, 1, 5, 2, 4, 1, 5, 1, 4, 4, 5, 4,
        4, 1, 5, 1, 4, 2, 5, 1, 4, 1, 5, 2, 4, 4, 5, 5,
        4, 1, 5, 1, 4, 4, 5, 2, 4, 1, 5, 1, 4, 4, 5, 4,
        4, 4, 5, 2, 4, 2, 5, 2, 4, 4, 5, 5, 4, 5, 5, 5
      ],
    },

    // ZONE 3 · ACT 1: LAVACLIFF VOLCANO (Heavy Magma Funk & Chiptune Rock, 64 steps)
    lavacliffAct1: {
      tempo: 144,
      leadWave: 'sawtooth',
      harmonyWave: 'square',
      bassWave: 'sawtooth',
      leadNotes: [
        N.A3, N.C4, N.D4, N.E4, N.G4, N.E4, N.D4, N.C4,  N.B3, N.D4, N.E4, N.Fs4, N.A4, N.Fs4, N.E4, N.D4,
        N.C4, N.E4, N.G4, N.A4, N.C5, N.A4, N.G4, N.E4,  N.E4, N.G4, N.A4, N.C5, N.E5, N.C5, N.A4, N.G4,
        N.A4, N.C5, N.D5, N.E5, N.G5, N.E5, N.D5, N.C5,  N.B4, N.D5, N.E5, N.Fs5, N.A5, N.Fs5, N.E5, N.D5,
        N.C5, N.A4, N.G4, N.E4, N.Fs4, N.E4, N.D4, N.C4, N.A3, N.C4, N.E4, N.G4, N.A4, N.C5, N.A4, N.REST
      ],
      harmonyNotes: [
        N.A4, N.REST, N.C5, N.REST, N.D5, N.REST, N.C5, N.REST, N.B4, N.REST, N.D5, N.REST, N.Fs5, N.REST, N.D5, N.REST,
        N.C5, N.REST, N.E5, N.REST, N.G5, N.REST, N.E5, N.REST, N.E5, N.REST, N.G5, N.REST, N.A5, N.REST, N.G5, N.REST,
        N.A5, N.REST, N.C6, N.REST, N.D6, N.REST, N.C6, N.REST, N.B5, N.REST, N.D6, N.REST, N.Fs6, N.REST, N.D6, N.REST,
        N.C6, N.REST, N.A5, N.REST, N.G5, N.REST, N.E5, N.REST, N.A4, N.REST, N.C5, N.REST, N.E5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.A2, N.A2, N.C3, N.A2, N.D3, N.D3, N.C3, N.A2, N.B2, N.B2, N.D3, N.B2, N.A2, N.A2, N.G2, N.A2,
        N.C2, N.C3, N.E3, N.C3, N.D3, N.D3, N.F3, N.D3, N.E3, N.E3, N.G3, N.E3, N.D3, N.D3, N.C3, N.A2,
        N.A2, N.A2, N.C3, N.D3, N.E3, N.E3, N.D3, N.C3, N.B2, N.B2, N.D3, N.E3, N.F3, N.F3, N.E3, N.D3,
        N.C3, N.C3, N.A2, N.G2, N.B2, N.B2, N.A2, N.G2, N.A2, N.A2, N.C3, N.A2, N.B2, N.B2, N.A2, N.A2
      ],
      drumPattern: [
        4, 1, 3, 1, 2, 4, 5, 1, 4, 1, 3, 1, 2, 4, 5, 2,
        4, 1, 3, 1, 2, 4, 5, 1, 4, 2, 3, 1, 4, 4, 5, 4,
        4, 1, 5, 1, 4, 2, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 2, 3, 1, 2, 4, 5, 2, 4, 4, 5, 5, 4, 4, 5, 5
      ],
    },

    // ZONE 3 · BOSS: IGNIS COLOSSUS (Heavy Metal Magma Boss Battle, 64 steps)
    lavacliffBoss: {
      tempo: 156,
      leadWave: 'sawtooth',
      harmonyWave: 'sawtooth',
      bassWave: 'square',
      leadNotes: [
        N.E3, N.G3, N.A3, N.B3, N.D4, N.B3, N.A3, N.G3,  N.F3, N.A3, N.B3, N.E4, N.F4, N.E4, N.B3, N.A3,
        N.G3, N.B3, N.D4, N.Fs4, N.G4, N.Fs4, N.D4, N.B3, N.A3, N.C4, N.E4, N.G4, N.A4, N.G4, N.E4, N.C4,
        N.E4, N.G4, N.A4, N.B4, N.D5, N.B4, N.A4, N.G4,  N.F4, N.A4, N.B4, N.E5, N.F5, N.E5, N.B4, N.A4,
        N.G4, N.Fs4, N.E4, N.D4, N.B3, N.A3, N.G3, N.F3, N.E3, N.G3, N.A3, N.B3, N.D4, N.E4, N.A3, N.REST
      ],
      harmonyNotes: [
        N.E4, N.REST, N.G4, N.REST, N.A4, N.REST, N.B4, N.REST, N.F4, N.REST, N.A4, N.REST, N.B4, N.REST, N.E5, N.REST,
        N.G4, N.REST, N.B4, N.REST, N.D5, N.REST, N.Fs5, N.REST, N.A4, N.REST, N.C5, N.REST, N.E5, N.REST, N.G5, N.REST,
        N.E5, N.REST, N.G5, N.REST, N.A5, N.REST, N.B5, N.REST, N.F5, N.REST, N.A5, N.REST, N.B5, N.REST, N.E6, N.REST,
        N.G5, N.REST, N.Fs5, N.REST, N.E5, N.REST, N.D5, N.REST, N.A4, N.REST, N.B4, N.REST, N.E5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.E2, N.E2, N.G2, N.E2, N.A2, N.A2, N.G2, N.E2, N.F2, N.F2, N.A2, N.F2, N.E2, N.E2, N.D2, N.E2,
        N.G2, N.G2, N.B2, N.G2, N.A2, N.A2, N.C3, N.A2, N.F2, N.F2, N.A2, N.F2, N.E2, N.E2, N.D2, N.E2,
        N.E2, N.E2, N.G2, N.A2, N.F2, N.F2, N.A2, N.B2, N.G2, N.G2, N.B2, N.D3, N.A2, N.A2, N.G2, N.E2,
        N.G2, N.G2, N.F2, N.E2, N.D2, N.D2, N.E2, N.F2, N.E2, N.E2, N.G2, N.E2, N.D2, N.D2, N.C2, N.D2
      ],
      drumPattern: [
        4, 1, 5, 1, 4, 2, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 1, 5, 1, 4, 2, 5, 2, 4, 4, 5, 1, 4, 4, 5, 5,
        4, 1, 5, 1, 4, 4, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 4, 5, 2, 4, 2, 5, 2, 4, 4, 5, 5, 5, 5, 4, 5
      ],
    },

    // ZONE 4 · ACT 1: DESERT SANCTUARY (Egyptian Phrygian Dominant Scale with Arabian Funk Bass, 64 steps)
    desertAct1: {
      tempo: 128,
      leadWave: 'triangle',
      harmonyWave: 'sine',
      bassWave: 'sawtooth',
      // D Phrygian Dominant: D, Eb, F#, G, A, Bb, C
      leadNotes: [
        N.D4, N.Ds4, N.Fs4, N.G4, N.A4, N.G4, N.Fs4, N.Ds4, N.Fs4, N.A4, N.B4, N.Cs5, N.D5, N.B4, N.A4, N.Fs4,
        N.Ds4, N.Fs4, N.G4, N.A4, N.B4, N.A4, N.G4, N.Fs4,  N.G4, N.A4, N.Cs5, N.D5, N.Ds5, N.D5, N.Cs5, N.A4,
        N.D5, N.Ds5, N.Fs5, N.G5, N.A5, N.G5, N.Fs5, N.Ds5, N.Fs5, N.A5, N.B5, N.Cs6, N.D6, N.B5, N.A5, N.Fs5,
        N.Ds5, N.D5, N.Cs5, N.B4, N.A4, N.G4, N.Fs4, N.Ds4, N.D4, N.Fs4, N.A4, N.Cs5, N.D5, N.A4, N.Fs4, N.REST
      ],
      harmonyNotes: [
        N.D5, N.REST, N.Ds5, N.REST, N.Fs5, N.REST, N.Ds5, N.REST, N.Fs5, N.REST, N.A5, N.REST, N.B5, N.REST, N.A5, N.REST,
        N.Ds5, N.REST, N.Fs5, N.REST, N.A5, N.REST, N.Fs5, N.REST, N.G5, N.REST, N.A5, N.REST, N.Cs6, N.REST, N.A5, N.REST,
        N.D6, N.REST, N.Ds6, N.REST, N.Fs6, N.REST, N.Ds6, N.REST, N.Fs6, N.REST, N.A6, N.REST, N.B6, N.REST, N.A6, N.REST,
        N.Ds6, N.REST, N.D6, N.REST, N.A5, N.REST, N.Fs5, N.REST, N.D5, N.REST, N.Fs5, N.REST, N.A5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.D2, N.D3, N.Ds2, N.D2, N.Fs2, N.Fs3, N.Ds2, N.D2, N.Fs2, N.Fs3, N.A2, N.Fs2, N.D2, N.D2, N.C2, N.D2,
        N.Ds2, N.Ds3, N.Fs2, N.Ds2, N.G2, N.G3, N.Fs2, N.Ds2, N.G2, N.G3, N.A2, N.G2, N.D2, N.D2, N.C2, N.D2,
        N.D2, N.D3, N.Fs2, N.G2, N.A2, N.A3, N.G2, N.Fs2, N.Ds2, N.Ds3, N.Fs2, N.A2, N.Fs2, N.Fs2, N.D2, N.D2,
        N.Fs2, N.Fs3, N.Ds2, N.D2, N.C2, N.C3, N.D2, N.Ds2, N.D2, N.D2, N.Fs2, N.D2, N.C2, N.C2, N.A1, N.D2
      ],
      drumPattern: [
        2, 1, 3, 1, 2, 2, 3, 1, 2, 1, 3, 1, 2, 4, 5, 1,
        2, 1, 3, 1, 2, 1, 3, 2, 2, 1, 3, 1, 4, 2, 5, 1,
        4, 1, 5, 1, 2, 2, 5, 1, 4, 1, 5, 1, 4, 4, 5, 2,
        2, 1, 3, 1, 2, 2, 3, 1, 4, 4, 5, 5, 2, 3, 5, 1
      ],
    },

    // ZONE 4 · ACT 2: PHARAOH'S TOMB (Mystical Arcane Egyptian Mystery, 64 steps)
    desertAct2: {
      tempo: 134,
      leadWave: 'sawtooth',
      harmonyWave: 'triangle',
      bassWave: 'square',
      leadNotes: [
        N.A3, N.As3, N.Cs4, N.D4, N.E4, N.D4, N.Cs4, N.As3, N.C4, N.D4, N.E4, N.G4, N.A4, N.G4, N.E4, N.Cs4,
        N.As3, N.Cs4, N.D4, N.F4, N.Fs4, N.F4, N.D4, N.Cs4, N.D4, N.E4, N.G4, N.A4, N.As4, N.A4, N.G4, N.E4,
        N.A4, N.As4, N.Cs5, N.D5, N.E5, N.D5, N.Cs5, N.As4, N.C5, N.D5, N.E5, N.G5, N.A5, N.G5, N.E5, N.Cs5,
        N.As4, N.A4, N.G4, N.E4, N.D4, N.Cs4, N.C4, N.As3, N.A3, N.Cs4, N.E4, N.G4, N.A4, N.E4, N.Cs4, N.REST
      ],
      harmonyNotes: [
        N.A4, N.REST, N.As4, N.REST, N.Cs5, N.REST, N.As4, N.REST, N.C5, N.REST, N.D5, N.REST, N.E5, N.REST, N.D5, N.REST,
        N.As4, N.REST, N.Cs5, N.REST, N.D5, N.REST, N.Cs5, N.REST, N.D5, N.REST, N.E5, N.REST, N.G5, N.REST, N.E5, N.REST,
        N.A5, N.REST, N.As5, N.REST, N.Cs6, N.REST, N.As5, N.REST, N.C6, N.REST, N.D6, N.REST, N.E6, N.REST, N.D6, N.REST,
        N.As5, N.REST, N.A5, N.REST, N.G5, N.REST, N.E5, N.REST, N.A4, N.REST, N.Cs5, N.REST, N.E5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.A2, N.A2, N.As2, N.A2, N.Cs3, N.Cs3, N.As2, N.A2, N.C3, N.C3, N.D3, N.C3, N.A2, N.A2, N.G2, N.A2,
        N.As2, N.As2, N.Cs3, N.As2, N.D3, N.D3, N.Cs3, N.As2, N.D3, N.D3, N.E3, N.D3, N.A2, N.A2, N.G2, N.A2,
        N.A2, N.A2, N.Cs3, N.D3, N.E3, N.E3, N.D3, N.Cs3, N.C3, N.C3, N.D3, N.E3, N.F3, N.F3, N.E3, N.Cs3,
        N.Cs3, N.Cs3, N.As2, N.A2, N.G2, N.G2, N.A2, N.As2, N.A2, N.A2, N.Cs3, N.A2, N.G2, N.G2, N.F2, N.G2
      ],
      drumPattern: [
        4, 1, 5, 1, 2, 4, 5, 1, 4, 1, 5, 1, 4, 2, 5, 1,
        4, 1, 5, 1, 2, 4, 5, 2, 4, 1, 5, 1, 4, 4, 5, 2,
        4, 1, 5, 1, 4, 2, 5, 2, 4, 1, 5, 1, 4, 4, 5, 4,
        4, 2, 5, 1, 2, 4, 5, 2, 4, 4, 5, 5, 4, 2, 5, 1
      ],
    },

    // ZONE 4 · BOSS: PHARAOH AKHEN'RA (Furious High Energy Pharaoh Climax, 64 steps)
    desertBoss: {
      tempo: 152,
      leadWave: 'sawtooth',
      harmonyWave: 'square',
      bassWave: 'sawtooth',
      leadNotes: [
        N.D3, N.Ds3, N.Fs3, N.A3, N.B3, N.A3, N.Fs3, N.Ds3, N.Fs3, N.A3, N.Cs4, N.D4, N.Fs4, N.D4, N.B3, N.Fs3,
        N.Ds3, N.Fs3, N.A3, N.Cs4, N.Ds4, N.Cs4, N.A3, N.Fs3, N.A3, N.B3, N.D4, N.Fs4, N.A4, N.Fs4, N.D4, N.B3,
        N.D4, N.Ds4, N.Fs4, N.A4, N.B4, N.A4, N.Fs4, N.Ds4, N.Fs4, N.A4, N.Cs5, N.D5, N.Fs5, N.D5, N.B4, N.Fs4,
        N.Ds4, N.D4, N.B3, N.A3, N.Fs3, N.Ds3, N.D3, N.C3, N.D3, N.Fs3, N.A3, N.Cs4, N.D4, N.Fs4, N.A3, N.REST
      ],
      harmonyNotes: [
        N.D4, N.REST, N.Ds4, N.REST, N.Fs4, N.REST, N.Ds4, N.REST, N.Fs4, N.REST, N.A4, N.REST, N.Cs5, N.REST, N.A4, N.REST,
        N.Ds4, N.REST, N.Fs4, N.REST, N.A4, N.REST, N.Fs4, N.REST, N.A4, N.REST, N.B4, N.REST, N.D5, N.REST, N.B4, N.REST,
        N.D5, N.REST, N.Ds5, N.REST, N.Fs5, N.REST, N.Ds5, N.REST, N.Fs5, N.REST, N.A5, N.REST, N.Cs6, N.REST, N.A5, N.REST,
        N.Ds5, N.REST, N.D5, N.REST, N.A4, N.REST, N.Fs4, N.REST, N.D4, N.REST, N.Fs4, N.REST, N.A4, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.D2, N.D2, N.Ds2, N.D2, N.Fs2, N.Fs2, N.Ds2, N.D2, N.Fs2, N.Fs2, N.A2, N.Fs2, N.D2, N.D2, N.C2, N.D2,
        N.Ds2, N.Ds2, N.Fs2, N.Ds2, N.A2, N.A2, N.Fs2, N.Ds2, N.A2, N.A2, N.B2, N.A2, N.D2, N.D2, N.C2, N.D2,
        N.D2, N.D2, N.Fs2, N.A2, N.B2, N.B2, N.A2, N.Fs2, N.Ds2, N.Ds2, N.Fs2, N.A2, N.Cs3, N.Cs3, N.A2, N.Ds2,
        N.Fs2, N.Fs2, N.Ds2, N.D2, N.C2, N.C2, N.D2, N.Ds2, N.D2, N.D2, N.Fs2, N.D2, N.C2, N.C2, N.A1, N.C2
      ],
      drumPattern: [
        4, 1, 5, 1, 4, 4, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 1, 5, 1, 4, 2, 5, 2, 4, 4, 5, 1, 4, 4, 5, 5,
        4, 1, 5, 1, 4, 4, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 4, 5, 2, 4, 2, 5, 2, 4, 4, 5, 5, 5, 5, 4, 5
      ],
    },

    // ZONE 5 · ACT 1: KRONO CITY HIGHWAY (Darksynth Synthwave Cyber Drive, 64 steps)
    kronoAct1: {
      tempo: 142,
      leadWave: 'sawtooth',
      harmonyWave: 'triangle',
      bassWave: 'sawtooth',
      leadNotes: [
        N.E4, N.G4, N.B4, N.D5, N.C5, N.B4, N.G4, N.E4,  N.Fs4, N.A4, N.Cs5, N.E5, N.D5, N.B4, N.A4, N.Fs4,
        N.G4, N.B4, N.D5, N.E5, N.G5, N.E5, N.D5, N.B4,  N.A4, N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.C5,
        N.E5, N.G5, N.B5, N.D6, N.C6, N.B5, N.G5, N.E5,  N.Fs5, N.A5, N.Cs6, N.E6, N.D6, N.B5, N.A5, N.Fs5,
        N.D5, N.C5, N.B4, N.A4, N.G4, N.Fs4, N.E4, N.D4, N.E4, N.G4, N.B4, N.D5, N.E5, N.B4, N.G4, N.REST
      ],
      harmonyNotes: [
        N.E5, N.REST, N.G5, N.REST, N.B5, N.REST, N.G5, N.REST, N.Fs5, N.REST, N.A5, N.REST, N.Cs6, N.REST, N.A5, N.REST,
        N.G5, N.REST, N.B5, N.REST, N.D6, N.REST, N.B5, N.REST, N.A5, N.REST, N.C6, N.REST, N.E6, N.REST, N.C6, N.REST,
        N.E6, N.REST, N.G6, N.REST, N.B6, N.REST, N.G6, N.REST, N.Fs6, N.REST, N.A6, N.REST, N.Cs6, N.REST, N.A6, N.REST,
        N.D6, N.REST, N.C6, N.REST, N.B5, N.REST, N.A5, N.REST, N.E5, N.REST, N.G5, N.REST, N.B5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.E2, N.E2, N.G2, N.E2, N.A2, N.A2, N.B2, N.E2, N.Fs2, N.Fs2, N.A2, N.Fs2, N.E2, N.E2, N.D2, N.E2,
        N.G2, N.G2, N.B2, N.G2, N.C3, N.C3, N.E3, N.G2, N.A2, N.A2, N.C3, N.A2, N.E2, N.E2, N.D2, N.E2,
        N.E2, N.E2, N.A2, N.B2, N.D3, N.D3, N.B2, N.A2, N.Fs2, N.Fs2, N.A2, N.Cs3, N.D3, N.D3, N.B2, N.Fs2,
        N.A2, N.A2, N.G2, N.E2, N.D2, N.D2, N.E2, N.Fs2, N.E2, N.E2, N.G2, N.E2, N.D2, N.D2, N.C2, N.D2
      ],
      drumPattern: [
        4, 1, 5, 1, 4, 1, 5, 2, 4, 1, 5, 1, 4, 4, 5, 1,
        4, 1, 5, 1, 4, 2, 5, 1, 4, 1, 5, 2, 4, 4, 5, 4,
        4, 1, 5, 1, 4, 1, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 2, 5, 1, 4, 4, 5, 2, 4, 4, 5, 4, 5, 5, 4, 5
      ],
    },

    // ZONE 5 · ACT 2: FUSION REACTOR (Industrial Techno FM Sound, Chemical Plant vibe, 64 steps)
    kronoAct2: {
      tempo: 148,
      leadWave: 'square',
      harmonyWave: 'sawtooth',
      bassWave: 'square',
      leadNotes: [
        N.A3, N.C4, N.E4, N.A4, N.G4, N.E4, N.C4, N.A3, N.G3, N.B3, N.E4, N.G4, N.E4, N.B3, N.G3, N.F3,
        N.A3, N.D4, N.F4, N.A4, N.C5, N.A4, N.F4, N.D4, N.B3, N.E4, N.G4, N.B4, N.D5, N.B4, N.G4, N.E4,
        N.A4, N.C5, N.E5, N.A5, N.G5, N.E5, N.C5, N.A4, N.G4, N.B4, N.E5, N.G5, N.E5, N.B4, N.G4, N.F4,
        N.A4, N.G4, N.E4, N.C4, N.D4, N.B3, N.A3, N.G3, N.A3, N.C4, N.E4, N.A4, N.E4, N.C4, N.A3, N.REST
      ],
      harmonyNotes: [
        N.A4, N.REST, N.C5, N.REST, N.E5, N.REST, N.C5, N.REST, N.G4, N.REST, N.B4, N.REST, N.E5, N.REST, N.B4, N.REST,
        N.A4, N.REST, N.D5, N.REST, N.F5, N.REST, N.D5, N.REST, N.B4, N.REST, N.E5, N.REST, N.G5, N.REST, N.E5, N.REST,
        N.A5, N.REST, N.C6, N.REST, N.E6, N.REST, N.C6, N.REST, N.G5, N.REST, N.B5, N.REST, N.E6, N.REST, N.B5, N.REST,
        N.A5, N.REST, N.G5, N.REST, N.E5, N.REST, N.C5, N.REST, N.A4, N.REST, N.C5, N.REST, N.E5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.A1, N.A1, N.C2, N.A1, N.D2, N.D2, N.E2, N.A1, N.G1, N.G1, N.B1, N.G1, N.A1, N.A1, N.F1, N.A1,
        N.A1, N.A1, N.D2, N.A1, N.F2, N.F2, N.A2, N.A1, N.B1, N.B1, N.E2, N.B1, N.A1, N.A1, N.F1, N.A1,
        N.A1, N.A1, N.E2, N.A2, N.G2, N.G2, N.E2, N.C2, N.G1, N.G1, N.B1, N.E2, N.D2, N.D2, N.B1, N.G1,
        N.D2, N.D2, N.C2, N.A1, N.G1, N.G1, N.A1, N.B1, N.A1, N.A1, N.D2, N.A1, N.G1, N.G1, N.E1, N.G1
      ],
      drumPattern: [
        4, 1, 5, 1, 4, 4, 5, 1, 4, 1, 5, 1, 4, 4, 5, 4,
        4, 1, 5, 1, 4, 2, 5, 1, 4, 1, 5, 2, 4, 4, 5, 4,
        4, 1, 5, 1, 4, 4, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 4, 5, 1, 4, 2, 5, 2, 4, 4, 5, 4, 5, 5, 4, 5
      ],
    },

    // ZONE 5 · FINAL BOSS: TITAN KRONOS-Ω (Grand 16-bit Final Boss Symphony, 64 steps)
    kronoBoss: {
      tempo: 160,
      leadWave: 'sawtooth',
      harmonyWave: 'sawtooth',
      bassWave: 'sawtooth',
      leadNotes: [
        N.E3, N.G3, N.B3, N.E4, N.Fs4, N.E4, N.B3, N.G3, N.A3, N.C4, N.E4, N.G4, N.A4, N.G4, N.E4, N.A3,
        N.G3, N.B3, N.E4, N.G4, N.B4, N.G4, N.E4, N.B3, N.B3, N.E4, N.G4, N.B4, N.D5, N.B4, N.G4, N.E4,
        N.E4, N.G4, N.B4, N.E5, N.Fs5, N.E5, N.B4, N.G4, N.A4, N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.A4,
        N.B4, N.A4, N.G4, N.E4, N.D4, N.B3, N.A3, N.G3, N.E3, N.A3, N.C4, N.E4, N.Fs4, N.A4, N.E4, N.REST
      ],
      harmonyNotes: [
        N.E4, N.REST, N.G4, N.REST, N.B4, N.REST, N.E5, N.REST, N.A4, N.REST, N.C5, N.REST, N.E5, N.REST, N.G5, N.REST,
        N.G4, N.REST, N.B4, N.REST, N.E5, N.REST, N.G5, N.REST, N.B4, N.REST, N.E5, N.REST, N.G5, N.REST, N.B5, N.REST,
        N.E5, N.REST, N.G5, N.REST, N.B5, N.REST, N.E6, N.REST, N.A5, N.REST, N.C6, N.REST, N.E6, N.REST, N.G6, N.REST,
        N.B5, N.REST, N.A5, N.REST, N.G5, N.REST, N.E5, N.REST, N.E4, N.REST, N.A4, N.REST, N.E5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.E1, N.E1, N.G1, N.E1, N.A1, N.A1, N.B1, N.E1, N.A1, N.A1, N.C2, N.A1, N.E1, N.E1, N.D1, N.E1,
        N.G1, N.G1, N.B1, N.G1, N.D2, N.D2, N.G2, N.G1, N.B1, N.B1, N.D2, N.B1, N.E1, N.E1, N.D1, N.E1,
        N.E1, N.E1, N.B1, N.D2, N.E2, N.E2, N.D2, N.B1, N.A1, N.A1, N.D2, N.F2, N.G2, N.G2, N.F2, N.A1,
        N.D2, N.D2, N.B1, N.G1, N.E1, N.E1, N.G1, N.A1, N.E1, N.E1, N.A1, N.E1, N.D1, N.D1, N.C1, N.D1
      ],
      drumPattern: [
        4, 1, 5, 1, 4, 4, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 1, 5, 1, 4, 2, 5, 2, 4, 4, 5, 1, 4, 4, 5, 5,
        4, 1, 5, 1, 4, 4, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        4, 4, 5, 2, 4, 2, 5, 2, 4, 4, 5, 5, 5, 5, 4, 5
      ],
    },

    // GRAND MULTI-ZONE MEDLEY: KRONOS TRAVEL (128 steps - 8 measures multi-biome journey!)
    kronosTravel: {
      tempo: 144,
      leadWave: 'sawtooth',
      harmonyWave: 'triangle',
      bassWave: 'sawtooth',
      leadNotes: [
        // Bars 1-2: Neon Forest Cyber Motifs (C Major Pop)
        N.C4, N.E4, N.G4, N.C5, N.E5, N.C5, N.G4, N.E4,  N.D4, N.F4, N.A4, N.D5, N.C5, N.A4, N.F4, N.D4,
        N.E4, N.G4, N.C5, N.E5, N.G5, N.E5, N.C5, N.G4,  N.A4, N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.C5,
        // Bars 3-4: Sakura Oriental Hirajoshi Cadence (D Pentatonic)
        N.D4, N.Ds4, N.G4, N.A4, N.As4, N.A4, N.G4, N.Ds4, N.G4, N.A4, N.D5, N.C5, N.As4, N.A4, N.G4, N.D4,
        N.Ds4, N.G4, N.A4, N.As4, N.D5, N.Ds5, N.D5, N.As4, N.A4, N.As4, N.D5, N.G5, N.Ds5, N.D5, N.As4, N.G4,
        // Bars 5-6: Lavacliff Heavy Magma Riff (A Minor Rock)
        N.A3, N.C4, N.D4, N.E4, N.G4, N.E4, N.D4, N.C4,  N.B3, N.D4, N.E4, N.Fs4, N.A4, N.Fs4, N.E4, N.D4,
        N.E4, N.G4, N.A4, N.C5, N.E5, N.C5, N.A4, N.G4,  N.A4, N.C5, N.E5, N.Fs5, N.A5, N.Fs5, N.E5, N.C5,
        // Bars 7-8: Desert Phrygian Arc & Krono Quantum Climax
        N.D4, N.Ds4, N.Fs4, N.G4, N.A4, N.G4, N.Fs4, N.Ds4, N.Fs4, N.A4, N.Cs5, N.D5, N.Fs5, N.D5, N.Cs5, N.A4,
        N.D5, N.E5, N.G5, N.B5, N.C6, N.B5, N.G5, N.E5, N.Fs5, N.A5, N.Cs6, N.D6, N.E6, N.D6, N.A5, N.REST
      ],
      harmonyNotes: [
        N.C5, N.REST, N.E5, N.REST, N.G5, N.REST, N.E5, N.REST, N.D5, N.REST, N.F5, N.REST, N.A5, N.REST, N.F5, N.REST,
        N.E5, N.REST, N.G5, N.REST, N.C6, N.REST, N.G5, N.REST, N.A5, N.REST, N.C6, N.REST, N.E6, N.REST, N.C6, N.REST,
        N.D5, N.REST, N.Ds5, N.REST, N.G5, N.REST, N.A5, N.REST, N.G5, N.REST, N.A5, N.REST, N.As5, N.REST, N.A5, N.REST,
        N.Ds5, N.REST, N.G5, N.REST, N.A5, N.REST, N.As5, N.REST, N.A5, N.REST, N.As5, N.REST, N.D6, N.REST, N.As5, N.REST,
        N.A4, N.REST, N.C5, N.REST, N.D5, N.REST, N.C5, N.REST, N.B4, N.REST, N.D5, N.REST, N.Fs5, N.REST, N.D5, N.REST,
        N.E5, N.REST, N.G5, N.REST, N.A5, N.REST, N.G5, N.REST, N.A5, N.REST, N.C6, N.REST, N.Fs6, N.REST, N.C6, N.REST,
        N.D5, N.REST, N.Ds5, N.REST, N.Fs5, N.REST, N.Ds5, N.REST, N.Fs5, N.REST, N.A5, N.REST, N.Cs6, N.REST, N.A5, N.REST,
        N.D6, N.REST, N.E6, N.REST, N.G6, N.REST, N.E6, N.REST, N.Fs6, N.REST, N.A6, N.REST, N.Cs6, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.C2, N.C3, N.D2, N.C2, N.E2, N.E3, N.D2, N.C2, N.A1, N.A2, N.C2, N.A1, N.D2, N.D3, N.C2, N.A1,
        N.C2, N.C3, N.E2, N.C2, N.F2, N.F3, N.E2, N.C2, N.A1, N.A2, N.D2, N.A1, N.E2, N.E3, N.D2, N.A1,
        N.D2, N.D3, N.Ds2, N.D2, N.G2, N.G3, N.A2, N.G2, N.G2, N.G3, N.Ds2, N.D2, N.C2, N.C3, N.D2, N.Ds2,
        N.Ds2, N.Ds3, N.G2, N.Ds2, N.A2, N.A3, N.As2, N.A2, N.G2, N.G3, N.Ds2, N.D2, N.C2, N.C3, N.D2, N.D3,
        N.A1, N.A2, N.C2, N.A1, N.D2, N.D3, N.C2, N.A1, N.B1, N.B2, N.D2, N.B1, N.A1, N.A2, N.G1, N.A1,
        N.E2, N.E3, N.G2, N.E2, N.F2, N.F3, N.G2, N.E2, N.A1, N.A2, N.C2, N.D2, N.E2, N.E3, N.D2, N.A1,
        N.D2, N.D3, N.Ds2, N.D2, N.Fs2, N.Fs3, N.Ds2, N.D2, N.Fs2, N.Fs3, N.A2, N.Fs2, N.D2, N.D2, N.C2, N.D2,
        N.D2, N.D3, N.Fs2, N.A2, N.G2, N.G3, N.A2, N.B2, N.D2, N.D3, N.Fs2, N.A2, N.D2, N.D2, N.C2, N.D2
      ],
      drumPattern: [
        2, 1, 3, 1, 2, 4, 3, 1, 2, 1, 3, 1, 4, 1, 5, 1,
        4, 1, 5, 1, 4, 2, 5, 1, 4, 1, 5, 2, 4, 4, 5, 4,
        2, 1, 1, 3, 2, 1, 1, 3, 2, 1, 4, 3, 2, 2, 5, 1,
        4, 1, 1, 3, 2, 1, 1, 3, 4, 2, 5, 2, 4, 4, 5, 4,
        4, 1, 3, 1, 2, 4, 5, 1, 4, 1, 3, 1, 2, 4, 5, 2,
        4, 1, 5, 1, 4, 2, 5, 2, 4, 1, 5, 1, 4, 4, 5, 5,
        2, 1, 3, 1, 2, 2, 3, 1, 2, 1, 3, 1, 4, 4, 5, 1,
        4, 4, 5, 2, 4, 2, 5, 2, 4, 4, 5, 5, 5, 5, 4, 5
      ],
    },

    // CREDITS & EPILOGUE: ZION VICTORY HYMN (Upbeat Ending Pop Theme, 64 steps)
    creditsTune: {
      tempo: 126,
      leadWave: 'triangle',
      harmonyWave: 'sine',
      bassWave: 'sine',
      leadNotes: [
        N.C4, N.E4, N.G4, N.C5, N.E5, N.C5, N.G4, N.E4,  N.D4, N.Fs4, N.A4, N.D5, N.Fs5, N.D5, N.A4, N.Fs4,
        N.E4, N.G4, N.C5, N.E5, N.G5, N.E5, N.C5, N.G4,  N.G4, N.B4, N.D5, N.Fs5, N.A5, N.Fs5, N.D5, N.B4,
        N.C5, N.E5, N.G5, N.C6, N.B5, N.A5, N.G5, N.E5,  N.D5, N.Fs5, N.A5, N.D6, N.C6, N.B5, N.A5, N.Fs5,
        N.E5, N.D5, N.C5, N.A4, N.G4, N.E4, N.D4, N.C4,  N.C4, N.E4, N.G4, N.C5, N.E5, N.C5, N.C4, N.REST
      ],
      harmonyNotes: [
        N.C5, N.REST, N.E5, N.REST, N.G5, N.REST, N.E5, N.REST, N.D5, N.REST, N.Fs5, N.REST, N.A5, N.REST, N.Fs5, N.REST,
        N.E5, N.REST, N.G5, N.REST, N.C6, N.REST, N.E5, N.REST, N.G5, N.REST, N.B5, N.REST, N.D6, N.REST, N.B5, N.REST,
        N.C6, N.REST, N.E6, N.REST, N.G6, N.REST, N.E6, N.REST, N.D6, N.REST, N.Fs6, N.REST, N.A6, N.REST, N.Fs6, N.REST,
        N.B5, N.REST, N.A5, N.REST, N.G5, N.REST, N.E5, N.REST, N.C5, N.REST, N.E5, N.REST, N.G5, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.C2, N.C3, N.D2, N.D3, N.E2, N.E3, N.F2, N.G2, N.D2, N.D3, N.E2, N.E3, N.C2, N.C3, N.A1, N.C2,
        N.E2, N.E3, N.F2, N.E2, N.G2, N.G3, N.A2, N.G2, N.D2, N.D3, N.E2, N.D2, N.C2, N.C3, N.A1, N.C2,
        N.C2, N.C3, N.E2, N.G2, N.A2, N.A3, N.G2, N.E2, N.D2, N.D3, N.F2, N.A2, N.B2, N.B3, N.A2, N.D2,
        N.E2, N.E3, N.D2, N.C2, N.A1, N.A2, N.C2, N.D2, N.C2, N.C3, N.D2, N.E2, N.C2, N.C3, N.A1, N.C2
      ],
      drumPattern: [
        2, 1, 3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 4, 1, 5, 1,
        2, 1, 3, 1, 2, 4, 3, 1, 2, 1, 3, 1, 4, 2, 5, 1,
        4, 1, 5, 1, 2, 1, 5, 1, 4, 1, 5, 1, 4, 4, 5, 2,
        2, 1, 3, 1, 2, 2, 3, 1, 4, 4, 5, 5, 2, 4, 5, 1
      ],
    },

    // MAIN MENU: PRELUDIO DE KRONOS (Light, relaxing arcade chiptune melody, 64 steps)
    menuTheme: {
      tempo: 112,
      leadWave: 'triangle',
      harmonyWave: 'sine',
      bassWave: 'sine',
      leadNotes: [
        N.E5, N.G5, N.C6, N.B5,  N.A5, N.G5, N.E5, N.D5,
        N.E5, N.G5, N.A5, N.G5,  N.E5, N.D5, N.C5, N.D5,
        N.E5, N.G5, N.C6, N.D6,  N.E6, N.D6, N.C6, N.A5,
        N.G5, N.A5, N.G5, N.E5,  N.D5, N.E5, N.D5, N.REST,
        N.A4, N.C5, N.E5, N.G5,  N.A5, N.G5, N.E5, N.C5,
        N.D5, N.F5, N.A5, N.G5,  N.F5, N.E5, N.D5, N.C5,
        N.E5, N.G5, N.C6, N.B5,  N.A5, N.G5, N.E5, N.D5,
        N.C5, N.D5, N.E5, N.G5,  N.C6, N.REST, N.REST, N.REST
      ],
      harmonyNotes: [
        N.C5, N.REST, N.E5, N.REST, N.G5, N.REST, N.E5, N.REST, N.F5, N.REST, N.A5, N.REST, N.F5, N.REST, N.D5, N.REST,
        N.C5, N.REST, N.E5, N.REST, N.G5, N.REST, N.E5, N.REST, N.B4, N.REST, N.D5, N.REST, N.G5, N.REST, N.D5, N.REST,
        N.A4, N.REST, N.C5, N.REST, N.E5, N.REST, N.C5, N.REST, N.D5, N.REST, N.F5, N.REST, N.A5, N.REST, N.F5, N.REST,
        N.C5, N.REST, N.E5, N.REST, N.G5, N.REST, N.E5, N.REST, N.C5, N.REST, N.G5, N.REST, N.REST, N.REST, N.REST, N.REST
      ],
      bassNotes: [
        N.C2, N.C2, N.G1, N.C2, N.F1, N.F1, N.C2, N.F1, N.C2, N.C2, N.E1, N.G1, N.G1, N.G1, N.B1, N.D2,
        N.A1, N.A1, N.C2, N.E2, N.D2, N.D2, N.F1, N.A1, N.C2, N.C2, N.G1, N.C2, N.C2, N.G1, N.C2, N.REST
      ],
      drumPattern: [
        2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0,
        2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0,
        2, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0,
        2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0
      ],
    },
  };

  // High-precision Web Audio lookahead scheduler
  private scheduleNotes() {
    if (!this.ctx || !this.musicEnabled || !this.currentTrack || this.masterVolume <= 0) return;

    const track = this.trackThemes[this.currentTrack];
    if (!track) return;

    const secondsPerBeat = 60.0 / track.tempo;
    const stepDuration = secondsPerBeat / 4; // 16th notes

    // Schedule 160ms ahead of current audio context time for crystal-clear timing
    while (this.nextNoteTime < this.ctx.currentTime + 0.16) {
      const step = this.currentStep;
      const leadNote = track.leadNotes[step % track.leadNotes.length];
      const harmNote = track.harmonyNotes[step % track.harmonyNotes.length];
      const bassNote = track.bassNotes[Math.floor(step / 2) % track.bassNotes.length];
      const drum = track.drumPattern[step % track.drumPattern.length];

      // 1. Lead Melody Note (Polished envelope with expressive vibrato & punch)
      if (leadNote > 0) {
        this.toneAtTime(leadNote, stepDuration * 0.92, track.leadWave, 0.022, this.nextNoteTime);
      }

      // 2. Harmony / Counterpoint (Sweet stereo-like warmth)
      if (harmNote > 0) {
        this.toneAtTime(harmNote, stepDuration * 0.75, track.harmonyWave, 0.011, this.nextNoteTime);
      }

      // 3. Sub-Bassline (Analog slap bass warmth, 8th note cadence)
      if (step % 2 === 0 && bassNote > 0) {
        this.toneAtTime(bassNote, stepDuration * 1.85, track.bassWave, 0.026, this.nextNoteTime);
      }

      // 4. Synthesized Rhythm Section (FM Drum Machine)
      if (drum === 1) {
        this.playHiHat(this.nextNoteTime, 0.013);
      } else if (drum === 2) {
        this.playKick(this.nextNoteTime, 0.038);
      } else if (drum === 3) {
        this.playSnare(this.nextNoteTime, 0.026);
      } else if (drum === 4) {
        this.playKick(this.nextNoteTime, 0.038);
        this.playHiHat(this.nextNoteTime, 0.013);
      } else if (drum === 5) {
        this.playSnare(this.nextNoteTime, 0.026);
        this.playHiHat(this.nextNoteTime, 0.015);
      }

      this.nextNoteTime += stepDuration;
      this.currentStep++;
    }
  }

  private toneAtTime(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    time: number
  ) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, time);

      const effectiveVol = volume * this.masterVolume;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(effectiveVol, time + Math.min(0.018, duration * 0.15));
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(this.musicGainNode || this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration + 0.05);
    } catch {}
  }

  public setMusicTrack(trackName: MusicTrackName | null) {
    if (this.currentTrack === trackName) return;
    this.currentTrack = trackName;
    
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    if (!trackName || !this.musicEnabled) return;

    const ctx = this.initContext();
    if (!ctx) return;

    if (this.musicGainNode) {
      try {
        this.musicGainNode.gain.cancelScheduledValues(ctx.currentTime);
        this.musicGainNode.gain.setValueAtTime(1, ctx.currentTime);
      } catch {}
    }

    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;

    // Start precision interval scheduler (checks every 30ms)
    this.schedulerTimer = window.setInterval(() => {
      this.scheduleNotes();
    }, 30);
  }

  public stopMusic() {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.currentTrack = null;
    if (this.musicGainNode && this.ctx) {
      try {
        this.musicGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {}
    }
  }
}

export const sound = new SoundEngine();
