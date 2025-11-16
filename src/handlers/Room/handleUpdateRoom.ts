import WebSocket from "ws";
import { rooms, playerWsMap } from "../../db/inMemoryDB";
import { sendMessage } from "../../helpers/sendMessage";

export const handleUpdateRoom = () => {
  const roomsData = Object.values(rooms)
    .filter((room) => room.players.length === 1)
    .map((room) => ({
      roomId: room.id,
      roomUsers: room.players.map((player) => ({ name: player.name, index: player.id })),
    }));

  playerWsMap.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, "update_room", roomsData);
    }
  });
};
