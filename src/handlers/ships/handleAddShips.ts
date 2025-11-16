import WebSocket from "ws";
import { AddShipsData } from "../../types/AddShipData";
import { sendMessage } from "../../helpers/sendMessage";
import { games } from "../../db/inMemoryDB";
import { handleStartGame } from "./handleStartGame";

const allPlayersReady = (gameId: string) => {
  const game = games[gameId];
  if (!game) return false;
  return Object.values(game.players).every((p) => p.ready === true);
};

export const handleAddShips = (ws: WebSocket, msgData: string) => {
  const { gameId, ships, indexPlayer }: AddShipsData = JSON.parse(msgData);

  const game = games[gameId];
  if (!game) return;

  const player = game.players[indexPlayer];
  if (!player) return;

  player.ships = ships;
  player.ready = true;

  sendMessage(ws, "add_ships", { ships });

  if (allPlayersReady(gameId)) {
    handleStartGame(gameId);
  }
};
