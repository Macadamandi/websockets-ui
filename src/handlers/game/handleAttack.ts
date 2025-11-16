import { WebSocket } from "ws";
import { AttackData } from "../../types/AttackData";
import { games, players, rooms, playerWsMap } from "../../db/inMemoryDB";
import { sendMessage } from "../../helpers/sendMessage";
import { getSurroundingCells } from "./attackHelpers";
import { handleUpdateWinners } from "../Player/handleUpdateWinners";
import { handleUpdateRoom } from "../Room/handleUpdateRoom";

export const handleAttack = (ws: WebSocket, msgData: string) => {
  const { gameId, x, y, indexPlayer }: AttackData = JSON.parse(msgData);

  const game = games[gameId];
  if (!game) return;

  if (game.currentPlayerId !== indexPlayer) return;

  const opponentId = Object.keys(game.players).find((id) => id !== indexPlayer);
  if (!opponentId) return;

  const opponent = game.players[opponentId];
  if (!opponent.ships) return;

  // Opponent ship
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

    console.log(
      `Player ${indexPlayer} hit ship at (${x}, ${y})` +
        (status === "killed" ? ` - ship destroyed! Length: ${ship.length}` : "")
    );
  } else {
    console.log(`Player ${indexPlayer} missed at (${x}, ${y})`);
  }

  // Attack feedback
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

  // Finish and update winners
  if (opponent.ships.every((s) => s.destroyed)) {
    const winnerId = indexPlayer;
    const winnerName = players[winnerId].name;

    handleUpdateWinners(winnerName);

    const roomId = players[winnerId].roomId;

    Object.keys(game.players).forEach((playerId) => {
      const wsClient = playerWsMap.get(playerId);
      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        sendMessage(wsClient, "finish", { winPlayer: winnerId });
      }

      const playerObj = players[playerId];
      if (playerObj) playerObj.roomId = undefined;
    });

    console.log(`Game over!\nWinner: ${winnerName}`);

    delete games[gameId];

    if (roomId && rooms[roomId]) delete rooms[roomId];

    handleUpdateRoom();

    return;
  }

  // Turn 
  if (status === "miss") game.currentPlayerId = opponentId;

  Object.keys(game.players).forEach((pid) => {
    const wsClient = playerWsMap.get(pid);
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      sendMessage(wsClient, "turn", { currentPlayer: game.currentPlayerId });
    }
  });
};
