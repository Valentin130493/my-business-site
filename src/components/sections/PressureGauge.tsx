"use client";

import { useEffect, useRef } from "react";

import canvasStyles from "@/components/ui/SceneCanvas.module.scss";
import { VIEW_MODE_3D } from "@/constants/viewMode";
import { classNames } from "@/lib/classNames";
import { prefersReducedMotion } from "@/lib/motion";
import type { GaugeScene } from "@/lib/pneumo/gauge";
import { loadGaugeScene } from "@/lib/pneumo/load";
import { mountLazyScene } from "@/lib/pneumo/mountLazyScene";
import { useViewMode } from "@/lib/viewMode";

import styles from "./PressureGauge.module.scss";

type PressureGaugeProps = {
  value: number;
  locale: string;
  unit: string;
  className?: string;
};

// Деления подписаны в тысячах, как на настоящем манометре: «1,2» короче и читается лучше, чем «1 200 €»
const SCALE_DIVISOR = 1000;

// Манометр калькулятора в 3D-режиме. Само число — в тексте рядом, сцена его только иллюстрирует
export function PressureGauge({ value, locale, unit, className }: PressureGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<GaugeScene | null>(null);
  const valueRef = useRef(value);
  const isActive = useViewMode() === VIEW_MODE_3D;

  useEffect(() => {
    valueRef.current = value;
    sceneRef.current?.setValue(value);
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isActive || !canvas) return;
    const tickFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

    return mountLazyScene(
      canvas,
      async () => {
        const { createGaugeScene } = await loadGaugeScene();
        return createGaugeScene(canvas, {
          isStatic: prefersReducedMotion(),
          unit: `×${SCALE_DIVISOR} ${unit}`,
          formatTick: (tick) => tickFormat.format(tick / SCALE_DIVISOR),
        });
      },
      (scene) => {
        sceneRef.current = scene;
        scene.setValue(valueRef.current);
        return () => {
          sceneRef.current = null;
        };
      },
    );
  }, [isActive, locale, unit]);

  return (
    <div className={classNames(styles.slot, className)} aria-hidden="true">
      <canvas ref={canvasRef} className={canvasStyles.canvas} />
    </div>
  );
}
