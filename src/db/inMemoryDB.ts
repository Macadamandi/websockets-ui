import type WebSocket from "ws";
import { Player } from "../types/Player";
import { Room } from "../types/Room";

export const players: Record<string, Player> = {};
export const rooms: Record<string, Room> = {};
export const playerWsMap: Map<string, WebSocket> = new Map();
