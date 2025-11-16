import { WebSocket } from "ws";
import { AttackData } from "../../types/AttackData";
import { games, playerWsMap } from "../../db/inMemoryDB";
import { sendMessage } from "../../helpers/sendMessage";
import { getSurroundingCells } from "./attackHelpers";

export const handleAttack = (ws: WebSocket, msgData: string) => {
  const { gameId, x, y, indexPlayer }: AttackData = JSON.parse(msgData);

  const game = games[gameId];
  if (!game) return;

  if (game.currentPlayerId !== indexPlayer) return;

  const opponentId = Object.keys(game.players).find((id) => id !== indexPlayer);
  if (!opponentId) return;

  const opponent = game.players[opponentId];
  if (!opponent.ships) return;

  const ship = opponent.ships.find((s) => {
    if (!s.direction) {
      return x >= s.position.x && x < s.position.x + s.length && y === s.position.y;
    } else {
      return y >= s.position.y && y < s.position.y + s.length && x === s.position.x;
    }
  });

  let status: "miss" | "shot" | "killed" = "miss";

  if (ship) {
    ship.hits = (ship.hits ?? 0) + 1;
    status = ship.hits === ship.length ? "killed" : "shot";
    if (status === "killed") ship.destroyed = true;
  }

  Object.keys(game.players).forEach((pid) => {
    const wsClient = playerWsMap.get(pid);
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      sendMessage(wsClient, "attack", { position: { x, y }, currentPlayer: indexPlayer, status });
    }
  });

  if (status === "killed") {
    const surrounding = getSurroundingCells(ship!);
    surrounding.forEach(({ x, y }) => {
      Object.keys(game.players).forEach((pid) => {
        const wsClient = playerWsMap.get(pid);
        if (wsClient && wsClient.readyState === WebSocket.OPEN) {
          sendMessage(wsClient, "attack", { position: { x, y }, currentPlayer: indexPlayer, status: "miss" });
        }
      });
    });
  }

  if (opponent.ships.every((s) => s.destroyed)) {
    Object.keys(game.players).forEach((pid) => {
      const wsClient = playerWsMap.get(pid);
      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        sendMessage(wsClient, "finish", { winPlayer: indexPlayer });
      }
    });
    return;
  }

  if (status === "miss") game.currentPlayerId = opponentId;

  Object.keys(game.players).forEach((pid) => {
    const wsClient = playerWsMap.get(pid);
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      sendMessage(wsClient, "turn", { currentPlayer: game.currentPlayerId });
    }
  });
};
