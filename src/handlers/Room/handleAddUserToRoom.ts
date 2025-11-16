import { WebSocket } from "ws";
import { rooms, players, playerWsMap, games } from "../../db/inMemoryDB";
import { sendMessage } from "../../helpers/sendMessage";
import { getPlayerId } from "../../helpers/getPlayerId";

export const handleAddUserToRoom = (ws: WebSocket, roomId: string) => {
  const playerId = getPlayerId(ws);
  if (!playerId) return;

  const player = players[playerId];
  if (!player) return;

  const targetRoom = rooms[roomId];
  if (!targetRoom) return;

  if (player.roomId && player.roomId !== roomId) {
    const currentRoom = rooms[player.roomId];
    if (currentRoom) {
      if (currentRoom.players.length === 1) {
        delete rooms[player.roomId];
        player.roomId = undefined;
      } else {
        return;
      }
    }
  }

  if (!targetRoom.players.find((p) => p.id === player.id)) {
    targetRoom.players.push(player);
    player.roomId = roomId;
  }

  // Create game if 2 players
  if (targetRoom.players.length === 2) {
    const gameId = targetRoom.id;
    games[gameId] = {
      id: gameId,
      players: {
        [targetRoom.players[0].id]: { id: targetRoom.players[0].id },
        [targetRoom.players[1].id]: { id: targetRoom.players[1].id },
      },
      currentPlayerId: null,
    };

    targetRoom.players.forEach((p) => {
      const wsClient = playerWsMap.get(p.id);
      if (wsClient?.readyState === WebSocket.OPEN) {
        sendMessage(wsClient, "create_game", { idGame: gameId, idPlayer: p.id });
      }
    });
  }

  sendUpdateRoom(targetRoom);

  sendUpdateAllRooms();
};

// Update current room
export const sendUpdateRoom = (room: (typeof rooms)[string]) => {
  if (!room) return;

  const roomData = {
    roomId: room.id,
    roomUsers: room.players.map((player) => ({ name: player.name, index: player.id })),
  };

  room.players.forEach((player) => {
    const wsClient = playerWsMap.get(player.id);
    if (wsClient?.readyState === WebSocket.OPEN) {
      sendMessage(wsClient, "update_room", [roomData]);
    }
  });
};

// Update all room for all players
export const sendUpdateAllRooms = () => {
  const roomsData = Object.values(rooms).map((room) => ({
    roomId: room.id,
    roomUsers: room.players.map((player) => ({ name: player.name, index: player.id })),
  }));

  playerWsMap.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, "update_room", roomsData);
    }
  });
};
