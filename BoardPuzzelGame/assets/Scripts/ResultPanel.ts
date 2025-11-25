import { _decorator, Color, Component, Graphics, Node, UITransform } from "cc";
import { LevelGrid } from "./LevelConfig";

const color: Color = new Color(224, 208, 160, 150);

export function createResultPanel(
  resultNode: Node,
  cellSize: number,
  levelGrid: LevelGrid
) {
  const { cols, rows } = levelGrid;
  const ui =
    resultNode.getComponent(UITransform) ||
    resultNode.addComponent(UITransform);
  ui.anchorX = 0;
  ui.anchorY = 0;
  ui.setContentSize(cols * cellSize, rows * cellSize);

  const resultPanelGraphics = resultNode.addComponent(Graphics);
  resultPanelGraphics.clear();
  resultPanelGraphics.fillColor = color;
  resultPanelGraphics.roundRect(0, 0, cols * cellSize, rows * cellSize, 8);
  resultPanelGraphics.fill();

  resultPanelGraphics.lineWidth = 2;
  resultPanelGraphics.strokeColor = new Color(50, 50, 50, 100);
  for (let x = 0; x <= cols; x++) {
    resultPanelGraphics.moveTo(x * cellSize, 0);
    resultPanelGraphics.lineTo(x * cellSize, rows * cellSize);
  }
  for (let y = 0; y <= rows; y++) {
    resultPanelGraphics.moveTo(0, y * cellSize);
    resultPanelGraphics.lineTo(cols * cellSize, y * cellSize);
  }
  resultPanelGraphics.stroke();
}
