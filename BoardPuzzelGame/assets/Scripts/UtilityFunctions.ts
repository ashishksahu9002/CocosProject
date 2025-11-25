import { _decorator, Component, Node } from "cc";
import { LevelData, PieceData } from "./LevelConfig";

export function computeBounds(cells: [number, number][]) {
  let minX = cells[0][0];
  let maxX = cells[0][0];
  let minY = cells[0][1];
  let maxY = cells[0][1];

  for (let i = 1; i < cells.length; i++) {
    const [x, y] = cells[i];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return { minX, maxX, minY, maxY };
}

export function pieceFitsInGrid(piece: PieceData, level: LevelData): boolean {
  const origin = piece.origin;
  if (!origin) return false;

  const [ox, oy] = origin;
  const { cols, rows } = level.grid;

  for (const [cx, cy] of piece.cells) {
    const gx = ox + cx;
    const gy = oy + cy;
    if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) {
      return false;
    }
  }
  return true;
}

export function wouldOverlap(
  testPiece: PieceData,
  allPieces: PieceData[]
): boolean {
  if (!testPiece.origin) return false;

  const [ox, oy] = testPiece.origin;
  const occupied = new Set<string>();

  for (const piece of allPieces) {
    if (piece === testPiece) continue;
    if (!piece.origin) continue;

    const [pox, poy] = piece.origin;
    for (const [cx, cy] of piece.cells) {
      const gx = pox + cx;
      const gy = poy + cy;
      occupied.add(`${gx},${gy}`);
    }
  }

  for (const [cx, cy] of testPiece.cells) {
    const gx = ox + cx;
    const gy = oy + cy;
    if (occupied.has(`${gx},${gy}`)) {
      return true;
    }
  }

  return false;
}

export function isPuzzleComplete(
  allPieces: PieceData[],
  level: LevelData
): boolean {
  const { cols, rows } = level.grid;
  const totalCells = cols * rows;

  const occupied = new Set<string>();

  for (const piece of allPieces) {
    if (!piece.origin) {
      return false;
    }

    const [ox, oy] = piece.origin;
    for (const [cx, cy] of piece.cells) {
      const gx = ox + cx;
      const gy = oy + cy;
      const key = `${gx},${gy}`;
      if (occupied.has(key)) {
        return false;
      }
      occupied.add(key);
    }
  }

  return occupied.size === totalCells;
}
