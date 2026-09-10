import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import {
  MultiplayerMode,
  RoomState,
  NetworkPlayer,
  RemotePlayerState,
  LeaderboardEntry,
} from './src/types/multiplayer';

const PORT = 3000;
const app = express();
const httpServer = http.createServer(app);

// JSON body parser for API routes
app.use(express.json());

// Enable CORS & robust transports for Socket.io
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['polling', 'websocket'],
  pingInterval: 15000,
  pingTimeout: 30000,
  connectTimeout: 45000,
});

// Database path for Leaderboard persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Leaderboard Seed Data
const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    name: 'KronoMaster',
    trophies: 1240,
    wins: 62,
    matchesPlayed: 75,
    rank: 1,
    tier: 'Maestro Kronos',
    lastActive: Date.now() - 3600000,
    avatarSkin: 'zion',
  },
  {
    id: 'seed-2',
    name: 'NeonSpeedster',
    trophies: 980,
    wins: 49,
    matchesPlayed: 60,
    rank: 2,
    tier: 'Diamante',
    lastActive: Date.now() - 7200000,
    avatarSkin: 'zyssa',
  },
  {
    id: 'seed-3',
    name: 'DaggerGod',
    trophies: 820,
    wins: 41,
    matchesPlayed: 55,
    rank: 3,
    tier: 'Diamante',
    lastActive: Date.now() - 12000000,
    avatarSkin: 'kael',
  },
  {
    id: 'seed-4',
    name: 'LavaClimber',
    trophies: 640,
    wins: 32,
    matchesPlayed: 45,
    rank: 4,
    tier: 'Oro',
    lastActive: Date.now() - 18000000,
    avatarSkin: 'zion',
  },
  {
    id: 'seed-5',
    name: 'SakuraNinja',
    trophies: 520,
    wins: 26,
    matchesPlayed: 38,
    rank: 5,
    tier: 'Oro',
    lastActive: Date.now() - 25000000,
    avatarSkin: 'zyssa',
  },
  {
    id: 'seed-6',
    name: 'DesertPhantom',
    trophies: 380,
    wins: 19,
    matchesPlayed: 30,
    rank: 6,
    tier: 'Plata',
    lastActive: Date.now() - 40000000,
    avatarSkin: 'kael',
  },
  {
    id: 'seed-7',
    name: 'ShinobiNovice',
    trophies: 160,
    wins: 8,
    matchesPlayed: 14,
    rank: 7,
    tier: 'Bronce',
    lastActive: Date.now() - 55000000,
    avatarSkin: 'zion',
  },
];

// Load or initialize leaderboard
function loadLeaderboard(): LeaderboardEntry[] {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const data = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
      const list = JSON.parse(data) as LeaderboardEntry[];
      return sortAndRank(list);
    }
  } catch (err) {
    console.error('Error reading leaderboard file:', err);
  }
  saveLeaderboard(INITIAL_LEADERBOARD);
  return INITIAL_LEADERBOARD;
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving leaderboard file:', err);
  }
}

function calculateTier(trophies: number): LeaderboardEntry['tier'] {
  if (trophies >= 1200) return 'Maestro Kronos';
  if (trophies >= 800) return 'Diamante';
  if (trophies >= 500) return 'Oro';
  if (trophies >= 250) return 'Plata';
  return 'Bronce';
}

function sortAndRank(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  entries.sort((a, b) => b.trophies - a.trophies);
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
    entry.tier = calculateTier(entry.trophies);
  });
  return entries;
}

// In-memory active players and rooms
let leaderboard = loadLeaderboard();

function getOrCreatePlayerEntry(id: string, name: string, skin?: string): LeaderboardEntry {
  let entry = leaderboard.find((p) => p.id === id);
  if (!entry) {
    entry = {
      id,
      name: name || `Zion_${Math.floor(100 + Math.random() * 900)}`,
      trophies: 0,
      wins: 0,
      matchesPlayed: 0,
      rank: leaderboard.length + 1,
      tier: 'Bronce',
      lastActive: Date.now(),
      avatarSkin: skin || 'zion',
    };
    leaderboard.push(entry);
    leaderboard = sortAndRank(leaderboard);
    saveLeaderboard(leaderboard);
  } else {
    if (name && entry.name !== name) {
      entry.name = name;
    }
    if (skin) entry.avatarSkin = skin;
    entry.lastActive = Date.now();
  }
  return entry;
}

