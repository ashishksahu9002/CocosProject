// level-config.ts

export type GridCell = [number, number];

export interface PieceData {
  color: string;
  cells: GridCell[];
  startPos: [number, number];
  origin?: [number, number] | null;
}

export interface LevelGrid {
  cols: number;
  rows: number;
}

export interface LevelData {
  grid: LevelGrid;
  pieces: PieceData[];
}
