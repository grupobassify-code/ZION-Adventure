import React from 'react';
import { Trophy, Swords, Crown, Skull, RotateCcw, ArrowRight, Award, Sparkles } from 'lucide-react';
import { multiplayerClient } from '../multiplayer/socketClient';
import { RoomState } from '../types/multiplayer';

interface OnlineMatchResultModalProps {
  winnerId: string;
  winnerName: string;
  reason: string;
  trophiesAwarded: number;
  winnerTrophiesAwarded?: number;
  loserTrophiesLost?: number;
  room: RoomState;
  onRematch: () => void;
  onExit: () => void;
  onContinue?: () => void;
}

export const OnlineMatchResultModal: React.FC<OnlineMatchResultModalProps> = ({
  winnerId,
  winnerName,
  reason,
  trophiesAwarded,
  winnerTrophiesAwarded,
  loserTrophiesLost,
  room,
  onRematch,
  onExit,
  onContinue,
}) => {
  const isWinner = winnerId === multiplayerClient.playerId;
  const opponent = room.players.find((p) => p.id !== multiplayerClient.playerId);
  const rivalName = opponent?.name || 'Rival';

  const [currentProfile, setCurrentProfile] = React.useState<{
    trophies: number;
    tier: string;
    wins: number;
  } | null>(null);

  React.useEffect(() => {
    // Refresh user profile stats to show live updated trophies
    multiplayerClient.fetchPlayerProfile().then((p) => {
      if (p) {
        setCurrentProfile({
          trophies: p.trophies,
          tier: p.tier,
          wins: p.wins,
        });
      }
    });
  }, []);

  const winAmount = winnerTrophiesAwarded ?? trophiesAwarded ?? 25;
  const lossAmount = loserTrophiesLost ?? 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden text-center p-6 flex flex-col items-center">
        
        {/* Glow ambient background */}
        <div
          className={`absolute -top-24 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none ${
            isWinner ? 'bg-amber-400' : 'bg-rose-600'
          }`}
        ></div>

        {/* Victory / Defeat Icon Badge */}
        <div className="relative mb-3 mt-2">
          {isWinner ? (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/40 animate-bounce">
              <Crown className="w-10 h-10 stroke-[2.5]" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-400 flex items-center justify-center text-white shadow-xl shadow-rose-600/40">
              <Skull className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2
          className={`text-3xl font-black tracking-wider uppercase mb-1 ${
            isWinner ? 'text-amber-300 drop-shadow-[0_2px_12px_rgba(251,191,36,0.5)]' : 'text-rose-400'
          }`}
        >
          {isWinner ? '¡VICTORIA ÉPICA!' : 'DERROTA'}
        </h2>

        {/* Reason subtitle */}
        <p className="text-xs text-slate-300 mb-5 max-w-xs">{reason}</p>

        {/* Trophies Result Card: Gained on Win, Deducted on Loss */}
        <div
          className={`w-full p-4 rounded-xl border mb-4 flex items-center justify-between transition-colors ${
            isWinner
              ? 'bg-slate-950/80 border-amber-500/30'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-3 text-left">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                isWinner
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              }`}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">RESULTADO 1v1</div>
              <div className="text-sm font-bold text-white">Copas de Temporada</div>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`text-2xl font-black font-mono ${
                isWinner ? 'text-amber-400 animate-pulse' : 'text-rose-400 font-black'
              }`}
            >
              {isWinner ? `+${winAmount} 🏆` : lossAmount > 0 ? `-${lossAmount} 🏆` : '-0 🏆'}
            </div>
            <div className={`text-[10px] ${isWinner ? 'text-amber-300/80' : 'text-rose-300/80'}`}>
              {isWinner
                ? '¡Añadidas a tu rango!'
                : lossAmount > 0
                ? 'Copas deducidas por derrota'
                : 'Protegido (Mínimo 0)'}
            </div>
          </div>
        </div>

        {/* Live Profile Current Standing Badge */}
        {currentProfile && (
          <div className="w-full py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800 mb-4 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              Tu Rango Actual: <strong className="text-cyan-300">{currentProfile.tier}</strong>
            </span>
            <span className="font-mono font-bold text-amber-400">
              {currentProfile.trophies} 🏆
            </span>
          </div>
        )}

        {/* Head-to-Head Comparison Card */}
        <div className="w-full p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 mb-6 text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 font-medium text-[11px]">
            <span>{multiplayerClient.playerName} (Tú)</span>
            <span className="font-bold text-cyan-400">
              {room.mode === 'parkour' ? 'Carrera Parkour' : 'Kronos Only Up'}
            </span>
            <span>{rivalName}</span>
          </div>

          <div className="flex items-center justify-between pt-2.5 font-mono">
            <div className={`font-bold ${isWinner ? 'text-amber-300' : 'text-slate-400'}`}>
              {isWinner ? '👑 GANADOR' : 'Segundo'}
            </div>
            <div className="text-slate-500 font-sans text-[11px]">Duelo Final</div>
            <div className={`font-bold ${!isWinner ? 'text-amber-300' : 'text-slate-400'}`}>
              {!isWinner ? '👑 GANADOR' : 'Segundo'}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinue || onExit}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
            CONTINUAR
          </button>

          <div className="w-full grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onExit}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Salir al Menú
            </button>

            <button
              type="button"
              onClick={onRematch}
              className="py-2.5 px-3 rounded-xl bg-slate-900 border border-cyan-500/50 hover:bg-cyan-950 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              REVANCHA (1v1)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
