import {
  Group,
  MathUtils,
  PerspectiveCamera,
  Scene,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";

import {
  type Capsule,
  createCapsule,
  createTagTexture,
  createTube,
  GLOW_ACROSS,
  GLOW_ALONG,
  paintTag,
  TUBE_RADIUS,
} from "./parts";
import {
  createEnvironment,
  createKeyLight,
  createRenderer,
  disposeTree,
  FrameLoop,
  isAtRest,
  type SpringState,
  stepSpring,
} from "./stage";

export type PneumoSceneOptions = {
  tagTime: string;
  isStatic: boolean;
};

export type PneumoScene = {
  resize(width: number, height: number): void;
  setProgress(progress: number): void;
  dispose(): void;
};

const FIELD_OF_VIEW = 18;
const ENVIRONMENT_INTENSITY = 0.55;

// Доля поперечника кадра, которую занимает труба
const FILL_VERTICAL = 0.72;
const FILL_HORIZONTAL = 0.62;
// Положения капсулы — в долях видимой длины трубы
const REST_SHIFT = 0.12;
const TRAVEL = 0.8;
const ENTRY_DISTANCE = 0.75;
const ENTRY_SPEED = 2.2;

// Недодемпфированная пружина: капсула влетает резко и садится с лёгким затуханием
const CAPSULE_SPRING = { stiffness: 38, dampingRatio: 0.55 };
const REST_EPSILON = 0.0005;

class PneumoStage implements PneumoScene {
  private readonly renderer: WebGLRenderer;
  private readonly options: PneumoSceneOptions;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FIELD_OF_VIEW, 1, 0.1, 1000);
  private readonly rig = new Group();
  private readonly tagTexture = createTagTexture();
  private readonly capsule: Capsule;
  private readonly environment: WebGLRenderTarget;
  private readonly loop = new FrameLoop((seconds) => this.step(seconds));
  private spring: SpringState = { position: 0, velocity: 0 };
  private progress = 0;
  private visibleLength = 0;
  private isHorizontal: boolean | null = null;
  private hasEntered = false;

  constructor(renderer: WebGLRenderer, options: PneumoSceneOptions) {
    this.renderer = renderer;
    this.options = options;
    this.environment = createEnvironment(renderer);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = ENVIRONMENT_INTENSITY;
    this.capsule = createCapsule(this.tagTexture);
    this.rig.add(createTube(), this.capsule.group);
    this.scene.add(this.rig, createKeyLight());
  }

  resize(width: number, height: number): void {
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.applyOrientation(width > height);
    this.frameCamera();
    this.enter();
    this.loop.wake();
  }

  setProgress(progress: number): void {
    if (progress === this.progress) return;
    this.progress = progress;
    if (this.hasEntered) this.loop.wake();
  }

  dispose(): void {
    this.loop.stop();
    disposeTree(this.scene);
    this.tagTexture.dispose();
    this.environment.dispose();
    this.renderer.dispose();
  }

  // Вертикальная труба — колонка на десктопе, горизонтальная — полоса на телефоне
  private applyOrientation(isHorizontal: boolean): void {
    if (isHorizontal === this.isHorizontal) return;
    this.isHorizontal = isHorizontal;
    this.rig.rotation.z = isHorizontal ? Math.PI / 2 : 0;
    const [across, along] = isHorizontal ? [GLOW_ALONG, GLOW_ACROSS] : [GLOW_ACROSS, GLOW_ALONG];
    this.capsule.glow.scale.set(across, along, 1);
    paintTag(this.tagTexture, this.options.tagTime, isHorizontal);
  }

  // Камера отодвигается так, чтобы труба занимала заданную долю поперечника кадра
  private frameCamera(): void {
    const tanHalf = Math.tan(MathUtils.degToRad(FIELD_OF_VIEW / 2));
    const fill = this.isHorizontal ? FILL_HORIZONTAL : FILL_VERTICAL;
    const crossAspect = this.isHorizontal ? 1 : this.camera.aspect;
    const distance = (2 * TUBE_RADIUS) / fill / (2 * tanHalf * crossAspect);
    const visibleHeight = 2 * distance * tanHalf;

    this.visibleLength = this.isHorizontal ? visibleHeight * this.camera.aspect : visibleHeight;
    this.camera.position.set(0, 0, distance);
    this.camera.updateProjectionMatrix();
  }

  private target(): number {
    const rest = this.isHorizontal ? 0 : this.visibleLength * REST_SHIFT;
    const travel = this.options.isStatic ? 0 : this.progress * this.visibleLength * TRAVEL;
    return rest - travel;
  }

  private enter(): void {
    if (this.hasEntered) return;
    this.hasEntered = true;
    const target = this.target();
    this.spring = this.options.isStatic
      ? { position: target, velocity: 0 }
      : {
          position: target + this.visibleLength * ENTRY_DISTANCE,
          velocity: -this.visibleLength * ENTRY_SPEED,
        };
  }

  private step(seconds: number): boolean {
    const target = this.target();
    this.spring = this.options.isStatic
      ? { position: target, velocity: 0 }
      : stepSpring(this.spring, target, seconds, CAPSULE_SPRING);
    this.capsule.group.position.y = this.spring.position;
    this.renderer.render(this.scene, this.camera);
    return !isAtRest(this.spring, target, REST_EPSILON);
  }
}

export function createPneumoScene(
  canvas: HTMLCanvasElement,
  options: PneumoSceneOptions,
): PneumoScene | null {
  const renderer = createRenderer(canvas);
  return renderer ? new PneumoStage(renderer, options) : null;
}
