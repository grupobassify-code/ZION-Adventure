import { TRACKS_32BIT, TrackPattern32 } from './soundtrack32Bit';
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
  | 'jungleAct1'
  | 'jungleBoss'
  | 'blizzardSki'
  | 'blizzardForest'
  | 'blizzardBoss'
  | 'steampunkAct1'
  | 'steampunkAct2'
  | 'steampunkBoss'
  | 'castleAct1'
  | 'castleBoss'
  | 'pirateBeach'
  | 'pirateUnderwater'
  | 'pirateBoss'
  | 'jurassicAct1'
  | 'jurassicAct2'
  | 'jurassicBoss'
  | 'moonLaunchAct1'
  | 'moonDoomsdayBoss'
  | 'creditsTune'
  | 'trainingTheme';

export interface SoundTrackInfo {
  id: MusicTrackName;
  title: string;
  zone: string;
  tag: string;
}

export const SOUND_TRACKS_CATALOG: SoundTrackInfo[] = [
  { id: 'menuTheme', title: 'Chronos 32-Bit Rebirth', zone: 'Menú de Inicio', tag: '32-Bit Studio Master · Chill Synthwave' },
  { id: 'neonAct1', title: 'Neo-Genesis Overdrive', zone: 'Bosque Neón · Acto 1', tag: '32-Bit Arcade OST · High Energy Synth' },
  { id: 'neonBoss', title: 'Hyper-Core Confrontation', zone: 'Bosque Neón · Jefe', tag: '32-Bit Techno Breakbeat · Sub-Bass Battle' },
  { id: 'sakuraAct1', title: 'Petals of Eternity', zone: 'Bosque de Cerezo · Acto 1', tag: '32-Bit Neo-Oriental · Koto & Stereo Pads' },
  { id: 'sakuraBoss', title: 'Crimson Moon Shindig', zone: 'Bosque de Cerezo · Jefe', tag: '32-Bit Darksynth · High-Speed Ninja' },
  { id: 'lavacliffAct1', title: 'Magma Forge Overdrive', zone: 'Acantilado de Lava · Acto 1', tag: '32-Bit Heavy Synth Rock · Distorted Saw' },
  { id: 'lavacliffBoss', title: 'Ignis Colossus Unleashed', zone: 'Acantilado de Lava · Jefe', tag: '32-Bit Volcanic Metal · Double Kick' },
  { id: 'desertAct1', title: 'Mirage of Ra', zone: 'Santuario del Desierto · Acto 1', tag: '32-Bit Phrygian Modal · Arabian Bass' },
  { id: 'desertAct2', title: 'Tomb of the Sun God', zone: 'Santuario del Desierto · Acto 2', tag: '32-Bit Mystic Techno · Ambient Pads' },
  { id: 'desertBoss', title: 'Akhen\'Ra Awakening', zone: 'Santuario del Desierto · Jefe', tag: '32-Bit Battle Symphony · High Energy' },
  { id: 'kronoAct1', title: 'Cyber Metropolis 2099', zone: 'Krono City · Acto 1', tag: '32-Bit Darksynth Drive · Pulse Bass' },
  { id: 'kronoAct2', title: 'Fusion Core Meltdown', zone: 'Krono City · Acto 2', tag: '32-Bit Industrial Cyberpunk · FM Bass' },
  { id: 'kronoBoss', title: 'Titan Kronos-Ω Climax', zone: 'Krono City · Jefe Final', tag: '32-Bit Grand Finale · Orchestral Climax' },
  { id: 'kronosTravel', title: 'Dimensional Odyssey', zone: 'Nivel Extra · Fusión', tag: '32-Bit Multizone Medley · Stereo Rush' },
  { id: 'jungleAct1', title: 'Ancient Maya Canopy', zone: 'Jungle Run · Acto 1 y 2', tag: '32-Bit Tribal Polyrhythm · Jungle Groove' },
  { id: 'jungleBoss', title: 'Fangs of Balam', zone: 'Jungle Run · Jefe', tag: '32-Bit Shamanic Battle · Ferocious Synth' },
  { id: 'blizzardSki', title: 'Sub-Zero Alpine Rush', zone: 'Blizzard Rush · Acto 1', tag: '32-Bit Alpine Ski Rush · Crystalline Eurobeat' },
  { id: 'blizzardForest', title: 'Glacial Frost & Ice Pines', zone: 'Blizzard Rush · Acto 2', tag: '32-Bit Snowy Chill · Crystal Bell Synth' },
  { id: 'blizzardBoss', title: 'Yeti Mountain Stomp', zone: 'Blizzard Rush · Jefe', tag: '32-Bit Heavy Frost Battle · Sub Stomp' },
  { id: 'steampunkAct1', title: 'Clockwork Steam Foundry', zone: 'Fábrica Steampunk · Acto 1', tag: '32-Bit Victorian Brass · Clockwork Groove' },
  { id: 'steampunkAct2', title: 'Rust & Molten Gears', zone: 'Fábrica Oxidada · Acto 2', tag: '32-Bit Industrial Machinery · Steam Accents' },
  { id: 'steampunkBoss', title: 'Boiler Overload: 1000m Ascend', zone: 'Fábrica Steampunk · Jefe', tag: '32-Bit Only Up 1000m · Boiler Meltdown' },
  { id: 'castleAct1', title: 'Citadel of the Valiant', zone: 'Castle Smash · Acto 1 y 2', tag: '32-Bit Gothic March · Heroic Trumpets' },
  { id: 'castleBoss', title: 'Lord Malakar\'s Siege Hammer', zone: 'Castle Smash · Jefe', tag: '32-Bit Siege Metal · Heavy Stone Stabs' },
  { id: 'pirateBeach', title: 'High Seas Corsair Shanty', zone: 'Pirates Treasure · Acto 1', tag: '32-Bit Corsair Shanty · Buoyant Ocean' },
  { id: 'pirateUnderwater', title: 'Abyssal Whispers', zone: 'Pirates Treasure · Acto 2', tag: '32-Bit Submerged Aqua · Echo Delays' },
  { id: 'pirateBoss', title: 'Kraken\'s Cursed Chest', zone: 'Pirates Treasure · Jefe', tag: '32-Bit Sunken Galleon Metal · Mimic Battle' },
  { id: 'jurassicAct1', title: 'Valley of the Raptors', zone: 'Jurassic Draft · Acto 1', tag: '32-Bit Prehistoric Tribal · Amber Beats' },
  { id: 'jurassicAct2', title: 'Volcanic Pterosaur Ridge', zone: 'Jurassic Draft · Acto 2', tag: '32-Bit Volcanic Thermals · Soaring Drive' },
  { id: 'jurassicBoss', title: 'Apex Titan Rex Showdown', zone: 'Jurassic Draft · Jefe', tag: '32-Bit Dinosaur Metal · Apex Roar' },
  { id: 'moonLaunchAct1', title: 'Countdown to Infinity', zone: 'The Moon · Acto 1', tag: '32-Bit Heroic Space Synthwave · Epic Climb' },
  { id: 'moonDoomsdayBoss', title: 'Cosmic Doomsday Climax', zone: 'The Moon · Jefe Final', tag: '32-Bit Doomsday Tribute · 156 BPM Space Rock' },
  { id: 'creditsTune', title: 'Zion\'s Eternal Victory', zone: 'Créditos & Epílogo', tag: '32-Bit Heroic Celebration · Ending Theme' },
  { id: 'trainingTheme', title: 'Cyber Dojo Hyper-Focus', zone: 'Zona de Entrenamiento', tag: '32-Bit Upbeat Chiptune · 132 BPM Dojo Practice' },
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
  // Octave 0
  G0: 24.5, Gs0: 25.96, Ab0: 25.96, A0: 27.5, As0: 29.14, Bb0: 29.14, B0: 30.87,
  // Octave 1
  C1: 32.7, Cs1: 34.65, Db1: 34.65, D1: 36.7, Ds1: 38.89, Eb1: 38.89, E1: 41.2, F1: 43.7, Fs1: 46.25, Gb1: 46.25, G1: 49.0, Gs1: 51.91, Ab1: 51.91, A1: 55.0, As1: 58.27, Bb1: 58.27, B1: 61.7,
  // Octave 2
  C2: 65.4, Cs2: 69.3, Db2: 69.3, D2: 73.4, Ds2: 77.8, Eb2: 77.8, E2: 82.4, F2: 87.3, Fs2: 92.5, Gb2: 92.5, G2: 98.0, Gs2: 103.8, Ab2: 103.8, A2: 110.0, As2: 116.5, Bb2: 116.5, B2: 123.5,
  // Octave 3
  C3: 130.8, Cs3: 138.6, Db3: 138.6, D3: 146.8, Ds3: 155.6, Eb3: 155.6, E3: 164.8, F3: 174.6, Fs3: 185.0, Gb3: 185.0, G3: 196.0, Gs3: 207.7, Ab3: 207.7, A3: 220.0, As3: 233.1, Bb3: 233.1, B3: 246.9,
  // Octave 4
  C4: 261.6, Cs4: 277.2, Db4: 277.2, D4: 293.7, Ds4: 311.1, Eb4: 311.1, E4: 329.6, F4: 349.2, Fs4: 370.0, Gb4: 370.0, G4: 392.0, Gs4: 415.3, Ab4: 415.3, A4: 440.0, As4: 466.2, Bb4: 466.2, B4: 493.9,
  // Octave 5
  C5: 523.3, Cs5: 554.4, Db5: 554.4, D5: 587.3, Ds5: 622.3, Eb5: 622.3, E5: 659.3, F5: 698.5, Fs5: 740.0, Gb5: 740.0, G5: 784.0, Gs5: 830.6, Ab5: 830.6, A5: 880.0, As5: 932.3, Bb5: 932.3, B5: 987.8,
  // Octave 6
  C6: 1046.5, Cs6: 1108.7, Db6: 1108.7, D6: 1174.7, Ds6: 1244.5, Eb6: 1244.5, E6: 1318.5, F6: 1396.9, Fs6: 1480.0, Gb6: 1480.0, G6: 1568.0, Gs6: 1661.2, Ab6: 1661.2, A6: 1760.0, As6: 1864.7, Bb6: 1864.7, B6: 1975.5,
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private schedulerTimer: number | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;
  private currentTrack: MusicTrackName | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private musicBedFilter: BiquadFilterNode | null = null;
  public soundEnabled = true;
  public musicEnabled = true;
  public masterVolume = 0.5;
  private lastSfxTime: Record<string, number> = {};

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
      // 1. Dedicated Music Background Bed Gain (balanced cleanly with obstacles & SFX)
      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(0.56, this.ctx.currentTime);

      // 2. Dedicated Foreground SFX Gain (crisp, punchy obstacles and actions)
      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(0.95, this.ctx.currentTime);
      this.sfxGainNode.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  // Sidechain Ducking: smoothly dips music volume when obstacles, alarms or actions trigger
  private duckMusic(duckRatio = 0.22, duration = 0.32) {
    if (!this.ctx || !this.musicGainNode || !this.musicEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const targetGain = 0.56 * this.masterVolume;
      const duckedGain = targetGain * (1 - duckRatio);
      this.musicGainNode.gain.cancelScheduledValues(now);
      this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, now);
      this.musicGainNode.gain.linearRampToValueAtTime(duckedGain, now + 0.03);
      this.musicGainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain), now + duration);
    } catch {}
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

  public noise(duration = 0.05, volume = 0.03, filterFreq = 3000) {
    if (!this.soundEnabled || this.masterVolume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;
    try {
      const bufferSize = Math.max(256, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = filterFreq;
      const gain = ctx.createGain();
      const startTime = ctx.currentTime;
      gain.gain.setValueAtTime(volume * this.masterVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noiseNode.start(startTime);
      noiseNode.stop(startTime + duration + 0.02);
    } catch {}
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
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (this.lastSfxTime[name] && now - this.lastSfxTime[name] < 50) {
      return; // Suppress duplicate SFX spam within 50ms
    }
    this.lastSfxTime[name] = now;

    // Automatic musical headroom: duck background music bed slightly during gameplay actions
    this.duckMusic(0.24, 0.35);

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
      case 'countdownBeep':
        this.tone(523.25, 0.14, 'square', 0.05, 0);
        this.tone(1046.5, 0.12, 'sine', 0.04, 0.01);
        break;
      case 'countdownGo':
        [659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
          this.tone(f, 0.22, 'triangle', 0.06, i * 0.04);
        });
        this.tone(2093, 0.35, 'square', 0.08, 0.16);
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
      case 'skiJump':
        this.tone(330, 0.12, 'triangle', 0.05, 0, 880);
        this.tone(550, 0.16, 'sine', 0.04, 0.03, 1100);
        break;
      case 'snowCrunch':
        this.noise(0.04, 0.03);
        this.tone(220, 0.05, 'triangle', 0.02, 0, 110);
        break;
      case 'skiCarve':
        this.noise(0.06, 0.025);
        this.tone(440, 0.04, 'sine', 0.015, 0, 660);
        break;
      case 'yetiRoar':
        this.tone(90, 0.5, 'sawtooth', 0.09, 0, 55);
        this.tone(140, 0.4, 'square', 0.07, 0.05, 70);
        this.tone(65, 0.6, 'triangle', 0.08, 0.02, 45);
        break;
      case 'iceShatter':
        [1800, 2400, 3200, 1200].forEach((f, i) => this.tone(f, 0.09, 'sine', 0.03, i * 0.02, f * 0.5));
        this.noise(0.08, 0.03);
        break;
      case 'bubble':
        this.tone(380, 0.08, 'sine', 0.03, 0, 720);
        this.tone(540, 0.06, 'triangle', 0.02, 0.02, 980);
        break;
      case 'splash':
        this.noise(0.12, 0.04);
        this.tone(220, 0.14, 'sine', 0.03, 0, 110);
        this.tone(480, 0.09, 'triangle', 0.02, 0.02, 240);
        break;
      case 'coin':
        this.tone(988, 0.06, 'sine', 0.04, 0, 1318);
        this.tone(1318, 0.12, 'triangle', 0.035, 0.04, 1760);
        break;
      default:
        this.tone(440, 0.08, 'triangle', 0.03, 0);
        break;
    }
  }

  // Multi-channel sound themes with rich multi-bar melodic structures, retro 16-bit pop syncopation, catchy hooks and walking bass
  // 32-Bit High-Fidelity Studio Master Tracks
  private trackThemes: Record<string, TrackPattern32> = TRACKS_32BIT;

  // 32-Bit Spatial Audio & Studio Effects Graph
  private compressor: DynamicsCompressorNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;

  private setup32BitEffects(ctx: AudioContext) {
    if (this.compressor) return;
    try {
      // 1. Studio Master Dynamics Compressor (fat punch, zero distortion)
      this.compressor = ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, ctx.currentTime);
      this.compressor.ratio.setValueAtTime(3.5, ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, ctx.currentTime);
      this.compressor.release.setValueAtTime(0.20, ctx.currentTime);

      // 2. Music Bed Filter: gentle lowpass to carve out room for obstacles & gameplay SFX
      this.musicBedFilter = ctx.createBiquadFilter();
      this.musicBedFilter.type = 'lowpass';
      this.musicBedFilter.frequency.setValueAtTime(5600, ctx.currentTime);
      this.musicBedFilter.Q.setValueAtTime(0.7, ctx.currentTime);

      // 3. Spatial Ping-Pong Reverb / Delay Send Bus
      this.delayNode = ctx.createDelay();
      this.delayNode.delayTime.setValueAtTime(0.20, ctx.currentTime);
      this.delayGain = ctx.createGain();
      this.delayGain.gain.setValueAtTime(0.16, ctx.currentTime);
      this.delayFilter = ctx.createBiquadFilter();
      this.delayFilter.type = 'lowpass';
      this.delayFilter.frequency.setValueAtTime(2200, ctx.currentTime);

      this.delayNode.connect(this.delayFilter);
      this.delayFilter.connect(this.delayGain);
      this.delayGain.connect(this.delayNode); // Feedback loop
      this.delayGain.connect(this.compressor);

      // Clean background routing: Music -> MusicBedFilter -> Compressor -> Destination
      if (this.musicGainNode) {
        try {
          this.musicGainNode.disconnect();
        } catch {}
        this.musicGainNode.connect(this.musicBedFilter);
      }
      this.musicBedFilter.connect(this.compressor);
      this.compressor.connect(ctx.destination);
    } catch {}
  }

  // 32-Bit Multi-Oscillator Dual-Detuned Synth Voice with Dynamic Filter & Spatial Pan
  private tone32Bit(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    time: number,
    pan: number = 0,
    filterCutoff: number = 3200,
    sendToDelay: boolean = false
  ) {
    if (!this.ctx || frequency <= 0) return;
    try {
      const effectiveVol = volume * this.masterVolume;
      if (effectiveVol <= 0.0001) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Dual-oscillator detuning for 32-bit analog synth warmth (+/- 4 cents)
      osc1.type = type;
      osc2.type = type === 'sawtooth' ? 'square' : type;
      osc1.frequency.setValueAtTime(frequency, time);
      osc2.frequency.setValueAtTime(frequency * 1.0035, time); // detuned chorus

      // Resonant Lowpass Filter with dynamic decay envelope
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterCutoff, time);
      filter.frequency.exponentialRampToValueAtTime(Math.max(120, filterCutoff * 0.35), time + duration);
      filter.Q.setValueAtTime(2.5, time);

      // Volume ADSR Envelope
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(effectiveVol, time + Math.min(0.016, duration * 0.15));
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);

      // Stereo Panning
      if (typeof this.ctx.createStereoPanner === 'function') {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), time);
        gain.connect(panner);
        panner.connect(this.musicGainNode || this.ctx.destination);
      } else {
        gain.connect(this.musicGainNode || this.ctx.destination);
      }

      // Spatial Delay Send for 32-Bit Reverb Depth
      if (sendToDelay && this.delayNode) {
        const sendGain = this.ctx.createGain();
        sendGain.gain.setValueAtTime(effectiveVol * 0.4, time);
        gain.connect(sendGain);
        sendGain.connect(this.delayNode);
      }

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration + 0.05);
      osc2.stop(time + duration + 0.05);
    } catch {}
  }
  // High-precision Web Audio lookahead scheduler for 32-Bit Studio Master Music
  private scheduleNotes() {
    if (!this.ctx || !this.musicEnabled || !this.currentTrack || this.masterVolume <= 0) return;

    const track = this.trackThemes[this.currentTrack];
    if (!track) return;

    this.setup32BitEffects(this.ctx);

    const secondsPerBeat = 60.0 / track.tempo;
    const stepDuration = secondsPerBeat / 4; // 16th notes
    const filterCutoff = track.filterCutoff || 3200;

    // Schedule 160ms ahead of current audio context time for crystal-clear timing
    while (this.nextNoteTime < this.ctx.currentTime + 0.16) {
      const step = this.currentStep;
      const leadNote = track.leadNotes[step % track.leadNotes.length];
      const harmNote = track.harmonyNotes[step % track.harmonyNotes.length];
      const bassNote = track.bassNotes[Math.floor(step / 2) % track.bassNotes.length];
      const arpNote = track.arpNotes ? track.arpNotes[step % track.arpNotes.length] : 0;
      const drum = track.drumPattern[step % track.drumPattern.length];

      // 1. Lead Melody Note (32-Bit Dual-Detuned Synth with Reverb Send & Right Pan)
      if (leadNote > 0) {
        this.tone32Bit(leadNote, stepDuration * 0.94, track.leadWave, 0.024, this.nextNoteTime, 0.15, filterCutoff, true);
      }

      // 2. Harmony / Warm Pad (Stereo Left Pan, Lush Resonance)
      if (harmNote > 0) {
        this.tone32Bit(harmNote, stepDuration * 0.85, track.harmonyWave, 0.013, this.nextNoteTime, -0.25, filterCutoff * 0.75, false);
      }

      // 3. Arpeggio Channel (Fast 16th Plucks Alternating Stereo Field)
      if (arpNote > 0) {
        const panDir = (step % 2 === 0 ? 0.35 : -0.35);
        this.tone32Bit(arpNote, stepDuration * 0.55, track.arpWave || 'square', 0.011, this.nextNoteTime, panDir, filterCutoff * 0.9, true);
      }

      // 4. Sub-Bassline (32-Bit Analog Punch Bass, 8th note cadence)
      if (step % 2 === 0 && bassNote > 0) {
        this.tone32Bit(bassNote, stepDuration * 1.85, track.bassWave, 0.025, this.nextNoteTime, 0, 480, false);
      }

      // 5. Synthesized 32-Bit Studio Drum Machine (Balanced as vibrant background bed)
      if (drum === 1) {
        this.playHiHat(this.nextNoteTime, 0.011);
      } else if (drum === 2) {
        this.playKick(this.nextNoteTime, 0.034);
      } else if (drum === 3) {
        this.playSnare(this.nextNoteTime, 0.022);
      } else if (drum === 4) {
        this.playKick(this.nextNoteTime, 0.034);
        this.playHiHat(this.nextNoteTime, 0.011);
      } else if (drum === 5) {
        this.playSnare(this.nextNoteTime, 0.022);
        this.playHiHat(this.nextNoteTime, 0.013);
      } else if (drum === 6) {
        this.playKick(this.nextNoteTime, 0.036);
        this.playSnare(this.nextNoteTime, 0.022);
        this.playHiHat(this.nextNoteTime, 0.013);
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
        this.musicGainNode.gain.setValueAtTime(0.56 * this.masterVolume, ctx.currentTime);
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
