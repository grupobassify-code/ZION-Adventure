import { io, Socket } from 'socket.io-client';
import {
  MultiplayerMode,
  RoomState,
  RemotePlayerState,
  LeaderboardEntry,
  MatchResultData,
  MatchEndPayload,
} from '../types/multiplayer';

class MultiplayerClient {
  private socket: Socket | null = null;
  public playerId: string = '';
  public playerName: string = '';
  public playerSkin: string = 'zion';
  public currentRoom: RoomState | null = null;
  public remotePlayer: RemotePlayerState | null = null;
  public lastRemoteUpdate: number = 0;
  
  // Interpolation smoothing targets for opponent
  public targetX: number = 0;
  public targetY: number = 0;
  public currentX: number = 0;
  public currentY: number = 0;

  // Listeners
  private roomListeners: ((room: RoomState | null) => void)[] = [];
  private countdownListeners: ((count: number) => void)[] = [];
  private matchStartListeners: ((room: RoomState) => void)[] = [];
  private matchEndListeners: ((result: MatchEndPayload) => void)[] = [];
  private emoteListeners: ((data: { emote: string; playerId: string }) => void)[] = [];
  private errorListeners: ((msg: string) => void)[] = [];
  private matchmakingStatusListeners: ((status: 'idle' | 'searching' | 'found') => void)[] = [];

  private lastSendTime: number = 0;
  private readonly SEND_INTERVAL_MS = 33; // ~30Hz network updates

  constructor() {
    this.initPlayerIdentity();
  }

  private initPlayerIdentity() {
    try {
      let storedId = localStorage.getItem('zion_multiplayer_player_id');
      if (!storedId) {
        storedId = 'p_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('zion_multiplayer_player_id', storedId);
      }
      this.playerId = storedId;

      let storedName = localStorage.getItem('zion_multiplayer_player_name');
      if (!storedName) {
        storedName = `Zion_${Math.floor(100 + Math.random() * 900)}`;
        localStorage.setItem('zion_multiplayer_player_name', storedName);
      }
      this.playerName = storedName;

      let storedSkin = localStorage.getItem('zion_selected_skin');
      if (storedSkin) {
        this.playerSkin = storedSkin;
      }
    } catch {
      this.playerId = 'p_' + Math.random().toString(36).substring(2, 9);
      this.playerName = 'Zion_Runner';
    }
  }

