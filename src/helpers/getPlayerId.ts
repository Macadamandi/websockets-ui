import WebSocket from "ws";
import { playerWsMap } from "../db/inMemoryDB";

export const getPlayerId = (ws: WebSocket): string | undefined => {
  return [...playerWsMap.entries()].find(([_, client]) => client === ws)?.[0];
};
