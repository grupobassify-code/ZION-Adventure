import { Peer, DataConnection } from 'peerjs';
import {
  MultiplayerMode,
  RoomState,
  RemotePlayerState,
  LeaderboardEntry,
  MatchEndPayload,
  NetworkPlayer,
} from '../types/multiplayer';

interface PeerMessage {
  type:
    | 'join_request'
    | 'room_state'
    | 'toggle_ready'
    | 'select_mode'
    | 'countdown_tick'
    | 'match_started'
    | 'player_update'
    | 'match_ended'
    | 'emote'
    | 'rematch_request'
    | 'player_eliminated'
    | 'player_reached_goal'
    | 'ping'
    | 'pong';
  payload?: any;
}

class MultiplayerClient {
  public playerId: string = '';
  public playerName: string = '';
  public playerSkin: string = 'zion';
  public currentRoom: RoomState | null = null;
  public remotePlayer: RemotePlayerState | null = null;
  public lastRemoteUpdate: number = 0;

  // WebRTC P2P
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private isHost: boolean = false;
  private peerInitPromise: Promise<Peer> | null = null;
  private matchTimer: any = null;

  // Bot simulation loop
  private botInterval: any = null;
  private botProgress: number = 0;
  private botX: number = 100;
  private botY: number = 140;
  private botVy: number = 0;
  private botFacing: 1 | -1 = 1;

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
  private readonly SEND_INTERVAL_MS = 30; // ~33Hz network updates

  constructor() {
    this.initPlayerIdentity();
  }

  private initPlayerIdentity() {
    try {
      let tabId = sessionStorage.getItem('zion_p2p_player_id');
      if (!tabId) {
        tabId = 'p_' + Math.random().toString(36).substring(2, 8) + '_' + Date.now().toString(36).slice(-4);
        sessionStorage.setItem('zion_p2p_player_id', tabId);
      }
      this.playerId = tabId;

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
      this.playerId = 'p_' + Math.random().toString(36).substring(2, 8);
      this.playerName = 'Zion_Runner';
    }
  }

  public setPlayerName(name: string) {
    this.playerName = name.trim() || 'Zion';
    try {
      localStorage.setItem('zion_multiplayer_player_name', this.playerName);
    } catch {}

    if (this.currentRoom) {
      const p = this.currentRoom.players.find((pl) => pl.id === this.playerId);
      if (p) {
        p.name = this.playerName;
        this.broadcastRoomState();
      }
    }
  }

  public setPlayerSkin(skin: string) {
    this.playerSkin = skin;
    try {
      localStorage.setItem('zion_selected_skin', skin);
    } catch {}

    if (this.currentRoom) {
      const p = this.currentRoom.players.find((pl) => pl.id === this.playerId);
      if (p) {
        p.skin = skin;
        this.broadcastRoomState();
      }
    }
  }