function recordMatchWin(winnerId: string, loserId: string): { winnerGained: number; loserLost: number } {
  const winner = leaderboard.find((p) => p.id === winnerId);
  const loser = leaderboard.find((p) => p.id === loserId);

  const winnerGained = 25; // +25 copas al ganador
  let loserLost = 12; // -12 copas al perdedor (si pierdes te quitan copas)

  if (winner) {
    winner.trophies += winnerGained;
    winner.wins += 1;
    winner.matchesPlayed += 1;
    winner.lastActive = Date.now();
  }

  if (loser) {
    loser.matchesPlayed += 1;
    // Las copas no pueden bajar de 0
    loserLost = Math.min(loser.trophies, loserLost);
    loser.trophies = Math.max(0, loser.trophies - loserLost);
    loser.lastActive = Date.now();
  }

  leaderboard = sortAndRank(leaderboard);
  saveLeaderboard(leaderboard);

  return { winnerGained, loserLost };
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', onlinePlayers: io.engine.clientsCount, activeRooms: rooms.size });
});

app.get('/api/leaderboard', (req, res) => {
  res.json(leaderboard);
});

app.get('/api/player/:id', (req, res) => {
  const player = leaderboard.find((p) => p.id === req.params.id);
  if (player) {
    res.json(player);
  } else {
    res.status(404).json({ error: 'Player not found' });
  }
});

app.post('/api/player/profile', (req, res) => {
  const { id, name, skin } = req.body;
  if (!id) return res.status(400).json({ error: 'Player id required' });
  const entry = getOrCreatePlayerEntry(id, name, skin);
  saveLeaderboard(leaderboard);
  res.json(entry);
});

// ----------------------------------------------------
// MULTIPLAYER ROOM & MATCHMAKING LOGIC
// ----------------------------------------------------
interface ActiveRoom {
  code: string;
  mode: MultiplayerMode;
  status: RoomState['status'];
  hostId: string;
  players: Map<string, NetworkPlayer>;
  parkourLevelIndex: number;
  countdownTimer?: NodeJS.Timeout;
  startedAt?: number;
  winnerId?: string | null;
  winnerReason?: string;
  playerAltitudes: Map<string, number>;
  playerEliminated: Map<string, boolean>;
}

const rooms = new Map<string, ActiveRoom>();
const matchmakingQueue: { socketId: string; playerId: string; name: string; skin: string }[] = [];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms.has(code));
  return code;
}

function serializeRoom(room: ActiveRoom): RoomState {
  return {
    code: room.code,
    mode: room.mode,
    status: room.status,
    hostId: room.hostId,
    players: Array.from(room.players.values()),
    parkourLevelIndex: room.parkourLevelIndex,
    winnerId: room.winnerId,
    winnerReason: room.winnerReason,
    startedAt: room.startedAt,
  };
}

