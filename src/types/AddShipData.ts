import { Ship } from "./Ship";

export interface AddShipsData {
  gameId: string;
  ships: Ship[];
  indexPlayer: string;
}
