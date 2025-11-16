import { WebSocket } from "ws";
import { rooms, players } from "../../db/inMemoryDB";
import { generateUUID } from "../../helpers/generateUUID";
import { getPlayerId } from "../../helpers/getPlayerId";
import { sendUpdateAllRooms, sendUpdateRoom } from "./handleAddUserToRoom";

export const handleCreateRoom = (ws: WebSocket) => {
  const playerId = getPlayerId(ws);
  if (!playerId) return;

  const player = players[playerId];
  if (!player || player.roomId) return;

  const roomId = generateUUID();

  rooms[roomId] = {
    id: roomId,
    players: [player],
  };

  player.roomId = roomId;

  sendUpdateRoom(rooms[roomId]);

  sendUpdateAllRooms();
};
