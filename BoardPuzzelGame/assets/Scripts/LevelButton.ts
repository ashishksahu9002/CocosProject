import { _decorator, Button, Component, director, Label, Node } from "cc";
import { LevelStoreInstance } from "./LevelStore";
const { ccclass, property } = _decorator;

@ccclass("LevelButton")
export class LevelButton extends Component {
  @property(Label)
  levelLabel: Label | null = null;

  levelIndex: number;
  start() {
    const btn = this.getComponent(Button);
    if (btn) {
      btn.node.on(Button.EventType.CLICK, this.onClick, this);
    }
  }

  btnSetup(index: number) {
    this.levelIndex = index;
    if (this.levelLabel) {
      this.levelLabel.string = String(index + 1);
    }
  }

  update(deltaTime: number) {}

  onClick() {
    LevelStoreInstance.setCurrentLevel(this.levelIndex);
    director.loadScene("GameScene");
  }
}
