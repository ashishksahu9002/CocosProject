import { _decorator, Component, instantiate, Node, Prefab } from "cc";
import { LevelButton } from "./LevelButton";
const { ccclass, property } = _decorator;

@ccclass("LevelManager")
export class LevelManager extends Component {
  @property(Prefab)
  levelBtnPrefab: Prefab | null = null;
  @property(Node)
  levelList: Node | null = null;

  totalLevel: number = 10;

  start() {
    this.createLevelBtns();
  }

  createLevelBtns() {
    if (!this.levelBtnPrefab || !this.levelList) {
      return;
    }
    const cols = 4;
    const spacingX = 80;
    const spacingY = 80;
    const startX = -((cols - 1) * spacingX) / 2;
    const startY = 100;

    for (let i = 0; i < this.totalLevel; i++) {
      const btnNode = instantiate(this.levelBtnPrefab);
      btnNode.parent = this.levelList;

      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = startY - row * spacingY;
      btnNode.setPosition(x, y, 0);

      const levelBtn = btnNode.getComponent(LevelButton);
      if (levelBtn) {
        levelBtn.btnSetup(i);
      }
    }
  }

  update(deltaTime: number) {}
}
