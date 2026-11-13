import {
  CanvasTexture,
  CustomBlending,
  DirectionalLight,
  type Material,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  type Object3D,
  OneFactor,
  PMREMGenerator,
  type Side,
  Sprite,
  SrcAlphaFactor,
  SRGBColorSpace,
  WebGLRenderer,
  type WebGLRenderTarget,
  ZeroFactor,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { COLOR_GLASS } from "./palette";

// Общее для всех 3D-сцен сайта: рендерер, окружение, свет, материалы, пружина и цикл кадров

const MAX_PIXEL_RATIO = 2;
const ENVIRONMENT_BLUR = 0.04;
const KEY_LIGHT_COLOR = 0xf2f6ff;
const KEY_LIGHT_INTENSITY = 2.2;
const MAX_FRAME_SECONDS = 1 / 30;

export function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.toneMapping = NeutralToneMapping;
    return renderer;
  } catch {
    // WebGL выключен или не поддерживается — сайт остаётся без 3D
    return null;
  }
}

export function createEnvironment(renderer: WebGLRenderer): WebGLRenderTarget {
  const generator = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const target = generator.fromScene(room, ENVIRONMENT_BLUR);
  room.dispose();
  generator.dispose();
  return target;
}

export function createKeyLight(): DirectionalLight {
  const light = new DirectionalLight(KEY_LIGHT_COLOR, KEY_LIGHT_INTENSITY);
  light.position.set(-4, 6, 8);
  return light;
}

export function disposeTree(root: Object3D): void {
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

// Свет поверх прозрачного канваса: цвет прибавляется к фону страницы, а альфа не растёт.
// С обычным аддитивным смешением стекло делало канвас непрозрачным и закрывало фон
export function addLightBlending<T extends Material>(material: T): T {
  material.blending = CustomBlending;
  material.blendSrc = SrcAlphaFactor;
  material.blendDst = OneFactor;
  material.blendSrcAlpha = ZeroFactor;
  material.blendDstAlpha = OneFactor;
  return material;
}

// На тёмном фоне у стекла видны только блики и отражения
export function createGlassMaterial(side: Side, envMapIntensity: number): MeshPhysicalMaterial {
  return addLightBlending(
    new MeshPhysicalMaterial({
      color: COLOR_GLASS,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity,
      side,
      transparent: true,
      depthWrite: false,
    }),
  );
}

export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("pneumo: 2d canvas context is unavailable");
  return context;
}

export function createCanvasTexture(size: number): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export type SpringConfig = { stiffness: number; dampingRatio: number };
export type SpringState = { position: number; velocity: number };

export function stepSpring(
  state: SpringState,
  target: number,
  seconds: number,
  { stiffness, dampingRatio }: SpringConfig,
): SpringState {
  const damping = 2 * Math.sqrt(stiffness) * dampingRatio;
  const acceleration = stiffness * (target - state.position) - damping * state.velocity;
  const velocity = state.velocity + acceleration * seconds;
  return { position: state.position + velocity * seconds, velocity };
}

export function isAtRest(state: SpringState, target: number, epsilon: number): boolean {
  return Math.abs(target - state.position) < epsilon && Math.abs(state.velocity) < epsilon;
}

// Кадры идут, только пока step возвращает true: в покое сцена не тратит батарею
export class FrameLoop {
  private readonly step: (seconds: number) => boolean;
  private frameId = 0;
  private lastTime = 0;

  constructor(step: (seconds: number) => boolean) {
    this.step = step;
  }

  wake(): void {
    if (this.frameId) return;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  private readonly tick = (time: number): void => {
    const seconds = MathUtils.clamp((time - this.lastTime) / 1000, 0, MAX_FRAME_SECONDS);
    this.lastTime = time;
    this.frameId = this.step(seconds) ? requestAnimationFrame(this.tick) : 0;
  };
}
