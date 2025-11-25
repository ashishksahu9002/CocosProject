import {
  _decorator,
  Component,
  Label,
  Node,
  tween,
  input,
  Input,
  UIOpacity,
  Vec3,
  v3,
  Tween,
  director,
} from "cc";
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
    if (!this.loadingDone) return;
    const node = this.continueText.node;
    Tween.stopAllByTarget(node);
    const opacity = node.getComponent(UIOpacity);

    tween(node)
      .parallel(
        tween().to(0.25, { scale: v3(0.8, 0.8, 0.8) }, { easing: "quadIn" }),
        tween(opacity).to(0.25, { opacity: 0 }, { easing: "quadIn" })
      )
      .call(() => {
        director.loadScene("LevelSelectScene");
      })
      .start();
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
    this.loadingSection.active = false;
    this.loadingDone = true;
    this.animateContinueText();
  }

  animateContinueText() {
    if (!this.continueText) return;
    const node = this.continueText.node;

    node.active = true;
    node.setScale(0.5, 0.5, 0.5);

    let opacity = node.getComponent(UIOpacity) as UIOpacity | null;
    if (!opacity) opacity = node.addComponent(UIOpacity);
    opacity.opacity = 0;
    Tween.stopAllByTarget(node);
    Tween.stopAllByTarget(opacity);

    const pop = tween().to(1, { scale: v3(1, 1, 1) }, { easing: "backOut" });
    const pulse = tween()
      .to(1, { scale: v3(1.2, 1.2, 1.2) }, { easing: "sineInOut" })
      .to(1, { scale: v3(1.0, 1.0, 1.0) }, { easing: "sineInOut" });

    tween(node).then(pop).then(pulse).repeatForever().start();

    tween(opacity).to(0.5, { opacity: 255 }).start();
  }
}
