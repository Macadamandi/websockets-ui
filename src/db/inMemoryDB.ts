import type WebSocket from "ws";
import { Player } from "../types/Player";
import { Room } from "../types/Room";
import { Game } from "../types/Game";
import { Winner } from "../types/Winner";

export const players: Record<string, Player> = {};
export const rooms: Record<string, Room> = {};
export const playerWsMap: Map<string, WebSocket> = new Map();
export const games: Record<string, Game> = {};
export const winnersDB: { winners: Winner[] } = {
  winners: [],
};
