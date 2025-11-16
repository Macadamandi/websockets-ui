import { WebSocket } from "ws";
import { rooms, players, playerWsMap } from "../../db/inMemoryDB";
import { sendMessage } from "../../helpers/sendMessage";
import { handleUpdateRoom } from "./handleUpdateRoom";
import { getPlayerId } from "../../helpers/getPlayerId";

export const handleAddUserToRoom = (ws: WebSocket, roomId: string) => {
  const playerId = getPlayerId(ws);
  if (!playerId) return;

  const player = players[playerId];
  if (!player) return;

  const targetRoom = rooms[roomId];
  if (!targetRoom) return;

  if (player.roomId) {
    const currentRoom = rooms[player.roomId];
    if (currentRoom) {
      if (currentRoom.players.length === 1) {
        delete rooms[player.roomId];
      } else {
        return;
      }
    }
  }

  if (!targetRoom.players.find((p) => p.id === player.id)) {
    targetRoom.players.push(player);
    player.roomId = roomId;
  }

  if (targetRoom.players.length === 2) {
    targetRoom.players.forEach((p) => {
      const wsClient = playerWsMap.get(p.id);
      if (wsClient) {
        sendMessage(wsClient, "create_game", { idGame: roomId, idPlayer: p.id });
      }
    });
    handleUpdateRoom();
  }

  sendMessageToRoom(roomId);
};

const sendMessageToRoom = (roomId: string) => {
  const room = rooms[roomId];
  if (!room) return;

  const roomData = {
    roomId: room.id,
    roomUsers: room.players.map((player) => ({ name: player.name, index: player.id })),
  };

  room.players.forEach((player) => {
    const wsClient = playerWsMap.get(player.id);
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      sendMessage(wsClient, "update_room", [roomData]);
    }
  });
};
