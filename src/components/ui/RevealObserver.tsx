"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = "[data-reveal]";
const REVEALED_ATTRIBUTE = "data-revealed";
const READY_ATTRIBUTE = "data-reveal-ready";
const VIEWPORT_MARGIN = "0px 0px -10% 0px";

export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute(REVEALED_ATTRIBUTE, "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: VIEWPORT_MARGIN },
    );

    document
      .querySelectorAll(`${REVEAL_SELECTOR}:not([${REVEALED_ATTRIBUTE}])`)
      .forEach((element) => observer.observe(element));
    document.documentElement.setAttribute(READY_ATTRIBUTE, "");

    return () => observer.disconnect();
  }, []);

  return null;
}
