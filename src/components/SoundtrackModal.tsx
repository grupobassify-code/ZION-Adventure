import React, { useState, useEffect } from 'react';
import { Music, Play, Square, Volume2, VolumeX, Sparkles, X, Disc3, Radio, Flame, ShieldAlert, Award } from 'lucide-react';
import { sound, SOUND_TRACKS_CATALOG, MusicTrackName, SoundTrackInfo } from '../audio/soundEngine';

interface SoundtrackModalProps {
  onClose: () => void;
}

export const SoundtrackModal: React.FC<SoundtrackModalProps> = ({ onClose }) => {
  const [playingTrack, setPlayingTrack] = useState<MusicTrackName | null>(null);
  const [volume, setVolume] = useState<number>(sound.masterVolume);
  const [isMuted, setIsMuted] = useState<boolean>(!sound.musicEnabled);
  const [activeTab, setActiveTab] = useState<'all' | 'levels' | 'bosses' | 'special'>('all');

  useEffect(() => {
    // Current playing track
    setPlayingTrack(sound.getCurrentTrack());
  }, []);

  const handlePlayTrack = (trackId: MusicTrackName) => {
    sound.unlockAudio();
    if (playingTrack === trackId) {
      sound.stopMusic();
      setPlayingTrack(null);
    } else {
      sound.musicEnabled = true;
      setIsMuted(false);
      sound.setMusicTrack(trackId);
      setPlayingTrack(trackId);
    }
  };

  const handleStop = () => {
    sound.stopMusic();
    setPlayingTrack(null);
  };

  const handleToggleMute = () => {
    sound.musicEnabled = !sound.musicEnabled;
    setIsMuted(!sound.musicEnabled);
    if (!sound.musicEnabled) {
      sound.stopMusic();
      setPlayingTrack(null);
    } else if (playingTrack) {
      sound.setMusicTrack(playingTrack);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    sound.setMasterVolume(newVol);
  };

  const filteredTracks = SOUND_TRACKS_CATALOG.filter((t) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'bosses') return t.id.toLowerCase().includes('boss');
    if (activeTab === 'special') return t.id === 'kronosTravel' || t.id === 'creditsTune';
    if (activeTab === 'levels') return !t.id.toLowerCase().includes('boss') && t.id !== 'creditsTune';
    return true;
  });

  const getTrackIcon = (track: SoundTrackInfo) => {
    if (track.id.toLowerCase().includes('boss')) {
      return <ShieldAlert className="w-4 h-4 text-red-400" />;
    }
    if (track.id === 'kronosTravel') {
      return <Flame className="w-4 h-4 text-amber-400 animate-pulse" />;
    }
    if (track.id === 'creditsTune') {
      return <Award className="w-4 h-4 text-yellow-400" />;
    }
    return <Music className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(6,182,212,0.25)] relative overflow-hidden flex flex-col gap-4 max-h-[92vh]">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Disc3 className={`w-5 h-5 ${playingTrack ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-heading tracking-wide flex items-center gap-2">
                JUKEBOX ORIGINAL SOUNDTRACK
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  ESTILO 16-BIT RETRO
                </span>
              </h2>
              <p className="text-[11px] text-cyan-400/90 font-mono">
                Sintetizador FM polifónico con melodías contagiosas y líneas de bajo retro 16-bits clásicas
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
            title="Cerrar Jukebox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Controls Bar */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleStop}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
              title="Detener música"
            >
              <Square className="w-3.5 h-3.5 text-red-400" />
              <span>Detener</span>
            </button>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Pista actual:</span>
              </div>
              <div className="text-xs font-bold text-emerald-300 truncate">
                {playingTrack
                  ? SOUND_TRACKS_CATALOG.find((t) => t.id === playingTrack)?.title || playingTrack
                  : 'Ninguna pista en reproducción — Selecciona una canción abajo'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400">VOL:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 sm:w-28 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] font-mono text-cyan-300 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {(
            [
              { id: 'all', label: 'Todas (14)' },
              { id: 'levels', label: 'Niveles & Zonas' },
              { id: 'bosses', label: 'Jefes Épicos' },
              { id: 'special', label: 'Especiales & Himno' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Track List Grid */}
        <div className="overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[50vh]">
          {filteredTracks.map((track, idx) => {
            const isCurrent = playingTrack === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track.id)}
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.01]'
                    : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-lg shadow-cyan-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {isCurrent ? <Play className="w-4 h-4 fill-current ml-0.5" /> : idx + 1}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white truncate">
                        {track.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                          isCurrent
                            ? 'bg-cyan-900/60 text-cyan-200 border-cyan-400/50'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {track.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                      {getTrackIcon(track)}
                      <span>{track.zone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      isCurrent
                        ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md font-mono'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                        <span>Escuchar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>MÚSICA POLIFÓNICA DINÁMICA · SINTETIZADA EN TIEMPO REAL</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
