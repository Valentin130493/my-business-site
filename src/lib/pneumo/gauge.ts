import {
  type Group,
  MathUtils,
  PerspectiveCamera,
  Scene,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";

import {
  createFaceTexture,
  createGauge,
  DIAL_START,
  DIAL_SWEEP,
  GAUGE_RADIUS,
  paintFace,
} from "./gaugeParts";
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

export type GaugeSceneOptions = {
  isStatic: boolean;
  unit: string;
  formatTick: (value: number) => string;
};

export type GaugeScene = {
  resize(width: number, height: number): void;
  setValue(value: number): void;
  dispose(): void;
};

const FIELD_OF_VIEW = 24;
const ENVIRONMENT_INTENSITY = 0.5;
const FRAME_MARGIN = 1.12;
const TILT_X = -0.12;
const TILT_Y = 0.22;

// Стрелка качается и успокаивается: пружина мягче, чем у капсулы
const NEEDLE_SPRING = { stiffness: 60, dampingRatio: 0.35 };
const NEEDLE_EPSILON = 0.0005;
const DIAL_END = DIAL_START - DIAL_SWEEP;

// Предел шкалы — ближайшее «круглое» 1·2·5 × 10ⁿ с запасом, чтобы стрелка не упиралась в край
const SCALE_STEPS = [1, 2, 5, 10];
const SCALE_HEADROOM = 1.15;
const MIN_SCALE = 500;

function niceScaleMax(value: number): number {
  const target = Math.max(value * SCALE_HEADROOM, MIN_SCALE);
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step = SCALE_STEPS.find((candidate) => candidate * magnitude >= target) ?? 10;
  return step * magnitude;
}

class GaugeStage implements GaugeScene {
  private readonly renderer: WebGLRenderer;
  private readonly options: GaugeSceneOptions;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FIELD_OF_VIEW, 1, 0.1, 100);
  private readonly faceTexture = createFaceTexture();
  private readonly needle: Group;
  private readonly environment: WebGLRenderTarget;
  private readonly loop = new FrameLoop((seconds) => this.step(seconds));
  private spring: SpringState = { position: DIAL_START, velocity: 0 };
  private value = 0;
  private scaleMax = 0;
  private isSized = false;

  constructor(renderer: WebGLRenderer, options: GaugeSceneOptions) {
    this.renderer = renderer;
    this.options = options;
    this.environment = createEnvironment(renderer);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = ENVIRONMENT_INTENSITY;
    const gauge = createGauge(this.faceTexture);
    gauge.group.rotation.set(TILT_X, TILT_Y, 0);
    this.needle = gauge.needle;
    this.scene.add(gauge.group, createKeyLight());
  }

  resize(width: number, height: number): void {
    if (width === 0 || height === 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.frameCamera();
    this.isSized = true;
    this.loop.wake();
  }

  setValue(value: number): void {
    this.value = Math.max(value, 0);
    this.updateScale();
    if (this.options.isStatic) this.spring = { position: this.targetAngle(), velocity: 0 };
    if (this.isSized) this.loop.wake();
  }

  dispose(): void {
    this.loop.stop();
    disposeTree(this.scene);
    this.faceTexture.dispose();
    this.environment.dispose();
    this.renderer.dispose();
  }

  private updateScale(): void {
    const scaleMax = niceScaleMax(this.value);
    if (scaleMax === this.scaleMax) return;
    this.scaleMax = scaleMax;
    paintFace(this.faceTexture, scaleMax, this.options.formatTick, this.options.unit);
  }

  // Камера отодвигается так, чтобы корпус целиком помещался в кадр при любых пропорциях
  private frameCamera(): void {
    const tanHalf = Math.tan(MathUtils.degToRad(FIELD_OF_VIEW / 2));
    const halfSize = GAUGE_RADIUS * FRAME_MARGIN;
    const distance = Math.max(halfSize / tanHalf, halfSize / (tanHalf * this.camera.aspect));
    this.camera.position.set(0, 0, distance);
    this.camera.updateProjectionMatrix();
  }

  private targetAngle(): number {
    return DIAL_START - (this.value / this.scaleMax) * DIAL_SWEEP;
  }

  private step(seconds: number): boolean {
    const target = this.targetAngle();
    this.spring = this.options.isStatic
      ? { position: target, velocity: 0 }
      : stepSpring(this.spring, target, seconds, NEEDLE_SPRING);
    const angle = MathUtils.clamp(this.spring.position, DIAL_END, DIAL_START);
    this.needle.rotation.z = angle - Math.PI / 2;
    this.renderer.render(this.scene, this.camera);
    return !isAtRest(this.spring, target, NEEDLE_EPSILON);
  }
}

export function createGaugeScene(
  canvas: HTMLCanvasElement,
  options: GaugeSceneOptions,
): GaugeScene | null {
  const renderer = createRenderer(canvas);
  return renderer ? new GaugeStage(renderer, options) : null;
}
