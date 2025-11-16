import { Ship } from "./Ship";

export interface PlayerInGame {
  id: string;
  ships?: Ship[];
  ready?: boolean;
}

export interface Game {
  id: string;
  players: Record<string, PlayerInGame>;
  currentPlayerId?: string | null;
}
