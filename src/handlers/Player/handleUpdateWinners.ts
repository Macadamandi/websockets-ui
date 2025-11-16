import { WebSocket } from "ws";
import { winnersDB, playerWsMap } from "../../db/inMemoryDB";
import { sendMessage } from "../../helpers/sendMessage";
import { Winner } from "../../types/Winner";

export const handleUpdateWinners = (winnerName?: string): void => {
  // Update winner points
  if (winnerName) {
    const existing = winnersDB.winners.find((w) => w.name === winnerName);
    if (existing) existing.wins += 1;
    else winnersDB.winners.push({ name: winnerName, wins: 1 });
  }

  // Sort winners
  const sorted: Winner[] = [...winnersDB.winners].sort((a, b) => b.wins - a.wins);

  playerWsMap.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      sendMessage(ws, "update_winners", sorted);
    }
  });
};
