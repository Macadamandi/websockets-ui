import WebSocket from "ws";
import { playerWsMap } from "../db/inMemoryDB";

// Get player id from map
export const getPlayerId = (ws: WebSocket): string | undefined => {
  return [...playerWsMap.entries()].find(([_, client]) => client === ws)?.[0];
};
