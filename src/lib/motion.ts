import { REDUCED_MOTION_QUERY } from "@/constants/motion";

export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
