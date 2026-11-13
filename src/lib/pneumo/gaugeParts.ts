import {
  BoxGeometry,
  type CanvasTexture,
  CircleGeometry,
  CylinderGeometry,
  FrontSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
} from "three";

import { COLOR_BRASS, COLOR_INK, COLOR_PAPER, COLOR_STEEL_DARK, FONT_MONO } from "./palette";
import { context2d, createCanvasTexture, createGlassMaterial } from "./stage";

// Шкала на 270°: ноль внизу слева, максимум внизу справа (углы — от оси X против часовой)
export const DIAL_START = (5 * Math.PI) / 4;
export const DIAL_SWEEP = (3 * Math.PI) / 2;

export const GAUGE_RADIUS = 1.05;
const FACE_RADIUS = 0.94;
const BEZEL_RADIUS = 0.98;
const BEZEL_TUBE = 0.07;
const CASE_RADIUS = 1.04;
const CASE_DEPTH = 0.3;
const DOME_SPHERE_RADIUS = 3;
const DOME_TOP = 0.2;
const DOME_ROUGHNESS = 0.35;
const STEM_RADIUS = 0.11;
const STEM_LENGTH = 3;

const FACE_PIXELS = 512;
// Приглушает бумагу циферблата: под ключевым светом чистый тон пересвечивается в белый
const FACE_TINT = 0xc9c4b6;
const TICK_COUNT = 50;
const MAJOR_TICK_EVERY = 10;
const LABEL_RADIUS = 0.53;
const UNIT_OFFSET = 0.68;

function brassMaterial(): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: COLOR_BRASS, metalness: 1, roughness: 0.25 });
}

function createCase(): Mesh {
  const body = new Mesh(
    new CylinderGeometry(CASE_RADIUS, CASE_RADIUS, CASE_DEPTH, 64),
    new MeshStandardMaterial({ color: COLOR_STEEL_DARK, metalness: 0.8, roughness: 0.4 }),
  );
  body.rotation.x = Math.PI / 2;
  body.position.z = -CASE_DEPTH / 2;
  return body;
}

function createFace(texture: CanvasTexture): Mesh {
  const face = new Mesh(
    new CircleGeometry(FACE_RADIUS, 96),
    new MeshStandardMaterial({ map: texture, color: FACE_TINT, roughness: 0.9 }),
  );
  face.position.z = 0.001;
  return face;
}

function createBezel(): Mesh {
  const bezel = new Mesh(new TorusGeometry(BEZEL_RADIUS, BEZEL_TUBE, 24, 96), brassMaterial());
  bezel.position.z = 0.03;
  return bezel;
}

// Выпуклое стекло — шапка большой сферы, развёрнутая к камере.
// Шероховатость размывает отражение световых панелей в мягкий блик вместо белого прямоугольника
function createDome(): Mesh {
  const capAngle = Math.asin(FACE_RADIUS / DOME_SPHERE_RADIUS);
  const glass = createGlassMaterial(FrontSide, 0.6);
  glass.roughness = DOME_ROUGHNESS;
  const dome = new Mesh(
    new SphereGeometry(DOME_SPHERE_RADIUS, 64, 8, 0, Math.PI * 2, 0, capAngle),
    glass,
  );
  dome.rotation.x = Math.PI / 2;
  dome.position.z = DOME_TOP - DOME_SPHERE_RADIUS;
  return dome;
}

// Подводящая труба уходит за нижний край кадра: манометр стоит на той же линии, что и капсула
function createStem(): Group {
  const pipe = new Mesh(new CylinderGeometry(STEM_RADIUS, STEM_RADIUS, STEM_LENGTH, 32), brassMaterial());
  pipe.position.y = -(CASE_RADIUS + STEM_LENGTH / 2);
  const nut = new Mesh(new CylinderGeometry(0.18, 0.18, 0.16, 6), brassMaterial());
  nut.position.y = -(CASE_RADIUS + 0.08);
  const stem = new Group();
  stem.add(pipe, nut);
  stem.position.z = -CASE_DEPTH / 2;
  return stem;
}

function createNeedle(): Group {
  const material = new MeshStandardMaterial({ color: COLOR_INK, metalness: 0.4, roughness: 0.4 });
  const blade = new Mesh(new BoxGeometry(0.035, 0.8, 0.012), material);
  blade.position.y = 0.3;
  const tail = new Mesh(new BoxGeometry(0.08, 0.18, 0.012), material);
  tail.position.y = -0.12;
  const hub = new Mesh(new CylinderGeometry(0.065, 0.065, 0.05, 32), brassMaterial());
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 0.02;

  const needle = new Group();
  needle.add(blade, tail, hub);
  needle.position.z = 0.03;
  return needle;
}

export type Gauge = { group: Group; needle: Group };

export function createGauge(faceTexture: CanvasTexture): Gauge {
  const needle = createNeedle();
  const group = new Group();
  group.add(createCase(), createFace(faceTexture), createBezel(), createDome(), createStem(), needle);
  return { group, needle };
}

export function createFaceTexture(): CanvasTexture {
  return createCanvasTexture(FACE_PIXELS);
}

function pointOnDial(fraction: number, radius: number): [number, number] {
  const center = FACE_PIXELS / 2;
  const angle = DIAL_START - fraction * DIAL_SWEEP;
  return [center + radius * center * Math.cos(angle), center - radius * center * Math.sin(angle)];
}

function paintTicks(context: CanvasRenderingContext2D): void {
  context.strokeStyle = COLOR_INK;
  context.lineCap = "round";
  for (let index = 0; index <= TICK_COUNT; index += 1) {
    const isMajor = index % MAJOR_TICK_EVERY === 0;
    const fraction = index / TICK_COUNT;
    context.lineWidth = isMajor ? 6 : 2;
    context.beginPath();
    context.moveTo(...pointOnDial(fraction, 0.86));
    context.lineTo(...pointOnDial(fraction, isMajor ? 0.72 : 0.79));
    context.stroke();
  }
}

function paintLabels(context: CanvasRenderingContext2D, scaleMax: number, formatTick: (value: number) => string): void {
  const majorCount = TICK_COUNT / MAJOR_TICK_EVERY;
  context.fillStyle = COLOR_INK;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `600 46px ${FONT_MONO}`;
  for (let index = 0; index <= majorCount; index += 1) {
    const fraction = index / majorCount;
    context.fillText(formatTick(scaleMax * fraction), ...pointOnDial(fraction, LABEL_RADIUS));
  }
}

// Циферблат перерисовывается, только когда меняется предел шкалы
export function paintFace(
  texture: CanvasTexture,
  scaleMax: number,
  formatTick: (value: number) => string,
  unit: string,
): void {
  const context = context2d(texture.image as HTMLCanvasElement);
  const center = FACE_PIXELS / 2;

  context.fillStyle = COLOR_PAPER;
  context.fillRect(0, 0, FACE_PIXELS, FACE_PIXELS);
  paintTicks(context);
  paintLabels(context, scaleMax, formatTick);
  context.font = `500 28px ${FONT_MONO}`;
  context.fillText(unit, center, center + center * UNIT_OFFSET);
  texture.needsUpdate = true;
}
