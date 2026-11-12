import type { CSSProperties } from "react";

const MAX_STAGGER_INDEX = 5;

export function revealProps(index = 0) {
  return {
    "data-reveal": "",
    style: { "--reveal-index": Math.min(index, MAX_STAGGER_INDEX) } as CSSProperties,
  };
}
