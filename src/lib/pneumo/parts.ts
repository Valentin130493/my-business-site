import {
  BackSide,
  CanvasTexture,
  CapsuleGeometry,
  CustomBlending,
  CylinderGeometry,
  FrontSide,
  Group,
  InstancedMesh,
  type Material,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OneFactor,
  PointLight,
  SRGBColorSpace,
  type Side,
  Sprite,
  SpriteMaterial,
  SrcAlphaFactor,
  ZeroFactor,
} from "three";

// Палитра концепта «Пневмопочта ночной смены»
const COLOR_GLASS = 0x0b0e0f;
const COLOR_MINT = 0x8edcc0;
const COLOR_MINT_DEEP = 0x2a9d7c;
const COLOR_STEEL = 0x6e7b7f;
const COLOR_CAP_STEEL = 0x7d8a8e;
const COLOR_PAPER = "#f2efe6";
const COLOR_INK = "#15191a";

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
const TAG_FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("pneumo: 2d canvas context is unavailable");
  return context;
}

function squareCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

// Свет поверх прозрачного канваса: цвет прибавляется к фону страницы, а альфа не растёт.
// С обычным аддитивным смешением стекло делало канвас непрозрачным и закрывало CSS-подсветку
function addLightBlending<T extends Material>(material: T): T {
  material.blending = CustomBlending;
  material.blendSrc = SrcAlphaFactor;
  material.blendDst = OneFactor;
  material.blendSrcAlpha = ZeroFactor;
  material.blendDstAlpha = OneFactor;
  return material;
}

// На тёмном фоне у стекла видны только блики и отражения, как у настоящей трубы ночью
function glassMaterial(side: Side, envMapIntensity: number): MeshPhysicalMaterial {
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
    new Mesh(geometry, glassMaterial(BackSide, 0.45)),
    new Mesh(geometry, glassMaterial(FrontSide, 1.2)),
    createClamps(),
  );
  return tube;
}

function createGlowTexture(): CanvasTexture {
  const canvas = squareCanvas(GLOW_PIXELS);
  const context = context2d(canvas);
  const half = GLOW_PIXELS / 2;
  const gradient = context.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.32)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, GLOW_PIXELS, GLOW_PIXELS);
  return new CanvasTexture(canvas);
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
  const texture = new CanvasTexture(squareCanvas(TAG_PIXELS));
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
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
  context.font = `500 34px ${TAG_FONT}`;
  context.fillText(TAG_SERIAL, 0, -46);
  context.font = `500 74px ${TAG_FONT}`;
  context.fillText(time, 0, 24);
  context.restore();
  texture.needsUpdate = true;
}

function createCapsuleBody(tagTexture: CanvasTexture): Mesh[] {
  const shell = new Mesh(
    new CapsuleGeometry(CAPSULE_RADIUS, CAPSULE_BODY, 12, 48),
    new MeshStandardMaterial({ color: COLOR_CAP_STEEL, metalness: 1, roughness: 0.3 }),
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
