"use client";

import { useEffect, useRef } from "react";

import canvasStyles from "@/components/ui/SceneCanvas.module.scss";
import { VIEW_MODE_3D } from "@/constants/viewMode";
import { classNames } from "@/lib/classNames";
import { prefersReducedMotion } from "@/lib/motion";
import { loadPneumoScene } from "@/lib/pneumo/load";
import { mountLazyScene } from "@/lib/pneumo/mountLazyScene";
import type { PneumoScene } from "@/lib/pneumo/scene";
import { useViewMode } from "@/lib/viewMode";

import styles from "./PneumoTube.module.scss";

type PneumoTubeProps = {
  tagTime: string;
  className?: string;
};

function scrollProgress(section: HTMLElement): number {
  const { top, height } = section.getBoundingClientRect();
  return Math.min(Math.max(-top / height, 0), 1);
}

function followScroll(scene: PneumoScene, section: HTMLElement): () => void {
  const syncProgress = () => scene.setProgress(scrollProgress(section));
  window.addEventListener("scroll", syncProgress, { passive: true });
  syncProgress();
  return () => window.removeEventListener("scroll", syncProgress);
}

// Сцена создаётся только в 3D-режиме: в обычном three.js даже не загружается
export function PneumoTube({ tagTime, className }: PneumoTubeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isActive = useViewMode() === VIEW_MODE_3D;

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    if (!isActive || !canvas || !section) return;

    return mountLazyScene(
      canvas,
      async () => {
        const { createPneumoScene } = await loadPneumoScene();
        return createPneumoScene(canvas, { tagTime, isStatic: prefersReducedMotion() });
      },
      (scene) => followScroll(scene, section),
    );
  }, [isActive, tagTime]);

  return (
    <div className={classNames(styles.slot, className)} aria-hidden="true">
      <canvas ref={canvasRef} className={canvasStyles.canvas} />
    </div>
  );
}
