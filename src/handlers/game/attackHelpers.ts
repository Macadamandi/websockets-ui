import { Ship } from "../../types/Ship";

export const isShipHit = (ships: Ship[], x: number, y: number) => {
  for (const ship of ships) {
    if (!ship.direction) {
      if (x >= ship.position.x && x < ship.position.x + ship.length && y === ship.position.y) {
        return ship;
      }
    } else {
      if (y >= ship.position.y && y < ship.position.y + ship.length && x === ship.position.x) {
        return ship;
      }
    }
  }
  return null;
};

export const getShipPositions = (ship: Ship) => {
  const positions = [];
  for (let i = 0; i < ship.length; i++) {
    positions.push({
      x: ship.position.x + (ship.direction ? i : 0),
      y: ship.position.y + (ship.direction ? 0 : i),
    });
  }
  return positions;
};

export const allShipsDestroyed = (ships: Ship[]) => {
  return ships.every((ship) => ship.destroyed === true);
};

// Get cells around killed ship
export const getSurroundingCells = (ship: Ship, fieldSize = 10) => {
  const cells: { x: number; y: number }[] = [];

  if (!ship.direction) {
    const startX = Math.max(ship.position.x - 1, 0);
    const endX = Math.min(ship.position.x + ship.length, fieldSize - 1);
    const startY = Math.max(ship.position.y - 1, 0);
    const endY = Math.min(ship.position.y + 1, fieldSize - 1);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (!(x >= ship.position.x && x < ship.position.x + ship.length && y === ship.position.y)) {
          cells.push({ x, y });
        }
      }
    }
  } else {
    const startX = Math.max(ship.position.x - 1, 0);
    const endX = Math.min(ship.position.x + 1, fieldSize - 1);
    const startY = Math.max(ship.position.y - 1, 0);
    const endY = Math.min(ship.position.y + ship.length, fieldSize - 1);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (!(y >= ship.position.y && y < ship.position.y + ship.length && x === ship.position.x)) {
          cells.push({ x, y });
        }
      }
    }
  }

  return cells;
};