io.on('connection', (socket: Socket) => {
  let currentRoomCode: string | null = null;
  let currentUserId: string | null = null;

  // 1. Create Room
  socket.on('create_room', ({ playerId, name, skin, mode = 'parkour' }) => {
    currentUserId = playerId;
    const entry = getOrCreatePlayerEntry(playerId, name, skin);
    const code = generateRoomCode();

    const hostPlayer: NetworkPlayer = {
      id: playerId,
      name: entry.name,
      isHost: true,
      isReady: true,
      skin: skin || 'zion',
      trophies: entry.trophies,
    };

    const newRoom: ActiveRoom = {
      code,
      mode: mode as MultiplayerMode,
      status: 'waiting',
      hostId: playerId,
      players: new Map([[playerId, hostPlayer]]),
      parkourLevelIndex: 0,
      playerAltitudes: new Map(),
      playerEliminated: new Map(),
    };

    rooms.set(code, newRoom);
    currentRoomCode = code;
    socket.join(code);

    socket.emit('room_created', serializeRoom(newRoom));
  });

  // 2. Join Room by Code
  socket.on('join_room', ({ code, playerId, name, skin }) => {
    const upperCode = (code || '').trim().toUpperCase();
    const room = rooms.get(upperCode);

    if (!room) {
      socket.emit('room_error', { message: 'La sala no existe o el código es incorrecto.' });
      return;
    }

    if (room.players.size >= 2 && !room.players.has(playerId)) {
      socket.emit('room_error', { message: 'La sala ya está llena (máximo 2 jugadores 1v1).' });
      return;
    }

    if (room.status === 'playing') {
      socket.emit('room_error', { message: 'La partida en esta sala ya está en curso.' });
      return;
    }

    currentUserId = playerId;
    currentRoomCode = upperCode;
    const entry = getOrCreatePlayerEntry(playerId, name, skin);

    const isHost = room.hostId === playerId;
    const player: NetworkPlayer = {
      id: playerId,
      name: entry.name,
      isHost,
      isReady: isHost, // Host is ready by default
      skin: skin || 'zion',
      trophies: entry.trophies,
    };

    room.players.set(playerId, player);
    socket.join(upperCode);

    io.to(upperCode).emit('room_updated', serializeRoom(room));
    socket.emit('room_joined', serializeRoom(room));
  });

  // 3. Quick Match / Matchmaking Queue
  socket.on('find_match', ({ playerId, name, skin, preferredMode = 'parkour' }) => {
    currentUserId = playerId;
    const entry = getOrCreatePlayerEntry(playerId, name, skin);

    // Remove any existing entry in queue
    const existingIndex = matchmakingQueue.findIndex((q) => q.playerId === playerId);
    if (existingIndex >= 0) {
      matchmakingQueue.splice(existingIndex, 1);
    }

    // Check if another player is waiting
    if (matchmakingQueue.length > 0) {
      const opponent = matchmakingQueue.shift()!;
      const opponentSocket = io.sockets.sockets.get(opponent.socketId);

      if (opponentSocket) {
        const code = generateRoomCode();
        const hostPlayer: NetworkPlayer = {
          id: opponent.playerId,
          name: opponent.name,
          isHost: true,
          isReady: true,
          skin: opponent.skin || 'zion',
          trophies: getOrCreatePlayerEntry(opponent.playerId, opponent.name).trophies,
        };

        const challengerPlayer: NetworkPlayer = {
          id: playerId,
          name: entry.name,
          isHost: false,
          isReady: true,
          skin: skin || 'zion',
          trophies: entry.trophies,
        };

        const room: ActiveRoom = {
          code,
          mode: preferredMode as MultiplayerMode,
          status: 'ready',
          hostId: opponent.playerId,
          players: new Map([
            [opponent.playerId, hostPlayer],
            [playerId, challengerPlayer],
          ]),
          parkourLevelIndex: 0,
          playerAltitudes: new Map(),
          playerEliminated: new Map(),
        };

        rooms.set(code, room);

        // Join sockets to room
        socket.join(code);
        opponentSocket.join(code);
        currentRoomCode = code;

        // Notify both players match found!
        io.to(code).emit('match_found', serializeRoom(room));
        return;
      }
    }

    // Otherwise, add player to queue
    matchmakingQueue.push({
      socketId: socket.id,
      playerId,
      name: entry.name,
      skin: skin || 'zion',
    });

    socket.emit('matchmaking_waiting', { queueLength: matchmakingQueue.length });
  });

  socket.on('cancel_matchmaking', ({ playerId }) => {
    const idx = matchmakingQueue.findIndex((q) => q.playerId === playerId);
    if (idx >= 0) {
      matchmakingQueue.splice(idx, 1);
    }
    socket.emit('matchmaking_cancelled');
  });

  // 4. Host Changes Game Mode ("parkour" | "onlyup")
  socket.on('select_mode', ({ code, mode, parkourLevelIndex = 0 }) => {
    const room = rooms.get(code);
    if (!room) return;
    if (room.hostId !== currentUserId) return; // Only host can select mode

    room.mode = mode;
    if (typeof parkourLevelIndex === 'number') {
      room.parkourLevelIndex = parkourLevelIndex;
    }

    io.to(code).emit('room_updated', serializeRoom(room));
  });

  // 5. Toggle Ready Status
  socket.on('toggle_ready', ({ code, playerId }) => {
    const room = rooms.get(code);
    if (!room) return;

    const player = room.players.get(playerId);
    if (player) {
      player.isReady = !player.isReady;
      io.to(code).emit('room_updated', serializeRoom(room));
    }
  });

  // 6. Start Match Countdown (Host initiates)
  socket.on('start_match', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    if (room.hostId !== currentUserId && room.players.size > 1) return;

    room.status = 'starting';
    let countdown = 3;

    io.to(code).emit('countdown_tick', { count: countdown, room: serializeRoom(room) });

    const timer = setInterval(() => {
      countdown -= 1;
      if (countdown > 0) {
        io.to(code).emit('countdown_tick', { count: countdown, room: serializeRoom(room) });
      } else {
        clearInterval(timer);
        room.status = 'playing';
        room.startedAt = Date.now();
        room.winnerId = null;
        room.winnerReason = undefined;
        room.playerAltitudes.clear();
        room.playerEliminated.clear();

        io.to(code).emit('match_started', serializeRoom(room));
      }
    }, 1000);

    room.countdownTimer = timer;
  });

  // 7. High-Frequency Realtime Player State Synchronization
  socket.on('player_update', (data: RemotePlayerState) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.status !== 'playing') return;

    // Track altitude for Only Up mode
    if (room.mode === 'onlyup' && typeof data.altitude === 'number') {
      const currentMax = room.playerAltitudes.get(data.id) || 0;
      if (data.altitude > currentMax) {
        room.playerAltitudes.set(data.id, data.altitude);
      }
    }

    // Broadcast directly to opponent (exclude sender socket)
    socket.to(currentRoomCode).emit('remote_player_update', data);
  });

  // 8. Game Victory / Goal Event (Parkour Mode)
  socket.on('player_reach_goal', ({ code, playerId }) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') return;

    // First player to reach goal wins
    room.status = 'finished';
    room.winnerId = playerId;
    room.winnerReason = '¡Llegó primero a la meta!';

    const playerList = Array.from(room.players.values());
    const winner = playerList.find((p) => p.id === playerId);
    const loser = playerList.find((p) => p.id !== playerId);

    let trophyResult = { winnerGained: 25, loserLost: 12 };
    if (winner && loser) {
      trophyResult = recordMatchWin(winner.id, loser.id);
    }

    io.to(code).emit('match_ended', {
      winnerId: playerId,
      winnerName: winner ? winner.name : 'Jugador',
      reason: room.winnerReason,
      winnerTrophiesAwarded: trophyResult.winnerGained,
      loserTrophiesLost: trophyResult.loserLost,
      trophiesAwarded: trophyResult.winnerGained,
      room: serializeRoom(room),
    });
  });

  // 9. Elimination Event (Only Up Mode)
  socket.on('player_eliminated', ({ code, playerId, altitude }) => {
    const room = rooms.get(code);
    if (!room || room.status !== 'playing') return;

    room.playerEliminated.set(playerId, true);
    if (typeof altitude === 'number') {
      room.playerAltitudes.set(playerId, Math.max(room.playerAltitudes.get(playerId) || 0, altitude));
    }

    const playerList = Array.from(room.players.values());
    const alivePlayers = playerList.filter((p) => !room.playerEliminated.get(p.id));

    // If only one player remains alive in a 2-player match
    if (alivePlayers.length === 1) {
      const winner = alivePlayers[0];
      const loser = playerList.find((p) => p.id === playerId)!;

      room.status = 'finished';
      room.winnerId = winner.id;
      room.winnerReason = `¡El rival cayó a la lava! Supervivencia épica.`;

      const trophyResult = recordMatchWin(winner.id, loser.id);

      io.to(code).emit('match_ended', {
        winnerId: winner.id,
        winnerName: winner.name,
        reason: room.winnerReason,
        winnerTrophiesAwarded: trophyResult.winnerGained,
        loserTrophiesLost: trophyResult.loserLost,
        trophiesAwarded: trophyResult.winnerGained,
        room: serializeRoom(room),
      });
    } else if (alivePlayers.length === 0) {
      // Both fell: whoever reached higher altitude wins
      let maxAlt = -1;
      let winnerId = playerId;
      for (const p of playerList) {
        const alt = room.playerAltitudes.get(p.id) || 0;
        if (alt > maxAlt) {
          maxAlt = alt;
          winnerId = p.id;
        }
      }

      const winner = playerList.find((p) => p.id === winnerId) || playerList[0];
      const loser = playerList.find((p) => p.id !== winnerId) || playerList[1];

      room.status = 'finished';
      room.winnerId = winner.id;
      room.winnerReason = `¡Alcanzó la mayor altura (${Math.round(maxAlt)}m)!`;

      let trophyResult = { winnerGained: 25, loserLost: 12 };
      if (winner && loser) {
        trophyResult = recordMatchWin(winner.id, loser.id);
      }

      io.to(code).emit('match_ended', {
        winnerId: winner.id,
        winnerName: winner.name,
        reason: room.winnerReason,
        winnerTrophiesAwarded: trophyResult.winnerGained,
        loserTrophiesLost: trophyResult.loserLost,
        trophiesAwarded: trophyResult.winnerGained,
        room: serializeRoom(room),
      });
    } else {
      // Notify opponent of fall
      socket.to(code).emit('opponent_eliminated', { playerId, altitude });
    }
  });

  // 10. Emote / Reaction
  socket.on('send_emote', ({ code, emote, playerId }) => {
    io.to(code).emit('receive_emote', { emote, playerId });
  });

  // 11. Rematch / Play Again Request
  socket.on('request_rematch', ({ code, playerId }) => {
    const room = rooms.get(code);
    if (!room) return;

    room.status = 'ready';
    room.winnerId = null;
    room.winnerReason = undefined;
    room.playerAltitudes.clear();
    room.playerEliminated.clear();

    io.to(code).emit('rematch_accepted', serializeRoom(room));
  });

  // 12. Disconnection Handling
  socket.on('disconnect', () => {
    // Remove from matchmaking queue
    const qIdx = matchmakingQueue.findIndex((q) => q.socketId === socket.id);
    if (qIdx >= 0) {
      matchmakingQueue.splice(qIdx, 1);
    }

    if (currentRoomCode) {
      const room = rooms.get(currentRoomCode);
      if (room && currentUserId) {
        room.players.delete(currentUserId);

        // If in game, award win by forfeit to remaining player
        if (room.status === 'playing' && room.players.size === 1) {
          const remainingPlayer = Array.from(room.players.values())[0];
          room.status = 'finished';
          room.winnerId = remainingPlayer.id;
          room.winnerReason = 'El rival abandonó la partida. ¡Victoria por abandono!';

          const trophyResult = recordMatchWin(remainingPlayer.id, currentUserId);

          io.to(currentRoomCode).emit('match_ended', {
            winnerId: remainingPlayer.id,
            winnerName: remainingPlayer.name,
            reason: room.winnerReason,
            winnerTrophiesAwarded: trophyResult.winnerGained,
            loserTrophiesLost: trophyResult.loserLost,
            trophiesAwarded: trophyResult.winnerGained,
            room: serializeRoom(room),
          });
        }

        if (room.players.size === 0) {
          if (room.countdownTimer) clearInterval(room.countdownTimer);
          rooms.delete(currentRoomCode);
        } else {
          // If host left, assign new host
          if (room.hostId === currentUserId) {
            const nextHost = Array.from(room.players.values())[0];
            room.hostId = nextHost.id;
            nextHost.isHost = true;
          }
          io.to(currentRoomCode).emit('room_updated', serializeRoom(room));
          io.to(currentRoomCode).emit('player_left', { playerId: currentUserId });
        }
      }
    }
  });
});

// ----------------------------------------------------
// VITE & STATIC FILES SETUP
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Online Backend] Zion Multiplayer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
