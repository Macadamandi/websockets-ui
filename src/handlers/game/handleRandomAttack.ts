import WebSocket from "ws";
import { games } from "../../db/inMemoryDB";
import { handleAttack } from "./handleAttack";
import { RandomAttack } from "../../types/RandomAttack";

export const handleRandomAttack = (ws: WebSocket, msgData: string) => {
  const { gameId, indexPlayer }: RandomAttack = JSON.parse(msgData);
  const game = games[gameId];
  if (!game) return;

  if (game.currentPlayerId !== indexPlayer) return;

  const opponentId = Object.keys(game.players).find((id) => id !== indexPlayer);
  if (!opponentId) return;

  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);

  handleAttack(ws, JSON.stringify({ gameId, x, y, indexPlayer }));
};
