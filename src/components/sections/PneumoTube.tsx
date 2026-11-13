"use client";

import { useEffect, useRef } from "react";

import { REDUCED_MOTION_QUERY } from "@/constants/motion";
import { VIEW_MODE_3D } from "@/constants/viewMode";
import { classNames } from "@/lib/classNames";
import { loadPneumoScene } from "@/lib/pneumo/load";
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

function mountScene(canvas: HTMLCanvasElement, section: HTMLElement, tagTime: string): () => void {
  let scene: PneumoScene | null = null;
  let isCancelled = false;
  const syncProgress = () => scene?.setProgress(scrollProgress(section));
  const resizeObserver = new ResizeObserver(([entry]) => {
    scene?.resize(entry.contentRect.width, entry.contentRect.height);
  });

  loadPneumoScene().then(({ createPneumoScene }) => {
    if (isCancelled) return;
    const isStatic = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    scene = createPneumoScene(canvas, { tagTime, isStatic });
    if (!scene) return;
    resizeObserver.observe(canvas);
    window.addEventListener("scroll", syncProgress, { passive: true });
    syncProgress();
    canvas.dataset.ready = "";
  });

  return () => {
    isCancelled = true;
    resizeObserver.disconnect();
    window.removeEventListener("scroll", syncProgress);
    scene?.dispose();
    delete canvas.dataset.ready;
  };
}

// Сцена создаётся только в 3D-режиме: в обычном three.js даже не загружается
export function PneumoTube({ tagTime, className }: PneumoTubeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isActive = useViewMode() === VIEW_MODE_3D;

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    if (!isActive || !canvas || !section) return;
    return mountScene(canvas, section, tagTime);
  }, [isActive, tagTime]);

  return (
    <div className={classNames(styles.slot, className)} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
