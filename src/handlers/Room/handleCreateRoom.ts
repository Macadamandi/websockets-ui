import { WebSocket } from "ws";
import { rooms, players } from "../../db/inMemoryDB";
import { generateUUID } from "../../helpers/generateUUID";
import { handleUpdateRoom } from "./handleUpdateRoom";
import { getPlayerId } from "../../helpers/getPlayerId";

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

  handleUpdateRoom();
};
