import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Flame, Zap, ArrowUp, Flag, Skull } from 'lucide-react';
import { multiplayerClient } from '../multiplayer/socketClient';
import { RemotePlayerState, RoomState } from '../types/multiplayer';

interface VersusHUDProps {
  room: RoomState;
  playerProgressPercent: number; // 0 to 100
  playerAltitude: number;
  isOnlyUp: boolean;
  remotePlayer: RemotePlayerState | null;
}

export const VersusHUD: React.FC<VersusHUDProps> = ({
  room,
  playerProgressPercent,
  playerAltitude,
  isOnlyUp,
  remotePlayer,
}) => {
  const [activeEmotes, setActiveEmotes] = useState<{ id: number; emote: string; sender: 'me' | 'rival' }[]>([]);
  const [showEmotePicker, setShowEmotePicker] = useState(false);

  useEffect(() => {
    const unsub = multiplayerClient.onEmote(({ emote, playerId }) => {
      const isMe = playerId === multiplayerClient.playerId;
      const newEmote = {
        id: Date.now() + Math.random(),
        emote,
        sender: (isMe ? 'me' : 'rival') as 'me' | 'rival',
      };
      setActiveEmotes((prev) => [...prev.slice(-4), newEmote]);

      setTimeout(() => {
        setActiveEmotes((prev) => prev.filter((e) => e.id !== newEmote.id));
      }, 3000);
    });

    return unsub;
  }, []);

  const sendEmote = (emote: string) => {
    multiplayerClient.sendEmote(emote);
    setShowEmotePicker(false);
  };

  const opponent = room.players.find((p) => p.id !== multiplayerClient.playerId);
  const rivalName = remotePlayer?.name || opponent?.name || 'Rival';
  const rivalAltitude = remotePlayer?.altitude || 0;
  const rivalProgress = remotePlayer?.progressPercent || 0;
  const rivalIsDead = remotePlayer?.isDead;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 p-3 flex flex-col items-center select-none">
      {/* Top Duel Comparison Bar */}
      <div className="pointer-events-auto w-full max-w-lg bg-slate-950/85 border border-cyan-500/40 rounded-2xl p-2.5 shadow-xl shadow-cyan-950/50 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs mb-1.5 px-2 font-mono">
          {/* My Player Tag */}
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{multiplayerClient.playerName} (Tú)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-500/30 text-[10px] sm:text-[11px] font-mono">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300 font-bold">+25</span>
            <span className="text-slate-500 font-sans">/</span>
            <span className="text-rose-400 font-bold">-12</span>
            <span className="text-[9px] text-slate-400 font-sans hidden sm:inline">copas</span>
          </div>

          {/* Opponent Tag */}
          <div className="flex items-center gap-1.5 text-rose-300 font-bold">
            <span>{rivalName}</span>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          </div>
        </div>

        {/* Dynamic Mode Visualizer */}
        {isOnlyUp ? (
          /* ONLY UP ALTITUDE COMPARISON */
          <div className="flex items-center justify-between px-3 py-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400">TU ALTURA</div>
                <div className="text-base font-black text-cyan-400 font-mono">
                  {Math.round(playerAltitude)}m
                </div>
              </div>
            </div>

            <div className="text-center font-bold text-xs text-slate-500 font-mono">
              VS
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="text-[10px] text-slate-400">ALTURA RIVAL</div>
                <div className="text-base font-black text-rose-400 font-mono flex items-center gap-1 justify-end">
                  {rivalIsDead ? (
                    <span className="text-rose-500 flex items-center gap-0.5 text-xs">
                      <Skull className="w-3.5 h-3.5" /> CAÍDO
                    </span>
                  ) : (
                    `${Math.round(rivalAltitude)}m`
                  )}
                </div>
              </div>
              <ArrowUp className="w-4 h-4 text-rose-400" />
            </div>
          </div>
        ) : (
          /* PARKOUR PROGRESS TRACK */
          <div className="relative w-full h-7 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center px-2">
            {/* Track guideline */}
            <div className="absolute inset-x-4 h-1 bg-slate-800 rounded-full"></div>

            {/* 25%, 50%, 75% markers */}
            <div className="absolute left-1/4 -top-0.5 w-0.5 h-2 bg-slate-700"></div>
            <div className="absolute left-2/4 -top-0.5 w-0.5 h-2 bg-slate-700"></div>
            <div className="absolute left-3/4 -top-0.5 w-0.5 h-2 bg-slate-700"></div>

            {/* Finish Flag */}
            <div className="absolute right-3 flex items-center text-amber-400 z-10" title="Meta">
              <Flag className="w-4 h-4 fill-amber-400" />
            </div>

            {/* Rival Icon Marker (Crimson) */}
            <div
              className="absolute z-10 transition-all duration-150 transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${Math.max(4, Math.min(94, rivalProgress))}%` }}
            >
              <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-rose-300 text-[9px] font-black text-white flex items-center justify-center shadow-lg shadow-rose-600/50">
                ⚔️
              </div>
            </div>

            {/* Player Icon Marker (Cyan) */}
            <div
              className="absolute z-20 transition-all duration-75 transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${Math.max(4, Math.min(94, playerProgressPercent))}%` }}
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500 border-2 border-cyan-200 text-[9px] font-black text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/60 ring-2 ring-cyan-400/40">
                Z
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Emote Reaction Bubbles */}
      <div className="absolute top-24 left-10 pointer-events-none flex flex-col gap-2">
        {activeEmotes
          .filter((e) => e.sender === 'rival')
          .map((e) => (
            <div
              key={e.id}
              className="px-3 py-1.5 rounded-2xl bg-rose-950/90 border border-rose-500/60 text-white text-base font-bold shadow-lg animate-bounce"
            >
              <span className="text-xs text-rose-300 mr-1 font-mono">[{rivalName}]:</span>
              {e.emote}
            </div>
          ))}
      </div>

      <div className="absolute top-24 right-10 pointer-events-none flex flex-col gap-2">
        {activeEmotes
          .filter((e) => e.sender === 'me')
          .map((e) => (
            <div
              key={e.id}
              className="px-3 py-1.5 rounded-2xl bg-cyan-950/90 border border-cyan-500/60 text-white text-base font-bold shadow-lg animate-bounce"
            >
              <span className="text-xs text-cyan-300 mr-1 font-mono">[Tú]:</span>
              {e.emote}
            </div>
          ))}
      </div>

      {/* Quick Emote Trigger Button */}
      <div className="pointer-events-auto absolute top-20 right-4">
        {showEmotePicker ? (
          <div className="p-2 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-2xl flex items-center gap-1.5 backdrop-blur-md animate-in zoom-in-90">
            {['🔥', '⚔️', '🏆', '💨', '👑', '😎', '💀'].map((emo) => (
              <button
                key={emo}
                onClick={() => sendEmote(emo)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-lg flex items-center justify-center transition-transform hover:scale-125 active:scale-95"
              >
                {emo}
              </button>
            ))}
            <button
              onClick={() => setShowEmotePicker(false)}
              className="px-2 py-1 text-[10px] text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowEmotePicker(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/40 text-xs font-semibold text-cyan-300 backdrop-blur-sm shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <span>💬</span>
            <span>Reacción</span>
          </button>
        )}
      </div>
    </div>
  );
};
