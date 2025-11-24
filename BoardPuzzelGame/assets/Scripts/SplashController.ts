import { _decorator, Component, Label, Node, tween, input, Input } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SplashController")
export class SplashController extends Component {
  @property(Label)
  loadingPercentage: Label | null = null;

  @property(Label)
  loadingText: Label | null = null;

  @property(Label)
  continueText: Label | null = null;

  @property(Node)
  loadingSection: Node | null = null;

  private counter = { value: 0 };
  private loadingDone = false;

  start() {
    this.continueText.node.active = false;
    this.loadingSection.active = true;
    input.on(Input.EventType.TOUCH_END, this.onTap, this);
    this.playLoadingAnimation();
  }

  update(deltaTime: number) {}

  onTap() {
    console.log("Move to new scene");
  }

  onDestroy() {
    input.off(Input.EventType.TOUCH_END, this.onTap, this);
  }

  playLoadingAnimation() {
    tween(this.counter)
      .to(2, { value: 100 }, { easing: "quadOut" })
      .call(() => {
        this.onLoadComplete();
      })
      .start();

    this.updateUI();
  }
  updateUI() {
    this.schedule(() => {
      const value = Math.round(this.counter.value);
      this.loadingPercentage.string = `${value}%`;
    }, 0.01);
  }

  onLoadComplete() {
    this.loadingText.string = "Assets Loaded";
    this.continueText.node.active = true;
    this.loadingSection.active = false;
    this.loadingDone = true;
  }
}
