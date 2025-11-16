import { games, playerWsMap } from "../../db/inMemoryDB";
import { sendMessage } from "../../helpers/sendMessage";

export const handleStartGame = (gameId: string) => {
  const game = games[gameId];
  if (!game) return;

  if (!game.currentPlayerId) {
    const firstPlayerId = Object.keys(game.players)[0];
    game.currentPlayerId = firstPlayerId;
  }

  // Send start game for both players
  Object.values(game.players).forEach((player) => {
    const ws = playerWsMap.get(player.id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, "start_game", {
        ships: player.ships,
        currentPlayerIndex: game.currentPlayerId,
      });
    }
  });
};
