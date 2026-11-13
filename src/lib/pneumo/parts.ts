import {
  BackSide,
  type CanvasTexture,
  CapsuleGeometry,
  CylinderGeometry,
  FrontSide,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PointLight,
  Sprite,
  SpriteMaterial,
} from "three";

import {
  COLOR_INK,
  COLOR_MINT,
  COLOR_MINT_DEEP,
  COLOR_PAPER,
  COLOR_STEEL,
  COLOR_STEEL_LIGHT,
  FONT_MONO,
} from "./palette";
import { addLightBlending, context2d, createCanvasTexture, createGlassMaterial } from "./stage";

export const TUBE_RADIUS = 1;
const TUBE_LENGTH = 140;
const TUBE_SEGMENTS = 96;
const CLAMP_RADIUS = 1.1;
const CLAMP_HEIGHT = 0.32;
const CLAMP_SPACING = 6.5;
const CLAMP_COUNT = 21;

const CAPSULE_RADIUS = 0.72;
const CAPSULE_BODY = 2.1;
const SLEEVE_SHARE = 0.78;
const TAG_HEIGHT = 1;
const TAG_ARC = TAG_HEIGHT / CAPSULE_RADIUS;

const GLOW_PIXELS = 128;
const GLOW_OPACITY = 0.5;
export const GLOW_ACROSS = 4.6;
export const GLOW_ALONG = 7.4;
const CAPSULE_LIGHT_INTENSITY = 14;
const CAPSULE_LIGHT_RANGE = 9;

const TAG_PIXELS = 256;
const TAG_SERIAL = "#0412";

function createClamps(): InstancedMesh {
  const geometry = new CylinderGeometry(CLAMP_RADIUS, CLAMP_RADIUS, CLAMP_HEIGHT, 64, 1, true);
  const material = new MeshStandardMaterial({ color: COLOR_STEEL, metalness: 1, roughness: 0.35 });
  const clamps = new InstancedMesh(geometry, material, CLAMP_COUNT);
  const matrix = new Matrix4();
  const first = -((CLAMP_COUNT - 1) / 2) * CLAMP_SPACING + CLAMP_SPACING / 2;

  for (let index = 0; index < CLAMP_COUNT; index += 1) {
    clamps.setMatrixAt(index, matrix.makeTranslation(0, first + index * CLAMP_SPACING, 0));
  }
  return clamps;
}

export function createTube(): Group {
  const geometry = new CylinderGeometry(
    TUBE_RADIUS,
    TUBE_RADIUS,
    TUBE_LENGTH,
    TUBE_SEGMENTS,
    1,
    true,
  );
  const tube = new Group();
  tube.add(
    new Mesh(geometry, createGlassMaterial(BackSide, 0.45)),
    new Mesh(geometry, createGlassMaterial(FrontSide, 1.2)),
    createClamps(),
  );
  return tube;
}

function createGlowTexture(): CanvasTexture {
  const texture = createCanvasTexture(GLOW_PIXELS);
  const context = context2d(texture.image as HTMLCanvasElement);
  const half = GLOW_PIXELS / 2;
  const gradient = context.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.32)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, GLOW_PIXELS, GLOW_PIXELS);
  return texture;
}

function createGlow(): Sprite {
  const glow = new Sprite(
    addLightBlending(
      new SpriteMaterial({
        map: createGlowTexture(),
        color: COLOR_MINT,
        opacity: GLOW_OPACITY,
        depthWrite: false,
      }),
    ),
  );
  glow.position.z = -TUBE_RADIUS * 1.3;
  return glow;
}

export function createTagTexture(): CanvasTexture {
  return createCanvasTexture(TAG_PIXELS);
}

// Бирка с номером и временем. В горизонтальной трубе текст поворачивается, чтобы читаться ровно
export function paintTag(texture: CanvasTexture, time: string, isRotated: boolean): void {
  const context = context2d(texture.image as HTMLCanvasElement);
  const center = TAG_PIXELS / 2;

  context.fillStyle = COLOR_PAPER;
  context.fillRect(0, 0, TAG_PIXELS, TAG_PIXELS);
  context.save();
  context.translate(center, center);
  if (isRotated) context.rotate(Math.PI / 2);
  context.fillStyle = COLOR_INK;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `500 34px ${FONT_MONO}`;
  context.fillText(TAG_SERIAL, 0, -46);
  context.font = `500 74px ${FONT_MONO}`;
  context.fillText(time, 0, 24);
  context.restore();
  texture.needsUpdate = true;
}

function createCapsuleBody(tagTexture: CanvasTexture): Mesh[] {
  const shell = new Mesh(
    new CapsuleGeometry(CAPSULE_RADIUS, CAPSULE_BODY, 12, 48),
    new MeshStandardMaterial({ color: COLOR_STEEL_LIGHT, metalness: 1, roughness: 0.3 }),
  );
  const sleeve = new Mesh(
    new CylinderGeometry(CAPSULE_RADIUS * 1.015, CAPSULE_RADIUS * 1.015, CAPSULE_BODY * SLEEVE_SHARE, 64, 1, true),
    new MeshPhysicalMaterial({
      color: COLOR_MINT,
      metalness: 0.55,
      roughness: 0.28,
      clearcoat: 1,
      emissive: COLOR_MINT_DEEP,
      emissiveIntensity: 0.8,
    }),
  );
  const tag = new Mesh(
    new CylinderGeometry(CAPSULE_RADIUS * 1.03, CAPSULE_RADIUS * 1.03, TAG_HEIGHT, 32, 1, true, -TAG_ARC / 2, TAG_ARC),
    new MeshStandardMaterial({ map: tagTexture, roughness: 0.95 }),
  );
  return [shell, sleeve, tag];
}

export type Capsule = { group: Group; glow: Sprite };

export function createCapsule(tagTexture: CanvasTexture): Capsule {
  const group = new Group();
  const glow = createGlow();
  const light = new PointLight(COLOR_MINT, CAPSULE_LIGHT_INTENSITY, CAPSULE_LIGHT_RANGE);
  group.add(...createCapsuleBody(tagTexture), glow, light);
  return { group, glow };
}
