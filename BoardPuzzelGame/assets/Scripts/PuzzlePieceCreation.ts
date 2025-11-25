import { _decorator, Color, Component, Graphics, Node, UITransform } from "cc";
import { LevelData, PieceData } from "./LevelConfig";
import { computeBounds } from "./UtilityFunctions";

export interface PieceRuntime {
  node: Node;
  data: PieceData;
}

interface CreateAllPiecesParams {
  level: LevelData;
  parent: Node;
  cellSize: number;
  makeDraggable: (node: Node, data: PieceData) => void;
}

export function createAllPieces({
  level,
  parent,
  cellSize,
  makeDraggable,
}: CreateAllPiecesParams): PieceRuntime[] {
  const result: PieceRuntime[] = [];

  level.pieces.forEach((pieceData, index) => {
    const { cells, color } = pieceData;
    const node = new Node(`Piece_$(index+1)`);
    parent.addChild(node);

    const ui = node.addComponent(UITransform);
    ui.anchorX = 0;
    ui.anchorY = 0;

    const g = node.addComponent(Graphics);
    const gColor = new Color();
    Color.fromHEX(gColor, color);
    g.fillColor = gColor;
    g.lineWidth = 2; // thickness of border
    g.strokeColor = Color.WHITE;

    const bounds = computeBounds(cells);
    const normalizedCells = cells.map(([cx, cy]) => {
      return [cx - bounds.minX, cy - bounds.minY] as [number, number];
    });

    pieceData.cells = normalizedCells;

    normalizedCells.forEach(([cx, cy]) => {
      const x = cx * cellSize;
      const y = cy * cellSize;
      g.rect(x, y, cellSize, cellSize);
    });
    g.fill();
    g.stroke();

    const widthInCells = bounds.maxX - bounds.minX + 1;
    const heightInCells = bounds.maxY - bounds.minY + 1;
    ui.setContentSize(widthInCells * cellSize, heightInCells * cellSize);

    node.setWorldPosition(pieceData.startPos[0], pieceData.startPos[1], 0);

    makeDraggable(node, pieceData);

    result.push({ node, data: pieceData });
  });

  return result;
}
