"use client";

import type { MouseEvent } from "react";

import { VIEW_MODE_3D, VIEW_MODE_CLASSIC, type ViewMode } from "@/constants/viewMode";
import { classNames } from "@/lib/classNames";
import { revealChange } from "@/lib/circleReveal";
import { loadPneumoScene } from "@/lib/pneumo/load";
import { applyViewMode, useViewMode } from "@/lib/viewMode";

import styles from "./ViewModeSwitch.module.scss";
import styles3d from "./ViewModeSwitch.3d.module.scss";

type ViewModeSwitchProps = {
  label: string;
  classicLabel: string;
  sceneLabel: string;
  className?: string;
};

// Наведение на «3D» заранее подгружает three.js, чтобы сцена появилась сразу после клика
function preloadScene(): void {
  void loadPneumoScene();
}

export function ViewModeSwitch({ label, classicLabel, sceneLabel, className }: ViewModeSwitchProps) {
  const mode = useViewMode();
  const options = [
    { mode: VIEW_MODE_CLASSIC, text: classicLabel },
    { mode: VIEW_MODE_3D, text: sceneLabel },
  ] as const;

  function choose(event: MouseEvent<HTMLButtonElement>, next: ViewMode) {
    if (next === mode) return;
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    revealChange({ x: left + width / 2, y: top + height / 2 }, () => applyViewMode(next));
  }

  return (
    <div role="group" aria-label={label} className={classNames(styles.switch, styles3d.switch, className)}>
      {options.map((option) => (
        <button
          key={option.mode}
          type="button"
          className={classNames(styles.option, styles3d.option)}
          aria-pressed={option.mode === mode}
          onClick={(event) => choose(event, option.mode)}
          onPointerEnter={option.mode === VIEW_MODE_3D ? preloadScene : undefined}
          onFocus={option.mode === VIEW_MODE_3D ? preloadScene : undefined}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}
