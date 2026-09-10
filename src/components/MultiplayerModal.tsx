import React, { useState, useEffect } from 'react';
import {
  Swords,
  Users,
  Search,
  KeyRound,
  Trophy,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Flame,
  Crown,
  ChevronRight,
  Shield,
  ArrowUpCircle,
  X,
  User,
  Edit2,
} from 'lucide-react';
import { multiplayerClient } from '../multiplayer/socketClient';
import {
  MultiplayerMode,
  RoomState,
  LeaderboardEntry,
} from '../types/multiplayer';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (room: RoomState) => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
}) => {
  const [tab, setTab] = useState<'create' | 'matchmaking' | 'join' | 'leaderboard'>('create');
  const [playerName, setPlayerName] = useState(multiplayerClient.playerName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [selectedMode, setSelectedMode] = useState<MultiplayerMode>('parkour');
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'searching' | 'found'>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Initialize and subscribe to Socket.io events
  useEffect(() => {
    if (!isOpen) return;

    multiplayerClient.connect();

    const unsubRoom = multiplayerClient.onRoomUpdate((room) => {
      setCurrentRoom(room);
      if (room) {
        setSelectedMode(room.mode);
      }
    });

    const unsubCountdown = multiplayerClient.onCountdownTick((count) => {
      setCountdown(count);
    });

    const unsubStart = multiplayerClient.onMatchStart((room) => {
      setCountdown(null);
      onStartMatch(room);
    });

    const unsubMatchmaking = multiplayerClient.onMatchmakingStatus((status) => {
      setMatchmakingStatus(status);
    });

    const unsubError = multiplayerClient.onError((msg) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    // Load initial leaderboard
    fetchLeaderboardData();

    return () => {
      unsubRoom();
      unsubCountdown();
      unsubStart();
      unsubMatchmaking();
      unsubError();
    };
  }, [isOpen, onStartMatch]);

  const fetchLeaderboardData = async () => {
    setIsLoadingLeaderboard(true);
    const data = await multiplayerClient.fetchLeaderboard();
    setLeaderboard(data);
    setIsLoadingLeaderboard(false);
  };

  const handleSaveName = () => {
    if (playerName.trim()) {
      multiplayerClient.setPlayerName(playerName.trim());
      setIsEditingName(false);
      fetchLeaderboardData();
    }
  };

  const handleCreateRoom = () => {
    setErrorMessage(null);
    multiplayerClient.createRoom(selectedMode);
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) {
      setErrorMessage('Por favor introduce el código de 6 caracteres.');
      return;
    }
    setErrorMessage(null);
    multiplayerClient.joinRoom(joinCode.trim().toUpperCase());
  };

  const handleFindMatch = () => {
    setErrorMessage(null);
    multiplayerClient.findMatch(selectedMode);
  };

  const handleCancelMatchmaking = () => {
    multiplayerClient.cancelMatchmaking();
    setMatchmakingStatus('idle');
  };

  const handleModeChange = (mode: MultiplayerMode) => {
    setSelectedMode(mode);
    if (currentRoom && isHost) {
      multiplayerClient.selectMode(mode);
    }
  };

  const handleToggleReady = () => {
    multiplayerClient.toggleReady();
  };

  const handleStartMatch = () => {
    multiplayerClient.startMatch();
  };

  const handleCopyCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLeaveRoom = () => {
    multiplayerClient.leaveRoom();
    setCurrentRoom(null);
    setCountdown(null);
  };

  if (!isOpen) return null;

  const isHost = currentRoom?.hostId === multiplayerClient.playerId;
  const isReady = currentRoom?.players.find((p) => p.id === multiplayerClient.playerId)?.isReady;
  const canStart = isHost && currentRoom && currentRoom.players.length === 2 && currentRoom.players.every((p) => p.isReady);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                MODO ONLINE 1v1
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30">
                  TEMPORADA 1
                </span>
              </h2>
              <p className="text-xs text-slate-400">Duelos en tiempo real · Gana +20 Copas por victoria</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (currentRoom) handleLeaveRoom();
              onClose();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Name Strip */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nombre de duelista:</span>
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={16}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="px-2 py-0.5 bg-slate-800 border border-cyan-500 rounded text-white text-xs focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-cyan-300 font-mono text-sm">{playerName}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-400 hover:text-cyan-400 p-0.5"
                  title="Editar nombre"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            <span>+20 Copas por Victoria</span>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="px-6 py-2 bg-rose-950/80 border-b border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-1">
            <Shield className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-lg animate-in zoom-in-95 duration-150">
            <div className="text-slate-400 text-sm font-semibold tracking-widest uppercase mb-2">
              ¡LA BATALLA COMIENZA EN!
            </div>
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-500 to-cyan-400 animate-pulse">
              {countdown > 0 ? countdown : '¡YA!'}
            </div>
            <div className="text-xs text-cyan-400 mt-4 font-mono">
              Modo: {currentRoom?.mode === 'parkour' ? 'Carrera Parkour' : 'Kronos Only Up'}
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentRoom ? (
            /* --- IN LOBBY VIEW --- */
            <div className="space-y-6">
              {/* Room Code Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-medium">CÓDIGO DE LA SALA:</div>
                  <div className="text-2xl font-black font-mono tracking-widest text-cyan-400 flex items-center gap-2 mt-0.5">
                    {currentRoom.code}
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copiar código"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Modo de Juego:</div>
                  <div className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                    {currentRoom.mode === 'parkour' ? '🏃‍♂️ Carrera Parkour' : '🌋 Kronos Only Up'}
                  </div>
                </div>
              </div>

              {/* Mode Selection (Host only) */}
              {isHost && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    SELECCIONA EL MODO DE DUELO:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleModeChange('parkour')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedMode === 'parkour'
                          ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                        <Play className="w-4 h-4" /> Parkour
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Gana el primer jugador en cruzar la meta del nivel.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModeChange('onlyup')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedMode === 'onlyup'
                          ? 'border-amber-400 bg-amber-950/40 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                        <ArrowUpCircle className="w-4 h-4" /> Only Up
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Gana el que sobreviva más tiempo y escale más alto sobre la lava.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Players Grid (1v1) */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
                  <span>JUGADORES EN LA SALA ({currentRoom.players.length}/2)</span>
                  {currentRoom.players.length < 2 && (
                    <span className="text-cyan-400 text-[11px] animate-pulse">Esperando al rival...</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Host Player */}
                  {currentRoom.players[0] && (
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          ANFITRIÓN (HOST)
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{currentRoom.players[0].trophies}</span>
                        </div>
                      </div>

                      <div className="text-base font-bold text-white font-mono">
                        {currentRoom.players[0].name}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Estado:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Listo
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Challenger Player */}
                  {currentRoom.players[1] ? (
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          DESAFIANTE (RIVAL)
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{currentRoom.players[1].trophies}</span>
                        </div>
                      </div>

                      <div className="text-base font-bold text-white font-mono">
                        {currentRoom.players[1].name}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Estado:</span>
                        {currentRoom.players[1].isReady ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Listo
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">No listo</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/30 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center text-slate-500">
                      <Users className="w-8 h-8 mb-2 opacity-50" />
                      <div className="text-xs font-medium">Invita a un amigo</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">Comparte el código {currentRoom.code}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lobby Action Controls */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleLeaveRoom}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Salir de la Sala
                </button>

                {!isHost && (
                  <button
                    type="button"
                    onClick={handleToggleReady}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isReady
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    }`}
                  >
                    {isReady ? 'CANCELAR LISTO' : '¡ESTOY LISTO!'}
                  </button>
                )}

                {isHost && (
                  <button
                    type="button"
                    disabled={!canStart}
                    onClick={handleStartMatch}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      canStart
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {currentRoom.players.length < 2
                      ? 'ESPERANDO AL SEGUNDO JUGADOR...'
                      : !canStart
                      ? 'ESPERANDO QUE EL RIVAL ESTÉ LISTO...'
                      : '¡INICIAR DUELO AHORA!'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* --- LOBBY MAIN MENU TABS --- */
            <div>
              {/* Navigation Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTab('create')}
                  className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    tab === 'create' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Crear Sala
                </button>
                <button
                  type="button"
                  onClick={() => setTab('matchmaking')}
                  className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    tab === 'matchmaking' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" /> Buscar Partida
                </button>
                <button
                  type="button"
                  onClick={() => setTab('join')}
                  className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    tab === 'join' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" /> Unirse con Código
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('leaderboard');
                    fetchLeaderboardData();
                  }}
                  className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    tab === 'leaderboard' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" /> Clasificación
                </button>
              </div>

              {/* TAB 1: CREAR SALA */}
              {tab === 'create' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      ELIGE EL MODO DE JUEGO PARA LA SALA:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setSelectedMode('parkour')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedMode === 'parkour'
                            ? 'border-cyan-400 bg-cyan-950/40 text-white ring-1 ring-cyan-400'
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm text-cyan-300 mb-1">
                          <Play className="w-4 h-4 fill-current" /> Modo Parkour
                        </div>
                        <p className="text-xs text-slate-400">
                          Carrera de velocidad pura. Quien cruce primero la meta gana el duelo.
                        </p>
                      </div>

                      <div
                        onClick={() => setSelectedMode('onlyup')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedMode === 'onlyup'
                            ? 'border-amber-400 bg-amber-950/40 text-white ring-1 ring-amber-400'
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm text-amber-300 mb-1">
                          <ArrowUpCircle className="w-4 h-4" /> Kronos Only Up
                        </div>
                        <p className="text-xs text-slate-400">
                          Escalada vertical frenética. Supera los obstáculos y huye de la lava mortal.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      ¿Cómo funciona?
                    </div>
                    <p className="text-slate-400">
                      Al crear la sala se generará un código único de 6 caracteres que podrás enviarle a un amigo para que entre de inmediato al 1v1.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateRoom}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Users className="w-4 h-4" />
                    CREAR SALA PRIVADA
                  </button>
                </div>
              )}

              {/* TAB 2: BUSCAR PARTIDA */}
              {tab === 'matchmaking' && (
                <div className="space-y-5 text-center py-4">
                  {matchmakingStatus === 'searching' ? (
                    <div className="p-8 rounded-2xl bg-slate-950/60 border border-cyan-500/30 flex flex-col items-center">
                      <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping"></div>
                        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
                        <Search className="w-6 h-6 text-cyan-400 absolute" />
                      </div>
                      <div className="text-base font-bold text-white mb-1">BUSCANDO OPONENTE DISPONIBLE...</div>
                      <p className="text-xs text-slate-400 mb-6">
                        Conectando con el servidor y emparejando jugadores en tiempo real.
                      </p>
                      <button
                        type="button"
                        onClick={handleCancelMatchmaking}
                        className="px-6 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Cancelar búsqueda
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800">
                        <Search className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white mb-1">EMPAREJAMIENTO RÁPIDO 1v1</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Encuentra automáticamente a otro jugador conectado para competir por el trofeo de +20 Copas.
                        </p>

                        <div className="mt-4 flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedMode('parkour')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              selectedMode === 'parkour'
                                ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                                : 'border-slate-800 bg-slate-900 text-slate-400'
                            }`}
                          >
                            🏃‍♂️ Carrera Parkour
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedMode('onlyup')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              selectedMode === 'onlyup'
                                ? 'border-amber-400 bg-amber-950/60 text-amber-300'
                                : 'border-slate-800 bg-slate-900 text-slate-400'
                            }`}
                          >
                            🌋 Kronos Only Up
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleFindMatch}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                      >
                        <Search className="w-4 h-4" />
                        BUSCAR PARTIDA AHORA
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: UNIRSE CON CÓDIGO */}
              {tab === 'join' && (
                <div className="space-y-5 py-2">
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800">
                    <KeyRound className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1 text-center">UNIRSE A LA SALA DE UN AMIGO</h3>
                    <p className="text-xs text-slate-400 text-center mb-6 max-w-sm mx-auto">
                      Introduce el código alfanumérico de 6 dígitos que te compartió tu amigo.
                    </p>

                    <div className="max-w-xs mx-auto">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="EJ: X7K9B2"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="w-full py-3 px-4 bg-slate-900 border-2 border-cyan-500/50 rounded-xl text-center text-2xl font-black font-mono tracking-widest text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleJoinRoom}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <ChevronRight className="w-5 h-5" />
                    UNIRSE A LA SALA
                  </button>
                </div>
              )}

              {/* TAB 4: TABLA DE CLASIFICACIÓN (LEADERBOARD) */}
              {tab === 'leaderboard' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-400" />
                        TABLA GLOBAL DE COPAS (1v1)
                      </h3>
                      <p className="text-xs text-slate-400">Los mejores duelistas de Kronos</p>
                    </div>

                    <button
                      type="button"
                      onClick={fetchLeaderboardData}
                      disabled={isLoadingLeaderboard}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
                      Actualizar
                    </button>
                  </div>

                  {/* Leaderboard List */}
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {leaderboard.map((entry) => {
                      const isMe = entry.id === multiplayerClient.playerId;
                      const isTop1 = entry.rank === 1;
                      const isTop2 = entry.rank === 2;
                      const isTop3 = entry.rank === 3;

                      return (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isMe
                              ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-950/40'
                              : 'bg-slate-950/40 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isTop1
                                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40'
                                  : isTop2
                                  ? 'bg-slate-300 text-slate-950'
                                  : isTop3
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {entry.rank}
                            </div>

                            <div>
                              <div className="font-bold text-sm flex items-center gap-1.5 font-mono">
                                {entry.name}
                                {isMe && (
                                  <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500 text-slate-950 font-sans font-bold rounded">
                                    TÚ
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {entry.tier} · {entry.wins} victorias
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                              <Trophy className="w-4 h-4" />
                              <span>{entry.trophies}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {entry.matchesPlayed} partidas
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
