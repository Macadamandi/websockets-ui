import { WebSocketServer, WebSocket } from "ws";
import { handleMessage } from "../handlers/Message/handleMessage";
import { players, rooms, playerWsMap } from "../db/inMemoryDB";

export const createWsServer = (port: number) => {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected");

    ws.on("message", (raw) => handleMessage(ws, raw));

    ws.on("close", () => {
      console.log("Client disconnected");

      // Player disconnects
      const playerId = [...playerWsMap.entries()].find(([_, w]) => w === ws)?.[0];
      if (playerId) {
        console.log(`Player ${players[playerId]} disconnected`);
        playerWsMap.delete(playerId);

        const player = players[playerId];
        if (player?.roomId) {
          const room = rooms[player.roomId];
          if (room) {
            room.players = room.players.filter((p) => p.id !== playerId);
            if (room.players.length === 0) {
              delete rooms[player.roomId];
              console.log(`Room ${player.roomId} deleted because it became empty`);
            }
          }
          player.roomId = null;
        }
      }
    });
  });

  console.log(`WebSocket server running on ws://localhost:${port}`);
};
