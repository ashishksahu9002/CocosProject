import {
  _decorator,
  Component,
  EventTouch,
  Node,
  UITransform,
  v3,
  Vec3,
  view,
} from "cc";
const { ccclass, property } = _decorator;

import { createResultPanel } from "./ResultPanel";
import { LevelData, PieceData } from "./LevelConfig";
import { createAllPieces, PieceRuntime } from "./PuzzlePieceCreation";
import {
  isPuzzleComplete,
  pieceFitsInGrid,
  wouldOverlap,
} from "./UtilityFunctions";

const CELL_SIZE = 50;

const LEVEL_DATA = {
  grid: {
    cols: 5,
    rows: 5,
  },

  pieces: [
    {
      // Piece 1
      color: "#ff0000",
      cells: [
        [3, 0] as [number, number],
        [4, 0] as [number, number],
        [4, 1] as [number, number],
        [4, 2] as [number, number],
      ],
      startPos: [50, 50] as [number, number],
      origin: null,
    },
    {
      // Piece 2
      color: "#00ff00",
      cells: [
        [1, 2] as [number, number],
        [2, 2] as [number, number],
        [2, 3] as [number, number],
        [3, 2] as [number, number],
        [3, 3] as [number, number],
        [4, 3] as [number, number],
        [4, 4] as [number, number],
      ],
      startPos: [250, 50] as [number, number],
      origin: null,
    },
    {
      // Piece 3
      color: "#0000ff",
      cells: [
        [0, 2] as [number, number],
        [0, 3] as [number, number],
        [0, 4] as [number, number],
        [1, 3] as [number, number],
        [1, 4] as [number, number],
        [2, 4] as [number, number],
        [3, 4] as [number, number],
      ],
      startPos: [500, 50] as [number, number],
      origin: null,
    },
    {
      // Piece 4
      color: "#000000",
      cells: [
        [0, 0] as [number, number],
        [0, 1] as [number, number],
        [1, 0] as [number, number],
        [1, 1] as [number, number],
        [2, 0] as [number, number],
        [2, 1] as [number, number],
        [3, 1] as [number, number],
      ],
      startPos: [750, 50] as [number, number],
      origin: null,
    },
  ],
};

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Node)
  resultNode: Node | null = null;

  @property(Node)
  parentNode: Node | null = null;

  levels: LevelData[] = [];
  currentLevelIndex = 0;
  currentLevel: LevelData | null = null;

  pieceRuntime: PieceRuntime[] = [];

  // drag state
  draggedPiece: Node | null = null;
  draggedData: PieceData | null = null;
  dragOffset: Vec3 = v3();
  dragStartLocalPos: Vec3 = v3();

  get allPiecesData(): PieceData[] {
    return this.pieceRuntime.map((p) => p.data);
  }

  start() {
    this.createPuzzle();
  }

  update(deltaTime: number) {}

  createPuzzle() {
    if (!this.resultNode) {
      console.log("Canvas not assigned");
      return;
    }
    createResultPanel(this.resultNode, CELL_SIZE, LEVEL_DATA.grid);

    this.currentLevel = LEVEL_DATA;

    this.pieceRuntime = createAllPieces({
      level: LEVEL_DATA,
      parent: this.parentNode,
      cellSize: CELL_SIZE,
      makeDraggable: (node, data) => this.makeDraggable(node, data),
    });
  }

  makeDraggable(node: Node, data: PieceData) {
    node.on(Node.EventType.TOUCH_START, (e: EventTouch) =>
      this.onTouchStart(node, data, e)
    );

    node.on(Node.EventType.TOUCH_MOVE, (e: EventTouch) =>
      this.onTouchMove(node, e)
    );

    const endHandler = (e: EventTouch) => this.onTouchEnd(node, data, e);
    node.on(Node.EventType.TOUCH_END, endHandler);
    node.on(Node.EventType.TOUCH_CANCEL, endHandler);
  }

  onTouchStart(node: Node, data: PieceData, e: EventTouch) {
    this.draggedPiece = node;
    this.draggedData = data;

    node.setSiblingIndex(node.parent.children.length - 1);

    this.dragStartLocalPos = node.position.clone();

    const uiParent = node.parent.getComponent(UITransform)!;
    const uiPos = e.getUILocation();
    const localPos = uiParent.convertToNodeSpaceAR(v3(uiPos.x, uiPos.y, 0));

    this.dragOffset = node.position.clone().subtract(localPos);
  }

  onTouchMove(node: Node, e: EventTouch) {
    if (this.draggedPiece !== node) return;

    const uiParent = node.parent!.getComponent(UITransform)!;
    const uiPos = e.getUILocation();
    let localPos = uiParent.convertToNodeSpaceAR(v3(uiPos.x, uiPos.y, 0));

    localPos = localPos.add(this.dragOffset);
    node.setPosition(localPos);
  }

  onTouchEnd(node: Node, data: PieceData, e: EventTouch) {
    if (this.draggedPiece !== node) return;

    this.clampPieceInsideParent(node);
    this.handleDrop(node, data);

    this.draggedPiece = null;
    this.draggedData = null;
  }

  clampPieceInsideParent(node: Node) {
    const nodeUI = node.getComponent(UITransform);
    if (!nodeUI) return;

    const size = view.getVisibleSize();

    const worldPos = node.worldPosition;
    const localPos = { x: worldPos.x, y: worldPos.y };
    console.log("nodeUI : ", nodeUI);
    console.log("worldPos 1 : ", worldPos);

    console.log(size.width, size.height);

    const minX = 0;
    const minY = 0;
    const maxX = size.width - nodeUI.width;
    const maxY = size.height - nodeUI.height;

    if (worldPos.x < minX) localPos.x = minX;
    if (worldPos.x > maxX) localPos.x = maxX;
    if (worldPos.y < minY) localPos.y = minY;
    if (worldPos.y > maxY) localPos.y = maxY;

    console.log("localPos : ", localPos);

    node.setWorldPosition(localPos.x, localPos.y, 0);
  }

  handleDrop(node: Node, data: PieceData): void {
    if (!this.currentLevel || !this.resultNode) return;

    const gridUI = this.resultNode.getComponent(UITransform);
    const worldPos = node.worldPosition;

    const localToGrid = gridUI.convertToNodeSpaceAR(worldPos);
    const col = Math.round(localToGrid.x / CELL_SIZE);
    const row = Math.round(localToGrid.y / CELL_SIZE);

    data.origin = [col, row];

    if (!pieceFitsInGrid(data, this.currentLevel)) {
      data.origin = null;
      return;
    }

    if (wouldOverlap(data, this.allPiecesData)) {
      data.origin = null;
      return;
    }

    const snapLocal = v3(col * CELL_SIZE, row * CELL_SIZE, 0);
    const snapWorld = gridUI.convertToWorldSpaceAR(snapLocal);
    node.setWorldPosition(snapWorld);
    this.checkPuzzleComplete();
  }

  checkPuzzleComplete(): void {
    if (!this.currentLevel) return;
    if (isPuzzleComplete(this.allPiecesData, this.currentLevel)) {
      console.log("PUZZLE COMPLETE ✅");
      // Popup
    }
  }
}