  public setPlayerName(name: string) {
    this.playerName = name.trim() || 'Zion';
    try {
      localStorage.setItem('zion_multiplayer_player_name', this.playerName);
    } catch {}

    // Notify backend
    fetch('/api/player/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: this.playerId, name: this.playerName, skin: this.playerSkin }),
    }).catch(() => {});
  }

  public setPlayerSkin(skin: string) {
    this.playerSkin = skin;
    try {
      localStorage.setItem('zion_selected_skin', skin);
    } catch {}
  }

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io({
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 4000,
      timeout: 15000,
    });

    this.socket.on('connect', () => {
      // Sync profile
      fetch('/api/player/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.playerId, name: this.playerName, skin: this.playerSkin }),
      }).catch(() => {});

      // Auto-rejoin room if connection dropped during match
      if (this.currentRoom && this.currentRoom.code) {
        this.socket?.emit('join_room', {
          code: this.currentRoom.code,
          playerId: this.playerId,
          name: this.playerName,
          skin: this.playerSkin,
        });
      }
    });

    this.socket.on('connect_error', (err) => {
      // Keep console clean while automatically recovering
      console.debug('Multiplayer connection attempt:', err.message);
    });

    this.socket.on('room_created', (room: RoomState) => {
      this.currentRoom = room;
      this.notifyRoomListeners();
    });

    this.socket.on('room_joined', (room: RoomState) => {
      this.currentRoom = room;
      this.notifyRoomListeners();
    });

    this.socket.on('room_updated', (room: RoomState) => {
      this.currentRoom = room;
      this.notifyRoomListeners();
    });

    this.socket.on('match_found', (room: RoomState) => {
      this.currentRoom = room;
      this.notifyMatchmakingStatus('found');
      this.notifyRoomListeners();
    });

    this.socket.on('matchmaking_waiting', () => {
      this.notifyMatchmakingStatus('searching');
    });

    this.socket.on('matchmaking_cancelled', () => {
      this.notifyMatchmakingStatus('idle');
    });

    this.socket.on('countdown_tick', ({ count, room }: { count: number; room: RoomState }) => {
      this.currentRoom = room;
      this.countdownListeners.forEach((cb) => cb(count));
      this.notifyRoomListeners();
    });

    this.socket.on('match_started', (room: RoomState) => {
      this.currentRoom = room;
      this.remotePlayer = null;
      this.matchStartListeners.forEach((cb) => cb(room));
      this.notifyRoomListeners();
    });

    this.socket.on('remote_player_update', (data: RemotePlayerState) => {
      this.remotePlayer = data;
      this.lastRemoteUpdate = performance.now();
      this.targetX = data.x;
      this.targetY = data.y;

      // If first packet, snap immediately
      if (this.currentX === 0 && this.currentY === 0) {
        this.currentX = data.x;
        this.currentY = data.y;
      }
    });

    this.socket.on('match_ended', (data) => {
      if (this.currentRoom) {
        this.currentRoom.status = 'finished';
        this.currentRoom.winnerId = data.winnerId;
        this.currentRoom.winnerReason = data.reason;
      }
      this.matchEndListeners.forEach((cb) => cb(data));
      this.notifyRoomListeners();
    });

    this.socket.on('rematch_accepted', (room: RoomState) => {
      this.currentRoom = room;
      this.remotePlayer = null;
      this.notifyRoomListeners();
    });

    this.socket.on('receive_emote', (data) => {
      this.emoteListeners.forEach((cb) => cb(data));
    });

    this.socket.on('room_error', ({ message }) => {
      this.errorListeners.forEach((cb) => cb(message));
    });

    return this.socket;
  }

  // Interpolate opponent position smoothly (lerp)
  public updateInterpolation(deltaMs: number = 16.6667) {
    if (!this.remotePlayer) return;
    const factor = Math.min(1, deltaMs * 0.025); // Smooth responsive blend
    this.currentX += (this.targetX - this.currentX) * factor;
    this.currentY += (this.targetY - this.currentY) * factor;
  }

  public getInterpolatedRemotePlayer(): RemotePlayerState | null {
    if (!this.remotePlayer) return null;
    return {
      ...this.remotePlayer,
      x: this.currentX,
      y: this.currentY,
    };
  }

  // Send local player update to room
  public sendPlayerUpdate(state: Omit<RemotePlayerState, 'id' | 'name' | 'skin' | 'timestamp'>) {
    if (!this.socket || !this.currentRoom || this.currentRoom.status !== 'playing') return;

    const now = performance.now();
    if (now - this.lastSendTime < this.SEND_INTERVAL_MS) return;
    this.lastSendTime = now;

    const payload: RemotePlayerState = {
      ...state,
      id: this.playerId,
      name: this.playerName,
      skin: this.playerSkin,
      timestamp: Date.now(),
    };

    this.socket.emit('player_update', payload);
  }

  public createRoom(mode: MultiplayerMode = 'parkour') {
    this.connect().emit('create_room', {
      playerId: this.playerId,
      name: this.playerName,
      skin: this.playerSkin,
      mode,
    });
  }

  public joinRoom(code: string) {
    this.connect().emit('join_room', {
      code,
      playerId: this.playerId,
      name: this.playerName,
      skin: this.playerSkin,
    });
  }

  public findMatch(preferredMode: MultiplayerMode = 'parkour') {
    this.connect().emit('find_match', {
      playerId: this.playerId,
      name: this.playerName,
      skin: this.playerSkin,
      preferredMode,
    });
  }

  public cancelMatchmaking() {
    if (this.socket) {
      this.socket.emit('cancel_matchmaking', { playerId: this.playerId });
    }
  }

  public selectMode(mode: MultiplayerMode, parkourLevelIndex = 0) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('select_mode', {
        code: this.currentRoom.code,
        mode,
        parkourLevelIndex,
      });
    }
  }

  public toggleReady() {
    if (this.socket && this.currentRoom) {
      this.socket.emit('toggle_ready', {
        code: this.currentRoom.code,
        playerId: this.playerId,
      });
    }
  }

  public startMatch() {
    if (this.socket && this.currentRoom) {
      this.socket.emit('start_match', { code: this.currentRoom.code });
    }
  }

  public reportGoalReached() {
    if (this.socket && this.currentRoom) {
      this.socket.emit('player_reach_goal', {
        code: this.currentRoom.code,
        playerId: this.playerId,
      });
    }
  }

  public notifyGoalReached() {
    this.reportGoalReached();
  }

  public reportElimination(altitude: number) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('player_eliminated', {
        code: this.currentRoom.code,
        playerId: this.playerId,
        altitude,
      });
    }
  }

  public notifyEliminated(altitude: number) {
    this.reportElimination(altitude);
  }

  public sendEmote(emote: string) {
    if (this.socket && this.currentRoom) {
      this.socket.emit('send_emote', {
        code: this.currentRoom.code,
        emote,
        playerId: this.playerId,
      });
    }
  }

  public requestRematch() {
    if (this.socket && this.currentRoom) {
      this.socket.emit('request_rematch', {
        code: this.currentRoom.code,
        playerId: this.playerId,
      });
    }
  }

  public leaveRoom() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentRoom = null;
    this.remotePlayer = null;
    this.notifyRoomListeners();
  }

  public async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return await res.json();
    } catch {
      return [];
    }
  }

  public async fetchPlayerProfile(): Promise<LeaderboardEntry | null> {
    try {
      const res = await fetch(`/api/player/${this.playerId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // Observable Subscriptions
  public onRoomUpdate(cb: (room: RoomState | null) => void) {
    this.roomListeners.push(cb);
    return () => {
      this.roomListeners = this.roomListeners.filter((c) => c !== cb);
    };
  }

  public onCountdownTick(cb: (count: number) => void) {
    this.countdownListeners.push(cb);
    return () => {
      this.countdownListeners = this.countdownListeners.filter((c) => c !== cb);
    };
  }

  public onMatchStart(cb: (room: RoomState) => void) {
    this.matchStartListeners.push(cb);
    return () => {
      this.matchStartListeners = this.matchStartListeners.filter((c) => c !== cb);
    };
  }

  public onMatchEnd(cb: (result: MatchEndPayload) => void) {
    this.matchEndListeners.push(cb);
    return () => {
      this.matchEndListeners = this.matchEndListeners.filter((c) => c !== cb);
    };
  }

  public onEmote(cb: (data: { emote: string; playerId: string }) => void) {
    this.emoteListeners.push(cb);
    return () => {
      this.emoteListeners = this.emoteListeners.filter((c) => c !== cb);
    };
  }

  public onError(cb: (msg: string) => void) {
    this.errorListeners.push(cb);
    return () => {
      this.errorListeners = this.errorListeners.filter((c) => c !== cb);
    };
  }

  public onMatchmakingStatus(cb: (status: 'idle' | 'searching' | 'found') => void) {
    this.matchmakingStatusListeners.push(cb);
    return () => {
      this.matchmakingStatusListeners = this.matchmakingStatusListeners.filter((c) => c !== cb);
    };
  }

  private notifyRoomListeners() {
    this.roomListeners.forEach((cb) => cb(this.currentRoom));
  }

  private notifyMatchmakingStatus(status: 'idle' | 'searching' | 'found') {
    this.matchmakingStatusListeners.forEach((cb) => cb(status));
  }
}

export const multiplayerClient = new MultiplayerClient();
