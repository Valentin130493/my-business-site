import {
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  NeutralToneMapping,
  type Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Sprite,
  WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

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
const MAX_PIXEL_RATIO = 2;
const ENVIRONMENT_INTENSITY = 0.55;
const ENVIRONMENT_BLUR = 0.04;
const KEY_LIGHT_COLOR = 0xf2f6ff;
const KEY_LIGHT_INTENSITY = 2.2;

// Доля поперечника кадра, которую занимает труба
const FILL_VERTICAL = 0.72;
const FILL_HORIZONTAL = 0.62;
// Положения капсулы — в долях видимой длины трубы
const REST_SHIFT = 0.12;
const TRAVEL = 0.8;
const ENTRY_DISTANCE = 0.75;
const ENTRY_SPEED = 2.2;

const SPRING_STIFFNESS = 38;
const SPRING_DAMPING_RATIO = 0.55;
const REST_EPSILON = 0.0005;
const MAX_FRAME_SECONDS = 1 / 30;

type SpringState = { position: number; velocity: number };

// Пружина с недодемпфированием: капсула влетает резко и садится с лёгким затуханием
function stepSpring(state: SpringState, target: number, seconds: number): SpringState {
  const damping = 2 * Math.sqrt(SPRING_STIFFNESS) * SPRING_DAMPING_RATIO;
  const acceleration = SPRING_STIFFNESS * (target - state.position) - damping * state.velocity;
  const velocity = state.velocity + acceleration * seconds;
  return { position: state.position + velocity * seconds, velocity };
}

function isAtRest(state: SpringState, target: number): boolean {
  return Math.abs(target - state.position) < REST_EPSILON && Math.abs(state.velocity) < REST_EPSILON;
}

function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.toneMapping = NeutralToneMapping;
    return renderer;
  } catch {
    // WebGL выключен или не поддерживается — остаётся CSS-подсветка без 3D
    return null;
  }
}

function createEnvironment(renderer: WebGLRenderer): WebGLRenderTarget {
  const generator = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const target = generator.fromScene(room, ENVIRONMENT_BLUR);
  room.dispose();
  generator.dispose();
  return target;
}

function createKeyLight(): DirectionalLight {
  const light = new DirectionalLight(KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY);
  light.position.set(-4, 6, 8);
  return light;
}

function disposeTree(root: Object3D): void {
  root.traverse((object) => {
    if (object instanceof Sprite) {
      object.material.map?.dispose();
      object.material.dispose();
      return;
    }
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

class PneumoStage implements PneumoScene {
  private readonly renderer: WebGLRenderer;
  private readonly options: PneumoSceneOptions;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(FIELD_OF_VIEW, 1, 0.1, 1000);
  private readonly rig = new Group();
  private readonly tagTexture = createTagTexture();
  private readonly capsule: Capsule;
  private readonly environment: WebGLRenderTarget;
  private spring: SpringState = { position: 0, velocity: 0 };
  private progress = 0;
  private visibleLength = 0;
  private isHorizontal: boolean | null = null;
  private hasEntered = false;
  private frameId = 0;
  private lastTime = 0;

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
    this.wake();
  }

  setProgress(progress: number): void {
    if (progress === this.progress) return;
    this.progress = progress;
    this.wake();
  }

  dispose(): void {
    cancelAnimationFrame(this.frameId);
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

  // Кадры рисуются, только пока капсула движется: в покое сцена не тратит батарею
  private wake(): void {
    if (this.frameId || !this.hasEntered) return;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  private readonly tick = (time: number): void => {
    const seconds = MathUtils.clamp((time - this.lastTime) / 1000, 0, MAX_FRAME_SECONDS);
    this.lastTime = time;
    const target = this.target();
    this.spring = this.options.isStatic
      ? { position: target, velocity: 0 }
      : stepSpring(this.spring, target, seconds);
    this.capsule.group.position.y = this.spring.position;
    this.renderer.render(this.scene, this.camera);
    this.frameId = isAtRest(this.spring, target) ? 0 : requestAnimationFrame(this.tick);
  };
}

export function createPneumoScene(
  canvas: HTMLCanvasElement,
  options: PneumoSceneOptions,
): PneumoScene | null {
  const renderer = createRenderer(canvas);
  return renderer ? new PneumoStage(renderer, options) : null;
}