  // Helper to ensure Peer instance is ready
  private getOrCreatePeer(customId?: string): Promise<Peer> {
    if (this.peer && !this.peer.destroyed) {
      if (!customId || this.peer.id === customId) {
        return Promise.resolve(this.peer);
      }
      // If a different ID is requested, destroy old peer first
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }

    this.peerInitPromise = new Promise((resolve, reject) => {
      try {
        const id = customId || `zion-p2p-${this.playerId.replace(/[^a-zA-Z0-9]/g, '')}`;
        const p = new Peer(id, {
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
            ],
          },
        });

        p.on('open', () => {
          this.peer = p;
          resolve(p);
        });

        p.on('connection', (conn) => {
          this.handleIncomingConnection(conn);
        });

        p.on('error', (err: any) => {
          console.warn('P2P Peer error:', err);
          if (err.type === 'unavailable-id') {
            this.notifyError('Ese código ya está en uso. Intenta con otro o crea una nueva sala.');
          } else if (err.type === 'peer-unavailable') {
            this.notifyError('No se encontró la sala. Verifica que el código sea correcto y que el anfitrión esté esperando.');
          }
        });

        // Fail-safe timeout
        setTimeout(() => {
          if (!p.open) {
            resolve(p);
          }
        }, 3500);
      } catch (err: any) {
        console.error('Failed to instantiate PeerJS:', err);
        reject(err);
      }
    });

    return this.peerInitPromise;
  }

  public connect() {
    this.getOrCreatePeer().catch(() => {});
    return this;
  }

  // Handle incoming data connection on host
  private handleIncomingConnection(conn: DataConnection) {
    this.connection = conn;
    this.setupConnectionHandlers(conn);
  }

  private setupConnectionHandlers(conn: DataConnection) {
    conn.on('open', () => {
      console.log('P2P DataChannel open with remote player');
      if (this.isHost && this.currentRoom) {
        this.sendToPeer({ type: 'room_state', payload: this.currentRoom });
      }
    });

    conn.on('data', (raw: any) => {
      this.handlePeerMessage(raw as PeerMessage);
    });

    conn.on('close', () => {
      console.log('P2P Peer connection closed');
      if (this.currentRoom && this.currentRoom.status === 'playing') {
        const remaining = this.currentRoom.players.filter((p) => p.id === this.playerId);
        this.currentRoom.players = remaining;
        this.currentRoom.status = 'finished';
        this.currentRoom.winnerId = this.playerId;
        this.currentRoom.winnerReason = '¡El rival se ha desconectado de la partida!';
        this.notifyMatchEnd({
          winnerId: this.playerId,
          winnerName: this.playerName,
          reason: '¡El rival se ha desconectado de la partida!',
          trophiesAwarded: 25,
          winnerTrophiesAwarded: 25,
          loserTrophiesLost: 0,
          room: this.currentRoom,
        });
      } else if (this.currentRoom) {
        this.currentRoom.players = this.currentRoom.players.filter((p) => p.id === this.playerId);
        this.currentRoom.status = 'waiting';
        this.broadcastRoomState();
      }
    });

    conn.on('error', (err) => {
      console.warn('P2P connection error:', err);
    });
  }

  private handlePeerMessage(msg: PeerMessage) {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'join_request': {
        if (!this.isHost || !this.currentRoom) return;
        const guest: NetworkPlayer = {
          id: msg.payload.id,
          name: msg.payload.name || 'Rival',
          skin: msg.payload.skin || 'zion',
          isHost: false,
          isReady: false,
          trophies: msg.payload.trophies || 100,
        };
        // Replace or add
        const existingIdx = this.currentRoom.players.findIndex((p) => p.id === guest.id);
        if (existingIdx >= 0) {
          this.currentRoom.players[existingIdx] = guest;
        } else {
          this.currentRoom.players.push(guest);
        }
        this.currentRoom.status = 'ready';
        this.broadcastRoomState();
        break;
      }

      case 'room_state': {
        this.currentRoom = msg.payload;
        this.notifyRoomListeners();
        break;
      }

      case 'toggle_ready': {
        if (!this.currentRoom) return;
        const target = this.currentRoom.players.find((p) => p.id === msg.payload.playerId);
        if (target) {
          target.isReady = !target.isReady;
          if (this.isHost) {
            this.broadcastRoomState();
          } else {
            this.notifyRoomListeners();
          }
        }
        break;
      }

      case 'select_mode': {
        if (!this.currentRoom) return;
        this.currentRoom.mode = msg.payload.mode;
        if (msg.payload.parkourLevelIndex !== undefined) {
          this.currentRoom.parkourLevelIndex = msg.payload.parkourLevelIndex;
        }
        this.notifyRoomListeners();
        break;
      }

      case 'countdown_tick': {
        if (this.currentRoom) {
          this.currentRoom.countdown = msg.payload.count;
        }
        this.countdownListeners.forEach((cb) => cb(msg.payload.count));
        this.notifyRoomListeners();
        break;
      }

      case 'match_started': {
        this.currentRoom = msg.payload;
        this.remotePlayer = null;
        this.matchStartListeners.forEach((cb) => cb(this.currentRoom!));
        this.notifyRoomListeners();
        break;
      }

      case 'player_update': {
        const data: RemotePlayerState = msg.payload;
        this.remotePlayer = data;
        this.lastRemoteUpdate = performance.now();
        this.targetX = data.x;
        this.targetY = data.y;

        if (this.currentX === 0 && this.currentY === 0) {
          this.currentX = data.x;
          this.currentY = data.y;
        }
        break;
      }

      case 'player_reached_goal': {
        if (!this.currentRoom || this.currentRoom.status === 'finished') return;
        const winner = this.currentRoom.players.find((p) => p.id === msg.payload.playerId);
        const winnerName = winner?.name || 'Rival';
        this.finishMatch(msg.payload.playerId, winnerName, `¡${winnerName} cruzó la meta primero!`);
        break;
      }

      case 'player_eliminated': {
        if (!this.currentRoom || this.currentRoom.status === 'finished') return;
        // The one who didn't fall wins
        const fallenId = msg.payload.playerId;
        const winner = this.currentRoom.players.find((p) => p.id !== fallenId);
        const winnerId = winner?.id || this.playerId;
        const winnerName = winner?.name || this.playerName;
        this.finishMatch(winnerId, winnerName, `¡El rival cayó al vacío a los ${Math.round(msg.payload.altitude || 0)}m!`);
        break;
      }

      case 'match_ended': {
        this.currentRoom = msg.payload.room;
        this.notifyMatchEnd(msg.payload);
        break;
      }

      case 'emote': {
        this.emoteListeners.forEach((cb) => cb(msg.payload));
        break;
      }

      case 'rematch_request': {
        if (this.currentRoom) {
          this.currentRoom.status = 'ready';
          this.currentRoom.winnerId = null;
          this.currentRoom.winnerReason = undefined;
          this.remotePlayer = null;
          this.notifyRoomListeners();
        }
        break;
      }
    }
  }

  private sendToPeer(msg: PeerMessage) {
    if (this.connection && this.connection.open) {
      try {
        this.connection.send(msg);
      } catch (e) {
        console.warn('Error sending P2P message:', e);
      }
    }
  }

  private broadcastRoomState() {
    this.notifyRoomListeners();
    if (this.isHost && this.currentRoom) {
      this.sendToPeer({ type: 'room_state', payload: this.currentRoom });
    }
  }

  // Smooth position interpolation for opponent
  public updateInterpolation(deltaMs: number = 16.6667) {
    if (!this.remotePlayer) return;
    const factor = Math.min(1, deltaMs * 0.025);
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

  // Send local player coordinates to peer
  public sendPlayerUpdate(state: Omit<RemotePlayerState, 'id' | 'name' | 'skin' | 'timestamp'>) {
    if (!this.currentRoom || this.currentRoom.status !== 'playing') return;

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

    this.sendToPeer({ type: 'player_update', payload });
  }

  // 1. CREATE ROOM (HOST)
  public async createRoom(mode: MultiplayerMode = 'parkour') {
    this.leaveRoom();
    this.isHost = true;

    // Generate neat 5-char code
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const peerId = `zion-room-${code.toLowerCase()}`;

    try {
      await this.getOrCreatePeer(peerId);

      const localPlayer: NetworkPlayer = {
        id: this.playerId,
        name: this.playerName,
        isHost: true,
        isReady: true,
        skin: this.playerSkin,
        trophies: this.getLocalTrophies(),
      };

      this.currentRoom = {
        code,
        mode,
        status: 'waiting',
        hostId: this.playerId,
        players: [localPlayer],
        parkourLevelIndex: 0,
      };

      this.notifyRoomListeners();
    } catch (err) {
      console.error('Failed to create P2P room:', err);
      this.notifyError('Error creando la sala P2P. Revisa tu conexión.');
    }
  }

  // 2. JOIN ROOM (GUEST)
  public async joinRoom(code: string) {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      this.notifyError('Introduce un código de sala válido.');
      return;
    }

    this.leaveRoom();
    this.isHost = false;

    const targetPeerId = `zion-room-${cleanCode.toLowerCase()}`;

    try {
      const myPeer = await this.getOrCreatePeer();
      const conn = myPeer.connect(targetPeerId, { reliable: true });
      this.connection = conn;
      this.setupConnectionHandlers(conn);

      const localPlayer: NetworkPlayer = {
        id: this.playerId,
        name: this.playerName,
        isHost: false,
        isReady: false,
        skin: this.playerSkin,
        trophies: this.getLocalTrophies(),
      };

      conn.on('open', () => {
        conn.send({
          type: 'join_request',
          payload: localPlayer,
        });
      });

      // Timeout if room doesn't respond
      setTimeout(() => {
        if (!this.currentRoom) {
          this.notifyError(`No se pudo conectar a la sala "${cleanCode}". Verifica que el código esté bien escrito y el anfitrión siga en la sala.`);
        }
      }, 7000);
    } catch (err) {
      console.error('Failed to join P2P room:', err);
      this.notifyError('Error conectando a la sala.');
    }
  }

  // 3. MATCHMAKING
  public async findMatch(preferredMode: MultiplayerMode = 'parkour') {
    this.notifyMatchmakingStatus('searching');
    const lobbyCode = `LOBBY_${preferredMode.toUpperCase()}`;
    const targetPeerId = `zion-lobby-${preferredMode}`;

    try {
      const myPeer = await this.getOrCreatePeer();
      const conn = myPeer.connect(targetPeerId);

      let found = false;
      conn.on('open', () => {
        found = true;
        this.isHost = false;
        this.connection = conn;
        this.setupConnectionHandlers(conn);
        conn.send({
          type: 'join_request',
          payload: {
            id: this.playerId,
            name: this.playerName,
            skin: this.playerSkin,
            trophies: this.getLocalTrophies(),
          },
        });
        this.notifyMatchmakingStatus('found');
      });

      // If no host in 4 seconds, host the lobby ourselves!
      setTimeout(async () => {
        if (!found) {
          try {
            await this.getOrCreatePeer(targetPeerId);
            this.isHost = true;
            this.currentRoom = {
              code: lobbyCode,
              mode: preferredMode,
              status: 'waiting',
              hostId: this.playerId,
              players: [
                {
                  id: this.playerId,
                  name: this.playerName,
                  isHost: true,
                  isReady: true,
                  skin: this.playerSkin,
                  trophies: this.getLocalTrophies(),
                },
              ],
              parkourLevelIndex: 0,
            };
            this.notifyRoomListeners();

            // After 6 more seconds without rival, offer instant bot
            setTimeout(() => {
              if (this.currentRoom && this.currentRoom.players.length < 2) {
                this.addBotOpponent();
              }
            }, 6000);
          } catch {
            // If lobby is busy, start direct bot match
            this.startDirectBotMatch(preferredMode);
          }
        }
      }, 3500);
    } catch {
      this.startDirectBotMatch(preferredMode);
    }
  }

  public cancelMatchmaking() {
    this.notifyMatchmakingStatus('idle');
    this.leaveRoom();
  }

  // 4. BOTS (Local Virtual Peer)
  public addBotOpponent() {
    if (!this.currentRoom) return;
    const botNames = ['Krono_Bot_Ω', 'Cyber_Ghost_99', 'Neon_Stalker', 'Phantom_Zion'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)];
    const botPlayer: NetworkPlayer = {
      id: 'bot_' + Math.random().toString(36).substring(2, 7),
      name: botName,
      isHost: false,
      isReady: true,
      isBot: true,
      skin: 'cyber',
      trophies: Math.floor(150 + Math.random() * 300),
    };

    if (this.currentRoom.players.length >= 2) {
      this.currentRoom.players[1] = botPlayer;
    } else {
      this.currentRoom.players.push(botPlayer);
    }
    this.currentRoom.status = 'ready';
    this.broadcastRoomState();
  }

  public startDirectBotMatch(preferredMode: MultiplayerMode = 'parkour') {
    this.leaveRoom();
    this.isHost = true;
    const code = 'BOT-' + Math.floor(100 + Math.random() * 900);

    this.currentRoom = {
      code,
      mode: preferredMode,
      status: 'ready',
      hostId: this.playerId,
      players: [
        {
          id: this.playerId,
          name: this.playerName,
          isHost: true,
          isReady: true,
          skin: this.playerSkin,
          trophies: this.getLocalTrophies(),
        },
        {
          id: 'bot_instant',
          name: 'Krono_AI_Alpha',
          isHost: false,
          isReady: true,
          isBot: true,
          skin: 'cyber',
          trophies: 220,
        },
      ],
      parkourLevelIndex: 0,
    };

    this.notifyRoomListeners();
    this.startMatch();
  }

  private startBotSimulation() {
    this.stopBotSimulation();
    this.botProgress = 0;
    this.botX = 80;
    this.botY = 140;
    this.botVy = 0;
    this.botFacing = 1;

    const isOnlyUp = this.currentRoom?.mode === 'onlyup';

    this.botInterval = setInterval(() => {
      if (!this.currentRoom || this.currentRoom.status !== 'playing') {
        this.stopBotSimulation();
        return;
      }

      // Smooth progression with humanized variation
      if (isOnlyUp) {
        this.botProgress += 0.8 + Math.random() * 0.4;
        this.botY = 140 - this.botProgress * 15;
        this.botX = 100 + Math.sin(this.botProgress * 0.15) * 60;
      } else {
        this.botProgress += 2.8 + Math.random() * 0.8;
        this.botX = 80 + this.botProgress * 14;
        this.botY = 140 + Math.sin(this.botProgress * 0.2) * 8;
      }

      this.remotePlayer = {
        id: 'bot_player',
        name: this.currentRoom.players.find((p) => p.isBot)?.name || 'Krono_Bot',
        x: this.botX,
        y: this.botY,
        vx: 3,
        vy: 0,
        facing: 1,
        animState: 'run',
        altitude: isOnlyUp ? Math.max(0, Math.round(this.botProgress * 2)) : undefined,
        timestamp: Date.now(),
      };
      this.targetX = this.botX;
      this.targetY = this.botY;

      // Bot wins if it finishes before player
      if (!isOnlyUp && this.botX >= 4800) {
        this.finishMatch('bot_player', this.remotePlayer.name, `¡${this.remotePlayer.name} cruzó la meta primero!`);
      }
    }, 45);
  }

  private stopBotSimulation() {
    if (this.botInterval) {
      clearInterval(this.botInterval);
      this.botInterval = null;
    }
  }

  // 5. READY & START
  public toggleReady() {
    if (!this.currentRoom) return;
    const me = this.currentRoom.players.find((p) => p.id === this.playerId);
    if (me) {
      me.isReady = !me.isReady;
      if (this.isHost) {
        this.broadcastRoomState();
      } else {
        this.sendToPeer({ type: 'toggle_ready', payload: { playerId: this.playerId } });
        this.notifyRoomListeners();
      }
    }
  }

  public selectMode(mode: MultiplayerMode, parkourLevelIndex = 0) {
    if (!this.currentRoom) return;
    this.currentRoom.mode = mode;
    this.currentRoom.parkourLevelIndex = parkourLevelIndex;
    this.broadcastRoomState();
  }

  public startMatch() {
    if (!this.currentRoom || !this.isHost) return;

    this.currentRoom.status = 'starting';
    let count = 3;
    this.currentRoom.countdown = count;

    this.broadcastRoomState();
    this.countdownListeners.forEach((cb) => cb(count));

    if (this.matchTimer) clearInterval(this.matchTimer);

    this.matchTimer = setInterval(() => {
      count--;
      if (this.currentRoom) {
        this.currentRoom.countdown = count;
      }
      this.countdownListeners.forEach((cb) => cb(count));
      this.sendToPeer({ type: 'countdown_tick', payload: { count } });
      this.notifyRoomListeners();

      if (count <= 0) {
        clearInterval(this.matchTimer);
        this.matchTimer = null;
        if (this.currentRoom) {
          this.currentRoom.status = 'playing';
          this.currentRoom.startedAt = Date.now();
          this.remotePlayer = null;
          this.sendToPeer({ type: 'match_started', payload: this.currentRoom });
          this.matchStartListeners.forEach((cb) => cb(this.currentRoom!));
          this.notifyRoomListeners();

          if (this.currentRoom.players.some((p) => p.isBot)) {
            this.startBotSimulation();
          }
        }
      }
    }, 1000);
  }

  // 6. FINISH & RESULTS
  public reportGoalReached() {
    if (!this.currentRoom || this.currentRoom.status !== 'playing') return;
    this.sendToPeer({ type: 'player_reached_goal', payload: { playerId: this.playerId } });
    this.finishMatch(this.playerId, this.playerName, '¡Cruzaste la meta en primer lugar!');
  }

  public notifyGoalReached() {
    this.reportGoalReached();
  }

  public reportElimination(altitude: number) {
    if (!this.currentRoom || this.currentRoom.status !== 'playing') return;
    this.sendToPeer({ type: 'player_eliminated', payload: { playerId: this.playerId, altitude } });
    const opponent = this.currentRoom.players.find((p) => p.id !== this.playerId);
    const winnerId = opponent?.id || 'opponent';
    const winnerName = opponent?.name || 'Rival';
    this.finishMatch(winnerId, winnerName, `¡Caíste al vacío a los ${Math.round(altitude)}m!`);
  }

  public notifyEliminated(altitude: number) {
    this.reportElimination(altitude);
  }

  private finishMatch(winnerId: string, winnerName: string, reason: string) {
    if (!this.currentRoom || this.currentRoom.status === 'finished') return;

    this.stopBotSimulation();
    this.currentRoom.status = 'finished';
    this.currentRoom.winnerId = winnerId;
    this.currentRoom.winnerReason = reason;

    const isMeWinner = winnerId === this.playerId;
    const trophiesChange = isMeWinner ? 25 : -12;
    this.updateLocalStats(isMeWinner, trophiesChange);

    const payload: MatchEndPayload = {
      winnerId,
      winnerName,
      reason,
      trophiesAwarded: isMeWinner ? 25 : 0,
      winnerTrophiesAwarded: 25,
      loserTrophiesLost: 12,
      room: this.currentRoom,
    };

    this.sendToPeer({ type: 'match_ended', payload });
    this.notifyMatchEnd(payload);
    this.broadcastRoomState();
  }

  public sendEmote(emote: string) {
    const payload = { emote, playerId: this.playerId };
    this.emoteListeners.forEach((cb) => cb(payload));
    this.sendToPeer({ type: 'emote', payload });
  }

  public requestRematch() {
    if (!this.currentRoom) return;
    this.sendToPeer({ type: 'rematch_request' });
    this.currentRoom.status = 'ready';
    this.currentRoom.winnerId = null;
    this.currentRoom.winnerReason = undefined;
    this.remotePlayer = null;
    this.broadcastRoomState();
  }

  public leaveRoom() {
    this.stopBotSimulation();
    if (this.matchTimer) {
      clearInterval(this.matchTimer);
      this.matchTimer = null;
    }
    if (this.connection) {
      try {
        this.connection.close();
      } catch {}
      this.connection = null;
    }
    this.currentRoom = null;
    this.remotePlayer = null;
    this.isHost = false;
    this.notifyRoomListeners();
  }

  // 7. LOCAL LEADERBOARD & STATS (100% OFFLINE / GITHUB PAGES COMPATIBLE)
  private getLocalTrophies(): number {
    try {
      const v = localStorage.getItem('zion_multiplayer_trophies');
      return v ? parseInt(v, 10) : 120;
    } catch {
      return 120;
    }
  }

  private updateLocalStats(isWin: boolean, trophiesChange: number) {
    try {
      const currentTrophies = this.getLocalTrophies();
      const newTrophies = Math.max(0, currentTrophies + trophiesChange);
      localStorage.setItem('zion_multiplayer_trophies', newTrophies.toString());

      const wins = parseInt(localStorage.getItem('zion_multiplayer_wins') || '0', 10) + (isWin ? 1 : 0);
      localStorage.setItem('zion_multiplayer_wins', wins.toString());

      const matches = parseInt(localStorage.getItem('zion_multiplayer_matches') || '0', 10) + 1;
      localStorage.setItem('zion_multiplayer_matches', matches.toString());
    } catch {}
  }

  public async fetchPlayerProfile(): Promise<LeaderboardEntry | null> {
    const trophies = this.getLocalTrophies();
    let wins = 0;
    let matches = 0;
    try {
      wins = parseInt(localStorage.getItem('zion_multiplayer_wins') || '3', 10);
      matches = parseInt(localStorage.getItem('zion_multiplayer_matches') || '5', 10);
    } catch {}

    const tier: LeaderboardEntry['tier'] =
      trophies >= 2000
        ? 'Maestro Kronos'
        : trophies >= 1000
        ? 'Diamante'
        : trophies >= 500
        ? 'Oro'
        : trophies >= 200
        ? 'Plata'
        : 'Bronce';

    return {
      id: this.playerId,
      name: this.playerName,
      trophies,
      wins,
      matchesPlayed: matches,
      rank: 4,
      tier,
      lastActive: Date.now(),
      avatarSkin: this.playerSkin,
    };
  }

  public async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    const profile = await this.fetchPlayerProfile();
    const myTrophies = profile?.trophies || 120;

    const baseEntries: LeaderboardEntry[] = [
      {
        id: 'legend_1',
        name: 'Kronos_Titan_Ω',
        trophies: 2850,
        wins: 142,
        matchesPlayed: 160,
        rank: 1,
        tier: 'Maestro Kronos',
        lastActive: Date.now() - 3600000,
        avatarSkin: 'golden',
      },
      {
        id: 'legend_2',
        name: 'Neon_Viper',
        trophies: 1950,
        wins: 95,
        matchesPlayed: 118,
        rank: 2,
        tier: 'Diamante',
        lastActive: Date.now() - 7200000,
        avatarSkin: 'cyber',
      },
      {
        id: 'legend_3',
        name: 'Quantum_Runner',
        trophies: 1420,
        wins: 67,
        matchesPlayed: 89,
        rank: 3,
        tier: 'Diamante',
        lastActive: Date.now() - 14400000,
        avatarSkin: 'ninja',
      },
    ];

    if (profile) {
      baseEntries.push(profile);
    }

    baseEntries.push(
      {
        id: 'rival_5',
        name: 'Shadow_Ninja',
        trophies: 340,
        wins: 14,
        matchesPlayed: 25,
        rank: 5,
        tier: 'Plata',
        lastActive: Date.now() - 18000000,
        avatarSkin: 'ninja',
      },
      {
        id: 'rival_6',
        name: 'Solar_Blaze',
        trophies: 95,
        wins: 4,
        matchesPlayed: 12,
        rank: 6,
        tier: 'Bronce',
        lastActive: Date.now() - 86400000,
        avatarSkin: 'gold',
      }
    );

    // Sort by trophies descending
    baseEntries.sort((a, b) => b.trophies - a.trophies);
    baseEntries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return baseEntries;
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

  private notifyMatchEnd(payload: MatchEndPayload) {
    this.matchEndListeners.forEach((cb) => cb(payload));
  }

  private notifyError(msg: string) {
    this.errorListeners.forEach((cb) => cb(msg));
  }
}

export const multiplayerClient = new MultiplayerClient();
